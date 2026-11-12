/* Cinnavia 7.60 — Mi aula (docente): grupos con nivel y horario (aparecen en el calendario), planeación por clase,
   agente docente con enfoque SEP por nivel, y registro de calificaciones inteligente con importación de plantilla
   y exportación a Excel (.xlsx). Todo se calcula en el dispositivo. */
'use strict';
const AU = { tab: 'clases', gid: null, imp: '' };
const AU_NIV = {
  preescolar: { n: 'Preescolar', marco: 'Plan de Estudio 2022 (NEM): campos formativos y ejes articuladores', foco: ['Campo formativo y proceso de desarrollo de aprendizaje', 'Eje articulador (inclusión, pensamiento crítico, vida saludable…)', 'Actividad lúdica o situación didáctica', 'Evaluación formativa con observación y registro', 'Recursos y materiales'], tip: 'Prioriza el juego y la observación; evalúa con registros descriptivos, no con calificación numérica.' },
  primaria: { n: 'Primaria', marco: 'Plan de Estudio 2022 (NEM): campos formativos, fases y proyectos', foco: ['Campo formativo y contenido', 'Proceso de desarrollo de aprendizaje (PDA)', 'Eje articulador', 'Metodología sociocrítica (proyecto, STEAM, aprendizaje servicio…)', 'Evaluación formativa y evidencias'], tip: 'Vincula el contenido con la comunidad y planea por proyectos; la evaluación es formativa y continua.' },
  secundaria: { n: 'Secundaria', marco: 'Plan de Estudio 2022 (NEM): campos formativos, fases y proyectos', foco: ['Campo formativo y contenido', 'Proceso de desarrollo de aprendizaje (PDA)', 'Eje articulador', 'Metodología (proyecto, ABP, STEAM, aprendizaje servicio)', 'Evaluación formativa y evidencias'], tip: 'Integra contenidos de varias disciplinas en proyectos y define evidencias claras para la evaluación formativa.' },
  bachillerato: { n: 'Bachillerato', marco: 'Marco Curricular Común de la Educación Media Superior (MCCEMS): recursos sociocognitivos, áreas de conocimiento y formación socioemocional', foco: ['Recurso sociocognitivo o área de conocimiento y su progresión de aprendizaje', 'Aprendizaje de trayectoria o propósito de la sesión', 'Recurso o ámbito de formación socioemocional', 'Actividades de aprendizaje con producto o evidencia', 'Evaluación formativa: criterios o rúbrica'], tip: 'Recursos sociocognitivos: Lengua y Comunicación, Pensamiento Matemático, Conciencia Histórica y Cultura Digital. Áreas: Ciencias Sociales, Humanidades y Ciencias Naturales, Experimentales y Tecnología. Planea por progresiones y evalúa de forma formativa.' },
  superior: { n: 'Universidad', marco: 'Modelo educativo de tu institución', foco: ['Resultado de aprendizaje', 'Actividades y estrategias', 'Evidencias de aprendizaje', 'Criterios de evaluación', 'Bibliografía o recursos'], tip: 'Alinea resultados de aprendizaje, evidencias y criterios de evaluación en la misma tabla.' },
};
const AU_DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const auData = () => { const d = (S.aula ||= { groups: [] }); if (!Array.isArray(d.groups)) d.groups = []; return d; };
const auGroups = () => auData().groups.filter((g) => !g.del);
const auGroup = (id = AU.gid) => auGroups().find((g) => g.id === id);
const auNum = (v) => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null; };
const auMax = () => +(S.settings?.gradeMax) || 10;
const auPass = () => +(S.settings?.passGrade) || 6;
const auPlans = (g) => (S.pages || []).filter((p) => p.kind === 'plan' && (p.subjectId && g.clases.some((c) => c.sid === p.subjectId) || (p.plan?.grupo || '') === g.name));

/* ---------- Cálculo de calificaciones ---------- */
function auScore(a, r) { // calificación sobre 10 de una actividad, o null si no cuenta todavía
  if (!r) return null; if (r.ent === 'no') return 0; const p = auNum(r.pts); if (p === null) return null; const mx = auNum(a.max) || 10; return Math.max(0, Math.min(10, p / mx * 10));
}
function auAvg(g, sid) {
  let sw = 0, sp = 0; const eq = !g.acts.some((a) => auNum(a.w));
  for (const a of g.acts) { const s = auScore(a, (g.notas[sid] || {})[a.id]); if (s === null) continue; const w = eq ? 1 : (auNum(a.w) || 0); sw += w; sp += s * w; }
  return sw ? sp / sw : null;
}
function auStats(g) {
  const avgs = g.alumnos.map((al) => ({ al, avg: auAvg(g, al.id) })); const w = avgs.filter((x) => x.avg !== null);
  const risk = w.filter((x) => x.avg < auPass()); let ent = 0, tot = 0;
  for (const al of g.alumnos) for (const a of g.acts) { const r = (g.notas[al.id] || {})[a.id]; if (r && r.ent) { tot++; if (r.ent === 'si') ent++; } }
  return { avgs, risk, mean: w.length ? w.reduce((s, x) => s + x.avg, 0) / w.length : null, entRate: tot ? ent / tot : null };
}
const auFmt = (n) => (n === null || n === undefined ? '–' : (Math.round(n * 10) / 10).toFixed(1));

