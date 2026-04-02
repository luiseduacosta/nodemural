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

    // 2.1. Load Complementos
    async function loadComplementos(targetId = null) {
        try {
            const res = await authenticatedFetch('/complementos');
            if (res.ok) {
                const complementos = await res.json();
                const select = document.getElementById('complemento_id');
                select.innerHTML = '<option value="">Selecione modalidade de estágio</option>';
                complementos.forEach(comp => {
                    const option = new Option(comp.periodo_especial, comp.id);
                    if (targetId && comp.id == targetId) option.selected = true;
                    select.add(option);
                });
            }
        } catch (error) {
            console.error('Error loading complementos:', error);
        }
    }

    // 2.2. Turnos 
    async function loadTurnos(targetId = null) {
        try {
            const res = await authenticatedFetch('/turnos');
            if (res.ok) {
                const turnos = await res.json();
                const select = document.getElementById('turno_id');
                select.innerHTML = '<option value="">Selecione um turno</option>';
                turnos.forEach(turno => {
                    const option = new Option(turno.turno, turno.id);
                    if (targetId && turno.id == targetId) option.selected = true;
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
            // Fetch dropdown options in parallel
            const [alunoRes, instRes, docRes] = await Promise.all([
                authenticatedFetch('/alunos'),
                authenticatedFetch('/instituicoes'),
                authenticatedFetch('/professores'),
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
                const professores = await docRes.json();
                const select = document.getElementById('professor_id');
                professores.forEach(doc => select.add(new Option(doc.nome, doc.id)));
            }

            await loadTurnos();
            await loadComplementos();

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
            document.getElementById('instituicao_id').value = estagiario.instituicao_id || '';
            document.getElementById('periodo').value = estagiario.periodo;
            document.getElementById('nivel').value = estagiario.nivel;
            document.getElementById('ajuste2020').value = estagiario.ajuste2020 || 0;
            document.getElementById('turno_id').value = estagiario.turno_id || '';            
            document.getElementById('tc').checked = String(estagiario.tc) === '1' || estagiario.tc === true;
            // Format date to yyyy-MM-dd for HTML date input
            if (estagiario.tc_solicitacao) {
                const date = new Date(estagiario.tc_solicitacao);
                const formattedDate = date.toISOString().split('T')[0]; // Extracts yyyy-MM-dd
                document.getElementById('tc_solicitacao').value = formattedDate;
            } else {
                document.getElementById('tc_solicitacao').value = '';
            }
            document.getElementById('complemento_id').value = estagiario.complemento_id || '';
            document.getElementById('benetransporte').checked = String(estagiario.benetransporte) === '1' || estagiario.benetransporte === true;
            document.getElementById('benealimentacao').checked = String(estagiario.benealimentacao) === '1' || estagiario.benealimentacao === true;
            document.getElementById('benebolsa').value = estagiario.benebolsa || '';
            document.getElementById('observacoes').value = estagiario.observacoes || '';

            // Load supervisors for the selected institution and select the correct one
            if (estagiario.instituicao_id) {
                await loadSupervisores(estagiario.instituicao_id, estagiario.supervisor_id);
            }

            // Check Period/Level Consistency (Logic from original edit-estagiario.js)
            if (configRes.ok) {
                const configuracoes = await configRes.json();
                if (configuracoes) {
                    const currentPeriod = configuracoes.termo_compromisso_periodo;
                    const containerperiodo = document.getElementById('menssagem_periodo');
                    const containernivel = document.getElementById('menssagem_nivel');

                    // Compare periods
                    if (currentPeriod < estagiario.periodo) {
                        // ERROR: Future period - should not edit
                        containerperiodo.innerHTML = `<div class="alert alert-danger">
                            <strong>ERRO:</strong> Este estagiário está em um período futuro (${estagiario.periodo}). 
                            O período atual do termo de compromisso é ${currentPeriod}. 
                            Não é possível editar estagiários de períodos futuros.
                        </div>`;

                        // Disable form submission
                        document.querySelector('button[type="submit"]').disabled = true;
                        document.querySelector('button[type="submit"]').classList.add('disabled');

                    } else if (currentPeriod > estagiario.periodo) {
                        // WARNING: Old period - show warning but allow edit
                        containerperiodo.innerHTML = `<div class="alert alert-warning">
                            <strong>ATENÇÃO:</strong> Você está editando um estagiário de período anterior (${estagiario.periodo}). 
                            O período atual do termo de compromisso é ${currentPeriod}. 
                            Esta edição está atualizando dados de um período passado.
                        </div>`;

                        containernivel.innerHTML = `<div class="alert alert-info">
                            O nível do estagiário é ${estagiario.nivel} correspondente ao período ${estagiario.periodo}.
                        </div>`;

                    } else {
                        // CORRECT: Same period - normal edit
                        containerperiodo.innerHTML = `<div class="alert alert-success">
                            Editando estagiário do período atual (${currentPeriod}).
                        </div>`;
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
            periodo: document.getElementById('periodo').value,
            nivel: document.getElementById('nivel').value,
            ajuste2020: document.getElementById('ajuste2020').value || 0,
            turno_id: document.getElementById('turno_id').value || null,
            tc: document.getElementById('tc').checked ? 1 : 0,
            tc_solicitacao: document.getElementById('tc_solicitacao').value || null,
            complemento_id: document.getElementById('complemento_id').value || null,
            benetransporte: document.getElementById('benetransporte').checked ? 1 : 0,
            benealimentacao: document.getElementById('benealimentacao').checked ? 1 : 0,
            benebolsa: String(document.getElementById('benebolsa').value || '').trim() || null,
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
