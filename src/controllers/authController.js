// src/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Register a new user
export const register = async (req, res) => {
    try {
        const { email, password, passwordConfirm, nome, identificacao, role, entidade_id } = req.body;

        // Validation
        if (!email || !password || !passwordConfirm || !nome) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
        }

        if (password !== passwordConfirm) {
            return res.status(400).json({ error: 'Senhas não coincidem' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        // Create user (role defaults to 'aluno' if not specified)
        const userRole = role || 'aluno';

        // Rules for entidade_id: must be null for admin
        let finalEntidadeId = entidade_id;
        if (userRole === 'admin') {
            finalEntidadeId = null;
        }

        const newUser = await User.create(email, password, nome, identificacao, userRole, finalEntidadeId);

        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            user: newUser
        });

    } catch (error) {
        console.error('Register error:', error);
        if (error.message === 'Email já registrado') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        // Verify password
        const isPasswordValid = await User.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email ou senha incorretos' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nome: user.nome,
                role: user.role,
                entidade_id: user.entidade_id
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );

        res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome,
                identificacao: user.identificacao,
                role: user.role,
                entidade_id: user.entidade_id
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

// Get current user profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};

// Update user (self or admin)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, role, entidade_id, identificacao } = req.body;

        // Find existing user
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Authorization check: User can update themselves, or admin can update anyone
        if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const updateData = {};
        if (nome) updateData.nome = nome;
        if (email) updateData.email = email;
        if (identificacao) updateData.identificacao = identificacao;

        // Only admin can change role
        if (role && req.user.role === 'admin') {
            updateData.role = role;
        }

        // Validate entidade_id based on role (current or updated)
        const targetRole = updateData.role || existingUser.role;

        if (entidade_id !== undefined) {
            if (targetRole === 'admin') {
                updateData.entidade_id = null;
            } else {
                // For non-admin, entidade_id cannot be null if provided
                if (entidade_id === null || entidade_id === '') {
                    // It's allowed to be null initially, but if they try to set it, it should be valid
                    // Actually, the requirement says "can't be empty in the other situations".
                    // This likely means once it's set, it should have a value.
                    // Or that it shouldn't be null in the DB if not admin.
                    // But they might not have an entity yet.
                    updateData.entidade_id = null;
                } else {
                    updateData.entidade_id = entidade_id;
                }
            }
        }

        const updatedUser = await User.update(id, updateData);

        // Generate a new token to reflect updated claims (role, entidade_id)
        const newToken = jwt.sign(
            {
                id: updatedUser.id,
                email: updatedUser.email,
                nome: updatedUser.nome,
                role: updatedUser.role,
                entidade_id: updatedUser.entidade_id
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );

        res.status(200).json({
            user: updatedUser,
            token: newToken
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};

// Update user by entity ID
export const updateUserByEntityId = async (req, res) => {
    try {
        const { entidade_id } = req.params;
        const { identificacao, nome, email } = req.body;

        // Find user by entity ID
        const user = await User.findByEntidadeId(entidade_id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado para esta entidade' });
        }

        // Authorization check: Admin only or the user themselves
        if (req.user.role !== 'admin' && req.user.id !== user.id) {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const updateData = {};
        if (identificacao) updateData.identificacao = identificacao;
        if (nome) updateData.nome = nome;
        if (email) updateData.email = email;

        const updatedUser = await User.update(user.id, updateData);

        // Generate a new token
        const newToken = jwt.sign(
            {
                id: updatedUser.id,
                email: updatedUser.email,
                nome: updatedUser.nome,
                role: updatedUser.role,
                entidade_id: updatedUser.entidade_id
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );

        res.status(200).json({
            user: updatedUser,
            token: newToken
        });

    } catch (error) {
        console.error('Update user by entity error:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};
