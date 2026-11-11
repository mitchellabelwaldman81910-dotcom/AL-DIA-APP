/* Cinnavia 7.46 — Modo "Sin ruido visual" para el Guardián del Bosque (docentes).
   · Solo existe para cuentas de Guardián (el interruptor está en Más). Es por cuenta: nunca se mezcla con otra.
   · Libretas libres (sin materias), recordatorios, calendario con eventos, botones de Pizarrón y Cerebro.
   · Sin animaciones, sin fauna, sin hojas, sin portadas decorativas: paleta sobria y estilo formal. */
'use strict';
if (!COLLS.includes('cal')) COLLS.push('cal');
const calmOn = () => { try { return !!REG.me && !choosing && isGuardian(REG.me) && S.settings.calm !== false; } catch { return false; } };
const clEvents = () => { if (!Array.isArray(S.cal)) S.cal = []; return S.cal; };
const clNbs = () => S.subjects.filter((s) => s.nb);
const CL_ALLOWED = ['hoy', 'libretas', 'recordatorios', 'calendario', 'lienzo', 'cerebro', 'salones', 'guardian', 'mas', 'ajustes', 'respaldo', 'instalar', 'ayuda', 'compartir', 'quien'];

/* ---------- activar / desactivar ---------- */
function calmApply() {
  const on = calmOn(); const de = document.documentElement;
  if (on === de.hasAttribute('data-calm')) return;
  de.toggleAttribute('data-calm', on); navMode = null;
  if (typeof FA !== 'undefined' && FA.cv) { if (on) FA.on = false; else if (!FA.stat && !FA.on) { FA.on = true; FA.last = performance.now(); requestAnimationFrame(faFrame); } }
}
{
  const baseRoute = route;
  route = function () {
    const r = baseRoute();
    if (calmOn() && !S.settings.onboarded) S.settings.onboarded = true; /* el Guardián no pasa por la bienvenida de estudiantes */
    if (calmOn() && !isGroup() && !CL_ALLOWED.includes(r.name)) { history.replaceState(null, '', '#/hoy'); return { name: 'hoy', arg: '' }; }
    return r;
  };
}
{
  const baseNav = setNav;
  const NAV_CALM = [['hoy', 'home', 'Inicio'], ['libretas', 'book', 'Libretas'], ['recordatorios', 'bell', 'Recordatorios'], ['calendario', 'cal', 'Calendario'], ['mas', 'grid', 'Más']];
  setNav = function (group) {
    calmApply();
    if (calmOn() && !group) { if (navMode === 'c') return; navMode = 'c'; $('.nav').innerHTML = NAV_CALM.map(([k, ic, l]) => `<a href="#/${k}" data-nav="${k}"><svg class="i"><use href="#i-${ic}"/></svg><span>${l}</span></a>`).join(''); return; }
    baseNav(group);
  };
  const baseFocus = updateFocusPill;
  updateFocusPill = function () {
    baseFocus();
    if (calmOn() && !isGroup()) { const n = route().name; const cur = { hoy: 'hoy', libretas: 'libretas', lienzo: 'libretas', recordatorios: 'recordatorios', calendario: 'calendario' }[n] || 'mas'; $$('.nav a').forEach((a) => { if (a.dataset.nav === cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); $('#fab').hidden = true; }
  };
}

/* ---------- Inicio ---------- */
function clItemsFor(iso) {
  const ev = clEvents().filter((e) => e.date === iso).map((e) => ({ t: e.time || '', title: e.title, k: 'Evento', id: e.id, act: 'cl-ev-edit' }));
  const rc = rcList().filter((r) => !r.done && rcOccursOn(r, iso)).map((r) => ({ t: r.time || '', title: r.title, k: 'Recordatorio', id: r.id, act: 'rc-edit' }));
  return [...ev, ...rc].sort((a, b) => String(a.t).localeCompare(String(b.t)));
}
const clRow = (x) => `<li><button type="button" class="cm-row" data-act="${x.act}" data-id="${x.id}"><span class="cm-t">${x.t ? esc(rcFmtTime(x.t)) : 'Todo el día'}</span><span class="cm-m"><b>${esc(x.title)}</b><small>${x.k}</small></span></button></li>`;
function calmHome() {
  const d = new Date(), hr = d.getHours(); const greet = hr < 12 ? 'Buenos días' : hr < 19 ? 'Buenas tardes' : 'Buenas noches';
  const name = (S.settings.name || profile()?.name || '').split(' ')[0];
  const hoy = clItemsFor(today());
  const up = []; for (let k = 1; k <= 14 && up.length < 6; k++) { const iso = addDays(today(), k); clItemsFor(iso).forEach((x) => up.length < 6 && up.push({ ...x, iso })); }
  return `<h1 class="page-title">${greet}${name ? `, ${esc(name)}` : ''}</h1><p class="page-sub">${esc(cap(longDate(today())))}</p>
    <div class="cm-quick"><a class="btn block" href="#/lienzo">${icon('board')}Pizarrón</a><a class="btn block" href="#/cerebro">${icon('network')}Cerebro</a></div>
    <button type="button" class="btn primary block" data-act="pl-quick" style="margin-bottom:6px">${icon('note', 'sm')}Nueva planeación de clase</button>
    <h2 class="sec">Hoy</h2>${hoy.length ? `<ul class="cm-list">${hoy.map(clRow).join('')}</ul>` : '<p class="muted">Sin eventos ni recordatorios para hoy.</p>'}
    <h2 class="sec">Próximos días</h2>${up.length ? `<ul class="cm-list">${up.map((x) => clRow(x).replace('<span class="cm-t">', `<span class="cm-t"><em>${esc(cap(relDay(x.iso)))}</em>`)).join('')}</ul>` : '<p class="muted">Nada programado en las próximas dos semanas.</p>'}
    <div class="btn-row" style="margin-top:16px"><button class="btn primary" data-act="cl-ev-new">${icon('plus', 'sm')}Nuevo evento</button><button class="btn" data-act="rc-new">${icon('bell', 'sm')}Nuevo recordatorio</button></div>
    <a class="cm-link" href="#/salones">${icon('users')}<span><b>Bosques</b><small>Tus grupos, avisos, asistencia y calificaciones</small></span></a>`;
}
{ const base = viewHoy; viewHoy = function () { return calmOn() && !isGroup() ? calmHome() : base(); }; }

/* ---------- Recordatorios ---------- */
{
  const base = viewRecordatorios;
  viewRecordatorios = function () {
    const h = base(); if (!calmOn()) return h;
    return h.replace(/<a class="back"[^>]*>.*?<\/a>/, '').replace('Crea los que necesites: cuándo, cuánto antes y si se repiten.', 'Tus avisos importantes: cuándo, cuánto antes y si se repiten.');
  };
  EXTRA_VIEWS.recordatorios = viewRecordatorios;
}

/* ---------- Libretas libres (sin materias) ---------- */
{
  const baseSubs = lbSubjects; lbSubjects = () => (calmOn() ? clNbs() : baseSubs());
  const baseLib = viewLibretas;
  viewLibretas = function (arg) {
    if (!calmOn()) return baseLib(arg);
    if (arg) return clLibreta(arg);
    const nbs = clNbs(); setTimeout(hydrateUF, 30);
    return `<h1 class="page-title">Libretas</h1><p class="page-sub">Crea las libretas que necesites y ponles el nombre que quieras.</p>
      <button type="button" class="btn primary block" data-act="cl-nb-new">${icon('plus', 'sm')}Nueva libreta</button>
      ${nbs.length ? `<div class="lb-shelf" style="margin-top:14px">${nbs.map((s) => `<a class="lb-book" href="#/libretas/${s.id}">${coverHTML(s)}</a>`).join('')}</div>` : '<div class="empty"><h3>Aún no tienes libretas</h3><p>Crea la primera para guardar apuntes, listas, fotos y enlaces.</p></div>'}`;
  };
  EXTRA_VIEWS.libretas = viewLibretas;
  function clLibreta(id) {
    const s = clNbs().find((x) => x.id === id);
    if (!s) return `<a class="back" href="#/libretas">${icon('back')}Libretas</a><div class="empty"><h3>Esta libreta ya no existe</h3></div>`;
    if (LB.tab === 'tareas') LB.tab = 'paginas';
    let h = baseLib(id).replace(' Todo lo que escribas aquí también alimenta tu Quiz inteligente.', '');
    h = h.replace(/<button[^>]*data-v="tareas"[^>]*>.*?<\/button>/, '').replace(/<button[^>]*data-k="pegatina"[^>]*>.*?<\/button>/, '').replace(/<button class="btn" data-act="qz-go"[^>]*>.*?<\/button>/, '').replace(/<button class="btn quiet" data-act="help-open">.*?<\/button>/, '').replace(/<[^<>]*data-act="ch-open"[^>]*>.*?<\/(button|a)>/, '');
    return h.replace(/<button class="link-btn" data-act="lb-cover"[^>]*>.*?<\/button>/, `<button class="link-btn" data-act="cl-nb-ren" data-id="${id}">Cambiar nombre</button> · <button class="link-btn" data-act="cl-nb-del" data-id="${id}">Eliminar libreta</button>`);
  }
}

/* ---------- Calendario con eventos ---------- */
{
  const base = viewCalendario;
  viewCalendario = function () {
    if (!calmOn()) return base();
    const [y, m] = UI.calMonth.split('-').map(Number); const first = new Date(y, m - 1, 1, 12); const off = (first.getDay() + 6) % 7; const days = new Date(y, m, 0).getDate(); const t0 = today();
    let cells = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => `<div class="dow" aria-hidden="true">${d}</div>`).join('');
    for (let i = 0; i < off; i++) cells += '<div class="day out" aria-hidden="true"></div>';
    for (let d = 1; d <= days; d++) {
      const iso = `${y}-${pad(m)}-${pad(d)}`; const n = clItemsFor(iso).length;
      cells += `<button type="button" class="day ${iso === t0 ? 'today' : ''}" data-act="calsel" data-v="${iso}" aria-pressed="${UI.calSel === iso}" aria-label="${esc(longDate(iso))}${n ? `, ${plural(n, 'evento', 'eventos')}` : ''}"><span class="n">${d}</span><span class="dots">${n ? '<i></i>' : ''}</span></button>`;
    }
    const sel = UI.calSel; const items = clItemsFor(sel);
    return `<h1 class="page-title">Calendario</h1>
      <div class="cal-head"><button type="button" class="icon-btn" data-act="calnav" data-v="-1" aria-label="Mes anterior">${icon('back')}</button><h2 class="serif">${cap(MESES[m - 1])} ${y}</h2><button type="button" class="icon-btn" data-act="calnav" data-v="1" aria-label="Mes siguiente">${icon('chev')}</button></div>
      <div class="cal">${cells}</div>
      ${UI.calMonth !== t0.slice(0, 7) ? '<p style="text-align:center;margin:10px 0 0"><button class="link-btn" data-act="caltoday">Ir a hoy</button></p>' : ''}
      <h2 class="sec">${esc(cap(longDate(sel)))}</h2>
      ${items.length ? `<ul class="cm-list">${items.map(clRow).join('')}</ul>` : '<p class="muted" style="margin:0 0 10px">Sin eventos este día.</p>'}
      <div class="btn-row"><button class="btn primary" data-act="cl-ev-new" data-date="${sel}">${icon('plus', 'sm')}Nuevo evento</button><button class="btn" data-act="rc-new">${icon('bell', 'sm')}Nuevo recordatorio</button></div>`;
  };
}
const CLM = { cur: null };
function clEvSheet(e) {
  const isNew = !clEvents().some((x) => x.id === e.id); CLM.cur = e;
  openSheet(`${sheetHead(isNew ? 'Nuevo evento' : 'Evento')}<div class="sheet-body">
    <div class="field"><label for="clTitle">Título</label><input id="clTitle" class="input" maxlength="90" value="${esc(e.title)}" placeholder="Ej. Junta de padres de familia"></div>
    <div class="cm-two"><div class="field"><label for="clDate">Fecha</label><input id="clDate" type="date" class="input" value="${esc(e.date)}"></div><div class="field"><label for="clTime">Hora <span class="faint">(opcional)</span></label><input id="clTime" type="time" class="input" value="${esc(e.time || '')}"></div></div>
    <div class="field"><label for="clNote">Notas <span class="faint">(opcional)</span></label><textarea id="clNote" class="input" maxlength="400" rows="3">${esc(e.note || '')}</textarea></div>
    <div class="btn-row"><button class="btn primary" data-act="cl-ev-save">${isNew ? 'Crear evento' : 'Guardar'}</button>${isNew ? '' : '<button class="btn danger" data-act="cl-ev-del">Eliminar</button>'}</div></div>`);
  setTimeout(() => $('#clTitle')?.focus(), 60);
}
Object.assign(VIDA_ACTS, {
  'cl-ev-new': (el) => clEvSheet({ id: 'ev' + uid(), title: '', date: el?.dataset?.date || (route().name === 'calendario' ? UI.calSel : today()), time: '', note: '' }),
  'cl-ev-edit': (el) => { const e = clEvents().find((x) => x.id === el.dataset.id); if (e) clEvSheet({ ...e }); },
  'cl-ev-save': () => {
    const e = CLM.cur; if (!e) return; const g = (id) => document.getElementById(id)?.value ?? '';
    e.title = g('clTitle').trim(); e.date = g('clDate'); e.time = g('clTime'); e.note = g('clNote').trim();
    if (!e.title) { toast('Escribe el título del evento.'); return; } if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) { toast('Elige una fecha.'); return; }
    const L = clEvents(); const i = L.findIndex((x) => x.id === e.id); if (i >= 0) L[i] = { ...e }; else L.push({ ...e });
    closeSheet(false); UI.calSel = e.date; UI.calMonth = e.date.slice(0, 7); commit(); toast('Evento guardado.');
  },
  'cl-ev-del': async () => { const e = CLM.cur; if (!e) return; if (!await ask({ title: '¿Eliminar este evento?', ok: 'Eliminar', danger: true })) return; S.cal = clEvents().filter((x) => x.id !== e.id); closeSheet(false); commit(); },
  'cl-nb-new': async () => {
    const v = await ask({ title: 'Nueva libreta', ok: 'Crear', input: { placeholder: 'Nombre de la libreta' } }); if (!v) return;
    commit((s) => s.subjects.push({ id: uid(), name: v.slice(0, 60), color: '#5B6B7F', nb: true, teacher: '', room: '', important: false, schedule: [], notes: '', target: null }));
  },
  'cl-nb-ren': async (el) => { const s = clNbs().find((x) => x.id === el.dataset.id); if (!s) return; const v = await ask({ title: 'Nombre de la libreta', ok: 'Guardar', input: { value: s.name } }); if (v) commit(() => { s.name = v.slice(0, 60); }); },
  'cl-nb-del': async (el) => { const s = clNbs().find((x) => x.id === el.dataset.id); if (!s) return; if (!await ask({ title: `¿Eliminar "${s.name}"?`, text: 'Se borran también todas sus páginas. No se puede deshacer.', ok: 'Eliminar', danger: true })) return; location.hash = '#/libretas'; commit((st) => { st.subjects = st.subjects.filter((x) => x.id !== s.id); st.pages = (st.pages || []).filter((p) => p.subjectId !== s.id); st.notes = (st.notes || []).filter((n) => n.subjectId !== s.id); }); },
  'cl-toggle': () => { commit(() => { S.settings.calm = !calmOn(); }); calmApply(); render(); toast(S.settings.calm === false ? 'Modo sin ruido visual desactivado.' : 'Modo sin ruido visual activado.'); },
});

