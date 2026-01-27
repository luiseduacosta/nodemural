// src/controllers/questaoController.js
import Questao from '../models/questao.js';

// Create a new questao
export const createQuestao = async (req, res) => {
    try {
        const { questionario_id, text, type, options, ordem, created, modified } = req.body;
        const questao = await Questao.create(questionario_id, text, type, options, ordem, created, modified);
        res.status(201).json(questao);
    } catch (error) {
        console.error('Error creating questao:', error);
        res.status(500).json({ error: 'Error creating questao' });
    }
};

// Get all questoes
export const getAllQuestoes = async (req, res) => {
    try {
        const { questionario_id } = req.query;
        const questoes = await Questao.findAll(questionario_id);
        res.status(200).json(questoes);
    } catch (error) {
        console.error('Error fetching questoes:', error);
        res.status(500).json({ error: 'Error fetching questoes' });
    }
};

// Get a single questao by ID
export const getQuestaoById = async (req, res) => {
    try {
        const { id } = req.params;
        const questao = await Questao.findById(id);
        if (!questao) {
            return res.status(404).json({ error: 'Questao not found' });
        }
        res.status(200).json(questao);
    } catch (error) {
        console.error('Error fetching questao:', error);
        res.status(500).json({ error: 'Error fetching questao' });
    }
};

// Update a questao by ID
export const updateQuestao = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionario_id, text, type, options, ordem, created, modified } = req.body;
        const questao = await Questao.update(id, questionario_id, text, type, options, ordem, created, modified);
        if (!questao) {
            return res.status(404).json({ error: 'Questao not found' });
        }
        res.status(200).json(questao);
    } catch (error) {
        console.error('Error updating questao:', error);
        res.status(500).json({ error: 'Error updating questao' });
    }
};

// Delete a questao by ID
export const deleteQuestao = async (req, res) => {
    try {
        const { id } = req.params;
        const questao = await Questao.delete(id);
        if (!questao) {
            return res.status(404).json({ error: 'Questao not found ' + id });
        }
        res.status(200).json(questao);
    } catch (error) {
        console.error('Error deleting questao:', error);
        res.status(500).json({ error: 'Error deleting questao ' + id });
    }
};