/* Cinnavia 7.53 — MUNDOS · dibujo del mundo, cámara con zoom, selector y fichas de cada animal. */
'use strict';
const MDV = { bubbles: [], cv: null, ctx: null, camX: 0, camY: 0, zoom: 1, sel: null, follow: false, auto: true, autoDir: 1, raf: 0, last: 0, paused: false, q: 1, ui: 0, tab: 'info', grpOpen: null, drag: false, lastUser: 0 };
const MD_GRP_ORDER = ['Bosques y praderas', 'Selvas y humedales', 'Montañas', 'Mundos helados', 'Desiertos y sabanas', 'Ríos y lagos', 'Costas', 'Océanos', 'Mundos de fantasía'];
const MD_DIET_TXT = { h: 'Herbívoro', c: 'Carnívoro', o: 'Omnívoro', k: 'Come algas', f: 'Filtra plancton' };
const MD_PAT_TXT = { d: 'De día', n: 'De noche', c: 'Al amanecer y al atardecer', a: 'A cualquier hora' };
const MD_HAB_TXT = { L: 'Tierra', A: 'Aire y árboles', W: 'Agua', M: 'Tierra y agua', T: 'Árboles', U: 'Bajo tierra' };
const MD_FOOD_TXT = { h: 'pasto, hojas y semillas', o: 'frutas, semillas y animalitos', k: 'algas y plantas del agua', f: 'plancton diminuto' };

