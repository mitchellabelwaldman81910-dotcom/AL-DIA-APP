/* Cinnavia 8.2 — Mi aula 2 (docentes): rúbricas con calificación automática, diario de clase, mensajes listos para
   familias, reportes con boletines imprimibles, banco de preguntas y exámenes con versiones A/B, mapa de lugares,
   fechas importantes con cuenta regresiva, semáforo de clase, dados y orden de exposiciones.
   Todo vive dentro del grupo (S.aula) y se sincroniza igual que lo demás. */
'use strict';
const A2 = { rub: null, seat: null, msg: { al: '', tp: 'faltas' }, ex: null };
const a2G = () => auGroup();
const a2Edit = (fn) => { const g = a2G(); if (g) aupEdit(g.id, (gg) => { a2Ext(gg); fn(gg); }); };
const a2Ext = (g) => { aupG(g); g.rub ||= { list: [], ev: {} }; g.diario ||= []; g.banco ||= []; g.seats ||= { r: 5, c: 6, map: {} }; g.foco ||= {}; g.fechas ||= []; return g; };
const a2Id = (p) => p + uid().replace(/[^a-z0-9]/gi, '').slice(0, 8);
const a2First = (n) => String(n || '').trim().split(/\s+/)[0] || '';
const a2Shuf = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const a2Copy = async (t, ok = 'Copiado.') => { try { await navigator.clipboard.writeText(t); toast(ok); } catch { toast('No se pudo copiar.'); } };
function a2Print(title, html) {
  const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'; document.body.appendChild(f);
  const d = f.contentDocument; d.open(); d.write(`<!doctype html><meta charset="utf-8"><title>${esc(title)}</title><style>body{font:13px/1.45 Georgia,serif;color:#111;margin:22px}h1{font-size:18px;margin:0 0 4px}h2{font-size:14px;margin:14px 0 4px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #888;padding:4px 7px;text-align:left}.pg{page-break-after:always}.q{margin:10px 0}.o{margin:2px 0 2px 18px}.ln{border-bottom:1px solid #444;height:22px}.meta{display:flex;gap:18px;margin:8px 0 14px}.meta span{flex:1;border-bottom:1px solid #444;padding-bottom:2px}</style>${html}`); d.close();
  setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch { toast('No se pudo abrir la impresión.'); } setTimeout(() => f.remove(), 60000); }, 350);
}
const a2Prom = (g, id) => auAvg(g, id);
const a2Doc = () => esc((S.settings && S.settings.name) || '');

/* ================= Rúbricas ================= */
const A2_LV = [['Excelente', 10], ['Bueno', 8.5], ['Suficiente', 7], ['Insuficiente', 5]];
const A2_RT = {
  exposicion: ['Exposición oral', ['Dominio del tema', 'Claridad y volumen de voz', 'Material de apoyo', 'Manejo del tiempo']],
  ensayo: ['Ensayo o redacción', ['Idea central', 'Organización', 'Argumentos y fuentes', 'Ortografía y redacción']],
  proyecto: ['Proyecto', ['Planeación y objetivo', 'Desarrollo y evidencias', 'Creatividad', 'Presentación final']],
  equipo: ['Trabajo en equipo', ['Participación', 'Responsabilidad', 'Comunicación', 'Resultado del equipo']],
  cuaderno: ['Cuaderno o portafolio', ['Está completo', 'Orden y limpieza', 'Ortografía', 'Entrega a tiempo']],
};
const a2RubScore = (sel, n) => { let t = 0, c = 0; for (let i = 0; i < n; i++) { if (sel && sel[i] != null) { t += A2_LV[sel[i]][1]; c++; } } return c ? t / c : null; };
function a2RubTab(g) {
  a2Ext(g);
  const list = g.rub.list;
  return `<p class="tiny faint" style="margin:0 0 8px">Crea una rúbrica, evalúa a cada estudiante con un toque por criterio y la calificación se calcula sola. Puedes pasarla a Calificaciones.</p>
    <p><button class="btn primary" data-act="a2-rub-new">${icon('plus', 'sm')}Nueva rúbrica</button></p>
    ${list.length ? list.map((r) => { const done = g.alumnos.filter((a) => (g.rub.ev[r.id] || {})[a.id]).length; return `<div class="a2-card"><div><b>${esc(r.name)}</b><small>${r.crit.length} criterios · ${done}/${g.alumnos.length} evaluados</small></div><div class="a2-act"><button class="btn primary" data-act="a2-rub-eval" data-id="${r.id}" ${g.alumnos.length ? '' : 'disabled'}>Evaluar</button><button class="icon-btn ghost" data-act="a2-rub-del" data-id="${r.id}" aria-label="Quitar rúbrica">${icon('trash', 'sm')}</button></div></div>`; }).join('') : '<div class="empty"><h3>Sin rúbricas</h3><p>Elige una plantilla (exposición, ensayo, proyecto…) y adáptala.</p></div>'}`;
}
function a2RubPaint() {
  const g = a2G(); const R = A2.rub; if (!g || !R) return; const r = g.rub.list.find((x) => x.id === R.rid); const box = document.getElementById('a2Rb'); if (!r || !box) return;
  const sc = a2RubScore(R.sel, r.crit.length);
  box.innerHTML = r.crit.map((c, i) => `<div class="a2-cr"><b>${esc(c)}</b><div class="a2-lv">${A2_LV.map(([l, p], j) => `<button type="button" data-act="a2-rub-pick" data-i="${i}" data-j="${j}" aria-pressed="${R.sel[i] === j}" class="lv${j}">${l}<small>${p}</small></button>`).join('')}</div></div>`).join('') + `<p class="a2-total">Calificación: <b>${sc === null ? '–' : (Math.round(sc * 10) / 10).toFixed(1)}</b></p>`;
}
function a2RubOpen(rid, alId) {
  const g = a2G(); a2Ext(g); const r = g.rub.list.find((x) => x.id === rid); if (!r) return;
  alId = alId || (A2.rub && A2.rub.rid === rid && A2.rub.al) || g.alumnos[0].id;
  A2.rub = { rid, al: alId, sel: { ...((g.rub.ev[rid] || {})[alId] || {}) } };
  const idx = g.alumnos.findIndex((a) => a.id === alId);
  const html = `${sheetHead(esc(r.name))}<div class="sheet-body"><div class="field"><label for="a2Al">Estudiante</label><select id="a2Al" class="input">${g.alumnos.map((a) => `<option value="${a.id}" ${a.id === alId ? 'selected' : ''}>${esc(a.name)}${(g.rub.ev[rid] || {})[a.id] ? ' ✓' : ''}</option>`).join('')}</select></div><div id="a2Rb"></div></div>
    <div class="sheet-foot"><button class="btn" data-act="a2-rub-next">Guardar y siguiente</button><span class="grow"></span><button class="btn primary" data-act="a2-rub-save">Guardar y pasar a calificaciones</button></div>`;
  if (sheet().open) { sheet().querySelector('.sheet-body').outerHTML = html.slice(html.indexOf('<div class="sheet-body">'), html.indexOf('<div class="sheet-foot">')); } else openSheet(html);
  a2RubPaint(); void idx;
}
function a2RubSave(toGrades) {
  const g = a2G(); const R = A2.rub; if (!g || !R) return false; const r = g.rub.list.find((x) => x.id === R.rid); const sc = a2RubScore(R.sel, r.crit.length);
  if (sc === null) { toast('Marca al menos un criterio.'); return false; }
  a2Edit((gg) => {
    (gg.rub.ev[R.rid] ||= {})[R.al] = { ...R.sel };
    if (toGrades) { let act = gg.acts.find((a) => a.rub === R.rid); if (!act) { act = { id: 'ac' + uid(), name: `Rúbrica: ${r.name}`.slice(0, 50), w: '', max: 10, due: '', rub: R.rid }; gg.acts.push(act); } (gg.notas[R.al] ||= {})[act.id] = { ent: 'si', pts: String(Math.round(sc * 10) / 10) }; }
  });
  return true;
}

