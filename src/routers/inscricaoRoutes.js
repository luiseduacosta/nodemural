// src/routers/inscricaoRoutes.js
import express from 'express';
import * as inscricaoController from '../controllers/inscricaoController.js';
import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/periodos', inscricaoController.getDistinctPeriods);
// router.post('/', verifyToken, checkRole('admin'), inscricaoController.createInscricao);
router.post('/', verifyToken, checkRole('admin'), inscricaoController.createInscricao);
router.get('/', verifyToken, checkRole('admin'), inscricaoController.getAllInscricoes);
router.get('/:aluno_id/:muralestagio_id', verifyToken, checkRole('admin'), inscricaoController.getInscricoesByAlunoAndMural);
router.get('/:id', verifyToken, checkRole('admin'), inscricaoController.getInscricaoById);
router.put('/:id', verifyToken, checkRole('admin'), inscricaoController.updateInscricao);
router.delete('/:id', verifyToken, checkRole('admin'), inscricaoController.deleteInscricao);

export default router;
