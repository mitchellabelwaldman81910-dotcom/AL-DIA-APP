/* Cinnavia 7.15 — Bosques más útiles.
   · Radar de roles: los trabajos en equipo se dividen por áreas (investigación, redacción, diseño, entrega),
     se reparten de forma equitativa y, si alguien se atrasa, recibe un aviso discreto y el equipo puede reasignar.
   · «Estudia conmigo»: Pomodoro sincronizado. Todo el Bosque se concentra y descansa al mismo tiempo.
   · Calendario del Bosque (con importación de archivos .ics), encuestas rápidas y anuncio fijado.
   · Pizarrón: comentarios en cada tarjeta, actividad en vivo y vista de Ramas (todo conectado como enredadera). */
'use strict';
const AREAS = { investigacion: ['Investigación', '#3E6FC6'], redaccion: ['Redacción', '#2F8A5B'], diseno: ['Diseño', '#B07AC8'], entrega: ['Entrega', '#D27C5E'], otro: ['Otro', '#7A8CA8'] };
const memberIdByName = (n) => { if (n === me()) return REG.me; const hit = Object.entries(FOR.members || {}).find(([, m]) => m && m.name === n); return hit ? hit[0] : ''; };
const memberNameById = (id) => (id === REG.me ? me() : (FOR.members || {})[id]?.name || id);

