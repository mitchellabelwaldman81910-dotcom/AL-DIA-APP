/* Cinnavia 7.63 — Mina Profunda 2.
   Novedades: Guardianes de capa (jefes que hay que derrotar para bajar), vetas de minerales, fiebre minera,
   Topi el topo ayudante, cuevas secretas con tesoro, rocas sueltas que se derrumban, 12 reliquias con poderes
   para siempre, una mina distinta cada día y minerales que vuelan a tu mochila.
   Antes (7.62): Mina Profunda.
   Excava hacia abajo, junta minerales y gemas, vuelve al campamento a venderlas y mejora tu equipo para bajar más.
   Nueve capas (Tierra, Arcilla, Piedra, Cueva de cristal, Granito rosa, Magma, Obsidiana, Núcleo antiguo y Abismo
   estelar), cada una más dura, más oscura y con tesoros mejores: cofres, fósiles, geodas, lava y bolsas de gas.
   Energía limitada: si se acaba, te rescatan pero pierdes la mitad de la mochila. Elevadores cada 100 m,
   encargos del gremio, álbum de minerales y fósiles, nivel de minero, objetos (dinamita, bebida, traje térmico,
   teletransporte) y ranking por profundidad. El avance se guarda en tu cuenta. */
'use strict';

const MZ = { run: null, tab: 'bajar' };
const MZ_COLS = 13, MZ_RM = 2; // metros por fila
const MZ_ZONES = [
  { n: 'Tierra', to: 40, a: '#9b6b43', b: '#7a5132', bg: '#3b2618', hp: 1 },
  { n: 'Arcilla', to: 120, a: '#c07a4a', b: '#955a34', bg: '#3a2016', hp: 2.4 },
  { n: 'Piedra', to: 260, a: '#8d939c', b: '#6b717a', bg: '#22252b', hp: 6 },
  { n: 'Cueva de cristal', to: 450, a: '#7383b0', b: '#56638c', bg: '#171c30', hp: 14 },
  { n: 'Granito rosa', to: 700, a: '#b88a84', b: '#8d6460', bg: '#2a1818', hp: 32 },
  { n: 'Magma', to: 1000, a: '#5e3b35', b: '#40241f', bg: '#2a0d08', hp: 70 },
  { n: 'Obsidiana', to: 1400, a: '#40395a', b: '#29233d', bg: '#0f0b19', hp: 160 },
  { n: 'Núcleo antiguo', to: 2000, a: '#55725f', b: '#384c40', bg: '#0a130e', hp: 360 },
  { n: 'Abismo estelar', to: 1e9, a: '#2e3366', b: '#1c1f44', bg: '#05060f', hp: 800 },
];
const MZ_ORES = [
  { id: 'carbon', n: 'Carbón', v: 4, from: 0, to: 160, c: '#2b2b2b', g: '#555' },
  { id: 'cobre', n: 'Cobre', v: 11, from: 14, to: 280, c: '#d9824a', g: '#ffb27a' },
  { id: 'hierro', n: 'Hierro', v: 28, from: 60, to: 420, c: '#c9b8a8', g: '#efe4d8' },
  { id: 'plata', n: 'Plata', v: 70, from: 130, to: 620, c: '#dfe6ee', g: '#ffffff' },
  { id: 'oro', n: 'Oro', v: 170, from: 210, to: 900, c: '#ffcf3a', g: '#fff1a8' },
  { id: 'rubi', n: 'Rubí', v: 430, from: 320, to: 1200, c: '#e8334f', g: '#ff8fa0' },
  { id: 'esmeralda', n: 'Esmeralda', v: 1050, from: 460, to: 1550, c: '#22c27a', g: '#8ff0c4' },
  { id: 'zafiro', n: 'Zafiro', v: 2600, from: 620, to: 2100, c: '#2f6cff', g: '#9fbfff' },
  { id: 'amatista', n: 'Amatista', v: 6200, from: 820, to: 2600, c: '#a45cff', g: '#dcbcff' },
  { id: 'diamante', n: 'Diamante', v: 15000, from: 1050, to: 1e9, c: '#bff4ff', g: '#ffffff' },
  { id: 'estelar', n: 'Cristal estelar', v: 42000, from: 1450, to: 1e9, c: '#ff7ce0', g: '#fff0fb' },
  { id: 'reliquia', n: 'Reliquia antigua', v: 120000, from: 1900, to: 1e9, c: '#ffb703', g: '#fff3c4' },
];
const MZ_FOSSILS = ['Concha', 'Amonita', 'Trilobite', 'Hoja antigua', 'Pez fósil', 'Diente de tiburón', 'Huella de dino', 'Cráneo de raptor', 'Huevo de dino', 'Ámbar con mosquito', 'Mamut', 'Dragón de piedra'];
const MZ_UPS = [
  { id: 'pico', n: 'Pico', d: 'Excavas más rápido', max: 45, cost: (l) => Math.round(25 * Math.pow(1.62, l)) },
  { id: 'mochila', n: 'Mochila', d: '+6 lugares para minerales', max: 40, cost: (l) => Math.round(30 * Math.pow(1.55, l)) },
  { id: 'energia', n: 'Tanque de energía', d: '+35 de energía', max: 40, cost: (l) => Math.round(35 * Math.pow(1.56, l)) },
  { id: 'lampara', n: 'Lámpara', d: 'Ves más lejos en la oscuridad', max: 12, cost: (l) => Math.round(80 * Math.pow(2.1, l)) },
  { id: 'botas', n: 'Botas', d: 'Te mueves y subes más rápido', max: 12, cost: (l) => Math.round(60 * Math.pow(2.0, l)) },
  { id: 'suerte', n: 'Suerte', d: 'Más minerales y mejores', max: 20, cost: (l) => Math.round(150 * Math.pow(1.9, l)) },
  { id: 'cuerda', n: 'Cuerda ligera', d: 'Subir con la cuerda gasta menos energía', max: 10, cost: (l) => Math.round(200 * Math.pow(2.0, l)) },
];
const MZ_ITEMS = [
  { id: 'tnt', n: 'Dinamita', d: 'Rompe todo alrededor (3×3) y junta los minerales', p: 120, ic: '🧨' },
  { id: 'bebida', n: 'Bebida energética', d: 'Recupera la mitad de tu energía', p: 90, ic: '🧃' },
  { id: 'traje', n: 'Traje térmico', d: '25 s sin daño por lava ni gas', p: 300, ic: '🧯' },
  { id: 'tele', n: 'Teletransporte', d: 'Vuelves al campamento sin gastar energía', p: 400, ic: '🌀' },
];
const mzData = () => { const d = jpData('mina'); d.c ??= 0; d.up ||= {}; d.it ||= { tnt: 1, bebida: 1 }; d.best ??= 0; d.elev ??= 0; d.found ||= {}; d.fos ||= []; d.xp ??= 0; d.lvl ??= 1; d.ord ||= []; d.ordN ??= 0; d.st ||= {}; d.runs ??= 0; d.tot ??= 0; d.boss ||= {}; d.rel ||= []; d.pet ??= 0; return d; };
const mzUp = (id) => mzData().up[id] || 0;
const mzFmt = (n) => { n = Math.floor(n); if (n < 10000) return n.toLocaleString('es-MX'); const u = ['K', 'M', 'B', 'T', 'Qa']; let i = -1; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; } return (n >= 100 ? n.toFixed(0) : n.toFixed(1)).replace(/\.0$/, '') + u[i]; };
const mzZoneAt = (m) => { let s = 0; for (let i = 0; i < MZ_ZONES.length; i++) { if (m < MZ_ZONES[i].to) return { i, z: MZ_ZONES[i], from: s }; s = MZ_ZONES[i].to; } return { i: MZ_ZONES.length - 1, z: MZ_ZONES[MZ_ZONES.length - 1], from: s }; };
const mzHp = (m) => { const { i, z, from } = mzZoneAt(m); const nx = MZ_ZONES[Math.min(MZ_ZONES.length - 1, i + 1)]; const len = Math.min(600, z.to - from); const k = Math.min(1, (m - from) / len); return z.hp * Math.pow(nx.hp / z.hp, k); };
const mzHas = (r) => mzData().rel.includes(r);
const mzPick = () => Math.pow(1.55, mzUp('pico')) * (mzHas('guante') ? 1.25 : 1);
const mzCap = () => 10 + mzUp('mochila') * 6 + (mzHas('saco') ? 12 : 0);
const mzEmax = () => 100 + mzUp('energia') * 35 + (mzHas('corazon') ? 60 : 0);
const mzXpNeed = (l) => Math.round(80 * Math.pow(1.32, l - 1));
const mzVal = (o) => o.v * (1 + (mzData().lvl - 1) * 0.02) * (mzHas('lupa') ? 1.15 : 1);

/* ---------- encargos del gremio ---------- */
function mzOrders() {
  const d = mzData();
  while (d.ord.length < 3) {
    const reach = Math.max(30, d.best * 0.9);
    const pool = MZ_ORES.filter((o) => o.from <= reach);
    const o = pool[Math.max(0, pool.length - 1 - Math.floor(Math.random() * Math.min(4, pool.length)))];
    const qty = Math.max(3, Math.round((8 + Math.random() * 14) * Math.pow(0.82, MZ_ORES.indexOf(o))));
    d.ord.push({ id: o.id, q: qty, have: 0, rew: Math.round(mzVal(o) * qty * (2.2 + Math.random())) });
  }
  return d.ord;
}

/* ---------- dibujo de minerales (también en la tienda y el álbum) ---------- */
function mzGem(g, x, y, s, o, t = 0) {
  const k = MZ_ORES.indexOf(o);
  if (k <= 1) { g.fillStyle = o.c; for (const [dx, dy, r] of [[-0.2, -0.1, 0.17], [0.18, 0.05, 0.14], [-0.02, 0.2, 0.13], [0.12, -0.22, 0.1]]) { g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); g.fill(); } g.fillStyle = o.g; g.globalAlpha *= 0.6; g.beginPath(); g.arc(x - 0.24 * s, y - 0.14 * s, 0.05 * s, 0, 7); g.fill(); g.globalAlpha /= 0.6; return; }
  if (k <= 4) { g.fillStyle = o.c; g.beginPath(); g.moveTo(x - 0.28 * s, y + 0.1 * s); g.lineTo(x - 0.1 * s, y - 0.26 * s); g.lineTo(x + 0.22 * s, y - 0.18 * s); g.lineTo(x + 0.3 * s, y + 0.12 * s); g.lineTo(x + 0.02 * s, y + 0.28 * s); g.closePath(); g.fill(); g.fillStyle = o.g; g.beginPath(); g.moveTo(x - 0.1 * s, y - 0.2 * s); g.lineTo(x + 0.12 * s, y - 0.12 * s); g.lineTo(x - 0.04 * s, y); g.closePath(); g.fill(); return; }
  // gemas facetadas con brillo
  const sp = 0.85 + Math.sin(t * 4 + x) * 0.15;
  g.fillStyle = o.c; g.beginPath(); g.moveTo(x, y - 0.3 * s); g.lineTo(x + 0.28 * s, y - 0.06 * s); g.lineTo(x + 0.16 * s, y + 0.28 * s); g.lineTo(x - 0.16 * s, y + 0.28 * s); g.lineTo(x - 0.28 * s, y - 0.06 * s); g.closePath(); g.fill();
  g.fillStyle = o.g; g.globalAlpha *= 0.75; g.beginPath(); g.moveTo(x, y - 0.3 * s); g.lineTo(x + 0.1 * s, y - 0.06 * s); g.lineTo(x - 0.1 * s, y - 0.06 * s); g.closePath(); g.fill(); g.globalAlpha /= 0.75;
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = Math.max(1, s * 0.03); g.beginPath(); g.moveTo(x - 0.28 * s, y - 0.06 * s); g.lineTo(x + 0.28 * s, y - 0.06 * s); g.stroke();
  g.fillStyle = `rgba(255,255,255,${0.6 * sp})`; g.beginPath(); g.arc(x + 0.12 * s, y - 0.16 * s, 0.04 * s, 0, 7); g.fill();
}

