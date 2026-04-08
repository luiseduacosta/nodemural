import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {
    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'turnos.html';
        return;
    }

    try {
        const response = await authenticatedFetch(`/turnos/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch turno');
        }
        const turno = await response.json();

        document.getElementById('view-id').textContent = turno.id;
        document.getElementById('view-turno').textContent = turno.turno;

        $('#btn-edit').click(() => window.location.href = `edit-turno.html?id=${id}`);
        $('#btn-delete').click(() => deleteTurno(id));
    } catch (error) {
        console.error('Error loading turno:', error);
        alert('Erro ao carregar dados do turno.');
        window.location.href = 'turnos.html';
    }

    async function deleteTurno(id) {
        if (confirm('Tem certeza que deseja excluir este turno?')) {
            try {
                const response = await authenticatedFetch(`/turnos/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Turno excluído com sucesso!');
                    window.location.href = 'turnos.html';
                } else {
                    throw new Error('Erro ao excluir');
                }
            } catch (error) {
                console.error('Error deleting turno:', error);
                alert('Erro ao excluir turno.');
            }
        }
    }
});
