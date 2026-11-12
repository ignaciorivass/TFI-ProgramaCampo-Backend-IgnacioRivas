// Importa la libreria para manejar JWT.
import jwt from 'jsonwebtoken';

// Middleware que valida que el cliente envie un token JWT valido.
// Si el token es correcto, guarda la informacion del usuario en req.user y sigue.
export const verifyToken = (req, res, next) => {
  // Lee el header Authorization, que normalmente llega como: Bearer <token>
  const authHeader = req.headers['authorization'];

  // Si no hay token, se rechaza la peticion.
  if (!authHeader) return res.status(403).json({ message: 'No se proporcionó un token' });

  // Se toma la parte del token despues del texto 'Bearer'.
  const token = authHeader.split(' ')[1];

  // Si el formato no es correcto, se rechaza.
  if (!token) return res.status(403).json({ message: 'Formato de token inválido' });

  try {
    // Verifica si el token es valido usando la clave secreta.
    const decoded = jwt.verify(token, 'super_secreto_ganadero');

    // Guarda la informacion decodificada del usuario.
    req.user = decoded;

    // Continua con la siguiente funcion.
    next();
  } catch (error) {
    // Si el token expiró o es invalido, se responde con error 401.
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware que restringe acceso solo a usuarios con rol de Administrador.
export const verifyAdmin = (req, res, next) => {
  // Si el usuario autenticado no tiene rol Administrador, se niega el acceso.
  if (req.user.rol !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado: Solo el Administrador puede realizar esta acción' });
  }

  // Si el usuario es administrador, permite continuar.
  next();
};