/* ---------- guardianes, reliquias y mina del día ---------- */
const MZ_BOSS_M = [40, 120, 260, 450, 700, 1000, 1400, 2000];
const MZ_BOSSES = [
  { n: 'Golem de barro', c: '#8a5a34', e: '#ffd23c' }, { n: 'Guardián de arcilla', c: '#b0683c', e: '#ff9a3c' },
  { n: 'Coloso de piedra', c: '#7d838c', e: '#7ad0ff' }, { n: 'Centinela de cristal', c: '#6a7ec0', e: '#c8f0ff' },
  { n: 'Titán de granito', c: '#a9786f', e: '#ff7ab6' }, { n: 'Señor del magma', c: '#5a2a20', e: '#ff7a1f' },
  { n: 'Sombra de obsidiana', c: '#2e2840', e: '#b07aff' }, { n: 'Corazón del núcleo', c: '#3f5c4a', e: '#7dffb0' },
];
const MZ_RELICS = [
  { id: 'guante', n: 'Guante de barro', d: 'Excavas 25 % más rápido', ic: '🧤' },
  { id: 'casco', n: 'Casco del guardián', d: 'Tu lámpara alumbra mucho más', ic: '⛑️' },
  { id: 'saco', n: 'Saco sin fondo', d: '+12 lugares en la mochila', ic: '👝' },
  { id: 'brujula', n: 'Brújula antigua', d: 'Ves los tesoros aunque estén en la oscuridad', ic: '🧭' },
  { id: 'corazon', n: 'Corazón de la montaña', d: '+60 de energía', ic: '❤️‍🔥' },
  { id: 'amuleto', n: 'Amuleto de magma', d: 'La lava te hace 70 % menos daño y el gas no te afecta', ic: '🔥' },
  { id: 'reloj', n: 'Reloj de arena oscuro', d: 'La fiebre minera dura 4 s más', ic: '⏳' },
  { id: 'estrella', n: 'Estrella del núcleo', d: 'Los cofres dan el doble', ic: '🌟' },
  { id: 'lupa', n: 'Lupa del geólogo', d: 'Tus minerales valen 15 % más', ic: '🔍' },
  { id: 'trebol', n: 'Trébol de piedra', d: 'Más vetas de minerales', ic: '🍀' },
  { id: 'pluma', n: 'Botas de pluma', d: 'Te mueves y subes más rápido', ic: '🪶' },
  { id: 'escudo', n: 'Escudo de roca', d: 'Las rocas que caen te hacen la mitad de daño', ic: '🛡️' },
];
const MZ_MODS = [
  { k: 'oro', n: 'Fiebre del oro', d: 'El oro, la plata y los rubíes salen mucho más' },
  { k: 'gemas', n: 'Lluvia de gemas', d: 'Vetas más grandes y frecuentes' },
  { k: 'blanda', n: 'Tierra blanda', d: 'Excavas 30 % más rápido' },
  { k: 'noche', n: 'Noche eterna', d: 'Todo más oscuro, pero los cofres dan el doble' },
  { k: 'fiebre', n: 'Día de fiebre', d: 'La fiebre minera se llena el doble de rápido' },
  { k: 'tesoro', n: 'Cuevas secretas', d: 'Hay muchas más cuevas con tesoro' },
  { k: 'topi', n: 'Día de Topi', d: 'Tu topo ayudante trabaja el doble de rápido' },
];
const mzDay = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const mzMod = () => { let h = 11; for (const ch of mzDay()) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return MZ_MODS[h % MZ_MODS.length]; };
const mzPetCost = (l) => Math.round(1500 * Math.pow(2.1, l));
const mzNextBoss = () => { const d = mzData(); for (let i = 0; i < MZ_BOSS_M.length; i++) if (!d.boss[i]) return i; return -1; };
/* ---------- campamento (pantalla de inicio) ---------- */
function mzHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="mzhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3ff"/><stop offset=".3" stop-color="#d9f0ff"/><stop offset=".31" stop-color="#7a5132"/><stop offset=".58" stop-color="#6b717a"/><stop offset=".84" stop-color="#40241f"/><stop offset="1" stop-color="#1c1f44"/></linearGradient><radialGradient id="mzhG"><stop offset="0" stop-color="#ffd23c" stop-opacity=".9"/><stop offset="1" stop-color="#ffd23c" stop-opacity="0"/></radialGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#mzhS)"/><rect x="0" y="49" width="360" height="5" fill="#5aa63e"/>
    <g transform="translate(258 18)"><rect x="0" y="12" width="56" height="30" fill="#c98f5c"/><path d="M-6 14 L28 -4 L62 14z" fill="#e05a4a"/><rect x="22" y="24" width="12" height="18" fill="#6b4226"/></g>
    <path d="M120 54 V100 H160 V132" stroke="#1a120c" stroke-width="22" fill="none" opacity=".6"/>
    <g transform="translate(160 122)"><circle r="40" fill="url(#mzhG)"/><circle r="10" fill="#f2c6a0"/><path d="M-11 -4 q11 -15 22 0z" fill="#ffd23c"/><circle cx="5" cy="-11" r="3" fill="#fff8b0"/><rect x="-8" y="9" width="16" height="15" rx="5" fill="#2f6cff"/><path d="M10 0 l16 -10" stroke="#8a5a2c" stroke-width="3"/><path d="M22 -16 q8 6 2 14" stroke="#c9d2dc" stroke-width="3" fill="none"/></g>
    <g transform="translate(140 140)"><ellipse rx="9" ry="7" fill="#7a5a44"/><circle cx="7" cy="-1" r="2.2" fill="#ff9ab0"/><circle cx="3" cy="-3" r="1.2" fill="#000"/></g>
    <g transform="translate(272 128)"><rect x="-26" y="-22" width="52" height="40" rx="10" fill="#6b717a"/><circle cx="-10" cy="-6" r="5" fill="#7ad0ff"/><circle cx="10" cy="-6" r="5" fill="#7ad0ff"/><path d="M-12 8 h24" stroke="#2a2f36" stroke-width="4" stroke-linecap="round"/></g>
    <g>${[[50, 80, '#2b2b2b'], [84, 104, '#d9824a'], [222, 92, '#ffcf3a'], [320, 100, '#e8334f'], [60, 140, '#22c27a'], [220, 156, '#bff4ff'], [100, 160, '#a45cff']].map(([x, y, c]) => `<path d="M${x} ${y - 8} l8 6 -3 9 h-10 l-3 -9z" fill="${c}"/>`).join('')}</g></svg>`;
}
function viewMina() {
  const d = mzData(); mzOrders(); const mod = mzMod();
  const tabs = [['bajar', 'Bajar'], ['mejoras', 'Mejoras'], ['objetos', 'Objetos'], ['encargos', 'Encargos'], ['reliquias', 'Reliquias'], ['album', 'Álbum']];
  const seg = `<div class="mz-tabs" role="group">${tabs.map(([k, l]) => `<button type="button" data-act="mz-tab" data-v="${k}" aria-pressed="${MZ.tab === k}">${l}</button>`).join('')}</div>`;
  const lvlK = Math.min(1, d.xp / mzXpNeed(d.lvl));
  const head = `<div class="mz-head"><span>💰 <b>${mzFmt(d.c)}</b></span><span>Minero nv <b>${d.lvl}</b><i class="mz-xp"><i style="width:${lvlK * 100}%"></i></i></span><span>Récord <b>${d.best} m</b></span></div>`;
  let body = '';
  if (MZ.tab === 'bajar') {
    const el = []; for (let m = 0; m <= d.elev; m += 100) el.push(m);
    const nb = mzNextBoss();
    const bossMap = `<div class="mz-bmap">${MZ_BOSSES.map((b, i) => `<span class="${d.boss[i] ? 'ok' : i === nb ? 'next' : ''}" title="${b.n}"><i style="background:${b.c};box-shadow:0 0 0 2px ${b.e}"></i><small>${MZ_BOSS_M[i]} m</small></span>`).join('')}</div>`;
    body = `<div class="mz-mod"><b>⛏️ Mina de hoy: ${mod.n}</b><span>${mod.d}</span></div>
      <p class="page-sub">Excava, junta minerales y regresa a venderlos. Llena la <b>fiebre minera</b> juntando minerales seguidos, busca <b>cuevas secretas</b> y cuidado con las <b>rocas sueltas</b>. Al final de cada capa te espera un <b>Guardián</b>: derrótalo para bajar más y ganar una reliquia.</p>
      ${bossMap}<p class="small muted" style="text-align:center;margin:4px 0 10px">${nb < 0 ? '¡Derrotaste a todos los Guardianes!' : `Próximo Guardián: <b>${MZ_BOSSES[nb].n}</b> a ${MZ_BOSS_M[nb]} m`}</p>
      <div class="mz-elev">${el.map((m) => `<button type="button" class="btn ${m === el[el.length - 1] ? 'primary' : ''}" data-act="mz-start" data-m="${m}">${m === 0 ? `${icon('play')}Bajar desde la superficie` : `🛗 Elevador ${m} m · ${mzZoneAt(m).z.n}`}</button>`).join('')}</div>
      <div class="mz-stats"><span>Pico <b>${mzUp('pico') + 1}</b></span><span>Mochila <b>${mzCap()}</b></span><span>Energía <b>${mzEmax()}</b></span><span>Topi <b>${d.pet ? 'nv ' + d.pet : '—'}</b></span></div>
      <div id="jgRank-mina">${jgRankHTML('mina')}</div>`;
  } else if (MZ.tab === 'mejoras') {
    const pc = mzPetCost(d.pet), petMax = d.pet >= 10;
    body = `<div class="mz-pet"><div class="mz-pet-ic">🐹</div><div><b>${d.pet ? `Topi · nivel ${d.pet}` : 'Topi, tu topo ayudante'}</b><span class="small muted">${d.pet ? `Excava solo los minerales cerca de ti cada ${Math.max(1.6, 6 - d.pet * 0.45).toFixed(1)} s y alcanza ${1 + Math.floor(d.pet / 3)} ${1 + Math.floor(d.pet / 3) === 1 ? 'casilla' : 'casillas'}.` : 'Te sigue por la mina y excava minerales por ti.'}</span></div>${petMax ? '<span class="mz-ok">Máximo</span>' : `<button type="button" class="btn${d.c >= pc ? ' primary' : ''}" data-act="mz-pet" ${d.c >= pc ? '' : 'disabled'}>${d.pet ? 'Mejorar' : 'Adoptar'} · 💰 ${mzFmt(pc)}</button>`}</div>
      <ul class="mz-list">${MZ_UPS.map((u) => { const l = mzUp(u.id), max = l >= u.max, c = u.cost(l); return `<li><div><b>${u.n} · nv ${l + 1}</b><span class="small muted">${u.d}</span></div>${max ? '<span class="mz-ok">Máximo</span>' : `<button type="button" class="btn${d.c >= c ? ' primary' : ''}" data-act="mz-up" data-id="${u.id}" ${d.c >= c ? '' : 'disabled'}>💰 ${mzFmt(c)}</button>`}</li>`; }).join('')}</ul>`;
  } else if (MZ.tab === 'objetos') {
    body = `<p class="small muted" style="margin:10px 2px">Puedes llevar hasta 5 de cada uno. Se usan con los botones de la izquierda dentro de la mina.</p><ul class="mz-list">${MZ_ITEMS.map((it) => { const n = d.it[it.id] || 0, full = n >= 5; return `<li><span class="mz-ic">${it.ic}</span><div><b>${it.n} · tienes ${n}</b><span class="small muted">${it.d}</span></div>${full ? '<span class="mz-ok">Lleno</span>' : `<button type="button" class="btn${d.c >= it.p ? ' primary' : ''}" data-act="mz-item" data-id="${it.id}" ${d.c >= it.p ? '' : 'disabled'}>💰 ${mzFmt(it.p)}</button>`}</li>`; }).join('')}</ul>`;
  } else if (MZ.tab === 'encargos') {
    body = `<p class="small muted" style="margin:10px 2px">El gremio de mineros te paga extra por estos minerales. Cuentan al venderlos en el campamento.</p><ul class="mz-list">${mzOrders().map((o, i) => { const ore = MZ_ORES.find((x) => x.id === o.id); const done = o.have >= o.q; return `<li class="${done ? 'done' : ''}"><canvas width="64" height="64" data-mzgem="${o.id}"></canvas><div><b>${o.q} de ${ore.n}</b><div class="mz-bar"><i style="width:${Math.min(100, o.have / o.q * 100)}%"></i></div><span class="small muted">${Math.min(o.have, o.q)} / ${o.q}</span></div>${done ? `<button type="button" class="btn primary" data-act="mz-claim" data-i="${i}">Cobrar 💰 ${mzFmt(o.rew)}</button>` : `<span class="mz-rew">💰 ${mzFmt(o.rew)}</span>`}</li>`; }).join('')}</ul><p class="small muted" style="text-align:center">Encargos cumplidos: ${d.ordN}</p>`;
  } else if (MZ.tab === 'reliquias') {
    body = `<p class="small muted" style="margin:10px 2px">Las reliquias te dan poderes para siempre. Cada Guardián guarda una, y las demás aparecen en <b>cofres antiguos</b> muy profundos.</p>
      <div class="mz-rel">${MZ_RELICS.map((r, i) => { const has = d.rel.includes(r.id); return `<div class="${has ? 'on' : ''}"><span>${has ? r.ic : '❔'}</span><b>${has ? r.n : '???'}</b><small>${has ? r.d : i < 8 ? `La guarda el ${MZ_BOSSES[i].n}` : 'En un cofre antiguo'}</small></div>`; }).join('')}</div>
      <p class="small muted" style="text-align:center">Reliquias: ${d.rel.length}/${MZ_RELICS.length}</p>`;
  } else {
    body = `<h2 class="sec">Minerales</h2><div class="mz-album">${MZ_ORES.map((o) => { const n = d.found[o.id] || 0; return `<div class="${n ? '' : 'off'}"><canvas width="72" height="72" data-mzgem="${o.id}"></canvas><b>${n ? o.n : '???'}</b><span>${n ? `${mzFmt(n)} · 💰${mzFmt(mzVal(o))}` : `desde ${o.from} m`}</span></div>`; }).join('')}</div>
      <h2 class="sec">Fósiles · ${d.fos.length}/${MZ_FOSSILS.length}</h2><div class="mz-album fos">${MZ_FOSSILS.map((f, i) => `<div class="${d.fos.includes(i) ? '' : 'off'}"><span class="mz-fos">${d.fos.includes(i) ? '🦴' : '❔'}</span><b>${d.fos.includes(i) ? f : '???'}</b></div>`).join('')}</div>
      <p class="small muted" style="text-align:center">Al completar los ${MZ_FOSSILS.length} fósiles, todos tus minerales valen 25 % más.</p>`;
  }
  setTimeout(mzPaintGems, 0);
  return `<section class="gm-home"><div class="gm-hero">${mzHero()}</div><h1 class="page-title gm-title">Mina Profunda</h1>${head}${seg}${body}</section>`;
}
function mzPaintGems() { document.querySelectorAll('canvas[data-mzgem]').forEach((cv) => { const o = MZ_ORES.find((x) => x.id === cv.dataset.mzgem); const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); g.fillStyle = '#3b2a20'; g.beginPath(); g.roundRect(4, 4, cv.width - 8, cv.height - 8, 12); g.fill(); mzGem(g, cv.width / 2, cv.height / 2, cv.width * 0.8, o, 1); }); }
JG_CFG.mina = { tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Viajes']], val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'viaje', 'viajes') : `${x.score} m`), mine: (m) => `Tu más profundo: <b>${m.best || 0} m</b> · viajes: <b>${m.games || 0}</b>`, none: 'Aún nadie ha bajado en este periodo. ¡Sé la primera persona!' };
Object.assign(VIDA_ACTS, {
  'mz-tab': (el) => { MZ.tab = el.dataset.v; render(); },
  'mz-start': (el) => mzStart(+el.dataset.m || 0),
  'mz-up': (el) => { const d = mzData(); const u = MZ_UPS.find((x) => x.id === el.dataset.id); const l = mzUp(u.id); if (l >= u.max) return; const c = u.cost(l); if (d.c < c) return; d.c -= c; d.up[u.id] = l + 1; jpSave(); MZS.ok(); render(); },
  'mz-pet': () => { const d = mzData(); const c = mzPetCost(d.pet); if (d.pet >= 10 || d.c < c) return; d.c -= c; d.pet++; jpSave(); MZS.ok(); toast(d.pet === 1 ? '¡Adoptaste a Topi! Te acompañará en la mina' : `Topi subió a nivel ${d.pet}`); render(); },
  'mz-item': (el) => { const d = mzData(); const it = MZ_ITEMS.find((x) => x.id === el.dataset.id); if ((d.it[it.id] || 0) >= 5 || d.c < it.p) return; d.c -= it.p; d.it[it.id] = (d.it[it.id] || 0) + 1; jpSave(); MZS.ok(); render(); },
  'mz-claim': (el) => { const d = mzData(); const o = d.ord[+el.dataset.i]; if (!o || o.have < o.q) return; d.c += o.rew; d.ordN++; d.ord.splice(+el.dataset.i, 1); mzOrders(); jpSave(); MZS.sell(6); toast(`+${mzFmt(o.rew)} monedas del gremio`); render(); },
});

/* ---------- sonido ---------- */
const MZS = {
  ac: null, out: null, nb: 0, beat: 0,
  init() { if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume().catch(() => {}); return; } try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); const cp = this.ac.createDynamicsCompressor(); cp.connect(this.ac.destination); this.out = this.ac.createGain(); this.out.gain.value = 0.9; this.out.connect(cp); this.nb = this.ac.currentTime + 0.2; } catch { this.ac = null; } },
  tone(f, d, type, vol, f2, delay = 0) { const ac = this.ac; if (!ac) return; const t0 = ac.currentTime + delay; const o = ac.createOscillator(), v = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d * 0.8); v.gain.setValueAtTime(0.0001, t0); v.gain.linearRampToValueAtTime(vol, t0 + 0.005); v.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(v); v.connect(this.out); o.start(t0); o.stop(t0 + d + 0.05); },
  noise(d, vol, f0, f1, delay = 0) { const ac = this.ac; if (!ac) return; const t0 = ac.currentTime + delay; const n = Math.max(1, Math.floor(ac.sampleRate * d)); const b = ac.createBuffer(1, n, ac.sampleRate); const ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = ac.createBufferSource(); s.buffer = b; const fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + d); const v = ac.createGain(); v.gain.value = vol; s.connect(fl); fl.connect(v); v.connect(this.out); s.start(t0); },
  hit(h) { this.noise(0.06, 0.08, 1300 + Math.random() * 600 - Math.min(800, h * 4), 500); this.tone(150 + Math.random() * 50, 0.05, 'triangle', 0.03); },
  brk() { this.noise(0.18, 0.12, 900, 200); this.tone(120, 0.12, 'triangle', 0.05, 70); },
  ore(k, combo = 0) { const f = 620 * Math.pow(2, (Math.min(k, 11) + Math.min(combo, 12)) / 12); this.tone(f, 0.25, 'sine', 0.06); this.tone(f * 1.5, 0.2, 'sine', 0.03, 0, 0.05); if (k >= 5) this.tone(f * 2, 0.35, 'triangle', 0.03, 0, 0.1); },
  chest() { [0, 4, 7, 12, 16].forEach((s, i) => this.tone(523 * Math.pow(2, s / 12), 0.35, 'triangle', 0.05, 0, i * 0.07)); },
  relic() { [0, 4, 7, 11, 12, 16, 19, 24].forEach((s, i) => this.tone(392 * Math.pow(2, s / 12), 0.5, 'triangle', 0.05, 0, i * 0.09)); this.noise(1.2, 0.04, 2000, 6000, 0.1); },
  boom() { this.noise(0.7, 0.25, 600, 60); this.tone(80, 0.6, 'sine', 0.12, 30); },
  gas() { this.noise(0.6, 0.08, 3000, 400); },
  lava() { this.noise(0.4, 0.07, 400, 1500); this.tone(90, 0.3, 'sawtooth', 0.03, 60); },
  step() { this.tone(200 + Math.random() * 40, 0.04, 'sine', 0.02); },
  low() { this.tone(440, 0.12, 'square', 0.03); this.tone(330, 0.15, 'square', 0.03, 0, 0.14); },
  full() { this.tone(300, 0.15, 'triangle', 0.04, 200); },
  zone() { [0, 3, 7, 10, 14].forEach((s, i) => this.tone(262 * Math.pow(2, s / 12), 0.6, 'triangle', 0.04, 0, i * 0.09)); },
  rope() { this.noise(1.0, 0.05, 300, 2000); [0, 4, 7].forEach((s, i) => this.tone(392 * Math.pow(2, s / 12), 0.3, 'sine', 0.04, 0, 0.5 + i * 0.1)); },
  sell(n) { for (let i = 0; i < Math.min(12, n); i++) this.tone(1046 + i * 40, 0.08, 'square', 0.02, 0, i * 0.06); this.tone(1568, 0.35, 'triangle', 0.05, 0, Math.min(12, n) * 0.06); },
  ok() { this.init(); [0, 4, 7].forEach((s, i) => this.tone(523 * Math.pow(2, s / 12), 0.2, 'triangle', 0.05, 0, i * 0.05)); },
  lvl() { [0, 4, 7, 12, 7, 12, 16].forEach((s, i) => this.tone(392 * Math.pow(2, s / 12), 0.3, 'square', 0.025, 0, i * 0.08)); },
  faint() { [7, 4, 0, -5].forEach((s, i) => this.tone(392 * Math.pow(2, s / 12), 0.4, 'triangle', 0.05, 0, i * 0.16)); },
  fever() { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => this.tone(523 * Math.pow(2, s / 12), 0.25, 'square', 0.03, 0, i * 0.04)); this.noise(0.6, 0.05, 1500, 5000); },
  roar() { this.tone(70, 1.0, 'sawtooth', 0.09, 45); this.noise(0.9, 0.12, 300, 80); },
  bhit() { this.tone(110 + Math.random() * 30, 0.12, 'square', 0.05, 70); this.noise(0.1, 0.1, 700, 200); },
  bdie() { this.boom(); [0, 7, 12, 16, 19, 24].forEach((s, i) => this.tone(262 * Math.pow(2, s / 12), 0.6, 'triangle', 0.06, 0, 0.3 + i * 0.1)); },
  rock() { this.noise(0.35, 0.12, 500, 120); this.tone(90, 0.25, 'triangle', 0.06, 50); },
  wobble() { this.noise(0.25, 0.05, 200, 400); },
  pet() { this.tone(900, 0.06, 'sine', 0.04, 1300); this.tone(1300, 0.08, 'sine', 0.03, 1700, 0.06); },
  room() { [0, 5, 9, 12].forEach((s, i) => this.tone(440 * Math.pow(2, s / 12), 0.5, 'sine', 0.04, 0, i * 0.12)); },
  music(on, fever, zi) {
    const ac = this.ac; if (!ac || !on) { if (ac) this.nb = Math.max(this.nb, ac.currentTime); return; }
    const base = [196, 185, 165, 175, 156, 147, 139, 131, 123][zi % 9];
    while (this.nb < ac.currentTime + 0.3) {
      const st = this.beat % 16, t = this.nb - ac.currentTime;
      if (st % 8 === 0) this.tone(base / 2, 1.6, 'sine', 0.025, 0, t);
      if (fever) this.tone(base * [2, 3, 4, 6][st % 4] * (st % 8 < 4 ? 1 : 1.12), 0.12, 'square', 0.012, 0, t);
      else if (st % 4 === 2) this.tone(base * [3, 4, 2.5, 3.5][(this.beat >> 2) % 4], 0.5, 'triangle', 0.01, 0, t);
      this.nb += fever ? 0.11 : 0.2; this.beat++;
    }
  },
};

/* ---------- la mina ---------- */
function mzStart(startM = 0) {
  if (MZ.run) return; MZS.init();
  const D = mzData(); mzOrders(); const MOD = mzMod();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage mz-stage';
  wrap.innerHTML = `<canvas aria-label="Mina Profunda"></canvas>
    <div class="mz-hud"><button class="gm-x" id="mzP" aria-label="Pausa"><svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="#333"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="#333"/></svg></button>
      <div class="mz-hc"><b id="mzDepth">0 m</b><span id="mzZone"></span><div class="mz-en"><i id="mzEn"></i><em id="mzEnT"></em></div><div class="mz-fev" id="mzFevBox"><i id="mzFev"></i><em id="mzFevT">Fiebre minera</em></div></div>
      <div class="mz-hr"><span id="mzBag">🎒 0/0</span><span id="mzCargo">💰 0</span></div></div>
    <div class="mz-boss" id="mzBoss" hidden><b id="mzBossN"></b><div><i id="mzBossHp"></i></div></div>
    <div class="mz-items" id="mzItems"></div>
    <button class="mz-rope" id="mzRope">🪢 Subir</button>
    <div class="mz-pad" id="mzPad"><button data-d="U" aria-label="Arriba">▲</button><button data-d="L" aria-label="Izquierda">◀</button><button data-d="D" aria-label="Abajo">▼</button><button data-d="R" aria-label="Derecha">▶</button></div>
    <div class="mz-msg" id="mzMsg"></div>
    <div class="gl-over" id="mzPause" hidden><b>Pausa</b><span class="small muted" id="mzPauseInfo"></span><div class="btn-row" style="justify-content:center;flex-wrap:wrap"><button class="btn primary" id="mzGo">${icon('play')}Seguir</button><button class="btn" id="mzMus">Música: sí</button><button class="btn" id="mzUpB">🪢 Subir y vender</button><button class="btn" id="mzQuit">Salir sin vender</button></div></div>
    <div class="gl-over mz-sum" id="mzSum" hidden></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const $w = (s) => wrap.querySelector(s);
  const c = wrap.querySelector('canvas'), g = c.getContext('2d');
  const V = { w: 360, h: 640, dpr: 1, T: 48, cx: null, cy: 0 };
  let SPR = new Map();
  const size = () => { V.dpr = Math.min(2, devicePixelRatio || 1); V.w = innerWidth; V.h = innerHeight; c.width = Math.round(V.w * V.dpr); c.height = Math.round(V.h * V.dpr); c.style.width = V.w + 'px'; c.style.height = V.h + 'px'; V.T = Math.max(36, Math.min(66, Math.floor(V.w / 8.5))); SPR = new Map(); V.cx = null; };
  size(); addEventListener('resize', size);
  const low = () => !!(window.cnPerf && window.cnPerf.low());
  let music = true;

  /* --- mundo --- */
  const seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  const R0 = Math.round(startM / MZ_RM);
  const rows = new Map();
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263 + seed) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const luck = mzUp('suerte');
  const fossilsLeft = () => MZ_FOSSILS.map((_, i) => i).filter((i) => !D.fos.includes(i));
  const GOLDY = new Set(['oro', 'plata', 'rubi']);
  function pickOre(m, r1) {
    const cand = MZ_ORES.filter((o) => m >= o.from && m < o.to); if (!cand.length) return -1;
    let tot = 0; const w = cand.map((o, i) => { const mid = o.from + Math.min(600, o.to - o.from) * 0.45, sd = Math.max(40, Math.min(300, (o.to - o.from) / 3)); let x = Math.exp(-((m - mid) ** 2) / (2 * sd * sd)) * Math.pow(1 + luck * 0.06, i) + 0.05; if (MOD.k === 'oro' && GOLDY.has(o.id)) x *= 3; tot += x; return x; });
    let r = r1 * tot; for (let i = 0; i < cand.length; i++) { r -= w[i]; if (r <= 0) return MZ_ORES.indexOf(cand[i]); } return MZ_ORES.indexOf(cand[cand.length - 1]);
  }
  const bestOre = (m) => { let b = 0; MZ_ORES.forEach((o, i) => { if (o.from <= m && m < o.to) b = i; }); return b; };
  const bossAt = (R) => { for (let i = 0; i < MZ_BOSS_M.length; i++) { const Rb = MZ_BOSS_M[i] / MZ_RM; if (R >= Rb && R <= Rb + 2 && !D.boss[i]) return { i, Rb }; } return null; };
  const nearBoss = (R) => MZ_BOSS_M.some((m) => Math.abs(R - m / MZ_RM) < 8);
  const roomAt = (R) => { const b = Math.floor(R / 24); if (b < 2) return null; if (hash(b * 17 + 3, 5555) > (MOD.k === 'tesoro' ? 0.7 : 0.34)) return null; const r0 = b * 24 + 4 + Math.floor(hash(b, 77) * 12); const c0 = 1 + Math.floor(hash(b, 99) * 7); if (nearBoss(r0) || r0 < R0 + 3) return null; return { r0, c0 }; };
  const bosses = {};
  function row(R) {
    let rw = rows.get(R); if (rw) return rw;
    rw = [];
    const bb = R >= R0 ? bossAt(R) : null;
    if (bb && !bosses[bb.i]) { const max = (18 + bb.i * 5) * mzHp(MZ_BOSS_M[bb.i] + 2); bosses[bb.i] = { i: bb.i, Rb: bb.Rb, hp: max, max, atk: 2.5, hitT: 0, awake: false, t: 0, roared: false }; }
    const rm = R >= R0 ? roomAt(R) : null;
    for (let x = 0; x < MZ_COLS; x++) {
      if (R < R0) { rw.push(startM === 0 ? { e: 1, sky: 1 } : (x === 6 ? { e: 1, shaft: 1 } : { wall: 1 })); continue; }
      if (R === R0 && x === 6) { rw.push({ e: 1 }); continue; }
      if (bb) { rw.push(x >= 5 && x <= 7 ? { boss: bb.i, bx: x - 5, br: R - bb.Rb } : { sello: bb.i }); continue; }
      const m = R * MZ_RM, z = mzZoneAt(m).i;
      if (rm && x >= rm.c0 && x <= rm.c0 + 4) {
        if (R >= rm.r0 && R <= rm.r0 + 2) { rw.push({ e: 1, room: rm.r0 }); continue; }
        if (R === rm.r0 + 3) { const cl = { z, hard: 0, ore: x === rm.c0 + 2 ? -1 : bestOre(m), sp: x === rm.c0 + 2 ? 'chest' : null, prog: 0, v: 1 }; cl.hp = mzHp(m); rw.push(cl); continue; }
        if (R === rm.r0 - 1) { const cl = { z, hard: 1, ore: -1, sp: null, prog: 0, v: 2, crys: 1 }; cl.hp = mzHp(m) * 3; rw.push(cl); continue; }
      }
      const h1 = hash(x, R), h2 = hash(x + 101, R * 7 + 3), h3 = hash(x * 13 + 7, R + 999);
      const cave = m > 30 && h1 < 0.025 + Math.min(0.05, m / 20000);
      if (cave) { rw.push(m >= 450 && h2 < 0.35 ? { e: 1, lava: 1 } : { e: 1 }); continue; }
      const cell = { z, hard: h3 < 0.05 + Math.min(0.08, m / 15000) ? 1 : 0, ore: -1, sp: null, prog: 0, v: (h2 * 3) | 0 };
      cell.hp = mzHp(m) * (cell.hard ? 3.5 : 1);
      // vetas: zonas de 3×3 donde casi todo es el mismo mineral
      const vx = Math.floor(x / 3), vy = Math.floor(R / 3), vein = hash(vx + 500, vy + 900);
      const veinP = 0.11 * (MOD.k === 'gemas' ? 1.8 : 1) * (mzHas('trebol') ? 1.4 : 1) * (1 + luck * 0.03);
      if (m > 6 && vein < veinP && hash(x + 3, R + 31) < 0.6) cell.ore = pickOre(m, hash(vx + 7, vy + 3));
      else if (h2 < 0.06 + luck * 0.004) cell.ore = pickOre(m, hash(x + 55, R + 77));
      else if (h2 < 0.066) cell.sp = 'chest';
      else if (m >= 500 && h2 < 0.0672) cell.sp = 'cofreA';
      else if (m >= 60 && h2 < 0.0705 && fossilsLeft().length) cell.sp = 'fossil';
      else if (m >= 300 && h2 < 0.0735) cell.sp = 'geode';
      else if (m >= 260 && h2 < 0.0855) cell.sp = 'gas';
      else if (m >= 90 && h2 < 0.1035) cell.sp = 'suelta';
      if (m >= 450 && !cell.sp && cell.ore < 0 && h3 > 1 - Math.min(0.045, 0.012 + (m - 450) / 30000)) { rw.push({ e: 1, lava: 1 }); continue; }
      rw.push(cell);
    }
    rows.set(R, rw); return rw;
  }
  const cell = (x, R) => (x < 0 || x >= MZ_COLS ? null : row(R)[x]);
  const solid = (cl) => cl && !cl.e;

  /* --- estado --- */
  const st = {
    px: 6, pr: startM === 0 ? R0 - 1 : R0, fx: 6, fr: startM === 0 ? R0 - 1 : R0, move: null, dig: null, face: 1, swing: 0,
    E: mzEmax(), bag: [], slots: 0, cargoV: 0, maxM: startM, t: 0, parts: [], floats: [], fly: [], fall: [], shake: 0, flash: 0, suit: 0, state: 'run',
    lowWarned: false, zoneShown: mzZoneAt(startM).i, newElev: [], records: 0, coinsTree: 0, t0: Date.now(), last: performance.now(), id: 0, ropeSure: 0, gas: [],
    fev: 0, fevT: 0, combo: 0, comboT: 0, trail: [], rooms: new Set(), bossKills: [], relics: [], pet: null, boss: null,
  };
  if (D.pet) st.pet = { fx: st.px - 1, fy: st.pr, cd: 3, act: null };
  const mOf = (R) => Math.max(0, R * MZ_RM);
  const msg = (t, ms = 1500) => { const el = $w('#mzMsg'); el.textContent = t; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); clearTimeout(msg.t); msg.t = setTimeout(() => el.classList.remove('on'), ms); };
  const float = (text, x, R, col, big) => st.floats.push({ text, x, R, t: 0, col: col || '#fff', big });
  const chips = (x, R, col, n, sp = 140) => { const cap = low() ? 50 : 150; for (let i = 0; i < n && st.parts.length < cap; i++) { const a = Math.random() * 6.28, v = sp * (0.3 + Math.random()); st.parts.push({ x: x + 0.5, R: R + 0.5, vx: Math.cos(a) * v / V.T, vy: Math.sin(a) * v / V.T - 1.5, t: 0, l: 0.5 + Math.random() * 0.5, c: col, r: 2 + Math.random() * 2.5 }); } };
  const vib = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch { /* */ } };
  const bagFull = () => st.slots >= mzCap();
  const addXp = (n) => { D.xp += n; while (D.xp >= mzXpNeed(D.lvl)) { D.xp -= mzXpNeed(D.lvl); D.lvl++; MZS.lvl(); msg(`¡Subiste a minero nivel ${D.lvl}! Tus minerales valen un poco más`, 2200); st.flash = 0.5; } };
  function collectOre(oi, x, R, free) {
    const o = MZ_ORES[oi]; const n = st.fevT > 0 ? 2 : 1;
    if (bagFull()) { MZS.full(); msg('🎒 ¡Mochila llena! Sube a vender o mejora tu mochila', 1800); return; }
    st.bag.push({ oi, n }); st.slots++; st.cargoV += mzVal(o) * n; D.found[o.id] = (D.found[o.id] || 0) + n; addXp(Math.max(1, Math.round(Math.sqrt(o.v))) * n);
    if ((D.found[o.id] || 0) === n) msg(`¡Nuevo mineral: ${o.n}!`, 1800);
    st.combo = st.comboT > 0 ? st.combo + 1 : 1; st.comboT = 2.6;
    MZS.ore(oi, st.combo); float(`+${n > 1 ? '2 ' : ''}${o.n}${st.combo >= 3 ? ` · combo ×${st.combo}` : ''}`, x, R, o.g); chips(x, R, o.c, low() ? 5 : 10, 160);
    if (oi >= 7) { st.flash = 0.25; vib(25); }
    const p = screenOf(x, R); st.fly.push({ x: p.x + V.T / 2, y: p.y + V.T / 2, t: 0, oi });
    if (st.fevT <= 0) { st.fev += (0.07 + oi * 0.008) * (MOD.k === 'fiebre' ? 2 : 1) * (1 + Math.min(10, st.combo) * 0.05); if (st.fev >= 1) { st.fev = 0; st.fevT = 8 + (mzHas('reloj') ? 4 : 0); MZS.fever(); msg('🔥 ¡FIEBRE MINERA! Excavas rapidísimo y todo vale doble', 2200); st.flash = 0.6; vib([30, 40, 30]); } }
    void free;
  }
  function chestReward(x, R, ancient) {
    const m = mOf(R); let coins = Math.round((20 + m * 3.2) * (0.7 + Math.random() * 0.8) * (ancient ? 6 : 1) * (mzHas('estrella') ? 2 : 1) * (MOD.k === 'noche' ? 2 : 1));
    if (ancient) { const left = MZ_RELICS.slice(8).filter((r) => !D.rel.includes(r.id)); if (left.length) { const r = left[(Math.random() * left.length) | 0]; D.rel.push(r.id); st.relics.push(r.id); MZS.relic(); msg(`🏺 ¡Cofre antiguo! Reliquia: ${r.ic} ${r.n} — ${r.d}`, 3200); st.flash = 0.8; } else coins *= 2; }
    D.c += coins; if (!ancient) MZS.chest(); float(`🎁 +${mzFmt(coins)}`, x, R, '#ffe066', true); chips(x, R, '#ffd23c', 18, 220);
    if (!ancient && Math.random() < 0.35) { const it = MZ_ITEMS[(Math.random() * 3) | 0]; D.it[it.id] = Math.min(5, (D.it[it.id] || 0) + 1); msg(`¡Cofre! +💰${mzFmt(coins)} y ${it.ic} ${it.n}`, 1800); paintItems(); } else if (!ancient) msg(`¡Cofre! +💰${mzFmt(coins)}`, 1400);
  }
  function breakCell(x, R, free) {
    const cl = cell(x, R); if (!cl || cl.e || cl.wall || cl.sello != null || cl.boss != null) return;
    const z = MZ_ZONES[cl.z]; chips(x, R, cl.crys ? '#cfe6ff' : z.a, low() ? 5 : 10); MZS.brk();
    if (!free) st.E -= 0.7 + Math.log10(1 + cl.hp) * 0.35;
    const sp = cl.sp, ore = cl.ore; Object.keys(cl).forEach((k) => delete cl[k]); cl.e = 1;
    if (ore >= 0) collectOre(ore, x, R, free);
    if (sp === 'chest') chestReward(x, R, false);
    if (sp === 'cofreA') chestReward(x, R, true);
    if (sp === 'fossil') { const left = fossilsLeft(); if (left.length) { const f = left[(Math.random() * left.length) | 0]; D.fos.push(f); MZS.chest(); msg(`🦴 ¡Fósil nuevo: ${MZ_FOSSILS[f]}! (${D.fos.length}/${MZ_FOSSILS.length})`, 2200); st.flash = 0.4; addXp(40); if (D.fos.length === MZ_FOSSILS.length) msg('¡Completaste los fósiles! Tus minerales valen 25 % más', 2600); } }
    if (sp === 'geode') { const m = mOf(R); MZS.chest(); msg('💎 ¡Geoda! Estaba llena de gemas', 1600); for (let k = 0; k < 4; k++) { const oi = pickOre(m + 80, Math.random()); if (oi >= 0) collectOre(oi, x, R, true); } }
    if (sp === 'gas') { st.gas.push({ x, R, t: 0 }); MZS.gas(); if (st.suit > 0 || mzHas('amuleto')) msg('Tu protección evitó el gas', 1300); else { st.E -= 12 + mOf(R) * 0.02; st.shake = 0.3; msg('☁️ ¡Bolsa de gas! −energía', 1300); } }
    // roca suelta encima: se derrumba
    const up = cell(x, R - 1); if (up && up.sp === 'suelta' && !up.e) { const zz = up.z; Object.keys(up).forEach((k) => delete up[k]); up.e = 1; st.fall.push({ x, R: R - 1, vy: 0, wob: 0.7, kind: 'suelta', z: zz }); MZS.wobble(); }
  }
  /* --- guardianes --- */
  function hitBoss(b, dmg) {
    b.hp -= dmg; b.hitT = 0.12;
    if (b.hp <= 0) killBoss(b);
  }
  function killBoss(b) {
    if (b.dead) return; b.dead = true; D.boss[b.i] = 1; st.bossKills.push(b.i);
    const B = MZ_BOSSES[b.i]; MZS.bdie(); st.shake = 1; st.flash = 1; vib([60, 50, 120]);
    for (let k = 0; k < 4; k++) chips(5 + Math.random() * 3, b.Rb + Math.random() * 3, k % 2 ? B.e : B.c, 20, 320);
    const coins = Math.round(300 * Math.pow(b.i + 1, 2.3)); D.c += coins; addXp(200 * (b.i + 1)); jgCoins(3);
    const r = MZ_RELICS[b.i]; let rt = ''; if (!D.rel.includes(r.id)) { D.rel.push(r.id); st.relics.push(r.id); rt = ` · Reliquia: ${r.ic} ${r.n}`; setTimeout(() => MZS.relic(), 900); }
    msg(`🏆 ¡Derrotaste al ${B.n}! +💰${mzFmt(coins)}${rt}`, 3600);
    for (let R = b.Rb; R <= b.Rb + 2; R++) rows.delete(R);
    for (let R = b.Rb; R <= b.Rb + 2; R++) { const rw = row(R); for (let x = 5; x <= 7; x++) { Object.keys(rw[x]).forEach((k) => delete rw[x][k]); rw[x].e = 1; } }
    st.fall = st.fall.filter((f) => f.kind !== 'boss'); st.boss = null; jpSave();
  }
  function bossTick(dt) {
    let near = null;
    for (const k in bosses) { const b = bosses[k]; if (b.dead) continue; if (st.pr < b.Rb && b.Rb - st.pr <= 8) near = b; }
    st.boss = near; if (!near) return;
    const b = near; b.t += dt; if (b.hitT > 0) b.hitT -= dt;
    if (!b.roared) { b.roared = true; MZS.roar(); st.shake = 0.6; msg(`⚠️ ¡${MZ_BOSSES[b.i].n}! Golpéalo con el pico y esquiva sus rocas`, 2800); }
    b.atk -= dt;
    if (b.atk <= 0) {
      b.atk = Math.max(1.5, 3.2 - b.i * 0.2) * (0.8 + Math.random() * 0.4);
      const cols = [st.px, st.px + (Math.random() < 0.5 ? -1 : 1)];
      for (const x of cols) { if (x < 0 || x >= MZ_COLS) continue; let R = st.pr - 1; let n = 0; while (n < 4 && cell(x, R - 1) && cell(x, R - 1).e) { R--; n++; } if (cell(x, R) && cell(x, R).e) st.fall.push({ x, R, vy: 0, wob: 0.75, kind: 'boss', z: mzZoneAt(mOf(R)).i }); }
      if (Math.random() < 0.4) { MZS.roar(); st.shake = 0.35; }
    }
  }
  function fallTick(dt) {
    for (const f of st.fall) {
      if (f.wob > 0) { f.wob -= dt; continue; }
      f.vy = Math.min(14, f.vy + 32 * dt); f.R += f.vy * dt;
      const below = cell(f.x, Math.floor(f.R) + 1);
      if (f.x === st.px && Math.abs(f.R - st.fr) < 0.6 && st.state === 'run') {
        const dmg = (8 + mOf(st.pr) * 0.012 + (f.kind === 'boss' ? 4 : 0)) * (mzHas('escudo') ? 0.5 : 1);
        st.E -= dmg; st.shake = 0.5; MZS.rock(); vib(60); chips(f.x, f.R, '#9a8a7a', 14, 200); msg(`💥 ¡Te cayó una roca! −${Math.round(dmg)} de energía`, 1400); f.done = true; continue;
      }
      if (!below || !below.e) { f.done = true; MZS.rock(); chips(f.x, f.R + 0.4, '#9a8a7a', 8, 120);
        if (f.kind === 'suelta') { const here = cell(f.x, Math.floor(f.R)); if (here && here.e && !here.lava && !(f.x === st.px && Math.floor(f.R) === st.pr)) { Object.assign(here, { z: f.z, hard: 0, ore: -1, sp: null, prog: 0, v: 0, hp: mzHp(mOf(Math.floor(f.R))) }); delete here.e; delete here.room; } }
      }
    }
    st.fall = st.fall.filter((f) => !f.done && f.R < st.pr + 40);
  }
  /* --- Topi --- */
  function petTick(dt) {
    const p = st.pet; if (!p) return;
    const goal = st.trail[1] || { x: st.px - st.face, y: st.pr };
    if (p.act) {
      p.act.t += dt; const k = Math.min(1, p.act.t / 0.35);
      p.fx = p.act.sx + (p.act.x - p.act.sx) * k; p.fy = p.act.sy + (p.act.y - p.act.sy) * k - Math.sin(k * Math.PI) * 0.6;
      if (k >= 1 && !p.act.hit) { p.act.hit = true; const cl = cell(p.act.x, p.act.y); if (cl && !cl.e && cl.ore >= 0) { breakCell(p.act.x, p.act.y, true); float('¡Topi!', p.act.x, p.act.y - 0.4, '#ffd8a8'); MZS.pet(); } }
      if (p.act.t > 0.6) p.act = null;
      return;
    }
    p.fx += (goal.x - p.fx) * Math.min(1, dt * 8); p.fy += (goal.y - p.fy) * Math.min(1, dt * 8);
    p.cd -= dt * (MOD.k === 'topi' ? 2 : 1);
    if (p.cd <= 0 && st.state === 'run') {
      p.cd = Math.max(1.6, 6 - D.pet * 0.45); const r = 1 + Math.floor(D.pet / 3); let best = null, bd = 99;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = st.px + dx, y = st.pr + dy; const cl = cell(x, y); if (!cl || cl.e || cl.ore < 0 || cl.boss != null || cl.sello != null) continue; const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b2]) => { const n = cell(x + a, y + b2); return n && n.e; }); if (!open) continue; const dd = Math.abs(dx) + Math.abs(dy); if (dd < bd) { bd = dd; best = { x, y }; } }
      if (best) p.act = { x: best.x, y: best.y, sx: p.fx, sy: p.fy, t: 0 };
    }
  }

  function tryDir(d) {
    if (st.move || st.state !== 'run') return;
    const dx = d === 'L' ? -1 : d === 'R' ? 1 : 0, dy = d === 'D' ? 1 : d === 'U' ? -1 : 0;
    if (dx) st.face = dx;
    const nx = st.px + dx, nr = st.pr + dy;
    if (nx < 0 || nx >= MZ_COLS) return;
    if (nr < (startM === 0 ? R0 - 1 : R0 - 6)) return;
    const cl = cell(nx, nr); if (!cl || cl.wall) return;
    if (cl.e) {
      st.move = { fx: st.px, fr: st.pr, tx: nx, tr: nr, t: 0, dur: (dy < 0 ? 0.24 : 0.14) / (1 + mzUp('botas') * 0.12) / (mzHas('pluma') ? 1.25 : 1) };
      st.E -= dy < 0 ? 0.6 : 0.2; if (!low()) MZS.step();
      return;
    }
    if (cl.sello != null) { if (!st.selloMsg || st.t - st.selloMsg > 3) { st.selloMsg = st.t; msg(`🔒 Roca sellada: derrota al ${MZ_BOSSES[cl.sello].n} para pasar`, 2200); MZS.full(); } return; }
    if (!st.dig || st.dig.x !== nx || st.dig.r !== nr) st.dig = { x: nx, r: nr, t: 0 };
  }
  let held = null;
  const press = (d) => { MZS.init(); held = d; tryDir(d); };
  const release = (d) => { if (!d || held === d) held = null; st.dig = null; };

  /* --- controles --- */
  const pad = $w('#mzPad');
  pad.addEventListener('pointerdown', (e) => { const b = e.target.closest('button[data-d]'); if (!b) return; e.preventDefault(); b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch { /* */ } press(b.dataset.d); });
  pad.addEventListener('pointerup', () => { pad.querySelectorAll('button').forEach((x) => x.classList.remove('on')); release(); });
  pad.addEventListener('pointercancel', () => { pad.querySelectorAll('button').forEach((x) => x.classList.remove('on')); release(); });
  let cDown = false;
  const dirFrom = (e) => { const p = screenOf(st.fx, st.fr); const dx = e.clientX - (p.x + V.T / 2), dy = e.clientY - (p.y + V.T / 2); if (Math.hypot(dx, dy) < V.T * 0.3) return null; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U'); };
  c.addEventListener('pointerdown', (e) => { MZS.init(); cDown = true; const d = dirFrom(e); if (d) press(d); try { c.setPointerCapture(e.pointerId); } catch { /* */ } });
  c.addEventListener('pointermove', (e) => { if (!cDown) return; const d = dirFrom(e); if (d && d !== held) { st.dig = null; press(d); } });
  const cUp = () => { cDown = false; release(); }; c.addEventListener('pointerup', cUp); c.addEventListener('pointercancel', cUp);
  const KEYS = { ArrowLeft: 'L', a: 'L', A: 'L', ArrowRight: 'R', d: 'R', D: 'R', ArrowDown: 'D', s: 'D', S: 'D', ArrowUp: 'U', w: 'U', W: 'U' };
  const onKey = (e) => { const d = KEYS[e.key]; if (e.type === 'keydown') { if (d) { e.preventDefault(); if (held !== d) press(d); } else if (e.key === 'Escape' || e.key === 'p') pause(); } else if (d && held === d) release(d); };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  const onVis = () => { if (document.hidden && st.state === 'run') pause(); }; document.addEventListener('visibilitychange', onVis);

  /* --- objetos --- */
  function paintItems() { $w('#mzItems').innerHTML = MZ_ITEMS.map((it) => `<button type="button" data-it="${it.id}" ${(D.it[it.id] || 0) > 0 ? '' : 'disabled'} aria-label="${it.n}">${it.ic}<i>${D.it[it.id] || 0}</i></button>`).join(''); }
  paintItems();
  $w('#mzItems').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-it]'); if (!b || st.state !== 'run') return; const id = b.dataset.it; if (!(D.it[id] > 0)) return;
    D.it[id]--; MZS.init();
    if (id === 'tnt') { MZS.boom(); st.shake = 0.7; st.flash = 0.6; let hitB = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const cl = cell(st.px + dx, st.pr + dy); if (!cl) continue; if (cl.boss != null && !hitB) { hitB = true; const bb = bosses[cl.boss]; if (bb && !bb.dead) hitBoss(bb, bb.max * 0.18); } else if (!cl.e && !cl.wall && cl.sello == null) breakCell(st.px + dx, st.pr + dy, true); } chips(st.px, st.pr, '#ff9a3c', 30, 320); msg(hitB ? '💥 ¡La dinamita lastimó al Guardián!' : '💥 ¡Bum!', 1100); }
    else if (id === 'bebida') { st.E = Math.min(mzEmax(), st.E + mzEmax() * 0.5); MZS.ok(); msg('🧃 +50 % de energía', 1200); st.lowWarned = false; }
    else if (id === 'traje') { st.suit = 25; MZS.ok(); msg('🧯 Traje térmico: 25 s sin daño de lava ni gas', 1600); }
    else if (id === 'tele') { MZS.rope(); finish('tele'); }
    paintItems(); jpSave();
  });
  const ropeCost = () => Math.max(2, mOf(st.pr) * 0.11 * (1 - mzUp('cuerda') * 0.07));
  $w('#mzRope').addEventListener('click', () => { MZS.init(); if (st.state !== 'run') return; const cost = ropeCost(); if (st.E >= cost) { st.E -= cost; MZS.rope(); finish('rope'); } else if (st.ropeSure > st.t) finish('rescue'); else { st.ropeSure = st.t + 3; msg(`No te alcanza la energía (necesitas ${Math.ceil(cost)}). Toca otra vez: te rescatan, pero pierdes la mitad de la mochila`, 3000); } });

  /* --- pausa --- */
  let paused = false;
  function pause() { if (st.state !== 'run') return; paused = !paused; const p = $w('#mzPause'); p.hidden = !paused; if (paused) { p.classList.add('show'); $w('#mzPauseInfo').textContent = `Llevas ${st.slots} minerales (💰 ${mzFmt(st.cargoV)}). Subir cuesta ${Math.ceil(ropeCost())} de energía.`; } else st.last = performance.now(); held = null; st.dig = null; }
  $w('#mzP').addEventListener('click', pause);
  $w('#mzGo').addEventListener('click', pause);
  $w('#mzMus').addEventListener('click', () => { music = !music; $w('#mzMus').textContent = `Música: ${music ? 'sí' : 'no'}`; });
  $w('#mzUpB').addEventListener('click', () => { paused = false; $w('#mzPause').hidden = true; $w('#mzRope').click(); });
  $w('#mzQuit').addEventListener('click', () => { paused = false; st.bag = []; st.slots = 0; st.cargoV = 0; finish('quit'); });

  /* --- lógica --- */
  function step(dt) {
    st.t += dt; if (st.suit > 0) st.suit -= dt;
    if (st.state !== 'run') return;
    const p = st;
    if (st.fevT > 0) { st.fevT -= dt; if (st.fevT <= 0) msg('La fiebre se calmó. ¡Junta minerales para llenarla otra vez!', 1600); if (!low() && Math.random() < dt * 20) chips(st.fx + (Math.random() - 0.5), st.fr + (Math.random() - 0.5), '#ffd23c', 1, 60); }
    else st.fev = Math.max(0, st.fev - dt * 0.03);
    st.comboT -= dt; if (st.comboT <= 0) st.combo = 0;
    if (p.move) {
      p.move.t += dt; const k = Math.min(1, p.move.t / p.move.dur);
      p.fx = p.move.fx + (p.move.tx - p.move.fx) * k; p.fr = p.move.fr + (p.move.tr - p.move.fr) * k;
      if (k >= 1) { p.px = p.move.tx; p.pr = p.move.tr; p.move = null; arrive(); }
    } else {
      const below = cell(p.px, p.pr + 1);
      if (below && below.e && held !== 'U') { p.move = { fx: p.px, fr: p.pr, tx: p.px, tr: p.pr + 1, t: 0, dur: 0.07 }; }
      else if (held && !p.dig) tryDir(held);
    }
    if (p.dig && !p.move) {
      const cl = cell(p.dig.x, p.dig.r);
      if (!cl || cl.e) p.dig = null;
      else {
        const pw = mzPick() * (p.dig.r < p.pr ? 0.6 : 1) * (st.fevT > 0 ? 2.4 : 1) * (MOD.k === 'blanda' ? 1.3 : 1);
        p.swing += dt * (st.fevT > 0 ? 24 : 14); p.dig.t += dt;
        const tick = Math.floor(p.dig.t * 7) !== Math.floor((p.dig.t - dt) * 7);
        if (cl.boss != null) {
          const b = bosses[cl.boss]; if (b && !b.dead) { hitBoss(b, dt * pw / 0.32); if (tick) { MZS.bhit(); chips(p.dig.x, p.dig.r, MZ_BOSSES[b.i].e, 3, 120); vib(8); } }
          if (!b || b.dead) p.dig = null;
        } else {
          cl.prog = (cl.prog || 0) + dt * pw / (cl.hp * 0.32);
          if (tick) { MZS.hit(cl.hp); if (!low()) chips(p.dig.x, p.dig.r, MZ_ZONES[cl.z].a, 2, 80); }
          if (cl.prog >= 1) { breakCell(p.dig.x, p.dig.r, false); p.dig = null; if (held) tryDir(held); }
        }
      }
    }
    const here = cell(p.px, p.pr);
    if (here && here.lava && st.suit <= 0) { p.E -= dt * (14 + mOf(p.pr) * 0.012) * (mzHas('amuleto') ? 0.3 : 1); if (Math.random() < dt * 4) MZS.lava(); if (Math.random() < 0.3) chips(p.px, p.pr, '#ff7a1f', 1, 60); }
    for (const gs of st.gas) gs.t += dt; st.gas = st.gas.filter((gs) => gs.t < 2.5);
    bossTick(dt); fallTick(dt); petTick(dt);
    if (p.E <= mzEmax() * 0.2 && !p.lowWarned) { p.lowWarned = true; MZS.low(); msg('⚠️ Poca energía: ¡sube pronto!', 2000); }
    if (p.E <= 0) { p.E = 0; MZS.faint(); finish('rescue'); }
  }
  function fx(dt) {
    for (const q of st.parts) { q.t += dt; q.vy += 9 * dt; q.x += q.vx * dt; q.R += q.vy * dt; } st.parts = st.parts.filter((q) => q.t < q.l);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 1.3);
    for (const f of st.fly) f.t += dt; st.fly = st.fly.filter((f) => f.t < 0.7);
    if (st.shake > 0) st.shake -= dt; if (st.flash > 0) st.flash -= dt * 1.5;
  }
  function arrive() {
    const m = mOf(st.pr);
    st.trail.unshift({ x: st.px, y: st.pr }); st.trail.length = Math.min(st.trail.length, 3);
    if (m > st.maxM) {
      const before = st.maxM; st.maxM = m;
      if (Math.floor(m / 100) > Math.floor(before / 100) && m >= 100) { const em = Math.floor(m / 100) * 100; if (em > D.elev) { D.elev = em; st.newElev.push(em); msg(`🛗 ¡Elevador de ${em} m desbloqueado!`, 2000); MZS.chest(); } }
      if (m > D.best && Math.floor(m / 100) > Math.floor(D.best / 100)) { if (st.coinsTree < 10) { st.coinsTree += 2; jgCoins(2); } }
      if (m > D.best) { D.best = m; st.records++; }
    }
    const zi = mzZoneAt(m).i; if (zi !== st.zoneShown && zi > st.zoneShown) { st.zoneShown = zi; MZS.zone(); msg(`Nueva capa: ${MZ_ZONES[zi].n}`, 2200); st.flash = 0.35; }
    const h = cell(st.px, st.pr); if (h && h.room != null && !st.rooms.has(h.room)) { st.rooms.add(h.room); MZS.room(); msg('✨ ¡Encontraste una cueva secreta! Abajo hay un tesoro', 2200); st.flash = 0.4; }
  }

  /* --- dibujo --- */
  const screenOf = (fx, fr) => { const T = V.T; return { x: fx * T - V.cx, y: fr * T - V.cy }; };
  const camTarget = () => { const T = V.T, ww = MZ_COLS * T; return { x: ww <= V.w ? (ww - V.w) / 2 : Math.max(0, Math.min(ww - V.w, (st.fx + 0.5) * T - V.w / 2)), y: (st.fr + 0.5) * T - V.h * 0.42 }; };
  function blockSprite(z, v, hard, crys) {
    const key = `b${z}|${v}|${hard}|${crys ? 1 : 0}`; let cv = SPR.get(key); if (cv) return cv; const T = V.T, k = V.dpr; cv = document.createElement('canvas'); cv.width = Math.ceil(T * k); cv.height = Math.ceil(T * k); const q = cv.getContext('2d'); q.scale(k, k);
    const Z = MZ_ZONES[z]; const gr = q.createLinearGradient(0, 0, T, T); gr.addColorStop(0, crys ? '#9fd8ff' : hard ? Z.b : Z.a); gr.addColorStop(1, crys ? '#5a7ac8' : Z.b); q.fillStyle = gr; q.fillRect(0, 0, T, T);
    let s = (z * 31 + v * 17 + hard * 5 + (crys ? 99 : 0)) >>> 0; const r = () => ((s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296);
    for (let i = 0; i < 9; i++) { q.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.09)'; const w = T * (0.08 + r() * 0.12); q.beginPath(); q.ellipse(r() * T, r() * T, w, w * 0.6, r() * 3, 0, 7); q.fill(); }
    if (z === 3 || crys) { q.fillStyle = 'rgba(200,230,255,.45)'; q.beginPath(); q.moveTo(T * 0.2, T * 0.8); q.lineTo(T * 0.28, T * 0.5); q.lineTo(T * 0.36, T * 0.8); q.fill(); q.beginPath(); q.moveTo(T * 0.6, T * 0.75); q.lineTo(T * 0.7, T * 0.4); q.lineTo(T * 0.8, T * 0.75); q.fill(); }
    if (z === 8) { q.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 4; i++) q.fillRect(r() * T, r() * T, 1.5, 1.5); }
    if (hard && !crys) { q.strokeStyle = 'rgba(0,0,0,.35)'; q.lineWidth = 2; q.strokeRect(3, 3, T - 6, T - 6); q.strokeStyle = 'rgba(255,255,255,.12)'; q.beginPath(); q.moveTo(5, T - 5); q.lineTo(T - 5, 5); q.stroke(); }
    q.fillStyle = 'rgba(255,255,255,.1)'; q.fillRect(0, 0, T, 2); q.fillStyle = 'rgba(0,0,0,.22)'; q.fillRect(0, T - 2, T, 2); q.fillRect(T - 2, 0, 2, T);
    SPR.set(key, cv); return cv;
  }
  function oreSprite(oi) { const key = 'o' + oi; let cv = SPR.get(key); if (cv) return cv; const T = V.T, k = V.dpr; cv = document.createElement('canvas'); cv.width = Math.ceil(T * k); cv.height = Math.ceil(T * k); const q = cv.getContext('2d'); q.scale(k, k); mzGem(q, T / 2, T / 2, T * 0.82, MZ_ORES[oi], 0); SPR.set(key, cv); return cv; }
  function drawSpecial(sp, x, y, T) {
    if (sp === 'chest' || sp === 'cofreA') { const anc = sp === 'cofreA'; g.fillStyle = anc ? '#3a3a5a' : '#8a5a2c'; g.fillRect(x + T * 0.2, y + T * 0.35, T * 0.6, T * 0.42); g.fillStyle = anc ? '#5a5a8a' : '#a8703a'; g.beginPath(); g.ellipse(x + T * 0.5, y + T * 0.36, T * 0.3, T * 0.13, 0, Math.PI, 0); g.fill(); g.fillStyle = anc ? '#7dffe0' : '#ffd23c'; g.fillRect(x + T * 0.2, y + T * 0.48, T * 0.6, T * 0.06); g.fillRect(x + T * 0.46, y + T * 0.44, T * 0.08, T * 0.14); if (anc) { g.fillStyle = `rgba(125,255,224,${0.3 + 0.2 * Math.sin(st.t * 4)})`; g.beginPath(); g.arc(x + T / 2, y + T / 2, T * 0.45, 0, 7); g.fill(); } }
    else if (sp === 'fossil') { g.strokeStyle = '#f4ead8'; g.lineWidth = T * 0.07; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + T * 0.3, y + T * 0.65); g.lineTo(x + T * 0.7, y + T * 0.35); g.stroke(); for (const [cx, cy] of [[0.27, 0.68], [0.33, 0.62], [0.67, 0.38], [0.73, 0.32]]) { g.fillStyle = '#f4ead8'; g.beginPath(); g.arc(x + T * cx, y + T * cy, T * 0.07, 0, 7); g.fill(); } g.lineCap = 'butt'; }
    else if (sp === 'geode') { g.fillStyle = '#5a3a7a'; g.beginPath(); g.arc(x + T / 2, y + T / 2, T * 0.3, 0, 7); g.fill(); g.fillStyle = '#d6b4ff'; for (let i = 0; i < 6; i++) { const a = i * 1.047 + st.t * 0.3; g.beginPath(); g.moveTo(x + T / 2, y + T / 2); g.lineTo(x + T / 2 + Math.cos(a) * T * 0.22, y + T / 2 + Math.sin(a) * T * 0.22); g.lineTo(x + T / 2 + Math.cos(a + 0.4) * T * 0.16, y + T / 2 + Math.sin(a + 0.4) * T * 0.16); g.fill(); } }
    else if (sp === 'gas') { g.fillStyle = 'rgba(140,230,90,.55)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x + T * (0.3 + i * 0.2), y + T * (0.5 + Math.sin(st.t * 3 + i) * 0.08), T * 0.08, 0, 7); g.fill(); } }
    else if (sp === 'suelta') { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + T / 2, y + T * 0.55, T * 0.34, T * 0.3, 0, 0, 7); g.fill(); g.fillStyle = '#8a7a6a'; g.beginPath(); g.ellipse(x + T / 2, y + T * 0.5, T * 0.32, T * 0.28, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + T * 0.3, y + T * 0.4); g.lineTo(x + T * 0.5, y + T * 0.55); g.lineTo(x + T * 0.42, y + T * 0.7); g.stroke(); }
  }
  function drawBoss(b) {
    const B = MZ_BOSSES[b.i], T = V.T; const p = screenOf(5, b.Rb); const W3 = T * 3;
    if (p.y > V.h + T || p.y + W3 < -T) return;
    const k = Math.max(0, b.hp / b.max), br = 1 + Math.sin(b.t * 2.2) * 0.02, cx = p.x + W3 / 2, cy = p.y + W3 / 2;
    g.save(); g.translate(cx, cy); g.scale(br, br);
    if (b.hitT > 0) g.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    const gr = g.createRadialGradient(-W3 * 0.15, -W3 * 0.2, W3 * 0.1, 0, 0, W3 * 0.6); gr.addColorStop(0, '#ffffff22'); gr.addColorStop(0.2, B.c); gr.addColorStop(1, '#000000'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(-W3 * 0.45, W3 * 0.45); g.lineTo(-W3 * 0.48, -W3 * 0.2); g.quadraticCurveTo(-W3 * 0.4, -W3 * 0.5, 0, -W3 * 0.48); g.quadraticCurveTo(W3 * 0.4, -W3 * 0.5, W3 * 0.48, -W3 * 0.2); g.lineTo(W3 * 0.45, W3 * 0.45); g.closePath(); g.fill();
    // grietas según el daño
    g.strokeStyle = B.e; g.globalAlpha = 0.25 + (1 - k) * 0.7; g.lineWidth = 2 + (1 - k) * 2;
    const cr = Math.floor((1 - k) * 7); for (let i = 0; i < cr; i++) { const a = i * 2.3; g.beginPath(); g.moveTo(Math.cos(a) * W3 * 0.08, Math.sin(a) * W3 * 0.08); g.lineTo(Math.cos(a + 0.3) * W3 * 0.28, Math.sin(a + 0.3) * W3 * 0.28); g.lineTo(Math.cos(a - 0.2) * W3 * 0.42, Math.sin(a - 0.2) * W3 * 0.42); g.stroke(); }
    g.globalAlpha = 1;
    // ojos y boca
    const eyeK = st.boss === b ? 1.2 : 0.9; g.fillStyle = B.e; g.shadowColor = B.e; g.shadowBlur = 18;
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * W3 * 0.16, -W3 * 0.12, W3 * 0.07 * eyeK, W3 * 0.05 * eyeK * (Math.sin(b.t * 0.7) > 0.97 ? 0.15 : 1), s * 0.25, 0, 7); g.fill(); }
    g.beginPath(); g.moveTo(-W3 * 0.16, W3 * 0.14); for (let i = 0; i <= 6; i++) g.lineTo(-W3 * 0.16 + i * W3 * 0.053, W3 * 0.14 + (i % 2 ? W3 * 0.05 : 0)); g.lineTo(W3 * 0.16, W3 * 0.2); g.lineTo(-W3 * 0.16, W3 * 0.2); g.closePath(); g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1; g.shadowBlur = 0;
    if (b.hitT > 0) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-W3 / 2, -W3 / 2, W3, W3); }
    g.restore();
  }
  function drawMiner(x, y, T) {
    const cx = x + T / 2, by = y + T * 0.95; const s = T / 48;
    g.save(); g.translate(cx, by); g.scale(st.face * s, s);
    const walk = st.move ? Math.sin(st.t * 22) * 2 : 0;
    if (st.fevT > 0) { g.fillStyle = `rgba(255,200,60,${0.25 + 0.15 * Math.sin(st.t * 12)})`; g.beginPath(); g.ellipse(0, -24, 24, 30, 0, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0, 13, 3.5, 0, 0, 7); g.fill();
    g.fillStyle = '#3a4a6b'; g.fillRect(-8, -14 + walk * 0.3, 6, 14); g.fillRect(2, -14 - walk * 0.3, 6, 14);
    g.fillStyle = st.fevT > 0 ? '#ff922b' : '#2f6cff'; g.beginPath(); g.roundRect(-11, -32, 22, 20, 6); g.fill();
    g.fillStyle = '#ffd23c'; g.fillRect(-11, -24, 22, 3);
    g.fillStyle = '#f2c6a0'; g.beginPath(); g.arc(0, -40, 9, 0, 7); g.fill();
    g.fillStyle = '#2a1a12'; g.beginPath(); g.arc(3.5, -41, 1.4, 0, 7); g.fill();
    g.fillStyle = '#ffcf3a'; g.beginPath(); g.arc(0, -44, 10.5, Math.PI, 0); g.fill(); g.fillRect(-11.5, -45, 23, 3);
    g.fillStyle = '#fff8b0'; g.beginPath(); g.arc(7, -48, 3, 0, 7); g.fill();
    const dig = st.dig && !st.move; const dd = dig ? (st.dig.r > st.pr ? 1.1 : st.dig.r < st.pr ? -1.2 : 0) : 0; const ang = dig ? -0.9 + Math.abs(Math.sin(st.swing)) * 1.6 + dd * 0.4 : -0.3;
    g.save(); g.translate(8, -26); g.rotate(ang); g.strokeStyle = '#8a5a2c'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(18, 0); g.stroke(); g.strokeStyle = st.fevT > 0 ? '#ffd23c' : '#c9d2dc'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(16, -9); g.quadraticCurveTo(22, 0, 16, 9); g.stroke(); g.restore();
    if (st.suit > 0) { g.strokeStyle = `rgba(120,200,255,${0.5 + 0.3 * Math.sin(st.t * 6)})`; g.lineWidth = 2.5; g.beginPath(); g.arc(0, -24, 26, 0, 7); g.stroke(); }
    g.restore();
  }
  function drawPet(T) {
    const p = st.pet; if (!p) return; const s = screenOf(p.fx, p.fy); const x = s.x + T / 2, y = s.y + T * 0.9, k = T / 48;
    g.save(); g.translate(x, y); g.scale(k * (st.face || 1), k);
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0, 10, 3, 0, 0, 7); g.fill();
    g.fillStyle = '#7a5a44'; g.beginPath(); g.ellipse(0, -10, 12, 10, 0, 0, 7); g.fill();
    g.fillStyle = '#9a7a60'; g.beginPath(); g.ellipse(2, -8, 7, 6, 0, 0, 7); g.fill();
    g.fillStyle = '#ff9ab0'; g.beginPath(); g.arc(11, -11, 3, 0, 7); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.arc(6, -14, 1.6, 0, 7); g.fill();
    g.fillStyle = '#ffd23c'; g.beginPath(); g.arc(0, -18, 8, Math.PI, 0); g.fill();
    g.fillStyle = '#f2c6a0'; g.fillRect(-8, -2, 4, 3); g.fillRect(4, -2, 4, 3);
    g.restore();
  }
  let bagPos = { x: 0, y: 0, t: -1 };
  function draw(dt) {
    const W = V.w, H = V.h, T = V.T; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    const ct = camTarget(); if (V.cx == null) { V.cx = ct.x; V.cy = ct.y; } else { const k = Math.min(1, dt * 12); V.cx += (ct.x - V.cx) * k; V.cy += (ct.y - V.cy) * k; }
    const sh = st.shake > 0 ? st.shake * 10 : 0; if (sh) g.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh);
    const o = screenOf(0, 0); const r0 = Math.floor(-o.y / T) - 1, r1 = Math.ceil((H - o.y) / T) + 1;
    g.fillStyle = '#0b0b10'; g.fillRect(-20, -20, W + 40, H + 40);
    const marks = [];
    for (let R = r0; R <= r1; R++) {
      const y = o.y + R * T, rw = row(R); const m = mOf(R);
      if (R < R0 && startM === 0) {
        const sky = g.createLinearGradient(0, y, 0, y + T); sky.addColorStop(0, '#8fd0ff'); sky.addColorStop(1, '#cfeeff'); g.fillStyle = sky; g.fillRect(-20, y, W + 40, T + 1);
        if (R === R0 - 1) { g.fillStyle = '#5aa63e'; g.fillRect(-20, y + T - 5, W + 40, 6); const cx = o.x + 1 * T; g.fillStyle = '#c98f5c'; g.fillRect(cx, y + T * 0.25, T * 1.6, T * 0.72); g.fillStyle = '#e05a4a'; g.beginPath(); g.moveTo(cx - T * 0.15, y + T * 0.3); g.lineTo(cx + T * 0.8, y - T * 0.2); g.lineTo(cx + T * 1.75, y + T * 0.3); g.fill(); g.fillStyle = '#6b4226'; g.fillRect(cx + T * 0.6, y + T * 0.5, T * 0.4, T * 0.47); g.fillStyle = '#fff'; g.font = `700 ${Math.round(T * 0.22)}px system-ui`; g.textAlign = 'center'; g.fillText('Campamento', cx + T * 0.8, y + T * 0.15); }
        continue;
      }
      const Z = MZ_ZONES[mzZoneAt(m).i];
      g.fillStyle = Z.bg; g.fillRect(o.x, y, MZ_COLS * T, T + 1);
      for (let x = 0; x < MZ_COLS; x++) {
        const cl = rw[x], X = o.x + x * T; if (X < -T || X > W) continue;
        if (cl.wall) { g.fillStyle = '#1a1a20'; g.fillRect(X, y, T, T); continue; }
        if (cl.shaft) { g.fillStyle = '#2b2b33'; g.fillRect(X, y, T, T); g.strokeStyle = '#555'; g.lineWidth = 2; g.beginPath(); g.moveTo(X + T * 0.2, y); g.lineTo(X + T * 0.2, y + T); g.moveTo(X + T * 0.8, y); g.lineTo(X + T * 0.8, y + T); g.stroke(); continue; }
        if (cl.boss != null) continue;
        if (cl.sello != null) { const B = MZ_BOSSES[cl.sello]; g.fillStyle = '#15131c'; g.fillRect(X, y, T, T); g.strokeStyle = B.e; g.globalAlpha = 0.35 + 0.2 * Math.sin(st.t * 2 + x); g.lineWidth = 1.6; g.beginPath(); g.arc(X + T / 2, y + T / 2, T * 0.22, 0, 7); g.moveTo(X + T / 2, y + T * 0.2); g.lineTo(X + T / 2, y + T * 0.8); g.stroke(); g.globalAlpha = 1; g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(X, y + T - 2, T, 2); continue; }
        if (cl.lava) { const gr = g.createLinearGradient(0, y, 0, y + T); gr.addColorStop(0, '#ffb23c'); gr.addColorStop(1, '#e8430f'); g.fillStyle = gr; g.fillRect(X, y, T, T); g.fillStyle = 'rgba(255,240,150,.55)'; g.beginPath(); for (let k = 0; k <= 4; k++) g.lineTo(X + k * T / 4, y + T * 0.2 + Math.sin(st.t * 3 + k + x) * T * 0.06); g.lineTo(X + T, y); g.lineTo(X, y); g.fill(); continue; }
        if (cl.e) { g.fillStyle = cl.room != null ? 'rgba(120,90,200,.18)' : 'rgba(0,0,0,.25)'; g.fillRect(X, y, T, T); continue; }
        g.drawImage(blockSprite(cl.z, cl.v, cl.hard, cl.crys), X, y, T, T);
        if (cl.ore >= 0) g.drawImage(oreSprite(cl.ore), X, y, T, T);
        if (cl.sp) { drawSpecial(cl.sp, X, y, T); if (cl.sp === 'chest' || cl.sp === 'cofreA' || cl.sp === 'fossil' || cl.sp === 'geode') marks.push([X, y]); }
        if (cl.prog > 0) { const k = Math.min(1, cl.prog); g.strokeStyle = `rgba(0,0,0,${0.35 + k * 0.4})`; g.lineWidth = 2; g.beginPath(); g.moveTo(X + T * 0.5, y + T * 0.5); g.lineTo(X + T * (0.5 - 0.35 * k), y + T * (0.5 - 0.3 * k)); g.moveTo(X + T * 0.5, y + T * 0.5); g.lineTo(X + T * (0.5 + 0.38 * k), y + T * (0.5 - 0.1 * k)); g.moveTo(X + T * 0.5, y + T * 0.5); g.lineTo(X + T * (0.5 + 0.1 * k), y + T * (0.5 + 0.4 * k)); if (k > 0.5) { g.moveTo(X + T * 0.5, y + T * 0.5); g.lineTo(X + T * (0.5 - 0.3 * k), y + T * (0.5 + 0.3 * k)); } g.stroke(); }
      }
      if (m > 0 && m % 100 === 0 && R >= R0) { g.fillStyle = 'rgba(255,214,90,.85)'; g.font = `800 ${Math.round(T * 0.26)}px system-ui`; g.textAlign = 'left'; g.fillText(`— ${m} m —`, o.x + 4, y + T * 0.3); }
    }
    for (const k in bosses) { const b = bosses[k]; if (!b.dead) drawBoss(b); }
    for (const gs of st.gas) { const s2 = screenOf(gs.x, gs.R); g.fillStyle = `rgba(140,230,90,${0.45 * (1 - gs.t / 2.5)})`; g.beginPath(); g.arc(s2.x + T / 2, s2.y + T / 2, T * (0.6 + gs.t * 0.6), 0, 7); g.fill(); }
    for (const f of st.fall) { const s2 = screenOf(f.x + (f.wob > 0 ? Math.sin(st.t * 60) * 0.04 : 0), f.R); g.fillStyle = f.kind === 'boss' ? '#5a4a4a' : '#8a7a6a'; g.beginPath(); g.ellipse(s2.x + T / 2, s2.y + T / 2, T * 0.34, T * 0.3, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 1.5; g.stroke(); if (f.wob > 0) { const ps = screenOf(f.x, st.pr); g.fillStyle = `rgba(255,60,60,${0.25 + 0.25 * Math.sin(st.t * 20)})`; g.beginPath(); g.ellipse(ps.x + T / 2, ps.y + T * 0.95, T * 0.4, T * 0.1, 0, 0, 7); g.fill(); } }
    drawPet(T);
    const pp = screenOf(st.fx, st.fr); drawMiner(pp.x, pp.y, T);
    for (const q of st.parts) { const s2 = screenOf(q.x - 0.5, q.R - 0.5); g.globalAlpha = Math.max(0, 1 - q.t / q.l); g.fillStyle = q.c; g.fillRect(s2.x + T / 2 - q.r, s2.y + T / 2 - q.r, q.r * 2, q.r * 2); } g.globalAlpha = 1;
    // oscuridad
    const dm = mOf(st.fr); const dark = Math.max(0, Math.min(MOD.k === 'noche' ? 0.95 : 0.9, (dm - 16) / 260 + (MOD.k === 'noche' ? 0.1 : 0)));
    if (dark > 0) { const lr = (2.6 + mzUp('lampara') * 0.55 + (mzHas('casco') ? 1.5 : 0) - (MOD.k === 'noche' ? 0.7 : 0) + (st.fevT > 0 ? 1 : 0)) * T; const lx = pp.x + T / 2, ly = pp.y + T / 2; const gr = g.createRadialGradient(lx, ly, lr * 0.35, lx, ly, lr); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${dark})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    if (dark > 0 && mzHas('brujula')) for (const [X, y] of marks) { const a = 0.5 + 0.3 * Math.sin(st.t * 4 + X); g.fillStyle = `rgba(255,230,120,${a})`; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 2 : 7, an = i * Math.PI / 4 + st.t; g.lineTo(X + T / 2 + Math.cos(an) * r, y + T / 2 + Math.sin(an) * r); } g.fill(); }
    if (st.fevT > 0) { const k = 0.18 + 0.08 * Math.sin(st.t * 8); const gr = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.7); gr.addColorStop(0, 'rgba(255,180,40,0)'); gr.addColorStop(1, `rgba(255,170,30,${k})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    g.textAlign = 'center'; for (const f of st.floats) { const s2 = screenOf(f.x, f.R); g.globalAlpha = Math.max(0, 1 - f.t / 1.3); g.font = `900 ${Math.round(T * (f.big ? 0.4 : 0.3))}px system-ui`; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.6)'; const yy = s2.y - f.t * 40; g.strokeText(f.text, s2.x + T / 2, yy); g.fillStyle = f.col; g.fillText(f.text, s2.x + T / 2, yy); } g.globalAlpha = 1;
    // minerales que vuelan a la mochila
    if (st.t - bagPos.t > 0.5) { const r = $w('#mzBag').getBoundingClientRect(); bagPos = { x: r.left + r.width / 2, y: r.top + r.height / 2, t: st.t }; }
    for (const f of st.fly) { const k = Math.min(1, f.t / 0.7), e = k * k * (3 - 2 * k); const x = f.x + (bagPos.x - f.x) * e, y = f.y + (bagPos.y - f.y) * e - Math.sin(k * Math.PI) * 60; const sp = oreSprite(f.oi); const s = T * (1 - k * 0.6); g.globalAlpha = 1 - k * 0.3; g.drawImage(sp, x - s / 2, y - s / 2, s, s); } g.globalAlpha = 1;
    if (st.flash > 0) { g.fillStyle = `rgba(255,255,255,${st.flash * 0.4})`; g.fillRect(0, 0, W, H); }
  }
  let hudT = 0;
  function hud() {
    const m = mOf(st.pr); $w('#mzDepth').textContent = `${m} m`;
    const nb = mzNextBoss(); $w('#mzZone').textContent = st.pr < R0 ? 'Superficie' : `${MZ_ZONES[mzZoneAt(m).i].n}${nb >= 0 && MZ_BOSS_M[nb] > m ? ` · Guardián a ${MZ_BOSS_M[nb]} m` : ''}`;
    const k = Math.max(0, st.E / mzEmax()); const en = $w('#mzEn'); en.style.width = `${k * 100}%`; en.style.background = k > 0.5 ? '#40c057' : k > 0.2 ? '#fab005' : '#fa5252'; $w('#mzEnT').textContent = `${Math.ceil(st.E)} / ${mzEmax()}`;
    const fv = $w('#mzFev'); const fb = $w('#mzFevBox'); if (st.fevT > 0) { fv.style.width = `${st.fevT / (8 + (mzHas('reloj') ? 4 : 0)) * 100}%`; fb.classList.add('on'); $w('#mzFevT').textContent = `🔥 FIEBRE ${Math.ceil(st.fevT)}s`; } else { fv.style.width = `${st.fev * 100}%`; fb.classList.remove('on'); $w('#mzFevT').textContent = st.combo >= 3 ? `Fiebre minera · combo ×${st.combo}` : 'Fiebre minera'; }
    $w('#mzBag').textContent = `🎒 ${st.slots}/${mzCap()}`; $w('#mzBag').classList.toggle('full', bagFull()); $w('#mzCargo').textContent = `💰 ${mzFmt(st.cargoV)}`;
    const rb = $w('#mzRope'); const cost = ropeCost(); rb.textContent = st.pr < R0 ? '🏕️ Campamento' : `🪢 Subir · ${Math.ceil(cost)}⚡`; rb.classList.toggle('warn', st.E < cost);
    const bx = $w('#mzBoss'); if (st.boss) { bx.hidden = false; $w('#mzBossN').textContent = MZ_BOSSES[st.boss.i].n; $w('#mzBossHp').style.width = `${Math.max(0, st.boss.hp / st.boss.max) * 100}%`; $w('#mzBossHp').style.background = MZ_BOSSES[st.boss.i].e; } else bx.hidden = true;
  }

  /* --- fin del viaje: vender --- */
  function finish(how) {
    if (st.state !== 'run') return; st.state = 'done'; held = null; st.dig = null;
    let lost = 0;
    if (how === 'rescue') { const keep = Math.ceil(st.bag.length / 2); lost = st.bag.length - keep; st.bag.sort(() => Math.random() - 0.5); st.bag = st.bag.slice(0, keep); }
    const counts = {}; for (const b of st.bag) counts[b.oi] = (counts[b.oi] || 0) + b.n;
    const fosBonus = D.fos.length >= MZ_FOSSILS.length ? 1.25 : 1;
    let total = 0; const lines = Object.entries(counts).sort((a, b) => b[0] - a[0]).map(([oi, n]) => { const o = MZ_ORES[oi]; const v = Math.round(mzVal(o) * n * fosBonus); total += v; for (const od of D.ord) if (od.id === o.id) od.have += n; return `<li><canvas width="40" height="40" data-mzgem="${o.id}"></canvas><span>${n} × ${o.n}</span><b>💰 ${mzFmt(v)}</b></li>`; });
    D.c += total; D.tot += total; D.runs++; D.st.deep = Math.max(D.st.deep || 0, st.maxM);
    jpSave();
    const secs = Math.max(5, Math.round((Date.now() - st.t0) / 1000));
    if (st.maxM > 0) jgPost({ game: 'mina', score: st.maxM, apples: 0, dur: secs });
    const ordDone = D.ord.filter((o) => o.have >= o.q).length;
    const title = how === 'rescue' ? '😵 Te rescataron' : how === 'quit' ? 'Saliste de la mina' : '🏕️ De vuelta al campamento';
    const extra = [...st.bossKills.map((i) => `🏆 Derrotaste al ${MZ_BOSSES[i].n}`), ...st.relics.map((r) => { const R = MZ_RELICS.find((x) => x.id === r); return `${R.ic} Reliquia nueva: ${R.n}`; })];
    const el = $w('#mzSum');
    el.innerHTML = `<b>${title}</b>${how === 'rescue' ? `<span class="small">Se te acabó la energía: perdiste ${lost} minerales.</span>` : ''}
      <span class="small muted">Llegaste a ${st.maxM} m${st.records ? ' · ¡nuevo récord!' : ''}${st.newElev.length ? ` · elevador ${st.newElev[st.newElev.length - 1]} m abierto` : ''}</span>
      ${extra.map((x) => `<span class="mz-big">${esc(x)}</span>`).join('')}
      ${lines.length ? `<ul class="mz-sell">${lines.join('')}</ul>` : '<span class="small muted">No traías minerales.</span>'}
      <span class="pm-gain mz-total">+💰 <span id="mzTot">0</span></span>
      ${ordDone ? `<span class="small">📜 ¡Tienes ${ordDone} ${ordDone === 1 ? 'encargo listo' : 'encargos listos'} para cobrar!</span>` : ''}
      ${st.coinsTree ? `<span class="small muted">+${st.coinsTree} monedas para tu árbol</span>` : ''}
      <div class="btn-row" style="justify-content:center;flex-wrap:wrap"><button class="btn primary" id="mzAgain">${icon('play')}Bajar otra vez</button><button class="btn" id="mzCamp">Ir al campamento</button></div>`;
    el.hidden = false; el.classList.add('show'); setTimeout(mzPaintGems, 0);
    if (total > 0) { MZS.sell(lines.length + 3); const t0 = performance.now(); const cnt = () => { const k = Math.min(1, (performance.now() - t0) / 1100); const s = $w('#mzTot'); if (s) s.textContent = mzFmt(total * (1 - Math.pow(1 - k, 3))); if (k < 1 && wrap.isConnected) requestAnimationFrame(cnt); }; requestAnimationFrame(cnt); }
    $w('#mzAgain').addEventListener('click', () => { const em = D.elev; exit(false); mzStart(em); });
    $w('#mzCamp').addEventListener('click', () => { MZ.tab = ordDone ? 'encargos' : st.relics.length ? 'reliquias' : 'mejoras'; exit(true); });
  }

  /* --- bucle --- */
  const loop = (now) => {
    st.id = requestAnimationFrame(loop);
    if (paused) return;
    const dt = Math.min(0.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
    step(dt); fx(dt); draw(dt); MZS.music(music && st.state === 'run', st.fevT > 0, mzZoneAt(mOf(st.pr)).i);
    hudT += dt; if (hudT > 0.1) { hudT = 0; hud(); }
  };
  st.id = requestAnimationFrame(loop); hud();
  if (startM > 0) msg(`🛗 Elevador · ${startM} m · Mina de hoy: ${MOD.n}`, 2200); else msg(`Mina de hoy: ${MOD.n}. Toca un bloque junto al minero (o usa las flechas) para excavar`, 3000);
  const exit = (go) => {
    cancelAnimationFrame(st.id); removeEventListener('resize', size); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); document.removeEventListener('visibilitychange', onVis);
    if (st.state === 'run') { st.state = 'done'; jpSave(); }
    wrap.remove(); document.body.classList.remove('gm-on'); MZ.run = null;
    if (go) { if (location.hash !== '#/mina') location.hash = '#/mina'; else render(); }
  };
  MZ.run = { exit, st: () => st, bosses, cell, row };
}

EXTRA_VIEWS.mina = viewMina; EXTRA_NAV.mina = 'juegos';
{
  const baseJuegos = viewJuegos;
  viewJuegos = function () { return baseJuegos().replace('<ul class="rows" style="margin-top:18px">', `<ul class="rows" style="margin-top:18px"><li><a href="#/mina"><span class="ico">${icon('play')}</span><span class="txt"><b>Mina Profunda <em class="sc-new">2.0</em></b><span>Excava, vence a los Guardianes de cada capa, junta reliquias y baja cada vez más.</span></span>${icon('chev', 'chev')}</a></li>`); };
  EXTRA_VIEWS.juegos = viewJuegos;
}
