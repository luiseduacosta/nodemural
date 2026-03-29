// src/controllers/supervisorController.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'supervisor'])) {
        window.location.href = 'login.html';
        return;
    }

    // Input Masks
    $('#cpf').inputmask('999.999.999-99');
    $('#email').inputmask('email');
    $('#telefone').inputmask({
        mask: ["(99) 9999.9999", "(99) 99999.9999"],
        keepStatic: true
    });
    $('#celular').inputmask({
        mask: ["(99) 9999.9999", "(99) 99999.9999"],
        keepStatic: true
    });
    $('#ano_formacao').inputmask('9999');

    // Form submission
    const form = document.getElementById('editSupervisorForm');

    // Define editSupervisor function first
    const editSupervisor = async (id) => {
        try {
            const response = await authenticatedFetch(`/supervisores/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch supervisor');
            }

            const supervisor = await response.json();
            document.getElementById('nome').value = supervisor.nome;
            document.getElementById('email').value = supervisor.email || '';
            document.getElementById('celular').value = supervisor.celular || '';
            document.getElementById('cress').value = supervisor.cress;
            document.getElementById('supervisorId').value = supervisor.id;
            document.getElementById('regiao').value = supervisor.regiao || '';
            document.getElementById('cpf').value = supervisor.cpf || '';
            document.getElementById('escola').value = supervisor.escola || '';
            document.getElementById('ano_formacao').value = supervisor.ano_formacao || '';
            document.getElementById('cargo').value = supervisor.cargo || '';
            document.getElementById('observacoes').value = supervisor.observacoes || '';

            // Store original cress to detect changes
            window.oldCress = supervisor.cress;

            // Store the ID for view function
            window.currentSupervisorId = id;
        } catch (error) {
            console.error('Edit error:', error);
            alert(`Error loading supervisor data: ${error.message}`);
            window.location.href = 'supervisores.html';
        }
    };

    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    if (editId) {
        await editSupervisor(editId);
    } else {
        alert('ID não fornecido');
        window.location.href = 'supervisores.html';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const supervisor = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value || '',
            celular: document.getElementById('celular').value || null,
            cress: document.getElementById('cress').value,
            regiao: document.getElementById('regiao').value || '',
            cpf: document.getElementById('cpf').value || '',
            escola: document.getElementById('escola').value || '',
            ano_formacao: document.getElementById('ano_formacao').value || '',
            cargo: document.getElementById('cargo').value || '',
            observacoes: document.getElementById('observacoes').value || ''
        };

        const id = document.getElementById('supervisorId').value;
        const url = `/supervisores/${id}`;
        const method = 'PUT';

        const response = await authenticatedFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supervisor)
        });

        // if edit changes the field CRESS, update the identificacao field in the users table too
        if (supervisor.cress !== window.oldCress) {
            await authenticatedFetch(`/auth/users/entity/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identificacao: supervisor.cress })
            });
            window.oldCress = supervisor.cress; // Update for subsequent submits
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao atualizar supervisor');
        }

        // Redirect back to view page after saving
        window.location.href = `view-supervisor.html?id=${id}`;
    });
});

// Function to redirect to view mode
window.viewRecord = function () {
    window.location.href = `view-supervisor.html?id=${window.currentSupervisorId}`;
};
