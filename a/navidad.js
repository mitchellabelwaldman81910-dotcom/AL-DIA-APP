/* Cinnavia 7.22 — Árbol de Navidad.
   Un árbol propio con 40 niveles que se compran con las monedas de Vida (y las que caen en los juegos).
   Cada nivel lo hace crecer; en la tienda hay árboles, esferas, adornos, luces, guirnaldas, cimas, bases,
   suelos, fondos y efectos. Todo se coloca solo, con orden y gusto, y se adapta al tamaño del árbol.
   El estado vive en S.vida.nav (se une entre dispositivos) y las compras en S.vida.shop.own como "nv:<id>". */
'use strict';

const NV = { tab: 'arbol', cat: 'tree', pv: null, u: 0 };
const NAV_MAX = 40;
const navCost = (l) => Math.round(8 + l * 2.4 + l * l * 0.12);

/* ---------- catálogo ---------- */
const NV_TREES = [
  ['pino', 'Pino clásico', 0, ['#3F9A5C', '#2C7A47', '#1D5A34'], 0],
  ['abeto', 'Abeto azul', 60, ['#4C8F8A', '#34706E', '#215250'], 0],
  ['nevado', 'Pino nevado', 120, ['#3F9A5C', '#2C7A47', '#1D5A34'], 1],
  ['esmeralda', 'Esmeralda', 150, ['#2FB57A', '#1E8F5E', '#126C45'], 0],
  ['escarchado', 'Escarchado', 200, ['#7FB89A', '#5E9C7D', '#3F7A5E'], 2],
  ['blanco', 'Blanco nórdico', 220, ['#FBFCFF', '#E4EAF4', '#C6D0E2'], 0],
  ['plateado', 'Plateado', 260, ['#EEF1F6', '#C5CCD8', '#98A2B4'], 0],
  ['rosa', 'Rosa algodón', 260, ['#F8C9DA', '#EDA2BE', '#CF7898'], 0],
  ['dorado', 'Dorado', 320, ['#F6DC86', '#E1B84F', '#B98C2A'], 0],
  ['rojo', 'Rojo festivo', 320, ['#E0524F', '#BB3433', '#8C2121'], 0],
  ['cristal', 'Hielo de cristal', 360, ['#CFEFFF', '#9ED6F2', '#6FB3DA'], 1],
  ['medianoche', 'Medianoche', 340, ['#6C5BB4', '#4C3F94', '#332A70'], 1],
];
const NV_BALLS = [
  ['rojo', 'Rojo', 0, '#E5484D'], ['oro', 'Oro', 14, '#E8B94A'], ['plata', 'Plata', 14, '#C9D1DC'], ['azul', 'Azul', 18, '#4E8FE0'],
  ['verde', 'Verde', 18, '#3FA56B'], ['rosa', 'Rosa', 20, '#EE8FB0'], ['morado', 'Morado', 22, '#8E6BD6'], ['cobre', 'Cobre', 26, '#C9794A'],
  ['perla', 'Perla', 30, '#F4EEE4'], ['turquesa', 'Turquesa', 30, '#3FC1C9'], ['vino', 'Vino', 34, '#8C2F4B'], ['hielo', 'Hielo', 40, '#BFE6F7'],
];
const NV_MINIS = [
  ['estrella', 'Estrellita', 16], ['campana', 'Campana', 18], ['baston', 'Bastón de caramelo', 20], ['muneco', 'Muñeco de nieve', 28],
  ['copo', 'Copo de nieve', 18], ['pina', 'Piña', 18], ['corazon', 'Corazón', 20], ['angel', 'Angelito', 34], ['regalito', 'Regalito', 22],
  ['galleta', 'Galleta de jengibre', 26], ['gorro', 'Gorro de Santa', 26], ['calcetin', 'Calcetín', 24], ['reno', 'Reno', 36],
  ['lazo', 'Lazo', 18], ['vela', 'Vela', 22], ['acebo', 'Acebo', 20], ['paloma', 'Paloma de la paz', 32], ['manopla', 'Manopla', 22],
];
const NV_LIGHTS = [
  ['calida', 'Luz cálida', 24, ['#FFD98A']], ['fria', 'Luz fría', 24, ['#CDE9FF']], ['multi', 'Multicolor', 40, ['#FF5A5F', '#FFC145', '#4DD0A0', '#4E9BFF', '#C26BFF']],
  ['rojaverde', 'Rojo y verde', 36, ['#FF5A5F', '#4DD0A0']], ['azul', 'Azul hielo', 36, ['#6CB4FF', '#9BD0FF']], ['dorada', 'Dorada', 44, ['#FFC94A', '#FFE08A']],
  ['rosa', 'Rosa', 44, ['#FF8FC0', '#FFC0DA']], ['violeta', 'Violeta', 48, ['#B28BFF', '#D8C2FF']], ['blanca', 'Blanco puro', 52, ['#FFFFFF']],
];
const NV_GARLS = [
  ['oro', 'Oropel dorado', 26, 'tin', ['#E2B94E']], ['plata', 'Oropel plateado', 26, 'tin', ['#D4DAE4']], ['rojo', 'Oropel rojo', 30, 'tin', ['#D94A4C']],
  ['perlas', 'Perlas blancas', 40, 'pearl', ['#FFFFFF']], ['perlasoro', 'Perlas doradas', 46, 'pearl', ['#F1CF73']],
  ['cuentas', 'Cuentas de colores', 44, 'beads', ['#E5484D', '#F3C14B', '#3FA56B', '#4E8FE0']],
  ['cintaroja', 'Cinta roja', 34, 'ribbon', ['#CF3C45']], ['cintaoro', 'Cinta dorada', 38, 'ribbon', ['#D6A93F']],
];
const NV_TOPS = [
  ['estoro', 'Estrella dorada', 24], ['estplata', 'Estrella plateada', 28], ['estcristal', 'Estrella de cristal', 44], ['angel', 'Ángel', 60],
  ['lazo', 'Gran lazo rojo', 40], ['copo', 'Copo gigante', 50], ['corona', 'Corona dorada', 70],
];
const NV_BASES = [
  ['regalos', 'Montón de regalos', 40], ['falda', 'Falda blanca', 30], ['canasta', 'Canasta de mimbre', 36], ['macetero', 'Macetero rojo', 20],
  ['barril', 'Barril de madera', 28], ['trineo', 'Trineo con regalos', 90], ['lena', 'Leños apilados', 34],
];
const NV_GROUNDS = [
  ['nieve', 'Nieve', 0], ['pradera', 'Pradera de invierno', 24], ['madera', 'Piso de madera', 40], ['alfombra', 'Alfombra roja', 30], ['lago', 'Lago helado', 50],
];
const NV_BGS = [
  ['noche', 'Noche estrellada', 0], ['crema', 'Crema cálido', 0], ['nevada', 'Día de nieve', 40], ['violeta', 'Cielo violeta', 60], ['rosa', 'Amanecer rosa', 50],
  ['atardecer', 'Atardecer', 70], ['bosque', 'Bosque nevado', 70], ['ventana', 'Ventana nevada', 80], ['salon', 'Salón con chimenea', 90],
  ['aurora', 'Aurora boreal', 110], ['lujo', 'Verde y oro', 120],
];
const NV_FX = [
  ['nieve', 'Nieve cayendo', 40], ['destellos', 'Destellos', 50], ['luciernagas', 'Luces flotantes', 50], ['fugaces', 'Estrellas fugaces', 70], ['farolitos', 'Farolitos', 60],
];
const NV_CATS = [['tree', 'Árboles', NV_TREES], ['ball', 'Esferas', NV_BALLS], ['mini', 'Adornos', NV_MINIS], ['light', 'Luces', NV_LIGHTS], ['garl', 'Guirnaldas', NV_GARLS],
  ['top', 'Cimas', NV_TOPS], ['base', 'Bases', NV_BASES], ['ground', 'Suelos', NV_GROUNDS], ['bg', 'Fondos', NV_BGS], ['fx', 'Efectos', NV_FX]];
const NV_KEY = { tree: 'tree', ball: 'balls', mini: 'minis', light: 'light', garl: 'garl', top: 'top', base: 'base', ground: 'ground', bg: 'bg', fx: 'fx' };
const NV_MULTI = { ball: 1, mini: 1, fx: 1 };
const NV_OPTIONAL = { light: 1, garl: 1, top: 1, base: 1 };
const NV_BY = {}; // id compuesto "kind:id" -> { id, k, n, p, raw }
for (const [k, , list] of NV_CATS) for (const raw of list) NV_BY[`${k}:${raw[0]}`] = { id: raw[0], k, n: raw[1], p: raw[2], raw: k === 'tree' ? [raw[0], raw[1], raw[2], raw[3], raw[4]] : raw };
const nvOwnKey = (k, id) => `nv:${k}:${id}`;
const nvPrice = (k, id) => (NV_BY[`${k}:${id}`] || { p: 0 }).p;

