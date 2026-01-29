import pool from '../database/db.js';

const AreaInstituicao = {
    async findAll() {
        const rows = await pool.query(
            'SELECT * FROM area_instituicoes ORDER BY area ASC'
        );
        return rows;
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT * FROM area_instituicoes WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    async create(area) {
        const result = await pool.query(
            'INSERT INTO area_instituicoes (area) VALUES (?)',
            [area]
        );
        return { id: Number(result.insertId), area };
    },

    async update(id, area) {
        const result = await pool.query(
            'UPDATE area_instituicoes SET area = ? WHERE id = ?',
            [area, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM area_instituicoes WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default AreaInstituicao;
