// src/routers/atividadesRoutes.js
import express from 'express';
import * as atividadesController from '../controllers/atividadesController.js';
import { verifyToken, checkRole, checkOwnership } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/', verifyToken, atividadesController.getAllAtividades);
router.get('/:id', verifyToken, atividadesController.getAtividadeById);
router.post('/', verifyToken, checkRole(['admin', 'aluno']), atividadesController.createAtividade);
// Route with estagiario_id param for creation
router.put('/:id', verifyToken, checkRole(['admin', 'aluno']), checkOwnership, atividadesController.updateAtividade);
router.delete('/:id', verifyToken, checkRole(['admin', 'aluno']), checkOwnership, atividadesController.deleteAtividade);

export default router;
