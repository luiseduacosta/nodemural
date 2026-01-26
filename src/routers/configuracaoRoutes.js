// src/routes/configuracaoRoutes.js
import express from 'express';
import * as configuracaoController from '../controllers/configuracaoController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/', configuracaoController.getAllConfiguracoes);
router.get('/:id', configuracaoController.getConfiguracaoById);
router.put('/:id', configuracaoController.updateConfiguracao);

export default router;