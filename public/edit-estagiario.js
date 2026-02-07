import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    // 1. Authentication Check
    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('editEstagioForm');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID do estagiário não fornecido');
        window.location.href = 'estagiarios.html';
        return;
    }

    document.getElementById('estagiario_id').value = id;

    // 2. Helper: Load Supervisors based on Institution
    async function loadSupervisores(instituicaoId, targetId = null) {
        if (!instituicaoId) {
            document.getElementById('supervisor_id').innerHTML = '<option value="">Selecione um supervisor</option>';
            return;
        }
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

    // 3. Initial Data Load (Dropdowns)
    async function loadInitialData() {
        try {
            // Fetch dropdown options in parallel
            const [alunoRes, instRes, docRes, turmaRes] = await Promise.all([
                authenticatedFetch('/alunos'),
                authenticatedFetch('/estagios'),
                authenticatedFetch('/docentes'),
                authenticatedFetch('/turmaestagios')
            ]);

            // Alunos
            if (alunoRes.ok) {
                const alunos = await alunoRes.json();
                const select = document.getElementById('aluno_id');
                alunos.forEach(aluno => {
                    select.add(new Option(`${aluno.registro} - ${aluno.nome}`, aluno.id));
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

            // After dropdowns are ready, load the specific estagiario data
            await loadEstagiarioData();

        } catch (error) {
            console.error('Error loading initial data:', error);
            alert('Erro ao carregar dados iniciais');
        }
    }

    // 4. Load Specific Estagiario Data
    async function loadEstagiarioData() {
        try {
            const [estagiarioRes, configRes] = await Promise.all([
                authenticatedFetch(`/estagiarios/${id}`),
                authenticatedFetch('/configuracoes')
            ]);

            if (!estagiarioRes.ok) throw new Error('Failed to fetch estagiario');

            const estagiario = await estagiarioRes.json();

            // Populate Fields
            document.getElementById('aluno_id').value = estagiario.aluno_id;
            document.getElementById('professor_id').value = estagiario.professor_id || '';
            document.getElementById('instituicao_id').value = estagiario.instituicao_id;
            document.getElementById('turmaestagio_id').value = estagiario.turmaestagio_id || '';
            document.getElementById('periodo').value = estagiario.periodo;
            document.getElementById('nivel').value = estagiario.nivel;
            document.getElementById('turno').value = estagiario.turno || 'A';
            document.getElementById('ajuste2020').value = estagiario.ajuste2020 || 0;
            document.getElementById('observacoes').value = estagiario.observacoes || '';

            // Load supervisors for the selected institution and select the correct one
            if (estagiario.instituicao_id) {
                await loadSupervisores(estagiario.instituicao_id, estagiario.supervisor_id);
            }

            // Check Period/Level Consistency (Logic from original edit-estagiario.js)
            if (configRes.ok) {
                const configuracoes = await configRes.json();
                if (configuracoes.length > 0) {
                    const currentPeriod = configuracoes[0].termo_compromisso_periodo;
                    const containerperiodo = document.getElementById('menssagem_periodo');
                    const containernivel = document.getElementById('menssagem_nivel');

                    if (currentPeriod !== estagiario.periodo) {
                        containerperiodo.innerHTML = `<div id="menssagem_periodo_alert" class="alert alert-warning">
                            O período do estagiário (${estagiario.periodo}) não corresponde ao período atual do termo de compromisso ${currentPeriod}.
                        </div>`;
                        
                        containernivel.innerHTML = `<div id="menssagem_nivel_alert" class="alert alert-warning">
                            O nível do estagiário (${estagiario.nivel}) corresponde ao período ${estagiario.periodo}. O período atual do termo de compromisso é ${currentPeriod}.
                        </div>`;
                    } else {
                        containerperiodo.innerHTML = '';
                        containernivel.innerHTML = '';
                    }
                }
            }

        } catch (error) {
            console.error('Error loading estagiario data:', error);
            alert(`Erro ao carregar dados do estagiário: ${error.message}`);
            window.location.href = 'estagiarios.html';
        }
    }

    // 5. Event Listeners
    document.getElementById('instituicao_id').addEventListener('change', (e) => {
        loadSupervisores(e.target.value);
    });

    // 6. Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const estagiario = {
            aluno_id: document.getElementById('aluno_id').value,
            professor_id: document.getElementById('professor_id').value || null,
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
            const response = await authenticatedFetch(`/estagiarios/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(estagiario)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update estagiario');
            }

            // Redirect to view page on success
            window.location.href = `view-estagiario.html?id=${id}`;
        } catch (error) {
            console.error('Error updating estagiario:', error);
            alert(`Erro ao atualizar registro: ${error.message}`);
        }
    });

    // 7. Start Initialization
    loadInitialData();
});
