/* Cinnavia 7.40 — Dictado por micrófono, rápido y con corrector.
   · Un botón de micrófono en «Nueva tarea» (rápida y completa), apuntes y libretas.
   · Escribe mientras hablas (verás lo que va entendiendo), corrige ortografía, mayúsculas y signos de apertura.
   · Entiende comandos de puntuación: «coma», «punto y aparte», «nueva línea», «dos puntos», «signo de interrogación».
   · Si el micrófono se corta solo (pasa en los navegadores), se reactiva solo. Si el dispositivo no permite dictar
     desde la app (iPhone instalado), te lleva al micrófono del teclado y corrige después. */
'use strict';
const DC = { rec: null, el: null, want: false, on: false, fails: 0, quiet: 0, interim: '', lastTxt: '', lastAt: 0, count: 0, fbEl: null, fbPrev: '' };
const DC_FIELDS = '#fTitle, #fDesc, #nTitle, #thText, #gtDesc, #tmDesc, #sNotes, #quickIn, #gTaskIn, #scanText';
const dcSR = () => window.SpeechRecognition || window.webkitSpeechRecognition;
const dcTip = () => { try { return localStorage.getItem('aldia:dc:tip') === '1'; } catch { return true; } };

/* ---------- pasar lo dicho a texto bien escrito ---------- */
const DC_CMDS = [
  [/\s+punto y aparte\s*/gi, '.\n'], [/\s+punto y seguido\s*/gi, '. '], [/\s+punto final\s*/gi, '. '], [/\s+punto y coma\s*/gi, '; '],
  [/\s+dos puntos\s*/gi, ': '], [/\s+(?:nueva l[ií]nea|salto de l[ií]nea)\s*/gi, '\n'], [/\s+nuevo p[aá]rrafo\s*/gi, '\n\n'],
  [/\s+(?:signo de |cierra )?interrogaci[oó]n\s*/gi, '? '], [/\s+(?:signo de )?exclamaci[oó]n\s*/gi, '! '],
  [/\s+abre par[eé]ntesis\s*/gi, ' ('], [/\s+cierra par[eé]ntesis\s*/gi, ') '], [/\s+coma\s*/gi, ', '],
];
function dcClean(raw, ctx, single) {
  let t = ' ' + String(raw || '').replace(/\s+/g, ' ').trim() + ' ';
  if (!t.trim()) return '';
  for (const [re, rep] of DC_CMDS) t = t.replace(re, rep);
  t = t.replace(/^\s*(punto y aparte|punto y seguido|punto final)\s*$/i, '.');
  t = t.trim();
  try { t = fixText(t, ctx).text; } catch { /* sin corrector */ }
  if (single) { t = t.replace(/\s*\n+\s*/g, ' ').replace(/[.]\s*$/, ''); }
  return t.trim();
}

/* ---------- escribir en el campo ---------- */
function dcInsert(el, text) {
  if (!el || !el.isConnected || !text) return;
  if (el.id === 'nRich' || el.isContentEditable) { try { rtInsert(text + ' '); } catch { /* */ } return; }
  const v = el.value, s = el.selectionStart ?? v.length, e2 = el.selectionEnd ?? v.length;
  const before = v.slice(0, s), ctx = before.slice(-3);
  const clean = dcClean(text, ctx, el.tagName === 'INPUT');
  if (!clean) return;
  const need = before && !/[\s(¿¡\n]$/.test(before) && !/^[\s.,;:!?)]/.test(clean) ? ' ' : '';
  const out = before + need + clean; el.value = out + v.slice(e2);
  try { el.setSelectionRange(out.length, out.length); } catch { /* */ }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  if (el.tagName === 'TEXTAREA') el.scrollTop = el.scrollHeight;
  DC.count++;
}

