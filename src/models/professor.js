// src/models/professor.js
import pool from '../database/db.js';

const Professor = {
    async create(nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes) {
        const result = await pool.query(
            'INSERT INTO professores (nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes]
        );
        return { id: Number(result.insertId), nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes };
    },

    async findAll(search = null) {
        let query = 'SELECT id, nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes FROM professores';
        let params = [];

        if (search) {
            query += ' WHERE nome LIKE ?';
            const searchTerm = `%${search}%`;
            params = [searchTerm];
        }

        query += ' ORDER BY nome ASC';

        const rows = await pool.query(query, params);
        return rows;
    },

    async findById(id) {
        const rows = await pool.query(
            'SELECT id, nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes FROM professores WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Find professor by siape. There is only one professor per siape
    async findBySiape(siape) {
        const rows = await pool.query(
            'SELECT id, nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes FROM professores WHERE siape = ?',
            [siape]
        );
        return rows[0];
    },

    async update(id, nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes) {
        const result = await pool.query(
            'UPDATE professores SET nome = ?, cpf = ?, siape = ?, cress = ?, regiao = ?, telefone = ?, celular = ?, email = ?, curriculolattes = ?, atualizacaolattes = ?, dataingresso = ?, departamento = ?, dataegresso = ?, motivoegresso = ?, observacoes = ? WHERE id = ?',
            [nome, cpf, siape, cress, regiao, telefone, celular, email, curriculolattes, atualizacaolattes, dataingresso, departamento, dataegresso, motivoegresso, observacoes, id]
        );
        return result.affectedRows > 0;
    },

    async delete(id) {
        const result = await pool.query('DELETE FROM professores WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    async findEstagiariosByProfessorId(professorId) {
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
            LEFT JOIN instituicoes i ON e.instituicao_id = i.id 
            LEFT JOIN professores p ON e.professor_id = p.id 
            WHERE e.professor_id = ?
            ORDER BY e.periodo DESC, e.nivel DESC, a.nome ASC`,
            [professorId]
        );
        return rows;
    }
};

export default Professor;