/* ================= Diario de clase ================= */
function a2DiaTab(g) {
  a2Ext(g); const L = g.diario.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return `<p class="tiny faint" style="margin:0 0 8px">Anota lo que vieron, la tarea y lo que falta. Así sabes dónde te quedaste en cada grupo.</p>
    <div class="tp-row"><button class="btn primary" data-act="a2-dia-new">${icon('plus', 'sm')}Anotar clase de hoy</button>${L.length ? '<button class="btn" data-act="a2-dia-copy">Copiar resumen</button>' : ''}</div>
    ${L.length ? `<ol class="a2-tl">${L.map((e) => `<li><time>${esc(relDay(e.date))}</time><b>${esc(e.tema || 'Clase')}</b>${e.tarea ? `<p><em>Tarea:</em> ${esc(e.tarea)}</p>` : ''}${e.nota ? `<p class="faint">${esc(e.nota)}</p>` : ''}<span class="a2-act"><button class="link-btn" data-act="a2-dia-edit" data-id="${e.id}">Editar</button><button class="link-btn" data-act="a2-dia-del" data-id="${e.id}">Quitar</button></span></li>`).join('')}</ol>` : '<div class="empty"><h3>Aún no hay registros</h3><p>Anota tu primera clase.</p></div>'}`;
}
function a2DiaSheet(e) {
  const isNew = !e; e = e || { id: a2Id('di'), date: today(), tema: '', tarea: '', nota: '' };
  openSheet(`${sheetHead(isNew ? 'Clase de hoy' : 'Editar registro')}<div class="sheet-body"><div class="field"><label for="a2dD">Fecha</label><input id="a2dD" type="date" class="input" value="${e.date}"></div>
    <div class="field"><label for="a2dT">Tema visto</label><input id="a2dT" class="input" value="${esc(e.tema)}" maxlength="120"></div>
    <div class="field"><label for="a2dH">Tarea o actividad que dejaste</label><input id="a2dH" class="input" value="${esc(e.tarea)}" maxlength="160"></div>
    <div class="field"><label for="a2dN">Pendientes o notas</label><textarea id="a2dN" class="input" rows="3">${esc(e.nota)}</textarea></div></div>
    <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="a2-dia-save" data-id="${e.id}">Guardar</button></div>`);
}

