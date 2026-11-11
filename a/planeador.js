/* Cinnavia 7.47 — Planeación de clase express (Guardián del Bosque).
   Una plantilla minimalista dentro de las libretas libres: Objetivo, Desarrollo, Materiales, Cierre y Tarea.
   Se llena a mano o con la barra de comandos ("fracciones 50 min colaborativa", "/cierre", "/tarea…").
   Todo se redacta en el propio dispositivo con plantillas: nada se envía a internet. */
'use strict';
const PL_ENF = {
  expositiva: { n: 'Expositiva guiada', verbo: 'explicar', medio: 'una explicación guiada con ejemplos', fases: [['Explicación', 0.45, 'Presentar {t} paso a paso con dos ejemplos resueltos en el pizarrón.'], ['Práctica guiada', 0.55, 'Resolver juntos un ejercicio y después uno de manera individual sobre {t}, con retroalimentación inmediata.']] },
  practica: { n: 'Práctica', verbo: 'aplicar', medio: 'ejercicios graduales', fases: [['Modelado', 0.25, 'Demostrar un ejemplo completo de {t} pensando en voz alta.'], ['Práctica autónoma', 0.75, 'Resolver una serie de ejercicios de dificultad creciente sobre {t}; la persona docente atiende dudas por mesa.']] },
  colaborativa: { n: 'Trabajo colaborativo', verbo: 'comprender', medio: 'trabajo en equipos', fases: [['Instrucciones', 0.15, 'Formar equipos de 3 o 4 personas y explicar el producto que entregarán sobre {t}.'], ['Trabajo en equipos', 0.55, 'Cada equipo desarrolla el producto y reparte roles; la persona docente supervisa y orienta.'], ['Socialización', 0.3, 'Cada equipo presenta su resultado en dos minutos y recibe una observación del grupo.']] },
  indagacion: { n: 'Indagación', verbo: 'analizar', medio: 'preguntas de indagación', fases: [['Pregunta detonadora', 0.2, 'Plantear una situación o pregunta abierta sobre {t} y recoger hipótesis del grupo.'], ['Exploración', 0.55, 'Analizar fuentes, datos o materiales para contrastar las hipótesis.'], ['Conclusiones', 0.25, 'Compartir hallazgos y formular una conclusión común sobre {t}.']] },
  problemas: { n: 'Resolución de problemas', verbo: 'resolver problemas de', medio: 'situaciones problema', fases: [['Planteamiento', 0.2, 'Presentar una situación problema real relacionada con {t}.'], ['Resolución', 0.55, 'Resolver en parejas, justificando cada decisión; compartir estrategias distintas.'], ['Contraste', 0.25, 'Comparar procedimientos y validar resultados con el grupo.']] },
};
const plTema = (t) => String(t || 'el tema').trim().replace(/[.\s]+$/, '').toLowerCase();
function plSplit(dur) {
  const d = Math.max(20, Math.min(240, +dur || 50)); const ap = Math.max(5, Math.round(d * 0.15)); const ci = Math.max(5, Math.round(d * 0.12)); return { d, ap, ci, mid: d - ap - ci };
}
function plGen(f, plan) {
  const E = PL_ENF[plan.enf] || PL_ENF.expositiva; const t = plTema(plan.title); const { d, ap, ci, mid } = plSplit(plan.dur);
  if (f === 'obj') return `Al finalizar la sesión, el alumnado será capaz de ${E.verbo} ${t}, mediante ${E.medio}, y de explicar con sus propias palabras lo aprendido.`;
  if (f === 'des') {
    let used = 0; const lines = [`1. Apertura (${ap} min): Activar conocimientos previos con dos preguntas sobre ${t} y presentar el objetivo de la sesión.`];
    E.fases.forEach(([n, share, txt], i) => { const last = i === E.fases.length - 1; const m = last ? mid - used : Math.round(mid * share); used += m; lines.push(`${i + 2}. ${n} (${m} min): ${txt.replace('{t}', t)}`); });
    return lines.join('\n');
  }
  if (f === 'mat') return `Pizarrón y marcadores\nApuntes o presentación sobre ${t}\n${plan.enf === 'colaborativa' ? 'Hojas o cartulinas para el producto de cada equipo' : 'Hoja de ejercicios impresa'}\nLista de asistencia`;
  if (f === 'cie') return `Cierre (${ci} min): Recuperar las ideas clave de ${t} con tres preguntas al grupo. Boleto de salida: cada persona escribe en una hoja qué aprendió y qué duda le queda.`;
  if (f === 'tar') return `Resolver una actividad breve sobre ${t} (máximo 20 minutos) y traer una pregunta para la siguiente sesión.`;
  return '';
}
function plParse(cmd) {
  let s = String(cmd || '').trim(); let field = null; const m = /^\/(objetivo|desarrollo|materiales|cierre|tarea)\b/i.exec(s);
  if (m) { field = { objetivo: 'obj', desarrollo: 'des', materiales: 'mat', cierre: 'cie', tarea: 'tar' }[m[1].toLowerCase()]; s = s.slice(m[0].length).trim(); }
  let dur = null; s = s.replace(/(\d{2,3})\s*(?:min(?:utos)?\.?)/i, (_, n) => { dur = +n; return ''; });
  let enf = null; const kw = { expositiva: /expositiv|explic/i, practica: /pr[aá]ctic|ejercicio/i, colaborativa: /colaborativ|equipo|grupal/i, indagacion: /indagaci|investig/i, problemas: /problema/i };
  for (const [k, re] of Object.entries(kw)) if (re.test(s)) { enf = k; s = s.replace(new RegExp('\\b(?:' + re.source + ')\\w*', 'i'), ''); break; }
  return { field, dur, enf, tema: s.replace(/\s+/g, ' ').replace(/^[,;:\s]+|[,;:\s]+$/g, '') };
}
const plText = (p) => { const x = p.plan || {}; return [p.title, [x.grupo, x.fecha && longDate(x.fecha), x.dur && `${x.dur} min`, (PL_ENF[x.enf] || {}).n].filter(Boolean).join(' · '), '', 'OBJETIVO\n' + (x.obj || ''), '', 'DESARROLLO\n' + (x.des || ''), '', 'MATERIALES\n' + (x.mat || ''), '', 'CIERRE\n' + (x.cie || ''), '', 'TAREA\n' + (x.tar || '')].join('\n').trim(); };
const plBlocks = [['obj', 'Objetivo'], ['des', 'Desarrollo'], ['mat', 'Materiales'], ['cie', 'Cierre'], ['tar', 'Tarea']];
function plCard(p) {
  const x = p.plan || {}; const meta = [x.grupo, x.fecha && longDate(x.fecha), x.dur && `${x.dur} min`, (PL_ENF[x.enf] || {}).n].filter(Boolean).map(esc).join(' · ');
  return `<article class="lb-page k-plan lb-tap" data-pid="${p.id}"><header><span class="lb-kind">Planeación de clase</span><h3>${esc(p.title)}</h3></header>${meta ? `<p class="pl-meta">${meta}</p>` : ''}
    ${plBlocks.map(([k, l]) => (x[k] ? `<section class="pl-sec"><h4>${l}</h4><p>${esc(x[k]).replace(/\n/g, '<br>')}</p></section>` : '')).join('')}
    <footer><span class="tiny faint">${esc(relDay(toISO(new Date(p.updated || p.at))))}</span><span class="grow"></span>
      <button class="icon-btn ghost" data-act="pl-copy" data-id="${p.id}" aria-label="Copiar texto" title="Copiar">${icon('note', 'sm')}</button>
      <button class="icon-btn ghost" data-act="pl-print" data-id="${p.id}" aria-label="Imprimir o guardar en PDF" title="Imprimir">${icon('save', 'sm')}</button>
      <button class="icon-btn ghost" data-act="pl-dup" data-id="${p.id}" aria-label="Duplicar" title="Duplicar">${icon('plus', 'sm')}</button>
      <button class="icon-btn ghost" data-act="lb-send" data-id="${p.id}" aria-label="Mandar">${icon('share', 'sm')}</button>
      <button class="icon-btn ghost" data-act="pl-edit" data-id="${p.id}" aria-label="Editar">${icon('edit', 'sm')}</button></footer></article>`;
}
{ const base = pageHTML; pageHTML = function (p) { return p.kind === 'plan' ? plCard(p) : base(p); }; }
{
  const base = viewLibretas;
  viewLibretas = function (arg) {
    const h = base(arg); if (!arg || !calmOn()) return h;
    return h.replace('<div class="lb-add">', `<button type="button" class="btn primary block pl-go" data-act="pl-new" data-sid="${esc(arg)}">${icon('note', 'sm')}Planeación de clase</button><div class="lb-add">`);
  };
  EXTRA_VIEWS.libretas = viewLibretas;
}
const PLD = { cur: null };
const plF = (id) => document.getElementById(id);
function plSheet(p) {
  const isNew = !(S.pages || []).some((x) => x.id === p.id); PLD.cur = p; const x = p.plan;
  const ta = (id, k, l, rows) => `<div class="field"><div class="pl-lh"><label for="${id}">${l}</label><button type="button" class="link-btn" data-act="pl-sug" data-f="${k}">Sugerir</button></div><textarea id="${id}" class="input" rows="${rows}" maxlength="2000">${esc(x[k] || '')}</textarea></div>`;
  openSheet(`${sheetHead(isNew ? 'Planeación de clase' : 'Editar planeación')}<div class="sheet-body">
    <div class="field"><label for="plCmd">Redacción rápida</label><div class="pl-cmd"><input id="plCmd" class="input" maxlength="120" placeholder="Ej. fracciones 50 min colaborativa" autocomplete="off"><button type="button" class="btn" data-act="pl-gen">Generar</button></div>
      <p class="tiny faint" style="margin:6px 0 0">Escribe el tema, la duración y el enfoque, y se arma un borrador que editas. Comandos: /objetivo, /desarrollo, /materiales, /cierre, /tarea.</p></div>
    <div class="field"><label for="plTitle">Tema de la clase</label><input id="plTitle" class="input" maxlength="100" value="${esc(p.title)}" placeholder="Ej. Suma de fracciones"></div>
    <div class="cm-two"><div class="field"><label for="plGrupo">Grupo <span class="faint">(opcional)</span></label><input id="plGrupo" class="input" maxlength="40" value="${esc(x.grupo || '')}" placeholder="Ej. 2.º B"></div><div class="field"><label for="plFecha">Fecha</label><input id="plFecha" type="date" class="input" value="${esc(x.fecha || '')}"></div></div>
    <div class="cm-two"><div class="field"><label for="plDur">Duración (min)</label><input id="plDur" type="number" inputmode="numeric" min="20" max="240" step="5" class="input" value="${esc(x.dur || 50)}"></div><div class="field"><label for="plEnf">Enfoque</label><select id="plEnf" class="input">${Object.entries(PL_ENF).map(([k, v]) => `<option value="${k}" ${x.enf === k ? 'selected' : ''}>${v.n}</option>`).join('')}</select></div></div>
    ${ta('plObj', 'obj', 'Objetivo', 3)}${ta('plDes', 'des', 'Desarrollo', 7)}${ta('plMat', 'mat', 'Materiales', 3)}${ta('plCie', 'cie', 'Cierre', 3)}${ta('plTar', 'tar', 'Tarea', 3)}
  </div><div class="sheet-foot">${isNew ? '<button class="btn" data-act="sheet-close">Cancelar</button>' : `<button class="btn danger" data-act="lb-del" data-id="${p.id}">${icon('trash', 'sm')}Quitar</button>`}<span class="grow"></span><button class="btn primary" data-act="pl-save">Guardar</button></div>`);
  setTimeout(() => (isNew ? plF('plCmd') : plF('plTitle'))?.focus(), 60);
}
const plIds = { obj: 'plObj', des: 'plDes', mat: 'plMat', cie: 'plCie', tar: 'plTar' };
function plRead() {
  const g = (id) => (plF(id)?.value || '').trim(); const p = PLD.cur; if (!p) return null;
  p.title = g('plTitle'); p.plan = { grupo: g('plGrupo'), fecha: g('plFecha'), dur: Math.max(20, Math.min(240, +g('plDur') || 50)), enf: g('plEnf') || 'expositiva', obj: g('plObj'), des: g('plDes'), mat: g('plMat'), cie: g('plCie'), tar: g('plTar') }; return p;
}
function plFill(only, force) {
  const p = plRead(); if (!p) return; if (!p.title) { toast('Escribe primero el tema de la clase.'); plF('plTitle')?.focus(); return; }
  for (const k of Object.keys(plIds)) { if (only && only !== k) continue; if (!only && !force && p.plan[k]) continue; plF(plIds[k]).value = plGen(k, { ...p.plan, title: p.title }); }
}
const plNew = (sid) => ({ id: 'pg' + uid(), kind: 'plan', subjectId: sid, title: '', text: '', tone: 'papel', at: Date.now(), plan: { grupo: '', fecha: today(), dur: 50, enf: 'expositiva', obj: '', des: '', mat: '', cie: '', tar: '' } });
async function plCopy(text) { try { await navigator.clipboard.writeText(text); toast('Planeación copiada.'); } catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); toast('Planeación copiada.'); } catch { toast('No se pudo copiar.'); } t.remove(); } }
Object.assign(VIDA_ACTS, {
  'pl-new': (el) => plSheet(plNew(el.dataset.sid || null)),
  'pl-edit': (el) => { const p = (S.pages || []).find((x) => x.id === el.dataset.id); if (p) plSheet(JSON.parse(JSON.stringify(p))); },
  'pl-gen': () => {
    const c = plParse(plF('plCmd')?.value); const p = plRead(); if (!p) return;
    if (c.tema) plF('plTitle').value = c.tema; if (c.dur) plF('plDur').value = c.dur; if (c.enf) plF('plEnf').value = c.enf;
    if (!plF('plTitle').value.trim()) { toast('Escribe el tema, por ejemplo: fracciones 50 min.'); return; }
    plFill(c.field, !c.field && !!(c.tema || c.dur || c.enf)); plF('plCmd').value = ''; Snd.tick();
  },
  'pl-sug': (el) => plFill(el.dataset.f),
  'pl-save': () => {
    const p = plRead(); if (!p) return; if (!p.title) { toast('Escribe el tema de la clase.'); return; }
    if (!p.plan.obj && !p.plan.des) { toast('Agrega al menos el objetivo o el desarrollo. Puedes usar «Generar».'); return; }
    p.text = plText(p); p.updated = Date.now();
    commit((s) => { s.pages ||= []; const i = s.pages.findIndex((x) => x.id === p.id); if (i >= 0) s.pages[i] = p; else s.pages.push(p); });
    closeSheet(false); toast('Planeación guardada.');
  },
  'pl-dup': (el) => { const p = (S.pages || []).find((x) => x.id === el.dataset.id); if (!p) return; const c = JSON.parse(JSON.stringify(p)); c.id = 'pg' + uid(); c.title = p.title + ' (copia)'; c.at = Date.now(); c.updated = Date.now(); delete c.shared; commit((s) => { s.pages.push(c); }); toast('Planeación duplicada.'); },
  'pl-copy': (el) => { const p = (S.pages || []).find((x) => x.id === el.dataset.id); if (p) plCopy(plText(p)); },
  'pl-print': (el) => {
    const p = (S.pages || []).find((x) => x.id === el.dataset.id); if (!p) return; const x = p.plan || {};
    document.getElementById('plPrint')?.remove(); const d = document.createElement('div'); d.id = 'plPrint';
    d.innerHTML = `<h1>${esc(p.title)}</h1><p class="pl-pm">${[x.grupo, x.fecha && longDate(x.fecha), x.dur && x.dur + ' min', (PL_ENF[x.enf] || {}).n].filter(Boolean).map(esc).join(' · ')}</p>${plBlocks.map(([k, l]) => `<h2>${l}</h2><p>${esc(x[k] || '—').replace(/\n/g, '<br>')}</p>`).join('')}`;
    document.body.appendChild(d); document.body.classList.add('pl-printing');
    const done = () => { document.body.classList.remove('pl-printing'); d.remove(); removeEventListener('afterprint', done); }; addEventListener('afterprint', done); setTimeout(() => { try { window.print(); } catch { done(); } }, 50);
  },
  'pl-quick': async () => {
    let nbs = clNbs();
    if (!nbs.length) { const id = uid(); commit((s) => s.subjects.push({ id, name: 'Planeaciones', color: '#5B6B7F', nb: true, teacher: '', room: '', important: false, schedule: [], notes: '', target: null })); plSheet(plNew(id)); return; }
    if (nbs.length === 1) { plSheet(plNew(nbs[0].id)); return; }
    const v = await ask({ title: '¿En qué libreta?', options: nbs.map((s) => ({ value: s.id, label: s.name, icon: 'book' })) }); if (v) plSheet(plNew(v));
  },
});
