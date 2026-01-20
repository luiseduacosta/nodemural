$(document).ready(async function () {
    const form = document.getElementById('editEstagioForm');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID do estagiário não fornecido');
        window.location.href = 'estagiarios.html';
        return;
    }

    document.getElementById('estagiario_id').value = id;

    // Load alunos
    try {
        const response = await fetch('/alunos');
        const alunos = await response.json();
        const select = document.getElementById('aluno_id');

        alunos.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = `${aluno.registro || aluno.id} - ${aluno.nome}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading alunos:', error);
    }

    // Load instituicoes
    try {
        const response = await fetch('/estagio');
        const instituicoes = await response.json();
        const select = document.getElementById('instituicao_id');

        instituicoes.forEach(inst => {
            const option = document.createElement('option');
            option.value = inst.id;
            option.textContent = inst.instituicao;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading instituicoes:', error);
    }

    // Load supervisores
    try {
        const response = await fetch('/supervisores');
        const supervisores = await response.json();
        const select = document.getElementById('supervisor_id');

        supervisores.forEach(sup => {
            const option = document.createElement('option');
            option.value = sup.id;
            option.textContent = sup.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading supervisores:', error);
    }

    // Load professores (docentes)
    try {
        const response = await fetch('/docentes');
        const docentes = await response.json();
        const select = document.getElementById('professor_id');

        docentes.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading docentes:', error);
    }

    // Load turmas de estagio
    try {
        const response = await fetch('/turma_estagio');
        if (response.ok) {
            const turmas = await response.json();
            const select = document.getElementById('turmaestagio_id');

            turmas.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.id;
                option.textContent = turma.turma;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading turmas:', error);
    }

    // Load estagiario data
    try {
        const response = await fetch(`/estagiarios/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch estagiario');
        }

        const estagiario = await response.json();

        // Format dates for input type="date" (YYYY-MM-DD)
        const formatDateForInput = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0];
        };

        // Populate form fields
        document.getElementById('aluno_id').value = estagiario.aluno_id || '';
        document.getElementById('professor_id').value = estagiario.professor_id || '';
        document.getElementById('supervisor_id').value = estagiario.supervisor_id || '';
        document.getElementById('instituicao_id').value = estagiario.instituicao_id || '';
        document.getElementById('turmaestagio_id').value = estagiario.turmaestagio_id || '';
        document.getElementById('periodo').value = estagiario.periodo || '';
        document.getElementById('nivel').value = estagiario.nivel || '1';
        document.getElementById('data_inicio').value = formatDateForInput(estagiario.data_inicio);
        document.getElementById('data_fim').value = formatDateForInput(estagiario.data_fim);
        document.getElementById('observacoes').value = estagiario.observacoes || '';

    } catch (error) {
        console.error('Error loading estagiario:', error);
        alert(`Erro ao carregar dados do estagiário: ${error.message}`);
        window.location.href = 'estagiarios.html';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const estagiario = {
            aluno_id: document.getElementById('aluno_id').value,
            professor_id: document.getElementById('professor_id').value,
            supervisor_id: document.getElementById('supervisor_id').value || null,
            instituicao_id: document.getElementById('instituicao_id').value,
            turmaestagio_id: document.getElementById('turmaestagio_id').value || null,
            periodo: document.getElementById('periodo').value,
            nivel: document.getElementById('nivel').value,
            data_inicio: document.getElementById('data_inicio').value || null,
            data_fim: document.getElementById('data_fim').value || null,
            observacoes: document.getElementById('observacoes').value || null
        };

        try {
            const response = await fetch(`/estagiarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(estagiario)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update estagiario');
            }

            window.location.href = `view-estagiario.html?id=${id}`;
        } catch (error) {
            console.error('Error updating estagiario:', error);
            alert(`Erro ao atualizar registro: ${error.message}`);
        }
    });
});
