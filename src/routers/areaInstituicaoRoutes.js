import express from 'express';
import * as areaInstituicaoController from '../controllers/areaInstituicaoController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes - require authentication
router.get('/', verifyToken, areaInstituicaoController.getAllAreaInstituicoes);
router.get('/:id', verifyToken, areaInstituicaoController.getAreaInstituicaoById);
router.post('/', verifyToken, checkRole(['admin']), areaInstituicaoController.createAreaInstituicao);
router.put('/:id', verifyToken, checkRole(['admin']), areaInstituicaoController.updateAreaInstituicao);
router.delete('/:id', verifyToken, checkRole(['admin']), areaInstituicaoController.deleteAreaInstituicao);

export default router;
