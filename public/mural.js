// src/routes/muralRoutes.js
import { getToken, isAdmin, hasRole, authenticatedFetch } from './auth-utils.js';

// Everybody can access to the display of this page for the current periodo stored in the config
$(document).ready(async function () {

    let table;

    table = $('#muralTable').DataTable({
        order: [[2, 'desc'], [1, 'asc']],
        ajax: {
            url: '/mural',
            data: function (d) {
                const token = getToken();
                if (token && hasRole('admin', 'docente', 'supervisor')) {
                    const periodo = $('#periodoFilter').val();
                    if (periodo && periodo != 'Todos') {
                        d.periodo = periodo;
                    }
                } else if (window.defaultPeriod) {
                    d.periodo = window.defaultPeriod;
                }
            },
            beforeSend: function (xhr) {
                const token = getToken();
                if (token) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                }
            },
            dataSrc: '',
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
                render: isAdmin() ? function (data, type, row) {
                    return `
                    <button onclick = "window.location.href='edit-mural.html?id=${row.id}'" class= "btn btn-sm btn-warning"> Editar</button>
                    <button onclick="deleteMural(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
                    `;
                } : function (data, type, row) {
                    return '';
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    async function loadFilters() {
        try {
            // 1. Get Distinct Periods
            const periodosRes = await fetch('/mural/periodoestagio', {
                method: 'GET',
            });

            const periodos = await periodosRes.json();
            const select = $('#periodoFilter');
            select.empty();

            // Add 'Todos' option first
            const option = document.createElement("option");
            option.value = 'Todos';
            option.text = 'Todos';
            select.append(option);

            // 2. Get mural_periodo_atual (periodo) from Configuracoes and select it
            const configRes = await authenticatedFetch('/configuracoes');
            if (configRes.ok) {
                const config = await configRes.json();
                if (config && config.mural_periodo_atual) {
                    window.defaultPeriod = config.mural_periodo_atual;
                }
            }

            // 3. Add periodos from DB with default value
            periodos.forEach(p => {
                const option = document.createElement("option");
                option.value = p.periodo;
                option.text = p.periodo;
                if (window.defaultPeriod && window.defaultPeriod == p.periodo) {
                    option.selected = true;
                }
                select.append(option);
            });

            // If there is not a default period, select the first one
            if (periodos.length > 0 && !select.val()) {
                const option = document.createElement("option");
                option.value = periodos[0].periodo;
                option.text = periodos[0].periodo;
                option.selected = true;
                select.append(option);
            }

            // Reload table with the new default filter
            table.ajax.reload();

        } catch (error) {
            console.error('Error loading filters:', error);
            $('#periodoFilter').html('<option value="">Erro ao carregar</option>');
        }
    }

    // Load Periodos and Config
    loadFilters();

    // Hide new mural button if not admin
    if (!isAdmin()) {
        $('#newMuralBtn').hide();
        $('#filter-container').hide();
    }

    // Hide edit and delete buttons if not admin
    if (!isAdmin()) {
        $('#muralTable').DataTable().column(6).visible(false);
    }

    // Handle Change
    $('#periodoFilter').on('change', function () {
        table.ajax.reload();
    });

    window.deleteMural = async (id) => {
        if (confirm('Tem certeza que deseja excluir este mural?')) {
            try {
                const response = await fetch(`/ mural / ${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Failed to delete mural');
                }
                table.ajax.reload();
            } catch (error) {
                console.error('Error deleting mural:', error);
                alert('Erro ao excluir mural');
            }
        }
    };
});
