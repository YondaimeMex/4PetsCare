const jwt = require('jsonwebtoken');

// Middleware de autenticación con JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization']; // "Bearer token"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // guardamos info del usuario en la request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// 👇 IMPORTANTE: exportar así
module.exports = authMiddleware;
