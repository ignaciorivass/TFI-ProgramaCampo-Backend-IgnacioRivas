// Crea (o actualiza) el usuario administrador inicial.
// Uso:  npm run seed
// Después se puede iniciar sesión con el email y la contraseña de abajo (cambiala cuando quieras).
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from './db.js';

const ADMIN = {
  nombre: 'Administrador',
  email: 'admin@campo.com',
  password: 'Admin123',
  rol: 'Administrador',
};

try {
  // La contraseña se guarda siempre como hash bcrypt, igual que en el registro.
  const hash = await bcrypt.hash(ADMIN.password, 10);
  // Si el email ya existe, se actualiza la contraseña y el rol en vez de fallar por duplicado.
  await pool.query(
    `INSERT INTO usuario (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE contraseña = VALUES(contraseña), rol = VALUES(rol)`,
    [ADMIN.nombre, ADMIN.email, hash, ADMIN.rol]
  );
  console.log('Administrador listo ->', ADMIN.email, '/', ADMIN.password);
} catch (error) {
  console.error('No se pudo crear el administrador:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
