/**
 * Panel Admin - Turismo Cómbita
 * JavaScript Principal
 */

const API_URL = 'http://localhost:3001/api';
let currentUser = null;
let deleteCallback = null;
let currentAlbumId = null; // Álbum seleccionado en galería

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    document.getElementById('formLogin').addEventListener('submit', handleLogin);

    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);
        });
    });

    // Forms
    document.getElementById('formRestaurante').addEventListener('submit', handleRestauranteSubmit);
    document.getElementById('formHotel').addEventListener('submit', handleHotelSubmit);
    document.getElementById('formEvento').addEventListener('submit', handleEventoSubmit);
    document.getElementById('formAlbum').addEventListener('submit', handleAlbumSubmit);
    document.getElementById('formImagen').addEventListener('submit', handleImagenSubmit);
    document.getElementById('formEditarImagen').addEventListener('submit', handleEditarImagenSubmit);
    document.getElementById('formBlog').addEventListener('submit', handleBlogSubmit);
    document.getElementById('formPassword').addEventListener('submit', handlePasswordChange);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal && !modal.classList.contains('modal-login')) {
                modal.classList.remove('active');
            }
        });
    });
}

// ==================== AUTENTICACIÓN ====================

function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.user) {
                currentUser = data.user;
                hideLoginModal();
                updateUserInfo();
                loadDashboard();
                loadMensajesBadge();
            } else {
                showLoginModal();
            }
        })
        .catch(() => showLoginModal());
    } else {
        showLoginModal();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            currentUser = data.user;
            hideLoginModal();
            updateUserInfo();
            loadDashboard();
            loadMensajesBadge();
            showToast('Bienvenido ' + data.user.nombre, 'success');
        } else {
            showToast(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        showToast('Error de conexión con el servidor', 'error');
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    currentUser = null;
    showLoginModal();
    showToast('Sesión cerrada', 'success');
}

function showLoginModal() {
    document.getElementById('modalLogin').classList.add('active');
}

function hideLoginModal() {
    document.getElementById('modalLogin').classList.remove('active');
}

function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.nombre;
        document.getElementById('userRole').textContent = currentUser.rol === 'admin' ? 'Administrador' : 'Editor';
        document.getElementById('userAvatar').textContent = currentUser.nombre.charAt(0).toUpperCase();
    }
}

function getAuthHeaders() {
    return {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    };
}

// ==================== NAVEGACIÓN ====================

function showSection(sectionId) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === sectionId);
    });

    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`section-${sectionId}`).classList.add('active');

    // Update title
    const titles = {
        dashboard: 'Dashboard',
        restaurantes: 'Restaurantes',
        hoteles: 'Hospedajes',
        eventos: 'Eventos',
        galeria: 'Galería',
        blog: 'Blog',
        mensajes: 'Mensajes',
        config: 'Configuración'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'Panel Admin';

    // Load data
    if (sectionId === 'dashboard') loadDashboard();
    if (sectionId === 'restaurantes') loadRestaurantes();
    if (sectionId === 'hoteles') loadHoteles();
    if (sectionId === 'eventos') loadEventos();
    if (sectionId === 'galeria') loadGaleria();
    if (sectionId === 'blog') loadBlog();
    if (sectionId === 'mensajes') loadMensajes();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        const res = await fetch(`${API_URL}/estadisticas/dashboard`);
        const data = await res.json();

        // Stats cards
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = data.tarjetas.map(card => `
            <div class="stat-card">
                <div class="stat-icon" style="background: ${card.color}">
                    <i class="fas fa-${card.icono}"></i>
                </div>
                <div class="stat-info">
                    <h3>${card.valor}</h3>
                    <p>${card.titulo}</p>
                </div>
            </div>
        `).join('');

        // Recent activity
        const activity = document.getElementById('recentActivity');
        let activityHtml = '<ul style="list-style:none;padding:0;">';

        const allRecent = [
            ...data.ultimosAgregados.restaurantes.map(r => ({...r, tipo: 'Restaurante', icon: 'utensils'})),
            ...data.ultimosAgregados.hoteles.map(h => ({...h, tipo: 'Hospedaje', icon: 'bed'})),
            ...data.ultimosAgregados.eventos.map(e => ({...e, tipo: 'Evento', icon: 'calendar'}))
        ].sort((a, b) => new Date(b.creado) - new Date(a.creado)).slice(0, 5);

        if (allRecent.length > 0) {
            activityHtml += allRecent.map(item => `
                <li style="padding:10px 0;border-bottom:1px solid #eee;display:flex;align-items:center;gap:12px;">
                    <i class="fas fa-${item.icon}" style="color:#699073;width:20px;"></i>
                    <div>
                        <strong>${item.nombre}</strong>
                        <br><small style="color:#999;">${item.tipo} - ${new Date(item.creado).toLocaleDateString('es-CO')}</small>
                    </div>
                </li>
            `).join('');
        } else {
            activityHtml += '<li style="padding:20px 0;color:#999;text-align:center;">No hay actividad reciente</li>';
        }

        activityHtml += '</ul>';
        activity.innerHTML = activityHtml;

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Error cargando datos del dashboard', 'error');
    }
}

