$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'visitas.html';
        return;
    }

    try {
        const response = await fetch(`/visitas/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch visitas');
        }

        const visita = await response.json();

        const formatDate = (date) => {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('pt-BR');
        };

        document.getElementById('view-id').textContent = visita.id;
        document.getElementById('view-instituicao').textContent = visita.instituicao || 'N/A';
        document.getElementById('view-data').textContent = formatDate(visita.data);
        document.getElementById('view-responsavel').textContent = visita.responsavel;
        document.getElementById('view-motivo').textContent = visita.motivo;
        document.getElementById('view-avaliacao').textContent = visita.avaliacao;
        document.getElementById('view-descricao').textContent = visita.descricao || 'N/A';

        window.currentVisitaId = id;
    } catch (error) {
        console.error('Error loading visita:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'visitas.html';
    }
});

window.editRecord = function () {
    window.location.href = `edit-visita.html?id=${window.currentVisitaId}`;
};

window.deleteRecord = async function () {
    if (confirm('Tem certeza que deseja excluir esta visita?')) {
        try {
            const response = await fetch(`/visitas/${window.currentVisitaId}`, { method: 'DELETE' });
            if (response.ok) {
                window.location.href = 'visitas.html';
            } else {
                throw new Error('Failed to delete visita');
            }
        } catch (error) {
            console.error('Error deleting visita:', error);
            alert(`Erro ao excluir visita: ${error.message}`);
        }
    }
};
