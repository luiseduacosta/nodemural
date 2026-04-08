import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {
    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    async function fetchPlanilha() {
        const response = await authenticatedFetch('/estagiarios/planilhaCargaHoraria', { method: 'GET' });
        if (!response.ok) {
            throw new Error(await response.text());
        }
        return response.json();
    }
    
    function normalizeRows(rows) {
        return (rows || []).map((r) => ({
            aluno_id: r.aluno_id ?? '',
            aluno_nome: r.aluno_nome ?? '',
            aluno_registro: r.aluno_registro ?? '',
            estagiarios_count: r.estagiarios_count ?? 0,
            nivel1: r.nivel1 ?? '',
            nivel1_periodo: r.nivel1_periodo ?? '',
            nivel1_ch: r.nivel1_ch ?? '',
            nivel2: r.nivel2 ?? '',
            nivel2_periodo: r.nivel2_periodo ?? '',
            nivel2_ch: r.nivel2_ch ?? '',
            nivel3: r.nivel3 ?? '',
            nivel3_periodo: r.nivel3_periodo ?? '',
            nivel3_ch: r.nivel3_ch ?? '',
            nivel4: r.nivel4 ?? '',
            nivel4_periodo: r.nivel4_periodo ?? '',
            nivel4_ch: r.nivel4_ch ?? '',
            ch_total: r.ch_total ?? 0
        }));
    }
    
    const table = $('#planilha-carga-horaria-table').DataTable({
        processing: true,
        serverSide: false,
        searching: true,
        paging: true,
        order: [[0, 'asc']],
        data: [],
        columns: [
            {
                data: 'aluno_nome',
                render: (data, type, row) => {
                    const nome = data || '-';
                    const alunoId = row?.aluno_id;
                    if (!alunoId) return nome;
                    return `<a href="view-aluno.html?id=${encodeURIComponent(alunoId)}">${nome}</a>`;
                },
                defaultContent: '-'
            },
            { data: 'aluno_registro', defaultContent: '-' },
            { data: 'estagiarios_count', defaultContent: '0' },
            { data: 'nivel1', defaultContent: '-' },
            { data: 'nivel1_periodo', defaultContent: '-' },
            { data: 'nivel1_ch', defaultContent: '-' },
            { data: 'nivel2', defaultContent: '-' },
            { data: 'nivel2_periodo', defaultContent: '-' },
            { data: 'nivel2_ch', defaultContent: '-' },
            { data: 'nivel3', defaultContent: '-' },
            { data: 'nivel3_periodo', defaultContent: '-' },
            { data: 'nivel3_ch', defaultContent: '-' },
            { data: 'nivel4', defaultContent: '-' },
            { data: 'nivel4_periodo', defaultContent: '-' },
            { data: 'nivel4_ch', defaultContent: '-' },
            { data: 'ch_total', defaultContent: '0' }
        ],language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });

    try {
        const data = await fetchPlanilha();
        table.clear().rows.add(normalizeRows(data.rows)).draw();
    } catch (error) {
        console.error('Error loading planilha:', error);
        alert('Falha ao carregar dados');
    }
});
