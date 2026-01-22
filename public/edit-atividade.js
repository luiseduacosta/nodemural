$(document).ready(async function () {
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
        const estagiariosResponse = await fetch('/estagiarios');
        const estagiariosData = await estagiariosResponse.json();
        const select = $('#estagiario_id');
        estagiariosData.forEach(estagiario => {
            const label = estagiario.aluno_nome
                ? `${estagiario.aluno_nome} (${estagiario.instituicao_nome || 'Sem Instituição'})`
                : `ID: ${estagiario.id}`;
            select.append(new Option(label, estagiario.id));
        });

        // specific activity details
        const atividadeResponse = await fetch(`/atividades/${atividadeId}`);
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

    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        alert('Erro ao carregar dados: ' + err.message);
    }

    $('#editAtividadeForm').on('submit', async function (e) {
        e.preventDefault();

        const atividadeData = {
            estagiario_id: $('#estagiario_id').val(),
            dia: $('#dia').val(),
            inicio: $('#inicio').val(),
            final: $('#final').val(),
            atividade: $('#atividade').val()
        };

        try {
            const response = await fetch(`/atividades/${atividadeId}`, {
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
