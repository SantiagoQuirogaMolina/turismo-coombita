# 🚀 Guía de Implementación Paso a Paso

## OPCIÓN RÁPIDA: Usar Strapi (15 minutos)

### Paso 1: Instalar Strapi
```bash
# Crear carpeta para el backend
mkdir backend-combita
cd backend-combita

# Instalar Strapi
npx create-strapi-app@latest . --quickstart
```

### Paso 2: Crear Tipos de Contenido
1. Ir a http://localhost:1337/admin
2. Click en "Content-Type Builder"
3. Crear los siguientes tipos:

**Hospedaje:**
- nombre (Text)
- descripcion (Rich text)
- precio_desde (Number)
- servicios (JSON)
- imagenes (Media - Multiple)
- telefono (Text)
- whatsapp (Text)
- ubicacion (Text)
- activo (Boolean)

### Paso 3: Conectar con tu Frontend
```javascript
// En tu archivo JavaScript actual
async function cargarHospedajes() {
    const response = await fetch('http://localhost:1337/api/hospedajes?populate=*');
    const data = await response.json();

    // Renderizar en tu HTML
    const container = document.getElementById('hospedajes-list');
    data.data.forEach(hospedaje => {
        container.innerHTML += `
            <div class="cnt-box-info">
                <img src="${hospedaje.attributes.imagenes.data[0].attributes.url}" alt="">
                <div class="caption">
                    <h2>${hospedaje.attributes.nombre}</h2>
                    <p>${hospedaje.attributes.descripcion}</p>
                    <p class="price">Desde $${hospedaje.attributes.precio_desde}</p>
                </div>
            </div>
        `;
    });
}
```

---

## OPCIÓN COMPLETA: Sistema Custom

### Paso 1: Estructura de Carpetas
```bash
# Crear estructura
mkdir turismo-admin
cd turismo-admin
mkdir backend admin
```

### Paso 2: Backend con Express
```javascript
// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/turismo_combita', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Modelos
const HospedajeSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    descripcion: String,
    tipo: {
        type: String,
        enum: ['Hotel', 'Hostal', 'Cabaña', 'Camping', 'Glamping']
    },
    precio_desde: Number,
    servicios: [String],
    imagenes: [{
        url: String,
        principal: Boolean
    }],
    contacto: {
        telefono: String,
        whatsapp: String,
        email: String
    },
    ubicacion: String,
    activo: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const Hospedaje = mongoose.model('Hospedaje', HospedajeSchema);

// Rutas API
app.get('/api/hospedajes', async (req, res) => {
    try {
        const hospedajes = await Hospedaje.find({ activo: true });
        res.json(hospedajes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/hospedajes', async (req, res) => {
    try {
        const hospedaje = new Hospedaje(req.body);
        await hospedaje.save();
        res.json(hospedaje);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
```

