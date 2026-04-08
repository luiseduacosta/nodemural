// src/controllers/estagiarioController.js
import Estagiario from '../models/estagiario.js';

function parsePeriodo(periodo) {
    if (!periodo || typeof periodo !== 'string') return null;
    const parts = periodo.split('-');
    if (parts.length !== 2) return null;
    const ano = Number(parts[0]);
    const semestre = Number(parts[1]);
    if (!Number.isFinite(ano) || !Number.isFinite(semestre)) return null;
    if (semestre !== 1 && semestre !== 2) return null;
    return { ano, semestre };
}

function addSemestresToPeriodo(periodo, semestresToAdd) {
    const parsed = parsePeriodo(periodo);
    if (!parsed) return periodo || null;
    const total = (parsed.ano * 2) + (parsed.semestre - 1) + Number(semestresToAdd);
    const ano = Math.floor(total / 2);
    const semestre = (total % 2) + 1;
    return `${ano}-${semestre}`;
}

function computeInicioFinalSeguro(nivel, periodo, ajuste2020) {
    const parsed = parsePeriodo(periodo);
    if (!parsed) return { inicio: periodo || null, final: periodo || null };

    const niv = Number(nivel);
    const ajuste = Number(ajuste2020);

    let inicio;
    let final;

    if (niv === 9) {
        final = periodo;
        const back = ajuste === 0 ? 4 : 3;
        inicio = addSemestresToPeriodo(periodo, -back);
        return { inicio, final };
    }

    const backByLevel = Math.max(0, niv - 1);
    inicio = addSemestresToPeriodo(periodo, -backByLevel);

    if (niv === 4) {
        final = periodo;
    } else if (niv === 3 && ajuste === 1) {
        final = periodo;
    } else {
        const lengthMinusOne = ajuste === 0 ? 3 : 2;
        final = addSemestresToPeriodo(inicio, lengthMinusOne);
    }

    return { inicio, final };
}

// Get distinct periods
export const getDistinctPeriodsEstagiario = async (req, res) => {
    try {
        const periods = await Estagiario.findDistinctPeriodsEstagiario();
        res.status(200).json(periods);
    } catch (error) {
        console.error('Error fetching periods:', error);
        res.status(500).json({ error: 'Error fetching periods' });
    }
};

export const getPlanilhaSeguroEstagiario = async (req, res) => {
    try {
        const periodoQuery = req.query.periodo || null;
        const periodRows = await Estagiario.findDistinctPeriodsEstagiario();
        const periodos = periodRows.map((p) => p.periodo);

        const periodoSelecionado = periodoQuery || periodos[0] || null;
        if (!periodoSelecionado) {
            return res.status(200).json({ t_seguro: [], periodos, periodoSelecionado: null });
        }

        const seguroRows = await Estagiario.findPlanilhaSeguro(periodoSelecionado);
        const t_seguro = seguroRows.map((row) => {
            const { inicio, final } = computeInicioFinalSeguro(row.estagiario_nivel, row.estagiario_periodo, row.estagiario_ajuste2020);
            return {
                id: row.aluno_id,
                nome: row.aluno_nome,
                cpf: row.aluno_cpf,
                nascimento: row.aluno_nascimento,
                ajuste2020: row.estagiario_ajuste2020,
                registro: row.aluno_registro,
                curso: 'UFRJ/Serviço Social',
                nivel: Number(row.estagiario_nivel) === 9 ? 'Não obrigatório' : row.estagiario_nivel,
                periodo: row.estagiario_periodo,
                inicio,
                final,
                instituicao: row.instituicao_nome
            };
        });

        t_seguro.sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' }));

        res.status(200).json({ t_seguro, periodos, periodoSelecionado });
    } catch (error) {
        console.error('Error fetching planilha seguro:', error);
        res.status(500).json({ error: 'Error fetching planilha seguro' });
    }
};

export const getPlanilhaSupervisoresEstagiario = async (req, res) => {
    try {
        const periodoQuery = req.query.periodo || null;
        const periodRows = await Estagiario.findDistinctPeriodsEstagiario();
        const periodos = periodRows.map((p) => p.periodo);

        const periodoSelecionado = periodoQuery || periodos[0] || null;
        if (!periodoSelecionado) {
            return res.status(200).json({ rows: [], periodos, periodoSelecionado: null });
        }

        const rows = await Estagiario.findPlanilhaSupervisores(periodoSelecionado);

        const normalized = rows.map((row) => ({
            aluno_nome: row.aluno_nome,
            instituicao: row.instituicao_nome,
            endereco_instituicao: row.endereco_instituicao,
            cep_instituicao: row.cep_instituicao,
            bairro_instituicao: row.bairro_instituicao,
            supervisor_nome: row.supervisor_nome,
            supervisor_cress: row.supervisor_cress,
            supervisor_regiao: row.supervisor_regiao,
            professor_nome: row.professor_nome
        }));

        res.status(200).json({ rows: normalized, periodos, periodoSelecionado });
    } catch (error) {
        console.error('Error fetching planilha supervisores:', error);
        res.status(500).json({ error: 'Error fetching planilha supervisores' });
    }
};

