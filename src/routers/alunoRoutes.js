// src/routes/alunoRoutes.js
import express from 'express';
import * as alunoController from '../controllers/alunoController.js';
import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Public routes (no auth required)
router.get('/:id', alunoController.getAlunoById);
router.get('/registro/:registro', alunoController.getAlunoByRegistro);
router.get('/with-estagiario/:id', alunoController.getAlunoWithEstagiarioById);

// Protected routes - require authentication
router.get('/', verifyToken, alunoController.getAllAlunos);

// Routes with ownership check
router.post('/', verifyToken, checkRole(['admin', 'aluno']), alunoController.createAluno);
router.put('/:id', verifyToken, checkRole(['admin', 'aluno']), checkOwnership, alunoController.updateAluno);
router.get('/:id/inscricoes', verifyToken, checkRole(['admin', 'aluno']), checkOwnership, alunoController.getInscricoesByAlunoId);
router.delete('/:id', verifyToken, checkRole(['admin']), alunoController.deleteAluno);

export default router;