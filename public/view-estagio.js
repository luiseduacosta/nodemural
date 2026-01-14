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
        document.getElementById('view-beneficio').textContent = estagio.beneficio || 'N/A';
        
        // Store the ID for edit function
        window.currentEstagioId = id;
    } catch (error) {
        console.error('Error loading estagio:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'estagio.html';
    }
});

// Function to redirect to edit mode
window.editRecord = function() {
    window.location.href = `edit-estagio.html?id=${window.currentEstagioId}`;
};
