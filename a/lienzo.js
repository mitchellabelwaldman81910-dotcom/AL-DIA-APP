/* Cinnavia 7.25 — Mi pizarrón: un lienzo infinito personal dentro de Libretas.
   Notas, tareas, títulos, enlaces, fotos y marcos para agrupar. Se mueve con el dedo, se acerca con dos dedos
   y se guarda solo en tu cuenta (también sin internet). */
'use strict';
const LZ_TONES = { papel: '#FFFDF6', salvia: '#E4EFDF', cielo: '#E0ECF7', rosa: '#F7E3EA', miel: '#FAEBC8', lavanda: '#ECE6F8' };
const LZ_KINDS = { note: 'Nota', todo: 'Tarea', titulo: 'Título', enlace: 'Enlace', foto: 'Foto', marco: 'Marco' };
const LZ = { sel: null, g: null, saved: true, st: null };
const lzData = () => { const d = (S.lienzo ||= { cards: [], view: { x: 0, y: 0, z: 1 }, bg: 'puntos', at: 0 }); if (!Array.isArray(d.cards)) d.cards = []; if (!d.view) d.view = { x: 0, y: 0, z: 1 }; return d; };
const lzCards = () => lzData().cards.filter((c) => !c.del);
let lzSaveT = 0;
function lzTouch() { const d = lzData(); d.at = Date.now(); LZ.saved = false; lzInd(); clearTimeout(lzSaveT); lzSaveT = setTimeout(() => { save(); LZ.saved = true; lzInd(); }, 500); }
function lzInd() { const e = document.getElementById('lzInd'); if (e) { e.textContent = LZ.saved ? 'Guardado' : 'Guardando…'; e.dataset.ok = LZ.saved ? '1' : '0'; } }
function lzApplyView() {
  const d = lzData(); const w = document.getElementById('lzWorld'); if (!w) return;
  w.style.transform = `translate(${d.view.x}px,${d.view.y}px) scale(${d.view.z})`;
  const v = document.getElementById('lzView'); if (v) { const s = 28 * d.view.z; v.style.backgroundSize = `${s}px ${s}px`; v.style.backgroundPosition = `${d.view.x}px ${d.view.y}px`; }
  const zl = document.getElementById('lzZoom'); if (zl) zl.textContent = Math.round(d.view.z * 100) + '%';
}
function lzCardHTML(c) {
  const st = `left:${c.x}px;top:${c.y}px;width:${c.w || 190}px;${c.k === 'marco' ? `height:${c.h || 220}px;` : ''}z-index:${c.k === 'marco' ? 0 : 1 + (c.z || 0)};--lz:${LZ_TONES[c.tone] || LZ_TONES.papel}`;
  let body = '';
  if (c.k === 'todo') body = `<ul class="lz-todo">${(c.items || []).map((it, i) => `<li class="${it.done ? 'done' : ''}"><button type="button" class="lz-ck ${it.done ? 'on' : ''}" data-act="lz-chk" data-id="${c.id}" data-i="${i}" aria-pressed="${!!it.done}" aria-label="Marcar">${it.done ? icon('check', 'sm') : ''}</button><span>${esc(it.t)}</span></li>`).join('') || '<li class="faint">Toca para agregar tareas</li>'}</ul>`;
  else if (c.k === 'titulo') body = `<b class="lz-h">${esc(c.text || 'Título')}</b>`;
  else if (c.k === 'enlace') { const u = safeURL(c.link || ''); let host = ''; try { host = new URL(u).hostname.replace(/^www\./, ''); } catch { /* */ } body = `<b class="lz-t">${esc(c.text || host || 'Enlace')}</b><span class="lz-url">${esc(host || 'sin dirección')}</span>`; }
  else if (c.k === 'foto') body = c.img ? `<img data-uf="${esc(c.img)}" alt="${esc(c.text || 'Foto')}" draggable="false">${c.text ? `<p class="lz-cap">${esc(c.text)}</p>` : ''}` : '<p class="faint">Sin foto</p>';
  else if (c.k === 'marco') body = `<span class="lz-frame-t">${esc(c.text || 'Grupo')}</span>`;
  else body = `<p>${esc(c.text || '').replace(/\n/g, '<br>') || '<span class="faint">Toca para escribir</span>'}</p>`;
  return `<article class="lz-card k-${c.k}${LZ.sel === c.id ? ' sel' : ''}" data-lz="${c.id}" style="${st}">${body}<i class="lz-rs" data-rs="${c.id}"></i></article>`;
}
function lzPaint() {
  const w = document.getElementById('lzWorld'); if (!w) return;
  w.innerHTML = lzCards().map(lzCardHTML).join(''); lzApplyView(); if (typeof hydrateUF === 'function') hydrateUF();
  const e = document.getElementById('lzEmpty'); if (e) e.hidden = lzCards().length > 0;
}
function viewLienzo() {
  const d = lzData(); setTimeout(() => { lzPaint(); lzInd(); }, 0);
  return `<a class="back" href="#/libretas">${icon('back')}Libretas</a>
    <div class="lz-head"><h1 class="page-title" style="margin:0">Mi pizarrón</h1><span class="lz-ind" id="lzInd" data-ok="1">Guardado</span></div>
    <div class="lz-bar" role="toolbar" aria-label="Agregar al pizarrón">${Object.entries(LZ_KINDS).map(([k, l]) => `<button type="button" class="chip" data-act="lz-add" data-k="${k}">${icon(k === 'todo' ? 'check' : k === 'foto' ? 'cam' : k === 'enlace' ? 'link' : k === 'marco' ? 'grid' : k === 'titulo' ? 'edit' : 'note', 'sm')}${l}</button>`).join('')}</div>
    <div class="lz-wrap"><div class="lz-view bg-${d.bg || 'puntos'}" id="lzView"><div class="lz-world" id="lzWorld"></div>
      <div class="lz-empty" id="lzEmpty" hidden><h3>Tu pizarrón infinito</h3><p>Agrega notas, tareas, fotos y marcos. Arrastra el fondo para moverte y usa dos dedos para acercar.</p></div>
      <div class="lz-ctl"><button type="button" class="icon-btn" data-act="lz-zoom" data-d="-1" aria-label="Alejar">−</button><span id="lzZoom">100%</span><button type="button" class="icon-btn" data-act="lz-zoom" data-d="1" aria-label="Acercar">+</button><button type="button" class="icon-btn" data-act="lz-fit" aria-label="Ver todo">${icon('grid', 'sm')}</button><button type="button" class="icon-btn" data-act="lz-bg" aria-label="Cambiar fondo">${icon('palette', 'sm')}</button></div></div></div>
    <input type="file" id="lzFile" accept="image/*" class="sr">
    <p class="small muted" style="margin-top:10px">Toca una tarjeta para editarla. Un marco agrupa: al moverlo se llevan las tarjetas que están dentro. Todo se guarda solo.</p>`;
}
EXTRA_VIEWS.lienzo = viewLienzo; EXTRA_NAV.lienzo = 'mas';

