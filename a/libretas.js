/* Cinnavia 7.15 — Libretas: una por materia.
   Cada libreta junta tus apuntes, tarjetas de información, listas, fotos (con marcos y filtros),
   pegatinas botánicas, enlaces y las tareas de esa materia. Las fotos se guardan en tu nube y en el teléfono
   (se ven sin internet). Cualquier página se puede mandar a un Bosque o a una amistad. */
'use strict';
const LB = { tab: 'paginas', tone: 'papel', frame: 'polaroid', filter: 'natural', sticker: '' };
const LB_COVERS = { lino: 'Lino', acuarela: 'Acuarela', botanico: 'Botánico', marmol: 'Mármol', noche: 'Noche', kraft: 'Kraft' };
const LB_TONES = { papel: 'Papel', salvia: 'Salvia', cielo: 'Cielo', rosa: 'Rosa', miel: 'Miel', lavanda: 'Lavanda' };
const LB_FILTERS = { natural: 'Natural', calido: 'Cálido', suave: 'Suave', bn: 'Blanco y negro', sepia: 'Sepia', vivo: 'Vivo' };
const LB_FRAMES = { polaroid: 'Polaroid', redondo: 'Redondeada', cinta: 'Con cinta', simple: 'Sin marco' };
const STICKERS = {
  hoja: '<path d="M8 34C8 18 18 8 34 6c0 16-10 26-26 28z"/><path d="M8 34 26 14"/>',
  flor: '<circle cx="20" cy="20" r="4"/><circle cx="20" cy="11" r="5"/><circle cx="29" cy="20" r="5"/><circle cx="20" cy="29" r="5"/><circle cx="11" cy="20" r="5"/>',
  sol: '<circle cx="20" cy="20" r="7"/><path d="M20 5v5M20 30v5M5 20h5M30 20h5M9.4 9.4l3.5 3.5M27.1 27.1l3.5 3.5M9.4 30.6l3.5-3.5M27.1 12.9l3.5-3.5"/>',
  luna: '<path d="M28 27A12 12 0 0 1 15 8a12 12 0 1 0 13 19z"/><path d="M30 8v4M28 10h4"/>',
  estrella: '<path d="M20 5l4.4 9 9.6 1.4-7 6.8 1.7 9.6L20 27.3l-8.7 4.5 1.7-9.6-7-6.8 9.6-1.4z"/>',
  mariposa: '<path d="M20 12v18"/><path d="M20 16C14 6 4 8 6 16c2 6 10 6 14 2zM20 16c6-10 16-8 14 0-2 6-10 6-14 2zM20 22c-5 2-10 8-6 11 3 2 6-2 6-7zM20 22c5 2 10 8 6 11-3 2-6-2-6-7z"/>',
  taza: '<path d="M8 16h18v10a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8zM26 19h3a4 4 0 0 1 0 8h-3"/><path d="M13 6c-2 3 2 4 0 7M19 6c-2 3 2 4 0 7"/>',
  lapiz: '<path d="M8 32l2-8L26 8l6 6-16 16zM24 10l6 6M10 24l6 6"/>',
  corazon: '<path d="M20 33S6 24 6 14a7 7 0 0 1 14-2 7 7 0 0 1 14 2c0 10-14 19-14 19z"/>',
  libro: '<path d="M6 10c5-2 10-2 14 2v22c-4-4-9-4-14-2zM34 10c-5-2-10-2-14 2v22c4-4 9-4 14-2z"/>',
  nube: '<path d="M10 28h20a6 6 0 0 0 0-12 9 9 0 0 0-17-2 7 7 0 0 0-3 14z"/>',
  montana: '<path d="M4 32l11-16 6 8 5-6 10 14z"/><circle cx="29" cy="10" r="3"/>',
  helecho: '<path d="M20 36V6"/><path d="M20 10c-4-1-7 0-9 3M20 10c4-1 7 0 9 3M20 16c-5-1-9 1-11 4M20 16c5-1 9 1 11 4M20 22c-5-1-9 1-11 4M20 22c5-1 9 1 11 4M20 28c-4 0-7 1-9 3M20 28c4 0 7 1 9 3"/>',
  caracol: '<path d="M6 30h22a6 6 0 0 0 6-6"/><path d="M24 26a8 8 0 1 0-8-8 5 5 0 0 0 5 5 3 3 0 0 0 3-3"/><path d="M32 22l2-6M34 23l4-4"/>',
};
const stickerSVG = (k, cls = '') => (STICKERS[k] ? `<svg class="lb-stk ${cls}" viewBox="0 0 40 40" aria-hidden="true">${STICKERS[k]}</svg>` : '');
const lbSubjects = () => [...S.subjects, { id: '_gen', name: 'General', color: '#7A8CA8' }];
const lbSid = (sid) => (sid === '_gen' ? null : sid);
const lbPages = (sid) => (S.pages || []).filter((p) => !p.deleted && (p.subjectId || '_gen') === sid);
const lbNotes = (sid) => (S.notes || []).filter((n) => (n.subjectId || '_gen') === sid);
const lbCover = (sid) => ((S.settings.covers || {})[sid] || 'lino');

