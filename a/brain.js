/* Al Día — Tu Cerebro.
   Un córtex en 3D: cada tarea, apunte, materia y pensamiento es una neurona en el espacio.
   Señales eléctricas viajan por las sinapsis (actividad espontánea y cascadas al seleccionar),
   con profundidad real, niebla, retícula de selección y cámara que orbita con suavidad.
   Canvas 2D, sin librerías. Se carga antes de app.js. */
'use strict';

const BR = { nodes: [], edges: [], byId: new Map(), adj: new Map(), sel: null, rot: { yaw: 0.7, pitch: -0.28 }, rotT: null, zoom: 1, zoomT: null,
  W: 0, H: 0, dpr: 1, raf: 0, sig: [], queue: [], t0: 0, last: 0, ptr: new Map(), moved: 0, pinch: null, tour: null, cache: new Map(),
  spr: new Map(), cy: 0.5, fires: [], hzN: 0, hz: 0, hzT: 0, idleT: 0, dust: [], camSet: false };
const BR_STOP = new Set(['hacer', 'tarea', 'entregar', 'entrega', 'trabajo', 'sobre', 'cuando', 'porque', 'tengo', 'quiero', 'para', 'esta', 'este', 'estos', 'estas', 'desde', 'hasta', 'entre', 'ensayo', 'clase', 'maestro', 'maestra', 'profe', 'proyecto', 'examen', 'cosas', 'mucho', 'muchos', 'pensar', 'pienso', 'creo', 'siento', 'tambien', 'ahora', 'siempre', 'nunca', 'todo', 'todos', 'donde', 'como', 'algo', 'alguien']);
const BR_C = { core: '#FFFFFF', done: '#A797FF', task: '#6F86FF', thought: '#E7A6FF', note: '#72D9FF' };
const BR_TYPE = { core: 'Núcleo', subject: 'Materia', task: 'Tarea', thought: 'Pensamiento', note: 'Apunte' };
const brLight = (hex, a = 0.35) => { const m = /^#([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return '#B39DFF'; const n = parseInt(m[1], 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; const f = (c) => Math.round(c + (255 - c) * a); return `#${[f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`; };
const brWords = (s) => [...new Set(normChars(String(s || '')).split(/[^a-z0-9ñ]+/).filter((w) => w.length >= 5 && !BR_STOP.has(w)))];
function hexA(c, a) { const m = /^#([0-9a-f]{6})$/i.exec(c); if (!m) return `rgba(180,160,255,${a})`; const n = parseInt(m[1], 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
const brClamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- datos ---------- */
function brainBuild() {
  const nodes = []; const edges = []; const byId = new Map();
  const add = (n, rad) => {
    const c = BR.cache.get(n.id);
    if (c) { n.x = c.x; n.y = c.y; n.z = c.z; n.old = true; }
    else { const u = Math.random() * 2 - 1, th = Math.random() * 6.283, r = rad * (0.75 + Math.random() * 0.5), q = Math.sqrt(1 - u * u); n.x = r * q * Math.cos(th); n.y = r * u * 0.8; n.z = r * q * Math.sin(th); }
    n.vx = n.vy = n.vz = 0; n.flash = -1e9; n.ph = Math.random() * 6.283; nodes.push(n); byId.set(n.id, n); return n;
  };
  const link = (a, b, w = 1, kind = 'l') => { if (!a || !b || a === b) return; const k = a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id; if (link.seen.has(k)) return; link.seen.add(k); edges.push({ a, b, w, kind, bend: (Math.random() - 0.5) * 0.5 }); };
  link.seen = new Set();
  const core = add({ id: 'core', type: 'core', label: profile()?.name || 'Tú', r: 5.5, at: 0, color: BR_C.core }, 0); core.x = core.y = core.z = 0;
  const subs = S.subjects.slice(0, 14).map((s) => add({ id: 's:' + s.id, type: 'subject', ref: s.id, label: s.name, r: 4, at: 0, color: brLight(safeColor(s.color), 0.35) }, 120));
  subs.forEach((s) => link(core, s, 1.4, 'hub'));
  const tasks = [...S.tasks].sort((a, b) => (b.doneAt || b.created || 0) - (a.doneAt || a.created || 0)).slice(0, 90);
  const thoughts = [...(S.thoughts || [])].sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 60);
  const notes = [...S.notes].sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 40);
  const tNodes = tasks.map((t) => add({ id: 't:' + t.id, type: 'task', ref: t.id, label: t.title, r: t.done ? 2.6 + (t.priority === 3 ? 0.6 : 0) : 2.3, done: !!t.done, at: t.doneAt || t.created || 0, color: t.done ? BR_C.done : BR_C.task, sub: t.subjectId, txt: `${t.title} ${t.desc || ''}` }, 230));
  const hNodes = thoughts.map((x) => add({ id: 'h:' + x.id, type: 'thought', ref: x.id, label: String(x.text || '').slice(0, 90), r: 2.4 + Math.min(1.2, (x.text || '').length / 120), at: x.at || 0, color: BR_C.thought, txt: x.text }, 250));
  const nNodes = notes.map((n) => add({ id: 'n:' + n.id, type: 'note', ref: n.id, label: n.title || 'Apunte', r: 2.4, at: n.updated || 0, color: BR_C.note, sub: n.subjectId, txt: `${n.title} ${n.body || ''}` }, 230));
  for (const n of [...tNodes, ...nNodes]) { const s = n.sub && byId.get('s:' + n.sub); link(s || core, n, 1, 'sub'); }
  for (const n of hNodes) link(core, n, 0.4, 'core');
  const chain = (arr) => { const a = [...arr].sort((x, y) => x.at - y.at); for (let i = 1; i < a.length; i++) link(a[i - 1], a[i], 0.7, 'time'); };
  chain(hNodes); chain(nNodes);
  const done = tNodes.filter((n) => n.done).sort((x, y) => x.at - y.at); for (let i = 3; i < done.length; i += 3) link(done[i - 3], done[i], 0.5, 'time');
  const inv = new Map();
  for (const n of [...tNodes, ...hNodes, ...nNodes]) for (const w of brWords(n.txt)) { if (!inv.has(w)) inv.set(w, []); inv.get(w).push(n); }
  const per = new Map();
  for (const [, list] of inv) { if (list.length < 2 || list.length > 7) continue; for (let i = 0; i < list.length - 1; i++) { const a = list[i], b = list[i + 1]; if ((per.get(a.id) || 0) >= 3 || (per.get(b.id) || 0) >= 3) continue; link(a, b, 0.9, 'idea'); per.set(a.id, (per.get(a.id) || 0) + 1); per.set(b.id, (per.get(b.id) || 0) + 1); } }
  const adj = new Map(nodes.map((n) => [n.id, []]));
  for (const e of edges) { adj.get(e.a.id).push(e); adj.get(e.b.id).push(e); }
  const order = [...nodes].filter((n) => n.type !== 'core').sort((a, b) => (a.at || 0) - (b.at || 0));
  order.forEach((n, i) => { n.born = n.old ? 0 : 250 + (i / Math.max(1, order.length)) * 1800; });
  core.born = 0; subs.forEach((s, i) => { s.born = n0(s) ? 0 : 120 + i * 60; });
  function n0(s) { return s.old; }
  BR.nodes = nodes; BR.edges = edges; BR.byId = byId; BR.adj = adj;
}
function brainLayout(iter = 220) {
  const N = BR.nodes;
  for (let it = 0; it < iter; it++) {
    const cool = 1 - it / iter;
    for (let i = 0; i < N.length; i++) {
      const a = N[i];
      for (let j = i + 1; j < N.length; j++) {
        const b = N[j]; let dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z; const d2 = dx * dx + dy * dy + dz * dz + 0.01; if (d2 > 52000) continue;
        const d = Math.sqrt(d2); const f = (a.type === 'core' || b.type === 'core' ? 2400 : 1000) / d2; dx /= d; dy /= d; dz /= d;
        a.vx += dx * f; a.vy += dy * f; a.vz += dz * f; b.vx -= dx * f; b.vy -= dy * f; b.vz -= dz * f;
      }
    }
    for (const e of BR.edges) {
      const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, dz = e.b.z - e.a.z; const d = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.01;
      const rest = e.kind === 'hub' ? 120 : e.kind === 'sub' ? 70 : e.kind === 'idea' ? 85 : e.kind === 'core' ? 170 : 65;
      const f = (d - rest) * 0.018 * e.w; const fx = (dx / d) * f, fy = (dy / d) * f, fz = (dz / d) * f;
      e.a.vx += fx; e.a.vy += fy; e.a.vz += fz; e.b.vx -= fx; e.b.vy -= fy; e.b.vz -= fz;
    }
    for (const n of N) {
      if (n.type === 'core') { n.x = n.y = n.z = 0; n.vx = n.vy = n.vz = 0; continue; }
      n.vx -= n.x * 0.004; n.vy -= n.y * 0.006; n.vz -= n.z * 0.004;
      const k = 0.35 + cool * 0.65;
      n.x += brClamp(n.vx, -9, 9) * k; n.y += brClamp(n.vy, -9, 9) * k; n.z += brClamp(n.vz, -9, 9) * k; n.vx *= 0.6; n.vy *= 0.6; n.vz *= 0.6;
    }
  }
  for (const n of N) BR.cache.set(n.id, { x: n.x, y: n.y, z: n.z });
}

