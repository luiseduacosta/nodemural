// src/public/edit-estagio.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('estagioForm');

    // Input Masks
    $('#cnpj').inputmask('99.999.999/9999-99');

    // Load areas first
    await loadAreas();

    async function loadAreas() {
        try {
            const response = await authenticatedFetch('/areainstituicoes');
            if (response.ok) {
                const areas = await response.json();
                const select = document.getElementById('area_instituicoes_id');
                areas.forEach(area => {
                    const option = document.createElement('option');
                    option.value = area.id;
                    option.textContent = area.area;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading areas:', error);
        }
    }

    // Define editEstagio function
    const editEstagio = async (id) => {
        try {
            const response = await authenticatedFetch(`/estagios/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch estagio');
            }

            const estagio = await response.json();
            document.getElementById('instituicao').value = estagio.instituicao;
            document.getElementById('cnpj').value = estagio.cnpj;
            document.getElementById('beneficio').value = estagio.beneficio || '';
            document.getElementById('estagioId').value = estagio.id;

            if (estagio.area_instituicoes_id) {
                document.getElementById('area_instituicoes_id').value = estagio.area_instituicoes_id;
            }

            // Store the ID for view function
            window.currentEstagioId = id;
        } catch (error) {
            console.error('Edit error:', error);
            alert(`Error loading estagio data: ${error.message}`);
            window.location.href = 'estagio.html';
        }
    };

    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    if (editId) {
        await editEstagio(editId);
    } else {
        alert('ID não fornecido');
        window.location.href = 'estagio.html';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const estagio = {
            instituicao: document.getElementById('instituicao').value,
            cnpj: document.getElementById('cnpj').value,
            beneficio: document.getElementById('beneficio').value,
            area_instituicoes_id: document.getElementById('area_instituicoes_id').value || null
        };

        const id = document.getElementById('estagioId').value;
        const url = id ? `/estagios/${id}` : '/estagios';
        const method = id ? 'PUT' : 'POST';

        await authenticatedFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(estagio)
        });

        // Redirect back to estagio list after saving
        window.location.href = `view-estagio.html?id=${id}`;
    });
});

// Function to redirect to view mode
window.viewRecord = function () {
    window.location.href = `view-estagio.html?id=${window.currentEstagioId}`;
};
