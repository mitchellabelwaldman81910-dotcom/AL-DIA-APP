/* Cinnavia 7.14 — Administración, respaldos y modo sin conexión.
   · La cuenta de administración (Mitchell) puede entrar a cualquier cuenta sin su contraseña, para dar soporte
     y recuperar datos. El servidor es quien lo autoriza y deja registro; la otra persona ve el ojito con el nombre.
   · Respaldos: la nube guarda versiones cada 10 minutos (40) y una copia por día (60 días) de cada cuenta,
     y una copia diaria de cada Bosque (45 días). Se pueden ver y restaurar desde Ajustes.
   · Sin conexión: todo se sigue guardando en el teléfono y se sincroniza solo en cuanto vuelve la red. */
'use strict';

const ADMIN_IDS = ['mitchell'];
const isAdminSession = () => !!(REG.me && ADMIN_IDS.includes(REG.me) && tokens()[REG.me]);
const isAdminVisit = (id = REG.current) => !!(REG.adminSess && REG.adminSess[id]);

/* ---------- Entrar a otra cuenta ---------- */
async function adminEnter(id) {
  try {
    const had = !!tokens()[id] && (REG.users || []).some((u) => u.id === id) && !isAdminVisit(id);
    const r = await cloudFetch('POST', { kind: 'adminenter', as: REG.me, user: id });
    const me0 = REG.me; acceptSession(r); REG.me = me0;
    // si esa persona ya tenía su sesión en este dispositivo, se respeta; si no, es una visita temporal
    if (!had) (REG.adminSess ||= {})[r.user.id] = Date.now();
    // vista de solo lectura: la administración puede mirar, pero nada se guarda en esa cuenta
    (REG.adminView ||= {})[r.user.id] = true;
    saveReg();
    if (sheet().open) closeSheet(false);
    switchProfile(r.user.id);
    toast(`Entraste como administración a la cuenta de ${r.user.name}.${had ? '' : ' Al salir, este dispositivo no guarda su sesión.'}`, { ms: 5200 });
    return true;
  } catch (e) { toast(e.message || 'No se pudo entrar.'); return false; }
}
{
  const baseEnter = enterProfile;
  enterProfile = async function (id) {
    if (id && !isForestId(id) && id !== REG.me && isAdminSession()) return adminEnter(id);
    return baseEnter(id);
  };
}
/* revisa cada pocos segundos si la administración ya salió de alguna cuenta ajena */
const ADM_CLEAN = new Set();
const isAdminView = (id = REG.current) => !!(REG.adminView && REG.adminView[id]);
setInterval(() => {
  for (const id of Object.keys(REG.adminView || {})) if (id !== REG.current) delete REG.adminView[id];
  for (const id of Object.keys(REG.adminSess || {})) if (id !== REG.current && !ADM_CLEAN.has(id)) { ADM_CLEAN.add(id); adminCleanup(id); }
}, 2500);
/* Cuando la administración sale de una cuenta ajena, se sube todo y se borra su copia de este dispositivo */
function adminCleanup(id, tries = 0) {
  if (REG.current === id) { ADM_CLEAN.delete(id); return; }
  if (CLOUD.busy || isDirty(id) || (REG.gout || []).length) {
    if (tries < 40) { if (!CLOUD.busy) cloudSync(); setTimeout(() => adminCleanup(id, tries + 1), 1500); } else ADM_CLEAN.delete(id);
    return;
  }
  delete tokens()[id];
  REG.users = (REG.users || []).filter((u) => u.id !== id);
  if (REG.adminSess) delete REG.adminSess[id];
  saveReg();
  try { localStorage.removeItem(keyFor(id)); } catch { /* */ }
  ADM_CLEAN.delete(id);
}

