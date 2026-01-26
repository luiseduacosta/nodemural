// src/models/estagio.js
import pool from '../database/db.js';

const Estagio = {
    async findAll() {
        const rows = await pool.query(
            'SELECT * FROM estagio ORDER BY instituicao ASC'
        );
        return rows;
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT * FROM estagio WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    async create(instituicao, cnpj, beneficio, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes) {
        const result = await pool.query(
            'INSERT INTO estagio (instituicao, cnpj, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [instituicao, cnpj, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes]
        );
        return { id: Number(result.insertId), instituicao, cnpj, beneficio };
    },

    async update(id, instituicao, cnpj, beneficio, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes) {
        const result = await pool.query(
            'UPDATE estagio SET instituicao = ?, cnpj = ?, beneficio = ?, url = ?, endereco = ?, bairro = ?, municipio = ?, cep = ?, telefone = ?, fim_de_semana = ?, convenio = ?, expira = ?, seguro = ?, avaliacao = ?, observacoes = ? WHERE id = ?',
            [instituicao, cnpj, beneficio, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, avaliacao, observacoes, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM estagio WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    },

    async findSupervisoresById(id) {
        const rows = await pool.query(
            `SELECT * FROM supervisores 
             WHERE id IN (SELECT supervisor_id FROM inst_super WHERE instituicao_id = ?) 
             ORDER BY nome ASC`,
            [id]
        );
        return rows;
    },

    async findMuralById(id) {
        const query = `
            SELECT id, periodo, vagas
            FROM mural_estagio
            WHERE instituicao_id = ?
            ORDER BY periodo DESC
        `;
        const rows = await pool.query(query, [id]);
        return rows;
    }
};

export default Estagio;
