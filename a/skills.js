/* Cinnavia 7.16 — Skills: el árbol de habilidades gigante.
   Cada materia es una rama enorme con más de 70 habilidades (entregas, puntualidad, calificaciones,
   apuntes, enfoque, quizzes, exámenes, proyectos…). Lo que logras se enciende con luces cálidas.
   Es tan grande que se explora como un mapa: arrastra, pellizca para acercar y toca cualquier luz. */
'use strict';
const SK_CATS = [
  ['entregas', 'Entregas', 'Tareas entregadas', [1, 3, 5, 8, 12, 16, 20, 25, 30, 40, 50, 65, 80, 100, 130, 160, 200]],
  ['puntual', 'Puntualidad', 'Entregadas a tiempo', [1, 3, 5, 10, 15, 20, 30, 40, 50, 75, 100]],
  ['anticipa', 'Anticipación', 'Entregadas con un día o más de anticipación', [1, 2, 3, 5, 8, 12, 18, 25, 35, 50]],
  ['notas', 'Calificaciones', 'Calificaciones aprobatorias', [1, 2, 3, 5, 8, 12, 16, 20, 30]],
  ['promedio', 'Promedio', 'Promedio de la materia', [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]],
  ['apuntes', 'Apuntes', 'Apuntes y páginas de libreta', [1, 2, 3, 5, 8, 12, 16, 20, 30, 40, 55, 75, 100, 150]],
  ['enfoque', 'Enfoque', 'Minutos de enfoque', [25, 50, 100, 150, 250, 400, 600, 800, 1000, 1500, 2000, 3000, 4500, 6000]],
  ['quiz', 'Quiz', 'Respuestas correctas en quizzes', [1, 5, 10, 20, 35, 50, 75, 100, 150, 200, 300, 500]],
  ['examenes', 'Exámenes', 'Exámenes presentados', [1, 2, 3, 4, 6, 8, 10, 15]],
  ['proyectos', 'Proyectos', 'Proyectos y exposiciones', [1, 2, 3, 5, 8, 12]],
];
const SK_TITLES = ['Semilla', 'Brote', 'Raíz', 'Tallo', 'Hoja', 'Rama', 'Flor', 'Fruto', 'Roble', 'Bosque', 'Montaña', 'Río', 'Cielo', 'Estrella', 'Constelación', 'Galaxia', 'Leyenda'];
function skMetrics(sid) {
  const ts = S.tasks.filter((t) => t.subjectId === sid && t.done);
  const pass = S.settings.passGrade || 6;
  const g = S.tasks.filter((t) => t.subjectId === sid && typeof hasGrade === 'function' && hasGrade(t)).map((t) => +t.grade);
  const lead = (t) => (t.due && t.doneAt ? diffDays(toISO(new Date(t.doneAt)), t.due) : null);
  const q = (S.quiz && S.quiz.subj && S.quiz.subj[sid]) || { ok: 0 };
  const max = S.settings.gradeMax || 10;
  return {
    entregas: ts.length, puntual: ts.filter((t) => lead(t) !== null && lead(t) >= 0).length, anticipa: ts.filter((t) => lead(t) !== null && lead(t) >= 1).length,
    notas: g.filter((x) => x >= pass).length, promedio: g.length >= 2 ? (g.reduce((a, x) => a + x, 0) / g.length) * (10 / max) : 0,
    apuntes: (S.notes || []).filter((n) => n.subjectId === sid).length + (S.pages || []).filter((p) => !p.deleted && p.subjectId === sid).length,
    enfoque: (S.focus || []).filter((f) => f.s === sid).reduce((a, f) => a + (f.m || 0), 0), quiz: q.ok || 0,
    examenes: ts.filter((t) => t.type === 'examen').length, proyectos: ts.filter((t) => t.type === 'proyecto' || t.type === 'exposicion').length,
  };
}
const SKV = { s: 1, x: 0, y: 0, built: null };
function skBuild() {
  const subs = S.subjects.slice(0, 12); const n = Math.max(1, subs.length);
  const W = 4400, H = 3800, cx = W / 2, base = H - 160, top = base - 1100;
  const R = rnd(seedOf('skmap:' + subs.map((s) => s.id).join()));
  let back = '', lines = '', lights = '', labels = '', leaves = '';
  let total = 0, lit = 0; const nodes = [];
  // tronco y raíces
  back += `<path class="km-trunk" d="M${cx - 70} ${base}C${cx - 90} ${base - 300} ${cx - 30} ${top + 300} ${cx - 16} ${top}L${cx + 16} ${top}C${cx + 30} ${top + 300} ${cx + 90} ${base - 300} ${cx + 70} ${base}Z"/>`;
  for (let k = 0; k < 7; k++) { const s = k % 2 ? 1 : -1; const len = 140 + R() * 220; back += `<path class="km-root" d="M${cx + s * 20} ${base - 10}C${cx + s * (60 + k * 20)} ${base + 20} ${cx + s * (len * 0.7)} ${base + 40 + k * 6} ${cx + s * len} ${base + 70 + R() * 40}"/>`; }
  back += `<path class="km-ground" d="M0 ${base + 30}C${W * 0.3} ${base - 10} ${W * 0.7} ${base - 10} ${W} ${base + 30}V${H}H0Z"/>`;
  subs.forEach((s, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1); const spread = Math.min(178, 60 + n * 18); const ang = ((-spread / 2 + spread * t) * Math.PI) / 180;
    const sy = top + 40 + Math.abs(t - 0.5) * 2 * 360; const sx = cx + Math.sin(ang) * 20;
    const len = 1650 - Math.abs(t - 0.5) * 2 * 250;
    const ex = sx + Math.sin(ang) * len, ey = sy - Math.cos(ang) * len * 0.95;
    const c1 = [sx + Math.sin(ang) * len * 0.3, sy - len * 0.25], c2 = [sx + Math.sin(ang) * len * 0.75, ey + len * 0.15];
    const P = (u) => { const a = 1 - u; return [a * a * a * sx + 3 * a * a * u * c1[0] + 3 * a * u * u * c2[0] + u * u * u * ex, a * a * a * sy + 3 * a * a * u * c1[1] + 3 * a * u * u * c2[1] + u * u * u * ey]; };
    const col = safeColor(s.color); const m = skMetrics(s.id);
    const limb = `M${sx.toFixed(0)} ${sy.toFixed(0)}C${c1[0].toFixed(0)} ${c1[1].toFixed(0)} ${c2[0].toFixed(0)} ${c2[1].toFixed(0)} ${ex.toFixed(0)} ${ey.toFixed(0)}`;
    let subLit = 0, subTot = 0;
    SK_CATS.forEach(([key, cname, desc, ths], ci) => {
      const u = 0.12 + (ci / SK_CATS.length) * 0.84; const [bx, by] = P(u); const [bx2, by2] = P(Math.min(1, u + 0.01));
      const tang = Math.atan2(by2 - by, bx2 - bx); const side = ci % 2 ? 1 : -1; const bang = tang + side * (0.95 + R() * 0.25);
      const blen = 60 + ths.length * 36; const step = blen / ths.length;
      const qx = bx + Math.cos(bang) * blen * 0.5 + Math.cos(bang + side * 0.6) * 30, qy = by + Math.sin(bang) * blen * 0.5 + Math.sin(bang + side * 0.6) * 30;
      const fx = bx + Math.cos(bang) * blen, fy = by + Math.sin(bang) * blen;
      const Q = (v) => { const a = 1 - v; return [a * a * bx + 2 * a * v * qx + v * v * fx, a * a * by + 2 * a * v * qy + v * v * fy]; };
      const val = m[key]; let lastLit = 0;
      const pts = ths.map((th, k) => { const [x, y] = Q((k + 1) / (ths.length + 0.4)); const on = val >= th; if (on) lastLit = (k + 1) / (ths.length + 0.4); return { x, y, on, th, k }; });
      const bpath = `M${bx.toFixed(0)} ${by.toFixed(0)}Q${qx.toFixed(0)} ${qy.toFixed(0)} ${fx.toFixed(0)} ${fy.toFixed(0)}`;
      lines += `<path class="km-br" d="${bpath}"/>`;
      if (lastLit) lines += `<path class="km-br-on" pathLength="1" style="stroke-dasharray:${lastLit.toFixed(3)} 2;--c:${col}" d="${bpath}"/>`;
      // hojas sobre la rama
      for (let k = 0; k < 3; k++) { const [lx, ly] = Q(0.2 + k * 0.3); leaves += lnLeaf(lx, ly, (bang * 180) / Math.PI + (k % 2 ? 55 : -55), 22, R() < 0.2 ? 'lf2' : 'lf'); }
      labels += `<text class="km-cat" x="${(fx + Math.cos(bang) * 34).toFixed(0)}" y="${(fy + Math.sin(bang) * 34 + 8).toFixed(0)}" text-anchor="${Math.cos(bang) > 0.3 ? 'start' : Math.cos(bang) < -0.3 ? 'end' : 'middle'}">${cname}</text>`;
      for (const p of pts) {
        total++; subTot++; if (p.on) { lit++; subLit++; }
        const id = `${s.id}|${key}|${p.k}`; nodes.push({ id, s, key, cname, desc, th: p.th, on: p.on, val, x: p.x, y: p.y, k: p.k });
        lights += p.on
          ? `<g class="km-l on ${(p.k + ci) % 3 === 0 ? 'tw' : ''}" data-sk="${id}" style="--d:${(R() * 3).toFixed(2)}s"><circle cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="30" fill="url(#kmGlow)"/><circle class="km-bulb" cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="9"/><circle cx="${(p.x - 2.5).toFixed(0)}" cy="${(p.y - 2.5).toFixed(0)}" r="3" class="km-shine"/></g>`
          : `<g class="km-l" data-sk="${id}"><circle class="km-hit" cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="20"/><circle class="km-off" cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" r="7"/></g>`;
        { const nx = -Math.sin(bang), ny = Math.cos(bang); const sd = p.k % 2 ? 1 : -1; labels += `<text class="km-nl ${p.on ? 'on' : ''}" x="${(p.x + nx * 20 * sd).toFixed(0)}" y="${(p.y + ny * 20 * sd + 5).toFixed(0)}" text-anchor="middle">${skShort(key, p.th)}</text>`; }
      }
    });
    back += `<path class="km-limb" d="${limb}" style="stroke-width:${Math.max(18, 46 - n * 2)}"/>`;
    if (subLit) back += `<path class="km-limb-on" pathLength="1" d="${limb}" style="--c:${col};stroke-dasharray:${Math.min(1, 0.15 + subLit / subTot).toFixed(3)} 2"/>`;
    const lx = ex + Math.sin(ang) * 70, ly = ey - 60;
    labels += `<g class="km-sub" data-sub="${s.id}"><text class="km-sname" x="${lx.toFixed(0)}" y="${ly.toFixed(0)}" text-anchor="middle" style="fill:${col}">${esc(s.name)}</text><text class="km-scount" x="${lx.toFixed(0)}" y="${(ly + 34).toFixed(0)}" text-anchor="middle">${subLit} de ${subTot} · ${SK_TITLES[Math.min(SK_TITLES.length - 1, Math.floor((subLit / subTot) * (SK_TITLES.length - 1)))]}</text></g>`;
    SKV.limbs = SKV.limbs || {}; SKV.limbs[s.id] = { x: (sx + ex) / 2, y: (sy + ey) / 2 };
  });
  // estrellas y luciérnagas
  let sky = ''; for (let k = 0; k < 160; k++) sky += `<circle class="km-star" cx="${(R() * W).toFixed(0)}" cy="${(R() * (H * 0.7)).toFixed(0)}" r="${(1 + R() * 2.2).toFixed(1)}" style="--d:${(R() * 5).toFixed(2)}s"/>`;
  let flies = ''; for (let k = 0; k < Math.min(60, 8 + lit / 3); k++) flies += `<circle class="km-fly" cx="${(cx - 1200 + R() * 2400).toFixed(0)}" cy="${(top - 500 + R() * 1300).toFixed(0)}" r="3" style="--d:${(R() * 6).toFixed(2)}s"/>`;
  const svg = `<svg class="km-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-label="Árbol de habilidades">
    <defs><radialGradient id="kmGlow"><stop offset="0" stop-color="#FFD98A" stop-opacity=".95"/><stop offset=".35" stop-color="#F6B85A" stop-opacity=".45"/><stop offset="1" stop-color="#F6B85A" stop-opacity="0"/></radialGradient>
      <radialGradient id="kmSky" cx="50%" cy="40%" r="75%"><stop offset="0" class="km-sky-a"/><stop offset="1" class="km-sky-b"/></radialGradient>
      <filter id="kmBlur"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <rect width="${W}" height="${H}" fill="url(#kmSky)"/>${sky}
    <circle cx="${cx}" cy="${top - 100}" r="${700 + lit * 2}" fill="url(#kmGlow)" opacity="${Math.min(0.5, 0.08 + lit / 400).toFixed(2)}" filter="url(#kmBlur)"/>
    ${back}<g class="km-lines">${lines}</g><g class="km-leaves">${leaves}</g><g class="km-lights">${lights}</g>${flies}<g class="km-labels">${labels}</g></svg>`;
  const xs = nodes.map((q) => q.x), ys = nodes.map((q) => q.y); const bb = { x0: Math.min(...xs, cx - 300) - 120, x1: Math.max(...xs, cx + 300) + 120, y0: Math.min(...ys) - 160, y1: base + 120 };
  SKV.built = { svg, W, H, total, lit, nodes, n: subs.length, bb };
  return SKV.built;
}
function skShort(key, th) { return key === 'enfoque' ? (th >= 60 ? `${Math.round((th / 60) * 10) / 10}h` : `${th}m`) : String(th); }
function skLabel(key, th) {
  return { entregas: `${th} ${th === 1 ? 'entrega' : 'entregas'}`, puntual: `${th} a tiempo`, anticipa: `${th} con anticipación`, notas: `${th} ${th === 1 ? 'aprobada' : 'aprobadas'}`, promedio: `Promedio ${th}`, apuntes: `${th} ${th === 1 ? 'apunte' : 'apuntes'}`, enfoque: `${th >= 60 ? `${Math.round(th / 60 * 10) / 10} h` : `${th} min`} de enfoque`, quiz: `${th} ${th === 1 ? 'acierto' : 'aciertos'}`, examenes: `${th} ${th === 1 ? 'examen' : 'exámenes'}`, proyectos: `${th} ${th === 1 ? 'proyecto' : 'proyectos'}` }[key];
}
function viewSkills() {
  if (!S.subjects.length) return `<h1 class="page-title">Skills</h1><div class="empty"><h3>Tu árbol espera sus ramas</h3><p>Agrega tus materias y cada una se convertirá en una rama gigante con más de 100 habilidades por desbloquear.</p><p><a class="btn primary" href="#/materias">Agregar materias</a></p></div>`;
  const b = skBuild();
  setTimeout(skMount, 20);
  return `<section class="km-wrap"><header class="km-head"><div><h1 class="page-title">Skills</h1><p class="km-meta"><b>${b.lit}</b> de ${b.total} habilidades encendidas</p></div>
      <div class="km-ctrl"><button class="icon-btn" data-act="km-zoom" data-v="1.4" aria-label="Acercar">${icon('plus')}</button><button class="icon-btn" data-act="km-zoom" data-v="0.7" aria-label="Alejar"><svg class="i" viewBox="0 0 24 24"><path d="M6 12h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button><button class="icon-btn" data-act="km-fit" aria-label="Ver todo">${icon('grid')}</button></div></header>
    <div class="km-chips">${S.subjects.slice(0, 12).map((s) => `<button type="button" class="km-chip" data-act="km-go" data-id="${s.id}" style="--c:${safeColor(s.color)}">${esc(s.name)}</button>`).join('')}</div>
    <div class="km-map" id="kmMap"><div class="km-stage" id="kmStage">${b.svg}</div><p class="km-hint">Arrastra para moverte · pellizca para acercar · toca una luz</p></div></section>`;
}
EXTRA_VIEWS.skills = viewSkills; EXTRA_NAV.skills = 'skills';
function skApply(anim) {
  const st = document.getElementById('kmStage'); if (!st) return;
  st.style.transition = anim ? 'transform .55s cubic-bezier(.2,.7,.2,1)' : 'none';
  st.style.transform = `translate(${SKV.x}px, ${SKV.y}px) scale(${SKV.s})`;
  const map = document.getElementById('kmMap'); if (map) map.dataset.z = SKV.s > 0.7 ? 'near' : SKV.s > 0.25 ? 'mid' : 'far';
}
function skFit(anim) {
  const map = document.getElementById('kmMap'); const b = SKV.built; if (!map || !b) return;
  const w = map.clientWidth, h = map.clientHeight; const bw = b.bb.x1 - b.bb.x0, bh = b.bb.y1 - b.bb.y0; const s = Math.min(w / bw, h / bh);
  SKV.s = s; SKV.x = (w - bw * s) / 2 - b.bb.x0 * s; SKV.y = (h - bh * s) / 2 - b.bb.y0 * s; skApply(anim);
}
function skZoomAt(f, px, py, anim) {
  const ns = Math.max(0.08, Math.min(2.6, SKV.s * f)); const k = ns / SKV.s;
  SKV.x = px - (px - SKV.x) * k; SKV.y = py - (py - SKV.y) * k; SKV.s = ns; skApply(anim);
}
function skMount() {
  const map = document.getElementById('kmMap'); if (!map || map.dataset.on) return; map.dataset.on = '1';
  if (!SKV.fitOnce || SKV.fitOnce !== SKV.built.n) { SKV.fitOnce = SKV.built.n; skFit(false); } else skApply(false);
  const pts = new Map(); let last = null, moved = 0, pinch = null;
  map.addEventListener('pointerdown', (e) => { map.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; last = { x: e.clientX, y: e.clientY }; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }; } });
  map.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = map.getBoundingClientRect();
    if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); skZoomAt(d / pinch.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, false); pinch.d = d; moved += 10; return; }
    if (last) { const dx = e.clientX - last.x, dy = e.clientY - last.y; moved += Math.abs(dx) + Math.abs(dy); SKV.x += dx; SKV.y += dy; last = { x: e.clientX, y: e.clientY }; skApply(false); }
  });
  const up = (e) => {
    pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
    if (!pts.size && moved < 8) { const g = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-sk]'); if (g) skOpen(g.dataset.sk); else { const sub = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-sub]'); if (sub) skGo(sub.dataset.sub); } }
    if (pts.size === 1) { const [p] = [...pts.values()]; last = { x: p.x, y: p.y }; } else last = null;
  };
  map.addEventListener('pointerup', up); map.addEventListener('pointercancel', up);
  map.addEventListener('wheel', (e) => { e.preventDefault(); const r = map.getBoundingClientRect(); skZoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top, false); }, { passive: false });
  let lastTap = 0; map.addEventListener('pointerup', (e) => { const now = Date.now(); if (now - lastTap < 280 && moved < 8) { const r = map.getBoundingClientRect(); skZoomAt(1.8, e.clientX - r.left, e.clientY - r.top, true); } lastTap = now; });
}
function skGo(sid) {
  const l = SKV.limbs && SKV.limbs[sid]; const map = document.getElementById('kmMap'); if (!l || !map) return;
  SKV.s = 0.34; SKV.x = map.clientWidth / 2 - l.x * SKV.s; SKV.y = map.clientHeight / 2 - l.y * SKV.s; skApply(true); Snd.tick();
}
function skOpen(id) {
  const nd = (SKV.built?.nodes || []).find((x) => x.id === id); if (!nd) return;
  const next = SK_CATS.find((c) => c[0] === nd.key)[3]; const cur = nd.val;
  const pct = Math.max(0, Math.min(100, Math.round((cur / nd.th) * 100)));
  Snd[nd.on ? 'chime' : 'tick']();
  openSheet(`${sheetHead(skLabel(nd.key, nd.th))}<div class="sheet-body"><div class="km-sk ${nd.on ? 'on' : ''}" style="--c:${safeColor(nd.s.color)}"><span class="km-orb"></span><div><b>${nd.on ? 'Habilidad encendida' : 'Por encender'}</b><span class="small muted">${esc(nd.s.name)} · ${nd.cname} · nivel ${nd.k + 1} de ${next.length}</span></div></div>
    <p class="muted">${esc(nd.desc)}: <b>${nd.key === 'promedio' ? (cur ? cur.toFixed(1) : 'sin datos') : Math.floor(cur)}</b> de ${nd.th}.</p>
    <div class="v-bar"><i style="width:${pct}%;background:${safeColor(nd.s.color)}"></i></div>
    <p class="small muted" style="margin-top:12px">${skHow(nd.key)}</p></div>`);
}
function skHow(key) { return { entregas: 'Entrega tareas de esta materia.', puntual: 'Entrega antes de la fecha límite o el mismo día.', anticipa: 'Termina con al menos un día de anticipación.', notas: 'Anota tus calificaciones en cada tarea entregada.', promedio: 'Se calcula con tus calificaciones anotadas (al menos 2).', apuntes: 'Escribe apuntes o páginas en la libreta de esta materia.', enfoque: 'Usa el Modo enfoque eligiendo esta materia.', quiz: 'Practica con el Quiz inteligente de esta materia.', examenes: 'Marca como entregados los exámenes de esta materia.', proyectos: 'Entrega proyectos y exposiciones.' }[key]; }
Object.assign(VIDA_ACTS, {
  'km-zoom': (el) => { const map = document.getElementById('kmMap'); if (map) skZoomAt(+el.dataset.v, map.clientWidth / 2, map.clientHeight / 2, true); },
  'km-fit': () => skFit(true),
  'km-go': (el) => skGo(el.dataset.id),
});
// botón «Skills» en la barra de abajo
if (!NAV_PERSONAL.some((x) => x[0] === 'skills')) NAV_PERSONAL.splice(3, 0, ['skills', 'skill', 'Skills']);
navMode = null;
