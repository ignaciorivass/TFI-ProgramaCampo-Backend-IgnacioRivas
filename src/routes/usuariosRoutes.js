import { Router } from 'express';
import { deleteUsuario, getUsuarios } from '../controllers/usuariosController.js';
import { verifyAdmin, verifyToken } from '../middlewares/auth.js';

const router = Router();

router.get('/', verifyToken, verifyAdmin, getUsuarios);
router.delete('/:id', verifyToken, verifyAdmin, deleteUsuario);

export default router;
