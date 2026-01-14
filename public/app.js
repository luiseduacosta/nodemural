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
      { data: 'nome' },
      { data: 'email' },
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
      email: document.getElementById('email').value
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
      document.getElementById('nome').value = aluno.nome;
      document.getElementById('email').value = aluno.email;
      document.getElementById('alunoId').value = aluno.id;
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
});