/* Cinnavia 7.39 — Pelotón de Tareas, versión nueva.
   Carretera en perspectiva con ciclo de día y noche, corredor animado, tareas-alarma que esquivar,
   libros con combo, monedas para tu árbol y un escudo. Ranking propio (Hoy, Semana, Récord, Carreras).
   Sin castigo por salir: el récord y las monedas se guardan al momento. */
'use strict';

const PM = { run: null, firstAt: 0, lastEnd: 0 };
const pmBestKey = () => `aldia:peloton:best:${REG.me || '_'}`;
const pmBest = () => jgNum(pmBestKey());
const PM_NUDGE_MIN = 20; // después de este rato seguido, sugiere un descanso (solo avisa)
const PM_COIN_CAP = 15; // monedas máximas que se pueden recoger en una carrera

/* ---------- pantalla de inicio del juego ---------- */
function pmHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="pmhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B4B9A"/><stop offset=".62" stop-color="#FF9E6B"/><stop offset="1" stop-color="#FFD7A8"/></linearGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#pmhS)"/><circle cx="262" cy="84" r="26" fill="#FFE3B0" opacity=".9"/>
    <path d="M0 98h30V70h22v28h20V54h26v44h22V78h18v20h30V62h24v36h26V74h20v24h28V58h20v40h44v12H0z" fill="#3A2F6B" opacity=".85"/>
    <path d="M0 108h360v62H0z" fill="#4F8A5E"/><path d="M150 108h60l92 62H58z" fill="#4B4C58"/>
    <path d="M178 108h4l4 62h-12z" fill="none"/><g fill="#fff" opacity=".85"><path d="M178.6 112h2.8l1.4 9h-5.6zM177.6 128h4.8l2.4 14h-9.6zM176 150h8l3 20h-14z"/></g>
    <g transform="translate(120 142)"><circle cx="0" cy="-26" r="20" fill="#D9473A"/><circle cx="0" cy="-26" r="14" fill="#fff"/><path d="M0 -26V-34M0 -26L6 -22" stroke="#B9462F" stroke-width="2.4" stroke-linecap="round"/><circle cx="-13" cy="-44" r="6" fill="#B9462F"/><circle cx="13" cy="-44" r="6" fill="#B9462F"/><path d="M-12 -7v7M12 -7v7" stroke="#B9462F" stroke-width="3" stroke-linecap="round"/></g>
    <g transform="translate(226 150)"><rect x="-9" y="-30" width="18" height="12" rx="5" fill="#2B3A55"/><rect x="-12" y="-62" width="24" height="34" rx="9" fill="#2A7F53"/><rect x="-11" y="-58" width="22" height="22" rx="6" fill="#E9B44C"/><circle cx="0" cy="-72" r="10" fill="#2A2320"/><rect x="-14" y="-6" width="11" height="6" rx="3" fill="#fff"/><rect x="3" y="-14" width="11" height="6" rx="3" fill="#fff"/></g>
    <g transform="translate(290 142) rotate(-14)"><rect x="-13" y="-34" width="26" height="34" rx="3" fill="#2E7D8F"/><rect x="-13" y="-34" width="5" height="34" fill="#1F5E6D"/><rect x="-5" y="-30" width="15" height="26" fill="#F5EBD3" opacity=".9"/></g></svg>`;
}
function viewPeloton() {
  const best = pmBest();
  return `<section class="gm-home"><div class="gm-hero">${pmHero()}</div><h1 class="page-title gm-title">Pelotón de Tareas</h1>
    <p class="page-sub">Corre por la ciudad. <b>Toca la mitad izquierda o derecha</b> de la pantalla (o usa las flechas) para cambiar de carril. Esquiva las <b>alarmas de tareas</b>, junta <b>libros</b> seguidos para subir el combo y recoge <b>monedas</b> para tu árbol. El <b>escudo</b> te salva de un golpe.</p>
    <button class="btn primary block gm-play" data-act="pm-start">${icon('play')}Correr</button>
    <p class="small muted" style="text-align:center;margin-top:12px">${best ? `Tu mejor recorrido en este dispositivo: <b>${best}</b> puntos` : 'Todavía no tienes récord. ¡Haz tu primer recorrido!'}</p>
    <p class="small muted" style="text-align:center;margin-top:6px">Puedes salir cuando quieras. Tu récord y tus monedas se guardan igual.</p>
    <div id="jgRank-peloton">${jgRankHTML('peloton')}</div></section>`;
}

/* ---------- color ---------- */
const pmHex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const pmMix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const pmRgb = (a, al = 1) => `rgba(${a[0] | 0},${a[1] | 0},${a[2] | 0},${al})`;
const pmRR = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
/* día → atardecer → noche → amanecer → día */
const PM_PAL = [
  { top: '#6DB7EE', bot: '#DDF1FF', ground: '#7FB07A', road: '#5B6168', far: '#A9CBE0', near: '#86B496', build: '#9DB5C9', sunH: 0.78, sun: '#FFF3BF', night: 0 },
  { top: '#5B4B9A', bot: '#FFB070', ground: '#6D8B63', road: '#55515C', far: '#9A7FB0', near: '#6F7E86', build: '#6A5C86', sunH: 0.14, sun: '#FF8F4F', night: 0.25 },
  { top: '#0B1433', bot: '#26397A', ground: '#2F4A4A', road: '#34373F', far: '#25316B', near: '#1E3A46', build: '#18214A', sunH: 0.72, sun: '#E8EEFF', night: 1 },
  { top: '#8DB4E6', bot: '#FFD8C0', ground: '#78A878', road: '#5A5F67', far: '#B7B6D8', near: '#86A99B', build: '#9A9EC2', sunH: 0.25, sun: '#FFD6A0', night: 0.1 },
].map((p) => ({ top: pmHex(p.top), bot: pmHex(p.bot), ground: pmHex(p.ground), road: pmHex(p.road), far: pmHex(p.far), near: pmHex(p.near), build: pmHex(p.build), sun: pmHex(p.sun), sunH: p.sunH, night: p.night }));
function pmPal(sc) {
  const STOP = 700; const p = sc / STOP; const i = Math.floor(p) % 4, j = (i + 1) % 4; let t = p - Math.floor(p); t = t * t * (3 - 2 * t);
  const A = PM_PAL[i], B = PM_PAL[j]; const o = {};
  for (const k of ['top', 'bot', 'ground', 'road', 'far', 'near', 'build', 'sun']) o[k] = pmMix(A[k], B[k], t);
  o.sunH = A.sunH + (B.sunH - A.sunH) * t; o.night = A.night + (B.night - A.night) * t; return o;
}
const pmHash = (n) => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/* ---------- el juego ---------- */
function pmStart() {
  if (PM.run) return;
  if (!PM.firstAt || Date.now() - PM.lastEnd > 10 * 60000) PM.firstAt = Date.now();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage pm-stage';
  wrap.innerHTML = `<canvas id="pmC" aria-label="Pelotón de Tareas"></canvas>
    <button class="gm-x gl-x" id="pmX" aria-label="Salir del juego">${icon('x')}</button>
    <div class="pm-hint" id="pmHint"><span>◀</span> Toca para cambiar de carril <span>▶</span></div>
    <div class="gl-over" id="pmOver" hidden><b>Fin del recorrido</b><span id="pmFin"></span><span id="pmCoins" class="pm-gain"></span><span class="small muted" id="pmRank"></span><span class="small muted" id="pmNote"></span>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="pmAgain">${icon('play')}Otra vez</button><button class="btn" id="pmDone">Volver a Juegos</button></div></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const c = wrap.querySelector('canvas'), g = c.getContext('2d');
  const over = wrap.querySelector('#pmOver'), hint = wrap.querySelector('#pmHint');
  const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;visibility:hidden;padding-top:env(safe-area-inset-top,0px)'; wrap.appendChild(probe);
  const V = { w: 360, h: 640, dpr: 1, laneW: 100, hz: 190, py: 510, S: 1, safe: 0 };
  const ZK = 10, ZF = 75;
  const size = () => {
    V.dpr = Math.min(2, devicePixelRatio || 1); const W = innerWidth, H = innerHeight;
    c.width = Math.round(W * V.dpr); c.height = Math.round(H * V.dpr); c.style.width = W + 'px'; c.style.height = H + 'px';
    V.w = W; V.h = H; V.laneW = Math.min(112, W * 0.3); V.S = V.laneW / 108; V.hz = H * 0.3; V.py = H * 0.8; V.safe = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  };
  size();
  const proj = (z) => { const s = 1 / (1 + z / ZK); return { s, y: V.hz + (V.py - V.hz) * s }; };
  const laneX = (i) => (i - 1) * V.laneW;

  const st = { lane: 1, x: 0, objs: [], rowAcc: 0, gap: 16, dist: 0, sc: 0, speed: 16, books: 0, coins: 0, bonus: 0, score: 0, combo: 0, state: 'idle', last: performance.now(), id: 0, runT: 0, free: null, shield: false, inv: 0, shake: 0, flash: 0, parts: [], floats: [], dustT: 0, t: 0, comboPulse: 0, nearMiss: 0, clouds: [], stars: [], sky: [], hit: false };
  const mult = () => Math.min(5, 1 + Math.floor(st.combo / 5));
  const initScene = () => {
    st.clouds = Array.from({ length: 6 }, (_, i) => ({ x: Math.random() * 1.4, y: 0.06 + Math.random() * 0.2, s: 0.7 + Math.random() * 0.9, v: 0.004 + Math.random() * 0.006 }));
    st.stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * 0.95, r: 0.5 + Math.random() * 1.2, p: Math.random() * 6 }));
    st.sky = Array.from({ length: 22 }, (_, i) => ({ x: i / 22 + Math.random() * 0.02, w: 0.03 + Math.random() * 0.04, h: 0.2 + Math.random() * 0.7, win: Math.random() }));
  };
  initScene();
  const reset = () => {
    Object.assign(st, { lane: 1, x: 0, objs: [], rowAcc: 0, gap: 16, dist: 0, sc: 0, t: 0, speed: 16, books: 0, coins: 0, bonus: 0, score: 0, combo: 0, state: 'idle', runT: 0, free: null, shield: false, inv: 0, shake: 0, flash: 0, parts: [], floats: [], hit: false });
    over.hidden = true; over.classList.remove('show'); hint.hidden = false;
  };
  reset(); PM.run = st;

  /* ----- generación ----- */
  const spawnRow = () => {
    const lanes = [0, 1, 2]; let blocks = [], free = lanes, ok = false;
    for (let n = 0; n < 12 && !ok; n++) {
      const two = st.dist > 150 && Math.random() < Math.min(0.5, 0.14 + st.dist / 9000);
      blocks = lanes.slice().sort(() => Math.random() - 0.5).slice(0, st.dist < 60 ? 0 : two ? 2 : 1);
      free = lanes.filter((l) => !blocks.includes(l));
      ok = !st.free || free.some((f) => st.free.some((p) => Math.abs(f - p) <= 1));
    }
    if (!ok) { blocks = []; free = lanes; }
    st.free = free;
    for (const l of blocks) st.objs.push({ kind: 'task', var: Math.random() < 0.5 ? 0 : 1, lane: l, z: ZF, zp: ZF, ph: Math.random() * 6 });
    if (!free.length) return;
    const r = Math.random(), fl = free[Math.floor(Math.random() * free.length)];
    if (st.dist > 300 && !st.shield && r < 0.035) st.objs.push({ kind: 'shield', lane: fl, z: ZF, zp: ZF, ph: Math.random() * 6 });
    else if (r < 0.62) st.objs.push({ kind: 'book', lane: fl, z: ZF, zp: ZF, ph: Math.random() * 6 });
    else if (r < 0.72 && st.coins + st.objs.filter((o) => o.kind === 'coin').length < PM_COIN_CAP) for (let i = 0; i < 3; i++) st.objs.push({ kind: 'coin', lane: fl, z: ZF + i * 3, zp: ZF + i * 3, ph: Math.random() * 6 });
  };

  /* ----- efectos ----- */
  const burst = (x, y, col, n, spd = 220, grav = 380) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = spd * (0.35 + Math.random() * 0.65); st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 90, life: 0.45 + Math.random() * 0.45, t: 0, col, r: 2 + Math.random() * 3, grav }); } };
  const float = (x, y, txt, col = '#fff') => st.floats.push({ x, y, txt, col, t: 0 });
  const playerScreen = () => ({ x: V.w / 2 + (st.x - (st.x) * 0.45), y: V.py });
  const objScreen = (o) => { const { s, y } = proj(o.z); return { s, y, x: V.w / 2 + (laneX(o.lane) - st.x * 0.45) * s }; };

  const lane = (d) => { if (st.state !== 'run') return; const n = Math.max(0, Math.min(2, st.lane + d)); if (n !== st.lane) { st.lane = n; JG_TONE(520 + n * 30, 0.04, 'sine', 0.025); } };
  const startRun = () => { st.state = 'run'; hint.hidden = true; st.last = performance.now(); };
  const onDown = (e) => {
    if (e.target.closest('.gl-x, .gl-over')) return; e.preventDefault();
    if (st.state === 'idle') startRun();
    if (st.state !== 'run') return;
    lane(e.clientX < innerWidth / 2 ? -1 : 1);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); if (st.state === 'idle') startRun(); lane(-1); }
    else if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); if (st.state === 'idle') startRun(); lane(1); }
    else if (e.key === 'Escape') exit();
    else if ((e.key === ' ' || e.key === 'Enter') && st.state === 'over' && !e.repeat) again();
    else if ((e.key === ' ' || e.key === 'Enter') && st.state === 'idle' && !e.repeat) startRun();
  };
  const onPop = () => { if (PM.run) { try { history.pushState({ pmGame: true }, ''); } catch { /* */ } exit(); } };
  try { history.pushState({ pmGame: true }, ''); } catch { /* */ }
  wrap.addEventListener('touchstart', (e) => { if (!e.target.closest('button')) e.preventDefault(); }, { passive: false });
  wrap.addEventListener('pointerdown', onDown);
  addEventListener('keydown', onKey); addEventListener('resize', size); addEventListener('popstate', onPop);

  /* ----- fin de la carrera ----- */
  const end = () => {
    if (st.state === 'over') return;
    st.score = Math.floor(st.dist / 3) + st.bonus;
    st.state = 'over'; st.hit = true; st.shake = 0.5; st.flash = 1; PM.lastEnd = Date.now();
    JG_TONE(180, 0.35, 'sawtooth', 0.08, 60); JG_VIB([200, 70, 200]);
    const p = playerScreen(); burst(p.x, p.y - 50, '#E9B44C', 22, 300); burst(p.x, p.y - 50, '#D9473A', 16, 260);
    const sc = st.score, best0 = pmBest(); const newBest = sc > best0;
    if (newBest) jgSet(pmBestKey(), sc);
    const secs = Math.max(1, Math.round(st.t));
    wrap.querySelector('#pmFin').textContent = `${sc} puntos · ${plural(st.books, 'libro', 'libros')}${newBest && sc > 0 ? ' · ¡nuevo récord!' : ` · récord ${Math.max(best0, sc)}`}`;
    wrap.querySelector('#pmCoins').textContent = st.coins ? `+${st.coins} ${st.coins === 1 ? 'moneda' : 'monedas'} para tu árbol` : '';
    wrap.querySelector('#pmRank').textContent = '';
    const mins = (Date.now() - (PM.firstAt || Date.now())) / 60000;
    wrap.querySelector('#pmNote').textContent = mins >= PM_NUDGE_MIN ? `Llevas ${Math.round(mins)} minutos seguidos. Un descanso corto te ayuda a rendir mejor en tus tareas.` : '';
    setTimeout(() => { if (!wrap.isConnected || st.state !== 'over') return; over.hidden = false; void over.offsetWidth; over.classList.add('show'); }, 450);
    jgAnnounce(`Fin del recorrido: ${sc} puntos`);
    if (sc > 0) jgPost({ game: 'peloton', score: sc, apples: 0, dur: secs }).then((rec) => { const l = wrap.querySelector('#pmRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Lugar #${rec.rankDay} de hoy`; });
  };
  const again = () => { const keep = st.clouds; reset(); st.clouds = keep; st.state = 'run'; hint.hidden = true; st.last = performance.now(); PM.firstAt = PM.firstAt || Date.now(); };
  wrap.querySelector('#pmAgain').addEventListener('click', again);
  wrap.querySelector('#pmDone').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; else render(); });

  /* ----- lógica ----- */
  const takeBook = (o) => {
    o.taken = true; st.combo++; st.books++; const m = mult(); const pts = 10 * m; st.bonus += pts; st.comboPulse = 1;
    const s = objScreen(o); burst(s.x, s.y - 40 * s.s * V.S, '#FFE08A', 10, 200); float(s.x, s.y - 70 * s.s * V.S, `+${pts}`, '#FFE08A');
    JG_TONE(880 + Math.min(st.combo, 12) * 55, 0.07, 'triangle', 0.05); JG_VIB(8);
  };
  const takeCoin = (o) => {
    o.taken = true; st.coins++; jgCoins(1);
    const s = objScreen(o); burst(s.x, s.y - 30 * s.s * V.S, '#F6D470', 9, 190); float(s.x, s.y - 60 * s.s * V.S, '+1 moneda', '#FFE9A0');
    JG_TONE(1318, 0.07, 'triangle', 0.05); setTimeout(() => JG_TONE(1975, 0.09, 'triangle', 0.045), 60); JG_VIB(12);
  };
  const takeShield = (o) => { o.taken = true; st.shield = true; const s = objScreen(o); burst(s.x, s.y - 40, '#9FD8FF', 14, 220); float(s.x, s.y - 80, '¡Escudo!', '#BFE6FF'); JG_TONE(660, 0.12, 'sine', 0.06, 990); JG_VIB(18); };
  const hitTask = (o) => {
    if (st.inv > 0) return;
    if (st.shield) {
      st.shield = false; st.inv = 1.3; o.taken = true; st.shake = 0.28; st.flash = 0.5;
      const s = objScreen(o); burst(s.x, s.y - 40 * s.s * V.S, '#9FD8FF', 20, 280); burst(s.x, s.y - 40 * s.s * V.S, '#D9473A', 12, 220);
      float(s.x, s.y - 90, '¡Escudo roto!', '#BFE6FF'); JG_TONE(300, 0.2, 'triangle', 0.07, 120); JG_VIB([40, 30, 60]); return;
    }
    end();
  };
  const tick = (dt) => {
    st.t += st.state === 'run' ? dt : 0;
    for (const cl of st.clouds) { cl.x += cl.v * dt; if (cl.x > 1.3) cl.x = -0.3; }
    st.x += (laneX(st.lane) - st.x) * Math.min(1, dt * 14);
    st.shake = Math.max(0, st.shake - dt); st.flash = Math.max(0, st.flash - dt * 2.2); st.inv = Math.max(0, st.inv - dt); st.comboPulse = Math.max(0, st.comboPulse - dt * 3);
    for (const p of st.parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.grav * dt; }
    st.parts = st.parts.filter((p) => p.t < p.life);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 1);
    if (st.state === 'idle') { st.sc += 4 * dt; st.runT += dt * 3; return; }
    if (st.state === 'over') { for (const o of st.objs) o.ph += dt; return; }
    /* corriendo */
    st.speed = 16 + 24 * (1 - Math.exp(-st.dist / 1500));
    const dz = st.speed * dt; st.dist += dz; st.sc += dz; st.runT += dt * (7 + st.speed * 0.2);
    st.rowAcc += dz;
    if (st.rowAcc >= st.gap) { st.rowAcc -= st.gap; st.gap = Math.max(12.5, 22 - (st.speed - 16) * 0.32) + Math.random() * 5; spawnRow(); }
    for (const o of st.objs) { o.zp = o.z; o.z -= dz; o.ph += dt; }
    for (const o of st.objs) {
      if (o.taken) continue;
      if (o.kind === 'book' && o.z < -0.9 && !o.missed) { o.missed = true; if (st.combo) st.combo = 0; }
      if (!(o.zp > -0.7 && o.z < 0.7)) continue;
      const dx = Math.abs(laneX(o.lane) - st.x);
      if (o.kind === 'task') { if (dx < V.laneW * 0.4) { hitTask(o); if (st.state === 'over') return; } }
      else if (dx < V.laneW * 0.55) { if (o.kind === 'book') takeBook(o); else if (o.kind === 'coin') takeCoin(o); else takeShield(o); }
    }
    st.objs = st.objs.filter((o) => o.z > -3 && !o.taken);
    st.dustT -= dt; if (st.dustT <= 0) { st.dustT = 0.05; const p = playerScreen(); st.parts.push({ x: p.x + (Math.random() - 0.5) * 18, y: p.y - 2, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 30, life: 0.4, t: 0, col: 'rgba(235,225,205,.55)', r: 2 + Math.random() * 2.5, grav: 40 }); }
    st.score = Math.floor(st.dist / 3) + st.bonus;
  };

  /* ----- dibujo ----- */
  const drawSky = (P) => {
    const W = V.w, H = V.h, hz = V.hz;
    const sg = g.createLinearGradient(0, 0, 0, hz + 6); sg.addColorStop(0, pmRgb(P.top)); sg.addColorStop(1, pmRgb(P.bot)); g.fillStyle = sg; g.fillRect(0, 0, W, hz + 6);
    if (P.night > 0.15) for (const s of st.stars) { if (s.y * hz > hz - 4) continue; g.fillStyle = `rgba(255,255,255,${(0.25 + 0.55 * Math.abs(Math.sin(st.t * 1.4 + s.p))) * Math.min(1, P.night * 1.1)})`; g.beginPath(); g.arc(s.x * W, s.y * hz, s.r, 0, 6.3); g.fill(); }
    const sx = W * 0.72 - (st.x * 0.04), sy = hz - P.sunH * hz * 0.92;
    const gl = g.createRadialGradient(sx, sy, 4, sx, sy, 90); gl.addColorStop(0, pmRgb(P.sun, 0.55)); gl.addColorStop(1, pmRgb(P.sun, 0)); g.fillStyle = gl; g.fillRect(sx - 90, sy - 90, 180, 180);
    g.fillStyle = pmRgb(P.sun); g.beginPath(); g.arc(sx, sy, 20, 0, 6.3); g.fill();
    if (P.night > 0.7) { g.fillStyle = pmRgb(P.top, 0.9); g.beginPath(); g.arc(sx + 8, sy - 4, 17, 0, 6.3); g.fill(); }
    const cloudA = 0.75 - P.night * 0.5;
    for (const cl of st.clouds) { const x = cl.x * W - st.x * 0.03, y = cl.y * hz + 10, k = cl.s; g.fillStyle = `rgba(255,255,255,${cloudA})`; g.beginPath(); g.ellipse(x, y, 34 * k, 10 * k, 0, 0, 6.3); g.ellipse(x - 18 * k, y + 3 * k, 22 * k, 8 * k, 0, 0, 6.3); g.ellipse(x + 20 * k, y + 2 * k, 24 * k, 8 * k, 0, 0, 6.3); g.fill(); }
    /* colinas y ciudad lejana (se mueven un poco al cambiar de carril) */
    g.fillStyle = pmRgb(P.far); g.beginPath(); g.moveTo(-20, hz); for (let x = -20; x <= W + 20; x += 16) g.lineTo(x, hz - 26 - Math.sin(x * 0.018 + 1) * 14 - Math.sin(x * 0.05) * 5 + st.x * 0.01); g.lineTo(W + 20, hz); g.fill();
    g.fillStyle = pmRgb(P.build); const sh = -st.x * 0.05;
    for (const b of st.sky) { const bw = b.w * W, bh = 16 + b.h * 54, bx = b.x * W + sh; g.fillRect(bx, hz - bh, bw, bh + 1); if (P.night > 0.35) { g.fillStyle = `rgba(255,222,130,${(P.night - 0.3) * 0.8})`; for (let wy = hz - bh + 5; wy < hz - 5; wy += 8) for (let wx = bx + 3; wx < bx + bw - 3; wx += 6) if (pmHash(wx * 3 + wy + b.win * 99) > 0.55) g.fillRect(wx, wy, 2.4, 3.2); g.fillStyle = pmRgb(P.build); } }
    g.fillStyle = pmRgb(P.near); g.beginPath(); g.moveTo(-20, hz + 2); for (let x = -20; x <= W + 20; x += 14) g.lineTo(x, hz - 8 - Math.sin(x * 0.03 + 3) * 7 + st.x * 0.02); g.lineTo(W + 20, hz + 2); g.fill();
  };
  const drawGround = (P) => {
    const W = V.w, H = V.h, hz = V.hz;
    const gg = g.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, pmRgb(pmMix(P.ground, P.bot, 0.35))); gg.addColorStop(1, pmRgb(pmMix(P.ground, [0, 0, 0], 0.18))); g.fillStyle = gg; g.fillRect(0, hz, W, H - hz);
    const cx = W / 2, cam = st.x * 0.45, L = V.laneW, RW = L * 1.62;
    const quad = (z1, z2, xa, xb, col) => { const a = proj(z1), b = proj(z2); g.fillStyle = col; g.beginPath(); g.moveTo(cx + (xa - cam) * a.s, a.y); g.lineTo(cx + (xb - cam) * a.s, a.y); g.lineTo(cx + (xb - cam) * b.s, b.y); g.lineTo(cx + (xa - cam) * b.s, b.y); g.closePath(); g.fill(); };
    const off = ((st.sc % 8) + 8) % 8;
    for (let z = -3 - off; z < ZF; z += 4) {
      const band = Math.floor((z + st.sc) / 4) % 2 === 0; const z0 = Math.max(-3, z), z1 = z + 4.05;
      if (z1 <= -3) continue;
      quad(z0, z1, -RW, RW, pmRgb(band ? P.road : pmMix(P.road, [255, 255, 255], 0.045)));
    }
    const off2 = ((st.sc % 2) + 2) % 2;
    for (let z = -4 - off2; z < ZF; z += 2) {
      const z0 = Math.max(-3, z), z1 = z + 2.05; if (z1 <= -3) continue; const red = Math.floor((z + st.sc) / 2) % 2 === 0;
      quad(z0, z1, -RW - L * 0.14, -RW, red ? '#D9473A' : '#F4EFE6'); quad(z0, z1, RW, RW + L * 0.14, red ? '#D9473A' : '#F4EFE6');
    }
    const off3 = ((st.sc % 6) + 6) % 6;
    for (let z = -6 - off3; z < ZF; z += 6) { const z0 = Math.max(-3, z), z1 = z + 2.6; if (z1 <= -3) continue; for (const lx of [-0.5, 0.5]) quad(z0, z1, lx * L - L * 0.03, lx * L + L * 0.03, 'rgba(255,255,255,.82)'); }
    const hg = g.createLinearGradient(0, hz, 0, hz + 60); hg.addColorStop(0, pmRgb(P.bot, 0.7)); hg.addColorStop(1, pmRgb(P.bot, 0)); g.fillStyle = hg; g.fillRect(0, hz, W, 60);
  };
  /* ----- cosas que se dibujan con perspectiva ----- */
  const withObj = (x, y, k, fn) => { g.save(); g.translate(x, y); g.scale(k, k); fn(); g.restore(); };
  const shadow = (w) => { g.fillStyle = 'rgba(10,15,25,.28)'; g.beginPath(); g.ellipse(0, 0, w, w * 0.22, 0, 0, 6.3); g.fill(); };
  const drawTree = (P, h) => { shadow(26); g.fillStyle = '#6B4A2A'; g.fillRect(-4, -34, 8, 34); const gc = pmMix(h > 0.5 ? [64, 138, 80] : [86, 156, 92], [10, 28, 40], P.night * 0.65); g.fillStyle = pmRgb(gc); g.beginPath(); g.arc(0, -56, 26, 0, 6.3); g.arc(-15, -42, 18, 0, 6.3); g.arc(15, -42, 18, 0, 6.3); g.fill(); g.fillStyle = pmRgb(pmMix(gc, [255, 255, 255], 0.12)); g.beginPath(); g.arc(-7, -63, 14, 0, 6.3); g.fill(); };
  const drawLamp = (P, side) => { shadow(8); g.strokeStyle = '#3B4150'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -108); g.lineTo(-side * 26, -114); g.stroke(); g.fillStyle = '#EDE3B8'; g.beginPath(); g.arc(-side * 28, -112, 6, 0, 6.3); g.fill(); if (P.night > 0.2) { const gl = g.createRadialGradient(-side * 28, -108, 2, -side * 28, -108, 70); gl.addColorStop(0, `rgba(255,226,140,${0.7 * P.night})`); gl.addColorStop(1, 'rgba(255,226,140,0)'); g.fillStyle = gl; g.fillRect(-side * 28 - 70, -178, 140, 140); } };
  const drawBuild = (P, h, n) => { const w = 64 + h * 40, ht = 90 + h * 120; shadow(w * 0.55); g.fillStyle = pmRgb(pmMix(P.build, [30, 40, 60], 0.25)); g.fillRect(-w / 2, -ht, w, ht); g.fillStyle = pmRgb(pmMix(P.build, [255, 255, 255], 0.1)); g.fillRect(-w / 2, -ht, w * 0.22, ht); for (let wy = -ht + 12; wy < -14; wy += 17) for (let wx = -w / 2 + 12; wx < w / 2 - 8; wx += 15) { const lit = pmHash(wx * 7 + wy * 3 + n) > 0.45; g.fillStyle = P.night > 0.3 && lit ? `rgba(255,222,130,${0.35 + P.night * 0.6})` : 'rgba(255,255,255,.22)'; g.fillRect(wx, wy, 8, 10); } };
  const drawTask = (o) => {
    const wob = Math.sin(o.ph * 22) * 0.07 * (o.z < 30 ? 1 : 0.4);
    shadow(34);
    if (o.var === 0) { /* despertador rojo */
      g.save(); g.translate(0, -44); g.rotate(wob);
      g.strokeStyle = '#8E2B1C'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-17, 34); g.lineTo(-24, 44); g.moveTo(17, 34); g.lineTo(24, 44); g.stroke();
      g.fillStyle = '#B9382A'; g.beginPath(); g.arc(-21, -26, 11, 0, 6.3); g.arc(21, -26, 11, 0, 6.3); g.fill();
      g.fillStyle = '#E04A3B'; g.beginPath(); g.arc(0, 0, 34, 0, 6.3); g.fill(); g.fillStyle = '#F5ECE2'; g.beginPath(); g.arc(0, 0, 25, 0, 6.3); g.fill();
      g.strokeStyle = '#3B2F25'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -16); g.moveTo(0, 0); g.lineTo(11, 7); g.stroke();
      g.fillStyle = '#E04A3B'; g.font = '800 11px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('¡VENCE!', 0, 18);
      g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(-14, -18, 7, 11, -0.6, 0, 6.3); g.fill(); g.restore();
    } else { /* carpeta con tarea */
      g.save(); g.translate(0, 0); g.rotate(wob * 0.6);
      g.fillStyle = '#9C3322'; pmRR(g, -34, -92, 68, 90, 10); g.fill(); g.fillStyle = '#C8452F'; pmRR(g, -34, -92, 62, 88, 10); g.fill();
      g.fillStyle = '#F7F1E5'; pmRR(g, -25, -80, 50, 66, 4); g.fill(); g.fillStyle = '#C9C2B2'; for (let i = 0; i < 4; i++) g.fillRect(-19, -70 + i * 9, 38 - (i % 2) * 10, 3);
      g.fillStyle = '#B3B7BF'; pmRR(g, -13, -100, 26, 14, 5); g.fill();
      g.fillStyle = '#E04A3B'; g.beginPath(); g.arc(0, -30, 13, 0, 6.3); g.fill(); g.fillStyle = '#fff'; g.font = '800 19px system-ui,sans-serif'; g.textAlign = 'center'; g.fillText('!', 0, -23);
      g.fillStyle = '#fff'; g.font = '800 9px system-ui,sans-serif'; g.fillText('¡VENCE!', 0, -8); g.restore();
    }
  };
  const drawBook = (o) => {
    const bob = Math.sin(o.ph * 3.2) * 5, fl = Math.cos(o.ph * 2.4), sx = Math.sign(fl || 1) * Math.max(0.3, Math.abs(fl));
    g.fillStyle = 'rgba(10,15,25,.22)'; g.beginPath(); g.ellipse(0, 0, 15, 4, 0, 0, 6.3); g.fill();
    const gl = g.createRadialGradient(0, -46 + bob, 2, 0, -46 + bob, 36); gl.addColorStop(0, 'rgba(255,230,140,.5)'); gl.addColorStop(1, 'rgba(255,230,140,0)'); g.fillStyle = gl; g.fillRect(-36, -82 + bob, 72, 72);
    g.save(); g.translate(0, -46 + bob); g.scale(sx, 1);
    g.fillStyle = '#F2E8CF'; pmRR(g, -13, -19, 28, 38, 3); g.fill(); g.fillStyle = '#2E7D8F'; pmRR(g, -15, -21, 28, 38, 3); g.fill(); g.fillStyle = '#1F5E6D'; g.fillRect(-15, -21, 6, 38);
    g.fillStyle = '#F6D470'; g.fillRect(-3, -14, 12, 2.6); g.fillRect(-3, -8, 8, 2.6); g.fillStyle = '#D9473A'; g.fillRect(6, 14, 4, 11); g.restore();
    const tw = (Math.sin(o.ph * 5) + 1) / 2; g.fillStyle = `rgba(255,246,200,${0.4 + tw * 0.5})`; g.beginPath(); g.arc(18, -62 + bob, 2 + tw, 0, 6.3); g.arc(-20, -34 + bob, 1.6 + tw, 0, 6.3); g.fill();
  };
  const drawCoin = (o) => {
    const k = Math.abs(Math.cos(o.ph * 5)), bob = Math.sin(o.ph * 3) * 3;
    g.fillStyle = 'rgba(10,15,25,.2)'; g.beginPath(); g.ellipse(0, 0, 11, 3, 0, 0, 6.3); g.fill();
    const gl = g.createRadialGradient(0, -30 + bob, 2, 0, -30 + bob, 26); gl.addColorStop(0, 'rgba(255,225,120,.55)'); gl.addColorStop(1, 'rgba(255,225,120,0)'); g.fillStyle = gl; g.fillRect(-26, -56 + bob, 52, 52);
    g.fillStyle = '#E8B23A'; g.strokeStyle = '#A8761A'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, -30 + bob, 3 + 11 * k, 14, 0, 0, 6.3); g.fill(); g.stroke();
    g.fillStyle = '#FFE9A0'; g.beginPath(); g.ellipse(0, -30 + bob, 1.4 + 6 * k, 9, 0, 0, 6.3); g.fill();
  };
  const drawShieldItem = (o) => {
    const bob = Math.sin(o.ph * 3) * 4, pl = (Math.sin(o.ph * 4) + 1) / 2;
    g.fillStyle = 'rgba(10,15,25,.2)'; g.beginPath(); g.ellipse(0, 0, 14, 4, 0, 0, 6.3); g.fill();
    g.save(); g.translate(0, -44 + bob);
    g.strokeStyle = `rgba(160,220,255,${0.35 + pl * 0.4})`; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 26 + pl * 3, 0, 6.3); g.stroke();
    const bg = g.createRadialGradient(-6, -8, 2, 0, 0, 22); bg.addColorStop(0, '#CDEBFF'); bg.addColorStop(1, '#4C9BE0'); g.fillStyle = bg; g.beginPath(); g.arc(0, 0, 20, 0, 6.3); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -11); g.lineTo(10, -7); g.lineTo(8, 4); g.quadraticCurveTo(5, 10, 0, 13); g.quadraticCurveTo(-5, 10, -8, 4); g.lineTo(-10, -7); g.closePath(); g.fill();
    g.restore();
  };
  const drawRunner = (x, y) => {
    const K0 = pmSkinCur(), K = K0.rainbow ? { ...K0, jersey: `hsl(${(st.t * 60) % 360},75%,58%)`, shorts: `hsl(${(st.t * 60 + 180) % 360},60%,45%)` } : K0, k = V.S, ph = st.runT, run = st.state === 'run', bob = run ? Math.abs(Math.sin(ph)) * 5 : Math.sin(st.t * 2 + st.sc) * 1.2;
    const lean = Math.max(-0.28, Math.min(0.28, (laneX(st.lane) - st.x) / V.laneW * 0.32));
    g.save(); g.translate(x, y); g.scale(k, k);
    g.fillStyle = 'rgba(10,15,25,.32)'; g.beginPath(); g.ellipse(0, 0, 24 - bob, 6 - bob * 0.3, 0, 0, 6.3); g.fill();
    if (st.inv > 0 && Math.floor(st.inv * 14) % 2 === 0) g.globalAlpha = 0.45;
    if (K.aura) { const ag = g.createRadialGradient(0, -56, 6, 0, -56, 74); ag.addColorStop(0, K.aura + '55'); ag.addColorStop(1, K.aura + '00'); g.fillStyle = ag; g.beginPath(); g.arc(0, -56, 74, 0, 6.3); g.fill(); }
    g.rotate(lean);
    for (const sd of [-1, 1]) { const sw = run ? Math.sin(ph + (sd > 0 ? Math.PI : 0)) : 0, lift = Math.max(0, sw) * 14, fy = -lift - 2;
      g.fillStyle = K.shorts; pmRR(g, sd * 9 - 6, -42 - bob, 12, 42 + fy + bob, 5); g.fill();
      g.fillStyle = K.shoe; pmRR(g, sd * 9 - 8, fy - 7, 16, 9, 4); g.fill(); g.fillStyle = K.trim; g.fillRect(sd * 9 - 8, fy - 2, 16, 2.4); }
    for (const sd of [-1, 1]) { const sw = run ? Math.sin(ph + (sd > 0 ? 0 : Math.PI)) : 0, hy = -50 - bob + sw * 9;
      g.strokeStyle = K.arm; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(sd * 21, -76 - bob); g.lineTo(sd * 26, hy); g.stroke();
      g.fillStyle = '#F0C7A0'; g.beginPath(); g.arc(sd * 26, hy + 3, 5, 0, 6.3); g.fill(); }
    g.fillStyle = K.jersey; g.beginPath(); g.moveTo(-20, -78 - bob); g.quadraticCurveTo(0, -84 - bob, 20, -78 - bob); g.lineTo(15, -38 - bob); g.lineTo(-15, -38 - bob); g.closePath(); g.fill();
    g.fillStyle = K.trim; pmRR(g, -15, -74 - bob, 30, 32, 8); g.fill(); g.fillStyle = K.trim2; pmRR(g, -10, -52 - bob, 20, 12, 4); g.fill(); g.fillRect(-1, -74 - bob, 2, 20);
    g.fillStyle = '#F0C7A0'; g.fillRect(-4, -84 - bob, 8, 8);
    g.fillStyle = K.hair; g.beginPath(); g.arc(0, -95 - bob, 13, 0, 6.3); g.fill(); g.fillStyle = K.hair; g.beginPath(); g.arc(0, -99 - bob, 10, Math.PI, 6.3); g.fill();
    g.fillStyle = K.trim; g.fillRect(-13, -97 - bob, 26, 3.4);
    if (K.spark) { g.fillStyle = K.spark; for (let q = 0; q < 4; q++) { const tq = (st.t * 1.3 + q * 0.27) % 1; g.globalAlpha = Math.sin(tq * Math.PI) * 0.9; g.beginPath(); g.arc(Math.sin(q * 2.1) * 22, -20 - tq * 90, 2 + (q % 2), 0, 6.3); g.fill(); } g.globalAlpha = 1; }
    g.restore();
    if (st.shield) { const pl = (Math.sin(st.t * 6) + 1) / 2; g.save(); g.translate(x, y - 56 * k); const bg = g.createRadialGradient(0, -6, 6, 0, 0, 62 * k); bg.addColorStop(0, 'rgba(160,220,255,.06)'); bg.addColorStop(1, `rgba(120,200,255,${0.3 + pl * 0.15})`); g.fillStyle = bg; g.beginPath(); g.arc(0, 0, 62 * k, 0, 6.3); g.fill(); g.strokeStyle = `rgba(200,240,255,${0.7 + pl * 0.25})`; g.lineWidth = 2.2; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(0, 0, 50 * k, 3.6, 4.5); g.stroke(); g.restore(); }
  };
  const drawHUD = (P) => {
    const W = V.w, top = V.safe + 14; g.textBaseline = 'alphabetic';
    const num = String(st.score); g.font = '800 26px system-ui,-apple-system,sans-serif'; const tw = g.measureText(num).width, pw = Math.max(112, tw + 44), px = W / 2 - pw / 2;
    g.fillStyle = 'rgba(10,18,32,.55)'; pmRR(g, px, top, pw, 54, 27); g.fill(); pmRR(g, px, top, pw, 54, 27); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.18)'; g.stroke();
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(num, W / 2, top + 43); g.font = '700 9px system-ui,sans-serif'; g.fillStyle = 'rgba(255,255,255,.62)'; g.fillText('PUNTOS', W / 2, top + 14);
    const m = mult();
    if (st.combo > 0) {
      const pop = 1 + st.comboPulse * 0.12, cy = top + 62; g.save(); g.translate(W / 2, cy + 14); g.scale(pop, pop);
      g.fillStyle = m > 1 ? 'rgba(233,180,76,.95)' : 'rgba(10,18,32,.5)'; pmRR(g, -52, -14, 104, 28, 14); g.fill();
      g.font = '800 13px system-ui,sans-serif'; g.fillStyle = m > 1 ? '#3B2A08' : '#fff'; g.textAlign = 'center'; g.fillText(`${st.combo} ${st.combo === 1 ? 'libro' : 'libros'}${m > 1 ? ` · x${m}` : ''}`, 0, 5);
      if (m < 5) { g.fillStyle = m > 1 ? 'rgba(59,42,8,.25)' : 'rgba(255,255,255,.25)'; g.fillRect(-40, 9, 80, 3); g.fillStyle = m > 1 ? '#3B2A08' : '#fff'; g.fillRect(-40, 9, 80 * ((st.combo % 5) / 5), 3); }
      g.restore();
    }
    const ct = String(st.coins); g.font = '800 17px system-ui,sans-serif'; const cw = g.measureText(ct).width + 46, cx = W - 14 - cw;
    g.fillStyle = 'rgba(10,18,32,.55)'; pmRR(g, cx, top + 8, cw, 38, 19); g.fill();
    g.fillStyle = '#E8B23A'; g.strokeStyle = '#A8761A'; g.lineWidth = 1.6; g.beginPath(); g.arc(cx + 21, top + 27, 9.5, 0, 6.3); g.fill(); g.stroke(); g.fillStyle = '#FFE9A0'; g.beginPath(); g.arc(cx + 21, top + 27, 5.5, 0, 6.3); g.fill();
    g.fillStyle = '#fff'; g.textAlign = 'left'; g.fillText(ct, cx + 37, top + 33);
    if (st.shield) { g.fillStyle = 'rgba(76,155,224,.9)'; pmRR(g, W - 14 - 38, top + 54, 38, 26, 13); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(W - 33, top + 61); g.lineTo(W - 25, top + 64); g.lineTo(W - 26, top + 71); g.quadraticCurveTo(W - 29, top + 76, W - 33, top + 77); g.quadraticCurveTo(W - 37, top + 76, W - 40, top + 71); g.lineTo(W - 41, top + 64); g.closePath(); g.fill(); }
  };
  const draw = () => {
    const W = V.w, H = V.h; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    const P = pmPal(st.sc); const sk = st.shake > 0 ? st.shake * 14 : 0;
    g.save(); if (sk) g.translate((Math.random() - 0.5) * sk, (Math.random() - 0.5) * sk);
    drawSky(P); drawGround(P);
    /* lista ordenada de lejos a cerca */
    const items = []; const SP = 11, cx = W / 2, cam = st.x * 0.45, RW = V.laneW * 1.62;
    for (let k = Math.ceil((st.sc - 3) / SP); k <= Math.floor((st.sc + ZF) / SP); k++) {
      const z = k * SP - st.sc; for (const side of [-1, 1]) { const h = pmHash(k * 2 + (side > 0 ? 1 : 0)), type = Math.floor(h * 5); const wx = side * (RW + 70 + (type === 3 ? 90 : 40) + h * 40); items.push({ z, kind: 'sc', side, h, type, k, wx }); }
    }
    for (const o of st.objs) if (!o.taken) items.push(o);
    items.sort((a, b) => b.z - a.z);
    let playerDone = false;
    const drawPlayer = () => { playerDone = true; const px = cx + (st.x - cam), py = V.py; drawRunner(px, py); };
    for (const it of items) {
      if (!playerDone && it.z < 0) drawPlayer();
      const { s, y } = proj(it.z); if (s < 0.05) continue;
      const fade = Math.min(1, (ZF - it.z) / 12); g.globalAlpha = Math.max(0, fade);
      if (it.kind === 'sc') { const x = cx + (it.wx - cam) * s; withObj(x, y, s * V.S, () => { if (it.type === 2) drawLamp(P, it.side); else if (it.type === 3) drawBuild(P, it.h, it.k); else drawTree(P, it.h); }); }
      else { const x = cx + (laneX(it.lane) - cam) * s; withObj(x, y, s * V.S, () => (it.kind === 'task' ? drawTask(it) : it.kind === 'book' ? drawBook(it) : it.kind === 'coin' ? drawCoin(it) : drawShieldItem(it))); }
      g.globalAlpha = 1;
    }
    if (!playerDone) drawPlayer();
    if (st.state === 'over' && !st.hit) { /* nada */ }
    /* partículas y textos */
    for (const p of st.parts) { const a = 1 - p.t / p.life; g.globalAlpha = Math.max(0, a); g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.r * (0.5 + a * 0.5), 0, 6.3); g.fill(); } g.globalAlpha = 1;
    g.textAlign = 'center'; for (const f of st.floats) { g.globalAlpha = 1 - f.t; g.font = '800 17px system-ui,sans-serif'; g.fillStyle = 'rgba(0,0,0,.35)'; g.fillText(f.txt, f.x + 1, f.y - f.t * 46 + 1); g.fillStyle = f.col; g.fillText(f.txt, f.x, f.y - f.t * 46); } g.globalAlpha = 1;
    /* líneas de velocidad */
    if (st.state === 'run' && st.speed > 24) { const a = Math.min(0.3, (st.speed - 24) / 40); g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 1.6; for (let i = 0; i < 14; i++) { const ang = 0.3 + (i / 13) * 2.54 + Math.sin(i * 12.9) * 0.1, r0 = ((st.t * 1.6 + i * 0.37) % 1), r = r0 * r0 * H * 0.9 + 50; g.beginPath(); g.moveTo(cx + Math.cos(ang) * r, V.hz + Math.sin(ang) * r * 0.9); g.lineTo(cx + Math.cos(ang) * (r + 18 + r0 * 40), V.hz + Math.sin(ang) * (r + 18 + r0 * 40) * 0.9); g.stroke(); } }
    g.restore();
    /* viñeta y destello */
    const vg = g.createRadialGradient(W / 2, H * 0.55, H * 0.35, W / 2, H * 0.55, H * 0.85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(5,8,20,${0.25 + P.night * 0.25})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    if (st.flash > 0) { g.fillStyle = `rgba(255,255,255,${st.flash * 0.45})`; g.fillRect(0, 0, W, H); }
    drawHUD(P);
  };

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

Object.assign(VIDA_ACTS, { 'pm-start': () => pmStart() });
EXTRA_VIEWS.peloton = viewPeloton; EXTRA_NAV.peloton = 'juegos';
