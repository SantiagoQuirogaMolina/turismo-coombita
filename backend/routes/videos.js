/**
 * Rutas CRUD - Videos de YouTube
 */

const express = require('express');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { readData, writeData, generateId, updateStats } = require('../utils/dataManager');
const { validateVideo } = require('../utils/validation');

const router = express.Router();

// GET /api/videos - Listar todos
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    let items = data.videos || [];

    // Filtrar por activo
    if (req.query.activo === 'true') {
        items = items.filter(v => v.activo !== false);
    }

    // Ordenar por campo orden
    items.sort((a, b) => (a.orden || 0) - (b.orden || 0));

    // Búsqueda por texto
    if (req.query.search) {
        const s = req.query.search.toLowerCase();
        items = items.filter(v =>
            (v.titulo || '').toLowerCase().includes(s) ||
            (v.descripcion || '').toLowerCase().includes(s)
        );
    }

    res.json(items);
});

// GET /api/videos/:id - Obtener uno
router.get('/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const video = (data.videos || []).find(v => v.id === req.params.id);
    if (!video) {
        return res.status(404).json({ error: 'Video no encontrado' });
    }

    res.json(video);
});

// POST /api/videos - Crear nuevo
router.post('/', verifyToken, requireAdmin, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.videos) {
        data.videos = [];
    }

    const errors = validateVideo(req.body);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    const nuevoVideo = {
        id: generateId(),
        titulo: req.body.titulo.trim(),
        youtube_url: req.body.youtube_url.trim(),
        descripcion: (req.body.descripcion || '').trim(),
        activo: req.body.activo !== undefined ? req.body.activo === true || req.body.activo === 'true' : true,
        orden: parseInt(req.body.orden) || data.videos.length + 1,
        creado: new Date().toISOString()
    };

    data.videos.push(nuevoVideo);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, video: nuevoVideo });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/videos/:id - Actualizar
router.put('/:id', verifyToken, requireAdmin, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = (data.videos || []).findIndex(v => v.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Video no encontrado' });
    }

    const videoActual = data.videos[index];

    const errors = validateVideo(req.body, true);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    data.videos[index] = {
        ...videoActual,
        titulo: req.body.titulo ? req.body.titulo.trim() : videoActual.titulo,
        youtube_url: req.body.youtube_url ? req.body.youtube_url.trim() : videoActual.youtube_url,
        descripcion: req.body.descripcion !== undefined ? req.body.descripcion.trim() : videoActual.descripcion,
        activo: req.body.activo !== undefined ? req.body.activo === true || req.body.activo === 'true' : videoActual.activo,
        orden: req.body.orden !== undefined ? parseInt(req.body.orden) || videoActual.orden : videoActual.orden,
        actualizado: new Date().toISOString()
    };

    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, video: data.videos[index] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/videos/:id - Eliminar
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = (data.videos || []).findIndex(v => v.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Video no encontrado' });
    }

    const eliminado = data.videos.splice(index, 1)[0];
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, eliminado });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

module.exports = router;
