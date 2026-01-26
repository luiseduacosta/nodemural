$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'docentes.html';
        return;
    }

    try {
        $.ajaxSetup({ headers: { 'Content-Type': 'application/json' } });
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
        $('#view-departamento').text(docente.departamento || 'Sem dados');
        $('#view-curriculolattes').html(docente.curriculolattes ? `<a href="http://lattes.cnpq.br/${docente.curriculolattes}" target="_blank">${docente.curriculolattes}</a>` : '-');
        $('#view-dataegresso').text(docente.dataegresso ? new Date(docente.dataegresso).toLocaleDateString() : '-');
        $('#view-motivoegresso').text(docente.motivoegresso || '-');
        $('#view-observacoes').text(docente.observacoes || '-');
        window.currentDocenteId = id;

        // Load estagiários for this docente
        loadEstagiarios(id);

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

async function loadEstagiarios(docenteId) {
    try {
        const response = await fetch(`/docentes/${docenteId}/estagiarios`);
        if (!response.ok) {
            throw new Error('Failed to fetch estagiários');
        }

        const estagiarios = await response.json();
        const tbody = document.querySelector('#table-estagiarios tbody');
        tbody.innerHTML = '';

        if (estagiarios.length === 0) {
            document.getElementById('no-estagiarios-msg').classList.remove('d-none');
            document.getElementById('table-estagiarios').classList.add('d-none');
        } else {
            document.getElementById('no-estagiarios-msg').classList.add('d-none');
            document.getElementById('table-estagiarios').classList.remove('d-none');

            estagiarios.forEach(est => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${est.estagiario_id}</td>
                    <td>${est.aluno_registro}</td>
                    <td><a href="view-alunos.html?id=${est.aluno_id}">${est.aluno_nome}</a></td>
                    <td>${est.estagiario_supervisor_nome || 'N/A'}</td>
                    <td>${est.estagiario_nivel}</td>
                    <td>${est.estagiario_periodo}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error loading estagiários:', error);
        document.getElementById('no-estagiarios-msg').classList.remove('d-none');
        document.getElementById('no-estagiarios-msg').textContent = 'Erro ao carregar estagiários.';
        document.getElementById('table-estagiarios').classList.add('d-none');
    }
}
