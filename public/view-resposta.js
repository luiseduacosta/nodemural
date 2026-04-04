// src/controllers/respostaController.js
import { getToken, hasRole, getCurrentUser } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const estagiario_id = urlParams.get('estagiario_id');
    const questionario_id = urlParams.get('questionario_id');

    if (!estagiario_id || !questionario_id) {
        alert('Parâmetros inválidos. estagiario_id e questionario_id são obrigatórios.');
        window.location.href = 'respostas.html';
        return;
    }

    // Set back button href for supervisor
    if (hasRole(['supervisor'])) {
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.href = 'view-supervisor.html?id=' + getCurrentUser().entidade_id;
        }
    }

    // Hide edit/delete buttons for aluno
    if (hasRole(['aluno'])) {
        $('button:contains("Editar")').hide();
        $('button:contains("Excluir")').hide();
    }

    let existingResponses = {};
    // Load existing respostas
    let existingResponsesObj;
    // Load existing respostas
    function loadRespostas() {
        $.ajax({
            url: `/respostas/estagiario/${estagiario_id}/questionario/${questionario_id}`,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            type: 'GET',
            success: function (data) {

                document.getElementById('alunoNome').textContent = data.aluno_nome;
                document.getElementById('supervisorNome').textContent = data.supervisor_nome;
                document.getElementById('createdData').innerHTML = (new Date(data.created)).toLocaleDateString('pt-BR');
                document.getElementById('modifiedData').innerHTML = (new Date(data.modified)).toLocaleDateString('pt-BR');

                existingResponses = data.response || {};
                // console.log(existingResponses);
                existingResponsesObj = JSON.parse(existingResponses);
                for (const [key, value] of Object.entries(existingResponsesObj)) {
                    const container = $('#respostasContainer');
                    const questionCard = `
                    <div class="card mt-3">
                        <div class="card-header bg-secondary text-white">Questão ${key}</div>
                        <div class="card-body">${escapeHtml(value.pergunta)}</div>
                        <div class="card-footer">
                            <div class="fw-bold mb-1">Resposta: ${escapeHtml(value.valor)}</div>
                            <div class="text-danger">${escapeHtml(value.texto_valor)}</div>
                            </div>
                    </div>
                    </div>
                `;
                    container.append(questionCard);
                    $('#questionarioTitle').remove();
                    $('.text-muted').remove();
                    $('#statusBadge').removeClass('bg-secondary').addClass('bg-success').text('Respondida');
                }
            },
            error: function () {
                $('#respostasContainer').html('<p class="text-muted">Nenhuma resposta encontrada para este questionário.</p>');
                $('#statusBadge').removeClass('bg-secondary').addClass('bg-warning').text('Novo');
                window.location.href = 'view-estagiario.html?id=' + estagiario_id;
                return;
            }
        });
    }
    loadRespostas();
    // return;

    // Escape HTML
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        if (typeof text === 'object') {
            try {
                return escapeHtml(JSON.stringify(text));
            } catch (_) {
                return escapeHtml(String(text));
            }
        }
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // Add filled evaluation PDF generation
    $('#btnImprimirPreenchida').on('click', function () {
        if (!existingResponsesObj || Object.keys(existingResponsesObj).length === 0) {
            alert('Não há respostas carregadas para imprimir.');
            return;
        }

        const jsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
        if (!jsPDF) {
            alert('Erro: biblioteca jsPDF não carregada.');
            return;
        }

        const doc = new jsPDF();

        let y = 20;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Avaliação do Estagiário', 105, y, { align: 'center' });
        y += 15;

        const estagiarioName = document.getElementById('alunoNome').textContent || 'Não informado';
        const supervisorNome = document.getElementById('supervisorNome').textContent || 'Não informado';

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Estagiário(a): ${estagiarioName}`, 14, y);
        y += 8;
        doc.text(`Supervisor(a): ${supervisorNome}`, 14, y);
        y += 12;

        doc.setFontSize(10);

        for (const [key, q] of Object.entries(existingResponsesObj)) {
            const cleanText = q.pergunta ? q.pergunta.replace(/<[^>]*>?/gm, '') : '';
            const indexText = `Questão ${key}: ${cleanText}`;
            const textLines = doc.splitTextToSize(indexText, 180);

            if (y + (textLines.length * 6) + 20 > 280) {
                doc.addPage();
                y = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.text(textLines, 14, y);
            y += (textLines.length * 5) + 2;

            doc.setFont('helvetica', 'normal');

            // Write the answer
            const answerText = `Resposta: ${q.valor || 'Não respondido'}`;
            const answerLines = doc.splitTextToSize(answerText, 180);
            doc.text(answerLines, 14, y);
            y += (answerLines.length * 5);

            if (q.texto_valor) {
                doc.setTextColor(220, 53, 69); // Bootstrap danger color
                const textoValorLines = doc.splitTextToSize(q.texto_valor, 180);
                doc.text(textoValorLines, 14, y);
                y += (textoValorLines.length * 5);
                doc.setTextColor(0, 0, 0); // Reset color
            }

            y += 6;
        }

        // Signature block
        if (y + 40 > 280) {
            doc.addPage();
            y = 20;
        } else {
            y += 15;
        }

        const meses = [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
            'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        const hoje = new Date();
        const dia = hoje.getDate();
        const mes = meses[hoje.getMonth()];
        const ano = hoje.getFullYear();

        doc.setFontSize(12);
        doc.text(`Rio de Janeiro, ${dia} de ${mes} de ${ano}.`, 105, y, { align: 'center' });
        y += 20;

        doc.setLineWidth(0.5);
        doc.line(65, y, 145, y); // Signature line
        y += 6;
        doc.text(supervisorNome, 105, y, { align: 'center' });
        doc.text('Supervisor(a)', 105, y + 6, { align: 'center' });

        doc.save('avaliacao_preenchida.pdf');
    });

});
