// src/public/view-instituicao.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

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
        window.location.href = 'instituicao.html';
        return;
    }

    // Fetch the instituicao data
    try {
        const response = await authenticatedFetch(`/instituicoes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch instituicao');
        }

        const formatDateForInput = (dateValue) => {
            if (!dateValue) return '';
            const date = new Date(dateValue);
            if (Number.isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        };

        const instituicao = await response.json();

        // Populate the view fields
        document.getElementById('view-id').textContent = instituicao.id;
        document.getElementById('view-instituicao').textContent = instituicao.instituicao;
        document.getElementById('view-area').textContent = instituicao.area_nome || 'Não definida';
        document.getElementById('view-cnpj').textContent = instituicao.cnpj;
        document.getElementById('view-beneficios').textContent = instituicao.beneficios || 'Sem dados';
        document.getElementById('view-natureza').textContent = instituicao.natureza || 'Sem dados';
        document.getElementById('view-email').textContent = instituicao.email || 'Sem dados';
        document.getElementById('view-url').textContent = instituicao.url || 'Sem dados';
        document.getElementById('view-endereco').textContent = instituicao.endereco || 'Sem dados';
        document.getElementById('view-bairro').textContent = instituicao.bairro || 'Sem dados';
        document.getElementById('view-municipio').textContent = instituicao.municipio || 'Sem dados';
        document.getElementById('view-cep').textContent = instituicao.cep || 'Sem dados';
        document.getElementById('view-telefone').textContent = instituicao.telefone || 'Sem dados';
        document.getElementById('view-fim_de_semana').textContent = instituicao.fim_de_semana || 'Sem dados';
        document.getElementById('view-convenio').textContent = instituicao.convenio || 'Sem dados';
        document.getElementById('view-expira').textContent = formatDateForInput(instituicao.expira) || 'Sem dados';
        document.getElementById('view-seguro').textContent = instituicao.seguro == '0' ? 'Não' : instituicao.seguro == '1' ? 'Sim' : '';
        document.getElementById('view-observacoes').textContent = instituicao.observacoes || 'Sem dados';

        // Store the ID for edit function
        window.currentInstituicaoId = id;

        // Check if there are visitas for this instituição
        await checkVisitas();

        // Load mural items
        await fetchMural(id);

        // Load supervisores
        await fetchSupervisores(id);

    } catch (error) {
        console.error('Error loading instituicao:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'instituicao.html';
    }
});

// Function to redirect to edit mode
window.editRecord = function () {
    window.location.href = `edit-instituicao.html?id=${window.currentInstituicaoId}`;
};

async function checkVisitas() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    try {
        const response = await authenticatedFetch(`/visitas?instituicao_id=${id}`);
        if (response.ok) {
            const visitas = await response.json();
            if (visitas.length > 0) {
                // Has visitas - go to visitas list filtered by this institution
                window.verVisitas = function () {
                    window.location.href = `visitas.html?instituicao_id=${id}`;
                };
            } else {
                // No visitas - go to new-visita with institution pre-selected
                window.verVisitas = function () {
                    window.location.href = `new-visita.html?instituicao_id=${id}`;
                };
            }
        }
    } catch (error) {
        console.error('Error checking visitas:', error);
        // Default to new visita if error
        window.verVisitas = function () {
            window.location.href = `new-visita.html?instituicao_id=${id}`;
        };
    }
}

async function fetchMural(id) {
    try {
        const response = await authenticatedFetch(`/instituicoes/${id}/mural`);
        if (response.ok) {
            const murals = await response.json();
            const tbody = document.querySelector('#table-mural tbody');
            tbody.innerHTML = '';

            if (murals.length === 0) {
                document.getElementById('no-mural-msg').classList.remove('d-none');
                document.getElementById('table-mural').classList.add('d-none');
            } else {
                document.getElementById('no-mural-msg').classList.add('d-none');
                document.getElementById('table-mural').classList.remove('d-none');

                murals.forEach(m => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${m.id}</td>
                        <td>${m.periodo}</td>
                        <td>${m.vagas}</td>
                        <td>
                            <a href="#" class="btn btn-sm btn-info">Ver</a>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    } catch (error) {
        console.error('Error fetching mural:', error);
    }
}

async function fetchSupervisores(id) {
    try {
        const response = await authenticatedFetch(`/instituicoes/${id}/supervisores`);
        if (response.ok) {
            const supervisores = await response.json();
            const tbody = document.querySelector('#table-supervisores tbody');
            tbody.innerHTML = '';

            if (supervisores.length === 0) {
                document.getElementById('no-supervisores-msg').classList.remove('d-none');
                document.getElementById('table-supervisores').classList.add('d-none');
            } else {
                document.getElementById('no-supervisores-msg').classList.add('d-none');
                document.getElementById('table-supervisores').classList.remove('d-none');

                supervisores.forEach(s => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${s.id}</td>
                        <td>${s.nome}</td>
                        <td>${s.email}</td>
                        <td>${s.telefone}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } else {
            document.getElementById('no-supervisores-msg').classList.remove('d-none');
            document.getElementById('table-supervisores').classList.add('d-none');
        }
    } catch (error) {
        console.error('Error fetching supervisores:', error);
    }

    // Function to delete the record
    window.deleteRecord = async function () {
        const confirmDelete = confirm('Tem certeza de que deseja excluir este registro?');
        if (confirmDelete) {
            try {
                const response = await authenticatedFetch(`/instituicoes/${window.currentInstituicaoId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert('Registro excluído com sucesso!');
                    window.location.href = 'instituicoes.html';
                } else {
                    throw new Error('Failed to delete record');
                }
            } catch (error) {
                console.error('Error deleting record:', error);
                alert(`Erro ao excluir registro: ${error.message}`);
            }
        }
    }
}
