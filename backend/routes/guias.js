/**
 * Rutas CRUD - Guías Turísticos
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const { readData, writeData, generateId, updateStats } = require('../utils/dataManager');

const router = express.Router();

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/guias'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `guia-${Date.now()}${ext}`);
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

// GET /api/guias - Listar todos
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }
    res.json(data.guias || []);
});

// GET /api/guias/:id - Obtener uno
router.get('/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const guia = data.guias.find(g => g.id === req.params.id);
    if (!guia) {
        return res.status(404).json({ error: 'Guía no encontrado' });
    }

    res.json(guia);
});

// POST /api/guias - Crear nuevo
router.post('/', verifyToken, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const nuevoGuia = {
        id: generateId(),
        nombre: req.body.nombre,
        especialidad: req.body.especialidad || '',
        descripcion: req.body.descripcion || '',
        telefono: req.body.telefono || '',
        whatsapp: req.body.whatsapp || '',
        email: req.body.email || '',
        experiencia: req.body.experiencia || '',
        idiomas: req.body.idiomas || '',
        certificaciones: req.body.certificaciones || '',
        rutas_conocidas: req.body.rutas_conocidas || '',
        ubicacion: req.body.ubicacion || '',
        redes_sociales: {
            facebook: req.body.facebook || '',
            instagram: req.body.instagram || '',
            tiktok: req.body.tiktok || '',
            youtube: req.body.youtube || ''
        },
        imagen: req.file ? `/uploads/guias/${req.file.filename}` : '',
        activo: true,
        creado: new Date().toISOString()
    };

    if (!data.guias) {
        data.guias = [];
    }

    data.guias.push(nuevoGuia);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, guia: nuevoGuia });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/guias/:id - Actualizar
router.put('/:id', verifyToken, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.guias.findIndex(g => g.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Guía no encontrado' });
    }

    const guiaActual = data.guias[index];

    // Construir redes sociales
    const redes_sociales = {
        facebook: req.body.facebook ?? guiaActual.redes_sociales?.facebook ?? '',
        instagram: req.body.instagram ?? guiaActual.redes_sociales?.instagram ?? '',
        tiktok: req.body.tiktok ?? guiaActual.redes_sociales?.tiktok ?? '',
        youtube: req.body.youtube ?? guiaActual.redes_sociales?.youtube ?? ''
    };

    data.guias[index] = {
        ...guiaActual,
        nombre: req.body.nombre || guiaActual.nombre,
        especialidad: req.body.especialidad ?? guiaActual.especialidad ?? '',
        descripcion: req.body.descripcion ?? guiaActual.descripcion ?? '',
        telefono: req.body.telefono ?? guiaActual.telefono ?? '',
        whatsapp: req.body.whatsapp ?? guiaActual.whatsapp ?? '',
        email: req.body.email ?? guiaActual.email ?? '',
        experiencia: req.body.experiencia ?? guiaActual.experiencia ?? '',
        idiomas: req.body.idiomas ?? guiaActual.idiomas ?? '',
        certificaciones: req.body.certificaciones ?? guiaActual.certificaciones ?? '',
        rutas_conocidas: req.body.rutas_conocidas ?? guiaActual.rutas_conocidas ?? '',
        ubicacion: req.body.ubicacion ?? guiaActual.ubicacion ?? '',
        redes_sociales,
        imagen: req.file ? `/uploads/guias/${req.file.filename}` : guiaActual.imagen,
        activo: req.body.activo !== undefined ? req.body.activo === 'true' : guiaActual.activo,
        actualizado: new Date().toISOString()
    };

    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, guia: data.guias[index] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/guias/:id - Eliminar
router.delete('/:id', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.guias.findIndex(g => g.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Guía no encontrado' });
    }

    const eliminado = data.guias.splice(index, 1)[0];
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, eliminado });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

module.exports = router;
