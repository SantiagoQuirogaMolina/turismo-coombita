/**
 * Rutas CRUD - Galería
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const { readData, writeData, generateId } = require('../utils/dataManager');
const { deleteOldImage } = require('../utils/imageCleanup');

const router = express.Router();

// Configurar multer para subir imágenes de galería
// Todas van a un solo directorio para evitar problemas con multer y req.body
const GALERIA_UPLOAD_DIR = path.join(__dirname, '../uploads/galeria');
if (!fs.existsSync(GALERIA_UPLOAD_DIR)) {
    fs.mkdirSync(GALERIA_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, GALERIA_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `galeria-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB para galería
    fileFilter: (req, file, cb) => {
        if (!file || !file.originalname) {
            cb(null, false);
            return;
        }
        const allowed = /jpeg|jpg|png|webp|gif/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }
});

// GET /api/galeria - Listar todos los álbumes
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    let galeria = data.galeria || [];

    // Filtrar por activo si se solicita
    if (req.query.activo === 'true') {
        galeria = galeria.filter(a => a.activo);
    }

    res.json(galeria);
});

// GET /api/galeria/:id - Obtener un álbum
router.get('/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const album = (data.galeria || []).find(a => a.id === req.params.id);
    if (!album) {
        return res.status(404).json({ error: 'Álbum no encontrado' });
    }

    res.json(album);
});

// POST /api/galeria - Crear álbum
router.post('/', verifyToken, upload.single('portada'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.galeria) data.galeria = [];

    const nuevoAlbum = {
        id: generateId(),
        titulo: req.body.titulo,
        descripcion: req.body.descripcion || '',
        portada: req.file ? `/uploads/galeria/${req.file.filename}` : '',
        activo: true,
        orden: parseInt(req.body.orden) || data.galeria.length + 1,
        imagenes: [],
        creado: new Date().toISOString()
    };

    data.galeria.push(nuevoAlbum);

    if (writeData(data)) {
        res.json({ success: true, album: nuevoAlbum });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/galeria/:id - Actualizar álbum
router.put('/:id', verifyToken, upload.single('portada'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.galeria) data.galeria = [];
    const index = data.galeria.findIndex(a => a.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Álbum no encontrado' });
    }

    const albumActual = data.galeria[index];

    data.galeria[index] = {
        ...albumActual,
        titulo: req.body.titulo || albumActual.titulo,
        descripcion: req.body.descripcion ?? albumActual.descripcion,
        portada: req.file ? `/uploads/galeria/${req.file.filename}` : albumActual.portada,
        activo: req.body.activo !== undefined ? req.body.activo === 'true' : albumActual.activo,
        orden: parseInt(req.body.orden) || albumActual.orden,
        actualizado: new Date().toISOString()
    };

    if (req.file && albumActual.portada) {
        deleteOldImage(albumActual.portada);
    }

    if (writeData(data)) {
        res.json({ success: true, album: data.galeria[index] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/galeria/:id - Eliminar álbum
router.delete('/:id', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.galeria) data.galeria = [];
    const index = data.galeria.findIndex(a => a.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Álbum no encontrado' });
    }

    const eliminado = data.galeria.splice(index, 1)[0];
    // Limpiar portada e imágenes del álbum
    deleteOldImage(eliminado.portada);
    (eliminado.imagenes || []).forEach(img => deleteOldImage(img.archivo));

    if (writeData(data)) {
        res.json({ success: true, eliminado });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// ==================== IMÁGENES DENTRO DE ÁLBUMES ====================

// POST /api/galeria/:id/imagenes - Agregar imagen a álbum
router.post('/:id/imagenes', verifyToken, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.galeria) data.galeria = [];
    const album = data.galeria.find(a => a.id === req.params.id);
    if (!album) {
        return res.status(404).json({ error: 'Álbum no encontrado' });
    }

    if (!album.imagenes) album.imagenes = [];

    const nuevaImagen = {
        id: generateId(),
        titulo: req.body.titulo || 'Sin título',
        descripcion: req.body.descripcion || '',
        archivo: req.file ? `/uploads/galeria/${req.file.filename}` : '',
        activo: true,
        creado: new Date().toISOString()
    };

    album.imagenes.push(nuevaImagen);

    // Actualizar portada si es la primera imagen y no hay portada
    if (!album.portada && nuevaImagen.archivo) {
        album.portada = nuevaImagen.archivo;
    }

    if (writeData(data)) {
        res.json({ success: true, imagen: nuevaImagen });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/galeria/:albumId/imagenes/:imgId - Actualizar imagen
router.put('/:albumId/imagenes/:imgId', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.galeria) data.galeria = [];
    const album = data.galeria.find(a => a.id === req.params.albumId);
    if (!album) {
        return res.status(404).json({ error: 'Álbum no encontrado' });
    }

    const imgIndex = (album.imagenes || []).findIndex(i => i.id === req.params.imgId);
    if (imgIndex === -1) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const imgActual = album.imagenes[imgIndex];
    album.imagenes[imgIndex] = {
        ...imgActual,
        titulo: req.body.titulo ?? imgActual.titulo,
        descripcion: req.body.descripcion ?? imgActual.descripcion,
        activo: req.body.activo !== undefined ? req.body.activo === 'true' : imgActual.activo,
        actualizado: new Date().toISOString()
    };

    if (writeData(data)) {
        res.json({ success: true, imagen: album.imagenes[imgIndex] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/galeria/:albumId/imagenes/:imgId - Eliminar imagen
router.delete('/:albumId/imagenes/:imgId', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.galeria) data.galeria = [];
    const album = data.galeria.find(a => a.id === req.params.albumId);
    if (!album) {
        return res.status(404).json({ error: 'Álbum no encontrado' });
    }

    const imgIndex = (album.imagenes || []).findIndex(i => i.id === req.params.imgId);
    if (imgIndex === -1) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    const eliminada = album.imagenes.splice(imgIndex, 1)[0];
    deleteOldImage(eliminada.archivo);

    if (writeData(data)) {
        res.json({ success: true, eliminada });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// POST /api/galeria/:id/set-portada - Establecer portada del álbum
router.post('/:id/set-portada', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.galeria) data.galeria = [];
    const album = data.galeria.find(a => a.id === req.params.id);
    if (!album) {
        return res.status(404).json({ error: 'Álbum no encontrado' });
    }

    album.portada = req.body.portada || '';

    if (writeData(data)) {
        res.json({ success: true, album });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

module.exports = router;
