// src/controllers/muralController.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    // Input Masks

    const form = document.getElementById('newMuralForm');

    // Initialize EasyMDE for requisitos and outras textareas with toolbar configuration
    const requisitosMDE = new EasyMDE({ 
        element: document.getElementById('requisitos'),
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"]
    });
    const outrasMDE = new EasyMDE({ 
        element: document.getElementById('outras'),
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"]
    });

    // Load instituições for the dropdown
    try {
        const response = await authenticatedFetch('/instituicoes');
        const instituicoes = await response.json();
        const select = document.getElementById('instituicao_id');

        // Clear existing options
        select.innerHTML = '';

        // Add default option
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Selecione uma instituição';
        select.appendChild(option);

        instituicoes.forEach(inst => {
            const option = document.createElement('option');
            option.value = inst.id;
            option.textContent = inst.instituicao;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading instituições:', error);
    }

    // Load default mural_periodo_atual from the configuration table and put de value in the periodo input. It has only one row.
    try {
        const response = await authenticatedFetch('/configuracoes');
        const configuracoes = await response.json();
        // Put the value in the periodo input
        document.getElementById('periodo').value = configuracoes.mural_periodo_atual;

    } catch (error) {
        console.error('Error loading periodo:', error);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const mural = {
            instituicao_id: document.getElementById('instituicao_id').value || null,
            instituicao: document.getElementById('instituicao_id').selectedOptions[0].text,
            convenio: document.getElementById('convenio').value,
            vagas: document.getElementById('vagas').value,
            beneficios: document.getElementById('beneficios').value || null,
            final_de_semana: document.getElementById('final_de_semana').value || null,
            carga_horaria: document.getElementById('carga_horaria').value || null,
            requisitos: requisitosMDE.value() || null,
            horario: document.getElementById('horario').value || null,
            data_selecao: document.getElementById('data_selecao').value || null,
            data_inscricao: document.getElementById('data_inscricao').value || null,
            horario_selecao: document.getElementById('horario_selecao').value || null,
            local_selecao: document.getElementById('local_selecao').value || null,
            forma_selecao: document.getElementById('forma_selecao').value || null,
            contato: document.getElementById('contato').value || null,
            periodo: document.getElementById('periodo').value,
            local_inscricao: document.getElementById('local_inscricao').value || null,
            email: document.getElementById('email').value || null,
            outras: outrasMDE.value() || null
        };

        try {
            const response = await authenticatedFetch('/mural', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mural)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Faça login para criar um mural.');
                    window.location.href = '/login.html';
                    return;
                }
                if (response.status === 403) {
                    alert('Acesso negado. Permissão insuficiente.');
                    return;
                }
                throw new Error('Failed to create mural');
            }

            const result = await response.json();
            const newId = result.id;

            // Redirect to view page with the new ID
            window.location.href = `view-mural.html?id=${newId}`;
        } catch (error) {
            console.error('Error creating mural:', error);
            alert(`Erro ao criar mural: ${error.message}`);
        }
    });
});