/* ===================== Radar de roles ===================== */
function radarSVG(parts) {
  const keys = Object.keys(AREAS).filter((k) => k !== 'otro' || parts.some((p) => (p.area || 'otro') === 'otro'));
  const N = keys.length; const R = 74, C = 100;
  const val = (k) => { const ps = parts.filter((p) => (p.area || 'otro') === k); return ps.length ? ps.filter((p) => p.done).length / ps.length : 0; };
  const pt = (i, r) => { const a = -Math.PI / 2 + (i / N) * Math.PI * 2; return [C + Math.cos(a) * r, C + Math.sin(a) * r]; };
  let g = '';
  for (const k of [0.33, 0.66, 1]) g += `<polygon class="rd-ring" points="${keys.map((_, i) => pt(i, R * k).map((x) => x.toFixed(1)).join(',')).join(' ')}"/>`;
  keys.forEach((k, i) => { const [x, y] = pt(i, R); const [lx, ly] = pt(i, R + 16); g += `<line class="rd-ax" x1="${C}" y1="${C}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="rd-lbl" x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" style="fill:${AREAS[k][1]}">${AREAS[k][0]}</text>`; });
  const poly = keys.map((k, i) => pt(i, Math.max(6, R * val(k))).map((x) => x.toFixed(1)).join(',')).join(' ');
  g += `<polygon class="rd-val" points="${poly}"/>`;
  keys.forEach((k, i) => { const [x, y] = pt(i, Math.max(6, R * val(k))); g += `<circle class="rd-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" style="fill:${AREAS[k][1]}"/>`; });
  return `<svg viewBox="0 0 200 200" class="rd-svg" role="img" aria-label="Avance por área">${g}</svg>`;
}
function loadHTML(parts, mem) {
  const ids = mem.map((j) => memberIdByName(j.name) || j.name);
  const load = ids.map((id) => ({ id, n: parts.filter((p) => p.ownerId === id && !p.done).length, d: parts.filter((p) => p.ownerId === id && p.done).length }));
  const max = Math.max(1, ...load.map((l) => l.n + l.d));
  const fair = load.length ? Math.max(...load.map((l) => l.n + l.d)) - Math.min(...load.map((l) => l.n + l.d)) <= 1 : true;
  return `<div class="rd-load"><span class="rd-fair ${fair ? 'ok' : ''}">${fair ? 'Reparto equitativo' : 'Reparto disparejo'}</span>${load.map((l) => `<div class="rd-row">${mini(memberNameById(l.id), 'xs')}<span class="rd-n">${esc(memberNameById(l.id))}</span><span class="rd-bar"><i class="d" style="width:${(l.d / max) * 100}%"></i><i style="width:${(l.n / max) * 100}%"></i></span><span class="tiny faint">${l.d}/${l.n + l.d}</span></div>`).join('')}</div>`;
}
{
  const baseEquipo = viewEquipo;
  viewEquipo = function (id) {
    const html = baseEquipo(id); const tm = gGet(id); if (!tm || tm.deleted) return html;
    const mem = gAll('join').filter((j) => j.team === id);
    const parts = gAll('part').filter((p) => p.team === id).sort((a, b) => (a.dueP || '9').localeCompare(b.dueP || '9') || a.at - b.at);
    const t0 = today();
    const late = parts.filter((p) => !p.done && p.dueP && p.dueP < t0);
    const mineLate = late.filter((p) => p.ownerId === REG.me);
    const alerts = mineLate.length ? `<div class="rd-alert mine">${icon('bell', 'sm')}<span><b>Tu parte va atrasada: ${esc(mineLate[0].text)}</b>Tu equipo cuenta contigo. Si se te complicó, está bien pedir ayuda.</span><span class="rd-alert-b"><button class="btn primary" data-act="g-part-done" data-id="${mineLate[0].id}">Ya la terminé</button><button class="btn" data-act="rd-release" data-id="${mineLate[0].id}">Que la tome alguien más</button></span></div>`
      : late.length ? `<div class="rd-alert">${icon('flag', 'sm')}<span><b>${plural(late.length, 'parte atrasada', 'partes atrasadas')}</b>Para que el equipo no se quede colgado a última hora, pueden reasignarla.</span><span class="rd-alert-b"><button class="btn" data-act="rd-reassign" data-id="${late[0].id}">Reasignar</button></span></div>` : '';
    const radar = `<h2 class="sec">Radar de roles <small>avance por área</small></h2><section class="rd-card">${parts.length ? radarSVG(parts) : '<p class="muted" style="margin:0">Agrega partes por área y aquí verás cómo va cada una.</p>'}${mem.length ? loadHTML(parts, mem) : ''}</section>
      ${alerts}
      <div class="btn-row" style="margin:10px 0 4px"><button class="btn" data-act="rd-auto" data-id="${id}">${icon('users', 'sm')}Repartir de forma equitativa</button><button class="btn" data-act="rd-template" data-id="${id}">${icon('plus', 'sm')}Crear áreas típicas</button></div>`;
    const rows = `<ul class="tasks rd-parts">${parts.map((p) => { const ar = AREAS[p.area || 'otro'] || AREAS.otro; const isLate = !p.done && p.dueP && p.dueP < t0; const ownerN = p.ownerId ? memberNameById(p.ownerId) : p.owner;
      return `<li class="task ${p.done ? 'done' : ''} ${isLate ? 'late' : ''}"><button type="button" class="chk" data-act="g-part-done" data-id="${p.id}" role="checkbox" aria-checked="${!!p.done}" aria-label="Parte terminada"><span class="box">${icon('check')}</span></button>
        <div class="body" style="cursor:default"><span class="title">${esc(p.text)}</span><span class="meta"><span class="rd-area" style="--c:${ar[1]}">${ar[0]}</span>${p.dueP ? `<span class="tag ${isLate ? 'late' : ''}">${isLate ? 'Atrasada · ' : ''}${esc(relDay(p.dueP))}</span>` : ''}
        ${ownerN ? `<span class="who-line">${mini(ownerN, 'xs')}${esc(ownerN)}</span>` : `<button class="link-btn" data-act="g-part-take" data-id="${p.id}">Lo tomo yo</button>`}<button class="link-btn" data-act="rd-reassign" data-id="${p.id}">Reasignar</button></span></div>
        ${p.by === me() ? `<button class="icon-btn ghost" data-act="g-del" data-id="${p.id}" aria-label="Quitar parte">${icon('x', 'sm')}</button>` : ''}</li>`; }).join('')}</ul>
      <form class="rd-form" id="rdPartForm"><input id="rdPartIn" class="input" placeholder="Nueva parte: ej. Buscar 3 fuentes confiables" maxlength="140">
        <div class="rd-form-row"><select id="rdArea" class="input">${Object.entries(AREAS).map(([k, [l]]) => `<option value="${k}">${l}</option>`).join('')}</select><input id="rdDue" type="date" class="input" value="${tm.due ? addDays(tm.due, -1) : ''}"><select id="rdOwner" class="input"><option value="">Sin asignar</option>${mem.map((j) => `<option value="${esc(memberIdByName(j.name) || '')}">${esc(j.name)}</option>`).join('')}</select><button class="btn primary">Agregar</button></div></form>`;
    // reemplaza el reparto viejo por el nuevo
    const a = html.indexOf('<h2 class="sec">Reparto'); const b = html.indexOf('<h2 class="sec">Muro del equipo');
    if (a < 0 || b < 0) return html + radar + rows;
    return html.slice(0, a) + radar + `<h2 class="sec">Reparto <small>quién hace qué y para cuándo</small></h2>` + rows + html.slice(b);
  };
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'rdPartForm') return; e.preventDefault();
  const v = $('#rdPartIn').value.trim(); if (!v) return;
  const ownerId = $('#rdOwner').value; gput({ id: gid(), type: 'part', team: route().arg, text: v, area: $('#rdArea').value, dueP: $('#rdDue').value || null, ownerId, owner: ownerId ? memberNameById(ownerId) : '', done: false });
  Snd.drop();
}, true);
Object.assign(VIDA_ACTS, {
  'g-part-take': (el) => { const p = gGet(el.dataset.id); gput({ ...p, owner: me(), ownerId: REG.me }); Snd.tick(); },
  'rd-release': (el) => { const p = gGet(el.dataset.id); gput({ ...p, owner: '', ownerId: '', help: true }); toast('Listo. Tu equipo verá que la parte necesita a alguien.'); },
  'rd-reassign': async (el) => {
    const p = gGet(el.dataset.id); if (!p) return; const mem = gAll('join').filter((j) => j.team === p.team);
    if (!mem.length) { toast('Primero únanse al trabajo.'); return; }
    const v = await ask({ title: `¿Quién se encarga de «${p.text}»?`, options: [...mem.map((j) => ({ value: memberIdByName(j.name) || j.name, label: j.name })), { value: '_none', label: 'Dejarla sin asignar' }] });
    if (!v) return; gput({ ...p, ownerId: v === '_none' ? '' : v, owner: v === '_none' ? '' : memberNameById(v) }); Snd.tick();
  },
  'rd-auto': (el) => {
    const id = el.dataset.id; const mem = gAll('join').filter((j) => j.team === id).map((j) => memberIdByName(j.name)).filter(Boolean);
    if (!mem.length) { toast('Primero únanse al trabajo para repartirlo.'); return; }
    const parts = gAll('part').filter((p) => p.team === id && !p.done);
    const load = Object.fromEntries(mem.map((m) => [m, parts.filter((p) => p.ownerId === m).length]));
    let n = 0;
    for (const p of parts.filter((x) => !x.ownerId)) { const m = mem.slice().sort((a, b) => load[a] - load[b])[0]; load[m]++; gput({ ...p, ownerId: m, owner: memberNameById(m) }); n++; }
    toast(n ? `Repartí ${plural(n, 'parte', 'partes')} para que a todos les toque lo mismo.` : 'Todas las partes ya tienen a alguien.'); if (n) Snd.chime();
  },
  'rd-template': (el) => {
    const tm = gGet(el.dataset.id); const due = tm?.due || null;
    const base = [['investigacion', 'Investigar y juntar fuentes', -5], ['redaccion', 'Redactar el contenido', -3], ['diseno', 'Diseñar presentación o formato', -2], ['entrega', 'Revisar y entregar', 0]];
    for (const [area, text, d] of base) gput({ id: gid(), type: 'part', team: el.dataset.id, text, area, dueP: due ? addDays(due, d) : null, owner: '', ownerId: '', done: false });
    Snd.chime(); toast('Listo: 4 áreas creadas. Ahora repártanlas.');
  },
});

