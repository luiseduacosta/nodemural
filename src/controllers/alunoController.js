// src/controllers/alunoController.js
import Aluno from '../models/aluno.js';

// Create a new aluno
export const createAluno = async (req, res) => {
    try {
        const { nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes } = req.body;
        const aluno = await Aluno.create(nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes);
        res.status(201).json(aluno);
    } catch (error) {
        console.error('Error creating aluno:', error);
        res.status(500).json({ error: 'Error creating aluno' });
    }
};

// Get a single aluno by DRE
export const getAlunoByRegistro = async (req, res) => {
    try {
        const { registro } = req.params;
        const aluno = await Aluno.findByRegistro(registro);
        if (!aluno) {
            return res.status(404).json({ error: 'Aluno not found' });
        }
        res.status(200).json(aluno);
    } catch (error) {
        console.error('Error fetching aluno:', error);
        res.status(500).json({ error: 'Error fetching aluno' });
    }
};

// Get all alunos
export const getAllAlunos = async (req, res) => {
    try {
        const alunos = await Aluno.findAll();
        res.status(200).json(alunos);
    } catch (error) {
        console.error('Error fetching alunos:', error);
        res.status(500).json({ error: 'Error fetching alunos' });
    }
};

// Get a single aluno by ID independent of estagiarios
export const getAlunoById = async (req, res) => {
    try {
        const { id } = req.params;
        const aluno = await Aluno.findAlunoById(id);
        console.log(aluno);
        if (!aluno) {
            return res.status(404).json({ error: 'Aluno not found' });
        }
        res.status(200).json(aluno);
    } catch (error) {
        console.error('Error fetching aluno:', error);
        res.status(500).json({ error: 'Error fetching aluno' });
    }
};

// Get a single aluno by ID, including estagiario info if exists
export const getEstagiariosByAlunoId = async (req, res) => {
    try {
        const { id } = req.params;
        const estagiarios = await Aluno.findEstagiariosByAlunoId(id);
        if (!estagiarios) {
            return res.status(404).json({ error: 'Estagiários not found' });
        }
        res.status(200).json(estagiarios);
    } catch (error) {
        console.error('Error fetching aluno:', error);
        res.status(500).json({ error: 'Error fetching aluno' });
    }
};

// Get all the inscricoes of a given aluno_id
export const getInscricoesByAlunoId = async (req, res) => {
    try {
        const { id } = req.params;
        const inscricoes = await Aluno.findInscricoesByAlunoId(id);
        res.status(200).json(inscricoes);
    } catch (error) {
        console.error('Error fetching inscricoes for aluno:', error);
        res.status(500).json({ error: 'Error fetching inscricoes for aluno' });
    }
};

// Update a aluno by ID
export const updateAluno = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes } = req.body;
        const aluno = await Aluno.update(id, nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes);
        if (!aluno) {
            return res.status(404).json({ error: 'Aluno not found' });
        }
        res.status(200).json(aluno);
    } catch (error) {
        console.error('Error updating aluno:', error);
        res.status(500).json({ error: 'Error updating aluno' });
    }
};

// Delete a aluno by ID
export const deleteAluno = async (req, res) => {
    try {
        const { id } = req.params;
        const aluno = await Aluno.delete(id);
        if (!aluno) {
            return res.status(404).json({ error: 'Aluno not found ' + id });
        }
        res.status(200).json(aluno);
    } catch (error) {
        console.error('Error deleting aluno:', error);
        res.status(500).json({ error: 'Error deleting aluno ' + id });
    }
};