// src/public/new-turma.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('newTurmaForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const turma = {
            area: document.getElementById('area').value.trim()
        };

        try {
            const response = await fetch('/turmas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(turma)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create turma');
            }

            const result = await response.json();
            window.location.href = `view-turma.html?id=${result.id}`;
        } catch (error) {
            console.error('Error creating turma:', error);
            alert(`Erro ao criar turma de estágio: ${error.message}`);
        }
    });
});
