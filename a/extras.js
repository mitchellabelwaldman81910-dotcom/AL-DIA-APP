/* Al Día — extras 7.1: libretas con editor de texto rico, dictado, corrector de ortografía,
   jardín con semillas y misiones, y tareas de Bosque con foto. Se carga antes de app.js. */
'use strict';

/* =========================================================
   1. Corrector de ortografía en español (sin internet, sin claves)
   ========================================================= */
const FIX_WORDS = {
  q: 'que', xq: 'porque', pq: 'porque', porq: 'porque', tb: 'también', tmb: 'también', tambien: 'también', ademas: 'además', despues: 'después',
  asi: 'así', aqui: 'aquí', alli: 'allí', ahi: 'ahí', facil: 'fácil', dificil: 'difícil', util: 'útil', numero: 'número', pagina: 'página', telefono: 'teléfono',
  musica: 'música', ultimo: 'último', ultima: 'última', unico: 'único', unica: 'única', matematicas: 'matemáticas', quimica: 'química', fisica: 'física',
  geografia: 'geografía', biologia: 'biología', tecnologia: 'tecnología', economia: 'economía', informatica: 'informática', ingles: 'inglés', espanol: 'español',
  frances: 'francés', mexico: 'México', manana: 'mañana', anos: 'años', nino: 'niño', nina: 'niña', ninos: 'niños', senor: 'señor', senora: 'señora',
  todavia: 'todavía', porfavor: 'por favor', osea: 'o sea', enserio: 'en serio', apesar: 'a pesar', atravez: 'a través', deacuerdo: 'de acuerdo',
  sinembargo: 'sin embargo', talvez: 'tal vez', aveces: 'a veces', haiga: 'haya', hiba: 'iba', exelente: 'excelente', aser: 'hacer', vien: 'bien',
  mercadotecnia: 'mercadotecnia', empresa: 'empresa', publico: 'público', publicidad: 'publicidad', analisis: 'análisis', ejemplo: 'ejemplo', tecnica: 'técnica',
  tecnico: 'técnico', economico: 'económico', historico: 'histórico', politica: 'política', politico: 'político', quimico: 'químico', practico: 'práctico',
  rapido: 'rápido', rapida: 'rápida', ultimamente: 'últimamente', cafe: 'café', mama: 'mamá', papa: 'papá', jovenes: 'jóvenes', joven: 'joven', examenes: 'exámenes',
  articulo: 'artículo', articulos: 'artículos', parrafo: 'párrafo', capitulo: 'capítulo', titulo: 'título', indice: 'índice', metodo: 'método', modulo: 'módulo',
  esta: 'esta', mas: 'más', tu: 'tu', el: 'el', si: 'si', solo: 'solo', como: 'como', cual: 'cual', quien: 'quien', donde: 'donde', cuando: 'cuando', que: 'que',
};
// las palabras ambiguas (más/mas, él/el, sí/si…) no se tocan: se dejan tal cual
for (const k of ['esta', 'mas', 'tu', 'el', 'si', 'solo', 'como', 'cual', 'quien', 'donde', 'cuando', 'que', 'joven', 'empresa', 'publicidad', 'ejemplo', 'mercadotecnia']) delete FIX_WORDS[k];

