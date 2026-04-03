// src/models/estagiario.js
import pool from '../database/db.js';

const Estagiario = {
    async findDistinctPeriodsEstagiario() {
        const rows = await pool.query(
            'SELECT DISTINCT periodo FROM estagiarios ORDER BY periodo DESC'
        );
        return rows;
    },

    async findAllEstagiario(periodo = null, aluno_id = null) {  
        let query = `SELECT e.id as id, 
                    a.id as aluno_id, 
                    a.nome as aluno_nome, 
                    a.registro as aluno_registro, 
                    t.turno AS aluno_turno, 
                    e.ajuste2020 as estagiario_ajuste2020,
                    e.benealimentacao as estagiario_benealimentacao,
                    e.benetransporte as estagiario_benetransporte,
                    e.benebolsa as estagiario_benebolsa,
                    e.nivel as nivel,
                    e.periodo as periodo,
                    e.tc as estagiario_tc, 
                    e.tc_solicitacao as estagiario_tc_solicitacao, 
                    i.id as instituicao_id, 
                    i.instituicao as instituicao_nome, 
                    s.id as supervisor_id, 
                    s.nome as supervisor_nome,
                    s.cress as supervisor_cress, 
                    s.regiao as supervisor_regiao, 
                    p.nome as professor_nome, 
                    p.id as professor_id, 
                    e.nota as estagiario_nota, 
                    e.ch as estagiario_cargahoraria, 
                    c.periodo_especial as complemento_nome
                    FROM estagiarios e
                    LEFT JOIN alunos a ON e.aluno_id = a.id
                    LEFT JOIN turnos t ON a.turno_id = t.id
                    LEFT JOIN professores p ON e.professor_id = p.id
                    LEFT JOIN supervisores s ON e.supervisor_id = s.id
                    LEFT JOIN instituicoes i ON e.instituicao_id = i.id
                    LEFT JOIN complementos c ON e.complemento_id = c.id`;

        const params = [];
        const conditions = [];

        if (periodo) {
            conditions.push('e.periodo = ?');
            params.push(periodo);
        }

        if (aluno_id) {
            conditions.push('e.aluno_id = ?');
            params.push(aluno_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY e.periodo DESC, a.nome ASC';
        const rows = await pool.query(query, params);
        return rows;
    },

    async findByIdEstagiario(id) {
        const query = `SELECT e.*,
                      a.nome as aluno_nome, 
                      a.registro as aluno_registro, 
                      t.turno AS aluno_turno,
                      p.nome as professor_nome,
                      i.instituicao as instituicao_nome,
                      s.nome as supervisor_nome,
                      s.cress as supervisor_cress, 
                      s.regiao as supervisor_regiao,
                      c.periodo_especial as complemento_nome
                      FROM estagiarios e
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      LEFT JOIN turnos t ON a.turno_id = t.id
                      LEFT JOIN professores p ON e.professor_id = p.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      LEFT JOIN instituicoes i ON e.instituicao_id = i.id
                      LEFT JOIN complementos c ON e.complemento_id = c.id`;
        const rows = await pool.query(query + ' WHERE e.id = ?', [id]);
        if (rows.length === 0) return null;
        return rows[0];
    },

    async createEstagiario(aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes, tc = null, tc_solicitacao = null, complemento_id = null, benetransporte = null, benealimentacao = null, benebolsa = null) {
        const result = await pool.query(
            `INSERT INTO estagiarios (aluno_id, registro, professor_id, supervisor_id, instituicao_id,
             periodo, nivel, ajuste2020, tc, tc_solicitacao, complemento_id, benetransporte, benealimentacao, benebolsa, observacoes)
             VALUES (?, (SELECT registro FROM alunos WHERE id = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [aluno_id, aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, tc, tc_solicitacao, complemento_id, benetransporte, benealimentacao, benebolsa, observacoes]
        );
        return { id: Number(result.insertId), aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, tc, tc_solicitacao, complemento_id, benetransporte, benealimentacao, benebolsa, observacoes };
    },

    async updateEstagiario(id, aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, observacoes, tc = null, tc_solicitacao = null, complemento_id = null, benetransporte = null, benealimentacao = null, benebolsa = null) {
        const result = await pool.query(
            `UPDATE estagiarios SET aluno_id = ?, registro = (SELECT registro FROM alunos WHERE id = ?), professor_id = ?, supervisor_id = ?,
             instituicao_id = ?, periodo = ?, nivel = ?, ajuste2020 = ?, tc = ?, tc_solicitacao = ?, complemento_id = ?,
             benetransporte = ?, benealimentacao = ?, benebolsa = ?, observacoes = ? WHERE id = ?`,
            [aluno_id, aluno_id, professor_id, supervisor_id, instituicao_id, periodo, nivel, ajuste2020, tc, tc_solicitacao, complemento_id, benetransporte, benealimentacao, benebolsa, observacoes, id] 
        );
        return result.affectedRows > 0;
    },

    async updatePartialEstagiario(id, fields) {
        const allowedFields = ['nota', 'ch'];
        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(fields)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            return false;
        }

        values.push(id);
        const result = await pool.query(
            `UPDATE estagiarios SET ${updates.join(', ')} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async deleteEstagiario(id) {
        const result = await pool.query('DELETE FROM estagiarios WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async findByAlunoIdEstagiario(aluno_id) {
        const query = `SELECT e.*,
                      e.ajuste2020 as estagiario_ajuste2020,
                      e.benealimentacao as estagiario_benealimentacao,
                      e.benetransporte as estagiario_benetransporte,
                      e.benebolsa as estagiario_benebolsa,
                      a.nome as aluno_nome, 
                      a.registro as aluno_registro, 
                      t.turno AS aluno_turno,
                      p.nome as professor_nome,
                      i.instituicao as instituicao_nome,
                      s.nome as supervisor_nome,
                      c.periodo_especial as complemento_nome
                      FROM estagiarios e
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      LEFT JOIN turnos t ON a.turno_id = t.id
                      LEFT JOIN instituicoes i ON e.instituicao_id = i.id
                      LEFT JOIN professores p ON e.professor_id = p.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      LEFT JOIN complementos c ON e.complemento_id = c.id
                      WHERE e.aluno_id = ?
                      ORDER BY e.periodo DESC, e.nivel ASC`;
        const rows = await pool.query(query, [aluno_id]);
        return rows;
    },

    async findBySupervisorIdEstagiario(supervisor_id) {
        const query = `SELECT e.id as estagiario_id,
                      a.id as aluno_id,
                      a.registro as aluno_registro,
                      a.nome as aluno_nome,
                      e.nivel as estagiario_nivel,
                      e.periodo as estagiario_periodo
                      FROM estagiarios e
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      WHERE e.supervisor_id = ?
                      ORDER BY e.periodo DESC, a.nome ASC`;
        const rows = await pool.query(query, [supervisor_id]);
        return rows;
    },

    async findByProfessorIdEstagiario(professor_id) {
        const query = `SELECT e.id as estagiario_id,
                      a.id as aluno_id,
                      a.registro as aluno_registro,
                      a.nome as aluno_nome,
                      e.supervisor_id as estagiario_supervisor_id,
                      s.id as supervisor_id,
                      s.nome as supervisor_nome,
                      i.id as instituicao_id,
                      i.instituicao as instituicao_nome,
                      e.professor_id as estagiario_professor_id,
                      p.nome as professor_nome,
                      p.id as professor_id,
                      e.nivel as estagiario_nivel,
                      e.periodo as estagiario_periodo
                      FROM estagiarios e
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      LEFT JOIN instituicoes i ON e.instituicao_id = i.id
                      WHERE e.professor_id = ?
                      ORDER BY e.periodo DESC, a.nome ASC`;
        const rows = await pool.query(query, [professor_id]);
        return rows;
    },

    async findAtividadesByEstagiarioIdEstagiario(estagiario_id) {
        const query = `SELECT a.*,
                          e.ajuste2020 as estagiario_ajuste2020,
                          e.nivel as estagiario_nivel,
                          e.periodo as estagiario_periodo
                          FROM folhadeatividades a
                          LEFT JOIN estagiarios e ON a.estagiario_id = e.id
                          LEFT JOIN alunos b ON e.aluno_id = b.id
                          WHERE a.estagiario_id = ?
                          ORDER BY a.dia DESC, a.inicio ASC`;
        const rows = await pool.query(query, [estagiario_id]);
        return rows;
    },

    async getNextNivelEstagiario(aluno_id) {
        const estagiarioRows = await pool.query(
            'SELECT ajuste2020, nivel, instituicao_id, professor_id, supervisor_id, periodo FROM estagiarios WHERE aluno_id = ? ORDER BY nivel DESC LIMIT 1',
            [aluno_id]
        );

        if (estagiarioRows.length === 0) {
            return {
                next_nivel: 1,
                ajuste2020: 1,
                supervisor_id: null,
                professor_id: null,
                instituicao_id: null,
                periodo: null,
            };
        } else {
            const ajuste2020 = estagiarioRows[0].ajuste2020;
            const nivel = estagiarioRows[0].nivel;
            const instituicao_id = estagiarioRows[0].instituicao_id;
            const professor_id = estagiarioRows[0].professor_id;
            const supervisor_id = estagiarioRows[0].supervisor_id;
            const periodo = estagiarioRows[0].periodo;

            const nivelRows = await pool.query(
                'SELECT MAX(nivel) as max_nivel FROM estagiarios WHERE aluno_id = ? AND nivel < 9',
                [aluno_id]
            );
            const maxNivel = Number(nivelRows[0]?.max_nivel);

            let nextNivel = 1;
            const baseNivel = !Number.isNaN(maxNivel) && maxNivel > 0 ? maxNivel : Number(nivel);
            if (!Number.isNaN(baseNivel)) {
                const maxAllowed = ajuste2020 == 0 ? 4 : 3;

                if (baseNivel < maxAllowed) {
                    nextNivel = baseNivel + 1;
                } else {
                    nextNivel = 9;
                }
            }

            return {
                next_nivel: nextNivel,
                ajuste2020: ajuste2020,
                instituicao_id: instituicao_id,
                professor_id: professor_id,
                supervisor_id: supervisor_id,
                periodo: periodo,
            };
        }
    }
};

export default Estagiario;
