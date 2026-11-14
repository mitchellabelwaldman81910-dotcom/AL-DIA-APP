/* Cinnavia 8.3 — Estudio: tarjetas de repaso con repetición espaciada, exámenes con plan de estudio automático,
   horario semanal, registro de ánimo con calendario de colores y un buscador de todo (Ctrl+K o la tecla «/»).
   Los datos viven en tu cuenta (jpData('estudio')) y se sincronizan igual que tus juegos. */
'use strict';
const ESD = () => { const d = jpData('estudio'); d.cards ||= []; d.exams ||= []; d.mood ||= {}; return d; };
const ES = { sid: '', q: null, flip: false, deck: '', find: '' };
const esId = (p) => p + uid().replace(/[^a-z0-9]/gi, '').slice(-9);
const esNorm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const esSave = () => { try { jpSave(); } catch { /* */ } };
const ES_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const ES_INT = [0, 1, 2, 4, 8, 16, 32];
const esSubjName = (id) => (id ? ((subj(id) || {}).name || 'Sin materia') : 'General');

/* ================= Tarjetas de repaso ================= */
function esDue(d) { const t = today(); return d.cards.filter((c) => !c.due || c.due <= t); }
function viewTarjetas() {
  const d = ESD(); const due = esDue(d); const subs = [{ id: '', name: 'Todas' }, ...S.subjects];
  const list = d.cards.filter((c) => !ES.deck || (c.sid || '_') === ES.deck);
  const boxes = [1, 2, 3, 4, 5, 6].map((b) => d.cards.filter((c) => (c.box || 1) === b).length);
  const learned = boxes[4] + boxes[5];
  if (ES.q) return esStudy(d);
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Tarjetas</h1>
    <p class="page-sub">Repasa lo que ya sabes cada vez menos seguido, y lo que olvidas, más seguido. Así se queda en la memoria.</p>
    <div class="es-stats"><span><b>${d.cards.length}</b>tarjetas</span><span><b>${due.length}</b>para hoy</span><span><b>${learned}</b>dominadas</span></div>
    <div class="es-boxes" aria-label="Cajas de repaso">${boxes.map((n, i) => `<i style="--h:${Math.min(100, n * 12 + 6)}%" title="Caja ${i + 1}: ${n}"><b>${n}</b></i>`).join('')}</div>
    <div class="btn-row"><button class="btn primary" data-act="es-study" ${due.length ? '' : 'disabled'}>${icon('play', 'sm')}Repasar ahora${due.length ? ` · ${due.length}` : ''}</button><button class="btn" data-act="es-add">${icon('plus', 'sm')}Nueva</button><button class="btn" data-act="es-bulk">Pegar varias</button><button class="btn" data-act="es-lib">Traer de libretas</button></div>
    <div class="lq-chips" role="group" style="margin-top:12px">${subs.map((s) => `<button type="button" class="lq-chip" data-act="es-deck" data-v="${s.id}" aria-pressed="${ES.deck === s.id}">${esc(s.name)}</button>`).join('')}</div>
    ${list.length ? `<ul class="es-list">${list.slice().reverse().slice(0, 80).map((c) => `<li><span class="b b${c.box || 1}">${c.box || 1}</span><span class="t"><b>${esc(c.q)}</b><small>${esc(c.a)}</small></span><button class="icon-btn ghost" data-act="es-del" data-id="${c.id}" aria-label="Quitar tarjeta">${icon('trash', 'sm')}</button></li>`).join('')}</ul>` : '<div class="empty"><h3>Aún no tienes tarjetas</h3><p>Crea una, pega varias («Término: definición» por renglón) o tráelas de tus libretas.</p></div>'}`;
}
function esStudy(d) {
  const q = ES.q; if (!q.cards.length || q.i >= q.cards.length) {
    return `<a class="back" href="#/tarjetas" data-act="es-end">${icon('back')}Tarjetas</a><div class="lq-done"><div class="lq-ring" style="--p:${q.cards.length ? Math.round((q.ok / q.cards.length) * 100) : 100}"><b>${q.cards.length ? Math.round((q.ok / q.cards.length) * 100) : 100}%</b></div><h3>¡Repaso terminado!</h3><p class="muted">${q.ok} de ${q.cards.length} bien. Las tarjetas vuelven a salir cuando toca.</p><button class="btn primary" data-act="es-end">Listo</button></div>`;
  }
  const c = q.cards[q.i];
  return `<a class="back" href="#/tarjetas" data-act="es-end">${icon('back')}Terminar</a><div class="lq-bar" style="margin-top:8px"><i style="width:${Math.round((q.i / q.cards.length) * 100)}%"></i></div><p class="tiny faint" style="text-align:center">Tarjeta ${q.i + 1} de ${q.cards.length} · caja ${c.box || 1}</p>
    <button type="button" class="lq-card ${ES.flip ? 'flip' : ''}" data-act="es-flip"><span class="lq-face lq-front"><em>${esc(esSubjName(c.sid))}</em><b>${esc(c.q)}</b><small>Toca para ver la respuesta</small></span><span class="lq-face lq-back"><em>${esc(c.q)}</em><span>${esc(c.a)}</span></span></button>
    <div class="es-grade ${ES.flip ? 'on' : ''}"><button class="btn" data-act="es-rate" data-v="0">Otra vez</button><button class="btn" data-act="es-rate" data-v="1">Difícil</button><button class="btn primary" data-act="es-rate" data-v="2">Bien</button><button class="btn" data-act="es-rate" data-v="3">Fácil</button></div>`;
}
function esCardSheet() {
  openSheet(`${sheetHead('Nueva tarjeta')}<div class="sheet-body"><div class="field"><label for="esQ">Pregunta o concepto</label><input id="esQ" class="input" maxlength="140" autocomplete="off"></div>
    <div class="field"><label for="esA">Respuesta</label><textarea id="esA" class="input" rows="3" maxlength="500"></textarea></div>
    <div class="field"><label for="esS">Materia</label><select id="esS" class="input"><option value="">General</option>${S.subjects.map((s) => `<option value="${s.id}" ${ES.deck === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div></div>
    <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn" data-act="es-save" data-more="1">Guardar y otra</button><button class="btn primary" data-act="es-save">Guardar</button></div>`);
  setTimeout(() => document.getElementById('esQ')?.focus(), 80);
}
function esAddCards(arr) { const d = ESD(); const seen = new Set(d.cards.map((c) => esNorm(c.q) + '|' + (c.sid || ''))); let n = 0; for (const c of arr) { const k = esNorm(c.q) + '|' + (c.sid || ''); if (seen.has(k)) continue; seen.add(k); d.cards.push({ id: esId('tj'), sid: c.sid || '', q: c.q, a: c.a, box: 1, due: today() }); n++; } esSave(); return n; }

/* ================= Exámenes ================= */
const esDays = (iso) => Math.round((new Date(iso + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5);
function esPlan(e) {
  const left = esDays(e.date); const topics = e.topics || []; if (left < 1 || !topics.length) return [];
  const pend = topics.map((t, i) => ({ t, i })).filter((x) => !x.t.done); if (!pend.length) return [];
  const days = Math.max(1, left - 1 > 0 ? left - 1 : 1); const per = Math.ceil(pend.length / days); const out = [];
  for (let k = 0; k < days; k++) { const chunk = pend.slice(k * per, k * per + per); if (!chunk.length) break; out.push({ date: addDays(today(), k), items: chunk }); }
  if (left >= 2) out.push({ date: addDays(e.date, -1), items: [{ t: { n: 'Repaso general y descanso' }, i: -1 }] });
  return out;
}
function viewExamenes() {
  const d = ESD(); const L = d.exams.slice().sort((a, b) => a.date.localeCompare(b.date)); const up = L.filter((e) => esDays(e.date) >= 0); const past = L.filter((e) => esDays(e.date) < 0);
  const card = (e) => {
    const n = esDays(e.date); const tp = e.topics || []; const dn = tp.filter((t) => t.done).length; const pct = tp.length ? Math.round((dn / tp.length) * 100) : 0; const plan = n >= 0 ? esPlan(e) : [];
    return `<section class="es-ex ${n >= 0 && n <= 3 ? 'soon' : ''} ${n < 0 ? 'past' : ''}"><div class="es-ex-h"><div><b>${esc(e.title)}</b><small>${esc(esSubjName(e.sid))} · ${esc(relDay(e.date))}</small></div><span class="es-cd"><b>${n < 0 ? '—' : n}</b><small>${n === 0 ? 'hoy' : n === 1 ? 'día' : 'días'}</small></span></div>
      ${tp.length ? `<div class="lq-prog"><i style="width:${pct}%"></i><span>${dn}/${tp.length} temas</span></div><ul class="es-tp">${tp.map((t, i) => `<li><button type="button" class="lb-ck ${t.done ? 'on' : ''}" data-act="es-tp" data-id="${e.id}" data-i="${i}" aria-pressed="${!!t.done}">${icon('check', 'sm')}</button><span class="${t.done ? 'dn' : ''}">${esc(t.n)}</span></li>`).join('')}</ul>` : '<p class="tiny faint">Agrega los temas que entran y te armo un plan día por día.</p>'}
      ${plan.length ? `<details class="es-plan"><summary>Plan de estudio · ${plan.length} ${plan.length === 1 ? 'día' : 'días'}</summary><ol>${plan.map((p) => `<li><b>${esc(cap(relDay(p.date)))}</b> ${p.items.map((x) => esc(x.t.n)).join(' · ')}</li>`).join('')}</ol></details>` : ''}
      <div class="tp-row"><button class="btn" data-act="es-tp-add" data-id="${e.id}">${icon('plus', 'sm')}Temas</button>${plan.length ? `<button class="btn" data-act="es-plan-tasks" data-id="${e.id}">Crear tareas del plan</button>` : ''}<button class="icon-btn ghost" data-act="es-ex-del" data-id="${e.id}" aria-label="Quitar examen">${icon('trash', 'sm')}</button></div></section>`;
  };
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Exámenes</h1><p class="page-sub">Cuenta regresiva, temas por repasar y un plan de estudio que reparte el trabajo para que no lo dejes todo al final.</p>
    <p><button class="btn primary" data-act="es-ex-new">${icon('plus', 'sm')}Nuevo examen</button></p>
    ${up.length ? up.map(card).join('') : '<div class="empty"><h3>Sin exámenes próximos</h3><p>Agrega uno con su fecha y los temas.</p></div>'}
    ${past.length ? `<h2 class="sec">Pasados</h2>${past.slice(-3).map(card).join('')}` : ''}`;
}
function esExSheet() {
  openSheet(`${sheetHead('Nuevo examen')}<div class="sheet-body"><div class="field"><label for="exT">Nombre</label><input id="exT" class="input" maxlength="80" placeholder="Ej. Parcial de Biología"></div>
    <div class="field"><label for="exD">Fecha</label><input id="exD" type="date" class="input" value="${addDays(today(), 10)}"></div>
    <div class="field"><label for="exS">Materia</label><select id="exS" class="input"><option value="">General</option>${S.subjects.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
    <div class="field"><label for="exP">Temas (uno por renglón)</label><textarea id="exP" class="input" rows="5" placeholder="Célula\nFotosíntesis\nGenética"></textarea></div></div>
    <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="es-ex-save">Guardar</button></div>`);
}

/* ================= Horario semanal ================= */
function viewHorario() {
  const blocks = []; for (const s of S.subjects) for (const h of s.schedule || []) if (h && h.start && h.end) blocks.push({ s, d: +h.day, a: h.start, b: h.end, room: h.room || s.room || '' });
  const tm = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
  if (!blocks.length) return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Horario</h1><div class="empty"><h3>Aún no tienes clases en tu horario</h3><p>Agrega los días y horas dentro de cada materia y aparecerán aquí.</p><a class="btn primary" href="#/materias">Ir a Materias</a></div>`;
  const lo = Math.floor(Math.min(...blocks.map((x) => tm(x.a))) / 60) * 60; const hi = Math.ceil(Math.max(...blocks.map((x) => tm(x.b))) / 60) * 60; const PX = 0.9; const H = (hi - lo) * PX;
  const days = [1, 2, 3, 4, 5, 6].filter((d) => d !== 6 || blocks.some((x) => x.d === 6)); const now = new Date(); const nm = now.getHours() * 60 + now.getMinutes();
  const hours = []; for (let m = lo; m <= hi; m += 60) hours.push(m);
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Horario</h1><p class="page-sub">Tu semana de un vistazo. Toca una clase para abrir su materia.</p>
    <div class="es-hz" style="--n:${days.length};--H:${H}px"><div class="es-hz-h"><span></span>${days.map((d) => `<b class="${d === now.getDay() ? 'td' : ''}">${ES_DAYS[d]}</b>`).join('')}</div>
    <div class="es-hz-b"><div class="es-hz-t">${hours.map((m) => `<span style="top:${(m - lo) * PX}px">${m / 60}:00</span>`).join('')}</div>
    ${days.map((d) => `<div class="es-hz-c ${d === now.getDay() ? 'td' : ''}">${hours.map((m) => `<i style="top:${(m - lo) * PX}px"></i>`).join('')}${blocks.filter((x) => x.d === d).map((x) => `<a href="#/materia/${x.s.id}" class="es-blk" style="top:${(tm(x.a) - lo) * PX}px;height:${Math.max(24, (tm(x.b) - tm(x.a)) * PX - 2)}px;--c:${safeColor(x.s.color)}"><b>${esc(x.s.name)}</b><small>${fmtTime(x.a)}${x.room ? ' · ' + esc(x.room) : ''}</small></a>`).join('')}${d === now.getDay() && nm >= lo && nm <= hi ? `<u class="es-now" style="top:${(nm - lo) * PX}px"></u>` : ''}</div>`).join('')}</div></div>`;
}

/* ================= Ánimo ================= */
const ES_MOOD = [['😣', 'Muy mal', '#d9534f'], ['😕', 'Regular', '#e29a1c'], ['😐', 'Normal', '#c9c27a'], ['🙂', 'Bien', '#7fb069'], ['😄', 'Excelente', '#2f9e44']];
const ES_TIPS = ['Un día difícil no define tu semana. Haz solo lo más importante y descansa.', 'Respira hondo. Elige una sola tarea pequeña y empieza por ahí.', 'Ve a tu ritmo. Una pausa corta y agua pueden ayudar.', 'Buen día para avanzar con calma en lo pendiente.', '¡Aprovecha esa energía para lo que más te cuesta!'];
function viewAnimo() {
  const d = ESD(); const t = today(); const cur = d.mood[t]; const days = []; for (let i = 27; i >= 0; i--) days.push(addDays(t, -i));
  const vals = days.map((x) => d.mood[x]).filter(Boolean); const avg = vals.length ? vals.reduce((s, x) => s + x.m, 0) / vals.length : null;
  let streak = 0; for (let i = 0; i < 400; i++) { if (d.mood[addDays(t, -i)]) streak++; else if (i > 0) break; else break; }
  const first = fromISO(days[0]).getDay(); const pad = (first + 6) % 7;
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">¿Cómo estás?</h1><p class="page-sub">Un registro rápido cada día. Con el tiempo ves qué días te cuestan más y cuándo rindes mejor.</p>
    <div class="es-mood" role="group" aria-label="Estado de ánimo de hoy">${ES_MOOD.map(([e, l], i) => `<button type="button" class="${cur && cur.m === i ? 'on' : ''}" data-act="es-mood" data-v="${i}"><span>${e}</span><small>${l}</small></button>`).join('')}</div>
    ${cur ? `<p class="es-tip">${ES_TIPS[cur.m]}</p><div class="field"><label for="esMN">Una nota para ti (opcional)</label><input id="esMN" class="input" maxlength="140" value="${esc(cur.n || '')}" placeholder="¿Qué pasó hoy?"></div>` : ''}
    <div class="es-stats"><span><b>${avg === null ? '–' : (Math.round((avg + 1) * 10) / 10).toFixed(1)}</b>promedio (1–5)</span><span><b>${streak}</b>días seguidos</span><span><b>${vals.length}</b>de 28 días</span></div>
    <h2 class="sec">Últimos 28 días</h2><div class="es-cal">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((x) => `<small>${x}</small>`).join('')}${Array.from({ length: pad }, () => '<i class="e"></i>').join('')}${days.map((x) => { const m = d.mood[x]; return `<i title="${esc(x)}${m ? ' · ' + ES_MOOD[m.m][1] : ''}" style="${m ? `background:${ES_MOOD[m.m][2]}` : ''}" class="${x === t ? 'td' : ''}">${m ? ES_MOOD[m.m][0] : ''}</i>`; }).join('')}</div>`;
}

/* ================= Buscador ================= */
function esSearch(q) {
  const n = esNorm(q.trim()); if (n.length < 2) return [];
  const has = (...xs) => xs.some((x) => esNorm(x).includes(n)); const R = [];
  for (const t of S.tasks) if (has(t.title, t.desc)) R.push({ k: 'Tarea', t: t.title, s: `${esSubjName(t.subjectId)}${t.due ? ' · ' + relDay(t.due) : ''}${t.done ? ' · hecha' : ''}`, h: '#/tareas' });
  for (const s of S.subjects) if (has(s.name, s.teacher)) R.push({ k: 'Materia', t: s.name, s: s.teacher || '', h: `#/materia/${s.id}` });
  for (const x of S.notes) if (has(x.title, htmlText(x.body || ''))) R.push({ k: 'Apunte', t: x.title || 'Sin título', s: esSubjName(x.subjectId), h: `#/libretas/${x.subjectId || '_gen'}` });
  for (const p of S.pages || []) if (!p.deleted && has(p.title, p.text, (p.items || []).map((i) => i.t).join(' '))) R.push({ k: 'Libreta', t: p.title || (p.text || '').slice(0, 40) || 'Hoja', s: esSubjName(p.subjectId), h: `#/libretas/${p.subjectId || '_gen'}` });
  const d = ESD(); for (const c of d.cards) if (has(c.q, c.a)) R.push({ k: 'Tarjeta', t: c.q, s: c.a.slice(0, 60), h: '#/tarjetas' });
  for (const e of d.exams) if (has(e.title, (e.topics || []).map((x) => x.n).join(' '))) R.push({ k: 'Examen', t: e.title, s: relDay(e.date), h: '#/examenes' });
  return R.slice(0, 40);
}
function esFindHTML() {
  const R = esSearch(ES.find);
  if (ES.find.trim().length < 2) return '<p class="muted" style="text-align:center;margin-top:22px">Escribe al menos dos letras. Busco en tareas, materias, apuntes, libretas, tarjetas y exámenes.</p>';
  return R.length ? `<ul class="es-res">${R.map((r) => `<li><a href="${r.h}"><span class="k">${r.k}</span><span class="t"><b>${esc(r.t)}</b><small>${esc(r.s)}</small></span>${icon('chev', 'chev sm')}</a></li>`).join('')}</ul>` : '<p class="muted" style="text-align:center;margin-top:22px">No encontré nada con eso.</p>';
}
function viewBuscar() {
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Buscar</h1>
    <label class="lq-search"><span aria-hidden="true">${icon('search')}</span><input id="esFind" type="search" value="${esc(ES.find)}" placeholder="Tareas, apuntes, libretas, tarjetas…" autocomplete="off" aria-label="Buscar en toda la app"></label><div id="esFindRes">${esFindHTML()}</div>`;
}

/* ================= Rutas, menú y acciones ================= */
Object.assign(EXTRA_VIEWS, { tarjetas: viewTarjetas, examenes: viewExamenes, horario: viewHorario, animo: viewAnimo, buscar: viewBuscar });
['tarjetas', 'examenes', 'horario', 'animo', 'buscar'].forEach((k) => { EXTRA_NAV[k] = 'mas'; });
try { ['tarjetas', 'examenes', 'horario', 'animo', 'buscar'].forEach((k) => { if (typeof CL_ALLOWED !== 'undefined' && !CL_ALLOWED.includes(k)) CL_ALLOWED.push(k); }); } catch { /* */ }
{
  const baseMas = viewMas;
  viewMas = function () {
    const h = baseMas(); const due = (() => { try { return esDue(ESD()).length; } catch { return 0; } })();
    const row = (hr, ic, t, dsc) => `<li><a href="${hr}"><span class="ico">${icon(ic)}</span><span class="txt"><b>${t}</b><span>${esc(dsc)}</span></span>${icon('chev', 'chev')}</a></li>`;
    const mine = row('#/buscar', 'search', 'Buscar en todo', 'Tareas, apuntes, libretas, tarjetas y exámenes') + row('#/horario', 'cal', 'Horario semanal', 'Tus clases de la semana en una cuadrícula') + row('#/examenes', 'flag', 'Exámenes', 'Cuenta regresiva, temas y plan de estudio') + row('#/tarjetas', 'spark', 'Tarjetas de repaso', due ? `${due} para repasar hoy` : 'Repetición espaciada para memorizar') + row('#/animo', 'heart', 'Mi ánimo', 'Registro diario y calendario de colores');
    return h.replace('<li><a href="#/compartir"', mine + '<li><a href="#/compartir"');
  };
}
Object.assign(VIDA_ACTS, {
  'es-deck': (el) => { ES.deck = el.dataset.v; render(); },
  'es-add': () => esCardSheet(),
  'es-save': (el) => {
    const q = (document.getElementById('esQ').value || '').trim(); const a = (document.getElementById('esA').value || '').trim(); if (!q || !a) { toast('Escribe la pregunta y la respuesta.'); return; }
    esAddCards([{ q, a, sid: document.getElementById('esS').value }]); Snd.drop?.();
    if (el.dataset.more) { document.getElementById('esQ').value = ''; document.getElementById('esA').value = ''; document.getElementById('esQ').focus(); toast('Guardada.'); render(); } else { closeSheet(false); }
  },
  'es-bulk': () => openSheet(`${sheetHead('Pegar varias tarjetas')}<div class="sheet-body"><p class="tiny faint" style="margin:0 0 8px">Una por renglón: «Pregunta: respuesta» (también sirve «Pregunta - respuesta»).</p><div class="field"><textarea id="esBulk" class="input" rows="8" placeholder="Mitocondria: produce energía&#10;Ribosoma: fabrica proteínas"></textarea></div></div><div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="es-bulk-save">Agregar</button></div>`),
  'es-bulk-save': () => {
    const v = document.getElementById('esBulk')?.value || '';
    const arr = v.split(/\n/).map((l) => l.match(/^\s*([^:–-]{2,80}?)\s*[:–-]\s*(.{2,})$/)).filter(Boolean).map((m) => ({ q: m[1].trim(), a: m[2].trim(), sid: ES.deck && ES.deck !== '_' ? ES.deck : '' }));
    const n = esAddCards(arr); closeSheet(false); toast(n ? `${n} tarjetas agregadas.` : 'No encontré «pregunta: respuesta».'); render();
  },
  'es-lib': () => {
    let n = 0; const subs = [{ id: '_gen' }, ...S.subjects]; for (const s of subs) { try { n += esAddCards(lqDeck(s.id).map((c) => ({ q: c.q, a: c.a, sid: s.id === '_gen' ? '' : s.id }))); } catch { /* */ } }
    toast(n ? `${n} tarjetas traídas de tus libretas.` : 'No hay tarjetas nuevas en tus libretas.'); render();
  },
  'es-del': (el) => { const d = ESD(); d.cards = d.cards.filter((c) => c.id !== el.dataset.id); esSave(); render(); },
  'es-study': () => { const d = ESD(); const cards = esDue(d).filter((c) => !ES.deck || (c.sid || '_') === ES.deck).sort(() => Math.random() - 0.5).slice(0, 30); ES.q = { cards, i: 0, ok: 0 }; ES.flip = false; render(); },
  'es-flip': () => { ES.flip = !ES.flip; document.querySelector('.lq-card')?.classList.toggle('flip', ES.flip); document.querySelector('.es-grade')?.classList.toggle('on', ES.flip); Snd.tick?.(); },
  'es-rate': (el) => {
    const q = ES.q; if (!q) return; const v = +el.dataset.v; const c = q.cards[q.i]; const d = ESD(); const real = d.cards.find((x) => x.id === c.id); if (real) {
      const b = real.box || 1; const nb = v === 0 ? 1 : v === 1 ? Math.max(1, b - 0) : v === 2 ? Math.min(6, b + 1) : Math.min(6, b + 2);
      real.box = nb; real.due = addDays(today(), v === 0 ? 0 : ES_INT[nb]); if (v === 0) real.due = today();
      if (v === 0) q.cards.push(c);
    }
    if (v > 0) q.ok++; q.i++; ES.flip = false; esSave(); if (q.i >= q.cards.length) { try { waterToday(); } catch { /* */ } } Snd.pop ? Snd.pop() : Snd.tick?.(); render();
  },
  'es-end': () => { ES.q = null; ES.flip = false; render(); },
  'es-ex-new': () => esExSheet(),
  'es-ex-save': () => {
    const v = (id) => (document.getElementById(id)?.value || '').trim(); const title = v('exT'); const date = v('exD'); if (!title || !date) { toast('Pon un nombre y una fecha.'); return; }
    const d = ESD(); d.exams.push({ id: esId('ex'), title, date, sid: v('exS'), topics: v('exP').split('\n').map((x) => x.trim()).filter(Boolean).map((n) => ({ n, done: false })) }); esSave(); closeSheet(false); Snd.drop?.(); render();
  },
  'es-ex-del': async (el) => { if (!(await ask({ title: '¿Quitar este examen?', ok: 'Quitar', danger: true }))) return; const d = ESD(); d.exams = d.exams.filter((e) => e.id !== el.dataset.id); esSave(); render(); },
  'es-tp': (el) => { const d = ESD(); const e = d.exams.find((x) => x.id === el.dataset.id); if (e && e.topics[+el.dataset.i]) { e.topics[+el.dataset.i].done = !e.topics[+el.dataset.i].done; esSave(); Snd.pop ? Snd.pop() : Snd.tick?.(); render(); } },
  'es-tp-add': async (el) => { const v = await ask({ title: 'Agregar temas', text: 'Uno por renglón o separados por coma.', input: { placeholder: 'Genética, Evolución' }, ok: 'Agregar' }); if (!v) return; const d = ESD(); const e = d.exams.find((x) => x.id === el.dataset.id); if (!e) return; String(v).split(/[\n,]/).map((x) => x.trim()).filter(Boolean).forEach((n) => e.topics.push({ n, done: false })); esSave(); render(); },
  'es-plan-tasks': (el) => {
    const d = ESD(); const e = d.exams.find((x) => x.id === el.dataset.id); if (!e) return; const plan = esPlan(e); if (!plan.length) return;
    commit((s) => { for (const p of plan) s.tasks.push({ id: uid(), title: `Estudiar: ${p.items.map((x) => x.t.n).join(', ')}`.slice(0, 120), subjectId: e.sid || null, type: 'tarea', due: p.date, time: '', priority: 2, value: null, estimate: 0, desc: `Plan para «${e.title}»`, steps: [], delivery: '', links: '', done: false, doneAt: null, grade: null, created: Date.now() }); });
    toast(`${plan.length} tareas creadas en tu lista.`); Snd.chime?.();
  },
  'es-mood': (el) => { const d = ESD(); const t = today(); d.mood[t] = { m: +el.dataset.v, n: (d.mood[t] || {}).n || '' }; esSave(); Snd.pop ? Snd.pop() : Snd.tick?.(); render(); },
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'esFind') { ES.find = e.target.value; const b = document.getElementById('esFindRes'); if (b) b.innerHTML = esFindHTML(); }
  else if (e.target.id === 'esMN') { const d = ESD(); const m = d.mood[today()]; if (m) { m.n = e.target.value; clearTimeout(esMN); esMN = setTimeout(esSave, 600); } }
});
let esMN = 0;
document.addEventListener('keydown', (e) => {
  const tag = (e.target.tagName || '').toLowerCase(); const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
  if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey)) { e.preventDefault(); location.hash = '#/buscar'; setTimeout(() => document.getElementById('esFind')?.focus(), 200); }
});
window.addEventListener('hashchange', () => { if (!/^#\/tarjetas/.test(location.hash)) { ES.q = null; ES.flip = false; } });
