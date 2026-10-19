/**
 * Coordenadas de ubicación en el mapa (lat, lng)
 *
 * Los formularios del panel envían lat y lng como texto (multipart).
 * - Si no vienen en la petición, se conserva la ubicación actual.
 * - Si vienen vacías, la ubicación queda "por definir" (null).
 * - Si vienen con valor, deben ser números dentro de la región de Boyacá.
 */

const LIMITES = { latMin: 4, latMax: 7, lngMin: -75, lngMax: -72 };

function leerCoordenadas(body, actual = {}) {
    if (body.lat === undefined && body.lng === undefined) {
        return { lat: actual.lat ?? null, lng: actual.lng ?? null };
    }

    const latTexto = String(body.lat ?? '').trim();
    const lngTexto = String(body.lng ?? '').trim();
    if (!latTexto && !lngTexto) {
        return { lat: null, lng: null };
    }

    const lat = Number(latTexto);
    const lng = Number(lngTexto);
    const valida = Number.isFinite(lat) && Number.isFinite(lng) &&
        lat > LIMITES.latMin && lat < LIMITES.latMax &&
        lng > LIMITES.lngMin && lng < LIMITES.lngMax;

    if (!valida) {
        return { error: 'La ubicación en el mapa no es válida. Márquela de nuevo haciendo clic en el mapa.' };
    }

    return { lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6 };
}

module.exports = { leerCoordenadas };
