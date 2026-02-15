/**
 * Rutas de Autenticación
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { generateToken, verifyToken } = require('../middleware/auth');

const router = express.Router();
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Inicializar archivo de usuarios si no existe
function initUsersFile() {
    if (!fs.existsSync(USERS_FILE)) {
        const defaultAdmin = {
            users: [
                {
                    id: '1',
                    nombre: 'Administrador',
                    email: 'admin@turismocombita.com',
                    password: bcrypt.hashSync('admin123', 10),
                    rol: 'admin',
                    creado: new Date().toISOString()
                }
            ]
        };
        fs.writeFileSync(USERS_FILE, JSON.stringify(defaultAdmin, null, 2));
    }
}

// Leer usuarios
function readUsers() {
    initUsersFile();
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

// Guardar usuarios
function saveUsers(data) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const data = readUsers();
    const user = data.users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    res.json({
        success: true,
        token,
        user: {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        }
    });
});

// GET /api/auth/me - Obtener usuario actual
router.get('/me', verifyToken, (req, res) => {
    res.json({ user: req.user });
});

// POST /api/auth/cambiar-password
router.post('/cambiar-password', verifyToken, (req, res) => {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
        return res.status(400).json({ error: 'Contraseñas requeridas' });
    }

    const data = readUsers();
    const userIndex = data.users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = bcrypt.compareSync(passwordActual, data.users[userIndex].password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    data.users[userIndex].password = bcrypt.hashSync(passwordNueva, 10);
    saveUsers(data);

    res.json({ success: true, message: 'Contraseña actualizada' });
});

// POST /api/auth/crear-usuario (solo admin)
router.post('/crear-usuario', verifyToken, (req, res) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'No autorizado' });
    }

    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const data = readUsers();

    if (data.users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const newUser = {
        id: Date.now().toString(),
        nombre,
        email,
        password: bcrypt.hashSync(password, 10),
        rol: rol || 'editor',
        creado: new Date().toISOString()
    };

    data.users.push(newUser);
    saveUsers(data);

    res.json({
        success: true,
        user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, rol: newUser.rol }
    });
});

module.exports = router;
