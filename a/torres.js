/* Cinnavia 8.0 — Defensa del Bosque.
   Defensa de torres: las plagas quieren llegar al Gran Árbol. v6: 1,000 niveles en 40 mundos (25 por mundo), 101 torres con 13 formas de atacar, 63 plagas y 40 jefes, cada uno con
   una combinación de reglas que no se repite (lodo, portales, cofres, meteoritos…), 5 tipos de nivel (normal, relámpago,
   desfile de jefes, asedio y gran final), 9 torres con 4 niveles y 2 especialidades, 15 plagas y 12 jefes con poderes,
   bendiciones cada 5 oleadas, reto del día, modo infinito, tienda con hojas doradas (mejoras de torres, poderes nuevos,
   aspectos del Gran Árbol y ayudas), 20 logros y dos rankings (niveles superados y modo infinito).
   Controles solo de tocar (la acción ocurre al soltar el dedo). Sprites en caché para que vaya fluido. */
'use strict';

const TD = { run: null, tab: 'mapas' };
const TD_COLS = 9, TD_ROWS = 13;
const tdData = () => {
  const d = jpData('torres'); d.st ||= {}; d.meta ||= {}; d.best ||= {}; d.inf ??= 0; d.day ||= {}; d.dayStars ??= 0; d.kills ??= 0;
  d.gold ??= 0; d.up ||= {}; d.pw ||= {}; d.skin ||= 'roble'; d.skins ||= { roble: 1 }; d.sb ??= 0; d.lf ??= 0; d.ach ||= {}; d.bossK ||= {}; d.wins ??= 0; d.days ??= 0;
  if (!d.v4) { // de 30 mapas (5 por mundo) a 300 niveles (25 por mundo): se conservan tus estrellas
    const old = d.st; const nst = {}; for (const k of Object.keys(old)) { const i = +k; if (i >= 0 && i < 30) nst[Math.floor(i / 5) * 25 + (i % 5)] = old[k]; } d.st = nst; d.v4 = 1;
  }
  return d;
};

/* ---------- mundos y mapas ---------- */
const TD_WORLDS = [
  { n: 'Pradera', e: '🌼', g: ['#9bd56a', '#8fcb5f'], p: ['#e2c58f', '#cfae74'], deco: 'flor', bg: '#7fb94e', fx: 'hoja', boss: 'taladora' },
  { n: 'Pantano', e: '🐸', g: ['#7fb38a', '#74a880'], p: ['#9c8a6a', '#86765a'], deco: 'junco', bg: '#5f8f6a', fx: 'luciernaga', boss: 'sapo' },
  { n: 'Nevado', e: '❄️', g: ['#eef6fb', '#e2edf5'], p: ['#b9c9d6', '#a3b5c4'], deco: 'pino', bg: '#cfe1ee', fx: 'nieve', boss: 'golem' },
  { n: 'Volcán', e: '🌋', g: ['#6b4a3e', '#62443a'], p: ['#3a2a26', '#2e211d'], deco: 'lava', bg: '#4a3028', fx: 'brasa', boss: 'dragon' },
  { n: 'Jardín encantado', e: '🌸', g: ['#c9b6f0', '#bca8e8'], p: ['#f4d8ec', '#e8c2dc'], deco: 'cristal', bg: '#9f88d0', fx: 'petalo', boss: 'reina' },
  { n: 'Reino de las nubes', e: '☁️', g: ['#f4f8ff', '#e8f0fe'], p: ['#ffe08a', '#f2c95a'], deco: 'nube', bg: '#bcd6f8', fx: 'brillo', boss: 'tormenta' },
  { n: 'Desierto dorado', e: '🌵', g: ['#f0d9a0', '#e8cf92'], p: ['#c99a5a', '#b5864a'], deco: 'cactus', bg: '#e2c27f', fx: 'arena', boss: 'escorpion' },
  { n: 'Costa de coral', e: '🐚', g: ['#f4e4b8', '#eedca8'], p: ['#7fc8e8', '#5fb4dc'], deco: 'concha', bg: '#8fd0ec', fx: 'burbuja', boss: 'cangrejo' },
  { n: 'Selva profunda', e: '🌴', g: ['#4f9a4a', '#478f42'], p: ['#8a6a3a', '#7a5c30'], deco: 'liana', bg: '#2f6a34', fx: 'lluvia', boss: 'serpiente' },
  { n: 'Bosque de otoño', e: '🍁', g: ['#e0a85a', '#d89c4c'], p: ['#a8744a', '#946440'], deco: 'calabaza', bg: '#c0783a', fx: 'hojao', boss: 'espantapajaros' },
  { n: 'Noche de hongos', e: '🍄', g: ['#2e3550', '#293048'], p: ['#5a5070', '#4c4462'], deco: 'hongoluz', bg: '#1a2038', fx: 'luciernaga', boss: 'murcielago' },
  { n: 'Cosmos', e: '🪐', g: ['#2a1f4a', '#251b42'], p: ['#8a7ad8', '#7a6ac8'], deco: 'astro', bg: '#140e2e', fx: 'estrella', boss: 'cometa' },
];
const TD_HAND = [
  { n: 'Claro del bosque', w: 0, paths: [[[4, -1], [4, 3], [1, 3], [1, 7], [7, 7], [7, 10], [4, 10], [4, 12]]] },
  { n: 'Sendero de hongos', w: 0, paths: [[[-1, 1], [6, 1], [6, 4], [2, 4], [2, 8], [7, 8], [7, 11], [4, 11]]] },
  { n: 'Río de piedras', w: 0, paths: [[[9, 2], [2, 2], [2, 6], [6, 6], [6, 9], [1, 9], [1, 12], [4, 12]]] },
  { n: 'Charcas', w: 1, paths: [[[4, -1], [4, 2], [7, 2], [7, 5], [1, 5], [1, 8], [7, 8], [7, 11], [4, 11]]] },
  { n: 'Dos caminos', w: 1, paths: [[[1, -1], [1, 6], [4, 6], [4, 11]], [[7, -1], [7, 6], [4, 6], [4, 11]]] },
  { n: 'Laberinto de juncos', w: 1, paths: [[[-1, 1], [7, 1], [7, 3], [1, 3], [1, 5], [7, 5], [7, 7], [1, 7], [1, 9], [7, 9], [7, 11], [4, 11]]] },
  { n: 'Ladera nevada', w: 2, paths: [[[9, 1], [2, 1], [2, 4], [6, 4], [6, 7], [2, 7], [2, 10], [6, 10], [6, 12]]] },
  { n: 'Cueva helada', w: 2, paths: [[[-1, 2], [3, 2], [3, 7], [4, 7], [4, 11]], [[9, 2], [5, 2], [5, 7], [4, 7], [4, 11]]] },
  { n: 'Espiral de hielo', w: 2, paths: [[[4, -1], [4, 1], [7, 1], [7, 11], [1, 11], [1, 3], [5, 3], [5, 9], [3, 9], [3, 6]]] },
  { n: 'Ríos de lava', w: 3, paths: [[[-1, 6], [2, 6], [2, 2], [6, 2], [6, 10], [3, 10], [3, 12]]] },
  { n: 'Tres puertas', w: 3, paths: [[[-1, 3], [2, 3], [2, 8], [4, 8], [4, 11]], [[4, -1], [4, 8]], [[9, 3], [6, 3], [6, 8], [4, 8]]] },
  { n: 'Corazón del volcán', w: 3, paths: [[[-1, 1], [7, 1], [7, 4], [1, 4], [1, 7], [7, 7], [7, 10], [2, 10], [2, 12]], [[9, 5], [8, 5], [8, 7], [7, 7]]] },
];
function tdGenPath(seed, two) {
  let s = seed; const r = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  for (let tries = 0; tries < 60; tries++) {
    let x = ri(1, 7), y = -1; const pts = [[x, y]]; y = ri(1, 2); pts.push([x, y]);
    let ok = true;
    while (y < 10) { let nx; let g = 0; do { nx = ri(0, 8); g++; } while (Math.abs(nx - x) < 3 && g < 20); if (Math.abs(nx - x) < 2) { ok = false; break; } x = nx; pts.push([x, y]); y = Math.min(12, y + ri(2, 3)); pts.push([x, y]); }
    if (!ok) continue;
    const last = pts[pts.length - 1]; if (last[1] > 12) last[1] = 12;
    const cells = new Set(); for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) cells.add(`${Math.round(x0 + (x1 - x0) * k / n)},${Math.round(y0 + (y1 - y0) * k / n)}`); }
    if (cells.size < 26) continue;
    const paths = [pts];
    if (two) { // segunda entrada por un costado que se une a un tramo vertical
      for (let k = 0; k < 20 && paths.length < 2; k++) {
        const i = ri(2, pts.length - 2); const a = pts[i - 1], b = pts[i]; if (a[0] !== b[0]) continue; const jy = ri(Math.min(a[1], b[1]), Math.max(a[1], b[1])); if (jy < 1) continue;
        const side = a[0] <= 4 ? 9 : -1; const dir = side > a[0] ? 1 : -1; let clear = true; for (let xx = a[0] + dir; xx !== side; xx += dir) if (cells.has(`${xx},${jy}`) || cells.has(`${xx},${jy - 1}`) || cells.has(`${xx},${jy + 1}`)) { clear = false; break; }
        if (!clear) continue; const p2 = [[side, jy], [a[0], jy], ...pts.slice(i)].filter((q, j, arr) => !j || q[0] !== arr[j - 1][0] || q[1] !== arr[j - 1][1]); paths.push(p2);
      }
    }
    return paths;
  }
  return TD_HAND[0].paths;
}
const TD_PER_WORLD = 25;
const TD_NAMES = [
  [['Colina', 'Valle', 'Sendero', 'Prado', 'Loma', 'Campo', 'Arroyo', 'Huerto'], ['de tréboles', 'de amapolas', 'del conejo', 'de girasoles', 'soleado', 'del viento', 'de las abejas', 'de margaritas', 'escondido']],
  [['Ciénaga', 'Puente', 'Charco', 'Laguna', 'Isla', 'Muelle', 'Remanso', 'Delta'], ['brumosa', 'de lianas', 'de nenúfares', 'del sapo', 'de juncos', 'verde', 'de las ranas', 'olvidado', 'de musgo']],
  [['Lago', 'Paso', 'Glaciar', 'Cumbre', 'Cueva', 'Bosque', 'Valle', 'Ladera'], ['congelado', 'de la ventisca', 'de cristal', 'blanco', 'del yeti', 'de escarcha', 'del pingüino', 'polar', 'helado']],
  [['Grietas', 'Cráter', 'Río', 'Cumbre', 'Fragua', 'Camino', 'Cueva', 'Paso'], ['ardientes', 'dormido', 'de magma', 'de ceniza', 'del fuego', 'de obsidiana', 'humeante', 'de brasas', 'rojo']],
  [['Arco', 'Fuente', 'Laberinto', 'Bosque', 'Trono', 'Jardín', 'Torre', 'Puente'], ['de cristal', 'de hadas', 'de rosas', 'de lunas', 'de las flores', 'secreto', 'de mariposas', 'de lavanda', 'mágico']],
  [['Escalera', 'Islas', 'Puente', 'Torres', 'Palacio', 'Camino', 'Plaza', 'Jardín'], ['de nubes', 'flotantes', 'del arcoíris', 'del viento', 'del cielo', 'de algodón', 'del sol', 'de plumas', 'celestial']],
  [['Dunas', 'Oasis', 'Cañón', 'Ruinas', 'Templo', 'Paso', 'Valle', 'Mesa'], ['doradas', 'escondido', 'del sol', 'del escorpión', 'de arena', 'del camello', 'antiguas', 'de cactus', 'del espejismo']],
  [['Playa', 'Arrecife', 'Bahía', 'Faro', 'Cueva', 'Muelle', 'Laguna', 'Isla'], ['de coral', 'de conchas', 'turquesa', 'del cangrejo', 'de perlas', 'de la marea', 'pirata', 'de estrellas de mar', 'azul']],
  [['Templo', 'Río', 'Cascada', 'Puente', 'Claro', 'Ruinas', 'Sendero', 'Corazón'], ['de la selva', 'del jaguar', 'escondida', 'de lianas', 'del tucán', 'de helechos', 'perdidas', 'verde', 'salvaje']],
  [['Huerto', 'Granero', 'Sendero', 'Bosque', 'Molino', 'Valle', 'Colina', 'Campo'], ['de calabazas', 'dorado', 'de hojas', 'rojizo', 'del espantapájaros', 'de castañas', 'de la cosecha', 'de manzanas', 'otoñal']],
  [['Claro', 'Gruta', 'Sendero', 'Círculo', 'Bosque', 'Lago', 'Torre', 'Pantano'], ['de hongos', 'de luciérnagas', 'de la luna', 'de búhos', 'brillante', 'de sombras', 'nocturno', 'del murciélago', 'encantado']],
  [['Órbita', 'Nebulosa', 'Anillos', 'Luna', 'Estación', 'Cinturón', 'Galaxia', 'Cometa'], ['de Saturno', 'violeta', 'de cristal', 'roja', 'estelar', 'de asteroides', 'espiral', 'perdido', 'del infinito']],
];
/* ---------- v5 · 28 mundos nuevos (1,000 niveles en total) ---------- */
TD_WORLDS.push(
  { n: 'Arrecife abisal', e: '🐙', g: ['#3a7a9a', '#33718f'], p: ['#c8b88a', '#b4a476'], deco: 'concha', bg: '#1f4e6e', fx: 'burbuja', boss: 'kraken' },
  { n: 'Aurora boreal', e: '🌌', g: ['#d8eef0', '#cde5e8'], p: ['#8fb0c8', '#7a9cb4'], deco: 'pino', bg: '#3a5a8a', fx: 'nieve', boss: 'osopolar' },
  { n: 'Cañón carmesí', e: '🏜️', g: ['#d88a5a', '#cc7e50'], p: ['#8a4a2a', '#7a3e22'], deco: 'cactus', bg: '#a8502a', fx: 'arena', boss: 'aguila' },
  { n: 'Bosque de bambú', e: '🎋', g: ['#a8d88a', '#9ccf7e'], p: ['#d8c89a', '#c4b486'], deco: 'liana', bg: '#5a9a5a', fx: 'petalo', boss: 'mantis' },
  { n: 'Ciudad hormiga', e: '🐜', g: ['#c8a87a', '#bc9c6e'], p: ['#8a6a4a', '#7a5c3e'], deco: 'cactus', bg: '#9a7a52', fx: 'arena', boss: 'reinahorm' },
  { n: 'Glaciar de cristal', e: '🧊', g: ['#e2f4ff', '#d4ecfa'], p: ['#9ad0f0', '#82c0e4'], deco: 'cristal', bg: '#a8d4f0', fx: 'nieve', boss: 'morsa' },
  { n: 'Isla volcánica', e: '🏝️', g: ['#8ac86a', '#7ebc5e'], p: ['#5a3a2e', '#4a2e24'], deco: 'lava', bg: '#3a8aa8', fx: 'brasa', boss: 'tortumagma' },
  { n: 'Pantano tóxico', e: '🧪', g: ['#7a9a3a', '#6e8e32'], p: ['#5a4a3a', '#4c3e30'], deco: 'junco', bg: '#3e5a2a', fx: 'luciernaga', boss: 'hidra' },
  { n: 'Montañas del trueno', e: '⛰️', g: ['#9aa0a8', '#8e949c'], p: ['#6a6058', '#5c524a'], deco: 'pino', bg: '#4a5060', fx: 'lluvia', boss: 'tronador' },
  { n: 'Cueva de gemas', e: '💠', g: ['#4a3a5a', '#433452'], p: ['#8a7a6a', '#7a6a5c'], deco: 'cristal', bg: '#2a1f38', fx: 'brillo', boss: 'topazo' },
  { n: 'Feria de sombras', e: '🎪', g: ['#5a3a6a', '#52345f'], p: ['#e8c86a', '#d4b45a'], deco: 'hongoluz', bg: '#2a1a3a', fx: 'estrella', boss: 'bufon' },
  { n: 'Ruinas antiguas', e: '🗿', g: ['#7aa86a', '#6e9c5e'], p: ['#b8a888', '#a49474'], deco: 'liana', bg: '#4a7a4a', fx: 'lluvia', boss: 'quetzal' },
  { n: 'Sabana dorada', e: '🦒', g: ['#e8c870', '#dcbc64'], p: ['#b8865a', '#a4764c'], deco: 'cactus', bg: '#d8a850', fx: 'arena', boss: 'leopardo' },
  { n: 'Taiga lunar', e: '🌲', g: ['#3a6a5a', '#346052'], p: ['#8a9aa0', '#7a8a90'], deco: 'pino', bg: '#1e3a4a', fx: 'nieve', boss: 'lobolunar' },
  { n: 'Manglar', e: '🦩', g: ['#5aa88a', '#509c7e'], p: ['#8a7a5a', '#7a6a4e'], deco: 'junco', bg: '#2f7a6a', fx: 'burbuja', boss: 'cocodrilo' },
  { n: 'Pueblo de juguetes', e: '🧸', g: ['#f0d8e8', '#e8cce0'], p: ['#8ac8f0', '#74b8e4'], deco: 'nube', bg: '#f8b8d0', fx: 'brillo', boss: 'robot' },
  { n: 'Cielo de globos', e: '🎈', g: ['#dff0ff', '#d2e8fc'], p: ['#ffb8c8', '#f4a4b8'], deco: 'nube', bg: '#9ac8f8', fx: 'brillo', boss: 'zepelin' },
  { n: 'Océano helado', e: '🐋', g: ['#c8e4f0', '#bcdcea'], p: ['#5a9ac8', '#4a8abc'], deco: 'concha', bg: '#2a6a9a', fx: 'nieve', boss: 'ballena' },
  { n: 'Desierto de sal', e: '🧂', g: ['#f4f0e8', '#ece6dc'], p: ['#c8b8a0', '#b8a890'], deco: 'cristal', bg: '#e0d4c0', fx: 'arena', boss: 'escarasol' },
  { n: 'Bosque de relojes', e: '⏰', g: ['#b89a6a', '#ac8e5e'], p: ['#6a5a4a', '#5c4e40'], deco: 'calabaza', bg: '#7a5a3a', fx: 'hojao', boss: 'relojero' },
  { n: 'Nebulosa estelar', e: '🌠', g: ['#3a2a5a', '#342552'], p: ['#e88ac8', '#d47ab8'], deco: 'astro', bg: '#1a1236', fx: 'estrella', boss: 'medusa' },
  { n: 'Reino de dulces', e: '🍭', g: ['#ffd8ec', '#fccce4'], p: ['#c88a5a', '#b87a4c'], deco: 'cristal', bg: '#ffb0d8', fx: 'petalo', boss: 'osogomita' },
  { n: 'Selva de neón', e: '💡', g: ['#1a3a3a', '#163434'], p: ['#3ae8c8', '#2ad4b4'], deco: 'hongoluz', bg: '#0a1e24', fx: 'luciernaga', boss: 'pavoneon' },
  { n: 'Fosa ardiente', e: '🔥', g: ['#4a2a3a', '#422434'], p: ['#ff8a3a', '#ea7a2e'], deco: 'lava', bg: '#2a1220', fx: 'brasa', boss: 'tiburonlava' },
  { n: 'Castillo de niebla', e: '🏰', g: ['#8a8aa0', '#7e7e94'], p: ['#5a5a6a', '#4e4e5e'], deco: 'hongoluz', bg: '#4a4a5e', fx: 'luciernaga', boss: 'espectro' },
  { n: 'Valle de dinosaurios', e: '🦕', g: ['#8ab85a', '#7eac4e'], p: ['#a8885a', '#98784c'], deco: 'liana', bg: '#5a8a3a', fx: 'hoja', boss: 'rex' },
  { n: 'Agujero negro', e: '🕳️', g: ['#1a1428', '#161222'], p: ['#6a5aa8', '#5a4a98'], deco: 'astro', bg: '#08060f', fx: 'estrella', boss: 'devorador' },
  { n: 'Corazón del bosque', e: '🌳', g: ['#3a8a4a', '#347e42'], p: ['#7a5a3a', '#6c4e32'], deco: 'flor', bg: '#1f5a2a', fx: 'hoja', boss: 'arbolmaldito' },
);
TD_NAMES.push(
  [['Gruta', 'Arrecife', 'Fosa', 'Jardín', 'Cueva', 'Bosque', 'Abismo', 'Banco'], ['de corales', 'del pulpo', 'de anémonas', 'profundo', 'de medusas', 'azul', 'de perlas', 'hundido', 'de algas']],
  [['Lago', 'Valle', 'Bahía', 'Cielo', 'Campo', 'Cumbre', 'Fiordo', 'Paso'], ['de la aurora', 'verde', 'del reno', 'boreal', 'de luces', 'del norte', 'brillante', 'polar', 'eterno']],
  [['Cañón', 'Mesa', 'Arco', 'Desfiladero', 'Barranco', 'Risco', 'Paso', 'Valle'], ['carmesí', 'del águila', 'de roca roja', 'del coyote', 'quemado', 'del atardecer', 'profundo', 'de cobre', 'del viento']],
  [['Senda', 'Bosque', 'Templo', 'Puente', 'Jardín', 'Arroyo', 'Claro', 'Pagoda'], ['de bambú', 'del panda', 'de la grulla', 'de jade', 'tranquilo', 'del cerezo', 'del farol', 'de seda', 'zen']],
  [['Túnel', 'Cámara', 'Galería', 'Hormiguero', 'Avenida', 'Plaza', 'Almacén', 'Torre'], ['real', 'de la reina', 'de las obreras', 'de azúcar', 'de hojas', 'subterránea', 'de tierra', 'infinita', 'roja']],
  [['Grieta', 'Muro', 'Cueva', 'Puente', 'Palacio', 'Lago', 'Cumbre', 'Senda'], ['de cristal', 'congelada', 'de la morsa', 'azul', 'de hielo eterno', 'brillante', 'del iglú', 'de escarcha', 'de zafiro']],
  [['Playa', 'Cráter', 'Laguna', 'Cueva', 'Bahía', 'Selva', 'Ladera', 'Muelle'], ['de lava', 'tropical', 'de ceniza', 'del loro', 'de basalto', 'humeante', 'de palmeras', 'del magma', 'escondida']],
  [['Charca', 'Ciénaga', 'Lodo', 'Bosque', 'Raíz', 'Niebla', 'Puente', 'Caldero'], ['tóxica', 'burbujeante', 'de la hidra', 'verde', 'pegajosa', 'de hongos', 'oscura', 'de vapor', 'maldita']],
  [['Pico', 'Paso', 'Cresta', 'Torre', 'Valle', 'Risco', 'Sendero', 'Cima'], ['del trueno', 'de rayos', 'tormentoso', 'del bisonte', 'gris', 'del eco', 'de granito', 'eléctrico', 'del relámpago']],
  [['Mina', 'Veta', 'Gruta', 'Salón', 'Túnel', 'Pozo', 'Galería', 'Cámara'], ['de amatista', 'de rubíes', 'de esmeraldas', 'brillante', 'del tejón', 'de diamantes', 'oculta', 'de topacio', 'de ópalo']],
  [['Carpa', 'Carrusel', 'Pasillo', 'Escenario', 'Laberinto', 'Rueda', 'Puesto', 'Túnel'], ['de sombras', 'del bufón', 'de espejos', 'embrujado', 'de máscaras', 'nocturno', 'de luces', 'del payaso', 'misterioso']],
  [['Pirámide', 'Templo', 'Plaza', 'Escalinata', 'Patio', 'Altar', 'Calzada', 'Muro'], ['de piedra', 'del jaguar', 'perdido', 'del quetzal', 'antiguo', 'de jade', 'del sol', 'cubierto', 'sagrado']],
  [['Llanura', 'Charca', 'Colina', 'Árbol', 'Pradera', 'Abrevadero', 'Sendero', 'Roca'], ['dorada', 'del león', 'de acacias', 'de la jirafa', 'del elefante', 'seca', 'salvaje', 'del atardecer', 'de la cebra']],
  [['Bosque', 'Claro', 'Lago', 'Colina', 'Sendero', 'Cabaña', 'Río', 'Valle'], ['lunar', 'del lobo', 'de abetos', 'nevado', 'del alce', 'silencioso', 'de plata', 'del aullido', 'frío']],
  [['Raíces', 'Canal', 'Isla', 'Laguna', 'Muelle', 'Estero', 'Delta', 'Pasaje'], ['del manglar', 'de flamencos', 'salobre', 'del caimán', 'de garzas', 'enredado', 'verde', 'de cangrejos', 'escondido']],
  [['Casa', 'Tren', 'Torre', 'Plaza', 'Tienda', 'Castillo', 'Jardín', 'Calle'], ['de bloques', 'de cuerda', 'de peluches', 'de muñecas', 'de soldaditos', 'de trompos', 'de canicas', 'de colores', 'de cartón']],
  [['Nube', 'Puerto', 'Isla', 'Ruta', 'Torre', 'Cielo', 'Faro', 'Puente'], ['de globos', 'flotante', 'del viento', 'pirata', 'de colores', 'de algodón', 'de arcoíris', 'alto', 'de cometas']],
  [['Bahía', 'Témpano', 'Costa', 'Fiordo', 'Mar', 'Isla', 'Corriente', 'Cabo'], ['helado', 'de la ballena', 'del narval', 'de témpanos', 'gris', 'polar', 'de focas', 'del frío', 'de hielo']],
  [['Salar', 'Llano', 'Laguna', 'Costra', 'Duna', 'Espejo', 'Cristal', 'Mina'], ['blanco', 'de sal', 'del flamenco', 'brillante', 'infinito', 'del sol', 'reluciente', 'seco', 'de espejos']],
  [['Torre', 'Engranaje', 'Péndulo', 'Reloj', 'Taller', 'Campanario', 'Bosque', 'Sendero'], ['del tiempo', 'oxidado', 'de cuco', 'de arena', 'detenido', 'de bronce', 'eterno', 'de minutos', 'de manecillas']],
  [['Nube', 'Estrella', 'Polvo', 'Faro', 'Puente', 'Anillo', 'Puerto', 'Jardín'], ['estelar', 'rosa', 'de cristal', 'de luz', 'de cometas', 'violeta', 'lejano', 'brillante', 'cósmico']],
  [['Castillo', 'Río', 'Bosque', 'Puente', 'Valle', 'Fuente', 'Torre', 'Colina'], ['de caramelo', 'de chocolate', 'de paletas', 'de gomitas', 'de algodón de azúcar', 'de galleta', 'de malvavisco', 'de miel', 'de turrón']],
  [['Jungla', 'Templo', 'Cascada', 'Cueva', 'Río', 'Claro', 'Ruinas', 'Puente'], ['de neón', 'fosforescente', 'eléctrica', 'brillante', 'de luces', 'nocturno', 'mágico', 'radiante', 'de colores']],
  [['Fosa', 'Grieta', 'Volcán', 'Cueva', 'Corriente', 'Abismo', 'Chimenea', 'Arrecife'], ['ardiente', 'submarina', 'de magma', 'del tiburón', 'hirviente', 'de lava', 'oscura', 'de fuego', 'profunda']],
  [['Torre', 'Muralla', 'Salón', 'Patio', 'Mazmorra', 'Puente', 'Biblioteca', 'Jardín'], ['de niebla', 'embrujado', 'del espectro', 'olvidado', 'de cristal oscuro', 'silencioso', 'de los ecos', 'gris', 'antiguo']],
  [['Valle', 'Pantano', 'Volcán', 'Selva', 'Lago', 'Llanura', 'Cueva', 'Nido'], ['del rex', 'jurásico', 'de helechos', 'prehistórico', 'del saurio', 'de fósiles', 'del ámbar', 'gigante', 'de huevos']],
  [['Horizonte', 'Órbita', 'Remolino', 'Vacío', 'Pozo', 'Espiral', 'Borde', 'Eco'], ['oscuro', 'sin luz', 'del devorador', 'infinito', 'de estrellas perdidas', 'silencioso', 'gravitacional', 'profundo', 'final']],
  [['Raíz', 'Corazón', 'Tronco', 'Copa', 'Bosque', 'Manantial', 'Santuario', 'Senda'], ['eterna', 'del gran árbol', 'sagrada', 'milenaria', 'de la vida', 'dorada', 'del guardián', 'viva', 'verde']],
);
const tdRng = (seed) => { let s = seed | 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
/* caminos de distintas formas: zigzag, serpentina, espiral; volteados y en espejo */
function tdGenShape(seed, style, two) {
  const r = tdRng(seed), ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  if (style === 0) return tdGenPath(seed, two);
  if (style === 1) { // serpentina horizontal
    for (let t = 0; t < 30; t++) {
      let y = ri(0, 2), left = r() < 0.5; const pts = [[left ? -1 : 9, y]]; let x;
      while (y < 10) { x = left ? ri(6, 8) : ri(0, 2); pts.push([x, y]); y += ri(2, 3); if (y > 12) y = 12; pts.push([x, y]); left = !left; }
      x = left ? ri(5, 7) : ri(1, 3); if (y <= 12) pts.push([x, y]);
      const P = pts.filter((q, j, a) => !j || q[0] !== a[j - 1][0] || q[1] !== a[j - 1][1]); if (P.length >= 6) return two ? [P, ...tdGenPath(seed + 7, false).slice(0, 0)] : [P];
    }
    return tdGenPath(seed, two);
  }
  // espiral hacia adentro
  const x0 = ri(0, 1), y0 = ri(0, 1), x1 = 8 - ri(0, 1), y1 = 12 - ri(0, 1), gap = 2;
  const pts = [[-1, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0 + gap], [x1 - gap, y0 + gap], [x1 - gap, y1 - gap], [x0 + gap, y1 - gap], [x0 + gap, y0 + gap * 2 + ri(0, 1)]];
  if (ri(0, 1)) pts.push([x1 - gap * 2, pts[pts.length - 1][1]]);
  return [pts];
}
function tdXform(paths, mirror, flip) {
  return paths.map((p) => p.map(([x, y]) => [mirror ? 8 - x : x, flip ? 12 - y : y]));
}
const TD_MAPS = (() => {
  const out = []; const usedG = new Set(TD_HAND.map((m) => m.n));
  TD_WORLDS.forEach((W, wi) => {
    const hand = TD_HAND.filter((m) => m.w === wi).map((m) => ({ ...m })); const NM = TD_NAMES[wi]; const used = usedG;
    const r = tdRng(wi * 9973 + 17);
    for (let k = 0; k < TD_PER_WORLD; k++) {
      let M;
      if (k < hand.length) M = hand[k];
      else {
        let n; for (let t = 0; t < 99; t++) { n = `${NM[0][(r() * NM[0].length) | 0]} ${NM[1][(r() * NM[1].length) | 0]}`; if (!used.has(n)) break; } used.add(n);
        const idx = wi * TD_PER_WORLD + k; const style = (k + wi) % 3 === 2 ? 2 : (k * 7 + wi) % 3 === 1 ? 1 : 0;
        const two = style === 0 && (wi >= 4 ? k % 2 === 0 : k % 3 === 1);
        M = { n, w: wi, paths: tdXform(tdGenShape(idx * 7919 + wi * 131 + k * 17, style, two), (idx * 3) % 2 === 1, style !== 0 && k % 4 === 3) };
      }
      const idx = out.length;
      M.kind = k === TD_PER_WORLD - 1 ? 'final' : k % 8 === 6 ? 'jefes' : k % 7 === 3 ? 'sprint' : k % 9 === 5 ? 'asedio' : 'normal';
      M.waves = M.kind === 'sprint' ? 8 : M.kind === 'jefes' ? 12 : M.kind === 'asedio' ? 30 : Math.min(26, 12 + Math.floor(Math.min(idx, 120) * 0.1)) + (M.kind === 'final' ? 4 : 0);
      out.push(M);
    }
  });
  return out;
})();
const TD_KINDS = { normal: { e: '', n: 'Normal' }, sprint: { e: '⚡', n: 'Relámpago', d: 'Pocas oleadas, pero las plagas van más rápido.' }, jefes: { e: '👑', n: 'Desfile de jefes', d: 'Un jefe cada 4 oleadas, de cualquier mundo.' }, asedio: { e: '🏰', n: 'Asedio', d: '30 oleadas: aguanta hasta el final.' }, final: { e: '🐉', n: 'Gran final', d: 'Último nivel del mundo: dos jefes juntos.' } };
const tdWaves = (mi) => TD_MAPS[mi].waves;

/* ---------- enemigos ---------- */
const TD_EN = {
  escarabajo: { n: 'Escarabajo', hp: 30, sp: 1.0, rew: 4, r: 0.3, c: '#2f6b4a', d: 'El más común.' },
  hormiga: { n: 'Hormiga veloz', hp: 18, sp: 1.9, rew: 3, r: 0.24, c: '#8a2a1a', d: 'Muy rápida.' },
  caracol: { n: 'Caracol acorazado', hp: 70, sp: 0.6, rew: 8, r: 0.34, c: '#a87a4a', armor: 0.5, d: 'Su concha quita la mitad del daño (menos rayos, veneno y búho).' },
  polilla: { n: 'Polilla', hp: 24, sp: 1.4, rew: 5, r: 0.3, c: '#c9a8e8', fly: 1, d: 'Vuela: la tortuga y las trampas no la alcanzan.' },
  topo: { n: 'Topo', hp: 45, sp: 1.1, rew: 6, r: 0.3, c: '#6b4a3a', burrow: 1, d: 'Se esconde bajo tierra por ratos.' },
  sanadora: { n: 'Luciérnaga sanadora', hp: 40, sp: 1.0, rew: 8, r: 0.28, c: '#e8e070', heal: 1, d: 'Cura a los enemigos cercanos.' },
  gusano: { n: 'Gusano', hp: 50, sp: 0.9, rew: 5, r: 0.3, c: '#e07a9a', split: 1, d: 'Al morir se divide en dos.' },
  gusito: { n: 'Gusanito', hp: 15, sp: 1.4, rew: 2, r: 0.2, c: '#f0a0b8', d: '' },
  escudo: { n: 'Escarabajo escudo', hp: 50, sp: 0.95, rew: 7, r: 0.32, c: '#3a6ab8', shield: 0.6, d: 'Una burbuja absorbe el primer daño.' },
  cuervo: { n: 'Cuervo', hp: 30, sp: 2.1, rew: 6, r: 0.3, c: '#2a2a3a', fly: 1, d: 'Volador muy rápido.' },
  rino: { n: 'Escarabajo rinoceronte', hp: 110, sp: 0.75, rew: 10, r: 0.36, c: '#6a4a8a', charge: 1, armor: 0.2, d: 'De pronto embiste a toda velocidad.' },
  fantasma: { n: 'Polilla fantasma', hp: 36, sp: 1.3, rew: 8, r: 0.3, c: '#e8f0ff', fly: 1, ghost: 1, d: 'Invisible: solo la ven las torres muy cercanas y el búho.' },
  // jefes de cada mundo
  taladora: { n: 'Taladora gigante', hp: 900, sp: 0.45, rew: 120, r: 0.5, c: '#7a7f88', armor: 0.35, boss: 1, lives: 5, d: 'Jefe de la Pradera: aguanta muchísimo.' },
  sapo: { n: 'Sapo gigante', hp: 1100, sp: 0.4, rew: 140, r: 0.5, c: '#4a9a3a', boss: 1, lives: 5, pow: 'salto', d: 'Jefe del Pantano: da saltos enormes.' },
  golem: { n: 'Golem de hielo', hp: 1500, sp: 0.35, rew: 170, r: 0.5, c: '#9fd0f0', armor: 0.3, boss: 1, lives: 5, pow: 'hielo', d: 'Jefe del Nevado: congela las torres cercanas.' },
  dragon: { n: 'Dragón de lava', hp: 1700, sp: 0.5, rew: 200, r: 0.5, c: '#d84a2a', fly: 1, boss: 1, lives: 6, pow: 'fuego', d: 'Jefe del Volcán: vuela y quema una torre a la vez.' },
  reina: { n: 'Reina polilla', hp: 2000, sp: 0.4, rew: 240, r: 0.5, c: '#a86ad8', fly: 1, boss: 1, lives: 6, pow: 'cria', d: 'Jefe del Jardín: suelta polillas sin parar.' },
  tormenta: { n: 'Nube tormenta', hp: 2600, sp: 0.38, rew: 300, r: 0.5, c: '#5a6278', fly: 1, armor: 0.3, boss: 1, lives: 8, pow: 'rayo', d: 'Jefe del Cielo: sus rayos paralizan torres.' },
};

/* ---------- torres ---------- */
const TD_TW = {
  ardilla: { n: 'Ardilla arquera', d: 'Rápida y ataca a todo, también a voladores.', cost: [50, 60, 110, 220], dmg: [7, 12, 20, 34], rng: [2.4, 2.7, 3.0, 3.3], rate: [0.55, 0.5, 0.44, 0.38], air: 1, c: '#c97a3a', un: 0, spec: [['Ráfaga', 'Dispara a 3 enemigos a la vez'], ['Francotiradora', '+50 % alcance y golpes críticos']] },
  tortuga: { n: 'Tortuga cañón', d: 'Bala pesada con daño en área. No alcanza voladores.', cost: [90, 100, 180, 340], dmg: [24, 42, 72, 130], rng: [2.8, 3.0, 3.3, 3.6], rate: [1.6, 1.5, 1.4, 1.25], area: [0.9, 1.0, 1.1, 1.25], air: 0, c: '#4a8a5a', un: 0, spec: [['Mortero', 'Explosión enorme'], ['Metralla', 'Dispara 3 balas']] },
  hongo: { n: 'Hongo de esporas', d: 'Envenena y frena a todos en un área.', cost: [70, 80, 140, 260], dot: [5, 9, 15, 26], slow: [0.35, 0.4, 0.45, 0.55], rng: [2.0, 2.2, 2.4, 2.6], rate: [1.3, 1.2, 1.1, 1.0], area: [0.9, 1.0, 1.15, 1.3], air: 1, c: '#d0405a', un: 1, spec: [['Plaga', 'Veneno al doble'], ['Lodo', 'Frena 70 %']] },
  abejas: { n: 'Colmena', d: 'Abejas que persiguen. Doble daño a voladores.', cost: [80, 90, 160, 300], dmg: [5, 8, 13, 22], nb: [2, 3, 3, 4], rng: [3.0, 3.2, 3.4, 3.7], rate: [1.6, 1.5, 1.4, 1.3], air: 2, c: '#e8b830', un: 2, spec: [['Enjambre', '+3 abejas por disparo'], ['Aguijón', 'Atraviesan armaduras y pegan más']] },
  rayo: { n: 'Luciérnaga láser', d: 'Rayo que se carga sobre el mismo enemigo. Ignora armaduras.', cost: [120, 130, 230, 420], dps: [10, 18, 30, 52], rng: [2.4, 2.6, 2.8, 3.0], air: 1, c: '#5ad0e8', un: 4, spec: [['Prisma', 'El rayo se divide en 3'], ['Sol', 'Se carga hasta ×7']] },
  arbol: { n: 'Árbol sagrado', d: 'Las torres de alrededor pegan más fuerte y te da semillas cada oleada.', cost: [100, 120, 200, 360], buff: [0.15, 0.22, 0.3, 0.4], seeds: [5, 9, 14, 22], rng: [1.6, 1.6, 1.8, 2.0], air: 0, c: '#3a9a4a', un: 6, support: 1, spec: [['Bosque viejo', '+60 % de daño cerca'], ['Cosecha', 'Muchas más semillas']] },
  buho: { n: 'Búho mago', d: 'Relámpago que salta entre enemigos. Ve a los fantasmas.', cost: [110, 120, 210, 380], dmg: [14, 24, 40, 70], ch: [2, 3, 4, 5], rng: [2.8, 3.0, 3.2, 3.5], rate: [1.2, 1.15, 1.1, 1.0], air: 1, c: '#8a6ad0', un: 8, spec: [['Tormenta', 'Salta entre 9 enemigos'], ['Sabio', 'Daño ×1.8 y frena']] },
  pino: { n: 'Pino escarcha', d: 'Congela a todos los enemigos cercanos por un momento.', cost: [90, 100, 180, 320], dmg: [6, 10, 16, 26], frz: [0.8, 1.0, 1.3, 1.6], rng: [1.6, 1.7, 1.9, 2.1], rate: [3.2, 3.0, 2.8, 2.5], air: 1, c: '#5aa8c8', un: 11, spec: [['Glaciar', 'Congela 2.5 s'], ['Ventisca', 'Además frena siempre 40 %']] },
  trampa: { n: 'Cardo espinoso', d: 'Va SOBRE el camino: lastima a quien pase. No toca voladores.', cost: [60, 70, 130, 240], dps: [14, 24, 40, 68], rng: [0.6, 0.6, 0.6, 0.6], air: 0, c: '#7aa83a', un: 14, path: 1, spec: [['Zarzas', 'También frena 45 %'], ['Hierro', 'Daño al doble']] },
};
const TD_META = [
  { id: 'semillas', n: 'Semillas iniciales', d: '+25 semillas al empezar', max: 5 },
  { id: 'dano', n: 'Raíces fuertes', d: '+6 % de daño de todas las torres', max: 5 },
  { id: 'vidas', n: 'Corteza dura', d: '+2 vidas por mapa', max: 3 },
  { id: 'poder', n: 'Savia rápida', d: 'Los poderes se recargan 12 % más rápido', max: 3 },
  { id: 'barato', n: 'Buen comercio', d: 'Torres 5 % más baratas', max: 3 },
  { id: 'critico', n: 'Ojo de halcón', d: '+5 % de golpes críticos (doble daño)', max: 4 },
  { id: 'botin', n: 'Botín', d: '+10 % de semillas por cada plaga', max: 3 },
  { id: 'venta', n: 'Reciclaje', d: 'Al vender recuperas 85 % (antes 70 %)', max: 1 },
];
const TD_MODS = [
  { k: 'rapidos', n: 'Plagas con prisa', d: 'Los enemigos van 30 % más rápido' },
  { k: 'blindados', n: 'Armaduras', d: 'Todos tienen un poco de armadura' },
  { k: 'pobre', n: 'Bolsillos vacíos', d: 'Empiezas con pocas semillas, pero cada plaga da más' },
  { k: 'jefes', n: 'Noche de jefes', d: 'Hay jefe cada 5 oleadas' },
  { k: 'niebla', n: 'Niebla', d: 'Tus torres alcanzan 15 % menos' },
  { k: 'enjambre', n: 'Enjambre', d: 'El doble de plagas, pero más débiles' },
];
const tdStarsTot = () => Object.values(tdData().st).reduce((a, b) => a + (+b || 0), 0) + (tdData().dayStars || 0);
const tdMeta = (id) => tdData().meta[id] || 0;
const tdMetaCost = (l) => 2 + l * 2;
const tdMetaSpent = () => TD_META.reduce((a, m) => { let s = 0; for (let l = 0; l < tdMeta(m.id); l++) s += tdMetaCost(l); return a + s; }, 0);
const tdUnlocked = (mi) => mi === 0 || (tdData().st[mi - 1] || 0) > 0;
const tdTowerOpen = (k) => TD_TW[k].un === 0 || (tdData().st[TD_TW[k].un - 1] || 0) > 0;
const tdToday = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const tdDaily = () => { let h = 5; for (const ch of tdToday()) h = (h * 31 + ch.charCodeAt(0)) >>> 0; const open = TD_MAPS.map((_, i) => i).filter((i) => tdUnlocked(i)); return { mi: open[h % open.length], mod: TD_MODS[(h >>> 4) % TD_MODS.length] }; };

/* ---------- v3: más plagas, giros por mapa, temas de oleada y bendiciones ---------- */
Object.assign(TD_EN, {
  avispa: { n: 'Avispa', hp: 14, sp: 2.5, rew: 3, r: 0.24, c: '#f2b01e', fly: 1, d: 'Voladora diminuta y muy veloz: viene en enjambres.' },
  ladron: { n: 'Mapache ladrón', hp: 62, sp: 1.5, rew: 9, r: 0.32, c: '#7a7a86', steal: 1, d: 'No quita vidas: si llega al árbol se roba semillas. ¡Detenlo!' },
  ciempies: { n: 'Ciempiés', hp: 150, sp: 0.8, rew: 12, r: 0.34, c: '#c2602a', split: 3, armor: 0.15, d: 'Al morir se parte en tres gusanitos.' },
});
const TD_TWISTS = {
  lodo: { e: '🟤', n: 'Lodo', d: 'Algunas casillas del camino están llenas de lodo y frenan a las plagas.' },
  fertil: { e: '✨', n: 'Suelo fértil', d: 'Las torres sobre casillas brillantes pegan 30 % más y alcanzan más lejos.' },
  portal: { e: '🌀', n: 'Portal', d: 'Las plagas se teletransportan hacia adelante por un portal.' },
  lluvia: { e: '🌠', n: 'Lluvia de estrellas', d: 'Caen estrellas del cielo que lastiman a las plagas.' },
  meteoros: { e: '☄️', n: 'Meteoritos', d: 'Caen meteoritos sobre tus torres y las aturden. ¡Tienen aviso!' },
  cofres: { e: '🎁', n: 'Cofres', d: 'Aparecen cofres con semillas: tócalos antes de que desaparezcan.' },
  solo: { e: '🔒', n: 'Cuatro torres', d: 'Solo puedes construir 4 tipos de torre en este mapa.' },
  raices: { e: '🌱', n: 'Raíces jóvenes', d: 'No puedes mejorar torres hasta la oleada 6.' },
  espacio: { e: '📦', n: 'Espacio escaso', d: 'Pocas torres a la vez (9; en los mundos nuevos, 12): elige bien.' },
  emboscada: { e: '🗡️', n: 'Emboscadas', d: 'Cada 3 oleadas, un grupo aparece a mitad del camino.' },
  resbalon: { e: '🧊', n: 'Hielo resbaloso', d: 'Hay un tramo donde las plagas corren 70 % más rápido.' },
  bendito: { e: '🌳', n: 'Árbol bendito', d: 'Recuperas 1 vida cada 3 oleadas superadas.' },
};
const TD_TW_KEYS = Object.keys(TD_TWISTS);
(() => { // reparte los giros: ningún nivel repite la combinación de otro
  const K = TD_TW_KEYS, n = K.length; const sets = [];
  for (let a = 0; a < n; a++) sets.push([K[a]]);
  const pairs = [], trip = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([K[a], K[b]]);
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) trip.push([K[a], K[b], K[c]]);
  const r = tdRng(4242); const shuf = (A) => { for (let i = A.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; [A[i], A[j]] = [A[j], A[i]]; } return A; };
  const quad = []; for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) quad.push([K[a], K[b], K[c], K[d]]);
  // v5: los mundos nuevos mezclan otra vez parejas y tríos (con mapas distintos) y de vez en cuando cuatro reglas
  const order = [[], ...sets, ...shuf(pairs), ...shuf(trip), ...shuf(pairs.concat(trip, shuf(quad).slice(0, 150))), ...shuf(trip.concat(pairs))];
  TD_MAPS.forEach((M, i) => { M.tw = order[i] || ['lodo', 'portal', 'cofres', 'lluvia']; });
  TD_MAPS[TD_MAPS.length - 1].tw = ['portal', 'meteoros', 'cofres', 'bendito'];
})();
const TD_THEMES = [
  { id: 'mixta', n: 'Plaga mixta', k: null, nm: 1, hm: 1, gm: 1 },
  { id: 'enjambre', n: 'Enjambre veloz', k: ['hormiga', 'avispa', 'escarabajo'], nm: 1.7, hm: 0.6, gm: 0.5 },
  { id: 'blindada', n: 'Columna blindada', k: ['caracol', 'escudo', 'rino'], nm: 0.7, hm: 1.2, gm: 1.2 },
  { id: 'aerea', n: 'Ataque aéreo', k: ['polilla', 'cuervo', 'avispa', 'fantasma'], nm: 1, hm: 0.9, gm: 0.8 },
  { id: 'subte', n: 'Plaga subterránea', k: ['topo', 'gusano', 'ciempies'], nm: 0.9, hm: 1, gm: 1 },
  { id: 'elite', n: 'Tropa de élite', k: ['rino', 'sanadora', 'escudo', 'ladron'], nm: 0.55, hm: 1.4, gm: 1.3 },
  { id: 'carrera', n: 'Carrera loca', k: ['cuervo', 'hormiga', 'avispa', 'ladron'], nm: 0.8, hm: 0.8, gm: 0.45 },
  { id: 'fantasmas', n: 'Noche de fantasmas', k: ['fantasma', 'polilla', 'sanadora'], nm: 0.9, hm: 1, gm: 0.9 },
  { id: 'ladrones', n: 'Banda de ladrones', k: ['ladron', 'hormiga', 'escudo'], nm: 0.8, hm: 1, gm: 0.8 },
];
const TD_PERKS = [
  { id: 'dmg', e: '⚔️', n: 'Filo afilado', d: '+12 % de daño de todas las torres', f: (p) => { p.dmg += 0.12; } },
  { id: 'rate', e: '⚡', n: 'Prisa de bosque', d: 'Las torres disparan 10 % más rápido', f: (p) => { p.rate += 0.1; } },
  { id: 'rng', e: '🔭', n: 'Ojo de águila', d: '+10 % de alcance en todas las torres', f: (p) => { p.rng += 0.1; } },
  { id: 'sem', e: '🌰', n: 'Cosecha', d: '+120 semillas ahora mismo', f: (p, s) => { s.seeds += 120; } },
  { id: 'int', e: '💰', n: 'Intereses', d: 'Cada oleada ganas 6 % de tus semillas (máx. 40)', f: (p) => { p.int += 0.06; } },
  { id: 'vid', e: '❤️', n: 'Corazón de roble', d: '+4 vidas', f: (p, s, l) => { s.lives = Math.min(l + 10, s.lives + 4); } },
  { id: 'bot', e: '🎒', n: 'Saqueo', d: '+25 % de semillas por cada plaga', f: (p) => { p.bot += 0.25; } },
  { id: 'pod', e: '🍃', n: 'Savia fresca', d: 'Tus poderes se recargan ya y 25 % más rápido', f: (p, s) => { s.cd.a = 0; s.cd.r = 0; p.pw += 0.25; } },
  { id: 'cri', e: '🎯', n: 'Puntería', d: '+10 % de golpes críticos', f: (p) => { p.cri += 0.1; } },
  { id: 'bar', e: '🏷️', n: 'Oferta', d: 'Torres y mejoras 10 % más baratas', f: (p) => { p.bar += 0.1; } },
  { id: 'esp', e: '🌵', n: 'Espinas', d: 'Las plagas pierden vida solas con el tiempo', f: (p) => { p.esp += 0.012; } },
  { id: 'esc', e: '❄️', n: 'Escarcha', d: 'Todas las plagas van 8 % más lentas', f: (p) => { p.esc += 0.08; } },
  { id: 'bel', e: '🌰', n: 'Bellotas pesadas', d: 'La lluvia de bellotas hace 60 % más de daño', f: (p) => { p.bel += 0.6; } },
  { id: 'ven', e: '♻️', n: 'Reciclaje total', d: 'Al vender recuperas el 100 %', f: (p) => { p.ven = 1; } },
];

