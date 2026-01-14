$(document).ready(function () {
    const table = $('#estagioTable').DataTable({
        order: [[1, 'asc']],
        ajax: {
            url: '/estagio',
            dataSrc: ''
        },

        columns: [
            { data: 'id'},
            { data: 'instituicao', render: function (data, type, row) { return `<a href="view-estagio.html?id=${row.id}">${row.instituicao}</a>` } },
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
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
        }
    });

    window.deleteEstagio = async (id) => {
        if (confirm('Tem certeza que deseja excluir este estagio?')) {
            await fetch(`/estagio/${id}`, { method: 'DELETE' });
            table.ajax.reload();
        }
    };
});
