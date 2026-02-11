// src/public/new-supervisor.js
import { getToken, hasRole, authenticatedFetch, getCurrentUser, updateAuthSession } from './auth-utils.js';

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
            // Verificar se o(a) supervisor(a) já existe. If yes abort the creation. Can't have two supervisors with the same CRESS.
            const existingSupervisor = await authenticatedFetch(`/supervisores/cress/${supervisor.cress}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (existingSupervisor.ok) {
                throw new Error('CRESS do(a) supervisor(a) já existe');
            }
            const response = await authenticatedFetch('/supervisores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supervisor)
            });
            if (!response.ok) {
                throw new Error('Falha ao criar supervisor');
            }
            const result = await response.json();
            const newId = result.id || (result.user && result.user.entidade_id);

            // If result contains user and token, update the session
            if (result.user && result.token) {
                updateAuthSession(result.user, result.token);
            }

            // Update user.entidade_id if user role is 'supervisor'
            if (currentUser && currentUser.role === 'supervisor') {
                const userResponse = await authenticatedFetch(`/auth/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ entidade_id: newId })
                });

                if (userResponse.ok) {
                    const updateData = await userResponse.json();
                    if (updateData.user && updateData.token) {
                        updateAuthSession(updateData.user, updateData.token);
                    }
                } else {
                    throw new Error('Falha ao atualizar entidade_id do usuário');
                }
            }

            // Redirect to view page with the new ID
            const supervisorId = newId;
            window.location.href = `view-supervisor.html?id=${supervisorId}`;
        } catch (error) {
            alert(`Erro ao criar supervisor: ${error.message}`);
        }
    });
});
