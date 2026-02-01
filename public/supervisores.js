// src/controllers/supervisorController.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(function () {
    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const table = $('#supervisoresTable').DataTable({
        order: [[1, 'asc']],
        ajax: {
            url: '/supervisores',
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'nome', render: function (data, type, row) { return `<a href="view-supervisor.html?id=${row.id}">${row.nome}</a>` } },
            { data: 'email' },
            { data: 'celular' },
            { data: 'cress' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick = "window.location.href='edit-supervisor.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
    <button onclick="deleteSupervisor(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    window.deleteSupervisor = async (id) => {
        if (confirm('Tem certeza que deseja excluir este supervisor?')) {
            await fetch(`/supervisores/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            table.ajax.reload();
        }
    };
});