function fixCase(orig, rep) {
  if (orig.length > 1 && orig === orig.toUpperCase()) return rep.toUpperCase();
  if (orig[0] !== orig[0].toLowerCase()) return rep[0].toUpperCase() + rep.slice(1);
  return rep;
}
function fixText(text, ctx) {
  let n = 0; const before = text;
  let t = text.replace(/[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+/g, (w) => {
    const low = w.toLowerCase();
    let rep = FIX_WORDS[low];
    if (!rep && /^[a-záéíóúñ]{3,}(c|s)ion$/.test(low)) rep = low.replace(/ion$/, 'ión');
    if (!rep || rep === low) return w;
    n++; return fixCase(w, rep);
  });
  t = t.replace(/\u00a0/g, ' ').replace(/[ \t]{2,}/g, (m) => { n++; return ' '; });
  t = t.replace(/[ \t]+([,;.!?:])/g, (m, p) => { n++; return p; });
  t = t.replace(/([,;])(?=[^\s\d,;)"'])/g, (m, p) => { n++; return p + ' '; });
  t = t.replace(/(:)(?=[^\s\d/)"'])/g, (m, p) => { n++; return p + ' '; });
  t = t.replace(/([a-záéíóúñ])\.(?=[A-ZÁÉÍÓÚÑ][a-záéíóúñ])/g, (m, p) => { n++; return p + '. '; });
  // mayúscula al empezar y después de punto
  t = t.replace(/(^|[.!?¿¡]\s+|\n\s*)([a-záéíóúñ])/g, (m, pre, ch, off) => {
    if (off === 0 && ctx && !/[.!?\n]\s*$/.test(ctx)) return m;
    n++; return pre + ch.toUpperCase();
  });
  // signos de apertura que faltan
  t = t.replace(/(^|[.!\n]\s*)([^.!?\n¿¡]*?[a-záéíóúñ][^.!?\n¿¡]*?)\?/g, (m, pre, body) => { if (/¿/.test(body)) return m; n++; return pre + '¿' + body.trimStart() + '?'; });
  t = t.replace(/(^|[.?\n]\s*)([^.!?\n¿¡]*?[a-záéíóúñ][^.!?\n¿¡]*?)!/g, (m, pre, body) => { if (/¡/.test(body)) return m; n++; return pre + '¡' + body.trimStart() + '!'; });
  return { text: t, n: t === before ? 0 : n };
}
function fixEditor(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  let total = 0, ctx = '';
  for (const nd of nodes) {
    const r = fixText(nd.nodeValue, ctx);
    if (r.text !== nd.nodeValue) { nd.nodeValue = r.text; total += r.n; }
    ctx = (ctx + nd.nodeValue).slice(-3);
  }
  return total;
}

/* =========================================================
   2. Editor de texto rico para apuntes
   ========================================================= */
const NOTE_FONTS = [
  ['Normal', '-apple-system, system-ui, sans-serif'], ['Redondeada', 'ui-rounded, "SF Pro Rounded", system-ui, sans-serif'], ['Escolar', '"AlDia Schola", Georgia, serif'],
  ['Elegante', 'Georgia, serif'], ['Clásica', 'Palatino, "Palatino Linotype", "Book Antiqua", serif'], ['Didot', 'Didot, "Bodoni 72", serif'],
  ['Máquina de escribir', '"American Typewriter", "Courier New", monospace'], ['Código', 'Menlo, Courier, monospace'],
  ['A mano', '"Bradley Hand", "Noteworthy", "Marker Felt", cursive'], ['Pizarrón', '"Chalkboard SE", "Chalkduster", cursive'],
  ['Caligrafía', '"Snell Roundhand", "Zapfino", cursive'], ['Marcador', '"Marker Felt", "Comic Sans MS", cursive'],
  ['Moderna', 'Avenir, "Helvetica Neue", sans-serif'], ['Condensada', '"Avenir Next Condensed", "Arial Narrow", sans-serif'],
  ['Bonita', 'Optima, "Gill Sans", sans-serif'], ['Titulares', 'Impact, "Arial Black", sans-serif'],
];
const NOTE_SIZES = [['Chica', '15px'], ['Normal', '17px'], ['Grande', '20px'], ['Enorme', '24px'], ['Gigante', '30px']];
const NOTE_PAPERS = [['liso', 'Lisa'], ['rayado', 'Rayada'], ['cuadros', 'Cuadrícula'], ['puntos', 'Puntos']];
const PAPER_COLORS = ['#FFFFFF', '#FFF8DC', '#EAF6EA', '#E6F1FB', '#FBEAF0', '#F1EAFB', '#2B332F'];
const TEXT_COLORS = ['#1B3A2D', '#000000', '#C0392B', '#D35400', '#B7950B', '#1E8449', '#2471A3', '#7D3C98', '#5D6D7E', '#FFFFFF'];
const HILITES = ['#FFF59D', '#C8E6C9', '#B3E5FC', '#F8BBD0', '#FFE0B2', '#E1BEE7', 'transparent'];
const LIB_EMOJI = [];
const LIB_COLORS = ['#2F8A5B', '#3E9A93', '#5B7FD1', '#B07AC8', '#D27C5E', '#C9A55C', '#4F9A63', '#7A8CA8'];

const OK_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'SPAN', 'DIV', 'P', 'BR', 'H1', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'HR', 'FONT', 'SUB', 'SUP']);
const OK_CSS = /^(color|background-color|font-family|font-size|font-weight|font-style|text-decoration(-line)?|text-align)$/;
function cleanHTML(html) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const walk = (el) => {
    for (const ch of [...el.children]) {
      if (!OK_TAGS.has(ch.tagName)) { if (/^(SCRIPT|STYLE|IFRAME|OBJECT|EMBED|LINK|META)$/.test(ch.tagName)) ch.remove(); else { walk(ch); ch.replaceWith(...ch.childNodes); } continue; }
      const style = ch.getAttribute('style') || '';
      for (const a of [...ch.attributes]) ch.removeAttribute(a.name);
      const keep = style.split(';').map((s) => s.trim()).filter((s) => { const k = s.split(':')[0]?.trim().toLowerCase(); return OK_CSS.test(k) && !/url\(|expression|javascript/i.test(s); });
      if (keep.length) ch.setAttribute('style', keep.join('; '));
      walk(ch);
    }
  };
  walk(doc.body);
  return doc.body.innerHTML;
}
const noteHTMLof = (n) => (n.html ? cleanHTML(n.html) : esc(n.body || '').replace(/\n/g, '<br>'));
const isDarkPaper = (c) => c === '#2B332F';

function noteEditorStyle(d) {
  const f = d.font || NOTE_FONTS[0][1]; const sz = d.size || '17px';
  const bg = d.pcolor || '#FFFFFF';
  return `font-family:${f.replace(/"/g, '&quot;')};font-size:${sz};background-color:${bg};color:${isDarkPaper(bg) ? '#F2F2EC' : '#1B3A2D'}`;
}
function libretas() { return (S.libretas ||= []); }
function noteEditorHTML(d) {
  const sw = (arr, cmd, cur) => arr.map((c) => `<button type="button" class="sw" data-rt="${cmd}" data-v="${c}" style="--c:${c === 'transparent' ? '#fff' : c}" aria-label="${c === 'transparent' ? 'Quitar resaltado' : 'Color ' + c}">${c === 'transparent' ? icon('x', 'sm') : ''}</button>`).join('');
  return `<div class="rt-wrap">
    <div class="rt-bar" role="toolbar" aria-label="Formato del texto">
      <button type="button" data-rt="bold" aria-label="Negrita"><b>N</b></button><button type="button" data-rt="italic" aria-label="Cursiva"><i>C</i></button><button type="button" data-rt="underline" aria-label="Subrayado"><u>S</u></button><button type="button" data-rt="strikeThrough" aria-label="Tachado"><s>T</s></button>
      <button type="button" data-rt="formatBlock" data-v="h2" aria-label="Título">Título</button><button type="button" data-rt="formatBlock" data-v="p" aria-label="Párrafo normal">Párrafo</button>
      <button type="button" data-rt="insertUnorderedList" aria-label="Lista">• Lista</button><button type="button" data-rt="insertOrderedList" aria-label="Lista numerada">1. Lista</button>
      <button type="button" data-rt="justifyLeft" aria-label="Alinear a la izquierda">⇤</button><button type="button" data-rt="justifyCenter" aria-label="Centrar">↔</button><button type="button" data-rt="justifyRight" aria-label="Alinear a la derecha">⇥</button>
      <button type="button" data-rt="undo" aria-label="Deshacer">↶</button><button type="button" data-rt="redo" aria-label="Rehacer">↷</button><button type="button" data-rt="removeFormat" aria-label="Quitar formato">Aa</button>
    </div>
    <div class="rt-bar rt-sel"><label>Letra<select data-rtsel="fontName" aria-label="Tipo de letra">${NOTE_FONTS.map(([n, f]) => `<option value="${esc(f)}" style="font-family:${esc(f)}">${n}</option>`).join('')}</select></label>
      <label>Tamaño<select data-rtsel="fontSize" aria-label="Tamaño del texto"><option value="2">Chica</option><option value="3" selected>Normal</option><option value="5">Grande</option><option value="6">Enorme</option><option value="7">Gigante</option></select></label></div>
    <div class="rt-bar rt-colors"><span class="tiny faint">Color</span>${sw(TEXT_COLORS, 'foreColor')}<span class="tiny faint">Resaltar</span>${sw(HILITES, 'hiliteColor')}</div>
    <div class="rt-edit paper-${d.paper || 'liso'}" id="nRich" contenteditable="true" spellcheck="true" lang="es" autocapitalize="sentences" autocorrect="on" role="textbox" aria-multiline="true" aria-label="Texto del apunte" data-ph="Escribe aquí o toca Dictar…" style="${noteEditorStyle(d)}">${noteHTMLof(d)}</div>
    <div class="btn-row rt-tools"><button type="button" class="btn" data-rt="dictate" id="rtDictate">${icon('mic', 'sm')}Dictar</button><button type="button" class="btn" data-rt="spell">${icon('spark', 'sm')}Corregir ortografía</button><label class="btn" for="ocrIn">${icon('cam')}Foto a texto</label><input id="ocrIn" type="file" accept="image/*" class="sr" data-ocr-in></div>
    <div class="row2" style="margin-top:12px"><div class="field"><label for="nLib">Libreta</label><select id="nLib" class="input" data-nf="libreta"><option value="">Sin libreta</option>${libretas().map((l) => `<option value="${l.id}" ${d.libreta === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}<option value="__new">+ Nueva libreta…</option></select></div>
      <div class="field"><label for="nPaper">Hoja</label><select id="nPaper" class="input" data-nf="paper">${NOTE_PAPERS.map(([k, l]) => `<option value="${k}" ${(d.paper || 'liso') === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    <div class="row2"><div class="field"><label for="nFont">Letra de toda la hoja</label><select id="nFont" class="input" data-nf="font">${NOTE_FONTS.map(([n, f]) => `<option value="${esc(f)}" ${(d.font || NOTE_FONTS[0][1]) === f ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label for="nSize">Tamaño base</label><select id="nSize" class="input" data-nf="size">${NOTE_SIZES.map(([n, s]) => `<option value="${s}" ${(d.size || '17px') === s ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
    <div class="field"><span class="lbl">Color de la hoja</span><div class="swatches">${PAPER_COLORS.map((c) => `<button type="button" data-nfc="${c}" class="${(d.pcolor || '#FFFFFF') === c ? 'on' : ''}" style="--c:${c}" aria-label="Hoja ${c}"></button>`).join('')}</div></div>
  </div>`;
}

let rtRange = null; let dictation = null;
document.addEventListener('selectionchange', () => {
  const ed = document.getElementById('nRich'); const s = getSelection();
  if (ed && s && s.rangeCount && ed.contains(s.anchorNode)) rtRange = s.getRangeAt(0).cloneRange();
});
function rtSync() {
  const ed = document.getElementById('nRich'); if (!ed || !draft) return;
  draft.html = cleanHTML(ed.innerHTML); draft.body = ed.innerText.replace(/ /g, ' ').trim(); draftDirty = true;
}
function rtExec(cmd, val) {
  const ed = document.getElementById('nRich'); if (!ed) return;
  ed.focus();
  if (rtRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(rtRange); }
  try { document.execCommand('styleWithCSS', false, true); } catch { /* */ }
  document.execCommand(cmd, false, val);
  rtSync();
}
function rtInsert(text) {
  const ed = document.getElementById('nRich'); if (!ed) return;
  ed.focus();
  if (rtRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(rtRange); }
  else { const r = document.createRange(); r.selectNodeContents(ed); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
  document.execCommand('insertText', false, text); rtSync();
}
function stopDictation() { if (dictation) { try { dictation.stop(); } catch { /* */ } dictation = null; } const b = document.getElementById('rtDictate'); if (b) { b.classList.remove('rec'); b.innerHTML = icon('mic', 'sm') + 'Dictar'; } }
function toggleDictation() {
  if (dictation) { stopDictation(); const ed = document.getElementById('nRich'); if (ed) { const n = fixEditor(ed); rtSync(); if (n) toast(`Dictado listo. Corregí ${plural(n, 'detalle', 'detalles')} de ortografía.`); } return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast(isIOS() ? 'Para dictar en iPhone o iPad, usa el micrófono del teclado (abajo a la derecha): también se escribe aquí.' : 'Este navegador no permite dictar. Prueba con Chrome o Safari.'); return; }
  const r = new SR(); r.lang = 'es-MX'; r.continuous = true; r.interimResults = false;
  r.onresult = (e) => { for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) rtInsert(e.results[i][0].transcript.trim() + ' '); };
  r.onerror = (e) => { if (e.error === 'not-allowed') toast('Permite el micrófono para poder dictar.'); stopDictation(); };
  r.onend = () => { if (dictation === r) stopDictation(); };
  try { r.start(); dictation = r; const b = document.getElementById('rtDictate'); if (b) { b.classList.add('rec'); b.textContent = '⏹️ Detener'; } toast('Te escucho. Habla con calma.'); }
  catch { toast('No pude activar el micrófono.'); }
}
function applyNoteStyle() {
  const ed = document.getElementById('nRich'); if (!ed || !draft) return;
  ed.setAttribute('style', noteEditorStyle(draft)); ed.className = `rt-edit paper-${draft.paper || 'liso'}`;
}

document.addEventListener('pointerdown', (e) => { if (e.target.closest('[data-rt]') && !e.target.closest('label')) e.preventDefault(); });
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-rt]'); if (b && !b.closest('label')) {
    e.preventDefault(); const c = b.dataset.rt;
    if (c === 'dictate') toggleDictation();
    else if (c === 'spell') {
      const ed = document.getElementById('nRich'); if (!ed) return;
      const prev = ed.innerHTML; const n = fixEditor(ed); rtSync();
      if (n) { toast(`Corregí ${plural(n, 'detalle', 'detalles')} de ortografía y puntuación.`, { action: 'Deshacer', onAction: () => { ed.innerHTML = prev; rtSync(); } }); Snd.chime(); } else toast('Todo se ve bien. No encontré errores.');
    } else rtExec(c, b.dataset.v);
    return;
  }
  const c = e.target.closest('[data-nfc]');
  if (c && draft) { draft.pcolor = c.dataset.nfc; draftDirty = true; applyNoteStyle(); c.parentElement.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === c)); }
});
document.addEventListener('change', async (e) => {
  const el = e.target;
  if (el.dataset.rtsel) { rtExec(el.dataset.rtsel, el.value); if (el.dataset.rtsel === 'fontSize') el.value = '3'; return; }
  if (el.dataset.ocrIn !== undefined && el.files?.[0]) {
    const f = el.files[0]; el.value = ''; toast('Leyendo la foto… puede tardar un poco la primera vez.', { ms: 5000 });
    try { const t = await readPhoto(f); if (!t) { toast('No pude leer texto en esa foto.'); return; } rtInsert(t + '\n'); const ed = document.getElementById('nRich'); if (ed) { const n = fixEditor(ed); rtSync(); toast(`Texto agregado${n ? ` y corregí ${plural(n, 'detalle', 'detalles')}` : ''}.`); } }
    catch { toast('No se pudo leer la foto. Intenta con más luz.'); }
    return;
  }
  const k = el.dataset.nf; if (!k || !draft) return;
  if (k === 'libreta' && el.value === '__new') {
    const l = await newLibreta(); el.value = l ? l.id : ''; draft.libreta = l ? l.id : ''; draftDirty = true;
    if (l) { const o = document.createElement('option'); o.value = l.id; o.textContent = l.name; el.insertBefore(o, el.querySelector('option[value="__new"]')); el.value = l.id; }
    return;
  }
  draft[k] = el.value; draftDirty = true; if (k !== 'libreta') applyNoteStyle();
});
document.addEventListener('input', (e) => { if (e.target.id === 'nRich') rtSync(); });
document.addEventListener('paste', (e) => {
  if (e.target.id !== 'nRich') return; e.preventDefault();
  const t = (e.clipboardData || window.clipboardData).getData('text/plain'); document.execCommand('insertText', false, t); rtSync();
});

/* =========================================================
   3. Libretas
   ========================================================= */
async function newLibreta() {
  const name = await ask({ title: 'Nueva libreta', text: 'Una libreta junta apuntes de un mismo tema, como una materia o un proyecto.', input: { placeholder: 'Ej. Mercadotecnia' }, ok: 'Crear' });
  if (!name) return null;
  const l = { id: uid(), name: name.slice(0, 30), color: LIB_COLORS[libretas().length % LIB_COLORS.length] };
  S.libretas.push(l); save(); Snd.chime(); return l;
}
function libretaBarHTML() {
  const ls = libretas(); const cur = UI.libreta || '';
  const cnt = (id) => S.notes.filter((n) => (n.libreta || '') === id).length;
  return `<div class="lib-bar" role="group" aria-label="Libretas"><button type="button" class="lib ${!cur ? 'on' : ''}" data-act="lib-pick" data-v="">Todas <b>${S.notes.length}</b></button>
    ${ls.map((l) => `<button type="button" class="lib ${cur === l.id ? 'on' : ''}" style="--c:${l.color}" data-act="lib-pick" data-v="${l.id}"><i class="lib-dot"></i>${esc(l.name)} <b>${cnt(l.id)}</b></button>`).join('')}
    <button type="button" class="lib add" data-act="lib-new">+ Libreta</button></div>
    ${cur && ls.find((l) => l.id === cur) ? `<p class="small muted" style="margin:6px 0 0"><button class="link-btn" data-act="lib-edit" data-id="${cur}">Renombrar o borrar esta libreta</button></p>` : ''}`;
}

/* =========================================================
   4. Jardín, semillas y misiones del día (el minijuego)
   ========================================================= */
const GARDEN = [
  { id: 'mush', name: 'Hongos mágicos', cost: 20, lvl: 2, emoji: 'mushroom' }, { id: 'bench', name: 'Banca de madera', cost: 35, lvl: 5, emoji: 'bench' },
  { id: 'lantern', name: 'Farol de luz', cost: 45, lvl: 8, emoji: 'lamp' }, { id: 'fence', name: 'Cerquita', cost: 55, lvl: 10, emoji: 'home' },
  { id: 'birdhouse', name: 'Casita de pájaros', cost: 60, lvl: 12, emoji: 'home' }, { id: 'bunny', name: 'Conejito', cost: 90, lvl: 16, emoji: 'paw' },
  { id: 'windmill', name: 'Molino', cost: 120, lvl: 22, emoji: 'wind' }, { id: 'fox', name: 'Zorrito', cost: 150, lvl: 28, emoji: 'paw' },
  { id: 'fountain', name: 'Fuente', cost: 200, lvl: 35, emoji: 'drop' }, { id: 'balloon', name: 'Globo aerostático', cost: 260, lvl: 45, emoji: 'balloon' },
  { id: 'tent', name: 'Casita de campaña', cost: 320, lvl: 55, emoji: 'tent' }, { id: 'chest', name: 'Cofre del tesoro', cost: 400, lvl: 70, emoji: 'gem' },
];
/* gardenSVG: ver linea.js */
function vidaData() { return (S.vida ||= { garden: [], bonus: 0, claimed: {} }); }
function seedsOf(c) { const v = vidaData(); const spent = (v.garden || []).reduce((a, k) => a + (GARDEN.find((g) => g.id === k)?.cost || 0), 0); return Math.max(0, Math.floor(c.life / 2) + (v.bonus || 0) - spent); }
function questsToday() {
  const t0 = today(); const v = vidaData(); v.claimed ||= {};
  const sameDay = (ms) => ms && toISO(new Date(ms)) === t0;
  const dueToday = S.tasks.filter((t) => t.due === t0);
  const Q = [
    { id: 'entrega', icon: 'checkc', text: 'Entrega una tarea', ok: S.tasks.some((t) => t.done && sameDay(t.doneAt)), reward: 6 },
    { id: 'nueva', icon: 'plus', text: 'Sube una tarea nueva', ok: S.tasks.some((t) => sameDay(t.created)), reward: 3 },
    { id: 'apunte', icon: 'notebook', text: 'Escribe un apunte o pensamiento', ok: S.notes.some((n) => sameDay(n.updated)) || S.thoughts.some((x) => sameDay(x.at)), reward: 4 },
    { id: 'hoy', icon: 'target', text: 'Termina todo lo de hoy', ok: dueToday.length > 0 && dueToday.every((t) => t.done), reward: 8 },
  ];
  return Q.map((q) => ({ ...q, claimed: !!v.claimed[`${t0}:${q.id}`] }));
}
function questsHTML() {
  const Q = questsToday(); const done = Q.filter((q) => q.claimed).length;
  return `<div class="card quests"><div class="q-head"><b class="serif">Misiones de hoy</b><span class="chip ${done === Q.length ? 'pen' : ''}">${done}/${Q.length}</span></div>
    ${Q.map((q) => `<div class="quest ${q.ok ? 'ok' : ''}"><span class="q-ico">${icon(q.icon)}</span><span class="q-t">${esc(q.text)}</span>${q.claimed ? '<span class="chip pen">Listo</span>' : q.ok ? `<button class="btn primary" data-act="quest-claim" data-id="${q.id}">+${q.reward} monedas</button>` : `<span class="small muted">+${q.reward} monedas</span>`}</div>`).join('')}</div>`;
}
function gardenTabHTML(c) {
  const v = vidaData(); const bal = seedsOf(c);
  return `<div class="card seeds"><span class="seed-n">${icon('seed', 'sm')} <b id="seedBal">${bal}</b></span><span class="small muted">semillas para decorar tu jardín. Ganas 1 por cada 2 puntos del árbol y con las misiones.</span></div>
    ${questsHTML()}
    <h2 class="sec">Tienda del jardín <small>${(v.garden || []).length}/${GARDEN.length} en tu jardín</small></h2>
    <div class="shop">${GARDEN.map((g) => {
      const own = (v.garden || []).includes(g.id); const locked = c.level < g.lvl; const can = !own && !locked && bal >= g.cost;
      return `<div class="shop-i ${own ? 'own' : ''} ${locked ? 'locked' : ''}"><span class="s-ico">${locked ? icon('lock') : icon(g.emoji)}</span><b>${esc(g.name)}</b>
        ${own ? '<span class="chip pen">En tu jardín</span>' : locked ? `<span class="small muted">Nivel ${g.lvl}</span>` : `<button class="btn ${can ? 'primary' : ''}" data-act="garden-buy" data-id="${g.id}" ${can ? '' : 'aria-disabled="true"'}>${g.cost} semillas</button>`}</div>`;
    }).join('')}</div>`;
}
Object.assign(VIDA_ACTS, {
  'quest-claim': (el) => {
    const q = questsToday().find((x) => x.id === el.dataset.id); if (!q || !q.ok || q.claimed) return;
    const v = vidaData(); v.claimed[`${today()}:${q.id}`] = 1; v.bonus = (v.bonus || 0) + q.reward;
    for (const k of Object.keys(v.claimed)) if (k.slice(0, 10) < addDays(today(), -14)) delete v.claimed[k];
    commit(); Snd.chime(); leafBurst(el); toast(`+${q.reward} monedas`);
  },
  'garden-buy': (el) => {
    const g = GARDEN.find((x) => x.id === el.dataset.id); if (!g) return;
    const c = treeNow(dataOwner()); const v = vidaData();
    if ((v.garden || []).includes(g.id)) return;
    if (c.level < g.lvl) { toast(`Se desbloquea en el nivel ${g.lvl}.`); return; }
    if (seedsOf(c) < g.cost) { toast(`Te faltan ${g.cost - seedsOf(c)} semillas. Entrega tareas y completa misiones.`); return; }
    (v.garden ||= []).push(g.id); VUI.tab = 'arbol'; VUI.pour = Date.now() + 3000; commit(); Snd.chime(); setTimeout(() => leafBurst($('.vscene')), 250);
    toast(`${g.name} ya vive en tu jardín.`);
  },
  'lib-pick': (el) => { UI.libreta = el.dataset.v || ''; render(); },
  'lib-new': async () => { const l = await newLibreta(); if (l) { UI.libreta = l.id; render(); } },
  'lib-edit': async (el) => {
    const l = libretas().find((x) => x.id === el.dataset.id); if (!l) return;
    const v = await ask({ title: l.name, cancel: 'Cerrar', options: [{ value: 'rename', label: 'Cambiar nombre', icon: 'edit' }, { value: 'del', label: 'Borrar libreta (los apuntes se quedan)', icon: 'trash' }] });
    if (v === 'rename') { const n = await ask({ title: 'Nombre de la libreta', input: { value: l.name }, ok: 'Guardar' }); if (n) { l.name = n.slice(0, 30); commit(); } }
    else if (v === 'del') { const ok = await ask({ title: '¿Borrar la libreta?', text: 'Los apuntes no se borran: solo quedan sin libreta.', ok: 'Borrar', danger: true }); if (ok) { S.notes.forEach((n) => { if (n.libreta === l.id) n.libreta = ''; }); S.libretas = S.libretas.filter((x) => x.id !== l.id); UI.libreta = ''; commit(); } }
  },
});

/* =========================================================
   5. Tareas del Bosque con foto e instrucciones
   ========================================================= */
function fileToDataURL(file, max = 1100, q = 0.6) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(img.src);
      res(c.toDataURL('image/jpeg', q));
    };
    img.onerror = () => rej(new Error('img'));
    img.src = URL.createObjectURL(file);
  });
}
const gImgCache = new Map();
async function loadGImg(fid, id) {
  if (gImgCache.has(id)) return gImgCache.get(id);
  try { const c = await DB.get('files', 'gi:' + id); if (c) { gImgCache.set(id, c); return c; } } catch { /* */ }
  try { const r = await cloudFetch('GET', null, `kind=gimg&forest=${encodeURIComponent(fid)}&id=${encodeURIComponent(id)}&as=${encodeURIComponent(REG.me)}`); if (r.data) { gImgCache.set(id, r.data); DB.put('files', 'gi:' + id, r.data).catch(() => {}); return r.data; } } catch { /* */ }
  return null;
}
let gNewPhoto = null;
function openGroupNew() {
  gNewPhoto = null;
  openSheet(`${sheetHead('Tarea para el Bosque')}<div class="sheet-body">
    <div class="field"><label for="gnTitle" class="sr">Título</label><input id="gnTitle" class="title-input" placeholder="Ej. Tarea de hoy: mapa conceptual"></div>
    <div class="row2"><div class="field"><label for="gnDue">Entrega</label><input id="gnDue" class="input" type="date" value="${addDays(today(), 1)}"></div><div class="field"><label for="gnTime">Hora</label><input id="gnTime" class="input" type="time"></div></div>
    <div class="field"><label for="gnSubj">Materia</label><input id="gnSubj" class="input" placeholder="Ej. Mercadotecnia"></div>
    <div class="field"><label for="gnDesc">Instrucciones</label><textarea id="gnDesc" class="input" placeholder="Escribe lo que pidió el profe o pega el texto…"></textarea></div>
    <div class="field"><span class="lbl">Foto de las instrucciones</span><div id="gnPrev"></div><label class="btn" for="gnImg" style="align-self:flex-start">${icon('cam')}Tomar o elegir foto</label><input id="gnImg" type="file" accept="image/*" class="sr" data-gn-img></div>
  </div><div class="sheet-foot"><span class="grow"></span><button class="btn primary" data-act="g-new-save">${icon('plus')}Subir al Bosque</button></div>`);
  setTimeout(() => $('#gnTitle')?.focus(), 60);
}
document.addEventListener('change', async (e) => {
  if (e.target.dataset.gnImg === undefined || !e.target.files?.[0]) return;
  try { gNewPhoto = await fileToDataURL(e.target.files[0]); $('#gnPrev').innerHTML = `<img class="gimg" src="${gNewPhoto}" alt="Foto de las instrucciones">`; if (!$('#gnTitle').value.trim()) $('#gnTitle').focus(); }
  catch { toast('No se pudo cargar esa foto.'); }
});
Object.assign(VIDA_ACTS, {
  'g-new': () => openGroupNew(),
  'g-new-save': async (el) => {
    const title = $('#gnTitle').value.trim(); if (!title) { toast('Ponle un título a la tarea.'); return; }
    el.disabled = true; const id = gid(); const fid = curFid();
    const item = { id, type: 'task', title, due: $('#gnDue').value || null, time: $('#gnTime').value, subject: $('#gnSubj').value.trim(), desc: $('#gnDesc').value };
    if (gNewPhoto) {
      try { await cloudFetch('POST', { kind: 'gimg', as: REG.me, forest: fid, id, data: gNewPhoto }); item.img = true; gImgCache.set(id, gNewPhoto); DB.put('files', 'gi:' + id, gNewPhoto).catch(() => {}); }
      catch (e) { toast(`No se pudo subir la foto: ${e.message}`); el.disabled = false; return; }
    }
    closeSheet(false); await gput(item); Snd.chime(); toast('Tarea subida. A tus compañeros les llega un aviso.');
  },
});

