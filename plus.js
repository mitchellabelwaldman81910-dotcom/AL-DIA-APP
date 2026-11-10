/* Al Día — plus 7.3: micro-pasos guiados, estimado vs real, energía, ruta crítica, radar de carga,
   tiempo libre real, patrones, hábitos, árbol de habilidades, nube de emergencia, mini-quiz,
   plantillas compartidas y biblioteca global. Todo local y gratis (sin IA de pago). Se carga antes de app.js. */
'use strict';

const PLUS_ACTS = {};
const PUI = { micro: null, patDay: null, lobby: null };
const effortOf = (t) => +t.estimate || TYPE_MIN[t.type] || 45;
const stepsLeftFrac = (t) => (t.steps && t.steps.length ? t.steps.filter((x) => !x.done).length / t.steps.length : 1);
const remainingMin = (t) => Math.max(5, Math.round(effortOf(t) * (t.made ? 0.1 : stepsLeftFrac(t))));
const hsl = (h, s = 70, l = 48) => `hsl(${Math.round(h)} ${s}% ${l}%)`;
const loadColor = (ratio) => hsl(130 - 130 * Math.max(0, Math.min(1, ratio)), 68, 46);
const dowOf = (iso) => fromISO(iso).getDay();
const PL = (n, a, b) => (n === 1 ? a : b);

/* =========================================================
   1. Micro-pasos guiados (pasos de 5 minutos)
   ========================================================= */
const RNG = (n) => Array.from({ length: n }, (_, i) => i + 1);
const MICRO = {
  ensayo: { label: 'Ensayo', emoji: '✍️', type: 'tarea', kw: /ensayo|redacci|composici|art[ií]culo|opini[oó]n/,
    q: [{ k: 'src', t: '¿Cuántas fuentes necesitas?', opts: [1, 2, 3, 4], def: 2 }, { k: 'pag', t: '¿De cuántas páginas?', opts: [1, 2, 3, 5], def: 2 }],
    build: (p) => [['Abrir el documento y ponerle título', 5], ['Leer las instrucciones y subrayar lo que piden', 5],
      ...RNG(p.src).map((i) => [`Buscar la fuente ${i} de ${p.src}`, 5]), ['Anotar 3 ideas principales', 5], ['Escribir la introducción', 5],
      ...RNG(p.pag).flatMap((i) => [[`Escribir el desarrollo, página ${i} (primera mitad)`, 5], [`Escribir el desarrollo, página ${i} (segunda mitad)`, 5]]),
      ['Escribir la conclusión', 5], ['Revisar ortografía', 5], ['Poner referencias y portada', 5], ['Entregar', 5]] },
  exposicion: { label: 'Exposición', emoji: '🎤', type: 'exposicion', kw: /exposici|presentaci|exponer|diapositiva|equipo/,
    q: [{ k: 'sl', t: '¿Cuántas diapositivas?', opts: [5, 8, 10, 15], def: 8 }],
    build: (p) => [['Abrir la presentación y ponerle título', 5], ['Anotar los puntos que hay que cubrir', 5], ['Buscar 2 fuentes o datos', 5],
      ...RNG(Math.ceil(p.sl / 2)).map((i) => [`Hacer las diapositivas ${i * 2 - 1}–${Math.min(p.sl, i * 2)}`, 5]), ['Agregar imágenes o gráficas', 5], ['Escribir lo que vas a decir en cada una', 5],
      ['Ensayar en voz alta una vez', 5], ['Ensayar con cronómetro', 5], ['Guardar respaldo (USB o correo)', 5]] },
  examen: { label: 'Examen', emoji: '📝', type: 'examen', kw: /examen|parcial|prueba|quiz|evaluaci/,
    q: [{ k: 'tem', t: '¿Cuántos temas entran?', opts: [2, 3, 4, 6], def: 3 }],
    build: (p) => [['Juntar apuntes y temario', 5], ['Marcar lo que no entiendes', 5], ...RNG(p.tem).flatMap((i) => [[`Tema ${i}: leer el resumen`, 5], [`Tema ${i}: hacer 3 preguntas y responderlas`, 5]]),
      ['Repasar lo difícil', 5], ['Hacer un mini-simulacro de 5 preguntas', 5], ['Repaso final ligero y a dormir temprano', 5]] },
  proyecto: { label: 'Proyecto', emoji: '🧩', type: 'proyecto', kw: /proyecto|trabajo final|investigaci[oó]n|reporte|informe|tesis|maqueta/,
    q: [{ k: 'part', t: '¿En cuántas partes lo dividirás?', opts: [3, 4, 5, 6], def: 4 }],
    build: (p) => [['Leer la rúbrica y anotar qué piden', 5], ['Decidir el tema o enfoque', 5], ['Hacer un esquema de una página', 5], ['Buscar 2 fuentes', 5],
      ...RNG(p.part).flatMap((i) => [[`Parte ${i}: primer borrador`, 5], [`Parte ${i}: mejorarla`, 5]]), ['Armar todo en un solo archivo', 5], ['Revisar formato y ortografía', 5], ['Portada, referencias y entrega', 5]] },
  lectura: { label: 'Lectura', emoji: '📖', type: 'lectura', kw: /lectur|leer|cap[ií]tulo|libro|resumen del/,
    q: [{ k: 'pg', t: '¿Cuántas páginas son?', opts: [5, 10, 20, 40], def: 10 }],
    build: (p) => [['Ojear títulos y subtítulos', 5], ...RNG(Math.ceil(p.pg / 5)).map((i) => [`Leer páginas ${(i - 1) * 5 + 1}–${Math.min(p.pg, i * 5)}`, 5]), ['Subrayar 5 ideas clave', 5], ['Escribir un resumen de 3 líneas', 5]] },
  mate: { label: 'Ejercicios', emoji: '➗', type: 'practica', kw: /matem|ejercicio|problema|c[aá]lculo|[aá]lgebra|f[ií]sica|qu[ií]mica|estad[ií]stica|operaci/,
    q: [{ k: 'ej', t: '¿Cuántos ejercicios son?', opts: [5, 10, 15, 20], def: 10 }],
    build: (p) => [['Repasar la fórmula o el ejemplo de clase', 5], ...RNG(Math.ceil(p.ej / 3)).map((i) => [`Resolver ejercicios ${(i - 1) * 3 + 1}–${Math.min(p.ej, i * 3)}`, 5]), ['Revisar los que te salieron raros', 5], ['Pasar en limpio y entregar', 5]] },
  mapa: { label: 'Mapa o resumen', emoji: '🗺️', type: 'tarea', kw: /mapa|resumen|cuadro|esquema|infograf|cartel|poster|collage/,
    q: [{ k: 'idea', t: '¿Cuántas ideas principales?', opts: [3, 5, 7, 10], def: 5 }],
    build: (p) => [['Leer el material una vez completo', 5], ['Subrayar las ideas principales', 5], ...RNG(Math.ceil(p.idea / 2)).map((i) => [`Anotar ideas ${i * 2 - 1}–${Math.min(p.idea, i * 2)} con sus conceptos`, 5]), ['Dibujar o armar el mapa en borrador', 5], ['Pasarlo en limpio y ponerle color', 5], ['Tomar foto o entregar', 5]] },
  tarea: { label: 'Tarea general', emoji: '📚', type: 'tarea', kw: /.*/,
    q: [{ k: 'n', t: '¿En cuántos bloques de 5 min?', opts: [3, 4, 6, 8], def: 4 }],
    build: (p) => [['Abrir el material y leer las instrucciones', 5], ...RNG(p.n).map((i) => [`Avanzar, bloque ${i} de ${p.n}`, 5]), ['Revisar que cumple todo', 5], ['Entregar', 5]] },
};
function detectMicro(title, type) {
  const s = normChars(String(title || ''));
  for (const k of ['ensayo', 'exposicion', 'examen', 'mate', 'mapa', 'lectura', 'proyecto']) if (MICRO[k].kw.test(s)) return k;
  if (type === 'examen') return 'examen'; if (type === 'exposicion') return 'exposicion'; if (type === 'lectura') return 'lectura'; if (type === 'proyecto') return 'proyecto'; if (type === 'practica') return 'mate';
  return 'tarea';
}
function microDefaults(kind) { const p = {}; for (const q of MICRO[kind].q) p[q.k] = q.def; return p; }
const microBuild = (kind, p) => MICRO[kind].build(p).map(([text, min]) => ({ text, min }));

