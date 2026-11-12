/* Cinnavia 7.55 — MUNDOS · árboles con raíces y ramas; monos y aves se posan sobre ramas reales. */
'use strict';
const MD_NOBR = new Set(['bamboo']);
function mdTreeBr(f) {
  if (f.br) return f.br; const R = mdRng(f.seed + 77), h = f.h, br = []; f.br = br;
  if (f.kind === 'palm') { br.push({ t: 0.9, side: 1, len: h * 0.16, rise: -h * 0.01, w: 0, draw: 0 }, { t: 0.9, side: -1, len: h * 0.16, rise: -h * 0.01, w: 0, draw: 0 }); return br; }
  if (f.kind === 'bamboo') { br.push({ t: 0.85, side: 1, len: 6, rise: 0, w: 0, draw: 0 }); return br; }
  const n = 4 + Math.floor(R() * 3); let side = R() < 0.5 ? -1 : 1;
  for (let i = 0; i < n; i++) { br.push({ t: 0.3 + (i / (n - 1)) * 0.32 + (R() - 0.5) * 0.04, side, len: h * (0.2 + R() * 0.16) * (1 - i * 0.06), rise: h * (0.025 + R() * 0.05), w: Math.max(2.2, h * 0.022 * (1 - i * 0.1)), draw: 1 }); side = -side; }
  return br;
}
function mdBrXY(f, b, s) { const d = b.len * s; return { x: f.x + b.side * d, y: f.y - f.h * b.t - b.rise * Math.pow(s, 1.3) }; }
function mdPerchPick(f, a) {
  const br = mdTreeBr(f), used = new Set(); for (const o of MDS.an) if (o !== a && !o.dead && o.perch && o.perch.f === f.id) used.add(o.perch.bi + ':' + o.perch.si);
  const slots = [0.4, 0.65, 0.92]; const opts = []; for (let bi = 0; bi < br.length; bi++) for (let si = 0; si < slots.length; si++) if (!used.has(bi + ':' + si)) opts.push({ f: f.id, bi, si, s: slots[si] });
  const p = opts.length ? opts[Math.floor(Math.random() * opts.length)] : { f: f.id, bi: Math.floor(Math.random() * br.length), si: 0, s: 0.5 }; return p;
}
function mdPerchXY(f, p) { const b = mdTreeBr(f)[p.bi] || mdTreeBr(f)[0]; return mdBrXY(f, b, p.s); }
function mdBranchY(f, p, x) { const b = mdTreeBr(f)[p.bi] || mdTreeBr(f)[0]; const s = Math.min(1, Math.abs(x - f.x) / Math.max(1, b.len)); return f.y - f.h * b.t - b.rise * Math.pow(s, 1.3); }

