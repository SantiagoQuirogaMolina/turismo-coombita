#!/usr/bin/env python3
"""
Script para agregar FontAwesome a todos los archivos HTML
"""

import os
from pathlib import Path

# Directorio base
BASE_DIR = Path(__file__).parent.parent
PAGES_DIR = BASE_DIR / "src" / "pages"

def add_fontawesome(file_path, level="../"):
    """Agrega la referencia a FontAwesome en un archivo HTML."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verificar si ya tiene FontAwesome
        if 'fontawesome' in content.lower() or 'all.css' in content:
            print(f"[INFO] Ya tiene FontAwesome: {file_path.name}")
            return False

        # Buscar dónde insertar la referencia (después del último link CSS antes de skin/main.css)
        import re

        # Buscar la línea con main.css o skin.css
        pattern = r'(<link.*?main\.css.*?>)'
        match = re.search(pattern, content)

        if match:
            # Insertar FontAwesome justo antes de main.css
            fontawesome_link = f'    <link rel="stylesheet" href="{level}assets/media/icons/fontawesome/all.css">\n'
            insertion_point = match.start()

            # Insertar la nueva línea
            content = content[:insertion_point] + fontawesome_link + content[insertion_point:]

            # Guardar el archivo
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] FontAwesome agregado: {file_path.name}")
            return True
        else:
            # Si no encuentra main.css, buscar el último link CSS
            pattern = r'(<link.*?\.css.*?>)(?!.*<link.*?\.css)'
            match = re.search(pattern, content, re.DOTALL)

            if match:
                # Insertar después del último CSS
                fontawesome_link = f'\n    <link rel="stylesheet" href="{level}assets/media/icons/fontawesome/all.css">'
                insertion_point = match.end()

                content = content[:insertion_point] + fontawesome_link + content[insertion_point:]

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"[OK] FontAwesome agregado: {file_path.name}")
                return True

        print(f"[WARNING] No se pudo agregar FontAwesome: {file_path.name}")
        return False

    except Exception as e:
        print(f"[ERROR] Error procesando {file_path}: {e}")
        return False

def main():
    """Función principal."""
    print("[ADD] Agregando FontAwesome a todos los HTML...")
    print("-" * 50)

    added_count = 0

    # Procesar archivos en pages/ (nivel ../)
    for html_file in PAGES_DIR.glob("*.html"):
        if add_fontawesome(html_file, "../"):
            added_count += 1

    # Procesar archivos en pages/treks/ (nivel ../../)
    treks_dir = PAGES_DIR / "treks"
    for html_file in treks_dir.glob("*.html"):
        if add_fontawesome(html_file, "../../"):
            added_count += 1

    print("-" * 50)
    print(f"[OK] Archivos actualizados: {added_count}")
    print("\n[INFO] FontAwesome agregado correctamente")
    print("Los iconos deberían funcionar ahora en toda la página")
    print("\n[DONE] Proceso completado!")

if __name__ == "__main__":
    main()