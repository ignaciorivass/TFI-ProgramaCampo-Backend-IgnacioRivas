import { Router } from 'express';
import { consultarChatbot } from '../controllers/chatbotController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.post('/consultar', verifyToken, consultarChatbot);

export default router;
