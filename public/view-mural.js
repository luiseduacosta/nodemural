$(document).ready(async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'mural.html';
        return;
    }

    try {
        const response = await fetch(`/mural/${id}`);
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
            const map = { 'E': 'Entrevista', 'P': 'Prova', 'A': 'Análise de Currículo' };
            return map[value] || 'N/A';
        };

        // Helper function to format shift
        const formatHorario = (value) => {
            const map = { 'M': 'Manhã', 'T': 'Tarde', 'N': 'Noite' };
            return map[value] || 'N/A';
        };

        // Populate fields
        document.getElementById('view-id').textContent = mural.id;
        document.getElementById('view-periodo').textContent = mural.periodo || 'N/A';
        document.getElementById('view-instituicao').textContent = mural.instituicao;
        document.getElementById('view-link-estagio').href = `/view-estagio.html?id=${mural.instituicao_id}`;
        document.getElementById('view-vagas').textContent = mural.vagas;
        document.getElementById('view-convenio').textContent = mural.convenio === '1' ? 'Sim' : 'Não';
        document.getElementById('view-cargaHoraria').textContent = mural.cargaHoraria || 'N/A';
        document.getElementById('view-final_de_semana').textContent = mural.final_de_semana === 'S' ? 'Sim' : (mural.final_de_semana === 'N' ? 'Não' : 'N/A');
        document.getElementById('view-horario').textContent = formatHorario(mural.horario);
        document.getElementById('view-beneficios').textContent = mural.beneficios || 'N/A';
        document.getElementById('view-requisitos').textContent = mural.requisitos || 'N/A';
        document.getElementById('view-dataInscricao').textContent = formatDate(mural.dataInscricao);
        document.getElementById('view-dataSelecao').textContent = formatDate(mural.dataSelecao);
        document.getElementById('view-horarioSelecao').textContent = mural.horarioSelecao || 'N/A';
        document.getElementById('view-localSelecao').textContent = mural.localSelecao || 'N/A';
        document.getElementById('view-formaSelecao').textContent = formatFormaSelecao(mural.formaSelecao);
        document.getElementById('view-localInscricao').textContent = mural.localInscricao === '1' ? 'Sim' : 'Não';
        document.getElementById('view-contato').textContent = mural.contato || 'N/A';
        document.getElementById('view-email').textContent = mural.email || 'N/A';
        document.getElementById('view-outras').textContent = mural.outras || 'N/A';

        window.currentMuralId = id;
        loadInscricoes(id);
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

async function loadInscricoes(muralId) {
    try {
        const response = await fetch(`/mural/${muralId}/inscricoes`);
        if (!response.ok) throw new Error('Failed to fetch inscricoes');
        const inscricoes = await response.json();

        const tbody = document.querySelector('#inscricoes-table tbody');
        tbody.innerHTML = '';

        if (inscricoes.length === 0) {
            document.getElementById('no-inscricoes-msg').classList.remove('d-none');
            document.getElementById('inscricoes-table').classList.add('d-none');
            return;
        }

        document.getElementById('no-inscricoes-msg').classList.add('d-none');
        document.getElementById('inscricoes-table').classList.remove('d-none');

        inscricoes.forEach(inscricao => {
            const tr = document.createElement('tr');
            const data = inscricao.data ? new Date(inscricao.data).toLocaleDateString('pt-BR') : 'N/A';
            tr.innerHTML = `
                <td>${data}</td>
                <td>${inscricao.aluno_nome || 'N/A'}</td>
                <td>${inscricao.aluno_email || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewInscricao(${inscricao.id})">Ver</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading inscricoes:', error);
    }
}

window.viewInscricao = function (id) {
    window.location.href = `view-inscricao.html?id=${id}`;
};
