import 'dotenv/config';
import jwt from 'jsonwebtoken';

// Debe coincidir con la clave usada al firmar el token en el inicio de sesion.
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_pcampo_2026';

export const verifyToken = (req, res, next) => {
  // El cliente envia el token como "Bearer <token>" en Authorization.
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verifica firma y vencimiento; la identidad queda disponible para la ruta siguiente.
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const verifyAdmin = (req, res, next) => {
  // Este middleware se ejecuta despues de verifyToken, que carga req.user.
  if (req.user?.rol !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol Administrador' });
  }
  next();
};