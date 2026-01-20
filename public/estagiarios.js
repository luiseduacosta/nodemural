$(document).ready(function () {

    let table;

    // Initialize DataTable but defer loading until we set the filter
    table = $('#estagiariosTable').DataTable({
        order: [[3, 'desc'], [1, 'asc']],
        ajax: {
            url: '/estagiarios',
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

    // Load Periodos and Config
    loadFilters();

    async function loadFilters() {
        try {
            // 1. Get Distinct Periods
            const periodosRes = await fetch('/estagiarios/periodos');
            const periodos = await periodosRes.json();
            console.log(periodos);
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
                if (config.termo_compromisso_periodo) {
                    // Check if the config period is in our list, if not add it (though it should be if data is consistent)
                    // If the list has it, select it.
                    select.val(config.termo_compromisso_periodo);
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