/* ---------- estado ---------- */
function navData() {
  const v = shopData();
  const n = (v.nav ||= {});
  n.lv = Math.max(0, Math.min(NAV_MAX, n.lv | 0));
  if (!n.tree) n.tree = 'pino'; if (!Array.isArray(n.balls)) n.balls = ['rojo']; if (!Array.isArray(n.minis)) n.minis = [];
  if (!Array.isArray(n.fx)) n.fx = []; if (!n.ground) n.ground = 'nieve'; if (!n.bg) n.bg = 'noche';
  if (n.lmode !== 'steady' && n.lmode !== 'blink' && n.lmode !== 'wave') n.lmode = 'steady';
  if (!(n.dens >= 1 && n.dens <= 3)) n.dens = 2;
  return n;
}
const navHas = (k, id) => { try { return nvPrice(k, id) === 0 || shopData().shop.own.includes(nvOwnKey(k, id)); } catch { return false; } };
function navLevelSpent() { try { const lv = navData().lv; let s = 0; for (let l = 1; l <= lv; l++) s += navCost(l); return s; } catch { return 0; } }
{
  const basePrice = priceOf; priceOf = function (key) { return key.startsWith('nv:') ? (() => { const [, k, id] = key.split(':'); return nvPrice(k, id); })() : basePrice(key); };
  const baseSpent = coinsSpent; coinsSpent = function () { return baseSpent() + navLevelSpent(); };
}
/* monedas ganadas jugando: se suman al saldo sin repintar nada */
function navCoins(n) { try { const v = shopData(); v.bonus = (v.bonus || 0) + n; save(); } catch { /* */ } }

/* configuración efectiva (solo lo que posees) + prueba temporal */
function navCfg(pv) {
  const n = navData(); const c = { lv: n.lv, tree: n.tree, balls: [...n.balls], minis: [...n.minis], light: n.light || null, lmode: n.lmode, garl: n.garl || null, top: n.top || null,
    base: n.base || null, ground: n.ground, bg: n.bg, fx: [...n.fx], dens: n.dens };
  if (pv && pv.k && NV_BY[`${pv.k}:${pv.id}`]) {
    const key = NV_KEY[pv.k];
    if (NV_MULTI[pv.k]) { if (!c[key].includes(pv.id)) c[key].push(pv.id); } else c[key] = pv.id;
  }
  const ok = (k, id) => id && NV_BY[`${k}:${id}`] && (pv && pv.k === k && pv.id === id ? true : navHas(k, id));
  if (!ok('tree', c.tree)) c.tree = 'pino';
  c.balls = c.balls.filter((i) => ok('ball', i)); c.minis = c.minis.filter((i) => ok('mini', i)); c.fx = c.fx.filter((i) => ok('fx', i));
  if (!ok('light', c.light)) c.light = null; if (!ok('garl', c.garl)) c.garl = null; if (!ok('top', c.top)) c.top = null; if (!ok('base', c.base)) c.base = null;
  if (!ok('ground', c.ground)) c.ground = 'nieve'; if (!ok('bg', c.bg)) c.bg = 'noche';
  return c;
}

/* ---------- dibujo ---------- */
const nvR = (seed) => { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const nvDark = (h, f = 0.55) => { const m = /^#([0-9a-f]{6})$/i.exec(h); if (!m) return '#333'; const v = parseInt(m[1], 16); const c = (sh) => Math.round(((v >> sh) & 255) * f).toString(16).padStart(2, '0'); return `#${c(16)}${c(8)}${c(0)}`; };
const nr = (x) => Math.round(x * 10) / 10;
const nvStar = (r, ri, n = 5, rot = -90) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = ((rot + (i * 180) / n) * Math.PI) / 180; const rr = i % 2 ? ri : r; d += `${i ? 'L' : 'M'}${nr(Math.cos(a) * rr)} ${nr(Math.sin(a) * rr)}`; } return d + 'Z'; };

