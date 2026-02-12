// src/models/aluno.js
import pool from '../database/db.js';

const Aluno = {
    // Verifiy if aluno.registro is already in use
    async verifyRegistro(registro) {
        const rows = await pool.query('SELECT * FROM alunos WHERE registro = ?', [registro]);
        return rows[0];
    },
    async create(nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes) {
        if (await this.verifyRegistro(registro)) {
            console.log('Registro já em uso');
            throw new Error('Registro já em uso');
        }
        const result = await pool.query(
            'INSERT INTO alunos (nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes]
        );
        return { id: Number(result.insertId), nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes };
    },

    // Find aluno by registro. There is only one aluno per registro
    async findByRegistro(registro) {
        const rows = await pool.query('SELECT * FROM alunos WHERE registro = ?', [registro]);
        return rows[0];
    },

    async findAll(req) {
        let query = 'SELECT id, nome, nomesocial, registro, email, ingresso, telefone, celular, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes FROM alunos';
        let params = [];
        if (req && req.query && req.query.search) {
            query += " WHERE nome LIKE ? OR nomesocial LIKE ? OR registro LIKE ? OR email LIKE ?";
            const searchTerm = `%${req.query.search}%`;
            params = [searchTerm, searchTerm, searchTerm, searchTerm];
        }

        query += ' ORDER BY nome ASC';

        const rows = await pool.query(query, params);
        return rows;
    },

    // Select one aluno by id independent of estagiarios
    async findAlunoById(id) {
        const query = `SELECT * FROM alunos 
                       WHERE id = ?
                       ORDER BY nome ASC`;
        const rows = await pool.query(query, [id]);
        return rows[0] || null;
    },

    // Get all estagiarios for aluno_id from estagiarios table
    async findEstagiariosByAlunoId(id) {
        const rows = await pool.query(
            `SELECT 
                e.id as id, 
                e.aluno_id as aluno_id, 
                e.ajuste2020 as ajuste2020,
                e.nivel as nivel, 
                e.periodo as periodo, 
                e.turno as turno,
                e.turmaestagio_id as turmaestagio_id,
                e.instituicao_id as instituicao_id,
                e.professor_id as professor_id,
                e.supervisor_id as supervisor_id,
                d.nome as professor_nome, 
                s.nome as supervisor_nome, 
                i.instituicao as instituicao_nome
            FROM estagiarios as e 
            JOIN alunos as a ON e.aluno_id = a.id 
            LEFT JOIN docentes as d ON e.professor_id = d.id
            LEFT JOIN supervisores as s ON e.supervisor_id = s.id
            LEFT JOIN estagio as i ON e.instituicao_id = i.id
            WHERE e.aluno_id = ?
            ORDER BY e.periodo ASC`,
            [id]
        );
        return rows;
    },

    // Get all inscricoes for aluno_id from inscricoes table
    async findInscricoesByAlunoId(id) {
        const rows = await pool.query(
            `SELECT 
                i.id as id, 
                i.aluno_id as aluno_id, 
                i.muralestagio_id as muralestagio_id, 
                i.data as data_inscricao, 
                i.periodo as periodo, 
                m.instituicao as mural_instituicao
            FROM inscricoes as i 
            JOIN mural_estagio as m ON i.muralestagio_id = m.id 
            LEFT JOIN alunos as a ON i.aluno_id = a.id 
            WHERE i.aluno_id = ?
            ORDER by periodo`,
            [id]
        );
        return rows;
    },

    async update(id, nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes) {
        const result = await pool.query(
            'UPDATE alunos SET nome = ?, nomesocial = ?, ingresso = ?, turno = ?, registro = ?, telefone = ?, celular = ?, email = ?, cpf = ?, identidade = ?, orgao = ?, nascimento = ?, cep = ?, endereco = ?, municipio = ?, bairro = ?, observacoes = ? WHERE id = ?',
            [nome, nomesocial, ingresso, turno, registro, telefone, celular, email, cpf, identidade, orgao, nascimento, cep, endereco, municipio, bairro, observacoes, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        // if aluno has estagiarios: not possible to delete
        const estagiarios = await pool.query('SELECT * FROM estagiarios WHERE aluno_id = ?', [id]);
        if (estagiarios.length > 0) { // Fix: removed [0] invalid access locally if pool returns array directly
            console.log('Aluno possui estagiários: não é possível excluir');
            throw new Error('Aluno possui estagiários: não é possível excluir');
        }

        // if aluno has inscricoes: not possible to delete
        const inscricoes = await pool.query('SELECT * FROM inscricoes WHERE aluno_id = ?', [id]);
        if (inscricoes.length > 0) {
            console.log('Aluno possui inscrições: não é possível excluir');
            throw new Error('Aluno possui inscrições: não é possível excluir');
        }

        // delete aluno
        const result = await pool.query('DELETE FROM alunos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

export default Aluno;