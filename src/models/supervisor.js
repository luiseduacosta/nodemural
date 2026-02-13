// src/models/supervisor.js
import pool from '../database/db.js';

const Supervisor = {
    async findAll() {
        const rows = await pool.query(
            'SELECT id, nome, email, celular, cress FROM supervisores ORDER BY nome ASC'
        );
        return rows;
    },

    // Find supervisor by cress. There is only one supervisor per cress
    async findByCress(cress) {
        const rows = await pool.query(
            'SELECT id, nome, email, celular, cress FROM supervisores WHERE cress = ?',
            [cress]
        );
        return rows[0];
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT id, nome, email, celular, cress FROM supervisores WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    async create(nome, email, celular, cress) {
        const result = await pool.query(
            'INSERT INTO supervisores (nome, email, celular, cress) VALUES (?, ?, ?, ?)',
            [nome, email, celular, cress]
        );
        return { id: Number(result.insertId), nome, email, celular, cress };
    },

    async update(id, nome, email, celular, cress) {
        const result = await pool.query(
            'UPDATE supervisores SET nome = ?, email = ?, celular = ?, cress = ? WHERE id = ?',
            [nome, email, celular, cress, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        // First delete relationships
        await pool.query('DELETE FROM inst_super WHERE supervisor_id = ?', [id]);
        // Then delete supervisor
        const result = await pool.query(
            'DELETE FROM supervisores WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    },

    async findInstituicoesBySupervisorId(supervisor_id) {
        const rows = await pool.query(
            `SELECT e.id as instituicao_id, e.instituicao
             FROM estagio e
             INNER JOIN inst_super i ON e.id = i.instituicao_id
             WHERE i.supervisor_id = ?
             ORDER BY e.instituicao ASC`,
            [supervisor_id]
        );
        return rows;
    },

    async findEstagiariosBySupervisorId(supervisor_id) {
        const rows = await pool.query(
            `SELECT e.id as estagiario_id, 
            e.aluno_id as aluno_id, 
            a.registro as aluno_registro, 
            a.nome as aluno_nome, 
            e.periodo as estagiario_periodo, 
            e.nivel as estagiario_nivel 
             FROM estagiarios e
             JOIN alunos a ON e.aluno_id = a.id
             WHERE e.supervisor_id = ?
             ORDER BY estagiario_periodo DESC, estagiario_nivel ASC`,
            [supervisor_id]
        );
        return rows;
    },

    async addInstituicao(supervisor_id, instituicao_id) {
        const result = await pool.query(
            'INSERT INTO inst_super (supervisor_id, instituicao_id) VALUES (?, ?)',
            [supervisor_id, instituicao_id]
        );
        return { supervisor_id, instituicao_id };
    },

    async removeInstituicao(supervisor_id, instituicao_id) {
        const result = await pool.query(
            'DELETE FROM inst_super WHERE supervisor_id = ? AND instituicao_id = ?',
            [supervisor_id, instituicao_id]
        );
        return result.affectedRows > 0;
    }
};

export default Supervisor;
