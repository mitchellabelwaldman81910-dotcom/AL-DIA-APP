/* Cinnavia 7.14 — Pizarrón del Bosque (espacio de trabajo efímero y compartido).
   Un lienzo rápido dentro del grupo para soltar notas, enlaces, borradores y PDFs sin abrir otra app.
   Todo el grupo lo ve y lo mueve en vivo; funciona sin internet (se envía solo al volver).
   Al terminar el proyecto, el pizarrón se archiva y se puede exportar a los apuntes de cada quien. */
'use strict';

const PZ = { mode: 'lienzo', view: null, drag: null, tone: 'papel' };
const PZ_TONES = { papel: 'Papel', salvia: 'Salvia', cielo: 'Cielo', rosa: 'Rosa', miel: 'Miel' };
const PZ_KIND = { note: 'Nota', link: 'Enlace', draft: 'Borrador', file: 'Archivo' };
const pzMetaId = () => `bm-${curFid()}`;
const pzMeta = () => gGet(pzMetaId()) || { id: pzMetaId(), type: 'board', kind: 'meta', epoch: 0, archives: [] };
const pzEpoch = () => +pzMeta().epoch || 0;
let pzItems = (ep = pzEpoch()) => gAll('board').filter((x) => x.kind !== 'meta' && (+x.ep || 0) === ep);
const fmtSize = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

function pzCardHTML(it, ro) {
  const tone = PZ_TONES[it.tone] ? it.tone : 'papel';
  let body = '';
  if (it.kind === 'link') { const u = safeURL(it.link || ''); let host = ''; try { host = new URL(u).hostname.replace(/^www\./, ''); } catch { /* */ } body = `<b class="pz-t">${esc(it.title || host || 'Enlace')}</b><span class="pz-url">${icon('link', 'sm')}${esc(host || it.link || '')}</span>${it.text ? `<p>${esc(it.text)}</p>` : ''}`; }
  else if (it.kind === 'file') body = `<span class="pz-file">${pzFileGlyph(it.file)}<span><b class="pz-t">${esc(it.title || it.file || 'Archivo')}</b><span class="tiny faint">${esc(/\.pdf$/i.test(it.file || '') ? 'PDF' : 'Imagen')}${it.size ? ` · ${fmtSize(it.size)}` : ''}</span></span></span>${it.text ? `<p>${esc(it.text)}</p>` : ''}`;
  else if (it.kind === 'draft') body = `<b class="pz-t">${esc(it.title || 'Borrador')}</b><p class="pz-clip">${esc(it.text || '')}</p>`;
  else body = `<p>${linkify(it.text || '')}</p>`;
  const pos = PZ.mode === 'lienzo' ? ` style="left:${(it.x || 0) * 100}%;top:${Math.round((it.y || 0) * 620)}px"` : '';
  return `<article class="pz-card t-${tone} k-${it.kind}" data-pz="${it.id}"${pos} ${ro ? '' : 'tabindex="0"'}>
    <span class="pz-kind">${PZ_KIND[it.kind] || 'Nota'}</span>${body}
    <span class="pz-foot">${mini(it.by, 'xs')}<span>${esc(it.by || '')} · ${ago(it.u || it.at)}</span></span></article>`;
}
function pzFileGlyph(name) { const pdf = /\.pdf$/i.test(name || ''); return `<svg class="pz-fg" viewBox="0 0 32 40" aria-hidden="true"><path d="M4 2h17l7 7v29H4z"/><path d="M21 2v7h7"/>${pdf ? '<path d="M9 28h14M9 23h14M9 18h8"/>' : '<circle cx="13" cy="18" r="3"/><path d="M6 33l7-8 5 5 4-4 6 7"/>'}</svg>`; }

