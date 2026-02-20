#!/bin/bash
# ============================================================
# Despliegue automatico - Turismo Combita
# VPS Ubuntu 24.04 LTS
# Ejecutar como root: bash deploy-vps.sh
# ============================================================

set -e

DOMAIN="turismocombita.com"
REPO="https://github.com/SantiagoQuirogaMolina/turismo-coombita.git"
APP_DIR="/var/www/turismo-combita"
NODE_VERSION="20"

echo ""
echo "========================================"
echo "  Despliegue Turismo Combita"
echo "  Dominio: $DOMAIN"
echo "========================================"
echo ""

# ---- 1. Actualizar sistema ----
echo "[1/8] Actualizando sistema..."
apt update && apt upgrade -y

# ---- 2. Instalar Node.js 20 ----
echo "[2/8] Instalando Node.js $NODE_VERSION..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
fi
echo "Node: $(node -v) | npm: $(npm -v)"

# ---- 3. Instalar nginx y certbot ----
echo "[3/8] Instalando nginx y certbot..."
apt install -y nginx certbot python3-certbot-nginx

# ---- 4. Instalar PM2 ----
echo "[4/8] Instalando PM2..."
npm install -g pm2

# ---- 5. Clonar repositorio ----
echo "[5/8] Clonando repositorio..."
if [ -d "$APP_DIR" ]; then
    echo "  Directorio existe, actualizando con git pull..."
    cd "$APP_DIR" && git pull origin master
else
    git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

# ---- 6. Instalar dependencias ----
echo "[6/8] Instalando dependencias del backend..."
cd "$APP_DIR/backend"
npm install --production
cd "$APP_DIR"

# ---- 7. Configurar .env ----
if [ ! -f "$APP_DIR/.env" ]; then
    echo ""
    echo "========================================"
    echo "  Configuracion inicial requerida"
    echo "========================================"

    # Generar JWT secret aleatorio
    JWT_SECRET=$(openssl rand -hex 32)

    read -p "Email del admin: " ADMIN_EMAIL
    read -s -p "Password del admin: " ADMIN_PASSWORD
    echo ""

    cat > "$APP_DIR/.env" << ENVEOF
PORT=3001
NODE_ENV=production
JWT_SECRET=$JWT_SECRET
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
ENVEOF

    echo "  .env creado con JWT_SECRET aleatorio"
else
    echo "  .env ya existe, no se modifica"
fi

# ---- 8. Crear directorios necesarios ----
echo "[7/8] Creando directorios..."
mkdir -p "$APP_DIR/backend/uploads/restaurantes"
mkdir -p "$APP_DIR/backend/uploads/hoteles"
mkdir -p "$APP_DIR/backend/uploads/eventos"
mkdir -p "$APP_DIR/backend/uploads/artesanos"
mkdir -p "$APP_DIR/backend/uploads/guias"
mkdir -p "$APP_DIR/backend/uploads/galeria"
mkdir -p "$APP_DIR/backend/uploads/blog"
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/backups"

# ---- 9. Configurar nginx ----
echo "[8/8] Configurando nginx..."
cat > /etc/nginx/sites-available/turismo-combita << NGINXEOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
    gzip_min_length 256;

    # Limites
    client_max_body_size 10M;

    # Proxy al backend Node.js
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
    }

    # Cache para archivos estaticos
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|css|js|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
NGINXEOF

# Activar sitio
ln -sf /etc/nginx/sites-available/turismo-combita /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar config nginx
nginx -t

# Reiniciar nginx
systemctl restart nginx
systemctl enable nginx

# ---- 10. Iniciar app con PM2 ----
echo ""
echo "Iniciando aplicacion con PM2..."
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# ---- 11. Configurar firewall ----
echo ""
echo "Configurando firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ---- 12. Backup cron ----
echo ""
echo "Configurando backup semanal..."
# Arreglar line endings del script de backup
sed -i 's/\r$//' "$APP_DIR/scripts/backup.sh"
chmod +x "$APP_DIR/scripts/backup.sh"

# Agregar cron si no existe
CRON_LINE="0 3 * * 0 $APP_DIR/scripts/backup.sh >> $APP_DIR/logs/backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "backup.sh"; echo "$CRON_LINE") | crontab -

echo ""
echo "========================================"
echo "  DESPLIEGUE COMPLETADO"
echo "========================================"
echo ""
echo "  Sitio:  http://$DOMAIN"
echo "  Admin:  http://$DOMAIN/admin"
echo "  API:    http://$DOMAIN/api/health"
echo ""
echo "  SIGUIENTE PASO - SSL (HTTPS):"
echo "  Asegurate de que el dominio apunte a esta IP,"
echo "  luego ejecuta:"
echo ""
echo "    certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "  Comandos utiles:"
echo "    pm2 status          - Ver estado"
echo "    pm2 logs            - Ver logs en vivo"
echo "    pm2 restart all     - Reiniciar app"
echo "    bash $APP_DIR/scripts/backup.sh  - Backup manual"
echo ""
echo "========================================"
