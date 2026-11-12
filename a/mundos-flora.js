/* Cinnavia 7.53 — MUNDOS · plantas, cielo, agua y efectos (todo dibujado con código). */
'use strict';
const MD_TREES = new Set(['pine', 'oak', 'maple', 'sakura', 'jungle', 'palm', 'willow', 'mangrove', 'fir', 'acacia', 'baobab', 'eucalyptus', 'dead', 'bamboo']);
const MD_SHELTER = new Set([...MD_TREES, 'bush', 'rock', 'barn', 'igloo', 'fern', 'mush', 'cactus', 'crystal']);
const MD_UNDER = new Set(['seagrass', 'coral', 'kelp', 'anemone', 'tube']);
const mdLerp = (a, b, t) => a + (b - a) * t;
const mdCl = (v, a, b) => (v < a ? a : v > b ? b : v);
const mdSmooth = (t) => { t = mdCl(t, 0, 1); return t * t * (3 - 2 * t); };
function mdRng(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000; }; }
function mdHex(col) { if (col[0] !== '#') { const m = col.match(/[\d.]+/g) || [0, 0, 0]; return [+m[0], +m[1], +m[2]]; } let h = col.slice(1); if (h.length === 3) h = h.split('').map((x) => x + x).join(''); const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function mdMix(a, b, t) { const A = mdHex(a), B = mdHex(b); return `rgb(${Math.round(mdLerp(A[0], B[0], t))},${Math.round(mdLerp(A[1], B[1], t))},${Math.round(mdLerp(A[2], B[2], t))})`; }
function mdBlob(c, x, y, r, col, hi) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, mdTau); c.fill(); if (hi) { c.fillStyle = hi; c.beginPath(); c.arc(x - r * 0.28, y - r * 0.3, r * 0.55, 0, mdTau); c.fill(); } }
function mdCanopy(c, cx, cy, r, col, hi, seed) { const R = mdRng(seed + 3); mdBlob(c, cx, cy, r, col); for (let i = 0; i < 5; i++) { const a = i / 5 * mdTau + R(), d = r * (0.55 + R() * 0.2); mdBlob(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, r * (0.55 + R() * 0.15), col); } mdBlob(c, cx - r * 0.2, cy - r * 0.25, r * 0.62, hi); }
function mdTrunk(c, h, w, col, lean) { c.fillStyle = col; c.beginPath(); c.moveTo(-w * 0.7, 0); c.quadraticCurveTo(-w * 0.35, -h * 0.5, -w * 0.3 + lean, -h); c.lineTo(w * 0.3 + lean, -h); c.quadraticCurveTo(w * 0.35, -h * 0.5, w * 0.7, 0); c.fill(); }

/* colores por mundo */
function mdPalFor(W, kind) {
  const g1 = W.pal.g1, g2 = W.pal.g2;
  const L = { oak: mdSh(g2, -0.1), pine: '#2f6b49', fir: '#2a6a5a', maple: '#e0742c', sakura: '#f6b8d0', jungle: '#2f8a45', palm: '#4aa04a', willow: '#8fc268', mangrove: '#3f8a50', acacia: '#7aa84a', baobab: '#6e9a3e', eucalyptus: '#8fb59a', bush: mdSh(g2, -0.05), fern: '#4f9a4a', tuft: mdSh(g1, -0.1) };
  if (W.leaves) L.oak = L.maple = L.willow = L.acacia = W.leaves;
  return L[kind] || g2;
}

