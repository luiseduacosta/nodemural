// src/routers/docenteRoutes.js
import express from 'express';
import * as docenteController from '../controllers/docenteController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.post('/', docenteController.createDocente);
router.get('/', docenteController.getAllDocentes);
router.get('/:id/estagiarios', docenteController.getEstagiariosByDocenteId);
router.get('/:id', docenteController.getDocenteById);
router.put('/:id', docenteController.updateDocente);
router.delete('/:id', docenteController.deleteDocente);

export default router;
