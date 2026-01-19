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

        $('#mural_periodo_atual').val(data.mural_periodo_atual);
        $('#curso_turma_atual').val(data.curso_turma_atual);

        $('#curso_abertura_inscricoes').val(formatDate(data.curso_abertura_inscricoes));
        $('#curso_encerramento_inscricoes').val(formatDate(data.curso_encerramento_inscricoes));

        $('#termo_compromisso_periodo').val(data.termo_compromisso_periodo);
        $('#termo_compromisso_inicio').val(formatDate(data.termo_compromisso_inicio));
        $('#termo_compromisso_final').val(formatDate(data.termo_compromisso_final));

        $('#periodo_calendario_academico').val(data.periodo_calendario_academico);
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
        mural_periodo_atual: $('#mural_periodo_atual').val(),
        curso_turma_atual: $('#curso_turma_atual').val(),
        curso_abertura_inscricoes: $('#curso_abertura_inscricoes').val(),
        curso_encerramento_inscricoes: $('#curso_encerramento_inscricoes').val(),
        termo_compromisso_periodo: $('#termo_compromisso_periodo').val(),
        termo_compromisso_inicio: $('#termo_compromisso_inicio').val(),
        termo_compromisso_final: $('#termo_compromisso_final').val(),
        periodo_calendario_academico: $('#periodo_calendario_academico').val()
    };

    $.ajax({
        url: '/configuracoes',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(formData),
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
