/**
 * API Integration para Turismo Cómbita
 * Funciones para conectar el frontend con el backend
 */

// Configuración de la API
const API_BASE_URL = window.location.protocol + '//' + window.location.host + '/api';

// Utilidades generales
const ApiUtil = {
    /**
     * Realiza una petición fetch con manejo de errores
     */
    async fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(API_BASE_URL + endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    },

    /**
     * Formatea fecha de manera legible
     */
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    },

    /**
     * Formatea precio con separador de miles
     */
    formatPrice(price) {
        return new Intl.NumberFormat('es-ES').format(price);
    },

    /**
     * Genera estrellas de calificación
     */
    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }
};

// Módulo de Hospedajes
const HospedajesAPI = {
    /**
     * Obtiene lista de hospedajes
     */
    async getHospedajes(filtros = {}) {
        const queryParams = new URLSearchParams(filtros).toString();
        const endpoint = `/hospedajes${queryParams ? '?' + queryParams : ''}`;
        return await ApiUtil.fetchData(endpoint);
    },

    /**
     * Renderiza tarjetas de hospedajes
     */
    renderHospedajeCards(hospedajes, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        hospedajes.forEach(hospedaje => {
            const imagen = hospedaje.imagenes && hospedaje.imagenes[0] ?
                hospedaje.imagenes[0] : 'imagenes/hospedaje-default.jpg';

            html += `
                <div class="col-lg-4 col-md-6">
                    <div class="cnt-box cnt-box-info boxed" data-href="hospedaje-detalle.html?id=${hospedaje.id}">
                        <a href="hospedaje-detalle.html?id=${hospedaje.id}" class="img-box">
                            <img src="${imagen}" alt="${hospedaje.nombre}">
                        </a>
                        <div class="caption">
                            <h2>${hospedaje.nombre}</h2>
                            <p class="hospedaje-tipo">${hospedaje.tipo || 'Hospedaje'}</p>
                            <div class="rating">
                                ${ApiUtil.generateStars(hospedaje.calificacion || 0)}
                            </div>
                            <p>${hospedaje.descripcion ? hospedaje.descripcion.substring(0, 100) + '...' : ''}</p>
                            <div class="price-info">
                                <span class="price">$${ApiUtil.formatPrice(hospedaje.precio_desde || 0)}</span>
                                <span class="price-label">por noche</span>
                            </div>
                            <ul class="icon-list icon-list-horizontal">
                                ${hospedaje.telefono ? `<li><i class="fas fa-phone"></i> ${hospedaje.telefono}</li>` : ''}
                                ${hospedaje.capacidad ? `<li><i class="fas fa-users"></i> ${hospedaje.capacidad} personas</li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};

// Módulo de Restaurantes
const RestaurantesAPI = {
    /**
     * Obtiene lista de restaurantes
     */
    async getRestaurantes(filtros = {}) {
        const queryParams = new URLSearchParams(filtros).toString();
        const endpoint = `/restaurantes${queryParams ? '?' + queryParams : ''}`;
        return await ApiUtil.fetchData(endpoint);
    },

    /**
     * Renderiza tarjetas de restaurantes
     */
    renderRestauranteCards(restaurantes, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        restaurantes.forEach(restaurante => {
            const imagen = restaurante.imagenes && restaurante.imagenes[0] ?
                restaurante.imagenes[0] : 'imagenes/restaurante-default.jpg';

            html += `
                <div class="col-lg-4 col-md-6">
                    <div class="cnt-box cnt-box-info boxed">
                        <a href="restaurante-detalle.html?id=${restaurante.id}" class="img-box">
                            <img src="${imagen}" alt="${restaurante.nombre}">
                        </a>
                        <div class="caption">
                            <h2>${restaurante.nombre}</h2>
                            <p class="cocina-tipo">${restaurante.tipo_cocina || 'Restaurante'}</p>
                            <div class="rating">
                                ${ApiUtil.generateStars(restaurante.calificacion || 0)}
                            </div>
                            <p>${restaurante.descripcion ? restaurante.descripcion.substring(0, 100) + '...' : ''}</p>
                            <div class="info-restaurante">
                                ${restaurante.precio_promedio ? `<span class="precio"><i class="fas fa-dollar-sign"></i> $${ApiUtil.formatPrice(restaurante.precio_promedio)} promedio</span>` : ''}
                                ${restaurante.horario ? `<span class="horario"><i class="far fa-clock"></i> ${restaurante.horario}</span>` : ''}
                            </div>
                            <ul class="icon-list icon-list-horizontal">
                                ${restaurante.telefono ? `<li><i class="fas fa-phone"></i> ${restaurante.telefono}</li>` : ''}
                                ${restaurante.direccion ? `<li><i class="fas fa-map-marker-alt"></i> ${restaurante.direccion}</li>` : ''}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};

// Módulo de Galería
const GaleriaAPI = {
    /**
     * Obtiene imágenes de la galería
     */
    async getGaleria(filtros = {}) {
        const queryParams = new URLSearchParams(filtros).toString();
        const endpoint = `/galeria${queryParams ? '?' + queryParams : ''}`;
        return await ApiUtil.fetchData(endpoint);
    },

    /**
     * Renderiza galería de imágenes
     */
    renderGaleria(imagenes, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        imagenes.forEach(imagen => {
            html += `
                <div class="grid-item col-lg-4 col-md-6 ${imagen.categoria || ''}">
                    <div class="grid-box">
                        <div class="grid-img">
                            <img src="${imagen.imagen}" alt="${imagen.titulo}">
                        </div>
                        <a class="grid-link" href="${imagen.imagen}" data-lightbox-anima="fade-top">
                            <i class="im-plus-circle"></i>
                        </a>
                        <div class="grid-caption">
                            <h3>${imagen.titulo}</h3>
                            <p>${imagen.descripcion || ''}</p>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Re-inicializar lightbox si existe
        if (typeof $.fn.magnificPopup !== 'undefined') {
            $('[data-lightbox-anima]').magnificPopup({
                type: 'image',
                gallery: {
                    enabled: true
                }
            });
        }
    },

    /**
     * Obtiene categorías disponibles
     */
    async getCategorias() {
        return await ApiUtil.fetchData('/galeria/categorias/lista');
    }
};

// Módulo de Eventos
const EventosAPI = {
    /**
     * Obtiene lista de eventos
     */
    async getEventos(filtros = {}) {
        const queryParams = new URLSearchParams(filtros).toString();
        const endpoint = `/eventos${queryParams ? '?' + queryParams : ''}`;
        return await ApiUtil.fetchData(endpoint);
    },

    /**
     * Obtiene próximos eventos
     */
    async getProximosEventos(limite = 5) {
        return await ApiUtil.fetchData(`/eventos/proximos?limite=${limite}`);
    },

    /**
     * Renderiza tarjetas de eventos
     */
    renderEventoCards(eventos, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        eventos.forEach(evento => {
            const imagen = evento.imagenes && evento.imagenes[0] ?
                evento.imagenes[0] : 'imagenes/evento-default.jpg';

            const fechaInicio = ApiUtil.formatDate(evento.fecha_inicio);

            html += `
                <div class="col-lg-4 col-md-6">
                    <div class="cnt-box cnt-box-blog-top boxed">
                        <a href="evento-detalle.html?id=${evento.id}" class="img-box">
                            <img src="${imagen}" alt="${evento.nombre}">
                        </a>
                        <div class="caption">
                            <div class="blog-date">
                                <span>${new Date(evento.fecha_inicio).getDate()}</span>
                                <span>${new Date(evento.fecha_inicio).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}</span>
                            </div>
                            <h2>${evento.nombre}</h2>
                            <p class="evento-categoria">${evento.categoria || 'Evento'}</p>
                            <p>${evento.descripcion ? evento.descripcion.substring(0, 150) + '...' : ''}</p>
                            <div class="evento-info">
                                ${evento.lugar ? `<span><i class="fas fa-map-marker-alt"></i> ${evento.lugar}</span>` : ''}
                                ${evento.hora_inicio ? `<span><i class="far fa-clock"></i> ${evento.hora_inicio}</span>` : ''}
                                ${evento.precio ? `<span><i class="fas fa-ticket-alt"></i> $${ApiUtil.formatPrice(evento.precio)}</span>` : ''}
                            </div>
                            <a href="evento-detalle.html?id=${evento.id}" class="btn btn-xs">Ver detalles</a>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};

// Módulo de Blog
const BlogAPI = {
    /**
     * Obtiene posts del blog
     */
    async getPosts(filtros = {}) {
        const queryParams = new URLSearchParams(filtros).toString();
        const endpoint = `/blog/posts${queryParams ? '?' + queryParams : ''}`;
        return await ApiUtil.fetchData(endpoint);
    },

    /**
     * Obtiene post por slug
     */
    async getPostBySlug(slug) {
        return await ApiUtil.fetchData(`/blog/posts/${slug}`);
    },

    /**
     * Obtiene categorías del blog
     */
    async getCategorias() {
        return await ApiUtil.fetchData('/blog/categorias');
    },

    /**
     * Renderiza posts del blog
     */
    renderBlogPosts(posts, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        posts.forEach(post => {
            const fecha = ApiUtil.formatDate(post.fecha_publicacion);
            const imagen = post.imagen_destacada || 'imagenes/blog-default.jpg';

            html += `
                <div class="col-lg-6">
                    <div class="cnt-box cnt-box-blog-side boxed">
                        <a href="blog-post.html?slug=${post.slug}" class="img-box">
                            <img src="${imagen}" alt="${post.titulo}">
                        </a>
                        <div class="caption">
                            <div class="blog-date">
                                <span>${new Date(post.fecha_publicacion).getDate()}</span>
                                <span>${new Date(post.fecha_publicacion).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}</span>
                            </div>
                            <h2>
                                <a href="blog-post.html?slug=${post.slug}">${post.titulo}</a>
                            </h2>
                            <ul class="icon-list icon-list-horizontal">
                                <li><i class="fas fa-user"></i> ${post.autor_nombre || 'Admin'}</li>
                                <li><i class="fas fa-folder"></i> ${post.categoria || 'General'}</li>
                                <li><i class="fas fa-eye"></i> ${post.vistas || 0} vistas</li>
                            </ul>
                            <p>${post.resumen || post.contenido.substring(0, 200) + '...'}</p>
                            <a class="btn-text" href="blog-post.html?slug=${post.slug}">Leer más</a>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * Agregar comentario a un post
     */
    async addComentario(postId, comentario) {
        return await ApiUtil.fetchData(`/blog/posts/${postId}/comentarios`, {
            method: 'POST',
            body: JSON.stringify(comentario)
        });
    }
};

// Función para inicializar componentes según la página
async function initializePageComponents() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    try {
        switch (currentPage) {
            case 'shelters.html':
                const hospedajesData = await HospedajesAPI.getHospedajes({ activo: true, limite: 12 });
                if (hospedajesData.success) {
                    HospedajesAPI.renderHospedajeCards(hospedajesData.data, 'hospedajes-container');
                }
                break;

            case 'food.html':
                const restaurantesData = await RestaurantesAPI.getRestaurantes({ activo: true, limite: 12 });
                if (restaurantesData.success) {
                    RestaurantesAPI.renderRestauranteCards(restaurantesData.data, 'restaurantes-container');
                }
                break;

            case 'gallery.html':
                const galeriaData = await GaleriaAPI.getGaleria({ activo: true, limite: 20 });
                if (galeriaData.success) {
                    GaleriaAPI.renderGaleria(galeriaData.data, 'galeria-container');
                }
                break;

            case 'events.html':
                const eventosData = await EventosAPI.getEventos({ activo: true, limite: 12 });
                if (eventosData.success) {
                    EventosAPI.renderEventoCards(eventosData.data, 'eventos-container');
                }
                break;

            case 'blog.html':
                const postsData = await BlogAPI.getPosts({ activo: true, limite: 10 });
                if (postsData.success) {
                    BlogAPI.renderBlogPosts(postsData.data, 'blog-container');
                }
                break;

            case 'index.html':
                // Cargar componentes destacados para la página de inicio
                const proximosEventos = await EventosAPI.getProximosEventos(3);
                if (proximosEventos.success && document.getElementById('proximos-eventos')) {
                    EventosAPI.renderEventoCards(proximosEventos.data, 'proximos-eventos');
                }

                const blogReciente = await BlogAPI.getPosts({ activo: true, limite: 3 });
                if (blogReciente.success && document.getElementById('blog-reciente')) {
                    BlogAPI.renderBlogPosts(blogReciente.data, 'blog-reciente');
                }
                break;
        }
    } catch (error) {
        console.error('Error inicializando componentes:', error);
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePageComponents);
} else {
    initializePageComponents();
}

// Exportar módulos para uso global
window.TurismoAPI = {
    Hospedajes: HospedajesAPI,
    Restaurantes: RestaurantesAPI,
    Galeria: GaleriaAPI,
    Eventos: EventosAPI,
    Blog: BlogAPI,
    Util: ApiUtil
};