// ==================== RESTAURANTES ====================

async function loadRestaurantes() {
    try {
        const res = await fetch(`${API_URL}/restaurantes`);
        const restaurantes = await res.json();

        const tbody = document.querySelector('#tablaRestaurantes tbody');
        tbody.innerHTML = restaurantes.map(r => `
            <tr>
                <td>
                    <div class="tabla-imagen">
                        ${r.imagen ? `<img src="${r.imagen}" alt="${r.nombre}" onerror="this.src='/assets/images/restaurantes/placeholder-restaurant.svg'">` : '<span class="sin-imagen"><i class="fas fa-image"></i></span>'}
                    </div>
                </td>
                <td><strong>${r.nombre}</strong></td>
                <td>${r.especialidad ? (r.especialidad.length > 40 ? r.especialidad.substring(0, 40) + '...' : r.especialidad) : '-'}</td>
                <td>${r.aforo || '-'}</td>
                <td>${r.telefono || '-'}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="editRestaurante('${r.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="confirmDelete('restaurante', '${r.id}', '${r.nombre}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading restaurantes:', error);
        showToast('Error cargando restaurantes', 'error');
    }
}

async function handleRestauranteSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id');

    const url = id ? `${API_URL}/restaurantes/${id}` : `${API_URL}/restaurantes`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            closeModal('restaurante');
            loadRestaurantes();
            loadDashboard();
            showToast(id ? 'Restaurante actualizado' : 'Restaurante creado', 'success');
            form.reset();
        } else {
            showToast(data.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function editRestaurante(id) {
    try {
        const res = await fetch(`${API_URL}/restaurantes/${id}`);
        const restaurante = await res.json();

        const form = document.getElementById('formRestaurante');
        form.id.value = restaurante.id;
        form.nombre.value = restaurante.nombre || '';
        form.tipo_cocina.value = restaurante.tipo_cocina || 'Típica Boyacense';
        form.especialidad.value = restaurante.especialidad || '';
        form.direccion.value = restaurante.direccion || '';
        form.ubicacion.value = restaurante.ubicacion || 'Centro';
        form.aforo.value = restaurante.aforo || '';
        form.precio_promedio.value = restaurante.precio_promedio || '';
        form.propietario.value = restaurante.propietario || '';
        form.horario.value = restaurante.horario || '';
        form.telefono.value = restaurante.telefono || '';
        form.whatsapp.value = restaurante.whatsapp || '';
        form.correo.value = restaurante.correo || '';

        // Redes sociales
        form.facebook.value = restaurante.redes_sociales?.facebook || '';
        form.instagram.value = restaurante.redes_sociales?.instagram || '';
        form.tiktok.value = restaurante.redes_sociales?.tiktok || '';
        form.youtube.value = restaurante.redes_sociales?.youtube || '';

        // Mostrar imagen actual
        showCurrentImage('restauranteImagenPreview', restaurante.imagen);

        document.getElementById('modalRestauranteTitle').textContent = 'Editar Restaurante';
        openModal('restaurante');
    } catch (error) {
        showToast('Error cargando datos', 'error');
    }
}

// ==================== HOTELES ====================

async function loadHoteles() {
    try {
        const res = await fetch(`${API_URL}/hoteles`);
        const hoteles = await res.json();

        // Mapeo de categorías para mostrar
        const categoriasNombres = {
            'hotel': 'Hotel',
            'posada': 'Posada',
            'glamping': 'Glamping',
            'camping': 'Camping'
        };

        const tbody = document.querySelector('#tablaHoteles tbody');
        tbody.innerHTML = hoteles.map(h => `
            <tr>
                <td>
                    <div class="tabla-imagen">
                        ${h.imagen ? `<img src="${h.imagen}" alt="${h.nombre}" onerror="this.src='/assets/images/hospedajes/placeholder-hotel.svg'">` : '<span class="sin-imagen"><i class="fas fa-image"></i></span>'}
                    </div>
                </td>
                <td><strong>${h.nombre}</strong></td>
                <td><span class="badge-categoria ${h.categoria || 'hotel'}">${categoriasNombres[h.categoria] || h.tipo || 'Hotel'}</span></td>
                <td>${h.habitaciones || '-'}</td>
                <td>${h.capacidad || '-'}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="editHotel('${h.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="confirmDelete('hotel', '${h.id}', '${h.nombre}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading hoteles:', error);
        showToast('Error cargando hospedajes', 'error');
    }
}

async function handleHotelSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id');

    const url = id ? `${API_URL}/hoteles/${id}` : `${API_URL}/hoteles`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            closeModal('hotel');
            loadHoteles();
            loadDashboard();
            showToast(id ? 'Hospedaje actualizado' : 'Hospedaje creado', 'success');
            form.reset();
        } else {
            showToast(data.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function editHotel(id) {
    try {
        const res = await fetch(`${API_URL}/hoteles/${id}`);
        const hotel = await res.json();

        const form = document.getElementById('formHotel');
        form.id.value = hotel.id;
        form.nombre.value = hotel.nombre || '';
        form.tipo.value = hotel.tipo || 'Hotel';
        form.direccion.value = hotel.direccion || '';
        form.descripcion.value = hotel.descripcion || '';
        form.habitaciones.value = hotel.habitaciones || '';
        form.capacidad.value = hotel.capacidad || '';
        form.calificacion.value = hotel.calificacion || '4.0';
        form.precio_badge.value = hotel.precio_badge || 'Estándar';
        form.tarifas_texto.value = hotel.tarifas_texto || '';
        form.telefono.value = hotel.telefono || '';
        form.whatsapp.value = hotel.whatsapp || '';
        form.correo.value = hotel.correo || '';

        // Categoría
        form.categoria.value = hotel.categoria || 'hotel';

        // Redes sociales
        form.facebook.value = hotel.redes_sociales?.facebook || '';
        form.instagram.value = hotel.redes_sociales?.instagram || '';
        form.tiktok.value = hotel.redes_sociales?.tiktok || '';
        form.youtube.value = hotel.redes_sociales?.youtube || '';

        // Servicios (checkboxes)
        const servicios = Array.isArray(hotel.servicios) ? hotel.servicios : [];
        form.servicio_wifi.checked = servicios.includes('WiFi');
        form.servicio_tv.checked = servicios.includes('TV Cable');
        form.servicio_parking.checked = servicios.includes('Parqueadero');
        form.servicio_agua_caliente.checked = servicios.includes('Agua caliente');
        form.servicio_cocina.checked = servicios.includes('Cocina');
        form.servicio_jardin.checked = servicios.includes('Jardín');
        form.servicio_desayuno.checked = servicios.includes('Desayuno');
        form.servicio_spa.checked = servicios.includes('Spa');
        form.servicio_jacuzzi.checked = servicios.includes('Jacuzzi');
        form.servicio_chimenea.checked = servicios.includes('Chimenea');

        // Otros servicios (los que no están en los checkboxes)
        const serviciosPredefinidos = ['WiFi', 'TV Cable', 'Parqueadero', 'Agua caliente', 'Cocina', 'Jardín', 'Desayuno', 'Spa', 'Jacuzzi', 'Chimenea'];
        const otrosServicios = servicios.filter(s => !serviciosPredefinidos.includes(s));
        form.servicios_otros.value = otrosServicios.join(', ');

        // Mostrar imagen actual
        showCurrentImage('hotelImagenPreview', hotel.imagen);

        document.getElementById('modalHotelTitle').textContent = 'Editar Hospedaje';
        openModal('hotel');
    } catch (error) {
        showToast('Error cargando datos', 'error');
    }
}

// Función para mostrar imagen actual
function showCurrentImage(containerId, imagePath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (imagePath && imagePath.trim()) {
        container.innerHTML = `<img src="${imagePath}" alt="Imagen actual" onerror="this.parentElement.innerHTML='<span class=\\'no-imagen\\'>Error al cargar imagen</span>'">`;
        container.classList.add('has-image');
    } else {
        container.innerHTML = '<span class="no-imagen">Sin imagen</span>';
        container.classList.remove('has-image');
    }
}

// Función para previsualizar imagen seleccionada
function previewImage(input, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            container.innerHTML = `<img src="${e.target.result}" alt="Nueva imagen">`;
            container.classList.add('has-image');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ==================== EVENTOS ====================

async function loadEventos() {
    try {
        const res = await fetch(`${API_URL}/eventos`);
        const eventos = await res.json();

        const tbody = document.querySelector('#tablaEventos tbody');
        tbody.innerHTML = eventos.map(e => `
            <tr>
                <td><strong>${e.nombre}</strong></td>
                <td>${e.fecha || '-'}</td>
                <td><span class="badge-tipo">${e.tipo || 'cultural'}</span></td>
                <td>${e.ubicacion || 'Cómbita'}</td>
                <td class="actions">
                    <button class="btn-edit" onclick="editEvento('${e.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="confirmDelete('evento', '${e.id}', '${e.nombre}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading eventos:', error);
        showToast('Error cargando eventos', 'error');
    }
}

async function handleEventoSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id');

    const url = id ? `${API_URL}/eventos/${id}` : `${API_URL}/eventos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            closeModal('evento');
            loadEventos();
            loadDashboard();
            showToast(id ? 'Evento actualizado' : 'Evento creado', 'success');
            form.reset();
        } else {
            showToast(data.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function editEvento(id) {
    try {
        const res = await fetch(`${API_URL}/eventos/${id}`);
        const evento = await res.json();

        const form = document.getElementById('formEvento');
        form.id.value = evento.id;
        form.nombre.value = evento.nombre || '';
        form.tipo.value = evento.tipo || 'cultural';
        form.fecha.value = evento.fecha || '';
        form.descripcion.value = evento.descripcion || '';
        form.ubicacion.value = evento.ubicacion || 'Cómbita, Boyacá';
        form.destacado.checked = evento.destacado || false;

        document.getElementById('modalEventoTitle').textContent = 'Editar Evento';
        openModal('evento');
    } catch (error) {
        showToast('Error cargando datos', 'error');
    }
}

// ==================== PASSWORD CHANGE ====================

async function handlePasswordChange(e) {
    e.preventDefault();
    const form = e.target;
    const passwordActual = form.passwordActual.value;
    const passwordNueva = form.passwordNueva.value;
    const passwordConfirm = form.passwordConfirm.value;

    if (passwordNueva !== passwordConfirm) {
        showToast('Las contraseñas no coinciden', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/cambiar-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ passwordActual, passwordNueva })
        });

        const data = await res.json();

        if (data.success) {
            showToast('Contraseña actualizada correctamente', 'success');
            form.reset();
        } else {
            showToast(data.error || 'Error al cambiar contraseña', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// ==================== MODALS ====================

function openModal(type) {
    // Map type names to modal IDs
    const modalMap = {
        restaurante: 'modalRestaurante',
        hotel: 'modalHotel',
        evento: 'modalEvento',
        album: 'modalAlbum',
        imagen: 'modalImagen',
        editarImagen: 'modalEditarImagen',
        blog: 'modalBlog',
        confirm: 'modalConfirm'
    };

    const modalId = modalMap[type] || `modal${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const modal = document.getElementById(modalId);
    if (modal) {
        // Reset form if new (no tiene ID)
        const form = modal.querySelector('form');
        const idField = form ? form.querySelector('input[name="id"]') : null;

        if (form && (!idField || !idField.value)) {
            form.reset();
            const title = modal.querySelector('.modal-header h3');
            if (title) {
                const titles = {
                    restaurante: 'Agregar Restaurante',
                    hotel: 'Agregar Hospedaje',
                    evento: 'Agregar Evento',
                    album: 'Nuevo Álbum',
                    imagen: 'Subir Imagen'
                };
                if (titles[type]) title.textContent = titles[type];
            }

            // Limpiar editor de blog
            if (type === 'blog') {
                const editor = document.getElementById('blogEditor');
                if (editor) editor.innerHTML = '';
            }

            // Limpiar previsualizaciones
            const previewMap = {
                hotel: 'hotelImagenPreview',
                restaurante: 'restauranteImagenPreview',
                album: 'albumPortadaPreview',
                imagen: 'imagenUploadPreview',
                blog: 'blogImagenPreview'
            };
            const previewId = previewMap[type];
            if (previewId) {
                const preview = document.getElementById(previewId);
                if (preview) {
                    preview.innerHTML = '<span class="no-imagen">Sin imagen</span>';
                    preview.classList.remove('has-image');
                }
            }
        }
        modal.classList.add('active');
    }
}

function closeModal(type) {
    const modalMap = {
        restaurante: 'modalRestaurante',
        hotel: 'modalHotel',
        evento: 'modalEvento',
        album: 'modalAlbum',
        imagen: 'modalImagen',
        editarImagen: 'modalEditarImagen',
        blog: 'modalBlog',
        confirm: 'modalConfirm'
    };

    const modalId = modalMap[type] || `modal${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            const idField = form.querySelector('input[name="id"]');
            if (idField) idField.value = '';
        }

        // Limpiar editor de blog
        if (type === 'blog') {
            const editor = document.getElementById('blogEditor');
            if (editor) editor.innerHTML = '';
        }

        // Limpiar previsualizaciones
        const previewMap = {
            hotel: 'hotelImagenPreview',
            restaurante: 'restauranteImagenPreview',
            album: 'albumPortadaPreview',
            imagen: 'imagenUploadPreview',
            editarImagen: 'editarImagenPreview',
            blog: 'blogImagenPreview'
        };
        const previewId = previewMap[type];
        if (previewId) {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.innerHTML = '<span class="no-imagen">Sin imagen</span>';
                preview.classList.remove('has-image');
            }
        }
    }
}

// ==================== DELETE CONFIRMATION ====================

function confirmDelete(type, id, name) {
    const modal = document.getElementById('modalConfirm');
    modal.querySelector('p').textContent = `¿Estás seguro de que deseas eliminar "${name}"? Esta acción no se puede deshacer.`;
    modal.classList.add('active');

    deleteCallback = async () => {
        try {
            let deleteUrl;
            if (type === 'imagen' && currentAlbumId) {
                deleteUrl = `${API_URL}/galeria/${currentAlbumId}/imagenes/${id}`;
            } else {
                const endpoints = {
                    restaurante: 'restaurantes',
                    hotel: 'hoteles',
                    evento: 'eventos',
                    album: 'galeria',
                    blog: 'blog'
                };
                deleteUrl = `${API_URL}/${endpoints[type]}/${id}`;
            }

            const res = await fetch(deleteUrl, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const data = await res.json();

            if (data.success) {
                closeModal('confirm');
                showToast('Eliminado correctamente', 'success');

                // Reload data
                if (type === 'restaurante') loadRestaurantes();
                if (type === 'hotel') loadHoteles();
                if (type === 'evento') loadEventos();
                if (type === 'album') loadGaleria();
                if (type === 'imagen' && currentAlbumId) verAlbum(currentAlbumId);
                if (type === 'blog') loadBlog();
                loadDashboard();
            } else {
                showToast(data.error || 'Error al eliminar', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    };

    document.getElementById('btnConfirmDelete').onclick = deleteCallback;
}

// ==================== GALERÍA ====================

async function loadGaleria() {
    // Resetear a vista de álbumes
    document.getElementById('vistaAlbumes').style.display = 'block';
    document.getElementById('vistaImagenes').style.display = 'none';
    currentAlbumId = null;

    try {
        const res = await fetch(`${API_URL}/galeria`);
        const albumes = await res.json();

        const grid = document.getElementById('galeriaGrid');

        if (albumes.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align:center; padding:60px 20px; color:#999;">
                    <i class="fas fa-images" style="font-size:50px;margin-bottom:15px;display:block;"></i>
                    <p>No hay álbumes todavía. Crea el primero.</p>
                </div>`;
            return;
        }

        grid.innerHTML = albumes.map(album => `
            <div class="album-card">
                <div class="album-card-img" onclick="verAlbum('${album.id}')">
                    ${album.portada
                        ? `<img src="${album.portada}" alt="${album.titulo}" onerror="this.parentElement.innerHTML='<div class=\\'no-portada\\'><i class=\\'fas fa-mountain\\'></i></div>'">`
                        : '<div class="no-portada"><i class="fas fa-mountain"></i></div>'
                    }
                    <span class="album-count"><i class="fas fa-camera"></i> ${(album.imagenes || []).length}</span>
                    ${!album.activo ? '<span class="album-inactive">Inactivo</span>' : ''}
                </div>
                <div class="album-card-body">
                    <h4>${album.titulo}</h4>
                    <p>${album.descripcion || 'Sin descripción'}</p>
                    <div class="album-card-actions">
                        <button class="btn-ver" onclick="verAlbum('${album.id}')">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn-album-edit" onclick="editAlbum('${album.id}'); event.stopPropagation();">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-album-delete" onclick="confirmDelete('album', '${album.id}', '${album.titulo}'); event.stopPropagation();">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading galeria:', error);
        showToast('Error cargando galería', 'error');
    }
}

async function verAlbum(albumId) {
    currentAlbumId = albumId;

    try {
        const res = await fetch(`${API_URL}/galeria/${albumId}`);
        const album = await res.json();

        document.getElementById('vistaAlbumes').style.display = 'none';
        document.getElementById('vistaImagenes').style.display = 'block';
        document.getElementById('albumTituloActual').textContent = album.titulo;
        document.getElementById('albumImagenCount').textContent = `${(album.imagenes || []).length} fotos`;

        const grid = document.getElementById('imagenesGrid');
        const imagenes = album.imagenes || [];

        if (imagenes.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align:center; padding:60px 20px; color:#999;">
                    <i class="fas fa-cloud-upload-alt" style="font-size:50px;margin-bottom:15px;display:block;"></i>
                    <p>Este álbum está vacío. Sube la primera imagen.</p>
                </div>`;
            return;
        }

        grid.innerHTML = imagenes.map(img => `
            <div class="imagen-card">
                <div class="imagen-card-img">
                    <img src="${img.archivo}" alt="${img.titulo}" onerror="this.src='/assets/images/icons/favicon.png'">
                    <button class="btn-portada ${album.portada === img.archivo ? 'is-portada' : ''}"
                            onclick="setPortada('${albumId}', '${img.archivo}')"
                            title="${album.portada === img.archivo ? 'Portada actual' : 'Usar como portada'}">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
                <div class="imagen-card-body">
                    <h5 title="${img.titulo}">${img.titulo}</h5>
                    <div class="imagen-card-actions">
                        <button class="btn-img-edit" onclick="editImagen('${img.id}', '${img.titulo.replace(/'/g, "\\'")}', '${(img.descripcion || '').replace(/'/g, "\\'")}', '${img.archivo}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-img-delete" onclick="confirmDelete('imagen', '${img.id}', '${img.titulo.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading album:', error);
        showToast('Error cargando álbum', 'error');
    }
}

function volverAlbumes() {
    document.getElementById('vistaAlbumes').style.display = 'block';
    document.getElementById('vistaImagenes').style.display = 'none';
    currentAlbumId = null;
    loadGaleria();
}

async function handleAlbumSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = formData.get('id');
    formData.set('album', 'portadas');

    const url = id ? `${API_URL}/galeria/${id}` : `${API_URL}/galeria`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            closeModal('album');
            loadGaleria();
            showToast(id ? 'Álbum actualizado' : 'Álbum creado', 'success');
            form.reset();
        } else {
            showToast(data.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function editAlbum(id) {
    try {
        const res = await fetch(`${API_URL}/galeria/${id}`);
        const album = await res.json();

        const form = document.getElementById('formAlbum');
        form.id.value = album.id;
        form.titulo.value = album.titulo || '';
        form.descripcion.value = album.descripcion || '';
        form.orden.value = album.orden || 1;
        form.activo.value = album.activo ? 'true' : 'false';

        showCurrentImage('albumPortadaPreview', album.portada);

        document.getElementById('modalAlbumTitle').textContent = 'Editar Álbum';
        openModal('album');
    } catch (error) {
        showToast('Error cargando datos del álbum', 'error');
    }
}

async function handleImagenSubmit(e) {
    e.preventDefault();
    if (!currentAlbumId) {
        showToast('Error: no hay álbum seleccionado', 'error');
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    formData.set('album', currentAlbumId);

    try {
        const res = await fetch(`${API_URL}/galeria/${currentAlbumId}/imagenes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            closeModal('imagen');
            verAlbum(currentAlbumId);
            showToast('Imagen subida correctamente', 'success');
            form.reset();
            // Limpiar preview
            const preview = document.getElementById('imagenUploadPreview');
            if (preview) {
                preview.innerHTML = '<span class="no-imagen">Selecciona una imagen</span>';
                preview.classList.remove('has-image');
            }
        } else {
            showToast(data.error || 'Error al subir imagen', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

function editImagen(imgId, titulo, descripcion, archivo) {
    document.getElementById('editarImagenId').value = imgId;
    const form = document.getElementById('formEditarImagen');
    form.titulo.value = titulo;
    form.descripcion.value = descripcion;

    const preview = document.getElementById('editarImagenPreview');
    if (preview) {
        preview.innerHTML = `<img src="${archivo}" alt="${titulo}">`;
        preview.classList.add('has-image');
    }

    openModal('editarImagen');
}

async function handleEditarImagenSubmit(e) {
    e.preventDefault();
    if (!currentAlbumId) return;

    const form = e.target;
    const imgId = document.getElementById('editarImagenId').value;

    try {
        const res = await fetch(`${API_URL}/galeria/${currentAlbumId}/imagenes/${imgId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                titulo: form.titulo.value,
                descripcion: form.descripcion.value
            })
        });

        const data = await res.json();

        if (data.success) {
            closeModal('editarImagen');
            verAlbum(currentAlbumId);
            showToast('Imagen actualizada', 'success');
        } else {
            showToast(data.error || 'Error al actualizar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function setPortada(albumId, imagePath) {
    try {
        const res = await fetch(`${API_URL}/galeria/${albumId}/set-portada`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ portada: imagePath })
        });

        const data = await res.json();

        if (data.success) {
            verAlbum(albumId);
            showToast('Portada actualizada', 'success');
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

// ==================== BLOG ====================

const categoriasNombres = {
    naturaleza: 'Naturaleza',
    cultura: 'Cultura',
    gastronomia: 'Gastronomía',
    senderismo: 'Senderismo',
    historia: 'Historia',
    eventos: 'Eventos',
    general: 'General'
};

async function loadBlog() {
    try {
        const res = await fetch(`${API_URL}/blog`);
        const posts = await res.json();

        const tbody = document.querySelector('#tablaBlog tbody');
        tbody.innerHTML = posts.map(p => `
            <tr>
                <td>
                    <div class="tabla-imagen">
                        ${p.imagen ? `<img src="${p.imagen}" alt="${p.titulo}" onerror="this.src='/assets/images/icons/favicon.png'">` : '<span class="sin-imagen"><i class="fas fa-image"></i></span>'}
                    </div>
                </td>
                <td>
                    <strong>${p.titulo}</strong>
                    ${p.destacado ? '<i class="fas fa-star" style="color:var(--accent);margin-left:5px;" title="Destacado"></i>' : ''}
                    <br><small style="color:#999;">${p.extracto ? (p.extracto.length > 60 ? p.extracto.substring(0, 60) + '...' : p.extracto) : ''}</small>
                </td>
                <td><span class="badge-blog ${p.categoria}">${categoriasNombres[p.categoria] || p.categoria}</span></td>
                <td>${p.creado ? new Date(p.creado).toLocaleDateString('es-CO') : '-'}</td>
                <td><span class="badge-status ${p.activo ? 'activo' : 'borrador'}">${p.activo ? 'Publicado' : 'Borrador'}</span></td>
                <td class="actions">
                    <button class="btn-edit" onclick="editBlog('${p.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="confirmDelete('blog', '${p.id}', '${p.titulo.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading blog:', error);
        showToast('Error cargando publicaciones', 'error');
    }
}

async function handleBlogSubmit(e) {
    e.preventDefault();
    const form = e.target;

    // Sincronizar contenido del editor al textarea oculto
    const editor = document.getElementById('blogEditor');
    document.getElementById('blogContenido').value = editor.innerHTML;

    const formData = new FormData(form);
    const id = formData.get('id');

    const url = id ? `${API_URL}/blog/${id}` : `${API_URL}/blog`;
    const method = id ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: formData
        });

        const data = await res.json();

        if (data.success) {
            closeModal('blog');
            loadBlog();
            loadDashboard();
            showToast(id ? 'Publicación actualizada' : 'Publicación creada', 'success');
            form.reset();
            editor.innerHTML = '';
        } else {
            showToast(data.error || 'Error al guardar', 'error');
        }
    } catch (error) {
        showToast('Error de conexión', 'error');
    }
}

async function editBlog(id) {
    try {
        const res = await fetch(`${API_URL}/blog/${id}`);
        const post = await res.json();

        const form = document.getElementById('formBlog');
        form.id.value = post.id;
        form.titulo.value = post.titulo || '';
        form.categoria.value = post.categoria || 'general';
        form.autor.value = post.autor || 'Admin';
        form.extracto.value = post.extracto || '';
        form.tags.value = (post.tags || []).join(', ');
        form.destacado.checked = post.destacado || false;
        form.activo.value = post.activo ? 'true' : 'false';

        // Cargar contenido en el editor
        const editor = document.getElementById('blogEditor');
        editor.innerHTML = post.contenido || '';

        // Imagen
        showCurrentImage('blogImagenPreview', post.imagen);

        document.getElementById('modalBlogTitle').textContent = 'Editar Publicación';
        openModal('blog');
    } catch (error) {
        showToast('Error cargando publicación', 'error');
    }
}

// ==================== MENSAJES ====================

async function loadMensajes() {
    try {
        const res = await fetch(`${API_URL}/contacto`, {
            headers: getAuthHeaders()
        });
        const mensajes = await res.json();

        // Actualizar badge
        const noLeidos = mensajes.filter(m => !m.leido).length;
        const badge = document.getElementById('mensajesBadge');
        if (noLeidos > 0) {
            badge.textContent = noLeidos;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }

        document.getElementById('mensajesTotal').textContent = `${mensajes.length} mensaje${mensajes.length !== 1 ? 's' : ''}`;

        const container = document.getElementById('mensajesContainer');

        if (mensajes.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:50px 20px;color:#999;">
                    <i class="fas fa-inbox" style="font-size:45px;margin-bottom:15px;display:block;"></i>
                    <p>No hay mensajes todavía</p>
                </div>`;
            return;
        }

        container.innerHTML = mensajes.map(m => {
            const fecha = new Date(m.creado);
            const fechaTexto = fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            return `
                <div class="mensaje-card ${m.leido ? '' : 'no-leido'}">
                    <div class="mensaje-header">
                        <div class="mensaje-info">
                            <strong>${m.nombre}</strong>
                            <span class="mensaje-email">${m.email}</span>
                            ${m.telefono ? `<span class="mensaje-tel"><i class="fas fa-phone-alt"></i> ${m.telefono}</span>` : ''}
                        </div>
                        <div class="mensaje-meta">
                            <span class="mensaje-asunto">${m.asunto || 'Sin asunto'}</span>
                            <span class="mensaje-fecha">${fechaTexto}</span>
                        </div>
                    </div>
                    <div class="mensaje-body">
                        <p>${m.mensaje.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div class="mensaje-actions">
                        ${!m.leido ? `<button class="btn-msg-leido" onclick="marcarLeido('${m.id}')"><i class="fas fa-check"></i> Marcar como leído</button>` : '<span class="msg-leido-badge"><i class="fas fa-check-double"></i> Leído</span>'}
                        <button class="btn-msg-delete" onclick="eliminarMensaje('${m.id}', '${m.nombre.replace(/'/g, "\\'")}')"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading mensajes:', error);
        showToast('Error cargando mensajes', 'error');
    }
}

async function marcarLeido(id) {
    try {
        const res = await fetch(`${API_URL}/contacto/${id}/leido`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success) {
            loadMensajes();
        }
    } catch (error) {
        showToast('Error actualizando mensaje', 'error');
    }
}

async function eliminarMensaje(id, nombre) {
    if (!confirm(`¿Eliminar el mensaje de "${nombre}"?`)) return;

    try {
        const res = await fetch(`${API_URL}/contacto/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await res.json();
        if (data.success) {
            loadMensajes();
            showToast('Mensaje eliminado', 'success');
        }
    } catch (error) {
        showToast('Error eliminando mensaje', 'error');
    }
}

// Cargar badge de mensajes al inicio
async function loadMensajesBadge() {
    try {
        const res = await fetch(`${API_URL}/contacto`, {
            headers: getAuthHeaders()
        });
        const mensajes = await res.json();
        const noLeidos = mensajes.filter(m => !m.leido).length;
        const badge = document.getElementById('mensajesBadge');
        if (noLeidos > 0) {
            badge.textContent = noLeidos;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        // Silencioso
    }
}

// ==================== EDITOR DE TEXTO ENRIQUECIDO ====================

function execCmd(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('blogEditor').focus();
}

function insertEditorLink() {
    const url = prompt('URL del enlace:', 'https://');
    if (url) {
        document.execCommand('createLink', false, url);
        document.getElementById('blogEditor').focus();
    }
}

// ==================== TOAST NOTIFICATIONS ====================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle'
    };

    toast.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
