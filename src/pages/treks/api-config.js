/**
 * Configuración temporal de API
 * Este archivo previene errores 404 mientras no esté el backend
 */

window.API_CONFIG = {
    baseURL: 'http://localhost:3001/api',
    timeout: 10000,
    mock: true
};

window.fetchAPI = function(endpoint) {
    console.log('API no disponible. Endpoint:', endpoint);
    return Promise.resolve({
        data: [],
        status: 'mock',
        message: 'Backend no disponible - Datos simulados'
    });
};

console.log('API Config - Modo Mock');