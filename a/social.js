/* Cinnavia 7.15 — Amistades, mensajes, Biblioteca General, Pedir ayuda y fotos de perfil.
   · Amistades estrictas: solo se pueden mandar mensajes después de que la otra persona ACEPTA la solicitud.
     Se puede rechazar, cancelar, quitar y bloquear. El servidor lo hace cumplir.
   · Biblioteca General: una sala abierta para todas las personas de Cinnavia. Se escribe, se dibuja,
     se mandan notas de voz y fotos, y sobre todo se pide y se da ayuda con tareas. Con reportes y bloqueo.
   · Foto de perfil: se recorta en cuadro, se comprime y se ve en tus Bosques, amistades y la Biblioteca. */
'use strict';
window.EXTRA_VIEWS = window.EXTRA_VIEWS || {};
window.GROUP_VIEWS = window.GROUP_VIEWS || {};
window.EXTRA_NAV = window.EXTRA_NAV || {};
window.GROUP_NAV = window.GROUP_NAV || {};

/* ===================== Fotos de perfil ===================== */
const AVC = (() => { try { return JSON.parse(localStorage.getItem('aldia:av') || '{}'); } catch { return {}; } })();
const saveAVC = () => { try { localStorage.setItem('aldia:av', JSON.stringify(AVC)); } catch { /* lleno: se vuelve a pedir */ } };
const AV_WANT = new Map();
function avWant(u, v) {
  if (!u || !v || (AVC[u] && AVC[u].v === v) || AV_WANT.has(u)) return;
  AV_WANT.set(u, v);
  cloudFetch('GET', null, `kind=avatar&u=${encodeURIComponent(u)}`).then((r) => {
    AV_WANT.delete(u); AVC[u] = { v: r.v || v, d: r.data || '' }; saveAVC();
    document.querySelectorAll(`[data-avu="${u}"]`).forEach((el) => { if (r.data) el.innerHTML = `<img src="${r.data}" alt="">`; el.classList.toggle('has-ph', !!r.data); });
  }).catch(() => AV_WANT.delete(u));
}
const avData = (u) => (u && AVC[u] && AVC[u].d) || '';
const userByName = (n) => { const all = { ...(FOR.members || {}) }; for (const f of SOC.friends || []) all[f.id] = f; const hit = Object.entries(all).find(([, m]) => m && m.name === n); return hit ? hit[0] : ((REG.users || []).find((x) => x.name === n) || {}).id; };
{
  const baseAvatar = avatar;
  avatar = function (p, cls = '') {
    const u = p && (p.id || userByName(p.name)); const d = avData(u);
    if (d) return `<span class="avatar has-ph ${cls}" data-avu="${esc(u)}" style="--pc:${p.color}" aria-hidden="true"><img src="${d}" alt=""></span>`;
    return baseAvatar(p, cls).replace('<span class="avatar', `<span data-avu="${esc(u || '')}" class="avatar`);
  };
  const baseMini = mini;
  mini = function (n, cls = '') { const u = userByName(n); const d = avData(u); return d ? `<span class="mini has-ph ${cls}" title="${esc(n)}"><img src="${d}" alt=""></span>` : baseMini(n, cls); };
}
function cropSquare(file, size = 176) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height); const c = document.createElement('canvas'); c.width = c.height = size;
      const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
      g.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(img.src); res(c.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => rej(new Error('No se pudo abrir la foto'));
    img.src = URL.createObjectURL(file);
  });
}
function photoCardHTML() {
  const p = profile(REG.current); if (!p || isForestId(p.id) || !tokens()[p.id]) return '';
  const has = !!avData(p.id);
  return `<div class="card ph-card">${avatar(p, 'xl')}<div><b>Foto de perfil</b><span class="small muted">Se ve en tus Bosques, tus amistades y la Biblioteca.</span>
    <div class="btn-row" style="margin-top:10px"><label class="btn primary">${icon('cam', 'sm')}${has ? 'Cambiar foto' : 'Poner foto'}<input type="file" accept="image/*" id="avIn" hidden></label>${has ? '<button class="btn quiet" data-act="av-del">Quitar</button>' : ''}</div></div></div>`;
}
{
  const baseAcc = accountCardHTML;
  accountCardHTML = function () { return photoCardHTML() + baseAcc(); };
}
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'avIn' || !e.target.files[0]) return;
  const id = dataOwner();
  try {
    const d = await cropSquare(e.target.files[0]);
    await cloudFetch('POST', { kind: 'avatar', as: id, data: d });
    AVC[id] = { v: Date.now(), d }; saveAVC(); closeSheet(false); render(); Snd.chime(); toast('Tu foto de perfil quedó lista.');
  } catch (x) { toast(/fetch|network|Failed/i.test(x.message) ? 'Necesitas internet para cambiar tu foto.' : x.message); }
  e.target.value = '';
});

