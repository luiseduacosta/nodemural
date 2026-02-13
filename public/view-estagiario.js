// public/view-estagiario.js
import { getToken, hasRole, authenticatedFetch, isAdmin, getCurrentUser } from './auth-utils.js';

$(document).ready(async function () {
    // Only admin, aluno, supervisor and docente can access this page
    if (!getToken() || !hasRole(['admin', 'aluno', 'supervisor', 'docente'])) {
        window.location.href = 'login.html';
        return;
    }

    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    let questionario_id = urlParams.get('questionario_id') || 1; // This value maybe be stored in the config record.

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'estagiarios.html';
        return;
    }

    // Constant that we use along the code to identify the current aluno ID
    const currentAlunoId = getCurrentUser().entidade_id;

    // Initialization state
    let existingResposta = null;
    let existingResponses = {};

    try {
        // 1. Load Estagiario Details
        let estagiarioResponse = await authenticatedFetch(`/estagiarios/${id}`);
        if (!estagiarioResponse.ok) {
            throw new Error('Failed to fetch estagiario details');
        }
        const estagiario = await estagiarioResponse.json();

        // Nivel display
        let nivelDisplay = estagiario.nivel;
        if (estagiario.nivel == 9) {
            nivelDisplay = '9 - Não obrigatório';
        }

        // Populate header/info fields
        document.getElementById('view-id').textContent = estagiario.id;
        document.getElementById('view-nivel').textContent = nivelDisplay;
        document.getElementById('view-aluno').textContent = estagiario.aluno_nome || '-';
        document.getElementById('view-aluno-link').href = `view-aluno.html?id=${estagiario.aluno_id}`;
        document.getElementById('view-registro').textContent = estagiario.aluno_registro || '-';
        document.getElementById('view-instituicao').textContent = estagiario.instituicao_nome || '-';
        document.getElementById('view-professor').textContent = estagiario.professor_nome || '-';
        document.getElementById('view-supervisor').textContent = estagiario.supervisor_nome || '-';
        document.getElementById('view-periodo').textContent = estagiario.periodo || '-';
        document.getElementById('view-turma').textContent = estagiario.turma_nome || '-';

        // Turno display
        const turnoMap = { 'D': 'Diurno', 'N': 'Noturno', 'A': 'Diurno/Noturno' };
        document.getElementById('view-turno').textContent = turnoMap[estagiario.turno] || estagiario.turno || '-';
        document.getElementById('view-ajuste2020').textContent = estagiario.ajuste2020 !== null ? estagiario.ajuste2020 : '-';

        document.getElementById('view-observacoes').textContent = estagiario.observacoes || '-';

        // Update evaluation session labels
        $('#alunoNome').text(estagiario.aluno_nome || 'Não informado');
        $('#supervisorNome').text(estagiario.supervisor_nome || 'Não informado');

        window.currentEstagioId = id;
        window.currentAlunoId = estagiario.aluno_id || currentAlunoId;

        // Hide delete buttons if user is not Admin
        if (!isAdmin()) {
            document.getElementById('delete-estagiario').style.display = 'none';
        }

        // Show edit button if user is admin or the user is the same as the estagiario
        if (isAdmin() || (getCurrentUser().role === 'aluno' && getCurrentUser().entidade_id === currentAlunoId)) {
            document.getElementById('edit-estagiario').style.display = 'block';
        } else {
            document.getElementById('edit-estagiario').style.display = 'none';
        }

        // 2. Load Atividades
        try {
            const atividadesResponse = await authenticatedFetch(`/estagiarios/${id}/atividades`);
            if (atividadesResponse.ok) {
                const atividades = await atividadesResponse.json();
                const tbody = document.getElementById('atividades-table-body');
                tbody.innerHTML = '';

                if (!atividades || atividades.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="text-center"><a class="btn btn-primary" href="new-atividade.html?estagiario_id=' + id + '">Adicionar atividade</a></td></tr>';
                } else {
                    let totalMinutes = 0;
                    atividades.forEach(atividade => {
                        const horarioParts = atividade.horario.split(':');
                        const hours = parseInt(horarioParts[0]) || 0;
                        const minutes = parseInt(horarioParts[1]?.replace('m', '')) || 0;
                        totalMinutes += (hours * 60) + minutes;
                    });
                    const totalHours = Math.floor(totalMinutes / 60);
                    const remainingMinutes = totalMinutes % 60;
                    const totalFormatted = `${totalHours}h ${remainingMinutes}m`;

                    atividades.forEach(atividade => {
                        const row = tbody.insertRow();
                        row.insertCell(0).innerText = atividade.id || '-';
                        row.insertCell(1).innerText = atividade.atividade || '-';
                        row.insertCell(2).innerText = atividade.dia ? new Date(atividade.dia).toLocaleDateString('pt-BR') : '-';
                        row.insertCell(3).innerText = atividade.inicio || '-';
                        row.insertCell(4).innerText = atividade.final || '-';
                        row.insertCell(5).innerText = atividade.horario || '-';

                        const actionsCell = row.insertCell(6);
                        actionsCell.innerHTML = `<button class="btn btn-sm btn-primary" onclick="window.location.href='view-atividade.html?id=${atividade.id}'">Ver</button>`;
                    });
                    tbody.insertRow().innerHTML = `<tr><td colspan="5">Total Horas</td><td>${totalFormatted}</td></tr>`;
                }
            }
        } catch (error) {
            console.error('Error loading atividades:', error);
        }

        // 3. Load Questionario Title
        try {
            const qResponse = await authenticatedFetch(`/questionarios/${questionario_id}`);
            if (qResponse.ok) {
                const questionario = await qResponse.json();
                $('#questionarioTitle').text(questionario.title);
            }
        } catch (error) {
            console.error('Error loading questionario:', error);
            $('#questionarioTitle').text('Questionário');
        }

        // 4. Load Existing Resposta (Evaluation)
        try {
            const respostaResponse = await authenticatedFetch(`/respostas/estagiario/${id}/questionario/${questionario_id}`);

            if (respostaResponse.ok) {
                const resposta = await respostaResponse.json();
                existingResposta = resposta;
                existingResponses = typeof resposta.response === 'string'
                    ? JSON.parse(resposta.response)
                    : resposta.response;

                $('#statusBadge').removeClass('bg-secondary bg-warning').addClass('bg-success').text('Já avaliado');
                loadQuestions();
            } else if (respostaResponse.status === 404) {
                // Not a real error, just no evaluation yet
                $('#statusBadge').removeClass('bg-secondary bg-success').addClass('bg-warning').text('Sem avaliação');
                $('#respostasContainer').empty();
            } else {
                throw new Error(`Server returned ${respostaResponse.status}`);
            }
        } catch (error) {
            console.error('Error loading evaluation status:', error);
            $('#statusBadge').removeClass('bg-success bg-warning').addClass('bg-secondary').text('Erro ao verificar');
        }

        // 5. Load fields nota e ch from estagiarios
        const estagiarioDetailsResponse = await authenticatedFetch(`/estagiarios/${id}`);
        if (estagiarioDetailsResponse.ok) {
            const estagiarioDetails = await estagiarioDetailsResponse.json();
            document.getElementById('view-professorNome').textContent = estagiarioDetails.professor_nome !== null ? estagiarioDetails.professor_nome : '-';
            document.getElementById('view-nota').textContent = estagiarioDetails.nota !== null ? estagiarioDetails.nota : '-';
            document.getElementById('view-ch').textContent = estagiarioDetails.ch !== null ? estagiarioDetails.ch : '-';
        } else {
            $('#statusAvaliacaoDocente').removeClass('bg-secondary bg-success').addClass('bg-warning').text('Sem avaliação docente');
        }

    } catch (error) {
        console.error('Core data load error:', error);
        alert(`Erro ao carregar dados do estágio: ${error.message}`);
        // window.location.href = 'estagiarios.html';
    }

    // Helper: Load questions for display
    async function loadQuestions() {
        if (!existingResposta) return;

        try {
            const questionsResponse = await authenticatedFetch(`/questoes?questionario_id=${questionario_id}`);
            if (questionsResponse.ok) {
                const questions = await questionsResponse.json();
                renderQuestions(questions);
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            $('#respostasContainer').html('<p class="text-danger">Erro ao carregar questões.</p>');
        }
    }

    // Render questions (read-only style for view page)
    async function renderQuestions(questions) {
        const container = $('#respostasContainer');
        container.empty();

        if (!questions || questions.length === 0) {
            container.html('<p class="text-muted">Nenhuma questão encontrada.</p>');
            return;
        }

        // Check if user is admin or supervisor once before the loop
        let canEdit = isAdmin();
        if (!canEdit && getCurrentUser().role === 'supervisor') {
            try {
                const estagiariosResponse = await authenticatedFetch(`/estagiarios?supervisor_id=${getCurrentUser().id}`);
                if (estagiariosResponse.ok) {
                    const estagiarios = await estagiariosResponse.json();
                    canEdit = estagiarios.some(e => e.id == id);
                }
            } catch (error) {
                console.error('Error checking permissions:', error);
            }
        }

        questions.forEach((question, index) => {
            const questionKey = `avaliacao${question.ordem || question.id}`;
            const value = existingResponses[questionKey] || 'Não respondido';

            let questionCard = `
                <div class="question-card mb-3 p-3 border rounded">
                    <div class="fw-bold mb-1 text-primary">Questão ${index + 1}</div>
                    <div class="mb-2">${escapeHtml(question.text)}</div>
                    <div class="p-2 bg-light rounded shadow-sm">
                        <strong>Resposta:</strong> ${escapeHtml(value)}
                    </div>
                </div>
            `;

            // Put an edit button if the user is admin or supervisor owns this estagiario
            if (canEdit) {
                // Pointing to the edit-resposta.html with correct params
                questionCard = `
                    <div class="question-card mb-3 p-3 border rounded">
                        <div class="fw-bold mb-1 text-primary">Questão ${index + 1}</div>
                        <div class="mb-2">${escapeHtml(question.text)}</div>
                        <div class="p-2 bg-light rounded shadow-sm mb-2">
                            <strong>Resposta:</strong> ${escapeHtml(value)}
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="window.location.href='edit-resposta.html?estagiario_id=${id}&questionario_id=${questionario_id}'">Editar</button>
                    </div>
                `;
            }
            container.append(questionCard);
        });
    }

    // Utilities
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

    // Global exposed functions

    // Change the return button href to view-aluno.html
    try {
        // Load Estagiario to catch the aluno ID
        const estagiarioResponse = await authenticatedFetch(`/estagiarios/${id}`);
        if (!estagiarioResponse.ok) {
            throw new Error('Failed to fetch estagiario details');
        }
        const estagiario = await estagiarioResponse.json();
        document.getElementById('back-button').href = `view-aluno.html?id=${estagiario.aluno_id}`;
    } catch (error) {
        console.error('Error loading estagiario details:', error);
        alert(`Erro ao carregar detalhes do estagiario: ${error.message}`);
    }

    // Set link for new activity
    if (!isAdmin() && getCurrentUser().id != id) {
        document.getElementById('new-atividade').style.display = 'none';
    } else {
        document.getElementById('new-atividade').href = `new-atividade.html?estagiario_id=${id}`;
    }

    // Go to edit-estagiario.html
    window.editEstagiario = function () {
        if (!isAdmin() && getCurrentUser().entidade_id != currentAlunoId) {
            alert('Apenas o administrador ou o próprio estagiário podem editar.');
            return;
        }
        window.location.href = `edit-estagiario.html?id=${id}`;
    };

    // Delete! (with confirmation)
    window.deleteEstagiario = async function () {
        if (confirm('Tem certeza que deseja excluir este estagiário?')) {
            try {
                const response = await authenticatedFetch(`/estagiarios/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    alert('Estagiário excluído com sucesso!');
                    window.location.href = 'estagiarios.html';
                } else {
                    const err = await response.json();
                    throw new Error(err.error || 'Failed to delete');
                }
            } catch (error) {
                console.error('Error deleting estagiario:', error);
                alert(`Erro ao excluir: ${error.message}`);
            }
        }
    };

    // Edit or create resposta
    window.editResposta = async function () {
        if (!existingResposta) {
            alert('Nenhuma avaliação encontrada para editar.');
            return;
        }
        window.location.href = `edit-resposta.html?estagiario_id=${id}&questionario_id=${questionario_id}`;
    };

    // Delete resposta
    window.deleteResposta = async function () {
        if (!existingResposta) return;

        if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
            try {
                const response = await authenticatedFetch(`/respostas/${existingResposta.id}`, { method: 'DELETE' });
                if (response.ok) {
                    alert('Avaliação excluída com sucesso!');
                    window.location.reload();
                } else {
                    const err = await response.json();
                    throw new Error(err.error || 'Failed to delete');
                }
            } catch (error) {
                console.error('Error deleting resposta:', error);
                alert(`Erro ao excluir: ${error.message}`);
            }
        }
    };
});
