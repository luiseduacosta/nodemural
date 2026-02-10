// src/models/resposta.js
import pool from '../database/db.js';

// Get Respostas
const Resposta = {
    // Get all Respostas
    async findAll(supervisor_id = null) {
        let query = `SELECT r.*, 
                    q.title as questionario_title,
                    a.nome as aluno_nome,
                    s.nome as supervisor_nome,
                    e.supervisor_id
                    FROM respostas r
                    LEFT JOIN questionarios q ON r.questionario_id = q.id
                    LEFT JOIN estagiarios e ON r.estagiario_id = e.id
                    LEFT JOIN alunos a ON e.aluno_id = a.id
                    LEFT JOIN supervisores s ON e.supervisor_id = s.id`;

        let params = [];
        if (supervisor_id) {
            query += ' WHERE e.supervisor_id = ?';
            params.push(supervisor_id);
        }
        query += ' ORDER BY r.modified DESC';

        const rows = await pool.query(query, params);
        return rows;
    },

    // Get all Respostas by questionario_id
    async findAllByQuestionario(questionario_id) {
        const query = `SELECT r.*, 
                    q.title as questionario_title,
                    a.nome as aluno_nome,
                    s.nome as supervisor_nome,
                    e.supervisor_id
                    FROM respostas r
                    LEFT JOIN questionarios q ON r.questionario_id = q.id
                    LEFT JOIN estagiarios e ON r.estagiario_id = e.id
                    LEFT JOIN alunos a ON e.aluno_id = a.id
                    LEFT JOIN supervisores s ON e.supervisor_id = s.id
                    WHERE q.id = ?`;
        const rows = await pool.query(query, [questionario_id]);
        return rows;
    },

    // Get all Respostas by estagiario_id
    async findAllByEstagiario(estagiario_id) {
        const query = `SELECT r.*, 
                    q.title as questionario_title,
                    a.nome as aluno_nome,
                    s.nome as supervisor_nome,
                    e.supervisor_id
                    FROM respostas r
                    LEFT JOIN questionarios q ON r.questionario_id = q.id
                    LEFT JOIN estagiarios e ON r.estagiario_id = e.id
                    LEFT JOIN alunos a ON e.aluno_id = a.id
                    LEFT JOIN supervisores s ON e.supervisor_id = s.id
                    WHERE e.id = ?`;
        const rows = await pool.query(query, [estagiario_id]);
        return rows;
    },

    // Get a single Resposta by ID
    async findById(id) {
        const query = `SELECT r.*, 
                      q.title as questionario_title,
                      a.nome as aluno_nome,
                      s.nome as supervisor_nome,
                      e.supervisor_id
                      FROM respostas r
                      LEFT JOIN questionarios q ON r.questionario_id = q.id
                      LEFT JOIN estagiarios e ON r.estagiario_id = e.id
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      WHERE r.id = ?`;
        const rows = await pool.query(query, [id]);
        return rows[0];
    },

    // Get a single Resposta by estagiario_id and question_id
    async findByEstagiarioAndQuestionario(estagiario_id, questionario_id) {
        const query = `SELECT r.*, 
                      q.title as questionario_title,
                      a.nome as aluno_nome,
                      s.nome as supervisor_nome,
                      e.supervisor_id
                      FROM respostas r
                      LEFT JOIN questionarios q ON r.questionario_id = q.id
                      LEFT JOIN estagiarios e ON r.estagiario_id = e.id
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      WHERE r.estagiario_id = ? AND r.questionario_id = ?`;
        const rows = await pool.query(query, [estagiario_id, questionario_id]);
        return rows[0];
    },

    // Gel all Resposta by Supervisor
    async findAllBySupervisor(supervisor_id) {
        const query = `SELECT r.*, 
                      q.title as questionario_title,
                      a.nome as aluno_nome,
                      s.nome as supervisor_nome,
                      e.supervisor_id
                      FROM respostas r
                      LEFT JOIN questionarios q ON r.questionario_id = q.id
                      LEFT JOIN estagiarios e ON r.estagiario_id = e.id
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      WHERE e.supervisor_id = ?`;
        const rows = await pool.query(query, [supervisor_id]);
        return rows;
    },

    // Create a new Resposta
    async create(questionario_id, estagiario_id, response) {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const result = await pool.query(
            'INSERT INTO respostas ( questionario_id, estagiario_id, response, created, modified) VALUES (?, ?, ?, ?, ?)',
            [questionario_id, estagiario_id, JSON.stringify(response), now, now]
        );
        return { id: Number(result.insertId), questionario_id, estagiario_id, response, created: now, modified: now };
    },

    // Update a Resposta
    async update(id, questionario_id, estagiario_id, response) {
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const result = await pool.query(
            'UPDATE respostas SET questionario_id = ?, estagiario_id = ?, response = ?, modified = ? WHERE id = ?',
            [questionario_id, estagiario_id, JSON.stringify(response), now, id]
        );
        return result.affectedRows > 0;
    },

    // Delete a Resposta
    async delete(id) {
        const result = await pool.query('DELETE FROM respostas WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    // Get all Estagiarios by supervisor_id
    async findEstagiariosBySupervisor(supervisor_id) {
        const query = `SELECT e.id as estagiario_id,
                      a.nome as aluno_nome,
                      a.registro as aluno_registro,
                      e.nivel,
                      e.periodo,
                      s.nome as supervisor_nome
                      FROM estagiarios e
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      WHERE e.supervisor_id = ?
                      ORDER BY a.nome ASC`;
        const rows = await pool.query(query, [supervisor_id]);
        return rows;
    },

    // Get question count by questionario_id
    async getQuestionCount(questionario_id) {
        const result = await pool.query(
            'SELECT COUNT(*) as count FROM questoes WHERE questionario_id = ?',
            [questionario_id]
        );
        return result[0].count;
    },

    // Get question count by supervisor (Legacy or expected by controller)
    async countQuestionsBySupervisor(supervisor_id) {
        const query = `SELECT COUNT(r.id) as count
                      FROM respostas r
                      JOIN estagiarios e ON r.estagiario_id = e.id
                      WHERE e.supervisor_id = ?`;
        const result = await pool.query(query, [supervisor_id]);
        return result[0].count;
    },

    // Check if Resposta is complete
    async isComplete(id) {
        const resposta = await this.findById(id);
        if (!resposta) return false;

        const questionCount = await this.getQuestionCount(resposta.questionario_id);
        const response = typeof resposta.response === 'string'
            ? JSON.parse(resposta.response)
            : resposta.response;

        const answeredCount = Object.keys(response).length;
        return answeredCount >= questionCount;
    }
};

export default Resposta;
