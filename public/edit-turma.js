//
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'turmas.html';
        return;
    }

    // Load turma data
    try {
        const response = await fetch(`/turmas/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch turma');
        }

        const turma = await response.json();

        document.getElementById('id').value = turma.id;
        document.getElementById('area').value = turma.area;

    } catch (error) {
        console.error('Error loading turma:', error);
        alert(`Erro ao carregar dados da turma: ${error.message}`);
        window.location.href = 'turmas.html';
    }

    // Handle form submission
    const form = document.getElementById('editTurmaForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const turma = {
            area: document.getElementById('area').value.trim()
        };

        try {
            const response = await fetch(`/turmas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(turma)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update turma');
            }

            window.location.href = `view-turma.html?id=${id}`;
        } catch (error) {
            console.error('Error updating turma:', error);
            alert(`Erro ao atualizar turma: ${error.message}`);
        }
    });
});