function microPanelHTML() {
  const m = PUI.micro; if (!m) return '';
  const steps = microBuild(m.kind, m.p);
  const total = steps.reduce((a, s, i) => a + (m.off.has(i) ? 0 : s.min), 0);
  return `<div class="micro card" id="microCard">
    <div class="micro-h"><b class="serif">Desglosar en pasos de 5 minutos</b><button type="button" class="icon-btn ghost" data-act="micro-close" aria-label="Cerrar">${icon('x', 'sm')}</button></div>
    <p class="small muted" style="margin:0 0 8px">Elige qué tipo de tarea es y contesta. Yo armo los pasos y tú quitas los que no necesites.</p>
    <div class="pick" role="group" aria-label="Tipo de tarea">${Object.entries(MICRO).map(([k, v]) => `<button type="button" data-act="micro-kind" data-v="${k}" aria-pressed="${m.kind === k}">${v.emoji} ${v.label}</button>`).join('')}</div>
    ${MICRO[m.kind].q.map((q) => `<div class="field" style="margin-top:10px"><span class="lbl">${q.t}</span><div class="pick" role="group">${q.opts.map((o) => `<button type="button" data-act="micro-opt" data-k="${q.k}" data-v="${o}" aria-pressed="${m.p[q.k] === o}">${o}</button>`).join('')}</div></div>`).join('')}
    <ul class="micro-list">${steps.map((s, i) => `<li class="${m.off.has(i) ? 'off' : ''}"><button type="button" class="chk" data-act="micro-toggle" data-i="${i}" role="checkbox" aria-checked="${!m.off.has(i)}" aria-label="Incluir paso"><span class="box">${icon('check')}</span></button><span class="mt">${esc(s.text)}</span><span class="chip">${s.min} min</span></li>`).join('')}</ul>
    <div class="btn-row"><button type="button" class="btn primary" data-act="micro-add">${icon('plus')}Agregar ${steps.length - m.off.size} pasos · ${fmtMinutes(total)}</button></div></div>`;
}
function paintMicro() { const b = document.getElementById('microBox'); if (b) b.innerHTML = microPanelHTML(); }
function microOpen() {
  if (!draft) return;
  const kind = detectMicro(draft.title, draft.type);
  PUI.micro = { kind, p: microDefaults(kind), off: new Set() }; paintMicro();
  document.getElementById('microCard')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function applyMicro(kind, p, off = new Set()) {
  const steps = microBuild(kind, p).filter((_, i) => !off.has(i));
  const have = new Set(draft.steps.map((s) => normChars(s.text)));
  const add = steps.filter((s) => !have.has(normChars(s.text)));
  draft.steps.push(...add.map((s) => ({ id: uid(), text: s.text, min: s.min, done: false, date: '' })));
  if (!+draft.estimate) draft.estimate = Math.min(300, Math.max(15, Math.round(steps.reduce((a, s) => a + s.min, 0) / 15) * 15));
  draftDirty = true; return add.length;
}
function plusTopHTML(t) {
  if (t.id) return '';
  return `<div class="tpl-row"><span class="tiny faint">Empieza desde una plantilla</span><div class="tpl-chips">${Object.entries(MICRO).filter(([k]) => k !== 'tarea').map(([k, v]) => `<button type="button" class="tpl-chip" data-act="tpl-start" data-v="${k}">${v.emoji} ${v.label}</button>`).join('')}</div></div>`;
}
Object.assign(PLUS_ACTS, {
  'micro-open': () => microOpen(),
  'micro-close': () => { PUI.micro = null; paintMicro(); },
  'micro-kind': (el) => { const k = el.dataset.v; PUI.micro = { kind: k, p: microDefaults(k), off: new Set() }; paintMicro(); },
  'micro-opt': (el) => { PUI.micro.p[el.dataset.k] = +el.dataset.v; PUI.micro.off = new Set(); paintMicro(); },
  'micro-toggle': (el) => { const i = +el.dataset.i; const o = PUI.micro.off; if (o.has(i)) o.delete(i); else o.add(i); paintMicro(); },
  'micro-add': () => {
    const m = PUI.micro; if (!m || !draft) return;
    const n = applyMicro(m.kind, m.p, m.off); PUI.micro = null; refreshSteps(); paintMicro();
    const est = document.getElementById('fEst'); if (est) est.value = String(draft.estimate);
    toast(n ? `Agregué ${plural(n, 'paso', 'pasos')} de 5 minutos. Empieza por el primero.` : 'Esos pasos ya estaban.');
  },
  'tpl-start': (el) => {
    const k = el.dataset.v; const M = MICRO[k];
    draft.type = M.type; if (!draft.title.trim()) draft.title = M.label;
    applyMicro(k, microDefaults(k)); draftDirty = true; renderTaskSheet();
    toast(`${M.emoji} Plantilla de ${M.label.toLowerCase()} lista. Ajusta el título y los pasos.`);
  },
});

/* =========================================================
   2. Estimado vs. real (cronómetro por tarea y margen de error)
   ========================================================= */
const focusMinFor = (id) => (S.focus || []).filter((f) => f.t === id).reduce((a, f) => a + f.m, 0);
const realMin = (t) => Math.round((+t.spent || 0) + focusMinFor(t.id) + (t.trk ? (Date.now() - t.trk) / 60000 : 0));
const subjName = (t) => subj(t.subjectId)?.name || '';
function estStats() {
  const rows = S.tasks.filter((t) => t.done && +t.estimate > 0 && ((+t.spent || 0) + focusMinFor(t.id)) >= 3).map((t) => ({ t, err: Math.round((+t.spent || 0) + focusMinFor(t.id) - +t.estimate) }));
  const groups = {};
  for (const r of rows) { const k = `${r.t.type}|${subjName(r.t)}`; (groups[k] ||= []).push(r); }
  const insights = [];
  for (const [k, g] of Object.entries(groups)) {
    const avg = Math.round(g.reduce((a, r) => a + r.err, 0) / g.length); const [type, sn] = k.split('|');
    if (Math.abs(avg) < 10) continue;
    const label = `${(TYPES[type]?.label || 'tareas').toLowerCase()}${sn ? ` de ${sn}` : ''}`;
    insights.push({ avg, n: g.length, text: avg > 0 ? `Sueles subestimar ${label} por ${fmtMinutes(avg)}.` : `Sueles calcular de más ${label}: terminas ${fmtMinutes(-avg)} antes.` });
  }
  insights.sort((a, b) => Math.abs(b.avg) - Math.abs(a.avg));
  const all = rows.length ? Math.round(rows.reduce((a, r) => a + r.err, 0) / rows.length) : 0;
  return { rows, insights, avg: all };
}
function adviceFor(t) {
  const { rows } = estStats();
  const same = rows.filter((r) => r.t.type === t.type && (!t.subjectId || r.t.subjectId === t.subjectId));
  const use = same.length >= 1 ? same : rows;
  if (!use.length || !+t.estimate) return '';
  const avg = Math.round(use.reduce((a, r) => a + r.err, 0) / use.length);
  if (Math.abs(avg) < 10) return `<p class="small muted" style="margin:6px 0 0">Tus cálculos para este tipo de tarea suelen ser buenos. 👌</p>`;
  const adj = Math.max(5, +t.estimate + avg);
  return `<p class="small" style="margin:6px 0 0">💡 ${avg > 0 ? `Tiendes a tardarte ${fmtMinutes(avg)} más` : `Sueles terminar ${fmtMinutes(-avg)} antes`}. Calcula unos <b>${fmtMinutes(adj)}</b>.</p>`;
}
function trackerHTML(t) {
  if (!t.id) return `<div class="field"><span class="lbl">Tiempo real</span><p class="small muted" style="margin:0">Guarda la tarea para poder medir cuánto te toma de verdad.</p></div>`;
  const real = realMin(t); const est = +t.estimate || 0;
  let cmp = '';
  if (est && real >= 1) { const d = real - est; cmp = d > 5 ? `<span class="chip warn">+${fmtMinutes(d)} sobre lo calculado</span>` : d < -5 ? `<span class="chip pen">${fmtMinutes(-d)} menos de lo calculado</span>` : '<span class="chip pen">Justo lo que calculaste 🎯</span>'; }
  return `<div class="field"><span class="lbl">Tiempo real <span class="faint">(aprende a calcular mejor)</span></span><div class="card trk-card" style="background:var(--paper)">
    <div class="trk-top"><b id="trkClock" class="trk-clock">${fmtClockMin(real, !!t.trk)}</b><button type="button" class="btn ${t.trk ? 'danger' : 'primary'}" data-act="trk-toggle">${t.trk ? `${icon('pause')}Detener` : `${icon('play')}Medir mi tiempo`}</button></div>
    <p class="small muted" style="margin:6px 0 0">${est ? `Calculaste ${fmtMinutes(est)}.` : 'Aún no calculas cuánto te tomará.'} ${cmp}</p>${adviceFor(t)}</div></div>`;
}
const fmtClockMin = (m, live) => { const s = Math.round(m * 60); const h = Math.floor(s / 3600), mi = Math.floor((s % 3600) / 60), se = s % 60; return `${h ? h + ':' : ''}${String(mi).padStart(h ? 2 : 1, '0')}:${String(se).padStart(2, '0')}`; };
let trkTimer = null;
function trkTick() {
  const c = document.getElementById('trkClock'); if (!c || !draft || !draft.trk) { clearInterval(trkTimer); trkTimer = null; return; }
  c.textContent = fmtClockMin(realMin(draft), true);
}
function plusTaskHTML(t) {
  const share = (t.steps || []).length >= 2 ? `<div class="btn-row" style="margin-top:8px"><button type="button" class="btn quiet" data-act="micro-open">${icon('spark', 'sm')}Desglosar en pasos de 5 min</button><button type="button" class="btn quiet" data-act="tpl-share">${icon('users', 'sm')}Compartir como plantilla</button></div>`
    : `<div class="btn-row" style="margin-top:8px"><button type="button" class="btn" data-act="micro-open">${icon('spark', 'sm')}Desglosar en pasos de 5 min</button></div>`;
  return `<div id="microBox">${microPanelHTML()}</div>${share}${trackerHTML(t)}`;
}
Object.assign(PLUS_ACTS, {
  'trk-toggle': async () => {
    if (!draft || !draft.id) return;
    if (draft.trk) {
      draft.spent = Math.round(((+draft.spent || 0) + (Date.now() - draft.trk) / 60000) * 10) / 10; draft.trk = 0; draftDirty = true; saveDraftTask(true); renderTaskSheet();
      const r = realMin(draft); if (+draft.estimate) toast(r > +draft.estimate + 5 ? `Llevas ${fmtMinutes(r)}: ${fmtMinutes(r - +draft.estimate)} más de lo calculado.` : `Llevas ${fmtMinutes(r)}. Vas bien con tu cálculo.`);
      return;
    }
    if (!+draft.estimate) {
      const v = await ask({ title: '¿Cuánto crees que te tomará?', text: 'Dilo antes de empezar. Después comparo con tu tiempo real y aprendes a calcular mejor.', cancel: 'Sin calcular', options: ESTIMATES.filter(([v]) => v > 0).map(([v, l]) => ({ value: String(v), label: l })) });
      if (v) draft.estimate = +v;
    }
    draft.trk = Date.now(); draftDirty = true; saveDraftTask(true); renderTaskSheet();
    clearInterval(trkTimer); trkTimer = setInterval(trkTick, 1000); toast('Midiendo… detén el cronómetro cuando termines.');
  },
});

/* =========================================================
   3. Energía del día y ruta crítica
   ========================================================= */
const ENERGIES = { alta: ['⚡', 'Con mucha energía', 'Ataca primero lo más pesado y de más valor.'], normal: ['🙂', 'Normal', 'Ritmo parejo: mezcla lo difícil con lo fácil.'], baja: ['😴', 'Cansado/a', 'Empieza por lo más fácil y rápido para avanzar sin agotarte.'] };
const energyNow = () => { const e = S.settings.energy; return e && e.d === today() ? e.v : 'normal'; };
function habitToday() { const h = (S.habits ||= {}); return (h[today()] ||= { sleep: 0, water: 0, move: 0 }); }
function blockRec() {
  const h = (S.habits || {})[today()]; const e = energyNow();
  let preset = [25, 5], why = 'Bloques clásicos de 25 minutos.';
  if ((h && h.sleep > 0 && h.sleep < 6) || e === 'baja') { preset = [15, 3]; why = h && h.sleep > 0 && h.sleep < 6 ? `Dormiste ${h.sleep} h: bloques cortos de 15 min para no saturarte.` : 'Vas cansado/a: bloques cortos de 15 min.'; }
  else if (h && h.sleep >= 8 && e === 'alta') { preset = [50, 10]; why = 'Dormiste bien y tienes energía: aprovecha bloques de 50 min.'; }
  return { preset, why };
}
function plusFactor(t, s) {
  const e = energyNow(); const ef = effortOf(t);
  const heavy = ef >= 90 || (t.priority === 3 && ef >= 60); const light = ef <= 30;
  let f = 1;
  if (e === 'alta') f *= heavy ? 1.35 : light ? 0.92 : 1.05;
  else if (e === 'baja') f *= heavy ? 0.6 : light ? 1.4 : 0.95;
  f *= 1 + Math.min(ef, 240) / 600; // dificultad
  return f;
}
function critParts(t) {
  const t0 = today(); const d = t.due ? diffDays(t0, t.due) : 14; const s = subj(t.subjectId);
  const urg = d < 0 ? 100 : 60 / (d + 1); const diff = 1 + Math.min(effortOf(t), 240) / 240; const w = (s && s.important ? 1.3 : 1) * (1 + (+t.value || 0) / 100);
  return { d, urg, diff, w, score: urg * diff * w };
}
function critList(n = 6) {
  return S.tasks.filter((t) => !t.done).map((t) => ({ t, c: critParts(t) })).sort((a, b) => b.c.score - a.c.score).slice(0, n);
}
function plusHomeHTML() {
  if (isGroup()) return '';
  const e = energyNow(); const br = blockRec();
  const sleep = (S.habits || {})[today()]?.sleep;
  return `<section class="plus-home"><div class="energy" role="group" aria-label="¿Cómo te sientes hoy?"><span class="tiny faint">¿Cómo te sientes hoy?</span>
    <div class="energy-row">${Object.entries(ENERGIES).map(([k, [ic, l]]) => `<button type="button" data-act="energy" data-v="${k}" aria-pressed="${e === k}"><span>${ic}</span>${l}</button>`).join('')}</div>
    <p class="small muted" style="margin:6px 0 0">${ENERGIES[e][2]}${sleep ? ` ${esc(br.why)}` : ''}</p></div>
    <div class="plus-links"><a class="plus-link" href="#/panel"><span>📊</span><b>Mi semana</b><small>Carga y tiempo libre</small></a><button type="button" class="plus-link sos" data-act="sos-open"><span>🆘</span><b>Emergencia</b><small>Plan de daños mínimos</small></button><button type="button" class="plus-link" data-act="lobby-open"><span>🌍</span><b>Biblioteca</b><small>Estudia en silencio</small></button></div>
    <a class="brain-link" href="#/cerebro"><span class="bl-orb"></span><span class="bl-t"><b>Tu Cerebro</b><small>Mira todo lo que has construido, conectado</small></span><span class="bl-arrow">→</span></a></section>`;
}
Object.assign(PLUS_ACTS, {
  energy: (el) => { S.settings.energy = { d: today(), v: el.dataset.v }; commit(); Snd.chime(); },
});

/* =========================================================
   4. Radar de carga de la semana
   ========================================================= */
function weekRadar() {
  const t0 = today(); const days = [];
  for (let i = 0; i < 7; i++) {
    const iso = addDays(t0, i); const dow = dowOf(iso);
    const cls = classesOn(dow).reduce((a, c) => a + Math.max(0, toMin(c.end) - toMin(c.start)), 0);
    let work = 0; const tasks = [];
    for (const t of S.tasks) {
      if (t.done) continue;
      const due = t.due || null; const here = due === iso || (i === 0 && due && due < t0);
      if (here) { work += remainingMin(t); tasks.push(t); }
    }
    const ratio = (work + 0.4 * cls) / 240;
    days.push({ iso, dow, cls, work, tasks, ratio, label: ratio < 0.4 ? 'Relajado' : ratio < 0.75 ? 'Moderado' : ratio < 1 ? 'Pesado' : 'Colapso' });
  }
  return days;
}
function radarAdvice(days) {
  const heavy = days.map((d, i) => ({ ...d, i })).filter((d) => d.i > 0 && d.ratio >= 0.75);
  if (!heavy.length) return { text: 'Tu semana viene tranquila. Mantén un bloque corto al día y disfruta tu tiempo libre.', picks: [] };
  const first = heavy[0]; const dn = DIAS[first.dow];
  const picks = [];
  for (const d of days.slice(1)) for (const t of d.tasks) if (d.ratio >= 0.6 && !t.steps?.some((s) => s.date === today())) picks.push({ t, mins: Math.min(45, Math.max(15, Math.round(remainingMin(t) * 0.3 / 5) * 5)) });
  picks.sort((a, b) => remainingMin(b.t) - remainingMin(a.t));
  const sun = first.dow === 1 || first.dow === 0 ? ' Así evitas el estrés del domingo en la noche.' : '';
  return { text: `El ${dn} viene ${first.label.toLowerCase()} (${fmtMinutes(first.work)} de entregas). Empieza hoy con un pedacito para repartir la carga.${sun}`, picks: picks.slice(0, 3) };
}
function radarHTML() {
  const days = weekRadar(); const adv = radarAdvice(days); const mx = Math.max(1, ...days.map((d) => d.ratio));
  return `<section class="pn-card"><h2 class="serif">Radar de carga <small>semana</small></h2>
    <div class="radar" role="img" aria-label="Carga de trabajo de los próximos 7 días">${days.map((d, i) => `<div class="rd"><span class="rd-v">${d.work ? fmtMinutes(d.work) : ''}</span><div class="rd-bar"><i style="height:${Math.max(6, Math.round(Math.min(1.2, d.ratio) / Math.max(1.2, mx) * 100))}%;background:${loadColor(d.ratio)}"></i></div><b>${i === 0 ? 'Hoy' : DIAS_C[d.dow]}</b><span class="rd-l" style="color:${loadColor(d.ratio)}">${d.label}</span></div>`).join('')}</div>
    <div class="rd-scale"><span style="background:${loadColor(0)}"></span><span style="background:${loadColor(.5)}"></span><span style="background:${loadColor(1)}"></span><small class="faint">relajado → colapso</small></div>
    <p class="radar-tip">${esc(adv.text)}</p>
    ${adv.picks.length ? `<div class="picks">${adv.picks.map((p) => `<div class="pick-r"><span class="pr-t"><b>${esc(p.t.title)}</b><span class="small muted">${p.t.due ? esc(cap(relDay(p.t.due))) : ''} · adelanta ${p.mins} min hoy</span></span><button class="btn primary" data-act="radar-adv" data-id="${p.t.id}" data-m="${p.mins}">Adelantar</button></div>`).join('')}</div>` : ''}</section>`;
}
Object.assign(PLUS_ACTS, {
  'radar-adv': (el) => {
    const t = task(el.dataset.id); if (!t) return; const m = +el.dataset.m || 20;
    commit(() => { (t.steps ||= []).push({ id: uid(), text: `Adelantar ${m} min: ${t.title}`, min: m, done: false, date: today() }); });
    Snd.chime(); toast('Listo: lo agregué a tu plan de hoy.');
  },
});

/* =========================================================
   5. Tiempo libre real
   ========================================================= */
const BASICS_DEF = 180;
const basicsMin = () => +S.settings.basics || BASICS_DEF;
function freeTime(iso) {
  const t0 = today(); const dow = dowOf(iso);
  const cls = classesOn(dow).reduce((a, c) => a + Math.max(0, toMin(c.end) - toMin(c.start)), 0);
  let work = 0;
  for (const t of S.tasks) {
    if (t.done || !t.due) continue;
    const d = diffDays(t0, t.due); const left = remainingMin(t);
    const s3 = addDays(t.due, -3); let start = s3 > t0 ? s3 : t0; let end = t.due < t0 ? t0 : t.due;
    if (iso < start || iso > end) continue;
    const span = Math.max(1, diffDays(start, end) + 1); work += left / span;
  }
  const awake = 16 * 60; const basics = basicsMin();
  const free = Math.max(0, awake - cls - Math.round(work) - basics);
  return { iso, dow, cls, work: Math.round(work), basics, awake, free };
}
function freeHTML() {
  const f = freeTime(today()); const nm = nowMin(); const wake = 7 * 60, bed = 23 * 60;
  const frac = Math.max(0, Math.min(1, (bed - Math.max(nm, wake)) / (bed - wake)));
  const left = Math.round(f.free * frac);
  const seg = [['Clases', f.cls, '#5B7FD1'], ['Tareas y estudio', f.work, '#D9A947'], ['Comer, aseo y traslados', f.basics, '#9AA6BF'], ['Libre de verdad', f.free, '#2F8A5B']];
  const week = Array.from({ length: 7 }, (_, i) => freeTime(addDays(today(), i))); const mxw = Math.max(60, ...week.map((x) => x.free));
  const tip = f.free < 60 ? 'Hoy casi no hay tiempo libre. Protege aunque sea 20 minutos de descanso real, sin pantallas de tarea.' : f.free < 180 ? 'Tienes un respiro razonable. Decide desde ahora en qué lo vas a disfrutar.' : 'Hoy tienes buen margen. Úsalo en algo que te haga bien: salir, ejercicio, amigos o descansar.';
  return `<section class="pn-card"><h2 class="serif">Tiempo libre real <small>hoy</small></h2>
    <div class="free-big"><b>${fmtMinutes(f.free)}</b><span class="small muted">libres hoy · te quedan unos <b>${fmtMinutes(left)}</b> de aquí a dormir</span></div>
    <div class="free-bar" role="img" aria-label="Cómo se reparte tu día">${seg.map(([l, m, c]) => `<i style="width:${(m / f.awake * 100).toFixed(1)}%;background:${c}" title="${l}"></i>`).join('')}</div>
    <ul class="free-leg">${seg.map(([l, m, c]) => `<li><span class="dot" style="background:${c}"></span>${l}<b>${fmtMinutes(m)}</b></li>`).join('')}</ul>
    <p class="small muted" style="margin:6px 0 10px">Día despierto de 16 h (7 am a 11 pm). Comer, aseo y traslados: ${fmtMinutes(f.basics)} <button class="link-btn" data-act="basics-edit">cambiar</button></p>
    <div class="free-week">${week.map((x, i) => `<div><div class="fw-bar"><i style="height:${Math.max(4, Math.round(x.free / mxw * 100))}%"></i></div><b>${i === 0 ? 'Hoy' : DIAS_C[x.dow]}</b><span class="tiny">${fmtMinutes(x.free)}</span></div>`).join('')}</div>
    <p class="radar-tip">${tip}</p></section>`;
}
Object.assign(PLUS_ACTS, {
  'basics-edit': async () => {
    const v = await ask({ title: 'Comer, aseo y traslados', text: '¿Cuánto tiempo al día se te va en esto?', options: [[120, '2 horas'], [180, '3 horas'], [240, '4 horas'], [300, '5 horas']].map(([v, l]) => ({ value: String(v), label: l })) });
    if (v) commit(() => { S.settings.basics = +v; });
  },
});

/* =========================================================
   6. Ruta crítica y estimado vs real (en el panel)
   ========================================================= */
function critHTML() {
  const list = critList(6);
  if (!list.length) return '';
  return `<section class="pn-card"><h2 class="serif">Ruta crítica <small>qué atacar primero</small></h2>
    <p class="small muted" style="margin:0 0 8px">Ordeno tus pendientes por fecha límite, dificultad y lo que vale la materia en tu promedio.</p>
    <ol class="crit">${list.map(({ t, c }, i) => `<li><span class="crit-n">${i + 1}</span><span class="crit-t"><b>${esc(t.title)}</b><span class="crit-ch"><span class="chip">${c.d < 0 ? 'Atrasada' : c.d === 0 ? 'Hoy' : `En ${c.d} d`}</span><span class="chip">${c.diff > 1.6 ? 'Difícil' : c.diff > 1.25 ? 'Media' : 'Ligera'}</span>${subjName(t) ? `<span class="chip">${esc(subjName(t))}${subj(t.subjectId)?.important ? ' ★' : ''}</span>` : ''}${+t.value ? `<span class="chip">Vale ${+t.value}%</span>` : ''}</span></span><button class="btn" data-act="open-task" data-id="${t.id}">Abrir</button></li>`).join('')}</ol></section>`;
}
function estHTML() {
  const st = estStats();
  return `<section class="pn-card"><h2 class="serif">Estimado vs. real</h2>${st.rows.length ? `<p class="est-big">${st.avg > 5 ? `En promedio te tardas <b>${fmtMinutes(st.avg)} más</b> de lo que calculas.` : st.avg < -5 ? `En promedio terminas <b>${fmtMinutes(-st.avg)} antes</b> de lo que calculas.` : 'Tus cálculos son muy buenos. 🎯'}</p>
    ${st.insights.length ? `<ul class="ins">${st.insights.slice(0, 4).map((i) => `<li>${i.avg > 0 ? '⏳' : '🕊️'} ${esc(i.text)} <span class="tiny faint">(${plural(i.n, 'tarea', 'tareas')})</span></li>`).join('')}</ul>` : ''}`
    : '<p class="muted" style="margin:0">Calcula cuánto te tomará una tarea y mide tu tiempo con “Medir mi tiempo” dentro de la tarea. Después de 2 o 3 tareas te muestro tu margen de error.</p>'}</section>`;
}

/* =========================================================
   7. Patrones de fuga de tiempo
   ========================================================= */
function patterns() {
  const dows = Array.from({ length: 7 }, () => ({ n: 0, focus: 0, last: 0 }));
  const blocks = { Madrugada: 0, Mañana: 0, Tarde: 0, Noche: 0 }; let total = 0, last = 0, early = 0;
  for (const t of S.tasks) {
    if (!t.done || !t.doneAt) continue;
    const d = new Date(t.doneAt); const dw = d.getDay(); dows[dw].n++; total++;
    const h = d.getHours(); blocks[h < 6 ? 'Madrugada' : h < 12 ? 'Mañana' : h < 19 ? 'Tarde' : 'Noche']++;
    if (t.due) { const lead = diffDays(toISO(d), t.due); if (lead <= 0) { last++; dows[dw].last++; } else if (lead >= 2) early++; }
  }
  for (const f of S.focus || []) dows[dowOf(f.d)].focus += f.m;
  const score = dows.map((x) => x.n + x.focus / 25);
  return { dows, blocks, total, last, early, score };
}
function patternsHTML() {
  const p = patterns(); const mx = Math.max(1, ...p.score);
  if (p.total < 3 && !(S.focus || []).length) return `<section class="pn-card"><h2 class="serif">Patrones de fuga de tiempo</h2><p class="muted" style="margin:0">Entrega unas tareas y usa el modo enfoque. Con unos días de datos te muestro cuándo eres más productivo y cuándo pospones más.</p></section>`;
  const ranked = p.score.map((s, i) => ({ s, i })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
  let ins = '';
  if (ranked.length >= 2) { const best = ranked[0], worst = ranked[ranked.length - 1]; const pct = Math.round((1 - worst.s / best.s) * 100); if (pct >= 15) ins += `<li>📉 Tus <b>${DIAS[worst.i]}s</b> son ${pct}% menos productivos que tus <b>${DIAS[best.i]}s</b>.</li>`; }
  if (p.total >= 3) { const lp = Math.round((p.last / p.total) * 100); ins += lp >= 50 ? `<li>⏰ Entregas el ${lp}% de tus tareas el mismo día de la fecha límite. Prueba adelantar un pedacito cada día.</li>` : `<li>✅ Solo el ${lp}% de tus entregas son a último momento. ¡Vas bien!</li>`; }
  const bk = Object.entries(p.blocks).sort((a, b) => b[1] - a[1])[0]; if (bk && bk[1] > 0) ins += `<li>🕒 Tu mejor momento para entregar es la <b>${bk[0].toLowerCase()}</b>.</li>`;
  const order = [1, 2, 3, 4, 5, 6, 0];
  const sel = PUI.patDay;
  const det = sel == null ? 'Toca un día para ver el detalle.' : (() => { const x = p.dows[sel]; return `<b>${cap(DIAS[sel])}</b>: ${plural(x.n, 'entrega', 'entregas')}, ${fmtMinutes(x.focus)} de enfoque${x.n ? `, ${x.last} a último momento` : ''}.`; })();
  return `<section class="pn-card"><h2 class="serif">Patrones de fuga de tiempo</h2>
    <div class="pat">${order.map((i) => `<button type="button" class="pat-d ${sel === i ? 'on' : ''}" data-act="pat-day" data-v="${i}" aria-label="${cap(DIAS[i])}"><div class="pat-bar"><i style="height:${Math.max(4, Math.round(p.score[i] / mx * 100))}%"></i></div><b>${DIAS_L[i]}</b></button>`).join('')}</div>
    <p class="small muted" id="patDetail" style="margin:6px 0 10px">${det}</p>
    <div class="blocks">${Object.entries(p.blocks).map(([k, v]) => `<div><div class="bl-bar"><i style="width:${p.total ? Math.round(v / p.total * 100) : 0}%"></i></div><span class="tiny">${k}</span></div>`).join('')}</div>
    ${ins ? `<ul class="ins">${ins}</ul>` : ''}</section>`;
}
Object.assign(PLUS_ACTS, { 'pat-day': (el) => { PUI.patDay = PUI.patDay === +el.dataset.v ? null : +el.dataset.v; render(); } });

/* =========================================================
   8. Hábitos (sueño, agua, ejercicio)
   ========================================================= */
function habitsHTML() {
  const h = habitToday(); const br = blockRec();
  const row = (k, ic, l, v, unit, step) => `<div class="hab"><span class="hab-i">${ic}</span><span class="hab-t"><b>${l}</b><span class="small muted">${v} ${unit}</span></span><span class="hab-c"><button class="btn ico" data-act="hab" data-k="${k}" data-d="-${step}" aria-label="Menos ${l}">−</button><button class="btn ico" data-act="hab" data-k="${k}" data-d="${step}" aria-label="Más ${l}">+</button></span></div>`;
  const rec = (S.habits || {}); const days = Object.entries(rec).filter(([, x]) => x.sleep > 0);
  let corr = '';
  const done = (d) => S.tasks.filter((t) => t.done && t.doneAt && toISO(new Date(t.doneAt)) === d).length;
  const good = days.filter(([, x]) => x.sleep >= 7), bad = days.filter(([, x]) => x.sleep < 7);
  if (good.length >= 2 && bad.length >= 2) { const a = good.reduce((s, [d]) => s + done(d), 0) / good.length, b = bad.reduce((s, [d]) => s + done(d), 0) / bad.length; if (a > b) corr = `<p class="small" style="margin:8px 0 0">📈 Los días que duermes 7 h o más entregas ${(a).toFixed(1)} tareas, contra ${b.toFixed(1)} cuando duermes menos.</p>`; }
  return `<section class="pn-card"><h2 class="serif">Hábitos de hoy</h2>${row('sleep', '😴', 'Horas de sueño', h.sleep, 'h', 0.5)}${row('water', '💧', 'Vasos de agua', h.water, PL(h.water, 'vaso', 'vasos'), 1)}${row('move', '🏃', 'Ejercicio', h.move, 'min', 10)}
    <div class="rec-box"><b>Bloques recomendados: ${br.preset[0]} / ${br.preset[1]} min</b><span class="small muted">${esc(br.why)}</span><button class="btn" data-act="use-blocks">Usar en modo enfoque</button></div>${corr}</section>`;
}
Object.assign(PLUS_ACTS, {
  hab: (el) => { const h = habitToday(); const k = el.dataset.k; const lim = { sleep: 14, water: 16, move: 240 }[k]; h[k] = Math.max(0, Math.min(lim, Math.round(((+h[k] || 0) + +el.dataset.d) * 10) / 10)); commit(); },
  'use-blocks': () => { const T = timerState(); if (T.running) { toast('Termina o pausa tu bloque actual primero.'); return; } const br = blockRec(); T.preset = br.preset; T.mode = 'focus'; T.remaining = br.preset[0] * 60000; commit(); toast(`Modo enfoque en ${br.preset[0]} / ${br.preset[1]} min.`); },
});

/* =========================================================
   9. Árbol de habilidades (materias como ramas)
   ========================================================= */
const SKILL_T = [0, 10, 30, 60, 100, 160]; const SKILL_N = ['Brote', 'Aprendiz', 'Estudioso', 'Experto', 'Maestro', 'Leyenda'];
function skillXP(sid) {
  const ts = S.tasks.filter((t) => t.subjectId === sid && t.done);
  const pass = S.settings.passGrade || 6;
  return ts.length * 10 + ts.filter((t) => hasGrade(t) && +t.grade >= pass).length * 4 + Math.round((S.focus || []).filter((f) => f.s === sid).reduce((a, f) => a + f.m, 0) / 10);
}
const skillLv = (xp) => { let l = 0; SKILL_T.forEach((x, i) => { if (xp >= x && i > 0) l = i; }); return Math.min(5, l); };
function skillTreeHTML() {
  const subs = S.subjects.slice(0, 8);
  if (!subs.length) return `<section class="pn-card"><h2 class="serif">Árbol de habilidades</h2><p class="muted" style="margin:0">Agrega tus materias y cada una será una rama que se ilumina conforme avanzas.</p></section>`;
  const W = 360, H = 300, cx = 180, base = 286; let g = '';
  g += `<path d="M${cx} ${base} C${cx - 6} 240 ${cx + 6} 200 ${cx} 160" stroke="#8A6A4E" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  const infos = subs.map((s, i) => {
    const xp = skillXP(s.id); const lv = skillLv(xp); const n = subs.length;
    const ang = (-80 + (160 * (n === 1 ? 0.5 : i / (n - 1)))) * Math.PI / 180; const c = safeColor(s.color);
    const sx = cx, sy = 170 + (i % 2) * 18; const len = 120; const ex = sx + Math.sin(ang) * len * 1.25, ey = sy - Math.cos(ang) * len;
    g += `<path d="M${sx} ${sy} Q${(sx + ex) / 2 + Math.sin(ang) * 10} ${(sy + ey) / 2 + 12} ${ex} ${ey}" stroke="${lv > 0 ? c : '#C9C2B4'}" stroke-width="${lv > 0 ? 5 : 3}" fill="none" stroke-linecap="round" opacity="${lv > 0 ? 1 : .6}"/>`;
    for (let k = 1; k <= 5; k++) { const u = k / 5; const nx = sx + (ex - sx) * u + Math.sin(ang) * 10 * Math.sin(u * Math.PI) * .5, ny = sy + (ey - sy) * u + 12 * Math.sin(u * Math.PI) * .5; const on = lv >= k;
      g += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${on ? 7 : 5}" fill="${on ? c : '#E7E2D6'}" stroke="${on ? '#fff' : '#C9C2B4'}" stroke-width="2"${on ? ` class="sk-on" style="--c:${c}"` : ''}/>`; }
    return { s, xp, lv, c };
  });
  return `<section class="pn-card"><h2 class="serif">Árbol de habilidades</h2><p class="small muted" style="margin:0 0 6px">Cada materia es una rama. Entregar tareas, sacar buenas notas y enfocarte la ilumina.</p>
    <svg viewBox="0 0 ${W} ${H}" class="skill-svg" role="img" aria-label="Árbol de habilidades por materia">${g}</svg>
    <ul class="skill-leg">${infos.map(({ s, xp, lv, c }) => { const nxt = SKILL_T[Math.min(5, lv + 1)]; const pct = lv >= 5 ? 100 : Math.round(((xp - SKILL_T[lv]) / (nxt - SKILL_T[lv])) * 100); return `<li><span class="dot" style="background:${c}"></span><span class="sk-t"><b>${esc(s.name)}</b><span class="small muted">${SKILL_N[lv]} · nivel ${lv}/5 · ${xp} XP</span><span class="v-bar sm"><i style="width:${pct}%"></i></span></span></li>`; }).join('')}</ul></section>`;
}

