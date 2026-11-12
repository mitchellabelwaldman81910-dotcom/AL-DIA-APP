/* Cinnavia 7.51 — Monito Saltarín: biomas y dibujos (monito, chimpancés, cocodrilos, árboles, bananas).
   Todo se dibuja con trazos de canvas; no hay imágenes. Unidad u = ancho de una casilla en pantalla. */
'use strict';

const MN_BIOMES = [
  { id: 'selva', name: 'Selva', grass: ['#72c24f', '#66b546'], road: '#6a6556', line: '#efe3ae', water: '#2f8f86', water2: '#287a73', crocBody: '#3f7f3a', crocBelly: '#c8d98a', crocRidge: '#2c5e2b', fur: ['#3a2a22', '#4b362a', '#2f231e', '#5a4030'], tree: 'palma', rock: '#8e9186', tuft: '#4f9a3a', amb: 'hojas' },
  { id: 'sabana', name: 'Sabana', grass: ['#d3c164', '#c8b759'], road: '#8d6b45', line: '#f1dfa5', water: '#7d8f5c', water2: '#6f8152', crocBody: '#6b7a3a', crocBelly: '#d6d08a', crocRidge: '#4d5a2a', fur: ['#3b2b22', '#4c372b', '#33261f'], tree: 'acacia', rock: '#a79a82', tuft: '#a8963f', amb: 'polvo' },
  { id: 'nieve', name: 'Nieve', grass: ['#f4f9fd', '#e6eff7'], road: '#a9b6c4', line: '#ffffff', water: '#3f78ad', water2: '#366a9b', crocBody: '#4f7f6a', crocBelly: '#d5e7e0', crocRidge: '#35604f', fur: ['#5b4d46', '#6a5a52', '#4a3f3a'], tree: 'pino', rock: '#b9c6d3', tuft: '#cfdde9', amb: 'nieve' },
  { id: 'desierto', name: 'Desierto', grass: ['#ecce8e', '#e2c382'], road: '#b8935a', line: '#f6e3b3', water: '#2fb3ae', water2: '#27a09b', crocBody: '#7a8a3a', crocBelly: '#e6dc9a', crocRidge: '#566326', fur: ['#40302a', '#523b2f', '#372a24'], tree: 'cactus', rock: '#b59a76', tuft: '#c9a763', amb: 'arena' },
  { id: 'pantano', name: 'Pantano', grass: ['#547f4b', '#4b7343'], road: '#4c4c40', line: '#b9b78a', water: '#4a6a39', water2: '#405c33', crocBody: '#3a5f2c', crocBelly: '#b7c27a', crocRidge: '#27421d', fur: ['#2c211c', '#3a2b24', '#241b17'], tree: 'seco', rock: '#6f7a6a', tuft: '#3d6a38', amb: 'luciernagas' },
  { id: 'volcan', name: 'Volcán', grass: ['#4d3d3b', '#42342f'], road: '#2b2527', line: '#ff9a3c', water: '#ff6a1f', water2: '#e24d12', crocBody: '#4a2a22', crocBelly: '#ff9a3c', crocRidge: '#ff5a1a', fur: ['#2a2020', '#342625', '#201818'], tree: 'roca', rock: '#5b4a48', tuft: '#6b4a3a', amb: 'brasas' },
];
const mnHash = (a, b = 0) => { const x = Math.sin(a * 127.1 + b * 311.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
const mnRR = (g, x, y, w, h, r) => { r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const mnShade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${c(n >> 16)},${c((n >> 8) & 255)},${c(n & 255)})`; };
const mnShadow = (g, x, y, rx, ry, a = 0.22) => { g.fillStyle = `rgba(0,0,0,${a})`; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); };

/* ---------- el monito (de frente, con cola) ---------- */
function mnDrawMonkey(g, x, y, u, o) {
  const sq = o.sq || 0, h = o.h || 0, t = o.t || 0;
  mnShadow(g, x, y, 0.3 * u * (1 - h / (1.6 * u)), 0.08 * u, 0.25);
  g.save(); g.translate(x, y - h); g.rotate((o.tilt || 0) * 0.18); g.scale((1 + sq * 0.2) * (o.flat ? 1.25 : 1), (1 - sq * 0.2) * (o.flat ? 0.3 : 1)); g.lineCap = 'round';
  const fur = '#8a5a2c', furD = '#6d4520', skin = '#f2cc9e';
  // cola
  g.strokeStyle = furD; g.lineWidth = 0.1 * u; g.beginPath(); g.moveTo(0.16 * u, -0.2 * u); g.bezierCurveTo(0.5 * u, -0.12 * u, 0.5 * u, -0.5 * u, 0.32 * u, -0.5 * u + Math.sin(t * 6) * 0.03 * u); g.stroke();
  // piernas
  g.fillStyle = furD; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * 0.14 * u, -0.07 * u, 0.1 * u, 0.075 * u, 0, 0, 7); g.fill(); }
  // cuerpo
  g.fillStyle = fur; g.beginPath(); g.ellipse(0, -0.36 * u, 0.26 * u, 0.3 * u, 0, 0, 7); g.fill();
  g.fillStyle = skin; g.beginPath(); g.ellipse(0, -0.33 * u, 0.15 * u, 0.2 * u, 0, 0, 7); g.fill();
  // brazos
  g.fillStyle = fur; for (const s of [-1, 1]) { g.save(); g.translate(s * 0.29 * u, -0.38 * u); g.rotate(s * (0.35 + (o.arms || 0))); g.beginPath(); g.ellipse(0, 0, 0.075 * u, 0.17 * u, 0, 0, 7); g.fill(); g.restore(); }
  // cabeza
  g.fillStyle = fur; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 0.27 * u, -0.8 * u, 0.115 * u, 0, 7); g.fill(); g.fillStyle = skin; g.beginPath(); g.arc(s * 0.27 * u, -0.8 * u, 0.065 * u, 0, 7); g.fill(); g.fillStyle = fur; }
  g.beginPath(); g.arc(0, -0.78 * u, 0.27 * u, 0, 7); g.fill();
  g.fillStyle = skin; g.beginPath(); g.ellipse(0, -0.74 * u, 0.2 * u, 0.17 * u, 0, 0, 7); g.fill(); g.beginPath(); g.arc(-0.085 * u, -0.8 * u, 0.1 * u, 0, 7); g.arc(0.085 * u, -0.8 * u, 0.1 * u, 0, 7); g.fill();
  const lx = (o.look || 0) * 0.018 * u;
  if (o.dead) { g.strokeStyle = '#2b1a10'; g.lineWidth = 0.035 * u; for (const s of [-1, 1]) { const ex = s * 0.085 * u, ey = -0.8 * u; g.beginPath(); g.moveTo(ex - 0.03 * u, ey - 0.03 * u); g.lineTo(ex + 0.03 * u, ey + 0.03 * u); g.moveTo(ex + 0.03 * u, ey - 0.03 * u); g.lineTo(ex - 0.03 * u, ey + 0.03 * u); g.stroke(); } }
  else { g.fillStyle = '#1d120a'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 0.085 * u + lx, -0.8 * u, 0.034 * u, 0, 7); g.fill(); } g.fillStyle = '#fff'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 0.085 * u + lx + 0.01 * u, -0.81 * u, 0.012 * u, 0, 7); g.fill(); } }
  g.strokeStyle = '#7a4b2a'; g.lineWidth = 0.03 * u; g.beginPath(); if (o.dead || o.scared) g.arc(0, -0.64 * u, 0.04 * u, 0, 7); else g.arc(0, -0.7 * u, 0.06 * u, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.fillStyle = '#7a4b2a'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * 0.018 * u, -0.735 * u, 0.012 * u, 0, 7); g.fill(); }
  g.restore();
}

/* ---------- chimpancé (el «carro»): de lado, corriendo; mira a la derecha y se voltea con dir ---------- */
function mnDrawChimp(g, x, y, u, o) {
  const k = o.len / 1.1, w = u * k, ph = o.phase, sw = Math.sin(ph), sw2 = Math.sin(ph + Math.PI);
  mnShadow(g, x, y, 0.5 * o.len * u, 0.08 * u, 0.22);
  g.save(); g.translate(x, y); g.scale(o.dir > 0 ? 1 : -1, 1); g.lineCap = 'round'; g.lineJoin = 'round';
  const fur = o.fur, dark = mnShade(fur, 0.7), face = '#cda57f';
  const bob = Math.abs(Math.sin(ph)) * 0.04 * u;
  const limb = (x0, y0, x1, y1, c, wd) => { g.strokeStyle = c; g.lineWidth = wd; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); };
  // extremidades de atrás
  limb(-0.3 * w, -0.4 * u - bob, -0.3 * w + sw * 0.24 * u, -0.03 * u, dark, 0.13 * u);
  limb(0.26 * w, -0.4 * u - bob, 0.3 * w + sw2 * 0.24 * u, -0.03 * u, dark, 0.13 * u);
  // cuerpo
  g.fillStyle = fur; g.beginPath(); g.ellipse(0, -0.52 * u - bob, 0.46 * w, 0.27 * u, -0.06, 0, 7); g.fill();
  g.fillStyle = mnShade(fur, 1.18); g.beginPath(); g.ellipse(-0.02 * w, -0.46 * u - bob, 0.3 * w, 0.14 * u, -0.06, 0, 7); g.fill();
  // extremidades de adelante
  limb(-0.18 * w, -0.4 * u - bob, -0.2 * w + sw2 * 0.24 * u, -0.03 * u, fur, 0.14 * u);
  limb(0.34 * w, -0.42 * u - bob, 0.4 * w + sw * 0.26 * u, -0.03 * u, fur, 0.14 * u);
  // cabeza
  const hx = 0.5 * w, hy = -0.66 * u - bob;
  g.fillStyle = fur; g.beginPath(); g.arc(hx, hy, 0.21 * u, 0, 7); g.fill();
  g.fillStyle = face; g.beginPath(); g.arc(hx - 0.1 * u, hy - 0.02 * u, 0.075 * u, 0, 7); g.fill();
  g.beginPath(); g.ellipse(hx + 0.07 * u, hy + 0.02 * u, 0.13 * u, 0.12 * u, 0, 0, 7); g.fill();
  g.fillStyle = '#1b120d'; g.beginPath(); g.arc(hx + 0.1 * u, hy - 0.04 * u, 0.03 * u, 0, 7); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(hx + 0.11 * u, hy - 0.05 * u, 0.011 * u, 0, 7); g.fill();
  g.strokeStyle = '#6a4630'; g.lineWidth = 0.03 * u; g.beginPath(); g.arc(hx + 0.12 * u, hy + 0.05 * u, 0.05 * u, 0.1 * Math.PI, 0.9 * Math.PI); g.stroke();
  g.fillStyle = '#2a1a12'; g.beginPath(); g.arc(hx + 0.17 * u, hy + 0.01 * u, 0.012 * u, 0, 7); g.fill();
  if (o.band) { g.fillStyle = o.band; g.beginPath(); g.moveTo(hx - 0.2 * u, hy - 0.1 * u); g.lineTo(hx + 0.18 * u, hy - 0.14 * u); g.lineTo(hx + 0.19 * u, hy - 0.07 * u); g.lineTo(hx - 0.2 * u, hy - 0.04 * u); g.closePath(); g.fill(); g.beginPath(); g.moveTo(hx - 0.2 * u, hy - 0.07 * u); g.lineTo(hx - 0.32 * u, hy - 0.02 * u - sw * 0.02 * u); g.lineTo(hx - 0.2 * u, hy + 0.0); g.fill(); }
  g.restore();
}

/* ---------- cocodrilo (la «balsa»): lomo plano donde se puede pisar ---------- */
function mnDrawCroc(g, x, y, u, o) {
  const L = o.len * u, bob = Math.sin(o.t * 2.6 + o.ph) * 0.03 * u;
  g.save(); g.translate(o.dir > 0 ? x : x + L, y + bob); g.scale(o.dir > 0 ? 1 : -1, 1); g.lineCap = 'round'; g.lineJoin = 'round';
  const B = o.body, Bl = o.belly, Rg = o.ridge;
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = 0.35 * u; }
  // cola
  g.fillStyle = B; g.beginPath(); g.moveTo(-0.02 * L, -0.12 * u); g.quadraticCurveTo(0.12 * L, -0.34 * u, 0.3 * L, -0.34 * u); g.lineTo(0.3 * L, -0.02 * u); g.quadraticCurveTo(0.12 * L, -0.06 * u, -0.02 * L, -0.12 * u); g.fill();
  // tronco
  mnRR(g, 0.2 * L, -0.4 * u, 0.64 * L, 0.4 * u, 0.18 * u); g.fill();
  g.shadowBlur = 0; g.fillStyle = Bl; mnRR(g, 0.26 * L, -0.12 * u, 0.56 * L, 0.1 * u, 0.05 * u); g.fill();
  // hocico
  g.fillStyle = B; mnRR(g, 0.78 * L, -0.34 * u, 0.22 * L, 0.2 * u, 0.08 * u); g.fill();
  g.fillStyle = mnShade(B, 0.82); mnRR(g, 0.78 * L, -0.18 * u, 0.21 * L, 0.1 * u, 0.04 * u); g.fill();
  g.fillStyle = '#fff'; const nT = 4; for (let i = 0; i < nT; i++) { const tx = 0.8 * L + i * (0.19 * L / nT); g.beginPath(); g.moveTo(tx, -0.19 * u); g.lineTo(tx + 0.012 * L, -0.1 * u); g.lineTo(tx + 0.024 * L, -0.19 * u); g.fill(); }
  // crestas
  g.fillStyle = Rg; for (let i = 0; i < 6; i++) { const rx = 0.24 * L + i * 0.095 * L; g.beginPath(); g.moveTo(rx, -0.39 * u); g.lineTo(rx + 0.03 * L, -0.5 * u); g.lineTo(rx + 0.06 * L, -0.39 * u); g.fill(); }
  // patas
  g.fillStyle = mnShade(B, 0.8); for (const lx of [0.34, 0.68]) { g.beginPath(); g.ellipse(lx * L, -0.03 * u, 0.07 * u, 0.045 * u, 0, 0, 7); g.fill(); }
  // ojos
  g.fillStyle = '#e6d65a'; g.beginPath(); g.arc(0.74 * L, -0.43 * u, 0.065 * u, 0, 7); g.fill();
  g.fillStyle = '#1a1a10'; g.beginPath(); g.ellipse(0.755 * L, -0.43 * u, 0.018 * u, 0.045 * u, 0, 0, 7); g.fill();
  g.restore();
  // oleaje encima: parece que flota
  g.fillStyle = o.waterTop; g.globalAlpha = 0.5; g.beginPath(); g.ellipse(x + L / 2, y + bob + 0.01 * u, L * 0.54, 0.07 * u, 0, 0, 7); g.fill(); g.globalAlpha = 1;
}

/* ---------- obstáculos de cada bioma (x centro, y pie) ---------- */
function mnDrawTree(g, x, y, u, kind, v, t) {
  mnShadow(g, x, y, 0.3 * u, 0.07 * u, 0.2);
  g.save(); g.translate(x, y); g.lineCap = 'round'; g.lineJoin = 'round';
  const sway = Math.sin(t * 1.4 + v * 9) * 0.015 * u;
  if (kind === 'palma') {
    g.strokeStyle = '#7b5532'; g.lineWidth = 0.16 * u; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(0.12 * u, -0.6 * u, 0.04 * u + sway, -1.1 * u); g.stroke();
    g.fillStyle = '#2f8a3a'; for (let i = 0; i < 6; i++) { const a = -Math.PI * 0.5 + (i - 2.5) * 0.62 + sway * 0.8; g.save(); g.translate(0.04 * u + sway, -1.1 * u); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(0.2 * u, -0.1 * u, 0.5 * u, 0.12 * u); g.quadraticCurveTo(0.22 * u, 0.0, 0, 0); g.fill(); g.restore(); }
    g.fillStyle = '#5a3a1a'; g.beginPath(); g.arc(0.0 * u + sway, -1.06 * u, 0.06 * u, 0, 7); g.arc(0.1 * u + sway, -1.04 * u, 0.06 * u, 0, 7); g.fill();
  } else if (kind === 'acacia') {
    g.strokeStyle = '#6a4a2a'; g.lineWidth = 0.13 * u; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-0.05 * u, -0.45 * u, 0, -0.85 * u); g.moveTo(0, -0.6 * u); g.lineTo(0.22 * u, -0.9 * u); g.stroke();
    g.fillStyle = '#6f8f3a'; g.beginPath(); g.ellipse(0, -1.0 * u, 0.5 * u, 0.2 * u, 0, 0, 7); g.fill(); g.fillStyle = '#82a345'; g.beginPath(); g.ellipse(-0.1 * u, -1.05 * u, 0.32 * u, 0.12 * u, 0, 0, 7); g.fill();
  } else if (kind === 'pino') {
    g.fillStyle = '#6a4a2a'; g.fillRect(-0.07 * u, -0.25 * u, 0.14 * u, 0.25 * u);
    for (let i = 0; i < 3; i++) { const yy = -0.2 * u - i * 0.36 * u, ww = (0.46 - i * 0.11) * u; g.fillStyle = '#2f6b4a'; g.beginPath(); g.moveTo(-ww, yy); g.lineTo(0, yy - 0.5 * u); g.lineTo(ww, yy); g.closePath(); g.fill(); g.fillStyle = '#f7fbff'; g.beginPath(); g.moveTo(-ww * 0.62, yy - 0.2 * u); g.lineTo(0, yy - 0.5 * u); g.lineTo(ww * 0.62, yy - 0.2 * u); g.quadraticCurveTo(0, yy - 0.12 * u, -ww * 0.62, yy - 0.2 * u); g.fill(); }
  } else if (kind === 'cactus') {
    g.fillStyle = '#3f8f4a'; mnRR(g, -0.12 * u, -1.0 * u, 0.24 * u, 1.0 * u, 0.12 * u); g.fill(); mnRR(g, -0.38 * u, -0.7 * u, 0.2 * u, 0.1 * u, 0.05 * u); g.fill(); mnRR(g, -0.38 * u, -0.9 * u, 0.12 * u, 0.3 * u, 0.06 * u); g.fill(); mnRR(g, 0.18 * u, -0.55 * u, 0.2 * u, 0.1 * u, 0.05 * u); g.fill(); mnRR(g, 0.26 * u, -0.75 * u, 0.12 * u, 0.3 * u, 0.06 * u); g.fill();
    g.strokeStyle = '#2b6b36'; g.lineWidth = 0.025 * u; g.beginPath(); g.moveTo(0, -0.95 * u); g.lineTo(0, -0.05 * u); g.stroke();
    g.fillStyle = '#f08aa8'; g.beginPath(); g.arc(0, -1.02 * u, 0.05 * u, 0, 7); g.fill();
  } else if (kind === 'seco') {
    g.strokeStyle = '#3d2f26'; g.lineWidth = 0.13 * u; g.beginPath(); g.moveTo(0, 0); g.lineTo(0.02 * u, -0.7 * u); g.moveTo(0.02 * u, -0.5 * u); g.lineTo(-0.3 * u, -0.9 * u); g.moveTo(0.02 * u, -0.62 * u); g.lineTo(0.28 * u, -1.0 * u); g.stroke();
    g.strokeStyle = '#6f9a5a'; g.lineWidth = 0.025 * u; for (const [mx, my] of [[-0.28, -0.88], [0.26, -0.96], [0.0, -0.68]]) { for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(mx * u + (i - 1) * 0.05 * u, my * u); g.lineTo(mx * u + (i - 1) * 0.05 * u + Math.sin(t * 1.5 + i) * 0.02 * u, (my + 0.28) * u); g.stroke(); } }
    g.fillStyle = '#d9533f'; g.beginPath(); g.arc(-0.3 * u, -0.05 * u, 0.1 * u, Math.PI, 0); g.fill(); g.fillStyle = '#f0e6c8'; g.fillRect(-0.32 * u, -0.05 * u, 0.04 * u, 0.1 * u);
  } else { // roca de volcán
    g.fillStyle = '#4f3f3d'; g.beginPath(); g.moveTo(-0.38 * u, 0); g.lineTo(-0.3 * u, -0.5 * u); g.lineTo(-0.1 * u, -0.85 * u); g.lineTo(0.18 * u, -0.7 * u); g.lineTo(0.38 * u, -0.3 * u); g.lineTo(0.34 * u, 0); g.closePath(); g.fill();
    g.fillStyle = '#6a5755'; g.beginPath(); g.moveTo(-0.1 * u, -0.85 * u); g.lineTo(0.18 * u, -0.7 * u); g.lineTo(0.0, -0.45 * u); g.closePath(); g.fill();
    g.strokeStyle = `rgba(255,${110 + 40 * Math.sin(t * 3 + v * 7) | 0},40,.95)`; g.lineWidth = 0.04 * u; g.beginPath(); g.moveTo(-0.12 * u, -0.1 * u); g.lineTo(-0.04 * u, -0.38 * u); g.lineTo(0.1 * u, -0.5 * u); g.stroke();
  }
  g.restore();
}
function mnDrawRock(g, x, y, u, b) {
  mnShadow(g, x, y, 0.28 * u, 0.06 * u, 0.2); g.fillStyle = b.rock; g.beginPath(); g.moveTo(x - 0.3 * u, y); g.lineTo(x - 0.22 * u, y - 0.34 * u); g.lineTo(x + 0.02 * u, y - 0.46 * u); g.lineTo(x + 0.28 * u, y - 0.26 * u); g.lineTo(x + 0.32 * u, y); g.closePath(); g.fill();
  g.fillStyle = mnShade(b.rock, 1.18); g.beginPath(); g.moveTo(x - 0.22 * u, y - 0.34 * u); g.lineTo(x + 0.02 * u, y - 0.46 * u); g.lineTo(x + 0.04 * u, y - 0.22 * u); g.closePath(); g.fill();
}
function mnDrawBanana(g, x, y, u, t, k = 1) {
  const bob = Math.sin(t * 4) * 0.05 * u; g.save(); g.translate(x, y - 0.3 * u + bob); g.rotate(-0.5 + Math.sin(t * 2) * 0.1); g.scale(k, k);
  g.shadowColor = 'rgba(255,230,90,.8)'; g.shadowBlur = 0.2 * u; g.fillStyle = '#ffd93a'; g.beginPath(); g.moveTo(-0.2 * u, -0.04 * u); g.quadraticCurveTo(0, 0.28 * u, 0.22 * u, -0.1 * u); g.quadraticCurveTo(0.04 * u, 0.12 * u, -0.2 * u, -0.04 * u); g.fill(); g.shadowBlur = 0;
  g.strokeStyle = '#8a6a10'; g.lineWidth = 0.03 * u; g.beginPath(); g.moveTo(0.22 * u, -0.1 * u); g.lineTo(0.26 * u, -0.17 * u); g.stroke(); g.restore();
}
function mnDrawEagle(g, x, y, u, t, o = 1) {
  g.save(); g.translate(x, y); g.scale(o, o); g.fillStyle = '#3a2a20'; const fl = Math.sin(t * 14) * 0.25;
  for (const s of [-1, 1]) { g.save(); g.scale(s, 1); g.rotate(fl); g.beginPath(); g.moveTo(0.05 * u, -0.05 * u); g.quadraticCurveTo(0.6 * u, -0.5 * u, 1.2 * u, -0.1 * u); g.quadraticCurveTo(0.8 * u, -0.05 * u, 0.7 * u, 0.1 * u); g.quadraticCurveTo(0.4 * u, 0.0, 0.05 * u, 0.15 * u); g.fill(); g.restore(); }
  g.fillStyle = '#4a3528'; g.beginPath(); g.ellipse(0, 0.08 * u, 0.2 * u, 0.34 * u, 0, 0, 7); g.fill(); g.fillStyle = '#f2efe6'; g.beginPath(); g.arc(0, -0.26 * u, 0.15 * u, 0, 7); g.fill();
  g.fillStyle = '#f0b429'; g.beginPath(); g.moveTo(-0.05 * u, -0.22 * u); g.lineTo(0, -0.1 * u); g.lineTo(0.05 * u, -0.22 * u); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(-0.06 * u, -0.3 * u, 0.025 * u, 0, 7); g.arc(0.06 * u, -0.3 * u, 0.025 * u, 0, 7); g.fill();
  g.strokeStyle = '#f0b429'; g.lineWidth = 0.05 * u; g.beginPath(); g.moveTo(-0.1 * u, 0.4 * u); g.lineTo(-0.14 * u, 0.55 * u); g.moveTo(0.1 * u, 0.4 * u); g.lineTo(0.14 * u, 0.55 * u); g.stroke(); g.restore();
}
