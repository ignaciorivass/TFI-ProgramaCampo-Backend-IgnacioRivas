import 'dotenv/config';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Se usa tanto para emitir tokens como para verificar su firma en el middleware.
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_pcampo_2026';

// Registra una cuenta almacenando solo el hash de la contraseña.
export const register = async (req, res) => {
  const { nombre, email } = req.body;
  const rol = req.body.rol || 'Peón';
  const rawPassword = req.body.password || req.body.contraseña;

  try {
    if (!nombre || !email || !rawPassword) {
      return res.status(400).json({ message: 'Completá nombre, correo y contraseña' });
    }

    if (!['Peón', 'Administrador'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Evita duplicar cuentas con el mismo correo.
    const [existing] = await pool.query('SELECT id FROM usuario WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // bcrypt aplica un salt (10 rondas); la contraseña original no se guarda en la BD.
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    await pool.query(
      'INSERT INTO usuario (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol]
    );

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Comprueba las credenciales y devuelve un JWT para las siguientes peticiones.
export const login = async (req, res) => {
  const { email } = req.body;
  const rawPassword = req.body.password || req.body.contraseña;

  try {
    // Los marcadores ? separan los datos del SQL y evitan concatenar valores del usuario.
    const [rows] = await pool.query('SELECT * FROM usuario WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const usuario = rows[0];
    const validPassword = await bcrypt.compare(rawPassword, usuario.contraseña);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // El token incluye los datos que necesitan las rutas protegidas y vence en 8 horas.
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};