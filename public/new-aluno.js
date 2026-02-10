// src/controllers/alunoController.js
import { getToken, hasRole, getCurrentUser } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'aluno'])) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = getCurrentUser();

    // If the user is a aluno, pre-fill the form with their own data
    if (hasRole('aluno')) {
        const currentUser = getCurrentUser();
        document.getElementById('nome').value = currentUser.nome;
        document.getElementById('registro').value = currentUser.identificacao;
        document.getElementById('email').value = currentUser.email;
    }

    // Input Masks
    $('#cep').inputmask('99999-999');
    $('#cpf').inputmask('999.999.999-99');
    $('#nascimento').inputmask('99-99-9999');
    $('#ingresso').inputmask('9999-9'); // Simplified mask for Ingresso

    // Form Submission
    $('#newAlunoForm').on('submit', async function (e) {
        e.preventDefault();
        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        const formData = {};
        $(this).serializeArray().forEach(item => {
            formData[item.name] = item.value;
        });

        try {
            const response = await fetch('/alunos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                // Check if user is aluno and needs entidade_id update
                if (currentUser && currentUser.role === 'aluno') {
                    // If entidade_id exists, it must match the new aluno id
                    if (currentUser.entidade_id && currentUser.entidade_id !== data.id) {
                        alert('Erro: ID da entidade não corresponde ao aluno criado.');
                        return;
                    }
                    // Update user.entidade_id with the new aluno id
                    const userResponse = await fetch(`/auth/users/${currentUser.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify({ entidade_id: data.id })
                    });
                    if (!userResponse.ok) {
                        console.error('Failed to update user entidade_id');
                    }
                }
                window.location.href = 'view-aluno.html?id=' + data.id;
            } else {
                const text = await response.text();
                throw new Error(text || 'Erro ao salvar aluno');
            }
        } catch (error) {
            console.error('Error saving aluno:', error);
            alert('Erro ao salvar aluno: ' + error.message);
        }
    });

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
