/**
 * Rutas CRUD - Artesanos
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { readData, writeData, generateId, updateStats } = require('../utils/dataManager');
const { validateArtesano } = require('../utils/validation');
const { deleteOldImage } = require('../utils/imageCleanup');

const router = express.Router();

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/artesanos'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `artesano-${Date.now()}${ext}`);
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

// GET /api/artesanos - Listar todos
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    let items = data.artesanos || [];

    // Búsqueda por texto
    if (req.query.search) {
        const s = req.query.search.toLowerCase();
        items = items.filter(a =>
            (a.nombre || '').toLowerCase().includes(s) ||
            (a.especialidad || '').toLowerCase().includes(s)
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

// GET /api/artesanos/:id - Obtener uno
router.get('/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const artesano = (data.artesanos || []).find(a => a.id === req.params.id);
    if (!artesano) {
        return res.status(404).json({ error: 'Artesano no encontrado' });
    }

    res.json(artesano);
});

// POST /api/artesanos - Crear nuevo
router.post('/', verifyToken, requireAdmin, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.artesanos) {
        data.artesanos = [];
    }

    const errors = validateArtesano(req.body);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    const nuevoArtesano = {
        id: generateId(),
        nombre: req.body.nombre,
        especialidad: req.body.especialidad || '',
        descripcion: req.body.descripcion || '',
        telefono: req.body.telefono || '',
        whatsapp: req.body.whatsapp || '',
        email: req.body.email || '',
        ubicacion: req.body.ubicacion || '',
        redes_sociales: {
            facebook: req.body.facebook || '',
            instagram: req.body.instagram || '',
            tiktok: req.body.tiktok || '',
            youtube: req.body.youtube || ''
        },
        imagen: req.file ? `/uploads/artesanos/${req.file.filename}` : '',
        activo: true,
        creado: new Date().toISOString()
    };

    data.artesanos.push(nuevoArtesano);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, artesano: nuevoArtesano });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/artesanos/:id - Actualizar
router.put('/:id', verifyToken, requireAdmin, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.artesanos.findIndex(a => a.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Artesano no encontrado' });
    }

    const artesanoActual = data.artesanos[index];

    const errors = validateArtesano(req.body, true);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    // Construir redes sociales
    const redes_sociales = {
        facebook: req.body.facebook ?? artesanoActual.redes_sociales?.facebook ?? '',
        instagram: req.body.instagram ?? artesanoActual.redes_sociales?.instagram ?? '',
        tiktok: req.body.tiktok ?? artesanoActual.redes_sociales?.tiktok ?? '',
        youtube: req.body.youtube ?? artesanoActual.redes_sociales?.youtube ?? ''
    };

    data.artesanos[index] = {
        ...artesanoActual,
        nombre: req.body.nombre || artesanoActual.nombre,
        especialidad: req.body.especialidad ?? artesanoActual.especialidad ?? '',
        descripcion: req.body.descripcion ?? artesanoActual.descripcion ?? '',
        telefono: req.body.telefono ?? artesanoActual.telefono ?? '',
        whatsapp: req.body.whatsapp ?? artesanoActual.whatsapp ?? '',
        email: req.body.email ?? artesanoActual.email ?? '',
        ubicacion: req.body.ubicacion ?? artesanoActual.ubicacion ?? '',
        redes_sociales,
        imagen: req.file ? `/uploads/artesanos/${req.file.filename}` : artesanoActual.imagen,
        activo: req.body.activo !== undefined ? req.body.activo === 'true' : artesanoActual.activo,
        actualizado: new Date().toISOString()
    };

    if (req.file && artesanoActual.imagen) {
        deleteOldImage(artesanoActual.imagen);
    }

    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, artesano: data.artesanos[index] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/artesanos/:id - Eliminar
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.artesanos.findIndex(a => a.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Artesano no encontrado' });
    }

    const eliminado = data.artesanos.splice(index, 1)[0];
    deleteOldImage(eliminado.imagen);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, eliminado });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

module.exports = router;
