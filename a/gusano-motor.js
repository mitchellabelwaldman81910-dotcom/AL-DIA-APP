/* Cinnavia 7.48 — Motor de The Worn (sin pantalla): lo usan el juego y el generador de niveles, así que
   las reglas son idénticas y todo nivel publicado se resolvió de verdad. */
var GW_DX = [0, 1, 0, -1], GW_DY = [-1, 0, 1, 0]; /* 0 arriba · 1 derecha · 2 abajo · 3 izquierda */
function gwParse(s) {
  /* "w,h,tema,opt|filas separadas por /|gusano (índices, cabeza primero)" */
  const [head, rows, worm] = s.split('|'); const [w, h, th, opt] = head.split(',').map(Number);
  const g = rows.split('/').join(''); const aIdx = new Array(w * h).fill(-1); let n = 0; const apples = [];
  for (let i = 0; i < g.length; i++) if (g[i] === 'A') { aIdx[i] = n++; apples.push(i); }
  /* 7.48: llaves (K), puertas (D) y tierra frágil (C). Sus bits van después de los de las manzanas. */
  const nA = apples.length; const keys = [], cracks = [], kIdx = new Array(w * h).fill(-1), cIdx = new Array(w * h).fill(-1); let kmask = 0;
  for (let i = 0; i < g.length; i++) { if (g[i] === 'K') { kIdx[i] = nA + keys.length; kmask |= 1 << kIdx[i]; keys.push(i); } }
  for (let i = 0; i < g.length; i++) { if (g[i] === 'C') { cIdx[i] = nA + keys.length + cracks.length; cracks.push(i); } }
  return { w, h, th, opt, g, aIdx, apples, nA, keys, cracks, kIdx, cIdx, kmask, worm: worm.split(',').map(Number) };
}
/* ¿la celda es sólida ahora? (muro, puerta cerrada o tierra frágil sin romper) */
function gwSolid(L, mask, i) { const c = L.g[i]; return c === '#' || (c === 'D' && !(mask & L.kmask)) || (c === 'C' && !((mask >> L.cIdx[i]) & 1)); }
function gwStep(L, st, d) {
  const w = L.w, h = L.h, hd = st.worm[0], hx = hd % w, hy = (hd / w) | 0, nx = hx + GW_DX[d], ny = hy + GW_DY[d];
  if (nx < 0 || ny < 0 || nx >= w || ny >= h) return null;
  const ni = ny * w + nx, c = L.g[ni]; if (gwSolid(L, st.mask, ni)) return null;
  const ai = L.aIdx[ni], eat = ai >= 0 && !((st.mask >> ai) & 1), len = st.worm.length;
  for (let i = 0; i < len; i++) if (st.worm[i] === ni && !(i === len - 1 && !eat)) return null;
  let worm, mask = st.mask;
  const ki = L.kIdx[ni], key = ki >= 0 && !((mask >> ki) & 1); if (key) mask |= 1 << ki;
  if (eat) { worm = [ni].concat(st.worm); mask |= 1 << ai; } else { worm = [ni].concat(st.worm.slice(0, len - 1)); }
  const frames = [worm];
  if (c === 'S') return { state: { worm, mask }, status: 'dead', frames, eat, key };
  if (c === 'E') return { state: { worm, mask }, status: 'win', frames, eat, key };
  for (let guard = 0; guard < h + 2; guard++) {
    let sup = false; const brk = [];
    for (let i = 0; i < worm.length && !sup; i++) {
      const b = worm[i] + w; if (b >= w * h) continue;
      const bc = L.g[b]; if (bc === 'S') { sup = true; break; }
      if (bc === 'C' && gwSolid(L, mask, b)) { brk.push(L.cIdx[b]); continue; }
      if (gwSolid(L, mask, b)) { sup = true; break; }
      const bi = L.aIdx[b]; if (bi >= 0 && !((mask >> bi) & 1)) sup = true;
    }
    if (sup) break;
    for (const bi of brk) mask |= 1 << bi; /* la tierra frágil se rompe y el gusano sigue cayendo */
    worm = worm.map((x) => x + w); frames.push(worm);
    if (worm.some((x) => x >= w * h)) return { state: { worm, mask }, status: 'dead', frames, eat };
    if (worm.some((x) => L.g[x] === 'S')) return { state: { worm, mask }, status: 'dead', frames, eat };
    if (L.g[worm[0]] === 'E') return { state: { worm, mask }, status: 'win', frames, eat };
  }
  return { state: { worm, mask }, status: 'ok', frames, eat, key };
}
function gwStart(L) {
  /* el gusano empieza ya asentado */
  let st = { worm: L.worm.slice(), mask: 0 };
  for (let g = 0; g < L.h; g++) {
    let sup = false;
    for (const s of st.worm) { const b = s + L.w; if (b >= L.w * L.h) continue; const bc = L.g[b]; if (bc === 'S' || gwSolid(L, 0, b) || (L.aIdx[b] >= 0)) { sup = true; break; } }
    if (sup) break; st = { worm: st.worm.map((x) => x + L.w), mask: 0 };
  }
  return st;
}
function gwSolve(L, cap, maxDepth, from) {
  /* búsqueda en anchura: devuelve { moves, apples, path:[dirs] } o null; cap = máximo de estados */
  cap = cap || 200000; const s0 = from || gwStart(L); const key = (s) => s.worm.join(',') + '/' + s.mask;
  const seen = new Map(); seen.set(key(s0), null); let cur = [{ s: s0, k: key(s0) }]; let depth = 0, total = 1;
  while (cur.length) {
    depth++; if (maxDepth && depth > maxDepth) return null; const nxt = [];
    for (const { s, k } of cur) {
      for (let d = 0; d < 4; d++) {
        const r = gwStep(L, s, d); if (!r || r.status === 'dead') continue;
        const nk = key(r.state); if (seen.has(nk)) continue; seen.set(nk, { from: k, d });
        if (r.status === 'win') {
          const path = []; let kk = nk; while (seen.get(kk)) { const p = seen.get(kk); path.push(p.d); kk = p.from; }
          let ap = 0, m = r.state.mask & ((1 << L.nA) - 1); while (m) { ap += m & 1; m >>>= 1; }
          return { moves: depth, apples: ap, path: path.reverse(), states: total };
        }
        nxt.push({ s: r.state, k: nk }); if (++total > cap) return null;
      }
    }
    cur = nxt;
  }
  return null;
}
if (typeof module !== 'undefined') module.exports = { gwParse, gwStep, gwStart, gwSolve, gwSolid };
