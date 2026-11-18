import express from 'express';
import {
  getMovimientos,
  getMovimientoById,
  createMovimiento,
  updateMovimiento,
  deleteMovimiento,
} from '../controllers/movimientosController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Todas las operaciones requieren token; el borrado queda reservado a administradores.
router.get('/', verifyToken, getMovimientos);
router.get('/:id', verifyToken, getMovimientoById);
router.post('/', verifyToken, createMovimiento);
router.put('/:id', verifyToken, updateMovimiento);
router.delete('/:id', verifyToken, verifyAdmin, deleteMovimiento);

export default router;