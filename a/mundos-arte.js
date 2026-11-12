/* Cinnavia 7.53 — MUNDOS · dibujo de los animales (todo con código). Cuadrúpedos, aves, nadadores y especiales.
   Todos comparten un estilo tierno: cabeza grande, ojos brillantes, mejillas sonrosadas. Se dibujan mirando a la derecha. */
'use strict';
const mdTau = Math.PI * 2;
const mdE = (c, x, y, rx, ry, rot = 0, fill = true) => { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, mdTau); if (fill) c.fill(); };
function mdSh(col, t) { if (!col) return col; let r, g, b; if (col[0] !== '#') { const m = col.match(/[\d.]+/g); if (!m) return col; r = +m[0]; g = +m[1]; b = +m[2]; } else { let h = col.slice(1); if (h.length === 3) h = h.split('').map((x) => x + x).join(''); const n = parseInt(h, 16); r = n >> 16; g = (n >> 8) & 255; b = n & 255; } const k = t < 0 ? 0 : 255, p = Math.abs(t); r = Math.round(r + (k - r) * p); g = Math.round(g + (k - g) * p); b = Math.round(b + (k - b) * p); return `rgb(${r},${g},${b})`; }
const mdHash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* ojo grande y brillante + mejilla */
function mdEye(c, x, y, r, closed, big) {
  r *= 0.8;
  if (closed) { c.strokeStyle = '#2a1d16'; c.lineWidth = Math.max(1, r * 0.4); c.lineCap = 'round'; c.beginPath(); c.arc(x, y - r * 0.1, r * 0.8, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); return; }
  c.fillStyle = '#17110d'; mdE(c, x, y, r, r * 0.95); c.fillStyle = 'rgba(255,255,255,.55)'; mdE(c, x + r * 0.3, y - r * 0.3, r * 0.2, r * 0.2);
}
const mdBlush = () => {};

