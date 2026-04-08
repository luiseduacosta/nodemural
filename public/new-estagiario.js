// public/new-estagiario.js
import { getToken, hasRole, getCurrentUser, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {
    // 1. Authentication Check
    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    }

    // Admin and others gets the id from query params, aluno gets their own id
    const urlParams = new URLSearchParams(window.location.search);
    const form = document.getElementById('newEstagioForm');
    const roleIsAluno = hasRole('aluno');
    const currentAlunoId = getCurrentUser().entidade_id;
    const currentUserId = roleIsAluno ? currentAlunoId : urlParams.get('id');

    // 2. Helper: Load Turnos
    async function loadTurnos() {
        try {
            const res = await authenticatedFetch('/turnos');
            if (res.ok) {
                const turnos = await res.json();
                const select = document.getElementById('turno_id');
                select.innerHTML = '<option value="">Selecione um turno</option>';
                turnos.forEach(turno => {
                    const option = new Option(turno.turno, turno.id);
                    select.add(option);
                });
            }
        } catch (error) {
            console.error('Error loading turnos:', error);
        }
    }

    // 3. Initial Data Load (Dropdowns)
    async function loadInitialData() {
        try {
            // Fetch everything in parallel for speed
            const [alunoRes, instRes, docRes, configRes, complementoRes] = await Promise.all([
                authenticatedFetch('/alunos'),
                authenticatedFetch('/instituicoes'),
                authenticatedFetch('/professores'),
                authenticatedFetch('/configuracoes'),
                authenticatedFetch('/complementos')
            ]);

            // Alunos
            if (alunoRes.ok) {
                const alunos = await alunoRes.json();
                const select = document.getElementById('aluno_id');
                alunos.forEach(aluno => {
                    const option = new Option(`${aluno.registro} - ${aluno.nome}`, aluno.id);
                    if (aluno.id == currentUserId) option.selected = true;
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
                const professores = await docRes.json();
                const select = document.getElementById('professor_id');
                professores.forEach(doc => select.add(new Option(doc.nome, doc.id)));
            }

            // Complementos
            if (complementoRes.ok) {
                const complementos = await complementoRes.json();
                const select = document.getElementById('complemento_id');
                complementos.forEach(comp => select.add(new Option(comp.periodo_especial, comp.id)));
            }

            // Load Turnos
            await loadTurnos();

            // Default Period
            if (configRes.ok) {
                const configs = await configRes.json();
                document.getElementById('periodo').value = configs.termo_compromisso_periodo;
            }

            // If user is Aluno, trigger their history load immediately
            if (currentUserId) {
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
            const res = await authenticatedFetch(`/instituicoes/${instituicaoId}/supervisores`);
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

                // Trigger supervisor load for this institution
                if (data.instituicao_id) {
                    loadSupervisores(data.instituicao_id, data.supervisor_id);
                }
            }

            // Note: turno field removed as it's not present in the HTML form
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
        const tcEl = document.getElementById('tc');
        const tcSolicitacaoEl = document.getElementById('tc_solicitacao');
        const beneTransporteEl = document.getElementById('benetransporte');
        const beneAlimentacaoEl = document.getElementById('benealimentacao');
        const beneBolsaEl = document.getElementById('benebolsa');

        const estagiario = {
            aluno_id: document.getElementById('aluno_id').value,
            professor_id: document.getElementById('professor_id').value || null,
            supervisor_id: document.getElementById('supervisor_id').value || null,
            instituicao_id: document.getElementById('instituicao_id').value,
            periodo: document.getElementById('periodo').value,
            nivel: document.getElementById('nivel').value,
            ajuste2020: document.getElementById('ajuste2020').value || 0,
            tc: tcEl?.checked ? 1 : 0,
            // Format date to yyyy-MM-dd for HTML date input consistency
            tc_solicitacao: tcSolicitacaoEl?.value ? tcSolicitacaoEl.value.split('T')[0] : null,
            complemento_id: document.getElementById('complemento_id').value || null,
            benetransporte: beneTransporteEl?.checked ? 1 : 0,
            benealimentacao: beneAlimentacaoEl?.checked ? 1 : 0,
            benebolsa: String(beneBolsaEl?.value || '').trim() || null,
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

