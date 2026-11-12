/* Cinnavia 7.57 — MUNDOS · plantas y frutas realistas: racimos pegados a su planta, árboles propios de cada selva, frutas que se cortan, se bajan y se comen. */
'use strict';
['ceiba', 'cecropia'].forEach((k) => MD_TREES.add(k));
mdH.platanero = [90, 130]; mdH.ceiba = [260, 340]; mdH.cecropia = [150, 220];
const MD_FR_KIND = { platanero: 'banana', jungle: 'higo', oak: 'bellota', bush: 'mora', sakura: 'cereza' };
const MD_FR_COL = { banana: '#f3d23a', coco: '#7b6a3a', datil: '#b4561e', higo: '#7a3a6a', bellota: '#b8884a', mora: '#3a1f4a', cereza: '#d8283e' };
/* quién come cada fruta caída (solo animales que de verdad la comen) */
const MD_FR_EATERS = {
  banana: ['mono', 'elefante', 'pecari', 'aguti', 'coati', 'kinkaju', 'tapir', 'cerdo', 'jabali', 'capibara'],
  coco: ['mono', 'cangrejo', 'aguti'],
  datil: ['camello', 'fenec', 'gacela', 'lagarto', 'cabra'],
  higo: ['mono', 'tapir', 'pecari', 'aguti', 'coati', 'kinkaju', 'iguana', 'elefante', 'cerdo', 'jabali', 'oso', 'okapi'],
  bellota: ['venado', 'ciervorojo', 'cerdo', 'jabali', 'ardilla', 'oso', 'pecari', 'raton', 'pavo', 'marmota'],
  mora: ['oso', 'zorro', 'coyote', 'conejo', 'ardilla', 'raton', 'mapache', 'zorrillo', 'venado', 'ciervorojo', 'pavo', 'erizo'],
  cereza: ['ardilla', 'zorro', 'oso', 'mapache', 'conejo', 'raton', 'mono', 'panda']
};
const MD_BERRY = new Set(['bosque', 'otono', 'pradera', 'granja', 'rio', 'alpes', 'lagoalpino', 'tundra', 'taiga', 'magico', 'sakura', 'prairie']);
function mdFrKind(f) { if (MDS.def && MDS.def.nofruit) return null; if (f.kind === 'bush') return MDS.def && MD_BERRY.has(MDS.def.id) ? 'mora' : null; if (f.kind === 'palm') return MDS.def && MDS.def.clim && MDS.def.clim.sd ? 'datil' : 'coco'; return MD_FR_KIND[f.kind] || null; }
const mdBez = (x0, y0, cx, cy, x1, y1, u) => { const v = 1 - u; return { x: v * v * x0 + 2 * v * u * cx + u * u * x1, y: v * v * y0 + 2 * v * u * cy + u * u * y1 }; };
/* posiciones fijas de cada fruta sobre su planta (coordenadas locales de la planta) */
function mdFrSlots(f) {
  if (f.fs) return f.fs;
  const s = [], k = f.kind, h = f.h, R = mdRng(f.seed + 501), kd = mdFrKind(f); f.fs = s; if (!kd) return s;
  if (k === 'platanero') { const d = f.dir || 1, ax = h * 0.2 * d; for (let m = 0; m < 3; m++) for (let j = 0; j < 3; j++) s.push({ x: ax + (j - 1) * 4.4, y: -h * 0.46 + m * 7.5 + 1, m }); }
  else if (k === 'palm') { const d = f.dir || 1, tx = h * 0.08 * d, ty = -h * 0.92; if (kd === 'coco') for (let j = 0; j < 3; j++) s.push({ x: tx + (j - 1) * 5.6, y: ty + 9 + (j === 1 ? 5 : 0), ax: tx, ay: ty + 3, sway: 1 }); else for (let j = 0; j < 6; j++) s.push({ x: tx + ((j % 3) - 1) * 6, y: ty + 10 + Math.floor(j / 3) * 6.5, ax: tx + ((j % 3) - 1) * 1.5, ay: ty + 4, sway: 1 }); }
  else if (k === 'bush') { for (let j = 0; j < 8; j++) s.push({ x: (R() - 0.5) * h * 0.75, y: -h * (0.2 + R() * 0.34) }); }
  else { /* árboles con ramas: racimos que cuelgan de las ramas */
    const br = mdTreeBr(f).filter((b) => b.draw), per = kd === 'higo' ? 3 : 2, pick = br.length > 3 ? [1, 2, 3] : br.map((b, i) => i);
    for (const bi of pick) { const b = br[bi]; if (!b) continue; const y0 = -h * b.t, u = 0.5 + R() * 0.35, p = mdBez(b.side * 2, y0 + 2, b.side * b.len * 0.5, y0 - b.rise * 0.2 + 3, b.side * b.len, y0 - b.rise, u); for (let j = 0; j < per; j++) s.push({ x: p.x + (j - (per - 1) / 2) * 4.6, y: p.y + 8 + (j % 2) * 3, ax: p.x, ay: p.y + 1 }); }
  }
  return s;
}
const mdFrMax = (f) => mdFrSlots(f).length;
function mdFrPos(f, i) { const s = mdFrSlots(f), p = s[Math.max(0, Math.min(s.length - 1, i))] || { x: 0, y: -f.h * 0.5 }; return { x: f.x + p.x, y: f.y + p.y }; }
{ const base = mdBuild; mdBuild = function (def) { base(def); MDS.fruits = []; MDS.hearts = []; MDS.frT = 0; for (const f of MDS.fl) { if (f.kind === 'platanero') f.fruit = Math.random() < 0.85; f.nf = f.fruit && mdFrKind(f) ? mdFrMax(f) : 0; } }; }

