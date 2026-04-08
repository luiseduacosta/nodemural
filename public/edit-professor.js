// src/public/edit-professor.js
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

/**
 * Telefone/celular legados: 8 ou 9 dígitos (sem DDD) assume DDD 21; 10 ou 11 dígitos mantém;
 * demais casos retorna string vazia.
 */
function normalizeLegacyPhoneDigits(raw) {
    if (raw == null || String(raw).trim() === '') {
        return '';
    }
    const d = String(raw).replace(/\D/g, '');
    if (d.length === 8 || d.length === 9) {
        return `21${d}`;
    }
    if (d.length === 10 || d.length === 11) {
        return d;
    }
    return '';
}

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'professor'])) {
        window.location.href = 'login.html';
        return;
    }

    const form = document.getElementById('editProfessorForm');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID do professor não fornecido');
        window.location.href = 'professores.html';
        return;
    }

    // Mask: Data format
    $('#dataingresso').inputmask('99/99/9999');
    $('#dataegresso').inputmask('99/99/9999');
    $('#cpf').inputmask('999.999.999-99');
    $('#telefone').inputmask({
        mask: ['(99) 9999.9999', '(99) 99999.9999'],
        keepStatic: true
    });
    $('#celular').inputmask({
        mask: ['(99) 9999.9999', '(99) 99999.9999'],
        keepStatic: true
    });
    // Digits 16 characters
    $('#curriculolattes').inputmask({
        mask: '[9999999999999999]',
        greedy: false
    });

    // Initialize EasyMDE
    const observacoesMDE = new EasyMDE({ 
        element: document.getElementById('observacoes'),
        toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen", "|", "guide"]
    });

    // Load professor data
    try {
        const response = await authenticatedFetch(`/professores/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch professor');
        }
        const professor = await response.json();
        if (!professor) {
            throw new Error('Professor não encontrado');
        }

        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };

        // Populate the form fields
        $('#professorId').val(professor.id);

        if (professor.telefone != null && professor.telefone !== '') {
            professor.telefone = normalizeLegacyPhoneDigits(professor.telefone);
        }
        if (professor.celular != null && professor.celular !== '') {
            professor.celular = normalizeLegacyPhoneDigits(professor.celular);
        }

        // Store original siape to detect changes
        window.oldSiape = professor.siape;
        document.getElementById('nome').value = professor.nome;
        document.getElementById('siape').value = professor.siape;
        document.getElementById('cpf').value = professor.cpf || null;
        document.getElementById('cress').value = professor.cress || null;
        document.getElementById('regiao').value = professor.regiao || null;
        document.getElementById('email').value = professor.email || null;
        document.getElementById('telefone').value = professor.telefone || null;
        document.getElementById('celular').value = professor.celular || null;
        document.getElementById('curriculolattes').value = professor.curriculolattes || null;
        document.getElementById('atualizacaolattes').value = formatDateForInput(professor.atualizacaolattes);
        document.getElementById('dataingresso').value = formatDateForInput(professor.dataingresso);
        document.getElementById('departamentoID').value = professor.departamento || 'Sem dados';
        document.getElementById('dataegresso').value = formatDateForInput(professor.dataegresso);
        document.getElementById('motivoegresso').value = professor.motivoegresso || '';
        
        // Load into EasyMDE
        if (professor.observacoes) {
            observacoesMDE.value(professor.observacoes);
        }
    } catch (error) {
        console.error('Error loading professor:', error);
        alert(`Erro ao carregar dados do professor: ${error.message}`);
        window.location.href = 'professores.html';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Add cress and regiao fields to the professor object
        const professor = {
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
            const response = await authenticatedFetch(`/professores/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(professor)
            });

            // if edit changes the field siape, update the identificacao field in the users table too
            if (professor.siape !== window.oldSiape) {
                await authenticatedFetch(`/auth/users/entity/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identificacao: professor.siape })
                });
                window.oldSiape = professor.siape; // Update for subsequent submits
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update professor');
            }

            // Redirect to list page
            window.location.href = 'view-professor.html?id=' + id;
        } catch (error) {
            console.error('Error updating professor:', error);
            alert(`Erro ao atualizar professor: ${error.message}`);
        }
    });
});
