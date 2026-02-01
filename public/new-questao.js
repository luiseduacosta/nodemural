// src/public/new-questao.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('newQuestaoForm');

    // Load Questionarios
    async function loadQuestionarios() {
        $.ajax({
            url: "/questionarios",
            type: "GET",
            success: function (data) {
                console.log("Questionário encontrado");
                const select = $("#questionario_id");
                data.forEach((q) => {
                    select.append(new Option(q.title, q.id));
                });
            },
            error: function (xhr, status, error) {
                console.error("Error loading questionario:", error);
                alert("Erro ao carregar questionario");
            },
        });
    }
    loadQuestionarios();

    // Handle Type Change
    $("#type").on("change", function () {
        const type = $(this).val();
        const needsOptions = ["radio", "checkbox", "select"].includes(type);
        if (needsOptions) {
            $("#optionsContainer").show();
            if ($("#optionsList").children().length === 0) {
                addOptionInput();
            }
        } else {
            $("#optionsContainer").hide();
        }
    });

    // Add Option Input
    function addOptionInput(value = "") {
        const div = $(`
        <div class="input-group mb-2 option-item">
            <span class="input-group-text">Opção</span>
            <input type="text" class="form-control" placeholder="Opção" value="${value}" required>
            <button class="btn btn-outline-danger remove-option" type="button">X</button>
        </div>
    `);
        $("#optionsList").append(div);
    }

    $("#addOptionBtn").on("click", function () {
        addOptionInput();
    });

    // Remove Option Input
    $(document).on("click", ".remove-option", function () {
        $(this).closest(".option-item").remove();
    });

    // Handle Submit
    $("#newQuestaoForm").on("submit", async function (e) {
        e.preventDefault();

        const type = $("#type").val();
        let options = null;

        if (["radio", "checkbox", "select"].includes(type)) {
            const optionsArray = [];
            $("#optionsList input").each(function () {
                const val = $(this).val().trim();
                if (val) optionsArray.push(val);
            });
            options = JSON.stringify(optionsArray);
        }

        const data = {
            questionario_id: $("#questionario_id").val(),
            text: $("#text").val(),
            ordem: $("#ordem").val(),
            type: type,
            options: options,
            // The day of today
            created: new Date().toISOString().split("T")[0],
            modified: new Date().toISOString().split("T")[0],
        };

        try {
            console.log(data);
            $.ajax({
                url: "/questoes",
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json",
                success: function (data) {
                    console.log("Questão salva com sucesso!");
                    window.location.href = "view-questao.html?id=" + data.id;
                },
                error: function (xhr, status, error) {
                    console.error("Error saving questao:", error);
                    alert("Erro ao salvar questão");
                },
            });
        } catch (error) {
            console.error("Error saving questao:", error);
            alert("Erro ao salvar questão");
        }
    });
});
