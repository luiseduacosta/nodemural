$(document).ready(async function () {

    $('#newQuestionarioForm').on('submit', function (e) {
        e.preventDefault();

        const formData = {
            title: $('#title').val(),
            description: $('#description').val(),
            category: $('#category').val(),
            target_user_type: $('#target_user_type').val(),
            is_active: $('#is_active').is(':checked'),
            created: new Date().toISOString().split("T")[0],
            modified: new Date().toISOString().split("T")[0]
        };

        $.ajax({
            url: '/questionarios',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                alert('Questionário criado com sucesso!');
                window.location.href = 'questionario.html';
            },
            error: function (xhr) {
                alert('Erro ao criar questionário: ' + xhr.responseText);
            }
        });
    });
});