/* ---------- Tipo de cuenta (Estudiante / Guardián del Bosque) ---------- */
const roleCardHTML = () => { const g = isGuardian(REG.me); return `<div class="cm-switch cm-role"><span><b>Tipo de cuenta</b><small>${g ? 'Guardián del Bosque: avisos, asistencia, calificaciones y modo sin ruido visual.' : 'Estudiante. Si eres docente, cámbiala a Guardián del Bosque.'}</small></span><div class="seg" role="group" aria-label="Tipo de cuenta"><button type="button" data-act="role-set" data-r="student" aria-pressed="${!g}">Estudiante</button><button type="button" data-act="role-set" data-r="guardian" aria-pressed="${g}">Guardián</button></div></div>`; };
Object.assign(VIDA_ACTS, {
  'role-set': async (el) => {
    const r = el.dataset.r === 'guardian' ? 'guardian' : 'student'; const u = (REG.users || []).find((x) => x.id === REG.me); if (!u || (u.role || 'student') === r) return;
    if (r === 'student' && !await ask({ title: '¿Volver a Estudiante?', text: 'Dejarás de ver las herramientas de Guardián y el modo sin ruido visual.', ok: 'Sí, volver' })) return;
    u.role = r; if (r === 'guardian') u.rl = true; else delete u.rl; if (FOR.members && FOR.members[REG.me]) FOR.members[REG.me].role = r; saveReg(); navMode = null; calmApply();
    let cloud = true; try { await cloudFetch('POST', { kind: 'setrole', as: REG.me, role: r }); } catch { cloud = false; }
    if (!cloud) { u.rl = true; saveReg(); }
    render(); toast(r === 'guardian' ? (cloud ? 'Ahora eres Guardián del Bosque.' : 'Guardián en este equipo. Se confirmará en la nube cuando haya conexión.') : 'Cuenta de Estudiante.');
  },
});

