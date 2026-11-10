/* Al Día — Tu Cerebro: tus tareas, apuntes, materias y pensamientos como una red neuronal viva.
   Canvas 2D, sin librerías. Se carga antes de app.js. */
'use strict';

const BR = { nodes: [], edges: [], byId: new Map(), adj: new Map(), sel: null, cam: { x: 0, y: 0, k: 1 }, tgt: null, W: 0, H: 0, dpr: 1, raf: 0, pulses: [], rings: [], cache: new Map(), tour: null, t0: 0, ptr: new Map(), moved: 0, drag: null, pinch: null, intro: true };
const BR_STOP = new Set(['hacer', 'tarea', 'entregar', 'entrega', 'trabajo', 'sobre', 'cuando', 'porque', 'tengo', 'quiero', 'para', 'esta', 'este', 'estos', 'estas', 'desde', 'hasta', 'entre', 'ensayo', 'clase', 'maestro', 'maestra', 'profe', 'proyecto', 'examen', 'cosas', 'mucho', 'muchos', 'pensar', 'pienso', 'creo', 'siento', 'tambien', 'ahora', 'siempre', 'nunca', 'todo', 'todos', 'donde', 'como', 'algo', 'alguien']);
const brLight = (hex, a = 0.35) => { const m = /^#([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return '#B39DFF'; const n = parseInt(m[1], 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = (c) => Math.round(c + (255 - c) * a); return `rgb(${f(r)},${f(g)},${f(b)})`; };
const brWords = (s) => [...new Set(normChars(String(s || '')).split(/[^a-z0-9ñ]+/).filter((w) => w.length >= 5 && !BR_STOP.has(w)))];

function brainBuild() {
  const nodes = []; const edges = []; const byId = new Map();
  const add = (n) => { n.r0 = n.r; n.ph = Math.random() * 6.28; const c = BR.cache.get(n.id); if (c) { n.x = c.x; n.y = c.y; n.old = true; } else { const a = Math.random() * 6.28, d = 60 + Math.random() * 180; n.x = Math.cos(a) * d; n.y = Math.sin(a) * d; } n.vx = 0; n.vy = 0; nodes.push(n); byId.set(n.id, n); return n; };
  const link = (a, b, w = 1, kind = 'l') => { if (!a || !b || a === b) return; const k = a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id; if (link.seen.has(k)) return; link.seen.add(k); edges.push({ a, b, w, kind }); };
  link.seen = new Set();
  const core = add({ id: 'core', type: 'core', label: profile()?.name || 'Tú', r: 17, at: 0, color: '#FFFFFF' });
  const subs = S.subjects.slice(0, 14).map((s) => add({ id: 's:' + s.id, type: 'subject', ref: s.id, label: s.name, r: 11, at: 0, color: brLight(safeColor(s.color), 0.25) }));
  subs.forEach((s) => link(core, s, 1.4, 'hub'));
  const tasks = [...S.tasks].sort((a, b) => (b.doneAt || b.created || 0) - (a.doneAt || a.created || 0)).slice(0, 90);
  const thoughts = [...(S.thoughts || [])].sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 60);
  const notes = [...S.notes].sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 40);
  const tNodes = tasks.map((t) => add({ id: 't:' + t.id, type: 'task', ref: t.id, label: t.title, r: t.done ? 6.5 + (t.priority === 3 ? 1.5 : 0) : 5, done: !!t.done, at: t.doneAt || t.created || 0, color: t.done ? '#C9A8FF' : '#7C5CE0', sub: t.subjectId, txt: `${t.title} ${t.desc || ''}` }));
  const hNodes = thoughts.map((x) => add({ id: 'h:' + x.id, type: 'thought', ref: x.id, label: String(x.text || '').slice(0, 90), r: 5.5 + Math.min(4, (x.text || '').length / 70), at: x.at || 0, color: '#FF8FD8', txt: x.text }));
  const nNodes = notes.map((n) => add({ id: 'n:' + n.id, type: 'note', ref: n.id, label: n.title || 'Apunte', r: 5.5, at: n.updated || 0, color: '#7FE6FF', sub: n.subjectId, txt: `${n.title} ${n.body || ''}` }));
  for (const n of [...tNodes, ...nNodes]) { const s = n.sub && byId.get('s:' + n.sub); link(s || core, n, 1, 'sub'); }
  for (const n of hNodes) link(core, n, 0.4, 'core');
  const chain = (arr) => { const a = [...arr].sort((x, y) => x.at - y.at); for (let i = 1; i < a.length; i++) link(a[i - 1], a[i], 0.7, 'time'); };
  chain(hNodes); chain(nNodes);
  const done = tNodes.filter((n) => n.done).sort((x, y) => x.at - y.at); for (let i = 3; i < done.length; i += 3) link(done[i - 3], done[i], 0.5, 'time');
  const inv = new Map();
  for (const n of [...tNodes, ...hNodes, ...nNodes]) for (const w of brWords(n.txt)) { if (!inv.has(w)) inv.set(w, []); inv.get(w).push(n); }
  const per = new Map();
  for (const [w, list] of inv) { if (list.length < 2 || list.length > 7) continue; for (let i = 0; i < list.length - 1; i++) { const a = list[i], b = list[i + 1]; if ((per.get(a.id) || 0) >= 3 || (per.get(b.id) || 0) >= 3) continue; link(a, b, 0.9, 'idea'); per.set(a.id, (per.get(a.id) || 0) + 1); per.set(b.id, (per.get(b.id) || 0) + 1); } }
  const adj = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) { adj.get(e.a.id).push(e); adj.get(e.b.id).push(e); }
  const order = [...nodes].filter((n) => n.type !== 'core').sort((a, b) => (a.at || 0) - (b.at || 0));
  order.forEach((n, i) => { n.born = n.old ? 0 : 400 + (i / Math.max(1, order.length)) * 2600; });
  core.born = 0; subs.forEach((s, i) => { s.born = 150 + i * 90; });
  BR.nodes = nodes; BR.edges = edges; BR.byId = byId; BR.adj = adj;
}
function brainLayout(iter = 260) {
  const N = BR.nodes;
  for (let it = 0; it < iter; it++) {
    const cool = 1 - it / iter;
    for (let i = 0; i < N.length; i++) { const a = N[i]; for (let j = i + 1; j < N.length; j++) { const b = N[j]; let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy + 0.01; if (d2 > 40000) continue; const d = Math.sqrt(d2); const f = (a.type === 'core' || b.type === 'core' ? 2600 : 1100) / d2; dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f; } }
    for (const e of BR.edges) { const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y; const d = Math.sqrt(dx * dx + dy * dy) + 0.01; const rest = e.kind === 'hub' ? 110 : e.kind === 'sub' ? 62 : e.kind === 'idea' ? 75 : e.kind === 'core' ? 130 : 58; const f = (d - rest) * 0.02 * e.w; const fx = (dx / d) * f, fy = (dy / d) * f; e.a.vx += fx; e.a.vy += fy; e.b.vx -= fx; e.b.vy -= fy; }
    for (const n of N) { n.vx -= n.x * 0.004; n.vy -= n.y * 0.004; if (n.type === 'core') { n.x = n.y = 0; n.vx = n.vy = 0; continue; } n.x += Math.max(-9, Math.min(9, n.vx)) * (0.35 + cool * 0.65); n.y += Math.max(-9, Math.min(9, n.vy)) * (0.35 + cool * 0.65); n.vx *= 0.62; n.vy *= 0.62; }
  }
  for (const n of N) BR.cache.set(n.id, { x: n.x, y: n.y });
}
const brScr = (x, y) => [(x - BR.cam.x) * BR.cam.k + BR.W / 2, (y - BR.cam.y) * BR.cam.k + BR.H / 2];
const brWorld = (sx, sy) => [(sx - BR.W / 2) / BR.cam.k + BR.cam.x, (sy - BR.H / 2) / BR.cam.k + BR.cam.y];

