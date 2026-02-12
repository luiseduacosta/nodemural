// src/models/inscricao.js
import pool from '../database/db.js';

const Inscricao = {
    async findAll(periodo = null) {
        let query = `SELECT i.*, a.nome as aluno_nome, m.instituicao
                    FROM inscricoes i
                    LEFT JOIN alunos a ON i.aluno_id = a.id
                    LEFT JOIN mural_estagio m ON i.muralestagio_id = m.id`;
        let params = [];

        if (periodo) {
            query += ' WHERE i.periodo = ?';
            params.push(periodo);
        }

        query += ' ORDER BY i.periodo DESC, a.nome ASC';

        const rows = await pool.query(query, params);
        return rows;
    },

    async findDistinctPeriods() {
        const rows = await pool.query(
            'SELECT DISTINCT periodo FROM inscricoes ORDER BY periodo DESC'
        );
        return rows;
    },

    async findById(id) {
        const query = `SELECT i.*, a.nome as aluno_nome, a.email as aluno_email, m.instituicao
                      FROM inscricoes i
                      LEFT JOIN alunos a ON i.aluno_id = a.id
                      LEFT JOIN mural_estagio m ON i.muralestagio_id = m.id
                      WHERE i.id = ?`;
        const rows = await pool.query(query, [id]);
        return rows[0];
    },

    async findByAlunoAndMural(aluno_id, muralestagio_id) {
        const rows = await pool.query(
            'SELECT * FROM inscricoes WHERE aluno_id = ? AND muralestagio_id = ? LIMIT 1',
            [aluno_id, muralestagio_id]
        );
        return rows;
    },

    async findByMuralId(mural_id) {
        const query = `SELECT i.*, a.nome as aluno_nome, a.email as aluno_email, a.registro as aluno_registro
                      FROM inscricoes i
                      LEFT JOIN alunos a ON i.aluno_id = a.id
                      WHERE i.muralestagio_id = ?
                      ORDER BY i.data DESC`;
        const rows = await pool.query(query, [mural_id]);
        return rows;
    },

    async create(registro, aluno_id, muralestagio_id, data, periodo) {
        // Check if student already registered for this mural
        const existing = await pool.query(
            'SELECT id FROM inscricoes WHERE aluno_id = ? AND muralestagio_id = ?',
            [aluno_id, muralestagio_id]
        );

        if (existing.length > 0) {
            throw new Error('Aluno já inscrito nesta vaga.');
        }

        const result = await pool.query(
            'INSERT INTO inscricoes (registro, aluno_id, muralestagio_id, data, periodo) VALUES (?, ?, ?, ?, ?)',
            [registro, aluno_id, muralestagio_id, data, periodo]
        );
        return { id: Number(result.insertId), registro, aluno_id, muralestagio_id, data, periodo };
    },

    async update(id, registro, aluno_id, muralestagio_id, data, periodo) {
        // Check if another student (not this one) is already registered for this mural
        const existing = await pool.query(
            'SELECT id FROM inscricoes WHERE aluno_id = ? AND muralestagio_id = ? AND id != ?',
            [aluno_id, muralestagio_id, id]
        );

        if (existing.length > 0) {
            throw new Error('Aluno já inscrito nesta vaga.');
        }

        const result = await pool.query(
            'UPDATE inscricoes SET registro = ?, aluno_id = ?, muralestagio_id = ?, data = ?, periodo = ? WHERE id = ?',
            [registro, aluno_id, muralestagio_id, data, periodo, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM inscricoes WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default Inscricao;
