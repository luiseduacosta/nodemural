// public/professor_estagiarios_nota.js
// Make a editable table to update estagiario fields 'nota' and 'carga_horaria'
import { authenticatedFetch, getCurrentUser } from './auth-utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('estagiario-table-body');
    let estagiarios = [];

    // Get current user (professor) and fetch their estagiarios
    const user = getCurrentUser();
    if (!user || !user.entidade_id) {
        tableBody.innerHTML = '<tr><td colspan="5">Erro: Professor(a) não identificado(a)</td></tr>';
        return;
    }

    const professorId = user.entidade_id;

    // 1. FETCH REAL DATA FROM API
    async function fetchEstagiarios() {
        try {
            const response = await authenticatedFetch(`/professores/${professorId}/estagiarios`);
            if (!response.ok) {
                throw new Error('Falha ao carregar estagiários');
            }
            estagiarios = await response.json();
            // Map API fields to table fields
            estagiarios = estagiarios.map(e => ({
                id: e.estagiario_id,
                aluno_nome: e.aluno_nome,
                instituicao: e.estagiario_instituicao,
                periodo: e.estagiario_periodo,
                nivel: e.estagiario_nivel,
                nota: e.estagiario_nota || '',
                ch: e.estagiario_carga_horaria || ''
            }));
            renderTable();
        } catch (error) {
            console.error('Error fetching estagiarios:', error);
            tableBody.innerHTML = `<tr><td colspan="5">Erro: ${error.message}</td></tr>`;
        }
    }

    // Função para renderizar a tabela
    function renderTable() {
        tableBody.innerHTML = ''; // Limpa a tabela
        if (estagiarios.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">Nenhum estagiário encontrado</td></tr>';
            return;
        }
        estagiarios.forEach(estagiario => {
            const row = document.createElement('tr');
            row.dataset.id = estagiario.id; // Adiciona o ID do estagiario na linha
            row.innerHTML = `
                <td style="width: 50px;">${estagiario.id}</td>
                <td style="width: 200px;" data-field="aluno_nome">${estagiario.aluno_nome}</td>
                <td style="width: 200px;" data-field="instituicao">${estagiario.instituicao}</td>
                <td style="width:  50px;" data-field="periodo">${estagiario.periodo}</td>
                <td style="width:  50px;" data-field="nivel">${estagiario.nivel}</td>
                <td style="width:  50px;" class="editable-field" data-field="nota">${estagiario.nota}</td>
                <td style="width:  50px;" class="editable-field" data-field="ch">${estagiario.ch}</td>
                <td class="actions">
                    <button class="btn btn-warning btn-edit">Editar</button>
                    <button class="btn btn-primary btn-save">Salvar</button>
                    <button class="btn btn-secondary btn-cancel">Cancelar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 2. LÓGICA DE EDIÇÃO (Usando Event Delegation)
    tableBody.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');
        if (!row) return;

        const isEditing = row.classList.contains('editing');

        if (target.classList.contains('btn-edit')) {
            makeRowEditable(row);
        } else if (target.classList.contains('btn-save')) {
            saveRow(row);
        } else if (target.classList.contains('btn-cancel')) {
            cancelEdit(row);
        }
    });

    function makeRowEditable(row) {
        row.classList.add('editing');
        const editableFields = row.querySelectorAll('.editable-field');

        editableFields.forEach(field => {
            const text = field.textContent;
            field.innerHTML = `<input class="form-control" style="width: 100px;" type="text" value="${text}">`;
        });

        // Troca a visibilidade dos botões
        row.querySelector('.btn-edit').style.display = 'none';
        row.querySelector('.btn-save').style.display = 'inline-block';
        row.querySelector('.btn-cancel').style.display = 'inline-block';
    }

    async function saveRow(row) {
        const estagiarioId = row.dataset.id;
        const inputs = row.querySelectorAll('input');
        const updatedData = {};

        inputs.forEach(input => {
            const fieldName = input.closest('td').dataset.field;
            updatedData[fieldName] = input.value;
        });

        // console.log('Salvando dados para o estagiário', estagiarioId, ':', updatedData);

        // 3. CHAMADA PARA A SUA API
        // console.log('Salvando dados para o estagiário', estagiarioId, ':', updatedData);
        try {
            const response = await authenticatedFetch(`/estagiarios/${estagiarioId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar o estagiário.');
            }

            // Se a API responder com sucesso, atualiza a tabela localmente
            const estagiarioIndex = estagiarios.findIndex(e => e.id == estagiarioId);
            if (estagiarioIndex > -1) {
                estagiarios[estagiarioIndex] = { ...estagiarios[estagiarioIndex], ...updatedData };
            }

            renderTable(); // Re-renderiza a tabela com os dados atualizados

        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
            // Opcional: manter a linha em modo de edição para o usuário tentar novamente
        }
    }

    function cancelEdit(row) {
        row.classList.remove('editing');
        renderTable(); // Simplesmente re-renderiza a tabela para voltar ao estado original
    }

    // Fetch and render estagiarios on page load
    await fetchEstagiarios();
});