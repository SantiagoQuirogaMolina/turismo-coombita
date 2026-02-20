#!/usr/bin/env node
/**
 * Optimizador de imágenes para Turismo Cómbita
 *
 * Uso:
 *   node scripts/optimizar-imagenes.js              # Optimiza TODAS las imágenes
 *   node scripts/optimizar-imagenes.js --nuevas     # Solo imágenes no optimizadas aún
 *   node scripts/optimizar-imagenes.js ruta/img.jpg # Optimiza una imagen específica
 *
 * - Redimensiona a máx 1920px de ancho
 * - Comprime JPEG a calidad 80, PNG a calidad 80
 * - Reemplaza los archivos originales (no hay vuelta atrás)
 * - Marca las imágenes procesadas para no reprocesarlas
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'src', 'assets', 'images');
const UPLOADS_DIR = path.join(__dirname, '..', 'backend', 'uploads');
const MARKER_FILE = path.join(__dirname, '..', '.imagenes-optimizadas.json');
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;

// Cargar registro de imágenes ya optimizadas
function loadMarker() {
    try {
        return JSON.parse(fs.readFileSync(MARKER_FILE, 'utf8'));
    } catch {
        return {};
    }
}

function saveMarker(marker) {
    fs.writeFileSync(MARKER_FILE, JSON.stringify(marker, null, 2));
}

// Buscar imágenes recursivamente
function findImages(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
            results.push(...findImages(fullPath));
        } else if (/\.(jpe?g|png|webp)$/i.test(item.name)) {
            results.push(fullPath);
        }
    }
    return results;
}

async function optimizeImage(filePath) {
    const stat = fs.statSync(filePath);
    const sizeBefore = stat.size;
    const ext = path.extname(filePath).toLowerCase();

    try {
        const image = sharp(filePath);
        const metadata = await image.metadata();

        let pipeline = sharp(filePath).rotate(); // auto-rotate EXIF

        // Redimensionar si es más ancha que MAX_WIDTH
        if (metadata.width > MAX_WIDTH) {
            pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
        }

        // Comprimir según formato
        if (ext === '.png') {
            pipeline = pipeline.png({ quality: PNG_QUALITY, compressionLevel: 9 });
        } else {
            // JPG, JPEG → siempre salida JPEG
            pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
        }

        const buffer = await pipeline.toBuffer();

        // Solo reemplazar si el resultado es más pequeño
        if (buffer.length < sizeBefore) {
            fs.writeFileSync(filePath, buffer);
            const sizeAfter = buffer.length;
            const saved = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
            return { status: 'optimized', sizeBefore, sizeAfter, saved: `${saved}%` };
        } else {
            return { status: 'skipped', reason: 'ya optimizada', sizeBefore, sizeAfter: sizeBefore };
        }
    } catch (err) {
        return { status: 'error', error: err.message, sizeBefore };
    }
}

function formatSize(bytes) {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return bytes + ' B';
}

async function main() {
    const args = process.argv.slice(2);
    const soloNuevas = args.includes('--nuevas');
    const archivoEspecifico = args.find(a => !a.startsWith('--'));

    const marker = loadMarker();
    let imagenes = [];

    if (archivoEspecifico) {
        const fullPath = path.resolve(archivoEspecifico);
        if (!fs.existsSync(fullPath)) {
            console.error(`Archivo no encontrado: ${fullPath}`);
            process.exit(1);
        }
        imagenes = [fullPath];
    } else {
        imagenes = [...findImages(IMAGES_DIR), ...findImages(UPLOADS_DIR)];

        if (soloNuevas) {
            imagenes = imagenes.filter(img => !marker[img]);
        }
    }

    if (imagenes.length === 0) {
        console.log('No hay imágenes por optimizar.');
        return;
    }

    console.log(`\nOptimizando ${imagenes.length} imágenes...\n`);

    let totalBefore = 0;
    let totalAfter = 0;
    let optimized = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < imagenes.length; i++) {
        const img = imagenes[i];
        const relPath = path.relative(path.join(__dirname, '..'), img);

        process.stdout.write(`[${i + 1}/${imagenes.length}] ${relPath}... `);

        const result = await optimizeImage(img);
        totalBefore += result.sizeBefore;

        if (result.status === 'optimized') {
            totalAfter += result.sizeAfter;
            optimized++;
            marker[img] = new Date().toISOString();
            console.log(`${formatSize(result.sizeBefore)} → ${formatSize(result.sizeAfter)} (-${result.saved})`);
        } else if (result.status === 'skipped') {
            totalAfter += result.sizeAfter;
            skipped++;
            marker[img] = new Date().toISOString();
            console.log(`${formatSize(result.sizeBefore)} (ya optimizada)`);
        } else {
            totalAfter += result.sizeBefore;
            errors++;
            console.log(`ERROR: ${result.error}`);
        }
    }

    saveMarker(marker);

    const totalSaved = totalBefore - totalAfter;
    console.log(`\n--- Resumen ---`);
    console.log(`Optimizadas: ${optimized}`);
    console.log(`Sin cambios: ${skipped}`);
    console.log(`Errores:     ${errors}`);
    console.log(`Antes:       ${formatSize(totalBefore)}`);
    console.log(`Después:     ${formatSize(totalAfter)}`);
    console.log(`Ahorro:      ${formatSize(totalSaved)} (${((totalSaved / totalBefore) * 100).toFixed(1)}%)`);
}

main().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