/* ---------- Editar perfil (celular): cámara, galería y quitar foto ---------- */
function openEditProfile() {
  const p = profile(); if (!p) return;
  const id = dataOwner();
  const can = !isForestId(REG.current) && !!tokens()[id];
  const has = !!avData(id);
  openSheet(`${sheetHead('Editar perfil')}<div class="sheet-body ep-body">
    <div class="ep-hero"><span class="ep-av">${avatar(p, 'xl')}</span><b>${esc(p.name)}</b><span class="small muted">@${esc(id)}</span></div>
    ${can ? `<div class="ep-btns">
      <label class="btn primary">${icon('cam', 'sm')}Tomar foto<input type="file" accept="image/*" capture="user" id="avIn" hidden></label>
      <label class="btn">${icon('upload', 'sm')}Elegir de la galería<input type="file" accept="image/*" id="avIn2" hidden></label>
      ${has ? '<button type="button" class="btn quiet" data-act="av-del">Quitar foto</button>' : ''}</div>
      <p class="small muted" style="text-align:center;margin-top:12px">Se recorta en cuadro y se ve en tus Bosques, amistades y la Biblioteca.</p>`
    : '<p class="small muted" style="text-align:center">Para poner foto necesitas haber iniciado sesión con tu cuenta (con internet).</p>'}
  </div>`);
}
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'avIn2' || !e.target.files[0]) return;
  const id = dataOwner();
  try {
    const d = await cropSquare(e.target.files[0]);
    await cloudFetch('POST', { kind: 'avatar', as: id, data: d });
    AVC[id] = { v: Date.now(), d }; saveAVC(); closeSheet(false); render(); Snd.chime(); toast('Tu foto de perfil quedó lista.');
  } catch (x) { toast(/fetch|network|Failed/i.test(x.message) ? 'Necesitas internet para cambiar tu foto.' : x.message); }
  e.target.value = '';
});
Object.assign(VIDA_ACTS, {
  'edit-profile': () => openEditProfile(),
  'av-del': async () => {
    const id = dataOwner();
    try { await cloudFetch('POST', { kind: 'avatar', as: id, data: '' }); AVC[id] = { v: 0, d: '' }; saveAVC(); closeSheet(false); render(); toast('Foto quitada.'); }
    catch (x) { toast(/fetch|network|Failed/i.test(x.message) ? 'Necesitas internet para quitar tu foto.' : x.message); }
  },
});
{
  const baseMas = viewMas;
  viewMas = function () {
    const h = baseMas(); const me = profile(); if (!me) return h;
    const row = `<ul class="rows" style="margin-bottom:10px"><li><button type="button" class="rowbtn" data-act="edit-profile"><span class="ep-mini">${avatar(me, 'sm')}<i>${icon('cam', 'sm')}</i></span><span class="txt"><b>Editar perfil</b><span>Cambia tu foto de perfil con la cámara o la galería.</span></span>${icon('chev', 'chev')}</button></li></ul>`;
    return h.replace('<ul class="rows" style="margin-bottom:14px">', row + '<ul class="rows" style="margin-bottom:14px">');
  };
}

/* ===================== Amistades y mensajes ===================== */
const SOC = (() => { try { return JSON.parse(localStorage.getItem('aldia:soc') || 'null') || {}; } catch { return {}; } })();
const saveSOC = () => { try { localStorage.setItem('aldia:soc', JSON.stringify(SOC)); } catch { /* */ } };
function socOf() { return SOC[REG.me] || { friends: [], incoming: [], outgoing: [], blocked: [], threads: {}, reads: {} }; }
Object.defineProperty(SOC, 'friends', { get() { return socOf().friends; }, enumerable: false });
const dmSeen = () => ((REG.dmSeen ||= {})[REG.me] ||= {});
function unreadFrom(f) { const t = socOf().threads[f] || []; const s = dmSeen()[f] || 0; return t.filter((m) => m.from === f && m.at > s).length; }
function socialBadge() { const s = socOf(); return (s.incoming || []).length + (s.friends || []).reduce((a, f) => a + unreadFrom(f.id), 0); }
{
  const baseApply = applyForests;
  applyForests = function (remote) {
    const r = baseApply(remote);
    try {
      const prevInc = new Set((socOf().incoming || []).map((x) => x.from));
      const prevMsgs = {}; for (const [f, t] of Object.entries(socOf().threads || {})) prevMsgs[f] = (t[t.length - 1] || {}).at || 0;
      for (const [u, s] of Object.entries(remote.social || {})) {
        for (const o of REG.dmout || []) if (o.as === u && s.threads[o.to] && !s.threads[o.to].some((m) => m.id === o.id)) s.threads[o.to].push({ ...o, pending: true });
        SOC[u] = s;
      }
      saveSOC();
      for (const [u, a] of Object.entries(remote.users || {})) avWant(u, a.av);
      for (const [u, m] of Object.entries(remote.members || {})) avWant(u, m && m.av);
      const s = socOf();
      if (!choosing) {
        for (const i of s.incoming || []) if (!prevInc.has(i.from)) { toast(`${i.name} te mandó una solicitud de amistad.`, { action: 'Ver', onAction: () => { location.hash = '#/amigos'; } }); Snd.chime(); }
        const open = route().name === 'amigos' && route().arg;
        for (const [f, t] of Object.entries(s.threads || {})) { const last = t[t.length - 1]; if (last && last.from === f && last.at > (prevMsgs[f] || 0) && prevMsgs[f] !== undefined && open !== f) { Snd.drop(); toast(`${(s.friends.find((x) => x.id === f) || {}).name || f}: ${last.text.slice(0, 60)}`, { action: 'Abrir', onAction: () => { location.hash = '#/amigos/' + f; } }); } }
        if (route().name === 'amigos') softRender();
      }
      paintSocialBadge();
    } catch (e) { console.warn('[Cinnavia] social', e); }
    return r;
  };
}
function paintSocialBadge() { const n = socialBadge(); document.querySelectorAll('[data-soc-badge]').forEach((el) => { el.textContent = n || ''; el.hidden = !n; }); }
async function flushDMs() {
  const out = REG.dmout || []; if (!out.length || !navigator.onLine) return;
  REG.dmout = [];
  for (const o of out) { try { await cloudFetch('POST', { kind: 'dm', as: o.as, to: o.to, text: o.text, id: o.id }); } catch (e) { if (e.status !== 403) REG.dmout.push(o); } }
  saveReg();
}
window.addEventListener('online', () => setTimeout(flushDMs, 600));
setInterval(() => { if ((REG.dmout || []).length) flushDMs(); }, 15000);

