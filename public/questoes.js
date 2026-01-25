// src/controllers/questaoController.js
$(document).ready(function () {
    // Setup
    const urlParams = new URLSearchParams(window.location.search);
    const questionario_id = urlParams.get("questionario_id");

    // Verify if there is a questionario_id in the url
    // If there is, load the questionario data
    // If there is not, load all questionarios data
    async function loadData() {
        try {
            if (questionario_id) {
                $.ajax({
                    url: `/questoes?questionario_id=${questionario_id}`,
                    type: "GET",
                    success: function (data) {
                        table.clear().rows.add(data).draw();
                    },
                    error: function (xhr, status, error) {
                        console.error("Error loading questionario:", error);
                        alert("Erro ao carregar questionario");
                    },
                });
            } else {
                $.ajax({
                    url: `/questoes`,
                    type: "GET",
                    success: function (data) {
                        table.clear().rows.add(data).draw();
                    },
                    error: function (xhr, status, error) {
                        console.error("Error loading questionario:", error);
                        alert("Erro ao carregar questionario");
                    },
                });
            }
        } catch (error) {
            console.error("Error loading data:", error);
            alert("Erro ao carregar dados");
        }
    }

    loadData();

    // Setup - add a text input to each footer cell
    let table;

    // Initialize DataTable
    table = $("#questoesTable").DataTable({
        order: [
            [2, "asc"], // Ordem
        ],
        ajax: {
            url: "/questoes",
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

    // Delete Questao
    window.deleteQuestao = async (id) => {
        if (confirm("Tem certeza que deseja excluir esta questão?")) {
            try {
                $.ajax({
                    url: `/questoes/${id}`,
                    type: "DELETE",
                    success: function (data) {
                        console.log("Questão excluida");
                        table.ajax.reload();
                    },
                    error: function (xhr, status, error) {
                        console.error("Error deleting questao:", error);
                        alert("Erro ao excluir questão");
                    },
                });
            } catch (error) {
                console.error("Error deleting questao:", error);
                alert("Erro ao excluir questão");
            }
        }
    };

    // Add Questao
    window.addQuestao = async () => {
        window.location.href = "add-questao.html";
    };
});