/* adornos pequeños: caja de ~12 unidades centrada en 0,0 */
function nvMini(id, s = 1) {
  const g = (inner) => `<g transform="scale(${s})">${inner}</g>`;
  switch (id) {
    case 'estrella': return g(`<path d="${nvStar(5.6, 2.4)}" fill="#F2C94C" stroke="#B98C2A" stroke-width=".5"/>`);
    case 'campana': return g(`<path d="M-4.2 3.4Q-4 -4 0 -4.6Q4 -4 4.2 3.4Z" fill="#E2B94E" stroke="#A97F20" stroke-width=".5"/><circle cy="4.4" r="1.2" fill="#A97F20"/><path d="M-1 -4.7q1 -2 2 0" fill="none" stroke="#A97F20" stroke-width=".7"/>`);
    case 'baston': return g(`<path d="M2.4 5.5V-2.2a2.7 2.7 0 0 0-5.4 0" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M2.4 5.5V-2.2a2.7 2.7 0 0 0-5.4 0" fill="none" stroke="#D93A44" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="1.6 1.9"/>`);
    case 'muneco': return g(`<circle cy="2.6" r="3.2" fill="#fff" stroke="#B8C6DA" stroke-width=".5"/><circle cy="-1.8" r="2.3" fill="#fff" stroke="#B8C6DA" stroke-width=".5"/><rect x="-1.9" y="-5.2" width="3.8" height="2" rx=".5" fill="#2B2F3A"/><path d="M0 -1.6l3 .5-3 .6z" fill="#F08A24"/><circle cx="-.8" cy="-2.4" r=".35" fill="#222"/><circle cx=".8" cy="-2.4" r=".35" fill="#222"/>`);
    case 'copo': return g(`<g stroke="#EAF6FF" stroke-width=".9" stroke-linecap="round" fill="none"><path d="M0-5.4V5.4M-4.7-2.7L4.7 2.7M-4.7 2.7L4.7-2.7"/><path d="M-1.2-4.3L0-3 1.2-4.3M-1.2 4.3L0 3 1.2 4.3" stroke-width=".6"/></g><circle r=".9" fill="#fff"/>`);
    case 'pina': return g(`<ellipse cy="1" rx="3" ry="4.2" fill="#8A5A36" stroke="#5B3A22" stroke-width=".5"/><path d="M-2.4 -.8l4.8 3.6M-2.8 1.4l4 2.6M2.4 -.8l-4.8 3.6M2.8 1.4l-4 2.6" stroke="#5B3A22" stroke-width=".5" opacity=".7"/><path d="M0-3.2v-2.2" stroke="#5B3A22" stroke-width=".8"/>`);
    case 'corazon': return g(`<path d="M0 5C-6 .4-4.6-4.4-1.6-4.4 0-4.4 0-3 0-3S0-4.4 1.6-4.4C4.6-4.4 6 .4 0 5Z" fill="#E5484D" stroke="#A8242C" stroke-width=".5"/><path d="M-2.6-2.6q.8-.8 1.6-.4" stroke="#fff" stroke-width=".7" fill="none" opacity=".7"/>`);
    case 'angel': return g(`<path d="M0 0C-6-4-7 1-3 2.4M0 0C6-4 7 1 3 2.4" fill="#fff" stroke="#C7D2E2" stroke-width=".5"/><path d="M-2.4 5l2.4-8 2.4 8z" fill="#fff" stroke="#C7D2E2" stroke-width=".5"/><circle cy="-4.2" r="1.8" fill="#FBE3C4"/><ellipse cy="-6.2" rx="2.1" ry=".6" fill="none" stroke="#E2B94E" stroke-width=".6"/>`);
    case 'regalito': return g(`<rect x="-3.6" y="-2.6" width="7.2" height="6.6" rx=".6" fill="#3B8F68" stroke="#226447" stroke-width=".5"/><path d="M0-2.6V4M-3.6 .8H3.6" stroke="#F2C94C" stroke-width="1.2"/><path d="M0-2.6q-2.4-3-3-.8 0 1.4 3 .8q3 .6 3-.8-.6-2.2-3 .8" fill="none" stroke="#F2C94C" stroke-width=".8"/>`);
    case 'galleta': return g(`<g fill="#B8773F" stroke="#7E4E24" stroke-width=".5"><circle cy="-3.8" r="2.1"/><path d="M-1.8-2H-5.4v2.2h3.4l-1 5.6h2.2L0 2.4l.8 3.4H3l-1-5.6h3.4V-2H1.8z" stroke-linejoin="round"/></g><g fill="#fff"><circle cx="-.8" cy="-4" r=".4"/><circle cx=".8" cy="-4" r=".4"/><circle cy="-.6" r=".5"/><circle cy="1.4" r=".5"/></g>`);
    case 'gorro': return g(`<path d="M-4.4 3.4L-1 -4.4Q2 -5.6 3.6-3.4 4.6 0 4.4 3.4Z" fill="#D93A44" stroke="#A02029" stroke-width=".5"/><rect x="-5" y="2.6" width="10" height="2.4" rx="1.2" fill="#fff"/><circle cx="3.4" cy="-3.8" r="1.4" fill="#fff"/>`);
    case 'calcetin': return g(`<path d="M-2.6-5H2.4V1.2L4.8 3.6Q5.6 5.6 3.6 5.8H-.4Q-2.8 5.6-2.6 3.4Z" fill="#D93A44" stroke="#A02029" stroke-width=".5"/><rect x="-3.2" y="-6" width="6" height="2.4" rx="1" fill="#fff"/><path d="M-2.6 3.6h3" stroke="#fff" stroke-width="1.2" opacity=".8"/>`);
    case 'reno': return g(`<circle cy="1.4" r="3.1" fill="#9C6B3F" stroke="#6B4524" stroke-width=".5"/><path d="M-2-1.4L-3.4-5M-3.4-5l-1.6.4M-3.4-5l.6-1.8M2-1.4L3.4-5M3.4-5l1.6.4M3.4-5l-.6-1.8" stroke="#6B4524" stroke-width=".7" stroke-linecap="round" fill="none"/><circle cy="2.8" r="1" fill="#E5484D"/><circle cx="-1.2" cy=".8" r=".4" fill="#222"/><circle cx="1.2" cy=".8" r=".4" fill="#222"/>`);
    case 'lazo': return g(`<path d="M0 0L-5.4-3.6V3.6ZM0 0L5.4-3.6V3.6Z" fill="#D93A44" stroke="#A02029" stroke-width=".5"/><circle r="1.5" fill="#B82833"/><path d="M-1 1.4L-2.6 5.6M1 1.4L2.6 5.6" stroke="#D93A44" stroke-width="1.3" stroke-linecap="round"/>`);
    case 'vela': return g(`<rect x="-2" y="-1" width="4" height="6.4" rx=".6" fill="#F6EBD2" stroke="#CDB98C" stroke-width=".5"/><path d="M0-1.4C-1.6-3.4 0-4.6 0-6.2 1.6-4.6 1.4-2.6 0-1.4Z" fill="#F7A23A"/>`);
    case 'acebo': return g(`<path d="M0 0Q-4.6-4.6-5.4 0 -3 .8 0 0ZM0 0Q4.6-4.6 5.4 0 3 .8 0 0Z" fill="#2E8B57" stroke="#1D5E3A" stroke-width=".5"/><circle cx="-1.2" cy="1.4" r="1.2" fill="#D93A44"/><circle cx="1.2" cy="1.4" r="1.2" fill="#D93A44"/><circle cy="2.8" r="1.2" fill="#D93A44"/>`);
    case 'paloma': return g(`<path d="M-5 1.4Q-1 -.6 1.6-3.4 2-1 1 .4 3 -.4 5.2-2.6 4 1.6 .8 3.6 -2.4 4.4-5 1.4Z" fill="#fff" stroke="#BFCADA" stroke-width=".5"/><circle cx="3" cy="-2.2" r=".4" fill="#333"/>`);
    case 'manopla': return g(`<path d="M-3.4-1.6Q-3.4-5.4 0-5.4T3.4-1.6V3.4Q3.4 5.6 0 5.6T-3.4 3.4Z" fill="#4E8FE0" stroke="#2C61A6" stroke-width=".5"/><path d="M3 -.6Q6.4-1.6 6 1.2 5 2.6 3 2.2Z" fill="#4E8FE0" stroke="#2C61A6" stroke-width=".5"/><rect x="-3.8" y="3.4" width="7.6" height="2.2" rx="1" fill="#fff"/>`);
    default: return '';
  }
}
/* cimas */
function nvTopper(id, s = 1) {
  const g = (inner) => `<g transform="scale(${s})">${inner}</g>`;
  switch (id) {
    case 'estoro': return g(`<path d="${nvStar(15, 6.4)}" transform="translate(0 -13)" fill="#F7D569" stroke="#B98C2A" stroke-width=".8" stroke-linejoin="round"/><circle cy="-13" r="3" fill="#FFF2B8"/>`);
    case 'estplata': return g(`<path d="${nvStar(15, 6.4)}" transform="translate(0 -13)" fill="#E6EBF3" stroke="#8D98AB" stroke-width=".8" stroke-linejoin="round"/><circle cy="-13" r="3" fill="#fff"/>`);
    case 'estcristal': return g(`<path d="${nvStar(15, 5.6, 8, -90)}" transform="translate(0 -14)" fill="#CFEFFF" stroke="#6FB3DA" stroke-width=".8" stroke-linejoin="round" opacity=".95"/><path d="${nvStar(8, 3, 8, -67.5)}" transform="translate(0 -14)" fill="#fff" opacity=".85"/>`);
    case 'angel': return g(`<path d="M0-6C-14-18-17 0-5-1M0-6C14-18 17 0 5-1" fill="#fff" stroke="#C7D2E2" stroke-width=".8"/><path d="M-5 0L0-20 5 0Z" fill="#fff" stroke="#C7D2E2" stroke-width=".8"/><circle cy="-23" r="4.4" fill="#FBE3C4"/><ellipse cy="-28" rx="5" ry="1.4" fill="none" stroke="#E2B94E" stroke-width="1.2"/>`);
    case 'lazo': return g(`<path d="M0-6L-13-14V-1ZM0-6L13-14V-1Z" fill="#D93A44" stroke="#A02029" stroke-width=".8"/><circle cy="-7" r="3.4" fill="#B82833"/><path d="M-2 -3L-6 5M2-3L6 5" stroke="#D93A44" stroke-width="2.6" stroke-linecap="round"/>`);
    case 'copo': return g(`<g transform="translate(0 -14)" stroke="#EAF6FF" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M0-14V14M-12.2-7L12.2 7M-12.2 7L12.2-7"/><path d="M-3-11L0-8 3-11M-3 11L0 8 3 11M-12-4.6L-8.6-4.2-9.4-8.6M12-4.6L8.6-4.2 9.4-8.6M-12 4.6L-8.6 4.2-9.4 8.6M12 4.6L8.6 4.2 9.4 8.6" stroke-width="1"/></g><circle cy="-14" r="2.4" fill="#fff"/>`);
    case 'corona': return g(`<path d="M-11 0L-13-14-6-8 0-17 6-8 13-14 11 0Z" fill="#F0C94E" stroke="#B98C2A" stroke-width=".8" stroke-linejoin="round"/><circle cx="-13" cy="-14" r="1.8" fill="#E5484D"/><circle cy="-17" r="1.8" fill="#4E8FE0"/><circle cx="13" cy="-14" r="1.8" fill="#3FA56B"/><rect x="-11" y="-3" width="22" height="3" fill="#C89A2E"/>`);
    default: return '';
  }
}
/* bases (alrededor del tronco). cx, gy en coordenadas del árbol */
function nvBase(id, cx, gy, sc) {
  const t = `transform="translate(${cx} ${gy}) scale(${nr(sc)})"`;
  switch (id) {
    case 'regalos': return `<g ${t}><rect x="-44" y="-17" width="22" height="17" rx="1.5" fill="#D93A44"/><path d="M-33-17V0M-44-8.5H-22" stroke="#F2C94C" stroke-width="3"/><path d="M-33-17q-6-8-9-4 0 4 9 4q9 0 9-4-3-4-9 4" fill="none" stroke="#F2C94C" stroke-width="1.6"/>
      <rect x="22" y="-24" width="20" height="24" rx="1.5" fill="#3B8F68"/><path d="M32-24V0M22-12H42" stroke="#EAF2FF" stroke-width="3"/><rect x="-16" y="-12" width="14" height="12" rx="1.2" fill="#4E8FE0"/><path d="M-9-12V0" stroke="#fff" stroke-width="2.4"/><rect x="2" y="-9" width="12" height="9" rx="1.2" fill="#E8B94A"/><path d="M8-9V0" stroke="#D93A44" stroke-width="2.4"/></g>`;
    case 'falda': return `<g ${t}><path d="M-52 0Q-48-14-20-15Q0-17 20-15Q48-14 52 0Z" fill="#fff" stroke="#D5DEEC" stroke-width="1"/><path d="M-40-6q10-5 20-1t20-1 20 1 20-1" fill="none" stroke="#E3EAF5" stroke-width="1.2"/></g>`;
    case 'canasta': return `<g ${t}><path d="M-26-20H26L22 0H-22Z" fill="#C79A5E" stroke="#8D6735" stroke-width="1"/><path d="M-24-14H24M-23-8H23M-22-2H22M-14-20L-12 0M0-20V0M14-20L12 0" stroke="#8D6735" stroke-width=".9" opacity=".7"/><ellipse cy="-20" rx="26" ry="3.6" fill="#A87A41"/></g>`;
    case 'macetero': return `<g ${t}><path d="M-22-22H22L17 0H-17Z" fill="#D93A44" stroke="#A02029" stroke-width="1"/><rect x="-25" y="-27" width="50" height="7" rx="2" fill="#E5555E" stroke="#A02029" stroke-width="1"/><path d="M-12-14H12" stroke="#F2C94C" stroke-width="2" stroke-dasharray="1 4" stroke-linecap="round"/></g>`;
    case 'barril': return `<g ${t}><path d="M-20-30Q-26-15-20 0H20Q26-15 20-30Z" fill="#B07A44" stroke="#6F4A23" stroke-width="1"/><path d="M-23-22H23M-24-8H24" stroke="#4B4B52" stroke-width="2"/><path d="M-8-30V0M8-30V0" stroke="#6F4A23" stroke-width=".8" opacity=".6"/><ellipse cy="-30" rx="20" ry="3.4" fill="#C99660"/></g>`;
    case 'trineo': return `<g ${t}><path d="M-52-4Q-58-6-56-14M-52-4H52Q60-4 58-12" fill="none" stroke="#7E4E24" stroke-width="3.4" stroke-linecap="round"/><path d="M-44-4V-12H44V-4" fill="#C0392B" stroke="#8B2218" stroke-width="1"/><rect x="-36" y="-24" width="18" height="12" rx="1.4" fill="#3B8F68"/><path d="M-27-24V-12" stroke="#F2C94C" stroke-width="2.4"/><rect x="-12" y="-20" width="14" height="8" rx="1.2" fill="#E8B94A"/><rect x="8" y="-26" width="20" height="14" rx="1.4" fill="#4E8FE0"/><path d="M18-26V-12M8-19H28" stroke="#fff" stroke-width="2.4"/></g>`;
    case 'lena': return `<g ${t}><g fill="#9B6B3A" stroke="#5E3F1E" stroke-width="1"><rect x="-40" y="-11" width="36" height="11" rx="5.5"/><rect x="2" y="-11" width="38" height="11" rx="5.5"/><rect x="-22" y="-21" width="36" height="11" rx="5.5"/></g><g fill="#D8B27C"><circle cx="-34" cy="-5.5" r="3"/><circle cx="34" cy="-5.5" r="3"/><circle cx="-16" cy="-15.5" r="3"/></g></g>`;
    default: return '';
  }
}
/* fondos (lienzo 240×300) */
function nvBG(id, uid, rnd) {
  const gid = `bg${uid}`; const lg = (a, b, c) => `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/>${c ? `<stop offset=".55" stop-color="${c}"/>` : ''}<stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="240" height="300" fill="url(#${gid})"/>`;
  const stars = (n, col = '#fff', ymax = 190) => { let o = ''; for (let i = 0; i < n; i++) o += `<circle class="nv-tw" style="--d:${nr(rnd() * 4)}s" cx="${nr(rnd() * 240)}" cy="${nr(rnd() * ymax)}" r="${nr(0.4 + rnd() * 1.1)}" fill="${col}"/>`; return o; };
  const pines = (y, col, n, hh, op = 1) => { let o = `<g fill="${col}" opacity="${op}">`; for (let i = 0; i < n; i++) { const x = (i + 0.3 + rnd() * 0.4) * (250 / n) - 6, h = hh * (0.7 + rnd() * 0.6), w = h * 0.36; o += `<path d="M${nr(x)} ${nr(y - h)}L${nr(x + w)} ${y}H${nr(x - w)}Z"/>`; } return o + '</g>'; };
  switch (id) {
    case 'noche': return lg('#0B1738', '#2A3C72') + stars(46) + `<circle cx="202" cy="44" r="13" fill="#F6EDC9"/><circle cx="208" cy="40" r="11.5" fill="#12224A"/>`;
    case 'crema': return lg('#FBF5EA', '#EADDC6') + `<g fill="#fff" opacity=".5"><circle cx="40" cy="60" r="26"/><circle cx="200" cy="90" r="34"/><circle cx="170" cy="30" r="14"/><circle cx="26" cy="160" r="12"/></g>`;
    case 'nevada': return lg('#B9CFE8', '#EAF1F9') + pines(250, '#8BA6C4', 7, 70, 0.55) + `<g fill="#fff" opacity=".85">${Array.from({ length: 24 }, () => `<circle cx="${nr(rnd() * 240)}" cy="${nr(rnd() * 250)}" r="${nr(0.8 + rnd() * 1.2)}"/>`).join('')}</g>`;
    case 'violeta': return lg('#241A5A', '#7B5BB0', '#4A3A8C') + stars(50, '#EFE6FF') + `<circle cx="40" cy="56" r="9" fill="#F4EBFF" opacity=".9"/>`;
    case 'rosa': return lg('#FFE9F1', '#F4BBD0') + `<g fill="#fff" opacity=".7">${Array.from({ length: 20 }, () => `<circle cx="${nr(rnd() * 240)}" cy="${nr(rnd() * 250)}" r="${nr(0.8 + rnd() * 1.6)}"/>`).join('')}</g><circle cx="120" cy="214" r="46" fill="#FFD7B0" opacity=".55"/>`;
    case 'atardecer': return lg('#FFB46E', '#5B4B8B', '#F27A8A') + `<circle cx="120" cy="196" r="34" fill="#FFE2A6" opacity=".92"/>` + pines(262, '#3E2F66', 9, 64, 0.85);
    case 'bosque': return lg('#12254C', '#3A5B8E') + stars(30, '#fff', 120) + pines(262, '#1C3A5E', 8, 96, 0.9) + pines(268, '#10263F', 10, 76, 0.95) + `<circle cx="190" cy="40" r="10" fill="#EFEAD2"/>`;
    case 'ventana': return `<rect width="240" height="300" fill="#4A3426"/><rect width="240" height="300" fill="#5B4130" opacity=".6"/><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1D45"/><stop offset="1" stop-color="#3C5C92"/></linearGradient><clipPath id="wc${uid}"><rect x="22" y="22" width="196" height="256" rx="4"/></clipPath></defs><g clip-path="url(#wc${uid})"><rect x="22" y="22" width="196" height="256" fill="url(#${gid})"/>${stars(30, '#fff', 120)}${pines(262, '#17315A', 8, 90, 0.9)}<rect x="22" y="250" width="196" height="40" fill="#E8F0FA"/></g><rect x="22" y="22" width="196" height="256" rx="4" fill="none" stroke="#D9C9AE" stroke-width="7"/><path d="M120 22V278M22 150H218" stroke="#D9C9AE" stroke-width="4"/>`;
    case 'salon': return `<rect width="240" height="300" fill="#6A4631"/><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4A2F20"/><stop offset=".5" stop-color="#7A5238"/><stop offset="1" stop-color="#4A2F20"/></linearGradient></defs><rect width="240" height="268" fill="url(#${gid})"/><g stroke="#4E3322" stroke-width=".8" opacity=".5">${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 32} 0V268"/>`).join('')}</g>
      <g><rect x="6" y="150" width="72" height="118" fill="#8C8F98" stroke="#5E616A" stroke-width="1.4"/><rect x="0" y="144" width="84" height="10" fill="#A9ACB5" stroke="#5E616A"/><path d="M18 268V196Q42 168 66 196V268Z" fill="#1C1210"/><path class="nv-fire" d="M32 268Q28 244 40 232Q38 248 46 240Q52 252 50 268Z" fill="#F7A23A"/><path class="nv-fire" style="--d:.3s" d="M40 268Q38 252 44 246Q48 256 54 268Z" fill="#FFD36A"/></g>
      <g fill="#D93A44"><path d="M16 146l6-14 6 14z" opacity=".001"/></g><g><rect x="150" y="56" width="64" height="86" rx="3" fill="#0E1D45" stroke="#E9DCC4" stroke-width="5"/><path d="M182 56V142M150 99H214" stroke="#E9DCC4" stroke-width="3"/><circle cx="198" cy="76" r="5" fill="#F6EDC9"/></g><path d="M0 268H240V300H0Z" fill="#4A3020"/><g stroke="#3B2417" stroke-width=".8" opacity=".6">${Array.from({ length: 6 }, (_, i) => `<path d="M${i * 44 - 10} 268L${i * 52 - 30} 300"/>`).join('')}</g>`;
    case 'aurora': return lg('#071029', '#16304F') + stars(40, '#fff', 150) + `<g style="mix-blend-mode:screen"><path class="nv-au" d="M-20 120Q40 40 100 100T260 70V130Q200 160 140 130T-20 170Z" fill="#4FE0A8" opacity=".38"/><path class="nv-au" style="--d:-3s" d="M-20 150Q50 80 110 130T260 110V160Q190 190 130 160T-20 200Z" fill="#6AA8FF" opacity=".3"/><path class="nv-au" style="--d:-6s" d="M-20 90Q60 20 120 70T260 40V90Q190 120 130 90T-20 130Z" fill="#B58BFF" opacity=".28"/></g>` + pines(268, '#06101F', 9, 70, 0.95);
    case 'lujo': return `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11463A"/><stop offset="1" stop-color="#082A21"/></linearGradient><pattern id="pt${uid}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M12 0L24 12 12 24 0 12Z" fill="none" stroke="#C9A24A" stroke-width=".6" opacity=".5"/><circle cx="12" cy="12" r="1" fill="#C9A24A" opacity=".5"/></pattern></defs><rect width="240" height="300" fill="url(#${gid})"/><rect width="240" height="300" fill="url(#pt${uid})"/><rect x="5" y="5" width="230" height="290" rx="3" fill="none" stroke="#C9A24A" stroke-width="1.2" opacity=".7"/>`;
    default: return lg('#0B1738', '#2A3C72');
  }
}
function nvGround(id, gy, uid) {
  switch (id) {
    case 'pradera': return `<path d="M0 ${gy - 4}Q60 ${gy - 14} 120 ${gy - 6}T240 ${gy - 8}V300H0Z" fill="#6FA36E"/><path d="M0 ${gy + 8}Q70 ${gy - 2} 130 ${gy + 6}T240 ${gy + 2}V300H0Z" fill="#E8F0F6" opacity=".8"/>`;
    case 'madera': return `<path d="M0 ${gy - 2}H240V300H0Z" fill="#9A6B40"/><g stroke="#6F4A28" stroke-width=".9" opacity=".7">${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 34 - 6} ${gy - 2}L${i * 46 - 40} 300"/>`).join('')}<path d="M0 ${gy + 14}H240M0 ${gy + 26}H240"/></g>`;
    case 'alfombra': return `<path d="M0 ${gy - 2}H240V300H0Z" fill="#7A5236"/><ellipse cx="120" cy="${gy + 8}" rx="108" ry="14" fill="#B5282F" stroke="#E8C170" stroke-width="2"/><ellipse cx="120" cy="${gy + 8}" rx="92" ry="10" fill="none" stroke="#E8C170" stroke-width=".8" stroke-dasharray="2 4"/>`;
    case 'lago': return `<defs><linearGradient id="lk${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CBE8F7"/><stop offset="1" stop-color="#8CC2E2"/></linearGradient></defs><path d="M0 ${gy - 2}H240V300H0Z" fill="url(#lk${uid})"/><path d="M20 ${gy + 8}l30-3M150 ${gy + 14}l50-4M80 ${gy + 22}l26-2" stroke="#fff" stroke-width="1.2" opacity=".7" stroke-linecap="round"/>`;
    default: return `<defs><linearGradient id="sn${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9D8EC"/></linearGradient></defs><path d="M0 ${gy - 6}Q50 ${gy - 18} 110 ${gy - 8}T240 ${gy - 10}V300H0Z" fill="url(#sn${uid})"/><path d="M0 ${gy + 10}Q80 ${gy} 150 ${gy + 8}T240 ${gy + 4}V300H0Z" fill="#fff" opacity=".7"/>`;
  }
}
function nvFX(list, rnd) {
  let o = '';
  if (list.includes('nieve')) for (let i = 0; i < 30; i++) o += `<circle class="nv-snow" cx="${nr(rnd() * 240)}" cy="-6" r="${nr(0.9 + rnd() * 1.6)}" fill="#fff" style="--d:${nr(rnd() * -12)}s;--t:${nr(7 + rnd() * 7)}s;--dx:${nr((rnd() - 0.5) * 40)}px"/>`;
  if (list.includes('destellos')) for (let i = 0; i < 14; i++) o += `<path class="nv-sp" d="${nvStar(5, 1.3, 4)}" transform="translate(${nr(20 + rnd() * 200)} ${nr(20 + rnd() * 240)}) scale(${nr(0.6 + rnd() * 0.9)})" fill="#FFF4C2" style="--d:${nr(rnd() * 4)}s"/>`;
  if (list.includes('luciernagas')) for (let i = 0; i < 14; i++) o += `<g class="nv-ff" style="--d:${nr(rnd() * -9)}s;--t:${nr(7 + rnd() * 6)}s;--dx:${nr((rnd() - 0.5) * 50)}px;--dy:${nr((rnd() - 0.5) * 50)}px"><circle cx="${nr(15 + rnd() * 210)}" cy="${nr(30 + rnd() * 230)}" r="4" fill="#FFE27A" opacity=".25"/><circle cx="${nr(0)}" cy="0" r="0" /></g>`.replace('<circle cx="0" cy="0" r="0" />', '');
  if (list.includes('fugaces')) for (let i = 0; i < 3; i++) o += `<g class="nv-sh" style="--d:${nr(i * 3.7 + rnd() * 2)}s"><path d="M${nr(90 + rnd() * 130)} ${nr(10 + rnd() * 60)}l-30 12" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></g>`;
  if (list.includes('farolitos')) for (let i = 0; i < 7; i++) { const x = nr(18 + rnd() * 204); o += `<g class="nv-lan" style="--d:${nr(rnd() * -12)}s;--t:${nr(12 + rnd() * 8)}s;--dx:${nr((rnd() - 0.5) * 30)}px"><g transform="translate(${x} 300)"><rect x="-3" y="-4" width="6" height="8" rx="1.6" fill="#FFB347"/><rect x="-3" y="-4" width="6" height="8" rx="1.6" fill="#FFE08A" opacity=".55"/></g></g>`; }
  return o;
}

/* ---------- el árbol ---------- */
function navSVG(cfg, lv, o = {}) {
  const uid = (o.uid || ++NV.u) + '';
  const mini = !!o.mini, bare = !!o.bare;
  const W = 240, H = 300, cx = 120, gy = 268;
  const tr = NV_BY['tree:' + cfg.tree]?.raw || NV_TREES[0]; const [c0, c1, c2] = tr[3]; const snow = tr[4];
  const t = lv / NAV_MAX, e = Math.pow(t, 0.8);
  const th = 16 + 16 * t, Ht = 40 + 174 * e, hwMax = 16 + 70 * e;
  const top = gy - th * 0.55 - Ht; const n = 2 + Math.floor(lv / 7);
  const segH = Ht / (1 + (n - 1) * 0.58);
  const rnd = nvR(7 + n * 13);
  let o2 = '';
  const dkS = nvDark;
  const dens = cfg.dens === 1 ? 460 : cfg.dens === 3 ? 215 : 320;
  const lite = mini; // en la esquina de Vida: más ligero
  if (!mini && !bare) {
    o2 += nvBG(cfg.bg, uid, nvR(99)) + nvGround(cfg.ground, gy, uid);
    o2 += `<ellipse cx="${cx}" cy="${gy + 3}" rx="${nr(24 + hwMax * 0.95)}" ry="${nr(5 + e * 3)}" fill="#000" opacity=".16"/>`;
  } else if (mini) o2 += `<ellipse cx="${cx}" cy="${gy + 2}" rx="${nr(22 + hwMax * 0.95)}" ry="6" fill="#EFF5FB" opacity=".95"/><ellipse cx="${cx}" cy="${gy + 3}" rx="${nr(26 + hwMax * 0.95)}" ry="7" fill="#000" opacity=".12"/>`;
  o2 += `<defs><linearGradient id="tg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset=".55" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><linearGradient id="tk${uid}" x1="0" x2="1"><stop offset="0" stop-color="#6E4528"/><stop offset=".5" stop-color="#9A6A40"/><stop offset="1" stop-color="#5E3A20"/></linearGradient></defs>`;
  // tronco
  const tw = 3 + 4 * t; o2 += `<rect x="${nr(cx - tw)}" y="${nr(gy - th)}" width="${nr(tw * 2)}" height="${nr(th + 2)}" rx="1.5" fill="url(#tk${uid})"/>`;
  if (cfg.base && !bare) o2 += `<g class="nv-base">${nvBase(cfg.base, cx, gy + 2, 0.55 + 0.5 * e)}</g>`;
  // capas
  const tiers = [];
  for (let i = 0; i < n; i++) {
    const y0 = top + (n > 1 ? (i * (Ht - segH)) / (n - 1) : 0), y1 = y0 + segH; const hw = hwMax * (0.34 + 0.66 * ((i + 1) / n));
    tiers.push({ y0, y1, hw });
    const k = Math.max(3, Math.round(hw / 14)); const xr = cx + hw * 0.96, xl = cx - hw * 0.96, step = (xr - xl) / k;
    let d = `M${cx} ${nr(y0)}Q${nr(cx + hw * 0.55)} ${nr(y0 + (y1 - y0) * 0.35)} ${nr(xr)} ${nr(y1 - 5)}`;
    for (let j = 0; j < k; j++) { const xa = xr - j * step, xb = xa - step; d += `Q${nr((xa + xb) / 2)} ${nr(y1 + 9)} ${nr(xb)} ${nr(y1 - 5)}`; }
    d += `Q${nr(cx - hw * 0.55)} ${nr(y0 + (y1 - y0) * 0.35)} ${cx} ${nr(y0)}Z`;
    o2 += `<path d="${d}" fill="url(#tg${uid})" stroke="${dkS(c2)}" stroke-width=".8" stroke-linejoin="round"/>`;
    // ramas sutiles
    let br = ''; for (let j = 1; j < k; j += 2) br += `M${cx} ${nr(y0 + (y1 - y0) * 0.22)}L${nr(xr - j * step)} ${nr(y1 - 5)}`;
    o2 += `<path d="${br}" fill="none" stroke="${dkS(c2)}" stroke-width=".6" opacity=".3"/>`;
    if (snow) {
      let sn = ''; for (let j = 1; j < k; j++) { const xx = xr - j * step; sn += `<ellipse cx="${nr(xx)}" cy="${nr(y1 - 3)}" rx="${nr(step * 0.4)}" ry="${snow === 2 ? 3.6 : 2.6}" fill="#fff" opacity=".95"/>`; }
      const cv = snow === 2 ? 0.62 : 0.34; const vx = hw * cv * 0.96;
      sn += `<path d="M${cx} ${nr(y0)}Q${nr(cx + vx * 0.7)} ${nr(y0 + (y1 - y0) * cv * 0.5)} ${nr(cx + vx)} ${nr(y0 + (y1 - y0) * cv)}Q${nr(cx + vx * 0.5)} ${nr(y0 + (y1 - y0) * cv + 5)} ${cx} ${nr(y0 + (y1 - y0) * cv * 0.7)}Q${nr(cx - vx * 0.5)} ${nr(y0 + (y1 - y0) * cv + 5)} ${nr(cx - vx)} ${nr(y0 + (y1 - y0) * cv)}Q${nr(cx - vx * 0.7)} ${nr(y0 + (y1 - y0) * cv * 0.5)} ${cx} ${nr(y0)}Z" fill="#fff" opacity="${snow === 2 ? 0.8 : 0.92}"/>`;
      if (snow === 2) for (let j = 0; j < 9; j++) sn += `<circle cx="${nr(cx + (rnd() * 2 - 1) * hw * 0.7)}" cy="${nr(y0 + (y1 - y0) * (0.3 + rnd() * 0.6))}" r="${nr(1.4 + rnd() * 2.2)}" fill="#fff" opacity=".7"/>`;
      o2 += sn;
    }
  }
  if (bare) return `<svg viewBox="${o.vb || '20 0 200 290'}" class="nv-svg" role="img" aria-hidden="true">${o2}</svg>`;
  // luces
  if (cfg.light) {
    const L = NV_BY['light:' + cfg.light].raw[3]; let wire = '', bulbs = ''; let b = 0;
    tiers.forEach((ti, i) => {
      if (lv < 3 && i === 0) return;
      const rows = ti.hw > 44 ? [0.58, 0.86] : [0.74];
      rows.forEach((v, ri) => {
        const m = Math.max(4, Math.round(ti.hw / 7)); let d = '';
        for (let j = 0; j <= m; j++) {
          const u = -0.88 + (1.76 * j) / m; const x = cx + u * ti.hw * v * 0.98, y = ti.y0 + (ti.y1 - ti.y0) * v + 5 * (1 - u * u) + (ri ? 3 : 0);
          d += `${j ? 'L' : 'M'}${nr(x)} ${nr(y)}`; const col = L[(b + j) % L.length]; b++;
          const an = cfg.lmode === 'steady' || lite ? '' : ` class="nv-b ${cfg.lmode}" style="--d:${cfg.lmode === 'wave' ? nr(b * 0.12) : nr(rnd() * 2)}s"`;
          bulbs += `<g${an}><circle cx="${nr(x)}" cy="${nr(y + 1.6)}" r="3.6" fill="${col}" opacity=".28"/><circle cx="${nr(x)}" cy="${nr(y + 1.6)}" r="1.7" fill="${col}"/><circle cx="${nr(x - 0.4)}" cy="${nr(y + 1)}" r=".5" fill="#fff" opacity=".8"/></g>`;
        }
        wire += `<path d="${d}" fill="none" stroke="#1D3B2A" stroke-width=".7" opacity=".55"/>`;
      });
    });
    o2 += wire + bulbs;
  }
  // guirnalda
  if (cfg.garl) {
    const [, , , type, cols] = NV_BY['garl:' + cfg.garl].raw; let gs = '';
    tiers.forEach((ti, i) => {
      if (lv < 2 && i === 0) return; const v = 0.42, y = ti.y0 + (ti.y1 - ti.y0) * v; const xl = cx - ti.hw * v * 0.9, xr = cx + ti.hw * v * 0.9;
      const d = `M${nr(xl)} ${nr(y)}Q${cx} ${nr(y + 14 + ti.hw * 0.12)} ${nr(xr)} ${nr(y)}`;
      if (type === 'tin') gs += `<path d="${d}" fill="none" stroke="${cols[0]}" stroke-width="3.2" stroke-dasharray="1.6 1.2" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width=".7" opacity=".5" stroke-dasharray="1 4"/>`;
      else if (type === 'pearl') gs += `<path d="${d}" fill="none" stroke="${cols[0]}" stroke-width="3.6" stroke-dasharray=".1 5" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="1.2" stroke-dasharray=".1 5" stroke-linecap="round" opacity=".7" transform="translate(-.5 -.7)"/>`;
      else if (type === 'beads') cols.forEach((cc, q) => { gs += `<path d="${d}" fill="none" stroke="${cc}" stroke-width="3.6" stroke-dasharray=".1 ${cols.length * 4.6}" stroke-dashoffset="${-q * 4.6}" stroke-linecap="round"/>`; });
      else gs += `<path d="${d}" fill="none" stroke="${cols[0]}" stroke-width="3.6" stroke-linecap="round" opacity=".95"/><path d="${d}" fill="none" stroke="#fff" stroke-width=".7" opacity=".45" transform="translate(0 -1)"/>`;
    });
    o2 += gs;
  }
  // esferas y adornos, repartidos sin chocar
  const pos = []; const prnd = nvR(31 + n);
  tiers.forEach((ti, i) => {
    const area = ti.hw * (ti.y1 - ti.y0) * 0.5; const want = Math.max(i === 0 ? 1 : 2, Math.round(area / dens));
    let tries = 0, got = 0; while (got < want && tries < want * 14) { tries++; const v = 0.3 + 0.6 * prnd(), u = (prnd() * 2 - 1) * 0.82; const x = cx + u * ti.hw * v * 0.94, y = ti.y0 + (ti.y1 - ti.y0) * v - 1;
      if (pos.some((p) => Math.hypot(p.x - x, p.y - y) < (lite ? 11 : 10.5))) continue; pos.push({ x, y, s: 0.8 + 0.35 * prnd() * (0.5 + e) }); got++; }
  });
  const balls = cfg.balls.map((i) => NV_BY['ball:' + i]?.raw).filter(Boolean), minis = cfg.minis.filter((i) => NV_BY['mini:' + i]);
  let orn = '';
  pos.forEach((p, i) => {
    const useMini = minis.length && (!balls.length || i % 3 === 1);
    if (useMini) { orn += `<g transform="translate(${nr(p.x)} ${nr(p.y + 3)})">${nvMini(minis[(i * 7) % minis.length], nr(0.7 + 0.35 * p.s))}</g>`; }
    else if (balls.length) { const bl = balls[(i * 5 + (i >> 2)) % balls.length]; const r = nr(3.2 * p.s + 0.6); const col = bl[3];
      orn += `<g transform="translate(${nr(p.x)} ${nr(p.y)})"><rect x="-.9" y="${nr(-r - 1.9)}" width="1.8" height="2.2" rx=".5" fill="#C9A24A"/><circle r="${r}" fill="${col}" stroke="${dkS(col)}" stroke-width=".5"/><ellipse cx="${nr(-r * 0.3)}" cy="${nr(-r * 0.35)}" rx="${nr(r * 0.32)}" ry="${nr(r * 0.22)}" fill="#fff" opacity=".7"/></g>`; }
  });
  o2 += orn;
  // cima
  if (cfg.top) { o2 += `<g transform="translate(${cx} ${nr(top + 5)}) scale(${nr(0.55 + 0.5 * e)})">${nvTopper(cfg.top, 1)}</g>`; }
  else if (lv === 0) o2 += '';
  if (!mini && cfg.fx.length) o2 += `<g class="nv-fxg">${nvFX(cfg.fx, nvR(5))}</g>`;
  const vb = mini ? '30 4 180 280' : `0 0 ${W} ${H}`;
  return `<svg viewBox="${vb}" class="nv-svg" role="img" aria-label="Árbol de Navidad, nivel ${lv} de ${NAV_MAX}" preserveAspectRatio="xMidYMid meet">${o2}</svg>`;
}
/* en la esquina de Vida */
function navMiniHTML() {
  try {
    const n = navData(); if (n.lv < 1 || isGroup()) return '';
    return `<div class="nv-mini" aria-hidden="true">${navSVG(navCfg(), n.lv, { mini: true, uid: 'mini' })}</div>`;
  } catch { return ''; }
}

