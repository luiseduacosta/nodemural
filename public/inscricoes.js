import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    let table;

    table = $('#inscricoesTable').DataTable({
        order: [[3, 'desc'], [1, 'asc']],
        ajax: {
            url: '/inscricoes',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());
            },
            data: function (d) {
                const periodo = $('#periodoFilter').val();
                if (periodo) {
                    d.periodo = periodo;
                }
            },
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

    // Load Periodos and Config
    loadFilters();

    async function loadFilters() {
        try {
            // 1. Get Distinct Periods
            const periodosRes = await authenticatedFetch('/inscricoes/periodos');
            const periodos = await periodosRes.json();

            const select = $('#periodoFilter');
            select.empty();

            // Add periods from DB
            periodos.forEach(p => {
                select.append(new Option(p.periodo, p.periodo));
            });

            // 2. Get Default Config
            const configRes = await authenticatedFetch('/configuracoes');
            if (configRes.ok) {
                const config = await configRes.json();
                if (config.mural_periodo_atual) {
                    select.val(config.mural_periodo_atual);
                }
            }

            // Reload table with the new default filter
            table.ajax.reload();

        } catch (error) {
            console.error('Error loading filters:', error);
            $('#periodoFilter').html('<option value="">Erro ao carregar</option>');
        }
    }

    // Handle Change
    $('#periodoFilter').on('change', function () {
        table.ajax.reload();
    });

    // Delete Inscricao
    window.deleteInscricao = async (id) => {
        if (confirm('Tem certeza que deseja excluir esta inscrição?')) {
            try {
                const response = await authenticatedFetch(`/inscricoes/${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Erro ao excluir inscrição');
                }
                table.ajax.reload();
            } catch (error) {
                console.error('Error deleting inscricao:', error);
                alert('Erro ao excluir inscrição');
            }
        }
    };
});
