import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

  if (!getToken() || !hasRole(['admin'])) {
    window.location.href = 'login.html';
    return;
  }

  const table = $('#areasTable').DataTable({
    order: [[1, 'asc']],
    ajax: {
      url: '/areainstituicoes',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
      },
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
      try {
        const response = await authenticatedFetch(`/areainstituicoes/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Erro ao excluir área');
        }
        table.ajax.reload();
      } catch (error) {
        console.error('Error deleting area:', error);
        alert('Erro ao excluir área.');
      }
    }
  };
})
