// src/routes/alunoRoutes.js
import express from 'express';
import * as alunoController from '../controllers/alunoController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Public routes (no auth required)
router.get('/:id', alunoController.getAlunoById);
router.get('/with-estagiario/:id', alunoController.getAlunoWithEstagiarioById);

// Protected routes - require authentication
// Only authenticated users can view inscricoes
router.get('/', verifyToken, alunoController.getAllAlunos);
router.get('/:id/inscricoes', verifyToken, alunoController.getInscricoesByAlunoId);

// Admin and docente only routes - can create, update, delete
router.post('/', verifyToken, checkRole(['admin', 'aluno']), alunoController.createAluno);
router.put('/:id', verifyToken, checkRole(['admin', 'aluno']), alunoController.updateAluno);
router.delete('/:id', verifyToken, checkRole(['admin']), alunoController.deleteAluno);

export default router;