// src/routers/estagioRoutes.js
import express from 'express';
import * as estagioController from '../controllers/estagioController.js';

const router = express.Router();

// Middleware
router.use(express.json());

// Routes
router.post('/', estagioController.createEstagio);
router.get('/', estagioController.getAllEstagios);
router.get('/:id/supervisores', estagioController.getSupervisoresById);
router.get('/:id/mural', estagioController.getMuralById);
router.get('/:id', estagioController.getEstagioById);
router.put('/:id', estagioController.updateEstagio);
router.delete('/:id', estagioController.deleteEstagio);

export default router;
