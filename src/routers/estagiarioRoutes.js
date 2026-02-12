// src/routers/estagiarioRoutes.js
import express from 'express';
import * as estagiarioController from '../controllers/estagiarioController.js';
import { verifyToken, checkRole, checkEstagiarioOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/periodos', estagiarioController.getDistinctPeriods);
router.post('/', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.createEstagiario);
router.get('/', verifyToken, checkRole(['admin', 'aluno', 'supervisor']), estagiarioController.getAllEstagiarios);
router.get('/aluno/:id', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.getEstagiariosByAlunoId);
router.get('/:id/next-nivel', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.getNextNivel);
router.get('/:id/atividades', verifyToken, checkRole(['admin', 'aluno', 'supervisor']), estagiarioController.getAtividadesByEstagiarioId);
router.get('/:id', estagiarioController.getEstagiarioById);
router.put('/:id', verifyToken, checkRole(['admin', 'aluno', 'docente']), checkEstagiarioOwnership, estagiarioController.updateEstagiario);
router.delete('/:id', verifyToken, checkRole(['admin', 'aluno']), checkEstagiarioOwnership, estagiarioController.deleteEstagiario);

export default router;
