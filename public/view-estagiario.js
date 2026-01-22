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
        console.log(estagiario);
        // Nivel display
        let nivelDisplay = estagiario.nivel;
        if (estagiario.nivel == 9) {
            nivelDisplay = '9 - Continuação (própria conta)';
        }

        // Populate fields
        document.getElementById('view-id').textContent = estagiario.id;
        document.getElementById('view-nivel').textContent = nivelDisplay;
        document.getElementById('view-aluno').textContent = estagiario.aluno_nome || '-';
        document.getElementById('view-aluno-link').href = `view-alunos.html?id=${estagiario.aluno_id}`;
        document.getElementById('view-registro').textContent = estagiario.aluno_registro || '-';
        document.getElementById('view-instituicao').textContent = estagiario.instituicao_nome || '-';
        document.getElementById('view-professor').textContent = estagiario.professor_nome || '-';
        document.getElementById('view-supervisor').textContent = estagiario.supervisor_nome || '-';
        document.getElementById('view-periodo').textContent = estagiario.periodo || '-';
        document.getElementById('view-turma').textContent = estagiario.turma_nome || '-';
        document.getElementById('view-observacoes').textContent = estagiario.observacoes || '-';

        window.currentEstagioId = id;

        // Load atividades
        try {
            const atividadesResponse = await fetch(`/atividades?estagiario_id=${id}`);
            if (atividadesResponse.ok) {
                const atividades = await atividadesResponse.json();
                const tbody = document.getElementById('table-atividades');
                tbody.innerHTML = '';
                if (atividades.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhuma atividade registrada</td></tr>';
                } else {
                    atividades.forEach(atividade => {
                        console.log(atividade);
                        const row = tbody.insertRow();
                        row.insertCell(0).innerText = atividade.id || '-';
                        row.insertCell(1).innerText = atividade.dia ? new Date(atividade.dia).toLocaleDateString('pt-BR') : '-';
                        row.insertCell(2).innerText = atividade.atividade || '-';
                        row.insertCell(3).innerText = atividade.inicio || '-';
                        row.insertCell(4).innerText = atividade.final || '-';
                        row.insertCell(5).innerText = atividade.horario || '-';
                        
                        const actionsCell = row.insertCell(6);
                        actionsCell.innerHTML = `<button class="btn btn-sm btn-primary" onclick="viewAtividade(${atividade.id})">Ver</button>`;
                    });
                }
            }
        } catch (error) {
            console.error('Error loading atividades:', error);
        }
    } catch (error) {
        console.error('Error loading estagiario:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'estagiarios.html';
    }
});

window.viewAtividade = function (atividadeId) {
    window.location.href = `view-atividade.html?id=${atividadeId}`;
};

window.newAtividade = function () {
    window.location.href = `new-atividade.html?estagiario_id=${window.currentEstagioId}`;
};

window.deleteRecord = async function (atividadeId) {
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

window.editAtividade = function (atividadeId) {
    window.location.href = `edit-atividade.html?id=${atividadeId}`;
};
