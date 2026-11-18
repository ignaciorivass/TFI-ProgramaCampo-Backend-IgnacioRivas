import express from 'express';
import { getVacunaciones, getVacunas, getVacunacionById, createVacunacion, updateVacunacion, deleteVacunacion } from '../controllers/vacunacionesController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Las rutas mas especificas se declaran antes de /:id para evitar interpretaciones ambiguas.
router.get('/vacunas', verifyToken, getVacunas);
// El resto del historial requiere token y el borrado tambien requiere rol administrador.
router.get('/', verifyToken, getVacunaciones);
router.get('/:id', verifyToken, getVacunacionById);
router.post('/', verifyToken, createVacunacion);
router.put('/:id', verifyToken, updateVacunacion);
router.delete('/:id', verifyToken, verifyAdmin, deleteVacunacion);

export default router;