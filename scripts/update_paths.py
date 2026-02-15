#!/usr/bin/env python3
"""
Script para actualizar las rutas en los archivos HTML
después de la reorganización de la estructura del proyecto.
"""

import os
import re
from pathlib import Path

# Directorio base del proyecto
BASE_DIR = Path(__file__).parent.parent
SRC_DIR = BASE_DIR / "src"
PAGES_DIR = SRC_DIR / "pages"

# Mapeo de rutas antiguas a nuevas
PATH_MAPPINGS = {
    # CSS
    'themekit/css/': '../assets/css/vendor/',
    'skin.css': '../assets/css/main.css',

    # JavaScript
    'themekit/scripts/': '../assets/js/vendor/',
    'auth-system.js': '../assets/js/modules/auth.js',
    'auth-system-improved.js': '../assets/js/modules/auth.js',

    # Imágenes
    'imagenes/fauna/': '../assets/images/fauna/',
    'imagenes/formaciones/': '../assets/images/formaciones/',
    'imagenes/paisajes/': '../assets/images/paisajes/',
    'imagenes/paramos/': '../assets/images/paramos/',
    'imagenes/patrimonio/': '../assets/images/patrimonio/',
    'imagenes/rupestre/': '../assets/images/rupestre/',
    'imagenes/': '../assets/images/',

    # Media/Icons
    'media/': '../assets/images/icons/',
    'themekit/media/': '../assets/images/icons/',

    # Páginas HTML (navegación)
    'index.html': './index.html',
    'about.html': './about.html',
    'blog.html': './blog.html',
    'contacts.html': './contacts.html',
    'events.html': './events.html',
    'food.html': './food.html',
    'gallery.html': './gallery.html',
    'history.html': './history.html',
    'login.html': './login.html',
    'post.html': './post.html',
    'prices.html': './prices.html',
    'shelters.html': './shelters.html',
    'team.html': './team.html',
    'team-2.html': './team-2.html',
    'treks.html': './treks/index.html',
    'treks-single-el-valle.html': './treks/el-valle.html',
    'treks-single-laguna-rica.html': './treks/laguna-rica.html',
    'treks-single-la-peña.html': './treks/la-pena.html',
    'treks-single-tilin.html': './treks/tilin.html',
}

# Para archivos en la carpeta treks/, necesitan un nivel adicional
TREKS_PATH_MAPPINGS = {
    # CSS
    'themekit/css/': '../../assets/css/vendor/',
    'skin.css': '../../assets/css/main.css',

    # JavaScript
    'themekit/scripts/': '../../assets/js/vendor/',
    'auth-system.js': '../../assets/js/modules/auth.js',
    'auth-system-improved.js': '../../assets/js/modules/auth.js',

    # Imágenes
    'imagenes/fauna/': '../../assets/images/fauna/',
    'imagenes/formaciones/': '../../assets/images/formaciones/',
    'imagenes/paisajes/': '../../assets/images/paisajes/',
    'imagenes/paramos/': '../../assets/images/paramos/',
    'imagenes/patrimonio/': '../../assets/images/patrimonio/',
    'imagenes/rupestre/': '../../assets/images/rupestre/',
    'imagenes/': '../../assets/images/',

    # Media/Icons
    'media/': '../../assets/images/icons/',
    'themekit/media/': '../../assets/images/icons/',

    # Navegación a páginas principales (un nivel arriba)
    'index.html': '../index.html',
    'about.html': '../about.html',
    'blog.html': '../blog.html',
    'contacts.html': '../contacts.html',
    'events.html': '../events.html',
    'food.html': '../food.html',
    'gallery.html': '../gallery.html',
    'history.html': '../history.html',
    'login.html': '../login.html',
    'post.html': '../post.html',
    'prices.html': '../prices.html',
    'shelters.html': '../shelters.html',
    'team.html': '../team.html',
    'team-2.html': '../team-2.html',
    'treks.html': './index.html',
    'treks-single-el-valle.html': './el-valle.html',
    'treks-single-laguna-rica.html': './laguna-rica.html',
    'treks-single-la-peña.html': './la-pena.html',
    'treks-single-tilin.html': './tilin.html',
}

def update_paths_in_file(file_path, mappings):
    """Actualiza las rutas en un archivo HTML."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Actualizar cada mapeo
        for old_path, new_path in mappings.items():
            # Reemplazo directo sin regex para evitar problemas con caracteres especiales
            # Actualizar en href y src
            content = content.replace(f'href="{old_path}', f'href="{new_path}')
            content = content.replace(f"href='{old_path}", f"href='{new_path}")
            content = content.replace(f'src="{old_path}', f'src="{new_path}')
            content = content.replace(f"src='{old_path}", f"src='{new_path}")

            # Actualizar en url()
            content = content.replace(f'url({old_path}', f'url({new_path}')
            content = content.replace(f'url("{old_path}', f'url("{new_path}')
            content = content.replace(f"url('{old_path}", f"url('{new_path}")

        # Solo escribir si hubo cambios
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Actualizado: {file_path.name}")
            return True
        else:
            print(f"[INFO] Sin cambios: {file_path.name}")
            return False

    except Exception as e:
        print(f"[ERROR] Error procesando {file_path}: {e}")
        return False

def main():
    """Función principal."""
    print("[UPDATE] Actualizando rutas en archivos HTML...")
    print("-" * 50)

    updated_count = 0
    error_count = 0

    # Procesar archivos en pages/
    for html_file in PAGES_DIR.glob("*.html"):
        if update_paths_in_file(html_file, PATH_MAPPINGS):
            updated_count += 1
        else:
            error_count += 1 if "[ERROR]" in str(html_file) else 0

    # Procesar archivos en pages/treks/
    treks_dir = PAGES_DIR / "treks"
    for html_file in treks_dir.glob("*.html"):
        if update_paths_in_file(html_file, TREKS_PATH_MAPPINGS):
            updated_count += 1
        else:
            error_count += 1 if "[ERROR]" in str(html_file) else 0

    print("-" * 50)
    print(f"[OK] Archivos actualizados: {updated_count}")
    if error_count > 0:
        print(f"[ERROR] Errores encontrados: {error_count}")
    print("\n[DONE] Proceso completado!")

    # Crear archivo de verificación
    verification_file = BASE_DIR / "MIGRATION_STATUS.md"
    with open(verification_file, 'w', encoding='utf-8') as f:
        f.write("# Estado de la Migración\n\n")
        f.write(f"- Archivos actualizados: {updated_count}\n")
        f.write(f"- Errores: {error_count}\n")
        f.write(f"\n## Próximos pasos:\n")
        f.write("1. Verificar que el sitio funciona correctamente\n")
        f.write("2. Eliminar archivos duplicados en la raíz (opcional)\n")
        f.write("3. Configurar servidor de desarrollo\n")
        f.write("4. Implementar sistema de build\n")

    print(f"\n[INFO] Estado guardado en: {verification_file}")

if __name__ == "__main__":
    main()