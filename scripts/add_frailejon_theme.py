#!/usr/bin/env python3
"""
Script para agregar el tema Frailejón (dorado) a todos los archivos HTML
"""

import os
from pathlib import Path

# Directorio base
BASE_DIR = Path(__file__).parent.parent
PAGES_DIR = BASE_DIR / "src" / "pages"

def add_frailejon_theme(file_path, level="../"):
    """Agrega la referencia al tema Frailejón en un archivo HTML."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Verificar si ya tiene el tema
        if 'frailejon-theme.css' in content:
            print(f"[INFO] Ya tiene tema Frailejón: {file_path.name}")
            return False

        # Buscar dónde insertar - después de main.css o skin.css
        import re

        # Buscar main.css o skin.css
        pattern = r'(<link.*?(?:main|skin)\.css.*?>)'
        match = re.search(pattern, content)

        if match:
            # Insertar el tema Frailejón justo después
            theme_link = f'\n    <link rel="stylesheet" href="{level}assets/css/frailejon-theme.css">'
            insertion_point = match.end()

            content = content[:insertion_point] + theme_link + content[insertion_point:]

            # Guardar el archivo
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Tema Frailejón agregado: {file_path.name}")
            return True
        else:
            # Si no encuentra main.css, agregar después del último CSS
            pattern = r'(<link.*?\.css.*?>)(?!.*<link.*?\.css)'
            match = re.search(pattern, content, re.DOTALL)

            if match:
                theme_link = f'\n    <link rel="stylesheet" href="{level}assets/css/frailejon-theme.css">'
                insertion_point = match.end()

                content = content[:insertion_point] + theme_link + content[insertion_point:]

                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"[OK] Tema Frailejón agregado: {file_path.name}")
                return True

        print(f"[WARNING] No se pudo agregar tema: {file_path.name}")
        return False

    except Exception as e:
        print(f"[ERROR] Error procesando {file_path}: {e}")
        return False

def main():
    """Función principal."""
    print("[TEMA] Aplicando tema Frailejón (dorado sutil)...")
    print("-" * 50)
    print("Color principal: #DDA15E (Dorado Frailejón)")
    print("Aplicación: Sutil en hovers, bordes y acentos")
    print("-" * 50)

    added_count = 0

    # Procesar archivos en pages/
    for html_file in PAGES_DIR.glob("*.html"):
        if add_frailejon_theme(html_file, "../"):
            added_count += 1

    # Procesar archivos en pages/treks/
    treks_dir = PAGES_DIR / "treks"
    for html_file in treks_dir.glob("*.html"):
        if add_frailejon_theme(html_file, "../../"):
            added_count += 1

    print("-" * 50)
    print(f"[OK] Archivos actualizados: {added_count}")
    print("\n[INFO] Tema Frailejón aplicado con éxito")
    print("El color dorado #DDA15E ahora está presente de forma sutil en:")
    print("  • Hovers en menús y enlaces")
    print("  • Bordes en focus de formularios")
    print("  • Acentos en títulos y subtítulos")
    print("  • Efectos en cards y galerías")
    print("  • Botones y elementos interactivos")
    print("\n[DONE] Proceso completado!")

if __name__ == "__main__":
    main()