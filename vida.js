/* Al Día — VIDA: cuentas, árbol de 100 niveles, Bosques colaborativos y rankings.
   Este archivo se carga antes de app.js; todo lo que usa de la app se resuelve al ejecutarse. */
'use strict';

/* =========================================================
   1. Niveles y cálculo del árbol
   ========================================================= */
// puntos acumulados para llegar al nivel n (personas: 0 a 100; Bosques: 0 a 1000). Igual que en el servidor.
const TREE_T = (n) => Math.round(10 * n + 0.5 * Math.pow(n, 1.75));
const FOREST_T = (n) => Math.round(25 * n + 0.2 * Math.pow(n, 1.6));
const levelOf = (pts, f = TREE_T, max = 100) => { let n = 0; while (n < max && f(n + 1) <= pts) n++; return n; };

const STAGES = [[0, 'Semilla'], [1, 'Brote'], [5, 'Plantita'], [10, 'Arbolito'], [20, 'Árbol joven'], [30, 'Árbol frondoso'], [40, 'Árbol en flor'], [50, 'Árbol de frutos'], [60, 'Bosque encantado'], [70, 'Jardín de luz'], [80, 'Edén'], [90, 'Paraíso'], [100, 'Árbol de la Vida']];
const stageName = (v) => { let s = STAGES[0][1]; for (const [n, name] of STAGES) if (v >= n) s = name; return s; };
const MILESTONES = [
  [1, 'Brote', 'Tu semilla despierta y saca su primera hojita.'], [10, 'Primeras ramas', 'El tronco se vuelve fuerte y se ramifica.'],
  [20, 'Cielo con sol', 'Sale el sol y las nubes pasean por tu cielo.'], [30, 'Colinas con arbolitos', 'Aparecen arbolitos a lo lejos.'],
  [35, 'Un estanque', 'Un agüita tranquila brilla junto a tu árbol.'], [38, 'Primeras flores', 'Las ramas se llenan de flores.'],
  [45, 'Mariposas', 'Llegan las mariposas a visitarte.'], [55, 'Frutos', 'Tu árbol da frutos de todo el esfuerzo.'],
  [60, 'Pájaros cantando', 'Los pájaros hacen su nido en tus ramas.'], [70, 'Río y luciérnagas', 'Un río serpentea y las luciérnagas encienden la tarde.'],
  [75, 'Pétalos bailando', 'El viento mece pétalos por todo el paraíso.'], [80, 'Arcoíris', 'Un arcoíris cruza tu cielo.'],
  [90, 'Cielo de estrellas', 'La noche se llena de estrellas.'], [96, 'Aurora', 'Una aurora de colores abraza tu paraíso.'],
  [100, 'Árbol de la Vida', 'Hojas doradas, frutos de luz y un paraíso completo.'],
];

function extraFor(id) {
  const out = { water: {}, gdone: [] };
  if (id !== REG.me) return out;
  out.water = (REG.water && REG.water[id]) || {};
  const items = {};
  for (const f of Object.values(FOR.f || {})) for (const it of f.items || []) items[it.id] = it;
  for (const [tid, ts] of Object.entries(REG.gdone || {})) {
    const it = items[tid]; if (!it || it.type !== 'task') continue;
    const day = toISO(new Date(ts));
    out.gdone.push({ day, onTime: !it.due || day <= it.due });
  }
  return out;
}

function treeCalc(d, extra = {}) {
  const dayOf = (ms) => toISO(new Date(ms));
  const gain = {}, wet = {}, nCnt = {};
  const t0 = today();
  for (const t of d.tasks || []) {
    if (t.created) wet[dayOf(t.created)] = 1;
    if (t.done && t.doneAt) {
      const dn = dayOf(t.doneAt); wet[dn] = 1;
      const ok = !t.due || dn <= t.due;
      gain[dn] = (gain[dn] || 0) + (ok ? 10 + (t.priority === 3 ? 4 : 0) + ((t.steps || []).length > 1 ? 2 : 0) : 3);
    }
  }
  const soft = (ms) => { if (!ms) return; const dn = dayOf(ms); wet[dn] = 1; if ((nCnt[dn] = (nCnt[dn] || 0) + 1) <= 3) gain[dn] = (gain[dn] || 0) + 2; };
  for (const n of d.notes || []) soft(n.updated || n.created || n.at);
  for (const t of d.thoughts || []) soft(t.at);
  for (const k of Object.keys(extra.water || {})) wet[k] = 1;
  for (const g of extra.gdone || []) { wet[g.day] = 1; gain[g.day] = (gain[g.day] || 0) + (g.onTime ? 10 : 3); }
  const keys = [...new Set([...Object.keys(wet), ...Object.keys(gain)])].filter((k) => k <= t0).sort();
  const out = { pts: 0, life: 0, level: 0, streak: 0, wet: !!wet[t0], dry: 0, cur: 0, need: TREE_T(1), loss: 0, days: 0 };
  if (!keys.length) return out;
  let day = keys[0] < addDays(t0, -730) ? addDays(t0, -730) : keys[0];
  let pts = 0, life = 0, streak = 0, lastWet = null;
  for (let guard = 0; day <= t0 && guard < 900; guard++, day = addDays(day, 1)) {
    let g = Math.min(gain[day] || 0, 70);
    g = Math.round(g * (1 + Math.min(streak, 14) * 0.02));
    pts += g; life += g;
    if (wet[day]) { streak++; lastWet = day; }
    else if (day < t0) { streak = 0; pts = Math.max(0, pts - Math.round(6 + levelOf(pts) * 0.6)); }
    out.days++;
  }
  const level = levelOf(pts);
  return { ...out, pts, life, level, streak, cur: TREE_T(level), need: level >= 100 ? TREE_T(100) : TREE_T(level + 1), loss: Math.round(6 + level * 0.6), dry: lastWet ? Math.max(0, diffDays(lastWet, t0)) : 0 };
}
function treeNow(id) {
  const d = id === dataOwner() ? S : load(keyFor(id));
  return treeCalc(d, extraFor(id));
}
function waterToday() {
  if (!REG.me) return;
  ((REG.water ||= {})[REG.me] ||= {})[today()] = 1;
  const w = REG.water[REG.me]; const ks = Object.keys(w).sort();
  while (ks.length > 40) delete w[ks.shift()];
  saveReg(); treeSoon();
}

/* Se revisa después de cada cambio: riego, subida y bajada de nivel */
let treeT = null;
function treeSoon() { clearTimeout(treeT); treeT = setTimeout(treeCheck, 350); }
function treeCheck() {
  const id = dataOwner();
  if (!id || !REG.tokens || !tokens()[id] || !profile(id)) return;
  const c = treeNow(id);
  const st = ((REG.tree ||= {})[id] ||= null);
  if (!st) { REG.tree[id] = { level: c.level, wetDay: c.wet ? today() : '', down: '' }; saveReg(); return; }
  if (c.wet && st.wetDay !== today()) {
    st.wetDay = today(); saveReg();
    VUI.pour = Date.now() + 7000;
    if (!choosing) { toast('💧 ¡Regaste tu árbol! Hoy crecerá más.'); if (Snd.on()) { Snd.drop(); } if (route().name === 'vida') render(); }
  }
  if (c.level > st.level) {
    st.level = c.level; saveReg();
    if (!choosing) levelUp(c.level);
    cloudSoon();
  } else if (c.level < st.level) {
    const was = st.level; st.level = c.level; saveReg();
    if (!choosing && st.down !== today()) { st.down = today(); saveReg(); toast(`Tu árbol tuvo sed y bajó del nivel ${was} al ${c.level}. Súbele una tarea o un apunte para regarlo.`, { ms: 6500 }); }
    cloudSoon();
  }
}
let cloudSoonT = null;
function cloudSoon() { clearTimeout(cloudSoonT); cloudSoonT = setTimeout(() => cloudSync(), 1200); }
function levelUp(level) {
  const ms = MILESTONES.find((m) => m[0] === level);
  Snd.chime();
  if (route().name === 'vida') { VUI.pour = Date.now() + 5000; render(); }
  const sc = $('.vscene'); if (sc) leafBurst(sc);
  if (ms || level % 10 === 0) {
    const d = $('#ask');
    d.innerHTML = `<form method="dialog" class="levelup"><div class="lu-tree">${treeScene({ level, wet: true, id: 'lu', seed: REG.me })}</div>
      <h3 class="serif">¡Nivel ${level}!</h3><p><b>${esc(stageName(level))}${ms ? ` · ${esc(ms[1])}` : ''}</b></p><p>${esc(ms ? ms[2] : 'Tu árbol sigue creciendo gracias a ti.')}</p>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" value="ok">Seguir creciendo</button></div></form>`;
    if (!d.open) { d.showModal(); setTimeout(() => leafBurst(d.querySelector('.lu-tree')), 300); }
  } else toast(`🌱 ¡Tu árbol subió al nivel ${level}!`);
}

