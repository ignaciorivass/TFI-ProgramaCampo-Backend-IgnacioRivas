import { Router } from 'express';
import { getAnimales, createAnimal, deleteAnimal } from '../controllers/animalesController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', verifyToken, getAnimales);
router.post('/', verifyToken, createAnimal);
router.delete('/:id', verifyToken, deleteAnimal);
router.delete('/:id', verifyToken, verifyAdmin, deleteAnimal);
export default router;