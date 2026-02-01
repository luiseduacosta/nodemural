// View Atividade Details
import { getToken, hasRole } from './auth-utils.js';

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

    // Populate initial data for the atividade details
    try {
        const response = await fetch(`/atividades/${atividadeId}`);
        if (!response.ok) throw new Error('Atividade não encontrada');

        const data = await response.json();
        const estagiarioId = data.estagiario_id;

        try {
            // Read all atividades of the estagiario
            const responseatividade = await fetch('/atividades?estagiario_id=' + estagiarioId);
            const atividade = await responseatividade.json();
            if (atividade.length > 0) {
                const table = document.getElementById('atividadeTableContainer');
                table.innerHTML = '';  // Clear previous content
                // Put here a table with the atividade of the estagiario
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
                        ${atividade.map(atividade => `
                            <tr>
                                <td>${atividade.id}</td>
                                <td>${atividade.atividade}</td>
                                <!-- Format date from YYYY-MM-DD to DD/MM/YYYY -->
                                <td>${new Date(atividade.dia).toLocaleDateString('pt-BR')}</td>
                                <td>${atividade.inicio}</td>
                                <td>${atividade.final}</td>
                                <td>${atividade.horario}</td>
                                <td>
                                    <button onclick="window.location.href='view-atividade.html?id=${atividade.id}'" class="btn btn-sm btn-info">Ver</button>
                                    <button onclick="deleteAtividade(${atividade.id})" class="btn btn-sm btn-danger">Excluir</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
                const append = document.getElementById('atividadeTableContainer');
                append.appendChild(tableElement);
                // Continua ...;
            }
        } catch (error) {
            console.error('Erro ao buscar dados da atividade:', error);
        }
    } catch (err) {
        console.error('Erro ao carregar dados iniciais:', err);
        alert('Erro ao carregar dados iniciais: ' + err.message);
    }

    try {
        const response = await fetch(`/atividades/${atividadeId}`);
        if (!response.ok) throw new Error('Atividade não encontrada');

        const data = await response.json();

        $('#id').val(data.id);
        $('#estagiario_nome').html(data.aluno_nome ? `<a href="view-alunos.html?id=${data.alunoId}">${data.aluno_nome} (${data.aluno_registro})</a>` : `Estagiário ID: ${data.estagiario_id}`);

        const dateObj = new Date(data.dia);
        $('#dia').val(dateObj.toLocaleDateString('pt-BR'));

        $('#inicio').val(data.inicio);
        $('#final').val(data.final);
        $('#horario').val(data.horario);
        $('#atividade').val(data.atividade);

        $('#editBtn').attr('href', `edit-atividade.html?id=${data.id}`);
        $('#newBtn').attr('href', `new-atividade.html?estagiario_id=${data.estagiario_id}`);
        $('#deleteBtn').attr('onclick', `deleteRecord(${data.id})`);
        $('#viewBtn').attr('href', `view-atividade.html?id=${data.id}`);

    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        alert('Erro ao carregar dados: ' + err.message);
    }

    // Need to store current estagiario ID for new atividade operation
    window.currentEstagiarioId = estagiarioId;
    // Store current atividade ID for delete operation
    window.currentAtividadeId = atividadeId;
    // Delete atividade function
    window.deleteRecord = async function (atividadeId) {
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            try {
                const response = await fetch(`/atividades/${atividadeId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Erro ao excluir atividade');
                alert('Atividade excluída com sucesso!');
                window.location.href = 'view-atividade.html?estagiario_id=' + estagiarioId;
            } catch (err) {
                console.error('Erro ao excluir atividade:', err);
                alert('Erro ao excluir atividade: ' + err.message);
            }
        }
    };
}); 