/* =========================================================
   10. Nube de emergencia (triaje a medianoche)
   ========================================================= */
const SOS = { time: 0, energy: '', focus: '' };
function sosOpen() {
  SOS.time = 0; SOS.energy = ''; SOS.focus = '';
  openSheet(`${sheetHead('🆘 Nube de emergencia')}<div class="sheet-body" id="sosBody"></div>`); sosPaint();
}
function sosPaint() {
  const b = document.getElementById('sosBody'); if (!b) return;
  const chips = (k, arr) => `<div class="pick" role="group">${arr.map(([v, l]) => `<button type="button" data-act="sos-set" data-k="${k}" data-v="${v}" aria-pressed="${String(SOS[k]) === String(v)}">${l}</button>`).join('')}</div>`;
  const ready = SOS.time && SOS.energy && SOS.focus;
  b.innerHTML = `<p class="muted" style="margin:0 0 12px">Respira. Contesta 3 preguntas y te armo un plan de daños mínimos para salvar lo importante.</p>
    <div class="field"><span class="lbl">1. ¿Cuánto tiempo real tienes ahora?</span>${chips('time', [[30, '30 min'], [60, '1 hora'], [120, '2 horas'], [180, '3 horas o más']])}</div>
    <div class="field"><span class="lbl">2. ¿Cómo estás de energía?</span>${chips('energy', [['agotado', '😵 Agotado/a'], ['normal', '🙂 Normal'], ['ganas', '💪 Con ganas']])}</div>
    <div class="field"><span class="lbl">3. ¿Qué te preocupa más?</span>${chips('focus', [['fecha', '⏰ Lo que vence primero'], ['valor', '🎯 Lo que más vale'], ['dificil', '🧱 Lo más difícil']])}</div>
    <div class="btn-row"><button class="btn primary block" data-act="sos-go" ${ready ? '' : 'aria-disabled="true"'}>Armar mi plan</button></div><div id="sosOut"></div>`;
}
function sosPlan() {
  const t0 = today();
  let cands = S.tasks.filter((t) => !t.done && t.due && diffDays(t0, t.due) <= 2);
  if (!cands.length) cands = critList(4).map((x) => x.t);
  const ord = SOS.focus === 'valor' ? (a, b) => (+b.value || 0) - (+a.value || 0) || (a.due || '9').localeCompare(b.due || '9') : SOS.focus === 'dificil' ? (a, b) => effortOf(b) - effortOf(a) : (a, b) => (a.due || '9').localeCompare(b.due || '9') || (+b.value || 0) - (+a.value || 0);
  cands = [...cands].sort(ord);
  const budget = SOS.time * 0.85; const sc = SOS.energy === 'agotado' ? 1.25 : SOS.energy === 'ganas' ? 0.85 : 1;
  const must = [], nego = []; let used = 0;
  for (const t of cands) {
    const min = Math.max(15, Math.round((effortOf(t) * 0.35 * sc) / 5) * 5);
    if (!must.length || used + min <= budget) { must.push({ t, min }); used += min; } else nego.push(t);
  }
  const rescue = [...cands].sort((a, b) => (+b.value || 0) - (+a.value || 0))[0] || null;
  return { must, nego, rescue, used };
}
function teacherMsg(t) {
  const s = subj(t.subjectId); const prof = s?.teacher ? `Profe ${s.teacher}` : 'Profe';
  return `Hola, ${prof}. Soy ${profile()?.name || ''}${s ? ` de ${s.name}` : ''}. Esta semana se me juntaron varias entregas y quería pedirle de la manera más atenta si podría entregar “${t.title}” un poco después, o recibir una versión resumida. Le agradezco mucho su comprensión.`;
}
function sosOutHTML() {
  const p = sosPlan(); if (!p.must.length && !p.rescue) return '<p class="muted">No tienes pendientes. ¡Respira y descansa! 🌿</p>';
  const first = (t) => (t.steps || []).find((s) => !s.done)?.text || 'Abre el archivo y haz la parte más importante';
  return `<h3 class="serif" style="margin:16px 0 6px">✅ Haz esto sí o sí <small class="faint">(${fmtMinutes(p.used)})</small></h3>
    <ol class="sos-list">${p.must.map(({ t, min }) => `<li><b>${esc(t.title)}</b><span class="small muted">Versión mínima de ${min} min · empieza con: ${esc(first(t))}</span></li>`).join('')}</ol>
    ${p.nego.length ? `<h3 class="serif" style="margin:16px 0 6px">🤝 Negocia estas</h3><ul class="sos-list">${p.nego.map((t) => `<li><b>${esc(t.title)}</b><span class="small muted">Pide unas horas más o una versión corta.</span><button class="btn" data-act="sos-copy" data-id="${t.id}">Copiar mensaje al profe</button></li>`).join('')}</ul>` : ''}
    ${p.rescue ? `<h3 class="serif" style="margin:16px 0 6px">⏱️ 15 minutos para una nota aceptable</h3><div class="card" style="background:var(--paper)"><b>${esc(p.rescue.title)}</b><p class="small muted" style="margin:4px 0 10px">Haz solo lo esencial: ${esc(first(p.rescue))}. Entregar algo suma más que no entregar nada.</p><button class="btn primary" data-act="sos-start" data-id="${p.rescue.id}">${icon('play')}Empezar 15 min ahora</button></div>` : ''}
    <p class="small muted" style="margin-top:14px">Mañana descansa un poco y reparte mejor la semana con el Radar de carga. Esto también pasa. 💚</p>`;
}
Object.assign(PLUS_ACTS, {
  'sos-open': () => sosOpen(),
  'sos-set': (el) => { SOS[el.dataset.k] = el.dataset.k === 'time' ? +el.dataset.v : el.dataset.v; sosPaint(); },
  'sos-go': () => { if (!(SOS.time && SOS.energy && SOS.focus)) { toast('Contesta las 3 preguntas.'); return; } document.getElementById('sosOut').innerHTML = sosOutHTML(); document.getElementById('sosOut').scrollIntoView({ behavior: 'smooth', block: 'start' }); Snd.chime(); },
  'sos-copy': (el) => { const t = task(el.dataset.id); if (t) shareText('Mensaje al profe', teacherMsg(t)); },
  'sos-start': (el) => { const T = timerState(); if (T.running) { toast('Ya tienes un bloque en marcha.'); return; } T.preset = [15, 3]; T.mode = 'focus'; T.remaining = 15 * 60000; T.taskId = el.dataset.id; save(); closeSheet(false); location.hash = '#/enfoque'; },
});

