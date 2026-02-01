// src/public/docentes.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(function () {

    // Only users with token and role 'admin' or 'docente' can access this page
    if (!getToken() || !hasRole(['admin', 'docente'])) {
        window.location.href = 'login.html';
        return;
    }

    const table = $('#docentesTable').DataTable({
        order: [[1, 'asc']],
        ajax: {
            url: '/docentes',
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'nome', render: function (data, type, row) { return '<a href="view-docente.html?id=' + row.id + '">' + row.nome + '</a>'; } },
            { data: 'siape' },
            { data: 'email' },
            { data: 'celular', defaultContent: '' },
            { data: 'departamento', defaultContent: 'Outras áreas' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick="editDocente(${row.id})" class="btn btn-sm btn-warning">Editar</button>
    <button onclick="deleteDocente(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    window.editDocente = function (id) {
        window.location.href = `edit-docentes.html?id=${id}`;
    };

    window.deleteDocente = async (id) => {
        if (confirm('Tem certeza que deseja excluir este docente?')) {
            try {
                const response = await fetch(`/docentes/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Failed to delete docente');
                }
                table.ajax.reload();
            } catch (error) {
                console.error('Error deleting docente:', error);
                alert('Erro ao excluir docente');
            }
        }
    };
});
