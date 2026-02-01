// src/controllers/estagiarioController.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'estagiarios.html';
        return;
    }

    try {
        const response = await fetch(`/estagiarios/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch estagiario');
        }

        const estagiario = await response.json();
        console.log(estagiario);
        // Nivel display
        let nivelDisplay = estagiario.nivel;
        if (estagiario.nivel == 9) {
            nivelDisplay = '9 - Continuação (própria conta)';
        }

        // Populate fields
        document.getElementById('view-id').textContent = estagiario.id;
        document.getElementById('view-nivel').textContent = nivelDisplay;
        document.getElementById('view-aluno').textContent = estagiario.aluno_nome || '-';
        document.getElementById('view-aluno-link').href = `view-alunos.html?id=${estagiario.aluno_id}`;
        document.getElementById('view-registro').textContent = estagiario.aluno_registro || '-';
        document.getElementById('view-instituicao').textContent = estagiario.instituicao_nome || '-';
        document.getElementById('view-professor').textContent = estagiario.professor_nome || '-';
        document.getElementById('view-supervisor').textContent = estagiario.supervisor_nome || '-';
        document.getElementById('view-periodo').textContent = estagiario.periodo || '-';
        document.getElementById('view-turma').textContent = estagiario.turma_nome || '-';
        document.getElementById('view-observacoes').textContent = estagiario.observacoes || '-';

        window.currentEstagioId = id;

        // Load atividades
        try {
            const atividadesResponse = await fetch(`/atividades?estagiario_id=${id}`);
            if (atividadesResponse.ok) {
                const atividades = await atividadesResponse.json();
                const tbody = document.getElementById('table-atividades');
                tbody.innerHTML = '';
                if (atividades.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhuma atividade registrada</td></tr>';
                } else {
                    atividades.forEach(atividade => {
                        console.log(atividade);
                        const row = tbody.insertRow();
                        row.insertCell(0).innerText = atividade.id || '-';
                        row.insertCell(1).innerText = atividade.dia ? new Date(atividade.dia).toLocaleDateString('pt-BR') : '-';
                        row.insertCell(2).innerText = atividade.atividade || '-';
                        row.insertCell(3).innerText = atividade.inicio || '-';
                        row.insertCell(4).innerText = atividade.final || '-';
                        row.insertCell(5).innerText = atividade.horario || '-';

                        const actionsCell = row.insertCell(6);
                        actionsCell.innerHTML = `<button class="btn btn-sm btn-primary" onclick="viewAtividade(${atividade.id})">Ver</button>`;
                    });
                }
            }
        } catch (error) {
            console.error('Error loading atividades:', error);
        }
    } catch (error) {
        console.error('Error loading estagiario:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'estagiarios.html';
    }
});

$(document).ready(function () {

    const urlParams = new URLSearchParams(window.location.search);
    const estagiario_id = urlParams.get('id');
    let questionario_id = urlParams.get('questionario_id');

    if (!questionario_id) {
        questionario_id = 1;
    }

    if (!estagiario_id || !questionario_id) {
        alert('Parâmetros inválidos. estagiario_id e questionario_id são obrigatórios.');
        window.location.href = 'respostas.html';
        return;
    }

    let existingResposta = null;
    let existingResponses = {};

    // Load questionario info
    $.ajax({
        url: `/questionarios/${questionario_id}`,
        type: 'GET',
        success: function (data) {
            $('#questionarioTitle').text(data.title);
        },
        error: function () {
            $('#questionarioTitle').text('Questionário não encontrado');
        }
    });

    // Load estagiario info
    $.ajax({
        url: `/estagiarios/${estagiario_id}`,
        type: 'GET',
        success: function (data) {
            $('#alunoNome').text(data.aluno_nome || 'Não informado');
            $('#supervisorNome').text(data.supervisor_nome || 'Não informado');
        }
    });

    // Load existing resposta (if any)
    $.ajax({
        url: `/respostas/estagiario/${estagiario_id}/questionario/${questionario_id}`,
        type: 'GET',
        success: function (data) {
            existingResposta = data;
            existingResponses = typeof data.response === 'string'
                ? JSON.parse(data.response)
                : data.response;
            $('#statusBadge').removeClass('bg-secondary').addClass('bg-success').text('Já respondido');
            loadQuestions();
        },
        error: function () {
            $('#statusBadge').removeClass('bg-secondary').addClass('bg-warning').text('Sem avaliação');
            $('#respostasContainer').empty();
            // window.location.href = 'new-resposta.html?estagiario_id=' + estagiario_id + '&questionario_id=' + questionario_id;
            return;
        }
    });

    // Load questions
    function loadQuestions() {
        $.ajax({
            url: `/questoes?questionario_id=${questionario_id}`,
            type: 'GET',
            success: function (questions) {
                renderQuestions(questions);
            },
            error: function () {
                $('#respostasContainer').html('<p class="text-danger">Erro ao carregar questões.</p>');
            }
        });
    }

    // Render questions based on type
    function renderQuestions(questions) {
        const container = $('#respostasContainer');
        container.empty();

        if (questions.length === 0) {
            container.html('<p class="text-muted">Nenhuma questão encontrada para este questionário.</p>');
            return;
        }

        questions.forEach((question, index) => {
            const questionKey = `avaliacao${question.ordem || question.id}`;
            const existingValue = existingResponses[questionKey] || '';

            let inputHtml = '';

            switch (question.type) {
                case 'radio':
                    inputHtml = renderRadioOptions(question, questionKey, existingValue);
                    break;
                case 'checkbox':
                    inputHtml = renderCheckboxOptions(question, questionKey, existingValue);
                    break;
                case 'select':
                    inputHtml = renderSelectOptions(question, questionKey, existingValue);
                    break;
                case 'short_text':
                case 'short text':
                    inputHtml = `<input type="text" class="form-control" name="${questionKey}" value="${escapeHtml(existingValue)}">`;
                    break;
                case 'long_text':
                case 'long text':
                    inputHtml = `<textarea class="form-control" name="${questionKey}" rows="4">${escapeHtml(existingValue)}</textarea>`;
                    break;
                default:
                    inputHtml = `<input type="text" class="form-control" name="${questionKey}" value="${escapeHtml(existingValue)}">`;
            }

            const questionCard = `
                <div class="question-card">
                    <div class="question-number">Questão ${index + 1}</div>
                    <div class="question-text">${escapeHtml(question.text)}</div>
                    ${inputHtml}
                </div>
            `;
            container.append(questionCard);
        });
    }

    // Render radio options
    function renderRadioOptions(question, questionId, existingValue) {
        let options = parseOptions(question.options);
        let html = '';

        for (const [value, label] of Object.entries(options)) {
            const checked = existingValue === value ? 'checked' : '';
            html += `
                <label class="radio-option">
                    <input type="radio" name="${questionId}" value="${value}" ${checked}>
                    ${escapeHtml(label || value)}
                </label>
            `;
        }
        return html;
    }

    // Render checkbox options
    function renderCheckboxOptions(question, questionId, existingValue) {
        let options = parseOptions(question.options);
        let selectedValues = [];
        try {
            selectedValues = Array.isArray(existingValue) ? existingValue : JSON.parse(existingValue || '[]');
        } catch { selectedValues = []; }

        let html = '';
        for (const [value, label] of Object.entries(options)) {
            const checked = selectedValues.includes(value) ? 'checked' : '';
            html += `
                <label class="checkbox-option">
                    <input type="checkbox" name="${questionId}" value="${value}" ${checked}>
                    ${escapeHtml(label || value)}
                </label>
            `;
        }
        return html;
    }

    // Render select options
    function renderSelectOptions(question, questionId, existingValue) {
        let options = parseOptions(question.options);
        let html = `<select class="form-select" name="${questionId}"><option value="">Selecione...</option>`;

        for (const [value, label] of Object.entries(options)) {
            const selected = existingValue === value ? 'selected' : '';
            html += `<option value="${value}" ${selected}>${escapeHtml(label || value)}</option>`;
        }
        html += '</select>';
        return html;
    }

    // Parse options (can be array or object)
    function parseOptions(optionsStr) {
        if (!optionsStr) return {};
        try {
            const parsed = JSON.parse(optionsStr);
            if (Array.isArray(parsed)) {
                // Convert array to object
                const obj = {};
                parsed.forEach((item, index) => {
                    if (typeof item === 'string' && item.includes(':')) {
                        const [key, ...valueParts] = item.split(':');
                        obj[key.trim()] = valueParts.join(':').trim();
                    } else {
                        obj[index] = item;
                    }
                });
                return obj;
            }
            return parsed;
        } catch {
            return {};
        }
    }

    // Escape HTML
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // Expose edit and delete functions to global scope
    window.editResposta = function () {
        window.location.href = 'edit-resposta.html?estagiario_id=' + estagiario_id + '&questionario_id=' + questionario_id;
    };

    window.deleteResposta = async function () {
        if (confirm('Tem certeza que deseja excluir esta resposta?')) {
            try {
                // First get the resposta ID
                const resposta = await fetch(`/respostas/estagiario/${estagiario_id}/questionario/${questionario_id}`);
                const data = await resposta.json();

                const response = await fetch(`/respostas/${data.id}`, { method: 'DELETE' });
                if (response.ok) {
                    alert('Resposta excluída com sucesso!');
                    window.location.href = 'respostas.html';
                } else {
                    throw new Error('Failed to delete resposta');
                }
            } catch (error) {
                console.error('Error deleting resposta:', error);
                alert(`Erro ao excluir resposta: ${error.message}`);
            }
        }
    };
});