/* ---------- v4: 6 mundos nuevos con sus jefes, tienda y logros ---------- */
Object.assign(TD_EN, {
  escorpion: { n: 'Escorpión rey', hp: 3000, sp: 0.45, rew: 330, r: 0.5, c: '#c8902a', armor: 0.25, boss: 1, lives: 8, pow: 'veneno', d: 'Jefe del Desierto: su aguijón paraliza dos torres.' },
  cangrejo: { n: 'Cangrejo titán', hp: 3600, sp: 0.35, rew: 360, r: 0.5, c: '#e0503a', armor: 0.4, boss: 1, lives: 8, pow: 'escudo', d: 'Jefe de la Costa: se encierra en su caparazón y no recibe daño.' },
  serpiente: { n: 'Serpiente esmeralda', hp: 3800, sp: 0.55, rew: 390, r: 0.5, c: '#2aa05a', boss: 1, lives: 9, pow: 'acelera', d: 'Jefe de la Selva: hace que todas las plagas corran.' },
  espantapajaros: { n: 'Espantapájaros', hp: 4200, sp: 0.4, rew: 420, r: 0.5, c: '#c8a050', armor: 0.2, boss: 1, lives: 9, pow: 'invoca', d: 'Jefe del Otoño: llama a sus cuervos.' },
  murcielago: { n: 'Murciélago sombra', hp: 4400, sp: 0.55, rew: 450, r: 0.5, c: '#5a4a7a', fly: 1, boss: 1, lives: 10, pow: 'apaga', d: 'Jefe de la Noche: un grito apaga las torres cercanas.' },
  cometa: { n: 'Cometa errante', hp: 5200, sp: 0.5, rew: 500, r: 0.5, c: '#7ad0ff', fly: 1, armor: 0.3, boss: 1, lives: 10, pow: 'cura', d: 'Jefe del Cosmos: cura a todas las plagas.' },
});
const TD_BOSSES = TD_WORLDS.map((w) => w.boss);
const tdDiff = (lvl) => 1 + Math.min(lvl, 60) * 0.032 + Math.max(0, Math.min(lvl, 300) - 60) * 0.011 + Math.max(0, lvl - 300) * 0.0035;
/* tienda (se paga con hojas doradas 🍂 que ganas al superar niveles) */
const TD_UPC = [25, 50, 90, 140, 200];
const TD_POWERS = {
  trueno: { e: '⚡', n: 'Trueno', d: 'Rayos caen sobre 12 plagas al azar.', cost: 120, cd: 40 },
  helada: { e: '🧊', n: 'Gran helada', d: 'Congela a todas las plagas 3 segundos.', cost: 160, cd: 55 },
  cosecha: { e: '🌾', n: 'Cosecha', d: 'Recibes semillas al instante.', cost: 100, cd: 50 },
};
const TD_SKINS = {
  roble: { n: 'Roble', cost: 0, c: ['#2f8a40', '#4aaa5a', '#7a5232'], f: '#e8324a' },
  cerezo: { n: 'Cerezo', cost: 80, c: ['#f2a8c8', '#ffc8dc', '#6a4232'], f: '#ffffff' },
  otono: { n: 'Arce de otoño', cost: 120, c: ['#d8642a', '#f09a3a', '#6a4232'], f: '#ffd23c' },
  nieve: { n: 'Pino nevado', cost: 120, c: ['#2f6a5a', '#e8f4ff', '#5a4232'], f: '#bfe3ff' },
  dorado: { n: 'Árbol dorado', cost: 220, c: ['#e8b830', '#ffe066', '#8a6a2a'], f: '#fff6c8' },
  cristal: { n: 'Árbol de cristal', cost: 260, c: ['#7ad0ff', '#c8f0ff', '#5a6a9a'], f: '#ff9ad8' },
  arcoiris: { n: 'Árbol arcoíris', cost: 380, c: ['#ff6b6b', '#ffd23c', '#7a5232'], f: '#7ad0ff', rb: 1 },
};
const TD_BOOST = { sb: { n: 'Bolsa de semillas', d: '+40 semillas al empezar cada nivel', cost: [60, 120, 200] }, lf: { n: 'Corteza extra', d: '+2 vidas en cada nivel', cost: [80, 150, 250] } };
const tdLvlsWon = () => Object.values(tdData().st).filter((v) => v > 0).length;
const TD_ACH = [
  { id: 'w1', n: 'Primer brote', d: 'Supera tu primer nivel', g: 10, t: (d) => tdLvlsWon() >= 1 },
  { id: 'w10', n: 'Guardabosques', d: 'Supera 10 niveles', g: 25, t: () => tdLvlsWon() >= 10 },
  { id: 'w25', n: 'Mundo salvado', d: 'Supera 25 niveles', g: 40, t: () => tdLvlsWon() >= 25 },
  { id: 'w50', n: 'Medio centenar', d: 'Supera 50 niveles', g: 60, t: () => tdLvlsWon() >= 50 },
  { id: 'w100', n: 'Leyenda del bosque', d: 'Supera 100 niveles', g: 120, t: () => tdLvlsWon() >= 100 },
  { id: 'w200', n: 'Guardián eterno', d: 'Supera 200 niveles', g: 200, t: () => tdLvlsWon() >= 200 },
  { id: 'w300', n: 'Los 300', d: 'Supera los 300 niveles', g: 500, t: () => tdLvlsWon() >= 300 },
  { id: 's3x10', n: 'Perfeccionista', d: '3 estrellas en 10 niveles', g: 30, t: (d) => Object.values(d.st).filter((v) => v >= 3).length >= 10 },
  { id: 's3x50', n: 'Estrella brillante', d: '3 estrellas en 50 niveles', g: 90, t: (d) => Object.values(d.st).filter((v) => v >= 3).length >= 50 },
  { id: 'k1k', n: 'Fumigador', d: 'Vence 1,000 plagas', g: 20, t: (d) => d.kills >= 1000 },
  { id: 'k10k', n: 'Exterminador', d: 'Vence 10,000 plagas', g: 60, t: (d) => d.kills >= 10000 },
  { id: 'k50k', n: 'Plaga cero', d: 'Vence 50,000 plagas', g: 150, t: (d) => d.kills >= 50000 },
  { id: 'b6', n: 'Cazajefes', d: 'Vence a 6 jefes distintos', g: 60, t: (d) => Object.keys(d.bossK).length >= 6 },
  { id: 'b12', n: 'Rey de reyes', d: 'Vence a los 12 jefes', g: 150, t: (d) => Object.keys(d.bossK).length >= 12 },
  { id: 'i20', n: 'Resistencia', d: 'Aguanta 20 oleadas en el modo infinito', g: 40, t: (d) => d.inf >= 20 },
  { id: 'i50', n: 'Inquebrantable', d: 'Aguanta 50 oleadas en el modo infinito', g: 120, t: (d) => d.inf >= 50 },
  { id: 'd7', n: 'Constancia', d: 'Gana 7 retos del día', g: 70, t: (d) => d.dayStars >= 7 },
  { id: 'up', n: 'Torre de élite', d: 'Mejora una torre al máximo en la tienda', g: 40, t: (d) => Object.values(d.up).some((v) => v >= 5) },
  { id: 'sk', n: 'A la moda', d: 'Compra un aspecto para el Gran Árbol', g: 20, t: (d) => Object.keys(d.skins).length >= 2 },
  { id: 'pw', n: 'Poder total', d: 'Ten los 3 poderes de la tienda', g: 80, t: (d) => Object.keys(TD_POWERS).every((k) => d.pw[k]) },
];
function tdCheckAch() { const d = tdData(); const got = []; for (const a of TD_ACH) if (!d.ach[a.id] && a.t(d)) { d.ach[a.id] = 1; d.gold += a.g; got.push(a); } return got; }

/* ---------- v5 · gran evolución: 48 plagas nuevas, 28 jefes, 22 torres, oleadas, bendiciones, poderes y aspectos ---------- */
const TD_EN5 = [];
const tdEnDesc = (o) => [o.fly && 'Vuela', o.armor && `armadura ${Math.round(o.armor * 100)} %`, o.shield && 'burbuja protectora', o.heal && 'cura a los cercanos', o.regen && 'se cura sola', o.burrow && 'se esconde bajo tierra', o.split && `al morir se divide en ${o.split}`, o.charge && 'embiste', o.ghost && 'invisible (solo la ven torres cercanas y las de rayo en cadena)', o.steal && 'roba semillas', o.blink && 'da saltos hacia adelante', o.rage && 'corre más cuando está herida', o.aura && 'protege a sus vecinos con burbujas', o.tough && 'no la frenan el frío ni el lodo de tus torres', o.spawn && 'deja crías en el camino'].filter(Boolean).join(' · ');
const en5 = (k, em, n, hp, sp, rew, c, o = {}, d = '') => { TD_EN[k] = { n, hp, sp, rew, r: 0.3, c, em, ...o, d: d || (tdEnDesc(o) ? tdEnDesc(o).charAt(0).toUpperCase() + tdEnDesc(o).slice(1) + '.' : 'Plaga común de este mundo.') }; if (!o.hide) TD_EN5.push(k); };
en5('mosca', '🪰', 'Mosca zumbadora', 16, 2.3, 3, '#5a5a5a', { fly: 1 }, 'Voladora muy rápida: llega en nubes.');
en5('cucaracha', '🪳', 'Cucaracha', 46, 1.5, 5, '#7a3a1a', { regen: 0.05 });
en5('grillo', '🦗', 'Grillo saltarín', 36, 1.2, 5, '#5aa83a', { blink: 1 });
en5('arana', '🕷️', 'Araña tejedora', 70, 1.0, 8, '#3a2a3a', { spawn: 'aranita' });
en5('aranita', '🕷️', 'Arañita', 12, 1.8, 1, '#6a5a6a', { hide: 1 });
en5('raton', '🐁', 'Ratón', 26, 2.2, 3, '#a8a8b0', {}, 'Pequeño y rapidísimo.');
en5('mariposa', '🦋', 'Mariposa curandera', 40, 1.3, 7, '#5ab0f0', { fly: 1, heal: 1 });
en5('alacran', '🦂', 'Alacrán', 80, 1.1, 8, '#a86a2a', { armor: 0.3, rage: 1 });
en5('lombriz', '🪱', 'Lombriz', 55, 0.9, 6, '#e88a8a', { burrow: 1, split: 2 });
en5('rata', '🐀', 'Rata ladrona', 60, 1.6, 8, '#6a6a72', { steal: 1 });
en5('caracolgig', '🐌', 'Caracol de piedra', 150, 0.5, 11, '#8a7a6a', { armor: 0.5, tough: 1 });
en5('ardillaloca', '🐿️', 'Ardilla traviesa', 44, 1.9, 6, '#c87a3a', { blink: 1 });
en5('puercoespin', '🦔', 'Puercoespín', 100, 0.85, 9, '#8a6a4a', { armor: 0.4 });
en5('vampiro', '🦇', 'Murciélago vampiro', 40, 1.9, 7, '#4a3a5a', { fly: 1, regen: 0.04 });
en5('caramelo', '🍬', 'Caramelo saltón', 20, 2.2, 2, '#ff6ab0', {}, 'Dulce, pequeño y veloz.');
en5('lobo', '🐺', 'Lobo gris', 85, 1.5, 9, '#7a7a88', { rage: 1 });
en5('zorro', '🦊', 'Zorro astuto', 64, 1.7, 8, '#e07a2a', { blink: 1 });
en5('bandido', '🦝', 'Mapache bandido', 90, 1.4, 10, '#6a6a6a', { steal: 1, shield: 0.4 });
en5('jabali', '🐗', 'Jabalí', 140, 0.9, 12, '#6a4a3a', { charge: 1, armor: 0.15 });
en5('zorrillo', '🦨', 'Zorrillo', 80, 1.1, 10, '#2a2a2a', { aura: 1 });
en5('tejon', '🦡', 'Tejón tozudo', 160, 0.8, 12, '#5a5a5a', { tough: 1, armor: 0.3 });
en5('castor', '🦫', 'Castor constructor', 130, 0.9, 11, '#8a5a3a', { regen: 0.04, tough: 1 });
en5('nutria', '🦦', 'Nutria', 70, 1.8, 9, '#7a5a42', { regen: 0.05 });
en5('sapito', '🐸', 'Sapo brincador', 60, 1.3, 7, '#5aaa3a', { blink: 1, regen: 0.03 });
en5('camaron', '🦐', 'Camarón veloz', 34, 2.4, 4, '#ff8a6a', {}, 'Corre muchísimo.');
en5('cangrejito', '🦀', 'Cangrejo blindado', 120, 1.0, 11, '#e0503a', { armor: 0.45, shield: 0.4 });
en5('perezoso', '🦥', 'Perezoso gigante', 420, 0.38, 22, '#9a8a6a', { tough: 1, armor: 0.2 }, 'Lentísimo, pero aguanta muchísimo y no se deja frenar.');
en5('langosta', '🦞', 'Langosta furiosa', 140, 1.0, 12, '#c83a2a', { armor: 0.3, rage: 1 });
en5('caiman', '🐊', 'Caimán', 190, 0.9, 15, '#4a7a3a', { armor: 0.35, charge: 1 });
en5('calamar', '🦑', 'Calamar fantasma', 70, 1.4, 10, '#d0a0e8', { ghost: 1, blink: 1 });
en5('pulpito', '🐙', 'Pulpito', 110, 1.0, 11, '#c85a8a', { split: 3, splitK: 'camaron' });
en5('medusita', '🪼', 'Medusa', 60, 1.1, 9, '#c8a8f0', { fly: 1, ghost: 1, heal: 1 });
en5('pezglobo', '🐡', 'Pez globo', 130, 0.9, 12, '#e8c85a', { shield: 0.8 });
en5('tiburoncito', '🦈', 'Tiburón', 160, 1.2, 14, '#7a8aa0', { charge: 1, rage: 1 });
en5('flamenco', '🦩', 'Flamenco', 80, 1.6, 10, '#ff8ab8', { fly: 1 });
en5('pinguino', '🐧', 'Pingüino', 90, 1.5, 9, '#2a2a3a', { tough: 1 });
en5('foca', '🦭', 'Foca', 170, 0.9, 13, '#8a9aa8', { armor: 0.3, regen: 0.04 });
en5('cabra', '🐐', 'Cabra montés', 100, 1.4, 10, '#d8d0c0', { blink: 1, armor: 0.15 });
en5('dodo', '🦤', 'Dodo despistado', 90, 1.6, 9, '#8a8aa0', { rage: 1 });
en5('pavo', '🦚', 'Pavo real', 120, 1.1, 12, '#3a8ae8', { aura: 1, heal: 1 });
en5('calabacin', '🎃', 'Calabaza traviesa', 140, 1.0, 12, '#e8762a', { split: 3, splitK: 'raton' });
en5('fantasmita', '👻', 'Fantasmita', 70, 1.4, 10, '#f0f0ff', { fly: 1, ghost: 1, blink: 1 });
en5('alien', '👾', 'Invasor', 110, 1.3, 12, '#9a6ae8', { blink: 1, regen: 0.04 });
en5('robotito', '🤖', 'Robot', 180, 1.0, 15, '#9aa8b8', { armor: 0.4, shield: 0.5, tough: 1 });
en5('dinito', '🦖', 'Dinosaurio', 260, 0.9, 18, '#5a9a4a', { rage: 1, armor: 0.2 });
en5('dragoncito', '🐉', 'Dragón joven', 200, 1.1, 16, '#3aa86a', { fly: 1, armor: 0.3 });
en5('golemito', '🗿', 'Golem de piedra', 300, 0.6, 20, '#8a8a8a', { armor: 0.55, tough: 1 });
en5('bisonte', '🦬', 'Bisonte', 300, 0.8, 20, '#5a3a2a', { charge: 1, armor: 0.25 });
en5('saurio', '🦕', 'Saurio cuellilargo', 520, 0.45, 26, '#7aa86a', { armor: 0.3, tough: 1 });
en5('mamut', '🦣', 'Mamut', 600, 0.5, 30, '#8a5a3a', { armor: 0.4, charge: 1, tough: 1 });
TD_EN5.forEach((k, i) => { const E = TD_EN[k]; E.lv ??= 300 + i * 14; E.w0 ??= 3 + (i % 4); E.wt ??= 2.4; });

/* jefes de los mundos nuevos */
const TD_POW_D = { tinta: 'su tinta apaga las torres de alrededor', hielo: 'congela las torres cercanas', fuego: 'quema una torre a la vez', corte: 'corta y aturde las 3 torres más cercanas', invoca: 'llama a su manada', escudo: 'se vuelve invencible por ratos', muro: 'pone burbujas a todas las plagas cercanas', cura: 'cura a todas las plagas', rayo: 'sus rayos paralizan torres', excava: 'se esconde bajo tierra', tele: 'se teletransporta hacia adelante', acelera: 'hace que todas las plagas corran', aullido: 'su aullido enfurece a todas las plagas', salto: 'da saltos enormes', clon: 'llama refuerzos de todas las plagas', bombas: 'tira bombas sobre tus torres', tiempo: 'detiene un momento a todas tus torres', apaga: 'un grito apaga las torres cercanas', sombra: 'se vuelve sombra y no recibe daño', todo: 'usa los poderes de todos los jefes' };
const TD_TODO = ['hielo', 'fuego', 'cura', 'invoca', 'apaga', 'escudo', 'acelera', 'tele', 'muro', 'bombas', 'corte', 'tiempo'];
[
  ['kraken', '🐙', 'Kraken abisal', 'tinta', '#c85a8a', {}],
  ['osopolar', '🐻‍❄️', 'Oso de la aurora', 'hielo', '#e8f4ff', { armor: 0.3 }],
  ['aguila', '🦅', 'Águila de fuego', 'fuego', '#c8702a', { fly: 1 }],
  ['mantis', '🦗', 'Mantis gigante', 'corte', '#7ac83a', {}],
  ['reinahorm', '🐜', 'Hormiga reina', 'invoca', '#a83a2a', { minion: 'hormiga' }],
  ['morsa', '🦭', 'Morsa colosal', 'escudo', '#8a9aa8', { armor: 0.4 }],
  ['tortumagma', '🐢', 'Tortuga de magma', 'muro', '#d8502a', { armor: 0.5 }],
  ['hidra', '🐲', 'Hidra del pantano', 'cura', '#4a9a3a', { split: 3, splitK: 'dinito' }],
  ['tronador', '🦬', 'Bisonte del trueno', 'rayo', '#5a4a3a', { charge: 1 }],
  ['topazo', '🦡', 'Tejón de las gemas', 'excava', '#7a6a9a', { armor: 0.3 }],
  ['bufon', '🃏', 'Bufón sombrío', 'tele', '#8a3ab8', {}],
  ['quetzal', '🐍', 'Serpiente emplumada', 'acelera', '#2aa86a', {}],
  ['leopardo', '🐆', 'Leopardo veloz', 'aullido', '#e8b84a', { sp: 0.62 }],
  ['lobolunar', '🐺', 'Lobo lunar', 'invoca', '#8a9ab8', { minion: 'lobo' }],
  ['cocodrilo', '🐊', 'Cocodrilo anciano', 'salto', '#4a7a3a', { armor: 0.45 }],
  ['robot', '🤖', 'Robot de cuerda', 'clon', '#9aa8b8', { armor: 0.35 }],
  ['zepelin', '🎈', 'Globo pirata', 'bombas', '#e83a4a', { fly: 1 }],
  ['ballena', '🐋', 'Ballena de hielo', 'muro', '#5a9ac8', { armor: 0.3 }],
  ['escarasol', '🪲', 'Escarabajo del sol', 'cura', '#e8a82a', { armor: 0.3 }],
  ['relojero', '⏰', 'Reloj encantado', 'tiempo', '#c8a050', {}],
  ['medusa', '🪼', 'Medusa estelar', 'apaga', '#e88ac8', { fly: 1 }],
  ['osogomita', '🧸', 'Oso de gomita', 'cura', '#ff8ab0', { split: 3, splitK: 'caramelo' }],
  ['pavoneon', '🦚', 'Pavo real de neón', 'muro', '#3ae8c8', {}],
  ['tiburonlava', '🦈', 'Tiburón de lava', 'fuego', '#ff6a2a', { charge: 1 }],
  ['espectro', '👻', 'Espectro del castillo', 'sombra', '#c8c8e0', { fly: 1 }],
  ['rex', '🦖', 'Rex de piedra', 'salto', '#6a8a4a', { armor: 0.4, rage: 1 }],
  ['devorador', '🌑', 'Devorador de estrellas', 'tele', '#5a4a98', { armor: 0.3 }],
  ['arbolmaldito', '🌳', 'Árbol maldito', 'todo', '#2a5a2a', { armor: 0.35 }],
].forEach(([k, em, n, pow, c, o], i) => {
  const W = TD_WORLDS.find((w) => w.boss === k);
  TD_EN[k] = { n, em, hp: 5600 + i * 420, sp: 0.45, rew: 520 + i * 20, r: 0.5, c, boss: 1, lives: 10 + Math.floor(i / 6), pow, ...o, d: `Jefe de ${W ? W.n : 'un mundo'}: ${TD_POW_D[pow]}.` };
});

