import { Router } from 'express';
import { getPotreros, createPotrero, deletePotrero } from '../controllers/potrerosController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = Router();
router.get('/', verifyToken, getPotreros);
router.post('/', verifyToken, verifyAdmin, createPotrero);
router.delete('/:id', verifyToken, verifyAdmin, deletePotrero); 

export default router;