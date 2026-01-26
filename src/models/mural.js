// src/models/mural.js
import pool from '../database/db.js';

const Mural = {
    async findAll(periodo = null) {
        let query = 'SELECT * FROM mural_estagio';
        let params = [];

        if (periodo) {
            query += ' WHERE periodo = ?';
            params.push(periodo);
        }

        query += ' ORDER BY periodo DESC, dataInscricao ASC';

        const rows = await pool.query(query, params);
        return rows;
    },

    async findDistinctPeriods() {
        const rows = await pool.query(
            'SELECT DISTINCT periodo FROM mural_estagio ORDER BY periodo DESC'
        );
        return rows;
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT * FROM mural_estagio WHERE id = ?',
            [id]
        );
        return rows[0];
    },
    // Nested inscricoes route
    async findInscricoesByMuralId(id) {
        const rows = await pool.query(
            'SELECT i.id as inscricao_id, i.registro as registro, a.nome as aluno_nome, i.data as data_inscricao FROM inscricoes as i JOIN alunos as a ON i.aluno_id = a.id WHERE i.muralestagio_id = ?',
            [id]
        );
        return rows;
    },
    async create(instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, outras, periodo, datafax, localInscricao, email) {
        const result = await pool.query(
            `INSERT INTO mural_estagio (instituicao_id, instituicao, convenio, vagas, beneficios,
             final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id,
             dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato,
             outras, periodo, datafax, localInscricao, email)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, outras, periodo, datafax, localInscricao, email]
        );
        return { id: Number(result.insertId), instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, outras, periodo, datafax, localInscricao, email };
    },

    async update(id, instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, outras, periodo, datafax, localInscricao, email) {
        const result = await pool.query(
            `UPDATE mural_estagio SET instituicao_id = ?, instituicao = ?, convenio = ?, vagas = ?,
             beneficios = ?, final_de_semana = ?, cargaHoraria = ?, requisitos = ?, turmaestagio_id = ?,
             horario = ?, professor_id = ?, dataSelecao = ?, dataInscricao = ?, horarioSelecao = ?,
             localSelecao = ?, formaSelecao = ?, contato = ?, outras = ?, periodo = ?, datafax = ?,
             localInscricao = ?, email = ? WHERE id = ?`,
            [instituicao_id, instituicao, convenio, vagas, beneficios, final_de_semana, cargaHoraria, requisitos, turmaestagio_id, horario, professor_id, dataSelecao, dataInscricao, horarioSelecao, localSelecao, formaSelecao, contato, outras, periodo, datafax, localInscricao, email, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query(
            'DELETE FROM mural_estagio WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

export default Mural;
