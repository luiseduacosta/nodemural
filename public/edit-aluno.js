// src/public/edit-aluno.js
import { getToken, hasRole, getCurrentUser, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    }

    const user = getCurrentUser();
    // If user is aluno, they can only edit their own record
    if (user.role === 'aluno' && user.entidade_id != id) {
        window.location.href = 'mural.html';
        return;
    }

    // Input Masks
    $('#cep').inputmask('99999-999');
    $('#cpf').inputmask('999.999.999-99');
    $('#nascimento').inputmask('99-99-9999');
    $('#ingresso').inputmask('9999-9'); // Simplified mask for Ingresso

    if (id) {
        loadAluno(id);
    }

    // Form Submission
    $('#editAlunoForm').on('submit', async function (e) {
        e.preventDefault();
        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        const formData = {};
        $(this).serializeArray().forEach(item => {
            formData[item.name] = item.value;
            // console.log(item.name, item.value);
        });

        try {
            const url = id ? `/alunos/${id}` : '/alunos';
            const method = id ? 'PUT' : 'POST';

            const response = await authenticatedFetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // if edit changes the field registro, update the identificacao field in the users table too
            if (formData.registro !== window.oldRegistro) {
                await authenticatedFetch(`/auth/users/entity/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificacao: formData.registro })
                });
                window.oldRegistro = formData.registro; // Update for subsequent submits
            }

            if (response.ok) {
                // Redirect to view page after successful save
                window.location.href = 'view-aluno.html?id=' + id;
            } else {
                const text = await response.text();
                throw new Error(text || 'Erro ao salvar aluno');
            }
        } catch (error) {
            console.error('Error saving aluno:', error);
            alert('Erro ao salvar aluno: ' + error.message);
        }
    });

    // List of date fields to handle specific formatting
    const dateFields = ['nascimento'];

    // Load Aluno
    async function loadAluno(id) {
        try {
            const response = await authenticatedFetch(`/alunos/${id}`);
            if (!response.ok) throw new Error('Failed to fetch aluno');

            const result = await response.json();
            // API returns an array of results
            const data = Array.isArray(result) ? result[0] : result;

            if (!data) {
                throw new Error('Aluno não encontrado');
            }

            console.log('Loading aluno data:', data);

            // Populate form
            Object.keys(data).forEach(key => {
                const input = $(`#${key}`);
                if (input.length) {
                    if (dateFields.includes(key) && data[key]) {
                        // Format date for date input (YYYY-MM-DD)
                        const dateObj = new Date(data[key]);
                        if (!isNaN(dateObj.getTime())) {
                            const formattedDate = dateObj.toISOString().split('T')[0];
                            input.val(formattedDate);
                        }
                    } else {
                        input.val(data[key]);
                    }
                }
            });
            $('#id').val(data.id); // Ensure ID is set

            // Store original registro to detect changes
            window.oldRegistro = data.registro;
        } catch (error) {
            console.error('Error loading aluno:', error);
            alert('Erro ao carregar dados do aluno: ' + error.message);
        }
    }

    // Custom Validation
    function validateForm() {
        let isValid = true;

        // Nascimento: dd-mm-yyyy
        let nascimento = $('#nascimento').val();
        if (nascimento === null || nascimento === '') {
            $('#nascimento').val('');
            $('#nascimento').removeClass('is-invalid');
            isValid = true;
        } else {
            // convert dd/mm/yyyy to yyyy-mm-dd
            nascimento = nascimento.split('/').reverse().join('-');
            $('#nascimento').removeClass('is-invalid');
            $('#nascimento').val(nascimento);
            isValid = true;
        }
        // CEP: 5 digits, trace, 3 digits
        const cep = $('#cep').val();
        const cepRegex = /^\d{5}-\d{3}$/;
        if (cep && !cepRegex.test(cep)) {
            $('#cep').addClass('is-invalid');
            isValid = false;
        } else {
            $('#cep').removeClass('is-invalid');
            isValid = true;
        }

        // CPF: 3.3.3-2
        const cpf = $('#cpf').val();
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        if (cpf && !cpfRegex.test(cpf)) {
            $('#cpf').addClass('is-invalid');
            isValid = false;
        } else {
            $('#cpf').removeClass('is-invalid');
            isValid = true;
        }

        // Ingresso: 4 digit year, trace, 1 digit (0, 1 or 2)
        const ingresso = $('#ingresso').val();
        const ingressoRegex = /^\d{4}-[0-2]$/;

        // The position 1 and 2 of the registro added to 20 is equal to the year of ingresso
        // Registro needs to be equal to 9 digits
        const registro = $('#registro').val();
        if (registro.length === 9) {
            const anoRegistro = parseInt('20' + registro.substring(1, 2));
            const anoIngresso = parseInt(ingresso.substring(0, 4));
            if (anoRegistro !== anoIngresso) {
                $('#ingresso').addClass('is-invalid');
                isValid = false;
            } else {
                $('#ingresso').removeClass('is-invalid');
                isValid = true;
            }
            // If registro is 8 digits the year of the ingresso is equal to '19' + positions 0 and 1
        } else if (registro.length === 8) {
            const anoRegistro = parseInt('19' + registro.substring(0, 2));
            const anoIngresso = parseInt(ingresso.substring(0, 4));
            if (anoRegistro !== anoIngresso) {
                $('#ingresso').addClass('is-invalid');
                isValid = false;
            } else {
                $('#ingresso').removeClass('is-invalid');
                isValid = true;
            }
        } else {
            $('#ingresso').addClass('is-invalid');
            isValid = false;
        }

        if (!ingressoRegex.test(ingresso)) {
            $('#ingresso').addClass('is-invalid');
            isValid = false;
        } else {
            $('#ingresso').removeClass('is-invalid');
            isValid = true;
        }

        return isValid;
    }
});
