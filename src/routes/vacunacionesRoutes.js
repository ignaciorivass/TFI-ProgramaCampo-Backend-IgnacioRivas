import { Router } from 'express';
import { getVacunaciones, getVacunacionById, getVacunas, createVacunacion, updateVacunacion, deleteVacunacion } from '../controllers/vacunacionesController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/catalogo', verifyToken, getVacunas);
router.get('/', verifyToken, getVacunaciones);
router.get('/:id', verifyToken, getVacunacionById);
router.post('/', verifyToken, createVacunacion);
router.put('/:id', verifyToken, updateVacunacion);
router.delete('/:id', verifyToken, verifyAdmin, deleteVacunacion);

export default router;