/* Publica el nivel de cada persona para el ranking */
async function postTrees(live) {
  for (const id of live || []) {
    if (!profile(id) || !tokens()[id]) continue;
    const c = treeNow(id);
    const key = `${c.pts}|${c.life}|${c.streak}`;
    if ((REG.treePosted ||= {})[id] === key) continue;
    try {
      await cloudFetch('POST', { kind: 'tree', as: id, pts: c.pts, life: c.life, streak: c.streak });
      REG.treePosted[id] = key; saveReg();
      FOR.trees[id] = { ...(FOR.trees[id] || {}), id, name: profile(id).name, color: profile(id).color, pts: c.pts, life: c.life, level: c.level, streak: c.streak };
    } catch { /* se intenta en la próxima sincronización */ }
  }
}

/* =========================================================
   2. Dibujo del árbol (una escena distinta por nivel)
   ========================================================= */
const hex2 = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixHex = (a, b, t) => { const A = hex2(a), B = hex2(b); t = Math.max(0, Math.min(1, t)); return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * t).toString(16).padStart(2, '0')).join(''); };
const seedOf = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rnd = (seed) => { let s = seed || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const r1 = (n) => Math.round(n * 10) / 10;

function treeScene({ level = 0, max = 100, wet = true, id = 'v', seed = 'x', pour = false }) {
  const v = max === 100 ? Math.max(0, Math.min(100, level)) : Math.max(0, Math.min(100, Math.round(100 * Math.sqrt(level / max))));
  const p = v / 100;
  const R = rnd(seedOf(seed + ':' + id));
  const W = 360, H = 300, GY = 252;
  const sky1 = mixHex('#D5E6DA', '#78C4EE', Math.pow(p, 0.6)), sky2 = mixHex('#F3FAF5', '#FFE8BE', p);
  const grass = mixHex('#A9CF92', '#4DAA62', p), grass2 = mixHex('#8DBE7E', '#2F8A5B', p);
  const hillA = mixHex('#CFE4D3', '#8ED0A2', p), hillB = mixHex('#B9D9BF', '#62B87C', p);
  const leafA = wet ? mixHex('#A9D98A', '#2FA05F', p) : mixHex('#C3C88A', '#8E9A5A', p * 0.6);
  const leafB = wet ? mixHex('#7DBE7A', '#1F7F52', p) : mixHex('#A9AD72', '#76804A', p * 0.6);
  const leafC = wet ? mixHex('#C6E8A0', '#7EE0A0', p) : mixHex('#D4D194', '#A9AC6C', p * 0.5);
  const bark = mixHex('#8A6A4E', '#6B4A33', p);
  let o = `<svg viewBox="0 0 ${W} ${H}" class="vscene-svg ${wet ? 'is-wet' : 'is-dry'} ${pour ? 'is-pour' : ''}" role="img" aria-label="Tu árbol, nivel ${level}" preserveAspectRatio="xMidYMid slice">`;
  o += `<defs>
    <linearGradient id="sk-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky1}"/><stop offset="1" stop-color="${sky2}"/></linearGradient>
    <radialGradient id="sun-${id}"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".45" stop-color="#FFE48A" stop-opacity=".9"/><stop offset="1" stop-color="#FFE48A" stop-opacity="0"/></radialGradient>
    <linearGradient id="wa-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9AD8F0"/><stop offset="1" stop-color="#5FB5DE"/></linearGradient>
    <radialGradient id="gl-${id}"><stop offset="0" stop-color="#FFE9A0" stop-opacity=".85"/><stop offset="1" stop-color="#FFE9A0" stop-opacity="0"/></radialGradient>
    <linearGradient id="au-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7CF0C0" stop-opacity="0"/><stop offset=".4" stop-color="#7CF0C0" stop-opacity=".5"/><stop offset=".7" stop-color="#B58CF5" stop-opacity=".45"/><stop offset="1" stop-color="#B58CF5" stop-opacity="0"/></linearGradient>
  </defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#sk-${id})"/>`;
  if (v >= 90) { o += '<g class="v-stars">'; for (let i = 0; i < 26; i++) o += `<circle cx="${r1(R() * W)}" cy="${r1(R() * 120)}" r="${r1(0.7 + R() * 1.3)}" fill="#fff" style="--d:${r1(R() * 4)}s"/>`; o += '</g>'; }
  if (v >= 96) o += `<g class="v-aurora"><path d="M-20 70 C60 20 140 100 220 50 S340 30 400 70 V110 C320 80 240 130 160 90 S40 120 -20 100Z" fill="url(#au-${id})"/><path d="M-20 100 C70 60 150 130 240 80 S340 70 400 100 V130 C320 110 230 150 150 120 S30 140 -20 125Z" fill="url(#au-${id})" opacity=".6"/></g>`;
  // sol
  if (v >= 12) {
    const sr = 14 + 7 * p;
    o += `<g class="v-sun" transform="translate(292 58)"><circle r="${r1(sr * 3)}" fill="url(#sun-${id})"/>${v >= 30 ? `<g class="v-rays">${Array.from({ length: 12 }, (_, i) => `<path d="M0 ${-sr - 5} L0 ${-sr - 13}" stroke="#FFD66B" stroke-width="2.4" stroke-linecap="round" transform="rotate(${i * 30})"/>`).join('')}</g>` : ''}<circle r="${r1(sr)}" fill="#FFE27A"/></g>`;
  }
  // arcoíris
  if (v >= 80) o += `<g class="v-rainbow" fill="none" stroke-width="5" stroke-linecap="round">${['#F07C7C', '#F5B06A', '#F2DD6E', '#7CCB8B', '#6DB4EA', '#A58BE0'].map((c, i) => `<path d="M${28 + i * 5} ${GY - 6} C ${34 + i * 5} ${96 + i * 7}, ${326 - i * 5} ${96 + i * 7}, ${332 - i * 5} ${GY - 6}" stroke="${c}" opacity=".4"/>`).join('')}</g>`;
  // nubes
  o += `<g class="v-cloud c1" fill="#fff" opacity="${v >= 20 ? 0.95 : 0.75}"><ellipse cx="70" cy="52" rx="28" ry="10"/><ellipse cx="88" cy="46" rx="20" ry="11"/><ellipse cx="54" cy="47" rx="15" ry="8"/></g>`;
  if (v >= 10) o += `<g class="v-cloud c2" fill="#fff" opacity=".85"><ellipse cx="210" cy="36" rx="22" ry="8"/><ellipse cx="226" cy="31" rx="15" ry="8.5"/></g>`;
  // colinas
  o += `<path d="M0 200 C60 168 120 190 190 176 S320 160 360 184 V${H} H0Z" fill="${hillA}"/>`;
  if (v >= 30) {
    const n = Math.min(9, 3 + Math.floor((v - 30) / 8));
    for (let i = 0; i < n; i++) { const x = 15 + R() * 330, y = 178 + R() * 14, s = 0.6 + R() * 0.5; o += `<g transform="translate(${r1(x)} ${r1(y)}) scale(${r1(s)})" opacity=".9"><rect x="-1.5" y="-4" width="3" height="12" fill="${bark}"/><circle cy="-10" r="9" fill="${leafB}"/><circle cx="6" cy="-6" r="6" fill="${leafA}"/></g>`; }
  }
  o += `<path d="M0 222 C70 204 140 226 220 212 S330 200 360 214 V${H} H0Z" fill="${hillB}"/>`;
  // suelo
  o += `<path d="M0 ${GY - 8} C 80 ${GY - 16} 150 ${GY - 4} 230 ${GY - 10} S 340 ${GY - 16} 360 ${GY - 8} V ${H} H0Z" fill="${grass}"/><path d="M0 ${GY + 8} C 100 ${GY + 2} 200 ${GY + 14} 360 ${GY + 4} V ${H} H0Z" fill="${grass2}" opacity=".7"/>`;
  // estanque y río
  if (v >= 35) {
    o += `<g class="v-pond"><ellipse cx="76" cy="${GY + 14}" rx="${r1(30 + 18 * p)}" ry="8" fill="url(#wa-${id})"/><ellipse cx="68" cy="${GY + 12}" rx="10" ry="2.4" fill="#fff" opacity=".5" class="v-glint"/></g>`;
  }
  if (v >= 70) o += `<path class="v-river" d="M76 ${GY + 22} C 120 ${GY + 30}, 150 ${GY + 38}, 200 ${GY + 34} S 300 ${GY + 40}, 372 ${GY + 30} V ${GY + 44} C 300 ${GY + 52}, 220 ${GY + 48}, 190 ${GY + 48} S 110 ${GY + 40}, 76 ${GY + 30}Z" fill="url(#wa-${id})" opacity=".92"/>`;
  // flores y pasto
  const nGrass = Math.min(46, Math.floor(8 + v * 0.55));
  for (let i = 0; i < nGrass; i++) {
    const x = R() * W, y = GY - 4 + R() * 36; if (v >= 35 && x > 38 && x < 118 && y > GY + 6 && y < GY + 24) continue;
    const h = 4 + R() * 6;
    o += `<path d="M${r1(x)} ${r1(y)} q-2 -${r1(h * 0.6)} -3 -${r1(h)} M${r1(x)} ${r1(y)} q1 -${r1(h * 0.7)} 2 -${r1(h)}" stroke="${grass2}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
  }
  const nFl = v < 8 ? 0 : Math.min(34, Math.floor(v / 3));
  const fcol = ['#F4A9BE', '#FFD86B', '#FFFFFF', '#B8A2F0', '#FF9E80', '#8FD3F4'];
  for (let i = 0; i < nFl; i++) {
    const x = 8 + R() * (W - 16), y = GY + 2 + R() * 34; if (v >= 35 && x > 38 && x < 118 && y > GY + 4 && y < GY + 26) continue;
    const c = fcol[Math.floor(R() * fcol.length)], s = 0.7 + R() * 0.5;
    o += `<g transform="translate(${r1(x)} ${r1(y)}) scale(${r1(s)})" class="v-flower"><path d="M0 0 V-7" stroke="${grass2}" stroke-width="1.3"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="2" ry="3.2" cy="-10" fill="${c}" transform="rotate(${a} 0 -8)"/>`).join('')}<circle cy="-8" r="1.6" fill="#F6C94F"/></g>`;
  }
  // ---- el árbol ----
  const cx = 180;
  if (v === 0) {
    o += `<g class="v-seed"><ellipse cx="${cx}" cy="${GY + 2}" rx="26" ry="7" fill="#8A6A4E"/><ellipse cx="${cx}" cy="${GY - 1}" rx="18" ry="5" fill="#A98664"/><ellipse cx="${cx}" cy="${GY - 3}" rx="5" ry="3.4" fill="#5E432E"/><circle cx="${cx}" cy="${GY - 14}" r="14" fill="url(#gl-${id})" class="v-pulse"/></g>`;
  } else if (v < 3) {
    const h = 14 + v * 9;
    o += `<g class="vt-sway"><ellipse cx="${cx}" cy="${GY + 2}" rx="20" ry="5" fill="#8A6A4E"/><path d="M${cx} ${GY} C ${cx} ${GY - h * 0.5} ${cx + 2} ${GY - h * 0.8} ${cx} ${GY - h}" stroke="${leafB}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${cx} ${GY - h} C ${cx - 14} ${GY - h - 12} ${cx - 24} ${GY - h - 2} ${cx - 22} ${GY - h + 4} C ${cx - 14} ${GY - h + 6} ${cx - 4} ${GY - h + 2} ${cx} ${GY - h}Z" fill="${leafA}"/><path d="M${cx} ${GY - h} C ${cx + 14} ${GY - h - 12} ${cx + 24} ${GY - h - 2} ${cx + 22} ${GY - h + 4} C ${cx + 14} ${GY - h + 6} ${cx + 4} ${GY - h + 2} ${cx} ${GY - h}Z" fill="${leafC}"/></g>`;
  } else {
    const depthMax = v < 8 ? 2 : v < 16 ? 3 : v < 28 ? 4 : v < 45 ? 5 : v < 65 ? 6 : v < 85 ? 7 : 8;
    const trunkLen = 15 + 31 * Math.pow(p, 0.6), trunkW = 2.6 + 10 * Math.pow(p, 0.8);
    const paths = [], ends = [];
    const leafR = 4.2 + 6 * Math.pow(p, 0.55);
    const grow = (x, y, ang, len, w, d) => {
      const x2 = x + Math.sin(ang) * len, y2 = y - Math.cos(ang) * len;
      const mx = x + Math.sin(ang + (R() - 0.5) * 0.3) * len * 0.5, my = y - Math.cos(ang) * len * 0.5;
      paths.push(`<path d="M${r1(x)} ${r1(y)} Q${r1(mx)} ${r1(my)} ${r1(x2)} ${r1(y2)}" stroke-width="${r1(Math.max(0.9, w))}"/>`);
      if (d >= 1) ends.push([x2, y2, leafR * (d >= depthMax ? 1 : 0.7)]);
      if (d >= depthMax) return;
      const kids = d === 0 ? (v >= 40 ? 3 : 2) : (d < 5 && v >= 60 && R() < 0.3 ? 3 : 2);
      const spread = 0.34 + 0.12 * R();
      for (let i = 0; i < kids; i++) grow(x2, y2, ang + (i - (kids - 1) / 2) * spread * 1.5 + (R() - 0.5) * 0.14, len * (0.68 + R() * 0.07), w * 0.66, d + 1);
    };
    grow(cx, GY, (R() - 0.5) * 0.08, trunkLen, trunkW, 0);
    if (v >= 25) for (const s of [-1, 1]) paths.push(`<path d="M${cx} ${GY - 2} q${s * 8} 2 ${s * (14 + 10 * p)} 6" stroke-width="${r1(trunkW * 0.5)}"/>`);
    o += `<g class="vt-sway"><ellipse cx="${cx}" cy="${GY + 3}" rx="${r1(22 + 30 * p)}" ry="5.5" fill="rgba(30,60,40,.18)"/><g stroke="${bark}" fill="none" stroke-linecap="round">${paths.join('')}</g><g class="vt-leaves">`;
    const gold = v >= 100;
    ends.forEach(([x, y, r], i) => {
      const col = gold && R() < 0.3 ? '#F6D36B' : [leafA, leafB, leafC][i % 3];
      o += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${col}" opacity=".94"/>`;
      if (R() < 0.45) o += `<circle cx="${r1(x + (R() - 0.5) * r * 1.2)}" cy="${r1(y + (R() - 0.7) * r)}" r="${r1(r * 0.7)}" fill="${[leafC, leafA][i % 2]}" opacity=".9"/>`;
    });
    o += '</g>';
    if (!wet) o += '<g class="vt-thirst"><path d="M0 0C-5 8-7 12-3 15 1 17 5 15 6 11 7 7 3 3 0 0Z" fill="none" stroke="#5FB5DE" stroke-width="2" transform="translate(180 ' + (GY - trunkLen - 40) + ')"/></g>';
    if (wet && v >= 38) {
      const nF = Math.min(40, Math.floor((v - 36) / 2)); const fc = ['#F9B9CB', '#FFFFFF', '#FFD9E4', '#FFE9A8'];
      for (let i = 0; i < nF && ends.length; i++) { const [x, y, r] = ends[Math.floor(R() * ends.length)]; const c = fc[i % fc.length]; o += `<g transform="translate(${r1(x + (R() - 0.5) * r)} ${r1(y + (R() - 0.5) * r)})" class="v-flower">${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="1.8" ry="3" cy="-3" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="1.3" fill="#F6C94F"/></g>`; }
    }
    if (wet && v >= 55) {
      const nF = Math.min(34, Math.floor((v - 52) * 0.8)); const gc = v >= 95;
      for (let i = 0; i < nF && ends.length; i++) { const [x, y, r] = ends[Math.floor(R() * ends.length)]; const c = gc ? '#FFD34E' : ['#E5645A', '#F08A4B', '#E5645A'][i % 3]; o += `<circle cx="${r1(x + (R() - 0.5) * r)}" cy="${r1(y + r * 0.5)}" r="${gc ? 3.2 : 2.7}" fill="${c}" class="${gc ? 'v-fruit-gold' : ''}" style="--d:${r1(R() * 3)}s"/>`; }
    }
    if (v >= 100) o += `<circle cx="${cx}" cy="${r1(GY - trunkLen * 2.1)}" r="${r1(trunkLen * 1.9)}" fill="url(#gl-${id})" class="v-pulse"/>`;
    o += '</g>';
  }
  // visitantes
  if (v >= 45) { const n = Math.min(6, 1 + Math.floor((v - 45) / 10)); for (let i = 0; i < n; i++) { const c = ['#F4A9BE', '#FFD86B', '#8FD3F4', '#B8A2F0', '#FF9E80', '#F4A9BE'][i]; o += `<g class="v-bfly" style="--d:${r1(i * 1.7)}s;--x:${r1(40 + R() * 280)}px;--y:${r1(110 + R() * 90)}px"><path d="M0 0 C-5 -6 -9 -2 -6 2 C-4 4 -1 3 0 0 C1 3 4 4 6 2 C9 -2 5 -6 0 0Z" fill="${c}"/></g>`; } }
  if (v >= 60) { const n = Math.min(4, 1 + Math.floor((v - 60) / 14)); for (let i = 0; i < n; i++) o += `<g class="v-bird" style="--d:${r1(i * 2.3)}s;--y:${r1(30 + R() * 60)}px"><path d="M0 0 q4 -5 8 0 q4 -5 8 0" stroke="#4A5A55" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`; }
  if (v >= 70) { const n = Math.min(16, 4 + Math.floor((v - 70) / 2.5)); for (let i = 0; i < n; i++) o += `<circle class="v-fly" cx="${r1(20 + R() * 320)}" cy="${r1(150 + R() * 100)}" r="1.8" fill="#FFF3A0" style="--d:${r1(R() * 4)}s"/>`; }
  if (v >= 75) { const n = Math.min(14, 4 + Math.floor((v - 75) / 2.5)); for (let i = 0; i < n; i++) o += `<ellipse class="v-petal" cx="${r1(R() * W)}" cy="-10" rx="2.4" ry="1.4" fill="${['#F9B9CB', '#FFFFFF', '#FFD9E4'][i % 3]}" style="--d:${r1(R() * 8)}s;--dur:${r1(7 + R() * 5)}s;--dx:${r1((R() - 0.5) * 70)}px"/>`; }
  // riego
  if (pour) {
    o += `<g class="v-rain"><g class="v-raincloud" fill="#9DB5C4"><ellipse cx="180" cy="36" rx="46" ry="14"/><ellipse cx="204" cy="28" rx="26" ry="14"/><ellipse cx="156" cy="30" rx="22" ry="11"/></g>`;
    for (let i = 0; i < 22; i++) o += `<path class="v-drop" d="M${r1(130 + R() * 100)} 48 v7" stroke="#5FB5DE" stroke-width="2" stroke-linecap="round" style="--d:${r1(R() * 1.2)}s;--h:${r1(150 + R() * 70)}px"/>`;
    o += '</g>';
  }
  o += '</svg>';
  return o;
}

/* Arbolito para las listas */
function treeIcon(level, max = 100) {
  const v = max === 100 ? level : Math.round(100 * Math.sqrt(level / max));
  const s = v === 0 ? 0 : v < 10 ? 1 : v < 30 ? 2 : v < 60 ? 3 : v < 90 ? 4 : 5;
  const c1 = ['#8A6A4E', '#7CC07A', '#5DAE74', '#3E9563', '#2F8A5B', '#E8B84A'][s];
  const crown = [0, 6, 10, 13, 15, 16][s];
  return `<svg viewBox="0 0 40 40" class="tree-ico" aria-hidden="true"><ellipse cx="20" cy="35" rx="13" ry="3" fill="rgba(30,60,40,.15)"/>${s === 0
    ? '<ellipse cx="20" cy="32" rx="6" ry="3.5" fill="#8A6A4E"/><circle cx="20" cy="31" r="1.8" fill="#5E432E"/>'
    : `<rect x="18.4" y="${34 - 6 - s * 2}" width="3.2" height="${6 + s * 2}" rx="1.4" fill="#8A6A4E"/><circle cx="20" cy="${26 - s * 2}" r="${crown}" fill="${c1}"/><circle cx="${14 - s * 0.4}" cy="${28 - s * 1.6}" r="${crown * 0.62}" fill="#7CC07A" opacity=".9"/><circle cx="${26 + s * 0.4}" cy="${28 - s * 1.6}" r="${crown * 0.58}" fill="#9AD27C" opacity=".9"/>${s >= 3 ? '<circle cx="16" cy="19" r="1.6" fill="#F9B9CB"/><circle cx="25" cy="17" r="1.6" fill="#F9B9CB"/>' : ''}${s >= 4 ? '<circle cx="22" cy="24" r="1.6" fill="#E5645A"/>' : ''}${s === 5 ? '<circle cx="20" cy="14" r="2" fill="#FFD34E"/>' : ''}`}</svg>`;
}

/* =========================================================
   3. Cuentas: crear usuario, entrar, contraseña
   ========================================================= */
const ACCOUNT_COLORS = ['#2F8A5B', '#3E9A93', '#5B7FD1', '#B07AC8', '#D27C5E', '#C9A55C', '#4F9A63', '#7A8CA8'];
const userSlug = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

function authDialog(opts) {
  return new Promise((resolve) => {
    let mode = opts.mode; let done = false; let color = opts.color || ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)];
    let userTouched = false; const keep = { name: opts.name || '', user: opts.id || '' };
    const d = $('#ask');
    const paint = (msg = '') => {
      const reg = mode === 'register', claim = mode === 'claim', login = mode === 'login', chg = mode === 'setpw';
      const title = reg ? 'Crear mi usuario' : claim ? `Ponle contraseña a ${esc(opts.name)}` : login ? 'Entrar a mi usuario' : 'Cambiar contraseña';
      const sub = reg ? 'Elige un nombre, un usuario y una contraseña. Solo tú podrás entrar a tu sección.'
        : claim ? 'Así tus tareas se guardan en la nube y nadie más puede entrar. Si ya tenías este usuario creado, escribe tu contraseña de antes.'
        : login ? 'Escribe tu usuario y tu contraseña para traer tus cosas a este dispositivo.' : 'Escribe la contraseña nueva. Mínimo 4 caracteres.';
      d.innerHTML = `<form class="auth" novalidate autocomplete="on">
        <h3 class="serif">${title}</h3><p>${sub}</p>
        ${reg ? `<div class="field"><label for="auName">Tu nombre</label><input class="input" id="auName" autocomplete="name" placeholder="Ej. Mel" maxlength="24" value="${esc(keep.name)}"></div>` : ''}
        ${reg || (login && !opts.id) ? `<div class="field"><label for="auUser">Tu usuario <span class="faint">(sin espacios)</span></label><input class="input" id="auUser" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="20" placeholder="Ej. mel" value="${esc(keep.user)}"></div>` : ''}
        ${login && opts.id ? `<p class="auth-who">${avatar({ name: opts.name || opts.id, color: opts.color || '#2F8A5B', initials: initials2(opts.name || opts.id) }, 'sm')}<b>${esc(opts.name || opts.id)}</b><span class="faint">@${esc(opts.id)}</span></p>` : ''}
        ${claim ? `<p class="auth-who">${avatar({ name: opts.name, color: opts.color || '#2F8A5B', initials: initials2(opts.name) }, 'sm')}<b>${esc(opts.name)}</b><span class="faint">@${esc(opts.id)}</span></p>` : ''}
        <div class="field"><label for="auPw">${chg ? 'Contraseña nueva' : 'Contraseña'}</label><div class="pw-row"><input class="input" id="auPw" type="password" autocomplete="${login ? 'current-password' : 'new-password'}" placeholder="Mínimo 4 caracteres"><button type="button" class="pw-eye" data-a="eye" aria-label="Mostrar u ocultar contraseña">Ver</button></div></div>
        ${reg || claim || chg ? `<div class="field"><label for="auPw2">Repite la contraseña</label><input class="input" id="auPw2" type="password" autocomplete="new-password" placeholder="Otra vez, igualita"></div>` : ''}
        ${reg ? `<div class="field"><span class="lbl">Tu color</span><div class="swatches">${ACCOUNT_COLORS.map((c) => `<button type="button" data-a="color" data-c="${c}" class="${c === color ? 'on' : ''}" style="--c:${c}" aria-label="Color ${c}"></button>`).join('')}</div></div>` : ''}
        <p class="auth-err" role="alert">${esc(msg)}</p>
        <div class="btn-row" style="flex-direction:row-reverse;justify-content:flex-start"><button class="btn primary" data-a="go" type="submit">${reg ? 'Crear mi usuario' : claim ? 'Guardar' : login ? 'Entrar' : 'Cambiar'}</button><button class="btn" type="button" data-a="cancel">Cancelar</button></div>
        ${login && !opts.id ? '<p style="text-align:center;margin:12px 0 0"><button class="link-btn" type="button" data-a="to-reg">Todavía no tengo usuario: crear uno</button></p>' : ''}
        ${reg ? '<p style="text-align:center;margin:12px 0 0"><button class="link-btn" type="button" data-a="to-login">Ya tengo usuario: entrar</button></p>' : ''}
      </form>`;
      const f = d.querySelector('form');
      const err = (m) => { d.querySelector('.auth-err').textContent = m; };
      const val = (id) => (d.querySelector('#' + id)?.value || '');
      const nm = d.querySelector('#auName'), us = d.querySelector('#auUser');
      if (nm && us) {
        nm.addEventListener('input', () => { keep.name = nm.value; if (!userTouched) { us.value = userSlug(nm.value); keep.user = us.value; } });
        us.addEventListener('input', () => { userTouched = true; us.value = userSlug(us.value); keep.user = us.value; });
      }
      f.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]'); if (!b) return;
        const a = b.dataset.a;
        if (a === 'eye') { const t = d.querySelector('#auPw').type === 'password' ? 'text' : 'password'; d.querySelector('#auPw').type = t; const p2 = d.querySelector('#auPw2'); if (p2) p2.type = t; }
        else if (a === 'color') { color = b.dataset.c; d.querySelectorAll('.swatches button').forEach((x) => x.classList.toggle('on', x === b)); }
        else if (a === 'cancel') { d.close(); }
        else if (a === 'to-reg') { mode = 'register'; paint(); }
        else if (a === 'to-login') { mode = 'login'; paint(); }
      });
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const go = d.querySelector('[data-a="go"]'); if (go.disabled) return;
        const pw = val('auPw'), pw2 = val('auPw2');
        try {
          if (reg) {
            const name = val('auName').trim(), user = userSlug(val('auUser'));
            if (!name) return err('Escribe tu nombre.');
            if (user.length < 3) return err('Tu usuario necesita al menos 3 letras o números.');
            if (pw.length < 4) return err('La contraseña necesita al menos 4 caracteres.');
            if (pw !== pw2) return err('Las contraseñas no son iguales.');
            go.disabled = true; err('Creando tu usuario…');
            finish(await cloudFetch('POST', { kind: 'register', user, name, password: pw, color }));
          } else if (claim) {
            if (pw.length < 4) return err('La contraseña necesita al menos 4 caracteres.');
            if (pw !== pw2) return err('Las contraseñas no son iguales.');
            go.disabled = true; err('Guardando…');
            try { finish(await cloudFetch('POST', { kind: 'register', user: opts.id, name: opts.name, password: pw, color: opts.color })); }
            catch (x) { if (x.status !== 409) throw x; finish(await cloudFetch('POST', { kind: 'login', user: opts.id, password: pw })); }
          } else if (login) {
            const user = opts.id || userSlug(val('auUser'));
            if (!user) return err('Escribe tu usuario.');
            if (!pw) return err('Escribe tu contraseña.');
            go.disabled = true; err('Entrando…');
            finish(await cloudFetch('POST', { kind: 'login', user, password: pw }));
          } else {
            if (pw.length < 4) return err('La contraseña necesita al menos 4 caracteres.');
            if (pw !== pw2) return err('Las contraseñas no son iguales.');
            go.disabled = true; err('Guardando…');
            finish(await cloudFetch('POST', { kind: 'setpw', user: opts.id, password: pw }));
          }
        } catch (x) {
          go.disabled = false;
          err(/fetch|network|Failed|Load failed/i.test(x.message) ? 'No hay conexión con la nube. Revisa tu internet e intenta otra vez.' : x.message);
        }
      });
      setTimeout(() => (d.querySelector('#auName') || d.querySelector('#auUser') || d.querySelector('#auPw'))?.focus(), 60);
    };
    const finish = (r) => { done = true; d.close(); resolve(r); };
    d.addEventListener('close', () => { if (!done) resolve(null); }, { once: true });
    paint();
    d.showModal();
  });
}