/* ================= Mensajes para familias ================= */
const A2_MSG = {
  faltas: ['Faltas seguidas', 'Buen día. Le escribo para informarle que {alumno} ({grupo}) acumula {faltas} faltas en {materia}. Me gustaría conocer si hay algo en lo que podamos apoyar. Quedo atenta(o) a su respuesta. Gracias. — {docente}'],
  riesgo: ['Bajo rendimiento', 'Buen día. {alumno} lleva un promedio de {promedio} en {materia} y está en riesgo de no acreditar. Con entregar sus actividades pendientes y reforzar en casa puede mejorar. Con gusto le doy seguimiento. — {docente}'],
  felicita: ['Felicitación', '¡Buenas noticias! Quiero felicitar a {alumno} por su esfuerzo en {materia}: su promedio es {promedio} y su participación ha sido muy buena. Gracias por su apoyo. — {docente}'],
  tarea: ['Tarea pendiente', 'Buen día. Le recuerdo que {alumno} tiene actividades pendientes de entrega en {materia}. Pueden entregarlas en la próxima clase. Gracias. — {docente}'],
  junta: ['Citatorio a reunión', 'Buen día. Le invito a una breve reunión para hablar del avance de {alumno} ({grupo}). Dígame qué día y hora le acomoda. Gracias. — {docente}'],
  aviso: ['Aviso al grupo', 'Aviso para {grupo}: recuerden traer su material para la próxima clase de {materia}. Cualquier duda me escriben. — {docente}'],
};
function a2MsgFill(g, tp, al) {
  const s = aupAsisStats(g, al ? al.id : ''); const pr = al ? a2Prom(g, al.id) : null;
  return A2_MSG[tp][1].replace(/\{alumno\}/g, al ? al.name : 'el grupo').replace(/\{grupo\}/g, g.name).replace(/\{materia\}/g, g.materia).replace(/\{faltas\}/g, String(s.f || 0)).replace(/\{promedio\}/g, auFmt(pr)).replace(/\{docente\}/g, (S.settings && S.settings.name) || 'Su docente');
}
function a2MsgTab(g) {
  a2Ext(g); if (!g.alumnos.length) return '<p class="tiny faint">Primero agrega alumnos en la pestaña Alumnos.</p>';
  const al = g.alumnos.find((a) => a.id === A2.msg.al) || (A2.msg.tp === 'aviso' ? null : g.alumnos[0]); if (al) A2.msg.al = al.id;
  const txt = A2.msg.text != null && A2.msg.keep === A2.msg.tp + (al ? al.id : '') ? A2.msg.text : a2MsgFill(g, A2.msg.tp, al);
  return `<p class="tiny faint" style="margin:0 0 8px">Elige un modelo y un estudiante: el mensaje se llena con sus datos reales. Edítalo si quieres y mándalo por WhatsApp o cópialo.</p>
    <div class="dn-seg" style="margin-bottom:8px">${Object.entries(A2_MSG).map(([k, [l]]) => `<button type="button" class="chip${A2.msg.tp === k ? ' on' : ''}" data-act="a2-msg-tp" data-v="${k}" aria-pressed="${A2.msg.tp === k}">${l}</button>`).join('')}</div>
    ${A2.msg.tp === 'aviso' ? '' : `<div class="field"><label for="a2mA">Estudiante</label><select id="a2mA" class="input">${g.alumnos.map((a) => `<option value="${a.id}" ${al && a.id === al.id ? 'selected' : ''}>${esc(a.name)}</option>`).join('')}</select></div>`}
    <div class="field"><label for="a2mT">Mensaje</label><textarea id="a2mT" class="input" rows="6">${esc(txt)}</textarea></div>
    <div class="tp-row"><button class="btn primary" data-act="a2-msg-wa">${icon('share', 'sm')}WhatsApp</button><button class="btn" data-act="a2-msg-copy">Copiar</button><button class="btn" data-act="a2-msg-share">Compartir…</button></div>`;
}

/* ================= Reportes y boletines ================= */
const A2_FOCO = { r: ['🔴', 'Necesita apoyo'], y: ['🟡', 'Observar'], g: ['🟢', 'Destacada(o)'] };
function a2RepData(g) {
  const rows = g.alumnos.map((a) => ({ a, avg: a2Prom(g, a.id), as: aupAsisStats(g, a.id), pt: g.part[a.id] || 0, fo: g.foco[a.id] || '' }));
  const w = rows.filter((r) => r.avg !== null); const bins = [0, 0, 0, 0, 0, 0]; w.forEach((r) => { const v = r.avg; bins[v < 5 ? 0 : v < 6 ? 1 : v < 7 ? 2 : v < 8 ? 3 : v < 9 ? 4 : 5]++; });
  const pass = w.filter((r) => r.avg >= auPass()).length;
  return { rows, w, bins, pass, mean: w.length ? w.reduce((s, r) => s + r.avg, 0) / w.length : null };
}
function a2RepTab(g) {
  a2Ext(g); if (!g.alumnos.length) return '<p class="tiny faint">Primero agrega alumnos en la pestaña Alumnos.</p>';
  const D = a2RepData(g); const mx = Math.max(1, ...D.bins); const names = ['<5', '5', '6', '7', '8', '9–10'];
  const sorted = D.rows.slice().sort((a, b) => (b.avg ?? -1) - (a.avg ?? -1));
  return `<div class="au-sum"><span><b>${auFmt(D.mean)}</b><small>promedio</small></span><span><b>${D.w.length ? Math.round((D.pass / D.w.length) * 100) + '%' : '–'}</b><small>aprueban</small></span><span><b>${D.rows.filter((r) => r.fo === 'r').length}</b><small>necesitan apoyo</small></span></div>
    <h4 class="tp-h" style="margin-top:12px">Distribución de calificaciones</h4><div class="a2-hist">${D.bins.map((n, i) => `<div><i style="height:${Math.round((n / mx) * 70) + 4}px" class="${i < 2 ? 'lo' : ''}"></i><b>${n}</b><small>${names[i]}</small></div>`).join('')}</div>
    <h4 class="tp-h" style="margin-top:12px">Seguimiento por estudiante</h4>
    <ul class="a2-rk">${sorted.map((r, i) => `<li><span class="n">${i + 1}</span><span class="nm">${esc(r.a.name)}<small>${r.as.pct === null ? 'sin lista' : r.as.pct + '% asistencia'} · ${r.pt} pts participación</small></span><b class="${r.avg !== null && r.avg < auPass() ? 'lo' : ''}">${auFmt(r.avg)}</b><button type="button" class="a2-fo" data-act="a2-foco" data-a="${r.a.id}" aria-label="Semáforo de ${esc(r.a.name)}" title="${r.fo ? A2_FOCO[r.fo][1] : 'Sin marcar'}">${r.fo ? A2_FOCO[r.fo][0] : '⚪'}</button></li>`).join('')}</ul>
    <div class="tp-row" style="margin-top:12px"><button class="btn primary" data-act="a2-boletin">🖨️ Boletines para imprimir</button><button class="btn" data-act="a2-rep-copy">Copiar reporte</button><button class="btn" data-act="a2-rep-csv">Descargar CSV</button></div>`;
}
function a2Boletin(g) {
  const pages = g.alumnos.map((a) => {
    const s = aupAsisStats(g, a.id); const rows = g.acts.map((ac) => { const r = (g.notas[a.id] || {})[ac.id]; const sc = auScore(ac, r); return `<tr><td>${esc(ac.name)}</td><td>${r && r.ent === 'no' ? 'No entregó' : sc === null ? 'Pendiente' : auFmt(sc)}</td></tr>`; }).join('');
    const obs = (g.obs[a.id] || []).slice(-4).map((o) => `<li>${esc(o.t || o.text || '')}</li>`).join('');
    return `<div class="pg"><h1>Boletín de avance</h1><div>${esc(g.materia)} · ${esc(g.name)}</div><h2>${esc(a.name)}</h2><table><tr><th>Actividad</th><th>Calificación</th></tr>${rows}<tr><th>Promedio</th><th>${auFmt(a2Prom(g, a.id))}</th></tr></table><h2>Asistencia</h2><div>${s.tot ? `${s.pct}% · ${s.f} faltas · ${s.r} retardos` : 'Sin registro'}</div>${obs ? `<h2>Observaciones</h2><ul>${obs}</ul>` : ''}<h2>Participación</h2><div>${g.part[a.id] || 0} puntos</div><p style="margin-top:30px">Docente: ${a2Doc() || '______________'}</p><p>Firma de enterado(a): ______________________</p></div>`;
  }).join('');
  a2Print(`Boletines ${g.name}`, pages);
}

