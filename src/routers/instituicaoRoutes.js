// src/routers/instituicaoRoutes.js
import express from 'express';
import * as instituicaoController from '../controllers/instituicaoController.js';
import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.post('/', verifyToken, checkRole(['admin']), instituicaoController.createInstituicao);
router.get('/', verifyToken, instituicaoController.getAllInstituicoes);
router.get('/:id/supervisores', verifyToken, checkRole(['admin', 'aluno']), instituicaoController.getSupervisoresById);
router.get('/:id/mural', verifyToken, instituicaoController.getMuralById);
router.get('/:id', verifyToken, instituicaoController.getInstituicaoById);
router.put('/:id', verifyToken, checkRole(['admin']), instituicaoController.updateInstituicao);
router.delete('/:id', verifyToken, checkRole(['admin']), instituicaoController.deleteInstituicao);

export default router;