/* =========================================================
   11. Mini-quiz antes de entregar
   ========================================================= */
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const WORD_RE = /[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]{6,}/g;
function buildQuiz(t) {
  const words = normChars(t.title).split(/[^a-z0-9]+/).filter((w) => w.length >= 5);
  const notes = S.notes.filter((n) => (t.subjectId && n.subjectId === t.subjectId) || words.some((w) => normChars(`${n.title} ${n.body}`).includes(w)));
  const text = notes.map((n) => n.body || '').join('. ') + '. ' + (t.desc || '');
  const sents = text.split(/[.!?\n]+\s*/).map((s) => s.trim()).filter((s) => s.length >= 40 && s.length <= 200);
  const all = [...new Set(sents.join(' ').match(WORD_RE) || [])];
  const qs = [];
  for (const s of shuffle(sents)) {
    const ws = (s.match(WORD_RE) || []).filter((w) => s.indexOf(w) > 0 || !/^[A-ZÁÉÍÓÚ]/.test(w)); if (!ws.length) continue;
    const ans = [...ws].sort((a, b) => b.length - a.length)[0];
    const dist = shuffle(all.filter((w) => normChars(w) !== normChars(ans) && Math.abs(w.length - ans.length) <= 4)).slice(0, 2); if (dist.length < 2) continue;
    qs.push({ q: s.replace(ans, '_____'), ans, opts: shuffle([ans, ...dist]) }); if (qs.length === 3) break;
  }
  return qs;
}
function quizGate(t) {
  if (S.settings.quizOff || t.quizOk) return false;
  const qs = buildQuiz(t); if (qs.length < 2) return false;
  PUI.quiz = { id: t.id, qs, i: 0, ok: 0, locked: false }; quizPaint(true); return true;
}
function quizPaint(open) {
  const q = PUI.quiz; if (!q) return;
  let body;
  if (q.i >= q.qs.length) {
    const pass = q.ok >= Math.ceil(q.qs.length * 0.66);
    body = pass ? `<div class="quiz-end ok"><div class="qe-i">🎉</div><h3 class="serif">¡Lo dominas! ${q.ok}/${q.qs.length}</h3><p class="muted">Ya puedes entregarla con tranquilidad.</p><button class="btn primary block" data-act="quiz-deliver">Entregar tarea</button></div>`
      : `<div class="quiz-end"><div class="qe-i">📚</div><h3 class="serif">${q.ok}/${q.qs.length}: repasa un poquito</h3><p class="muted">Vuelve a tus apuntes y entrega cuando te sientas listo/a.</p><div class="btn-row" style="justify-content:center"><button class="btn" data-act="sheet-close">Repasar</button><button class="btn" data-act="quiz-deliver">Entregar así</button></div><button class="link-btn" data-act="quiz-off">No volver a preguntarme</button></div>`;
  } else {
    const c = q.qs[q.i];
    body = `<p class="tiny faint">Pregunta ${q.i + 1} de ${q.qs.length}</p><p class="quiz-q">${esc(c.q)}</p><div class="quiz-opts">${c.opts.map((o, i) => `<button type="button" class="btn quiz-o" data-act="quiz-ans" data-i="${i}">${esc(o)}</button>`).join('')}</div>
      <div class="btn-row" style="margin-top:12px"><button class="link-btn" data-act="quiz-deliver">Saltar y entregar</button></div>`;
  }
  const html = `${sheetHead('🧠 Antes de entregar')}<div class="sheet-body" id="quizBody">${q.i < q.qs.length ? '<p class="muted" style="margin:0 0 10px">Tres preguntas rápidas con tus propios apuntes para confirmar que aprendiste.</p>' : ''}${body}</div>`;
  openSheet(html, () => { PUI.quiz = null; });
}
Object.assign(PLUS_ACTS, {
  'quiz-ans': (el) => {
    const q = PUI.quiz; if (!q || q.locked) return; const c = q.qs[q.i]; const pick = c.opts[+el.dataset.i]; q.locked = true;
    const good = normChars(pick) === normChars(c.ans); if (good) q.ok++;
    document.querySelectorAll('.quiz-o').forEach((b, i) => { b.classList.add(normChars(c.opts[i]) === normChars(c.ans) ? 'right' : (i === +el.dataset.i ? 'wrong' : 'dim')); });
    good ? Snd.chime() : Snd.drop();
    setTimeout(() => { if (!PUI.quiz) return; q.i++; q.locked = false; quizPaint(false); }, 900);
  },
  'quiz-deliver': () => {
    const q = PUI.quiz; if (!q) return; const t = task(q.id); const pass = q.i >= q.qs.length && q.ok >= Math.ceil(q.qs.length * 0.66);
    if (t) { t.quizOk = true; if (pass) { const v = vidaData(); v.bonus = (v.bonus || 0) + 2; } save(); }
    PUI.quiz = null; closeSheet(false); if (t) toggleTask(t.id);
  },
  'quiz-off': () => { commit(() => { S.settings.quizOff = true; }); PUI.quiz = null; closeSheet(false); toast('Listo. No te volveré a hacer el quiz (puedes volver a activarlo en Panel).'); },
});

