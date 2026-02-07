// public/new-estagiario.js
import { getToken, hasRole, getCurrentUser, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {
    // 1. Authentication Check
    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('newEstagioForm');
    const roleIsAluno = hasRole('aluno');
    const currentUserId = getCurrentUser().entidade_id;

    // 2. Initial Data Load (Dropdowns)
    async function loadInitialData() {
        try {
            // Fetch everything in parallel for speed
            const [alunoRes, instRes, docRes, turmaRes, configRes] = await Promise.all([
                authenticatedFetch('/alunos'),
                authenticatedFetch('/estagios'),
                authenticatedFetch('/docentes'),
                authenticatedFetch('/turmaestagios'),
                authenticatedFetch('/configuracoes')
            ]);

            // Alunos
            if (alunoRes.ok) {
                const alunos = await alunoRes.json();
                const select = document.getElementById('aluno_id');
                alunos.forEach(aluno => {
                    const option = new Option(`${aluno.registro} - ${aluno.nome}`, aluno.id);
                    if (roleIsAluno && aluno.id === currentUserId) option.selected = true;
                    select.add(option);
                });
            }

            // Instituicoes
            if (instRes.ok) {
                const instituicoes = await instRes.json();
                const select = document.getElementById('instituicao_id');
                instituicoes.forEach(inst => select.add(new Option(inst.instituicao, inst.id)));
            }

            // Professores
            if (docRes.ok) {
                const docentes = await docRes.json();
                const select = document.getElementById('professor_id');
                docentes.forEach(doc => select.add(new Option(doc.nome, doc.id)));
            }

            // Turmas
            if (turmaRes.ok) {
                const turmas = await turmaRes.json();
                const select = document.getElementById('turmaestagio_id');
                turmas.forEach(turma => select.add(new Option(turma.area, turma.id)));
            }

            // Default Period
            if (configRes.ok) {
                const configs = await configRes.json();
                if (configs.length > 0) {
                    document.getElementById('periodo').value = configs[0].termo_compromisso_periodo || '';
                }
            }

            // If user is Aluno, trigger their history load immediately
            if (roleIsAluno) {
                triggerStudentHistory(currentUserId);
            }

        } catch (error) {
            console.error('Error loading initial data:', error);
            alert('Erro ao carregar dados iniciais');
        }
    }

    // 3. Helper: Load Supervisors based on Institution
    async function loadSupervisores(instituicaoId, targetId = null) {
        if (!instituicaoId) return;
        try {
            const res = await authenticatedFetch(`/estagios/${instituicaoId}/supervisores`);
            if (res.ok) {
                const supervisores = await res.json();
                const select = document.getElementById('supervisor_id');
                select.innerHTML = '<option value="">Selecione um supervisor</option>';
                supervisores.forEach(sup => {
                    const option = new Option(sup.nome, sup.id);
                    if (targetId && sup.id == targetId) option.selected = true;
                    select.add(option);
                });
            }
        } catch (error) {
            console.error('Error loading supervisores:', error);
        }
    }

    // 4. Helper: Trigger Student History and Auto-fill
    async function triggerStudentHistory(alunoId) {
        if (!alunoId) return;
        try {
            // First get next level info (this is the most important for level/ajuste)
            const nextLevelRes = await authenticatedFetch(`/estagiarios/${alunoId}/next-nivel`);
            if (nextLevelRes.ok) {
                const data = await nextLevelRes.json();

                // Set suggested values
                document.getElementById('nivel').value = data.next_nivel;
                document.getElementById('ajuste2020').value = data.ajuste2020 || 0;

                if (data.instituicao_id) document.getElementById('instituicao_id').value = data.instituicao_id;
                if (data.professor_id) document.getElementById('professor_id').value = data.professor_id;
                if (data.turmaestagio_id) document.getElementById('turmaestagio_id').value = data.turmaestagio_id;

                // Trigger supervisor load for this institution
                if (data.instituicao_id) {
                    loadSupervisores(data.instituicao_id, data.supervisor_id);
                }
            }

            // Also get basic aluno info for the turno
            const alunoRes = await authenticatedFetch(`/alunos/${alunoId}`);
            if (alunoRes.ok) {
                const aluno = await alunoRes.json();
                if (aluno.turno) {
                    document.getElementById('turno').value = aluno.turno.charAt(0).toUpperCase();
                } else if (!document.getElementById('turno').value) {
                    document.getElementById('turno').value = 'A';
                }
            }
        } catch (error) {
            console.error('Error loading student history:', error);
        }
    }

    // 5. Event Listeners
    document.getElementById('aluno_id').addEventListener('change', (e) => triggerStudentHistory(e.target.value));

    document.getElementById('instituicao_id').addEventListener('change', (e) => {
        loadSupervisores(e.target.value);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const estagiario = {
            aluno_id: document.getElementById('aluno_id').value,
            professor_id: document.getElementById('professor_id').value,
            supervisor_id: document.getElementById('supervisor_id').value || null,
            instituicao_id: document.getElementById('instituicao_id').value,
            turmaestagio_id: document.getElementById('turmaestagio_id').value || null,
            periodo: document.getElementById('periodo').value,
            turno: document.getElementById('turno').value || 'A',
            nivel: document.getElementById('nivel').value,
            ajuste2020: document.getElementById('ajuste2020').value || 0,
            observacoes: document.getElementById('observacoes').value || null
        };

        try {
            const response = await authenticatedFetch('/estagiarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(estagiario)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create');
            }

            const result = await response.json();
            window.location.href = `view-estagiario.html?id=${result.id}`;
        } catch (error) {
            console.error('Error submitting form:', error);
            alert(`Erro ao salvar: ${error.message}`);
        }
    });

    // 6. Run Initialization
    loadInitialData();
});
