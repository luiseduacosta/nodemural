import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    function formatBrazilianDate(dateStr) {
        if (!dateStr) return '';

        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return String(dateStr);

        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = String(date.getFullYear());
        return `${dd}/${mm}/${yyyy}`;
    }

    async function fetchPlanilhaSeguro(periodo) {
        const url = periodo ? `/estagiarios/planilhaSeguro?periodo=${encodeURIComponent(periodo)}` : '/estagiarios/planilhaSeguro';
        const response = await authenticatedFetch(url, {
            method: 'GET',
        });
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
            ...r,
            nascimento: formatBrazilianDate(r.nascimento),
            id: r.id ?? '',
            nome: r.nome ?? '',
            cpf: r.cpf ?? '',
            registro: r.registro ?? '',
            nivel: r.nivel ?? '',
            ajuste2020: r.ajuste2020 ?? '',
            periodo: r.periodo ?? '',
            inicio: r.inicio ?? '',
            final: r.final ?? '',
        }));
    }

    let table = $('#planilha-seguro-table').DataTable({
        processing: true,
        serverSide: false,
        searching: true,
        paging: true,
        order: [[0, 'asc']],
        data: [],
        columns: [
            { data: 'id', defaultContent: '-' },
            { data: 'nome', defaultContent: '-' },
            { data: 'cpf', defaultContent: '-' },
            { data: 'nascimento', defaultContent: '-' },
            { data: 'registro', defaultContent: '-' },
            { data: 'nivel', defaultContent: '-' },
            { data: 'ajuste2020', render: (data) => data == 0 ? 'Não' : 'Sim', defaultContent: '-' },
            { data: 'periodo', defaultContent: '-' },
            { data: 'inicio', defaultContent: '-' },
            { data: 'final', defaultContent: '-' },
            { data: 'instituicao', defaultContent: '-' }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    try {
        const initial = await fetchPlanilhaSeguro();
        fillPeriodoSelect(initial.periodos, initial.periodoSelecionado);
        table.clear().rows.add(normalizeRows(initial.t_seguro)).draw();
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
            const data = await fetchPlanilhaSeguro(periodo);
            table.clear().rows.add(normalizeRows(data.t_seguro)).draw();
        } catch (error) {
            console.error('Error loading data:', error);
            alert('Falha ao carregar dados');
        }
    });
});