function acceptSession(r, fallback = {}) {
  const u = r.user || fallback; if (!u.id) return null;
  tokens()[u.id] = r.token;
  const i = (REG.users ||= []).findIndex((x) => x.id === u.id);
  const rec = { id: u.id, name: u.name || fallback.name || cap(u.id), color: u.color || fallback.color || '#2F8A5B' };
  if (i >= 0) REG.users[i] = rec; else REG.users.push(rec);
  if (!REG.me) REG.me = u.id;
  saveReg(); setDirty(u.id, true);
  return u.id;
}
async function sessionFor(id) {
  const p = profile(id);
  const r = await authDialog({ mode: p?.legacy ? 'claim' : 'login', id, name: p?.name, color: p?.color });
  if (!r) return false;
  acceptSession(r, { id, name: p?.name, color: p?.color }); Snd.drop();
  return true;
}
async function enterProfile(id) {
  if (isForestId(id)) {
    if (!REG.me || !tokens()[REG.me]) { toast('Primero entra con tu usuario.'); return; }
    switchProfile(id); return;
  }
  if (!tokens()[id] || (REG.me && id !== REG.me)) { if (!(await sessionFor(id))) return; }
  if (!REG.me) { REG.me = id; saveReg(); }
  switchProfile(id);
}
async function createUser() {
  const r = await authDialog({ mode: 'register' });
  if (!r) return;
  const id = acceptSession(r); if (!id) return;
  if (!localStorage.getItem(keyFor(id))) { try { const d = defaults(); d.settings.name = r.user.name; localStorage.setItem(keyFor(id), JSON.stringify(d)); } catch { /* */ } }
  Snd.chime(); switchProfile(id);
}
async function loginUser() {
  const r = await authDialog({ mode: 'login' });
  if (!r) return;
  const id = acceptSession(r); if (!id) return;
  Snd.chime(); switchProfile(id);
}
async function setPassword(id) {
  const r = await authDialog({ mode: 'setpw', id });
  if (!r) return false;
  tokens()[id] = r.token; saveReg(); toast('Contraseña cambiada.'); Snd.chime(); return true;
}
function logoutHere() {
  const id = dataOwner() || REG.me; if (id) delete tokens()[id];
  choosing = true; saveReg(); render();
}

