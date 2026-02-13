// src/public/edit-docente.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'docente'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('editDocenteForm');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID do docente não fornecido');
        window.location.href = 'docentes.html';
        return;
    }

    // Load docente data
    try {
        const response = await authenticatedFetch(`/docentes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch docente');
        }
        const docente = await response.json();
        document.getElementById('docenteId').value = docente.id;

        // Store original siape to detect changes
        window.oldSiape = docente.siape;
        document.getElementById('nome').value = docente.nome;
        document.getElementById('siape').value = docente.siape;
        document.getElementById('cpf').value = docente.cpf || '';
        document.getElementById('email').value = docente.email;
        document.getElementById('celular').value = docente.celular || '';
        document.getElementById('curriculolattes').value = docente.curriculolattes || '';
        document.getElementById('departamentoID').value = docente.departamento || 'Sem dados';
        document.getElementById('dataegresso').value = docente.dataegresso || '';
        document.getElementById('motivoegresso').value = docente.motivoegresso || '';
        document.getElementById('observacoes').value = docente.observacoes || '';
    } catch (error) {
        console.error('Error loading docente:', error);
        alert(`Erro ao carregar dados do docente: ${error.message}`);
        window.location.href = 'docentes.html';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const docente = {
            nome: document.getElementById('nome').value,
            siape: document.getElementById('siape').value || null,
            cpf: document.getElementById('cpf').value || null,
            celular: document.getElementById('celular').value || null,
            email: document.getElementById('email').value || null,
            curriculolattes: document.getElementById('curriculolattes').value || null,
            departamento: document.getElementById('departamentoID').value,
            dataegresso: document.getElementById('dataegresso').value || null,
            motivoegresso: document.getElementById('motivoegresso').value || null,
            observacoes: document.getElementById('observacoes').value || null
        };

        try {
            const response = await authenticatedFetch(`/docentes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docente)
            });

            // if edit changes the field siape, update the identificacao field in the users table too
            if (docente.siape !== window.oldSiape) {
                await authenticatedFetch(`/auth/users/entity/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificacao: docente.siape })
                });
                window.oldSiape = docente.siape; // Update for subsequent submits
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update docente');
            }

            // Redirect to list page
            window.location.href = 'view-docente.html?id=' + id;
        } catch (error) {
            console.error('Error updating docente:', error);
            alert(`Erro ao atualizar docente: ${error.message}`);
        }
    });
});
