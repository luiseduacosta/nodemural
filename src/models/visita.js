// src/models/visita.js
import pool from '../database/db.js';

const Visita = {
    async findAll(req) {
        let query = `SELECT v.*, e.instituicao
                     FROM visita v
                     LEFT JOIN estagio e ON v.instituicao_id = e.id`;
        let params = [];

        if (req && req.query && req.query.instituicao_id) {
            query += " WHERE v.instituicao_id = ?";
            params.push(req.query.instituicao_id);
        }

        query += " ORDER BY v.data DESC";

        const rows = await pool.query(query, params);
        return rows;
    },

    async findById(id) {
        const query = "SELECT visita.*, estagio.instituicao FROM visita left join estagio on visita.instituicao_id = estagio.id WHERE visita.id = ?";
        const rows = await pool.query(query, [id]);
        return rows[0];
    },

    async create(instituicao_id, data, responsavel, motivo, avaliacao, descricao) {
        const result = await pool.query(
            "INSERT INTO visita (instituicao_id, data, responsavel, motivo, avaliacao, descricao) VALUES (?, ?, ?, ?, ?, ?)",
            [instituicao_id, data, responsavel, motivo, avaliacao, descricao]
        );
        return { id: Number(result.insertId), instituicao_id, data, responsavel, motivo, avaliacao, descricao };
    },

    async update(id, instituicao_id, data, responsavel, motivo, avaliacao, descricao) {
        const result = await pool.query(
            "UPDATE visita SET instituicao_id = ?, data = ?, responsavel = ?, motivo = ?, avaliacao = ?, descricao = ? WHERE id = ?",
            [instituicao_id, data, responsavel, motivo, avaliacao, descricao, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query("DELETE FROM visita WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
};

export default Visita;