/* torres nuevas: cada una usa el estilo de ataque de una torre base (beh) con efectos propios (fx) */
const TD_SPEC_A = (a, b) => [[a, 'Dispara a 3 enemigos a la vez'], [b, '+50 % alcance y golpes críticos']];
Object.assign(TD_TW, {
  cactus: { n: 'Cactus espinero', em: '🌵', beh: 'ardilla', d: 'Lanza púas muy rápido que frenan un poco.', cost: [60, 70, 130, 250], dmg: [6, 10, 17, 29], rng: [2.2, 2.5, 2.8, 3.1], rate: [0.4, 0.36, 0.32, 0.28], air: 1, c: '#4a9a4a', pc: '#9ad86a', un: 40, fx: { slow: 0.15 }, spec: TD_SPEC_A('Erizo de púas', 'Púa de acero') },
  girasol: { n: 'Girasol solar', em: '🌻', beh: 'rayo', d: 'Rayo de sol que quema y se carga sobre el mismo enemigo.', cost: [110, 130, 220, 400], dps: [11, 19, 32, 55], rng: [2.3, 2.5, 2.7, 2.9], air: 1, c: '#f0c020', un: 70, fx: { burn: 4 }, spec: [['Prisma solar', 'El rayo se divide en 3'], ['Mediodía', 'Se carga hasta ×7']] },
  rana: { n: 'Rana lengüetazo', em: '🐸', beh: 'ardilla', d: 'Su lengua empuja hacia atrás y a veces aturde.', cost: [80, 90, 160, 300], dmg: [16, 26, 42, 70], rng: [2.0, 2.2, 2.4, 2.6], rate: [1.0, 0.95, 0.9, 0.8], air: 1, c: '#4aa83a', pc: '#ff7a9a', un: 110, fx: { knock: 0.35, stun: 0.12 }, spec: TD_SPEC_A('Lengua múltiple', 'Lengua larga') },
  calabaza: { n: 'Calabaza bomba', em: '🎃', beh: 'tortuga', d: 'Explota en área y deja a las plagas ardiendo.', cost: [100, 110, 200, 360], dmg: [28, 48, 80, 140], rng: [2.8, 3.0, 3.3, 3.6], rate: [1.7, 1.6, 1.5, 1.35], area: [1.0, 1.1, 1.2, 1.35], air: 0, c: '#e8762a', pc: '#e8762a', un: 160, fx: { burn: 6 }, spec: [['Gran estallido', 'Explosión enorme'], ['Semillas de fuego', 'Lanza 3 calabazas']] },
  erizo: { n: 'Erizo de púas', em: '🦔', beh: 'pino', d: 'Lanza púas a todas las plagas que tiene cerca.', cost: [90, 100, 180, 320], dmg: [14, 22, 36, 58], frz: [0.25, 0.3, 0.35, 0.45], rng: [1.6, 1.7, 1.9, 2.1], rate: [1.6, 1.5, 1.35, 1.2], air: 1, c: '#a87a4a', un: 210, spec: [['Púas heladas', 'Además congela 2.5 s'], ['Espinas eternas', 'Frena siempre 40 %']] },
  colibri: { n: 'Colibrí veloz', em: '🐦', beh: 'abejas', d: 'Colibríes que persiguen; terribles contra voladores.', cost: [90, 100, 180, 330], dmg: [6, 10, 16, 26], nb: [2, 3, 3, 4], rng: [3.2, 3.4, 3.6, 3.9], rate: [1.4, 1.3, 1.2, 1.1], air: 2, c: '#3ad8a8', pc: '#3ad8a8', un: 260, fx: { fly: 1.5 }, spec: [['Bandada', '+3 colibríes por disparo'], ['Pico de acero', 'Atraviesan armaduras y pegan más']] },
  enredadera: { n: 'Enredadera', em: '🍃', beh: 'trampa', path: 1, d: 'Va SOBRE el camino y frena muchísimo a quien pase.', cost: [50, 60, 110, 200], dps: [8, 14, 22, 38], rng: [0.6, 0.6, 0.6, 0.6], air: 0, c: '#5aa83a', un: 300, fx: { slow: 0.45 }, spec: [['Raíces profundas', 'También frena 45 %'], ['Espinas', 'Daño al doble']] },
  cuarzo: { n: 'Cristal resonante', em: '💎', beh: 'buho', d: 'Rayo de cristal que salta entre plagas e ignora armaduras.', cost: [130, 140, 240, 430], dmg: [18, 30, 50, 84], ch: [2, 3, 4, 5], rng: [2.8, 3.0, 3.2, 3.5], rate: [1.25, 1.2, 1.1, 1.0], air: 1, c: '#8ad8f0', un: 320, fx: { pierce: 1 }, spec: [['Resonancia', 'Salta entre 9 enemigos'], ['Cristal puro', 'Daño ×1.8 y frena']] },
  lluvia: { n: 'Nube de lluvia', em: '🌧️', beh: 'hongo', d: 'Lluvia que frena muchísimo a todos en un área.', cost: [80, 90, 160, 290], dot: [3, 6, 10, 17], slow: [0.45, 0.5, 0.55, 0.65], rng: [2.2, 2.4, 2.6, 2.8], rate: [1.2, 1.1, 1.0, 0.9], area: [1.0, 1.15, 1.3, 1.45], air: 1, c: '#7ab0e0', un: 360, spec: [['Tormenta', 'Daño al doble'], ['Diluvio', 'Frena 70 %']] },
  volcan: { n: 'Volcancito', em: '🌋', beh: 'tortuga', d: 'Lanza rocas de lava enormes que queman.', cost: [140, 150, 260, 460], dmg: [55, 90, 150, 250], rng: [2.6, 2.8, 3.1, 3.4], rate: [2.4, 2.3, 2.1, 1.9], area: [1.1, 1.25, 1.4, 1.6], air: 0, c: '#d8502a', pc: '#ff5a1f', un: 400, fx: { burn: 12 }, spec: [['Erupción', 'Explosión enorme'], ['Lluvia de lava', 'Lanza 3 rocas']] },
  pulpo: { n: 'Pulpo tintero', em: '🐙', beh: 'hongo', d: 'Tinta venenosa que frena y envenena en área.', cost: [100, 110, 200, 350], dot: [6, 10, 17, 28], slow: [0.4, 0.45, 0.5, 0.6], rng: [2.0, 2.2, 2.4, 2.6], rate: [1.3, 1.2, 1.1, 1.0], area: [1.0, 1.1, 1.25, 1.4], air: 1, c: '#c85a8a', un: 440, spec: [['Tinta tóxica', 'Veneno al doble'], ['Tinta espesa', 'Frena 70 %']] },
  dragonito: { n: 'Dragoncito', em: '🐲', beh: 'rayo', d: 'Aliento de fuego que quema y se intensifica.', cost: [150, 160, 280, 480], dps: [16, 27, 45, 76], rng: [2.4, 2.6, 2.8, 3.0], air: 1, c: '#3aa86a', un: 480, fx: { burn: 10 }, spec: [['Tres cabezas', 'El fuego se divide en 3'], ['Aliento eterno', 'Se carga hasta ×7']] },
  tiburon: { n: 'Tiburón cazador', em: '🦈', beh: 'ardilla', d: 'Mordidas brutales: remata a plagas débiles y pega más a jefes.', cost: [140, 150, 260, 460], dmg: [45, 75, 125, 210], rng: [2.4, 2.6, 2.8, 3.1], rate: [1.6, 1.5, 1.4, 1.25], air: 0, c: '#5a7a9a', pc: '#cfe6ff', un: 520, fx: { exe: 0.15, boss: 1.3 }, spec: TD_SPEC_A('Frenesí', 'Mandíbula') },
  hada: { n: 'Hada luminosa', em: '🧚', beh: 'arbol', support: 1, d: 'Las torres cercanas pegan mucho más y te da semillas cada oleada.', cost: [140, 160, 260, 440], buff: [0.2, 0.28, 0.38, 0.5], seeds: [8, 13, 20, 30], rng: [1.8, 1.8, 2.0, 2.2], air: 0, c: '#f0a8e8', un: 560, spec: [['Bendición', '+60 % de daño cerca'], ['Polvo de hada', 'Muchas más semillas']] },
  reloj: { n: 'Reloj del tiempo', em: '⏳', beh: 'pino', d: 'Detiene el tiempo de todas las plagas cercanas.', cost: [130, 140, 240, 420], dmg: [8, 14, 22, 36], frz: [1.2, 1.5, 1.9, 2.4], rng: [1.7, 1.9, 2.1, 2.3], rate: [3.4, 3.2, 3.0, 2.7], air: 1, c: '#c8a050', un: 600, spec: [['Pausa total', 'Congela 2.5 s'], ['Cámara lenta', 'Frena siempre 40 %']] },
  iman: { n: 'Imán dorado', em: '🧲', beh: 'ardilla', d: 'Cada plaga que vence te da 2 semillas extra.', cost: [100, 110, 190, 340], dmg: [10, 16, 26, 42], rng: [2.4, 2.6, 2.8, 3.0], rate: [0.7, 0.65, 0.6, 0.55], air: 1, c: '#e04a4a', pc: '#ffd23c', un: 640, fx: { cash: 2 }, spec: TD_SPEC_A('Atracción', 'Gran imán') },
  mago: { n: 'Mago del roble', em: '🧙', beh: 'buho', d: 'Hechizos en cadena que además frenan.', cost: [160, 170, 290, 500], dmg: [22, 36, 60, 100], ch: [3, 4, 5, 6], rng: [3.0, 3.2, 3.4, 3.7], rate: [1.2, 1.1, 1.0, 0.95], air: 1, c: '#6a5ad0', un: 680, fx: { slow: 0.3 }, spec: [['Tormenta arcana', 'Salta entre 9 enemigos'], ['Archimago', 'Daño ×1.8 y frena']] },
  ballesta: { n: 'Ballesta real', em: '🏹', beh: 'ardilla', d: 'Alcance enorme: atraviesa armaduras y destroza jefes.', cost: [170, 180, 300, 520], dmg: [70, 115, 190, 320], rng: [3.6, 3.9, 4.2, 4.6], rate: [2.0, 1.9, 1.75, 1.6], air: 1, c: '#8a6a3a', pc: '#e8e8e8', un: 720, fx: { pierce: 1, boss: 1.5 }, spec: TD_SPEC_A('Doble virote', 'Ojo real') },
  carnivora: { n: 'Planta carnívora', em: '🪴', beh: 'trampa', path: 1, d: 'Va SOBRE el camino y se come a las plagas débiles.', cost: [90, 100, 180, 320], dps: [24, 40, 66, 110], rng: [0.6, 0.6, 0.6, 0.6], air: 0, c: '#c83a5a', un: 760, fx: { exe: 0.2 }, spec: [['Mandíbulas', 'También frena 45 %'], ['Hambre voraz', 'Daño al doble']] },
  cometat: { n: 'Torre cometa', em: '☄️', beh: 'tortuga', d: 'Cometas que explotan en área y sí alcanzan a los voladores.', cost: [180, 190, 320, 560], dmg: [60, 100, 170, 290], rng: [3.2, 3.4, 3.7, 4.0], rate: [2.2, 2.1, 1.95, 1.8], area: [1.2, 1.35, 1.5, 1.7], air: 1, c: '#7ad0ff', pc: '#bfe8ff', un: 820, spec: [['Supernova', 'Explosión enorme'], ['Lluvia de cometas', 'Lanza 3 cometas']] },
  fenix: { n: 'Fénix eterno', em: '🔥', beh: 'buho', d: 'Llamas en cadena que dejan a todos ardiendo.', cost: [200, 210, 360, 620], dmg: [34, 56, 92, 155], ch: [3, 4, 5, 6], rng: [3.0, 3.2, 3.5, 3.8], rate: [1.1, 1.05, 1.0, 0.9], air: 1, c: '#ff6a2a', un: 880, fx: { burn: 16 }, spec: [['Renacer', 'Salta entre 9 enemigos'], ['Sol de fuego', 'Daño ×1.8 y frena']] },
  arcoiris: { n: 'Arcoíris', em: '🌈', beh: 'rayo', d: 'Un rayo de todos los colores: ignora armaduras y castiga a los voladores.', cost: [220, 240, 400, 680], dps: [26, 44, 72, 120], rng: [2.6, 2.8, 3.0, 3.3], air: 1, c: '#ff7ab8', un: 940, fx: { pierce: 1, fly: 1.5 }, spec: [['Prisma total', 'El rayo se divide en 3'], ['Luz pura', 'Se carga hasta ×7']] },
});
/* ---------- v6 · 70 torres nuevas y 4 formas nuevas de atacar ----------
   aura: daña sin parar a todo lo que está cerca · mina: siembra minas en el camino · linea: atraviesa a todos en línea
   global: golpea en cualquier parte del mapa. Además el efecto «marca» (las plagas marcadas reciben +25 % de daño). */
