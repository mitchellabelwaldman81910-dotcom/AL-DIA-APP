/* Cinnavia 7.40 — Pintura en los pizarrones.
   · «Pintar» sobre todo el pizarrón (Mi pizarrón y el del Bosque): lápiz, marcador y borrador, colores, grosor, deshacer.
   · «Hoja de pintura»: una hoja aparte para dibujar o hacer esquemas (fondos liso, cuadrícula, rayas, puntos u oscuro).
   Los trazos son vectores pequeños: se guardan en tu cuenta y, en el Bosque, todo el grupo los ve. */
'use strict';
const PT = { tool: 'pen', color: 'a', w: 5 };
const PT_COLORS = ['a', '#E04A3B', '#F08A24', '#E9B44C', '#4CAF6A', '#2A9D8F', '#3B82F6', '#7C5CE0', '#D6619A', '#8B5E3C', '#FFFFFF'];
const PT_SIZES = [['Fino', 2], ['Medio', 5], ['Grueso', 11]];
const PT_BGS = { liso: 'Liso', cuadricula: 'Cuadrícula', rayas: 'Rayas', puntos: 'Puntos', oscuro: 'Oscuro' };
let PT_N = 0;

/* ---------- trazos → dibujo ---------- */
function ptPath(p) {
  const n = p.length / 2; if (n < 2) return `M${p[0]} ${p[1]}h.1`;
  let d = `M${p[0]} ${p[1]}`;
  for (let i = 1; i < n - 1; i++) { const x = p[2 * i], y = p[2 * i + 1], nx = p[2 * i + 2], ny = p[2 * i + 3]; d += `Q${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`; }
  return d + `L${p[2 * n - 2]} ${p[2 * n - 1]}`;
}
const ptInk = (c, dark) => (c === 'a' ? (dark ? '#F2EFE8' : '#2B2B2B') : c);
const ptThemeDark = () => { const r = document.documentElement.dataset.theme; return r === 'dark' || (r !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches); };
function ptDrawAll(ctx, strokes, scale, ox, oy, dpr, dark, extra) {
  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy); ctx.lineJoin = 'round';
  for (const s of strokes.concat(extra ? [extra] : [])) {
    if (s.del || !s.p || s.p.length < 2) continue;
    ctx.globalAlpha = s.a || 1; ctx.strokeStyle = ptInk(s.c, dark); ctx.lineWidth = s.w || 4; ctx.lineCap = s.k === 'm' ? 'butt' : 'round';
    ctx.stroke(new Path2D(ptPath(s.p)));
  }
  ctx.globalAlpha = 1;
}
function ptBgSVG(bg, w, h, id) {
  const dark = bg === 'oscuro', base = dark ? '#1F2A2E' : '#FFFDF6', ln = dark ? 'rgba(255,255,255,.1)' : 'rgba(60,70,60,.16)';
  let pat = '';
  if (bg === 'cuadricula') pat = `<pattern id="${id}" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${ln}" stroke-width="1"/></pattern>`;
  else if (bg === 'rayas') pat = `<pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 39.5H40" fill="none" stroke="${ln}" stroke-width="1"/></pattern>`;
  else if (bg === 'puntos') pat = `<pattern id="${id}" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r="1.4" fill="${ln}"/></pattern>`;
  return `${pat ? `<defs>${pat}</defs>` : ''}<rect width="${w}" height="${h}" fill="${base}"/>${pat ? `<rect width="${w}" height="${h}" fill="url(#${id})"/>` : ''}`;
}
function ptSVG(strokes, w, h, bg) {
  const id = `ptb${++PT_N}`; const dark = bg === 'oscuro';
  const paths = (strokes || []).filter((s) => !s.del && s.p && s.p.length >= 2).map((s) => `<path d="${ptPath(s.p)}" fill="none" stroke="${esc(ptInk(s.c, dark))}" stroke-width="${+s.w || 4}" stroke-linecap="${s.k === 'm' ? 'butt' : 'round'}" stroke-linejoin="round" opacity="${s.a || 1}"/>`).join('');
  return `<svg class="pt-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" aria-label="Hoja de pintura" role="img">${ptBgSVG(bg || 'liso', w, h, id)}${paths}</svg>`;
}

