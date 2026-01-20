$(document).ready(async function () {
    const form = document.getElementById('newEstagioForm');

    // Load default periodo from configuracoes
    try {
        const response = await fetch('/configuracoes');
        if (response.ok) {
            const configuracoes = await response.json();
            document.getElementById('periodo').value = configuracoes.termo_compromisso_periodo || '';
        }
    } catch (error) {
        console.error('Error loading default periodo:', error);
    }

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
        alert('Erro ao carregar lista de alunos');
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
        alert('Erro ao carregar lista de instituições');
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
        alert('Erro ao carregar lista de professores');
    }

    // Load turmas de estagio (if the table exists)
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
        // Not critical, turma might be optional
    }

    // Auto-calculate nivel when aluno is selected
    document.getElementById('aluno_id').addEventListener('change', async function () {
        const alunoId = this.value;
        if (!alunoId) return;

        try {
            const response = await fetch(`/alunos/${alunoId}/next-nivel`);
            if (response.ok) {
                const data = await response.json();
                document.getElementById('nivel').value = data.next_nivel;
            }
        } catch (error) {
            console.error('Error calculating next nivel:', error);
        }
    });

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
            const response = await fetch('/estagiarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(estagiario)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create estagiario');
            }

            const result = await response.json();
            window.location.href = `view-estagiario.html?id=${result.id}`;
        } catch (error) {
            console.error('Error creating estagiario:', error);
            alert(`Erro ao criar registro: ${error.message}`);
        }
    });
});