/* ---------- miniaturas de la tienda ---------- */
function navSwatch(k, id) {
  const it = NV_BY[`${k}:${id}`]; if (!it) return '';
  const box = (inner, bg = 'transparent') => `<svg viewBox="-14 -14 28 28" class="nv-sw" aria-hidden="true"><rect x="-14" y="-14" width="28" height="28" fill="${bg}"/>${inner}</svg>`;
  switch (k) {
    case 'tree': return navSVG({ ...navCfg(), tree: id, balls: [], minis: [], light: null, garl: null, top: null, base: null, fx: [] }, 26, { bare: true, vb: '30 28 180 250' });
    case 'ball': return box(`<circle r="9" fill="${it.raw[3]}" stroke="rgba(0,0,0,.3)" stroke-width=".7"/><ellipse cx="-3" cy="-3.4" rx="3" ry="2" fill="#fff" opacity=".7"/><rect x="-1.4" y="-12.4" width="2.8" height="3.4" rx=".8" fill="#C9A24A"/>`);
    case 'mini': return box(nvMini(id, 1.7));
    case 'light': { const L = it.raw[3]; let s = '<path d="M-12-4Q0 8 12-4" fill="none" stroke="#1D3B2A" stroke-width=".8"/>'; for (let j = 0; j < 5; j++) { const u = -1 + (2 * j) / 4; s += `<circle cx="${nr(u * 10)}" cy="${nr(-2 + 7 * (1 - u * u) * 0.9)}" r="2.2" fill="${L[j % L.length]}"/>`; } return box(s); }
    case 'garl': { const [, , , type, cols] = it.raw; const d = 'M-12-2Q0 10 12-2'; let s; if (type === 'tin') s = `<path d="${d}" fill="none" stroke="${cols[0]}" stroke-width="3.4" stroke-dasharray="1.6 1.2"/>`; else if (type === 'pearl') s = `<path d="${d}" fill="none" stroke="${cols[0]}" stroke-width="3.8" stroke-dasharray=".1 5" stroke-linecap="round"/>`; else if (type === 'beads') s = cols.map((cc, q) => `<path d="${d}" fill="none" stroke="${cc}" stroke-width="3.6" stroke-dasharray=".1 ${cols.length * 4.6}" stroke-dashoffset="${-q * 4.6}" stroke-linecap="round"/>`).join(''); else s = `<path d="${d}" fill="none" stroke="${cols[0]}" stroke-width="3.6" stroke-linecap="round"/>`; return box(s); }
    case 'top': return box(`<g transform="translate(0 9) scale(.7)">${nvTopper(id, 1)}</g>`);
    case 'base': return `<svg viewBox="-60 -40 120 46" class="nv-sw wide" aria-hidden="true">${nvBase(id, 0, 0, 1)}</svg>`;
    case 'ground': return `<svg viewBox="0 0 240 100" class="nv-sw wide" aria-hidden="true"><rect width="240" height="100" fill="#243A66"/><g transform="translate(0 -190)">${nvGround(id, 268, 'sw' + id)}</g></svg>`;
    case 'bg': return `<svg viewBox="0 0 240 300" class="nv-sw tall" aria-hidden="true" preserveAspectRatio="xMidYMid slice">${nvBG(id, 'sw' + id, nvR(99))}</svg>`;
    case 'fx': return box(({ nieve: '<g stroke="#9FC4EA" stroke-width="1.4" stroke-linecap="round" fill="none"><path d="M0-9V9M-8-4.6L8 4.6M-8 4.6L8-4.6"/></g>', destellos: `<path d="${nvStar(10, 2.6, 4)}" fill="#F2C94C"/><path d="${nvStar(5, 1.4, 4)}" transform="translate(8 -7)" fill="#F2C94C"/>`, luciernagas: '<circle cx="-4" cy="-3" r="2.6" fill="#E9C74A"/><circle cx="5" cy="3" r="2" fill="#E9C74A"/><circle cx="-4" cy="-3" r="6" fill="#E9C74A" opacity=".3"/>', fugaces: '<path d="M7-7L-8 4" stroke="#E9C74A" stroke-width="2" stroke-linecap="round"/><circle cx="7" cy="-7" r="2" fill="#E9C74A"/>', farolitos: '<rect x="-4" y="-6" width="8" height="11" rx="2.4" fill="#FFB347"/><rect x="-4" y="-6" width="8" height="11" rx="2.4" fill="#FFE08A" opacity=".55"/>' })[id] || '');
    default: return '';
  }
}

