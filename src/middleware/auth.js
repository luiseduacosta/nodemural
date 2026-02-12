// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import Inscricao from '../models/inscricao.js';
import Atividades from '../models/atividades.js';
import Estagiario from '../models/estagiario.js';

// Verify JWT token middleware
export const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.warn(`[Auth] Token missing for: ${req.method} ${req.originalUrl}`);
            console.warn(`[Auth] Headers:`, JSON.stringify(req.headers));
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production'
        );

        req.user = decoded;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Check user role middleware
export const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Não autenticado' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Acesso negado. Permissão insuficiente.',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};

// Get current user info from token
export const getCurrentUser = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production'
        );

        res.status(200).json({
            user: decoded
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        res.status(401).json({ error: 'Token inválido' });
    }
};

// Check if user owns the record they are trying to access/modify
export const checkOwnership = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
        return next();
    }

    // Get the ID from params
    const id = parseInt(req.params.id);

    // Compare with user's entidade_id
    if (req.user.entidade_id && req.user.entidade_id === id) {
        return next();
    }

    return res.status(403).json({
        error: 'Acesso negado. Você só pode acessar ou editar seus próprios dados.'
    });
};

// Check if user owns the activity
export const checkAtividadeOwnership = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
        return next();
    }

    const id = req.params.id;

    try {
        const atividade = await Atividades.findById(id);
        if (!atividade) {
            return res.status(404).json({ error: 'Atividade não encontrada' });
        }

        // Compare atividade's estagiario_id with user's entidade_id
        // For 'aluno' role, entidade_id IS the aluno_id.
        // We must check if the activity belongs to an estagiario that belongs to this aluno.
        
        // Atividades.findById joins with estagiarios and then alunos, returning 'alunoId'.
        // Only 'aluno' role can access activities of their own students.
        if ( req.user.role === 'aluno' && req.user.entidade_id == atividade.alunoId) {
             return next();
        }

        return res.status(403).json({
            error: 'Acesso negado. Você só pode acessar ou editar suas próprias atividades.'
        });
    } catch (error) {
        console.error('Error in checkAtividadeOwnership:', error);
        res.status(500).json({ error: 'Erro interno ao verificar permissão' });
    }
};

export const checkEstagiarioOwnership = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
        return next();
    }

    const id = req.params.id;

    try {
        const estagiario = await Estagiario.findById(id);
        if (!estagiario) {
            return res.status(404).json({ error: 'Estagiário não encontrado' });
        }

        // Aluno can access their own estagiarios
        if (req.user.role === 'aluno' && req.user.entidade_id == estagiario.aluno_id) {
            return next();
        }

        // Docente can access only their own students (estagiarios where professor_id matches)
        if (req.user.role === 'docente' && req.user.entidade_id == estagiario.professor_id) {
            return next();
        }

        return res.status(403).json({
            error: 'Acesso negado. Você só pode acessar ou editar seus próprios estágios.'
        });
    } catch (error) {
        console.error('Error in checkEstagiarioOwnership:', error);
        res.status(500).json({ error: 'Erro interno ao verificar permissão' });
    }
};

// Check if user owns the registration (inscricao)
export const checkInscricaoOwnership = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
        return next();
    }

    // Aluno role check
    if (req.user.role !== 'aluno') {
        return res.status(403).json({ error: 'Acesso negado' });
    }

    const id = req.params.id;

    try {
        const inscricao = await Inscricao.findById(id);
        if (!inscricao) {
            return res.status(404).json({ error: 'Inscrição não encontrada' });
        }

        // Compare inscricao's aluno_id with user's entidade_id
        if (req.user.entidade_id && req.user.entidade_id == inscricao.aluno_id) {
            return next();
        }

        return res.status(403).json({
            error: 'Acesso negado. Você só pode acessar ou editar suas próprias inscrições.'
        });
    } catch (error) {
        console.error('Error in checkInscricaoOwnership:', error);
        res.status(500).json({ error: 'Erro interno ao verificar permissão' });
    }
};
