// src/routers/estagiarioRoutes.js
import express from 'express';
import * as estagiarioController from '../controllers/estagiarioController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.get('/periodos', estagiarioController.getDistinctPeriods);
router.post('/', estagiarioController.createEstagiario);
router.get('/', estagiarioController.getAllEstagiarios);
router.get('/aluno/:id', estagiarioController.getEstagiariosByAlunoId);
router.get('/:id/next-nivel', estagiarioController.getNextNivel);
router.get('/:id', estagiarioController.getEstagiarioById);
router.put('/:id', estagiarioController.updateEstagiario);
router.delete('/:id', estagiarioController.deleteEstagiario);

export default router;
