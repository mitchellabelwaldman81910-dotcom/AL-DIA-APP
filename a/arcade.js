/* Cinnavia 8.0 — Arcade del Bosque: la pantalla de Juegos con tarjetas tipo cartucho,
   el juego del día, tu avance en cada juego y acceso directo a tiendas y rankings. */
'use strict';
const ARC_GAMES = [
  { r: 'torres', n: 'Defensa del Bosque', t: 'Torres, jefes y 300 niveles en 12 mundos', e: '🏰', c: ['#3f9a4a', '#16502a'], tag: '300 niveles', st: () => { try { return `${tdLvlsWon()}/300 niveles`; } catch { return ''; } } },
  { r: 'cielo', n: 'Salto al Cielo', t: 'Rebota de nube en nube hasta la galaxia', e: '☁️', c: ['#7ab8f5', '#3a5ab8'], tag: 'Infinito', st: () => { try { const b = scData().best; return b ? `Récord ${b} m` : ''; } catch { return ''; } } },
  { r: 'gusano', n: 'The Worn', t: 'Come, crece y abre puertas con llaves', e: '🐛', c: ['#8acb4a', '#2f6a1a'], tag: '600 niveles', st: () => { try { return `Nivel ${gwMax()}`; } catch { return ''; } } },
  { r: 'memoria', n: 'Mente Viva', t: 'Sigue la carta que se baraja', e: '🃏', c: ['#c88ae8', '#5a2a8a'], tag: '500 niveles', st: () => { try { return `Nivel ${mcLvl()}`; } catch { return ''; } } },
  { r: 'enlaza', n: 'Enlaza', t: 'Desenreda la red sin prisa', e: '🕸️', c: ['#5ad0c8', '#1a6a6a'], tag: '500 niveles', st: () => { try { return `Nivel ${enLvl()}`; } catch { return ''; } } },
  { r: 'mono', n: 'Monito Saltarín', t: 'Cruza la selva sin caer al agua', e: '🐒', c: ['#f0b04a', '#8a4a10'], tag: 'Tienda', st: () => { try { const b = +localStorage.getItem(mnBestKey()) || 0; return b ? `Récord ${b}` : ''; } catch { return ''; } } },
  { r: 'peloton', n: 'Pelotón de Tareas', t: 'Corre por la ciudad y esquiva tareas', e: '🏃', c: ['#ff8a6a', '#a8302a'], tag: 'Carreras', st: () => '' },
  { r: 'juego', n: 'Cosecha', t: 'Atrapa frutas con tu canasta', e: '🧺', c: ['#ffd23c', '#c86a10'], tag: 'Clásico', st: () => '' },
  { r: 'galope', n: 'Galope', t: 'Salta con tu caballo por la pradera', e: '🐴', c: ['#d8a070', '#6a3a1a'], tag: 'Clásico', st: () => { try { const b = glBest(); return b ? `Récord ${b}` : ''; } catch { return ''; } } },
];
function arcGames() {
  const m = new Date().getMonth(); const L = ARC_GAMES.filter((g) => EXTRA_VIEWS[g.r]);
  if ((m === 10 || m === 11 || m === 0) && EXTRA_VIEWS.navidad) L.push({ r: 'navidad', n: 'Árbol de Navidad', t: 'Haz crecer y decora tu árbol', e: '🎄', c: ['#4ab86a', '#a8202a'], tag: 'Temporada', st: () => '' });
  return L;
}
function arcCard(g, big) {
  const s = g.st(); const isNew = g.r === 'torres';
  return `<a class="arc-cart${big ? ' big' : ''}" href="#/${g.r}" style="--a:${g.c[0]};--b:${g.c[1]}"><span class="arc-ridge" aria-hidden="true"></span><span class="arc-label"><span class="arc-art" aria-hidden="true"><i>${g.e}</i></span><span class="arc-tag">${isNew ? 'Nuevo · ' : ''}${g.tag}</span><b>${g.n}</b>${big ? `<span class="arc-desc">${g.t}</span>` : ''}${s ? `<em>${s}</em>` : ''}</span>${big ? `<span class="arc-play" aria-hidden="true">${icon('play')}</span>` : ''}</a>`;
}
{
  const baseJ = viewJuegos;
  viewJuegos = function () {
    if (typeof calmOn === 'function' && calmOn()) return baseJ();
    const L = arcGames(); const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5); const feat = L[doy % L.length];
    const bal = typeof coins === 'function' ? coins() : null;
    return `<section class="arc"><div class="arc-head"><div><h1 class="page-title">Juegos</h1><p class="page-sub">Un rato para despejarte. Cada juego tiene su tienda y su ranking.</p></div>${bal != null ? `<a class="arc-wallet" href="#/skins" title="Monedas de tu árbol"><span>🪙</span><b>${bal}</b></a>` : ''}</div>
      <p class="arc-k">Juego del día</p>${arcCard(feat, true)}
      <p class="arc-k">Todos los juegos</p><div class="arc-grid">${L.filter((g) => g !== feat).map((g) => arcCard(g)).join('')}</div>
      <a class="arc-skins" href="#/skins"><span>🎨</span><div><b>Skins</b><small>Canastas, caballos, cartas y más para tus juegos</small></div>${icon('chev', 'chev sm')}</a></section>`;
  };
  EXTRA_VIEWS.juegos = viewJuegos;
}
