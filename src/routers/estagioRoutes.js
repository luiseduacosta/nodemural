// src/routers/estagioRoutes.js
import express from 'express';
import * as estagioController from '../controllers/estagioController.js';
import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.post('/', verifyToken, checkRole(['admin']), estagioController.createEstagio);
router.get('/', verifyToken, estagioController.getAllEstagios);
router.get('/:id/supervisores', verifyToken, checkRole(['admin', 'aluno']), estagioController.getSupervisoresById);
router.get('/:id/mural', verifyToken, estagioController.getMuralById);
router.get('/:id', verifyToken, estagioController.getEstagioById);
router.put('/:id', verifyToken, checkRole(['admin']), estagioController.updateEstagio);
router.delete('/:id', verifyToken, checkRole(['admin']), estagioController.deleteEstagio);

export default router;
