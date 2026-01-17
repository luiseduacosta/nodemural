$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'docentes.html';
        return;
    }

    try {
        const response = await fetch(`/docentes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch docente');
        }

        const docente = await response.json();

        $('#view-id').text(docente.id);
        $('#view-siape').text(docente.siape);
        $('#view-nome').text(docente.nome);
        $('#view-email').text(docente.email);
        $('#view-celular').text(docente.celular || '-');

        window.currentDocenteId = id;

    } catch (error) {
        console.error('Error loading docente:', error);
        alert(`Erro ao carregar dados do docente: ${error.message}`);
        window.location.href = 'docentes.html';
    }
});

window.editRecord = function () {
    window.location.href = `edit-docentes.html?id=${window.currentDocenteId}`;
};

window.deleteRecord = async function () {
    if (confirm('Tem certeza que deseja excluir este docente?')) {
        try {
            const response = await fetch(`/docentes/${window.currentDocenteId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete docente');
            }
            window.location.href = 'docentes.html';
        } catch (error) {
            console.error('Error deleting docente:', error);
            alert('Erro ao excluir docente');
        }
    }
};
