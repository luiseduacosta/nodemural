// src/models/Questionario.js
import pool from '../database/db.js';

const Questionario = {
    async create(title, description, created, modified, is_active, category, target_user_type) {
        const result = await pool.query(
            'INSERT INTO questionarios (title, description, created, modified, is_active, category, target_user_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, description, created, modified, is_active, category, target_user_type]
        );
        return { id: Number(result.insertId), title, description, created, modified, is_active, category, target_user_type };
    },

    async findAll() {
        const rows = await pool.query('SELECT * FROM questionarios');
        return rows;
    },

    async findById(id) {
        const rows = await pool.query('SELECT * FROM questionarios WHERE id = ?', [id]);
        return rows[0];
    },

    async update(id, title, description, created, modified, is_active, category, target_user_type) {
        const result = await pool.query(
            'UPDATE questionarios SET title = ?, description = ?, created = ?, modified = ?, is_active = ?, category = ?, target_user_type = ? WHERE id = ?',
            [title, description, created, modified, is_active, category, target_user_type, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query('DELETE FROM questionarios WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default Questionario;
