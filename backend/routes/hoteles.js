/**
 * Rutas CRUD - Hoteles/Hospedajes
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { readData, writeData, generateId, updateStats } = require('../utils/dataManager');
const { validateHotel } = require('../utils/validation');
const { deleteOldImage } = require('../utils/imageCleanup');

const router = express.Router();

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/hoteles'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `hotel-${Date.now()}${ext}`);
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

// GET /api/hoteles - Listar todos
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    let items = data.hoteles || [];

    // Búsqueda por texto
    if (req.query.search) {
        const s = req.query.search.toLowerCase();
        items = items.filter(h =>
            (h.nombre || '').toLowerCase().includes(s) ||
            (h.tipo || '').toLowerCase().includes(s) ||
            (h.categoria || '').toLowerCase().includes(s)
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

// GET /api/hoteles/:id - Obtener uno
router.get('/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const hotel = data.hoteles.find(h => h.id === req.params.id);
    if (!hotel) {
        return res.status(404).json({ error: 'Hotel no encontrado' });
    }

    res.json(hotel);
});

// POST /api/hoteles - Crear nuevo
router.post('/', verifyToken, requireAdmin, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const errors = validateHotel(req.body);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    // Construir array de servicios desde checkboxes
    const servicios = [];
    if (req.body.servicio_wifi) servicios.push('WiFi');
    if (req.body.servicio_tv) servicios.push('TV Cable');
    if (req.body.servicio_parking) servicios.push('Parqueadero');
    if (req.body.servicio_agua_caliente) servicios.push('Agua caliente');
    if (req.body.servicio_cocina) servicios.push('Cocina');
    if (req.body.servicio_jardin) servicios.push('Jardín');
    if (req.body.servicio_desayuno) servicios.push('Desayuno');
    if (req.body.servicio_spa) servicios.push('Spa');
    if (req.body.servicio_jacuzzi) servicios.push('Jacuzzi');
    if (req.body.servicio_chimenea) servicios.push('Chimenea');

    // Agregar otros servicios si existen
    if (req.body.servicios_otros) {
        const otros = req.body.servicios_otros.split(',').map(s => s.trim()).filter(s => s);
        servicios.push(...otros);
    }

    const nuevoHotel = {
        id: generateId(),
        nombre: req.body.nombre,
        tipo: req.body.tipo || 'Hotel',
        categoria: req.body.categoria || 'hotel', // hotel, posada, glamping, camping
        direccion: req.body.direccion || '',
        descripcion: req.body.descripcion || '',
        telefono: req.body.telefono || '',
        whatsapp: req.body.whatsapp || '',
        correo: req.body.correo || '',
        habitaciones: parseInt(req.body.habitaciones) || 0,
        capacidad: parseInt(req.body.capacidad) || 0,
        calificacion: parseFloat(req.body.calificacion) || 4.0,
        precio_badge: req.body.precio_badge || 'Estándar',
        tarifas_texto: req.body.tarifas_texto || '',
        servicios: servicios,
        redes_sociales: {
            facebook: req.body.facebook || '',
            instagram: req.body.instagram || '',
            tiktok: req.body.tiktok || '',
            youtube: req.body.youtube || ''
        },
        imagen: req.file ? `/uploads/hoteles/${req.file.filename}` : '',
        activo: true,
        creado: new Date().toISOString()
    };

    data.hoteles.push(nuevoHotel);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, hotel: nuevoHotel });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/hoteles/:id - Actualizar
router.put('/:id', verifyToken, requireAdmin, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.hoteles.findIndex(h => h.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Hotel no encontrado' });
    }

    const hotelActual = data.hoteles[index];

    const errors = validateHotel(req.body, true);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    // Construir array de servicios desde checkboxes
    let servicios = hotelActual.servicios || [];
    const hasServiceFields = req.body.servicio_wifi !== undefined ||
                             req.body.servicio_tv !== undefined ||
                             req.body.servicio_parking !== undefined;

    if (hasServiceFields) {
        servicios = [];
        if (req.body.servicio_wifi) servicios.push('WiFi');
        if (req.body.servicio_tv) servicios.push('TV Cable');
        if (req.body.servicio_parking) servicios.push('Parqueadero');
        if (req.body.servicio_agua_caliente) servicios.push('Agua caliente');
        if (req.body.servicio_cocina) servicios.push('Cocina');
        if (req.body.servicio_jardin) servicios.push('Jardín');
        if (req.body.servicio_desayuno) servicios.push('Desayuno');
        if (req.body.servicio_spa) servicios.push('Spa');
        if (req.body.servicio_jacuzzi) servicios.push('Jacuzzi');
        if (req.body.servicio_chimenea) servicios.push('Chimenea');

        if (req.body.servicios_otros) {
            const otros = req.body.servicios_otros.split(',').map(s => s.trim()).filter(s => s);
            servicios.push(...otros);
        }
    }

    // Construir redes sociales
    const redes_sociales = {
        facebook: req.body.facebook ?? hotelActual.redes_sociales?.facebook ?? '',
        instagram: req.body.instagram ?? hotelActual.redes_sociales?.instagram ?? '',
        tiktok: req.body.tiktok ?? hotelActual.redes_sociales?.tiktok ?? '',
        youtube: req.body.youtube ?? hotelActual.redes_sociales?.youtube ?? ''
    };

    data.hoteles[index] = {
        ...hotelActual,
        nombre: req.body.nombre || hotelActual.nombre,
        tipo: req.body.tipo ?? hotelActual.tipo ?? 'Hotel',
        categoria: req.body.categoria ?? hotelActual.categoria ?? 'hotel',
        direccion: req.body.direccion ?? hotelActual.direccion,
        descripcion: req.body.descripcion ?? hotelActual.descripcion ?? '',
        telefono: req.body.telefono ?? hotelActual.telefono,
        whatsapp: req.body.whatsapp ?? hotelActual.whatsapp ?? '',
        correo: req.body.correo ?? hotelActual.correo,
        habitaciones: parseInt(req.body.habitaciones) || hotelActual.habitaciones,
        capacidad: parseInt(req.body.capacidad) || hotelActual.capacidad,
        calificacion: parseFloat(req.body.calificacion) || hotelActual.calificacion || 4.0,
        precio_badge: req.body.precio_badge ?? hotelActual.precio_badge ?? 'Estándar',
        tarifas_texto: req.body.tarifas_texto ?? hotelActual.tarifas_texto ?? '',
        servicios,
        redes_sociales,
        imagen: req.file ? `/uploads/hoteles/${req.file.filename}` : hotelActual.imagen,
        activo: req.body.activo !== undefined ? req.body.activo === 'true' : hotelActual.activo,
        actualizado: new Date().toISOString()
    };

    if (req.file && hotelActual.imagen) {
        deleteOldImage(hotelActual.imagen);
    }

    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, hotel: data.hoteles[index] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/hoteles/:id - Eliminar
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const index = data.hoteles.findIndex(h => h.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Hotel no encontrado' });
    }

    const eliminado = data.hoteles.splice(index, 1)[0];
    deleteOldImage(eliminado.imagen);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, eliminado });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

module.exports = router;
