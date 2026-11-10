import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', 
  password: '2001', 
  database: 'sistema_ganadero',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
export default pool;