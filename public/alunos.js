// src/routes/alunoRoutes.js
import { getToken, getCurrentUser, isAdmin } from './auth-utils.js';

$(document).ready(async function () {

  const token = getToken();
  const currentUser = getCurrentUser();

  // If not logged in, redirect to login
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const table = $('#alunosTable').DataTable({
    order: [[3, 'asc']],
    ajax: {
      url: '/alunos',
      dataSrc: '',
      beforeSend: function (xhr) {
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      }
    },
    columns: [
      { data: 'id' },
      { data: 'registro' },
      { data: 'nome', render: function (data, type, row) { return `<a href="view-alunos.html?id=${row.id}">${row.nome}</a>` } },
      { data: 'email' },
      { data: 'ingresso' },
      {
        data: null,
        render: function (data, type, row) {
          return `
            <button onclick="window.location.href='edit-alunos.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
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
      $.ajax({
        url: `/alunos/${id}`,
        type: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        success: function (result) {
          table.ajax.reload();
        },
        error: function (xhr, status, error) {
          console.error('Error deleting aluno:', error);
        }
      });
    }
  };
})
