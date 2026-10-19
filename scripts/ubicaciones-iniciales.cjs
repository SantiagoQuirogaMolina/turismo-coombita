/**
 * Carga las ubicaciones verificadas de restaurantes y hospedajes del centro de Cómbita.
 *
 * Las coordenadas se calcularon el 19-10-2026 a partir de la dirección de cada negocio
 * (nomenclatura "Calle N # M-D") sobre las calles de OpenStreetMap, y fueron revisadas
 * en Google Maps por el responsable del sitio. Los negocios rurales o sin dirección no se
 * tocan: quedan como "Ubicación por definir" hasta que se marquen desde el panel.
 *
 * Uso (desde la carpeta del proyecto, después de hacer copia de seguridad):
 *   node scripts/ubicaciones-iniciales.cjs            -> solo muestra qué cambiaría
 *   node scripts/ubicaciones-iniciales.cjs --aplicar  -> guarda los cambios
 *
 * No sobrescribe una ubicación que ya exista (por ejemplo, marcada a mano en el panel).
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../backend/data/guia-turistica-combita.json');
const aplicar = process.argv.includes('--aplicar');

const UBICACIONES = [
    { coleccion: 'restaurantes', id: 'rest002', nombre: 'Cafetería La Gran Vía', lat: 5.63236, lng: -73.32474 },
    { coleccion: 'restaurantes', id: 'rest003', nombre: 'Restaurante y Asadero Salsa y Picante', lat: 5.63238, lng: -73.32466 },
    { coleccion: 'restaurantes', id: 'rest004', nombre: 'Asadero Don Valentín', lat: 5.63243, lng: -73.32425 },
    // Calle 2 # 3-35 y # 3-34 quedan frente a frente: se separan unos 5 m, cada uno a su lado de la calle
    { coleccion: 'restaurantes', id: 'rest005', nombre: 'Restaurante Las Delicias de Nena', lat: 5.63273, lng: -73.32254 },
    { coleccion: 'restaurantes', id: 'rest006', nombre: 'Restaurante La Gran Gallina', lat: 5.63263, lng: -73.32254 },
    { coleccion: 'restaurantes', id: 'rest009', nombre: 'Fábrica de Almojábanas y Salón de Onces Hojana', lat: 5.63254, lng: -73.32347 },
    { coleccion: 'restaurantes', id: 'mltwaq5mim19eabjj3', nombre: 'Restaurante Como En Casa', lat: 5.63424, lng: -73.32343 },
    { coleccion: 'restaurantes', id: 'mnd9h3m1oedyv73his', nombre: 'El sabor de mi Tierra', lat: 5.63353, lng: -73.32393 },
    { coleccion: 'restaurantes', id: 'mnd9mu3oea5t7qo77ru', nombre: 'UMBA,  el placer de lo natural', lat: 5.63454, lng: -73.32408 },
    { coleccion: 'hoteles', id: 'hot001', nombre: 'Posada La Quinta de Rosita', lat: 5.63500, lng: -73.32139 },
    { coleccion: 'hoteles', id: 'hot002', nombre: 'Aparta Hotel El Rubí', lat: 5.63294, lng: -73.32384 },
    { coleccion: 'hoteles', id: 'hot004', nombre: 'Hotel La Posada de Bachué', lat: 5.63412, lng: -73.32420 }
];

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
let cambios = 0;

for (const u of UBICACIONES) {
    const registro = (data[u.coleccion] || []).find(r => r.id === u.id);
    if (!registro) {
        console.log(`NO ENCONTRADO  ${u.coleccion}/${u.id} (${u.nombre})`);
        continue;
    }
    if (registro.nombre.trim() !== u.nombre.trim()) {
        console.log(`NOMBRE DISTINTO ${u.id}: esperado "${u.nombre}", hay "${registro.nombre}" -> se omite`);
        continue;
    }
    if (registro.lat != null && registro.lng != null) {
        console.log(`YA TIENE        ${u.nombre} (${registro.lat}, ${registro.lng}) -> se conserva`);
        continue;
    }
    registro.lat = u.lat;
    registro.lng = u.lng;
    cambios++;
    console.log(`UBICAR         ${u.nombre} -> ${u.lat}, ${u.lng}`);
}

if (!aplicar) {
    console.log(`\n${cambios} ubicaciones por cargar. Nada se guardó (use --aplicar para guardar).`);
    process.exit(0);
}

if (cambios > 0) {
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, DATA_FILE);
}
console.log(`\n${cambios} ubicaciones guardadas.`);
