$(document).ready(function () {
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
            <button onclick="window.location.href='edit-aluno.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
            <button onclick="deleteAluno(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
          `;
        }
      }
    ],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
    }
  });

  window.deleteAluno = async (id) => {
    if (confirm('Tem certeza?')) {
      await fetch(`/alunos/${id}`, { method: 'DELETE' });
      table.ajax.reload();
    }
  };
})
