/* Cinnavia 7.64 — Defensa del Bosque 2.
   Defensa de torres: las plagas quieren llegar al Gran Árbol. 30 mapas en 6 mundos (Pradera, Pantano, Nevado,
   Volcán, Jardín encantado y Reino de las nubes), 9 torres con 4 niveles y 2 especialidades cada una (incluida una
   trampa que va sobre el camino), 12 plagas, 6 jefes con poderes que congelan, queman o paralizan tus torres,
   2 poderes, reto del día con reglas especiales, raíces (mejoras para siempre) y modo infinito con ranking.
   Controles solo de tocar (la acción ocurre al soltar el dedo). Sprites en caché para que vaya fluido. */
'use strict';

const TD = { run: null, tab: 'mapas' };
const TD_COLS = 9, TD_ROWS = 13;
const tdData = () => { const d = jpData('torres'); d.st ||= {}; d.meta ||= {}; d.best ||= {}; d.inf ??= 0; d.day ||= {}; d.dayStars ??= 0; d.kills ??= 0; return d; };

/* ---------- mundos y mapas ---------- */
const TD_WORLDS = [
  { n: 'Pradera', g: ['#9bd56a', '#8fcb5f'], p: ['#e2c58f', '#cfae74'], deco: 'flor', bg: '#7fb94e', fx: 'hoja', boss: 'taladora' },
  { n: 'Pantano', g: ['#7fb38a', '#74a880'], p: ['#9c8a6a', '#86765a'], deco: 'junco', bg: '#5f8f6a', fx: 'luciernaga', boss: 'sapo' },
  { n: 'Nevado', g: ['#eef6fb', '#e2edf5'], p: ['#b9c9d6', '#a3b5c4'], deco: 'pino', bg: '#cfe1ee', fx: 'nieve', boss: 'golem' },
  { n: 'Volcán', g: ['#6b4a3e', '#62443a'], p: ['#3a2a26', '#2e211d'], deco: 'lava', bg: '#4a3028', fx: 'brasa', boss: 'dragon' },
  { n: 'Jardín encantado', g: ['#c9b6f0', '#bca8e8'], p: ['#f4d8ec', '#e8c2dc'], deco: 'cristal', bg: '#9f88d0', fx: 'petalo', boss: 'reina' },
  { n: 'Reino de las nubes', g: ['#f4f8ff', '#e8f0fe'], p: ['#ffe08a', '#f2c95a'], deco: 'nube', bg: '#bcd6f8', fx: 'brillo', boss: 'tormenta' },
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
const TD_GEN_NAMES = [
  ['Colina de tréboles', 'Valle de amapolas'], ['Ciénaga brumosa', 'Puente de lianas'], ['Lago congelado', 'Paso de la ventisca'], ['Grietas ardientes', 'Cráter dormido'],
  ['Arco de cristal', 'Fuente de hadas', 'Laberinto de rosas', 'Bosque de lunas', 'Trono de las flores'], ['Escalera de nubes', 'Islas flotantes', 'Puente del arcoíris', 'Torres del viento', 'Palacio del cielo'],
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
const TD_MAPS = (() => {
  const out = [];
  TD_WORLDS.forEach((W, wi) => {
    TD_HAND.filter((m) => m.w === wi).forEach((m) => out.push(m));
    TD_GEN_NAMES[wi].forEach((n, k) => { const idx = out.length; out.push({ n, w: wi, paths: tdGenPath(idx * 7919 + wi * 131 + k * 17, (k + wi) % 2 === 1 || wi >= 4) }); });
  });
  return out;
})();
const tdWaves = (mi) => Math.min(30, 12 + Math.floor(mi * 0.7));

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

/* ---------- dibujos (se guardan en caché como imágenes) ---------- */
function tdDrawTower(g, k, lvl, x, y, T, t = 0, aim = 0, spec = 0) {
  const s = T / 40; g.save(); g.translate(x, y); g.scale(s, s);
  const C = TD_TW[k].c;
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
  for (let i = 0; i <= lvl; i++) { g.fillStyle = spec ? '#ff8fcf' : '#ffd23c'; g.strokeStyle = '#8a6a00'; g.lineWidth = 0.8; g.beginPath(); const px = -(lvl * 4) / 2 + i * 4; g.arc(px, 15, 1.8, 0, 7); g.fill(); g.stroke(); }
  g.restore();
}
function tdDrawEnemy(g, e, x, y, T, t) {
  const E = TD_EN[e.k], s = T / 40 * (E.boss ? 1.9 : 1.25); g.save(); g.translate(x, y); g.scale(s, s);
  const wob = Math.sin(t * 12 + (e.id || 0)) * 1.5, f2 = Math.sin(t * 20 + (e.id || 0)) * 0.5 + 0.5;
  if (!E.fly) { g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 8, 9, 3, 0, 0, 7); g.fill(); }
  g.scale(e.dir || 1, 1);
  const k = e.k;
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
  const tabs = [['mapas', 'Mapas'], ['raices', 'Raíces'], ['guia', 'Guía']];
  const seg = `<div class="mz-tabs" role="group">${tabs.map(([k, l]) => `<button type="button" data-act="td-tab" data-v="${k}" aria-pressed="${TD.tab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (TD.tab === 'mapas') {
    const dl = tdDaily(), done = d.day.done === tdToday();
    body = `<div class="td-daily${done ? ' done' : ''}"><div><b>📅 Reto del día · ${TD_MAPS[dl.mi].n}</b><span>${dl.mod.n}: ${dl.mod.d}.</span><small>${done ? '¡Listo por hoy! Vuelve mañana.' : 'Gánalo para obtener una estrella dorada ⭐ para tus raíces.'}</small></div>${done ? '<span class="td-ok">✓</span>' : `<button type="button" class="btn primary" data-act="td-play" data-m="${dl.mi}" data-daily="1">Jugar</button>`}</div>`
      + TD_WORLDS.map((W, wi) => { const ms = TD_MAPS.map((M, mi) => ({ M, mi })).filter((x) => x.M.w === wi); const got = ms.reduce((a, x) => a + (d.st[x.mi] || 0), 0); return `<h2 class="sec">${W.n} <span class="td-wst">★ ${got}/${ms.length * 3}</span></h2><div class="td-maps">${ms.map(({ M, mi }) => { const open = tdUnlocked(mi), s = d.st[mi] || 0; return `<button type="button" class="td-map${open ? '' : ' lock'}" data-act="td-play" data-m="${mi}" ${open ? '' : 'disabled'}><canvas width="90" height="130" data-tdmap="${mi}"></canvas><b>${mi + 1}. ${M.n}</b><span class="td-st">${[0, 1, 2].map((i) => `<i class="${i < s ? 'on' : ''}">★</i>`).join('')}</span><small>${open ? `${tdWaves(mi)} oleadas${M.paths.length > 1 ? ` · ${M.paths.length} entradas` : ''}` : '🔒 Supera el anterior'}</small></button>`; }).join('')}</div>`; }).join('')
      + `<h2 class="sec">Modo infinito</h2><div class="td-inf"><div><b>♾️ Oleadas sin fin</b><span class="small muted">${(d.st[TD_MAPS.length - 1] || 0) > 0 ? `Cada vez más difícil y con todos los jefes. Tu mejor: <b>${d.inf || 0}</b> oleadas.` : 'Se abre al superar el último mapa.'}</span></div><button type="button" class="btn primary" data-act="td-play" data-m="inf" ${(d.st[TD_MAPS.length - 1] || 0) > 0 ? '' : 'disabled'}>Jugar</button></div><div id="jgRank-torres">${jgRankHTML('torres')}</div>`;
    setTimeout(tdPaintMaps, 0);
  } else if (TD.tab === 'raices') {
    body = `<p class="page-sub" style="margin-top:12px">Cada estrella que ganas hace crecer las raíces de tu bosque: mejoras que duran para siempre.</p>
      <p class="small" style="text-align:center">Estrellas: <b>${tot}</b>${d.dayStars ? ` (${d.dayStars} doradas)` : ''} · disponibles: <b>⭐ ${free}</b></p>
      <ul class="mz-list">${TD_META.map((m) => { const l = tdMeta(m.id), max = l >= m.max, c = tdMetaCost(l); return `<li><div><b>${m.n} · ${l}/${m.max}</b><span class="small muted">${m.d}</span></div>${max ? '<span class="mz-ok">Máximo</span>' : `<button type="button" class="btn${free >= c ? ' primary' : ''}" data-act="td-meta" data-id="${m.id}" ${free >= c ? '' : 'disabled'}>⭐ ${c}</button>`}</li>`; }).join('')}</ul>
      ${tdMetaSpent() ? '<p style="text-align:center"><button class="link-btn" data-act="td-meta-reset">Reiniciar raíces (te devuelve las estrellas)</button></p>' : ''}`;
  } else {
    body = `<h2 class="sec">Torres</h2><ul class="td-guide">${Object.entries(TD_TW).map(([k, w]) => `<li><canvas width="80" height="80" data-tdtw="${k}"></canvas><div><b>${w.n}${tdTowerOpen(k) ? '' : ' 🔒'}</b><span class="small muted">${w.d}${tdTowerOpen(k) ? '' : ` Se abre al superar el mapa ${w.un}.`}</span><span class="small">🌰 ${w.cost[0]} · Especialidades: ${w.spec.map((s) => `<b>${s[0]}</b> (${s[1].toLowerCase()})`).join(' o ')}</span></div></li>`).join('')}</ul>
      <h2 class="sec">Plagas y jefes</h2><ul class="td-guide">${Object.entries(TD_EN).filter(([k]) => k !== 'gusito').map(([k, e]) => `<li><canvas width="80" height="80" data-tden="${k}"></canvas><div><b>${e.n}</b><span class="small muted">${e.d}</span></div></li>`).join('')}</ul>
      <p class="small muted">Poderes: 🌰 <b>Lluvia de bellotas</b> (daño en área) y 🌿 <b>Raíces</b> (detiene a los enemigos). Toca el poder y luego el lugar del mapa. Al nivel 4, cada torre puede tomar una de dos <b>especialidades</b>.</p>`;
    setTimeout(tdPaintGuide, 0);
  }
  return `<section class="gm-home"><div class="gm-hero">${tdHero()}</div><h1 class="page-title gm-title">Defensa del Bosque</h1>
    <p class="page-sub">Las plagas quieren llegar al Gran Árbol. <b>Toca el pasto</b> para poner torres, <b>toca el camino</b> para poner trampas y <b>toca una torre</b> para mejorarla. Usa tus poderes en los momentos difíciles.</p>
    <div class="mz-head"><span>⭐ <b>${tot}</b></span><span>Mapas <b>${Object.keys(d.st).filter((k) => d.st[k] > 0).length}</b>/${TD_MAPS.length}</span><span>Plagas vencidas <b>${(d.kills || 0).toLocaleString('es-MX')}</b></span></div>${seg}${body}</section>`;
}
function tdPaintMaps() {
  document.querySelectorAll('canvas[data-tdmap]').forEach((cv) => { const mi = +cv.dataset.tdmap; const M = TD_MAPS[mi], W = TD_WORLDS[M.w]; const g = cv.getContext('2d'); const T = 10; g.fillStyle = W.g[0]; g.fillRect(0, 0, 90, 130); g.strokeStyle = W.p[1]; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'round'; for (const p of M.paths) { g.beginPath(); p.forEach(([x, y], i) => { const X = (x + 0.5) * T, Y = (y + 0.5) * T; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.stroke(); } const e = M.paths[0][M.paths[0].length - 1]; g.fillStyle = '#2f8a40'; g.beginPath(); g.arc((e[0] + 0.5) * T, (e[1] + 0.5) * T, 7, 0, 7); g.fill(); });
}
function tdPaintGuide() {
  document.querySelectorAll('canvas[data-tdtw]').forEach((cv) => { const g = cv.getContext('2d'); g.clearRect(0, 0, 80, 80); tdDrawTower(g, cv.dataset.tdtw, 3, 40, 40, 60, 1); });
  document.querySelectorAll('canvas[data-tden]').forEach((cv) => { const g = cv.getContext('2d'); g.clearRect(0, 0, 80, 80); const b = TD_EN[cv.dataset.tden].boss; tdDrawEnemy(g, { k: cv.dataset.tden, id: 1, dir: 1 }, 40, b ? 50 : 46, b ? 34 : 56, 1); });
}
JG_CFG.torres = { tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']], val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'partida', 'partidas') : `${x.score} oleadas`), mine: (m) => `Tu mejor: <b>${m.best || 0} oleadas</b> · partidas: <b>${m.games || 0}</b>`, none: 'Aún nadie juega el modo infinito en este periodo.' };
Object.assign(VIDA_ACTS, {
  'td-tab': (el) => { TD.tab = el.dataset.v; render(); },
  'td-play': (el) => tdStart(el.dataset.m === 'inf' ? 'inf' : +el.dataset.m, !!el.dataset.daily),
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
    const sc = [[262, 330, 392, 440], [220, 262, 330, 392], [294, 370, 440, 494], [196, 233, 294, 349], [247, 311, 370, 415], [330, 415, 494, 554]][wi % 6];
    while (this.nb < ac.currentTime + 0.3) { const s = this.beat % 16, t = this.nb - ac.currentTime; if (s % 8 === 0) this.tone(sc[0] / 2, 1.5, 'sine', 0.02, 0, t); if (s % 2 === 0) this.tone(sc[[0, 2, 1, 3, 2, 1, 3, 0][(s / 2) | 0]] * 2, 0.25, 'triangle', 0.008, 0, t); this.nb += 0.22; this.beat++; }
  },
};

/* ---------- la partida ---------- */
function tdStart(mi, daily) {
  if (TD.run) return; TDS.init();
  const D = tdData(); const INF = mi === 'inf'; const MI = INF ? TD_MAPS.length - 1 : mi; const M = TD_MAPS[MI], W = TD_WORLDS[M.w];
  const MOD = daily ? tdDaily().mod : null; const mk = MOD ? MOD.k : '';
  const WAVES = INF ? Infinity : tdWaves(MI);
  const wrap = document.createElement('div'); wrap.className = 'gl-stage td-stage';
  wrap.innerHTML = `<canvas aria-label="Defensa del Bosque"></canvas>
    <div class="td-top"><button class="gm-x" id="tdX" aria-label="Salir">${icon('x')}</button><span class="td-pill" id="tdLp">❤️ <b id="tdL">20</b></span><span class="td-pill" id="tdSp2">🌰 <b id="tdS">0</b></span><span class="td-pill td-w">🌊 <b id="tdW">0</b>${INF ? '' : `/${WAVES}`}</span><button class="td-btn" id="tdSp" aria-label="Velocidad">1×</button><button class="td-btn" id="tdPa" aria-label="Pausa">❚❚</button></div>
    <div class="td-panel" id="tdPanel" hidden></div>
    <div class="td-bot"><button class="td-pow" id="tdP1" aria-label="Lluvia de bellotas">🌰<i></i></button><button class="td-pow" id="tdP2" aria-label="Raíces">🌿<i></i></button><span class="td-hint" id="tdHint"></span><button class="btn primary td-next" id="tdNext">▶ Empezar</button></div>
    <div class="gl-over" id="tdPause" hidden><b>Pausa</b><div class="btn-row" style="justify-content:center;flex-wrap:wrap"><button class="btn primary" id="tdGo">${icon('play')}Seguir</button><button class="btn" id="tdMus">Música: ${TDS.music ? 'sí' : 'no'}</button><button class="btn" id="tdRe">Reiniciar</button><button class="btn" id="tdOut">Salir</button></div></div>
    <div class="gl-over td-end" id="tdEnd" hidden></div>`;
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

  const size = () => {
    V.dpr = Math.min(2, devicePixelRatio || 1); V.w = innerWidth; V.h = innerHeight; c.width = Math.round(V.w * V.dpr); c.height = Math.round(V.h * V.dpr); c.style.width = V.w + 'px'; c.style.height = V.h + 'px';
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
    for (let i = 0; i < 160; i++) { const x = V.ox + r2() * TD_COLS * T, y = V.oy + r2() * TD_ROWS * T; q.fillStyle = W.deco === 'pino' || W.deco === 'nube' ? 'rgba(255,255,255,.7)' : 'rgba(0,0,0,.07)'; q.fillRect(x, y, 2, 2); if (W.deco === 'flor' && r2() < 0.25) { q.fillStyle = ['#fff', '#ffd23c', '#ff8fab'][i % 3]; q.beginPath(); q.arc(x, y, 1.6, 0, 7); q.fill(); } }
    for (const p of PATHS) { q.strokeStyle = 'rgba(0,0,0,.15)'; q.lineWidth = T * 0.92; q.lineJoin = 'round'; q.lineCap = 'round'; q.beginPath(); p.P.forEach(([x, y], i) => { const X = V.ox + x * T, Y = V.oy + y * T + 2; if (i) q.lineTo(X, Y); else q.moveTo(X, Y); }); q.stroke(); }
    for (const p of PATHS) { q.lineJoin = 'round'; q.lineCap = 'round'; q.beginPath(); p.P.forEach(([x, y], i) => { const X = V.ox + x * T, Y = V.oy + y * T; if (i) q.lineTo(X, Y); else q.moveTo(X, Y); }); q.strokeStyle = W.p[1]; q.lineWidth = T * 0.86; q.stroke(); q.strokeStyle = W.p[0]; q.lineWidth = T * 0.7; q.stroke(); q.setLineDash([2, T * 0.45]); q.strokeStyle = 'rgba(0,0,0,.12)'; q.lineWidth = 3; q.stroke(); q.setLineDash([]); }
    for (const d of decos) {
      const X = V.ox + (d.x + 0.5) * T, Y = V.oy + (d.y + 0.5) * T;
      if (W.deco === 'flor') { if (d.k < 0.5) { q.fillStyle = '#8a8f98'; q.beginPath(); q.ellipse(X, Y + T * 0.1, T * 0.32, T * 0.24, 0, 0, 7); q.fill(); q.fillStyle = '#a8adb6'; q.beginPath(); q.ellipse(X - T * 0.08, Y, T * 0.2, T * 0.12, 0, 0, 7); q.fill(); } else { q.fillStyle = '#2f8a40'; q.beginPath(); q.arc(X, Y - T * 0.08, T * 0.36, 0, 7); q.fill(); q.fillStyle = '#4aaa5a'; q.beginPath(); q.arc(X - T * 0.1, Y - T * 0.16, T * 0.18, 0, 7); q.fill(); } }
      else if (W.deco === 'junco') { q.fillStyle = '#4a8aa8'; q.beginPath(); q.ellipse(X, Y, T * 0.42, T * 0.3, 0, 0, 7); q.fill(); q.fillStyle = 'rgba(255,255,255,.3)'; q.beginPath(); q.ellipse(X - T * 0.1, Y - T * 0.06, T * 0.16, T * 0.06, 0, 0, 7); q.fill(); q.strokeStyle = '#3a6a2a'; q.lineWidth = 2; for (let k = -1; k <= 1; k++) { q.beginPath(); q.moveTo(X + k * T * 0.2, Y + T * 0.2); q.lineTo(X + k * T * 0.25, Y - T * 0.35); q.stroke(); } }
      else if (W.deco === 'pino') { q.fillStyle = '#2f6a4a'; q.beginPath(); q.moveTo(X, Y - T * 0.45); q.lineTo(X - T * 0.32, Y + T * 0.25); q.lineTo(X + T * 0.32, Y + T * 0.25); q.fill(); q.fillStyle = '#fff'; q.beginPath(); q.moveTo(X, Y - T * 0.45); q.lineTo(X - T * 0.14, Y - T * 0.12); q.lineTo(X + T * 0.14, Y - T * 0.12); q.fill(); }
      else if (W.deco === 'lava') { q.fillStyle = d.k < 0.5 ? '#ff7a1f' : '#3a2a26'; q.beginPath(); q.ellipse(X, Y, T * 0.38, T * 0.28, 0, 0, 7); q.fill(); if (d.k < 0.5) { q.fillStyle = '#ffd23c'; q.beginPath(); q.ellipse(X - T * 0.06, Y - T * 0.04, T * 0.14, T * 0.08, 0, 0, 7); q.fill(); } }
      else if (W.deco === 'cristal') { q.fillStyle = d.k < 0.5 ? '#ff9ad8' : '#9ad8ff'; for (let k = -1; k <= 1; k++) { q.beginPath(); q.moveTo(X + k * T * 0.18, Y + T * 0.25); q.lineTo(X + k * T * 0.18 - T * 0.08, Y - T * 0.05); q.lineTo(X + k * T * 0.18, Y - T * (0.35 - Math.abs(k) * 0.12)); q.lineTo(X + k * T * 0.18 + T * 0.08, Y - T * 0.05); q.fill(); } }
      else { q.fillStyle = '#ffffff'; q.beginPath(); q.arc(X - T * 0.15, Y, T * 0.22, 0, 7); q.arc(X + T * 0.12, Y - T * 0.06, T * 0.26, 0, 7); q.arc(X + T * 0.05, Y + T * 0.1, T * 0.2, 0, 7); q.fill(); }
    }
    for (const p of M.paths) { const [x, y] = p[0]; const X = V.ox + (Math.max(-0.2, Math.min(TD_COLS - 0.8, x)) + 0.5) * T, Y = V.oy + (Math.max(-0.2, Math.min(TD_ROWS - 0.8, y)) + 0.5) * T; q.fillStyle = 'rgba(200,40,40,.4)'; q.beginPath(); q.arc(X, Y, T * 0.42, 0, 7); q.fill(); q.fillStyle = '#fff'; q.font = `900 ${Math.round(T * 0.4)}px system-ui`; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('!', X, Y + 1); }
    q.strokeStyle = 'rgba(0,0,0,.18)'; q.lineWidth = 2; q.strokeRect(V.ox, V.oy, TD_COLS * T, TD_ROWS * T);
  }

  /* --- estado --- */
  const LMAX = 20 + tdMeta('vidas') * 2;
  const st = { lives: LMAX, seeds: Math.round((140 + tdMeta('semillas') * 25) * (mk === 'pobre' ? 0.55 : 1)), wave: 0, phase: 'build', countdown: 0, queue: [], spawnT: 0, en: [], tw: [], pr: [], parts: [], floats: [], rings: [], bolts: [], fly: [], wx: [], t: 0, speed: 1, sel: null, build: null, aim: null, cd: { a: 0, r: 0 }, treeHit: 0, hurt: 0, eid: 0, killed: 0, t0: Date.now(), over: false, last: performance.now(), id: 0, spawned: 0, banner: null, shake: 0 };
  const dmgMul = () => 1 + tdMeta('dano') * 0.06;
  const rngMul = mk === 'niebla' ? 0.85 : 1;
  const costOf = (k, l) => Math.round(TD_TW[k].cost[l] * (1 - tdMeta('barato') * 0.05));
  const specCost = (k) => Math.round(costOf(k, 3) * 1.3);
  const spentOf = (t) => { let s = 0; for (let l = 0; l <= t.lvl; l++) s += costOf(t.k, l); if (t.spec) s += specCost(t.k); return s; };
  const sellOf = (t) => Math.round(spentOf(t) * (tdMeta('venta') ? 0.85 : 0.7));
  const cdA = () => 25 * (1 - tdMeta('poder') * 0.12), cdR = () => 35 * (1 - tdMeta('poder') * 0.12);
  const towerAt = (x, y) => st.tw.find((t) => t.x === x && t.y === y);
  const RNG = (t) => TD_TW[t.k].rng[t.lvl] * rngMul * (t.k === 'ardilla' && t.spec === 2 ? 1.5 : 1);
  const recalcBuff = () => { for (const t of st.tw) { t.bm = 1; for (const a of st.tw) { if (a.k !== 'arbol' || a === t) continue; if (Math.hypot(a.x - t.x, a.y - t.y) <= TD_TW.arbol.rng[a.lvl] + 0.01) t.bm += TD_TW.arbol.buff[a.lvl] + (a.spec === 1 ? 0.6 : 0); } } };
  const float = (text, x, y, col, big) => { if (st.floats.length < 40) st.floats.push({ text, x, y, t: 0, col: col || '#fff', big }); };
  const puff = (x, y, col, n, sp = 2) => { const cap = low() ? 70 : 180; for (let i = 0; i < n && st.parts.length < cap; i++) { const a = Math.random() * 6.28, v = sp * (0.3 + Math.random()); st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, l: 0.4 + Math.random() * 0.4, c: col, r: 1.5 + Math.random() * 2.5 }); } };
  const ring = (x, y, r1, col, T2 = 0.4) => { if (st.rings.length < 20) st.rings.push({ x, y, r1, col, t: 0, T: T2 }); };
  const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* */ } };
  // clima del mundo
  for (let i = 0; i < (low() ? 8 : 22); i++) st.wx.push({ x: Math.random() * TD_COLS, y: Math.random() * TD_ROWS, s: 0.5 + Math.random(), ph: Math.random() * 6 });

  /* --- oleadas --- */
  const BOSSES = ['taladora', 'sapo', 'golem', 'dragon', 'reina', 'tormenta'];
  function makeWave(w) {
    const lvl = INF ? 15 + w * 0.5 : MI;
    const pool = [['escarabajo', 5]];
    if (w >= 3 || lvl >= 1) pool.push(['hormiga', 3]);
    if (w >= 5 || lvl >= 2) pool.push(['caracol', 2]);
    if (w >= 6 || lvl >= 3) pool.push(['polilla', 2.5]);
    if (lvl >= 4 && w >= 4) pool.push(['topo', 2]);
    if (lvl >= 6 && w >= 5) pool.push(['escudo', 2.2]);
    if (lvl >= 7 && w >= 6) pool.push(['sanadora', 1.2]);
    if (lvl >= 9 && w >= 5) pool.push(['gusano', 2]);
    if (lvl >= 12 && w >= 4) pool.push(['cuervo', 2]);
    if (lvl >= 15 && w >= 6) pool.push(['rino', 1.6]);
    if (lvl >= 18 && w >= 7) pool.push(['fantasma', 1.6]);
    const tot = pool.reduce((a, p) => a + p[1], 0); const pick = () => { let r = Math.random() * tot; for (const [k, wt] of pool) { r -= wt; if (r <= 0) return k; } return 'escarabajo'; };
    let n = Math.round(6 + w * 1.25 + Math.min(lvl, 20) * 0.45); if (mk === 'enjambre') n *= 2;
    const gap = Math.max(0.3, 0.95 - w * 0.02) * (mk === 'enjambre' ? 0.55 : 1);
    const q = []; let t = 0; const swarm = w > 3 && Math.random() < 0.25 ? pick() : null;
    for (let i = 0; i < n; i++) { q.push({ k: swarm && i % 2 ? swarm : pick(), t }); t += gap * (0.6 + Math.random() * 0.8); }
    const every = mk === 'jefes' ? 5 : 10;
    const boss = (!INF && ((w % every === 0 && w >= every) || w === WAVES)) || (INF && w >= 10 && w % 5 === 0);
    if (boss) q.push({ k: INF ? BOSSES[(w / 5) % BOSSES.length] : TD_WORLDS[M.w].boss, t: t + 1.5 });
    const hpMul = (1 + 0.13 * w + 0.009 * w * w) * (1 + Math.min(lvl, 40) * 0.09) * (mk === 'enjambre' ? 0.55 : 1);
    return { q, hpMul };
  }
  let WV = null;
  function startWave() {
    if (st.phase !== 'build' || st.over) return;
    if (st.wave > 0 && st.countdown > 0) { const b = Math.ceil(st.countdown); st.seeds += b; float(`+${b} 🌰 por adelantarte`, TD_COLS / 2, 1.5, '#ffe066'); }
    st.wave++; WV = makeWave(st.wave); st.queue = WV.q.slice(); st.spawnT = 0; st.phase = 'wave'; st.spawned = 0;
    const bossK = WV.q.find((x) => TD_EN[x.k].boss); st.banner = { text: `Oleada ${st.wave}`, sub: bossK ? `⚠️ ¡Viene ${TD_EN[bossK.k].n}!` : st.wave === WAVES ? '¡Última oleada!' : '', t: 0, boss: !!bossK };
    TDS.wave(); if (bossK) setTimeout(() => { if (wrap.isConnected) TDS.boss(); }, 900);
    hud();
  }
  function spawn(k) {
    const E = TD_EN[k]; const pi = st.spawned++ % PATHS.length; const hp = Math.round(E.hp * (WV ? WV.hpMul : 1));
    st.en.push({ id: ++st.eid, k, hp, max: hp, pi, d: 0, slowT: 0, slowK: 0, dotT: 0, dotD: 0, rootT: 0, frz: 0, under: false, burT: 2 + Math.random() * 2, healT: 2, powT: 3 + Math.random() * 2, chT: 3 + Math.random() * 2, chg: 0, sh: E.shield ? hp * E.shield : 0, x: 0, y: 0, dir: 1, dead: false, hit: 0, rev: false });
  }
  const armorOf = (E) => Math.max(E.armor || 0, mk === 'blindados' && !E.boss ? 0.2 : 0);
  function damage(e, amt, pierce, t) {
    if (e.dead || e.under) return; const E = TD_EN[e.k];
    const cc = tdMeta('critico') * 0.05 + (t && t.k === 'ardilla' && t.spec === 2 ? 0.25 : 0);
    if (cc && Math.random() < cc) { amt *= t && t.spec === 2 && t.k === 'ardilla' ? 3 : 2; if (!low()) float('¡Crítico!', e.x, e.y - 0.5, '#ffd23c'); TDS.crit(); }
    const ar = armorOf(E); if (ar && !pierce) amt *= 1 - ar;
    if (e.sh > 0) { const a = Math.min(e.sh, amt); e.sh -= a; amt -= a; if (e.sh <= 0) { ring(e.x, e.y, 0.6, '#9fd0ff', 0.3); puff(e.x, e.y, '#bfe3ff', 8, 2); } }
    e.hp -= amt; e.hit = 0.1; if (e.hp <= 0) kill(e);
  }
  function kill(e) {
    if (e.dead) return; e.dead = true; const E = TD_EN[e.k]; const rew = Math.round(E.rew * (1 + tdMeta('botin') * 0.1) * (mk === 'pobre' ? 1.4 : 1)); st.seeds += rew; st.killed++;
    puff(e.x, e.y, E.c, E.boss ? 50 : 9, E.boss ? 4.5 : 2.2); ring(e.x, e.y, E.boss ? 2.5 : 0.7, E.boss ? '#ffd23c' : 'rgba(255,255,255,.8)', E.boss ? 0.7 : 0.3); TDS.pop(E.boss);
    if (E.boss) { float(`¡${E.n} vencido! +${rew} 🌰`, e.x, e.y - 0.6, '#ffe066', true); st.shake = 0.8; st.flash = 0.5; vib([40, 40, 80]); }
    if (st.fly.length < 14) { const p = { x: V.ox + e.x * V.T, y: V.oy + e.y * V.T }; st.fly.push({ ...p, sx: p.x, sy: p.y, t: 0 }); }
    if (E.split) for (const o of [-0.25, 0.25]) { const hp = Math.round(TD_EN.gusito.hp * (WV ? WV.hpMul : 1)); st.en.push({ id: ++st.eid, k: 'gusito', hp, max: hp, pi: e.pi, d: Math.max(0, e.d + o), slowT: 0, slowK: 0, dotT: 0, dotD: 0, rootT: 0, frz: 0, under: false, burT: 9, healT: 9, powT: 9, chT: 9, chg: 0, sh: 0, x: e.x, y: e.y, dir: e.dir, dead: false, hit: 0 }); }
    TDS.coin();
  }

  /* --- torres --- */
  const dist = (t, e) => Math.hypot(e.x - (t.x + 0.5), e.y - (t.y + 0.5));
  function canSee(t, e) { const E = TD_EN[e.k]; if (!E.ghost) return true; return t.k === 'buho' || dist(t, e) <= 1.3; }
  function targets(t, rng, air, n) {
    const arr = [];
    for (const e of st.en) { if (e.dead || e.under) continue; if (TD_EN[e.k].fly && !air) continue; if (dist(t, e) > rng || !canSee(t, e)) continue; const rem = PATHS[e.pi].L - e.d; arr.push({ e, v: t.mode === 'fuerte' ? e.hp : t.mode === 'ultimo' ? rem : -rem }); }
    arr.sort((a, b) => b.v - a.v); return arr.slice(0, n || 1).map((x) => x.e);
  }
  function towerTick(t, dt) {
    if (t.born > 0) t.born -= dt;
    if (t.stun > 0) { t.stun -= dt; return; }
    const K = TD_TW[t.k], L = t.lvl, mul = dmgMul() * (t.bm || 1), rng = RNG(t);
    if (K.support) return;
    if (t.k === 'trampa') { const cx = t.x + 0.5, cy = t.y + 0.5; for (const e of st.en) { if (e.dead || e.under || TD_EN[e.k].fly) continue; if (Math.hypot(e.x - cx, e.y - cy) <= 0.6) { damage(e, K.dps[L] * (t.spec === 2 ? 2 : 1) * mul * dt, false, t); if (t.spec === 1) { e.slowT = 0.3; e.slowK = Math.max(e.slowK, 0.45); } if (Math.random() < dt * 6 && !low()) puff(e.x, e.y, '#7aa83a', 1, 1); } } return; }
    if (t.k === 'pino' && t.spec === 2) { for (const e of st.en) if (!e.dead && dist(t, e) <= rng) { e.slowT = 0.25; e.slowK = Math.max(e.slowK, 0.4); } }
    if (t.k === 'rayo') {
      let e = t.target && !t.target.dead && !t.target.under && dist(t, t.target) <= rng && canSee(t, t.target) ? t.target : null;
      if (!e) { e = targets(t, rng, 1)[0] || null; if (e !== t.target) t.ramp = 0; t.target = e; }
      const maxR = t.spec === 2 ? 6 : 3;
      if (e) { t.ramp = Math.min(maxR, (t.ramp || 0) + dt); damage(e, K.dps[L] * (1 + t.ramp) * mul * dt, true, t); t.extra = null; if (t.spec === 1) { t.extra = st.en.filter((o) => o !== e && !o.dead && !o.under && dist(t, o) <= rng && canSee(t, o)).slice(0, 2); for (const o of t.extra) damage(o, K.dps[L] * (1 + t.ramp) * 0.5 * mul * dt, true, t); } }
      return;
    }
    t.cd -= dt; if (t.cd > 0) return;
    if (t.k === 'pino') {
      const hit = st.en.filter((e) => !e.dead && !e.under && dist(t, e) <= rng); if (!hit.length) return;
      t.cd = K.rate[L]; t.kick = 0.15; TDS.shot('pino'); ring(t.x + 0.5, t.y + 0.5, rng, 'rgba(180,230,255,.9)', 0.45);
      for (const e of hit) { e.frz = Math.max(e.frz, t.spec === 1 ? 2.5 : K.frz[L]); damage(e, K.dmg[L] * mul, false, t); }
      if (!low()) puff(t.x + 0.5, t.y + 0.5, '#e8f8ff', 10, rng * 2);
      return;
    }
    const nT = t.k === 'ardilla' && t.spec === 1 ? 3 : t.k === 'tortuga' && t.spec === 2 ? 3 : 1;
    const ts = targets(t, rng, K.air, nT); if (!ts.length) return;
    const e = ts[0];
    t.cd = K.rate[L] * (t.k === 'tortuga' && t.spec === 1 ? 1.3 : 1); t.kick = 0.12; TDS.shot(t.k);
    const sx = t.x + 0.5, sy = t.y + 0.25;
    if (t.k === 'ardilla') for (const o of ts) st.pr.push({ k: 'flecha', x: sx, y: sy, e: o, dmg: K.dmg[L] * mul, sp: 13, t });
    else if (t.k === 'tortuga') for (const o of ts) st.pr.push({ k: 'bala', x0: sx, y0: sy, x1: o.x, y1: o.y, t: 0, T: 0.55, dmg: K.dmg[L] * mul * (t.spec === 1 ? 1.3 : 1), area: K.area[L] * (t.spec === 1 ? 1.8 : 1), tw: t });
    else if (t.k === 'abejas') { const nb = K.nb[L] + (t.spec === 1 ? 3 : 0); for (let i = 0; i < nb; i++) st.pr.push({ k: 'abeja', x: sx + (Math.random() - 0.5) * 0.4, y: sy, e, dmg: K.dmg[L] * mul * (t.spec === 2 ? 1.6 : 1), pierce: t.spec === 2, sp: 6 + Math.random(), life: 3, ph: Math.random() * 6, t }); }
    else if (t.k === 'hongo') { const ax = e.x, ay = e.y; for (const o of st.en) { if (o.dead || o.under) continue; if (Math.hypot(o.x - ax, o.y - ay) <= K.area[L]) { o.dotT = 2.5; o.dotD = Math.max(o.dotD, K.dot[L] * mul * (t.spec === 1 ? 2 : 1)); o.slowT = 1.6; o.slowK = Math.max(o.slowK, t.spec === 2 ? 0.7 : K.slow[L]); } } st.pr.push({ k: 'nube', x: ax, y: ay, t: 0, r: K.area[L], c: t.spec === 1 ? '120,220,80' : t.spec === 2 ? '140,110,60' : '200,120,220' }); }
    else if (t.k === 'buho') {
      const n = t.spec === 1 ? 9 : K.ch[L]; let cur = e; const hitS = new Set([e]); const pts = [[sx, sy - 0.2], [e.x, e.y]]; let dmg = K.dmg[L] * mul * (t.spec === 2 ? 1.8 : 1);
      damage(e, dmg, true, t); if (t.spec === 2) { e.slowT = 1; e.slowK = Math.max(e.slowK, 0.3); }
      for (let i = 1; i < n; i++) { let nx = null, bd = 1.8; for (const o of st.en) { if (o.dead || o.under || hitS.has(o)) continue; const dd = Math.hypot(o.x - cur.x, o.y - cur.y); if (dd < bd) { bd = dd; nx = o; } } if (!nx) break; hitS.add(nx); pts.push([nx.x, nx.y]); dmg *= 0.85; damage(nx, dmg, true, t); cur = nx; }
      st.bolts.push({ pts, t: 0, c: t.spec === 2 ? '#ffe066' : '#c8a8ff' });
    }
  }

  /* --- jefes --- */
  function bossPower(e, dt) {
    const E = TD_EN[e.k]; if (!E.pow) return; e.powT -= dt; if (e.powT > 0) return;
    if (E.pow === 'salto') { e.powT = 4; e.d += 1.6; ring(e.x, e.y, 1.6, 'rgba(120,200,80,.9)', 0.5); st.shake = 0.3; TDS.bpow(); }
    else if (E.pow === 'hielo') { e.powT = 5; let n = 0; for (const t of st.tw) if (Math.hypot(t.x + 0.5 - e.x, t.y + 0.5 - e.y) <= 2) { t.stun = 2.2; t.stunK = 'hielo'; n++; } ring(e.x, e.y, 2, 'rgba(180,230,255,.95)', 0.6); TDS.bpow(); if (n) float('¡Congeló tus torres!', e.x, e.y - 0.8, '#bfe3ff'); }
    else if (E.pow === 'fuego') { e.powT = 4; let b = null, bd = 3; for (const t of st.tw) { const dd = Math.hypot(t.x + 0.5 - e.x, t.y + 0.5 - e.y); if (dd < bd) { bd = dd; b = t; } } if (b) { b.stun = 3; b.stunK = 'fuego'; st.bolts.push({ pts: [[e.x, e.y], [b.x + 0.5, b.y + 0.5]], t: 0, c: '#ff7a1f', w: 5 }); puff(b.x + 0.5, b.y + 0.5, '#ff7a1f', 14, 2.5); TDS.bpow(); } }
    else if (E.pow === 'cria') { e.powT = 3; for (let i = 0; i < 2; i++) { spawn('polilla'); const n = st.en[st.en.length - 1]; n.pi = e.pi; n.d = Math.max(0, e.d - 0.3 * i); n.hp = n.max = Math.round(TD_EN.polilla.hp * (WV ? WV.hpMul : 1) * 0.6); } TDS.bpow(); }
    else if (E.pow === 'rayo') { e.powT = 4.5; const near = st.tw.filter((t) => Math.hypot(t.x + 0.5 - e.x, t.y + 0.5 - e.y) <= 3); if (near.length) { const b = near[(Math.random() * near.length) | 0]; b.stun = 2.5; b.stunK = 'rayo'; st.bolts.push({ pts: [[e.x, e.y - 0.5], [(e.x + b.x + 0.5) / 2 + 0.3, (e.y + b.y) / 2], [b.x + 0.5, b.y + 0.5]], t: 0, c: '#ffe066', w: 4 }); st.flash = 0.3; TDS.bpow(); } }
  }

  /* --- poderes --- */
  function cast(kind, x, y) {
    if (kind === 'a') { st.cd.a = cdA(); TDS.acorn(); st.pr.push({ k: 'bellotas', x, y, t: 0 }); }
    else { st.cd.r = cdR(); TDS.root(); for (const e of st.en) if (!e.dead && Math.hypot(e.x - x, e.y - y) <= 1.5 && !TD_EN[e.k].fly) e.rootT = TD_EN[e.k].boss ? 1.5 : 3; st.pr.push({ k: 'raiz', x, y, t: 0 }); ring(x, y, 1.5, 'rgba(120,80,40,.8)', 0.5); }
    st.aim = null; hint(''); paintPow();
  }

  /* --- paso de simulación --- */
  function step(dt) {
    st.t += dt; if (st.treeHit > 0) st.treeHit -= dt; if (st.hurt > 0) st.hurt -= dt; if (st.flash > 0) st.flash -= dt;
    st.cd.a = Math.max(0, st.cd.a - dt); st.cd.r = Math.max(0, st.cd.r - dt);
    if (st.banner) { st.banner.t += dt; if (st.banner.t > 2.4) st.banner = null; }
    if (st.over) return;
    if (st.phase === 'build' && st.wave > 0) { st.countdown -= dt; if (st.countdown <= 0) startWave(); }
    if (st.phase === 'wave') { st.spawnT += dt; while (st.queue.length && st.queue[0].t <= st.spawnT) spawn(st.queue.shift().k); }
    const spMod = mk === 'rapidos' ? 1.3 : 1;
    for (const e of st.en) {
      if (e.dead) continue; const E = TD_EN[e.k];
      if (e.hit > 0) e.hit -= dt;
      if (e.dotT > 0) { e.dotT -= dt; damage(e, e.dotD * dt, true); if (e.dead) continue; } else e.dotD = 0;
      if (e.slowT > 0) e.slowT -= dt; else e.slowK = 0;
      if (E.burrow) { e.burT -= dt; if (e.burT <= 0) { e.under = !e.under; e.burT = e.under ? 1.1 : 2.2 + Math.random() * 1.5; if (!low()) puff(e.x, e.y, '#8a6a4a', 5, 1.5); } }
      if (E.heal) { e.healT -= dt; if (e.healT <= 0) { e.healT = 2.2; for (const o of st.en) if (!o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 1.3) o.hp = Math.min(o.max, o.hp + o.max * 0.12); ring(e.x, e.y, 1.3, 'rgba(160,255,160,.8)', 0.4); } }
      if (E.charge) { if (e.chg > 0) { e.chg -= dt; if (!low() && Math.random() < dt * 20) puff(e.x, e.y + 0.2, '#c8b89a', 1, 1); } else { e.chT -= dt; if (e.chT <= 0) { e.chg = 0.8; e.chT = 3 + Math.random() * 2.5; } } }
      if (E.boss) bossPower(e, dt);
      let sp = E.sp * spMod * (1 - e.slowK) * (e.chg > 0 ? 3 : 1);
      if (e.rootT > 0) { e.rootT -= dt; sp = 0; }
      if (e.frz > 0) { e.frz -= dt; sp = 0; }
      e.d += sp * dt; const p = posAt(e.pi, e.d); if (p.dx) e.dir = p.dx; e.x = p.x; e.y = p.y;
      if (e.d >= PATHS[e.pi].L) { e.dead = true; const n = E.lives || 1; st.lives -= n; st.treeHit = 0.5; st.hurt = 0.6; TDS.hurt(); float(`−${n} ❤️`, tree[0] + 0.5, tree[1], '#ff6b6b', true); vib(E.boss ? [80, 40, 80] : 60); if (st.lives <= 0) { st.lives = 0; end(false); return; } }
    }
    st.en = st.en.filter((e) => !e.dead);
    for (const t of st.tw) { towerTick(t, dt); if (t.kick > 0) t.kick -= dt; }
    for (const q of st.pr) {
      if (q.k === 'flecha' || q.k === 'abeja') {
        if (q.e.dead || q.e.under) { if (q.k === 'abeja') { let b = null, bd = 3; for (const e of st.en) { if (e.dead || e.under) continue; const dd = Math.hypot(e.x - q.x, e.y - q.y); if (dd < bd) { bd = dd; b = e; } } if (b) q.e = b; else q.done = true; } else q.done = true; }
        if (q.done) continue;
        const dx = q.e.x - q.x, dy = q.e.y - q.y, dd = Math.hypot(dx, dy);
        if (q.k === 'abeja') { q.life -= dt; q.ph += dt * 20; if (q.life <= 0) { q.done = true; continue; } }
        if (dd < 0.22) { const air = TD_EN[q.e.k].fly; damage(q.e, q.dmg * (q.k === 'abeja' && air ? 2 : 1), q.pierce, q.t); q.done = true; continue; }
        q.x += dx / dd * q.sp * dt; q.y += dy / dd * q.sp * dt; q.ang = Math.atan2(dy, dx);
      } else if (q.k === 'bala') { q.t += dt; if (q.t >= q.T) { q.done = true; TDS.boom(); puff(q.x1, q.y1, '#a89a8a', low() ? 5 : 10, 2.5); ring(q.x1, q.y1, q.area, 'rgba(255,230,180,.85)', 0.3); for (const e of st.en) if (!e.dead && !TD_EN[e.k].fly && Math.hypot(e.x - q.x1, e.y - q.y1) <= q.area) damage(e, q.dmg, false, q.tw); } }
      else if (q.k === 'nube') { q.t += dt; if (q.t > 0.8) q.done = true; }
      else if (q.k === 'bellotas') { q.t += dt; if (q.t >= 0.6 && !q.hit) { q.hit = true; st.shake = 0.5; vib(40); puff(q.x, q.y, '#8a5a2c', low() ? 14 : 30, 4); ring(q.x, q.y, 1.9, 'rgba(255,200,90,.95)', 0.5); const dmg = (60 + st.wave * 14) * dmgMul(); for (const e of st.en) if (!e.dead && Math.hypot(e.x - q.x, e.y - q.y) <= 1.7) damage(e, dmg, true); } if (q.t > 1) q.done = true; }
      else if (q.k === 'raiz') { q.t += dt; if (q.t > 3) q.done = true; }
    }
    st.pr = st.pr.filter((q) => !q.done);
    for (const p of st.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 3 * dt; } st.parts = st.parts.filter((p) => p.t < p.l);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 1.1);
    for (const r of st.rings) r.t += dt; st.rings = st.rings.filter((r) => r.t < r.T);
    for (const b of st.bolts) b.t += dt; st.bolts = st.bolts.filter((b) => b.t < 0.22);
    if (st.shake > 0) st.shake -= dt;
    if (st.phase === 'wave' && !st.queue.length && !st.en.length) {
      const bonus = 15 + st.wave * 2 + st.tw.filter((t) => t.k === 'arbol').reduce((a, t) => a + Math.round(TD_TW.arbol.seeds[t.lvl] * (t.spec === 2 ? 2.5 : 1)), 0);
      st.seeds += bonus; float(`Oleada superada · +${bonus} 🌰`, TD_COLS / 2, 2, '#ffe066', true); TDS.up();
      if (st.wave >= WAVES) { end(true); return; }
      st.phase = 'build'; st.countdown = 12; hud();
    }
  }
  const stepFx = (dt) => {
    for (const f of st.fly) f.t += dt * 1.6; st.fly = st.fly.filter((f) => f.t < 1);
    for (const p of st.wx) { const fx = W.fx; if (fx === 'hoja' || fx === 'petalo') { p.y += dt * 0.5 * p.s; p.x += Math.sin(st.t + p.ph) * dt * 0.4; } else if (fx === 'nieve') { p.y += dt * 0.7 * p.s; p.x += Math.sin(st.t * 0.8 + p.ph) * dt * 0.25; } else if (fx === 'brasa') { p.y -= dt * 0.6 * p.s; p.x += Math.sin(st.t * 2 + p.ph) * dt * 0.3; } else { p.x += Math.cos(st.t * 0.5 + p.ph) * dt * 0.2; p.y += Math.sin(st.t * 0.7 + p.ph) * dt * 0.2; }
      if (p.y > TD_ROWS + 0.5) { p.y = -0.5; p.x = Math.random() * TD_COLS; } if (p.y < -0.5) { p.y = TD_ROWS + 0.5; p.x = Math.random() * TD_COLS; } if (p.x < -0.5) p.x = TD_COLS + 0.4; if (p.x > TD_COLS + 0.5) p.x = -0.4; }
  };

  /* --- dibujo --- */
  const SX = (x) => V.ox + x * V.T, SY = (y) => V.oy + y * V.T;
  const ANIM = { abejas: 1, rayo: 1, pino: 1, hongo: 1 };
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
    for (const t of st.tw) if (t.k === 'pino' && t.spec === 2) { g.fillStyle = 'rgba(200,240,255,.12)'; g.beginPath(); g.arc(SX(t.x + 0.5), SY(t.y + 0.5), RNG(t) * T, 0, 7); g.fill(); }
    for (const q of st.pr) if (q.k === 'raiz') { const a = Math.min(1, (3 - q.t) * 2); g.strokeStyle = `rgba(90,60,30,${0.8 * a})`; g.lineWidth = 3; for (let i = 0; i < 8; i++) { const an = i * 0.785; g.beginPath(); g.moveTo(SX(q.x), SY(q.y)); g.quadraticCurveTo(SX(q.x + Math.cos(an) * 0.8), SY(q.y + Math.sin(an + 0.5) * 0.8), SX(q.x + Math.cos(an) * 1.5), SY(q.y + Math.sin(an) * 1.5)); g.stroke(); } }
    // trampas (debajo de los enemigos)
    for (const t of st.tw) if (t.k === 'trampa') drawTowerSpr(t, SX(t.x + 0.5), SY(t.y + 0.5), 1);
    // el Gran Árbol
    { const X = SX(tree[0] + 0.5), Y = SY(tree[1] + 0.5); const sh = st.treeHit > 0 ? Math.sin(st.t * 60) * 3 : 0; g.save(); g.translate(X + sh, Y); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, T * 0.42, T * 0.6, T * 0.15, 0, 0, 7); g.fill(); g.fillStyle = '#7a5232'; g.fillRect(-T * 0.12, -T * 0.1, T * 0.24, T * 0.52); const sw = Math.sin(st.t * 1.2) * T * 0.03; const hp = st.lives / LMAX; g.fillStyle = st.treeHit > 0 ? '#c84a3a' : hp > 0.5 ? '#2f8a40' : hp > 0.25 ? '#8a9a30' : '#a8702a'; for (const [a, b, r] of [[0, -0.42, 0.42], [-0.3, -0.2, 0.3], [0.3, -0.2, 0.3]]) { g.beginPath(); g.arc(a * T + sw, b * T, r * T, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(-T * 0.12 + sw, -T * 0.55, T * 0.12, 0, 7); g.fill(); if (hp > 0.5) { g.fillStyle = '#e8324a'; for (const [a, b] of [[-0.2, -0.5], [0.15, -0.3], [0.3, -0.15]]) { g.beginPath(); g.arc(a * T + sw, b * T, T * 0.05, 0, 7); g.fill(); } } g.restore(); }
    // torres
    for (const t of st.tw) {
      if (t.k === 'trampa') { if (t === st.sel) { g.strokeStyle = '#ffd23c'; g.lineWidth = 2; g.strokeRect(SX(t.x) + 1, SY(t.y) + 1, T - 2, T - 2); } continue; }
      const kick = t.kick > 0 ? -t.kick * 8 : 0; const sc = t.born > 0 ? 1 + Math.sin((0.35 - t.born) / 0.35 * Math.PI) * 0.25 : 1;
      drawTowerSpr(t, SX(t.x + 0.5), SY(t.y + 0.5) + kick, sc);
      if (t.stun > 0) { const X = SX(t.x + 0.5), Y = SY(t.y + 0.5); if (t.stunK === 'hielo') { g.fillStyle = 'rgba(190,235,255,.55)'; g.beginPath(); g.roundRect(X - T * 0.42, Y - T * 0.5, T * 0.84, T * 0.9, 6); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke(); } else if (t.stunK === 'fuego') { for (let i = 0; i < 3; i++) { const fx = X + (i - 1) * T * 0.22, f = Math.sin(st.t * 15 + i) * 3; g.fillStyle = 'rgba(255,120,30,.85)'; g.beginPath(); g.ellipse(fx, Y - T * 0.15 + f, T * 0.1, T * 0.22, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,220,80,.9)'; g.beginPath(); g.ellipse(fx, Y - T * 0.08 + f, T * 0.05, T * 0.11, 0, 0, 7); g.fill(); } } else { g.strokeStyle = '#ffe066'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 5; i++) { const a = st.t * 20 + i; g.lineTo(X + Math.cos(a) * T * 0.35, Y - T * 0.1 + Math.sin(a * 1.7) * T * 0.35); } g.stroke(); } }
      if (t === st.sel) { g.strokeStyle = '#ffd23c'; g.lineWidth = 2; g.strokeRect(SX(t.x) + 1, SY(t.y) + 1, T - 2, T - 2); }
    }
    // rayos de luciérnaga
    for (const t of st.tw) if (t.k === 'rayo' && t.target && !t.target.dead && !(t.stun > 0)) { const mx = t.spec === 2 ? 6 : 3; const k = (t.ramp || 0) / mx; const col = t.spec === 2 ? '255,220,90' : '120,240,255'; const beam = (e, w) => { g.strokeStyle = `rgba(${col},${0.5 + 0.4 * k})`; g.lineWidth = w; g.beginPath(); g.moveTo(SX(t.x + 0.5), SY(t.y + 0.15)); g.lineTo(SX(e.x), SY(e.y)); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.stroke(); }; beam(t.target, 2 + k * 5); if (t.extra) for (const o of t.extra) if (!o.dead) beam(o, 1.5 + k * 2); }
    // enemigos
    const en = st.en.slice().sort((a, b) => a.y - b.y);
    for (const e of en) {
      const E = TD_EN[e.k]; const X = SX(e.x), Y = SY(e.y);
      if (e.under) { g.fillStyle = '#7a5a3a'; g.beginPath(); g.ellipse(X, Y + T * 0.12, T * 0.28, T * 0.12, 0, 0, 7); g.fill(); g.fillStyle = '#9a7a5a'; g.beginPath(); g.ellipse(X - T * 0.05, Y + T * 0.08, T * 0.14, T * 0.06, 0, 0, 7); g.fill(); continue; }
      const ghost = E.ghost && !st.tw.some((t) => t.k === 'buho' && dist(t, e) <= RNG(t)) && !st.tw.some((t) => dist(t, e) <= 1.3);
      if (ghost) g.globalAlpha = 0.3;
      drawEnemySpr(e);
      g.globalAlpha = 1;
      const R = T * E.r * (E.boss ? 1.9 : 1.25);
      if (e.hit > 0) { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(X, Y, R, 0, 7); g.fill(); }
      if (e.sh > 0) { g.strokeStyle = 'rgba(150,210,255,.9)'; g.fillStyle = 'rgba(150,210,255,.2)'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y - T * 0.05, R + 4, 0, 7); g.fill(); g.stroke(); }
      if (e.frz > 0) { g.fillStyle = 'rgba(190,235,255,.55)'; g.beginPath(); g.arc(X, Y, R + 2, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1; g.stroke(); }
      else if (e.slowK > 0) { g.fillStyle = 'rgba(160,220,120,.32)'; g.beginPath(); g.arc(X, Y, R * 0.9, 0, 7); g.fill(); }
      if (e.dotT > 0 && !low() && Math.random() < 0.15) puff(e.x, e.y - 0.2, '#b06ad0', 1, 0.6);
      if (e.rootT > 0) { g.strokeStyle = '#6b4a2a'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y + T * 0.1, T * 0.3, 0, Math.PI); g.stroke(); }
      if (e.chg > 0) { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(X - e.dir * (R + 4 + i * 5), Y - 6 + i * 6); g.lineTo(X - e.dir * (R + 12 + i * 5), Y - 6 + i * 6); g.stroke(); } }
      if (e.hp < e.max && !E.boss) { const w = T * 0.6, y = Y - T * 0.5; g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(X - w / 2, y, w, 4); g.fillStyle = e.hp / e.max > 0.5 ? '#51cf66' : e.hp / e.max > 0.25 ? '#fcc419' : '#ff6b6b'; g.fillRect(X - w / 2, y, w * Math.max(0, e.hp / e.max), 4); }
    }
    // proyectiles
    for (const q of st.pr) {
      if (q.k === 'flecha') { g.save(); g.translate(SX(q.x), SY(q.y)); g.rotate(q.ang || 0); g.strokeStyle = '#6b3a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-T * 0.18, 0); g.lineTo(T * 0.12, 0); g.stroke(); g.fillStyle = '#ddd'; g.beginPath(); g.moveTo(T * 0.16, 0); g.lineTo(T * 0.08, -3); g.lineTo(T * 0.08, 3); g.fill(); g.restore(); }
      else if (q.k === 'abeja') { const x = SX(q.x) + Math.sin(q.ph) * 2, y = SY(q.y) + Math.cos(q.ph * 1.3) * 2; g.fillStyle = q.pierce ? '#ff9a3c' : '#ffd23c'; g.beginPath(); g.ellipse(x, y, 3.2, 2.4, 0, 0, 7); g.fill(); g.fillStyle = '#3a2a10'; g.fillRect(x - 0.8, y - 2.4, 1.6, 4.8); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(x, y - 3, 2, 1.2, 0, 0, 7); g.fill(); }
      else if (q.k === 'bala') { const k = q.t / q.T; const x = q.x0 + (q.x1 - q.x0) * k, y = q.y0 + (q.y1 - q.y0) * k - Math.sin(k * Math.PI) * 1.2; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(SX(q.x0 + (q.x1 - q.x0) * k), SY(q.y0 + (q.y1 - q.y0) * k), 4, 2, 0, 0, 7); g.fill(); g.fillStyle = '#3a3a40'; g.beginPath(); g.arc(SX(x), SY(y), T * 0.12, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(SX(x) - 2, SY(y) - 2, T * 0.04, 0, 7); g.fill(); }
      else if (q.k === 'nube') { const a = 1 - q.t / 0.8; g.fillStyle = `rgba(${q.c},${0.35 * a})`; g.beginPath(); g.arc(SX(q.x), SY(q.y), q.r * T * (0.6 + q.t * 0.5), 0, 7); g.fill(); }
      else if (q.k === 'bellotas') { if (q.t < 0.6) { for (let i = 0; i < 6; i++) { const a = i * 1.05; const r = 1.3 * (1 - q.t / 0.6); g.fillStyle = '#8a5a2c'; g.beginPath(); g.ellipse(SX(q.x + Math.cos(a) * 0.9), SY(q.y + Math.sin(a) * 0.9 - r * 3), 5, 6, 0, 0, 7); g.fill(); } g.strokeStyle = 'rgba(255,80,40,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(SX(q.x), SY(q.y), 1.7 * T, 0, 7); g.stroke(); } else { g.fillStyle = `rgba(255,200,80,${0.5 * (1 - (q.t - 0.6) / 0.4)})`; g.beginPath(); g.arc(SX(q.x), SY(q.y), 1.7 * T, 0, 7); g.fill(); } }
    }
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
    if (st.banner) { const b = st.banner, k = b.t; const a = k < 0.3 ? k / 0.3 : k > 1.9 ? Math.max(0, (2.4 - k) / 0.5) : 1; const sc = k < 0.3 ? 0.6 + 0.4 * (k / 0.3) + Math.sin(k / 0.3 * Math.PI) * 0.15 : 1; g.save(); g.globalAlpha = a; g.translate(V.w / 2, V.oy + TD_ROWS * V.T * 0.38); g.scale(sc, sc); g.textAlign = 'center'; g.font = `900 ${Math.round(Math.min(44, V.w / 9))}px system-ui`; g.lineWidth = 6; g.strokeStyle = b.boss ? '#5a0a0a' : 'rgba(0,0,0,.6)'; g.strokeText(b.text, 0, 0); g.fillStyle = b.boss ? '#ffb0a0' : '#fff'; g.fillText(b.text, 0, 0); if (b.sub) { g.font = '800 16px system-ui'; g.lineWidth = 4; g.strokeText(b.sub, 0, 28); g.fillStyle = b.boss ? '#ffe066' : '#d8ffd0'; g.fillText(b.sub, 0, 28); } g.restore(); }
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
  function paintPow() { const a = $w('#tdP1'), r = $w('#tdP2'); a.classList.toggle('on', st.aim === 'a'); r.classList.toggle('on', st.aim === 'r'); a.querySelector('i').style.height = `${st.cd.a / cdA() * 100}%`; r.querySelector('i').style.height = `${st.cd.r / cdR() * 100}%`; a.disabled = st.cd.a > 0; r.disabled = st.cd.r > 0; }
  const panel = $w('#tdPanel');
  const paintMini = () => panel.querySelectorAll('canvas[data-k]').forEach((cv) => { const q = cv.getContext('2d'); tdDrawTower(q, cv.dataset.k, +(cv.dataset.l || 0), 32, 36, 46, 1, -0.6, +(cv.dataset.s || 0)); });
  function openBuild(x, y, onPath) {
    st.sel = null; st.build = { x, y };
    const ks = Object.keys(TD_TW).filter((k) => (onPath ? !!TD_TW[k].path : !TD_TW[k].path));
    panel.innerHTML = `<div class="td-ph"><b>${onPath ? 'Trampa en el camino' : 'Construir aquí'}</b><button class="td-close" data-a="close" aria-label="Cerrar">✕</button></div><div class="td-tws">${ks.map((k) => { const K = TD_TW[k]; const open = tdTowerOpen(k); return `<button type="button" class="td-tw" data-a="build" data-k="${k}" ${open ? '' : 'disabled'}><canvas width="64" height="64" data-k="${k}"></canvas><b>${open ? K.n.split(' ')[0] : '🔒'}</b><span>${open ? `🌰 ${costOf(k, 0)}` : `Mapa ${K.un + 1}`}</span></button>`; }).join('')}</div>`;
    panel.hidden = false; paintMini(); refreshPanel();
  }
  function info(t) {
    const K = TD_TW[t.k], L = t.lvl, r = RNG(t).toFixed(1); const bm = t.bm > 1 ? ` · +${Math.round((t.bm - 1) * 100)} % por árbol` : '';
    if (K.support) return `+${Math.round((K.buff[L] + (t.spec === 1 ? 0.6 : 0)) * 100)} % de daño a torres cercanas · +${Math.round(K.seeds[L] * (t.spec === 2 ? 2.5 : 1))} 🌰 por oleada`;
    if (t.k === 'rayo') return `${K.dps[L]} daño/s, sube hasta ×${t.spec === 2 ? 7 : 4} · alcance ${r}${bm}`;
    if (t.k === 'hongo') return `Veneno ${K.dot[L] * (t.spec === 1 ? 2 : 1)}/s · frena ${Math.round((t.spec === 2 ? 0.7 : K.slow[L]) * 100)} % · alcance ${r}${bm}`;
    if (t.k === 'buho') return `${Math.round(K.dmg[L] * (t.spec === 2 ? 1.8 : 1))} de daño · salta a ${t.spec === 1 ? 9 : K.ch[L]} enemigos · alcance ${r}${bm}`;
    if (t.k === 'pino') return `Congela ${t.spec === 1 ? 2.5 : K.frz[L]} s cada ${K.rate[L]} s · alcance ${r}${bm}`;
    if (t.k === 'trampa') return `${Math.round(K.dps[L] * (t.spec === 2 ? 2 : 1))} daño/s a quien la pise${t.spec === 1 ? ' · frena 45 %' : ''}${bm}`;
    return `${K.dmg[L]}${t.k === 'abejas' ? ` × ${K.nb[L] + (t.spec === 1 ? 3 : 0)} abejas` : ''}${t.k === 'ardilla' && t.spec === 1 ? ' × 3 blancos' : ''} de daño · alcance ${r}${bm}`;
  }
  function openTower(t) {
    st.build = null; st.sel = t; const K = TD_TW[t.k];
    const specs = t.lvl === 3 && !t.spec ? `<div class="td-specs"><b class="small">✨ Maestría · elige un camino (🌰 ${specCost(t.k)})</b><div class="td-spec-row">${K.spec.map(([n, d], i) => `<button type="button" class="td-spec" data-a="spec" data-s="${i + 1}"><canvas width="64" height="64" data-k="${t.k}" data-l="3" data-s="${i + 1}"></canvas><b>${n}</b><span>${d}</span></button>`).join('')}</div></div>` : '';
    const title = t.spec ? `${K.n} · ✨ ${K.spec[t.spec - 1][0]}` : `${K.n} · nivel ${t.lvl + 1}`;
    panel.innerHTML = `<div class="td-ph"><b>${title}</b><button class="td-close" data-a="close" aria-label="Cerrar">✕</button></div><p class="td-inf2">${info(t)}</p>${specs}
      <div class="td-acts">${t.lvl < 3 ? '<button type="button" class="btn primary" data-a="up"></button>' : ''}${K.support || t.k === 'trampa' || t.k === 'pino' ? '' : `<button type="button" class="btn" data-a="mode">🎯 ${({ primero: 'Al primero', fuerte: 'Al más fuerte', ultimo: 'Al último' })[t.mode]}</button>`}<button type="button" class="btn" data-a="sell">Vender · +${sellOf(t)} 🌰</button></div>`;
    panel.hidden = false; paintMini(); refreshPanel();
  }
  function refreshPanel() {
    if (st.build) panel.querySelectorAll('button[data-a="build"]').forEach((b) => { if (!tdTowerOpen(b.dataset.k)) return; b.disabled = st.seeds < costOf(b.dataset.k, 0); });
    if (st.sel) { const t = st.sel, b = panel.querySelector('[data-a="up"]'); if (b) { const cst = costOf(t.k, t.lvl + 1); b.textContent = `Mejorar · 🌰 ${cst}`; b.disabled = st.seeds < cst; } panel.querySelectorAll('[data-a="spec"]').forEach((s) => { s.disabled = st.seeds < specCost(t.k); }); }
  }
  const closePanel = () => { panel.hidden = true; st.sel = null; st.build = null; };
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return; TDS.init(); const a = b.dataset.a;
    if (a === 'close') { closePanel(); return; }
    if (a === 'build' && st.build) { const k = b.dataset.k, cst = costOf(k, 0); if (st.seeds < cst) { TDS.no(); return; } st.seeds -= cst; const t = { k, lvl: 0, x: st.build.x, y: st.build.y, cd: 0, aim: -Math.PI / 2, mode: 'primero', bm: 1, spec: 0, born: 0.35, stun: 0 }; st.tw.push(t); recalcBuff(); TDS.build(); puff(t.x + 0.5, t.y + 0.5, '#fff', 10, 2); ring(t.x + 0.5, t.y + 0.5, 0.8, 'rgba(255,255,255,.9)', 0.35); closePanel(); hud(); return; }
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
    if (x < 0 || y < 0 || x >= TD_COLS || y >= TD_ROWS) { closePanel(); return; }
    const t = towerAt(x, y); if (t) { openTower(t); TDS.tone(700, 0.05, 'sine', 0.03); return; }
    if (blocked.has(key(x, y))) { closePanel(); hint('Ahí no se puede construir: elige pasto libre', 1600); return; }
    if (pathCells.has(key(x, y))) { if (!tdTowerOpen('trampa')) { closePanel(); hint(`El camino es para el Cardo espinoso (se abre en el mapa ${TD_TW.trampa.un + 1})`, 2200); return; } openBuild(x, y, true); TDS.tone(500, 0.05, 'sine', 0.03); return; }
    openBuild(x, y, false); TDS.tone(600, 0.05, 'sine', 0.03);
  });
  $w('#tdP1').addEventListener('click', () => { TDS.init(); if (st.cd.a > 0) return; st.aim = st.aim === 'a' ? null : 'a'; closePanel(); hint(st.aim ? '🌰 Toca el lugar donde caerán las bellotas' : ''); paintPow(); });
  $w('#tdP2').addEventListener('click', () => { TDS.init(); if (st.cd.r > 0) return; st.aim = st.aim === 'r' ? null : 'r'; closePanel(); hint(st.aim ? '🌿 Toca dónde crecerán las raíces' : ''); paintPow(); });
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
  function end(won) {
    if (st.over) return; st.over = true; closePanel(); st.aim = null;
    const el = $w('#tdEnd'); const secs = Math.max(1, Math.round((Date.now() - st.t0) / 1000));
    D.kills = (D.kills || 0) + st.killed;
    if (INF) {
      const w = Math.max(0, st.wave - 1); const nb = w > (D.inf || 0); if (nb) D.inf = w; jpSave(); TDS.lose();
      if (w > 0) jgPost({ game: 'torres', score: w, apples: 0, dur: secs }).then((rec) => { const l = $w('#tdRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Lugar #${rec.rankDay} de hoy`; });
      el.innerHTML = `<b>${nb ? '¡Nuevo récord!' : 'El bosque resistió'}</b><span>Aguantaste <b>${w}</b> oleadas · ${st.killed} plagas</span><span class="small muted">Tu mejor: ${D.inf} oleadas</span><span class="small muted" id="tdRank"></span><div class="btn-row" style="justify-content:center"><button class="btn primary" data-e="re">Otra vez</button><button class="btn" data-e="out">Mapas</button></div>`;
    } else if (won) {
      const k = st.lives / LMAX; const stars = k >= 0.9 ? 3 : k >= 0.5 ? 2 : 1; const prev = D.st[MI] || 0;
      if (stars > prev) { D.st[MI] = stars; jgCoins((stars - prev) * 2); }
      let dayWin = false; if (daily && D.day.done !== tdToday()) { D.day.done = tdToday(); D.dayStars = (D.dayStars || 0) + 1; dayWin = true; jgCoins(3); }
      jpSave(); TDS.win();
      const next = MI + 1 < TD_MAPS.length && !daily; const newT = Object.values(TD_TW).filter((w) => w.un === MI + 1);
      const nw = TD_MAPS[MI + 1] && TD_MAPS[MI + 1].w !== M.w;
      el.innerHTML = `<b>${dayWin ? '¡Reto del día superado!' : '¡Salvaste el bosque!'}</b><span class="td-bigst">${[0, 1, 2].map((i) => `<i class="${i < stars ? 'on' : ''}">★</i>`).join('')}</span><span>${M.n} · ${st.lives}/${LMAX} vidas · ${st.killed} plagas</span>${stars > prev ? `<span class="pm-gain">+${stars - prev} ⭐ para tus raíces · +${(stars - prev) * 2} monedas para tu árbol</span>` : ''}${dayWin ? '<span class="pm-gain">+1 ⭐ dorada · +3 monedas</span>' : ''}${!daily && prev === 0 && TD_MAPS[MI + 1] ? `<span class="small">🔓 Abriste: ${TD_MAPS[MI + 1].n}${nw ? ` · ¡mundo nuevo: ${TD_WORLDS[TD_MAPS[MI + 1].w].n}!` : ''}${newT.map((w) => ` · torre nueva: ${w.n}`).join('')}</span>` : ''}
        <div class="btn-row" style="justify-content:center;flex-wrap:wrap">${next ? '<button class="btn primary" data-e="next">Siguiente mapa</button>' : ''}<button class="btn" data-e="re">Repetir</button><button class="btn" data-e="out">Mapas</button></div>`;
    } else {
      jpSave(); TDS.lose();
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
    if (paused) { st.last = now; return; }
    const raw = Math.min(0.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
    for (let i = 0; i < st.speed; i++) step(raw);
    stepFx(raw); draw(); TDS.tickMusic(!st.over, M.w);
    hudT += raw; if (hudT > 0.2) { hudT = 0; hud(); }
  };
  st.id = requestAnimationFrame(loop); hud();
  hint(INF ? '♾️ Modo infinito: aguanta todas las oleadas que puedas' : MOD ? `📅 Reto: ${MOD.n} · ${MOD.d}` : `${M.n}: pon tus torres y toca Empezar`, 3800);
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
  viewJuegos = function () { return baseJuegos().replace('<ul class="rows" style="margin-top:18px">', `<ul class="rows" style="margin-top:18px"><li><a href="#/torres"><span class="ico">${icon('play')}</span><span class="txt"><b>Defensa del Bosque <em class="sc-new">Nuevo</em></b><span>9 torres con maestrías, 6 mundos, 30 mapas, jefes y un reto cada día.</span></span>${icon('chev', 'chev')}</a></li>`); };
  EXTRA_VIEWS.juegos = viewJuegos;
}