const TD_SPEC_D = {
  ardilla: ['Dispara a 3 enemigos a la vez', '+50 % alcance y golpes críticos'], tortuga: ['Explosión enorme', 'Lanza 3 proyectiles'], hongo: ['Veneno al doble', 'Frena 70 %'],
  abejas: ['+3 por disparo', 'Atraviesan armaduras y pegan más'], rayo: ['El rayo se divide en 3', 'Se carga hasta ×7'], buho: ['Salta entre 9 enemigos', 'Daño ×1.8 y frena'],
  pino: ['Congela 2.5 s', 'Frena siempre 40 %'], trampa: ['También frena 45 %', 'Daño al doble'], arbol: ['+60 % de daño cerca', 'Muchas más semillas'],
  aura: ['Además frena 30 %', 'Daño ×1.6'], linea: ['Ignora armaduras', 'Línea más ancha y daño ×1.5'], global: ['Golpea a 3 plagas', 'Daño ×1.8'], mina: ['Explosión enorme', 'El doble de minas'],
};
const TD_CAT = { ardilla: 'disparo', linea: 'disparo', global: 'disparo', tortuga: 'explosivo', mina: 'explosivo', hongo: 'control', pino: 'control', aura: 'control', abejas: 'magia', buho: 'magia', rayo: 'magia', arbol: 'apoyo', trampa: 'camino' };
const TD_CATS = [['all', 'Todas'], ['disparo', '🎯 Disparo'], ['explosivo', '💥 Explosivas'], ['control', '❄️ Control'], ['magia', '✨ Mágicas'], ['apoyo', '🌳 Apoyo']];
const tdCat = (k) => TD_CAT[TD_TW[k].beh || k] || 'disparo';
const tdHexRgb = (h) => { const n = parseInt(String(h).slice(1), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
[
  ['manzano', '🍎', 'Manzano tirador', 'ardilla', 'Lanza manzanas rapidísimo. Barato y confiable.', '#d8443a', { c: 55, p: 7, r: 2.3, rt: 0.5 }, null, ['Cosecha triple', 'Manzana dorada']],
  ['sandia', '🍉', 'Sandía explosiva', 'tortuga', 'Explota en pedazos que frenan a las plagas.', '#3a9a4a', { c: 95, p: 26, r: 2.8, rt: 1.6, a: 1.0 }, { slow: 0.2 }, ['Sandía gigante', 'Lluvia de sandías']],
  ['cebolla', '🧅', 'Cebolla llorona', 'hongo', 'Hace llorar a todas: veneno muy fuerte en área.', '#c89ad8', { c: 85, p: 9, r: 2.1, rt: 1.25, a: 1.0, slow: 0.25 }, null, ['Capa tras capa', 'Lágrimas espesas']],
  ['mariquitas', '🐞', 'Nido de catarinas', 'abejas', 'Catarinas que persiguen y marcan a las plagas.', '#e8323a', { c: 90, p: 6, r: 3.1, rt: 1.5, nb: 2 }, { mark: 1 }, ['Plaga de catarinas', 'Catarina de acero']],
  ['sol', '☀️', 'Sol ardiente', 'aura', 'Quema sin parar a todo lo que pasa cerca.', '#f0b020', { c: 110, p: 9, r: 1.6 }, { burn: 3 }, ['Sol de verano', 'Supernova']],
  ['castana', '🌰', 'Castañero', 'ardilla', 'Castañas duras que a veces aturden.', '#8a5a2a', { c: 75, p: 13, r: 2.4, rt: 0.85 }, { stun: 0.1 }, ['Castañas en racimo', 'Castaña de hierro']],
  ['unicornio', '🦄', 'Unicornio lancero', 'linea', 'Su cuerno lanza un rayo que atraviesa a todas las plagas en fila.', '#e88ae8', { c: 120, p: 20, r: 3.2, rt: 1.3 }, null, ['Cuerno de diamante', 'Arcoíris lancero']],
  ['tambor', '🥁', 'Tambor de guerra', 'pino', 'Cada golpe empuja hacia atrás a todos los cercanos.', '#c8603a', { c: 100, p: 12, r: 1.7, rt: 1.5, f: 0.15 }, { knock: 0.3 }, ['Redoble helado', 'Ritmo eterno']],
  ['satelite', '🛰️', 'Satélite', 'global', 'Desde el espacio golpea a la plaga más avanzada, esté donde esté.', '#7a8ab8', { c: 140, p: 34, r: 9, rt: 2.4 }, null, ['Constelación', 'Rayo orbital']],
  ['abrojo', '🌾', 'Trigal espinoso', 'trampa', 'Va SOBRE el camino: espigas que pinchan a quien pase.', '#d8b84a', { c: 55, p: 12, r: 0.6 }, null, ['Espigas pegajosas', 'Espigas de acero']],
  ['pina', '🍍', 'Piña granada', 'tortuga', 'Estalla y deja a las plagas ardiendo.', '#e8b830', { c: 105, p: 30, r: 2.9, rt: 1.7, a: 1.05 }, { burn: 5 }, ['Piña colosal', 'Piñas en racimo']],
  ['hamster', '🐹', 'Hámster minero', 'mina', 'Esconde minas en el camino que explotan al pisarlas.', '#d8a870', { c: 100, p: 40, r: 2.4, rt: 2.2, a: 0.9 }, null, ['Gran mina', 'Túneles por todos lados']],
  ['lupa', '🔍', 'Lupa solar', 'rayo', 'Concentra el sol en un punto: quema y se intensifica.', '#9ad0f0', { c: 115, p: 12, r: 2.4 }, { burn: 5 }, ['Lupa triple', 'Rayo de mediodía']],
  ['serpe', '🐍', 'Serpiente eléctrica', 'buho', 'Descargas que saltan de plaga en plaga.', '#3ab86a', { c: 115, p: 15, r: 2.8, rt: 1.2, ch: 3 }, null, ['Gran descarga', 'Veneno eléctrico']],
  ['ajo', '🧄', 'Ajo apestoso', 'hongo', 'Un olor tan fuerte que las plagas casi no avanzan.', '#e8e0c8', { c: 80, p: 4, r: 2.0, rt: 1.2, a: 1.1, slow: 0.45 }, null, ['Ajo podrido', 'Nube espesa']],
  ['mono', '🐒', 'Mono malabarista', 'ardilla', 'Lanza plátanos a toda velocidad y marca a las plagas.', '#a8703a', { c: 95, p: 10, r: 2.5, rt: 0.6 }, { mark: 1 }, ['Malabares', 'Plátano certero']],
  ['rosa', '🌹', 'Rosa espinosa', 'aura', 'Sus espinas lastiman a todas las plagas alrededor.', '#d83a5a', { c: 105, p: 13, r: 1.4 }, null, ['Espinas que atrapan', 'Rosa de sangre']],
  ['globo', '🎈', 'Globo de agua', 'tortuga', 'Explota en el aire: moja y frena también a los voladores.', '#ff6a8a', { c: 100, p: 22, r: 3.0, rt: 1.5, a: 1.1, air: 1 }, { slow: 0.35 }, ['Globo gigante', 'Tres globos']],
  ['mariposas', '🦋', 'Jardín de mariposas', 'abejas', 'Mariposas que vuelan hacia las plagas y las frenan.', '#5ab0f0', { c: 100, p: 7, r: 3.3, rt: 1.4, nb: 3 }, { slow: 0.2 }, ['Gran migración', 'Alas de cristal']],
  ['halcon', '🦅', 'Halcón vigía', 'global', 'Vuela por todo el mapa y caza a la plaga más fuerte.', '#a8703a', { c: 150, p: 38, r: 9, rt: 2.2 }, { boss: 1.2 }, ['Bandada de halcones', 'Picada mortal']],
  ['hielo', '❄️', 'Placa de hielo', 'trampa', 'Va SOBRE el camino: las plagas resbalan y van muy lento.', '#9ad8f0', { c: 70, p: 10, r: 0.6 }, { slow: 0.5 }, ['Hielo eterno', 'Hielo cortante']],
  ['coco', '🥥', 'Palmera cocotera', 'ardilla', 'Cocos pesados que empujan a las plagas hacia atrás.', '#6a4a2a', { c: 110, p: 30, r: 2.4, rt: 1.4 }, { knock: 0.4 }, ['Lluvia de cocos', 'Coco de piedra']],
  ['tormenta', '⛈️', 'Nube de tormenta', 'buho', 'Relámpagos en cadena que a veces aturden.', '#6a7a9a', { c: 130, p: 18, r: 3.0, rt: 1.25, ch: 3 }, { stun: 0.08 }, ['Tormenta eléctrica', 'Trueno sabio']],
  ['cohete', '🚀', 'Cohete de hojas', 'tortuga', 'Cohetes de largo alcance con explosión grande. Alcanza voladores.', '#c8c8d8', { c: 150, p: 45, r: 3.6, rt: 2.3, a: 1.3, air: 1 }, null, ['Cohete atómico', 'Lanzacohetes']],
  ['tesla', '🔋', 'Bobina de energía', 'buho', 'Electricidad que ignora cualquier armadura.', '#5ae8a0', { c: 135, p: 17, r: 2.7, rt: 1.15, ch: 4 }, { pierce: 1 }, ['Supercarga', 'Arco voltaico']],
  ['espada', '🗡️', 'Espada del bosque', 'linea', 'Un tajo que corta a todas las plagas en línea y remata a las débiles.', '#c8d0d8', { c: 135, p: 24, r: 2.8, rt: 1.25 }, { exe: 0.12 }, ['Filo sagrado', 'Doble tajo']],
  ['niebla', '🌫️', 'Niebla densa', 'hongo', 'Cubre un área enorme y frena muchísimo.', '#b8c0c8', { c: 95, p: 3, r: 2.4, rt: 1.0, a: 1.45, slow: 0.5 }, null, ['Niebla tóxica', 'Niebla de piedra']],
  ['iglu', '🧊', 'Cubo de hielo', 'pino', 'Congela por mucho tiempo a todas las plagas cercanas.', '#bfe8ff', { c: 115, p: 6, r: 1.8, rt: 3.2, f: 1.4 }, null, ['Edad de hielo', 'Frío eterno']],
  ['lechuza', '🦉', 'Lechuza nocturna', 'ardilla', 'Ve muy lejos y pega más a los jefes.', '#8a6a4a', { c: 125, p: 28, r: 3.4, rt: 1.3 }, { boss: 1.25 }, ['Ojos de la noche', 'Garra certera']],
  ['petardo', '🧨', 'Petardo de semillas', 'mina', 'Petardos escondidos que estallan y queman.', '#e83a2a', { c: 115, p: 46, r: 2.4, rt: 2.4, a: 1.0 }, { burn: 6 }, ['Gran petardo', 'Fiesta de petardos']],
  ['faro', '🗼', 'Faro del puerto', 'rayo', 'Un haz de luz de largo alcance que se carga sin parar.', '#f0e8a0', { c: 140, p: 14, r: 3.4 }, null, ['Haz triple', 'Luz eterna']],
  ['miel', '🍯', 'Tarro de miel', 'arbol', 'Te da muchísimas semillas cada oleada y ayuda un poco a las torres cercanas.', '#e8a82a', { c: 120, b: 0.08, s: 18, r: 1.6 }, null, ['Miel real', 'Panal infinito']],
  ['cangrejot', '🦀', 'Cangrejo pinza', 'ardilla', 'Pinzazos que rematan a las plagas débiles.', '#e0503a', { c: 120, p: 22, r: 2.2, rt: 0.95 }, { exe: 0.1 }, ['Tenazas múltiples', 'Pinza de acero']],
  ['incienso', '🕯️', 'Vela embrujada', 'aura', 'Su llama marca a las plagas cercanas: reciben más daño de todo.', '#f0d070', { c: 120, p: 6, r: 1.8 }, { mark: 1 }, ['Llama fría', 'Fuego fatuo']],
  ['chile', '🌶️', 'Chile picante', 'hongo', 'Nube que pica muchísimo: veneno muy fuerte.', '#e8302a', { c: 115, p: 14, r: 2.0, rt: 1.3, a: 0.95, slow: 0.2 }, { burn: 4 }, ['Chile fantasma', 'Salsa espesa']],
  ['luna', '🌕', 'Luna llena', 'rayo', 'Rayo plateado terrible contra voladores.', '#e8e8f0', { c: 135, p: 15, r: 2.7 }, { fly: 1.5 }, ['Fases de luna', 'Eclipse']],
  ['bandera', '🚩', 'Bandera del bosque', 'arbol', 'Las torres cercanas pegan muchísimo más fuerte.', '#e83a3a', { c: 150, b: 0.28, s: 4, r: 1.8 }, null, ['¡A la carga!', 'Botín de guerra']],
  ['cuerno', '📯', 'Cuerno del bosque', 'pino', 'Un sonido tan fuerte que aturde a las plagas.', '#d8b060', { c: 120, p: 16, r: 1.8, rt: 1.8, f: 0.3 }, { stun: 0.2 }, ['Eco helado', 'Sinfonía']],
  ['cardumen', '🐟', 'Cardumen', 'abejas', 'Peces voladores que empujan a las plagas.', '#5a9ad8', { c: 115, p: 9, r: 3.2, rt: 1.4, nb: 3 }, { knock: 0.15 }, ['Gran cardumen', 'Pez espada']],
  ['zorrot', '🦊', 'Zorro saetero', 'ardilla', 'Cada plaga que vence te da 1 semilla extra.', '#e07a2a', { c: 115, p: 15, r: 2.6, rt: 0.75 }, { cash: 1 }, ['Zorro astuto', 'Flecha de fuego']],
  ['tridente', '🔱', 'Tridente del mar', 'linea', 'Lanza un chorro de agua que atraviesa y frena.', '#3a8ac8', { c: 145, p: 22, r: 3.0, rt: 1.3 }, { slow: 0.3 }, ['Marea alta', 'Tsunami']],
  ['telescopio', '🔭', 'Telescopio mágico', 'global', 'Encuentra a los jefes desde lejos y les pega fuerte.', '#6a5ad0', { c: 160, p: 40, r: 9, rt: 2.4 }, { boss: 1.5 }, ['Lente múltiple', 'Estrella fugaz']],
  ['bomba', '💣', 'Bombita de semillas', 'tortuga', 'Explosiones que empujan a todas hacia atrás.', '#3a3a4a', { c: 130, p: 36, r: 2.8, rt: 1.8, a: 1.15 }, { knock: 0.35 }, ['Megabomba', 'Bombas de racimo']],
  ['farol', '🏮', 'Farol de luciérnagas', 'abejas', 'Luciérnagas de fuego que persiguen y queman.', '#e84a3a', { c: 125, p: 8, r: 3.2, rt: 1.45, nb: 3 }, { burn: 3 }, ['Festival de luces', 'Luciérnaga dorada']],
  ['campana', '🔔', 'Campana resonante', 'buho', 'Su eco salta entre plagas y a veces las aturde.', '#e8c040', { c: 140, p: 20, r: 3.0, rt: 1.2, ch: 4 }, { stun: 0.1 }, ['Campanario', 'Campana sabia']],
  ['tela', '🕸️', 'Tela de araña', 'trampa', 'Va SOBRE el camino: las plagas quedan casi pegadas.', '#d8d8e0', { c: 85, p: 14, r: 0.6 }, { slow: 0.6 }, ['Red gigante', 'Hilo de acero']],
  ['antena', '📡', 'Antena de radio', 'rayo', 'Una onda que confunde: a veces aturde y marca.', '#9aa8b8', { c: 145, p: 16, r: 2.8 }, { mark: 1, stun: 0.003 }, ['Señal triple', 'Onda total']],
  ['geiser', '⛲', 'Géiser', 'pino', 'Brota agua hirviendo que quema a todos los cercanos.', '#5ab0e0', { c: 130, p: 18, r: 1.8, rt: 1.6, f: 0.2 }, { burn: 6 }, ['Géiser helado', 'Vapor eterno']],
  ['estrella', '⭐', 'Estrella fugaz', 'ardilla', 'Disparos de estrella que ignoran armaduras.', '#ffd23c', { c: 135, p: 20, r: 2.7, rt: 0.8 }, { pierce: 1 }, ['Lluvia de estrellas', 'Estrella polar']],
  ['termales', '♨️', 'Aguas termales', 'trampa', 'Va SOBRE el camino: agua hirviendo que quema.', '#e87a5a', { c: 100, p: 18, r: 0.6 }, { burn: 8 }, ['Lodo caliente', 'Vapor ardiente']],
  ['ojo', '🧿', 'Ojo protector', 'aura', 'Las plagas cercanas se paralizan de miedo por ratos.', '#3a6ae8', { c: 140, p: 10, r: 1.7 }, { stun: 0.004 }, ['Mirada helada', 'Ojo furioso']],
  ['catapulta', '🪨', 'Catapulta de rocas', 'tortuga', 'Rocas enormes, muy buenas contra jefes.', '#8a8a8a', { c: 150, p: 55, r: 3.2, rt: 2.4, a: 1.1 }, { boss: 1.3 }, ['Roca gigante', 'Tres rocas']],
  ['cacahuate', '🥜', 'Cacahuate explosivo', 'mina', 'Muchas minas pequeñas por todo el camino.', '#c89a5a', { c: 120, p: 30, r: 2.8, rt: 1.4, a: 0.85 }, null, ['Cacahuate gigante', 'Bolsa entera']],
  ['ojomagico', '👁️', 'Ojo mágico', 'rayo', 'Mirada que atraviesa armaduras y castiga a los jefes.', '#a86ae8', { c: 160, p: 18, r: 2.8 }, { pierce: 1, boss: 1.3 }, ['Tercer ojo', 'Mirada eterna']],
  ['campamento', '🏕️', 'Campamento', 'arbol', 'Más fuerza a las torres cercanas y semillas cada oleada.', '#3a8a4a', { c: 155, b: 0.18, s: 12, r: 1.8 }, null, ['Fogata', 'Gran despensa']],
  ['arpa', '🎻', 'Violín encantado', 'buho', 'Melodías que saltan entre plagas y las frenan.', '#a85a3a', { c: 150, p: 22, r: 3.1, rt: 1.15, ch: 4 }, { slow: 0.25 }, ['Orquesta', 'Nota perfecta']],
  ['remolino', '🌀', 'Remolino', 'pino', 'Un torbellino que avienta a las plagas hacia atrás.', '#7ab8e8', { c: 145, p: 20, r: 1.9, rt: 1.7, f: 0.15 }, { knock: 0.5 }, ['Ciclón helado', 'Huracán']],
  ['trompeta', '🎺', 'Trompeta sónica', 'linea', 'Una onda de sonido que atraviesa y aturde.', '#e8c040', { c: 160, p: 26, r: 3.0, rt: 1.3 }, { stun: 0.12 }, ['Fanfarria', 'Gran orquesta']],
  ['nubeal', '🌨️', 'Aura de escarcha', 'aura', 'Un frío constante que frena a todas las plagas cercanas.', '#bfe3ff', { c: 135, p: 7, r: 1.9 }, { slow: 0.35 }, ['Ventisca', 'Frío cortante']],
  ['murcielagot', '🦇', 'Murciélago sónico', 'ardilla', 'Chillidos que destrozan a los voladores.', '#5a4a7a', { c: 130, p: 18, r: 2.8, rt: 0.7 }, { fly: 1.8 }, ['Eco múltiple', 'Chillido agudo']],
  ['rayoaz', '🌩️', 'Nube relámpago', 'global', 'Rayos que caen en cualquier parte del mapa y aturden.', '#ffe066', { c: 165, p: 36, r: 9, rt: 2.0 }, { stun: 0.15 }, ['Tormenta total', 'Rayo divino']],
  ['muneco', '☃️', 'Muñeco de nieve', 'tortuga', 'Bolas de nieve en área que congelan un poco.', '#e8f4ff', { c: 140, p: 32, r: 3.0, rt: 1.7, a: 1.2 }, { slow: 0.4, stun: 0.06 }, ['Alud', 'Bolas gemelas']],
  ['drones', '🛸', 'Platillo con drones', 'abejas', 'Drones que atraviesan armaduras.', '#9aa8c8', { c: 150, p: 11, r: 3.5, rt: 1.35, nb: 3 }, { pierce: 1 }, ['Flota', 'Láser de drones']],
  ['varita', '🪄', 'Varita mágica', 'buho', 'Cada plaga que vence te regala semillas.', '#c88ae8', { c: 160, p: 22, r: 3.0, rt: 1.15, ch: 4 }, { cash: 1 }, ['Hechizo múltiple', 'Varita de oro']],
  ['corona', '👑', 'Corona del rey', 'arbol', 'La mejor ayuda: las torres de alrededor pegan muchísimo más.', '#ffd23c', { c: 220, b: 0.35, s: 10, r: 2.0 }, null, ['Reino unido', 'Tesoro real']],
  ['ninja', '🥷', 'Ninja del bosque', 'ardilla', 'Shurikens velocísimos que rematan a las débiles.', '#3a3a4a', { c: 165, p: 22, r: 2.7, rt: 0.55 }, { exe: 0.12 }, ['Lluvia de shurikens', 'Golpe secreto']],
  ['dinamita', '🎆', 'Fuegos artificiales', 'mina', 'Minas de colores que estallan en grande y queman.', '#e84ab8', { c: 160, p: 70, r: 2.6, rt: 2.6, a: 1.2 }, { burn: 8 }, ['Gran final', 'Festival']],
  ['espiral', '🧬', 'Espiral de vida', 'aura', 'Una energía que daña muchísimo a todo lo cercano.', '#5ae8c8', { c: 180, p: 22, r: 1.6 }, null, ['Vida eterna', 'Doble hélice']],
  ['portal', '🌌', 'Portal estelar', 'linea', 'Abre una línea de estrellas que atraviesa todo, también voladores.', '#6a4ad8', { c: 190, p: 34, r: 3.4, rt: 1.4, air: 1 }, { fly: 1.3 }, ['Agujero blanco', 'Galaxia']],
  ['rayoverde', '🌿', 'Hoja cortante', 'abejas', 'Hojas filosas que persiguen y rematan.', '#3aa84a', { c: 170, p: 13, r: 3.4, rt: 1.3, nb: 4 }, { exe: 0.08 }, ['Tormenta de hojas', 'Hoja de acero']],
].forEach(([k, em, n, beh, d, c, B, fx, sp], i) => {
  const pf = 1 + i * 0.013, cf = 1 + i * 0.006; const r2 = (v) => Math.round(v * 10) / 10;
  const cost = [B.c, B.c * 1.1, B.c * 1.95, B.c * 3.5].map((v) => Math.round(v * cf / 5) * 5);
  const dm = [1, 1.65, 2.75, 4.6].map((m) => Math.round((B.p || 0) * m * pf));
  const rng = [B.r, B.r + 0.2, B.r + 0.45, B.r + 0.75].map(r2);
  const rate = [1, 0.94, 0.87, 0.78].map((m) => r2(Math.max(0.2, (B.rt || 1) * m)));
  const area = [1, 1.1, 1.22, 1.38].map((m) => r2((B.a || 1) * m));
  const T = { n, em, beh, d, c, cost, rng, air: B.air ?? (beh === 'tortuga' || beh === 'trampa' || beh === 'mina' ? 0 : 1), un: 15 + i * 14, spec: [[sp[0], TD_SPEC_D[beh][0]], [sp[1], TD_SPEC_D[beh][1]]], rgb: tdHexRgb(c) };
  if (fx) T.fx = fx;
  if (beh === 'rayo' || beh === 'trampa' || beh === 'aura') T.dps = dm; else if (beh === 'hongo') { T.dot = dm; T.slow = [0, 0.05, 0.1, 0.2].map((x) => r2(Math.min(0.8, (B.slow || 0.3) + x))); } else if (beh !== 'arbol') T.dmg = dm;
  if (beh === 'ardilla' || beh === 'tortuga' || beh === 'abejas' || beh === 'buho' || beh === 'pino' || beh === 'hongo' || beh === 'linea' || beh === 'global' || beh === 'mina') T.rate = rate;
  if (beh === 'tortuga' || beh === 'hongo' || beh === 'mina') T.area = area;
  if (beh === 'abejas') T.nb = [B.nb, B.nb + 1, B.nb + 1, B.nb + 2];
  if (beh === 'buho') T.ch = [B.ch, B.ch + 1, B.ch + 2, B.ch + 3];
  if (beh === 'pino') T.frz = [1, 1.2, 1.45, 1.8].map((m) => r2(B.f * m));
  if (beh === 'arbol') { T.support = 1; T.buff = [1, 1.4, 1.9, 2.5].map((m) => r2(B.b * m * 100) / 100); T.seeds = [1, 1.6, 2.4, 3.6].map((m) => Math.round(B.s * m)); }
  if (beh === 'trampa') { T.path = 1; T.rng = [0.6, 0.6, 0.6, 0.6]; }
  if (beh === 'ardilla' || beh === 'tortuga' || beh === 'abejas') T.pc = c;
  TD_TW[k] = T;
});
{ const a = TD_ACH.find((x) => x.id === 'tw'); if (a) a.d = `Desbloquea las ${Object.keys(TD_TW).length} torres`; }
const tdFxTxt = (X) => { if (!X) return ''; const L = [X.burn && '🔥 quema', X.slow && `🐌 frena ${Math.round(X.slow * 100)} %`, X.stun && '💫 a veces aturde', X.knock && '↩️ empuja hacia atrás', X.exe && `💀 remata bajo ${Math.round(X.exe * 100)} %`, X.boss && `👑 ×${X.boss} a jefes`, X.fly && `🦅 ×${X.fly} a voladores`, X.pierce && '🛡️ ignora armaduras', X.cash && `🧲 +${X.cash} 🌰 por plaga`, X.mark && '🎯 marca: +25 % de daño de todo'].filter(Boolean); return L.length ? `<span class="td-fx">${L.join(' · ')}</span>` : ''; };

/* más tipos de oleada, bendiciones, poderes, aspectos y logros */
TD_THEMES.push(
  { id: 'bichos', n: 'Plaga de bichos', k: ['mosca', 'cucaracha', 'grillo', 'arana', 'alacran'], nm: 1.2, hm: 0.85, gm: 0.75 },
  { id: 'fauna', n: 'Fauna salvaje', k: ['lobo', 'zorro', 'jabali', 'tejon', 'bandido'], nm: 0.8, hm: 1.15, gm: 1 },
  { id: 'marea', n: 'Marea viva', k: ['cangrejito', 'langosta', 'camaron', 'pulpito', 'pezglobo', 'tiburoncito'], nm: 0.9, hm: 1.05, gm: 0.9 },
  { id: 'dinos', n: 'Era de los dinosaurios', k: ['dinito', 'saurio', 'dragoncito', 'caiman'], nm: 0.55, hm: 1.4, gm: 1.3 },
  { id: 'espectral', n: 'Noche espectral', k: ['fantasmita', 'calamar', 'medusita', 'vampiro'], nm: 0.9, hm: 1, gm: 0.9 },
  { id: 'muralla', n: 'Muralla viviente', k: ['caracolgig', 'perezoso', 'golemito', 'mamut', 'robotito', 'tejon'], nm: 0.5, hm: 1.5, gm: 1.4 },
  { id: 'saltos', n: 'Saltarines', k: ['grillo', 'sapito', 'ardillaloca', 'zorro', 'cabra', 'alien'], nm: 0.95, hm: 0.95, gm: 0.8 },
  { id: 'curan', n: 'Curanderos', k: ['mariposa', 'pavo', 'cucaracha', 'castor', 'nutria', 'zorrillo'], nm: 0.85, hm: 1.1, gm: 1 },
  { id: 'estampida', n: 'Estampida', k: ['raton', 'camaron', 'caramelo', 'dodo', 'flamenco', 'mosca'], nm: 1.6, hm: 0.6, gm: 0.45 },
);
TD_PERKS.push(
  { id: 'fur', e: '🔥', n: 'Furia', d: '+25 % de daño, pero las torres cuestan 5 % más', f: (p) => { p.dmg += 0.25; p.bar -= 0.05; } },
  { id: 'tor', e: '🌀', n: 'Torbellino', d: 'Las torres disparan 18 % más rápido', f: (p) => { p.rate += 0.18; } },
  { id: 'gig', e: '🌳', n: 'Raíz gigante', d: '+6 vidas', f: (p, s, l) => { s.lives = Math.min(l + 12, s.lives + 6); } },
  { id: 'gem', e: '💎', n: 'Mina de gemas', d: '+250 semillas ahora mismo', f: (p, s) => { s.seeds += 250; } },
  { id: 'inv', e: '🧊', n: 'Invierno', d: 'Todas las plagas van 14 % más lentas', f: (p) => { p.esc += 0.14; } },
  { id: 'lup', e: '🔍', n: 'Lupa', d: '+15 % de alcance en todas las torres', f: (p) => { p.rng += 0.15; } },
);
Object.assign(TD_POWERS, {
  veneno: { e: '🍄', n: 'Esporas tóxicas', d: 'Envenena a todas las plagas del mapa.', cost: 180, cd: 45 },
  tornado: { e: '🌪️', n: 'Tornado', d: 'Empuja hacia atrás a todas las plagas (no a los jefes).', cost: 200, cd: 50 },
  vida: { e: '💚', n: 'Savia curativa', d: 'Recuperas 3 vidas.', cost: 220, cd: 90 },
  oro: { e: '✨', n: 'Lluvia dorada', d: 'Durante 12 s cada plaga da el triple de semillas.', cost: 240, cd: 60 },
});
const tdPwEq = () => { const d = tdData(); const own = Object.keys(TD_POWERS).filter((k) => d.pw[k]); return (Array.isArray(d.pwEq) ? d.pwEq.filter((k) => d.pw[k]) : own).slice(0, 3); };
Object.assign(TD_SKINS, {
  menta: { n: 'Menta fresca', cost: 150, c: ['#3ac8a0', '#8af0d0', '#5a4232'], f: '#ffffff' },
  lavanda: { n: 'Lavanda', cost: 180, c: ['#9a7ad8', '#c8b0f0', '#5a4232'], f: '#ffe066' },
  noche: { n: 'Árbol nocturno', cost: 240, c: ['#2a3a6a', '#4a5a9a', '#3a2a22'], f: '#ffe066' },
  fuego: { n: 'Árbol de fuego', cost: 300, c: ['#e83a2a', '#ff9a3a', '#4a2a1a'], f: '#ffe066' },
  coral: { n: 'Árbol coral', cost: 320, c: ['#ff7a8a', '#ffb0a0', '#6a4a3a'], f: '#7ad0ff' },
  esmeralda: { n: 'Esmeralda', cost: 400, c: ['#0a8a5a', '#3ae8a0', '#3a3a3a'], f: '#ffffff' },
  galaxia: { n: 'Árbol galaxia', cost: 500, c: ['#3a2a8a', '#c88ae8', '#2a1a4a'], f: '#ffffff' },
  solar: { n: 'Árbol solar', cost: 650, c: ['#ffb000', '#fff08a', '#a8601a'], f: '#ff5a1f' },
});
{ const pw = TD_ACH.find((a) => a.id === 'pw'); if (pw) { pw.d = 'Ten los 3 primeros poderes de la tienda'; pw.t = (d) => ['trueno', 'helada', 'cosecha'].every((k) => d.pw[k]); } }
TD_ACH.push(
  { id: 'w500', n: 'Medio millar', d: 'Supera 500 niveles', g: 300, t: () => tdLvlsWon() >= 500 },
  { id: 'w750', n: 'Explorador incansable', d: 'Supera 750 niveles', g: 450, t: () => tdLvlsWon() >= 750 },
  { id: 'w1000', n: 'El bosque eterno', d: 'Supera los 1,000 niveles', g: 1000, t: () => tdLvlsWon() >= 1000 },
  { id: 's3x150', n: 'Constelación', d: '3 estrellas en 150 niveles', g: 160, t: (d) => Object.values(d.st).filter((v) => v >= 3).length >= 150 },
  { id: 's3x400', n: 'Galaxia de estrellas', d: '3 estrellas en 400 niveles', g: 400, t: (d) => Object.values(d.st).filter((v) => v >= 3).length >= 400 },
  { id: 'k100k', n: 'Escudo del bosque', d: 'Vence 100,000 plagas', g: 250, t: (d) => d.kills >= 100000 },
  { id: 'k250k', n: 'Leyenda viviente', d: 'Vence 250,000 plagas', g: 500, t: (d) => d.kills >= 250000 },
  { id: 'b20', n: 'Domador de jefes', d: 'Vence a 20 jefes distintos', g: 200, t: (d) => Object.keys(d.bossK).length >= 20 },
  { id: 'b40', n: 'Señor de los 40', d: 'Vence a los 40 jefes', g: 600, t: (d) => Object.keys(d.bossK).length >= 40 },
  { id: 'i100', n: 'Infinito y más allá', d: 'Aguanta 100 oleadas en el modo infinito', g: 300, t: (d) => d.inf >= 100 },
  { id: 'd30', n: 'Un mes de retos', d: 'Gana 30 retos del día', g: 200, t: (d) => d.dayStars >= 30 },
  { id: 'tw', n: 'Arsenal completo', d: 'Desbloquea las 31 torres', g: 300, t: () => Object.keys(TD_TW).every((k) => tdTowerOpen(k)) },
  { id: 'pw7', n: 'Maestro de poderes', d: 'Ten los 7 poderes de la tienda', g: 250, t: (d) => Object.keys(TD_POWERS).every((k) => d.pw[k]) },
  { id: 'sk8', n: 'Diseñador de bosques', d: 'Ten 8 aspectos del Gran Árbol', g: 150, t: (d) => Object.keys(d.skins).length >= 8 },
);

/* dibujos de las torres y plagas nuevas (emoji sobre su base, en caché) */
const TD_EMF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Twemoji Mozilla",sans-serif';
function tdEm(g, em, sz, x, y) { g.font = `${sz}px ${TD_EMF}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(em, x, y); }
function tdDrawEmTower(g, k, lvl, t, spec) {
  const K = TD_TW[k];
  g.fillStyle = K.c; g.globalAlpha = 0.92; g.beginPath(); g.ellipse(0, -3, 12 + lvl, 11 + lvl, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  g.lineWidth = 2.5; g.strokeStyle = spec ? (spec === 1 ? 'rgba(255,140,210,.9)' : 'rgba(140,210,255,.9)') : lvl >= 2 ? 'rgba(255,215,90,.9)' : 'rgba(255,255,255,.55)'; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-5, -10, 5, 2.6, -0.4, 0, 7); g.fill();
  tdEm(g, K.em, 18 + lvl * 1.5, 0, -4 + Math.sin(t * 6) * 0.9);
  if (spec) tdEm(g, spec === 1 ? '✨' : '💠', 9, 12, -16);
}
function tdDrawEmTrap(g, k, lvl, spec) {
  const K = TD_TW[k];
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 6, 16, 6, 0, 0, 7); g.fill();
  g.fillStyle = K.c; for (let i = 0; i < 8; i++) { const a = i * 0.785; g.beginPath(); g.ellipse(Math.cos(a) * 9, 2 + Math.sin(a) * 4.5, 6, 3.2, a, 0, 7); g.fill(); }
  tdEm(g, K.em, 15 + lvl * 1.4, 0, 0);
  if (spec) tdEm(g, spec === 1 ? '✨' : '💠', 8, 11, -9);
  for (let i = 0; i <= lvl; i++) { g.fillStyle = spec ? '#ff8fcf' : '#ffd23c'; g.beginPath(); g.arc(-(lvl * 4) / 2 + i * 4, 13, 1.8, 0, 7); g.fill(); }
}
function tdDrawEmEnemy(g, E, e, t, wob) {
  if (E.fly) g.translate(0, -9 + Math.sin(t * 3 + (e.id || 0)) * 2);
  if (E.ghost) g.globalAlpha = 0.7;
  if (E.boss) { g.strokeStyle = 'rgba(255,215,90,.9)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.stroke(); }
  g.fillStyle = E.c; g.globalAlpha *= 0.55; g.beginPath(); g.ellipse(0, 1, 10, 8.5, 0, 0, 7); g.fill(); g.globalAlpha = E.ghost ? 0.7 : 1;
  tdEm(g, E.em, E.boss ? 19 : 16, 0, wob * 0.25 - 1);
  if (E.boss) tdEm(g, '👑', 8, 0, -13);
  g.globalAlpha = 1;
}

/* ---------- dibujos (se guardan en caché como imágenes) ---------- */
function tdDrawTower(g, k, lvl, x, y, T, t = 0, aim = 0, spec = 0) {
  const s = T / 40; g.save(); g.translate(x, y); g.scale(s, s);
  const C = TD_TW[k].c;
  if (TD_TW[k].em && TD_TW[k].path) { tdDrawEmTrap(g, k, lvl, spec); g.restore(); return; }
  if (k === 'trampa') {
    g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 6, 16, 6, 0, 0, 7); g.fill();
    g.fillStyle = spec === 2 ? '#6a6f78' : '#4a7a2a'; for (let i = 0; i < 7; i++) { const a = i * 0.9; g.beginPath(); g.ellipse(Math.cos(a) * 8, 2 + Math.sin(a) * 4, 6, 3.5, a, 0, 7); g.fill(); }
    g.fillStyle = spec === 2 ? '#c9d2dc' : '#c8e88a'; for (let i = 0; i < 10; i++) { const a = i * 0.63, r = 7 + (i % 2) * 5; g.beginPath(); g.moveTo(Math.cos(a) * r, Math.sin(a) * r * 0.5); g.lineTo(Math.cos(a) * (r + 4), Math.sin(a) * (r + 4) * 0.5 - 4); g.lineTo(Math.cos(a + 0.2) * r, Math.sin(a + 0.2) * r * 0.5); g.fill(); }
    if (spec === 1) { g.fillStyle = '#d0405a'; g.beginPath(); g.arc(-4, -2, 2.5, 0, 7); g.arc(5, 0, 2.2, 0, 7); g.fill(); }
    g.restore(); return;
  }
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 12, 15, 5, 0, 0, 7); g.fill();
  g.fillStyle = ['#b8a88a', '#c9c2b0', '#d8c47a', spec ? (spec === 1 ? '#f0a8c8' : '#a8d8f0') : '#e8d27a'][lvl]; g.beginPath(); g.ellipse(0, 9, 15, 7, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-4, 7, 7, 2.5, 0, 0, 7); g.fill();
  if (k === 'ardilla') {
    g.fillStyle = '#a85a2a'; g.beginPath(); g.ellipse(9, -2, 6, 11, 0.5, 0, 7); g.fill();
    g.fillStyle = C; g.beginPath(); g.ellipse(0, 0, 8, 9, 0, 0, 7); g.fill(); g.beginPath(); g.arc(0, -10, 6.5, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-5, -14); g.lineTo(-4, -19); g.lineTo(-1, -15); g.fill(); g.beginPath(); g.moveTo(5, -14); g.lineTo(4, -19); g.lineTo(1, -15); g.fill();
    g.fillStyle = '#f2d6b0'; g.beginPath(); g.ellipse(0, 1, 4.5, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-2.3, -11, 1.3, 0, 7); g.arc(2.3, -11, 1.3, 0, 7); g.fill();
    if (lvl >= 2) { g.fillStyle = spec === 2 ? '#2a4a2a' : '#c92a2a'; g.fillRect(-6, -16, 12, 2.5); }
    g.save(); g.translate(0, -3); g.rotate(aim); g.strokeStyle = '#6b3a1a'; g.lineWidth = 2; g.beginPath(); g.arc(7, 0, 7, -1.1, 1.1); g.stroke(); g.strokeStyle = '#eee'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(9.5, -6.2); g.lineTo(9.5, 6.2); g.stroke(); g.restore();
  } else if (k === 'tortuga') {
    g.fillStyle = '#7ab868'; g.beginPath(); g.arc(-12, 2, 4.5, 0, 7); g.fill();
    g.fillStyle = C; g.beginPath(); g.ellipse(0, 0, 13, 10, 0, Math.PI, 0); g.fill(); g.fillRect(-13, -1, 26, 5);
    g.strokeStyle = '#2f6a3a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-6, -8); g.lineTo(-3, 0); g.moveTo(6, -8); g.lineTo(3, 0); g.moveTo(-10, -2); g.lineTo(10, -2); g.stroke();
    const nb = spec === 2 ? 3 : 1; for (let i = 0; i < nb; i++) { g.save(); g.translate(0, -6); g.rotate(aim + (i - (nb - 1) / 2) * 0.35); g.fillStyle = '#4a4a52'; g.fillRect(0, -3, spec === 1 ? 16 : 14, spec === 1 ? 7 : 6); g.fillStyle = '#2a2a30'; g.fillRect(12, -3.5, 3, 7); g.restore(); }
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-13, 1, 1, 0, 7); g.fill();
  } else if (k === 'hongo') {
    g.fillStyle = '#f2e8d8'; g.fillRect(-4, -4, 8, 13);
    g.fillStyle = spec === 2 ? '#8a6a3a' : C; g.beginPath(); g.ellipse(0, -6, 14, 10, 0, Math.PI, 0); g.fill(); g.fillRect(-14, -6, 28, 3);
    g.fillStyle = spec === 1 ? '#b8ff6a' : '#fff'; for (const [a, b, r] of [[-7, -10, 2.6], [3, -13, 2.2], [8, -8, 1.8], [-2, -7, 1.5]]) { g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); }
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-1.8, 1, 1, 0, 7); g.arc(1.8, 1, 1, 0, 7); g.fill();
  } else if (k === 'abejas') {
    g.fillStyle = spec === 2 ? '#e88a30' : C; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(0, 4 - i * 6, 11 - i * 2, 4, 0, 0, 7); g.fill(); }
    g.strokeStyle = '#a87a10'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(0, 4 - i * 6, 11 - i * 2, 4, 0, 0, 7); g.stroke(); }
    g.fillStyle = '#3a2a10'; g.beginPath(); g.arc(0, 2, 2.6, 0, 7); g.fill();
    for (let i = 0; i < (spec === 1 ? 4 : 2); i++) { const a = i * 1.7; const bx = Math.cos(a) * 12, by = -10 + Math.sin(a * 1.3) * 4; g.fillStyle = '#ffd23c'; g.beginPath(); g.ellipse(bx, by, 2.2, 1.6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(bx, by - 1.8, 1.4, 1, 0, 0, 7); g.fill(); }
  } else if (k === 'rayo') {
    g.fillStyle = '#4a4a5a'; g.fillRect(-2, -6, 4, 14);
    g.fillStyle = spec === 2 ? 'rgba(255,220,90,.35)' : 'rgba(120,240,255,.3)'; g.beginPath(); g.arc(0, -10, 12, 0, 7); g.fill();
    g.fillStyle = '#3a3a48'; g.beginPath(); g.ellipse(0, -9, 6, 7, 0, 0, 7); g.fill();
    g.fillStyle = spec === 2 ? '#ffd23c' : spec === 1 ? '#c8a0ff' : C; g.beginPath(); g.ellipse(0, -4, 5, 5, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-5, -13, 4, 2, -0.5, 0, 7); g.ellipse(5, -13, 4, 2, 0.5, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(-2, -11, 1.4, 0, 7); g.arc(2, -11, 1.4, 0, 7); g.fill();
  } else if (k === 'arbol') {
    g.fillStyle = '#7a5232'; g.fillRect(-3, -6, 6, 15);
    g.fillStyle = spec === 2 ? '#c8a830' : spec === 1 ? '#2a7a3a' : C; for (const [a, b, r] of [[0, -14, 10], [-8, -9, 7], [8, -9, 7], [0, -6, 7]]) { g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(-3, -17, 4, 0, 7); g.fill();
    g.fillStyle = spec === 2 ? '#e05a2a' : '#ffd23c'; for (let i = 0; i < 3; i++) { const a = i * 2.1; g.beginPath(); g.arc(Math.cos(a) * 9, -10 + Math.sin(a) * 7, 1.8, 0, 7); g.fill(); }
  } else if (k === 'buho') {
    g.fillStyle = '#6b4a2a'; g.fillRect(-10, 4, 20, 3);
    g.fillStyle = spec === 2 ? '#c8a050' : C; g.beginPath(); g.ellipse(0, -4, 9, 11, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-8, -12); g.lineTo(-6, -19); g.lineTo(-2, -13); g.fill(); g.beginPath(); g.moveTo(8, -12); g.lineTo(6, -19); g.lineTo(2, -13); g.fill();
    g.fillStyle = '#f2e8d8'; g.beginPath(); g.ellipse(0, 0, 5.5, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#ffe066'; g.beginPath(); g.arc(-3.5, -9, 3.4, 0, 7); g.arc(3.5, -9, 3.4, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-3.5, -9, 1.6, 0, 7); g.arc(3.5, -9, 1.6, 0, 7); g.fill();
    g.fillStyle = '#e8a030'; g.beginPath(); g.moveTo(-1.5, -6); g.lineTo(1.5, -6); g.lineTo(0, -3); g.fill();
    g.fillStyle = spec === 1 ? '#ffe066' : '#5a3aa0'; g.beginPath(); g.moveTo(-6, -16); g.lineTo(0, -28); g.lineTo(6, -16); g.fill();
  } else if (k === 'pino') {
    g.fillStyle = '#6b4a2a'; g.fillRect(-2, 2, 4, 8);
    for (let i = 0; i < 3; i++) { g.fillStyle = spec === 2 ? '#7ab8e0' : C; g.beginPath(); g.moveTo(0, -24 + i * 7); g.lineTo(-11 + i * 1.5, -6 + i * 6); g.lineTo(11 - i * 1.5, -6 + i * 6); g.fill(); g.fillStyle = '#f4fbff'; g.beginPath(); g.moveTo(0, -24 + i * 7); g.lineTo(-5, -15 + i * 7); g.lineTo(5, -15 + i * 7); g.fill(); }
    g.fillStyle = spec === 1 ? '#bff4ff' : '#e8f8ff'; g.beginPath(); for (let i = 0; i < 12; i++) { const r = i % 2 ? 2 : 5, a = i * Math.PI / 6; g.lineTo(Math.cos(a) * r, -26 + Math.sin(a) * r); } g.fill();
  }
  if (TD_TW[k].em) tdDrawEmTower(g, k, lvl, t, spec);
  for (let i = 0; i <= lvl; i++) { g.fillStyle = spec ? '#ff8fcf' : '#ffd23c'; g.strokeStyle = '#8a6a00'; g.lineWidth = 0.8; g.beginPath(); const px = -(lvl * 4) / 2 + i * 4; g.arc(px, 15, 1.8, 0, 7); g.fill(); g.stroke(); }
  g.restore();
}
function tdDrawEnemy(g, e, x, y, T, t) {
  const E = TD_EN[e.k], s = T / 40 * (E.boss ? 1.9 : 1.25); g.save(); g.translate(x, y); g.scale(s, s);
  const wob = Math.sin(t * 12 + (e.id || 0)) * 1.5, f2 = Math.sin(t * 20 + (e.id || 0)) * 0.5 + 0.5;
  if (!E.fly) { g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 8, 9, 3, 0, 0, 7); g.fill(); }
  g.scale(e.dir || 1, 1);
  const k = e.k;
  if (E.em) { tdDrawEmEnemy(g, E, e, t, wob); g.restore(); return; }
  if (k === 'escarabajo' || k === 'escudo' || k === 'rino') {
    g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, k === 'rino' ? 11 : 9, k === 'rino' ? 8 : 7, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-1, -7); g.lineTo(-1, 7); g.stroke();
    g.fillStyle = '#1a2a1a'; g.beginPath(); g.arc(k === 'rino' ? 10 : 8, 0, 4, 0, 7); g.fill(); g.strokeStyle = '#1a2a1a'; g.lineWidth = 1.4; for (const k2 of [-4, 0, 4]) { g.beginPath(); g.moveTo(k2, 6); g.lineTo(k2 + wob, 9); g.stroke(); }
    if (k === 'rino') { g.fillStyle = '#e8d8b0'; g.beginPath(); g.moveTo(12, -2); g.lineTo(20, -8); g.lineTo(13, 2); g.fill(); }
    g.fillStyle = '#fff'; g.beginPath(); g.arc(k === 'rino' ? 11.5 : 9.5, -1.5, 1.2, 0, 7); g.fill();
  } else if (k === 'hormiga') { g.fillStyle = E.c; g.beginPath(); g.arc(-6, 0, 4.5, 0, 7); g.arc(0, 0, 3, 0, 7); g.arc(6, -1, 4, 0, 7); g.fill(); g.strokeStyle = E.c; g.lineWidth = 1.2; for (const k2 of [-3, 0, 3]) { g.beginPath(); g.moveTo(k2, 2); g.lineTo(k2 + wob, 7); g.stroke(); } g.beginPath(); g.moveTo(8, -4); g.lineTo(11, -8); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(7.5, -2, 1, 0, 7); g.fill(); }
  else if (k === 'caracol') { g.fillStyle = '#d8c0a0'; g.beginPath(); g.ellipse(2, 4, 11, 4, 0, 0, 7); g.fill(); g.fillStyle = E.c; g.beginPath(); g.arc(-1, -2, 8, 0, 7); g.fill(); g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.5; g.beginPath(); for (let a = 0; a < 10; a += 0.3) g.lineTo(-1 + Math.cos(a) * a * 0.7, -2 + Math.sin(a) * a * 0.7); g.stroke(); g.strokeStyle = '#d8c0a0'; g.beginPath(); g.moveTo(10, 2); g.lineTo(12, -4); g.moveTo(8, 2); g.lineTo(9, -4); g.stroke(); }
  else if (k === 'polilla' || k === 'fantasma') { g.translate(0, -10 + Math.sin(t * 3 + (e.id || 0)) * 2); g.fillStyle = E.c; g.beginPath(); g.ellipse(-3, -4, 7, 4 + f2 * 3, -0.6, 0, 7); g.ellipse(-3, 4, 7, 4 + f2 * 3, 0.6, 0, 7); g.fill(); g.fillStyle = k === 'fantasma' ? '#b8c8e8' : '#6a4a7a'; g.beginPath(); g.ellipse(1, 0, 6, 2.5, 0, 0, 7); g.fill(); g.fillStyle = k === 'fantasma' ? '#5a7ad0' : '#fff'; g.beginPath(); g.arc(-4, -4, 1.6, 0, 7); g.arc(-4, 4, 1.6, 0, 7); g.fill(); }
  else if (k === 'cuervo') { g.translate(0, -9); g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 9, 5, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-2, -2); g.quadraticCurveTo(-4, -12 * f2 - 2, 6, -2); g.fill(); g.beginPath(); g.moveTo(-8, 0); g.lineTo(-13, -3); g.lineTo(-13, 3); g.fill(); g.fillStyle = '#e8a030'; g.beginPath(); g.moveTo(8, -1); g.lineTo(13, 0); g.lineTo(8, 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(5, -2, 1.2, 0, 7); g.fill(); }
  else if (k === 'topo') { g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 10, 7.5, 0, 0, 7); g.fill(); g.fillStyle = '#ff9ab0'; g.beginPath(); g.arc(10, -1, 2.4, 0, 7); g.fill(); g.fillStyle = '#e8c0a0'; g.fillRect(-6, 5, 4, 3); g.fillRect(2, 5, 4, 3); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(6, -3, 1, 0, 7); g.fill(); }
  else if (k === 'sanadora') { g.translate(0, -6); g.fillStyle = 'rgba(255,250,150,.35)'; g.beginPath(); g.arc(-4, 0, 9 + f2 * 2, 0, 7); g.fill(); g.fillStyle = '#4a4a2a'; g.beginPath(); g.ellipse(2, 0, 6, 4, 0, 0, 7); g.fill(); g.fillStyle = E.c; g.beginPath(); g.ellipse(-4, 0, 5, 4, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(1, -4, 4, 2, -0.4, 0, 7); g.fill(); g.fillStyle = '#e03131'; g.fillRect(-6, -1, 4, 1.4); g.fillRect(-4.7, -2.3, 1.4, 4); }
  else if (k === 'gusano' || k === 'gusito') { g.fillStyle = E.c; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-7 + i * 4.6, Math.sin(t * 8 + i + (e.id || 0)) * 1.4, 3.6, 0, 7); g.fill(); } g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(8, -1, 1, 0, 7); g.fill(); }
  else if (k === 'taladora') { g.fillStyle = '#5a5f68'; g.beginPath(); g.roundRect(-12, -9, 22, 16, 4); g.fill(); g.fillStyle = E.c; g.beginPath(); g.roundRect(-12, -9, 22, 6, 3); g.fill(); g.fillStyle = '#ffd23c'; g.fillRect(-12, -2, 22, 2); g.fillStyle = '#c9d2dc'; g.beginPath(); g.moveTo(10, -6); g.lineTo(20, 0); g.lineTo(10, 6); g.closePath(); g.fill(); g.strokeStyle = '#7a828c'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { const yy = ((t * 20 + i * 4) % 12) - 6; g.beginPath(); g.moveTo(11, yy); g.lineTo(18, yy * 0.4); g.stroke(); } g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(-7, 8, 3.5, 0, 7); g.arc(4, 8, 3.5, 0, 7); g.fill(); g.fillStyle = '#ff4040'; g.beginPath(); g.arc(4, -5, 1.6, 0, 7); g.fill(); }
  else if (k === 'sapo') { g.fillStyle = '#3a7a2a'; g.beginPath(); g.ellipse(-4, 6, 6, 3, 0, 0, 7); g.ellipse(6, 6, 6, 3, 0, 0, 7); g.fill(); g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 13, 9, 0, 0, 7); g.fill(); g.fillStyle = '#c8e8a0'; g.beginPath(); g.ellipse(3, 3, 8, 5, 0, 0, 7); g.fill(); g.fillStyle = E.c; g.beginPath(); g.arc(3, -8, 4, 0, 7); g.arc(10, -6, 4, 0, 7); g.fill(); g.fillStyle = '#ffe066'; g.beginPath(); g.arc(3, -9, 2.4, 0, 7); g.arc(10, -7, 2.4, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.fillRect(2.5, -10, 1.2, 2.6); g.fillRect(9.5, -8, 1.2, 2.6); g.fillStyle = '#ffd23c'; g.beginPath(); g.moveTo(-6, -8); g.lineTo(-4, -14); g.lineTo(-2, -9); g.lineTo(0, -14); g.lineTo(2, -9); g.fill(); }
  else if (k === 'golem') { g.fillStyle = '#7ab8d8'; g.beginPath(); g.roundRect(-10, -12, 20, 20, 3); g.fill(); g.fillStyle = E.c; g.beginPath(); g.roundRect(-8, -18, 14, 9, 2); g.fill(); g.fillRect(-15, -8, 6, 12); g.fillRect(9, -8, 6, 12); g.fillStyle = '#e8f8ff'; g.fillRect(-7, -10, 4, 5); g.fillRect(2, -4, 5, 4); g.fillStyle = '#1a6aa8'; g.beginPath(); g.arc(-2, -14, 1.6, 0, 7); g.arc(3, -14, 1.6, 0, 7); g.fill(); g.fillStyle = '#5a8ab0'; g.fillRect(-8, 8, 6, 4); g.fillRect(2, 8, 6, 4); }
  else if (k === 'dragon') { g.translate(0, -8); g.fillStyle = '#a83a1a'; g.beginPath(); g.moveTo(-4, -2); g.quadraticCurveTo(-10, -18 * f2 - 4, 6, -3); g.fill(); g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 12, 6, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-10, 0); g.lineTo(-20, -4); g.lineTo(-18, 3); g.fill(); g.beginPath(); g.ellipse(12, -3, 6, 4, -0.3, 0, 7); g.fill(); g.fillStyle = '#ffd23c'; g.beginPath(); g.arc(14, -4, 1.4, 0, 7); g.fill(); g.fillStyle = '#ffb703'; g.beginPath(); g.moveTo(17, -2); g.lineTo(22 + f2 * 3, 0); g.lineTo(17, 1); g.fill(); g.fillStyle = '#ffe066'; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-6 + i * 5, -5); g.lineTo(-4 + i * 5, -9); g.lineTo(-2 + i * 5, -5); g.fill(); } }
  else if (k === 'reina') { g.translate(0, -10); g.fillStyle = E.c; g.beginPath(); g.ellipse(-4, -6, 11, 6 + f2 * 4, -0.6, 0, 7); g.ellipse(-4, 6, 11, 6 + f2 * 4, 0.6, 0, 7); g.fill(); g.fillStyle = '#f0c8ff'; g.beginPath(); g.arc(-6, -6, 3, 0, 7); g.arc(-6, 6, 3, 0, 7); g.fill(); g.fillStyle = '#5a2a7a'; g.beginPath(); g.ellipse(2, 0, 9, 3.5, 0, 0, 7); g.fill(); g.fillStyle = '#ffd23c'; g.beginPath(); g.moveTo(6, -4); g.lineTo(7, -9); g.lineTo(9, -5); g.lineTo(11, -9); g.lineTo(12, -4); g.fill(); }
  else if (k === 'tormenta') { g.translate(0, -12); g.fillStyle = E.c; g.beginPath(); g.arc(-7, 0, 7, 0, 7); g.arc(0, -4, 8, 0, 7); g.arc(8, 0, 7, 0, 7); g.arc(0, 3, 7, 0, 7); g.fill(); g.fillStyle = '#ffe066'; g.beginPath(); g.arc(-3, -2, 1.8, 0, 7); g.arc(4, -2, 1.8, 0, 7); g.fill(); g.strokeStyle = '#ffe066'; g.lineWidth = 1.5; if (f2 > 0.6) { g.beginPath(); g.moveTo(0, 8); g.lineTo(-3, 13); g.lineTo(1, 13); g.lineTo(-2, 19); g.stroke(); } }
  else if (k === 'avispa') { g.translate(0, -9); g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-1, -5, 5, 2.5 + f2 * 2, -0.4, 0, 7); g.fill(); g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 6, 3.6, 0, 0, 7); g.fill(); g.fillStyle = '#2a1a05'; g.fillRect(-2, -3.5, 1.6, 7); g.fillRect(1.5, -3.2, 1.6, 6.4); g.beginPath(); g.moveTo(-6, 0); g.lineTo(-10, 1); g.lineTo(-6, 1.6); g.fill(); g.beginPath(); g.arc(5.5, -0.5, 2.2, 0, 7); g.fill(); g.fillStyle = '#ff3a3a'; g.beginPath(); g.arc(6.4, -1, 0.8, 0, 7); g.fill(); }
  else if (k === 'ladron') { g.fillStyle = 'rgba(0,0,0,.0)'; g.fillStyle = '#4a4a54'; g.beginPath(); g.ellipse(-8, 1, 6, 2.6, 0.2 + wob * 0.05, 0, 7); g.fill(); g.fillStyle = '#c8c8d2'; for (let i = 0; i < 3; i++) g.fillRect(-12 + i * 3.4, -1 + i * 0.2, 1.6, 4); g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 9, 6.5, 0, 0, 7); g.fill(); g.beginPath(); g.arc(8, -2, 5, 0, 7); g.fill(); g.fillStyle = '#2a2a30'; g.fillRect(5, -4.5, 7, 3.2); g.fillStyle = '#fff'; g.beginPath(); g.arc(8.5, -3, 0.9, 0, 7); g.fill(); g.fillStyle = '#2a2a30'; g.beginPath(); g.moveTo(5, -6); g.lineTo(6, -9.5); g.lineTo(8.5, -6.5); g.fill(); g.fillStyle = '#d8a02c'; g.beginPath(); g.arc(-1, 3, 3.2, 0, 7); g.fill(); g.fillStyle = '#ffe066'; g.fillRect(-1.5, 1.6, 1.2, 2.8); g.strokeStyle = '#2a2a30'; g.lineWidth = 1.4; for (const k2 of [-3, 2]) { g.beginPath(); g.moveTo(k2, 5); g.lineTo(k2 + wob, 9); g.stroke(); } }
  else if (k === 'ciempies') { g.strokeStyle = '#5a2a10'; g.lineWidth = 1.2; for (let i = 0; i < 6; i++) { const X = -12 + i * 4.6, Y = Math.sin(t * 7 + i + (e.id || 0)) * 1.6; g.beginPath(); g.moveTo(X, Y + 2); g.lineTo(X + wob * 0.4, Y + 8); g.moveTo(X, Y - 2); g.lineTo(X - wob * 0.4, Y - 8); g.stroke(); } for (let i = 0; i < 6; i++) { const X = -12 + i * 4.6, Y = Math.sin(t * 7 + i + (e.id || 0)) * 1.6; g.fillStyle = i % 2 ? '#a84a1a' : E.c; g.beginPath(); g.arc(X, Y, 4.2, 0, 7); g.fill(); } g.fillStyle = '#e8c070'; g.beginPath(); g.arc(13, 0, 4.6, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(14.5, -1.6, 1, 0, 7); g.fill(); g.strokeStyle = '#6a2a0a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(16, -3); g.lineTo(21, -7); g.moveTo(16, 1); g.lineTo(21, 4); g.stroke(); }
  else if (k === 'escorpion') { g.fillStyle = '#a8701a'; for (const sy of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(-4 + i * 5, sy * 8, 2, 5, sy * 0.6, 0, 7); g.fill(); } g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 11, 7, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-12 - i * 3.4, -2 - i * 3 - (i > 2 ? 2 : 0), 3.4 - i * 0.4, 0, 7); g.fill(); } g.fillStyle = '#5a2a0a'; g.beginPath(); g.moveTo(-22, -14); g.lineTo(-17, -16); g.lineTo(-19, -10); g.fill(); g.fillStyle = E.c; g.beginPath(); g.ellipse(14, -5, 5, 3, -0.4, 0, 7); g.ellipse(14, 5, 5, 3, 0.4, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(8, -2, 1.3, 0, 7); g.arc(8, 2, 1.3, 0, 7); g.fill(); }
  else if (k === 'cangrejo') { g.strokeStyle = '#a8302a'; g.lineWidth = 2; for (const sy of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-6 + i * 5, sy * 6); g.lineTo(-9 + i * 5 + wob, sy * 12); g.stroke(); } g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 13, 9, 0, 0, 7); g.fill(); g.fillStyle = '#ff8a6a'; g.beginPath(); g.ellipse(-2, -2, 7, 4, 0, 0, 7); g.fill(); g.fillStyle = E.c; g.beginPath(); g.arc(15, -9, 5, 0, 7); g.arc(15, 9, 5, 0, 7); g.fill(); g.fillStyle = '#fff4e8'; g.beginPath(); g.moveTo(17, -9); g.lineTo(21, -11); g.lineTo(19, -7); g.fill(); g.beginPath(); g.moveTo(17, 9); g.lineTo(21, 11); g.lineTo(19, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(8, -3, 2.2, 0, 7); g.arc(8, 3, 2.2, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(8.6, -3, 1, 0, 7); g.arc(8.6, 3, 1, 0, 7); g.fill(); }
  else if (k === 'serpiente') { g.lineCap = 'round'; g.strokeStyle = '#1a6a3a'; g.lineWidth = 10; g.beginPath(); for (let i = 0; i <= 8; i++) { const X = -20 + i * 4, Y = Math.sin(t * 6 + i * 0.9) * 4; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); } g.stroke(); g.strokeStyle = E.c; g.lineWidth = 7; g.stroke(); g.fillStyle = '#ffe066'; for (let i = 1; i < 8; i += 2) { g.beginPath(); g.arc(-20 + i * 4, Math.sin(t * 6 + i * 0.9) * 4, 1.4, 0, 7); g.fill(); } g.fillStyle = E.c; g.beginPath(); g.ellipse(15, Math.sin(t * 6 + 9 * 0.9) * 2, 7, 5.5, 0, 0, 7); g.fill(); g.fillStyle = '#ffe066'; g.beginPath(); g.arc(17, -2, 1.6, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.fillRect(16.6, -3, 0.8, 2); g.strokeStyle = '#e8324a'; g.lineWidth = 1; g.lineCap = 'butt'; g.beginPath(); g.moveTo(22, 0); g.lineTo(26, 0); g.moveTo(26, 0); g.lineTo(28, -2); g.moveTo(26, 0); g.lineTo(28, 2); g.stroke(); }
  else if (k === 'espantapajaros') { g.translate(0, -6); g.fillStyle = '#7a5232'; g.fillRect(-1.5, -6, 3, 22); g.fillRect(-14, -2, 28, 3); g.fillStyle = '#5a7a3a'; g.beginPath(); g.moveTo(-9, -3); g.lineTo(9, -3); g.lineTo(11, 12); g.lineTo(-11, 12); g.fill(); g.fillStyle = '#c84a3a'; g.fillRect(-4, 2, 3, 3); g.fillRect(3, 6, 3, 3); g.fillStyle = '#f0c870'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 14, -2); g.lineTo(sx * 18, -5 + wob); g.lineTo(sx * 18, 1); g.fill(); } g.fillStyle = '#f0d8a0'; g.beginPath(); g.arc(0, -11, 7, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.fillRect(-4, -13, 2.4, 2.4); g.fillRect(1.6, -13, 2.4, 2.4); g.strokeStyle = '#1a1a1a'; g.lineWidth = 1; g.beginPath(); g.moveTo(-3, -8); g.lineTo(3, -8); g.stroke(); g.fillStyle = '#6a4a2a'; g.beginPath(); g.ellipse(0, -17, 12, 2.5, 0, 0, 7); g.fill(); g.fillRect(-6, -24, 12, 7); }
  else if (k === 'murcielago') { g.translate(0, -12); g.fillStyle = '#3a2a5a'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(0, -2); g.quadraticCurveTo(sx * 10, -14 * f2 - 4, sx * 22, -4); g.lineTo(sx * 17, 2); g.lineTo(sx * 13, -1); g.lineTo(sx * 9, 4); g.closePath(); g.fill(); } g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 7, 8, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-5, -6); g.lineTo(-4, -12); g.lineTo(-1, -7); g.moveTo(5, -6); g.lineTo(4, -12); g.lineTo(1, -7); g.fill(); g.fillStyle = '#ff4a6a'; g.beginPath(); g.arc(-2.6, -2, 1.6, 0, 7); g.arc(2.6, -2, 1.6, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(-2, 2, 1.2, 2); g.fillRect(1, 2, 1.2, 2); }
  else if (k === 'cometa') { g.translate(0, -12); const gr = g.createLinearGradient(-30, 0, 4, 0); gr.addColorStop(0, 'rgba(122,208,255,0)'); gr.addColorStop(1, 'rgba(200,240,255,.9)'); g.fillStyle = gr; g.beginPath(); g.moveTo(2, -9); g.quadraticCurveTo(-18, -8 + wob, -32, -2); g.quadraticCurveTo(-18, 6, 2, 9); g.fill(); g.fillStyle = '#e8f8ff'; g.beginPath(); g.arc(4, 0, 10, 0, 7); g.fill(); g.fillStyle = E.c; g.beginPath(); g.arc(5, 0, 8, 0, 7); g.fill(); g.fillStyle = '#5ab0e8'; g.beginPath(); g.arc(8, -3, 2.2, 0, 7); g.arc(2, 4, 1.6, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(3, -2, 1.8, 0, 7); g.arc(8, 2, 1.4, 0, 7); g.fill(); }
  g.restore();
}
/* caché de imágenes: torres y enemigos ya dibujados (mucho más rápido en celulares) */
const TDC = { m: new Map(), T: 0, dpr: 1 };
function tdSpr(key, w, h, fn) {
  let cv = TDC.m.get(key); if (cv) return cv;
  cv = document.createElement('canvas'); cv.width = Math.ceil(w * TDC.dpr); cv.height = Math.ceil(h * TDC.dpr); const q = cv.getContext('2d'); q.scale(TDC.dpr, TDC.dpr); fn(q); TDC.m.set(key, cv); return cv;
}

/* ---------- inicio: mapas, reto del día, raíces y guía ---------- */
function tdHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="tdhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#e6f6d0"/></linearGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#tdhS)"/><rect y="70" width="360" height="100" fill="#9bd56a"/>
    <path d="M-10 120 H120 V90 H240 V140 H370" stroke="#e2c58f" stroke-width="26" fill="none" stroke-linejoin="round"/>
    <g transform="translate(320 92)"><rect x="-6" y="-6" width="12" height="40" fill="#7a5232"/><circle cy="-22" r="26" fill="#3a9a4a"/><circle cx="-14" cy="-10" r="16" fill="#4aaa5a"/><circle cx="14" cy="-10" r="16" fill="#2f8a40"/><circle cx="-6" cy="-28" r="7" fill="#ffffff" opacity=".25"/></g>
    <g transform="translate(70 92)"><ellipse rx="16" ry="6" cy="12" fill="#c9c2b0"/><ellipse rx="9" ry="10" fill="#c97a3a"/><circle cy="-12" r="7" fill="#c97a3a"/><circle cx="-2.5" cy="-13" r="1.4" fill="#111"/><circle cx="2.5" cy="-13" r="1.4" fill="#111"/></g>
    <g transform="translate(180 64)"><ellipse rx="16" ry="6" cy="12" fill="#d8c47a"/><path d="M-14 0 a14 10 0 0 1 28 0z" fill="#d0405a"/><circle cx="-6" cy="-4" r="2.4" fill="#fff"/><circle cx="4" cy="-6" r="2" fill="#fff"/><rect x="-4" y="0" width="8" height="10" fill="#f2e8d8"/></g>
    <g transform="translate(270 62)"><ellipse rx="10" ry="12" fill="#8a6ad0"/><circle cx="-4" cy="-4" r="3.6" fill="#ffe066"/><circle cx="4" cy="-4" r="3.6" fill="#ffe066"/><circle cx="-4" cy="-4" r="1.6"/><circle cx="4" cy="-4" r="1.6"/><path d="M-6 -12 L0 -26 L6 -12z" fill="#5a3aa0"/></g>
    <path d="M232 70 l-6 10 6 0 -5 10" stroke="#ffe066" stroke-width="3" fill="none"/>
    <g fill="#2f6b4a"><ellipse cx="30" cy="120" rx="9" ry="7"/><ellipse cx="150" cy="90" rx="9" ry="7"/></g><g fill="#c9a8e8"><ellipse cx="226" cy="104" rx="8" ry="5"/><ellipse cx="226" cy="112" rx="8" ry="5"/></g></svg>`;
}
function viewTorres() {
  const d = tdData(); const tot = tdStarsTot(), free = tot - tdMetaSpent();
  const tabs = [['mapas', 'Niveles'], ['tienda', 'Tienda'], ['logros', 'Logros'], ['raices', 'Raíces'], ['guia', 'Guía']];
  const seg = `<div class="mz-tabs" role="group">${tabs.map(([k, l]) => `<button type="button" data-act="td-tab" data-v="${k}" aria-pressed="${TD.tab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (TD.tab === 'mapas') {
    const dl = tdDaily(), done = d.day.done === tdToday(); const won = tdLvlsWon();
    let nextL = 0; while (nextL < TD_MAPS.length - 1 && (d.st[nextL] || 0) > 0) nextL++;
    if (TD.world == null) TD.world = TD_MAPS[nextL].w;
    const wOpen = (wi) => tdUnlocked(wi * TD_PER_WORLD);
    const worlds = `<div class="td-worlds" role="tablist">${TD_WORLDS.map((W, wi) => { const got = TD_MAPS.slice(wi * TD_PER_WORLD, (wi + 1) * TD_PER_WORLD).filter((_, k) => (d.st[wi * TD_PER_WORLD + k] || 0) > 0).length; return `<button type="button" class="td-wcard${TD.world === wi ? ' on' : ''}${wOpen(wi) ? '' : ' lock'}" data-act="td-world" data-w="${wi}" style="--g1:${W.g[0]};--g2:${W.bg};--p:${W.p[0]}" aria-pressed="${TD.world === wi}"><i>${wOpen(wi) ? W.e : '🔒'}</i><b>${W.n}</b><span>${got}/${TD_PER_WORLD}</span><em style="--k:${got / TD_PER_WORLD}"></em></button>`; }).join('')}</div>`;
    const W = TD_WORLDS[TD.world]; const base = TD.world * TD_PER_WORLD;
    // camino serpenteante de 25 niveles (5 por fila)
    const nodes = []; for (let k = 0; k < TD_PER_WORLD; k++) { const row = Math.floor(k / 5), col = row % 2 ? 4 - (k % 5) : k % 5; nodes.push({ k, mi: base + k, x: 10 + col * 20, y: 10 + row * 20 }); }
    const pathD = nodes.map((n, i) => `${i ? 'L' : 'M'}${n.x} ${n.y}`).join(' ');
    const nodeHTML = nodes.map((n) => { const M = TD_MAPS[n.mi], s = d.st[n.mi] || 0, open = tdUnlocked(n.mi), cur = n.mi === nextL; return `<button type="button" class="td-node${s ? ' won' : ''}${open ? '' : ' lock'}${cur ? ' cur' : ''} k-${M.kind}" style="left:${n.x}%;top:${n.y}%" data-act="td-lvl" data-m="${n.mi}" ${open ? '' : 'aria-disabled="true"'} aria-label="Nivel ${n.mi + 1}: ${esc(M.n)}"><b>${open ? n.mi + 1 : '🔒'}</b>${M.kind !== 'normal' ? `<i class="td-nk">${TD_KINDS[M.kind].e}</i>` : ''}${s ? `<span class="td-ns">${'★'.repeat(s)}${'☆'.repeat(3 - s)}</span>` : ''}</button>`; }).join('');
    body = `<button type="button" class="td-continue" data-act="td-lvl" data-m="${nextL}" style="--g1:${TD_WORLDS[TD_MAPS[nextL].w].g[0]};--g2:${TD_WORLDS[TD_MAPS[nextL].w].bg}"><span>${won ? 'Continuar' : 'Empezar'}</span><b>Nivel ${nextL + 1} · ${esc(TD_MAPS[nextL].n)}</b><i>▶</i></button>
      ${d.gift && d.gift.day === tdToday() ? '' : `<button type="button" class="td-gift" data-act="td-gift"><span>🎁</span><div><b>Regalo del día</b><small>Racha: ${(d.gift && d.gift.streak) || 0} ${((d.gift && d.gift.streak) || 0) === 1 ? 'día' : 'días'} · ¡tócalo para abrirlo!</small></div><i>Abrir</i></button>`}
      <div class="td-daily${done ? ' done' : ''}"><div><b>📅 Reto del día · nivel ${dl.mi + 1}</b><span>${dl.mod.n}: ${dl.mod.d}.</span><small>${done ? '¡Listo por hoy! Vuelve mañana.' : 'Gánalo: estrella dorada ⭐ y +15 🍂'}</small></div>${done ? '<span class="td-ok">✓</span>' : `<button type="button" class="btn primary" data-act="td-play" data-m="${dl.mi}" data-daily="1">Jugar</button>`}</div>
      ${worlds}
      <div class="td-wmap" style="--g1:${W.g[0]};--g2:${W.g[1]};--bg:${W.bg};--p:${W.p[0]};--p2:${W.p[1]}"><div class="td-wmap-h"><b>${W.e} ${W.n}</b><span>Jefe: ${TD_EN[W.boss].n}</span></div><div class="td-wmap-in"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${pathD}"/></svg>${nodeHTML}</div></div>
      <h2 class="sec">Modo infinito</h2><div class="td-inf"><div><b>♾️ Oleadas sin fin</b><span class="small muted">${won >= 30 ? `El mundo cambia cada día y vienen todos los jefes. Tu mejor: <b>${d.inf || 0}</b> oleadas.` : `Se abre al superar 30 niveles (llevas ${won}).`}</span></div><button type="button" class="btn primary" data-act="td-play" data-m="inf" ${won >= 30 ? '' : 'disabled'}>Jugar</button></div>
      <div class="td-ranks"><div id="jgRank-torresn">${jgRankHTML('torresn')}</div><div id="jgRank-torres">${jgRankHTML('torres')}</div></div>`;
  } else if (TD.tab === 'tienda') {
    const upRow = Object.entries(TD_TW).map(([k, w]) => { const l = d.up[k] || 0, max = l >= 5, c = TD_UPC[l]; const open = tdTowerOpen(k); return `<li class="td-shop-it"><canvas width="80" height="80" data-tdtw="${k}"></canvas><div><b>${w.n}</b><span class="td-pips">${[0, 1, 2, 3, 4].map((i) => `<i class="${i < l ? 'on' : ''}"></i>`).join('')}</span><small>+${l * 7} % daño · +${l * 2} % alcance</small></div>${max ? '<span class="mz-ok">Máximo</span>' : `<button type="button" class="btn${d.gold >= c && open ? ' primary' : ''}" data-act="td-buy" data-t="up" data-k="${k}" ${d.gold >= c && open ? '' : 'disabled'}>${open ? `🍂 ${c}` : '🔒'}</button>`}</li>`; }).join('');
    const pwRow = Object.entries(TD_POWERS).map(([k, p]) => `<li class="td-shop-it"><span class="td-em">${p.e}</span><div><b>${p.n}</b><small>${p.d} Se recarga en ${p.cd} s.</small></div>${d.pw[k] ? `<button type="button" class="btn${tdPwEq().includes(k) ? ' primary' : ''}" data-act="td-buy" data-t="pweq" data-k="${k}">${tdPwEq().includes(k) ? '✓ Llevando' : 'Llevar'}</button>` : `<button type="button" class="btn${d.gold >= p.cost ? ' primary' : ''}" data-act="td-buy" data-t="pw" data-k="${k}" ${d.gold >= p.cost ? '' : 'disabled'}>🍂 ${p.cost}</button>`}</li>`).join('');
    const skRow = Object.entries(TD_SKINS).map(([k, sk]) => { const own = d.skins[k], on = d.skin === k; return `<button type="button" class="td-skin${on ? ' on' : ''}" data-act="td-buy" data-t="skin" data-k="${k}" ${!own && d.gold < sk.cost ? 'disabled' : ''}><svg viewBox="0 0 60 60" aria-hidden="true"><rect x="26" y="34" width="8" height="20" rx="2" fill="${sk.c[2]}"/><circle cx="30" cy="24" r="16" fill="${sk.rb ? 'url(#tdRb)' : sk.c[0]}"/><circle cx="19" cy="31" r="10" fill="${sk.rb ? '#ffd23c' : sk.c[1]}"/><circle cx="41" cy="31" r="10" fill="${sk.rb ? '#4dabf7' : sk.c[1]}"/><circle cx="24" cy="20" r="2.6" fill="${sk.f}"/><circle cx="36" cy="28" r="2.6" fill="${sk.f}"/><defs><linearGradient id="tdRb"><stop offset="0" stop-color="#ff6b6b"/><stop offset=".5" stop-color="#69db7c"/><stop offset="1" stop-color="#9775fa"/></linearGradient></defs></svg><b>${sk.n}</b><span>${on ? 'Puesto' : own ? 'Poner' : `🍂 ${sk.cost}`}</span></button>`; }).join('');
    const bRow = Object.entries(TD_BOOST).map(([k, b]) => { const l = d[k] || 0, max = l >= 3; return `<li class="td-shop-it"><span class="td-em">${k === 'sb' ? '🎒' : '🛡️'}</span><div><b>${b.n} · ${l}/3</b><small>${b.d}</small></div>${max ? '<span class="mz-ok">Máximo</span>' : `<button type="button" class="btn${d.gold >= b.cost[l] ? ' primary' : ''}" data-act="td-buy" data-t="boost" data-k="${k}" ${d.gold >= b.cost[l] ? '' : 'disabled'}>🍂 ${b.cost[l]}</button>`}</li>`; }).join('');
    body = `<div class="td-wallet"><span>🍂</span><div><b>${d.gold}</b><small>hojas doradas · las ganas al superar niveles, retos y logros</small></div></div>
      <h2 class="sec">Mejoras de torres</h2><ul class="td-shop">${upRow}</ul>
      <h2 class="sec">Poderes nuevos</h2><p class="small muted">Llevas hasta 3 poderes a cada nivel: elige cuáles con «Llevar».</p><ul class="td-shop">${pwRow}</ul>
      <h2 class="sec">Aspecto del Gran Árbol</h2><div class="td-skins">${skRow}</div>
      <h2 class="sec">Ayudas para cada nivel</h2><ul class="td-shop">${bRow}</ul>`;
    setTimeout(tdPaintGuide, 0);
  } else if (TD.tab === 'logros') {
    const n = TD_ACH.filter((a) => d.ach[a.id]).length;
    body = `<p class="page-sub" style="margin-top:12px">Logros: <b>${n}</b> de ${TD_ACH.length}. Cada uno te regala hojas doradas.</p><ul class="td-achs">${TD_ACH.map((a) => `<li class="${d.ach[a.id] ? 'on' : ''}"><span>${d.ach[a.id] ? '🏆' : '🔒'}</span><div><b>${a.n}</b><small>${a.d}</small></div><em>+${a.g} 🍂</em></li>`).join('')}</ul>
      <p class="small muted" style="text-align:center">Plagas vencidas: <b>${(d.kills || 0).toLocaleString('es-MX')}</b> · Jefes distintos: <b>${Object.keys(d.bossK).length}</b>/${TD_BOSSES.length} · Victorias: <b>${d.wins || 0}</b></p>`;
  } else if (TD.tab === 'raices') {
    body = `<p class="page-sub" style="margin-top:12px">Cada estrella que ganas hace crecer las raíces de tu bosque: mejoras que duran para siempre.</p>
      <p class="small" style="text-align:center">Estrellas: <b>${tot}</b>${d.dayStars ? ` (${d.dayStars} doradas)` : ''} · disponibles: <b>⭐ ${free}</b></p>
      <ul class="mz-list">${TD_META.map((m) => { const l = tdMeta(m.id), max = l >= m.max, c = tdMetaCost(l); return `<li><div><b>${m.n} · ${l}/${m.max}</b><span class="small muted">${m.d}</span></div>${max ? '<span class="mz-ok">Máximo</span>' : `<button type="button" class="btn${free >= c ? ' primary' : ''}" data-act="td-meta" data-id="${m.id}" ${free >= c ? '' : 'disabled'}>⭐ ${c}</button>`}</li>`; }).join('')}</ul>
      ${tdMetaSpent() ? '<p style="text-align:center"><button class="link-btn" data-act="td-meta-reset">Reiniciar raíces (te devuelve las estrellas)</button></p>' : ''}`;
  } else {
    body = `<h2 class="sec">Torres</h2><ul class="td-guide">${Object.entries(TD_TW).map(([k, w]) => `<li><canvas width="80" height="80" data-tdtw="${k}"></canvas><div><b>${w.n}${tdTowerOpen(k) ? '' : ' 🔒'}</b><span class="small muted">${w.d}${tdTowerOpen(k) ? '' : ` Se abre al superar el mapa ${w.un}.`}</span>${tdFxTxt(w.fx)}<span class="small">🌰 ${w.cost[0]} · Especialidades: ${w.spec.map((s) => `<b>${s[0]}</b> (${s[1].toLowerCase()})`).join(' o ')}</span></div></li>`).join('')}</ul>
      <h2 class="sec">Plagas y jefes</h2><ul class="td-guide">${Object.entries(TD_EN).filter(([k, e]) => k !== 'gusito' && !e.hide).map(([k, e]) => `<li><canvas width="80" height="80" data-tden="${k}"></canvas><div><b>${e.n}</b><span class="small muted">${e.d}</span></div></li>`).join('')}</ul>
      <h2 class="sec">Giros de los mapas</h2><ul class="td-guide">${TD_TW_KEYS.map((k) => `<li><span class="td-em">${TD_TWISTS[k].e}</span><div><b>${TD_TWISTS[k].n}</b><span class="small muted">${TD_TWISTS[k].d}</span></div></li>`).join('')}</ul>
      <h2 class="sec">Tipos de oleada</h2><ul class="td-guide">${TD_THEMES.map((t) => `<li><span class="td-em">🌊</span><div><b>${t.n}</b><span class="small muted">${t.k ? t.k.map((x) => TD_EN[x].n).join(', ') : 'De todo un poco.'}</span></div></li>`).join('')}</ul>
      <h2 class="sec">Bendiciones</h2><p class="small muted">Cada 5 oleadas eliges 1 de 3 bendiciones al azar que duran toda la partida.</p><ul class="td-guide">${TD_PERKS.map((p) => `<li><span class="td-em">${p.e}</span><div><b>${p.n}</b><span class="small muted">${p.d}</span></div></li>`).join('')}</ul>
      <p class="small muted">Poderes: 🌰 <b>Lluvia de bellotas</b> (daño en área) y 🌿 <b>Raíces</b> (detiene a los enemigos). Toca el poder y luego el lugar del mapa. Al nivel 4, cada torre puede tomar una de dos <b>especialidades</b>.</p>`;
    setTimeout(tdPaintGuide, 0);
  }
  return `<section class="gm-home"><div class="gm-hero">${tdHero()}</div><h1 class="page-title gm-title">Defensa del Bosque</h1>
    <p class="page-sub">Las plagas quieren llegar al Gran Árbol. <b>Toca el pasto</b> para poner torres, <b>toca el camino</b> para poner trampas y <b>toca una torre</b> para mejorarla. Usa tus poderes en los momentos difíciles.</p>
    <div class="mz-head"><span>🍂 <b>${d.gold}</b></span><span>Niveles <b>${tdLvlsWon()}</b>/${TD_MAPS.length}</span><span>Plagas vencidas <b>${(d.kills || 0).toLocaleString('es-MX')}</b></span></div>${seg}${body}</section>`;
}
function tdLevelSheet(mi) {
  const d = tdData(), M = TD_MAPS[mi], W = TD_WORLDS[M.w], s = d.st[mi] || 0;
  openSheet(`${sheetHead(`Nivel ${mi + 1}`)}<div class="sheet-body td-lsheet">
    <div class="td-lhead"><canvas width="90" height="130" data-tdmap="${mi}"></canvas><div><b class="td-lname">${esc(M.n)}</b><span>${W.e} ${W.n}</span><span class="td-st">${[0, 1, 2].map((i) => `<i class="${i < s ? 'on' : ''}">★</i>`).join('')}</span><span>🌊 ${M.waves} oleadas${M.paths.length > 1 ? ` · ${M.paths.length} entradas` : ''}</span></div></div>
    ${M.kind !== 'normal' ? `<div class="td-lrule kind"><i>${TD_KINDS[M.kind].e}</i><div><b>${TD_KINDS[M.kind].n}</b><span>${TD_KINDS[M.kind].d}</span></div></div>` : ''}
    ${(M.tw || []).map((k) => `<div class="td-lrule"><i>${TD_TWISTS[k].e}</i><div><b>${TD_TWISTS[k].n}</b><span>${TD_TWISTS[k].d}</span></div></div>`).join('') || '<p class="small muted">Nivel clásico, sin reglas especiales.</p>'}
    <button type="button" class="btn primary block" data-act="td-play" data-m="${mi}" style="margin-top:12px">${icon('play', 'sm')}${s ? 'Jugar otra vez' : 'Jugar'}</button></div>`);
  setTimeout(tdPaintMaps, 20);
}
function tdPaintMaps() {
  document.querySelectorAll('canvas[data-tdmap]').forEach((cv) => { const mi = +cv.dataset.tdmap; const M = TD_MAPS[mi], W = TD_WORLDS[M.w]; const g = cv.getContext('2d'); const T = 10; g.fillStyle = W.g[0]; g.fillRect(0, 0, 90, 130); g.strokeStyle = W.p[1]; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'round'; for (const p of M.paths) { g.beginPath(); p.forEach(([x, y], i) => { const X = (x + 0.5) * T, Y = (y + 0.5) * T; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.stroke(); } const e = M.paths[0][M.paths[0].length - 1]; g.fillStyle = '#2f8a40'; g.beginPath(); g.arc((e[0] + 0.5) * T, (e[1] + 0.5) * T, 7, 0, 7); g.fill(); });
}
function tdPaintGuide() {
  document.querySelectorAll('canvas[data-tdtw]').forEach((cv) => { const g = cv.getContext('2d'); g.clearRect(0, 0, 80, 80); tdDrawTower(g, cv.dataset.tdtw, 3, 40, 40, 60, 1); });
  document.querySelectorAll('canvas[data-tden]').forEach((cv) => { const g = cv.getContext('2d'); g.clearRect(0, 0, 80, 80); const b = TD_EN[cv.dataset.tden].boss; tdDrawEnemy(g, { k: cv.dataset.tden, id: 1, dir: 1 }, 40, b ? 50 : 46, b ? 34 : 56, 1); });
}
JG_CFG.torresn = { title: 'Ranking · niveles superados', tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Total']], val: (x) => `${x.score} niveles`, mine: (m) => `Tu progreso: <b>${m.best || 0} niveles</b>`, none: 'Aún nadie ha superado niveles en este periodo.' };
JG_CFG.torres = { title: 'Ranking · modo infinito', tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']], val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'partida', 'partidas') : `${x.score} oleadas`), mine: (m) => `Tu mejor: <b>${m.best || 0} oleadas</b> · partidas: <b>${m.games || 0}</b>`, none: 'Aún nadie juega el modo infinito en este periodo.' };
Object.assign(VIDA_ACTS, {
  'td-tab': (el) => { TD.tab = el.dataset.v; render(); },
  'td-gift': (el) => {
    const d = tdData(); const t = tdToday(); if (d.gift && d.gift.day === t) return;
    const y = new Date(Date.now() - 864e5); const yk = `${y.getFullYear()}-${y.getMonth() + 1}-${y.getDate()}`;
    const streak = d.gift && d.gift.day === yk ? (d.gift.streak || 0) + 1 : 1; const g = Math.min(40, 8 + streak * 3);
    d.gift = { day: t, streak }; d.gold += g; jpSave(); TDS.init(); TDS.win();
    try { const r = el.getBoundingClientRect(); confetti(r.left + r.width / 2, r.top + r.height / 2, 40); } catch { /* */ }
    toast(`🎁 +${g} hojas doradas · racha de ${streak} ${streak === 1 ? 'día' : 'días'}`); setTimeout(render, 500);
  },
  'td-world': (el) => { const w = +el.dataset.w; if (!tdUnlocked(w * TD_PER_WORLD)) { toast(`Supera el último nivel de ${TD_WORLDS[w - 1].n} para abrir este mundo.`); return; } TD.world = w; render(); },
  'td-lvl': (el) => { const mi = +el.dataset.m; if (!tdUnlocked(mi)) { toast('Supera el nivel anterior para abrir este.'); return; } tdLevelSheet(mi); },
  'td-buy': (el) => {
    const d = tdData(), t = el.dataset.t, k = el.dataset.k; let cost = 0;
    if (t === 'pweq') { const eq = tdPwEq(); const i = eq.indexOf(k); if (i >= 0) eq.splice(i, 1); else { if (eq.length >= 3) eq.shift(); eq.push(k); } d.pwEq = eq; jpSave(); TDS.init(); TDS.tone(880, 0.08, 'triangle', 0.04); render(); return; }
    if (t === 'up') { const l = d.up[k] || 0; if (l >= 5) return; cost = TD_UPC[l]; if (d.gold < cost) return; d.gold -= cost; d.up[k] = l + 1; }
    else if (t === 'pw') { if (d.pw[k]) return; cost = TD_POWERS[k].cost; if (d.gold < cost) return; d.gold -= cost; d.pw[k] = 1; if (Array.isArray(d.pwEq) && d.pwEq.length < 3) d.pwEq.push(k); }
    else if (t === 'skin') { if (d.skins[k]) { d.skin = k; jpSave(); TDS.init(); TDS.tone(880, 0.08, 'triangle', 0.04); render(); return; } cost = TD_SKINS[k].cost; if (d.gold < cost) return; d.gold -= cost; d.skins[k] = 1; d.skin = k; }
    else if (t === 'boost') { const l = d[k] || 0; if (l >= 3) return; cost = TD_BOOST[k].cost[l]; if (d.gold < cost) return; d.gold -= cost; d[k] = l + 1; }
    const ach = tdCheckAch(); jpSave(); TDS.init(); TDS.spec(); toast(ach.length ? `¡Comprado! Logro: ${ach.map((a) => a.n).join(', ')}` : '¡Comprado!'); render();
  },
  'td-play': (el) => { if (typeof closeSheet === 'function' && document.querySelector('.sheet.open, dialog[open]')) closeSheet(false); tdStart(el.dataset.m === 'inf' ? 'inf' : +el.dataset.m, !!el.dataset.daily); },
  'td-meta': (el) => { const m = TD_META.find((x) => x.id === el.dataset.id); const l = tdMeta(m.id); if (l >= m.max) return; if (tdStarsTot() - tdMetaSpent() < tdMetaCost(l)) return; tdData().meta[m.id] = l + 1; jpSave(); TDS.init(); TDS.up(); render(); },
  'td-meta-reset': () => { tdData().meta = {}; jpSave(); render(); },
});

/* ---------- sonido ---------- */
const TDS = {
  ac: null, out: null, last: {}, nb: 0, beat: 0, music: true,
  init() { if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume().catch(() => {}); return; } try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); const cp = this.ac.createDynamicsCompressor(); cp.connect(this.ac.destination); this.out = this.ac.createGain(); this.out.gain.value = 0.85; this.out.connect(cp); this.nb = this.ac.currentTime + 0.2; } catch { this.ac = null; } },
  ok(k, gap) { const n = performance.now(); if (this.last[k] && n - this.last[k] < gap) return false; this.last[k] = n; return !!this.ac; },
  tone(f, d, type, vol, f2, delay = 0) { const ac = this.ac; if (!ac) return; const t0 = ac.currentTime + delay; const o = ac.createOscillator(), v = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d * 0.85); v.gain.setValueAtTime(0.0001, t0); v.gain.linearRampToValueAtTime(vol, t0 + 0.005); v.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(v); v.connect(this.out); o.start(t0); o.stop(t0 + d + 0.05); },
  noise(d, vol, f0, f1, delay = 0) { const ac = this.ac; if (!ac) return; const t0 = ac.currentTime + delay; const n = Math.max(1, Math.floor(ac.sampleRate * d)); const b = ac.createBuffer(1, n, ac.sampleRate); const ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = ac.createBufferSource(); s.buffer = b; const fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + d); const v = ac.createGain(); v.gain.value = vol; s.connect(fl); fl.connect(v); v.connect(this.out); s.start(t0); },
  build() { this.tone(330, 0.12, 'triangle', 0.06, 520); this.tone(660, 0.2, 'triangle', 0.05, 0, 0.08); this.noise(0.15, 0.06, 600, 200); },
  up() { [0, 4, 7, 12].forEach((s, i) => this.tone(523 * Math.pow(2, s / 12), 0.2, 'triangle', 0.05, 0, i * 0.05)); },
  spec() { [0, 4, 7, 12, 16, 19].forEach((s, i) => this.tone(440 * Math.pow(2, s / 12), 0.35, 'triangle', 0.05, 0, i * 0.06)); this.noise(0.5, 0.04, 2000, 6000); },
  sell() { this.tone(1318, 0.08, 'square', 0.03); this.tone(1760, 0.15, 'square', 0.03, 0, 0.07); },
  no() { this.tone(200, 0.15, 'triangle', 0.05, 150); },
  shot(k) { if (!this.ok(k, k === 'ardilla' ? 70 : 110)) return; if (k === 'ardilla') this.tone(900, 0.06, 'triangle', 0.02, 500); else if (k === 'tortuga') { this.noise(0.18, 0.08, 400, 90); this.tone(110, 0.15, 'sine', 0.06, 60); } else if (k === 'hongo') this.noise(0.25, 0.05, 2000, 500); else if (k === 'abejas') this.tone(220, 0.15, 'sawtooth', 0.012, 260); else if (k === 'buho') { this.noise(0.15, 0.06, 4000, 1500); this.tone(1200, 0.1, 'square', 0.02, 300); } else if (k === 'pino') { this.tone(1800, 0.3, 'sine', 0.03, 2600); this.noise(0.3, 0.04, 6000, 3000); } },
  boom() { if (!this.ok('boom', 90)) return; this.noise(0.25, 0.08, 500, 80); },
  pop(big) { if (!this.ok('pop', 45)) return; const f = 500 + Math.random() * 300; this.tone(f, 0.08, 'sine', 0.04, f * 1.6); if (big) this.noise(0.8, 0.18, 300, 50); },
  crit() { if (!this.ok('crit', 120)) return; this.tone(1500, 0.08, 'square', 0.025, 2200); },
  coin() { if (!this.ok('coin', 60)) return; this.tone(1568, 0.05, 'square', 0.012); },
  hurt() { this.tone(160, 0.3, 'sawtooth', 0.06, 70); this.noise(0.25, 0.08, 300, 80); },
  wave() { [0, 7, 12].forEach((s, i) => this.tone(262 * Math.pow(2, s / 12), 0.35, 'sawtooth', 0.025, 0, i * 0.12)); },
  boss() { this.tone(80, 1.2, 'sawtooth', 0.08, 50); this.noise(1.0, 0.1, 200, 60); },
  bpow() { if (!this.ok('bpow', 300)) return; this.tone(140, 0.5, 'sawtooth', 0.05, 90); this.noise(0.4, 0.07, 1200, 300); },
  acorn() { this.noise(0.6, 0.14, 800, 80); this.tone(100, 0.4, 'sine', 0.08, 50); },
  root() { this.noise(0.5, 0.06, 200, 900); this.tone(180, 0.5, 'triangle', 0.05, 90); },
  win() { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => this.tone(392 * Math.pow(2, s / 12), 0.45, 'triangle', 0.05, 0, i * 0.09)); },
  lose() { [7, 4, 0, -5].forEach((s, i) => this.tone(330 * Math.pow(2, s / 12), 0.5, 'triangle', 0.05, 0, i * 0.2)); },
  tickMusic(on, wi) {
    const ac = this.ac; if (!ac || !on || !this.music) { if (ac) this.nb = Math.max(this.nb, ac.currentTime); return; }
    const sc = [[262, 330, 392, 440], [220, 262, 330, 392], [294, 370, 440, 494], [196, 233, 294, 349], [247, 311, 370, 415], [330, 415, 494, 554], [220, 277, 330, 415], [262, 311, 392, 466], [196, 247, 294, 370], [233, 294, 349, 440], [208, 247, 311, 370], [277, 349, 415, 523]][wi % 12];
    while (this.nb < ac.currentTime + 0.3) { const s = this.beat % 16, t = this.nb - ac.currentTime; if (s % 8 === 0) this.tone(sc[0] / 2, 1.5, 'sine', 0.02, 0, t); if (s % 2 === 0) this.tone(sc[[0, 2, 1, 3, 2, 1, 3, 0][(s / 2) | 0]] * 2, 0.25, 'triangle', 0.008, 0, t); this.nb += 0.22; this.beat++; }
  },
};

