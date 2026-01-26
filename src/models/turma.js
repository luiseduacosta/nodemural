// src/models/turma.js
import pool from '../database/db.js';

const Turma = {

    async create(area) {
        const result = await pool.query(
            "INSERT INTO turma_estagios (area) VALUES (?)",
            [area]
        );
        return { id: Number(result.insertId), area };
    },

    async findById(id) {
        const rows = await pool.query("SELECT * FROM turma_estagios WHERE id = ?", [id]);
        return rows[0];
    },

    async findAll() {
        const rows = await pool.query("SELECT * FROM turma_estagios ORDER BY area ASC");
        return rows;
    },

    async update(id, area) {
        const result = await pool.query(
            "UPDATE turma_estagios SET area = ? WHERE id = ?",
            [area, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query("DELETE FROM turma_estagios WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
};

export default Turma;