/* ================= Banco de preguntas y exámenes ================= */
const A2_QT = { op: 'Opción múltiple', vf: 'Verdadero o falso', ab: 'Pregunta abierta' };
function a2ExTab(g) {
  a2Ext(g);
  return `<p class="tiny faint" style="margin:0 0 8px">Guarda tus preguntas una vez y arma exámenes cuando quieras, con versiones A y B (cambian el orden) y hoja de respuestas.</p>
    <div class="tp-row"><button class="btn primary" data-act="a2-q-new">${icon('plus', 'sm')}Agregar pregunta</button><button class="btn" data-act="a2-ex-make" ${g.banco.length ? '' : 'disabled'}>🖨️ Armar examen</button></div>
    ${g.banco.length ? `<ol class="a2-qs">${g.banco.map((q) => `<li><span class="tag">${A2_QT[q.type]}</span><b>${esc(q.q)}</b>${q.type === 'op' ? `<small>${q.opts.map((o, i) => `${'ABCD'[i]}) ${esc(o)}${i === q.ans ? ' ✓' : ''}`).join('  ')}</small>` : q.type === 'vf' ? `<small>Respuesta: ${q.ans ? 'Verdadero' : 'Falso'}</small>` : ''}<button class="link-btn" data-act="a2-q-del" data-id="${q.id}">Quitar</button></li>`).join('')}</ol>` : '<div class="empty"><h3>Banco vacío</h3><p>Agrega tus primeras preguntas.</p></div>'}`;
}
function a2QSheet() {
  openSheet(`${sheetHead('Nueva pregunta')}<div class="sheet-body"><div class="field"><label for="a2qT">Tipo</label><select id="a2qT" class="input">${Object.entries(A2_QT).map(([k, l]) => `<option value="${k}">${l}</option>`).join('')}</select></div>
    <div class="field"><label for="a2qQ">Pregunta</label><textarea id="a2qQ" class="input" rows="3"></textarea></div>
    <div id="a2qO"><div class="field"><label>Opciones (marca la correcta)</label>${[0, 1, 2, 3].map((i) => `<div class="a2-opt"><input type="radio" name="a2qA" value="${i}" ${i === 0 ? 'checked' : ''} aria-label="Correcta ${'ABCD'[i]}"><input class="input" id="a2qO${i}" placeholder="Opción ${'ABCD'[i]}" maxlength="120"></div>`).join('')}</div></div></div>
    <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="a2-q-save">Guardar</button></div>`);
  const t = document.getElementById('a2qT'); t.addEventListener('change', () => {
    const o = document.getElementById('a2qO'); o.innerHTML = t.value === 'op' ? `<div class="field"><label>Opciones (marca la correcta)</label>${[0, 1, 2, 3].map((i) => `<div class="a2-opt"><input type="radio" name="a2qA" value="${i}" ${i === 0 ? 'checked' : ''} aria-label="Correcta ${'ABCD'[i]}"><input class="input" id="a2qO${i}" placeholder="Opción ${'ABCD'[i]}" maxlength="120"></div>`).join('')}</div>` : t.value === 'vf' ? '<div class="field"><label>Respuesta correcta</label><label><input type="radio" name="a2qA" value="1" checked> Verdadero</label> <label><input type="radio" name="a2qA" value="0"> Falso</label></div>' : '';
  });
}
function a2ExamHTML(g, qs, ver, key) {
  const body = qs.map((q, n) => {
    if (q.type === 'op') { const ord = ver === 'B' ? a2Shuf(q.opts.map((o, i) => i)) : q.opts.map((o, i) => i); return `<div class="q"><b>${n + 1}. ${esc(q.q)}</b>${ord.map((oi, k) => `<div class="o">${'ABCD'[k]}) ${esc(q.opts[oi])}${key && oi === q.ans ? ' ✓' : ''}</div>`).join('')}</div>`; }
    if (q.type === 'vf') return `<div class="q"><b>${n + 1}. ${esc(q.q)}</b><div class="o">( ) Verdadero &nbsp; ( ) Falso${key ? ` — ${q.ans ? 'Verdadero' : 'Falso'}` : ''}</div></div>`;
    return `<div class="q"><b>${n + 1}. ${esc(q.q)}</b><div class="ln"></div><div class="ln"></div><div class="ln"></div></div>`;
  }).join('');
  return `<div class="pg"><h1>${esc(g.materia)} — Examen${ver ? ' · Versión ' + ver : ''}${key ? ' · CLAVE' : ''}</h1><div class="meta"><span>Nombre:</span><span>Grupo: ${esc(g.name)}</span><span>Fecha:</span><span>Calif.:</span></div>${body}</div>`;
}