function mdDrawFlora(c, f, W, time, snowy, wind) {
  const k = f.kind, R = mdRng(f.seed), h = f.h, sw = Math.sin(time * 0.0007 + f.seed) * (1.4 + wind * 3) * (h / 200);
  const leaf = mdPalFor(W, k), hi = mdSh(leaf, 0.22), dk = mdSh(leaf, -0.2), bark = f.burnt ? '#2a2420' : (k === 'sakura' ? '#6a4a4e' : k === 'eucalyptus' ? '#b8b0a0' : k === 'baobab' ? '#8a6a52' : '#6a4a32');
  c.save();
  if (f.burnt) { c.fillStyle = '#2a2420'; if (MD_TREES.has(k)) { mdTrunk(c, h * 0.55, h * 0.1, '#2a2420', 0); c.strokeStyle = '#2a2420'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -h * 0.4); c.lineTo(-h * 0.14, -h * 0.55); c.moveTo(0, -h * 0.45); c.lineTo(h * 0.12, -h * 0.62); c.stroke(); } else { mdE(c, 0, -4, h * 0.2, 6); }
    c.restore(); return; }
  c.translate(0, 0);
  if (k === 'pine' || k === 'fir') {
    mdTrunk(c, h * 0.2, h * 0.07, bark, 0); const tiers = k === 'pine' ? 4 : 5, cs = snowy ? '#f4f8fb' : null;
    for (let i = 0; i < tiers; i++) { const t = i / tiers, yy = -h * (0.14 + t * 0.7), ww = h * (0.36 - t * 0.27) * (k === 'fir' ? 0.9 : 1); c.fillStyle = mdSh(leaf, -0.12 + t * 0.12); c.beginPath(); c.moveTo(-ww + sw * t, yy); c.quadraticCurveTo(0, yy - h * 0.09, ww + sw * t, yy); c.lineTo(sw * (t + 0.2), yy - h * 0.3); c.fill(); if (cs) { c.fillStyle = cs; c.beginPath(); c.moveTo(-ww * 0.8 + sw * t, yy - h * 0.03); c.quadraticCurveTo(0, yy - h * 0.12, ww * 0.8 + sw * t, yy - h * 0.03); c.lineTo(sw * (t + 0.2), yy - h * 0.28); c.fill(); } }
  } else if (MD_TREES.has(k) && k !== 'palm' && k !== 'bamboo' && k !== 'dead' && k !== 'acacia' && k !== 'baobab' && k !== 'willow' && k !== 'mangrove' && k !== 'eucalyptus') {
    const big = k === 'jungle' ? 1.2 : 1; mdTrunk(c, h * 0.62, h * 0.1 * big, bark, sw * 0.3); mdCanopy(c, sw, -h * 0.72, h * 0.32 * big, leaf, hi, f.seed);
    if (f.fruit) { c.fillStyle = k === 'sakura' ? '#fff' : '#e8503a'; for (let i = 0; i < 4; i++) mdE(c, (R() - 0.5) * h * 0.4 + sw, -h * (0.62 + R() * 0.25), 3, 3); }
    if (k === 'sakura') { c.fillStyle = '#fff6'; for (let i = 0; i < 6; i++) mdE(c, (R() - 0.5) * h * 0.55 + sw, -h * (0.6 + R() * 0.3), 2.5, 2.5); }
    if (snowy) { c.fillStyle = '#f4f8fb'; mdE(c, sw, -h * 0.95, h * 0.26, h * 0.07); }
  } else if (k === 'willow') {
    mdTrunk(c, h * 0.6, h * 0.1, bark, 0); mdCanopy(c, sw, -h * 0.7, h * 0.3, leaf, hi, f.seed); c.strokeStyle = leaf; c.lineWidth = 2.2; for (let i = -5; i <= 5; i++) { c.beginPath(); c.moveTo(i * h * 0.05 + sw, -h * 0.68); c.quadraticCurveTo(i * h * 0.065 + sw * 2, -h * 0.4, i * h * 0.06 + sw * 2.6, -h * (0.18 + (i % 2) * 0.08)); c.stroke(); }
  } else if (k === 'palm') {
    c.strokeStyle = '#a07a52'; c.lineWidth = h * 0.07; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(h * 0.1 * (f.dir || 1), -h * 0.5, sw + h * 0.08 * (f.dir || 1), -h * 0.92); c.stroke(); c.strokeStyle = '#8a6840'; c.lineWidth = 1.5; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(-h * 0.04 + h * 0.012 * i * (f.dir || 1), -h * i * 0.11); c.lineTo(h * 0.04 + h * 0.012 * i * (f.dir || 1), -h * i * 0.11); c.stroke(); }
    const tx = sw + h * 0.08 * (f.dir || 1), ty = -h * 0.92; for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.06 + i * 0.147), len = h * 0.42; c.strokeStyle = i % 2 ? leaf : mdSh(leaf, 0.12); c.lineWidth = h * 0.06; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(a) * len * 0.6, ty + Math.sin(a) * len * 0.7 - 6, tx + Math.cos(a) * len, ty + Math.sin(a) * len * 0.35 + len * 0.3); c.stroke(); } c.fillStyle = '#6a4a2a'; mdE(c, tx, ty + 4, 4, 4); mdE(c, tx + 5, ty + 6, 4, 4);
  } else if (k === 'acacia') {
    mdTrunk(c, h * 0.6, h * 0.07, bark, 0); c.strokeStyle = bark; c.lineWidth = h * 0.04; c.beginPath(); c.moveTo(0, -h * 0.45); c.lineTo(-h * 0.2, -h * 0.68); c.moveTo(0, -h * 0.5); c.lineTo(h * 0.22, -h * 0.7); c.stroke(); c.fillStyle = leaf; mdE(c, sw, -h * 0.74, h * 0.42, h * 0.12); mdE(c, -h * 0.1 + sw, -h * 0.82, h * 0.3, h * 0.1); c.fillStyle = hi; mdE(c, sw - h * 0.08, -h * 0.78, h * 0.28, h * 0.06);
  } else if (k === 'baobab') {
    c.fillStyle = bark; c.beginPath(); c.moveTo(-h * 0.2, 0); c.quadraticCurveTo(-h * 0.1, -h * 0.35, -h * 0.13, -h * 0.62); c.lineTo(h * 0.13, -h * 0.62); c.quadraticCurveTo(h * 0.1, -h * 0.35, h * 0.2, 0); c.fill(); c.strokeStyle = bark; c.lineWidth = h * 0.05; c.beginPath(); c.moveTo(-h * 0.08, -h * 0.6); c.lineTo(-h * 0.26, -h * 0.82); c.moveTo(0, -h * 0.62); c.lineTo(0, -h * 0.88); c.moveTo(h * 0.08, -h * 0.6); c.lineTo(h * 0.26, -h * 0.8); c.stroke(); mdBlob(c, -h * 0.26, -h * 0.84, h * 0.13, leaf, hi); mdBlob(c, 0, -h * 0.92, h * 0.15, leaf, hi); mdBlob(c, h * 0.26, -h * 0.82, h * 0.13, leaf, hi);
  } else if (k === 'mangrove') {
    c.strokeStyle = bark; c.lineWidth = 3; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * h * 0.07, 0); c.quadraticCurveTo(i * h * 0.05, -h * 0.25, i * h * 0.02, -h * 0.45); c.stroke(); } mdCanopy(c, sw, -h * 0.58, h * 0.28, leaf, hi, f.seed);
  } else if (k === 'eucalyptus') {
    mdTrunk(c, h * 0.78, h * 0.06, bark, sw * 0.4); mdBlob(c, -h * 0.1 + sw, -h * 0.7, h * 0.13, leaf, hi); mdBlob(c, h * 0.1 + sw, -h * 0.8, h * 0.14, leaf, hi); mdBlob(c, sw * 1.2, -h * 0.94, h * 0.14, leaf, hi); mdBlob(c, -h * 0.05 + sw, -h * 0.58, h * 0.1, leaf, hi);
  } else if (k === 'dead') {
    c.strokeStyle = '#5a4a3c'; c.lineWidth = h * 0.06; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h * 0.6); c.moveTo(0, -h * 0.35); c.lineTo(-h * 0.2, -h * 0.58); c.moveTo(0, -h * 0.45); c.lineTo(h * 0.2, -h * 0.72); c.moveTo(-h * 0.1, -h * 0.5); c.lineTo(-h * 0.18, -h * 0.72); c.stroke();
  } else if (k === 'bamboo') {
    for (let i = -2; i <= 2; i++) { const hh = h * (0.75 + R() * 0.3), x0 = i * h * 0.07; c.strokeStyle = i % 2 ? '#7fb85a' : '#6aa84a'; c.lineWidth = h * 0.045; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0 + sw * 0.7, -hh); c.stroke(); c.strokeStyle = '#4a7a38'; c.lineWidth = 1.2; for (let j = 1; j < 6; j++) { c.beginPath(); c.moveTo(x0 - 3 + sw * 0.7 * j / 6, -hh * j / 6); c.lineTo(x0 + 3 + sw * 0.7 * j / 6, -hh * j / 6); c.stroke(); } c.fillStyle = '#8fcb62'; mdE(c, x0 + sw * 0.7 + 8, -hh + 4, 9, 2.6, -0.4); mdE(c, x0 + sw * 0.7 - 8, -hh * 0.75, 9, 2.6, 0.4); }
  } else if (k === 'bush' || k === 'fern') {
    if (k === 'fern') { c.strokeStyle = leaf; c.lineWidth = 2.4; c.lineCap = 'round'; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(i * h * 0.12 + sw * 0.5, -h * 0.5, i * h * 0.24 + sw, -h * (0.55 - Math.abs(i) * 0.08)); c.stroke(); } }
    else { mdBlob(c, -h * 0.28, -h * 0.2, h * 0.26, dk); mdBlob(c, h * 0.26, -h * 0.2, h * 0.26, dk); mdBlob(c, 0, -h * 0.3, h * 0.34, leaf, hi); if (f.fruit) { c.fillStyle = '#e8503a'; for (let i = 0; i < 4; i++) mdE(c, (R() - 0.5) * h * 0.6, -h * (0.15 + R() * 0.3), 2.6, 2.6); } if (snowy) { c.fillStyle = '#f4f8fb'; mdE(c, 0, -h * 0.58, h * 0.24, h * 0.07); } }
  } else if (k === 'tuft' || k === 'reed') {
    c.strokeStyle = k === 'reed' ? '#9aa85a' : leaf; c.lineWidth = 2; c.lineCap = 'round'; const n = k === 'reed' ? 6 : 8; for (let i = 0; i < n; i++) { const x0 = (i - n / 2) * 3; c.beginPath(); c.moveTo(x0, 0); c.quadraticCurveTo(x0 + sw * 0.4, -h * 0.5, x0 * 2 + sw * (k === 'reed' ? 0.6 : 1), -h * (0.6 + R() * 0.4)); c.stroke(); } if (k === 'reed') { c.fillStyle = '#7a5a3a'; for (let i = 0; i < 3; i++) mdE(c, (i - 1) * 6 + sw * 0.7, -h * 0.95, 2.6, 7); }
  } else if (k === 'flower') {
    const cols = ['#ff7a9a', '#ffd23a', '#fff', '#b07aff', '#ff9a4a']; c.strokeStyle = '#4f9a4a'; c.lineWidth = 2; for (let i = -1; i <= 1; i++) { const hh = h * (0.7 + R() * 0.3); c.beginPath(); c.moveTo(i * 5, 0); c.quadraticCurveTo(i * 5 + sw * 0.4, -hh * 0.5, i * 7 + sw * 0.7, -hh); c.stroke(); c.fillStyle = cols[(f.seed + i + 5) % 5]; for (let p = 0; p < 5; p++) mdE(c, i * 7 + sw * 0.7 + Math.cos(p * 1.256) * 4, -hh + Math.sin(p * 1.256) * 4, 2.6, 2.6); c.fillStyle = '#ffe9a0'; mdE(c, i * 7 + sw * 0.7, -hh, 2, 2); }
  } else if (k === 'mush') {
    for (let i = 0; i < 3; i++) { const x0 = (i - 1) * h * 0.42, hh = h * (0.5 + 0.3 * R()); c.fillStyle = '#f3ead8'; c.fillRect(x0 - 2.5, -hh, 5, hh); c.fillStyle = i % 2 ? '#e8503a' : '#d9702a'; c.beginPath(); c.ellipse(x0, -hh, h * 0.28, h * 0.2, 0, Math.PI, 0); c.fill(); c.fillStyle = '#fff'; mdE(c, x0 - 4, -hh - 5, 2, 2); mdE(c, x0 + 4, -hh - 8, 2.4, 2.4); }
  } else if (k === 'cactus') {
    c.fillStyle = '#4f9a5a'; c.strokeStyle = '#4f9a5a'; c.lineCap = 'round'; c.lineWidth = h * 0.15; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h * 0.85); c.stroke(); c.lineWidth = h * 0.1; c.beginPath(); c.moveTo(0, -h * 0.4); c.lineTo(-h * 0.22, -h * 0.42); c.lineTo(-h * 0.22, -h * 0.62); c.moveTo(0, -h * 0.55); c.lineTo(h * 0.2, -h * 0.57); c.lineTo(h * 0.2, -h * 0.74); c.stroke(); c.fillStyle = '#ff7a9a'; mdE(c, 0, -h * 0.9, 4, 3);
  } else if (k === 'rock') {
    c.fillStyle = '#8c8c92'; c.beginPath(); c.moveTo(-h * 0.45, 0); c.quadraticCurveTo(-h * 0.42, -h * 0.5, -h * 0.1, -h * 0.6); c.quadraticCurveTo(h * 0.3, -h * 0.65, h * 0.45, 0); c.fill(); c.fillStyle = '#a5a5ab'; c.beginPath(); c.moveTo(-h * 0.3, -h * 0.1); c.quadraticCurveTo(-h * 0.25, -h * 0.45, -h * 0.05, -h * 0.5); c.quadraticCurveTo(h * 0.1, -h * 0.52, h * 0.15, -h * 0.3); c.fill(); if (snowy) { c.fillStyle = '#f4f8fb'; mdE(c, -h * 0.05, -h * 0.58, h * 0.22, h * 0.06); }
  } else if (k === 'dune') {
    c.fillStyle = mdSh(W.pal.g1, 0.05); c.beginPath(); c.moveTo(-h * 1.1, 0); c.quadraticCurveTo(-h * 0.2, -h * 0.7, h * 0.15, -h * 0.55); c.quadraticCurveTo(h * 0.6, -h * 0.35, h * 1.2, 0); c.fill(); c.fillStyle = mdSh(W.pal.g1, -0.07); c.beginPath(); c.moveTo(h * 0.15, -h * 0.55); c.quadraticCurveTo(h * 0.6, -h * 0.35, h * 1.2, 0); c.lineTo(h * 0.3, 0); c.fill();
  } else if (k === 'iceberg') {
    c.fillStyle = '#dff1fa'; c.beginPath(); c.moveTo(-h * 0.5, 0); c.lineTo(-h * 0.32, -h * 0.55); c.lineTo(-h * 0.05, -h * 0.85); c.lineTo(h * 0.2, -h * 0.5); c.lineTo(h * 0.5, 0); c.fill(); c.fillStyle = '#b4dcee'; c.beginPath(); c.moveTo(-h * 0.05, -h * 0.85); c.lineTo(h * 0.2, -h * 0.5); c.lineTo(h * 0.5, 0); c.lineTo(h * 0.1, 0); c.fill();
  } else if (k === 'igloo') {
    c.fillStyle = '#eef6fb'; c.beginPath(); c.arc(0, 0, h * 0.5, Math.PI, 0); c.fill(); c.strokeStyle = '#b9d4e4'; c.lineWidth = 1.4; for (let i = 1; i < 4; i++) { c.beginPath(); c.arc(0, 0, h * 0.5, Math.PI + i * 0.5, Math.PI + i * 0.5 + 0.3); c.stroke(); } c.fillStyle = '#6a8aa8'; c.beginPath(); c.arc(h * 0.05, 0, h * 0.14, Math.PI, 0); c.fill();
  } else if (k === 'barn') {
    c.fillStyle = '#b94a3a'; c.fillRect(-h * 0.45, -h * 0.5, h * 0.9, h * 0.5); c.fillStyle = '#8a3228'; c.beginPath(); c.moveTo(-h * 0.5, -h * 0.5); c.lineTo(0, -h * 0.85); c.lineTo(h * 0.5, -h * 0.5); c.fill(); c.fillStyle = '#f3ead8'; c.fillRect(-h * 0.14, -h * 0.34, h * 0.28, h * 0.34); c.strokeStyle = '#8a3228'; c.lineWidth = 2; c.strokeRect(-h * 0.14, -h * 0.34, h * 0.28, h * 0.34); c.beginPath(); c.moveTo(-h * 0.14, -h * 0.34); c.lineTo(h * 0.14, 0); c.moveTo(h * 0.14, -h * 0.34); c.lineTo(-h * 0.14, 0); c.stroke();
  } else if (k === 'hay') {
    c.fillStyle = '#e0c060'; mdE(c, 0, -h * 0.3, h * 0.34, h * 0.3); c.strokeStyle = '#b89a3c'; c.lineWidth = 1.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(0, -h * 0.3, h * (0.08 + i * 0.07), 0, mdTau); c.stroke(); }
  } else if (k === 'crystal') {
    const cs = ['#b07aff', '#7ad8ff', '#ff8ad8']; for (let i = -1; i <= 1; i++) { c.fillStyle = cs[(i + 1) % 3]; c.beginPath(); c.moveTo(i * h * 0.2 - h * 0.1, 0); c.lineTo(i * h * 0.2 - h * 0.05, -h * (0.55 + 0.2 * (i === 0))); c.lineTo(i * h * 0.2 + h * 0.08, -h * (0.4 + 0.1 * (i === 0))); c.lineTo(i * h * 0.2 + h * 0.12, 0); c.fill(); c.fillStyle = '#fff6'; c.fillRect(i * h * 0.2 - h * 0.05, -h * (0.5 + 0.1 * (i === 0)), 2, h * 0.3); }
    c.globalAlpha = 0.2 + 0.1 * Math.sin(time * 0.003 + f.seed); c.fillStyle = '#d8b8ff'; mdE(c, 0, -h * 0.3, h * 0.6, h * 0.6); c.globalAlpha = 1;
  } else if (k === 'seagrass' || k === 'kelp') {
    c.strokeStyle = k === 'kelp' ? '#7a8a2a' : '#3f9a5a'; c.lineWidth = k === 'kelp' ? 5 : 2.6; c.lineCap = 'round'; const n = k === 'kelp' ? 3 : 6; for (let i = 0; i < n; i++) { const x0 = (i - n / 2) * 5, hh = h * (0.6 + R() * 0.5); c.beginPath(); c.moveTo(x0, 0); for (let j = 1; j <= 8; j++) c.lineTo(x0 + Math.sin(time * 0.0012 + j * 0.7 + i + f.seed) * (4 + j * 2.2), -hh * j / 8); c.stroke(); if (k === 'kelp') { c.fillStyle = '#9aa83a'; for (let j = 2; j <= 8; j += 2) mdE(c, x0 + Math.sin(time * 0.0012 + j * 0.7 + i + f.seed) * (4 + j * 2.2) + 5, -hh * j / 8, 6, 2.5, 0.3); } }
  } else if (k === 'coral') {
    const cs = ['#ff7a8a', '#ffa05a', '#d46aff', '#ff5aa0']; for (let i = -2; i <= 2; i++) { c.strokeStyle = cs[(i + 2 + f.seed) % 4]; c.lineWidth = 5; c.lineCap = 'round'; const hh = h * (0.5 + R() * 0.5); c.beginPath(); c.moveTo(i * 8, 0); c.lineTo(i * 9, -hh); c.moveTo(i * 8.5, -hh * 0.5); c.lineTo(i * 8.5 + 9, -hh * 0.8); c.stroke(); c.fillStyle = c.strokeStyle; mdE(c, i * 9, -hh, 4.5, 4.5); mdE(c, i * 8.5 + 9, -hh * 0.8, 4, 4); }
  } else if (k === 'anemone') {
    for (let i = -4; i <= 4; i++) { c.strokeStyle = i % 2 ? '#ff8ab8' : '#ffb0d0'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(i * 2.5, 0); c.quadraticCurveTo(i * 4 + Math.sin(time * 0.002 + i) * 4, -h * 0.4, i * 6 + Math.sin(time * 0.002 + i) * 6, -h * 0.75); c.stroke(); } c.fillStyle = '#d95a8a'; mdE(c, 0, -2, 12, 6);
  } else if (k === 'tube') {
    c.fillStyle = '#b8789a'; for (let i = -2; i <= 2; i++) { const hh = h * (0.5 + 0.5 * R()); c.fillRect(i * 6 - 2.5, -hh, 5, hh); mdE(c, i * 6, -hh, 3.2, 1.6); }
  } else { mdBlob(c, 0, -h * 0.3, h * 0.3, leaf, hi); }
  /* fuego */
  if (f.burn > 0) {
    const n = Math.round(4 + h / 25); for (let i = 0; i < n; i++) { const fx = (R() - 0.5) * h * 0.5, fy = -h * (0.25 + R() * 0.65), fl = (Math.sin(time * 0.012 + i * 2.1) + 1) * 0.5, r = (4 + fl * 4) * (0.6 + f.burn * 0.5) * (h / 180 + 0.4); c.globalAlpha = 0.85; c.fillStyle = '#ff6a1a'; c.beginPath(); c.moveTo(fx - r, fy + r); c.quadraticCurveTo(fx - r * 0.5, fy - r * 0.6, fx + (fl - 0.5) * 4, fy - r * 1.9); c.quadraticCurveTo(fx + r * 0.6, fy - r * 0.5, fx + r, fy + r); c.fill(); c.fillStyle = '#ffd23a'; c.beginPath(); c.moveTo(fx - r * 0.5, fy + r); c.quadraticCurveTo(fx, fy - r * 0.2, fx, fy - r); c.quadraticCurveTo(fx + r * 0.2, fy, fx + r * 0.5, fy + r); c.fill(); } c.globalAlpha = 1;
  }
  c.restore();
}

