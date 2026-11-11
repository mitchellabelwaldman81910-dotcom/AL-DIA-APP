/* Cinnavia 7.16 — Cosecha: el minijuego.
   Del gran manzano caen manzanas: atrápalas con la canasta. Cada manzana vale 1 punto; de vez en cuando
   cae una manzana dorada que vale 5. No hay límite: cada vez caen más rápido. Si se te caen 3, termina.
   Rankings del día, de la semana, récord histórico de puntos y récord de manzanas atrapadas, con podio. */
'use strict';
const GAME = { run: null, raf: 0, rank: null, tab: 'dia' };
function viewJuego() {
  const nm = !REG.me || !tokens()[REG.me];
  return `<section class="gm-home"><div class="gm-hero">${gmHeroArt()}</div>
    <h1 class="page-title gm-title">Cosecha</h1><p class="page-sub">Atrapa las manzanas que caen del gran manzano. La normal vale <b>1</b>, la dorada vale <b>5</b>. Cada vez caen más rápido; si se te caen 3, se acaba. Si pierdes vidas, a veces cae una manzana verde curativa que te devuelve una. Cada 100 manzanas el paisaje cambia: pradera, jungla, desierto y montaña nevada.</p>
    <button class="btn primary block gm-play" data-act="gm-start">${icon('play')}Jugar</button>
    ${nm ? '<p class="small muted" style="text-align:center">Entra con tu usuario para aparecer en el ranking.</p>' : ''}
    <div id="gmRank">${gmRankHTML()}</div></section>`;
}
EXTRA_VIEWS.juego = viewJuego; EXTRA_NAV.juego = 'mas'; GROUP_VIEWS.juego = viewJuego; GROUP_NAV.juego = 'mas';
function gmHeroArt() {
  return `<svg viewBox="0 0 360 150" aria-hidden="true"><defs><linearGradient id="gmh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCE3B0"/><stop offset="1" stop-color="#F4F0E2"/></linearGradient></defs>
    <rect width="360" height="150" rx="18" fill="url(#gmh)"/><g class="gm-sun"><circle cx="300" cy="42" r="16" fill="#F6C55B"/>${Array.from({ length: 12 }, (_, i) => `<path d="M300 42m${(Math.cos(i * 0.5236) * 22).toFixed(1)} ${(Math.sin(i * 0.5236) * 22).toFixed(1)}l${(Math.cos(i * 0.5236) * 7).toFixed(1)} ${(Math.sin(i * 0.5236) * 7).toFixed(1)}" stroke="#F0B445" stroke-width="2" stroke-linecap="round"/>`).join('')}</g>
    <path d="M0 120L60 70L110 100L170 50L230 96L290 60L360 104V150H0Z" fill="#B7CDBB"/><path d="M0 132C80 110 160 136 240 118S330 112 360 120V150H0Z" fill="#8FB58F"/>
    <path d="M90 140V96" stroke="#6B4A2A" stroke-width="6" stroke-linecap="round"/><circle cx="90" cy="80" r="30" fill="#5E9A5E"/><circle cx="72" cy="92" r="18" fill="#6FAE69"/><circle cx="108" cy="90" r="20" fill="#6FAE69"/>
    <circle cx="80" cy="78" r="5" fill="#D9473A"/><circle cx="104" cy="84" r="5" fill="#D9473A"/><circle cx="92" cy="98" r="5" fill="#E8B83A"/>
    <g class="gm-drop"><circle cx="150" cy="70" r="6" fill="#D9473A"/><path d="M150 64v-4" stroke="#6B4A2A" stroke-width="1.6"/></g>
    <path d="M128 126h44l-6 18h-32z" fill="#C8955A" stroke="#8C6234" stroke-width="1.5"/><path d="M128 126c4-14 40-14 44 0" fill="none" stroke="#8C6234" stroke-width="2"/></svg>`;
}
function gmRankHTML() {
  const r = GAME.rank; const T = [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Manzanas']];
  const list = r ? r[GAME.tab] || [] : null;
  const val = (x) => (GAME.tab === 'manzanas' ? `${x.apples} manzanas` : `${x.score} pts`);
  const pod = list && list.length ? `<div class="gm-podium">${[1, 0, 2].map((i) => list[i] ? `<div class="gm-pod p${i + 1}">${avatar({ id: list[i].id, name: list[i].name, color: list[i].color })}<b>${esc(list[i].name)}</b><span>${val(list[i])}</span><i>${i + 1}</i></div>` : '<div class="gm-pod empty"></div>').join('')}</div>` : '';
  const rest = list && list.length > 3 ? `<ol class="gm-list" start="4">${list.slice(3, 20).map((x) => `<li class="${x.id === REG.me ? 'me' : ''}"><span>${esc(x.name)}</span><b>${val(x)}</b></li>`).join('')}</ol>` : '';
  const mine = r && r.me ? `<p class="small muted gm-mine">Tu mejor: <b>${r.me.best || 0} pts</b> · total atrapadas: <b>${r.me.total || 0}</b>${r.me.games ? ` · ${plural(r.me.games, 'partida', 'partidas')}` : ''}</p>` : '';
  if (!list) setTimeout(gmLoadRank, 10);
  return `<h2 class="sec">Ranking</h2><div class="seg full" role="group">${T.map(([k, l]) => `<button type="button" data-act="gm-tab" data-v="${k}" aria-pressed="${GAME.tab === k}">${l}</button>`).join('')}</div>
    ${list ? (list.length ? pod + rest : '<p class="small muted" style="text-align:center;margin-top:14px">Aún nadie juega en este periodo. ¡Sé la primera persona!</p>') : (typeof loaderHTML === 'function' ? loaderHTML('Cargando ranking…') : '')}${mine}`;
}
async function gmLoadRank() {
  if (!navigator.onLine) return;
  try { GAME.rank = await cloudFetch('GET', null, `kind=gamerank&as=${encodeURIComponent(REG.me || '')}`); const b = document.getElementById('gmRank'); if (b) b.innerHTML = gmRankHTML(); } catch { /* */ }
}
Object.assign(VIDA_ACTS, {
  'gm-tab': (el) => { GAME.tab = el.dataset.v; const b = document.getElementById('gmRank'); if (b) b.innerHTML = gmRankHTML(); },
  'gm-start': () => gmStart(),
});

/* ---------------- el juego ---------------- */
const GM_BIOMES = [
  { name: 'La pradera', sky: ['#9FD0EE', '#F9E1B8', '#F6EBD3'], m1: 'rgba(150,180,190,.7)', m2: 'rgba(126,164,150,.85)', g1: '#9DC193', g2: '#86B27E', pine: 'rgba(70,120,80,.75)', c1: '#7DBE6E', c2: '#3F7E45' },
  { name: 'La jungla', sky: ['#8FCBB4', '#CFE6B8', '#E4EFC4'], m1: 'rgba(86,142,118,.72)', m2: 'rgba(52,108,84,.88)', g1: '#5E9A5A', g2: '#4A8750', deco: 'palm', c1: '#5DAE63', c2: '#25663A', rays: true, vines: true },
  { name: 'El desierto', sky: ['#F2B36B', '#F8D9A0', '#F6E8C8'], m1: 'rgba(216,164,108,.72)', m2: 'rgba(200,142,84,.88)', g1: '#E2B676', g2: '#D6A55F', deco: 'cactus', c1: '#A3B96C', c2: '#6B8744' },
  { name: 'La montaña nevada', sky: ['#BCD5EA', '#E4EDF5', '#F4F6F8'], m1: 'rgba(138,160,186,.75)', m2: 'rgba(104,130,160,.88)', g1: '#EAF1F5', g2: '#D8E4EC', pine: 'rgba(52,96,84,.85)', snow: true, cap: 'rgba(255,255,255,.9)', c1: '#A5CDB0', c2: '#5E8F78' },
];
function gmStart() {
  if (GAME.run) return;
  const wrap = document.createElement('div'); wrap.className = 'gm-stage'; wrap.innerHTML = `<canvas id="gmC"></canvas>
    <div class="gm-hud"><span class="gm-score" id="gmScore">0</span><span class="gm-lives" id="gmLives"></span><button class="gm-x" id="gmX" aria-label="Salir">${icon('x')}</button></div><div class="gm-msg" id="gmMsg"></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  wrap.addEventListener('animationend', () => { wrap.style.animation = 'none'; }, { once: true });
  const c = wrap.querySelector('canvas'); const g = c.getContext('2d');
  const R = { w: 0, h: 0, dpr: Math.min(2, devicePixelRatio || 1) };
  const size = () => { if (innerWidth === R.w && innerHeight === R.h && bg) return; R.w = innerWidth; R.h = innerHeight; c.width = R.w * R.dpr; c.height = R.h * R.dpr; c.style.width = R.w + 'px'; c.style.height = R.h + 'px'; g.setTransform(R.dpr, 0, 0, R.dpr, 0, 0); scene(); };
  const st = { coinsF: [], coinT: 18 + Math.random() * 14, coinGot: 0, score: 0, apples: 0, golden: 0, lives: 3, apples_: [], parts: [], floats: [], t0: performance.now(), last: performance.now(), spawn: 0, combo: 0, over: false, bx: innerWidth / 2, tx: innerWidth / 2, squash: 0, shake: 0, sunA: 0, clouds: [], hang: [], biome: 0, fade: 0, lastHeal: -30 };
  GAME.run = st;
  // fondo pre-dibujado
  let bg = null, bgOld = null; const scene = (keep) => {
    const old = bg; const B = GM_BIOMES[st.biome || 0];
    bg = document.createElement('canvas'); bg.width = c.width; bg.height = c.height; const b = bg.getContext('2d'); b.setTransform(R.dpr, 0, 0, R.dpr, 0, 0);
    const W = R.w, H = R.h;
    const sky = b.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, B.sky[0]); sky.addColorStop(0.5, B.sky[1]); sky.addColorStop(1, B.sky[2]); b.fillStyle = sky; b.fillRect(0, 0, W, H);
    const mt = (y, amp, col, seed, cap) => { const r = rnd(seedOf('gm' + seed)); const pts = []; for (let x = 0; x <= W + 40; x += 40) pts.push([x, y - amp * (0.3 + r() * 0.7)]); b.fillStyle = col; b.beginPath(); b.moveTo(0, H); b.lineTo(0, y); for (const [x, yy] of pts) b.lineTo(x, yy); b.lineTo(W, H); b.closePath(); b.fill();
      if (cap) { b.fillStyle = cap; for (let k = 1; k < pts.length - 1; k++) if (pts[k][1] < pts[k - 1][1] && pts[k][1] < pts[k + 1][1]) { const [x, yy] = pts[k]; b.beginPath(); b.moveTo(x, yy); b.lineTo(x - 15, yy + 17); b.lineTo(x - 5, yy + 13); b.lineTo(x + 3, yy + 19); b.lineTo(x + 15, yy + 15); b.closePath(); b.fill(); } } };
    // montañas con picos, cara en sombra, nieve y neblina
    const ridge = (y, amp, col, seed, cap, haze) => {
      const r = rnd(seedOf('gmr' + seed)); const pts = []; const ph = [r() * 6, r() * 6, r() * 6];
      for (let x = -20; x <= W + 60; x += 22 + r() * 14) { const n = 0.5 * Math.sin(x * 0.004 + ph[0]) + 0.3 * Math.sin(x * 0.011 + ph[1]) + 0.2 * Math.sin(x * 0.027 + ph[2]); const pk = Math.pow(Math.abs(Math.sin(x * 0.0065 + ph[0] * 1.7)), 0.7); pts.push([x, y - amp * (0.18 + 0.42 * (n + 1) / 2 + 0.5 * pk * (0.6 + r() * 0.4))]); }
      b.fillStyle = col; b.beginPath(); b.moveTo(-20, H); for (const [x, yy] of pts) b.lineTo(x, yy); b.lineTo(W + 60, H); b.closePath(); b.fill();
      for (let k = 1; k < pts.length - 1; k++) if (pts[k][1] < pts[k - 1][1] && pts[k][1] < pts[k + 1][1]) {
        const [x, yy] = pts[k]; const nx = pts[k + 1]; const dn = Math.min(H, yy + amp * 0.9);
        b.fillStyle = 'rgba(20,30,50,.14)'; b.beginPath(); b.moveTo(x, yy); b.lineTo(nx[0], nx[1]); b.lineTo(nx[0], dn); b.lineTo(x - 6, dn); b.closePath(); b.fill();
        b.fillStyle = 'rgba(255,255,255,.07)'; b.beginPath(); b.moveTo(x, yy); b.lineTo(pts[k - 1][0], pts[k - 1][1]); b.lineTo(pts[k - 1][0], dn); b.lineTo(x - 6, dn); b.closePath(); b.fill();
        if (cap && yy < y - amp * 0.5) { const sw = 13 + (y - yy) * 0.16; b.fillStyle = cap; b.beginPath(); b.moveTo(x, yy); b.lineTo(x - sw, yy + sw * 1.05); b.lineTo(x - sw * 0.45, yy + sw * 0.8); b.lineTo(x - sw * 0.1, yy + sw * 1.3); b.lineTo(x + sw * 0.35, yy + sw * 0.85); b.lineTo(x + sw, yy + sw * 1.1); b.closePath(); b.fill(); }
      }
      const hz = b.createLinearGradient(0, y - amp, 0, y + amp * 0.5); hz.addColorStop(0, 'rgba(255,255,255,0)'); hz.addColorStop(1, `rgba(235,244,250,${haze})`); b.fillStyle = hz; b.fillRect(0, y - amp, W, amp * 1.6);
    };
    const capc = B.deco === 'cactus' ? null : (B.cap || 'rgba(255,255,255,.9)'); ridge(H * 0.6, H * 0.22, B.m1, 1, capc, 0.35); ridge(H * 0.69, H * 0.15, B.m2, 2, B.deco === 'cactus' ? null : B.cap, 0.22);
    // lago lejano
    b.fillStyle = 'rgba(150,200,230,.5)'; b.beginPath(); b.ellipse(W * 0.22, H * 0.705, W * 0.13, H * 0.012, 0, 0, Math.PI * 2); b.fill();
    b.fillStyle = B.g1; b.beginPath(); b.moveTo(0, H); b.lineTo(0, H * 0.82); b.bezierCurveTo(W * 0.3, H * 0.76, W * 0.7, H * 0.86, W, H * 0.8); b.lineTo(W, H); b.fill();
    // río que baja serpenteando desde las montañas
    { const wl = b.createLinearGradient(0, H * 0.7, 0, H); wl.addColorStop(0, 'rgba(150,205,235,.65)'); wl.addColorStop(1, 'rgba(110,175,215,.85)'); b.fillStyle = wl; b.beginPath(); b.moveTo(W * 0.62, H * 0.72); b.bezierCurveTo(W * 0.55, H * 0.78, W * 0.72, H * 0.83, W * 0.6, H * 0.9); b.bezierCurveTo(W * 0.56, H * 0.94, W * 0.7, H * 0.97, W * 0.66, H); b.lineTo(W * 0.8, H); b.bezierCurveTo(W * 0.84, H * 0.96, W * 0.72, H * 0.93, W * 0.74, H * 0.9); b.bezierCurveTo(W * 0.8, H * 0.84, W * 0.66, H * 0.79, W * 0.65, H * 0.72); b.closePath(); b.fill();
      b.strokeStyle = 'rgba(255,255,255,.35)'; b.lineWidth = 1.2; b.beginPath(); b.moveTo(W * 0.63, H * 0.74); b.bezierCurveTo(W * 0.6, H * 0.79, W * 0.72, H * 0.84, W * 0.66, H * 0.9); b.stroke(); }
    const r2 = rnd(seedOf('gmt')); for (let i = 0; i < 26; i++) {
      const x = r2() * W, y = H * (0.73 + r2() * 0.08), s = 0.5 + r2() * 0.75;
      if (B.deco === 'palm') { b.strokeStyle = '#5B4426'; b.lineWidth = 3 * s; b.beginPath(); b.moveTo(x, y + 4); b.quadraticCurveTo(x + 8 * s, y - 20 * s, x + 3 * s, y - 38 * s); b.stroke(); b.fillStyle = 'rgba(38,110,64,.85)'; for (let k = 0; k < 6; k++) { const an = -Math.PI / 2 + (k - 2.5) * 0.62; b.beginPath(); b.moveTo(x + 3 * s, y - 38 * s); b.quadraticCurveTo(x + 3 * s + Math.cos(an) * 20 * s, y - 38 * s + Math.sin(an) * 16 * s - 6, x + 3 * s + Math.cos(an) * 34 * s, y - 38 * s + Math.sin(an) * 24 * s + 12 * s); b.quadraticCurveTo(x + 3 * s + Math.cos(an) * 20 * s, y - 38 * s + Math.sin(an) * 16 * s + 2, x + 3 * s, y - 38 * s); b.fill(); } }
      else if (typeof gmDeco === 'function' && B.deco && B.deco !== 'cactus' && gmDeco(b, B, x, y, s)) { /* decoración del ambiente */ } else if (B.deco === 'cactus') { b.fillStyle = 'rgba(96,128,72,.9)'; const w = 6 * s; b.beginPath(); b.roundRect(x - w / 2, y - 34 * s, w, 38 * s, w / 2); b.fill(); b.beginPath(); b.roundRect(x - 13 * s, y - 24 * s, 5 * s, 14 * s, 2.5 * s); b.roundRect(x - 13 * s, y - 14 * s, 13 * s, 4 * s, 2); b.fill(); b.beginPath(); b.roundRect(x + 8 * s, y - 28 * s, 5 * s, 16 * s, 2.5 * s); b.roundRect(x, y - 14 * s, 13 * s, 4 * s, 2); b.fill(); }
      else { b.fillStyle = B.pine; b.beginPath(); b.moveTo(x, y - 34 * s); b.lineTo(x - 12 * s, y); b.lineTo(x + 12 * s, y); b.fill(); b.fillRect(x - 1.5, y, 3, 6 * s); if (B.snow) { b.fillStyle = 'rgba(255,255,255,.85)'; b.beginPath(); b.moveTo(x, y - 34 * s); b.lineTo(x - 6 * s, y - 18 * s); b.lineTo(x + 6 * s, y - 18 * s); b.fill(); } }
    }
    b.fillStyle = B.g2; b.beginPath(); b.moveTo(0, H); b.lineTo(0, H * 0.9); b.bezierCurveTo(W * 0.4, H * 0.86, W * 0.6, H * 0.93, W, H * 0.89); b.lineTo(W, H); b.fill();
    if (B.rays) { b.save(); b.globalAlpha = 0.16; b.fillStyle = '#FFF6C8'; for (const [x, w] of [[0.18, 0.07], [0.45, 0.05], [0.7, 0.08]]) { b.beginPath(); b.moveTo(W * x, 0); b.lineTo(W * (x + w), 0); b.lineTo(W * (x + w) - H * 0.2, H * 0.85); b.lineTo(W * x - H * 0.2, H * 0.85); b.fill(); } b.restore(); }
    // el gran manzano arriba
    b.fillStyle = '#6B4A2A'; b.fillRect(W * 0.5 - 14, -20, 28, H * 0.12);
    const crown = [[0.08, 0.06, 0.16], [0.28, 0.02, 0.2], [0.5, 0.0, 0.24], [0.72, 0.02, 0.2], [0.92, 0.06, 0.16], [0.18, 0.12, 0.14], [0.4, 0.11, 0.15], [0.62, 0.11, 0.15], [0.82, 0.12, 0.14]];
    for (const [x, y, r] of crown) { const gr = b.createRadialGradient(W * x - 10, H * y - 10, 4, W * x, H * y, W * r); gr.addColorStop(0, B.c1); gr.addColorStop(1, B.c2); b.fillStyle = gr; b.beginPath(); b.arc(W * x, H * y, W * r, 0, Math.PI * 2); b.fill(); }
    if (B.vines) { const r4 = rnd(seedOf('gmv')); b.strokeStyle = 'rgba(40,100,56,.75)'; b.lineWidth = 2.2; b.lineCap = 'round'; for (let i = 0; i < 14; i++) { const x = W * (0.04 + r4() * 0.92), l = H * (0.07 + r4() * 0.12); b.beginPath(); b.moveTo(x, H * 0.14); b.bezierCurveTo(x + 6, H * 0.14 + l * 0.4, x - 6, H * 0.14 + l * 0.7, x + 2, H * 0.14 + l); b.stroke(); b.fillStyle = 'rgba(52,126,70,.8)'; b.beginPath(); b.ellipse(x + 2, H * 0.14 + l, 4, 7, 0.3, 0, Math.PI * 2); b.fill(); } }
    const r3 = rnd(seedOf('gml')); b.strokeStyle = 'rgba(255,255,255,.18)'; b.lineWidth = 1.2; for (let i = 0; i < 70; i++) { const x = r3() * W, y = r3() * H * 0.2; b.beginPath(); b.ellipse(x, y, 7, 3.5, r3() * 3, 0, Math.PI * 2); b.stroke(); }
    st.treeBottom = H * 0.2;
    if (keep) { bgOld = old; st.fade = 1; }
  };
  size(); addEventListener('resize', size);
  for (let i = 0; i < 4; i++) st.clouds.push({ x: Math.random() * R.w, y: R.h * 0.25 + Math.random() * R.h * 0.14, s: 0.6 + Math.random() * 0.7, v: 6 + Math.random() * 10 });
  // controles
  const move = (x) => { st.tx = Math.max(40, Math.min(R.w - 40, x)); };
  c.addEventListener('pointerdown', (e) => { move(e.clientX); c.setPointerCapture(e.pointerId); Snd.ac && Snd.ac(); });
  c.addEventListener('pointermove', (e) => { if (e.buttons || e.pointerType === 'touch') move(e.clientX); });
  const key = (e) => { if (e.key === 'ArrowLeft') st.tx -= 46; if (e.key === 'ArrowRight') st.tx += 46; st.tx = Math.max(40, Math.min(R.w - 40, st.tx)); };
  addEventListener('keydown', key);
  try { history.pushState({ gmGame: true }, ''); } catch { /* */ }
  const onPop = () => { if (GAME.run) { try { history.pushState({ gmGame: true }, ''); } catch { /* */ } } };
  addEventListener('popstate', onPop);
  wrap.addEventListener('touchstart', (e) => { if (!e.target.closest('button')) e.preventDefault(); }, { passive: false });
  wrap.querySelector('#gmX').addEventListener('click', () => end(true));
  const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* */ } };
  const flash = (k) => { wrap.classList.remove('gm-ok', 'gm-gold', 'gm-miss'); void wrap.offsetWidth; wrap.classList.add(k); clearTimeout(flash.t); flash.t = setTimeout(() => wrap.classList.remove(k), 480); };
  const lives = () => { document.getElementById('gmLives').innerHTML = Array.from({ length: 3 }, (_, i) => `<i class="${i < st.lives ? 'on' : ''}"></i>`).join(''); };
  lives();
  const msg = (t, ms = 1200) => { const m = document.getElementById('gmMsg'); m.textContent = t; m.classList.remove('show'); void m.offsetWidth; m.classList.add('show'); clearTimeout(msg.t); msg.t = setTimeout(() => m.classList.remove('show'), ms); };
  msg('¡Atrapa las manzanas!', 1600);
  const level = () => 1 + st.apples / 12;
  const spawn = () => {
    const gold = Math.random() < Math.min(0.09, 0.035 + st.apples * 0.0004);
    const live = () => st.hang.length + st.apples_.filter((a) => !a.done).length;
    if (live() >= 1) return false; // una sola manzana a la vez, siempre
    const heal = !gold && st.lives < 3 && st.apples - st.lastHeal >= 30 && Math.random() < 0.03; if (heal) st.lastHeal = st.apples;
    const y = st.treeBottom * (0.35 + Math.random() * 0.55);
    // elige el lugar más alejado de las manzanas que ya están cayendo, para que no caigan encimadas
    let x = 30 + Math.random() * (R.w - 60), best = -1;
    for (let k = 0; k < 8; k++) { const cx = 30 + Math.random() * (R.w - 60); let md = 1e9; for (const o of [...st.hang, ...st.apples_.filter((a) => !a.done)]) md = Math.min(md, Math.hypot(o.x - cx, (o.y - y) * 0.5)); if (md > best) { best = md; x = cx; } }
    st.hang.push({ x, y, gold, heal, t: 0, wob: 0.32 - Math.min(0.18, level() * 0.012) });
    return true;
  };
  const loop = (now) => {
    if (!GAME.run) return;
    GAME.raf = requestAnimationFrame(loop);
    try { loopBody(now); } catch (err) { console.error('Cosecha', err); }
  };
  const loopBody = (now) => {
    if (!GAME.run) return;
    const dt = Math.min(0.05, (now - st.last) / 1000); st.last = now;
    const W = R.w, H = R.h; const lv = level();
    st.spawn -= dt; if (st.spawn <= 0 && !st.over) { if (spawn()) st.spawn = Math.max(0.12, 0.45 - lv * 0.035) * (0.8 + Math.random() * 0.4); else st.spawn = 0.05; }
    // manzanas que tiemblan antes de caer
    for (const a of st.hang) a.t += dt;
    for (const a of st.hang.filter((a) => a.t >= a.wob)) st.apples_.push({ x: a.x, y: a.y, vx: (Math.random() - 0.5) * 20 * Math.min(3, lv / 2), vy: 110, gold: a.gold, heal: a.heal, r: a.gold ? 15 : 14, rot: 0, vr: (Math.random() - 0.5) * 4 });
    st.hang = st.hang.filter((a) => a.t < a.wob);
    st.bx += (st.tx - st.bx) * Math.min(1, dt * 18);
    const by = H * 0.86, bw = Math.min(120, W * 0.28);
    const grav = 600 + lv * 70;
    for (const a of st.apples_) {
      a.vy += grav * dt; a.y += a.vy * dt; a.x += a.vx * dt; a.rot += a.vr * dt; if (a.x < 16 || a.x > W - 16) a.vx *= -1;
      if (!a.done && a.y + a.r >= by - 6 && (a.y + a.r) - a.vy * dt <= by + 14 && Math.abs(a.x - st.bx) < bw / 2 + 4) {
        a.done = 'catch'; const pts = a.heal ? 0 : a.gold ? 5 : 1; st.score += pts; if (!a.heal) st.apples++; if (a.gold) st.golden++; st.combo++; st.squash = 1;
        st.floats.push({ x: a.x, y: by - 30, t: 0, txt: a.heal ? '+1 ♥' : `+${pts}`, gold: a.gold, heal: a.heal });
        for (let i = 0; i < (a.gold ? 26 : 12); i++) st.parts.push({ x: a.x, y: by - 10, vx: (Math.random() - 0.5) * 260, vy: -80 - Math.random() * 260, t: 0, life: 0.7 + Math.random() * 0.5, gold: a.gold, leaf: Math.random() < 0.4 });
        vib(a.gold ? [30, 40, 30, 40, 60] : 18); flash(a.gold ? 'gm-gold' : 'gm-ok');
        if (a.heal) { st.lives = Math.min(3, st.lives + 1); lives(); msg('¡Manzana curativa! +1 vida', 1400); gmSound('heal'); vib([20, 40, 20, 40, 80]); flash('gm-ok'); }
        else gmSound(a.gold ? 'gold' : 'catch', st.combo);
        if (!a.heal && st.apples > 0 && st.apples % 100 === 0) { st.biome = Math.min(GM_BIOMES.length - 1, Math.floor(st.apples / 100)); scene(true); setTimeout(() => msg(GM_BIOMES[st.biome].name + (GM_FRUITS[GM_BIOMES[st.biome].fruit] ? ' · ' + GM_FRUITS[GM_BIOMES[st.biome].fruit].n : ''), 2200), 900); }
        if (st.combo && st.combo % 10 === 0) { msg(`¡${st.combo} seguidas!`); gmSound('combo', st.combo); }
        else if (a.gold) msg('¡Manzana dorada! +5', 900);
        if (st.apples % 25 === 0) msg('¡Más rápido!', 1000);
        document.getElementById('gmScore').textContent = st.score; document.getElementById('gmScore').classList.remove('bump'); void document.getElementById('gmScore').offsetWidth; document.getElementById('gmScore').classList.add('bump');
      }
      if (!a.done && a.y - a.r > H && a.heal) a.done = 'gone';
      if (!a.done && a.y - a.r > H) { a.done = 'miss'; st.lives--; st.combo = 0; st.shake = 0.35; vib([220, 90, 220]); flash('gm-miss'); gmSound('miss'); lives(); if (st.lives <= 0) { st.over = true; setTimeout(() => end(false), 700); } else msg(st.lives === 1 ? '¡Cuidado, última!' : 'Se cayó una…', 900); }
    }
    st.apples_ = st.apples_.filter((a) => !a.done);
    // moneda rara: cae despacio, no cuesta vida si se escapa
    if (!st.over && st.apples >= 5) { st.coinT -= dt; if (st.coinT <= 0) { st.coinT = 32 + Math.random() * 40; st.coinsF.push({ x: 30 + Math.random() * (W - 60), y: -16, vy: 50, ph: Math.random() * 6 }); } }
    for (const c of st.coinsF) {
      c.vy = Math.min(210, c.vy + 120 * dt); c.y += c.vy * dt; c.ph += dt * 7;
      if (!c.done && c.y + 11 >= by - 6 && c.y < by + 14 && Math.abs(c.x - st.bx) < bw / 2 + 8) { c.done = 1; st.coinGot++; navCoins(1); st.floats.push({ x: c.x, y: by - 34, t: 0, txt: '+1 moneda', gold: true }); gmSound('gold'); vib(25); msg('¡Una moneda para tu árbol!', 1100); for (let i = 0; i < 10; i++) st.parts.push({ x: c.x, y: by - 10, vx: (Math.random() - 0.5) * 220, vy: -60 - Math.random() * 200, t: 0, life: 0.6 + Math.random() * 0.4, gold: true }); }
      else if (c.y > H + 20) c.done = 1;
    }
    st.coinsF = st.coinsF.filter((c) => !c.done);
    for (const p of st.parts) { p.t += dt; p.vy += 520 * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
    st.parts = st.parts.filter((p) => p.t < p.life);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 0.9);
    st.squash = Math.max(0, st.squash - dt * 5); st.shake = Math.max(0, st.shake - dt);
    st.sunA += dt * 0.25;
    // lluvia suave (solo ambiente: no toca manzanas ni canasta)
    const GB = GM_BIOMES[st.biome || 0]; if (GB.rain === false) { st.rainLeft = 0; if (st.rainT == null || st.rainT < 5) st.rainT = 20; }
    st.rainT = (st.rainT ?? 25 + Math.random() * 25) - dt;
    if (st.rainT <= 0) { if (!st.rainLeft) { st.rainLeft = 14 + Math.random() * 10; st.rainT = 1e9; } }
    if (st.rainLeft > 0) { st.rainLeft -= dt; if (st.rainLeft <= 0) { st.rainLeft = 0; st.rainT = 40 + Math.random() * 40; } }
    st.rainK = Math.max(0, Math.min(1, (st.rainK || 0) + (st.rainLeft > 0 ? dt / 2.5 : -dt / 2.5)));
    if (st.rainK > 0) { const want = Math.round(70 * st.rainK); const dr = (st.drops ||= []); while (dr.length < want) dr.push({ x: Math.random() * W, y: Math.random() * H, v: 620 + Math.random() * 260, l: 9 + Math.random() * 9 }); if (dr.length > want) dr.length = want; for (const d of dr) { d.y += d.v * dt; d.x -= d.v * 0.12 * dt; if (d.y > H) { d.y = -20; d.x = Math.random() * (W + 60); } } }
    // ---- dibujo ----
    g.save(); if (st.shake) g.translate((Math.random() - 0.5) * 10 * st.shake, 0);
    g.drawImage(bg, 0, 0, W, H); if (st.fade > 0 && bgOld) { st.fade = Math.max(0, st.fade - dt / 1.4); g.globalAlpha = st.fade; g.drawImage(bgOld, 0, 0, W, H); g.globalAlpha = 1; }
    // sol girando
    const NB = GM_BIOMES[st.biome || 0].night; const sx = W * 0.82, sy = H * 0.3, sr = Math.min(W, H) * 0.06;
    if (NB) { if (typeof gmMoon === 'function') gmMoon(g, sx, sy, sr, now); } else {
    const halo = g.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 4); halo.addColorStop(0, 'rgba(255,220,140,.55)'); halo.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = halo; g.beginPath(); g.arc(sx, sy, sr * 4, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(sx, sy); g.rotate(st.sunA); g.strokeStyle = 'rgba(240,180,70,.85)'; g.lineWidth = 3; g.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const an = (i / 16) * Math.PI * 2; const r1 = sr * 1.35, r2 = sr * (i % 2 ? 1.75 : 2.05); g.beginPath(); g.moveTo(Math.cos(an) * r1, Math.sin(an) * r1); g.lineTo(Math.cos(an) * r2, Math.sin(an) * r2); g.stroke(); }
    g.restore(); const sg = g.createRadialGradient(sx - sr * 0.3, sy - sr * 0.3, 2, sx, sy, sr); sg.addColorStop(0, '#FFF1C2'); sg.addColorStop(1, '#F6B848'); g.fillStyle = sg; g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
    }
    // nubes
    for (const cl of st.clouds) { cl.x += cl.v * dt; if (cl.x > W + 80) cl.x = -80; g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.ellipse(cl.x, cl.y, 34 * cl.s, 12 * cl.s, 0, 0, Math.PI * 2); g.ellipse(cl.x + 18 * cl.s, cl.y - 8 * cl.s, 20 * cl.s, 12 * cl.s, 0, 0, Math.PI * 2); g.ellipse(cl.x - 16 * cl.s, cl.y - 4 * cl.s, 16 * cl.s, 10 * cl.s, 0, 0, Math.PI * 2); g.fill(); }
    if (st.rainK > 0) { g.fillStyle = `rgba(40,70,100,${0.16 * st.rainK})`; g.fillRect(0, 0, W, H); g.strokeStyle = `rgba(210,230,250,${0.5 * st.rainK})`; g.lineWidth = 1.2; g.beginPath(); for (const d of st.drops) { g.moveTo(d.x, d.y); g.lineTo(d.x + d.l * 0.12, d.y - d.l); } g.stroke(); }
    if (typeof gmFx === 'function') gmFx(g, st, GB, dt, W, H, now);
    // manzanas colgando (tiemblan)
    for (const a of st.hang) { const wob = Math.sin(a.t * 40) * 3 * (a.t / a.wob); gmApple(g, a.x + wob, a.y, a.gold ? 15 : 14, a.gold, 0, now, a.heal); }
    for (const a of st.apples_) gmApple(g, a.x, a.y, a.r, a.gold, a.rot, now, a.heal);
    for (const c of st.coinsF) { const k = Math.abs(Math.cos(c.ph)); const hl = g.createRadialGradient(c.x, c.y, 2, c.x, c.y, 26); hl.addColorStop(0, 'rgba(255,225,120,.55)'); hl.addColorStop(1, 'rgba(255,225,120,0)'); g.fillStyle = hl; g.beginPath(); g.arc(c.x, c.y, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = '#E8B23A'; g.strokeStyle = '#A8761A'; g.lineWidth = 2; g.beginPath(); g.ellipse(c.x, c.y, 3 + 9 * k, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = '#FFE9A0'; g.beginPath(); g.ellipse(c.x, c.y, 1.5 + 5 * k, 8, 0, 0, Math.PI * 2); g.fill(); }
    // canasta
    gmBasket(g, st.bx, by, bw, st.squash);
    // partículas
    for (const p of st.parts) { const al = 1 - p.t / p.life; g.globalAlpha = al; if (p.leaf) { g.fillStyle = '#5E9A5E'; g.save(); g.translate(p.x, p.y); g.rotate(p.t * 8); g.beginPath(); g.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2); g.fill(); g.restore(); } else { g.fillStyle = p.gold ? '#FFD45E' : '#FFF3C8'; g.beginPath(); g.arc(p.x, p.y, p.gold ? 3.2 : 2.4, 0, Math.PI * 2); g.fill(); } }
    g.globalAlpha = 1;
    for (const f of st.floats) { g.globalAlpha = 1 - f.t / 0.9; g.font = `700 ${f.gold ? 30 : 24}px "Cormorant Garamond", Georgia, serif`; g.textAlign = 'center'; g.fillStyle = f.gold ? '#C9921F' : '#2F6B3F'; g.fillText(f.txt, f.x, f.y - f.t * 60); }
    g.globalAlpha = 1; g.restore();
  };
  GAME.raf = requestAnimationFrame(loop);
  async function end(quit) {
    if (!GAME.run) return; cancelAnimationFrame(GAME.raf); removeEventListener('resize', size); removeEventListener('keydown', key); removeEventListener('popstate', onPop);
    const res = { score: st.score, apples: st.apples, golden: st.golden, dur: Math.round((performance.now() - st.t0) / 1000) };
    GAME.run = null;
    if (quit && !st.score) { wrap.remove(); document.body.classList.remove('gm-on'); return; }
    gmSound('over');
    // el resultado aparece al instante; el ranking llega después, si la red responde
    const local = Math.max(st.score, +(localStorage.getItem('aldia:gmbest') || 0));
    try { localStorage.setItem('aldia:gmbest', String(local)); } catch { /* */ }
    const paint = (rec) => {
      const best = rec ? rec.best : local;
      const tmp = document.createElement('div');
      tmp.innerHTML = `<div class="gm-over"><div class="gm-card"><span class="gm-k">${rec && rec.newBest ? '¡Nuevo récord!' : 'Fin de la cosecha'}</span><b class="gm-big">${st.score}</b><span class="gm-sub">${plural(st.apples, 'manzana', 'manzanas')}${st.golden ? ` · ${plural(st.golden, 'dorada', 'doradas')}` : ''}</span>${st.coinGot ? `<span class="gm-sub">+${plural(st.coinGot, 'moneda', 'monedas')} para tu árbol de Navidad</span>` : ''}
        <p class="gm-best">Tu mejor: <b>${best}</b>${rec && rec.rankDay ? ` · lugar <b>#${rec.rankDay}</b> de hoy` : ''}</p>
        <div class="btn-row" style="justify-content:center"><button class="btn primary" id="gmAgain">${icon('play', 'sm')}Otra vez</button><button class="btn" id="gmOut">Ver ranking</button></div></div></div>`;
      const nu = tmp.firstElementChild; const old = wrap.querySelector('.gm-over');
      if (old) old.replaceWith(nu); else wrap.appendChild(nu);
      nu.querySelector('#gmAgain').addEventListener('click', () => { wrap.remove(); document.body.classList.remove('gm-on'); gmStart(); });
      nu.querySelector('#gmOut').addEventListener('click', () => { wrap.remove(); document.body.classList.remove('gm-on'); GAME.rank = null; if (location.hash !== '#/juego') location.hash = '#/juego'; else render(); });
    };
    paint(null);
    if (REG.me && tokens()[REG.me] && st.score > 0) {
      const limit = new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 6000));
      try {
        const rec = await Promise.race([cloudFetch('POST', { kind: 'game', as: REG.me, ...res }), limit]);
        if (rec && wrap.isConnected) { paint(rec); if (rec.newBest) confetti(innerWidth / 2, innerHeight / 3, 80); }
      } catch { (REG.gameout ||= []).push(res); saveReg(); }
    }
  }
}
function gmApple(g, x, y, r, gold, rot, now, heal) {
  g.save(); g.translate(x, y); g.rotate(rot);
  if (heal) { const pu = 0.75 + 0.25 * Math.sin(now / 200); const hl = g.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.6); hl.addColorStop(0, `rgba(150,240,190,${0.6 * pu})`); hl.addColorStop(1, 'rgba(150,240,190,0)'); g.fillStyle = hl; g.beginPath(); g.arc(0, 0, r * 2.6, 0, Math.PI * 2); g.fill(); }
  if (gold) { const hl = g.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 2.6); hl.addColorStop(0, 'rgba(255,215,90,.55)'); hl.addColorStop(1, 'rgba(255,215,90,0)'); g.fillStyle = hl; g.beginPath(); g.arc(0, 0, r * 2.6, 0, Math.PI * 2); g.fill(); }
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
  if (heal) { gr.addColorStop(0, '#D8F8C8'); gr.addColorStop(0.45, '#4CB86B'); gr.addColorStop(1, '#1F7440'); } else if (gold) { gr.addColorStop(0, '#FFF6C9'); gr.addColorStop(0.45, '#F5C842'); gr.addColorStop(1, '#B98314'); } else { gr.addColorStop(0, '#FF8A7A'); gr.addColorStop(0.5, '#E0362C'); gr.addColorStop(1, '#9E1F1A'); }
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -r * 0.7); g.bezierCurveTo(r * 0.9, -r * 1.25, r * 1.35, r * 0.2, r * 0.55, r * 0.95); g.bezierCurveTo(r * 0.25, r * 1.1, -r * 0.25, r * 1.1, -r * 0.55, r * 0.95); g.bezierCurveTo(-r * 1.35, r * 0.2, -r * 0.9, -r * 1.25, 0, -r * 0.7); g.fill();
  g.strokeStyle = '#5B3A1E'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -r * 0.65); g.quadraticCurveTo(2, -r * 1.1, 4, -r * 1.3); g.stroke();
  g.fillStyle = '#5E9A3E'; g.beginPath(); g.ellipse(r * 0.45, -r * 1.05, r * 0.42, r * 0.18, -0.5, 0, Math.PI * 2); g.fill();
  if (heal) { g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(-r * 0.12, -r * 0.1, r * 0.24, r * 0.78); g.fillRect(-r * 0.39, r * 0.17, r * 0.78, r * 0.24); }
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.28, r * 0.18, r * 0.3, -0.5, 0, Math.PI * 2); g.fill();
  if (gold) { const tw = (Math.sin(now / 120) + 1) / 2; g.fillStyle = `rgba(255,255,255,${0.5 + tw * 0.5})`; for (const [sx, sy] of [[r * 0.9, -r * 0.8], [-r * 1.1, r * 0.2]]) { g.beginPath(); g.moveTo(sx, sy - 5); g.lineTo(sx + 1.5, sy - 1.5); g.lineTo(sx + 5, sy); g.lineTo(sx + 1.5, sy + 1.5); g.lineTo(sx, sy + 5); g.lineTo(sx - 1.5, sy + 1.5); g.lineTo(sx - 5, sy); g.lineTo(sx - 1.5, sy - 1.5); g.fill(); } }
  g.restore();
}
function gmBasket(g, x, y, w, sq) {
  const h = w * 0.42 * (1 - sq * 0.12), ww = w * (1 + sq * 0.08);
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(0, h + 6, ww * 0.55, 7, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#8C6234'; g.lineWidth = 4; g.beginPath(); g.moveTo(-ww * 0.42, 0); g.bezierCurveTo(-ww * 0.4, -h * 1.2, ww * 0.4, -h * 1.2, ww * 0.42, 0); g.stroke();
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#E2B27A'); gr.addColorStop(1, '#A8743E'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(-ww / 2, 0); g.lineTo(ww / 2, 0); g.lineTo(ww * 0.38, h); g.lineTo(-ww * 0.38, h); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(110,70,30,.55)'; g.lineWidth = 1.6;
  for (let i = 1; i < 4; i++) { const yy = (h * i) / 4; const k = 1 - (i / 4) * 0.24; g.beginPath(); g.moveTo(-ww / 2 * k, yy); g.lineTo(ww / 2 * k, yy); g.stroke(); }
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo((ww / 7) * i, 0); g.lineTo((ww / 7) * i * 0.76, h); g.stroke(); }
  g.fillStyle = '#C8955A'; g.fillRect(-ww / 2 - 3, -4, ww + 6, 8); g.strokeStyle = '#8C6234'; g.lineWidth = 1.5; g.strokeRect(-ww / 2 - 3, -4, ww + 6, 8);
  g.restore();
}
function gmSound(kind, combo = 0) {
  if (!Snd.on()) return; const c = Snd.ac(); if (!c) return;
  if (kind === 'catch') { const base = 523.25 * Math.pow(2, Math.min(12, combo % 13) / 12); Snd.mar(base, 0, 0.07, 0.5); Snd.mar(base * 2, 0.03, 0.025, 0.3); }
  else if (kind === 'gold') { [0, 4, 7, 12, 16].forEach((s, i) => Snd.mar(659.25 * Math.pow(2, s / 12), i * 0.05, 0.06, 0.9)); }
  else if (kind === 'heal') { [0, 7, 12, 16, 19].forEach((s, i) => Snd.mar(440 * Math.pow(2, s / 12), i * 0.08, 0.06, 1.1)); }
  else if (kind === 'combo') { [0, 7, 12, 19].forEach((s, i) => Snd.mar(523.25 * Math.pow(2, s / 12), i * 0.07, 0.05, 1)); }
  else if (kind === 'miss') { const o = c.createOscillator(), gn = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(220, c.currentTime); o.frequency.exponentialRampToValueAtTime(90, c.currentTime + 0.25); gn.gain.setValueAtTime(0.0001, c.currentTime); gn.gain.exponentialRampToValueAtTime(0.12, c.currentTime + 0.01); gn.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.3); o.connect(gn).connect(c.destination); o.start(); o.stop(c.currentTime + 0.32); }
  else if (kind === 'over') { [12, 7, 4, 0].forEach((s, i) => Snd.mar(392 * Math.pow(2, s / 12), i * 0.12, 0.05, 1.2)); }
}
window.addEventListener('online', async () => { const out = REG.gameout || []; if (!out.length) return; REG.gameout = []; for (const r of out) { try { await cloudFetch('POST', { kind: 'game', as: REG.me, ...r }); } catch { REG.gameout.push(r); } } saveReg(); });

/* ---------------- Compartir la app ---------------- */
function viewCompartir() {
  const url = location.origin + '/'; const text = `Te recomiendo Cinnavia: una app para organizar tus tareas, estudiar con libretas y quizzes, y hacer crecer tu propio árbol. Entra aquí y agrégala a tu pantalla de inicio: ${url}`;
  return `<a class="back" href="#/mas">${icon('back')}Más</a><section class="share-hero"><img src="icons/icon-192.png" alt="" width="96" height="96"><h1 class="page-title">Comparte Cinnavia</h1><p class="page-sub">Invita a tus compañeros: juntos pueden crear un Bosque, competir en la Cosecha y ayudarse en la Biblioteca.</p></section>
    <div class="share-btns"><a class="btn primary block share-wa" href="https://wa.me/?text=${encodeURIComponent(text)}" target="_blank" rel="noopener">${icon('chat')}Mandar por WhatsApp</a>
      <button class="btn block" data-act="share-native">${icon('share')}Compartir de otra forma</button>
      <button class="btn block" data-act="share-copy">${icon('copy')}Copiar enlace</button></div>
    <p class="small muted" style="text-align:center;margin-top:12px">${esc(url)}</p>`;
}
EXTRA_VIEWS.compartir = viewCompartir; EXTRA_NAV.compartir = 'mas'; GROUP_VIEWS.compartir = viewCompartir; GROUP_NAV.compartir = 'mas';
Object.assign(VIDA_ACTS, {
  'share-native': async () => { const url = location.origin + '/'; try { if (navigator.share) await navigator.share({ title: 'Cinnavia', text: 'Te recomiendo Cinnavia para organizar la escuela y estudiar mejor.', url }); else { await navigator.clipboard.writeText(url); toast('Enlace copiado.'); } } catch { /* cancelado */ } },
  'share-copy': async () => { try { await navigator.clipboard.writeText(location.origin + '/'); toast('Enlace copiado. Pégalo donde quieras.'); Snd.tick(); } catch { toast(location.origin + '/'); } },
});