/* ---------- Gestos: mover, acercar, arrastrar tarjetas ---------- */
const lzPt = (e) => { const r = document.getElementById('lzView').getBoundingClientRect(); const v = lzData().view; return { sx: e.clientX - r.left, sy: e.clientY - r.top, x: (e.clientX - r.left - v.x) / v.z, y: (e.clientY - r.top - v.y) / v.z }; };
function lzZoomAt(sx, sy, nz) {
  const v = lzData().view; nz = Math.max(0.2, Math.min(2.5, nz)); const wx = (sx - v.x) / v.z, wy = (sy - v.y) / v.z; v.z = nz; v.x = sx - wx * nz; v.y = sy - wy * nz; lzApplyView();
}
const LZP = new Map();
document.addEventListener('pointerdown', (e) => {
  const view = e.target.closest && e.target.closest('#lzView'); if (!view) return;
  if (e.target.closest('.lz-ctl') || e.target.closest('[data-act]')) return;
  LZP.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { view.setPointerCapture(e.pointerId); } catch { /* */ }
  if (LZP.size === 2) { const [a, b] = [...LZP.values()]; LZ.g = { type: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: lzData().view.z }; return; }
  if (LZP.size > 2) return;
  const rs = e.target.closest('[data-rs]'); const card = e.target.closest('[data-lz]'); const c = card && lzData().cards.find((x) => x.id === card.dataset.lz);
  if (rs && c) { LZ.g = { type: 'resize', c, w0: c.w || 190, h0: c.h || 220, sx: e.clientX, sy: e.clientY, moved: false }; return; }
  if (c) {
    const p = lzPt(e); let group = [];
    if (c.k === 'marco') group = lzCards().filter((o) => o.k !== 'marco' && o.x + (o.w || 190) / 2 > c.x && o.x + (o.w || 190) / 2 < c.x + (c.w || 300) && o.y + 30 > c.y && o.y + 30 < c.y + (c.h || 220)).map((o) => ({ o, x0: o.x, y0: o.y }));
    LZ.g = { type: 'card', c, el: card, x0: c.x, y0: c.y, px: p.x, py: p.y, moved: false, group }; return;
  }
  const v = lzData().view; LZ.g = { type: 'pan', sx: e.clientX, sy: e.clientY, vx: v.x, vy: v.y, moved: false };
});
document.addEventListener('pointermove', (e) => {
  if (!LZP.has(e.pointerId) || !LZ.g) return; LZP.set(e.pointerId, { x: e.clientX, y: e.clientY }); const g = LZ.g;
  if (g.type === 'pinch' && LZP.size >= 2) { const [a, b] = [...LZP.values()]; const r = document.getElementById('lzView').getBoundingClientRect(); lzZoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, g.z0 * Math.hypot(a.x - b.x, a.y - b.y) / g.d0); g.moved = true; return; }
  const v = lzData().view;
  if (g.type === 'pan') { const dx = e.clientX - g.sx, dy = e.clientY - g.sy; if (Math.abs(dx) + Math.abs(dy) > 3) g.moved = true; v.x = g.vx + dx; v.y = g.vy + dy; lzApplyView(); }
  else if (g.type === 'card') { const p = lzPt(e); const dx = p.x - g.px, dy = p.y - g.py; if (!g.moved && Math.abs(dx) + Math.abs(dy) < 4 / v.z) return; g.moved = true; if (g.c.pin) return;
    g.c.x = Math.round(g.x0 + dx); g.c.y = Math.round(g.y0 + dy); g.el.style.left = g.c.x + 'px'; g.el.style.top = g.c.y + 'px'; g.el.classList.add('drag');
    for (const m of g.group) { m.o.x = Math.round(m.x0 + dx); m.o.y = Math.round(m.y0 + dy); const el = document.querySelector(`[data-lz="${m.o.id}"]`); if (el) { el.style.left = m.o.x + 'px'; el.style.top = m.o.y + 'px'; } } }
  else if (g.type === 'resize') { const dx = (e.clientX - g.sx) / v.z, dy = (e.clientY - g.sy) / v.z; g.moved = true; g.c.w = Math.max(110, Math.round(g.w0 + dx)); const el = document.querySelector(`[data-lz="${g.c.id}"]`); if (el) { el.style.width = g.c.w + 'px'; if (g.c.k === 'marco') { g.c.h = Math.max(90, Math.round(g.h0 + dy)); el.style.height = g.c.h + 'px'; } } }
}, { passive: true });
const lzUp = (e) => {
  if (!LZP.has(e.pointerId)) return; LZP.delete(e.pointerId); const g = LZ.g; if (LZP.size > 0) { if (g && g.type === 'pinch') LZ.g = null; return; } LZ.g = null; if (!g) return;
  if (g.type === 'pinch') { lzTouch(); return; }
  if (g.type === 'card') { g.el.classList.remove('drag'); if (g.moved) { g.c.z = Math.max(0, ...lzCards().map((o) => o.z || 0)) + 1; g.el.style.zIndex = g.c.k === 'marco' ? 0 : 1 + g.c.z; lzTouch(); } else lzEdit(g.c.id); }
  else if (g.type === 'resize' || g.type === 'pan') { if (g.moved) lzTouch(); else if (g.type === 'pan' && LZ.sel) { LZ.sel = null; document.querySelectorAll('.lz-card.sel').forEach((n) => n.classList.remove('sel')); } }
};
document.addEventListener('pointerup', lzUp); document.addEventListener('pointercancel', lzUp);
document.addEventListener('wheel', (e) => { const view = e.target.closest && e.target.closest('#lzView'); if (!view) return; e.preventDefault(); const r = view.getBoundingClientRect(); lzZoomAt(e.clientX - r.left, e.clientY - r.top, lzData().view.z * (e.deltaY < 0 ? 1.1 : 0.9)); clearTimeout(lzUp.t); lzUp.t = setTimeout(lzTouch, 300); }, { passive: false });

