/* Cinnavia 7.49 — EL GRAN BOSQUE · arte (todo se dibuja con código, sin imágenes).
   Cielo, sol y luna, estrellas, auroras, nubes, el monte Fuji, montañas, árboles de cuatro especies que cambian
   con las estaciones, lago que se congela, clima (lluvia, nieve, niebla, relámpagos) y los animales. */
'use strict';
const GB = { stars: [], clouds: [], reeds: [], pads: [], rocks: [], flash: { a: 0 }, bolt: null, shoot: null, DRAW: {}, SP: {} };
const gbSm = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const gbMix = (a, b, t) => a + (b - a) * t;
const gbHex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const gbRGB = (c) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const gbLerpC = (a, b, t) => { const A = gbHex(a), B = gbHex(b); return gbRGB([gbMix(A[0], B[0], t), gbMix(A[1], B[1], t), gbMix(A[2], B[2], t)]); };
const gbLerpRGB = (A, B, t) => [gbMix(A[0], B[0], t), gbMix(A[1], B[1], t), gbMix(A[2], B[2], t)];

/* paleta por estación: [primavera, verano, otoño, invierno] */
const GB_PAL = {
  grassA: ['#93c56b', '#6fae4f', '#b9a34c', '#eef3f6'], grassB: ['#6ba653', '#4f8f40', '#8e7b3b', '#d3dde6'],
  soil: ['#6e5d41', '#665639', '#5d4a33', '#58525a'],
  oak: ['#8ccf6a', '#4f9a45', '#d9822b', '#9a8a78'], sakura: ['#f4bdd0', '#5fae52', '#e4b13e', '#a29286'],
  maple: ['#9cd16a', '#58a64a', '#c8422b', '#9a8a78'], pine: ['#4f8f58', '#3f8050', '#46805a', '#4a7f62'],
  far: ['#9db7d4', '#8fabc9', '#a39ab8', '#b9c8dc'], mid: ['#7fa7a0', '#6e9b8f', '#9a8e78', '#a9bdc6'],
  fuji: ['#7488b8', '#6b7fb0', '#8a86ae', '#7f93bd'], water: ['#78bcd8', '#52a8cf', '#5f98aa', '#c4dfeb'],
  bush: ['#6fb35a', '#4f9444', '#a8873a', '#8a9a90'], flower1: ['#f08fb4', '#f2d24a', '#e07a3a', '#dfe8ee'],
};
const gbShade = (col, t) => { const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(col); const v = m ? [+m[1], +m[2], +m[3]] : gbHex(col); const k = t > 0 ? 255 : 0; const q = Math.abs(t); return gbRGB([v[0] + (k - v[0]) * q, v[1] + (k - v[1]) * q, v[2] + (k - v[2]) * q]); };
const gbPal = (n, e) => (e.sT > 0.001 ? gbLerpC(GB_PAL[n][e.sI], GB_PAL[n][e.sN], e.sT) : GB_PAL[n][e.sI]);

/* ---------- cielo ---------- */
const GB_SKY = { night: ['#0a1130', '#1c2b57'], dawn: ['#5b5f9e', '#f4a583'], day: ['#5aa9e6', '#c9e8f6'], dusk: ['#4c4f8f', '#f08f6c'] };
function gbSkyColors(e) {
  const a = e.sunAlt; let top, bot;
  const mixK = (k1, k2, t) => [gbLerpRGB(gbHex(GB_SKY[k1][0]), gbHex(GB_SKY[k2][0]), t), gbLerpRGB(gbHex(GB_SKY[k1][1]), gbHex(GB_SKY[k2][1]), t)];
  const warm = e.p < 0.25 || e.p > 0.9 ? 'dawn' : 'dusk';
  let r;
  if (a > 0.32) r = mixK('day', 'day', 0); else if (a > -0.02) r = mixK(warm, 'day', gbSm((a + 0.02) / 0.34)); else if (a > -0.3) r = mixK('night', warm, gbSm((a + 0.3) / 0.28)); else r = mixK('night', 'night', 0);
  top = r[0]; bot = r[1];
  const g = [150, 158, 168], gs = e.cloud * 0.55 + e.fog * 0.2; const dark = 1 - gbSm(-a / 0.4) * 0.0;
  const gr = gbLerpRGB(g, [60, 66, 80], Math.max(0, e.thunder * 0.7)); const lum = 0.35 + 0.65 * gbSm((a + 0.3) / 0.6);
  const gg = [gr[0] * lum, gr[1] * lum, gr[2] * lum];
  return [gbRGB(gbLerpRGB(top, gg, gs)), gbRGB(gbLerpRGB(bot, gg, gs * 0.9))];
}
function gbDrawSky(c, W, H, e) {
  const top = GB.top || 0; const [t, b] = gbSkyColors(e); const g = c.createLinearGradient(0, top, 0, 580); g.addColorStop(0, t); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, top - 2, W, 604 - top);
}
function gbDrawStars(c, W, e, time) {
  const k = gbSm((-e.sunAlt - 0.05) / 0.25) * (1 - e.cloud * 0.85); if (k <= 0.02) return;
  for (let i = 0; i < GB.stars.length; i++) { const s = GB.stars[i]; const tw = 0.6 + 0.4 * Math.sin(time * s.f + s.p); c.globalAlpha = k * tw * s.a; c.fillStyle = '#fff'; c.beginPath(); c.arc(s.x * W, (GB.top || 0) + s.y * (440 - (GB.top || 0)), s.r, 0, 6.3); c.fill(); }
  c.globalAlpha = 1;
  if (GB.shoot && GB.shoot.life > 0) { const s = GB.shoot; c.globalAlpha = Math.min(1, s.life * 2) * k; c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x - s.vx * 0.12, s.y - s.vy * 0.12); c.stroke(); c.globalAlpha = 1; }
}
function gbDrawSunMoon(c, W, e) {
  const hy = 520, sky = 420;
  const body = (ph, draw) => { const x = W * (1 - Math.cos(ph * 6.2832)) / 2, y = hy - Math.sin(ph * 6.2832) * sky; if (y < hy + 40) draw(x, y); };
  const vis = 1 - e.cloud * 0.8;
  body(e.p, (x, y) => {
    const low = 1 - gbSm((Math.sin(e.p * 6.2832)) / 0.4);
    c.globalAlpha = vis; const g = c.createRadialGradient(x, y, 6, x, y, 130); g.addColorStop(0, `rgba(255,${230 - low * 70},${170 - low * 80},.55)`); g.addColorStop(1, 'rgba(255,220,160,0)'); c.fillStyle = g; c.fillRect(x - 140, y - 140, 280, 280);
    c.fillStyle = gbRGB([255, 244 - low * 70, 200 - low * 100]); c.beginPath(); c.arc(x, y, 30, 0, 6.3); c.fill(); c.globalAlpha = 1;
  });
  body((e.p + 0.5) % 1, (x, y) => {
    c.globalAlpha = vis; const g = c.createRadialGradient(x, y, 4, x, y, 90); g.addColorStop(0, 'rgba(220,230,255,.35)'); g.addColorStop(1, 'rgba(220,230,255,0)'); c.fillStyle = g; c.fillRect(x - 100, y - 100, 200, 200);
    c.fillStyle = '#eef2ff'; c.beginPath(); c.arc(x, y, 20, 0, 6.3); c.fill(); c.fillStyle = 'rgba(160,170,200,.35)'; c.beginPath(); c.arc(x - 6, y - 4, 5, 0, 6.3); c.arc(x + 6, y + 6, 3.5, 0, 6.3); c.fill(); c.globalAlpha = 1;
  });
}
function gbDrawAurora(c, W, e, time) {
  if (e.aurora <= 0.02) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  const cols = [[70, 255, 160], [90, 200, 255], [200, 120, 255]];
  for (let k = 0; k < 3; k++) {
    const col = cols[k]; const base = 150 + k * 28; const amp = 22 + k * 8;
    for (let x = -10; x < W + 10; x += 5) {
      const w = Math.sin(x * 0.011 + time * 0.00035 * (1 + k * 0.3) + k * 2) + Math.sin(x * 0.027 - time * 0.0005) * 0.5;
      const y0 = base + w * amp, h = 130 + 70 * Math.sin(x * 0.006 + time * 0.0003 + k) + 40 * Math.sin(x * 0.02 + time * 0.0007);
      const g = c.createLinearGradient(0, y0 - h, 0, y0 + 20); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.6, `rgba(${col},${0.3 * e.aurora})`); g.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = g; c.fillRect(x, y0 - h, 6, h + 20);
    }
  }
  c.restore();
}
function gbDrawClouds(c, W, e, time, camX) {
  const n = GB.clouds.length; const dark = e.thunder * 0.6 + e.rain * 0.25; const day = gbSm((e.sunAlt + 0.2) / 0.5);
  for (let i = 0; i < n; i++) {
    const cl = GB.clouds[i]; if (i / n > e.cloud * 1.05 + 0.04) continue;
    const x = ((cl.x + time * 0.004 * cl.v * (1 + e.wind * 2) - camX * 0.08) % (W + 500) + (W + 500)) % (W + 500) - 250; const y = cl.y + Math.min(0, (GB.top || 0) * 0.55); const s = cl.s * (1 + e.cloud * 0.3);
    const lum = (235 - dark * 130) * (0.3 + 0.7 * day); const tint = e.sunAlt < 0.15 && e.sunAlt > -0.15 ? [1, 0.82, 0.78] : [1, 1, 1];
    c.fillStyle = `rgba(${lum * tint[0] | 0},${lum * tint[1] | 0},${(lum + 8) * tint[2] | 0},${0.55 + e.cloud * 0.3})`;
    c.beginPath(); for (const [dx, dy, r] of cl.p) c.arc(x + dx * s, y + dy * s, r * s, 0, 6.3); c.fill();
  }
}

