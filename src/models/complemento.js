import pool from '../database/db.js';

const Complemento = {
    async findAll() {
        const rows = await pool.query(
            'SELECT * FROM complementos ORDER BY periodo_especial ASC'
        );
        return rows;
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT * FROM complementos WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    async create(complemento) {
        const result = await pool.query(
            'INSERT INTO complementos (periodo_especial) VALUES (?)',
            [complemento]
        );
        return { id: Number(result.insertId), complemento };
    },

    async update(id, complemento) {
        const result = await pool.query(
            'UPDATE complementos SET periodo_especial = ? WHERE id = ?',
            [complemento, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM complementos WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default Complemento;
