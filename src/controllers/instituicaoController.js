import Instituicao from '../models/instituicao.js';

// Get all instituicoes
export const getAllInstituicoes = async (req, res) => {
    try {
        const instituicoes = await Instituicao.findAll();
        res.status(200).json(instituicoes);
    } catch (error) {
        console.error('Error fetching instituicoes:', error);
        res.status(500).json({ error: 'Error fetching instituicoes' });
    }
};

// Get instituicao by ID
export const getInstituicaoById = async (req, res) => {
    try {
        const { id } = req.params;
        const instituicao = await Instituicao.findById(id);
        if (!instituicao) {
            return res.status(404).json({ error: 'Instituicao not found' });
        }
        res.status(200).json(instituicao);
    } catch (error) {
        console.error('Error fetching instituicao:', error);
        res.status(500).json({ error: 'Error fetching instituicao' });
    }
};

// Create a new instituicao
export const createInstituicao = async (req, res) => {
    try {
        const { instituicao, cnpj, beneficio, areainstituicoes_id, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes } = req.body;
        const newInstituicao = await Instituicao.create(instituicao, cnpj, beneficio, areainstituicoes_id, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes);
        res.status(201).json(newInstituicao);
    } catch (error) {
        console.error('Error creating instituicao:', error);
        res.status(500).json({ error: 'Error creating instituicao' });
    }
};

// Update an instituicao
export const updateInstituicao = async (req, res) => {
    try {
        const { id } = req.params;
        const { instituicao, cnpj, beneficio, areainstituicoes_id, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes } = req.body;
        const success = await Instituicao.update(id, instituicao, cnpj, beneficio, areainstituicoes_id, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes);
        if (!success) {
            return res.status(404).json({ error: 'Instituicao not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error updating instituicao:', error);
        res.status(500).json({ error: 'Error updating instituicao' });
    }
};

// Delete an instituicao
export const deleteInstituicao = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await Instituicao.delete(id);
        if (!success) {
            return res.status(404).json({ error: 'Instituicao not found' });
        }
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting instituicao:', error);
        res.status(500).json({ error: 'Error deleting instituicao' });
    }
};

// Get supervisores by instituicao ID
export const getSupervisoresById = async (req, res) => {
    try {
        const { id } = req.params;
        const supervisores = await Instituicao.findSupervisoresById(id);
        res.status(200).json(supervisores);
    } catch (error) {
        console.error('Error fetching supervisores:', error);
        res.status(500).json({ error: 'Error fetching supervisores' });
    }
};

// Get mural by instituicao ID
export const getMuralById = async (req, res) => {
    try {
        const { id } = req.params;
        const mural = await Instituicao.findMuralById(id);
        res.status(200).json(mural);
    } catch (error) {
        console.error('Error fetching mural:', error);
        res.status(500).json({ error: 'Error fetching mural' });
    }
};
