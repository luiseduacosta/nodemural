// src/public/edit-mural.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    // Catch ID parameter
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        alert('ID not provided');
        window.location.href = 'mural.html';
        return;
    }
    
    const form = document.getElementById('editMuralForm');

    // Initialize EasyMDE
    const requisitosMDE = new EasyMDE({ element: document.getElementById('requisitos') });
    const outrasMDE = new EasyMDE({ element: document.getElementById('outras') });

    // Load instituições for the dropdown
    try {
        const response = await authenticatedFetch('/instituicoes');
        const instituicoes = await response.json();
        const select = document.getElementById('instituicao_id');

        instituicoes.forEach(instituicao => {
            const option = document.createElement('option');
            option.value = instituicao.id;
            option.textContent = instituicao.instituicao;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading instituicoes:', error);
    }

    // Define editMural function first
    const editMural = async (id) => {
        try {
            const response = await authenticatedFetch(`/mural/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch mural');
            }

            const mural = await response.json();
            console.log(mural);
            // Helper to format date for input
            const formatDateForInput = (date) => {
                if (!date) return '';
                return new Date(date).toISOString().split('T')[0];
            };

            document.getElementById('instituicao_id').value = mural.instituicao_id || '';
            document.getElementById('instituicao').value = mural.instituicao || '';
            document.getElementById('convenio').value = mural.convenio;
            document.getElementById('vagas').value = mural.vagas;
            document.getElementById('beneficios').value = mural.beneficios || '';
            document.getElementById('final_de_semana').value = mural.final_de_semana || '';
            document.getElementById('carga_horaria').value = mural.carga_horaria || '';

            // Set EasyMDE values
            requisitosMDE.value(mural.requisitos || '');

            document.getElementById('horario').value = mural.horario || '';
            document.getElementById('data_selecao').value = formatDateForInput(mural.data_selecao);
            document.getElementById('data_inscricao').value = formatDateForInput(mural.data_inscricao);
            document.getElementById('horario_selecao').value = mural.horario_selecao || '';
            document.getElementById('local_selecao').value = mural.local_selecao || '';
            document.getElementById('forma_selecao').value = mural.forma_selecao || '';
            document.getElementById('contato').value = mural.contato || '';            
            document.getElementById('periodo').value = mural.periodo || '';
            document.getElementById('local_inscricao').value = mural.local_inscricao;
            document.getElementById('email').value = mural.email || '';

            // Set EasyMDE value for outras
            outrasMDE.value(mural.outras || '');

            document.getElementById('muralId').value = mural.id;

            window.currentMuralId = id;
        } catch (error) {
            console.error('Edit error:', error);
            alert(`Error loading mural data: ${error.message}`);
            window.location.href = 'mural.html';
        }
    };

    // Get the ID from the URL query parameter (already extracted above)
    if (id) {
        await editMural(id);
    } else {
        alert('ID não fornecido');
        window.location.href = 'mural.html';
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
            local_inscricao: document.getElementById('local_inscricao').value,
            email: document.getElementById('email').value || null,
            outras: outrasMDE.value() || null
        };

        const id = document.getElementById('muralId').value;

        await authenticatedFetch(`/mural/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mural)
        });

        window.location.href = `view-mural.html?id=${id}`;
    });
});

window.viewRecord = function () {
    window.location.href = `view-mural.html?id=${window.currentMuralId}`;
};