function needMe() {
  if (REG.me && tokens()[REG.me]) return '';
  return '<div class="empty"><h3>Entra con tu usuario</h3><p>Las amistades y la Biblioteca viven en la nube: necesitas tu usuario y contraseña.</p><p><button class="btn primary" data-act="profile-choose">Entrar</button></p></div>';
}
const AM = { tab: 'amigos' };
function viewAmigos(arg) {
  const nm = needMe(); if (nm) return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Amistades</h1>${nm}`;
  if (arg) return viewChat(arg);
  const s = socOf();
  const tabs = `<div class="seg full" role="group" style="margin:6px 0 14px">${[['amigos', `Amistades${s.friends.length ? ` · ${s.friends.length}` : ''}`], ['solicitudes', `Solicitudes${s.incoming.length ? ` · ${s.incoming.length}` : ''}`], ['agregar', 'Agregar']].map(([k, l]) => `<button type="button" data-act="am-tab" data-v="${k}" aria-pressed="${AM.tab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (AM.tab === 'amigos') {
    body = s.friends.length ? `<ul class="rows am-list">${s.friends.map((f) => { const t = s.threads[f.id] || []; const last = t[t.length - 1]; const un = unreadFrom(f.id);
      return `<li><a class="rowbtn" href="#/amigos/${f.id}">${avatar(f)}<span class="txt"><b>${esc(f.name)}</b><span>${last ? `${last.from === REG.me ? 'Tú: ' : ''}${esc(last.text.slice(0, 60))}` : `@${esc(f.id)} · escríbele algo`}</span></span>${un ? `<span class="am-un">${un}</span>` : icon('chev', 'chev')}</a></li>`; }).join('')}</ul>`
      : `<div class="empty"><h3>Todavía no tienes amistades</h3><p>Manda una solicitud con el usuario de tu compañero. Cuando la acepte, podrán mandarse mensajes.</p><p><button class="btn primary" data-act="am-tab" data-v="agregar">${icon('plus')}Agregar a alguien</button></p></div>`;
  } else if (AM.tab === 'solicitudes') {
    body = `${s.incoming.length ? `<h2 class="sec">Te quieren agregar</h2><ul class="rows">${s.incoming.map((i) => `<li><div class="am-req">${avatar({ id: i.from, name: i.name, color: i.color })}<span class="txt"><b>${esc(i.name)}</b><span class="tiny faint">@${esc(i.from)} · ${ago(i.at)}</span></span>
        <span class="am-btns"><button class="btn primary" data-act="am-resp" data-id="${esc(i.from)}" data-v="1">Aceptar</button><button class="btn" data-act="am-resp" data-id="${esc(i.from)}" data-v="0">Rechazar</button></span></div></li>`).join('')}</ul>` : '<p class="small muted">No tienes solicitudes nuevas.</p>'}
      ${s.outgoing.length ? `<h2 class="sec">Enviadas, esperando respuesta</h2><ul class="rows">${s.outgoing.map((o) => `<li><div class="am-req">${avatar(o)}<span class="txt"><b>${esc(o.name)}</b><span class="tiny faint">@${esc(o.id)} · aún no responde</span></span><span class="am-btns"><button class="btn quiet" data-act="am-cancel" data-id="${esc(o.id)}">Cancelar</button></span></div></li>`).join('')}</ul>` : ''}`;
  } else {
    body = `<div class="card"><p class="muted" style="margin:0 0 10px">Escribe el usuario exacto de la persona (el que eligió al crear su cuenta). Le llega una solicitud y <b>solo si la acepta</b> podrán mandarse mensajes.</p>
      <form class="add-step" id="amAddForm" autocomplete="off"><label for="amAddIn" class="sr">Usuario</label><input id="amAddIn" class="input" placeholder="Ej. mel" autocapitalize="none" spellcheck="false"><button class="btn primary">Enviar solicitud</button></form>
      <p class="tiny faint" style="margin:10px 0 0">Tu usuario es <b>@${esc(REG.me)}</b>. Compártelo solo con gente que conoces.</p></div>
      ${s.blocked.length ? `<h2 class="sec">Bloqueados</h2><ul class="rows">${s.blocked.map((b) => `<li><div class="am-req"><span class="txt"><b>@${esc(b)}</b></span><span class="am-btns"><button class="btn quiet" data-act="am-unblock" data-id="${esc(b)}">Desbloquear</button></span></div></li>`).join('')}</ul>` : ''}`;
  }
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Amistades</h1><p class="page-sub">Solo puedes escribirle a quien aceptó tu solicitud. Tú decides a quién aceptas.</p>${tabs}${body}`;
}
function viewChat(f) {
  const s = socOf(); const fr = s.friends.find((x) => x.id === f);
  if (!fr) return `<a class="back" href="#/amigos">${icon('back')}Amistades</a><div class="empty"><h3>Aún no son amistades</h3><p>Para escribirle, primero tiene que aceptar tu solicitud.</p></div>`;
  const t = (s.threads[f] || []).slice().sort((a, b) => a.at - b.at);
  const lastMine = [...t].reverse().find((m) => m.from === REG.me); const seen = lastMine && (s.reads[f] || 0) >= lastMine.at;
  if (t.length) { const lastAt = t[t.length - 1].at; if ((dmSeen()[f] || 0) < lastAt) { dmSeen()[f] = lastAt; saveReg(); cloudFetch('POST', { kind: 'dmread', as: REG.me, with: f }).catch(() => {}); setTimeout(paintSocialBadge, 50); } }
  let day = '';
  const msgs = t.map((m) => { const d = toISO(new Date(m.at)); const sep = d !== day ? `<div class="dm-day">${esc(cap(relDay(d)))}</div>` : ''; day = d;
    return `${sep}<div class="dm ${m.from === REG.me ? 'me' : ''} ${m.pending ? 'pend' : ''}"><p>${linkify(m.text)}</p><span>${new Date(m.at).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}${m.pending ? ' · en espera' : ''}</span></div>`; }).join('');
  return `<div class="dm-head"><a class="icon-btn ghost" href="#/amigos" aria-label="Volver">${icon('back')}</a>${avatar(fr)}<span class="txt"><b>${esc(fr.name)}</b><span class="tiny faint">@${esc(fr.id)}</span></span><button class="icon-btn ghost" data-act="am-menu" data-id="${esc(f)}" aria-label="Opciones">${icon('gear')}</button></div>
    <div class="dm-list" id="dmList">${msgs || '<p class="small muted" style="text-align:center">Escríbele el primer mensaje.</p>'}${seen ? '<p class="dm-seen">Visto</p>' : ''}</div>
    <form class="quick dm-form" id="dmForm" autocomplete="off"><div class="quick-row"><label for="dmIn" class="sr">Mensaje</label><input id="dmIn" placeholder="Escribe un mensaje…" maxlength="2000"><button class="quick-go">Enviar</button></div></form>`;
}
EXTRA_VIEWS.amigos = viewAmigos; EXTRA_NAV.amigos = 'mas';
document.addEventListener('submit', async (e) => {
  if (e.target.id === 'amAddForm') {
    e.preventDefault(); const v = document.getElementById('amAddIn').value.trim().toLowerCase().replace(/^@/, ''); if (!v) return;
    try { const r = await cloudFetch('POST', { kind: 'friendreq', as: REG.me, to: v }); toast(`Solicitud enviada a ${r.name}. Cuando la acepte podrán escribirse.`); Snd.drop(); AM.tab = 'solicitudes'; await cloudSync(); render(); }
    catch (x) { toast(x.message); }
  } else if (e.target.id === 'dmForm') {
    e.preventDefault(); const inp = document.getElementById('dmIn'); const text = inp.value.trim(); if (!text) return;
    const f = route().arg; const m = { id: uid().replace(/[^a-z0-9]/gi, '').slice(0, 20).padEnd(8, '0'), as: REG.me, from: REG.me, to: f, text, at: Date.now() };
    const th = ((socOf().threads ||= {})[f] ||= []); th.push({ ...m, pending: true }); inp.value = ''; render(); setTimeout(() => { const l = document.getElementById('dmList'); if (l) l.scrollTop = l.scrollHeight; document.getElementById('dmIn')?.focus(); }, 30);
    Snd.tick();
    try { const r = await cloudFetch('POST', { kind: 'dm', as: REG.me, to: f, text, id: m.id }); const x = th.find((y) => y.id === m.id); if (x) { x.pending = false; x.at = r.at; } saveSOC(); render(); setTimeout(() => { const l = document.getElementById('dmList'); if (l) l.scrollTop = l.scrollHeight; }, 30); }
    catch (x) { if (x.status === 403) { toast(x.message); th.pop(); render(); } else { (REG.dmout ||= []).push(m); saveReg(); toast('Sin conexión: se enviará solo al volver la red.'); } }
  }
}, true);
Object.assign(VIDA_ACTS, {
  'am-tab': (el) => { AM.tab = el.dataset.v; if (location.hash !== '#/amigos') location.hash = '#/amigos'; else render(); },
  'am-resp': async (el) => { el.disabled = true; try { await cloudFetch('POST', { kind: 'friendrespond', as: REG.me, from: el.dataset.id, accept: el.dataset.v === '1' }); if (el.dataset.v === '1') { Snd.chime(); confetti(innerWidth / 2, innerHeight / 3, 30); toast('¡Ahora son amistades! Ya pueden escribirse.'); AM.tab = 'amigos'; } await cloudSync(); render(); } catch (x) { el.disabled = false; toast(x.message); } },
  'am-cancel': async (el) => { try { await cloudFetch('POST', { kind: 'friendcancel', as: REG.me, to: el.dataset.id }); await cloudSync(); render(); } catch (x) { toast(x.message); } },
  'am-unblock': async (el) => { try { await cloudFetch('POST', { kind: 'block', as: REG.me, who: el.dataset.id, undo: true }); await cloudSync(); render(); } catch (x) { toast(x.message); } },
  'am-menu': async (el) => {
    const f = el.dataset.id;
    const v = await ask({ title: 'Opciones', options: [{ value: 'remove', label: 'Quitar de mis amistades', icon: 'x' }, { value: 'block', label: 'Bloquear (ya no podrá mandarte solicitudes)', icon: 'lock' }] });
    if (!v) return;
    const ok = await ask({ title: v === 'block' ? '¿Bloquear?' : '¿Quitar amistad?', text: v === 'block' ? 'Ya no podrán escribirse ni te podrá volver a mandar solicitudes. Puedes desbloquear después.' : 'Ya no podrán mandarse mensajes hasta que vuelvan a aceptar una solicitud.', ok: v === 'block' ? 'Bloquear' : 'Quitar', danger: true });
    if (!ok) return;
    try { await cloudFetch('POST', { kind: v === 'block' ? 'block' : 'friendremove', as: REG.me, who: f }); location.hash = '#/amigos'; await cloudSync(); render(); } catch (x) { toast(x.message); }
  },
});

/* ===================== Biblioteca General ===================== */
const LIB = { posts: [], since: 0, filter: 'todo', online: 0, timer: null, files: new Map(), blocked: new Set(JSON.parse(localStorage.getItem('aldia:libbl') || '[]')), thread: null };
async function libPull(full) {
  if (!REG.me || !tokens()[REG.me] || !navigator.onLine) return;
  try {
    const r = await cloudFetch('GET', null, `kind=library&since=${full ? 0 : LIB.since}`);
    const m = new Map(LIB.posts.map((p) => [p.id, p])); for (const p of r.posts) m.set(p.id, p);
    if (full) { const ids = new Set(r.posts.map((p) => p.id)); for (const k of [...m.keys()]) if (!ids.has(k)) m.delete(k); }
    const before = LIB.posts.length;
    LIB.posts = [...m.values()].sort((a, b) => a.at - b.at); LIB.online = r.online;
    LIB.since = LIB.posts.length ? LIB.posts[LIB.posts.length - 1].at : 0;
    try { localStorage.setItem('aldia:lib', JSON.stringify(LIB.posts.slice(-150))); } catch { /* */ }
    if (route().name === 'biblioteca' && (full || LIB.posts.length !== before)) { const stick = libAtBottom(); softRender(); if (stick) libScroll(); }
  } catch { /* se reintenta */ }
}
try { LIB.posts = JSON.parse(localStorage.getItem('aldia:lib') || '[]'); } catch { /* */ }
const libAtBottom = () => (window.innerHeight + window.scrollY) >= document.body.scrollHeight - 160;
const libScroll = () => setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 60);
function libLoop() {
  clearInterval(LIB.timer);
  if (route().name !== 'biblioteca') return;
  libPull(true); cloudFetch('POST', { kind: 'libhere', as: REG.me }).catch(() => {});
  let n = 0;
  LIB.timer = setInterval(() => { if (route().name !== 'biblioteca') { clearInterval(LIB.timer); return; } if (document.visibilityState === 'visible') { libPull(++n % 10 === 0); if (n % 8 === 0) cloudFetch('POST', { kind: 'libhere', as: REG.me }).catch(() => {}); } }, 3000);
}
window.addEventListener('hashchange', () => { if (route().name === 'biblioteca') libLoop(); });
document.addEventListener('DOMContentLoaded', () => setTimeout(() => { if (route().name === 'biblioteca') libLoop(); }, 900));
async function libFile(id) {
  if (LIB.files.has(id)) return LIB.files.get(id);
  try { const c = await DB.get('files', 'lb:' + id); if (c) { LIB.files.set(id, c); return c; } } catch { /* */ }
  try { const r = await cloudFetch('GET', null, `kind=libfile&id=${encodeURIComponent(id)}`); if (r.data) { LIB.files.set(id, r.data); DB.put('files', 'lb:' + id, r.data).catch(() => {}); return r.data; } } catch { /* */ }
  return null;
}
function hydrateLib() {
  document.querySelectorAll('[data-libf]:not([data-done])').forEach(async (el) => {
    el.dataset.done = '1'; const d = await libFile(el.dataset.libf); if (!d) { el.innerHTML = '<span class="tiny faint">No se pudo cargar.</span>'; return; }
    if (el.dataset.k === 'voice') el.innerHTML = `<audio controls preload="metadata" src="${d}"></audio>`;
    else el.innerHTML = `<img src="${d}" alt="${el.dataset.k === 'draw' ? 'Dibujo' : 'Foto'}" loading="lazy">`;
  });
}
function libPostHTML(p, replies) {
  const mine = p.by === REG.me; const help = p.kind === 'help';
  const body = p.hidden ? '<p class="tiny faint">Oculto por reportes de la comunidad.</p>'
    : `${p.subject ? `<span class="lib-subj">${esc(p.subject)}</span>` : ''}${p.text ? `<p>${linkify(p.text)}</p>` : ''}${p.file ? `<div class="lib-media k-${p.kind}" data-libf="${esc(p.file)}" data-k="${p.kind}"><span class="tiny faint">Cargando…</span></div>` : ''}`;
  return `<article class="lib-post ${help ? 'help' : ''} ${p.solved ? 'solved' : ''} ${mine ? 'mine' : ''}" id="lp-${p.id}">
    <header>${avatar({ id: p.by, name: p.name, color: p.color })}<span class="txt"><b>${esc(p.name)}</b><span class="tiny faint">@${esc(p.by)} · ${ago(p.at)}</span></span>${help ? `<span class="lib-tag">${p.solved ? 'Resuelta' : 'Pide ayuda'}</span>` : ''}</header>
    ${body}
    <footer>${!p.parent ? `<button class="link-btn" data-act="lib-reply" data-id="${p.id}">${replies && replies.length ? plural(replies.length, 'respuesta', 'respuestas') : 'Responder'}</button>` : ''}
      ${mine && help ? `<button class="link-btn" data-act="lib-solved" data-id="${p.id}">${p.solved ? 'Reabrir' : 'Ya me ayudaron'}</button>` : ''}
      ${mine || (typeof isAdminSession === 'function' && isAdminSession()) ? `<button class="link-btn" data-act="lib-del" data-id="${p.id}">Borrar</button>` : ''}${mine ? '' : `<button class="link-btn" data-act="lib-report" data-id="${p.id}">Reportar</button><button class="link-btn" data-act="lib-block" data-id="${esc(p.by)}">Ocultar a @${esc(p.by)}</button>`}</footer>
    ${replies && replies.length && LIB.thread === p.id ? `<div class="lib-replies">${replies.map((r) => libPostHTML(r)).join('')}</div>` : ''}</article>`;
}
function viewBiblioteca() {
  const nm = needMe(); if (nm) return `<h1 class="page-title">Biblioteca General</h1>${nm}`;
  setTimeout(hydrateLib, 30);
  const vis = LIB.posts.filter((p) => !LIB.blocked.has(p.by));
  const roots = vis.filter((p) => !p.parent); const rep = (id) => vis.filter((p) => p.parent === id);
  const list = roots.filter((p) => LIB.filter === 'todo' || (LIB.filter === 'ayuda' && p.kind === 'help' && !p.solved) || (LIB.filter === 'resueltas' && p.kind === 'help' && p.solved)).slice(-80);
  const openHelp = roots.filter((p) => p.kind === 'help' && !p.solved).length;
  return `<section class="lib-hero"><div class="lib-hero-art">${libArt()}</div><h1 class="page-title">Biblioteca General</h1>
      <p class="page-sub">La sala de todas las personas de Cinnavia. Pide ayuda con una tarea, explica lo que sabes, dibuja un esquema o manda una nota de voz.</p>
      <div class="lib-stats"><span><i class="live-dot" data-on="1"></i>${plural(Math.max(1, LIB.online), 'persona aquí', 'personas aquí')}</span><span>${plural(openHelp, 'pregunta abierta', 'preguntas abiertas')}</span></div></section>
    <div class="lib-rules">${icon('lock', 'sm')}<span>Sé amable y respetuoso. No compartas tu teléfono, dirección ni contraseñas. Reporta lo que no esté bien: con 3 reportes se oculta.</span></div>
    <div class="seg full" role="group" style="margin:12px 0">${[['todo', 'Todo'], ['ayuda', `Piden ayuda${openHelp ? ` · ${openHelp}` : ''}`], ['resueltas', 'Resueltas']].map(([k, l]) => `<button type="button" data-act="lib-filter" data-v="${k}" aria-pressed="${LIB.filter === k}">${l}</button>`).join('')}</div>
    <div class="lib-feed">${list.length ? list.map((p) => libPostHTML(p, rep(p.id))).join('') : '<div class="empty"><h3>Aún está en silencio</h3><p>Sé la primera persona en escribir. Si tienes una duda, toca «Pedir ayuda».</p></div>'}</div>
    <div class="lib-compose">${LIB.reply ? `<div class="lib-replying">Respondiendo a ${esc((LIB.posts.find((p) => p.id === LIB.reply) || {}).name || '')} <button class="link-btn" data-act="lib-reply-x">Cancelar</button></div>` : ''}
      <form class="quick" id="libForm" autocomplete="off"><div class="quick-row"><label for="libIn" class="sr">Mensaje</label><input id="libIn" placeholder="${LIB.reply ? 'Escribe tu respuesta…' : 'Escribe a la Biblioteca…'}" maxlength="1500"><button class="quick-go">Enviar</button></div></form>
      <div class="lib-tools"><button class="btn" data-act="help-open">${icon('help', 'sm')}Pedir ayuda</button><button class="btn" data-act="lib-draw">${icon('edit', 'sm')}Dibujar</button><button class="btn" data-act="lib-voice">${icon('bell', 'sm')}Nota de voz</button><label class="btn">${icon('cam', 'sm')}Foto<input type="file" accept="image/*" id="libPhoto" hidden></label></div></div>`;
}
function libArt() {
  return `<svg viewBox="0 0 360 120" aria-hidden="true" class="ln-ico"><path class="ln s" stroke-width=".8" d="M0 104C80 96 140 108 200 100S320 92 360 100"/>
    ${[30, 62, 94, 126].map((x, i) => `<rect class="ln" stroke-width="1" x="${x}" y="${48 - i * 4}" width="24" height="${52 + i * 4}" rx="2"/><path class="ln s" stroke-width=".7" d="M${x + 4} ${58 - i * 4}h16M${x + 4} ${64 - i * 4}h12"/>`).join('')}
    <path class="ln a" stroke-width="1" d="M196 100V60M196 72c-10-4-16-12-14-22 8 2 14 10 14 22zM196 66c8-6 16-8 22-4-4 8-14 8-22 4z"/>
    <path class="ln" stroke-width="1" d="M250 100l20-56 30 10-20 56zM262 74l24 8"/><circle class="ln g" stroke-width=".8" cx="318" cy="34" r="10"/><path class="ln g" stroke-width=".6" d="M318 16v-6M336 34h6M318 52v6M300 34h-6"/></svg>`;
}
EXTRA_VIEWS.biblioteca = viewBiblioteca; EXTRA_NAV.biblioteca = 'mas';
GROUP_VIEWS.biblioteca = viewBiblioteca; GROUP_NAV.biblioteca = 'mas';
async function libSend(payload) {
  try {
    const r = await cloudFetch('POST', { kind: 'libpost', as: REG.me, parent: LIB.reply || '', ...payload });
    LIB.posts.push(r.post); LIB.since = Math.max(LIB.since, r.post.at); if (payload.data && r.post.file) LIB.files.set(r.post.file, payload.data);
    if (LIB.reply) LIB.thread = LIB.reply; LIB.reply = null;
    Snd.drop(); render(); libScroll(); return true;
  } catch (x) { toast(/fetch|network|Failed/i.test(x.message) ? 'La Biblioteca necesita internet.' : x.message); return false; }
}
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'libForm') return; e.preventDefault();
  const i = document.getElementById('libIn'); const t = i.value.trim(); if (!t) return; i.value = ''; libSend({ pkind: 'text', text: t });
}, true);
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'libPhoto' || !e.target.files[0]) return;
  try { const d = await fileToDataURL(e.target.files[0], 1000, 0.7); const cap = await ask({ title: 'Foto para la Biblioteca', text: 'Agrega una descripción (opcional).', input: { placeholder: 'Ej. Este es el ejercicio 4' }, ok: 'Publicar' }); if (cap !== null) libSend({ pkind: 'photo', text: cap, data: d }); } catch { toast('No se pudo abrir la foto.'); }
  e.target.value = '';
});
Object.assign(VIDA_ACTS, {
  'lib-filter': (el) => { LIB.filter = el.dataset.v; render(); },
  'lib-reply': (el) => { LIB.reply = el.dataset.id; LIB.thread = LIB.thread === el.dataset.id ? null : el.dataset.id; render(); setTimeout(() => document.getElementById('libIn')?.focus(), 40); },
  'lib-reply-x': () => { LIB.reply = null; render(); },
  'lib-report': async (el) => { const ok = await ask({ title: '¿Reportar?', text: 'Si 3 personas lo reportan, se oculta para todos.', ok: 'Reportar', danger: true }); if (!ok) return; try { await cloudFetch('POST', { kind: 'libedit', as: REG.me, id: el.dataset.id, action: 'report' }); toast('Gracias. Lo revisaremos.'); libPull(true); } catch (x) { toast(x.message); } },
  'lib-del': async (el) => { const ok = await ask({ title: '¿Borrar tu publicación?', ok: 'Borrar', danger: true }); if (!ok) return; try { await cloudFetch('POST', { kind: 'libedit', as: REG.me, id: el.dataset.id, action: 'delete' }); LIB.posts = LIB.posts.filter((p) => p.id !== el.dataset.id); render(); } catch (x) { toast(x.message); } },
  'lib-solved': async (el) => { try { await cloudFetch('POST', { kind: 'libedit', as: REG.me, id: el.dataset.id, action: 'solved' }); const p = LIB.posts.find((x) => x.id === el.dataset.id); if (p) { p.solved = !p.solved; if (p.solved) { Snd.chime(); toast('¡Qué bien! Gracias por avisar.'); } } render(); } catch (x) { toast(x.message); } },
  'lib-block': (el) => { LIB.blocked.add(el.dataset.id); try { localStorage.setItem('aldia:libbl', JSON.stringify([...LIB.blocked])); } catch { /* */ } render(); toast(`Ya no verás lo que publique @${el.dataset.id}.`); },
  'lib-draw': () => openDraw((d) => libSend({ pkind: 'draw', text: '', data: d })),
  'lib-voice': () => openVoice((d, dur) => libSend({ pkind: 'voice', text: '', data: d, dur })),
});