/* ---------- montañas y Fuji ---------- */
function gbRidge(c, W, camX, par, base, amp, seed, col, snow, e) {
  c.fillStyle = col; c.beginPath(); c.moveTo(0, 600);
  for (let x = 0; x <= W + 20; x += 14) { const wx = x + camX * par; const y = base - amp * (0.55 + 0.45 * Math.sin(wx * 0.0042 + seed)) - amp * 0.3 * Math.sin(wx * 0.011 + seed * 2) - amp * 0.18 * Math.sin(wx * 0.029 + seed * 3); c.lineTo(x, y); }
  c.lineTo(W + 20, 600); c.closePath(); c.fill();
}
function gbDrawFuji(c, W, camX, e) {
  const par = 0.22, cx = 760 - camX * par; const baseY = 545, H = 380, half = 700; const body = gbPal('fuji', e);
  const prof = (dx) => { const t = 1 - Math.abs(dx) / half; if (t <= 0) return baseY; const yy = baseY - H * Math.pow(t, 1.9); return Math.max(yy, baseY - H * 0.965); };
  const cxs = cx;
  c.save(); const g = c.createLinearGradient(0, baseY - H, 0, baseY); g.addColorStop(0, body); g.addColorStop(1, gbLerpC('#8ea6c8', '#9db7d4', 0.5)); c.fillStyle = g;
  c.beginPath(); c.moveTo(cxs - half, baseY); for (let dx = -half; dx <= half; dx += 12) c.lineTo(cxs + dx, prof(dx)); c.lineTo(cxs + half, baseY); c.closePath(); c.fill();
  // nieve: línea de nieve según estación (alta en verano, baja en invierno)
  const sl = [0.62, 0.86, 0.66, 0.34]; const snowLine = gbMix(sl[e.sI], sl[e.sN], e.sT);
  c.beginPath(); const yLine = baseY - H * snowLine; let started = false; const pts = [];
  for (let dx = -half; dx <= half; dx += 8) { const y = prof(dx); const jag = (Math.sin(dx * 0.09) + Math.sin(dx * 0.23 + 1.3) * 0.6) * 9 + Math.abs(Math.sin(dx * 0.05)) * 14; const ly = yLine + jag; if (y < ly) pts.push([dx, y, ly]); }
  if (pts.length) { c.moveTo(cxs + pts[0][0], pts[0][1]); for (const p of pts) c.lineTo(cxs + p[0], p[1]); for (let i = pts.length - 1; i >= 0; i--) c.lineTo(cxs + pts[i][0], pts[i][2]); c.closePath(); c.fillStyle = '#f7fbff'; c.fill(); }
  // sombra lateral suave
  c.globalAlpha = 0.16; c.fillStyle = '#2a3566'; c.beginPath(); c.moveTo(cxs, baseY - H * 0.965); for (let dx = 0; dx <= half; dx += 12) c.lineTo(cxs + dx, prof(dx)); c.lineTo(cxs + half, baseY); c.lineTo(cxs + 40, baseY); c.closePath(); c.fill(); c.globalAlpha = 1;
  // resplandor de amanecer/atardecer
  const warm = Math.max(0, 1 - Math.abs(e.sunAlt) / 0.2) * (1 - e.cloud * 0.7); if (warm > 0.02) { c.globalAlpha = warm * 0.35; c.fillStyle = '#ff9a7a'; c.beginPath(); c.moveTo(cxs - half, baseY); for (let dx = -half; dx <= half; dx += 12) c.lineTo(cxs + dx, prof(dx)); c.lineTo(cxs + half, baseY); c.closePath(); c.fill(); c.globalAlpha = 1; }
  c.restore();
}
function gbDrawMountains(c, W, camX, e) {
  const far = gbPal('far', e), mid = gbPal('mid', e);
  gbRidge(c, W, camX, 0.1, 470, 120, 1.2, far, 0, e);
  gbDrawFuji(c, W, camX, e);
  gbRidge(c, W, camX, 0.32, 535, 70, 4.1, mid, 0, e);
  // nieblina entre capas
  const g = c.createLinearGradient(0, 430, 0, 580); const h = e.fog * 0.6 + 0.18; g.addColorStop(0, 'rgba(235,240,245,0)'); g.addColorStop(1, `rgba(235,240,245,${h})`); c.fillStyle = g; c.fillRect(0, 430, W, 150);
}

