// src/controllers/respostaController.js
$(document).ready(async function () {

    const urlParams = new URLSearchParams(window.location.search);
    const estagiario_id = urlParams.get('estagiario_id');
    const questionario_id = urlParams.get('questionario_id');

    if (!estagiario_id || !questionario_id) {
        alert('Parâmetros inválidos. estagiario_id e questionario_id são obrigatórios.');
        return;
    }

    // Load estagiario info
    try {
        const response = await fetch(`/estagiarios/${estagiario_id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch estagiario');
        }
        const estagiarios = await response.json();
        console.log(estagiarios);
        // Make the estagiarios selectable
        const estagiarioSelect = document.getElementById('estagiario_id');
        estagiarios.forEach(estagiario => {
            const option = document.createElement('option');
            option.value = estagiario.id;
            option.textContent = estagiario.aluno_nome;
            estagiarioSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading estagiario:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
    }

    // Load questionario info
    try {
        const response = await fetch(`/questionarios/${questionario_id})`);
        if (!response.ok) {
            throw new Error('Failed to fetch questionario');
        }
        const questionarios = await response.json();
        console.log(questionarios);
        // Make the questionarios selectable
        const questionarioSelect = document.getElementById('questionario_id');
        questionarios.forEach(questionario => {
            const option = document.createElement('option');
            option.value = questionario.id;
            option.textContent = questionario.title;
            questionarioSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading questionario:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
    }

    // Put today data
    $('#data').val(new Date().toISOString().split('T')[0]);

    // Get questionario_id from URLPut periodo value from estagiario_id on select estagiario_id
    $('#estagiario_id').on('change', function () {
        const estagiario_id = $(this).val();
        $.ajax({
            url: `/estagiarios/${estagiario_id}`,
            type: 'GET',
            success: function (data) {
                $('#periodo').val(data.periodo);
                $('#registro').val(data.registro);
            },
            error: function () {
                $('#periodo').val('');
                $('#registro').val('');
            }
        });
    });

    // Load questions
    $('#questionario_id').on('change', function () {
        const questionario_id = $(this).val();
        $.ajax({
            url: `/questoes?questionario_id=${questionario_id}`,
            type: 'GET',
            success: function (questions) {
                renderQuestions(questions);
            },
            error: function () {
                $('#questionsContainer').html('<p class="text-danger">Erro ao carregar questões.</p>');
            }
        });
    });

    // Render questions based on type
    function renderQuestions(questions) {
        const container = $('#questionsContainer');
        container.empty();

        if (questions.length === 0) {
            container.html('<p class="text-muted">Nenhuma questão encontrada para este questionário.</p>');
            return;
        }

        questions.forEach((question, index) => {
            // Use avaliacao + ordem to match legacy data format
            const questionKey = `avaliacao${question.ordem || question.id}`;
            let inputHtml = '';

            switch (question.type) {
                case 'radio':
                    inputHtml = renderRadioOptions(question, questionKey);
                    break;
                case 'checkbox':
                    inputHtml = renderCheckboxOptions(question, questionKey);
                    break;
                case 'select':
                    inputHtml = renderSelectOptions(question, questionKey);
                    break;
                case 'short_text':
                case 'short text':
                    inputHtml = `<input type="text" class="form-control" name="${questionKey}">`;
                    break;
                case 'long_text':
                case 'long text':
                    inputHtml = `<textarea class="form-control" name="${questionKey}" rows="4"></textarea>`;
                    break;
                default:
                    inputHtml = `<input type="text" class="form-control" name="${questionKey}">`;
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
    function renderRadioOptions(question, questionId) {
        let options = parseOptions(question.options);
        let html = '';

        for (const [value, label] of Object.entries(options)) {
            html += `
                <label class="radio-option">
                    <input type="radio" name="${questionId}" value="${value}">
                    ${escapeHtml(label || value)}
                </label>
            `;
        }
        return html;
    }

    // Render checkbox options
    function renderCheckboxOptions(question, questionId) {
        let options = parseOptions(question.options);
        let html = '';
        for (const [value, label] of Object.entries(options)) {
            html += `
                <label class="checkbox-option">
                    <input type="checkbox" name="${questionId}" value="${value}">
                    ${escapeHtml(label || value)}
                </label>
            `;
        }
        return html;
    }

    // Render select options
    function renderSelectOptions(question, questionId) {
        let options = parseOptions(question.options);
        let html = `<select class="form-select" name="${questionId}"><option value="">Selecione...</option>`;

        for (const [value, label] of Object.entries(options)) {
            html += `<option value="${value}">${escapeHtml(label || value)}</option>`;
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
    $('#newRespostaForm').on('submit', function (e) {
        e.preventDefault();

        const formData = {};
        const form = this;

        // Collect all form data
        $(form).find('input, textarea, select').each(function () {
            const name = $(this).attr('name');
            if (!name) return;

            if ($(this).attr('type') === 'radio') {
                if ($(this).is(':checked')) {
                    formData[name] = $(this).val();
                }
            } else if ($(this).attr('type') === 'checkbox') {
                if (!formData[name]) formData[name] = [];
                if ($(this).is(':checked')) {
                    formData[name].push($(this).val());
                }
            } else {
                formData[name] = $(this).val();
            }
        });

        // Convert checkbox arrays to JSON strings
        for (const key in formData) {
            if (Array.isArray(formData[key])) {
                formData[key] = JSON.stringify(formData[key]);
            }
        }

        const questionario_id = $('#questionario_id').val();
        const estagiario_id = $('#estagiario_id').val();

        const payload = {
            questionario_id: questionario_id,
            estagiario_id: estagiario_id,
            response: formData
        };

        console.log(payload);

        // Create new
        $.ajax({
            url: '/respostas',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function () {
                alert('Respostas salvas com sucesso!');
                window.location.href = 'view-resposta.html/?estagiario_id=' + estagiario_id + '&questionario_id=' + questionario_id;
            },
            error: function () {
                alert('Erro ao salvar respostas.');
            }
        });
    });
});
