$(document).ready(function () {

    loadConfig();

    $('#configForm').on('submit', function (e) {
        e.preventDefault();
        saveConfig();
    });
});

function loadConfig() {
    $.getJSON('/configuracoes', function (data) {
        // Helper to format date YYYY-MM-DD
        function formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toISOString().split('T')[0];
        }
        console.log(data[0].mural_periodo_atual);
        $('#mural_periodo_atual').val(data[0].mural_periodo_atual);

        $('#termo_compromisso_periodo').val(data[0].termo_compromisso_periodo);
        $('#termo_compromisso_inicio').val(formatDate(data[0].termo_compromisso_inicio));
        $('#termo_compromisso_final').val(formatDate(data[0].termo_compromisso_final));

        $('#periodo_calendario_academico').val(data[0].periodo_calendario_academico);
        $('#curso_turma_atual').val(data[0].curso_turma_atual);
        $('#curso_abertura_inscricoes').val(formatDate(data[0].curso_abertura_inscricoes));
        $('#curso_encerramento_inscricoes').val(formatDate(data[0].curso_encerramento_inscricoes));
    })
        .fail(function (jqXHR) {
            if (jqXHR.status === 404) {
                showToast('Nenhuma configuração encontrada. Salve para criar (se a tabela estiver vazia, pode falhar se não houver ID 1).');
            } else {
                showToast('Erro ao carregar configurações: ' + jqXHR.responseText);
            }
        });
}

function saveConfig() {
    const formData = {
        id: 1,  // Always update the configuration with ID 1
        mural_periodo_atual: $('#mural_periodo_atual').val(),
        termo_compromisso_periodo: $('#termo_compromisso_periodo').val(),
        termo_compromisso_inicio: $('#termo_compromisso_inicio').val(),
        termo_compromisso_final: $('#termo_compromisso_final').val(),
        periodo_calendario_academico: $('#periodo_calendario_academico').val(),
        curso_turma_atual: $('#curso_turma_atual').val(),
        curso_abertura_inscricoes: $('#curso_abertura_inscricoes').val(),
        curso_encerramento_inscricoes: $('#curso_encerramento_inscricoes').val(),
    };

    $.ajax({
        // Put the id in the URL to match the controller expectation
        url: '/configuracoes/' + formData.id,
        type: 'PUT',
        dataType: 'json',
        data: JSON.stringify(formData),
        contentType: 'application/json',
        success: function () {
            showToast('Configurações salvas com sucesso!');
        },
        error: function (xhr) {
            showToast('Erro ao salvar: ' + xhr.responseText);
        }
    });
}

function showToast(message) {
    $('#toastMessage').text(message);
    const toastLiveExample = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastLiveExample);
    toast.show();
}
