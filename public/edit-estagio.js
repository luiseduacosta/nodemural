$(document).ready(async function () {
    const form = document.getElementById('estagioForm');

    // Define editEstagio function first
    const editEstagio = async (id) => {
        try {
            const response = await fetch(`/estagio/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch estagio');
            }

            const estagio = await response.json();
            document.getElementById('instituicao').value = estagio.instituicao;
            document.getElementById('cnpj').value = estagio.cnpj;
            document.getElementById('area_id').value = estagio.area_id || '';
            document.getElementById('beneficio').value = estagio.beneficio || '';
            document.getElementById('estagioId').value = estagio.id;

            // Store the ID for view function
            window.currentEstagioId = id;
        } catch (error) {
            console.error('Edit error:', error);
            alert(`Error loading estagio data: ${error.message}`);
            window.location.href = 'estagio.html';
        }
    };

    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');
    console.log('urlParams', urlParams);

    if (editId) {
        await editEstagio(editId);
    } else {
        alert('ID não fornecido');
        window.location.href = 'estagio.html';
        console.log('Edit ID:', editId);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const estagio = {
            instituicao: document.getElementById('instituicao').value,
            cnpj: document.getElementById('cnpj').value,
            beneficio: document.getElementById('beneficio').value,
            area_id: document.getElementById('area_id').value || null
        };

        const id = document.getElementById('estagioId').value;
        const url = id ? `/estagio/${id}` : '/estagio';
        const method = id ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(estagio)
        });

        // Redirect back to estagio list after saving
        window.location.href = `view-estagio.html?id=${id}`;
    });
});

// Function to redirect to view mode
window.viewRecord = function () {
    window.location.href = `view-estagio.html?id=${window.currentEstagioId}`;
};
