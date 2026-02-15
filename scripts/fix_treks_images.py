#!/usr/bin/env python3
"""
Script para arreglar las rutas de imágenes en las páginas de caminatas
"""

import os
from pathlib import Path
import re

# Directorio base
BASE_DIR = Path(__file__).parent.parent
TREKS_DIR = BASE_DIR / "src" / "pages" / "treks"

def fix_image_paths(file_path):
    """Arregla las rutas de imágenes mal formadas."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Patrones de rutas incorrectas a corregir
        replacements = [
            # Arreglar rutas con ../assets/images/../
            ('../assets/images/../', '../../assets/images/'),

            # Arreglar rutas que deberían tener dos niveles arriba
            ('src="../assets/images/', 'src="../../assets/images/'),
            ('href="../assets/images/', 'href="../../assets/images/'),
            ('data-image-src="../assets/images/', 'data-image-src="../../assets/images/'),

            # Arreglar rutas específicas mal formadas
            ('data-image-src="../../assets/images/../', 'data-image-src="../../assets/images/'),

            # Arreglar enlaces a treks-single.html
            ('href="treks-single.html"', 'href="./single.html"'),
            ('data-href="treks-single.html"', 'data-href="./single.html"'),

            # Asegurar que los logos estén bien
            ('src="../media/', 'src="../../assets/images/icons/'),
            ('src="media/', 'src="../../assets/images/icons/'),
        ]

        # Aplicar todos los reemplazos
        for old, new in replacements:
            content = content.replace(old, new)

        # Arreglar nombres de imágenes específicas si es necesario
        image_fixes = [
            ('foto laguna y planta.JPG', 'foto laguna y planta.JPG'),
            ('frailejon en la laguna .jpg', 'frailejon en la laguna .jpg'),
            ('laguna ricaaa.jpg', 'laguna ricaaa.jpg'),
            ('laguna rica.jpg', 'laguna rica.jpg'),
            ('la peña de frente.jpg', 'la peña de frente.jpg'),
            ('La Peña.jpg', 'La Peña.jpg'),
            ('el tilin.JPG', 'el tilin.JPG'),
            ('montaña cordi.jpg', 'montaña cordi.jpg'),
        ]

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

def check_images_exist():
    """Verifica que las imágenes referenciadas existan."""
    images_dir = BASE_DIR / "src" / "assets" / "images"
    print("\n[CHECK] Verificando imágenes existentes:")

    required_images = [
        "foto laguna y planta.JPG",
        "frailejon en la laguna .jpg",
        "laguna ricaaa.jpg",
        "La Peña.jpg",
        "el tilin.JPG",
        "montaña cordi.jpg",
        "favorita dos.jpg",
        "iglesia.jpg"
    ]

    for img in required_images:
        img_path = images_dir / img
        if img_path.exists():
            print(f"  [OK] {img}")
        else:
            print(f"  [FALTA] {img} - NO ENCONTRADA")

def main():
    """Función principal."""
    print("[FIX] Arreglando rutas de imágenes en páginas de caminatas...")
    print("-" * 50)

    fixed_count = 0

    # Procesar todos los archivos HTML en treks/
    for html_file in TREKS_DIR.glob("*.html"):
        if fix_image_paths(html_file):
            fixed_count += 1

    print("-" * 50)
    print(f"[OK] Archivos actualizados: {fixed_count}")

    # Verificar imágenes
    check_images_exist()

    print("\n[INFO] Enlaces arreglados:")
    print("  • treks-single.html → ./single.html")
    print("  • Rutas de imágenes: ../assets/ → ../../assets/")
    print("  • Rutas mal formadas corregidas")
    print("\n[DONE] Proceso completado!")

if __name__ == "__main__":
    main()