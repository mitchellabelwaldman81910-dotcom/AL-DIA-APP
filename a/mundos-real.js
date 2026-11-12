/* Cinnavia 7.55 — MUNDOS · paleta natural (menos saturada) para que los animales se vean realistas. */
'use strict';
function mdRealCol(col) {
  if (typeof col !== 'string' || col[0] !== '#') return col; const [r, g, b] = mdHex(col), l = 0.3 * r + 0.59 * g + 0.11 * b, k = 0.62;
  const f = (v) => Math.max(0, Math.min(255, Math.round((l + (v - l) * k) * 0.93)));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
function mdRealLook(L) { const o = Object.assign({}, L); for (const k of Object.keys(o)) if (typeof o[k] === 'string' && o[k][0] === '#') o[k] = mdRealCol(o[k]); return o; }
for (const nm of ['mdDrawQuad', 'mdDrawBird', 'mdDrawSwim', 'mdDrawSpecial']) {
  const base = globalThis[nm] || eval(nm);
  const wrapped = function (c, a, S, time, P) {
    if (S.fantasy || S.rb) return base(c, a, S, time, P);
    const L = S.look; if (!S.lookR) S.lookR = mdRealLook(L); S.look = S.lookR; const pc = P.col; if (pc) P.col = mdRealCol(pc);
    try { return base(c, a, S, time, P); } finally { S.look = L; P.col = pc; }
  };
  eval(nm + ' = wrapped');
}
