# Turismo Combita - Guia de Servidor

## Desarrollo Local

### Requisitos
- Node.js 18+ (`node -v` para verificar)
- npm 6+

### Primer uso

```bash
# 1. Instalar dependencias
npm install
cd backend && npm install && cd ..

# 2. Crear archivo de variables de entorno
cp .env.example .env

# 3. Editar .env con tus datos locales
```

Contenido del `.env` para desarrollo local:

```
PORT=3001
NODE_ENV=development
JWT_SECRET=cualquier-texto-secreto-local
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=admin123
CORS_ORIGINS=http://localhost:3001
```

### Iniciar el servidor

```bash
npm start
```

Listo. Abre en el navegador:

- Sitio: http://localhost:3001
- Admin: http://localhost:3001/admin
- API:   http://localhost:3001/api/health

### Detener el servidor

`Ctrl + C` en la terminal.

---

## VPS (Produccion)

### Datos del servidor
- IP: 187.77.210.86
- Dominio: https://turismocombita.com
- Sistema: Ubuntu 24.04 LTS
- App en: `/var/www/turismo-combita`
- Proceso: PM2
- Reverse proxy: nginx
- SSL: Let's Encrypt (auto-renueva)
- Backups: Automaticos cada domingo 3am (ultimos 10)

### Conectarse al VPS

```bash
ssh root@187.77.210.86
```

### Comandos PM2 (administrar la app)

```bash
pm2 status                # Ver estado de la app
pm2 logs                  # Ver logs en vivo (Ctrl+C para salir)
pm2 logs --lines 100      # Ver ultimas 100 lineas de log
pm2 restart all           # Reiniciar la app
pm2 stop all              # Detener la app
pm2 start all             # Iniciar la app
```

### Actualizar el sitio (subir cambios)

Desde tu PC local:

```bash
# 1. Commit y push de tus cambios
git add -A
git commit -m "descripcion del cambio"
git push origin master
```

En el VPS:

```bash
ssh root@187.77.210.86
cd /var/www/turismo-combita
git pull origin master
cd backend && npm install && cd ..
pm2 restart all
```

### Editar variables de entorno

```bash
nano /var/www/turismo-combita/.env
pm2 restart all    # reiniciar para aplicar cambios
```

### Ver/editar configuracion nginx

```bash
nano /etc/nginx/sites-available/turismo-combita
nginx -t              # verificar que la config es valida
systemctl restart nginx
```

### Backup manual

```bash
bash /var/www/turismo-combita/scripts/backup.sh
```

Los backups se guardan en `/var/www/turismo-combita/backups/`.

### Restaurar un backup

```bash
# Ver backups disponibles
ls /var/www/turismo-combita/backups/

# Restaurar (ejemplo con backup_20260220_030000)
cp /var/www/turismo-combita/backups/backup_20260220_030000/guia-turistica-combita.json /var/www/turismo-combita/backend/data/
pm2 restart all
```

### Renovar SSL manualmente (no deberia ser necesario)

```bash
certbot renew
```

### Ver espacio en disco

```bash
df -h
du -sh /var/www/turismo-combita/backend/uploads/   # peso de imagenes subidas
du -sh /var/www/turismo-combita/backups/            # peso de backups
```

---

## Estructura del Proyecto

```
turismo-combita/
  admin/              Panel de administracion
  backend/
    data/             JSON de datos y usuarios
    routes/           Rutas API (11 archivos)
    uploads/          Imagenes subidas desde admin
    middleware/       Autenticacion JWT
    utils/            DataManager, validacion, limpieza
    server.js         Servidor Express (punto de entrada)
  src/
    pages/            22 paginas HTML del sitio
    assets/           CSS, JS, imagenes, iconos
  scripts/
    backup.sh         Backup automatico
    deploy-vps.sh     Script de despliegue
  .env                Variables de entorno (NO se sube a git)
  .env.example        Plantilla de variables
  ecosystem.config.js Configuracion PM2
  nginx.conf.example  Referencia config nginx
```
