import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/authRoutes.js';
import animalesRoutes from './src/routes/animalesRoutes.js';
import potrerosRoutes from './src/routes/potrerosRoutes.js';
import movimientosRoutes from './src/routes/movimientosRoutes.js';
import vacunacionesRoutes from './src/routes/vacunacionesRoutes.js';
import pesajesRoutes from './src/routes/pesajesRoutes.js';
import metricasRoutes from './src/routes/metricasRoutes.js';
import usuariosRoutes from './src/routes/usuariosRoutes.js';
import chatbotRoutes from './src/routes/chatbotRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Habilita llamadas desde el frontend y lectura de cuerpos JSON.
app.use(cors());
app.use(express.json());

// Cada recurso se publica bajo su prefijo /api correspondiente.
app.use('/api/auth', authRoutes);
app.use('/api/animales', animalesRoutes);
app.use('/api/potreros', potrerosRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/vacunaciones', vacunacionesRoutes);
app.use('/api/pesajes', pesajesRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/chatbot', chatbotRoutes);


// Inicia el servidor en el puerto configurado o en el 3000 por defecto.
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});