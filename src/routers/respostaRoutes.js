// src/routers/respostaRoutes.js
import { Router } from 'express';
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

const router = Router();

// Get estagiarios by supervisor (must be before :id route)
router.get('/supervisor/:supervisor_id/estagiarios', getEstagiariosBySupervisor);

// Get resposta by estagiario and questionario (must be before :id route)
router.get('/estagiario/:estagiario_id/questionario/:questionario_id', getRespostaByEstagiarioAndQuestionario);

// Check if resposta is complete
router.get('/:id/complete', checkRespostaComplete);

// Get question count by supervisor
router.get('/supervisor/:supervisor_id/question-count', getQuestionCountBySupervisor);

// Get all respostas by questionario_id
router.get('/questionario/:questionario_id', getAllRespostasByQuestionario);

// Get all respostas by estagiario_id
router.get('/estagiario/:estagiario_id', getAllRespostasByEstagiario);

// Get all respostas by supervisor_id
router.get('/supervisor/:supervisor_id', getAllRespostasBySupervisor);

// Standard CRUD routes
router.get('/', getAllRespostas);
router.get('/:id', getRespostaById);
router.post('/', createResposta);
router.put('/:id', updateResposta);
router.delete('/:id', deleteResposta);

export default router;