/* ---------- suelo, lago, vegetación ---------- */
function gbDrawGround(c, W, camX, e) {
  const A = gbPal('grassA', e), B = gbPal('grassB', e), soil = gbPal('soil', e);
  c.beginPath(); c.moveTo(-10, 780); for (let x = -10; x <= W + 10; x += 8) c.lineTo(x, GB.gy(x + camX)); c.lineTo(W + 10, 780); c.closePath();
  const g = c.createLinearGradient(0, 560, 0, 740); g.addColorStop(0, soil); g.addColorStop(1, '#2f2820'); c.fillStyle = g; c.fill();
  c.beginPath(); c.moveTo(-10, GB.gy(camX - 10) + 30); for (let x = -10; x <= W + 10; x += 8) c.lineTo(x, GB.gy(x + camX) + 28 + Math.sin((x + camX) * 0.05) * 3); for (let x = W + 10; x >= -10; x -= 8) c.lineTo(x, GB.gy(x + camX)); c.closePath(); c.fillStyle = B; c.fill();
  c.beginPath(); for (let x = -10; x <= W + 10; x += 8) { const y = GB.gy(x + camX); if (x < -9) c.moveTo(x, y); else c.lineTo(x, y); } c.strokeStyle = A; c.lineWidth = 8; c.lineJoin = 'round'; c.stroke();
}
function gbDrawLake(c, W, camX, e, time) {
  const L = GB.lakeL - camX, R = GB.lakeR - camX; if (R < -20 || L > W + 20) return;
  const wy = GB.waterY; const wc = gbPal('water', e);
  c.save(); c.beginPath(); c.moveTo(L - 4, wy - 2); for (let x = L - 4; x <= R + 4; x += 8) c.lineTo(x, GB.gy(x + camX) + 2); c.lineTo(R + 4, wy - 2); c.closePath();
  const g = c.createLinearGradient(0, wy, 0, wy + 70); g.addColorStop(0, wc); g.addColorStop(1, gbLerpC('#20507a', '#a9cbe0', e.ice)); c.fillStyle = g; c.fill(); c.clip();
  // reflejo del cielo y de la nieve del Fuji
  c.globalAlpha = 0.28 * (1 - e.ice * 0.4); const [t, b] = gbSkyColors(e); c.fillStyle = b; c.fillRect(L, wy, R - L, 22); c.globalAlpha = 1;
  if (e.ice < 0.5) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.4; for (let k = 0; k < 7; k++) { const x0 = L + ((k * 97 + time * 0.012 * (1 + e.wind)) % (R - L)); const y0 = wy + 5 + (k % 3) * 9; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + 8, y0 - 2 - e.rain * 2, x0 + 18, y0); c.stroke(); } }
  if (e.ice > 0.02) { c.globalAlpha = e.ice; c.fillStyle = '#e5f2f8'; c.fillRect(L, wy - 1, R - L, 80); c.strokeStyle = 'rgba(120,160,190,.55)'; c.lineWidth = 1; for (let k = 0; k < 9; k++) { const x0 = L + k * (R - L) / 9 + 14; c.beginPath(); c.moveTo(x0, wy); c.lineTo(x0 + 22, wy + 14 + (k % 3) * 6); c.lineTo(x0 + 8, wy + 32); c.stroke(); } c.globalAlpha = 1; }
  c.restore();
  // lluvia en el agua: anillos
  if (e.rain > 0.15 && e.ice < 0.4) { c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1; for (let k = 0; k < 6 * e.rain; k++) { const ph = ((time * 0.0018 + k * 0.37) % 1); const x = L + ((k * 131) % (R - L)); c.globalAlpha = 1 - ph; c.beginPath(); c.ellipse(x, wy + 3 + (k % 3) * 4, 3 + ph * 10, 1 + ph * 3, 0, 0, 6.3); c.stroke(); } c.globalAlpha = 1; }
  // juncos y nenúfares
  for (const r of GB.reeds) { const x = r.x - camX; if (x < -20 || x > W + 20) continue; c.strokeStyle = e.sI === 3 ? '#b7a98a' : '#5f8f4a'; c.lineWidth = 1.6; for (let k = 0; k < 4; k++) { const sw = Math.sin(time * 0.0014 + r.x + k) * (2 + e.wind * 4); c.beginPath(); c.moveTo(x + k * 3, GB.gy(r.x + k * 3) + 2); c.quadraticCurveTo(x + k * 3 + sw, GB.gy(r.x) - 14, x + k * 3 + sw * 1.6, GB.gy(r.x) - 26 - k * 3); c.stroke(); } }
  if (e.cover < 0.5) for (const p of GB.pads) { const x = p.x - camX; if (x < -20 || x > W + 20) continue; c.fillStyle = e.sI === 2 ? '#a1a04a' : '#58a05a'; c.beginPath(); c.ellipse(x, wy + 2 + Math.sin(time * 0.001 + p.x) * 0.6, 9, 3, 0, 0, 6.3); c.fill(); if (e.sI === 1 || e.sI === 0) { c.fillStyle = '#f7d7e4'; c.beginPath(); c.arc(x + 2, wy, 2.4, 0, 6.3); c.fill(); } }
}

