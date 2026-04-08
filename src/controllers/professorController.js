// src/controllers/professorController.js
import Professor from '../models/professor.js';

// Create a new professor
export const createProfessor = async (req, res) => {
    try {
        const { nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes } = req.body;
        const professor = await Professor.create(nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes);
        res.status(201).json(professor);
    } catch (error) {
        console.error('Error creating professor:', error);
        res.status(500).json({ error: 'Error creating professor' });
    }
};

// Get all professores
export const getAllProfessores = async (req, res) => {
    try {
        const search = req.query.search || null;
        const professores = await Professor.findAll(search);
        res.status(200).json(professores);
    } catch (error) {
        console.error('Error fetching professores:', error);
        res.status(500).json({ error: 'Error fetching professores' });
    }
};

// Get all fields of a single professor by ID
export const getProfessorById = async (req, res) => {
    try {
        const { id } = req.params;
        const professor = await Professor.findById(id);
        if (!professor) {
            return res.status(404).json({ error: 'Professor not found' });
        }
        res.status(200).json(professor);
    } catch (error) {
        console.error('Error fetching professor:', error);
        res.status(500).json({ error: 'Error fetching professor' });
    }
};

// Get all fields of a single professor by siape
export const getProfessorBySiape = async (req, res) => {
    try {
        const { siape } = req.params;
        const professor = await Professor.findBySiape(siape);
        if (!professor) {
            return res.status(404).json({ error: 'Professor not found' });
        }
        res.status(200).json(professor);
    } catch (error) {
        console.error('Error fetching professor:', error);
        res.status(500).json({ error: 'Error fetching professor' });
    }
};

// Update a professor by ID
export const updateProfessor = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes } = req.body;
        const success = await Professor.update(id, nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes);
        if (!success) {
            return res.status(404).json({ error: 'Professor not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating professor:', error);
        res.status(500).json({ error: 'Error updating professor' });
    }
};

// Delete a professor by ID
export const deleteProfessor = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Professor.delete(id);
        if (!success) {
            return res.status(404).json({ error: 'Professor not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting professor:', error);
        res.status(500).json({ error: 'Error deleting professor' });
    }
};

// Get estagiarios by professor ID
export const getEstagiariosByProfessorId = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiarios = await Professor.findEstagiariosByProfessorId(id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};
