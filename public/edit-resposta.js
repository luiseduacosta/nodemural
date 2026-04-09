// src/controllers/respostaController.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'supervisor'])) {
        window.location.href = 'login.html';
        return;
    }

    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const estagiario_id = urlParams.get('estagiario_id');
    const questionario_id = urlParams.get('questionario_id');

    if (!estagiario_id || !questionario_id) {
        alert('Parâmetros inválidos. estagiario_id e questionario_id são obrigatórios.');
        window.location.href = 'respostas.html';
        return;
    }

    let existingResposta = null;
    let existingResponses = {};
    let loadedQuestions = [];

    // Load questionario info
    $.ajax({
        url: `/questionarios/${questionario_id}`,
        type: 'GET',
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
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
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        success: function (data) {
            $('#alunoNome').text(data.aluno_nome || 'Não informado');
            $('#supervisorNome').text(data.supervisor_nome || 'Não informado');
        }
    });

    // Load existing resposta (if any)
    $.ajax({
        url: `/respostas/estagiario/${estagiario_id}/questionario/${questionario_id}`,
        type: 'GET',
        headers: {
            'Authorization': `Bearer ${getToken()}`
        },
        success: function (data) {
            existingResposta = data;
            existingResponses = typeof data.response === 'string'
                ? JSON.parse(data.response)
                : data.response;
            $('#statusBadge').removeClass('bg-secondary').addClass('bg-success').text('Já respondido');
            loadQuestions();
        },
        error: function () {
            $('#statusBadge').removeClass('bg-secondary').addClass('bg-warning').text('Novo');
            window.location.href = 'new-resposta.html?estagiario_id=' + estagiario_id + '&questionario_id=' + questionario_id;
        }
    });

    // Load questions
    function loadQuestions() {
        $.ajax({
            url: `/questoes?questionario_id=${questionario_id}`,
            type: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            success: function (questions) {
                loadedQuestions = questions;
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
            // Use avaliacao + ordem to match legacy data format
            const questionKey = `avaliacao${question.ordem || question.id}`;
            const respData = existingResponses[questionKey];
            const existingValue = (respData && respData.valor !== undefined) ? respData.valor : (respData || '');

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
                <div class="card mt-3">
                    <div class="card-header bg-secondary text-white">Questão ${index + 1}</div>
                    <div class="card-body">${escapeHtml(question.text)}</div>
                    <div class="form-check-inline ms-3">
                    ${inputHtml}
                    </div>
                    <div class="card-footer mt-2 text-muted"></div>
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
                 <label class="form-check-label ms-3">
                    <input type="radio" class="form-check-input ms-1" name="${questionId}" value="${value}" ${checked}>
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
            if (typeof existingValue === 'string') {
                if (existingValue.startsWith('[')) {
                    selectedValues = JSON.parse(existingValue);
                } else {
                    selectedValues = existingValue.split(',').map(s => s.trim()).filter(s => s);
                }
            } else if (Array.isArray(existingValue)) {
                selectedValues = existingValue;
            }
        } catch { selectedValues = []; }

        let html = '';
        for (const [value, label] of Object.entries(options)) {
            const checked = selectedValues.includes(value) ? 'checked' : '';
            html += `
                <label class="checkbox-option">
                    <input type="checkbox" class="form-check-input me-1" name="${questionId}" value="${value}" ${checked}>
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

    // Form submission
    $('#questionarioForm').on('submit', function (e) {
        e.preventDefault();

        const formData = {};
        const form = this;

        // Collect all form data using loadedQuestions to get question texts and options
        loadedQuestions.forEach(question => {
            const questionKey = `avaliacao${question.ordem || question.id}`;
            const inputElement = $(form).find(`[name="${questionKey}"]`);
            if (inputElement.length === 0) return;

            let valor = null;
            let texto_valor = null;

            if (question.type === 'radio') {
                const checked = inputElement.filter(':checked');
                if (checked.length) {
                    valor = checked.val();
                    const options = parseOptions(question.options);
                    texto_valor = options[valor] || valor;
                }
            } else if (question.type === 'checkbox') {
                const checked = inputElement.filter(':checked');
                if (checked.length) {
                    const valuesArr = [];
                    const textsArr = [];
                    const options = parseOptions(question.options);
                    checked.each(function() {
                        const val = $(this).val();
                        valuesArr.push(val);
                        textsArr.push(options[val] || val);
                    });
                    valor = valuesArr.join(', ');
                    texto_valor = textsArr.join(', ');
                }
            } else if (question.type === 'select') {
                const selected = inputElement.find('option:selected');
                if (selected.length && selected.val() !== "") {
                    valor = selected.val();
                    texto_valor = selected.text();
                }
            } else {
                valor = inputElement.val();
                texto_valor = valor;
            }

            // Only add if the user provided an answer
            if (valor !== null && valor !== undefined && valor !== "") {
                formData[questionKey] = {
                    pergunta: question.text,
                    valor: valor,
                    texto_valor: texto_valor
                };
            }
        });

        // Create payload
        const payload = {
            questionario_id: questionario_id,
            estagiario_id: estagiario_id,
            response: formData,
            modified: new Date().toISOString()
        };

        if (existingResposta) {
            // Update existing
            $.ajax({
                url: `/respostas/${existingResposta.id}`,
                type: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                contentType: 'application/json',
                data: JSON.stringify(payload),
                success: function () {
                    alert('Respostas atualizadas com sucesso!');
                    window.location.href = `view-resposta.html?estagiario_id=${estagiario_id}&questionario_id=${questionario_id}`;
                },
                error: function () {
                    alert('Erro ao atualizar respostas.');
                }
            });
        }
    });
});
