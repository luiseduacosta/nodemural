// src/controllers/docenteController.js
import { getToken, hasRole, authenticatedFetch, getCurrentUser, updateAuthSession } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'docente'])) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = getCurrentUser();

    // If the user is a docente, pre-fill the form with their own data
    if (hasRole('docente')) {
        document.getElementById('nome').value = currentUser.nome;
        document.getElementById('siape').value = currentUser.identificacao;
        document.getElementById('email').value = currentUser.email;
    }

    const form = document.getElementById('newDocenteForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const docente = {
            nome: document.getElementById('nome').value,
            siape: document.getElementById('siape').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value,
            curriculolattes: document.getElementById('curriculolattes').value,
            departamento: document.getElementById('departamentoId').value,
            dataegresso: document.getElementById('dataegresso').value,
            motivoegresso: document.getElementById('motivoegresso').value,
            observacoes: document.getElementById('observacoes').value
        };

        try {
            const response = await authenticatedFetch('/docentes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docente)
            });

            if (response.ok) {
                const data = await response.json();
                // Only update the user.entidade_id with the data.id if the user.role is 'docente'
                if (currentUser && currentUser.role === 'docente') {
                    const userResponse = await authenticatedFetch(`/auth/users/${currentUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entidade_id: data.id })
                    });
                    if (userResponse.ok) {
                        const updateData = await userResponse.json();
                        if (updateData.user && updateData.token) {
                            updateAuthSession(updateData.user, updateData.token);
                        }
                    } else {
                        console.error('Failed to update user entidade_id');
                    }
                }
                window.location.href = 'view-docente.html?id=' + data.id;
            }
        } catch (error) {
            console.error('Error creating docente:', error);
            alert(`Erro ao criar docente: ${error.message}`);
        }
    })
});