/* ---------- Grupos y horario ---------- */
function auNextClass(g) {
  const now = new Date(); let best = null;
  for (const c of g.clases) for (let i = 0; i < 8; i++) { const d = new Date(now); d.setDate(d.getDate() + i); if (d.getDay() !== +c.day) continue; const [h, m] = c.start.split(':').map(Number); d.setHours(h, m, 0, 0); if (d > now && (!best || d < best.d)) best = { d, c }; }
  return best;
}
function auSyncSubjects(g) { // cada clase del horario vive como materia para que salga en el calendario y tenga libreta
  commit((s) => {
    s.aula ||= { groups: [] }; const gg = s.aula.groups.find((x) => x.id === g.id); if (!gg) return;
    const sched = (cs) => cs.map((c) => ({ day: +c.day, start: c.start, end: c.end, room: c.room || '' }));
    let sub = gg.sid && s.subjects.find((x) => x.id === gg.sid);
    if (!sub) { gg.sid = uid(); s.subjects.push({ id: gg.sid, name: `${gg.materia} · ${gg.name}`, color: nextColor(), teacher: '', room: '', important: false, schedule: [], notes: '', target: null }); sub = s.subjects[s.subjects.length - 1]; }
    sub.name = `${gg.materia} · ${gg.name}`; sub.schedule = sched(gg.clases);
    gg.clases.forEach((c) => { c.sid = gg.sid; });
  });
}
function auNewGroup() {
  openSheet(`${sheetHead('Nuevo grupo')}<div class="sheet-body">
    <div class="field"><label for="auN">Grupo</label><input id="auN" class="input" maxlength="40" placeholder="Ej. 3.º A"></div>
    <div class="field"><label for="auM">Materia</label><input id="auM" class="input" maxlength="60" placeholder="Ej. Pensamiento Matemático"></div>
    <div class="field"><label for="auL">Nivel</label><select id="auL" class="input">${Object.entries(AU_NIV).map(([k, v]) => `<option value="${k}" ${k === 'bachillerato' ? 'selected' : ''}>${v.n}</option>`).join('')}</select></div>
    <div class="field"><label>Horario <span class="faint">(opcional, puedes agregarlo después)</span></label><div id="auDays" class="dn-seg">${[1, 2, 3, 4, 5, 6].map((d) => `<button type="button" class="chip" data-act="au-day" data-d="${d}" aria-pressed="false">${AU_DAYS[d].slice(0, 3)}</button>`).join('')}</div>
      <div class="cm-two" style="margin-top:8px"><div class="field"><label for="auS">Entra</label><input id="auS" type="time" class="input" value="08:00"></div><div class="field"><label for="auE">Sale</label><input id="auE" type="time" class="input" value="08:50"></div></div></div>
  </div><div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="au-new-save">Crear grupo</button></div>`);
  setTimeout(() => document.getElementById('auN')?.focus(), 80);
}
function auClassSheet(g) {
  openSheet(`${sheetHead('Agregar clase')}<div class="sheet-body"><div class="field"><label>Días</label><div class="dn-seg">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<button type="button" class="chip" data-act="au-day" data-d="${d}" aria-pressed="false">${AU_DAYS[d].slice(0, 3)}</button>`).join('')}</div></div>
    <div class="cm-two"><div class="field"><label for="auS">Entra</label><input id="auS" type="time" class="input" value="08:00"></div><div class="field"><label for="auE">Sale</label><input id="auE" type="time" class="input" value="08:50"></div></div>
    <div class="field"><label for="auR">Salón <span class="faint">(opcional)</span></label><input id="auR" class="input" maxlength="30"></div></div>
    <div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="au-class-save">Agregar</button></div>`);
}

/* ---------- Agente docente ---------- */
function auAgent() {
  const out = []; const t0 = today(); const nowH = new Date().getHours();
  for (const g of auGroups()) {
    const nx = auNextClass(g); const niv = AU_NIV[g.nivel] || AU_NIV.bachillerato;
    if (nx) {
      const iso = toISO(nx.d); const when = iso === t0 ? 'hoy' : iso === addDays(t0, 1) ? 'mañana' : 'el ' + AU_DAYS[nx.d.getDay()].toLowerCase();
      const has = auPlans(g).some((p) => p.plan?.fecha === iso);
      if (!has && diffDays(t0, iso) <= 1) out.push({ k: 'plan', t: `${when[0].toUpperCase() + when.slice(1)} tienes ${g.materia} con ${g.name} a las ${fmtTime(nx.c.start)} y aún no hay planeación para esa clase.`, act: 'au-plan', id: g.id, btn: 'Planear la clase' });
    }
    const st = auStats(g);
    if (st.risk.length) out.push({ k: 'risk', t: `${g.name}: ${plural(st.risk.length, 'estudiante va', 'estudiantes van')} por debajo de ${auPass()} (${st.risk.slice(0, 3).map((x) => x.al.name.split(' ')[0]).join(', ')}${st.risk.length > 3 ? '…' : ''}). Conviene una retroalimentación o plan de apoyo.`, act: 'au-open', id: g.id, btn: 'Ver calificaciones' });
    if (st.entRate !== null && st.entRate < 0.7) out.push({ k: 'ent', t: `${g.name}: solo ${Math.round(st.entRate * 100)}% de las entregas registradas. Revisa si la carga o las instrucciones son claras.`, act: 'au-open', id: g.id, btn: 'Ver entregas' });
    const pend = g.acts.filter((a) => a.due && a.due < t0 && g.alumnos.some((al) => !((g.notas[al.id] || {})[a.id]))).slice(0, 1);
    for (const a of pend) out.push({ k: 'cap', t: `${g.name}: «${a.name}» ya venció y faltan calificaciones por capturar.`, act: 'au-cap', id: g.id, aid: a.id, btn: 'Capturar' });
    if (!g.alumnos.length) out.push({ k: 'al', t: `${g.name}: aún no tiene lista de estudiantes. Súbela desde tu plantilla.`, act: 'au-open', id: g.id, btn: 'Agregar alumnos' });
  }
  const niv = [...new Set(auGroups().map((g) => g.nivel))]; for (const n of niv) { const v = AU_NIV[n]; if (v) out.push({ k: 'sep', t: `${v.n} · ${v.tip}` }); }
  return out;
}
function auCheckPlan(p, nivel) {
  const x = p.plan || {}; const all = [p.title, x.obj, x.des, x.mat, x.cie, x.tar, (x.tasks || []).map((t) => t.title + ' ' + (t.crit || []).join(' ')).join(' ')].join(' ');
  const n = tpNorm(all); const has = (re) => re.test(n);
  const common = [[/objetivo|aprendizaje|proposito|progresion|pda|resultado/, 'Aprendizaje esperado u objetivo'], [/evalua|criterio|rubrica|lista de cotejo|evidencia|producto/, 'Evaluación formativa: criterios o evidencia'], [/tarea|actividad|ejercicio|proyecto/, 'Actividades o tarea']];
  const extra = nivel === 'bachillerato' ? [[/sociocognitiv|pensamiento matematico|lengua y comunicacion|conciencia historica|cultura digital|area de conocimiento|ciencias|humanidades/, 'Recurso sociocognitivo o área de conocimiento'], [/socioemocional|responsabilidad social|cuidado fisico|bienestar|aprendizaje colaborativo|valores/, 'Formación socioemocional']] : nivel === 'primaria' || nivel === 'secundaria' || nivel === 'preescolar' ? [[/campo formativo|lenguajes|saberes y pensamiento|etica, naturaleza|de lo humano/, 'Campo formativo'], [/eje articulador|inclusion|pensamiento critico|interculturalidad|vida saludable|igualdad de genero|apropiacion|artes y experiencias/, 'Eje articulador'], [/proyecto|stea?m|aprendizaje servicio|abp|problemas/, 'Metodología sociocrítica']] : [];
  return [...extra, ...common].map(([re, l]) => ({ l, ok: has(re) }));
}

/* ---------- Vistas ---------- */
function viewAula(arg) {
  if (arg) { AU.gid = arg; return auDetail(auGroup(arg)); }
  const gs = auGroups(); const ag = auAgent();
  return `<a class="back" href="#/libretas">${icon('back')}Libretas</a><h1 class="page-title">Mi aula</h1>
    <p class="page-sub">Tus grupos, su horario, tu planeación y las calificaciones, todo en un lugar.</p>
    ${ag.length ? `<section class="au-ag"><h4 class="tp-h">Tu agente docente</h4>${ag.slice(0, 5).map((a) => `<div class="au-note ${a.k}"><p>${esc(a.t)}</p>${a.act ? `<button class="btn" data-act="${a.act}" data-id="${a.id}" ${a.aid ? `data-aid="${a.aid}"` : ''}>${esc(a.btn)}</button>` : ''}</div>`).join('')}</section>` : ''}
    <div class="au-list">${gs.map((g) => { const nx = auNextClass(g); const st = auStats(g); return `<a class="au-g" href="#/aula/${g.id}"><b>${esc(g.name)}</b><span>${esc(g.materia)} · ${esc((AU_NIV[g.nivel] || {}).n || '')}</span><span class="tiny faint">${plural(g.alumnos.length, 'estudiante', 'estudiantes')}${st.mean !== null ? ` · promedio ${auFmt(st.mean)}` : ''}${nx ? ` · próxima: ${AU_DAYS[nx.d.getDay()].slice(0, 3).toLowerCase()} ${fmtTime(nx.c.start)}` : ''}</span></a>`; }).join('')}</div>
    <p><button class="btn primary" data-act="au-new">${icon('plus', 'sm')}Nuevo grupo</button> <a class="btn" href="#/lienzo">Mi pizarrón</a></p>
    ${gs.length ? '' : '<div class="empty"><h3>Aún no tienes grupos</h3><p>Crea uno con su nivel y horario; sus clases salen en tu calendario y puedes planear, mandar tareas y llevar calificaciones.</p></div>'}`;
}
function auDetail(g) {
  if (!g) return `<a class="back" href="#/aula">${icon('back')}Mi aula</a><div class="empty"><h3>Grupo no encontrado</h3></div>`;
  const niv = AU_NIV[g.nivel] || AU_NIV.bachillerato; const tabs = [['clases', 'Clases'], ['alumnos', 'Alumnos'], ['notas', 'Calificaciones'], ['sep', 'Enfoque SEP']];
  let body = '';
  if (AU.tab === 'clases') body = `<div class="au-rows">${g.clases.map((c, i) => `<div class="au-r"><span><b>${AU_DAYS[c.day]}</b> ${fmtTime(c.start)}–${fmtTime(c.end)}${c.room ? ` · ${esc(c.room)}` : ''}</span><span class="grow"></span><button class="btn" data-act="au-plan" data-id="${g.id}" data-i="${i}">Planear</button><button class="icon-btn ghost" data-act="au-class-del" data-i="${i}" aria-label="Quitar clase">${icon('trash', 'sm')}</button></div>`).join('') || '<p class="tiny faint">Sin clases en el horario.</p>'}</div>
    <p><button class="btn" data-act="au-class-add">${icon('plus', 'sm')}Agregar clase</button></p>
    <p class="tiny faint">Tus clases aparecen en el Calendario. Planeaciones de este grupo: ${auPlans(g).length}.</p>`;
  else if (AU.tab === 'alumnos') body = `<div class="tp-imp"><p class="tiny faint" style="margin:0 0 8px">Sube tu plantilla (Excel, Word, PDF, texto) o pega los nombres. Si trae columnas de actividades, entregas y calificaciones, también se cargan.</p>
      <div class="tp-row"><label class="btn primary" for="auFile">${icon('save', 'sm')}Subir plantilla</label><input id="auFile" type="file" class="sr" accept=".xlsx,.csv,.docx,.odt,.pdf,.txt,image/*" data-au-file><button class="btn" data-act="au-paste">Pegar lista</button></div>
      <div id="auPasteBox"></div><p id="auImpMsg" class="tiny tp-msg" role="status">${esc(AU.imp)}</p></div>
    <ol class="au-al">${g.alumnos.map((a) => `<li><span>${esc(a.name)}</span><button class="icon-btn ghost" data-act="au-al-del" data-id="${a.id}" aria-label="Quitar a ${esc(a.name)}">${icon('trash', 'sm')}</button></li>`).join('')}</ol>`;
  else if (AU.tab === 'notas') body = auGrid(g);
  else body = `<p class="tiny" style="margin:0 0 6px"><b>${esc(niv.n)}</b> · ${esc(niv.marco)}</p><p class="tiny faint" style="margin:0 0 10px">${esc(niv.tip)}</p>
    <h4 class="tp-h">Tu planeación debe tener</h4><ul class="tp-crit">${niv.foco.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    <h4 class="tp-h" style="margin-top:12px">Revisar mis planeaciones</h4>${auPlans(g).map((p) => { const ck = auCheckPlan(p, g.nivel); return `<div class="au-note"><b>${esc(p.title || 'Planeación')}</b><ul class="au-ck">${ck.map((c) => `<li class="${c.ok ? 'ok' : 'no'}">${c.ok ? '✓' : '✗'} ${esc(c.l)}</li>`).join('')}</ul></div>`; }).join('') || '<p class="tiny faint">Aún no hay planeaciones de este grupo. Usa «Planear» en Clases.</p>'}
    <p class="tiny faint">Orientación general basada en los lineamientos vigentes de la SEP; confirma siempre con los de tu plantel o subsistema.</p>`;
  return `<a class="back" href="#/aula">${icon('back')}Mi aula</a><h1 class="page-title" style="margin-bottom:2px">${esc(g.name)}</h1><p class="page-sub">${esc(g.materia)} · ${esc(niv.n)}</p>
    <div class="dn-seg" role="tablist" style="margin-bottom:12px">${tabs.map(([k, l]) => `<button type="button" class="chip${AU.tab === k ? ' on' : ''}" data-act="au-tab" data-v="${k}" aria-pressed="${AU.tab === k}">${l}</button>`).join('')}</div>${body}
    <p style="margin-top:18px"><button class="btn danger" data-act="au-del">${icon('trash', 'sm')}Quitar grupo</button></p>`;
}
function auGrid(g) {
  if (!g.alumnos.length) return '<p class="tiny faint">Primero agrega alumnos en la pestaña Alumnos.</p>';
  const st = auStats(g);
  return `<div class="au-sum"><span><b>${auFmt(st.mean)}</b><small>promedio</small></span><span><b>${st.entRate === null ? '–' : Math.round(st.entRate * 100) + '%'}</b><small>entregas</small></span><span><b>${st.risk.length}</b><small>en riesgo</small></span></div>
    <div class="tp-row" style="margin:8px 0"><button class="btn" data-act="au-act-add">${icon('plus', 'sm')}Actividad</button><button class="btn" data-act="au-act-plans">Traer de mis planeaciones</button><button class="btn primary" data-act="au-xlsx">${icon('save', 'sm')}Exportar a Excel</button></div>
    <div class="au-scroll"><table class="au-t"><thead><tr><th>Alumno</th>${g.acts.map((a) => `<th><button type="button" data-act="au-cap" data-id="${g.id}" data-aid="${a.id}">${esc(a.name)}<small>${auNum(a.w) ? a.w + '%' : ''}</small></button></th>`).join('')}<th>Prom.</th></tr></thead>
    <tbody>${g.alumnos.map((al) => { const av = auAvg(g, al.id); return `<tr><th>${esc(al.name)}</th>${g.acts.map((a) => { const r = (g.notas[al.id] || {})[a.id]; const s = auScore(a, r); const cls = r?.ent === 'no' ? 'no' : s === null ? 'pe' : s < auPass() ? 'lo' : 'ok'; return `<td class="${cls}" data-act="au-cap" data-id="${g.id}" data-aid="${a.id}">${r?.ent === 'no' ? '✗' : r && auNum(r.pts) !== null ? esc(r.pts) : r?.ent === 'si' ? '✓' : '·'}</td>`; }).join('')}<td class="${av === null ? 'pe' : av < auPass() ? 'lo' : 'ok'}"><b>${auFmt(av)}</b></td></tr>`; }).join('')}</tbody></table></div>
    ${g.acts.length ? '<p class="tiny faint">Toca una actividad o una celda para capturar. ✓ entregó · ✗ no entregó (cuenta 0) · · pendiente. El promedio se ajusta solo con los pesos.</p>' : '<p class="tiny faint">Agrega actividades (o súbelas con tu plantilla) para empezar.</p>'}`;
}
EXTRA_VIEWS.aula = viewAula; EXTRA_NAV.aula = 'mas';
{ const base = viewLibretas; viewLibretas = function (arg) { const h = base(arg); if (arg || !isGuardian()) return h; return h.replace('<div class="lb-shelf">', `<a class="btn primary block" href="#/aula" style="margin:0 0 12px">${icon('users', 'sm')}Mi aula (docente)</a><div class="lb-shelf">`); }; EXTRA_VIEWS.libretas = viewLibretas; }

/* ---------- Captura, importación y Excel ---------- */
function auCapSheet(g, aid) {
  const a = g.acts.find((x) => x.id === aid); if (!a) return; AU.aid = aid;
  openSheet(`${sheetHead(esc(a.name))}<div class="sheet-body"><p class="tiny faint" style="margin:0 0 8px">Puntos sobre ${esc(a.max || 10)}. Marca «No» si no entregó (cuenta 0).</p>
    <div class="au-cap">${g.alumnos.map((al) => { const r = (g.notas[al.id] || {})[a.id] || {}; return `<div class="au-cr" data-sid="${al.id}"><span>${esc(al.name)}</span><input class="input" inputmode="decimal" data-au-pts value="${r.ent === 'no' ? '' : esc(r.pts ?? '')}" ${r.ent === 'no' ? 'disabled' : ''} aria-label="Puntos de ${esc(al.name)}"><label class="au-no"><input type="checkbox" data-au-no ${r.ent === 'no' ? 'checked' : ''}>No</label></div>`; }).join('')}</div></div>
    <div class="sheet-foot"><button class="btn danger" data-act="au-act-del" data-aid="${a.id}">Quitar actividad</button><span class="grow"></span><button class="btn primary" data-act="au-cap-save">Guardar</button></div>`);
}
const auCsvRows = (t) => t.split(/\r?\n/).filter((l) => l.trim()).map((l) => (l.includes('\t') ? l.split('\t') : /;/.test(l) ? l.split(';') : (l.match(/(".*?"|[^",]+)(?=\s*,|\s*$)|(?<=,)(?=,)/g) || [l]).map((x) => x.replace(/^"|"$/g, ''))).map((c) => c.trim()));
async function auXlsxRows(file) {
  const z = await tpZip(await file.arrayBuffer()); const ss = z['xl/sharedStrings.xml'] ? [...(await z['xl/sharedStrings.xml']()).matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => tpEnt([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join(''))) : [];
  const name = Object.keys(z).find((k) => /^xl\/worksheets\/sheet\d+\.xml$/.test(k)); if (!name) throw new Error('xlsx'); const xml = await z[name](); const rows = [];
  for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) { const row = []; for (const cm of rm[1].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) { const ref = /r="([A-Z]+)\d+"/.exec(cm[1]); const ci = ref ? ref[1].split('').reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0) - 1 : row.length; const t = /t="(\w+)"/.exec(cm[1]); const v = cm[2] ? (/<v>([\s\S]*?)<\/v>/.exec(cm[2]) || [])[1] : undefined; const is = cm[2] ? (/<t[^>]*>([\s\S]*?)<\/t>/.exec(cm[2]) || [])[1] : undefined; row[ci] = t && t[1] === 's' ? ss[+v] : t && t[1] === 'inlineStr' ? tpEnt(is || '') : v !== undefined ? tpEnt(v) : ''; } rows.push(row.map((x) => x ?? '')); }
  return rows;
}
function auFromRows(g, rows) {
  rows = rows.filter((r) => r.some((c) => String(c).trim())); if (!rows.length) return { n: 0, a: 0 };
  const isName = (s) => /^[A-Za-zÁÉÍÓÚÑÜáéíóúñü][A-Za-zÁÉÍÓÚÑÜáéíóúñü.' -]{2,}$/.test(String(s).trim()) && !/^(si|sí|no|x|pendiente)$/i.test(String(s).trim());
  const cols = Math.max(...rows.map((r) => r.length)); let nc = 0, best = -1; for (let c = 0; c < Math.min(cols, 3); c++) { const k = rows.filter((r) => isName(r[c] || '')).length; if (k > best) { best = k; nc = c; } }
  let hdr = null; const first = rows[0]; if (cols > nc + 1 && first.some((c, i) => i !== nc && String(c).trim() && auNum(c) === null)) hdr = first;
  const data = rows.slice(hdr ? 1 : 0).filter((r) => isName(r[nc] || '') && !/^(nombre|alumno|estudiante|no\.?|n[uú]m|peso|promedio|total)/i.test(String(r[nc]).trim()));
  const acts = []; if (hdr) hdr.forEach((h, i) => { h = String(h).trim(); if (i === nc || i < nc || !h || /^(prom|promedio|final|total|no\.|n[uú]m|matr|situaci|estatus|observ|entregas|%)/i.test(h)) return; const w = /(\d{1,3})\s*%/.exec(h); const mx = /(\d{1,3})\s*(?:pts?|puntos)|sobre\s*(\d{1,3})/i.exec(h); const nm = h.replace(/\(?\s*\d{1,3}\s*%\s*\)?|\(?\s*(?:\d{1,3}\s*(?:pts?|puntos)|sobre\s*\d{1,3})\s*\)?/gi, '').trim() || h; let act = g.acts.find((a) => tpNorm(a.name) === tpNorm(nm)); if (!act) { act = { id: 'ac' + uid(), name: nm.slice(0, 50), w: w ? w[1] : '', max: mx ? (mx[1] || mx[2]) : 10, due: '' }; g.acts.push(act); } acts.push([i, act]); });
  const wr = rows.find((r) => /^peso/i.test(String(r[nc] || '').trim())); if (wr) for (const [i, act] of acts) { const w = auNum(wr[i]); if (w !== null && !act.w) act.w = String(w); }
  let added = 0; const names = new Set(g.alumnos.map((a) => tpNorm(a.name)));
  for (const r of data) {
    const nm = String(r[nc]).trim().replace(/\s{2,}/g, ' '); let al = g.alumnos.find((a) => tpNorm(a.name) === tpNorm(nm)); if (!al) { al = { id: 'al' + uid(), name: nm }; g.alumnos.push(al); names.add(tpNorm(nm)); added++; }
    for (const [i, act] of acts) { const v = String(r[i] ?? '').trim(); if (!v) continue; const rec = (g.notas[al.id] ||= {}); if (/^(no|x|✗|no entreg[oó]|sin entregar|falt[oó]|n\/e)$/i.test(v)) rec[act.id] = { ent: 'no' }; else if (/^(si|sí|✓|entreg[oó]|entregado|ok)$/i.test(v)) rec[act.id] = { ent: 'si', pts: (rec[act.id] || {}).pts }; else if (auNum(v) !== null) rec[act.id] = { ent: 'si', pts: v.replace(',', '.') }; }
  }
  return { n: added, a: acts.length };
}
async function auImport(fn) {
  const g = auGroup(); if (!g) return; const msg = document.getElementById('auImpMsg'); if (msg) msg.textContent = 'Leyendo tu plantilla…';
  try {
    const f = await fn(); let rows;
    if (Array.isArray(f)) rows = f; else { const text = String(f || ''); if (text.replace(/\s/g, '').length < 3) throw new Error('vacio'); rows = auCsvRows(text); if (rows.every((r) => r.length <= 1)) rows = text.split(/\r?\n/).filter((l) => l.trim()).map((l) => [l.replace(/^\s*(?:\d+[.)-]\s*|[•*-]\s*)/, '').trim()]); }
    let res; commit((s) => { const gg = s.aula.groups.find((x) => x.id === g.id); res = auFromRows(gg, rows); }); AU.imp = res.n || res.a ? `Listo: ${plural(res.n, 'estudiante nuevo', 'estudiantes nuevos')}${res.a ? ` y ${plural(res.a, 'actividad', 'actividades')}` : ''}.` : 'No encontré nombres. Revisa que haya una columna con nombres.'; Snd.chime?.();
  } catch (e) { AU.imp = String(e?.message) === 'doc' ? 'Ese es un .doc antiguo; guárdalo como .docx.' : 'No pude leer ese archivo. Prueba con Excel, CSV, Word o pega la lista.'; }
  render();
}
/* Escritor mínimo de .xlsx (zip sin compresión) */
const auCrcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const auCrc = (u) => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = auCrcT[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function auZip(files) {
  const enc = new TextEncoder(); const parts = []; const cen = []; let off = 0;
  for (const [name, text] of files) {
    const nb = enc.encode(name), d = enc.encode(text), crc = auCrc(d); const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint32(14, crc, true); h.setUint32(18, d.length, true); h.setUint32(22, d.length, true); h.setUint16(26, nb.length, true);
    parts.push(new Uint8Array(h.buffer), nb, d); const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint32(16, crc, true); c.setUint32(20, d.length, true); c.setUint32(24, d.length, true); c.setUint16(28, nb.length, true); c.setUint32(42, off, true); cen.push(new Uint8Array(c.buffer), nb); off += 30 + nb.length + d.length;
  }
  const csz = cen.reduce((s, x) => s + x.length, 0); const e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, csz, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...cen, new Uint8Array(e.buffer)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
const auCol = (i) => { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
const auX = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
function auSheetXML(rows) { // rows: arrays de celdas {v,t:'s'|'n',s:estilo,f:formula}
  const body = rows.map((r, ri) => `<row r="${ri + 1}">${r.map((c, ci) => { if (c === null || c === undefined || c.v === '' && !c.f) return ''; const ref = auCol(ci) + (ri + 1); const s = c.s ? ` s="${c.s}"` : ''; if (c.f) return `<c r="${ref}"${s}><f>${auX(c.f)}</f>${c.v === null || c.v === undefined || c.v === '' ? '' : `<v>${c.v}</v>`}</c>`; return c.t === 'n' ? `<c r="${ref}"${s}><v>${c.v}</v></c>` : `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${auX(c.v)}</t></is></c>`; }).join('')}</row>`).join('');
  const w = Math.max(...rows.map((r) => r.length)); return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane xSplit="1" ySplit="1" topLeftCell="B2" activePane="bottomRight" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="30" customWidth="1"/><col min="2" max="${Math.max(2, w)}" width="15" customWidth="1"/></cols><sheetData>${body}</sheetData></worksheet>`;
}
function auXlsx(g) {
  const H = (v) => ({ v, s: 1 }); const nA = g.acts.length; const wRow = [{ v: 'Peso (%)', s: 3 }, ...g.acts.map((a) => ({ v: auNum(a.w) || 1, t: 'n', s: 3 })), { v: '' }, { v: '' }];
  const lastC = auCol(nA); const r1 = [H('Alumno'), ...g.acts.map((a) => H(`${a.name} (sobre ${a.max || 10})`)), H('Promedio (0-10)'), H('Situación')];
  const n = g.alumnos.length; const rows = [r1, wRow];
  g.alumnos.forEach((al, i) => { const r = i + 3; const cells = g.acts.map((a) => { const s = auScore(a, (g.notas[al.id] || {})[a.id]); return s === null ? { v: '' } : { v: Math.round(s * 100) / 100, t: 'n', s: 2 }; }); const av = auAvg(g, al.id);
    rows.push([{ v: al.name }, ...cells, { f: nA ? `IFERROR(SUMPRODUCT(B${r}:${lastC}${r},B$2:${lastC}$2)/SUMPRODUCT(--(B${r}:${lastC}${r}<>""),B$2:${lastC}$2),"")` : '""', v: av === null ? '' : Math.round(av * 100) / 100, s: 2 }, { f: `IF(${auCol(nA + 1)}${r}="","Sin calificar",IF(${auCol(nA + 1)}${r}>=${auPass()},"Aprobado","En riesgo"))`, v: '' }]);
  });
  rows.push([{ v: 'Promedio del grupo', s: 1 }, ...g.acts.map((a, i) => ({ f: `IFERROR(AVERAGE(${auCol(i + 1)}3:${auCol(i + 1)}${n + 2}),"")`, v: '', s: 2 })), { f: `IFERROR(AVERAGE(${auCol(nA + 1)}3:${auCol(nA + 1)}${n + 2}),"")`, v: '', s: 2 }, { v: '' }]);
  const e = [[H('Alumno'), ...g.acts.map((a) => H(a.name)), H('Entregas'), H('% entregas')]];
  g.alumnos.forEach((al, i) => { const r = i + 2; const cells = g.acts.map((a) => { const x = (g.notas[al.id] || {})[a.id]; return { v: !x || !x.ent ? '' : x.ent === 'no' ? 'No' : 'Sí' }; }); e.push([{ v: al.name }, ...cells, { f: `COUNTIF(B${r}:${lastC}${r},"Sí")`, v: cells.filter((c) => c.v === 'Sí').length }, { f: `IFERROR(COUNTIF(B${r}:${lastC}${r},"Sí")/COUNTA(B${r}:${lastC}${r}),"")`, v: '', s: 4 }]); });
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.0"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDCE5D2"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="5"><xf/><xf fontId="1" fillId="2" applyFont="1" applyFill="1"/><xf numFmtId="164" applyNumberFormat="1"/><xf fontId="1" applyFont="1"/><xf numFmtId="9" applyNumberFormat="1"/></cellXfs></styleSheet>`;
  const sn = (t) => auX(t).slice(0, 31);
  return auZip([
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Calificaciones" sheetId="1" r:id="rId1"/><sheet name="Entregas" sheetId="2" r:id="rId2"/></sheets><calcPr fullCalcOnLoad="1"/></workbook>`],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['xl/styles.xml', styles], ['xl/worksheets/sheet1.xml', auSheetXML(rows)], ['xl/worksheets/sheet2.xml', auSheetXML(e)],
  ]);
}
function auDownload(blob, name) {
  const f = new File([blob], name, { type: blob.type });
  if (navigator.canShare?.({ files: [f] }) && /iPhone|iPad|Android/i.test(navigator.userAgent)) { navigator.share({ files: [f], title: name }).catch(() => {}); return; }
  const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { a.remove(); URL.revokeObjectURL(u); }, 1500);
}

