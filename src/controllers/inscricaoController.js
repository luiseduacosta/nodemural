// src/controllers/inscricaoController.js
import Inscricao from '../models/inscricao.js';

// Get all inscricoes
export const getAllInscricoes = async (req, res) => {
    try {
        const periodo = req.query.periodo || null;
        const inscricoes = await Inscricao.findAll(periodo);
        res.status(200).json(inscricoes);
    } catch (error) {
        console.error('Error fetching inscricoes:', error);
        res.status(500).json({ error: 'Error fetching inscricoes' });
    }
};

// Get distinct periods
export const getDistinctPeriods = async (req, res) => {
    try {
        const periods = await Inscricao.findDistinctPeriods();
        res.status(200).json(periods);
    } catch (error) {
        console.error('Error fetching periods:', error);
        res.status(500).json({ error: 'Error fetching periods' });
    }
};

// Get inscricao by ID
export const getInscricaoById = async (req, res) => {
    try {
        const { id } = req.params;
        const inscricao = await Inscricao.findById(id);
        if (!inscricao) {
            return res.status(404).json({ error: 'Inscricao not found' });
        }
        res.status(200).json(inscricao);
    } catch (error) {
        console.error('Error fetching inscricao:', error);
        res.status(500).json({ error: 'Error fetching inscricao' });
    }
};

// Get inscricoes by aluno ID and mural ID
export const getInscricoesByAlunoAndMural = async (req, res) => {
    try {
        const { aluno_id, muralestagio_id } = req.params;
        const inscricoes = await Inscricao.findByAlunoAndMural(aluno_id, muralestagio_id);
        res.status(200).json(inscricoes);
    } catch (error) {
        console.error('Error fetching inscricoes:', error);
        res.status(500).json({ error: 'Error fetching inscricoes' });
    }
};

// Get inscricoes by mural ID
export const getInscricoesByMuralId = async (req, res) => {
    try {
        const { mural_id } = req.params;
        const inscricoes = await Inscricao.findByMuralId(mural_id);
        res.status(200).json(inscricoes);
    } catch (error) {
        console.error('Error fetching inscricoes:', error);
        res.status(500).json({ error: 'Error fetching inscricoes' });
    }
};

// Create a new inscricao
export const createInscricao = async (req, res) => {
    try {
        const { registro, aluno_id, muralestagio_id, data, periodo } = req.body;
        const inscricao = await Inscricao.create(registro, aluno_id, muralestagio_id, data, periodo);
        res.status(201).json(inscricao);
    } catch (error) {
        console.error('Error creating inscricao:', error);
        if (error.message.includes('já inscrito')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error creating inscricao' });
    }
};

// Update an inscricao
export const updateInscricao = async (req, res) => {
    try {
        const { id } = req.params;
        const { registro, aluno_id, muralestagio_id, data, periodo } = req.body;
        const success = await Inscricao.update(id, registro, aluno_id, muralestagio_id, data, periodo);
        if (!success) {
            return res.status(404).json({ error: 'Inscricao not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating inscricao:', error);
        if (error.message.includes('já inscrito')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Error updating inscricao' });
    }
};

// Delete an inscricao
export const deleteInscricao = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Inscricao.delete(id);
        if (!success) {
            return res.status(404).json({ error: 'Inscricao not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting inscricao:', error);
        res.status(500).json({ error: 'Error deleting inscricao' });
    }
};