function accountCardHTML() {
  const p = profile(REG.current); if (!p || isForestId(p.id)) return '';
  const on = !!tokens()[p.id];
  return `<h2 class="sec">Mi cuenta</h2><div class="card">
    <div class="toggle" style="padding-top:0"><span style="display:flex;gap:12px;align-items:center">${avatar(p, 'sm')}<span><span class="t">${esc(p.name)}</span><span class="d" style="display:block">@${esc(p.id)} · ${on ? 'sesión abierta' : 'sin sesión'}</span></span></span></div>
    <p class="small muted" id="cloudState" style="margin:4px 0 12px">${cloudStateText()}</p>
    <div class="btn-row"><button class="btn" data-act="acct-pw">${icon('lock')}Cambiar contraseña</button><button class="btn" data-act="cloud-now">${icon('reset')}Sincronizar ahora</button><button class="btn quiet" data-act="acct-out">Cerrar sesión aquí</button></div>
    <p class="small muted" style="margin:12px 0 0">Tu contraseña se guarda protegida en la nube. Si la olvidas, no se puede recuperar: anótala en un lugar seguro.</p></div>`;
}

/* ¿Quién eres? */
function viewQuien() {
  const users = PERSONAL_LIST().filter(Boolean);
  const forests = REG.me && tokens()[REG.me] ? Object.values(FOR.f).filter((f) => f.meta.members.includes(REG.me)) : [];
  const inv = REG.me && tokens()[REG.me] ? FOR.invites.length : 0;
  return `<div class="who">
    <h1 class="page-title" style="font-size:clamp(36px,10vw,48px)">¿Quién eres?</h1>
    <p class="page-sub">Cada quien tiene su propio usuario y su contraseña. Nadie más puede entrar a tu sección.</p>
    ${users.map((p) => {
      const n = pendingCountFor(p.id); const on = !!tokens()[p.id]; const lvl = FOR.trees[p.id]?.level;
      return `<button type="button" class="who-btn" data-act="profile-pick" data-id="${p.id}">${avatar(p, 'lg')}
        <span style="flex:1"><b>${esc(p.name)}</b><span class="d">${p.legacy && !on ? 'Toca para ponerle contraseña' : on && p.id === REG.me ? (n ? plural(n, 'entrega pendiente', 'entregas pendientes') : 'Sin pendientes') : on ? 'Toca para entrar' : 'Con contraseña'}${lvl !== undefined ? ` · árbol nivel ${lvl}` : ''}</span></span>
        ${on && p.id === REG.me ? '' : `<span class="lock">${icon('lock')}</span>`}</button>`;
    }).join('')}
    ${forests.length ? `<h2 class="sec">Mis Bosques ${inv ? `<small class="chip pen">${plural(inv, 'invitación', 'invitaciones')}</small>` : ''}</h2>${forests.map((f) => forestCardHTML(f, 'profile-pick')).join('')}` : ''}
    <div class="who-actions"><button type="button" class="btn primary block" data-act="user-new">${icon('plus')}Crear mi usuario</button>
    <button type="button" class="btn block" data-act="user-login">Ya tengo usuario: entrar</button></div>
    <p style="text-align:center;margin-top:18px"><span class="small muted">${icon('spark', 'sm')} Tus cosas se guardan solas en la nube</span></p>
  </div>`;
}
function forestCardHTML(f, act) {
  const m = f.meta; const life = forestLife(m.id); const lv = levelOf(life, FOREST_T, 1000);
  return `<button type="button" class="who-btn forest-btn" data-act="${act}" data-id="f:${m.id}"><span class="avatar lg" style="--pc:${m.color || '#2F8A5B'}">${esc(m.emoji || '🌳')}</span>
    <span style="flex:1"><b>${esc(m.name)}</b><span class="d">${plural(m.members.length, 'integrante', 'integrantes')} · nivel ${lv} de 1000</span></span>${icon('chev', 'chev')}</button>`;
}
function openProfileSheet() {
  const users = PERSONAL_LIST().filter(Boolean);
  const forests = REG.me && tokens()[REG.me] ? Object.values(FOR.f).filter((f) => f.meta.members.includes(REG.me)) : [];
  openSheet(`${sheetHead('Usuarios y Bosques')}
    <div class="sheet-body">
      ${users.map((p) => { const isMe = p.id === REG.current; return `<button type="button" class="who-btn ${isMe ? 'me' : ''}" data-act="profile-to" data-id="${p.id}" ${isMe ? 'aria-current="true"' : ''}>${avatar(p)}
        <span style="flex:1"><b>${esc(p.name)}</b><span class="d">@${esc(p.id)}</span></span>${isMe ? '<span class="chip pen">Activo</span>' : '<span class="chip">Cambiar</span>'}</button>`; }).join('')}
      ${forests.length ? `<h2 class="sec" style="margin-top:20px">Mis Bosques</h2>${forests.map((f) => forestCardHTML(f, 'profile-to')).join('')}` : ''}
      <div class="btn-row" style="margin-top:16px"><button class="btn" data-act="sheet-close-new">${icon('plus')}Agregar otro usuario</button></div>
      <div class="toggle" style="margin-top:12px"><span><span class="t">Preguntar quién eres al abrir</span><span class="d" style="display:block">Útil si comparten el mismo celular.</span></span>
        <label class="switch"><input type="checkbox" data-reg="ask" ${REG.ask ? 'checked' : ''} aria-label="Preguntar quién eres al abrir"><span></span></label></div>
    </div>`);
}

