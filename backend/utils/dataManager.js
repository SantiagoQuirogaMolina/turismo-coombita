/**
 * Gestor de datos JSON
 * Lee y escribe al archivo de datos principal
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/guia-turistica-combita.json');

// Leer datos
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo datos:', error);
        return null;
    }
}

// Guardar datos
function writeData(data) {
    try {
        // Actualizar fecha de modificación
        data.fecha_actualizacion = new Date().toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const tmpFile = DATA_FILE + '.tmp';
        fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(tmpFile, DATA_FILE);
        return true;
    } catch (error) {
        console.error('Error guardando datos:', error);
        return false;
    }
}

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Actualizar estadísticas
function updateStats(data) {
    data.estadisticas = {
        hoteles_hospedajes: data.hoteles.length,
        habitaciones_totales: data.hoteles.reduce((sum, h) => sum + (h.habitaciones || 0), 0),
        capacidad_alojamiento: data.hoteles.reduce((sum, h) => sum + (h.capacidad || 0), 0),
        restaurantes_cafeterias: data.restaurantes.length,
        capacidad_gastronomica: data.restaurantes.reduce((sum, r) => sum + (r.aforo || 0), 0),
        eventos: data.eventos.length,
        lugares_turisticos: (data.lugares_turisticos?.reservas_naturales?.length || 0) +
                           (data.lugares_turisticos?.areas_arqueologicas?.length || 0) +
                           (data.lugares_turisticos?.patrimonio_urbano?.length || 0),
        reservas_naturales: data.lugares_turisticos?.reservas_naturales?.length || 0,
        areas_arqueologicas: data.lugares_turisticos?.areas_arqueologicas?.length || 0,
        patrimonio_urbano: data.lugares_turisticos?.patrimonio_urbano?.length || 0
    };
    return data;
}

module.exports = {
    readData,
    writeData,
    generateId,
    updateStats
};
