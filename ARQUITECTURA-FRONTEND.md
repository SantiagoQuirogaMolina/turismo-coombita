# 🏗️ Nueva Arquitectura Frontend - Turismo Combitá

## Estructura de Carpetas Propuesta

```
turismo-combita/
│
├── 📁 src/                    # Código fuente
│   ├── 📁 pages/              # Páginas HTML
│   │   ├── index.html
│   │   ├── about.html
│   │   ├── blog.html
│   │   ├── contacts.html
│   │   ├── events.html
│   │   ├── food.html
│   │   ├── gallery.html
│   │   ├── history.html
│   │   ├── login.html
│   │   ├── post.html
│   │   ├── prices.html
│   │   ├── shelters.html
│   │   ├── team.html
│   │   └── 📁 treks/
│   │       ├── index.html
│   │       ├── el-valle.html
│   │       ├── laguna-rica.html
│   │       ├── la-pena.html
│   │       └── tilin.html
│   │
│   ├── 📁 components/         # Componentes reutilizables
│   │   ├── 📁 layout/
│   │   │   ├── header.html
│   │   │   ├── footer.html
│   │   │   └── navigation.html
│   │   ├── 📁 common/
│   │   │   ├── buttons.html
│   │   │   ├── cards.html
│   │   │   └── modals.html
│   │   └── 📁 forms/
│   │       ├── contact-form.html
│   │       └── login-form.html
│   │
│   ├── 📁 assets/             # Recursos estáticos
│   │   ├── 📁 css/
│   │   │   ├── 📁 base/
│   │   │   │   ├── reset.css
│   │   │   │   └── variables.css
│   │   │   ├── 📁 components/
│   │   │   ├── 📁 pages/
│   │   │   ├── 📁 vendor/      # CSS de terceros
│   │   │   └── main.css       # CSS principal
│   │   │
│   │   ├── 📁 js/
│   │   │   ├── 📁 modules/
│   │   │   │   ├── auth.js
│   │   │   │   ├── gallery.js
│   │   │   │   └── navigation.js
│   │   │   ├── 📁 utils/
│   │   │   │   ├── helpers.js
│   │   │   │   └── api.js
│   │   │   ├── 📁 vendor/      # JS de terceros
│   │   │   └── app.js         # JS principal
│   │   │
│   │   ├── 📁 images/
│   │   │   ├── 📁 fauna/
│   │   │   ├── 📁 formaciones/
│   │   │   ├── 📁 paisajes/
│   │   │   ├── 📁 paramos/
│   │   │   ├── 📁 patrimonio/
│   │   │   ├── 📁 rupestre/
│   │   │   └── 📁 icons/
│   │   │
│   │   └── 📁 fonts/
│   │
│   └── 📁 config/             # Configuración
│       ├── constants.js
│       └── routes.js
│
├── 📁 public/                 # Archivos públicos (generados)
│   └── (archivos compilados irán aquí)
│
├── 📁 docs/                   # Documentación
│   ├── ARQUITECTURA.md
│   ├── INSTALACION.md
│   └── GUIA-ESTILO.md
│
├── 📁 scripts/                # Scripts de utilidad
│   ├── update_footers.py
│   ├── update_gallery.py
│   └── fix_image_paths.py
│
├── 📁 tests/                  # Pruebas
│   └── (futuras pruebas)
│
├── 📁 backend/                # Backend (futura implementación)
│   ├── 📁 api/
│   ├── 📁 models/
│   └── 📁 controllers/
│
├── .gitignore
├── README.md
├── package.json              # Configuración de npm
└── .htaccess

```

## Ventajas de esta Arquitectura

### 1. **Separación de Responsabilidades**
- Código fuente (`src/`) separado de archivos públicos
- Assets organizados por tipo
- Componentes reutilizables

### 2. **Escalabilidad**
- Fácil agregar nuevas páginas
- Estructura modular para JS y CSS
- Preparado para sistema de build

### 3. **Mantenibilidad**
- Rutas claras y predecibles
- Componentes reutilizables
- Documentación centralizada

### 4. **Mejor DX (Developer Experience)**
- Estructura intuitiva
- Fácil navegación del código
- Separación clara entre vendor y código propio

## Plan de Migración

### Fase 1: Crear Estructura (Sin romper nada)
1. Crear todas las carpetas nuevas
2. Copiar archivos a nuevas ubicaciones
3. Mantener archivos originales temporalmente

### Fase 2: Actualizar Referencias
1. Actualizar rutas en HTML
2. Actualizar imports en JS
3. Verificar que todo funciona

### Fase 3: Limpieza
1. Eliminar archivos duplicados
2. Optimizar assets
3. Configurar build process

## Configuración Adicional Recomendada

### 1. Package.json
```json
{
  "name": "turismo-combita",
  "version": "1.0.0",
  "scripts": {
    "dev": "live-server src",
    "build": "webpack",
    "test": "jest"
  }
}
```

### 2. Sistema de Build (Futuro)
- Webpack o Vite para bundling
- PostCSS para CSS moderno
- Babel para JS moderno
- Optimización de imágenes

### 3. Herramientas de Desarrollo
- ESLint para calidad de código
- Prettier para formato
- Husky para git hooks