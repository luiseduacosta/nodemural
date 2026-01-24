$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id) {
        alert("ID não fornecido");
        window.location.href = "questoes.html";
        return;
    }

    $("#questaoId").val(id);

    // Load Questionarios
    async function loadData() {
        try {
            // 1. Load Questionarios
            const qRes = await fetch("/questionarios");
            const questionarios = await qRes.json();
            const select = $("#questionario_id");
            questionarios.forEach((q) => {
                select.append(new Option(q.title, q.id));
            });

            // 2. Load Questao Data
            const res = await fetch(`/questoes/${id}`);
            if (!res.ok) throw new Error("Questao not found");
            const questao = await res.json();

            console.log("Questao loaded: ", questao);

            // Populate Form
            $("#questionario_id").val(questao.questionario_id);
            $("#text").val(questao.text);
            $("#ordem").val(questao.ordem);
            $("#type").val(questao.type).trigger("change");
            // Populate Options if they exist and are needed
            if (
                ["radio", "checkbox", "select"].includes(questao.type) &&
                questao.options
            ) {
                try {
                    const optionsArray = JSON.parse(questao.options);
                    if (Array.isArray(optionsArray)) {
                        optionsArray.forEach((opt) => addOptionInput(opt));
                    }
                } catch (e) {
                    console.error("Error parsing options JSON:", e);
                    // Fallback if not valid JSON array, maybe add single input
                    addOptionInput(questao.options);
                }
            }
            const today = new Date().toISOString().split("T")[0].split("-").reverse().join("-");
            $("#modified").val(today);

        } catch (error) { 
            console.error("Error loading data:", error);
            alert("Erro ao carregar dados");
        }
    }

    loadData();

    // Handle Type Change
    $("#type").on("change", function () {
        const type = $(this).val();
        const needsOptions = ["radio", "checkbox", "select"].includes(type);
        if (needsOptions) {
            $("#optionsContainer").show();
            // Only add empty input if empty
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
            <input type="text" class="form-control" placeholder="Opção" value="${value}">
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
    $("#editQuestaoForm").on("submit", async function (e) {
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
            modified: new Date().toISOString().split("T")[0],
        };

        try {
            console.log(data);
        } catch (error) {
            console.error("Error saving questao:", error);
            alert("Erro ao salvar questão");
        }

        try {
            const response = await fetch(`/questoes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao salvar: ${errorData.message || response.statusText}`);
            }

            // alert("Questão atualizada com sucesso!");
            window.location.href = "view-questao.html?id=" + id;
        } catch (error) {
            console.error("Error saving questao:", error);
            alert("Erro ao salvar questão");
        }
    });
});
