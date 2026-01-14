$(document).ready(async function () {
    // Get the ID from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID não fornecido');
        window.location.href = 'supervisores.html';
        return;
    }

    // Fetch the supervisor data
    try {
        const response = await fetch(`/supervisores/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch supervisor');
        }

        const supervisor = await response.json();
        
        // Populate the view fields
        document.getElementById('view-id').textContent = supervisor.id;
        document.getElementById('view-nome').textContent = supervisor.nome;
        document.getElementById('view-email').textContent = supervisor.email;
        document.getElementById('view-celular').textContent = supervisor.celular;
        document.getElementById('view-cress').textContent = supervisor.cress;
        
        // Store the ID for edit function
        window.currentSupervisorId = id;
        
        // Load instituições for this supervisor
        loadInstituicoes(id);
        
        // Load all instituições for the dropdown
        loadAllInstituicoes();
    } catch (error) {
        console.error('Error loading supervisor:', error);
        alert(`Erro ao carregar dados: ${error.message}`);
        window.location.href = 'supervisores.html';
    }
});

async function loadInstituicoes(supervisorId) {
    try {
        const response = await fetch(`/supervisores/${supervisorId}/instituicoes`);
        if (!response.ok) {
            throw new Error('Failed to fetch instituições');
        }

        const instituicoes = await response.json();
        const listDiv = document.getElementById('instituicoes-list');
        
        if (instituicoes.length === 0) {
            listDiv.innerHTML = '<p class="text-muted">Nenhuma instituição associada.</p>';
        } else {
            listDiv.innerHTML = instituicoes.map(inst => `
                <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                    <span>${inst.instituicao}</span>
                    <button class="btn btn-sm btn-danger" onclick="removeInstituicao(${inst.instituicao_id})">Remover</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading instituições:', error);
        document.getElementById('instituicoes-list').innerHTML = '<p class="text-danger">Erro ao carregar instituições.</p>';
    }
}

async function loadAllInstituicoes() {
    try {
        const response = await fetch('/estagio');
        if (!response.ok) {
            throw new Error('Failed to fetch all instituições');
        }

        const instituicoes = await response.json();
        const select = document.getElementById('instituicao-select');
        
        instituicoes.forEach(inst => {
            const option = document.createElement('option');
            option.value = inst.id;
            option.textContent = inst.instituicao;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading all instituições:', error);
    }
}

window.addInstituicao = async function() {
    const instituicaoId = document.getElementById('instituicao-select').value;
    
    if (!instituicaoId) {
        alert('Por favor, selecione uma instituição');
        return;
    }

    try {
        const response = await fetch(`/supervisores/${window.currentSupervisorId}/instituicoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ instituicao_id: instituicaoId })
        });

        if (!response.ok) {
            throw new Error('Failed to add instituição');
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addInstituicaoModal'));
        modal.hide();
        
        // Reset form
        document.getElementById('addInstituicaoForm').reset();
        
        // Reload instituições list
        loadInstituicoes(window.currentSupervisorId);
    } catch (error) {
        console.error('Error adding instituição:', error);
        alert(`Erro ao adicionar instituição: ${error.message}`);
    }
};

window.removeInstituicao = async function(instituicaoId) {
    if (!confirm('Tem certeza que deseja remover esta instituição?')) {
        return;
    }

    try {
        const response = await fetch(`/supervisores/${window.currentSupervisorId}/instituicoes/${instituicaoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to remove instituição');
        }

        // Reload instituições list
        loadInstituicoes(window.currentSupervisorId);
    } catch (error) {
        console.error('Error removing instituição:', error);
        alert(`Erro ao remover instituição: ${error.message}`);
    }
};

// Function to redirect to edit mode
window.editRecord = function() {
    window.location.href = `edit-supervisor.html?id=${window.currentSupervisorId}`;
};