const gDoneBy = (id) => gAll('done').filter((x) => x.task === id && !x.deleted);

/* =========================================================
   6. Efectos llamativos: confeti, puntos flotantes, podio, tarjeta de Hoy
   ========================================================= */
const CONF_COLORS = ['#2F8A5B', '#7CC07A', '#F2C94C', '#F2994A', '#EB5757', '#56CCF2', '#BB6BD9', '#FF8FB1'];
/* confetti: ver linea.js */
/* floatText: ver linea.js */
function podiumHTML(items) {
  if (!items || items.length < 1) return '';
  const order = [1, 0, 2].filter((i) => items[i]);
  const medals = ['1', '2', '3'];
  return `<div class="podium" aria-label="Los tres primeros lugares">${order.map((i) => {
    const it = items[i];
    return `<div class="pod pod-${i + 1}"><span class="pod-crown">${i === 0 ? icon('crown', 'sm') : ''}</span><span class="pod-av" style="--pc:${it.color || '#2F8A5B'}">${it.icon}</span><b class="pod-name">${esc(it.name)}${it.me ? ' (tú)' : ''}</b><span class="pod-lv">Nivel <b>${it.level}</b></span><span class="pod-step"><span>${medals[i]}</span></span></div>`;
  }).join('')}</div>`;
}
function homeTreeHTML() {
  if (isGroup() || !REG.me || !profile()) return '';
  let c; try { c = treeNow(dataOwner()); } catch { return ''; }
  const pct = c.need > c.cur ? Math.max(0, Math.min(100, Math.round(((c.pts - c.cur) / (c.need - c.cur)) * 100))) : 100;
  const bal = seedsOf(c); const qs = questsToday(); const ready = qs.filter((q) => q.ok && !q.claimed).length;
  return `<a class="home-tree ${c.wet ? '' : 'thirsty'}" href="#/vida" aria-label="Tu árbol, nivel ${c.level}. Abrir Vida">
    <span class="ht-ico">${treeIcon(c.level)}<span class="ht-lv">${c.level}</span></span>
    <span class="ht-main"><b>${esc(stageName(c.level))}${c.streak ? ` · racha ${c.streak}` : ''}</b>
      <span class="ht-bar"><i style="width:${pct}%"></i></span>
      <span class="small">${c.wet ? 'Regado hoy' : 'Tiene sed: súbele algo hoy'} · ${bal} monedas${ready ? ` · <b class="ht-ready">${plural(ready, 'misión lista', 'misiones listas')}</b>` : ''}</span></span>${icon('chev', 'chev')}</a>`;
}

