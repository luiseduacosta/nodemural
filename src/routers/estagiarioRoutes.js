// src/routers/estagiarioRoutes.js
import express from 'express';
import * as estagiarioController from '../controllers/estagiarioController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/periodos', estagiarioController.getDistinctPeriods);
router.post('/', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.createEstagiario);
router.get('/', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.getAllEstagiarios);
router.get('/aluno/:id', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.getEstagiariosByAlunoId);
router.get('/:id/next-nivel', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.getNextNivel);
router.get('/:id/atividades', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.getAtividadesByEstagiarioId);
router.get('/:id', estagiarioController.getEstagiarioById);
router.put('/:id', estagiarioController.updateEstagiario);
router.delete('/:id', estagiarioController.deleteEstagiario);

export default router;