/* ---------- barra de herramientas (la misma en todos lados) ---------- */
function ptBarHTML(opt = {}) {
  const sw = PT_COLORS.map((c) => `<button type="button" class="pt-sw${c === 'a' ? ' auto' : ''}" data-pt="color" data-v="${c}" style="${c === 'a' ? '' : `background:${c}`}" aria-label="${c === 'a' ? 'Color automático' : `Color ${c}`}" aria-pressed="${PT.color === c}"></button>`).join('');
  return `<div class="pt-bar" role="toolbar" aria-label="Herramientas de pintura">
    <div class="pt-row"><div class="pt-seg" role="group" aria-label="Herramienta">${[['pen', 'Lápiz'], ['marker', 'Marcador'], ['eraser', 'Borrar']].map(([k, l]) => `<button type="button" data-pt="tool" data-v="${k}" aria-pressed="${PT.tool === k}">${l}</button>`).join('')}</div>
      <div class="pt-seg" role="group" aria-label="Grosor">${PT_SIZES.map(([l, n]) => `<button type="button" data-pt="size" data-v="${n}" aria-label="${l}" aria-pressed="${PT.w === n}"><i style="width:${Math.min(16, 4 + n)}px;height:${Math.min(16, 4 + n)}px"></i></button>`).join('')}</div>
      <div class="pt-seg"><button type="button" data-pt="undo" aria-label="Deshacer">↶</button><button type="button" data-pt="redo" aria-label="Rehacer">↷</button>${opt.clear && !opt.done ? '<button type="button" data-pt="clear" aria-label="Borrar todo">Limpiar</button>' : ''}</div></div>
    <div class="pt-row"><div class="pt-colors" role="group" aria-label="Colores">${sw}<label class="pt-sw custom" aria-label="Otro color"><input type="color" data-pt="custom" value="#3B82F6"></label></div>${opt.done ? '<button type="button" class="pt-done" data-pt="done">Listo</button>' : ''}</div></div>`;
}
function ptBarSync() {
  document.querySelectorAll('.pt-bar').forEach((bar) => {
    bar.querySelectorAll('[data-pt="tool"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === PT.tool));
    bar.querySelectorAll('[data-pt="size"]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.v === PT.w));
    bar.querySelectorAll('[data-pt="color"]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === PT.color));
  });
}
const PT_HOST = { cur: null }; /* el lugar donde se está pintando ahora (para deshacer/rehacer/limpiar) */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-pt]'); if (!b || b.dataset.pt === 'custom') return; const k = b.dataset.pt, v = b.dataset.v; const H = PT_HOST.cur;
  if (k === 'tool') { PT.tool = v; ptBarSync(); }
  else if (k === 'size') { PT.w = +v; if (PT.tool === 'eraser') PT.tool = 'pen'; ptBarSync(); }
  else if (k === 'color') { PT.color = v; if (PT.tool === 'eraser') PT.tool = 'pen'; ptBarSync(); }
  else if (k === 'undo') H && ptUndo(H); else if (k === 'redo') H && ptRedo(H);
  else if (k === 'clear') H && H.clear && H.clear();
  else if (k === 'done') H && H.done && H.done();
});
document.addEventListener('input', (e) => { if (e.target.dataset && e.target.dataset.pt === 'custom') { PT.color = e.target.value; if (PT.tool === 'eraser') PT.tool = 'pen'; ptBarSync(); } });
document.addEventListener('pointerdown', (e) => { if (e.target.closest('.pt-bar [data-pt]')) e.stopPropagation(); }, true);