function viewPizarron() {
  const f = forestMeta(); if (!f) return '<div class="empty"><h3>Este Bosque ya no está</h3></div>';
  const meta = pzMeta(); const ep = PZ.view != null ? PZ.view : pzEpoch(); const ro = PZ.view != null;
  const items = pzItems(ep).sort((a, b) => (a.y || 0) - (b.y || 0) || (a.at || 0) - (b.at || 0));
  const arch = (meta.archives || []).slice().reverse();
  const head = groupHead(ro ? `Pizarrón archivado` : 'Pizarrón', ro ? `Archivado ${esc(relDay(toISO(new Date((meta.archives || []).find((a) => a.ep === ep)?.at || Date.now()))))}. Solo lectura.` : 'Suelta ideas, enlaces, borradores y PDFs. Todo el grupo lo ve y lo acomoda al instante.');
  const tools = ro ? `<div class="btn-row pz-tools"><button class="btn" data-act="pz-back">${icon('back')}Volver al pizarrón actual</button><button class="btn primary" data-act="pz-export" data-ep="${ep}">${icon('note')}Exportar a mis apuntes</button></div>`
    : `<div class="pz-tools"><div class="pz-add">${[['note', 'Nota', 'note'], ['link', 'Enlace', 'link'], ['draft', 'Borrador', 'edit'], ['file', 'PDF o foto', 'upload']].map(([k, l, ic]) => `<button type="button" class="btn" data-act="pz-new" data-k="${k}">${icon(ic, 'sm')}${l}</button>`).join('')}</div>
      <div class="seg" role="group" aria-label="Vista">${[['lienzo', 'Lienzo'], ['lista', 'Lista']].map(([k, l]) => `<button type="button" data-act="pz-mode" data-v="${k}" aria-pressed="${PZ.mode === k}">${l}</button>`).join('')}</div></div>`;
  const board = items.length
    ? (PZ.mode === 'lienzo' ? `<div class="pz-board" id="pzBoard" style="--rows:${Math.max(6, Math.ceil(Math.max(...items.map((i) => (i.y || 0))) * 10) + 3)}">${items.map((i) => pzCardHTML(i, ro)).join('')}</div>` : `<div class="pz-list">${items.map((i) => pzCardHTML(i, ro)).join('')}</div>`)
    : `<div class="pz-empty"><svg viewBox="0 0 120 80" aria-hidden="true"><rect x="8" y="8" width="104" height="64" rx="6"/><path d="M22 24h30M22 32h22M70 22l20 6-6 20-20-6z M30 50h40"/></svg><h3>El pizarrón está en blanco</h3><p>Pega un enlace, escribe una idea o sube el PDF de las instrucciones. Lo que pongas aquí lo ve todo el Bosque, aunque estés sin internet.</p></div>`;
  const foot = ro ? '' : `<div class="pz-end"><button class="btn" data-act="pz-export" data-ep="${ep}" ${items.length ? '' : 'disabled'}>${icon('note', 'sm')}Exportar a mis apuntes</button><button class="btn" data-act="pz-archive" ${items.length ? '' : 'disabled'}>${icon('save', 'sm')}Terminar y archivar</button></div>
    <p class="small muted pz-help">Mueve las tarjetas arrastrándolas. Toca una para editarla. Al terminar el proyecto, archiva el pizarrón: queda guardado y empiezan uno limpio.</p>`;
  const archives = arch.length && !ro ? `<h2 class="sec">Pizarrones archivados <small>${arch.length}</small></h2><ul class="rows">${arch.map((a) => `<li><button type="button" class="rowbtn" data-act="pz-view" data-ep="${a.ep}"><span class="ico">${icon('save')}</span><span class="txt"><b>${esc(a.title || 'Pizarrón')}</b><span>${plural(a.n || 0, 'elemento', 'elementos')} · ${esc(relDay(toISO(new Date(a.at))))} · ${esc(a.by || '')}</span></span>${icon('chev', 'chev')}</button></li>`).join('')}</ul>` : '';
  return `${head}${tools}${board}${foot}${archives}`;
}

