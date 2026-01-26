// src/controllers/docenteController.js
import Docente from '../models/docente.js';

// Create a new docente
export const createDocente = async (req, res) => {
    try {
        const { nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes } = req.body;
        const docente = await Docente.create(nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes);
        res.status(201).json(docente);
    } catch (error) {
        console.error('Error creating docente:', error);
        res.status(500).json({ error: 'Error creating docente' });
    }
};

// Get all docentes
export const getAllDocentes = async (req, res) => {
    try {
        const search = req.query.search || null;
        const docentes = await Docente.findAll(search);
        res.status(200).json(docentes);
    } catch (error) {
        console.error('Error fetching docentes:', error);
        res.status(500).json({ error: 'Error fetching docentes' });
    }
};

// Get all fields of a single docente by ID
export const getDocenteById = async (req, res) => {
    try {
        const { id } = req.params;
        const docente = await Docente.findById(id);
        if (!docente) {
            return res.status(404).json({ error: 'Docente not found' });
        }
        res.status(200).json(docente);
    } catch (error) {
        console.error('Error fetching docente:', error);
        res.status(500).json({ error: 'Error fetching docente' });
    }
};

// Update a docente by ID
export const updateDocente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes } = req.body;
        const success = await Docente.update(id, nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes);
        if (!success) {
            return res.status(404).json({ error: 'Docente not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating docente:', error);
        res.status(500).json({ error: 'Error updating docente' });
    }
};

// Delete a docente by ID
export const deleteDocente = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Docente.delete(id);
        if (!success) {
            return res.status(404).json({ error: 'Docente not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting docente:', error);
        res.status(500).json({ error: 'Error deleting docente' });
    }
};

// Get estagiarios by docente ID
export const getEstagiariosByDocenteId = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiarios = await Docente.findEstagiariosByDocenteId(id);
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching estagiarios:', error);
        res.status(500).json({ error: 'Error fetching estagiarios' });
    }
};
