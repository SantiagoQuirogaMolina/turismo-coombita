import os
import re

# Archivos a corregir
files_to_fix = [
    'about.html', 'blog.html', 'food.html', 'events.html',
    'team.html', 'team-2.html', 'treks.html', 'prices.html',
    'shelters.html', 'treks-single.html', 'treks-single-el-valle.html',
    'treks-single-laguna-rica.html', 'treks-single-la-peña.html',
    'treks-single-tilin.html', 'index-3.html'
]

def fix_image_paths(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            content = file.read()

        # Patrón para encontrar data-image-src con espacios en el nombre
        pattern = r'data-image-src="imagenes/([^"]+)"'

        def replace_spaces(match):
            path = match.group(1)
            # Reemplazar espacios con %20
            fixed_path = path.replace(' ', '%20')
            return f'data-image-src="imagenes/{fixed_path}"'

        # Reemplazar todas las ocurrencias
        new_content = re.sub(pattern, replace_spaces, content)

        if new_content != content:
            with open(filename, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"[OK] Corregido: {filename}")
            return True
        else:
            print(f"[-] Sin cambios: {filename}")
            return False

    except Exception as e:
        print(f"[ERROR] Error en {filename}: {str(e)}")
        return False

# Corregir todos los archivos
print("Corrigiendo espacios en rutas de imágenes...\n")
fixed_count = 0
for file in files_to_fix:
    if os.path.exists(file):
        if fix_image_paths(file):
            fixed_count += 1
    else:
        print(f"! Archivo no encontrado: {file}")

print(f"\n[COMPLETADO] Proceso completado: {fixed_count} archivos corregidos")