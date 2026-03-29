// src/controllers/areaController.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    $('#newAreaForm').on('submit', async function (e) {
        e.preventDefault();

        const formData = {};
        $(this).serializeArray().forEach(item => {
            formData[item.name] = item.value;
        });

        try {
            const response = await authenticatedFetch('/areas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                window.location.href = 'areas.html';
            } else {
                const text = await response.text();
                throw new Error(text || 'Erro ao salvar área');
            }
        } catch (error) {
            console.error('Error saving area:', error);
            alert('Erro ao salvar área: ' + error.message);
        }
    });
});
