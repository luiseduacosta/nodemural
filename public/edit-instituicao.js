// src/public/edit-instituicao.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('instituicaoForm');

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

    // Define editInstituicao function
    const editInstituicao = async (id) => {
        try {
            const response = await authenticatedFetch(`/instituicoes/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch instituicao');
            }

            const instituicao = await response.json();
            document.getElementById('instituicao').value = instituicao.instituicao;
            document.getElementById('cnpj').value = instituicao.cnpj;
            document.getElementById('beneficio').value = instituicao.beneficio || '';
            document.getElementById('instituicaoId').value = instituicao.id;

            if (instituicao.area_instituicoes_id) {
                document.getElementById('area_instituicoes_id').value = instituicao.area_instituicoes_id;
            }

            // Store the ID for view function
            window.currentInstituicaoId = id;
        } catch (error) {
            console.error('Edit error:', error);
            alert(`Error loading instituicao data: ${error.message}`);
            window.location.href = 'instituicao.html';
        }
    };

    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    if (editId) {
        await editInstituicao(editId);
    } else {
        alert('ID não fornecido');
        window.location.href = 'instituicao.html';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const instituicao = {
            instituicao: document.getElementById('instituicao').value,
            cnpj: document.getElementById('cnpj').value,
            beneficio: document.getElementById('beneficio').value,
            area_instituicoes_id: document.getElementById('area_instituicoes_id').value || null
        };

        const id = document.getElementById('instituicaoId').value;
        const url = id ? `/instituicoes/${id}` : '/instituicoes';
        const method = id ? 'PUT' : 'POST';

        await authenticatedFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(instituicao)
        });

        // Redirect back to instituicao list after saving
        window.location.href = `view-instituicao.html?id=${id}`;
    });
});

// Function to redirect to view mode
window.viewRecord = function () {
    window.location.href = `view-instituicao.html?id=${window.currentInstituicaoId}`;
};
