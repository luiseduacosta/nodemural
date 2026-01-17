$(document).ready(async function () {
    const form = document.getElementById('editDocenteForm');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID do docente não fornecido');
        window.location.href = 'view-docentes.html';
        return;
    }

    // Load docente data
    try {
        const response = await fetch(`/docentes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch docente');
        }

        const docente = await response.json();
        document.getElementById('docenteId').value = docente.id;
        document.getElementById('nome').value = docente.nome;
        document.getElementById('siape').value = docente.siape;
        document.getElementById('email').value = docente.email;
        document.getElementById('celular').value = docente.celular || '';
    } catch (error) {
        console.error('Error loading docente:', error);
        alert(`Erro ao carregar dados do docente: ${error.message}`);
        window.location.href = 'view-docentes.html';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const docente = {
            nome: document.getElementById('nome').value,
            siape: document.getElementById('siape').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value
        };

        try {
            const response = await fetch(`/docentes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docente)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update docente');
            }

            // Redirect to view page
            window.location.href = 'view-docentes.html';
        } catch (error) {
            console.error('Error updating docente:', error);
            alert(`Erro ao atualizar docente: ${error.message}`);
        }
    });
});
