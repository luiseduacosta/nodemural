// src/controllers/configuracaoController.js
import Configuracao from '../models/configuracao.js';

// Get all configuracoes
export const getAllConfiguracoes = async (req, res) => {
    try {
        const configuracoes = await Configuracao.findAll(req);
        res.status(200).json(configuracoes);
    } catch (error) {
        console.error('Error fetching configuracoes:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a single configuracao by ID
export const getConfiguracaoById = async (req, res) => {
    try {
        const { id } = req.params;
        const configuracao = await Configuracao.findById(id);
        if (!configuracao) {
            return res.status(404).json({ error: 'Configuracao not found' });
        }
        res.status(200).json(configuracao);
    } catch (error) {
        console.error('Error fetching configuracao:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update a configuracao by ID
export const updateConfiguracao = async (req, res) => {
    try {
        const { id } = req.params;
        const { mural_periodo_atual, curso_turma_atual, curso_abertura_inscricoes, curso_encerramento_inscricoes, termo_compromisso_periodo, termo_compromisso_inicio, termo_compromisso_final, periodo_calendario_academico } = req.body;
        // console.log("Updating configuracao with ID:", id);
        await Configuracao.update( mural_periodo_atual, curso_turma_atual, curso_abertura_inscricoes, curso_encerramento_inscricoes, termo_compromisso_periodo, termo_compromisso_inicio, termo_compromisso_final, periodo_calendario_academico, id);
        res.status(204).end();
    } catch (error) {
        // console.error('Error updating configuracao:', error);
        res.status(500).json({ error: error.message });
    }
};
