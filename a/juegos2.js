/* Cinnavia 7.39 — Juegos nuevos: utilidades compartidas, rankings y Mente Viva.
   · Mente Viva: une cada término con su definición. Cartas que giran, niveles, estrellas, monedas y ranking.
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
    tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Total'], ['manzanas', 'Nivel']],
    val: (x, t) => (t === 'manzanas' ? `nivel ${x.apples}` : `${x.score} pts`),
    mine: (m) => `Tus puntos: <b>${m.best || 0}</b> · nivel más alto: <b>${m.total || 0}</b> · niveles jugados: <b>${m.games || 0}</b>`,
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

/* ---------- Mente Viva ---------- */
const MV_PAIRS = [
  ['Fotosíntesis', 'Las plantas usan la luz para hacer su alimento'],
  ['Sustantivo', 'Nombra personas, animales, lugares o cosas'],
  ['Verbo', 'Indica una acción o un estado'],
  ['Adjetivo', 'Describe o califica al sustantivo'],
  ['Átomo', 'La parte más pequeña de un elemento'],
  ['Ecosistema', 'Seres vivos y su entorno, en conjunto'],
  ['Mitocondria', 'Parte de la célula que produce energía'],
  ['Célula', 'Unidad básica de todos los seres vivos'],
  ['Revolución Mexicana', 'Movimiento armado que inició en 1910'],
  ['Independencia', 'Lucha que comenzó en 1810 con el Grito de Dolores'],
  ['Densidad', 'Masa de un material por cada unidad de volumen'],
  ['Hipótesis', 'Suposición que se pone a prueba con un experimento'],
  ['Metáfora', 'Dice una cosa por otra, sin usar «como»'],
  ['Fracción', 'Parte de un todo, con numerador y denominador'],
  ['Mercadotecnia', 'Estrategias para dar a conocer y vender un producto'],
  ['Oferta', 'Cantidad de un producto que se pone a la venta'],
  ['Demanda', 'Cantidad de un producto que la gente quiere comprar'],
  ['Segmentación', 'Dividir el mercado en grupos parecidos'],
];
const MV_LEVELS = [{ p: 2, c: 2 }, { p: 3, c: 3 }, { p: 4, c: 4 }, { p: 6, c: 4 }, { p: 8, c: 4 }, { p: 10, c: 4 }];
const MV = { cards: [], up: [], done: new Set(), moves: 0, lock: false, lvl: 0, won: false, t0: 0, reward: null, timer: 0 };
const mvKey = () => `aldia:mente:lvl:${REG.me || '_'}`;
const mvStarsKey = () => `aldia:mente:stars:${REG.me || '_'}`;
const mvDailyKey = () => `aldia:mente:daily:${REG.me || '_'}`;
const mvDone = () => Math.min(MV_LEVELS.length, jgNum(mvKey()));
const mvProgress = () => Math.min(MV_LEVELS.length - 1, mvDone());

function mvDeal(lvl) {
  clearTimeout(MV.timer);
  const L = MV_LEVELS[lvl]; const pairs = [...MV_PAIRS].sort(() => Math.random() - 0.5).slice(0, L.p);
  const cards = [];
  pairs.forEach(([t, d], i) => { cards.push({ pair: i, text: t, kind: 'term' }, { pair: i, text: d, kind: 'def' }); });
  MV.cards = cards.sort(() => Math.random() - 0.5); MV.up = []; MV.done = new Set(); MV.moves = 0; MV.lock = false; MV.lvl = lvl; MV.won = false; MV.t0 = 0; MV.reward = null;
}
function mvStars() { const p = MV_LEVELS[MV.lvl].p; return MV.moves <= p + 2 ? 3 : MV.moves <= p * 2 ? 2 : 1; }
/* monedas: primera vez que superas un nivel (nivel+1), cada estrella nueva (+1) y, con 3 estrellas, 1 extra (máx. 5 al día) */
function mvReward(lvl, stars) {
  const arr = jgJSON(mvStarsKey(), []); const prev = +arr[lvl] || 0; let coins = 0;
  if (!prev) coins += lvl + 1;
  if (stars > prev) coins += stars - prev;
  if (stars > prev) { arr[lvl] = stars; jgSet(mvStarsKey(), JSON.stringify(arr)); }
  const day = jgJSON(mvDailyKey(), { d: '', n: 0 });
  const dd = day.d === jgToday() ? day : { d: jgToday(), n: 0 };
  if (stars === 3 && dd.n < 5) { coins += 1; dd.n++; }
  jgSet(mvDailyKey(), JSON.stringify(dd));
  return coins;
}
const mvFs = (txt, cols) => { const n = txt.length, base = cols >= 4 ? 10 : 12; return (n <= 12 ? base + 2.5 : n <= 28 ? base + 0.5 : base).toFixed(1); };

