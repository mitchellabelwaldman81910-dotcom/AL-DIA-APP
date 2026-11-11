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
  mente: {
    tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']],
    val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'partida', 'partidas') : `${x.score} pts`),
    mine: (m) => `Tu mejor: <b>${m.best || 0} pts</b> · partidas: <b>${m.games || 0}</b>`,
    none: 'Aún nadie ha jugado en este periodo. ¡Sé la primera persona!',
  },
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

/* ---------- Mente Viva: multiplicaciones contra el reloj ---------- */
const MT_MODES = [
  { id: 1, name: 'Suave', range: 'Tablas del 2 al 5', max: 5, mult: 1 },
  { id: 2, name: 'Medio', range: 'Tablas del 2 al 9', max: 9, mult: 1.5 },
  { id: 3, name: 'Profundo', range: 'Tablas del 2 al 12', max: 12, mult: 2 },
];
const MT = { run: null };
const MT_START = 60, MT_CAP = 90, MT_BONUS = 3, MT_COIN_CAP = 12;
const mtModeKey = () => `aldia:mente:mode:${REG.me || '_'}`;
const mtMode = () => MT_MODES.find((m) => m.id === jgNum(mtModeKey())) || MT_MODES[1];
const mtBestKey = (id) => `aldia:mente:best:${REG.me || '_'}:${id}`;
const mtBest = (id) => jgNum(mtBestKey(id));

function mtHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="mthS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12303A"/><stop offset=".7" stop-color="#2F6E62"/><stop offset="1" stop-color="#6FB59C"/></linearGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#mthS)"/><circle cx="268" cy="52" r="20" fill="#EAF6EE" opacity=".9"/>
    <path d="M0 118l52-40 40 28 56-48 62 52 48-30 60 38v52H0z" fill="#16403F" opacity=".9"/><path d="M0 138c60-14 120 6 180-4s130-12 180 2v34H0z" fill="#8FD0B5" opacity=".55"/>
    <g fill="#EAF6EE" opacity=".95" font-family="system-ui,sans-serif" font-weight="700" text-anchor="middle"><text x="130" y="96" font-size="44">7 × 8</text></g>
    <g fill="#9BE0BE" opacity=".8"><circle cx="46" cy="40" r="2.4"/><circle cx="90" cy="26" r="1.8"/><circle cx="214" cy="30" r="2"/><circle cx="320" cy="96" r="2.4"/><circle cx="24" cy="102" r="1.8"/></g>
    <path d="M118 128h88" stroke="#9BE0BE" stroke-width="3" stroke-linecap="round" opacity=".7"/></svg>`;
}
function viewMemoria() {
  const cur = mtMode();
  return `<section class="mt-home"><div class="gm-hero">${mtHero()}</div><h1 class="page-title gm-title">Mente Viva</h1>
    <p class="page-sub">Multiplica con calma contra el reloj. Cada respuesta correcta te regala unos segundos y te lleva a la siguiente. Tienes <b>3 hojas</b>: pierdes una con cada error. Respira, concéntrate y sigue tu ritmo.</p>
    <div class="seg full mt-modes" role="group" aria-label="Dificultad">${MT_MODES.map((m) => `<button type="button" data-act="mt-mode" data-v="${m.id}" aria-pressed="${m.id === cur.id}">${m.name}</button>`).join('')}</div>
    <p class="small muted" style="text-align:center;margin:10px 0 14px">${cur.range}${cur.mult > 1 ? ` · puntos x${cur.mult}` : ''}${mtBest(cur.id) ? ` · tu mejor: <b>${mtBest(cur.id)}</b> pts` : ''}</p>
    <button class="btn primary block gm-play" data-act="mt-start">${icon('play')}Empezar</button>
    <p class="small muted" style="text-align:center;margin-top:10px">Ganas 1 moneda por cada 5 aciertos (hasta ${MT_COIN_CAP} por partida). Puedes salir cuando quieras.</p>
    <div id="jgRank-mente">${jgRankHTML('mente')}</div><p id="jgLive" class="sr-only" aria-live="polite"></p></section>`;
}

const MT_LEAF = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19c3-4 6-7 10-9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".5"/></svg>';
function mtStart() {
  if (MT.run) return;
  const M = mtMode();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage mt-stage';
  const orbs = Array.from({ length: 9 }, (_, i) => `<i class="mt-orb" style="--x:${(i * 37 + 8) % 100}%;--y:${(i * 53 + 12) % 100}%;--s:${60 + (i * 29) % 120}px;--d:${16 + (i * 5) % 14}s;--l:${-i * 3}s"></i>`).join('');
  wrap.innerHTML = `<div class="mt-bg" aria-hidden="true">${orbs}</div>
    <button class="gm-x gl-x" id="mtX" aria-label="Salir del juego">${icon('x')}</button>
    <div class="mt-top"><div class="mt-lives" id="mtLives" aria-label="Hojas"></div><div class="mt-stat"><small>Puntos</small><b id="mtScore">0</b></div><div class="mt-stat"><small>Tiempo</small><b id="mtTime">${MT_START}</b></div></div>
    <div class="mt-bar" aria-hidden="true"><i id="mtBar"></i></div>
    <div class="mt-main"><div class="mt-streak" id="mtStreak"></div><div class="mt-q" id="mtQ" aria-live="polite"></div><div class="mt-ans" id="mtAns"><span id="mtVal"></span><i class="mt-caret"></i></div><div class="mt-note" id="mtNote"></div></div>
    <div class="mt-pad" id="mtPad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" class="mt-key" data-k="${n}">${n}</button>`).join('')}<button type="button" class="mt-key alt" data-k="del" aria-label="Borrar">⌫</button><button type="button" class="mt-key" data-k="0">0</button><button type="button" class="mt-key go" data-k="ok" aria-label="Responder">✓</button></div>
    <div class="mt-ready" id="mtReady"><div class="mt-breath" aria-hidden="true"></div><b>Respira hondo</b><span>${M.name} · ${M.range}</span><button class="btn primary" id="mtGo">Empezar</button></div>
    <div class="gl-over mt-over" id="mtOver" hidden><b id="mtWhy">Fin de la partida</b><div class="mt-res" id="mtRes"></div><span id="mtCoins" class="pm-gain"></span><span class="small muted" id="mtRank"></span><span class="small muted" id="mtNote2"></span>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="mtAgain">${icon('play')}Otra vez</button><button class="btn" id="mtDone">Volver a Juegos</button></div></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const $ = (s) => wrap.querySelector(s);
  const st = { state: 'ready', score: 0, correct: 0, wrong: 0, lives: 3, streak: 0, bestStreak: 0, time: MT_START, a: 2, b: 2, ans: '', coins: 0, lock: false, freeze: false, recent: [], qAt: 0, t0: 0, id: 0, last: performance.now(), over: false };
  MT.run = st;
  const lives = () => { $('#mtLives').innerHTML = [0, 1, 2].map((i) => `<span class="mt-leaf${i < st.lives ? '' : ' lost'}">${MT_LEAF}</span>`).join(''); };
  const hud = () => { $('#mtScore').textContent = st.score; const t = Math.max(0, Math.ceil(st.time)); $('#mtTime').textContent = t; $('#mtBar').style.width = `${Math.min(100, (st.time / MT_CAP) * 100)}%`; wrap.classList.toggle('low', st.time <= 10 && st.state === 'run'); };
  const showAns = () => { $('#mtVal').textContent = st.ans; };
  const float = (txt, cls = '') => { const f = document.createElement('div'); f.className = `mt-float ${cls}`; f.textContent = txt; $('.mt-main').appendChild(f); setTimeout(() => f.remove(), 1000); };
  const next = () => {
    const cap = Math.min(M.max, 5 + Math.floor(st.correct / 4)); let a, b, k, tries = 0;
    do { a = 2 + Math.floor(Math.random() * (cap - 1)); b = 2 + Math.floor(Math.random() * (cap - 1)); k = a < b ? `${a}x${b}` : `${b}x${a}`; tries++; } while (st.recent.includes(k) && tries < 30);
    st.recent.push(k); if (st.recent.length > 6) st.recent.shift();
    st.a = a; st.b = b; st.ans = ''; st.lock = false; st.freeze = false; st.qAt = performance.now();
    const q = $('#mtQ'); q.innerHTML = `<span>${a}</span><em>×</em><span>${b}</span>`; q.classList.remove('in'); void q.offsetWidth; q.classList.add('in');
    const an = $('#mtAns'); an.className = 'mt-ans'; $('#mtNote').textContent = ''; showAns();
    $('#mtStreak').textContent = st.streak >= 3 ? `Racha de ${st.streak}` : '';
  };
  const finish = (why) => {
    if (st.over) return; st.over = true; st.state = 'over'; cancelAnimationFrame(st.id);
    const secs = Math.max(1, Math.round((performance.now() - st.t0) / 1000)); const acc = st.correct + st.wrong ? Math.round((st.correct / (st.correct + st.wrong)) * 100) : 0;
    const best0 = mtBest(M.id), newBest = st.score > best0; if (newBest) jgSet(mtBestKey(M.id), st.score);
    JG_TONE(392, 0.3, 'sine', 0.05, 330);
    $('#mtWhy').textContent = why === 'time' ? 'Se acabó el tiempo' : 'Se acabaron las hojas';
    $('#mtRes').innerHTML = `<div><b>${st.score}</b><small>Puntos${newBest && st.score > 0 ? ' · ¡récord!' : ''}</small></div><div><b>${st.correct}</b><small>Aciertos</small></div><div><b>${acc}%</b><small>Precisión</small></div><div><b>${st.bestStreak}</b><small>Mejor racha</small></div>`;
    $('#mtCoins').textContent = st.coins ? `+${st.coins} ${st.coins === 1 ? 'moneda' : 'monedas'} para tu árbol` : '';
    const mins = (Date.now() - (MT.firstAt || Date.now())) / 60000; $('#mtNote2').textContent = mins >= 20 ? `Llevas ${Math.round(mins)} minutos seguidos. Un descanso corto te ayuda a concentrarte.` : '';
    const o = $('#mtOver'); o.hidden = false; void o.offsetWidth; o.classList.add('show'); wrap.classList.remove('low'); jgAnnounce(`Fin: ${st.score} puntos`);
    if (st.score > 0 && st.correct > 0) jgPost({ game: 'mente', score: st.score, correct: st.correct, mode: M.id, dur: secs }).then((rec) => { const l = $('#mtRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Hoy vas en el lugar #${rec.rankDay}`; });
    MT.lastEnd = Date.now();
  };
  const check = () => {
    if (st.state !== 'run' || st.lock || !st.ans) return; st.lock = true;
    const ok = +st.ans === st.a * st.b, an = $('#mtAns');
    if (ok) {
      st.correct++; st.streak++; st.bestStreak = Math.max(st.bestStreak, st.streak);
      const fast = (performance.now() - st.qAt) / 1000 < 2.5; const pts = Math.round((10 + Math.min(st.streak, 10) + (fast ? 5 : 0)) * M.mult);
      st.score += pts; st.time = Math.min(MT_CAP, st.time + MT_BONUS); an.classList.add('ok'); float(`+${pts}`);
      JG_TONE(660 + Math.min(st.streak, 8) * 30, 0.09, 'sine', 0.045, 880 + Math.min(st.streak, 8) * 30); JG_VIB(8);
      if (st.correct % 5 === 0 && st.coins < MT_COIN_CAP) { st.coins++; jgCoins(1); setTimeout(() => { float('+1 moneda', 'coin'); JG_TONE(1318, 0.08, 'triangle', 0.045); }, 200); }
      hud(); setTimeout(() => { if (st.state === 'run') next(); }, 300);
    } else {
      st.wrong++; st.streak = 0; st.lives--; st.freeze = true; an.classList.add('no'); $('#mtNote').textContent = `${st.a} × ${st.b} = ${st.a * st.b}`; $('#mtStreak').textContent = '';
      JG_TONE(260, 0.2, 'sine', 0.04, 200); JG_VIB(25); lives();
      if (st.lives <= 0) setTimeout(() => finish('lives'), 1300); else setTimeout(() => { if (st.state === 'run') next(); }, 1300);
    }
  };
  const press = (k) => {
    if (st.state !== 'run' || st.lock) return;
    if (k === 'del') st.ans = st.ans.slice(0, -1); else if (k === 'ok') { check(); return; } else if (st.ans.length < 3) st.ans += k;
    showAns(); if (k !== 'del' && st.ans.length === String(st.a * st.b).length) setTimeout(check, 110);
  };
  const onPad = (e) => { const b = e.target.closest('.mt-key'); if (!b) return; e.preventDefault(); press(b.dataset.k); };
  $('#mtPad').addEventListener('pointerdown', onPad);
  const onKey = (e) => {
    if (e.key === 'Escape') { exit(); return; }
    if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Enter' || e.key === ' ') { if (st.state === 'run') press('ok'); else if (st.state === 'ready') go(); else if (st.state === 'over' && !e.repeat) again(); }
  };
  const go = () => { if (st.state !== 'ready') return; st.state = 'run'; st.t0 = performance.now(); st.last = performance.now(); $('#mtReady').classList.add('hide'); MT.firstAt = MT.firstAt || Date.now(); lives(); hud(); next(); };
  const again = () => { exit(true); mtStart(); setTimeout(() => { const g = document.getElementById('mtGo'); if (g) g.click(); }, 60); };
  const onPop = () => { if (MT.run) { try { history.pushState({ mtGame: true }, ''); } catch { /* */ } exit(); } };
  try { history.pushState({ mtGame: true }, ''); } catch { /* */ }
  addEventListener('keydown', onKey); addEventListener('popstate', onPop);
  $('#mtGo').addEventListener('click', go); $('#mtAgain').addEventListener('click', again);
  $('#mtDone').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; else render(); });
  $('#mtX').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; });
  const loop = (now) => {
    const dt = Math.min(0.1, Math.max(0, (now - st.last) / 1000)); st.last = now;
    if (st.state === 'run' && !st.freeze && !document.hidden) { st.time -= dt; if (st.time <= 0) { st.time = 0; hud(); finish('time'); return; } hud(); }
    st.id = requestAnimationFrame(loop);
  };
  lives(); hud(); st.id = requestAnimationFrame(loop);
  function exit(quiet) {
    cancelAnimationFrame(st.id); removeEventListener('keydown', onKey); removeEventListener('popstate', onPop); st.state = 'over'; st.over = true;
    wrap.remove(); if (!quiet) document.body.classList.remove('gm-on'); MT.run = null; if (!quiet && location.hash === '#/memoria') render();
  }
}

