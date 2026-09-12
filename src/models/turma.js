// src/models/turma.js
import pool from '../database/db.js';

const Turma = {

    async create(turma) {
        const result = await pool.query(
            "INSERT INTO turmas (turma) VALUES (?)",
            [turma]
        );
        return { id: Number(result.insertId), turma };
    },

    async findById(id) {
        const rows = await pool.query("SELECT * FROM turmas WHERE id = ?", [id]);
        return rows[0];
    },

    async findAll() {
        const rows = await pool.query("SELECT * FROM turmas ORDER BY turma ASC");
        return rows;
    },

    async update(id, turma) {
        const result = await pool.query(
            "UPDATE turmas SET turma = ? WHERE id = ?",
            [turma, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query("DELETE FROM turmas WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
};

export default Turma;
