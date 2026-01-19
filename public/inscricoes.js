$(document).ready(function () {
    const table = $('#inscricoesTable').DataTable({
        order: [[3, 'desc'], [1, 'asc']],
        ajax: {
            url: '/inscricoes',
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'aluno_nome', render: function (data, type, row) { return `<a href="view-inscricao.html?id=${row.id}">${data || 'N/A'}</a>` } },
            { data: 'instituicao' },
            { data: 'periodo' },
            {
                data: 'data', render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return date.toLocaleDateString('pt-BR');
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick="window.location.href='edit-inscricao.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
    <button onclick="deleteInscricao(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    window.deleteInscricao = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta inscrição?')) {
            await fetch(`/inscricoes/${id}`, { method: 'DELETE' });
            table.ajax.reload();
        }
    };
});
