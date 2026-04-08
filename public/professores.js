// src/public/professores.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    // Only users with token and role 'admin' or 'professor' can access this page
    if (!getToken() || !hasRole(['admin', 'professor'])) {
        window.location.href = 'login.html';
        return;
    }

    const table = $('#professoresTable').DataTable({
        order: [[1, 'asc']],
        ajax: {
            url: '/professores',
            dataSrc: '',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
            }
        },
        columns: [
            { data: 'id' },
            { data: 'nome', render: function (data, type, row) { return '<a href="view-professor.html?id=' + row.id + '">' + row.nome + '</a>'; } },
            { data: 'siape' },
            { data: 'email' },
            { data: 'celular', defaultContent: '' },
            { data: 'departamento', defaultContent: 'Outras áreas' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick="editProfessor(${row.id})" class="btn btn-sm btn-warning">Editar</button>
    <button onclick="deleteProfessor(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    window.editProfessor = function (id) {
        window.location.href = `edit-professor.html?id=${id}`;
    };

    window.deleteProfessor = async (id) => {
        if (confirm('Tem certeza que deseja excluir este(a) professor(a)?')) {
            try {
                const response = await authenticatedFetch(`/professores/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Failed to delete professor(a)');
                }
                table.ajax.reload();
            } catch (error) {
                console.error('Error deleting professor(a):', error);
                alert('Erro ao excluir professor(a)');
            }
        }
    };
});