/* nido con huevos y polluelos */
function mdDrawNest(c, n, time) {
  c.save(); c.fillStyle = '#7a5a34'; c.beginPath(); c.ellipse(0, -5, 15, 7, 0, 0, Math.PI); c.fill(); c.strokeStyle = '#a07a46'; c.lineWidth = 1.6; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-14 + i * 5.5, -6); c.quadraticCurveTo(-10 + i * 5.5, 2, -8 + i * 5.5, -6); c.stroke(); }
  if (n.stage === 'build') { c.globalAlpha = 0.6; }
  if (n.eggs > 0 && n.stage !== 'chicks') { for (let i = 0; i < n.eggs; i++) { c.fillStyle = n.egg || '#f4efe0'; mdE(c, -5 + i * 6, -9, 3.6, 4.6); c.fillStyle = 'rgba(0,0,0,.12)'; mdE(c, -4 + i * 6, -8, 1.2, 1.6); } }
  if (n.stage === 'chicks') for (let i = 0; i < n.chicks; i++) { const bx = -6 + i * 6; c.fillStyle = n.chickCol || '#f2d36b'; mdE(c, bx, -10 + Math.sin(time * 0.006 + i) * 0.8, 4.4, 4.2); mdE(c, bx + 2, -15, 3.2, 3); c.fillStyle = '#e8903a'; c.beginPath(); c.moveTo(bx + 4.5, -15); c.lineTo(bx + 8, -14); c.lineTo(bx + 4.5, -13); c.fill(); c.fillStyle = '#1b1210'; mdE(c, bx + 3, -15.6, 0.9, 0.9); if (n.hungry) { c.fillStyle = '#d9604a'; c.beginPath(); c.moveTo(bx + 4, -15.5); c.lineTo(bx + 8.5, -17); c.lineTo(bx + 8, -13); c.fill(); } }
  c.restore();
}

