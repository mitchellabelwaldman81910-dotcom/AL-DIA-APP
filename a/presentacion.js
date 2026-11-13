/* ¿Qué es Cinnavia? (7.58): video con voz. Se abre solo al iniciar sesión y vive en «Más». */
const PV = { mode: null };
const pvMode = () => PV.mode || (window.innerHeight > window.innerWidth ? 'v' : 'h');
const pvFile = (m) => (m === 'v' ? 'media/cinnavia-voz-vertical.mp4' : 'media/cinnavia-voz-horizontal.mp4');
function viewPresentacion() {
  const m = pvMode(); const src = pvFile(m); const poster = m === 'v' ? 'media/poster-vertical.jpg' : 'media/poster-horizontal.jpg';
  const chip = (v, l) => `<button type="button" class="gb-chip" data-act="pv-set" data-v="${v}" aria-pressed="${m === v}">${l}</button>`;
  return `<div class="pv-page"><h1 class="h1">¿Qué es Cinnavia?</h1><p class="sub">Un recorrido de un minuto, con voz, por lo que hace Cinnavia. Muéstrasela a tu grupo.</p>
    <div class="pv-box ${m === 'v' ? 'pv-v' : 'pv-h'}"><video id="pvVid" src="${src}" poster="${poster}" controls playsinline preload="metadata"></video></div>
    <div class="gb-chips" role="group" style="margin:12px 0 4px">${chip('v', 'Vertical (celular)')}${chip('h', 'Horizontal (pantalla)')}</div>
    <div class="btn-row" style="margin-top:10px"><a class="btn" href="${src}" download>Descargar video</a><button type="button" class="btn" data-act="pv-share">Compartir</button></div>
    <p class="tiny" style="margin-top:10px;opacity:.7">Necesita internet para reproducirse (pesa unos pocos MB).</p></div>`;
}
EXTRA_VIEWS.presentacion = viewPresentacion; EXTRA_NAV.presentacion = 'mas'; GROUP_VIEWS.presentacion = viewPresentacion; GROUP_NAV.presentacion = 'mas';
Object.assign(VIDA_ACTS, {
  'pv-set': (el) => { PV.mode = el.dataset.v; render(); },
  'pv-share': async () => { const url = new URL(pvFile(pvMode()), location.href).href; try { if (navigator.share) await navigator.share({ title: 'Cinnavia', text: 'Mira Cinnavia: tus tareas, al día.', url }); else { await navigator.clipboard.writeText(url); toast('Enlace copiado'); } } catch (e) {} },
});
{
  const card = `<a class="gb-entry pv-entry" href="#/presentacion"><span class="gb-entry-art pv-art" aria-hidden="true"><svg viewBox="0 0 120 56"><rect width="120" height="56" fill="#0b0c09"/><circle cx="60" cy="28" r="17" fill="#c8f53c"/><path d="M54 19 L72 28 L54 37Z" fill="#0b0c09"/></svg></span><span class="gb-entry-txt"><b>¿QUÉ ES CINNAVIA?</b><span>Míralo en un minuto, con voz</span></span></a>`;
  const wrap = (fn) => function () { const h = fn.apply(this, arguments); const i = h.indexOf('<ul class="rows"'); return i < 0 ? card + h : h.slice(0, i) + card + h.slice(i); };
  viewMas = wrap(viewMas); if (typeof viewMasGrupo === 'function') viewMasGrupo = wrap(viewMasGrupo);
}

/* Al iniciar sesión (usuario nuevo o que entra con contraseña) se abre el video solo. Quien ya tenía la sesión abierta lo ve en «Más». */
function pvWelcome() {
  if (typeof openSheet !== 'function') return;
  const m = window.innerHeight > window.innerWidth ? 'v' : 'h';
  const poster = m === 'v' ? 'media/poster-vertical.jpg' : 'media/poster-horizontal.jpg';
  openSheet(`${sheetHead('¿Qué es Cinnavia?')}<div class="sheet-body"><div class="pv-box ${m === 'v' ? 'pv-v' : 'pv-h'}"><video id="pvWel" src="${pvFile(m)}" poster="${poster}" controls autoplay playsinline preload="none"></video></div>
    <p class="tiny" style="margin:10px 0 0;opacity:.75">Lo puedes volver a ver cuando quieras en <b>Más › ¿Qué es Cinnavia?</b></p></div>
    <div class="sheet-foot"><span class="grow"></span><button type="button" class="btn primary" data-act="sheet-close">Entrar a la app</button></div>`, () => { const v = document.getElementById('pvWel'); if (v) { try { v.pause(); } catch (e) {} } });
  const v = document.getElementById('pvWel');
  if (v) { v.play().catch(() => { v.muted = false; }); }
}
{
  const snap = () => { try { return JSON.stringify(tokens()); } catch (e) { return ''; } };
  const after = (before) => { if (snap() !== before) setTimeout(pvWelcome, 700); };
  const bLogin = loginUser; loginUser = async function () { const b = snap(); const r = await bLogin.apply(this, arguments); after(b); return r; };
  const bCreate = createUser; createUser = async function () { const b = snap(); const r = await bCreate.apply(this, arguments); after(b); return r; };
  const bSess = sessionFor; sessionFor = async function () { const b = snap(); const r = await bSess.apply(this, arguments); if (r) after(b); return r; };
}

/* Sorpresa de cumpleaños: solo se abre para el usuario @constanza (con sesión abierta). No aparece en ningún menú. */
function cumpleCheck() {
  try {
    if (typeof openSheet !== 'function' || typeof tokens !== 'function') return;
    const id = REG.current;
    const pf = (typeof profile === 'function' && profile(id)) || {};
    const esC = /^constanza/i.test(String(id || '')) || /^constanza\b/i.test(String(pf.name || ''));
    if (!esC || !tokens()[id]) return;
    if (window.__czShown) return;
    fetch('media/c-7f3a9e1b4d.mp4', { method: 'HEAD' }).then((r) => { if (r.ok) { window.__czShown = true; cumpleOpen(); } }).catch(() => {});
  } catch (e) { /* nada */ }
}
function cumpleOpen() {
  try {
    openSheet(`${sheetHead('🎂 Para ti, Constanza')}<div class="sheet-body"><div class="pv-box pv-v"><video id="czVid" src="media/c-7f3a9e1b4d.mp4" controls autoplay playsinline preload="auto"></video></div></div>
    <div class="sheet-foot"><span class="grow"></span><button type="button" class="btn primary" data-act="sheet-close">Entrar a la app</button></div>`, () => { const v = document.getElementById('czVid'); if (v) { try { v.pause(); } catch (e) {} } });
    const v = document.getElementById('czVid'); if (v) v.play().catch(() => {});
  } catch (e) { /* nada */ }
}
setTimeout(cumpleCheck, 1800);
{
  const sn = () => { try { return JSON.stringify(tokens()); } catch (e) { return ''; } };
  const aft = (b) => { if (sn() !== b) setTimeout(cumpleCheck, 1200); };
  const l1 = loginUser; loginUser = async function () { const b = sn(); const r = await l1.apply(this, arguments); aft(b); return r; };
  const l2 = createUser; createUser = async function () { const b = sn(); const r = await l2.apply(this, arguments); aft(b); return r; };
  const l3 = sessionFor; sessionFor = async function () { const b = sn(); const r = await l3.apply(this, arguments); if (r) aft(b); return r; };
}
