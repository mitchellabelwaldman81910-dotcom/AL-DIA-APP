/* Al Día 7.6 — Salones rediseñados.
   Un solo lugar claro para crear, unirse (por invitación o con código) y entrar a tus Salones;
   un encabezado sobrio dentro de cada Salón y hojas cuidadas para crear, invitar y unirse. */
'use strict';
const SL = { color: null, created: null };
const SL_COLORS = ['#2F8A5B', '#3E9A93', '#5B7FD1', '#B07AC8', '#D27C5E', '#C9A55C', '#4F9A63', '#7A8CA8'];
const fmtCode = (id) => String(id || '').toUpperCase().replace(/^(.{5})(.+)$/, '$1-$2');
const normCode = (c) => String(c || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const monoText = (name) => { const w = String(name || '?').trim().split(/\s+/); const num = w.find((x) => /^\d+$/.test(x)); if (num) return num.slice(0, 3); return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase(); };
const monogram = (name, color, cls = '') => { const t = monoText(name); return `<span class="mono ${cls} ${t.length > 2 ? 'long' : ''}" style="--mc:${safeColor(color || '#2F8A5B')}" aria-hidden="true">${esc(t)}</span>`; };
const slMine = () => (REG.me && tokens()[REG.me] ? Object.values(FOR.f).filter((f) => f.meta && f.meta.members.includes(REG.me)) : []);
const memberName = (u) => FOR.members?.[u]?.name || cap(u);
const memberColor2 = (u) => FOR.members?.[u]?.color || '#7A8CA8';

function slStats(f) {
  const items = (f.items || []).filter((x) => !x.deleted);
  const done = gDone();
  const pend = items.filter((x) => x.type === 'task' && !done[x.id] && (!x.due || diffDays(today(), x.due) >= 0)).length;
  const focus = items.filter((x) => x.type === 'focus' && typeof focusEnd === 'function' && Date.now() < focusEnd(x) && x.start <= Date.now() + 60000).length;
  const life = forestLife(f.meta.id); const lv = levelOf(life, FOREST_T, 1000);
  return { pend, focus, lv, reqs: (f.reqs || []).length };
}
function stackHTML(users, max = 5) {
  const more = users.length - max;
  return `<span class="stack">${users.slice(0, max).map((u) => `<span class="mini xs" style="--pc:${safeColor(memberColor2(u))}" title="${esc(memberName(u))}">${esc(initials(memberName(u)))}</span>`).join('')}${more > 0 ? `<span class="mini xs more">+${more}</span>` : ''}</span>`;
}
function slCardHTML(f, act = 'profile-pick') {
  const m = f.meta; const st = slStats(f);
  const chips = [
    st.reqs ? `<span class="sl-chip warn">${plural(st.reqs, 'solicitud', 'solicitudes')}</span>` : '',
    st.focus ? `<span class="sl-chip live"><i class="live-dot" data-on="1"></i>${st.focus} concentrándose</span>` : '',
    st.pend ? `<span class="sl-chip">${plural(st.pend, 'pendiente', 'pendientes')}</span>` : '<span class="sl-chip ok">Al día</span>',
  ].join('');
  return `<button type="button" class="sl-card" data-act="${act}" data-id="f:${m.id}">
    ${monogram(m.name, m.color)}
    <span class="sl-main"><b class="sl-name">${esc(m.name)}</b>
      <span class="sl-meta">${plural(m.members.length, 'integrante', 'integrantes')} · nivel ${st.lv}</span>
      <span class="sl-foot">${stackHTML(m.members, 4)}<span class="sl-chips">${chips}</span></span></span>
    ${icon('chev', 'chev')}</button>`;
}
/* compatibilidad con las vistas anteriores */
function forestCardHTML(f, act) { return slCardHTML(f, act); }

function slStepsHTML() {
  return `<ol class="sl-steps">
    <li><span class="sl-n">1</span><span><b>Crea un Salón o únete</b><span>Con el código que te compartan o con una invitación a tu usuario.</span></span></li>
    <li><span class="sl-n">2</span><span><b>Compartan sus pendientes</b><span>Tareas con foto, trabajos en equipo, ideas y sala de enfoque, en tiempo real.</span></span></li>
    <li><span class="sl-n">3</span><span><b>Crezcan juntos</b><span>El árbol del Salón sube con lo que cumple cada integrante.</span></span></li></ol>`;
}
function salonesBody() {
  if (!REG.me || !tokens()[REG.me]) return `<div class="empty"><h3>Entra con tu usuario</h3><p>Los Salones viven en la nube: necesitas tu usuario y contraseña para verlos.</p><p><button class="btn primary" data-act="profile-choose">Entrar</button></p></div>`;
  const mine = slMine(); const inv = FOR.invites || []; const reqs = FOR.myreqs || [];
  let o = '';
  if (inv.length) o += `<h2 class="sec">Invitaciones <small>${inv.length}</small></h2><div class="sl-list">${inv.map((i) => `<div class="sl-inv">
      ${monogram(i.forestName, i.color || '#2F8A5B')}<span class="sl-main"><b class="sl-name">${esc(i.forestName)}</b><span class="sl-meta">${esc(i.fromName)} te invitó · ${ago(i.at)}</span></span>
      <span class="sl-acts"><button class="btn quiet" data-act="invite-no" data-id="${i.forest}">Rechazar</button><button class="btn primary" data-act="invite-yes" data-id="${i.forest}">Unirme</button></span></div>`).join('')}</div>`;
  if (reqs.length) o += `<h2 class="sec">Solicitudes enviadas</h2><div class="sl-list">${reqs.map((r) => `<div class="sl-inv pend">
      ${monogram(r.forestName, r.color)}<span class="sl-main"><b class="sl-name">${esc(r.forestName)}</b><span class="sl-meta"><i class="live-dot" data-on="1"></i>Esperando a que te acepten · ${ago(r.at)}</span></span>
      <span class="sl-acts"><button class="btn quiet" data-act="sl-cancel" data-id="${r.forest}">Cancelar</button></span></div>`).join('')}</div>`;
  o += `<h2 class="sec">Tus Salones ${mine.length ? `<small>${mine.length}</small>` : ''}</h2>`;
  o += mine.length ? `<div class="sl-list">${mine.map((f) => slCardHTML(f)).join('')}</div>` : `<div class="sl-empty">${slStepsHTML()}</div>`;
  o += `<div class="sl-tiles"><button type="button" class="sl-tile" data-act="forest-new"><span class="sl-ti">${icon('plus')}</span><b>Crear un Salón</b><span>Para tu grupo, equipo o clase</span></button>
    <button type="button" class="sl-tile" data-act="sl-join"><span class="sl-ti">${icon('link')}</span><b>Unirme con código</b><span>Pide el código a un integrante</span></button></div>`;
  return o;
}
function viewSalones() {
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Salones</h1>
    <p class="page-sub">Organícense en grupo: todo se comparte y se guarda al instante.</p>${salonesBody()}`;
}
function bosquesTabHTML() { return salonesBody(); }

/* ---------- Crear ---------- */
function slPreview(name, color) {
  return `<div class="sl-card static">${monogram(name || 'S', color)}<span class="sl-main"><b class="sl-name">${esc(name || 'Tu Salón')}</b><span class="sl-meta">1 integrante · nivel 0</span><span class="sl-foot">${stackHTML([REG.me])}<span class="sl-chips"><span class="sl-chip ok">Nuevo</span></span></span></span></div>`;
}
function openCreateSalon() {
  SL.color = SL.color || SL_COLORS[0];
  openSheet(`${sheetHead('Nuevo Salón')}<div class="sheet-body">
    <div class="field"><label for="slName">Nombre</label><input id="slName" class="input" maxlength="30" placeholder="Ej. 512 T.V, Equipo de Historia" autocomplete="off"></div>
    <div class="field"><span class="lbl">Color</span><div class="sl-sw" role="group" aria-label="Color del Salón">${SL_COLORS.map((c) => `<button type="button" class="sw" data-act="sl-color" data-v="${c}" style="--c:${c}" aria-pressed="${SL.color === c}" aria-label="Color ${c}"></button>`).join('')}</div></div>
    <span class="lbl">Así se verá</span><div id="slPrev">${slPreview('', SL.color)}</div>
    <p class="small muted" style="margin:12px 0 0">Después te damos un código para que tus compañeros se unan.</p></div>
    <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="sl-create">Crear Salón</button></div>`);
  setTimeout(() => document.getElementById('slName')?.focus(), 80);
}
document.addEventListener('input', (e) => { if (e.target.id === 'slName') { const p = document.getElementById('slPrev'); if (p) p.innerHTML = slPreview(e.target.value.trim(), SL.color); } });

/* ---------- Invitar (código + usuario) ---------- */
function codeBoxHTML(fid, name) {
  return `<div class="code-box"><span class="tiny faint">Código del Salón</span><b class="code" aria-label="Código ${fmtCode(fid).split('').join(' ')}">${fmtCode(fid)}</b>
    <div class="btn-row"><button class="btn" data-act="sl-copy" data-id="${fid}">${icon('copy', 'sm')}Copiar</button><button class="btn" data-act="sl-share" data-id="${fid}" data-name="${esc(name)}">${icon('share', 'sm')}Compartir</button></div></div>`;
}
function openInviteSalon(fid, fresh = false) {
  const f = FOR.f[fid]?.meta; if (!f) return;
  openSheet(`${sheetHead(fresh ? 'Salón creado' : 'Invitar al Salón')}<div class="sheet-body">
    ${fresh ? `<div class="sl-ok">${slPreview(f.name, f.color)}</div>` : ''}
    <h3 class="sl-h3">Comparte el código</h3><p class="small muted" style="margin:0 0 10px">Quien lo tenga puede pedir unirse; tú o cualquier integrante acepta la solicitud.</p>
    ${codeBoxHTML(f.id, f.name)}
    <h3 class="sl-h3">O invita por usuario</h3>
    <form class="sl-user" id="slInvForm" autocomplete="off"><span class="at">@</span><label for="slInvIn" class="sr">Usuario</label><input id="slInvIn" placeholder="usuario de tu compañero" autocapitalize="off" spellcheck="false"><button class="btn primary">Enviar</button></form>
    <p class="small" id="slInvMsg" role="status" style="min-height:20px;margin:8px 0 0"></p></div>
    <div class="sheet-foot"><span class="grow"></span>${fresh ? `<button class="btn primary" data-act="sl-enter" data-id="${f.id}">Entrar al Salón</button>` : '<button class="btn primary" data-act="sheet-close">Listo</button>'}</div>`);
}
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'slInvForm') return; e.preventDefault();
  const inp = document.getElementById('slInvIn'); const msg = document.getElementById('slInvMsg'); const u = userSlug(inp.value || '');
  const fid = curFid() || SL.created; if (!u || !fid) return;
  msg.className = 'small muted'; msg.textContent = 'Enviando…';
  try { const r = await cloudFetch('POST', { kind: 'finvite', as: REG.me, forest: fid, to: u }); msg.className = 'small ok-t'; msg.textContent = `Invitación enviada a ${r.name}. Le llega al instante.`; inp.value = ''; Snd.chime(); }
  catch (er) { msg.className = 'small err-t'; msg.textContent = er.message; }
});

/* ---------- Unirse con código ---------- */
function openJoinSalon() {
  openSheet(`${sheetHead('Unirme con código')}<div class="sheet-body" id="slJoinBody">
    <p class="muted" style="margin:0 0 12px">Pide el código a alguien del Salón. Les llega tu solicitud al instante y, cuando la acepten, entras.</p>
    <div class="field"><label for="slCode">Código</label><input id="slCode" class="input code-in" maxlength="14" placeholder="XXXXX-XXXXX" autocapitalize="characters" autocomplete="off" spellcheck="false"></div>
    <p class="small err-t" id="slJoinMsg" role="status" style="min-height:20px;margin:0"></p></div>
    <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="sl-join-go">Enviar solicitud</button></div>`);
  setTimeout(() => document.getElementById('slCode')?.focus(), 80);
}
document.addEventListener('input', (e) => { if (e.target.id === 'slCode') { const v = normCode(e.target.value).slice(0, 10).toUpperCase(); const f = v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v; if (e.target.value !== f) e.target.value = f; } });

/* ---------- Solicitudes dentro del Salón ---------- */
function reqsHTML() {
  const f = FOR.f[curFid()]; const rs = (f && f.reqs) || []; if (!rs.length) return '';
  return `<section class="sl-reqs"><h2 class="sec" style="margin-top:0">Quieren unirse <small>${rs.length}</small></h2>${rs.map((r) => `<div class="sl-inv">
    <span class="mini" style="--pc:${safeColor(r.color)}">${esc(initials(r.name))}</span><span class="sl-main"><b class="sl-name">${esc(r.name)}</b><span class="sl-meta">@${esc(r.user)} · ${ago(r.at)}</span></span>
    <span class="sl-acts"><button class="btn quiet" data-act="sl-approve" data-id="${esc(r.user)}" data-v="0">Rechazar</button><button class="btn primary" data-act="sl-approve" data-id="${esc(r.user)}" data-v="1">Aceptar</button></span></div>`).join('')}</section>`;
}

/* ---------- Encabezado dentro de un Salón ---------- */
function groupHead(title, sub) {
  const m = forestMeta();
  return `<section class="g-head">
    <div class="g-bar">${m ? `<button type="button" class="g-id" data-act="profile-sheet" aria-label="Cambiar de Salón o de usuario">${monogram(m.name, m.color, 'sm')}<span><b>${esc(m.name)}</b><span class="tiny faint">${plural(m.members.length, 'integrante', 'integrantes')}</span></span>${icon('chev', 'chev sm')}</button>` : '<span></span>'}
      <button type="button" class="who-chip" data-act="profile-sheet">${mini(me(), 'xs')}<span>${esc(me())}</span></button></div>
    <h1 class="page-title">${title}</h1>${sub ? `<p class="page-sub">${sub}</p>` : ''}${groupStatus()}</section>`;
}
function viewGrupo() {
  const tasks = gAll('task').sort((a, b) => dueKey(a).localeCompare(dueKey(b)));
  const pend = tasks.filter((t) => !gDone()[t.id] && (!t.due || diffDays(today(), t.due) >= -3));
  const done = tasks.filter((t) => gDone()[t.id]);
  const by = {}; for (const t of pend) (by[bucketOf(t)] ||= []).push(t);
  const nf = typeof focusList === 'function' ? focusList().length : 0;
  if (typeof focusMine === 'function' && focusMine()) focusWatch();
  const tpls = typeof allTpls === 'function' ? allTpls(curFid()).length : 0;
  return `${groupHead('Pendientes', pend.length ? `${plural(pend.length, 'pendiente', 'pendientes')} del grupo` : 'El grupo va al día')}
    ${reqsHTML()}
    <form class="quick g-compose" id="gTaskForm" autocomplete="off"><div class="quick-row"><label for="gTaskIn" class="sr">Nueva tarea del Salón</label>
      <input id="gTaskIn" placeholder="Sube una tarea para todos…"><button class="quick-go">${icon('plus', 'sm')}Subir</button></div>
      <div class="quick-preview" id="gTaskPrev"></div></form>
    <div class="g-tools">
      <button type="button" class="g-tool" data-act="g-new">${icon('cam')}<span>Con foto</span></button>
      <button type="button" class="g-tool ${nf ? 'on' : ''}" data-act="focus-open">${icon('headphones')}<span>Enfoque${nf ? ` · ${nf}` : ''}</span>${nf ? '<i class="live-dot" data-on="1"></i>' : ''}</button>
      <button type="button" class="g-tool" data-act="tpl-open">${icon('clipboard')}<span>Plantillas${tpls ? ` · ${tpls}` : ''}</span></button>
      <button type="button" class="g-tool" data-act="forest-invite">${icon('users')}<span>Invitar</span></button></div>
    ${pushBanner()}
    ${pend.length ? BUCKETS.filter(([k]) => by[k]).map(([k, l]) => `<div class="group-h ${k === 'late' ? 'late' : ''}">${l}<span class="count">${by[k].length}</span></div><ul class="tasks">${by[k].map(groupTaskRow).join('')}</ul>`).join('')
      : `<div class="empty" style="margin-top:8px"><h3>Sin pendientes del grupo</h3><p>Cuando alguien suba una tarea, aparece aquí para todos al instante.</p></div>`}
    ${done.length ? `<div class="group-h">Ya las hice<span class="count">${done.length}</span></div><ul class="tasks">${done.slice(0, 20).map(groupTaskRow).join('')}</ul>` : ''}`;
}
function viewMasGrupo() {
  const p = profile(); const f = forestMeta(); const st = S.settings;
  if (!p || !f) return '<div class="empty"><h3>Este Salón ya no está</h3><p><button class="btn" data-act="profile-choose">Volver</button></p></div>';
  const rows = f.members.map((id) => { const t = id === REG.me ? treeNow(id) : FOR.trees[id] || { level: 0 }; return { id, name: memberName(id), color: memberColor2(id), level: t.level || 0 }; });
  return `${groupHead('Ajustes del Salón', '')}
    ${reqsHTML()}
    <h2 class="sec">Integrantes <small>${rows.length}</small></h2>
    <ul class="rows sl-members">${rows.map((r) => `<li><div class="rowline"><span class="mini" style="--pc:${safeColor(r.color)}">${esc(initials(r.name))}</span><span class="txt"><b>${esc(r.name)}${r.id === REG.me ? ' (tú)' : ''}</b><span>@${esc(r.id)}${r.id === f.owner ? ' · fundó el Salón' : ''}</span></span><span class="sl-chip">Nivel ${r.level}</span></div></li>`).join('')}</ul>
    <h2 class="sec">Invitar</h2>
    ${codeBoxHTML(f.id, f.name)}
    <p style="margin:10px 0 0"><button class="btn" data-act="forest-invite">${icon('users', 'sm')}Invitar por usuario</button></p>
    <h2 class="sec">Salón</h2>
    <ul class="rows">
      <li><button type="button" class="rowbtn" data-act="forest-rename"><span class="ico">${icon('edit')}</span><span class="txt"><b>Nombre</b><span>${esc(f.name)}</span></span>${icon('chev', 'chev')}</button></li>
      <li><button type="button" class="rowbtn" data-act="g-push"><span class="ico">${icon('bell')}</span><span class="txt"><b>Avisos</b><span>${REG.gpush ? 'Activados en este dispositivo' : 'Recibe una notificación cuando alguien suba algo'}</span></span>${icon('chev', 'chev')}</button></li>
      <li><button type="button" class="rowbtn" data-act="profile-choose"><span class="ico">${icon('back')}</span><span class="txt"><b>Volver a mi usuario</b><span>Cambiar de usuario o de Salón</span></span>${icon('chev', 'chev')}</button></li>
      <li><button type="button" class="rowbtn" data-act="style-open"><span class="ico">${icon('palette')}</span><span class="txt"><b>Estilo de la app</b><span>${typeof ESTILOS !== 'undefined' ? ESTILOS[currentStyle()].name : ''} · ${st.theme === 'dark' ? 'noche' : 'día'}</span></span>${icon('chev', 'chev')}</button></li>
      <li><a href="#/instalar"><span class="ico">${icon('phone')}</span><span class="txt"><b>Instalar la app</b><span>Necesario para avisos en iPhone y iPad</span></span>${icon('chev', 'chev')}</a></li></ul>
    <p style="margin-top:22px"><button class="btn danger" data-act="forest-leave">Salir de este Salón</button></p>`;
}

/* ---------- ¿Quién eres? y hoja de usuarios ---------- */
function viewQuien() {
  const users = PERSONAL_LIST().filter(Boolean);
  const mine = slMine(); const inv = REG.me && tokens()[REG.me] ? (FOR.invites || []).length : 0;
  return `<div class="who">
    <div class="who-brand">${treeIcon(60)}<span>Al Día</span></div>
    <h1 class="page-title who-t">${users.length ? '¿Quién eres?' : 'Bienvenida, bienvenido'}</h1>
    <p class="page-sub">${users.length ? 'Elige tu usuario. Cada quien tiene su contraseña y nadie más entra a tu sección.' : 'Tus tareas, tu árbol y tus Salones, guardados en la nube y al instante en todos tus dispositivos.'}</p>
    ${users.length ? `<div class="who-list">${users.map((p) => {
      const n = pendingCountFor(p.id); const on = !!tokens()[p.id]; const lvl = FOR.trees[p.id]?.level;
      return `<button type="button" class="who-row" data-act="profile-pick" data-id="${p.id}">${avatar(p)}
        <span class="sl-main"><b class="sl-name">${esc(p.name)}</b><span class="sl-meta">${p.legacy && !on ? 'Toca para ponerle contraseña' : on && p.id === REG.me ? (n ? plural(n, 'entrega pendiente', 'entregas pendientes') : 'Sin pendientes') : 'Con contraseña'}${lvl !== undefined ? ` · árbol nivel ${lvl}` : ''}</span></span>
        ${on && p.id === REG.me ? icon('chev', 'chev') : `<span class="lock">${icon('lock', 'sm')}</span>`}</button>`;
    }).join('')}</div>` : ''}
    ${mine.length ? `<h2 class="sec">Tus Salones ${inv ? `<small>${plural(inv, 'invitación', 'invitaciones')}</small>` : ''}</h2><div class="sl-list">${mine.map((f) => slCardHTML(f)).join('')}</div>` : ''}
    <div class="who-actions"><button type="button" class="btn primary block" data-act="user-new">Crear mi usuario</button>
      <button type="button" class="btn block" data-act="user-login">Ya tengo usuario</button></div>
    <button type="button" class="who-link" data-act="rank-open">${icon('trophy', 'sm')}Ver el ranking de árboles${icon('chev', 'chev sm')}</button>
  </div>`;
}
function openProfileSheet() {
  const users = PERSONAL_LIST().filter(Boolean); const mine = slMine();
  openSheet(`${sheetHead('Cambiar de espacio')}
    <div class="sheet-body">
      <span class="lbl">Usuarios en este dispositivo</span>
      <div class="who-list">${users.map((p) => { const isMe = p.id === REG.current; return `<button type="button" class="who-row ${isMe ? 'me' : ''}" data-act="profile-to" data-id="${p.id}" ${isMe ? 'aria-current="true"' : ''}>${avatar(p)}
        <span class="sl-main"><b class="sl-name">${esc(p.name)}</b><span class="sl-meta">@${esc(p.id)}</span></span>${isMe ? '<span class="sl-chip ok">Aquí estás</span>' : icon('chev', 'chev')}</button>`; }).join('')}</div>
      <span class="lbl" style="margin-top:18px">Salones</span>
      ${mine.length ? `<div class="sl-list">${mine.map((f) => slCardHTML(f, 'profile-to').replace('class="sl-card"', `class="sl-card ${REG.current === 'f:' + f.meta.id ? 'me' : ''}"`)).join('')}</div>` : '<p class="small muted" style="margin:4px 0 0">Aún no estás en ningún Salón.</p>'}
      <div class="btn-row" style="margin-top:14px"><button class="btn" data-act="sl-go-hub">${icon('users', 'sm')}Salones</button><button class="btn" data-act="sheet-close-new">${icon('plus', 'sm')}Otro usuario</button></div>
      <div class="toggle" style="margin-top:12px"><span><span class="t">Preguntar quién eres al abrir</span><span class="d" style="display:block">Útil si comparten el mismo celular.</span></span>
        <label class="switch"><input type="checkbox" data-reg="ask" ${REG.ask ? 'checked' : ''} aria-label="Preguntar quién eres al abrir"><span></span></label></div>
    </div>`);
}

/* ---------- Acciones ---------- */
Object.assign(VIDA_ACTS, {
  'forest-new': () => { if (!REG.me || !tokens()[REG.me]) { toast('Primero entra con tu usuario.'); return; } openCreateSalon(); },
  'sl-color': (el) => { SL.color = el.dataset.v; document.querySelectorAll('.sl-sw .sw').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === SL.color)); const p = document.getElementById('slPrev'); if (p) p.innerHTML = slPreview(document.getElementById('slName')?.value.trim(), SL.color); },
  'sl-create': async (el) => {
    const name = (document.getElementById('slName')?.value || '').trim();
    if (!name) { toast('Ponle nombre a tu Salón.'); document.getElementById('slName')?.focus(); return; }
    el.disabled = true; el.textContent = 'Creando…';
    try {
      const r = await cloudFetch('POST', { kind: 'fcreate', as: REG.me, name, color: SL.color });
      FOR.f[r.forest.id] = { meta: r.forest, items: [], reqs: [] }; saveFOR(); SL.created = r.forest.id;
      Snd.chime(); confetti(innerWidth / 2, innerHeight / 3, 40); openInviteSalon(r.forest.id, true); cloudSync();
    } catch (e) { el.disabled = false; el.textContent = 'Crear Salón'; toast(e.message); }
  },
  'sl-enter': (el) => { closeSheet(false); enterProfile('f:' + el.dataset.id); },
  'forest-invite': () => { const fid = curFid(); if (!fid) { location.hash = '#/salones'; return; } SL.created = null; openInviteSalon(fid); },
  'sl-copy': async (el) => { const c = fmtCode(el.dataset.id); try { await navigator.clipboard.writeText(c); toast(`Código ${c} copiado.`); } catch { toast(`Tu código es ${c}`); } },
  'sl-share': async (el) => {
    const c = fmtCode(el.dataset.id); const text = `Únete a mi Salón "${el.dataset.name}" en Al Día. Abre la app, ve a Salones › Unirme con código y escribe: ${c}`;
    if (navigator.share) { try { await navigator.share({ title: 'Al Día', text, url: location.origin + '/#/salones' }); } catch { /* cancelado */ } }
    else { try { await navigator.clipboard.writeText(text); toast('Mensaje copiado: pégalo en tu chat del grupo.'); } catch { toast(text); } }
  },
  'sl-join': () => { if (!REG.me || !tokens()[REG.me]) { toast('Primero entra con tu usuario.'); return; } openJoinSalon(); },
  'sl-join-go': async (el) => {
    const code = normCode(document.getElementById('slCode')?.value); const msg = document.getElementById('slJoinMsg');
    if (code.length < 6) { msg.textContent = 'Escribe el código completo (10 letras y números).'; return; }
    el.disabled = true; el.textContent = 'Enviando…';
    try {
      const r = await cloudFetch('POST', { kind: 'freq', as: REG.me, code });
      (FOR.myreqs ||= []).push({ forest: r.forest.id, forestName: r.forest.name, at: Date.now() }); saveFOR(); Snd.chime();
      document.getElementById('slJoinBody').innerHTML = `<div class="sl-done">${treeIcon(20)}<h3>Solicitud enviada</h3><p class="muted">Les avisamos al instante a los de <b>${esc(r.forest.name)}</b>. En cuanto te acepten, el Salón aparece en tu lista.</p></div>`;
      el.outerHTML = '<button class="btn primary" data-act="sheet-close">Listo</button>'; render();
    } catch (e) { el.disabled = false; el.textContent = 'Enviar solicitud'; msg.textContent = e.message; }
  },
  'sl-cancel': async (el) => { try { await cloudFetch('POST', { kind: 'fcancel', as: REG.me, forest: el.dataset.id }); FOR.myreqs = (FOR.myreqs || []).filter((r) => r.forest !== el.dataset.id); saveFOR(); render(); toast('Solicitud cancelada.'); } catch (e) { toast(e.message); } },
  'sl-approve': async (el) => {
    const fid = curFid(); const user = el.dataset.id; const ok = el.dataset.v === '1'; el.disabled = true;
    try {
      await cloudFetch('POST', { kind: 'fapprove', as: REG.me, forest: fid, user, accept: ok });
      const f = FOR.f[fid]; if (f) { f.reqs = (f.reqs || []).filter((r) => r.user !== user); if (ok && !f.meta.members.includes(user)) f.meta.members.push(user); } saveFOR();
      if (ok) { Snd.chime(); toast(`¡${memberName(user)} ya es parte del Salón!`); } render(); cloudSync();
    } catch (e) { el.disabled = false; toast(e.message); }
  },
  'sl-go-hub': () => { closeSheet(false); if (isGroup()) { REG.current = REG.me; saveReg(); switchProfile(REG.me); } location.hash = '#/salones'; },
});
