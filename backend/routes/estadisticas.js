/**
 * Rutas de Estadísticas
 */

const express = require('express');
const { readData } = require('../utils/dataManager');

const router = express.Router();

// GET /api/estadisticas - Obtener estadísticas generales
router.get('/', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const stats = {
        ...data.estadisticas,
        municipio: data.municipio,
        departamento: data.departamento,
        fecha_actualizacion: data.fecha_actualizacion,
        resumen: {
            totalRestaurantes: data.restaurantes?.length || 0,
            totalHoteles: data.hoteles?.length || 0,
            totalEventos: data.eventos?.length || 0,
            capacidadTotal: (data.hoteles || []).reduce((sum, h) => sum + (h.capacidad || 0), 0),
            aforoTotal: (data.restaurantes || []).reduce((sum, r) => sum + (r.aforo || 0), 0)
        }
    };

    res.json(stats);
});

// GET /api/estadisticas/dashboard - Datos para el dashboard
router.get('/dashboard', (req, res) => {
    const data = readData();
    if (!data) {
        return res.status(500).json({ error: 'Error leyendo datos' });
    }

    const dashboard = {
        tarjetas: [
            {
                titulo: 'Restaurantes',
                valor: data.restaurantes?.length || 0,
                icono: 'utensils',
                color: '#BC6C25'
            },
            {
                titulo: 'Hospedajes',
                valor: data.hoteles?.length || 0,
                icono: 'bed',
                color: '#699073'
            },
            {
                titulo: 'Eventos',
                valor: data.eventos?.length || 0,
                icono: 'calendar',
                color: '#DDA15E'
            },
            {
                titulo: 'Fotos Galería',
                valor: (data.galeria || []).reduce((sum, a) => sum + (a.imagenes || []).length, 0),
                icono: 'images',
                color: '#6A5ACD'
            },
            {
                titulo: 'Publicaciones',
                valor: data.blog?.length || 0,
                icono: 'newspaper',
                color: '#E07A5F'
            },
            {
                titulo: 'Capacidad Total',
                valor: (data.hoteles || []).reduce((sum, h) => sum + (h.capacidad || 0), 0),
                icono: 'users',
                color: '#2d3e33'
            }
        ],
        ultimosAgregados: {
            restaurantes: (data.restaurantes || [])
                .filter(r => r.creado)
                .sort((a, b) => new Date(b.creado) - new Date(a.creado))
                .slice(0, 3),
            hoteles: (data.hoteles || [])
                .filter(h => h.creado)
                .sort((a, b) => new Date(b.creado) - new Date(a.creado))
                .slice(0, 3),
            eventos: (data.eventos || [])
                .filter(e => e.creado)
                .sort((a, b) => new Date(b.creado) - new Date(a.creado))
                .slice(0, 3)
        },
        lugaresturisticos: data.lugares_turisticos
    };

    res.json(dashboard);
});

module.exports = router;
