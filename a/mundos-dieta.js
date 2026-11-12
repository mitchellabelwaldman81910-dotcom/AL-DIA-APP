/* Cinnavia 7.57 — MUNDOS · comida real de los herbívoros: pasto, hojas, bambú, heno… solo lo que existe en cada mundo. */
'use strict';
/* g = probabilidad de elegir pasto; r = plantas que ramonean (hi = cabeza en alto) */
const MD_DIETA = {
  conejo: { g: 1 }, liebre: { g: 1 }, cebra: { g: 1 }, nu: { g: 1 }, bisonte: { g: 1 }, yak: { g: 1 }, llama: { g: 1 }, alpaca: { g: 1 }, bufalo: { g: 1 }, hipo: { g: 1 }, wombat: { g: 1 }, marmota: { g: 1 }, cuyo: { g: 1 }, chinchilla: { g: 1 }, hamster: { g: 1 }, tortuga: { g: 1 }, unicornio: { g: 1 }, reno: { g: 1 },
  oveja: { g: 0.75, r: { k: ['hay'] } }, vaca: { g: 0.75, r: { k: ['hay'] } }, caballo: { g: 0.8, r: { k: ['hay'] } }, pony: { g: 0.8, r: { k: ['hay'] } }, burro: { g: 0.8, r: { k: ['hay'] } },
  cabra: { g: 0.5, r: { k: ['bush', 'hay'] } }, canguro: { g: 0.7, r: { k: ['bush'] } }, gacela: { g: 0.6, r: { k: ['acacia', 'bush'] } }, rino: { g: 0.6, r: { k: ['bush'] } },
  camello: { g: 0.25, r: { k: ['bush', 'acacia'] } }, capibara: { g: 0.6, r: { k: ['reed'] } },
  elefante: { g: 0.35, r: { k: ['acacia', 'baobab', 'jungle', 'bamboo', 'bush', 'palm'], hi: 1 } }, jirafa: { r: { k: ['acacia'], hi: 1 } },
  venado: { g: 0.45, r: { k: ['bush', 'maple', 'oak', 'willow', 'fir', 'fern'] } }, ciervorojo: { g: 0.45, r: { k: ['bush', 'maple', 'oak', 'willow', 'fir', 'fern'] } },
  alce: { g: 0.3, r: { k: ['willow', 'bush', 'maple', 'fir'], hi: 1 } }, okapi: { r: { k: ['jungle', 'fern', 'bush'] } }, tapir: { g: 0.2, r: { k: ['fern', 'bush', 'jungle', 'platanero'] } },
  panda: { r: { k: ['bamboo'] } }, pandarojo: { r: { k: ['bamboo'] } }, koala: { r: { k: ['eucalyptus'], hi: 1 } },
  bronto: { r: { k: ['palm', 'jungle', 'fern', 'fir'], hi: 1 } }, trike: { r: { k: ['fern', 'palm'] } }, stego: { r: { k: ['fern'] } },
  castor: { r: { k: ['willow', 'oak', 'maple', 'pine', 'fir'] } }, caracol: { r: { k: ['mush', 'fern', 'flower'] } }
};
/* cuánto pasto hay en cada mundo (0 = nada) */
const MD_PASTO_K = { sabana: 1.7, prairie: 1.7, pradera: 1.6, granja: 1.2, bosque: 0.9, otono: 0.8, sakura: 0.8, bambu: 0.5, selva: 0.25, granjungla: 0.25, amazonas: 0.2, india: 0.5, pantano: 0.6, manglar: 0, montanas: 0.7, alpes: 1.2, andes: 0.6, himalaya: 0.45, canon: 0.18, volcan: 0, sahara: 0.1, sonora: 0.14, oasis: 0.4, australia: 1.1, dinos: 0, magico: 1, rio: 1, lagoalpino: 1, playa: 0.3, costa: 0.5, tundra: 0.9, taiga: 0.7, polonorte: 0.25, polosur: 0 };
const MD_MUSGO = new Set(['tundra', 'taiga', 'polonorte', 'himalaya']);
{ const base = mdBuild; mdBuild = function (def) {
  base(def); MDS.pasto = [];
  if (MDS.sea || def.mode !== 'land') return;
  const k = MD_PASTO_K[def.id] != null ? MD_PASTO_K[def.id] : 0.8, n = Math.round(k * MDS.WW / 75);
  for (let i = 0, g = 0; i < n && g < n * 8; g++) { const x = 30 + Math.random() * (MDS.WW - 60); if (mdDepth(x) > -12) continue; i++; MDS.pasto.push({ x, y: mdGY(x) + Math.random() * 18, amt: 0.6 + Math.random() * 0.4, sz: 0.8 + Math.random() * 0.5, seed: 1 + Math.floor(Math.random() * 999) }); }
  MDS.pasto.sort((a, b) => a.x - b.x);
}; }
function mdPastoDraw(c, p, W, musgo) {
  const R = mdRng(p.seed), n = 9, full = (10 + 16 * p.sz), hh = full * (0.25 + 0.75 * Math.min(1, p.amt)), sw = Math.sin(MDS.t * 1.3 + p.seed) * 1.6, c1 = musgo ? '#8f9d72' : mdSh(W.pal.g2, -0.04), c2 = musgo ? '#a9b58c' : mdSh(W.pal.g1, 0.04);
  c.lineCap = 'round';
  for (let i = 0; i < n; i++) { const a = (i - (n - 1) / 2) / n * 1.6, x0 = (i - (n - 1) / 2) * 2.1 * p.sz, len = hh * (0.7 + R() * 0.5) * (p.amt > 0.14 ? 1 : 0.35); c.strokeStyle = i % 3 ? c1 : c2; c.lineWidth = musgo ? 2.2 : 1.6; c.beginPath(); c.moveTo(x0, 0); c.quadraticCurveTo(x0 + a * len * 0.5, -len * 0.6, x0 + a * len * 1.1 + sw * (len / full), -len); c.stroke(); }
}
{ const base = mdCarcItems; mdCarcItems = function (items, x0, x1) {
  base(items, x0, x1); if (!MDS.pasto || !MDS.def) return; const W = MDS.def, musgo = MD_MUSGO.has(W.id);
  for (const p of MDS.pasto) if (p.x > x0 - 30 && p.x < x1 + 30) items.push({ y: p.y - 0.4, bug: 1, draw: (c) => { c.save(); c.translate(p.x, p.y); mdPastoDraw(c, p, W, musgo); c.restore(); } });
}; }
function mdDietaPick(a, far) {
  const D = MD_DIETA[a.sp]; if (!D) return null;
  const G = () => { let b = null, bd = far; for (const p of MDS.pasto) if (p.amt > 0.25) { const d = Math.abs(p.x - a.x); if (d < bd) { bd = d; b = p; } } return b && { t: 'g', ref: b, x: b.x + (a.x < b.x ? -6 : 6) }; };
  const Rr = () => { let b = null, bd = far; for (const f of MDS.fl) { if (f.burnt || f.burn > 0 || f.under || !D.r.k.includes(f.kind) || (f.bz != null && f.bz < 0.25)) continue; const d = Math.abs(f.x - a.x); if (d < bd) { bd = d; b = f; } } return b && { t: 'r', ref: b, x: b.x + (a.x < b.x ? -1 : 1) * (f_off(b, a)) }; };
  if (D.g && D.r) return Math.random() < D.g ? (G() || Rr()) : (Rr() || G());
  return D.r ? Rr() : G();
}
const f_off = (b, a) => (b.kind === 'hay' ? 26 : b.kind === 'bamboo' || b.kind === 'fern' || b.kind === 'bush' || b.kind === 'flower' || b.kind === 'mush' || b.kind === 'reed' ? 14 : 20) + a.S.z * 3;
{ const base = mdThink; mdThink = function (a, dt) {
  if (!MDS.pasto || a.dead || a.arb || a.layer !== 'land' || !MD_DIETA[a.sp] || a.age < 0.4 || a.state === 'follow') return base(a, dt);
  if (MDS.E.shelter || MDS.E.night > 0.6 || a.state === 'shelter' || a.state === 'sleep' || a.state === 'flee' || a.inHome) { a.fz = null; a.fzEat = false; return base(a, dt); }
  if (!a.fz && a.hunger > 0.3 && (a.state === 'idle' || a.state === 'wander') && Math.random() < 0.6) { const z = mdDietaPick(a, 1100); if (z) a.fz = z; }
  if (a.fz) {
    const z = a.fz, D = MD_DIETA[a.sp], ok = z.t === 'g' ? z.ref.amt > 0.12 : (z.ref.bz == null || z.ref.bz > 0.12) && !z.ref.burnt;
    if (!ok || a.state === 'flee' || a.state === 'sleep' || a.hunger < 0.04) { a.fz = null; a.fzEat = false; return base(a, dt); }
    if (Math.abs(z.x - a.x) > 16) { a.tx = z.x; a.running = false; if (a.state !== 'wander') mdSetState(a, 'wander', 3); a.timer = Math.max(a.timer, 2); return; }
    mdSetState(a, 'graze', 2); a.tx = a.x; a.dir = z.ref.x >= a.x ? 1 : -1; a.fzEat = true; a.bzHigh = !!(z.t === 'r' && D.r && D.r.hi); return;
  }
  base(a, dt);
  /* si el motor viejo lo mandó a "pastar" en el aire, lo llevo a comida de verdad */
  if (a.state === 'graze' && !a.fz) {
    const z = mdDietaPick(a, a.hunger > 0.5 ? 1100 : 160);
    if (z) { a.fz = z; a.tx = z.x; mdSetState(a, 'wander', 4); }
    else if (a.hunger < 0.5) mdSetState(a, 'idle', 4 + Math.random() * 4);
  }
}; }
{ const base = mdUpdate; mdUpdate = function (dt) {
  base(dt); if (!MDS.pasto || !MDS.def) return; dt = Math.min(dt, 0.1);
  for (const p of MDS.pasto) if (p.amt < 1) p.amt = Math.min(1, p.amt + dt * 0.012);
  for (const f of MDS.fl) if (f.bz != null && f.bz < 1) f.bz = Math.min(1, f.bz + dt * 0.01);
  for (const a of MDS.an) {
    if (a.dead || !a.fz) continue;
    if (!(a.fzEat && a.state === 'graze')) { a.fzEat = false; continue; }
    a.fzEat = false; const z = a.fz, hi = a.bzHigh, rate = 0.05 / Math.max(0.7, Math.sqrt(a.S.z));
    if (z.t === 'g') z.ref.amt -= dt * rate; else z.ref.bz = (z.ref.bz == null ? 1 : z.ref.bz) - dt * rate * 0.5;
    if (Math.random() < dt * 3) MDS.parts.push({ x: a.x + a.dir * (8 + a.S.z * 3), y: a.y - (hi ? 10 + a.S.z * 12 : 3), vx: a.dir * 8, vy: hi ? 22 : -16, life: 0.7, max: 0.7, col: z.t === 'g' ? '#8cc05a' : (z.ref.kind === 'hay' ? '#e0c060' : mdPalFor(MDS.def, z.ref.kind)), size: 2, kind: 'puff' });
  }
}; }
{ const base = mdDrawQuad; mdDrawQuad = function (c, a, S, time, P) { if (a.state === 'graze' && a.fz && a.bzHigh) P.hd = -0.6; base(c, a, S, time, P); }; }