/* ---------- barra de estado ---------- */
function dcBar() {
  let b = document.getElementById('dcBar'); if (b) return b;
  b = document.createElement('div'); b.id = 'dcBar'; b.className = 'dc-bar'; b.setAttribute('role', 'status'); b.setAttribute('aria-live', 'polite');
  b.innerHTML = `<span class="dc-dot" aria-hidden="true"></span><div class="dc-txt"><b id="dcState">Escuchando…</b><span id="dcLive"></span></div><button type="button" class="dc-done" id="dcDone">Listo</button>`;
  /* las hojas (dialog) van en la capa superior del navegador: la barra tiene que vivir dentro para verse */
  (document.querySelector('dialog[open]') || document.body).appendChild(b); b.querySelector('#dcDone').addEventListener('click', () => dcStop(true)); dcPlace();
  return b;
}
function dcPlace() { const b = document.getElementById('dcBar'); if (!b) return; const vv = window.visualViewport; const off = vv ? Math.max(0, innerHeight - vv.height - vv.offsetTop) : 0; b.style.bottom = `calc(${off}px + 14px + env(safe-area-inset-bottom, 0px))`; }
if (window.visualViewport) { visualViewport.addEventListener('resize', dcPlace); visualViewport.addEventListener('scroll', dcPlace); }
function dcSet(state, live) { const s = document.getElementById('dcState'), l = document.getElementById('dcLive'); if (s && state != null) s.textContent = state; if (l && live != null) l.textContent = live; }
function dcMarks() { document.querySelectorAll('.dc-mic').forEach((m) => { const on = DC.want && DC.el && m.dataset.for === DC.el.id; m.classList.toggle('rec', !!on); m.setAttribute('aria-pressed', on ? 'true' : 'false'); }); const r = document.getElementById('rtDictate'); if (r) { const on = DC.want && DC.el && DC.el.id === 'nRich'; r.classList.toggle('rec', !!on); r.innerHTML = on ? `${icon('mic', 'sm')}Detener` : `${icon('mic', 'sm')}Dictar`; } }

/* ---------- motor ---------- */
function dcRun() {
  const SR = dcSR(); if (!SR || !DC.want) return;
  const r = new SR(); r.lang = 'es-MX'; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
  r.onstart = () => { DC.on = true; dcSet('Escuchando…', DC.interim || (dcTip() ? '' : 'Di «coma» o «punto y aparte» para puntuar')); };
  r.onresult = (e) => {
    DC.fails = 0; DC.quiet = 0; let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i], tx = res[0].transcript;
      if (res.isFinal) {
        const key = tx.trim().toLowerCase(), now = Date.now();
        if (key && !(key === DC.lastTxt && now - DC.lastAt < 1500)) { DC.lastTxt = key; DC.lastAt = now; dcInsert(DC.el, tx.trim()); }
      } else interim += tx;
    }
    DC.interim = interim.trim(); dcSet('Escuchando…', DC.interim);
  };
  r.onerror = (e) => {
    const k = e && e.error;
    if (k === 'no-speech') { DC.quiet++; if (DC.quiet >= 3) { dcStop(false); toast('No te escuché. Toca el micrófono para intentarlo otra vez.'); } return; }
    if (k === 'aborted') return;
    if (k === 'not-allowed' || k === 'service-not-allowed') { dcStop(false); dcFallback(DC.el, k); return; }
    if (k === 'audio-capture') { dcStop(false); toast('No encuentro el micrófono. Revisa que no lo esté usando otra app.'); return; }
    if (k === 'network') { dcStop(false); toast('Sin internet: el dictado la necesita. Puedes seguir escribiendo.'); return; }
    DC.fails++;
  };
  r.onend = () => {
    DC.on = false;
    if (!DC.want || DC.rec !== r) return;
    if (!DC.el || !DC.el.isConnected) { dcStop(false); return; }
    if (DC.fails >= 4) { dcStop(false); toast('El dictado se interrumpió. Toca el micrófono para volver a empezar.'); return; }
    setTimeout(() => { if (DC.want && DC.rec === r) { try { DC.rec = null; dcRun(); } catch { dcStop(false); } } }, 120);
  };
  DC.rec = r;
  try { r.start(); } catch (err) { DC.fails++; DC.rec = null; if (DC.fails < 3) setTimeout(dcRun, 250); else { dcStop(false); toast('No pude activar el micrófono.'); } }
}
function dcStart(el) {
  if (!el) return;
  if (DC.want) { const same = DC.el === el; dcStop(true); if (same) return; }
  if (!dcSR()) { dcFallback(el, 'unsupported'); return; }
  DC.el = el; DC.want = true; DC.fails = 0; DC.quiet = 0; DC.interim = ''; DC.count = 0; DC.lastTxt = '';
  dcBar(); dcSet('Preparando…', ''); try { if (el.focus && el.tagName) el.focus({ preventScroll: true }); } catch { /* */ }
  try { localStorage.setItem('aldia:dc:tip', '1'); } catch { /* */ }
  dcMarks(); dcRun();
}
function dcStop(report) {
  const el = DC.el, n = DC.count; DC.want = false; DC.on = false;
  const r = DC.rec; DC.rec = null; if (r) { try { r.onend = null; r.stop(); } catch { /* */ } }
  const b = document.getElementById('dcBar'); if (b) b.remove();
  DC.interim = ''; dcMarks();
  if (el && el.id === 'nRich' && el.isConnected) { try { const k = fixEditor(el); rtSync(); if (report && (n || k)) toast(`Dictado listo${k ? `. Corregí ${plural(k, 'detalle', 'detalles')} de ortografía` : ''}.`); } catch { /* */ } }
  else if (report && n) toast('Dictado listo.');
  DC.el = null;
}
/* sin dictado integrado: usa el micrófono del teclado y corrige lo que escribió al terminar */
function dcFallback(el, why) {
  const ios = typeof isIOS === 'function' && isIOS();
  if (el && el.focus) { try { el.focus(); } catch { /* */ } DC.fbEl = el; DC.fbPrev = el.value ?? ''; }
  if (why === 'not-allowed') toast('Permite el micrófono en los ajustes del navegador para poder dictar.', { ms: 5000 });
  else toast(ios ? 'En iPhone y iPad dicta con el micrófono del teclado (abajo a la derecha). Al terminar corrijo la ortografía.' : 'Este navegador no deja dictar desde aquí. Usa el micrófono del teclado; al terminar corrijo la ortografía.', { ms: 6000 });
}
document.addEventListener('focusout', (e) => {
  const el = e.target; if (!DC.fbEl || el !== DC.fbEl || !el.isConnected || el.value === undefined) return;
  const prev = DC.fbPrev, now = el.value; DC.fbEl = null;
  if (now === prev) return;
  let fixed = now; try { fixed = fixText(now, '').text; if (el.tagName === 'INPUT') fixed = fixed.replace(/\n+/g, ' '); } catch { /* */ }
  if (fixed !== now) { el.value = fixed; el.dispatchEvent(new Event('input', { bubbles: true })); toast('Corregí la ortografía de lo que dictaste.', { action: 'Deshacer', onAction: () => { el.value = now; el.dispatchEvent(new Event('input', { bubbles: true })); } }); }
});