/* =========================================================
   7. Sala de enfoque (Pomodoro social / Modo fantasma)
   ========================================================= */
const FOCUS_MINS = [15, 25, 45, 60];
const focusEnd = (x) => (+x.start || 0) + (+x.mins || 0) * 60000;
const focusList = () => gAll('focus').filter((x) => Date.now() < focusEnd(x) && x.start <= Date.now() + 60000);
const focusMine = () => focusList().find((x) => x.byId === REG.me || x.id === focusId());
const focusId = () => `fs-${REG.me}`.replace(/[^a-z0-9-]/gi, '').slice(0, 60);
const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
let focusUI = { ghost: false, mins: 25, topic: '' };

function focusCardHTML() {
  if (focusMine()) focusWatch();
  const n = focusList().length;
  return `<button type="button" class="focus-card ${n ? 'live' : ''}" data-act="focus-open"><span class="fc-ico">${icon('headphones')}</span>
    <span class="fc-t"><b>Sala de enfoque</b><span class="small">${n ? `${plural(n, 'persona concentrada', 'personas concentradas')} ahora. ¡Únete en silencio!` : 'Estudien juntos en silencio, solo viéndose concentrados.'}</span></span>${icon('chev', 'chev')}</button>`;
}
function focusSheetBody() {
  const list = focusList(); const mine = focusMine(); const now = Date.now();
  const others = list.filter((x) => x !== mine);
  let top = '';
  if (mine) {
    const total = mine.mins * 60000; const left = focusEnd(mine) - now; const pct = Math.max(0, Math.min(1, left / total)); const C = 2 * Math.PI * 70;
    top = `<div class="focus-me"><div class="focus-ring"><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" class="fr-bg"/><circle cx="80" cy="80" r="70" class="fr-fg" id="frFg" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct)).toFixed(1)}"/></svg>
      <div class="fr-mid"><b id="focusClock">${mmss(left)}</b><span class="small">${mine.ghost ? 'Modo fantasma' : 'Concentrado'}</span></div></div>
      <p class="muted" style="text-align:center;margin:6px 0 12px">${mine.title ? esc(mine.title) : 'Sin hablar. Solo tú y lo que estás haciendo.'}</p>
      <div class="btn-row" style="justify-content:center"><button class="btn" data-act="focus-stop">Terminar ahora</button></div></div>`;
  } else {
    top = `<div class="focus-new"><p class="muted" style="margin:0 0 10px">Elige cuánto tiempo y empieza. Tus compañeros ven que estás concentrado, sin chat ni distracciones.</p>
      <div class="seg full" role="group" aria-label="Duración">${FOCUS_MINS.map((m) => `<button type="button" data-act="focus-mins" data-v="${m}" aria-pressed="${focusUI.mins === m}">${m} min</button>`).join('')}</div>
      <div class="field" style="margin-top:12px"><label for="focusTopic" class="sr">¿En qué trabajas?</label><input id="focusTopic" class="input" maxlength="80" placeholder="¿En qué vas a trabajar? (opcional)" value="${esc(focusUI.topic)}"></div>
      <label class="toggle ghost-tg"><span class="t">Modo fantasma <span class="small muted" style="display:block">Los demás ven que alguien se concentra, pero no quién.</span></span><span class="switch"><input type="checkbox" id="focusGhost" ${focusUI.ghost ? 'checked' : ''} aria-label="Modo fantasma"><span></span></span></label>
      <div class="btn-row" style="margin-top:14px"><button class="btn primary block" data-act="focus-start">Empezar a concentrarme</button></div></div>`;
  }
  const room = others.length ? `<h3 class="sec" style="margin-top:18px">Concentrados ahora <small>${others.length}</small></h3><div class="focus-room">${others.map((x) => {
    const name = x.ghost ? 'Fantasma' : x.by;
    return `<div class="focus-p ${x.ghost ? 'ghost' : ''}"><span class="fp-av" style="--pc:${x.ghost ? '#8A97A8' : nameColor(x.by)}">${x.ghost ? icon('eyeoff', 'sm') : esc(initials(x.by))}<i class="fp-dot"></i></span>
      <span class="fp-t"><b>${esc(name)}</b><span class="small muted">${x.title && !x.ghost ? esc(x.title) : 'Concentrado'}</span></span><span class="fp-time" data-end="${focusEnd(x)}">${mmss(focusEnd(x) - now)}</span>
      ${mine ? '' : `<button class="btn" data-act="focus-join" data-id="${x.id}">Unirme</button>`}</div>`;
  }).join('')}</div>` : (mine ? '<p class="small muted" style="text-align:center;margin-top:14px">Eres la única persona concentrada ahora. Invita a alguien a unirse.</p>' : '');
  return `${top}${room}<div class="btn-row" style="margin-top:16px;justify-content:center"><button class="btn quiet" data-act="forest-invite">${icon('plus')}Invitar a alguien a este Bosque</button></div>
    <p class="small muted" style="text-align:center;margin:10px 0 0">Al terminar ganas monedas y tu árbol se riega.</p>`;
}
let focusTimer = null;
function paintFocusSheet() { const b = document.getElementById('focusBox'); if (b) b.innerHTML = focusSheetBody(); }
function openFocusSheet() {
  if (!curFid()) return;
  openSheet(`${sheetHead('Sala de enfoque')}<div class="sheet-body"><div id="focusBox"></div></div>`, () => { clearInterval(focusTimer); focusTimer = null; });
  paintFocusSheet();
  let k = 0; clearInterval(focusTimer);
  focusTimer = setInterval(() => {
    if (!document.getElementById('focusBox')) { clearInterval(focusTimer); focusTimer = null; return; }
    k++;
    const mine = focusMine(); const clock = document.getElementById('focusClock');
    if (mine && clock) {
      const left = focusEnd(mine) - Date.now(); clock.textContent = mmss(left);
      const fg = document.getElementById('frFg'); if (fg) fg.setAttribute('stroke-dashoffset', (2 * Math.PI * 70 * (1 - Math.max(0, left / (mine.mins * 60000)))).toFixed(1));
    }
    document.querySelectorAll('.fp-time').forEach((el) => { el.textContent = mmss(+el.dataset.end - Date.now()); });
    if (k % 8 === 0) { cloudSync().then?.(() => paintFocusSheet()); }
    if (k % 8 === 1 && (!mine) && document.getElementById('focusBox')) { /* refresco ligero de la lista */ }
    if (!focusMine() && document.getElementById('focusClock')) paintFocusSheet();
  }, 1000);
}
async function focusStart(base) {
  const mins = base ? base.mins : focusUI.mins; const start = base ? base.start : Date.now();
  const item = { id: focusId(), type: 'focus', start, mins, title: base ? (base.title || '') : focusUI.topic.slice(0, 80), ghost: !!focusUI.ghost, joined: !!base, deleted: false };
  await gput(item); Snd.chime(); focusWatch(); paintFocusSheet();
}
const focusRewarded = () => ((vidaData().focusDone ||= {}));
function focusWatch() {
  clearInterval(focusWatch.t);
  focusWatch.t = setInterval(() => {
    const it = gGet(focusId()); if (!it || it.deleted) { if (!focusMine()) clearInterval(focusWatch.t); return; }
    if (Date.now() >= focusEnd(it)) {
      clearInterval(focusWatch.t);
      const key = `${it.id}:${it.start}`; const R = focusRewarded();
      if (!R[key]) {
        R[key] = 1; const reward = Math.max(3, Math.round(it.mins / 5)); const v = vidaData(); v.bonus = (v.bonus || 0) + reward; v.focusMin = (v.focusMin || 0) + it.mins;
        for (const k of Object.keys(R)) if (R[k] && Object.keys(R).length > 30) delete R[k];
        save(); waterToday(); Snd.chime(); confetti(innerWidth / 2, innerHeight / 3, 60); toast(`Sesión completada: +${reward} monedas y tu árbol se regó.`, { ms: 6000 });
        gput({ ...it, deleted: true, start: it.start }).catch(() => {});
      }
      paintFocusSheet();
    }
  }, 1000);
}
Object.assign(VIDA_ACTS, {
  'focus-open': () => openFocusSheet(),
  'focus-mins': (el) => { focusUI.mins = +el.dataset.v; focusUI.topic = $('#focusTopic')?.value || ''; focusUI.ghost = !!$('#focusGhost')?.checked; paintFocusSheet(); },
  'focus-start': () => { focusUI.topic = $('#focusTopic')?.value.trim() || ''; focusUI.ghost = !!$('#focusGhost')?.checked; focusStart(); },
  'focus-join': (el) => { const h = gGet(el.dataset.id); if (!h) return; focusUI.ghost = !!$('#focusGhost')?.checked || focusUI.ghost; focusStart({ start: h.start, mins: h.mins, title: h.ghost ? '' : (h.title || '') }); },
  'focus-stop': async () => { const it = gGet(focusId()); if (!it) return; const ok = await ask({ title: '¿Terminar la sesión?', text: 'Si sales antes de tiempo no ganas monedas.', ok: 'Terminar', danger: true }); if (!ok) return; await gput({ ...it, deleted: true }); toast('Sesión terminada.'); paintFocusSheet(); },
});
