// src/routes/questionarioRoutes.js
import express from 'express';
import * as questionarioController from '../controllers/questionarioController.js';

const router = express.Router();

// Middleware
router.use(express.json());
// Routes
router.post('/', questionarioController.createQuestionario);
router.get('/', questionarioController.getAllQuestionarios);
router.get('/:id', questionarioController.getQuestionarioById);
router.put('/:id', questionarioController.updateQuestionario);
router.delete('/:id', questionarioController.deleteQuestionario);

export default router;