function gbDrawTree(c, t, e, time, back) {
  const sway = Math.sin(time * 0.0009 + t.x * 0.013) * (0.6 + e.wind * 3.2);
  const gy = back ? 604 : GB.gy(t.x), h = t.h * (back ? 1.1 : 1);
  c.save(); c.translate(t.x - (back ? 0 : 0), gy + 2);
  const trunk = back ? '#6d6a5a' : '#6b4f35'; const snowK = e.cover;
  if (t.type === 'pine') {
    c.fillStyle = trunk; c.fillRect(-4, -h * 0.25, 8, h * 0.25);
    const col = gbPal('pine', e); const tiers = 5;
    for (let i = 0; i < tiers; i++) { const k = i / tiers; const w = (1 - k) * h * 0.34 + 10, yb = -h * 0.14 - k * h * 0.72, th = h * 0.28; const sx = sway * k * 1.4;
      c.fillStyle = col; c.beginPath(); c.moveTo(-w + sx * 0.3, yb); c.lineTo(sx, yb - th); c.lineTo(w + sx * 0.3, yb); c.closePath(); c.fill();
      if (snowK > 0.05) { c.fillStyle = `rgba(250,253,255,${snowK * 0.95})`; c.beginPath(); c.moveTo(-w * 0.78 + sx * 0.3, yb - th * 0.22); c.lineTo(sx, yb - th); c.lineTo(w * 0.78 + sx * 0.3, yb - th * 0.22); c.quadraticCurveTo(sx, yb - th * 0.5, -w * 0.78 + sx * 0.3, yb - th * 0.22); c.fill(); } }
  } else {
    c.fillStyle = trunk; c.beginPath(); c.moveTo(-7, 0); c.quadraticCurveTo(-4, -h * 0.4, -3, -h * 0.62); c.lineTo(3, -h * 0.62); c.quadraticCurveTo(5, -h * 0.4, 8, 0); c.closePath(); c.fill();
    if (!back) { c.strokeStyle = trunk; c.lineWidth = 3; for (const b of t.br) { c.beginPath(); c.moveTo(0, -h * 0.4 + b.dy * 0.2); c.lineTo(b.dx, -b.dy); c.stroke(); } }
    if (t.hollow && !back) { c.fillStyle = '#2b1d12'; c.beginPath(); c.ellipse(0, -h * 0.26, 4.2, 6.2, 0, 0, 6.3); c.fill(); if (e.night > 0.5 && GB.hollowGlow(t)) { c.fillStyle = 'rgba(255,214,120,.65)'; c.beginPath(); c.ellipse(0, -h * 0.26, 3, 5, 0, 0, 6.3); c.fill(); } }
    const col = gbPal(t.type, e); const bare = e.sI === 3 || (e.sI === 2 && e.sT > 0.5 && e.sN === 3);
    const leafK = e.sI === 3 ? 0.0 : (e.sN === 3 && e.sI === 2 ? 1 - e.sT : (e.sI === 0 && e.sT === 0 ? 1 : 1)); const cr = h * 0.36 * (0.55 + 0.45 * leafK);
    const blobs = t.crown; const dk = gbShade(col, -0.16), lt = gbShade(col, 0.2);
    if (leafK > 0.05) { for (const b of blobs) { const sx = sway * 1.3 * (b.y / 60); c.fillStyle = dk; c.beginPath(); c.arc(b.x * cr / 40 + sx + 2, -h * 0.66 + b.y * cr / 40 * 0.9 + 3, b.r * cr / 40 * (0.5 + 0.5 * leafK), 0, 6.3); c.fill(); }
      for (const b of blobs) { const sx = sway * 1.3 * (b.y / 60); c.fillStyle = col; c.beginPath(); c.arc(b.x * cr / 40 + sx, -h * 0.66 + b.y * cr / 40 * 0.9, b.r * cr / 40 * (0.5 + 0.5 * leafK) * 0.94, 0, 6.3); c.fill(); }
      for (const b of blobs.slice(0, 5)) { const sx = sway * 1.3 * (b.y / 60); c.fillStyle = lt; c.beginPath(); c.arc(b.x * cr / 40 + sx - 3, -h * 0.66 + b.y * cr / 40 * 0.9 - 4, b.r * cr / 40 * (0.5 + 0.5 * leafK) * 0.5, 0, 6.3); c.fill(); } }
    if (snowK > 0.05) { c.fillStyle = `rgba(250,253,255,${snowK * 0.92})`; if (leafK <= 0.05) { for (const b of t.br) { c.beginPath(); c.ellipse(b.dx * 0.5, -b.dy * 0.5 - 2, Math.abs(b.dx) * 0.55 + 3, 2.6, 0, 0, 6.3); c.fill(); } } else for (const b of blobs.slice(0, 4)) { c.beginPath(); c.ellipse(b.x * cr / 40, -h * 0.66 + b.y * cr / 40 * 0.9 - b.r * cr / 40 * 0.7, b.r * cr / 40 * 0.7, 3, 0, 0, 6.3); c.fill(); } }
    if (t.type === 'sakura' && e.sI === 0 && e.sT === 0) { c.fillStyle = 'rgba(255,230,238,.6)'; for (const b of blobs.slice(0, 4)) { c.beginPath(); c.arc(b.x * cr / 40 + 3, -h * 0.66 + b.y * cr / 40 * 0.9 - 4, 2.4, 0, 6.3); c.fill(); } }
  }
  c.restore();
}
function gbDrawBush(c, b, e, time) {
  const gy = GB.gy(b.x); const col = gbPal('bush', e); const sw = Math.sin(time * 0.001 + b.x) * (0.5 + e.wind * 2);
  c.fillStyle = col; c.beginPath(); c.arc(b.x - b.w * 0.3 + sw * 0.4, gy - b.w * 0.2, b.w * 0.36, 0, 6.3); c.arc(b.x + sw, gy - b.w * 0.3, b.w * 0.44, 0, 6.3); c.arc(b.x + b.w * 0.3 + sw * 0.4, gy - b.w * 0.2, b.w * 0.34, 0, 6.3); c.fill();
  if (e.cover > 0.05) { c.fillStyle = `rgba(250,253,255,${e.cover * 0.9})`; c.beginPath(); c.ellipse(b.x + sw, gy - b.w * 0.66, b.w * 0.4, 3.4, 0, 0, 6.3); c.fill(); }
  if (b.berry && b.food && b.food.amt > 0.15 && e.sI !== 3) { c.fillStyle = '#c4263a'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(b.x - 10 + k * 5 + sw, gy - b.w * 0.25 - (k % 2) * 7, 2.2, 0, 6.3); c.fill(); } }
}
function gbDrawGrass(c, f, e, time) {
  if (f.kind !== 'grass') return; const gy = GB.gy(f.x); const a = Math.max(0.18, f.amt); const col = gbPal('grassA', e); const dk = gbPal('grassB', e);
  const n = 7; for (let i = 0; i < n; i++) { const x = f.x - 14 + i * 4.6; const sw = Math.sin(time * 0.0016 + x * 0.1) * (1.6 + e.wind * 4); c.strokeStyle = i % 2 ? col : dk; c.lineWidth = 1.7; c.beginPath(); c.moveTo(x, gy + 1); c.quadraticCurveTo(x + sw * 0.4, gy - 6 * a, x + sw, gy - (8 + (i % 3) * 3) * a); c.stroke(); }
  if (f.flower && f.amt > 0.45) { c.fillStyle = gbPal('flower1', e); c.beginPath(); c.arc(f.x + 2, gy - 12 * a, 2.6, 0, 6.3); c.fill(); c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(f.x + 2, gy - 12 * a, 1, 0, 6.3); c.fill(); }
}
function gbDrawRockMounds(c, e) {
  for (const r of GB.rocks) {
    const gy = GB.gy(r.x); c.fillStyle = e.cover > 0.2 ? '#7d8691' : '#7c7a72'; c.beginPath(); c.moveTo(r.x - r.w, gy + 2); c.quadraticCurveTo(r.x - r.w * 0.6, gy - r.h, r.x - r.w * 0.1, gy - r.h); c.quadraticCurveTo(r.x + r.w * 0.5, gy - r.h * 0.9, r.x + r.w, gy + 2); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(r.x - r.w * 0.25, gy - r.h * 0.7, r.w * 0.3, r.h * 0.15, -0.3, 0, 6.3); c.fill();
    if (e.cover > 0.05) { c.fillStyle = `rgba(250,253,255,${e.cover})`; c.beginPath(); c.moveTo(r.x - r.w * 0.75, gy - r.h * 0.5); c.quadraticCurveTo(r.x - r.w * 0.3, gy - r.h * 1.08, r.x + r.w * 0.1, gy - r.h * 0.98); c.quadraticCurveTo(r.x + r.w * 0.5, gy - r.h * 0.92, r.x + r.w * 0.7, gy - r.h * 0.42); c.quadraticCurveTo(r.x, gy - r.h * 0.7, r.x - r.w * 0.75, gy - r.h * 0.5); c.fill(); }
  }
}
function gbDrawHome(c, h, e, time) {
  const gy = h.y == null ? GB.gy(h.x) : h.y;
  if (h.kind === 'burrow') { c.fillStyle = '#3a2a1c'; c.beginPath(); c.ellipse(h.x, gy - 1, 9, 6, 0, Math.PI, 0); c.fill(); c.fillStyle = gbPal('grassB', e); c.beginPath(); c.ellipse(h.x - 10, gy, 8, 3, 0, 0, 6.3); c.ellipse(h.x + 10, gy, 8, 3, 0, 0, 6.3); c.fill(); }
  else if (h.kind === 'den') { c.fillStyle = '#2f2118'; c.beginPath(); c.moveTo(h.x - 16, gy + 1); c.quadraticCurveTo(h.x - 14, gy - 18, h.x, gy - 18); c.quadraticCurveTo(h.x + 14, gy - 18, h.x + 16, gy + 1); c.closePath(); c.fill(); }
  else if (h.kind === 'cave') { c.fillStyle = '#6f6c66'; c.beginPath(); c.moveTo(h.x - 70, gy + 2); c.quadraticCurveTo(h.x - 60, gy - 80, h.x - 8, gy - 92); c.quadraticCurveTo(h.x + 50, gy - 88, h.x + 70, gy + 2); c.closePath(); c.fill(); if (e.cover > 0.05) { c.fillStyle = `rgba(250,253,255,${e.cover})`; c.beginPath(); c.moveTo(h.x - 52, gy - 52); c.quadraticCurveTo(h.x - 30, gy - 96, h.x + 5, gy - 92); c.quadraticCurveTo(h.x + 40, gy - 88, h.x + 54, gy - 50); c.quadraticCurveTo(h.x, gy - 70, h.x - 52, gy - 52); c.fill(); } c.fillStyle = '#1d1712'; c.beginPath(); c.moveTo(h.x - 22, gy + 2); c.quadraticCurveTo(h.x - 22, gy - 36, h.x, gy - 38); c.quadraticCurveTo(h.x + 22, gy - 36, h.x + 22, gy + 2); c.closePath(); c.fill(); }
  else if (h.kind === 'cliff') { c.fillStyle = '#77736c'; c.beginPath(); c.moveTo(h.x - 34, gy + 2); c.lineTo(h.x - 22, gy - 230); c.lineTo(h.x - 6, gy - 262); c.lineTo(h.x + 16, gy - 236); c.lineTo(h.x + 34, gy + 2); c.closePath(); c.fill(); if (e.cover > 0.05) { c.fillStyle = `rgba(250,253,255,${e.cover})`; c.beginPath(); c.moveTo(h.x - 8, gy - 262); c.lineTo(h.x + 16, gy - 236); c.lineTo(h.x + 4, gy - 224); c.lineTo(h.x - 20, gy - 232); c.fill(); } c.strokeStyle = '#4e3f2c'; c.lineWidth = 3; c.beginPath(); c.moveTo(h.x - 20, gy - 238); c.quadraticCurveTo(h.x, gy - 226, h.x + 20, gy - 238); c.stroke(); }
  else if (h.kind === 'thicket') { c.fillStyle = gbPal('bush', e); for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(h.x - 24 + k * 16, gy - 10 - (k % 2) * 6, 17, 0, 6.3); c.fill(); } }
}
function gbDrawNest(c, x, y) { c.fillStyle = '#7a5d3a'; c.beginPath(); c.ellipse(x, y, 7, 3.2, 0, 0, 3.1416); c.fill(); c.strokeStyle = '#5b432a'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 7, y); c.lineTo(x + 7, y); c.stroke(); }
function gbDrawMush(c, m, e) { const gy = GB.gy(m.x); if (e.sI === 3) return; const k = e.sI === 2 ? 1 : 0.55; c.fillStyle = '#f4efe2'; c.fillRect(m.x - 1.4, gy - 6 * k, 2.8, 6 * k); c.fillStyle = m.c; c.beginPath(); c.ellipse(m.x, gy - 6 * k, 5 * k + 1, 3.6 * k + 1, 0, Math.PI, 0); c.fill(); c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(m.x - 1.6, gy - 7.2 * k, 0.9, 0, 6.3); c.fill(); }