/* ---------- Agregar y editar ---------- */
function lzCenter() { const v = document.getElementById('lzView'), d = lzData().view; const w = v ? v.clientWidth : 360, h = v ? v.clientHeight : 500; return { x: (w / 2 - d.x) / d.z, y: (h / 2 - d.y) / d.z }; }
function lzAdd(k, extra) {
  const c0 = lzCenter(); const n = lzCards().length; const wmap = { note: 190, todo: 200, titulo: 260, enlace: 210, foto: 210, marco: 340 };
  const c = { id: 'lz' + uid(), k, x: Math.round(c0.x - wmap[k] / 2 + (n % 5) * 14), y: Math.round(c0.y - 50 + (n % 5) * 14), w: wmap[k], tone: k === 'marco' ? 'salvia' : 'papel', text: '', z: Math.max(0, ...lzCards().map((o) => o.z || 0)) + 1, u: Date.now(), ...extra };
  if (k === 'marco') c.h = 240; if (k === 'todo') c.items = [];
  lzData().cards.push(c); lzTouch(); lzPaint(); return c;
}
function lzEdit(id) {
  const c = lzData().cards.find((x) => x.id === id); if (!c) return; LZ.sel = id;
  const field = c.k === 'todo' ? `<div class="field"><label for="lzTx">Tareas (una por línea)</label><textarea id="lzTx" class="input" rows="6">${esc((c.items || []).map((i) => i.t).join('\n'))}</textarea></div>`
    : c.k === 'enlace' ? `<div class="field"><label for="lzTx">Título</label><input id="lzTx" class="input" value="${esc(c.text || '')}"></div><div class="field"><label for="lzLk">Dirección</label><input id="lzLk" class="input" type="url" inputmode="url" placeholder="https://" value="${esc(c.link || '')}"></div>`
    : c.k === 'titulo' || c.k === 'marco' ? `<div class="field"><label for="lzTx">${c.k === 'marco' ? 'Nombre del grupo' : 'Título'}</label><input id="lzTx" class="input" value="${esc(c.text || '')}"></div>`
    : c.k === 'foto' ? `<div class="field"><label for="lzTx">Pie de foto</label><input id="lzTx" class="input" value="${esc(c.text || '')}"></div>`
    : `<div class="field"><label for="lzTx">Texto</label><textarea id="lzTx" class="input" rows="6">${esc(c.text || '')}</textarea></div>`;
  openSheet(`${sheetHead(LZ_KINDS[c.k])}<div class="sheet-body" data-lzid="${c.id}">${field}
    ${c.k === 'titulo' ? '' : `<div class="field"><span class="lbl">Color</span><div class="lz-tones">${Object.entries(LZ_TONES).map(([t, col]) => `<button type="button" class="lz-tone${c.tone === t ? ' on' : ''}" data-act="lz-tone" data-v="${t}" style="background:${col}" aria-label="${t}" aria-pressed="${c.tone === t}"></button>`).join('')}</div></div>`}
    <label class="pz-pin-row"><input type="checkbox" id="lzPin" ${c.pin ? 'checked' : ''}> Fijar en su lugar (no se mueve)</label>
    <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-act="lz-save">Listo</button><button class="btn" data-act="lz-dup">Duplicar</button><button class="btn danger" data-act="lz-del">Eliminar</button></div></div>`, () => { LZ.sel = null; });
  setTimeout(() => document.getElementById('lzTx')?.focus(), 250);
}
const lzCur = () => { const id = document.querySelector('[data-lzid]')?.dataset.lzid; return lzData().cards.find((x) => x.id === id); };
Object.assign(VIDA_ACTS, {
  'lz-add': (el) => { const k = el.dataset.k; if (k === 'foto') { document.getElementById('lzFile')?.click(); return; } const c = lzAdd(k); if (k !== 'marco') lzEdit(c.id); else lzEdit(c.id); },
  'lz-zoom': (el) => { const v = document.getElementById('lzView'); const r = v.getBoundingClientRect(); lzZoomAt(r.width / 2, r.height / 2, lzData().view.z * (+el.dataset.d > 0 ? 1.25 : 0.8)); lzTouch(); },
  'lz-bg': () => { const o = ['puntos', 'cuadricula', 'rayas', 'liso']; const d = lzData(); d.bg = o[(o.indexOf(d.bg || 'puntos') + 1) % o.length]; const v = document.getElementById('lzView'); if (v) v.className = `lz-view bg-${d.bg}`; lzTouch(); },
  'lz-fit': () => {
    const cs = lzCards(); const v = document.getElementById('lzView'); const d = lzData().view; if (!cs.length || !v) { d.x = 0; d.y = 0; d.z = 1; lzApplyView(); lzTouch(); return; }
    const x0 = Math.min(...cs.map((c) => c.x)), y0 = Math.min(...cs.map((c) => c.y)), x1 = Math.max(...cs.map((c) => c.x + (c.w || 190))), y1 = Math.max(...cs.map((c) => c.y + (c.k === 'marco' ? c.h || 220 : 120)));
    const z = Math.max(0.2, Math.min(1.2, Math.min((v.clientWidth - 40) / (x1 - x0), (v.clientHeight - 40) / (y1 - y0)))); d.z = z; d.x = (v.clientWidth - (x1 - x0) * z) / 2 - x0 * z; d.y = (v.clientHeight - (y1 - y0) * z) / 2 - y0 * z; lzApplyView(); lzTouch();
  },
  'lz-chk': (el) => { const c = lzData().cards.find((x) => x.id === el.dataset.id); const it = c && (c.items || [])[+el.dataset.i]; if (!it) return; it.done = !it.done; c.u = Date.now(); Snd.tick(); lzTouch(); lzPaint(); },
  'lz-tone': (el) => { const c = lzCur(); if (!c) return; c.tone = el.dataset.v; c.u = Date.now(); document.querySelectorAll('.lz-tone').forEach((b) => { const on = b === el; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); lzTouch(); lzPaint(); },
  'lz-save': () => {
    const c = lzCur(); if (!c) { closeSheet(); return; } const tx = document.getElementById('lzTx')?.value ?? '';
    if (c.k === 'todo') { const old = c.items || []; c.items = tx.split('\n').map((t) => t.trim()).filter(Boolean).map((t) => ({ t, done: !!old.find((o) => o.t === t && o.done) })); }
    else c.text = tx.trim(); if (c.k === 'enlace') c.link = document.getElementById('lzLk')?.value.trim() || '';
    c.pin = !!document.getElementById('lzPin')?.checked; c.u = Date.now(); lzTouch(); closeSheet(); lzPaint();
  },
  'lz-dup': () => { const c = lzCur(); if (!c) return; const n = JSON.parse(JSON.stringify(c)); n.id = 'lz' + uid(); n.x += 24; n.y += 24; n.u = Date.now(); n.pin = false; lzData().cards.push(n); lzTouch(); closeSheet(); lzPaint(); },
  'lz-del': async () => { const c = lzCur(); if (!c) return; const ok = await ask({ title: '¿Eliminar esta tarjeta?', text: c.k === 'marco' ? 'Se quita el marco; las tarjetas de adentro se quedan.' : 'No se puede deshacer.', ok: 'Eliminar', danger: true }); if (!ok) return; c.del = 1; c.u = Date.now(); lzTouch(); closeSheet(); lzPaint(); },
});
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'lzFile' || !e.target.files[0]) return; const f = e.target.files[0]; e.target.value = '';
  try { const d = await fileToDataURL(f, 1200, 0.72); const iid = await ufPut(d); const c = lzAdd('foto', { img: iid }); toast('Foto agregada'); void c; } catch { toast('No se pudo agregar la foto.'); }
});

