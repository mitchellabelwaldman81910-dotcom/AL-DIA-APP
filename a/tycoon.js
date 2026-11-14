/* Cinnavia 7.61 — Heladería Tycoon.
   Tu propia heladería: las máquinas preparan helados solas, pero los clientes los tienes que atender tú
   (toca a cada cliente; si tardas, se van). Con las ganancias subes de nivel las máquinas, desbloqueas sabores,
   contratas ayudantes, compras mejoras y decoración, abres sucursales (playa, ciudad, montaña y la Luna)
   y, cuando ya eres grande, conviertes tu negocio en franquicia para ganar estrellas que multiplican todo.
   Eventos sorpresa: ola de calor, cliente estrella, fiesta de cumpleaños y lluvia de monedas.
   El avance se guarda en tu cuenta. Casi todo se gana jugando: sin jugar, tus ayudantes venden muy poquito. */
'use strict';

const TY = { run: null, tab: 'maq', buy: 1 };
const TY_FL = [
  { id: 'vainilla', n: 'Vainilla', c: '#fff1c1', d: '#e8d28f', cost: 0, v: 1, t: 2.2 },
  { id: 'fresa', n: 'Fresa', c: '#ff9bb5', d: '#e5678a', cost: 50, v: 5, t: 3.2 },
  { id: 'chocolate', n: 'Chocolate', c: '#8b5a3c', d: '#5e3a24', cost: 550, v: 24, t: 4.6 },
  { id: 'menta', n: 'Menta con chispas', c: '#a6ecd0', d: '#5cc79e', cost: 6500, v: 130, t: 6.2 },
  { id: 'mango', n: 'Mango', c: '#ffbf3c', d: '#e89512', cost: 75000, v: 720, t: 8 },
  { id: 'chicle', n: 'Chicle', c: '#86ccff', d: '#4a9fe0', cost: 900000, v: 4200, t: 10 },
  { id: 'galleta', n: 'Galleta', c: '#e0bf96', d: '#a77b50', cost: 1.2e7, v: 26000, t: 13 },
  { id: 'arcoiris', n: 'Arcoíris', c: 'rainbow', d: '#b06bff', cost: 1.6e8, v: 170000, t: 16 },
  { id: 'galaxia', n: 'Galaxia', c: '#6a4cff', d: '#2b1a8f', cost: 2.4e9, v: 1.2e6, t: 20 },
  { id: 'oro', n: 'Oro de unicornio', c: '#ffe066', d: '#d4a800', cost: 4e10, v: 9e6, t: 25 },
];
const TY_MS = [10, 25, 50, 100, 150, 200, 300];
const TY_UPS = [
  { id: 'tray', n: 'Bandejas más grandes', d: '+2 helados guardados por sabor', max: 10, base: 200, k: 3.2 },
  { id: 'pat', n: 'Clientes pacientes', d: '+1.5 s antes de irse', max: 8, base: 400, k: 3.5 },
  { id: 'rush', n: 'Más clientes', d: 'Llegan 10 % más seguido', max: 10, base: 800, k: 3.4 },
  { id: 'tip', n: 'Propinas', d: '+15 % por cada venta', max: 15, base: 1500, k: 3.0 },
  { id: 'quick', n: 'Servicio veloz', d: 'Más tiempo para el bono por rapidez', max: 5, base: 3000, k: 4.0 },
  { id: 'helper', n: 'Ayudantes entrenados', d: 'Tus ayudantes cobran 10 % más', max: 5, base: 5e4, k: 6.0 },
];
const TY_DECO = [
  { id: 'plantas', n: 'Plantas', b: 0.05, cost: 300 },
  { id: 'letrero', n: 'Letrero de neón', b: 0.1, cost: 5000 },
  { id: 'rocola', n: 'Rocola', b: 0.1, cost: 40000 },
  { id: 'mesas', n: 'Mesitas con sombrilla', b: 0.15, cost: 3e5 },
  { id: 'fuente', n: 'Fuente de chocolate', b: 0.2, cost: 4e6 },
  { id: 'gato', n: 'Gatito de la tienda', b: 0.25, cost: 5e7 },
  { id: 'robot', n: 'Robot heladero', b: 0.35, cost: 8e8 },
  { id: 'castillo', n: 'Castillo de galleta', b: 0.5, cost: 2e10 },
];
const TY_ZONES = [
  { id: 'barrio', n: 'Barrio', m: 1, cost: 0, sky: ['#bfe6ff', '#e9f6ff'], floor: '#f3d9b1', wall: '#fff4e6' },
  { id: 'playa', n: 'Playa', m: 2, cost: 2e5, sky: ['#7fd3ff', '#fff1c9'], floor: '#f7e1a6', wall: '#e7fbff' },
  { id: 'ciudad', n: 'Ciudad', m: 3, cost: 2e7, sky: ['#8ea6ff', '#ffd6e8'], floor: '#d9d4e8', wall: '#f1eefb' },
  { id: 'montana', n: 'Montaña nevada', m: 5, cost: 2e9, sky: ['#cfe3ff', '#ffffff'], floor: '#e3eef7', wall: '#f6fbff' },
  { id: 'luna', n: 'La Luna', m: 10, cost: 3e11, sky: ['#0b0f2b', '#3a2f7a'], floor: '#c9cbd6', wall: '#e9eaf2' },
];
const tyData = () => { const d = jpData('tycoon'); d.c ??= 0; d.tot ??= 0; d.all ??= 0; d.lv ||= { vainilla: 1 }; d.mg ||= {}; d.up ||= {}; d.deco ||= []; d.zones ||= ['barrio']; d.zv ||= 'barrio'; d.stars ??= 0; d.fr ??= 0; d.gift ||= {}; d.st ||= {}; return d; };
const tyFmt = (n) => { n = Math.floor(n); if (n < 1000) return String(n); const u = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp']; let i = -1; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; } return (n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2)).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1') + u[i]; };
const tyUp = (id) => tyData().up[id] || 0;
const tyUpCost = (u, l) => Math.round(u.base * Math.pow(u.k, l));
const tyLvCost = (f, l) => Math.ceil(Math.max(4, f.cost * 0.22 + f.v * 3) * Math.pow(1.13, l - 1));
const tyMsCount = (l) => TY_MS.filter((m) => l >= m).length;
const tyVal = (f, l) => f.v * l * Math.pow(2, tyMsCount(l));
const tyTime = (f, l) => f.t / Math.pow(1.6, tyMsCount(l));
const tyMgCost = (f) => Math.round(Math.max(120, f.cost * 4 + f.v * 60));
function tyMult(d = tyData()) {
  const deco = TY_DECO.filter((x) => d.deco.includes(x.id)).reduce((a, x) => a + x.b, 0);
  const zone = TY_ZONES.filter((z) => d.zones.includes(z.id)).reduce((a, z) => Math.max(a, z.m), 1);
  return (1 + deco) * zone * (1 + d.stars * 0.1) * (1 + tyUp('tip') * 0.15);
}
const tyStarsFor = (tot) => Math.floor(Math.sqrt(Math.max(0, tot) / 1e6));

