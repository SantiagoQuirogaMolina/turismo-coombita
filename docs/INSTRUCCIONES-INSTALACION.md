# 🚀 Instrucciones de Instalación y Uso

## Sistema de Administración - Turismo Cómbita

---

## 📋 Requisitos Previos

1. **Node.js** (versión 14 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica instalación: `node --version`

2. **NPM** (viene con Node.js)
   - Verifica instalación: `npm --version`

---

## 🔧 Instalación Paso a Paso

### Paso 1: Abrir Terminal
```bash
# Navega a la carpeta backend
cd "D:\TURISMO\turismo combita\Base-Web-Turismo\Code-by-Santiago\backend"
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Inicializar Base de Datos
```bash
npm run init-db
```

Este comando creará:
- Base de datos SQLite local
- Todas las tablas necesarias
- Usuario admin por defecto
- Datos de ejemplo

### Paso 4: Iniciar el Servidor
```bash
npm start
```

O para modo desarrollo (con auto-reinicio):
```bash
npm run dev
```

---

## 🎯 Acceder al Sistema

### Panel de Administración
1. Abre tu navegador
2. Ve a: **http://localhost:3000/admin**
3. Credenciales por defecto:
   - **Email:** admin@turismocombita.com
   - **Contraseña:** admin123

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer login

---

## 📱 Funcionalidades Disponibles

### ✅ Ya Funcionando:
- ✅ Sistema de login con JWT
- ✅ Dashboard con estadísticas
- ✅ CRUD completo de Hospedajes
- ✅ Sistema de mensajes
- ✅ Base de datos SQLite local
- ✅ API REST completa
- ✅ Panel admin responsive

### 🚧 En Desarrollo:
- ⏳ CRUD Restaurantes
- ⏳ CRUD Caminatas
- ⏳ CRUD Eventos
- ⏳ Galería de imágenes
- ⏳ Blog
- ⏳ Sistema de backup automático

---

## 🔌 Conectar con tu Frontend

### En tus archivos HTML actuales, agrega:

```html
<!-- En shelters.html para cargar hospedajes -->
<script>
async function cargarHospedajes() {
    try {
        const response = await fetch('http://localhost:3000/api/hospedajes');
        const data = await response.json();

        if (data.success) {
            const container = document.getElementById('hospedajes-container');
            container.innerHTML = data.data.map(h => `
                <div class="cnt-box-info">
                    <div class="caption">
                        <h2>${h.nombre}</h2>
                        <p>${h.descripcion}</p>
                        <p>Desde $${h.precio_desde}</p>
                        <a href="tel:${h.telefono}" class="btn">Llamar</a>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar al iniciar la página
document.addEventListener('DOMContentLoaded', cargarHospedajes);
</script>
```

### Para el formulario de contacto:

```html
<!-- En contacts.html -->
<script>
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        asunto: document.getElementById('asunto').value,
        mensaje: document.getElementById('mensaje').value
    };

    try {
        const response = await fetch('http://localhost:3000/api/mensajes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('¡Mensaje enviado! Te responderemos pronto.');
            e.target.reset();
        } else {
            alert('Error al enviar el mensaje');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});
</script>
```

---

## 🛠️ Comandos Útiles

```bash
# Iniciar servidor
npm start

# Modo desarrollo
npm run dev

# Reinicializar base de datos
npm run init-db

# Hacer backup manual
npm run backup
```

---

## 📁 Estructura de Archivos

```
backend/
├── server.js              # Servidor principal
├── database.db            # Base de datos SQLite
├── package.json           # Dependencias
├── .env                   # Variables de entorno
├── admin/                 # Panel de administración
│   ├── index.html        # HTML del panel
│   ├── styles.css        # Estilos CSS
│   └── admin.js          # JavaScript del panel
├── config/
│   └── init-database.js  # Script de inicialización
├── middleware/
│   └── auth.js           # Autenticación JWT
├── routes/               # Rutas API
│   ├── auth.js
│   ├── hospedajes.js
│   ├── mensajes.js
│   └── ...
├── uploads/              # Imágenes subidas
└── backups/              # Copias de seguridad
```

---

## 🔒 Seguridad

### Cambiar contraseña admin:
1. Inicia sesión en el panel
2. Ve a Configuración
3. Cambia la contraseña

### Configurar HTTPS (producción):
1. Obtén certificado SSL
2. Actualiza server.js con certificados
3. Cambia URLs a https://

---

## 🐛 Solución de Problemas

### Error: "Cannot find module..."
```bash
# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: "Port 3000 is already in use"
```bash
# Cambiar puerto en .env
PORT=3001
```

### Base de datos corrupta:
```bash
# Restaurar desde backup
cp backups/ultimo-backup.db database.db
```

### No puedo acceder desde otro dispositivo:
```bash
# Cambiar en server.js
app.listen(PORT, '0.0.0.0', () => {
```

---

## 📞 Soporte

### Si necesitas ayuda:

1. **Revisa los logs:**
   ```bash
   # Los errores aparecen en la consola donde ejecutaste npm start
   ```

2. **Verifica la base de datos:**
   - El archivo `database.db` debe existir en la carpeta backend

3. **Prueba las APIs:**
   - Usa Postman o el navegador
   - Ejemplo: http://localhost:3000/api/hospedajes

---

## 🚀 Próximos Pasos

1. **Personalizar el diseño:**
   - Editar `admin/styles.css`
   - Cambiar colores en `:root`

2. **Agregar más campos:**
   - Modificar `config/init-database.js`
   - Actualizar rutas en `routes/`

3. **Subir a producción:**
   - Usar servicios como Heroku, Railway o tu propio VPS
   - Configurar variables de entorno
   - Activar HTTPS

---

## 📝 Notas Importantes

- La base de datos se guarda en un archivo local `database.db`
- Las imágenes se guardan en la carpeta `uploads/`
- Los backups se crean automáticamente cada día a las 2 AM
- El token JWT expira en 7 días

---

## ✨ Tips

1. **Para desarrollo:** Usa `npm run dev` para reinicio automático
2. **Para producción:** Configura PM2 para mantener el servidor activo
3. **Backups:** Copia regularmente el archivo `database.db`
4. **Seguridad:** Cambia el JWT_SECRET en el archivo .env

---

¡Listo! Tu sistema de administración está funcionando. 🎉

Si tienes problemas, revisa la consola donde ejecutaste `npm start` para ver los errores detallados.