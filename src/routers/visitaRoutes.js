// src/routers/visitaRoutes.js
import express from 'express';
import * as visitaController from '../controllers/visitaController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes - require authentication
router.get('/', verifyToken, checkRole(['admin', 'docente']), visitaController.getAllVisitas);
router.get('/:id', verifyToken, checkRole(['admin', 'docente']), visitaController.getVisitaById);
router.post('/', verifyToken, checkRole(['admin']), visitaController.createVisita);
router.put('/:id', verifyToken, checkRole(['admin']), visitaController.updateVisita);
router.delete('/:id', verifyToken, checkRole(['admin']), visitaController.deleteVisita);

export default router;
