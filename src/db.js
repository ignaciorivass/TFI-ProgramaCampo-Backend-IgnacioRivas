import 'dotenv/config';
import mysql from 'mysql2/promise';

// Pool compartido: reutiliza conexiones MySQL entre las consultas de los controladores.
const pool = mysql.createPool({
  // Las variables de entorno permiten configurar la base sin cambiar el codigo.
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_ganadero',
  // Si todas las conexiones estan ocupadas, las consultas esperan en cola.
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;