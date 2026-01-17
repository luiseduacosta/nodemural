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
