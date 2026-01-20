$(document).ready(function () {
    const table = $('#estagiariosTable').DataTable({
        order: [[3, 'desc'], [1, 'asc']],
        ajax: {
            url: '/estagiarios',
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { 
                data: 'aluno_nome', 
                render: function (data, type, row) { 
                    return `<a href="view-estagiario.html?id=${row.id}">${row.aluno_nome || '-'}</a>` 
                } 
            },
            { data: 'instituicao_nome', defaultContent: '-' },
            { data: 'periodo', defaultContent: '-' },
            { data: 'nivel', defaultContent: '-' },
            { data: 'professor_nome', defaultContent: '-' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button onclick="window.location.href='edit-estagiario.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
                        <button onclick="deleteEstagiario(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
                    `;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    window.deleteEstagiario = async (id) => {
        if (confirm('Tem certeza que deseja excluir este registro de estagiário?')) {
            try {
                const response = await fetch(`/estagiarios/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Erro ao excluir');
                }
                table.ajax.reload();
            } catch (error) {
                console.error('Error deleting estagiario:', error);
                alert('Erro ao excluir estagiário');
            }
        }
    };
});