/* ================= Lugares ================= */
function a2SeatTab(g) {
  a2Ext(g); const S0 = g.seats; if (!g.alumnos.length) return '<p class="tiny faint">Primero agrega alumnos en la pestaña Alumnos.</p>';
  const by = {}; Object.entries(S0.map).forEach(([i, id]) => { by[id] = +i; });
  const cells = []; for (let i = 0; i < S0.r * S0.c; i++) { const id = S0.map[i]; const al = id && g.alumnos.find((a) => a.id === id); const fo = al && g.foco[al.id]; cells.push(`<button type="button" class="a2-seat ${al ? 'has' : ''} ${A2.seat === i ? 'sel' : ''}" data-act="a2-seat" data-i="${i}" aria-label="Lugar ${i + 1}${al ? ': ' + esc(al.name) : ' vacío'}">${al ? `<span>${esc(a2First(al.name))}</span><small>${esc(String(al.name).trim().split(/\s+/).slice(1, 2).join('').slice(0, 1))}.</small>${fo ? `<i>${A2_FOCO[fo][0]}</i>` : ''}` : ''}</button>`); }
  const un = g.alumnos.filter((a) => by[a.id] === undefined);
  return `<div class="tp-row" style="align-items:center;gap:8px"><label class="tiny" for="a2sR">Filas</label><input id="a2sR" type="number" min="2" max="10" class="input" value="${S0.r}" style="max-width:64px"><label class="tiny" for="a2sC">Columnas</label><input id="a2sC" type="number" min="2" max="10" class="input" value="${S0.c}" style="max-width:64px"></div>
    <p class="tiny faint" style="margin:8px 0">Pizarrón arriba. Toca un lugar y luego otro para cambiarlos de sitio. ${un.length ? `Sin lugar: ${un.length}.` : ''}</p>
    <div class="a2-board">Pizarrón</div><div class="a2-seats" style="--c:${S0.c}">${cells.join('')}</div>
    <div class="tp-row" style="margin-top:10px"><button class="btn primary" data-act="a2-seat-rand">🎲 Al azar</button><button class="btn" data-act="a2-seat-abc">A–Z</button><button class="btn" data-act="a2-seat-clear">Limpiar</button><button class="btn" data-act="a2-seat-print">🖨️ Imprimir</button></div>`;
}
function a2SeatFill(g, order) {
  const S0 = g.seats; const n = S0.r * S0.c; S0.map = {}; order.slice(0, n).forEach((a, i) => { S0.map[i] = a.id; });
}