/* ---------- sonido ---------- */
const TYS = { ac: null, out: null, music: true, nb: 0, beat: 0 };
function tyAudio() { if (TYS.ac) { if (TYS.ac.state === 'suspended') TYS.ac.resume().catch(() => {}); return; } try { const ac = new (window.AudioContext || window.webkitAudioContext)(); TYS.ac = ac; const cp = ac.createDynamicsCompressor(); cp.connect(ac.destination); TYS.out = ac.createGain(); TYS.out.gain.value = 0.9; TYS.out.connect(cp); TYS.nb = ac.currentTime + 0.2; } catch { TYS.ac = null; } }
function tyTone(f, d, type, vol, f2, delay = 0, at = 0.006) { const ac = TYS.ac; if (!ac) return; const t0 = ac.currentTime + delay; const o = ac.createOscillator(), v = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d * 0.8); v.gain.setValueAtTime(0.0001, t0); v.gain.linearRampToValueAtTime(vol, t0 + at); v.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(v); v.connect(TYS.out); o.start(t0); o.stop(t0 + d + 0.05); }
const TY_SFX = {
  cash: (k = 0) => { const f = 1046 * Math.pow(2, Math.min(12, k) / 24); tyTone(f, 0.18, 'square', 0.025); tyTone(f * 1.5, 0.3, 'triangle', 0.04, 0, 0.05); },
  scoop: () => { tyTone(300, 0.12, 'sine', 0.06, 520); },
  bell: () => { tyTone(1568, 0.5, 'sine', 0.03); tyTone(2093, 0.4, 'sine', 0.02, 0, 0.08); },
  angry: () => { tyTone(220, 0.25, 'sawtooth', 0.025, 150); },
  buy: () => { [0, 4, 7].forEach((s, i) => tyTone(523 * Math.pow(2, s / 12), 0.25, 'triangle', 0.05, 0, i * 0.05)); },
  big: () => { [0, 4, 7, 12, 16].forEach((s, i) => tyTone(523 * Math.pow(2, s / 12), 0.45, 'triangle', 0.05, 0, i * 0.07)); },
  event: () => { [0, 7, 12, 7, 12, 19].forEach((s, i) => tyTone(392 * Math.pow(2, s / 12), 0.25, 'square', 0.025, 0, i * 0.08)); },
  coin: () => { tyTone(1318, 0.12, 'square', 0.025); tyTone(1976, 0.2, 'square', 0.02, 0, 0.06); },
  tap: () => { tyTone(700, 0.06, 'sine', 0.03, 900); },
};
const TY_CH = [[262, 330, 392], [294, 349, 440], [247, 294, 392], [262, 330, 392]];
function tyMusic() {
  const ac = TYS.ac; if (!ac || !TYS.music) { if (ac) TYS.nb = Math.max(TYS.nb, ac.currentTime); return; }
  while (TYS.nb < ac.currentTime + 0.3) { const bar = Math.floor(TYS.beat / 8) % 4, s = TYS.beat % 8, ch = TY_CH[bar], t = TYS.nb - ac.currentTime; if (s === 0 || s === 4) tyTone(ch[0] / 2, 0.35, 'triangle', 0.02, 0, t); tyTone(ch[[0, 2, 1, 2, 0, 2, 1, 2][s]] * 2, 0.18, 'sine', s % 2 ? 0.01 : 0.016, 0, t); TYS.nb += 0.21; TYS.beat++; }
}

