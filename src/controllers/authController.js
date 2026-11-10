import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = rows[0];
    const passwordIsValid = bcrypt.compareSync(password, user.contraseña);

    if (!passwordIsValid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Genera el token JWT exigido por la cátedra
    const token = jwt.sign({ id: user.id, rol: user.rol }, 'super_secreto_ganadero', { expiresIn: '8h' });
    res.status(200).json({ token, user: { nombre: user.nombre, rol: user.rol } });
    
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};

export const register = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    // 1. Verifica si el email ya existe
    const [existing] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'El email ya está registrado' });

    // 2. Encripta la contraseña con bcrypt (Requisito obligatorio)
    const hash = bcrypt.hashSync(password, 10);
    
    // 3. Guarda el usuario en MySQL (El rol debe ser 'Administrador' o 'Peón')
    await pool.query('INSERT INTO Usuario (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)', 
      [nombre, email, hash, rol || 'Peón']
    );

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};