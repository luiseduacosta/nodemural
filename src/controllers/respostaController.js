// src/controllers/respostaController.js
import Resposta from '../models/resposta.js';

// Get all respostas
export const getAllRespostas = async (req, res) => {
    try {
        const { supervisor_id } = req.query;
        const respostas = await Resposta.findAll(supervisor_id);
        res.status(200).json(respostas);
    } catch (error) {
        console.error('Error fetching respostas:', error);
        res.status(500).json({ error: 'Error fetching respostas' });
    }
};

// Get all Respostas by questionario_id
export const getAllRespostasByQuestionario = async (req, res) => {
    try {
        const { questionario_id } = req.params;
        const respostas = await Resposta.findAllByQuestionario(questionario_id);
        res.status(200).json(respostas);
    } catch (error) {
        console.error('Error fetching respostas:', error);
        res.status(500).json({ error: 'Error fetching respostas' });
    }
};

// Get all Respostas by estagiario_id
export const getAllRespostasByEstagiario = async (req, res) => {
    try {
        const { estagiario_id } = req.params;
        const respostas = await Resposta.findAllByEstagiario(estagiario_id);
        res.status(200).json(respostas);
    } catch (error) {
        console.error('Error fetching respostas:', error);
        res.status(500).json({ error: 'Error fetching respostas' });
    }
};

// Get a single Resposta by ID
export const getRespostaById = async (req, res) => {
    try {
        const { id } = req.params;
        const resposta = await Resposta.findById(id);
        if (!resposta) {
            return res.status(404).json({ error: 'Resposta not found' });
        }
        res.status(200).json(resposta);
    } catch (error) {
        console.error('Error fetching Resposta:', error);
        res.status(500).json({ error: 'Error fetching Resposta' });
    }
};

// Get resposta by estagiario and questionario
export const getRespostaByEstagiarioAndQuestionario = async (req, res) => {
    try {
        const { estagiario_id, questionario_id } = req.params;
        const resposta = await Resposta.findByEstagiarioAndQuestionario(estagiario_id, questionario_id);
        if (!resposta) {
            return res.status(404).json({ error: 'Resposta not found' });
        }
        res.status(200).json(resposta);
    } catch (error) {
        console.error('Error fetching resposta:', error);
        res.status(500).json({ error: 'Error fetching resposta' });
    }
};

// Get all Respostas by supervisor_id
export const getAllRespostasBySupervisor = async (req, res) => {
    try {
        const { supervisor_id } = req.params;
        const respostas = await Resposta.findAllBySupervisor(supervisor_id);
        res.status(200).json(respostas);
    } catch (error) {
        console.error('Error fetching respostas:', error);
        res.status(500).json({ error: 'Error fetching respostas' });
    }
};

// Create a new resposta
export const createResposta = async (req, res) => {
    try {
        const { questionario_id, estagiario_id, response } = req.body;

        // Check if response already exists
        const existing = await Resposta.findByEstagiarioAndQuestionario(estagiario_id, questionario_id);
        if (existing) {
            return res.status(409).json({ error: 'Resposta already exists', existing_id: existing.id });
        }

        // Create the new resposta
        const resposta = await Resposta.create(questionario_id, estagiario_id, response);
        res.status(201).json(resposta);
    } catch (error) {
        console.error('Error creating resposta:', error);
        res.status(500).json({ error: 'Error creating resposta' });
    }
};

// Update a resposta
export const updateResposta = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionario_id, estagiario_id, response } = req.body;
        const success = await Resposta.update(id, questionario_id, estagiario_id, response);
        if (!success) {
            return res.status(404).json({ error: 'Resposta not found' });
        }
        const updated = await Resposta.findById(id);
        res.status(200).json(updated);
    } catch (error) {
        console.error('Error updating resposta:', error);
        res.status(500).json({ error: 'Error updating resposta' });
    }
};

// Delete a resposta
export const deleteResposta = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Resposta.delete(id);
        if (!success) {
            return res.status(404).json({ error: 'Resposta not found' });
        }
        res.status(200).json({ message: 'Resposta deleted successfully' });
    } catch (error) {
        console.error('Error deleting resposta:', error);
        res.status(500).json({ error: 'Error deleting resposta' });
    }
};

// Get estagiarios by supervisor
export const getEstagiariosBySupervisor = async (req, res) => {
    try {
        const { supervisor_id } = req.params;
        const estagiarios = await Resposta.findEstagiariosBySupervisor(supervisor_id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};

// Get question count by supervisor
export const getQuestionCountBySupervisor = async (req, res) => {
    try {
        const { supervisor_id } = req.params;
        const count = await Resposta.countQuestionsBySupervisor(supervisor_id);
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error fetching question count:', error);
        res.status(500).json({ error: 'Error fetching question count' });
    }
};

// Check if Resposta is complete
export const checkRespostaComplete = async (req, res) => {
    try {
        const { id } = req.params;
        const isComplete = await Resposta.isComplete(id);
        res.status(200).json({ isComplete });
    } catch (error) {
        console.error('Error checking resposta:', error);
        res.status(500).json({ error: 'Error checking resposta' });
    }
};