/* ---------- dibujo ---------- */
function mdVW() { return MDV.cv ? MDV.cv.width / mdK() : 800; }
function mdK() { return (MDV.cv ? MDV.cv.height : 720) / 720 * MDV.zoom; }
function mdDraw(ts) {
  const c = MDV.ctx, cv = MDV.cv, W = MDS.def, E = MDS.E; if (!c || !W || !E) return; const time = ts || performance.now();
  const k = mdK(), vw = cv.width / k, vh = cv.height / k; const sh = MDS.shake > 0 ? (Math.random() - 0.5) * 7 * MDS.shake : 0;
  const camX = MDV.camX + sh, camY = MDV.camY + (MDS.shake > 0 ? (Math.random() - 0.5) * 5 : 0);
  c.setTransform(1, 0, 0, 1, 0, 0);
  /* cielo o mar */
  if (MDS.sea) { const g = c.createLinearGradient(0, 0, 0, cv.height); const sTop = (MDS.S - camY) * k; g.addColorStop(0, mdSkyColors(E.p, E.night, E.gloom)[0]); g.addColorStop(mdCl(sTop / cv.height, 0.01, 0.99), mdSkyColors(E.p, E.night, E.gloom)[1]); c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height); if (sTop > 0) { c.save(); c.beginPath(); c.rect(0, 0, cv.width, Math.max(0, sTop)); c.clip(); mdDrawSky(c, cv.width, Math.max(sTop, 120), E, W, time); mdDrawClouds(c, cv.width, Math.max(sTop, 120), E, time, camX); c.restore(); } }
  else { mdDrawSky(c, cv.width, cv.height * Math.min(1, (MDS.S - camY) / vh + 0.1), E, W, time); mdDrawClouds(c, cv.width, Math.max(60, (MDS.S - 40 - camY) * k), E, time, camX); }
  c.setTransform(k, 0, 0, k, 0, -camY * k);
  if (!MDS.sea) mdDrawFar(c, vw, MDS.S + 200, W, E, camX, MDS.S);
  if (E.rainbow > 0.05 && !MDS.sea) mdDrawRainbow(c, vw, E);
  c.setTransform(k, 0, 0, k, -camX * k, -camY * k);
  const x0 = camX - 260, x1 = camX + vw + 260;
  mdDrawGround(c, x0, x1, W, E, time);
  if (typeof mdDrawUnder === 'function' && !MDS.sea) mdDrawUnder(c, x0, x1, camY, camY + vh, time, E);
  mdDrawWater(c, x0, x1, W, E, time, false);
  /* objetos ordenados por profundidad */
  const items = [];
  for (const f of MDS.fl) { if (f.x < x0 - 200 || f.x > x1 + 200) continue; items.push({ y: f.under ? f.y - 0.5 : (MD_TREES.has(f.kind) || f.kind === 'barn' || f.kind === 'igloo' || f.kind === 'dune' ? f.y - 1 - (f.kind === 'barn' ? 2 : 0) : f.y), f }); }
  for (const a of MDS.an) { if (a.dead || a.x < x0 || a.x > x1) continue; if (a.layer === 'under') continue; const yy = a.layer === 'air' && a.flying ? 9000 : a.layer === 'water' || a.layer === 'floor' ? a.y - 1000 : a.y + 0.01; items.push({ y: yy, a }); }
  for (const n of MDS.nests) if (n.x > x0 && n.x < x1) items.push({ y: n.tree ? n.tree.y - 0.5 : n.y + 0.02, n });
  for (const r of MDS.rafts) if (r.x > x0 - 100 && r.x < x1 + 100) items.push({ y: r.y + 0.03, r });
  const tor = MDS.ev.find((e) => e.type === 'tornado'); if (tor) items.push({ y: mdGY(tor.x) + 40, tor });
  if (typeof mdBugItems === 'function') mdBugItems(items, x0, x1);
  items.sort((p, q) => p.y - q.y); MDV.bubbles = [];
  const snowy = E.ice || (W.clim.t < 0.3);
  for (const it of items) {
    if (it.f) { c.save(); c.translate(it.f.x, it.f.y + (it.f.kind === 'iceberg' ? Math.sin(time * 0.001 + it.f.seed) * 2 : 0)); mdDrawFlora(c, it.f, W, time, snowy, E.wind); c.restore(); }
    else if (it.a) mdDrawAnimal(c, it.a, time);
    else if (it.n) { c.save(); c.translate(it.n.x, it.n.y); mdDrawNest(c, it.n, time); c.restore(); }
    else if (it.r) mdDrawRaft(c, it.r);
    else if (it.tor) mdDrawTornado(c, it.tor, time);
    else if (it.bug) it.draw(c, time);
  }
  mdDrawWater(c, x0, x1, W, E, time, true);
  mdDrawFrontGrass(c, x0, x1, W, time);
  mdDrawParts(c, x0, x1, time);
  /* rayo */
  if (MDS.bolt) { const b = MDS.bolt, r = mdRng(Math.floor(b.seed * 100)); c.strokeStyle = '#fffbe0'; c.lineWidth = 3.2; c.shadowColor = '#fff6b0'; c.shadowBlur = 18; c.beginPath(); let x = b.x + (r() - 0.5) * 80, y = camY - 10; c.moveTo(x, y); while (y < b.y) { y += 30 + r() * 30; x += (r() - 0.5) * 50; if (y > b.y) { y = b.y; x = b.x; } c.lineTo(x, y); } c.stroke(); c.shadowBlur = 0; }
  /* selección */
  if (MDV.sel && !MDV.sel.dead) { const a = MDV.sel, s = 14 + a.S.z * 10 * (0.5 + a.age * 0.5); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2 / MDV.zoom; c.setLineDash([5 / MDV.zoom, 4 / MDV.zoom]); c.beginPath(); c.ellipse(a.x, a.y + (a.layer === 'water' ? 0 : -2), s * 1.2, s * 0.32, 0, 0, mdTau); c.stroke(); c.setLineDash([]); }
  /* clima en pantalla */
  c.setTransform(1, 0, 0, 1, 0, 0); mdDrawWeather(c, cv.width, cv.height, E, time, camY, k);
}
function mdDrawRainbow(c, vw, E) { const cx = vw * 0.6, cy = MDS.S + 40, R0 = 380; const cs = ['#ff5a5a', '#ffa23a', '#ffe14a', '#5ad06a', '#4aa0ff', '#7a5aff']; c.save(); c.globalAlpha = E.rainbow * 0.45; c.lineWidth = 11; cs.forEach((col, i) => { c.strokeStyle = col; c.beginPath(); c.arc(cx, cy, R0 - i * 11, Math.PI, 0); c.stroke(); }); c.restore(); }
function mdDrawGround(c, x0, x1, W, E, time) {
  const step = 8, sea = MDS.sea, snow = E.ice || W.clim.t < 0.25 || (W.clim.sn && E.snow > 0.9);
  const g1 = snow && !sea ? '#f2f6f9' : W.pal.g1, g2 = snow && !sea ? '#dbe6ee' : W.pal.g2;
  /* tierra profunda */
  c.fillStyle = W.pal.soil; c.beginPath(); c.moveTo(x0, 1300); for (let x = x0; x <= x1 + step; x += step) c.lineTo(x, mdGY(x) + (sea ? 0 : 40)); c.lineTo(x1 + step, 1300); c.fill();
  if (!sea) { const gd = c.createLinearGradient(0, MDS.S, 0, 1200); gd.addColorStop(0, 'rgba(0,0,0,0)'); gd.addColorStop(0.35, 'rgba(40,24,10,.25)'); gd.addColorStop(1, 'rgba(20,12,6,.6)'); c.fillStyle = gd; c.fillRect(x0, MDS.S, x1 - x0 + 20, 800); }
  /* pradera (franja donde caminan) */
  const gr = c.createLinearGradient(0, MDS.S - 80, 0, MDS.S + 60); gr.addColorStop(0, g1); gr.addColorStop(1, g2); c.fillStyle = sea ? mdSh(W.pal.g1, -0.05) : gr;
  c.beginPath(); c.moveTo(x0, mdGY(x0) + 44); for (let x = x0; x <= x1 + step; x += step) c.lineTo(x, mdGY(x)); for (let x = x1 + step; x >= x0; x -= step) c.lineTo(x, mdGY(x) + (sea ? 18 : 44)); c.fill();
  /* orilla de tierra */
  c.strokeStyle = sea ? mdSh(W.pal.g1, -0.15) : mdSh(g2, -0.12); c.lineWidth = 2; c.beginPath(); for (let x = x0; x <= x1 + step; x += step) { const y = mdGY(x) + 44; if (x === x0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
  /* textura de pasto */
  if (!sea) { c.strokeStyle = mdSh(g1, 0.12); c.lineWidth = 1.2; for (let x = Math.floor(x0 / 22) * 22; x < x1; x += 22) { const y = mdGY(x) + 6 + (mdHash(x) * 30); if (mdDepth(x) > 0) continue; const sw = Math.sin(time * 0.0006 + x * 0.01) * 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2 + sw, y - 6); c.moveTo(x + 4, y); c.lineTo(x + 3 + sw, y - 5); c.stroke(); } }
  else { c.fillStyle = mdSh(W.pal.g1, 0.12); for (let x = Math.floor(x0 / 40) * 40; x < x1; x += 40) mdE(c, x + mdHash(x) * 20, mdGY(x) + 6, 3, 1.4); }
}
function mdWaterSegs(x0, x1) { const segs = [], sf = MDS.surf(); let cur = null; for (let x = x0; x <= x1 + 8; x += 8) { const w = MDS.sea || mdGY(x) > sf + 1; if (w) { if (!cur) { cur = [x, x]; segs.push(cur); } cur[1] = x; } else cur = null; } return segs; }
function mdDrawWater(c, x0, x1, W, E, time, front) {
  const sf = MDS.surf(), segs = mdWaterSegs(x0, x1); if (!segs.length) return; const wt = W.pal.wt;
  for (const [a, b] of segs) {
    const xa = a - 8, xb = b + 8; c.beginPath(); c.moveTo(xa, sf); for (let x = xa; x <= xb; x += 12) c.lineTo(x, sf + Math.sin(x * 0.03 + time * 0.0016) * 2 + Math.sin(x * 0.011 - time * 0.001) * 1.5); for (let x = xb; x >= xa; x -= 8) c.lineTo(x, MDS.sea ? 1300 : Math.max(sf, mdGY(x) + 2)); c.closePath();
    if (!front) { const deep = MDS.sea ? (MDS.def.id === 'abismo' ? 1100 : 760) : sf + 160; const g = c.createLinearGradient(0, sf, 0, deep); g.addColorStop(0, wt[0]); g.addColorStop(1, wt[1]); c.globalAlpha = MDS.sea ? 1 : 0.86; c.fillStyle = g; c.fill(); c.globalAlpha = 1;
      if (MDS.sea) { c.save(); c.clip(); c.globalAlpha = 0.08; c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { const rx = xa + ((i * 340 + time * 0.01) % (xb - xa + 400)); c.beginPath(); c.moveTo(rx, sf); c.lineTo(rx + 60, sf); c.lineTo(rx - 120, sf + 420); c.lineTo(rx - 200, sf + 420); c.fill(); } c.restore(); c.globalAlpha = 1; } }
    else { c.globalAlpha = MDS.sea ? 0.1 : 0.24; c.fillStyle = wt[0]; c.fill(); c.globalAlpha = 0.55; c.strokeStyle = '#ffffff'; c.lineWidth = 1.5; c.beginPath(); for (let x = xa; x <= xb; x += 12) { const y = sf + Math.sin(x * 0.03 + time * 0.0016) * 2 + Math.sin(x * 0.011 - time * 0.001) * 1.5; if (x === xa) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); c.globalAlpha = 1;
      if (E.rain > 0.2) { c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1; for (let i = 0; i < 12; i++) { const rx = xa + mdHash(i + Math.floor(time / 300)) * (xb - xa); const rr = ((time / 300) % 1) * 8; c.beginPath(); c.ellipse(rx, sf, rr + 2, (rr + 2) * 0.3, 0, 0, mdTau); c.stroke(); } } }
  }
}
function mdDrawFrontGrass(c, x0, x1, W, time) {
  if (MDS.sea) return; const g = W.pal.g2, snow = MDS.E.ice; const col = snow ? '#e8f0f5' : mdSh(g, -0.08), col2 = snow ? '#d4e2ec' : mdSh(g, 0.06);
  for (let x = Math.floor(x0 / 18) * 18; x < x1; x += 18) { if (mdDepth(x) > 2) continue; const y = mdGY(x) + 44, h = 9 + mdHash(x * 1.3) * 10; const sw = Math.sin(time * 0.00045 + x * 0.004) * 2.2; c.fillStyle = mdHash(x) < 0.5 ? col : col2; c.beginPath(); c.moveTo(x - 4, y); c.quadraticCurveTo(x - 1 + sw * 0.5, y - h * 0.6, x + sw, y - h); c.quadraticCurveTo(x + 1 + sw * 0.5, y - h * 0.5, x + 4, y); c.fill(); c.beginPath(); c.moveTo(x + 3, y); c.quadraticCurveTo(x + 6 + sw * 0.5, y - h * 0.4, x + 9 + sw, y - h * 0.7); c.quadraticCurveTo(x + 7, y - h * 0.3, x + 8, y); c.fill(); }
}
function mdDrawRaft(c, r) { c.save(); c.translate(r.x, r.y); c.fillStyle = '#8a6238'; for (let i = -3; i <= 3; i++) { c.fillRect(i * 9 - 60 + 63 - 4, -6, 8, 10); } c.fillStyle = '#a77a48'; c.fillRect(-60, -7, 120, 4); c.fillRect(-60, 1, 120, 3); c.strokeStyle = '#5a3d20'; c.lineWidth = 1; c.strokeRect(-60, -7, 120, 11); c.restore(); }
function mdDrawTornado(c, e, time) { const gy = mdGY(e.x); c.save(); const g = c.createLinearGradient(0, gy - 560, 0, gy); g.addColorStop(0, 'rgba(90,94,104,.9)'); g.addColorStop(1, 'rgba(120,112,100,.85)'); c.fillStyle = g; c.beginPath(); const N = 24; const pts = []; for (let i = 0; i <= N; i++) { const t = i / N, y = gy - t * 560, w = 10 + Math.pow(t, 1.8) * 170, off = Math.sin(time * 0.004 + t * 5) * (8 + t * 40); pts.push([e.x + off, y, w]); } c.moveTo(pts[0][0] - pts[0][2], pts[0][1]); for (const p of pts) c.lineTo(p[0] - p[2], p[1]); for (let i = pts.length - 1; i >= 0; i--) c.lineTo(pts[i][0] + pts[i][2], pts[i][1]); c.closePath(); c.fill(); c.strokeStyle = 'rgba(220,224,230,.35)'; c.lineWidth = 2; for (let i = 0; i < 12; i++) { const t = ((i / 12) + time * 0.0006) % 1, y = gy - t * 540, w = 10 + Math.pow(t, 1.8) * 170, off = Math.sin(time * 0.004 + t * 5) * (8 + t * 40); c.beginPath(); c.ellipse(e.x + off, y, w * 0.9, 4 + t * 8, 0, 0.2, Math.PI - 0.2); c.stroke(); } c.fillStyle = 'rgba(160,140,110,.45)'; c.beginPath(); c.ellipse(e.x, gy - 6, 90 + Math.sin(time * 0.01) * 8, 18, 0, 0, mdTau); c.fill(); c.restore(); }
function mdDrawParts(c, x0, x1, time) {
  for (const p of MDS.parts) { if (p.x < x0 || p.x > x1) continue; const al = mdCl(p.life / p.max, 0, 1); c.globalAlpha = p.kind === 'smoke' ? al * 0.6 : al; c.fillStyle = p.col;
    if (p.kind === 'heart') { const s = p.size * 1.2; c.beginPath(); c.moveTo(p.x, p.y + s * 0.6); c.bezierCurveTo(p.x - s * 1.4, p.y - s * 0.4, p.x - s * 0.5, p.y - s * 1.4, p.x, p.y - s * 0.5); c.bezierCurveTo(p.x + s * 0.5, p.y - s * 1.4, p.x + s * 1.4, p.y - s * 0.4, p.x, p.y + s * 0.6); c.fill(); }
    else if (p.kind === 'bubble') { c.strokeStyle = p.col; c.lineWidth = 0.8; c.beginPath(); c.arc(p.x, p.y, p.size, 0, mdTau); c.stroke(); }
    else if (p.kind === 'bomb') { c.shadowColor = '#ff7a2a'; c.shadowBlur = 12; mdE(c, p.x, p.y, p.size, p.size); c.shadowBlur = 0; }
    else mdE(c, p.x, p.y, p.size, p.size); }
  c.globalAlpha = 1;
}
function mdDrawWeather(c, w, h, E, time, camY, k) {
  const W = MDS.def;
  if (E.rain > 0.08) { const n = Math.round(E.rain * (E.blizzard ? 260 : 160)), snow = E.snowing || E.blizzard; c.strokeStyle = 'rgba(220,235,255,.55)'; c.fillStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.2; const wind = E.wind * (E.blizzard ? 3 : 1);
    for (let i = 0; i < n; i++) { const sp = snow ? 0.05 : 0.9, x = ((mdHash(i) * w + time * (wind * 0.25 + (snow ? Math.sin(time * 0.001 + i) * 0.03 : 0))) % w + w) % w, y = (mdHash(i + 77) * h + time * sp * (0.5 + mdHash(i + 3))) % h; if (snow) mdE(c, x, y, 1.6 + mdHash(i) * 1.6, 1.6 + mdHash(i) * 1.6); else { c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2 - wind * 6, y + 12); c.stroke(); } } }
  if (MDS.sea && camY < MDS.S) { /* nada */ }
  if (E.fog > 0.05) { c.fillStyle = `rgba(232,238,244,${E.fog * 0.35})`; c.fillRect(0, 0, w, h); }
  const ash = E.ash; if (ash > 0) { c.fillStyle = `rgba(70,50,40,${ash * 0.25})`; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(80,70,65,.6)'; for (let i = 0; i < 60 * ash; i++) { const x = (mdHash(i) * w + time * 0.02) % w, y = (mdHash(i + 9) * h + time * 0.04) % h; c.fillRect(x, y, 2, 2); } }
  const dark = E.night * (MDS.def.id === 'magico' ? 0.3 : 0.42) + E.gloom * 0.12; if (dark > 0.01) { c.fillStyle = `rgba(8,16,48,${dark})`; c.fillRect(0, 0, w, h); }
  if (MDS.sea) { const depthTop = (MDS.S - camY) * k; if (depthTop < h) { const g = c.createLinearGradient(0, Math.max(0, depthTop), 0, h); g.addColorStop(0, 'rgba(0,10,40,0)'); g.addColorStop(1, `rgba(0,10,40,${MDS.def.id === 'abismo' ? 0.55 : 0.25})`); c.fillStyle = g; c.fillRect(0, Math.max(0, depthTop), w, h); } }
  if (MDS.flash > 0) { c.fillStyle = `rgba(255,255,240,${MDS.flash * 0.55})`; c.fillRect(0, 0, w, h); }
  if (typeof mdDrawGlow === 'function') mdDrawGlow(c, w, h, time, k);
}
function mdDrawAnimal(c, a, time) {
  const S = a.S; c.save(); const lane = a.layer === 'land' || (a.layer === 'air' && !a.flying) ? 1 + a.lane / 260 : 1; c.translate(a.x, a.y);
  /* sombra */
  if ((a.layer === 'land' || a.layer === 'floor') && a.state !== 'flung' && (a.up || 0) < 0.3 && !a.raft && !mdInW(a)) { c.fillStyle = 'rgba(0,0,0,.14)'; mdE(c, 0, 1, (10 + S.z * 9) * (0.5 + a.age * 0.5), 3 + S.z); }
  if (a.state === 'flung') c.rotate(Math.sin(a.ang || 0) * 0.8 + (a.t2 || 0) * 2);
  if (a.state === 'dead') c.rotate(Math.PI);
  if (a.arb && a.state === 'climb' && a.up > 0 && a.up < 1) c.rotate(-a.dir * 1.1);
  c.scale(a.dir * lane, lane);
  if (a.state === 'dizzy') c.rotate(Math.sin(time * 0.01) * 0.12);
  try { mdDrawCritter(c, a, S, time); } catch (e) { c.fillStyle = S.look.c; mdE(c, 0, -8, 10, 8); }
  c.restore();
  if (a.preg > 0 && a.layer !== 'water' && MDV.zoom > 0.8) { c.fillStyle = '#ff8fa3'; c.globalAlpha = 0.85; const s = 2.6, x = a.x, y = a.y - 26 - S.z * 12; c.beginPath(); c.moveTo(x, y + s * 0.6); c.bezierCurveTo(x - s * 1.4, y - s * 0.4, x - s * 0.5, y - s * 1.4, x, y - s * 0.5); c.bezierCurveTo(x + s * 0.5, y - s * 1.4, x + s * 1.4, y - s * 0.4, x, y + s * 0.6); c.fill(); c.globalAlpha = 1; }
  if (a.state === 'sleep' && MDV.zoom > 0.7) { c.fillStyle = 'rgba(255,255,255,.85)'; c.font = `600 ${9}px system-ui`; const z = (time * 0.001 + a.id) % 2; c.globalAlpha = 1 - z / 2; c.fillText('z', a.x + 8 + z * 4, a.y - 18 - S.z * 10 - z * 8); c.globalAlpha = 1; }
  if (a.state === 'dizzy') { c.fillStyle = '#ffe14a'; for (let i = 0; i < 3; i++) { const an = time * 0.006 + i * 2.09; mdE(c, a.x + Math.cos(an) * 10, a.y - 20 - S.z * 12 + Math.sin(an) * 3, 2, 2); } }
  if (a.say && a.say.t > 0 && !(a.say.delay > 0) && !MDV.bubbles.some((q) => Math.abs(q[0] - a.x) < 90 / MDV.zoom && Math.abs(q[1] - a.y) < 40 / MDV.zoom)) { MDV.bubbles.push([a.x, a.y]); const t = a.say.txt, bs = mdCl(1.15 / MDV.zoom, 0.35, 1.2), by = a.y - (18 + S.z * 12) * (0.5 + a.age * 0.5); c.save(); c.translate(a.x, by); c.scale(bs, bs); c.font = '600 11px system-ui'; const tw = c.measureText(t).width + 12; c.globalAlpha = Math.min(1, a.say.t * 2); c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); if (c.roundRect) c.roundRect(-tw / 2, -30, tw, 18, 9); else c.rect(-tw / 2, -30, tw, 18); c.fill(); c.beginPath(); c.moveTo(-4, -12.5); c.lineTo(0, -7); c.lineTo(4, -12.5); c.fill(); c.fillStyle = '#2a2a30'; c.fillText(t, -tw / 2 + 6, -17); c.restore(); c.globalAlpha = 1; }
}

