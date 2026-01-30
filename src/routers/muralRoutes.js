// src/routers/muralRoutes.js
import express from 'express';
import * as muralController from '../controllers/muralController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes. Without authentication
router.get('/', muralController.getAllMural);
router.get('/periodoestagio', muralController.getDistinctPeriods);
router.get('/:id/inscricoes', muralController.getInscricoesByMuralId);
router.get('/:id', muralController.getMuralById);

// Admin only routes - can create, update and delete mural
router.post('/', verifyToken, checkRole(['admin']), muralController.createMural);
router.put('/:id', verifyToken, checkRole(['admin']), muralController.updateMural);
router.delete('/:id', verifyToken, checkRole(['admin']), muralController.deleteMural);

export default router;
