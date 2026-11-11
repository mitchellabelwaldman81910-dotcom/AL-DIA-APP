/* Genera niveles del Gusano Goloso y los resuelve con el mismo motor del juego.
   Uso: node tools/gen-gusano.js desde hasta salida.json */
const fs = require('fs'); const vm = require('vm');
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname + '/../a/gusano-motor.js', 'utf8') + ';this.M={gwParse,gwStep,gwStart,gwSolve};', ctx); const M = ctx.M;
const [A, B, OUT] = [+process.argv[2], +process.argv[3], process.argv[4]]; const FAST = !!process.env.FAST; const CAP = FAST ? 12000 : 90000, ITS = FAST ? 45 : 350, ATT = FAST ? 3 : 30; const GOAL = FAST ? 0.7 : 0.9;
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function params(L) {
  const p = (L - 1) / 999;
  return { w: Math.min(11, 7 + Math.floor(p * 7.99)), h: Math.min(8, 6 + Math.floor(p * 5.99)), len: Math.min(6, 3 + Math.floor(p * 4.99)), apples: Math.min(8, 2 + Math.floor(p * 8)), spikes: L >= 150 ? 1 + Math.floor((L - 150) / 220) : 0, plats: 1 + Math.floor(p * 4),
    T: 7 + 62 * Math.pow(p, 0.85), minApples: Math.floor(p * 5), th: Math.floor((L - 1) / 50) };
}
function make(L, att) {
  const P = params(L), r = rng(L * 7919 + att * 104729 + 13); const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const { w, h } = P; const g = new Array(w * h).fill('.'); const maxG = Math.max(2, Math.floor(h * 0.5));
  const ht = []; let cur = ri(1, 2); for (let x = 0; x < w; x++) { if (x > P.len + 1) { const d = r(); if (d < 0.3) cur--; else if (d < 0.6) cur++; cur = Math.max(1, Math.min(maxG, cur)); } ht.push(cur); }
  for (let x = 0; x < P.len + 2; x++) ht[x] = ht[0];
  for (let x = 0; x < w; x++) for (let y = h - ht[x]; y < h; y++) g[y * w + x] = '#';
  const top = (x) => h - ht[x];
  for (let i = 0; i < P.plats; i++) { const l = ri(1, 3), x = ri(P.len + 3, Math.max(P.len + 3, w - l)), y = ri(1, Math.max(1, h - maxG - 2)); for (let k = 0; k < l && x + k < w; k++) if (g[y * w + x + k] === '.') g[y * w + x + k] = '#'; }
  const ex = ri(Math.floor(w * 0.65), w - 1); let ey = top(ex) - 1 - ri(0, Math.min(3, top(ex) - 1)); if (ey < 0) ey = 0; if (g[ey * w + ex] === '#') return null; g[ey * w + ex] = 'E';
  const sy = top(0) - 1; const worm = []; for (let i = 0; i < P.len; i++) worm.push(sy * w + (P.len - 1 - i + 1)); /* cabeza a la derecha */
  const free = []; for (let i = 0; i < w * h; i++) if (g[i] === '.' && !worm.includes(i) && (i % w) > 0) free.push(i);
  for (let i = 0; i < P.spikes; i++) { const x = ri(P.len + 3, w - 2); const y = top(x) - 1; const idx = y * w + x; if (y >= 0 && g[idx] === '.') g[idx] = 'S'; }
  let n = 0, guard = 0; while (n < P.apples && guard++ < 200) { const i = free[ri(0, free.length - 1)]; if (g[i] === '.' && !worm.includes(i)) { const y = (i / w) | 0; if (y >= h - 1) continue; g[i] = 'A'; n++; } }
  const rows = []; for (let y = 0; y < h; y++) rows.push(g.slice(y * w, y * w + w).join(''));
  const s = `${w},${h},${P.th},0|${rows.join('/')}|${worm.join(',')}`; return { s, P };
}
function mutate(L, s, r) {
  const lv = M.gwParse(s); const g = lv.g.split(''); const { w, h } = lv; const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const worm = lv.worm; const occ = (i) => worm.includes(i);
  const k = r();
  if (k < 0.35) { /* mover una manzana */
    const ap = lv.apples; if (!ap.length) return null; const i = ap[ri(0, ap.length - 1)]; const j = ri(0, w * h - 1); if (g[j] !== '.' || occ(j)) return null; g[i] = '.'; g[j] = 'A';
  } else if (k < 0.55) { /* agregar o quitar muro */
    const j = ri(0, w * h - 1); if (occ(j) || g[j] === 'E' || g[j] === 'A') return null; g[j] = g[j] === '#' ? '.' : g[j] === '.' ? '#' : g[j];
  } else if (k < 0.7) { /* mover la salida */
    const e = g.indexOf('E'); const j = ri(Math.floor(w * 0.5) , w - 1) + ri(0, h - 1) * w; if (g[j] !== '.' || occ(j)) return null; g[e] = '.'; g[j] = 'E';
  } else if (k < 0.85) { /* quitar una manzana y poner un muro */
    const ap = lv.apples; if (ap.length <= 1) return null; const i = ap[ri(0, ap.length - 1)]; g[i] = '.';
  } else { /* agregar una manzana */
    const j = ri(0, w * h - 1); if (g[j] !== '.' || occ(j)) return null; g[j] = 'A';
  }
  const rows = []; for (let y = 0; y < h; y++) rows.push(g.slice(y * w, y * w + w).join(''));
  return `${w},${h},${lv.th},0|${rows.join('/')}|${worm.join(',')}`;
}
const out = []; const BUD = +process.env.BUD || 4000; const GOAL2 = +process.env.GOAL || 0.8;
for (let L = A; L <= B; L++) {
  const P = params(L); const r = rng(L * 31337 + 5); let best = null; const t0 = Date.now(); const maxD = Math.ceil(P.T * 1.7) + 6;
  const good = (c) => c && c.sol.moves >= P.T * GOAL2 && c.sol.apples >= P.minApples;
  for (let att = 0; Date.now() - t0 < BUD && !good(best); att++) {
    const c = make(L, att); if (!c) continue; let sol = M.gwSolve(M.gwParse(c.s), 25000, maxD); if (!sol || sol.moves < 3) continue;
    let curS = c.s, cur = sol;
    for (let it = 0; it < 400 && Date.now() - t0 < BUD && !(cur.moves >= P.T * GOAL2 && cur.apples >= P.minApples); it++) {
      const m = mutate(L, curS, r); if (!m) continue; const lv = M.gwParse(m);
      const ap = lv.apples.length; if (ap > P.apples + (L < 80 ? 0 : 2) || ap < 1) continue;
      const so = M.gwSolve(lv, 25000, maxD); if (!so) continue;
      if (so.moves >= cur.moves && (so.moves > cur.moves || so.apples >= cur.apples)) { curS = m; cur = so; }
    }
    if (!best || cur.moves > best.sol.moves) best = { s: curS, sol: cur };
  }
  if (!best) { console.error('SIN NIVEL', L); out.push(null); continue; }
  const parts = best.s.split('|'); const hd = parts[0].split(','); hd[3] = best.sol.moves; out.push([hd.join(','), parts[1], parts[2]].join('|'));
  if (L % 10 === 0) console.error('nivel', L, 'mov', best.sol.moves, 'ap', best.sol.apples, 'T', P.T.toFixed(0));
}
fs.writeFileSync(OUT, JSON.stringify(out));
