import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './src/routes/authRoutes.js';
import animalesRoutes from './src/routes/animalesRoutes.js';
import potrerosRoutes from './src/routes/potrerosRoutes.js';
import movimientosRoutes from './src/routes/movimientosRoutes.js';
import vacunacionesRoutes from './src/routes/vacunacionesRoutes.js';
import pesajesRoutes from './src/routes/pesajesRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/animales', animalesRoutes);
app.use('/api/potreros', potrerosRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/vacunaciones', vacunacionesRoutes);
app.use('/api/pesajes', pesajesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});