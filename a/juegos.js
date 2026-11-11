/* Cinnavia 7.30 — Botón «Juegos» en la barra de abajo (reemplaza a Skills, que ahora vive en Más). */
'use strict';
{ const pl = document.getElementById('i-play'); if (pl && !document.getElementById('i-game')) { const s = document.createElementNS('http://www.w3.org/2000/svg', 'symbol'); s.setAttribute('id', 'i-game'); s.setAttribute('viewBox', '0 0 24 24'); s.innerHTML = '<path d="M7 8h10a4.5 4.5 0 0 1 4.4 5.4l-.6 3A2.8 2.8 0 0 1 16 17.2L15 15.5H9l-1 1.7a2.8 2.8 0 0 1-4.8-.8l-.6-3A4.5 4.5 0 0 1 7 8Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.5 10.8v3M7 12.3h3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="15.5" cy="11.6" r=".9"/><circle cx="17.6" cy="13.2" r=".9"/>'; pl.parentNode.appendChild(s); } }
function viewJuegos() {
  const best = typeof glBest === 'function' ? glBest() : 0; const row = (href, ic, t, d) => `<li><a href="${href}"><span class="ico">${icon(ic)}</span><span class="txt"><b>${t}</b><span>${d}</span></span>${icon('chev', 'chev')}</a></li>`;
  return `<h1 class="page-title">Juegos</h1><p class="page-sub">Un rato para despejarte. Compites con los demás en el ranking y ganas skins con las monedas de tu árbol.</p>
    <ul class="rows" style="margin-top:18px">${row('#/juego', 'tree', 'Cosecha', 'Atrapa frutas con tu canasta. Cada 100 cambia el paisaje y la fruta.')}${row('#/galope', 'play', 'Galope', best ? `Salta con tu caballo. Tu récord: ${best} puntos.` : 'Salta con tu caballo por la pradera.')}${row('#/skins', 'star', 'Skins', 'Canastas y caballos nuevos, de los baratos a los legendarios')}</ul>`;
}
EXTRA_VIEWS.juegos = viewJuegos;
['juegos', 'juego', 'galope', 'skins'].forEach((k) => { EXTRA_NAV[k] = 'juegos'; });
EXTRA_NAV.skills = 'mas';
{
  const i = NAV_PERSONAL.findIndex((x) => x[0] === 'skills'); if (i >= 0) NAV_PERSONAL[i] = ['juegos', 'game', 'Juegos'];
  navMode = null;
  const bm = viewMas; viewMas = function () { return bm().replace(/<li><a href="#\/escanear">/, `<li><a href="#/skills"><span class="ico">${icon('skill')}</span><span class="txt"><b>Skills</b><span>Habilidades por materia, de la más básica a la leyenda</span></span>${icon('chev', 'chev')}</a></li><li><a href="#/escanear">`); };
}
