import { getToken, hasRole, isAdmin, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    } else {
        // Se for aluno, não pode adicionar, editar e não pode ver as inscrições
        if (hasRole(['aluno'])) {
            document.getElementById('editRecordBtn').style.display = 'none';
            document.getElementById('newMuralBtn').style.display = 'none';
            document.getElementById('inscricoes-tab').style.display = 'none';
        }
    }

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'mural.html';
        return;
    }

    try {
        const response = await authenticatedFetch(`/mural/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch mural');
        }

        const mural = await response.json();

        // Helper function to format dates
        const formatDate = (date) => {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('pt-BR');
        };

        // Helper function to format selection method
        const formatFormaSelecao = (value) => {
            const map = { '0': 'Entrevista', '1': 'Análise de currículo', '2': 'Prova', '3': 'Outras' };
            return map[value] || 'N/A';
        };

        // Helper function to format shift
        const formatHorario = (value) => {
            const map = { 'D': 'Diurno', 'N': 'Noturno', 'I': 'Indeterminado' };
            return map[value] || 'N/A';
        };

        const formatLocalInscricao = (value) => {
            const map = {
                '0': 'Somente no mural da Coordenação de Estágio',
                '1': 'Diretamente na instituição e no mural da Coordenação de Estágio'
            };
            return map[value] || 'N/A';
        };

        // Populate fields
        document.getElementById('view-id').textContent = mural.id;
        document.getElementById('view-periodo').textContent = mural.periodo || 'N/A';
        document.getElementById('view-instituicao').textContent = mural.instituicao;
        if (mural.instituicao_id) {
            // Se não estiver logado, não pode ver o link do estágio
            document.getElementById('view-link-estagio').href = (getToken() == null) ? '#' : `/view-instituicao.html?id=${mural.instituicao_id}`;
        }
        document.getElementById('view-vagas').textContent = mural.vagas;
        document.getElementById('view-convenio').textContent = mural.convenio === '1' ? 'Sim' : 'Não';
        document.getElementById('view-carga_horaria').textContent = mural.cargaHoraria || 'N/A';
        document.getElementById('view-final_de_semana').textContent = mural.final_de_semana === 'S' ? 'Sim' : (mural.final_de_semana === 'N' ? 'Não' : 'N/A');
        document.getElementById('view-horario').textContent = formatHorario(mural.horario) || 'N/A';
        document.getElementById('view-beneficios').textContent = mural.beneficios || 'N/A';
        document.getElementById('view-requisitos').innerHTML = mural.requisitos ? marked.parse(mural.requisitos) : 'N/A';
        document.getElementById('view-data_inscricao').textContent = formatDate(mural.data_inscricao);
        document.getElementById('view-data_selecao').textContent = formatDate(mural.data_selecao);
        document.getElementById('view-horario_selecao').textContent = mural.horario_selecao || 'N/A';
        document.getElementById('view-local_selecao').textContent = mural.local_selecao || 'N/A';
        document.getElementById('view-forma_selecao').textContent = formatFormaSelecao(mural.forma_selecao);
        document.getElementById('view-local_inscricao').textContent = formatLocalInscricao(mural.local_inscricao);
        document.getElementById('view-contato').textContent = mural.contato || 'N/A';
        document.getElementById('view-email').textContent = mural.email || 'N/A';
        document.getElementById('view-outras').innerHTML = mural.outras ? marked.parse(mural.outras) : 'N/A';

        window.currentMuralId = id;
        await loadInscricoes(window.currentMuralId);

        // Hide buttons if not admin
        if (!isAdmin()) {
            document.getElementById('editRecordBtn').style.display = 'none';
            document.getElementById('newMuralBtn').style.display = 'none';
            document.getElementById('inscricoes-tab').style.display = 'none';
        }
        // Hide inscrever button if not logged in
        if (!getToken()) {
            document.getElementById('inscreverBtn').style.display = 'none';
        }

        // Hide button if today is after dataInscricao
        const dataInscricaoText = document.getElementById('view-data_inscricao').textContent;
        const dataInscricao = new Date(dataInscricaoText.split('/').reverse().join('-')); // Convert DD/MM/YYYY to YYYY-MM-DD
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare dates only

        if (today > dataInscricao) {
            document.getElementById('inscreverBtn').style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading mural:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'mural.html';
    }
});

window.editRecord = function () {
    window.location.href = `edit-mural.html?id=${window.currentMuralId}`;
};

window.inscrever = function () {
    window.location.href = `new-inscricao.html?muralestagio_id=${window.currentMuralId}`;
};

async function loadInscricoes(currentMuralId) {
    let table;
    table = $('#inscricoesTable').DataTable({
        order: [[3, 'desc'], [1, 'asc']],
        ajax: {
            url: `/mural/${currentMuralId}/inscricoes`,
            dataSrc: ''
        },
        columns: [
            { data: 'registro' },
            { data: 'aluno_nome' },
            {
                className: 'text-center',
                data: 'data_inscricao', render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return date.toLocaleDateString('pt-BR');
                }
            },
            {
                className: 'text-center',
                data: 'acoes', render: function (data, type, row) {
                    return `
                    <button onclick="window.location.href='view-inscricao.html?id=${row.inscricao_id}'" class="btn btn-sm btn-warning">Visualizar</button>
                    <button onclick="deleteInscricao(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
                `;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });
}

window.deleteInscricao = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta inscrição?: ' + id)) {
        await fetch(`/inscricoes/${id}`, { method: 'DELETE' });
        window.location.href = `view-mural.html?id=${window.currentMuralId}`;
    }
};

window.imprime = async () => {
    try {
        const muralId = window.currentMuralId;
        if (!muralId) {
            throw new Error('Mural inválido');
        }

        const jsPDF = window && window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
        if (!jsPDF) {
            throw new Error('jsPDF não carregado');
        }

        const response = await authenticatedFetch(`/mural/${muralId}/inscricoes`);
        if (!response.ok) {
            throw new Error('Falha ao carregar inscrições');
        }
        const inscricoes = await response.json();

        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 14;
        const marginTop = 16;
        const marginBottom = 14;

        const hoje = new Date();
        const dia = hoje.getDate();
        const mes = hoje.toLocaleString('pt-BR', { month: 'long' });
        const ano = hoje.getFullYear();

        const muralPeriodoEl = document.getElementById('view-periodo');
        const muralInstituicaoEl = document.getElementById('view-instituicao');
        const muralPeriodo = muralPeriodoEl ? muralPeriodoEl.textContent : '';
        const muralInstituicao = muralInstituicaoEl ? muralInstituicaoEl.textContent : '';

        doc.setFontSize(14);
        doc.text('Inscrições', marginX, marginTop);

        doc.setFontSize(10);
        doc.text(`Mural: ${muralId}`, marginX, marginTop + 6);
        if (muralPeriodo) doc.text(`Período: ${muralPeriodo}`, marginX, marginTop + 11);
        if (muralInstituicao) {
            const inst = doc.splitTextToSize(`Instituição: ${muralInstituicao}`, pageWidth - marginX * 2);
            doc.text(inst, marginX, marginTop + 16);
        }

        let y = marginTop + 26;
        const colRegistroX = marginX;
        const colAlunoX = marginX + 28;
        const colDataX = pageWidth - marginX - 30;

        const writeHeader = () => {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Registro', colRegistroX, y);
            doc.text('Aluno', colAlunoX, y);
            doc.text('Data', colDataX, y);
            doc.setFont('helvetica', 'normal');
            y += 6;
            doc.setDrawColor(180);
            doc.line(marginX, y - 4, pageWidth - marginX, y - 4);
        };

        writeHeader();

        const items = Array.isArray(inscricoes) ? inscricoes.slice() : [];
        items.sort((a, b) => String((a && a.aluno_nome) || '').localeCompare(String((b && b.aluno_nome) || ''), 'pt-BR'));

        for (const item of items) {
            const registro = String((item && item.registro) || '');
            const alunoNome = String((item && item.aluno_nome) || '');
            const data = item && item.data_inscricao ? new Date(item.data_inscricao).toLocaleDateString('pt-BR') : '';

            const alunoLines = doc.splitTextToSize(alunoNome, colDataX - colAlunoX - 2);
            const lineCount = Math.max(1, alunoLines.length);
            const rowHeight = lineCount * 5;

            if (y + rowHeight > pageHeight - marginBottom) {
                doc.addPage();
                y = marginTop;
                writeHeader();
            }

            doc.setFontSize(9);
            doc.text(registro, colRegistroX, y);
            doc.text(alunoLines, colAlunoX, y);
            doc.text(data, colDataX, y);
            y += rowHeight;
        }

        // Date
        const now = new Date();
        const ymd = now.toISOString().slice(0, 10);

        // Put the data at the bottom of the page aligned left
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Rio de Janeiro, ${dia} de ${mes} de ${ano}`, pageWidth - marginX, y + 10, { align: 'right' });

        // Assinatura at the bottom of the page
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(pageWidth / 2, y + 20, 'Coordenação do Estágio', { align: 'center' });
        doc.text(pageWidth / 2, y + 25, 'Escola de Serviço Social', { align: 'center' });
        doc.text(pageWidth / 2, y + 30, 'UFRJ', { align: 'center' });

        doc.save(`inscricoes_mural_${muralId}_${ymd}.pdf`);
    } catch (error) {
        console.error('Erro ao imprimir inscrições:', error);
        alert(`Erro ao imprimir inscrições: ${error.message}`);
    }
};
