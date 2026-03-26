// src/routes/configuracaoRoutes.js
import express from 'express';
import * as configuracaoController from '../controllers/configuracaoController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes - GET is public, PUT requires admin role
router.get('/', configuracaoController.getAllConfiguracoes);
router.get('/:id', configuracaoController.getConfiguracaoById);
router.put('/:id', verifyToken, checkRole(['admin']), configuracaoController.updateConfiguracao);

export default router;