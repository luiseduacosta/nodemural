$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'inscricoes.html';
        return;
    }

    try {
        const response = await fetch(`/inscricoes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch inscricao');
        }

        const inscricao = await response.json();
        
        // Helper function to format dates
        const formatDate = (date) => {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('pt-BR');
        };

        const formatDateTime = (datetime) => {
            if (!datetime) return 'N/A';
            const date = new Date(datetime);
            return date.toLocaleString('pt-BR');
        };

        // Populate fields
        document.getElementById('view-id').textContent = inscricao.id;
        document.getElementById('view-registro').textContent = inscricao.registro;
        document.getElementById('view-aluno').textContent = inscricao.aluno_nome || 'N/A';
        document.getElementById('view-instituicao').textContent = inscricao.instituicao || 'N/A';
        document.getElementById('view-periodo').textContent = inscricao.periodo;
        document.getElementById('view-data').textContent = formatDate(inscricao.data);
        document.getElementById('view-timestamp').textContent = formatDateTime(inscricao.timestamp);
        
        window.currentInscricaoId = id;
    } catch (error) {
        console.error('Error loading inscricao:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'inscricoes.html';
    }
});

window.editRecord = function() {
    window.location.href = `edit-inscricao.html?id=${window.currentInscricaoId}`;
};

window.deleteRecord = async function() {
    if (confirm('Tem certeza que deseja excluir esta inscrição?')) {
        try {
            const response = await fetch(`/inscricoes/${window.currentInscricaoId}`, { method: 'DELETE' });
            if (response.ok) {
                window.location.href = 'inscricoes.html';
            } else {
                throw new Error('Failed to delete inscricao');
            }
        } catch (error) {
            console.error('Error deleting inscricao:', error);
            alert(`Erro ao excluir inscrição: ${error.message}`);
        }
    }
};
