// src/controllers/respostaController.js
import { getToken, hasRole, authenticatedFetch, getCurrentUser } from './auth-utils.js';

$(document).ready(async function () {
    let loadedQuestions = [];

    if (!getToken() || !hasRole(['admin', 'supervisor'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const estagiario_id = urlParams.get('estagiario_id');
    const questionario_id = urlParams.get('questionario_id') || 1;
    // Load questionario info
    try {
        const response = await authenticatedFetch(`/questionarios/`);
        if (!response.ok) {
            throw new Error('Failed to fetch questionario');
        }
        const questionarios = await response.json();
        // Make the questionarios selectable
        const questionarioSelect = document.getElementById('questionario_id');
        questionarios.forEach(questionario => {
            const option = document.createElement('option');
            option.value = questionario.id;
            option.textContent = questionario.title;
            if (questionario.id == questionario_id) {
                option.selected = true;
            }
            questionarioSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading questionario:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
    }

    // Load estagiario info
    try {
        const response = await authenticatedFetch(`/estagiarios/`);
        if (!response.ok) {
            throw new Error('Failed to fetch estagiario');
        }
        const estagiarios = await response.json();

        // Set estagiario info. It is not a select, but a view 
        const estagiarioSelect = document.getElementById('estagiario_id');

        estagiarios.forEach(estagiario => {
            const option = document.createElement('option');
            option.value = estagiario.id;
            option.textContent = estagiario.aluno_nome;
            if (estagiario.id == estagiario_id) {
                option.selected = true;
            }
            estagiarioSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading estagiario:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
    }

    // Put today data
    $('#data').val(new Date().toISOString().split('T')[0]);

    // Put periodo value from estagiario_id on select estagiario_id
    $('#estagiario_id').on('change', function () {
        const estagiario_id = $(this).val();
        $.ajax({
            url: `/estagiarios/${estagiario_id}`,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
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

    // Verifica se o estagario_id já foi avaliado para o questionario_id
    try {
        const response = await authenticatedFetch(`/respostas/estagiario/${estagiario_id}/questionario/${questionario_id}`);
        if (response.ok) {
            const text = await response.text();
            const trimmed = String(text || '').trim();
            if (trimmed) {
                const parsed = JSON.parse(trimmed);
                const data = Array.isArray(parsed) ? parsed : [parsed];
                if (data.length > 0 && data[0] && data[0].id) {
                    alert('Este estagiário já foi avaliado para este questionário.');
                    window.location.href = `view-resposta.html?id=${data[0].id}`;
                    return;
                }
            }
        }
    } catch (error) {
        console.warn('Error checking respostas:', error);
    }

    // Questions loading function
    function loadQuestions() {
        // const questionario_id = $(this).val();
        const questionario_id = $('#questionario_id').val();
        // console.log('Loading questions for questionario_id:', questionario_id);

        if (!questionario_id) {
            // console.log('No questionario_id selected');
            $('#questionsContainer').html('<p class="text-muted">Selecione um questionário para ver as questões.</p>');
            return;
        }

        $.ajax({
            url: `/questoes?questionario_id=${questionario_id}`,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            type: 'GET',
            success: function (questions) {
                // console.log('Loaded questions:', questions);
                loadedQuestions = questions;
                renderQuestions(questions);
            },
            error: function (xhr, status, error) {
                console.error('Error loading questions:', status, error);
                console.error('Response:', xhr.responseText);
                $('#questionsContainer').html('<p class="text-danger">Erro ao carregar questões.</p>');
                // Oculta o formulario se houver erro
                $('#newRespostaForm').css('display', 'none');
            }
        });
    }

    // Load questions on change of questionario_id or else load questions automatically when the page loads
    $('#questionario_id').on('change', loadQuestions).trigger('change');

    // Render questions based on type
    function renderQuestions(questions) {
        const container = $('#questionsContainer');
        container.empty();

        if (!questions || questions.length === 0) {
            container.html('<p class="text-muted">Nenhuma questão encontrada para este questionário.</p>');
            // Não mostra o formulario se não houver questões
            $('#newRespostaForm').css('display', 'none');
            return;
        }

        // Show the form since we have questions
        $('#newRespostaForm').css('display', 'block');

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
    function renderRadioOptions(question, questionId) {
        let options = parseOptions(question.options);
        let html = '';

        for (const [value, label] of Object.entries(options)) {
            html += `
                <label class="form-check-label ms-3">
                    <input type="radio" class="form-check-input ms-1" name="${questionId}" value="${value}">
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
                <label class="form-check-label">
                    <input type="checkbox" class="form-check-input me-1" name="${questionId}" value="${value}">
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
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function () {
                alert('Respostas salvas com sucesso!');
                window.location.href = 'view-resposta.html?estagiario_id=' + estagiario_id + '&questionario_id=' + questionario_id;
            },
            error: function () {
                alert('Erro ao salvar respostas.');
            }
        });
    });

    // Add empty evaluation PDF generation
    $('#btnImprimirVazia').on('click', function() {
        if (!loadedQuestions || loadedQuestions.length === 0) {
            alert('Não há questões carregadas para imprimir.');
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
        const questionarioName = $('#questionario_id option:selected').text();
        doc.text(questionarioName || 'Avaliação do Estagiário', 105, y, { align: 'center' });
        y += 15;
        
        let estagiarioName = $('#estagiario_id option:selected').text();
        if (!estagiarioName || estagiarioName.includes('Selecione')) {
            estagiarioName = 'Não selecionado';
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Estagiário(a): ${estagiarioName}`, 14, y);
        y += 10;
        
        doc.setFontSize(10);
        
        loadedQuestions.forEach((q, index) => {
            const cleanText = q.text ? q.text.replace(/<[^>]*>?/gm, '') : '';
            const textLines = doc.splitTextToSize(`Questão ${index + 1}: ${cleanText}`, 180);
            
            if (y + (textLines.length * 6) + 10 > 280) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFont('helvetica', 'bold');
            doc.text(textLines, 14, y);
            y += (textLines.length * 5) + 2;
            
            doc.setFont('helvetica', 'normal');
            
            if (q.type === 'radio' || q.type === 'checkbox' || q.type === 'select') {
                const options = parseOptions(q.options);
                for (const [val, label] of Object.entries(options)) {
                    if (y > 280) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.setDrawColor(0);
                    doc.rect(16, y - 3, 3, 3);
                    doc.text(`${label || val}`, 22, y);
                    y += 6;
                }
            } else if (q.type === 'long_text' || q.type === 'long text') {
                if (y + 30 > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.setDrawColor(200);
                doc.rect(14, y, 180, 25);
                y += 30;
            } else {
                if (y + 10 > 280) {
                    doc.addPage();
                    y = 20;
                }
                doc.setDrawColor(200);
                doc.line(14, y + 4, 194, y + 4);
                y += 10;
            }
            y += 4;
        });
        
        doc.save('avaliacao_vazia.pdf');
    });
});
