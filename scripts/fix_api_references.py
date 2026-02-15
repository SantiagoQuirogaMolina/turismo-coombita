#!/usr/bin/env python3
"""
Script para arreglar referencias a archivos API y crear los archivos necesarios
"""

import os
from pathlib import Path

# Directorio base
BASE_DIR = Path(__file__).parent.parent
PAGES_DIR = BASE_DIR / "src" / "pages"

# Contenido del archivo api-config.js para páginas principales
API_CONFIG_CONTENT = """/**
 * Configuración temporal de API
 * Este archivo previene errores 404 mientras no esté el backend
 */

window.API_CONFIG = {
    baseURL: 'http://localhost:3000/api',
    timeout: 10000,
    mock: true
};

window.fetchAPI = function(endpoint) {
    console.log('API no disponible. Endpoint:', endpoint);
    return Promise.resolve({
        data: [],
        status: 'mock',
        message: 'Backend no disponible - Datos simulados'
    });
};

console.log('API Config - Modo Mock');"""

def fix_api_references(file_path):
    """Arregla las referencias a archivos de API."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content
        modified = False

        # Reemplazar referencias incorrectas
        replacements = [
            ('src="api-config.js"', 'src="./api-config.js"'),
            ('src="../api-config.js"', 'src="./api-config.js"'),
            ('src="../../api-config.js"', 'src="./api-config.js"'),
            ('src="api-integration.js"', 'src="../assets/js/vendor/api-integration.js"'),
            ('src="../api-integration.js"', 'src="../assets/js/vendor/api-integration.js"'),
        ]

        for old, new in replacements:
            if old in content:
                content = content.replace(old, new)
                modified = True

        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Referencias arregladas: {file_path.name}")
            return True
        else:
            print(f"[INFO] Sin cambios necesarios: {file_path.name}")
            return False

    except Exception as e:
        print(f"[ERROR] Error procesando {file_path}: {e}")
        return False

def create_api_config_files():
    """Crea archivos api-config.js donde sean necesarios."""
    # Crear en pages/
    pages_api_config = PAGES_DIR / "api-config.js"
    if not pages_api_config.exists():
        with open(pages_api_config, 'w', encoding='utf-8') as f:
            f.write(API_CONFIG_CONTENT)
        print(f"[OK] Creado: {pages_api_config}")

    # Crear en pages/treks/
    treks_api_config = PAGES_DIR / "treks" / "api-config.js"
    if not treks_api_config.exists():
        with open(treks_api_config, 'w', encoding='utf-8') as f:
            f.write(API_CONFIG_CONTENT)
        print(f"[OK] Creado: {treks_api_config}")

def main():
    """Función principal."""
    print("[FIX] Arreglando referencias a archivos API...")
    print("-" * 50)

    # Crear archivos api-config.js
    create_api_config_files()

    fixed_count = 0

    # Procesar archivos HTML en pages/
    for html_file in PAGES_DIR.glob("*.html"):
        if fix_api_references(html_file):
            fixed_count += 1

    # Procesar archivos en pages/treks/
    treks_dir = PAGES_DIR / "treks"
    for html_file in treks_dir.glob("*.html"):
        if fix_api_references(html_file):
            fixed_count += 1

    print("-" * 50)
    print(f"[OK] Archivos actualizados: {fixed_count}")
    print("\n[INFO] Archivos api-config.js creados")
    print("Los errores de API deberían estar resueltos")
    print("\n[DONE] Proceso completado!")

if __name__ == "__main__":
    main()