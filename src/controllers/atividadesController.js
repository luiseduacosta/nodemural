// src/controllers/atividadesController.js
import Atividades from '../models/atividades.js';

// Get all atividades
export const getAllAtividades = async (req, res) => {
    try {
        const atividades = await Atividades.findAll(req);
        res.status(200).json(atividades);
    } catch (error) {
        console.error('Error fetching atividades:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single atividade by ID
export const getAtividadeById = async (req, res) => {
    try {
        const { id } = req.params;
        const atividade = await Atividades.findById(id);
        if (!atividade) {
            return res.status(404).json({ error: 'Atividade not found' });
        }
        res.status(200).json(atividade);
    } catch (error) {
        console.error('Error fetching atividade:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new atividade
export const createAtividade = async (req, res) => {
    try {
        // estagiario_id can be in params (if using /atividades/:estagiario_id) or body
        const estagiario_id = req.params.estagiario_id || req.body.estagiario_id;
        const { dia, inicio, final, atividade } = req.body;

        const newAtividade = await Atividades.create(estagiario_id, dia, inicio, final, atividade);
        res.status(201).json(newAtividade);
    } catch (error) {
        console.error('Error creating atividade:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a atividade by ID
export const updateAtividade = async (req, res) => {
    try {
        const { id } = req.params;
        const { estagiario_id, dia, inicio, final, atividade } = req.body;

        const updated = await Atividades.update(id, estagiario_id, dia, inicio, final, atividade);
        if (!updated) {
            return res.status(404).json({ error: 'Atividade not found' });
        }
        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating atividade:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a atividade by ID
export const deleteAtividade = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Atividades.delete(id);
        // Similar to update, server.js didn't check for existence.
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting atividade:', error);
        res.status(500).json({ error: error.message });
    }
};