/* ------------------------- CUADRÚPEDOS ------------------------- */
function mdDrawQuad(c, a, S, time, P) {
  const L0 = S.look, z = P.sc, u = 18 * z, kid = 1 - P.age;
  const ln = (L0.ln || 1) * u * 0.9, lg = (L0.lg || 0.8) * u * 0.55 * (1 - P.lie * 0.78), bh = u * (L0.hm ? 0.7 : 0.62) * (L0.fl ? 1.12 : 1);
  const cy = -(lg + bh * 0.42), nk = (L0.nk || 0) * u * 0.7;
  const hr = u * (0.27 + (L0.w ? 0.03 : 0)) * (1 + kid * 0.3) * (S.z > 3 ? 0.78 : 1);
  const col = P.col || L0.c, belly = L0.b || col, dark = mdSh(col, -0.28), light = mdSh(col, 0.22);
  const sw = P.moving ? Math.sin(P.ph) : 0, sw2 = P.moving ? Math.sin(P.ph + Math.PI) : 0, amp = (P.run ? 0.62 : 0.36) * (L0.arms ? 0.5 : 1);
  const bob = P.moving ? Math.abs(Math.sin(P.ph)) * u * (P.run ? 0.07 : 0.025) : Math.sin(time * 0.002 + P.id) * u * 0.008 * (1 - P.lie);
  const hx = ln * 0.5 + hr * 0.15, hy = cy - bh * 0.28 - nk + P.hd * (nk * 0.45 + hr * 0.9 + lg * 0.6) * (nk > u * 0.5 ? 1 : 1);
  c.save(); c.translate(0, -bob); c.lineCap = 'round'; c.lineJoin = 'round';
  const leg = (lx, ang, c1, thick, isFront) => { const a1 = ang * amp, x1 = lx + Math.sin(a1) * lg * 0.7; c.strokeStyle = c1; c.lineWidth = thick; c.beginPath(); c.moveTo(lx, cy + bh * 0.3); c.lineTo(x1, bob); c.stroke(); c.fillStyle = L0.dk && !isFront ? c1 : mdSh(c1, -0.22); mdE(c, x1 + u * 0.02, bob - u * 0.015, thick * 0.62, thick * 0.34); };
  const th = u * (L0.lg > 1.5 ? 0.1 : S.z > 2.5 ? 0.26 : 0.17) * (L0.tiny ? 1.1 : 1);
  if (L0.pl) { /* placas del estegosaurio: detrás del cuerpo */ }
  /* patas traseras y cola (detrás) */
  leg(-ln * 0.33, sw, dark, th, false); leg(ln * 0.3, sw2, dark, th, false);
  mdTail(c, L0, col, dark, ln, cy, bh, u, time, P, S);
  /* lana / flequillo */
  if (L0.fl) { c.fillStyle = mdSh(col, -0.06); for (let k = 0; k < 7; k++) { const t = k / 6; mdE(c, (t - 0.5) * ln * 0.95, cy + bh * (0.12 + 0.3 * Math.sin(t * 3.14)), bh * 0.42, bh * 0.4); } }
  /* cuerpo */
  { const g = c.createLinearGradient(0, cy - bh * 0.52, 0, cy + bh * 0.52); g.addColorStop(0, mdSh(col, 0.12)); g.addColorStop(0.55, col); g.addColorStop(1, mdSh(col, -0.3)); c.fillStyle = g; mdE(c, 0, cy, ln * 0.55, bh * 0.52);
    if (!L0.shell && !L0.pig && L0.tl !== 'croc') { c.save(); c.beginPath(); c.ellipse(0, cy, ln * 0.55, bh * 0.52, 0, 0, mdTau); c.clip(); c.strokeStyle = mdSh(col, -0.32); c.globalAlpha = 0.28; c.lineWidth = Math.max(0.6, u * 0.025); c.lineCap = 'round'; c.beginPath(); for (let k = 0; k < 34; k++) { const fx = (mdHash(k * 7 + S.z * 3) - 0.5) * ln * 1.05, fy = cy + (mdHash(k * 5 + 2) - 0.5) * bh * 0.95, fl = u * (0.08 + mdHash(k) * 0.1); c.moveTo(fx, fy); c.lineTo(fx - fl * 0.8, fy + fl * 0.5); } c.stroke(); c.restore(); } }
  if (L0.fl) { c.fillStyle = light; for (let k = 0; k < 6; k++) { const t = k / 5; mdE(c, (t - 0.5) * ln * 0.8, cy - bh * (0.28 + 0.1 * Math.sin(t * 3.14)), bh * 0.3, bh * 0.26); } }
  c.fillStyle = belly; mdE(c, ln * 0.02, cy + bh * 0.22, ln * 0.4, bh * 0.28);
  if (L0.hm === 1) { c.fillStyle = col; mdE(c, ln * 0.22, cy - bh * 0.42, ln * 0.2, bh * 0.28); }
  if (L0.hm === 2) { c.fillStyle = mdSh(col, 0.05); mdE(c, -ln * 0.14, cy - bh * 0.52, ln * 0.14, bh * 0.34); mdE(c, ln * 0.14, cy - bh * 0.52, ln * 0.14, bh * 0.34); }
  /* diseños del pelaje */
  if (L0.pt) { c.save(); c.beginPath(); c.ellipse(0, cy, ln * 0.55, bh * 0.52, 0, 0, mdTau); c.clip(); c.fillStyle = L0.s || '#222';
    if (L0.pt === 'stripes') for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * ln * 0.13 - 3, cy - bh * 0.6); c.quadraticCurveTo(k * ln * 0.13 + 5, cy, k * ln * 0.13 - 2, cy + bh * 0.6); c.lineTo(k * ln * 0.13 + 2, cy + bh * 0.6); c.quadraticCurveTo(k * ln * 0.13 + 9, cy, k * ln * 0.13 + 3, cy - bh * 0.6); c.fill(); }
    else if (L0.pt === 'spots') for (let k = 0; k < 11; k++) mdE(c, (mdHash(k + S.z * 7) - 0.5) * ln * 0.95, cy + (mdHash(k * 3 + 1) - 0.5) * bh * 0.9, u * 0.07, u * 0.06);
    else if (L0.pt === 'patches') for (let k = 0; k < 6; k++) mdE(c, (mdHash(k + S.z * 5) - 0.5) * ln * 0.9, cy + (mdHash(k * 3 + 2) - 0.5) * bh * 0.7, u * (0.13 + mdHash(k) * 0.08), u * (0.1 + mdHash(k + 4) * 0.06), mdHash(k) * 3);
    else if (L0.pt === 'band') c.fillRect(-ln * 0.55, cy + bh * 0.02, ln * 1.1, bh * 0.1);
    else if (L0.pt === 'panda') { mdE(c, -ln * 0.32, cy + bh * 0.2, ln * 0.16, bh * 0.4); mdE(c, ln * 0.3, cy + bh * 0.08, ln * 0.18, bh * 0.5); }
    c.restore(); }
  if (L0.pl) { c.fillStyle = L0.s; for (let k = 0; k < 6; k++) { const t = (k - 2.5) / 3 * ln * 0.42; const hgt = u * (0.3 + 0.12 * Math.sin(k * 1.1)); c.beginPath(); c.moveTo(t - u * 0.1, cy - bh * 0.42); c.lineTo(t, cy - bh * 0.5 - hgt); c.lineTo(t + u * 0.1, cy - bh * 0.42); c.fill(); } }
  if (L0.spk) { c.strokeStyle = L0.s || mdSh(col, -0.35); c.lineWidth = Math.max(1, u * 0.05); c.lineCap = 'round'; const nq = L0.spk === 2 ? 16 : 11; for (let k = 0; k < nq; k++) { const t = k / (nq - 1), ax = (t - 0.5) * ln * 1.0, ay = cy - bh * 0.25 * Math.sin(t * 3.14) - bh * 0.2, ang = -Math.PI / 2 - (t - 0.5) * 1.6 + Math.sin(time * 0.002 + k) * 0.04; const len = u * (L0.spk === 2 ? 0.75 : 0.42) * (0.7 + 0.3 * Math.sin(t * 3.14)); c.beginPath(); c.moveTo(ax, ay + bh * 0.2); c.lineTo(ax + Math.cos(ang) * len, ay + Math.sin(ang) * len); c.stroke(); } if (L0.spk === 2) { c.strokeStyle = '#f4efe0'; c.lineWidth = Math.max(0.6, u * 0.025); for (let k = 0; k < nq; k += 2) { const t = k / (nq - 1), ax = (t - 0.5) * ln, ay = cy - bh * 0.25 * Math.sin(t * 3.14) - bh * 0.2, ang = -Math.PI / 2 - (t - 0.5) * 1.6; const len = u * 0.75 * (0.7 + 0.3 * Math.sin(t * 3.14)); c.beginPath(); c.moveTo(ax + Math.cos(ang) * len * 0.6, ay + Math.sin(ang) * len * 0.6); c.lineTo(ax + Math.cos(ang) * len, ay + Math.sin(ang) * len); c.stroke(); } } }
  if (L0.shell) { c.strokeStyle = mdSh(col, -0.25); c.lineWidth = Math.max(1, u * 0.04); for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(k * ln * 0.12, cy - bh * 0.5); c.quadraticCurveTo(k * ln * 0.13 + 2, cy, k * ln * 0.12, cy + bh * 0.35); c.stroke(); } }
  /* patas delanteras */
  leg(-ln * 0.17, sw2, col, th, true); leg(ln * 0.4, sw, col, th, true);
  if (L0.mn === 1 && nk > 0 || L0.mn === 1) { c.fillStyle = dark; for (let k = 0; k < 5; k++) { const t = k / 4; mdE(c, ln * 0.32 + (hx - ln * 0.32) * t * 0.7, cy - bh * 0.4 + (hy - cy + bh * 0.4) * t * 0.7 - hr * 0.5, u * 0.07, u * 0.12, 0.5); } }
  /* cuello */
  if (nk > 1) { c.strokeStyle = col; c.lineWidth = hr * (L0.nk > 2 ? 0.95 : 1.15); c.beginPath(); c.moveTo(ln * 0.34, cy - bh * 0.15); c.quadraticCurveTo(ln * 0.45, (cy + hy) / 2, hx - hr * 0.2, hy + hr * 0.35); c.stroke();
    if (L0.pt === 'patches') { c.strokeStyle = L0.s; c.lineWidth = hr * 0.25; c.setLineDash([hr * 0.25, hr * 0.9]); c.beginPath(); c.moveTo(ln * 0.34, cy - bh * 0.15); c.quadraticCurveTo(ln * 0.45, (cy + hy) / 2, hx - hr * 0.2, hy + hr * 0.35); c.stroke(); c.setLineDash([]); } }
  if (L0.arms) { c.strokeStyle = dark; c.lineWidth = u * 0.13; c.beginPath(); c.moveTo(ln * 0.3, cy); c.quadraticCurveTo(ln * 0.5, cy + bh * 0.8, ln * 0.4 + sw * u * 0.1, cy + bh * 1.05); c.stroke(); }
  if (L0.tiny) { c.strokeStyle = dark; c.lineWidth = u * 0.1; c.beginPath(); c.moveTo(ln * 0.38, cy + bh * 0.1); c.lineTo(ln * 0.5, cy + bh * 0.42); c.stroke(); }
  mdQuadHead(c, a, S, L0, P, hx, hy, hr, col, dark, light, u, time);
  if (P.carry) { c.fillStyle = '#7a5a34'; c.fillRect(hx + hr * 0.4, hy + hr * 0.2, u * 0.7, u * 0.07); }
  c.restore();
}
function mdTail(c, L0, col, dark, ln, cy, bh, u, time, P, S) {
  const tx = -ln * 0.5, ty = cy - bh * 0.1, w = Math.sin(time * 0.004 + P.id) * u * 0.06 + (P.moving ? Math.sin(P.ph * 1.2) * u * 0.08 : 0), t = L0.tl || 'short';
  c.strokeStyle = col; c.fillStyle = col; c.lineCap = 'round';
  if (t === 'short') { c.lineWidth = u * 0.14; c.beginPath(); c.moveTo(tx, ty); c.lineTo(tx - u * 0.18, ty - u * 0.1 + w * 0.5); c.stroke(); }
  else if (t === 'fluff') { c.fillStyle = L0.tip ? col : mdSh(col, 0.18); mdE(c, tx - u * 0.12, ty - u * 0.04 + w * 0.4, u * 0.2, u * 0.17); if (L0.tip) { c.fillStyle = L0.tip; mdE(c, tx - u * 0.3, ty - u * 0.06 + w * 0.4, u * 0.1, u * 0.1); } }
  else if (t === 'tuft') { c.lineWidth = u * 0.07; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx - u * 0.22, ty + u * 0.2, tx - u * 0.18 + w, ty + u * 0.55); c.stroke(); c.fillStyle = dark; mdE(c, tx - u * 0.18 + w, ty + u * 0.58, u * 0.08, u * 0.14); }
  else if (t === 'long' || t === 'longfluff') { c.lineWidth = t === 'long' ? u * 0.09 : u * 0.2; c.beginPath(); c.moveTo(tx, ty); c.bezierCurveTo(tx - u * 0.35, ty + u * 0.1, tx - u * 0.45 + w, ty - u * 0.25, tx - u * 0.7 + w, ty - u * 0.12); c.stroke(); }
  else if (t === 'bushy') { c.fillStyle = col; c.save(); c.translate(tx, ty); c.rotate(-0.9 + w * 0.03); mdE(c, -u * 0.1, -u * 0.35, u * 0.22, u * 0.5); c.fillStyle = mdSh(col, 0.2); mdE(c, -u * 0.05, -u * 0.3, u * 0.12, u * 0.36); c.restore(); }
  else if (t === 'curl') { c.lineWidth = u * 0.06; c.beginPath(); c.arc(tx - u * 0.08, ty - u * 0.08, u * 0.1, 0.4, 5.2); c.stroke(); }
  else if (t === 'paddle') { c.fillStyle = dark; mdE(c, tx - u * 0.28, ty + u * 0.1, u * 0.3, u * 0.12, 0.2); }
  else if (t === 'croc') { c.beginPath(); c.moveTo(tx, ty - u * 0.1); c.quadraticCurveTo(tx - u * 0.5, ty + u * 0.1 + w, tx - u * 0.9, ty + u * 0.25 + w); c.quadraticCurveTo(tx - u * 0.4, ty + u * 0.12, tx, ty + u * 0.12); c.fill(); }
  else if (t === 'thick') { c.beginPath(); c.moveTo(tx, ty - u * 0.2); c.quadraticCurveTo(tx - u * 0.6, ty + u * 0.05 + w, tx - u * 1.05, ty + u * 0.12 + w); c.quadraticCurveTo(tx - u * 0.5, ty + u * 0.35, tx, ty + u * 0.3); c.fill(); }
  else if (t === 'spike') { c.beginPath(); c.moveTo(tx, ty - u * 0.12); c.quadraticCurveTo(tx - u * 0.5, ty + u * 0.1 + w, tx - u * 0.85, ty - u * 0.05 + w); c.quadraticCurveTo(tx - u * 0.45, ty + u * 0.22, tx, ty + u * 0.16); c.fill(); c.fillStyle = '#efe6d0'; for (const k of [0, 1]) { c.beginPath(); c.moveTo(tx - u * (0.75 + k * 0.08), ty - u * 0.03 + w); c.lineTo(tx - u * (0.98 + k * 0.1), ty - u * (0.2 - k * 0.3) + w); c.lineTo(tx - u * (0.85 + k * 0.08), ty + u * 0.02 + w); c.fill(); } }
  else if (t === 'long' && false) { /* reservado */ }
  else if (t === 'rainbow') { const cs = ['#ff6a8a', '#ffb23c', '#6bd66b', '#4aa8ff', '#b06bff']; c.lineWidth = u * 0.06; for (let k = 0; k < 5; k++) { c.strokeStyle = cs[k]; c.beginPath(); c.moveTo(tx, ty); c.bezierCurveTo(tx - u * 0.3, ty + k * u * 0.05, tx - u * 0.5 + w, ty - u * 0.2 + k * u * 0.1, tx - u * 0.75 + w, ty + k * u * 0.1); c.stroke(); } }
}
function mdQuadHead(c, a, S, L0, P, hx, hy, hr, col, dark, light, u, time) {
  const male = P.male, kid = 1 - P.age, bl = L0.b || col;
  /* melena de león */
  if (L0.mn === 'lion' && male && P.age > 0.8) { c.fillStyle = '#8a5a2c'; mdE(c, hx - hr * 0.15, hy + hr * 0.05, hr * 1.35, hr * 1.3); c.fillStyle = '#a8742f'; mdE(c, hx - hr * 0.2, hy, hr * 1.08, hr * 1.04); }
  if (L0.mn === 'rainbow') { const cs = ['#ff6a8a', '#ffb23c', '#ffe066', '#6bd66b', '#4aa8ff', '#b06bff']; cs.forEach((q, k) => { c.fillStyle = q; mdE(c, hx - hr * (0.55 + k * 0.1), hy - hr * (0.2 - k * 0.12), hr * 0.3, hr * 0.5, 0.6); }); }
  /* orejas lejanas */
  const ear = (dx, back) => mdEar(c, L0.e || 'round', hx + dx, hy, hr, back ? dark : col, bl, time, P, u, back);
  if (L0.e) ear(-hr * 0.55, true);
  /* cuernos lejanos */
  mdHorns(c, L0, male, P, hx, hy, hr, u, true);
  if (L0.fr) { c.fillStyle = L0.s; mdE(c, hx - hr * 0.5, hy - hr * 0.35, hr * 1.1, hr * 1.25, 0.2); c.fillStyle = mdSh(L0.s, 0.35); for (let k = 0; k < 5; k++) mdE(c, hx - hr * (0.1 + 0.12 * Math.abs(k - 2)), hy - hr * (1.2 - k * 0.26), hr * 0.1, hr * 0.1); }
  /* trompa */
  if (L0.tr) { c.strokeStyle = col; c.lineCap = 'round'; c.lineWidth = hr * 0.78; const sw = Math.sin(time * 0.003 + P.id) * hr * 0.2 + (P.moving ? Math.sin(P.ph) * hr * 0.15 : 0); c.beginPath(); c.moveTo(hx + hr * 0.55, hy + hr * 0.15); c.bezierCurveTo(hx + hr * 1.2, hy + hr * 0.5, hx + hr * 1.3 + sw, hy + hr * 1.6, hx + hr * 0.9 + sw, hy + hr * 2.3 + P.hd * hr * 0.4); c.stroke(); c.strokeStyle = dark; c.lineWidth = hr * 0.07; for (let k = 1; k < 5; k++) { const t = k / 5; c.beginPath(); c.moveTo(hx + hr * (0.8 + t * 0.3) - hr * 0.2, hy + hr * (0.4 + t * 1.6)); c.lineTo(hx + hr * (0.8 + t * 0.3) + hr * 0.2, hy + hr * (0.4 + t * 1.6)); c.stroke(); } }
  /* cabeza */
  c.fillStyle = col; mdE(c, hx, hy, hr, hr * 0.94);
  c.fillStyle = mdSh(col, 0.12); mdE(c, hx - hr * 0.1, hy - hr * 0.2, hr * 0.7, hr * 0.5);
  if (L0.arms) { c.fillStyle = bl; mdE(c, hx + hr * 0.22, hy + hr * 0.08, hr * 0.66, hr * 0.62); }
  /* hocico */
  const sn = (L0.n || 0.3) * u * 0.62, sx = hx + hr * 0.5, sy = hy + hr * 0.24;
  c.fillStyle = L0.pig ? '#f2a0a0' : L0.mask ? '#d9cdb0' : bl;
  if (L0.box) { c.fillStyle = mdSh(col, 0.08); mdE(c, sx + sn * 0.45, sy - hr * 0.05, sn * 0.75 + hr * 0.25, hr * 0.62); }
  else if (L0.w) { mdE(c, sx + sn * 0.3, sy + hr * 0.05, sn * 0.6 + hr * 0.5, hr * 0.62); c.fillStyle = mdSh(col, -0.25); mdE(c, sx + sn * 0.5 + hr * 0.2, sy - hr * 0.1, hr * 0.07, hr * 0.05); mdE(c, sx + sn * 0.2 + hr * 0.05, sy - hr * 0.2, hr * 0.07, hr * 0.05); }
  else if (!L0.tr) mdE(c, sx + sn * 0.35, sy, sn * 0.55 + hr * 0.2, hr * (0.38 + (L0.pig ? 0.2 : 0)));
  if (L0.pig) { c.fillStyle = '#d97c88'; mdE(c, sx + sn * 0.7 + hr * 0.1, sy, hr * 0.14, hr * 0.26); }
  if (L0.nose) { c.fillStyle = '#2a2a2f'; mdE(c, sx + hr * 0.15, hy + hr * 0.05, hr * 0.3, hr * 0.38); }
  else if (!L0.tr && !L0.pig && !L0.w) { c.fillStyle = L0.pt === 'panda' || col === '#ffffff' ? '#2a2a2f' : mdSh(col, -0.55); mdE(c, sx + sn * 0.85 + hr * 0.1, sy - hr * 0.1, hr * 0.15, hr * 0.12); }
  if (L0.mask) { c.fillStyle = '#4a3d2a'; mdE(c, hx + hr * 0.2, hy - hr * 0.1, hr * 0.5, hr * 0.28, -0.3); }
  if (L0.pt === 'panda') { c.fillStyle = '#232328'; mdE(c, hx + hr * 0.3, hy - hr * 0.1, hr * 0.26, hr * 0.34, 0.5); }
  if (L0.rhino) { /* nada */ }
  /* boca y dientes */
  c.strokeStyle = '#4a2a20'; c.lineWidth = Math.max(1, hr * 0.08);
  if (P.sleeping) { c.beginPath(); c.arc(sx + sn * 0.5, sy + hr * 0.12, hr * 0.12, 0.2, 2.9); c.stroke(); }
  else if (P.mouth) { c.fillStyle = '#7a2a2a'; mdE(c, sx + sn * 0.6, sy + hr * 0.3, hr * 0.28, hr * 0.2); }
  else if (P.fed) { c.beginPath(); c.moveTo(sx + sn * 0.3, sy + hr * 0.14); c.lineTo(sx + sn * 0.64, sy + hr * 0.1); c.stroke(); }
  else { c.beginPath(); c.moveTo(sx + sn * 0.3, sy + hr * 0.14); c.lineTo(sx + sn * 0.64, sy + hr * 0.1); c.stroke(); }
  if (L0.teeth) { c.fillStyle = '#fff'; c.fillRect(sx + sn * 0.45, sy + hr * 0.08, hr * 0.12, hr * 0.28); if (L0.teeth === 2) { for (let k = 0; k < 4; k++) c.fillRect(sx + sn * (0.2 + k * 0.28), sy + hr * 0.08, hr * 0.07, hr * 0.14); } }
  /* ojo y mejilla */
  const ex = hx + hr * 0.3, ey = hy - hr * 0.12; mdEye(c, ex, ey, hr * (0.2 + kid * 0.09), P.eyesClosed, false); mdBlush(c, hx - hr * 0.05, hy + hr * 0.38, hr * 0.2);
  if (L0.pt === 'panda') { /* ojo sobre el parche */ }
  /* barba / colmillos */
  if (L0.bd) { c.fillStyle = mdSh(col, -0.2); c.beginPath(); c.moveTo(sx + sn * 0.3, sy + hr * 0.3); c.lineTo(sx + sn * 0.5, sy + hr * 0.95); c.lineTo(sx + sn * 0.7, sy + hr * 0.35); c.fill(); }
  if (L0.tk) { c.strokeStyle = '#f6eed8'; c.lineWidth = hr * 0.26; c.beginPath(); c.moveTo(hx + hr * 0.5, hy + hr * 0.55); c.quadraticCurveTo(hx + hr * 1.15, hy + hr * 1.1, hx + hr * 1.35, hy + hr * 0.6); c.stroke(); }
  /* cuerno / oreja cercana */
  mdHorns(c, L0, male, P, hx, hy, hr, u, false);
  if (L0.e) mdEar(c, L0.e, hx - hr * 0.1, hy, hr, col, bl, time, P, u, false);
  if (L0.e === 'big' && false) { /* nada */ }
}
function mdEar(c, kind, x, y, hr, col, inner, time, P, u, back) {
  const tw = Math.sin(time * 0.003 + P.id * 2) * 0.06, top = y - hr * 0.75;
  c.fillStyle = col;
  if (kind === 'round') { mdE(c, x - hr * 0.1, top, hr * 0.38, hr * 0.38); if (!back) { c.fillStyle = '#a8807a'; mdE(c, x - hr * 0.1, top + hr * 0.04, hr * 0.2, hr * 0.2); } }
  else if (kind === 'roundbig') { mdE(c, x - hr * 0.2, top - hr * 0.05, hr * 0.55, hr * 0.55); if (!back) { c.fillStyle = '#c2aeaa'; mdE(c, x - hr * 0.2, top - hr * 0.03, hr * 0.34, hr * 0.34); } }
  else if (kind === 'point') { c.beginPath(); c.moveTo(x - hr * 0.45, top + hr * 0.25); c.lineTo(x - hr * 0.3 + tw * hr, top - hr * 0.6); c.lineTo(x + hr * 0.05, top + hr * 0.2); c.fill(); if (!back) { c.fillStyle = '#a8807a'; c.beginPath(); c.moveTo(x - hr * 0.32, top + hr * 0.15); c.lineTo(x - hr * 0.28 + tw * hr, top - hr * 0.35); c.lineTo(x - hr * 0.08, top + hr * 0.15); c.fill(); } }
  else if (kind === 'long') { c.save(); c.translate(x - hr * 0.15, top + hr * 0.2); c.rotate(-0.28 + (back ? 0.3 : 0) + tw); mdE(c, 0, -hr * 0.85, hr * 0.28, hr * 0.95); if (!back) { c.fillStyle = '#a8807a'; mdE(c, 0, -hr * 0.8, hr * 0.14, hr * 0.7); } c.restore(); }
  else if (kind === 'huge') { c.save(); c.translate(x - hr * 0.1, top + hr * 0.3); c.rotate(-0.12 + (back ? 0.2 : 0) + tw); c.beginPath(); c.moveTo(-hr * 0.4, 0); c.lineTo(-hr * 0.1, -hr * 2); c.lineTo(hr * 0.35, 0); c.fill(); if (!back) { c.fillStyle = '#a8807a'; c.beginPath(); c.moveTo(-hr * 0.22, 0); c.lineTo(-hr * 0.08, -hr * 1.5); c.lineTo(hr * 0.2, 0); c.fill(); } c.restore(); }
  else if (kind === 'banana') { c.save(); c.translate(x - hr * 0.1, top + hr * 0.2); c.rotate(-0.1 + tw); mdE(c, -hr * 0.1, -hr * 0.6, hr * 0.2, hr * 0.8, -0.2); c.restore(); }
  else if (kind === 'small') { mdE(c, x - hr * 0.2, top + hr * 0.2, hr * 0.2, hr * 0.2); }
  else if (kind === 'floppy') { c.save(); c.translate(x - hr * 0.1, top + hr * 0.3); c.rotate(0.5 + tw); mdE(c, -hr * 0.2, hr * 0.28, hr * 0.3, hr * 0.5); c.restore(); }
  else if (kind === 'tuftear') { c.beginPath(); c.moveTo(x - hr * 0.4, top + hr * 0.3); c.lineTo(x - hr * 0.3, top - hr * 0.5); c.lineTo(x, top + hr * 0.25); c.fill(); c.fillStyle = '#7a4a24'; mdE(c, x - hr * 0.3, top - hr * 0.55, hr * 0.08, hr * 0.2); }
  else if (kind === 'big') { c.save(); c.translate(x - hr * 0.3, y - hr * 0.1); c.rotate(-0.12 + Math.sin(time * 0.004 + P.id) * 0.06); mdE(c, 0, 0, hr * 0.85, hr * 1.1); if (!back) { c.fillStyle = '#d9a8a8'; mdE(c, hr * 0.05, hr * 0.05, hr * 0.55, hr * 0.8); } c.restore(); }
}
function mdHorns(c, L0, male, P, hx, hy, hr, u, back) {
  const h = L0.hn; if (!h) return; const top = hy - hr * 0.8, kid = P.age < 0.5;
  if (h === 'antler') { if (!male || kid) return; c.strokeStyle = back ? '#7a5a3a' : '#a07a52'; c.lineWidth = hr * 0.14; c.lineCap = 'round'; const sx = hx - hr * (back ? 0.4 : 0.05); c.beginPath(); c.moveTo(sx, top + hr * 0.2); c.quadraticCurveTo(sx - hr * 0.3, top - hr * 0.6, sx + hr * 0.05, top - hr * 1.2); c.moveTo(sx - hr * 0.2, top - hr * 0.35); c.lineTo(sx - hr * 0.55, top - hr * 0.7); c.moveTo(sx - hr * 0.1, top - hr * 0.75); c.lineTo(sx + hr * 0.35, top - hr * 0.95); c.stroke(); }
  else if (h === 'palm') { if (!male || kid) return; c.fillStyle = back ? '#8a6a4a' : '#a88358'; const sx = hx - hr * (back ? 0.4 : 0.05); c.beginPath(); c.moveTo(sx, top + hr * 0.2); c.lineTo(sx - hr * 0.5, top - hr * 0.5); c.lineTo(sx - hr * 0.2, top - hr * 0.3); c.lineTo(sx - hr * 0.35, top - hr * 0.95); c.lineTo(sx + hr * 0.05, top - hr * 0.55); c.lineTo(sx + hr * 0.2, top - hr * 1.0); c.lineTo(sx + hr * 0.3, top - hr * 0.2); c.lineTo(sx + hr * 0.2, top + hr * 0.25); c.fill(); }
  else if (h === 'horns' || h === 'curve' || h === 'smallhorn') { if (kid && h !== 'smallhorn') return; c.strokeStyle = back ? '#7a6a58' : '#d8c9aa'; c.lineWidth = hr * (h === 'smallhorn' ? 0.2 : 0.22); c.lineCap = 'round'; const sx = hx - hr * (back ? 0.4 : 0.05); const k = h === 'curve' ? 1.8 : h === 'smallhorn' ? 0.5 : 1; c.beginPath(); c.moveTo(sx, top + hr * 0.25); c.quadraticCurveTo(sx - hr * 0.35 * k, top - hr * 0.5 * k, sx - hr * (h === 'curve' ? 1 : 0.3) * k, top - hr * (h === 'curve' ? 0.2 : 0.85) * k); c.stroke(); }
  else if (h === 'knob') { c.strokeStyle = col2(L0); c.lineWidth = hr * 0.12; c.beginPath(); const sx = hx - hr * (back ? 0.3 : 0.05); c.moveTo(sx, top + hr * 0.25); c.lineTo(sx - hr * 0.08, top - hr * 0.45); c.stroke(); c.fillStyle = '#6a4a2a'; mdE(c, sx - hr * 0.08, top - hr * 0.5, hr * 0.14, hr * 0.14); }
  else if (h === 'rhino' && !back) { c.fillStyle = '#efe6d0'; c.beginPath(); c.moveTo(hx + hr * 0.55, hy - hr * 0.05); c.quadraticCurveTo(hx + hr * 0.95, hy - hr * 0.15, hx + hr * 1.05, hy - hr * 0.95); c.lineTo(hx + hr * 0.3, hy - hr * 0.35); c.fill(); }
  else if (h === 'unicorn' && !back) { c.fillStyle = '#fff3a8'; c.beginPath(); c.moveTo(hx + hr * 0.2, top + hr * 0.15); c.lineTo(hx + hr * 0.5, top - hr * 1.5); c.lineTo(hx + hr * 0.62, top + hr * 0.2); c.fill(); c.strokeStyle = '#e8a8f0'; c.lineWidth = hr * 0.08; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(hx + hr * (0.24 + k * 0.05), top - hr * (0.2 + k * 0.28)); c.lineTo(hx + hr * (0.56 + k * 0.0), top - hr * (0.08 + k * 0.28)); c.stroke(); } }
  else if (h === 'trike' && !back) { c.fillStyle = '#f2ead0'; for (const q of [[-0.15, 1], [0.15, 0.8]]) { c.beginPath(); c.moveTo(hx + hr * q[0], top + hr * 0.3); c.lineTo(hx + hr * (q[0] + 0.55), top - hr * 0.9 * q[1]); c.lineTo(hx + hr * (q[0] + 0.3), top + hr * 0.4); c.fill(); } c.beginPath(); c.moveTo(hx + hr * 0.7, hy); c.lineTo(hx + hr * 1.15, hy - hr * 0.55); c.lineTo(hx + hr * 0.95, hy + hr * 0.15); c.fill(); }
}
const col2 = (L0) => L0.c;

