// src/routers/turmaRoutes.js
import express from 'express';
import * as turmaController from '../controllers/turmaController.js';
import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes - All authenticated users can view, only admin can modify
router.get('/', verifyToken, turmaController.getAllTurmas);
router.get('/:id', verifyToken, turmaController.getTurmaById);
router.post('/', verifyToken, checkRole(['admin']), turmaController.createTurma);
router.put('/:id', verifyToken, checkRole(['admin']), turmaController.updateTurma);
router.delete('/:id', verifyToken, checkRole(['admin']), turmaController.deleteTurma);

export default router;
