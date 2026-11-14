/* Cinnavia 8.1 — Arcade 2: perfil de jugadora, misiones del día, racha, logros y «Sorpréndeme».
   Las misiones cambian cada día y dan monedas. Nada se pierde si faltas un día: la racha solo empieza de nuevo. */
'use strict';
const AR2_TITLES = ['Semilla', 'Brote', 'Hojita', 'Retoño', 'Rama', 'Arbusto', 'Arbolito', 'Guardiana', 'Bosque entero', 'Leyenda verde'];
const arDay = () => toISO(new Date());
const arD = () => {
  const d = jpData('arcade'); const t = arDay();
  d.visits ||= []; d.seen ||= []; d.claimed ||= {}; d.ach ||= {}; d.plays ||= 0; d.tp ||= 0; d.streak ||= 0; d.mc ||= 0; d.sc ||= {};
  if (d.day !== t) { d.day = t; d.visits = []; d.plays = 0; d.claimed = {}; }
  return d;
};
const AR2_ACH = [
  { id: 'first', n: 'Primera partida', e: '🌱', d: 'Juega tu primera partida', ok: (d) => d.tp >= 1, r: 2 },
  { id: 'explorer', n: 'Exploradora', e: '🧭', d: 'Prueba 5 juegos distintos', ok: (d) => d.seen.length >= 5, r: 4 },
  { id: 'all', n: 'Coleccionista', e: '🎮', d: 'Prueba todos los juegos', ok: (d) => d.seen.length >= Math.max(8, arcGames().length), r: 8 },
  { id: 's3', n: 'Constante', e: '🔥', d: 'Racha de 3 días', ok: (d) => d.streak >= 3, r: 3 },
  { id: 's7', n: 'Imparable', e: '⚡', d: 'Racha de 7 días', ok: (d) => d.streak >= 7, r: 8 },
  { id: 'tp50', n: 'Veterana', e: '🏅', d: '50 partidas jugadas', ok: (d) => d.tp >= 50, r: 6 },
  { id: 'tp200', n: 'Leyenda', e: '👑', d: '200 partidas jugadas', ok: (d) => d.tp >= 200, r: 15 },
  { id: 'mis10', n: 'Misionera', e: '🎯', d: 'Cumple 10 misiones', ok: (d) => d.mc >= 10, r: 6 },
];
function arTouch(game, played) {
  try {
    const d = arD(); const t = arDay(); const before = JSON.stringify(d);
    if (game && !d.visits.includes(game)) d.visits.push(game);
    if (game && !d.seen.includes(game)) d.seen.push(game);
    if (played) { d.plays++; d.tp++; }
    if (d.last !== t) { const y = new Date(); y.setDate(y.getDate() - 1); d.streak = d.last === toISO(y) ? d.streak + 1 : 1; d.last = t; }
    for (const a of AR2_ACH) if (!d.ach[a.id] && a.ok(d)) { d.ach[a.id] = Date.now(); jgCoins(a.r); setTimeout(() => toast(`${a.e} Logro: ${a.n} (+${a.r} monedas)`), 400); }
    if (JSON.stringify(d) !== before) jpSave();
  } catch { /* nunca estorbar al juego */ }
}
function arMissions() {
  const L = arcGames(); const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 864e5);
  const d = arD(); const feat = L[(doy + 3) % L.length];
  const pagesToday = (S.pages || []).filter((p) => !p.deleted && toISO(new Date(p.at)) === arDay()).length;
  const M = [];
  M.push(doy % 2 ? { id: 'v2', t: 'Prueba 2 juegos distintos', g: 2, v: d.visits.length, r: 4 } : { id: 'v4', t: 'Prueba 4 juegos distintos', g: 4, v: d.visits.length, r: 7 });
  M.push((doy >> 1) % 2 ? { id: 'p3', t: 'Juega 3 partidas', g: 3, v: d.plays, r: 4 } : { id: 'p6', t: 'Juega 6 partidas', g: 6, v: d.plays, r: 8 });
  M.push(doy % 3 === 0 ? { id: 'lb', t: 'Escribe una página en una libreta', g: 1, v: pagesToday, r: 3 } : { id: 'fe', t: `Visita ${feat.n}`, g: 1, v: d.visits.includes(feat.r) ? 1 : 0, r: 3 });
  return M;
}
const AR2_STREAK = [[3, 3], [7, 8], [14, 15], [30, 40]];
function arLevel(d) { const xp = d.tp * 10 + d.mc * 25 + d.seen.length * 15; const lv = Math.floor(Math.sqrt(xp / 25)) + 1; const base = (lv - 1) ** 2 * 25; const next = lv ** 2 * 25; return { xp, lv, pct: Math.max(0, Math.min(100, Math.round(((xp - base) / (next - base)) * 100))), title: AR2_TITLES[Math.min(AR2_TITLES.length - 1, lv - 1)] }; }
function arPanel() {
  const d = arD(); const M = arMissions(); const lv = arLevel(d); const L = arcGames();
  const allDone = M.every((m) => d.claimed[m.id]);
  const ms = M.map((m) => {
    const done = m.v >= m.g; const got = d.claimed[m.id];
    return `<li class="ar2-m ${done ? 'done' : ''} ${got ? 'got' : ''}"><span class="ar2-chk" aria-hidden="true">${got ? '✓' : done ? '★' : ''}</span><span class="ar2-t"><b>${esc(m.t)}</b><i><u style="width:${Math.min(100, Math.round((m.v / m.g) * 100))}%"></u></i></span><span class="ar2-v">${Math.min(m.v, m.g)}/${m.g}</span>${got ? '<em>Listo</em>' : done ? `<button type="button" class="ar2-claim" data-act="ar2-claim" data-id="${m.id}">+${m.r} 🪙</button>` : `<em>+${m.r} 🪙</em>`}</li>`;
  }).join('');
  const next = AR2_STREAK.find(([n]) => d.streak < n); const rew = AR2_STREAK.filter(([n]) => d.streak >= n && !d.sc[n]);
  const ach = AR2_ACH.map((a) => `<li class="${d.ach[a.id] ? 'on' : ''}" title="${esc(a.d)}"><span>${a.e}</span><b>${esc(a.n)}</b><small>${esc(a.d)}</small></li>`).join('');
  const rand = L[Math.floor(Math.random() * L.length)];
  return `<div class="ar2-prof"><span class="ar2-lv"><b>${lv.lv}</b><small>nivel</small></span><div class="ar2-pt"><b>${lv.title}</b><i><u style="width:${lv.pct}%"></u></i><small>${d.tp} partidas · ${d.seen.length} juegos probados</small></div><span class="ar2-streak" title="Días seguidos jugando">🔥<b>${d.streak}</b></span></div>
    <section class="ar2-box"><div class="ar2-hd"><h2>Misiones de hoy</h2><span>${M.filter((m) => d.claimed[m.id]).length}/3</span></div><ul class="ar2-ms">${ms}</ul>
      ${allDone && !d.claimed.all ? `<button type="button" class="btn primary ar2-all" data-act="ar2-claim" data-id="all">${icon('star', 'sm')}Cofre del día: +5 🪙</button>` : d.claimed.all ? '<p class="tiny faint ar2-note">Cofre del día abierto. Mañana hay misiones nuevas.</p>' : ''}
      ${rew.length ? rew.map(([n, c]) => `<button type="button" class="btn ar2-all" data-act="ar2-claim" data-id="s${n}">🔥 Premio de racha de ${n} días: +${c} 🪙</button>`).join('') : ''}
      ${next ? `<p class="tiny faint ar2-note">Racha: ${d.streak} ${d.streak === 1 ? 'día' : 'días'} · premio en ${next[0] - d.streak} ${next[0] - d.streak === 1 ? 'día' : 'días'} (+${next[1]} 🪙)</p>` : ''}</section>
    <a class="ar2-rand" href="#/${rand.r}"><span>🎲</span><div><b>Sorpréndeme</b><small>Te llevo a un juego al azar</small></div>${icon('chev', 'chev sm')}</a>
    <details class="ar2-box ar2-det"><summary><h2>Logros del arcade</h2><span>${Object.keys(d.ach).length}/${AR2_ACH.length}</span></summary><ul class="ar2-ach">${ach}</ul></details>`;
}
/* Ver el juego donde entras y contar las partidas que se publican */
const AR2_ROUTES = () => new Set(arcGames().map((g) => g.r).concat(['memoria', 'enlaza', 'gusano', 'juego', 'galope', 'peloton', 'cielo', 'mono', 'torres']));
function arRoute() { const m = location.hash.match(/^#\/([a-z]+)/); if (m && AR2_ROUTES().has(m[1])) arTouch(m[1], false); }
window.addEventListener('hashchange', arRoute); setTimeout(arRoute, 800);
{
  const basePost = jgPost;
  jgPost = function (payload) { try { arTouch(null, true); if (payload && payload.game) { const d = arD(); const map = { mente: 'memoria' }; const r = map[payload.game] || payload.game; if (!d.visits.includes(r) && AR2_ROUTES().has(r)) arTouch(r, false); } } catch { /* */ } return basePost.apply(this, arguments); };
}
Object.assign(VIDA_ACTS, {
  'ar2-claim': (el) => {
    const d = arD(); const id = el.dataset.id; let r = 0;
    if (id === 'all') { if (d.claimed.all) return; r = 5; d.claimed.all = 1; }
    else if (/^s\d+$/.test(id)) { const n = +id.slice(1); const row = AR2_STREAK.find((x) => x[0] === n); if (!row || d.streak < n || d.sc[n]) return; r = row[1]; d.sc[n] = 1; }
    else { const m = arMissions().find((x) => x.id === id); if (!m || m.v < m.g || d.claimed[id]) return; r = m.r; d.claimed[id] = 1; d.mc++; }
    jgCoins(r); arTouch(null, false); toast(`+${r} monedas`); try { Snd.chime(); } catch { /* */ } render();
  },
});
{
  const baseJ = viewJuegos;
  viewJuegos = function () {
    const h = baseJ();
    if (typeof calmOn === 'function' && calmOn()) return h;
    try { arTouch(null, false); return h.replace('<p class="arc-k">Juego del día</p>', `${arPanel()}<p class="arc-k">Juego del día</p>`); } catch { return h; }
  };
  EXTRA_VIEWS.juegos = viewJuegos;
}
