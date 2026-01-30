// src/controllers/questaoController.js
$(document).ready(function () {

    // Load supervisores for filter
    $.ajax({
        url: '/supervisores',
        type: 'GET',
        success: function (data) {
            const select = $('#supervisorFilter');
            data.forEach(supervisor => {
                select.append(`<option value="${supervisor.id}">${supervisor.nome}</option>`);
            });
        }
    });

    // Get questionario_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const questionario_id = urlParams.get('questionario_id');
    // console.log(questionario_id);

    // Define the url depending on questionario_id
    let url;
    if (!questionario_id) {
        // Load all respostas if no questionario_id
        url = `/respostas`;
    } else {
        // Load respostas for a specific questionario_id
        url = `/respostas/questionario/${questionario_id}`;
    }

    // Initialize DataTable
    let table = $("#respostasTable").DataTable({
        order: [[5, "desc"]], // Modified date
        ajax: {
            url: url,
            type: "GET",
            data: function (d) {
                const supervisor_id = $('#supervisorFilter').val();
                if (supervisor_id) {
                    d.supervisor_id = supervisor_id;
                }
                if (questionario_id) {
                    d.questionario_id = questionario_id;
                }
            },
            dataSrc: "",
        },
        columns: [
            { data: "id" },
            { data: "aluno_nome", render: function (data, type, row) { return `<a href=view-resposta.html?estagiario_id=${row.estagiario_id}&questionario_id=${row.questionario_id}>${data || "-"}</a>`; } },
            { data: "questionario_title", defaultContent: "-" },
            { data: "supervisor_nome", defaultContent: "-" },
            {
                data: "response",
                render: function (data) {
                    try {
                        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                        const count = Object.keys(parsed).length;
                        return count > 0
                            ? `<span class="badge bg-success">${count} respostas</span>`
                            : `<span class="badge bg-warning">Não iniciado</span>`;
                    } catch {
                        return `<span class="badge bg-secondary">-</span>`;
                    }
                }
            },
            {
                data: "modified",
                render: function (data) {
                    if (!data) return "-";
                    return new Date(data).toLocaleDateString('pt-BR');
                }
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button onclick="window.location.href='edit-resposta.html?estagiario_id=${row.estagiario_id}&questionario_id=${row.questionario_id}'" class="btn btn-sm btn-primary">Editar</button>
                        <button onclick="deleteResposta(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
                    `;
                }
            }
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json",
        },
    });

    // Reload table when filter changes
    $('#supervisorFilter').on('change', function () {
        table.ajax.reload();
    });

    // Delete resposta
    window.deleteResposta = async (id) => {
        if (confirm("Tem certeza que deseja excluir esta resposta?")) {
            $.ajax({
                url: `/respostas/${id}`,
                type: "DELETE",
                success: function () {
                    alert("Resposta excluída com sucesso");
                    table.ajax.reload();
                },
                error: function (xhr, status, error) {
                    console.error("Error deleting resposta:", error);
                    alert("Erro ao excluir resposta");
                }
            });
        }
    };
});
