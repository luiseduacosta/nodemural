// src/routers/muralRoutes.js
import express from 'express';
import * as muralController from '../controllers/muralController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/periodos', muralController.getDistinctPeriods);
router.post('/', muralController.createMural);
router.get('/', muralController.getAllMural);
router.get('/:id', muralController.getMuralById);
router.get('/:id/inscricoes', muralController.getInscricoesByMuralId);
router.put('/:id', muralController.updateMural);
router.delete('/:id', muralController.deleteMural);

export default router;
