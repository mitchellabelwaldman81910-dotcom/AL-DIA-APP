/* ---------- frutas: se ven en el árbol, se cortan, se bajan y se comen ---------- */
const MD_FR_KIND = { palm: 'banana', jungle: 'banana', oak: 'manzana', maple: 'manzana', bush: 'mora', sakura: 'cereza' };
const MD_FR_COL = { banana: '#f3d23a', manzana: '#e0412f', mora: '#6a3a8a', cereza: '#f06a8a' };
function mdFrKind(f) { return MD_FR_KIND[f.kind] || 'manzana'; }
function mdFrPos(f, i) { const r = (k) => { const x = Math.sin((f.id * 13.37 + i * 7.1 + k * 3.3)) * 43758.5453; return x - Math.floor(x); }; return { x: f.x + (r(1) - 0.5) * f.h * 0.62, y: f.y - f.h * (0.55 + r(2) * 0.3) }; }
{ const base = mdBuild; mdBuild = function (def) { base(def); MDS.fruits = []; MDS.hearts = []; MDS.frT = 0; for (const f of MDS.fl) if (f.fruit) f.nf = 4; }; }
function mdFrDrawOne(c, kind, x, y, s) {
  const col = MD_FR_COL[kind] || '#e0412f'; c.save(); c.translate(x, y);
  if (kind === 'banana') { c.strokeStyle = col; c.lineWidth = 3.2 * s; c.lineCap = 'round'; c.beginPath(); c.arc(0, 0, 5 * s, 0.4, 2.6); c.stroke(); c.strokeStyle = '#6a5a1a'; c.lineWidth = 1.4 * s; c.beginPath(); c.moveTo(4.4 * s, 2.6 * s); c.lineTo(5.6 * s, 1.2 * s); c.stroke(); }
  else { c.fillStyle = col; mdE(c, 0, 0, 3.6 * s, 3.4 * s); c.fillStyle = 'rgba(255,255,255,.55)'; mdE(c, -1.2 * s, -1.2 * s, 1 * s, 0.8 * s); c.strokeStyle = '#5a3a1a'; c.lineWidth = 1 * s; c.beginPath(); c.moveTo(0, -3 * s); c.lineTo(0.6 * s, -5 * s); c.stroke(); if (kind !== 'mora') { c.fillStyle = '#4f9a3a'; mdE(c, 2 * s, -4.4 * s, 2 * s, 1 * s, 0.4); } }
  c.restore();
}
function mdFrItems(items, x0, x1) {
  if (!MDS.fl) return;
  for (const f of MDS.fl) { if (!f.nf || f.burnt || f.x < x0 - 200 || f.x > x1 + 200) continue; const kd = mdFrKind(f); items.push({ y: f.y + 0.7, bug: 1, draw: (c) => { for (let i = 0; i < f.nf; i++) { const p = mdFrPos(f, i); c.strokeStyle = '#3f6a2a'; c.lineWidth = 1; c.beginPath(); c.moveTo(p.x, p.y - 9); c.lineTo(p.x, p.y - 3); c.stroke(); mdFrDrawOne(c, kd, p.x, p.y, 1.35); } } }); }
  for (const q of MDS.fruits || []) if (q.x > x0 - 60 && q.x < x1 + 60) items.push({ y: q.y + 0.03, bug: 1, draw: (c) => { c.globalAlpha = Math.min(1, q.left * 1.5 + 0.3) * (q.rot ? 0.55 : 1); if (q.fall) { mdFrDrawOne(c, q.kind, q.x, q.y, 1.3); } else { c.fillStyle = 'rgba(0,0,0,.14)'; mdE(c, q.x, q.y + 1, 6, 1.8); mdFrDrawOne(c, q.kind, q.x, q.y - 3, 1.3 * (0.5 + q.left * 0.5)); } c.globalAlpha = 1; } });
  for (const h of MDS.hearts || []) items.push({ y: 9000, bug: 1, draw: (c) => { const k = h.t / 2.2; c.globalAlpha = Math.max(0, 1 - k); c.fillStyle = '#ff6b8e'; const x = h.x, y = h.y - k * 34, s = 4 + k * 2; c.beginPath(); c.moveTo(x, y + s * 0.9); c.bezierCurveTo(x - s * 1.6, y - s * 0.2, x - s * 0.6, y - s * 1.5, x, y - s * 0.5); c.bezierCurveTo(x + s * 0.6, y - s * 1.5, x + s * 1.6, y - s * 0.2, x, y + s * 0.9); c.fill(); c.globalAlpha = 1; } });
}
{ const base = mdCarcItems; mdCarcItems = function (items, x0, x1) { base(items, x0, x1); mdFrItems(items, x0, x1); }; }
function mdFrDrop(f, x, y) { if (!f.nf) return; f.nf--; if (!f.nf) { f.fruit = false; f.fruitT = 0; } MDS.fruits.push({ x, y, kind: mdFrKind(f), left: 1, t: MDS.t, fall: true, gy: mdGY(x), vy: 0 }); }
const MD_FR_EAT = (a) => a.layer === 'land' && !a.arb && !a.inHome && a.S.t !== 'b' && (a.S.d === 'h' || a.S.d === 'o') && !MD_MONKEY.has(a.sp) && a.sp !== 'mono';
{ const base = mdThink; mdThink = function (a, dt) {
  if (!MDS.fruits || a.dead) return base(a, dt);
  const mk = a.sp === 'mono' && a.age >= 0.55;
  if (mk && a.inCanopy && a.state === 'canopy' && a.timer <= 0 && a.tree && a.tree.nf > 0 && !a.carry && Math.random() < 0.7) {
    const f = a.tree; f.nf--; if (!f.nf) { f.fruit = false; f.fruitT = 0; } a.carry = { kind: mdFrKind(f) }; a.down = true; mdSetState(a, 'climb', 8); return;
  }
  if (a.carry && a.state === 'climb') return base(a, dt);
  if (a.carry && !a.inCanopy && a.state !== 'banana' && a.state !== 'climb') { a.dir = a.dir || 1; mdSetState(a, 'banana', 6); a.tx = a.x; a.carryT = 6; return; }
  if (!a.dead && a.hunger > 0.3 && a.age >= 0.5 && (a.state === 'idle' || a.state === 'wander') && !a.eatF) {
    const ok = MD_FR_EAT(a) || (mk && !a.inCanopy && !a.carry);
    if (ok) { let b = null, bd = 700; for (const q of MDS.fruits) if (!q.fall && !q.rot && q.left > 0) { const d = Math.abs(q.x - a.x); if (d < bd) { bd = d; b = q; } } if (b && Math.random() < 0.5) { a.eatF = b; } }
  }
  if (a.eatF) { const q = a.eatF; if (q.left <= 0 || q.rot || a.state === 'flee' || a.state === 'sleep' || a.hunger < 0.05) { a.eatF = null; return base(a, dt); } if (Math.abs(q.x - a.x) > 22) { a.tx = q.x; a.running = false; if (a.state !== 'wander') mdSetState(a, 'wander', 3); a.timer = Math.max(a.timer, 2); return; } mdSetState(a, mk ? 'banana' : 'eat', 2); a.tx = a.x; a.dir = q.x >= a.x ? 1 : -1; a.eatingF = true; return; }
  base(a, dt);
}; }
function mdFrTick(dt) {
  const fs = MDS.fruits; if (!fs) return;
  MDS.frT += dt; for (const q of fs) if (q.fall) { q.vy += 520 * dt; q.y += q.vy * dt; if (q.y >= q.gy) { q.y = q.gy; q.fall = false; q.t = MDS.t; } }
  if (MDS.frT > 14) { MDS.frT = 0; const cand = MDS.fl.filter((f) => f.nf > 1 && !f.burnt && f.burn <= 0); if (cand.length && Math.random() < 0.5) { const f = cand[Math.floor(Math.random() * cand.length)], p = mdFrPos(f, f.nf - 1); mdFrDrop(f, p.x, p.y); } }
  for (const f of MDS.fl) { if (f.fruit && !(f.nf > 0)) f.nf = 4; if (!f.fruit && f.nf) f.nf = 0; }
  for (const q of fs) if (!q.fall && MDS.t - q.t > 40 && !q.rot) q.rot = true;
  MDS.fruits = fs.filter((q) => q.fall || (q.left > 0 && MDS.t - q.t < 140));
  for (const a of MDS.an) {
    if (a.dead) continue;
    if (a.eatF && a.eatingF) { a.eatingF = false; a.hunger = Math.max(0, a.hunger - dt * 0.08); a.eatF.left -= dt * 0.22; if (a.eatF.left <= 0) { a.eatF = null; if (a.state === 'eat' || a.state === 'banana') a.timer = 0; } }
    if (a.carry && a.state === 'banana' && !a.inCanopy) { a.carryT -= dt; a.hunger = Math.max(0, a.hunger - dt * 0.05); if (a.carryT <= 0) { const ck = a.carry.kind; a.carry = null; a.timer = 0; MDS.fruits.push({ x: a.x + a.dir * 8, y: mdGY(a.x), kind: ck, left: 0.15, t: MDS.t - 30, rot: true }); } }
    if (a.state === 'fruit' && a.tree && a.arb !== true && a.layer === 'air' && !a.flying && a.tree.nf > 0) { a.fT = (a.fT || 0) + dt; if (a.fT > 6) { a.fT = 0; const p = mdFrPos(a.tree, a.tree.nf - 1); mdFrDrop(a.tree, p.x, p.y); } }
    if (a.sp === 'mono' && a.age < 0.7 && (a.state === 'groom' || a.state === 'banana' || a.state === 'rest' || a.state === 'chase') && Math.random() < dt * 0.35) MDS.hearts.push({ x: a.x + (Math.random() - 0.5) * 14, y: a.y - 22, t: 0 });
    else if (a.sp === 'mono' && (a.state === 'groom') && Math.random() < dt * 0.3) MDS.hearts.push({ x: a.x + 6, y: a.y - 34, t: 0 });
  }
  for (const h of MDS.hearts) h.t += dt; MDS.hearts = MDS.hearts.filter((h) => h.t < 2.2).slice(-14);
}
{ const base = mdUpdate; mdUpdate = function (dt) { base(dt); if (MDS.def) mdFrTick(Math.min(dt, 0.1)); }; }
{ const base = mdDrawQuad; mdDrawQuad = function (c, a, S, time, P) { base(c, a, S, time, P); if (a.carry && a.state !== 'banana') { c.save(); mdFrDrawOne(c, a.carry.kind, 10, -S.z * 14 - 6, 1.2); c.restore(); } }; }
