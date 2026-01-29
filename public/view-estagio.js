$(document).ready(async function () {
    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'estagio.html';
        return;
    }

    // Fetch the estagio data
    try {
        const response = await fetch(`/estagio/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch estagio');
        }

        const estagio = await response.json();

        // Populate the view fields
        document.getElementById('view-id').textContent = estagio.id;
        document.getElementById('view-instituicao').textContent = estagio.instituicao;
        document.getElementById('view-area').textContent = estagio.area_nome || 'Não definida';
        document.getElementById('view-cnpj').textContent = estagio.cnpj;
        document.getElementById('view-beneficio').textContent = estagio.beneficio || 'Sem dados';

        // Store the ID for edit function
        window.currentEstagioId = id;

        // Check if there are visitas for this instituição
        await checkVisitas();

        // Load mural items
        await fetchMural(id);

        // Load supervisores
        await fetchSupervisores(id);

    } catch (error) {
        console.error('Error loading estagio:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'estagio.html';
    }
});

// Function to redirect to edit mode
window.editRecord = function () {
    window.location.href = `edit-estagio.html?id=${window.currentEstagioId}`;
};

async function checkVisitas() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    try {
        const response = await fetch(`/visitas?instituicao_id=${id}`);
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
        const response = await fetch(`/estagio/${id}/mural`);
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
        const response = await fetch(`/estagio/${id}/supervisores`);
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
}
