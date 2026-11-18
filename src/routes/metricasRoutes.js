import { Router } from 'express';
import {
  getResumen,
  getNacimientosPorMes,
  getAnimalesPorPotrero,
  getAnimalesPorRaza,
  getVacunacionesPorVacuna,
  getUltimosAnimales,
} from '../controllers/metricasController.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

// Todas las métricas requieren sesión válida; cualquier rol puede consultarlas.
router.get('/resumen', verifyToken, getResumen);
router.get('/nacimientos-por-mes', verifyToken, getNacimientosPorMes);
router.get('/animales-por-potrero', verifyToken, getAnimalesPorPotrero);
router.get('/animales-por-raza', verifyToken, getAnimalesPorRaza);
router.get('/vacunaciones-por-vacuna', verifyToken, getVacunacionesPorVacuna);
router.get('/ultimos-animales', verifyToken, getUltimosAnimales);

export default router;
