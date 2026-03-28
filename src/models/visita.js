// src/models/visita.js
import pool from '../database/db.js';

const Visita = {
    async findAllVisitas(req) {
        let query = `SELECT v.*, i.instituicao as instituicao_nome
                     FROM visitas v
                     LEFT JOIN instituicoes i ON v.instituicao_id = i.id`;
        let params = [];

        if (req && req.query && req.query.instituicao_id) {
            query += " WHERE v.instituicao_id = ?";
            params.push(req.query.instituicao_id);
        }

        query += " ORDER BY v.data DESC";

        const rows = await pool.query(query, params);
        return rows;
    },

    async findByIdVisita(id) {
        const query = "SELECT v.*, i.instituicao as instituicao_nome FROM visitas v left join instituicoes i on v.instituicao_id = i.id WHERE v.id = ?";
        const rows = await pool.query(query, [id]);
        return rows[0];
    },

    async createVisita(instituicao_id, data, responsavel, motivo, avaliacao, descricao) {
        const result = await pool.query(
            "INSERT INTO visitas (instituicao_id, data, responsavel, motivo, avaliacao, descricao) VALUES (?, ?, ?, ?, ?, ?)",
            [instituicao_id, data, responsavel, motivo, avaliacao, descricao]
        );
        return { id: Number(result.insertId), instituicao_id, data, responsavel, motivo, avaliacao, descricao };
    },

    async updateVisita(id, instituicao_id, data, responsavel, motivo, avaliacao, descricao) {
        const result = await pool.query(
            "UPDATE visitas SET instituicao_id = ?, data = ?, responsavel = ?, motivo = ?, avaliacao = ?, descricao = ? WHERE id = ?",
            [instituicao_id, data, responsavel, motivo, avaliacao, descricao, id]
        );
        return result.affectedRows > 0;
    },

    async deleteVisita(id) {
        const result = await pool.query("DELETE FROM visitas WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
};

export default Visita;
