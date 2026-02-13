// src/controllers/turmaController.js
import Turma from '../models/turma.js';

// Create a new turma
export const createTurma = async (req, res) => {
    try {
        const { area } = req.body;
        const newTurma = await Turma.create(area);
        res.status(201).json(newTurma);
    } catch (error) {
        console.error('Error creating turma:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single turma by ID
export const getTurmaById = async (req, res) => {
    try {
        const { id } = req.params;
        const turma = await Turma.findById(id);
        if (!turma) {
            return res.status(404).json({ error: 'Turma de estágio not found' });
        }
        res.status(200).json(turma);
    } catch (error) {
        console.error('Error fetching turma:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all turmas
export const getAllTurmas = async (req, res) => {
    try {
        const turmas = await Turma.findAll();
        res.status(200).json(turmas);
    } catch (error) {
        console.error('Error fetching turmas:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a turma by ID
export const updateTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const { area } = req.body;

        const success = await Turma.update(id, area);
        if (!success) {
            return res.status(404).json({ error: 'Turma de estágio not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating turma:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a turma by ID
export const deleteTurma = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Turma.delete(id);
        if (!success) {
            return res.status(404).json({ error: 'Turma de estágio not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting turma:', error);
        res.status(500).json({ error: error.message });
    }
};
