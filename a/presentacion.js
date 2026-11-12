/* Presentación en video de Cinnavia (7.50): reproductor con versión vertical y horizontal */
const PV = { mode: null };
const pvMode = () => PV.mode || (window.innerHeight > window.innerWidth ? 'v' : 'h');
const pvFile = (m) => (m === 'v' ? 'media/cinnavia-vertical.mp4' : 'media/cinnavia-horizontal.mp4');
function viewPresentacion() {
  const m = pvMode(); const src = pvFile(m); const poster = m === 'v' ? 'media/poster-vertical.jpg' : 'media/poster-horizontal.jpg';
  const chip = (v, l) => `<button type="button" class="gb-chip" data-act="pv-set" data-v="${v}" aria-pressed="${m === v}">${l}</button>`;
  return `<div class="pv-page"><h1 class="h1">Presentación</h1><p class="sub">Un recorrido de un minuto por lo que hace Cinnavia. Muéstrasela a tu grupo.</p>
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
  const card = `<a class="gb-entry pv-entry" href="#/presentacion"><span class="gb-entry-art pv-art" aria-hidden="true"><svg viewBox="0 0 120 56"><rect width="120" height="56" fill="#0b0c09"/><circle cx="60" cy="28" r="17" fill="#c8f53c"/><path d="M54 19 L72 28 L54 37Z" fill="#0b0c09"/></svg></span><span class="gb-entry-txt"><b>PRESENTACIÓN</b><span>Mira en un minuto qué hace Cinnavia</span></span></a>`;
  const wrap = (fn) => function () { const h = fn.apply(this, arguments); const i = h.indexOf('<ul class="rows"'); return i < 0 ? card + h : h.slice(0, i) + card + h.slice(i); };
  viewMas = wrap(viewMas); if (typeof viewMasGrupo === 'function') viewMasGrupo = wrap(viewMasGrupo);
}
