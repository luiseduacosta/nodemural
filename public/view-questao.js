// src/controllers/questaoController.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    // Setup
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id) {
        alert("ID não fornecido");
        window.location.href = "questoes.html";
        return;
    }

    // Set Edit Button with the ID
    $("#editBtn").attr("href", `edit-questao.html?id=${id}`);

    // Load Question Data
    function loadData() {
        try {
            // Fetch Question Data
            // GET /questoes/:id
            $.ajax({
                url: `/questoes/${id}`,
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                type: 'GET',
                success: function (questao) {
                    $("#id").text(questao.id);
                    $("#questionario").text(questao.questionario_title);
                    $("#text").text(questao.text);
                    $("#ordem").text(questao.ordem);
                    $("#type").text(getTypeLabel(questao.type));
                    $("#created").text(formatDate(questao.created));
                    $("#modified").text(formatDate(questao.modified));
                    formatOptions(questao.options);
                },
                error: function (xhr, status, error) {
                    console.error("Erro ao carregar dados da questão:", error);
                    $(".container").html('<div class="alert alert-danger">Erro ao carregar dados da questão.</div>');
                }
            });
        } catch (error) {
            console.error("Erro ao carregar dados da questão:", error);
            $(".container").html('<div class="alert alert-danger">Erro ao carregar dados da questão.</div>');
        }
    }

    // Format Options
    function formatOptions(options) {
        try {
            const optionsArray = JSON.parse(options);
            if (Array.isArray(optionsArray)) {
                const ul = $("<ul>");
                optionsArray.forEach(opt => {
                    ul.append($("<li>").text(opt));
                });
                $("#options").html(ul);
            } else {
                $("#options").text(options);
            }
        } catch (error) {
            console.error("Erro ao carregar opções da questão:", error);
            $("#options").text("-");
        }
    }

    // Get Type Label
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

    // Format Date
    function formatDate(dateString) {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleString('pt-BR');
    }

    // Load Data
    loadData();
});
