$(document).ready(async function () {
    const form = document.getElementById('newInscricaoForm');
    
    // Get muralestagio_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const muralEstagioId = urlParams.get('muralestagio_id');

    if (muralEstagioId) {
        document.getElementById('muralestagio_id').value = muralEstagioId;
        
        // Load mural data to display instituicao and periodo
        try {
            const response = await fetch(`/mural/${muralEstagioId}`);
            if (response.ok) {
                const mural = await response.json();
                document.getElementById('instituicao').value = mural.instituicao;
                document.getElementById('periodo').value = mural.periodo;
            }
        } catch (error) {
            console.error('Error loading mural data:', error);
        }
    }

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;

    // Load alunos for the dropdown
    try {
        const response = await fetch('/alunos');
        const alunos = await response.json();
        const select = document.getElementById('aluno_id');
        
        alunos.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = `${aluno.nome} (${aluno.email})`;
            option.dataset.registro = aluno.registro; // Store registro in data attribute
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading alunos:', error);
    }

    // Auto-populate registro when aluno is selected
    document.getElementById('aluno_id').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.dataset.registro) {
            document.getElementById('registro').value = selectedOption.dataset.registro;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const inscricao = {
            aluno_id: document.getElementById('aluno_id').value,
            muralestagio_id: document.getElementById('muralestagio_id').value,
            periodo: document.getElementById('periodo').value,
            data: document.getElementById('data').value,
            registro: document.getElementById('registro').value || 0
        };

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
