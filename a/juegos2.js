/* Cinnavia 7.38 — Dos juegos nuevos en la sección Juegos:
   · Pelotón de Tareas: corre por tu carril, esquiva las tareas que vencen y recoge libros.
   · Mente Viva: une cada término con su definición. Niveles que se guardan para seguir después.
   Ambos guardan tu récord en este dispositivo. Sin trampas: puedes salir cuando quieras y nada se pierde. */
'use strict';

/* ---------- utilidades ---------- */
const JG_TONE = (f, d, type, vol, f2) => { try { glTone(f, d, type, vol, f2); } catch { /* sin sonido */ } };
const JG_VIB = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* */ } };
const jgGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const jgSet = (k, v) => { try { localStorage.setItem(k, String(v)); } catch { /* */ } };
const jgNum = (k) => +jgGet(k) || 0;
const jgAnnounce = (line) => { /* texto para lectores de pantalla */ const el = document.getElementById('jgLive'); if (el) el.textContent = line; };

/* ---------- Pelotón de Tareas ---------- */
const PM = { run: null, firstAt: 0 };
const pmBestKey = () => `aldia:peloton:best:${REG.me || '_'}`;
const pmBest = () => jgNum(pmBestKey());
const PM_NUDGE_MIN = 20; // después de este rato seguido, sugiere un descanso (no castiga, solo avisa)

function viewPeloton() {
  const best = pmBest();
  return `<section class="gm-home"><h1 class="page-title gm-title">Pelotón de Tareas</h1>
    <p class="page-sub">Corre por tu carril. <b>Toca la mitad izquierda o derecha</b> de la pantalla (o usa las flechas) para cambiar de carril. Recoge los libros y esquiva las tareas que vencen. Mientras más avanzas, más rápido vas.</p>
    <button class="btn primary block gm-play" data-act="pm-start">${icon('play')}Correr</button>
    <p class="small muted" style="text-align:center;margin-top:12px">${best ? `Tu mejor recorrido en este dispositivo: <b>${best}</b> puntos` : 'Todavía no tienes récord. ¡Haz tu primer recorrido!'}</p>
    <p class="small muted" style="text-align:center;margin-top:6px">Puedes salir cuando quieras. Tu récord se guarda igual.</p></section>`;
}

