// src/models/atividades.js
import pool from '../database/db.js';

const Atividades = {
    async findAll(req) {
        let query = `SELECT f.id, f.estagiario_id, f.dia, f.inicio, f.final, f.atividade, TIMEDIFF(f.final, f.inicio) as horario, a.nome as aluno_nome, a.registro as aluno_registro
                     FROM folhadeatividades f
                     LEFT JOIN estagiarios e ON f.estagiario_id = e.id
                     LEFT JOIN alunos a ON e.aluno_id = a.id`;
        const params = [];

        // Filter by estagiario_id if provided in query
        if (req && req.query && req.query.estagiario_id) {
            query += " WHERE f.estagiario_id = ?";
            params.push(req.query.estagiario_id);
        }

        query += " ORDER BY f.dia DESC, f.inicio ASC";

        const rows = await pool.query(query, params);
        return rows;
    },

    async findById(id) {
        const query = `SELECT f.id, f.estagiario_id, f.dia, f.inicio, f.final, f.atividade, TIMEDIFF(f.final, f.inicio) as horario, a.nome as aluno_nome, a.id as alunoId, a.registro as aluno_registro
                     FROM folhadeatividades f
                     LEFT JOIN estagiarios e ON f.estagiario_id = e.id
                     LEFT JOIN alunos a ON e.aluno_id = a.id
                     WHERE f.id = ?`;
        const rows = await pool.query(query, [id]);
        return rows[0];
    },

    async create(estagiario_id, dia, inicio, final, atividade) {
        const result = await pool.query(
            "INSERT INTO folhadeatividades (estagiario_id, dia, inicio, final, atividade) VALUES (?, ?, ?, ?, ?)",
            [estagiario_id, dia, inicio, final, atividade]
        );
        return { id: Number(result.insertId), estagiario_id, dia, inicio, final, atividade };
    },

    async update(id, estagiario_id, dia, inicio, final, atividade) {
        const result = await pool.query(
            "UPDATE folhadeatividades SET estagiario_id = ?, dia = ?, inicio = ?, final = ?, atividade = ? WHERE id = ?",
            [estagiario_id, dia, inicio, final, atividade, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query("DELETE FROM folhadeatividades WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
};

export default Atividades;
