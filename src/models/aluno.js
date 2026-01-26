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

    async findById(id) {
        // Fix: Removed trailing comma before FROM and fixed join logic
        let query = `
            SELECT alunos.*, 
                   estagiarios.id as estagiario_id, 
                   estagiarios.nivel as estagiario_nivel, 
                   estagiarios.periodo as estagiario_periodo, 
                   estagiarios.professor_id as estagiario_professorID, 
                   estagiarios.supervisor_id as estagiario_superivisorID, 
                   estagiarios.instituicao_id as estagiario_instituicaoID
            FROM alunos 
            LEFT JOIN estagiarios ON estagiarios.aluno_id = alunos.id
            WHERE alunos.id = ?
            ORDER BY alunos.nome ASC
        `;

        const rows = await pool.query(query, [id]);
        return rows[0];
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
            JOIN alunos as a ON i.aluno_id = a.id 
            WHERE i.aluno_id = ?`,
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
            // Note: assuming mariadb connector returns array of rows. 
            // If estagiarios is empty, .length is 0. 
            // If the pool response structure is different, this might need adjustment, 
            // but previously it was estagiarios[0].length which implies estagiarios is [rows, meta].
            // Standard mariadb pool.query returns rows array (if not using specific options).
            // However, keeping consistent with simple check:
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