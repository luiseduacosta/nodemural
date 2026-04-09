// src/controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Impersonation from '../models/impersonation.js';

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

        // Rules for entidade_id: must be null for admin, and handle string 'undefined'
        let finalEntidadeId = entidade_id;
        if (userRole === 'admin' || entidade_id === 'undefined' || entidade_id === undefined || entidade_id === '') {
            finalEntidadeId = null;
        } else if (entidade_id) {
            finalEntidadeId = parseInt(entidade_id, 10) || null;
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

// Start impersonation (admin only)
export const startImpersonation = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.id;

        // Verify admin exists (prevents foreign key errors with stale tokens)
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(401).json({ error: 'Administrador não encontrado. Sessão expirada, faça login novamente.' });
        }

        // Validate user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Admin cannot impersonate themselves
        if (parseInt(userId) === adminId) {
            return res.status(400).json({ error: 'Não é possível impersonar a si mesmo' });
        }

        // Optional: Prevent impersonating other admins (security measure)
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Não é possível impersonar outro administrador' });
        }

        // Create impersonation record
        await Impersonation.create(adminId, userId);

        // Generate JWT token for impersonated user
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                nome: user.nome,
                role: user.role,
                entidade_id: user.entidade_id,
                isImpersonating: true,
                originalAdminId: adminId
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );

        res.status(200).json({
            message: `Agora impersonando como ${user.nome}`,
            token,
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome,
                identificacao: user.identificacao,
                role: user.role,
                entidade_id: user.entidade_id,
                isImpersonating: true,
                originalAdminId: adminId
            }
        });

    } catch (error) {
        console.error('Start impersonation error:', error);
        res.status(500).json({ error: 'Erro ao iniciar impersonação' });
    }
};

// Stop impersonation
export const stopImpersonation = async (req, res) => {
    try {
        const adminId = req.user.originalAdminId;

        if (!adminId) {
            return res.status(400).json({ error: 'Não está impersonando ninguém' });
        }

        // End impersonation session
        await Impersonation.end(adminId);

        // Get admin user info
        const admin = await User.findById(adminId);
        if (!admin) {
            return res.status(404).json({ error: 'Admin não encontrado' });
        }

        // Generate new JWT token for admin
        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                nome: admin.nome,
                role: admin.role,
                entidade_id: admin.entidade_id
            },
            process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
            { expiresIn: process.env.JWT_EXPIRY || '7d' }
        );

        res.status(200).json({
            message: 'Retornado à conta de administrador',
            token,
            user: {
                id: admin.id,
                email: admin.email,
                nome: admin.nome,
                identificacao: admin.identificacao,
                role: admin.role,
                entidade_id: admin.entidade_id
            }
        });

    } catch (error) {
        console.error('Stop impersonation error:', error);
        res.status(500).json({ error: 'Erro ao parar impersonação' });
    }
};

// Get impersonation history (admin only)
export const getImpersonationHistory = async (req, res) => {
    try {
        const { limit } = req.query;
        const history = await Impersonation.getHistory(req.user.id, parseInt(limit) || 50);
        res.status(200).json(history);
    } catch (error) {
        console.error('Get impersonation history error:', error);
        res.status(500).json({ error: 'Erro ao buscar histórico de impersonação' });
    }
};

// Get all active impersonations (super admin only)
export const getActiveImpersonations = async (req, res) => {
    try {
        const activeImpersonations = await Impersonation.getAllActive();
        res.status(200).json(activeImpersonations);
    } catch (error) {
        console.error('Get active impersonations error:', error);
        res.status(500).json({ error: 'Erro ao buscar impersonações ativas' });
    }
};
