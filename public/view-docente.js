// View Docente Details and edit nota e ch de estagiarios
import { getToken, hasRole, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    if (!getToken() || !hasRole(['admin', 'docente'])) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'docentes.html';
        return;
    }

    try {
        $.ajaxSetup({ headers: { 'Content-Type': 'application/json' } });
        const response = await authenticatedFetch(`/docentes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch docente');
        }

        const docente = await response.json();

        $('#view-id').text(docente.id);
        $('#view-siape').text(docente.siape);
        $('#view-nome').text(docente.nome);
        $('#view-email').text(docente.email);
        $('#view-celular').text(docente.celular || '-');
        $('#view-departamento').text(docente.departamento || 'Sem dados');
        $('#view-curriculolattes').html(docente.curriculolattes ? `<a href="http://lattes.cnpq.br/${docente.curriculolattes}" target="_blank">${docente.curriculolattes}</a>` : '-');
        $('#view-dataegresso').text(docente.dataegresso ? new Date(docente.dataegresso).toLocaleDateString() : '-');
        $('#view-motivoegresso').text(docente.motivoegresso || '-');
        $('#view-observacoes').text(docente.observacoes || '-');
        window.currentDocenteId = id;

        // Load estagiários for this docente
        loadEstagiarios(id);

    } catch (error) {
        console.error('Error loading docente:', error);
        alert(`Erro ao carregar dados do docente: ${error.message}`);
        window.location.href = 'docentes.html';
    }
});

window.editRecord = function () {
    window.location.href = `edit-docente.html?id=${window.currentDocenteId}`;
};

window.deleteRecord = async function () {
    if (confirm('Tem certeza que deseja excluir este docente?')) {
        try {
            const response = await authenticatedFetch(`/docentes/${window.currentDocenteId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete docente');
            }
            window.location.href = 'docentes.html';
        } catch (error) {
            console.error('Error deleting docente:', error);
            alert('Erro ao excluir docente');
        }
    }
};

async function loadEstagiarios(docenteId) {
    try {
        const response = await authenticatedFetch(`/docentes/${docenteId}/estagiarios`);
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
    const docenteId = window.currentDocenteId;
    await loadEstagiarios(docenteId);
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
        const docenteId = window.currentDocenteId;
        await loadEstagiarios(docenteId);

    } catch (error) {
        alert('Erro ao salvar: ' + error.message);
    }
}
