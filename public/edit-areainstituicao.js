// src/public/edit-areainstituicao.js
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        loadArea(id);
    } else {
        alert('ID não fornecido');
        window.location.href = 'areainstituicoes.html';
    }

    // Form Submission
    $('#editAreaForm').on('submit', async function (e) {
        e.preventDefault();

        const formData = {};
        $(this).serializeArray().forEach(item => {
            formData[item.name] = item.value;
        });

        try {
            const response = await fetch(`/areainstituicoes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                window.location.href = 'view-areainstituicao.html?id=' + id;
            } else {
                const text = await response.text();
                throw new Error(text || 'Erro ao atualizar área');
            }
        } catch (error) {
            console.error('Error updating area:', error);
            alert('Erro ao atualizar área: ' + error.message);
        }
    });

    // Load Area
    async function loadArea(id) {
        try {
            const response = await fetch(`/areainstituicoes/${id}`);
            if (!response.ok) throw new Error('Failed to fetch area');
            const data = await response.json();

            $('#id').val(data.id);
            $('#area').val(data.area);
        } catch (error) {
            console.error('Error loading area:', error);
            alert('Erro ao carregar dados da área.');
        }
    }
});
