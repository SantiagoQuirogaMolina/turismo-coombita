#!/usr/bin/env python3
"""
Script para arreglar los problemas con espacios en nombres de archivos de imágenes
"""

import os
from pathlib import Path
import urllib.parse

# Directorio base
BASE_DIR = Path(__file__).parent.parent
PAGES_DIR = BASE_DIR / "src" / "pages"

def fix_image_paths(file_path):
    """Arregla los problemas con espacios en las rutas de imágenes."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Lista de reemplazos específicos para normalizar nombres
        replacements = [
            # Arreglar espacios codificados como %20
            ('favorita%20dos.jpg', 'favorita dos.jpg'),
            ('laguna%20rica.jpg', 'laguna rica.jpg'),
            ('colibrie%20verde%20descansa.jpg', 'colibrie verde descansa.jpg'),
            ('plantas%20de%20la%20laguuna.jpg', 'plantas de la laguuna.JPG'),
            ('plantas%20de%20la%20laguuna4.jpg', 'plantas de la laguuna4.jpg'),
            ('la%20peña%20de%20frente.jpg', 'la peña de frente.jpg'),
            ('montaña%20cordi.jpg', 'montaña cordi.jpg'),
            ('1300x800%20peña%20desde%20la%20casa.JPG', '1300x800 peña desde la casa.JPG'),
            ('1300x800el%20tilin.JPG', '1300x800el tilin.JPG'),
            ('1300x800laguna%20ricaaa.jpg', '1300x800laguna ricaaa.jpg'),

            # Otros ajustes
            ('_MG_0840.jpg', '_MG_0840.jpg'),
            ('copeton2.jpg', 'copeton2.jpg'),
            ('x1300.jpg', 'x1300.jpg'),
        ]

        # Aplicar todos los reemplazos
        for old, new in replacements:
            content = content.replace(old, new)

        # También buscar y reemplazar cualquier %20 restante en rutas de imágenes
        import re

        # Patrón para encontrar rutas de imágenes con %20
        pattern = r'(src|href)="([^"]*%20[^"]*\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF))"'

        def decode_url(match):
            attr = match.group(1)
            path = match.group(2)
            ext = match.group(3)
            # Decodificar solo el nombre del archivo, no toda la ruta
            if '../assets/images/' in path:
                base = '../assets/images/'
                filename = path.replace('../assets/images/', '')
                decoded_filename = urllib.parse.unquote(filename)
                return f'{attr}="{base}{decoded_filename}"'
            return match.group(0)

        content = re.sub(pattern, decode_url, content, flags=re.IGNORECASE)

        # Guardar si hubo cambios
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Arreglado: {file_path.name}")
            return True
        else:
            print(f"[INFO] Sin cambios: {file_path.name}")
            return False

    except Exception as e:
        print(f"[ERROR] Error procesando {file_path}: {e}")
        return False

def main():
    """Función principal."""
    print("[FIX] Arreglando espacios en nombres de imágenes...")
    print("-" * 50)

    fixed_count = 0

    # Procesar archivos HTML en pages/
    for html_file in PAGES_DIR.glob("*.html"):
        if fix_image_paths(html_file):
            fixed_count += 1

    # Procesar archivos en pages/treks/
    treks_dir = PAGES_DIR / "treks"
    for html_file in treks_dir.glob("*.html"):
        if fix_image_paths(html_file):
            fixed_count += 1

    print("-" * 50)
    print(f"[OK] Archivos arreglados: {fixed_count}")
    print("[DONE] Proceso completado!")

if __name__ == "__main__":
    main()