/* ---- dibujo de una fruta suelta (en el suelo / cayendo / en la mano) ---- */
function mdFrDrawOne(c, kind, x, y, s) {
  const col = MD_FR_COL[kind] || '#e0412f'; c.save(); c.translate(x, y);
  if (kind === 'banana') { c.strokeStyle = col; c.lineWidth = 3.2 * s; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 5 * s, 0.4, 2.6); c.stroke(); c.strokeStyle = '#6a5a1a'; c.lineWidth = 1.4 * s; c.beginPath(); c.moveTo(4.4 * s, 2.6 * s); c.lineTo(5.6 * s, 1.2 * s); c.stroke(); }
  else if (kind === 'coco') { c.fillStyle = '#6f8a3a'; mdE(c, 0, 0, 4.6 * s, 5.2 * s); c.fillStyle = col; mdE(c, 0, 0.8 * s, 3.8 * s, 4 * s); c.fillStyle = 'rgba(255,255,255,.3)'; mdE(c, -1.4 * s, -1.6 * s, 1 * s, 1.4 * s); }
  else if (kind === 'datil') { c.fillStyle = col; mdE(c, 0, 0, 2.2 * s, 3.4 * s); c.fillStyle = 'rgba(255,255,255,.4)'; mdE(c, -0.7 * s, -1 * s, 0.6 * s, 1.1 * s); }
  else if (kind === 'higo') { c.fillStyle = col; c.beginPath(); c.moveTo(0, -4.4 * s); c.quadraticCurveTo(4.6 * s, -0.4 * s, 2.6 * s, 3.2 * s); c.quadraticCurveTo(0, 4.6 * s, -2.6 * s, 3.2 * s); c.quadraticCurveTo(-4.6 * s, -0.4 * s, 0, -4.4 * s); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; mdE(c, -1.2 * s, -0.6 * s, 0.7 * s, 1.2 * s); }
  else if (kind === 'bellota') { c.fillStyle = col; mdE(c, 0, 0.8 * s, 2.3 * s, 3 * s); c.fillStyle = '#6a4a2a'; c.beginPath(); c.ellipse(0, -1.6 * s, 2.7 * s, 1.7 * s, 0, Math.PI, 0); c.fill(); }
  else if (kind === 'mora') { c.fillStyle = col; for (const [dx, dy] of [[-1.6, 0.8], [1.6, 0.8], [0, -1.4]]) mdE(c, dx * s, dy * s, 2.1 * s, 2.1 * s); c.fillStyle = 'rgba(255,255,255,.35)'; mdE(c, -0.6 * s, -1.8 * s, 0.6 * s, 0.6 * s); }
  else { c.strokeStyle = '#4f7a2a'; c.lineWidth = 0.9 * s; c.beginPath(); c.moveTo(-1.8 * s, 1 * s); c.lineTo(0, -4.4 * s); c.lineTo(2 * s, 1 * s); c.stroke(); c.fillStyle = col; mdE(c, -1.9 * s, 2 * s, 2.3 * s, 2.3 * s); mdE(c, 2.1 * s, 2 * s, 2.3 * s, 2.3 * s); c.fillStyle = 'rgba(255,255,255,.5)'; mdE(c, -2.6 * s, 1.2 * s, 0.6 * s, 0.6 * s); }
  c.restore();
}
/* ---- frutas colgando de su planta (se dibujan dentro del árbol, así se mueven con él) ---- */
function mdFrDrawHang(c, f, time, wind) {
  const kd = mdFrKind(f), sl = mdFrSlots(f), n = Math.min(f.nf, sl.length); if (!kd || !n || f.burnt) return;
  const sw = Math.sin(time * 0.0007 + f.seed) * (1.4 + (wind || 0) * 3) * (f.h / 200);
  c.save(); c.lineCap = 'round';
  if (f.kind === 'platanero') { /* las 3 manos del racimo */
    c.strokeStyle = '#d9d03a'; for (let i = 0; i < n; i++) { const p = sl[i], side = (i % 3) - 1 || 0.5; c.strokeStyle = '#e8d23a'; c.lineWidth = 3.6; c.beginPath(); c.moveTo(p.x, p.y); c.quadraticCurveTo(p.x + side * 1.2, p.y + 11, p.x + side * 6, p.y + 12.5); c.stroke(); c.strokeStyle = '#6a5a1a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(p.x + side * 5, p.y + 12); c.lineTo(p.x + side * 6.6, p.y + 12.6); c.stroke(); }
  } else if (f.kind === 'bush') { for (let i = 0; i < n; i++) mdFrDrawOne(c, kd, sl[i].x, sl[i].y, 0.95); }
  else for (let i = 0; i < n; i++) { const p = sl[i], o = p.sway ? sw : sw * 0.2; c.strokeStyle = f.kind === 'palm' ? '#7a5a34' : '#4f6a34'; c.lineWidth = f.kind === 'palm' ? 1.6 : 1; c.beginPath(); c.moveTo(p.ax + o, p.ay); c.lineTo(p.x + o, p.y - 3); c.stroke(); mdFrDrawOne(c, kd, p.x + o, p.y + (kd === 'coco' ? 1 : 0), kd === 'coco' ? 1.25 : kd === 'datil' ? 1.1 : 1.15); }
  c.restore();
}

/* ---- árboles y plantas propios de las selvas ---- */
{ const base = mdTreeBr; mdTreeBr = function (f) {
  if (f.br) return f.br;
  if (f.kind === 'ceiba' || f.kind === 'cecropia') {
    const R = mdRng(f.seed + 77), h = f.h, br = []; f.br = br; let side = R() < 0.5 ? -1 : 1;
    if (f.kind === 'ceiba') for (let i = 0; i < 5; i++) { br.push({ t: 0.8 + i * 0.03 + (R() - 0.5) * 0.02, side, len: h * (0.22 + R() * 0.14), rise: h * (0.02 + R() * 0.03), w: Math.max(2.6, h * 0.02), draw: 1, x: 1 }); side = -side; }
    else for (let i = 0; i < 5; i++) { br.push({ t: 0.5 + i * 0.07 + (R() - 0.5) * 0.02, side, len: h * (0.13 + R() * 0.09), rise: h * (0.08 + R() * 0.07), w: Math.max(2, h * 0.014), draw: 1, x: 1 }); side = -side; }
    return br;
  }
  return base(f);
}; }
function mdBranchLimbs(c, f, col, sw) {
  c.strokeStyle = col; c.lineCap = 'round'; const h = f.h;
  for (const b of mdTreeBr(f)) { const y0 = -h * b.t, tx = b.side * b.len + sw, ty = y0 - b.rise; let px = b.side * 2, py = y0 + 2; for (let i = 1; i <= 6; i++) { const t = i / 6, p = mdBez(b.side * 2, y0 + 2, b.side * b.len * 0.5, y0 - b.rise * 0.2 + 3, tx, ty, t); c.lineWidth = Math.max(1.2, b.w * (1.25 - t * 0.95)); c.beginPath(); c.moveTo(px, py); c.lineTo(p.x, p.y); c.stroke(); px = p.x; py = p.y; } }
}
function mdDrawCeiba(c, f, W, time, wind) {
  const h = f.h, sw = Math.sin(time * 0.0007 + f.seed) * (1.4 + (wind || 0) * 3) * (h / 200), leaf = mdSh(mdPalFor(W, 'jungle'), 0.04), hi = mdSh(leaf, 0.2), bark = '#a39a8a';
  c.save(); c.fillStyle = '#8f8676'; for (const i of [-2, -1, 1, 2]) { c.beginPath(); c.moveTo(i * h * 0.012, -h * 0.34); c.quadraticCurveTo(i * h * 0.022, -h * 0.07, i * h * 0.1, 1); c.lineTo(i * h * 0.035, 1); c.closePath(); c.fill(); }
  mdTrunk(c, h * 0.86, h * 0.085, bark, sw * 0.12); c.fillStyle = '#7b7364'; const R = mdRng(f.seed + 9); for (let i = 0; i < 16; i++) mdE(c, (R() - 0.5) * h * 0.04, -h * (0.1 + R() * 0.7), 1.1, 1.1);
  mdBranchLimbs(c, f, '#8a8172', sw * 0.25);
  c.fillStyle = mdSh(leaf, -0.1); mdE(c, sw, -h * 0.9, h * 0.44, h * 0.09); mdE(c, -h * 0.2 + sw, -h * 0.97, h * 0.26, h * 0.08); mdE(c, h * 0.22 + sw, -h * 0.96, h * 0.25, h * 0.08);
  c.fillStyle = leaf; mdE(c, sw, -h * 0.96, h * 0.4, h * 0.09); mdE(c, -h * 0.12 + sw, -h * 1.02, h * 0.26, h * 0.075); mdE(c, h * 0.14 + sw, -h * 1.02, h * 0.26, h * 0.075);
  c.fillStyle = hi; mdE(c, -h * 0.06 + sw, -h * 1.03, h * 0.22, h * 0.04); mdE(c, h * 0.2 + sw, -h * 1.0, h * 0.14, h * 0.03);
  c.restore();
}
function mdPalmLeaf(c, x, y, r, col, hi) { for (let i = 0; i < 7; i++) { const a = -Math.PI + 0.28 + i * (Math.PI - 0.56) / 6; c.fillStyle = i % 2 ? col : hi; mdE(c, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.5, r * 0.55, r * 0.17, a * 0.75); } c.fillStyle = col; mdE(c, x, y, r * 0.2, r * 0.14); }
function mdDrawCecropia(c, f, W, time, wind) {
  const h = f.h, sw = Math.sin(time * 0.0007 + f.seed) * (1.4 + (wind || 0) * 3) * (h / 200), leaf = mdSh(mdPalFor(W, 'jungle'), 0.1), hi = mdSh(leaf, 0.22);
  c.save(); c.strokeStyle = '#a89f86'; c.lineCap = 'round'; c.lineWidth = 2; for (const s of [-1, 0, 1]) { c.beginPath(); c.moveTo(s * h * 0.09, 0); c.lineTo(s * h * 0.015, -h * 0.17); c.stroke(); }
  mdTrunk(c, h * 0.74, h * 0.052, '#b9b19b', sw * 0.2); c.strokeStyle = '#8b836d'; c.lineWidth = 1; for (let i = 1; i < 10; i++) { const y = -h * 0.07 * i; c.beginPath(); c.moveTo(-h * 0.02, y); c.lineTo(h * 0.02, y); c.stroke(); }
  mdBranchLimbs(c, f, '#a89f86', sw * 0.25);
  for (const b of mdTreeBr(f)) mdPalmLeaf(c, b.side * b.len + sw, -h * b.t - b.rise - 3, h * 0.13, leaf, hi);
  mdPalmLeaf(c, sw * 0.4, -h * 0.76, h * 0.15, leaf, hi); c.restore();
}
function mdDrawPlatanero(c, f, W, time, wind) {
  const h = f.h, d = f.dir || 1, sw = Math.sin(time * 0.0007 + f.seed) * (1.4 + (wind || 0) * 3) * (h / 200) * 0.6, R = mdRng(f.seed), top = -h * 0.58, leaf = '#63b04a', hi = '#82c85e';
  c.save(); c.lineCap = 'round';
  mdTrunk(c, h * 0.58, h * 0.1, '#9cc062', sw * 0.2); c.strokeStyle = '#7ea64c'; c.lineWidth = 1; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(-h * 0.04, -h * 0.1 * i); c.lineTo(h * 0.04, -h * 0.1 * i + 2); c.stroke(); }
  c.fillStyle = '#6a5636'; mdE(c, 0, -2, h * 0.07, 3);
  for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.06 + i * 0.176), len = h * (0.5 + R() * 0.16), bx = sw * 0.2, by = top, tx = bx + Math.cos(a) * len, ty = by + Math.sin(a) * len * 0.5 + len * 0.3, mx = bx + Math.cos(a) * len * 0.5, my = by + Math.sin(a) * len * 0.75 - 3, nx = -(ty - by), ny = tx - bx, nl = Math.hypot(nx, ny) || 1, wd = h * 0.075; c.fillStyle = i % 2 ? leaf : hi; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(mx + nx / nl * wd, my + ny / nl * wd, tx, ty); c.quadraticCurveTo(mx - nx / nl * wd, my - ny / nl * wd, bx, by); c.fill(); c.strokeStyle = '#3f7a30'; c.lineWidth = 1; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(mx, my, tx, ty); c.stroke(); }
  const ax = h * 0.2 * d, sl = mdFrSlots(f), last = sl.length ? sl[sl.length - 1].y : -h * 0.46 + 15;
  c.strokeStyle = '#5a7a3a'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(sw * 0.2, top + 3); c.quadraticCurveTo(ax, top - 4, ax, -h * 0.46 - 2); c.lineTo(ax, last + 14); c.stroke();
  c.fillStyle = '#7a2a5a'; c.beginPath(); c.moveTo(ax, last + 12); c.quadraticCurveTo(ax + 5, last + 17, ax, last + 25); c.quadraticCurveTo(ax - 5, last + 17, ax, last + 12); c.fill();
  c.restore(); mdFrDrawHang(c, f, time, wind);
}
let MD_TONE = 0;
{ const b = mdPalFor; mdPalFor = function (W, k) { const r = b(W, k); return MD_TONE && typeof r === 'string' ? mdSh(r, MD_TONE) : r; }; }
{ const base = mdDrawFlora; mdDrawFlora = function (c, f, W, time, snowy, wind) {
  const k = f.kind;
  if (!f.burnt) { if (k === 'ceiba') return mdDrawCeiba(c, f, W, time, wind); if (k === 'cecropia') return mdDrawCecropia(c, f, W, time, wind); if (k === 'platanero') return mdDrawPlatanero(c, f, W, time, wind); }
  MD_TONE = MD_TREES.has(k) && k !== 'dead' && k !== 'bamboo' ? (((f.seed * 37) % 11) - 5) * 0.018 : 0;
  try { base(c, f, W, time, snowy, wind); } finally { MD_TONE = 0; }
  if (f.nf > 0 && !f.burnt) mdFrDrawHang(c, f, time, wind);
}; }
/* más variedad de árboles, y solo los que existen en cada lugar */
(function () {
  const set = (id, fl) => { const w = MD_WORLDS.find((x) => x.id === id); if (w) w.flora = fl; };
  set('selva', [['jungle', 1.2, 170, 290], ['ceiba', 0.45, 260, 340], ['cecropia', 0.55, 140, 210], ['palm', 0.6, 150, 240], ['platanero', 0.7, 90, 130], ['fern', 1.5], ['flower', 0.8]]);
  set('granjungla', [['jungle', 1.3, 180, 320], ['ceiba', 0.55, 280, 360], ['cecropia', 0.65, 150, 220], ['palm', 0.6, 150, 250], ['platanero', 0.8, 95, 135], ['fern', 1.8], ['flower', 0.8]]);
  set('amazonas', [['jungle', 1, 170, 290], ['ceiba', 0.45, 260, 340], ['cecropia', 0.65, 140, 210], ['palm', 0.55, 150, 240], ['fern', 1.3]]);
  set('india', [['jungle', 1, 160, 280], ['ceiba', 0.35, 240, 320], ['bamboo', 0.8, 150, 240], ['platanero', 0.6, 90, 130], ['fern', 1.2], ['flower', 0.8]]);
  const bo = MD_WORLDS.find((x) => x.id === 'bosque'); if (bo) bo.flora.splice(2, 0, ['maple', 0.3, 140, 230]);
  const ri = MD_WORLDS.find((x) => x.id === 'rio'); if (ri) ri.flora.splice(2, 0, ['willow', 0.45, 130, 200]);
})();

