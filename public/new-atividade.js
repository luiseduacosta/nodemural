// src/controllers/atividadeController.js
import { authenticatedFetch, getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    }

    const estagiarioId = new URLSearchParams(window.location.search).get('estagiario_id');
    if (!estagiarioId) {
        alert('ID do estagiário não fornecido.');
        window.location.href = 'estagiarios.html';
        return;
    }
    if (estagiarioId) {
        try {
            // Read all atividades of the estagiario
            const responseatividade = await authenticatedFetch('/atividades?estagiario_id=' + estagiarioId);
            const atividade = await responseatividade.json();
            if (atividade.length > 0) {
                let totalMinutes = 0;
                // Calculate total horario with minutes
                atividade.forEach(item => {
                    const horarioParts = item.horario.split(':');
                    const hours = parseInt(horarioParts[0]) || 0;
                    const minutes = parseInt(horarioParts[1]?.replace('m', '')) || 0;
                    totalMinutes += (hours * 60) + minutes;
                });
                const totalHours = Math.floor(totalMinutes / 60);
                const remainingMinutes = totalMinutes % 60;
                const totalFormatted = `${totalHours}h ${remainingMinutes}m`;
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
                    <tr><td colspan="5" class="text-end"><strong>Total:</strong></td><td colspan="2"><strong>${totalFormatted}</strong></td></tr>
                </tbody>
            `;
                const append = document.getElementById('atividadeTableContainer');
                append.appendChild(tableElement);
                // Continua ...;
            }
        } catch (error) {
            console.error('Erro ao buscar dados da atividade:', error);
        }

        // Read one estagiario
        try {
            const response = await authenticatedFetch('/estagiarios/' + estagiarioId);
            const estagiario = await response.json();
            document.getElementById('id').innerHTML = estagiario.aluno_id;
            document.getElementById('registro').innerHTML = estagiario.aluno_registro;
            document.getElementById('nome').innerHTML = estagiario.aluno_nome;
            document.getElementById('periodo').innerHTML = estagiario.periodo;
            document.getElementById('nivel').innerHTML = estagiario.nivel;
            document.getElementById('instituicao_nome').innerHTML = estagiario.instituicao_nome;
        } catch (error) {
            console.error('Erro ao buscar dados do estagiário:', error);
        }
    } else {
        alert('ID do estagiário não fornecido.');
        window.location.href = 'estagiarios.html';
        return;
    }

    // Calculate and display horario when inicio or final changes
    function calculateHorario() {
        const inicio = $('#inicio').val();
        const final = $('#final').val();
        
        if (inicio && final) {
            const inicioDate = new Date('1970-01-01T' + inicio + 'Z');
            const finalDate = new Date('1970-01-01T' + final + 'Z');
            const diffTime = finalDate - inicioDate;
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            $('#horario').val(`${diffHours}h ${diffMinutes}m`);
        }
    }

    $('#inicio, #final').on('change', calculateHorario);

    $('#newAtividadeForm').on('submit', async function (e) {
        e.preventDefault();

        const atividadeData = {
            estagiario_id: estagiarioId,
            dia: $('#dia').val(),
            inicio: $('#inicio').val(),
            final: $('#final').val(),
            atividade: $('#atividade').val(),
            horario: $('#horario').val()
        };

        try {
            const response = await authenticatedFetch('/atividades', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(atividadeData)
            });
            if (response.ok) {
                // alert('Atividade criada com sucesso!');
                window.location.href = 'new-atividade.html?estagiario_id=' + estagiarioId;
            } else {
                const error = await response.json();
                alert('Erro ao criar atividade: ' + (error.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        }
    });

    window.deleteAtividade = async function (atividadeId) {
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            try {
                const response = await authenticatedFetch(`/atividades/${atividadeId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Erro ao excluir atividade');
                alert('Atividade excluída com sucesso!');
                window.location.href = 'atividades.html?estagiario_id=' + estagiarioId;
            }
            catch (err) {
                console.error('Erro ao excluir atividade:', err);
                alert('Erro ao excluir atividade: ' + err.message);
            }
        }
    };
}); 