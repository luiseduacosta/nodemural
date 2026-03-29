// src/controllers/estagiarioController.js
import Estagiario from '../models/estagiario.js';

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
        const { aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes } = req.body;
        const estagiario = await Estagiario.createEstagiario(aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes);
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
        const { aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes, nota, ch } = req.body;

        // If only nota and ch are provided, use partial update
        const isPartialUpdate = Object.keys(req.body).every(key => ['nota', 'ch'].includes(key));

        let success;
        if (isPartialUpdate) {
            success = await Estagiario.updatePartialEstagiario(id, { nota, ch });
        } else {
            success = await Estagiario.updateEstagiario(id, aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes);
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
