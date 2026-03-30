// View Professor Details and edit nota e ch de estagiarios
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'professor'])) {
        window.location.href = 'login.html';
        return;
    }

    if (!hasRole('admin')) {
        const excluirProfessor = document.getElementById('btn-excluir_professor');
        excluirProfessor.classList.add('d-none');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'professores.html';
        return;
    }

    try {
        $.ajaxSetup({ headers: { 'Content-Type': 'application/json' } });
        const response = await authenticatedFetch(`/professores/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch professor(a)');
        }

        const professor = await response.json();
        console.log(professor.curriculolattes.split('/').pop());
        if (!professor) {
            throw new Error('Professor(a) não encontrado');
        } 
        
        // Populate the view fields
        $('#view-id').text(professor.id);
        $('#view-siape').text(professor.siape);
        $('#view-nome').text(professor.nome);
        $('#view-cpf').text(professor.cpf || '-');
        $('#view-cress').text(professor.cress || '-');
        $('#view-regiao').text(professor.regiao || '-');
        $('#view-email').text(professor.email);
        $('#view-celular').text(professor.celular || '-');
        $('#view-telefone').text(professor.telefone || '-');
        $('#view-dataingresso').text(professor.dataingresso ? new Date(professor.dataingresso).toLocaleDateString('pt-BR') : '-');
        $('#view-departamento').text(professor.departamento || 'Sem dados');
        $('#view-curriculolattes').html(professor.curriculolattes ? `<a href="http://lattes.cnpq.br/${professor.curriculolattes.split('/').pop()}" target="_blank">${professor.curriculolattes}</a>` : '-');
        $('#view-atualizacaolattes').text(professor.atualizacaolattes ? new Date(professor.atualizacaolattes).toLocaleDateString('pt-BR') : '-');
        $('#view-dataegresso').text(professor.dataegresso ? new Date(professor.dataegresso).toLocaleDateString('pt-BR') : '-');
        $('#view-motivoegresso').text(professor.motivoegresso || '-');
        $('#view-observacoes').text(professor.observacoes || '-');
        window.currentProfessorId = id;

        // Load estagiários for this professor
        loadEstagiarios(id);

    } catch (error) {
        console.error('Error loading professor(a):', error);
        alert(`Erro ao carregar dados do professor(a): ${error.message}`);
        window.location.href = 'professores.html';
    }
});

window.editRecord = function () {
    window.location.href = `edit-professor.html?id=${window.currentProfessorId}`;
};

window.deleteRecord = async function () {
    if (confirm('Tem certeza que deseja excluir este(a) professor(a)?')) {
        try {
            const response = await authenticatedFetch(`/professores/${window.currentProfessorId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete professor(a)');
            }
            window.location.href = 'professores.html';
        } catch (error) {
            console.error('Error deleting professor(a):', error);
            alert('Erro ao excluir professor(a)');
        }
    }
};

async function loadEstagiarios(professorId) {
    try {
        const response = await authenticatedFetch(`/professores/${professorId}/estagiarios`);
        if (!response.ok) {
            throw new Error('Failed to fetch estagiários');
        }

        const estagiarios = await response.json();
        const tbody = document.querySelector('#table-estagiarios tbody');
        tbody.innerHTML = '';

        if (estagiarios.length === 0) {
            document.getElementById('no-estagiarios-msg').classList.remove('d-none');
            document.getElementById('table-estagiarios').classList.add('d-none');
        } else {
            document.getElementById('no-estagiarios-msg').classList.add('d-none');
            document.getElementById('table-estagiarios').classList.remove('d-none');

            estagiarios.forEach(est => {
                const tr = document.createElement('tr');
                tr.dataset.id = est.estagiario_id;
                tr.innerHTML = `
                    <td>${est.estagiario_id}</td>
                    <td>${est.aluno_registro}</td>
                    <td><a href="view-estagiario.html?id=${est.estagiario_id}">${est.aluno_nome}</a></td>
                    <td>${est.estagiario_supervisor_nome || 'N/A'}</td>
                    <td>${est.estagiario_nivel}</td>
                    <td>${est.estagiario_periodo}</td>
                    <td class="editable-field" data-field="ch">${est.estagiario_carga_horaria || ''}</td>
                    <td class="editable-field" data-field="nota">${est.estagiario_nota || ''}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-warning btn-edit">Editar</button>
                        <button class="btn btn-sm btn-primary btn-save" style="display:none">Salvar</button>
                        <button class="btn btn-sm btn-secondary btn-cancel" style="display:none">Cancelar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error loading estagiários:', error);
        document.getElementById('no-estagiarios-msg').classList.remove('d-none');
        document.getElementById('no-estagiarios-msg').textContent = 'Erro ao carregar estagiários.';
        document.getElementById('table-estagiarios').classList.add('d-none');
    }
}

// Setup event delegation for the table
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#table-estagiarios tbody');
    if (!tableBody) return;

    tableBody.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        if (target.classList.contains('btn-edit')) {
            makeRowEditable(row);
        } else if (target.classList.contains('btn-save')) {
            saveRow(row);
        } else if (target.classList.contains('btn-cancel')) {
            cancelEdit(row);
        }
    });
});

// Make row editable, fields 'ch' and 'nota' only
function makeRowEditable(row) {
    row.classList.add('editing');
    const cells = row.querySelectorAll('.editable-field');
    cells.forEach(cell => {
        const text = cell.textContent.trim() === '' ? '' : cell.textContent.trim();
        cell.innerHTML = `<input class="form-control form-control-sm" type="text" value="${text}">`;
    });

    // Toggle buttons
    row.querySelector('.btn-edit').style.display = 'none';
    row.querySelector('.btn-save').style.display = 'inline-block';
    row.querySelector('.btn-cancel').style.display = 'inline-block';
}

// Cancel edit - reload estagiarios to restore original data
async function cancelEdit(row) {
    const professorId = window.currentProfessorId;
    await loadEstagiarios(professorId);
}

// Save row changes
async function saveRow(row) {
    const estagiarioId = row.dataset.id;
    const inputs = row.querySelectorAll('input');
    const updatedData = {};

    inputs.forEach(input => {
        const fieldName = input.closest('td').dataset.field;
        updatedData[fieldName] = input.value;
    });

    try {
        const response = await authenticatedFetch(`/estagiarios/${estagiarioId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            throw new Error('Falha ao atualizar o estagiário.');
        }

        // Reload to show updated data
        const professorId = window.currentProfessorId;
        await loadEstagiarios(professorId);

    } catch (error) {
        alert('Erro ao salvar: ' + error.message);
    }
}
