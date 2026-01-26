$(document).ready(function () {
    const table = $('#turmasTable').DataTable({
        order: [[1, 'asc']],
        ajax: {
            url: '/turmas',
            dataSrc: ''
        },

        columns: [
            { data: 'id' },
            {
                data: 'area',
                render: function (data, type, row) {
                    return `<a href="view-turma.html?id=${row.id}">${row.area}</a>`
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button onclick="window.location.href='edit-turma.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
                        <button onclick="deleteTurma(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
                    `;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    window.deleteTurma = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta turma de estágio?')) {
            try {
                const response = await fetch(`/turmas/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Failed to delete turma');
                }
                table.ajax.reload();
            } catch (error) {
                console.error('Error deleting turma:', error);
                alert('Erro ao excluir turma de estágio');
            }
        }
    };
});