export const getPlanilhaCargaHorariaEstagiario = async (req, res) => {
    try {
        const raw = await Estagiario.findPlanilhaCargaHoraria();
        const byAluno = new Map();

        for (const row of raw) {
            const alunoId = row.aluno_id;
            if (!byAluno.has(alunoId)) {
                byAluno.set(alunoId, {
                    aluno_id: row.aluno_id,
                    aluno_nome: row.aluno_nome,
                    aluno_registro: row.aluno_registro,
                    estagiarios_count: 0,
                    nivel1: '',
                    nivel1_periodo: '',
                    nivel1_ch: '',
                    nivel2: '',
                    nivel2_periodo: '',
                    nivel2_ch: '',
                    nivel3: '',
                    nivel3_periodo: '',
                    nivel3_ch: '',
                    nivel4: '',
                    nivel4_periodo: '',
                    nivel4_ch: '',
                    ch_total: 0
                });
            }

            const agg = byAluno.get(alunoId);
            agg.estagiarios_count += 1;

            const ch = row.estagiario_ch === null || row.estagiario_ch === undefined ? 0 : Number(row.estagiario_ch);
            if (!Number.isNaN(ch)) {
                agg.ch_total += ch;
            }

            const nivel = Number(row.estagiario_nivel);
            if (nivel >= 1 && nivel <= 4) {
                const nivelKey = `nivel${nivel}`;
                if (!agg[`${nivelKey}_periodo`]) {
                    agg[nivelKey] = String(nivel);
                    agg[`${nivelKey}_periodo`] = row.estagiario_periodo || '';
                    agg[`${nivelKey}_ch`] = row.estagiario_ch ?? '';
                }
            }
        }

        const rows = Array.from(byAluno.values());
        res.status(200).json({ rows });
    } catch (error) {
        console.error('Error fetching planilha carga horaria:', error);
        res.status(500).json({ error: 'Error fetching planilha carga horaria' });
    }
};

// Get all estagiarios
export const getAllEstagiariosEstagiario = async (req, res) => {
    try {
        const periodo = req.query.periodo || null;
        const aluno_id = req.query.aluno_id || null;
        const estagiarios = await Estagiario.findAllEstagiario(periodo, aluno_id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};

// Get estagiario by ID
export const getEstagiarioByIdEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiario = await Estagiario.findByIdEstagiario(id);
        if (!estagiario) {
            return res.status(404).json({ error: 'Estagiario not found' });
        }
        res.status(200).json(estagiario);
    } catch (error) {
        console.error('Error fetching estagiario:', error);
        res.status(500).json({ error: 'Error fetching estagiario' });
    }
};

// Get atividades do estagiario by Id
export const getAtividadesByEstagiarioIdEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const atividades = await Estagiario.findAtividadesByEstagiarioIdEstagiario(id);
        res.status(200).json(atividades);
    } catch (error) {
        console.error('Error fetching atividades:', error);
        res.status(500).json({ error: 'Error fetching atividades' });
    }
};

// Create a new estagiario
export const createEstagiarioEstagiario = async (req, res) => {
    try {
        const { aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes, tc, tc_solicitacao, complemento_id, benetransporte, benealimentacao, benebolsa } = req.body;
        const estagiario = await Estagiario.createEstagiario(aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes, tc, tc_solicitacao, complemento_id, benetransporte, benealimentacao, benebolsa);
        res.status(201).json(estagiario);
    } catch (error) {
        console.error('Error creating estagiario:', error);
        res.status(500).json({ error: 'Error creating estagiario' });
    }
};

// Update an estagiario
export const updateEstagiarioEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const { aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes, tc, tc_solicitacao, complemento_id, benetransporte, benealimentacao, benebolsa, nota, ch } = req.body;

        // If only nota and ch are provided, use partial update
        const isPartialUpdate = Object.keys(req.body).every(key => ['nota', 'ch'].includes(key));

        let success;
        if (isPartialUpdate) {
            success = await Estagiario.updatePartialEstagiario(id, { nota, ch });
        } else {
            success = await Estagiario.updateEstagiario(id, aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes, tc, tc_solicitacao, complemento_id, benetransporte, benealimentacao, benebolsa);
        }

        if (!success) {
            return res.status(404).json({ error: 'Estagiario not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating estagiario:', error);
        res.status(500).json({ error: 'Error updating estagiario' });
    }
};

// Delete an estagiario
export const deleteEstagiarioEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Estagiario.deleteEstagiario(id);
        if (!success) {
            return res.status(404).json({ error: 'Estagiario not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting estagiario:', error);
        res.status(500).json({ error: 'Error deleting estagiario' });
    }
};

// Get estagiarios by aluno ID
export const getEstagiariosByAlunoIdEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiarios = await Estagiario.findByAlunoIdEstagiario(id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};

// Get estagiarios by supervisor ID
export const getEstagiariosBySupervisorIdEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiarios = await Estagiario.findBySupervisorIdEstagiario(id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};

// Get estagiarios by professor ID
export const getEstagiariosByProfessorIdEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiarios = await Estagiario.findByProfessorIdEstagiario(id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};

// Get next nivel for a student
export const getNextNivelEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const nextNivel = await Estagiario.getNextNivelEstagiario(id);
        res.status(200).json(nextNivel);
    } catch (error) {
        console.error('Error fetching next nivel:', error);
        res.status(500).json({ error: 'Error fetching next nivel' });
    }
};
