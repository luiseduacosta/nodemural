// src/controllers/visitaController.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }
    const form = document.getElementById('editVisitaForm');

    // Load instituições for the dropdown
    try {
        const response = await fetch('/estagio');
        const instituicoes = await response.json();
        const select = document.getElementById('instituicao_id');

        instituicoes.forEach(inst => {
            const option = document.createElement('option');
            option.value = inst.id;
            option.textContent = inst.instituicao;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading instituições:', error);
    }

    // Load existing visita data
    const editVisita = async (id) => {
        try {
            const response = await fetch(`/visitas/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch visita');
            }

            const visita = await response.json();

            const formatDateForInput = (date) => {
                if (!date) return '';
                return new Date(date).toISOString().split('T')[0];
            };

            document.getElementById('instituicao_id').value = visita.instituicao_id;
            document.getElementById('data').value = formatDateForInput(visita.data);
            document.getElementById('responsavel').value = visita.responsavel;
            document.getElementById('motivo').value = visita.motivo;
            document.getElementById('avaliacao').value = visita.avaliacao;
            document.getElementById('descricao').value = visita.descricao || '';
            document.getElementById('visitaId').value = visita.id;

            window.currentVisitaId = id;
        } catch (error) {
            console.error('Edit error:', error);
            alert(`Error loading visita data: ${error.message}`);
            window.location.href = 'visitas.html';
        }
    };

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    if (editId) {
        await editVisita(editId);
    } else {
        alert('ID não fornecido');
        window.location.href = 'visitas.html';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const visita = {
            instituicao_id: document.getElementById('instituicao_id').value,
            data: document.getElementById('data').value,
            responsavel: document.getElementById('responsavel').value,
            motivo: document.getElementById('motivo').value,
            avaliacao: document.getElementById('avaliacao').value,
            descricao: document.getElementById('descricao').value || null
        };

        const id = document.getElementById('visitaId').value;

        await fetch(`/visitas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visita)
        });

        window.location.href = `view-visita.html?id=${id}`;
    });
});

window.viewRecord = function () {
    window.location.href = `view-visita.html?id=${window.currentVisitaId}`;
};