/* ---------- vista ---------- */
const nvLvName = (l) => (l <= 0 ? 'Arbolito' : l < 8 ? 'Retoño' : l < 16 ? 'Arbolito' : l < 26 ? 'Pino joven' : l < 36 ? 'Pino alto' : l < 40 ? 'Casi un gigante' : 'Árbol majestuoso');
function nvStage(cfg, n) {
  return `<div class="nv-stage" style="--nv-bg:${(NV_BY['bg:' + cfg.bg] && ({ noche: '#12224A', crema: '#EFE3CC', nevada: '#D8E4F2', violeta: '#4A3A8C', rosa: '#F4C9D8', atardecer: '#B8607A', bosque: '#24406B', ventana: '#3C5C92', salon: '#5B3C2A', aurora: '#10233F', lujo: '#0D3A2F' })[cfg.bg]) || '#12224A'}">${navSVG(cfg, n.lv)}
    <div class="nv-hud"><span class="nv-chip nv-lvl"><b>${n.lv}</b><small>de ${NAV_MAX}</small></span><span class="nv-chip nv-bal" title="Tus monedas">${coinSVG('sm')}<b>${coins()}</b></span></div></div>`;
}
function nvLevelBlock(n) {
  const full = n.lv >= NAV_MAX, cost = full ? 0 : navCost(n.lv + 1), have = coins(); const pct = Math.round((n.lv / NAV_MAX) * 100);
  return `<div class="nv-up"><div class="nv-prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
    <p class="nv-name serif">${nvLvName(n.lv)}</p>
    ${full ? `<p class="small muted" style="margin:0;text-align:center">¡Tu árbol llegó al nivel máximo! Ahora decóralo a tu gusto.</p>`
      : `<button class="btn primary nv-up-btn" data-act="nv-up" ${have < cost ? 'aria-disabled="true"' : ''}>${coinSVG('sm')} Subir al nivel ${n.lv + 1} · ${cost} monedas</button>${have < cost ? `<p class="tiny faint" style="margin:6px 0 0;text-align:center">Te faltan ${cost - have} monedas. Juega Cosecha o Galope, o sube tu árbol de Vida.</p>` : ''}`}</div>`;
}
function nvItemCard(k, it, owned) {
  const key = NV_KEY[k]; const n = navData(); const cfg = navCfg();
  const on = NV_MULTI[k] ? cfg[key].includes(it[0]) && navHas(k, it[0]) : cfg[key] === it[0] && navHas(k, it[0]);
  const price = NV_BY[`${k}:${it[0]}`].p; const have = coins(); const trying = NV.pv && NV.pv.k === k && NV.pv.id === it[0];
  const act = owned ? `<button class="btn ${on ? '' : 'primary'} sm" data-act="nv-eq" data-k="${k}" data-id="${it[0]}">${on ? (NV_MULTI[k] || NV_OPTIONAL[k] ? 'Quitar' : 'En uso') : 'Poner'}</button>`
    : `<button class="btn primary sm" data-act="nv-buy" data-k="${k}" data-id="${it[0]}" ${have < price ? 'aria-disabled="true"' : ''}>${coinSVG('sm')} ${price}</button>`;
  return `<div class="nv-item ${on ? 'on' : ''} ${trying ? 'try' : ''}"><button type="button" class="nv-swb ${k === 'bg' ? 'tall' : k === 'base' || k === 'ground' ? 'wide' : ''}" data-act="nv-try" data-k="${k}" data-id="${it[0]}" aria-label="Probar ${esc(it[1])}">${navSwatch(k, it[0])}</button>
    <b class="nv-iname">${esc(it[1])}</b><span class="tiny faint">${owned ? (on ? 'Puesto' : 'Tuyo') : 'Sin comprar'}</span>
    <div class="nv-iact">${act}</div></div>`;
}
function viewNavidad() {
  const n = navData(); const cfg = navCfg(NV.pv); const tabs = [['arbol', 'Mi árbol'], ['tienda', 'Tienda'], ['decorar', 'Decorar']];
  const head = `<h1 class="page-title">Árbol de Navidad</h1><p class="page-sub">Hazlo crecer nivel a nivel y decóralo con todo lo que quieras.</p>`;
  const seg = `<div class="seg full" role="group" style="margin:14px 0">${tabs.map(([k, l]) => `<button type="button" data-act="nv-tab" data-v="${k}" aria-pressed="${NV.tab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (NV.pv) body += `<p class="nv-try-note small"><span>Probando: <b>${esc(NV_BY[`${NV.pv.k}:${NV.pv.id}`]?.n || '')}</b></span><button class="btn sm" data-act="nv-try-off">Quitar prueba</button></p>`;
  if (NV.tab === 'arbol') {
    body += nvLevelBlock(n) + `<div class="card nv-how"><h3 class="serif" style="margin:0 0 6px">Cómo ganar monedas</h3><ul class="small muted nv-ul"><li>Sube de nivel tu árbol de Vida y completa las misiones del día.</li><li>En <a href="#/juego">Cosecha</a> a veces cae una moneda brillante: atrápala con la canasta.</li><li>En <a href="#/galope">Galope</a> hay monedas en el aire y un premio cada 500 puntos.</li></ul></div>
      <div class="btn-row" style="margin-top:12px"><button class="btn" data-act="nv-tab" data-v="tienda">Ir a la tienda</button><button class="btn" data-act="nv-tab" data-v="decorar">Decorar</button></div>`;
  } else if (NV.tab === 'tienda') {
    const cat = NV_CATS.find((c) => c[0] === NV.cat) || NV_CATS[0];
    body += `<div class="nv-cats" role="group">${NV_CATS.map(([k, l]) => `<button type="button" data-act="nv-cat" data-v="${k}" aria-pressed="${NV.cat === k}">${l}</button>`).join('')}</div>`;
    body += `<div class="nv-grid ${cat[0] === 'bg' ? 'g-tall' : ''}">${cat[2].map((it) => nvItemCard(cat[0], it, navHas(cat[0], it[0]))).join('')}</div>`;
  } else {
    body += `<div class="card nv-opts"><div class="nv-row"><span>Cantidad de adornos</span><div class="seg" role="group">${[[1, 'Ligero'], [2, 'Normal'], [3, 'Lleno']].map(([v, l]) => `<button type="button" data-act="nv-opt" data-o="dens" data-v="${v}" aria-pressed="${n.dens === v}">${l}</button>`).join('')}</div></div>
      <div class="nv-row"><span>Luces</span><div class="seg" role="group">${[['steady', 'Fijas'], ['blink', 'Parpadeo'], ['wave', 'Ola']].map(([v, l]) => `<button type="button" data-act="nv-opt" data-o="lmode" data-v="${v}" aria-pressed="${n.lmode === v}">${l}</button>`).join('')}</div></div></div>`;
    body += NV_CATS.map(([k, l, list]) => { const mine = list.filter((it) => navHas(k, it[0])); return `<h2 class="sec">${l}</h2><div class="nv-grid ${k === 'bg' ? 'g-tall' : ''}">${mine.map((it) => nvItemCard(k, it, true)).join('') || ''}</div>${mine.length < list.length ? `<p class="tiny faint" style="margin:4px 0 0">Hay ${list.length - mine.length} más en la <a href="#/navidad" data-act="nv-go-shop" data-v="${k}">tienda</a>.</p>` : ''}`; }).join('');
  }
  return `${head}<section class="nv-card">${nvStage(cfg, n)}</section>${seg}${body}`;
}

