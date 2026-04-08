import express from 'express';
import * as areaController from '../controllers/areaController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes - require authentication
router.get('/', verifyToken, areaController.getAllAreas);
router.get('/:id', verifyToken, areaController.getAreaById);
router.post('/', verifyToken, checkRole(['admin']), areaController.createArea);
router.put('/:id', verifyToken, checkRole(['admin']), areaController.updateArea);
router.delete('/:id', verifyToken, checkRole(['admin']), areaController.deleteArea);

export default router;
