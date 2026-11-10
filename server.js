import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import animalesRoutes from './src/routes/animalesRoutes.js';
import potrerosRoutes from './src/routes/potrerosRoutes.js';
import movimientosRoutes from './src/routes/movimientosRoutes.js';
import vacunacionesRoutes from './src/routes/vacunacionesRoutes.js';

const app = express(); // <-- ACÁ SE CREA LA APP

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas (siempre van debajo de la creación de la app)
app.use('/api/auth', authRoutes);
app.use('/api/animales', animalesRoutes);
app.use('/api/potreros', potrerosRoutes);
app.use('/api/movimientos', movimientosRoutes);
app.use('/api/vacunaciones', vacunacionesRoutes);

// Inicio del servidor
app.listen(3000, () => console.log('Servidor Backend en puerto 3000'));