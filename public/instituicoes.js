import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const table = $('#instituicoesTable').DataTable({
        order: [[1, 'asc']],
        ajax: {
            url: '/instituicoes',
            dataSrc: '',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
            }
        },

        columns: [
            { data: 'id' },
            { data: 'instituicao', render: function (data, type, row) { return `<a href="view-instituicao.html?id=${row.id}">${row.instituicao}</a>` } },
            { data: 'area_nome', defaultContent: '<em>Não definida</em>' },
            { data: 'cnpj' },
            { data: 'beneficios', defaultContent: '' },
            { data: 'fim_de_semana', render: function (data, type, row) {
                if (row.fim_de_semana == '0') return 'Não';
                if (row.fim_de_semana == '1') return 'Sim';
                if (row.fim_de_semana == '2') return 'Parcial';
                return '';
            }},
            { data: 'convenio', defaultContent: '' },
            { data: 'expira', render: function (data, type) {
                if (!data) return type === 'display' ? '' : 0;
                const time = new Date(data).getTime();
                if (type === 'display') {
                    return new Date(time).toLocaleDateString('pt-BR');
                }
                return time;
            }},
            { data: 'seguro', render: function (data, type, row) {
                if (row.seguro == '0') return 'Não';
                if (row.seguro == '1') return 'Sim';
                return '';
            }},
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick = "window.location.href='edit-instituicao.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
    <button onclick="deleteInstituicao(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    window.deleteInstituicao = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta instituição?')) {
            try {
                const response = await authenticatedFetch(`/instituicoes/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Erro ao excluir instituição');
                }
                table.ajax.reload();
            } catch (error) {
                console.error('Error deleting instituicao:', error);
                alert('Erro ao excluir instituição');
            }
        }
    };
});
