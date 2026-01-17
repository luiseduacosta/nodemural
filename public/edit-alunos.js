$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

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
        if (!validateForm()) return;

        const formData = {};
        $(this).serializeArray().forEach(item => {
            formData[item.name] = item.value;
        });

        try {
            const url = id ? `/alunos/${id}` : '/alunos';
            const method = id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // alert('Aluno salvo com sucesso!');
                window.location.href = 'view-alunos.html?id=' + id;
            } else {
                const text = await response.text();
                throw new Error(text || 'Erro ao salvar aluno');
            }
        } catch (error) {
            console.error('Error saving aluno:', error);
            alert('Erro ao salvar aluno: ' + error.message);
        }
    });

    // Load Aluno
    async function loadAluno(id) {
        try {
            const response = await fetch(`/alunos/${id}`);
            if (!response.ok) throw new Error('Failed to fetch aluno');
            const data = await response.json();
            // console.log(data);

            // Populate form
            Object.keys(data).forEach(key => {
                const input = $(`#${key}`);
                if (input.length) {
                    if (input.attr('type') === 'date' && data[key]) {
                        // Format date for date input if needed (YYYY-MM-DD)
                        // Assuming data[key] comes as ISO string or similar, but simplified here
                        const dataFormatada = new Date(data[key]);
                        // console.log(dataFormatada.toISOString().split('T')[0]);
                        input.val(dataFormatada.toISOString().split('T')[0]);
                    } else {
                        input.val(data[key]);
                    }
                }
            });
            $('#id').val(data.id); // Ensure ID is set
        } catch (error) {
            console.error('Error loading aluno:', error);
            alert('Erro ao carregar dados do aluno.');
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
        // console.log(nascimento);
        // const nascimentoRegex = /^\d{4}-\d{2}-\d{2}$/;
        // if (nascimento && !nascimentoRegex.test(nascimento)) {
        //     $('#nascimento').addClass('is-invalid');
        //     isValid = false;
        // } else {
        //     $('#nascimento').removeClass('is-invalid');
        //        }

        // CEP: 5 digits, trace, 3 digits
        const cep = $('#cep').val();
        const cepRegex = /^\d{5}-\d{3}$/;
        if (cep && !cepRegex.test(cep)) {
            $('#cep').addClass('is-invalid');
            isValid = false;
        } else {
            $('#cep').removeClass('is-invalid');
        }

        // CPF: 3.3.3-2
        const cpf = $('#cpf').val();
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        if (cpf && !cpfRegex.test(cpf)) {
            $('#cpf').addClass('is-invalid');
            isValid = false;
        } else {
            $('#cpf').removeClass('is-invalid');
        }

        // Ingresso: 4 digit year, trace, 1 digit (1 or 2)
        const ingresso = $('#ingresso').val();
        const ingressoRegex = /^\d{4}-[0-2]$/;
        if (!ingressoRegex.test(ingresso)) {
            $('#ingresso').addClass('is-invalid');
            isValid = false;
        } else {
            $('#ingresso').removeClass('is-invalid');
        }

        return isValid;
    }
});
