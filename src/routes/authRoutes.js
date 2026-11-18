// Importa el router de Express.
import { Router } from 'express';

// Importa las funciones del controlador de autenticacion.
import { login, register } from '../controllers/authController.js';

const router = Router();

// Estas rutas son publicas: se usan para obtener acceso o crear una cuenta.
router.post('/login', login);
router.post('/register', register); // Nueva ruta habilitada

export default router;