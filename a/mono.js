/* Cinnavia 7.52 — Monito Saltarín.
   Un monito cruza carriles sin fin: los elefantes caminan como carros, en el agua hay que saltar de cocodrilo en cocodrilo
   y cada cierto tramo cambia el bioma (selva, sabana, nieve, desierto, pantano, volcán).
   Toca para saltar adelante, desliza a los lados o hacia abajo. Ranking propio. Sin castigo por salir. */
'use strict';

const MN = { run: null, firstAt: 0, lastEnd: 0 };
const MN_COLS = 7, MN_BLEN = 28, MN_COIN_CAP = 15, MN_IDLE_WARN = 7, MN_IDLE_KILL = 11, MN_PER = MN_COLS + 12, MN_X0 = -6, MN_NUDGE_MIN = 20;
const mnBestKey = () => `aldia:mono:best:${REG.me || '_'}`;
const mnBest = () => jgNum(mnBestKey());
const mnClamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mnEqKey = () => `aldia:mono:eq:${REG.me || '_'}`, mnOwnKey = () => `aldia:mono:own:${REG.me || '_'}`, mnWalKey = () => `aldia:mono:wallet:${REG.me || '_'}`;
const mnWallet = () => jgNum(mnWalKey());
const mnJson = (k, d) => { try { const v = JSON.parse(jgGet(k)); return v && typeof v === 'object' ? v : d; } catch { return d; } };
const mnOwned = () => new Set(['cafe', 'none', ...(mnJson(mnOwnKey(), []))]);
const mnEq = () => ({ fur: 'cafe', hat: 'none', face: 'none', neck: 'none', back: 'none', trail: 'none', ...mnJson(mnEqKey(), {}) });
function mnLook(eq, cats) {
  const own = mnOwned(); const o = {}; const get = (c, id) => (MN_ITEMS[c].find((x) => x[0] === id) || null);
  const ok = (c) => { const id = eq[c]; return id && (id === 'none' || id === 'cafe' || own.has(id) || (cats && cats.free)) ? id : (c === 'fur' ? 'cafe' : 'none'); };
  const f = get('fur', ok('fur')) || MN_ITEMS.fur[0]; o.fur = f[3]; o.furD = f[4]; o.skin = f[5];
  for (const c of ['hat', 'face', 'neck', 'back', 'trail']) { const id = ok(c); if (id !== 'none') o[c] = id; }
  return o;
}
const mnPick = (a) => a[Math.floor(Math.random() * a.length)];

