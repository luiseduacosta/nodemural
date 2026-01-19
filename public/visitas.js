$(document).ready(function () {
    // Get instituicao_id from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const instituicaoId = urlParams.get('instituicao_id');

    const tableConfig = {
        responsive: true,
        order: [[2, 'desc']],
        ajax: {
            url: instituicaoId ? `/visitas?instituicao_id=${instituicaoId}` : '/visitas',
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
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
        }
    };

    const table = $('#visitasTable').DataTable(tableConfig);

    window.deleteVisita = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta visita?')) {
            await fetch(`/visitas/${id}`, { method: 'DELETE' });
            table.ajax.reload();
        }
    };
});
