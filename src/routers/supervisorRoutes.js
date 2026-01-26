// src/routers/supervisorRoutes.js
import express from 'express';
import * as supervisorController from '../controllers/supervisorController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.post('/', supervisorController.createSupervisor);
router.get('/', supervisorController.getAllSupervisores);
router.get('/:id/instituicoes', supervisorController.getInstituicoesBySupervisor);
router.post('/:id/instituicoes', supervisorController.addInstituicaoToSupervisor);
router.delete('/:id/instituicoes/:instituicaoId', supervisorController.removeInstituicaoFromSupervisor);
router.get('/:id', supervisorController.getSupervisorById);
router.put('/:id', supervisorController.updateSupervisor);
router.delete('/:id', supervisorController.deleteSupervisor);

export default router;
