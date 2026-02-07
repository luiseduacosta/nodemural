import { getToken, hasRole, isAdmin, authenticatedFetch } from './auth-utils.js';

$(document).ready(async function () {

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    } else {
        // Se for aluno, não pode adicionar, editar e não pode ver as inscrições
        if (hasRole(['aluno'])) {
            document.getElementById('editRecordBtn').style.display = 'none';
            document.getElementById('newMuralBtn').style.display = 'none';
            document.getElementById('inscricoes-tab').style.display = 'none';
        }
    }

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'mural.html';
        return;
    }

    try {
        const response = await authenticatedFetch(`/mural/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch mural');
        }

        const mural = await response.json();

        // Helper function to format dates
        const formatDate = (date) => {
            if (!date) return 'N/A';
            return new Date(date).toLocaleDateString('pt-BR');
        };

        // Helper function to format selection method
        const formatFormaSelecao = (value) => {
            const map = { '0': 'Entrevista', '1': 'Análise de currículo', '2': 'Prova', '3': 'Outras' };
            return map[value] || 'N/A';
        };

        // Helper function to format shift
        const formatHorario = (value) => {
            const map = { 'D': 'Diurno', 'N': 'Noturno', 'I': 'Indeterminado' };
            return map[value] || 'N/A';
        };

        const formatLocalInscricao = (value) => {
            const map = {
                '0': 'Somente no mural da Coordenação de Estágio',
                '1': 'Diretamente na instituição e no mural da Coordenação de Estágio'
            };
            return map[value] || 'N/A';
        };

        // Populate fields
        document.getElementById('view-id').textContent = mural.id;
        document.getElementById('view-periodo').textContent = mural.periodo || 'N/A';
        document.getElementById('view-instituicao').textContent = mural.instituicao;
        // Se não estiver logado, não pode ver o link do estágio
        document.getElementById('view-link-estagio').href = (getToken() == null) ? '#' : `/view-estagio.html?id=${mural.instituicao_id}`;
        document.getElementById('view-vagas').textContent = mural.vagas;
        document.getElementById('view-convenio').textContent = mural.convenio === '1' ? 'Sim' : 'Não';
        document.getElementById('view-cargaHoraria').textContent = mural.cargaHoraria || 'N/A';
        document.getElementById('view-final_de_semana').textContent = mural.final_de_semana === 'S' ? 'Sim' : (mural.final_de_semana === 'N' ? 'Não' : 'N/A');
        document.getElementById('view-horario').textContent = formatHorario(mural.horario);
        document.getElementById('view-beneficios').textContent = mural.beneficios || 'N/A';
        document.getElementById('view-requisitos').innerHTML = mural.requisitos ? marked.parse(mural.requisitos) : 'N/A';
        document.getElementById('view-dataInscricao').textContent = formatDate(mural.dataInscricao);
        document.getElementById('view-dataSelecao').textContent = formatDate(mural.dataSelecao);
        document.getElementById('view-horarioSelecao').textContent = mural.horarioSelecao || 'N/A';
        document.getElementById('view-localSelecao').textContent = mural.localSelecao || 'N/A';
        document.getElementById('view-formaSelecao').textContent = formatFormaSelecao(mural.formaSelecao);
        document.getElementById('view-localInscricao').textContent = formatLocalInscricao(mural.localInscricao);
        document.getElementById('view-contato').textContent = mural.contato || 'N/A';
        document.getElementById('view-email').textContent = mural.email || 'N/A';
        document.getElementById('view-outras').innerHTML = mural.outras ? marked.parse(mural.outras) : 'N/A';

        window.currentMuralId = id;
        await loadInscricoes(window.currentMuralId);

        // Hide buttons if not admin
        if (!isAdmin()) {
            document.getElementById('editRecordBtn').style.display = 'none';
            document.getElementById('newMuralBtn').style.display = 'none';
            document.getElementById('inscricoes-tab').style.display = 'none';
        }
        // Hide inscrever button if not logged in
        if (!getToken()) {
            document.getElementById('inscreverBtn').style.display = 'none';
        }

        // Hide button if today is after dataInscricao
        const dataInscricaoText = document.getElementById('view-dataInscricao').textContent;
        const dataInscricao = new Date(dataInscricaoText.split('/').reverse().join('-')); // Convert DD/MM/YYYY to YYYY-MM-DD
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to compare dates only

        if (today > dataInscricao) {
            document.getElementById('inscreverBtn').style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading mural:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'mural.html';
    }
});

window.editRecord = function () {
    window.location.href = `edit-mural.html?id=${window.currentMuralId}`;
};

window.inscrever = function () {
    window.location.href = `new-inscricao.html?muralestagio_id=${window.currentMuralId}`;
};

async function loadInscricoes(currentMuralId) {
    let table;
    table = $('#inscricoesTable').DataTable({
        order: [[3, 'desc'], [1, 'asc']],
        ajax: {
            url: `/mural/${currentMuralId}/inscricoes`,
            dataSrc: ''
        },
        columns: [
            { data: 'registro' },
            { data: 'aluno_nome' },
            {
                data: 'data_inscricao', render: function (data) {
                    if (!data) return '';
                    const date = new Date(data);
                    return date.toLocaleDateString('pt-BR');
                }
            },
            {
                data: 'acoes', render: function (data, type, row) {
                    return `
                    <button onclick="window.location.href='view-inscricao.html?id=${row.inscricao_id}'" class="btn btn-sm btn-warning">Visualizar</button>
                    <button onclick="deleteInscricao(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
                `;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/2.3.6/i18n/pt-BR.json'
        }
    });
}

window.deleteInscricao = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta inscrição?: ' + id)) {
        await fetch(`/inscricoes/${id}`, { method: 'DELETE' });
        window.location.href = `view-mural.html?id=${window.currentMuralId}`;
    }
};
