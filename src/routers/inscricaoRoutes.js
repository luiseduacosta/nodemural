// src/routers/inscricaoRoutes.js
import express from 'express';
import * as inscricaoController from '../controllers/inscricaoController.js';
import { verifyToken, checkRole, checkInscricaoOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/periodos', inscricaoController.getDistinctPeriods);
router.post('/', verifyToken, checkRole(['admin', 'aluno']), inscricaoController.createInscricao);
router.get('/', verifyToken, checkRole(['admin', 'aluno']), inscricaoController.getAllInscricoes);
router.get('/:aluno_id/:muralestagio_id', verifyToken, checkRole(['aluno', 'admin']), inscricaoController.getInscricoesByAlunoAndMural);
router.get('/:id', verifyToken, checkRole(['admin', 'aluno']), checkInscricaoOwnership, inscricaoController.getInscricaoById);
router.put('/:id', verifyToken, checkRole(['admin']), inscricaoController.updateInscricao);
router.delete('/:id', verifyToken, checkRole(['admin', 'aluno']), checkInscricaoOwnership, inscricaoController.deleteInscricao);

export default router;
