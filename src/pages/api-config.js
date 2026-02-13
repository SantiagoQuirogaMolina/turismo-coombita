/**
 * Configuración temporal de API
 * Este archivo previene errores 404 mientras no esté el backend
 */

// Configuración de API (temporal)
window.API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    mock: true // Usar datos simulados mientras no hay backend
};

// Función para manejar llamadas a API que aún no existe
window.fetchAPI = function(endpoint) {
    console.log('API no disponible aún. Endpoint solicitado:', endpoint);

    // Retornar datos simulados para prevenir errores
    return Promise.resolve({
        data: [],
        status: 'mock',
        message: 'Usando datos simulados - Backend no disponible'
    });
};

console.log('API Config cargado - Modo Mock activado');