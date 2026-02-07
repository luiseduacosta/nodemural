// src/routes/configuracaoRoutes.js
import express from 'express';
import * as configuracaoController from '../controllers/configuracaoController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes - require authentication
router.put('/:id', verifyToken, checkRole(['admin']), configuracaoController.updateConfiguracao);

// Authenticate users only routes - can view and update configuracao
router.get('/', configuracaoController.getAllConfiguracoes);
router.get('/:id', configuracaoController.getConfiguracaoById);

export default router;