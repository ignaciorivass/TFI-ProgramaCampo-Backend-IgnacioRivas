import { Router } from 'express';
import { getAnimales, getAnimalById, createAnimal, updateAnimal, deleteAnimal } from '../controllers/animalesController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', verifyToken, getAnimales);
router.get('/:id', verifyToken, getAnimalById);
router.post('/', verifyToken, createAnimal);
router.put('/:id', verifyToken, updateAnimal);
router.delete('/:id', verifyToken, verifyAdmin, deleteAnimal);

export default router;