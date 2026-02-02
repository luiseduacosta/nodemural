// src/controllers/estagiarioController.js
import Estagiario from '../models/estagiario.js';

// Get distinct periods
export const getDistinctPeriods = async (req, res) => {
    try {
        const periods = await Estagiario.findDistinctPeriods();
        res.status(200).json(periods);
    } catch (error) {
        console.error('Error fetching periods:', error);
        res.status(500).json({ error: 'Error fetching periods' });
    }
};

// Get all estagiarios
export const getAllEstagiarios = async (req, res) => {
    try {
        const periodo = req.query.periodo || null;
        const aluno_id = req.query.aluno_id || null;
        const estagiarios = await Estagiario.findAll(periodo, aluno_id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};

// Get estagiario by ID
export const getEstagiarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiario = await Estagiario.findById(id);
        if (!estagiario) {
            return res.status(404).json({ error: 'Estagiario not found' });
        }
        res.status(200).json(estagiario);
    } catch (error) {
        console.error('Error fetching estagiario:', error);
        res.status(500).json({ error: 'Error fetching estagiario' });
    }
};

// Create a new estagiario
export const createEstagiario = async (req, res) => {
    try {
        const { aluno_id, professor_id, supervisor_id, instituicao_id, turmaestagio_id, periodo, turno, nivel, observacoes } = req.body;
        const estagiario = await Estagiario.create(aluno_id, professor_id, supervisor_id, instituicao_id, turmaestagio_id, periodo, turno, nivel, observacoes);
        res.status(201).json(estagiario);
    } catch (error) {
        console.error('Error creating estagiario:', error);
        res.status(500).json({ error: 'Error creating estagiario' });
    }
};

// Update an estagiario
export const updateEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const { aluno_id, professor_id, supervisor_id, instituicao_id, turmaestagio_id, periodo, nivel, observacoes } = req.body;
        const success = await Estagiario.update(id, aluno_id, professor_id, supervisor_id, instituicao_id, turmaestagio_id, periodo, nivel, observacoes);
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
export const deleteEstagiario = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Estagiario.delete(id);
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
export const getEstagiariosByAlunoId = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiarios = await Estagiario.findByAlunoId(id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};

// Get estagiarios by supervisor ID
export const getEstagiariosBySupervisorId = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiarios = await Estagiario.findBySupervisorId(id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};

// Get estagiarios by professor ID
export const getEstagiariosByProfessorId = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiarios = await Estagiario.findByProfessorId(id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};

// Get next nivel for a student
export const getNextNivel = async (req, res) => {
    try {
        const { id } = req.params;
        const nextNivel = await Estagiario.getNextNivel(id);
        res.status(200).json(nextNivel);
    } catch (error) {
        console.error('Error fetching next nivel:', error);
        res.status(500).json({ error: 'Error fetching next nivel' });
    }
};