/* ---------- Crear y editar ---------- */
/* lugar libre para una tarjeta nueva: debajo de la columna que termine más arriba */
function pzSpot() {
  const board = document.getElementById('pzBoard'); const cols = [0.02, 0.52]; const bottom = [0.02, 0.02];
  if (board) {
    const W = board.clientWidth || 1;
    for (const c of board.querySelectorAll('.pz-card')) { const i = c.offsetLeft / W < 0.35 ? 0 : 1; bottom[i] = Math.max(bottom[i], (c.offsetTop + c.offsetHeight) / 620 + 0.025); }
  } else {
    pzItems().forEach((it, k) => { const i = (it.x || 0) < 0.35 ? 0 : 1; bottom[i] = Math.max(bottom[i], (it.y || 0) + 0.3); });
  }
  const i = bottom[0] <= bottom[1] ? 0 : 1;
  return { x: cols[i] + Math.random() * 0.02, y: Math.min(11.5, bottom[i]) };
}
function pzSheet(it) {
  const k = it.kind; const isNew = !gGet(it.id);
  PZ.tone = it.tone || PZ.tone || 'papel';
  const fields = k === 'link'
    ? `<div class="field"><label for="pzLink">Enlace</label><input id="pzLink" class="input" inputmode="url" placeholder="https://…" value="${esc(it.link || '')}" autocomplete="off"></div><div class="field"><label for="pzTitle">Título (opcional)</label><input id="pzTitle" class="input" value="${esc(it.title || '')}" autocomplete="off"></div><div class="field"><label for="pzText">Nota (opcional)</label><textarea id="pzText" class="input" rows="2">${esc(it.text || '')}</textarea></div>`
    : k === 'file'
      ? (isNew ? `<div class="field"><label for="pzFile">PDF o foto (máximo 2 MB)</label><input id="pzFile" type="file" accept="application/pdf,image/*" class="input"></div>` : `<button class="btn block" data-act="pz-open" data-id="${it.id}">${pzFileGlyph(it.file)}Abrir ${esc(it.file || 'archivo')}</button>`)
        + `<div class="field"><label for="pzTitle">Nombre</label><input id="pzTitle" class="input" value="${esc(it.title || '')}" autocomplete="off" placeholder="Ej. Instrucciones del proyecto"></div><div class="field"><label for="pzText">Nota (opcional)</label><textarea id="pzText" class="input" rows="2">${esc(it.text || '')}</textarea></div>`
      : k === 'draft'
        ? `<div class="field"><label for="pzTitle">Título</label><input id="pzTitle" class="input" value="${esc(it.title || '')}" autocomplete="off" placeholder="Ej. Introducción del ensayo"></div><div class="field"><label for="pzText">Borrador</label><textarea id="pzText" class="input" rows="9" placeholder="Escriban aquí entre todos…">${esc(it.text || '')}</textarea></div>`
        : `<div class="field"><label for="pzText" class="sr">Nota</label><textarea id="pzText" class="input" rows="4" placeholder="Una idea, un dato, una pregunta…">${esc(it.text || '')}</textarea></div>`;
  openSheet(`${sheetHead(isNew ? `Nuevo: ${PZ_KIND[k].toLowerCase()}` : PZ_KIND[k])}<div class="sheet-body">${fields}
    <div class="field"><span class="lbl">Color</span><div class="pz-tones" role="group">${Object.entries(PZ_TONES).map(([t, l]) => `<button type="button" class="pz-tone t-${t}" data-act="pz-tone" data-v="${t}" aria-pressed="${PZ.tone === t}" aria-label="${l}"></button>`).join('')}</div></div>
    ${!isNew ? `<p class="small muted" style="margin:6px 0 0">Última edición: ${esc(it.by || '')}, ${ago(it.u || it.at)}.</p>` : ''}</div>
    <div class="sheet-foot">${isNew ? '<button class="btn" data-act="sheet-close">Cancelar</button>' : `<button class="btn danger" data-act="pz-del" data-id="${it.id}">${icon('trash', 'sm')}Quitar</button>${k !== 'file' ? `<button class="btn" data-act="pz-copy" data-id="${it.id}">${icon('note', 'sm')}A mis apuntes</button>` : ''}`}<span class="grow"></span><button class="btn primary" data-act="pz-save" data-id="${it.id}" data-k="${k}">${isNew ? 'Poner en el pizarrón' : 'Guardar'}</button></div>`);
  PZ.editing = it;
  setTimeout(() => (document.getElementById(k === 'link' ? 'pzLink' : k === 'file' ? 'pzFile' : 'pzText'))?.focus(), 80);
}
function readFileData(file) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(new Error('No se pudo leer el archivo')); r.readAsDataURL(file); });
}
function dataURLtoBlob(d) { const [h, b] = d.split(','); const m = /data:([^;]+)/.exec(h)[1]; const bin = atob(b); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: m }); }

function pzToNoteText(items) {
  const by = (k) => items.filter((i) => i.kind === k);
  const out = [];
  const notes = by('note'); if (notes.length) out.push('Ideas y notas', ...notes.map((n) => `• ${n.text}${n.by ? ` (${n.by})` : ''}`), '');
  const links = by('link'); if (links.length) out.push('Enlaces', ...links.map((l) => `• ${l.title ? l.title + ': ' : ''}${l.link}${l.text ? ` — ${l.text}` : ''}`), '');
  for (const d of by('draft')) out.push(d.title || 'Borrador', d.text || '', '');
  const files = by('file'); if (files.length) out.push('Archivos en el pizarrón', ...files.map((f) => `• ${f.title || f.file}${f.text ? ` — ${f.text}` : ''}`), '');
  return out.join('\n').trim();
}
function pzExportNote(items, title) {
  const note = { id: uid(), title, body: pzToNoteText(items), subjectId: null, photos: [], updated: Date.now(), created: Date.now() };
  commit((s) => { s.notes.push(note); });
  return note;
}