/* ---------- acciones ---------- */
function nvFx() { try { Snd.chime(); } catch { /* */ } }
Object.assign(VIDA_ACTS, {
  'nv-tab': (el) => { NV.tab = el.dataset.v; NV.pv = null; render(); },
  'nv-cat': (el) => { NV.cat = el.dataset.v; render(); },
  'nv-go-shop': (el) => { NV.tab = 'tienda'; NV.cat = el.dataset.v; render(); },
  'nv-try': (el) => { const k = el.dataset.k, id = el.dataset.id; NV.pv = NV.pv && NV.pv.k === k && NV.pv.id === id ? null : { k, id }; render(); },
  'nv-try-off': () => { NV.pv = null; render(); },
  'nv-up': () => {
    const n = navData(); if (n.lv >= NAV_MAX) return; const cost = navCost(n.lv + 1);
    if (coins() < cost) { toast(`Te faltan ${cost - coins()} monedas.`); return; }
    commit(() => { navData().lv++; }); nvFx(); try { confetti(innerWidth / 2, innerHeight / 3, n.lv + 1 === NAV_MAX ? 90 : 34); } catch { /* */ }
    toast(n.lv + 1 === NAV_MAX ? '¡Nivel 40! Tu árbol llegó a su máximo esplendor.' : `Tu árbol subió al nivel ${n.lv + 1}.`);
  },
  'nv-buy': (el) => {
    const k = el.dataset.k, id = el.dataset.id; const it = NV_BY[`${k}:${id}`]; if (!it) return;
    if (navHas(k, id)) { VIDA_ACTS['nv-eq'](el); return; }
    if (coins() < it.p) { toast(`Te faltan ${it.p - coins()} monedas.`); return; }
    commit(() => { shopData().shop.own.push(nvOwnKey(k, id)); nvSet(k, id, true); NV.pv = null; }); nvFx(); toast(`${it.n}: comprado y puesto en tu árbol.`);
  },
  'nv-eq': (el) => { const k = el.dataset.k, id = el.dataset.id; if (!navHas(k, id)) return; commit(() => nvSet(k, id)); },
  'nv-opt': (el) => { const o = el.dataset.o, v = el.dataset.v; commit(() => { const n = navData(); if (o === 'dens') n.dens = +v; else if (o === 'lmode') n.lmode = v; }); },
});
function nvSet(k, id, forceOn) {
  const n = navData(), key = NV_KEY[k];
  if (NV_MULTI[k]) { const i = n[key].indexOf(id); if (i >= 0 && !forceOn) n[key].splice(i, 1); else if (i < 0) n[key].push(id); }
  else if (NV_OPTIONAL[k] && n[key] === id && !forceOn) n[key] = null; else n[key] = id;
}

EXTRA_VIEWS.navidad = viewNavidad; EXTRA_NAV.navidad = 'mas'; GROUP_VIEWS.navidad = viewNavidad; GROUP_NAV.navidad = 'mas';
