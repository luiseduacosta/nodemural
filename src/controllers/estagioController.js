// src/controllers/estagioController.js
import Estagio from '../models/estagio.js';

// Get all estagios (institutions)
export const getAllEstagios = async (req, res) => {
    try {
        const estagios = await Estagio.findAll();
        res.status(200).json(estagios);
    } catch (error) {
        console.error('Error fetching estagios:', error);
        res.status(500).json({ error: 'Error fetching estagios' });
    }
};

// Get estagio by ID
export const getEstagioById = async (req, res) => {
    try {
        const { id } = req.params;
        const estagio = await Estagio.findById(id);
        if (!estagio) {
            return res.status(404).json({ error: 'Estagio not found' });
        }
        res.status(200).json(estagio);
    } catch (error) {
        console.error('Error fetching estagio:', error);
        res.status(500).json({ error: 'Error fetching estagio' });
    }
};

// Create a new estagio
export const createEstagio = async (req, res) => {
    try {
        const { instituicao, cnpj, beneficio, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes } = req.body;
        const estagio = await Estagio.create(instituicao, cnpj, beneficio, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes);
        res.status(201).json(estagio);
    } catch (error) {
        console.error('Error creating estagio:', error);
        res.status(500).json({ error: 'Error creating estagio' });
    }
};

// Update an estagio
export const updateEstagio = async (req, res) => {
    try {
        const { id } = req.params;
        const { instituicao, cnpj, beneficio, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes } = req.body;
        const success = await Estagio.update(id, instituicao, cnpj, beneficio, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes);
        if (!success) {
            return res.status(404).json({ error: 'Estagio not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating estagio:', error);
        res.status(500).json({ error: 'Error updating estagio' });
    }
};

// Delete an estagio
export const deleteEstagio = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Estagio.delete(id);
        if (!success) {
            return res.status(404).json({ error: 'Estagio not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting estagio:', error);
        res.status(500).json({ error: 'Error deleting estagio' });
    }
};

// Get supervisores by estagio ID
export const getSupervisoresById = async (req, res) => {
    try {
        const { id } = req.params;
        const supervisores = await Estagio.findSupervisoresById(id);
        if (supervisores.length === 0) {
            return res.status(404).json({ error: 'Supervisores not found' });
        }
        res.status(200).json(supervisores);
    } catch (error) {
        console.error('Error fetching supervisores:', error);
        res.status(500).json({ error: 'Error fetching supervisores' });
    }
};

// Get mural by estagio ID
export const getMuralById = async (req, res) => {
    try {
        const { id } = req.params;
        const mural = await Estagio.findMuralById(id);
        res.status(200).json(mural);
    } catch (error) {
        console.error('Error fetching mural:', error);
        res.status(500).json({ error: 'Error fetching mural' });
    }
};
