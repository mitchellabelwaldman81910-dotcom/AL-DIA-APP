/* Cinnavia 7.48 — Libros del Bosque.
   Cualquier integrante sube un PDF (máx. 2 MB) y se convierte en un libro digital en la estantería del Bosque:
   todos los integrantes lo ven, lo abren en un lector con páginas y retoman donde se quedaron.
   El archivo viaja por el mismo canal que el Pizarrón (gimg); la ficha del libro es un elemento `book` del Bosque. */
'use strict';
const LBK_SRC = (() => { try { return document.currentScript.src; } catch { return location.href; } })();
const LB_COLORS = ['#5b7a64', '#7a5b5b', '#5b6c7a', '#7a6b4a', '#6a5b7a', '#4f7571', '#7a5b6e', '#6b6f4a'];
const LB_CATS = ['Libro', 'Apuntes', 'Novela', 'Ciencias', 'Matemáticas', 'Historia', 'Idiomas', 'Arte', 'Otro'];
const LBK = { q: '', cat: 'all', pdfjs: null, doc: null, page: 1, id: null, busy: false };
const lbHash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const lbColor = (b) => (b.color && /^#[0-9a-f]{6}$/i.test(b.color)) ? b.color : LB_COLORS[lbHash(b.id) % LB_COLORS.length];
const lbBooks = () => gAll('book').slice().sort((a, b) => (b.at || 0) - (a.at || 0));
const lbPosKey = (id) => `aldia:lbpos:${REG.me}:${id}`;
const lbGetPos = (id) => { try { return Math.max(1, +localStorage.getItem(lbPosKey(id)) || 1); } catch { return 1; } };
const lbSetPos = (id, n) => { try { localStorage.setItem(lbPosKey(id), String(n)); } catch { /* */ } };
const lbCanEdit = (b) => b.byId === REG.me || (typeof isGuardian === 'function' && isGuardian());

async function lbLoadLib() {
  if (LBK.pdfjs) return LBK.pdfjs;
  const base = new URL('vendor/', LBK_SRC).href;
  const m = await import(base + 'pdf.min.mjs');
  m.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.mjs';
  LBK.pdfjs = m; return m;
}
async function lbOpenPdf(dataUrl) {
  const lib = await lbLoadLib();
  const b = dataURLtoBlob(dataUrl); const buf = new Uint8Array(await b.arrayBuffer());
  return lib.getDocument({ data: buf, isEvalSupported: false }).promise;
}

function lbCoverHTML(b, big) {
  const c = lbColor(b);
  return `<span class="lb-cover${big ? ' big' : ''}" style="--bc:${c}" aria-hidden="true"><span class="lb-spine"></span><span class="lb-ct">${esc(b.title || 'Libro')}</span><span class="lb-ca">${esc(b.author || '')}</span></span>`;
}
function viewLibros() {
  const all = lbBooks(); const q = LBK.q.trim().toLowerCase();
  const cats = [...new Set(all.map((b) => b.cat).filter(Boolean))];
  const list = all.filter((b) => (LBK.cat === 'all' || b.cat === LBK.cat) && (!q || `${b.title} ${b.author} ${b.desc}`.toLowerCase().includes(q)));
  const shelf = list.map((b) => {
    const p = lbGetPos(b.id); const pct = b.pages ? Math.min(100, Math.round(p / b.pages * 100)) : 0;
    return `<li class="lb-item"><button type="button" class="lb-open" data-act="lb-open" data-id="${b.id}" aria-label="Abrir ${esc(b.title)}">${lbCoverHTML(b)}
      <span class="lb-meta"><b>${esc(b.title)}</b><span class="tiny faint">${esc(b.author || 'Autor desconocido')}</span><span class="tiny faint">${b.pages ? b.pages + ' págs. · ' : ''}${esc(fmtSize(b.size || 0))}</span>
      <span class="tiny faint">Compartido por ${esc(b.byId === REG.me ? 'ti' : (b.by || 'alguien'))}</span>${p > 1 ? `<span class="lb-bar" title="Leído ${pct}%"><i style="width:${pct}%"></i></span>` : ''}</span></button>
      ${lbCanEdit(b) ? `<button type="button" class="icon-btn ghost lb-more" data-act="lb-edit" data-id="${b.id}" aria-label="Editar o quitar">${icon('edit')}</button>` : ''}</li>`;
  }).join('');
  return `${groupHead('Libros', 'La estantería del Bosque: sube un PDF y todos lo pueden leer aquí.')}
    <div class="btn-row"><button class="btn primary" data-act="lb-new">${icon('upload', 'sm')}Subir un libro</button></div>
    ${all.length > 3 ? `<div class="field" style="margin-top:12px"><input class="input" id="lbQ" type="search" placeholder="Buscar por título o autor" value="${esc(LBK.q)}" aria-label="Buscar libros"></div>` : ''}
    ${cats.length > 1 ? `<div class="seg" role="group" style="margin:8px 0">${['all', ...cats].map((c) => `<button type="button" data-act="lb-cat" data-v="${esc(c)}" aria-pressed="${LBK.cat === c}">${c === 'all' ? 'Todos' : esc(c)}</button>`).join('')}</div>` : ''}
    ${list.length ? `<ul class="lb-shelf">${shelf}</ul>` : `<div class="empty"><p><b>${all.length ? 'Nada coincide con tu búsqueda.' : 'La estantería está vacía.'}</b></p><p class="small faint">${all.length ? '' : 'Sube el primer libro: un PDF de hasta 2 MB. Todos los integrantes del Bosque lo verán.'}</p></div>`}
    <p class="tiny faint" style="margin-top:14px">Comparte solo libros y materiales que tengas permiso de compartir.</p>`;
}
GROUP_VIEWS.libros = viewLibros; GROUP_NAV.libros = 'mas';

function lbFormHTML(b) {
  const isNew = !b;
  return `${sheetHead(isNew ? 'Subir un libro' : 'Editar libro')}<div class="sheet-body">
    ${isNew ? `<div class="field"><label for="lbFile">Archivo PDF (máximo 2 MB)</label><input id="lbFile" type="file" accept="application/pdf" class="input"></div>` : ''}
    <div class="field"><label for="lbTitle">Título</label><input id="lbTitle" class="input" maxlength="120" value="${esc(b?.title || '')}" placeholder="Ej. Álgebra de Baldor"></div>
    <div class="field"><label for="lbAuthor">Autor (opcional)</label><input id="lbAuthor" class="input" maxlength="120" value="${esc(b?.author || '')}"></div>
    <div class="field"><label for="lbCat">Categoría</label><select id="lbCat" class="input">${LB_CATS.map((c) => `<option ${((b?.cat || 'Libro') === c) ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
    <div class="field"><label for="lbDesc">De qué trata (opcional)</label><textarea id="lbDesc" class="input" rows="3" maxlength="600">${esc(b?.desc || '')}</textarea></div>
    <div class="btn-row"><button class="btn primary" data-act="lb-save" ${b ? `data-id="${b.id}"` : ''}>${isNew ? 'Subir al Bosque' : 'Guardar'}</button>${b ? `<button class="btn danger" data-act="lb-del" data-id="${b.id}">Quitar libro</button>` : ''}</div></div>`;
}

/* ---------- lector ---------- */
function lbReaderEl() {
  let r = document.getElementById('lbReader');
  if (!r) { r = document.createElement('div'); r.id = 'lbReader'; r.className = 'lb-reader'; r.setAttribute('role', 'dialog'); r.setAttribute('aria-modal', 'true'); r.hidden = true; document.body.appendChild(r); }
  return r;
}
async function lbRender() {
  const r = lbReaderEl(); const cv = r.querySelector('canvas'); if (!cv || !LBK.doc) return;
  const my = ++LBK.tok; const n = Math.max(1, Math.min(LBK.doc.numPages, LBK.page)); LBK.page = n;
  r.querySelector('.lb-pg').textContent = `${n} / ${LBK.doc.numPages}`;
  r.querySelector('[data-act="lb-prev"]').disabled = n <= 1; r.querySelector('[data-act="lb-next"]').disabled = n >= LBK.doc.numPages;
  const rng = r.querySelector('.lb-range'); if (rng) { rng.max = LBK.doc.numPages; rng.value = n; }
  lbSetPos(LBK.id, n);
  const pg = await LBK.doc.getPage(n); if (my !== LBK.tok) return;
  const box = r.querySelector('.lb-stage'); const cw = Math.max(240, box.clientWidth - 16), ch = Math.max(240, box.clientHeight - 16);
  const v1 = pg.getViewport({ scale: 1 }); const sc = Math.min(cw / v1.width, ch / v1.height) * (LBK.zoom || 1);
  const dpr = Math.min(2, window.devicePixelRatio || 1); const vp = pg.getViewport({ scale: sc * dpr });
  const off = document.createElement('canvas'); off.width = Math.floor(vp.width); off.height = Math.floor(vp.height);
  await pg.render({ canvasContext: off.getContext('2d'), viewport: vp }).promise; if (my !== LBK.tok) return;
  cv.width = off.width; cv.height = off.height; cv.style.width = Math.floor(vp.width / dpr) + 'px'; cv.style.height = Math.floor(vp.height / dpr) + 'px';
  cv.getContext('2d').drawImage(off, 0, 0);
  r.querySelector('.lb-load').hidden = true;
}
LBK.tok = 0; LBK.zoom = 1;
function lbClose() { const r = lbReaderEl(); r.hidden = true; r.innerHTML = ''; document.body.classList.remove('lb-noscroll'); try { LBK.doc && LBK.doc.destroy && LBK.doc.destroy(); } catch { /* */ } LBK.doc = null; LBK.tok++; document.removeEventListener('keydown', lbKey); }
function lbKey(e) {
  if (e.key === 'Escape') lbClose(); else if (e.key === 'ArrowRight' || e.key === 'PageDown') { LBK.page++; lbRender(); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { LBK.page--; lbRender(); }
}
async function lbOpen(id) {
  const b = gGet(id); if (!b || LBK.busy) return; LBK.busy = true;
  const r = lbReaderEl();
  r.innerHTML = `<div class="lb-bar-top"><button class="icon-btn" data-act="lb-close" aria-label="Cerrar libro">${icon('x')}</button><span class="lb-title"><b>${esc(b.title)}</b><span class="tiny">${esc(b.author || '')}</span></span>
    <button class="icon-btn" data-act="lb-zoom" data-v="-1" aria-label="Alejar">−</button><button class="icon-btn" data-act="lb-zoom" data-v="1" aria-label="Acercar">+</button><button class="icon-btn" data-act="lb-save-file" data-id="${b.id}" aria-label="Guardar PDF">${icon('save')}</button></div>
    <div class="lb-stage"><canvas aria-label="Página del libro"></canvas><p class="lb-load">Abriendo el libro…</p></div>
    <div class="lb-foot"><button class="btn" data-act="lb-prev" aria-label="Página anterior">‹</button><input class="lb-range" type="range" min="1" max="1" value="1" aria-label="Ir a la página"><span class="lb-pg">–</span><button class="btn" data-act="lb-next" aria-label="Página siguiente">›</button></div>`;
  r.hidden = false; document.body.classList.add('lb-noscroll'); document.addEventListener('keydown', lbKey); LBK.zoom = 1; LBK.id = id;
  try {
    const d = await loadGImg(curFid(), b.fileId);
    if (!d) throw new Error(navigator.onLine ? 'No se pudo abrir el libro.' : 'Este libro aún no está en tu teléfono. Ábrelo una vez con internet.');
    LBK.doc = await lbOpenPdf(d); LBK.page = Math.min(lbGetPos(id), LBK.doc.numPages); await lbRender();
    let sx = null; const st = r.querySelector('.lb-stage');
    st.addEventListener('touchstart', (e) => { sx = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    st.addEventListener('touchend', (e) => { if (sx === null || LBK.zoom > 1) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) { LBK.page += dx < 0 ? 1 : -1; lbRender(); } sx = null; }, { passive: true });
    r.querySelector('.lb-range').addEventListener('input', (e) => { LBK.page = +e.target.value; lbRender(); });
  } catch (e) { lbClose(); toast(e.message || 'No se pudo abrir el libro.'); } finally { LBK.busy = false; }
}

Object.assign(VIDA_ACTS, {
  'lb-new': () => openSheet(lbFormHTML(null)),
  'lb-cat': (el) => { LBK.cat = el.dataset.v; render(); },
  'lb-open': (el) => lbOpen(el.dataset.id),
  'lb-close': () => lbClose(),
  'lb-prev': () => { LBK.page--; lbRender(); }, 'lb-next': () => { LBK.page++; lbRender(); },
  'lb-zoom': (el) => { LBK.zoom = Math.max(1, Math.min(3, LBK.zoom + (+el.dataset.v) * 0.5)); const st = document.querySelector('#lbReader .lb-stage'); if (st) st.classList.toggle('zoomed', LBK.zoom > 1); lbRender(); },
  'lb-save-file': async (el) => { const b = gGet(el.dataset.id); const d = b && await loadGImg(curFid(), b.fileId); if (!d) return; const u = URL.createObjectURL(dataURLtoBlob(d)); const a = document.createElement('a'); a.href = u; a.download = (b.title || 'libro').replace(/[^\w\- áéíóúñ]/gi, '') + '.pdf'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000); },
  'lb-edit': (el) => { const b = gGet(el.dataset.id); if (b) openSheet(lbFormHTML(b)); },
  'lb-save': async (el) => {
    const v = (id) => (document.getElementById(id)?.value || '').trim();
    const old = el.dataset.id ? gGet(el.dataset.id) : null;
    if (old) { gput({ ...old, title: v('lbTitle') || old.title, author: v('lbAuthor'), cat: v('lbCat'), desc: v('lbDesc') }); closeSheet(false); toast('Libro actualizado.'); return; }
    const f = document.getElementById('lbFile')?.files?.[0]; if (!f) { toast('Elige un PDF.'); return; }
    if (!(f.type === 'application/pdf' || /\.pdf$/i.test(f.name))) { toast('Solo se aceptan archivos PDF.'); return; }
    if (f.size > 2 * 1048576) { toast('El PDF pesa más de 2 MB. Comprímelo o divídelo en partes.'); return; }
    el.disabled = true; el.textContent = 'Preparando…';
    try {
      const data = await readFileData(f); let pages = 0; window.__lbe = null;
      try { const d = await lbOpenPdf(data); pages = d.numPages; try { d.destroy && d.destroy(); } catch { /* */ } } catch (er) { window.__lbe = String(er && er.stack || er); throw new Error('Ese PDF no se puede leer. Prueba con otro.'); }
      const fileId = 'bk' + uid();
      await cloudFetch('POST', { kind: 'gimg', as: REG.me, forest: curFid(), id: fileId, data });
      gImgCache.set(fileId, data); DB.put('files', 'gi:' + fileId, data).catch(() => {});
      const title = v('lbTitle') || f.name.replace(/\.pdf$/i, '');
      gput({ id: 'b' + uid(), type: 'book', byId: REG.me, title, author: v('lbAuthor'), cat: v('lbCat'), desc: v('lbDesc'), fileId, pages, size: f.size, color: LB_COLORS[lbHash(title) % LB_COLORS.length], at: Date.now() });
      closeSheet(false); toast('Libro en la estantería. Todo el Bosque ya lo puede leer.'); Snd.drop && Snd.drop();
    } catch (e) { el.disabled = false; el.textContent = 'Subir al Bosque'; toast(e.message || 'No se pudo subir el libro.'); }
  },
  'lb-del': async (el) => { const b = gGet(el.dataset.id); if (!b) return; const ok = await ask({ title: '¿Quitar este libro?', text: 'Deja de verse en la estantería de todo el Bosque.', ok: 'Quitar', danger: true }); if (!ok) return; closeSheet(false); gput({ ...b, deleted: true }); },
});
document.addEventListener('input', (e) => { if (e.target && e.target.id === 'lbQ') { LBK.q = e.target.value; const p = e.target.selectionStart; render(); const q = document.getElementById('lbQ'); if (q) { q.focus(); try { q.setSelectionRange(p, p); } catch { /* */ } } } });
