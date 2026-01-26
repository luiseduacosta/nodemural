// src/routers/visitaRoutes.js
import express from 'express';
import * as visitaController from '../controllers/visitaController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/', visitaController.getAllVisitas);
router.get('/:id', visitaController.getVisitaById);
router.post('/', visitaController.createVisita);
router.put('/:id', visitaController.updateVisita);
router.delete('/:id', visitaController.deleteVisita);

export default router;
