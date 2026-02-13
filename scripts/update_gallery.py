import os
import json
from datetime import datetime

# Directorio base de imágenes
base_dir = r"D:\TURISMO\turismo combita\Base-Web-Turismo\Code-by-Santiago\imagenes"

# Configuración de álbumes
albums_config = {
    "paramos": {
        "title": "Páramos",
        "description": "Ecosistemas de alta montaña con frailejones",
        "cover": "laguna ricaaa.jpg"
    },
    "fauna": {
        "title": "Fauna",
        "description": "Aves y animales nativos del ecosistema",
        "cover": "colibrie verde descansa.jpg"
    },
    "rupestre": {
        "title": "Arte Rupestre",
        "description": "Pinturas precolombinas milenarias",
        "cover": "tilin,pinturas.JPG"
    },
    "patrimonio": {
        "title": "Patrimonio",
        "description": "Arquitectura colonial y tradiciones",
        "cover": "iglesia.jpg"
    },
    "formaciones": {
        "title": "Formaciones Rocosas",
        "description": "Estructuras geológicas únicas",
        "cover": "La Peña.jpg"
    },
    "paisajes": {
        "title": "Paisajes",
        "description": "Vistas panorámicas espectaculares",
        "cover": "montaña cordi.jpg"
    }
}

# Extensiones de imagen válidas
valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.JPG', '.JPEG', '.PNG']

def scan_album_folder(album_name):
    """Escanea una carpeta de álbum y retorna lista de imágenes"""
    album_path = os.path.join(base_dir, album_name)
    images = []

    if os.path.exists(album_path):
        for filename in os.listdir(album_path):
            # Verificar si es una imagen válida
            if any(filename.endswith(ext) for ext in valid_extensions):
                # Crear objeto de imagen
                img_data = {
                    "filename": filename,
                    "path": f"imagenes/{album_name}/{filename}",
                    "title": filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
                }
                images.append(img_data)

    return images

def generate_gallery_data():
    """Genera el JSON con toda la información de la galería"""
    gallery_data = {
        "generated": datetime.now().isoformat(),
        "albums": []
    }

    print("Escaneando carpetas de la galería...")
    print("-" * 50)

    for album_name, config in albums_config.items():
        images = scan_album_folder(album_name)

        # Buscar imagen de portada en la carpeta si existe
        cover_path = f"imagenes/{album_name}/{config['cover']}"
        if not os.path.exists(os.path.join(base_dir, "..", cover_path.replace('imagenes/', ''))):
            # Si no está en la carpeta, usar la ruta original
            cover_path = f"imagenes/{config['cover']}"

        album_data = {
            "id": album_name,
            "title": config["title"],
            "description": config["description"],
            "cover": cover_path,
            "images": images,
            "count": len(images)
        }

        gallery_data["albums"].append(album_data)
        print(f"[OK] {album_name}: {len(images)} imágenes encontradas")

    return gallery_data

def save_gallery_json(data):
    """Guarda los datos en un archivo JSON"""
    json_path = os.path.join(base_dir, "..", "gallery-data.json")

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    return json_path

def update_gallery_html():
    """Genera código HTML actualizado para insertar en gallery.html"""
    gallery_data = generate_gallery_data()

    html_code = []
    html_code.append("\n<!-- CÓDIGO HTML ACTUALIZADO PARA LA GALERÍA -->")
    html_code.append("<!-- Copia este código en la sección correspondiente de gallery.html -->\n")

    # Generar HTML para cada álbum
    for i, album in enumerate(gallery_data["albums"]):
        if i == 0:
            html_code.append("<!-- Primera categoría de álbum -->")

        html_code.append(f'<div class="album-item">')
        html_code.append(f'    <div class="grid-list list-gallery" data-lightbox-anima="fade-top" data-columns="3" data-columns-md="2">')
        html_code.append(f'        <div class="grid-box">')
        html_code.append(f'            <!-- Categoría: {album["title"].upper()} -->')

        for img in album["images"]:
            html_code.append(f'            <div class="grid-item">')
            html_code.append(f'                <a class="img-box" href="{img["path"]}" data-title="{img["title"]}">')
            html_code.append(f'                    <img src="{img["path"]}" alt="{img["title"]}" />')
            html_code.append(f'                </a>')
            html_code.append(f'            </div>')

        html_code.append(f'        </div>')
        html_code.append(f'        <div class="list-pagination">')
        html_code.append(f'            <ul class="pagination" data-page-items="6" data-pagination-anima="fade-right"></ul>')
        html_code.append(f'        </div>')
        html_code.append(f'    </div>')
        html_code.append(f'</div>\n')

    return "\n".join(html_code)

# Ejecutar el script
if __name__ == "__main__":
    print("\n=== ACTUALIZADOR DE GALERÍA ===\n")

    # Generar y guardar JSON
    gallery_data = generate_gallery_data()
    json_path = save_gallery_json(gallery_data)

    print(f"\n[OK] Archivo JSON generado: gallery-data.json")
    print(f"     Total de álbumes: {len(gallery_data['albums'])}")

    total_images = sum(album['count'] for album in gallery_data['albums'])
    print(f"     Total de imágenes: {total_images}")

    # Generar HTML actualizado
    html_code = update_gallery_html()

    # Guardar HTML en un archivo temporal
    html_path = os.path.join(base_dir, "..", "gallery-update.html")
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html_code)

    print(f"\n[OK] Código HTML generado: gallery-update.html")

    # ACTUALIZAR AUTOMÁTICAMENTE gallery.html
    print("\n[INFO] Actualizando gallery.html automáticamente...")

    try:
        import re

        # Leer gallery.html actual
        with open('gallery.html', 'r', encoding='utf-8') as f:
            gallery_content = f.read()

        # Buscar el marcador donde empiezan los álbumes
        start_marker = '<p class="album-title"><span>📸</span> <a>Ver Álbumes</a></p>'
        start_pos = gallery_content.find(start_marker)

        if start_pos == -1:
            print("[ERROR] No se encontró el marcador en gallery.html")
        else:
            # Buscar donde terminan todos los album-items
            # Buscar el último </div> antes de </section>
            temp_content = gallery_content[start_pos:]
            section_end = temp_content.find('</div>\n            </div>\n        </section>')

            if section_end != -1:
                # Construir el nuevo contenido
                new_gallery = (
                    gallery_content[:start_pos + len(start_marker)] +
                    '\n' + html_code + '\n                ' +
                    gallery_content[start_pos + section_end:]
                )

                # Guardar gallery.html actualizado
                with open('gallery.html', 'w', encoding='utf-8') as f:
                    f.write(new_gallery)

                print("[OK] gallery.html actualizado exitosamente")
                fauna_album = [album for album in gallery_data['albums'] if album['id'] == 'fauna']
                if fauna_album:
                    print(f"     Album 'fauna' ahora tiene {len(fauna_album[0]['images'])} imagenes")
            else:
                print("[ERROR] No se pudo encontrar el final de la sección")

    except Exception as e:
        print(f"[ERROR] No se pudo actualizar gallery.html: {e}")
        print("        Puedes copiar manualmente el contenido de gallery-update.html")

    print("\n" + "=" * 50)
    print("RESUMEN:")
    print(f"[OK] Total de albumes: {len(gallery_data['albums'])}")
    print(f"[OK] Total de imagenes: {total_images}")
    print("[OK] gallery.html actualizado automaticamente")
    print("\n[!] Recarga la pagina con Ctrl+F5 para ver los cambios")
    print("=" * 50)