$(document).ready(async function () {
    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'alunos.html';
        return;
    }

    // Fetch the aluno data
    try {
        const response = await fetch(`/alunos/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch aluno');
        }

        const aluno = await response.json();

        const datanascimento = new Date(aluno.nascimento);
        const datanascimentoFormatada = datanascimento.toLocaleDateString('pt-BR');

        // Populate the view fields
        document.getElementById('view-id').textContent = aluno.id;
        document.getElementById('view-nome').textContent = aluno.nome;
        document.getElementById('view-email').textContent = aluno.email;
        document.getElementById('view-ingresso').textContent = aluno.ingresso;
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

        // Store the ID for edit function
        window.currentAlunoId = id;

        // Fetch Inscricoes
        try {
            const inscResponse = await fetch(`/alunos/${id}/inscricoes`);
            if (inscResponse.ok) {
                const inscricoes = await inscResponse.json();
                const tbody = document.querySelector('#table-inscricoes tbody');

                if (inscricoes.length === 0) {
                    document.getElementById('table-inscricoes').classList.add('d-none');
                    document.getElementById('no-inscricoes-msg').classList.remove('d-none');
                } else {
                    inscricoes.forEach(ins => {
                        const tr = document.createElement('tr');

                        const dateLocal = ins.data ? new Date(ins.data).toLocaleDateString('pt-BR') : '';

                        tr.innerHTML = `
                            <td>${ins.id}</td>
                            <td>${ins.instituicao || '-'}</td>
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
            const estagiosResponse = await fetch(`/alunos/${id}/estagiarios`);
            if (estagiosResponse.ok) {
                const estagios = await estagiosResponse.json();
                const tbody = document.querySelector('#table-estagios tbody');

                if (estagios.length === 0) {
                    document.getElementById('table-estagios').classList.add('d-none');
                    document.getElementById('no-estagios-msg').classList.remove('d-none');
                } else {
                    estagios.forEach(est => {
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
            const response = await fetch(`/alunos/${window.currentAlunoId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete aluno');
            }
            window.location.href = 'alunos.html';
        } catch (error) {
            console.error('Error deleting aluno:', error);
            alert('Erro ao excluir aluno');
        }
    }
};
