/**
 * Constantes y configuración global del proyecto
 * Turismo Combitá
 */

// Información del sitio
export const SITE_CONFIG = {
    name: 'Turismo Combitá',
    description: 'Descubre la belleza natural y cultural de Combitá, Boyacá',
    url: 'https://turismocombitá.com',
    email: 'info@turismocombitá.com',
    phone: '+57 XXX XXX XXXX',
    address: 'Combitá, Boyacá, Colombia'
};

// Rutas de la aplicación
export const ROUTES = {
    home: '/',
    about: '/about',
    blog: '/blog',
    contacts: '/contacts',
    events: '/events',
    food: '/food',
    gallery: '/gallery',
    history: '/history',
    login: '/login',
    prices: '/prices',
    shelters: '/shelters',
    team: '/team',
    treks: {
        index: '/treks',
        elValle: '/treks/el-valle',
        lagunaRica: '/treks/laguna-rica',
        laPena: '/treks/la-pena',
        tilin: '/treks/tilin'
    }
};

// Configuración de API (para futuro backend)
export const API_CONFIG = {
    baseURL: process.env.API_URL || 'http://localhost:3000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
};

// Rutas de assets
export const ASSETS = {
    images: '/assets/images',
    css: '/assets/css',
    js: '/assets/js',
    fonts: '/assets/fonts'
};

// Configuración de redes sociales
export const SOCIAL_MEDIA = {
    facebook: 'https://facebook.com/turismocombitá',
    instagram: 'https://instagram.com/turismocombitá',
    twitter: 'https://twitter.com/turismocombitá',
    youtube: 'https://youtube.com/turismocombitá'
};

// Configuración de Google Maps
export const MAP_CONFIG = {
    apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
    defaultCenter: {
        lat: 5.6333,  // Latitud de Combitá
        lng: -73.3167 // Longitud de Combitá
    },
    defaultZoom: 14
};

// Breakpoints para responsive design
export const BREAKPOINTS = {
    mobile: 576,
    tablet: 768,
    desktop: 1024,
    wide: 1440
};

// Colores del tema (basados en la guía de estilo)
export const COLORS = {
    primary: '#8B4513',    // Marrón tierra
    secondary: '#228B22',  // Verde naturaleza
    accent: '#FFD700',     // Dorado frailejón
    dark: '#333333',
    light: '#F5F5F5',
    white: '#FFFFFF',
    danger: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    info: '#17A2B8'
};

// Configuración de idiomas
export const LANGUAGES = {
    default: 'es',
    available: ['es', 'en', 'fr']
};

// Configuración de caché
export const CACHE_CONFIG = {
    version: '1.0.0',
    ttl: 3600000 // 1 hora en milisegundos
};