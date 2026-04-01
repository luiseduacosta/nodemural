import pool from '../database/db.js';

const Turno = {
    async findAll() {
        const rows = await pool.query(
            'SELECT * FROM turnos ORDER BY turno ASC'
        );
        return rows;
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT * FROM turnos WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    async create(turno) {
        const result = await pool.query(
            'INSERT INTO turnos (turno) VALUES (?)',
            [turno]
        );
        return { id: Number(result.insertId), turno };
    },

    async update(id, turno) {
        const result = await pool.query(
            'UPDATE turnos SET turno = ? WHERE id = ?',
            [turno, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM turnos WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default Turno;
