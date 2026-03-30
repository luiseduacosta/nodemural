// src/controllers/professorController.js
import { getToken, hasRole, authenticatedFetch, getCurrentUser, updateAuthSession } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'professor'])) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = getCurrentUser();

    // If the user is a professor, pre-fill the form with their own data
    if (hasRole('professor')) {
        document.getElementById('nome').value = currentUser.nome;
        document.getElementById('siape').value = currentUser.identificacao;
        document.getElementById('email').value = currentUser.email;
    }

    if ($.fn.inputmask) {
        $('#cpf').inputmask('999.999.999-99');
        $('#telefone').inputmask({
            mask: ["(99) 9999.9999", "(99) 99999.9999"],
            keepStatic: true
        });
        $('#celular').inputmask({
            mask: ["(99) 9999.9999", "(99) 99999.9999"],
            keepStatic: true
        });
       $('#curriculolattes').inputmask({
            mask: '[9999999999999999]',
            greedy: false
       });
    }

    // Initialize EasyMDE
    const observacoesMDE = new EasyMDE({ 
        element: document.getElementById('observacoes'),
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"]
    });


    // Form submission
    const form = document.getElementById('newProfessorForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const professor = {
            nome: document.getElementById('nome').value,
            siape: document.getElementById('siape').value,
            cpf: document.getElementById('cpf').value || null,
            cress: document.getElementById('cress').value || null,
            regiao: document.getElementById('regiao').value || null,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value || null,
            telefone: document.getElementById('telefone').value || null,
            dataingresso: document.getElementById('dataingresso').value || null,
            curriculolattes: document.getElementById('curriculolattes').value || null,
            atualizacaolattes: document.getElementById('atualizacaolattes').value || null,
            departamento: document.getElementById('departamentoId').value,
            dataegresso: document.getElementById('dataegresso').value || null,
            motivoegresso: document.getElementById('motivoegresso').value || null,
            observacoes: observacoesMDE.value() || null
        };

        try {
            const response = await authenticatedFetch('/professores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(professor)
            });

            if (response.ok) {
                const data = await response.json();
                // Only update the user.entidade_id with the data.id if the user.role is 'professor'
                if (currentUser && currentUser.role === 'professor') {
                    const userResponse = await authenticatedFetch(`/auth/users/${currentUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ entidade_id: data.id })
                    });
                    if (userResponse.ok) {
                        const updateData = await userResponse.json();
                        if (updateData.user && updateData.token) {
                            updateAuthSession(updateData.user, updateData.token);
                        }
                    } else {
                        console.error('Failed to update user entidade_id');
                    }
                }
                window.location.href = 'view-professor.html?id=' + data.id;
            }
        } catch (error) {
            console.error('Error creating professor:', error);
            alert(`Erro ao criar professor: ${error.message}`);
        }
    })
});
