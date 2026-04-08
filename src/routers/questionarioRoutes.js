// src/routes/questionarioRoutes.js
import express from 'express';
import * as questionarioController from '../controllers/questionarioController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes - require authentication
router.get('/', verifyToken, questionarioController.getAllQuestionarios);
router.get('/:id', verifyToken, questionarioController.getQuestionarioById);
router.post('/', verifyToken, checkRole(['admin']), questionarioController.createQuestionario);
router.put('/:id', verifyToken, checkRole(['admin']), questionarioController.updateQuestionario);
router.delete('/:id', verifyToken, checkRole(['admin']), questionarioController.deleteQuestionario);

export default router;