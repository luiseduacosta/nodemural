// View Aluno Details
import { getToken, authenticatedFetch, getCurrentUser, hasRole } from './auth-utils.js';

const user = getCurrentUser();

$(document).ready(async function () {

    // Se não estiver logado ou não for admin ou aluno, redireciona para o login
    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    // Get the ID from the URL query parameter with the id of the aluno
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'mural.html';
        return;
    }

    // If the user is an aluno and the id is not his, redirect to the mural
    if (!hasRole(['admin']) || (hasRole(['aluno']) && user.entidade_id != id)) {
        alert('Você não tem permissão para visualizar este aluno');
        window.location.href = 'mural.html';
        return;
    } else {
        // If the user is not an admin, hide the delete button
        if (!hasRole(['admin'])) {
            document.getElementById('btnAluno-excluir').classList.add('d-none');
        }
    }

    // Hide the edit and new-estagiario buttons if it not the own aluno
    if (!hasRole(['admin']) || (hasRole(['aluno']) && user.entidade_id != id)) {
        document.getElementById('btnAluno-editar').classList.add('d-none');
        document.getElementById('btnAluno-estagios').classList.add('d-none');
    }

    // Fetch the aluno data
    try {
        const response = await authenticatedFetch(`/alunos/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch aluno');
        }
        const aluno = await response.json();
        if (!aluno) {
            throw new Error('Aluno não encontrado');
        }

        let datanascimentoFormatada = '';
        if (aluno.nascimento) {
            const nascimentoStr = String(aluno.nascimento);
            const dateOnly = nascimentoStr.match(/^(\d{4}-\d{2}-\d{2})/);
            const dateForParse = dateOnly ? `${dateOnly[1]}T00:00:00` : aluno.nascimento;
            const parsed = new Date(dateForParse);
            if (!Number.isNaN(parsed.getTime())) {
                datanascimentoFormatada = parsed.toLocaleDateString('pt-BR');
            }
        }

        // Populate the view fields
        document.getElementById('view-id').textContent = aluno.id;
        document.getElementById('view-nome').textContent = aluno.nome;
        document.getElementById('view-registro').textContent = aluno.registro;
        document.getElementById('view-email').textContent = aluno.email;
        document.getElementById('view-ingresso').textContent = aluno.ingresso;
        document.getElementById('view-turno').textContent = await resolveTurnoLabel(aluno);
        document.getElementById('view-telefone').textContent = aluno.telefone;
        document.getElementById('view-celular').textContent = aluno.celular;
        document.getElementById('view-cpf').textContent = aluno.cpf;
        document.getElementById('view-identidade').textContent = aluno.identidade;
        document.getElementById('view-orgao').textContent = aluno.orgao;
        document.getElementById('view-nascimento').textContent = datanascimentoFormatada;
        document.getElementById('view-cep').textContent = aluno.cep;
        document.getElementById('view-endereco').textContent = aluno.endereco;
        document.getElementById('view-municipio').textContent = aluno.municipio;
        document.getElementById('view-bairro').textContent = aluno.bairro;
        document.getElementById('view-observacoes').textContent = aluno.observacoes;
        // Replace the href value to be used in new-estagiario.js
        document.getElementById("btnAluno-estagios").href = `new-estagiario.html?id=${id}`;

        // Store the ID for edit function
        window.currentAlunoId = id;

        // Fetch Inscricoes
        try {
            const inscResponse = await authenticatedFetch(`/alunos/${id}/inscricoes`);
            if (inscResponse.ok) {
                const inscricoes = await inscResponse.json();
                const tbody = document.querySelector('#table-inscricoes tbody');

                if (inscricoes.length === 0) {
                    document.getElementById('table-inscricoes').classList.add('d-none');
                    document.getElementById('no-inscricoes-msg').classList.remove('d-none');
                } else {
                    inscricoes.forEach(ins => {
                        const tr = document.createElement('tr');

                        const dateLocal = ins.data_inscricao ? new Date(ins.data_inscricao).toLocaleDateString('pt-BR') : '';

                        tr.innerHTML = `
                            <td>${ins.id}</td>
                            <td>${ins.mural_instituicao || '-'}</td>
                            <td>${ins.periodo || '-'}</td>
                            <td>${dateLocal}</td>
                            <td>
                                <a href="view-inscricao.html?id=${ins.id}" class="btn btn-sm btn-primary">Ver</a>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }
        } catch (errInsc) {
            console.error("Error fetching inscricoes:", errInsc);
        }

        // Fetch Estagiarios
        try {
            const estagiariosResponse = await authenticatedFetch(`/alunos/${id}/estagiarios`);
            if (estagiariosResponse.status === 401) {
                console.error("Token error (401) fetching estagiarios");
            }
            if (estagiariosResponse.ok) {
                const estagiarios = await estagiariosResponse.json();
                if (!estagiarios) {
                    throw new Error('Sem estagiários');
                }
                if (Array.isArray(estagiarios) && estagiarios.length > 0) {
                    console.log("Com estagiários");
                } else {
                    console.log("Sem estagiários");
                }
                const tbody = document.querySelector('#table-estagios tbody');

                if (estagiarios.length === 0) {
                    document.getElementById('table-estagios').classList.add('d-none');
                    document.getElementById('no-estagios-msg').classList.remove('d-none');
                } else {
                    estagiarios.forEach(est => {
                        const tr = document.createElement('tr');

                        let nivelDisplay = est.nivel;
                        if (est.nivel == 9) {
                            nivelDisplay = '9 - Continuação';
                        }

                        tr.innerHTML = `
                            <td>${est.id}</td>
                            <td>${est.instituicao_nome || '-'}</td>
                            <td>${est.periodo || '-'}</td>
                            <td>${nivelDisplay}</td>
                            <td>${est.professor_nome || '-'}</td>
                            <td>${est.supervisor_nome || '-'}</td>
                            
                            <td>
                                <a href="view-estagiario.html?id=${est.id}" class="btn btn-sm btn-primary">Ver</a>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }
        } catch (errEst) {
            console.error("Error fetching estagiarios:", errEst);
        }

    } catch (error) {
        console.error('Error loading aluno:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'alunos.html';
    }

    async function resolveTurnoLabel(aluno) {
        const turnoId = aluno?.turno_id;
        if (turnoId === null || turnoId === undefined || String(turnoId).trim() === '' || String(turnoId).trim() === '0') {
            return aluno?.turno || '';
        }
        try {
            const response = await authenticatedFetch('/turnos');
            if (!response.ok) {
                return aluno?.turno || '';
            }
            const turnos = await response.json();
            const match = turnos.find(t => String(t.id) === String(turnoId));
            return match?.turno || aluno?.turno || '';
        } catch (error) {
            return aluno?.turno || '';
        }
    }
});

// if role is aluno then verify if it is estagiario, then check estagiario periodo with configuracoes termo_compromisso_periodo and render accordingly 
window.checkEstagiarioPeriodo = async () => {
    try {
        const user = getCurrentUser();
        if (!hasRole(['admin']) || (hasRole(['aluno']) && user.entidade_id != window.currentAlunoId)) {
            alert('Você não tem permissão para visualizar este aluno.');
            window.location.href = 'mural.html';
            return;
        }
        const alunoId = user.entidade_id;
        const response = await authenticatedFetch(`/alunos/${alunoId}/estagiarios`);
        if (response.ok) {
            const estagiarios = await response.json();
            if (estagiarios.length > 0) {
                // Pick last estagiario
                const currentPeriodo = estagiarios[estagiarios.length - 1].periodo;
                // Get termo_compromisso_periodo from table configuracoes
                const configuracoesResponse = await authenticatedFetch('/configuracoes');
                const configuracoes = await configuracoesResponse.json();
                const termoCompromissoPeriodo = configuracoes.termo_compromisso_periodo;
                // Verify if currentPeriodo is less than termoCompromissoPeriodo
                if (currentPeriodo < termoCompromissoPeriodo) {
                    console.log("Periodo do estagiário atual " + currentPeriodo + " menor que termo de compromisso " + termoCompromissoPeriodo);
                    // Button btnAluno-estagios redirect to new-estagiario.html
                    document.getElementById('btnAluno-estagios').href = `new-estagiario.html?id=${alunoId}`;
                    document.getElementById('btnAluno-estagios').innerHTML = 'Novo Estagiário';
                    document.getElementById('btnAluno-estagios').classList.add('btn-success');
                } else if (currentPeriodo == termoCompromissoPeriodo) {
                    console.log("Periodo do estagiário atual " + currentPeriodo + " igual ao termo de compromisso " + termoCompromissoPeriodo);
                    // Button btnAluno-estagios redirect to edit-estagiario.html
                    document.getElementById('btnAluno-estagios').href = `edit-estagiario.html?id=${estagiarios[estagiarios.length - 1].id}`;
                    document.getElementById('btnAluno-estagios').innerHTML = 'Editar Estagiário';
                    document.getElementById('btnAluno-estagios').classList.add('btn-warning');
                } else {
                    console.log("Periodo do estagiário atual " + currentPeriodo + " maior que termo de compromisso " + termoCompromissoPeriodo);
                    // Button btnAluno-estagios redirect to view-estagiario.html
                    document.getElementById('btnAluno-estagios').href = `view-estagiario.html?id=${estagiarios[estagiarios.length - 1].id}`;
                    document.getElementById('btnAluno-estagios').innerHTML = 'Ver Estagiário';
                    document.getElementById('btnAluno-estagios').classList.add('btn-info');
                }
            }
        }
    }
    catch (error) {
        console.error('Error fetching estagiarios:', error);
    }
};

// Function to redirect to edit mode
window.editRecord = function () {
    const user = getCurrentUser();
    // Check if user is admin or aluno and is the owner
    if (!hasRole(['admin']) || (hasRole(['aluno']) && user.entidade_id != window.currentAlunoId)) {
        alert('Você não tem permissão para editar este aluno.');
        return;
    }
    window.location.href = `edit-aluno.html?id=${window.currentAlunoId}`;
};

// Function to delete aluno
window.deleteRecord = async function () {
    const user = getCurrentUser();
    // Check if user is admin or aluno and is the owner
    if (!hasRole(['admin']) || (hasRole(['aluno']) && user.entidade_id != window.currentAlunoId)) {
        alert('Você não tem permissão para excluir este aluno.');
        return;
    }
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        try {
            const response = await authenticatedFetch(`/alunos/${window.currentAlunoId}`, { method: 'DELETE' });
            if (!response.ok) {
                if (response.status === 401) {
                    alert('Não autorizado. Faça login novamente.');
                } else if (response.status === 403) {
                    alert('Acesso negado. Permissão insuficiente.');
                } else {
                    throw new Error('Failed to delete aluno');
                }
                return;
            }
            window.location.href = 'alunos.html';
        } catch (error) {
            console.error('Error deleting aluno:', error);
            alert('Erro ao excluir aluno');
        }
    }
};
