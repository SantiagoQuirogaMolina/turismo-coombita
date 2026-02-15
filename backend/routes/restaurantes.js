/**
 * Rutas CRUD - Restaurantes
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
        cb(null, path.join(__dirname, '../uploads/restaurantes'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `restaurante-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// GET /api/restaurantes - Listar todos
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }
    res.json(data.restaurantes || []);
});

// GET /api/restaurantes/:id - Obtener uno
router.get('/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const restaurante = data.restaurantes.find(r => r.id === req.params.id);
    if (!restaurante) {
        return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    res.json(restaurante);
});

// POST /api/restaurantes - Crear nuevo
router.post('/', verifyToken, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const nuevoRestaurante = {
        id: generateId(),
        nombre: req.body.nombre,
        tipo_cocina: req.body.tipo_cocina || 'Típica Boyacense',
        aforo: parseInt(req.body.aforo) || 0,
        especialidad: req.body.especialidad || '',
        propietario: req.body.propietario || '',
        direccion: req.body.direccion || '',
        ubicacion: req.body.ubicacion || 'Centro',
        telefono: req.body.telefono || '',
        whatsapp: req.body.whatsapp || '',
        correo: req.body.correo || '',
        horario: req.body.horario || '',
        precio_promedio: parseInt(req.body.precio_promedio) || 25000,
        redes_sociales: {
            facebook: req.body.facebook || '',
            instagram: req.body.instagram || '',
            tiktok: req.body.tiktok || '',
            youtube: req.body.youtube || ''
        },
        imagen: req.file ? `/uploads/restaurantes/${req.file.filename}` : '',
        activo: true,
        creado: new Date().toISOString()
    };

    data.restaurantes.push(nuevoRestaurante);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, restaurante: nuevoRestaurante });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/restaurantes/:id - Actualizar
router.put('/:id', verifyToken, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.restaurantes.findIndex(r => r.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    const restauranteActual = data.restaurantes[index];

    // Construir redes sociales
    const redes_sociales = {
        facebook: req.body.facebook ?? restauranteActual.redes_sociales?.facebook ?? '',
        instagram: req.body.instagram ?? restauranteActual.redes_sociales?.instagram ?? '',
        tiktok: req.body.tiktok ?? restauranteActual.redes_sociales?.tiktok ?? '',
        youtube: req.body.youtube ?? restauranteActual.redes_sociales?.youtube ?? ''
    };

    data.restaurantes[index] = {
        ...restauranteActual,
        nombre: req.body.nombre || restauranteActual.nombre,
        tipo_cocina: req.body.tipo_cocina ?? restauranteActual.tipo_cocina ?? 'Típica Boyacense',
        aforo: parseInt(req.body.aforo) || restauranteActual.aforo,
        especialidad: req.body.especialidad ?? restauranteActual.especialidad,
        propietario: req.body.propietario ?? restauranteActual.propietario,
        direccion: req.body.direccion ?? restauranteActual.direccion,
        ubicacion: req.body.ubicacion ?? restauranteActual.ubicacion ?? 'Centro',
        telefono: req.body.telefono ?? restauranteActual.telefono,
        whatsapp: req.body.whatsapp ?? restauranteActual.whatsapp ?? '',
        correo: req.body.correo ?? restauranteActual.correo ?? '',
        horario: req.body.horario ?? restauranteActual.horario,
        precio_promedio: parseInt(req.body.precio_promedio) || restauranteActual.precio_promedio || 25000,
        redes_sociales,
        imagen: req.file ? `/uploads/restaurantes/${req.file.filename}` : restauranteActual.imagen,
        activo: req.body.activo !== undefined ? req.body.activo === 'true' : restauranteActual.activo,
        actualizado: new Date().toISOString()
    };

    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, restaurante: data.restaurantes[index] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/restaurantes/:id - Eliminar
router.delete('/:id', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.restaurantes.findIndex(r => r.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    const eliminado = data.restaurantes.splice(index, 1)[0];
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, eliminado });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

module.exports = router;