/* ---------- Panel de administración ---------- */
const fmtWhen = (ms) => (ms ? `${cap(relDay(toISO(new Date(ms))))}, ${new Date(ms).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}` : 'Nunca');
function adminCardHTML() {
  if (!isAdminSession()) return '';
  return `<h2 class="sec">Administración</h2><div class="card adm-card">
    <p class="muted" style="margin:0 0 12px">Como administración puedes entrar a cualquier cuenta, revisar sus copias de seguridad y restaurarlas. Quien tenga la sesión abierta verá que estás ahí.</p>
    <div class="btn-row"><button class="btn primary" data-act="adm-open">${icon('users')}Todas las cuentas</button><button class="btn" data-act="adm-export">${icon('download')}Respaldo total</button></div></div>`;
}
{
  const baseAcc = accountCardHTML;
  accountCardHTML = function () { return baseAcc() + adminCardHTML() + backupInfoHTML(); };
}
function backupInfoHTML() {
  const p = profile(REG.current); if (!p || isForestId(p.id) || !tokens()[p.id]) return '';
  return `<div class="card bk-info"><b>Tus datos están protegidos</b><ul>
    <li>Versiones automáticas cada vez que cambian (las últimas 40).</li><li>Una copia por día durante 60 días.</li>
    <li>Ningún dispositivo puede guardar los datos de una cuenta dentro de otra.</li><li>Sin internet, todo se guarda aquí y se sube solo al volver la red.</li></ul></div>`;
}
const ADM = { data: null, q: '' };
async function adminOpen() {
  openSheet(`${sheetHead('Todas las cuentas')}<div class="sheet-body" id="admBody">${typeof loaderHTML === 'function' ? loaderHTML('Cargando…') : 'Cargando…'}</div>`);
  try { ADM.data = await cloudFetch('GET', null, 'kind=admin'); adminPaint(); }
  catch (e) { const b = document.getElementById('admBody'); if (b) b.innerHTML = `<p class="small" style="color:var(--red)">${esc(e.message)}</p>`; }
}
let admTimer = null;
function admAutoRefresh() {
  if (admTimer) return;
  admTimer = setInterval(async () => {
    if (!document.getElementById('admBody')) { clearInterval(admTimer); admTimer = null; return; }
    if (document.visibilityState !== 'visible' || (document.activeElement && document.activeElement.id === 'admQ')) return;
    try { ADM.data = await cloudFetch('GET', null, 'kind=admin'); adminPaint(); } catch (e) { /* sin red */ }
  }, 15000);
}
function adminPaint() {
  admAutoRefresh();
  const b = document.getElementById('admBody'); if (!b || !ADM.data) return;
  const q = ADM.q.trim().toLowerCase();
  const users = ADM.data.users.filter((u) => !q || u.name.toLowerCase().includes(q) || u.id.includes(q));
  const tot = ADM.data.users.length;
  b.innerHTML = `<div class="adm-stats"><span><b>${tot}</b>cuentas</span><span><b>${ADM.data.users.filter((u) => u.online).length}</b>en línea</span><span><b>${ADM.data.forests.length}</b>Bosques</span><span><b>${ADM.data.users.reduce((a, u) => a + u.daily, 0)}</b>copias diarias</span></div>
    <input class="input" id="admQ" placeholder="Buscar por nombre o usuario" value="${esc(ADM.q)}" autocomplete="off" style="margin:4px 0 12px">
    <ul class="rows adm-list">${users.map((u) => `<li><div class="adm-row">${avatar({ id: u.id, name: u.name, color: u.color }, 'sm')}
      <span class="adm-main"><b>${esc(u.name)}${u.admin ? ' <span class="sl-chip">Admin</span>' : ''}</b><span class="tiny faint">@${esc(u.id)} · ${plural(u.subjects, 'materia', 'materias')} · ${plural(u.tasks, 'tarea', 'tareas')} · nivel ${u.level}</span>
      <span class="tiny adm-seen ${u.online ? 'on' : 'faint'}">${u.online ? '<i class="adm-dot"></i>En línea ahora' : (u.seen ? 'Última vez que entró: ' + fmtWhen(u.seen) : (u.at ? 'Última actividad guardada: ' + fmtWhen(u.at) + ' (aún sin registro de entrada)' : 'Sin actividad registrada'))}</span><span class="tiny faint">Último guardado: ${fmtWhen(u.at)} · ${u.versions + u.daily} copias</span><span class="tiny faint adm-sec">Cuenta creada: ${u.created ? new Date(u.created).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}${u.device ? ` · Dispositivo: ${esc(String(u.device).slice(0, 40))}` : ''}${u.at && Date.now() - u.at > 30 * 86400000 ? ' · <b class="adm-warn">Inactiva 30+ días</b>' : ''}${!u.at ? ' · <b class="adm-warn">Sin datos</b>' : ''}</span></span>
      <span class="adm-btns">${u.id === REG.me ? '' : `<button class="btn primary" data-act="adm-enter" data-id="${esc(u.id)}">Entrar</button>`}${u.id === REG.me ? '' : `<button class="btn" data-act="adm-msg" data-id="${esc(u.id)}" data-name="${esc(u.name)}">Mensaje</button>`}<button class="btn" data-act="cloud-history" data-p="${esc(u.id)}">Copias</button></span></div></li>`).join('') || '<li><p class="small muted" style="padding:12px 16px;margin:0">Sin resultados.</p></li>'}</ul>
    ${ADM.data.forests.length ? `<h2 class="sec">Bosques</h2><ul class="rows adm-list">${ADM.data.forests.map((f) => `<li><div class="adm-row">${monogram(f.name, f.color, 'sm')}<span class="adm-main"><b>${esc(f.name)}</b><span class="tiny faint">${plural(f.members.length, 'integrante', 'integrantes')} · ${plural(f.items, 'elemento', 'elementos')} · ${plural(f.daily, 'copia diaria', 'copias diarias')}</span></span>
      <span class="adm-btns"><button class="btn" data-act="g-history" data-id="${esc(f.id)}">Copias</button></span></div></li>`).join('')}</ul>` : ''}`;
  const qi = document.getElementById('admQ');
  if (qi) qi.addEventListener('input', () => { ADM.q = qi.value; const pos = qi.selectionStart; adminPaint(); const n = document.getElementById('admQ'); n.focus(); n.setSelectionRange(pos, pos); });
}
function downloadJSON(obj, name) {
  const blob = new Blob([JSON.stringify(obj, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

/* ---------- Copias en la nube (personales y de Bosques) ---------- */
function histRow(h, id, extra) {
  return `<li><div class="rowline hist-row"><span style="flex:1;min-width:0"><b style="display:block">${extra || fmtWhen(h.at)}</b><span class="small muted">${plural(h.subjects, 'materia', 'materias')} · ${plural(h.tasks, 'tarea', 'tareas')} · ${plural(h.notes, 'apunte', 'apuntes')}${h.owner && h.owner !== id ? ' · <span style="color:var(--red)">datos de otra cuenta</span>' : ''}</span></span>
    <button class="btn" data-act="cloud-restore" data-p="${esc(id)}" ${h.day ? `data-day="${h.day}"` : `data-at="${h.at}"`}>Restaurar</button></div></li>`;
}
Object.assign(VIDA_ACTS, {
  'adm-open': () => adminOpen(),
  'adm-enter': (el) => adminEnter(el.dataset.id),
  'adm-export': async (el) => {
    el.disabled = true; const t = el.innerHTML; el.textContent = 'Preparando…';
    try { const r = await cloudFetch('GET', null, 'kind=adminexport'); downloadJSON(r, `al-dia-respaldo-total-${today()}.json`); toast(`Respaldo descargado: ${plural(Object.keys(r.profiles).length, 'cuenta', 'cuentas')} y ${plural(Object.keys(r.forests).length, 'Bosque', 'Bosques')}.`); }
    catch (e) { toast(e.message); }
    el.disabled = false; el.innerHTML = t;
  },
  'cloud-history': async (el) => {
    const id = (el && el.dataset && el.dataset.p) || dataOwner();
    if (!id || (!tokens()[id] && !isAdminSession())) { toast('Entra con tu usuario primero.'); return; }
    const name = (ADM.data?.users.find((u) => u.id === id)?.name) || profile(id)?.name || id;
    openSheet(`${sheetHead(id === dataOwner() ? 'Copias de seguridad' : `Copias de ${name}`)}<div class="sheet-body"><p class="muted" style="margin:0 0 12px">La nube guarda una versión cada vez que los datos cambian (las últimas 40) y una copia por día durante 60 días. Restaurar no borra nada: la versión actual también queda guardada.</p><div id="histList">${typeof loaderHTML === 'function' ? loaderHTML('Cargando…') : 'Cargando…'}</div></div>`);
    try {
      const r = await cloudFetch('GET', null, `kind=history&p=${encodeURIComponent(id)}`);
      const box = document.getElementById('histList'); if (!box) return;
      const daily = r.daily || [];
      box.innerHTML = (r.list.length ? `<span class="lbl">Recientes</span><ul class="rows">${r.list.map((h) => histRow(h, id)).join('')}</ul>` : '')
        + (daily.length ? `<span class="lbl" style="margin-top:16px">Una por día</span><ul class="rows">${daily.map((h) => histRow(h, id, cap(fmtDayLong(h.day)))).join('')}</ul>` : '')
        || '<p class="small muted" style="margin:0">Todavía no hay copias anteriores. Se irán guardando solas desde ahora.</p>';
    } catch (e) { const box = document.getElementById('histList'); if (box) box.innerHTML = `<p class="small" style="color:var(--red)">${esc(e.message)}</p>`; }
  },
  'cloud-restore': async (el) => {
    const id = el.dataset.p || dataOwner(); const at = +el.dataset.at || 0; const day = el.dataset.day || '';
    const when = day ? fmtDayLong(day) : `el ${relDay(toISO(new Date(at)))} a las ${new Date(at).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}`;
    const ok = await ask({ title: '¿Volver a esta copia?', text: `Los datos${id !== dataOwner() ? ` de ${profile(id)?.name || id}` : ''} quedan como estaban ${day ? 'el ' : ''}${when}. La versión actual también se guarda, así que puedes regresar.`, ok: 'Restaurar' });
    if (!ok) return;
    try {
      const r = await cloudFetch('POST', { kind: 'restore', as: id, profile: id, at, day });
      const next = stampOwner(migrate(r.data), keyFor(id)); next.cloudAt = r.at;
      if (id === dataOwner() || localStorage.getItem(keyFor(id))) { try { localStorage.setItem(keyFor(id), JSON.stringify(next)); } catch { /* */ } setBase(id, next); setDirty(id, false); }
      if (id === dataOwner()) S = next;
      closeSheet(false); render(); applyTheme(); toast('Listo: los datos volvieron a esa copia.'); Snd.chime();
    } catch (e) { toast(e.message); }
  },
  'g-history': async (el) => {
    const fid = el.dataset.id || curFid(); if (!fid) return;
    openSheet(`${sheetHead('Copias del Bosque')}<div class="sheet-body"><p class="muted" style="margin:0 0 12px">Cada día se guarda una copia completa del Bosque (45 días). Restaurar solo regresa lo que se borró o falta: nunca quita lo nuevo.</p><div id="gHist">${typeof loaderHTML === 'function' ? loaderHTML('Cargando…') : 'Cargando…'}</div></div>`);
    try {
      const r = await cloudFetch('GET', null, `kind=ghistory&forest=${encodeURIComponent(fid)}&as=${encodeURIComponent(REG.me)}`);
      const box = document.getElementById('gHist'); if (!box) return;
      box.innerHTML = r.list.length ? `<ul class="rows">${r.list.map((h) => `<li><div class="rowline hist-row"><span style="flex:1"><b style="display:block">${esc(cap(fmtDayLong(h.day)))}</b><span class="small muted">${plural(h.items, 'elemento', 'elementos')}</span></span><button class="btn" data-act="g-restore" data-id="${esc(fid)}" data-day="${h.day}">Recuperar</button></div></li>`).join('')}</ul>` : '<p class="small muted" style="margin:0">La primera copia se guarda hoy en cuanto alguien suba algo.</p>';
    } catch (e) { const box = document.getElementById('gHist'); if (box) box.innerHTML = `<p class="small" style="color:var(--red)">${esc(e.message)}</p>`; }
  },
  'g-restore': async (el) => {
    const ok = await ask({ title: '¿Recuperar lo borrado?', text: `Regresan las tareas, ideas y notas que existían el ${fmtDayLong(el.dataset.day)} y que ya no están. Lo que se agregó después se queda igual.`, ok: 'Recuperar' });
    if (!ok) return;
    try { const r = await cloudFetch('POST', { kind: 'grestore', as: REG.me, forest: el.dataset.id, day: el.dataset.day }); closeSheet(false); await cloudSync(); toast(r.restored ? `Listo: ${plural(r.restored, 'elemento regresó', 'elementos regresaron')}.` : 'No faltaba nada de ese día.'); }
    catch (e) { toast(e.message); }
  },
});
function fmtDayLong(iso) { try { return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }); } catch { return iso; } }

/* ---------- Modo sin conexión ---------- */
const NET = { off: !navigator.onLine, back: 0, offAt: Date.now() };
function netPaint() {
  let el = document.getElementById('netPill');
  if (!el) { el = document.createElement('div'); el.id = 'netPill'; el.className = 'net-pill'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
  const pend = (REG.gout || []).length + (dataOwner() && isDirty(dataOwner()) ? 1 : 0);
  if (NET.off && Date.now() - NET.offAt < 6500) { el.innerHTML = `<i class="net-dot off"></i><span><b>Sin conexión</b>Todo se guarda en este teléfono y se sincroniza solo al volver la red${pend ? ` · ${plural(pend, 'cambio en espera', 'cambios en espera')}` : ''}.</span>`; el.dataset.show = '1'; }
  else if (NET.back && Date.now() - NET.back < 4000) { el.innerHTML = `<i class="net-dot"></i><span><b>De vuelta en línea</b>${CLOUD.busy || pend ? 'Sincronizando tus cambios…' : 'Todo quedó sincronizado.'}</span>`; el.dataset.show = '1'; }
  else el.dataset.show = '0';
}
window.addEventListener('offline', () => { NET.off = true; NET.offAt = Date.now(); netPaint(); setTimeout(netPaint, 6600); if (isGroup() || route().name === 'ajustes') softRender(); });
window.addEventListener('online', () => {
  NET.off = false; NET.back = Date.now(); netPaint();
  setTimeout(() => { cloudSync(); }, 200); setTimeout(netPaint, 1800); setTimeout(netPaint, 4200);
  if (isGroup()) setTimeout(softRender, 2500);
});
document.addEventListener('DOMContentLoaded', () => { setTimeout(netPaint, 600); setTimeout(netPaint, 7200); });

/* Fotos y PDFs de los Bosques: se guardan en el teléfono para consultarlos sin internet */
async function prefetchGroupFiles() {
  if (!navigator.onLine || !REG.me || !tokens()[REG.me] || typeof loadGImg !== 'function') return;
  let n = 0;
  for (const [fid, f] of Object.entries(FOR.f || {})) {
    for (const it of f.items || []) {
      if (it.deleted || !(it.img || it.fileId)) continue;
      const id = it.fileId || it.id;
      try { if (await DB.get('files', 'gi:' + id)) continue; } catch { /* */ }
      await loadGImg(fid, id); if (++n >= 25) return;
    }
  }
}
setInterval(() => { if (document.visibilityState === 'visible') prefetchGroupFiles(); }, 90000);
setTimeout(prefetchGroupFiles, 8000);
