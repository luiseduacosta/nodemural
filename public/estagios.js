// src/public/estagios.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const table = $('#estagiosTable').DataTable({
        order: [[1, 'asc']],
        ajax: {
            url: '/estagios',
            dataSrc: '',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
            }
        },

        columns: [
            { data: 'id' },
            { data: 'instituicao', render: function (data, type, row) { return `<a href="view-estagio.html?id=${row.id}">${row.instituicao}</a>` } },
            { data: 'area_nome', defaultContent: '<em>Não definida</em>' },
            { data: 'cnpj' },
            { data: 'beneficio', defaultContent: '' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick = "window.location.href='edit-estagio.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
    <button onclick="deleteEstagio(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    window.deleteEstagio = async (id) => {
        if (confirm('Tem certeza que deseja excluir este estagio?')) {
            await authenticatedFetch(`/estagio/${id}`, { method: 'DELETE' });
            table.ajax.reload();
        }
    };
});
