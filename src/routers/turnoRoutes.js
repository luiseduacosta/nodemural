import express from 'express';
import * as turnoController from '../controllers/turnoController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.use(express.json());

router.get('/', verifyToken, turnoController.getAllTurnos);
router.get('/:id', verifyToken, turnoController.getTurnoById);
router.post('/', verifyToken, checkRole(['admin']), turnoController.createTurno);
router.put('/:id', verifyToken, checkRole(['admin']), turnoController.updateTurno);
router.delete('/:id', verifyToken, checkRole(['admin']), turnoController.deleteTurno);

export default router;
