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
function glDrawHorse(g, x, y, phase, air, vy, blink, skin) {
  const SK = skin || (typeof glSkinCur === 'function' ? glSkinCur() : null) || {}; const now = performance.now();
  const coat = SK.coat || '#6A3D22', coat2 = SK.coat2 || '#4E2B17', hi = SK.hi || '#85502D', hoof = SK.hoof || '#17100a';
  let mane = SK.mane || '#241509'; if (Array.isArray(mane)) { const lg = g.createLinearGradient(-44, -40, 40, -62); mane.forEach((c, i) => lg.addColorStop(i / (mane.length - 1), c)); mane = lg; }
  g.save(); g.translate(x, y);
  if (SK.alpha) g.globalAlpha = SK.alpha;
  // sombra
  g.fillStyle = 'rgba(30,50,30,.22)'; g.beginPath(); g.ellipse(0, 1, air ? 18 : 28, 3.2, 0, 0, 7); g.fill();
  if (air) g.rotate(Math.max(-0.28, Math.min(0.3, vy * 0.00032)));
  const bob = air ? 0 : Math.sin(phase * 6.283 * 2) * 1.6;
  g.translate(0, bob);
  if (SK.aura) { const ag = g.createRadialGradient(4, -44, 10, 4, -44, 78); ag.addColorStop(0, SK.aura + 'AA'); ag.addColorStop(1, SK.aura + '00'); g.globalAlpha = (SK.alpha || 1) * (0.75 + 0.25 * Math.sin(now / 300)); g.fillStyle = ag; g.beginPath(); g.arc(4, -44, 78, 0, 7); g.fill(); g.globalAlpha = SK.alpha || 1; }
  // alas (detrás del cuerpo)
  if (SK.wings) {
    const flap = air ? Math.sin(now / 110) * 0.38 : Math.sin(phase * 6.283 * 2) * 0.14; const [w1, w2] = SK.wings;
    for (let i = 0; i < 7; i++) {
      const an = -2.55 + i * 0.3 + flap, len = 54 - i * 3.4; g.save(); g.translate(2, -46); g.rotate(an + Math.PI / 2 - 0.2);
      const fg = g.createLinearGradient(0, 0, 0, -len); fg.addColorStop(0, w1); fg.addColorStop(1, w2); g.fillStyle = fg; g.globalAlpha = (SK.alpha || 1) * 0.95;
      g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(7, -len * 0.3, 8, -len * 0.8, 0, -len); g.bezierCurveTo(-8, -len * 0.8, -7, -len * 0.3, 0, 0); g.fill(); g.restore();
    }
    g.globalAlpha = SK.alpha || 1;
  }
  // cola
  const sw = Math.sin(phase * 6.283 * 2 + 1) * 4;
  g.strokeStyle = mane; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-26, -40); g.bezierCurveTo(-38, -38 + sw, -44, -26 + sw, -42, -12 + sw); g.stroke();
  g.lineWidth = 2.6; g.beginPath(); g.moveTo(-26, -40); g.bezierCurveTo(-34, -36 + sw, -38, -24 + sw, -37, -10 + sw); g.stroke();
  if (SK.flame) { g.fillStyle = 'rgba(255,170,40,.55)'; for (let k = 0; k < 4; k++) { const f = Math.sin(now / 90 + k * 1.7) * 3; g.beginPath(); g.moveTo(-40 - k * 2, -22 + sw + k * 4); g.quadraticCurveTo(-52 - k * 3 + f, -18 + k * 4, -47 - k * 4, -6 + k * 5 + f); g.quadraticCurveTo(-42, -14 + k * 3, -40 - k * 2, -22 + sw + k * 4); g.fill(); } }
  // patas traseras y delanteras (dos segmentos)
  const leg = (hx, hy, p, col, front) => {
    let a1, a2;
    if (air) { a1 = front ? 0.85 : -0.8; a2 = front ? -0.5 : 0.7; }
    else { const s = Math.sin(p * 6.283); a1 = s * 0.75; a2 = Math.max(0, -Math.sin(p * 6.283 + 0.9)) * 1.05 * (front ? -1 : 1) + (front ? 0 : 0.2); }
    const x1 = hx + Math.sin(a1) * 17, y1 = hy + Math.cos(a1) * 17;
    const x2 = x1 + Math.sin(a1 + a2) * 17, y2 = Math.min(0, y1 + Math.cos(a1 + a2) * 17);
    g.strokeStyle = col; g.lineWidth = 5.4; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(x1, y1); g.lineTo(x2, y2); g.stroke();
    if (SK.sock) { g.strokeStyle = SK.sock; g.lineWidth = 5.6; g.beginPath(); g.moveTo(x1 * 0.4 + x2 * 0.6, y1 * 0.4 + y2 * 0.6); g.lineTo(x2, y2); g.stroke(); }
    g.fillStyle = hoof; g.beginPath(); g.ellipse(x2 + 0.5, y2, 3.2, 2.2, 0, 0, 7); g.fill();
  };
  leg(-17, -30, phase + 0.5, coat2, false); leg(14, -30, phase + 0.12, coat2, true);
  // cuerpo
  const body = new Path2D(); body.moveTo(-27, -36); body.bezierCurveTo(-28, -50, -8, -49, 8, -47); body.bezierCurveTo(20, -47, 28, -46, 30, -36); body.bezierCurveTo(28, -22, 14, -20, 0, -21); body.bezierCurveTo(-14, -20, -28, -22, -27, -36);
  const neck = new Path2D(); neck.moveTo(16, -46); neck.bezierCurveTo(24, -62, 30, -70, 36, -72); neck.lineTo(52, -62); neck.bezierCurveTo(54, -58, 52, -54, 48, -54); neck.bezierCurveTo(42, -54, 38, -50, 34, -40); neck.bezierCurveTo(28, -34, 22, -36, 16, -46);
  const gr = g.createLinearGradient(0, -52, 0, -18); gr.addColorStop(0, hi); gr.addColorStop(1, coat);
  g.fillStyle = gr; g.fill(body); g.fill(neck);
  if (SK.pat) {
    const P = SK.pc || '#fff';
    for (const path of [body, neck]) {
      g.save(); g.clip(path);
      if (SK.pat === 'spots') { g.fillStyle = P; for (const [px, py, r] of [[-14, -38, 3.4], [-2, -42, 2.6], [8, -36, 3.2], [18, -42, 2.4], [-8, -29, 2.6], [4, -27, 3], [22, -32, 2.2], [32, -62, 2], [26, -54, 2.4], [-20, -30, 2.2]]) { g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); } }
      else if (SK.pat === 'patches') { g.fillStyle = P; for (const [px, py, r] of [[-12, -38, 11], [10, -28, 9], [24, -44, 8], [30, -64, 8]]) { g.beginPath(); g.ellipse(px, py, r, r * 0.78, 0.4, 0, 7); g.fill(); } }
      else if (SK.pat === 'dapple') { g.strokeStyle = P; g.lineWidth = 2.2; g.globalAlpha *= 0.55; for (const [px, py] of [[-16, -38], [-4, -43], [8, -37], [-10, -28], [4, -26], [18, -42], [20, -30], [33, -64], [28, -54]]) { g.beginPath(); g.arc(px, py, 4.2, 0, 7); g.stroke(); } g.globalAlpha = SK.alpha || 1; }
      else if (SK.pat === 'stripes') { g.strokeStyle = P; g.lineWidth = 3; for (let i = -30; i < 60; i += 7) { g.beginPath(); g.moveTo(i, -75); g.lineTo(i - 9, -18); g.stroke(); } }
      else if (SK.pat === 'sheen') { const sh = (now / 8) % 140 - 40; const lg = g.createLinearGradient(sh - 18, -70, sh + 18, -20); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,.65)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.fillRect(-40, -90, 100, 80); }
      else if (SK.pat === 'frost') { g.fillStyle = 'rgba(255,255,255,.7)'; for (const [px, py, r] of [[-14, -36, 1.8], [-2, -44, 1.4], [10, -30, 2], [20, -42, 1.5], [32, -62, 1.4], [-8, -26, 1.2], [26, -52, 1.6]]) { g.globalAlpha = (SK.alpha || 1) * (0.5 + 0.5 * Math.sin(now / 240 + px)); g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); } g.globalAlpha = SK.alpha || 1; }
      else if (SK.pat === 'stars') { const lg = g.createLinearGradient(-30, -70, 40, -20); lg.addColorStop(0, '#5B3FD6'); lg.addColorStop(0.5, '#E03DD0'); lg.addColorStop(1, '#2F7BFF'); g.globalAlpha = 0.55; g.fillStyle = lg; g.fillRect(-40, -90, 100, 80); g.globalAlpha = SK.alpha || 1; g.fillStyle = '#fff'; for (const [px, py, r] of [[-16, -38, 1.6], [-4, -44, 1.2], [8, -32, 1.8], [18, -42, 1.3], [32, -63, 1.3], [-9, -27, 1.1], [24, -52, 1.5], [2, -38, 1], [-22, -34, 1.2]]) { g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(now / 280 + px * 2)); g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); } g.globalAlpha = SK.alpha || 1; }
      else if (SK.pat === 'fire') { for (let k = 0; k < 6; k++) { const px = -22 + k * 9, f = Math.sin(now / 100 + k) * 2; g.fillStyle = k % 2 ? 'rgba(255,214,90,.6)' : 'rgba(255,120,30,.5)'; g.beginPath(); g.moveTo(px - 5, -20); g.quadraticCurveTo(px - 3, -32 + f, px, -40 + f); g.quadraticCurveTo(px + 3, -30, px + 5, -20); g.fill(); } }
      g.restore();
    }
  }
  g.fillStyle = coat2; g.beginPath(); g.ellipse(50, -57, 4.6, 3.4, 0.5, 0, 7); g.fill();            // hocico
  if (SK.blaze) { g.strokeStyle = SK.blaze; g.lineWidth = 2.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(41, -71); g.lineTo(49, -59); g.stroke(); }
  g.fillStyle = coat; g.beginPath(); g.moveTo(36, -72); g.lineTo(37, -80); g.lineTo(42, -72); g.fill(); // oreja
  if (SK.horn) { const hg = g.createLinearGradient(40, -74, 49, -96); hg.addColorStop(0, SK.horn[0]); hg.addColorStop(1, SK.horn[1]); g.fillStyle = hg; g.beginPath(); g.moveTo(40, -73); g.lineTo(50, -97); g.lineTo(46, -71); g.fill(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(42, -78); g.lineTo(47, -80); g.moveTo(44, -84); g.lineTo(48, -86); g.moveTo(46, -90); g.lineTo(49, -91); g.stroke(); }
  g.fillStyle = SK.eye || '#120a05'; g.beginPath(); g.arc(42, -66, 1.5, 0, 7); g.fill();                         // ojo
  // crin
  g.fillStyle = mane; g.beginPath(); g.moveTo(34, -73); g.bezierCurveTo(24, -70, 18, -58, 12, -46 + sw * 0.2); g.bezierCurveTo(18, -50, 24, -56, 30, -62); g.bezierCurveTo(33, -66, 36, -68, 36, -72); g.fill();
  if (SK.flame) { for (let k = 0; k < 3; k++) { const f = Math.sin(now / 80 + k * 2) * 3; g.fillStyle = k === 1 ? 'rgba(255,230,120,.8)' : 'rgba(255,130,30,.7)'; g.beginPath(); g.moveTo(30 - k * 7, -64 + k * 7); g.quadraticCurveTo(28 - k * 8 + f, -80 + k * 7, 24 - k * 7, -86 + k * 6 + f); g.quadraticCurveTo(24 - k * 7, -72 + k * 6, 30 - k * 7, -64 + k * 7); g.fill(); } }
  // patas del lado cercano
  leg(-12, -30, phase + 0.62, coat, false); leg(18, -30, phase, coat, true);
  if (SK.spark) { g.fillStyle = SK.spark; for (let k = 0; k < 5; k++) { const t = ((now / 900 + k * 0.37) % 1), px = -30 + k * 20 + Math.sin(k * 3) * 8, py = -30 - t * 55; g.globalAlpha = (SK.alpha || 1) * (1 - t); const s2 = 2 + (k % 3); g.beginPath(); g.moveTo(px, py - s2 * 1.6); g.lineTo(px + s2 * 0.5, py - s2 * 0.5); g.lineTo(px + s2 * 1.6, py); g.lineTo(px + s2 * 0.5, py + s2 * 0.5); g.lineTo(px, py + s2 * 1.6); g.lineTo(px - s2 * 0.5, py + s2 * 0.5); g.lineTo(px - s2 * 1.6, py); g.lineTo(px - s2 * 0.5, py - s2 * 0.5); g.closePath(); g.fill(); } g.globalAlpha = SK.alpha || 1; }
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
  const st = { coinsF: [], got: 0, nextBonus: 500, state: 'idle', score: 0, speed: 0, y: 0, vy: 0, air: false, hold: false, dist: 0, trees: [], next: 360, hi: glBest(), flash: 0, night: 0, nightT: 0, nightGoal: 0, phase: 0, clouds: [], deco: [], last: performance.now(), id: 0, lastBlip: 0, hills: 0, over: 0, t0: performance.now() };
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

  const coinGet = (n, x, y, bonus) => { st.got += n; navCoins(n); st.pop = { t: 1, txt: bonus ? '+1 moneda · ¡500 puntos!' : '+1 moneda', x: Math.max(60, Math.min(V.w - 60, x)), y }; glTone(1318, 0.07, 'triangle', 0.05); setTimeout(() => glTone(1975, 0.1, 'triangle', 0.05), 70); vib(14); };
  const spawn = () => {
    const sc = st.score; const kinds = [[1, 40], [1, 60], [1, 50]];
    if (sc > 150) kinds.push([2, 46]);
    if (sc > 350) kinds.push([2, 62], [3, 42]);
    const [n, h] = kinds[Math.floor(Math.random() * kinds.length)];
    const gap = 44 + h * 0.3;
    for (let i = 0; i < n; i++) st.trees.push({ x: V.w + 40 + i * gap, h: h - i * 5 + (Math.random() * 8 - 4), seed: 'gt' + Math.random() });
    if (Math.random() < 0.3) { const cxm = V.w + 40 + ((n - 1) * gap) / 2; st.coinsF.push({ x: cxm, y: Math.min(112, Math.max(h + 48, 96)) + Math.random() * 6, ph: Math.random() * 6 }); }
    else if (Math.random() < 0.14) st.coinsF.push({ x: V.w + 40 + n * gap + 60, y: 22, ph: Math.random() * 6 });
    st.next = st.dist + Math.max(300, st.speed * (0.95 + Math.random() * 0.7)) + n * gap;
  };

  const end = async () => {
    if (st.state === 'over') return;
    st.state = 'over'; st.over = performance.now(); const sc = Math.floor(st.score);
    const secs = Math.max(1, Math.round((performance.now() - st.t0) / 1000));
    GL.rank = null;
    glTone(180, 0.35, 'sawtooth', 0.08, 60); vib([220, 80, 220]);
    if (sc > st.hi) { st.hi = sc; glSaveBest(sc); }
    wrap.querySelector('#glFin').textContent = `${sc} puntos${sc >= st.hi && sc > 0 ? ' · ¡nuevo récord!' : ` · récord ${st.hi}`}${st.got ? ` · +${st.got} ${st.got === 1 ? 'moneda' : 'monedas'} para tu árbol` : ''}`; over.hidden = false;
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
    Object.assign(st, { coinsF: [], got: 0, nextBonus: 500, state: 'run', score: 0, speed: 270, y: 0, vy: 0, air: false, dist: 0, trees: [], next: 360, flash: 0, night: 0, nightGoal: 0, nightT: 0, lastBlip: 0 });
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
    for (const c of st.coinsF) { const k = Math.abs(Math.cos(c.ph)), cy = gy - c.y; g.fillStyle = 'rgba(255,225,120,.28)'; g.beginPath(); g.arc(c.x, cy, 14, 0, Math.PI * 2); g.fill(); g.fillStyle = '#E8B23A'; g.strokeStyle = '#A8761A'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(c.x, cy, 2 + 7 * k, 8.5, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = '#FFE9A0'; g.beginPath(); g.ellipse(c.x, cy, 1 + 3.4 * k, 5.4, 0, 0, Math.PI * 2); g.fill(); }
    if (st.pop && st.pop.t > 0) { st.pop.t = Math.max(0, st.pop.t - 0.016); g.save(); g.globalAlpha = Math.min(1, st.pop.t * 2); g.font = '700 14px system-ui, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#C98E1C'; g.fillText(st.pop.txt, st.pop.x, st.pop.y - (1 - st.pop.t) * 26 - 12); g.restore(); }
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
      for (const c of st.coinsF) { c.x -= st.speed * dt; c.ph += dt * 7; }
      { const px0 = hx(), py0 = V.gy + st.y;
        for (const c of st.coinsF) if (!c.done && Math.abs(c.x - px0) < 26 && Math.abs((V.gy - c.y) - (py0 - 26)) < 30) { c.done = 1; coinGet(1, c.x, V.gy - c.y); } }
      st.coinsF = st.coinsF.filter((c) => !c.done && c.x > -30);
      if (st.score >= st.nextBonus) { st.nextBonus += 500; coinGet(1, hx(), V.gy - 70, true); }
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
