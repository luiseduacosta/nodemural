// src/controllers/estagiarioController.js
import { getToken, hasRole, getCurrentUser, isAdmin, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    }
    const form = document.getElementById('newEstagioForm');

    // Load default periodo from configuracoes
    try {
        const response = await authenticatedFetch('/configuracoes');
        if (response.ok) {
            const configuracoes = await response.json();
            document.getElementById('periodo').value = configuracoes[0].termo_compromisso_periodo || '';
        }
    } catch (error) {
        console.error('Error loading default periodo:', error);
    }

    // Load alunos
    try {
        const response = await authenticatedFetch('/alunos');
        const alunos = await response.json();
        const select = document.getElementById('aluno_id');

        alunos.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = `${aluno.registro} - ${aluno.nome}`;
            if (hasRole('aluno') && aluno.id === getCurrentUser().entidade_id) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading alunos:', error);
        alert('Erro ao carregar lista de alunos');
    }

    // Last internship (estagio) of the student (aluno)
    try {
        const response = await authenticatedFetch(`/alunos/${getCurrentUser().entidade_id}/estagiarios`);
        if (response.ok) {
            const estagiarios = await response.json();
            if (estagiarios.length > 0) {
                // Get the last estagiario of the list
                const lastEstagiario = estagiarios.at(-1);
                document.getElementById('nivel').value = lastEstagiario.nivel;
                document.getElementById('ajuste2020').value = lastEstagiario.ajuste2020;
                document.getElementById('instituicao_id').value = lastEstagiario.instituicao_id;
                document.getElementById('professor_id').value = lastEstagiario.professor_id;
                document.getElementById('supervisor_id').value = lastEstagiario.supervisor_id;
                document.getElementById('periodo').value = lastEstagiario.periodo;
                document.getElementById('turno').value = lastEstagiario.turno;
                document.getElementById('turmaestagio_id').value = lastEstagiario.turmaestagio_id;
            }
        } else {
            alert('Você não tem estágios cadastrados');
        }
    } catch (error) {
        console.error('Error loading estagiarios:', error);
        alert('Erro ao carregar estagiários');
    }

    // Load instituicoes
    try {
        const response = await authenticatedFetch('/estagios');
        const instituicoes = await response.json();
        const select = document.getElementById('instituicao_id');
        // Selected thi instituicao_id if there is a estagiario
            const responseEstagiario = await authenticatedFetch(`/alunos/${getCurrentUser().entidade_id}/estagiarios`);
            if (responseEstagiario.ok) {
                const estagiarios = await responseEstagiario.json();
                if (estagiarios.length > 0) {
                    const lastEstagiario = estagiarios.at(-1);
                    instituicoes.forEach(inst => {
                        const option = document.createElement('option');
                        option.value = inst.id;
                        option.textContent = inst.instituicao;
                        if (lastEstagiario.instituicao_id === inst.id) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });      
                }
            } else {
                instituicoes.forEach(inst => {
                    const option = document.createElement('option');
                    option.value = inst.id;
                    option.textContent = inst.instituicao;
                    select.appendChild(option);
                });
            }
    } catch (error) {
        console.error('Error loading instituicoes:', error);
        alert('Erro ao carregar lista de instituições');
    }

    // Load supervisores of the instituition
    try {
        const response = await authenticatedFetch(`/estagios/${document.getElementById('instituicao_id').value}/supervisores`);
        const supervisores = await response.json();
        const select = document.getElementById('supervisor_id');

        // Selected the supervisor if there is a estagiario
        const responseSupervisor = await authenticatedFetch(`/alunos/${getCurrentUser().entidade_id}/estagiarios`);
        if (responseSupervisor.ok) {
            const supervisoresDaInstituicao = await responseSupervisor.json();
            if (supervisoresDaInstituicao.length > 0) {
                const lastSupervisor = supervisoresDaInstituicao.at(-1);
                    supervisores.forEach(sup => {
                        const option = document.createElement('option');
                        option.value = sup.id;
                        option.textContent = sup.nome;
                        if (lastSupervisor.supervisor_id === sup.id) {
                            option.selected = true;
                        }
                        select.appendChild(option);
                    });      
                }
            } else {
                supervisores.forEach(sup => {
                    const option = document.createElement('option');
                    option.value = sup.id;
                    option.textContent = sup.nome;
                    select.appendChild(option);
                });
            }
    } catch (error) {
        console.error('Error loading supervisores:', error);
        alert('Erro ao carregar lista de supervisores');
    }

    // Load professores (docentes)
    try {
        const response = await authenticatedFetch('/docentes');
        const professores = await response.json();
        const select = document.getElementById('professor_id');

        // Selected the supervisor if there is a estagiario
        const responseProfessor = await authenticatedFetch(`/alunos/${getCurrentUser().entidade_id}/estagiarios`);
        if (responseProfessor.ok) {
            const professoresDaInstituicao = await responseProfessor.json();
            if (professoresDaInstituicao.length > 0) {
                const lastProfessor = professoresDaInstituicao.at(-1);
                professores.forEach(prof => {
                    const option = document.createElement('option');
                    option.value = prof.id;
                    option.textContent = prof.nome;
                    if (lastProfessor.professor_id === prof.id) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        } else {
        professores.forEach(prof => {
            const option = document.createElement('option');
            option.value = prof.id;
            option.textContent = prof.nome;
            select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading professores:', error);
        alert('Erro ao carregar lista de professores');
    }

    // Load turmasestagio
    try {
        const response = await authenticatedFetch('/turmaestagios');
        const turmaestagio = await response.json();
        const select = document.getElementById('turmaestagio_id');
        
        const responseTurma = await authenticatedFetch(`/alunos/${getCurrentUser().entidade_id}/estagiarios`);
        if (responseTurma.ok) {
            const turmaatual = await responseTurma.json();
            if (turmaatual.length > 0) {
                const lastEstagiario = turmaatual.at(-1);
                turmaestagio.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = turma.id;
                    option.textContent = turma.area;
                    if (lastEstagiario.turmaestagio_id == turma.id) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });
            }
        } else {
            turmaestagio.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma.id;
                option.textContent = turma.area;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading turmasestagio:', error);
        alert('Erro ao carregar lista de turmas de estágio');
    }

    // Auto-calculate nivel when aluno is selected and load professor and supervisor if exists and put the selected value of professor_id, supervisor_id and intituicao_id
    document.getElementById('aluno_id').addEventListener('change', async function () {
        const alunoId = this.value;
        if (!alunoId) return;

        // Load alunos to get the turno of the selected aluno
        try {
            const response = await authenticatedFetch(`/alunos/${alunoId}`);
            if (response.ok) {
                const aluno = await response.json();
                // Get the first letter of the turno and uppercase it. If turno is empty, default to 'A'.
                // Put the value in the default option of the select turno
                if (aluno.turno) {
                    document.getElementById('turno').value = aluno.turno.charAt(0).toUpperCase();
                } else {
                    document.getElementById('turno').value = 'A';
                }
            }
        } catch (error) {
            console.error('Error loading aluno:', error);
            alert('Erro ao carregar aluno');
        }

        try {
            const response = await authenticatedFetch(`/estagiarios/${alunoId}/next-nivel`);
            if (response.ok) {
                const data = await response.json();
                document.getElementById('nivel').value = data.next_nivel;
                document.getElementById('ajuste2020').value = data.ajuste2020;

                // Clear and reload instituicoes
                try {
                    const response = await authenticatedFetch('/estagios');
                    const instituicoes = await response.json();
                    const select = document.getElementById('instituicao_id');
                    select.innerHTML = '<option value="">Selecione uma instituição</option>';

                    instituicoes.forEach(inst => {
                        const option = document.createElement('option');
                        option.value = inst.id;
                        option.textContent = inst.instituicao;
                        option.selected = data.instituicao_id ? inst.id === data.instituicao_id : false;
                        select.appendChild(option);
                    });
                } catch (error) {
                    console.error('Error loading instituicoes:', error);
                    alert('Erro ao carregar lista de instituições');
                }

                // Clear and reload professores
                try {
                    const response = await authenticatedFetch('/docentes');
                    if (response.ok) {
                        const docentes = await response.json();
                        const select = document.getElementById('professor_id');
                        select.innerHTML = '<option value="">Selecione um professor</option>';

                        docentes.forEach(doc => {
                            const option = document.createElement('option');
                            option.value = doc.id;
                            option.textContent = doc.nome;
                            option.selected = data.professor_id ? doc.id === data.professor_id : false;
                            select.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('Error loading docentes:', error);
                }

                // Load supervisores of the default institution or when a instituicao is selected
                const instituicaoId = data.instituicao_id;
                if (instituicaoId) {
                    try {
                        const select = document.getElementById('supervisor_id');
                        select.innerHTML = '<option value="">Selecione um supervisor</option>';
                        const response = await authenticatedFetch(`/estagios/${instituicaoId}/supervisores`);
                        if (response.ok) {
                            const supervisores = await response.json();
                            supervisores.forEach(sup => {
                                const option = document.createElement('option');
                                option.value = sup.id;
                                option.textContent = sup.nome;
                                option.selected = data.supervisor_id ? sup.id === data.supervisor_id : false;
                                select.appendChild(option);
                            });
                        }
                    } catch (error) {
                        console.error('Error loading supervisores:', error);
                    }
                }
                document.getElementById('instituicao_id').addEventListener('change', async function () {
                    let instituicaoId = this.value;
                    if (!instituicaoId) {
                        instituicaoId = data.instituicao_id;
                    }
                    try {
                        const select = document.getElementById('supervisor_id');
                        select.innerHTML = '<option value="">Selecione um supervisor</option>';
                        const response = await authenticatedFetch(`/estagios/${instituicaoId}/supervisores`);
                        if (response.ok) {
                            const supervisores = await response.json();
                            supervisores.forEach(sup => {
                                const option = document.createElement('option');
                                option.value = sup.id;
                                option.textContent = sup.nome;
                                option.selected = data.supervisor_id ? sup.id === data.supervisor_id : false;
                                select.appendChild(option);
                            });
                        }
                    } catch (error) {
                        console.error('Error loading supervisores:', error);
                    }
                });

                // Clear and reload turmas
                try {
                    const response = await authenticatedFetch('/turmas');
                    if (response.ok) {
                        const turmas = await response.json();
                        const select = document.getElementById('turmaestagio_id');
                        select.innerHTML = '<option value="">Selecione uma turma</option>';

                        turmas.forEach(turma => {
                            const option = document.createElement('option');
                            option.value = turma.id;
                            option.textContent = turma.area;
                            option.selected = data.turmaestagio_id ? turma.id === data.turmaestagio_id : false;
                            select.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('Error loading turmas:', error);
                }
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
            turno: document.getElementById('turno').value || 'A',
            nivel: document.getElementById('nivel').value,
            ajuste2020: document.getElementById('ajuste2020').value,
            observacoes: document.getElementById('observacoes').value || null
        };

        try {
            const response = await authenticatedFetch('/estagiarios', {
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
