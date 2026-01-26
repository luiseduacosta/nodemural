// src/controllers/visitaController.js
import Visita from '../models/visita.js';

// Get all visitas
export const getAllVisitas = async (req, res) => {
    try {
        const visitas = await Visita.findAll(req);
        res.status(200).json(visitas);
    } catch (error) {
        console.error('Error fetching visitas:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single visita by ID
export const getVisitaById = async (req, res) => {
    try {
        const { id } = req.params;
        const visita = await Visita.findById(id);
        if (!visita) {
            return res.status(404).json({ error: 'Visita not found' });
        }
        res.status(200).json(visita);
    } catch (error) {
        console.error('Error fetching visita:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new visita
export const createVisita = async (req, res) => {
    try {
        const { instituicao_id, data, responsavel, motivo, avaliacao, descricao } = req.body;
        const newVisita = await Visita.create(instituicao_id, data, responsavel, motivo, avaliacao, descricao);
        res.status(201).json(newVisita);
    } catch (error) {
        console.error('Error creating visita:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a visita by ID
export const updateVisita = async (req, res) => {
    try {
        const { id } = req.params;
        const { instituicao_id, data, responsavel, motivo, avaliacao, descricao } = req.body;

        await Visita.update(id, instituicao_id, data, responsavel, motivo, avaliacao, descricao);
        res.status(204).end();
    } catch (error) {
        console.error('Error updating visita:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a visita by ID
export const deleteVisita = async (req, res) => {
    try {
        const { id } = req.params;
        await Visita.delete(id);
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting visita:', error);
        res.status(500).json({ error: error.message });
    }
};
