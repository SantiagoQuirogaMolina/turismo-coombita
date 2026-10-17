#!/bin/bash
# Backup automatico - Turismo Combita
# Respalda el JSON de datos y el archivo de usuarios.
# Conserva solo los ultimos 10 backups.
#
# Uso manual:  bash scripts/backup.sh
# Uso con cron (semanal, domingos 3am):
#   crontab -e
#   0 3 * * 0 /ruta/al/proyecto/scripts/backup.sh >> /ruta/al/proyecto/logs/backup.log 2>&1

# Directorio base del proyecto (relativo al script)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
DATA_FILE="$PROJECT_DIR/backend/data/guia-turistica-combita.json"
USERS_FILE="$PROJECT_DIR/backend/data/users.json"
MAX_BACKUPS=10

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Timestamp para el nombre
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${TIMESTAMP}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

mkdir -p "$BACKUP_PATH"

# Copiar archivos de datos
if [ -f "$DATA_FILE" ]; then
    cp "$DATA_FILE" "$BACKUP_PATH/guia-turistica-combita.json"
    echo "[$(date)] Backup de datos creado: $BACKUP_NAME"
else
    echo "[$(date)] ERROR: No se encontro $DATA_FILE"
    exit 1
fi

if [ -f "$USERS_FILE" ]; then
    cp "$USERS_FILE" "$BACKUP_PATH/users.json"
    echo "[$(date)] Backup de usuarios incluido"
fi

# Copiar directorio de uploads si existe
UPLOADS_DIR="$PROJECT_DIR/backend/uploads"
if [ -d "$UPLOADS_DIR" ]; then
    tar -czf "$BACKUP_PATH/uploads.tar.gz" -C "$PROJECT_DIR/backend" uploads/ 2>/dev/null
    echo "[$(date)] Backup de uploads incluido"
fi

# Eliminar backups antiguos (conservar solo los ultimos MAX_BACKUPS)
BACKUP_COUNT=$(ls -dt "$BACKUP_DIR"/backup_* 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    REMOVE_COUNT=$((BACKUP_COUNT - MAX_BACKUPS))
    ls -dt "$BACKUP_DIR"/backup_* | tail -n "$REMOVE_COUNT" | xargs rm -rf
    echo "[$(date)] Eliminados $REMOVE_COUNT backups antiguos (conservando $MAX_BACKUPS)"
fi

echo "[$(date)] Backup completado exitosamente. Total backups: $(ls -d "$BACKUP_DIR"/backup_* 2>/dev/null | wc -l)"
