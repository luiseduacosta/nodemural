// src/models/mural.js
import pool from '../database/db.js';

const Mural = {
    async findAll(periodo = null) {
        let query = 'SELECT * FROM mural_estagios';
        let params = [];

        if (periodo) {
            query += ' WHERE periodo = ?';
            params.push(periodo);
        }

        query += ' ORDER BY periodo DESC, data_inscricao ASC';

        const rows = await pool.query(query, params);
        return rows;
    },

    async findDistinctPeriods() {
        const rows = await pool.query(
            'SELECT DISTINCT periodo FROM mural_estagios ORDER BY periodo DESC'
        );
        return rows;
    },

    async findByInstituicao(instituicao_id, periodo = null) {
        let query = 'SELECT * FROM mural_estagios WHERE instituicao_id = ?';
        const params = [instituicao_id];

        if (periodo) {
            query += ' AND periodo = ?';
            params.push(periodo);
        }

        query += ' ORDER BY periodo DESC, data_inscricao ASC';

        const rows = await pool.query(query, params);
        return rows;
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT * FROM mural_estagios WHERE id = ?',
            [id]
        );
        return rows[0];
    },
    // Nested inscricoes route
    async findInscricoesByMuralId(id) {
        const rows = await pool.query(
            'SELECT i.id as inscricao_id, a.registro as registro, a.nome as aluno_nome, i.data as data_inscricao FROM inscricoes as i JOIN alunos as a ON i.aluno_id = a.id WHERE i.muralestagio_id = ?',
            [id]
        );
        return rows;
    },
    async create(instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, carga_horaria, requisitos, horario, professor_id, data_selecao, data_inscricao, horario_selecao, local_selecao, forma_selecao, contato, outras, periodo, datafax, local_inscricao, email) {
        const result = await pool.query(
            `INSERT INTO mural_estagios (instituicao_id, instituicao, convenio, vagas, beneficios,
             final_de_semana, carga_horaria, requisitos, horario, data_selecao, data_inscricao,
             horario_selecao, local_selecao, forma_selecao, contato, outras, periodo, local_inscricao, email)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, carga_horaria, requisitos, horario, data_selecao, data_inscricao, horario_selecao, local_selecao, forma_selecao, contato, outras, periodo, local_inscricao, email]
        );
        return { id: Number(result.insertId), instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, carga_horaria, requisitos, horario, data_selecao, data_inscricao, horario_selecao, local_selecao, forma_selecao, contato, outras, periodo, local_inscricao, email };
    },

    async update(id, instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, carga_horaria, requisitos, horario, data_selecao, data_inscricao, horario_selecao, local_selecao, forma_selecao, contato, outras, periodo, local_inscricao, email) {
        const result = await pool.query(
            `UPDATE mural_estagios SET instituicao_id = ?, instituicao = ?, convenio = ?, vagas = ?,
             beneficios = ?, final_de_semana = ?, carga_horaria = ?, requisitos = ?,
             horario = ?, data_selecao = ?, data_inscricao = ?, horario_selecao = ?,
             local_selecao = ?, forma_selecao = ?, contato = ?, outras = ?, periodo = ?,
             local_inscricao = ?, email = ? WHERE id = ?`,
            [instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, carga_horaria, requisitos, horario, data_selecao, data_inscricao, horario_selecao, local_selecao, forma_selecao, contato, outras, periodo, local_inscricao, email, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM mural_estagios WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default Mural;
