/**
 * Utilidades de validación para las rutas de la API
 */

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
}

function sanitizeString(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLength);
}

function isPositiveInt(val) {
    const n = parseInt(val);
    return !isNaN(n) && n >= 0;
}

function isValidRating(val) {
    const n = parseFloat(val);
    return !isNaN(n) && n >= 0 && n <= 5;
}

function validateRequired(fields, body) {
    const missing = [];
    for (const field of fields) {
        if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
            missing.push(field);
        }
    }
    return missing;
}

function validateRestaurante(body, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        const missing = validateRequired(['nombre'], body);
        if (missing.length) errors.push(`Campos requeridos: ${missing.join(', ')}`);
    }

    if (body.correo && !isValidEmail(body.correo)) {
        errors.push('Formato de correo inválido');
    }
    if (body.telefono && !isValidPhone(body.telefono)) {
        errors.push('Formato de teléfono inválido');
    }
    if (body.aforo && !isPositiveInt(body.aforo)) {
        errors.push('El aforo debe ser un número positivo');
    }
    if (body.precio_promedio && !isPositiveInt(body.precio_promedio)) {
        errors.push('El precio promedio debe ser un número positivo');
    }

    return errors;
}

function validateHotel(body, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        const missing = validateRequired(['nombre'], body);
        if (missing.length) errors.push(`Campos requeridos: ${missing.join(', ')}`);
    }

    if (body.correo && !isValidEmail(body.correo)) {
        errors.push('Formato de correo inválido');
    }
    if (body.telefono && !isValidPhone(body.telefono)) {
        errors.push('Formato de teléfono inválido');
    }
    if (body.habitaciones && !isPositiveInt(body.habitaciones)) {
        errors.push('Las habitaciones deben ser un número positivo');
    }
    if (body.capacidad && !isPositiveInt(body.capacidad)) {
        errors.push('La capacidad debe ser un número positivo');
    }
    if (body.calificacion && !isValidRating(body.calificacion)) {
        errors.push('La calificación debe ser entre 0 y 5');
    }

    return errors;
}

function validateEvento(body, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        const missing = validateRequired(['nombre'], body);
        if (missing.length) errors.push(`Campos requeridos: ${missing.join(', ')}`);
    }

    return errors;
}

function validateBlog(body, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        const missing = validateRequired(['titulo'], body);
        if (missing.length) errors.push(`Campos requeridos: ${missing.join(', ')}`);
    }

    const validCategorias = ['general', 'naturaleza', 'cultura', 'gastronomia', 'senderismo', 'historia', 'eventos'];
    if (body.categoria && !validCategorias.includes(body.categoria)) {
        errors.push(`Categoría inválida. Opciones: ${validCategorias.join(', ')}`);
    }

    return errors;
}

function validateContacto(body) {
    const errors = [];

    const missing = validateRequired(['nombre', 'email', 'mensaje'], body);
    if (missing.length) errors.push(`Campos requeridos: ${missing.join(', ')}`);

    if (body.email && !isValidEmail(body.email)) {
        errors.push('Formato de correo inválido');
    }
    if (body.telefono && !isValidPhone(body.telefono)) {
        errors.push('Formato de teléfono inválido');
    }

    return errors;
}

function validateArtesano(body, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        const missing = validateRequired(['nombre'], body);
        if (missing.length) errors.push(`Campos requeridos: ${missing.join(', ')}`);
    }

    if (body.correo && !isValidEmail(body.correo)) {
        errors.push('Formato de correo inválido');
    }
    if (body.telefono && !isValidPhone(body.telefono)) {
        errors.push('Formato de teléfono inválido');
    }

    return errors;
}

function validateGuia(body, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        const missing = validateRequired(['nombre'], body);
        if (missing.length) errors.push(`Campos requeridos: ${missing.join(', ')}`);
    }

    if (body.correo && !isValidEmail(body.correo)) {
        errors.push('Formato de correo inválido');
    }
    if (body.telefono && !isValidPhone(body.telefono)) {
        errors.push('Formato de teléfono inválido');
    }

    return errors;
}

function validateVideo(body, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
        const missing = validateRequired(['titulo', 'youtube_url'], body);
        if (missing.length) errors.push(`Campos requeridos: ${missing.join(', ')}`);
    }

    if (body.youtube_url && typeof body.youtube_url === 'string') {
        const url = body.youtube_url.trim();
        if (url && !/youtu\.?be/.test(url) && !/^[\w-]{11}$/.test(url)) {
            errors.push('URL de YouTube inválida');
        }
    }

    if (body.orden !== undefined && body.orden !== '' && !isPositiveInt(body.orden)) {
        errors.push('El orden debe ser un número positivo');
    }

    return errors;
}

module.exports = {
    isValidEmail,
    isValidPhone,
    sanitizeString,
    isPositiveInt,
    isValidRating,
    validateRequired,
    validateRestaurante,
    validateHotel,
    validateEvento,
    validateBlog,
    validateContacto,
    validateArtesano,
    validateGuia,
    validateVideo
};
