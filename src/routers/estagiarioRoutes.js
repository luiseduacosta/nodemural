// src/routers/estagiarioRoutes.js
import express from 'express';
import * as estagiarioController from '../controllers/estagiarioController.js';
import { verifyToken, checkRole, checkEstagiarioOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/periodos', estagiarioController.getDistinctPeriodsEstagiario);
router.post('/', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.createEstagiarioEstagiario);
router.get('/', verifyToken, checkRole(['admin', 'aluno', 'supervisor']), estagiarioController.getAllEstagiariosEstagiario);
router.get('/aluno/:id', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.getEstagiariosByAlunoIdEstagiario);
router.get('/:id/next-nivel', verifyToken, checkRole(['admin', 'aluno']), estagiarioController.getNextNivelEstagiario);
router.get('/:id/atividades', verifyToken, checkRole(['admin', 'aluno', 'docente', 'supervisor']), estagiarioController.getAtividadesByEstagiarioIdEstagiario);
router.get('/:id', verifyToken, checkRole(['admin', 'aluno', 'docente', 'supervisor']), estagiarioController.getEstagiarioByIdEstagiario);
router.put('/:id', verifyToken, checkRole(['admin', 'aluno', 'docente']), checkEstagiarioOwnership, estagiarioController.updateEstagiarioEstagiario);
router.delete('/:id', verifyToken, checkRole(['admin', 'aluno']), checkEstagiarioOwnership, estagiarioController.deleteEstagiarioEstagiario);

export default router;