/* ---------- Imágenes: nube + teléfono ---------- */
const UF = new Map();
async function ufGet(id) {
  if (UF.has(id)) return UF.get(id);
  try { const c = await DB.get('files', 'uf:' + id); if (c) { UF.set(id, c); return c; } } catch { /* */ }
  if (!navigator.onLine || !tokens()[dataOwner()]) return null;
  try { const r = await cloudFetch('GET', null, `kind=ufile&as=${encodeURIComponent(dataOwner())}&id=${encodeURIComponent(id)}`); if (r.data) { UF.set(id, r.data); DB.put('files', 'uf:' + id, r.data).catch(() => {}); return r.data; } } catch { /* */ }
  return null;
}
async function ufPut(data) {
  const id = 'u' + uid().replace(/[^a-z0-9]/gi, ''); UF.set(id, data); await DB.put('files', 'uf:' + id, data).catch(() => {});
  (REG.ufout ||= []).push({ id, as: dataOwner() }); saveReg(); ufFlush();
  return id;
}
async function ufFlush() {
  if (!navigator.onLine) return; const out = REG.ufout || []; if (!out.length) return; REG.ufout = [];
  for (const o of out) { try { const d = UF.get(o.id) || await DB.get('files', 'uf:' + o.id); if (d && tokens()[o.as]) await cloudFetch('POST', { kind: 'ufile', as: o.as, id: o.id, data: d }); } catch (e) { if (e.status !== 400) REG.ufout.push(o); } }
  saveReg();
}
window.addEventListener('online', () => setTimeout(ufFlush, 900));
setTimeout(ufFlush, 6000);
function hydrateUF() { document.querySelectorAll('img[data-uf]:not([src])').forEach(async (im) => { const d = await ufGet(im.dataset.uf); if (d) im.src = d; else im.closest('.lb-ph')?.classList.add('miss'); }); }

