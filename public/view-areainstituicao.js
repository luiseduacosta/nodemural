// View Area Instituicao Details
import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'areainstituicoes.html';
        return;
    }

    // Fetch the area data
    try {
        const response = await fetch(`/areainstituicoes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch area');
        }
        const area = await response.json();

        // Populate the view fields
        document.getElementById('view-id').textContent = area.id;
        document.getElementById('view-area').textContent = area.area;

        // Setup buttons
        $('#btn-edit').click(() => window.location.href = `edit-areainstituicao.html?id=${id}`);
        $('#btn-delete').click(() => deleteArea(id));

    } catch (error) {
        console.error('Error loading area:', error);
        alert('Erro ao carregar dados da área.');
        window.location.href = 'areainstituicoes.html';
    }

    async function deleteArea(id) {
        if (confirm('Tem certeza que deseja excluir esta área?')) {
            try {
                const response = await fetch(`/areainstituicoes/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Área excluída com sucesso!');
                    window.location.href = 'areainstituicoes.html';
                } else {
                    throw new Error('Erro ao excluir');
                }
            } catch (error) {
                console.error('Error deleting area:', error);
                alert('Erro ao excluir área.');
            }
        }
    }
});