/* ---------- inicio ---------- */
function tyHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="tyhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#fff4e6"/></linearGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#tyhS)"/>
    <rect x="40" y="40" width="280" height="110" rx="10" fill="#fff"/><path d="M40 40 h280 v22 h-280z" fill="#ff8fab"/><g fill="#fff">${Array.from({ length: 7 }, (_, i) => `<path d="M${40 + i * 40} 62 q20 16 40 0z"/>`).join('')}</g>
    <text x="180" y="57" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="16" fill="#fff">Heladería</text>
    <rect x="40" y="112" width="280" height="38" fill="#e8b98a"/><rect x="40" y="108" width="280" height="8" fill="#c98f5c"/>
    ${[['#fff1c1', 80], ['#ff9bb5', 130], ['#8b5a3c', 180], ['#a6ecd0', 230], ['#ffbf3c', 280]].map(([c, x]) => `<g transform="translate(${x} 96)"><path d="M-9 0 L0 22 L9 0z" fill="#e0a95c"/><circle cx="0" cy="-4" r="11" fill="${c}"/><circle cx="-4" cy="-8" r="3" fill="#fff" opacity=".6"/></g>`).join('')}
    <g fill="#ffd23c"><circle cx="300" cy="24" r="8"/><circle cx="318" cy="30" r="6"/><circle cx="60" cy="24" r="7"/></g></svg>`;
}
function viewTycoon() {
  const d = tyData();
  const started = d.all > 0 || (d.lv.vainilla || 1) > 1;
  return `<section class="gm-home"><div class="gm-hero">${tyHero()}</div><h1 class="page-title gm-title">Heladería Tycoon</h1>
    <p class="page-sub">Las máquinas preparan helados solas, pero <b>tú atiendes a los clientes</b>: toca a cada uno cuando tengas su sabor listo (rápido = propina extra). Con lo que ganas, sube de nivel las máquinas, desbloquea sabores, contrata ayudantes, decora y abre sucursales. Cuando seas grande, vuelve tu negocio <b>franquicia</b> y gana estrellas que multiplican todo.</p>
    <button class="btn primary block gm-play" data-act="ty-start">${icon('play')}${started ? 'Abrir mi heladería' : 'Abrir la heladería'}</button>
    ${started ? `<div class="ty-sum"><span>💰 <b>${tyFmt(d.c)}</b> monedas</span><span>🍦 <b>${TY_FL.filter((f) => d.lv[f.id]).length}</b> sabores</span><span>⭐ <b>${d.stars}</b> estrellas</span><span>🏪 <b>${d.zones.length}</b> sucursales</span></div>` : ''}
    <p class="small muted" style="text-align:center;margin-top:12px">Tu heladería se guarda en tu cuenta. Al subir nuevos sabores también ganas monedas para tu árbol.</p></section>`;
}

/* ---------- el juego ---------- */
function tyStart() {
  if (TY.run) return; tyAudio();
  const d = tyData();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage ty-stage';
  wrap.innerHTML = `<div class="ty-top"><canvas aria-label="Tu heladería"></canvas>
      <button class="gm-x gl-x" id="tyX" aria-label="Salir">${icon('x')}</button>
      <div class="ty-coins"><b id="tyC">0</b><span id="tyRate"></span></div>
      <button class="gm-x ty-mus" id="tyM" aria-label="Música">♪</button>
      <div class="ty-ev" id="tyEv" hidden></div></div>
    <div class="ty-panel"><div class="ty-tabs" role="tablist">${[['maq', 'Máquinas'], ['ayu', 'Ayudantes'], ['mej', 'Mejoras'], ['suc', 'Sucursales'], ['fra', 'Franquicia']].map(([k, l]) => `<button type="button" data-t="${k}" aria-pressed="${TY.tab === k}">${l}</button>`).join('')}</div>
      <div class="ty-buy" id="tyBuy">${[1, 10, 'max'].map((b) => `<button type="button" data-b="${b}" aria-pressed="${String(TY.buy) === String(b)}">${b === 'max' ? 'Máx' : '×' + b}</button>`).join('')}</div>
      <div class="ty-list" id="tyList"></div></div>
    <div class="ty-toast" id="tyT"></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const $w = (s) => wrap.querySelector(s);
  const c = wrap.querySelector('canvas'), g = c.getContext('2d');
  const V = { w: 360, h: 300, dpr: 1 };
  const size = () => { V.dpr = Math.min(2, devicePixelRatio || 1); const r = c.getBoundingClientRect(); V.w = r.width; V.h = r.height; c.width = Math.round(V.w * V.dpr); c.height = Math.round(V.h * V.dpr); };
  size(); addEventListener('resize', size);
  const low = () => !!(window.cnPerf && window.cnPerf.low());
  const rnd = Math.random;

  const st = { bump: {}, t: 0, stock: {}, prog: {}, cust: [], nextC: 1.2, parts: [], floats: [], coinsRain: [], combo: 0, comboT: 0, ev: null, nextEv: 50 + rnd() * 40, last: performance.now(), saveT: 0, rate: 0, earnWin: [], id: 0, served: 0, lost: 0, shake: 0 };
  const owned = () => TY_FL.filter((f) => d.lv[f.id]);
  owned().forEach((f) => { st.stock[f.id] = 1; st.prog[f.id] = 0; });
  const cap = () => 5 + tyUp('tray') * 2;
  const pat = () => 9 + tyUp('pat') * 1.5;
  const quickWin = () => 2.2 + tyUp('quick') * 0.6;
  const arriveEvery = () => Math.max(0.55, 2.6 * Math.pow(0.9, tyUp('rush')) / Math.max(1, Math.sqrt(owned().length) * 0.75)) / (st.ev && st.ev.k === 'calor' ? 2 : 1);

  // ganancias sin jugar: solo los ayudantes, poquito y con tope de 2 horas
  if (d.saved) {
    const secs = Math.min(7200, Math.max(0, (Date.now() - d.saved) / 1000));
    const rate = owned().filter((f) => d.mg[f.id]).reduce((a, f) => a + tyVal(f, d.lv[f.id]) / tyTime(f, d.lv[f.id]), 0) * 0.08 * tyMult(d);
    const earn = Math.floor(rate * secs);
    if (earn > 0 && secs > 60) { d.c += earn; d.tot += earn; d.all += earn; setTimeout(() => toastIn(`Mientras no estabas, tus ayudantes vendieron 💰 ${tyFmt(earn)}`), 600); }
  }
  const earn = (n, x, y, gold) => { n = Math.max(1, Math.round(n)); d.c += n; d.tot += n; d.all += n; st.earnWin.push([st.t, n]); st.floats.push({ text: `+${tyFmt(n)}`, x, y, t: 0, c: gold ? '#ffd23c' : '#2f9e44' }); };
  let toastTimer = 0; const toastIn = (m) => { const el = $w('#tyT'); el.textContent = m; el.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), 2600); };

  /* --- escena: posiciones --- */
  const L = () => {
    const W = V.w, H = V.h, fl = owned(); const n = Math.max(1, fl.length);
    const mw = Math.min(70, (W - 24) / Math.min(n, 5)); const rows = Math.ceil(n / 5);
    const counterY = H * 0.62;
    const mach = fl.map((f, i) => { const r = Math.floor(i / 5), cI = i % 5, inRow = Math.min(5, n - r * 5); return { f, x: W / 2 + (cI - (inRow - 1) / 2) * mw, y: counterY - 30 - (rows - 1 - r) * 58, w: mw * 0.86 }; });
    const slots = [0, 1, 2, 3, 4].map((i) => ({ x: W * (0.14 + i * 0.18), y: H * 0.86 }));
    return { mach, slots, counterY, mw };
  };
  let lay = L();

  /* --- entrada: tocar clientes, máquinas y monedas --- */
  c.addEventListener('pointerdown', (e) => {
    tyAudio(); const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    for (const m of st.coinsRain) { if (!m.got && Math.hypot(m.x - x, m.y - y) < 26) { m.got = 1; TY_SFX.coin(); earn(m.v, m.x, m.y, true); return; } }
    let best = null, bd = 40; for (const cu of st.cust) { if (cu.state !== 'wait') continue; const dd = Math.hypot(cu.x - x, cu.y - 18 - y); if (dd < bd) { bd = dd; best = cu; } }
    if (best) { serve(best, false); return; }
    for (const m of lay.mach) { if (Math.abs(m.x - x) < m.w / 2 && Math.abs(m.y - y) < 30) { st.prog[m.f.id] = (st.prog[m.f.id] || 0) + 0.22; TY_SFX.tap(); st.bump[m.f.id] = 0.15; if (!low()) burst(x, y, 4, [m.f.c === 'rainbow' ? '#ff8fab' : m.f.c, '#fff'], 80); return; } }
  });
  function serve(cu, auto) {
    const f = TY_FL.find((q) => q.id === cu.want); if (!f) return;
    if ((st.stock[f.id] || 0) < 1) { if (!auto) { cu.nope = 0.4; TY_SFX.angry(); st.floats.push({ text: '¡No hay!', x: cu.x, y: cu.y - 60, t: 0, c: '#e03131' }); } return; }
    st.stock[f.id]--; cu.state = 'happy'; cu.st = 0;
    const fast = cu.w < quickWin(); let v = tyVal(f, d.lv[f.id]) * tyMult(d) * (cu.vip ? 10 : 1) * (cu.party ? 2 : 1) * (st.ev && st.ev.k === 'calor' ? 1.5 : 1);
    if (auto) v *= 0.6 * (1 + tyUp('helper') * 0.1);
    else { if (fast) v *= 1.5; st.combo = st.comboT > 0 ? Math.min(20, st.combo + 1) : 1; st.comboT = 3; v *= 1 + (st.combo - 1) * 0.05; }
    earn(v, cu.x, cu.y - 70, cu.vip || fast);
    st.served++; d.st.served = (d.st.served || 0) + 1;
    TY_SFX.cash(auto ? 0 : st.combo); if (!low() || !auto) burst(cu.x, cu.y - 40, auto ? 4 : 10, ['#ffd23c', '#fff', f.c === 'rainbow' ? '#ff8fab' : f.c], 140);
  }
  const burst = (x, y, n, cols, sp) => { const capP = low() ? 60 : 150; for (let i = 0; i < n && st.parts.length < capP; i++) { const a = rnd() * 6.28, v = (0.3 + rnd()) * sp; st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: 0, l: 0.6 + rnd() * 0.5, c: cols[(rnd() * cols.length) | 0], r: 2 + rnd() * 3 }); } };

  /* --- lógica --- */
  function newCustomer(opt = {}) {
    const free = lay.slots.findIndex((s, i) => !st.cust.some((cu) => cu.slot === i && cu.state !== 'gone'));
    if (free < 0) return false;
    const fl = owned(); const wts = fl.map((f, i) => 1 + i * 0.6); let r = rnd() * wts.reduce((a, b) => a + b, 0), k = 0; while (r > wts[k]) { r -= wts[k]; k++; }
    const S = lay.slots[free];
    st.cust.push({ slot: free, want: opt.want || fl[Math.min(k, fl.length - 1)].id, x: V.w + 40, y: S.y, tx: S.x, state: 'walk', w: 0, st: 0, hue: (rnd() * 360) | 0, hair: (rnd() * 4) | 0, vip: !!opt.vip, party: !!opt.party, nope: 0, bob: rnd() * 6 });
    return true;
  }
  function startEvent() {
    const kinds = ['calor', 'vip', 'fiesta', 'lluvia']; const k = kinds[(rnd() * kinds.length) | 0];
    TY_SFX.event();
    if (k === 'calor') { st.ev = { k, t: 25, T: 25, msg: '☀️ ¡Ola de calor! Llegan el doble de clientes y pagan más' }; }
    else if (k === 'vip') { newCustomer({ vip: true }); st.ev = { k, t: 8, T: 8, msg: '⭐ ¡Llegó un cliente estrella! Paga ×10' }; }
    else if (k === 'fiesta') { const f = owned()[(rnd() * owned().length) | 0]; for (let i = 0; i < 4; i++) setTimeout(() => newCustomer({ party: true, want: f.id }), i * 350); st.ev = { k, t: 10, T: 10, msg: `🎂 ¡Fiesta de cumpleaños! Todos quieren ${f.n} (×2)` }; }
    else { st.ev = { k, t: 9, T: 9, msg: '💰 ¡Lluvia de monedas! Tócalas antes de que caigan' }; }
    const el = $w('#tyEv'); el.textContent = st.ev.msg; el.hidden = false;
  }
  function step(dt) {
    st.t += dt; lay = L(); for (const k in st.bump) st.bump[k] = Math.max(0, st.bump[k] - dt);
    // máquinas
    for (const f of owned()) {
      const l = d.lv[f.id], T = tyTime(f, l); st.prog[f.id] = (st.prog[f.id] || 0) + dt / T;
      if (st.prog[f.id] >= 1) { const n = Math.floor(st.prog[f.id]); st.prog[f.id] -= n; const before = st.stock[f.id] || 0; st.stock[f.id] = Math.min(cap(), before + n); if (st.stock[f.id] > before && T > 0.6) TY_SFX.scoop(); }
      if ((st.stock[f.id] || 0) >= cap()) st.prog[f.id] = Math.min(st.prog[f.id], 0.999);
    }
    // clientes
    st.nextC -= dt; if (st.nextC <= 0) { st.nextC = arriveEvery() * (0.7 + rnd() * 0.6); if (newCustomer()) TY_SFX.bell(); }
    for (const cu of st.cust) {
      cu.bob += dt * 8; if (cu.nope > 0) cu.nope -= dt;
      if (cu.state === 'walk') { cu.x += (cu.tx - cu.x) * Math.min(1, dt * 4); if (Math.abs(cu.x - cu.tx) < 2) { cu.x = cu.tx; cu.state = 'wait'; } }
      else if (cu.state === 'wait') {
        cu.w += dt;
        if (d.mg[cu.want] && cu.w > 1.2 && (st.stock[cu.want] || 0) > 0) serve(cu, true);
        else if (cu.w > pat() * (cu.vip ? 0.7 : 1)) { cu.state = 'angry'; cu.st = 0; st.lost++; TY_SFX.angry(); }
      } else { cu.st += dt; if (cu.st > 0.6) cu.x -= dt * 360; if (cu.x < -60) cu.state = 'gone'; }
    }
    st.cust = st.cust.filter((cu) => cu.state !== 'gone');
    st.comboT -= dt; if (st.comboT <= 0) st.combo = 0;
    // eventos
    if (st.ev) { st.ev.t -= dt; if (st.ev.k === 'lluvia' && rnd() < dt * 4) st.coinsRain.push({ x: 20 + rnd() * (V.w - 40), y: -20, vy: 70 + rnd() * 60, v: Math.max(5, (st.rate || 1) * 1.5 + tyVal(owned().slice(-1)[0], 1) * 3), got: 0 }); if (st.ev.t <= 0) { st.ev = null; $w('#tyEv').hidden = true; } }
    else { st.nextEv -= dt; if (st.nextEv <= 0) { st.nextEv = 55 + rnd() * 50; startEvent(); } }
    for (const m of st.coinsRain) m.y += m.vy * dt; st.coinsRain = st.coinsRain.filter((m) => !m.got && m.y < V.h + 30);
    for (const p of st.parts) { p.t += dt; p.vy += 300 * dt; p.x += p.vx * dt; p.y += p.vy * dt; } st.parts = st.parts.filter((p) => p.t < p.l);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 1);
    // ritmo de ganancia (últimos 20 s)
    st.earnWin = st.earnWin.filter(([t]) => st.t - t < 20); st.rate = st.earnWin.reduce((a, [, n]) => a + n, 0) / Math.min(20, Math.max(1, st.t));
    st.saveT += dt; if (st.saveT > 12) { st.saveT = 0; d.saved = Date.now(); jpSave(); }
  }

  /* --- dibujo --- */
  function cone(x, y, s, f, scoops = 1) {
    g.fillStyle = '#e0a95c'; g.beginPath(); g.moveTo(x - 9 * s, y); g.lineTo(x, y + 22 * s); g.lineTo(x + 9 * s, y); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(150,90,30,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 6 * s, y + 3 * s); g.lineTo(x + 3 * s, y + 12 * s); g.moveTo(x + 6 * s, y + 3 * s); g.lineTo(x - 3 * s, y + 12 * s); g.stroke();
    for (let i = 0; i < scoops; i++) { const yy = y - 4 * s - i * 12 * s; if (f.c === 'rainbow') { const gr = g.createLinearGradient(x - 11 * s, 0, x + 11 * s, 0); ['#ff5a5a', '#ffb23c', '#ffe066', '#6bd66b', '#4aa8ff', '#a06bff'].forEach((cc, k) => gr.addColorStop(k / 5, cc)); g.fillStyle = gr; } else g.fillStyle = f.c; g.beginPath(); g.arc(x, yy, 11 * s, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(x - 4 * s, yy - 4 * s, 3 * s, 0, 7); g.fill(); if (f.id === 'menta' || f.id === 'galleta') { g.fillStyle = f.id === 'menta' ? '#4a2a1a' : '#6b4226'; for (let k = 0; k < 4; k++) g.fillRect(x - 6 * s + k * 4 * s, yy - 2 * s + (k % 2) * 4 * s, 2 * s, 2 * s); } if (f.id === 'galaxia') { g.fillStyle = '#fff'; for (let k = 0; k < 3; k++) g.fillRect(x - 5 * s + k * 5 * s, yy - 3 * s + (k % 2) * 5 * s, 1.5 * s, 1.5 * s); } }
  }
  function person(cu) {
    const x = cu.x, y = cu.y, bob = cu.state === 'walk' || cu.state === 'angry' && cu.st > 0.6 ? Math.abs(Math.sin(cu.bob)) * 4 : Math.sin(cu.bob * 0.3) * 1;
    g.save(); g.translate(x + (cu.nope > 0 ? Math.sin(cu.nope * 60) * 3 : 0), y - bob);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(0, 4 + bob, 16, 4, 0, 0, 7); g.fill();
    g.fillStyle = `hsl(${cu.hue},60%,62%)`; g.beginPath(); g.moveTo(-14, 0); g.quadraticCurveTo(-16, -34, 0, -36); g.quadraticCurveTo(16, -34, 14, 0); g.closePath(); g.fill();
    g.fillStyle = '#f2c6a0'; g.beginPath(); g.arc(0, -48, 13, 0, 7); g.fill();
    g.fillStyle = ['#3b2a1a', '#e0b048', '#8a3b1e', '#222'][cu.hair]; g.beginPath(); g.arc(0, -52, 13.5, Math.PI * 1.05, Math.PI * 1.95); g.fill();
    if (cu.vip) { g.fillStyle = '#ffd23c'; g.beginPath(); g.moveTo(-9, -62); g.lineTo(-9, -70); g.lineTo(-4, -65); g.lineTo(0, -72); g.lineTo(4, -65); g.lineTo(9, -70); g.lineTo(9, -62); g.closePath(); g.fill(); }
    if (cu.party) { g.fillStyle = '#ff5d8f'; g.beginPath(); g.moveTo(-6, -62); g.lineTo(6, -62); g.lineTo(2, -78); g.closePath(); g.fill(); }
    const mood = cu.state === 'angry' ? -1 : cu.state === 'happy' ? 1 : cu.w > pat() * 0.65 ? -0.5 : 0.4;
    g.fillStyle = '#2a1a12'; g.beginPath(); g.arc(-4.5, -49, 1.8, 0, 7); g.arc(4.5, -49, 1.8, 0, 7); g.fill();
    g.strokeStyle = '#7a3a2a'; g.lineWidth = 1.6; g.beginPath(); if (mood > 0) g.arc(0, -45, 4.5, 0.3, 2.8); else if (mood < -0.7) g.arc(0, -39, 4.5, 3.5, 5.9); else { g.moveTo(-3.5, -42); g.lineTo(3.5, -42); } g.stroke();
    if (cu.state === 'angry') { g.fillStyle = '#e03131'; g.font = '700 14px system-ui'; g.textAlign = 'center'; g.fillText('😤', 16, -62); }
    if (cu.state === 'happy') { const f = TY_FL.find((q) => q.id === cu.want); cone(14, -18, 0.55, f); }
    g.restore();
    // globo con el pedido y barrita de paciencia
    if (cu.state === 'wait' || cu.state === 'walk') {
      const f = TY_FL.find((q) => q.id === cu.want), bx = x, by = y - 92; const ok = (st.stock[cu.want] || 0) > 0;
      g.fillStyle = cu.vip ? '#fff6c8' : '#fff'; g.strokeStyle = ok ? '#2f9e44' : 'rgba(0,0,0,.15)'; g.lineWidth = ok ? 2.5 : 1; g.beginPath(); g.roundRect(bx - 20, by - 24, 40, 42, 12); g.fill(); g.stroke(); g.beginPath(); g.moveTo(bx - 5, by + 18); g.lineTo(bx, by + 25); g.lineTo(bx + 5, by + 18); g.fill();
      cone(bx, by - 6, 0.62, f, cu.party ? 2 : 1);
      if (cu.state === 'wait') { const k = 1 - cu.w / (pat() * (cu.vip ? 0.7 : 1)); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(bx - 18, by + 22 + 8, 36, 4); g.fillStyle = k > 0.5 ? '#40c057' : k > 0.25 ? '#fab005' : '#fa5252'; g.fillRect(bx - 18, by + 30, 36 * Math.max(0, k), 4); }
    }
  }
  function draw() {
    const W = V.w, H = V.h; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    const Z = TY_ZONES.find((z) => z.id === d.zv) || TY_ZONES[0];
    // ventana con vista de la sucursal
    const gr = g.createLinearGradient(0, 0, 0, H * 0.5); gr.addColorStop(0, Z.sky[0]); gr.addColorStop(1, Z.sky[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (Z.id === 'playa') { g.fillStyle = '#4fb6e8'; g.fillRect(0, H * 0.3, W, H * 0.12); g.fillStyle = '#ffe9a8'; g.fillRect(0, H * 0.4, W, 10); g.fillStyle = '#ffd23c'; g.beginPath(); g.arc(W * 0.8, H * 0.12, 18, 0, 7); g.fill(); }
    else if (Z.id === 'ciudad') { for (let i = 0; i < 9; i++) { const bw = W / 9; const hh = H * (0.18 + ((i * 37) % 7) * 0.03); g.fillStyle = i % 2 ? '#7d86b8' : '#9aa2d2'; g.fillRect(i * bw, H * 0.44 - hh, bw - 3, hh); g.fillStyle = '#fff3a8'; for (let k = 0; k < 4; k++) g.fillRect(i * bw + 5 + (k % 2) * 10, H * 0.44 - hh + 8 + Math.floor(k / 2) * 14, 5, 6); } }
    else if (Z.id === 'montana') { g.fillStyle = '#9fb7d6'; g.beginPath(); g.moveTo(0, H * 0.44); g.lineTo(W * 0.25, H * 0.12); g.lineTo(W * 0.5, H * 0.44); g.lineTo(W * 0.72, H * 0.18); g.lineTo(W, H * 0.44); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(W * 0.25, H * 0.12); g.lineTo(W * 0.2, H * 0.2); g.lineTo(W * 0.3, H * 0.2); g.fill(); g.beginPath(); g.moveTo(W * 0.72, H * 0.18); g.lineTo(W * 0.68, H * 0.24); g.lineTo(W * 0.76, H * 0.24); g.fill(); }
    else if (Z.id === 'luna') { g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) g.fillRect((i * 97) % W, (i * 53) % (H * 0.4), 1.5, 1.5); g.fillStyle = '#4aa8ff'; g.beginPath(); g.arc(W * 0.8, H * 0.14, 16, 0, 7); g.fill(); g.fillStyle = '#6bd66b'; g.beginPath(); g.arc(W * 0.78, H * 0.13, 6, 0, 7); g.fill(); }
    else { g.fillStyle = '#9fdc8f'; g.beginPath(); g.ellipse(W * 0.3, H * 0.46, W * 0.4, H * 0.1, 0, 0, 7); g.ellipse(W * 0.8, H * 0.47, W * 0.35, H * 0.09, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc((st.t * 6) % (W + 80) - 40, H * 0.12, 14, 0, 7); g.arc((st.t * 6) % (W + 80) - 24, H * 0.12, 11, 0, 7); g.fill(); }
    // pared con toldo
    g.fillStyle = Z.wall; g.fillRect(0, H * 0.46, W, H * 0.2);
    const stripes = 12; for (let i = 0; i < stripes; i++) { g.fillStyle = i % 2 ? '#fff' : '#ff8fab'; g.fillRect(i * W / stripes, 0, W / stripes + 1, 18); g.beginPath(); g.arc(i * W / stripes + W / stripes / 2, 18, W / stripes / 2, 0, Math.PI); g.fill(); }
    // decoración comprada
    if (d.deco.includes('plantas')) { for (const px of [10, W - 26]) { g.fillStyle = '#b5651d'; g.fillRect(px, H * 0.56, 16, 14); g.fillStyle = '#40c057'; g.beginPath(); g.arc(px + 8, H * 0.54, 11, 0, 7); g.fill(); } }
    if (d.deco.includes('letrero')) { g.save(); g.shadowColor = '#ff5dd0'; g.shadowBlur = 12; g.strokeStyle = '#ff7be0'; g.lineWidth = 2.5; g.font = 'italic 700 16px Georgia,serif'; g.textAlign = 'center'; g.strokeText('Heladería', W / 2, 40); g.restore(); }
    if (d.deco.includes('gato')) { g.fillStyle = '#f5a65b'; g.beginPath(); g.ellipse(W - 40, H * 0.6, 12, 8, 0, 0, 7); g.arc(W - 30, H * 0.57, 6, 0, 7); g.fill(); g.beginPath(); g.moveTo(W - 34, H * 0.55); g.lineTo(W - 33, H * 0.5); g.lineTo(W - 29, H * 0.54); g.fill(); }
    if (d.deco.includes('rocola')) { g.fillStyle = '#c92a2a'; g.beginPath(); g.roundRect(14, H * 0.47, 22, 30, 8); g.fill(); g.fillStyle = `hsl(${(st.t * 120) % 360},90%,70%)`; g.fillRect(18, H * 0.5, 14, 6); }
    // máquinas
    for (const m of lay.mach) {
      const f = m.f, l = d.lv[f.id], s = Math.min(1, m.w / 60), bump = 1 + Math.max(0, st.bump[f.id] || 0);
      g.save(); g.translate(m.x, m.y); g.scale(bump, bump);
      g.fillStyle = '#e9edf3'; g.beginPath(); g.roundRect(-m.w / 2, -26, m.w, 52, 10); g.fill(); g.strokeStyle = 'rgba(0,0,0,.08)'; g.stroke();
      g.fillStyle = f.c === 'rainbow' ? '#ffb23c' : f.c; g.beginPath(); g.roundRect(-m.w / 2 + 5, -20, m.w - 10, 18, 7); g.fill();
      // progreso
      const p = clampTy(st.prog[f.id] || 0, 0, 1); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(-m.w / 2 + 6, 4, m.w - 12, 5); g.fillStyle = '#4dabf7'; g.fillRect(-m.w / 2 + 6, 4, (m.w - 12) * p, 5);
      g.fillStyle = '#495057'; g.font = `700 ${Math.round(10 * Math.max(0.8, s))}px system-ui`; g.textAlign = 'center'; g.fillText(`Nv ${l}`, 0, 21);
      // helados listos
      const n = st.stock[f.id] || 0; g.font = '800 11px system-ui'; g.lineWidth = 3; g.strokeStyle = 'rgba(0,0,0,.45)'; g.strokeText(`${n}/${cap()}`, 0, -7); g.fillStyle = n ? '#ffffff' : '#e9ecef'; g.fillText(`${n}/${cap()}`, 0, -7);
      if (d.mg[f.id]) { g.fillStyle = '#fff'; g.beginPath(); g.arc(m.w / 2 - 6, -24, 7, 0, 7); g.fill(); g.font = '10px system-ui'; g.fillText('🧑‍🍳', m.w / 2 - 6, -20.5); }
      g.restore();
    }
    // mostrador
    g.fillStyle = '#e8b98a'; g.fillRect(0, lay.counterY, W, 22); g.fillStyle = '#c98f5c'; g.fillRect(0, lay.counterY, W, 5);
    g.fillStyle = Z.floor; g.fillRect(0, lay.counterY + 22, W, H);
    for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(0,0,0,.04)'; g.fillRect(i * W / 5, lay.counterY + 22, W / 10, H); }
    if (d.deco.includes('mesas')) { for (const px of [W * 0.06, W * 0.94]) { g.fillStyle = '#ff8fab'; g.beginPath(); g.arc(px, lay.counterY + 30, 18, Math.PI, 0); g.fill(); g.fillStyle = '#aaa'; g.fillRect(px - 1, lay.counterY + 30, 2, 24); } }
    for (const cu of st.cust) person(cu);
    for (const m of st.coinsRain) { g.fillStyle = '#ffd23c'; g.beginPath(); g.arc(m.x, m.y, 13, 0, 7); g.fill(); g.strokeStyle = '#d98e00'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#d98e00'; g.font = '800 12px system-ui'; g.textAlign = 'center'; g.fillText('$', m.x, m.y + 4); }
    for (const p of st.parts) { g.globalAlpha = Math.max(0, 1 - p.t / p.l); g.fillStyle = p.c; g.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); } g.globalAlpha = 1;
    g.textAlign = 'center'; for (const f of st.floats) { g.globalAlpha = Math.max(0, 1 - f.t); g.font = '900 16px system-ui'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.9)'; g.strokeText(f.text, f.x, f.y - f.t * 36); g.fillStyle = f.c; g.fillText(f.text, f.x, f.y - f.t * 36); } g.globalAlpha = 1;
    if (st.combo > 1) { g.font = '900 15px system-ui'; g.textAlign = 'right'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,.9)'; const tx = `Combo ×${st.combo}`; g.strokeText(tx, W - 12, lay.counterY - 6 - (lay.mach.length > 5 ? 116 : 58)); g.fillStyle = '#e8590c'; g.fillText(tx, W - 12, lay.counterY - 6 - (lay.mach.length > 5 ? 116 : 58)); }
    if (st.ev && st.ev.k === 'calor') { g.fillStyle = `rgba(255,170,60,${0.08 + 0.04 * Math.sin(st.t * 3)})`; g.fillRect(0, 0, W, H); }
  }
  const clampTy = (v, a, b) => Math.max(a, Math.min(b, v));

  /* --- panel de compras (se arma una vez por pestaña y se actualiza 4 veces por segundo) --- */
  const bulk = (costFn, l0, maxL) => { let n = 0, sum = 0; const lim = TY.buy === 'max' ? 1e4 : +TY.buy; while (n < lim && l0 + n < maxL) { const cc = costFn(l0 + n); if (TY.buy === 'max' && sum + cc > d.c) break; sum += cc; n++; } if (TY.buy === 'max' && n === 0) { n = 1; sum = costFn(l0); } return { n, sum }; };
  function listHTML() {
    if (TY.tab === 'maq') return TY_FL.map((f, i) => { const l = d.lv[f.id]; if (!l) { const prevOk = i === 0 || d.lv[TY_FL[i - 1].id]; return prevOk ? `<div class="ty-row lock"><span class="ty-ic" style="--c:${f.c === 'rainbow' ? '#ffb23c' : f.c}"></span><div><b>${f.n}</b><span class="small">Nuevo sabor · vale ${tyFmt(f.v * 2 * tyMult(d))} por helado</span></div><button class="btn primary" data-a="unlock" data-id="${f.id}">Abrir · 💰 ${tyFmt(f.cost)}</button></div>` : ''; }
      const nm = TY_MS.find((m) => m > l); return `<div class="ty-row"><span class="ty-ic" style="--c:${f.c === 'rainbow' ? '#ffb23c' : f.c}"></span><div><b>${f.n} · Nv <span data-lv="${f.id}">${l}</span></b><span class="small" data-info="${f.id}"></span>${nm ? `<span class="ty-ms" data-ms="${f.id}"></span>` : ''}</div><button class="btn primary" data-a="lv" data-id="${f.id}"></button></div>`; }).join('');
    if (TY.tab === 'ayu') return `<p class="small ty-note">Un ayudante atiende solo a los clientes de su sabor (cobra un poco menos que tú). Tú sigues ganando más si atiendes rápido.</p>` + TY_FL.filter((f) => d.lv[f.id]).map((f) => `<div class="ty-row"><span class="ty-ic" style="--c:${f.c === 'rainbow' ? '#ffb23c' : f.c}"></span><div><b>Ayudante de ${f.n}</b><span class="small">${d.mg[f.id] ? 'Trabajando 🧑‍🍳' : 'Atiende solo este sabor'}</span></div>${d.mg[f.id] ? '<span class="ty-ok">Contratado</span>' : `<button class="btn primary" data-a="mg" data-id="${f.id}">💰 ${tyFmt(tyMgCost(f))}</button>`}</div>`).join('');
    if (TY.tab === 'mej') return TY_UPS.map((u) => { const l = tyUp(u.id); return `<div class="ty-row"><div><b>${u.n} · ${l}/${u.max}</b><span class="small">${u.d}</span></div>${l >= u.max ? '<span class="ty-ok">Máximo</span>' : `<button class="btn primary" data-a="up" data-id="${u.id}">💰 ${tyFmt(tyUpCost(u, l))}</button>`}</div>`; }).join('') + `<h3 class="ty-h">Decoración</h3>` + TY_DECO.map((x) => `<div class="ty-row"><div><b>${x.n}</b><span class="small">+${Math.round(x.b * 100)} % a todas las ventas</span></div>${d.deco.includes(x.id) ? '<span class="ty-ok">Puesto</span>' : `<button class="btn primary" data-a="deco" data-id="${x.id}">💰 ${tyFmt(x.cost)}</button>`}</div>`).join('');
    if (TY.tab === 'suc') return `<p class="small ty-note">Cada sucursal multiplica todas tus ventas (cuenta la mejor que tengas). Toca una que ya tengas para ver su vista.</p>` + TY_ZONES.map((z) => { const has = d.zones.includes(z.id); return `<div class="ty-row"><div><b>${z.n} · ×${z.m}</b><span class="small">${has ? (d.zv === z.id ? 'Estás aquí' : 'Tuya') : 'Nueva sucursal'}</span></div>${has ? (d.zv === z.id ? '<span class="ty-ok">Aquí</span>' : `<button class="btn" data-a="zv" data-id="${z.id}">Ir</button>`) : `<button class="btn primary" data-a="zone" data-id="${z.id}">💰 ${tyFmt(z.cost)}</button>`}</div>`; }).join('');
    const can = tyStarsFor(d.tot);
    return `<div class="ty-fr"><b>⭐ ${d.stars} estrellas de franquicia</b><span class="small">Cada estrella da +10 % a todas tus ventas, para siempre.</span>
      <p class="small">Franquicias abiertas: ${d.fr}. Ganado en esta etapa: 💰 ${tyFmt(d.tot)}.</p>
      <p>${can > 0 ? `Si conviertes tu heladería en franquicia ahora, ganas <b>⭐ ${can}</b> estrellas. Empiezas de nuevo (monedas, máquinas, ayudantes, mejoras, decoración y sucursales), pero vendes mucho más rápido.` : 'Necesitas ganar 💰 1M en esta etapa para tu primera estrella.'}</p>
      <button class="btn ${can > 0 ? 'primary' : ''} block" data-a="fr" ${can > 0 ? '' : 'disabled'}>Abrir franquicia${can > 0 ? ` · +⭐ ${can}` : ''}</button></div>
      <p class="small ty-note">Estadísticas: ${tyFmt(d.st.served || 0)} clientes atendidos · 💰 ${tyFmt(d.all)} ganadas en total.</p>`;
  }
  const list = $w('#tyList');
  const paintList = () => { list.innerHTML = listHTML(); refresh(); };
  function refresh() {
    $w('#tyC').textContent = `💰 ${tyFmt(d.c)}`; $w('#tyRate').textContent = st.rate >= 1 ? `${tyFmt(st.rate)}/s` : '';
    if (TY.tab === 'maq') {
      for (const f of TY_FL) {
        const l = d.lv[f.id]; if (!l) continue; const b = list.querySelector(`[data-a="lv"][data-id="${f.id}"]`); if (!b) continue;
        const { n, sum } = bulk((x) => tyLvCost(f, x), l, 1000); b.textContent = `+${n} · 💰 ${tyFmt(sum)}`; b.disabled = d.c < sum;
        const inf = list.querySelector(`[data-info="${f.id}"]`); if (inf) inf.textContent = `💰 ${tyFmt(tyVal(f, l) * tyMult(d))} c/u · cada ${tyTime(f, l).toFixed(1)} s`;
        const lv = list.querySelector(`[data-lv="${f.id}"]`); if (lv) lv.textContent = l;
        const ms = list.querySelector(`[data-ms="${f.id}"]`); const nm = TY_MS.find((m) => m > l); if (ms && nm) { const prev = [...TY_MS].reverse().find((m) => m <= l) || 0; ms.innerHTML = `<i style="width:${(l - prev) / (nm - prev) * 100}%"></i><em>Nv ${nm}: ×2 valor y más rápido</em>`; }
      }
    }
    list.querySelectorAll('button[data-a]').forEach((b) => {
      const a = b.dataset.a, id = b.dataset.id; let cost = null;
      if (a === 'unlock') cost = TY_FL.find((f) => f.id === id).cost; else if (a === 'mg') cost = tyMgCost(TY_FL.find((f) => f.id === id)); else if (a === 'up') { const u = TY_UPS.find((x) => x.id === id); cost = tyUpCost(u, tyUp(id)); } else if (a === 'deco') cost = TY_DECO.find((x) => x.id === id).cost; else if (a === 'zone') cost = TY_ZONES.find((x) => x.id === id).cost;
      if (cost != null) b.disabled = d.c < cost;
    });
  }
  list.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-a]'); if (!b || b.disabled) return; const a = b.dataset.a, id = b.dataset.id; tyAudio();
    const pay = (n) => { if (d.c < n) return false; d.c -= n; return true; };
    if (a === 'lv') { const f = TY_FL.find((x) => x.id === id), l = d.lv[id]; const { n, sum } = bulk((x) => tyLvCost(f, x), l, 1000); if (!pay(sum)) return; const before = tyMsCount(l); d.lv[id] = l + n; if (tyMsCount(l + n) > before) { TY_SFX.big(); toastIn(`¡${f.n} llegó al nivel ${l + n}! Vale el doble y sale más rápido`); } else TY_SFX.buy(); refresh(); return; }
    if (a === 'unlock') { const f = TY_FL.find((x) => x.id === id); if (!pay(f.cost)) return; d.lv[id] = 1; st.stock[id] = 1; st.prog[id] = 0; TY_SFX.big(); toastIn(`¡Nuevo sabor: ${f.n}!`); if (!d.gift[id]) { d.gift[id] = 1; jgCoins(2); } }
    else if (a === 'mg') { const f = TY_FL.find((x) => x.id === id); if (!pay(tyMgCost(f))) return; d.mg[id] = 1; TY_SFX.buy(); toastIn(`Contrataste al ayudante de ${f.n}`); }
    else if (a === 'up') { const u = TY_UPS.find((x) => x.id === id); if (!pay(tyUpCost(u, tyUp(id)))) return; d.up[id] = tyUp(id) + 1; TY_SFX.buy(); }
    else if (a === 'deco') { const x = TY_DECO.find((q) => q.id === id); if (!pay(x.cost)) return; d.deco.push(id); TY_SFX.big(); toastIn(`¡${x.n} ya está en tu heladería!`); }
    else if (a === 'zone') { const z = TY_ZONES.find((q) => q.id === id); if (!pay(z.cost)) return; d.zones.push(id); d.zv = id; TY_SFX.big(); toastIn(`¡Abriste tu sucursal en ${z.n}! Todo vale ×${z.m}`); jgCoins(3); }
    else if (a === 'zv') { d.zv = id; TY_SFX.tap(); }
    else if (a === 'fr') {
      const can = tyStarsFor(d.tot); if (can < 1) return;
      if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = `¿Segura/o? Toca otra vez para abrir (+⭐ ${can})`; TY_SFX.tap(); setTimeout(() => { if (b.isConnected) { delete b.dataset.sure; b.textContent = `Abrir franquicia · +⭐ ${can}`; } }, 4000); return; }
      d.stars += can; d.fr += 1; d.c = 0; d.tot = 0; d.lv = { vainilla: 1 }; d.mg = {}; d.up = {}; d.deco = []; d.zones = ['barrio']; d.zv = 'barrio';
      st.stock = { vainilla: 1 }; st.prog = { vainilla: 0 }; st.cust = []; TY_SFX.big(); jgCoins(5); toastIn(`¡Franquicia abierta! Ahora tienes ⭐ ${d.stars}`);
    }
    d.saved = Date.now(); jpSave(); paintList();
  });
  $w('.ty-tabs').addEventListener('click', (e) => { const b = e.target.closest('button[data-t]'); if (!b) return; TY.tab = b.dataset.t; wrap.querySelectorAll('.ty-tabs button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); $w('#tyBuy').hidden = TY.tab !== 'maq'; TY_SFX.tap(); paintList(); });
  $w('#tyBuy').addEventListener('click', (e) => { const b = e.target.closest('button[data-b]'); if (!b) return; TY.buy = b.dataset.b === 'max' ? 'max' : +b.dataset.b; wrap.querySelectorAll('#tyBuy button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); refresh(); });
  $w('#tyBuy').hidden = TY.tab !== 'maq';
  $w('#tyM').addEventListener('click', () => { TYS.music = !TYS.music; $w('#tyM').style.opacity = TYS.music ? 1 : 0.45; });
  paintList();

  /* --- bucle --- */
  let uiT = 0;
  const loop = (now) => {
    st.id = requestAnimationFrame(loop);
    if (document.hidden) { st.last = now; return; }
    const dt = Math.min(0.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
    step(dt); draw(); tyMusic();
    uiT += dt; if (uiT > 0.25) { uiT = 0; refresh(); }
  };
  st.id = requestAnimationFrame(loop);
  const exit = () => {
    cancelAnimationFrame(st.id); removeEventListener('resize', size); d.saved = Date.now(); jpSave();
    wrap.remove(); document.body.classList.remove('gm-on'); TY.run = null; if (location.hash === '#/tycoon') render();
  };
  TY.run = { exit, st: () => st };
  $w('#tyX').addEventListener('click', exit);
}

Object.assign(VIDA_ACTS, { 'ty-start': () => tyStart() });
EXTRA_VIEWS.tycoon = viewTycoon; EXTRA_NAV.tycoon = 'juegos';
{
  const baseJuegos = viewJuegos;
  viewJuegos = function () { return baseJuegos().replace('<ul class="rows" style="margin-top:18px">', `<ul class="rows" style="margin-top:18px"><li><a href="#/tycoon"><span class="ico">${icon('play')}</span><span class="txt"><b>Heladería Tycoon <em class="sc-new">Nuevo</em></b><span>Atiende clientes, mejora tus máquinas, abre sucursales y vuélvete franquicia.</span></span>${icon('chev', 'chev')}</a></li>`); };
  EXTRA_VIEWS.juegos = viewJuegos;
}