/* ---------- bucle ---------- */
function mdLoop(ts) {
  const cv = document.getElementById('mdCv'); if (!cv) { MDV.raf = 0; MDV.cv = null; return; }
  if (cv !== MDV.cv) { MDV.cv = cv; MDV.ctx = cv.getContext('2d'); mdBindCanvas(cv); MDV.sizeChk = ''; }
  if (MDV.sizeChk !== cv.clientWidth + 'x' + cv.clientHeight) { MDV.sizeChk = cv.clientWidth + 'x' + cv.clientHeight; mdResize(); }
  const last = MDV.last || ts; const dt = Math.min(0.05, (ts - last) / 1000); MDV.last = ts;
  if (document.hidden) { MDV.raf = requestAnimationFrame(mdLoop); return; }
  if (!MDV.paused) { try { mdUpdate(dt); } catch (e) { console.error('mundos', e); } } else mdEnv();
  mdCamera(dt);
  try { mdDraw(ts); } catch (e) { console.error('mundos-draw', e); }
  MDV.fps = (MDV.fps || 16) * 0.95 + dt * 1000 * 0.05; if (MDV.fps > 30 && MDV.q > 0.6 && !MDV.qLock) { MDV.q = Math.max(0.6, MDV.q - 0.2); MDV.fps = 16; mdResize(); }
  MDV.ui += dt; if (MDV.ui > 0.5) { MDV.ui = 0; mdUiTick(); }
  MDV.raf = requestAnimationFrame(mdLoop);
}
function mdResize() { const cv = MDV.cv; if (!cv) return; const r = cv.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2) * MDV.q; const w = Math.max(200, Math.round(r.width * dpr)), h = Math.max(200, Math.round(r.height * dpr)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } mdClampCam(); }
function mdClampCam() { const vw = mdVW(), vh = 720 / MDV.zoom; MDV.camX = mdCl(MDV.camX, 0, Math.max(0, MDS.WW - vw)); const maxY = MDS.sea ? Math.max(0, (MDS.def.id === 'abismo' ? 760 : 700) - vh) : 1180 - vh; MDV.camY = mdCl(MDV.camY, Math.min(0, MDS.sea ? 0 : 0), Math.max(0, maxY)); }
function mdCamera(dt) {
  const vw = mdVW(), vh = 720 / MDV.zoom; let tx = null, ty = null;
  if (MDV.follow && MDV.sel && !MDV.sel.dead) { tx = MDV.sel.x - vw / 2; ty = MDV.sel.y - vh * (MDV.cardH ? 0.36 : 0.6); }
  else if (MDV.follow && MDV.selBug) { tx = MDV.selBug.x - vw / 2; ty = MDV.selBug.y - vh * 0.6; }
  else if (MDV.auto && !MDV.drag && performance.now() - MDV.lastUser > 6000 && !MDV.paused) { MDV.camX += MDV.autoDir * 6 * dt * MDS.speed; if (MDV.camX <= 0 || MDV.camX >= MDS.WW - vw) MDV.autoDir *= -1; }
  if (tx != null) { MDV.camX += (tx - MDV.camX) * Math.min(1, dt * 3); MDV.camY += (ty - MDV.camY) * Math.min(1, dt * 3); }
  mdClampCam();
}
function mdZoomAt(f, sx, sy) { const cv = MDV.cv; if (!cv) return; const k0 = mdK(); const wx = MDV.camX + sx / k0, wy = MDV.camY + sy / k0; MDV.zoom = mdCl(MDV.zoom * f, 0.7, 9); const k1 = mdK(); MDV.camX = wx - sx / k1; MDV.camY = wy - sy / k1; mdClampCam(); MDV.lastUser = performance.now(); const zb = document.getElementById('mdZoomTxt'); if (zb) zb.textContent = MDV.zoom.toFixed(1) + '×'; }
function mdBindCanvas(cv) {
  const pts = new Map(); let d = null, pinch = null;
  cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); MDV.lastUser = performance.now(); if (pts.size === 2) { const [p, q] = [...pts.values()]; pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), z: MDV.zoom }; d = null; } else { d = { x: e.clientX, y: e.clientY, cx: MDV.camX, cy: MDV.camY, moved: 0 }; MDV.drag = true; } });
  cv.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); const r = cv.getBoundingClientRect(), sc = cv.width / r.width;
    if (pinch && pts.size >= 2) { const [p, q] = [...pts.values()]; const nd = Math.hypot(p.x - q.x, p.y - q.y); const f = (pinch.z * nd / pinch.d) / MDV.zoom; mdZoomAt(f, ((p.x + q.x) / 2 - r.left) * sc, ((p.y + q.y) / 2 - r.top) * sc); return; }
    if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y; d.moved = Math.max(d.moved, Math.hypot(dx, dy)); if (d.moved > 6) { MDV.follow = false; const k = mdK() / sc; MDV.camX = d.cx - dx / k; MDV.camY = d.cy - dy / k; mdClampCam(); MDV.lastUser = performance.now(); } });
  const up = (e) => { const wasTap = d && d.moved < 7 && pts.size === 1; pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (wasTap) mdTap(e, cv); if (!pts.size) { d = null; MDV.drag = false; } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', (e) => { pts.delete(e.pointerId); d = null; pinch = null; MDV.drag = false; });
  cv.addEventListener('wheel', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(), sc = cv.width / r.width; mdZoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, (e.clientX - r.left) * sc, (e.clientY - r.top) * sc); }, { passive: false });
}
function mdTap(e, cv) {
  const r = cv.getBoundingClientRect(), sc = cv.width / r.width, k = mdK(); const wx = MDV.camX + (e.clientX - r.left) * sc / k, wy = MDV.camY + (e.clientY - r.top) * sc / k; let best = null, bd = 1e9;
  for (const a of MDS.an) { if (a.dead) continue; const s = (10 + a.S.z * 10) * (0.5 + a.age * 0.5); const cy = a.layer === 'water' ? a.y : a.y - s * 0.7; const dd = Math.hypot(a.x - wx, (cy - wy) * 0.9); if (dd < s + 12 / MDV.zoom && dd < bd) { bd = dd; best = a; } }
  let bug = null; if (!best && typeof mdBugAt === 'function') bug = mdBugAt(wx, wy);
  MDV.sel = best; MDV.selBug = bug; if (!best && !bug) MDV.follow = false; MDV.tab = 'info'; mdUiTick(true);
}

