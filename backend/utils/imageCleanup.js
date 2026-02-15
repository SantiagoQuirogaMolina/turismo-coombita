/**
 * Limpieza de imágenes huérfanas
 */

const fs = require('fs');
const path = require('path');

function deleteOldImage(imagePath) {
    if (!imagePath || !imagePath.startsWith('/uploads/')) return;

    const fullPath = path.join(__dirname, '..', imagePath);
    try {
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (err) {
        console.error('Error eliminando imagen anterior:', err.message);
    }
}

module.exports = { deleteOldImage };
