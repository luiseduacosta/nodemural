// src/models/estagiario.js
import pool from '../database/db.js';

const Estagiario = {
    async findDistinctPeriods() {
        const rows = await pool.query(
            'SELECT DISTINCT periodo FROM estagiarios ORDER BY periodo DESC'
        );
        return rows;
    },

    async findAll(periodo = null) {
        let query = `SELECT e.id as id, e.periodo as periodo, e.nivel as nivel,
                    a.nome as aluno_nome, a.registro as aluno_registro, a.turno as aluno_turno,
                    d.nome as professor_nome,
                    s.nome as supervisor_nome,
                    i.instituicao as instituicao_nome,
                    t.area as turma_nome
                    FROM estagiarios e
                    LEFT JOIN alunos a ON e.aluno_id = a.id
                    LEFT JOIN docentes d ON e.professor_id = d.id
                    LEFT JOIN supervisores s ON e.supervisor_id = s.id
                    LEFT JOIN estagio i ON e.instituicao_id = i.id
                    LEFT JOIN turma_estagios t ON e.turmaestagio_id = t.id`;

        let params = [];
        if (periodo) {
            query += ' WHERE e.periodo = ?';
            params.push(periodo);
        }

        query += ' ORDER BY e.periodo DESC, a.nome ASC';
        const rows = await pool.query(query, params);
        return rows;
    },

    async findById(id) {
        const query = `SELECT e.*,
                      e.ajuste2020 as estagiario_ajuste2020,
                      a.nome as aluno_nome, a.registro as aluno_registro, a.turno as aluno_turno,
                      d.nome as professor_nome,
                      s.nome as supervisor_nome,
                      i.instituicao as instituicao_nome,
                      t.area as turma_nome
                      FROM estagiarios e
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      LEFT JOIN docentes d ON e.professor_id = d.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      LEFT JOIN estagio i ON e.instituicao_id = i.id
                      LEFT JOIN turma_estagios t ON e.turmaestagio_id = t.id
                      WHERE e.id = ?`;
        const rows = await pool.query(query, [id]);
        return rows[0];
    },

    async create(aluno_id, professor_id, supervisor_id, instituicao_id, turmaestagio_id, periodo, turno, nivel, ajuste2020, observacoes) {
        const result = await pool.query(
            `INSERT INTO estagiarios (aluno_id, professor_id, supervisor_id, instituicao_id,
             turmaestagio_id, periodo, turno, nivel, ajuste2020, observacoes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [aluno_id, professor_id, supervisor_id, instituicao_id, turmaestagio_id, periodo, turno, nivel, ajuste2020, observacoes]
        );
        return { id: Number(result.insertId), aluno_id, professor_id, supervisor_id, instituicao_id, turmaestagio_id, periodo, turno, nivel, ajuste2020, observacoes };
    },

    async update(id, aluno_id, professor_id, supervisor_id, instituicao_id, turmaestagio_id, periodo, turno, nivel, ajuste2020, observacoes) {
        const result = await pool.query(
            `UPDATE estagiarios SET aluno_id = ?, professor_id = ?, supervisor_id = ?,
             instituicao_id = ?, turmaestagio_id = ?, periodo = ?, turno = ?, nivel = ?, ajuste2020 = ?,
             observacoes = ? WHERE id = ?`,
            [aluno_id, professor_id, supervisor_id, instituicao_id, turmaestagio_id, periodo, turno, nivel, ajuste2020, observacoes, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query('DELETE FROM estagiarios WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async findByAlunoId(aluno_id) {
        const query = `SELECT e.*,
                      i.instituicao as instituicao_nome,
                      d.nome as professor_nome,
                      s.nome as supervisor_nome
                      FROM estagiarios e
                      LEFT JOIN estagio i ON e.instituicao_id = i.id
                      LEFT JOIN docentes d ON e.professor_id = d.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      WHERE e.aluno_id = ?
                      ORDER BY e.periodo DESC, e.nivel ASC`;
        const rows = await pool.query(query, [aluno_id]);
        return rows;
    },

    async findBySupervisorId(supervisor_id) {
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

    async findByProfessorId(professor_id) {
        const query = `SELECT e.id as estagiario_id,
                      a.id as aluno_id,
                      a.registro as aluno_registro,
                      a.nome as aluno_nome,
                      e.supervisor_id as estagiario_supervisor_id,
                      s.nome as estagiario_supervisor_nome,
                      e.professor_id as estagiario_professor_id,
                      e.nivel as estagiario_nivel,
                      e.periodo as estagiario_periodo
                      FROM estagiarios e
                      LEFT JOIN alunos a ON e.aluno_id = a.id
                      LEFT JOIN supervisores s ON e.supervisor_id = s.id
                      WHERE e.professor_id = ?
                      ORDER BY e.periodo DESC, a.nome ASC`;
        const rows = await pool.query(query, [professor_id]);
        return rows;
    },

    async findAtividadesByEstagiarioId(estagiario_id) {
        const query = `SELECT a.*,
                          e.ajuste2020 as estagiario_ajuste2020,
                          e.nivel as estagiario_nivel,
                          e.periodo as estagiario_periodo
                          FROM folhadeatividades a
                          LEFT JOIN estagiarios e ON a.estagiario_id = e.id
                          WHERE a.estagiario_id = ?
                          ORDER BY a.dia DESC, a.inicio ASC`;
        const rows = await pool.query(query, [estagiario_id]);
        return rows;
    },

    async getNextNivel(aluno_id) {
        const estagiarioRows = await pool.query(
            'SELECT ajuste2020, nivel, instituicao_id, professor_id, supervisor_id, turmaestagio_id, periodo FROM estagiarios WHERE aluno_id = ? ORDER BY nivel DESC LIMIT 1',
            [aluno_id]
        );

        if (estagiarioRows.length === 0) {
            return {
                next_nivel: 1,
                ajuste2020: 1,
                professor_id: null,
                supervisor_id: null,
                instituicao_id: null,
                turmaestagio_id: null,
                periodo: null,
            };
        } else {
            const ajuste2020 = estagiarioRows[0].ajuste2020;
            const nivel = estagiarioRows[0].nivel;
            const instituicao_id = estagiarioRows[0].instituicao_id;
            const professor_id = estagiarioRows[0].professor_id;
            const supervisor_id = estagiarioRows[0].supervisor_id;
            const turmaestagio_id = estagiarioRows[0].turmaestagio_id;
            const periodo = estagiarioRows[0].periodo;

            const nivelRows = await pool.query(
                'SELECT MAX(nivel) as max_nivel FROM estagiarios WHERE aluno_id = ? AND nivel < 9',
                [aluno_id]
            );
            const maxNivel = nivelRows[0].max_nivel;

            let nextNivel = 1;
            if (nivel !== null) {
                const maxNivelNum = Number(nivel);
                const maxAllowed = ajuste2020 == 0 ? 4 : 3;

                if (maxNivelNum < maxAllowed) {
                    nextNivel = maxNivelNum + 1;
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
                turmaestagio_id: turmaestagio_id,
                periodo: periodo,
            };
        }
    }
};

export default Estagiario;