/* =========================================================
   12. Plantillas de estudio compartidas (en los Salones)
   ========================================================= */
const myForests = () => Object.values(FOR.f || {}).filter((f) => f.meta?.members?.includes(REG.me));
function allTpls(fid) {
  const out = [];
  for (const f of myForests()) { if (fid && f.meta.id !== fid) continue; for (const it of f.items || []) if (it.type === 'tpl' && !it.deleted) out.push({ ...it, fid: f.meta.id, fname: f.meta.name }); }
  return out.sort((a, b) => (b.at || 0) - (a.at || 0));
}
function tplListHTML(list) {
  if (!list.length) return '<p class="muted" style="margin:0">Aún no hay plantillas. Desglosa una tarea y toca “Compartir como plantilla” para que tus compañeros la clonen.</p>';
  return `<div class="tpl-list">${list.map((t) => { const mins = (t.steps || []).reduce((a, s) => a + (+s.min || 0), 0); return `<div class="tpl-i"><span class="tpl-t"><b>${esc(t.title)}</b><span class="small muted">${esc(t.by || '')} · ${esc(t.fname || '')} · ${plural((t.steps || []).length, 'paso', 'pasos')}${mins ? ` · ${fmtMinutes(mins)}` : ''}</span></span><button class="btn primary" data-act="tpl-clone" data-fid="${t.fid}" data-id="${t.id}">Clonar</button></div>`; }).join('')}</div>`;
}
function tplCardHTML() {
  const n = allTpls(curFid()).length;
  return `<button type="button" class="focus-card tplcard" data-act="tpl-open"><span class="fc-ico">📋</span><span class="fc-t"><b>Plantillas de estudio</b><span class="small">${n ? `${plural(n, 'plantilla compartida', 'plantillas compartidas')}. Clónalas con un toque.` : 'Comparte cómo desglosaste una tarea pesada.'}</span></span>${icon('chev', 'chev')}</button>`;
}
function cloneTpl(fid, id) {
  const f = FOR.f[fid]; const it = (f?.items || []).find((x) => x.id === id); if (!it) { toast('Esa plantilla ya no está.'); return; }
  const t = { id: uid(), title: it.title, subjectId: null, type: TYPES[it.kind] ? it.kind : 'tarea', due: addDays(today(), 3), time: '', priority: 2, value: null, estimate: +it.est || 0, desc: '', steps: (it.steps || []).map((s) => ({ id: uid(), text: String(s.text || '').slice(0, 120), min: +s.min || 0, done: false, date: '' })), delivery: '', links: '', done: false, doneAt: null, grade: null, created: Date.now(), comments: [], photos: [], fromTpl: it.by || '' };
  if (isGroup()) {
    const mineP = REG.me; if (!mineP) { toast('Primero entra con tu usuario.'); return; }
    const d = load(keyFor(mineP)); d.tasks.push(t);
    try { localStorage.setItem(keyFor(mineP), JSON.stringify(d)); setDirty(mineP, true); } catch { /* */ }
    toast(`Clonada a las tareas de ${profile(mineP).name}.`);
  } else { commit(() => S.tasks.push(t)); toast('Plantilla clonada a tus tareas.', { action: 'Abrir', onAction: () => openTask(t.id) }); }
  Snd.chime();
}
Object.assign(PLUS_ACTS, {
  'tpl-open': () => { openSheet(`${sheetHead('📋 Plantillas de estudio')}<div class="sheet-body">${tplListHTML(allTpls(curFid()))}</div>`); },
  'tpl-clone': (el) => { cloneTpl(el.dataset.fid, el.dataset.id); if (sheet().open && isGroup()) closeSheet(false); },
  'tpl-share': async () => {
    if (!draft || (draft.steps || []).length < 2) { toast('Agrega al menos 2 pasos para compartir.'); return; }
    const fs = myForests(); if (!REG.me || !tokens()[REG.me] || !fs.length) { toast('Para compartir, primero únete a un Salón con tus compañeros.'); return; }
    let fid = fs[0].meta.id;
    if (fs.length > 1) { const v = await ask({ title: '¿En qué Salón la compartes?', options: fs.map((f) => ({ value: f.meta.id, label: `${f.meta.emoji || '🌳'} ${f.meta.name}` })) }); if (!v) return; fid = v; }
    const item = { id: gid(), type: 'tpl', title: draft.title.trim() || 'Plantilla', kind: draft.type, est: +draft.estimate || 0, steps: draft.steps.slice(0, 30).map((s) => ({ text: String(s.text).slice(0, 120), min: +s.min || 0 })), at: Date.now(), by: me() };
    try { await cloudFetch('POST', { kind: 'gitem', as: REG.me, forest: fid, item, device: CLOUD.device }); (FOR.f[fid].items ||= []).push(item); saveFOR(); Snd.chime(); toast('Plantilla compartida con tu Salón. 🎉'); }
    catch (e) { toast(`No se pudo compartir: ${e.message}`); }
  },
});