Object.assign(VIDA_ACTS, {
  'pz-mode': (el) => { PZ.mode = el.dataset.v; try { localStorage.setItem('aldia:pzmode', PZ.mode); } catch { /* */ } render(); },
  'pz-new': (el) => {
    const k = el.dataset.k;
    if (k === 'file' && !navigator.onLine) { toast('Para subir archivos necesitas internet. Las notas, enlaces y borradores sí funcionan sin conexión.'); return; }
    pzSheet({ id: 'pz' + uid(), type: 'board', kind: k, ep: pzEpoch(), tone: PZ.tone, ...pzSpot() });
  },
  'pz-tone': (el) => { PZ.tone = el.dataset.v; document.querySelectorAll('.pz-tone').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === PZ.tone)); },
  'pz-save': async (el) => {
    const it = { ...(gGet(el.dataset.id) || PZ.editing) }; if (!it || !it.id) return;
    const v = (id) => (document.getElementById(id)?.value || '').trim();
    it.tone = PZ.tone; it.text = v('pzText');
    if (it.kind === 'link') { const u = safeURL(v('pzLink')) || safeURL('https://' + v('pzLink')); if (!u) { toast('Escribe un enlace válido.'); return; } it.link = u; it.title = v('pzTitle'); }
    if (it.kind === 'draft' || it.kind === 'file') it.title = v('pzTitle');
    if (it.kind === 'note' && !it.text) { toast('Escribe algo en la nota.'); return; }
    if (it.kind === 'draft' && !it.text && !it.title) { toast('Escribe el borrador.'); return; }
    if (it.kind === 'file' && !gGet(it.id)) {
      const f = document.getElementById('pzFile')?.files?.[0]; if (!f) { toast('Elige un PDF o una foto.'); return; }
      const pdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
      if (!pdf && !/^image\//.test(f.type)) { toast('Solo PDFs o fotos.'); return; }
      if (pdf && f.size > 2 * 1048576) { toast('El PDF pesa más de 2 MB. Comprímelo o comparte un enlace.'); return; }
      el.disabled = true; el.textContent = 'Subiendo…';
      try {
        const data = pdf ? await readFileData(f) : await fileToDataURL(f);
        const fileId = 'f' + uid();
        await cloudFetch('POST', { kind: 'gimg', as: REG.me, forest: curFid(), id: fileId, data });
        gImgCache.set(fileId, data); DB.put('files', 'gi:' + fileId, data).catch(() => {});
        Object.assign(it, { fileId, file: pdf ? f.name : f.name.replace(/\.[^.]+$/, '') + '.jpg', size: pdf ? f.size : Math.round(data.length * 0.75), title: it.title || f.name.replace(/\.[^.]+$/, '') });
      } catch (e) { el.disabled = false; el.textContent = 'Poner en el pizarrón'; toast(e.message || 'No se pudo subir.'); return; }
    }
    closeSheet(false); gput(it); Snd.drop();
  },
  'pz-del': async (el) => { const it = gGet(el.dataset.id); if (!it) return; const ok = await ask({ title: '¿Quitar del pizarrón?', text: 'Desaparece para todo el grupo. Queda en la copia diaria del Bosque por si se necesita.', ok: 'Quitar', danger: true }); if (!ok) return; closeSheet(false); gput({ ...it, deleted: true }); },
  'pz-copy': (el) => { const it = gGet(el.dataset.id); if (!it) return; pzExportNote([it], it.title || `Del pizarrón de ${forestMeta()?.name || 'mi Bosque'}`); closeSheet(false); toast('Se guardó en tus apuntes.'); },
  'pz-open': async (el) => {
    const it = gGet(el.dataset.id); if (!it) return;
    const w = /iPhone|iPad|iPod/.test(navigator.userAgent) ? null : window.open('', '_blank');
    const d = await loadGImg(curFid(), it.fileId);
    if (!d) { if (w) w.close(); toast(navigator.onLine ? 'No se pudo abrir el archivo.' : 'Este archivo aún no se guardó en tu teléfono. Ábrelo una vez con internet.'); return; }
    const url = URL.createObjectURL(dataURLtoBlob(d));
    if (w) w.location.href = url; else { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; if (/\.pdf$/i.test(it.file || '')) a.download = it.file; document.body.appendChild(a); a.click(); a.remove(); }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  },
  'pz-export': (el) => {
    const ep = +el.dataset.ep; const items = pzItems(ep); if (!items.length) return;
    const a = (pzMeta().archives || []).find((x) => x.ep === ep);
    const n = pzExportNote(items, `${a?.title || 'Pizarrón'} · ${forestMeta()?.name || 'Bosque'} · ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`);
    toast('El pizarrón quedó en tus apuntes.', { action: 'Ver', onAction: () => { REG.current = REG.me; saveReg(); switchProfile(REG.me); setTimeout(() => openNote(n.id), 400); } });
  },
  'pz-archive': async () => {
    const items = pzItems(); if (!items.length) return;
    const title = await ask({ title: 'Terminar y archivar', text: 'El pizarrón actual se guarda en la lista de archivados (todos lo pueden consultar) y empiezan uno limpio. Ponle un nombre:', input: { placeholder: 'Ej. Proyecto de mercadotecnia', value: '' }, ok: 'Archivar' });
    if (title === null) return;
    const exp = await ask({ title: '¿También a tus apuntes?', text: 'Puedes guardar una copia en tus apuntes personales para tenerla siempre a la mano.', ok: 'Sí, exportar', cancel: 'Ahora no' });
    const meta = { ...pzMeta() }; const ep = +meta.epoch || 0;
    meta.archives = [...(meta.archives || []), { ep, at: Date.now(), by: me(), n: items.length, title: String(title || 'Pizarrón').slice(0, 60) }].slice(-40);
    meta.epoch = ep + 1; meta.text = ''; meta.kind = 'meta'; meta.type = 'board';
    if (exp) pzExportNote(items, `${title || 'Pizarrón'} · ${forestMeta()?.name || 'Bosque'}`);
    gput(meta); Snd.chime(); toast(exp ? 'Pizarrón archivado y guardado en tus apuntes.' : 'Pizarrón archivado. Ya tienen uno limpio.');
  },
  'pz-view': (el) => { PZ.view = +el.dataset.ep; render(); window.scrollTo(0, 0); },
  'pz-back': () => { PZ.view = null; render(); },
});
try { PZ.mode = localStorage.getItem('aldia:pzmode') || 'lienzo'; } catch { /* */ }