### Paso 3: Panel de Administración HTML
```html
<!-- admin/index.html -->
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Turismo Cómbita</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: #f5f5f5;
        }

        .admin-container {
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
            width: 250px;
            background: #2d3e33;
            color: white;
            padding: 20px;
        }

        .sidebar h2 {
            margin-bottom: 30px;
            color: #DDA15E;
        }

        .menu-item {
            display: block;
            padding: 12px 15px;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-bottom: 5px;
            transition: background 0.3s;
        }

        .menu-item:hover,
        .menu-item.active {
            background: #699073;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            padding: 30px;
        }

        .header {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }

        .stat-card h3 {
            color: #2d3e33;
            font-size: 14px;
            margin-bottom: 10px;
        }

        .stat-card .number {
            font-size: 32px;
            font-weight: bold;
            color: #699073;
        }

        /* Forms */
        .form-container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #2d3e33;
            font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }

        .form-group textarea {
            min-height: 100px;
            resize: vertical;
        }

        .btn {
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s;
        }

        .btn-primary {
            background: #699073;
            color: white;
        }

        .btn-primary:hover {
            background: #567760;
        }

        .btn-secondary {
            background: #DDA15E;
            color: white;
            margin-left: 10px;
        }

        /* Table */
        .table-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            color: #2d3e33;
            font-weight: 600;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }

        .action-btns {
            display: flex;
            gap: 5px;
        }

        .btn-edit,
        .btn-delete {
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
        }

        .btn-edit {
            background: #699073;
            color: white;
        }

        .btn-delete {
            background: #dc3545;
            color: white;
        }

        /* Messages */
        .message-item {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }

        .message-from {
            font-weight: 600;
            color: #2d3e33;
        }

        .message-date {
            color: #666;
            font-size: 14px;
        }

        .message-content {
            color: #666;
            line-height: 1.6;
        }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
        }

        .badge-new {
            background: #dc3545;
            color: white;
        }

        .badge-replied {
            background: #28a745;
            color: white;
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <h2>Admin Panel</h2>
            <nav>
                <a href="#dashboard" class="menu-item active">📊 Dashboard</a>
                <a href="#hospedajes" class="menu-item">🏨 Hospedajes</a>
                <a href="#restaurantes" class="menu-item">🍽️ Restaurantes</a>
                <a href="#caminatas" class="menu-item">🥾 Caminatas</a>
                <a href="#eventos" class="menu-item">📅 Eventos</a>
                <a href="#galeria" class="menu-item">📷 Galería</a>
                <a href="#blog" class="menu-item">📝 Blog</a>
                <a href="#mensajes" class="menu-item">
                    ✉️ Mensajes
                    <span class="badge badge-new">3</span>
                </a>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Dashboard -->
            <section id="dashboard-section">
                <div class="header">
                    <h1>Dashboard</h1>
                    <p>Bienvenido al panel de administración de Turismo Cómbita</p>
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Mensajes Nuevos</h3>
                        <div class="number">5</div>
                    </div>
                    <div class="stat-card">
                        <h3>Hospedajes</h3>
                        <div class="number">12</div>
                    </div>
                    <div class="stat-card">
                        <h3>Restaurantes</h3>
                        <div class="number">8</div>
                    </div>
                    <div class="stat-card">
                        <h3>Visitas Hoy</h3>
                        <div class="number">127</div>
                    </div>
                </div>

                <!-- Recent Messages -->
                <h2 style="margin-bottom: 20px;">Mensajes Recientes</h2>
                <div class="message-item">
                    <div class="message-header">
                        <span class="message-from">Juan Pérez</span>
                        <span class="message-date">Hace 2 horas</span>
                    </div>
                    <div class="message-content">
                        Hola, quisiera información sobre las caminatas al páramo...
                    </div>
                    <button class="btn btn-primary" style="margin-top: 10px;">Responder</button>
                </div>
            </section>

            <!-- Add Hospedaje Form (Hidden by default) -->
            <section id="hospedaje-form" style="display: none;">
                <div class="header">
                    <h1>Agregar Hospedaje</h1>
                </div>

                <div class="form-container">
                    <form id="formHospedaje">
                        <div class="form-group">
                            <label>Nombre del Hospedaje</label>
                            <input type="text" name="nombre" required>
                        </div>

                        <div class="form-group">
                            <label>Tipo</label>
                            <select name="tipo">
                                <option value="Hotel">Hotel</option>
                                <option value="Hostal">Hostal</option>
                                <option value="Cabaña">Cabaña</option>
                                <option value="Camping">Camping</option>
                                <option value="Glamping">Glamping</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Descripción</label>
                            <textarea name="descripcion"></textarea>
                        </div>

                        <div class="form-group">
                            <label>Precio desde (COP)</label>
                            <input type="number" name="precio_desde">
                        </div>

                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" name="telefono">
                        </div>

                        <div class="form-group">
                            <label>WhatsApp</label>
                            <input type="tel" name="whatsapp">
                        </div>

                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email">
                        </div>

                        <div class="form-group">
                            <label>Dirección</label>
                            <input type="text" name="ubicacion">
                        </div>

                        <div class="form-group">
                            <label>Servicios (separados por coma)</label>
                            <input type="text" name="servicios" placeholder="WiFi, Parqueadero, Desayuno">
                        </div>

                        <button type="submit" class="btn btn-primary">Guardar</button>
                        <button type="button" class="btn btn-secondary">Cancelar</button>
                    </form>
                </div>
            </section>
        </main>
    </div>

    <script>
        // Configuración API
        const API_URL = 'http://localhost:3000/api';

        // Navegación del menú
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();

                // Remover active de todos
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));

                // Agregar active al clickeado
                this.classList.add('active');

                // Mostrar sección correspondiente
                const section = this.getAttribute('href').substring(1);
                showSection(section);
            });
        });

        function showSection(section) {
            // Ocultar todas las secciones
            document.querySelectorAll('section').forEach(s => s.style.display = 'none');

            // Mostrar la sección seleccionada
            switch(section) {
                case 'dashboard':
                    document.getElementById('dashboard-section').style.display = 'block';
                    break;
                case 'hospedajes':
                    document.getElementById('hospedaje-form').style.display = 'block';
                    cargarHospedajes();
                    break;
                // Agregar más casos según necesites
            }
        }

        // Formulario de Hospedaje
        document.getElementById('formHospedaje').addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = {};

            formData.forEach((value, key) => {
                if (key === 'servicios') {
                    data[key] = value.split(',').map(s => s.trim());
                } else {
                    data[key] = value;
                }
            });

            // Agrupar datos de contacto
            data.contacto = {
                telefono: data.telefono,
                whatsapp: data.whatsapp,
                email: data.email
            };

            delete data.telefono;
            delete data.whatsapp;
            delete data.email;

            try {
                const response = await fetch(`${API_URL}/hospedajes`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('Hospedaje guardado exitosamente!');
                    this.reset();
                } else {
                    alert('Error al guardar');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión');
            }
        });

        // Cargar hospedajes
        async function cargarHospedajes() {
            try {
                const response = await fetch(`${API_URL}/hospedajes`);
                const hospedajes = await response.json();
                console.log('Hospedajes:', hospedajes);
                // Aquí renderizarías la lista de hospedajes
            } catch (error) {
                console.error('Error cargando hospedajes:', error);
            }
        }
    </script>
</body>
</html>
```

