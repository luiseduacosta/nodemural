// public/view-atividade.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const atividadeId = urlParams.get('id');

    if (!atividadeId) {
        alert('ID da atividade não fornecido.');
        window.location.href = 'atividades.html';
        return;
    }

    async function loadData() {
        try {
            const response = await authenticatedFetch(`/atividades/${atividadeId}`);
            if (!response.ok) throw new Error('Atividade não encontrada');

            const data = await response.json();
            const estagiarioId = data.estagiario_id;

            // Update UI with activity details
            $('#id').val(data.id);
            $('#estagiario_nome').html(data.aluno_nome ? `<a href="view-aluno.html?id=${data.alunoId}">${data.aluno_nome} (${data.aluno_registro})</a>` : `Estagiário ID: ${data.estagiario_id}`);
            $('#dia').val(new Date(data.dia).toLocaleDateString('pt-BR'));
            $('#inicio').val(data.inicio);
            $('#final').val(data.final);
            $('#horario').val(data.horario);
            $('#atividade').val(data.atividade);

            $('#editBtn').attr('href', `edit-atividade.html?id=${data.id}`);
            $('#newBtn').attr('href', `new-atividade.html?estagiario_id=${data.estagiario_id}`);

            // Set up delete function with correct redirection
            window.deleteRecord = async function () {
                if (confirm('Tem certeza que deseja excluir esta atividade?')) {
                    try {
                        const delResponse = await authenticatedFetch(`/atividades/${data.id}`, {
                            method: 'DELETE'
                        });
                        if (!delResponse.ok) throw new Error('Erro ao excluir atividade');
                        alert('Atividade excluída com sucesso!');
                        window.location.href = 'new-atividade.html?estagiario_id=' + estagiarioId;
                    } catch (err) {
                        console.error('Erro ao excluir atividade:', err);
                        alert('Erro ao excluir atividade: ' + err.message);
                    }
                }
            };

            // Load other activities for this estagiario
            const listResponse = await authenticatedFetch('/atividades?estagiario_id=' + estagiarioId);
            const atividades = await listResponse.json();

            const tableContainer = document.getElementById('atividadeTableContainer');
            tableContainer.innerHTML = '';

            if (atividades.length > 0) {
                let totalMinutes = 0;
                atividades.forEach(item => {
                    const horarioParts = (item.horario || "00:00:00").split(':');
                    const hours = parseInt(horarioParts[0]) || 0;
                    const minutes = parseInt(horarioParts[1]) || 0;
                    totalMinutes += (hours * 60) + minutes;
                });
                const totalHours = Math.floor(totalMinutes / 60);
                const remainingMinutes = totalMinutes % 60;
                const totalFormatted = `${totalHours}h ${remainingMinutes}m`;

                const tableElement = document.createElement('table');
                tableElement.className = 'table table-striped';
                tableElement.innerHTML = `
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Atividade</th>
                            <th>Data</th>
                            <th>Início</th>
                            <th>Final</th>
                            <th>Horário</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${atividades.map(item => `
                            <tr class="${item.id == atividadeId ? 'table-primary' : ''}">
                                <td>${item.id}</td>
                                <td>${item.atividade}</td>
                                <td>${new Date(item.dia).toLocaleDateString('pt-BR')}</td>
                                <td>${item.inicio}</td>
                                <td>${item.final}</td>
                                <td>${item.horario}</td>
                                <td>
                                    <button onclick="window.location.href='view-atividade.html?id=${item.id}'" class="btn btn-sm btn-info">Ver</button>
                                    <button onclick="deleteAtividade(${item.id}, ${estagiarioId})" class="btn btn-sm btn-danger">Excluir</button>
                                </td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td colspan="5" class="text-end"><strong>Total:</strong></td>
                            <td colspan="2"><strong>${totalFormatted}</strong></td>
                        </tr>
                    </tbody>
                `;
                tableContainer.appendChild(tableElement);
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            alert('Erro ao carregar dados: ' + err.message);
        }
    }

    window.deleteAtividade = async function (id, estagiarioId) {
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            try {
                const response = await authenticatedFetch(`/atividades/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Erro ao excluir atividade');
                alert('Atividade excluída com sucesso!');
                if (id == atividadeId) {
                    window.location.href = 'new-atividade.html?estagiario_id=' + estagiarioId;
                } else {
                    await loadData();
                }
            } catch (err) {
                console.error('Erro ao excluir atividade:', err);
                alert('Erro ao excluir atividade: ' + err.message);
            }
        }
    };

    await loadData();
});