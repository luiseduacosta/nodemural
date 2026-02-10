// src/models/user.js
import pool from '../database/db.js';
import bcrypt from 'bcryptjs';

const User = {
    // Create a new user with hashed password
    async create(email, password, nome, identificacao, role = 'aluno', entidade_id = null) {
        try {
            // Check if user already exists
            const existing = await this.findByEmail(email);
            if (existing) {
                throw new Error('Email já registrado');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query(
                'INSERT INTO auth_users (email, password, nome, identificacao, role, entidade_id) VALUES (?, ?, ?, ?, ?, ?)',
                [email, hashedPassword, nome, identificacao, role, entidade_id]
            );

            return {
                id: Number(result.insertId),
                email,
                nome,
                identificacao,
                role,
                entidade_id
            };
        } catch (error) {
            throw error;
        }
    },

    // Find user by email
    async findByEmail(email) {
        try {
            const rows = await pool.query(
                'SELECT * FROM auth_users WHERE email = ? AND ativo = TRUE',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    // Find user by ID
    async findById(id) {
        try {
            const rows = await pool.query(
                'SELECT id, email, nome, identificacao, role, entidade_id, ativo, criado_em FROM auth_users WHERE id = ? AND ativo = TRUE',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    // Find user by ID and also fetch the related entity record (aluno/docente/supervisor) based on role
    // Returns { user, entidade } where entidade is null if not found or not applicable
    async findByIdWithEntidade(id) {
        try {
            const user = await this.findById(id);
            if (!user) return null;

            let entidade = null;

            if (user.entidade_id && user.role === 'aluno') {
                const rows = await pool.query('SELECT * FROM alunos WHERE id = ?', [user.entidade_id]);
                entidade = rows[0] || null;
            } else if (user.entidade_id && user.role === 'docente') {
                const rows = await pool.query('SELECT * FROM docentes WHERE id = ?', [user.entidade_id]);
                entidade = rows[0] || null;
            } else if (user.entidade_id && user.role === 'supervisor') {
                const rows = await pool.query('SELECT * FROM supervisores WHERE id = ?', [user.entidade_id]);
                entidade = rows[0] || null;
            }

            return { user, entidade };
        } catch (error) {
            throw error;
        }
    },

    // First find role and entidade_id in 'auth_users' table with the id, if it exists then with the value of role find into either table 'alunos', 'docentes' or 'supervisores' with the value of entidade_id
    async findByEntidadeId(entidade_id) {
        try {
            const rows = await pool.query(
                'SELECT * FROM auth_users WHERE role IN ("aluno", "docente", "supervisor") AND entidade_id = ? AND ativo = TRUE',
                [entidade_id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    },

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    // Get all users (admin only)
    async findAll() {
        try {
            const rows = await pool.query(
                'SELECT id, email, nome, identificacao, role, entidade_id, ativo, criado_em FROM auth_users WHERE ativo = TRUE ORDER BY nome ASC'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Deactivate user (soft delete)
    async deactivate(id) {
        try {
            const result = await pool.query(
                'UPDATE auth_users SET ativo = FALSE WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Update user role
    async updateRole(id, role) {
        try {
            const result = await pool.query(
                'UPDATE auth_users SET role = ? WHERE id = ?',
                [role, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Update user
    async update(id, userData) {
        try {
            const fields = [];
            const values = [];

            if (userData.nome !== undefined) {
                fields.push('nome = ?');
                values.push(userData.nome);
            }
            if (userData.email !== undefined) {
                fields.push('email = ?');
                values.push(userData.email);
            }
            if (userData.identificacao !== undefined) {
                fields.push('identificacao = ?');
                values.push(userData.identificacao);
            }
            if (userData.entidade_id !== undefined) {
                fields.push('entidade_id = ?');
                values.push(userData.entidade_id);
            }
            if (userData.role !== undefined) {
                fields.push('role = ?');
                values.push(userData.role);
            }

            if (fields.length === 0) return false;

            values.push(id);
            const query = `UPDATE auth_users SET ${fields.join(', ')} WHERE id = ?`;
            
            const result = await pool.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

export default User;
