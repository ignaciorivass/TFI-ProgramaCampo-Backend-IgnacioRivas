import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ message: 'No se proporcionó un token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Formato de token inválido' });

  try {
    const decoded = jwt.verify(token, 'super_secreto_ganadero');
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user.rol !== 'Administrador') {
    return res.status(403).json({ message: 'Acceso denegado: Solo el Administrador puede realizar esta acción' });
  }
  next();
};