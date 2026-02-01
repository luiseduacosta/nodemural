// src/controllers/supervisorController.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'supervisor'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('editSupervisorForm');

    // Define editSupervisor function first
    const editSupervisor = async (id) => {
        try {
            const response = await fetch(`/supervisores/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch supervisor');
            }

            const supervisor = await response.json();
            document.getElementById('nome').value = supervisor.nome;
            document.getElementById('email').value = supervisor.email || '';
            document.getElementById('celular').value = supervisor.celular || '';
            document.getElementById('cress').value = supervisor.cress;
            document.getElementById('supervisorId').value = supervisor.id;

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
    console.log('urlParams', urlParams);

    if (editId) {
        await editSupervisor(editId);
    } else {
        alert('ID não fornecido');
        window.location.href = 'supervisores.html';
        console.log('Edit ID:', editId);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const supervisor = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value || '',
            celular: document.getElementById('celular').value || null,
            cress: document.getElementById('cress').value
        };

        const id = document.getElementById('supervisorId').value;
        const url = `/supervisores/${id}`;
        const method = 'PUT';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supervisor)
        });

        // Redirect back to view page after saving
        window.location.href = `view-supervisor.html?id=${id}`;
    });
});

// Function to redirect to view mode
window.viewRecord = function () {
    window.location.href = `view-supervisor.html?id=${window.currentSupervisorId}`;
};
