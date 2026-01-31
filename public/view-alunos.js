// View Aluno Details
import { getToken, authenticatedFetch, getCurrentUser } from './auth-utils.js';

const user = getCurrentUser();
// console.log(user);

$(document).ready(async function () {
    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'alunos.html';
        return;
    } else if (user.role == 'aluno' && user.entidade_id != id) {
        alert('Você não tem permissão para visualizar este aluno');
        window.location.href = 'mural.html';
        return;
    }

    // Fetch the aluno data
    try {
        const response = await fetch(`/alunos/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch aluno');
        }
        const aluno = await response.json();
    
        // Format the date
        const datanascimento = new Date(aluno[0].nascimento);
        const datanascimentoFormatada = datanascimento.toLocaleDateString('pt-BR');

        // Populate the view fields
        document.getElementById('view-id').textContent = aluno[0].id;
        document.getElementById('view-nome').textContent = aluno[0].nome;
        document.getElementById('view-email').textContent = aluno[0].email;
        document.getElementById('view-ingresso').textContent = aluno[0].ingresso;
        document.getElementById('view-telefone').textContent = aluno[0].telefone;
        document.getElementById('view-celular').textContent = aluno[0].celular;
        document.getElementById('view-cpf').textContent = aluno[0].cpf;
        document.getElementById('view-identidade').textContent = aluno[0].identidade;
        document.getElementById('view-orgao').textContent = aluno[0].orgao;
        document.getElementById('view-nascimento').textContent = datanascimentoFormatada;
        document.getElementById('view-cep').textContent = aluno[0].cep;
        document.getElementById('view-endereco').textContent = aluno[0].endereco;
        document.getElementById('view-municipio').textContent = aluno[0].municipio;
        document.getElementById('view-bairro').textContent = aluno[0].bairro;
        document.getElementById('view-observacoes').textContent = aluno[0].observacoes;

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
            if (estagiariosResponse.ok) {
                const estagiarios = await estagiariosResponse.json();
                if (Array.isArray(estagiarios) && estagiarios.length > 0) {
                    // console.log(estagiarios);
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
});

// Function to redirect to edit mode
window.editRecord = function () {
    window.location.href = `edit-alunos.html?id=${window.currentAlunoId}`;
};

// Function to delete aluno
window.deleteRecord = async function () {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        try {
            const token = getToken();
            if (!token) {
                alert('Você precisa estar logado para excluir um aluno.');
                return;
            }
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
