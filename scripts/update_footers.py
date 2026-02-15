import os
import re

# Footer HTML correcto
new_footer = '''    <footer class="light">
        <div class="container">
            <div class="row">
                <div class="col-lg-4">
                    <h3>Cómbita</h3>
                    <p>En algún lugar entre el inicio de la ascensión y la cima, se encuentra la respuesta al misterio
                        de por qué subimos.</p>

                </div>
                <div class="col-lg-4">
                    <h3>Contacto</h3>
                    <ul class="icon-list icon-line">
                        <li>Cómbita, Boyacá, Colombia</li>
                        <li>alcaldia@combita-boyaca.gov.co</li>
                        <li> 313 366232</li>
                    </ul>
                </div>
                <div class="col-lg-4">
                    <div class="icon-links icon-social icon-links-grid social-colors">
                        <a class="facebook"><i class="icon-facebook"></i></a>
                        <a class="instagram"><i class="icon-instagram"></i></a>
                        <a class="x"><i class="icon-twitter"></i></a> <!-- X represents the new Twitter -->
                        <a class="youtube"><i class="icon-youtube"></i></a>
                    </div>
                    <hr class="space-sm" />
                    <p>Siguenos en nuestras redes</p>
                </div>

            </div>
        </div>
        <div class="footer-bar">
            <div class="container">
                <span>© 2024 Santiago Quiroga Molina <a href="https://santiago-developer.netlify.app/"
                        target="_blank">santiago-developer.com</a>.</span>
                <span><a href="contacts.html">Contacto</a> | <a href="#">Privacy policy</a></span>
            </div>
        </div>'''

# Lista de archivos HTML a actualizar (excluyendo index.html que ya está correcto)
html_files = [
    'about.html', 'blog.html', 'contacts.html', 'events.html', 'food.html',
    'gallery.html', 'history.html', 'index-2.html', 'index-3.html', 'post.html',
    'prices.html', 'shelters.html', 'team.html', 'team-2.html',
    'treks.html', 'treks-single.html', 'treks-single-el-valle.html',
    'treks-single-la-peña.html', 'treks-single-laguna-rica.html', 'treks-single-tilin.html'
]

def update_footer(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            content = file.read()

        # Buscar el patrón del footer existente
        # Patrón 1: Buscar desde <footer hasta </footer>
        pattern = r'<footer[^>]*>.*?</footer>'

        # Verificar si existe el footer
        if re.search(pattern, content, re.DOTALL):
            # Extraer la parte antes del footer
            before_footer = re.split(pattern, content, maxsplit=1, flags=re.DOTALL)[0]

            # Buscar los scripts que van después del footer (si existen)
            scripts_pattern = r'(</footer>\s*)(.*?)(</body>)'
            match_scripts = re.search(scripts_pattern, content, re.DOTALL)

            scripts = ""
            if match_scripts:
                scripts_part = match_scripts.group(2).strip()
                # Mantener solo los scripts, no duplicar el footer
                if scripts_part and not '<footer' in scripts_part:
                    # Buscar solo las líneas de link y script
                    script_lines = []
                    for line in scripts_part.split('\n'):
                        line = line.strip()
                        if line.startswith('<link') or line.startswith('<script'):
                            script_lines.append('        ' + line)
                    if script_lines:
                        scripts = '\n' + '\n'.join(script_lines)

            # Construir el nuevo contenido
            new_content = before_footer.rstrip() + '\n' + new_footer + scripts + '\n    </footer>\n</body>\n</html>'

            # Escribir el archivo actualizado
            with open(filename, 'w', encoding='utf-8') as file:
                file.write(new_content)

            print(f"[OK] Actualizado: {filename}")
            return True
        else:
            print(f"[!] No se encontró footer en: {filename}")
            return False

    except Exception as e:
        print(f"[ERROR] Error en {filename}: {str(e)}")
        return False

# Actualizar todos los archivos
print("Actualizando footers en todos los archivos HTML...\n")
success_count = 0
for file in html_files:
    if os.path.exists(file):
        if update_footer(file):
            success_count += 1
    else:
        print(f"[!] Archivo no encontrado: {file}")

print(f"\n[COMPLETADO] Proceso completado: {success_count}/{len(html_files)} archivos actualizados")