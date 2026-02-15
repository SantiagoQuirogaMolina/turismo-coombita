/**
 * Sistema de Autenticación para el Frontend
 * Turismo Cómbita
 */

(function() {
    const API_URL = 'http://localhost:3000/api';

    // Obtener información del usuario actual
    function getCurrentUser() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    // Obtener token
    function getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // Verificar si el usuario está logueado
    function isLoggedIn() {
        return !!getAuthToken();
    }

    // Cerrar sesión
    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
        window.location.reload();
    }

    // Agregar botón de login/usuario al menú
    function addAuthButton() {
        const menu = document.querySelector('.menu-cnt > ul');
        if (!menu) return;

        const user = getCurrentUser();
        const authItem = document.createElement('li');
        authItem.className = 'auth-menu-item';
        authItem.style.cssText = 'margin-left: 20px;';

        if (isLoggedIn() && user) {
            // Usuario logueado
            authItem.innerHTML = `
                <div class="dropdown" style="position: relative;">
                    <a href="#" class="user-menu" style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 32px; height: 32px; background: #699073; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                            ${user.nombre.charAt(0).toUpperCase()}
                        </span>
                        <span>${user.nombre.split(' ')[0]}</span>
                    </a>
                    <ul class="user-dropdown" style="display: none; position: absolute; right: 0; top: 100%; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 8px; padding: 10px 0; min-width: 200px; z-index: 1000;">
                        ${user.rol === 'admin' || user.tipo === 'admin' ? `
                            <li style="list-style: none;">
                                <a href="/admin-panel" style="display: block; padding: 10px 20px; color: #2d3e33; text-decoration: none; hover: background: #f5f5f5;">
                                    <i class="fas fa-cog" style="margin-right: 8px;"></i> Panel Admin
                                </a>
                            </li>
                        ` : ''}
                        <li style="list-style: none;">
                            <a href="/mi-perfil.html" style="display: block; padding: 10px 20px; color: #2d3e33; text-decoration: none;">
                                <i class="fas fa-user" style="margin-right: 8px;"></i> Mi Perfil
                            </a>
                        </li>
                        <li style="list-style: none;">
                            <a href="/mis-experiencias.html" style="display: block; padding: 10px 20px; color: #2d3e33; text-decoration: none;">
                                <i class="fas fa-star" style="margin-right: 8px;"></i> Mis Experiencias
                            </a>
                        </li>
                        <li style="list-style: none; border-top: 1px solid #eee; margin-top: 5px; padding-top: 5px;">
                            <a href="#" onclick="logout(); return false;" style="display: block; padding: 10px 20px; color: #dc3545; text-decoration: none;">
                                <i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i> Cerrar Sesión
                            </a>
                        </li>
                    </ul>
                </div>
            `;

            // Agregar funcionalidad dropdown
            setTimeout(() => {
                const userMenu = authItem.querySelector('.user-menu');
                const dropdown = authItem.querySelector('.user-dropdown');

                userMenu.addEventListener('click', (e) => {
                    e.preventDefault();
                    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                });

                // Cerrar dropdown al hacer click fuera
                document.addEventListener('click', (e) => {
                    if (!authItem.contains(e.target)) {
                        dropdown.style.display = 'none';
                    }
                });
            }, 100);

        } else {
            // Usuario no logueado
            authItem.innerHTML = `
                <a href="/login.html" style="background: #699073; color: white; padding: 10px 20px; border-radius: 25px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s;">
                    <i class="fas fa-user" style="font-size: 14px;">👤</i>
                    <span>Iniciar Sesión</span>
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
        const commentSection = document.querySelector('.comments-section');

        if (!commentSection) {
            // Crear sección de comentarios si no existe
            const postContent = document.querySelector('.post-content, article, main');
            if (postContent) {
                const newCommentSection = document.createElement('div');
                newCommentSection.className = 'comments-section';
                newCommentSection.style.cssText = 'margin-top: 50px; padding: 30px; background: #f9f9f9; border-radius: 8px;';

                if (isLoggedIn()) {
                    newCommentSection.innerHTML = `
                        <h3 style="margin-bottom: 20px; color: #2d3e33;">Comparte tu Experiencia</h3>
                        <form id="commentForm" style="margin-bottom: 30px;">
                            <textarea id="commentText" placeholder="Cuéntanos tu experiencia en Cómbita..."
                                      style="width: 100%; min-height: 100px; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-family: inherit; font-size: 14px; resize: vertical;"></textarea>
                            <button type="submit" style="margin-top: 10px; background: #699073; color: white; padding: 10px 30px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                Compartir Experiencia
                            </button>
                        </form>
                        <div id="commentsList">
                            <!-- Los comentarios se cargarán aquí -->
                        </div>
                    `;
                } else {
                    newCommentSection.innerHTML = `
                        <div style="text-align: center; padding: 40px;">
                            <p style="color: #666; margin-bottom: 20px;">Para compartir tu experiencia, necesitas iniciar sesión</p>
                            <a href="/login.html" style="background: #699073; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; display: inline-block;">
                                Iniciar Sesión
                            </a>
                        </div>
                    `;
                }

                postContent.appendChild(newCommentSection);

                // Agregar funcionalidad al formulario
                if (isLoggedIn()) {
                    document.getElementById('commentForm').addEventListener('submit', async (e) => {
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
                                alert('¡Gracias por compartir tu experiencia!');
                                document.getElementById('commentText').value = '';
                                // Recargar comentarios
                                loadComments();
                            }
                        } catch (error) {
                            alert('Error al enviar tu experiencia');
                        }
                    });

                    // Cargar comentarios existentes
                    loadComments();
                }
            }
        }
    }

    // Cargar comentarios
    async function loadComments() {
        try {
            const response = await fetch(`${API_URL}/blog/comentarios/1`); // ID del post
            if (response.ok) {
                const data = await response.json();
                const commentsList = document.getElementById('commentsList');

                if (data.data && data.data.length > 0) {
                    commentsList.innerHTML = '<h4 style="margin-bottom: 20px;">Experiencias Compartidas</h4>' +
                        data.data.map(c => `
                            <div style="background: white; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                    <strong style="color: #699073;">${c.usuario_nombre}</strong>
                                    <small style="color: #999;">${new Date(c.fecha).toLocaleDateString('es-CO')}</small>
                                </div>
                                <p style="color: #666; line-height: 1.6;">${c.comentario}</p>
                            </div>
                        `).join('');
                } else {
                    commentsList.innerHTML = '<p style="text-align: center; color: #999;">Sé el primero en compartir tu experiencia</p>';
                }
            }
        } catch (error) {
            console.error('Error cargando comentarios:', error);
        }
    }

    // Hacer funciones globales
    window.logout = logout;
    window.isLoggedIn = isLoggedIn;
    window.getCurrentUser = getCurrentUser;

    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addAuthButton();
            addCommentSystem();
        });
    } else {
        addAuthButton();
        addCommentSystem();
    }
})();