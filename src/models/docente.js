// src/models/docente.js
import pool from '../database/db.js';

const Docente = {
    async create(nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes) {
        const result = await pool.query(
            'INSERT INTO docentes (nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes]
        );
        return { id: Number(result.insertId), nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes };
    },

    async findAll(search = null) {
        let query = 'SELECT id, nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes FROM docentes';
        let params = [];

        if (search) {
            query += ' WHERE nome LIKE ?';
            const searchTerm = `%${search}%`;
            params = [searchTerm, searchTerm, searchTerm, searchTerm];
        }

        query += ' ORDER BY nome ASC';

        const rows = await pool.query(query, params);
        return rows;
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT id, nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes FROM docentes WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Find docente by siape. There is only one docente per siape
    async findBySiape(siape) {
        const rows = await pool.query(
            'SELECT id, nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes FROM docentes WHERE siape = ?',
            [siape]
        );
        return rows[0];
    },

    async update(id, nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes) {
        const result = await pool.query(
            'UPDATE docentes SET nome = ?, cpf = ?, siape = ?, datanascimento = ?, localnascimento = ?, sexo = ?, telefone = ?, celular = ?, email = ?, curriculolattes = ?, atualizacaolattes = ?, formacaoprofissional = ?, universidadedegraduacao = ?, anoformacao = ?, dataingresso = ?, departamento = ?, dataegresso = ?, motivoegresso = ?, observacoes = ? WHERE id = ?',
            [nome, cpf, siape, datanascimento, localnascimento, sexo, telefone, celular, email, curriculolattes, atualizacaolattes, formacaoprofissional, universidadedegraduacao, anoformacao, dataingresso, departamento, dataegresso, motivoegresso, observacoes, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query('DELETE FROM docentes WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async findEstagiariosByDocenteId(docenteId) {
        const rows = await pool.query(
            `SELECT 
                e.id as estagiario_id,
                a.id as aluno_id,
                a.registro as aluno_registro,
                a.nome as aluno_nome,
                s.nome as estagiario_supervisor_nome,
                e.nivel as estagiario_nivel,
                e.periodo as estagiario_periodo, 
                i.instituicao as estagiario_instituicao,
                e.nota as estagiario_nota,
                e.ch as estagiario_carga_horaria
            FROM estagiarios e 
            JOIN alunos a ON e.aluno_id = a.id 
            LEFT JOIN supervisores s ON e.supervisor_id = s.id 
            LEFT JOIN estagio i ON e.instituicao_id = i.id 
            LEFT JOIN docentes d ON e.professor_id = d.id 
            WHERE e.professor_id = ?
            ORDER BY e.periodo DESC, e.nivel DESC, a.nome ASC`,
            [docenteId]
        );
        return rows;
    }
};

export default Docente;