/* ================= Fechas importantes ================= */
const A2_FK = { examen: ['📝', 'Examen'], entrega: ['📥', 'Entrega'], junta: ['👥', 'Junta'], evento: ['🎉', 'Evento'] };
const a2Days = (iso) => Math.round((new Date(iso + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5);
const a2When = (n) => (n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : n < 0 ? `Hace ${-n} d` : `En ${n} d`);
function a2FeTab(g) {
  a2Ext(g); const L = g.fechas.slice().sort((a, b) => a.date.localeCompare(b.date)); const up = L.filter((x) => a2Days(x.date) >= 0); const past = L.filter((x) => a2Days(x.date) < 0).slice(-4);
  const row = (x) => `<li class="${a2Days(x.date) < 0 ? 'past' : a2Days(x.date) <= 2 ? 'soon' : ''}"><span class="e">${A2_FK[x.kind][0]}</span><span class="t"><b>${esc(x.t)}</b><small>${esc(relDay(x.date))} · ${A2_FK[x.kind][1]}</small></span><em>${a2When(a2Days(x.date))}</em><button class="icon-btn ghost" data-act="a2-fe-del" data-id="${x.id}" aria-label="Quitar">${icon('trash', 'sm')}</button></li>`;
  return `<p><button class="btn primary" data-act="a2-fe-new">${icon('plus', 'sm')}Agregar fecha</button></p>
    ${up.length ? `<ul class="a2-fe">${up.map(row).join('')}</ul>` : '<div class="empty"><h3>Sin fechas próximas</h3><p>Anota exámenes, entregas y juntas para ver la cuenta regresiva.</p></div>'}
    ${past.length ? `<h4 class="tp-h" style="margin-top:12px">Pasadas</h4><ul class="a2-fe">${past.map(row).join('')}</ul>` : ''}`;
}
function a2FeSheet() {
  openSheet(`${sheetHead('Nueva fecha')}<div class="sheet-body"><div class="field"><label for="a2fT">Qué es</label><input id="a2fT" class="input" maxlength="80" placeholder="Ej. Examen del bloque 2"></div>
    <div class="field"><label for="a2fD">Fecha</label><input id="a2fD" type="date" class="input" value="${addDays(today(), 7)}"></div>
    <div class="field"><label for="a2fK">Tipo</label><select id="a2fK" class="input">${Object.entries(A2_FK).map(([k, [e, l]]) => `<option value="${k}">${e} ${l}</option>`).join('')}</select></div></div>
    <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="a2-fe-save">Guardar</button></div>`);
}

/* ================= Herramientas extra ================= */
function a2Herr(g) {
  const base = aupHerr(g);
  const extra = `<section class="aup-tool"><h4>🚦 Semáforo de la clase</h4><p class="tiny faint">Pantalla completa para proyectar: verde trabajo libre, amarillo en voz baja, rojo silencio.</p><div class="tp-row"><button class="btn" data-act="a2-sem">Abrir semáforo</button></div></section>
    <section class="aup-tool"><h4>🎲 Dado, moneda y número</h4><div class="tp-row"><button class="btn" data-act="a2-dado" data-k="6">Dado</button><button class="btn" data-act="a2-dado" data-k="coin">Moneda</button><button class="btn" data-act="a2-dado" data-k="100">1–100</button></div><div class="aup-wheel" id="a2Dado">—</div></section>
    <section class="aup-tool"><h4>🎤 Orden de exposiciones</h4><p class="tiny faint">Sortea el orden de todo el grupo y cópialo.</p><div class="tp-row"><button class="btn primary" data-act="a2-orden" ${g.alumnos.length ? '' : 'disabled'}>Sortear orden</button></div><ol class="a2-ord" id="a2Ord"></ol></section>`;
  return base.replace(/<\/div>\s*$/, extra + '</div>');
}

/* ================= Integración con las pestañas ================= */
Object.assign(AUP_TABS, { rub: ['Rúbricas', a2RubTab], dia: ['Diario', a2DiaTab], msg: ['Mensajes', a2MsgTab], rep: ['Reportes', a2RepTab], ex: ['Exámenes', a2ExTab], lug: ['Lugares', a2SeatTab], fe: ['Fechas', a2FeTab] });
AUP_TABS.herr = ['Herramientas', a2Herr];

/* ---------- Acciones ---------- */
Object.assign(VIDA_ACTS, {
  'a2-rub-new': async () => {
    const v = await ask({ title: 'Plantilla de rúbrica', options: [...Object.entries(A2_RT).map(([k, [l]]) => ({ value: k, label: l })), { value: '_blank', label: 'En blanco (yo escribo los criterios)' }] }); if (!v) return;
    let name, crit;
    if (v === '_blank') { const t = await ask({ title: 'Criterios', text: 'Escribe los criterios separados por coma.', input: { placeholder: 'Ej. Orden, Contenido, Ortografía' }, ok: 'Crear' }); if (!t) return; crit = String(t).split(',').map((x) => x.trim()).filter(Boolean).slice(0, 8); if (!crit.length) return; name = 'Mi rúbrica'; }
    else { name = A2_RT[v][0]; crit = A2_RT[v][1].slice(); }
    a2Edit((g) => { g.rub.list.push({ id: a2Id('ru'), name, crit }); }); toast('Rúbrica lista.'); Snd.drop?.();
  },
  'a2-rub-del': async (el) => { if (!(await ask({ title: '¿Quitar esta rúbrica?', text: 'También se quitan sus evaluaciones.', ok: 'Quitar', danger: true }))) return; a2Edit((g) => { g.rub.list = g.rub.list.filter((r) => r.id !== el.dataset.id); delete g.rub.ev[el.dataset.id]; }); },
  'a2-rub-eval': (el) => a2RubOpen(el.dataset.id),
  'a2-rub-pick': (el) => { const R = A2.rub; if (!R) return; R.sel[+el.dataset.i] = +el.dataset.j; a2RubPaint(); Snd.tick?.(); },
  'a2-rub-save': () => { if (a2RubSave(true)) { closeSheet(false); toast('Guardada y enviada a Calificaciones.'); Snd.chime?.(); } },
  'a2-rub-next': () => { const g = a2G(); const R = A2.rub; if (!a2RubSave(false)) return; const i = g.alumnos.findIndex((a) => a.id === R.al); const nx = g.alumnos[i + 1]; if (nx) { a2RubOpen(R.rid, nx.id); toast('Guardada.'); } else { closeSheet(false); toast('Última evaluación guardada.'); } },
  'a2-dia-new': () => a2DiaSheet(),
  'a2-dia-edit': (el) => { const e = a2G().diario.find((x) => x.id === el.dataset.id); if (e) a2DiaSheet(e); },
  'a2-dia-save': (el) => { const v = (id) => (document.getElementById(id)?.value || '').trim(); const e = { id: el.dataset.id, date: v('a2dD') || today(), tema: v('a2dT'), tarea: v('a2dH'), nota: v('a2dN') }; if (!e.tema && !e.tarea && !e.nota) { toast('Escribe algo primero.'); return; } a2Edit((g) => { const i = g.diario.findIndex((x) => x.id === e.id); if (i >= 0) g.diario[i] = e; else g.diario.push(e); }); closeSheet(false); Snd.drop?.(); },
  'a2-dia-del': async (el) => { if (!(await ask({ title: '¿Quitar este registro?', ok: 'Quitar', danger: true }))) return; a2Edit((g) => { g.diario = g.diario.filter((x) => x.id !== el.dataset.id); }); },
  'a2-dia-copy': () => { const g = a2G(); a2Copy(`Diario de ${g.materia} · ${g.name}\n` + g.diario.slice().sort((a, b) => a.date.localeCompare(b.date)).map((e) => `${e.date}: ${e.tema || 'Clase'}${e.tarea ? ` (Tarea: ${e.tarea})` : ''}`).join('\n')); },
  'a2-msg-tp': (el) => { A2.msg.tp = el.dataset.v; A2.msg.keep = null; render(); },
  'a2-msg-wa': () => { const t = document.getElementById('a2mT')?.value || ''; if (t) window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank', 'noopener'); },
  'a2-msg-copy': () => a2Copy(document.getElementById('a2mT')?.value || '', 'Mensaje copiado.'),
  'a2-msg-share': async () => { const t = document.getElementById('a2mT')?.value || ''; try { if (navigator.share) await navigator.share({ text: t }); else a2Copy(t, 'Mensaje copiado.'); } catch { /* cancelado */ } },
  'a2-foco': (el) => { const ord = ['', 'r', 'y', 'g']; a2Edit((g) => { const c = g.foco[el.dataset.a] || ''; const n = ord[(ord.indexOf(c) + 1) % ord.length]; if (n) g.foco[el.dataset.a] = n; else delete g.foco[el.dataset.a]; }); },
  'a2-boletin': () => { const g = a2G(); if (g) a2Boletin(a2Ext(g)); },
  'a2-rep-copy': () => { const g = a2Ext(a2G()); const D = a2RepData(g); a2Copy(`Reporte ${g.materia} · ${g.name}\nPromedio del grupo: ${auFmt(D.mean)} · Aprueban: ${D.w.length ? Math.round((D.pass / D.w.length) * 100) : 0}%\n` + D.rows.map((r) => `${r.a.name}: ${auFmt(r.avg)}${r.as.pct === null ? '' : ` · asist. ${r.as.pct}%`}`).join('\n'), 'Reporte copiado.'); },
  'a2-rep-csv': () => { const g = a2Ext(a2G()); const D = a2RepData(g); const q = (x) => `"${String(x).replace(/"/g, '""')}"`; const csv = ['Alumno,Promedio,Asistencia %,Faltas,Participación,Semáforo', ...D.rows.map((r) => [q(r.a.name), auFmt(r.avg), r.as.pct ?? '', r.as.f, r.pt, r.fo ? A2_FOCO[r.fo][1] : ''].join(','))].join('\n'); auDownload(new Blob(['﻿' + csv], { type: 'text/csv' }), `reporte-${g.name}.csv`); },
  'a2-q-new': () => a2QSheet(),
  'a2-q-save': () => {
    const t = document.getElementById('a2qT').value; const q = (document.getElementById('a2qQ').value || '').trim(); if (!q) { toast('Escribe la pregunta.'); return; }
    const it = { id: a2Id('qu'), type: t, q };
    if (t === 'op') { it.opts = [0, 1, 2, 3].map((i) => (document.getElementById('a2qO' + i).value || '').trim()); if (it.opts.some((o) => !o)) { toast('Llena las cuatro opciones.'); return; } it.ans = +(document.querySelector('input[name="a2qA"]:checked')?.value || 0); }
    else if (t === 'vf') it.ans = document.querySelector('input[name="a2qA"]:checked')?.value === '1';
    a2Edit((g) => { g.banco.push(it); }); closeSheet(false); Snd.drop?.();
  },
  'a2-q-del': (el) => a2Edit((g) => { g.banco = g.banco.filter((x) => x.id !== el.dataset.id); }),
  'a2-ex-make': async () => {
    const g = a2Ext(a2G()); const n = await ask({ title: 'Armar examen', text: `Tienes ${g.banco.length} preguntas. ¿Cuántas incluir?`, input: { type: 'number', value: String(Math.min(10, g.banco.length)) }, ok: 'Imprimir' }); if (!n) return;
    const k = Math.max(1, Math.min(g.banco.length, parseInt(n, 10) || 1)); const qs = a2Shuf(g.banco).slice(0, k);
    const both = await ask({ title: '¿Qué versiones imprimo?', options: [{ value: 'AB', label: 'Versión A y B + claves' }, { value: 'A', label: 'Solo una versión + clave' }] }); if (!both) return;
    const qsB = a2Shuf(qs);
    a2Print(`Examen ${g.materia}`, a2ExamHTML(g, qs, both === 'AB' ? 'A' : '', false) + (both === 'AB' ? a2ExamHTML(g, qsB, 'B', false) : '') + a2ExamHTML(g, qs, both === 'AB' ? 'A' : '', true));
  },
  'a2-seat': (el) => {
    const g = a2Ext(a2G()); const i = +el.dataset.i; const m = g.seats.map;
    if (A2.seat === null) { A2.seat = i; render(); return; }
    if (A2.seat !== i) { a2Edit((gg) => { const a = gg.seats.map[A2.seat]; const b = gg.seats.map[i]; if (b) gg.seats.map[A2.seat] = b; else delete gg.seats.map[A2.seat]; if (a) gg.seats.map[i] = a; else delete gg.seats.map[i]; }); }
    A2.seat = null; if (A2.seat === null) render(); void m;
  },
  'a2-seat-rand': () => a2Edit((g) => { a2SeatFill(a2Ext(g), a2Shuf(g.alumnos)); }),
  'a2-seat-abc': () => a2Edit((g) => { a2SeatFill(a2Ext(g), g.alumnos.slice().sort((a, b) => a.name.localeCompare(b.name, 'es'))); }),
  'a2-seat-clear': () => a2Edit((g) => { g.seats.map = {}; }),
  'a2-seat-print': () => { const g = a2Ext(a2G()); const S0 = g.seats; let t = '<h1>Mapa de lugares — ' + esc(g.name) + '</h1><p>Pizarrón ↑</p><table>'; for (let r = 0; r < S0.r; r++) { t += '<tr>'; for (let c = 0; c < S0.c; c++) { const id = S0.map[r * S0.c + c]; const al = id && g.alumnos.find((a) => a.id === id); t += `<td style="height:46px;text-align:center">${al ? esc(al.name) : ''}</td>`; } t += '</tr>'; } a2Print('Lugares', t + '</table>'); },
  'a2-fe-new': () => a2FeSheet(),
  'a2-fe-save': () => { const t = (document.getElementById('a2fT').value || '').trim(); const d = document.getElementById('a2fD').value; if (!t || !d) { toast('Pon un nombre y una fecha.'); return; } a2Edit((g) => { g.fechas.push({ id: a2Id('fe'), t, date: d, kind: document.getElementById('a2fK').value }); }); closeSheet(false); Snd.drop?.(); },
  'a2-fe-del': (el) => a2Edit((g) => { g.fechas = g.fechas.filter((x) => x.id !== el.dataset.id); }),
  'a2-dado': (el) => { const k = el.dataset.k; const out = document.getElementById('a2Dado'); if (!out) return; out.textContent = k === 'coin' ? (Math.random() < 0.5 ? '🪙 Cara' : '🪙 Cruz') : String(1 + Math.floor(Math.random() * +k)); out.classList.remove('pop'); void out.offsetWidth; out.classList.add('pop'); Snd.tick?.(); },
  'a2-orden': () => { const g = a2G(); const o = document.getElementById('a2Ord'); if (!g || !o) return; const L = a2Shuf(g.alumnos).map((a) => a.name); o.innerHTML = L.map((n) => `<li>${esc(n)}</li>`).join('') + `<button class="btn" style="margin-top:8px" data-act="a2-orden-copy">Copiar orden</button>`; o.dataset.t = L.map((n, i) => `${i + 1}. ${n}`).join('\n'); },
  'a2-orden-copy': () => a2Copy(document.getElementById('a2Ord')?.dataset.t || '', 'Orden copiado.'),
  'a2-sem': () => {
    const el = document.createElement('div'); el.className = 'a2-sem g'; const T = { g: ['Trabajo libre', '#2f9e44'], y: ['Voz baja', '#f08c00'], r: ['Silencio', '#e03131'] }; let k = 'g';
    const paint = () => { el.style.background = T[k][1]; el.innerHTML = `<b>${T[k][0]}</b><div><button data-k="g">🟢</button><button data-k="y">🟡</button><button data-k="r">🔴</button></div><button class="a2-sem-x" data-x>Cerrar</button>`; };
    el.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.x !== undefined) { el.remove(); return; } if (b.dataset.k) { k = b.dataset.k; paint(); } });
    paint(); document.body.appendChild(el);
  },
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'a2Al') { const g = a2G(); if (g && A2.rub) a2RubOpen(A2.rub.rid, t.value); }
  else if (t.id === 'a2mA') { A2.msg.al = t.value; A2.msg.keep = null; render(); }
  else if (t.id === 'a2sR' || t.id === 'a2sC') { const r = Math.max(2, Math.min(10, +document.getElementById('a2sR').value || 5)); const c = Math.max(2, Math.min(10, +document.getElementById('a2sC').value || 6)); a2Edit((g) => { g.seats.r = r; g.seats.c = c; for (const k of Object.keys(g.seats.map)) if (+k >= r * c) delete g.seats.map[k]; }); }
});
document.addEventListener('input', (e) => { if (e.target.id === 'a2mT') { const g = a2G(); const al = g && g.alumnos.find((a) => a.id === A2.msg.al); A2.msg.text = e.target.value; A2.msg.keep = A2.msg.tp + (al ? al.id : ''); } });

/* ---------- Mi aula: resumen de fechas próximas entre todos los grupos ---------- */
{
  const baseV = viewAula;
  viewAula = function (arg) {
    const h = baseV(arg); if (arg) return h;
    const items = []; for (const g of auGroups()) { a2Ext(g); for (const f of g.fechas) { const d = a2Days(f.date); if (d >= 0 && d <= 21) items.push({ g, f, d }); } }
    items.sort((a, b) => a.d - b.d); if (!items.length) return h;
    const card = `<section class="a2-up"><h4 class="tp-h">Lo que viene</h4>${items.slice(0, 5).map((x) => `<a href="#/aula/${x.g.id}" data-act="a2-open-fe" data-id="${x.g.id}"><span>${A2_FK[x.f.kind][0]}</span><b>${esc(x.f.t)}</b><small>${esc(x.g.name)}</small><em>${a2When(x.d)}</em></a>`).join('')}</section>`;
    return h.replace('<div class="au-list">', card + '<div class="au-list">');
  };
  EXTRA_VIEWS.aula = viewAula;
  Object.assign(VIDA_ACTS, { 'a2-open-fe': (el) => { AU.tab = 'fe'; } });
}
