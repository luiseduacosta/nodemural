// src/routers/turmaRoutes.js
import express from 'express';
import * as turmaController from '../controllers/turmaController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/', turmaController.getAllTurmas);
router.get('/:id', turmaController.getTurmaById);
router.post('/', turmaController.createTurma);
router.put('/:id', turmaController.updateTurma);
router.delete('/:id', turmaController.deleteTurma);

export default router;