### Paso 4: Sistema de Mensajes
```javascript
// backend/models/Mensaje.js
const mongoose = require('mongoose');

const MensajeSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: String,
    asunto: String,
    mensaje: { type: String, required: true },
    estado: {
        type: String,
        enum: ['nuevo', 'leido', 'respondido'],
        default: 'nuevo'
    },
    respuesta: {
        texto: String,
        fecha: Date
    },
    fechaRecepcion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Mensaje', MensajeSchema);

// backend/routes/mensajes.js
const express = require('express');
const router = express.Router();
const Mensaje = require('../models/Mensaje');
const nodemailer = require('nodemailer');

// Configurar email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Recibir mensaje desde formulario de contacto
router.post('/contacto', async (req, res) => {
    try {
        const mensaje = new Mensaje(req.body);
        await mensaje.save();

        // Notificar al admin por email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: 'admin@turismocombita.com',
            subject: `Nuevo mensaje de ${req.body.nombre}`,
            html: `
                <h2>Nuevo mensaje recibido</h2>
                <p><strong>De:</strong> ${req.body.nombre}</p>
                <p><strong>Email:</strong> ${req.body.email}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${req.body.mensaje}</p>
            `
        });

        res.json({ success: true, message: 'Mensaje enviado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Obtener todos los mensajes (admin)
router.get('/admin/mensajes', async (req, res) => {
    try {
        const mensajes = await Mensaje.find().sort('-fechaRecepcion');
        res.json(mensajes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Responder mensaje
router.post('/admin/mensajes/:id/responder', async (req, res) => {
    try {
        const mensaje = await Mensaje.findById(req.params.id);

        if (!mensaje) {
            return res.status(404).json({ error: 'Mensaje no encontrado' });
        }

        // Guardar respuesta en DB
        mensaje.respuesta = {
            texto: req.body.respuesta,
            fecha: new Date()
        };
        mensaje.estado = 'respondido';
        await mensaje.save();

        // Enviar email al cliente
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: mensaje.email,
            subject: `Re: ${mensaje.asunto || 'Tu consulta'}`,
            html: `
                <h2>Respuesta a tu consulta</h2>
                <p>Hola ${mensaje.nombre},</p>
                <p>${req.body.respuesta}</p>
                <hr>
                <p><small>Tu mensaje original:</small></p>
                <p><small>${mensaje.mensaje}</small></p>
            `
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### Paso 5: Conectar con tu Frontend Actual
```javascript
// Agregar a tu archivo JavaScript existente
// contact-form-handler.js

document.getElementById('contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        nombre: this.nombre.value,
        email: this.email.value,
        telefono: this.telefono.value,
        mensaje: this.mensaje.value
    };

    try {
        const response = await fetch('http://localhost:3000/api/contacto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            alert('¡Mensaje enviado! Te responderemos pronto.');
            this.reset();
        } else {
            alert('Error al enviar el mensaje');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});

// Cargar contenido dinámicamente
async function cargarContenido() {
    // Cargar hospedajes
    const hospedajes = await fetch('http://localhost:3000/api/hospedajes').then(r => r.json());
    renderizarHospedajes(hospedajes);

    // Cargar restaurantes
    const restaurantes = await fetch('http://localhost:3000/api/restaurantes').then(r => r.json());
    renderizarRestaurantes(restaurantes);

    // Cargar caminatas
    const caminatas = await fetch('http://localhost:3000/api/caminatas').then(r => r.json());
    renderizarCaminatas(caminatas);
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarContenido);
```

## 🚀 Pasos para Comenzar

1. **Instalar Node.js** si no lo tienes
2. **Instalar MongoDB** localmente o usar MongoDB Atlas (gratis)
3. **Copiar el código** de arriba
4. **Instalar dependencias**: `npm install`
5. **Iniciar el servidor**: `npm start`
6. **Abrir el panel admin** en tu navegador

## 💡 Recomendaciones Finales

### Para Empezar Rápido:
- Usa **Strapi** - Es la opción más rápida
- En 15 minutos tendrás un panel funcional
- No necesitas programar el backend

### Para Control Total:
- Implementa el sistema custom
- Te tomará 1-2 semanas
- Tendrás control absoluto sobre todo

### Hosting Recomendado:
- **Backend**: Heroku, Railway, o Render (gratis)
- **Base de datos**: MongoDB Atlas (gratis hasta 512MB)
- **Frontend**: Netlify o Vercel (gratis)
- **Imágenes**: Cloudinary (gratis hasta 25GB)

¿Te gustaría que implemente alguna parte específica primero?