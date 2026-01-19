$(document).ready(function () {
    let table;

    // Initialize DataTable but defer loading until we set the filter
    table = $('#muralTable').DataTable({
        order: [[2, 'desc'], [1, 'asc']],
        ajax: {
            url: '/mural',
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
            { data: 'instituicao', render: function (data, type, row) { return `<a href="view-mural.html?id=${row.id}">${row.instituicao}</a>` } },
            { data: 'periodo' },
            { data: 'vagas' },
            {
                data: 'dataInscricao', render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return date.toLocaleDateString('pt-BR');
                }
            },
            {
                data: 'dataSelecao', render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return date.toLocaleDateString('pt-BR');
                }
            },
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
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    // Load Periodos and Config
    loadFilters();

    async function loadFilters() {
        try {
            // 1. Get Distinct Periods
            const periodosRes = await fetch('/mural/periodos');
            const periodos = await periodosRes.json();

            const select = $('#periodoFilter');
            select.empty();

            // Add periods from DB
            periodos.forEach(p => {
                select.append(new Option(p.periodo, p.periodo));
            });

            // 2. Get Default Config
            const configRes = await fetch('/configuracoes');
            if (configRes.ok) {
                const config = await configRes.json();
                if (config.mural_periodo_atual) {
                    // Check if the config period is in our list, if not add it (though it should be if data is consistent)
                    // If the list has it, select it.
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

    window.deleteMural = async (id) => {
        if (confirm('Tem certeza que deseja excluir este mural?')) {
            await fetch(`/mural/${id}`, { method: 'DELETE' });
            table.ajax.reload();
        }
    };
});
