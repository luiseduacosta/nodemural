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
        window.currentProfessorEstagiarios = Array.isArray(estagiarios) ? estagiarios : [];
        await populatePeriodoFilter(window.currentProfessorEstagiarios);
        renderEstagiariosByPeriodo();
    } catch (error) {
        console.error('Error loading estagiários:', error);
        document.getElementById('no-estagiarios-msg').classList.remove('d-none');
        document.getElementById('no-estagiarios-msg').textContent = 'Erro ao carregar estagiários.';
        document.getElementById('table-estagiarios').classList.add('d-none');
    }
}

function getSelectedPeriodoProfessor() {
    const select = document.getElementById('periodoFilterProfessor');
    const value = select ? String(select.value || '').trim() : 'Todos';
    return value || 'Todos';
}

function renderEstagiariosByPeriodo() {
    const periodo = getSelectedPeriodoProfessor();
    const all = Array.isArray(window.currentProfessorEstagiarios) ? window.currentProfessorEstagiarios : [];
    const filtered = periodo !== 'Todos'
        ? all.filter(e => String((e && e.estagiario_periodo) || '').trim() === periodo)
        : all;
    renderEstagiariosTable(filtered);
}

function renderEstagiariosTable(estagiarios) {
    const tbody = document.querySelector('#table-estagiarios tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const tableEl = document.getElementById('table-estagiarios');
    const emptyEl = document.getElementById('no-estagiarios-msg');

    if (!estagiarios || estagiarios.length === 0) {
        if (emptyEl) emptyEl.classList.remove('d-none');
        if (tableEl) tableEl.classList.add('d-none');
        return;
    }

    if (emptyEl) emptyEl.classList.add('d-none');
    if (tableEl) tableEl.classList.remove('d-none');

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

async function populatePeriodoFilter(estagiarios) {
    const select = document.getElementById('periodoFilterProfessor');
    if (!select) return;

    const currentValue = select.value;
    const periods = Array.from(new Set((estagiarios || []).map(e => String(e?.estagiario_periodo || '').trim()).filter(Boolean)));
    periods.sort((a, b) => b.localeCompare(a));

    const hadCustomOptions = Array.from(select.options).some(o => o.value !== 'Todos');
    if (!hadCustomOptions) {
        select.innerHTML = '<option value="Todos">Todos</option>';
        periods.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            select.appendChild(opt);
        });

        try {
            const configRes = await authenticatedFetch('/configuracoes');
            if (configRes.ok) {
                const config = await configRes.json();
                if (config?.termo_compromisso_periodo) {
                    select.value = String(config.termo_compromisso_periodo);
                }
            }
        } catch (_) {
        }
    }

    if (hadCustomOptions && currentValue) {
        select.value = currentValue;
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

    const periodoSelect = document.getElementById('periodoFilterProfessor');
    if (periodoSelect) {
        periodoSelect.addEventListener('change', () => {
            renderEstagiariosByPeriodo();
        });
    }
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
async function cancelEdit() {
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

window.printProfessorEstagiariosPdf = async function () {
    try {
        const professorId = window.currentProfessorId;
        if (!professorId) {
            throw new Error('Professor inválido');
        }

        const jsPDF = window && window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
        if (!jsPDF) {
            throw new Error('jsPDF não carregado');
        }

        const select = document.getElementById('periodoFilterProfessor');
        const periodo = select ? String(select.value || '').trim() : 'Todos';

        let estagiarios = Array.isArray(window.currentProfessorEstagiarios) ? window.currentProfessorEstagiarios : [];
        if (estagiarios.length === 0) {
            const res = await authenticatedFetch(`/professores/${professorId}/estagiarios`);
            if (!res.ok) throw new Error('Falha ao carregar estagiários');
            const data = await res.json();
            estagiarios = Array.isArray(data) ? data : [];
        }

        const filtered = periodo && periodo !== 'Todos'
            ? estagiarios.filter(e => String(e?.estagiario_periodo || '').trim() === periodo)
            : estagiarios;

        const doc = new jsPDF({ orientation: 'l', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 10;
        const marginTop = 12;
        const marginBottom = 10;

        const professorNomeEl = document.getElementById('view-nome');
        const professorNome = professorNomeEl ? String(professorNomeEl.textContent || '').trim() : '';

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Relatório de Estagiários', marginX, marginTop);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        if (professorNome) doc.text(`Professor(a): ${professorNome}`, marginX, marginTop + 6);
        doc.text(`Período: ${periodo || 'Todos'}`, marginX, marginTop + 11);

        let y = marginTop + 18;

        const colAlunoX = marginX;
        const colInstX = marginX + 55;
        const colSupX = marginX + 115;
        const colNivelX = marginX + 160;
        const colChX = marginX + 175;
        const colNotaX = marginX + 190;

        const widths = {
            aluno: colInstX - colAlunoX - 2,
            inst: colSupX - colInstX - 2,
            sup: colNivelX - colSupX - 2,
            nivel: colChX - colNivelX - 2,
            ch: colNotaX - colChX - 2,
            nota: (pageWidth - marginX) - colNotaX
        };

        const writeHeader = () => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('Aluno', colAlunoX, y);
            doc.text('Instituição', colInstX, y);
            doc.text('Supervisor', colSupX, y);
            doc.text('Nível', colNivelX, y);
            doc.text('CH', colChX, y);
            doc.text('Nota', colNotaX, y);
            doc.setFont('helvetica', 'normal');
            y += 6;
            doc.setDrawColor(180);
            doc.line(marginX, y - 4, pageWidth - marginX, y - 4);
        };

        writeHeader();

        const rows = filtered.slice().sort((a, b) => {
            const an = String((a && a.aluno_nome) || '');
            const bn = String((b && b.aluno_nome) || '');
            return an.localeCompare(bn, 'pt-BR');
        });

        for (const r of rows) {
            const alunoNome = String((r && r.aluno_nome) || '');
            const instNome = String((r && r.estagiario_instituicao) || '');
            const supNome = String((r && r.estagiario_supervisor_nome) || '');
            const nivel = String((r && r.estagiario_nivel) || '');
            const ch = r && r.estagiario_carga_horaria !== null && r.estagiario_carga_horaria !== undefined ? String(r.estagiario_carga_horaria) : '';
            const nota = r && r.estagiario_nota !== null && r.estagiario_nota !== undefined ? String(r.estagiario_nota) : '';

            const alunoLines = doc.splitTextToSize(alunoNome, widths.aluno);
            const instLines = doc.splitTextToSize(instNome, widths.inst);
            const supLines = doc.splitTextToSize(supNome, widths.sup);
            const lineCount = Math.max(alunoLines.length || 1, instLines.length || 1, supLines.length || 1);
            const rowHeight = lineCount * 5;

            if (y + rowHeight > pageHeight - marginBottom) {
                doc.addPage();
                y = marginTop;
                writeHeader();
            }

            doc.setFontSize(9);
            doc.text(alunoLines, colAlunoX, y);
            doc.text(instLines, colInstX, y);
            doc.text(supLines, colSupX, y);
            doc.text(nivel, colNivelX, y);
            doc.text(ch, colChX, y);
            doc.text(nota, colNotaX, y);
            y += rowHeight;
        }

        const now = new Date();
        const ymd = now.toISOString().slice(0, 10);
        doc.save(`estagiarios_professor_${professorId}_${periodo || 'Todos'}_${ymd}.pdf`);
    } catch (error) {
        console.error('Erro ao imprimir relatório:', error);
        alert(`Erro ao imprimir relatório: ${error.message}`);
    }
};
