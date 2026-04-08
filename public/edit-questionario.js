import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        $.ajax({
            url: `/questionarios/${id}`,
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            type: 'GET',
            success: function (data) {
                $('#id').val(data.id);
                $('#title').val(data.title);
                $('#description').val(data.description);
                $('#category').val(data.category);
                $('#target_user_type').val(data.target_user_type);
                $('#is_active').prop('checked', data.is_active);
            },
            error: function () {
                alert('Erro ao carregar dados do questionário.');
            }
        });
    } else {
        alert('ID não fornecido.');
        window.location.href = 'questionario.html';
    }

    $('#editQuestionarioForm').on('submit', function (e) {
        e.preventDefault();

        const formData = {
            title: $('#title').val(),
            description: $('#description').val(),
            category: $('#category').val(),
            target_user_type: $('#target_user_type').val(),
            is_active: $('#is_active').is(':checked'),
            modified: new Date().toISOString().split("T")[0]
        };

        $.ajax({
            url: `/questionarios/${id}`,
            type: 'PUT',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                alert('Questionário atualizado com sucesso!');
                window.location.href = 'view-questionario.html?id=' + id;
            },
            error: function (xhr) {
                alert('Erro ao atualizar questionário: ' + xhr.responseText);
            }
        });
    });
});