/* ---------- pantalla de inicio ---------- */
function mnHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="mnhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fdc8f"/><stop offset="1" stop-color="#e8f6c8"/></linearGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#mnhS)"/>
    <rect y="30" width="360" height="40" fill="#72c24f"/><rect y="70" width="360" height="40" fill="#6a6556"/><g fill="#efe3ae"><rect x="20" y="88" width="34" height="4" rx="2"/><rect x="110" y="88" width="34" height="4" rx="2"/><rect x="200" y="88" width="34" height="4" rx="2"/><rect x="290" y="88" width="34" height="4" rx="2"/></g>
    <rect y="110" width="360" height="40" fill="#2f8f86"/><rect y="150" width="360" height="20" fill="#66b546"/>
    <g fill="#2f8f86" opacity=".6"><path d="M20 124q10-6 20 0M120 136q10-6 20 0M240 126q10-6 20 0"/></g>
    <g transform="translate(220 140)"><rect x="-58" y="-30" width="116" height="26" rx="13" fill="#3f7f3a"/><path d="M58 -22h30l-2 14h-28z" fill="#3f7f3a"/><path d="M-58 -18l-26 8 26 4z" fill="#3f7f3a"/><g fill="#2c5e2b"><path d="M-30 -30l8-12 8 12zM-10 -30l8-12 8 12zM10 -30l8-12 8 12z"/></g><circle cx="42" cy="-31" r="5" fill="#e6d65a"/><g fill="#fff"><path d="M64 -9l3 6 3-6zM73 -9l3 6 3-6z"/></g></g>
    <g transform="translate(86 92)"><g stroke="#7d8791" stroke-width="9" stroke-linecap="round"><path d="M-22 -22l-2 20M-8 -22l2 20M12 -22l-2 20M26 -22l2 20"/></g><ellipse cx="0" cy="-30" rx="36" ry="24" fill="#8a949e"/><ellipse cx="-2" cy="-38" rx="26" ry="12" fill="#9aa4ad"/><circle cx="38" cy="-40" r="17" fill="#8a949e"/><path d="M50 -34c14 6 12 24 6 34" fill="none" stroke="#8a949e" stroke-width="9" stroke-linecap="round"/><ellipse cx="28" cy="-38" rx="11" ry="16" fill="#76808a"/><path d="M47 -28q16 4 20-8" fill="none" stroke="#f4ecd8" stroke-width="4" stroke-linecap="round"/><circle cx="46" cy="-45" r="2.6" fill="#111"/><rect x="-18" y="-60" width="30" height="12" rx="4" fill="#d9473a"/></g>
    <g transform="translate(150 150)"><path d="M26 -14 C 60 -10 60 -46 40 -46" fill="none" stroke="#6d4520" stroke-width="7" stroke-linecap="round"/><ellipse cx="0" cy="-22" rx="22" ry="25" fill="#8a5a2c"/><ellipse cx="0" cy="-20" rx="13" ry="17" fill="#f2cc9e"/><circle cx="-22" cy="-62" r="10" fill="#8a5a2c"/><circle cx="22" cy="-62" r="10" fill="#8a5a2c"/><circle cx="0" cy="-60" r="22" fill="#8a5a2c"/><ellipse cx="0" cy="-56" rx="16" ry="14" fill="#f2cc9e"/><circle cx="-7" cy="-62" r="3" fill="#1d120a"/><circle cx="7" cy="-62" r="3" fill="#1d120a"/><path d="M-5 -52q5 5 10 0" fill="none" stroke="#7a4b2a" stroke-width="2.4" stroke-linecap="round"/></g>
    <g transform="translate(312 52) rotate(-24)"><path d="M-12 0 Q0 22 18 -6 Q4 10 -12 0z" fill="#ffd93a" stroke="#8a6a10" stroke-width="1.6"/></g></svg>`;
}
function viewMono() {
  const best = mnBest();
  return `<section class="gm-home"><div class="gm-hero">${mnHero()}</div><h1 class="page-title gm-title">Monito Saltarín</h1>
    <p class="page-sub">Ayuda al monito a cruzar sin parar. <b>Toca la pantalla</b> para saltar adelante y <b>desliza</b> para ir a los lados o hacia atrás (también sirven las flechas). Los <b>elefantes</b> cruzan los caminos, así que espera el hueco. En el agua salta de <b>cocodrilo en cocodrilo</b> y no te quedes quieto: si tardas demasiado, aparece un águila. Cada tramo cambia el bioma y las <b>bananas</b> se vuelven monedas para tu árbol.</p>
    <button class="btn primary block gm-play" data-act="mn-start">${icon('play')}Jugar</button>
    <a class="btn block" href="#/monotienda" style="margin-top:10px">Tienda del monito · ${mnWallet()} bananas</a>
    <p class="small muted" style="text-align:center;margin-top:12px">${best ? `Tu mejor en este dispositivo: <b>${best}</b> saltos` : 'Todavía no tienes récord. ¡Haz tu primer cruce!'}</p>
    <p class="small muted" style="text-align:center;margin-top:6px">Puedes salir cuando quieras. Tu récord y tus monedas se guardan igual.</p>
    <div id="jgRank-mono">${jgRankHTML('mono')}</div></section>`;
}
JG_CFG.mono = { tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']], val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'partida', 'partidas') : `${x.score} saltos`), mine: (m) => `Tu mejor: <b>${m.best || 0} saltos</b> · partidas: <b>${m.games || 0}</b>`, none: 'Aún nadie ha cruzado en este periodo. ¡Sé la primera persona!' };

/* ---------- carriles ---------- */
const mnItemX = (lane, it, t) => { let p = (it.x0 + lane.dir * lane.v * t - MN_X0) % MN_PER; if (p < 0) p += MN_PER; return p + MN_X0; };
function mnMakeLane(kind, lvl, dir, b) {
  const road = kind === 'road';
  const v = road ? (1.4 + Math.random() * 1.6) * (1 + 0.45 * lvl) : (0.9 + Math.random() * 1.0) * (1 + 0.35 * lvl);
  const avg = road ? 5.8 - 2.2 * lvl + (Math.random() * 0.8 - 0.4) : 5.2 + Math.random() * 0.8;
  const minGap = road ? 2.1 : 1.25;
  let n = Math.max(road ? 2 : 3, Math.round(MN_PER / avg)), lens;
  for (;;) {
    lens = Array.from({ length: n }, () => (road ? mnPick([1.4, 1.4, 1.7, 1.7, 2.1]) : 2 + Math.random() * 1.2));
    if (n <= 1 || lens.reduce((a, c) => a + c, 0) + n * minGap <= MN_PER) break; n--;
  }
  const sum = lens.reduce((a, c) => a + c, 0); const rem = MN_PER - sum - n * minGap; const w = Array.from({ length: n }, () => road ? Math.random() + 0.2 : 0.6 + Math.random() * 0.4); const ws = w.reduce((a, c) => a + c, 0);
  const items = []; let pos = MN_X0 + Math.random() * MN_PER;
  for (let i = 0; i < n; i++) {
    const fur = mnPick(MN_BIOMES[b].fur);
    items.push({ x0: pos, len: lens[i], fur, band: road && Math.random() < 0.28 ? mnPick(['#d9473a', '#e9b44c', '#3b7fd4', '#2f9a6a']) : null, ph: Math.random() * 6.28, big: lens[i] > 1.5 });
    pos += lens[i] + minGap + rem * (w[i] / ws);
  }
  return { dir, v, items };
}

/* ---------- el juego ---------- */
function mnStart() {
  if (MN.run) return;
  if (!MN.firstAt || Date.now() - MN.lastEnd > 10 * 60000) MN.firstAt = Date.now();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage mn-stage';
  wrap.innerHTML = `<canvas id="mnC" aria-label="Monito Saltarín"></canvas>
    <button class="gm-x gl-x" id="mnX" aria-label="Salir del juego">${icon('x')}</button>
    <div class="mn-hint" id="mnHint">Toca para saltar · desliza para ir a los lados</div>
    <div class="gl-over" id="mnOver" hidden><b id="mnTitle">Fin del cruce</b><span id="mnFin"></span><span id="mnCoins" class="pm-gain"></span><span id="mnBank" class="small muted"></span><span class="small muted" id="mnRank"></span><span class="small muted" id="mnNote"></span>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="mnAgain">${icon('play')}Otra vez</button><button class="btn" id="mnDone">Volver a Juegos</button></div></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const c = wrap.querySelector('canvas'), g = c.getContext('2d');
  const over = wrap.querySelector('#mnOver'), hint = wrap.querySelector('#mnHint');
  const EQ = mnEq(), LOOK = mnLook(EQ);
  const TRAIL = { hojas: ['#5fae48', '#8fd16a'], burbujas: ['#bfe9ff', '#e6f7ff'], estrellas: ['#ffe066', '#fff3a8'], chispas: ['#ff9a3c', '#ffd23c'], corazones: ['#ee4f84', '#ff8fb3'], arcoiris: ['#ff5a5a', '#ffb23c', '#ffe066', '#6bd66b', '#4aa8ff', '#a06bff'] };
  const trailAt = (x, y) => { const c = TRAIL[LOOK.trail]; if (!c) return; for (let i = 0; i < 4; i++) st.parts.push({ x: x + (Math.random() - 0.5) * V.U * 0.5, y: y - V.U * 0.2, vx: (Math.random() - 0.5) * 80, vy: -40 - Math.random() * 90, t: 0, life: 0.5 + Math.random() * 0.5, grav: 60, color: mnPick(c), r: 2.5 + Math.random() * 2 }); };
  const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;visibility:hidden;padding-top:env(safe-area-inset-top,0px)'; wrap.appendChild(probe);
  const V = { w: 360, h: 640, dpr: 1, U: 52, RH: 46, offX: 0, baseY: 470, safe: 0 };
  const size = () => {
    V.dpr = Math.min(2, devicePixelRatio || 1); const W = innerWidth, H = innerHeight;
    c.width = Math.round(W * V.dpr); c.height = Math.round(H * V.dpr); c.style.width = W + 'px'; c.style.height = H + 'px';
    V.w = W; V.h = H; V.U = Math.min(W / MN_COLS, H / 9.5, 78); V.RH = V.U * 0.88; V.offX = (W - MN_COLS * V.U) / 2; V.baseY = H * 0.7; V.safe = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  };
  size();

  const st = { state: 'idle', t: 0, playT: 0, rows: new Map(), gs: null, genR: -4, maxR: 0, cam: 0, p: null, bananas: 0, coins: 0, idle: 0, parts: [], floats: [], shake: 0, flash: 0, banner: null, curB: 0, dead: null, eagle: null, amb: [], id: 0, last: performance.now(), over: false };
  const p0 = () => ({ r: 0, x: MN_COLS / 2, hop: null, buf: null, ride: null, bump: null, face: 1, squash: 0, look: 0 });
  const bOf = (r) => Math.floor(Math.max(0, r) / MN_BLEN) % MN_BIOMES.length;

  /* ----- generación de filas ----- */
  const genRow = (r) => {
    const gs = st.gs; const b = bOf(r); const lvl = mnClamp((r - 5) / 260, 0, 1); const row = { r, b, type: 'grass', obs: [], coin: -1, coinTaken: false, lane: null, clear: false, tone: r & 1 };
    if (r < 0) { for (let i = 0; i < MN_COLS; i++) row.obs[i] = Math.random() < 0.34; return row; }
    let type = 'grass';
    if (r > 2) {
      if (gs.last === 'road' || gs.last === 'river') type = gs.run < 3 && Math.random() < 0.5 ? gs.last : 'grass';
      else {
        const wRiver = [0.34, 0.3, 0.34, 0.2, 0.44, 0.38][b], wRoad = [0.4, 0.42, 0.38, 0.5, 0.28, 0.34][b];
        const forced = gs.grassRun >= 3; const roll = Math.random() * (forced ? wRiver + wRoad : 1);
        type = roll < wRoad ? 'road' : roll < wRoad + wRiver ? 'river' : 'grass';
        if (type === 'grass' && gs.grassRun < 1 && gs.last !== 'start') type = 'grass';
      }
    }
    row.type = type;
    if (type === 'grass') {
      row.clear = gs.last === 'road' || gs.last === 'river' || r <= 0;
      const fc = gs.fc, fc2 = mnClamp(fc + mnPick([-1, 0, 0, 1]), 0, MN_COLS - 1);
      const p = row.clear || r <= 0 ? 0 : [0.16, 0.2, 0.22, 0.2, 0.24, 0.26][b] + 0.06 * lvl; let cnt = 0;
      for (let i = 0; i < MN_COLS; i++) { const ob = i !== fc && i !== fc2 && cnt < 4 && Math.random() < p; row.obs[i] = ob; if (ob) cnt++; }
      gs.fc = fc2;
      if (r > 2 && Math.random() < 0.3) { const free = []; for (let i = 0; i < MN_COLS; i++) if (!row.obs[i]) free.push(i); row.coin = mnPick(free); }
      gs.grassRun++; gs.run = 0;
    } else {
      const dir = gs.last === type ? -gs.dir : (Math.random() < 0.5 ? -1 : 1);
      row.lane = mnMakeLane(type, lvl, dir, b); gs.dir = dir; gs.run = gs.last === type ? gs.run + 1 : 1; gs.grassRun = 0;
    }
    gs.last = type; return row;
  };
  const ensure = (r) => { while (st.genR < r) { st.genR++; st.rows.set(st.genR, genRow(st.genR)); } return st.rows.get(r); };
  const reset = () => {
    st.rows = new Map(); st.gs = { last: 'start', run: 0, grassRun: 0, fc: 3, dir: 1 }; st.genR = -4;
    Object.assign(st, { state: 'idle', t: 0, playT: 0, maxR: 0, cam: 0, p: p0(), bananas: 0, coins: 0, idle: 0, parts: [], floats: [], shake: 0, flash: 0, banner: { name: MN_BIOMES[0].name, t: 0 }, curB: 0, dead: null, eagle: null, over: false });
    ensure(28); over.hidden = true; over.classList.remove('show'); hint.hidden = false;
  };
  const initAmb = () => { st.amb = Array.from({ length: 34 }, () => ({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random(), ph: Math.random() * 6.28 })); };
  initAmb(); reset(); MN.run = st;

  /* ----- efectos ----- */
  const spawn = (x, y, color, n, sp, o = {}) => { for (let i = 0; i < n; i++) { const a = o.up ? -Math.PI / 2 + (Math.random() - 0.5) * 1.6 : Math.random() * 6.28; const s = sp * (0.4 + Math.random() * 0.8); st.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, life: 0.4 + Math.random() * 0.4, grav: o.grav ?? 500, color, r: (o.r || 3) * (0.6 + Math.random() * 0.8) }); } };
  const float = (x, y, text, color) => st.floats.push({ x, y, text, color, t: 0 });
  const pos = (r, x) => ({ x: V.offX + x * V.U, y: V.baseY - (r - st.cam) * V.RH + V.RH * 0.28 });

  /* ----- fin ----- */
  const CAUSE = { ele: 'Te pisó un elefante', agua: 'Caíste al agua', arrastrado: 'El cocodrilo te llevó muy lejos', aguila: 'Te atrapó el águila' };
  const die = (kind) => {
    if (st.state === 'dead' || st.state === 'over') return;
    st.state = 'dead'; st.dead = { kind, t: 0 }; st.p.hop = null; st.p.buf = null; st.shake = 0.4; st.flash = 0.8; MN.lastEnd = Date.now();
    const q = pos(st.p.r, st.p.x);
    if (kind === 'ele') { spawn(q.x, q.y - V.U * 0.5, '#ffd93a', 14, 260, { up: true }); JG_TONE(200, 0.3, 'sawtooth', 0.08, 70); JG_VIB([160, 60, 160]); }
    else if (kind === 'aguila') { JG_TONE(1400, 0.35, 'sawtooth', 0.06, 500); JG_VIB([120, 50, 120]); }
    else { spawn(q.x, q.y, '#bfe9ff', 26, 300, { up: true, r: 3.5 }); JG_TONE(240, 0.35, 'sine', 0.08, 90); JG_VIB([140, 50, 140]); }
    setTimeout(() => finish(kind), kind === 'aguila' ? 900 : 650);
  };
  const finish = (kind) => {
    if (!wrap.isConnected || st.state !== 'dead') return; st.state = 'over';
    const sc = st.maxR, best0 = mnBest(), newBest = sc > best0; if (newBest) jgSet(mnBestKey(), sc);
    const secs = Math.max(1, Math.round(st.playT));
    wrap.querySelector('#mnTitle').textContent = CAUSE[kind] || 'Fin del cruce';
    wrap.querySelector('#mnFin').textContent = `${plural(sc, 'salto', 'saltos')} · ${plural(st.bananas, 'banana', 'bananas')}${newBest && sc > 0 ? ' · ¡nuevo récord!' : ` · récord ${Math.max(best0, sc)}`}`;
    wrap.querySelector('#mnCoins').textContent = st.coins ? `+${st.coins} ${st.coins === 1 ? 'moneda' : 'monedas'} para tu árbol` : '';
    const bank = st.bananas + Math.floor(sc / 15); if (bank > 0) jgSet(mnWalKey(), mnWallet() + bank);
    wrap.querySelector('#mnBank').textContent = bank > 0 ? `+${plural(bank, 'banana', 'bananas')} para la tienda · tienes ${mnWallet()}` : '';
    wrap.querySelector('#mnRank').textContent = '';
    const mins = (Date.now() - (MN.firstAt || Date.now())) / 60000;
    wrap.querySelector('#mnNote').textContent = mins >= MN_NUDGE_MIN ? `Llevas ${Math.round(mins)} minutos seguidos. Un descanso corto te ayuda a rendir mejor en tus tareas.` : '';
    over.hidden = false; void over.offsetWidth; over.classList.add('show'); jgAnnounce(`${CAUSE[kind] || 'Fin del cruce'}: ${sc} saltos`);
    if (sc > 0) jgPost({ game: 'mono', score: sc, apples: 0, dur: secs }).then((rec) => { const l = wrap.querySelector('#mnRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Lugar #${rec.rankDay} de hoy`; });
  };
  const again = () => { reset(); st.state = 'run'; hint.hidden = true; st.last = performance.now(); MN.firstAt = MN.firstAt || Date.now(); };
  wrap.querySelector('#mnAgain').addEventListener('click', again);
  wrap.querySelector('#mnDone').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; else render(); });

  /* ----- movimiento ----- */
  const bump = (d) => { st.p.bump = { d, t: 0 }; st.p.buf = null; JG_TONE(150, 0.05, 'sine', 0.03); };
  const crocUnder = (row, x) => { if (!row.lane) return -1; for (let i = 0; i < row.lane.items.length; i++) { const it = row.lane.items[i]; const ix = mnItemX(row.lane, it, st.t); if (x >= ix - 0.05 && x <= ix + it.len + 0.05) return i; } return -1; };
  const tryMove = (d) => {
    const p = st.p; if (st.state === 'dead' || st.state === 'over') return;
    if (st.state === 'idle') { st.state = 'run'; hint.hidden = true; MN.firstAt = MN.firstAt || Date.now(); }
    if (p.hop) { p.buf = d; return; }
    let tr = p.r, tx = p.x;
    if (d === 'F') tr++; else if (d === 'B') tr--; else tx += d === 'L' ? -1 : 1;
    if (d === 'B' && tr < Math.max(0, st.maxR - 4)) return bump(d);
    if ((d === 'L' || d === 'R') && (tx < 0.4 || tx > MN_COLS - 0.4)) return bump(d);
    const trow = ensure(tr);
    if (trow.type !== 'river') { const col = mnClamp(Math.round(tx - 0.5), 0, MN_COLS - 1); tx = col + 0.5; if (trow.type === 'grass' && trow.obs[col]) return bump(d); }
    p.hop = { fr: p.r, fx: p.x, tr, tx, t: 0, dur: 0.125, d }; p.ride = null; p.bump = null; if (d === 'L') p.face = -1; if (d === 'R') p.face = 1; p.look = d === 'L' ? -1 : d === 'R' ? 1 : 0;
    JG_TONE(380 + (st.maxR % 12) * 22, 0.06, 'square', 0.025, 560 + (st.maxR % 12) * 22);
  };
  const land = () => {
    const p = st.p, h = p.hop; p.r = h.tr; p.x = h.tx; p.hop = null; p.squash = 1;
    const row = ensure(p.r);
    if (p.r > st.maxR) {
      st.maxR = p.r; st.idle = 0; ensure(st.maxR + 26);
      const b = bOf(st.maxR); if (b !== st.curB) { st.curB = b; st.banner = { name: MN_BIOMES[b].name, t: 0 }; JG_TONE(660, 0.16, 'triangle', 0.06, 990); setTimeout(() => JG_TONE(990, 0.2, 'triangle', 0.05, 1320), 140); }
      for (const k of st.rows.keys()) if (k < st.maxR - 14) st.rows.delete(k);
    }
    if (row.type === 'river') {
      const i = crocUnder(row, p.x); if (i < 0) { die('agua'); return; }
      p.ride = { row, i, off: p.x - mnItemX(row.lane, row.lane.items[i], st.t) };
    } else {
      p.ride = null; const q = pos(p.r, p.x); spawn(q.x, q.y, MN_BIOMES[row.b].tuft, 5, 90, { up: true, grav: 260, r: 2.2 }); trailAt(q.x, q.y);
    }
    if (row.type === 'grass' && row.coin >= 0 && !row.coinTaken && Math.floor(p.x) === row.coin) {
      row.coinTaken = true; st.bananas++; const q = pos(p.r, p.x); spawn(q.x, q.y - V.U * 0.5, '#ffe066', 10, 220, { up: true, r: 3 }); float(q.x, q.y - V.U * 1.2, '+1', '#ffe066');
      if (st.coins < MN_COIN_CAP) { st.coins++; jgCoins(1); }
      JG_TONE(1318, 0.07, 'triangle', 0.05); setTimeout(() => JG_TONE(1975, 0.09, 'triangle', 0.045), 60); JG_VIB(10);
    }
    if (p.buf) { const d = p.buf; p.buf = null; tryMove(d); }
  };
  st.look = LOOK; st.move = tryMove; st.ensure = ensure; st.die = die; st.crocUnder = crocUnder;

  /* ----- control ----- */
  let sx = 0, sy = 0, down = false;
  const onDown = (e) => { if (e.target.closest('.gl-x, .gl-over')) return; e.preventDefault(); sx = e.clientX; sy = e.clientY; down = true; };
  const onUp = (e) => {
    if (!down) return; down = false; if (e.target.closest && e.target.closest('.gl-x, .gl-over')) return;
    const dx = e.clientX - sx, dy = e.clientY - sy, ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax < 22 && ay < 22) tryMove('F'); else if (ax > ay) tryMove(dx < 0 ? 'L' : 'R'); else tryMove(dy < 0 ? 'F' : 'B');
  };
  const onKey = (e) => {
    const k = e.key; const map = { ArrowUp: 'F', w: 'F', W: 'F', ' ': 'F', ArrowDown: 'B', s: 'B', S: 'B', ArrowLeft: 'L', a: 'L', A: 'L', ArrowRight: 'R', d: 'R', D: 'R' };
    if (k === 'Escape') { exit(); return; }
    if ((k === ' ' || k === 'Enter') && st.state === 'over' && !e.repeat) { e.preventDefault(); again(); return; }
    if (map[k]) { e.preventDefault(); if (!e.repeat || k.startsWith('Arrow') || 'wasdWASD'.includes(k)) tryMove(map[k]); }
  };
  const onPop = () => { if (MN.run) { try { history.pushState({ mnGame: true }, ''); } catch { /* */ } exit(); } };
  try { history.pushState({ mnGame: true }, ''); } catch { /* */ }
  wrap.addEventListener('touchstart', (e) => { if (!e.target.closest('button')) e.preventDefault(); }, { passive: false });
  wrap.addEventListener('pointerdown', onDown); wrap.addEventListener('pointerup', onUp); wrap.addEventListener('pointercancel', () => { down = false; });
  addEventListener('keydown', onKey); addEventListener('resize', size); addEventListener('popstate', onPop);

  /* ----- lógica por cuadro ----- */
  const tick = (dt) => {
    st.t += dt; const p = st.p;
    st.shake = Math.max(0, st.shake - dt); st.flash = Math.max(0, st.flash - dt * 2.2);
    for (const q of st.parts) { q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += q.grav * dt; } st.parts = st.parts.filter((q) => q.t < q.life);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 0.9);
    if (st.banner) { st.banner.t += dt; if (st.banner.t > 2.6) st.banner = null; }
    p.squash = Math.max(0, p.squash - dt * 7); if (p.bump) { p.bump.t += dt; if (p.bump.t > 0.16) p.bump = null; }
    for (const a of st.amb) { a.ph += dt; }
    if (st.state === 'run') st.playT += dt;
    /* cámara */
    const rf = p.hop ? p.hop.fr + (p.hop.tr - p.hop.fr) * mnClamp(p.hop.t / p.hop.dur, 0, 1) : p.r;
    st.cam += (rf - st.cam) * (1 - Math.exp(-dt * 7));
    if (st.state === 'dead') { st.dead.t += dt; if (st.eagle) st.eagle.t += dt; return; }
    if (st.state === 'over') return;
    /* salto */
    if (p.hop) {
      const h = p.hop; h.t += dt; if (LOOK.trail && Math.random() < 0.5) { const qq = pos(p.r, p.x); trailAt(qq.x, qq.y); } const ph = h.t / h.dur; p.x = h.fx + (h.tx - h.fx) * mnClamp(ph, 0, 1);
      if (ph >= 1) land();
    } else if (p.ride) {
      const it = p.ride.row.lane.items[p.ride.i]; p.x = mnItemX(p.ride.row.lane, it, st.t) + p.ride.off;
      if (p.x < -0.2 || p.x > MN_COLS + 0.2) { die('arrastrado'); return; }
    }
    if (st.state === 'dead') return;
    /* atropello */
    const inR = p.hop ? (p.hop.t / p.hop.dur >= 0.5 ? p.hop.tr : p.hop.fr) : p.r; const row = st.rows.get(inR);
    if (row && row.type === 'road') for (const it of row.lane.items) { const cx = mnItemX(row.lane, it, st.t) + it.len / 2; if (Math.abs(p.x - cx) < it.len / 2 + 0.22) { die('ele'); return; } }
    /* águila */
    if (st.state === 'run') {
      st.idle += dt;
      if (st.idle > MN_IDLE_KILL) { st.eagle = { t: 0 }; die('aguila'); }
    }
  };

  /* ----- dibujo ----- */
  const ambDraw = (b, W, H) => {
    const kind = MN_BIOMES[b].amb;
    for (const a of st.amb) {
      const ph = a.ph; let x, y;
      if (kind === 'hojas') { x = ((a.x + ph * 0.02) % 1) * W; y = ((a.y + ph * 0.05 * a.s) % 1) * H; g.fillStyle = 'rgba(70,150,60,.7)'; g.save(); g.translate(x, y); g.rotate(ph * a.s); g.beginPath(); g.ellipse(0, 0, 5 * a.s, 2.4 * a.s, 0, 0, 7); g.fill(); g.restore(); }
      else if (kind === 'polvo') { x = ((a.x + ph * 0.03 * a.s) % 1) * W; y = (a.y + Math.sin(ph) * 0.02) * H; g.fillStyle = 'rgba(230,200,120,.45)'; g.beginPath(); g.arc(x, y, 2 * a.s, 0, 7); g.fill(); }
      else if (kind === 'nieve') { x = (((a.x + Math.sin(ph * 0.8) * 0.02) % 1 + 1) % 1) * W; y = ((a.y + ph * 0.07 * a.s) % 1) * H; g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(x, y, 2.2 * a.s, 0, 7); g.fill(); }
      else if (kind === 'arena') { x = ((a.x + ph * 0.1 * a.s) % 1) * W; y = (a.y) * H; g.strokeStyle = 'rgba(235,205,140,.5)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 18 * a.s, y + 2); g.stroke(); }
      else if (kind === 'luciernagas') { x = (a.x + Math.sin(ph * 0.6 + a.s * 3) * 0.03) * W; y = (a.y + Math.cos(ph * 0.5 + a.s) * 0.03) * H; const gl = 0.4 + 0.6 * Math.abs(Math.sin(ph * 1.4)); g.fillStyle = `rgba(240,240,120,${gl * 0.85})`; g.beginPath(); g.arc(x, y, 2.6 * a.s, 0, 7); g.fill(); g.fillStyle = `rgba(240,240,120,${gl * 0.2})`; g.beginPath(); g.arc(x, y, 8 * a.s, 0, 7); g.fill(); }
      else { x = (a.x + Math.sin(ph * 0.9 + a.s) * 0.02) * W; y = (1 - ((a.y + ph * 0.09 * a.s) % 1)) * H; g.fillStyle = `rgba(255,${120 + 80 * a.s | 0},40,.85)`; g.beginPath(); g.arc(x, y, 2 * a.s, 0, 7); g.fill(); }
    }
  };
  const drawRow = (r, W) => {
    const row = st.rows.get(r); if (!row) return; const U = V.U, RH = V.RH; const B = MN_BIOMES[row.b];
    const yc = V.baseY - (r - st.cam) * RH, top = yc - RH / 2; const foot = yc + RH * 0.28;
    if (row.type === 'grass') {
      g.fillStyle = B.grass[row.tone]; g.fillRect(0, top, W, RH + 1);
      g.strokeStyle = mnShade(B.tuft, 1.0); g.lineWidth = 1.6; for (let i = 0; i < 9; i++) { const tx = mnHash(r, i) * W, ty = top + 4 + mnHash(r, i + 40) * (RH - 8); g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx - 2, ty - 5); g.moveTo(tx, ty); g.lineTo(tx + 2, ty - 5); g.stroke(); }
      const sideN = Math.ceil(V.offX / U) + 1;
      for (let k = 1; k <= sideN; k++) for (const sgn of [-1, 1]) { const col = sgn < 0 ? -k : MN_COLS - 1 + k; if (mnHash(r, col + 99) < 0.6) { const x = V.offX + (col + 0.5) * U; if (x > -U && x < W + U) { if (mnHash(r, col + 7) > 0.75) mnDrawRock(g, x, foot, U, B); else mnDrawTree(g, x, foot, U, B.tree, mnHash(r, col), st.t); } } }
      for (let i = 0; i < MN_COLS; i++) if (row.obs[i]) { const x = V.offX + (i + 0.5) * U; if (mnHash(r, i + 5) > 0.78 && B.tree !== 'roca') mnDrawRock(g, x, foot, U, B); else mnDrawTree(g, x, foot, U, B.tree, mnHash(r, i), st.t); }
      if (row.coin >= 0 && !row.coinTaken) mnDrawBanana(g, V.offX + (row.coin + 0.5) * U, foot, U, st.t + r);
    } else if (row.type === 'road') {
      g.fillStyle = B.road; g.fillRect(0, top, W, RH + 1); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, top, W, 2); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, top + RH - 2, W, 2);
      const below = st.rows.get(r - 1); if (below && below.type === 'road') { g.fillStyle = B.line; const dw = U * 0.5; for (let x = -((st.t * 0) % 1); x < W; x += dw * 2) g.fillRect(x, top + RH - 2, dw, 3); }
      for (const it of row.lane.items) { const ix = mnItemX(row.lane, it, st.t); const x = V.offX + (ix + it.len / 2) * U; if (x < -2 * U || x > W + 2 * U) continue; mnDrawChimp(g, x, foot, U, { dir: row.lane.dir, len: it.len, fur: it.fur, phase: st.t * (6 + row.lane.v * 2.2) + it.ph, band: it.band }); }
    } else {
      const gr = g.createLinearGradient(0, top, 0, top + RH); gr.addColorStop(0, B.water); gr.addColorStop(1, B.water2); g.fillStyle = gr; g.fillRect(0, top, W, RH + 1);
      g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.6; for (let i = 0; i < 8; i++) { const wx = (((mnHash(r, i) * (W + 120) + st.t * 14 * (i % 2 ? 1 : -1)) % (W + 120)) + W + 120) % (W + 120) - 60, wy = top + 6 + mnHash(r, i + 30) * (RH - 12); g.beginPath(); g.moveTo(wx - 10, wy); g.quadraticCurveTo(wx, wy - 4, wx + 10, wy); g.stroke(); }
      if (B.id === 'nieve') { g.fillStyle = 'rgba(235,245,255,.75)'; for (let i = 0; i < 4; i++) { const ix = (mnHash(r, i + 60) * W + st.t * 6) % (W + 40) - 20, iy = top + 8 + mnHash(r, i + 70) * (RH - 18); g.beginPath(); g.moveTo(ix, iy); g.lineTo(ix + 14, iy - 3); g.lineTo(ix + 22, iy + 3); g.lineTo(ix + 6, iy + 6); g.closePath(); g.fill(); } }
      if (B.id === 'volcan') { for (let i = 0; i < 5; i++) { const bx = mnHash(r, i + 80) * W, ph = (st.t * 0.7 + mnHash(r, i)) % 1; g.fillStyle = `rgba(255,220,90,${0.7 * (1 - ph)})`; g.beginPath(); g.arc(bx, top + RH - ph * RH * 0.9, 2 + ph * 3, 0, 7); g.fill(); } }
      for (const it of row.lane.items) { const ix = mnItemX(row.lane, it, st.t); const x = V.offX + ix * U; if (x < -4 * U || x > W + 4 * U) continue; mnDrawCroc(g, x, yc + RH * 0.3, U, { dir: row.lane.dir, len: it.len, t: st.t, ph: it.ph, body: B.crocBody, belly: B.crocBelly, ridge: B.crocRidge, glow: B.id === 'volcan' ? '#ff6a1f' : null, waterTop: B.water }); }
    }
  };
  const drawPlayer = () => {
    const p = st.p, U = V.U; let rf = p.r, xf = p.x, h = 0, sq = p.squash * 0.9, tilt = 0;
    if (p.hop) { const ph = mnClamp(p.hop.t / p.hop.dur, 0, 1); rf = p.hop.fr + (p.hop.tr - p.hop.fr) * ph; h = Math.sin(Math.PI * ph) * 0.62 * U; sq = -Math.sin(Math.PI * ph) * 0.45; tilt = p.hop.d === 'L' ? -1 : p.hop.d === 'R' ? 1 : 0; }
    if (p.bump) { xf += (p.bump.d === 'L' ? -1 : p.bump.d === 'R' ? 1 : 0) * Math.sin(p.bump.t / 0.16 * Math.PI) * 0.18; rf += (p.bump.d === 'F' ? 1 : p.bump.d === 'B' ? -1 : 0) * Math.sin(p.bump.t / 0.16 * Math.PI) * 0.12; }
    const q = pos(rf, xf); const d = st.dead; let o = { ...LOOK, sq, h, tilt, t: st.t, look: p.look, scared: st.idle > MN_IDLE_WARN, arms: p.hop ? -0.6 : 0 };
    if (d) {
      if (d.kind === 'ele') { o = { ...o, flat: true, dead: true, sq: 0, h: 0 }; }
      else if (d.kind === 'aguila') { const e = mnClamp(d.t / 0.8, 0, 1); q.y -= e * e * V.h * 0.9; o = { ...o, dead: false, scared: true, h: 0 }; }
      else { const e = mnClamp(d.t / 0.5, 0, 1); g.save(); g.beginPath(); g.rect(0, 0, V.w, q.y + V.U * 0.05); g.clip(); q.y += e * V.U * 0.8; g.globalAlpha = 1 - e * 0.5; o = { ...o, dead: true, h: 0 }; mnDrawMonkey(g, q.x, q.y, U, o); g.restore(); return; }
    }
    mnDrawMonkey(g, q.x, q.y, U, o);
    if (d && d.kind === 'ele') { g.fillStyle = '#ffd93a'; for (let i = 0; i < 3; i++) { const a = d.t * 7 + i * 2.1; g.beginPath(); g.arc(q.x + Math.cos(a) * U * 0.3, q.y - U * 0.95 + Math.sin(a) * U * 0.08, U * 0.045, 0, 7); g.fill(); } }
    if (d && d.kind === 'aguila') mnDrawEagle(g, q.x, q.y - U * 0.9, U * 1.1, st.t);
  };
  const draw = () => {
    const W = V.w, H = V.h; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    const sh = st.shake > 0 ? st.shake * 9 : 0; if (sh) g.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh);
    g.fillStyle = MN_BIOMES[bOf(Math.max(0, st.cam - 6))].grass[0]; g.fillRect(-20, -20, W + 40, H + 40);
    const rTop = Math.ceil(st.cam + (V.baseY / V.RH) + 3), rBot = Math.floor(st.cam - ((H - V.baseY) / V.RH) - 3);
    const pr = st.p.hop ? (st.p.hop.t / st.p.hop.dur >= 0.5 ? st.p.hop.tr : st.p.hop.fr) : st.p.r; let drawnP = false;
    for (let r = Math.min(rTop, st.genR); r >= rBot; r--) { drawRow(r, W); if (!drawnP && r === pr) { drawPlayer(); drawnP = true; } }
    if (!drawnP) drawPlayer();
    /* sombra del águila: aviso */
    if (st.state === 'run' && st.idle > MN_IDLE_WARN) {
      const k = mnClamp((st.idle - MN_IDLE_WARN) / (MN_IDLE_KILL - MN_IDLE_WARN), 0, 1), q = pos(st.p.r, st.p.x);
      g.fillStyle = `rgba(0,0,0,${0.15 + 0.25 * k})`; g.beginPath(); g.ellipse(q.x, q.y, V.U * (1.6 - 1.0 * k), V.U * (0.5 - 0.3 * k), 0, 0, 7); g.fill();
      const e = mnDrawEagle; e(g, q.x + (1 - k) * V.w * 0.5, q.y - V.h * 0.5 * (1 - k * k) - V.U, V.U * 0.9, st.t);
      g.fillStyle = `rgba(220,40,40,${0.12 + 0.12 * Math.abs(Math.sin(st.t * 8))})`; g.fillRect(0, 0, W, H);
    }
    ambDraw(bOf(Math.max(0, st.cam)), W, H);
    for (const q of st.parts) { g.globalAlpha = Math.max(0, 1 - q.t / q.life); g.fillStyle = q.color; g.beginPath(); g.arc(q.x, q.y, q.r, 0, 7); g.fill(); } g.globalAlpha = 1;
    g.font = `800 ${Math.round(V.U * 0.42)}px system-ui,sans-serif`; g.textAlign = 'center'; for (const f of st.floats) { g.globalAlpha = 1 - f.t / 0.9; g.fillStyle = f.color; g.fillText(f.text, f.x, f.y - f.t * 40); } g.globalAlpha = 1;
    /* HUD */
    const top = V.safe + 16; g.textAlign = 'center'; g.lineJoin = 'round';
    g.font = `900 ${Math.round(V.U * 1.15)}px system-ui,sans-serif`; g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.35)'; g.strokeText(String(st.maxR), W / 2, top + V.U * 1.0); g.fillStyle = '#fff'; g.fillText(String(st.maxR), W / 2, top + V.U * 1.0);
    g.font = `700 ${Math.round(V.U * 0.3)}px system-ui,sans-serif`; g.fillStyle = 'rgba(255,255,255,.9)'; g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 4; const bt = `Récord ${Math.max(mnBest(), st.maxR)}`; g.strokeText(bt, W / 2, top + V.U * 1.45); g.fillText(bt, W / 2, top + V.U * 1.45);
    mnDrawBanana(g, W - 62, top + V.U * 0.85, V.U * 0.8, st.t); g.textAlign = 'left'; g.font = `800 ${Math.round(V.U * 0.5)}px system-ui,sans-serif`; g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 5; g.strokeText(String(st.bananas), W - 46, top + V.U * 0.8); g.fillStyle = '#fff'; g.fillText(String(st.bananas), W - 46, top + V.U * 0.8);
    if (st.banner) { const k = st.banner.t, a = k < 0.3 ? k / 0.3 : k > 2.1 ? Math.max(0, (2.6 - k) / 0.5) : 1; g.globalAlpha = a; g.textAlign = 'center'; g.font = `900 ${Math.round(V.U * 1.0)}px system-ui,sans-serif`; g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,.4)'; const ty = H * 0.3 + (1 - a) * 12; g.strokeText(st.banner.name.toUpperCase(), W / 2, ty); g.fillStyle = '#fff'; g.fillText(st.banner.name.toUpperCase(), W / 2, ty); g.globalAlpha = 1; }
    if (st.flash > 0) { g.fillStyle = `rgba(255,255,255,${st.flash * 0.4})`; g.fillRect(0, 0, W, H); }
  };
  const loop = (now) => { const dt = Math.min(0.05, Math.max(0, (now - st.last) / 1000)); st.last = now; tick(dt); draw(); st.id = requestAnimationFrame(loop); };
  st.id = requestAnimationFrame(loop);

  const exit = () => {
    cancelAnimationFrame(st.id); removeEventListener('keydown', onKey); removeEventListener('resize', size); removeEventListener('popstate', onPop);
    wrap.remove(); document.body.classList.remove('gm-on'); MN.run = null;
    if (location.hash === '#/mono') render();
  };
  wrap.querySelector('#mnX').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; });
}

Object.assign(VIDA_ACTS, { 'mn-start': () => mnStart() });
EXTRA_VIEWS.mono = viewMono; EXTRA_NAV.mono = 'juegos';
{
  const baseJuegos = viewJuegos;
  viewJuegos = function () { return baseJuegos().replace('</ul>', `<li><a href="#/mono"><span class="ico">${icon('play')}</span><span class="txt"><b>Monito Saltarín</b><span>Cruza caminos de elefantes y ríos de cocodrilos por selvas, nieve y volcanes.</span></span>${icon('chev', 'chev')}</a></li></ul>`); };
  EXTRA_VIEWS.juegos = viewJuegos;
}
