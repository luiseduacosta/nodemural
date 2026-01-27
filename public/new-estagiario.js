document.addEventListener('DOMContentLoaded', async function () {
    const form = document.getElementById('newEstagioForm');

    // Clean all the fields
    form.reset();

    // Load default periodo from configuracoes
    try {
        const response = await fetch('/configuracoes');
        if (response.ok) {
            const configuracoes = await response.json();
            document.getElementById('periodo').value = configuracoes[0].termo_compromisso_periodo || '';
        }
    } catch (error) {
        console.error('Error loading default periodo:', error);
    }

    // Load alunos
    try {
        const response = await fetch('/alunos');
        const alunos = await response.json();
        const select = document.getElementById('aluno_id');

        alunos.forEach(aluno => {
            const option = document.createElement('option');
            option.value = aluno.id;
            option.textContent = `${aluno.registro || aluno.id} - ${aluno.nome}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading alunos:', error);
        alert('Erro ao carregar lista de alunos');
    }

    // Auto-calculate nivel when aluno is selected and load professor and supervisor if exists and put the selected value of professor_id, supervisor_id and intituicao_id
    document.getElementById('aluno_id').addEventListener('change', async function () {
        const alunoId = this.value;
        if (!alunoId) return;

        // Load alunos to get the turno of the selected aluno
        try {
            const response = await fetch(`/alunos/${alunoId}`);
            if (response.ok) {
                const aluno = await response.json();
                // Get the first letter of the turno and uppercase it. If turno is empty, default to 'A'.
                // Put the value in the default option of the select turno
                if (aluno[0].turno) {
                    document.getElementById('turno').value = aluno[0].turno.charAt(0).toUpperCase();
                } else {
                    document.getElementById('turno').value = 'A';
                }
            }
        } catch (error) {
            console.error('Error loading aluno:', error);
            alert('Erro ao carregar aluno');
        }

        try {
            const response = await fetch(`/estagiarios/${alunoId}/next-nivel`);
            if (response.ok) {
                const data = await response.json();
                document.getElementById('nivel').value = data.next_nivel;
                document.getElementById('ajuste2020').value = data.ajuste2020;

                // Load instituicoes
                try {
                    const response = await fetch('/estagio');
                    const instituicoes = await response.json();
                    const select = document.getElementById('instituicao_id');

                    instituicoes.forEach(inst => {
                        const option = document.createElement('option');
                        option.value = inst.id;
                        option.textContent = inst.instituicao;
                        option.selected = data.instituicao_id ? inst.id === data.instituicao_id : false;
                        select.appendChild(option);
                    });
                } catch (error) {
                    console.error('Error loading instituicoes:', error);
                    alert('Erro ao carregar lista de instituições');
                }

                // Load professores (docentes)
                try {
                    const response = await fetch('/docentes');
                    if (response.ok) {
                        const docentes = await response.json();
                        const select = document.getElementById('professor_id');

                        docentes.forEach(doc => {
                            const option = document.createElement('option');
                            option.value = doc.id;
                            option.textContent = doc.nome;
                            option.selected = data.professor_id ? doc.id === data.professor_id : false;
                            select.appendChild(option);
                        });
                    }
                }
                catch (error) {
                    console.error('Error loading docentes:', error);
                }

                // Load supervisores of the default institution or when a instituicao is selected
                const instituicaoId = data.instituicao_id;
                if (instituicaoId) {
                    try {
                        const select = document.getElementById('supervisor_id');
                        select.innerHTML = '<option value="">Selecione um supervisor</option>';
                        const response = await fetch(`/estagio/${instituicaoId}/supervisores`);
                        if (response.ok) {
                            const supervisores = await response.json();
                            supervisores.forEach(sup => {
                                const option = document.createElement('option');
                                option.value = sup.id;
                                option.textContent = sup.nome;
                                option.selected = data.supervisor_id ? sup.id === data.supervisor_id : false;
                                select.appendChild(option);
                            });
                        }
                    } catch (error) {
                        console.error('Error loading supervisores:', error);
                    }
                }
                document.getElementById('instituicao_id').addEventListener('change', async function () {
                    const instituicaoId = this.value;
                    if (!instituicaoId) {
                        instituicaoId = data.instituicao_id;
                    }
                    try {
                        const select = document.getElementById('supervisor_id');
                        select.innerHTML = '<option value="">Selecione um supervisor</option>';
                        const response = await fetch(`/estagio/${instituicaoId}/supervisores`);
                        if (response.ok) {
                            const supervisores = await response.json();
                            supervisores.forEach(sup => {
                                const option = document.createElement('option');
                                option.value = sup.id;
                                option.textContent = sup.nome;
                                option.selected = data.supervisor_id ? sup.id === data.supervisor_id : false;
                                select.appendChild(option);
                            });
                        }
                    } catch (error) {
                        console.error('Error loading supervisores:', error);
                    }
                });

                // Load turmas de estagio (if the table exists)
                try {
                    const response = await fetch('/turmas');
                    if (response.ok) {
                        const turmas = await response.json();
                        const select = document.getElementById('turmaestagio_id');

                        turmas.forEach(turma => {
                            const option = document.createElement('option');
                            option.value = turma.id;
                            option.textContent = turma.area;
                            option.selected = data.turmaestagio_id ? turma.id === data.turmaestagio_id : false;
                            select.appendChild(option);
                        });
                    }
                } catch (error) {
                    console.error('Error loading turmas:', error);
                }
            }
        } catch (error) {
            console.error('Error calculating next nivel:', error);
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const estagiario = {
            aluno_id: document.getElementById('aluno_id').value,
            professor_id: document.getElementById('professor_id').value,
            supervisor_id: document.getElementById('supervisor_id').value || null,
            instituicao_id: document.getElementById('instituicao_id').value,
            turmaestagio_id: document.getElementById('turmaestagio_id').value || null,
            periodo: document.getElementById('periodo').value,
            turno: document.getElementById('turno').value || 'A',
            nivel: document.getElementById('nivel').value,
            ajuste2020: document.getElementById('ajuste2020').value,
            observacoes: document.getElementById('observacoes').value || null
        };

        try {
            const response = await fetch('/estagiarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(estagiario)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create estagiario');
            }

            const result = await response.json();
            window.location.href = `view-estagiario.html?id=${result.id}`;
        } catch (error) {
            console.error('Error creating estagiario:', error);
            alert(`Erro ao criar registro: ${error.message}`);
        }
    });
});
