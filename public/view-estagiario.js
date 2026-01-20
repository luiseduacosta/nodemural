$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'estagiarios.html';
        return;
    }

    try {
        const response = await fetch(`/estagiarios/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch estagiario');
        }

        const estagiario = await response.json();

        // Nivel display
        let nivelDisplay = estagiario.nivel;
        if (estagiario.nivel == 9) {
            nivelDisplay = '9 - Continuação (própria conta)';
        }

        // Populate fields
        document.getElementById('view-id').textContent = estagiario.id;
        document.getElementById('view-nivel').textContent = nivelDisplay;
        document.getElementById('view-aluno').textContent = estagiario.aluno_nome || '-';
        document.getElementById('view-registro').textContent = estagiario.aluno_registro || '-';
        document.getElementById('view-instituicao').textContent = estagiario.instituicao_nome || '-';
        document.getElementById('view-professor').textContent = estagiario.professor_nome || '-';
        document.getElementById('view-supervisor').textContent = estagiario.supervisor_nome || '-';
        document.getElementById('view-periodo').textContent = estagiario.periodo || '-';
        document.getElementById('view-turma').textContent = estagiario.turma_nome || '-';
        document.getElementById('view-observacoes').textContent = estagiario.observacoes || '-';

        window.currentEstagioId = id;

    } catch (error) {
        console.error('Error loading estagiario:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'estagiarios.html';
    }
});

window.editRecord = function () {
    window.location.href = `edit-estagiario.html?id=${window.currentEstagioId}`;
};

window.deleteRecord = async function () {
    if (confirm('Tem certeza que deseja excluir este registro de estagiário?')) {
        try {
            const response = await fetch(`/estagiarios/${window.currentEstagioId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete estagiario');
            }
            window.location.href = 'estagiarios.html';
        } catch (error) {
            console.error('Error deleting estagiario:', error);
            alert('Erro ao excluir estagiário');
        }
    }
};
