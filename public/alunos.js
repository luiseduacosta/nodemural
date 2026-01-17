$(document).ready(function () {
  const form = document.getElementById('alunoForm');
  const table = $('#alunosTable').DataTable({
    order: [[1, 'asc']],
    ajax: {
      url: '/alunos',
      dataSrc: ''
    },
    columns: [
      { data: 'id' },
      { data: 'nome', render: function (data, type, row) { return `<a href="view-alunos.html?id=${row.id}">${row.nome}</a>` } },
      { data: 'email' },
      { data: 'ingresso' },
      {
        data: null,
        render: function (data, type, row) {
          return `
            <button onclick="editAluno(${row.id})" class="btn btn-sm btn-warning">Editar</button>
            <button onclick="deleteAluno(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
          `;
        }
      }
    ],
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const aluno = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      ingresso: document.getElementById('ingresso').value,
      telefone: document.getElementById('telefone').value,
      celular: document.getElementById('celular').value,
      cpf: document.getElementById('cpf').value,
      identidade: document.getElementById('identidade').value,
      orgao: document.getElementById('orgao').value,
      nascimento: document.getElementById('nascimento').value,
      cep: document.getElementById('cep').value,
      endereco: document.getElementById('endereco').value,
      municipio: document.getElementById('municipio').value,
      bairro: document.getElementById('bairro').value,
      observacoes: document.getElementById('observacoes').value
    };

    const id = document.getElementById('alunoId').value;
    const url = id ? `/alunos/${id}` : '/alunos';
    const method = id ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aluno)
    });

    form.reset();
    document.getElementById('alunoId').value = '';
    table.ajax.reload();
  });

  window.editAluno = async (id) => {
    try {
      const response = await fetch(`/alunos/${id}`);
      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(responseText || 'Failed to fetch aluno');
      }

      const aluno = JSON.parse(responseText);
      document.getElementById('alunoId').value = aluno.id;
      document.getElementById('nome').value = aluno.nome;
      document.getElementById('email').value = aluno.email;
      document.getElementById('ingresso').value = aluno.ingresso;
      document.getElementById('telefone').value = aluno.telefone;
      document.getElementById('celular').value = aluno.celular;
      document.getElementById('cpf').value = aluno.cpf;
      document.getElementById('identidade').value = aluno.identidade;
      document.getElementById('orgao').value = aluno.orgao;
      document.getElementById('nascimento').value = aluno.nascimento;
      document.getElementById('cep').value = aluno.cep;
      document.getElementById('endereco').value = aluno.endereco;
      document.getElementById('municipio').value = aluno.municipio;
      document.getElementById('bairro').value = aluno.bairro;
      document.getElementById('observacoes').value = aluno.observacoes;
    } catch (error) {
      console.error('Edit error:', error);
      alert(`Error loading aluno data: ${error.message}`);
    }
  };

  window.deleteAluno = async (id) => {
    if (confirm('Tem certeza?')) {
      await fetch(`/alunos/${id}`, { method: 'DELETE' });
      table.ajax.reload();
    }
  };

  window.viewRecord = function () {
    window.location.href = 'view-alunos.html?id=' + this.id;
  };
})
