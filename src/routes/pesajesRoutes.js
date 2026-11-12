import { Router } from 'express';
import { getPesajes, getPesajeById, createPesaje, updatePesaje, deletePesaje } from '../controllers/pesajesController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', verifyToken, getPesajes);
router.get('/:id', verifyToken, getPesajeById);
router.post('/', verifyToken, createPesaje);
router.put('/:id', verifyToken, updatePesaje);
router.delete('/:id', verifyToken, verifyAdmin, deletePesaje);

export default router;