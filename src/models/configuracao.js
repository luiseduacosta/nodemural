// src/models/configuracao.js
import pool from '../database/db.js';

const Configuracao = {
    async findAll(req) {
        let query = `SELECT * FROM configuracoes limit 1`;
        const rows = await pool.query(query);
        return rows;
    },

    async findById(id) {
        const query = "SELECT * FROM configuracoes limit 1 WHERE id = ?";
        const rows = await pool.query(query, [id]);
        return rows[0];
    },

    async update(mural_periodo_atual, curso_turma_atual, curso_abertura_inscricoes, curso_encerramento_inscricoes, termo_compromisso_periodo, termo_compromisso_inicio, termo_compromisso_final, periodo_calendario_academico, id) {
        const result = await pool.query(
            "UPDATE configuracoes SET mural_periodo_atual = ?, curso_turma_atual = ?, curso_abertura_inscricoes = ?, curso_encerramento_inscricoes = ?, termo_compromisso_periodo = ?, termo_compromisso_inicio = ?, termo_compromisso_final = ?, periodo_calendario_academico = ? WHERE id = ?",
            [mural_periodo_atual, curso_turma_atual, curso_abertura_inscricoes, curso_encerramento_inscricoes, termo_compromisso_periodo, termo_compromisso_inicio, termo_compromisso_final, periodo_calendario_academico, id]
        );
        return result.affectedRows > 0;
    },
};

export default Configuracao;