/* ---------- textos de la ficha ---------- */
function mdPredatorsOf(key) { const out = []; for (const k in MDS.init) { const s = MD_SP[k]; if (s.prey && s.prey.includes(key)) out.push(k); } return out; }
function mdFoodOf(key) { const S = MD_SP[key]; const parts = []; if (S.d !== 'c') parts.push(MD_FOOD_TXT[S.d] || 'plantas'); if (S.prey && S.prey.length) parts.push(S.prey.filter((p) => MD_SP[p]).map((p) => MD_SP[p].n.toLowerCase()).join(', ')); return parts.join(' · ') || 'plantas'; }
function mdAgeTxt(a) { if (a.inNest) return 'Polluelo en el nido'; if (a.age < 0.3) return 'Recién nacido'; if (a.age < 0.6) return 'Cría'; if (a.age < 1) return 'Joven'; return 'Adulto'; }
function mdChain(key) { const S = MD_SP[key]; const low = S.d === 'c' ? (S.prey || []).filter((p) => MDS.init[p]).slice(0, 2).map((p) => MD_SP[p].n) : [S.d === 'k' ? 'Algas' : S.d === 'f' ? 'Plancton' : 'Plantas']; const up = mdPredatorsOf(key).slice(0, 2).map((p) => MD_SP[p].n); return [low.join(' / ') || 'Plantas', S.n, up.join(' / ') || '(nadie lo caza aquí)']; }
function mdCardHTML(a) {
  const S = a.S, bar = (v, col) => `<span class="md-bar"><i style="width:${Math.round(mdCl(v, 0, 1) * 100)}%;${col ? 'background:' + col : ''}"></i></span>`;
  let st = MD_STATE[a.state] || 'Tranquilo'; if (a.state === 'hunt') { const p = MDS.an.find((o) => o.id === a.tgt); if (p) st = `Cazando ${p.S.n.toLowerCase()}`; } if (a.state === 'flee' && a.threatId) { const p = MDS.an.find((o) => o.id === a.threatId); if (p) st = `Huyendo de ${p.S.n.toLowerCase()}`; } if (a.preg > 0) st += ' · espera crías'; if (a.flying && a.state === 'perch') st = 'Volando';
  const chain = mdChain(a.sp), pred = mdPredatorsOf(a.sp).map((p) => MD_SP[p].n).join(', ');
  const mins = Math.floor((MDS.t - a.born) / 60), secs = Math.floor((MDS.t - a.born) % 60);
  return `<div class="md-card-h"><b>${esc(a.name)}</b><span>${esc(S.n)} · ${a.male ? 'macho' : 'hembra'} · ${mdAgeTxt(a)}</span><button type="button" class="md-x" data-act="md-unsel" aria-label="Cerrar">×</button></div>
  <p class="md-doing">${esc(st)}</p>
  <div class="md-tabs" role="tablist"><button type="button" data-act="md-tab" data-v="info" aria-pressed="${MDV.tab === 'info'}">Ahora</button><button type="button" data-act="md-tab" data-v="comida" aria-pressed="${MDV.tab === 'comida'}">Comida</button><button type="button" data-act="md-tab" data-v="datos" aria-pressed="${MDV.tab === 'datos'}">Datos</button></div>
  ${MDV.tab === 'info' ? `<div class="md-needs"><span>Barriga llena</span>${bar(1 - a.hunger)}<span>Energía</span>${bar(a.energy, '#e0b23a')}<span>Ánimo</span>${bar(a.state === 'flee' || a.state === 'panic' || a.state === 'dizzy' ? 0.25 : a.mood, '#d9708a')}${a.age < 1 ? `<span>Crecimiento</span>${bar(a.age, '#6aa8d8')}` : ''}</div>
    <div class="md-stats"><span><b>${a.kids}</b> crías</span><span><b>${a.kills}</b> presas</span><span><b>${Math.round(a.dist / 40)}</b> m recorridos</span><span><b>${mins}:${String(secs).padStart(2, '0')}</b> de vida</span></div>` : ''}
  ${MDV.tab === 'comida' ? `<p class="small"><b>${MD_DIET_TXT[S.d]}.</b> Come: ${esc(mdFoodOf(a.sp))}.</p><p class="small">Lo cazan: ${esc(pred || 'nadie en este mundo')}.</p><p class="md-chain">${chain.map((x) => `<span>${esc(x)}</span>`).join('<i>→</i>')}</p>` : ''}
  ${MDV.tab === 'datos' ? `<p class="small">${esc(S.fx || '')}</p><div class="md-stats"><span>Vive en: <b>${MD_HAB_TXT[S.h] || 'Tierra'}</b></span><span>Activo: <b>${MD_PAT_TXT[S.pat] || '—'}</b></span><span>Grupo: <b>${S.g > 1 ? 'hasta ' + S.g : 'solitario'}</b></span><span>Crías: <b>${S.lit[0]}${S.lit[1] > S.lit[0] ? '–' + S.lit[1] : ''} ${esc(S.bn)}${S.lit[1] > 1 ? 's' : ''}</b></span><span>Tamaño: <b>${S.z < 0.8 ? 'pequeño' : S.z < 1.6 ? 'mediano' : S.z < 3 ? 'grande' : 'gigante'}</b></span><span>Velocidad: <b>${Math.round((S.v[1] || S.v[0]) / 4)} km/h</b></span></div>` : ''}
  <div class="md-card-b"><button type="button" class="md-btn" data-act="md-follow" aria-pressed="${MDV.follow}">${MDV.follow ? 'Dejar de seguir' : 'Seguir'}</button><button type="button" class="md-btn" data-act="md-zoomsel">Acercar</button></div>`;
}
function mdUiTick(force) {
  const E = MDS.E; if (!E) return;
  const t = document.getElementById('mdTime'); if (t) t.textContent = `${mdTimeName(E)} · ${mdWeatherName(E)}`;
  const pc = document.getElementById('mdPopN'); if (pc) pc.textContent = `${MDS.an.length} animales${typeof mdBugCount === 'function' ? ' · ' + mdBugCount() + ' bichitos' : ''}`;
  const card = document.getElementById('mdCard'); if (card) { MDV.cardH = !card.hidden && card.offsetHeight > (MDV.cv ? MDV.cv.clientHeight * 0.3 : 200); if (MDV.sel && !MDV.sel.dead) { card.hidden = false; card.innerHTML = mdCardHTML(MDV.sel); } else if (MDV.selBug && typeof mdBugCard === 'function') { card.hidden = false; card.innerHTML = mdBugCard(MDV.selBug); } else { card.hidden = true; if (MDV.sel && MDV.sel.dead) { MDV.sel = null; MDV.follow = false; } } }
  MDV.slow = (MDV.slow || 0) + 1; if (MDV.slow % 4 && !force) return;
  const pop = document.getElementById('mdPop'); if (pop) { const counts = {}; for (const a of MDS.an) if (!a.dead) { const c = counts[a.sp] || (counts[a.sp] = { n: 0, b: 0 }); c.n++; if (a.age < 1) c.b++; } pop.innerHTML = Object.keys(MDS.init).concat(Object.keys(counts).filter((k) => !(k in MDS.init))).map((k) => { const c = counts[k] || { n: 0, b: 0 }; return `<li><button type="button" data-act="md-findsp" data-sp="${k}"><span>${esc(MD_SP[k].n)}</span><b>${c.n}${c.b ? `<small> · ${c.b} crías</small>` : ''}</b></button></li>`; }).join(''); }
  const lg = document.getElementById('mdLog'); if (lg && (MDS.logDirty || force)) { MDS.logDirty = false; lg.innerHTML = MDS.log.slice(0, 14).map((l) => `<li>${esc(l.txt)}</li>`).join('') || '<li class="faint">Todo está en calma…</li>'; }
  const st = document.getElementById('mdStats'); if (st) st.innerHTML = `<span><b>${MDS.stat.born}</b> nacimientos</span><span><b>${MDS.stat.hatched}</b> huevos eclosionados</span><span><b>${MDS.nests.length}</b> nidos activos</span><span><b>${MDS.stat.eaten}</b> cacerías</span>`;
}
function mdChainHTML() {
  const lines = []; const keys = Object.keys(MDS.init);
  const herb = keys.filter((k) => MD_SP[k].d !== 'c'), carn = keys.filter((k) => MD_SP[k].d === 'c' || (MD_SP[k].prey && MD_SP[k].prey.length));
  for (const k of carn) { const pr = (MD_SP[k].prey || []).filter((p) => keys.includes(p)); if (!pr.length) continue; lines.push(`<li><b>${esc(MD_SP[k].n)}</b> <i>come</i> ${pr.map((p) => esc(MD_SP[p].n.toLowerCase())).join(', ')}</li>`); }
  return `<p class="small">${MDS.sea ? 'Plancton y algas' : 'Plantas, frutas y semillas'} <i>→</i> ${herb.slice(0, 8).map((k) => esc(MD_SP[k].n.toLowerCase())).join(', ')}${herb.length > 8 ? '…' : ''}</p><ul class="md-chainl">${lines.join('')}</ul>`;
}

