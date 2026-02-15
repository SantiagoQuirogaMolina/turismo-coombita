/**
 * Rutas - Formulario de Contacto
 */

const express = require('express');
const { readData, writeData, generateId } = require('../utils/dataManager');
const { verifyToken } = require('../middleware/auth');
const { validateContacto } = require('../utils/validation');

const router = express.Router();

// POST /api/contacto - Recibir mensaje de contacto
router.post('/', (req, res) => {
    const { nombre, email, telefono, asunto, mensaje } = req.body;

    const errors = validateContacto(req.body);
    if (errors.length) {
        return res.status(400).json({ error: errors.join('. ') });
    }

    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    if (!data.mensajes) data.mensajes = [];

    const nuevoMensaje = {
        id: generateId(),
        nombre,
        email,
        telefono: telefono || '',
        asunto: asunto || 'Sin asunto',
        mensaje,
        leido: false,
        creado: new Date().toISOString()
    };

    data.mensajes.push(nuevoMensaje);

    if (writeData(data)) {
        res.json({ success: true, mensaje: 'Mensaje enviado correctamente' });
    } else {
        res.status(500).json({ error: 'Error guardando mensaje' });
    }
});

// GET /api/contacto - Listar mensajes (solo admin)
router.get('/', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const mensajes = (data.mensajes || []).sort((a, b) => new Date(b.creado) - new Date(a.creado));
    res.json(mensajes);
});

// PUT /api/contacto/:id/leido - Marcar mensaje como leído
router.put('/:id/leido', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const mensajes = data.mensajes || [];
    const mensaje = mensajes.find(m => m.id === req.params.id);

    if (!mensaje) {
        return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    mensaje.leido = true;

    if (writeData(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Error actualizando mensaje' });
    }
});

// DELETE /api/contacto/:id - Eliminar mensaje
router.delete('/:id', verifyToken, (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const mensajes = data.mensajes || [];
    const index = mensajes.findIndex(m => m.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    mensajes.splice(index, 1);
    data.mensajes = mensajes;

    if (writeData(data)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Error eliminando mensaje' });
    }
});

module.exports = router;
