// Importa el router de Express.
import { Router } from 'express';

// Importa las funciones del controlador de autenticacion.
import { login, register } from '../controllers/authController.js';

const router = Router();

// Ruta para iniciar sesion con email y password.
router.post('/login', login);

// Ruta para registrar un nuevo usuario.
router.post('/register', register); // Nueva ruta habilitada

export default router;