/* ---------- cielo ---------- */
function mdSkyColors(p, night, stormy) {
  const day = [['#7fb6e8', '#cfe6f5'], ['#f3a77a', '#ffd9a8']], nt = ['#0d1534', '#2a3a6a'];
  const k = mdCl(1 - night * 1.15, 0, 1); let top = mdMix('#1a2850', '#4f9ae0', k), bot = mdMix('#33406e', '#cfe6f5', k);
  const dusk = mdCl(1 - Math.abs(night - 0.5) * 3.2, 0, 1) * (night > 0.02 && night < 0.98 ? 1 : 0);
  if (dusk > 0) { top = mdMix(top, '#7a6aa8', dusk * 0.55); bot = mdMix(bot, '#ffb27a', dusk * 0.85); }
  if (stormy > 0) { top = mdMix(top, '#4a5360', stormy * 0.8); bot = mdMix(bot, '#8a929a', stormy * 0.8); }
  return [top, bot];
}
function mdDrawSky(c, w, h, E, W, time) {
  const [top, bot] = mdSkyColors(E.p, E.night, E.gloom); const g = c.createLinearGradient(0, 0, 0, h * 0.8); g.addColorStop(0, top); g.addColorStop(1, bot); c.fillStyle = g; c.fillRect(0, 0, w, h);
  if (E.night > 0.35 || (W && W.clim.au && E.night > 0.2)) { c.globalAlpha = mdCl((E.night - 0.3) * 1.6, 0, 1) * (1 - E.gloom * 0.8); c.fillStyle = '#fff'; for (const s of E.stars) { const tw = 0.6 + 0.4 * Math.sin(time * 0.002 + s[2] * 20); c.globalAlpha = c.globalAlpha * 0 + mdCl((E.night - 0.3) * 1.6, 0, 1) * (1 - E.gloom * 0.8) * tw; c.fillRect(s[0] * w, s[1] * h * 0.55, s[2] * 1.8 + 0.8, s[2] * 1.8 + 0.8); } c.globalAlpha = 1; }
  if (E.aurora > 0.05) { c.globalAlpha = E.aurora * 0.45; for (let i = 0; i < 3; i++) { const gg = c.createLinearGradient(0, h * 0.05, 0, h * 0.45); gg.addColorStop(0, 'rgba(90,255,170,0)'); gg.addColorStop(0.5, i % 2 ? '#7a8aff' : '#4aff9a'); gg.addColorStop(1, 'rgba(90,255,170,0)'); c.fillStyle = gg; c.beginPath(); c.moveTo(0, h * 0.4); for (let x = 0; x <= w; x += 30) c.lineTo(x, h * (0.2 + i * 0.05) + Math.sin(x * 0.01 + time * 0.0003 * (i + 1) + i) * 24); c.lineTo(w, h * 0.45); c.lineTo(0, h * 0.45); c.fill(); } c.globalAlpha = 1; }
  /* sol y luna */
  const ang = (E.p) * mdTau - Math.PI / 2, sx = w * (0.5 - Math.cos(ang) * 0.42), sy = h * 0.48 - Math.sin(ang) * h * 0.42;
  if (E.sunAlt > -0.2) { c.globalAlpha = (1 - E.gloom * 0.85); const rg = c.createRadialGradient(sx, sy, 4, sx, sy, 70); rg.addColorStop(0, 'rgba(255,240,190,.9)'); rg.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = rg; c.fillRect(sx - 80, sy - 80, 160, 160); c.fillStyle = E.sunAlt < 0.2 ? '#ffb86a' : '#fff1b0'; mdE(c, sx, sy, 20, 20); c.globalAlpha = 1; }
  if (E.sunAlt < 0.15) { const mx = w - sx, my = h * 0.48 - (h * 0.42 * Math.sin(ang + Math.PI)); c.globalAlpha = mdCl(0.3 - E.sunAlt, 0, 1) * (1 - E.gloom * 0.85); c.fillStyle = '#f4f1e2'; mdE(c, mx, my, 15, 15); c.fillStyle = 'rgba(180,180,190,.4)'; mdE(c, mx - 4, my - 3, 3.5, 3.5); mdE(c, mx + 5, my + 3, 2.5, 2.5); c.globalAlpha = 1; }
}
function mdDrawClouds(c, w, h, E, time, cam) {
  const n = E.clouds; c.save(); for (const cl of n) { const x = ((cl.x * 3000 + time * 0.004 * cl.s * (0.4 + E.wind) - cam * 0.08 * cl.z) % (w + 400) + (w + 400)) % (w + 400) - 200, y = h * cl.y; const sc = cl.r * (0.9 + E.cloud * 0.5), shade = mdCl(1 - E.gloom * 0.75 - E.night * 0.55, 0.25, 1); const col = `rgb(${Math.round(255 * shade)},${Math.round(255 * shade)},${Math.round(255 * (shade * 0.97 + 0.03))})`; c.globalAlpha = (0.5 + E.cloud * 0.5) * (cl.o); c.fillStyle = col; mdE(c, x, y, sc * 1.2, sc * 0.45); mdE(c, x - sc * 0.6, y + sc * 0.08, sc * 0.7, sc * 0.35); mdE(c, x + sc * 0.65, y + sc * 0.1, sc * 0.75, sc * 0.33); mdE(c, x - sc * 0.1, y - sc * 0.22, sc * 0.65, sc * 0.4); } c.restore(); }