/* ---------- Acciones ---------- */
document.addEventListener('change', (e) => {
  const t = e.target; if (t.dataset?.auFile !== undefined && t.files?.[0]) { const f = t.files[0]; t.value = ''; const n = tpNorm(f.name); auImport(async () => (/\.xlsx$/.test(n) ? await auXlsxRows(f) : await tpReadFile(f))); return; }
  if (t.matches?.('[data-au-no]')) { const inp = t.closest('.au-cr').querySelector('[data-au-pts]'); inp.disabled = t.checked; if (t.checked) inp.value = ''; }
});
Object.assign(VIDA_ACTS, {
  'au-new': () => auNewGroup(),
  'au-day': (el) => { el.setAttribute('aria-pressed', el.getAttribute('aria-pressed') !== 'true'); el.classList.toggle('on'); },
  'au-new-save': () => {
    const name = document.getElementById('auN').value.trim(), materia = document.getElementById('auM').value.trim(); if (!name || !materia) { toast('Escribe el grupo y la materia.'); return; }
    const days = [...document.querySelectorAll('[data-act="au-day"].on')].map((b) => +b.dataset.d); const start = document.getElementById('auS').value, end = document.getElementById('auE').value;
    const g = { id: 'gr' + uid(), name, materia, nivel: document.getElementById('auL').value, clases: days.filter(() => start && end).map((d) => ({ day: d, start, end, room: '' })), alumnos: [], acts: [], notas: {}, at: Date.now() };
    commit((s) => { (s.aula ||= { groups: [] }).groups.push(g); }); auSyncSubjects(g); closeSheet(false); location.hash = '#/aula/' + g.id; toast('Grupo creado.');
  },
  'au-open': (el) => { AU.tab = el.dataset.id && /risk|ent/.test(el.closest('.au-note')?.className || '') ? 'notas' : AU.tab; location.hash = '#/aula/' + el.dataset.id; },
  'au-tab': (el) => { AU.tab = el.dataset.v; AU.imp = ''; render(); },
  'au-del': async () => { const g = auGroup(); if (!g) return; if (!(await ask({ title: '¿Quitar este grupo?', text: 'Se borran sus clases, alumnos y calificaciones de esta app.', ok: 'Quitar', danger: true }))) return; commit((s) => { const gg = s.aula.groups.find((x) => x.id === g.id); if (gg) { gg.del = true; if (gg.sid) s.subjects = s.subjects.filter((x) => x.id !== gg.sid); } }); location.hash = '#/aula'; },
  'au-class-add': () => { const g = auGroup(); if (g) auClassSheet(g); },
  'au-class-save': () => { const g = auGroup(); const days = [...document.querySelectorAll('[data-act="au-day"].on')].map((b) => +b.dataset.d); const s = document.getElementById('auS').value, e = document.getElementById('auE').value; if (!days.length || !s || !e) { toast('Elige los días y la hora.'); return; } commit((st) => { const gg = st.aula.groups.find((x) => x.id === g.id); days.forEach((d) => gg.clases.push({ day: d, start: s, end: e, room: document.getElementById('auR').value.trim() })); }); auSyncSubjects(g); closeSheet(false); },
  'au-class-del': (el) => { const g = auGroup(); commit((s) => { s.aula.groups.find((x) => x.id === g.id).clases.splice(+el.dataset.i, 1); }); auSyncSubjects(g); },
  'au-plan': (el) => {
    const g = auGroup(el.dataset.id) || auGroup(); if (!g) return; const nx = el.dataset.i !== undefined ? { c: g.clases[+el.dataset.i], d: null } : auNextClass(g); const c = nx?.c || g.clases[0];
    let sid = g.sid; if (!sid) { auSyncSubjects(g); sid = auGroup(g.id).sid; } const p = plNew(sid || null); p.title = ''; p.plan.grupo = g.name; p.plan.materia = g.materia; p.plan.enf = g.nivel === 'bachillerato' ? 'problemas' : 'expositiva';
    if (c) { const [h1, m1] = c.start.split(':').map(Number), [h2, m2] = c.end.split(':').map(Number); p.plan.dur = Math.max(20, Math.min(240, (h2 * 60 + m2) - (h1 * 60 + m1))); const d = new Date(); for (let i = 0; i < 8; i++) { if (d.getDay() === +c.day) break; d.setDate(d.getDate() + 1); } p.plan.fecha = toISO(d); }
    plSheet(p);
  },
  'au-paste': () => { const b = document.getElementById('auPasteBox'); if (!b) return; b.innerHTML = '<div class="field" style="margin-top:8px"><textarea id="auPaste" class="input" rows="6" placeholder="Un nombre por renglón, o pega la tabla copiada de Excel…"></textarea><div class="tp-row" style="margin-top:6px"><button class="btn primary" data-act="au-paste-go">Cargar</button></div></div>'; document.getElementById('auPaste').focus(); },
  'au-paste-go': () => { const v = document.getElementById('auPaste')?.value || ''; auImport(async () => v); },
  'au-al-del': (el) => { const g = auGroup(); commit((s) => { const gg = s.aula.groups.find((x) => x.id === g.id); gg.alumnos = gg.alumnos.filter((a) => a.id !== el.dataset.id); delete gg.notas[el.dataset.id]; }); },
  'au-act-add': async () => { const g = auGroup(); const v = await ask({ title: 'Nueva actividad', text: 'Nombre (puedes poner el peso así: Examen 30%)', input: { placeholder: 'Ej. Examen parcial 30%' }, ok: 'Agregar' }); if (!v || !String(v).trim()) return; const h = String(v); const w = /(\d{1,3})\s*%/.exec(h); const mx = /(\d{1,3})\s*(?:pts?|puntos)/i.exec(h); commit((s) => { s.aula.groups.find((x) => x.id === g.id).acts.push({ id: 'ac' + uid(), name: h.replace(/\d{1,3}\s*%|\d{1,3}\s*(?:pts?|puntos)/gi, '').trim().slice(0, 50) || h.slice(0, 50), w: w ? w[1] : '', max: mx ? mx[1] : 10, due: '' }); }); },
  'au-act-plans': () => { const g = auGroup(); const ts = []; for (const p of auPlans(g)) for (const t of p.plan?.tasks || []) if (!g.acts.some((a) => a.src === t.id)) ts.push({ ...t }); if (!ts.length) { toast('No hay tareas nuevas en tus planeaciones de este grupo.'); return; } commit((s) => { const gg = s.aula.groups.find((x) => x.id === g.id); ts.forEach((t) => gg.acts.push({ id: 'ac' + uid(), src: t.id, name: t.title.slice(0, 50), w: t.value || '', max: 10, due: t.due || '' })); }); toast(`${plural(ts.length, 'actividad agregada', 'actividades agregadas')}.`); },
  'au-cap': (el) => { const g = auGroup(el.dataset.id) || auGroup(); if (!g) return; if (el.dataset.aid) auCapSheet(g, el.dataset.aid); },
  'au-cap-save': () => { const g = auGroup(); const aid = AU.aid; commit((s) => { const gg = s.aula.groups.find((x) => x.id === g.id); document.querySelectorAll('.au-cr').forEach((row) => { const sid = row.dataset.sid; const no = row.querySelector('[data-au-no]').checked; const v = row.querySelector('[data-au-pts]').value.trim(); const rec = (gg.notas[sid] ||= {}); if (no) rec[aid] = { ent: 'no' }; else if (v !== '' && auNum(v) !== null) rec[aid] = { ent: 'si', pts: String(auNum(v)) }; else delete rec[aid]; }); }); closeSheet(false); Snd.tick?.(); },
  'au-act-del': async (el) => { if (!(await ask({ title: '¿Quitar esta actividad?', ok: 'Quitar', danger: true }))) return; const g = auGroup(); commit((s) => { const gg = s.aula.groups.find((x) => x.id === g.id); gg.acts = gg.acts.filter((a) => a.id !== el.dataset.aid); }); closeSheet(false); },
  'au-xlsx': () => { const g = auGroup(); if (!g || !g.alumnos.length) { toast('Agrega alumnos primero.'); return; } auDownload(auXlsx(g), `Calificaciones ${g.name} ${g.materia}.xlsx`.replace(/[\\/:*?"<>|]/g, '-')); toast('Excel listo.'); },
});
