/* Genera niveles de The Worn con llaves (K), puertas (D) y tierra frágil (C), y los resuelve con el motor del juego.
   Cada nivel exige usar de verdad la mecánica: la solución óptima tiene que recoger la llave o romper tierra frágil.
   Uso: node tools/gen-worn.cjs desde hasta salida.json   (desde/hasta: 1..160, tramo nuevo del juego) */
const fs = require('fs'); const vm = require('vm');
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname + '/../a/gusano-motor.js', 'utf8') + ';this.M={gwParse,gwStep,gwStart,gwSolve};', ctx); const M = ctx.M;
const [A, B, OUT] = [+process.argv[2], +process.argv[3], process.argv[4]]; const BUD = +process.env.BUD || 6000;
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function params(j) {
  const p = (j - 1) / 159;
  const mech = j <= 30 ? 'key' : j <= 60 ? 'crack' : j % 3 === 0 ? 'both' : j % 3 === 1 ? 'key' : 'crack';
  return { p, mech, w: Math.min(11, (mech === 'crack' ? 8 : 10) + Math.floor(p * 2.99)), h: p > 0.45 ? 8 : 7, len: Math.min(mech === 'crack' ? 6 : 4, 3 + Math.floor(p * 3.99)), apples: Math.min(7, 2 + Math.floor(p * 6)), spikes: p > 0.3 ? 1 + Math.floor(p * 2) : 0, plats: 1 + Math.floor(p * 3), T: 16 + 26 * Math.pow(p, 0.9), cr: 1 + Math.floor(p * 3) };
}
function make(j, att) {
  const P = params(j), r = rng(j * 7919 + att * 104729 + 17); const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const { w, h } = P; const g = new Array(w * h).fill('.'); const maxG = Math.max(2, Math.floor(h * 0.5));
  const ht = []; let cur = ri(2, 3); for (let x = 0; x < w; x++) { if (x > P.len + 1) { const d = r(); if (d < 0.3) cur--; else if (d < 0.6) cur++; cur = Math.max(1, Math.min(maxG, cur)); } ht.push(cur); }
  for (let x = 0; x < P.len + 2; x++) ht[x] = ht[0];
  for (let x = 0; x < w; x++) for (let y = h - ht[x]; y < h; y++) g[y * w + x] = '#';
  const top = (x) => h - ht[x];
  for (let i = 0; i < P.plats; i++) { const l = ri(1, 3), x = ri(P.len + 3, Math.max(P.len + 3, w - l)), y = ri(1, Math.max(1, h - maxG - 2)); for (let k = 0; k < l && x + k < w; k++) if (g[y * w + x + k] === '.') g[y * w + x + k] = '#'; }
  const ex = ri(Math.floor(w * 0.7), w - 1); let ey = top(ex) - 1 - ri(0, Math.min(3, top(ex) - 1)); if (ey < 0) ey = 0; if (g[ey * w + ex] === '#') return null; g[ey * w + ex] = 'E';
  const sy = top(0) - 1; const worm = []; for (let i = 0; i < P.len; i++) worm.push(sy * w + (P.len - 1 - i + 1));
  const used = (i) => worm.includes(i);
  const need = { key: false, crack: false };
  if (P.mech === 'key' || P.mech === 'both') { /* una reja de puertas entre el gusano y la salida, y la llave de este lado */
    const gx = ri(P.len + 4, Math.max(P.len + 4, ex - 1)); if (gx >= ex) return null; let any = false;
    for (let y = 0; y < top(gx); y++) { const i = y * w + gx; if (g[i] === '.') { g[i] = 'D'; any = true; } }
    if (!any) return null;
    const kx = ri(P.len + 2, gx - 1), ky = top(kx) - 1 - ri(0, 2); if (ky < 0) return null; const ki = ky * w + kx; if (g[ki] !== '.' || used(ki)) return null; g[ki] = 'K'; need.key = true;
  }
  if (P.mech === 'crack' || P.mech === 'both') {
    let n = 0, guard = 0; while (n < P.cr && guard++ < 60) { const x = ri(P.len + 2, w - 2); const i = top(x) * w + x; if (g[i] === '#' && x !== ex) { g[i] = 'C'; n++; } }
    if (!n) return null; need.crack = true;
  }
  for (let i = 0; i < P.spikes; i++) { const x = ri(P.len + 3, w - 2); const y = top(x) - 1; const idx = y * w + x; if (y >= 0 && g[idx] === '.') g[idx] = 'S'; }
  const free = []; for (let i = 0; i < w * h; i++) if (g[i] === '.' && !used(i) && (i % w) > 0) free.push(i);
  let n = 0, guard = 0; while (n < P.apples && guard++ < 200) { const i = free[ri(0, free.length - 1)]; if (g[i] === '.' && !used(i)) { const y = (i / w) | 0; if (y >= h - 1) continue; g[i] = 'A'; n++; } }
  const rows = []; for (let y = 0; y < h; y++) rows.push(g.slice(y * w, y * w + w).join(''));
  return { s: `${w},${h},0,0|${rows.join('/')}|${worm.join(',')}`, P, need };
}
function mutate(s, r) {
  const lv = M.gwParse(s); const g = lv.g.split(''); const { w, h } = lv; const ri = (a, b) => a + Math.floor(r() * (b - a + 1)); const worm = lv.worm; const occ = (i) => worm.includes(i); const k = r();
  if (k < 0.4) { const ap = lv.apples; if (!ap.length) return null; const i = ap[ri(0, ap.length - 1)]; const j = ri(0, w * h - 1); if (g[j] !== '.' || occ(j)) return null; g[i] = '.'; g[j] = 'A'; }
  else if (k < 0.65) { const j = ri(0, w * h - 1); if (occ(j) || !['.', '#'].includes(g[j])) return null; g[j] = g[j] === '#' ? '.' : '#'; }
  else if (k < 0.78) { const e = g.indexOf('E'); const j = ri(Math.floor(w * 0.6), w - 1) + ri(0, h - 1) * w; if (g[j] !== '.' || occ(j)) return null; g[e] = '.'; g[j] = 'E'; }
  else if (k < 0.9) { const ap = lv.apples; if (ap.length <= 1) return null; g[ap[ri(0, ap.length - 1)]] = '.'; }
  else { const j = ri(0, w * h - 1); if (g[j] !== '.' || occ(j)) return null; g[j] = 'A'; }
  const rows = []; for (let y = 0; y < h; y++) rows.push(g.slice(y * w, y * w + w).join('')); return `${w},${h},0,0|${rows.join('/')}|${worm.join(',')}`;
}
function uses(L, sol, need) {
  let st = M.gwStart(L); for (const d of sol.path) st = M.gwStep(L, st, d).state;
  const keyOk = !need.key || (st.mask & L.kmask) !== 0; let crOk = true; if (need.crack) { crOk = false; for (const c of L.cracks) if ((st.mask >> L.cIdx[c]) & 1) crOk = true; }
  return keyOk && crOk;
}
const out = [];
for (let j = A; j <= B; j++) {
  const P = params(j); const r = rng(j * 31337 + 9); let best = null; const t0 = Date.now(); const maxD = Math.ceil(P.T * 1.8) + 6;
  const good = (c) => c && c.sol.moves >= P.T * 0.85 && c.sol.apples >= Math.floor(P.p * 4);
  for (let att = 0; Date.now() - t0 < BUD && !good(best); att++) {
    const c = make(j, att); if (!c) continue; const L0 = M.gwParse(c.s); const so = M.gwSolve(L0, 40000, maxD); if (!so || so.moves < 4 || !uses(L0, so, c.need)) continue;
    let curS = c.s, cur = so;
    for (let it = 0; it < 400 && Date.now() - t0 < BUD && !good({ sol: cur }); it++) {
      const m = mutate(curS, r); if (!m) continue; const lv = M.gwParse(m); if (lv.apples.length > P.apples + 2 || lv.apples.length < 1) continue;
      const s2 = M.gwSolve(lv, 40000, maxD); if (!s2 || !uses(lv, s2, c.need)) continue;
      if (s2.moves >= cur.moves && (s2.moves > cur.moves || s2.apples >= cur.apples)) { curS = m; cur = s2; }
    }
    if (!best || cur.moves > best.sol.moves) best = { s: curS, sol: cur };
  }
  if (!best) { console.error('SIN NIVEL', j); out.push(null); continue; }
  const parts = best.s.split('|'); const hd = parts[0].split(','); hd[3] = best.sol.moves; out.push([hd.join(','), parts[1], parts[2]].join('|'));
  if (j % 5 === 0) console.error('nivel', j, P.mech, 'mov', best.sol.moves, 'ap', best.sol.apples, 'T', P.T.toFixed(0));
}
fs.writeFileSync(OUT, JSON.stringify(out));
