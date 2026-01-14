$(document).ready(function () {
    const table = $('#muralTable').DataTable({
        order: [[2, 'desc'], [1, 'asc']],
        ajax: {
            url: '/mural',
            dataSrc: ''
        },
        columns: [
            { data: 'id'},
            { data: 'instituicao', render: function (data, type, row) { return `<a href="view-mural.html?id=${row.id}">${row.instituicao}</a>` } },
            { data: 'periodo' },
            { data: 'vagas' },
            { data: 'convenio', render: function (data) { return data === '1' ? 'Sim' : 'Não'; } },
            { data: 'dataInscricao', render: function (data) { 
                if (!data) return '';
                const date = new Date(data);
                return date.toLocaleDateString('pt-BR');
            }},
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick="window.location.href='edit-mural.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
    <button onclick="deleteMural(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
        }
    });

    window.deleteMural = async (id) => {
        if (confirm('Tem certeza que deseja excluir este mural?')) {
            await fetch(`/mural/${id}`, { method: 'DELETE' });
            table.ajax.reload();
        }
    };
});
