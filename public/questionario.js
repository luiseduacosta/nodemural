// src/public/questionario.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    $('#questionarioTable').DataTable({
        "ajax": {
            "url": "/questionarios",
            "dataSrc": ""
        },
        "columns": [
            { "data": "id" },
            {
                "data": "title", "render": function (data, type, row) {
                    return `<a href="questoes.html?questionario_id=${row.id}">${row.title}</a>`;
                }
            },
            { "data": "category" },
            { "data": "target_user_type" },
            {
                "data": "is_active",
                "render": function (data, type, row) {
                    return data ? '<span class="badge bg-success">Sim</span>' : '<span class="badge bg-secondary">Não</span>';
                }
            },
            {
                "data": null,
                "render": function (data, type, row) {
                    return `
                        <a href="respostas.html?questionario_id=${row.id}" class="btn btn-sm btn-info">Respostas</a>
                        <a href="view-questionario.html?id=${row.id}" class="btn btn-sm btn-info text-white">Ver</a>
                        <a href="edit-questionario.html?id=${row.id}" class="btn btn-sm btn-warning">Editar</a>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${row.id}">Excluir</button>
                    `;
                }
            }
        ],
        "language": {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    // Handle Delete
    $('#questionarioTable tbody').on('click', '.delete-btn', function () {
        const id = $(this).data('id');
        if (confirm('Tem certeza que deseja excluir este questionário?')) {
            $.ajax({
                url: `/questionarios/${id}`,
                type: 'DELETE',
                success: function () {
                    $('#questionarioTable').DataTable().ajax.reload();
                },
                error: function () {
                    alert('Erro ao excluir questionário.');
                }
            });
        }
    });
});
