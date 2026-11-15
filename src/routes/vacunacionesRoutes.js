import express from 'express';
import { getVacunaciones, getVacunas, getVacunacionById, createVacunacion, updateVacunacion, deleteVacunacion } from '../controllers/vacunacionesController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/vacunas', verifyToken, getVacunas);
router.get('/', verifyToken, getVacunaciones);
router.get('/:id', verifyToken, getVacunacionById);
router.post('/', verifyToken, createVacunacion);
router.put('/:id', verifyToken, updateVacunacion);
router.delete('/:id', verifyToken, verifyAdmin, deleteVacunacion);

export default router;