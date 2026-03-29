// src/public/edit-docente.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'docente'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('editDocenteForm');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID do docente não fornecido');
        window.location.href = 'docentes.html';
        return;
    }

    // Mask: Data format
    $('#dataingresso').inputmask('99/99/9999');
    $('#dataegresso').inputmask('99/99/9999');
    $('#cpf').inputmask('999.999.999-99');
    $('#telefone').inputmask({
        mask: ["(99) 9999.9999", "(99) 99999.9999"],
        keepStatic: true
    });
    $('#celular').inputmask({
        mask: ["(99) 9999.9999", "(99) 99999.9999"],
        keepStatic: true
    });
    $('#atualizacaolattes').inputmask('99/99/9999');

    // Initialize EasyMDE
    const observacoesMDE = new EasyMDE({ 
        element: document.getElementById('observacoes'),
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"]
    });

    // Load docente data
    try {
        const response = await authenticatedFetch(`/docentes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch docente');
        }
        const docente = await response.json();
        if (!docente) {
            throw new Error('Docente não encontrado');
        }

        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        // Populate the form fields
        $('#docenteId').val(docente.id);

        // Store original siape to detect changes
        window.oldSiape = docente.siape;
        document.getElementById('nome').value = docente.nome;
        document.getElementById('siape').value = docente.siape;
        document.getElementById('cpf').value = docente.cpf || '';
        document.getElementById('cress').value = docente.cress || '';
        document.getElementById('regiao').value = docente.regiao || '';
        document.getElementById('email').value = docente.email;
        document.getElementById('celular').value = docente.celular || '';
        document.getElementById('telefone').value = docente.telefone || '';
        document.getElementById('curriculolattes').value = docente.curriculolattes || '';
        document.getElementById('atualizacaolattes').value = formatDateForInput(docente.atualizacaolattes);
        document.getElementById('dataingresso').value = formatDateForInput(docente.dataingresso);
        document.getElementById('departamentoID').value = docente.departamento || 'Sem dados';
        document.getElementById('dataegresso').value = formatDateForInput(docente.dataegresso);
        document.getElementById('motivoegresso').value = docente.motivoegresso || '';
        
        // Load into EasyMDE
        if (docente.observacoes) {
            observacoesMDE.value(docente.observacoes);
        }
    } catch (error) {
        console.error('Error loading docente:', error);
        alert(`Erro ao carregar dados do docente: ${error.message}`);
        window.location.href = 'docentes.html';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Add cress and regiao fields to the docente object
        const docente = {
            nome: document.getElementById('nome').value,
            siape: document.getElementById('siape').value || null,
            cpf: document.getElementById('cpf').value || null,
            cress: document.getElementById('cress').value || null,
            regiao: document.getElementById('regiao').value || null,
            celular: document.getElementById('celular').value || null,
            telefone: document.getElementById('telefone').value || null,
            email: document.getElementById('email').value || null,
            curriculolattes: document.getElementById('curriculolattes').value || null,
            atualizacaolattes: document.getElementById('atualizacaolattes').value || null,
            dataingresso: document.getElementById('dataingresso').value || null,
            departamento: document.getElementById('departamentoID').value || null,
            dataegresso: document.getElementById('dataegresso').value || null,
            motivoegresso: document.getElementById('motivoegresso').value || null,
            observacoes: observacoesMDE.value() || null
        };

        try {
            const response = await authenticatedFetch(`/docentes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docente)
            });

            // if edit changes the field siape, update the identificacao field in the users table too
            if (docente.siape !== window.oldSiape) {
                await authenticatedFetch(`/auth/users/entity/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificacao: docente.siape })
                });
                window.oldSiape = docente.siape; // Update for subsequent submits
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update docente');
            }

            // Redirect to list page
            window.location.href = 'view-docente.html?id=' + id;
        } catch (error) {
            console.error('Error updating docente:', error);
            alert(`Erro ao atualizar docente: ${error.message}`);
        }
    });
});
