// Importa la libreria de MySQL para trabajar con queries asincronicos.
import mysql from 'mysql2/promise';

// Crea un pool de conexiones reutilizables hacia la base de datos.
// Esto permite abrir varias consultas sin tener que crear una conexion nueva cada vez.
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '2001',
  database: 'sistema_ganadero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exporta el pool para usarlo desde los controladores.
export default pool;