/* =========================================================
   13. Biblioteca global (lobby de estudio en silencio)
   ========================================================= */
const SLOT = 30 * 60000;
function slotInfo(now = Date.now()) { const start = Math.floor(now / SLOT) * SLOT; const fEnd = start + 25 * 60000; return { start, fEnd, end: start + SLOT, phase: now < fEnd ? 'focus' : 'break' }; }
let LOB = { data: null, busy: false, err: '', t: null };
async function lobbyFetch() {
  if (LOB.busy || !REG.me || !tokens()[REG.me]) return; LOB.busy = true;
  try { LOB.data = await cloudFetch('GET', null, `kind=lobby&as=${encodeURIComponent(REG.me)}`); LOB.err = ''; } catch (e) { LOB.err = /fetch|Network|Failed|Load failed/i.test(e.message) ? 'Sin conexión' : e.message; }
  LOB.busy = false; lobbyPaint();
}
function lobbyBody() {
  if (!REG.me || !tokens()[REG.me]) return '<p class="muted">Entra con tu usuario para unirte a la biblioteca.</p>';
  const s = slotInfo(); const D = LOB.data; const mineJ = (S.vida || {}).lobby && S.vida.lobby.end > Date.now();
  const left = (s.phase === 'focus' ? s.fEnd : s.end) - Date.now();
  const room = (D?.room || []); const cells = [];
  for (let i = 0; i < 6; i++) { const m = room[i]; cells.push(m ? `<div class="lob-c on ${m.id === REG.me ? 'me' : ''}"><span class="lob-av" style="--pc:${m.ghost ? '#8A97A8' : (m.color || '#2F8A5B')}">${m.ghost ? '👻' : esc(initials(m.name))}<i class="fp-dot"></i></span><span class="tiny">${m.id === REG.me ? 'Tú' : m.ghost ? 'Fantasma' : esc(String(m.name).split(' ')[0])}</span></div>` : `<div class="lob-c"><span class="lob-av empty">·</span><span class="tiny faint">Libre</span></div>`); }
  return `<div class="lob-top"><span class="lob-ph">${s.phase === 'focus' ? '🎧 Sesión de enfoque compartida' : '☕ Descanso compartido'}</span><b id="lobClock" class="lob-clock">${mmss(left)}</b><span class="small muted">${s.phase === 'focus' ? 'Todos en la sala ven este mismo contador.' : 'En unos minutos empieza la siguiente sesión.'}</span></div>
    <div class="lob-grid">${cells.join('')}</div>
    <p class="small muted" style="text-align:center;margin:8px 0">🌍 ${D ? `${plural(D.total || 0, 'persona estudiando ahora', 'personas estudiando ahora')} en todo el mundo` : (LOB.err || 'Buscando personas…')}</p>
    ${LOB.err && D ? `<p class="small" style="color:var(--red);text-align:center">${esc(LOB.err)}</p>` : ''}
    <label class="toggle ghost-tg"><span class="t">👻 Modo fantasma <span class="small muted" style="display:block">Solo verán que alguien estudia.</span></span><span class="switch"><input type="checkbox" id="lobGhost" ${PUI.lobGhost ? 'checked' : ''} aria-label="Modo fantasma"><span></span></span></label>
    <div class="btn-row" style="margin-top:12px;justify-content:center">${mineJ ? '<button class="btn" data-act="lobby-leave">Salir de la sala</button>' : (s.phase === 'focus' ? '<button class="btn primary block" data-act="lobby-join">🎧 Entrar a estudiar en silencio</button>' : '<span class="muted small">Podrás entrar cuando empiece la siguiente sesión.</span>')}</div>
    <p class="tiny faint" style="text-align:center;margin-top:10px">Sin chat ni video: solo ves a los demás concentrados. Al terminar ganas semillas 🌰.</p>`;
}
function lobbyPaint() { const b = document.getElementById('lobBox'); if (b) b.innerHTML = lobbyBody(); }
function lobbyOpen() {
  openSheet(`${sheetHead('🌍 Biblioteca global')}<div class="sheet-body"><div id="lobBox"></div></div>`, () => { clearInterval(LOB.t); LOB.t = null; });
  lobbyPaint(); lobbyFetch(); let k = 0; clearInterval(LOB.t);
  LOB.t = setInterval(() => {
    if (!document.getElementById('lobBox')) { clearInterval(LOB.t); LOB.t = null; return; }
    k++; const c = document.getElementById('lobClock'); const s = slotInfo(); if (c) c.textContent = mmss((s.phase === 'focus' ? s.fEnd : s.end) - Date.now());
    if (k % 8 === 0) lobbyFetch();
    const ph = document.querySelector('.lob-ph'); if (ph && (s.phase === 'focus') !== ph.textContent.includes('enfoque')) lobbyPaint();
    lobbyCheck();
  }, 1000);
}
function lobbyCheck() {
  const L = (S.vida || {}).lobby; if (!L || L.rewarded || Date.now() < L.end) return;
  L.rewarded = true; const mins = Math.round((L.end - L.start) / 60000);
  if (mins >= 5) { const v = vidaData(); const r = Math.max(2, Math.round(mins / 5)); v.bonus = (v.bonus || 0) + r; save(); Snd.chime(); confetti(innerWidth / 2, innerHeight / 3, 50); toast(`🎉 Terminaste tu sesión en la biblioteca: +${r} 🌰`, { ms: 6000 }); } else save();
  lobbyPaint();
}
Object.assign(PLUS_ACTS, {
  'lobby-open': () => lobbyOpen(),
  'lobby-join': async () => {
    const s = slotInfo(); if (s.phase !== 'focus') { toast('Espera a que empiece la siguiente sesión.'); return; }
    PUI.lobGhost = !!document.getElementById('lobGhost')?.checked; const now = Date.now();
    try { await cloudFetch('POST', { kind: 'lobby', as: REG.me, end: s.fEnd, ghost: PUI.lobGhost }); (vidaData()).lobby = { start: now, end: s.fEnd, rewarded: false }; save(); Snd.chime(); await lobbyFetch(); }
    catch (e) { toast(`No se pudo entrar: ${e.message}`); }
  },
  'lobby-leave': async () => { try { await cloudFetch('POST', { kind: 'lobby', as: REG.me, leave: true }); } catch { /* */ } if (S.vida) S.vida.lobby = null; save(); await lobbyFetch(); },
});
document.addEventListener('change', (e) => { if (e.target.id === 'lobGhost') PUI.lobGhost = e.target.checked; });

