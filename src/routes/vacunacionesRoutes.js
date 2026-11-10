import { Router } from 'express';
import { getVacunaciones, getVacunas, createVacunacion, deleteVacunacion } from '../controllers/vacunacionesController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = Router();
router.get('/catalogo', verifyToken, getVacunas);
router.get('/', verifyToken, getVacunaciones);
router.post('/', verifyToken, createVacunacion);
router.delete('/:id', verifyToken, verifyAdmin, deleteVacunacion);

export default router;