import { Router } from 'express';
import { getMovimientos, createMovimiento, deleteMovimiento } from '../controllers/movimientosController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = Router();
router.get('/', verifyToken, getMovimientos);
router.post('/', verifyToken, createMovimiento);
router.delete('/:id', verifyToken, verifyAdmin, deleteMovimiento);

export default router;