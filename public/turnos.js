import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {
  if (!getToken() || !hasRole(['admin'])) {
    window.location.href = 'login.html';
    return;
  }

  const table = $('#turnosTable').DataTable({
    order: [[1, 'asc']],
    ajax: {
      url: '/turnos',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
      },
      dataSrc: ''
    },
    columns: [
      { data: 'id' },
      { data: 'turno', render: function (data, type, row) { return `<a href="view-turno.html?id=${row.id}">${row.turno}</a>` } },
      {
        data: null,
        render: function (data, type, row) {
          return `
            <button onclick="window.location.href='edit-turno.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
            <button onclick="deleteTurno(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
          `;
        }
      }
    ],
    language: {
      url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
    }
  });

  window.deleteTurno = async (id) => {
    if (confirm('Tem certeza?')) {
      try {
        const response = await authenticatedFetch(`/turnos/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error('Erro ao excluir turno');
        }
        table.ajax.reload();
      } catch (error) {
        console.error('Error deleting turno:', error);
        alert('Erro ao excluir turno.');
      }
    }
  };
});
