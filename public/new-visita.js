$(document).ready(async function () {
    const form = document.getElementById('newVisitaForm');

    // Get instituicao_id from URL if present
    const urlParams = new URLSearchParams(window.location.search);
    const instituicaoId = urlParams.get('instituicao_id');

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('data').value = today;

    // Load instituições for the dropdown
    try {
        const response = await fetch('/estagio');
        const instituicoes = await response.json();
        const select = document.getElementById('instituicao_id');
        
        instituicoes.forEach(inst => {
            const option = document.createElement('option');
            option.value = inst.id;
            option.textContent = inst.instituicao;
            if (instituicaoId && inst.id == instituicaoId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading instituições:', error);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const visita = {
            instituicao_id: document.getElementById('instituicao_id').value,
            data: document.getElementById('data').value,
            responsavel: document.getElementById('responsavel').value,
            motivo: document.getElementById('motivo').value,
            avaliacao: document.getElementById('avaliacao').value,
            descricao: document.getElementById('descricao').value || null
        };

        try {
            const response = await fetch('/visitas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(visita)
            });

            if (!response.ok) {
                throw new Error('Failed to create visita');
            }

            const result = await response.json();
            const newId = result.id;

            // Redirect to view page with the new ID
            window.location.href = `view-visita.html?id=${newId}`;
        } catch (error) {
            console.error('Error creating visita:', error);
            alert(`Erro ao criar visita: ${error.message}`);
        }
    });
});
