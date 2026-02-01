// src/routers/docenteRoutes.js
import express from 'express';
import * as docenteController from '../controllers/docenteController.js';

import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';
const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/', verifyToken, checkRole(['admin', 'docente']), docenteController.getAllDocentes);
router.get('/:id/estagiarios', verifyToken, checkRole(['admin', 'docente']), checkOwnership, docenteController.getEstagiariosByDocenteId);
router.get('/:id', verifyToken, checkRole(['admin', 'docente']), checkOwnership, docenteController.getDocenteById);
router.post('/', verifyToken, checkRole(['admin']), docenteController.createDocente);
router.put('/:id', verifyToken, checkRole(['admin', 'docente']), checkOwnership, docenteController.updateDocente);
router.delete('/:id', verifyToken, checkRole(['admin']), docenteController.deleteDocente);

export default router;