Object.assign(VIDA_ACTS, {
  'mt-start': () => mtStart(),
  'mt-mode': (el) => { jgSet(mtModeKey(), el.dataset.v); render(); },
  'jg-tab': (el) => { const g = el.dataset.g; (JGR[g] ||= { tab: 'dia', data: null }).tab = el.dataset.v; jgRankPaint(g); },
});

/* ---------- rutas y menú Juegos ---------- */
EXTRA_VIEWS.memoria = viewMemoria; EXTRA_NAV.memoria = 'juegos';
{
  const baseJuegos = viewJuegos;
  const row = (href, ic, t, d) => `<li><a href="${href}"><span class="ico">${icon(ic)}</span><span class="txt"><b>${t}</b><span>${d}</span></span>${icon('chev', 'chev')}</a></li>`;
  viewJuegos = function () {
    return baseJuegos().replace('</ul>', row('#/peloton', 'play', 'Pelotón de Tareas', 'Corre por la ciudad, junta libros y monedas y esquiva las tareas.') + row('#/memoria', 'skill', 'Mente Viva', 'Multiplica contra el reloj, con calma. Gana monedas.') + '</ul>');
  };
  EXTRA_VIEWS.juegos = viewJuegos;
}
['peloton', 'memoria'].forEach((k) => { EXTRA_NAV[k] = 'juegos'; });