/* ---------- animales ---------- */
function gbDrawAnimal(c, a, e, time) {
  const sp = GB.SP[a.sp]; if (a.hidden || a.dead) return;
  const s = sp.size * (a.age == null ? 1 : 0.55 + 0.45 * a.age); const x = a.x, y = a.y;
  c.save(); c.translate(x, y); c.scale(a.dir < 0 ? -s : s, s);
  const mv = a.moving ? 1 : 0, ph = a.ph, run = a.running ? 1 : 0;
  const head = a.state === 'graze' || a.state === 'drink' || a.state === 'peck' || a.state === 'fish' ? 1 : 0;
  const rest = a.state === 'rest' || a.state === 'sleep' ? 1 : 0;
  const fn = GB.DRAW[a.sp]; if (fn) fn(c, a, { mv, ph, run, head, rest, e, time });
  c.restore();
  if (a.sel) { c.save(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(x, a.sp === 'fish' ? y : y + 2, 18 * s, 5, 0, 0, 6.3); c.stroke(); c.restore(); }
  if (a.state === 'sleep' || a.state === 'hib') { c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '600 11px system-ui'; const z = (time * 0.002) % 3; for (let k = 0; k < 2; k++) { const kk = (z + k * 1.5) % 3; c.globalAlpha = 1 - kk / 3; c.fillText('z', x + 8 + kk * 4, y - 22 * s - kk * 8); } c.globalAlpha = 1; }
}
const gbLeg = (c, x, y, len, sw, col, w = 2.4) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + sw, y + len); c.stroke(); };
Object.assign(GB.DRAW, {
  rabbit(c, a, o) { const hop = o.mv ? Math.abs(Math.sin(o.ph * (o.run ? 1.6 : 1))) * (o.run ? 9 : 4) : 0; c.translate(0, -hop);
    const col = a.col || '#d6c7b0', dk = '#b9a78d';
    c.fillStyle = '#fff'; c.beginPath(); c.arc(-12, -9, 3.4, 0, 6.3); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(0, -8, 12, 8, 0, 0, 6.3); c.fill(); c.fillStyle = dk; c.beginPath(); c.ellipse(-5, -4, 6, 5, 0, 0, 6.3); c.fill();
    const hx = 11, hy = o.head ? -3 : o.rest ? -5 : -14; c.fillStyle = col; c.beginPath(); c.ellipse(hx, hy, 6.4, 5.6, 0, 0, 6.3); c.fill();
    c.fillStyle = col; const ea = o.rest ? 1.2 : 0.2; for (const k of [-1, 1]) { c.save(); c.translate(hx - 1 + k * 2, hy - 4); c.rotate(-ea + k * 0.22); c.beginPath(); c.ellipse(0, -7, 2.3, 8, 0, 0, 6.3); c.fill(); c.fillStyle = '#f0b8c0'; c.beginPath(); c.ellipse(0, -7, 1, 5.4, 0, 0, 6.3); c.fill(); c.fillStyle = col; c.restore(); }
    c.fillStyle = '#2b2118'; c.beginPath(); c.arc(hx + 3, hy - 1, 1.2, 0, 6.3); c.fill(); c.fillStyle = '#e9a3ae'; c.beginPath(); c.arc(hx + 6.4, hy + 0.6, 1, 0, 6.3); c.fill(); },
  deer(c, a, o) { const col = '#b8804d', lt = '#d9b48a'; const sw = o.mv ? Math.sin(o.ph) * (o.run ? 12 : 7) : 0;
    if (!o.rest) { gbLeg(c, -14, -16, 17, -sw, '#7d5535', 2.6); gbLeg(c, 12, -16, 17, sw, '#7d5535', 2.6); }
    c.fillStyle = col; const by = o.rest ? -9 : -26; c.beginPath(); c.ellipse(0, by, 23, 11, 0, 0, 6.3); c.fill(); c.fillStyle = lt; c.beginPath(); c.ellipse(2, by + 5, 18, 5, 0, 0, 6.3); c.fill();
    c.fillStyle = 'rgba(255,255,255,.7)'; for (const [dx, dy] of [[-10, -4], [-2, -7], [8, -3], [-14, 1], [4, 1]]) { c.beginPath(); c.arc(dx, by + dy, 1.5, 0, 6.3); c.fill(); }
    if (!o.rest) { gbLeg(c, -17, -16, 17, sw, col, 2.6); gbLeg(c, 15, -16, 17, -sw, col, 2.6); }
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-23, by - 3, 3, 4, 0.4, 0, 6.3); c.fill();
    const nx = 19, ny = o.head ? by + 4 : by - 12; c.strokeStyle = col; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(14, by - 4); c.lineTo(nx + (o.head ? 5 : 0), ny - (o.head ? -6 : 2)); c.stroke();
    const hx = nx + (o.head ? 9 : 5), hy = o.head ? 0 : ny - 10; c.fillStyle = col; c.beginPath(); c.ellipse(hx, o.head ? -2 : hy, 8, 5, o.head ? 0.7 : -0.2, 0, 6.3); c.fill();
    c.fillStyle = '#2b2118'; c.beginPath(); c.arc(hx + 3, (o.head ? -3 : hy) - 1, 1.3, 0, 6.3); c.fill(); c.beginPath(); c.arc(hx + 8, o.head ? 1 : hy + 1, 1.4, 0, 6.3); c.fill();
    if (a.male) { c.strokeStyle = '#6a4a2e'; c.lineWidth = 1.8; const ay = o.head ? -8 : hy - 5; c.beginPath(); c.moveTo(hx - 3, ay); c.lineTo(hx - 6, ay - 10); c.lineTo(hx - 12, ay - 14); c.moveTo(hx - 6, ay - 10); c.lineTo(hx - 3, ay - 16); c.moveTo(hx - 1, ay); c.lineTo(hx + 1, ay - 9); c.lineTo(hx - 3, ay - 15); c.stroke(); }
    else { c.fillStyle = col; c.beginPath(); c.ellipse(hx - 4, o.head ? -7 : hy - 5, 2, 4, -0.4, 0, 6.3); c.fill(); } },
  fox(c, a, o) { const col = '#dc7a30', sw = o.mv ? Math.sin(o.ph) * (o.run ? 9 : 5) : 0, by = o.rest ? -7 : -13;
    c.fillStyle = col; c.beginPath(); c.moveTo(-14, by + 2); c.quadraticCurveTo(-34, by + (o.rest ? 2 : -10) - sw * 0.2, -36, by + 6); c.quadraticCurveTo(-24, by + 8, -14, by + 8); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(-34, by + 4, 3.6, 0, 6.3); c.fill();
    if (!o.rest) { gbLeg(c, -10, -8, 8, -sw, '#3a2a20', 2.2); gbLeg(c, 10, -8, 8, sw, '#3a2a20', 2.2); }
    c.fillStyle = col; c.beginPath(); c.ellipse(0, by, 17, 8, 0, 0, 6.3); c.fill(); c.fillStyle = '#fff3e0'; c.beginPath(); c.ellipse(8, by + 3, 8, 4, 0, 0, 6.3); c.fill();
    if (!o.rest) { gbLeg(c, -13, -8, 8, sw, '#3a2a20', 2.2); gbLeg(c, 13, -8, 8, -sw, '#3a2a20', 2.2); }
    const hx = 19, hy = o.head ? by + 6 : by - 5; c.fillStyle = col; c.beginPath(); c.ellipse(hx, hy, 7, 5.4, 0, 0, 6.3); c.fill(); c.beginPath(); c.moveTo(hx + 4, hy - 2); c.lineTo(hx + 14, hy + 2); c.lineTo(hx + 4, hy + 4); c.fill(); c.fillStyle = '#2b2118'; c.beginPath(); c.arc(hx + 14, hy + 1.6, 1.3, 0, 6.3); c.arc(hx + 2.5, hy - 1.2, 1.1, 0, 6.3); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(hx - 4, hy - 3); c.lineTo(hx - 3, hy - 11); c.lineTo(hx + 2, hy - 4); c.fill(); c.beginPath(); c.moveTo(hx, hy - 4); c.lineTo(hx + 3, hy - 11); c.lineTo(hx + 5, hy - 3); c.fill(); },
  wolf(c, a, o) { const col = '#7f8896', dk = '#59606b', sw = o.mv ? Math.sin(o.ph) * (o.run ? 11 : 6) : 0, by = o.rest ? -9 : -19;
    c.fillStyle = dk; c.beginPath(); c.moveTo(-18, by); c.quadraticCurveTo(-34, by + 6, -36, by + 16); c.quadraticCurveTo(-26, by + 10, -16, by + 8); c.fill();
    if (!o.rest) { gbLeg(c, -13, -12, 12, -sw, dk, 3); gbLeg(c, 13, -12, 12, sw, dk, 3); }
    c.fillStyle = col; c.beginPath(); c.ellipse(0, by, 22, 10, 0, 0, 6.3); c.fill(); c.fillStyle = '#c9ced6'; c.beginPath(); c.ellipse(8, by + 4, 11, 5, 0, 0, 6.3); c.fill();
    if (!o.rest) { gbLeg(c, -17, -12, 12, sw, col, 3); gbLeg(c, 17, -12, 12, -sw, col, 3); }
    const hx = 25, hy = o.head ? by + 9 : by - 6; c.fillStyle = col; c.beginPath(); c.ellipse(hx, hy, 8.5, 6.4, 0, 0, 6.3); c.fill(); c.fillStyle = '#c9ced6'; c.beginPath(); c.moveTo(hx + 4, hy - 2); c.lineTo(hx + 16, hy + 3); c.lineTo(hx + 4, hy + 5); c.fill(); c.fillStyle = '#1e1a18'; c.beginPath(); c.arc(hx + 16, hy + 2.4, 1.5, 0, 6.3); c.arc(hx + 3, hy - 1.4, 1.2, 0, 6.3); c.fill();
    c.fillStyle = dk; c.beginPath(); c.moveTo(hx - 5, hy - 4); c.lineTo(hx - 4, hy - 14); c.lineTo(hx + 1, hy - 5); c.fill(); c.beginPath(); c.moveTo(hx - 1, hy - 5); c.lineTo(hx + 3, hy - 14); c.lineTo(hx + 6, hy - 4); c.fill(); },
  squirrel(c, a, o) { const col = '#a8683a', up = a.climbing ? 1 : 0; if (up) c.rotate(-1.35);
    const hop = o.mv && !up ? Math.abs(Math.sin(o.ph * 1.4)) * 3 : 0; c.translate(0, -hop);
    c.fillStyle = col; c.beginPath(); c.moveTo(-6, -6); c.quadraticCurveTo(-24, -2, -20, -26); c.quadraticCurveTo(-14, -30, -9, -20); c.quadraticCurveTo(-6, -12, -2, -8); c.fill(); c.fillStyle = '#c98a55'; c.beginPath(); c.ellipse(-16, -20, 3, 7, 0.3, 0, 6.3); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(0, -8, 8, 6.4, -0.3, 0, 6.3); c.fill(); c.fillStyle = '#f0dcc0'; c.beginPath(); c.ellipse(3, -5, 4.6, 3.6, 0, 0, 6.3); c.fill();
    const hx = 8, hy = o.head ? -7 : -14; c.fillStyle = col; c.beginPath(); c.arc(hx, hy, 4.8, 0, 6.3); c.fill(); c.beginPath(); c.moveTo(hx - 3, hy - 3); c.lineTo(hx - 2, hy - 9); c.lineTo(hx + 1, hy - 4); c.fill(); c.fillStyle = '#2b2118'; c.beginPath(); c.arc(hx + 2, hy - 0.6, 1, 0, 6.3); c.arc(hx + 4.8, hy + 1.2, 0.9, 0, 6.3); c.fill();
    if (a.state === 'graze') { c.fillStyle = '#8b6a3c'; c.beginPath(); c.ellipse(hx + 4, hy + 4, 2.4, 3, 0, 0, 6.3); c.fill(); } },
  bird(c, a, o) { const fl = a.flying; const col = a.col || '#c4533e'; const wf = fl ? Math.sin(o.ph * 5) : 0; const by = fl ? 0 : -8;
    c.fillStyle = '#6b5a4a'; c.beginPath(); c.moveTo(-5, by); c.lineTo(-14, by + 3 + wf * 2); c.lineTo(-5, by + 4); c.fill();
    c.fillStyle = col; c.beginPath(); c.ellipse(0, by, 7, 5.2, 0, 0, 6.3); c.fill(); c.fillStyle = '#f4d3a0'; c.beginPath(); c.ellipse(2, by + 2, 4.6, 3, 0, 0, 6.3); c.fill();
    c.fillStyle = '#8a4a3a'; c.save(); c.translate(-1, by - 1); c.rotate(fl ? wf * 0.9 - 0.4 : -0.1); c.beginPath(); c.ellipse(-2, -3, 7, 3, -0.2, 0, 6.3); c.fill(); c.restore();
    const hx = 6, hy = by - (o.head ? -2 : 4); c.fillStyle = col; c.beginPath(); c.arc(hx, hy, 3.6, 0, 6.3); c.fill(); c.fillStyle = '#f0b43a'; c.beginPath(); c.moveTo(hx + 3, hy - 0.8); c.lineTo(hx + 8, hy + 0.6); c.lineTo(hx + 3, hy + 1.6); c.fill(); c.fillStyle = '#1b1410'; c.beginPath(); c.arc(hx + 1.2, hy - 1, 0.9, 0, 6.3); c.fill();
    if (!fl) { c.strokeStyle = '#6a5a48'; c.lineWidth = 1; c.beginPath(); c.moveTo(-1, by + 4); c.lineTo(-1, by + 8); c.moveTo(2, by + 4); c.lineTo(2, by + 8); c.stroke(); } },
  eagle(c, a, o) { const wf = Math.sin(o.ph * 1.6) * (a.diving ? 0.2 : 0.55); c.fillStyle = '#5a4128';
    for (const k of [-1, 1]) { c.save(); c.rotate(k * (0.1 + wf * 0.3)); c.beginPath(); c.moveTo(0, -2); c.quadraticCurveTo(k * 22, -16 - wf * 12, k * 52, -6 + wf * 10); c.quadraticCurveTo(k * 30, 2, k * 8, 4); c.fill(); c.restore(); }
    c.fillStyle = '#6b4c2e'; c.beginPath(); c.ellipse(0, 0, 14, 5.4, 0, 0, 6.3); c.fill(); c.fillStyle = '#f7f2e8'; c.beginPath(); c.arc(13, -2, 4.6, 0, 6.3); c.fill(); c.fillStyle = '#f0b43a'; c.beginPath(); c.moveTo(16, -3); c.lineTo(22, -0.6); c.lineTo(16, 0.6); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-24, 3); c.lineTo(-12, 5); c.fill(); },
  owl(c, a, o) { const fl = a.flying; const wf = fl ? Math.sin(o.ph * 4) : 0; const col = '#8a7a66';
    if (fl) { c.fillStyle = '#6f6254'; for (const k of [-1, 1]) { c.save(); c.rotate(k * wf * 0.5); c.beginPath(); c.ellipse(k * 11, -8, 12, 4, k * 0.4, 0, 6.3); c.fill(); c.restore(); } }
    c.fillStyle = col; c.beginPath(); c.ellipse(0, -10, 8, 11, 0, 0, 6.3); c.fill(); c.fillStyle = '#d8c8a8'; c.beginPath(); c.ellipse(0, -7, 5, 7, 0, 0, 6.3); c.fill();
    c.fillStyle = col; c.beginPath(); c.moveTo(-7, -19); c.lineTo(-6, -26); c.lineTo(-2, -20); c.fill(); c.beginPath(); c.moveTo(7, -19); c.lineTo(6, -26); c.lineTo(2, -20); c.fill();
    const eye = a.state === 'sleep' ? 0.3 : 3; c.fillStyle = '#f7e27a'; c.beginPath(); c.arc(-3.4, -16, eye, 0, 6.3); c.arc(3.4, -16, eye, 0, 6.3); c.fill(); c.fillStyle = '#1b1410'; c.beginPath(); c.arc(-3.4, -16, eye * 0.45, 0, 6.3); c.arc(3.4, -16, eye * 0.45, 0, 6.3); c.fill(); c.fillStyle = '#e0a23a'; c.beginPath(); c.moveTo(-1.2, -14); c.lineTo(1.2, -14); c.lineTo(0, -11); c.fill(); },
  bear(c, a, o) { const col = '#6d4b36', dk = '#4f3526', sw = o.mv ? Math.sin(o.ph * 0.8) * 5 : 0; const stand = a.state === 'fish' ? 1 : 0;
    if (!o.rest) { gbLeg(c, -16, -14, 14, -sw, dk, 6); gbLeg(c, 16, -14, 14, sw, dk, 6); }
    c.fillStyle = col; c.beginPath(); c.ellipse(0, o.rest ? -12 : -26, 30, o.rest ? 14 : 19, stand ? -0.5 : 0, 0, 6.3); c.fill();
    if (!o.rest) { gbLeg(c, -22, -14, 14, sw, col, 6.4); gbLeg(c, 22, -14, 14, -sw, col, 6.4); }
    const hx = 30, hy = o.head ? -10 : o.rest ? -12 : -30; c.fillStyle = col; c.beginPath(); c.ellipse(hx, hy, 12, 10, 0, 0, 6.3); c.fill(); c.fillStyle = '#c9a77c'; c.beginPath(); c.ellipse(hx + 8, hy + 3, 6, 4.4, 0, 0, 6.3); c.fill(); c.fillStyle = '#1b1410'; c.beginPath(); c.arc(hx + 13, hy + 1.6, 1.8, 0, 6.3); c.arc(hx + 3, hy - 2.6, 1.4, 0, 6.3); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(hx - 5, hy - 9, 4, 0, 6.3); c.arc(hx + 3, hy - 10, 4, 0, 6.3); c.fill(); },
  frog(c, a, o) { const hop = o.mv ? Math.abs(Math.sin(o.ph * 1.3)) * 6 : 0; c.translate(0, -hop); c.fillStyle = '#5da84a'; c.beginPath(); c.ellipse(0, -4, 6.5, 4.4, 0, 0, 6.3); c.fill(); c.fillStyle = '#d6efb0'; c.beginPath(); c.ellipse(1, -2, 4.4, 2.4, 0, 0, 6.3); c.fill(); c.fillStyle = '#5da84a'; c.beginPath(); c.arc(3, -9, 2.8, 0, 6.3); c.arc(-1, -9, 2.8, 0, 6.3); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(3.2, -9.3, 1.3, 0, 6.3); c.arc(-0.8, -9.3, 1.3, 0, 6.3); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(3.6, -9.3, 0.7, 0, 6.3); c.arc(-0.4, -9.3, 0.7, 0, 6.3); c.fill(); },
  fish(c, a, o) { const w = Math.sin(o.ph * 2) * 2; c.globalAlpha = 0.78; c.fillStyle = a.col || '#e9a54b'; c.beginPath(); c.ellipse(0, 0, 8, 3.4, 0, 0, 6.3); c.fill(); c.beginPath(); c.moveTo(-6, 0); c.lineTo(-13, -4 + w); c.lineTo(-13, 4 + w); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(4.5, -0.8, 0.9, 0, 6.3); c.fill(); c.globalAlpha = 1; },
});

