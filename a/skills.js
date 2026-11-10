/* Cinnavia 7.17 — Skills: el árbol mágico de tu mundo.
   Nivel 1: un árbol nocturno donde cada materia es un orbe luminoso (con su anillo de progreso) en su propia rama.
   Nivel 2: al tocar un orbe se abre la rama de esa materia, con sus 10 caminos de habilidades (más de 100),
   en una página normal que se desplaza con el dedo. Todo con botones grandes y sin pellizcar. */
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

const SKV = { sub: null };
const SK_SLOTS = [[210, 290], [140, 185], [280, 185], [140, 395], [280, 395], [70, 290], [350, 290], [210, 80], [70, 500], [350, 500], [140, 605], [280, 605]];
function skStats(sid) {
  const m = skMetrics(sid); let lit = 0, total = 0;
  for (const [key, , , ths] of SK_CATS) for (const th of ths) { total++; if (m[key] >= th) lit++; }
  return { m, lit, total, title: SK_TITLES[Math.min(SK_TITLES.length - 1, Math.floor((lit / total) * (SK_TITLES.length - 1)))] };
}
function skTree() {
  const subs = S.subjects.slice(0, 12); const n = subs.length;
  const H = n > 10 ? 780 : 680, W = 420, tx = 210; const R = rnd(seedOf('sktree:' + subs.map((x) => x.id).join()));
  const st = subs.map((x) => ({ s: x, ...skStats(x.id) })); const lit = st.reduce((q, x) => q + x.lit, 0), total = st.reduce((q, x) => q + x.total, 0);
  let sky = '', motes = '', back = '', orbs = '', leaves = '';
  for (let k = 0; k < 44; k++) sky += `<circle class="kt-star" cx="${(R() * W).toFixed(0)}" cy="${(R() * H * 0.78).toFixed(0)}" r="${(0.4 + R() * 1.1).toFixed(1)}" style="--d:${(R() * 5).toFixed(2)}s"/>`;
  for (let k = 0; k < Math.min(26, 8 + lit / 8); k++) motes += `<circle class="kt-mote" cx="${(40 + R() * 340).toFixed(0)}" cy="${(120 + R() * (H - 200)).toFixed(0)}" r="${(1 + R() * 1.3).toFixed(1)}" style="--d:${(R() * 7).toFixed(2)}s;--t:${(6 + R() * 5).toFixed(1)}s"/>`;
  const gh = H - 150;
  back += `<path class="kt-trunk" d="M${tx - 40} ${H}C${tx - 32} ${H - 90} ${tx - 14} ${gh - 40} ${tx - 13} ${gh - 120}L${tx + 13} ${gh - 120}C${tx + 14} ${gh - 40} ${tx + 32} ${H - 90} ${tx + 40} ${H}Z"/>`;
  for (let k = 0; k < 7; k++) { const dx = (R() - 0.5) * 22; back += `<path class="kt-bark" d="M${tx + dx} ${H - 16} C${tx + dx * 0.6} ${H - 110} ${tx + dx * 0.3} ${gh - 60} ${tx + dx * 0.5} ${gh - 112}"/>`; }
  for (let k = 0; k < 5; k++) { const sd = k % 2 ? 1 : -1, len = 60 + R() * 70; back += `<path class="kt-root" d="M${tx + sd * 20} ${H - 6}C${tx + sd * 50} ${H - 2} ${tx + sd * len * 0.7} ${H + 4} ${tx + sd * len} ${H + 10}"/>`; }
  st.forEach((o, i) => {
    const ox = SK_SLOTS[i][0], oy = SK_SLOTS[i][1]; const f = o.lit / o.total; const col = safeColor(o.s.color);
    const sy = gh - 90 - (i % 4) * 22;
    const d = `M${tx} ${sy}C${tx} ${(sy + oy) / 2 + 20} ${ox} ${oy + (sy - oy) * 0.45} ${ox} ${oy + 30}`;
    back += `<path class="sk-limb" d="${d}"/><path class="sk-limb-hi" d="${d}"/>`;
    if (o.lit) back += `<path class="sk-limb-on" pathLength="1" d="${d}" style="stroke-dasharray:${Math.min(1, 0.2 + f * 0.8).toFixed(3)} 2"/>`;
    for (let k = 0; k < 2; k++) { const u = 0.4 + k * 0.25; const px = tx + (ox - tx) * u + (k % 2 ? 8 : -8), py = sy + (oy - sy) * u; leaves += lnLeaf(px, py, (k % 2 ? 40 : -40) + (ox < tx ? -20 : 20), 10, R() < 0.5 ? 'lf2' : 'lf'); }
    const circ = 2 * Math.PI * 38;
    const nm = o.s.name.length > 13 ? o.s.name.slice(0, 12) + '…' : o.s.name;
    orbs += `<g class="sk-orb ${o.lit ? 'on' : ''}" data-act="skt-open" data-id="${o.s.id}" style="--d:${(R() * 3).toFixed(2)}s" role="button" tabindex="0" aria-label="${esc(o.s.name)}: ${o.lit} de ${o.total} habilidades">
      <circle class="sk-halo" cx="${ox}" cy="${oy}" r="${44 + Math.round(f * 14)}" fill="url(#skHalo)"/>
      <circle class="sk-ring-bg" cx="${ox}" cy="${oy}" r="38"/>
      <circle class="sk-ring" cx="${ox}" cy="${oy}" r="38" transform="rotate(-90 ${ox} ${oy})" stroke-dasharray="${(circ * f).toFixed(1)} ${circ.toFixed(1)}"/>
      <circle class="sk-core" cx="${ox}" cy="${oy}" r="30" fill="url(#skCore)"/>
      <text class="sk-lv" x="${ox}" y="${oy + 8}" text-anchor="middle">${o.lit}</text>
      <rect class="sk-pill" x="${ox - 56}" y="${oy + 46}" width="112" height="24" rx="12"/><circle class="sk-dot" cx="${ox - 44}" cy="${oy + 58}" r="4" fill="${col}"/><text class="sk-nm" x="${ox + 6}" y="${oy + 62}" text-anchor="middle">${esc(nm)}</text>
      <circle class="sk-hit" cx="${ox}" cy="${oy + 20}" r="56"/></g>`;
  });
  const svg = `<svg class="sk-svg" viewBox="0 0 ${W} ${H}" aria-label="Árbol de habilidades"><defs>
    <radialGradient id="skHalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#D6AE62" stop-opacity=".38"/><stop offset="1" stop-color="#D6AE62" stop-opacity="0"/></radialGradient>
    <radialGradient id="skCore" cx="50%" cy="38%" r="62%"><stop offset="0" stop-color="#3A2A18"/><stop offset="1" stop-color="#140D07"/></radialGradient>
    <radialGradient id="skSky" cx="50%" cy="36%" r="82%"><stop offset="0" stop-color="#2E2216"/><stop offset="1" stop-color="#0B0705"/></radialGradient>
    <radialGradient id="skCan" cx="50%" cy="50%"><stop offset="0" stop-color="#E0B865" stop-opacity=".7"/><stop offset="1" stop-color="#E0B865" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#skSky)"/>${sky}
    <ellipse cx="${tx}" cy="${H * 0.42}" rx="${150 + lit * 0.35}" ry="${220 + lit * 0.45}" fill="url(#skCan)" opacity="${Math.min(0.2, 0.04 + lit / 800).toFixed(2)}" class="sk-can"/>
    <path class="sk-ground" d="M0 ${H - 26}C${W * 0.3} ${H - 46} ${W * 0.7} ${H - 46} ${W} ${H - 26}V${H}H0Z"/>
    ${back}<g class="sk-leaves">${leaves}</g>${motes}${orbs}</svg>`;
  return { svg, lit, total };
}
function skPath(sid, ci) {
  const [key, cname, desc, ths] = SK_CATS[ci]; const { m } = skStats(sid); const val = m[key];
  const done = ths.filter((t) => val >= t).length; const nxt = ths.find((t) => val < t);
  return `<div class="sk-cat"><div class="sk-cat-h"><b>${cname}</b><span class="sk-cnt">${done}/${ths.length}</span></div>
    <p class="sk-cat-d">${esc(desc)} · llevas <b>${key === 'promedio' ? (val ? val.toFixed(1) : '—') : Math.floor(val)}</b>${nxt !== undefined ? ` · siguiente: <b>${skShort(key, nxt)}</b>` : ' · ¡completa!'}</p>
    <div class="sk-path">${ths.map((t, k) => { const on = val >= t, nx = !on && t === nxt; return `<span class="sk-c ${on ? 'on' : ''}"><button type="button" class="sk-n ${on ? 'on' : ''} ${nx ? 'next' : ''}" data-act="skt-node" data-id="${sid}|${key}|${k}" aria-label="${skLabel(key, t)}${on ? ', encendida' : ''}"><span>${skShort(key, t)}</span></button></span>`; }).join('')}</div></div>`;
}
function skShort(key, th) { return key === 'enfoque' ? (th >= 60 ? `${Math.round((th / 60) * 10) / 10}h` : `${th}m`) : String(th); }
function skLabel(key, th) {
  return { entregas: `${th} ${th === 1 ? 'entrega' : 'entregas'}`, puntual: `${th} a tiempo`, anticipa: `${th} con anticipación`, notas: `${th} ${th === 1 ? 'aprobada' : 'aprobadas'}`, promedio: `Promedio ${th}`, apuntes: `${th} ${th === 1 ? 'apunte' : 'apuntes'}`, enfoque: `${th >= 60 ? `${Math.round(th / 60 * 10) / 10} h` : `${th} min`} de enfoque`, quiz: `${th} ${th === 1 ? 'acierto' : 'aciertos'}`, examenes: `${th} ${th === 1 ? 'examen' : 'exámenes'}`, proyectos: `${th} ${th === 1 ? 'proyecto' : 'proyectos'}` }[key];
}
function viewSkills() {
  if (!S.subjects.length) return `<h1 class="page-title">Skills</h1><div class="empty"><h3>Tu árbol espera sus ramas</h3><p>Agrega tus materias y cada una se convertirá en un orbe de luz con más de 100 habilidades por desbloquear.</p><p><a class="btn primary" href="#/materias">Agregar materias</a></p></div>`;
  const subs = S.subjects.slice(0, 12);
  if (SKV.sub && !subs.some((x) => x.id === SKV.sub)) SKV.sub = null;
  if (SKV.sub) {
    const s = subs.find((x) => x.id === SKV.sub); const st = skStats(s.id); const col = safeColor(s.color); const pct = Math.round((st.lit / st.total) * 100);
    return `<section class="sk-night sk-sub" style="--c:${col}"><div class="sk-top"><button type="button" class="sk-back" data-act="skt-back" aria-label="Volver al árbol">${icon('back')}<span>Árbol</span></button></div>
      <header class="sk-hd"><span class="sk-bigorb"></span><h1>${esc(s.name)}</h1><p><b>${st.lit}</b> de ${st.total} encendidas · <i>${st.title}</i></p><div class="sk-bar"><i style="width:${pct}%"></i></div></header>
      <div class="sk-chips">${subs.map((x) => `<button type="button" class="sk-chip ${x.id === s.id ? 'me' : ''}" data-act="skt-open" data-id="${x.id}" style="--c:${safeColor(x.color)}">${esc(x.name)}</button>`).join('')}</div>
      ${SK_CATS.map((_, ci) => skPath(s.id, ci)).join('')}</section>`;
  }
  const t = skTree();
  return `<section class="sk-night"><header class="sk-hd sk-hd1"><h1>Tu árbol mágico</h1><p><b>${t.lit}</b> de ${t.total} habilidades encendidas</p><span class="sk-tip">Toca un orbe para entrar a su rama</span></header><div class="sk-tree">${t.svg}</div></section>`;
}
EXTRA_VIEWS.skills = viewSkills; EXTRA_NAV.skills = 'skills';
function skOpen(id) {
  const [sid, key, k] = id.split('|'); const s = S.subjects.find((x) => x.id === sid); const cat = SK_CATS.find((c) => c[0] === key); if (!s || !cat) return;
  const th = cat[3][+k]; const cur = skStats(sid).m[key]; const on = cur >= th;
  const pct = Math.max(0, Math.min(100, Math.round((cur / th) * 100)));
  Snd[on ? 'chime' : 'tick']();
  openSheet(`${sheetHead(skLabel(key, th))}<div class="sheet-body"><div class="km-sk ${on ? 'on' : ''}" style="--c:${safeColor(s.color)}"><span class="km-orb"></span><div><b>${on ? 'Habilidad encendida' : 'Por encender'}</b><span class="small muted">${esc(s.name)} · ${cat[1]} · nivel ${+k + 1} de ${cat[3].length}</span></div></div>
    <p class="muted">${esc(cat[2])}: <b>${key === 'promedio' ? (cur ? cur.toFixed(1) : 'sin datos') : Math.floor(cur)}</b> de ${th}.</p>
    <div class="v-bar"><i style="width:${pct}%;background:${safeColor(s.color)}"></i></div>
    <p class="small muted" style="margin-top:12px">${skHow(key)}</p></div>`);
}
function skHow(key) { return { entregas: 'Entrega tareas de esta materia.', puntual: 'Entrega antes de la fecha límite o el mismo día.', anticipa: 'Termina con al menos un día de anticipación.', notas: 'Anota tus calificaciones en cada tarea entregada.', promedio: 'Se calcula con tus calificaciones anotadas (al menos 2).', apuntes: 'Escribe apuntes o páginas en la libreta de esta materia.', enfoque: 'Usa el Modo enfoque eligiendo esta materia.', quiz: 'Practica con el Quiz inteligente de esta materia.', examenes: 'Marca como entregados los exámenes de esta materia.', proyectos: 'Entrega proyectos y exposiciones.' }[key]; }
Object.assign(VIDA_ACTS, {
  'skt-open': (el) => { SKV.sub = el.dataset.id; Snd.tick(); render(); window.scrollTo(0, 0); },
  'skt-back': () => { SKV.sub = null; render(); window.scrollTo(0, 0); },
  'skt-node': (el) => skOpen(el.dataset.id),
});
// botón «Skills» en la barra de abajo
if (!NAV_PERSONAL.some((x) => x[0] === 'skills')) NAV_PERSONAL.splice(3, 0, ['skills', 'skill', 'Skills']);
navMode = null;
