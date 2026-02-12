// src/routes/questaoRoutes.js
import express from 'express';
import * as questaoController from '../controllers/questaoController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes - require authentication
router.get('/', verifyToken, questaoController.getAllQuestoes);
router.get('/:id', verifyToken, questaoController.getQuestaoById);
router.post('/', verifyToken, checkRole(['admin']), questaoController.createQuestao);
router.put('/:id', verifyToken, checkRole(['admin']), questaoController.updateQuestao);
router.delete('/:id', verifyToken, checkRole(['admin']), questaoController.deleteQuestao);

export default router;