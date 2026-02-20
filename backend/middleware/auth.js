/**
 * Middleware de Autenticación
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET no está configurado en las variables de entorno');
    process.exit(1);
}

// Verificar token JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
}

// Verificar rol de admin
function requireAdmin(req, res, next) {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
}

// Generar token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

module.exports = {
    verifyToken,
    requireAdmin,
    generateToken
};
