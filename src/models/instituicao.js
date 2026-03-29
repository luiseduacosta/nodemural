// src/models/instituicao.js
import pool from '../database/db.js';

const Instituicao = {
    async findAll() {
        const rows = await pool.query(
            'SELECT i.*, a.area as area_nome FROM instituicoes i LEFT JOIN area_instituicoes a ON i.area_id = a.id ORDER BY i.instituicao ASC'
        );
        return rows;
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT i.*, a.area as area_nome FROM instituicoes i LEFT JOIN area_instituicoes a ON i.area_id = a.id WHERE i.id = ?',
            [id]
        );
        return rows[0];
    },

    async create(instituicao, cnpj, natureza, email, beneficios, area_id, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, observacoes) {
        const result = await pool.query(
            'INSERT INTO instituicoes (instituicao, cnpj, natureza, email, area_id, beneficios, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [instituicao, cnpj, natureza, email, area_id, beneficios, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, observacoes]
        );
        return { id: Number(result.insertId), instituicao, cnpj, natureza, email, area_id, beneficios, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, observacoes };
    },
    async update(id, instituicao, cnpj, natureza, email, beneficios, area_id, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, observacoes) {
        const result = await pool.query(
            'UPDATE instituicoes SET instituicao = ?, cnpj = ?, natureza = ?, email = ?, area_id = ?, beneficios = ?, url = ?, endereco = ?, bairro = ?, municipio = ?, cep = ?, telefone = ?, fim_de_semana = ?, convenio = ?, expira = ?, seguro = ?, observacoes = ? WHERE id = ?',
            [instituicao, cnpj, natureza, email, area_id, beneficios, url, endereco, bairro, municipio, cep, telefone, fim_de_semana, convenio, expira, seguro, observacoes, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM instituicoes WHERE id = ?',
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
            FROM mural_estagios
            WHERE instituicao_id = ?
            ORDER BY periodo DESC
        `;
        const rows = await pool.query(query, [id]);
        return rows;
    }
};

export default Instituicao;