/* ===================== Estudia conmigo (Pomodoro sincronizado) ===================== */
const POMO = { t: null };
const pomoId = () => `pomo-${curFid()}`;
const pomoGet = () => { const p = gGet(pomoId()); return p && p.active ? p : null; };
function pomoPhase(p, now = Date.now()) {
  const W = (p.work || 25) * 60000, Rr = (p.rest || 5) * 60000, cyc = p.cycles || 4; const el = now - p.start;
  const per = W + Rr; const k = Math.floor(el / per); if (k >= cyc) return { done: true };
  const inP = el - k * per; return inP < W ? { phase: 'work', k: k + 1, cyc, left: W - inP, total: W } : { phase: 'rest', k: k + 1, cyc, left: per - inP, total: Rr };
}
const pomoPeople = () => gAll('pomo').filter((x) => x.kind === 'join' && x.pomo === (pomoGet() || {}).start && Date.now() - (x.at || 0) < 3 * 3600000);
function pomoCardHTML() {
  const p = pomoGet(); const ph = p ? pomoPhase(p) : null; const ppl = p ? pomoPeople() : [];
  if (p && !ph.done) pomoTick();
  return `<a class="pomo-card ${p && !ph.done ? 'live ' + ph.phase : ''}" href="#/estudio"><span class="pomo-ico">${icon('timer')}</span><span class="txt"><b>Estudia conmigo</b><span class="small">${p && !ph.done ? `${ph.phase === 'work' ? 'Concentrados' : 'Pausa juntos'} · ${mmss(ph.left)} · ${plural(ppl.length, 'persona', 'personas')}` : 'Pomodoro del grupo: se concentran y descansan al mismo tiempo.'}</span></span>${icon('chev', 'chev')}</a>`;
}
function viewEstudio() {
  const p = pomoGet(); const ph = p ? pomoPhase(p) : null; const ppl = p ? pomoPeople() : []; const imIn = ppl.some((x) => x.uid === REG.me);
  if (p && !ph.done) pomoTick();
  let top;
  if (p && !ph.done) {
    const C = 2 * Math.PI * 86; const pct = 1 - ph.left / ph.total;
    top = `<section class="pomo-room ${ph.phase}"><div class="pomo-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="86" class="pr-bg"/><circle cx="100" cy="100" r="86" class="pr-fg" id="pomoFg" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct)).toFixed(1)}"/></svg>
      <div class="pr-mid"><span class="pr-ph" id="pomoPh">${ph.phase === 'work' ? 'Enfoque' : 'Pausa juntos'}</span><b id="pomoClock">${mmss(ph.left)}</b><span class="small" id="pomoK">Ronda ${ph.k} de ${ph.cyc}</span></div></div>
      <div class="pomo-ppl">${ppl.map((x) => `<span class="pomo-p">${mini(x.name)}<span>${esc(x.name)}</span><i class="${ph.phase}"></i></span>`).join('') || '<span class="small muted">Nadie se ha unido todavía.</span>'}</div>
      <div class="btn-row" style="justify-content:center">${imIn ? '<button class="btn" data-act="pomo-leave">Salir de la sala</button>' : '<button class="btn primary" data-act="pomo-join">Unirme a la sesión</button>'}<button class="btn quiet" data-act="pomo-stop">Terminar para todos</button></div>
      <p class="small muted" style="text-align:center;margin:10px 0 0">${ph.phase === 'work' ? 'Celular boca abajo. Cuando suene, descansan todos juntos.' : 'Estírate, toma agua y respira. En un momento siguen.'}</p></section>`;
  } else {
    top = `<section class="pomo-room idle"><p class="muted" style="margin:0 0 12px">Empiecen una sesión: todos ven el mismo reloj, se concentran juntos y descansan al mismo tiempo. Nadie se queda solo.</p>
      <div class="seg full" role="group">${[[25, 5, 'Clásico 25/5'], [50, 10, 'Largo 50/10'], [15, 3, 'Corto 15/3']].map(([w, r, l], i) => `<button type="button" data-act="pomo-preset" data-w="${w}" data-r="${r}" aria-pressed="${(POMO.w || 25) === w}">${l}</button>`).join('')}</div>
      <button class="btn primary block" style="margin-top:14px" data-act="pomo-start">${icon('play', 'sm')}Empezar sesión del grupo</button></section>`;
  }
  return `${groupHead('Estudia conmigo', 'Pomodoro sincronizado para todo el Bosque.')}${top}`;
}
GROUP_VIEWS.estudio = viewEstudio; GROUP_NAV.estudio = 'grupo';
function pomoTick() {
  if (POMO.t) return;
  let last = null;
  POMO.t = setInterval(() => {
    const p = isGroup() ? pomoGet() : null; if (!p) { clearInterval(POMO.t); POMO.t = null; return; }
    const ph = pomoPhase(p); if (ph.done) { clearInterval(POMO.t); POMO.t = null; if (last) { Snd.chime(); toast('¡Sesión completa! Bien hecho, equipo.'); softRender(); } return; }
    if (last && last !== ph.phase) { Snd.chime(); try { navigator.vibrate?.([120, 60, 120]); } catch { /* */ } notify(ph.phase === 'rest' ? 'Pausa juntos' : 'De vuelta al enfoque', ph.phase === 'rest' ? `${p.rest} minutos para descansar.` : `Ronda ${ph.k} de ${ph.cyc}.`, 'aldia-pomo'); softRender(); }
    last = ph.phase;
    const c = document.getElementById('pomoClock'); if (c) c.textContent = mmss(ph.left);
    const fg = document.getElementById('pomoFg'); if (fg) { const C = 2 * Math.PI * 86; fg.setAttribute('stroke-dashoffset', (C * (ph.left / ph.total)).toFixed(1)); }
    const k = document.getElementById('pomoPh'); if (k) k.textContent = ph.phase === 'work' ? 'Enfoque' : 'Pausa juntos';
  }, 1000);
}
Object.assign(VIDA_ACTS, {
  'pomo-preset': (el) => { POMO.w = +el.dataset.w; POMO.r = +el.dataset.r; render(); },
  'pomo-start': () => { const start = Date.now(); gput({ id: pomoId(), type: 'pomo', kind: 'room', active: true, start, work: POMO.w || 25, rest: POMO.r || 5, cycles: 4 }); gput({ id: `pj-${curFid()}-${REG.me}`, type: 'pomo', kind: 'join', pomo: start, uid: REG.me, name: me(), at: Date.now() }); Snd.chime(); waterToday(); },
  'pomo-join': () => { const p = pomoGet(); if (!p) return; gput({ id: `pj-${curFid()}-${REG.me}`, type: 'pomo', kind: 'join', pomo: p.start, uid: REG.me, name: me(), at: Date.now() }); Snd.drop(); },
  'pomo-leave': () => { const j = gGet(`pj-${curFid()}-${REG.me}`); if (j) gput({ ...j, pomo: 0 }); },
  'pomo-stop': async () => { const ok = await ask({ title: '¿Terminar la sesión para todos?', ok: 'Terminar' }); if (!ok) return; const p = gGet(pomoId()); if (p) gput({ ...p, active: false }); },
});

