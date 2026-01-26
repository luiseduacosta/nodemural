// src/routers/atividadesRoutes.js
import express from 'express';
import * as atividadesController from '../controllers/atividadesController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/', atividadesController.getAllAtividades);
router.get('/:id', atividadesController.getAtividadeById);
router.post('/', atividadesController.createAtividade);
// Route with estagiario_id param for creation
router.post('/:estagiario_id', atividadesController.createAtividade);
router.put('/:id', atividadesController.updateAtividade);
router.delete('/:id', atividadesController.deleteAtividade);

export default router;