function brainViewHTML() {
  const nT = S.tasks.filter((t) => t.done).length, nH = (S.thoughts || []).length, nN = S.notes.length;
  return `<a class="back" href="#/mas">${icon('back')}Más</a>
    <section class="brain" id="brainRoot"><canvas id="brainCv" aria-label="Tu cerebro: una red de tus tareas, apuntes y pensamientos conectados" role="img"></canvas>
      <div class="brain-hud"><div class="bh-title"><b>Tu Cerebro</b><span id="brainSub" class="small"></span></div>
        <div class="bh-stats"><span><b id="bsN">0</b><i>neuronas</i></span><span><b id="bsE">0</b><i>conexiones</i></span><span><b>${nT}</b><i>tareas hechas</i></span><span><b>${nH}</b><i>pensamientos</i></span></div></div>
      <div class="brain-ctl"><button type="button" class="bc" data-act="brain-tour" id="bcTour">✦ Viajar por mis ideas</button><button type="button" class="bc" data-act="brain-reset">⌖ Centrar</button></div>
      <div class="brain-card" id="brainCard" hidden></div></section>
    <p class="small muted" style="margin:12px 4px 0">Cada punto es algo que hiciste o pensaste: ${plural(nT, 'tarea entregada', 'tareas entregadas')}, ${plural(nN, 'apunte', 'apuntes')} y ${plural(nH, 'pensamiento', 'pensamientos')}. Toca una neurona para ver cómo se conecta. Arrastra para moverte y pellizca para acercar.</p>`;
}
const BR_TYPE = { core: 'Tú', subject: 'Materia', task: 'Tarea', thought: 'Pensamiento', note: 'Apunte' };
function brainSelect(id, fly = true) {
  const n = BR.byId.get(id); BR.sel = n ? id : null;
  const card = document.getElementById('brainCard'); if (!card) return;
  if (!n) { card.hidden = true; return; }
  if (fly) BR.tgt = { x: n.x, y: n.y, k: Math.max(BR.cam.k, 1.7) };
  BR.rings.push({ x: n.x, y: n.y, t: performance.now(), c: n.color }); BR.rings.push({ x: n.x, y: n.y, t: performance.now() + 220, c: n.color });
  const nb = (BR.adj.get(id) || []).map((e) => (e.a === n ? e.b : e.a));
  let det = '';
  if (n.type === 'task') { const t = task(n.ref); if (t) det = `${t.done ? '✅ Entregada' : '⏳ Pendiente'}${t.due ? ` · ${esc(cap(relDay(t.due)))}` : ''}${t.done && hasGrade(t) ? ` · calificación ${esc(String(t.grade))}` : ''}`; }
  else if (n.type === 'thought') { const x = (S.thoughts || []).find((y) => y.id === n.ref); if (x) det = `💭 ${esc(cap(relDay(toISO(new Date(x.at)))))}`; }
  else if (n.type === 'note') { const x = S.notes.find((y) => y.id === n.ref); if (x) det = `📒 ${esc(cap(relDay(toISO(new Date(x.updated || Date.now())))))}`; }
  else if (n.type === 'subject') det = `${plural(nb.length, 'conexión', 'conexiones')}`;
  else det = `${plural(S.tasks.filter((t) => t.done).length, 'tarea entregada', 'tareas entregadas')} · ${plural((S.thoughts || []).length, 'pensamiento', 'pensamientos')}`;
  const full = n.type === 'thought' ? ((S.thoughts || []).find((y) => y.id === n.ref)?.text || n.label) : n.label;
  const act = n.type === 'task' ? `<button class="bc go" data-act="brain-open" data-id="${n.id}">Abrir tarea</button>` : n.type === 'note' ? `<button class="bc go" data-act="brain-open" data-id="${n.id}">Abrir apunte</button>` : n.type === 'thought' ? `<button class="bc go" data-act="brain-open" data-id="${n.id}">Ir a pensamientos</button>` : n.type === 'subject' ? `<button class="bc go" data-act="brain-open" data-id="${n.id}">Ver materia</button>` : '';
  card.hidden = false; card.style.setProperty('--nc', n.color);
  card.innerHTML = `<div class="bk-h"><span class="bk-dot"></span><span class="bk-ty">${BR_TYPE[n.type]}</span><button type="button" class="bk-x" data-act="brain-close" aria-label="Cerrar">✕</button></div><p class="bk-t">${esc(full)}</p><p class="bk-d">${det}</p>
    ${nb.length ? `<div class="bk-n"><span class="tiny">Conectada con</span>${nb.slice(0, 8).map((m) => `<button type="button" class="bk-c" data-act="brain-go" data-id="${m.id}" style="--nc:${m.color}">${esc(String(m.label).slice(0, 22))}</button>`).join('')}</div>` : ''}${act}`;
  if (navigator.vibrate) navigator.vibrate(8);
  Snd.tick?.();
}
function brainFrame(now) {
  const cv = document.getElementById('brainCv'); if (!cv) { BR.raf = 0; return; }
  const ctx = cv.getContext('2d'); const W = BR.W, H = BR.H; const time = now - BR.t0; const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (BR.tgt) { const c = BR.cam, g = BR.tgt; c.x += (g.x - c.x) * 0.09; c.y += (g.y - c.y) * 0.09; c.k += (g.k - c.k) * 0.09; if (Math.abs(g.x - c.x) + Math.abs(g.y - c.y) < 0.4 && Math.abs(g.k - c.k) < 0.01) BR.tgt = null; }
  ctx.setTransform(BR.dpr, 0, 0, BR.dpr, 0, 0);
  const bg = ctx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, Math.max(W, H) * 0.75); bg.addColorStop(0, '#2A1257'); bg.addColorStop(0.55, '#150A33'); bg.addColorStop(1, '#07031A'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // polvo de estrellas
  ctx.globalCompositeOperation = 'lighter';
  for (const s of BR.stars || []) { const a = 0.25 + 0.25 * Math.sin(time / 900 + s.p); ctx.fillStyle = `rgba(200,180,255,${a})`; const [sx, sy] = [(s.x - BR.cam.x * 0.15 * s.z + W * 4) % W, (s.y - BR.cam.y * 0.15 * s.z + H * 4) % H]; ctx.fillRect(sx, sy, s.z, s.z); }
  const sel = BR.sel; const nbs = new Set(); if (sel) { nbs.add(sel); for (const e of BR.adj.get(sel) || []) { nbs.add(e.a.id); nbs.add(e.b.id); } }
  const appear = (n) => { const a = Math.max(0, Math.min(1, (time - n.born) / 700)); return a < 1 ? 1 - Math.pow(1 - a, 3) : 1; };
  // aristas
  for (const e of BR.edges) {
    const aa = appear(e.a), ab = appear(e.b); const ap = Math.min(aa, ab); if (ap <= 0) continue;
    const lit = sel && (e.a.id === sel || e.b.id === sel); const dim = sel && !lit;
    const [x1, y1] = brScr(e.a.x + Math.sin(time / 1400 + e.a.ph) * 2.5, e.a.y + Math.cos(time / 1700 + e.a.ph) * 2.5); const [x2, y2] = brScr(e.b.x + Math.sin(time / 1400 + e.b.ph) * 2.5, e.b.y + Math.cos(time / 1700 + e.b.ph) * 2.5);
    const al = (lit ? 0.85 : dim ? 0.07 : e.kind === 'idea' ? 0.42 : 0.22) * ap;
    ctx.strokeStyle = lit ? `rgba(220,200,255,${al})` : `rgba(165,125,255,${al})`; ctx.lineWidth = (lit ? 2.2 : e.kind === 'idea' ? 1.4 : 1) * Math.min(1.4, BR.cam.k); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  // pulsos de luz viajando por las conexiones
  if (!reduce && (!BR.pulses.length || BR.pulses.length < 26) && Math.random() < 0.35) { const pool = sel ? (BR.adj.get(sel) || []) : BR.edges; if (pool.length) BR.pulses.push({ e: pool[Math.floor(Math.random() * pool.length)], t: 0, sp: 0.006 + Math.random() * 0.01, rev: Math.random() < 0.5 }); }
  BR.pulses = BR.pulses.filter((p) => (p.t += p.sp * (sel ? 2 : 1)) < 1);
  for (const p of BR.pulses) { const a = p.rev ? p.e.b : p.e.a, b = p.rev ? p.e.a : p.e.b; if (appear(a) < 1 || appear(b) < 1) continue; const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t; const [sx, sy] = brScr(x, y); const r = 5 * BR.cam.k; const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 2.4); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.35, 'rgba(190,150,255,0.6)'); g.addColorStop(1, 'rgba(120,70,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, r * 2.4, 0, 6.3); ctx.fill(); }
  // neuronas
  for (const n of BR.nodes) {
    const ap = appear(n); if (ap <= 0) continue;
    const dim = sel && !nbs.has(n.id); const isSel = n.id === sel;
    const wob = reduce ? 0 : 1; const nx = n.x + Math.sin(time / 1400 + n.ph) * 2.5 * wob, ny = n.y + Math.cos(time / 1700 + n.ph) * 2.5 * wob;
    const [sx, sy] = brScr(nx, ny); const pulse = 1 + (reduce ? 0 : 0.12 * Math.sin(time / 600 + n.ph)); const r = n.r * BR.cam.k * ap * (isSel ? 1.5 : 1) * (n.type === 'core' ? pulse * 1.05 : (n.done || n.type === 'thought' ? pulse : 1));
    if (sx < -60 || sy < -60 || sx > W + 60 || sy > H + 60) continue;
    const gl = r * (isSel ? 5.5 : n.type === 'core' ? 5 : n.type === 'subject' ? 4 : 3.2); const a = dim ? 0.18 : 1;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, gl); g.addColorStop(0, hexA(n.color, 0.75 * a)); g.addColorStop(0.4, hexA(n.color, 0.22 * a)); g.addColorStop(1, hexA(n.color, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, gl, 0, 6.3); ctx.fill();
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = dim ? hexA(n.color, 0.35) : n.color; ctx.beginPath(); ctx.arc(sx, sy, Math.max(1.5, r), 0, 6.3); ctx.fill();
    if (n.type === 'task' && !n.done) { ctx.strokeStyle = hexA('#C9A8FF', dim ? 0.2 : 0.9); ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.arc(sx, sy, r + 3, 0, 6.3); ctx.stroke(); ctx.setLineDash([]); }
    if (n.type === 'subject' || n.type === 'core') { ctx.strokeStyle = hexA('#FFFFFF', dim ? 0.15 : 0.8); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(sx, sy, r + 3.5, 0, 6.3); ctx.stroke(); }
    ctx.globalCompositeOperation = 'lighter';
    const showLabel = isSel || (n.type === 'subject' || n.type === 'core') && !dim || (sel && nbs.has(n.id) && BR.cam.k > 1.2);
    if (showLabel) { ctx.globalCompositeOperation = 'source-over'; ctx.font = `${isSel ? 700 : 600} ${Math.round((n.type === 'core' ? 13 : 11.5) * Math.min(1.4, Math.max(0.9, BR.cam.k)))}px ui-rounded, system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.shadowColor = '#0A0422'; ctx.shadowBlur = 6; ctx.fillStyle = '#F3EAFF'; ctx.fillText(String(n.label).slice(0, n.type === 'thought' ? 26 : 22), sx, sy + r + 14); ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'lighter'; }
  }
  // ondas al seleccionar
  BR.rings = BR.rings.filter((r) => now - r.t < 1400);
  for (const r of BR.rings) { const k = (now - r.t) / 1400; if (k < 0) continue; const [sx, sy] = brScr(r.x, r.y); ctx.strokeStyle = hexA('#E6D5FF', 0.7 * (1 - k)); ctx.lineWidth = 2 * (1 - k) + 0.5; ctx.beginPath(); ctx.arc(sx, sy, (8 + k * 110) * BR.cam.k, 0, 6.3); ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-over';
  // contadores
  const live = BR.nodes.filter((n) => time >= n.born).length; const el = document.getElementById('bsN'); if (el && el.textContent !== String(live)) { el.textContent = live; const ee = document.getElementById('bsE'); if (ee) ee.textContent = BR.edges.filter((e) => time >= Math.max(e.a.born, e.b.born)).length; }
  BR.raf = requestAnimationFrame(brainFrame);
}
function hexA(c, a) { if (c.startsWith('rgb(')) return c.replace('rgb(', 'rgba(').replace(')', `,${a})`); const m = /^#([0-9a-f]{6})$/i.exec(c); if (!m) return `rgba(180,140,255,${a})`; const n = parseInt(m[1], 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function brainResize() {
  const cv = document.getElementById('brainCv'); if (!cv) return; const r = cv.getBoundingClientRect();
  BR.W = r.width; BR.H = r.height; BR.dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(BR.W * BR.dpr); cv.height = Math.round(BR.H * BR.dpr);
}
function brainFit() {
  let mx = 40; for (const n of BR.nodes) mx = Math.max(mx, Math.abs(n.x) + 20, Math.abs(n.y) + 20);
  BR.cam = { x: 0, y: 0, k: Math.max(0.35, Math.min(1.6, (Math.min(BR.W, BR.H) / 2) / mx)) }; BR.tgt = null;
}
function brainInit() {
  const cv = document.getElementById('brainCv'); if (!cv) return;
  cancelAnimationFrame(BR.raf); BR.pulses = []; BR.rings = [];
  brainResize(); brainBuild(); brainLayout(BR.nodes.some((n) => n.old) ? 90 : 300);
  const keep = BR.sel; BR.sel = null; BR.stars = Array.from({ length: 70 }, () => ({ x: Math.random() * 600, y: Math.random() * 900, z: 1 + Math.random() * 1.6, p: Math.random() * 6 }));
  if (!BR.cam || !BR.camSet) { brainFit(); BR.camSet = true; }
  const sub = document.getElementById('brainSub'); if (sub) sub.textContent = BR.nodes.length > 1 ? 'Mira todo lo que has construido' : 'Tu cerebro está despertando: sube tareas y pensamientos para verlo crecer';
  BR.t0 = performance.now(); BR.raf = requestAnimationFrame(brainFrame);
  if (keep && BR.byId.has(keep)) setTimeout(() => brainSelect(keep, false), 50);
  if (!cv.dataset.bound) { cv.dataset.bound = '1'; brainBind(cv); }
  if (BR.nodes.length <= 1) { const c = document.getElementById('brainCard'); if (c) { c.hidden = false; c.innerHTML = '<p class="bk-t">Aún no hay neuronas</p><p class="bk-d">Cada tarea que entregues, cada apunte y cada pensamiento aparecerá aquí como una luz conectada. ¡Empieza hoy y míralo crecer!</p>'; } }
}
function brainBind(cv) {
  const rect = () => cv.getBoundingClientRect();
  cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture?.(e.pointerId); BR.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); BR.moved = 0; BR.tgt = null; BR.tourStop?.(); if (BR.ptr.size === 2) { const [a, b] = [...BR.ptr.values()]; BR.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: BR.cam.k }; } });
  cv.addEventListener('pointermove', (e) => {
    const p = BR.ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; BR.moved += Math.abs(dx) + Math.abs(dy);
    if (BR.ptr.size === 2 && BR.pinch) { const [a, b] = [...BR.ptr.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); BR.cam.k = Math.max(0.3, Math.min(4, BR.pinch.k * d / BR.pinch.d)); }
    else if (BR.ptr.size === 1) { BR.cam.x -= dx / BR.cam.k; BR.cam.y -= dy / BR.cam.k; }
  });
  const up = (e) => { const had = BR.ptr.delete(e.pointerId); if (BR.ptr.size < 2) BR.pinch = null; if (had && BR.moved < 7 && BR.ptr.size === 0) { const r = rect(); brainTap(e.clientX - r.left, e.clientY - r.top); } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', (e) => { BR.ptr.delete(e.pointerId); BR.pinch = null; });
  cv.addEventListener('wheel', (e) => { e.preventDefault(); BR.cam.k = Math.max(0.3, Math.min(4, BR.cam.k * (e.deltaY < 0 ? 1.12 : 0.89))); BR.tgt = null; }, { passive: false });
  window.addEventListener('resize', () => { if (document.getElementById('brainCv')) brainResize(); });
}
function brainTap(sx, sy) {
  let best = null, bd = 1e9;
  for (const n of BR.nodes) { if (performance.now() - BR.t0 < n.born) continue; const [x, y] = brScr(n.x, n.y); const d = Math.hypot(x - sx, y - sy); const hit = Math.max(16, n.r * BR.cam.k + 10); if (d < hit && d < bd) { best = n; bd = d; } }
  if (best) brainSelect(best.id); else { BR.sel = null; const c = document.getElementById('brainCard'); if (c && BR.nodes.length > 1) c.hidden = true; }
}
BR.tourStop = () => { if (BR.tour) { clearInterval(BR.tour); BR.tour = null; const b = document.getElementById('bcTour'); if (b) b.textContent = '✦ Viajar por mis ideas'; } };
Object.assign(VIDA_ACTS, {
  'brain-go': (el) => { BR.tourStop(); brainSelect(el.dataset.id); },
  'brain-close': () => { BR.sel = null; const c = document.getElementById('brainCard'); if (c) c.hidden = true; },
  'brain-reset': () => { BR.tourStop(); BR.sel = null; const c = document.getElementById('brainCard'); if (c) c.hidden = true; let mx = 40; for (const n of BR.nodes) mx = Math.max(mx, Math.abs(n.x) + 20, Math.abs(n.y) + 20); BR.tgt = { x: 0, y: 0, k: Math.max(0.35, Math.min(1.6, (Math.min(BR.W, BR.H) / 2) / mx)) }; },
  'brain-open': (el) => {
    const n = BR.byId.get(el.dataset.id); if (!n) return;
    if (n.type === 'task') openTask(n.ref); else if (n.type === 'note') openNote(n.ref); else if (n.type === 'thought') location.hash = '#/mente'; else if (n.type === 'subject') location.hash = `#/materia/${n.ref}`;
  },
  'brain-tour': () => {
    if (BR.tour) { BR.tourStop(); return; }
    const list = BR.nodes.filter((n) => n.type === 'thought' || (n.type === 'task' && n.done) || n.type === 'note').sort((a, b) => (a.at || 0) - (b.at || 0));
    if (!list.length) { toast('Todavía no hay ideas para recorrer. Escribe un pensamiento o entrega una tarea.'); return; }
    let i = 0; const b = document.getElementById('bcTour'); if (b) b.textContent = '■ Detener viaje'; toast('Viajando por tu cerebro, de lo primero a lo más reciente…', { ms: 3500 });
    const step = () => { if (!document.getElementById('brainCv')) { BR.tourStop(); return; } brainSelect(list[i % list.length].id); i++; if (i > list.length + 0 && i > 40) BR.tourStop(); };
    step(); BR.tour = setInterval(step, 3600);
  },
});
function viewCerebro() { return brainViewHTML(); }
