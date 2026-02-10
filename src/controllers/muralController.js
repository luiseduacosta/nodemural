// src/controllers/muralController.js
import Mural from '../models/mural.js';

// Get all mural entries
export const getAllMural = async (req, res) => {
    try {
        const { periodo } = req.query;
        const mural = await Mural.findAll(periodo);
        return res.status(200).json(mural);
    } catch (error) {
        console.error('Error fetching mural:', error);
        res.status(500).json({ error: 'Error fetching mural' });
    }
};

// Get distinct periods
export const getDistinctPeriods = async (req, res) => {
    try {
        const periods = await Mural.findDistinctPeriods();
        if (!periods) {
            return res.status(404).json({ error: 'No periods found' });
        } else {
            // console.log(periods);
        }
        res.status(200).json(periods);
    } catch (error) {
        console.error('Error fetching periods:', error);
        res.status(500).json({ error: 'Error fetching periods' });
    }
};

// Get mural entry by ID
export const getMuralById = async (req, res) => {
    try {
        const { id } = req.params;
        const muralEntry = await Mural.findById(id);
        if (!muralEntry) {
            return res.status(404).json({ error: 'Mural not found with ID: ' + id });
        }
        res.status(200).json(muralEntry);
    } catch (error) {
        console.error('Error fetching mural:', error);
        res.status(500).json({ error: 'Error fetching mural' });
    }
};

// Nested inscricoes route
export const getInscricoesByMuralId = async (req, res) => {
    try {
        const { id } = req.params;
        const inscricoes = await Mural.findInscricoesByMuralId(id);
        res.status(200).json(inscricoes);
    } catch (error) {
        console.error('Error fetching inscricoes:', error);
        res.status(500).json({ error: 'Error fetching inscricoes' });
    }
};

// Create a new mural entry
export const createMural = async (req, res) => {
    try {
        const { instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, outras, periodo, datafax, localInscricao, email } = req.body;
        const mural = await Mural.create(instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, outras, periodo, datafax, localInscricao, email);
        res.status(201).json(mural);
    } catch (error) {
        console.error('Error creating mural:', error);
        res.status(500).json({ error: 'Error creating mural' });
    }
};

// Update a mural entry
export const updateMural = async (req, res) => {
    try {
        const { id } = req.params;
        const { instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, outras, periodo, datafax, localInscricao, email } = req.body;
        const success = await Mural.update(id, instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, outras, periodo, datafax, localInscricao, email);
        if (!success) {
            return res.status(404).json({ error: 'Mural not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating mural:', error);
        res.status(500).json({ error: 'Error updating mural' });
    }
};

// Delete a mural entry
export const deleteMural = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Mural.delete(id);
        if (!success) {
            return res.status(404).json({ error: 'Mural not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting mural:', error);
        res.status(500).json({ error: 'Error deleting mural' });
    }
};
