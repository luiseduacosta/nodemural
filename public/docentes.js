$(document).ready(function () {
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
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
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