/* ---------- vistas ---------- */
function mdThumbDraw(cv, w) {
  const c = cv.getContext('2d'), W = cv.width, H = cv.height, p = w.pal, sea = w.mode === 'sea'; const k = H / 140; c.setTransform(k, 0, 0, k, 0, 0); const vw = W / k;
  const g = c.createLinearGradient(0, 0, 0, 140); if (sea) { g.addColorStop(0, '#bfe3f5'); g.addColorStop(0.18, '#bfe3f5'); g.addColorStop(0.19, p.wt[0]); g.addColorStop(1, p.wt[1]); } else { g.addColorStop(0, '#9fd0f0'); g.addColorStop(1, '#e6f3fa'); } c.fillStyle = g; c.fillRect(0, 0, vw, 140);
  if (!sea) { c.fillStyle = p.far[0]; c.beginPath(); c.moveTo(0, 90); for (let x = 0; x <= vw; x += 10) c.lineTo(x, 70 - 22 * Math.abs(Math.sin(x * 0.02 + 1)) - (w.far === 'alps' || w.far === 'volcano' ? 20 * Math.abs(Math.sin(x * 0.05)) : 0)); c.lineTo(vw, 110); c.lineTo(0, 110); c.fill(); c.fillStyle = p.far[2]; c.beginPath(); c.moveTo(0, 100); for (let x = 0; x <= vw; x += 10) c.lineTo(x, 88 - 10 * Math.sin(x * 0.03)); c.lineTo(vw, 110); c.lineTo(0, 110); c.fill(); c.fillStyle = p.g1; c.fillRect(0, 100, vw, 40); c.fillStyle = p.g2; c.fillRect(0, 122, vw, 18); if ((w.waters || []).length) { c.fillStyle = p.wt[0]; c.beginPath(); c.ellipse(vw * 0.72, 112, 42, 6, 0, 0, mdTau); c.fill(); } }
  else { c.fillStyle = p.g1; c.beginPath(); c.moveTo(0, 140); for (let x = 0; x <= vw; x += 10) c.lineTo(x, 126 + 4 * Math.sin(x * 0.05)); c.lineTo(vw, 140); c.fill(); }
  const fl = w.flora.filter((f) => !['flower', 'tuft', 'dune'].includes(f[0])); const time = 1000;
  for (let i = 0; i < Math.min(3, fl.length); i++) { const kind = fl[i][0], under = MD_UNDER.has(kind), tree = MD_TREES.has(kind); c.save(); c.translate(vw * (0.12 + i * 0.36), sea ? 128 : 104); c.scale(0.42, 0.42); try { mdDrawFlora(c, { kind, x: 0, y: 0, h: under ? 70 : tree ? 170 : (mdH[kind] ? mdH[kind][1] : 60), seed: 3 + i * 7, fruit: tree, burn: 0, burnt: false, dir: 1 }, w, time, w.clim.t < 0.3, 0); } catch (e) { /* */ } c.restore(); }
  const sp = w.sp.slice().sort((a, b) => b[1] - a[1]).map((e) => e[0]).filter((k) => MD_SP[k] && !MD_SP[k].rb); const pick = [sp[0], sp.find((k) => MD_SP[k].d === 'c'), sp[1], sp[2]].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
  pick.forEach((k, i) => { const S = MD_SP[k]; const a = { id: i + 1, age: 1, state: 'idle', ph: 1, moving: false, male: true, hunger: 0.2, blink: 0, dir: i % 2 ? -1 : 1 }; const sc = Math.min(1.1, 1.5 / Math.pow(S.z, 0.7)) * 0.62; const x = vw * (0.22 + i * 0.29), y = S.t === 'f' ? 60 + i * 18 : S.t === 'b' && S.h === 'A' ? 112 : 116; c.save(); c.translate(x, y); c.scale(sc * a.dir, sc); try { mdDrawCritter(c, a, S, time); } catch (e) { /* */ } c.restore(); });
}
function mdThumbsLater() { const cvs = [...document.querySelectorAll('canvas[data-mdthumb]')]; let i = 0; const step = () => { const t0 = performance.now(); while (i < cvs.length && performance.now() - t0 < 12) { const cv = cvs[i++]; const w = MD_WORLDS.find((x) => x.id === cv.dataset.mdthumb); if (w && cv.isConnected) { const r = cv.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round((r.width || 160) * dpr); cv.height = Math.round((r.height || 85) * dpr); mdThumbDraw(cv, w); } } if (i < cvs.length) requestAnimationFrame(step); }; requestAnimationFrame(step); }
function mdThumb(w) { const p = w.pal, sea = w.mode === 'sea'; return `<svg viewBox="0 0 120 64" aria-hidden="true"><rect width="120" height="64" fill="${sea ? p.wt[1] : '#cfe6f5'}"/>${sea ? `<rect width="120" height="18" fill="#9fd0ec"/><rect y="18" width="120" height="46" fill="${p.wt[0]}"/><path d="M0 56 Q30 50 60 56 T120 54 V64 H0Z" fill="${p.g1}"/>` : `<path d="M0 40 L25 22 L45 32 L70 14 L95 30 L120 20 V64 H0Z" fill="${p.far[1]}"/><path d="M0 46 Q30 38 60 46 T120 44 V64 H0Z" fill="${p.g1}"/><rect y="54" width="120" height="10" fill="${p.g2}"/>`}${(w.waters || []).length && !sea ? `<ellipse cx="80" cy="52" rx="22" ry="4" fill="${p.wt[0]}"/>` : ''}</svg>`; }
function viewMundos() {
  if (typeof calmOn === 'function' && calmOn()) return `<h1 class="h1">Mundos</h1><p class="sub">Este espacio se oculta en el modo «Sin ruido visual».</p>`;
  if (MDV.world && MDS.def && MDS.def.id === MDV.world) { setTimeout(mdStart, 0); return mdWorldHTML(); }
  MDV.world = null; setTimeout(mdThumbsLater, 30); const grps = {}; for (const w of MD_WORLDS) (grps[w.grp] = grps[w.grp] || []).push(w);
  const total = Object.keys(MD_SP).length;
  return `<div class="md-page"><h1 class="h1">Mundos vivos</h1><p class="sub">${MD_WORLDS.length} mundos y ${total} especies que viven solas: comen, duermen, platican, tienen crías y reaccionan a tormentas, inundaciones y tornados.</p>
  <a class="md-classic" href="#/bosqueclasico"><b>El Gran Bosque clásico</b><span>Con estaciones reales que cambian cada 30 minutos</span></a>
  ${MD_GRP_ORDER.filter((g) => grps[g]).map((g) => `<h2 class="sec">${esc(g)}</h2><div class="md-grid">${grps[g].map((w) => `<button type="button" class="md-world" data-act="md-open" data-id="${w.id}"><canvas data-mdthumb="${w.id}" aria-hidden="true"></canvas><b>${esc(w.name)}</b><span>${esc(w.desc)}</span></button>`).join('')}</div>`).join('')}</div>`;
}
function mdWorldHTML() {
  const W = MDS.def, haz = (W.haz || []).filter((h) => MD_CATS[h]);
  return `<div class="md-page"><div class="md-top"><button type="button" class="md-back" data-act="md-close">‹ Mundos</button><h1 class="h1">${esc(W.name)}</h1></div><p class="sub">${esc(W.desc)}</p>
  <div class="md-wrap" id="mdWrap"><canvas id="mdCv" role="img" aria-label="${esc(W.name)}: mundo vivo con animales"></canvas>
    <div class="md-hud"><span class="md-badge" id="mdTime">…</span><span class="md-badge" id="mdPopN">…</span></div>
    <div class="md-tools"><button type="button" class="md-ib" data-act="md-pause" id="mdPauseB" aria-label="Pausar">${MDV.paused ? '▶' : '❚❚'}</button><button type="button" class="md-ib" data-act="md-speed" id="mdSpeedB" aria-label="Velocidad">${MDS.speed}×</button><button type="button" class="md-ib" data-act="md-full" aria-label="Pantalla completa">⤢</button></div>
    <div class="md-zoom"><button type="button" class="md-ib" data-act="md-zoom" data-v="1" aria-label="Acercar">+</button><span id="mdZoomTxt">${MDV.zoom.toFixed(1)}×</span><button type="button" class="md-ib" data-act="md-zoom" data-v="-1" aria-label="Alejar">−</button>${MDS.sea ? '' : '<button type="button" class="md-ib md-ib-s" data-act="md-under" aria-label="Ver bajo tierra">▾</button>'}</div>
    <div class="md-card" id="mdCard" hidden></div></div>
  <p class="tiny faint md-hint">Arrastra para moverte, pellizca o usa + y − para hacer zoom (bajo tierra viven topos, lombrices y hormigas). Toca un animal para ver su ficha y seguirlo.</p>
  ${haz.length ? `<h2 class="sec">Catástrofes</h2><div class="md-cats">${haz.map((h) => `<button type="button" class="md-cat" data-act="md-cat" data-v="${h}"><b>${MD_CATS[h][0]}</b><span>${MD_CATS[h][1]}</span></button>`).join('')}</div>` : ''}
  <div class="md-ctl"><b class="tiny">Hora</b><div class="md-chips">${[['', 'En vivo'], [0.3, 'Mañana'], [0.5, 'Mediodía'], [0.74, 'Atardecer'], [0.0, 'Noche']].map(([v, l]) => `<button type="button" class="md-chip" data-act="md-ov" data-g="time" data-v="${v}" aria-pressed="${String(MDS.ov.time == null ? v === '' : MDS.ov.time === v)}">${l}</button>`).join('')}</div>
  <b class="tiny">Clima</b><div class="md-chips">${[['', 'En vivo'], ['clear', 'Despejado'], ['rain', 'Lluvia'], ['storm', 'Tormenta'], ['rainbow', 'Arcoíris'], ['fog', 'Niebla'], ['snow', 'Nieve'], ['aurora', 'Aurora']].map(([v, l]) => `<button type="button" class="md-chip" data-act="md-ov" data-g="weather" data-v="${v}" aria-pressed="${String((MDS.ov.weather || '') === v)}">${l}</button>`).join('')}</div></div>
  <h2 class="sec">Estadísticas del mundo</h2><div class="md-stats md-wstats" id="mdStats"></div>
  <h2 class="sec">Habitantes</h2><p class="tiny faint">Toca una especie para encontrar a uno.</p><ul class="md-pop" id="mdPop"></ul>
  <h2 class="sec">Cadena alimenticia</h2><div class="md-chainbox">${mdChainHTML()}</div>
  <h2 class="sec">Diario del mundo</h2><ul class="md-log" id="mdLog"></ul></div>`;
}
function mdStart() { if (!MDV.raf) { MDV.last = 0; MDV.raf = requestAnimationFrame(mdLoop); } }
function mdOpen(id) {
  const def = MD_WORLDS.find((w) => w.id === id); if (!def) return; MDV.world = id; MDV.sel = null; MDV.selBug = null; MDV.follow = false; MDV.zoom = 1; MDV.camY = MDS.sea ? 0 : 0;
  mdBuild(def); if (typeof mdBuildUnder === 'function') mdBuildUnder(); mdEnv(); MDV.camX = MDS.WW * 0.3; MDV.camY = 0; MDV.auto = true;
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches) MDV.paused = true; } catch { /* */ }
  render(); window.scrollTo(0, 0);
}
EXTRA_VIEWS.bosqueclasico = viewGranBosque; EXTRA_NAV.bosqueclasico = 'mas'; GROUP_VIEWS.bosqueclasico = viewGranBosque; GROUP_NAV.bosqueclasico = 'mas';
EXTRA_VIEWS.granbosque = viewMundos; GROUP_VIEWS.granbosque = viewMundos;
EXTRA_VIEWS.mundos = viewMundos; EXTRA_NAV.mundos = 'mas'; GROUP_VIEWS.mundos = viewMundos; GROUP_NAV.mundos = 'mas';
Object.assign(VIDA_ACTS, {
  'md-open': (el) => mdOpen(el.dataset.id),
  'md-close': () => { MDV.world = null; MDV.sel = null; render(); window.scrollTo(0, 0); },
  'md-pause': (el) => { MDV.paused = !MDV.paused; el.textContent = MDV.paused ? '▶' : '❚❚'; el.setAttribute('aria-label', MDV.paused ? 'Reanudar' : 'Pausar'); },
  'md-speed': (el) => { MDS.speed = MDS.speed === 1 ? 2 : MDS.speed === 2 ? 4 : 1; el.textContent = MDS.speed + '×'; },
  'md-full': () => { const w = document.getElementById('mdWrap'); if (!w) return; w.classList.toggle('md-fullscr'); document.body.classList.toggle('gb-noscroll', w.classList.contains('md-fullscr')); MDV.sizeChk = ''; },
  'md-zoom': (el) => { const cv = MDV.cv; if (!cv) return; const f = +el.dataset.v > 0 ? 1.5 : 1 / 1.5; if (MDV.sel && MDV.follow) { MDV.zoom = mdCl(MDV.zoom * f, 0.7, 9); } else mdZoomAt(f, cv.width / 2, cv.height / 2); const zb = document.getElementById('mdZoomTxt'); if (zb) zb.textContent = MDV.zoom.toFixed(1) + '×'; },
  'md-under': () => { MDV.follow = false; MDV.zoom = Math.max(MDV.zoom, 1.4); MDV.camY = MDS.S - 60; mdClampCam(); MDV.lastUser = performance.now(); const zb = document.getElementById('mdZoomTxt'); if (zb) zb.textContent = MDV.zoom.toFixed(1) + '×'; },
  'md-cat': (el) => { mdStartCat(el.dataset.v); mdUiTick(true); toast(MD_CATS[el.dataset.v][0]); },
  'md-ov': (el) => { const g = el.dataset.g, v = el.dataset.v; if (g === 'time') MDS.ov.time = v === '' ? null : +v; else MDS.ov.weather = v || null; if (v === 'aurora') MDS.ov.time = 0; mdEnv(); document.querySelectorAll('.md-chip').forEach((b) => { const gg = b.dataset.g, vv = b.dataset.v; const cur = gg === 'time' ? MDS.ov.time : MDS.ov.weather; b.setAttribute('aria-pressed', String(vv === '' ? cur == null : String(cur) === vv)); }); },
  'md-unsel': () => { MDV.sel = null; MDV.selBug = null; MDV.follow = false; mdUiTick(true); },
  'md-follow': () => { MDV.follow = !MDV.follow; MDV.auto = false; mdUiTick(true); },
  'md-zoomsel': () => { MDV.follow = true; MDV.zoom = Math.max(MDV.zoom, MDV.selBug ? 6 : 2.2); const zb = document.getElementById('mdZoomTxt'); if (zb) zb.textContent = MDV.zoom.toFixed(1) + '×'; mdUiTick(true); },
  'md-tab': (el) => { MDV.tab = el.dataset.v; mdUiTick(true); },
  'md-findsp': (el) => { const sp = el.dataset.sp; const list = MDS.an.filter((a) => a.sp === sp && !a.dead); if (!list.length) { toast('No queda ninguno ahora; pronto llegarán más.'); return; } MDV.findI = ((MDV.findI || 0) + 1) % list.length; MDV.sel = list[MDV.findI]; MDV.selBug = null; MDV.follow = true; MDV.tab = 'info'; mdUiTick(true); const w = document.getElementById('mdWrap'); if (w) w.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const w = document.getElementById('mdWrap'); if (w && w.classList.contains('md-fullscr')) { w.classList.remove('md-fullscr'); document.body.classList.remove('gb-noscroll'); MDV.sizeChk = ''; } } });
