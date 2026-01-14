$(document).ready(function () {
    const form = document.getElementById('newSupervisorForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const supervisor = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value,
            cress: document.getElementById('cress').value
        };

        try {
            const response = await fetch('/supervisores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supervisor)
            });

            if (!response.ok) {
                throw new Error('Failed to create supervisor');
            }

            const result = await response.json();
            const newId = result.id;

            // Redirect to view page with the new ID
            window.location.href = `view-supervisor.html?id=${newId}`;
        } catch (error) {
            console.error('Error creating supervisor:', error);
            alert(`Erro ao criar supervisor: ${error.message}`);
        }
    });
});