/* ---------- Lienzo para dibujar ---------- */
function openDraw(done, opts = {}) {
  const colors = ['#1F2A24', '#2F8A5B', '#3E6FC6', '#C9524A', '#C9A55C', '#8A5CC6'];
  openSheet(`${sheetHead(opts.title || 'Dibujar')}<div class="sheet-body"><div class="draw-wrap"><canvas id="drawC" width="900" height="640"></canvas></div>
    <div class="draw-tools"><div class="draw-colors">${colors.map((c, i) => `<button type="button" class="dc ${i === 0 ? 'on' : ''}" data-c="${c}" style="--c:${c}" aria-label="Color"></button>`).join('')}<button type="button" class="dc er" data-c="er" aria-label="Borrador">${icon('x', 'sm')}</button></div>
    <div class="seg" role="group">${[[3, 'Fino'], [6, 'Medio'], [12, 'Grueso']].map(([w, l], i) => `<button type="button" class="dw" data-w="${w}" aria-pressed="${i === 0}">${l}</button>`).join('')}</div>
    <button type="button" class="btn quiet" id="drawUndo">Deshacer</button><button type="button" class="btn quiet" id="drawClear">Limpiar</button></div></div>
    <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" id="drawOk">${opts.ok || 'Publicar dibujo'}</button></div>`);
  const c = document.getElementById('drawC'); const g = c.getContext('2d');
  let col = colors[0], w = 3, strokes = [], cur = null;
  const paint = () => { g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, c.width, c.height); g.lineCap = 'round'; g.lineJoin = 'round';
    for (const s of strokes) { g.strokeStyle = s.c === 'er' ? '#FFFDF8' : s.c; g.lineWidth = s.c === 'er' ? s.w * 4 : s.w; g.beginPath(); const p = s.p; g.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length - 1; i++) { const mx = (p[i][0] + p[i + 1][0]) / 2, my = (p[i][1] + p[i + 1][1]) / 2; g.quadraticCurveTo(p[i][0], p[i][1], mx, my); } if (p.length > 1) g.lineTo(p[p.length - 1][0], p[p.length - 1][1]); else g.lineTo(p[0][0] + 0.1, p[0][1]); g.stroke(); } };
  paint();
  const pos = (e) => { const r = c.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * c.width, ((e.clientY - r.top) / r.height) * c.height]; };
  c.addEventListener('pointerdown', (e) => { c.setPointerCapture(e.pointerId); cur = { c: col, w, p: [pos(e)] }; strokes.push(cur); paint(); });
  c.addEventListener('pointermove', (e) => { if (!cur) return; cur.p.push(pos(e)); paint(); });
  const up = () => { cur = null; }; c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  const sh = sheet();
  sh.querySelectorAll('.dc').forEach((b) => b.addEventListener('click', () => { col = b.dataset.c; sh.querySelectorAll('.dc').forEach((x) => x.classList.toggle('on', x === b)); }));
  sh.querySelectorAll('.dw').forEach((b) => b.addEventListener('click', () => { w = +b.dataset.w; sh.querySelectorAll('.dw').forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
  document.getElementById('drawUndo').addEventListener('click', () => { strokes.pop(); paint(); });
  document.getElementById('drawClear').addEventListener('click', () => { strokes = []; paint(); });
  document.getElementById('drawOk').addEventListener('click', () => { if (!strokes.length) { toast('Dibuja algo primero.'); return; } const d = c.toDataURL('image/jpeg', 0.82); closeSheet(false); done(d); });
}

/* ---------- Notas de voz (máximo 1 minuto) ---------- */
async function openVoice(done) {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { toast('Este navegador no permite grabar audio.'); return; }
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch { toast('Sin permiso para usar el micrófono.'); return; }
  const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus'].find((m) => MediaRecorder.isTypeSupported?.(m)) || '';
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
  const chunks = []; const t0 = Date.now(); let tick;
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  openSheet(`${sheetHead('Nota de voz')}<div class="sheet-body" style="text-align:center"><div class="voice-orb"><span id="vTime">0:00</span></div><p class="muted">Grabando… máximo 1 minuto.</p></div>
    <div class="sheet-foot"><button class="btn" id="vCancel">Cancelar</button><span class="grow"></span><button class="btn primary" id="vStop">Detener y enviar</button></div>`, () => { clearInterval(tick); try { if (rec.state !== 'inactive') rec.stop(); } catch { /* */ } stream.getTracks().forEach((t) => t.stop()); });
  let cancel = false;
  rec.onstop = () => {
    stream.getTracks().forEach((t) => t.stop()); clearInterval(tick); if (cancel || !chunks.length) return;
    const blob = new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' }); const dur = Math.round((Date.now() - t0) / 1000);
    const fr = new FileReader(); fr.onload = () => { const d = String(fr.result).replace(/^data:audio\/([a-z0-9.+-]+);codecs=([a-z0-9.,]+);base64,/i, 'data:audio/$1;codecs=$2;base64,'); done(d, dur); }; fr.readAsDataURL(blob);
  };
  rec.start(500);
  tick = setInterval(() => { const s = Math.floor((Date.now() - t0) / 1000); const el = document.getElementById('vTime'); if (el) el.textContent = `0:${String(s).padStart(2, '0')}`; if (s >= 60) document.getElementById('vStop')?.click(); }, 250);
  document.getElementById('vCancel').addEventListener('click', () => { cancel = true; closeSheet(false); });
  document.getElementById('vStop').addEventListener('click', () => { onSheetClose = null; try { rec.stop(); } catch { /* */ } closeSheet(false); });
}

/* ===================== Pedir ayuda ===================== */
function openHelp(preset = {}) {
  if (!REG.me || !tokens()[REG.me]) { toast('Para pedir ayuda entra con tu usuario.'); return; }
  const fs = typeof myForests === 'function' ? myForests() : [];
  const friends = socOf().friends;
  openSheet(`${sheetHead('Pedir ayuda')}<div class="sheet-body">
    <p class="muted" style="margin:0 0 12px">Cuenta qué necesitas. Mientras más claro, más rápido te ayudan.</p>
    <div class="field"><label for="hpText">¿Con qué necesitas ayuda?</label><textarea id="hpText" class="input" rows="4" placeholder="Ej. No entiendo cómo sacar el punto de equilibrio en el ejercicio 3">${esc(preset.text || '')}</textarea></div>
    <div class="field"><label for="hpSubj">Materia o tema</label><input id="hpSubj" class="input" value="${esc(preset.subject || '')}" placeholder="Ej. Contabilidad" list="hpSubjL"><datalist id="hpSubjL">${S.subjects.map((s) => `<option value="${esc(s.name)}">`).join('')}</datalist></div>
    <div class="field"><span class="lbl">¿A quién se lo pides?</span><div class="pick" role="group" id="hpTo">
      <button type="button" data-v="lib" aria-pressed="true">${icon('book', 'sm')}Biblioteca General</button>
      ${fs.map((f) => `<button type="button" data-v="f:${f.meta.id}" aria-pressed="false">${icon('users', 'sm')}${esc(f.meta.name)}</button>`).join('')}
      ${friends.map((f) => `<button type="button" data-v="u:${f.id}" aria-pressed="false">${esc(f.name)}</button>`).join('')}</div></div>
    <label class="btn" style="margin-top:4px">${icon('cam', 'sm')}Adjuntar foto (opcional)<input type="file" accept="image/*" id="hpPhoto" hidden></label><span class="small muted" id="hpPh"></span>
  </div><div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" id="hpGo">${icon('help', 'sm')}Pedir ayuda</button></div>`);
  let to = 'lib', photo = null;
  sheet().querySelectorAll('#hpTo button').forEach((b) => b.addEventListener('click', () => { to = b.dataset.v; sheet().querySelectorAll('#hpTo button').forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
  document.getElementById('hpPhoto').addEventListener('change', async (e) => { if (!e.target.files[0]) return; photo = await fileToDataURL(e.target.files[0], 1000, 0.7); document.getElementById('hpPh').textContent = ' · foto lista'; });
  document.getElementById('hpGo').addEventListener('click', async (e) => {
    const text = document.getElementById('hpText').value.trim(); const subject = document.getElementById('hpSubj').value.trim();
    if (text.length < 5) { toast('Cuenta un poco más qué necesitas.'); return; }
    e.target.disabled = true;
    try {
      if (to === 'lib') {
        if (photo) await cloudFetch('POST', { kind: 'libpost', as: REG.me, pkind: 'photo', text: `${subject ? `[${subject}] ` : ''}${text}`, data: photo });
        else await cloudFetch('POST', { kind: 'libpost', as: REG.me, pkind: 'help', text, subject });
        closeSheet(false); LIB.filter = 'ayuda'; location.hash = '#/biblioteca'; toast('Tu pregunta ya está en la Biblioteca. Te avisamos cuando te respondan.'); Snd.chime();
      } else if (to.startsWith('f:')) {
        const fid = to.slice(2); const item = { id: gid(), type: 'idea', tag: 'duda', text: `${subject ? `${subject}: ` : ''}${text}`, at: Date.now(), by: me() };
        await cloudFetch('POST', { kind: 'gitem', as: REG.me, forest: fid, item, device: CLOUD.device });
        (FOR.f[fid].items ||= []).push(item); saveFOR(); closeSheet(false); toast('Tu duda llegó a tu Bosque.'); Snd.chime();
      } else {
        const f = to.slice(2); await cloudFetch('POST', { kind: 'dm', as: REG.me, to: f, text: `Necesito ayuda${subject ? ` con ${subject}` : ''}: ${text}`, id: uid().replace(/[^a-z0-9]/gi, '').slice(0, 20).padEnd(8, '0') });
        closeSheet(false); location.hash = '#/amigos/' + f; await cloudSync(); Snd.chime();
      }
    } catch (x) { e.target.disabled = false; toast(/fetch|network|Failed/i.test(x.message) ? 'Pedir ayuda necesita internet.' : x.message); }
  });
}
Object.assign(VIDA_ACTS, { 'help-open': (el) => openHelp(el && el.dataset && el.dataset.id ? (() => { const t = typeof task === 'function' ? task(el.dataset.id) : null; return t ? { text: `Tarea: ${t.title}${t.desc ? `\n${t.desc.slice(0, 300)}` : ''}`, subject: subj(t.subjectId)?.name || '' } : {}; })() : {}) });

/* notificación tocada con la app abierta: lleva a donde dice */
if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', (e) => { if (e.data && e.data.nav) location.hash = e.data.nav; });
