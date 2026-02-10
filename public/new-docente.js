// src/controllers/docenteController.js
import { getToken, hasRole, authenticatedFetch, getCurrentUser } from './auth-utils.js';

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
                    // If entidade_id exists, it must match the new docente id
                    if (currentUser.entidade_id && currentUser.entidade_id !== data.id) {
                        alert('Erro: ID da entidade não corresponde ao docente criado.');
                        return;
                    }
                    const userResponse = await fetch(`/auth/users/${currentUser.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({ entidade_id: data.id })
                    });
                    if (!userResponse.ok) {
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