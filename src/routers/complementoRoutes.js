import express from 'express';
import * as complementoController from '../controllers/complementoController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

router.use(express.json());

router.get('/', verifyToken, complementoController.getAllComplementos);
router.get('/:id', verifyToken, complementoController.getComplementoById);
router.post('/', verifyToken, checkRole(['admin']), complementoController.createComplemento);
router.put('/:id', verifyToken, checkRole(['admin']), complementoController.updateComplemento);
router.delete('/:id', verifyToken, checkRole(['admin']), complementoController.deleteComplemento);

export default router;