/* =========================================================
   4. Bosques (grupos colaborativos)
   ========================================================= */
const FOREST_EMOJI = ['🌳', '🌲', '🌴', '🌿', '🍀', '🌸', '🌻', '🍃'];
let forestSig = '';
function applyForests(remote) {
  const f = {};
  for (const [fid, v] of Object.entries(remote.forests || {})) {
    const items = (v.items || []).slice();
    for (const o of REG.gout || []) if (o && o.fid === fid && !items.some((x) => x.id === o.item.id)) items.push(o.item);
    f[fid] = { meta: v.meta, items };
  }
  FOR.f = f;
  FOR.members = { ...FOR.members, ...(remote.members || {}) };
  FOR.trees = { ...FOR.trees, ...(remote.trees || {}) };
  const prevInv = new Set(FOR.invites.map((i) => i.forest));
  FOR.invites = remote.invites || [];
  saveFOR();
  for (const i of FOR.invites) if (!prevInv.has(i.forest) && !(REG.invSeen ||= {})[i.forest] && !choosing) { REG.invSeen[i.forest] = 1; saveReg(); toast(`${i.fromName} te invitó al Bosque ${i.forestName}. Míralo en Vida.`, { ms: 6000 }); Snd.chime(); }
  const sig = Object.values(f).map((x) => x.meta.id + x.meta.name + x.meta.members.join() + x.items.map((i) => i.u || i.at).join()).join('|') + '#' + FOR.invites.map((i) => i.forest).join();
  const changed = sig !== forestSig; forestSig = sig;
  if (isForestId(REG.current) && !f[REG.current.slice(2)] && Object.keys(f).length >= 0 && !choosing && Object.keys(tokens()).length) { REG.current = REG.me; saveReg(); choosing = true; toast('Ya no eres parte de ese Bosque.'); }
  return changed;
}
function forestLife(fid) {
  const f = FOR.f[fid]?.meta; if (!f) return 0;
  return f.members.reduce((a, m) => a + ((m === REG.me && profile(m) && tokens()[m]) ? treeNow(m).life : (FOR.trees[m]?.life || 0)), 0);
}
function inviteBannerHTML() {
  if (!FOR.invites.length || !REG.me || !tokens()[REG.me] || isForestId(REG.current)) return '';
  const i = FOR.invites[0];
  return `<a class="banner" href="#/vida" data-act="vtab-go" data-v="bosques" style="text-decoration:none">${icon('users')}<p><b>${esc(i.fromName)}</b> te invitó al Bosque <b>${esc(i.forestName)}</b>${FOR.invites.length > 1 ? ` (y ${FOR.invites.length - 1} más)` : ''}.</p><span class="chip pen">Ver</span></a>`;
}

