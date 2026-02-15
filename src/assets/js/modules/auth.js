/**
 * Sistema de Autenticación Mejorado para el Frontend
 * Turismo Cómbita
 */

(function() {
    // Usar configuración global si está disponible, sino usar localhost:3000
    const API_URL = window.API_CONFIG ? window.API_CONFIG.API_URL : 'http://localhost:3000/api';
    console.log('Auth system usando API:', API_URL);

    // Obtener información del usuario actual
    function getCurrentUser() {
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        const userRole = localStorage.getItem('userRole');

        if (userName && userEmail) {
            return {
                nombre: userName,
                email: userEmail,
                rol: userRole
            };
        }
        return null;
    }

    // Obtener token
    function getAuthToken() {
        return localStorage.getItem('token');
    }

    // Verificar si el usuario está logueado
    function isLoggedIn() {
        return !!getAuthToken();
    }

    // Cerrar sesión
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('rememberLogin');
        window.location.reload();
    }

    // Agregar botón de login/usuario al menú
    function addAuthButton() {
        // Buscar el menú principal
        const menu = document.querySelector('#main-menu');
        if (!menu) return;

        const user = getCurrentUser();
        const authItem = document.createElement('li');

        if (isLoggedIn() && user) {
            // Usuario logueado - Crear dropdown
            authItem.className = 'dropdown';
            authItem.innerHTML = `
                <a href="#" style="color: inherit !important;">
                    <span style="display: inline-block; width: 28px; height: 28px; background: #DDA15E; color: white; border-radius: 50%; text-align: center; line-height: 28px; font-weight: bold; margin-right: 8px;">
                        ${user.nombre.charAt(0).toUpperCase()}
                    </span>
                    ${user.nombre.split(' ')[0]}
                </a>
                <ul>
                    ${user.rol === 'admin' || user.tipo === 'admin' ? `
                        <li>
                            <a href="/admin-panel" style="color: #2d3e33 !important;">
                                📊 Panel Admin
                            </a>
                        </li>
                    ` : ''}
                    <li>
                        <a href="#" style="color: #2d3e33 !important;">
                            👤 Mi Perfil
                        </a>
                    </li>
                    <li>
                        <a href="#" style="color: #2d3e33 !important;">
                            ⭐ Mis Experiencias
                        </a>
                    </li>
                    <li>
                        <a href="#" onclick="logout(); return false;" style="color: #dc3545 !important;">
                            🚪 Cerrar Sesión
                        </a>
                    </li>
                </ul>
            `;
        } else {
            // Usuario no logueado - Botón simple que coincide con el estilo del menú
            authItem.innerHTML = `
                <a href="/login.html" style="color: inherit !important;">
                    <span style="display: inline-block; padding: 6px 16px; background: #699073; color: white !important; border-radius: 20px; font-size: 13px; font-weight: 600;">
                        Iniciar Sesión
                    </span>
                </a>
            `;
        }

        menu.appendChild(authItem);
    }

    // Agregar funcionalidad para compartir experiencias en el blog
    function addCommentSystem() {
        // Solo en páginas de blog
        if (!window.location.pathname.includes('blog') && !window.location.pathname.includes('post')) return;

        const user = getCurrentUser();
        const article = document.querySelector('article, .post-content, main');

        if (!article) return;

        // Buscar o crear sección de comentarios
        let commentSection = document.querySelector('.comments-section');

        if (!commentSection) {
            commentSection = document.createElement('div');
            commentSection.className = 'comments-section';
            commentSection.style.cssText = `
                margin-top: 60px;
                padding: 40px;
                background: linear-gradient(to bottom, #f9f9f9, #ffffff);
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            `;

            if (isLoggedIn()) {
                commentSection.innerHTML = `
                    <h3 style="color: #2d3e33; margin-bottom: 25px; font-size: 24px;">
                        🌟 Comparte tu Experiencia en Cómbita
                    </h3>
                    <form id="commentForm" style="margin-bottom: 40px;">
                        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                            <textarea id="commentText"
                                      placeholder="Cuéntanos sobre tu visita a Cómbita, los lugares que conociste, la comida que probaste..."
                                      style="width: 100%; min-height: 120px; padding: 15px; border: 2px solid #e0e0e0; border-radius: 6px; font-family: inherit; font-size: 15px; resize: vertical; transition: border-color 0.3s;"
                                      onfocus="this.style.borderColor='#699073'"
                                      onblur="this.style.borderColor='#e0e0e0'"></textarea>
                            <button type="submit" style="margin-top: 15px; background: #699073; color: white; padding: 12px 35px; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; font-size: 15px; transition: all 0.3s;"
                                    onmouseover="this.style.background='#567760'; this.style.transform='translateY(-2px)'"
                                    onmouseout="this.style.background='#699073'; this.style.transform='translateY(0)'">
                                ✨ Compartir Experiencia
                            </button>
                        </div>
                    </form>
                    <div id="commentsList">
                        <!-- Los comentarios se cargarán aquí -->
                    </div>
                `;
            } else {
                commentSection.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 8px;">
                        <h3 style="color: #2d3e33; margin-bottom: 20px;">💭 ¿Quieres compartir tu experiencia?</h3>
                        <p style="color: #666; margin-bottom: 25px; font-size: 16px;">
                            Inicia sesión para contarnos sobre tu visita a Cómbita
                        </p>
                        <a href="/login.html" style="display: inline-block; background: #699073; color: white; padding: 14px 40px; border-radius: 25px; text-decoration: none; font-weight: 600; transition: all 0.3s;"
                           onmouseover="this.style.background='#567760'; this.style.transform='translateY(-2px)'"
                           onmouseout="this.style.background='#699073'; this.style.transform='translateY(0)'">
                            Iniciar Sesión
                        </a>
                    </div>
                `;
            }

            article.appendChild(commentSection);

            // Agregar funcionalidad al formulario
            if (isLoggedIn()) {
                const form = document.getElementById('commentForm');
                if (form) {
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const comentario = document.getElementById('commentText').value;

                        if (!comentario.trim()) {
                            alert('Por favor escribe tu experiencia');
                            return;
                        }

                        try {
                            const response = await fetch(`${API_URL}/blog/comentarios`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${getAuthToken()}`
                                },
                                body: JSON.stringify({
                                    post_id: 1, // Aquí deberías obtener el ID real del post
                                    comentario: comentario
                                })
                            });

                            if (response.ok) {
                                alert('¡Gracias por compartir tu experiencia! 🎉');
                                document.getElementById('commentText').value = '';
                                loadComments();
                            }
                        } catch (error) {
                            alert('Error al enviar tu experiencia');
                        }
                    });
                }

                loadComments();
            }
        }
    }

    // Cargar comentarios
    async function loadComments() {
        try {
            const response = await fetch(`${API_URL}/blog/comentarios/1`);
            if (response.ok) {
                const data = await response.json();
                const commentsList = document.getElementById('commentsList');

                if (!commentsList) return;

                if (data.data && data.data.length > 0) {
                    commentsList.innerHTML = `
                        <h4 style="color: #2d3e33; margin-bottom: 25px; font-size: 20px;">
                            📖 Experiencias de otros visitantes
                        </h4>
                        ${data.data.map(c => `
                            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); border-left: 4px solid #DDA15E;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                    <div style="display: flex; align-items: center;">
                                        <span style="width: 36px; height: 36px; background: #699073; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 12px;">
                                            ${c.usuario_nombre.charAt(0).toUpperCase()}
                                        </span>
                                        <strong style="color: #2d3e33; font-size: 16px;">${c.usuario_nombre}</strong>
                                    </div>
                                    <small style="color: #999;">
                                        📅 ${new Date(c.fecha).toLocaleDateString('es-CO', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </small>
                                </div>
                                <p style="color: #555; line-height: 1.7; font-size: 15px; margin: 0;">
                                    ${c.comentario}
                                </p>
                            </div>
                        `).join('')}
                    `;
                } else {
                    commentsList.innerHTML = `
                        <div style="text-align: center; padding: 40px; background: white; border-radius: 8px;">
                            <p style="color: #999; font-size: 16px;">
                                🌱 Sé el primero en compartir tu experiencia en Cómbita
                            </p>
                        </div>
                    `;
                }
            }
        } catch (error) {
            console.error('Error cargando comentarios:', error);
        }
    }

    // Función para actualizar el botón de login existente en el navbar
    function updateLoginButton() {
        const btnLogin = document.getElementById('btnLogin');
        const btnText = document.getElementById('btnLoginText');

        if (!btnLogin || !btnText) return;

        const user = getCurrentUser();

        if (isLoggedIn() && user) {
            // Usuario logueado - cambiar el texto del botón
            btnText.textContent = user.nombre.split(' ')[0]; // Primer nombre
            btnLogin.href = '#';
            btnLogin.title = 'Click para ver opciones';

            // Crear menú dropdown al hacer click
            btnLogin.onclick = function(e) {
                e.preventDefault();

                // Si ya existe el menú, eliminarlo
                const existingMenu = document.getElementById('userDropdownMenu');
                if (existingMenu) {
                    existingMenu.remove();
                    return;
                }

                // Crear menú dropdown
                const dropdownMenu = document.createElement('div');
                dropdownMenu.id = 'userDropdownMenu';
                dropdownMenu.style.cssText = `
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border: 1px solid rgba(105, 144, 115, 0.2);
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                    margin-top: 10px;
                    min-width: 200px;
                    z-index: 1000;
                `;

                dropdownMenu.innerHTML = `
                    <div style="padding: 15px; border-bottom: 1px solid #eee;">
                        <div style="font-weight: 600; color: #2d3e33;">${user.nombre}</div>
                        <div style="font-size: 12px; color: #666; margin-top: 3px;">${user.rol === 'admin' ? 'Administrador' : user.rol === 'editor' ? 'Editor' : 'Usuario'}</div>
                    </div>
                    ${user.rol === 'admin' || user.rol === 'editor' ? `
                    <a href="/admin-panel" style="display: block; padding: 12px 15px; color: #2d3e33; text-decoration: none; transition: background 0.3s;">
                        <i class="fas fa-tachometer-alt" style="margin-right: 10px; color: #699073;"></i> Panel Admin
                    </a>
                    ` : ''}
                    <a href="#" onclick="logout(); return false;" style="display: block; padding: 12px 15px; color: #2d3e33; text-decoration: none; transition: background 0.3s; border-top: 1px solid #eee;">
                        <i class="fas fa-sign-out-alt" style="margin-right: 10px; color: #DDA15E;"></i> Cerrar Sesión
                    </a>
                `;

                // Agregar estilos hover
                dropdownMenu.querySelectorAll('a').forEach(link => {
                    link.onmouseover = function() {
                        this.style.background = '#f8f9fa';
                    };
                    link.onmouseout = function() {
                        this.style.background = 'transparent';
                    };
                });

                // Agregar al contenedor del botón
                btnLogin.parentElement.style.position = 'relative';
                btnLogin.parentElement.appendChild(dropdownMenu);

                // Cerrar al hacer click fuera
                setTimeout(() => {
                    document.addEventListener('click', function closeDropdown(e) {
                        if (!btnLogin.parentElement.contains(e.target)) {
                            const menu = document.getElementById('userDropdownMenu');
                            if (menu) menu.remove();
                            document.removeEventListener('click', closeDropdown);
                        }
                    });
                }, 0);
            };
        } else {
            // Usuario no logueado - botón normal
            btnText.textContent = 'Ingresar';
            btnLogin.href = 'login.html';
            btnLogin.onclick = null;
        }
    }

    // Hacer funciones globales
    window.logout = logout;
    window.isLoggedIn = isLoggedIn;
    window.getCurrentUser = getCurrentUser;
    window.updateLoginButton = updateLoginButton;

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                // addAuthButton(); // Comentado para evitar duplicación - usamos el botón del navbar
                updateLoginButton(); // Actualizar el botón existente
                addCommentSystem();
            }, 100);
        });
    } else {
        setTimeout(() => {
            // addAuthButton(); // Comentado para evitar duplicación - usamos el botón del navbar
            updateLoginButton(); // Actualizar el botón existente
            addCommentSystem();
        }, 100);
    }
})();