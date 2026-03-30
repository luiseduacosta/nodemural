// src/routers/instituicaoRoutes.js
import express from 'express';
import * as instituicaoController from '../controllers/instituicaoController.js';
import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.post('/', verifyToken, checkRole(['admin']), instituicaoController.createEstagio);
router.get('/', verifyToken, instituicaoController.getAllEstagios);
router.get('/:id/supervisores', verifyToken, checkRole(['admin', 'aluno']), instituicaoController.getSupervisoresById);
router.get('/:id/mural', verifyToken, instituicaoController.getMuralById);
router.get('/:id', verifyToken, instituicaoController.getEstagioById);
router.put('/:id', verifyToken, checkRole(['admin']), instituicaoController.updateEstagio);
router.delete('/:id', verifyToken, checkRole(['admin']), instituicaoController.deleteEstagio);

export default router;
