$(document).ready(function () {
    const form = document.getElementById('newEstagioForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const estagio = {
            instituicao: document.getElementById('instituicao').value,
            cnpj: document.getElementById('cnpj').value,
            beneficio: document.getElementById('beneficio').value
        };

        try {
            const response = await fetch('/estagio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(estagio)
            });

            if (!response.ok) {
                throw new Error('Failed to create estagio');
            }

            const result = await response.json();
            const newId = result.id;

            // Redirect to view page with the new ID
            window.location.href = `view-estagio.html?id=${newId}`;
        } catch (error) {
            console.error('Error creating estagio:', error);
            alert(`Erro ao criar instituição: ${error.message}`);
        }
    });
});
