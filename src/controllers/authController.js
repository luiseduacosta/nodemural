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

        // Create user (role defaults to 'aluno' if not specified, or only admin can set other roles)
        const newUser = await User.create(email, password, nome, identificacao, role || 'aluno', entidade_id);

        // Determine the redirect URL based on the user's role
        let redirectTo = '/login.html';
        switch (role) {
            case 'aluno':
                if (entidade_id) {
                    redirectTo = '/view-alunos.html?id=' + entidade_id;
                } else {
                    redirectTo = '/new-alunos.html?registro=' + identificacao + '&nome=' + nome + '&email=' + email;
                }
                break;
            case 'docente':
                if (entidade_id) {
                    redirectTo = '/view-docente.html?id=' + entidade_id;
                } else {
                    redirectTo = '/new-docentes.html?siape=' + identificacao + '&nome=' + nome + '&email=' + email;
                }
                break;
            case 'supervisor':
                if (entidade_id) {
                    redirectTo = '/view-supervisor.html?id=' + entidade_id;
                } else {
                    redirectTo = '/new-supervisor.html?cress=' + identificacao + '&nome=' + nome + '&email=' + email;
                }
                break;
            case 'admin':
                redirectTo = '/mural.html';
                break;
        }

        res.status(201).json({
            message: 'Usuário registrado com sucesso',
            user: newUser,
            redirectTo
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
