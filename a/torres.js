/* Cinnavia 7.64 — Defensa del Bosque.
   Juego de defensa de torres: las plagas y la Taladora gigante quieren llegar al Gran Árbol. Pon torres de animales
   del bosque en el pasto, mejóralas y usa tus poderes. 12 mapas en 4 mundos (Pradera, Pantano, Nevado y Volcán),
   6 torres con 4 niveles, 8 enemigos con habilidades, jefes, estrellas, raíces (mejoras para siempre) y modo infinito.
   Controles solo de tocar: toca el pasto para construir, toca una torre para mejorarla o venderla. */
'use strict';

const TD = { run: null, tab: 'mapas' };
const TD_COLS = 9, TD_ROWS = 13;
const tdData = () => { const d = jpData('torres'); d.st ||= {}; d.meta ||= {}; d.best ||= {}; d.gift ||= {}; d.inf ??= 0; return d; };
const tdStarsTot = () => Object.values(tdData().st).reduce((a, b) => a + (+b || 0), 0);

/* ---------- mapas ---------- */
const TD_WORLDS = [
  { n: 'Pradera', g: ['#9bd56a', '#86c457'], p: ['#e2c58f', '#cfae74'], deco: 'flor', bg: '#7fb94e' },
  { n: 'Pantano', g: ['#7fb38a', '#6a9e76'], p: ['#9c8a6a', '#86765a'], deco: 'junco', bg: '#5f8f6a' },
  { n: 'Nevado', g: ['#eef6fb', '#dbe9f3'], p: ['#b9c9d6', '#a3b5c4'], deco: 'pino', bg: '#cfe1ee' },
  { n: 'Volcán', g: ['#6b4a3e', '#5a3c32'], p: ['#3a2a26', '#2e211d'], deco: 'lava', bg: '#4a3028' },
];
const TD_MAPS = [
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
const tdWaves = (mi) => Math.min(30, 15 + Math.floor(mi * 1.3));

/* ---------- enemigos y torres ---------- */
const TD_EN = {
  escarabajo: { n: 'Escarabajo', hp: 30, sp: 1.0, rew: 4, r: 0.3, c: '#2f6b4a', d: 'El más común.' },
  hormiga: { n: 'Hormiga veloz', hp: 18, sp: 1.9, rew: 3, r: 0.24, c: '#8a2a1a', d: 'Muy rápida.' },
  caracol: { n: 'Caracol acorazado', hp: 70, sp: 0.6, rew: 8, r: 0.34, c: '#a87a4a', armor: 0.5, d: 'Su concha quita la mitad del daño (menos el rayo y el veneno).' },
  polilla: { n: 'Polilla', hp: 24, sp: 1.4, rew: 5, r: 0.3, c: '#c9a8e8', fly: 1, d: 'Vuela: solo la alcanzan la ardilla, las abejas y el rayo.' },
  topo: { n: 'Topo', hp: 45, sp: 1.1, rew: 6, r: 0.3, c: '#6b4a3a', burrow: 1, d: 'Se esconde bajo tierra por ratos.' },
  sanadora: { n: 'Luciérnaga sanadora', hp: 40, sp: 1.0, rew: 8, r: 0.28, c: '#e8e070', heal: 1, d: 'Cura a los enemigos cercanos.' },
  gusano: { n: 'Gusano', hp: 50, sp: 0.9, rew: 5, r: 0.3, c: '#e07a9a', split: 1, d: 'Al morir se divide en dos.' },
  gusito: { n: 'Gusanito', hp: 15, sp: 1.4, rew: 2, r: 0.2, c: '#f0a0b8', d: '' },
  jefe: { n: 'Taladora gigante', hp: 900, sp: 0.45, rew: 120, r: 0.5, c: '#7a7f88', armor: 0.35, boss: 1, lives: 5, d: 'Jefe: aguanta muchísimo y quita 5 vidas.' },
};
const TD_TW = {
  ardilla: { n: 'Ardilla arquera', d: 'Rápida y ataca a todo, también a voladores.', cost: [50, 60, 110, 220], dmg: [7, 12, 20, 34], rng: [2.4, 2.7, 3.0, 3.3], rate: [0.55, 0.5, 0.44, 0.38], air: 1, c: '#c97a3a', un: 0 },
  tortuga: { n: 'Tortuga cañón', d: 'Bala pesada con daño en área. No alcanza voladores.', cost: [90, 100, 180, 340], dmg: [24, 42, 72, 130], rng: [2.8, 3.0, 3.3, 3.6], rate: [1.6, 1.5, 1.4, 1.25], area: [0.9, 1.0, 1.1, 1.25], air: 0, c: '#4a8a5a', un: 0 },
  hongo: { n: 'Hongo de esporas', d: 'Envenena y frena a todos en un área.', cost: [70, 80, 140, 260], dot: [5, 9, 15, 26], slow: [0.35, 0.4, 0.45, 0.55], rng: [2.0, 2.2, 2.4, 2.6], rate: [1.3, 1.2, 1.1, 1.0], area: [0.9, 1.0, 1.15, 1.3], air: 1, c: '#d0405a', un: 1 },
  abejas: { n: 'Colmena', d: 'Abejas que persiguen. Doble daño a voladores.', cost: [80, 90, 160, 300], dmg: [5, 8, 13, 22], nb: [2, 3, 3, 4], rng: [3.0, 3.2, 3.4, 3.7], rate: [1.6, 1.5, 1.4, 1.3], air: 2, c: '#e8b830', un: 2 },
  rayo: { n: 'Luciérnaga láser', d: 'Rayo que se carga mientras apunta al mismo enemigo. Ignora armaduras.', cost: [120, 130, 230, 420], dps: [10, 18, 30, 52], rng: [2.4, 2.6, 2.8, 3.0], air: 1, c: '#5ad0e8', un: 4 },
  arbol: { n: 'Árbol sagrado', d: 'Las torres de alrededor pegan más fuerte y te da semillas cada oleada.', cost: [100, 120, 200, 360], buff: [0.15, 0.22, 0.3, 0.4], seeds: [5, 9, 14, 22], rng: [1.6, 1.6, 1.8, 2.0], air: 0, c: '#3a9a4a', un: 6, support: 1 },
};
const TD_META = [
  { id: 'semillas', n: 'Semillas iniciales', d: '+25 semillas al empezar', max: 5 },
  { id: 'dano', n: 'Raíces fuertes', d: '+6 % de daño de todas las torres', max: 5 },
  { id: 'vidas', n: 'Corteza dura', d: '+2 vidas por mapa', max: 3 },
  { id: 'poder', n: 'Savia rápida', d: 'Los poderes se recargan 12 % más rápido', max: 3 },
  { id: 'barato', n: 'Buen comercio', d: 'Torres 5 % más baratas', max: 3 },
  { id: 'venta', n: 'Reciclaje', d: 'Al vender recuperas 85 % (antes 70 %)', max: 1 },
];
const tdMeta = (id) => tdData().meta[id] || 0;
const tdMetaCost = (l) => 2 + l * 2;
const tdMetaSpent = () => TD_META.reduce((a, m) => { let s = 0; for (let l = 0; l < tdMeta(m.id); l++) s += tdMetaCost(l); return a + s; }, 0);
const tdUnlocked = (mi) => mi === 0 || (tdData().st[mi - 1] || 0) > 0;
const tdTowerOpen = (k) => TD_TW[k].un === 0 || (tdData().st[TD_TW[k].un - 1] || 0) > 0 || tdData().best.inf;

/* ---------- dibujos ---------- */
function tdDrawTower(g, k, lvl, x, y, T, t = 0, aim = 0) {
  const s = T / 40; g.save(); g.translate(x, y); g.scale(s, s);
  // base de piedra con hojas
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 12, 15, 5, 0, 0, 7); g.fill();
  g.fillStyle = ['#b8a88a', '#c9c2b0', '#d8c47a', '#e8d27a'][lvl]; g.beginPath(); g.ellipse(0, 9, 15, 7, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-4, 7, 7, 2.5, 0, 0, 7); g.fill();
  const C = TD_TW[k].c;
  if (k === 'ardilla') {
    g.fillStyle = '#a85a2a'; g.beginPath(); g.ellipse(9, -2, 6, 11, 0.5, 0, 7); g.fill();
    g.fillStyle = C; g.beginPath(); g.ellipse(0, 0, 8, 9, 0, 0, 7); g.fill(); g.beginPath(); g.arc(0, -10, 6.5, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-5, -14); g.lineTo(-4, -19); g.lineTo(-1, -15); g.fill(); g.beginPath(); g.moveTo(5, -14); g.lineTo(4, -19); g.lineTo(1, -15); g.fill();
    g.fillStyle = '#f2d6b0'; g.beginPath(); g.ellipse(0, 1, 4.5, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-2.3, -11, 1.3, 0, 7); g.arc(2.3, -11, 1.3, 0, 7); g.fill();
    g.save(); g.translate(0, -3); g.rotate(aim); g.strokeStyle = '#6b3a1a'; g.lineWidth = 2; g.beginPath(); g.arc(7, 0, 7, -1.1, 1.1); g.stroke(); g.strokeStyle = '#eee'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(9.5, -6.2); g.lineTo(9.5, 6.2); g.stroke(); g.restore();
  } else if (k === 'tortuga') {
    g.fillStyle = '#7ab868'; g.beginPath(); g.arc(-12, 2, 4.5, 0, 7); g.fill();
    g.fillStyle = C; g.beginPath(); g.ellipse(0, 0, 13, 10, 0, Math.PI, 0); g.fill(); g.fillRect(-13, -1, 26, 5);
    g.strokeStyle = '#2f6a3a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-6, -8); g.lineTo(-3, 0); g.moveTo(6, -8); g.lineTo(3, 0); g.moveTo(-10, -2); g.lineTo(10, -2); g.stroke();
    g.save(); g.translate(0, -6); g.rotate(aim); g.fillStyle = '#4a4a52'; g.fillRect(0, -3, 14, 6); g.fillStyle = '#2a2a30'; g.fillRect(12, -3.5, 3, 7); g.restore();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-13, 1, 1, 0, 7); g.fill();
  } else if (k === 'hongo') {
    g.fillStyle = '#f2e8d8'; g.fillRect(-4, -4, 8, 13);
    const pulse = 1 + Math.sin(t * 3) * 0.04; g.save(); g.scale(pulse, pulse);
    g.fillStyle = C; g.beginPath(); g.ellipse(0, -6, 14, 10, 0, Math.PI, 0); g.fill(); g.fillRect(-14, -6, 28, 3);
    g.fillStyle = '#fff'; for (const [a, b, r] of [[-7, -10, 2.6], [3, -13, 2.2], [8, -8, 1.8], [-2, -7, 1.5]]) { g.beginPath(); g.arc(a, b, r, 0, 7); g.fill(); }
    g.restore();
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(-1.8, 1, 1, 0, 7); g.arc(1.8, 1, 1, 0, 7); g.fill();
  } else if (k === 'abejas') {
    g.fillStyle = C; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(0, 4 - i * 6, 11 - i * 2, 4, 0, 0, 7); g.fill(); }
    g.strokeStyle = '#a87a10'; g.lineWidth = 1; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(0, 4 - i * 6, 11 - i * 2, 4, 0, 0, 7); g.stroke(); }
    g.fillStyle = '#3a2a10'; g.beginPath(); g.arc(0, 2, 2.6, 0, 7); g.fill();
    for (let i = 0; i < 2; i++) { const a = t * 3 + i * 3; const bx = Math.cos(a) * 12, by = -10 + Math.sin(a * 1.3) * 4; g.fillStyle = '#ffd23c'; g.beginPath(); g.ellipse(bx, by, 2.2, 1.6, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(bx, by - 1.8, 1.4, 1, 0, 0, 7); g.fill(); }
  } else if (k === 'rayo') {
    g.fillStyle = '#4a4a5a'; g.fillRect(-2, -6, 4, 14);
    const gl = 0.6 + 0.4 * Math.sin(t * 5); g.fillStyle = `rgba(120,240,255,${0.25 * gl})`; g.beginPath(); g.arc(0, -10, 12, 0, 7); g.fill();
    g.fillStyle = '#3a3a48'; g.beginPath(); g.ellipse(0, -9, 6, 7, 0, 0, 7); g.fill();
    g.fillStyle = C; g.beginPath(); g.ellipse(0, -4, 5, 5, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-5, -13, 4, 2, -0.5, 0, 7); g.ellipse(5, -13, 4, 2, 0.5, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(-2, -11, 1.4, 0, 7); g.arc(2, -11, 1.4, 0, 7); g.fill();
  } else if (k === 'arbol') {
    g.fillStyle = '#7a5232'; g.fillRect(-3, -6, 6, 15);
    const sw = Math.sin(t * 1.5) * 1; g.fillStyle = C; for (const [a, b, r] of [[0, -14, 10], [-8, -9, 7], [8, -9, 7], [0, -6, 7]]) { g.beginPath(); g.arc(a + sw, b, r, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(-3 + sw, -17, 4, 0, 7); g.fill();
    g.fillStyle = '#ffd23c'; for (let i = 0; i < 3; i++) { const a = t + i * 2.1; g.beginPath(); g.arc(Math.cos(a) * 9, -10 + Math.sin(a) * 7, 1.6, 0, 7); g.fill(); }
  }
  // nivel
  for (let i = 0; i <= lvl; i++) { g.fillStyle = '#ffd23c'; g.strokeStyle = '#8a6a00'; g.lineWidth = 0.8; g.beginPath(); const px = -((lvl) * 4) / 2 + i * 4; g.arc(px, 15, 1.8, 0, 7); g.fill(); g.stroke(); }
  g.restore();
}
function tdDrawEnemy(g, e, x, y, T, t) {
  const E = TD_EN[e.k], s = T / 40 * (E.boss ? 1.9 : 1.25); g.save(); g.translate(x, y); g.scale(s, s);
  if (e.under) { g.fillStyle = '#6b4a3a'; g.beginPath(); g.ellipse(0, 4, 9, 4, 0, 0, 7); g.fill(); g.fillStyle = '#8a6a50'; g.beginPath(); g.arc(-3, 2, 2, 0, 7); g.arc(3, 3, 1.6, 0, 7); g.fill(); g.restore(); return; }
  const wob = Math.sin(t * 12 + e.id) * 1.5, face = e.dir || 1;
  g.fillStyle = 'rgba(0,0,0,.2)'; if (!E.fly) { g.beginPath(); g.ellipse(0, 8, 9, 3, 0, 0, 7); g.fill(); }
  g.scale(face, 1);
  if (e.k === 'escarabajo') { g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 9, 7, 0, 0, 7); g.fill(); g.strokeStyle = '#1a3a2a'; g.lineWidth = 1; g.beginPath(); g.moveTo(-1, -7); g.lineTo(-1, 7); g.stroke(); g.fillStyle = '#1a2a1a'; g.beginPath(); g.arc(8, 0, 4, 0, 7); g.fill(); g.strokeStyle = '#1a2a1a'; g.lineWidth = 1.4; for (const k2 of [-4, 0, 4]) { g.beginPath(); g.moveTo(k2, 6); g.lineTo(k2 + wob, 9); g.stroke(); } g.fillStyle = '#fff'; g.beginPath(); g.arc(9.5, -1.5, 1.2, 0, 7); g.fill(); }
  else if (e.k === 'hormiga') { g.fillStyle = E.c; g.beginPath(); g.arc(-6, 0, 4.5, 0, 7); g.arc(0, 0, 3, 0, 7); g.arc(6, -1, 4, 0, 7); g.fill(); g.strokeStyle = E.c; g.lineWidth = 1.2; for (const k2 of [-3, 0, 3]) { g.beginPath(); g.moveTo(k2, 2); g.lineTo(k2 + wob, 7); g.stroke(); } g.beginPath(); g.moveTo(8, -4); g.lineTo(11, -8); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(7.5, -2, 1, 0, 7); g.fill(); }
  else if (e.k === 'caracol') { g.fillStyle = '#d8c0a0'; g.beginPath(); g.ellipse(2, 4, 11, 4, 0, 0, 7); g.fill(); g.fillStyle = E.c; g.beginPath(); g.arc(-1, -2, 8, 0, 7); g.fill(); g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.5; g.beginPath(); for (let a = 0; a < 10; a += 0.3) g.lineTo(-1 + Math.cos(a) * a * 0.7, -2 + Math.sin(a) * a * 0.7); g.stroke(); g.strokeStyle = '#d8c0a0'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(10, 2); g.lineTo(12, -4); g.moveTo(8, 2); g.lineTo(9, -4); g.stroke(); }
  else if (e.k === 'polilla') { const f = Math.sin(t * 20 + e.id) * 0.5 + 0.5; g.translate(0, -10 + Math.sin(t * 3 + e.id) * 2); g.fillStyle = E.c; g.beginPath(); g.ellipse(-3, -4, 7, 4 + f * 3, -0.6, 0, 7); g.ellipse(-3, 4, 7, 4 + f * 3, 0.6, 0, 7); g.fill(); g.fillStyle = '#6a4a7a'; g.beginPath(); g.ellipse(1, 0, 6, 2.5, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(-4, -4, 1.6, 0, 7); g.arc(-4, 4, 1.6, 0, 7); g.fill(); }
  else if (e.k === 'topo') { g.fillStyle = E.c; g.beginPath(); g.ellipse(0, 0, 10, 7.5, 0, 0, 7); g.fill(); g.fillStyle = '#ff9ab0'; g.beginPath(); g.arc(10, -1, 2.4, 0, 7); g.fill(); g.fillStyle = '#e8c0a0'; g.fillRect(-6, 5, 4, 3); g.fillRect(2, 5, 4, 3); g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(6, -3, 1, 0, 7); g.fill(); }
  else if (e.k === 'sanadora') { g.translate(0, -6); g.fillStyle = 'rgba(255,250,150,.35)'; g.beginPath(); g.arc(-4, 0, 9 + Math.sin(t * 6) * 2, 0, 7); g.fill(); g.fillStyle = '#4a4a2a'; g.beginPath(); g.ellipse(2, 0, 6, 4, 0, 0, 7); g.fill(); g.fillStyle = E.c; g.beginPath(); g.ellipse(-4, 0, 5, 4, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(1, -4, 4, 2, -0.4, 0, 7); g.fill(); g.fillStyle = '#e03131'; g.fillRect(-6, -1, 4, 1.4); g.fillRect(-4.7, -2.3, 1.4, 4); }
  else if (e.k === 'gusano' || e.k === 'gusito') { g.fillStyle = E.c; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(-7 + i * 4.6, Math.sin(t * 8 + i + e.id) * 1.4, 4 - (i === 3 ? 0 : 0.5), 0, 7); g.fill(); } g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(8, -1, 1, 0, 7); g.fill(); }
  else if (e.k === 'jefe') { g.fillStyle = '#5a5f68'; g.beginPath(); g.roundRect(-12, -9, 22, 16, 4); g.fill(); g.fillStyle = E.c; g.beginPath(); g.roundRect(-12, -9, 22, 6, 3); g.fill(); g.fillStyle = '#ffd23c'; g.fillRect(-12, -2, 22, 2); const sp = t * 20; g.fillStyle = '#c9d2dc'; g.beginPath(); g.moveTo(10, -6); g.lineTo(20, 0); g.lineTo(10, 6); g.closePath(); g.fill(); g.strokeStyle = '#7a828c'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { const yy = ((sp + i * 4) % 12) - 6; g.beginPath(); g.moveTo(11, yy); g.lineTo(18, yy * 0.4); g.stroke(); } g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(-7, 8, 3.5, 0, 7); g.arc(4, 8, 3.5, 0, 7); g.fill(); g.fillStyle = '#ff4040'; g.beginPath(); g.arc(4, -5, 1.6, 0, 7); g.fill(); }
  g.restore();
}

/* ---------- inicio: mapas, raíces y guía ---------- */
function tdHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="tdhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#e6f6d0"/></linearGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#tdhS)"/><rect y="70" width="360" height="100" fill="#9bd56a"/>
    <path d="M-10 120 H120 V90 H240 V140 H370" stroke="#e2c58f" stroke-width="26" fill="none" stroke-linejoin="round"/>
    <g transform="translate(320 92)"><rect x="-6" y="-6" width="12" height="40" fill="#7a5232"/><circle cy="-22" r="26" fill="#3a9a4a"/><circle cx="-14" cy="-10" r="16" fill="#4aaa5a"/><circle cx="14" cy="-10" r="16" fill="#2f8a40"/><circle cx="-6" cy="-28" r="7" fill="#ffffff" opacity=".25"/></g>
    <g transform="translate(70 92)"><ellipse rx="16" ry="6" cy="12" fill="#c9c2b0"/><ellipse rx="9" ry="10" fill="#c97a3a"/><circle cy="-12" r="7" fill="#c97a3a"/><circle cx="-2.5" cy="-13" r="1.4" fill="#111"/><circle cx="2.5" cy="-13" r="1.4" fill="#111"/></g>
    <g transform="translate(180 64)"><ellipse rx="16" ry="6" cy="12" fill="#d8c47a"/><path d="M-14 0 a14 10 0 0 1 28 0z" fill="#d0405a"/><circle cx="-6" cy="-4" r="2.4" fill="#fff"/><circle cx="4" cy="-6" r="2" fill="#fff"/><rect x="-4" y="0" width="8" height="10" fill="#f2e8d8"/></g>
    <g fill="#2f6b4a"><ellipse cx="30" cy="120" rx="9" ry="7"/><ellipse cx="150" cy="90" rx="9" ry="7"/></g><g fill="#c9a8e8"><ellipse cx="226" cy="104" rx="8" ry="5"/><ellipse cx="226" cy="112" rx="8" ry="5"/></g></svg>`;
}
function viewTorres() {
  const d = tdData(); const tot = tdStarsTot(), free = tot - tdMetaSpent();
  const tabs = [['mapas', 'Mapas'], ['raices', 'Raíces'], ['guia', 'Guía']];
  const seg = `<div class="mz-tabs" role="group">${tabs.map(([k, l]) => `<button type="button" data-act="td-tab" data-v="${k}" aria-pressed="${TD.tab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (TD.tab === 'mapas') {
    body = TD_WORLDS.map((W, wi) => `<h2 class="sec">${W.n}</h2><div class="td-maps">${TD_MAPS.map((M, mi) => ({ M, mi })).filter((x) => x.M.w === wi).map(({ M, mi }) => { const open = tdUnlocked(mi), s = d.st[mi] || 0; return `<button type="button" class="td-map${open ? '' : ' lock'}" data-act="td-play" data-m="${mi}" ${open ? '' : 'disabled'}><canvas width="90" height="130" data-tdmap="${mi}"></canvas><b>${mi + 1}. ${M.n}</b><span class="td-st">${[0, 1, 2].map((i) => `<i class="${i < s ? 'on' : ''}">★</i>`).join('')}</span><small>${open ? `${tdWaves(mi)} oleadas` : '🔒 Supera el anterior'}</small></button>`; }).join('')}</div>`).join('')
      + `<h2 class="sec">Modo infinito</h2><div class="td-inf"><div><b>♾️ Oleadas sin fin</b><span class="small muted">${(d.st[TD_MAPS.length - 1] || 0) > 0 ? `En el Corazón del volcán, cada vez más difícil. Tu mejor: <b>${d.inf || 0}</b> oleadas.` : 'Se abre al superar el último mapa.'}</span></div><button type="button" class="btn primary" data-act="td-play" data-m="inf" ${(d.st[TD_MAPS.length - 1] || 0) > 0 ? '' : 'disabled'}>Jugar</button></div><div id="jgRank-torres">${jgRankHTML('torres')}</div>`;
    setTimeout(tdPaintMaps, 0);
  } else if (TD.tab === 'raices') {
    body = `<p class="page-sub" style="margin-top:12px">Cada estrella que ganas en los mapas sirve para hacer crecer las raíces de tu bosque: mejoras que duran para siempre.</p>
      <p class="small" style="text-align:center">Estrellas: <b>${tot}</b> · disponibles: <b>⭐ ${free}</b></p>
      <ul class="mz-list">${TD_META.map((m) => { const l = tdMeta(m.id), max = l >= m.max, c = tdMetaCost(l); return `<li><div><b>${m.n} · ${l}/${m.max}</b><span class="small muted">${m.d}</span></div>${max ? '<span class="mz-ok">Máximo</span>' : `<button type="button" class="btn${free >= c ? ' primary' : ''}" data-act="td-meta" data-id="${m.id}" ${free >= c ? '' : 'disabled'}>⭐ ${c}</button>`}</li>`; }).join('')}</ul>
      ${tdMetaSpent() ? '<p style="text-align:center"><button class="link-btn" data-act="td-meta-reset">Reiniciar raíces (te devuelve las estrellas)</button></p>' : ''}`;
  } else {
    body = `<h2 class="sec">Torres</h2><ul class="td-guide">${Object.entries(TD_TW).map(([k, w]) => `<li><canvas width="80" height="80" data-tdtw="${k}"></canvas><div><b>${w.n}${tdTowerOpen(k) ? '' : ' 🔒'}</b><span class="small muted">${w.d}${tdTowerOpen(k) ? '' : ` Se abre al superar el mapa ${w.un}.`}</span><span class="small">🌰 ${w.cost[0]}</span></div></li>`).join('')}</ul>
      <h2 class="sec">Plagas</h2><ul class="td-guide">${Object.entries(TD_EN).filter(([k]) => k !== 'gusito').map(([k, e]) => `<li><canvas width="80" height="80" data-tden="${k}"></canvas><div><b>${e.n}</b><span class="small muted">${e.d}</span></div></li>`).join('')}</ul>
      <p class="small muted">Poderes: 🌰 <b>Lluvia de bellotas</b> (daño en área) y 🌿 <b>Raíces</b> (detiene a los enemigos). Toca el poder y luego el lugar del mapa.</p>`;
    setTimeout(tdPaintGuide, 0);
  }
  return `<section class="gm-home"><div class="gm-hero">${tdHero()}</div><h1 class="page-title gm-title">Defensa del Bosque</h1>
    <p class="page-sub">Las plagas quieren llegar al Gran Árbol. <b>Toca el pasto</b> para poner torres y <b>toca una torre</b> para mejorarla. Usa tus poderes en los momentos difíciles.</p>
    <div class="mz-head"><span>⭐ <b>${tot}</b> / ${TD_MAPS.length * 3}</span><span>Mapas <b>${Object.keys(d.st).filter((k) => d.st[k] > 0).length}</b>/${TD_MAPS.length}</span></div>${seg}${body}</section>`;
}
function tdPaintMaps() {
  document.querySelectorAll('canvas[data-tdmap]').forEach((cv) => { const mi = +cv.dataset.tdmap; const M = TD_MAPS[mi], W = TD_WORLDS[M.w]; const g = cv.getContext('2d'); const T = 10; g.fillStyle = W.g[0]; g.fillRect(0, 0, 90, 130); g.strokeStyle = W.p[0]; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'round'; for (const p of M.paths) { g.beginPath(); p.forEach(([x, y], i) => { const X = (x + 0.5) * T, Y = (y + 0.5) * T; if (i) g.lineTo(X, Y); else g.moveTo(X, Y); }); g.stroke(); } const e = M.paths[0][M.paths[0].length - 1]; g.fillStyle = '#2f8a40'; g.beginPath(); g.arc((e[0] + 0.5) * T, (e[1] + 0.5) * T, 7, 0, 7); g.fill(); });
}
function tdPaintGuide() {
  document.querySelectorAll('canvas[data-tdtw]').forEach((cv) => { const g = cv.getContext('2d'); g.clearRect(0, 0, 80, 80); tdDrawTower(g, cv.dataset.tdtw, 3, 40, 40, 64, 1); });
  document.querySelectorAll('canvas[data-tden]').forEach((cv) => { const g = cv.getContext('2d'); g.clearRect(0, 0, 80, 80); tdDrawEnemy(g, { k: cv.dataset.tden, id: 1, dir: 1 }, 40, 44, cv.dataset.tden === 'jefe' ? 40 : 64, 1); });
}
JG_CFG.torres = { tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']], val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'partida', 'partidas') : `${x.score} oleadas`), mine: (m) => `Tu mejor: <b>${m.best || 0} oleadas</b> · partidas: <b>${m.games || 0}</b>`, none: 'Aún nadie juega el modo infinito en este periodo.' };
Object.assign(VIDA_ACTS, {
  'td-tab': (el) => { TD.tab = el.dataset.v; render(); },
  'td-play': (el) => tdStart(el.dataset.m === 'inf' ? 'inf' : +el.dataset.m),
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
  sell() { this.tone(1318, 0.08, 'square', 0.03); this.tone(1760, 0.15, 'square', 0.03, 0, 0.07); },
  no() { this.tone(200, 0.15, 'triangle', 0.05, 150); },
  shot(k) { if (!this.ok(k, k === 'ardilla' ? 70 : 110)) return; if (k === 'ardilla') this.tone(900, 0.06, 'triangle', 0.02, 500); else if (k === 'tortuga') { this.noise(0.18, 0.08, 400, 90); this.tone(110, 0.15, 'sine', 0.06, 60); } else if (k === 'hongo') this.noise(0.25, 0.05, 2000, 500); else if (k === 'abejas') this.tone(220, 0.15, 'sawtooth', 0.012, 260); },
  boom() { if (!this.ok('boom', 90)) return; this.noise(0.25, 0.08, 500, 80); },
  pop(big) { if (!this.ok('pop', 45)) return; const f = 500 + Math.random() * 300; this.tone(f, 0.08, 'sine', 0.04, f * 1.6); if (big) this.noise(0.6, 0.15, 300, 60); },
  coin() { if (!this.ok('coin', 60)) return; this.tone(1568, 0.05, 'square', 0.012); },
  hurt() { this.tone(160, 0.3, 'sawtooth', 0.06, 70); this.noise(0.25, 0.08, 300, 80); },
  wave() { [0, 7, 12].forEach((s, i) => this.tone(262 * Math.pow(2, s / 12), 0.35, 'sawtooth', 0.025, 0, i * 0.12)); },
  boss() { this.tone(80, 1.2, 'sawtooth', 0.08, 50); this.noise(1.0, 0.1, 200, 60); },
  acorn() { this.noise(0.6, 0.14, 800, 80); this.tone(100, 0.4, 'sine', 0.08, 50); },
  root() { this.noise(0.5, 0.06, 200, 900); this.tone(180, 0.5, 'triangle', 0.05, 90); },
  win() { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => this.tone(392 * Math.pow(2, s / 12), 0.45, 'triangle', 0.05, 0, i * 0.09)); },
  lose() { [7, 4, 0, -5].forEach((s, i) => this.tone(330 * Math.pow(2, s / 12), 0.5, 'triangle', 0.05, 0, i * 0.2)); },
  tickMusic(on, wi) {
    const ac = this.ac; if (!ac || !on || !this.music) { if (ac) this.nb = Math.max(this.nb, ac.currentTime); return; }
    const sc = [[262, 330, 392, 440], [220, 262, 330, 392], [294, 370, 440, 494], [196, 233, 294, 349]][wi % 4];
    while (this.nb < ac.currentTime + 0.3) { const s = this.beat % 16, t = this.nb - ac.currentTime; if (s % 8 === 0) this.tone(sc[0] / 2, 1.5, 'sine', 0.02, 0, t); if (s % 2 === 0) this.tone(sc[[0, 2, 1, 3, 2, 1, 3, 0][(s / 2) | 0]] * 2, 0.25, 'triangle', 0.008, 0, t); this.nb += 0.22; this.beat++; }
  },
};

/* ---------- la partida ---------- */
function tdStart(mi) {
  if (TD.run) return; TDS.init();
  const D = tdData(); const INF = mi === 'inf'; const MI = INF ? TD_MAPS.length - 1 : mi; const M = TD_MAPS[MI], W = TD_WORLDS[M.w];
  const WAVES = INF ? Infinity : tdWaves(MI);
  const wrap = document.createElement('div'); wrap.className = 'gl-stage td-stage';
  wrap.innerHTML = `<canvas aria-label="Defensa del Bosque"></canvas>
    <div class="td-top"><button class="gm-x" id="tdX" aria-label="Salir">${icon('x')}</button><span class="td-pill">❤️ <b id="tdL">20</b></span><span class="td-pill">🌰 <b id="tdS">0</b></span><span class="td-pill td-w">Oleada <b id="tdW">0</b>${INF ? '' : `/${WAVES}`}</span><button class="td-btn" id="tdSp" aria-label="Velocidad">1×</button><button class="td-btn" id="tdPa" aria-label="Pausa">❚❚</button></div>
    <div class="td-panel" id="tdPanel" hidden></div>
    <div class="td-bot"><button class="td-pow" id="tdP1" aria-label="Lluvia de bellotas">🌰<i></i></button><button class="td-pow" id="tdP2" aria-label="Raíces">🌿<i></i></button><span class="td-hint" id="tdHint">Toca el pasto para poner una torre</span><button class="btn primary td-next" id="tdNext">▶ Empezar</button></div>
    <div class="gl-over" id="tdPause" hidden><b>Pausa</b><div class="btn-row" style="justify-content:center;flex-wrap:wrap"><button class="btn primary" id="tdGo">${icon('play')}Seguir</button><button class="btn" id="tdMus">Música: sí</button><button class="btn" id="tdRe">Reiniciar</button><button class="btn" id="tdOut">Salir</button></div></div>
    <div class="gl-over td-end" id="tdEnd" hidden></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const $w = (s) => wrap.querySelector(s);
  const c = wrap.querySelector('canvas'), g = c.getContext('2d');
  const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;visibility:hidden;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)'; wrap.appendChild(probe);
  const V = { w: 360, h: 640, dpr: 1, T: 40, ox: 0, oy: 0 }; let BG = null;
  const low = () => !!(window.cnPerf && window.cnPerf.low());

  /* --- caminos --- */
  const PATHS = M.paths.map((pts) => { const P = pts.map(([x, y]) => [x + 0.5, y + 0.5]); const seg = []; let L = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push({ a: P[i - 1], b: P[i], l, s: L }); L += l; } return { P, seg, L }; });
  const posAt = (pi, d) => { const p = PATHS[pi]; d = Math.max(0, Math.min(p.L, d)); for (const s of p.seg) { if (d <= s.s + s.l) { const k = (d - s.s) / s.l; return { x: s.a[0] + (s.b[0] - s.a[0]) * k, y: s.a[1] + (s.b[1] - s.a[1]) * k, dx: Math.sign(s.b[0] - s.a[0]) }; } } const e = p.P[p.P.length - 1]; return { x: e[0], y: e[1], dx: 0 }; };
  const blocked = new Set(); const key = (x, y) => y * 100 + x;
  for (const pts of M.paths) for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) { const x = Math.round(x0 + (x1 - x0) * k / n), y = Math.round(y0 + (y1 - y0) * k / n); if (x >= 0 && x < TD_COLS && y >= 0 && y < TD_ROWS) blocked.add(key(x, y)); } }
  const tree = M.paths[0][M.paths[0].length - 1]; blocked.add(key(tree[0], tree[1]));
  let sd = MI * 977 + 31; const rnd = () => { sd = (sd + 0x6D2B79F5) | 0; let t = Math.imul(sd ^ (sd >>> 15), 1 | sd); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const decos = []; for (let y = 0; y < TD_ROWS; y++) for (let x = 0; x < TD_COLS; x++) { if (blocked.has(key(x, y))) continue; if (rnd() < 0.07) { decos.push({ x, y, k: rnd() }); blocked.add(key(x, y)); } }

  const size = () => {
    V.dpr = Math.min(2, devicePixelRatio || 1); V.w = innerWidth; V.h = innerHeight; c.width = Math.round(V.w * V.dpr); c.height = Math.round(V.h * V.dpr); c.style.width = V.w + 'px'; c.style.height = V.h + 'px';
    const cs = getComputedStyle(probe); const st0 = parseFloat(cs.paddingTop) || 0, sb = parseFloat(cs.paddingBottom) || 0;
    const top = st0 + 58, bot = sb + 74; const ah = V.h - top - bot;
    V.T = Math.floor(Math.max(24, Math.min(V.w / TD_COLS, ah / TD_ROWS, 76))); V.ox = Math.round((V.w - TD_COLS * V.T) / 2); V.oy = Math.round(top + (ah - TD_ROWS * V.T) / 2);
    BG = null;
  };
  size(); addEventListener('resize', size);
  function paintBG() {
    const T = V.T; BG = document.createElement('canvas'); BG.width = c.width; BG.height = c.height; const q = BG.getContext('2d'); q.scale(V.dpr, V.dpr);
    q.fillStyle = W.bg; q.fillRect(0, 0, V.w, V.h);
    for (let y = 0; y < TD_ROWS; y++) for (let x = 0; x < TD_COLS; x++) { q.fillStyle = (x + y) % 2 ? W.g[0] : W.g[1]; q.fillRect(V.ox + x * T, V.oy + y * T, T, T); }
    // camino
    for (const p of PATHS) { q.strokeStyle = W.p[1]; q.lineWidth = T * 0.86; q.lineJoin = 'round'; q.lineCap = 'round'; q.beginPath(); p.P.forEach(([x, y], i) => { const X = V.ox + x * T, Y = V.oy + y * T; if (i) q.lineTo(X, Y); else q.moveTo(X, Y); }); q.stroke(); q.strokeStyle = W.p[0]; q.lineWidth = T * 0.72; q.stroke(); }
    let s2 = 7; const r2 = () => { s2 = (s2 * 16807) % 2147483647; return s2 / 2147483647; };
    for (let i = 0; i < 120; i++) { const x = V.ox + r2() * TD_COLS * T, y = V.oy + r2() * TD_ROWS * T; q.fillStyle = W.deco === 'pino' ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.06)'; q.fillRect(x, y, 2, 2); }
    for (const d of decos) {
      const X = V.ox + (d.x + 0.5) * T, Y = V.oy + (d.y + 0.5) * T;
      if (W.deco === 'flor') { if (d.k < 0.5) { q.fillStyle = '#8a8f98'; q.beginPath(); q.ellipse(X, Y + T * 0.1, T * 0.32, T * 0.24, 0, 0, 7); q.fill(); q.fillStyle = '#a8adb6'; q.beginPath(); q.ellipse(X - T * 0.08, Y, T * 0.2, T * 0.12, 0, 0, 7); q.fill(); } else { q.fillStyle = '#2f8a40'; q.beginPath(); q.arc(X, Y - T * 0.08, T * 0.36, 0, 7); q.fill(); q.fillStyle = '#4aaa5a'; q.beginPath(); q.arc(X - T * 0.1, Y - T * 0.16, T * 0.18, 0, 7); q.fill(); } }
      else if (W.deco === 'junco') { q.fillStyle = '#4a8aa8'; q.beginPath(); q.ellipse(X, Y, T * 0.42, T * 0.3, 0, 0, 7); q.fill(); q.fillStyle = 'rgba(255,255,255,.3)'; q.beginPath(); q.ellipse(X - T * 0.1, Y - T * 0.06, T * 0.16, T * 0.06, 0, 0, 7); q.fill(); q.strokeStyle = '#3a6a2a'; q.lineWidth = 2; for (let k = -1; k <= 1; k++) { q.beginPath(); q.moveTo(X + k * T * 0.2, Y + T * 0.2); q.lineTo(X + k * T * 0.25, Y - T * 0.35); q.stroke(); } }
      else if (W.deco === 'pino') { q.fillStyle = '#2f6a4a'; q.beginPath(); q.moveTo(X, Y - T * 0.45); q.lineTo(X - T * 0.32, Y + T * 0.25); q.lineTo(X + T * 0.32, Y + T * 0.25); q.fill(); q.fillStyle = '#fff'; q.beginPath(); q.moveTo(X, Y - T * 0.45); q.lineTo(X - T * 0.14, Y - T * 0.12); q.lineTo(X + T * 0.14, Y - T * 0.12); q.fill(); }
      else { q.fillStyle = d.k < 0.5 ? '#ff7a1f' : '#3a2a26'; q.beginPath(); q.ellipse(X, Y, T * 0.38, T * 0.28, 0, 0, 7); q.fill(); if (d.k < 0.5) { q.fillStyle = '#ffd23c'; q.beginPath(); q.ellipse(X - T * 0.06, Y - T * 0.04, T * 0.14, T * 0.08, 0, 0, 7); q.fill(); } }
    }
    // entradas
    for (const p of M.paths) { const [x, y] = p[0]; const X = V.ox + (Math.max(-0.2, Math.min(TD_COLS - 0.8, x)) + 0.5) * T, Y = V.oy + (Math.max(-0.2, Math.min(TD_ROWS - 0.8, y)) + 0.5) * T; q.fillStyle = 'rgba(200,40,40,.35)'; q.beginPath(); q.arc(X, Y, T * 0.4, 0, 7); q.fill(); }
    q.strokeStyle = 'rgba(0,0,0,.15)'; q.lineWidth = 2; q.strokeRect(V.ox, V.oy, TD_COLS * T, TD_ROWS * T);
  }

  /* --- estado --- */
  const LMAX = 20 + tdMeta('vidas') * 2;
  const st = { lives: LMAX, seeds: 140 + tdMeta('semillas') * 25, wave: 0, phase: 'build', countdown: 0, queue: [], spawnT: 0, en: [], tw: [], pr: [], parts: [], floats: [], t: 0, speed: 1, sel: null, build: null, aim: null, cd: { a: 0, r: 0 }, treeHit: 0, eid: 0, killed: 0, t0: Date.now(), over: false, last: performance.now(), id: 0, bossOn: null, spawned: 0 };
  const dmgMul = () => 1 + tdMeta('dano') * 0.06;
  const costOf = (k, l) => Math.round(TD_TW[k].cost[l] * (1 - tdMeta('barato') * 0.05));
  const spentOf = (t) => { let s = 0; for (let l = 0; l <= t.lvl; l++) s += costOf(t.k, l); return s; };
  const sellOf = (t) => Math.round(spentOf(t) * (tdMeta('venta') ? 0.85 : 0.7));
  const cdA = () => 25 * (1 - tdMeta('poder') * 0.12), cdR = () => 35 * (1 - tdMeta('poder') * 0.12);
  const towerAt = (x, y) => st.tw.find((t) => t.x === x && t.y === y);
  const recalcBuff = () => { for (const t of st.tw) { t.bm = 1; for (const a of st.tw) { if (a.k !== 'arbol' || a === t) continue; if (Math.hypot(a.x - t.x, a.y - t.y) <= TD_TW.arbol.rng[a.lvl] + 0.01) t.bm += TD_TW.arbol.buff[a.lvl]; } } };
  const float = (text, x, y, col, big) => st.floats.push({ text, x, y, t: 0, col: col || '#fff', big });
  const puff = (x, y, col, n, sp = 2) => { const cap = low() ? 70 : 180; for (let i = 0; i < n && st.parts.length < cap; i++) { const a = Math.random() * 6.28, v = sp * (0.3 + Math.random()); st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, l: 0.4 + Math.random() * 0.4, c: col, r: 1.5 + Math.random() * 2.5 }); } };

  /* --- oleadas --- */
  function makeWave(w) {
    const lvl = INF ? 12 + w * 0.5 : MI;
    const pool = [['escarabajo', 5]];
    if (w >= 3 || lvl >= 1) pool.push(['hormiga', 3]);
    if (w >= 5 || lvl >= 2) pool.push(['caracol', 2]);
    if (w >= 6 || lvl >= 3) pool.push(['polilla', 2.5]);
    if (lvl >= 4 && w >= 4) pool.push(['topo', 2]);
    if (lvl >= 5 && w >= 6) pool.push(['sanadora', 1.2]);
    if (lvl >= 6 && w >= 5) pool.push(['gusano', 2]);
    const tot = pool.reduce((a, p) => a + p[1], 0); const pick = () => { let r = Math.random() * tot; for (const [k, wt] of pool) { r -= wt; if (r <= 0) return k; } return 'escarabajo'; };
    const n = Math.round(6 + w * 1.25 + Math.min(lvl, 14) * 0.5); const gap = Math.max(0.32, 0.95 - w * 0.02);
    const q = []; let t = 0;
    const swarm = w > 3 && Math.random() < 0.25 ? pick() : null;
    for (let i = 0; i < n; i++) { q.push({ k: swarm && i % 2 ? swarm : pick(), t }); t += gap * (0.6 + Math.random() * 0.8); }
    const boss = (!INF && (w % 10 === 0 || w === WAVES) && w >= 10) || (INF && w >= 10 && w % 5 === 0);
    if (boss) q.push({ k: 'jefe', t: t + 1.5 });
    const hpMul = (1 + 0.13 * w + 0.009 * w * w) * (1 + Math.min(lvl, 20) * 0.1);
    return { q, hpMul };
  }
  let WV = null;
  function startWave() {
    if (st.phase !== 'build' || st.over) return;
    if (st.wave > 0 && st.countdown > 0) { const b = Math.ceil(st.countdown); st.seeds += b; float(`+${b} 🌰 por adelantarte`, TD_COLS / 2, 1, '#ffe066'); }
    st.wave++; WV = makeWave(st.wave); st.queue = WV.q.slice(); st.spawnT = 0; st.phase = 'wave'; st.spawned = 0;
    TDS.wave(); if (WV.q.some((x) => x.k === 'jefe')) setTimeout(() => { if (wrap.isConnected) { TDS.boss(); hint('⚠️ ¡Viene la Taladora gigante!', 2500); } }, 1500);
    hud();
  }
  function spawn(k) {
    const E = TD_EN[k]; const pi = st.spawned++ % PATHS.length; const hp = Math.round(E.hp * (WV ? WV.hpMul : 1));
    st.en.push({ id: ++st.eid, k, hp, max: hp, pi, d: 0, slowT: 0, slowK: 0, dotT: 0, dotD: 0, rootT: 0, under: false, burT: 2 + Math.random() * 2, healT: 2, x: 0, y: 0, dir: 1, dead: false, hit: 0 });
  }
  function damage(e, amt, pierce) {
    if (e.dead || e.under) return; const E = TD_EN[e.k];
    if (E.armor && !pierce) amt *= 1 - E.armor;
    e.hp -= amt; e.hit = 0.1; if (e.hp <= 0) kill(e);
  }
  function kill(e) {
    if (e.dead) return; e.dead = true; const E = TD_EN[e.k]; st.seeds += E.rew; st.killed++;
    puff(e.x, e.y, E.c, E.boss ? 40 : 8, E.boss ? 4 : 2); TDS.pop(E.boss); if (E.boss) { float(`+${E.rew} 🌰`, e.x, e.y - 0.5, '#ffe066', true); } else if (!low()) float(`+${E.rew}`, e.x, e.y - 0.3, '#ffe066');
    if (E.split) for (const o of [-0.25, 0.25]) { const hp = Math.round(TD_EN.gusito.hp * (WV ? WV.hpMul : 1)); st.en.push({ id: ++st.eid, k: 'gusito', hp, max: hp, pi: e.pi, d: Math.max(0, e.d + o), slowT: 0, slowK: 0, dotT: 0, dotD: 0, rootT: 0, under: false, burT: 9, healT: 9, x: e.x, y: e.y, dir: e.dir, dead: false, hit: 0 }); }
    TDS.coin();
  }

  /* --- torres --- */
  function inRange(t, e, rng) { return Math.hypot(e.x - (t.x + 0.5), e.y - (t.y + 0.5)) <= rng; }
  function target(t, rng, air) {
    let best = null, bv = -Infinity;
    for (const e of st.en) {
      if (e.dead || e.under) continue; if (TD_EN[e.k].fly && !air) continue; if (!inRange(t, e, rng)) continue;
      const rem = PATHS[e.pi].L - e.d; const v = t.mode === 'fuerte' ? e.hp : t.mode === 'ultimo' ? rem : -rem;
      if (v > bv) { bv = v; best = e; }
    }
    return best;
  }
  function towerTick(t, dt) {
    const K = TD_TW[t.k], L = t.lvl, mul = dmgMul() * (t.bm || 1);
    if (K.support) return;
    if (t.k === 'rayo') {
      let e = t.target && !t.target.dead && !t.target.under && inRange(t, t.target, K.rng[L]) ? t.target : null;
      if (!e) { e = target(t, K.rng[L], 1); if (e !== t.target) t.ramp = 0; t.target = e; }
      if (e) { t.ramp = Math.min(3, (t.ramp || 0) + dt); damage(e, K.dps[L] * (1 + t.ramp) * mul * dt, true); t.aim = Math.atan2(e.y - (t.y + 0.5), e.x - (t.x + 0.5)); }
      return;
    }
    t.cd -= dt; if (t.cd > 0) return;
    const e = target(t, K.rng[L], K.air); if (!e) return;
    t.cd = K.rate[L]; t.aim = Math.atan2(e.y - (t.y + 0.5), e.x - (t.x + 0.5)); t.kick = 0.12; TDS.shot(t.k);
    const sx = t.x + 0.5, sy = t.y + 0.25;
    if (t.k === 'ardilla') st.pr.push({ k: 'flecha', x: sx, y: sy, e, dmg: K.dmg[L] * mul, sp: 13 });
    else if (t.k === 'tortuga') st.pr.push({ k: 'bala', x0: sx, y0: sy, x1: e.x, y1: e.y, t: 0, T: 0.55, dmg: K.dmg[L] * mul, area: K.area[L] });
    else if (t.k === 'abejas') { for (let i = 0; i < K.nb[L]; i++) st.pr.push({ k: 'abeja', x: sx + (Math.random() - 0.5) * 0.4, y: sy, e, dmg: K.dmg[L] * mul, sp: 6 + Math.random(), life: 3, ph: Math.random() * 6 }); }
    else if (t.k === 'hongo') { const ax = e.x, ay = e.y; for (const o of st.en) { if (o.dead || o.under) continue; if (Math.hypot(o.x - ax, o.y - ay) <= K.area[L]) { o.dotT = 2.5; o.dotD = Math.max(o.dotD, K.dot[L] * mul); o.slowT = 1.6; o.slowK = Math.max(o.slowK, K.slow[L]); } } st.pr.push({ k: 'nube', x: ax, y: ay, t: 0, r: K.area[L] }); }
  }

  /* --- poderes --- */
  function cast(kind, x, y) {
    if (kind === 'a') { st.cd.a = cdA(); TDS.acorn(); st.pr.push({ k: 'bellotas', x, y, t: 0 }); }
    else { st.cd.r = cdR(); TDS.root(); for (const e of st.en) if (!e.dead && Math.hypot(e.x - x, e.y - y) <= 1.5 && !TD_EN[e.k].fly) e.rootT = 3; st.pr.push({ k: 'raiz', x, y, t: 0 }); }
    st.aim = null; hint(''); paintPow();
  }

  /* --- lógica --- */
  function step(dt) {
    st.t += dt; if (st.treeHit > 0) st.treeHit -= dt;
    st.cd.a = Math.max(0, st.cd.a - dt); st.cd.r = Math.max(0, st.cd.r - dt);
    if (st.over) return;
    if (st.phase === 'build' && st.wave > 0) { st.countdown -= dt; if (st.countdown <= 0) startWave(); }
    if (st.phase === 'wave') {
      st.spawnT += dt; while (st.queue.length && st.queue[0].t <= st.spawnT) spawn(st.queue.shift().k);
    }
    for (const e of st.en) {
      if (e.dead) continue; const E = TD_EN[e.k];
      if (e.hit > 0) e.hit -= dt;
      if (e.dotT > 0) { e.dotT -= dt; damage(e, e.dotD * dt, true); if (e.dead) continue; } else e.dotD = 0;
      if (e.slowT > 0) e.slowT -= dt; else e.slowK = 0;
      if (E.burrow) { e.burT -= dt; if (e.burT <= 0) { e.under = !e.under; e.burT = e.under ? 1.1 : 2.2 + Math.random() * 1.5; } }
      if (E.heal) { e.healT -= dt; if (e.healT <= 0) { e.healT = 2.2; for (const o of st.en) if (!o.dead && o !== e && Math.hypot(o.x - e.x, o.y - e.y) < 1.3) { o.hp = Math.min(o.max, o.hp + o.max * 0.12); } puff(e.x, e.y, '#9dff9d', 6, 1.5); } }
      let sp = E.sp * (1 - e.slowK); if (e.rootT > 0) { e.rootT -= dt; sp = 0; }
      e.d += sp * dt; const p = posAt(e.pi, e.d); if (p.dx) e.dir = p.dx; e.x = p.x; e.y = p.y;
      if (e.d >= PATHS[e.pi].L) { e.dead = true; const n = E.lives || 1; st.lives -= n; st.treeHit = 0.5; TDS.hurt(); float(`−${n} ❤️`, tree[0] + 0.5, tree[1], '#ff6b6b', true); if (navigator.vibrate) try { navigator.vibrate(60); } catch { /* */ } if (st.lives <= 0) { st.lives = 0; end(false); return; } }
    }
    st.en = st.en.filter((e) => !e.dead);
    for (const t of st.tw) { towerTick(t, dt); if (t.kick > 0) t.kick -= dt; }
    // proyectiles
    for (const q of st.pr) {
      if (q.k === 'flecha' || q.k === 'abeja') {
        if (q.e.dead || q.e.under) { if (q.k === 'abeja') { let b = null, bd = 3; for (const e of st.en) { if (e.dead || e.under) continue; const dd = Math.hypot(e.x - q.x, e.y - q.y); if (dd < bd) { bd = dd; b = e; } } if (b) q.e = b; else q.done = true; } else q.done = true; }
        if (q.done) continue;
        const dx = q.e.x - q.x, dy = q.e.y - q.y, dd = Math.hypot(dx, dy);
        if (q.k === 'abeja') { q.life -= dt; q.ph += dt * 20; if (q.life <= 0) { q.done = true; continue; } }
        if (dd < 0.22) { const air = TD_EN[q.e.k].fly; damage(q.e, q.dmg * (q.k === 'abeja' && air ? 2 : 1), false); q.done = true; continue; }
        q.x += dx / dd * q.sp * dt; q.y += dy / dd * q.sp * dt; q.ang = Math.atan2(dy, dx);
      } else if (q.k === 'bala') { q.t += dt; if (q.t >= q.T) { q.done = true; TDS.boom(); puff(q.x1, q.y1, '#a89a8a', 10, 2.5); for (const e of st.en) if (!e.dead && !TD_EN[e.k].fly && Math.hypot(e.x - q.x1, e.y - q.y1) <= q.area) damage(e, q.dmg, false); } }
      else if (q.k === 'nube') { q.t += dt; if (q.t > 0.8) q.done = true; }
      else if (q.k === 'bellotas') { q.t += dt; if (q.t >= 0.6 && !q.hit) { q.hit = true; st.shake = 0.4; puff(q.x, q.y, '#8a5a2c', 30, 4); const dmg = (60 + st.wave * 14) * dmgMul(); for (const e of st.en) if (!e.dead && Math.hypot(e.x - q.x, e.y - q.y) <= 1.7) damage(e, dmg, true); } if (q.t > 1) q.done = true; }
      else if (q.k === 'raiz') { q.t += dt; if (q.t > 3) q.done = true; }
    }
    st.pr = st.pr.filter((q) => !q.done);
    for (const p of st.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 3 * dt; } st.parts = st.parts.filter((p) => p.t < p.l);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 1.1);
    if (st.shake > 0) st.shake -= dt;
    // fin de oleada
    if (st.phase === 'wave' && !st.queue.length && !st.en.length) {
      const bonus = 15 + st.wave * 2 + st.tw.filter((t) => t.k === 'arbol').reduce((a, t) => a + TD_TW.arbol.seeds[t.lvl], 0);
      st.seeds += bonus; float(`Oleada superada · +${bonus} 🌰`, TD_COLS / 2, 2, '#ffe066', true); TDS.up();
      if (st.wave >= WAVES) { end(true); return; }
      st.phase = 'build'; st.countdown = 12; hud();
    }
  }

  /* --- dibujo --- */
  const SX = (x) => V.ox + x * V.T, SY = (y) => V.oy + y * V.T;
  function draw() {
    const T = V.T; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    if (!BG) paintBG(); g.drawImage(BG, 0, 0, V.w, V.h);
    if (st.shake > 0) g.translate((Math.random() - 0.5) * st.shake * 12, (Math.random() - 0.5) * st.shake * 12);
    // casilla elegida para construir
    if (st.build) { const { x, y } = st.build; g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(SX(x), SY(y), T, T); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(SX(x) + 1, SY(y) + 1, T - 2, T - 2); }
    // rango
    const rt = st.sel || (st.build && st.build.prev ? { x: st.build.x, y: st.build.y, k: st.build.prev, lvl: 0 } : null);
    if (rt) { const K = TD_TW[rt.k]; const r = K.rng[Math.min(3, rt.lvl)] * T; g.fillStyle = 'rgba(255,255,255,.14)'; g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.5; g.setLineDash([6, 5]); g.beginPath(); g.arc(SX(rt.x + 0.5), SY(rt.y + 0.5), r, 0, 7); g.fill(); g.stroke(); g.setLineDash([]); }
    // raíces
    for (const q of st.pr) if (q.k === 'raiz') { const a = Math.min(1, (3 - q.t) * 2); g.strokeStyle = `rgba(90,60,30,${0.8 * a})`; g.lineWidth = 3; for (let i = 0; i < 8; i++) { const an = i * 0.785; g.beginPath(); g.moveTo(SX(q.x), SY(q.y)); g.quadraticCurveTo(SX(q.x + Math.cos(an) * 0.8), SY(q.y + Math.sin(an + 0.5) * 0.8), SX(q.x + Math.cos(an) * 1.5), SY(q.y + Math.sin(an) * 1.5)); g.stroke(); } }
    // árbol grande (la meta)
    { const X = SX(tree[0] + 0.5), Y = SY(tree[1] + 0.5); const sh = st.treeHit > 0 ? Math.sin(st.t * 60) * 3 : 0; g.save(); g.translate(X + sh, Y); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, T * 0.42, T * 0.6, T * 0.15, 0, 0, 7); g.fill(); g.fillStyle = '#7a5232'; g.fillRect(-T * 0.12, -T * 0.1, T * 0.24, T * 0.52); const sw = Math.sin(st.t * 1.2) * T * 0.03; g.fillStyle = st.treeHit > 0 ? '#c84a3a' : '#2f8a40'; for (const [a, b, r] of [[0, -0.42, 0.42], [-0.3, -0.2, 0.3], [0.3, -0.2, 0.3]]) { g.beginPath(); g.arc(a * T + sw, b * T, r * T, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(-T * 0.12 + sw, -T * 0.55, T * 0.12, 0, 7); g.fill(); g.restore(); }
    // torres
    for (const t of st.tw) { const k = t.kick > 0 ? -t.kick * 8 : 0; tdDrawTower(g, t.k, t.lvl, SX(t.x + 0.5), SY(t.y + 0.5) + k, T, st.t, t.aim || 0); if (t === st.sel) { g.strokeStyle = '#ffd23c'; g.lineWidth = 2; g.strokeRect(SX(t.x) + 1, SY(t.y) + 1, T - 2, T - 2); } }
    // rayos
    for (const t of st.tw) if (t.k === 'rayo' && t.target && !t.target.dead) { const e = t.target; const k = (t.ramp || 0) / 3; g.strokeStyle = `rgba(120,240,255,${0.5 + 0.4 * k})`; g.lineWidth = 2 + k * 4; g.beginPath(); g.moveTo(SX(t.x + 0.5), SY(t.y + 0.15)); g.lineTo(SX(e.x), SY(e.y)); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.stroke(); }
    // enemigos (de arriba hacia abajo)
    const en = st.en.slice().sort((a, b) => a.y - b.y);
    for (const e of en) {
      const E = TD_EN[e.k]; tdDrawEnemy(g, e, SX(e.x), SY(e.y), T, st.t);
      if (e.hit > 0 && !e.under) { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(SX(e.x), SY(e.y), T * E.r * (E.boss ? 1.6 : 1), 0, 7); g.fill(); }
      if (e.slowK > 0 && !e.under) { g.fillStyle = 'rgba(160,220,120,.35)'; g.beginPath(); g.arc(SX(e.x), SY(e.y), T * 0.32, 0, 7); g.fill(); }
      if (e.rootT > 0) { g.strokeStyle = '#6b4a2a'; g.lineWidth = 2; g.beginPath(); g.arc(SX(e.x), SY(e.y) + T * 0.1, T * 0.3, 0, Math.PI); g.stroke(); }
      if (e.hp < e.max && !e.under) { const w = T * (E.boss ? 1.2 : 0.6), y = SY(e.y) - T * (E.boss ? 0.75 : 0.45); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(SX(e.x) - w / 2, y, w, 4); g.fillStyle = e.hp / e.max > 0.5 ? '#51cf66' : e.hp / e.max > 0.25 ? '#fcc419' : '#ff6b6b'; g.fillRect(SX(e.x) - w / 2, y, w * Math.max(0, e.hp / e.max), 4); }
    }
    // proyectiles
    for (const q of st.pr) {
      if (q.k === 'flecha') { g.save(); g.translate(SX(q.x), SY(q.y)); g.rotate(q.ang || 0); g.strokeStyle = '#6b3a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(-T * 0.18, 0); g.lineTo(T * 0.12, 0); g.stroke(); g.fillStyle = '#ddd'; g.beginPath(); g.moveTo(T * 0.16, 0); g.lineTo(T * 0.08, -3); g.lineTo(T * 0.08, 3); g.fill(); g.restore(); }
      else if (q.k === 'abeja') { const x = SX(q.x) + Math.sin(q.ph) * 2, y = SY(q.y) + Math.cos(q.ph * 1.3) * 2; g.fillStyle = '#ffd23c'; g.beginPath(); g.ellipse(x, y, 3.2, 2.4, 0, 0, 7); g.fill(); g.fillStyle = '#3a2a10'; g.fillRect(x - 0.8, y - 2.4, 1.6, 4.8); g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(x, y - 3, 2, 1.2, 0, 0, 7); g.fill(); }
      else if (q.k === 'bala') { const k = q.t / q.T; const x = q.x0 + (q.x1 - q.x0) * k, y = q.y0 + (q.y1 - q.y0) * k - Math.sin(k * Math.PI) * 1.2; g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(SX(q.x0 + (q.x1 - q.x0) * k), SY(q.y0 + (q.y1 - q.y0) * k), 4, 2, 0, 0, 7); g.fill(); g.fillStyle = '#3a3a40'; g.beginPath(); g.arc(SX(x), SY(y), T * 0.12, 0, 7); g.fill(); }
      else if (q.k === 'nube') { const a = 1 - q.t / 0.8; g.fillStyle = `rgba(200,120,220,${0.35 * a})`; g.beginPath(); g.arc(SX(q.x), SY(q.y), q.r * T * (0.6 + q.t * 0.5), 0, 7); g.fill(); }
      else if (q.k === 'bellotas') { if (q.t < 0.6) { for (let i = 0; i < 6; i++) { const a = i * 1.05; const r = 1.3 * (1 - q.t / 0.6); g.fillStyle = '#8a5a2c'; g.beginPath(); g.ellipse(SX(q.x + Math.cos(a) * 0.9), SY(q.y + Math.sin(a) * 0.9 - r * 3), 5, 6, 0, 0, 7); g.fill(); } g.strokeStyle = 'rgba(255,80,40,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(SX(q.x), SY(q.y), 1.7 * T, 0, 7); g.stroke(); } else { g.fillStyle = `rgba(255,200,80,${0.5 * (1 - (q.t - 0.6) / 0.4)})`; g.beginPath(); g.arc(SX(q.x), SY(q.y), 1.7 * T, 0, 7); g.fill(); } }
    }
    for (const p of st.parts) { g.globalAlpha = Math.max(0, 1 - p.t / p.l); g.fillStyle = p.c; g.fillRect(SX(p.x) - p.r, SY(p.y) - p.r, p.r * 2, p.r * 2); } g.globalAlpha = 1;
    g.textAlign = 'center'; for (const f of st.floats) { g.globalAlpha = Math.max(0, 1 - f.t / 1.1); g.font = `900 ${Math.round(T * (f.big ? 0.38 : 0.28))}px system-ui`; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.55)'; const y = SY(f.y) - f.t * 30; g.strokeText(f.text, SX(f.x), y); g.fillStyle = f.col; g.fillText(f.text, SX(f.x), y); } g.globalAlpha = 1;
    if (st.aim) { g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, 0, V.w, V.h); }
  }

  /* --- HUD y panel --- */
  let hintT = 0; const hint = (t, ms) => { $w('#tdHint').textContent = t || (st.phase === 'build' ? 'Toca el pasto para poner una torre' : ''); clearTimeout(hintT); if (ms) hintT = setTimeout(() => hint(''), ms); };
  function hud() {
    $w('#tdL').textContent = st.lives; $w('#tdS').textContent = Math.floor(st.seeds); $w('#tdW').textContent = st.wave;
    const nb = $w('#tdNext'); if (st.phase === 'build') { nb.hidden = false; nb.textContent = st.wave === 0 ? '▶ Empezar' : `▶ Siguiente · ${Math.ceil(st.countdown)}s`; } else nb.hidden = true;
    paintPow(); if (st.sel || st.build) refreshPanel();
  }
  function paintPow() { const a = $w('#tdP1'), r = $w('#tdP2'); a.classList.toggle('on', st.aim === 'a'); r.classList.toggle('on', st.aim === 'r'); a.querySelector('i').style.height = `${st.cd.a / cdA() * 100}%`; r.querySelector('i').style.height = `${st.cd.r / cdR() * 100}%`; a.disabled = st.cd.a > 0; r.disabled = st.cd.r > 0; }
  const panel = $w('#tdPanel');
  function openBuild(x, y) {
    st.sel = null; st.build = { x, y, prev: null };
    panel.innerHTML = `<div class="td-ph"><b>Construir aquí</b><button class="td-close" data-a="close" aria-label="Cerrar">✕</button></div><div class="td-tws">${Object.keys(TD_TW).map((k) => { const K = TD_TW[k]; const open = tdTowerOpen(k); return `<button type="button" class="td-tw" data-a="build" data-k="${k}" ${open ? '' : 'disabled'}><canvas width="64" height="64" data-k="${k}"></canvas><b>${open ? K.n.split(' ')[0] : '🔒'}</b><span>🌰 ${costOf(k, 0)}</span></button>`; }).join('')}</div>`;
    panel.hidden = false; panel.querySelectorAll('canvas[data-k]').forEach((cv) => { const q = cv.getContext('2d'); tdDrawTower(q, cv.dataset.k, 0, 32, 34, 48, 1); }); refreshPanel();
  }
  function openTower(t) {
    st.build = null; st.sel = t; const K = TD_TW[t.k];
    const info = () => { const L = t.lvl; return K.support ? `+${Math.round(K.buff[L] * 100)} % de daño cerca · +${K.seeds[L]} 🌰 por oleada` : t.k === 'rayo' ? `${K.dps[L]} daño/s (hasta ×4) · alcance ${K.rng[L]}` : t.k === 'hongo' ? `Veneno ${K.dot[L]}/s · frena ${Math.round(K.slow[L] * 100)} % · alcance ${K.rng[L]}` : `${K.dmg[L]}${t.k === 'abejas' ? ` × ${K.nb[L]} abejas` : ''} de daño · alcance ${K.rng[L]}${t.bm > 1 ? ` · +${Math.round((t.bm - 1) * 100)} % por árbol` : ''}`; };
    panel.innerHTML = `<div class="td-ph"><b>${K.n} · nivel ${t.lvl + 1}</b><button class="td-close" data-a="close" aria-label="Cerrar">✕</button></div><p class="td-inf2">${info()}</p>
      <div class="td-acts"><button type="button" class="btn primary" data-a="up"></button>${K.support ? '' : `<button type="button" class="btn" data-a="mode">🎯 ${({ primero: 'Al primero', fuerte: 'Al más fuerte', ultimo: 'Al último' })[t.mode]}</button>`}<button type="button" class="btn" data-a="sell">Vender · +${sellOf(t)} 🌰</button></div>`;
    panel.hidden = false; refreshPanel();
  }
  function refreshPanel() {
    if (st.build) panel.querySelectorAll('button[data-a="build"]').forEach((b) => { if (!tdTowerOpen(b.dataset.k)) return; b.disabled = st.seeds < costOf(b.dataset.k, 0); });
    if (st.sel) { const t = st.sel, b = panel.querySelector('[data-a="up"]'); if (b) { if (t.lvl >= 3) { b.textContent = 'Nivel máximo'; b.disabled = true; } else { const cst = costOf(t.k, t.lvl + 1); b.textContent = `Mejorar · 🌰 ${cst}`; b.disabled = st.seeds < cst; } } }
  }
  const closePanel = () => { panel.hidden = true; st.sel = null; st.build = null; };
  panel.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return; TDS.init(); const a = b.dataset.a;
    if (a === 'close') { closePanel(); return; }
    if (a === 'build' && st.build) { const k = b.dataset.k, cst = costOf(k, 0); if (st.seeds < cst) { TDS.no(); return; } st.seeds -= cst; const t = { k, lvl: 0, x: st.build.x, y: st.build.y, cd: 0, aim: -Math.PI / 2, mode: 'primero', bm: 1 }; st.tw.push(t); recalcBuff(); TDS.build(); puff(t.x + 0.5, t.y + 0.5, '#fff', 10, 2); closePanel(); hud(); return; }
    const t = st.sel; if (!t) return;
    if (a === 'up') { if (t.lvl >= 3) return; const cst = costOf(t.k, t.lvl + 1); if (st.seeds < cst) { TDS.no(); return; } st.seeds -= cst; t.lvl++; recalcBuff(); TDS.up(); puff(t.x + 0.5, t.y + 0.5, '#ffd23c', 14, 2.5); openTower(t); hud(); }
    else if (a === 'mode') { t.mode = ({ primero: 'fuerte', fuerte: 'ultimo', ultimo: 'primero' })[t.mode]; openTower(t); }
    else if (a === 'sell') { st.seeds += sellOf(t); st.tw = st.tw.filter((x) => x !== t); recalcBuff(); TDS.sell(); puff(t.x + 0.5, t.y + 0.5, '#ffe066', 10, 2); closePanel(); hud(); }
  });
  // tocar el mapa (al soltar el dedo, para que nunca se active sin querer)
  let pd = null;
  c.addEventListener('pointerdown', (e) => { TDS.init(); pd = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  c.addEventListener('pointerup', (e) => {
    if (!pd || Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 18) { pd = null; return; } pd = null; if (st.over) return;
    const fx = (e.clientX - V.ox) / V.T, fy = (e.clientY - V.oy) / V.T;
    if (st.aim) { if (fx >= -0.5 && fx <= TD_COLS + 0.5 && fy >= -0.5 && fy <= TD_ROWS + 0.5) cast(st.aim, fx, fy); return; }
    const x = Math.floor(fx), y = Math.floor(fy);
    if (x < 0 || y < 0 || x >= TD_COLS || y >= TD_ROWS) { closePanel(); return; }
    const t = towerAt(x, y); if (t) { openTower(t); TDS.tone(700, 0.05, 'sine', 0.03); return; }
    if (blocked.has(key(x, y))) { closePanel(); hint('Ahí no se puede construir: elige pasto libre', 1600); return; }
    openBuild(x, y); TDS.tone(600, 0.05, 'sine', 0.03);
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
  $w('#tdRe').addEventListener('click', () => { exit(false); tdStart(mi); });
  $w('#tdOut').addEventListener('click', () => exit(true));
  $w('#tdX').addEventListener('click', () => { if (st.over || st.wave === 0) exit(true); else pause(true); });
  const onVis = () => { if (document.hidden) pause(true); }; document.addEventListener('visibilitychange', onVis);
  const onKey = (e) => { if (e.key === 'Escape') pause(); else if (e.key === ' ' && st.phase === 'build') { e.preventDefault(); startWave(); } };
  addEventListener('keydown', onKey);

  /* --- final --- */
  function end(won) {
    if (st.over) return; st.over = true; closePanel(); st.aim = null;
    const el = $w('#tdEnd'); const secs = Math.max(1, Math.round((Date.now() - st.t0) / 1000));
    if (INF) {
      const w = Math.max(0, st.wave - 1); const nb = w > (D.inf || 0); if (nb) D.inf = w; jpSave(); TDS.lose();
      if (w > 0) jgPost({ game: 'torres', score: w, apples: 0, dur: secs }).then((rec) => { const l = $w('#tdRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Lugar #${rec.rankDay} de hoy`; });
      el.innerHTML = `<b>${nb ? '¡Nuevo récord!' : 'El bosque resistió'}</b><span>Aguantaste <b>${w}</b> oleadas</span><span class="small muted">Tu mejor: ${D.inf} oleadas</span><span class="small muted" id="tdRank"></span><div class="btn-row" style="justify-content:center"><button class="btn primary" data-e="re">Otra vez</button><button class="btn" data-e="out">Mapas</button></div>`;
    } else if (won) {
      const k = st.lives / LMAX; const stars = k >= 0.9 ? 3 : k >= 0.5 ? 2 : 1; const prev = D.st[MI] || 0;
      if (stars > prev) { D.st[MI] = stars; const gain = stars - prev; jgCoins(gain * 2); }
      jpSave(); TDS.win();
      const next = MI + 1 < TD_MAPS.length;
      el.innerHTML = `<b>¡Salvaste el bosque!</b><span class="td-bigst">${[0, 1, 2].map((i) => `<i class="${i < stars ? 'on' : ''}">★</i>`).join('')}</span><span>${M.n} · ${st.lives}/${LMAX} vidas</span>${stars > prev ? `<span class="pm-gain">+${(stars - prev)} ⭐ para tus raíces · +${(stars - prev) * 2} monedas para tu árbol</span>` : ''}${next && prev === 0 ? `<span class="small">🔓 Abriste: ${TD_MAPS[MI + 1].n}${Object.entries(TD_TW).filter(([, w]) => w.un === MI + 1).map(([, w]) => ` · torre nueva: ${w.n}`).join('')}</span>` : ''}
        <div class="btn-row" style="justify-content:center;flex-wrap:wrap">${next ? '<button class="btn primary" data-e="next">Siguiente mapa</button>' : ''}<button class="btn" data-e="re">Repetir</button><button class="btn" data-e="out">Mapas</button></div>`;
    } else {
      TDS.lose();
      el.innerHTML = `<b>Las plagas llegaron al Gran Árbol</b><span>Llegaste a la oleada ${st.wave} de ${WAVES}</span><span class="small muted">Consejo: mejora tus torres antes de comprar más, pon hongos en las curvas y usa las raíces con el jefe. En Raíces puedes comprar mejoras con tus estrellas.</span><div class="btn-row" style="justify-content:center"><button class="btn primary" data-e="re">Intentar de nuevo</button><button class="btn" data-e="out">Mapas</button></div>`;
    }
    el.hidden = false; el.classList.add('show');
    el.onclick = (ev) => { const b = ev.target.closest('[data-e]'); if (!b) return; const a = b.dataset.e; if (a === 're') { exit(false); tdStart(mi); } else if (a === 'next') { exit(false); tdStart(MI + 1); } else exit(true); };
  }

  /* --- bucle --- */
  let hudT = 0;
  const loop = (now) => {
    st.id = requestAnimationFrame(loop);
    if (paused) { st.last = now; return; }
    const raw = Math.min(0.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
    const n = st.speed; for (let i = 0; i < n; i++) step(raw);
    draw(); TDS.tickMusic(!st.over, M.w);
    hudT += raw; if (hudT > 0.2) { hudT = 0; hud(); }
  };
  st.id = requestAnimationFrame(loop); hud();
  hint(INF ? '♾️ Modo infinito: aguanta todas las oleadas que puedas' : `${M.n}: pon tus torres y toca Empezar`, 3500);
  const exit = (go) => {
    cancelAnimationFrame(st.id); removeEventListener('resize', size); removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', onVis);
    wrap.remove(); document.body.classList.remove('gm-on'); TD.run = null;
    if (go) { if (location.hash !== '#/torres') location.hash = '#/torres'; else render(); }
  };
  TD.run = { exit, st: () => st, V };
}

EXTRA_VIEWS.torres = viewTorres; EXTRA_NAV.torres = 'juegos';
{
  const baseJuegos = viewJuegos;
  viewJuegos = function () { return baseJuegos().replace('<ul class="rows" style="margin-top:18px">', `<ul class="rows" style="margin-top:18px"><li><a href="#/torres"><span class="ico">${icon('play')}</span><span class="txt"><b>Defensa del Bosque <em class="sc-new">Nuevo</em></b><span>Pon torres de animales, detén a las plagas y salva al Gran Árbol en 12 mapas.</span></span>${icon('chev', 'chev')}</a></li>`); };
  EXTRA_VIEWS.juegos = viewJuegos;
}
