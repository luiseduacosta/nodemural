import { authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {
    const form = document.getElementById('editInscricaoForm');
    
    // Load alunos for the dropdown
    try {
        const response = await fetch('/alunos');
        const alunos = await response.json();
        const select = document.getElementById('aluno_id');
        
        alunos.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = `${aluno.nome} (${aluno.email})`;
            option.dataset.registro = aluno.registro; // Store registro in data attribute
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading alunos:', error);
    }

    // Auto-populate registro when aluno is selected
    document.getElementById('aluno_id').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.dataset.registro) {
            document.getElementById('registro').value = selectedOption.dataset.registro;
        }
    });

    // Load mural estagios for the dropdown
    try {
        const response = await authenticatedFetch('/mural');
        if (response.status === 401) {
            alert('Faça login para ver os murais.');
            window.location.href = '/login.html';
            return;
        }
        if (response.status === 403) {
            alert('Acesso negado ao listar murais.');
            return;
        }
        const murais = await response.json();
        const select = document.getElementById('muralestagio_id');
        
        murais.forEach(mural => {
            const option = document.createElement('option');
            option.value = mural.id;
            option.textContent = `${mural.instituicao} - ${mural.periodo}`;
            option.dataset.periodo = mural.periodo;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading mural estagios:', error);
    }

    // Update periodo when muralestagio changes
    document.getElementById('muralestagio_id').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption.dataset.periodo) {
            document.getElementById('periodo').value = selectedOption.dataset.periodo;
        }
    });
    
    // Define editInscricao function
    const editInscricao = async (id) => {
        try {
            const response = await fetch(`/inscricoes/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch inscricao');
            }

            const inscricao = await response.json();
            
            // Helper to format date for input
            const formatDateForInput = (date) => {
                if (!date) return '';
                return new Date(date).toISOString().split('T')[0];
            };
            
            document.getElementById('aluno_id').value = inscricao.aluno_id;
            document.getElementById('muralestagio_id').value = inscricao.muralestagio_id;
            document.getElementById('periodo').value = inscricao.periodo;
            document.getElementById('data').value = formatDateForInput(inscricao.data);
            document.getElementById('registro').value = inscricao.registro;
            document.getElementById('inscricaoId').value = inscricao.id;
            
            window.currentInscricaoId = id;
        } catch (error) {
            console.error('Edit error:', error);
            alert(`Error loading inscricao data: ${error.message}`);
            window.location.href = 'inscricoes.html';
        }
    };
    
    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');

    if (editId) {
        await editInscricao(editId);
    } else {
        alert('ID não fornecido');
        window.location.href = 'inscricoes.html';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const inscricao = {
            aluno_id: document.getElementById('aluno_id').value,
            muralestagio_id: document.getElementById('muralestagio_id').value,
            periodo: document.getElementById('periodo').value,
            data: document.getElementById('data').value,
            registro: document.getElementById('registro').value || 0
        };

        const id = document.getElementById('inscricaoId').value;

        try {
            const response = await fetch(`/inscricoes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inscricao)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update inscricao');
            }

            window.location.href = `view-inscricao.html?id=${id}`;
        } catch (error) {
            console.error('Error updating inscricao:', error);
            alert(`Erro ao atualizar inscrição: ${error.message}`);
        }
    });
});

window.viewRecord = function() {
    window.location.href = `view-inscricao.html?id=${window.currentInscricaoId}`;
};