/* ---------- proyección ---------- */
const BR_D = 560;
function brProject(x, y, z) {
  const { yaw, pitch } = BR.rot; const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x1 = x * cy - z * sy, z1 = x * sy + z * cy; const y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
  const F = Math.min(BR.W, BR.H) * 1.05 * BR.zoom; const s = F / (BR_D + z2);
  return [BR.W / 2 + x1 * s, BR.H * BR.cy + y1 * s, z2, s];
}
/* compatibilidad: coordenadas en pantalla de una neurona */
function brScr(x, y) { const n = BR.nodes.find((m) => m.x === x && m.y === y); return n ? [n.sx, n.sy] : [BR.W / 2, BR.H / 2]; }
const brFog = (z) => brClamp(1.05 - (z + 260) / 620, 0.16, 1);

/* sprites de brillo, uno por color (barato de dibujar) */
function brSprite(color) {
  let c = BR.spr.get(color); if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, hexA(color, 0.9)); gr.addColorStop(0.18, hexA(color, 0.45)); gr.addColorStop(0.5, hexA(color, 0.1)); gr.addColorStop(1, hexA(color, 0));
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); BR.spr.set(color, c); return c;
}

/* ---------- vista ---------- */
function brainViewHTML() {
  const nT = S.tasks.filter((t) => t.done).length, nH = (S.thoughts || []).length, nN = S.notes.length;
  return `<a class="back" href="#/mas">${icon('back')}Más</a>
    <section class="brain" id="brainRoot"><canvas id="brainCv" aria-label="Tu cerebro: una red en tres dimensiones de tus tareas, apuntes y pensamientos" role="img"></canvas>
      <div class="brain-hud">
        <div class="bh-title"><span class="bh-k">Córtex personal</span><b>Tu Cerebro</b></div>
        <div class="bh-stats"><span><i>Neuronas</i><b id="bsN">0</b></span><span><i>Sinapsis</i><b id="bsE">0</b></span><span><i>Materias</i><b>${S.subjects.length}</b></span></div>
      </div>
      <div class="brain-legend"><span style="--c:${BR_C.done}">Tareas</span><span style="--c:${BR_C.note}">Apuntes</span><span style="--c:${BR_C.thought}">Pensamientos</span><span style="--c:#FFFFFF">Materias</span></div>
      <div class="brain-ctl"><button type="button" class="bc" data-act="brain-tour" id="bcTour">${icon('play', 'sm')}<span>Recorrido</span></button><button type="button" class="bc" data-act="brain-reset">${icon('target', 'sm')}<span>Centrar</span></button></div>
      <div class="brain-card" id="brainCard" hidden></div></section>
    <p class="small muted" style="margin:12px 4px 0">${plural(nT, 'tarea entregada', 'tareas entregadas')}, ${plural(nN, 'apunte', 'apuntes')} y ${plural(nH, 'pensamiento', 'pensamientos')}, conectados por materia, por tiempo y por las ideas que comparten. Arrastra para girar, pellizca para acercar y toca una neurona para ver su actividad.</p>`;
}
function brainSelect(id, fly = true) {
  const n = BR.byId.get(id); BR.sel = n ? id : null;
  const card = document.getElementById('brainCard'); if (!card) return;
  if (!n) { card.hidden = true; return; }
  if (fly) brFocus(n);
  const nb = (BR.adj.get(id) || []).map((e) => (e.a === n ? e.b : e.a));
  let det = '';
  if (n.type === 'task') { const t = task(n.ref); if (t) det = `${t.done ? 'Entregada' : 'Pendiente'}${t.due ? ` · ${esc(cap(relDay(t.due)))}` : ''}${t.done && hasGrade(t) ? ` · calificación ${esc(String(t.grade))}` : ''}`; }
  else if (n.type === 'thought') { const x = (S.thoughts || []).find((y) => y.id === n.ref); if (x) det = esc(cap(relDay(toISO(new Date(x.at))))); }
  else if (n.type === 'note') { const x = S.notes.find((y) => y.id === n.ref); if (x) det = `Actualizado ${esc(relDay(toISO(new Date(x.updated || Date.now()))))}`; }
  else if (n.type === 'subject') det = plural(nb.length, 'conexión', 'conexiones');
  else det = `${plural(S.tasks.filter((t) => t.done).length, 'tarea entregada', 'tareas entregadas')} · ${plural((S.thoughts || []).length, 'pensamiento', 'pensamientos')}`;
  const full = n.type === 'thought' ? ((S.thoughts || []).find((y) => y.id === n.ref)?.text || n.label) : n.label;
  const act = { task: 'Abrir tarea', note: 'Abrir apunte', thought: 'Ir a pensamientos', subject: 'Ver materia' }[n.type];
  card.hidden = false; card.style.setProperty('--nc', n.color);
  card.innerHTML = `<div class="bk-h"><span class="bk-dot"></span><span class="bk-ty">${BR_TYPE[n.type]}</span><span class="bk-id">${plural(nb.length, 'sinapsis', 'sinapsis')}</span><button type="button" class="bk-x" data-act="brain-close" aria-label="Cerrar">${icon('x', 'sm')}</button></div>
    <p class="bk-t">${esc(full)}</p>${det ? `<p class="bk-d">${det}</p>` : ''}
    ${nb.length ? `<div class="bk-n">${nb.slice(0, 6).map((m) => `<button type="button" class="bk-c" data-act="brain-go" data-id="${m.id}" style="--nc:${m.color}">${esc(String(m.label).slice(0, 24))}</button>`).join('')}</div>` : ''}
    ${act ? `<button class="bc go" data-act="brain-open" data-id="${n.id}">${act}${icon('chev', 'sm')}</button>` : ''}`;
  if (navigator.vibrate) navigator.vibrate(6);
  Snd.tick?.();
}
/* la cámara gira para traer la neurona al frente y se acerca */
function brFocus(n) {
  const r = Math.hypot(n.x, n.z) || 1; let yaw = Math.atan2(-n.x, -n.z);
  const d = Math.hypot(n.x, n.y, n.z); const pitch = brClamp(Math.atan2(-n.y, d || 1) * 0.9, -0.9, 0.9);
  const cur = BR.rot.yaw; let dy = yaw - cur; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); yaw = cur + dy;
  BR.rotT = { yaw, pitch: n.type === 'core' ? -0.28 : pitch }; BR.zoomT = n.type === 'core' ? 1 : brClamp(1.25 + 60 / (r + 60), 1.3, 2.1); BR.idleT = performance.now();
}
/* cascada: la señal sale de la neurona y se propaga por la red, salto a salto */
function brCascade(n, now) {
  const seen = new Set([n.id]); let front = [n]; n.flash = now;
  for (let hop = 0; hop < 3 && front.length; hop++) {
    const next = [];
    for (const m of front) for (const e of BR.adj.get(m.id) || []) {
      const o = e.a === m ? e.b : e.a; if (seen.has(o.id)) continue; seen.add(o.id); next.push(o);
      BR.queue.push({ at: now + hop * 420 + Math.random() * 120, e, from: m, lit: true });
    }
    front = next.slice(0, 40);
  }
}
function brSpawn(now) {
  const pool = BR.edges; if (!pool.length) return;
  const e = pool[Math.floor(Math.random() * pool.length)]; BR.sig.push({ e, from: Math.random() < 0.5 ? e.a : e.b, t: 0, sp: 0.0011 + Math.random() * 0.0011, born: now, hop: 0 }); BR.hzN++;
}