/* ---------- los botones ---------- */
function dcAddMic(el) {
  if (!el || el.dataset.dcBtn) return;
  const quick = el.closest('.quick-row'), field = el.parentElement && el.parentElement.classList.contains('field') ? el.parentElement : null;
  if (!quick && !field) return;
  if ((quick || field).querySelector('.dc-mic')) { el.dataset.dcBtn = '1'; return; }
  const b = document.createElement('button'); b.type = 'button'; b.className = `dc-mic ${quick ? 'inline' : el.tagName === 'TEXTAREA' ? 'ta' : 'in'}`; b.dataset.for = el.id; b.dataset.act = 'dc-toggle';
  b.setAttribute('aria-label', 'Dictar con el micrófono'); b.title = 'Dictar con el micrófono'; b.setAttribute('aria-pressed', 'false'); b.innerHTML = icon('mic');
  if (quick) quick.insertBefore(b, quick.querySelector('.quick-go') || null); else field.appendChild(b);
  el.dataset.dcBtn = '1';
}
let dcT = 0;
const dcScan = () => { document.querySelectorAll(DC_FIELDS).forEach(dcAddMic); if (DC.want && DC.el && !DC.el.isConnected) dcStop(false); };
new MutationObserver(() => { clearTimeout(dcT); dcT = setTimeout(dcScan, 50); }).observe(document.body, { childList: true, subtree: true });
document.addEventListener('pointerdown', (e) => { if (e.target.closest('.dc-mic, #dcBar, #rtDictate')) e.preventDefault(); });
Object.assign(VIDA_ACTS, { 'dc-toggle': (el) => dcStart(document.getElementById(el.dataset.for)) });
addEventListener('hashchange', () => { if (DC.want) dcStop(false); });
addEventListener('pagehide', () => { if (DC.want) dcStop(false); });
document.addEventListener('visibilitychange', () => { if (document.hidden && DC.want) dcStop(false); });

/* el botón «Dictar» que ya tenían los apuntes usa este mismo motor */
toggleDictation = function () { const ed = document.getElementById('nRich'); if (!ed) return; if (DC.want && DC.el === ed) dcStop(true); else dcStart(ed); };
stopDictation = function () { if (DC.want) dcStop(false); };
setTimeout(dcScan, 300);
