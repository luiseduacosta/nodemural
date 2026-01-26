// src/controllers/supervisorController.js
import Supervisor from '../models/supervisor.js';

// Get all supervisores
export const getAllSupervisores = async (req, res) => {
    try {
        const supervisores = await Supervisor.findAll();
        res.status(200).json(supervisores);
    } catch (error) {
        console.error('Error fetching supervisores:', error);
        res.status(500).json({ error: 'Error fetching supervisores' });
    }
};

// Get supervisor by ID
export const getSupervisorById = async (req, res) => {
    try {
        const { id } = req.params;
        const supervisor = await Supervisor.findById(id);
        if (!supervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }
        res.status(200).json(supervisor);
    } catch (error) {
        console.error('Error fetching supervisor:', error);
        res.status(500).json({ error: 'Error fetching supervisor' });
    }
};

// Create a new supervisor
export const createSupervisor = async (req, res) => {
    try {
        const { nome, email, celular, cress } = req.body;
        const supervisor = await Supervisor.create(nome, email, celular, cress);
        res.status(201).json(supervisor);
    } catch (error) {
        console.error('Error creating supervisor:', error);
        res.status(500).json({ error: 'Error creating supervisor' });
    }
};

// Update a supervisor
export const updateSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, celular, cress } = req.body;
        const success = await Supervisor.update(id, nome, email, celular, cress);
        if (!success) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating supervisor:', error);
        res.status(500).json({ error: 'Error updating supervisor' });
    }
};

// Delete a supervisor
export const deleteSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Supervisor.delete(id);
        if (!success) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting supervisor:', error);
        res.status(500).json({ error: 'Error deleting supervisor' });
    }
};

// Get instituicoes for a supervisor (N-to-N relationship)
export const getInstituicoesBySupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const instituicoes = await Supervisor.findInstituicoesBySupervisorId(id);
        res.status(200).json(instituicoes);
    } catch (error) {
        console.error('Error fetching instituicoes:', error);
        res.status(500).json({ error: 'Error fetching instituicoes' });
    }
};

// Add instituicao to supervisor (N-to-N relationship)
export const addInstituicaoToSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const { instituicao_id } = req.body;
        const result = await Supervisor.addInstituicao(id, instituicao_id);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error adding instituicao:', error);
        res.status(500).json({ error: 'Error adding instituicao' });
    }
};

// Remove instituicao from supervisor (N-to-N relationship)
export const removeInstituicaoFromSupervisor = async (req, res) => {
    try {
        const { id, instituicaoId } = req.params;
        const success = await Supervisor.removeInstituicao(id, instituicaoId);
        if (!success) {
            return res.status(404).json({ error: 'Relationship not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error removing instituicao:', error);
        res.status(500).json({ error: 'Error removing instituicao' });
    }
};
