// src/public/edit-mural.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('editMuralForm');

    // Load instituições for the dropdown
    try {
        const response = await fetch('/estagios');
        const estagios = await response.json();
        const select = document.getElementById('instituicao_id');

        estagios.forEach(estagio => {
            const option = document.createElement('option');
            option.value = estagio.id;
            option.textContent = estagio.instituicao;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading estagios:', error);
    }

    // Define editMural function first
    const editMural = async (id) => {
        try {
            const response = await fetch(`/mural/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch mural');
            }

            const mural = await response.json();

            // Helper to format date for input
            const formatDateForInput = (date) => {
                if (!date) return '';
                return new Date(date).toISOString().split('T')[0];
            };

            document.getElementById('instituicao_id').value = mural.instituicao_id || '';
            document.getElementById('periodo').value = mural.periodo || '';
            document.getElementById('vagas').value = mural.vagas;
            document.getElementById('convenio').value = mural.convenio;
            document.getElementById('cargaHoraria').value = mural.cargaHoraria || '';
            document.getElementById('final_de_semana').value = mural.final_de_semana || '';
            document.getElementById('horario').value = mural.horario || '';
            document.getElementById('beneficios').value = mural.beneficios || '';
            document.getElementById('requisitos').value = mural.requisitos || '';
            document.getElementById('dataInscricao').value = formatDateForInput(mural.dataInscricao);
            document.getElementById('dataSelecao').value = formatDateForInput(mural.dataSelecao);
            document.getElementById('horarioSelecao').value = mural.horarioSelecao || '';
            document.getElementById('localSelecao').value = mural.localSelecao || '';
            document.getElementById('formaSelecao').value = mural.formaSelecao || '';
            document.getElementById('localInscricao').value = mural.localInscricao;
            document.getElementById('contato').value = mural.contato || '';
            document.getElementById('email').value = mural.email || '';
            document.getElementById('professor_id').value = mural.professor_id || '';
            document.getElementById('turmaestagio_id').value = mural.turmaestagio_id || '';
            document.getElementById('datafax').value = formatDateForInput(mural.datafax);
            document.getElementById('outras').value = mural.outras || '';
            document.getElementById('muralId').value = mural.id;

            window.currentMuralId = id;
        } catch (error) {
            console.error('Edit error:', error);
            alert(`Error loading mural data: ${error.message}`);
            window.location.href = 'mural.html';
        }
    };

    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    if (editId) {
        await editMural(editId);
    } else {
        alert('ID não fornecido');
        window.location.href = 'mural.html';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const mural = {
            instituicao_id: document.getElementById('instituicao_id').value || null,
            instituicao: document.getElementById('instituicao_id').selectedOptions[0].text,
            periodo: document.getElementById('periodo').value,
            vagas: document.getElementById('vagas').value,
            convenio: document.getElementById('convenio').value,
            cargaHoraria: document.getElementById('cargaHoraria').value || null,
            final_de_semana: document.getElementById('final_de_semana').value || null,
            horario: document.getElementById('horario').value || null,
            beneficios: document.getElementById('beneficios').value || null,
            requisitos: document.getElementById('requisitos').value || null,
            dataInscricao: document.getElementById('dataInscricao').value || null,
            dataSelecao: document.getElementById('dataSelecao').value || null,
            horarioSelecao: document.getElementById('horarioSelecao').value || null,
            localSelecao: document.getElementById('localSelecao').value || null,
            formaSelecao: document.getElementById('formaSelecao').value || null,
            localInscricao: document.getElementById('localInscricao').value,
            contato: document.getElementById('contato').value || null,
            email: document.getElementById('email').value || null,
            professor_id: document.getElementById('professor_id').value || null,
            turmaestagio_id: document.getElementById('turmaestagio_id').value || null,
            datafax: document.getElementById('datafax').value || null,
            outras: document.getElementById('outras').value || null
        };

        const id = document.getElementById('muralId').value;

        await fetch(`/mural/${id}`, {
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
