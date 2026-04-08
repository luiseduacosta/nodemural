import { getToken, hasRole, getCurrentUser, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {
    const user = getCurrentUser();

    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    } else {
        if (hasRole(['aluno'])) {
            // Students should view their own aluno page
            if (!user.entidade_id) {
                console.error("Aluno without entidade_id");
            } else {
                window.location.href = 'view-aluno.html?id=' + user.entidade_id;
                return;
            }
        }
    }

    const tableConfig = {
        responsive: true,
        order: [[2, 'desc'], [3, 'asc']], // Order by Date DESC, then Start Time ASC
        ajax: {
            url: '/atividades',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
            },
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            {
                data: 'aluno_nome',
                render: function (data, type, row) {
                    return data ? `<a href="view-atividade.html?id=${row.id}">${data}</a>` : 'N/A';
                }
            },
            {
                data: 'dia', render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return date.toLocaleDateString('pt-BR');
                }
            },
            { data: 'inicio' },
            { data: 'final' },
            { data: 'horario' },
            { data: 'atividade' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick="window.location.href='edit-atividade.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
    <button onclick="deleteAtividade(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    };

    const table = $('#atividadesTable').DataTable(tableConfig);

    window.deleteAtividade = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            try {
                const response = await authenticatedFetch(`/atividades/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Erro ao excluir atividade');
                }
                table.ajax.reload();
            } catch (error) {
                console.error('Error deleting atividade:', error);
                alert('Erro ao excluir atividade');
            }
        }
    };
});
