$(document).ready(function () {
  const table = $('#areasTable').DataTable({
    order: [[1, 'asc']],
    ajax: {
      url: '/areainstituicoes',
      dataSrc: ''
    },
    columns: [
      { data: 'id' },
      { data: 'area', render: function (data, type, row) { return `<a href="view-areainstituicao.html?id=${row.id}">${row.area}</a>` } },
      {
        data: null,
        render: function (data, type, row) {
          return `
            <button onclick="window.location.href='edit-areainstituicao.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
            <button onclick="deleteArea(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
          `;
        }
      }
    ],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
    }
  });

  window.deleteArea = async (id) => {
    if (confirm('Tem certeza?')) {
      $.ajax({
        url: `/areainstituicoes/${id}`,
        type: 'DELETE',
        success: function (result) {
          table.ajax.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting area:', error);
          alert('Erro ao excluir área.');
        }
      });
    }
  };
})
