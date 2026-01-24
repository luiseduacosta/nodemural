$(document).ready(function () {
    let table;

    // Initialize DataTable
    table = $("#questoesTable").DataTable({
        order: [
            [1, "asc"], // Questionario
            [2, "asc"], // Ordem
        ],
        ajax: {
            url: "/questoes",
            data: function (d) {
                const questionario_id = $("#questionarioFilter").val();
                if (questionario_id) {
                    d.questionario_id = questionario_id;
                }
            },
            dataSrc: "",
        },
        columns: [
            { data: "id" },
            { data: "questionario_title", defaultContent: "-" },
            { data: "ordem", defaultContent: "0" },
            { data: "text" },
            { data: "type" },
            {
                data: "options",
                render: function (data) {
                    if (!data) return "-";
                    return data.length > 50 ? data.substr(0, 50) + "..." : data;
                },
            },
            {
                data: null,
                render: function (data, type, row) {
                    return `
                        <button onclick="window.location.href='view-questao.html?id=${row.id}'" class="btn btn-sm btn-info">Visualizar</button>
                        <button onclick="window.location.href='edit-questao.html?id=${row.id}'" class="btn btn-sm btn-warning">Editar</button>
                        <button onclick="deleteQuestao(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
                    `;
                },
            },
        ],
        language: {
            url: "https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json",
        },
    });

    // Load Questionarios for Filter
    async function loadFilters() {
        try {
            const res = await fetch("/questionarios");
            const questionarios = await res.json();
            const select = $("#questionarioFilter");

            questionarios.forEach((q) => {
                const option = document.createElement("option");
                option.value = q.id;
                option.text = q.title;
                select.append(option);
            });

        } catch (error) {
            console.error("Error loading filters:", error);
        }
    }

    loadFilters();

    // Handle Filter Change
    $("#questionarioFilter").on("change", function () {
        table.ajax.reload();
    });

    window.deleteQuestao = async (id) => {
        if (confirm("Tem certeza que deseja excluir esta questão?")) {
            try {
                const response = await fetch(`/questoes/${id}`, {
                    method: "DELETE",
                });
                if (!response.ok) {
                    throw new Error("Erro ao excluir");
                }
                table.ajax.reload();
            } catch (error) {
                console.error("Error deleting questao:", error);
                alert("Erro ao excluir questão");
            }
        }
    };
});
