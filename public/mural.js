$(document).ready(function () {
    let table;

    // Initialize DataTable but defer loading until we set the filter
    table = $('#muralTable').DataTable({
        order: [[2, 'desc'], [1, 'asc']],
        ajax: {
            url: '/mural',
            data: function (d) {
                // Add periodo filter if selected
                const periodo = $('#periodoFilter').val();
                if (periodo && periodo !== 'Todos') {
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

            // Add 'Todos' option
            const option = document.createElement("option");
            option.value = 'Todos';
            option.text = 'Todos';
            select.append(option);

            // 2. Get mural_periodo_atual (periodo) from Configuracoes and select it
            const configRes = await fetch('/configuracoes');
            if (configRes.ok) {
                const config = await configRes.json();
                if (config[0].mural_periodo_atual) {
                    // If the list has it, select it.
                    let found = false;
                    periodos.forEach(p => {
                        if (p.periodo === config[0].mural_periodo_atual) {
                            found = true;
                            const option = document.createElement("option");
                            // If not found, select the first one
                            if (!found) {
                                const firstPeriod = periodos[0];
                                const option = document.createElement("option");
                                option.value = firstPeriod.periodo;
                                option.text = firstPeriod.periodo;
                                option.selected = true;
                                select.append(option);
                            }
                        }
                    });
                    if (found) {
                        const option = document.createElement("option");
                        option.value = config[0].mural_periodo_atual;
                        option.text = config[0].mural_periodo_atual;
                        option.selected = true;
                        select.append(option);
                    }
                }
            }
            // 3. Add periods from DB with default selected
            periodos.forEach(p => {
                const option = document.createElement("option");
                option.value = p.periodo;
                option.text = p.periodo;
                select.append(option);
            });

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
