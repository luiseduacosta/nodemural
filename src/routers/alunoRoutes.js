// src/routes/alunoRoutes.js
import express from 'express';
import * as alunoController from '../controllers/alunoController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.post('/', alunoController.createAluno);
router.get('/', alunoController.getAllAlunos);
router.get('/:id', alunoController.getAlunoById);
router.get('/with-estagiario/:id', alunoController.getAlunoWithEstagiarioById);
router.get('/:id/inscricoes', alunoController.getInscricoesByAlunoId);
router.put('/:id', alunoController.updateAluno);
router.delete('/:id', alunoController.deleteAluno);

export default router;