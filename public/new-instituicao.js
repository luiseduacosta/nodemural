// src/controllers/instituicaoController.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('newInstituicaoForm');

    // Input Masks
    $('#cep').inputmask('99999-999');
    $('#cnpj').inputmask('99.999.999/9999-99');
    $('#telefone').inputmask('(99) 9999-9999');

    // Load areas
    loadAreas();

    async function loadAreas() {
        try {
            const response = await authenticatedFetch('/areainstituicoes');
            if (response.ok) {
                const areas = await response.json();
                const select = document.getElementById('area_id');
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Add area_instituicoes_id to the instituicao object
        const instituicao = {
            instituicao: document.getElementById('instituicao').value,
            cnpj: document.getElementById('cnpj').value,
            natureza: document.getElementById('natureza').value,
            email: document.getElementById('email').value,
            beneficios: document.getElementById('beneficios').value,
            area_id: document.getElementById('area_id').value,
            url: document.getElementById('url').value,
            endereco: document.getElementById('endereco').value,
            bairro: document.getElementById('bairro').value,
            municipio: document.getElementById('municipio').value,
            cep: document.getElementById('cep').value,
            telefone: document.getElementById('telefone').value,
            fim_de_semana: document.getElementById('fim_de_semana').value,
            convenio: document.getElementById('convenio').value,
            expira: document.getElementById('expira').value,
            seguro: document.getElementById('seguro').value,
            observacoes: document.getElementById('observacoes').value
        };

        try {
            const response = await authenticatedFetch('/instituicao', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(instituicao)
            });

            if (!response.ok) {
                throw new Error('Failed to create instituicao');
            }

            const result = await response.json();
            const newId = result.id;

            // Redirect to view page with the new ID
            window.location.href = `view-instituicao.html?id=${newId}`;
        } catch (error) {
            console.error('Error creating instituicao:', error);
            alert(`Erro ao criar instituição: ${error.message}`);
        }
    });
});
