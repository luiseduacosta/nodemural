// src/routers/respostaRoutes.js
import { Router } from 'express';
import express from 'express';
import {
    getAllRespostas,
    getAllRespostasByQuestionario,
    getAllRespostasByEstagiario,
    getRespostaById,
    getRespostaByEstagiarioAndQuestionario,
    getAllRespostasBySupervisor,
    createResposta,
    updateResposta,
    deleteResposta,
    getEstagiariosBySupervisor,
    getQuestionCountBySupervisor,
    checkRespostaComplete
} from '../controllers/respostaController.js';
import { verifyToken, checkRole } from '../middleware/auth.js';

const router = Router();

// Middleware
router.use(express.json());

// Get estagiarios by supervisor (must be before other supervisor routes)
router.get('/supervisor/:supervisor_id/estagiarios', verifyToken, checkRole(['admin', 'supervisor']), getEstagiariosBySupervisor);

// Get question count by supervisor (must be before :id route)
router.get('/supervisor/:supervisor_id/question-count', verifyToken, checkRole(['admin', 'supervisor']), getQuestionCountBySupervisor);

// Get all respostas by supervisor_id (must be before :id route)
router.get('/supervisor/:supervisor_id', verifyToken, checkRole(['admin', 'supervisor']), getAllRespostasBySupervisor);

// Get resposta by estagiario and questionario (MUST be before /estagiario/:id route)
router.get('/estagiario/:estagiario_id/questionario/:questionario_id', verifyToken, checkRole(['admin', 'supervisor', 'aluno', 'professor']), getRespostaByEstagiarioAndQuestionario);

// Get all respostas by estagiario_id (MUST be after /estagiario/:id/questionario/:id route)
router.get('/estagiario/:estagiario_id', verifyToken, checkRole(['admin', 'supervisor', 'aluno']), getAllRespostasByEstagiario);

// Get all respostas by questionario_id (MUST be before :id route)
router.get('/questionario/:questionario_id', verifyToken, checkRole(['admin', 'supervisor', 'aluno']), getAllRespostasByQuestionario);

// Check if resposta is complete (must be before :id route)
router.get('/:id/complete', verifyToken, checkRole(['admin', 'supervisor', 'aluno']), checkRespostaComplete);

// Standard CRUD routes (must be LAST)
router.get('/', verifyToken, checkRole(['admin', 'supervisor', 'aluno']), getAllRespostas);
router.get('/:id', verifyToken, checkRole(['admin', 'supervisor', 'aluno']), getRespostaById);
router.post('/', verifyToken, checkRole(['admin', 'supervisor']), createResposta);
router.put('/:id', verifyToken, checkRole(['admin', 'supervisor']), updateResposta);
router.delete('/:id', verifyToken, checkRole(['admin', 'supervisor']), deleteResposta);

export default router;
