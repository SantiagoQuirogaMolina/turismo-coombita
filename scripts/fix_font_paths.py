#!/usr/bin/env python3
"""
Script para arreglar las rutas de fuentes e iconos en los archivos CSS
"""

import os
from pathlib import Path

# Directorio base
BASE_DIR = Path(__file__).parent.parent
CSS_DIR = BASE_DIR / "src" / "assets" / "css"

def fix_font_paths(file_path):
    """Arregla las rutas de fuentes e iconos en archivos CSS."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Reemplazos para archivos en src/assets/css/vendor/
        replacements = [
            # Rutas de iconos principales
            ("url('../media/icons/icons.eot')", "url('../media/icons/icons.eot')"),
            ("url('../media/icons/icons.eot?#iefix-rdmvgc')", "url('../media/icons/icons.eot?#iefix-rdmvgc')"),
            ("url('../media/icons/icons.woff')", "url('../media/icons/icons.woff')"),
            ("url('../media/icons/icons.ttf')", "url('../media/icons/icons.ttf')"),
            ("url('../media/icons/icons.svg?-rdmvgc#icomoon')", "url('../media/icons/icons.svg?-rdmvgc#icomoon')"),

            # FontAwesome
            ("url('../fonts/", "url('../media/icons/fontawesome/webfonts/"),
            ("url('fonts/", "url('../media/icons/fontawesome/webfonts/"),
            ("url(\"../fonts/", "url(\"../media/icons/fontawesome/webfonts/"),
            ("url(\"fonts/", "url(\"../media/icons/fontawesome/webfonts/"),

            # IconsMind
            ("url('line-icons-fonts/", "url('../media/icons/iconsmind/line-icons-fonts/"),
            ("url(\"line-icons-fonts/", "url(\"../media/icons/iconsmind/line-icons-fonts/"),
            ("url('solid-icons-fonts/", "url('../media/icons/iconsmind/solid-icons-fonts/"),
            ("url(\"solid-icons-fonts/", "url(\"../media/icons/iconsmind/solid-icons-fonts/"),

            # Rutas relativas a themekit
            ("url('../../themekit/media/", "url('../../"),
            ("url(\"../../themekit/media/", "url(\"../../"),
            ("url(../../themekit/media/", "url(../../"),
        ]

        # Aplicar todos los reemplazos
        for old, new in replacements:
            content = content.replace(old, new)

        # Guardar si hubo cambios
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
    print("[FIX] Arreglando rutas de fuentes e iconos...")
    print("-" * 50)

    fixed_count = 0

    # Procesar todos los archivos CSS en vendor
    vendor_dir = CSS_DIR / "vendor"
    for css_file in vendor_dir.glob("*.css"):
        if fix_font_paths(css_file):
            fixed_count += 1

    # Procesar el CSS principal
    main_css = CSS_DIR / "main.css"
    if main_css.exists():
        if fix_font_paths(main_css):
            fixed_count += 1

    print("-" * 50)
    print(f"[OK] Archivos CSS actualizados: {fixed_count}")
    print("\n[INFO] Estructura de iconos:")
    print("  src/assets/media/icons/       <- Iconos principales")
    print("  src/assets/media/icons/fontawesome/  <- FontAwesome")
    print("  src/assets/media/icons/iconsmind/    <- IconsMind")
    print("\n[DONE] Proceso completado!")

if __name__ == "__main__":
    main()