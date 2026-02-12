// src/routers/supervisorRoutes.js
import express from 'express';
import * as supervisorController from '../controllers/supervisorController.js';

import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Public routes (no auth required) - needed for registration
router.get('/cress/:cress', supervisorController.getSupervisorByCress);

// Protected routes
router.get('/', verifyToken, supervisorController.getAllSupervisores);
router.get('/:id', verifyToken, checkRole(['admin', 'supervisor']), checkOwnership, supervisorController.getSupervisorById);
router.put('/:id', verifyToken, checkRole(['admin', 'supervisor']), checkOwnership, supervisorController.updateSupervisor);

// Specialized routes
router.get('/:id/estagiarios', verifyToken, checkRole(['admin', 'supervisor']), checkOwnership, supervisorController.getEstagiariosBySupervisor);
router.get('/:id/instituicoes', verifyToken, checkRole(['admin', 'supervisor']), checkOwnership, supervisorController.getInstituicoesBySupervisor);
router.post('/:id/instituicoes', verifyToken, checkRole(['admin', 'supervisor']), checkOwnership, supervisorController.addInstituicaoToSupervisor);
router.delete('/:id/instituicoes/:instituicaoId', verifyToken, checkRole(['admin', 'supervisor']), checkOwnership, supervisorController.removeInstituicaoFromSupervisor);

// Admin only
router.post('/', verifyToken, checkRole(['admin', 'supervisor']), supervisorController.createSupervisor);
router.delete('/:id', verifyToken, checkRole(['admin']), supervisorController.deleteSupervisor);

export default router;