function mvCardsHTML() {
  const L = MV_LEVELS[MV.lvl], cols = L.c;
  return MV.cards.map((cd, i) => {
    const ok = MV.done.has(cd.pair), up = ok || MV.up.includes(i);
    return `<button type="button" class="mv-card ${cd.kind}${up ? ' up' : ''}${ok ? ' ok' : ''}" data-act="mv-flip" data-i="${i}" aria-label="${up ? esc(cd.text) : 'Carta boca abajo'}" ${up ? 'disabled' : ''}>
      <span class="mv-in"><span class="mv-face mv-back"><i>?</i></span>
      <span class="mv-face mv-front"><small>${cd.kind === 'term' ? 'Término' : 'Definición'}</small><span style="font-size:${mvFs(cd.text, cols)}px">${esc(cd.text)}</span></span></span></button>`;
  }).join('');
}
function mvMetaHTML() {
  const L = MV_LEVELS[MV.lvl], found = MV.done.size;
  return `<span>Nivel ${MV.lvl + 1} de ${MV_LEVELS.length}</span><span class="mv-prog" role="img" aria-label="${found} de ${L.p} parejas"><i style="width:${Math.round((found / L.p) * 100)}%"></i></span><span>${MV.moves} ${MV.moves === 1 ? 'intento' : 'intentos'}</span>`;
}
function mvResultHTML() {
  const L = MV_LEVELS[MV.lvl], stars = mvStars(), last = MV.lvl >= MV_LEVELS.length - 1, r = MV.reward || 0;
  return `<div class="mv-result"><b>${last ? '¡Completaste todos los niveles!' : `¡Nivel ${MV.lvl + 1} completado!`}</b>
    <div class="mv-stars" aria-label="${stars} de 3 estrellas">${[1, 2, 3].map((s) => `<span class="${s <= stars ? 'on' : ''}" style="animation-delay:${(s - 1) * 0.16}s">★</span>`).join('')}</div>
    <p class="small muted">${MV.moves} ${MV.moves === 1 ? 'intento' : 'intentos'} para ${L.p} parejas. Menos intentos, más estrellas.</p>
    ${r ? `<p class="mv-coins">${coinSVG ? coinSVG('sm') : ''}<b>+${r}</b> ${r === 1 ? 'moneda' : 'monedas'} para tu árbol</p>` : '<p class="small muted">Este nivel ya te dio sus monedas. Mejora tus estrellas para ganar más.</p>'}
    <p class="small muted" id="mvRank"></p>
    <div class="btn-row" style="justify-content:center">${last ? '<button class="btn primary" data-act="mv-restart">Empezar de nuevo</button>' : '<button class="btn primary" data-act="mv-next">Siguiente nivel</button>'}<button class="btn" data-act="mv-repeat">Repetir este nivel</button></div></div>`;
}

function viewMemoria() {
  if (!MV.cards.length) mvDeal(mvProgress());
  const L = MV_LEVELS[MV.lvl], cols = L.c, done = mvDone();
  const body = MV.won ? mvResultHTML() : `<div class="mv-meta" id="mvMeta">${mvMetaHTML()}</div>
    <div class="mv-grid c${cols}" id="mvGrid" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${mvCardsHTML()}</div>
    <p class="small muted" style="text-align:center;margin:12px 0 0">Une cada <b>término</b> con su <b>definición</b>. Sin prisa y sin castigo: puedes dejarlo y seguir después.</p>`;
  return `<section class="mv-home"><h1 class="page-title">Mente Viva</h1>
    <p class="page-sub">Voltea dos cartas. Si un término y su definición coinciden, se quedan encendidas. Gana estrellas y monedas para tu árbol.</p>
    <div id="mvBody">${body}</div>
    <p class="small muted" style="text-align:center;margin-top:14px">Niveles completados: <b>${done}</b> de ${MV_LEVELS.length}</p>
    <div id="jgRank-mente">${jgRankHTML('mente')}</div>
    <p id="jgLive" class="sr-only" aria-live="polite"></p></section>`;
}