/* ===================== Calendario del Bosque ===================== */
const EV_KINDS = { examen: ['Examen', '#C9524A'], entrega: ['Entrega', '#D27C5E'], clase: ['Clase', '#3E6FC6'], evento: ['Evento', '#2F8A5B'], otro: ['Otro', '#7A8CA8'] };
const GC = { month: today().slice(0, 7), sel: today() };
const gEvents = () => gAll('event').sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
function viewGCal() {
  const evs = gEvents(); const [y, m] = GC.month.split('-').map(Number);
  const first = new Date(y, m - 1, 1); const startDow = (first.getDay() + 6) % 7; const days = new Date(y, m, 0).getDate();
  let cells = ''; for (let i = 0; i < startDow; i++) cells += '<span class="gc-c empty"></span>';
  for (let d = 1; d <= days; d++) { const iso = `${GC.month}-${String(d).padStart(2, '0')}`; const es = evs.filter((e) => e.date === iso);
    cells += `<button type="button" class="gc-c ${iso === today() ? 'today' : ''} ${iso === GC.sel ? 'sel' : ''}" data-act="gc-sel" data-v="${iso}"><span>${d}</span><span class="gc-dots">${es.slice(0, 3).map((e) => `<i style="background:${(EV_KINDS[e.kind] || EV_KINDS.otro)[1]}"></i>`).join('')}</span></button>`; }
  const dayList = evs.filter((e) => e.date === GC.sel); const up = evs.filter((e) => e.date >= today()).slice(0, 8);
  const evRow = (e) => { const k = EV_KINDS[e.kind] || EV_KINDS.otro; return `<li><div class="gc-ev" style="--c:${k[1]}"><span class="gc-k">${k[0]}</span><span class="txt"><b>${esc(e.title)}</b><span class="tiny faint">${esc(cap(relDay(e.date)))}${e.time ? ` · ${fmtTime(e.time)}` : ''}${e.by ? ` · ${esc(e.by)}` : ''}</span>${e.note ? `<span class="small muted">${esc(e.note)}</span>` : ''}</span><span class="gc-b"><button class="icon-btn ghost" data-act="gc-copy" data-id="${e.id}" aria-label="A mi calendario">${icon('calplus', 'sm')}</button><button class="icon-btn ghost" data-act="gc-del" data-id="${e.id}" aria-label="Quitar">${icon('x', 'sm')}</button></span></div></li>`; };
  return `${groupHead('Calendario del Bosque', 'Exámenes, entregas y eventos del grupo. Cualquiera puede agregar o subir un calendario.')}
    <div class="btn-row" style="margin:6px 0 12px"><button class="btn primary" data-act="gc-new">${icon('plus', 'sm')}Agregar fecha</button><label class="btn">${icon('upload', 'sm')}Subir calendario (.ics)<input type="file" accept=".ics,text/calendar" id="gcIcs" hidden></label></div>
    <div class="gc-head"><button class="icon-btn ghost" data-act="gc-mon" data-v="-1" aria-label="Mes anterior">${icon('back')}</button><b>${cap(MESES[m - 1])} ${y}</b><button class="icon-btn ghost" data-act="gc-mon" data-v="1" aria-label="Mes siguiente" style="transform:scaleX(-1)">${icon('back')}</button></div>
    <div class="gc-grid">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<span class="gc-dw">${d}</span>`).join('')}${cells}</div>
    <h2 class="sec">${esc(cap(relDay(GC.sel)))}</h2>${dayList.length ? `<ul class="rows">${dayList.map(evRow).join('')}</ul>` : '<p class="small muted">Nada este día.</p>'}
    <h2 class="sec">Próximas fechas</h2>${up.length ? `<ul class="rows">${up.map(evRow).join('')}</ul>` : '<p class="small muted">Sin fechas próximas.</p>'}`;
}
GROUP_VIEWS.gcal = viewGCal; GROUP_NAV.gcal = 'mas';
function parseICS(text) {
  const lines = text.replace(/\r\n[ \t]/g, '').split(/\r?\n/); const out = []; let cur = null;
  for (const l of lines) {
    if (l === 'BEGIN:VEVENT') cur = {}; else if (l === 'END:VEVENT') { if (cur && cur.date && cur.title) out.push(cur); cur = null; }
    else if (cur) {
      const i = l.indexOf(':'); if (i < 0) continue; const key = l.slice(0, i); const val = l.slice(i + 1).replace(/\\n/g, ' ').replace(/\\,/g, ',').replace(/\\;/g, ';');
      if (key.startsWith('SUMMARY')) cur.title = val.slice(0, 120);
      else if (key.startsWith('DESCRIPTION')) cur.note = val.slice(0, 300);
      else if (key.startsWith('DTSTART')) {
        const m = /(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?(Z)?/.exec(val); if (!m) continue;
        if (m[4]) { const dt = m[6] ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])) : new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]); cur.date = toISO(dt); cur.time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`; }
        else cur.date = `${m[1]}-${m[2]}-${m[3]}`;
      }
    }
  }
  return out.map((e) => ({ ...e, kind: /examen|parcial|quiz|prueba/i.test(e.title) ? 'examen' : /entrega|tarea|proyecto/i.test(e.title) ? 'entrega' : /clase/i.test(e.title) ? 'clase' : 'evento' }));
}
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'gcIcs' && e.target.id !== 'myIcs') return; const f = e.target.files[0]; if (!f) return;
  const evs = parseICS(await f.text()).filter((x) => x.date >= addDays(today(), -30)).slice(0, 150);
  if (!evs.length) { toast('No encontré fechas en ese archivo.'); e.target.value = ''; return; }
  if (e.target.id === 'gcIcs') { const have = new Set(gEvents().map((x) => `${x.date}|${x.title}`)); let n = 0; for (const ev of evs) if (!have.has(`${ev.date}|${ev.title}`)) { gput({ id: gid(), type: 'event', ...ev }); n++; } toast(`Subí ${plural(n, 'fecha', 'fechas')} al calendario del Bosque.`); }
  else { let n = 0; commit((s) => { for (const ev of evs) { if (s.tasks.some((t) => t.title === ev.title && t.due === ev.date)) continue; s.tasks.push({ id: uid(), title: ev.title, subjectId: null, type: ev.kind === 'examen' ? 'examen' : 'otro', due: ev.date, time: ev.time || '', priority: 2, value: null, estimate: 0, desc: ev.note || '', steps: [], delivery: '', links: '', done: false, doneAt: null, grade: null, created: Date.now(), source: 'ics' }); n++; } }); toast(`Agregué ${plural(n, 'fecha', 'fechas')} a tu calendario.`); }
  Snd.chime(); e.target.value = '';
});
Object.assign(VIDA_ACTS, {
  'gc-sel': (el) => { GC.sel = el.dataset.v; render(); },
  'gc-mon': (el) => { const [y, m] = GC.month.split('-').map(Number); const d = new Date(y, m - 1 + +el.dataset.v, 1); GC.month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; render(); },
  'gc-new': () => {
    openSheet(`${sheetHead('Nueva fecha del Bosque')}<div class="sheet-body"><div class="field"><label for="gcT">¿Qué es?</label><input id="gcT" class="input" placeholder="Ej. Examen de Contabilidad"></div>
      <div class="field"><span class="lbl">Tipo</span><div class="pick" role="group" id="gcK">${Object.entries(EV_KINDS).map(([k, [l, c]], i) => `<button type="button" data-v="${k}" aria-pressed="${i === 0}"><span class="dot" style="background:${c}"></span>${l}</button>`).join('')}</div></div>
      <div class="rd-form-row"><input id="gcD" type="date" class="input" value="${GC.sel}"><input id="gcH" type="time" class="input"></div>
      <div class="field"><label for="gcN">Nota (opcional)</label><input id="gcN" class="input" placeholder="Ej. Temas 1 al 4"></div></div>
      <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" id="gcOk">Agregar</button></div>`);
    let kind = 'examen'; sheet().querySelectorAll('#gcK button').forEach((b) => b.addEventListener('click', () => { kind = b.dataset.v; sheet().querySelectorAll('#gcK button').forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
    document.getElementById('gcOk').addEventListener('click', () => { const t = $('#gcT').value.trim(); const d = $('#gcD').value; if (!t || !d) { toast('Escribe qué es y la fecha.'); return; } closeSheet(false); gput({ id: gid(), type: 'event', title: t, kind, date: d, time: $('#gcH').value || '', note: $('#gcN').value.trim() }); GC.sel = d; Snd.drop(); });
  },
  'gc-del': async (el) => { const e = gGet(el.dataset.id); if (!e) return; const ok = await ask({ title: '¿Quitar esta fecha?', text: 'Se quita para todo el Bosque.', ok: 'Quitar', danger: true }); if (ok) gput({ ...e, deleted: true }); },
  'gc-copy': (el) => {
    const e = gGet(el.dataset.id); if (!e) return; const t0 = S.tasks.find((t) => t.title === e.title && t.due === e.date); if (t0) { toast('Ya está en tu calendario.'); return; }
    const mineS = REG.me && REG.me !== dataOwner() ? load(keyFor(REG.me)) : S;
    const t = { id: uid(), title: e.title, subjectId: null, type: e.kind === 'examen' ? 'examen' : 'otro', due: e.date, time: e.time || '', priority: 2, value: null, estimate: 0, desc: e.note || '', steps: [], delivery: '', links: '', done: false, doneAt: null, grade: null, created: Date.now(), source: 'bosque' };
    mineS.tasks.push(t); if (mineS === S) commit(); else { localStorage.setItem(keyFor(REG.me), JSON.stringify(mineS)); setDirty(REG.me, true); cloudSync(); }
    toast('Lo copié a tu calendario personal.'); Snd.drop();
  },
});

/* ===================== Encuestas y anuncio fijado ===================== */
const polls = () => gAll('poll').filter((p) => !p.closed).sort((a, b) => b.at - a.at);
const votesOf = (pid) => gAll('vote').filter((v) => v.poll === pid);
function pollHTML(p) {
  const vs = votesOf(p.id); const mine = vs.find((v) => v.uid === REG.me); const tot = vs.length;
  return `<section class="poll"><span class="poll-k">Encuesta · ${esc(p.by || '')}</span><b>${esc(p.q)}</b><div class="poll-opts">${(p.opts || []).map((o, i) => { const n = vs.filter((v) => v.opt === i).length; const pc = tot ? Math.round((n / tot) * 100) : 0;
    return `<button type="button" class="poll-o ${mine && mine.opt === i ? 'on' : ''}" data-act="poll-vote" data-id="${p.id}" data-i="${i}"><i style="width:${mine ? pc : 0}%"></i><span>${esc(o)}</span>${mine ? `<em>${pc}%</em>` : ''}</button>`; }).join('')}</div>
    <span class="tiny faint">${plural(tot, 'voto', 'votos')}${p.by === me() ? ` · <button class="link-btn" data-act="poll-close" data-id="${p.id}">Cerrar encuesta</button>` : ''}</span></section>`;
}
function pinHTML() { const p = gGet(`pin-${curFid()}`); if (!p || p.deleted || !p.text) return ''; return `<section class="g-pin">${icon('flag', 'sm')}<p>${linkify(p.text)}</p><button class="link-btn" data-act="pin-edit">Editar</button></section>`; }
{
  const baseGrupo = viewGrupo;
  viewGrupo = function () {
    const html = baseGrupo(); const i = html.indexOf('</section>'); if (i < 0) return html;
    const up = gEvents().filter((e) => e.date >= today()).slice(0, 2);
    const strip = `${pinHTML()}<div class="g-strip">${pomoCardHTML()}
      <a class="pomo-card" href="#/grupo" data-act="bos-tab" data-v="cal"><span class="pomo-ico">${icon('cal')}</span><span class="txt"><b>Calendario del Bosque</b><span class="small">${up.length ? up.map((e) => `${esc(e.title)} · ${esc(relDay(e.date))}`).join(' · ') : 'Exámenes y entregas de todo el grupo.'}</span></span>${icon('chev', 'chev')}</a></div>
      ${polls().slice(0, 2).map(pollHTML).join('')}
      <div class="btn-row g-mini">${gGet(`pin-${curFid()}`)?.text ? '' : `<button class="btn quiet" data-act="pin-edit">${icon('flag', 'sm')}Fijar anuncio</button>`}<button class="btn quiet" data-act="poll-new">${icon('bars', 'sm')}Nueva encuesta</button><button class="btn quiet" data-act="help-open">${icon('help', 'sm')}Pedir ayuda</button><button class="btn quiet" data-act="g-history">${icon('save', 'sm')}Copias</button></div>`;
    return html.slice(0, i + 10) + strip + html.slice(i + 10);
  };
}
Object.assign(VIDA_ACTS, {
  'poll-new': async () => {
    openSheet(`${sheetHead('Nueva encuesta')}<div class="sheet-body"><div class="field"><label for="plQ">Pregunta</label><input id="plQ" class="input" placeholder="Ej. ¿Cuándo nos vemos para el proyecto?"></div>
      <div class="field"><label for="plO">Opciones (una por renglón)</label><textarea id="plO" class="input" rows="4" placeholder="Martes 4 p. m.\nMiércoles 5 p. m.\nPor videollamada"></textarea></div></div>
      <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" id="plOk">Publicar</button></div>`);
    document.getElementById('plOk').addEventListener('click', () => { const q = $('#plQ').value.trim(); const opts = $('#plO').value.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 6); if (!q || opts.length < 2) { toast('Escribe la pregunta y al menos 2 opciones.'); return; } closeSheet(false); gput({ id: gid(), type: 'poll', q, opts }); Snd.drop(); });
  },
  'poll-vote': (el) => { gput({ id: `v-${el.dataset.id}-${REG.me}`, type: 'vote', poll: el.dataset.id, opt: +el.dataset.i, uid: REG.me }); Snd.pop ? Snd.pop() : Snd.tick(); },
  'poll-close': (el) => { const p = gGet(el.dataset.id); if (p) gput({ ...p, closed: true }); },
  'pin-edit': async () => { const p = gGet(`pin-${curFid()}`); const v = await ask({ title: 'Anuncio fijado', text: 'Lo ve todo el Bosque hasta arriba. Déjalo vacío para quitarlo.', input: { value: p?.text || '', placeholder: 'Ej. El viernes se entrega la maqueta' }, ok: 'Guardar' }); if (v === null) return; gput({ id: `pin-${curFid()}`, type: 'pin', text: v.slice(0, 280) }); },
});
{
  const baseMas = viewMasGrupo;
  viewMasGrupo = function () { const h = baseMas(); const i = h.indexOf('<h2 class="sec">Integrantes'); const add = `<ul class="rows" style="margin-bottom:14px"><li><a href="#/estudio"><span class="ico">${icon('timer')}</span><span class="txt"><b>Estudia conmigo</b><span>Pomodoro sincronizado</span></span>${icon('chev', 'chev')}</a></li><li><a href="#/biblioteca"><span class="ico">${icon('globe')}</span><span class="txt"><b>Biblioteca General</b><span>La sala de todos</span></span>${icon('chev', 'chev')}</a></li><li><button type="button" class="rowbtn" data-act="g-history"><span class="ico">${icon('save')}</span><span class="txt"><b>Copias del Bosque</b><span>Recupera lo que se borró</span></span>${icon('chev', 'chev')}</button></li></ul>`; return i < 0 ? h + add : h.slice(0, i) + add + h.slice(i); };
}
/* importar calendario personal */
{
  const baseCal = viewCalendario;
  viewCalendario = function () { return baseCal() + `<div class="btn-row" style="margin-top:16px"><label class="btn quiet">${icon('upload', 'sm')}Importar calendario (.ics)<input type="file" accept=".ics,text/calendar" id="myIcs" hidden></label></div>`; };
}

/* ===================== Pizarrón: comentarios, actividad y ramas ===================== */
const pzComments = (id) => gAll('board').filter((x) => x.kind === 'comment' && x.parent === id).sort((a, b) => a.at - b.at);
{
  const baseCard = pzCardHTML;
  pzCardHTML = function (it, ro) { const n = pzComments(it.id).length; let h = baseCard(it, ro); if (n) h = h.replace('<span class="pz-foot">', `<span class="pz-foot"><span class="pz-cm">${icon('note', 'sm')}${n}</span>`); return h; };
  const baseItems = pzItems;
  pzItems = function (ep) { return baseItems(ep).filter((x) => x.kind !== 'comment'); };
  const baseSheet = pzSheet;
  pzSheet = function (it) {
    baseSheet(it); if (!gGet(it.id)) return;
    const body = sheet().querySelector('.sheet-body'); const others = pzItems().filter((x) => x.id !== it.id);
    body.insertAdjacentHTML('beforeend', `<div class="field"><label for="pzPa">Rama: conectar con…</label><select id="pzPa" class="input"><option value="">El tronco (sin conectar)</option>${others.map((o) => `<option value="${o.id}" ${it.pa === o.id ? 'selected' : ''}>${esc((o.title || o.text || o.file || 'Tarjeta').slice(0, 50))}</option>`).join('')}</select></div>
      <h3 class="sec" style="margin-top:14px">Comentarios</h3><div class="pz-thread">${pzComments(it.id).map((c) => `<div class="pz-c">${mini(c.by, 'xs')}<span><b>${esc(c.by)}</b> ${linkify(c.text)}<em>${ago(c.at)}</em></span></div>`).join('') || '<p class="small muted" style="margin:0">Sé la primera persona en comentar.</p>'}</div>
      <div class="add-step"><input id="pzCIn" class="input" placeholder="Escribe un comentario…" maxlength="500"><button type="button" class="btn" id="pzCGo">Comentar</button></div>`);
    document.getElementById('pzPa').addEventListener('change', (e) => { const cur = gGet(it.id); if (cur) gput({ ...cur, pa: e.target.value, act: 'conectó' }); });
    const send = () => { const v = document.getElementById('pzCIn').value.trim(); if (!v) return; gput({ id: 'pc' + uid(), type: 'board', kind: 'comment', parent: it.id, text: v, ep: +(it.ep || 0) }); closeSheet(false); Snd.drop(); setTimeout(() => pzSheet(gGet(it.id)), 250); };
    document.getElementById('pzCGo').addEventListener('click', send);
    document.getElementById('pzCIn').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
  };
  const baseView = viewPizarron;
  viewPizarron = function () {
    let h = baseView();
    h = h.replace('<button type="button" data-act="pz-mode" data-v="lista"', `<button type="button" data-act="pz-mode" data-v="ramas" aria-pressed="${PZ.mode === 'ramas'}">Ramas</button><button type="button" data-act="pz-mode" data-v="lista"`);
    if (PZ.mode === 'ramas' && PZ.view == null) {
      const items = pzItems(); const a = h.indexOf('<div class="pz-list">'); const b = h.indexOf('<div class="pz-end">');
      if (a >= 0 && b > a && items.length) h = h.slice(0, a) + ramasHTML(items) + h.slice(b);
    }
    const act = pzActivity();
    if (act && PZ.view == null) { const b = h.indexOf('<div class="pz-end">'); if (b >= 0) h = h.slice(0, b) + act + h.slice(b); }
    return h;
  };
}
function pzActivity() {
  const all = gAll('board').concat(gItems().filter((x) => x.type === 'board' && x.deleted)).filter((x) => x.kind !== 'meta' && x.kind !== 'tinta').sort((a, b) => (b.u || b.at) - (a.u || a.at)).slice(0, 10);
  if (!all.length) return '';
  const verb = (x) => (x.deleted ? 'quitó' : x.kind === 'comment' ? 'comentó' : x.act ? x.act : (x.u && x.at && x.u - x.at > 4000) ? 'editó' : 'agregó');
  const what = (x) => { if (x.kind === 'comment') { const p = gGet(x.parent); return `en «${esc(((p && (p.title || p.text)) || 'una tarjeta').slice(0, 40))}»: ${esc(x.text.slice(0, 60))}`; } return `${{ note: 'una nota', link: 'un enlace', draft: 'un borrador', file: 'un archivo' }[x.kind] || 'algo'}${x.title || x.text ? ` · ${esc((x.title || x.text).slice(0, 40))}` : ''}`; };
  return `<details class="pz-act" ${PZ.actOpen ? 'open' : ''}><summary>${icon('clock', 'sm')}<b>Actividad del pizarrón</b><span class="tiny faint">${esc(all[0].by || '')} · ${ago(all[0].u || all[0].at)}</span></summary><ul>${all.map((x) => `<li>${mini(x.by, 'xs')}<span><b>${esc(x.by || '')}</b> ${verb(x)} ${what(x)}<em>${ago(x.u || x.at)}</em></span></li>`).join('')}</ul></details>`;
}
/* Vista de ramas: un tronco que sube y cada tarjeta brota de él; lo conectado cuelga de su rama */
function ramasHTML(items) {
  const byId = new Map(items.map((i) => [i.id, i])); const kids = (id) => items.filter((i) => (i.pa && byId.has(i.pa) ? i.pa : '') === id).sort((a, b) => a.at - b.at);
  const rows = []; const walk = (id, depth, side) => { for (const it of kids(id)) { rows.push({ it, depth, side: depth === 0 ? (rows.filter((r) => r.depth === 0).length % 2 ? 'r' : 'l') : side }); walk(it.id, depth + 1, rows[rows.length - 1].side); } };
  walk('', 0, 'l');
  setTimeout(() => vineDraw(document.getElementById('pzRamas'), { trunk: true }), 40);
  return `<div class="pz-ramas vine-host" id="pzRamas"><div class="vr-root"><span>${esc(forestMeta()?.name || 'Pizarrón')}</span></div>${rows.map((r) => `<div class="vr-row ${r.side} d${Math.min(3, r.depth)}" data-pa="${esc(r.it.pa || '')}" data-id="${r.it.id}">${pzCardHTML(r.it, false).replace(/ style="left:[^"]*"/, '')}</div>`).join('')}<svg class="vine-svg" aria-hidden="true"></svg></div>`;
}
document.addEventListener('click', (e) => { const s = e.target.closest('.pz-act summary'); if (s) PZ.actOpen = !s.parentElement.open; });
/* aviso en vivo cuando otra persona cambia el pizarrón */
{
  const baseApply2 = applyForests;
  applyForests = function (remote) {
    const fid = curFid(); const before = fid ? new Map(gItems().filter((x) => x.type === 'board').map((x) => [x.id, x.u || x.at])) : null;
    const r = baseApply2(remote);
    if (fid && before && route().name === 'pizarron' && !choosing) {
      const ch = gItems().filter((x) => x.type === 'board' && x.kind !== 'meta' && (x.u || x.at) !== before.get(x.id) && x.byId && x.byId !== REG.me && x.by !== me());
      if (ch.length && before.size) { const x = ch[ch.length - 1]; toast(`${x.by} ${x.deleted ? 'quitó algo del' : x.kind === 'comment' ? 'comentó en el' : before.has(x.id) ? 'movió o editó algo en el' : 'agregó algo al'} pizarrón.`, { ms: 2600 }); }
    }
    return r;
  };
}
