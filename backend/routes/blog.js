/**
 * Rutas CRUD - Blog
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const { verifyToken } = require('../middleware/auth');
const { readData, writeData, generateId } = require('../utils/dataManager');
const { validateBlog } = require('../utils/validation');
const { deleteOldImage } = require('../utils/imageCleanup');

// Opciones de sanitización para contenido del blog
const sanitizeOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'span', 'br', 'hr']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src', 'alt', 'width', 'height', 'style'],
        'a': ['href', 'name', 'target', 'rel'],
        'span': ['style'],
        'p': ['style'],
        '*': ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedStyles: {
        '*': {
            'color': [/.*/],
            'text-align': [/.*/],
            'font-size': [/.*/],
            'font-weight': [/.*/],
            'text-decoration': [/.*/]
        }
    }
};

const router = express.Router();

// Configurar multer para imágenes de blog
const BLOG_UPLOAD_DIR = path.join(__dirname, '../uploads/blog');
if (!fs.existsSync(BLOG_UPLOAD_DIR)) {
    fs.mkdirSync(BLOG_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, BLOG_UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `blog-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
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

// GET /api/blog - Listar publicaciones
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    let blog = data.blog || [];

    // Filtrar por activo si se solicita
    if (req.query.activo === 'true') {
        blog = blog.filter(p => p.activo);
    }

    // Filtrar por categoría
    if (req.query.categoria) {
        blog = blog.filter(p => p.categoria === req.query.categoria);
    }

    // Ordenar por fecha (más reciente primero)
    blog.sort((a, b) => new Date(b.creado) - new Date(a.creado));

    // Limitar resultados
    if (req.query.limit) {
        blog = blog.slice(0, parseInt(req.query.limit));
    }

    res.json(blog);
});

// GET /api/blog/:id - Obtener una publicación
router.get('/:id', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const post = (data.blog || []).find(p => p.id === req.params.id);
    if (!post) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    res.json(post);
});

// POST /api/blog - Crear publicación
router.post('/', verifyToken, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.blog) data.blog = [];

    const errors = validateBlog(req.body);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    const nuevoPost = {
        id: generateId(),
        titulo: req.body.titulo,
        extracto: req.body.extracto || '',
        contenido: req.body.contenido ? sanitizeHtml(req.body.contenido, sanitizeOptions) : '',
        imagen: req.file ? `/uploads/blog/${req.file.filename}` : '',
        categoria: req.body.categoria || 'general',
        autor: req.body.autor || 'Admin',
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        destacado: req.body.destacado === 'true',
        activo: true,
        creado: new Date().toISOString(),
        actualizado: new Date().toISOString()
    };

    data.blog.push(nuevoPost);

    if (writeData(data)) {
        res.json({ success: true, post: nuevoPost });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// PUT /api/blog/:id - Actualizar publicación
router.put('/:id', verifyToken, upload.single('imagen'), (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.blog) data.blog = [];
    const index = data.blog.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const postActual = data.blog[index];

    const errors = validateBlog(req.body, true);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    data.blog[index] = {
        ...postActual,
        titulo: req.body.titulo || postActual.titulo,
        extracto: req.body.extracto ?? postActual.extracto,
        contenido: req.body.contenido ? sanitizeHtml(req.body.contenido, sanitizeOptions) : postActual.contenido,
        imagen: req.file ? `/uploads/blog/${req.file.filename}` : postActual.imagen,
        categoria: req.body.categoria || postActual.categoria,
        autor: req.body.autor || postActual.autor,
        tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean) : postActual.tags,
        destacado: req.body.destacado !== undefined ? req.body.destacado === 'true' : postActual.destacado,
        activo: req.body.activo !== undefined ? req.body.activo === 'true' : postActual.activo,
        actualizado: new Date().toISOString()
    };

    if (req.file && postActual.imagen) {
        deleteOldImage(postActual.imagen);
    }

    if (writeData(data)) {
        res.json({ success: true, post: data.blog[index] });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

// DELETE /api/blog/:id - Eliminar publicación
router.delete('/:id', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.blog) data.blog = [];
    const index = data.blog.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    const eliminado = data.blog.splice(index, 1)[0];
    deleteOldImage(eliminado.imagen);

    if (writeData(data)) {
        res.json({ success: true, eliminado });
    } else {
        res.status(500).json({ error: 'Error guardando datos' });
    }
});

module.exports = router;