/* ---------- dibujo ---------- */
function brainFrame(now) {
  const cv = document.getElementById('brainCv'); if (!cv) { BR.raf = 0; return; }
  const ctx = cv.getContext('2d'); const W = BR.W, H = BR.H; const time = now - BR.t0; const dt = Math.min(50, now - (BR.last || now)); BR.last = now;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // cámara
  if (BR.rotT) { const k = 1 - Math.pow(0.0025, dt / 1000); BR.rot.yaw += (BR.rotT.yaw - BR.rot.yaw) * k; BR.rot.pitch += (BR.rotT.pitch - BR.rot.pitch) * k; if (Math.abs(BR.rotT.yaw - BR.rot.yaw) + Math.abs(BR.rotT.pitch - BR.rot.pitch) < 0.002) BR.rotT = null; }
  if (BR.zoomT) { const k = 1 - Math.pow(0.004, dt / 1000); BR.zoom += (BR.zoomT - BR.zoom) * k; if (Math.abs(BR.zoomT - BR.zoom) < 0.002) BR.zoomT = null; }
  { const want = BR.sel && !document.getElementById('brainCard')?.hidden ? 0.34 : 0.5; BR.cy += (want - BR.cy) * (1 - Math.pow(0.003, dt / 1000)); }
  if (!reduce && !BR.rotT && !BR.ptr.size && now - BR.idleT > 5000 && !BR.sel) BR.rot.yaw += dt * 0.00006;
  ctx.setTransform(BR.dpr, 0, 0, BR.dpr, 0, 0);
  // fondo: casi negro con un leve resplandor violeta
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#05050B'; ctx.fillRect(0, 0, W, H);
  const bg = ctx.createRadialGradient(W / 2, H * 0.48, 0, W / 2, H * 0.48, Math.max(W, H) * 0.7); bg.addColorStop(0, 'rgba(84,60,190,0.22)'); bg.addColorStop(0.5, 'rgba(40,28,100,0.08)'); bg.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  // polvo lejano y órbitas de referencia (dan profundidad)
  ctx.globalCompositeOperation = 'lighter';
  for (const p of BR.dust) { const [x, y, z] = brProject(p.x, p.y, p.z); if (z < -BR_D + 40) continue; ctx.fillStyle = `rgba(190,180,255,${0.12 + 0.12 * brFog(z * 0.4)})`; ctx.fillRect(x, y, 1, 1); }
  for (const R of [130, 240, 340]) {
    ctx.beginPath(); for (let i = 0; i <= 96; i++) { const a = (i / 96) * 6.2832; const [x, y] = brProject(Math.cos(a) * R, 0, Math.sin(a) * R); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.strokeStyle = 'rgba(150,140,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();
  }
  // proyectar neuronas
  const appear = (n) => { const a = brClamp((time - n.born) / 900, 0, 1); return a * a * (3 - 2 * a); };
  for (const n of BR.nodes) { const [x, y, z, s] = brProject(n.x, n.y, n.z); n.sx = x; n.sy = y; n.sz = z; n.ss = s; n.ap = appear(n); }
  const sel = BR.sel; const near = new Map();
  if (sel) { near.set(sel, 0); let f = [sel]; for (let h = 1; h <= 2; h++) { const nx = []; for (const id of f) for (const e of BR.adj.get(id) || []) { const o = e.a.id === id ? e.b.id : e.a.id; if (!near.has(o)) { near.set(o, h); nx.push(o); } } f = nx; } }
  const lvl = (id) => (sel ? (near.has(id) ? near.get(id) : 9) : 1);
  // sinapsis
  const ctrl = (e) => { const mx = (e.a.sx + e.b.sx) / 2, my = (e.a.sy + e.b.sy) / 2; const dx = e.b.sx - e.a.sx, dy = e.b.sy - e.a.sy; return [mx - dy * e.bend * 0.35 + (W / 2 - mx) * 0.06, my + dx * e.bend * 0.35 + (H / 2 - my) * 0.06]; };
  for (const e of BR.edges) {
    const ap = Math.min(e.a.ap, e.b.ap); if (ap <= 0) continue;
    const L = Math.max(lvl(e.a.id), lvl(e.b.id)); const hot = sel && (e.a.id === sel || e.b.id === sel);
    const fog = brFog((e.a.sz + e.b.sz) / 2);
    let al = (e.kind === 'idea' ? 0.3 : e.kind === 'hub' ? 0.34 : 0.17) * fog * ap;
    if (sel) al = hot ? 0.75 * ap : L <= 2 ? al * 1.4 : al * 0.22;
    const [qx, qy] = ctrl(e); e.qx = qx; e.qy = qy;
    ctx.strokeStyle = hot ? `rgba(226,214,255,${al})` : hexA(e.kind === 'idea' ? '#C9B8FF' : '#8E7DFF', al);
    ctx.lineWidth = (hot ? 1.3 : e.kind === 'hub' ? 1 : 0.7) * Math.min(1.5, (e.a.ss + e.b.ss) / 2 * 1.2);
    ctx.beginPath(); ctx.moveTo(e.a.sx, e.a.sy); ctx.quadraticCurveTo(qx, qy, e.b.sx, e.b.sy); ctx.stroke();
  }
  BR.sig = []; BR.queue = [];
  // neuronas, de atrás hacia delante
  const order = [...BR.nodes].sort((p, q) => q.sz - p.sz);
  for (const n of order) {
    if (n.ap <= 0) continue; const x = n.sx, y = n.sy; if (x < -40 || y < -40 || x > W + 40 || y > H + 40) continue;
    const L = lvl(n.id); const fog = brFog(n.sz); const isSel = n.id === sel;
    const fl = 0;
    const a = (sel ? (L === 0 ? 1 : L === 1 ? 0.95 : L === 2 ? 0.6 : 0.14) : fog) * n.ap;
    const r = n.r * n.ss * 1.25 * (n.type === 'core' ? 1 : 1) * (0.92 + 0.08 * Math.sin(time / 900 + n.ph));
    const gs = r * (n.type === 'core' ? 10 : 7) * (1 + fl * 0.8);
    ctx.globalAlpha = a * (0.55 + fl * 0.45); ctx.drawImage(brSprite(n.color), x - gs / 2, y - gs / 2, gs, gs); ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    if (n.type === 'task' && !n.done) { ctx.strokeStyle = hexA(n.color, a); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, Math.max(1.6, r), 0, 6.2832); ctx.stroke(); }
    else { ctx.fillStyle = hexA(fl > 0.05 ? '#FFFFFF' : n.color, a); ctx.beginPath(); ctx.arc(x, y, Math.max(1.2, r), 0, 6.2832); ctx.fill(); }
    if (n.type === 'subject') { ctx.strokeStyle = hexA(n.color, a * 0.7); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(x, y, r + 4, 0, 6.2832); ctx.stroke(); }
    if (n.type === 'core') {
      for (let i = 0; i < 2; i++) { ctx.save(); ctx.translate(x, y); ctx.rotate(time / (i ? -5200 : 3800) + i); ctx.scale(1, 0.38); ctx.strokeStyle = `rgba(220,210,255,${0.35 * a})`; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(0, 0, r * (3.2 + i * 1.3), 0, 6.2832); ctx.stroke(); ctx.restore(); }
    }
    if (fl > 0 && !reduce) { ctx.strokeStyle = hexA('#E8E0FF', fl * 0.55 * a); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.arc(x, y, r + 3 + (1 - fl) * 9, 0, 6.2832); ctx.stroke(); }
    ctx.globalCompositeOperation = 'lighter';
  }
  ctx.globalCompositeOperation = 'source-over';
  // etiquetas: materias siempre; con selección, la neurona y sus vecinas cercanas
  const mono = '500 9.5px ui-monospace, "SF Mono", Menlo, monospace'; const sans = '600 12.5px -apple-system, "SF Pro Text", system-ui, sans-serif';
  for (const n of order) {
    if (n.ap < 1) continue; const L = lvl(n.id); const isSel = n.id === sel;
    const show = isSel || (n.type === 'subject' && (!sel || L <= 1)) || (n.type === 'core' && !sel);
    if (!show) continue;
    const fog = sel ? 1 : brFog(n.sz); const x = n.sx, y = n.sy;
    if (isSel) {
      // retícula de selección
      const R = Math.max(12, n.r * n.ss * 1.25 + 9); const rot = 0;
      ctx.strokeStyle = 'rgba(236,230,255,0.9)'; ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) { const a0 = rot + i * Math.PI / 2; ctx.beginPath(); ctx.arc(x, y, R, a0 + 0.18, a0 + Math.PI / 2 - 0.18); ctx.stroke(); }
      ctx.beginPath(); for (let i = 0; i < 4; i++) { const a0 = rot + i * Math.PI / 2 + Math.PI / 4; ctx.moveTo(x + Math.cos(a0) * (R + 3), y + Math.sin(a0) * (R + 3)); ctx.lineTo(x + Math.cos(a0) * (R + 8), y + Math.sin(a0) * (R + 8)); } ctx.stroke();
      // línea guía y rótulo
      const txt = String(n.label).length > 24 ? String(n.label).slice(0, 23) + '…' : String(n.label);
      ctx.font = sans; const tw = Math.max(ctx.measureText(txt).width, 60); const right = x + R + 28 + tw < W - 10; const sgn = right ? 1 : -1;
      const ex = x + sgn * (R * 0.72), ey = y - R * 0.72, kx = x + sgn * (R + 20), ky = y - R - 16;
      ctx.strokeStyle = 'rgba(236,230,255,0.55)'; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(kx, ky); ctx.lineTo(kx + sgn * 8, ky); ctx.stroke();
      ctx.textAlign = right ? 'left' : 'right'; const tx = right ? Math.min(kx + 12, W - 10 - tw) : Math.max(kx - 12, 10 + tw);
      ctx.font = mono; ctx.fillStyle = hexA(n.color, 0.95); ctx.fillText(BR_TYPE[n.type].toUpperCase(), tx, ky - 10);
      ctx.font = sans; ctx.fillStyle = '#F2EEFF'; ctx.fillText(txt, tx, ky + 5);
      continue;
    }
    ctx.textAlign = 'center';
    if (n.type === 'subject' || n.type === 'core') { ctx.font = mono; ctx.fillStyle = `rgba(226,220,255,${0.75 * fog})`; ctx.fillText(String(n.label).toUpperCase().slice(0, 20), x, y + n.r * n.ss * 1.25 + 16); }
    else { ctx.font = '500 11px -apple-system, system-ui, sans-serif'; ctx.fillStyle = 'rgba(230,224,255,0.8)'; ctx.fillText(String(n.label).slice(0, 22), x, y + 14); }
  }
  // métricas
  if (false) { BR.hz = Math.round(BR.hzN * 1000 / Math.max(1, now - BR.hzT)); BR.hzN = 0; BR.hzT = now; const h = document.getElementById('bsHz'); if (h) h.textContent = BR.hz; }
  const live = BR.nodes.filter((n) => time >= n.born).length; const el = document.getElementById('bsN');
  if (el && el.textContent !== String(live)) { el.textContent = live; const ee = document.getElementById('bsE'); if (ee) ee.textContent = BR.edges.filter((e) => time >= Math.max(e.a.born, e.b.born)).length; }
  BR.raf = requestAnimationFrame(brainFrame);
}

