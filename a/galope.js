/* Cinnavia 7.19 — Galope: un caballo corre por la pradera y salta los manzanos.
   Mismo espíritu del dinosaurio de Chrome: un solo toque para saltar (mantén para saltar más alto),
   la velocidad sube sola, la puntuación avanza con la distancia, parpadea cada 100 puntos y,
   de vez en cuando, cae la noche. Guarda tu récord en este dispositivo. */
'use strict';
const GL = { run: null };
const glBestKey = () => `aldia:galope:best:${REG.me || '_'}`;
const glBest = () => { try { return +localStorage.getItem(glBestKey()) || 0; } catch { return 0; } };
const glSaveBest = (v) => { try { localStorage.setItem(glBestKey(), String(v)); } catch { /* */ } };
const glPad = (n) => String(Math.max(0, Math.floor(n))).padStart(5, '0');

/* ---------- el caballo (dibujado con curvas, de perfil) ---------- */
function glDrawHorse(g, x, y, phase, air, vy, blink) {
  const coat = '#6A3D22', coat2 = '#4E2B17', mane = '#241509', hoof = '#17100a';
  g.save(); g.translate(x, y);
  // sombra
  g.fillStyle = 'rgba(30,50,30,.22)'; g.beginPath(); g.ellipse(0, 1, air ? 18 : 28, 3.2, 0, 0, 7); g.fill();
  if (air) g.rotate(Math.max(-0.28, Math.min(0.3, vy * 0.00032)));
  const bob = air ? 0 : Math.sin(phase * 6.283 * 2) * 1.6;
  g.translate(0, bob);
  // cola
  const sw = Math.sin(phase * 6.283 * 2 + 1) * 4;
  g.strokeStyle = mane; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-26, -40); g.bezierCurveTo(-38, -38 + sw, -44, -26 + sw, -42, -12 + sw); g.stroke();
  g.lineWidth = 2.6; g.beginPath(); g.moveTo(-26, -40); g.bezierCurveTo(-34, -36 + sw, -38, -24 + sw, -37, -10 + sw); g.stroke();
  // patas traseras y delanteras (dos segmentos)
  const leg = (hx, hy, p, col, front) => {
    let a1, a2;
    if (air) { a1 = front ? 0.85 : -0.8; a2 = front ? -0.5 : 0.7; }
    else { const s = Math.sin(p * 6.283); a1 = s * 0.75; a2 = Math.max(0, -Math.sin(p * 6.283 + 0.9)) * 1.05 * (front ? -1 : 1) + (front ? 0 : 0.2); }
    const x1 = hx + Math.sin(a1) * 17, y1 = hy + Math.cos(a1) * 17;
    const x2 = x1 + Math.sin(a1 + a2) * 17, y2 = Math.min(0, y1 + Math.cos(a1 + a2) * 17);
    g.strokeStyle = col; g.lineWidth = 5.4; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    g.fillStyle = hoof; g.beginPath(); g.ellipse(x2 + 0.5, y2, 3.2, 2.2, 0, 0, 7); g.fill();
  };
  leg(-17, -30, phase + 0.5, coat2, false); leg(14, -30, phase + 0.12, coat2, true);
  // cuerpo
  const gr = g.createLinearGradient(0, -52, 0, -18); gr.addColorStop(0, '#85502D'); gr.addColorStop(1, coat);
  g.fillStyle = gr; g.beginPath(); g.moveTo(-27, -36); g.bezierCurveTo(-28, -50, -8, -49, 8, -47); g.bezierCurveTo(20, -47, 28, -46, 30, -36); g.bezierCurveTo(28, -22, 14, -20, 0, -21); g.bezierCurveTo(-14, -20, -28, -22, -27, -36); g.fill();
  // cuello y cabeza
  g.beginPath(); g.moveTo(16, -46); g.bezierCurveTo(24, -62, 30, -70, 36, -72); g.lineTo(52, -62); g.bezierCurveTo(54, -58, 52, -54, 48, -54); g.bezierCurveTo(42, -54, 38, -50, 34, -40); g.bezierCurveTo(28, -34, 22, -36, 16, -46); g.fill();
  g.fillStyle = coat2; g.beginPath(); g.ellipse(50, -57, 4.6, 3.4, 0.5, 0, 7); g.fill();            // hocico
  g.fillStyle = coat; g.beginPath(); g.moveTo(36, -72); g.lineTo(37, -80); g.lineTo(42, -72); g.fill(); // oreja
  g.fillStyle = '#120a05'; g.beginPath(); g.arc(42, -66, 1.5, 0, 7); g.fill();                         // ojo
  // crin
  g.fillStyle = mane; g.beginPath(); g.moveTo(34, -73); g.bezierCurveTo(24, -70, 18, -58, 12, -46 + sw * 0.2); g.bezierCurveTo(18, -50, 24, -56, 30, -62); g.bezierCurveTo(33, -66, 36, -68, 36, -72); g.fill();
  // patas del lado cercano
  leg(-12, -30, phase + 0.62, coat, false); leg(18, -30, phase, coat, true);
  g.restore();
}