/* montañas / colinas lejanas */
function mdDrawFar(c, w, h, W, E, cam, S) {
  const kind = W.far, far = W.pal.far, base = S - 10, shade = mdCl(1 - E.night * 0.6 - E.gloom * 0.25, 0.3, 1), fogc = E.fog;
  const layer = (i, amp, fq, par, col, peak) => { const x0 = cam * par; c.fillStyle = mdMix(col, E.night > 0.5 ? '#1a2038' : '#b8cde0', 1 - shade); c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w + 20; x += 16) { const wx = x + x0; let y; if (peak) { const v = Math.abs(Math.sin(wx * fq) + 0.5 * Math.sin(wx * fq * 2.3 + i)); y = base - 40 - amp * (0.3 + v * 0.7); } else y = base - 30 - amp * (0.5 + 0.35 * Math.sin(wx * fq + i * 2) + 0.15 * Math.sin(wx * fq * 2.7 + i)); c.lineTo(x, y + (2 - i) * 22); } c.lineTo(w, h); c.fill(); };
  if (kind === 'sea' || kind === 'abyss' || kind === 'seaice') return;
  const snowCaps = kind === 'alps' || kind === 'ice' || kind === 'fuji' || kind === 'volcano';
  if (kind === 'alps' || kind === 'volcano') { layer(0, 230, 0.0021, 0.12, far[0], true); layer(1, 170, 0.003, 0.2, far[1], true); layer(2, 120, 0.0042, 0.3, far[2], true); }
  else if (kind === 'canyon') { layer(0, 160, 0.0017, 0.12, far[0], false); layer(1, 120, 0.0023, 0.2, far[1], false); layer(2, 90, 0.0031, 0.3, far[2], false); }
  else if (kind === 'dunes' || kind === 'savanna') { layer(0, 80, 0.0016, 0.1, far[0], false); layer(1, 60, 0.0024, 0.18, far[1], false); layer(2, 40, 0.0032, 0.28, far[2], false); }
  else if (kind === 'coast') { layer(0, 60, 0.002, 0.1, far[0], false); layer(1, 40, 0.003, 0.2, far[1], false); }
  else { layer(0, 130, 0.0018, 0.1, far[0], false); layer(1, 95, 0.0026, 0.2, far[1], false); layer(2, 65, 0.0036, 0.3, far[2], false); }
  if (kind === 'fuji') { const px = w * 0.55 - cam * 0.08 % (w * 1.4); c.fillStyle = mdMix(far[0], '#c8d4ee', 0.3); c.beginPath(); c.moveTo(px - 260, S); c.lineTo(px - 28, S - 250); c.lineTo(px + 28, S - 250); c.lineTo(px + 260, S); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(px - 70, S - 168); c.lineTo(px - 28, S - 250); c.lineTo(px + 28, S - 250); c.lineTo(px + 70, S - 168); c.lineTo(px + 30, S - 186); c.lineTo(px, S - 160); c.lineTo(px - 32, S - 188); c.fill(); }
  if (kind === 'volcano') { const px = w * 0.62 - cam * 0.12 % (w * 1.4); c.fillStyle = '#4a3a3a'; c.beginPath(); c.moveTo(px - 300, S); c.lineTo(px - 50, S - 240); c.lineTo(px + 50, S - 240); c.lineTo(px + 300, S); c.fill(); c.fillStyle = '#ff6a2a'; c.beginPath(); c.moveTo(px - 50, S - 240); c.lineTo(px + 50, S - 240); c.lineTo(px + 10, S - 200); c.lineTo(px - 14, S - 214); c.fill(); }
  if (kind === 'ice') { c.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 4; i++) { const x = ((i * 380 - cam * 0.2) % (w + 400) + w + 400) % (w + 400) - 200; c.beginPath(); c.moveTo(x - 60, S - 40); c.lineTo(x, S - 120 - (i % 2) * 40); c.lineTo(x + 60, S - 40); c.fill(); } }
  if (fogc > 0.05) { const g = c.createLinearGradient(0, S - 200, 0, S); g.addColorStop(0, 'rgba(235,240,245,0)'); g.addColorStop(1, `rgba(235,240,245,${fogc * 0.8})`); c.fillStyle = g; c.fillRect(0, S - 200, w, 200); }
}