function pmStart() {
  if (PM.run) return;
  if (!PM.firstAt || Date.now() - PM.lastEnd > 10 * 60000) PM.firstAt = Date.now();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage pm-stage';
  wrap.innerHTML = `<canvas id="pmC" aria-label="Pelotón de Tareas"></canvas>
    <button class="gm-x gl-x" id="pmX" aria-label="Salir del juego">${icon('x')}</button>
    <div class="gl-hint" id="pmHint">Toca izquierda o derecha para cambiar de carril</div>
    <div class="gl-over" id="pmOver" hidden><b>Fin del recorrido</b><span id="pmFin"></span><span class="small muted" id="pmNote"></span>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="pmAgain">${icon('play')}Otra vez</button><button class="btn" id="pmDone">Volver a Juegos</button></div></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const c = wrap.querySelector('canvas'), g = c.getContext('2d');
  const over = wrap.querySelector('#pmOver'), hint = wrap.querySelector('#pmHint');
  const V = { w: 360, h: 640, dpr: 1, laneW: 90 };
  const size = () => {
    V.dpr = Math.min(2, devicePixelRatio || 1); const W = innerWidth, H = innerHeight;
    c.width = Math.round(W * V.dpr); c.height = Math.round(H * V.dpr); c.style.width = W + 'px'; c.style.height = H + 'px';
    V.w = W; V.h = H; V.laneW = Math.min(120, W * 0.3);
  };
  size();
  const laneX = (i) => V.w / 2 + (i - 1) * V.laneW;
  const py = () => V.h * 0.8;
  const st = { lane: 1, x: 0, objs: [], rowAcc: 0, gap: 0, dist: 0, speed: 170, books: 0, score: 0, state: 'idle', last: performance.now(), id: 0, step: 0, lastRow: [] };
  const reset = () => { Object.assign(st, { lane: 1, objs: [], rowAcc: 0, gap: 0, dist: 0, speed: 170, books: 0, score: 0, state: 'idle', step: 0, lastRow: [] }); st.x = laneX(1); over.hidden = true; over.classList.remove('show'); hint.hidden = false; };
  reset(); st.x = laneX(1);
  PM.run = st;

  /* genera una fila: siempre deja al menos un carril libre */
  const spawnRow = () => {
    const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
    const blocks = st.dist < 260 ? 1 : (st.speed > 280 && Math.random() < 0.45 ? 2 : 1);
    const taskLanes = lanes.slice(0, blocks);
    for (const l of taskLanes) st.objs.push({ kind: 'task', lane: l, y: -50 });
    const free = lanes.slice(blocks);
    if (free.length && Math.random() < 0.7) st.objs.push({ kind: 'book', lane: free[0], y: -50 });
  };

  const lane = (d) => { if (st.state !== 'run') return; st.lane = Math.max(0, Math.min(2, st.lane + d)); };
  const onDown = (e) => {
    if (e.target.closest('.gl-x, .gl-over')) return; e.preventDefault();
    if (st.state === 'idle') { st.state = 'run'; hint.hidden = true; st.last = performance.now(); }
    if (st.state !== 'run') return;
    lane(e.clientX < innerWidth / 2 ? -1 : 1);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); lane(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); lane(1); }
    else if (e.key === 'Escape') exit();
    else if ((e.key === ' ' || e.key === 'Enter') && st.state === 'over' && !e.repeat) again();
    else if ((e.key === ' ' || e.key === 'Enter') && st.state === 'idle' && !e.repeat) { st.state = 'run'; hint.hidden = true; st.last = performance.now(); }
  };
  const onPop = () => { if (PM.run) { try { history.pushState({ pmGame: true }, ''); } catch { /* */ } exit(); } };
  try { history.pushState({ pmGame: true }, ''); } catch { /* */ }
  wrap.addEventListener('touchstart', (e) => { if (!e.target.closest('button')) e.preventDefault(); }, { passive: false });
  wrap.addEventListener('pointerdown', onDown);
  addEventListener('keydown', onKey); addEventListener('resize', size); addEventListener('popstate', onPop);

  const end = () => {
    if (st.state === 'over') return;
    st.state = 'over'; PM.lastEnd = Date.now(); JG_TONE(180, 0.35, 'sawtooth', 0.08, 60); JG_VIB([200, 70, 200]);
    const sc = st.score, best0 = pmBest(); const newBest = sc > best0;
    if (newBest) jgSet(pmBestKey(), sc);
    wrap.querySelector('#pmFin').textContent = `${sc} puntos · ${st.books} ${st.books === 1 ? 'libro' : 'libros'}${newBest && sc > 0 ? ' · ¡nuevo récord!' : ` · récord ${Math.max(best0, sc)}`}`;
    const mins = (Date.now() - (PM.firstAt || Date.now())) / 60000;
    wrap.querySelector('#pmNote').textContent = mins >= PM_NUDGE_MIN ? `Llevas ${Math.round(mins)} minutos seguidos. Un descanso corto te ayuda a rendir mejor en tus tareas.` : '';
    over.hidden = false; void over.offsetWidth; over.classList.add('show');
    jgAnnounce(`Fin del recorrido: ${sc} puntos`);
  };
  const again = () => { reset(); st.x = laneX(1); st.state = 'run'; st.last = performance.now(); PM.firstAt = PM.firstAt || Date.now(); };
  wrap.querySelector('#pmAgain').addEventListener('click', again);
  wrap.querySelector('#pmDone').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; else render(); });

  const tick = (dt) => {
    if (st.state === 'run') {
      const dy = st.speed * dt; st.dist += dy; st.rowAcc += dy;
      if (!st.gap) st.gap = 90;
      if (st.rowAcc >= st.gap) { st.rowAcc = 0; st.gap = 130 + Math.random() * 90; spawnRow(); }
      for (const o of st.objs) o.y += dy;
      st.objs = st.objs.filter((o) => o.y < V.h + 60 && !o.taken);
      st.speed = Math.min(430, 170 + st.dist / 55);
      for (const o of st.objs) {
        if (o.taken || o.lane !== st.lane || Math.abs(o.y - py()) > 34) continue;
        if (o.kind === 'book') { o.taken = true; st.books++; JG_TONE(1318, 0.07, 'triangle', 0.05); }
        else { end(); return; }
      }
      st.score = Math.floor(st.dist / 10) + st.books * 10;
    }
    st.x += (laneX(st.lane) - st.x) * Math.min(1, dt * 16);
  };

  const draw = () => {
    const W = V.w, H = V.h; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#CFE7D5'); bg.addColorStop(1, '#8DBE97');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    // carriles
    const roadW = V.laneW * 3 + 14, x0 = W / 2 - roadW / 2;
    g.fillStyle = 'rgba(40,70,50,.16)'; g.fillRect(x0, 0, roadW, H);
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 2; g.setLineDash([18, 16]); g.lineDashOffset = -(st.dist % 34);
    for (const i of [-0.5, 0.5]) { const x = W / 2 + i * V.laneW; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    g.setLineDash([]);
    // objetos
    for (const o of st.objs) {
      if (o.taken) continue; const x = laneX(o.lane);
      if (o.kind === 'task') {
        g.fillStyle = '#B9462F'; roundRect(g, x - V.laneW * 0.36, o.y - 26, V.laneW * 0.72, 52, 12); g.fill();
        g.fillStyle = '#fff'; g.font = '700 12px system-ui, sans-serif'; g.textAlign = 'center'; g.fillText('¡VENCE!', x, o.y + 5);
      } else {
        g.fillStyle = '#E9B44C'; roundRect(g, x - 13, o.y - 17, 26, 34, 4); g.fill();
        g.fillStyle = '#9A6A16'; g.fillRect(x - 13, o.y - 17, 4, 34);
      }
    }
    // corredor
    const x = st.x, y = py() + (st.state === 'run' ? Math.sin(performance.now() / 90) * 2 : 0);
    g.fillStyle = 'rgba(30,50,40,.22)'; g.beginPath(); g.ellipse(x, y + 24, 20, 5, 0, 0, 7); g.fill();
    g.fillStyle = '#2A7F53'; roundRect(g, x - 14, y - 6, 28, 30, 10); g.fill();
    g.fillStyle = '#F2C9A0'; g.beginPath(); g.arc(x, y - 16, 10, 0, 7); g.fill();
    g.fillStyle = '#17392A'; g.fillRect(x - 10, y - 22, 20, 5);
    // marcador
    const hx = W / 2 - 110; g.fillStyle = 'rgba(20,40,30,.7)'; roundRect(g, hx, 14, 220, 40, 12); g.fill();
    g.fillStyle = '#fff'; g.font = '700 18px system-ui, sans-serif'; g.textAlign = 'left'; g.fillText(`${st.score} pts`, hx + 14, 40);
    g.textAlign = 'right'; g.font = '600 14px system-ui, sans-serif'; g.fillStyle = '#F6D58C'; g.fillText(`${st.books} libros`, hx + 206, 40);
  };
  function roundRect(gg, x, y, w, h, r) { gg.beginPath(); gg.moveTo(x + r, y); gg.arcTo(x + w, y, x + w, y + h, r); gg.arcTo(x + w, y + h, x, y + h, r); gg.arcTo(x, y + h, x, y, r); gg.arcTo(x, y, x + w, y, r); gg.closePath(); }

  const loop = (now) => {
    const dt = Math.min(0.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
    tick(dt); draw(); st.id = requestAnimationFrame(loop);
  };
  st.id = requestAnimationFrame(loop);

  const exit = () => {
    cancelAnimationFrame(st.id); removeEventListener('keydown', onKey); removeEventListener('resize', size); removeEventListener('popstate', onPop);
    wrap.remove(); document.body.classList.remove('gm-on'); PM.run = null;
    if (location.hash === '#/peloton') render();
  };
  wrap.querySelector('#pmX').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; });
}
PM.lastEnd = 0;

/* ---------- Mente Viva ---------- */
const MV_PAIRS = [
  ['Fotosíntesis', 'Las plantas usan la luz para hacer su alimento'],
  ['Sustantivo', 'Nombra personas, animales, lugares o cosas'],
  ['Verbo', 'Indica una acción o un estado'],
  ['Átomo', 'La parte más pequeña de un elemento que conserva sus propiedades'],
  ['Ecosistema', 'Seres vivos y su entorno, en conjunto'],
  ['Mitocondria', 'Parte de la célula que produce energía'],
  ['Revolución Mexicana', 'Movimiento armado que inició en 1910'],
  ['Densidad', 'Masa de un material por cada unidad de volumen'],
  ['Hipótesis', 'Suposición que se pone a prueba con un experimento'],
  ['Metáfora', 'Comparación que dice una cosa por otra, sin usar «como»'],
];
const MV_LEVELS = [{ p: 2, c: 2 }, { p: 3, c: 3 }, { p: 4, c: 4 }, { p: 5, c: 5 }, { p: 6, c: 4 }, { p: 8, c: 4 }];
const MV = { cards: [], up: [], done: new Set(), moves: 0, lock: false, lvl: 0, shown: false, won: false };
const mvKey = () => `aldia:mente:lvl:${REG.me || '_'}`;
// niveles completados (guardado); el siguiente nivel a jugar es ese número, sin pasarse del último
const mvDone = () => Math.min(MV_LEVELS.length, jgNum(mvKey()));
const mvProgress = () => Math.min(MV_LEVELS.length - 1, mvDone());

function mvDeal(lvl) {
  const L = MV_LEVELS[lvl]; const pairs = [...MV_PAIRS].sort(() => Math.random() - 0.5).slice(0, L.p);
  const cards = [];
  pairs.forEach(([t, d], i) => { cards.push({ pair: i, text: t, kind: 'term' }, { pair: i, text: d, kind: 'def' }); });
  MV.cards = cards.sort(() => Math.random() - 0.5); MV.up = []; MV.done = new Set(); MV.moves = 0; MV.lock = false; MV.lvl = lvl; MV.won = false;
}
function mvStars() { const p = MV_LEVELS[MV.lvl].p; return MV.moves <= p + 1 ? 3 : MV.moves <= p * 2 ? 2 : 1; }

function viewMemoria() {
  if (!MV.cards.length) mvDeal(mvProgress());
  const L = MV_LEVELS[MV.lvl], cols = L.c, done = mvDone();
  let body;
  if (MV.won) {
    const stars = mvStars(), last = MV.lvl >= MV_LEVELS.length - 1;
    body = `<div class="mv-result"><b>${last ? '¡Completaste todos los niveles!' : `¡Nivel ${MV.lvl + 1} completado!`}</b>
      <div class="mv-stars" aria-label="${stars} de 3 estrellas">${[1, 2, 3].map((s) => `<span class="${s <= stars ? 'on' : ''}">★</span>`).join('')}</div>
      <p class="small muted">${MV.moves} ${MV.moves === 1 ? 'intento' : 'intentos'} para ${L.p} ${L.p === 1 ? 'pareja' : 'parejas'}. Cuantos menos intentos, más estrellas.</p>
      <div class="btn-row" style="justify-content:center">${last ? '<button class="btn primary" data-act="mv-restart">Empezar de nuevo</button>' : '<button class="btn primary" data-act="mv-next">Siguiente nivel</button>'}<button class="btn" data-act="mv-repeat">Repetir este nivel</button></div></div>`;
  } else {
    body = `<div class="mv-meta"><span>Nivel ${MV.lvl + 1} de ${MV_LEVELS.length}</span><span>${MV.moves} ${MV.moves === 1 ? 'intento' : 'intentos'}</span></div>
      <div class="mv-grid" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${MV.cards.map((cd, i) => {
        const up = MV.up.includes(i) || MV.done.has(cd.pair);
        const ok = MV.done.has(cd.pair);
        return `<button type="button" class="mv-card${up ? ' up' : ''}${ok ? ' ok' : ''}" data-act="mv-flip" data-i="${i}" aria-label="${up ? esc(cd.text) : 'Carta boca abajo'}" ${up || MV.lock ? 'disabled' : ''}>${up ? `<span>${esc(cd.text)}</span>` : '<span class="mv-q">?</span>'}</button>`;
      }).join('')}</div>
      <p class="small muted" style="text-align:center;margin:12px 0 0">Une cada <b>término</b> con su <b>definición</b>. No hay prisa ni castigo: puedes dejarlo y seguir después.</p>`;
  }
  return `<section class="mv-home"><h1 class="page-title">Mente Viva</h1>
    <p class="page-sub">Voltea dos cartas. Si un término y su definición coinciden, quedan encendidas. Avanza de nivel cuando las completes todas.</p>
    ${body}
    <p class="small muted" style="text-align:center;margin-top:14px">Niveles completados: <b>${done}</b> de ${MV_LEVELS.length}</p>
    <p id="jgLive" class="sr-only" aria-live="polite"></p></section>`;
}

function mvFlip(i) {
  if (MV.lock || MV.won || MV.up.includes(i)) return;
  const cd = MV.cards[i]; if (!cd || MV.done.has(cd.pair)) return;
  MV.up.push(i); JG_TONE(700 + (i % 5) * 60, 0.05, 'triangle', 0.035);
  if (MV.up.length === 2) {
    MV.moves++;
    const [a, b] = MV.up.map((k) => MV.cards[k]);
    if (a.pair === b.pair && a.kind !== b.kind) {
      MV.done.add(a.pair); MV.up = []; JG_TONE(1046, 0.12, 'triangle', 0.06, 1568); JG_VIB(15);
      if (MV.done.size === MV_LEVELS[MV.lvl].p) {
        MV.won = true; jgSet(mvKey(), Math.max(mvDone(), MV.lvl + 1));
        JG_TONE(784, 0.18, 'triangle', 0.07, 1046);
      }
    } else {
      MV.lock = true;
      setTimeout(() => { MV.up = []; MV.lock = false; mvPaint(); }, 800);
    }
  }
  mvPaint();
}
function mvPaint() {
  if (location.hash !== '#/memoria') return;
  const page = document.querySelector('.mv-home');
  if (!page) { render(); return; }
  const fresh = document.createElement('div'); fresh.innerHTML = viewMemoria();
  const sec = fresh.querySelector('.mv-home'); page.replaceWith(sec);
}

Object.assign(VIDA_ACTS, {
  'pm-start': () => pmStart(),
  'mv-flip': (el) => mvFlip(+el.dataset.i),
  'mv-next': () => { mvDeal(Math.min(MV_LEVELS.length - 1, MV.lvl + 1)); mvPaint(); },
  'mv-repeat': () => { mvDeal(MV.lvl); mvPaint(); },
  'mv-restart': () => { mvDeal(0); mvPaint(); },
});

/* ---------- rutas y menú Juegos ---------- */
EXTRA_VIEWS.peloton = viewPeloton; EXTRA_NAV.peloton = 'juegos';
EXTRA_VIEWS.memoria = viewMemoria; EXTRA_NAV.memoria = 'juegos';
{
  const baseJuegos = viewJuegos;
  const row = (href, ic, t, d) => `<li><a href="${href}"><span class="ico">${icon(ic)}</span><span class="txt"><b>${t}</b><span>${d}</span></span>${icon('chev', 'chev')}</a></li>`;
  viewJuegos = function () {
    return baseJuegos().replace('</ul>', row('#/peloton', 'play', 'Pelotón de Tareas', 'Corre, recoge libros y esquiva las tareas que vencen.') + row("#/memoria", "skill", 'Mente Viva', 'Une cada término con su definición. Niveles para seguir después.') + '</ul>');
  };
  EXTRA_VIEWS.juegos = viewJuegos;
}
["peloton", "memoria"].forEach((k) => { EXTRA_NAV[k] = 'juegos'; });