/* ---------- el controlador de dibujo ---------- */
function ptUndo(H) {
  const a = H.stack.pop(); if (!a) return;
  if (a.t === 'add') { a.s.del = 1; a.s.u = Date.now(); } else for (const s of a.list) { s.del = 0; s.u = Date.now(); }
  H.redo.push(a); H.changed(); H.redraw();
}
function ptRedo(H) {
  const a = H.redo.pop(); if (!a) return;
  if (a.t === 'add') { a.s.del = 0; a.s.u = Date.now(); } else for (const s of a.list) { s.del = 1; s.u = Date.now(); }
  H.stack.push(a); H.changed(); H.redraw();
}
function ptAttach(canvas, H) {
  let cur = null, pid = null, moves = 0;
  const cancel = () => { cur = null; pid = null; H.redraw(); };
  canvas.addEventListener('pointerdown', (e) => {
    if (!H.active()) return; if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (pid !== null) { cancel(); return; }
    pid = e.pointerId; try { canvas.setPointerCapture(pid); } catch { /* */ } e.preventDefault(); PT_HOST.cur = H; moves = 0;
    const p = H.pt(e);
    if (PT.tool === 'eraser') { cur = { erasing: true, list: [] }; H.erase(p.x, p.y, cur.list); return; }
    const mk = PT.tool === 'marker';
    cur = { id: 's' + uid(), c: PT.color, w: mk ? Math.round(PT.w * 2.4) : PT.w, a: mk ? 0.35 : 1, k: mk ? 'm' : 'p', p: [Math.round(p.x), Math.round(p.y)], u: Date.now() };
    H.live(cur);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerId !== pid || !cur) return; e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])) {
      const p = H.pt(ev); moves++;
      if (cur.erasing) { H.erase(p.x, p.y, cur.list); continue; }
      const n = cur.p.length, dx = p.x - cur.p[n - 2], dy = p.y - cur.p[n - 1], md = H.minD();
      if (dx * dx + dy * dy >= md * md && n < 3000) cur.p.push(Math.round(p.x), Math.round(p.y));
    }
    if (!cur.erasing) H.live(cur);
  }, { passive: false });
  const up = (e) => {
    if (e.pointerId !== pid) return; const s = cur; cur = null; pid = null; if (!s) return;
    if (s.erasing) { if (s.list.length) { H.stack.push({ t: 'del', list: s.list }); H.redo.length = 0; H.changed(); } H.redraw(); return; }
    if (s.p.length === 2) s.p.push(s.p[0], s.p[1]);
    H.add(s); H.stack.push({ t: 'add', s }); H.redo.length = 0; H.changed(); H.redraw();
  };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', (e) => { if (e.pointerId === pid) cancel(); });
}
const ptNear = (s, x, y, r) => { for (let i = 0; i < s.p.length; i += 2) { const dx = s.p[i] - x, dy = s.p[i + 1] - y; if (dx * dx + dy * dy <= r * r) return true; } return false; };

