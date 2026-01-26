$(document).ready(async function () {
    const form = document.getElementById('editDocenteForm');
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        alert('ID do docente não fornecido');
        window.location.href = 'docentes.html';
        return;
    }

    // Load docente data
    try {
        $.ajax({
            url: `/docentes/${id}`,
            method: 'GET',
            dataType: 'json',
            success: function (docente) {
                document.getElementById('docenteId').value = docente.id;
                document.getElementById('nome').value = docente.nome;
                document.getElementById('siape').value = docente.siape;
                document.getElementById('cpf').value = docente.cpf || '';
                document.getElementById('email').value = docente.email;
                document.getElementById('celular').value = docente.celular || '';
                document.getElementById('curriculolattes').value = docente.curriculolattes || '';
                document.getElementById('departamentoID').value = docente.departamento || 'Sem dados';
                document.getElementById('dataegresso').value = docente.dataegresso || '';
                document.getElementById('motivoegresso').value = docente.motivoegresso || '';
                document.getElementById('observacoes').value = docente.observacoes || '';
            }
        });
    } catch (error) {
        console.error('Error loading docente:', error);
        alert(`Erro ao carregar dados do docente: ${error.message}`);
        window.location.href = 'docentes.html';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const docente = {
            nome: document.getElementById('nome').value,
            siape: document.getElementById('siape').value || '',
            cpf: document.getElementById('cpf').value || '',
            celular: document.getElementById('celular').value || '',
            email: document.getElementById('email').value || '',
            curriculolattes: document.getElementById('curriculolattes').value || '',
            departamento: document.getElementById('departamentoID').value,
            dataegresso: document.getElementById('dataegresso').value || null,
            motivoegresso: document.getElementById('motivoegresso').value || '',
            observacoes: document.getElementById('observacoes').value || ''
        };

        try {
            const response = await fetch(`/docentes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(docente)
            });

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