/* ---------- Sincronía entre dispositivos: se mezcla por tarjeta ---------- */
{
  const baseMerge = mergeDocs;
  mergeDocs = function (local, remote, base, td) {
    const out = baseMerge(local, remote, base, td); const a = local.lienzo, b = remote.lienzo;
    if (a || b) {
      const map = new Map(); for (const c of [...((b && b.cards) || []), ...((a && a.cards) || [])]) { const o = map.get(c.id); if (!o || (c.u || 0) >= (o.u || 0)) map.set(c.id, c); }
      out.lienzo = { ...(b || {}), ...(a || {}), cards: [...map.values()], view: (a && a.view) || (b && b.view) || { x: 0, y: 0, z: 1 }, at: Math.max((a && a.at) || 0, (b && b.at) || 0) };
    }
    return out;
  };
}

/* ---------- Entrada al final de Libretas ---------- */
{
  const baseLib = viewLibretas;
  viewLibretas = function (arg) {
    const h = baseLib(arg); if (arg) return h; const n = lzCards().length;
    return h + `<a class="card lz-entry" href="#/lienzo"><span class="lz-entry-ic">${icon('grid')}</span><span><b>Mi pizarrón</b><span class="small muted" style="display:block">${n ? plural(n, 'tarjeta', 'tarjetas') + ' · ' : ''}Un lienzo infinito para acomodar tus ideas a tu gusto. Se guarda solo.</span></span>${icon('chev', 'chev sm')}</a>`;
  };
  EXTRA_VIEWS.libretas = viewLibretas;
}
