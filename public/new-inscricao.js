$(document).ready(async function () {
    const form = document.getElementById('newInscricaoForm');

    // Get muralestagio_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const muralEstagioId = urlParams.get('muralestagio_id');
    const alunoId = urlParams.get('aluno_id');
    // console.log('muralestagio_id:', muralEstagioId);

    // Set today's date as default
    const today = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
    console.log('today:', today);
    document.getElementById('data').value = today;

    // Load alunos for the dropdown
    try {
        const response = await fetch('/alunos');
        const alunos = await response.json();
        const select = document.getElementById('aluno_id');

        alunos.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = `${aluno.registro} - ${aluno.nome}`;
            if (aluno.id == alunoId) {
                option.selected = true;
                document.getElementById('registro').value = aluno.registro;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading alunos:', error);
    }

    // Load muralestagios for the dropdown
    try {
        const response = await fetch('/mural');
        const muralestagios = await response.json();
        const select = document.getElementById('muralestagio_id');

        muralestagios.forEach(muralestagio => {
            // console.log('muralestagio:', muralestagio);
            const option = document.createElement('option');
            option.value = muralestagio.id;
            option.textContent = `${muralestagio.periodo} - ${muralestagio.instituicao}`;
            if (muralestagio.id == muralEstagioId) {
                option.selected = true;
                document.getElementById('periodo').value = muralestagio.periodo;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading muralestagios:', error);
    }

    // Auto-populate registro when aluno is selected
    document.getElementById('aluno_id').addEventListener('change', async function () {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            const response = await fetch(`/alunos/${selectedOption.value}`);
            if (!response.ok) {
                console.error('Error loading aluno:', response);
                return;
            }
            const data = await response.json();
            const registro = data.registro;
            document.getElementById('registro').value = registro;
        }
    });

    // Auto-populate periodo when muralestagio is selected
    document.getElementById('muralestagio_id').addEventListener('change', async function () {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.value) {
            const response = await fetch(`/mural/${selectedOption.value}`);
            if (!response.ok) {
                console.error('Error loading muralestagio:', response);
                return;
            }
            const data = await response.json();
            console.log('data:', data);
            const periodo = data.periodo;
            document.getElementById('periodo').value = periodo;
        }
    });

    // Submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inscricao = {
            aluno_id: document.getElementById('aluno_id').value,
            muralestagio_id: document.getElementById('muralestagio_id').value,
            periodo: document.getElementById('periodo').value,
            data: document.getElementById('data').value,
            registro: document.getElementById('registro').value
        };

        // Check if aluno_id has already make an inscricao for this muralestagio_id
        try {
            const response = await fetch(`/inscricoes/${inscricao.aluno_id}/${inscricao.muralestagio_id}`);
            if (!response.ok) {
                throw new Error('Erro ao verificar inscricao');
            }
            const inscricoes = await response.json();
            if (inscricoes.length > 0) {
                alert('Aluno já inscrito nesta vaga para este período');
                window.location.href = `view-inscricao.html?id=${inscricoes.id}`;
                return;
            }
        } catch (error) {
            console.error('Error checking inscricao:', error);
            alert(error.message);
            return;
        }

        try {
            const response = await fetch('/inscricoes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inscricao)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create inscricao');
            }

            const result = await response.json();
            const newId = result.id;

            // Redirect to view page with the new ID
            window.location.href = `view-inscricao.html?id=${newId}`;
        } catch (error) {
            console.error('Error creating inscricao:', error);
            alert(`Erro ao criar inscrição: ${error.message}`);
        }
    });
});
