// src/routes/questaoRoutes.js
import express from 'express';
import * as questaoController from '../controllers/questaoController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.post('/', questaoController.createQuestao);
router.get('/', questaoController.getAllQuestoes);
router.get('/:id', questaoController.getQuestaoById);
router.put('/:id', questaoController.updateQuestao);
router.delete('/:id', questaoController.deleteQuestao);

export default router;