/* dibujo: raíces antes del árbol; ramas con hojas encima */
{ const base = mdDrawFlora; mdDrawFlora = function (c, f, W, time, snowy, wind) {
  const tree = MD_TREES.has(f.kind) && f.kind !== 'bamboo' && f.kind !== 'palm';
  if (tree && !f.burnt) { const h = f.h, R = mdRng(f.seed + 5), bark = f.kind === 'sakura' ? '#5a3a40' : f.kind === 'eucalyptus' ? '#a8a090' : '#5a3e2a', w = Math.max(3, h * 0.045); c.save(); c.fillStyle = bark; c.strokeStyle = bark; c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const side = i % 2 ? 1 : -1, l = h * (0.1 + R() * 0.1) * (i > 2 ? 0.7 : 1), ww = w * (0.9 - i * 0.12); c.beginPath(); c.moveTo(side * ww * 0.3, -h * 0.07); c.quadraticCurveTo(side * l * 0.45, -h * 0.015, side * l, 2 + R() * 3); c.lineTo(side * l * 0.78, 3); c.quadraticCurveTo(side * l * 0.3, 0, side * ww * 0.2, -1); c.fill(); }
    c.restore(); }
  base(c, f, W, time, snowy, wind);
  if (tree && !f.burnt && f.kind !== 'pine' && f.kind !== 'fir' || (f.kind === 'pine' || f.kind === 'fir') && !f.burnt) {
    const br = mdTreeBr(f), h = f.h, leaf = mdPalFor(W, f.kind), hi = mdSh(leaf, 0.12), bark = f.kind === 'sakura' ? '#5a3a40' : f.kind === 'eucalyptus' ? '#b0a898' : '#5a3e2a', sw = Math.sin(time * 0.0007 + f.seed) * (1.4 + (wind || 0) * 3) * (h / 200) * 0.25; c.save(); c.lineCap = 'round';
    for (const b of br) { if (!b.draw) continue; const x0 = b.side * 2, y0 = -h * b.t, tip = { x: b.side * b.len + sw, y: y0 - b.rise };
      c.strokeStyle = bark; c.lineWidth = b.w; c.beginPath(); c.moveTo(x0, y0 + 2); c.quadraticCurveTo(b.side * b.len * 0.5, y0 - b.rise * 0.2 + 3, tip.x, tip.y); c.stroke();
      c.lineWidth = Math.max(1, b.w * 0.45); c.beginPath(); c.moveTo(b.side * b.len * 0.55, y0 - b.rise * 0.3 + 1); c.lineTo(b.side * b.len * 0.7 + sw * 0.5, tip.y - h * 0.045); c.moveTo(b.side * b.len * 0.35, y0 - b.rise * 0.1 + 2); c.lineTo(b.side * b.len * 0.42, y0 + h * 0.03); c.stroke();
      if (f.kind !== 'dead') { c.fillStyle = leaf; for (let k = 0; k < 3; k++) mdE(c, b.side * b.len * (0.55 + k * 0.22) + sw * (k * 0.3), tip.y + (k - 1) * 4 - 3 + b.rise * (0.6 - k * 0.25) * 0.4, h * 0.035, h * 0.022, b.side * 0.4); c.fillStyle = hi; mdE(c, tip.x, tip.y - 3, h * 0.03, h * 0.02, b.side * 0.4); }
    } c.restore(); }
}; }

/* lógica de posado */
{ const base = mdMove; mdMove = function (a, dt) {
  const f = a.arb && a.tree && !a.tree.burnt ? a.tree : null, st = a.state;
  if (f && (st === 'climb' || st === 'canopy' || st === 'sleep' || st === 'hang' || st === 'banana' || st === 'swing')) {
    if (!a.perch || a.perch.f !== f.id) { if (st === 'swing') { a.swX0 = a.x; a.swY0 = a.y; } a.perch = mdPerchPick(f, a); }
    const px = mdPerchXY(f, a.perch);
    if (st === 'climb') a.tx = f.x; else if (st === 'swing' || a.up >= 0.99) a.tx = px.x;
    base(a, dt);
    const gy = mdGY(f.x), bb = mdTreeBr(f)[a.perch.bi], baseY = f.y - f.h * bb.t;
    if (st === 'climb') {
      const atTrunk = Math.abs(a.x - f.x) < 8;
      if (a.down) { if (atTrunk) { a.up = Math.max(0, a.up - dt * 0.35); if (a.up <= 0) { a.down = false; a.inCanopy = false; a.perch = null; mdSetState(a, 'idle', 1); a.y = gy; return; } a.y = mdLerp(gy, baseY, a.up); } else { a.up = 1; a.y = mdBranchY(f, a.perch, a.x); a.tx = f.x; } }
      else { if (atTrunk) { a.up = Math.min(1, a.up + dt * 0.3); a.y = mdLerp(gy, baseY, a.up); if (a.up >= 1) mdSetState(a, 'canopy', 7 + Math.random() * 9); } }
      if (a.up > 0 && a.up < 1) a.x = mdLerp(a.x, f.x, 0.4);
    } else if (st === 'swing') {
      const tot = Math.max(30, Math.abs(px.x - (a.swX0 == null ? a.x : a.swX0))), p = Math.min(1, Math.abs(a.x - (a.swX0 == null ? a.x : a.swX0)) / tot); a.up = 1; a.y = mdLerp(a.swY0 == null ? px.y : a.swY0, px.y, p) + Math.sin(Math.PI * p) * 34;
      if (Math.abs(a.x - px.x) < 8) { a.swX0 = null; a.swY0 = null; mdSetState(a, 'canopy', 5 + Math.random() * 6); }
    } else { a.up = 1; a.y = mdBranchY(f, a.perch, a.x) + (st === 'hang' ? 30 : 0); }
    return;
  }
  base(a, dt);
}; }
