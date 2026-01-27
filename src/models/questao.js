// src/models/questao.js
import pool from '../database/db.js';

const Questao = {
    async create(questionario_id, text, type, options, ordem, created, modified) {
        const result = await pool.query(
            'INSERT INTO questoes (questionario_id, text, type, options, ordem, created, modified) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [questionario_id, text, type, options, ordem, created, modified]
        );
        return { id: Number(result.insertId), questionario_id, text, type, options, ordem, created, modified };
    },

    async findAll(questionario_id = null) {
        let query = 'SELECT questoes.*, questionarios.title as questionario_title FROM questoes join questionarios on questoes.questionario_id = questionarios.id';
        let params = [];

        if (questionario_id) {
            query += ' WHERE questoes.questionario_id = ?';
            params.push(questionario_id);
        }
        query += ' ORDER BY questoes.questionario_id ASC, questoes.ordem ASC, questoes.id DESC';

        const rows = await pool.query(query, params);
        return rows;
    },

    async findById(id) {
        const rows = await pool.query('SELECT questoes.*, questionarios.title as questionario_title FROM questoes join questionarios on questoes.questionario_id = questionarios.id WHERE questoes.id = ?', [id]);
        return rows[0];
    },

    async update(id, questionario_id, text, type, options, ordem, created, modified) {
        const result = await pool.query(
            'UPDATE questoes SET questionario_id = ?, text = ?, type = ?, options = ?, ordem = ?, created = ?, modified = ? WHERE id = ?',
            [questionario_id, text, type, options, ordem, created, modified, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query('DELETE FROM questoes WHERE id = ?', [id]);
        try {
            console.log(result);
        } catch (error) {
            console.error('Error deleting questao:', error);
            return false;
        }
        return result.affectedRows > 0;
    }
};

export default Questao;
