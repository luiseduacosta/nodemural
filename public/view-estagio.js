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
        document.getElementById('view-cnpj').textContent = estagio.cnpj;
        document.getElementById('view-beneficio').textContent = estagio.beneficio || 'Sem dados';

        // Store the ID for edit function
        window.currentEstagioId = id;

        // Check if there are visitas for this instituição
        await checkVisitas();

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