/* ---------- Arrastrar tarjetas en el lienzo (y tocar para abrir) ---------- */
document.addEventListener('pointerdown', (e) => {
  const c = e.target.closest('.pz-card'); if (!c || PZ.view != null) return;
  const board = c.closest('.pz-board');
  const it = gGet(c.dataset.pz); if (!it) return;
  PZ.drag = { c, board, it, x0: e.clientX, y0: e.clientY, moved: false, id: e.pointerId, l: c.offsetLeft, t: c.offsetTop };
});
document.addEventListener('pointermove', (e) => {
  const d = PZ.drag; if (!d || e.pointerId !== d.id || !d.board) return;
  const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
  if (!d.moved && Math.hypot(dx, dy) < 7) return;
  if (!d.moved) { d.moved = true; d.c.classList.add('dragging'); try { d.c.setPointerCapture(e.pointerId); } catch { /* */ } }
  e.preventDefault();
  const W = d.board.clientWidth, H = d.board.clientHeight;
  const l = Math.max(0, Math.min(W - d.c.offsetWidth, d.l + dx)), t = Math.max(0, Math.min(H - 30, d.t + dy));
  d.c.style.left = `${(l / W) * 100}%`; d.c.style.top = `${t}px`;
  d.nx = l / W; d.ny = t / 620;
  if (t > H - d.c.offsetHeight - 10) d.board.style.setProperty('--rows', +getComputedStyle(d.board).getPropertyValue('--rows') + 1);
}, { passive: false });
const pzUp = (e) => {
  const d = PZ.drag; if (!d || e.pointerId !== d.id) return; PZ.drag = null;
  if (d.moved) {
    d.c.classList.remove('dragging');
    // "y" se guarda en unidades del lienzo (620 px = 1), así no cambia cuando el lienzo crece
    gput({ ...d.it, x: Math.round((d.nx || 0) * 1000) / 1000, y: Math.round((d.ny || 0) * 1000) / 1000 });
    if (typeof staleCheck === 'function') staleCheck();
  } else if (e.type === 'pointerup') pzSheet(d.it);
};
document.addEventListener('pointerup', pzUp);
document.addEventListener('pointercancel', pzUp);
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.classList?.contains('pz-card')) { const it = gGet(e.target.dataset.pz); if (it) pzSheet(it); } });
{
  const baseSoft = softRender;
  softRender = function () { if (PZ.drag) { CLOUD.stale = true; return false; } return baseSoft(); };
}
