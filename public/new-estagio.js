$(document).ready(function () {
    const form = document.getElementById('newEstagioForm');

    // Input Masks
    $('#cnpj').inputmask('99.999.999/9999-99');
    
    // Load areas
    loadAreas();

    async function loadAreas() {
        try {
            const response = await fetch('/areainstituicoes');
            if (response.ok) {
                const areas = await response.json();
                const select = document.getElementById('area_instituicoes_id');
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Add area_instituicoes_id to the estagio object
        const estagio = {
            instituicao: document.getElementById('instituicao').value,
            cnpj: document.getElementById('cnpj').value,
            beneficio: document.getElementById('beneficio').value,
            area_instituicoes_id: document.getElementById('area_instituicoes_id').value
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