/* ---------- clima: partículas y relámpagos ---------- */
function gbDrawFog(c, W, H, e, time) {
  if (e.fog <= 0.02) return; const g = c.createLinearGradient(0, 330, 0, 640); g.addColorStop(0, 'rgba(225,232,238,0)'); g.addColorStop(0.5, `rgba(225,232,238,${e.fog * 0.55})`); g.addColorStop(1, `rgba(225,232,238,${e.fog * 0.3})`); c.fillStyle = g; c.fillRect(0, 330, W, 320);
  c.fillStyle = `rgba(235,240,245,${e.fog * 0.2})`; for (let i = 0; i < 5; i++) { const x = ((i * 260 + time * 0.012 * (1 + i * 0.3)) % (W + 400)) - 200; c.beginPath(); c.ellipse(x, 500 + i * 22, 220, 26, 0, 0, 6.3); c.fill(); }
}
function gbDrawLightning(c, W, H, e) {
  const f = GB.flash; if (f.a > 0.01) { c.fillStyle = `rgba(235,240,255,${f.a * 0.55})`; c.fillRect(0, GB.top || 0, W, H - (GB.top || 0)); }
  if (GB.bolt && GB.bolt.life > 0) { const b = GB.bolt; c.save(); c.globalAlpha = Math.min(1, b.life * 5); c.strokeStyle = '#f4f7ff'; c.lineWidth = 3; c.shadowColor = '#b9c8ff'; c.shadowBlur = 16; c.beginPath(); b.pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); c.lineWidth = 1.5; for (const br of b.br) { c.beginPath(); br.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); } c.restore(); }
}
function gbDrawRainbow(c, W, e) {
  if (e.rainbow <= 0.02) return; const cx = W * 0.38, cy = 600, r0 = 330; const cols = ['#ff5a5a', '#ffa24a', '#ffe05a', '#6fd36f', '#5ab4ff', '#6a6aff', '#b36aff'];
  c.save(); c.globalAlpha = e.rainbow * 0.34 * gbSm((e.sunAlt + 0.02) / 0.3); c.lineWidth = 8; cols.forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(cx, cy, r0 - i * 8, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); }); c.restore();
}
