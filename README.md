# Turismo Combita - Portal Web

Portal web de turismo para el municipio de Combita, Boyaca, Colombia.

## Descripcion

Sitio web completo con informacion turistica, panel de administracion y API backend. Incluye:

- Rutas de senderismo (Laguna Rica, El Valle, La Pena, Tilin)
- Restaurantes y gastronomia local
- Hospedajes y alojamientos
- Eventos y actividades culturales
- Artesanos y guias turisticos
- Blog con publicaciones
- Galeria fotografica
- Mapa interactivo, transporte y tips del viajero

## Arquitectura

```
turismo-combita/
├── src/                    # Frontend
│   ├── pages/              # 16 paginas HTML + 5 rutas de treks
│   └── assets/             # CSS, JS, imagenes, iconos
├── backend/                # API Express.js
│   ├── server.js           # Servidor principal (puerto 3001)
│   ├── routes/             # 10 archivos de rutas (47 endpoints)
│   ├── middleware/          # Autenticacion JWT
│   ├── utils/              # DataManager, validacion, limpieza
│   ├── data/               # JSON como base de datos
│   └── uploads/            # Imagenes subidas por admin
└── admin/                  # Panel de administracion (SPA)
    ├── index.html          # Interfaz completa
    ├── js/admin.js         # Logica CRUD
    └── css/admin.css       # Estilos
```

## Instalacion

```bash
git clone <repo-url>
cd turismo-combita
npm install
```

## Uso

```bash
# Iniciar servidor (sirve frontend + API)
node backend/server.js
```

El sitio estara disponible en `http://localhost:3001`
Panel admin en `http://localhost:3001/admin`

## Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript vanilla, jQuery, Bootstrap Grid
- **Backend**: Node.js, Express.js, JSON file storage
- **Auth**: JWT + bcryptjs
- **Librerias**: Glide.js (sliders), Magnific Popup (lightbox), Leaflet (mapas)

## Paleta de colores

- Verde principal: `#699073`
- Marron: `#BC6C25`
- Dorado (acento): `#DDA15E`

## API Endpoints

| Recurso | Endpoints |
|---------|-----------|
| Auth | login, me, cambiar-password |
| Restaurantes | CRUD completo |
| Hoteles | CRUD completo |
| Eventos | CRUD completo |
| Blog | CRUD + paginacion |
| Galeria | CRUD albumes + imagenes |
| Artesanos | CRUD completo |
| Guias | CRUD completo |
| Contacto | enviar, listar, marcar leido |
| Estadisticas | general + dashboard |

## Autor

Santiago Quiroga Molina - [santiago-developer.com](https://santiago-developer.netlify.app/)
