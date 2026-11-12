// Importa la libreria para encriptar contraseñas.
import bcrypt from 'bcryptjs';

// Importa la libreria para crear tokens JWT.
import jwt from 'jsonwebtoken';

// Importa la conexion a la base de datos.
import pool from '../db.js';

// Inicia sesion verificando si el email y la contraseña son correctos.
export const login = async (req, res) => {
  // Extrae email y password desde el cuerpo de la peticion.
  const { email, password } = req.body;

  try {
    // Busca el usuario por su email en la tabla Usuario.
    const [rows] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);

    // Si no existe ningun usuario con ese email, responde 404.
    if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = rows[0];

    // Compara la contraseña ingresada con la contraseña encriptada guardada en la BD.
    const passwordIsValid = bcrypt.compareSync(password, user.contraseña);

    // Si la contraseña no coincide, rechaza el acceso.
    if (!passwordIsValid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // Genera un token JWT con el id y el rol del usuario.
    // Este token permite identificar al usuario en las rutas protegidas.
    const token = jwt.sign({ id: user.id, rol: user.rol }, 'super_secreto_ganadero', { expiresIn: '8h' });

    // Devuelve el token y algunos datos del usuario al frontend.
    res.status(200).json({ token, user: { nombre: user.nombre, rol: user.rol } });
  } catch (error) {
    // Si ocurre un error en la consulta o validacion, responde con error 500.
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Registra un nuevo usuario en la base de datos.
export const register = async (req, res) => {
  // Extrae nombre, email, password y rol desde la peticion.
  const { nombre, email, password, rol } = req.body;

  try {
    // 1. Verifica si el email ya existe antes de registrar.
    const [existing] = await pool.query('SELECT * FROM Usuario WHERE email = ?', [email]);

    // Si ya existe, rechaza el registro.
    if (existing.length > 0) return res.status(400).json({ message: 'El email ya está registrado' });

    // 2. Encripta la contraseña con bcrypt para guardarla de forma segura.
    const hash = bcrypt.hashSync(password, 10);

    // 3. Inserta al usuario en la tabla Usuario.
    // El rol por defecto es 'Peón' si no se manda uno.
    await pool.query('INSERT INTO Usuario (nombre, email, contraseña, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, hash, rol || 'Peón']
    );

    // Responde con confirmacion de registro.
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    // Si falla la insercion, responde con error 500.
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};