/* ------------------------- AVES ------------------------- */
function mdDrawBird(c, a, S, time, P) {
  const L = S.look, u = 18 * P.sc, kid = 1 - P.age, col = P.col || L.c, belly = L.b || col, fly = P.flying, up = fly ? 0.15 : (L.up || 0), run = L.run;
  const flap = fly ? Math.sin(time * 0.02 + P.id * 3) : P.moving ? Math.sin(P.ph) * 0.2 : 0;
  const legL = (L.leg === 'long' ? 1.1 : 0.34) * u * (fly ? 0.7 : 1) * (P.lie ? 0.2 : 1), nkL = (L.neck || 0) * u * 0.8 * (fly ? 0.55 : 1);
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const bw = u * (L.big ? 0.62 : 0.52), bhh = u * 0.42 * (L.up ? 1.15 : 1);
  const cy = -(legL + bhh * 0.85 + up * u * 0.2), tilt = fly ? -0.12 : (L.up ? -0.08 : 0);
  const hr = u * (0.26 + (L.eyes ? 0.06 : 0)) * (1 + kid * 0.5), hx = bw * (0.55 - up * 0.5) + hr * 0.25, hy = cy - bhh * (0.6 + up * 0.5) - nkL;
  /* patas */
  if (!fly) { c.strokeStyle = L.leg === 'long' ? '#e08a9a' : (L.lc || '#d9922a'); c.lineWidth = u * 0.07; const sw = P.moving ? Math.sin(P.ph) * u * (run ? 0.25 : 0.12) : 0; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(k * bw * 0.22, cy + bhh * 0.6); c.lineTo(k * bw * 0.22 + (k > 0 ? sw : -sw), 0); c.stroke(); c.beginPath(); c.moveTo(k * bw * 0.22 + (k > 0 ? sw : -sw), 0); c.lineTo(k * bw * 0.22 + (k > 0 ? sw : -sw) + u * 0.12, 0); c.stroke(); } }
  c.save(); c.translate(0, cy); c.rotate(tilt);
  /* cola */
  c.fillStyle = L.tail === 'long' ? mdSh(col, -0.1) : mdSh(col, -0.2);
  if (L.tail === 'peacock') { const open = P.moving ? 0.25 : 0.6 + 0.4 * Math.sin(time * 0.0015 + P.id); if (open > 0.4) { for (let k = 0; k < 13; k++) { const ang = -Math.PI * (0.15 + 0.7 * k / 12) * (0.5 + open * 0.5) - 0.2; const len = u * 1.7 * open; c.strokeStyle = '#3a8a5a'; c.lineWidth = u * 0.14; c.beginPath(); c.moveTo(-bw * 0.5, -bhh * 0.2); c.lineTo(-bw * 0.5 + Math.cos(ang) * len, -bhh * 0.2 + Math.sin(ang) * len); c.stroke(); c.fillStyle = '#e8c23a'; mdE(c, -bw * 0.5 + Math.cos(ang) * len, -bhh * 0.2 + Math.sin(ang) * len, u * 0.13, u * 0.15); c.fillStyle = '#2a5ad8'; mdE(c, -bw * 0.5 + Math.cos(ang) * len, -bhh * 0.2 + Math.sin(ang) * len, u * 0.07, u * 0.08); } } else { c.fillStyle = '#3a8a5a'; mdE(c, -bw * 1.4, bhh * 0.35, bw * 1.0, u * 0.14, 0.12); c.fillStyle = '#2a5ad8'; for (let k = 0; k < 4; k++) mdE(c, -bw * (0.9 + k * 0.3), bhh * (0.3 + k * 0.03), u * 0.05, u * 0.05); } }
  else if (L.tail === 'fork') { c.beginPath(); c.moveTo(-bw * 0.8, -bhh * 0.1); c.lineTo(-bw * 1.6, -bhh * 0.15); c.lineTo(-bw * 1.1, bhh * 0.15); c.lineTo(-bw * 1.6, bhh * 0.5); c.lineTo(-bw * 0.7, bhh * 0.4); c.fill(); }
  else if (L.tail === 'fan') { for (let k = -2; k <= 2; k++) { c.save(); c.translate(-bw * 0.85, bhh * 0.05); c.rotate(k * 0.25 + 0.2); mdE(c, -u * 0.25, 0, u * 0.32, u * 0.1); c.restore(); } }
  else if (L.tail === 'long') { mdE(c, -bw * 1.2, bhh * 0.2, bw * 0.7, u * 0.1, 0.35); mdE(c, -bw * 1.2, bhh * 0.3, bw * 0.6, u * 0.08, 0.5); }
  else if (L.tail === 'fluff') { for (let k = 0; k < 5; k++) mdE(c, -bw * 0.95 - k * u * 0.04, -bhh * 0.4 + k * u * 0.11, u * 0.22, u * 0.12, -0.5); }
  else { c.beginPath(); c.moveTo(-bw * 0.8, -bhh * 0.1); c.lineTo(-bw * 1.4, bhh * 0.3); c.lineTo(-bw * 0.7, bhh * 0.45); c.fill(); }
  /* cuerpo */
  c.fillStyle = col; if (L.up) mdE(c, 0, -bhh * 0.1, bw * 0.78, bhh * 1.05); else mdE(c, 0, 0, bw, bhh);
  c.fillStyle = belly; if (L.up) mdE(c, bw * 0.12, bhh * 0.02, bw * 0.55, bhh * 0.78); else mdE(c, bw * 0.12, bhh * 0.22, bw * 0.7, bhh * 0.6);
  if (L.s && L.up && L.c === '#f7f9fb') { c.fillStyle = L.s; for (let k = 0; k < 7; k++) mdE(c, (mdHash(k) - 0.5) * bw * 1.1, (mdHash(k + 3) - 0.5) * bhh * 1.3, u * 0.04, u * 0.03); }
  /* cuello */
  if (nkL > 0) { c.strokeStyle = L.neck > 0.8 ? col : col; c.lineWidth = hr * 0.75; c.beginPath(); c.moveTo(bw * 0.55, cy * 0 - bhh * 0.2); c.quadraticCurveTo(bw * 0.9, -nkL * 0.5, hx - 0 - bw * 0.0 + hr * 0.0, hy - cy + hr * 0.1); c.stroke(); }
  /* ala */
  const wingCol = L.wing || mdSh(col, -0.18); c.fillStyle = wingCol;
  if (fly) { c.save(); c.translate(-bw * 0.05, -bhh * 0.4); const ang = flap * 0.95; c.rotate(-0.3 - ang * 0.5); mdE(c, -bw * 0.2, -u * 0.5 * (0.6 + 0.4 * Math.abs(flap)), u * 0.2, u * (0.5 + L.big * 0.2 || 0.5)); c.restore(); c.save(); c.translate(-bw * 0.05, -bhh * 0.35); c.rotate(0.3 + ang * 0.4); c.globalAlpha = 0.6; mdE(c, -bw * 0.1, -u * 0.4, u * 0.16, u * 0.42); c.globalAlpha = 1; c.restore(); }
  else if (L.big && L.beak === 'hook') { mdE(c, -bw * 0.2, bhh * 0.05, bw * 0.55, bhh * 0.5, 0.15); }
  else if (L.up) { c.save(); c.translate(-bw * 0.05, -bhh * 0.15); c.rotate(0.12 + (P.moving ? Math.sin(P.ph * 2) * 0.25 : 0)); mdE(c, 0, bhh * 0.3, bw * 0.22, bhh * 0.7); c.restore(); }
  else { mdE(c, -bw * 0.18, bhh * 0.02, bw * 0.55, bhh * 0.5, 0.15 + flap * 0.4); }
  /* cabeza */
  const hdx = hx, hdy = hy - cy + (P.hd ? P.hd * u * 0.25 : 0);
  if (L.ruff) { c.fillStyle = '#f2efe6'; mdE(c, bw * 0.55, hdy + hr * 0.9 + nkL * 0.0, hr * 1.1, hr * 0.5); }
  if (L.crest === 'tuft') { c.fillStyle = mdSh(col, -0.15); c.beginPath(); c.moveTo(hdx - hr * 0.3, hdy - hr * 0.8); c.lineTo(hdx - hr * 0.55, hdy - hr * 1.7); c.lineTo(hdx + hr * 0.05, hdy - hr * 0.85); c.fill(); }
  if (L.crest === 'comb') { c.fillStyle = '#e84a4a'; for (let k = 0; k < 3; k++) mdE(c, hdx - hr * 0.3 + k * hr * 0.3, hdy - hr * 1.0, hr * 0.2, hr * 0.26); mdE(c, hdx + hr * 0.7, hdy + hr * 0.75, hr * 0.14, hr * 0.28); }
  if (L.crest === 'ptero') { c.fillStyle = '#d9604a'; c.beginPath(); c.moveTo(hdx - hr * 0.2, hdy - hr * 0.7); c.lineTo(hdx - hr * 1.7, hdy - hr * 1.3); c.lineTo(hdx - hr * 0.6, hdy + hr * 0.2); c.fill(); }
  if (L.plume) { c.strokeStyle = '#fff'; c.lineWidth = u * 0.04; c.beginPath(); c.moveTo(hdx - hr * 0.6, hdy - hr * 0.5); c.quadraticCurveTo(hdx - hr * 1.8, hdy - hr * 0.8, hdx - hr * 2, hdy + hr * 0.3); c.stroke(); }
  c.fillStyle = L.head || col; mdE(c, hdx, hdy, hr * 1.02, hr);
  if (L.disc) { c.fillStyle = mdSh(L.b || col, 0.08); mdE(c, hdx + hr * 0.18, hdy + hr * 0.02, hr * 0.85, hr * 0.85); }
  if (L.cheek) { c.fillStyle = L.cheek; mdE(c, hdx + hr * 0.2, hdy + hr * 0.3, hr * 0.55, hr * 0.36); }
  mdBeak(c, L, hdx, hdy, hr, u, P);
  const er = hr * (L.eyes ? 0.3 : 0.22) * (1 + kid * 0.3); mdEye(c, hdx + hr * 0.35, hdy - hr * 0.1, er, P.eyesClosed, !!L.eyes);
  mdBlush(c, hdx + hr * 0.02, hdy + hr * 0.38, hr * 0.2);
  if (L.eyes === 'big') { c.fillStyle = col; c.beginPath(); c.moveTo(hdx - hr * 0.75, hdy - hr * 0.6); c.lineTo(hdx - hr * 0.85, hdy - hr * 1.35); c.lineTo(hdx - hr * 0.2, hdy - hr * 0.85); c.fill(); }
  c.restore(); c.restore();
}
function mdBeak(c, L, hx, hy, hr, u, P) {
  const bc = L.bc || '#f0b43a', b = L.beak, x = hx + hr * 0.8, y = hy + hr * 0.12; c.fillStyle = bc;
  if (b === 'short') { c.beginPath(); c.moveTo(x - hr * 0.1, y - hr * 0.2); c.lineTo(x + hr * 0.5, y + hr * 0.1); c.lineTo(x - hr * 0.1, y + hr * 0.3); c.fill(); }
  else if (b === 'hook') { c.beginPath(); c.moveTo(x - hr * 0.2, y - hr * 0.3); c.quadraticCurveTo(x + hr * 0.7, y - hr * 0.2, x + hr * 0.55, y + hr * 0.5); c.quadraticCurveTo(x + hr * 0.3, y + hr * 0.15, x - hr * 0.2, y + hr * 0.3); c.fill(); }
  else if (b === 'long') { c.beginPath(); c.moveTo(x - hr * 0.2, y - hr * 0.2); c.lineTo(x + hr * 1.7, y + hr * 0.12); c.lineTo(x - hr * 0.2, y + hr * 0.25); c.fill(); }
  else if (b === 'needle') { c.beginPath(); c.moveTo(x - hr * 0.1, y - hr * 0.08); c.lineTo(x + hr * 2.1, y + hr * 0.1); c.lineTo(x - hr * 0.1, y + hr * 0.12); c.fill(); }
  else if (b === 'duck') { mdE(c, x + hr * 0.25, y + hr * 0.1, hr * 0.55, hr * 0.26); }
  else if (b === 'toucan') { c.beginPath(); c.moveTo(x - hr * 0.3, y - hr * 0.45); c.quadraticCurveTo(x + hr * 1.8, y - hr * 0.5, x + hr * 1.7, y + hr * 0.2); c.quadraticCurveTo(x + hr * 0.6, y + hr * 0.7, x - hr * 0.3, y + hr * 0.5); c.fill(); c.fillStyle = '#e8503a'; mdE(c, x + hr * 1.6, y - hr * 0.05, hr * 0.15, hr * 0.2); }
  else if (b === 'bent') { c.beginPath(); c.moveTo(x - hr * 0.3, y - hr * 0.2); c.quadraticCurveTo(x + hr * 0.7, y - hr * 0.2, x + hr * 0.9, y + hr * 0.7); c.lineTo(x + hr * 0.5, y + hr * 0.55); c.quadraticCurveTo(x + hr * 0.4, y + hr * 0.1, x - hr * 0.3, y + hr * 0.3); c.fill(); c.fillStyle = '#2a2a2f'; c.beginPath(); c.moveTo(x + hr * 0.6, y + hr * 0.2); c.lineTo(x + hr * 0.9, y + hr * 0.7); c.lineTo(x + hr * 0.5, y + hr * 0.55); c.fill(); }
  else if (b === 'pouch') { c.beginPath(); c.moveTo(x - hr * 0.3, y - hr * 0.2); c.lineTo(x + hr * 2.2, y + hr * 0.05); c.lineTo(x + hr * 2.0, y + hr * 0.3); c.lineTo(x - hr * 0.3, y + hr * 0.3); c.fill(); c.fillStyle = mdSh(bc, -0.12); c.beginPath(); c.moveTo(x - hr * 0.2, y + hr * 0.25); c.quadraticCurveTo(x + hr * 1.2, y + hr * 1.5, x + hr * 2.0, y + hr * 0.3); c.fill(); }
  else if (b === 'puffin') { c.fillStyle = '#f2823a'; c.beginPath(); c.moveTo(x - hr * 0.3, y - hr * 0.4); c.lineTo(x + hr * 0.9, y - hr * 0.1); c.lineTo(x + hr * 0.7, y + hr * 0.55); c.lineTo(x - hr * 0.3, y + hr * 0.4); c.fill(); c.fillStyle = '#f2d23a'; c.fillRect(x - hr * 0.1, y - hr * 0.2, hr * 0.2, hr * 0.5); }
}

