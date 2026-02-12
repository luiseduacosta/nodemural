import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    // Get instituicao_id from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const instituicaoId = urlParams.get('instituicao_id');

    const tableConfig = {
        responsive: true,
        order: [[2, 'desc']],
        ajax: {
            url: instituicaoId ? `/visitas?instituicao_id=${instituicaoId}` : '/visitas',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
            },
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'instituicao', render: function (data, type, row) { return `<a href="view-visita.html?id=${row.id}">${data}</a>` } },
            {
                data: 'data', render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return date.toLocaleDateString('pt-BR');
                }
            },
            { data: 'responsavel' },
            { data: 'motivo' },
            { data: 'avaliacao' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick="window.location.href='edit-visita.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
    <button onclick="deleteVisita(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    };

    const table = $('#visitasTable').DataTable(tableConfig);

    window.deleteVisita = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta visita?')) {
            try {
                const response = await authenticatedFetch(`/visitas/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Erro ao excluir visita');
                }
                table.ajax.reload();
            } catch (error) {
                console.error('Error deleting visita:', error);
                alert('Erro ao excluir visita');
            }
        }
    };
});
