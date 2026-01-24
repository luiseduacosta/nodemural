$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id) {
        alert("ID não fornecido");
        window.location.href = "questoes.html";
        return;
    }

    $("#editBtn").attr("href", `edit-questao.html?id=${id}`);

    async function loadData() {
        try {
            // Fetch Question Data
            const res = await fetch(`/questoes/${id}`);
            if (!res.ok) throw new Error("Questao not found");
            const questao = await res.json();

            // Fetch Questionario Data to get title (if not joined in GET /questoes/:id)
            // Note: GET /questoes/:id in server.js currently returns SELECT * FROM questoes
            // It does NOT return the questionario title. We should probably fetch questionarios to map ID to Title 
            // OR update the backend to returning the joined title.
            // For now, let's fetch questionarios list to find the title or just show ID if lazy, 
            // but let's do it right: fetch the specific questionario or all.
            // Actually simply:
            let questionarioTitle = questao.questionario_id; // Default
            try {
                // We don't have a GET /questionarios/:id endpoint in the plan, but we have GET /questionarios (list)
                // Let's just fetch all and find it, or careful... 
                // Wait, server.js GET /questoes list HAS the join. GET /questoes/:id DOES NOT.
                // It's better to just show the ID for now or fetch the list. 
                // Let's fetch the list since it's small.
                const qRes = await fetch('/questionarios');
                const questionarios = await qRes.json();
                const match = questionarios.find(q => q.id === questao.questionario_id);
                if (match) questionarioTitle = match.title;
            } catch (e) {
                console.error("Error fetching questionario title", e);
            }

            $("#id").text(questao.id);
            $("#questionario").text(questionarioTitle);
            $("#text").text(questao.text);
            $("#ordem").text(questao.ordem);
            $("#type").text(getTypeLabel(questao.type));
            $("#created").text(formatDate(questao.created));
            $("#modified").text(formatDate(questao.modified));

            // Format Options
            if (questao.options) {
                try {
                    const optionsArray = JSON.parse(questao.options);
                    if (Array.isArray(optionsArray)) {
                        const ul = $("<ul>");
                        optionsArray.forEach(opt => {
                            ul.append($("<li>").text(opt));
                        });
                        $("#options").html(ul);
                    } else {
                        $("#options").text(questao.options);
                    }
                } catch (e) {
                    $("#options").text(questao.options);
                }
            } else {
                $("#options").text("-");
            }

        } catch (error) {
            console.error("Error loading data:", error);
            $(".container").html('<div class="alert alert-danger">Erro ao carregar dados da questão.</div>');
        }
    }

    function getTypeLabel(type) {
        const types = {
            'text': 'Texto (Resposta Curta)',
            'paragraph': 'Parágrafo (Resposta Longa)',
            'radio': 'Múltipla Escolha (Radio)',
            'checkbox': 'Caixa de Seleção (Checkbox)',
            'select': 'Lista Suspensa (Select)'
        };
        return types[type] || type;
    }

    function formatDate(dateString) {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString('pt-BR');
    }

    loadData();
});