/* ---- cortar, bajar y comer ---- */
function mdFrDrop(f, x, y) { if (!f.nf) return; f.nf--; if (!f.nf) { f.fruit = false; f.fruitT = 0; } MDS.fruits.push({ x, y, kind: mdFrKind(f), left: 1, t: MDS.t, fall: true, gy: mdGY(x), vy: 0 }); }
function mdFrItems(items, x0, x1) {
  for (const q of MDS.fruits || []) if (q.x > x0 - 60 && q.x < x1 + 60) items.push({ y: q.y + 0.03, bug: 1, draw: (c) => { c.globalAlpha = Math.min(1, q.left * 1.5 + 0.3) * (q.rot ? 0.55 : 1); if (q.fall) { mdFrDrawOne(c, q.kind, q.x, q.y, 1.3); } else { c.fillStyle = 'rgba(0,0,0,.14)'; mdE(c, q.x, q.y + 1, 6, 1.8); mdFrDrawOne(c, q.kind, q.x, q.y - 3, 1.3 * (0.5 + q.left * 0.5)); } c.globalAlpha = 1; } });
  for (const h of MDS.hearts || []) items.push({ y: 9000, bug: 1, draw: (c) => { const k = h.t / 2.2; c.globalAlpha = Math.max(0, 1 - k); c.fillStyle = '#ff6b8e'; const x = h.x, y = h.y - k * 34, s = 4 + k * 2; c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.6, y - s * 0.2, x - s * 0.6, y - s * 1.5, x, y - s * 0.5); c.bezierCurveTo(x + s * 0.6, y - s * 1.5, x + s * 1.6, y - s * 0.2, x, y + s * 0.9); c.fill(); c.globalAlpha = 1; } });
}
{ const base = mdCarcItems; mdCarcItems = function (items, x0, x1) { base(items, x0, x1); mdFrItems(items, x0, x1); }; }
const MD_FR_EAT = (a, kind) => a.layer === 'land' && !a.arb && !a.inHome && a.S.t !== 'b' && (MD_FR_EATERS[kind] || []).includes(a.sp);
{ const base = mdThink; mdThink = function (a, dt) {
  if (!MDS.fruits || a.dead) return base(a, dt);
  const mk = a.sp === 'mono' && a.age >= 0.55;
  if (MDS.E.shelter || a.state === 'shelter' || a.state === 'flee') { a.eatF = null; a.pz = null; }
  if (mk && a.inCanopy && a.state === 'canopy' && a.timer <= 0 && a.tree && a.tree.nf > 0 && mdFrKind(a.tree) && !a.carry && Math.random() < 0.7) {
    const f = a.tree, kd = mdFrKind(f); f.nf--; if (!f.nf) { f.fruit = false; f.fruitT = 0; } a.carry = { kind: kd }; a.down = true; mdSetState(a, 'climb', 8); return;
  }
  if (a.carry && a.state === 'climb') return base(a, dt);
  if (a.carry && !a.inCanopy && a.state !== 'banana' && a.state !== 'climb') { a.dir = a.dir || 1; mdSetState(a, 'banana', 6); a.tx = a.x; a.carryT = 6; return; }
  /* el monito en el suelo va a la planta de plátano y arranca uno */
  if (mk && !a.inCanopy && !a.carry && !a.eatF && !a.pz && a.hunger > 0.25 && (a.state === 'idle' || a.state === 'wander') && Math.random() < 0.5) { let b = null, bd = 800; for (const f of MDS.fl) if (f.kind === 'platanero' && f.nf > 0 && !f.burnt) { const d = Math.abs(f.x - a.x); if (d < bd) { bd = d; b = f; } } if (b) a.pz = b; }
  if (a.pz) { const f = a.pz; if (!(f.nf > 0) || f.burnt || a.state === 'flee' || a.state === 'sleep') { a.pz = null; return base(a, dt); } const gx = f.x - 12 * (a.x < f.x ? 1 : -1); if (Math.abs(gx - a.x) > 14) { a.tx = gx; a.running = false; if (a.state !== 'wander') mdSetState(a, 'wander', 3); a.timer = Math.max(a.timer, 2); return; } f.nf--; if (!f.nf) { f.fruit = false; f.fruitT = 0; } a.pz = null; a.dir = f.x >= a.x ? 1 : -1; a.carry = { kind: 'banana' }; mdSetState(a, 'banana', 6); a.tx = a.x; a.carryT = 6; return; }
  if (a.hunger > 0.3 && a.age >= 0.5 && (a.state === 'idle' || a.state === 'wander') && !a.eatF) {
    { let b = null, bd = 700; for (const q of MDS.fruits) if (!q.fall && !q.rot && q.left > 0 && (MD_FR_EAT(a, q.kind) || (mk && !a.inCanopy && !a.carry))) { const d = Math.abs(q.x - a.x); if (d < bd) { bd = d; b = q; } } if (b && Math.random() < 0.5) a.eatF = b; }
  }
  if (a.eatF) { const q = a.eatF; if (q.left <= 0 || q.rot || a.state === 'flee' || a.state === 'sleep' || a.hunger < 0.05) { a.eatF = null; return base(a, dt); } if (Math.abs(q.x - a.x) > 22) { a.tx = q.x; a.running = false; if (a.state !== 'wander') mdSetState(a, 'wander', 3); a.timer = Math.max(a.timer, 2); return; } mdSetState(a, mk ? 'banana' : 'eat', 2); a.tx = a.x; a.dir = q.x >= a.x ? 1 : -1; a.eatingF = true; return; }
  base(a, dt);
}; }
function mdFrTick(dt) {
  const fs = MDS.fruits; if (!fs) return;
  MDS.frT += dt; for (const q of fs) if (q.fall) { q.vy += 520 * dt; q.y += q.vy * dt; if (q.y >= q.gy) { q.y = q.gy; q.fall = false; q.t = MDS.t; } }
  if (MDS.frT > 14) { MDS.frT = 0; const cand = MDS.fl.filter((f) => f.nf > 1 && !f.burnt && f.burn <= 0 && f.kind !== 'platanero'); if (cand.length && Math.random() < 0.5) { const f = cand[Math.floor(Math.random() * cand.length)], p = mdFrPos(f, f.nf - 1); mdFrDrop(f, p.x, p.y); } }
  for (const f of MDS.fl) {
    if (f.kind === 'platanero' && !f.fruit && !f.burnt) { f.fruitT += dt; if (f.fruitT > 70) { f.fruit = true; f.fruitT = 0; } }
    if (!f.fruit && f.nf > 0) { if (!f.burnt) while (f.nf > 0) { const p = mdFrPos(f, f.nf - 1); f.nf--; fs.push({ x: p.x, y: p.y, kind: mdFrKind(f), left: 1, t: MDS.t, fall: true, gy: mdGY(p.x), vy: 0 }); } f.nf = 0; }
    else if (f.fruit && !(f.nf > 0) && mdFrKind(f)) f.nf = mdFrMax(f);
  }
  for (const q of fs) if (!q.fall && MDS.t - q.t > 40 && !q.rot) q.rot = true;
  MDS.fruits = fs.filter((q) => q.fall || (q.left > 0 && MDS.t - q.t < 140));
  for (const a of MDS.an) {
    if (a.dead) continue;
    if (a.eatF && a.eatingF) { a.eatingF = false; a.hunger = Math.max(0, a.hunger - dt * 0.08); a.eatF.left -= dt * 0.22; if (a.eatF.left <= 0) { a.eatF = null; if (a.state === 'eat' || a.state === 'banana') a.timer = 0; } }
    if (a.carry && a.state === 'banana' && !a.inCanopy) { a.carryT -= dt; a.hunger = Math.max(0, a.hunger - dt * 0.05); if (a.carryT <= 0) { const ck = a.carry.kind; a.carry = null; a.timer = 0; MDS.fruits.push({ x: a.x + a.dir * 8, y: mdGY(a.x), kind: ck, left: 0.15, t: MDS.t - 30, rot: true }); } }
    if (a.state === 'fruit' && a.tree && a.arb !== true && a.layer === 'air' && !a.flying && a.tree.nf > 0 && mdFrKind(a.tree)) { a.fT = (a.fT || 0) + dt; if (a.fT > 6) { a.fT = 0; const p = mdFrPos(a.tree, a.tree.nf - 1); mdFrDrop(a.tree, p.x, p.y); } }
    if (a.sp === 'mono' && a.age < 0.7 && (a.state === 'groom' || a.state === 'banana' || a.state === 'rest' || a.state === 'chase') && Math.random() < dt * 0.35) MDS.hearts.push({ x: a.x + (Math.random() - 0.5) * 14, y: a.y - 22, t: 0 });
    else if (a.sp === 'mono' && (a.state === 'groom') && Math.random() < dt * 0.3) MDS.hearts.push({ x: a.x + 6, y: a.y - 34, t: 0 });
  }
  for (const h of MDS.hearts) h.t += dt; MDS.hearts = MDS.hearts.filter((h) => h.t < 2.2).slice(-14);
}
{ const base = mdUpdate; mdUpdate = function (dt) { base(dt); if (MDS.def) mdFrTick(Math.min(dt, 0.1)); }; }
{ const base = mdDrawQuad; mdDrawQuad = function (c, a, S, time, P) { base(c, a, S, time, P); if (a.carry && a.state !== 'banana') { c.save(); mdFrDrawOne(c, a.carry.kind, 10, -S.z * 14 - 6, 1.2); c.restore(); } }; }