/* actualiza solo lo que cambió (así las cartas giran con animación) */
function mvSync() {
  if (location.hash !== '#/memoria') return;
  const grid = document.getElementById('mvGrid');
  if (!grid || MV.won) { mvFull(); return; }
  grid.querySelectorAll('.mv-card').forEach((el) => {
    const i = +el.dataset.i, cd = MV.cards[i]; if (!cd) return;
    const ok = MV.done.has(cd.pair), up = ok || MV.up.includes(i);
    el.classList.toggle('up', up); el.classList.toggle('ok', ok); el.disabled = up;
    el.setAttribute('aria-label', up ? cd.text : 'Carta boca abajo');
  });
  const meta = document.getElementById('mvMeta'); if (meta) meta.innerHTML = mvMetaHTML();
}
function mvFull() {
  if (location.hash !== '#/memoria') return;
  const page = document.querySelector('.mv-home'); if (!page) { render(); return; }
  const fresh = document.createElement('div'); fresh.innerHTML = viewMemoria();
  page.replaceWith(fresh.querySelector('.mv-home'));
}

function mvFlip(i) {
  if (MV.lock || MV.won || MV.up.includes(i)) return;
  const cd = MV.cards[i]; if (!cd || MV.done.has(cd.pair)) return;
  if (!MV.t0) MV.t0 = Date.now();
  MV.up.push(i); JG_TONE(700 + (i % 5) * 60, 0.05, 'triangle', 0.035);
  if (MV.up.length === 2) {
    MV.moves++;
    const [a, b] = MV.up.map((k) => MV.cards[k]);
    if (a.pair === b.pair && a.kind !== b.kind) {
      MV.done.add(a.pair); MV.up = []; JG_TONE(1046, 0.12, 'triangle', 0.06, 1568); JG_VIB(15);
      if (MV.done.size === MV_LEVELS[MV.lvl].p) { mvWin(); return; }
    } else {
      MV.lock = true;
      MV.timer = setTimeout(() => { MV.up = []; MV.lock = false; mvSync(); }, 900);
    }
  }
  mvSync();
}
function mvWin() {
  MV.won = true; const stars = mvStars(), lvl = MV.lvl;
  jgSet(mvKey(), Math.max(mvDone(), lvl + 1));
  MV.reward = mvReward(lvl, stars); jgCoins(MV.reward);
  JG_TONE(784, 0.18, 'triangle', 0.07, 1046); setTimeout(() => JG_TONE(1318, 0.22, 'triangle', 0.06), 160); JG_VIB([20, 40, 30]);
  mvSync(); /* deja ver la última pareja un momento y luego muestra el resultado */
  const secs = Math.max(1, Math.round((Date.now() - (MV.t0 || Date.now())) / 1000)), moves = MV.moves;
  MV.timer = setTimeout(() => {
    mvFull(); jgAnnounce(`Nivel ${lvl + 1} completado con ${stars} estrellas`);
    jgPost({ game: 'mente', lvl, stars, moves, dur: secs }).then((rec) => {
      const el = document.getElementById('mvRank'); if (rec && el && rec.rankDay) el.textContent = `Hoy vas en el lugar #${rec.rankDay}`;
      jgLoadRank('mente');
    });
  }, 650);
}

Object.assign(VIDA_ACTS, {
  'mv-flip': (el) => mvFlip(+el.dataset.i),
  'mv-next': () => { mvDeal(Math.min(MV_LEVELS.length - 1, MV.lvl + 1)); mvFull(); },
  'mv-repeat': () => { mvDeal(MV.lvl); mvFull(); },
  'mv-restart': () => { mvDeal(0); mvFull(); },
  'jg-tab': (el) => { const g = el.dataset.g; (JGR[g] ||= { tab: 'dia', data: null }).tab = el.dataset.v; jgRankPaint(g); },
});

/* ---------- rutas y menú Juegos ---------- */
EXTRA_VIEWS.memoria = viewMemoria; EXTRA_NAV.memoria = 'juegos';
{
  const baseJuegos = viewJuegos;
  const row = (href, ic, t, d) => `<li><a href="${href}"><span class="ico">${icon(ic)}</span><span class="txt"><b>${t}</b><span>${d}</span></span>${icon('chev', 'chev')}</a></li>`;
  viewJuegos = function () {
    return baseJuegos().replace('</ul>', row('#/peloton', 'play', 'Pelotón de Tareas', 'Corre por la ciudad, junta libros y monedas y esquiva las tareas.') + row('#/memoria', 'skill', 'Mente Viva', 'Une cada término con su definición. Gana estrellas y monedas.') + '</ul>');
  };
  EXTRA_VIEWS.juegos = viewJuegos;
}
['peloton', 'memoria'].forEach((k) => { EXTRA_NAV[k] = 'juegos'; });
