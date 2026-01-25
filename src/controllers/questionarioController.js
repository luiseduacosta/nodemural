// src/controllers/questionarioController.js
import Questionario from '../models/questionario.js';

// Create a new questionario
export const createQuestionario = async (req, res) => {
    try {
        const { title, description, created, modified, is_active, category, target_user_type } = req.body;
        const questionario = await Questionario.create(title, description, created, modified, is_active, category, target_user_type);
        res.status(201).json(questionario);
    } catch (error) {
        console.error('Error creating questionario:', error);
        res.status(500).json({ error: 'Error creating questionario' });
    }
};

// Get all questionarios
export const getAllQuestionarios = async (req, res) => {
    try {
        const questionarios = await Questionario.findAll();
        res.status(200).json(questionarios);
    } catch (error) {
        console.error('Error fetching questionarios:', error);
        res.status(500).json({ error: 'Error fetching questionarios' });
    }
};

// Get a single questionario by ID
export const getQuestionarioById = async (req, res) => {
    try {
        const { id } = req.params;
        const questionario = await Questionario.findById(id);
        console.log(questionario);
        if (!questionario) {
            return res.status(404).json({ error: 'Questionario not found' });
        }
        res.status(200).json(questionario);
    } catch (error) {
        console.error('Error fetching questionario:', error);
        res.status(500).json({ error: 'Error fetching questionario' });
    }
};

// Update a questionario by ID
export const updateQuestionario = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, created, modified, is_active, category, target_user_type } = req.body;
        const questionario = await Questionario.update(id, title, description, created, modified, is_active, category, target_user_type);
        if (!questionario) {
            return res.status(404).json({ error: 'Questionario not found' });
        }
        res.status(200).json(questionario);
    } catch (error) {
        console.error('Error updating questionario:', error);
        res.status(500).json({ error: 'Error updating questionario' });
    }
};

// Delete a questionario by ID
export const deleteQuestionario = async (req, res) => {
    try {
        const { id } = req.params;
        const questionario = await Questionario.delete(id);
        if (!questionario) {
            return res.status(404).json({ error: 'Questionario not found' });
        }
        res.status(200).json(questionario);
    } catch (error) {
        console.error('Error deleting questionario:', error);
        res.status(500).json({ error: 'Error deleting questionario' });
    }
};