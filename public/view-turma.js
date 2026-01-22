$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'turmas.html';
        return;
    }

    try {
        const response = await fetch(`/turma_estagios/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch turma');
        }

        const turma = await response.json();

        $('#view-id').text(turma.id);
        $('#view-area').text(turma.area);

        window.currentTurmaId = id;

    } catch (error) {
        console.error('Error loading turma:', error);
        alert(`Erro ao carregar dados da turma: ${error.message}`);
        window.location.href = 'turmas.html';
    }
});

window.editRecord = function () {
    window.location.href = `edit-turma.html?id=${window.currentTurmaId}`;
};

window.deleteRecord = async function () {
    if (confirm('Tem certeza que deseja excluir esta turma de estágio?')) {
        try {
            const response = await fetch(`/turma_estagios/${window.currentTurmaId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete turma');
            }
            window.location.href = 'turmas.html';
        } catch (error) {
            console.error('Error deleting turma:', error);
            alert('Erro ao excluir turma de estágio');
        }
    }
};
