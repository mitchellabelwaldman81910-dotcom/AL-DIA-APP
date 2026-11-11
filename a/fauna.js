/* Cinnavia 7.28 — Fauna de fondo: venado, conejos, ardilla, zorro, tortuga, pájaros y mariposas que viven en el paisaje.
   Pastan, olfatean, saltan, picotean y reaccionan entre sí (el conejo huye del zorro). Es solo decoración: no toca la interfaz. */
'use strict';
const FA = { cv: null, g: null, W: 0, H: 0, list: [], flowers: [], last: 0, acc: 0, on: false, stat: false };
const faR = (a, b) => a + Math.random() * (b - a);
const faApp = (v, to, d) => (v < to ? Math.min(to, v + d) : Math.max(to, v - d));
function faLeg(g, x, hy, sw, len, col, w, up) {
  const kx = x + Math.sin(sw) * len * 0.45, ky = hy + len * 0.5 - (up ? Math.max(0, -Math.sin(sw)) * 5 : 0), fx = x + Math.sin(sw) * len * 0.9, fy = hy + len;
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, hy); g.lineTo(kx, ky); g.lineTo(fx, Math.min(fy, hy + len)); g.stroke(); return [fx, Math.min(fy, hy + len)];
}
/* ---------- dibujo de cada animal (mirando a la derecha, pies en y = 0) ---------- */
function faDeer(g, a, t) {
  const walk = a.st === 'walk' ? 1 : 0, ph = a.phase, gz = a.gr, coat = '#A8703F', dark = '#7C4E28';
  const legs = [[-20, 0.2, dark], [-13, 3.4, dark], [18, 3.6, dark], [24, 0.4, dark], [-18, 3.4, coat], [-11, 0.2, coat], [20, 0.2, coat], [26, 3.6, coat]];
  legs.forEach(([x, off, col], i) => { const sw = walk ? Math.sin(ph + off) * 0.5 : 0; const [fx, fy] = faLeg(g, x, -36, sw, 36, i < 4 ? dark : col, 4.6, true); g.fillStyle = '#2A1A10'; g.beginPath(); g.ellipse(fx, fy, 3.2, 2, 0, 0, 7); g.fill(); });
  const bg = g.createLinearGradient(0, -64, 0, -30); bg.addColorStop(0, '#B9824E'); bg.addColorStop(0.7, coat); bg.addColorStop(1, '#E3C596'); g.fillStyle = bg; g.beginPath(); g.ellipse(0, -47, 32, 16, 0, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,255,255,.85)'; for (const [x, y] of [[-14, -56], [-4, -58], [8, -57], [-20, -50], [2, -52], [14, -53]]) { g.beginPath(); g.arc(x, y, 1.7, 0, 7); g.fill(); }
  g.fillStyle = '#F4EBDD'; g.beginPath(); g.ellipse(-33, -52, 4.5, 6.5, 0.3, 0, 7); g.fill();
  const hx = 44 + gz * 9, hy = -84 + gz * 70, bx = 24, by = -56, ang = -0.25 + gz * 1.35;
  g.strokeStyle = coat; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx + 14, by - 16 + gz * 14, hx - 6, hy + 4); g.stroke(); g.lineWidth = 7; g.stroke();
  g.save(); g.translate(hx, hy); g.rotate(ang); g.fillStyle = '#B07848'; g.beginPath(); g.ellipse(0, 0, 11, 6.2, 0, 0, 7); g.fill(); g.fillStyle = '#F0E2CC'; g.beginPath(); g.ellipse(7, 2.5, 5, 3.2, 0, 0, 7); g.fill(); g.fillStyle = '#2A1A10'; g.beginPath(); g.ellipse(12, 0.5, 2.1, 1.6, 0, 0, 7); g.fill();
  g.fillStyle = a.blink > 0 ? '#7C4E28' : '#1E120A'; g.beginPath(); g.arc(1.5, -2, 1.4, 0, 7); g.fill();
  g.fillStyle = '#9A6338'; g.beginPath(); g.ellipse(-5, -6, 3, 7, -0.7 + Math.sin(t * 2 + a.id) * 0.06 * (a.earF || 0) , 0, 7); g.fill();
  if (a.buck) { g.strokeStyle = '#D8C2A0'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(-1, -5); g.lineTo(-4, -17); g.lineTo(-10, -25); g.moveTo(-4, -17); g.lineTo(2, -25); g.moveTo(-4, -12); g.lineTo(-10, -14); g.stroke(); }
  g.restore();
}
function faRabbit(g, a, t) {
  const hop = a.st === 'walk' ? Math.abs(Math.sin(a.phase)) : 0, ny = -hop * 13, gz = a.gr, fur = a.col || '#C8B6A0';
  g.translate(0, ny); g.fillStyle = fur; g.beginPath(); g.ellipse(0, -11, 13, 9.5, 0, 0, 7); g.fill(); g.fillStyle = '#F4EEE6'; g.beginPath(); g.arc(-13, -12, 5, 0, 7); g.fill();
  g.beginPath(); g.fillStyle = '#E6DACB'; g.ellipse(2, -6, 10, 4, 0, 0, 7); g.fill();
  const hx = 12 + gz * 3, hy = -19 + gz * 10; g.fillStyle = fur; g.beginPath(); g.ellipse(hx, hy, 7, 6, 0, 0, 7); g.fill();
  const ea = a.st === 'alert' ? 0 : 0.35; g.fillStyle = fur; for (const k of [0, 1]) { g.save(); g.translate(hx - 1 - k * 2.5, hy - 4); g.rotate(-0.15 - k * 0.2 - ea + gz * 0.6); g.beginPath(); g.ellipse(0, -8, 2.6, 8, 0, 0, 7); g.fill(); g.fillStyle = '#E9B9B9'; g.beginPath(); g.ellipse(0, -8, 1, 5.5, 0, 0, 7); g.fill(); g.fillStyle = fur; g.restore(); }
  g.fillStyle = '#20140C'; g.beginPath(); g.arc(hx + 3, hy - 1, 1.2, 0, 7); g.fill(); g.fillStyle = '#E39A9A'; g.beginPath(); g.arc(hx + 6.8, hy + 1, 1, 0, 7); g.fill();
  g.fillStyle = fur; g.beginPath(); g.ellipse(-4, -2.5, 5, 3, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(8, -1.5, 3, 2.2, 0, 0, 7); g.fill();
  if (a.st === 'eat') { const m = Math.sin(t * 14) * 1.2; g.strokeStyle = '#5E9A3E'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx + 7, hy + 2); g.lineTo(hx + 12 + m, hy + 4); g.stroke(); }
}
function faSquirrel(g, a, t) {
  const run = a.st === 'walk' ? Math.abs(Math.sin(a.phase)) : 0, sit = a.st === 'eat', fur = '#B5642C';
  g.translate(0, -run * 6);
  const tw = Math.sin(t * 3 + a.id) * (sit ? 4 : 1.5);
  g.fillStyle = '#C9763A'; g.beginPath(); g.moveTo(-6, -8); g.bezierCurveTo(-26, -6 + tw, -30, -34 + tw, -14, -44); g.bezierCurveTo(-8 + tw * 0.3, -36, -12, -24, -2, -14); g.fill(); g.fillStyle = 'rgba(255,230,190,.5)'; g.beginPath(); g.moveTo(-16, -40); g.bezierCurveTo(-26, -32 + tw, -24, -18, -12, -14); g.bezierCurveTo(-18, -22, -20, -32, -16, -40); g.fill();
  g.save(); if (sit) { g.translate(2, 0); g.rotate(-0.5); } g.fillStyle = fur; g.beginPath(); g.ellipse(2, -13, 10, 8, 0, 0, 7); g.fill(); g.fillStyle = '#F0DCBE'; g.beginPath(); g.ellipse(7, -11, 5, 5, 0, 0, 7); g.fill(); g.restore();
  const hx = sit ? 10 : 13, hy = sit ? -26 : -20; g.fillStyle = fur; g.beginPath(); g.arc(hx, hy, 6, 0, 7); g.fill(); g.beginPath(); g.moveTo(hx - 3, hy - 4); g.lineTo(hx - 2, hy - 11); g.lineTo(hx + 2, hy - 5); g.fill();
  g.fillStyle = '#20140C'; g.beginPath(); g.arc(hx + 2.5, hy - 1, 1.1, 0, 7); g.arc(hx + 6, hy + 1.5, 1, 0, 7); g.fill();
  if (sit) { g.fillStyle = '#7A4A20'; g.beginPath(); g.ellipse(hx + 6, hy + 8, 3.4, 4.4, 0.4, 0, 7); g.fill(); g.fillStyle = '#5A3516'; g.beginPath(); g.arc(hx + 5.3, hy + 5.3, 2.2, Math.PI, 0); g.fill(); }
  g.strokeStyle = fur; g.lineWidth = 3; g.lineCap = 'round'; const sw = a.st === 'walk' ? Math.sin(a.phase * 1.4) * 0.6 : 0; g.beginPath(); g.moveTo(-3, -6); g.lineTo(-3 + Math.sin(sw) * 5, 0); g.moveTo(9, -6); g.lineTo(9 + Math.sin(-sw) * 5, 0); g.stroke();
}
function faFox(g, a, t) {
  const walk = a.st === 'walk' ? 1 : 0, ph = a.phase, c = '#D9732A', sn = a.st === 'sniff' ? 1 : 0;
  for (const [x, off, col] of [[-22, 0, '#8A4A1C'], [-14, 3.2, '#8A4A1C'], [16, 3.3, '#8A4A1C'], [23, 0.1, '#8A4A1C']]) { const sw = walk ? Math.sin(ph + off) * 0.55 : 0; const [fx, fy] = faLeg(g, x, -22, sw, 22, col, 3.8, true); g.fillStyle = '#2A1608'; g.beginPath(); g.ellipse(fx, fy, 2.8, 1.8, 0, 0, 7); g.fill(); }
  const tw = Math.sin(t * 2.2 + a.id) * 3; g.fillStyle = c; g.beginPath(); g.moveTo(-26, -34); g.bezierCurveTo(-52, -38 + tw, -58, -14 + tw, -44, -8 + tw * 0.5); g.bezierCurveTo(-40, -20, -34, -24, -24, -26); g.fill(); g.fillStyle = '#FFF6E8'; g.beginPath(); g.moveTo(-44, -8 + tw * 0.5); g.bezierCurveTo(-52, -10 + tw, -57, -16 + tw, -56, -22 + tw); g.bezierCurveTo(-50, -14, -46, -12, -44, -8 + tw * 0.5); g.fill();
  const bg = g.createLinearGradient(0, -44, 0, -22); bg.addColorStop(0, '#E8853A'); bg.addColorStop(1, c); g.fillStyle = bg; g.beginPath(); g.ellipse(0, -32, 28, 11, 0, 0, 7); g.fill(); g.fillStyle = '#FFF2DE'; g.beginPath(); g.ellipse(4, -25, 18, 4.5, 0, 0, 7); g.fill();
  const hx = 32 + sn * 5, hy = -42 + sn * 10; g.strokeStyle = c; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(18, -36); g.lineTo(hx - 4, hy + 2); g.stroke();
  g.save(); g.translate(hx, hy); g.rotate(sn * 0.5); g.fillStyle = c; g.beginPath(); g.ellipse(0, 0, 9, 6.5, 0, 0, 7); g.fill(); g.fillStyle = '#FFF2DE'; g.beginPath(); g.moveTo(2, 2); g.lineTo(15, 1.5); g.lineTo(2, 6.5); g.fill(); g.fillStyle = c; g.beginPath(); g.moveTo(15, 0.5); g.lineTo(2, -4.5); g.lineTo(2, 3); g.fill(); g.fillStyle = '#2A1608'; g.beginPath(); g.arc(15.2, 1.2, 1.7, 0, 7); g.fill(); g.fillStyle = '#3B1F0C'; g.beginPath(); g.moveTo(-4, -4); g.lineTo(-5, -14); g.lineTo(2, -6); g.fill(); g.beginPath(); g.moveTo(1, -5); g.lineTo(2, -15); g.lineTo(6, -5); g.fill(); g.fillStyle = '#1E120A'; g.beginPath(); g.arc(6, -1.5, 1.2, 0, 7); g.fill(); g.restore();
}
function faTurtle(g, a, t) {
  const hd = 8 + (a.st === 'walk' ? 3 + Math.sin(a.phase) * 1 : 0) - (a.st === 'idle' ? 6 : 0);
  g.fillStyle = '#7A9A55'; for (const [x, k] of [[-10, 0], [8, 1.7]]) { const m = a.st === 'walk' ? Math.sin(a.phase + k) * 2 : 0; g.beginPath(); g.ellipse(x + m, -3, 4, 3, 0, 0, 7); g.fill(); }
  g.beginPath(); g.ellipse(18 + hd * 0.4, -10, 6 + hd * 0.2, 4.4, 0, 0, 7); g.fill(); g.fillStyle = '#1E120A'; g.beginPath(); g.arc(21 + hd * 0.4, -11, 1, 0, 7); g.fill();
  const sg = g.createRadialGradient(-4, -24, 3, 0, -10, 24); sg.addColorStop(0, '#9A8A4C'); sg.addColorStop(1, '#5E6B34'); g.fillStyle = sg; g.beginPath(); g.moveTo(-20, -6); g.bezierCurveTo(-20, -30, 20, -30, 20, -6); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(60,50,20,.45)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(-9, -22); g.lineTo(-4, -8); g.moveTo(3, -26); g.lineTo(3, -8); g.moveTo(12, -22); g.lineTo(9, -8); g.moveTo(-14, -16); g.lineTo(16, -16); g.stroke(); g.fillStyle = '#D9C98E'; g.fillRect(-20, -7, 40, 3);
}
function faBird(g, a, t) {
  const fly = a.st === 'fly'; const c1 = a.c[0], c2 = a.c[1], fl = fly ? Math.sin(t * 22 + a.id) : 0;
  g.fillStyle = c1; g.beginPath(); g.ellipse(0, -8, 8, 5.5, fly ? -0.2 : 0.3, 0, 7); g.fill(); g.fillStyle = c2; g.beginPath(); g.ellipse(2, -5.5, 5.5, 3.2, 0.2, 0, 7); g.fill();
  g.fillStyle = c1; g.beginPath(); g.arc(7, a.st === 'peck' ? -4 : -12, 4, 0, 7); g.fill(); g.fillStyle = '#E8A93A'; g.beginPath(); const hy = a.st === 'peck' ? -4 : -12; g.moveTo(10.5, hy - 1); g.lineTo(14.5, hy + 0.5 + (a.st === 'peck' ? 1 : 0)); g.lineTo(10.5, hy + 1.8); g.fill(); g.fillStyle = '#10100E'; g.beginPath(); g.arc(8, hy - 1, 0.9, 0, 7); g.fill();
  g.fillStyle = c1; g.beginPath(); g.moveTo(-6, -9); g.lineTo(-16, -6 + fl * 2); g.lineTo(-7, -5); g.fill();
  const wy = fly ? -fl * 11 : 0; g.fillStyle = c1; g.globalAlpha = 0.95; g.beginPath(); g.moveTo(-2, -10); g.quadraticCurveTo(-8, -10 + wy * 1.3 - (fly ? 10 : 0), -14, -8 + wy); g.quadraticCurveTo(-8, -6, -2, -7); g.fill(); g.globalAlpha = 1;
  if (!fly) { g.strokeStyle = '#6B5230'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-1, -3); g.lineTo(-1, 0); g.moveTo(3, -3); g.lineTo(3, 0); g.stroke(); }
}
function faButterfly(g, a, t) {
  const f = a.st === 'rest' ? 0.25 + Math.abs(Math.sin(t * 1.2 + a.id)) * 0.1 : Math.abs(Math.sin(t * 13 + a.id));
  g.fillStyle = a.c; for (const [sx, r] of [[1, 5.5], [-1, 5.5]]) { g.save(); g.scale(f * 0.9 + 0.1, 1); g.beginPath(); g.ellipse(sx * 4, -3, r, 4.2, sx * 0.5, 0, 7); g.fill(); g.beginPath(); g.ellipse(sx * 3, 2.5, 3.6, 3, -sx * 0.4, 0, 7); g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; g.restore(); }
  g.strokeStyle = '#2A1E14'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(0, -5); g.lineTo(0, 4); g.stroke();
}
const FA_DRAW = { deer: faDeer, rabbit: faRabbit, squirrel: faSquirrel, fox: faFox, turtle: faTurtle, bird: faBird, butterfly: faButterfly };
/* ---------- comportamiento ---------- */
const FA_CFG = { deer: { sp: 26, states: [['walk', 5, 11], ['eat', 6, 14], ['idle', 3, 6], ['look', 2, 4]], w: [3, 5, 2, 1.5] }, rabbit: { sp: 38, states: [['walk', 2, 5], ['eat', 4, 9], ['alert', 1.5, 3], ['idle', 2, 4]], w: [3, 5, 2, 1] }, squirrel: { sp: 60, states: [['walk', 1.5, 3.5], ['eat', 5, 10], ['idle', 1.5, 3]], w: [3, 4, 1.5] }, fox: { sp: 36, states: [['walk', 6, 12], ['sniff', 3, 6], ['idle', 2, 4]], w: [5, 2, 1] }, turtle: { sp: 6, states: [['walk', 10, 18], ['idle', 5, 10]], w: [3, 1] } };
function faPick(a) {
  const c = FA_CFG[a.k]; let r = Math.random() * c.w.reduce((x, y) => x + y, 0), i = 0; while (r > c.w[i]) { r -= c.w[i]; i++; }
  const [st, lo, hi] = c.states[i]; a.st = st; a.tm = faR(lo, hi); if (st === 'walk' && Math.random() < 0.3) a.dir *= -1;
  if (a.k === 'rabbit' && st === 'walk') a.run = 0;
}
function faGround(a, dt) {
  const c = FA_CFG[a.k]; a.tm -= dt; a.blink = Math.max(0, (a.blink || 0) - dt); if (Math.random() < dt * 0.25) a.blink = 0.12;
  const eating = a.st === 'eat' && a.k === 'deer'; a.gr = faApp(a.gr || 0, eating ? 1 : a.st === 'sniff' ? 0.6 : a.st === 'look' ? 0 : 0, dt * 1.6);
  a.earF = a.st === 'look' ? 1 : 0;
  if (a.st === 'walk') { const sp = a.sp * (a.run ? 2.6 : 1) * (a.k === 'rabbit' ? 1 : 1); a.x += a.dir * sp * dt; a.phase += dt * sp * (a.k === 'rabbit' ? 0.13 : a.k === 'squirrel' ? 0.2 : 0.1) * (a.k === 'rabbit' ? 1 : 1); }
  if (a.tm <= 0) { a.run = 0; faPick(a); }
  const W = FA.W; if (a.x < -50 && a.dir < 0) a.dir = 1; if (a.x > W + 50 && a.dir > 0) a.dir = -1;
  if (a.k === 'fox' && a.away > 0) { a.away -= dt; a.st = 'walk'; a.x += a.dir * 70 * dt; a.phase += dt * 6; if (a.away <= 0) { a.x = Math.random() < 0.5 ? -60 : W + 60; a.dir = a.x < 0 ? 1 : -1; faPick(a); } }
  if (a.k === 'fox' && !a.away && (a.x > W + 40 || a.x < -40) && a.stay <= 0) { a.away = faR(35, 80); a.stay = 0; }
  if (a.k === 'fox') a.stay = Math.max(0, (a.stay || 0) - dt);
}
function faMake(k, d) {
  const W = FA.W; const a = { k, id: Math.random() * 99, x: faR(0, W), d, dir: Math.random() < 0.5 ? -1 : 1, phase: Math.random() * 6, st: 'idle', tm: faR(1, 6), gr: 0, sp: FA_CFG[k] ? FA_CFG[k].sp * faR(0.8, 1.15) : 0 };
  if (k === 'deer') a.buck = Math.random() < 0.4; if (k === 'rabbit') a.col = ['#C8B6A0', '#B9A28A', '#E8E2D8'][(Math.random() * 3) | 0];
  if (k === 'fox') { a.away = faR(8, 22); a.x = -60; a.dir = 1; a.stay = 0; }
  if (FA_CFG[k]) faPick(a); return a;
}
function faSetup() {
  const W = FA.W, H = FA.H; FA.list = [faMake('deer', 0.3), faMake('deer', 0.85), faMake('rabbit', 0.6), faMake('rabbit', 0.95), faMake('squirrel', 0.45), faMake('fox', 0.75), faMake('turtle', 1)];
  FA.list[1].s2 = 0.62;
  for (let i = 0; i < 3; i++) FA.list.push({ k: 'bird', id: i * 7.3, x: faR(0, W), y: faR(H * 0.1, H * 0.35), d: 0.5, dir: i % 2 ? -1 : 1, st: 'fly', tm: faR(8, 22), c: [['#4A78C8', '#E9EEF8'], ['#7A5636', '#E86A3A'], ['#E8C93A', '#C9972A']][i], vy: 0, tx: 0, ty: 0 });
  for (let i = 0; i < 4; i++) FA.list.push({ k: 'butterfly', id: i * 3.1, x: faR(0, W), y: faR(H * 0.5, H * 0.8), d: 0.5, dir: 1, st: 'fly', tm: faR(3, 8), c: ['#F28AB0', '#F5C542', '#7FB5F0', '#B58CF0'][i], fl: null, tx: faR(0, W), ty: faR(H * 0.5, H * 0.85) });
  FA.flowers = Array.from({ length: Math.max(8, Math.round(W / 70)) }, () => ({ x: faR(10, W - 10), y: H * faR(0.86, 0.95), c: ['#F8E7A1', '#F7B2C6', '#FFFFFF', '#C9B2F0'][(Math.random() * 4) | 0], s: faR(0.8, 1.3) }));
}
const faGy = (d) => FA.H * (0.865 + 0.075 * d);
function faStep(dt, t) {
  const W = FA.W, H = FA.H;
  for (const a of FA.list) {
    if (FA_CFG[a.k]) { a.y = faGy(a.d); faGround(a, dt); }
    else if (a.k === 'bird') {
      a.tm -= dt;
      if (a.st === 'fly') { a.x += a.dir * 70 * dt; a.y += Math.sin(t * 2 + a.id) * 14 * dt; a.y = Math.min(H * 0.55, Math.max(H * 0.08, a.y)); if (a.x < -40 && a.dir < 0) a.dir = 1; if (a.x > W + 40 && a.dir > 0) a.dir = -1; if (a.tm <= 0) { a.st = 'land'; a.tx = faR(40, W - 40); a.ty = faGy(faR(0.2, 1)); a.dir = a.tx > a.x ? 1 : -1; } }
      else if (a.st === 'land') { const dx = a.tx - a.x, dy = a.ty - a.y; const d = Math.hypot(dx, dy) || 1; const sp = 90 * Math.min(1, d / 60 + 0.3); a.x += (dx / d) * sp * dt; a.y += (dy / d) * sp * dt; if (d < 4) { a.st = 'hop'; a.tm = faR(5, 12); } }
      else { a.y = a.ty; if (a.st === 'hop' || a.st === 'peck') { a.sub = (a.sub || 0) - dt; if (a.sub <= 0) { a.st = a.st === 'hop' ? 'peck' : 'hop'; a.sub = faR(0.5, 1.6); if (a.st === 'hop') a.x += a.dir * faR(4, 14); } } a.x = Math.max(10, Math.min(W - 10, a.x)); if (a.tm <= 0) { a.st = 'fly'; a.tm = faR(10, 24); a.dir = Math.random() < 0.5 ? -1 : 1; } }
    }
    else if (a.k === 'butterfly') {
      a.tm -= dt;
      if (a.st === 'fly') { const dx = a.tx - a.x, dy = a.ty - a.y; const d = Math.hypot(dx, dy) || 1; a.x += (dx / d) * 38 * dt + Math.sin(t * 3 + a.id) * 18 * dt; a.y += (dy / d) * 38 * dt + Math.cos(t * 4.1 + a.id) * 16 * dt; a.dir = dx > 0 ? 1 : -1; if (d < 8 || a.tm <= 0) { if (a.fl) { a.st = 'rest'; a.tm = faR(3, 7); } else { const f = FA.flowers[(Math.random() * FA.flowers.length) | 0]; a.fl = f; a.tx = f.x; a.ty = f.y - 6; a.tm = 20; } } }
      else if (a.tm <= 0) { a.st = 'fly'; a.fl = null; a.tx = faR(0, W); a.ty = faR(H * 0.45, H * 0.85); a.tm = faR(4, 9); }
    }
  }
  /* convivencia: los conejos huyen del zorro; los pájaros que aterrizan cerca del venado lo hacen alzar la vista */
  const fox = FA.list.find((a) => a.k === 'fox');
  for (const a of FA.list) if (a.k === 'rabbit') { if (fox && !fox.away && Math.abs(fox.x - a.x) < 150 && Math.abs(fox.d - a.d) < 0.5) { a.run = 1; a.st = 'walk'; a.dir = a.x >= fox.x ? 1 : -1; a.tm = Math.max(a.tm, 1.4); } }
}
function faFrame(now) {
  if (!FA.on) return; requestAnimationFrame(faFrame);
  if (document.hidden || (typeof GAME !== 'undefined' && GAME.run) || (typeof GL !== 'undefined' && GL.run)) { FA.last = now; return; }
  if (now - FA.last < 33) return; const dt = Math.min(0.1, (now - FA.last) / 1000); FA.last = now;
  const g = FA.g, t = now / 1000; faStep(dt, t); faDraw(g, t);
}
function faDraw(g, t) {
  g.clearRect(0, 0, FA.W, FA.H);
  for (const f of FA.flowers) { g.strokeStyle = 'rgba(70,130,70,.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x, f.y + 7 * f.s); g.stroke(); g.fillStyle = f.c; for (let i = 0; i < 5; i++) { const an = i * 1.2566; g.beginPath(); g.arc(f.x + Math.cos(an) * 2.4 * f.s, f.y + Math.sin(an) * 2.4 * f.s, 1.9 * f.s, 0, 7); g.fill(); } g.fillStyle = '#F2B544'; g.beginPath(); g.arc(f.x, f.y, 1.3 * f.s, 0, 7); g.fill(); }
  const arr = FA.list.slice().sort((a, b) => (a.y || 0) - (b.y || 0));
  for (const a of arr) {
    const sc = (a.k === 'deer' ? 0.78 : a.k === 'fox' ? 0.74 : a.k === 'turtle' ? 0.9 : a.k === 'bird' || a.k === 'butterfly' ? 1 : 0.95) * (0.78 + 0.3 * a.d) * (a.s2 || 1) * Math.min(1.4, Math.max(0.9, FA.W / 600));
    g.save(); g.translate(a.x, a.y); g.scale(sc * a.dir, sc);
    if (FA_CFG[a.k]) { g.fillStyle = 'rgba(20,40,20,.16)'; g.beginPath(); g.ellipse(0, 1, (a.k === 'deer' ? 34 : a.k === 'fox' ? 30 : 16), 4, 0, 0, 7); g.fill(); }
    FA_DRAW[a.k](g, a, t); g.restore();
  }
}
function faSize() {
  const sc = document.querySelector('.scene'); if (!sc || !FA.cv) return; const dpr = Math.min(2, window.devicePixelRatio || 1); const W = innerWidth, H = innerHeight;
  if (W === FA.W && H === FA.H && FA.list.length) return; FA.W = W; FA.H = H; FA.cv.width = W * dpr; FA.cv.height = H * dpr; FA.g.setTransform(dpr, 0, 0, dpr, 0, 0); faSetup();
}
function faInit() {
  const sc = document.querySelector('.scene'); if (!sc || FA.cv) return;
  const cv = document.createElement('canvas'); cv.id = 'fauna'; cv.setAttribute('aria-hidden', 'true'); sc.appendChild(cv); FA.cv = cv; FA.g = cv.getContext('2d'); faSize();
  addEventListener('resize', () => { clearTimeout(FA.rt); FA.rt = setTimeout(faSize, 200); });
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) { faStep(0.1, 1); faDraw(FA.g, 1); return; }
  FA.on = true; FA.last = performance.now(); requestAnimationFrame(faFrame);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', faInit); else faInit();
