// src/routers/inscricaoRoutes.js
import express from 'express';
import * as inscricaoController from '../controllers/inscricaoController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/periodos', inscricaoController.getDistinctPeriods);
router.post('/', inscricaoController.createInscricao);
router.get('/', inscricaoController.getAllInscricoes);
router.get('/:aluno_id/:muralestagio_id', inscricaoController.getInscricoesByAlunoAndMural);
router.get('/:id', inscricaoController.getInscricaoById);
router.put('/:id', inscricaoController.updateInscricao);
router.delete('/:id', inscricaoController.deleteInscricao);

export default router;