/* ------------------------- NADADORES Y ESPECIALES ------------------------- */
function mdTailFin(c, x, y, s, wag, col) { c.fillStyle = col; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x - s * 0.5, y - s * 0.6 + wag, x - s * 0.9, y - s * 0.7 + wag * 1.4); c.quadraticCurveTo(x - s * 0.55, y + wag * 0.2, x - s * 0.9, y + s * 0.7 + wag * 1.4); c.quadraticCurveTo(x - s * 0.5, y + s * 0.6 + wag, x, y); c.fill(); }
function mdDrawSwim(c, a, S, time, P) {
  const L = S.look, u = 18 * P.sc, kid = 1 - P.age, col = P.col || L.c, belly = L.b || col, wag = Math.sin(P.ph) * u * 0.18, sh = S.sh, dark = mdSh(col, -0.22);
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const face = (x, y, r, closed) => { mdEye(c, x, y, r * (1 + kid * 0.4), closed, false); mdBlush(c, x - r * 1.4, y + r * 1.6, r * 0.95); };
  if (sh === 'fish' || sh === 'shark' || sh === 'hammer' || sh === 'orca' || sh === 'dolphin' || sh === 'whale' || sh === 'narwhal' || sh === 'beluga') {
    const bigW = { fish: 1.05, shark: 1.8, hammer: 1.7, orca: 1.7, dolphin: 1.5, whale: 2.3, narwhal: 1.7, beluga: 1.5 }[sh], bigH = { fish: 0.62, shark: 0.5, hammer: 0.46, orca: 0.6, dolphin: 0.44, whale: 0.7, narwhal: 0.62, beluga: 0.66 }[sh];
    const bw = u * bigW * (L.slim ? 1.12 : 1), bh = u * bigH * (L.slim ? 0.72 : 1);
    const wg = P.moving || true ? wag * (sh === 'whale' ? 0.6 : 1) : 0;
    /* cola */
    mdTailFin(c, -bw * 0.78, 0, u * (sh === 'fish' ? 0.62 : sh === 'whale' ? 0.9 : 0.7), wg, dark);
    if (sh === 'whale' || sh === 'orca' || sh === 'dolphin' || sh === 'narwhal' || sh === 'beluga') { /* cola horizontal */ c.fillStyle = dark; c.beginPath(); c.moveTo(-bw * 0.75, 0); c.quadraticCurveTo(-bw * 1.05, -bh * 0.9 + wg * 0.5, -bw * 1.25, -bh * 0.3 + wg); c.quadraticCurveTo(-bw * 1.05, bh * 0.1, -bw * 1.3, bh * 0.8 + wg); c.quadraticCurveTo(-bw * 1.0, bh * 0.7 + wg * 0.4, -bw * 0.75, 0); c.fill(); }
    /* aletas dorsal */
    c.fillStyle = dark; c.beginPath();
    if (sh === 'shark' || sh === 'hammer') { c.moveTo(-bw * 0.1, -bh * 0.9); c.lineTo(bw * 0.12, -bh * 1.9 - u * 0.2); c.lineTo(bw * 0.45, -bh * 0.8); }
    else if (sh === 'orca' || sh === 'dolphin') { c.moveTo(-bw * 0.1, -bh * 0.95); c.quadraticCurveTo(bw * 0.05, -bh * 1.9, bw * 0.3, -bh * 0.9); }
    else if (sh === 'fish') { c.moveTo(-bw * 0.35, -bh * 0.8); c.quadraticCurveTo(-bw * 0.1, -bh * 1.7, bw * 0.3, -bh * 0.8); }
    else if (sh === 'whale' && L.hump) { c.moveTo(-bw * 0.2, -bh * 0.9); c.quadraticCurveTo(-bw * 0.1, -bh * 1.5, bw * 0.05, -bh * 0.9); }
    c.fill();
    /* cuerpo */
    c.fillStyle = col; c.beginPath(); c.moveTo(bw * 0.95, 0); c.bezierCurveTo(bw * 0.7, -bh * 1.1, -bw * 0.5, -bh * 1.05, -bw * 0.85, -bh * 0.1); c.lineTo(-bw * 0.85, bh * 0.1); c.bezierCurveTo(-bw * 0.5, bh * 1.05, bw * 0.7, bh * 1.1, bw * 0.95, 0); c.fill();
    if (sh === 'hammer') { c.fillStyle = col; mdE(c, bw * 0.82, -bh * 0.05, bh * 0.55, bh * 1.35, 0.15); }
    c.save(); c.clip(); c.fillStyle = belly; c.beginPath(); c.moveTo(-bw * 0.9, bh * 0.25); c.quadraticCurveTo(0, bh * 0.15, bw * 1.0, bh * 0.15); c.lineTo(bw * 1.0, bh * 1.4); c.lineTo(-bw * 0.9, bh * 1.4); c.fill(); c.restore();
    if (sh === 'fish') { if (L.bands) { c.fillStyle = L.s; for (const k of [0.45, 0.0, -0.4]) { c.beginPath(); c.moveTo(bw * k - 2, -bh * 0.9); c.lineTo(bw * k + 6, -bh * 0.9); c.lineTo(bw * k + 5, bh * 0.9); c.lineTo(bw * k - 3, bh * 0.9); c.fill(); } }
      else { c.fillStyle = L.s || dark; c.globalAlpha = 0.5; c.beginPath(); c.moveTo(-bw * 0.6, -bh * 0.2); c.quadraticCurveTo(0, -bh * 0.55, bw * 0.55, -bh * 0.1); c.lineTo(bw * 0.5, bh * 0.05); c.quadraticCurveTo(0, -bh * 0.3, -bw * 0.6, 0); c.fill(); c.globalAlpha = 1; }
      if (L.sword) { c.fillStyle = '#9ab'; c.beginPath(); c.moveTo(bw * 0.9, -2); c.lineTo(bw * 1.7, 0); c.lineTo(bw * 0.9, 3); c.fill(); }
      if (L.teeth) { c.fillStyle = '#fff'; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(bw * (0.72 + k * 0.06), bh * 0.18); c.lineTo(bw * (0.75 + k * 0.06), bh * 0.42); c.lineTo(bw * (0.78 + k * 0.06), bh * 0.18); c.fill(); } }
      c.fillStyle = dark; c.beginPath(); c.moveTo(-bw * 0.1, bh * 0.8); c.lineTo(-bw * 0.35, bh * 1.5 + wag * 0.4); c.lineTo(bw * 0.15, bh * 0.8); c.fill(); }
    if (sh === 'orca') { c.fillStyle = '#fff'; mdE(c, bw * 0.28, -bh * 0.4, bw * 0.2, bh * 0.14, -0.3); }
    if (sh === 'narwhal') { c.fillStyle = '#f6eed8'; c.beginPath(); c.moveTo(bw * 0.9, -2); c.lineTo(bw * 2.2, -bh * 0.2); c.lineTo(bw * 0.9, 4); c.fill(); c.strokeStyle = '#d8ccb0'; c.lineWidth = 1; for (let k = 1; k < 7; k++) { c.beginPath(); c.moveTo(bw * (0.95 + k * 0.17), -bh * 0.05 * k); c.lineTo(bw * (1.0 + k * 0.17), bh * 0.02); c.stroke(); } c.fillStyle = '#7e8a98'; for (let k = 0; k < 6; k++) mdE(c, (mdHash(k) - 0.5) * bw, -bh * 0.4 + mdHash(k + 2) * bh * 0.4, u * 0.06, u * 0.05); }
    if (sh === 'whale' || sh === 'beluga' || sh === 'dolphin' || sh === 'orca' || sh === 'narwhal') { c.fillStyle = dark; c.beginPath(); c.moveTo(bw * 0.25, bh * 0.55); c.quadraticCurveTo(bw * 0.12, bh * 1.5, -bw * 0.1, bh * 1.2); c.quadraticCurveTo(bw * 0.05, bh * 0.8, bw * 0.15, bh * 0.5); c.fill(); }
    if (sh === 'whale' || sh === 'beluga') { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(bw * 0.1 - k * bw * 0.12, bh * 0.35); c.lineTo(bw * 0.1 - k * bw * 0.12, bh * 0.85); c.stroke(); } }
    if (sh === 'dolphin' || sh === 'orca') { c.fillStyle = belly; c.beginPath(); c.moveTo(bw * 0.95, 0); c.quadraticCurveTo(bw * 1.3, bh * 0.1, bw * 1.25, bh * 0.28); c.quadraticCurveTo(bw * 1.0, bh * 0.28, bw * 0.8, bh * 0.2); c.fill(); }
    /* boca */
    c.strokeStyle = '#2a1d16'; c.lineWidth = Math.max(1, u * 0.05); c.beginPath(); c.moveTo(bw * 0.95, bh * 0.1); c.quadraticCurveTo(bw * 0.75, bh * 0.32, bw * 0.55, bh * 0.22); c.stroke();
    face(bw * 0.58, -bh * 0.18, Math.max(1.6, u * (sh === 'whale' ? 0.09 : 0.12)), P.eyesClosed);
  } else if (sh === 'axolotl') {
    const r = u * 0.5; c.fillStyle = mdSh(col, 0.05); c.beginPath(); c.moveTo(-r * 0.8, -r * 0.1); c.quadraticCurveTo(-r * 1.6, -r * 0.3 + wag * 0.5, -r * 2.1, wag * 0.8); c.quadraticCurveTo(-r * 1.6, r * 0.3 + wag * 0.5, -r * 0.8, r * 0.2); c.fill(); c.globalAlpha = 0.5; c.beginPath(); c.moveTo(-r * 0.6, -r * 0.35); c.quadraticCurveTo(-r * 1.5, -r * 0.6 + wag * 0.4, -r * 2.1, wag * 0.8); c.lineTo(-r * 0.6, -r * 0.2); c.fill(); c.globalAlpha = 1;
    c.fillStyle = col; mdE(c, -r * 0.2, 0, r * 0.95, r * 0.42); const lg = Math.sin(P.ph) * u * 0.08; c.strokeStyle = col; c.lineWidth = u * 0.1; for (const q of [[-r * 0.6, 1], [r * 0.3, -1]]) { c.beginPath(); c.moveTo(q[0], r * 0.25); c.lineTo(q[0] + lg * q[1], r * 0.6); c.stroke(); }
    c.fillStyle = col; mdE(c, r * 0.8, -r * 0.05, r * 0.62, r * 0.52); const gc = L.s || '#ff5a8a'; for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) { c.strokeStyle = gc; c.lineWidth = u * 0.07; const ang = (sg < 0 ? -1 : 1) * (0.5 + k * 0.38), bx = r * 0.45, by = -r * 0.05 + sg * 0; c.beginPath(); c.moveTo(bx, by + sg * r * 0.25); c.lineTo(bx - Math.cos(ang) * r * 0.55, by + sg * r * 0.25 - Math.abs(Math.sin(ang)) * r * 0.55 * (sg < 0 ? 1 : -0.4) - (sg < 0 ? 0 : -r * 0.3)); c.stroke(); for (let j = 1; j <= 3; j++) { const t = j / 4; mdE(c, bx - Math.cos(ang) * r * 0.55 * t, by + sg * r * 0.25 - Math.abs(Math.sin(ang)) * r * 0.55 * t * (sg < 0 ? 1 : -0.4) - (sg < 0 ? 0 : -r * 0.3) * t, u * 0.05, u * 0.03, ang); } }
    c.strokeStyle = '#3a2a2a'; c.lineWidth = Math.max(1, u * 0.04); c.beginPath(); c.arc(r * 1.15, r * 0.05, r * 0.22, 0.2, 2.6); c.stroke(); mdEye(c, r * 1.02, -r * 0.2, u * 0.07, P.eyesClosed, false); mdBlush(c, r * 0.9, r * 0.12, u * 0.07);
  } else if (sh === 'ray') {
    const w = u * 1.7, ww = Math.sin(P.ph * 0.7) * u * 0.35; c.fillStyle = col; c.beginPath(); c.moveTo(w * 0.7, 0); c.bezierCurveTo(w * 0.2, -u * 0.5 - ww, -w * 0.5, -u * 0.9 - ww * 1.6, -w * 0.9, -u * 0.12); c.lineTo(-w * 0.5, 0); c.lineTo(-w * 0.9, u * 0.12 + 0); c.bezierCurveTo(-w * 0.5, u * 0.9 + ww * 1.6, w * 0.2, u * 0.5 + ww, w * 0.7, 0); c.fill();
    c.strokeStyle = col; c.lineWidth = u * 0.08; c.beginPath(); c.moveTo(-w * 0.5, 0); c.quadraticCurveTo(-w * 1.2, wag * 0.5, -w * 1.6, wag); c.stroke();
    c.fillStyle = belly; c.globalAlpha = 0.9; mdE(c, w * 0.1, u * 0.08, w * 0.38, u * 0.22); c.globalAlpha = 1; c.fillStyle = col; for (const k of [-1, 1]) { c.beginPath(); c.moveTo(w * 0.6, k * u * 0.14); c.lineTo(w * 0.95, k * u * 0.3); c.lineTo(w * 0.7, k * u * 0.02); c.fill(); }
    face(w * 0.42, -u * 0.08, u * 0.1, P.eyesClosed);
  } else if (sh === 'jelly') {
    const pulse = Math.sin(P.ph * 0.6) * 0.1, r = u * 0.7 * (1 + pulse); c.globalAlpha = 0.5; for (let k = -2; k <= 2; k++) { c.strokeStyle = belly; c.lineWidth = u * 0.07; c.beginPath(); c.moveTo(k * r * 0.35, r * 0.1); for (let t = 1; t <= 5; t++) c.lineTo(k * r * 0.35 + Math.sin(P.ph * 0.5 + t + k) * u * 0.12, r * 0.1 + t * u * 0.26); c.stroke(); } c.globalAlpha = 0.9;
    c.fillStyle = col; c.beginPath(); c.arc(0, 0, r, Math.PI, 0); c.quadraticCurveTo(r, r * 0.35, r * 0.6, r * 0.28); c.quadraticCurveTo(0, r * 0.45, -r * 0.6, r * 0.28); c.quadraticCurveTo(-r, r * 0.35, -r, 0); c.fill(); c.globalAlpha = 0.55; c.fillStyle = '#fff'; mdE(c, -r * 0.35, -r * 0.45, r * 0.22, r * 0.1, -0.5); c.globalAlpha = 1;
    if (L.glow) { c.globalAlpha = 0.18; c.fillStyle = col; mdE(c, 0, 0, r * 1.7, r * 1.7); c.globalAlpha = 1; }
    face(r * 0.2, r * 0.02, u * 0.1, P.eyesClosed);
  } else if (sh === 'octo') {
    const r = u * 0.55, ph = P.ph; c.fillStyle = col; for (let k = 0; k < 6; k++) { const bx = -r * 0.8 + k * r * 0.32; c.strokeStyle = col; c.lineWidth = u * 0.16; c.beginPath(); c.moveTo(bx, r * 0.35); c.quadraticCurveTo(bx + Math.sin(ph * 0.8 + k) * u * 0.25, r * 1.1, bx + Math.sin(ph * 0.8 + k * 2) * u * 0.4, r * 1.5); c.stroke(); }
    c.fillStyle = col; mdE(c, 0, -r * 0.1, r * 0.95, r * 1.05); c.fillStyle = mdSh(col, 0.2); mdE(c, -r * 0.25, -r * 0.4, r * 0.35, r * 0.25, -0.4); face(r * 0.28, 0, u * 0.12, P.eyesClosed);
  } else if (sh === 'squid') {
    const r = u * 0.55; c.fillStyle = col; c.beginPath(); c.moveTo(-r * 1.5, 0); c.quadraticCurveTo(-r * 0.5, -r * 1.0, r * 0.7, -r * 0.2); c.quadraticCurveTo(r * 0.9, 0, r * 0.7, r * 0.2); c.quadraticCurveTo(-r * 0.5, r * 1.0, -r * 1.5, 0); c.fill(); mdE(c, -r * 1.4, 0, r * 0.4, r * 0.6, wag * 0.02);
    c.strokeStyle = col; c.lineWidth = u * 0.1; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(r * 0.7, k * r * 0.1); c.quadraticCurveTo(r * 1.1, k * r * 0.2 + wag * 0.1, r * 1.6, k * r * 0.35 + Math.sin(P.ph + k) * u * 0.1); c.stroke(); } face(r * 0.3, -r * 0.1, u * 0.13, P.eyesClosed);
  } else if (sh === 'seahorse') {
    c.strokeStyle = col; c.lineWidth = u * 0.3; c.beginPath(); c.moveTo(0, u * 0.1); c.quadraticCurveTo(-u * 0.3, u * 0.6, u * 0.1 + wag * 0.3, u * 0.9); c.quadraticCurveTo(u * 0.35, u * 0.95, u * 0.25, u * 0.7); c.stroke(); c.fillStyle = col; mdE(c, 0, -u * 0.2, u * 0.34, u * 0.5); mdE(c, u * 0.18, -u * 0.72, u * 0.28, u * 0.24); c.beginPath(); c.moveTo(u * 0.3, -u * 0.74); c.lineTo(u * 0.78, -u * 0.64); c.lineTo(u * 0.3, -u * 0.58); c.fill(); c.fillStyle = L.s; for (let k = 0; k < 3; k++) mdE(c, -u * 0.16, -u * (0.7 - k * 0.3), u * 0.07, u * 0.1); face(u * 0.25, -u * 0.78, u * 0.09, P.eyesClosed);
  } else if (sh === 'star') {
    const r = u * 0.55; c.fillStyle = col; c.beginPath(); for (let k = 0; k < 10; k++) { const ang = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r * 1.0; c.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr * 0.9 - r * 0.4); } c.closePath(); c.fill(); c.fillStyle = mdSh(col, 0.25); for (let k = 0; k < 5; k++) { const ang = -Math.PI / 2 + k * 1.2566; mdE(c, Math.cos(ang) * r * 0.55, Math.sin(ang) * r * 0.5 - r * 0.4, r * 0.07, r * 0.07); } face(r * 0.1, -r * 0.45, u * 0.09, P.eyesClosed);
  } else if (sh === 'crab') {
    const r = u * 0.55, mv = P.moving ? Math.sin(P.ph * 1.5) * u * 0.1 : 0; c.strokeStyle = dark; c.lineWidth = u * 0.07; for (let k = -2; k <= 2; k++) { if (!k) continue; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * r * 0.5, -r * 0.1); c.lineTo(s * (r * 0.95 + Math.abs(k) * u * 0.05), r * 0.1 + k * u * 0.0 + (k > 0 ? 0 : -u * 0.06)); c.lineTo(s * (r * 1.0), r * 0.55 + mv * (k > 0 ? 1 : -1)); c.stroke(); } }
    for (const s of [-1, 1]) { c.strokeStyle = col; c.lineWidth = u * 0.1; c.beginPath(); c.moveTo(s * r * 0.55, -r * 0.3); c.lineTo(s * r * 1.1, -r * 0.8 + (P.state === 'eat' ? Math.sin(P.ph * 2) * u * 0.1 : 0)); c.stroke(); c.fillStyle = col; mdE(c, s * r * 1.2, -r * 0.95, r * 0.34, r * 0.28, s * 0.5); c.fillStyle = '#fff6'; }
    c.fillStyle = col; mdE(c, 0, -r * 0.2, r * 0.82, r * 0.55); c.fillStyle = belly; mdE(c, 0, -r * 0.06, r * 0.55, r * 0.22); for (const s of [-1, 1]) { c.strokeStyle = col; c.lineWidth = u * 0.05; c.beginPath(); c.moveTo(s * r * 0.2, -r * 0.65); c.lineTo(s * r * 0.22, -r * 0.9); c.stroke(); mdEye(c, s * r * 0.22, -r * 0.95, u * 0.09, P.eyesClosed, true); }
  } else if (sh === 'seaturtle') {
    const r = u * 0.9, fl = Math.sin(P.ph * 0.8) * 0.5; c.fillStyle = mdSh(col, 0.1); for (const s of [-1, 1]) { c.save(); c.translate(r * 0.35, s * r * 0.1); c.rotate(s * (0.5 + fl)); mdE(c, r * 0.35, 0, r * 0.65, r * 0.17); c.restore(); } c.save(); c.translate(-r * 0.8, 0); c.rotate(fl * 0.2); mdE(c, -r * 0.15, 0, r * 0.3, r * 0.14); c.restore();
    c.fillStyle = col; mdE(c, r * 0.95, -r * 0.05, r * 0.36, r * 0.3); c.fillStyle = mdSh(L.s, 0.0); mdE(c, 0, -r * 0.12, r * 0.98, r * 0.66); c.fillStyle = L.b; mdE(c, 0, -r * 0.02, r * 0.7, r * 0.42); c.strokeStyle = mdSh(L.s, -0.35); c.lineWidth = 1.2; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(k * r * 0.3, -r * 0.5); c.lineTo(k * r * 0.3, r * 0.3); c.stroke(); } face(r * 1.05, -r * 0.1, u * 0.1, P.eyesClosed);
  } else if (sh === 'angler') {
    const r = u * 0.7; c.strokeStyle = dark; c.lineWidth = u * 0.06; c.beginPath(); c.moveTo(r * 0.2, -r * 0.6); c.quadraticCurveTo(r * 0.9, -r * 1.4, r * 1.25, -r * 0.8); c.stroke(); c.globalAlpha = 0.4; c.fillStyle = '#ffe27a'; mdE(c, r * 1.25, -r * 0.8, r * 0.55, r * 0.55); c.globalAlpha = 1; c.fillStyle = '#fff7b0'; mdE(c, r * 1.25, -r * 0.8, r * 0.2, r * 0.2);
    mdTailFin(c, -r * 0.8, 0, u * 0.7, wag, dark); c.fillStyle = col; mdE(c, 0, 0, r, r * 0.85); c.fillStyle = mdSh(col, 0.2); mdE(c, -r * 0.1, -r * 0.35, r * 0.5, r * 0.25, -0.2); c.fillStyle = '#e8f0ff'; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(r * (0.35 + k * 0.1), r * 0.12); c.lineTo(r * (0.4 + k * 0.1), r * 0.4); c.lineTo(r * (0.45 + k * 0.1), r * 0.12); c.fill(); } face(r * 0.45, -r * 0.18, u * 0.13, P.eyesClosed);
  } else if (sh === 'seal') {
    const r = u * 0.85, ph = P.moving ? Math.sin(P.ph) * 0.4 : 0; c.fillStyle = mdSh(col, -0.12); c.save(); c.translate(-r * 1.05, r * 0.15); c.rotate(ph * 0.4); mdE(c, -r * 0.2, 0, r * 0.45, r * 0.2); mdE(c, -r * 0.25, 0, r * 0.14, r * 0.45, 0.2); c.restore();
    c.fillStyle = col; c.beginPath(); c.moveTo(-r * 1.1, r * 0.1); c.bezierCurveTo(-r * 0.9, -r * 0.7, r * 0.5, -r * 0.8, r * 0.9, -r * 0.2); c.bezierCurveTo(r * 1.2, r * 0.1, r * 0.5, r * 0.6, -r * 0.2, r * 0.55); c.bezierCurveTo(-r * 0.8, r * 0.5, -r * 1.1, r * 0.4, -r * 1.1, r * 0.1); c.fill();
    c.fillStyle = belly; mdE(c, r * 0.1, r * 0.3, r * 0.7, r * 0.24); c.fillStyle = mdSh(col, -0.15); c.save(); c.translate(r * 0.15, r * 0.3); c.rotate(0.6 + ph); mdE(c, 0, r * 0.2, r * 0.14, r * 0.36); c.restore();
    if (L.tusks) { c.strokeStyle = '#f6eed8'; c.lineWidth = u * 0.1; c.beginPath(); c.moveTo(r * 0.9, r * 0.0); c.lineTo(r * 0.95, r * 0.75); c.stroke(); c.beginPath(); c.moveTo(r * 0.75, r * 0.0); c.lineTo(r * 0.8, r * 0.7); c.stroke(); c.fillStyle = '#4a3a2a'; for (let k = 0; k < 4; k++) mdE(c, r * (0.66 + k * 0.08), r * 0.05, u * 0.025, u * 0.025); }
    if (L.ears) { c.fillStyle = col; mdE(c, r * 0.35, -r * 0.55, u * 0.1, u * 0.14); }
    c.fillStyle = '#2a2a2f'; mdE(c, r * 1.1, -r * 0.18, u * 0.1, u * 0.08); c.strokeStyle = '#eee'; c.lineWidth = 0.8; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(r * 1.0, r * 0.0); c.lineTo(r * 1.25, r * 0.02 + s * r * 0.08); c.stroke(); } face(r * 0.82, -r * 0.3, u * 0.13, P.eyesClosed);
  } else if (sh === 'otter') {
    const r = u * 0.8; c.strokeStyle = col; c.lineWidth = u * 0.22; c.beginPath(); c.moveTo(-r * 0.5, 0); c.quadraticCurveTo(-r * 1.2, r * 0.2 + wag * 0.3, -r * 1.7, r * 0.05 + wag * 0.4); c.stroke(); c.fillStyle = col; mdE(c, 0, 0, r * 0.9, r * 0.4); c.fillStyle = belly; mdE(c, r * 0.2, r * 0.1, r * 0.6, r * 0.22); mdE(c, r * 0.95, -r * 0.15, r * 0.42, r * 0.38); mdE(c, r * 1.15, 0, r * 0.28, r * 0.2); c.fillStyle = '#2a2a2f'; mdE(c, r * 1.35, -r * 0.05, u * 0.07, u * 0.06); c.fillStyle = col; mdE(c, r * 0.85, -r * 0.5, u * 0.08, u * 0.08); c.strokeStyle = col; c.lineWidth = u * 0.12; c.beginPath(); c.moveTo(r * 0.5, r * 0.25); c.lineTo(r * 0.8, r * 0.55); c.stroke(); face(r * 1.02, -r * 0.2, u * 0.1, P.eyesClosed);
  }
  c.restore();
}
function mdDrawSpecial(c, a, S, time, P) {
  const L = S.look, u = 18 * P.sc, kid = 1 - P.age, col = P.col || L.c, belly = L.b || col, sh = S.sh, dark = mdSh(col, -0.25), sw = P.moving ? Math.sin(P.ph) : 0;
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  if (sh === 'frog') {
    const k = u / 13, hop = (P.hop || 0) * u * 0.9; c.translate(0, -hop); c.scale(k, k);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, -4, 6.5, 4.4, 0, 0, 6.3); c.fill();
    c.fillStyle = belly; c.beginPath(); c.ellipse(1, -2, 4.4, 2.4, 0, 0, 6.3); c.fill();
    c.fillStyle = col; c.beginPath(); c.arc(3, -9, 2.8, 0, 6.3); c.arc(-1, -9, 2.8, 0, 6.3); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(3.2, -9.3, 1.3, 0, 6.3); c.arc(-0.8, -9.3, 1.3, 0, 6.3); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(3.6, -9.3, 0.7, 0, 6.3); c.arc(-0.4, -9.3, 0.7, 0, 6.3); c.fill();
    if (P.tongue) { c.strokeStyle = '#e85a6a'; c.lineWidth = 1; c.beginPath(); c.moveTo(7, -5); c.lineTo(7 + P.tongue * 14, -7); c.stroke(); }
  } else if (sh === 'snail') {
    const r = u * 0.42, st = P.moving ? Math.sin(P.ph * 0.5) * u * 0.05 : 0, hide = P.lie; c.fillStyle = belly; c.beginPath(); c.moveTo(-r * 1.3, 0); c.quadraticCurveTo(-r * 0.3, -r * 0.5 + st, r * 1.2, -r * 0.2); if (!hide) { c.quadraticCurveTo(r * 1.6, -r * 0.6, r * 1.45, -r * 0.05); } c.lineTo(r * 1.3, 0); c.fill();
    if (!hide) { c.strokeStyle = belly; c.lineWidth = u * 0.06; c.beginPath(); c.moveTo(r * 1.35, -r * 0.4); c.lineTo(r * 1.55, -r * 1.05); c.moveTo(r * 1.2, -r * 0.4); c.lineTo(r * 1.15, -r * 0.95); c.stroke(); c.fillStyle = '#1b1210'; mdE(c, r * 1.55, -r * 1.08, u * 0.05, u * 0.05); mdE(c, r * 1.15, -r * 0.98, u * 0.045, u * 0.045); mdBlush(c, r * 1.3, -r * 0.2, u * 0.05); }
    c.fillStyle = col; mdE(c, -r * 0.1, -r * 0.95, r * 0.95, r * 0.9); c.strokeStyle = L.s || mdSh(col, -0.3); c.lineWidth = Math.max(1, u * 0.06); c.beginPath(); for (let t = 0; t < 14; t++) { const ang = t * 0.62, rr = r * 0.85 * (1 - t / 15); const px = -r * 0.1 + Math.cos(ang) * rr, py = -r * 0.95 + Math.sin(ang) * rr; if (!t) c.moveTo(px, py); else c.lineTo(px, py); } c.stroke(); c.fillStyle = 'rgba(255,255,255,.3)'; mdE(c, -r * 0.4, -r * 1.35, r * 0.25, r * 0.14, -0.4);
  } else if (sh === 'hedge') {
    const r = u * 0.55; c.fillStyle = L.s || mdSh(col, -0.3); for (let k = 0; k < 14; k++) { const ang = Math.PI * (1.05 + k * 0.065), rr = r * (1.25 + (k % 2) * 0.12); c.beginPath(); c.moveTo(Math.cos(ang) * r * 0.7 - r * 0.15, -r * 0.55 + Math.sin(ang) * r * 0.6); c.lineTo(Math.cos(ang) * rr - r * 0.15, -r * 0.55 + Math.sin(ang) * rr * 0.85); c.lineTo(Math.cos(ang + 0.1) * r * 0.7 - r * 0.15, -r * 0.55 + Math.sin(ang + 0.1) * r * 0.6); c.fill(); }
    c.fillStyle = col; mdE(c, -r * 0.15, -r * 0.5, r * 1.05, r * 0.65); c.fillStyle = belly; mdE(c, r * 0.7, -r * 0.35, r * 0.45, r * 0.36); mdE(c, r * 1.12, -r * 0.25, r * 0.22, r * 0.14); c.fillStyle = '#2a2a2f'; mdE(c, r * 1.32, -r * 0.27, u * 0.06, u * 0.05); mdEye(c, r * 0.85, -r * 0.48, u * 0.07, P.eyesClosed, false); mdBlush(c, r * 0.75, -r * 0.22, u * 0.06); c.fillStyle = mdSh(belly, -0.2); const lg = P.moving ? Math.sin(P.ph) * u * 0.06 : 0; mdE(c, r * 0.3 + lg, -u * 0.03, u * 0.08, u * 0.05); mdE(c, -r * 0.5 - lg, -u * 0.03, u * 0.08, u * 0.05);
  } else if (sh === 'croc') {
    const ln = u * 1.7, mouth = P.mouth ? 0.2 : 0.05; const th = u * 0.2; c.strokeStyle = dark; c.lineWidth = th * 0.8; for (const k of [-0.5, 0.45]) { c.beginPath(); c.moveTo(ln * k, -u * 0.15); c.lineTo(ln * k + (k < 0 ? sw : -sw) * u * 0.2, 0); c.stroke(); }
    c.fillStyle = col; c.beginPath(); c.moveTo(-ln * 0.55, -u * 0.34); c.quadraticCurveTo(-ln * 1.1, -u * 0.1 + sw * u * 0.1, -ln * 1.65, u * 0.05 + sw * u * 0.2); c.quadraticCurveTo(-ln * 1.1, u * 0.12, -ln * 0.55, -u * 0.02); c.fill();
    mdE(c, 0, -u * 0.36, ln * 0.58, u * 0.3); c.fillStyle = belly; mdE(c, 0, -u * 0.2, ln * 0.5, u * 0.14); c.fillStyle = dark; for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(k * ln * 0.12 - 3, -u * 0.6); c.lineTo(k * ln * 0.12, -u * 0.72); c.lineTo(k * ln * 0.12 + 3, -u * 0.6); c.fill(); }
    c.fillStyle = col; c.beginPath(); c.moveTo(ln * 0.4, -u * 0.55); c.quadraticCurveTo(ln * 0.8, -u * 0.62, ln * 1.1, -u * (0.34 + mouth)); c.lineTo(ln * 1.1, -u * 0.18); c.lineTo(ln * 0.4, -u * 0.12); c.fill(); if (P.mouth) { c.fillStyle = '#7a2a2a'; c.beginPath(); c.moveTo(ln * 0.6, -u * 0.34); c.lineTo(ln * 1.08, -u * 0.34); c.lineTo(ln * 1.08, -u * 0.2); c.lineTo(ln * 0.6, -u * 0.2); c.fill(); }
    c.fillStyle = '#fff'; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(ln * (0.62 + k * 0.1), -u * 0.2); c.lineTo(ln * (0.65 + k * 0.1), -u * 0.1); c.lineTo(ln * (0.68 + k * 0.1), -u * 0.2); c.fill(); }
    c.fillStyle = col; mdE(c, ln * 0.45, -u * 0.62, u * 0.17, u * 0.17); mdEye(c, ln * 0.47, -u * 0.64, u * 0.09, P.eyesClosed, true); mdBlush(c, ln * 0.58, -u * 0.38, u * 0.08);
  } else if (sh === 'snake') {
    const n = 14, seg = u * 0.17, amp = u * (P.moving ? 0.26 : 0.1); c.strokeStyle = col; c.lineWidth = u * 0.28; const pts = []; for (let k = 0; k <= n; k++) { const t = k / n; pts.push([-t * u * 2.3 + (P.coil ? 0 : 0), -u * 0.22 + Math.sin(t * 7 - P.ph * 1.4) * amp * (0.4 + t)]); }
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); c.strokeStyle = belly; c.lineWidth = u * 0.08; c.globalAlpha = 0.7; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1] + u * 0.07) : c.moveTo(p[0], p[1] + u * 0.07))); c.stroke(); c.globalAlpha = 1; c.fillStyle = L.s; for (let k = 1; k < n; k += 2) mdE(c, pts[k][0], pts[k][1] - u * 0.06, u * 0.07, u * 0.06);
    const hx = pts[0][0] + u * 0.05, hy = pts[0][1] - u * 0.04; c.fillStyle = col; mdE(c, hx + u * 0.08, hy, u * 0.3 * (1 + kid * 0.4), u * 0.24 * (1 + kid * 0.4)); mdEye(c, hx + u * 0.15, hy - u * 0.06, u * 0.07, P.eyesClosed, true); mdBlush(c, hx + u * 0.05, hy + u * 0.08, u * 0.06); if (Math.sin(time * 0.006 + P.id) > 0.7) { c.strokeStyle = '#e03a4a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(hx + u * 0.36, hy + u * 0.04); c.lineTo(hx + u * 0.62, hy + u * 0.04); c.lineTo(hx + u * 0.72, hy - u * 0.04); c.moveTo(hx + u * 0.62, hy + u * 0.04); c.lineTo(hx + u * 0.72, hy + u * 0.12); c.stroke(); }
  } else if (sh === 'turtle') {
    const r = u * 0.65; c.strokeStyle = belly; c.lineWidth = u * 0.2; const ls = P.moving ? sw * u * 0.1 : 0; for (const k of [-0.5, 0.45]) { c.beginPath(); c.moveTo(r * k, -u * 0.2); c.lineTo(r * k + ls * (k < 0 ? 1 : -1), 0); c.stroke(); } c.fillStyle = belly; mdE(c, r * 0.95 + (P.hide ? -r * 0.5 : 0), -r * 0.45, r * 0.3, r * 0.26); mdE(c, -r * 1.02, -r * 0.25, r * 0.18, r * 0.1);
    c.fillStyle = L.s; c.beginPath(); c.arc(0, -r * 0.25, r * 0.98, Math.PI, 0); c.lineTo(r * 0.98, -r * 0.2); c.lineTo(-r * 0.98, -r * 0.2); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(0, -r * 0.25, r * 0.78, Math.PI, 0); c.fill(); c.strokeStyle = L.s; c.lineWidth = 1.3; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(k * r * 0.3, -r * 0.25); c.lineTo(k * r * 0.2, -r * 1.0); c.stroke(); } c.beginPath(); c.moveTo(-r * 0.78, -r * 0.55); c.lineTo(r * 0.78, -r * 0.55); c.stroke();
    mdEye(c, r * 1.05 + (P.hide ? -r * 0.5 : 0), -r * 0.52, r * 0.1, P.eyesClosed || P.hide, true); mdBlush(c, r * 0.95, -r * 0.35, r * 0.1);
  } else if (sh === 'kang') {
    const h = u * 1.35, hop = P.hop || (P.moving ? Math.abs(Math.sin(P.ph)) : 0); c.translate(0, -hop * u * 0.7); const bc = col;
    c.fillStyle = mdSh(bc, -0.1); c.beginPath(); c.moveTo(-u * 0.2, -u * 0.5); c.quadraticCurveTo(-u * 1.0, -u * 0.15, -u * 1.5, -u * 0.05); c.quadraticCurveTo(-u * 0.9, -u * 0.5, -u * 0.2, -u * 0.25); c.fill();
    c.fillStyle = bc; mdE(c, -u * 0.05, -u * 0.75, u * 0.45, u * 0.62, -0.25); c.fillStyle = belly; mdE(c, u * 0.1, -u * 0.7, u * 0.26, u * 0.42, -0.25); mdE(c, -u * 0.05, -u * 0.3, u * 0.25, u * 0.1); c.fillStyle = mdSh(bc, -0.12); mdE(c, -u * 0.1, -u * 0.2, u * 0.3, u * 0.24); mdE(c, u * 0.12, -u * 0.04, u * 0.34, u * 0.09);
    c.strokeStyle = bc; c.lineWidth = u * 0.1; c.beginPath(); c.moveTo(u * 0.25, -u * 0.95); c.lineTo(u * 0.5, -u * 0.72 + sw * u * 0.05); c.stroke();
    const hx = u * 0.28, hy = -h * 1.0; c.fillStyle = bc; mdE(c, hx - u * 0.12, hy - u * 0.25, u * 0.1, u * 0.34, -0.3); mdE(c, hx, hy, u * 0.28, u * 0.26); mdE(c, hx + u * 0.26, hy + u * 0.05, u * 0.24, u * 0.17); c.fillStyle = '#2a2a2f'; mdE(c, hx + u * 0.42, hy, u * 0.06, u * 0.05); mdEye(c, hx + u * 0.1, hy - u * 0.06, u * 0.07 * (1 + kid * 0.4), P.eyesClosed, true); mdBlush(c, hx - u * 0.02, hy + u * 0.1, u * 0.07);
  }
  c.restore();
}

/* ------------------------- despacho ------------------------- */
function mdDrawCritter(c, a, S, time) {
  const age = a.age == null ? 1 : a.age, sc = Math.pow(S.z, 0.8) * 1.25 * (0.45 + 0.55 * age);
  const lie = a.state === 'sleep' || a.state === 'rest' ? 1 : 0;
  const P = { sc, age, id: a.id, ph: a.ph, moving: !!a.moving, run: !!a.running, flying: !!a.flying, male: a.male, col: a.col, hd: a.state === 'graze' || a.state === 'drink' ? 1 : (a.state === 'eat' ? 0.8 : 0), lie, sleeping: lie, eyesClosed: lie || a.blink > 0, mouth: a.state === 'hunt' || a.yawn > 0, fed: a.hunger < 0.15, hop: a.hop, tongue: a.tongue, carry: a.carry, state: a.state };
  if (P.hd && S.t === 'q' && S.look.nk > 0.5) P.hd = 1;
  if (S.t === 'q') mdDrawQuad(c, a, S, time, P);
  else if (S.t === 'b') mdDrawBird(c, a, S, time, P);
  else if (S.t === 'f') mdDrawSwim(c, a, S, time, P);
  else mdDrawSpecial(c, a, S, time, P);
}
