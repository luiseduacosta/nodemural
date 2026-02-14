// public/view-estagiario.js
import { getToken, hasRole, authenticatedFetch, isAdmin, getCurrentUser } from './auth-utils.js';
// jsPDF is loaded via CDN as window.jspdf.jsPDF

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

    // Generate Certificate PDF
    window.generateCertificate = async function () {
        try {
            const estagiarioResponse = await authenticatedFetch(`/estagiarios/${id}`);
            if (!estagiarioResponse.ok) {
                throw new Error('Failed to fetch estagiario details');
            }
            const est = await estagiarioResponse.json();

            // Catch the value of the fields termo_compromisso_inicio and termo_compromisso_final
            let configuracoes = { termo_compromisso_inicio: '-', termo_compromisso_final: '-' };
            try {
                const configuracaoResponse = await authenticatedFetch('/configuracoes/1');
                if (configuracaoResponse.ok) {
                    configuracoes = await configuracaoResponse.json();
                } else {
                    throw new Error('Failed to fetch configuracoes: ' + configuracaoResponse.status);
                }
            } catch (e) {
                console.warn('Could not fetch configuracoes, using defaults');
            }
            // Format dates from string to pt-BR
            const formatDate = (dateStr) => {
                if (!dateStr || dateStr === '-') return '-';
                const date = new Date(dateStr);
                return date.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            const dataInicio = formatDate(configuracoes.termo_compromisso_inicio);
            const dataFinal = formatDate(configuracoes.termo_compromisso_final);

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            // Top logo 
            const logo = "data:image/png;base64,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";
            doc.addImage(logo, 'PNG', 20, 20, 40, 10);

            // Default font
            doc.setFont('helvetica', 'normal');

            // Header
            doc.setFontSize(18);
            doc.text(125, 27, 'TERMO DE COMPROMISSO DE ESTÁGIO', { align: 'center', valign: 'middle' });

            // Body
            doc.setFontSize(12);
            const margin_left = 20;
            // Starting height
            let height = 40;

            const headerText = 'O presente TERMO DE COMPROMISSO DE ESTÁGIO que entre si assinam a Coordenação de Estágio da Escola de Serviço Social/UFRJ, o (a) Aluno ' + est.aluno_nome + ', a  instituição ' + est.instituicao_nome + ' e o (a) Supervisor (a) de Campo ' + est.supervisor_nome + ', visa estabelecer condições gerais que regulam a realização de ESTÁGIO OBRIGATÓRIO. Ficam estabelecidas entre as partes as seguintes condições básicas para a realização do estágio:';
            const lines = doc.splitTextToSize(headerText, 170);
            const headerHeight = doc.getTextDimensions(lines).h;
            doc.text(margin_left, height, lines, { maxWidth: 170, align: 'justify' });

            const art1 = 'Art. 01. As atividades a serem desenvolvidas pelo (a) estagiário (a), deverão ser compatíveis com o curso de Serviço Social e norteadas pelos princípios preconizados na Política de Estágio (ABEPSS), tais como: a indissociabilidade entre as dimensões teórico-metodológica, ético-política e técnico-operativa; articulação entre Formação e Exercício Profissional; indissociabilidade entre estágio e supervisão acadêmica e de campo; articulação entre Universidade e Sociedade; unidade teoria e prática e articulação entre ensino, pesquisa e extensão.';
            const lines1 = doc.splitTextToSize(art1, 160);
            const art1Height = doc.getTextDimensions(lines1).h;
            height = height + headerHeight;
            doc.text(margin_left, height, lines1, { maxWidth: 170, align: 'justify' });

            const art2 = 'Art. 02. As atividades desenvolvidas no campo de estágio deverão ter compatibilidade com as previstas no termo de compromisso.';
            const lines2 = doc.splitTextToSize(art2, 170);
            const art2Height = doc.getTextDimensions(lines2).h;
            height = height + art1Height;
            doc.text(margin_left, height, lines2, { maxWidth: 170, align: 'justify' });

            const art3 = 'Art. 03. O plano de atividades do estagiário, elaborado em acordo dos alunos, a parte concedente do estágio e a instituição de ensino, será incorporado ao termo de compromisso por meio de aditivos à medida que for avaliado, progressivamente, o desenho do aluno.';
            const lines3 = doc.splitTextToSize(art3, 170);
            const art3Height = doc.getTextDimensions(lines3).h;
            height = height + art2Height;
            doc.text(margin_left, height, lines3, { maxWidth: 170, align: 'justify' });

            const art4 = 'Art. 04. A quebra deste contrato, deverá ser precedida de apresentação de solicitação formal à Coordenação de Estágio, com no mínimo 1 mês de antes do término do período letivo em curso. Contendo parecer do supervisor(a) de campo e do supervisor(a) acadêmico.';
            const lines4 = doc.splitTextToSize(art4, 170);
            const art4Height = doc.getTextDimensions(lines4).h;
            height = height + art3Height;
            doc.text(margin_left, height, lines4, { maxWidth: 170, align: 'justify' });

            const art5 = 'Art. 05. Em caso de demissão do supervisor(a), ocorrência de férias ou licença deste profissional ao longo do período letivo, outro assistente social deverá ser imediatamente indicado para supervisão técnica do estagiário.';
            const lines5 = doc.splitTextToSize(art5, 170);
            const art5Height = doc.getTextDimensions(lines5).h;
            height = height + art4Height;
            doc.text(margin_left, height, lines5, { maxWidth: 170, align: 'justify' });

            doc.setFont('helvetica', 'bold');
            const subTitulo1 = 'Da ESS';
            const subTitulo1Height = doc.getTextDimensions(subTitulo1).h;
            height = height + art5Height;
            doc.text(margin_left, height, subTitulo1, { align: 'left' });

            doc.setFont('helvetica', 'normal');
            const art6 = 'Art. 06. De acordo com a orientação geral da Universidade Federal do Rio de Janeiro, no que concerne a estágios, e o currículo da Escola de Serviço Social, implantado em 2001:';
            const lines6 = doc.splitTextToSize(art6, 170);
            const art6Height = doc.getTextDimensions(lines6).h;
            height = height + subTitulo1Height;
            doc.text(margin_left, height, lines6, { maxWidth: 170, align: 'justify' });

            const art6_1 = '§1º O estágio na UFRJ, em conformidade com o artigo 3º da resolução CEG nº 12/2018, deverá ter carga horária máxima de 20(vinte) horas por semana, podendo-se estender a 24 (vinte e quatro) horas nos casos de cursos da área da saúde;';
            const lines6_1 = doc.splitTextToSize(art6_1, 165);
            const art6_1Height = doc.getTextDimensions(lines6_1).h;
            height = height + art6Height;
            doc.text(margin_left + 5, height, lines6_1, { maxWidth: 165, align: 'justify' });

            const art6_2 = '§2º Estágios com carga horária máxima superior ao previsto no §1º deste artigo poderão ser autorizados, pelo Conselho de Ensino de Graduação, conforme previsão na Política de Estágio, dentro do limite legal de 30(trinta) horas, em caráter excepcional.';
            const lines6_2 = doc.splitTextToSize(art6_2, 165);
            const art6_2Height = doc.getTextDimensions(lines6_2).h;
            height = height + art6_1Height;
            doc.text(margin_left + 5, height, lines6_2, { maxWidth: 165, align: 'justify' });

            const art7 = 'Art. 07. Será indicado pelos Departamentos da ESS, um docente para acompanhamento acadêmico e orientação do Estagiário por meio da disciplina de Orientação ao Trabalho Acadêmico.';
            const lines7 = doc.splitTextToSize(art7, 170);
            const art7Height = doc.getTextDimensions(lines7).h;
            height = height + art6_2Height;
            doc.text(margin_left, height, lines7, { maxWidth: 170, align: 'justify' });

            const art8 = 'Art. 08. A Escola de Serviço Social fornecerá à Instituição informações e declarações solicitadas, consideradas necessárias ao bom andamento do estágio curricular.';
            const lines8 = doc.splitTextToSize(art8, 170);
            const art8Height = doc.getTextDimensions(lines8).h;
            height = height + art7Height;
            doc.text(margin_left, height, lines8, { maxWidth: 170, align: 'justify' });

            doc.setFont('helvetica', 'bold');
            const subTitulo2 = 'DA PARTE CONCEDENTE';
            const subTitulo2Height = doc.getTextDimensions(subTitulo2).h;
            height = height + art8Height;
            doc.text(margin_left, height, subTitulo2, { align: 'left' });

            doc.setFont('helvetica', 'normal');
            const art9 = 'Art. 09. O estágio será realizado no âmbito da unidade concedente onde deve existir um Assistente Social responsável pelo projeto desenvolvido pelo Serviço Social. As atividades de estágio serão realizadas em horário compatível com as atividades acadêmicas do estagiário e com as normas vigentes no âmbito da unidade concedente.';
            const lines9 = doc.splitTextToSize(art9, 170);
            const art9Height = doc.getTextDimensions(lines9).h;
            height = height + subTitulo2Height;
            doc.text(margin_left, height, lines9, { maxWidth: 170, align: 'justify' });

            const art10 = 'Art. 10. A Coordenação de Estágio/ESS deve ser informada com prazo de 01 (um) mês de antecedência o afastamento do supervisor(a) do campo de estágio e a indicação do seu substituto.';
            const lines10 = doc.splitTextToSize(art10, 170);
            const art10Height = doc.getTextDimensions(lines10).h;
            height = height + art9Height;
            doc.text(margin_left, height, lines10, { maxWidth: 170, align: 'justify' });

            doc.addPage();
            height = 17;

            doc.setFont('helvetica', 'bold');
            const subTitulo3 = 'DO(A) SUPERVISOR(A) DE CAMPO';
            const linesSubTitulo3 = doc.splitTextToSize(subTitulo3, 170);
            const subTitulo3Height = doc.getTextDimensions(linesSubTitulo3).h;
            height = height + art10Height;
            doc.text(margin_left, height, linesSubTitulo3, { align: 'left' });

            doc.setFont('helvetica', 'normal');
            const art12 = 'Art. 12. É de responsabilidade do Assistente Social supervisor(a) o acompanhamento, orientação e avaliação do aluno no campo de estágio, em conformidade com o plano de estágio, elaborado em consonância com o projeto pedagógico e com programas institucionais vinculados aos campos de estágio; garantindo diálogo permanente com o (a) supervisor (a) acadêmico (a), no processo de supervisão.';
            const lines12 = doc.splitTextToSize(art12, 170);
            const art12Height = doc.getTextDimensions(lines12).h;
            height = height + subTitulo3Height;
            doc.text(margin_left, height, lines12, { maxWidth: 170, align: 'justify' });

            const art13 = 'Art. 13. Ao término de cada mês, o (a) supervisor(a) atestará à unidade de ensino, em formulário próprio, a carga horária cumprida pelo estagiário.';
            const lines13 = doc.splitTextToSize(art13, 170);
            const art13Height = doc.getTextDimensions(lines13).h;
            height = height + art12Height;
            doc.text(margin_left, height, lines13, { maxWidth: 170, align: 'justify' });

            const art14 = 'Art. 14. No final de cada período letivo, o (a) supervisor(a) encaminhará, ao professor(a) da disciplina de Orientação e Treinamento Profissional, avaliação do processo vivenciado pelo aluno durante o período, Instrumento este utilizado pelo professor(a) na avaliação final do aluno.';
            const lines14 = doc.splitTextToSize(art14, 170);
            const art14Height = doc.getTextDimensions(lines14).h;
            height = height + art13Height;
            doc.text(margin_left, height, lines14, { maxWidth: 170, align: 'justify' });

            doc.setFont('helvetica', 'bold');
            const subtitulo4 = 'DO(A) ESTAGIÁRIO(A)';
            const linesSubtitulo4 = doc.splitTextToSize(subtitulo4, 170);
            const subtitulo4Height = doc.getTextDimensions(linesSubtitulo4).h;
            height = height + art14Height;
            doc.text(margin_left, height, linesSubtitulo4, { align: 'left' });

            doc.setFont('helvetica', 'normal');
            const art15 = 'Art. 15. Cabe ao estagiário cumprir o horário acordado com a unidade para o desempenho das atividades definidas no Plano de Estágio, observando os princípios éticos que rege o Serviço Social. São considerados motivos justos ao não cumprimento da programação, as obrigações acadêmicas do estagiário que devem ser comunicadas, ao supervisor(a), em tempo hábil.';
            const lines15 = doc.splitTextToSize(art15, 170);
            const art15Height = doc.getTextDimensions(lines15).h;
            height = height + subtitulo4Height;
            doc.text(margin_left, height, lines15, { maxWidth: 170, align: 'justify' });

            const art16 = 'Art. 16. O(a) aluno(a) se compromete a cuidar e manter sigilo em relação à documentação, da unidade campo de estágio, mesmo após o seu desligamento.';
            const lines16 = doc.splitTextToSize(art16, 170);
            const art16Height = doc.getTextDimensions(lines16).h;
            height = height + art15Height;
            doc.text(margin_left, height, lines16, { maxWidth: 170, align: 'justify' });

            const art17 = 'Art. 17. O(a) aluno(a) deverá cumprir com responsabilidade e assiduidade os compromissos assumidos junto ao acampo de estágio, independente do calendário e férias acadêmicas.';
            const lines17 = doc.splitTextToSize(art17, 170);
            const art17Height = doc.getTextDimensions(lines17).h;
            height = height + art16Height;
            doc.text(margin_left, height, lines17, { maxWidth: 170, align: 'justify' });

            const art18 = 'Art. 18. Aplica-se ao estagiário a legislação relacionada à saúde no trabalho, sendo sua implementação de responsabilidade da parte concedente do estágio.';
            const lines18 = doc.splitTextToSize(art18, 170);
            const art18Height = doc.getTextDimensions(lines18).h;
            height = height + art17Height;
            doc.text(margin_left, height, lines18, { maxWidth: 170, align: 'justify' });

            const art19 = 'Art. 19. É assegurado ao estagiário (a), sempre que o estágio tenha duração igual ou superior a 1 (um) ano, período de recesso de 30 (trinta) dias, a ser gozado preferencialmente durante suas férias escolares.';
            const lines19 = doc.splitTextToSize(art19, 170);
            const art19Height = doc.getTextDimensions(lines19).h;
            height = height + art18Height;
            doc.text(margin_left, height, lines19, { maxWidth: 170, align: 'justify' });

            doc.setFont('helvetica', 'bold');
            const subtitulo5 = 'DAS ORIENTAÇÕES GERAIS';
            const linesSubtitulo5 = doc.splitTextToSize(subtitulo5, 170);
            const subtitulo5Height = doc.getTextDimensions(linesSubtitulo5).h;
            height = height + art19Height;
            doc.text(margin_left, height, linesSubtitulo5, { align: 'left' });

            doc.setFont('helvetica', 'normal');
            const art20 = 'Art. 20. O presente Termo de Compromisso terá validade de ' + dataInicio + ' a ' + dataFinal + ', correspondente ao nível ' + est.nivel + ' de Estágio. Sua interrupção antes do período previsto acarretará prejuízo para o aluno na sua avaliação acadêmica.';
            const lines20 = doc.splitTextToSize(art20, 170);
            const art20Height = doc.getTextDimensions(lines20).h;
            height = height + subtitulo5Height;
            doc.text(margin_left, height, lines20, { maxWidth: 170, align: 'justify' });

            const art21 = 'Art. 21. Os casos omissos serão encaminhados à Coordenação de Estágio para serem dirimidos.';
            const lines21 = doc.splitTextToSize(art21, 170);
            const art21Height = doc.getTextDimensions(lines21).h;
            height = height + art20Height;
            doc.text(margin_left, height, lines21, { maxWidth: 170, align: 'justify' });

            // Date
            const today = new Date().toLocaleDateString('pt-BR');
            height = height + art20Height;
            doc.text(`Rio de Janeiro, ${today}`, 135, height + 10, { align: 'left' });

            // Assinaturas
            doc.text(65, height + 33, 'Coordenação do Estágio', { align: 'right' });
            doc.text(105, height + 30, 'Estudante', { align: 'center' });
            doc.text(150, height + 30, 'Supervisor(a)', { align: 'left' });

            doc.text(105, height + 35, est.aluno_nome, { align: 'center' });
            doc.text(150, height + 35, est.supervisor_nome, { align: 'left' });

            // Save
            doc.save(`certificado_${est.aluno_nome}_${est.periodo}.pdf`);

        } catch (error) {
            console.error('Error generating certificate:', error);
            alert(`Erro ao gerar certificado: ${error.message}`);
        }
    };
});
