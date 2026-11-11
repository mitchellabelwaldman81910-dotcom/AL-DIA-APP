/* Cinnavia 7.40 — Juegos nuevos: utilidades compartidas, rankings y Mente Viva.
   · Mente Viva: multiplicaciones contra el reloj, con vidas (hojas), racha, monedas y ranking, en un ambiente calmado.
   · Pelotón de Tareas vive en peloton.js y usa lo de aquí (rankings, monedas, publicar récord).
   Sin trampas: puedes salir cuando quieras y nada se pierde. */
'use strict';

/* ---------- utilidades ---------- */
const JG_TONE = (f, d, type, vol, f2) => { try { glTone(f, d, type, vol, f2); } catch { /* sin sonido */ } };
const JG_VIB = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* */ } };
const jgGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const jgSet = (k, v) => { try { localStorage.setItem(k, String(v)); } catch { /* */ } };
const jgNum = (k) => +jgGet(k) || 0;
const jgJSON = (k, d) => { try { const v = JSON.parse(jgGet(k) || 'null'); return v ?? d; } catch { return d; } };
const jgAnnounce = (line) => { const el = document.getElementById('jgLive'); if (el) el.textContent = line; };
const jgToday = () => new Date().toISOString().slice(0, 10);
const jgCoins = (n) => { if (n > 0) { try { navCoins(n); } catch { /* */ } } };

/* ---------- ranking compartido ---------- */
const JGR = {};
const JG_CFG = {
  peloton: {
    tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Carreras']],
    val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'carrera', 'carreras') : `${x.score} pts`),
    mine: (m) => `Tu mejor: <b>${m.best || 0} pts</b> · carreras: <b>${m.games || 0}</b>`,
    none: 'Aún nadie ha corrido en este periodo. ¡Sé la primera persona!',
  },
  mente: { tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']], val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'partida', 'partidas') : `${x.score} pts · nv ${x.level || 1}`), mine: (m) => `Tu mejor: <b>${m.best || 0} pts</b> · partidas: <b>${m.games || 0}</b>`, none: 'Aún nadie ha jugado en este periodo. ¡Sé la primera persona!' },
  enlaza: { tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']], val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'partida', 'partidas') : `${x.score} pts · nv ${x.level || 1}`), mine: (m) => `Tu mejor: <b>${m.best || 0} pts</b> · partidas: <b>${m.games || 0}</b>`, none: 'Aún nadie ha jugado en este periodo. ¡Sé la primera persona!' },
  gusano: { tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']], val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'partida', 'partidas') : `nv ${x.level || 1} · ${x.score} pts`), mine: (m) => `Tu mejor: <b>${m.best || 0} pts</b> · partidas: <b>${m.games || 0}</b>`, none: 'Aún nadie ha jugado en este periodo. ¡Sé la primera persona!' },
};
function jgRankHTML(game) {
  const C = JG_CFG[game]; const S = (JGR[game] ||= { tab: 'dia', data: null, loading: false, fail: false });
  const list = S.data ? S.data[S.tab] || [] : null;
  const val = (x) => C.val(x, S.tab);
  const pod = list && list.length ? `<div class="gm-podium">${[1, 0, 2].map((i) => list[i] ? `<div class="gm-pod p${i + 1}">${avatar({ id: list[i].id, name: list[i].name, color: list[i].color })}<b>${esc(list[i].name)}</b><span>${val(list[i])}</span><i>${i + 1}</i></div>` : '<div class="gm-pod empty"></div>').join('')}</div>` : '';
  const rest = list && list.length > 3 ? `<ol class="gm-list" start="4">${list.slice(3, 20).map((x) => `<li class="${x.id === REG.me ? 'me' : ''}"><span>${esc(x.name)}</span><b>${val(x)}</b></li>`).join('')}</ol>` : '';
  const mine = S.data && S.data.me ? `<p class="small muted gm-mine">${C.mine(S.data.me)}</p>` : '';
  if (!S.data && !S.loading && !S.fail) setTimeout(() => jgLoadRank(game), 10);
  const body = list ? (list.length ? pod + rest : `<p class="small muted" style="text-align:center;margin-top:14px">${C.none}</p>`)
    : S.fail ? '<p class="small muted" style="text-align:center;margin-top:14px">No se pudo cargar el ranking. Aparecerá cuando tengas conexión.</p>'
      : (typeof loaderHTML === 'function' ? loaderHTML('Cargando ranking…') : '');
  return `<h2 class="sec">Ranking</h2><div class="seg full" role="group">${C.tabs.map(([k, l]) => `<button type="button" data-act="jg-tab" data-g="${game}" data-v="${k}" aria-pressed="${S.tab === k}">${l}</button>`).join('')}</div>${body}${mine}`;
}
function jgRankPaint(game) { const b = document.getElementById(`jgRank-${game}`); if (b) b.innerHTML = jgRankHTML(game); }
async function jgLoadRank(game) {
  const S = (JGR[game] ||= { tab: 'dia', data: null, loading: false, fail: false });
  if (S.loading) return; S.loading = true; S.fail = false;
  try { S.data = await cloudFetch('GET', null, `kind=gamerank&game=${game}&as=${encodeURIComponent(REG.me || '')}`); }
  catch { S.fail = true; }
  S.loading = false; jgRankPaint(game);
}
/* publica una partida; si no hay red la guarda para mandarla cuando vuelva */
async function jgPost(payload) {
  if (!REG.me || !tokens()[REG.me]) return null;
  try {
    const rec = await Promise.race([cloudFetch('POST', { kind: 'game', as: REG.me, ...payload }), new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 6000))]);
    if (JGR[payload.game]) JGR[payload.game].data = null;
    return rec;
  } catch (e) {
    if (!(e && e.status >= 400 && e.status < 500)) { (REG.gameout ||= []).push(payload); try { saveReg(); } catch { /* */ } }
    return null;
  }
}

Object.assign(VIDA_ACTS, {
  'jg-tab': (el) => { const g = el.dataset.g; (JGR[g] ||= { tab: 'dia', data: null }).tab = el.dataset.v; jgRankPaint(g); },
});

/* ---------- rutas y menú Juegos ---------- */

{
  const baseJuegos = viewJuegos;
  const row = (href, ic, t, d) => `<li><a href="${href}"><span class="ico">${icon(ic)}</span><span class="txt"><b>${t}</b><span>${d}</span></span>${icon('chev', 'chev')}</a></li>`;
  viewJuegos = function () {
    return baseJuegos().replace('</ul>', row('#/peloton', 'play', 'Pelotón de Tareas', 'Corre por la ciudad, junta libros y monedas y esquiva las tareas.') + row('#/memoria', 'skill', 'Mente Viva', 'Sigue la carta que se baraja. 200 niveles que suben poco a poco.') + row('#/enlaza', 'link', 'Enlaza', 'Desenreda la red moviendo los puntos. Sin tiempo, sin prisa.') + row('#/gusano', 'tree', 'Gusano Goloso', 'Come manzanas, crece y llega a la salida. 330 niveles.') + '</ul>');
  };
  EXTRA_VIEWS.juegos = viewJuegos;
}
['peloton', 'memoria', 'enlaza', 'gusano'].forEach((k) => { EXTRA_NAV[k] = 'juegos'; });
