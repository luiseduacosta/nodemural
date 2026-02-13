import { getToken, hasRole } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'supervisor'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (id) {
        $.ajax({
            url: `/questionarios/${id}`,
            type: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            success: function (data) {
                $('#id').text(data.id);
                $('#title').text(data.title);
                $('#description').text(data.description);
                $('#category').text(data.category);
                $('#target_user_type').text(data.target_user_type);
                $('#is_active').text(data.is_active ? 'Sim' : 'Não');
                $('#created').text(new Date(data.created).toLocaleString().slice(0, 19).replace('T', ' '));
                $('#modified').text(new Date(data.modified).toLocaleString().slice(0, 19).replace('T', ' '));

                $('#editBtn').attr('href', `edit-questionario.html?id=${data.id}`);
            },
            error: function () {
                alert('Erro ao carregar dados do questionário.');
            }
        });
    } else {
        alert('ID não fornecido.');
        window.location.href = 'questionario.html';
    }
});
