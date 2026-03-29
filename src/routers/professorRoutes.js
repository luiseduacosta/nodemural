// src/routers/professorRoutes.js
import express from 'express';
import * as professorController from '../controllers/professorController.js';

import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';
const router = express.Router();

// Middleware
router.use(express.json());

// Public routes (no auth required) - needed for registration
router.get('/siape/:siape', professorController.getProfessorBySiape);

// Protected routes
router.get('/', verifyToken, checkRole(['admin', 'aluno', 'professor']), professorController.getAllProfessores);
router.get('/:id/estagiarios', verifyToken, checkRole(['admin', 'professor']), checkOwnership, professorController.getEstagiariosByProfessorId);
router.get('/:id', verifyToken, checkRole(['admin', 'professor']), checkOwnership, professorController.getProfessorById);
router.post('/', verifyToken, checkRole(['admin', 'professor']), professorController.createProfessor);
router.put('/:id', verifyToken, checkRole(['admin', 'professor']), checkOwnership, professorController.updateProfessor);
router.delete('/:id', verifyToken, checkRole(['admin']), professorController.deleteProfessor);

export default router;
