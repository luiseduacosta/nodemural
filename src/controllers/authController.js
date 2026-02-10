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
        const newUser = await User.create(email, password, nome, identificacao, userRole, entidade_id);

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

// Update user
export const updateUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { nome, email, identificacao, entidade_id } = req.body;
        
        // Security check: User can only update themselves unless admin
        if (req.user.id !== id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado' });
        }

        const updated = await User.update(id, { nome, email, identificacao, entidade_id });
        
        if (!updated) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = await User.findById(id);
        res.json({ message: 'Usuário atualizado', user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};
