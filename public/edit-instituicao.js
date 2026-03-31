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
    $('#telefone').inputmask('(99) 9999-9999');
    $('#celular').inputmask({
        mask: ["(99) 9999-9999", "(99) 99999-9999"],
        keepStatic: true
    });

    // Load areas first
    await loadAreas();

    const formatDateForInput = (dateValue) => {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    };

    async function loadAreas() {
        try {
            const response = await authenticatedFetch('/areas');
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

    // Define editInstituicao function
    const editInstituicao = async (id) => {
        try {
            const response = await authenticatedFetch(`/instituicoes/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch instituicao');
            }

            const instituicao = await response.json();
            document.getElementById('instituicaoId').value = instituicao.id || null;
            document.getElementById('instituicao').value = instituicao.instituicao || null;
            document.getElementById('cnpj').value = instituicao.cnpj || null;
            document.getElementById('beneficios').value = instituicao.beneficios || null;
            document.getElementById('area_id').value = instituicao.area_id || null;
            document.getElementById('natureza').value = instituicao.natureza || null;
            document.getElementById('email').value = instituicao.email || null;
            document.getElementById('telefone').value = instituicao.telefone || null;
            document.getElementById('url').value = instituicao.url || null;
            document.getElementById('cep').value = instituicao.cep || null;
            document.getElementById('endereco').value = instituicao.endereco || null;
            document.getElementById('bairro').value = instituicao.bairro || null;
            document.getElementById('municipio').value = instituicao.municipio || null;
            document.getElementById('fim_de_semana').value = instituicao.fim_de_semana || null;
            document.getElementById('convenio').value = instituicao.convenio || null;
            document.getElementById('expira').value = formatDateForInput(instituicao.expira) || null;
            document.getElementById('seguro').value = instituicao.seguro || null;
            document.getElementById('observacoes').value = instituicao.observacoes || null;

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
            cnpj: document.getElementById('cnpj').value || '',
            beneficios: document.getElementById('beneficios').value || null,
            area_id: document.getElementById('area_id').value || null,
            natureza: document.getElementById('natureza').value || null,
            url: document.getElementById('url').value || null,
            email: document.getElementById('email').value || null,
            telefone: document.getElementById('telefone').value || null,
            cep: document.getElementById('cep').value || null,
            endereco: document.getElementById('endereco').value || null,
            bairro: document.getElementById('bairro').value || '',
            municipio: document.getElementById('municipio').value || '',
            fim_de_semana: document.getElementById('fim_de_semana').value || '',
            convenio: document.getElementById('convenio').value || null,
            expira: document.getElementById('expira').value || null,
            seguro: document.getElementById('seguro').value || null,
            observacoes: document.getElementById('observacoes').value || null,
            // Add other fields as needed
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