/* ---------- la partida ---------- */
function tdStart(mi, daily) {
  if (TD.run) return; TDS.init();
  const tb = (t) => TD_TW[t.k].beh || t.k;
  const D = tdData(); const INF = mi === 'inf'; const MI = INF ? (new Date().getDate() % TD_WORLDS.length) * TD_PER_WORLD + 10 : mi; const M = INF ? { ...TD_MAPS[MI], tw: [], kind: 'normal' } : TD_MAPS[MI], W = TD_WORLDS[M.w];
  const PW = tdPwEq(); const SKIN = TD_SKINS[D.skin] || TD_SKINS.roble;
  const MOD = daily ? tdDaily().mod : null; const mk = MOD ? MOD.k : '';
  const WAVES = INF ? Infinity : tdWaves(MI);
  const wrap = document.createElement('div'); wrap.className = 'gl-stage td-stage';
  wrap.innerHTML = `<canvas aria-label="Defensa del Bosque"></canvas>
    <div class="td-top"><button class="gm-x" id="tdX" aria-label="Salir">${icon('x')}</button><span class="td-pill" id="tdLp">❤️ <b id="tdL">20</b></span><span class="td-pill" id="tdSp2">🌰 <b id="tdS">0</b></span><span class="td-pill td-w">🌊 <b id="tdW">0</b>${INF ? '' : `/${WAVES}`}</span><button class="td-btn" id="tdSp" aria-label="Velocidad">1×</button><button class="td-btn" id="tdPa" aria-label="Pausa">❚❚</button></div>
    <div class="td-perks" id="tdPk"></div>
    <div class="td-panel" id="tdPanel" hidden></div>
    <div class="td-bot${PW.length ? ' many' : ''}"><button class="td-pow" id="tdP1" aria-label="Lluvia de bellotas">🌰<i></i></button><button class="td-pow" id="tdP2" aria-label="Raíces">🌿<i></i></button>${PW.map((k) => `<button class="td-pow td-pow-x" data-pw="${k}" aria-label="${TD_POWERS[k].n}">${TD_POWERS[k].e}<i></i></button>`).join('')}<span class="td-hint" id="tdHint"></span><button class="btn primary td-next" id="tdNext">▶ Empezar</button></div>
    <div class="gl-over" id="tdPause" hidden><b>Pausa</b><div class="btn-row" style="justify-content:center;flex-wrap:wrap"><button class="btn primary" id="tdGo">${icon('play')}Seguir</button><button class="btn" id="tdMus">Música: ${TDS.music ? 'sí' : 'no'}</button><button class="btn" id="tdRe">Reiniciar</button><button class="btn" id="tdOut">Salir</button></div></div>
    <div class="gl-over td-end" id="tdEnd" hidden></div>
    <div class="gl-over td-perk" id="tdPerk" hidden></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const $w = (s) => wrap.querySelector(s);
  const c = wrap.querySelector('canvas'), g = c.getContext('2d');
  const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;visibility:hidden;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)'; wrap.appendChild(probe);
  const V = { w: 360, h: 640, dpr: 1, T: 40, ox: 0, oy: 0 }; let BG = null;
  const low = () => !!(window.cnPerf && window.cnPerf.low());

  /* --- caminos --- */
  const PATHS = M.paths.map((pts) => { const P = pts.map(([x, y]) => [x + 0.5, y + 0.5]); const seg = []; let L = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (l < 0.01) continue; seg.push({ a: P[i - 1], b: P[i], l, s: L }); L += l; } return { P, seg, L }; });
  const posAt = (pi, d) => { const p = PATHS[pi]; d = Math.max(0, Math.min(p.L, d)); for (const s of p.seg) { if (d <= s.s + s.l) { const k = (d - s.s) / s.l; return { x: s.a[0] + (s.b[0] - s.a[0]) * k, y: s.a[1] + (s.b[1] - s.a[1]) * k, dx: Math.sign(s.b[0] - s.a[0]) }; } } const e = p.P[p.P.length - 1]; return { x: e[0], y: e[1], dx: 0 }; };
  const key = (x, y) => y * 100 + x; const pathCells = new Set(), blocked = new Set();
  for (const pts of M.paths) for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) { const x = Math.round(x0 + (x1 - x0) * k / n), y = Math.round(y0 + (y1 - y0) * k / n); if (x >= 0 && x < TD_COLS && y >= 0 && y < TD_ROWS) pathCells.add(key(x, y)); } }
  const tree = M.paths[0][M.paths[0].length - 1]; blocked.add(key(tree[0], tree[1]));
  let sd = MI * 977 + 31; const rnd = () => { sd = (sd + 0x6D2B79F5) | 0; let t = Math.imul(sd ^ (sd >>> 15), 1 | sd); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const decos = []; for (let y = 0; y < TD_ROWS; y++) for (let x = 0; x < TD_COLS; x++) { if (pathCells.has(key(x, y)) || blocked.has(key(x, y))) continue; if (rnd() < 0.07) { decos.push({ x, y, k: rnd() }); blocked.add(key(x, y)); } }

  /* --- giros del mapa --- */
  const TW = new Set(M.tw || []); const pathArr = [...pathCells].filter((k) => k !== key(tree[0], tree[1]));
  const pickN = (arr, n) => { const a = arr.slice(), o = []; while (a.length && o.length < n) o.push(a.splice((rnd() * a.length) | 0, 1)[0]); return o; };
  const mud = new Set(TW.has('lodo') ? pickN(pathArr.filter((k) => Math.floor(k / 100) > 1 || (k % 100) > 1), 6) : []);
  const near = (x, y) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (pathCells.has(key(x + dx, y + dy))) return true; return false; };
  const fert = new Set(); if (TW.has('fertil')) { const c = []; for (let y = 0; y < TD_ROWS; y++) for (let x = 0; x < TD_COLS; x++) if (!blocked.has(key(x, y)) && !pathCells.has(key(x, y)) && near(x, y)) c.push(key(x, y)); pickN(c, 7).forEach((k) => fert.add(k)); }
  const PORT = TW.has('portal') ? (() => { const a = 0.26 + rnd() * 0.1; return { a, b: a + 0.2 }; })() : null;
  const ZON = TW.has('resbalon') ? (() => { const a = 0.4 + rnd() * 0.12; return { a, b: a + 0.2 }; })() : null;
  const SOLO = TW.has('solo') ? (() => { const open = Object.keys(TD_TW).filter((k) => k !== 'ardilla' && tdTowerOpen(k)); return new Set(['ardilla', ...pickN(open, 3)]); })() : null;
  const NOUP = TW.has('raices'), MAXT = TW.has('espacio') ? (MI >= 300 && !INF ? 12 : 9) : 0;
  const COACH = (MI === 0 && !INF && !(D.wins > 0)) ? (() => { for (let y = 2; y < TD_ROWS; y++) for (let x = 0; x < TD_COLS; x++) { if (blocked.has(key(x, y)) || pathCells.has(key(x, y))) continue; let n = 0; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (pathCells.has(key(x + dx, y + dy))) n++; if (n >= 3) return [x, y]; } return null; })() : null;
  const twDesc = () => (M.tw || []).map((k) => `${TD_TWISTS[k].e} ${TD_TWISTS[k].n}: ${TD_TWISTS[k].d}`).join('  ');
  const size = () => {
    V.lowF = low(); V.lowN = 0; V.dpr = Math.min(V.lowF ? 1.5 : 2, devicePixelRatio || 1); V.w = innerWidth; V.h = innerHeight; c.width = Math.round(V.w * V.dpr); c.height = Math.round(V.h * V.dpr); c.style.width = V.w + 'px'; c.style.height = V.h + 'px';
    const cs = getComputedStyle(probe); const st0 = parseFloat(cs.paddingTop) || 0, sb = parseFloat(cs.paddingBottom) || 0;
    const top = st0 + 58, bot = sb + 74; const ah = V.h - top - bot;
    V.T = Math.floor(Math.max(24, Math.min(V.w / TD_COLS, ah / TD_ROWS, 76))); V.ox = Math.round((V.w - TD_COLS * V.T) / 2); V.oy = Math.round(top + (ah - TD_ROWS * V.T) / 2);
    BG = null; TDC.m.clear(); TDC.T = V.T; TDC.dpr = V.dpr; seedPos = null;
  };
  let seedPos = null;
  size(); addEventListener('resize', size);
  function paintBG() {
    const T = V.T; BG = document.createElement('canvas'); BG.width = c.width; BG.height = c.height; const q = BG.getContext('2d'); q.scale(V.dpr, V.dpr);
    const bgr = q.createLinearGradient(0, 0, 0, V.h); bgr.addColorStop(0, W.bg); bgr.addColorStop(1, W.g[1]); q.fillStyle = bgr; q.fillRect(0, 0, V.w, V.h);
    for (let y = 0; y < TD_ROWS; y++) for (let x = 0; x < TD_COLS; x++) { q.fillStyle = (x + y) % 2 ? W.g[0] : W.g[1]; q.fillRect(V.ox + x * T, V.oy + y * T, T, T); }
    let s2 = 7 + MI; const r2 = () => { s2 = (s2 * 16807) % 2147483647; return s2 / 2147483647; };
    for (let i = 0; i < 160; i++) { const x = V.ox + r2() * TD_COLS * T, y = V.oy + r2() * TD_ROWS * T; q.fillStyle = W.deco === 'pino' || W.deco === 'nube' || W.deco === 'astro' || W.deco === 'hongoluz' ? 'rgba(255,255,255,.55)' : 'rgba(0,0,0,.07)'; q.fillRect(x, y, 2, 2); if (W.deco === 'flor' && r2() < 0.25) { q.fillStyle = ['#fff', '#ffd23c', '#ff8fab'][i % 3]; q.beginPath(); q.arc(x, y, 1.6, 0, 7); q.fill(); } }
    for (const p of PATHS) { q.strokeStyle = 'rgba(0,0,0,.15)'; q.lineWidth = T * 0.92; q.lineJoin = 'round'; q.lineCap = 'round'; q.beginPath(); p.P.forEach(([x, y], i) => { const X = V.ox + x * T, Y = V.oy + y * T + 2; if (i) q.lineTo(X, Y); else q.moveTo(X, Y); }); q.stroke(); }
    for (const p of PATHS) { q.lineJoin = 'round'; q.lineCap = 'round'; q.beginPath(); p.P.forEach(([x, y], i) => { const X = V.ox + x * T, Y = V.oy + y * T; if (i) q.lineTo(X, Y); else q.moveTo(X, Y); }); q.strokeStyle = W.p[1]; q.lineWidth = T * 0.86; q.stroke(); q.strokeStyle = W.p[0]; q.lineWidth = T * 0.7; q.stroke(); q.setLineDash([2, T * 0.45]); q.strokeStyle = 'rgba(0,0,0,.12)'; q.lineWidth = 3; q.stroke(); q.setLineDash([]); }
    mud.forEach((k) => { const X = V.ox + ((k % 100) + 0.5) * T, Y = V.oy + (Math.floor(k / 100) + 0.5) * T; q.fillStyle = 'rgba(80,50,25,.75)'; q.beginPath(); q.ellipse(X, Y, T * 0.4, T * 0.3, 0, 0, 7); q.fill(); q.fillStyle = 'rgba(140,100,60,.6)'; q.beginPath(); q.ellipse(X - T * 0.08, Y - T * 0.06, T * 0.2, T * 0.1, 0, 0, 7); q.fill(); });
    if (ZON) for (const p of PATHS) { q.strokeStyle = 'rgba(190,235,255,.7)'; q.lineWidth = T * 0.5; q.lineCap = 'butt'; q.beginPath(); let first = true; for (let d = ZON.a * p.L; d <= ZON.b * p.L; d += 0.1) { const o = posAt(PATHS.indexOf(p), d); const X = V.ox + o.x * T, Y = V.oy + o.y * T; if (first) { q.moveTo(X, Y); first = false; } else q.lineTo(X, Y); } q.stroke(); q.strokeStyle = 'rgba(255,255,255,.8)'; q.lineWidth = 2; q.setLineDash([4, 6]); q.stroke(); q.setLineDash([]); }
    fert.forEach((k) => { const X = V.ox + ((k % 100) + 0.5) * T, Y = V.oy + (Math.floor(k / 100) + 0.5) * T; const gr = q.createRadialGradient(X, Y, 2, X, Y, T * 0.55); gr.addColorStop(0, 'rgba(255,250,150,.85)'); gr.addColorStop(1, 'rgba(255,250,150,0)'); q.fillStyle = gr; q.fillRect(X - T * 0.55, Y - T * 0.55, T * 1.1, T * 1.1); q.fillStyle = '#fff6a8'; for (const [a, b] of [[-0.2, -0.15], [0.18, 0.1], [0, 0.25]]) { q.beginPath(); q.arc(X + a * T, Y + b * T, 1.6, 0, 7); q.fill(); } });
    for (const d of decos) {
      const X = V.ox + (d.x + 0.5) * T, Y = V.oy + (d.y + 0.5) * T;
      if (W.deco === 'flor') { if (d.k < 0.5) { q.fillStyle = '#8a8f98'; q.beginPath(); q.ellipse(X, Y + T * 0.1, T * 0.32, T * 0.24, 0, 0, 7); q.fill(); q.fillStyle = '#a8adb6'; q.beginPath(); q.ellipse(X - T * 0.08, Y, T * 0.2, T * 0.12, 0, 0, 7); q.fill(); } else { q.fillStyle = '#2f8a40'; q.beginPath(); q.arc(X, Y - T * 0.08, T * 0.36, 0, 7); q.fill(); q.fillStyle = '#4aaa5a'; q.beginPath(); q.arc(X - T * 0.1, Y - T * 0.16, T * 0.18, 0, 7); q.fill(); } }
      else if (W.deco === 'junco') { q.fillStyle = '#4a8aa8'; q.beginPath(); q.ellipse(X, Y, T * 0.42, T * 0.3, 0, 0, 7); q.fill(); q.fillStyle = 'rgba(255,255,255,.3)'; q.beginPath(); q.ellipse(X - T * 0.1, Y - T * 0.06, T * 0.16, T * 0.06, 0, 0, 7); q.fill(); q.strokeStyle = '#3a6a2a'; q.lineWidth = 2; for (let k = -1; k <= 1; k++) { q.beginPath(); q.moveTo(X + k * T * 0.2, Y + T * 0.2); q.lineTo(X + k * T * 0.25, Y - T * 0.35); q.stroke(); } }
      else if (W.deco === 'pino') { q.fillStyle = '#2f6a4a'; q.beginPath(); q.moveTo(X, Y - T * 0.45); q.lineTo(X - T * 0.32, Y + T * 0.25); q.lineTo(X + T * 0.32, Y + T * 0.25); q.fill(); q.fillStyle = '#fff'; q.beginPath(); q.moveTo(X, Y - T * 0.45); q.lineTo(X - T * 0.14, Y - T * 0.12); q.lineTo(X + T * 0.14, Y - T * 0.12); q.fill(); }
      else if (W.deco === 'lava') { q.fillStyle = d.k < 0.5 ? '#ff7a1f' : '#3a2a26'; q.beginPath(); q.ellipse(X, Y, T * 0.38, T * 0.28, 0, 0, 7); q.fill(); if (d.k < 0.5) { q.fillStyle = '#ffd23c'; q.beginPath(); q.ellipse(X - T * 0.06, Y - T * 0.04, T * 0.14, T * 0.08, 0, 0, 7); q.fill(); } }
      else if (W.deco === 'cristal') { q.fillStyle = d.k < 0.5 ? '#ff9ad8' : '#9ad8ff'; for (let k = -1; k <= 1; k++) { q.beginPath(); q.moveTo(X + k * T * 0.18, Y + T * 0.25); q.lineTo(X + k * T * 0.18 - T * 0.08, Y - T * 0.05); q.lineTo(X + k * T * 0.18, Y - T * (0.35 - Math.abs(k) * 0.12)); q.lineTo(X + k * T * 0.18 + T * 0.08, Y - T * 0.05); q.fill(); } }
      else if (W.deco === 'cactus') { if (d.k < 0.55) { q.fillStyle = '#4a9a4a'; q.beginPath(); q.roundRect(X - T * 0.09, Y - T * 0.38, T * 0.18, T * 0.66, T * 0.09); q.fill(); q.beginPath(); q.roundRect(X - T * 0.3, Y - T * 0.2, T * 0.14, T * 0.3, T * 0.07); q.roundRect(X + T * 0.16, Y - T * 0.3, T * 0.14, T * 0.28, T * 0.07); q.fill(); q.fillStyle = '#ff8fab'; q.beginPath(); q.arc(X, Y - T * 0.4, T * 0.06, 0, 7); q.fill(); } else { q.fillStyle = '#c9a070'; q.beginPath(); q.ellipse(X, Y + T * 0.1, T * 0.36, T * 0.22, 0, 0, 7); q.fill(); q.fillStyle = '#dcb886'; q.beginPath(); q.ellipse(X - T * 0.06, Y + T * 0.04, T * 0.18, T * 0.1, 0, 0, 7); q.fill(); } }
      else if (W.deco === 'concha') { if (d.k < 0.5) { q.fillStyle = '#ffb8a8'; q.beginPath(); q.moveTo(X, Y + T * 0.25); q.arc(X, Y + T * 0.05, T * 0.3, Math.PI, 0); q.closePath(); q.fill(); q.strokeStyle = '#e88a78'; q.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { q.beginPath(); q.moveTo(X, Y + T * 0.25); q.lineTo(X + k * T * 0.12, Y - T * 0.2); q.stroke(); } } else { q.fillStyle = '#ff9a5a'; q.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? T * 0.13 : T * 0.32, a = k * Math.PI / 5 - Math.PI / 2; q.lineTo(X + Math.cos(a) * r, Y + Math.sin(a) * r); } q.fill(); } }
      else if (W.deco === 'liana') { q.fillStyle = d.k < 0.5 ? '#2f7a3a' : '#3a8a44'; for (let k = 0; k < 5; k++) { const a = k * 1.256 + d.k * 3; q.beginPath(); q.ellipse(X + Math.cos(a) * T * 0.18, Y + Math.sin(a) * T * 0.18, T * 0.26, T * 0.1, a, 0, 7); q.fill(); } q.fillStyle = '#ff6b9a'; q.beginPath(); q.arc(X, Y, T * 0.07, 0, 7); q.fill(); }
      else if (W.deco === 'calabaza') { if (d.k < 0.5) { q.fillStyle = '#e8762a'; for (const k of [-1, 0, 1]) { q.beginPath(); q.ellipse(X + k * T * 0.12, Y + T * 0.05, T * 0.16, T * 0.24, 0, 0, 7); q.fill(); } q.fillStyle = '#4a7a2a'; q.fillRect(X - T * 0.03, Y - T * 0.28, T * 0.06, T * 0.1); } else { q.fillStyle = '#c84a2a'; for (let k = 0; k < 4; k++) { q.beginPath(); q.ellipse(X + (k - 1.5) * T * 0.14, Y + (k % 2) * T * 0.1, T * 0.12, T * 0.06, k, 0, 7); q.fill(); } } }
      else if (W.deco === 'hongoluz') { const gr = q.createRadialGradient(X, Y - T * 0.1, 1, X, Y - T * 0.1, T * 0.5); gr.addColorStop(0, d.k < 0.5 ? 'rgba(120,230,255,.55)' : 'rgba(255,140,230,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = gr; q.fillRect(X - T * 0.5, Y - T * 0.6, T, T); q.fillStyle = '#e8e0d0'; q.fillRect(X - T * 0.05, Y - T * 0.08, T * 0.1, T * 0.3); q.fillStyle = d.k < 0.5 ? '#6ae0ff' : '#ff8ae0'; q.beginPath(); q.ellipse(X, Y - T * 0.1, T * 0.24, T * 0.14, 0, Math.PI, 0); q.fill(); }
      else if (W.deco === 'astro') { if (d.k < 0.5) { q.fillStyle = '#c8a0ff'; q.beginPath(); q.arc(X, Y, T * 0.22, 0, 7); q.fill(); q.strokeStyle = '#ffe08a'; q.lineWidth = 2; q.beginPath(); q.ellipse(X, Y, T * 0.4, T * 0.1, -0.4, 0, 7); q.stroke(); } else { q.fillStyle = '#6a6a8a'; q.beginPath(); q.arc(X, Y, T * 0.26, 0, 7); q.fill(); q.fillStyle = '#4a4a6a'; q.beginPath(); q.arc(X - T * 0.08, Y - T * 0.05, T * 0.07, 0, 7); q.arc(X + T * 0.1, Y + T * 0.08, T * 0.05, 0, 7); q.fill(); } }
      else { q.fillStyle = '#ffffff'; q.beginPath(); q.arc(X - T * 0.15, Y, T * 0.22, 0, 7); q.arc(X + T * 0.12, Y - T * 0.06, T * 0.26, 0, 7); q.arc(X + T * 0.05, Y + T * 0.1, T * 0.2, 0, 7); q.fill(); }
    }
    for (const p of M.paths) { const [x, y] = p[0]; const X = V.ox + (Math.max(-0.2, Math.min(TD_COLS - 0.8, x)) + 0.5) * T, Y = V.oy + (Math.max(-0.2, Math.min(TD_ROWS - 0.8, y)) + 0.5) * T; q.fillStyle = 'rgba(200,40,40,.4)'; q.beginPath(); q.arc(X, Y, T * 0.42, 0, 7); q.fill(); q.fillStyle = '#fff'; q.font = `900 ${Math.round(T * 0.4)}px system-ui`; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('!', X, Y + 1); }
    q.strokeStyle = 'rgba(0,0,0,.18)'; q.lineWidth = 2; q.strokeRect(V.ox, V.oy, TD_COLS * T, TD_ROWS * T);
  }

  /* --- estado --- */
  const LMAX = 20 + tdMeta('vidas') * 2 + D.lf * 2;
  const st = { lives: LMAX, seeds: Math.round((140 + tdMeta('semillas') * 25 + D.sb * 40 + (INF ? 0 : Math.min(MI, 150) * 1.2 + Math.max(0, MI - 300) * 0.5)) * (mk === 'pobre' ? 0.55 : 1)), wave: 0, phase: 'build', countdown: 0, queue: [], spawnT: 0, en: [], tw: [], pr: [], parts: [], floats: [], rings: [], bolts: [], fly: [], wx: [], t: 0, speed: 1, sel: null, build: null, aim: null, cd: { a: 0, r: 0, trueno: 0, helada: 0, cosecha: 0 }, rush: 0, treeHit: 0, hurt: 0, eid: 0, killed: 0, t0: Date.now(), over: false, last: performance.now(), id: 0, spawned: 0, banner: null, shake: 0, pk: { dmg: 0, rate: 0, rng: 0, int: 0, bot: 0, pw: 0, cri: 0, bar: 0, esp: 0, esc: 0, bel: 0, ven: 0 }, picked: [], chests: [], ev: [], ct: 6, et: 7, mt: 9, choosing: false };
  for (const k of PW) st.cd[k] ||= 0;
  const dmgMul = () => 1 + tdMeta('dano') * 0.06 + st.pk.dmg + (INF ? 0 : Math.max(0, MI - 300) * 0.0012); // v5: savia de los mundos nuevos
  const rngMul = mk === 'niebla' ? 0.85 : 1;
  const costOf = (k, l) => Math.round(TD_TW[k].cost[l] * (1 - tdMeta('barato') * 0.05 - st.pk.bar));
  const specCost = (k) => Math.round(costOf(k, 3) * 1.3);
  const spentOf = (t) => { let s = 0; for (let l = 0; l <= t.lvl; l++) s += costOf(t.k, l); if (t.spec) s += specCost(t.k); return s; };
  const sellOf = (t) => Math.round(spentOf(t) * (st.pk.ven ? 1 : tdMeta('venta') ? 0.85 : 0.7));
  const pwF = () => 1 - Math.min(0.7, tdMeta('poder') * 0.12 + st.pk.pw); const cdA = () => 25 * pwF(), cdR = () => 35 * pwF();
  const towerAt = (x, y) => st.tw.find((t) => t.x === x && t.y === y);
  const RNG = (t) => TD_TW[t.k].rng[t.lvl] * rngMul * (1 + (D.up[t.k] || 0) * 0.02) * (1 + st.pk.rng) * (fert.has(key(t.x, t.y)) ? 1.1 : 1) * (tb(t) === 'ardilla' && t.spec === 2 ? 1.5 : 1);
  const recalcBuff = () => { for (const t of st.tw) { t.bm = 1; for (const a of st.tw) { if (tb(a) !== 'arbol' || a === t) continue; if (Math.hypot(a.x - t.x, a.y - t.y) <= TD_TW[a.k].rng[a.lvl] + 0.01) t.bm += TD_TW[a.k].buff[a.lvl] + (a.spec === 1 ? 0.6 : 0); } if (fert.has(key(t.x, t.y))) t.bm += 0.3; } };
  const float = (text, x, y, col, big) => { if (st.floats.length < 40) st.floats.push({ text, x, y, t: 0, col: col || '#fff', big }); };
  const puff = (x, y, col, n, sp = 2) => { const cap = low() ? 70 : 180; for (let i = 0; i < n && st.parts.length < cap; i++) { const a = Math.random() * 6.28, v = sp * (0.3 + Math.random()); st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, l: 0.4 + Math.random() * 0.4, c: col, r: 1.5 + Math.random() * 2.5 }); } };
  const ring = (x, y, r1, col, T2 = 0.4) => { if (st.rings.length < 20) st.rings.push({ x, y, r1, col, t: 0, T: T2 }); };
  const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* */ } };
  // clima del mundo
  for (let i = 0; i < (low() ? 8 : W.fx === 'lluvia' ? 40 : 22); i++) st.wx.push({ x: Math.random() * TD_COLS, y: Math.random() * TD_ROWS, s: 0.5 + Math.random(), ph: Math.random() * 6 });

  /* --- oleadas --- */
  const BOSSES = TD_BOSSES;
  const lvlAt = (w) => (INF ? 15 + w * 0.5 : MI);
  function poolAt(w) {
    const lvl = lvlAt(w); const pool = [['escarabajo', 5]];
    if (w >= 3 || lvl >= 1) pool.push(['hormiga', 3]);
    if (w >= 5 || lvl >= 2) pool.push(['caracol', 2]);
    if (w >= 6 || lvl >= 3) pool.push(['polilla', 2.5]);
    if (lvl >= 4 && w >= 4) pool.push(['topo', 2]);
    if (lvl >= 5 && w >= 3) pool.push(['avispa', 2]);
    if (lvl >= 6 && w >= 5) pool.push(['escudo', 2.2]);
    if (lvl >= 7 && w >= 6) pool.push(['sanadora', 1.2]);
    if (lvl >= 8 && w >= 4) pool.push(['ladron', 1.6]);
    if (lvl >= 9 && w >= 5) pool.push(['gusano', 2]);
    if (lvl >= 11 && w >= 5) pool.push(['ciempies', 1.6]);
    if (lvl >= 12 && w >= 4) pool.push(['cuervo', 2]);
    if (lvl >= 15 && w >= 6) pool.push(['rino', 1.6]);
    if (lvl >= 18 && w >= 7) pool.push(['fantasma', 1.6]);
    const lvE = INF ? 300 + w * 8 : lvl; if (lvE >= 300) { for (const p of pool) p[1] *= 0.3; for (const k of TD_EN5) { const E = TD_EN[k]; if (lvE >= E.lv && w >= E.w0) pool.push([k, E.wt]); } }
    return pool;
  }
  const viable = (th, w) => !th.k || th.k.filter((k) => poolAt(w).some((p) => p[0] === k)).length >= 2;
  const themeCache = {};
  function themeFor(w) {
    if (w <= 2) return TD_THEMES[0]; if (themeCache[w]) return themeCache[w];
    let prev = TD_THEMES.indexOf(themeFor(w - 1)); let h = (((INF ? 99 : MI) + 3) * 2654435761 + w * 40503 + 17) >>> 0; h ^= h >>> 13; h = Math.imul(h, 1274126177) >>> 0; h = (h ^ (h >>> 15)) >>> 0;
    let id = h % TD_THEMES.length; for (let n = 0; n < TD_THEMES.length && (id === prev || !viable(TD_THEMES[id], w)); n++) id = (id + 1) % TD_THEMES.length;
    return (themeCache[w] = TD_THEMES[id]);
  }
  function makeWave(w) {
    const lvl = lvlAt(w); const th = themeFor(w); let pool = poolAt(w);
    if (th.k) pool = pool.filter((p) => th.k.includes(p[0]));
    const tot = pool.reduce((a, p) => a + p[1], 0); const pick = () => { let r = Math.random() * tot; for (const [k, wt] of pool) { r -= wt; if (r <= 0) return k; } return pool[0][0]; };
    let n = Math.max(5, Math.round((6 + w * 1.25 + Math.min(lvl, 20) * 0.45) * th.nm)); if (mk === 'enjambre') n *= 2;
    const gap = Math.max(0.28, 0.95 - w * 0.02) * th.gm * (mk === 'enjambre' ? 0.55 : 1);
    const q = []; let t = 0; const swarm = w > 3 && !th.k && Math.random() < 0.25 ? pick() : null;
    for (let i = 0; i < n; i++) { q.push({ k: swarm && i % 2 ? swarm : pick(), t }); t += gap * (0.6 + Math.random() * 0.8); }
    const amb = TW.has('emboscada') && w % 3 === 0; if (amb) { for (let i = 0; i < 4 + Math.floor(w / 6); i++) q.push({ k: pick(), t: 3 + i * 0.8, mid: true }); q.sort((a, b) => a.t - b.t); }
    const every = mk === 'jefes' ? 5 : 10;
    if (M.kind === 'jefes') { if (w % 4 === 0) q.push({ k: BOSSES[(w / 4 + MI) % (M.w + 1)], t: t + 1.5 }); }
    else if (M.kind === 'final' && w === WAVES) { q.push({ k: TD_WORLDS[M.w].boss, t: t + 1.5 }); q.push({ k: BOSSES[(M.w + BOSSES.length - 1) % BOSSES.length], t: t + 5 }); }
    else { const boss = (!INF && ((w % every === 0 && w >= every) || w === WAVES)) || (INF && w >= 10 && w % 5 === 0); if (boss) q.push({ k: INF ? BOSSES[(w / 5) % BOSSES.length] : TD_WORLDS[M.w].boss, t: t + 1.5 }); }
    const hpMul = (1 + 0.13 * w + 0.009 * w * w) * tdDiff(lvl) * th.hm * (mk === 'enjambre' ? 0.55 : 1);
    return { q, hpMul, th, amb };
  }
  let WV = null;
  function startWave() {
    if (st.phase !== 'build' || st.over) return;
    if (st.wave > 0 && st.countdown > 0) { const b = Math.ceil(st.countdown); st.seeds += b; float(`+${b} 🌰 por adelantarte`, TD_COLS / 2, 1.5, '#ffe066'); }
    st.wave++; WV = makeWave(st.wave); st.queue = WV.q.slice(); st.spawnT = 0; st.phase = 'wave'; st.spawned = 0;
    const bossK = WV.q.find((x) => TD_EN[x.k].boss); st.banner = { text: `Oleada ${st.wave}`, sub: bossK ? `⚠️ ¡Viene ${TD_EN[bossK.k].n}!` : st.wave === WAVES ? '¡Última oleada!' : WV.th.n + (WV.amb ? ' · ¡Emboscada!' : ''), t: 0, boss: !!bossK };
    TDS.wave(); if (bossK) setTimeout(() => { if (wrap.isConnected) TDS.boss(); }, 900);
    hud();
  }
  function spawn(k, mid) {
    const E = TD_EN[k]; const pi = st.spawned++ % PATHS.length; const hp = Math.round(E.hp * (WV ? WV.hpMul : 1)); const d0 = mid ? PATHS[pi].L * 0.55 : 0;
    st.en.push({ id: ++st.eid, k, hp, max: hp, pi, d: d0, pj: !!(PORT && d0 / PATHS[pi].L > PORT.a), slowT: 0, slowK: 0, dotT: 0, dotD: 0, rootT: 0, frz: 0, under: false, burT: 2 + Math.random() * 2, healT: 2, powT: 3 + Math.random() * 2, chT: 3 + Math.random() * 2, chg: 0, sh: E.shield ? hp * E.shield : 0, x: 0, y: 0, dir: 1, dead: false, hit: 0, rev: false });
  }
  function spawnAt(k, e, n, f) { for (let i = 0; i < n; i++) { spawn(k); const m = st.en[st.en.length - 1]; m.pi = e.pi; m.d = Math.max(0, e.d - 0.3 * i); m.hp = m.max = Math.max(1, Math.round(TD_EN[k].hp * (WV ? WV.hpMul : 1) * f)); } }
  const armorOf = (E) => Math.max(E.armor || 0, mk === 'blindados' && !E.boss ? 0.2 : 0);
  function damage(e, amt, pierce, t) {
    if (e.dead || e.under) return; const E = TD_EN[e.k]; if (e.inv > 0) { if (Math.random() < 0.08 && !low()) float('🛡️', e.x, e.y - 0.6, '#ffe066'); return; }
    const X5 = t ? TD_TW[t.k].fx : null; if (X5) { if (X5.mark) e.markU = st.t + 3; if (X5.pierce) pierce = true; if (X5.boss && E.boss) amt *= X5.boss; if (X5.fly && E.fly) amt *= X5.fly; } if (t) e.lastT = t;
    const cc = tdMeta('critico') * 0.05 + st.pk.cri + (t && tb(t) === 'ardilla' && t.spec === 2 ? 0.25 : 0);
    if (cc && Math.random() < cc) { amt *= t && t.spec === 2 && tb(t) === 'ardilla' ? 3 : 2; if (!low()) float('¡Crítico!', e.x, e.y - 0.5, '#ffd23c'); TDS.crit(); }
    const ar = armorOf(E); if (ar && !pierce) amt *= 1 - ar;
    if (e.sh > 0) { const a = Math.min(e.sh, amt); e.sh -= a; amt -= a; if (e.sh <= 0) { ring(e.x, e.y, 0.6, '#9fd0ff', 0.3); puff(e.x, e.y, '#bfe3ff', 8, 2); } }
    if (e.markU > st.t) amt *= 1.25;
    e.hp -= amt; e.hit = 0.1;
    if (X5 && e.hp > 0) { const lm = 1 + t.lvl * 0.5; if (X5.burn) { e.dotT = Math.max(e.dotT, 2); e.dotD = Math.max(e.dotD, X5.burn * lm * dmgMul()); } if (X5.slow) { e.slowT = Math.max(e.slowT, 1); e.slowK = Math.max(e.slowK, X5.slow); } if (X5.stun && !E.boss && Math.random() < X5.stun) e.frz = Math.max(e.frz, 0.7); if (X5.knock && !E.boss) e.d = Math.max(0, e.d - X5.knock); if (X5.exe && !E.boss && e.hp < e.max * X5.exe) { if (!low()) float('¡Remate!', e.x, e.y - 0.5, '#ff8a8a'); e.hp = 0; } }
    if (e.hp <= 0) kill(e);
  }
  function kill(e) {
    if (e.dead) return; e.dead = true; const E = TD_EN[e.k]; const rew = Math.round(E.rew * (1 + (INF ? 0.3 : MI * 0.004)) * (1 + tdMeta('botin') * 0.1 + st.pk.bot) * (mk === 'pobre' ? 1.4 : 1) * (st.goldT > 0 ? 3 : 1)); st.seeds += rew; st.killed++;
    { const XT = e.lastT && TD_TW[e.lastT.k] && TD_TW[e.lastT.k].fx; if (XT && XT.cash) { st.seeds += XT.cash; if (!low() && Math.random() < 0.25) float(`+${XT.cash} 🧲`, e.x, e.y - 0.3, '#ffd23c'); } }
    puff(e.x, e.y, E.c, E.boss ? 50 : 9, E.boss ? 4.5 : 2.2); ring(e.x, e.y, E.boss ? 2.5 : 0.7, E.boss ? '#ffd23c' : 'rgba(255,255,255,.8)', E.boss ? 0.7 : 0.3); TDS.pop(E.boss);
    if (E.boss) { D.bossK[e.k] = 1; float(`¡${E.n} vencido! +${rew} 🌰`, e.x, e.y - 0.6, '#ffe066', true); st.shake = 0.8; st.flash = 0.5; vib([40, 40, 80]); }
    if (st.fly.length < 14) { const p = { x: V.ox + e.x * V.T, y: V.oy + e.y * V.T }; st.fly.push({ ...p, sx: p.x, sy: p.y, t: 0 }); }
    if (E.split) for (const o of (E.split === 3 ? [-0.35, 0, 0.35] : [-0.25, 0.25])) { const hp = Math.round(TD_EN[E.splitK || 'gusito'].hp * (WV ? WV.hpMul : 1) * (E.boss ? 0.6 : 1)); st.en.push({ id: ++st.eid, k: E.splitK || 'gusito', hp, max: hp, pi: e.pi, d: Math.max(0, e.d + o), slowT: 0, slowK: 0, dotT: 0, dotD: 0, rootT: 0, frz: 0, under: false, burT: 9, healT: 9, powT: 9, chT: 9, chg: 0, sh: 0, x: e.x, y: e.y, dir: e.dir, dead: false, hit: 0 }); }
    TDS.coin();
  }

  /* --- torres --- */
  const dist = (t, e) => Math.hypot(e.x - (t.x + 0.5), e.y - (t.y + 0.5));
  function canSee(t, e) { const E = TD_EN[e.k]; if (!E.ghost) return true; return tb(t) === 'buho' || dist(t, e) <= 1.3; }
  function targets(t, rng, air, n) {
    const arr = [];
    for (const e of st.en) { if (e.dead || e.under) continue; if (TD_EN[e.k].fly && !air) continue; if (dist(t, e) > rng || !canSee(t, e)) continue; const rem = PATHS[e.pi].L - e.d; arr.push({ e, v: t.mode === 'fuerte' ? e.hp : t.mode === 'ultimo' ? rem : -rem }); }
    arr.sort((a, b) => b.v - a.v); return arr.slice(0, n || 1).map((x) => x.e);
  }
  function towerTick(t, dt) {
    if (t.born > 0) t.born -= dt;
    if (t.stun > 0) { t.stun -= dt; return; }
    const K = TD_TW[t.k], L = t.lvl, mul = dmgMul() * (t.bm || 1) * (1 + (D.up[t.k] || 0) * 0.07), rng = RNG(t);
    if (K.support) return;
    const B6 = tb(t); const rate6 = () => (K.rate ? K.rate[L] : 1) * (1 - Math.min(0.5, st.pk.rate));
    if (B6 === 'aura') { for (const e of st.en) { if (e.dead || e.under || (TD_EN[e.k].fly && !K.air) || dist(t, e) > rng || !canSee(t, e)) continue; damage(e, K.dps[L] * mul * dt * (t.spec === 2 ? 1.6 : 1), false, t); if (t.spec === 1) { e.slowT = 0.3; e.slowK = Math.max(e.slowK, 0.3); } } t.cd -= dt; if (t.cd <= 0) { t.cd = 1.4; ring(t.x + 0.5, t.y + 0.5, rng, `rgba(${K.rgb || '255,220,120'},.45)`, 0.6); } return; }
    if (B6 === 'mina') { st.mines ||= []; t.cd -= dt; if (t.cd > 0) return; const cap = (3 + L) * (t.spec === 2 ? 2 : 1); if (st.mines.filter((m) => m.t === t).length >= cap) { t.cd = 0.5; return; } const cells = pathArr.filter((c) => Math.hypot((c % 100) + 0.5 - (t.x + 0.5), Math.floor(c / 100) + 0.5 - (t.y + 0.5)) <= rng && !st.mines.some((m) => m.c === c)); if (!cells.length) { t.cd = 1; return; } const c = cells[(Math.random() * cells.length) | 0]; st.mines.push({ c, x: (c % 100) + 0.5, y: Math.floor(c / 100) + 0.5, dmg: K.dmg[L] * mul, area: K.area[L] * (t.spec === 1 ? 1.7 : 1), t, em: K.em }); t.cd = rate6(); t.kick = 0.12; return; }
    if (B6 === 'global') { t.cd -= dt; if (t.cd > 0) return; const pool = st.en.filter((e) => !e.dead && !e.under && (!TD_EN[e.k].fly || K.air) && !TD_EN[e.k].ghost); if (!pool.length) return; pool.sort((a, b) => (t.mode === 'fuerte' ? b.hp - a.hp : t.mode === 'ultimo' ? (PATHS[b.pi].L - b.d) - (PATHS[a.pi].L - a.d) : (PATHS[a.pi].L - a.d) - (PATHS[b.pi].L - b.d))); t.cd = rate6(); t.kick = 0.15; TDS.shot('buho'); for (const e of pool.slice(0, t.spec === 1 ? 3 : 1)) { damage(e, K.dmg[L] * mul * (t.spec === 2 ? 1.8 : 1), false, t); st.bolts.push({ pts: [[e.x + 0.4, -0.6], [e.x - 0.2, e.y * 0.5], [e.x, e.y]], t: 0, c: K.c, w: 3 }); puff(e.x, e.y, K.c, low() ? 3 : 7, 2); } return; }
    if (B6 === 'linea') { t.cd -= dt; if (t.cd > 0) return; const e = targets(t, rng, K.air, 1)[0]; if (!e) return; t.cd = rate6(); t.kick = 0.12; TDS.shot('ardilla'); const sx = t.x + 0.5, sy = t.y + 0.5; const dl = Math.hypot(e.x - sx, e.y - sy) || 1; const ux = (e.x - sx) / dl, uy = (e.y - sy) / dl; const w = t.spec === 2 ? 0.6 : 0.35; for (const o of st.en) { if (o.dead || o.under || (TD_EN[o.k].fly && !K.air)) continue; const px = o.x - sx, py = o.y - sy; const al = px * ux + py * uy; if (al < 0 || al > rng + 0.3) continue; if (Math.abs(px * uy - py * ux) <= w) damage(o, K.dmg[L] * mul * (t.spec === 2 ? 1.5 : 1), t.spec === 1, t); } st.bolts.push({ pts: [[sx, sy], [sx + ux * rng, sy + uy * rng]], t: 0, c: K.c, w: t.spec === 2 ? 7 : 4 }); return; }
    if (tb(t) === 'trampa') { const cx = t.x + 0.5, cy = t.y + 0.5; for (const e of st.en) { if (e.dead || e.under || TD_EN[e.k].fly) continue; if (Math.hypot(e.x - cx, e.y - cy) <= 0.6) { damage(e, K.dps[L] * (t.spec === 2 ? 2 : 1) * mul * dt, false, t); if (t.spec === 1) { e.slowT = 0.3; e.slowK = Math.max(e.slowK, 0.45); } if (Math.random() < dt * 6 && !low()) puff(e.x, e.y, '#7aa83a', 1, 1); } } return; }
    if (tb(t) === 'pino' && t.spec === 2) { for (const e of st.en) if (!e.dead && dist(t, e) <= rng) { e.slowT = 0.25; e.slowK = Math.max(e.slowK, 0.4); } }
    if (tb(t) === 'rayo') {
      let e = t.target && !t.target.dead && !t.target.under && dist(t, t.target) <= rng && canSee(t, t.target) ? t.target : null;
      if (!e) { e = targets(t, rng, 1)[0] || null; if (e !== t.target) t.ramp = 0; t.target = e; }
      const maxR = t.spec === 2 ? 6 : 3;
      if (e) { t.ramp = Math.min(maxR, (t.ramp || 0) + dt); damage(e, K.dps[L] * (1 + t.ramp) * mul * dt, true, t); t.extra = null; if (t.spec === 1) { t.extra = st.en.filter((o) => o !== e && !o.dead && !o.under && dist(t, o) <= rng && canSee(t, o)).slice(0, 2); for (const o of t.extra) damage(o, K.dps[L] * (1 + t.ramp) * 0.5 * mul * dt, true, t); } }
      return;
    }
    t.cd -= dt; if (t.cd > 0) return;
    if (tb(t) === 'pino') {
      const hit = st.en.filter((e) => !e.dead && !e.under && dist(t, e) <= rng); if (!hit.length) return;
      t.cd = K.rate[L] * (1 - Math.min(0.5, st.pk.rate)); t.kick = 0.15; TDS.shot('pino'); ring(t.x + 0.5, t.y + 0.5, rng, 'rgba(180,230,255,.9)', 0.45);
      for (const e of hit) { e.frz = Math.max(e.frz, t.spec === 1 ? 2.5 : K.frz[L]); damage(e, K.dmg[L] * mul, false, t); }
      if (!low()) puff(t.x + 0.5, t.y + 0.5, '#e8f8ff', 10, rng * 2);
      return;
    }
    const nT = tb(t) === 'ardilla' && t.spec === 1 ? 3 : tb(t) === 'tortuga' && t.spec === 2 ? 3 : 1;
    const ts = targets(t, rng, K.air, nT); if (!ts.length) return;
    const e = ts[0];
    t.cd = K.rate[L] * (1 - Math.min(0.5, st.pk.rate)) * (tb(t) === 'tortuga' && t.spec === 1 ? 1.3 : 1); t.kick = 0.12; TDS.shot(tb(t));
    const sx = t.x + 0.5, sy = t.y + 0.25;
    if (tb(t) === 'ardilla') for (const o of ts) st.pr.push({ k: 'flecha', x: sx, y: sy, e: o, dmg: K.dmg[L] * mul, sp: 13, t, pc: K.pc });
    else if (tb(t) === 'tortuga') for (const o of ts) st.pr.push({ k: 'bala', x0: sx, y0: sy, x1: o.x, y1: o.y, t: 0, T: 0.55, dmg: K.dmg[L] * mul * (t.spec === 1 ? 1.3 : 1), area: K.area[L] * (t.spec === 1 ? 1.8 : 1), tw: t, pc: K.pc });
    else if (tb(t) === 'abejas') { const nb = K.nb[L] + (t.spec === 1 ? 3 : 0); for (let i = 0; i < nb; i++) st.pr.push({ k: 'abeja', x: sx + (Math.random() - 0.5) * 0.4, y: sy, e, dmg: K.dmg[L] * mul * (t.spec === 2 ? 1.6 : 1), pierce: t.spec === 2, sp: 6 + Math.random(), life: 3, ph: Math.random() * 6, t, pc: K.pc }); }
    else if (tb(t) === 'hongo') { const ax = e.x, ay = e.y; for (const o of st.en) { if (o.dead || o.under) continue; if (Math.hypot(o.x - ax, o.y - ay) <= K.area[L]) { o.dotT = 2.5; o.dotD = Math.max(o.dotD, K.dot[L] * mul * (t.spec === 1 ? 2 : 1)); o.slowT = 1.6; o.slowK = Math.max(o.slowK, t.spec === 2 ? 0.7 : K.slow[L]); } } st.pr.push({ k: 'nube', x: ax, y: ay, t: 0, r: K.area[L], c: t.spec === 1 ? '120,220,80' : t.spec === 2 ? '140,110,60' : '200,120,220' }); }
    else if (tb(t) === 'buho') {
      const n = t.spec === 1 ? 9 : K.ch[L]; let cur = e; const hitS = new Set([e]); const pts = [[sx, sy - 0.2], [e.x, e.y]]; let dmg = K.dmg[L] * mul * (t.spec === 2 ? 1.8 : 1);
      damage(e, dmg, true, t); if (t.spec === 2) { e.slowT = 1; e.slowK = Math.max(e.slowK, 0.3); }
      for (let i = 1; i < n; i++) { let nx = null, bd = 1.8; for (const o of st.en) { if (o.dead || o.under || hitS.has(o)) continue; const dd = Math.hypot(o.x - cur.x, o.y - cur.y); if (dd < bd) { bd = dd; nx = o; } } if (!nx) break; hitS.add(nx); pts.push([nx.x, nx.y]); dmg *= 0.85; damage(nx, dmg, true, t); cur = nx; }
      st.bolts.push({ pts, t: 0, c: t.spec === 2 ? '#ffe066' : '#c8a8ff' });
    }
  }

  /* --- jefes --- */
  function bossPower(e, dt) {
    const E = TD_EN[e.k]; if (!E.pow) return; if (e.inv > 0) e.inv -= dt; if (e.undT > 0) { e.undT -= dt; if (e.undT <= 0) { e.under = false; puff(e.x, e.y, '#8a6a4a', 12, 2); } } e.powT -= dt; if (e.powT > 0) return;
    let P = E.pow; if (P === 'todo') P = TD_TODO[(Math.floor(st.t * 3) + e.id) % TD_TODO.length];
    if (P === 'salto') { e.powT = 4; e.d += 1.6; ring(e.x, e.y, 1.6, 'rgba(120,200,80,.9)', 0.5); st.shake = 0.3; TDS.bpow(); }
    else if (P === 'hielo') { e.powT = 5; let n = 0; for (const t of st.tw) if (Math.hypot(t.x + 0.5 - e.x, t.y + 0.5 - e.y) <= 2) { t.stun = 2.2; t.stunK = 'hielo'; n++; } ring(e.x, e.y, 2, 'rgba(180,230,255,.95)', 0.6); TDS.bpow(); if (n) float('¡Congeló tus torres!', e.x, e.y - 0.8, '#bfe3ff'); }
    else if (P === 'fuego') { e.powT = 4; let b = null, bd = 3; for (const t of st.tw) { const dd = Math.hypot(t.x + 0.5 - e.x, t.y + 0.5 - e.y); if (dd < bd) { bd = dd; b = t; } } if (b) { b.stun = 3; b.stunK = 'fuego'; st.bolts.push({ pts: [[e.x, e.y], [b.x + 0.5, b.y + 0.5]], t: 0, c: '#ff7a1f', w: 5 }); puff(b.x + 0.5, b.y + 0.5, '#ff7a1f', 14, 2.5); TDS.bpow(); } }
    else if (P === 'cria') { e.powT = 3; for (let i = 0; i < 2; i++) { spawn('polilla'); const n = st.en[st.en.length - 1]; n.pi = e.pi; n.d = Math.max(0, e.d - 0.3 * i); n.hp = n.max = Math.round(TD_EN.polilla.hp * (WV ? WV.hpMul : 1) * 0.6); } TDS.bpow(); }
    else if (P === 'veneno') { e.powT = 5; const ts = st.tw.filter((t) => tb(t) !== 'trampa').sort((a, b) => Math.hypot(a.x + 0.5 - e.x, a.y + 0.5 - e.y) - Math.hypot(b.x + 0.5 - e.x, b.y + 0.5 - e.y)).slice(0, 2); for (const t of ts) { t.stun = 2; t.stunK = 'veneno'; st.bolts.push({ pts: [[e.x, e.y], [t.x + 0.5, t.y + 0.5]], t: 0, c: '#8ad83a', w: 3 }); } if (ts.length) TDS.bpow(); }
    else if (P === 'escudo') { e.powT = 6; e.inv = 1.8; ring(e.x, e.y, 1, 'rgba(255,220,90,.95)', 0.4); TDS.bpow(); }
    else if (P === 'acelera') { e.powT = 7; st.rush = 3; ring(e.x, e.y, 2.5, 'rgba(120,230,140,.9)', 0.6); float('¡Corran!', e.x, e.y - 0.8, '#9dff9d'); TDS.bpow(); }
    else if (P === 'cura') { e.powT = 6; for (const o of st.en) if (!o.dead) { o.hp = Math.min(o.max, o.hp + o.max * 0.12); } ring(e.x, e.y, 3, 'rgba(150,255,170,.9)', 0.6); puff(e.x, e.y, '#9dff9d', 14, 3); TDS.bpow(); }
    else if (P === 'invoca') { e.powT = 5; for (let i = 0; i < 3; i++) { const mk2 = E.minion || 'cuervo'; spawn(mk2); const n = st.en[st.en.length - 1]; n.pi = e.pi; n.d = Math.max(0, e.d - 0.3 * i); n.hp = n.max = Math.round(TD_EN[mk2].hp * (WV ? WV.hpMul : 1) * 0.5); } TDS.bpow(); }
    else if (P === 'apaga') { e.powT = 5.5; let n = 0; for (const t of st.tw) if (Math.hypot(t.x + 0.5 - e.x, t.y + 0.5 - e.y) <= 2.2) { t.stun = 1.6; t.stunK = 'rayo'; n++; } ring(e.x, e.y, 2.2, 'rgba(170,120,255,.95)', 0.5); st.flash = 0.2; if (n) TDS.bpow(); }
    else if (P === 'rayo') { e.powT = 4.5; const near = st.tw.filter((t) => Math.hypot(t.x + 0.5 - e.x, t.y + 0.5 - e.y) <= 3); if (near.length) { const b = near[(Math.random() * near.length) | 0]; b.stun = 2.5; b.stunK = 'rayo'; st.bolts.push({ pts: [[e.x, e.y - 0.5], [(e.x + b.x + 0.5) / 2 + 0.3, (e.y + b.y) / 2], [b.x + 0.5, b.y + 0.5]], t: 0, c: '#ffe066', w: 4 }); st.flash = 0.3; TDS.bpow(); } }
    else if (P === 'tinta') { e.powT = 5.5; let n = 0; for (const t of st.tw) if (Math.hypot(t.x + 0.5 - e.x, t.y + 0.5 - e.y) <= 2.6) { t.stun = 1.6; t.stunK = 'rayo'; n++; } ring(e.x, e.y, 2.6, 'rgba(60,30,80,.9)', 0.6); puff(e.x, e.y, '#3a2a4a', 18, 3); if (n) { float('¡Tinta!', e.x, e.y - 0.8, '#c8a0ff'); TDS.bpow(); } }
    else if (P === 'corte') { e.powT = 5; const ts = st.tw.filter((t) => tb(t) !== 'trampa').sort((a, b) => Math.hypot(a.x + 0.5 - e.x, a.y + 0.5 - e.y) - Math.hypot(b.x + 0.5 - e.x, b.y + 0.5 - e.y)).slice(0, 3); for (const t of ts) { t.stun = 2; t.stunK = 'veneno'; st.bolts.push({ pts: [[e.x, e.y], [t.x + 0.5, t.y + 0.5]], t: 0, c: '#b8ff6a', w: 3 }); } if (ts.length) TDS.bpow(); }
    else if (P === 'muro') { e.powT = 6; for (const o of st.en) if (!o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) <= 2.5) o.sh = Math.max(o.sh, o.max * 0.35); ring(e.x, e.y, 2.5, 'rgba(150,200,255,.9)', 0.6); TDS.bpow(); }
    else if (P === 'tele') { e.powT = 5; ring(e.x, e.y, 1, 'rgba(190,120,255,.95)', 0.4); puff(e.x, e.y, '#c8a0ff', 12, 2.5); e.d = Math.min(PATHS[e.pi].L - 1, e.d + 2.2); e.inv = 0.6; TDS.bpow(); }
    else if (P === 'aullido') { e.powT = 7; st.rush = 3.5; ring(e.x, e.y, 3, 'rgba(255,170,80,.9)', 0.6); float('¡Auuuu!', e.x, e.y - 0.8, '#ffc078'); TDS.bpow(); }
    else if (P === 'clon') { e.powT = 6; const pl = poolAt(Math.max(st.wave, 6)).map((p) => p[0]); for (let i = 0; i < 4; i++) spawnAt(pl[(Math.random() * pl.length) | 0], e, 1, 0.7); ring(e.x, e.y, 1.2, 'rgba(200,200,220,.9)', 0.4); TDS.bpow(); }
    else if (P === 'bombas') { e.powT = 6; const ts = st.tw.filter((t) => tb(t) !== 'trampa').sort(() => Math.random() - 0.5).slice(0, 3); for (const t of ts) st.ev.push({ k: 'met', x: t.x + 0.5, y: t.y + 0.5, t: 0, T: 1.4 }); if (ts.length) TDS.bpow(); }
    else if (P === 'tiempo') { e.powT = 8; for (const t of st.tw) { t.stun = Math.max(t.stun || 0, 1.2); t.stunK = 'hielo'; } st.flash = 0.3; ring(e.x, e.y, 6, 'rgba(255,230,150,.9)', 0.7); float('¡Tiempo detenido!', e.x, e.y - 0.8, '#ffe066'); TDS.bpow(); }
    else if (P === 'excava') { e.powT = 6; e.under = true; e.undT = 1.6; puff(e.x, e.y, '#8a6a4a', 14, 2); TDS.bpow(); }
    else if (P === 'sombra') { e.powT = 6; e.inv = 1.5; ring(e.x, e.y, 1.2, 'rgba(40,30,60,.9)', 0.5); puff(e.x, e.y, '#4a3a6a', 12, 2); TDS.bpow(); }
  }

  /* --- poderes --- */
  function cast(kind, x, y) {
    if (kind === 'a') { st.cd.a = cdA(); TDS.acorn(); st.pr.push({ k: 'bellotas', x, y, t: 0 }); }
    else { st.cd.r = cdR(); TDS.root(); for (const e of st.en) if (!e.dead && Math.hypot(e.x - x, e.y - y) <= 1.5 && !TD_EN[e.k].fly) e.rootT = TD_EN[e.k].boss ? 1.5 : 3; st.pr.push({ k: 'raiz', x, y, t: 0 }); ring(x, y, 1.5, 'rgba(120,80,40,.8)', 0.5); }
    st.aim = null; hint(''); paintPow();
  }

  /* --- eventos de los giros --- */
  function freeCell() { for (let i = 0; i < 40; i++) { const x = (rnd() * TD_COLS) | 0, y = (rnd() * TD_ROWS) | 0; if (!blocked.has(key(x, y)) && !pathCells.has(key(x, y)) && !towerAt(x, y) && !st.chests.some((c) => c.x === x && c.y === y)) return [x, y]; } return null; }
  function twistTick(dt) {
    if (!TW.size) return;
    const wave = st.phase === 'wave';
    if (TW.has('lluvia') && wave) { st.et -= dt; if (st.et <= 0) { st.et = 6 + Math.random() * 3; const c = st.en.filter((e) => !e.dead && !e.under); if (c.length) { const e = c[(Math.random() * c.length) | 0]; st.ev.push({ k: 'star', x: e.x, y: e.y, t: 0, T: 0.9 }); } } }
    if (TW.has('meteoros') && wave) { st.mt -= dt; if (st.mt <= 0) { st.mt = 11 + Math.random() * 4; const ts = st.tw.filter((t) => tb(t) !== 'trampa'); if (ts.length) { const t = ts[(Math.random() * ts.length) | 0]; st.ev.push({ k: 'met', x: t.x + 0.5, y: t.y + 0.5, t: 0, T: 1.8 }); TDS.bpow(); } } }
    if (TW.has('cofres')) { st.ct -= dt; if (st.ct <= 0 && st.chests.length < 2) { st.ct = 8 + Math.random() * 4; const c = freeCell(); if (c) st.chests.push({ x: c[0], y: c[1], life: 7, v: 22 + st.wave * 4 }); } }
    for (const c of st.chests) c.life -= dt; st.chests = st.chests.filter((c) => c.life > 0);
    for (const v of st.ev) {
      v.t += dt; if (v.t < v.T) continue; v.done = true;
      if (v.k === 'star') { ring(v.x, v.y, 1.4, 'rgba(255,230,120,.95)', 0.5); puff(v.x, v.y, '#ffe066', low() ? 8 : 18, 3.5); TDS.crit(); for (const e of st.en) if (!e.dead && Math.hypot(e.x - v.x, e.y - v.y) <= 1.4) damage(e, 50 + st.wave * 7, true); }
      else { ring(v.x, v.y, 1.2, 'rgba(255,110,40,.95)', 0.5); puff(v.x, v.y, '#ff7a1f', low() ? 10 : 24, 4); st.shake = 0.5; vib(50); TDS.boom(); for (const t of st.tw) if (Math.hypot(t.x + 0.5 - v.x, t.y + 0.5 - v.y) <= 1.1) { t.stun = 2.5; t.stunK = 'fuego'; } for (const e of st.en) if (!e.dead && Math.hypot(e.x - v.x, e.y - v.y) <= 1.2) damage(e, 60 + st.wave * 6, true); }
    }
    st.ev = st.ev.filter((v) => !v.done);
  }
  /* --- bendiciones --- */
  function paintChips() {
    const el = $w('#tdPk'); const tw = (M.tw || []).map((k) => `<button type="button" class="td-chip tw" data-d="${esc(TD_TWISTS[k].e + ' ' + TD_TWISTS[k].n + ': ' + TD_TWISTS[k].d)}">${TD_TWISTS[k].e}</button>`);
    const pk = st.picked.map((id) => { const p = TD_PERKS.find((x) => x.id === id); return `<button type="button" class="td-chip" data-d="${esc(p.e + ' ' + p.n + ': ' + p.d)}">${p.e}</button>`; });
    el.innerHTML = tw.concat(pk).join('');
  }
  function offerPerk() {
    if (st.over) return; st.choosing = true; closePanel();
    const pool = TD_PERKS.slice(); const three = []; while (three.length < 3 && pool.length) three.push(pool.splice((Math.random() * pool.length) | 0, 1)[0]);
    const el = $w('#tdPerk'); el.innerHTML = `<b>✨ Elige una bendición</b><span class="small">Dura hasta el final de la partida</span><div class="td-perk-row">${three.map((p) => `<button type="button" class="td-pcard" data-p="${p.id}"><i>${p.e}</i><b>${p.n}</b><span>${p.d}</span></button>`).join('')}</div>`;
    el.hidden = false; el.classList.add('show'); TDS.spec();
    el.onclick = (ev) => { const b = ev.target.closest('[data-p]'); if (!b) return; const p = TD_PERKS.find((x) => x.id === b.dataset.p); p.f(st.pk, st, LMAX); st.picked.push(p.id); el.hidden = true; el.classList.remove('show'); st.choosing = false; st.last = performance.now(); TDS.up(); float(`${p.e} ${p.n}`, TD_COLS / 2, 3, '#ffe066', true); paintChips(); hud(); };
  }
  /* --- paso de simulación --- */
  function step(dt) {
    st.t += dt; if (st.treeHit > 0) st.treeHit -= dt; if (st.hurt > 0) st.hurt -= dt; if (st.flash > 0) st.flash -= dt;
    st.cd.a = Math.max(0, st.cd.a - dt); st.cd.r = Math.max(0, st.cd.r - dt); for (const k of PW) st.cd[k] = Math.max(0, st.cd[k] - dt); if (st.goldT > 0) st.goldT -= dt;
    if (st.banner) { st.banner.t += dt; if (st.banner.t > 2.4) st.banner = null; }
    if (st.over) return;
    if (st.phase === 'build' && st.wave > 0) { st.countdown -= dt; if (st.countdown <= 0) startWave(); }
    if (st.phase === 'wave') { st.spawnT += dt; while (st.queue.length && st.queue[0].t <= st.spawnT) { const o = st.queue.shift(); spawn(o.k, o.mid); } }
    const spMod = (mk === 'rapidos' ? 1.3 : 1) * (M.kind === 'sprint' ? 1.25 : 1); if (st.rush > 0) st.rush -= dt;
    for (const e of st.en) {
      if (e.dead) continue; const E = TD_EN[e.k];
      if (e.hit > 0) e.hit -= dt;
      if (e.dotT > 0) { e.dotT -= dt; damage(e, e.dotD * dt, true); if (e.dead) continue; } else e.dotD = 0;
      if (st.pk.esp) { damage(e, e.max * st.pk.esp * dt * (E.boss ? 0.25 : 1), true); if (e.dead) continue; }
      if (e.slowT > 0) e.slowT -= dt; else e.slowK = 0;
      if (E.burrow) { e.burT -= dt; if (e.burT <= 0) { e.under = !e.under; e.burT = e.under ? 1.1 : 2.2 + Math.random() * 1.5; if (!low()) puff(e.x, e.y, '#8a6a4a', 5, 1.5); } }
      if (E.heal) { e.healT -= dt; if (e.healT <= 0) { e.healT = 2.2; for (const o of st.en) if (!o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 1.3) o.hp = Math.min(o.max, o.hp + o.max * 0.12); ring(e.x, e.y, 1.3, 'rgba(160,255,160,.8)', 0.4); } }
      if (E.charge) { if (e.chg > 0) { e.chg -= dt; if (!low() && Math.random() < dt * 20) puff(e.x, e.y + 0.2, '#c8b89a', 1, 1); } else { e.chT -= dt; if (e.chT <= 0) { e.chg = 0.8; e.chT = 3 + Math.random() * 2.5; } } }
      if (E.boss) bossPower(e, dt);
      if (E.regen && e.hp < e.max) e.hp = Math.min(e.max, e.hp + e.max * E.regen * dt);
      if (E.tough) { e.slowK = 0; e.frz = 0; }
      if (E.blink) { e.blT = (e.blT ?? 2 + Math.random() * 2) - dt; if (e.blT <= 0) { e.blT = 3 + Math.random() * 2; ring(e.x, e.y, 0.6, 'rgba(200,160,255,.9)', 0.3); if (!low()) puff(e.x, e.y, '#d8c0ff', 6, 1.5); e.d = Math.min(PATHS[e.pi].L - 0.5, e.d + 1.3); } }
      if (E.aura) { e.auT = (e.auT ?? 2) - dt; if (e.auT <= 0) { e.auT = 3.2; for (const o of st.en) if (!o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 1.4) o.sh = Math.max(o.sh, o.max * 0.25); ring(e.x, e.y, 1.4, 'rgba(150,200,255,.8)', 0.4); } }
      if (E.spawn) { e.spT = (e.spT ?? 3) - dt; if (e.spT <= 0) { e.spT = 3.6; spawnAt(E.spawn, e, 1, 1); } }
      let sp = E.sp * spMod * (st.rush > 0 && !E.boss ? 1.6 : 1) * (1 - e.slowK) * (e.chg > 0 ? 3 : 1) * (1 - Math.min(0.6, st.pk.esc)) * (E.rage && e.hp < e.max * 0.5 ? 1.7 : 1);
      if (mud.size && mud.has(key(Math.floor(e.x), Math.floor(e.y)))) sp *= 0.55;
      if (ZON && !E.fly) { const f = e.d / PATHS[e.pi].L; if (f > ZON.a && f < ZON.b) sp *= 1.7; }
      if (e.rootT > 0) { e.rootT -= dt; sp = 0; }
      if (e.frz > 0) { e.frz -= dt; sp = 0; }
      e.d += sp * dt;
      if (PORT && !e.pj && e.d >= PORT.a * PATHS[e.pi].L) { e.pj = true; const o = posAt(e.pi, e.d); ring(o.x, o.y, 0.9, 'rgba(190,120,255,.95)', 0.4); puff(o.x, o.y, '#c8a0ff', 8, 2); e.d = PORT.b * PATHS[e.pi].L; const n2 = posAt(e.pi, e.d); ring(n2.x, n2.y, 0.9, 'rgba(120,200,255,.95)', 0.4); }
      const p = posAt(e.pi, e.d); if (p.dx) e.dir = p.dx; e.x = p.x; e.y = p.y;
      if (e.d >= PATHS[e.pi].L && E.steal) { e.dead = true; const n = Math.min(Math.floor(st.seeds), 40 + st.wave * 3); st.seeds -= n; st.hurt = 0.3; TDS.no(); float(`−${n} 🌰 robadas`, tree[0] + 0.5, tree[1], '#ffb347', true); continue; }
      if (e.d >= PATHS[e.pi].L) { e.dead = true; const n = E.lives || 1; st.lives -= n; st.treeHit = 0.5; st.hurt = 0.6; TDS.hurt(); float(`−${n} ❤️`, tree[0] + 0.5, tree[1], '#ff6b6b', true); vib(E.boss ? [80, 40, 80] : 60); if (st.lives <= 0) { st.lives = 0; end(false); return; } }
    }
    st.en = st.en.filter((e) => !e.dead);
    for (const t of st.tw) { towerTick(t, dt); if (t.kick > 0) t.kick -= dt; }
    if (st.mines && st.mines.length) { for (const m of st.mines) { if (m.done) continue; for (const e of st.en) { if (e.dead || e.under || TD_EN[e.k].fly) continue; if (Math.hypot(e.x - m.x, e.y - m.y) < 0.45) { m.done = true; TDS.boom(); puff(m.x, m.y, '#ffb347', low() ? 8 : 16, 3); ring(m.x, m.y, m.area, 'rgba(255,190,90,.9)', 0.35); for (const o of st.en) if (!o.dead && !TD_EN[o.k].fly && Math.hypot(o.x - m.x, o.y - m.y) <= m.area) damage(o, m.dmg, false, m.t); break; } } } st.mines = st.mines.filter((m) => !m.done && st.tw.includes(m.t)); }
    for (const q of st.pr) {
      if (q.k === 'flecha' || q.k === 'abeja') {
        if (q.e.dead || q.e.under) { if (q.k === 'abeja') { let b = null, bd = 3; for (const e of st.en) { if (e.dead || e.under) continue; const dd = Math.hypot(e.x - q.x, e.y - q.y); if (dd < bd) { bd = dd; b = e; } } if (b) q.e = b; else q.done = true; } else q.done = true; }
        if (q.done) continue;
        const dx = q.e.x - q.x, dy = q.e.y - q.y, dd = Math.hypot(dx, dy);
        if (q.k === 'abeja') { q.life -= dt; q.ph += dt * 20; if (q.life <= 0) { q.done = true; continue; } }
        if (dd < 0.22) { const air = TD_EN[q.e.k].fly; damage(q.e, q.dmg * (q.k === 'abeja' && air ? 2 : 1), q.pierce, q.t); q.done = true; continue; }
        q.x += dx / dd * q.sp * dt; q.y += dy / dd * q.sp * dt; q.ang = Math.atan2(dy, dx);
      } else if (q.k === 'bala') { q.t += dt; if (q.t >= q.T) { q.done = true; TDS.boom(); puff(q.x1, q.y1, '#a89a8a', low() ? 5 : 10, 2.5); ring(q.x1, q.y1, q.area, 'rgba(255,230,180,.85)', 0.3); for (const e of st.en) if (!e.dead && (!TD_EN[e.k].fly || (q.tw && TD_TW[q.tw.k].air)) && Math.hypot(e.x - q.x1, e.y - q.y1) <= q.area) damage(e, q.dmg, false, q.tw); } }
      else if (q.k === 'nube') { q.t += dt; if (q.t > 0.8) q.done = true; }
      else if (q.k === 'bellotas') { q.t += dt; if (q.t >= 0.6 && !q.hit) { q.hit = true; st.shake = 0.5; vib(40); puff(q.x, q.y, '#8a5a2c', low() ? 14 : 30, 4); ring(q.x, q.y, 1.9, 'rgba(255,200,90,.95)', 0.5); const dmg = (60 + st.wave * 14) * dmgMul() * (1 + st.pk.bel); for (const e of st.en) if (!e.dead && Math.hypot(e.x - q.x, e.y - q.y) <= 1.7) damage(e, dmg, true); } if (q.t > 1) q.done = true; }
      else if (q.k === 'raiz') { q.t += dt; if (q.t > 3) q.done = true; }
    }
    st.pr = st.pr.filter((q) => !q.done);
    for (const p of st.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 3 * dt; } st.parts = st.parts.filter((p) => p.t < p.l);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 1.1);
    for (const r of st.rings) r.t += dt; st.rings = st.rings.filter((r) => r.t < r.T);
    for (const b of st.bolts) b.t += dt; st.bolts = st.bolts.filter((b) => b.t < 0.22);
    if (st.shake > 0) st.shake -= dt;
    if (st.phase === 'wave' && !st.queue.length && !st.en.length) {
      const bonus = 15 + st.wave * 2 + st.tw.filter((t) => tb(t) === 'arbol').reduce((a, t) => a + Math.round(TD_TW[t.k].seeds[t.lvl] * (t.spec === 2 ? 2.5 : 1)), 0);
      st.seeds += bonus; float(`Oleada superada · +${bonus} 🌰`, TD_COLS / 2, 2, '#ffe066', true); TDS.up();
      if (st.pk.int) { const ig = Math.min(40, Math.floor(st.seeds * st.pk.int)); if (ig > 0) { st.seeds += ig; float(`+${ig} 🌰 intereses`, TD_COLS / 2, 2.8, '#b8f08a'); } }
      if (TW.has('bendito') && st.wave % 3 === 0 && st.lives < LMAX) { st.lives++; float('+1 ❤️ bendición', tree[0] + 0.5, tree[1] - 0.5, '#ff9ab0', true); ring(tree[0] + 0.5, tree[1] + 0.5, 1.6, 'rgba(255,200,220,.95)', 0.6); }
      if (st.wave >= WAVES) { end(true); return; }
      st.phase = 'build'; st.countdown = 12; hud();
      if (st.wave % 5 === 0) offerPerk();
    }
    twistTick(dt);
  }
  const stepFx = (dt) => {
    for (const f of st.fly) f.t += dt * 1.6; st.fly = st.fly.filter((f) => f.t < 1);
    for (const p of st.wx) { const fx = W.fx; if (fx === 'arena') { p.x += dt * 1.2 * p.s; p.y += Math.sin(st.t * 2 + p.ph) * dt * 0.2; } else if (fx === 'burbuja') { p.y -= dt * 0.5 * p.s; p.x += Math.sin(st.t * 2 + p.ph) * dt * 0.3; } else if (fx === 'lluvia') { p.y += dt * 5 * p.s; p.x -= dt * 0.8; } else if (fx === 'hoja' || fx === 'petalo' || fx === 'hojao') { p.y += dt * 0.5 * p.s; p.x += Math.sin(st.t + p.ph) * dt * 0.4; } else if (fx === 'nieve') { p.y += dt * 0.7 * p.s; p.x += Math.sin(st.t * 0.8 + p.ph) * dt * 0.25; } else if (fx === 'brasa') { p.y -= dt * 0.6 * p.s; p.x += Math.sin(st.t * 2 + p.ph) * dt * 0.3; } else { p.x += Math.cos(st.t * 0.5 + p.ph) * dt * 0.2; p.y += Math.sin(st.t * 0.7 + p.ph) * dt * 0.2; }
      if (p.y > TD_ROWS + 0.5) { p.y = -0.5; p.x = Math.random() * TD_COLS; } if (p.y < -0.5) { p.y = TD_ROWS + 0.5; p.x = Math.random() * TD_COLS; } if (p.x < -0.5) p.x = TD_COLS + 0.4; if (p.x > TD_COLS + 0.5) p.x = -0.4; }
  };

  /* --- dibujo --- */
  const SX = (x) => V.ox + x * V.T, SY = (y) => V.oy + y * V.T;
  const ANIM = { abejas: 1, rayo: 1, pino: 1, hongo: 1 }; for (const k in TD_TW) if (TD_TW[k].em) ANIM[k] = 1;
  function drawTowerSpr(t, x, y, sc) {
    const T = V.T, B = 1.6 * T; const aimB = t.k === 'tortuga' ? Math.round(((t.aim || 0) + Math.PI) / (Math.PI / 8)) % 16 : 0; const fr = ANIM[t.k] ? Math.floor(st.t * 5) % 4 : 0;
    const cv = tdSpr(`t${t.k}|${t.lvl}|${t.spec || 0}|${aimB}|${fr}`, B, B, (q) => tdDrawTower(q, t.k, t.lvl, B / 2, B * 0.55, T, fr * 0.2, aimB * Math.PI / 8 - Math.PI, t.spec || 0));
    const w = B * sc; g.drawImage(cv, x - w / 2, y - B * 0.55 * sc, w, w);
  }
  function drawEnemySpr(e) {
    const E = TD_EN[e.k], T = V.T; const B = (E.boss ? 3 : 1.8) * T; const fr = Math.floor(st.t / 0.087 + e.id) % 6; const dr = e.dir < 0 ? -1 : 1;
    const cv = tdSpr(`e${e.k}|${fr}|${dr}`, B, B, (q) => tdDrawEnemy(q, { k: e.k, id: 0, dir: dr }, B / 2, B * 0.62, T, fr * 0.087));
    const bob = E.fly ? Math.sin(st.t * 3 + e.id) * T * 0.05 : 0;
    g.drawImage(cv, SX(e.x) - B / 2, SY(e.y) - B * 0.62 + bob, B, B);
  }
  function drawWx() {
    const fx = W.fx, T = V.T;
    for (const p of st.wx) {
      const X = SX(p.x), Y = SY(p.y);
      if (fx === 'arena') { g.fillStyle = 'rgba(200,160,90,.55)'; g.fillRect(X, Y, 2 + p.s * 4, 1.5); continue; }
      if (fx === 'burbuja') { g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.2; g.beginPath(); g.arc(X, Y, 2 + p.s * 2.5, 0, 7); g.stroke(); continue; }
      if (fx === 'lluvia') { g.strokeStyle = 'rgba(200,230,255,.55)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X, Y); g.lineTo(X - 3, Y + T * 0.3); g.stroke(); continue; }
      if (fx === 'hojao') { g.fillStyle = p.s > 1 ? 'rgba(220,90,30,.85)' : 'rgba(240,170,40,.85)'; g.save(); g.translate(X, Y); g.rotate(st.t * p.s + p.ph); g.beginPath(); g.ellipse(0, 0, T * 0.1, T * 0.06, 0, 0, 7); g.fill(); g.restore(); continue; }
      if (fx === 'estrella') { const a = 0.3 + 0.6 * Math.max(0, Math.sin(st.t * 2.5 + p.ph * 3)); g.fillStyle = `rgba(255,250,220,${a})`; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 1 : 3.2, an = i * Math.PI / 4; g.lineTo(X + Math.cos(an) * r, Y + Math.sin(an) * r); } g.fill(); continue; }
      if (fx === 'hoja') { g.fillStyle = 'rgba(120,170,60,.75)'; g.save(); g.translate(X, Y); g.rotate(st.t * p.s + p.ph); g.beginPath(); g.ellipse(0, 0, T * 0.1, T * 0.05, 0, 0, 7); g.fill(); g.restore(); }
      else if (fx === 'petalo') { g.fillStyle = 'rgba(255,170,210,.8)'; g.save(); g.translate(X, Y); g.rotate(st.t * p.s + p.ph); g.beginPath(); g.ellipse(0, 0, T * 0.08, T * 0.05, 0, 0, 7); g.fill(); g.restore(); }
      else if (fx === 'nieve') { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(X, Y, 1.5 + p.s * 1.3, 0, 7); g.fill(); }
      else if (fx === 'brasa') { g.fillStyle = `rgba(255,${120 + (p.s * 80) | 0},40,${0.5 + 0.4 * Math.sin(st.t * 6 + p.ph)})`; g.fillRect(X - 1.5, Y - 1.5, 3, 3); }
      else { const a = 0.35 + 0.5 * Math.max(0, Math.sin(st.t * 2.2 + p.ph * 3)); g.fillStyle = fx === 'luciernaga' ? `rgba(230,255,120,${a})` : `rgba(255,255,255,${a})`; g.beginPath(); g.arc(X, Y, fx === 'luciernaga' ? 2.4 : 1.8, 0, 7); g.fill(); if (!low()) { g.fillStyle = fx === 'luciernaga' ? `rgba(230,255,120,${a * 0.25})` : `rgba(255,240,255,${a * 0.2})`; g.beginPath(); g.arc(X, Y, 6, 0, 7); g.fill(); } }
    }
  }
  function draw() {
    const T = V.T; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    if (!BG) paintBG(); g.drawImage(BG, 0, 0, V.w, V.h);
    if (st.shake > 0) g.translate((Math.random() - 0.5) * st.shake * 12, (Math.random() - 0.5) * st.shake * 12);
    if (st.build) { const { x, y } = st.build; g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(SX(x), SY(y), T, T); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(SX(x) + 1, SY(y) + 1, T - 2, T - 2); }
    if (st.sel) { const t = st.sel; const r = RNG(t) * T; g.fillStyle = 'rgba(255,255,255,.13)'; g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.5; g.setLineDash([6, 5]); g.beginPath(); g.arc(SX(t.x + 0.5), SY(t.y + 0.5), r, 0, 7); g.fill(); g.stroke(); g.setLineDash([]); }
    for (const t of st.tw) if (tb(t) === 'pino' && t.spec === 2) { g.fillStyle = 'rgba(200,240,255,.12)'; g.beginPath(); g.arc(SX(t.x + 0.5), SY(t.y + 0.5), RNG(t) * T, 0, 7); g.fill(); }
    for (const q of st.pr) if (q.k === 'raiz') { const a = Math.min(1, (3 - q.t) * 2); g.strokeStyle = `rgba(90,60,30,${0.8 * a})`; g.lineWidth = 3; for (let i = 0; i < 8; i++) { const an = i * 0.785; g.beginPath(); g.moveTo(SX(q.x), SY(q.y)); g.quadraticCurveTo(SX(q.x + Math.cos(an) * 0.8), SY(q.y + Math.sin(an + 0.5) * 0.8), SX(q.x + Math.cos(an) * 1.5), SY(q.y + Math.sin(an) * 1.5)); g.stroke(); } }
    // guía para quien juega por primera vez: un dedo señala dónde poner la primera torre
    if (COACH && !st.tw.length) { const [cx, cy] = COACH; const X = SX(cx + 0.5), Y = SY(cy + 0.5), k = (Math.sin(st.t * 5) + 1) / 2; g.strokeStyle = `rgba(255,255,255,${0.5 + 0.5 * k})`; g.lineWidth = 3; g.beginPath(); g.arc(X, Y, T * (0.4 + 0.12 * k), 0, 7); g.stroke(); g.font = `${Math.round(T * 0.7)}px system-ui`; g.textAlign = 'center'; g.fillText('👆', X + T * 0.15, Y + T * (0.85 + 0.1 * k)); }
    // trampas (debajo de los enemigos)
    for (const t of st.tw) if (tb(t) === 'trampa') drawTowerSpr(t, SX(t.x + 0.5), SY(t.y + 0.5), 1);
    // el Gran Árbol
    { const X = SX(tree[0] + 0.5), Y = SY(tree[1] + 0.5); const sh = st.treeHit > 0 ? Math.sin(st.t * 60) * 3 : 0; g.save(); g.translate(X + sh, Y); if (TW.has('bendito')) { g.fillStyle = 'rgba(255,240,150,.2)'; g.beginPath(); g.arc(0, -T * 0.2, T * 0.9 + Math.sin(st.t * 2) * 3, 0, 7); g.fill(); } g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, T * 0.42, T * 0.6, T * 0.15, 0, 0, 7); g.fill(); g.fillStyle = SKIN.c[2]; g.fillRect(-T * 0.12, -T * 0.1, T * 0.24, T * 0.52); const sw = Math.sin(st.t * 1.2) * T * 0.03; const hp = st.lives / LMAX; const RB = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#4dabf7', '#9775fa']; [[0, -0.42, 0.42], [-0.3, -0.2, 0.3], [0.3, -0.2, 0.3]].forEach(([a, b, r], i) => { g.fillStyle = st.treeHit > 0 ? '#c84a3a' : SKIN.rb ? RB[(i * 2 + Math.floor(st.t * 2)) % 6] : hp > 0.25 ? (i ? SKIN.c[1] : SKIN.c[0]) : '#a8702a'; g.beginPath(); g.arc(a * T + sw, b * T, r * T, 0, 7); g.fill(); }); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(-T * 0.12 + sw, -T * 0.55, T * 0.12, 0, 7); g.fill(); if (hp > 0.5) { g.fillStyle = SKIN.f; for (const [a, b] of [[-0.2, -0.5], [0.15, -0.3], [0.3, -0.15]]) { g.beginPath(); g.arc(a * T + sw, b * T, T * 0.05, 0, 7); g.fill(); } } g.restore(); }
    // torres
    for (const t of st.tw) {
      if (tb(t) === 'trampa') { if (t === st.sel) { g.strokeStyle = '#ffd23c'; g.lineWidth = 2; g.strokeRect(SX(t.x) + 1, SY(t.y) + 1, T - 2, T - 2); } continue; }
      const kick = t.kick > 0 ? -t.kick * 8 : 0; const sc = t.born > 0 ? 1 + Math.sin((0.35 - t.born) / 0.35 * Math.PI) * 0.25 : 1;
      drawTowerSpr(t, SX(t.x + 0.5), SY(t.y + 0.5) + kick, sc);
      if (t.stun > 0) { const X = SX(t.x + 0.5), Y = SY(t.y + 0.5); if (t.stunK === 'veneno') { g.fillStyle = 'rgba(140,220,60,.45)'; g.beginPath(); g.roundRect(X - T * 0.42, Y - T * 0.5, T * 0.84, T * 0.9, 6); g.fill(); for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(180,255,90,.8)'; g.beginPath(); g.arc(X + (i - 1) * T * 0.2, Y - T * 0.3 - ((st.t * 1.5 + i * 0.3) % 1) * T * 0.4, 3, 0, 7); g.fill(); } } else if (t.stunK === 'hielo') { g.fillStyle = 'rgba(190,235,255,.55)'; g.beginPath(); g.roundRect(X - T * 0.42, Y - T * 0.5, T * 0.84, T * 0.9, 6); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); } else if (t.stunK === 'fuego') { for (let i = 0; i < 3; i++) { const fx = X + (i - 1) * T * 0.22, f = Math.sin(st.t * 15 + i) * 3; g.fillStyle = 'rgba(255,120,30,.85)'; g.beginPath(); g.ellipse(fx, Y - T * 0.15 + f, T * 0.1, T * 0.22, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,220,80,.9)'; g.beginPath(); g.ellipse(fx, Y - T * 0.08 + f, T * 0.05, T * 0.11, 0, 0, 7); g.fill(); } } else { g.strokeStyle = '#ffe066'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 5; i++) { const a = st.t * 20 + i; g.lineTo(X + Math.cos(a) * T * 0.35, Y - T * 0.1 + Math.sin(a * 1.7) * T * 0.35); } g.stroke(); } }
      if (t === st.sel) { g.strokeStyle = '#ffd23c'; g.lineWidth = 2; g.strokeRect(SX(t.x) + 1, SY(t.y) + 1, T - 2, T - 2); }
    }
    // rayos de luciérnaga
    for (const t of st.tw) if (tb(t) === 'rayo' && t.target && !t.target.dead && !(t.stun > 0)) { const mx = t.spec === 2 ? 6 : 3; const k = (t.ramp || 0) / mx; const col = t.spec === 2 ? '255,220,90' : '120,240,255'; const beam = (e, w) => { g.strokeStyle = `rgba(${col},${0.5 + 0.4 * k})`; g.lineWidth = w; g.beginPath(); g.moveTo(SX(t.x + 0.5), SY(t.y + 0.15)); g.lineTo(SX(e.x), SY(e.y)); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.stroke(); }; beam(t.target, 2 + k * 5); if (t.extra) for (const o of t.extra) if (!o.dead) beam(o, 1.5 + k * 2); }
    // portales
    if (PORT) PATHS.forEach((p, pi) => { [[PORT.a, '190,120,255'], [PORT.b, '120,200,255']].forEach(([f, col], j) => { const o = posAt(pi, f * p.L); const X = SX(o.x), Y = SY(o.y); g.save(); g.translate(X, Y); g.fillStyle = `rgba(${col},.25)`; g.beginPath(); g.arc(0, 0, T * 0.42, 0, 7); g.fill(); g.strokeStyle = `rgba(${col},.95)`; g.lineWidth = 3; for (let i = 0; i < 3; i++) { const a = st.t * (j ? -3 : 3) + i * 2.09; g.beginPath(); g.arc(0, 0, T * (0.2 + i * 0.07), a, a + 1.6); g.stroke(); } g.restore(); }); });
    // cofres
    for (const c of st.chests) { const X = SX(c.x + 0.5), Y = SY(c.y + 0.5) + Math.sin(st.t * 4 + c.x) * 2; const k = c.life / 7; g.fillStyle = 'rgba(255,240,150,.35)'; g.beginPath(); g.arc(X, Y, T * 0.5 + Math.sin(st.t * 6) * 2, 0, 7); g.fill(); g.fillStyle = '#a8702a'; g.fillRect(X - T * 0.26, Y - T * 0.12, T * 0.52, T * 0.32); g.fillStyle = '#c98a3a'; g.beginPath(); g.ellipse(X, Y - T * 0.12, T * 0.26, T * 0.14, 0, Math.PI, 0); g.fill(); g.fillStyle = '#ffd23c'; g.fillRect(X - T * 0.04, Y - T * 0.12, T * 0.08, T * 0.14); g.strokeStyle = k < 0.35 ? '#ff6b6b' : '#fff'; g.lineWidth = 2.5; g.beginPath(); g.arc(X, Y, T * 0.4, -Math.PI / 2, -Math.PI / 2 + k * 6.283); g.stroke(); }
    // enemigos
    const en = st.en.slice().sort((a, b) => a.y - b.y);
    for (const e of en) {
      const E = TD_EN[e.k]; const X = SX(e.x), Y = SY(e.y);
      if (e.under) { g.fillStyle = '#7a5a3a'; g.beginPath(); g.ellipse(X, Y + T * 0.12, T * 0.28, T * 0.12, 0, 0, 7); g.fill(); g.fillStyle = '#9a7a5a'; g.beginPath(); g.ellipse(X - T * 0.05, Y + T * 0.08, T * 0.14, T * 0.06, 0, 0, 7); g.fill(); continue; }
      const ghost = E.ghost && !st.tw.some((t) => tb(t) === 'buho' && dist(t, e) <= RNG(t)) && !st.tw.some((t) => dist(t, e) <= 1.3);
      if (ghost) g.globalAlpha = 0.3;
      drawEnemySpr(e);
      g.globalAlpha = 1;
      const R = T * E.r * (E.boss ? 1.9 : 1.25);
      if (e.hit > 0) { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(X, Y, R, 0, 7); g.fill(); }
      if (e.inv > 0) { g.strokeStyle = 'rgba(255,220,90,.95)'; g.fillStyle = 'rgba(255,220,90,.25)'; g.lineWidth = 3; g.beginPath(); g.arc(X, Y - T * 0.1, R + 8, 0, 7); g.fill(); g.stroke(); }
      if (e.sh > 0) { g.strokeStyle = 'rgba(150,210,255,.9)'; g.fillStyle = 'rgba(150,210,255,.2)'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y - T * 0.05, R + 4, 0, 7); g.fill(); g.stroke(); }
      if (e.frz > 0) { g.fillStyle = 'rgba(190,235,255,.55)'; g.beginPath(); g.arc(X, Y, R + 2, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1; g.stroke(); }
      else if (e.slowK > 0) { g.fillStyle = 'rgba(160,220,120,.32)'; g.beginPath(); g.arc(X, Y, R * 0.9, 0, 7); g.fill(); }
      if (e.dotT > 0 && !low() && Math.random() < 0.15) puff(e.x, e.y - 0.2, '#b06ad0', 1, 0.6);
      if (e.rootT > 0) { g.strokeStyle = '#6b4a2a'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y + T * 0.1, T * 0.3, 0, Math.PI); g.stroke(); }
      if (e.chg > 0) { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(X - e.dir * (R + 4 + i * 5), Y - 6 + i * 6); g.lineTo(X - e.dir * (R + 12 + i * 5), Y - 6 + i * 6); g.stroke(); } }
      if (e.hp < e.max && !E.boss) { const w = T * 0.6, y = Y - T * 0.5; g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(X - w / 2, y, w, 4); g.fillStyle = e.hp / e.max > 0.5 ? '#51cf66' : e.hp / e.max > 0.25 ? '#fcc419' : '#ff6b6b'; g.fillRect(X - w / 2, y, w * Math.max(0, e.hp / e.max), 4); }
    }
    // minas
    for (const m of st.mines || []) { g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(SX(m.x), SY(m.y) + T * 0.16, T * 0.2, T * 0.07, 0, 0, 7); g.fill(); tdEm(g, m.em, Math.round(T * 0.38), SX(m.x), SY(m.y) + Math.sin(st.t * 4 + m.c) * 1.2); }
    // proyectiles
    for (const q of st.pr) {
      if (q.k === 'flecha' && q.pc) { g.fillStyle = q.pc; g.beginPath(); g.arc(SX(q.x), SY(q.y), T * 0.09, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(SX(q.x) - 1, SY(q.y) - 1, T * 0.035, 0, 7); g.fill(); }
      else if (q.k === 'flecha') { g.save(); g.translate(SX(q.x), SY(q.y)); g.rotate(q.ang || 0); g.strokeStyle = '#6b3a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-T * 0.18, 0); g.lineTo(T * 0.12, 0); g.stroke(); g.fillStyle = '#ddd'; g.beginPath(); g.moveTo(T * 0.16, 0); g.lineTo(T * 0.08, -3); g.lineTo(T * 0.08, 3); g.fill(); g.restore(); }
      else if (q.k === 'abeja') { const x = SX(q.x) + Math.sin(q.ph) * 2, y = SY(q.y) + Math.cos(q.ph * 1.3) * 2; g.fillStyle = q.pc || (q.pierce ? '#ff9a3c' : '#ffd23c'); g.beginPath(); g.ellipse(x, y, 3.2, 2.4, 0, 0, 7); g.fill(); g.fillStyle = '#3a2a10'; g.fillRect(x - 0.8, y - 2.4, 1.6, 4.8); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(x, y - 3, 2, 1.2, 0, 0, 7); g.fill(); }
      else if (q.k === 'bala') { const k = q.t / q.T; const x = q.x0 + (q.x1 - q.x0) * k, y = q.y0 + (q.y1 - q.y0) * k - Math.sin(k * Math.PI) * 1.2; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(SX(q.x0 + (q.x1 - q.x0) * k), SY(q.y0 + (q.y1 - q.y0) * k), 4, 2, 0, 0, 7); g.fill(); g.fillStyle = q.pc || '#3a3a40'; g.beginPath(); g.arc(SX(x), SY(y), T * 0.12, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(SX(x) - 2, SY(y) - 2, T * 0.04, 0, 7); g.fill(); }
      else if (q.k === 'nube') { const a = 1 - q.t / 0.8; g.fillStyle = `rgba(${q.c},${0.35 * a})`; g.beginPath(); g.arc(SX(q.x), SY(q.y), q.r * T * (0.6 + q.t * 0.5), 0, 7); g.fill(); }
      else if (q.k === 'bellotas') { if (q.t < 0.6) { for (let i = 0; i < 6; i++) { const a = i * 1.05; const r = 1.3 * (1 - q.t / 0.6); g.fillStyle = '#8a5a2c'; g.beginPath(); g.ellipse(SX(q.x + Math.cos(a) * 0.9), SY(q.y + Math.sin(a) * 0.9 - r * 3), 5, 6, 0, 0, 7); g.fill(); } g.strokeStyle = 'rgba(255,80,40,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(SX(q.x), SY(q.y), 1.7 * T, 0, 7); g.stroke(); } else { g.fillStyle = `rgba(255,200,80,${0.5 * (1 - (q.t - 0.6) / 0.4)})`; g.beginPath(); g.arc(SX(q.x), SY(q.y), 1.7 * T, 0, 7); g.fill(); } }
    }
    // estrellas y meteoritos
    for (const v of st.ev) { const k = v.t / v.T; const X = SX(v.x), Y = SY(v.y); if (v.k === 'star') { g.fillStyle = '#ffe066'; g.strokeStyle = 'rgba(255,240,150,.5)'; g.lineWidth = 3; g.beginPath(); g.moveTo(X - 30 * (1 - k), Y - (1 - k) * T * 5 - 30 * (1 - k)); g.lineTo(X, Y - (1 - k) * T * 5); g.stroke(); g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 9, a = i * Math.PI / 5 - Math.PI / 2; g.lineTo(X + Math.cos(a) * r, Y - (1 - k) * T * 5 + Math.sin(a) * r); } g.fill(); g.strokeStyle = 'rgba(255,230,120,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y, 1.4 * T, 0, 7); g.stroke(); } else { g.strokeStyle = `rgba(255,70,40,${0.5 + 0.4 * Math.sin(st.t * 18)})`; g.lineWidth = 3; g.setLineDash([6, 5]); g.beginPath(); g.arc(X, Y, 1.1 * T, 0, 7); g.stroke(); g.setLineDash([]); g.fillStyle = 'rgba(255,70,40,.15)'; g.beginPath(); g.arc(X, Y, 1.1 * T * k, 0, 7); g.fill(); const yy = Y - (1 - k) * T * 6; g.fillStyle = '#6a4a3a'; g.beginPath(); g.arc(X + (1 - k) * 20, yy, T * 0.2, 0, 7); g.fill(); g.fillStyle = '#ff9a3c'; g.beginPath(); g.arc(X + (1 - k) * 20 - 3, yy - 3, T * 0.1, 0, 7); g.fill(); } }
    // relámpagos
    for (const b of st.bolts) { g.globalAlpha = 1 - b.t / 0.22; g.strokeStyle = b.c; g.lineWidth = b.w || 2.5; g.lineJoin = 'round'; g.beginPath(); b.pts.forEach(([x, y], i) => { if (!i) { g.moveTo(SX(x), SY(y)); return; } const [px, py] = b.pts[i - 1]; for (let s = 1; s <= 3; s++) { const k = s / 3; const jx = s < 3 ? (Math.random() - 0.5) * T * 0.3 : 0, jy = s < 3 ? (Math.random() - 0.5) * T * 0.3 : 0; g.lineTo(SX(px + (x - px) * k) + jx, SY(py + (y - py) * k) + jy); } }); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.stroke(); } g.globalAlpha = 1;
    for (const r of st.rings) { const k = r.t / r.T; g.globalAlpha = 1 - k; g.strokeStyle = r.col; g.lineWidth = 3 * (1 - k) + 1; g.beginPath(); g.arc(SX(r.x), SY(r.y), r.r1 * T * (0.3 + 0.7 * k), 0, 7); g.stroke(); } g.globalAlpha = 1;
    for (const p of st.parts) { g.globalAlpha = Math.max(0, 1 - p.t / p.l); g.fillStyle = p.c; g.fillRect(SX(p.x) - p.r, SY(p.y) - p.r, p.r * 2, p.r * 2); } g.globalAlpha = 1;
    drawWx();
    g.textAlign = 'center'; g.textBaseline = 'alphabetic'; for (const f of st.floats) { g.globalAlpha = Math.max(0, 1 - f.t / 1.1); g.font = `900 ${Math.round(T * (f.big ? 0.38 : 0.28))}px system-ui`; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.55)'; const y = SY(f.y) - f.t * 30; g.strokeText(f.text, SX(f.x), y); g.fillStyle = f.col; g.fillText(f.text, SX(f.x), y); } g.globalAlpha = 1;
    g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    // semillas que vuelan al contador
    if (st.fly.length) { if (!seedPos) { const r = $w('#tdS').getBoundingClientRect(); seedPos = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; } for (const f of st.fly) { const k = f.t * f.t; const x = f.sx + (seedPos.x - f.sx) * k, y = f.sy + (seedPos.y - f.sy) * k - Math.sin(f.t * Math.PI) * 40; g.fillStyle = '#a8702a'; g.beginPath(); g.ellipse(x, y, 4, 5, 0, 0, 7); g.fill(); g.fillStyle = '#5a3a1a'; g.fillRect(x - 4, y - 5, 8, 2.5); } }
    // barra del jefe
    const boss = st.en.find((e) => TD_EN[e.k].boss);
    if (boss) { const w = Math.min(V.w - 120, 240), x = (V.w - w) / 2, y = V.oy >= 90 ? V.oy - 22 : V.oy + 2; g.globalAlpha = 0.85; g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.roundRect(x - 4, y - 2, w + 8, 20, 7); g.fill(); g.fillStyle = '#3a1a1a'; g.fillRect(x, y + 10, w, 5); g.fillStyle = '#ff5a5a'; g.fillRect(x, y + 10, w * Math.max(0, boss.hp / boss.max), 5); g.fillStyle = '#fff'; g.font = '800 9px system-ui'; g.textAlign = 'center'; g.fillText(TD_EN[boss.k].n, V.w / 2, y + 7.5); g.globalAlpha = 1; }
    // letrero de oleada
    if (st.banner) { const b = st.banner, k = b.t; const a = k < 0.3 ? k / 0.3 : k > 1.9 ? Math.max(0, (2.4 - k) / 0.5) : 1; const sc = k < 0.3 ? 0.6 + 0.4 * (k / 0.3) + Math.sin(k / 0.3 * Math.PI) * 0.15 : 1; g.save(); g.globalAlpha = a; g.translate(V.w / 2, V.oy + TD_ROWS * V.T * 0.38); g.scale(sc, sc); g.textAlign = 'center'; const fit = (txt, px, wgt) => { g.font = `${wgt} ${px}px system-ui`; const w = g.measureText(txt).width; if (w > V.w * 0.9) g.font = `${wgt} ${Math.max(10, Math.floor(px * V.w * 0.9 / w))}px system-ui`; }; fit(b.text, Math.round(Math.min(40, V.w / 10)), 900); g.lineWidth = 6; g.lineJoin = 'round'; g.strokeStyle = b.boss ? '#5a0a0a' : 'rgba(0,0,0,.6)'; g.strokeText(b.text, 0, 0); g.fillStyle = b.boss ? '#ffb0a0' : '#fff'; g.fillText(b.text, 0, 0); if (b.sub) { fit(b.sub, 16, 800); g.lineWidth = 4; g.strokeText(b.sub, 0, 28); g.fillStyle = b.boss ? '#ffe066' : '#d8ffd0'; g.fillText(b.sub, 0, 28); } g.restore(); }
    if (st.hurt > 0) { const a = st.hurt / 0.6 * 0.45; const gr = g.createRadialGradient(V.w / 2, V.h / 2, Math.min(V.w, V.h) * 0.35, V.w / 2, V.h / 2, Math.max(V.w, V.h) * 0.7); gr.addColorStop(0, 'rgba(255,0,0,0)'); gr.addColorStop(1, `rgba(220,20,20,${a})`); g.fillStyle = gr; g.fillRect(0, 0, V.w, V.h); }
    if (st.flash > 0) { g.fillStyle = `rgba(255,255,255,${st.flash * 0.6})`; g.fillRect(0, 0, V.w, V.h); }
    if (st.aim) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, 0, V.w, V.h); }
  }

  /* --- HUD y panel --- */
  let hintT = 0; const hint = (t, ms) => { $w('#tdHint').textContent = t || (st.phase === 'build' ? 'Toca el pasto para poner una torre' : ''); clearTimeout(hintT); if (ms) hintT = setTimeout(() => hint(''), ms); };
  let lastLives = st.lives;
  function hud() {
    $w('#tdL').textContent = st.lives; $w('#tdS').textContent = Math.floor(st.seeds); $w('#tdW').textContent = st.wave;
    if (st.lives < lastLives) { const p = $w('#tdLp'); p.classList.remove('td-bump'); void p.offsetWidth; p.classList.add('td-bump'); } lastLives = st.lives;
    const nb = $w('#tdNext'); if (st.phase === 'build') { nb.hidden = false; nb.textContent = st.wave === 0 ? '▶ Empezar' : `▶ Siguiente · ${Math.ceil(st.countdown)}s`; } else nb.hidden = true;
    paintPow(); if (st.sel || st.build) refreshPanel();
  }
  function paintPow() { wrap.querySelectorAll('[data-pw]').forEach((b) => { const k = b.dataset.pw, T0 = TD_POWERS[k].cd * pwF(); b.querySelector('i').style.height = `${st.cd[k] / T0 * 100}%`; b.disabled = st.cd[k] > 0 || st.over; }); const a = $w('#tdP1'), r = $w('#tdP2'); a.classList.toggle('on', st.aim === 'a'); r.classList.toggle('on', st.aim === 'r'); a.querySelector('i').style.height = `${st.cd.a / cdA() * 100}%`; r.querySelector('i').style.height = `${st.cd.r / cdR() * 100}%`; a.disabled = st.cd.a > 0; r.disabled = st.cd.r > 0; }
  const panel = $w('#tdPanel');
  const paintMini = () => panel.querySelectorAll('canvas[data-k]').forEach((cv) => { const q = cv.getContext('2d'); tdDrawTower(q, cv.dataset.k, +(cv.dataset.l || 0), 32, 36, 46, 1, -0.6, +(cv.dataset.s || 0)); });
  function openBuild(x, y, onPath) {
    st.sel = null; st.build = { x, y };
    const ks0 = Object.keys(TD_TW).filter((k) => (onPath ? !!TD_TW[k].path : !TD_TW[k].path)); const ks1 = ks0.filter((k) => tdTowerOpen(k)).concat(ks0.filter((k) => !tdTowerOpen(k)).sort((a, b) => TD_TW[a].un - TD_TW[b].un).slice(0, 2)); const cat = onPath ? 'all' : (st.bcat || 'all'); const ks = cat === 'all' ? ks1 : ks1.filter((k) => tdCat(k) === cat); const cats = !onPath && ks1.length > 12 ? `<div class="td-cats">${TD_CATS.map(([c, l]) => `<button type="button" class="td-cat${cat === c ? ' on' : ''}" data-a="cat" data-c="${c}">${l}</button>`).join('')}</div>` : '';
    panel.innerHTML = `<div class="td-ph"><b>${onPath ? 'Trampa en el camino' : 'Construir aquí'}</b><button class="td-close" data-a="close" aria-label="Cerrar">✕</button></div>${cats}<div class="td-tws">${ks.map((k) => { const K = TD_TW[k]; const open = tdTowerOpen(k) && (!SOLO || SOLO.has(k)); return `<button type="button" class="td-tw" data-a="build" data-k="${k}" ${open ? '' : 'disabled'}><canvas width="64" height="64" data-k="${k}"></canvas><b>${tdTowerOpen(k) ? K.n.split(' ')[0] : '🔒'}</b><span>${!tdTowerOpen(k) ? `Mapa ${K.un + 1}` : open ? `🌰 ${costOf(k, 0)}` : 'No aquí'}</span></button>`; }).join('')}</div>`;
    panel.hidden = false; paintMini(); refreshPanel();
  }
  function info(t) {
    const K = TD_TW[t.k], L = t.lvl, r = RNG(t).toFixed(1); const bm = t.bm > 1 ? ` · +${Math.round((t.bm - 1) * 100)} % por árbol` : '';
    { const B6 = tb(t); if (B6 === 'aura') return `${Math.round(K.dps[L] * (t.spec === 2 ? 1.6 : 1))} daño/s a todas las plagas cerca · alcance ${r}${bm}`; if (B6 === 'mina') return `Minas de ${K.dmg[L]} de daño en área (hasta ${(3 + L) * (t.spec === 2 ? 2 : 1)} a la vez) · alcance ${r}${bm}`; if (B6 === 'global') return `${Math.round(K.dmg[L] * (t.spec === 2 ? 1.8 : 1))} de daño a ${t.spec === 1 ? '3 plagas' : 'una plaga'} en cualquier parte del mapa cada ${K.rate[L]} s${bm}`; if (B6 === 'linea') return `${Math.round(K.dmg[L] * (t.spec === 2 ? 1.5 : 1))} de daño a todas las plagas en línea · alcance ${r}${bm}`; }
    if (K.support) return `+${Math.round((K.buff[L] + (t.spec === 1 ? 0.6 : 0)) * 100)} % de daño a torres cercanas · +${Math.round(K.seeds[L] * (t.spec === 2 ? 2.5 : 1))} 🌰 por oleada`;
    if (tb(t) === 'rayo') return `${K.dps[L]} daño/s, sube hasta ×${t.spec === 2 ? 7 : 4} · alcance ${r}${bm}`;
    if (tb(t) === 'hongo') return `Veneno ${K.dot[L] * (t.spec === 1 ? 2 : 1)}/s · frena ${Math.round((t.spec === 2 ? 0.7 : K.slow[L]) * 100)} % · alcance ${r}${bm}`;
    if (tb(t) === 'buho') return `${Math.round(K.dmg[L] * (t.spec === 2 ? 1.8 : 1))} de daño · salta a ${t.spec === 1 ? 9 : K.ch[L]} enemigos · alcance ${r}${bm}`;
    if (tb(t) === 'pino') return `Congela ${t.spec === 1 ? 2.5 : K.frz[L]} s cada ${K.rate[L]} s · alcance ${r}${bm}`;
    if (tb(t) === 'trampa') return `${Math.round(K.dps[L] * (t.spec === 2 ? 2 : 1))} daño/s a quien la pise${t.spec === 1 ? ' · frena 45 %' : ''}${bm}`;
    return `${K.dmg[L]}${tb(t) === 'abejas' ? ` × ${K.nb[L] + (t.spec === 1 ? 3 : 0)} abejas` : ''}${tb(t) === 'ardilla' && t.spec === 1 ? ' × 3 blancos' : ''} de daño · alcance ${r}${bm}`;
  }
  function openTower(t) {
    st.build = null; st.sel = t; const K = TD_TW[t.k];
    const specs = t.lvl === 3 && !t.spec ? `<div class="td-specs"><b class="small">✨ Maestría · elige un camino (🌰 ${specCost(t.k)})</b><div class="td-spec-row">${K.spec.map(([n, d], i) => `<button type="button" class="td-spec" data-a="spec" data-s="${i + 1}"><canvas width="64" height="64" data-k="${t.k}" data-l="3" data-s="${i + 1}"></canvas><b>${n}</b><span>${d}</span></button>`).join('')}</div></div>` : '';
    const title = t.spec ? `${K.n} · ✨ ${K.spec[t.spec - 1][0]}` : `${K.n} · nivel ${t.lvl + 1}`;
    panel.innerHTML = `<div class="td-ph"><b>${title}</b><button class="td-close" data-a="close" aria-label="Cerrar">✕</button></div><p class="td-inf2">${info(t)}${tdFxTxt(K.fx)}</p>${specs}
      <div class="td-acts">${t.lvl < 3 ? '<button type="button" class="btn primary" data-a="up"></button>' : ''}${K.support || tb(t) === 'trampa' || tb(t) === 'pino' || tb(t) === 'aura' || tb(t) === 'mina' ? '' : `<button type="button" class="btn" data-a="mode">🎯 ${({ primero: 'Al primero', fuerte: 'Al más fuerte', ultimo: 'Al último' })[t.mode]}</button>`}<button type="button" class="btn" data-a="sell">Vender · +${sellOf(t)} 🌰</button></div>`;
    panel.hidden = false; paintMini(); refreshPanel();
  }
  function refreshPanel() {
    if (st.build) panel.querySelectorAll('button[data-a="build"]').forEach((b) => { if (!tdTowerOpen(b.dataset.k) || (SOLO && !SOLO.has(b.dataset.k))) return; b.disabled = st.seeds < costOf(b.dataset.k, 0); });
    if (st.sel) { const t = st.sel, b = panel.querySelector('[data-a="up"]'); const lock = NOUP && st.wave < 6; if (b) { const cst = costOf(t.k, t.lvl + 1); b.textContent = lock ? '🌱 Desde la oleada 6' : `Mejorar · 🌰 ${cst}`; b.disabled = lock || st.seeds < cst; } panel.querySelectorAll('[data-a="spec"]').forEach((s) => { s.disabled = lock || st.seeds < specCost(t.k); }); }
  }
  const closePanel = () => { panel.hidden = true; st.sel = null; st.build = null; };
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return; TDS.init(); const a = b.dataset.a;
    if (a === 'close') { closePanel(); return; }
    if (a === 'cat' && st.build) { st.bcat = b.dataset.c; openBuild(st.build.x, st.build.y, false); return; }
    if (a === 'build' && st.build) { const k = b.dataset.k, cst = costOf(k, 0); if (st.seeds < cst) { TDS.no(); return; } if (MAXT && k !== 'trampa' && st.tw.filter((x) => tb(x) !== 'trampa').length >= MAXT) { TDS.no(); hint(`📦 Espacio escaso: máximo ${MAXT} torres. Vende una para cambiar.`, 2600); return; } st.seeds -= cst; const t = { k, lvl: 0, x: st.build.x, y: st.build.y, cd: 0, aim: -Math.PI / 2, mode: 'primero', bm: 1, spec: 0, born: 0.35, stun: 0 }; st.tw.push(t); recalcBuff(); TDS.build(); puff(t.x + 0.5, t.y + 0.5, '#fff', 10, 2); ring(t.x + 0.5, t.y + 0.5, 0.8, 'rgba(255,255,255,.9)', 0.35); closePanel(); hud(); return; }
    const t = st.sel; if (!t) return;
    if (a === 'up') { if (t.lvl >= 3) return; const cst = costOf(t.k, t.lvl + 1); if (st.seeds < cst) { TDS.no(); return; } st.seeds -= cst; t.lvl++; t.born = 0.35; recalcBuff(); TDS.up(); puff(t.x + 0.5, t.y + 0.5, '#ffd23c', 14, 2.5); ring(t.x + 0.5, t.y + 0.5, 1, 'rgba(255,210,60,.95)', 0.45); openTower(t); hud(); }
    else if (a === 'spec') { if (t.spec || t.lvl < 3) return; const cst = specCost(t.k); if (st.seeds < cst) { TDS.no(); return; } st.seeds -= cst; t.spec = +b.dataset.s; t.born = 0.35; t.ramp = 0; recalcBuff(); TDS.spec(); puff(t.x + 0.5, t.y + 0.5, '#ff8fcf', 24, 3); ring(t.x + 0.5, t.y + 0.5, 1.4, 'rgba(255,143,207,.95)', 0.6); float(`✨ ${TD_TW[t.k].spec[t.spec - 1][0]}`, t.x + 0.5, t.y, '#ffb0e0', true); openTower(t); hud(); }
    else if (a === 'mode') { t.mode = ({ primero: 'fuerte', fuerte: 'ultimo', ultimo: 'primero' })[t.mode]; openTower(t); }
    else if (a === 'sell') { st.seeds += sellOf(t); st.tw = st.tw.filter((x) => x !== t); recalcBuff(); TDS.sell(); puff(t.x + 0.5, t.y + 0.5, '#ffe066', 10, 2); closePanel(); hud(); }
  });
  // tocar el mapa (actúa al soltar el dedo: un toque nunca se confunde con deslizar)
  let pd = null;
  c.addEventListener('pointerdown', (e) => { TDS.init(); pd = { x: e.clientX, y: e.clientY }; });
  c.addEventListener('pointercancel', () => { pd = null; });
  c.addEventListener('pointerup', (e) => {
    if (!pd || Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 18) { pd = null; return; } pd = null; if (st.over) return;
    const fx = (e.clientX - V.ox) / V.T, fy = (e.clientY - V.oy) / V.T;
    if (st.aim) { if (fx >= -0.5 && fx <= TD_COLS + 0.5 && fy >= -0.5 && fy <= TD_ROWS + 0.5) cast(st.aim, fx, fy); return; }
    const x = Math.floor(fx), y = Math.floor(fy);
    const ch = st.chests.find((c) => c.x === x && c.y === y); if (ch) { st.chests = st.chests.filter((c) => c !== ch); st.seeds += ch.v; float(`+${ch.v} 🌰`, ch.x + 0.5, ch.y, '#ffe066', true); puff(ch.x + 0.5, ch.y + 0.5, '#ffd23c', 16, 3); ring(ch.x + 0.5, ch.y + 0.5, 0.9, 'rgba(255,230,120,.95)', 0.4); TDS.up(); hud(); return; }
    if (x < 0 || y < 0 || x >= TD_COLS || y >= TD_ROWS) { closePanel(); return; }
    const t = towerAt(x, y); if (t) { openTower(t); TDS.tone(700, 0.05, 'sine', 0.03); return; }
    if (blocked.has(key(x, y))) { closePanel(); hint('Ahí no se puede construir: elige pasto libre', 1600); return; }
    if (pathCells.has(key(x, y))) { if (!Object.keys(TD_TW).some((k) => TD_TW[k].path && tdTowerOpen(k))) { closePanel(); hint(`El camino es para el Cardo espinoso (se abre en el mapa ${TD_TW.trampa.un + 1})`, 2200); return; } openBuild(x, y, true); TDS.tone(500, 0.05, 'sine', 0.03); return; }
    openBuild(x, y, false); TDS.tone(600, 0.05, 'sine', 0.03);
  });
  $w('#tdP1').addEventListener('click', () => { TDS.init(); if (st.cd.a > 0) return; st.aim = st.aim === 'a' ? null : 'a'; closePanel(); hint(st.aim ? '🌰 Toca el lugar donde caerán las bellotas' : ''); paintPow(); });
  $w('#tdP2').addEventListener('click', () => { TDS.init(); if (st.cd.r > 0) return; st.aim = st.aim === 'r' ? null : 'r'; closePanel(); hint(st.aim ? '🌿 Toca dónde crecerán las raíces' : ''); paintPow(); });
  wrap.querySelectorAll('[data-pw]').forEach((b) => b.addEventListener('click', () => {
    TDS.init(); const k = b.dataset.pw; if (st.cd[k] > 0 || st.over) return; st.cd[k] = TD_POWERS[k].cd * pwF(); vib(30);
    if (k === 'trueno') { const c = st.en.filter((e) => !e.dead && !e.under).sort(() => Math.random() - 0.5).slice(0, 12); for (const e of c) { st.bolts.push({ pts: [[e.x + (Math.random() - 0.5), -0.5], [e.x + 0.3, e.y * 0.5], [e.x, e.y]], t: 0, c: '#ffe066', w: 3 }); damage(e, (90 + st.wave * 16) * dmgMul(), true); } st.flash = 0.35; st.shake = 0.4; TDS.bpow(); TDS.crit(); if (!c.length) float('No había plagas', TD_COLS / 2, 4, '#fff'); }
    else if (k === 'helada') { for (const e of st.en) if (!e.dead) e.frz = Math.max(e.frz, TD_EN[e.k].boss ? 1.5 : 3); st.flash = 0.25; ring(TD_COLS / 2, TD_ROWS / 2, 7, 'rgba(190,235,255,.95)', 0.7); TDS.shot('pino'); }
    else if (k === 'cosecha') { const n = 80 + st.wave * 10; st.seeds += n; float(`+${n} 🌰 cosecha`, TD_COLS / 2, 3, '#ffe066', true); TDS.up(); }
    else if (k === 'veneno') { for (const e of st.en) if (!e.dead) { e.dotT = Math.max(e.dotT, 5); e.dotD = Math.max(e.dotD, (12 + st.wave * 3) * dmgMul()); puff(e.x, e.y, '#9ad83a', 3, 1.2); } ring(TD_COLS / 2, TD_ROWS / 2, 7, 'rgba(150,220,80,.9)', 0.7); TDS.shot('hongo'); }
    else if (k === 'tornado') { for (const e of st.en) if (!e.dead && !TD_EN[e.k].boss) e.d = Math.max(0, e.d - 1.6); st.shake = 0.5; ring(TD_COLS / 2, TD_ROWS / 2, 7, 'rgba(220,230,240,.9)', 0.7); TDS.boom(); float('🌪️ ¡Tornado!', TD_COLS / 2, 3, '#e8f0ff', true); }
    else if (k === 'vida') { st.lives = Math.min(LMAX + 5, st.lives + 3); ring(tree[0] + 0.5, tree[1] + 0.5, 1.6, 'rgba(150,255,170,.95)', 0.6); float('+3 ❤️', tree[0] + 0.5, tree[1] - 0.5, '#9dff9d', true); TDS.up(); }
    else if (k === 'oro') { st.goldT = 12; st.flash = 0.2; float('✨ ¡Lluvia dorada! Semillas ×3', TD_COLS / 2, 3, '#ffe066', true); TDS.spec(); }
    paintPow(); hud();
  }));
  $w('#tdNext').addEventListener('click', () => { TDS.init(); startWave(); });
  $w('#tdSp').addEventListener('click', () => { st.speed = st.speed === 1 ? 2 : st.speed === 2 ? 3 : 1; $w('#tdSp').textContent = `${st.speed}×`; });
  let paused = false;
  const pause = (v) => { if (st.over) return; paused = v ?? !paused; $w('#tdPause').hidden = !paused; if (paused) $w('#tdPause').classList.add('show'); st.last = performance.now(); };
  $w('#tdPa').addEventListener('click', () => pause());
  $w('#tdGo').addEventListener('click', () => pause(false));
  $w('#tdMus').addEventListener('click', () => { TDS.music = !TDS.music; $w('#tdMus').textContent = `Música: ${TDS.music ? 'sí' : 'no'}`; });
  $w('#tdRe').addEventListener('click', () => { exit(false); tdStart(mi, daily); });
  $w('#tdOut').addEventListener('click', () => exit(true));
  $w('#tdX').addEventListener('click', () => { if (st.over || st.wave === 0) exit(true); else pause(true); });
  const onVis = () => { if (document.hidden) pause(true); }; document.addEventListener('visibilitychange', onVis);
  const onKey = (e) => { if (e.key === 'Escape') pause(); else if (e.key === ' ' && st.phase === 'build') { e.preventDefault(); startWave(); } };
  addEventListener('keydown', onKey);

  /* --- final --- */
  const achHTML = (a) => (a && a.length ? `<div class="td-achgot">${a.map((x) => `<span>🏆 <b>${x.n}</b> · +${x.g} 🍂</span>`).join('')}</div>` : '');
  function end(won) {
    if (st.over) return; st.over = true; closePanel(); st.aim = null;
    const el = $w('#tdEnd'); const secs = Math.max(1, Math.round((Date.now() - st.t0) / 1000));
    D.kills = (D.kills || 0) + st.killed;
    if (INF) {
      const w = Math.max(0, st.wave - 1); const nb = w > (D.inf || 0); if (nb) D.inf = w; const gg = Math.floor(w / 2); D.gold += gg; const ach = tdCheckAch(); jpSave(); TDS.lose(); st.gold = gg; st.ach = ach;
      if (w > 0) jgPost({ game: 'torres', score: w, apples: 0, dur: secs }).then((rec) => { const l = $w('#tdRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Lugar #${rec.rankDay} de hoy`; });
      el.innerHTML = `<b>${nb ? '¡Nuevo récord!' : 'El bosque resistió'}</b><span>Aguantaste <b>${w}</b> oleadas · ${st.killed} plagas</span><span class="small muted">Tu mejor: ${D.inf} oleadas</span>${st.gold ? `<span class="td-goldgain">+${st.gold} 🍂 hojas doradas</span>` : ''}${achHTML(st.ach)}<span class="small muted" id="tdRank"></span><div class="btn-row" style="justify-content:center"><button class="btn primary" data-e="re">Otra vez</button><button class="btn" data-e="out">Mapas</button></div>`;
    } else if (won) {
      const k = st.lives / LMAX; const stars = k >= 0.9 ? 3 : k >= 0.5 ? 2 : 1; const prev = D.st[MI] || 0;
      const firstWin = !prev; if (stars > prev) { D.st[MI] = stars; jgCoins((stars - prev) * 2); }
      const gold = firstWin ? 6 + stars * 3 + M.w * 2 + (M.kind === 'final' ? 25 : M.kind === 'jefes' ? 10 : 0) : 2 + stars + Math.max(0, stars - prev) * 3; D.gold += gold; D.wins = (D.wins || 0) + 1;
      let dayWin = false; if (daily && D.day.done !== tdToday()) { D.day.done = tdToday(); D.dayStars = (D.dayStars || 0) + 1; dayWin = true; jgCoins(3); D.gold += 15; }
      const ach = tdCheckAch(); if (firstWin) jgPost({ game: 'torresn', score: tdLvlsWon(), apples: 0, dur: secs }).catch(() => {});
      jpSave(); TDS.win();
      const next = MI + 1 < TD_MAPS.length && !daily; const newT = Object.values(TD_TW).filter((w) => w.un === MI + 1);
      const nw = TD_MAPS[MI + 1] && TD_MAPS[MI + 1].w !== M.w;
      el.innerHTML = `<b>${dayWin ? '¡Reto del día superado!' : '¡Salvaste el bosque!'}</b><span class="td-bigst">${[0, 1, 2].map((i) => `<i class="${i < stars ? 'on' : ''}">★</i>`).join('')}</span><span>${M.n} · ${st.lives}/${LMAX} vidas · ${st.killed} plagas</span><span class="td-goldgain">+${gold + (dayWin ? 15 : 0)} 🍂 hojas doradas</span>${achHTML(ach)}${stars > prev ? `<span class="pm-gain">+${stars - prev} ⭐ para tus raíces · +${(stars - prev) * 2} monedas para tu árbol</span>` : ''}${dayWin ? '<span class="pm-gain">+1 ⭐ dorada · +3 monedas</span>' : ''}${!daily && prev === 0 && TD_MAPS[MI + 1] ? `<span class="small">🔓 Abriste: ${TD_MAPS[MI + 1].n}${nw ? ` · ¡mundo nuevo: ${TD_WORLDS[TD_MAPS[MI + 1].w].n}!` : ''}${newT.map((w) => ` · torre nueva: ${w.n}`).join('')}</span>` : ''}
        <div class="btn-row" style="justify-content:center;flex-wrap:wrap">${next ? '<button class="btn primary" data-e="next">Siguiente nivel ›</button>' : ''}<button class="btn" data-e="re">Repetir</button><button class="btn" data-e="out">Niveles</button></div>`;
    } else {
      D.gold += 1; tdCheckAch(); jpSave(); TDS.lose();
      const tips = ['Mejora tus torres antes de comprar más.', 'Pon hongos en las curvas: el veneno dura más.', 'Usa las raíces cuando llegue el jefe.', 'El búho ve a las polillas fantasma.', 'El pino congela a grupos enteros: ponlo junto a la tortuga.', 'En Raíces puedes comprar mejoras con tus estrellas.', 'A nivel 4 las torres eligen una Maestría: ¡son mucho más fuertes!'];
      el.innerHTML = `<b>Las plagas llegaron al Gran Árbol</b><span>Llegaste a la oleada ${st.wave} de ${WAVES}</span><span class="small muted">Consejo: ${tips[(Math.random() * tips.length) | 0]}</span><div class="btn-row" style="justify-content:center"><button class="btn primary" data-e="re">Intentar de nuevo</button><button class="btn" data-e="out">Mapas</button></div>`;
    }
    el.hidden = false; el.classList.add('show');
    el.onclick = (ev) => { const b = ev.target.closest('[data-e]'); if (!b) return; const a = b.dataset.e; if (a === 're') { exit(false); tdStart(mi, daily); } else if (a === 'next') { exit(false); tdStart(MI + 1); } else exit(true); };
  }

  /* --- bucle --- */
  let hudT = 0;
  const loop = (now) => {
    st.id = requestAnimationFrame(loop);
    if (V.lowF !== low() && (++V.lowN) > 90) { V.lowN = 0; size(); }
    if (paused || st.choosing) { st.last = now; if (st.choosing) draw(); return; }
    const raw = Math.min(0.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
    for (let i = 0; i < st.speed; i++) step(raw);
    stepFx(raw); draw(); TDS.tickMusic(!st.over, M.w);
    hudT += raw; if (hudT > 0.2) { hudT = 0; hud(); }
  };
  st.id = requestAnimationFrame(loop); hud(); paintChips();
  if (!INF) st.banner = { text: `Nivel ${MI + 1} · ${M.n}`, sub: [M.kind !== 'normal' ? TD_KINDS[M.kind].e + ' ' + TD_KINDS[M.kind].n : '', ...(M.tw || []).map((k) => TD_TWISTS[k].e + ' ' + TD_TWISTS[k].n)].filter(Boolean).join('  '), t: 0, boss: M.kind === 'final' };
  $w('#tdPk').addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b) hint(b.dataset.d, 4500); });
  hint(INF ? '♾️ Modo infinito: aguanta todas las oleadas que puedas' : MOD ? `📅 Reto: ${MOD.n} · ${MOD.d}` : TW.size ? twDesc() : `${M.n}: pon tus torres y toca Empezar`, 5200);
  const exit = (go) => {
    cancelAnimationFrame(st.id); removeEventListener('resize', size); removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', onVis);
    wrap.remove(); document.body.classList.remove('gm-on'); TD.run = null; TDC.m.clear();
    if (go) { if (location.hash !== '#/torres') location.hash = '#/torres'; else render(); }
  };
  TD.run = { exit, st: () => st, V, startWave, open: (x, y) => openBuild(x, y, pathCells.has(key(x, y))), tower: (t) => openTower(t), pathCells, blocked };
}

EXTRA_VIEWS.torres = viewTorres; EXTRA_NAV.torres = 'juegos';
{
  const baseJuegos = viewJuegos;
  viewJuegos = function () { return baseJuegos().replace('<ul class="rows" style="margin-top:18px">', `<ul class="rows" style="margin-top:18px"><li><a href="#/torres"><span class="ico">${icon('play')}</span><span class="txt"><b>Defensa del Bosque <em class="sc-new">Nuevo</em></b><span>300 niveles en 12 mundos, 12 jefes, tienda, logros y un reto cada día.</span></span>${icon('chev', 'chev')}</a></li>`); };
  EXTRA_VIEWS.juegos = viewJuegos;
}