/* =========================================================
   5. Pantalla de VIDA
   ========================================================= */
const VUI = { tab: 'arbol', rank: 'personas', pour: 0 };
let RANK = { at: 0, data: null, busy: false, err: '' };
async function fetchRank(force) {
  if (RANK.busy || (!force && RANK.data && Date.now() - RANK.at < 30000)) return;
  RANK.busy = true; RANK.err = '';
  try { RANK.data = await cloudFetch('GET', null, 'kind=rank'); RANK.at = Date.now(); }
  catch (e) { RANK.err = /fetch|network|Failed|Load failed/i.test(e.message) ? 'Sin conexión con la nube' : e.message; }
  RANK.busy = false;
  if (route().name === 'vida' && !choosing) render();
}
function sceneBlock({ level, max, wet, id, seed, title, sub, pts, cur, need, extra = '' }) {
  const pour = Date.now() < VUI.pour;
  const pct = need > cur ? Math.max(0, Math.min(100, Math.round(((pts - cur) / (need - cur)) * 100))) : 100;
  const top = level >= max;
  return `<section class="vida-card ${wet ? '' : 'thirsty'}">
    <div class="vscene">${treeScene({ level, max, wet, id, seed, pour })}
      <div class="v-badge"><span class="v-lv">${level}</span><span class="v-of">${max === 100 ? 'de 100' : 'de 1000'}</span></div>
      <div class="v-water ${wet ? 'ok' : 'low'}">${wet ? '💧 Regado hoy' : '🥀 Tiene sed'}</div></div>
    <div class="v-info"><h2 class="serif">${title}</h2><p class="muted" style="margin:0 0 10px">${sub}</p>
      <div class="v-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${top ? 100 : pct}%"></i></div>
      <p class="tiny faint" style="margin:6px 0 0">${top ? 'Nivel máximo alcanzado' : `${Math.max(0, pts - cur)} de ${need - cur} puntos para el nivel ${level + 1}`}</p>${extra}</div></section>`;
}
function viewVida() { return isGroup() ? viewVidaBosque() : viewVidaPersonal(); }

