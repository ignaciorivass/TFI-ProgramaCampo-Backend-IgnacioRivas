import { Router } from 'express';
import { getPotreros, getPotreroById, createPotrero, updatePotrero, deletePotrero } from '../controllers/potrerosController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', verifyToken, getPotreros);
router.get('/:id', verifyToken, getPotreroById);
router.post('/', verifyToken, createPotrero);
router.put('/:id', verifyToken, updatePotrero);
router.delete('/:id', verifyToken, verifyAdmin, deletePotrero);

export default router;