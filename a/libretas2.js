/* Cinnavia 8.1 — Libretas 2: buscar, fijar, filtrar por tipo, repasar con tarjetas, plantillas,
   duplicar / mover páginas, portadas nuevas y una portada de estantería con resumen.
   Se apoya en libretas.js (mismas páginas y mismos datos): nada de lo anterior se pierde. */
'use strict';
const LQ = { q: '', type: 'todo', rev: null };
const LQ_TYPES = [['todo', 'Todo'], ['pin', 'Fijadas'], ['nota', 'Apuntes'], ['info', 'Información'], ['lista', 'Listas'], ['foto', 'Fotos'], ['enlace', 'Enlaces']];
Object.assign(LB_COVERS, { atardecer: 'Atardecer', bosque: 'Bosque', galaxia: 'Galaxia', cafe: 'Café', oceano: 'Océano', cerezo: 'Cerezo' });

/* ---------- Portadas nuevas ---------- */
{
  const baseArt = coverArt;
  coverArt = function (c) {
    if (c === 'atardecer') return '<svg class="lb-art" viewBox="0 0 100 130" aria-hidden="true"><circle cx="50" cy="70" r="20"/><path d="M0 90h100M10 100h80M22 110h56M34 120h32"/><path d="M0 70c10-4 18-4 26 0M74 66c8-4 16-4 26 0"/></svg>';
    if (c === 'bosque') return '<svg class="lb-art" viewBox="0 0 100 130" aria-hidden="true"><path d="M24 118V96M24 96l-12 0 12-18-10 0 10-16 10 16-10 0 12 18zM66 118V92M66 92H50l16-24-12 0 12-20 12 20-12 0 16 24z"/><path d="M0 118h100"/><circle cx="80" cy="22" r="6"/></svg>';
    if (c === 'galaxia') return `<svg class="lb-art" viewBox="0 0 100 130" aria-hidden="true"><ellipse cx="50" cy="62" rx="40" ry="14" transform="rotate(-24 50 62)"/><ellipse cx="50" cy="62" rx="26" ry="8" transform="rotate(-24 50 62)"/><circle cx="50" cy="62" r="4"/>${[[18, 20], [78, 28], [84, 96], [20, 100], [60, 12], [30, 50]].map(([x, y]) => `<path d="M${x - 2} ${y}h4M${x} ${y - 2}v4"/>`).join('')}</svg>`;
    if (c === 'cafe') return '<svg class="lb-art" viewBox="0 0 100 130" aria-hidden="true"><path d="M26 54h38v22a14 14 0 0 1-14 14h-10a14 14 0 0 1-14-14zM64 60h6a8 8 0 0 1 0 16h-6"/><path d="M36 34c-4 6 4 8 0 14M48 34c-4 6 4 8 0 14M18 100h56"/></svg>';
    if (c === 'oceano') return '<svg class="lb-art" viewBox="0 0 100 130" aria-hidden="true"><path d="M-4 50c12-8 20 8 32 0s20-8 32 0 20 8 44 0M-4 70c12-8 20 8 32 0s20-8 32 0 20 8 44 0M-4 90c12-8 20 8 32 0s20-8 32 0 20 8 44 0"/><circle cx="72" cy="24" r="8"/></svg>';
    if (c === 'cerezo') return '<svg class="lb-art" viewBox="0 0 100 130" aria-hidden="true"><path d="M70 130C66 96 52 72 30 54M54 84c10-8 16-8 24-4M44 66c-6-8-14-10-22-6"/>' + [[24, 40], [40, 26], [64, 36], [78, 66], [20, 74], [56, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/><circle cx="${x}" cy="${y}" r="1.4"/>`).join('') + '</svg>';
    return baseArt(c);
  };
}

/* ---------- Utilidades ---------- */
const lqWords = (p) => `${p.title || ''} ${p.text || ''} ${(p.items || []).map((i) => i.t).join(' ')}`.trim().split(/\s+/).filter(Boolean).length;
const lqQ = (p) => `${p.title || ''} ${p.text || ''} ${(p.items || []).map((i) => i.t).join(' ')} ${p.link || ''}`.toLowerCase();
const lqNorm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const lqKind = (p) => (p.kind === 'nota' ? 'nota' : p.kind);
const lqMatch = (item) => {
  if (LQ.type === 'todo') return true;
  if (LQ.type === 'pin') return item.k === 'p' && item.p.pin;
  if (LQ.type === 'nota') return item.k === 'n' || (item.k === 'p' && item.p.kind === 'nota');
  return item.k === 'p' && lqKind(item.p) === LQ.type;
};

/* Tarjetas de repaso: sale de las hojas de Información y de líneas «Término: definición». */
function lqDeck(sid) {
  const out = []; const seen = new Set();
  const add = (q, a) => { q = (q || '').trim(); a = (a || '').trim(); if (q.length < 2 || a.length < 3) return; const k = lqNorm(q); if (seen.has(k)) return; seen.add(k); out.push({ q: q.slice(0, 120), a: a.slice(0, 420) }); };
  for (const p of lbPages(sid)) {
    if (p.kind === 'info' && p.title && p.text) add(p.title, p.text);
    if (p.kind === 'info' || p.kind === 'nota') (p.text || '').split('\n').forEach((l) => { const m = l.match(/^\s*[-•*]?\s*([^:：]{2,48})[:：]\s+(.{4,})$/); if (m) add(m[1], m[2]); });
  }
  for (const n of lbNotes(sid)) htmlText(n.body || '').split('\n').forEach((l) => { const m = l.match(/^\s*[-•*]?\s*([^:：]{2,48})[:：]\s+(.{4,})$/); if (m) add(m[1], m[2]); });
  return out.slice(0, 80);
}
function lqShuffle(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function lqRevHTML(sid) {
  const deck = lqDeck(sid);
  if (!deck.length) return `<div class="empty"><h3>Aún no hay tarjetas</h3><p>Crea una hoja de <b>Información</b> (título y lo que hay que saber) o escribe líneas como «Fotosíntesis: proceso con que las plantas hacen su alimento». Con eso se arman solas las tarjetas de repaso.</p></div>`;
  if (!LQ.rev || LQ.rev.sid !== sid) LQ.rev = { sid, cards: lqShuffle(deck), i: 0, flip: false, known: 0, again: 0 };
  const R = LQ.rev;
  if (R.i >= R.cards.length) {
    const pct = Math.round((R.known / R.cards.length) * 100);
    return `<div class="lq-done"><div class="lq-ring" style="--p:${pct}"><b>${pct}%</b></div><h3>${pct >= 80 ? '¡Qué buen repaso!' : pct >= 50 ? 'Vas muy bien' : 'Sigue practicando'}</h3><p class="muted">Supiste ${R.known} de ${R.cards.length}. ${R.again ? 'Las que fallaste vuelven a salir si repasas de nuevo.' : ''}</p><div class="btn-row"><button class="btn primary" data-act="lq-rv-restart">${icon('spark', 'sm')}Repasar otra vez</button>${R.again ? `<button class="btn" data-act="lq-rv-weak">Solo las que fallé</button>` : ''}</div></div>`;
  }
  const c = R.cards[R.i];
  return `<div class="lq-rev"><div class="lq-bar"><i style="width:${Math.round((R.i / R.cards.length) * 100)}%"></i></div><p class="tiny faint" style="text-align:center">Tarjeta ${R.i + 1} de ${R.cards.length}</p>
    <button type="button" class="lq-card ${R.flip ? 'flip' : ''}" data-act="lq-rv-flip" aria-label="Voltear tarjeta"><span class="lq-face lq-front"><em>Concepto</em><b>${esc(c.q)}</b><small>Toca para ver la respuesta</small></span><span class="lq-face lq-back"><em>${esc(c.q)}</em><span>${esc(c.a)}</span></span></button>
    <div class="lq-btns ${R.flip ? 'on' : ''}"><button class="btn" data-act="lq-rv-again">${icon('reset', 'sm')}Aún no</button><button class="btn primary" data-act="lq-rv-know">${icon('check', 'sm')}Ya la sé</button></div></div>`;
}

/* ---------- Páginas con fijado, progreso y menú ---------- */
{
  const basePage = pageHTML;
  pageHTML = function (p) {
    let h = basePage(p);
    h = h.replace('<article class="lb-page', `<article data-q="${esc(lqNorm(lqQ(p)))}" class="lb-page${p.pin ? ' lq-pinned' : ''}`);
    if (p.pin) h = h.replace('<header>', `<header><span class="lq-pin" title="Fijada">📌</span>`);
    if (p.kind === 'lista' && (p.items || []).length) { const d = p.items.filter((i) => i.done).length; h = h.replace('<footer>', `<div class="lq-prog" aria-label="${d} de ${p.items.length}"><i style="width:${Math.round((d / p.items.length) * 100)}%"></i><span>${d}/${p.items.length}</span></div><footer>`); }
    h = h.replace('<button class="icon-btn ghost" data-act="lb-send"', `<button class="icon-btn ghost" data-act="lq-more" data-id="${p.id}" aria-label="Más opciones"><b aria-hidden="true" style="font-size:18px;line-height:1">⋯</b></button><button class="icon-btn ghost" data-act="lb-send"`);
    return h;
  };
}

/* ---------- Estantería (inicio de Libretas) ---------- */
function lqAllPages() { return (S.pages || []).filter((p) => !p.deleted).sort((a, b) => (b.updated || b.at) - (a.updated || a.at)); }
{
  const baseShelf = viewLibretas;
  viewLibretas = function (arg) {
    if (arg) return viewLibreta(arg);
    const subs = lbSubjects(); const all = lqAllPages(); const nameOf = (id) => (subs.find((s) => s.id === (id || '_gen')) || {}).name || 'General';
    const photos = all.filter((p) => p.kind === 'foto').reduce((n, p) => n + (p.img || []).length, 0);
    const pend = (S.tasks || []).filter((t) => !t.done).length;
    const recents = all.slice(0, 4);
    const html = baseShelf();
    const stats = `<div class="lq-stats"><span><b>${subs.length}</b>libretas</span><span><b>${all.length + (S.notes || []).length}</b>páginas</span><span><b>${photos}</b>fotos</span><span><b>${pend}</b>pendientes</span></div>
      <label class="lq-search"><span aria-hidden="true">${icon('search')}</span><input id="lqAllQ" type="search" placeholder="Buscar en todas tus libretas" autocomplete="off" aria-label="Buscar en todas tus libretas"></label>
      <div id="lqAllRes" class="lq-res" hidden>${all.map((p) => `<a class="lq-hit" href="#/libretas/${p.subjectId || '_gen'}" data-q="${esc(lqNorm(lqQ(p)))}"><b>${esc(p.title || (p.text || '').slice(0, 40) || LB_KIND_NAME[p.kind] || 'Hoja')}</b><small>${esc(nameOf(p.subjectId))} · ${esc(LB_KIND_NAME[p.kind] || 'Página')}</small></a>`).join('')}${(S.notes || []).map((n) => `<a class="lq-hit" href="#/libretas/${n.subjectId || '_gen'}" data-q="${esc(lqNorm(`${n.title || ''} ${htmlText(n.body || '')}`))}"><b>${esc(n.title || 'Sin título')}</b><small>${esc(nameOf(n.subjectId))} · Apunte</small></a>`).join('')}<p class="small muted lq-none" hidden>No encontré nada con eso.</p></div>`;
    const rec = recents.length ? `<h2 class="sec" style="margin-top:22px">Seguir donde lo dejaste</h2><div class="lq-recent">${recents.map((p) => `<a href="#/libretas/${p.subjectId || '_gen'}" class="lq-rc t-${LB_TONES[p.tone] ? p.tone : 'papel'}"><small>${esc(nameOf(p.subjectId))}</small><b>${esc(p.title || (p.text || '').slice(0, 36) || LB_KIND_NAME[p.kind] || 'Hoja')}</b><em>${esc(relDay(toISO(new Date(p.updated || p.at))))}</em></a>`).join('')}</div>` : '';
    return html.replace('<div class="lb-shelf">', `${stats}<div class="lb-shelf">`).replace(/<\/div>$/, `</div>${rec}`);
  };
  EXTRA_VIEWS.libretas = viewLibretas;
}

/* ---------- Una libreta ---------- */
viewLibreta = function (sid) {
  const s = lbSubjects().find((x) => x.id === sid);
  if (!s) return `<a class="back" href="#/libretas">${icon('back')}Libretas</a><div class="empty"><h3>Esta libreta ya no existe</h3></div>`;
  setTimeout(hydrateUF, 30); setTimeout(hydratePhotos, 30);
  const pages = lbPages(sid).map((p) => ({ k: 'p', at: (p.pin ? 1e15 : 0) + (p.updated || p.at), p })); const notes = lbNotes(sid).map((n) => ({ k: 'n', at: n.updated || 0, n }));
  const feedAll = [...pages, ...notes].sort((a, b) => b.at - a.at); const feed = feedAll.filter(lqMatch);
  const tasks = S.tasks.filter((t) => (t.subjectId || '_gen') === sid).sort(sortPending);
  const photos = lbPages(sid).filter((p) => p.kind === 'foto').flatMap((p) => p.img || []);
  const deckN = lqDeck(sid).length; const doneT = tasks.filter((t) => t.done).length; const pct = tasks.length ? Math.round((doneT / tasks.length) * 100) : 0;
  const words = lbPages(sid).reduce((n, p) => n + lqWords(p), 0) + lbNotes(sid).reduce((n, x) => n + htmlText(x.body || '').split(/\s+/).filter(Boolean).length, 0);
  const tabs = `<div class="seg full" role="group" style="margin:14px 0">${[['paginas', 'Páginas', feedAll.length], ['repaso', 'Repaso', deckN], ['tareas', 'Tareas', tasks.filter((t) => !t.done).length], ['fotos', 'Fotos', photos.length]].map(([k, l, n]) => `<button type="button" class="lq-tab" data-act="lb-tab" data-v="${k}" aria-pressed="${LB.tab === k}">${l}${n ? `<sup>${n}</sup>` : ''}</button>`).join('')}</div>`;
  let body = '';
  if (LB.tab === 'tareas') body = `<button class="btn primary" data-act="new-task" data-subject="${lbSid(sid) || ''}">${icon('plus')}Tarea de ${esc(s.name)}</button>${tasks.length ? `<div class="lq-prog big" style="margin-top:12px"><i style="width:${pct}%"></i><span>${doneT}/${tasks.length} hechas</span></div><ul class="tasks" style="margin-top:12px">${tasks.map((t) => taskRow(t)).join('')}</ul>` : '<p class="muted">Sin tareas en esta materia.</p>'}`;
  else if (LB.tab === 'fotos') body = photos.length ? `<div class="lb-gallery">${photos.map((id) => `<span class="lb-ph fr-simple"><img data-uf="${id}" alt="" data-act="lb-zoom" data-id="${id}"></span>`).join('')}</div>` : '<div class="empty"><h3>Sin fotos todavía</h3><p>Toma foto al pizarrón o a tu cuaderno y queda guardada aquí, aunque cambies de teléfono.</p></div>';
  else if (LB.tab === 'repaso') body = lqRevHTML(sid);
  else {
    const chips = `<div class="lq-chips" role="group" aria-label="Filtrar por tipo">${LQ_TYPES.map(([k, l]) => `<button type="button" class="lq-chip" data-act="lq-type" data-v="${k}" aria-pressed="${LQ.type === k}">${l}</button>`).join('')}</div>`;
    const search = `<label class="lq-search"><span aria-hidden="true">${icon('search')}</span><input id="lqQ" type="search" value="${esc(LQ.q)}" placeholder="Buscar en ${esc(s.name)}" autocomplete="off" aria-label="Buscar en esta libreta"></label>`;
    const list = feed.length ? `<div class="lb-feed" id="lqFeed">${feed.map((x) => (x.k === 'p' ? pageHTML(x.p) : `<article data-q="${esc(lqNorm(`${x.n.title || ''} ${htmlText(x.n.body || '')}`))}" class="lb-page t-papel k-nota lb-tap" data-nid="${x.n.id}"><header><span class="lb-kind">Apunte</span><h3>${esc(x.n.title || 'Sin título')}</h3></header><p class="lb-clip">${esc(htmlText(x.n.body).slice(0, 260))}</p><footer><span class="tiny faint">${x.n.updated ? esc(relDay(toISO(new Date(x.n.updated)))) : ''}</span><span class="grow"></span><button class="icon-btn ghost" data-act="lb-send-note" data-id="${x.n.id}" aria-label="Mandar">${icon('share', 'sm')}</button><button class="icon-btn ghost" data-act="lb-open-note" data-id="${x.n.id}" aria-label="Abrir">${icon('edit', 'sm')}</button></footer></article>`)).join('')}<p class="small muted lq-none" hidden>No encontré páginas con eso.</p></div>`
      : (feedAll.length ? `<div class="empty"><h3>Nada en este filtro</h3><p>Prueba con otro tipo o toca «Todo».</p></div>` : `<div class="empty"><h3>Tu libreta está en blanco</h3><p>Empieza con un apunte, una plantilla, una tarjeta de información o una foto. Todo lo que escribas aquí también alimenta tu Quiz inteligente y tus tarjetas de repaso.</p></div>`);
    body = (feedAll.length > 3 ? search : '') + chips + list;
  }
  return `<a class="back" href="#/libretas">${icon('back')}Libretas</a>
    <section class="lb-head" style="--c:${safeColor(s.color)}">${coverHTML(s, true)}<div class="lb-head-tx"><h1 class="page-title">${esc(s.name)}</h1><div class="lb-stats"><span><b>${feedAll.length}</b> ${feedAll.length === 1 ? 'página' : 'páginas'}</span><span><b>${tasks.filter((t) => !t.done).length}</b> por hacer</span><span><b>${photos.length}</b> ${photos.length === 1 ? 'foto' : 'fotos'}</span><span><b>${words}</b> palabras</span></div><button class="link-btn" data-act="lb-cover" data-id="${sid}">Cambiar portada</button></div></section>
    <div class="lb-add">${[['nota', 'note', 'Apunte'], ['info', 'spark', 'Información'], ['lista', 'list', 'Lista'], ['foto', 'cam', 'Fotos'], ['pegatina', 'leaf', 'Pegatina'], ['enlace', 'link', 'Enlace'], ['plantilla', 'bookopen', 'Plantilla']].map(([k, ic, l]) => `<button type="button" class="lb-addb" data-act="${k === 'plantilla' ? 'lq-tpl' : 'lb-new'}" data-k="${k}" data-sid="${sid}">${icon(ic)}<span>${l}</span></button>`).join('')}</div>
    ${tabs}${body}
    <div class="btn-row" style="margin-top:16px"><button class="btn" data-act="qz-go" data-v="${lbSid(sid) || ''}">${icon('spark', 'sm')}Quiz de esta libreta</button><button class="btn quiet" data-act="help-open">${icon('help', 'sm')}Pedir ayuda</button></div>`;
};

/* ---------- Plantillas ---------- */
const LQ_TPL = {
  cornell: { label: 'Notas Cornell', k: 'nota', title: 'Tema de la clase', text: 'PALABRAS CLAVE:\n- \n- \n\nAPUNTES:\n\n\nRESUMEN (con tus palabras):\n' },
  clase: { label: 'Resumen de clase', k: 'nota', title: 'Clase del día', text: 'Tema:\nIdea principal:\nTres cosas que aprendí:\n1. \n2. \n3. \nDudas para preguntar:\n' },
  vocab: { label: 'Vocabulario', k: 'info', title: 'Vocabulario', text: 'Palabra: significado\nPalabra: significado\nPalabra: significado' },
  examen: { label: 'Preparar un examen', k: 'lista', title: 'Plan para el examen', items: ['Repasar apuntes', 'Hacer resumen de una hoja', 'Resolver ejercicios', 'Practicar con el Quiz', 'Dormir bien la noche anterior'] },
  lectura: { label: 'Ficha de lectura', k: 'nota', title: 'Ficha de lectura', text: 'Título y autor:\nDe qué trata:\nPersonajes o ideas clave:\nMe gustó / no me gustó porque:\nFrase que quiero recordar:\n' },
  proyecto: { label: 'Proyecto paso a paso', k: 'lista', title: 'Mi proyecto', items: ['Elegir el tema', 'Buscar información', 'Hacer el borrador', 'Revisar y corregir', 'Entregar'] },
};

/* ---------- Acciones ---------- */
Object.assign(VIDA_ACTS, {
  'lq-type': (el) => { LQ.type = el.dataset.v; render(); },
  'lq-tpl': async (el) => {
    const v = await ask({ title: 'Elige una plantilla', options: Object.entries(LQ_TPL).map(([k, t]) => ({ value: k, label: t.label })) }); if (!v) return;
    const t = LQ_TPL[v]; const sid = el.dataset.sid;
    pageSheet({ id: 'pg' + uid(), kind: t.k, subjectId: lbSid(sid), title: t.title || '', text: t.text || '', items: (t.items || []).map((x) => ({ t: x, done: false })), img: [], tone: LB.tone, at: Date.now() });
  },
  'lq-more': async (el) => {
    const p = (S.pages || []).find((x) => x.id === el.dataset.id); if (!p) return;
    const v = await ask({ title: p.title || 'Esta página', options: [{ value: 'pin', label: p.pin ? 'Quitar de fijadas' : 'Fijar arriba', icon: 'star' }, { value: 'dup', label: 'Duplicar', icon: 'copy' }, { value: 'move', label: 'Mover a otra libreta', icon: 'book' }] }); if (!v) return;
    if (v === 'pin') { commit((s) => { const q = s.pages.find((x) => x.id === p.id); if (q) { q.pin = !q.pin; q.updated = Date.now(); } }); toast(p.pin ? 'Ya no está fijada.' : 'Fijada arriba de tu libreta.'); Snd.tick(); }
    else if (v === 'dup') { const c = JSON.parse(JSON.stringify(p)); c.id = 'pg' + uid(); c.pin = false; c.shared = undefined; c.sharedFrom = undefined; c.isOwner = undefined; c.title = `${p.title || 'Página'} (copia)`; c.at = Date.now(); c.updated = Date.now(); commit((s) => { s.pages.push(c); }); toast('Copia lista.'); Snd.drop(); }
    else if (v === 'move') {
      const opts = lbSubjects().filter((x) => x.id !== (p.subjectId || '_gen')).map((x) => ({ value: x.id, label: x.name })); if (!opts.length) { toast('Aún no tienes otra libreta.'); return; }
      const to = await ask({ title: '¿A qué libreta la mueves?', options: opts }); if (!to) return;
      commit((s) => { const q = s.pages.find((x) => x.id === p.id); if (q) { q.subjectId = lbSid(to); q.updated = Date.now(); } }); toast('Página movida.'); Snd.drop();
    }
  },
  'lq-rv-flip': () => { if (LQ.rev) { LQ.rev.flip = !LQ.rev.flip; const c = document.querySelector('.lq-card'); if (c) c.classList.toggle('flip', LQ.rev.flip); const b = document.querySelector('.lq-btns'); if (b) b.classList.toggle('on', LQ.rev.flip); Snd.tick(); } },
  'lq-rv-know': () => { const R = LQ.rev; if (!R) return; R.known++; R.i++; R.flip = false; Snd.pop ? Snd.pop() : Snd.tick(); if (R.i >= R.cards.length) { try { waterToday(); } catch { /* */ } } render(); },
  'lq-rv-again': () => { const R = LQ.rev; if (!R) return; R.again++; R.weak = (R.weak || []).concat(R.cards[R.i]); R.i++; R.flip = false; Snd.tick(); render(); },
  'lq-rv-restart': () => { LQ.rev = null; render(); },
  'lq-rv-weak': () => { const R = LQ.rev; if (!R || !R.weak) return; LQ.rev = { sid: R.sid, cards: lqShuffle(R.weak), i: 0, flip: false, known: 0, again: 0 }; render(); },
});

/* Buscar sin volver a pintar (así no se pierde el teclado) */
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'lqQ') {
    LQ.q = t.value; const q = lqNorm(t.value.trim()); const feed = document.getElementById('lqFeed'); if (!feed) return; let n = 0;
    feed.querySelectorAll('.lb-page').forEach((a) => { const ok = !q || (a.dataset.q || '').includes(q); a.hidden = !ok; if (ok) n++; });
    const none = feed.querySelector('.lq-none'); if (none) none.hidden = n > 0;
  } else if (t.id === 'lqAllQ') {
    const q = lqNorm(t.value.trim()); const box = document.getElementById('lqAllRes'); if (!box) return; box.hidden = !q; let n = 0;
    box.querySelectorAll('.lq-hit').forEach((a) => { const ok = q && (a.dataset.q || '').includes(q) && n < 12; a.hidden = !ok; if (ok) n++; });
    const none = box.querySelector('.lq-none'); if (none) none.hidden = !q || n > 0;
  }
});
window.addEventListener('hashchange', () => { if (!/^#\/libretas/.test(location.hash)) { LQ.q = ''; LQ.type = 'todo'; LQ.rev = null; } });
