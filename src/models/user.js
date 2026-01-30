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
    }
};

export default User;
