/**
 * Servidor Turismo Cómbita
 * Sitio público + Panel de Administración
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// Confiar en proxy (Cloudflare) para rate limiting correcto
app.set('trust proxy', 1);

// Seguridad - Headers HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://maps.googleapis.com", "https://maps.gstatic.com", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            frameSrc: ["'self'", "https://www.google.com", "https://www.youtube.com", "https://youtube.com"],
            connectSrc: ["'self'", "https://maps.googleapis.com"],
            scriptSrcAttr: ["'unsafe-inline'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configurado
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001').split(',').map(s => s.trim());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Rate limiting global
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde' }
}));

// Rate limiting estricto para login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Demasiados intentos de login, intenta de nuevo en 15 minutos' }
});

// Rate limiting para formulario de contacto
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados mensajes enviados, intenta de nuevo más tarde' }
});

// Parseo de body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, '../src/assets')));
app.use('/imagenes', express.static(path.join(__dirname, '../src/assets/images')));
app.use('/admin/css', express.static(path.join(__dirname, '../admin/css')));
app.use('/admin/js', express.static(path.join(__dirname, '../admin/js')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// Rutas API
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurantes', require('./routes/restaurantes'));
app.use('/api/hoteles', require('./routes/hoteles'));
app.use('/api/eventos', require('./routes/eventos'));
app.use('/api/estadisticas', require('./routes/estadisticas'));
app.use('/api/galeria', require('./routes/galeria'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/contacto', contactLimiter);
app.use('/api/contacto', require('./routes/contacto'));
app.use('/api/artesanos', require('./routes/artesanos'));
app.use('/api/guias', require('./routes/guias'));
app.use('/api/videos', require('./routes/videos'));

// ===== PÁGINAS PÚBLICAS =====

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/pages/index.html'));
});

// Subpáginas treks (ANTES del wildcard general)
app.get('/treks/*.html', (req, res) => {
    const pageName = path.basename(req.params[0]) + '.html';
    res.sendFile(path.join(__dirname, '../src/pages/treks', pageName), err => {
        if (err) res.status(404).sendFile(path.join(__dirname, '../src/pages/index.html'));
    });
});

app.get('/treks', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/pages/treks/index.html'));
});

// Todas las páginas del sitio
app.get('/*.html', (req, res) => {
    const pageName = path.basename(req.params[0]) + '.html';
    res.sendFile(path.join(__dirname, '../src/pages', pageName), err => {
        if (err) res.status(404).sendFile(path.join(__dirname, '../src/pages/index.html'));
    });
});

// ===== PANEL ADMIN =====
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const server = app.listen(PORT, () => {
    console.log(`
    ========================================
    Servidor Turismo Cómbita
    ========================================
    Entorno:     ${process.env.NODE_ENV || 'development'}
    Puerto:      ${PORT}
    Admin Panel: /admin
    API:         /api
    ========================================
    `);
});

// Graceful shutdown
function gracefulShutdown(signal) {
    console.log(`\n${signal} recibido. Cerrando servidor...`);
    server.close(() => {
        console.log('Servidor cerrado correctamente.');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Forzando cierre tras 10s de espera.');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
