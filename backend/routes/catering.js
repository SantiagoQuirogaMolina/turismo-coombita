/**
 * Rutas CRUD - Catering y Celebraciones
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { readData, writeData, generateId, updateStats } = require('../utils/dataManager');
const { validateCatering } = require('../utils/validation');
const { deleteOldImage } = require('../utils/imageCleanup');

const router = express.Router();

// Configurar multer para subir imágenes
const CATERING_UPLOAD_DIR = path.join(__dirname, '../uploads/catering');
if (!fs.existsSync(CATERING_UPLOAD_DIR)) {
    fs.mkdirSync(CATERING_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, CATERING_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `catering-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
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
            cb(null, false);
        }
    }
});

// Construye el array de tipos_servicio desde checkboxes del form
function construirTiposServicio(body) {
    const tipos = [];
    if (body.tipo_eventos) tipos.push('Eventos');
    if (body.tipo_catering) tipos.push('Catering');
    if (body.tipo_seminarios) tipos.push('Seminarios');
    if (body.tipo_celebraciones) tipos.push('Celebraciones');
    if (body.tipo_empresariales) tipos.push('Eventos empresariales');
    if (body.tipo_mobiliario) tipos.push('Alquiler de mobiliario');
    if (body.tipo_logistica) tipos.push('Planificación logística y montaje');
    if (body.tipo_decoraciones) tipos.push('Decoraciones');
    if (body.tipo_personal) tipos.push('Servicio de personal');
    if (body.tipo_equipamento) tipos.push('Equipamento');

    if (body.tipos_otros) {
        const otros = body.tipos_otros.split(',').map(s => s.trim()).filter(s => s);
        tipos.push(...otros);
    }
    return tipos;
}

// Construye el array de servicios desde checkboxes del form
function construirServicios(body) {
    const servicios = [];
    if (body.servicio_wifi) servicios.push('WiFi');
    if (body.servicio_parking) servicios.push('Parqueadero');
    if (body.servicio_cocina) servicios.push('Cocina');
    if (body.servicio_jardin) servicios.push('Jardín');
    if (body.servicio_chimenea) servicios.push('Chimenea');
    if (body.servicio_proyector) servicios.push('Proyector de video');
    if (body.servicio_bbq) servicios.push('BBQ');

    if (body.servicios_otros) {
        const otros = body.servicios_otros.split(',').map(s => s.trim()).filter(s => s);
        servicios.push(...otros);
    }
    return servicios;
}

// GET /api/catering - Listar todos
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    let items = data.catering || [];

    // Búsqueda por texto
    if (req.query.search) {
        const s = req.query.search.toLowerCase();
        items = items.filter(c =>
            (c.nombre || '').toLowerCase().includes(s) ||
            (c.descripcion || '').toLowerCase().includes(s) ||
            (c.tipos_servicio || []).some(t => t.toLowerCase().includes(s))
        );
    }

    // Filtro por tipo de servicio (público y admin)
    if (req.query.tipo) {
        const t = req.query.tipo.toLowerCase();
        items = items.filter(c =>
            (c.tipos_servicio || []).some(x => x.toLowerCase().includes(t))
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

// GET /api/catering/:id - Obtener uno
router.get('/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const item = (data.catering || []).find(c => c.id === req.params.id);
    if (!item) {
        return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }

    res.json(item);
});

// POST /api/catering - Crear nuevo
router.post('/', verifyToken, requireAdmin, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.catering) data.catering = [];

    const errors = validateCatering(req.body);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    const nuevo = {
        id: generateId(),
        nombre: req.body.nombre,
        tipos_servicio: construirTiposServicio(req.body),
        direccion: req.body.direccion || '',
        ubicacion: req.body.ubicacion || '',
        maps_link: req.body.maps_link || '',
        descripcion: req.body.descripcion || '',
        aforo_total: parseInt(req.body.aforo_total) || 0,
        aforo_parqueadero: parseInt(req.body.aforo_parqueadero) || 0,
        salones_descripcion: req.body.salones_descripcion || '',
        precio_badge: req.body.precio_badge || 'Estándar',
        precio_badge_otro: req.body.precio_badge_otro || '',
        servicios: construirServicios(req.body),
        telefono: req.body.telefono || '',
        whatsapp: req.body.whatsapp || '',
        correo: req.body.correo || '',
        redes_sociales: {
            facebook: req.body.facebook || '',
            instagram: req.body.instagram || '',
            tiktok: req.body.tiktok || '',
            youtube: req.body.youtube || ''
        },
        imagen: req.file ? `/uploads/catering/${req.file.filename}` : '',
        activo: true,
        creado: new Date().toISOString()
    };

    data.catering.push(nuevo);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, catering: nuevo });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/catering/:id - Actualizar
router.put('/:id', verifyToken, requireAdmin, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.catering) data.catering = [];
    const index = data.catering.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }

    const errors = validateCatering(req.body, true);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    const actual = data.catering[index];

    // Reconstruir tipos_servicio solo si vinieron campos relacionados
    let tipos_servicio = actual.tipos_servicio || [];
    const hasTipoFields = req.body.tipo_eventos !== undefined ||
                         req.body.tipo_catering !== undefined ||
                         req.body.tipo_celebraciones !== undefined ||
                         req.body.tipos_otros !== undefined;
    if (hasTipoFields) tipos_servicio = construirTiposServicio(req.body);

    // Reconstruir servicios solo si vinieron campos relacionados
    let servicios = actual.servicios || [];
    const hasServiceFields = req.body.servicio_wifi !== undefined ||
                            req.body.servicio_parking !== undefined ||
                            req.body.servicios_otros !== undefined;
    if (hasServiceFields) servicios = construirServicios(req.body);

    const redes_sociales = {
        facebook: req.body.facebook ?? actual.redes_sociales?.facebook ?? '',
        instagram: req.body.instagram ?? actual.redes_sociales?.instagram ?? '',
        tiktok: req.body.tiktok ?? actual.redes_sociales?.tiktok ?? '',
        youtube: req.body.youtube ?? actual.redes_sociales?.youtube ?? ''
    };

    data.catering[index] = {
        ...actual,
        nombre: req.body.nombre || actual.nombre,
        tipos_servicio,
        direccion: req.body.direccion ?? actual.direccion ?? '',
        ubicacion: req.body.ubicacion ?? actual.ubicacion ?? '',
        maps_link: req.body.maps_link ?? actual.maps_link ?? '',
        descripcion: req.body.descripcion ?? actual.descripcion ?? '',
        aforo_total: req.body.aforo_total !== undefined ? (parseInt(req.body.aforo_total) || 0) : actual.aforo_total,
        aforo_parqueadero: req.body.aforo_parqueadero !== undefined ? (parseInt(req.body.aforo_parqueadero) || 0) : actual.aforo_parqueadero,
        salones_descripcion: req.body.salones_descripcion ?? actual.salones_descripcion ?? '',
        precio_badge: req.body.precio_badge ?? actual.precio_badge ?? 'Estándar',
        precio_badge_otro: req.body.precio_badge_otro ?? actual.precio_badge_otro ?? '',
        servicios,
        telefono: req.body.telefono ?? actual.telefono ?? '',
        whatsapp: req.body.whatsapp ?? actual.whatsapp ?? '',
        correo: req.body.correo ?? actual.correo ?? '',
        redes_sociales,
        imagen: req.file ? `/uploads/catering/${req.file.filename}` : actual.imagen,
        activo: req.body.activo !== undefined ? req.body.activo === 'true' : actual.activo,
        actualizado: new Date().toISOString()
    };

    if (req.file && actual.imagen) {
        deleteOldImage(actual.imagen);
    }

    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, catering: data.catering[index] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/catering/:id - Eliminar
router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.catering) data.catering = [];
    const index = data.catering.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Establecimiento no encontrado' });
    }

    const eliminado = data.catering.splice(index, 1)[0];
    deleteOldImage(eliminado.imagen);
    updateStats(data);

    if (writeData(data)) {
        res.json({ success: true, eliminado });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

module.exports = router;
