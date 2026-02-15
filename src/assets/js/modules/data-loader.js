/**
 * Cargador de Datos Dinámicos
 * Conecta el frontend con la API del backend
 */

const DATA_API = 'http://localhost:3001/api';

// ==================== RESTAURANTES ====================

async function loadRestaurantes() {
    const container = document.getElementById('restaurantes-container');
    if (!container) return;

    try {
        const res = await fetch(`${DATA_API}/restaurantes`);
        const restaurantes = await res.json();

        container.innerHTML = restaurantes
            .filter(r => r.activo !== false)
            .map(r => `
                <div class="col-lg-4 col-md-6">
                    <div class="restaurant-card">
                        <div class="img-container">
                            <img src="${r.imagen || '../assets/images/placeholder-restaurant.jpg'}" alt="${r.nombre}">
                            ${r.direccion ? `<span class="badge-location">${r.direccion.split(',')[0]}</span>` : ''}
                        </div>
                        <div class="card-content">
                            <h3>${r.nombre}</h3>
                            <p class="specialty">${r.especialidad || ''}</p>
                            <ul class="info-list">
                                ${r.aforo ? `<li><i class="fas fa-users"></i> Aforo: ${r.aforo} personas</li>` : ''}
                                ${r.horario ? `<li><i class="fas fa-clock"></i> ${r.horario}</li>` : ''}
                                ${r.telefono ? `<li><i class="fas fa-phone"></i> ${r.telefono}</li>` : ''}
                                ${r.propietario ? `<li><i class="fas fa-user"></i> ${r.propietario}</li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            `).join('');

    } catch (error) {
        console.error('Error cargando restaurantes:', error);
        container.innerHTML = '<p class="text-center">Error cargando datos. Verifica que el servidor esté activo.</p>';
    }
}

// ==================== HOTELES ====================

async function loadHoteles() {
    const container = document.getElementById('hoteles-container');
    if (!container) return;

    try {
        const res = await fetch(`${DATA_API}/hoteles`);
        const hoteles = await res.json();

        container.innerHTML = hoteles
            .filter(h => h.activo !== false)
            .map(h => `
                <div class="col-lg-6">
                    <div class="hotel-card">
                        <div class="hotel-gallery">
                            <img src="${h.imagen || '../assets/images/placeholder-hotel.jpg'}" alt="${h.nombre}">
                            ${h.habitaciones ? `<span class="hotel-badge">${h.habitaciones} habitaciones</span>` : ''}
                            ${h.capacidad ? `<span class="hotel-price-badge">${h.capacidad} personas</span>` : ''}
                        </div>
                        <div class="hotel-content">
                            <h3>${h.nombre}</h3>
                            ${h.direccion ? `<p class="hotel-location"><i class="fas fa-map-marker-alt"></i> ${h.direccion}</p>` : ''}
                            ${h.servicios ? `<p class="hotel-description">${h.servicios}</p>` : ''}
                            <div class="hotel-amenities">
                                ${h.telefono ? `<span><i class="fas fa-phone"></i> ${h.telefono}</span>` : ''}
                                ${h.correo ? `<span><i class="fas fa-envelope"></i> ${h.correo}</span>` : ''}
                            </div>
                            ${h.tarifas ? `
                                <div class="hotel-price">
                                    <strong>Tarifas:</strong>
                                    ${Object.entries(h.tarifas).map(([k, v]) => `<span>${k}: ${v}</span>`).join(' | ')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');

    } catch (error) {
        console.error('Error cargando hoteles:', error);
        container.innerHTML = '<p class="text-center">Error cargando datos. Verifica que el servidor esté activo.</p>';
    }
}

// ==================== EVENTOS ====================

async function loadEventos() {
    const container = document.getElementById('eventos-container');
    if (!container) return;

    try {
        const res = await fetch(`${DATA_API}/eventos`);
        const eventos = await res.json();

        container.innerHTML = eventos
            .filter(e => e.activo !== false)
            .map((e, index) => `
                <div class="col-lg-12 grid-item">
                    <div class="event-card" data-index="0${index + 1}">
                        <div class="event-card-inner">
                            <div class="event-image">
                                <img src="${e.imagen || '../assets/images/placeholder-event.jpg'}" alt="${e.nombre}">
                            </div>
                            <div class="event-content">
                                <span class="event-type">${e.tipo || 'Cultural'}</span>
                                <h3>${e.nombre}</h3>
                                <p class="event-date"><i class="fas fa-calendar"></i> ${e.fecha}</p>
                                <p class="event-description">${e.descripcion}</p>
                                <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${e.ubicacion || 'Cómbita, Boyacá'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

    } catch (error) {
        console.error('Error cargando eventos:', error);
        container.innerHTML = '<p class="text-center">Error cargando datos. Verifica que el servidor esté activo.</p>';
    }
}

// ==================== ESTADÍSTICAS ====================

async function loadEstadisticas() {
    try {
        const res = await fetch(`${DATA_API}/estadisticas`);
        const stats = await res.json();

        // Actualizar elementos si existen
        const elements = {
            'stat-restaurantes': stats.resumen?.totalRestaurantes,
            'stat-hoteles': stats.resumen?.totalHoteles,
            'stat-eventos': stats.resumen?.totalEventos,
            'stat-capacidad': stats.resumen?.capacidadTotal
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el && value !== undefined) {
                el.textContent = value;
            }
        });

    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
    // Detectar qué página es y cargar datos correspondientes
    const path = window.location.pathname;

    if (path.includes('food.html') || path.includes('restaurantes')) {
        loadRestaurantes();
    }

    if (path.includes('shelters.html') || path.includes('hospedajes')) {
        loadHoteles();
    }

    if (path.includes('events.html') || path.includes('eventos')) {
        loadEventos();
    }

    // Cargar estadísticas en la página principal
    if (path.includes('index.html') || path.endsWith('/')) {
        loadEstadisticas();
    }
});

// Exportar funciones para uso manual
window.DataLoader = {
    loadRestaurantes,
    loadHoteles,
    loadEventos,
    loadEstadisticas
};