function viewVidaPersonal() {
  const id = REG.current; const p = profile(id); const c = treeNow(id);
  if (VUI.tab === 'ranking') fetchRank();
  const tabs = `<div class="seg full" role="group" style="margin:16px 0">${[['arbol', 'Mi árbol'], ['ranking', 'Ranking'], ['bosques', FOR.invites.length ? `Bosques · ${FOR.invites.length}` : 'Bosques']].map(([k, l]) => `<button type="button" data-act="vtab" data-v="${k}" aria-pressed="${VUI.tab === k}">${l}</button>`).join('')}</div>`;
  const warn = c.wet ? '' : `<p class="v-warn">${icon('bell', 'sm')}<span>Tu árbol tiene sed. Si hoy no subes una tarea o escribes un apunte, mañana perderá unos ${c.loss} puntos.</span></p>`;
  const head = `<h1 class="page-title">Vida</h1><p class="page-sub">Cumple a tiempo, riega a diario y mira crecer tu paraíso.</p>`;
  const card = sceneBlock({ level: c.level, max: 100, wet: c.wet, id: 'main', seed: id, title: `${esc(p.name)} · ${esc(stageName(c.level))}`, sub: c.wet ? 'Tu árbol está feliz y bien regado.' : 'Súbele una tarea o un apunte para regarlo.', pts: c.pts, cur: c.cur, need: c.need,
    extra: `<div class="v-stats"><span>${icon('spark', 'sm')}<b>${c.streak}</b> ${c.streak === 1 ? 'día' : 'días'} de racha</span><span>${icon('leaf', 'sm')}<b>${c.pts}</b> puntos</span></div>` });
  const acts = `<div class="btn-row" style="margin:12px 0 0"><button class="btn primary" data-act="new-task">${icon('plus')}Subir una tarea</button><button class="btn" data-act="new-note">${icon('note')}Escribir un apunte</button><a class="btn" href="#/mente">${icon('leaf')}Un pensamiento</a></div>`;
  let body = '';
  if (VUI.tab === 'arbol') {
    const next = MILESTONES.find((m) => m[0] > c.level);
    body = `${next ? `<div class="card next-ms"><span class="tiny faint">Lo próximo en tu paraíso · nivel ${next[0]}</span><b class="serif">${esc(next[1])}</b><span class="muted">${esc(next[2])}</span></div>` : '<div class="card next-ms"><b class="serif">Tu paraíso está completo ✨</b><span class="muted">Mantenlo regado para conservar el nivel 100.</span></div>'}
      <h2 class="sec">Cómo crece <small>reglas simples</small></h2>
      <ul class="rows v-rules">
        <li><div class="rowline"><span class="ico">${icon('check')}</span><span class="txt"><b>Entrega a tiempo</b><span>+10 puntos por cada tarea entregada antes de su fecha (+3 si es tarde).</span></span></div></li>
        <li><div class="rowline"><span class="ico">💧</span><span class="txt"><b>Riega cada día</b><span>Sube una tarea, escribe un apunte o un pensamiento. Con eso tu árbol queda regado hoy.</span></span></div></li>
        <li><div class="rowline"><span class="ico">🥀</span><span class="txt"><b>Sin riego, baja</b><span>Cada día sin regar pierde puntos y puede bajar de nivel.</span></span></div></li>
        <li><div class="rowline"><span class="ico">${icon('spark')}</span><span class="txt"><b>Racha</b><span>Entre más días seguidos riegues, más puntos ganas por tus entregas.</span></span></div></li></ul>
      <h2 class="sec">Tu camino al nivel 100</h2>
      <ol class="milestones">${MILESTONES.map((m) => `<li class="${c.level >= m[0] ? 'done' : ''}"><span class="ms-dot">${c.level >= m[0] ? icon('check', 'sm') : m[0]}</span><span><b>${esc(m[1])}</b><span class="small muted"> · nivel ${m[0]}</span><span class="small muted" style="display:block">${esc(m[2])}</span></span></li>`).join('')}</ol>`;
  } else if (VUI.tab === 'ranking') body = rankingHTML();
  else body = bosquesTabHTML();
  return `${head}${card}${warn}${acts}${tabs}${body}`;
}

function rankingHTML() {
  const seg = `<div class="seg full" role="group" style="margin-bottom:14px">${[['personas', 'Personas'], ['bosques', 'Bosques']].map(([k, l]) => `<button type="button" data-act="vrank" data-v="${k}" aria-pressed="${VUI.rank === k}">${l}</button>`).join('')}</div>`;
  const R = RANK.data;
  const note = VUI.rank === 'personas' ? 'Árboles de personas, del 0 al 100.' : 'Los Bosques compiten solo con otros Bosques, hasta el nivel 1000.';
  if (!R) return `${seg}<p class="small muted">${note}</p>${RANK.err ? `<div class="banner warn">${icon('bell')}<p>${esc(RANK.err)}</p><button class="btn" data-act="rank-refresh">Reintentar</button></div>` : '<p class="muted" style="text-align:center;padding:24px 0">Buscando a los mejores árboles…</p>'}`;
  const medal = (i) => (i < 3 ? ['🥇', '🥈', '🥉'][i] : `<span class="rk-n">${i + 1}</span>`);
  let list;
  if (VUI.rank === 'personas') {
    list = R.people.map((u, i) => `<li class="rk ${u.id === REG.me ? 'me' : ''}"><span class="rk-pos">${medal(i)}</span>${treeIcon(u.level)}<span class="rk-name"><b>${esc(u.name)}${u.id === REG.me ? ' (tú)' : ''}</b><span class="tiny faint">${esc(stageName(u.level))}${u.streak ? ` · 🔥 ${u.streak}` : ''}</span></span><span class="rk-lv">Nivel <b>${u.level}</b></span></li>`).join('');
  } else {
    list = R.forests.map((f, i) => `<li class="rk ${FOR.f[f.id]?.meta.members.includes(REG.me) ? 'me' : ''}"><span class="rk-pos">${medal(i)}</span><span class="rk-emoji" style="--pc:${f.color || '#2F8A5B'}">${esc(f.emoji || '🌳')}</span><span class="rk-name"><b>${esc(f.name)}</b><span class="tiny faint">${plural(f.members, 'integrante', 'integrantes')}</span></span><span class="rk-lv">Nivel <b>${f.level}</b></span></li>`).join('');
  }
  const mine = VUI.rank === 'personas' ? R.people.findIndex((u) => u.id === REG.me) : -1;
  return `${seg}<p class="small muted" style="margin:0 0 10px">${note}${mine >= 0 ? ` Vas en el lugar <b>${mine + 1}</b>.` : ''}</p>
    ${list ? `<ol class="ranking">${list}</ol>` : '<div class="empty"><h3>Aún no hay nadie aquí</h3><p>Sé la primera persona en regar su árbol.</p></div>'}
    <p style="margin-top:12px"><button class="btn quiet" data-act="rank-refresh">${icon('reset', 'sm')}Actualizar</button></p>`;
}