/* =========================================================
   14. Panel inteligente (pantalla que junta todo)
   ========================================================= */
function viewPanel() {
  lobbyCheck();
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Mi panel</h1>
    <p class="page-sub">Entiende tu semana, cuida tu energía y aprende a organizarte mejor.</p>
    <div class="btn-row" style="margin-bottom:12px"><button class="btn danger block" data-act="sos-open">🆘 Nube de emergencia</button><button class="btn block" data-act="lobby-open">🌍 Biblioteca global</button></div>
    ${radarHTML()}${freeHTML()}${critHTML()}${estHTML()}${patternsHTML()}${habitsHTML()}${skillTreeHTML()}
    ${myForests().length ? `<section class="pn-card"><h2 class="serif">Plantillas de mis Salones</h2>${tplListHTML(allTpls())}</section>` : ''}
    <section class="pn-card"><h2 class="serif">Quiz antes de entregar</h2><div class="toggle"><span><span class="t">Preguntarme 3 cosas con mis apuntes</span><span class="d" style="display:block">Solo si tienes apuntes de esa materia.</span></span><label class="switch"><input type="checkbox" data-quiz-set ${S.settings.quizOff ? '' : 'checked'} aria-label="Quiz antes de entregar"><span></span></label></div></section>`;
}
document.addEventListener('change', (e) => { if (e.target.dataset.quizSet !== undefined) { S.settings.quizOff = !e.target.checked; save(); toast(e.target.checked ? 'Quiz activado.' : 'Quiz desactivado.'); } });
Object.assign(VIDA_ACTS, PLUS_ACTS);
