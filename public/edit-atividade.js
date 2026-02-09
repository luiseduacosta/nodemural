// src/public/edit-atividade.js
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

    $('#atividadeId').val(atividadeId);

    // Populate Estagiarios dropdown first
    try {
        const estagiariosResponse = await authenticatedFetch('/estagiarios');
        const estagiariosData = await estagiariosResponse.json();
        const select = $('#estagiario_id');
        estagiariosData.forEach(estagiario => {
            const label = estagiario.aluno_nome
                ? `${estagiario.aluno_nome} (${estagiario.instituicao_nome || 'Sem Instituição'})`
                : `ID: ${estagiario.id}`;
            select.append(new Option(label, estagiario.id));
        });

        // specific activity details
        const atividadeResponse = await authenticatedFetch(`/atividades/${atividadeId}`);
        if (!atividadeResponse.ok) throw new Error('Atividade não encontrada');

        const data = await atividadeResponse.json();

        // Format date for input type="date" (YYYY-MM-DD)
        const dateObj = new Date(data.dia);
        const dateStr = dateObj.toISOString().split('T')[0];

        $('#estagiario_id').val(data.estagiario_id);
        $('#dia').val(dateStr);
        $('#inicio').val(data.inicio);
        $('#final').val(data.final);
        $('#atividade').val(data.atividade);
        $('#horario').val(data.horario);

    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        alert('Erro ao carregar dados: ' + err.message);
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

    $('#editAtividadeForm').on('submit', async function (e) {
        e.preventDefault();

        const atividadeData = {
            estagiario_id: $('#estagiario_id').val(),
            dia: $('#dia').val(),
            inicio: $('#inicio').val(),
            final: $('#final').val(),
            atividade: $('#atividade').val(),
            horario: $('#horario').val()
        };

        try {
            const response = await authenticatedFetch(`/atividades/${atividadeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(atividadeData)
            });

            if (response.ok) {
                alert('Atividade atualizada com sucesso!');
                window.location.href = 'view-atividade.html?id=' + atividadeId;
            } else {
                const error = await response.json();
                alert('Erro ao atualizar atividade: ' + (error.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar com o servidor.');
        }
    });
});