/* ---------- Hoja de pintura (editor a pantalla completa) ---------- */
function ptEditor(o) {
  /* o: { title, strokes, bg, w, h, canDelete, onSave(strokes,bg), onDelete() } */
  if (document.getElementById('ptEd')) return;
  const W = o.w || 800, Hh = o.h || 600; let bg = o.bg || 'liso';
  const strokes = JSON.parse(JSON.stringify(o.strokes || []));
  const wrap = document.createElement('div'); wrap.id = 'ptEd'; wrap.className = 'pt-ed'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-label', 'Hoja de pintura');
  wrap.innerHTML = `<div class="pt-top"><button type="button" class="btn" id="ptCancel">Cancelar</button><b>${esc(o.title || 'Hoja de pintura')}</b><button type="button" class="btn primary" id="ptSave">Listo</button></div>
    <div class="pt-stage" id="ptStage"><div class="pt-paper bg-${bg}" id="ptPaper" style="aspect-ratio:${W}/${Hh}"><canvas id="ptCv"></canvas></div></div>
    <div class="pt-dock">${ptBarHTML({ clear: true })}<div class="pt-row"><div class="pt-seg" role="group" aria-label="Fondo">${Object.entries(PT_BGS).map(([k, l]) => `<button type="button" data-ptbg="${k}" aria-pressed="${bg === k}">${l}</button>`).join('')}</div>${o.canDelete ? '<button type="button" class="btn danger" id="ptDel">Quitar hoja</button>' : ''}</div></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const cv = wrap.querySelector('#ptCv'), paper = wrap.querySelector('#ptPaper'), g = cv.getContext('2d'); let dirty = false;
  const dpr = Math.min(2, devicePixelRatio || 1);
  const fit = () => {
    const st = wrap.querySelector('#ptStage'); const ratio = W / Hh; let w = st.clientWidth - 8, h = w / ratio; if (h > st.clientHeight - 8) { h = st.clientHeight - 8; w = h * ratio; }
    paper.style.width = Math.max(120, w) + 'px'; paper.style.height = Math.max(90, h) + 'px'; cv.width = Math.round(paper.clientWidth * dpr); cv.height = Math.round(paper.clientHeight * dpr); redraw();
  };
  const sc = () => paper.clientWidth / W;
  const redraw = (extra) => { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); ptDrawAll(g, strokes, sc(), 0, 0, dpr, bg === 'oscuro', extra); };
  const H = {
    stack: [], redo: [], active: () => true, redraw: () => redraw(), changed: () => { dirty = true; },
    pt: (e) => { const r = cv.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * Hh }; },
    minD: () => 1.6, live: (s) => redraw(s), add: (s) => { strokes.push(s); },
    erase: (x, y, list) => { const r = Math.max(10, PT.w * 2.2); for (const s of strokes) if (!s.del && ptNear(s, x, y, r + (s.w || 4) / 2)) { s.del = 1; list.push(s); } redraw(); },
    clear: async () => { if (!strokes.some((s) => !s.del)) return; const ok = await ask({ title: '¿Borrar toda la hoja?', text: 'Puedes deshacerlo con la flecha de deshacer.', ok: 'Borrar todo', danger: true }); if (!ok) return; const list = strokes.filter((s) => !s.del); list.forEach((s) => { s.del = 1; }); H.stack.push({ t: 'del', list }); dirty = true; redraw(); },
  };
  PT_HOST.cur = H; ptAttach(cv, H); ptBarSync();
  const close = () => { removeEventListener('resize', fit); removeEventListener('keydown', onKey); wrap.remove(); if (!document.querySelector('.gl-stage')) document.body.classList.remove('gm-on'); PT_HOST.cur = null; };
  const save = () => { const live = strokes.filter((s) => !s.del); close(); o.onSave && o.onSave(live, bg); };
  const cancel = async () => { if (dirty) { const ok = await ask({ title: '¿Salir sin guardar?', text: 'Los trazos de esta sesión se perderán.', ok: 'Salir', cancel: 'Seguir pintando', danger: true }); if (!ok) return; } close(); };
  const onKey = (e) => { if (e.key === 'Escape') cancel(); else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? ptRedo(H) : ptUndo(H); } };
  wrap.querySelector('#ptSave').addEventListener('click', save); wrap.querySelector('#ptCancel').addEventListener('click', cancel);
  wrap.querySelector('#ptDel')?.addEventListener('click', async () => { const ok = await ask({ title: '¿Quitar esta hoja?', text: 'Desaparece del pizarrón.', ok: 'Quitar', danger: true }); if (!ok) return; close(); o.onDelete && o.onDelete(); });
  wrap.addEventListener('click', (e) => { const b = e.target.closest('[data-ptbg]'); if (!b) return; bg = b.dataset.ptbg; dirty = true; paper.className = `pt-paper bg-${bg}`; wrap.querySelectorAll('[data-ptbg]').forEach((x) => x.setAttribute('aria-pressed', x === b)); redraw(); });
  addEventListener('resize', fit); addEventListener('keydown', onKey); setTimeout(fit, 30); setTimeout(fit, 250);
}

/* =====================================================================
   Mi pizarrón (lienzo.js): capa de tinta sobre todo el lienzo + hojas
   ===================================================================== */
LZ_KINDS.pintura = 'Hoja de pintura';
const lzInkList = () => (lzData().ink ||= []);
function lzInkCanvas() { return document.getElementById('lzInk'); }
function lzInkDraw(extra) {
  const cv = lzInkCanvas(), v = document.getElementById('lzView'); if (!cv || !v) return;
  const dpr = Math.min(2, devicePixelRatio || 1), w = v.clientWidth, h = v.clientHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px'; }
  const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  const d = lzData().view; ptDrawAll(g, lzInkList(), d.z, d.x, d.y, dpr, ptThemeDark(), extra);
}
{
  const base = lzApplyView; lzApplyView = function () { base(); lzInkDraw(); };
  const lzPaintBase = lzPaint; lzPaint = function () { lzPaintBase(); lzInkDraw(); };
}
const LZH = {
  stack: [], redo: [], active: () => !!LZ.paint, redraw: () => lzInkDraw(), changed: () => lzTouch(),
  pt: (e) => lzPt(e), minD: () => 2 / lzData().view.z, live: (s) => lzInkDraw(s),
  add: (s) => { lzInkList().push(s); },
  erase: (x, y, list) => { const z = lzData().view.z, r = Math.max(10, PT.w * 2.2) / z; for (const s of lzInkList()) if (!s.del && ptNear(s, x, y, r + (s.w || 4) / 2)) { s.del = 1; s.u = Date.now(); list.push(s); } lzInkDraw(); },
  clear: async () => { const list = lzInkList().filter((s) => !s.del); if (!list.length) return; const ok = await ask({ title: '¿Borrar todo lo pintado?', text: 'Las tarjetas no se tocan. Puedes deshacerlo con la flecha.', ok: 'Borrar pintura', danger: true }); if (!ok) return; list.forEach((s) => { s.del = 1; s.u = Date.now(); }); LZH.stack.push({ t: 'del', list }); lzTouch(); lzInkDraw(); },
  done: () => lzPaintMode(false),
};
function lzPaintMode(on) {
  LZ.paint = on; const v = document.getElementById('lzView'); if (!v) return;
  let cv = lzInkCanvas(); if (!cv) { cv = document.createElement('canvas'); cv.id = 'lzInk'; cv.className = 'lz-ink'; v.appendChild(cv); ptAttach(cv, LZH); }
  cv.classList.toggle('paint', !!on); v.classList.toggle('painting', !!on);
  let bar = document.getElementById('lzPtBar'); if (bar) bar.remove();
  if (on) { PT_HOST.cur = LZH; bar = document.createElement('div'); bar.id = 'lzPtBar'; bar.className = 'pt-float'; bar.innerHTML = ptBarHTML({ done: true, clear: true }); v.parentElement.appendChild(bar); ptBarSync(); }
  else if (PT_HOST.cur === LZH) PT_HOST.cur = null;
  const b = document.querySelector('[data-act="lz-paint"]'); if (b) b.setAttribute('aria-pressed', !!on);
  lzInkDraw();
}
{
  const baseView = viewLienzo;
  viewLienzo = function () {
    LZ.paint = false; const h = baseView(); EXTRA_VIEWS.lienzo = viewLienzo; setTimeout(() => { const v = document.getElementById('lzView'); if (v && !lzInkCanvas()) { const cv = document.createElement('canvas'); cv.id = 'lzInk'; cv.className = 'lz-ink'; v.appendChild(cv); ptAttach(cv, LZH); } lzInkDraw(); }, 30);
    return h.replace('aria-label="Agregar al pizarrón">', `aria-label="Agregar al pizarrón"><button type="button" class="chip pt-toggle" data-act="lz-paint" aria-pressed="false">${icon('pen')}Pintar</button>`);
  };
  EXTRA_VIEWS.lienzo = viewLienzo;
}
/* hojas de pintura como tarjetas del lienzo */
{
  const baseCard = lzCardHTML;
  lzCardHTML = function (c) {
    if (c.k !== 'pintura') return baseCard(c);
    const st = `left:${c.x}px;top:${c.y}px;width:${c.w || 300}px;z-index:${1 + (c.z || 0)}`;
    return `<article class="lz-card k-pintura${LZ.sel === c.id ? ' sel' : ''}" data-lz="${c.id}" style="${st}">${ptSVG(c.strokes, c.pw || 800, c.ph || 600, c.pbg)}<i class="lz-rs" data-rs="${c.id}"></i></article>`;
  };
  const baseEdit = lzEdit;
  lzEdit = function (id) {
    const c = lzData().cards.find((x) => x.id === id); if (!c || c.k !== 'pintura') return baseEdit(id);
    LZ.sel = id; ptEditor({ title: 'Hoja de pintura', strokes: c.strokes, bg: c.pbg, w: c.pw || 800, h: c.ph || 600, canDelete: true,
      onSave: (st, bg) => { c.strokes = st; c.pbg = bg; c.u = Date.now(); LZ.sel = null; lzTouch(); lzPaint(); },
      onDelete: () => { c.del = 1; c.u = Date.now(); LZ.sel = null; lzTouch(); lzPaint(); } });
  };
  const baseAdd = lzAdd;
  lzAdd = function (k, extra) { if (k !== 'pintura') return baseAdd(k, extra); return baseAdd('pintura', { w: 320, pw: 800, ph: 600, pbg: 'liso', strokes: [], ...extra }); };
}
Object.assign(VIDA_ACTS, { 'lz-paint': () => lzPaintMode(!LZ.paint) });
/* la tinta se mezcla trazo por trazo entre dispositivos */
{
  const baseMerge = mergeDocs;
  mergeDocs = function (local, remote, base, td) {
    const out = baseMerge(local, remote, base, td); const a = local.lienzo, b = remote.lienzo;
    if (out.lienzo && (a?.ink || b?.ink)) {
      const map = new Map(); for (const s of [...((b && b.ink) || []), ...((a && a.ink) || [])]) { const o = map.get(s.id); if (!o || (s.u || 0) >= (o.u || 0)) map.set(s.id, s); }
      out.lienzo = { ...out.lienzo, ink: [...map.values()] };
    }
    return out;
  };
}

/* =====================================================================
   Pizarrón del Bosque (pizarra.js): tinta compartida + hojas de pintura
   La tinta de cada persona se guarda en su propio elemento, así nunca se pisan.
   ===================================================================== */
PZ_KIND.pintura = 'Hoja de pintura';
const PZU = 600; /* unidades de ancho del tablero: todo escala parejo */
const pzInkItems = (ep) => gAll('board').filter((x) => x.kind === 'tinta' && (+x.ep || 0) === ep && !x.deleted);
const pzInkId = (ep) => `ink-${ep}-${REG.me}`;
const PZI = { strokes: null, ep: -1, t: 0 };
const pzMine = (ep) => { if (PZI.strokes && PZI.ep === ep) return PZI.strokes; const it = gGet(pzInkId(ep)); PZI.strokes = JSON.parse(JSON.stringify((it && it.strokes) || [])); PZI.ep = ep; return PZI.strokes; };
function pzInkDraw(extra) {
  const cv = document.getElementById('pzInk'), b = document.getElementById('pzBoard'); if (!cv || !b) return;
  const dpr = Math.min(2, devicePixelRatio || 1), w = b.clientWidth, h = b.clientHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px'; }
  const ep = PZ.view != null ? PZ.view : pzEpoch(); const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
  const others = pzInkItems(ep).filter((x) => x.id !== pzInkId(ep)).flatMap((x) => x.strokes || []);
  const mine = PZ.view != null ? (gGet(pzInkId(ep))?.strokes || []) : pzMine(ep);
  ptDrawAll(g, others.concat(mine), w / PZU, 0, 0, dpr, ptThemeDark(), extra);
}
function pzInkSave() {
  clearTimeout(PZI.t); PZI.t = setTimeout(() => {
    const ep = PZI.ep; if (ep < 0 || !PZI.strokes) return; const live = PZI.strokes.filter((s) => !s.del).slice(-500);
    const item = { id: pzInkId(ep), type: 'board', kind: 'tinta', ep, x: 0, y: 0, strokes: live, tone: 'papel' };
    const r0 = render; render = () => {}; let p; try { p = gput(item); } finally { render = r0; } Promise.resolve(p).catch(() => {});
  }, 700);
}
const PZH = {
  stack: [], redo: [], active: () => !!PZ.paint && PZ.view == null, redraw: () => pzInkDraw(), changed: () => pzInkSave(),
  pt: (e) => { const r = document.getElementById('pzInk').getBoundingClientRect(); const k = PZU / r.width; return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k }; },
  minD: () => 1.6, live: (s) => pzInkDraw(s),
  add: (s) => { pzMine(pzEpoch()).push(s); },
  erase: (x, y, list) => { const r = Math.max(10, PT.w * 2.2); for (const s of pzMine(pzEpoch())) if (!s.del && ptNear(s, x, y, r + (s.w || 4) / 2)) { s.del = 1; s.u = Date.now(); list.push(s); } pzInkDraw(); },
  clear: async () => { const list = pzMine(pzEpoch()).filter((s) => !s.del); if (!list.length) return; const ok = await ask({ title: '¿Borrar lo que pintaste?', text: 'Solo se borran tus trazos, no los de otras personas.', ok: 'Borrar mis trazos', danger: true }); if (!ok) return; list.forEach((s) => { s.del = 1; s.u = Date.now(); }); PZH.stack.push({ t: 'del', list }); pzInkSave(); pzInkDraw(); },
  done: () => pzPaintMode(false),
};
function pzPaintMode(on) {
  PZ.paint = on; const b = document.getElementById('pzBoard'); if (!b) return;
  let cv = document.getElementById('pzInk'); if (!cv) { cv = document.createElement('canvas'); cv.id = 'pzInk'; cv.className = 'pz-ink'; b.appendChild(cv); ptAttach(cv, PZH); }
  cv.classList.toggle('paint', !!on); b.classList.toggle('painting', !!on);
  let bar = document.getElementById('pzPtBar'); if (bar) bar.remove();
  if (on) { PT_HOST.cur = PZH; bar = document.createElement('div'); bar.id = 'pzPtBar'; bar.className = 'pt-float'; bar.innerHTML = ptBarHTML({ done: true, clear: true }); document.body.appendChild(bar); ptBarSync(); }
  else if (PT_HOST.cur === PZH) PT_HOST.cur = null;
  document.querySelectorAll('[data-act="pz-paint"]').forEach((x) => x.setAttribute('aria-pressed', !!on));
  pzInkDraw();
  if (on) { const bd = document.getElementById('pzBoard'); if (bd) { try { bd.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch { /* */ } bd.style.scrollMarginTop = '70px'; } }
}
/* el pizarrón no debe mostrar la tinta como si fuera una tarjeta */
{ const basePzItems = pzItems; pzItems = (ep = pzEpoch()) => basePzItems(ep).filter((x) => x.kind !== 'tinta'); }
function pzPtInit() {
  const b = document.getElementById('pzBoard');
  const wasPaint = PZ.paint && PZ.view == null && !!b;
  if (!b) { PZ.paint = false; document.getElementById('pzPtBar')?.remove(); }
  else {
    let cv = document.getElementById('pzInk'); if (!cv) { cv = document.createElement('canvas'); cv.id = 'pzInk'; cv.className = 'pz-ink'; b.appendChild(cv); ptAttach(cv, PZH); }
    if (wasPaint) { cv.classList.add('paint'); b.classList.add('painting'); } else PZ.paint = false;
    pzInkDraw();
  }
  const add = document.querySelector('.pz-add');
  if (add && PZ.view == null && !add.querySelector('[data-act="pz-paint"]')) {
    add.insertAdjacentHTML('beforeend', `<button type="button" class="chip pt-toggle" data-act="pz-paint" aria-pressed="${!!PZ.paint}">${icon('pen')}Pintar</button><button type="button" class="chip" data-act="pz-sheet">${icon('pen')}Hoja de pintura</button>`);
  }
}
{
  const baseView = viewPizarron;
  viewPizarron = function () { const h = baseView(); setTimeout(pzPtInit, 20); setTimeout(pzPtInit, 400); return h; };
  EXTRA_VIEWS.pizarron && (EXTRA_VIEWS.pizarron = viewPizarron); if (typeof GROUP_VIEWS !== 'undefined' && GROUP_VIEWS.pizarron) GROUP_VIEWS.pizarron = viewPizarron;
}
/* hojas de pintura como tarjetas del Bosque */
{
  const baseCard = pzCardHTML;
  pzCardHTML = function (it, ro) {
    if (it.kind !== 'pintura') return baseCard(it, ro);
    const tone = PZ_TONES[it.tone] ? it.tone : 'papel'; const pos = PZ.mode === 'lienzo' ? ` style="left:${(it.x || 0) * 100}%;top:${Math.round((it.y || 0) * 620)}px"` : '';
    return `<article class="pz-card t-${tone} k-pintura sz-l${it.pin ? ' pinned' : ''}" data-pz="${it.id}"${pos} ${ro ? '' : 'tabindex="0"'}><span class="pz-kind">${PZ_KIND.pintura}</span>${ptSVG(it.strokes, it.pw || 800, it.ph || 600, it.pbg)}<span class="pz-foot">${mini(it.by, 'xs')}<span>${esc(it.by || '')} · ${ago(it.u || it.at)}</span></span></article>`;
  };
  const baseSheet = pzSheet;
  pzSheet = function (it) {
    if (it.kind !== 'pintura') return baseSheet(it);
    const isNew = !gGet(it.id);
    ptEditor({ title: isNew ? 'Nueva hoja de pintura' : 'Hoja de pintura', strokes: it.strokes, bg: it.pbg, w: it.pw || 800, h: it.ph || 600, canDelete: !isNew,
      onSave: (st, bg) => { gput({ ...(gGet(it.id) || it), strokes: st, pbg: bg, pw: it.pw || 800, ph: it.ph || 600 }); Snd.drop(); },
      onDelete: () => gput({ ...(gGet(it.id) || it), deleted: true }) });
  };
}
Object.assign(VIDA_ACTS, {
  'pz-paint': () => pzPaintMode(!PZ.paint),
  'pz-sheet': () => pzSheet({ id: 'pz' + uid(), type: 'board', kind: 'pintura', ep: pzEpoch(), tone: PZ.tone, strokes: [], pbg: 'liso', pw: 800, ph: 600, ...pzSpot() }),
});
