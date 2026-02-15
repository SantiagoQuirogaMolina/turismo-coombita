/**
 * Rutas CRUD - Eventos
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const { readData, writeData, generateId, updateStats } = require('../utils/dataManager');
const { validateEvento } = require('../utils/validation');
const { deleteOldImage } = require('../utils/imageCleanup');

const router = express.Router();

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/eventos'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `evento-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Si no hay archivo o el nombre está vacío, permitir (no se sube nada)
        if (!file || !file.originalname) {
            cb(null, false);
            return;
        }
        const allowed = /jpeg|jpg|png|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(null, false); // Rechazar silenciosamente en lugar de error
        }
    }
});

// GET /api/eventos - Listar todos
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    let items = data.eventos || [];

    // Búsqueda por texto
    if (req.query.search) {
        const s = req.query.search.toLowerCase();
        items = items.filter(e =>
            (e.nombre || '').toLowerCase().includes(s) ||
            (e.tipo || '').toLowerCase().includes(s) ||
            (e.ubicacion || '').toLowerCase().includes(s)
        );
    }

    // Paginación
    const total = items.length;
    if (req.query.page && req.query.limit) {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const start = (page - 1) * limit;
        items = items.slice(start, start + limit);
        return res.json({ data: items, total, page, limit, pages: Math.ceil(total / limit) });
    }

    res.json(items);
});

// GET /api/eventos/:id - Obtener uno
router.get('/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const evento = data.eventos.find(e => e.id === req.params.id);
    if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
    }

    res.json(evento);
});

// POST /api/eventos - Crear nuevo
router.post('/', verifyToken, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const errors = validateEvento(req.body);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    const nuevoEvento = {
        id: generateId(),
        nombre: req.body.nombre,
        fecha: req.body.fecha || '',
        fechaInicio: req.body.fechaInicio || '',
        fechaFin: req.body.fechaFin || '',
        descripcion: req.body.descripcion || '',
        ubicacion: req.body.ubicacion || 'Cómbita, Boyacá',
        tipo: req.body.tipo || 'cultural',
        imagen: req.file ? `/uploads/eventos/${req.file.filename}` : '',
        activo: true,
        destacado: req.body.destacado === 'true',
        creado: new Date().toISOString()
    };

    data.eventos.push(nuevoEvento);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, evento: nuevoEvento });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/eventos/:id - Actualizar
router.put('/:id', verifyToken, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.eventos.findIndex(e => e.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const eventoActual = data.eventos[index];

    const errors = validateEvento(req.body, true);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    data.eventos[index] = {
        ...eventoActual,
        nombre: req.body.nombre || eventoActual.nombre,
        fecha: req.body.fecha ?? eventoActual.fecha,
        fechaInicio: req.body.fechaInicio ?? eventoActual.fechaInicio,
        fechaFin: req.body.fechaFin ?? eventoActual.fechaFin,
        descripcion: req.body.descripcion ?? eventoActual.descripcion,
        ubicacion: req.body.ubicacion ?? eventoActual.ubicacion,
        tipo: req.body.tipo ?? eventoActual.tipo,
        imagen: req.file ? `/uploads/eventos/${req.file.filename}` : eventoActual.imagen,
        activo: req.body.activo !== undefined ? req.body.activo === 'true' : eventoActual.activo,
        destacado: req.body.destacado !== undefined ? req.body.destacado === 'true' : eventoActual.destacado,
        actualizado: new Date().toISOString()
    };

    if (req.file && eventoActual.imagen) {
        deleteOldImage(eventoActual.imagen);
    }

    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, evento: data.eventos[index] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/eventos/:id - Eliminar
router.delete('/:id', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.eventos.findIndex(e => e.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Evento no encontrado' });
    }

    const eliminado = data.eventos.splice(index, 1)[0];
    deleteOldImage(eliminado.imagen);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, eliminado });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

module.exports = router;