/* ---------- Vistas ---------- */
function coverHTML(s, big) {
  const c = lbCover(s.id); const n = lbPages(s.id).length + lbNotes(s.id).length;
  return `<span class="lb-cover cv-${c} ${big ? 'big' : ''}" style="--c:${safeColor(s.color)}"><span class="lb-spine"></span>${coverArt(c)}<span class="lb-label"><b>${esc(s.name)}</b><em>${plural(n, 'página', 'páginas')}</em></span></span>`;
}
function coverArt(c) {
  if (c === 'botanico') return `<svg class="lb-art" viewBox="0 0 100 130" aria-hidden="true"><path d="M70 130C70 90 60 60 40 40"/><path d="M58 80c-12-2-20-10-20-22 12 2 20 10 20 22zM64 98c10-6 20-6 26 0-8 6-18 6-26 0zM50 60c8-8 18-10 24-6-6 8-16 10-24 6z"/><circle cx="30" cy="30" r="3"/><circle cx="22" cy="40" r="2"/></svg>`;
  if (c === 'acuarela') return '<span class="lb-wash"></span>';
  if (c === 'noche') return `<svg class="lb-art" viewBox="0 0 100 130" aria-hidden="true"><path d="M72 30a12 12 0 1 1-14-14 10 10 0 0 0 14 14z"/>${[[20, 20], [34, 44], [80, 60], [18, 70], [60, 86]].map(([x, y]) => `<path d="M${x - 2} ${y}h4M${x} ${y - 2}v4"/>`).join('')}<path d="M0 118l26-24 18 14 22-22 34 32"/></svg>`;
  if (c === 'marmol') return '<svg class="lb-art" viewBox="0 0 100 130" aria-hidden="true"><path d="M-4 30c30 10 40-6 70 8s30 0 40 4M-4 70c20-6 34 10 60 2s34-12 50-4M10 130c10-20 30-24 40-46"/></svg>';
  return '';
}
function viewLibretas(arg) {
  if (arg) return viewLibreta(arg);
  const subs = lbSubjects();
  setTimeout(hydrateUF, 30);
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Libretas</h1>
    <p class="page-sub">Una libreta por materia. Escribe apuntes, guarda información, pega fotos y pegatinas, y manda lo que quieras a tu Bosque.</p>
    ${S.subjects.length ? '' : '<div class="banner">Agrega tus materias en <a href="#/materias">Materias</a> y cada una tendrá su libreta. Mientras, usa la libreta General.</div>'}
    <div class="lb-shelf">${subs.map((s) => `<a class="lb-book" href="#/libretas/${s.id}">${coverHTML(s)}</a>`).join('')}</div>`;
}
function pageHTML(p) {
  const tone = LB_TONES[p.tone] ? p.tone : 'papel';
  let body = '';
  if (p.kind === 'foto') body = `<div class="lb-photos n${Math.min(4, (p.img || []).length)}">${(p.img || []).map((id) => `<span class="lb-ph fr-${p.frame || 'polaroid'} fx-${p.filter || 'natural'}"><img data-uf="${id}" alt="" data-act="lb-zoom" data-id="${id}">${p.frame === 'cinta' ? '<i class="lb-tape"></i>' : ''}</span>`).join('')}</div>${p.text ? `<p class="lb-cap">${esc(p.text)}</p>` : ''}`;
  else if (p.kind === 'lista') body = `<ul class="lb-check">${(p.items || []).map((it, i) => `<li><button type="button" class="lb-ck ${it.done ? 'on' : ''}" data-act="lb-check" data-id="${p.id}" data-i="${i}" aria-pressed="${!!it.done}">${icon('check', 'sm')}</button><span>${esc(it.t)}</span></li>`).join('')}</ul>`;
  else if (p.kind === 'enlace') { const u = safeURL(p.link || ''); let host = ''; try { host = new URL(u).hostname.replace(/^www\./, ''); } catch { /* */ } body = `<a class="lb-link" href="${esc(u)}" target="_blank" rel="noopener">${icon('link', 'sm')}<span><b>${esc(p.title || host)}</b><em>${esc(host)}</em></span></a>${p.text ? `<p>${esc(p.text)}</p>` : ''}`; }
  else if (p.kind === 'pegatina') body = `<div class="lb-big-stk">${stickerSVG(p.sticker || 'hoja', 'big')}</div>${p.text ? `<p class="lb-cap">${esc(p.text)}</p>` : ''}`;
  else body = `${p.text ? `<p>${linkify(p.text)}</p>` : ''}`;
  return `<article class="lb-page t-${tone} k-${p.kind} lb-tap" data-pid="${p.id}">${p.sticker && p.kind !== 'pegatina' ? stickerSVG(p.sticker, 'corner') : ''}
    <header>${p.kind === 'info' ? `<span class="lb-kind">Información clave</span>` : ''}${p.title && p.kind !== 'enlace' ? `<h3>${esc(p.title)}</h3>` : ''}</header>${body}
    <footer><span class="tiny faint">${esc(relDay(toISO(new Date(p.updated || p.at))))}</span><span class="grow"></span>
      <button class="icon-btn ghost" data-act="lb-send" data-id="${p.id}" aria-label="Mandar">${icon('share', 'sm')}</button><button class="icon-btn ghost" data-act="lb-edit" data-id="${p.id}" aria-label="Editar">${icon('edit', 'sm')}</button></footer></article>`;
}
function viewLibreta(sid) {
  const s = lbSubjects().find((x) => x.id === sid);
  if (!s) return `<a class="back" href="#/libretas">${icon('back')}Libretas</a><div class="empty"><h3>Esta libreta ya no existe</h3></div>`;
  setTimeout(hydrateUF, 30); setTimeout(hydratePhotos, 30);
  const pages = lbPages(sid).map((p) => ({ k: 'p', at: p.updated || p.at, p })); const notes = lbNotes(sid).map((n) => ({ k: 'n', at: n.updated || 0, n }));
  const feed = [...pages, ...notes].sort((a, b) => b.at - a.at);
  const tasks = S.tasks.filter((t) => (t.subjectId || '_gen') === sid).sort(sortPending);
  const photos = lbPages(sid).filter((p) => p.kind === 'foto').flatMap((p) => p.img || []);
  const tabs = `<div class="seg full" role="group" style="margin:14px 0">${[['paginas', `Páginas · ${feed.length}`], ['tareas', `Tareas · ${tasks.filter((t) => !t.done).length}`], ['fotos', `Fotos · ${photos.length}`]].map(([k, l]) => `<button type="button" data-act="lb-tab" data-v="${k}" aria-pressed="${LB.tab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (LB.tab === 'tareas') body = `<button class="btn primary" data-act="new-task" data-subject="${lbSid(sid) || ''}">${icon('plus')}Tarea de ${esc(s.name)}</button>${tasks.length ? `<ul class="tasks" style="margin-top:12px">${tasks.map((t) => taskRow(t)).join('')}</ul>` : '<p class="muted">Sin tareas en esta materia.</p>'}`;
  else if (LB.tab === 'fotos') body = photos.length ? `<div class="lb-gallery">${photos.map((id) => `<span class="lb-ph fr-simple"><img data-uf="${id}" alt="" data-act="lb-zoom" data-id="${id}"></span>`).join('')}</div>` : '<div class="empty"><h3>Sin fotos todavía</h3><p>Toma foto al pizarrón o a tu cuaderno y queda guardada aquí, aunque cambies de teléfono.</p></div>';
  else body = feed.length ? `<div class="lb-feed">${feed.map((x) => (x.k === 'p' ? pageHTML(x.p) : `<article class="lb-page t-papel k-nota lb-tap" data-nid="${x.n.id}"><header><span class="lb-kind">Apunte</span><h3>${esc(x.n.title || 'Sin título')}</h3></header><p class="lb-clip">${esc(htmlText(x.n.body).slice(0, 260))}</p><footer><span class="tiny faint">${x.n.updated ? esc(relDay(toISO(new Date(x.n.updated)))) : ''}</span><span class="grow"></span><button class="icon-btn ghost" data-act="lb-send-note" data-id="${x.n.id}" aria-label="Mandar">${icon('share', 'sm')}</button><button class="icon-btn ghost" data-act="lb-open-note" data-id="${x.n.id}" aria-label="Abrir">${icon('edit', 'sm')}</button></footer></article>`)).join('')}</div>`
    : `<div class="empty"><h3>Tu libreta está en blanco</h3><p>Empieza con un apunte, una tarjeta de información o una foto. Todo lo que escribas aquí también alimenta tu Quiz inteligente.</p></div>`;
  return `<a class="back" href="#/libretas">${icon('back')}Libretas</a>
    <section class="lb-head">${coverHTML(s, true)}<div><h1 class="page-title">${esc(s.name)}</h1><button class="link-btn" data-act="lb-cover" data-id="${sid}">Cambiar portada</button></div></section>
    <div class="lb-add">${[['nota', 'note', 'Apunte'], ['info', 'spark', 'Información'], ['lista', 'list', 'Lista'], ['foto', 'cam', 'Fotos'], ['pegatina', 'leaf', 'Pegatina'], ['enlace', 'link', 'Enlace']].map(([k, ic, l]) => `<button type="button" class="lb-addb" data-act="lb-new" data-k="${k}" data-sid="${sid}">${icon(ic)}<span>${l}</span></button>`).join('')}</div>
    ${tabs}${body}
    <div class="btn-row" style="margin-top:16px"><button class="btn" data-act="qz-go" data-v="${lbSid(sid) || ''}">${icon('spark', 'sm')}Quiz de esta libreta</button><button class="btn quiet" data-act="help-open">${icon('help', 'sm')}Pedir ayuda</button></div>`;
}
EXTRA_VIEWS.libretas = viewLibretas; EXTRA_NAV.libretas = 'mas';

/* ---------- Ver la hoja completa (lector a pantalla completa) ---------- */
function lbReadBody(p) {
  if (p.kind === 'foto') return `<div class="lb-rd-photos">${(p.img || []).map((id) => `<figure class="lb-rd-fig fr-${p.frame || 'polaroid'} fx-${p.filter || 'natural'}"><img data-uf="${id}" alt="" data-act="lb-zoom" data-id="${id}"></figure>`).join('')}</div>${p.text ? `<div class="lb-rd-text">${esc(p.text)}</div>` : ''}`;
  if (p.kind === 'lista') return `<ul class="lb-check lb-rd-list">${(p.items || []).map((it, i) => `<li><button type="button" class="lb-ck ${it.done ? 'on' : ''}" data-act="lb-check" data-id="${p.id}" data-i="${i}" aria-pressed="${!!it.done}">${icon('check', 'sm')}</button><span>${esc(it.t)}</span></li>`).join('')}</ul>`;
  if (p.kind === 'enlace') { const u = safeURL(p.link || ''); let host = ''; try { host = new URL(u).hostname.replace(/^www\./, ''); } catch { /* */ } return `<a class="lb-link" href="${esc(u)}" target="_blank" rel="noopener">${icon('link', 'sm')}<span><b>${esc(p.title || host)}</b><em>${esc(host)}</em></span></a>${p.text ? `<div class="lb-rd-text">${esc(p.text)}</div>` : ''}`; }
  if (p.kind === 'pegatina') return `<div class="lb-big-stk">${stickerSVG(p.sticker || 'hoja', 'big')}</div>${p.text ? `<div class="lb-rd-text">${esc(p.text)}</div>` : ''}`;
  return p.text ? `<div class="lb-rd-text">${linkify(p.text)}</div>` : '<p class="lb-rd-empty">Esta hoja está en blanco. Toca Editar para escribir.</p>';
}
function lbReadOpen(title, meta, body, tone, acts) {
  let o = document.getElementById('lbRead');
  if (!o) {
    o = document.createElement('div'); o.id = 'lbRead'; o.className = 'lb-reader'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    document.body.appendChild(o);
    o.addEventListener('click', (e) => {
      const t = e.target.closest('[data-lbx],[data-act]'); if (!t) return;
      if (t.dataset.lbx === 'close') { lbReadClose(); return; }
      if (t.dataset.act === 'lb-check') { t.classList.toggle('on'); t.setAttribute('aria-pressed', t.classList.contains('on')); return; }
      if (t.dataset.act && t.dataset.act !== 'lb-zoom') setTimeout(lbReadClose, 0);
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && o.classList.contains('open') && !document.getElementById('ask')?.open) lbReadClose(); });
  }
  o.innerHTML = `<div class="lb-rd-top"><button type="button" class="icon-btn ghost lb-rd-x" data-lbx="close" aria-label="Cerrar">${icon('back')}<span>Libreta</span></button><span class="lb-rd-meta">${meta}</span><span class="grow"></span>${acts}</div>
    <div class="lb-rd-scroll"><article class="lb-rd-paper t-${tone}"><h1>${esc(title || 'Sin título')}</h1>${body}</article></div>`;
  o.classList.add('open'); document.body.classList.add('lb-open');
  hydrateUF(); o.querySelector('.lb-rd-scroll').scrollTop = 0;
}
function lbReadClose() { const o = document.getElementById('lbRead'); if (o) { o.classList.remove('open'); o.innerHTML = ''; } document.body.classList.remove('lb-open'); }
function lbReadPage(p) {
  const when = relDay(toISO(new Date(p.updated || p.at)));
  lbReadOpen(p.title, `${LB_TONES[p.tone] ? esc(LB_KIND_NAME[p.kind] || 'Hoja') : 'Hoja'} · ${esc(when)}`, lbReadBody(p), LB_TONES[p.tone] ? p.tone : 'papel',
    `<button type="button" class="icon-btn ghost" data-act="lb-send" data-id="${p.id}" aria-label="Mandar">${icon('share', 'sm')}</button><button type="button" class="btn quiet lb-rd-edit" data-act="lb-edit" data-id="${p.id}">${icon('edit', 'sm')}Editar</button>`);
}
function lbReadNote(n) {
  const when = n.updated ? relDay(toISO(new Date(n.updated))) : '';
  const body = htmlText(n.body || '').trim().split(/\n+/).filter(Boolean).map((l) => `<p>${esc(l)}</p>`).join('') || '<p class="lb-rd-empty">Este apunte está vacío.</p>';
  lbReadOpen(n.title || 'Sin título', `Apunte · ${esc(when)}`, `<div class="lb-rd-text lb-rd-note">${body}</div>`, 'papel',
    `<button type="button" class="icon-btn ghost" data-act="lb-send-note" data-id="${n.id}" aria-label="Mandar">${icon('share', 'sm')}</button><button type="button" class="btn quiet" data-act="lb-open-note" data-id="${n.id}">${icon('edit', 'sm')}Editar</button>`);
}
const LB_KIND_NAME = { info: 'Información clave', lista: 'Lista', foto: 'Fotos', enlace: 'Enlace', pegatina: 'Pegatina', nota: 'Página' };
document.addEventListener('click', (e) => {
  if (e.target.closest('a,button,input,textarea,select,label,img,[data-act]')) return;
  const t = e.target.closest('.lb-tap'); if (!t) return;
  if (t.dataset.pid) { const p = (S.pages || []).find((x) => x.id === t.dataset.pid); if (p) lbReadPage(p); }
  else if (t.dataset.nid) { const n = S.notes.find((x) => x.id === t.dataset.nid); if (n) lbReadNote(n); }
});

/* ---------- Crear y editar páginas ---------- */
let LBD = null;
function pageSheet(p) {
  LBD = JSON.parse(JSON.stringify(p)); const isNew = !(S.pages || []).some((x) => x.id === p.id);
  const k = p.kind;
  LB.tone = p.tone || LB.tone; LB.sticker = p.sticker || '';
  const field = (id, label, v, rows) => (rows ? `<div class="field"><label for="${id}">${label}</label><textarea id="${id}" class="input" rows="${rows}">${esc(v || '')}</textarea></div>` : `<div class="field"><label for="${id}">${label}</label><input id="${id}" class="input" value="${esc(v || '')}" autocomplete="off"></div>`);
  let f = '';
  if (k === 'info') f = field('lbTitle', 'Concepto o tema', p.title) + field('lbText', 'Lo que hay que saber', p.text, 5) + '<p class="tiny faint">Escribe «Término: definición» o frases con «es / son»: así el Quiz inteligente arma mejores preguntas.</p>';
  else if (k === 'lista') f = field('lbTitle', 'Título', p.title) + `<div class="field"><label for="lbItems">Elementos (uno por renglón)</label><textarea id="lbItems" class="input" rows="6">${esc((p.items || []).map((i) => i.t).join('\n'))}</textarea></div>`;
  else if (k === 'foto') f = `${isNew ? `<div class="lb-pick"><label class="btn primary">${icon('cam', 'sm')}Tomar foto<input type="file" accept="image/*" capture="environment" id="lbCam" hidden></label><label class="btn">${icon('upload', 'sm')}Elegir de la galería<input type="file" accept="image/*" multiple id="lbGal" hidden></label></div><div id="lbPrev" class="lb-photos"></div>` : `<div class="lb-photos">${(p.img || []).map((id) => `<span class="lb-ph fr-${p.frame} fx-${p.filter}"><img data-uf="${id}" alt=""></span>`).join('')}</div>`}
      <div class="field"><span class="lbl">Marco</span><div class="pick" role="group" id="lbFrame">${Object.entries(LB_FRAMES).map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${(p.frame || LB.frame) === v}">${l}</button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Filtro</span><div class="pick" role="group" id="lbFilter">${Object.entries(LB_FILTERS).map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${(p.filter || LB.filter) === v}">${l}</button>`).join('')}</div></div>` + field('lbText', 'Descripción (opcional)', p.text, 2);
  else if (k === 'enlace') f = field('lbLink', 'Enlace', p.link) + field('lbTitle', 'Título (opcional)', p.title) + field('lbText', 'Nota (opcional)', p.text, 2);
  else if (k === 'pegatina') f = field('lbText', 'Frase o nota (opcional)', p.text, 2);
  else f = field('lbTitle', 'Título', p.title) + field('lbText', 'Texto', p.text, 7);
  openSheet(`${sheetHead(isNew ? { info: 'Información clave', lista: 'Nueva lista', foto: 'Fotos', enlace: 'Enlace', pegatina: 'Pegatina', nota: 'Página' }[k] : 'Editar página')}<div class="sheet-body">${f}
    <div class="field"><span class="lbl">${k === 'pegatina' ? 'Elige una pegatina' : 'Pegatina (opcional)'}</span><div class="lb-stks" role="group">${k === 'pegatina' ? '' : `<button type="button" class="lb-sb ${!LB.sticker ? 'on' : ''}" data-v="">Ninguna</button>`}${Object.keys(STICKERS).map((s) => `<button type="button" class="lb-sb ${LB.sticker === s ? 'on' : ''}" data-v="${s}" aria-label="${s}">${stickerSVG(s)}</button>`).join('')}</div></div>
    <div class="field"><span class="lbl">Color de la hoja</span><div class="pz-tones" role="group" id="lbTones">${Object.keys(LB_TONES).map((t) => `<button type="button" class="pz-tone lbt-${t}" data-v="${t}" aria-pressed="${LB.tone === t}" aria-label="${LB_TONES[t]}"></button>`).join('')}</div></div></div>
    <div class="sheet-foot">${isNew ? '<button class="btn" data-act="sheet-close">Cancelar</button>' : `<button class="btn danger" data-act="lb-del" data-id="${p.id}">${icon('trash', 'sm')}Quitar</button>`}<span class="grow"></span><button class="btn primary" id="lbSave">${isNew ? 'Pegar en la libreta' : 'Guardar'}</button></div>`);
  setTimeout(hydrateUF, 30);
  const sh = sheet(); const pickIn = (sel, key) => sh.querySelectorAll(`${sel} button`).forEach((b) => b.addEventListener('click', () => { LBD[key] = b.dataset.v; LB[key] = b.dataset.v; sh.querySelectorAll(`${sel} button`).forEach((x) => x.setAttribute('aria-pressed', x === b)); sh.querySelectorAll('#lbPrev .lb-ph').forEach((ph) => { ph.className = `lb-ph fr-${LBD.frame || LB.frame} fx-${LBD.filter || LB.filter}`; }); }));
  pickIn('#lbFrame', 'frame'); pickIn('#lbFilter', 'filter');
  sh.querySelectorAll('#lbTones button').forEach((b) => b.addEventListener('click', () => { LB.tone = b.dataset.v; sh.querySelectorAll('#lbTones button').forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
  sh.querySelectorAll('.lb-sb').forEach((b) => b.addEventListener('click', () => { LB.sticker = b.dataset.v; sh.querySelectorAll('.lb-sb').forEach((x) => x.classList.toggle('on', x === b)); Snd.tick(); }));
  const addFiles = async (files) => {
    const prev = document.getElementById('lbPrev');
    for (const f0 of [...files].slice(0, 8)) {
      try { const d = await fileToDataURL(f0, 1400, 0.74); (LBD.newImg ||= []).push(d); prev.insertAdjacentHTML('beforeend', `<span class="lb-ph fr-${LBD.frame || LB.frame} fx-${LBD.filter || LB.filter}"><img src="${d}" alt=""></span>`); } catch { toast('No se pudo abrir una foto.'); }
    }
  };
  ['lbCam', 'lbGal'].forEach((id) => document.getElementById(id)?.addEventListener('change', (e) => addFiles(e.target.files)));
  document.getElementById('lbSave').addEventListener('click', async (e) => {
    const v = (id) => (document.getElementById(id)?.value || '').trim();
    const d = LBD; d.tone = LB.tone; d.sticker = LB.sticker || (k === 'pegatina' ? 'hoja' : '');
    if (document.getElementById('lbTitle')) d.title = v('lbTitle');
    if (document.getElementById('lbText')) d.text = v('lbText');
    if (k === 'lista') { const old = new Map((d.items || []).map((i) => [i.t, i.done])); d.items = v('lbItems').split('\n').map((t) => t.trim()).filter(Boolean).map((t) => ({ t, done: !!old.get(t) })); if (!d.items.length) { toast('Escribe al menos un elemento.'); return; } }
    if (k === 'enlace') { const u = safeURL(v('lbLink')) || safeURL('https://' + v('lbLink')); if (!u) { toast('Escribe un enlace válido.'); return; } d.link = u; }
    if (k === 'foto') { d.frame = d.frame || LB.frame; d.filter = d.filter || LB.filter; if (d.newImg) { e.target.disabled = true; d.img = [...(d.img || [])]; for (const im of d.newImg) d.img.push(await ufPut(im)); delete d.newImg; } if (!(d.img || []).length) { toast('Agrega al menos una foto.'); e.target.disabled = false; return; } }
    if ((k === 'nota' || k === 'info') && !d.text && !d.title) { toast('Escribe algo primero.'); return; }
    d.updated = Date.now();
    commit((s) => { s.pages ||= []; const i = s.pages.findIndex((x) => x.id === d.id); if (i >= 0) s.pages[i] = d; else s.pages.push(d); });
    closeSheet(false); Snd.drop(); waterToday(); setTimeout(() => { const el = document.querySelector('.lb-page'); if (el) { el.classList.add('lb-new'); leafBurst(el); } }, 60);
  });
}
async function sendPage(p) {
  const fs = typeof myForests === 'function' ? myForests() : []; const friends = typeof socOf === 'function' ? socOf().friends : [];
  if (!fs.length && !friends.length) { toast('Únete a un Bosque o agrega una amistad para mandar tus páginas.'); return; }
  const v = await ask({ title: '¿A dónde la mandas?', options: [...fs.map((f) => ({ value: 'f:' + f.meta.id, label: `Pizarrón de ${f.meta.name}`, icon: 'users' })), ...friends.map((f) => ({ value: 'u:' + f.id, label: `Mensaje a ${f.name}`, icon: 'heart' }))] });
  if (!v) return;
  const text = p.kind === 'lista' ? (p.items || []).map((i) => `• ${i.t}`).join('\n') : (p.text || '');
  try {
    if (v.startsWith('f:')) {
      const fid = v.slice(2); const f = FOR.f[fid]; const meta = (f.items || []).find((x) => x.id === `bm-${fid}`); const ep = +(meta?.epoch || 0);
      const base = { id: 'pz' + uid(), type: 'board', ep, tone: ['papel', 'salvia', 'cielo', 'rosa', 'miel'].includes(p.tone) ? p.tone : 'papel', x: Math.random() * 0.5, y: 0.02 + Math.random() * 0.2, at: Date.now(), by: me(), from: 'libreta' };
      const items = [];
      if (p.kind === 'foto') for (const id of p.img || []) { const d = await ufGet(id); if (!d) continue; const fileId = 'f' + uid(); await cloudFetch('POST', { kind: 'gimg', as: REG.me, forest: fid, id: fileId, data: d }); items.push({ ...base, id: 'pz' + uid(), kind: 'file', fileId, file: 'foto.jpg', size: Math.round(d.length * 0.75), title: p.text || 'Foto de mi libreta' }); }
      else if (p.kind === 'enlace') items.push({ ...base, kind: 'link', link: p.link, title: p.title, text: p.text });
      else items.push({ ...base, kind: (text.length > 160 || p.title) ? 'draft' : 'note', title: p.title || '', text: text || p.title });
      for (const it of items) { await cloudFetch('POST', { kind: 'gitem', as: REG.me, forest: fid, item: it, device: CLOUD.device }); (f.items ||= []).push(it); }
      saveFOR(); toast(`Listo: está en el pizarrón de ${f.meta.name}.`); Snd.chime();
    } else {
      const to = v.slice(2); const msg = `${p.title ? `${p.title}\n` : ''}${text}${p.link ? `\n${p.link}` : ''}`.trim() || 'Te comparto una página de mi libreta.';
      await cloudFetch('POST', { kind: 'dm', as: REG.me, to, text: msg.slice(0, 2000), id: uid().replace(/[^a-z0-9]/gi, '').slice(0, 20).padEnd(8, '0') });
      toast('Mensaje enviado.'); Snd.chime(); cloudSync();
    }
  } catch (x) { toast(/fetch|network|Failed/i.test(x.message) ? 'Para mandar necesitas internet.' : x.message); }
}
Object.assign(VIDA_ACTS, {
  'lb-tab': (el) => { LB.tab = el.dataset.v; render(); },
  'lb-new': (el) => {
    const sid = el.dataset.sid; const k = el.dataset.k;
    if (k === 'nota' && !lbPages(sid).length && false) return;
    if (k === 'nota') { openNote(null, { subjectId: lbSid(sid) }); return; }
    pageSheet({ id: 'pg' + uid(), kind: k, subjectId: lbSid(sid), title: '', text: '', items: [], img: [], tone: LB.tone, at: Date.now() });
  },
  'lb-edit': (el) => { const p = (S.pages || []).find((x) => x.id === el.dataset.id); if (p) pageSheet(p); },
  'lb-del': async (el) => { const ok = await ask({ title: '¿Quitar esta página?', text: 'Se quita de tu libreta.', ok: 'Quitar', danger: true }); if (!ok) return; commit((s) => { const p = s.pages.find((x) => x.id === el.dataset.id); if (p) { p.deleted = true; p.updated = Date.now(); } }); closeSheet(false); },
  'lb-check': (el) => { commit((s) => { const p = s.pages.find((x) => x.id === el.dataset.id); if (p && p.items[+el.dataset.i]) { p.items[+el.dataset.i].done = !p.items[+el.dataset.i].done; p.updated = Date.now(); } }); Snd.pop ? Snd.pop() : Snd.tick(); },
  'lb-send': (el) => { const p = (S.pages || []).find((x) => x.id === el.dataset.id); if (p) sendPage(p); },
  'lb-send-note': (el) => { const n = S.notes.find((x) => x.id === el.dataset.id); if (n) sendPage({ kind: 'nota', title: n.title, text: htmlText(n.body).trim(), tone: 'papel' }); },
  'lb-open-note': (el) => openNote(el.dataset.id),
  'lb-zoom': async (el) => { const d = await ufGet(el.dataset.id); if (!d) return; const a = $('#ask'); a.innerHTML = `<form method="dialog" class="lb-zoom"><img src="${d}" alt=""><button class="btn" value="cancel">Cerrar</button></form>`; a.showModal(); },
  'lb-cover': async (el) => { const v = await ask({ title: 'Portada de la libreta', options: Object.entries(LB_COVERS).map(([k, l]) => ({ value: k, label: l })) }); if (!v) return; S.settings.covers = { ...(S.settings.covers || {}), [el.dataset.id]: v }; commit(); Snd.tick(); },
});
