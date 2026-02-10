// src/public/new-supervisor.js
import { getToken, hasRole, authenticatedFetch, getCurrentUser } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'supervisor'])) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = getCurrentUser();

    // If the user is a supervisor, pre-fill the form with their own data
    if (hasRole('supervisor')) {
        document.getElementById('nome').value = currentUser.nome;
        document.getElementById('email').value = currentUser.email;
        document.getElementById('cress').value = currentUser.identificacao;
    }

    const form = document.getElementById('newSupervisorForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const supervisor = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value || null,
            celular: document.getElementById('celular').value || '',
            cress: document.getElementById('cress').value
        };

        try {
            const response = await authenticatedFetch('/supervisores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${getToken()}` },
                body: JSON.stringify(supervisor)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create supervisor');
            }

            const result = await response.json();
            const newId = result.id;

            // Update user.entidade_id if user role is 'supervisor'
            if (currentUser && currentUser.role === 'supervisor') {
                // If entidade_id exists, it must match the new supervisor id
                if (currentUser.entidade_id && currentUser.entidade_id !== newId) {
                    alert('Erro: ID da entidade não corresponde ao supervisor criado.');
                    return;
                }
                const userResponse = await authenticatedFetch(`/auth/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${getToken()}` },
                    body: JSON.stringify({ entidade_id: newId })
                });
                if (!userResponse.ok) {
                    console.error('Failed to update user entidade_id');
                }
            }

            // Redirect to view page with the new ID
            window.location.href = `view-supervisor.html?id=${newId}`;
        } catch (error) {
            console.error('Error creating supervisor:', error);
            alert(`Erro ao criar supervisor: ${error.message}`);
        }
    });
});