function bosquesTabHTML() {
  const mine = Object.values(FOR.f).filter((f) => f.meta.members.includes(REG.me));
  return `${FOR.invites.length ? `<h2 class="sec" style="margin-top:6px">Invitaciones</h2>${FOR.invites.map((i) => `<div class="card inv"><span class="avatar" style="--pc:#2F8A5B">${esc(i.emoji || '🌳')}</span><span class="inv-t"><b>${esc(i.forestName)}</b><span class="small muted">${esc(i.fromName)} te invita a su Bosque</span></span>
        <span class="inv-b"><button class="btn primary" data-act="invite-yes" data-id="${i.forest}">Unirme</button><button class="btn quiet" data-act="invite-no" data-id="${i.forest}">No</button></span></div>`).join('')}` : ''}
    <h2 class="sec">Mis Bosques</h2>
    ${mine.length ? mine.map((f) => forestCardHTML(f, 'profile-pick')).join('') : '<div class="empty"><h3>Todavía no estás en un Bosque</h3><p>Un Bosque es un grupo colaborativo: comparten pendientes, trabajos en equipo e ideas, y su árbol crece con el esfuerzo de todos.</p></div>'}
    <p style="margin-top:14px"><button class="btn primary" data-act="forest-new">${icon('plus')}Crear un Bosque</button></p>`;
}

function viewVidaBosque() {
  const m = forestMeta(); if (!m) return '<div class="empty"><h3>Este Bosque ya no está</h3></div>';
  if (VUI.tab === 'ranking') fetchRank();
  const life = forestLife(m.id); const lv = levelOf(life, FOREST_T, 1000);
  const wetToday = gItems().some((x) => !x.deleted && toISO(new Date(x.u || x.at)) === today()) || Object.keys(tokens()).some((u) => FOR.f[m.id].meta.members.includes(u) && treeNow(u).wet);
  const tabs = `<div class="seg full" role="group" style="margin:16px 0">${[['arbol', 'Nuestro árbol'], ['ranking', 'Ranking']].map(([k, l]) => `<button type="button" data-act="vtab" data-v="${k}" aria-pressed="${VUI.tab === k}">${l}</button>`).join('')}</div>`;
  const card = sceneBlock({ level: lv, max: 1000, wet: wetToday, id: 'bosque', seed: m.id, title: `${esc(m.emoji || '🌳')} ${esc(m.name)}`, sub: `${esc(stageName(Math.round(100 * Math.sqrt(lv / 1000))))} · ${plural(m.members.length, 'integrante', 'integrantes')}`, pts: life, cur: FOREST_T(lv), need: lv >= 1000 ? FOREST_T(1000) : FOREST_T(lv + 1) });
  let body = '';
  if (VUI.tab === 'ranking') body = rankingHTML();
  else {
    const rows = m.members.map((u) => { const name = FOR.members[u]?.name || cap(u); const t = u === REG.me ? treeNow(u) : FOR.trees[u] || { level: 0, life: 0 }; return { u, name, level: t.level || 0, life: t.life || 0 }; }).sort((a, b) => b.life - a.life);
    body = `<p class="small muted" style="margin:0 0 10px">El árbol del Bosque crece con todo lo que cumplen sus integrantes. Mientras más colaboran, más alto sube.</p>
      <h2 class="sec" style="margin-top:6px">Quién hace crecer el Bosque</h2>
      <ol class="ranking">${rows.map((r, i) => `<li class="rk ${r.u === REG.me ? 'me' : ''}"><span class="rk-pos">${i === 0 ? '🥇' : `<span class="rk-n">${i + 1}</span>`}</span>${mini(r.name)}<span class="rk-name"><b>${esc(r.name)}${r.u === REG.me ? ' (tú)' : ''}</b><span class="tiny faint">${r.life} puntos aportados</span></span><span class="rk-lv">Árbol <b>${r.level}</b></span></li>`).join('')}</ol>
      <p style="margin-top:14px"><button class="btn primary" data-act="forest-invite">${icon('plus')}Invitar a alguien</button></p>`;
  }
  return `<h1 class="page-title">Vida del Bosque</h1><p class="page-sub">Juntos hacen crecer el árbol hasta el nivel 1000.</p>${groupStatus()}${card}${tabs}${body}`;
}

/* =========================================================
   6. Acciones
   ========================================================= */
const VIDA_ACTS = {
  'user-new': () => createUser(),
  'user-login': () => loginUser(),
  'sheet-close-new': () => { closeSheet(false); createUser(); },
  'acct-pw': () => setPassword(dataOwner()),
  'acct-out': async () => { const ok = await ask({ title: '¿Cerrar sesión aquí?', text: 'Tus datos siguen en la nube. Para volver a entrar necesitarás tu contraseña.', ok: 'Cerrar sesión' }); if (ok) logoutHere(); },
  vtab: (el) => { VUI.tab = el.dataset.v; render(); },
  'vtab-go': (el) => { VUI.tab = el.dataset.v; if (location.hash === '#/vida') render(); else location.hash = '#/vida'; },
  vrank: (el) => { VUI.rank = el.dataset.v; render(); },
  'rank-refresh': () => { fetchRank(true); render(); },
  'forest-new': async () => {
    const name = await ask({ title: 'Crear un Bosque', text: 'Ponle un nombre a tu grupo. Después podrás invitar a tus compañeros por su nombre de usuario.', input: { placeholder: 'Ej. T.V 512' }, ok: 'Crear Bosque' });
    if (!name) return;
    const emoji = FOREST_EMOJI[Math.floor(Math.random() * FOREST_EMOJI.length)];
    try {
      const r = await cloudFetch('POST', { kind: 'fcreate', as: REG.me, name, emoji, color: profile(REG.me)?.color });
      FOR.f[r.forest.id] = { meta: r.forest, items: [] }; saveFOR();
      Snd.chime(); toast(`Bosque ${r.forest.name} creado. Ahora invita a tus compañeros.`);
      enterProfile('f:' + r.forest.id);
    } catch (e) { toast(e.message); }
  },
  'forest-invite': async () => {
    const m = forestMeta(); if (!m) return;
    const u = await ask({ title: 'Invitar al Bosque', text: 'Escribe el nombre de usuario de tu compañero (el que eligió al crear su usuario). Le llegará una solicitud.', input: { placeholder: 'Ej. mel' }, ok: 'Enviar invitación' });
    if (!u) return;
    try { const r = await cloudFetch('POST', { kind: 'finvite', as: REG.me, forest: m.id, to: userSlug(u) }); Snd.chime(); toast(`Invitación enviada a ${r.name}.`); }
    catch (e) { toast(e.message); }
  },
  'forest-rename': async () => {
    const m = forestMeta(); if (!m) return;
    const n = await ask({ title: 'Nombre del Bosque', input: { value: m.name }, ok: 'Guardar' }); if (!n) return;
    try { await cloudFetch('POST', { kind: 'frename', as: REG.me, forest: m.id, name: n }); m.name = n; saveFOR(); render(); cloudSync(); } catch (e) { toast(e.message); }
  },
  'forest-leave': async () => {
    const m = forestMeta(); if (!m) return;
    const ok = await ask({ title: `¿Salir de ${m.name}?`, text: 'Dejarás de ver sus pendientes e ideas. Podrán invitarte de nuevo.', ok: 'Salir', danger: true }); if (!ok) return;
    try { await cloudFetch('POST', { kind: 'fleave', as: REG.me, forest: m.id }); delete FOR.f[m.id]; saveFOR(); REG.current = REG.me; saveReg(); switchProfile(REG.me); } catch (e) { toast(e.message); }
  },
  'invite-yes': async (el) => {
    try { await cloudFetch('POST', { kind: 'frespond', as: REG.me, forest: el.dataset.id, accept: true }); FOR.invites = FOR.invites.filter((i) => i.forest !== el.dataset.id); await cloudSync(); Snd.chime(); toast('¡Ya eres parte del Bosque!'); render(); } catch (e) { toast(e.message); }
  },
  'invite-no': async (el) => {
    try { await cloudFetch('POST', { kind: 'frespond', as: REG.me, forest: el.dataset.id, accept: false }); FOR.invites = FOR.invites.filter((i) => i.forest !== el.dataset.id); saveFOR(); render(); } catch (e) { toast(e.message); }
  },
};
