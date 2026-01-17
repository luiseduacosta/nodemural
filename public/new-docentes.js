$(document).ready(function () {
    const form = document.getElementById('newDocenteForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const docente = {
            nome: document.getElementById('nome').value,
            siape: document.getElementById('siape').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value
        };

        try {
            const response = await fetch('/docentes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docente)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create docente');
            }

            // Redirect to view page
            window.location.href = 'view-docentes.html/' + await response.json().id;
        } catch (error) {
            console.error('Error creating docente:', error);
            alert(`Erro ao criar docente: ${error.message}`);
        }
    });
});
