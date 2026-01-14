$(document).ready(function () {
    const form = document.getElementById('docenteForm');
    const table = $('#docentesTable').DataTable({
        order: [[1, 'asc']],
        ajax: {
            url: '/docentes',
            dataSrc: ''
        },
        columns: [
            { data: 'id' },
            { data: 'nome' },
            { data: 'email' },
            { data: 'celular', defaultContent: '' },
            {
                data: null,
                render: function (data, type, row) {
                    return `
    <button onclick = "editDocente(${row.id})" class="btn btn-sm btn-warning" > Editar</button>
    <button onclick="deleteDocente(${row.id})" class="btn btn-sm btn-danger">Excluir</button>
`;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const docente = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value
        };

        const id = document.getElementById('docenteId').value;
        const url = id ? `/docentes/${id}` : '/docentes';
        const method = id ? 'PUT' : 'POST';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(docente)
        });

        form.reset();
        document.getElementById('docenteId').value = '';
        table.ajax.reload();
    });

    window.editDocente = async (id) => {
        try {
            const response = await fetch(`/docentes/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch docente');
            }

            const docente = await response.json();
            document.getElementById('nome').value = docente.nome;
            document.getElementById('email').value = docente.email;
            document.getElementById('celular').value = docente.celular || '';
            document.getElementById('docenteId').value = docente.id;
        } catch (error) {
            console.error('Edit error:', error);
            alert(`Error loading docente data: ${error.message}`);
        }
    };

    window.deleteDocente = async (id) => {
        if (confirm('Tem certeza que deseja excluir este docente?')) {
            await fetch(`/docentes/${id}`, { method: 'DELETE' });
            table.ajax.reload();
        }
    };
});
