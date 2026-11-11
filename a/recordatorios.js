/* Cinnavia 7.25 — Recordatorios propios (en Tareas) y activador de notificaciones en Más.
   Cada recordatorio elige qué avisar, cuándo, cuánto antes y si se repite. Avisan aunque la app esté cerrada
   (la nube los manda) y, con la app abierta, también por aquí. */
'use strict';
if (!COLLS.includes('recs')) COLLS.push('recs');
const RC_KINDS = [['tarea', 'Entregar tarea', 'check'], ['estudiar', 'Estudiar', 'book'], ['examen', 'Examen', 'flag'], ['material', 'Llevar material', 'tools'], ['repasar', 'Repasar apuntes', 'note'], ['agua', 'Descansar o tomar agua', 'heart'], ['otro', 'Otro', 'bell']];
const RC_REPEAT = { no: 'No se repite', dia: 'Cada día', laboral: 'Lunes a viernes', semana: 'Cada semana' };
const RC_BEFORE = [[0, 'En el momento'], [5, '5 min antes'], [10, '10 min antes'], [30, '30 min antes'], [60, '1 hora antes'], [1440, '1 día antes']];
const rcList = () => { if (!Array.isArray(S.recs)) S.recs = []; return S.recs; };
const rcTime = (r) => { const [h, m] = String(r.time || '08:00').split(':').map(Number); return h * 60 + m; };
const rcFmtTime = (t) => { const [h, m] = String(t || '08:00').split(':').map(Number); return new Date(2000, 0, 1, h, m).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' }); };
function rcOccursOn(r, iso) {
  if (!r.date || iso < r.date) return false;
  if (r.repeat === 'dia') return true;
  const wd = fromISO(iso).getDay();
  if (r.repeat === 'laboral') return wd >= 1 && wd <= 5;
  if (r.repeat === 'semana') return wd === fromISO(r.date).getDay();
  return iso === r.date;
}
/* próxima vez que debe avisar (ms) a partir de ahora, o null */
function rcNext(r, from = Date.now()) {
  if (r.done && (!r.repeat || r.repeat === 'no')) return null;
  const before = +r.before || 0;
  for (let k = 0; k < 400; k++) {
    const iso = addDays(toISO(new Date(from)), k); if (r.skipUntil && iso <= r.skipUntil && r.repeat && r.repeat !== 'no') continue; if (!rcOccursOn(r, iso)) { if (!r.repeat || r.repeat === 'no') { if (iso > r.date) return null; } continue; }
    const d = fromISO(iso); d.setHours(0, 0, 0, 0); const at = d.getTime() + rcTime(r) * 60000 - before * 60000;
    if (at >= from - 60000) return at; if (!r.repeat || r.repeat === 'no') return null;
  }
  return null;
}
function rcWhen(r) {
  const n = rcNext(r); const rep = r.repeat && r.repeat !== 'no' ? ` · ${RC_REPEAT[r.repeat].toLowerCase()}` : '';
  if (n === null) return r.done ? 'Hecho' : 'Ya pasó';
  const d = new Date(n + (+r.before || 0) * 60000); return `${cap(relDay(toISO(d)))}, ${rcFmtTime(r.time)}${rep}${+r.before ? ` · avisa ${RC_BEFORE.find((b) => b[0] === +r.before)?.[1].toLowerCase() || ''}` : ''}`;
}
function rcCardHTML(max = 3) {
  const items = rcList().filter((r) => rcNext(r) !== null).sort((a, b) => rcNext(a) - rcNext(b));
  return `<div class="card rc-card"><div class="rc-head"><span class="rc-ic">${icon('bell')}</span><span style="flex:1"><b>Recordatorios</b><span class="small muted" style="display:block">${items.length ? plural(items.length, 'activo', 'activos') : 'Elige qué quieres recordar y a qué hora'}</span></span><button type="button" class="btn primary" data-act="rc-new">${icon('plus', 'sm')}Nuevo</button></div>
    ${items.length ? `<ul class="rc-list">${items.slice(0, max).map((r) => `<li><button type="button" class="rc-row" data-act="rc-edit" data-id="${r.id}"><span class="rc-k">${icon((RC_KINDS.find((k) => k[0] === r.kind) || RC_KINDS[6])[2], 'sm')}</span><span class="rc-t"><b>${esc(r.title)}</b><span class="tiny muted">${esc(rcWhen(r))}</span></span></button></li>`).join('')}</ul>${items.length > max ? `<a class="link-btn" href="#/recordatorios">Ver los ${items.length}</a>` : ''}` : ''}</div>`;
}
function viewRecordatorios() {
  const all = rcList().slice().sort((a, b) => (rcNext(a) ?? 9e15) - (rcNext(b) ?? 9e15));
  return `<a class="back" href="#/tareas">${icon('back')}Tareas</a><h1 class="page-title">Recordatorios</h1><p class="page-sub">Crea los que necesites: cuándo, cuánto antes y si se repiten.</p>
    <button type="button" class="btn primary block" data-act="rc-new">${icon('plus', 'sm')}Nuevo recordatorio</button>
    ${all.length ? `<ul class="rows" style="margin-top:14px">${all.map((r) => `<li><div class="rowline"><button type="button" class="rc-row" data-act="rc-edit" data-id="${r.id}" style="flex:1"><span class="rc-k">${icon((RC_KINDS.find((k) => k[0] === r.kind) || RC_KINDS[6])[2], 'sm')}</span><span class="rc-t"><b>${esc(r.title)}</b><span class="tiny muted">${esc(rcWhen(r))}</span></span></button>${rcNext(r) !== null || !r.done ? `<button class="icon-btn ghost" data-act="rc-done" data-id="${r.id}" aria-label="Marcar hecho">${icon('check', 'sm')}</button>` : ''}</div></li>`).join('')}</ul>` : '<div class="empty"><h3>Sin recordatorios</h3><p>Toca «Nuevo recordatorio» para crear el primero.</p></div>'}
    ${notifCardHTML()}`;
}
EXTRA_VIEWS.recordatorios = viewRecordatorios; EXTRA_NAV.recordatorios = 'tareas';
function rcSheet(r) {
  const isNew = !rcList().some((x) => x.id === r.id); RC.cur = r;
  const nowD = new Date(); const pend = S.tasks.filter((t) => !t.done).sort(sortPending).slice(0, 25);
  openSheet(`${sheetHead(isNew ? 'Nuevo recordatorio' : 'Recordatorio')}<div class="sheet-body" data-rcid="${r.id}">
    <div class="field"><span class="lbl">¿Qué quieres recordar?</span><div class="rc-kinds">${RC_KINDS.map(([k, l, ic]) => `<button type="button" class="chip ${r.kind === k ? 'on' : ''}" data-act="rc-kind" data-v="${k}" aria-pressed="${r.kind === k}">${icon(ic, 'sm')}${l}</button>`).join('')}</div></div>
    ${pend.length ? `<div class="field"><label for="rcTask">Sobre una tarea (opcional)</label><select id="rcTask" class="input" data-act-change="rc-task"><option value="">— Ninguna —</option>${pend.map((t) => `<option value="${t.id}" ${r.taskId === t.id ? 'selected' : ''}>${esc(t.title.slice(0, 50))}</option>`).join('')}</select></div>` : ''}
    <div class="field"><label for="rcTitle">Mensaje</label><input id="rcTitle" class="input" maxlength="80" value="${esc(r.title)}" placeholder="Ej. Entregar el resumen de Historia"></div>
    <div class="field"><span class="lbl">Rápido</span><div class="rc-kinds">${[['En 15 min', 15], ['En 1 hora', 60], ['Hoy 8 p. m.', 'noche'], ['Mañana 7 a. m.', 'man']].map(([l, v]) => `<button type="button" class="chip" data-act="rc-quick" data-v="${v}">${l}</button>`).join('')}</div></div>
    <div class="cl-row"><div class="field"><label for="rcDate">Día</label><input id="rcDate" type="date" class="input" value="${esc(r.date)}" min="${toISO(nowD)}"></div><div class="field"><label for="rcTime">Hora</label><input id="rcTime" type="time" class="input" value="${esc(r.time)}"></div></div>
    <div class="cl-row"><div class="field"><label for="rcBefore">Avisar</label><select id="rcBefore" class="input">${RC_BEFORE.map(([m, l]) => `<option value="${m}" ${(+r.before || 0) === m ? 'selected' : ''}>${l}</option>`).join('')}</select></div><div class="field"><label for="rcRep">Repetir</label><select id="rcRep" class="input">${Object.entries(RC_REPEAT).map(([k, l]) => `<option value="${k}" ${(r.repeat || 'no') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    <p class="small muted" id="rcNote" style="margin:0 0 10px"></p>
    <div class="btn-row"><button class="btn primary" data-act="rc-save">${isNew ? 'Crear recordatorio' : 'Guardar'}</button>${isNew ? '' : '<button class="btn danger" data-act="rc-del">Eliminar</button>'}</div></div>`);
  rcNote();
}
const RC = { cur: null };
function rcRead() {
  const r = RC.cur; if (!r) return null; const g = (id) => document.getElementById(id)?.value ?? '';
  r.title = g('rcTitle').trim(); r.date = g('rcDate') || r.date; r.time = g('rcTime') || r.time; r.before = +g('rcBefore') || 0; r.repeat = g('rcRep') || 'no'; r.taskId = g('rcTask') || ''; return r;
}
function rcNote() { const r = rcRead(); const e = document.getElementById('rcNote'); if (!e || !r) return; const probe = { ...r, done: false }; const n = rcNext(probe); e.textContent = n === null ? 'Esa fecha y hora ya pasó. Elige una futura.' : `Te aviso: ${cap(relDay(toISO(new Date(n))))} a las ${new Date(n).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}`.replace(/\.?$/, '.'); }
document.addEventListener('input', (e) => { if (e.target.closest && e.target.closest('[data-rcid]')) rcNote(); });
document.addEventListener('change', (e) => {
  const t = e.target; if (!(t.closest && t.closest('[data-rcid]'))) return;
  if (t.id === 'rcTask') { const task = S.tasks.find((x) => x.id === t.value); const ti = document.getElementById('rcTitle'); if (task && ti) { ti.value = `Entregar: ${task.title}`.slice(0, 80); if (task.due) { document.getElementById('rcDate').value = task.due; if (task.time) document.getElementById('rcTime').value = task.time; } } }
  rcNote();
});
const rcNew = () => { const d = new Date(Date.now() + 3600000); d.setMinutes(0, 0, 0); return { id: 'rc' + uid(), kind: 'estudiar', title: 'Estudiar', date: toISO(d), time: `${String(d.getHours()).padStart(2, '0')}:00`, before: 0, repeat: 'no', taskId: '', done: false, at: Date.now() }; };
Object.assign(VIDA_ACTS, {
  'rc-new': () => rcSheet(rcNew()),
  'rc-edit': (el) => { const r = rcList().find((x) => x.id === el.dataset.id); if (r) rcSheet({ ...r }); },
  'rc-kind': (el) => { const r = rcRead(); if (!r) return; const old = RC_KINDS.find((k) => k[0] === r.kind); r.kind = el.dataset.v; const k = RC_KINDS.find((x) => x[0] === r.kind); document.querySelectorAll('[data-act=rc-kind]').forEach((b) => { const on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); const ti = document.getElementById('rcTitle'); if (ti && (!ti.value.trim() || ti.value === old?.[1] || RC_KINDS.some((x) => x[1] === ti.value))) ti.value = k[0] === 'otro' ? '' : k[1]; rcNote(); },
  'rc-quick': (el) => { const v = el.dataset.v; const d = new Date(); if (v === 'noche') { d.setHours(20, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); } else if (v === 'man') { d.setDate(d.getDate() + 1); d.setHours(7, 0, 0, 0); } else d.setMinutes(d.getMinutes() + +v, 0, 0); document.getElementById('rcDate').value = toISO(d); document.getElementById('rcTime').value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; document.getElementById('rcBefore').value = '0'; rcNote(); },
  'rc-save': async () => {
    const r = rcRead(); if (!r) return; if (!r.title) { toast('Escribe qué quieres recordar.'); return; }
    if (rcNext({ ...r, done: false }) === null) { toast('Esa fecha y hora ya pasó. Elige una futura.'); return; }
    r.done = false; r.fired = {}; const L = rcList(); const i = L.findIndex((x) => x.id === r.id); const { ...clean } = r; if (i >= 0) L[i] = clean; else L.push(clean);
    closeSheet(false); commit(); Snd.chime(); rcSchedule();
    if ('Notification' in window && Notification.permission === 'default') { const ok = await ask({ title: '¿Activar avisos?', text: 'Para que el recordatorio te llegue como notificación, activa los avisos del teléfono.', ok: 'Activar' }); if (ok) enableNotifications(false); else toast('Recordatorio guardado. Sin avisos, solo te lo muestro con la app abierta.'); }
    else toast('Recordatorio guardado: ' + rcWhen(clean));
  },
  'rc-del': async () => { const r = RC.cur; if (!r) return; const ok = await ask({ title: '¿Eliminar este recordatorio?', ok: 'Eliminar', danger: true }); if (!ok) return; S.recs = rcList().filter((x) => x.id !== r.id); closeSheet(false); commit(); rcSchedule(); },
  'rc-done': (el) => { const r = rcList().find((x) => x.id === el.dataset.id); if (!r) return; if (r.repeat && r.repeat !== 'no') r.skipUntil = toISO(new Date()); else r.done = true; commit(); Snd.tick(); rcSchedule(); },
  'nt-off': () => { S.settings.notify = false; commit(); toast('Avisos apagados en este dispositivo.'); scheduleReminders(); },
});

/* ---------- Avisos con la app abierta (la nube cubre cuando está cerrada) ---------- */
let rcTimers = [];
function rcFire(r, at) {
  const key = String(at); r.fired ||= {}; if (r.fired[key]) return; r.fired[key] = 1; const keys = Object.keys(r.fired); if (keys.length > 8) delete r.fired[keys[0]];
  if (!r.repeat || r.repeat === 'no') r.done = true; save();
  const when = rcFmtTime(r.time); const body = +r.before ? `Es a las ${when}.` : 'Es ahora.';
  if ('Notification' in window && Notification.permission === 'granted' && S.settings.notify !== false) notify(r.title, body, `aldia-rc-${r.id}-${key}`);
  toast(`🔔 ${r.title}`, { action: 'Hecho', onAction: () => {} }); try { Snd.chime(); } catch { /* */ } try { navigator.vibrate && navigator.vibrate([120, 60, 120]); } catch { /* */ }
  if (['hoy', 'tareas', 'recordatorios'].includes(route().name)) softRender();
}
function rcSchedule() {
  rcTimers.forEach(clearTimeout); rcTimers = []; const now = Date.now();
  for (const r of rcList()) { const at = rcNext(r, now - 120000); if (at === null) continue; if (r.fired && r.fired[String(at)]) continue; const ms = at - now; if (ms <= 0) { if (ms > -120000) rcFire(r, at); continue; } if (ms < 12 * 3600000) rcTimers.push(setTimeout(() => rcFire(r, at), ms)); }
}
setInterval(rcSchedule, 5 * 60000); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') rcSchedule(); });
setTimeout(rcSchedule, 2500);
{ const baseSched = scheduleReminders; scheduleReminders = function () { baseSched(); rcSchedule(); }; }

/* ---------- Puertas de entrada ---------- */
{
  const baseT = viewTareas;
  viewTareas = function () { return baseT().replace(/(<p class="page-sub">[^<]*<\/p>)/, `$1${rcCardHTML()}`); };
}
{
  const baseMas = viewMas;
  viewMas = function () { return baseMas().replace('<ul class="rows"><li><a', `${notifCardHTML().replace('<button class="btn" data-act="nt-test">Probar un aviso</button>', '<button class="btn" data-act="nt-test">Probar un aviso</button><button class="btn" data-act="nt-off">Apagar</button>')}<ul class="rows" style="margin-top:14px"><li><a href="#/recordatorios"><span class="ico">${icon('bell')}</span><span class="txt"><b>Recordatorios</b><span>Crea avisos propios con hora y repetición</span></span>${icon('chev', 'chev')}</a></li><li><a`); };
}
