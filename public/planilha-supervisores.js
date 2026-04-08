import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {
    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    async function fetchPlanilha(periodo) {
        const url = periodo
            ? `/estagiarios/planilhaSupervisores?periodo=${encodeURIComponent(periodo)}`
            : '/estagiarios/planilhaSupervisores';
        const response = await authenticatedFetch(url, { method: 'GET' });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }

    function fillPeriodoSelect(periodos, selected) {
        const select = $('#periodoFilter');
        select.empty();
        if (!periodos || periodos.length === 0) {
            select.append('<option value="">Nenhum período</option>');
            return;
        }

        periodos.forEach((p) => {
            const option = document.createElement('option');
            option.value = p;
            option.text = p;
            select.append(option);
        });

        if (selected) {
            select.val(selected);
        } else {
            select.val(periodos[0]);
        }
    }

    function normalizeRows(rows) {
        return (rows || []).map((r) => ({
            aluno_nome: r.aluno_nome ?? '',
            instituicao: r.instituicao ?? '',
            endereco_instituicao: r.endereco_instituicao ?? '',
            cep_instituicao: r.cep_instituicao ?? '',
            bairro_instituicao: r.bairro_instituicao ?? '',
            supervisor_nome: r.supervisor_nome ?? '',
            supervisor_cress: r.supervisor_cress ?? '',
            supervisor_regiao: r.supervisor_regiao ?? '',
            professor_nome: r.professor_nome ?? ''
        }));
    }

    const table = $('#planilha-supervisores-table').DataTable({
        processing: true,
        serverSide: false,
        searching: true,
        paging: true,
        order: [[0, 'asc']],
        data: [],
        columns: [
            { data: 'aluno_nome', defaultContent: '-' },
            { data: 'instituicao', defaultContent: '-' },
            { data: 'endereco_instituicao', defaultContent: '-' },
            { data: 'cep_instituicao', defaultContent: '-' },
            { data: 'bairro_instituicao', defaultContent: '-' },
            { data: 'supervisor_nome', defaultContent: '-' },
            { data: 'supervisor_cress', defaultContent: '-' },
            { data: 'supervisor_regiao', defaultContent: '-' },
            { data: 'professor_nome', defaultContent: '-' }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    try {
        const initial = await fetchPlanilha();
        fillPeriodoSelect(initial.periodos, initial.periodoSelecionado);
        table.clear().rows.add(normalizeRows(initial.rows)).draw();
    } catch (error) {
        console.error('Error loading initial data:', error);
        $('#periodoFilter').html('<option value="">Erro ao carregar</option>');
    }

    $('#periodoFilter').on('change', async function () {
        const periodo = $('#periodoFilter').val();
        if (!periodo) {
            table.clear().draw();
            return;
        }
        try {
            const data = await fetchPlanilha(periodo);
            table.clear().rows.add(normalizeRows(data.rows)).draw();
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Falha ao carregar dados');
        }
    });
});
