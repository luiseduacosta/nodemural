import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {
    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        loadTurno(id);
    } else {
        alert('ID não fornecido');
        window.location.href = 'turnos.html';
    }

    $('#editTurnoForm').on('submit', async function (e) {
        e.preventDefault();

        const formData = {};
        $(this).serializeArray().forEach(item => {
            formData[item.name] = item.value;
        });

        try {
            const response = await authenticatedFetch(`/turnos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                window.location.href = 'view-turno.html?id=' + id;
            } else {
                const text = await response.text();
                throw new Error(text || 'Erro ao atualizar turno');
            }
        } catch (error) {
            console.error('Error updating turno:', error);
            alert('Erro ao atualizar turno: ' + error.message);
        }
    });

    async function loadTurno(id) {
        try {
            const response = await authenticatedFetch(`/turnos/${id}`);
            if (!response.ok) throw new Error('Failed to fetch turno');
            const data = await response.json();

            $('#id').val(data.id);
            $('#turno').val(data.turno);
        } catch (error) {
            console.error('Error loading turno:', error);
            alert('Erro ao carregar dados do turno.');
        }
    }
});