/* ---------- ciclo de vida e interacción ---------- */
function brainResize() {
  const cv = document.getElementById('brainCv'); if (!cv) return; const r = cv.getBoundingClientRect();
  BR.W = r.width; BR.H = r.height; BR.dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(BR.W * BR.dpr); cv.height = Math.round(BR.H * BR.dpr);
}
function brainFit() { let mx = 60; for (const n of BR.nodes) mx = Math.max(mx, Math.hypot(n.x, n.y, n.z) + 20); BR.zoomT = brClamp(300 / mx, 0.55, 1.15); BR.rotT = { yaw: BR.rot.yaw, pitch: -0.28 }; }
function brainInit() {
  const cv = document.getElementById('brainCv'); if (!cv) return;
  cancelAnimationFrame(BR.raf); BR.sig = []; BR.queue = [];
  brainResize(); brainBuild(); brainLayout(BR.nodes.some((n) => n.old) ? 80 : 240);
  const keep = BR.sel; BR.sel = null;
  if (!BR.dust.length) BR.dust = Array.from({ length: 160 }, () => { const u = Math.random() * 2 - 1, th = Math.random() * 6.283, r = 520 + Math.random() * 420, q = Math.sqrt(1 - u * u); return { x: r * q * Math.cos(th), y: r * u, z: r * q * Math.sin(th) }; });
  if (!BR.camSet) { let mx = 60; for (const n of BR.nodes) mx = Math.max(mx, Math.hypot(n.x, n.y, n.z) + 20); BR.zoom = brClamp(300 / mx, 0.55, 1.15) * 0.8; brainFit(); BR.camSet = true; }
  BR.t0 = performance.now(); BR.last = 0; BR.hzT = BR.t0; BR.idleT = BR.t0; BR.raf = requestAnimationFrame(brainFrame);
  if (keep && BR.byId.has(keep)) setTimeout(() => brainSelect(keep, false), 50);
  if (!cv.dataset.bound) { cv.dataset.bound = '1'; brainBind(cv); }
  if (BR.nodes.length <= 1) { const c = document.getElementById('brainCard'); if (c) { c.hidden = false; c.innerHTML = '<div class="bk-h"><span class="bk-ty">Sin actividad todavía</span></div><p class="bk-t">Tu córtex está en blanco</p><p class="bk-d">Cada tarea que entregues, cada apunte y cada pensamiento se convierte aquí en una neurona conectada.</p>'; } }
}
function brainBind(cv) {
  cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture?.(e.pointerId); BR.ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); BR.moved = 0; BR.rotT = null; BR.idleT = performance.now(); BR.tourStop?.(); if (BR.ptr.size === 2) { const [a, b] = [...BR.ptr.values()]; BR.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), k: BR.zoom }; BR.zoomT = null; } });
  cv.addEventListener('pointermove', (e) => {
    const p = BR.ptr.get(e.pointerId); if (!p) return; const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; BR.moved += Math.abs(dx) + Math.abs(dy); BR.idleT = performance.now();
    if (BR.ptr.size === 2 && BR.pinch) { const [a, b] = [...BR.ptr.values()]; BR.zoom = brClamp(BR.pinch.k * Math.hypot(a.x - b.x, a.y - b.y) / BR.pinch.d, 0.45, 3.2); }
    else if (BR.ptr.size === 1) { BR.rot.yaw += dx * 0.006; BR.rot.pitch = brClamp(BR.rot.pitch + dy * 0.004, -1.2, 1.2); }
  });
  const up = (e) => { const had = BR.ptr.delete(e.pointerId); if (BR.ptr.size < 2) BR.pinch = null; if (had && BR.moved < 7 && BR.ptr.size === 0) { const r = cv.getBoundingClientRect(); brainTap(e.clientX - r.left, e.clientY - r.top); } };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', (e) => { BR.ptr.delete(e.pointerId); BR.pinch = null; });
  cv.addEventListener('wheel', (e) => { e.preventDefault(); BR.zoomT = null; BR.zoom = brClamp(BR.zoom * (e.deltaY < 0 ? 1.1 : 0.91), 0.45, 3.2); BR.idleT = performance.now(); }, { passive: false });
  window.addEventListener('resize', () => { if (document.getElementById('brainCv')) brainResize(); });
}
function brainTap(sx, sy) {
  let best = null, bd = 1e9;
  for (const n of BR.nodes) { if (!(n.ap > 0.5)) continue; const d = Math.hypot(n.sx - sx, n.sy - sy); const hit = Math.max(18, n.r * n.ss * 1.25 + 12); if (d < hit && d - (n.sz < 0 ? 4 : 0) < bd) { best = n; bd = d; } }
  if (best) brainSelect(best.id); else { BR.sel = null; const c = document.getElementById('brainCard'); if (c && BR.nodes.length > 1) c.hidden = true; }
}
BR.tourStop = () => { if (BR.tour) { clearInterval(BR.tour); BR.tour = null; const b = document.getElementById('bcTour'); if (b) b.innerHTML = `${icon('play', 'sm')}<span>Recorrido</span>`; } };
Object.assign(VIDA_ACTS, {
  'brain-go': (el) => { BR.tourStop(); brainSelect(el.dataset.id); },
  'brain-close': () => { BR.sel = null; const c = document.getElementById('brainCard'); if (c) c.hidden = true; },
  'brain-reset': () => { BR.tourStop(); BR.sel = null; const c = document.getElementById('brainCard'); if (c) c.hidden = true; brainFit(); },
  'brain-open': (el) => {
    const n = BR.byId.get(el.dataset.id); if (!n) return;
    if (n.type === 'task') openTask(n.ref); else if (n.type === 'note') openNote(n.ref); else if (n.type === 'thought') location.hash = '#/mente'; else if (n.type === 'subject') location.hash = `#/materia/${n.ref}`;
  },
  'brain-tour': () => {
    if (BR.tour) { BR.tourStop(); return; }
    const list = BR.nodes.filter((n) => n.type === 'thought' || (n.type === 'task' && n.done) || n.type === 'note').sort((a, b) => (a.at || 0) - (b.at || 0));
    if (!list.length) { toast('Todavía no hay recuerdos para recorrer. Escribe un pensamiento o entrega una tarea.'); return; }
    let i = 0; const b = document.getElementById('bcTour'); if (b) b.innerHTML = `${icon('pause', 'sm')}<span>Detener</span>`;
    const step = () => { if (!document.getElementById('brainCv')) { BR.tourStop(); return; } brainSelect(list[i % list.length].id); i++; if (i > list.length && i > 40) BR.tourStop(); };
    step(); BR.tour = setInterval(step, 3400);
  },
});
function viewCerebro() { return brainViewHTML(); }
