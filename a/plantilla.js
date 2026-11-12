/* Cinnavia 7.59 — Planeación con plantilla propia (Guardián del Bosque).
   El docente puede: (1) crear las tareas a mano, o (2) subir su planeación (Word, PDF, texto, foto) y la app la lee
   en el propio dispositivo, identifica tema, objetivo, desarrollo, materiales, cierre y las tareas del alumnado
   (con fecha, hora, tiempo, criterios y descripción). Luego manda las tareas a uno o varios Bosques.
   Nada se envía a servicios de IA: es lectura por reglas del español. */
'use strict';
const TPL = { open: new Set(), sel: new Set(), pick: new Set(), send: false, paste: false, busy: '' };
const TP_KINDS = { tarea: 'Tarea', proyecto: 'Proyecto', examen: 'Examen', exposicion: 'Exposición', lectura: 'Lectura', practica: 'Práctica', otro: 'Otro' };
const tpNorm = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const tpEl = (id) => document.getElementById(id);
const tpCur = () => (typeof PLD !== 'undefined' ? PLD.cur : null);
const tpTasks = () => { const p = tpCur(); if (!p) return []; p.plan.tasks ||= []; return p.plan.tasks; };

/* ---------- Lectura de archivos (todo local) ---------- */
async function tpZip(buf) {
  const dv = new DataView(buf); const u8 = new Uint8Array(buf); let e = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error('zip');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const out = {};
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const meth = dv.getUint16(p + 10, true), cs = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl)); p += 46 + nl + el + cl;
    out[name] = async () => {
      const ln = dv.getUint16(lo + 26, true), le = dv.getUint16(lo + 28, true); const d = u8.subarray(lo + 30 + ln + le, lo + 30 + ln + le + cs);
      if (meth === 0) return new TextDecoder().decode(d);
      const ds = new Response(new Blob([d]).stream().pipeThrough(new DecompressionStream('deflate-raw'))); return new TextDecoder().decode(await ds.arrayBuffer());
    };
  }
  return out;
}
const tpEnt = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d)).replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/&amp;/g, '&');
function tpDocxText(xml) {
  const paras = xml.split(/<\/w:p>/);
  return paras.map((p) => {
    const bullet = /<w:numPr>/.test(p);
    let t = p.replace(/<w:tab\/>/g, '\t').replace(/<w:br[^>]*\/>/g, '\n').replace(/<\/w:tc>/g, '\t').replace(/<\/w:tr>/g, '\n').replace(/<[^>]+>/g, '');
    t = tpEnt(t); return (bullet && t.trim() ? '• ' : '') + t;
  }).join('\n').replace(/\t+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}
function tpOdtText(xml) {
  let t = xml.replace(/<text:list-item[^>]*>/g, '\n• ').replace(/<\/text:(p|h)>/g, '\n').replace(/<text:tab\/>/g, '\t').replace(/<text:line-break\/>/g, '\n').replace(/<\/table:table-cell>/g, '\t').replace(/<\/table:table-row>/g, '\n').replace(/<[^>]+>/g, '');
  return tpEnt(t).replace(/\t+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}
async function tpPdfText(file) {
  if (typeof lbLoadLib !== 'function') throw new Error('pdf');
  const lib = await lbLoadLib(); const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise; const out = [];
  for (let i = 1; i <= Math.min(doc.numPages, 12); i++) {
    const c = await (await doc.getPage(i)).getTextContent(); let y = null; let line = '';
    for (const it of c.items) { const yy = it.transform ? it.transform[5] : 0; if (y !== null && Math.abs(yy - y) > 3) { out.push(line); line = ''; } line += (line && !/\s$/.test(line) && it.str && !/^\s/.test(it.str) ? ' ' : '') + it.str; y = yy; if (it.hasEOL) { out.push(line); line = ''; y = null; } }
    if (line) out.push(line);
  }
  return out.join('\n');
}
async function tpReadFile(file) {
  const n = tpNorm(file.name); const ty = file.type || '';
  if (/\.(txt|md|csv|text)$/.test(n) || ty.startsWith('text/')) return await file.text();
  if (/\.rtf$/.test(n)) return (await file.text()).replace(/\\par[d]?/g, '\n').replace(/\\tab/g, '\t').replace(/\\'([0-9a-f]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\[a-z]+-?\d* ?/gi, '').replace(/[{}]/g, '');
  if (/\.docx$/.test(n)) { const z = await tpZip(await file.arrayBuffer()); if (!z['word/document.xml']) throw new Error('docx'); return tpDocxText(await z['word/document.xml']()); }
  if (/\.odt$/.test(n)) { const z = await tpZip(await file.arrayBuffer()); if (!z['content.xml']) throw new Error('odt'); return tpOdtText(await z['content.xml']()); }
  if (/\.pdf$/.test(n) || ty === 'application/pdf') return await tpPdfText(file);
  if (/\.(png|jpe?g|webp|heic)$/.test(n) || ty.startsWith('image/')) return await readPhoto(file);
  if (/\.doc$/.test(n)) throw new Error('doc');
  return await file.text();
}

/* ---------- Extracción inteligente ---------- */
const TP_HEADS = [
  ['tema', /^(tema|titulo|nombre de la (clase|sesion|planeacion)|contenido|secuencia didactica|sesion|clase)$/],
  ['materia', /^(asignatura|materia|unidad de aprendizaje|uac|modulo|campo formativo|submodulo)$/],
  ['grupo', /^(grupo|grado|grado y grupo|semestre|grado\/grupo)$/],
  ['fecha', /^(fecha|fecha de la clase|fecha de sesion|dia)$/],
  ['dur', /^(duracion|tiempo|tiempo de la sesion|horas?|sesiones)$/],
  ['obj', /^(objetivo|objetivos|proposito|propositos|aprendizaje esperado|aprendizajes esperados|competencia|competencias|meta de aprendizaje|intencion didactica)$/],
  ['des', /^(desarrollo|actividades|actividades de aprendizaje|secuencia|inicio|apertura|estrategia didactica|procedimiento|momentos)$/],
  ['mat', /^(materiales|recursos|recursos didacticos|material|materiales y recursos)$/],
  ['cie', /^(cierre|conclusion|conclusiones|reflexion|retroalimentacion|metacognicion)$/],
  ['tar', /^(tarea|tareas|trabajo en casa|actividad extraclase|actividades extraclase|para casa|tarea para casa|actividad para casa|productos?|producto de aprendizaje|evidencias?|evidencia de aprendizaje|actividad de evaluacion|trabajo extraclase|asignacion|asignaciones)$/],
  ['crit', /^(criterios?|criterios de evaluacion|rubrica|instrumento de evaluacion|evaluacion|indicadores|se evaluara|lista de cotejo|ponderacion)$/],
];
const TP_VERB = /^(entregar|entrega|elaborar|elabora|investigar|investiga|resolver|resuelve|realizar|realiza|leer|lee|traer|trae|presentar|presenta|redactar|redacta|contestar|contesta|escribir|escribe|hacer|haz|preparar|prepara|desarrollar|desarrolla|construir|construye|dise[nñ]ar|dise[nñ]a|analizar|analiza|exponer|expone|subir|sube|completar|completa|responder|responde|crear|crea|buscar|busca|consultar|consulta|calcular|calcula|resumir|resume|dibujar|dibuja|estudiar|estudia|repasar|repasa|examen|quiz|proyecto|exposicion|ensayo|reporte|cuestionario|practica|mapa|cartel|maqueta)\b/i;
const TP_CRIT_LINE = /^(criterios?(?:\s+de\s+(?:evaluaci[oó]n|calificaci[oó]n))?|r[uú]brica|se\s+evaluar[aá]|evaluaci[oó]n|indicadores|valor|ponderaci[oó]n)\s*[:\-–]?\s*(.*)$/i;
const TP_BUL = /^\s*(?:[•·*▪●◦○\-–—>»]|\(?\d{1,2}[).]|\(?[a-eA-E][).])\s+/;
const TP_FIELD = /^(descripci[oó]n|instrucciones|indicaciones|detalle|actividad)\s*[:\-–]\s*(.*)$/i;
const TP_DATE_LBL = /^(fecha\s+(de\s+)?(entrega|l[ií]mite)|entrega|entregar\s+(el|para)|para\s+el|l[ií]mite)\s*[:\-–]?\s*(.*)$/i;

function tpHead(line) {
  const raw = line.replace(/\t+/g, '\t').trim(); if (!raw) return null;
  let m = /^([^:\t]{2,45})\s*[:\t]\s*(.*)$/.exec(raw); let label, rest;
  if (m) { label = m[1]; rest = m[2]; } else if (raw.length <= 45 && !/[.!?]$/.test(raw)) { label = raw; rest = ''; } else return null;
  const k = tpNorm(label).replace(/^[\d.\s)]+/, '').replace(/[*_#:\s]+$/g, '').replace(/^[#*_\s]+/, '').trim();
  for (const [f, re] of TP_HEADS) if (re.test(k)) return { f, rest: rest.trim() };
  return null;
}
function tpDate(s, ref) {
  const n = tpNorm(s); const y0 = new Date().getFullYear(); let m;
  if ((m = /\b(\d{4})-(\d{2})-(\d{2})\b/.exec(n))) return `${m[1]}-${m[2]}-${m[3]}`;
  if ((m = /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/.exec(n))) { let y = +m[3]; if (y < 100) y += 2000; return `${y}-${String(+m[2]).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`; }
  if ((m = /\b(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+(?:de(?:l)?\s+)?(\d{4}))?/.exec(n))) {
    const mo = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'].indexOf(m[2] === 'setiembre' ? 'septiembre' : m[2]) + 1;
    let y = m[3] ? +m[3] : y0; let iso = `${y}-${String(mo).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`; if (!m[3] && iso < addDays(today(), -60)) iso = `${y + 1}-${iso.slice(5)}`; return iso;
  }
  return null;
}
function tpMinutes(s) {
  const n = tpNorm(s); let m;
  if ((m = /\b(\d{1,2})\s*(?:h|hr|hrs|horas?)\s*(?:y\s*)?(\d{1,2})?\s*(?:min|minutos)?/.exec(n)) && /h/.test(m[0])) return +m[1] * 60 + (+m[2] || 0);
  if ((m = /\b(\d{1,3})\s*(?:min|minutos)\b/.exec(n))) return +m[1];
  return 0;
}
function tpKind(s) {
  const n = tpNorm(s);
  if (/\b(examen|parcial|evaluacion escrita|prueba)\b/.test(n)) return 'examen';
  if (/\b(proyecto|maqueta|prototipo|producto integrador)\b/.test(n)) return 'proyecto';
  if (/\b(exposicion|exponer|presentacion oral|presentar)\b/.test(n)) return 'exposicion';
  if (/\b(leer|lectura|resumen de lectura|libro)\b/.test(n)) return 'lectura';
  if (/\b(practica|ejercicio|ejercicios|problemas|laboratorio|resolver)\b/.test(n)) return 'practica';
  return 'tarea';
}
function tpCritList(s) { return String(s || '').split(/\s*[;•·]\s*|\s*\|\s*|,\s+(?=[A-ZÁÉÍÓÚ0-9])/).map((x) => x.replace(TP_BUL, '').replace(/[.;\s]+$/, '').trim()).filter((x) => x.length > 2); }
function tpTitleOf(line) { let t = line.replace(TP_BUL, '').replace(/^(tarea|actividad)\s*\d*\s*[:\-–]\s*/i, '').trim(); const cut = t.search(/[.;](\s|$)/); let desc = ''; if (t.length > 90) { if (cut > 12 && cut <= 90) { desc = t.slice(cut + 1).trim(); t = t.slice(0, cut); } else { const sp = t.lastIndexOf(' ', 80); desc = t.slice(sp).trim(); t = t.slice(0, sp > 20 ? sp : 80) + '…'; } } return { title: t.replace(/[.\s:;]+$/, ''), desc }; }
const tpBlank = () => ({ id: 'pt' + uid(), title: '', due: '', time: '', est: 0, kind: 'tarea', crit: [], desc: '', value: '', sent: {} });

function tpExtract(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n').map((l) => l.replace(/\u00a0/g, ' ').replace(/[ ]{2,}/g, ' ').replace(/\s+$/, ''));
  const out = { title: '', grupo: '', materia: '', fecha: '', dur: 0, obj: '', des: '', mat: '', cie: '', tar: '', tasks: [], found: [] };
  const sec = {}; let cur = null; const first = [];
  for (const l of lines) {
    if (!l.trim()) { if (cur && sec[cur]?.length && sec[cur][sec[cur].length - 1] !== '') sec[cur].push(''); continue; }
    const h = tpHead(l);
    if (h && !(cur === 'tar' && h.f === 'crit')) { cur = h.f; (sec[cur] ||= []); if (h.rest) sec[cur].push(h.rest); continue; }
    if (cur) sec[cur].push(l.trim()); else first.push(l.trim());
  }
  const body = (k) => (sec[k] || []).join('\n').replace(/\n{2,}/g, '\n').trim();
  const one = (k) => (sec[k] || []).find((x) => x) || '';
  out.title = one('tema').replace(TP_BUL, '') || (first.find((x) => x.length > 3 && x.length < 100 && !tpHead(x)) || '');
  out.materia = one('materia'); out.grupo = one('grupo').slice(0, 40);
  out.fecha = tpDate(one('fecha')) || tpDate(first.join(' ')) || '';
  out.dur = tpMinutes(one('dur')) || tpMinutes(first.join(' ')) || 0;
  for (const k of ['obj', 'des', 'mat', 'cie']) out[k] = body(k);
  if (!out.des) { const alt = body('crit') ? '' : ''; out.des = alt; }
  const defCrit = tpCritList(body('crit')); const globalDue = [...lines].map((l) => TP_DATE_LBL.exec(l.trim())).filter(Boolean).map((m) => tpDate(m[5])).find(Boolean) || '';
  // Tareas: de la sección de tarea; si no hay, de líneas con verbo de acción en el resto
  let cands = (sec.tar || []).filter((l) => l.trim());
  if (!cands.length) cands = [...(sec.des || []), ...(sec.cie || [])].filter((l) => TP_BUL.test(l) ? TP_VERB.test(tpNorm(l.replace(TP_BUL, ''))) : /^(tarea|entrega)\b/i.test(tpNorm(l)));
  let t = null; let mode = '';
  const push = () => { if (t && t.title) out.tasks.push(t); t = null; mode = ''; };
  for (const raw of cands) {
    const line = raw.trim(); const cm = TP_CRIT_LINE.exec(line); const dm = TP_DATE_LBL.exec(line); const fm = TP_FIELD.exec(line);
    if (t && cm && cm[2] !== undefined && !(/^(evaluaci[oó]n|valor|ponderaci[oó]n)$/i.test(cm[1]) && !cm[2])) { mode = cm[2].trim() ? '' : 'crit'; const pm = /(\d{1,3})\s*%/.exec(cm[2]); if (/valor|ponderaci/i.test(cm[1]) && pm) t.value = pm[1]; else tpCritList(cm[2]).forEach((c) => t.crit.push(c)); continue; }
    if (t && dm && tpDate(dm[5])) { t.due = tpDate(dm[5]); const tm = parseQuick(dm[5]).time; if (tm) t.time = tm; mode = ''; continue; }
    if (t && fm && /descripci|instrucci|indicaci|detalle/i.test(fm[1])) { t.desc = (t.desc ? t.desc + '\n' : '') + fm[2]; mode = 'desc'; continue; }
    if (t && mode === 'crit' && TP_BUL.test(line)) { t.crit.push(line.replace(TP_BUL, '')); continue; }
    if (t && mode === 'desc' && TP_BUL.test(line)) { t.desc += '\n' + line.replace(TP_BUL, '• '); continue; }
    if (t && /^(tiempo|duraci[oó]n)\s*(estimad[oa])?\s*[:\-–]/i.test(line)) { t.est = tpMinutes(line) || t.est; continue; }
    if (t && /^(valor|puntos?|puntaje|ponderaci[oó]n)\s*[:\-–]?\s*\d/i.test(tpNorm(line))) { t.value = (/(\d{1,3})/.exec(line) || [])[1] || ''; continue; }
    push();
    const inl = /\b(?:criterios?|r[uú]brica|se\s+evaluar[aá])\s*[:\-–]\s*(.+)$/i.exec(line); const ln = inl ? line.slice(0, inl.index).replace(/[\s.;,(-]+$/, '') : line;
    const q = parseQuick(ln); const base = tpTitleOf(q.title && q.title.length > 3 ? q.title : ln);
    t = tpBlank(); t.title = base.title; t.desc = base.desc; t.due = q.due || tpDate(ln) || ''; t.time = q.time || ''; t.est = tpMinutes(ln) || 0; t.kind = q.type && TP_KINDS[q.type] ? q.type : tpKind(ln);
    if (q.value) t.value = String(q.value);
    if (t.due || /\b(entrega|entregar|antes del?)\b/i.test(t.title)) t.title = t.title.replace(/[,;.]?\s*\b(entrega(?:r)?|para|antes del?)\s+(?:el|la|este|hoy|ma[nñ]ana|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo|\d).*$/i, '');
    t.title = t.title.replace(/\(?\b\d{1,3}\s*(?:min|minutos)\b\)?/i, '').replace(/\s*\([^)]*$/, '').replace(/\s{2,}/g, ' ').replace(/[\s(,;:-]+$/, '').trim();
    if (inl) tpCritList(inl[1]).forEach((c) => t.crit.push(c));
  }
  push();
  const seen = new Set(); out.tasks = out.tasks.filter((x) => { const k = tpNorm(x.title).replace(/[^a-z0-9]/g, ''); if (k.length < 4 || seen.has(k)) return false; seen.add(k); return true; }).slice(0, 25);
  for (const x of out.tasks) { if (!x.crit.length && defCrit.length) x.crit = defCrit.slice(0, 8); if (!x.due && globalDue) x.due = globalDue; x.crit = [...new Set(x.crit)].slice(0, 12); }
  if (!out.tar && cands.length) out.tar = cands.map((x) => x.replace(TP_BUL, '')).join('\n').slice(0, 1500);
  if (!out.tasks.length && (out.tar || '').trim()) { const b = tpTitleOf(out.tar.split('\n')[0]); const x = tpBlank(); x.title = b.title; x.desc = b.desc; x.kind = tpKind(out.tar); x.crit = defCrit; out.tasks.push(x); }
  out.found = ['title', 'materia', 'grupo', 'fecha', 'obj', 'des', 'mat', 'cie'].filter((k) => out[k]);
  if (out.dur) out.found.push('dur');
  return out;
}

/* ---------- Aplicar al formulario ---------- */
function tpSyncForm() { const p = plRead(); return p; }
function tpApply(r) {
  const p = tpSyncForm(); if (!p) return;
  const set = (id, v) => { const e = tpEl(id); if (e && v) e.value = v; };
  set('plTitle', r.title); set('plGrupo', r.grupo); set('plFecha', r.fecha); set('plDur', r.dur ? Math.max(20, Math.min(240, r.dur)) : '');
  set('plObj', r.obj); set('plDes', r.des); set('plMat', r.mat); set('plCie', r.cie);
  set('plTar', r.tasks.length ? r.tasks.map((x) => x.title).join('\n') : r.tar);
  if (r.materia) p.plan.materia = r.materia;
  const list = tpTasks(); const have = new Set(list.map((x) => tpNorm(x.title)));
  let added = 0; for (const x of r.tasks) if (!have.has(tpNorm(x.title))) { list.push(x); added++; if (!x.due) TPL.open.add(x.id); }
  tpRender(); return added;
}
function tpSummary(r, added) {
  const nd = r.tasks.filter((x) => !x.due).length; const parts = [];
  if (r.found.includes('title')) parts.push('tema'); if (r.obj) parts.push('objetivo'); if (r.des) parts.push('desarrollo'); if (r.mat) parts.push('materiales'); if (r.cie) parts.push('cierre');
  return `Leí tu planeación: ${parts.join(', ') || 'poco texto'}${added ? ` y ${plural(added, 'tarea', 'tareas')} para el alumnado` : ', sin tareas claras'}.${nd ? ` ${plural(nd, 'tarea sin fecha', 'tareas sin fecha')}: revísalas.` : ''} Todo es editable.`;
}
async function tpImport(fn) {
  const box = tpEl('tpImpMsg'); if (!box) return; TPL.busy = '1'; box.textContent = 'Leyendo tu planeación…'; box.className = 'tiny tp-msg';
  try {
    const text = await fn(); if (!text || text.replace(/\s/g, '').length < 12) { box.textContent = 'No encontré texto legible. Prueba con otro archivo o pega el texto.'; box.className = 'tiny tp-msg bad'; return; }
    const r = tpExtract(text); const added = tpApply(r); box.textContent = tpSummary(r, added); box.className = 'tiny tp-msg ok'; Snd.chime?.();
    tpEl('tpBox')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) {
    const m = String(e && e.message || '');
    box.textContent = m === 'doc' ? 'Ese es un .doc antiguo. Guárdalo como .docx o PDF y vuelve a subirlo.' : m === 'net' ? 'La lectura de fotos necesita internet la primera vez.' : 'No pude abrir ese archivo. Prueba con Word (.docx), PDF, foto o pega el texto.';
    box.className = 'tiny tp-msg bad';
  } finally { TPL.busy = ''; }
}

/* ---------- Interfaz dentro de la hoja de planeación ---------- */
const tpChipTxt = (x) => [x.due ? longDate(x.due).replace(/^\w/, (c) => c.toUpperCase()) + (x.time ? ' ' + fmtTime(x.time) : '') : 'Sin fecha', x.est ? fmtMinutes(x.est) : '', x.crit.length ? plural(x.crit.length, 'criterio', 'criterios') : ''].filter(Boolean).join(' · ');
function tpTaskHTML(x, i) {
  const sent = Object.keys(x.sent || {}).length;
  return `<div class="tp-t ${x.due ? '' : 'nodue'}" data-ti="${i}"><input type="checkbox" class="tp-sel" data-tp-sel="${x.id}" ${TPL.sel.has(x.id) ? 'checked' : ''} aria-label="Elegir para mandar: ${esc(x.title)}">
    <details ${TPL.open.has(x.id) ? 'open' : ''} data-tp-det="${x.id}"><summary><span class="tp-tt">${esc(x.title) || '<i>Tarea nueva</i>'}</span><span class="tp-ch tiny faint">${esc(tpChipTxt(x))}${sent ? ` · enviada a ${plural(sent, 'Bosque', 'Bosques')}` : ''}</span></summary>
      <div class="tp-form">
        <div class="field"><label>Título</label><input class="input" data-tp="title" value="${esc(x.title)}" maxlength="120" placeholder="Ej. Resolver ejercicios de fracciones"></div>
        <div class="cm-two"><div class="field"><label>Fecha de entrega</label><input type="date" class="input" data-tp="due" value="${esc(x.due)}"></div><div class="field"><label>Hora límite</label><input type="time" class="input" data-tp="time" value="${esc(x.time)}"></div></div>
        <div class="cm-two"><div class="field"><label>Tiempo estimado (min)</label><input type="number" inputmode="numeric" min="0" max="600" step="5" class="input" data-tp="est" value="${x.est || ''}"></div><div class="field"><label>Tipo</label><select class="input" data-tp="kind">${Object.entries(TP_KINDS).map(([k, v]) => `<option value="${k}" ${x.kind === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div></div>
        <div class="field"><label>Valor en la calificación (%) <span class="faint">(opcional)</span></label><input type="number" inputmode="numeric" min="0" max="100" class="input" data-tp="value" value="${esc(x.value)}"></div>
        <div class="field"><label>Criterios de evaluación <span class="faint">(uno por renglón)</span></label><textarea class="input" rows="3" data-tp="crit" maxlength="800">${esc(x.crit.join('\n'))}</textarea></div>
        <div class="field"><label>Descripción e instrucciones</label><textarea class="input" rows="3" data-tp="desc" maxlength="1500">${esc(x.desc)}</textarea></div>
        <div class="tp-row"><button type="button" class="btn danger" data-act="tp-del" data-id="${x.id}">${icon('trash', 'sm')}Quitar</button><span class="grow"></span><button type="button" class="btn" data-act="tp-dup" data-id="${x.id}">Duplicar</button></div>
      </div></details></div>`;
}
function tpForestsHTML() {
  const fs = myForests(); if (!fs.length) return '<p class="tiny faint">Aún no tienes Bosques. Crea uno en la pestaña de Bosques y aquí podrás mandarle tareas.</p>';
  return `<div class="tp-fl">${fs.map((f) => `<label class="tp-f"><input type="checkbox" data-tp-pick="${f.meta.id}" ${TPL.pick.has(f.meta.id) ? 'checked' : ''}><span><b>${esc(f.meta.name)}</b><span class="tiny faint"> · ${plural((f.meta.members || []).length, 'integrante', 'integrantes')}</span></span></label>`).join('')}</div>`;
}
function tpRender() {
  const box = tpEl('tpBox'); if (!box) return; const L = tpTasks(); const nsel = L.filter((x) => TPL.sel.has(x.id)).length; const nsend = nsel || L.length;
  box.innerHTML = `<div class="pl-lh"><h4 class="tp-h">Tareas para el alumnado</h4><span class="tiny faint">${plural(L.length, 'tarea', 'tareas')}</span></div>
    ${L.length ? `<div class="tp-list">${L.map(tpTaskHTML).join('')}</div>` : '<p class="tiny faint" style="margin:4px 0 8px">Crea una tarea a mano o sube tu planeación arriba para que se extraigan solas.</p>'}
    <div class="tp-row"><button type="button" class="btn" data-act="tp-add">${icon('plus', 'sm')}Crear tarea a mano</button>${L.length ? `<button type="button" class="btn primary" data-act="tp-send-toggle">${icon('share', 'sm')}Mandar a Bosques${nsel ? ` (${nsel})` : ''}</button>` : ''}</div>
    ${TPL.send && L.length ? `<div class="tp-send"><p class="tiny" style="margin:0 0 6px"><b>${plural(nsend, 'tarea', 'tareas')}</b> ${nsel ? 'elegidas' : '(todas)'} → elige uno o varios Bosques:</p>${tpForestsHTML()}
      <div class="tp-row"><button type="button" class="link-btn" data-act="tp-pick-all">Elegir todos</button><span class="grow"></span><button type="button" class="btn primary" data-act="tp-send-go">Subir la tarea del día</button></div>
      ${L.some((x) => !x.due) ? '<p class="tiny tp-msg bad" style="margin:6px 0 0">Algunas tareas no tienen fecha de entrega. Se mandarán sin fecha.</p>' : ''}</div>` : ''}`;
}
function tpImportHTML() {
  return `<div class="tp-imp"><div class="pl-lh"><h4 class="tp-h">Mi plantilla</h4></div>
    <p class="tiny faint" style="margin:0 0 8px">Sube tu planeación y la app la lee sola: tema, objetivo, desarrollo, materiales, cierre y las tareas con fecha, hora, tiempo y criterios. Funciona con Word, PDF, foto o texto.</p>
    <div class="tp-row"><label class="btn primary" for="tpFile">${icon('save', 'sm')}Subir mi plantilla</label><input id="tpFile" type="file" class="sr" accept=".docx,.odt,.pdf,.txt,.md,.rtf,image/*,application/pdf" data-tp-file>
      <button type="button" class="btn" data-act="tp-paste">Pegar texto</button></div>
    ${TPL.paste ? `<div class="field" style="margin-top:8px"><textarea id="tpPaste" class="input" rows="6" placeholder="Pega aquí tu planeación completa…"></textarea><div class="tp-row" style="margin-top:6px"><button type="button" class="btn primary" data-act="tp-paste-go">Leer y llenar</button></div></div>` : ''}
    <p id="tpImpMsg" class="tiny tp-msg" role="status"></p></div>`;
}
{
  const base = plSheet;
  plSheet = function (p) {
    base(p); TPL.open = new Set(); TPL.sel = new Set(); TPL.pick = new Set(); TPL.send = false; TPL.paste = false; p.plan.tasks ||= [];
    const body = document.querySelector('.sheet-body'); if (!body) return;
    const imp = document.createElement('div'); imp.className = 'field'; imp.innerHTML = tpImportHTML(); body.prepend(imp);
    const bx = document.createElement('div'); bx.className = 'field tp-box'; bx.id = 'tpBox'; body.appendChild(bx); tpRender();
  };
}
{ const base = plRead; plRead = function () { const p = tpCur(); const keep = p && p.plan ? { tasks: p.plan.tasks, materia: p.plan.materia } : {}; const r = base(); if (r) { r.plan.tasks = keep.tasks || []; if (keep.materia) r.plan.materia = keep.materia; } return r; }; }
{ const base = plText; plText = function (p) { const t = (p.plan?.tasks || []); return base(p) + (t.length ? '\n\nTAREAS PARA EL ALUMNADO\n' + t.map((x, i) => `${i + 1}. ${x.title}${x.due ? ' (entrega ' + x.due + ')' : ''}${x.crit.length ? '\n   Criterios: ' + x.crit.join('; ') : ''}`).join('\n') : ''); }; }
{ const base = plCard; plCard = function (p) { const h = base(p); const t = (p.plan?.tasks || []); if (!t.length) return h; const sent = t.filter((x) => Object.keys(x.sent || {}).length).length; return h.replace('<footer>', `<section class="pl-sec"><h4>Tareas para el alumnado</h4><p>${t.map((x) => esc(x.title) + (x.due ? ` <span class="faint">· ${esc(longDate(x.due))}</span>` : '')).join('<br>')}</p>${sent ? `<p class="tiny faint">${plural(sent, 'enviada', 'enviadas')} a Bosques</p>` : ''}</section><footer>`); }; }

/* ---------- Envío a Bosques ---------- */
function tpItem(x, p, fid) {
  const id = (x.sent && x.sent[fid]) || gid();
  return { id, type: 'task', title: x.title.slice(0, 120), due: x.due || null, time: x.time || '', subject: (p.plan.materia || p.title || '').slice(0, 60), desc: (x.desc || '').trim().slice(0, 2500), crit: x.crit.slice(0, 12).map((c) => String(c).slice(0, 140)), est: +x.est || 0, kind: x.kind, value: +x.value || 0, plan: p.id, grupoDoc: p.plan.grupo || '' };
}
async function tpPost(fid, item) {
  const f = FOR.f[fid]; if (!f) return 'fail'; item.at = Date.now(); item.by = me(); const list = (f.items ||= []); const i = list.findIndex((y) => y.id === item.id);
  if (i >= 0) list[i] = { ...list[i], ...item }; else list.push(item); saveFOR();
  try { await cloudFetch('POST', { kind: 'gitem', as: REG.me, forest: fid, item, device: CLOUD.device }); return 'ok'; }
  catch (e) { if (e.status === 403 || e.status === 401) { if (i < 0) list.splice(list.findIndex((y) => y.id === item.id), 1); saveFOR(); if (e.status === 401) forestAuthLost(e); else toast(e.message); return 'fail'; } (REG.gout ||= []).push({ fid, item }); saveReg(); return 'queued'; }
}
async function tpSendGo(btn) {
  const p = plRead(); if (!p) return; const L = tpTasks(); const pick = L.filter((x) => TPL.sel.has(x.id)); const tasks = (pick.length ? pick : L).filter((x) => x.title.trim());
  const fids = [...TPL.pick].filter((f) => FOR.f[f]);
  if (!tasks.length) { toast('Agrega al menos una tarea con título.'); return; } if (!fids.length) { toast('Elige uno o más Bosques.'); return; }
  btn.disabled = true; let ok = 0, q = 0, bad = 0;
  for (const fid of fids) for (const x of tasks) { const it = tpItem(x, p, fid); const r = await tpPost(fid, it); if (r === 'fail') bad++; else { (x.sent ||= {})[fid] = it.id; r === 'ok' ? ok++ : q++; } }
  btn.disabled = false; TPL.send = false;
  if (p.title && ((p.plan.obj || p.plan.des) || (S.pages || []).some((y) => y.id === p.id))) { p.text = plText(p); p.updated = Date.now(); commit((s) => { s.pages ||= []; const i = s.pages.findIndex((y) => y.id === p.id); if (i >= 0) s.pages[i] = p; else s.pages.push(p); }); }
  tpRender(); try { Snd.chime(); } catch { /* */ }
  toast(bad && !ok && !q ? 'No se pudo mandar. Revisa tu sesión.' : `${plural(ok + q, 'tarea mandada', 'tareas mandadas')} a ${plural(fids.length, 'Bosque', 'Bosques')}.${q ? ' Algunas saldrán cuando vuelva el internet.' : ''}`);
}

document.addEventListener('input', (e) => {
  const f = e.target.dataset?.tp; if (!f) return; const row = e.target.closest('.tp-t'); if (!row) return; const x = tpTasks()[+row.dataset.ti]; if (!x) return; const v = e.target.value;
  if (f === 'crit') x.crit = v.split('\n').map((s) => s.trim()).filter(Boolean); else if (f === 'est' || f === 'value') x[f] = f === 'est' ? Math.max(0, +v || 0) : v; else x[f] = v;
  row.querySelector('.tp-tt').textContent = x.title || 'Tarea nueva'; row.querySelector('.tp-ch').textContent = tpChipTxt(x); row.classList.toggle('nodue', !x.due);
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset?.tpSel) { t.checked ? TPL.sel.add(t.dataset?.tpSel) : TPL.sel.delete(t.dataset?.tpSel); tpRender(); return; }
  if (t.dataset?.tpPick) { t.checked ? TPL.pick.add(t.dataset?.tpPick) : TPL.pick.delete(t.dataset?.tpPick); return; }
  if (t.dataset?.tpFile !== undefined && t.files?.[0]) { const f = t.files[0]; t.value = ''; tpImport(() => tpReadFile(f)); }
});
document.addEventListener('toggle', (e) => { const d = e.target; if (d.dataset?.tpDet) { d.open ? TPL.open.add(d.dataset?.tpDet) : TPL.open.delete(d.dataset?.tpDet); } }, true);
Object.assign(VIDA_ACTS, {
  'tp-add': () => { tpSyncForm(); const x = tpBlank(); const p = tpCur(); x.due = p?.plan?.fecha ? addDays(p.plan.fecha, 1) : ''; tpTasks().push(x); TPL.open.add(x.id); tpRender(); setTimeout(() => document.querySelector(`[data-tp-det="${x.id}"] [data-tp="title"]`)?.focus(), 50); },
  'tp-del': (el) => { const L = tpTasks(); const i = L.findIndex((x) => x.id === el.dataset.id); if (i >= 0) { L.splice(i, 1); TPL.sel.delete(el.dataset.id); tpRender(); } },
  'tp-dup': (el) => { const L = tpTasks(); const i = L.findIndex((x) => x.id === el.dataset.id); if (i < 0) return; const c = JSON.parse(JSON.stringify(L[i])); c.id = 'pt' + uid(); c.sent = {}; c.title += ' (copia)'; L.splice(i + 1, 0, c); TPL.open.add(c.id); tpRender(); },
  'tp-paste': () => { TPL.paste = !TPL.paste; const imp = tpEl('tpImpMsg')?.closest('.field'); if (imp) { imp.innerHTML = tpImportHTML(); tpEl('tpPaste')?.focus(); } },
  'tp-paste-go': () => { const v = tpEl('tpPaste')?.value || ''; tpImport(async () => v); },
  'tp-send-toggle': () => { TPL.send = !TPL.send; tpRender(); },
  'tp-pick-all': () => { const fs = myForests(); const all = fs.every((f) => TPL.pick.has(f.meta.id)); TPL.pick = new Set(all ? [] : fs.map((f) => f.meta.id)); tpRender(); },
  'tp-send-go': (el) => tpSendGo(el),
});

/* ---------- Lado del alumno: criterios, tiempo y tipo ---------- */
{
  const base = openGroupTask;
  openGroupTask = function (id) {
    base(id); const t = gGet(id); if (!t || !(t.crit?.length || t.est || t.kind)) return;
    const body = document.querySelector('.sheet-body'); if (!body || body.querySelector('.tp-info')) return;
    const d = document.createElement('div'); d.className = 'tp-info';
    d.innerHTML = `<div class="tp-chips">${t.kind && TP_KINDS[t.kind] ? `<span class="tp-pill">${esc(TP_KINDS[t.kind])}</span>` : ''}${t.est ? `<span class="tp-pill">≈ ${esc(fmtMinutes(t.est))}</span>` : ''}${t.value ? `<span class="tp-pill">Vale ${+t.value}%</span>` : ''}</div>${t.crit?.length ? `<h4 class="tp-h">Se evaluará</h4><ul class="tp-crit">${t.crit.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}`;
    const anchor = body.querySelector('.btn-row') || body.lastElementChild; body.insertBefore(d, anchor);
  };
}
{
  const base = groupTaskRow;
  groupTaskRow = function (t) {
    const h = base(t); if (!(t.est || t.kind && t.kind !== 'tarea' || t.crit?.length)) return h;
    const chips = [t.kind && t.kind !== 'tarea' && TP_KINDS[t.kind], t.est && '≈ ' + fmtMinutes(t.est), t.crit?.length && plural(t.crit.length, 'criterio', 'criterios')].filter(Boolean).map((c) => `<span class="tp-pill sm">${esc(c)}</span>`).join('');
    return h.replace('<span class="who-line">', `<span class="tp-chips">${chips}</span><span class="who-line">`);
  };
}
