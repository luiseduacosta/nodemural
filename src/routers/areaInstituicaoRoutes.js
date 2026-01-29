import express from 'express';
import * as areaInstituicaoController from '../controllers/areaInstituicaoController.js';

const router = express.Router();

router.get('/', areaInstituicaoController.getAllAreaInstituicoes);
router.get('/:id', areaInstituicaoController.getAreaInstituicaoById);
router.post('/', areaInstituicaoController.createAreaInstituicao);
router.put('/:id', areaInstituicaoController.updateAreaInstituicao);
router.delete('/:id', areaInstituicaoController.deleteAreaInstituicao);

export default router;