/* ---------- Más: lista corta y formal ---------- */
{
  const base = viewMas;
  viewMas = function () {
    if (!calmOn() || isGroup()) {
      const h = base(); if (isGroup() || choosing) return h;
      const card = roleCardHTML() + (isGuardian() ? '<div class="cm-switch"><span><b>Modo sin ruido visual</b><small>Interfaz sobria para docentes, sin animaciones ni adornos.</small></span><button type="button" class="btn" data-act="cl-toggle">Activar</button></div>' : '');
      return h.includes('<h1 class="page-title">') ? h.replace('<h1 class="page-title">', card + '<h1 class="page-title">') : card + h;
    }
    const me = profile();
    const items = [['#/salones', 'users', 'Bosques', 'Grupos, avisos, asistencia y calificaciones'], ['#/lienzo', 'board', 'Pizarrón', 'Tu lienzo personal'], ['#/cerebro', 'network', 'Cerebro', 'Pensamientos y notas rápidas conectados'], ['#/respaldo', 'save', 'Respaldo', 'Guardar o restaurar tus datos'], ['#/ajustes', 'gear', 'Ajustes', 'Nombre, tema y avisos'], ['#/ayuda', 'help', 'Ayuda', 'Cómo usar Cinnavia']];
    return `<h1 class="page-title">Más</h1>
      <ul class="rows" style="margin-bottom:14px"><li><button type="button" class="rowbtn" data-act="profile-sheet">${avatar(me, 'sm')}<span class="grow"><b>${esc(me?.name || '')}</b><small class="muted" style="display:block">Guardián del Bosque · cambiar de cuenta</small></span>${icon('chev')}</button></li></ul>
      <ul class="rows">${items.map(([h, ic, t, d]) => `<li><a class="rowbtn" href="${h}">${icon(ic)}<span class="grow"><b>${t}</b><small class="muted" style="display:block">${d}</small></span>${icon('chev')}</a></li>`).join('')}</ul>
      ${roleCardHTML()}<div class="cm-switch"><span><b>Modo sin ruido visual</b><small>Activado. Sin animaciones ni adornos.</small></span><button type="button" class="btn" data-act="cl-toggle">Desactivar</button></div>`;
  };
}
