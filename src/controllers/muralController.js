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
            console.log(periods);
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

// Get inscricoes by mural ID
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

const parseIntOrNull = (val) => (val !== undefined && val !== null && val !== '' ? parseInt(val, 10) : null);

// Create a new mural entry
export const createMural = async (req, res) => {
    try {
        const raw = req.body;
        const instituicao_id = parseIntOrNull(raw.instituicao_id);
        const instituicao = raw.instituicao || null;
        const convenio = raw.convenio ?? '0';
        const vagas = parseIntOrNull(raw.vagas);
        const beneficios = raw.beneficios || null;
        const final_de_semana = parseIntOrNull(raw.final_de_semana);
        const carga_horaria = parseIntOrNull(raw.carga_horaria);
        const requisitos = raw.requisitos || null;
        const horario = raw.horario || null;
        const data_selecao = raw.data_selecao || null;
        const data_inscricao = raw.data_inscricao || null;
        const horario_selecao = raw.horario_selecao || null;
        const local_selecao = raw.local_selecao || null;
        const forma_selecao = raw.forma_selecao ?? '0';
        const contato = raw.contato || null;
        const outras = raw.outras || null;
        const periodo = raw.periodo || null;
        const local_inscricao = raw.local_inscricao ?? '0';
        const email = raw.email || null;

        const mural = await Mural.create(instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, carga_horaria, requisitos, horario, data_selecao, data_inscricao, horario_selecao, local_selecao, forma_selecao, contato, outras, periodo, local_inscricao, email);
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
        const raw = req.body;
        const instituicao_id = parseIntOrNull(raw.instituicao_id);
        const instituicao = raw.instituicao || null;
        const convenio = raw.convenio ?? '0';
        const vagas = parseIntOrNull(raw.vagas);
        const beneficios = raw.beneficios || null;
        const final_de_semana = parseIntOrNull(raw.final_de_semana);
        const carga_horaria = parseIntOrNull(raw.carga_horaria);
        const requisitos = raw.requisitos || null;
        const horario = raw.horario || null;
        const data_selecao = raw.data_selecao || null;
        const data_inscricao = raw.data_inscricao || null;
        const horario_selecao = raw.horario_selecao || null;
        const local_selecao = raw.local_selecao || null;
        const forma_selecao = raw.forma_selecao ?? '0';
        const contato = raw.contato || null;
        const outras = raw.outras || null;
        const periodo = raw.periodo || null;
        const local_inscricao = raw.local_inscricao ?? '0';
        const email = raw.email || null;

        const success = await Mural.update(id, instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, carga_horaria, requisitos, horario, data_selecao, data_inscricao, horario_selecao, local_selecao, forma_selecao, contato, outras, periodo, local_inscricao, email);
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