/* ---------- manzano ---------- */
function glDrawTree(g, x, y, h, seed) {
  let hs = 7; for (const ch of String(seed)) hs = (Math.imul(hs, 31) + ch.charCodeAt(0)) >>> 0; const r = rnd(hs); const tw = 5 + h * 0.09; const th = h * 0.36; const cr = h * 0.4; const cy = y - th - cr * 0.78;
  g.fillStyle = 'rgba(30,50,30,.2)'; g.beginPath(); g.ellipse(x, y + 1, cr * 0.9, 3.4, 0, 0, 7); g.fill();
  g.fillStyle = '#5A3B20'; g.beginPath(); g.moveTo(x - tw * 0.55, y); g.lineTo(x - tw * 0.4, y - th); g.lineTo(x + tw * 0.4, y - th); g.lineTo(x + tw * 0.55, y); g.fill();
  const blobs = [[0, 0, 1], [-0.62, 0.22, 0.7], [0.62, 0.2, 0.72], [-0.28, -0.38, 0.72], [0.32, -0.34, 0.7]];
  for (const [dx, dy, k] of blobs) { const gr = g.createRadialGradient(x + dx * cr - 3, cy + dy * cr - 3, 2, x + dx * cr, cy + dy * cr, cr * k); gr.addColorStop(0, '#79B66A'); gr.addColorStop(1, '#3F7D46'); g.fillStyle = gr; g.beginPath(); g.arc(x + dx * cr, cy + dy * cr, cr * k, 0, 7); g.fill(); }
  const n = 4 + Math.floor(h / 14);
  for (let i = 0; i < n; i++) { const a = r() * 6.283, d = r() * cr * 0.95; const ax = x + Math.cos(a) * d, ay = cy + Math.sin(a) * d * 0.9; g.fillStyle = r() < 0.18 ? '#E8B83A' : '#D4432F'; g.beginPath(); g.arc(ax, ay, 2.5 + h * 0.018, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(ax - 0.9, ay - 0.9, 0.9, 0, 7); g.fill(); }
}

/* ---------- audio mínimo ---------- */
let glCtx = null;
function glTone(f, d, type = 'square', vol = 0.05, f2) {
  try {
    glCtx ||= new (window.AudioContext || window.webkitAudioContext)(); if (glCtx.state === 'suspended') glCtx.resume();
    const o = glCtx.createOscillator(), v = glCtx.createGain(); o.type = type; o.frequency.setValueAtTime(f, glCtx.currentTime); if (f2) o.frequency.exponentialRampToValueAtTime(f2, glCtx.currentTime + d);
    v.gain.setValueAtTime(vol, glCtx.currentTime); v.gain.exponentialRampToValueAtTime(0.0001, glCtx.currentTime + d); o.connect(v); v.connect(glCtx.destination); o.start(); o.stop(glCtx.currentTime + d + 0.02);
  } catch { /* */ }
}

/* ---------- pantalla de inicio del juego ---------- */
let glHeroURL = '';
function glHero() {
  if (glHeroURL) return glHeroURL;
  try {
    const c = document.createElement('canvas'); c.width = 720; c.height = 300; const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 300); sky.addColorStop(0, '#A9D7F0'); sky.addColorStop(1, '#F7E8C6'); g.fillStyle = sky; g.fillRect(0, 0, 720, 300);
    g.fillStyle = 'rgba(255,255,255,.8)'; for (const [x, y, s] of [[110, 60, 1], [420, 40, 0.8], [600, 80, 1.1]]) { g.beginPath(); g.ellipse(x, y, 40 * s, 12 * s, 0, 0, 7); g.ellipse(x + 26 * s, y - 8 * s, 26 * s, 12 * s, 0, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(126,164,150,.8)'; g.beginPath(); g.moveTo(0, 210); for (let x = 0; x <= 720; x += 60) g.lineTo(x, 170 - Math.sin(x * 0.011) * 28); g.lineTo(720, 300); g.lineTo(0, 300); g.fill();
    g.fillStyle = '#9DC193'; g.fillRect(0, 220, 720, 80); g.fillStyle = '#86B27E'; g.fillRect(0, 262, 720, 38);
    glDrawTree(g, 500, 252, 96, 'gh1'); glDrawTree(g, 640, 252, 70, 'gh2');
    g.save(); g.scale(2.2, 2.2); glDrawHorse(g, 70, 114, 0.1, true, -150, false); g.restore();
    glHeroURL = c.toDataURL('image/png');
  } catch { glHeroURL = ''; }
  return glHeroURL;
}
function viewGalope() {
  const best = glBest();
  return `<section class="gm-home"><div class="gm-hero gl-hero">${glHero() ? `<img src="${glHero()}" alt="" style="width:100%;height:auto;border-radius:18px;display:block">` : ''}</div>
    <h1 class="page-title gm-title">Galope</h1>
    <p class="page-sub">Un caballo corre por la pradera. <b>Toca la pantalla</b> (o presiona espacio) para saltar los manzanos; mantén el toque para saltar más alto. Cada vez corre más rápido y, de vez en cuando, cae la noche.</p>
    <button class="btn primary block gm-play" data-act="gl-start">${icon('play')}Galopar</button>
    <p class="small muted" style="text-align:center;margin-top:12px">${best ? `Tu récord en este dispositivo: <b>${best}</b> puntos` : 'Todavía no tienes récord. ¡Sé la primera marca!'}</p>
    <div id="glRank">${glRankHTML()}</div></section>`;
}
const GL_TABS = [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']];
function glRankHTML() {
  GL.tab ||= 'dia';
  const r = GL.rank; const list = r ? r[GL.tab] || [] : null;
  const val = (x) => (GL.tab === 'manzanas' ? `${x.apples} ${x.apples === 1 ? 'partida' : 'partidas'}` : `${x.score} pts`);
  const pod = list && list.length ? `<div class="gm-podium">${[1, 0, 2].map((i) => list[i] ? `<div class="gm-pod p${i + 1}">${avatar({ id: list[i].id, name: list[i].name, color: list[i].color })}<b>${esc(list[i].name)}</b><span>${val(list[i])}</span><i>${i + 1}</i></div>` : '<div class="gm-pod empty"></div>').join('')}</div>` : '';
  const rest = list && list.length > 3 ? `<ol class="gm-list" start="4">${list.slice(3, 20).map((x) => `<li class="${x.id === REG.me ? 'me' : ''}"><span>${esc(x.name)}</span><b>${val(x)}</b></li>`).join('')}</ol>` : '';
  const mine = r && r.me ? `<p class="small muted gm-mine">Tu mejor: <b>${r.me.best || 0} pts</b> · partidas: <b>${r.me.games || 0}</b></p>` : '';
  if (!list) setTimeout(galLoad, 10);
  return `<h2 class="sec">Ranking</h2><div class="seg full" role="group">${GL_TABS.map(([k, l]) => `<button type="button" data-act="gl-tab" data-v="${k}" aria-pressed="${GL.tab === k}">${l}</button>`).join('')}</div>
    <div id="glRankBox">${list ? (list.length ? pod + rest : '<p class="small muted" style="text-align:center;margin-top:14px">Aún nadie ha galopado en este periodo. ¡Sé la primera persona!</p>') : (typeof loaderHTML === 'function' ? loaderHTML('Cargando ranking…') : '')}</div>${mine}`;
}
async function galLoad() {
  if (!navigator.onLine) return;
  try { GL.rank = await cloudFetch('GET', null, `kind=gamerank&game=galope&as=${encodeURIComponent(REG.me || '')}`); const b = document.getElementById('glRank'); if (b) b.innerHTML = glRankHTML(); } catch { /* */ }
}
Object.assign(VIDA_ACTS, { 'gl-tab': (el) => { GL.tab = el.dataset.v; const b = document.getElementById('glRank'); if (b) b.innerHTML = glRankHTML(); } });
EXTRA_VIEWS.galope = viewGalope; EXTRA_NAV.galope = 'mas'; GROUP_VIEWS.galope = viewGalope; GROUP_NAV.galope = 'mas';
Object.assign(VIDA_ACTS, { 'gl-start': () => glStart() });

/* ---------- el juego ---------- */
function glStart() {
  if (GL.run) return;
  const wrap = document.createElement('div'); wrap.className = 'gl-stage';
  wrap.innerHTML = `<canvas id="glC"></canvas><button class="gm-x gl-x" id="glX" aria-label="Salir">${icon('x')}</button>
    <div class="gl-over" id="glOver" hidden><b>Fin del galope</b><span id="glFin"></span><span class="small muted" id="glRankLine"></span><div class="btn-row" style="justify-content:center"><button class="btn primary" id="glAgain">${icon('play', 'sm')}Otra vez</button><button class="btn" id="glOut">Ver ranking</button></div></div>
    <div class="gl-hint" id="glHint">Toca para saltar</div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const c = wrap.querySelector('canvas'); const g = c.getContext('2d');
  const V = { s: 1, w: 480, h: 600, gy: 380, dpr: Math.min(2, devicePixelRatio || 1) };
  const size = () => { const W = innerWidth, H = innerHeight; V.s = Math.min(W / 480, H / 300); V.w = W / V.s; V.h = H / V.s; V.gy = V.h * 0.66; c.width = W * V.dpr; c.height = H * V.dpr; c.style.width = W + 'px'; c.style.height = H + 'px'; };
  size();
  const hx = () => Math.max(60, V.w * 0.16);
  const st = { state: 'idle', score: 0, speed: 0, y: 0, vy: 0, air: false, hold: false, dist: 0, trees: [], next: 360, hi: glBest(), flash: 0, night: 0, nightT: 0, nightGoal: 0, phase: 0, clouds: [], deco: [], last: performance.now(), id: 0, lastBlip: 0, hills: 0, over: 0, t0: performance.now() };
  GL.run = st;
  for (let i = 0; i < 5; i++) st.clouds.push({ x: Math.random() * V.w, y: 20 + Math.random() * V.h * 0.22, k: 0.6 + Math.random() * 0.8 });
  const stars = Array.from({ length: 50 }, () => ({ x: Math.random(), y: Math.random() * 0.45, r: 0.5 + Math.random() * 1.2 }));
  const hint = wrap.querySelector('#glHint'), over = wrap.querySelector('#glOver');
  const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* */ } };

  const jump = () => {
    if (st.state === 'over') return;
    if (st.state === 'idle') { st.state = 'run'; st.speed = 270; hint.hidden = true; }
    if (!st.air) { st.vy = -640; st.air = true; st.hold = true; glTone(520, 0.12, 'square', 0.04, 880); vib(8); }
  };
  const release = () => { st.hold = false; if (st.air && st.vy < -230) st.vy = -230; };
  const down = () => { if (st.air) st.vy = Math.max(st.vy, 520); };
  const onDown = (e) => { if (e.target.closest('.gl-x, .gl-over')) return; e.preventDefault(); jump(); };
  const onUp = () => release();
  const onKey = (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); if (!e.repeat) { if (st.state === 'over') { if (performance.now() - st.over > 500) again(); } else jump(); } }
    if (e.key === 'ArrowDown') down();
    if (e.key === 'Escape') exit();
  };
  const onKeyUp = (e) => { if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') release(); };
  try { history.pushState({ glGame: true }, ''); } catch { /* */ }
  const onPop = () => { if (GL.run) { try { history.pushState({ glGame: true }, ''); } catch { /* */ } } };
  addEventListener('popstate', onPop);
  wrap.addEventListener('touchstart', (e) => { if (!e.target.closest('button')) e.preventDefault(); }, { passive: false });
  wrap.addEventListener('pointerdown', onDown); wrap.addEventListener('pointerup', onUp); wrap.addEventListener('pointercancel', onUp);
  addEventListener('keydown', onKey); addEventListener('keyup', onKeyUp); addEventListener('resize', size);

  const spawn = () => {
    const sc = st.score; const kinds = [[1, 40], [1, 60], [1, 50]];
    if (sc > 150) kinds.push([2, 46]);
    if (sc > 350) kinds.push([2, 62], [3, 42]);
    const [n, h] = kinds[Math.floor(Math.random() * kinds.length)];
    const gap = 44 + h * 0.3;
    for (let i = 0; i < n; i++) st.trees.push({ x: V.w + 40 + i * gap, h: h - i * 5 + (Math.random() * 8 - 4), seed: 'gt' + Math.random() });
    st.next = st.dist + Math.max(300, st.speed * (0.95 + Math.random() * 0.7)) + n * gap;
  };

  const end = async () => {
    if (st.state === 'over') return;
    st.state = 'over'; st.over = performance.now(); const sc = Math.floor(st.score);
    const secs = Math.max(1, Math.round((performance.now() - st.t0) / 1000));
    GL.rank = null;
    glTone(180, 0.35, 'sawtooth', 0.08, 60); vib([220, 80, 220]);
    if (sc > st.hi) { st.hi = sc; glSaveBest(sc); }
    wrap.querySelector('#glFin').textContent = `${sc} puntos${sc >= st.hi && sc > 0 ? ' · ¡nuevo récord!' : ` · récord ${st.hi}`}`; over.hidden = false;
    over.classList.remove('show'); void over.offsetWidth; over.classList.add('show');
    if (REG.me && tokens()[REG.me] && sc > 0) {
      try {
        const rec = await Promise.race([cloudFetch('POST', { kind: 'game', as: REG.me, game: 'galope', score: sc, apples: 0, dur: secs }), new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 6000))]);
        const line = wrap.querySelector('#glRankLine');
        if (rec && line && wrap.isConnected) line.textContent = rec.rankDay ? `Lugar #${rec.rankDay} de hoy` : '';
      } catch (e) { if (!(e && e.status >= 400 && e.status < 500)) { (REG.gameout ||= []).push({ game: 'galope', score: sc, apples: 0, dur: secs }); saveReg(); } }
    }
  };
  const again = () => {
    Object.assign(st, { state: 'run', score: 0, speed: 270, y: 0, vy: 0, air: false, dist: 0, trees: [], next: 360, flash: 0, night: 0, nightGoal: 0, nightT: 0, lastBlip: 0 });
    over.hidden = true; hint.hidden = true; st.last = performance.now(); st.t0 = performance.now();
  };
  wrap.querySelector('#glAgain').addEventListener('click', again);
  wrap.querySelector('#glOut').addEventListener('click', () => { exit(); if (location.hash !== '#/galope') location.hash = '#/galope'; else render(); });

  const exit = () => {
    cancelAnimationFrame(st.id); removeEventListener('keydown', onKey); removeEventListener('keyup', onKeyUp); removeEventListener('resize', size); removeEventListener('popstate', onPop);
    wrap.remove(); document.body.classList.remove('gm-on'); GL.run = null; if (location.hash === '#/galope') render();
  };
  wrap.querySelector('#glX').addEventListener('click', exit);

  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const rgb = (a) => `rgb(${a[0]},${a[1]},${a[2]})`;

  const draw = () => {
    const W = innerWidth, H = innerHeight, n = st.night;
    g.setTransform(V.dpr * V.s, 0, 0, V.dpr * V.s, 0, 0);
    const top = mix([169, 215, 240], [14, 24, 48], n), bot = mix([247, 232, 198], [44, 62, 100], n);
    const sk = g.createLinearGradient(0, 0, 0, V.h); sk.addColorStop(0, rgb(top)); sk.addColorStop(0.62, rgb(bot)); sk.addColorStop(1, rgb(bot)); g.fillStyle = sk; g.fillRect(0, 0, V.w, V.h);
    if (n > 0.02) { g.globalAlpha = n; g.fillStyle = '#F1E9CF'; for (const s of stars) { g.beginPath(); g.arc(s.x * V.w, s.y * V.h, s.r, 0, 7); g.fill(); } g.beginPath(); g.arc(V.w * 0.8, V.h * 0.14, 15, 0, 7); g.fill(); g.fillStyle = rgb(top); g.beginPath(); g.arc(V.w * 0.8 + 7, V.h * 0.14 - 3, 13, 0, 7); g.fill(); g.globalAlpha = 1; }
    // nubes
    g.fillStyle = `rgba(255,255,255,${0.8 - n * 0.6})`; for (const cl of st.clouds) { g.beginPath(); g.ellipse(cl.x, cl.y, 34 * cl.k, 9 * cl.k, 0, 0, 7); g.ellipse(cl.x + 20 * cl.k, cl.y - 6 * cl.k, 22 * cl.k, 9 * cl.k, 0, 0, 7); g.fill(); }
    // colinas lejanas
    const gy = V.gy;
    const hill = (amp, off, col, k) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, gy); for (let x = 0; x <= V.w + 20; x += 20) g.lineTo(x, gy - 26 - amp * (0.5 + 0.5 * Math.sin((x + st.hills * k + off) * 0.012)) - amp * 0.3 * Math.sin((x + st.hills * k) * 0.031)); g.lineTo(V.w + 20, gy); g.fill(); };
    hill(44, 0, rgb(mix([160, 190, 190], [38, 56, 84], n)), 0.12); hill(30, 90, rgb(mix([126, 164, 150], [30, 52, 64], n)), 0.26);
    // pradera
    g.fillStyle = rgb(mix([157, 193, 147], [40, 70, 66], n)); g.fillRect(0, gy, V.w, V.h - gy);
    g.fillStyle = rgb(mix([134, 178, 126], [30, 58, 54], n)); g.fillRect(0, gy + 18, V.w, V.h - gy);
    g.strokeStyle = rgb(mix([108, 150, 100], [52, 84, 76], n)); g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, gy + 0.5); g.lineTo(V.w, gy + 0.5); g.stroke();
    // matas y flores que corren con el suelo
    for (const d of st.deco) { g.strokeStyle = d.f ? '#E9C0D0' : 'rgba(80,130,80,.85)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(d.x, gy + d.y); g.lineTo(d.x - 2, gy + d.y - 6); g.moveTo(d.x, gy + d.y); g.lineTo(d.x + 2, gy + d.y - 7); g.stroke(); if (d.f) { g.fillStyle = '#F4D36B'; g.beginPath(); g.arc(d.x + 2, gy + d.y - 7, 1.6, 0, 7); g.fill(); } }
    for (const t of st.trees) glDrawTree(g, t.x, gy, t.h, t.seed);
    glDrawHorse(g, hx(), gy + st.y, st.phase, st.air, st.vy, false);
    // noche encima, sutil
    if (n > 0.02) { g.fillStyle = `rgba(8,14,32,${n * 0.22})`; g.fillRect(0, 0, V.w, V.h); }
    // puntuación (como el dinosaurio: HI 00000 00000)
    g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    g.font = '600 22px ui-monospace, "SF Mono", Menlo, Consolas, monospace'; g.textAlign = 'right'; g.textBaseline = 'top';
    const col = n > 0.5 ? '#EDE3C5' : '#3A4A36'; const topY = 58;
    const show = st.flash > 0 ? (Math.floor(st.flash * 10) % 2 === 0) : true;
    g.fillStyle = col; g.globalAlpha = 0.55; g.fillText(`HI ${glPad(st.hi)}`, W - 20 - g.measureText(glPad(st.score) + '   ').width - 4, topY); g.globalAlpha = 1;
    if (show) g.fillText(glPad(st.score), W - 20, topY);
  };

  const loop = (now) => {
    if (!GL.run) return;
    st.id = requestAnimationFrame(loop);
    try { loopBody(now); } catch (err) { console.error('Galope', err); }
  };
  const loopBody = (now) => {
    if (!GL.run) return;
    const dt = Math.min(0.04, (now - st.last) / 1000); st.last = now;
    const n = st.night;
    if (st.state === 'run') {
      st.speed = Math.min(660, 270 + st.score * 0.38);
      st.dist += st.speed * dt; const before = Math.floor(st.score / 100); st.score += st.speed * dt * 0.045;
      if (Math.floor(st.score / 100) > before) { st.flash = 0.7; glTone(880, 0.09, 'square', 0.04); setTimeout(() => glTone(1100, 0.1, 'square', 0.04), 90); vib(15); }
      // día y noche
      const goal = Math.floor(st.score / 600) % 2 === 1 ? 1 : 0; st.nightGoal = goal;
      st.phase += dt * (1.6 + st.speed / 330);
      // salto
      if (st.air) { st.vy += (st.hold ? 1750 : 2600) * dt; st.y += st.vy * dt; if (st.y >= 0) { st.y = 0; st.vy = 0; st.air = false; } }
      // árboles
      for (const t of st.trees) t.x -= st.speed * dt; st.trees = st.trees.filter((t) => t.x > -90);
      if (st.dist >= st.next) spawn();
      // colisión: el caballo es un rectángulo un poco más pequeño que su dibujo
      const px = hx(), py = V.gy + st.y;
      for (const t of st.trees) {
        const tw = t.h * 0.3, top = V.gy - t.h * 0.86;
        const hxL = px - 18, hxR = px + 20, hyT = py - 46, hyB = py - 5;
        if (hxR > t.x - tw && hxL < t.x + tw && hyB > top && hyT < V.gy) { end(); break; }
      }
    } else if (st.state === 'idle') st.phase += dt * 0.6;
    if (st.flash > 0) st.flash = Math.max(0, st.flash - dt);
    st.night += Math.sign(st.nightGoal - st.night) * Math.min(Math.abs(st.nightGoal - st.night), dt * 0.45);
    // el mundo corre
    const sp = st.state === 'run' ? st.speed : 0;
    st.hills += sp * dt; for (const cl of st.clouds) { cl.x -= (6 + sp * 0.05) * cl.k * dt; if (cl.x < -60) { cl.x = V.w + 60; cl.y = 20 + Math.random() * V.h * 0.22; } }
    for (const d of st.deco) d.x -= sp * dt; st.deco = st.deco.filter((d) => d.x > -10);
    while (st.deco.length < 40) st.deco.push({ x: (st.deco.length ? Math.max(...st.deco.map((d) => d.x)) : 0) + 10 + Math.random() * 40, y: 8 + Math.random() * (V.h - V.gy - 12), f: Math.random() < 0.14 });
    draw();
  };
  st.id = requestAnimationFrame(loop);
}
