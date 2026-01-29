$(document).ready(function () {
    $('#newAreaForm').on('submit', async function (e) {
        e.preventDefault();

        const formData = {};
        $(this).serializeArray().forEach(item => {
            formData[item.name] = item.value;
        });

        try {
            const response = await fetch('/areainstituicoes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                window.location.href = 'areainstituicoes.html';
            } else {
                const text = await response.text();
                throw new Error(text || 'Erro ao salvar área');
            }
        } catch (error) {
            console.error('Error saving area:', error);
            alert('Erro ao salvar área: ' + error.message);
        }
    });
});
