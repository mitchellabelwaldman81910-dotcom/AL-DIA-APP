/* Cinnavia 7.62 — Mina Profunda.
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
const mzData = () => { const d = jpData('mina'); d.c ??= 0; d.up ||= {}; d.it ||= { tnt: 1, bebida: 1 }; d.best ??= 0; d.elev ??= 0; d.found ||= {}; d.fos ||= []; d.xp ??= 0; d.lvl ??= 1; d.ord ||= []; d.ordN ??= 0; d.st ||= {}; d.runs ??= 0; d.tot ??= 0; return d; };
const mzUp = (id) => mzData().up[id] || 0;
const mzFmt = (n) => { n = Math.floor(n); if (n < 10000) return n.toLocaleString('es-MX'); const u = ['K', 'M', 'B', 'T', 'Qa']; let i = -1; while (n >= 1000 && i < u.length - 1) { n /= 1000; i++; } return (n >= 100 ? n.toFixed(0) : n.toFixed(1)).replace(/\.0$/, '') + u[i]; };
const mzZoneAt = (m) => { let s = 0; for (let i = 0; i < MZ_ZONES.length; i++) { if (m < MZ_ZONES[i].to) return { i, z: MZ_ZONES[i], from: s }; s = MZ_ZONES[i].to; } return { i: MZ_ZONES.length - 1, z: MZ_ZONES[MZ_ZONES.length - 1], from: s }; };
const mzHp = (m) => { const { i, z, from } = mzZoneAt(m); const nx = MZ_ZONES[Math.min(MZ_ZONES.length - 1, i + 1)]; const len = Math.min(600, z.to - from); const k = Math.min(1, (m - from) / len); return z.hp * Math.pow(nx.hp / z.hp, k); };
const mzPick = () => Math.pow(1.55, mzUp('pico'));
const mzCap = () => 10 + mzUp('mochila') * 6;
const mzEmax = () => 100 + mzUp('energia') * 35;
const mzXpNeed = (l) => Math.round(80 * Math.pow(1.32, l - 1));
const mzVal = (o) => o.v * (1 + (mzData().lvl - 1) * 0.02);

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

/* ---------- campamento (pantalla de inicio) ---------- */
function mzHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="mzhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd3ff"/><stop offset=".32" stop-color="#d9f0ff"/><stop offset=".33" stop-color="#7a5132"/><stop offset=".6" stop-color="#6b717a"/><stop offset=".85" stop-color="#40241f"/><stop offset="1" stop-color="#1c1f44"/></linearGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#mzhS)"/><rect x="0" y="52" width="360" height="6" fill="#5aa63e"/>
    <g transform="translate(250 22)"><rect x="0" y="12" width="56" height="30" fill="#c98f5c"/><path d="M-6 14 L28 -4 L62 14z" fill="#e05a4a"/><rect x="22" y="24" width="12" height="18" fill="#6b4226"/></g>
    <path d="M150 58 V120 H175 V140" stroke="#2a1a12" stroke-width="22" fill="none" opacity=".55"/>
    <g transform="translate(175 130)"><circle r="11" fill="#f2c6a0"/><path d="M-12 -4 q12 -16 24 0z" fill="#ffd23c"/><circle cx="0" cy="-12" r="3" fill="#fff8b0"/><rect x="-9" y="10" width="18" height="16" rx="5" fill="#2f6cff"/></g>
    <g>${[[60, 80, '#2b2b2b'], [90, 104, '#d9824a'], [230, 96, '#ffcf3a'], [300, 120, '#e8334f'], [70, 140, '#22c27a'], [270, 152, '#bff4ff'], [120, 156, '#a45cff']].map(([x, y, c]) => `<path d="M${x} ${y - 8} l8 6 -3 9 h-10 l-3 -9z" fill="${c}"/>`).join('')}</g></svg>`;
}
function viewMina() {
  const d = mzData(); mzOrders();
  const tabs = [['bajar', 'Bajar'], ['mejoras', 'Mejoras'], ['objetos', 'Objetos'], ['encargos', 'Encargos'], ['album', 'Álbum']];
  const seg = `<div class="mz-tabs" role="group">${tabs.map(([k, l]) => `<button type="button" data-act="mz-tab" data-v="${k}" aria-pressed="${MZ.tab === k}">${l}</button>`).join('')}</div>`;
  const lvlK = Math.min(1, d.xp / mzXpNeed(d.lvl));
  const head = `<div class="mz-head"><span>💰 <b>${mzFmt(d.c)}</b></span><span>Minero nv <b>${d.lvl}</b><i class="mz-xp"><i style="width:${lvlK * 100}%"></i></i></span><span>Récord <b>${d.best} m</b></span></div>`;
  let body = '';
  if (MZ.tab === 'bajar') {
    const el = []; for (let m = 0; m <= d.elev; m += 100) el.push(m);
    body = `<p class="page-sub">Excava hacia abajo, junta minerales y gemas y regresa a venderlos. Cada capa es más dura y más oscura, pero vale mucho más. <b>Cuida tu energía</b>: si se acaba, te rescatan y pierdes la mitad de tu mochila. Con la <b>cuerda</b> vuelves cuando quieras.</p>
      <div class="mz-elev">${el.map((m) => `<button type="button" class="btn ${m === el[el.length - 1] ? 'primary' : ''}" data-act="mz-start" data-m="${m}">${m === 0 ? `${icon('play')}Bajar desde la superficie` : `🛗 Elevador ${m} m · ${mzZoneAt(m).z.n}`}</button>`).join('')}</div>
      <p class="small muted" style="text-align:center">Los elevadores se abren cada 100 m que alcanzas.</p>
      <div class="mz-stats"><span>Pico <b>${mzUp('pico') + 1}</b></span><span>Mochila <b>${mzCap()}</b></span><span>Energía <b>${mzEmax()}</b></span><span>Viajes <b>${d.runs}</b></span></div>
      <div id="jgRank-mina">${jgRankHTML('mina')}</div>`;
  } else if (MZ.tab === 'mejoras') {
    body = `<ul class="mz-list">${MZ_UPS.map((u) => { const l = mzUp(u.id), max = l >= u.max, c = u.cost(l); return `<li><div><b>${u.n} · nv ${l + 1}</b><span class="small muted">${u.d}</span></div>${max ? '<span class="mz-ok">Máximo</span>' : `<button type="button" class="btn${d.c >= c ? ' primary' : ''}" data-act="mz-up" data-id="${u.id}" ${d.c >= c ? '' : 'disabled'}>💰 ${mzFmt(c)}</button>`}</li>`; }).join('')}</ul>`;
  } else if (MZ.tab === 'objetos') {
    body = `<p class="small muted" style="margin:10px 2px">Puedes llevar hasta 5 de cada uno. Se usan con los botones de abajo dentro de la mina.</p><ul class="mz-list">${MZ_ITEMS.map((it) => { const n = d.it[it.id] || 0, full = n >= 5; return `<li><span class="mz-ic">${it.ic}</span><div><b>${it.n} · tienes ${n}</b><span class="small muted">${it.d}</span></div>${full ? '<span class="mz-ok">Lleno</span>' : `<button type="button" class="btn${d.c >= it.p ? ' primary' : ''}" data-act="mz-item" data-id="${it.id}" ${d.c >= it.p ? '' : 'disabled'}>💰 ${mzFmt(it.p)}</button>`}</li>`; }).join('')}</ul>`;
  } else if (MZ.tab === 'encargos') {
    body = `<p class="small muted" style="margin:10px 2px">El gremio de mineros te paga extra por estos minerales. Cuentan al venderlos en el campamento.</p><ul class="mz-list">${mzOrders().map((o, i) => { const ore = MZ_ORES.find((x) => x.id === o.id); const done = o.have >= o.q; return `<li class="${done ? 'done' : ''}"><canvas width="64" height="64" data-mzgem="${o.id}"></canvas><div><b>${o.q} de ${ore.n}</b><div class="mz-bar"><i style="width:${Math.min(100, o.have / o.q * 100)}%"></i></div><span class="small muted">${Math.min(o.have, o.q)} / ${o.q}</span></div>${done ? `<button type="button" class="btn primary" data-act="mz-claim" data-i="${i}">Cobrar 💰 ${mzFmt(o.rew)}</button>` : `<span class="mz-rew">💰 ${mzFmt(o.rew)}</span>`}</li>`; }).join('')}</ul><p class="small muted" style="text-align:center">Encargos cumplidos: ${d.ordN}</p>`;
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
  'mz-item': (el) => { const d = mzData(); const it = MZ_ITEMS.find((x) => x.id === el.dataset.id); if ((d.it[it.id] || 0) >= 5 || d.c < it.p) return; d.c -= it.p; d.it[it.id] = (d.it[it.id] || 0) + 1; jpSave(); MZS.ok(); render(); },
  'mz-claim': (el) => { const d = mzData(); const o = d.ord[+el.dataset.i]; if (!o || o.have < o.q) return; d.c += o.rew; d.ordN++; d.ord.splice(+el.dataset.i, 1); mzOrders(); jpSave(); MZS.sell(6); toast(`+${mzFmt(o.rew)} monedas del gremio`); render(); },
});

/* ---------- sonido ---------- */
const MZS = {
  ac: null, out: null,
  init() { if (this.ac) { if (this.ac.state === 'suspended') this.ac.resume().catch(() => {}); return; } try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); const cp = this.ac.createDynamicsCompressor(); cp.connect(this.ac.destination); this.out = this.ac.createGain(); this.out.gain.value = 0.9; this.out.connect(cp); } catch { this.ac = null; } },
  tone(f, d, type, vol, f2, delay = 0) { const ac = this.ac; if (!ac) return; const t0 = ac.currentTime + delay; const o = ac.createOscillator(), v = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d * 0.8); v.gain.setValueAtTime(0.0001, t0); v.gain.linearRampToValueAtTime(vol, t0 + 0.005); v.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(v); v.connect(this.out); o.start(t0); o.stop(t0 + d + 0.05); },
  noise(d, vol, f0, f1, delay = 0) { const ac = this.ac; if (!ac) return; const t0 = ac.currentTime + delay; const n = Math.max(1, Math.floor(ac.sampleRate * d)); const b = ac.createBuffer(1, n, ac.sampleRate); const ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = ac.createBufferSource(); s.buffer = b; const fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + d); const v = ac.createGain(); v.gain.value = vol; s.connect(fl); fl.connect(v); v.connect(this.out); s.start(t0); },
  hit(h) { this.noise(0.06, 0.08, 1200 + Math.random() * 600 - h * 4, 500); this.tone(160 + Math.random() * 40, 0.05, 'triangle', 0.03); },
  brk() { this.noise(0.18, 0.12, 900, 200); this.tone(120, 0.12, 'triangle', 0.05, 70); },
  ore(k) { const f = 660 * Math.pow(2, Math.min(k, 11) / 10); this.tone(f, 0.25, 'sine', 0.06); this.tone(f * 1.5, 0.2, 'sine', 0.03, 0, 0.06); if (k >= 5) this.tone(f * 2, 0.35, 'triangle', 0.03, 0, 0.12); },
  chest() { [0, 4, 7, 12, 16].forEach((s, i) => this.tone(523 * Math.pow(2, s / 12), 0.35, 'triangle', 0.05, 0, i * 0.07)); },
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
};

/* ---------- la mina ---------- */
function mzStart(startM = 0) {
  if (MZ.run) return; MZS.init();
  const D = mzData(); mzOrders();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage mz-stage';
  wrap.innerHTML = `<canvas aria-label="Mina Profunda"></canvas>
    <div class="mz-hud"><button class="gm-x" id="mzP" aria-label="Pausa"><svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="#333"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="#333"/></svg></button>
      <div class="mz-hc"><b id="mzDepth">0 m</b><span id="mzZone"></span><div class="mz-en"><i id="mzEn"></i><em id="mzEnT"></em></div></div>
      <div class="mz-hr"><span id="mzBag">🎒 0/0</span><span id="mzCargo">💰 0</span></div></div>
    <div class="mz-items" id="mzItems"></div>
    <button class="mz-rope" id="mzRope">🪢 Subir</button>
    <div class="mz-pad" id="mzPad"><button data-d="U" aria-label="Arriba">▲</button><button data-d="L" aria-label="Izquierda">◀</button><button data-d="D" aria-label="Abajo">▼</button><button data-d="R" aria-label="Derecha">▶</button></div>
    <div class="mz-msg" id="mzMsg"></div>
    <div class="gl-over" id="mzPause" hidden><b>Pausa</b><span class="small muted" id="mzPauseInfo"></span><div class="btn-row" style="justify-content:center;flex-wrap:wrap"><button class="btn primary" id="mzGo">${icon('play')}Seguir</button><button class="btn" id="mzUpB">🪢 Subir y vender</button><button class="btn" id="mzQuit">Salir sin vender</button></div></div>
    <div class="gl-over mz-sum" id="mzSum" hidden></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const $w = (s) => wrap.querySelector(s);
  const c = wrap.querySelector('canvas'), g = c.getContext('2d');
  const V = { w: 360, h: 640, dpr: 1, T: 48 };
  let SPR = new Map();
  const size = () => { V.dpr = Math.min(2, devicePixelRatio || 1); V.w = innerWidth; V.h = innerHeight; c.width = Math.round(V.w * V.dpr); c.height = Math.round(V.h * V.dpr); c.style.width = V.w + 'px'; c.style.height = V.h + 'px'; V.T = Math.max(36, Math.min(66, Math.floor(V.w / 8.5))); SPR = new Map(); };
  size(); addEventListener('resize', size);
  const low = () => !!(window.cnPerf && window.cnPerf.low());

  /* --- mundo --- */
  let seed = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
  const R0 = Math.round(startM / MZ_RM);
  const rows = new Map();
  const hash = (a, b) => { let h = (a * 374761393 + b * 668265263 + seed) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const luck = mzUp('suerte');
  const fossilsLeft = () => MZ_FOSSILS.map((_, i) => i).filter((i) => !D.fos.includes(i));
  function pickOre(m, r1) {
    const cand = MZ_ORES.filter((o) => m >= o.from && m < o.to); if (!cand.length) return -1;
    let tot = 0; const w = cand.map((o, i) => { const mid = o.from + Math.min(600, o.to - o.from) * 0.45, sd = Math.max(40, Math.min(300, (o.to - o.from) / 3)); const x = Math.exp(-((m - mid) ** 2) / (2 * sd * sd)) * Math.pow(1 + luck * 0.06, i) + 0.05; tot += x; return x; });
    let r = r1 * tot; for (let i = 0; i < cand.length; i++) { r -= w[i]; if (r <= 0) return MZ_ORES.indexOf(cand[i]); } return MZ_ORES.indexOf(cand[cand.length - 1]);
  }
  function row(R) {
    let rw = rows.get(R); if (rw) return rw;
    rw = [];
    for (let x = 0; x < MZ_COLS; x++) {
      if (R < R0) { rw.push(startM === 0 ? { e: 1, sky: 1 } : (x === 6 ? { e: 1, shaft: 1 } : { wall: 1 })); continue; }
      const m = R * MZ_RM, h1 = hash(x, R), h2 = hash(x + 101, R * 7 + 3), h3 = hash(x * 13 + 7, R + 999);
      if (R === R0 && x === 6) { rw.push({ e: 1 }); continue; }
      const z = mzZoneAt(m).i;
      const cave = m > 30 && h1 < 0.025 + Math.min(0.05, m / 20000);
      if (cave) { rw.push(m >= 450 && h2 < 0.35 ? { e: 1, lava: 1 } : { e: 1 }); continue; }
      const cell = { z, hard: h3 < 0.05 + Math.min(0.08, m / 15000) ? 1 : 0, ore: -1, sp: null, prog: 0, v: (h2 * 3) | 0 };
      cell.hp = mzHp(m) * (cell.hard ? 3.5 : 1);
      const oreP = 0.1 + luck * 0.006 + Math.min(0.06, m / 30000);
      if (h2 < oreP) cell.ore = pickOre(m, hash(x + 55, R + 77));
      else if (h2 < oreP + 0.006) cell.sp = 'chest';
      else if (m >= 60 && h2 < oreP + 0.0095 && fossilsLeft().length) cell.sp = 'fossil';
      else if (m >= 300 && h2 < oreP + 0.0125) cell.sp = 'geode';
      else if (m >= 260 && h2 < oreP + 0.0125 + 0.012) cell.sp = 'gas';
      if (m >= 450 && !cell.sp && cell.ore < 0 && h3 > 1 - Math.min(0.045, 0.012 + (m - 450) / 30000)) { rw.push({ e: 1, lava: 1 }); continue; }
      rw.push(cell);
    }
    rows.set(R, rw); return rw;
  }
  const cell = (x, R) => (x < 0 || x >= MZ_COLS ? null : row(R)[x]);
  const solid = (cl) => cl && !cl.e;

  /* --- estado --- */
  const st = {
    px: 6, pr: startM === 0 ? R0 - 1 : R0, fx: 6, fr: startM === 0 ? R0 - 1 : R0, move: null, fall: 0, dig: null, face: 1, swing: 0,
    E: mzEmax(), bag: [], cargoV: 0, maxM: startM, earnedXp: 0, t: 0, parts: [], floats: [], shake: 0, flash: 0, suit: 0, state: 'run',
    lowWarned: false, zoneShown: mzZoneAt(startM).i, newElev: [], records: 0, coinsTree: 0, t0: Date.now(), last: performance.now(), id: 0, ropeSure: 0, gas: [],
  };
  const mOf = (R) => Math.max(0, R * MZ_RM);
  const msg = (t, ms = 1500) => { const el = $w('#mzMsg'); el.textContent = t; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); clearTimeout(msg.t); msg.t = setTimeout(() => el.classList.remove('on'), ms); };
  const float = (text, x, R, col) => st.floats.push({ text, x, R, t: 0, col: col || '#fff' });
  const chips = (x, R, col, n, sp = 140) => { const cap = low() ? 50 : 140; for (let i = 0; i < n && st.parts.length < cap; i++) { const a = Math.random() * 6.28, v = sp * (0.3 + Math.random()); st.parts.push({ x: x + 0.5, R: R + 0.5, vx: Math.cos(a) * v / V.T, vy: Math.sin(a) * v / V.T - 1.5, t: 0, l: 0.5 + Math.random() * 0.5, c: col, r: 2 + Math.random() * 2.5 }); } };
  const bagFull = () => st.bag.length >= mzCap();
  const addXp = (n) => { D.xp += n; while (D.xp >= mzXpNeed(D.lvl)) { D.xp -= mzXpNeed(D.lvl); D.lvl++; MZS.lvl(); msg(`¡Subiste a minero nivel ${D.lvl}! Tus minerales valen un poco más`, 2200); st.flash = 0.5; } };
  function collectOre(oi, x, R, n = 1) {
    const o = MZ_ORES[oi];
    for (let k = 0; k < n; k++) {
      if (bagFull()) { MZS.full(); msg('🎒 ¡Mochila llena! Sube a vender o mejora tu mochila', 1800); return; }
      st.bag.push(oi); st.cargoV += mzVal(o); D.found[o.id] = (D.found[o.id] || 0) + 1; addXp(Math.max(1, Math.round(Math.sqrt(o.v))));
    }
    if ((D.found[o.id] || 0) === n) msg(`¡Nuevo mineral: ${o.n}!`, 1800);
    MZS.ore(oi); float(`+${n > 1 ? n + ' ' : ''}${o.n}`, x, R, o.g); chips(x, R, o.c, 10, 160);
  }
  function breakCell(x, R) {
    const cl = cell(x, R); if (!cl || cl.e) return;
    const z = MZ_ZONES[cl.z]; chips(x, R, z.a, low() ? 5 : 10); MZS.brk();
    const cost = 0.7 + Math.log10(1 + cl.hp) * 0.35; st.E -= cost;
    const sp = cl.sp, ore = cl.ore; Object.keys(cl).forEach((k) => delete cl[k]); cl.e = 1;
    if (ore >= 0) collectOre(ore, x, R);
    if (sp === 'chest') { const m = mOf(R); const coins = Math.round((20 + m * 3.2) * (0.7 + Math.random() * 0.8)); D.c += coins; MZS.chest(); float(`🎁 +${mzFmt(coins)}`, x, R, '#ffe066'); chips(x, R, '#ffd23c', 18, 220); if (Math.random() < 0.35) { const it = MZ_ITEMS[(Math.random() * 3) | 0]; D.it[it.id] = Math.min(5, (D.it[it.id] || 0) + 1); msg(`¡Cofre! +💰${mzFmt(coins)} y ${it.ic} ${it.n}`, 1800); paintItems(); } else msg(`¡Cofre! +💰${mzFmt(coins)}`, 1400); }
    if (sp === 'fossil') { const left = fossilsLeft(); if (left.length) { const f = left[(Math.random() * left.length) | 0]; D.fos.push(f); MZS.chest(); msg(`🦴 ¡Fósil nuevo: ${MZ_FOSSILS[f]}! (${D.fos.length}/${MZ_FOSSILS.length})`, 2200); st.flash = 0.4; addXp(40); if (D.fos.length === MZ_FOSSILS.length) msg('¡Completaste los fósiles! Tus minerales valen 25 % más', 2600); } }
    if (sp === 'geode') { const m = mOf(R); MZS.chest(); msg('💎 ¡Geoda! Estaba llena de gemas', 1600); for (let k = 0; k < 4; k++) { const oi = pickOre(m + 80, Math.random()); if (oi >= 0) collectOre(oi, x, R); } }
    if (sp === 'gas') { st.gas.push({ x, R, t: 0 }); MZS.gas(); if (st.suit > 0) msg('El traje térmico te protegió del gas', 1300); else { st.E -= 12 + mOf(R) * 0.02; st.shake = 0.3; msg('☁️ ¡Bolsa de gas! −energía', 1300); } }
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
      if (dy < 0 && !solid(cell(st.px, st.pr + 1)) && !cl.sky && !cl.shaft && !hasWallNear(st.px, st.pr)) { /* no se puede trepar en el aire */ }
      st.move = { fx: st.px, fr: st.pr, tx: nx, tr: nr, t: 0, dur: (dy < 0 ? 0.26 : 0.15) / (1 + mzUp('botas') * 0.12) };
      st.E -= dy < 0 ? 0.6 : 0.2; if (!low()) MZS.step();
      return;
    }
    // excavar
    if (!st.dig || st.dig.x !== nx || st.dig.r !== nr) st.dig = { x: nx, r: nr, t: 0 };
  }
  const hasWallNear = (x, R) => solid(cell(x - 1, R)) || solid(cell(x + 1, R));
  let held = null;
  const press = (d) => { MZS.init(); held = d; tryDir(d); };
  const release = (d) => { if (!d || held === d) held = null; st.dig = null; };

  /* --- controles --- */
  const pad = $w('#mzPad');
  pad.addEventListener('pointerdown', (e) => { const b = e.target.closest('button[data-d]'); if (!b) return; e.preventDefault(); b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch { /* */ } press(b.dataset.d); });
  pad.addEventListener('pointerup', (e) => { const b = e.target.closest('button[data-d]'); if (b) b.classList.remove('on'); pad.querySelectorAll('button').forEach((x) => x.classList.remove('on')); release(); });
  pad.addEventListener('pointercancel', () => { pad.querySelectorAll('button').forEach((x) => x.classList.remove('on')); release(); });
  // tocar el lienzo: cava hacia donde tocas (respecto al minero)
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
  function paintItems() {
    $w('#mzItems').innerHTML = MZ_ITEMS.map((it) => `<button type="button" data-it="${it.id}" ${(D.it[it.id] || 0) > 0 ? '' : 'disabled'} aria-label="${it.n}">${it.ic}<i>${D.it[it.id] || 0}</i></button>`).join('');
  }
  paintItems();
  $w('#mzItems').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-it]'); if (!b || st.state !== 'run') return; const id = b.dataset.it; if (!(D.it[id] > 0)) return;
    D.it[id]--; MZS.init();
    if (id === 'tnt') { MZS.boom(); st.shake = 0.6; st.flash = 0.6; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const cl = cell(st.px + dx, st.pr + dy); if (cl && !cl.e && !cl.wall) { const keepE = st.E; breakCell(st.px + dx, st.pr + dy); st.E = keepE; } } chips(st.px, st.pr, '#ff9a3c', 30, 320); msg('💥 ¡Bum!', 900); }
    else if (id === 'bebida') { st.E = Math.min(mzEmax(), st.E + mzEmax() * 0.5); MZS.ok(); msg('🧃 +50 % de energía', 1200); st.lowWarned = false; }
    else if (id === 'traje') { st.suit = 25; MZS.ok(); msg('🧯 Traje térmico: 25 s sin daño de lava ni gas', 1600); }
    else if (id === 'tele') { MZS.rope(); finish('tele'); }
    paintItems(); jpSave();
  });
  $w('#mzRope').addEventListener('click', () => { MZS.init(); if (st.state !== 'run') return; const cost = ropeCost(); if (st.E >= cost) { st.E -= cost; MZS.rope(); finish('rope'); } else if (st.ropeSure > st.t) finish('rescue'); else { st.ropeSure = st.t + 3; msg(`No te alcanza la energía (necesitas ${Math.ceil(cost)}). Toca otra vez: te rescatan, pero pierdes la mitad de la mochila`, 3000); } });
  const ropeCost = () => Math.max(2, mOf(st.pr) * 0.11 * (1 - mzUp('cuerda') * 0.07));

  /* --- pausa --- */
  let paused = false;
  function pause() { if (st.state !== 'run') return; paused = !paused; const p = $w('#mzPause'); p.hidden = !paused; if (paused) { p.classList.add('show'); $w('#mzPauseInfo').textContent = `Llevas ${st.bag.length} minerales (💰 ${mzFmt(st.cargoV)}). Subir cuesta ${Math.ceil(ropeCost())} de energía.`; } else st.last = performance.now(); held = null; st.dig = null; }
  $w('#mzP').addEventListener('click', pause);
  $w('#mzGo').addEventListener('click', pause);
  $w('#mzUpB').addEventListener('click', () => { paused = false; $w('#mzPause').hidden = true; $w('#mzRope').click(); });
  $w('#mzQuit').addEventListener('click', () => { paused = false; st.bag = []; st.cargoV = 0; finish('quit'); });

  /* --- lógica --- */
  function step(dt) {
    st.t += dt; if (st.suit > 0) st.suit -= dt;
    if (st.state !== 'run') return;
    const p = st;
    // movimiento animado
    if (p.move) {
      p.move.t += dt; const k = Math.min(1, p.move.t / p.move.dur);
      p.fx = p.move.fx + (p.move.tx - p.move.fx) * k; p.fr = p.move.fr + (p.move.tr - p.move.fr) * k;
      if (k >= 1) { p.px = p.move.tx; p.pr = p.move.tr; p.move = null; arrive(); }
    } else {
      // gravedad
      const below = cell(p.px, p.pr + 1);
      if (below && below.e && held !== 'U') { p.move = { fx: p.px, fr: p.pr, tx: p.px, tr: p.pr + 1, t: 0, dur: 0.07 }; }
      else if (held && !p.dig) tryDir(held);
    }
    // excavación
    if (p.dig && !p.move) {
      const cl = cell(p.dig.x, p.dig.r);
      if (!cl || cl.e) p.dig = null;
      else {
        const pw = mzPick() * (p.dig.r < p.pr ? 0.6 : 1);
        cl.prog = (cl.prog || 0) + dt * pw / (cl.hp * 0.32);
        p.swing += dt * 14; p.dig.t += dt;
        if (Math.floor(p.dig.t * 7) !== Math.floor((p.dig.t - dt) * 7)) { MZS.hit(cl.hp); if (!low()) chips(p.dig.x, p.dig.r, MZ_ZONES[cl.z].a, 2, 80); }
        if (cl.prog >= 1) { const dx = p.dig.x, dr = p.dig.r; breakCell(dx, dr); p.dig = null; if (held) tryDir(held); }
      }
    }
    // lava (si estás en una celda de lava)
    const here = cell(p.px, p.pr);
    if (here && here.lava && st.suit <= 0) { p.E -= dt * (14 + mOf(p.pr) * 0.012); if (Math.random() < dt * 4) MZS.lava(); if (Math.random() < 0.3) chips(p.px, p.pr, '#ff7a1f', 1, 60); }
    for (const gs of st.gas) gs.t += dt; st.gas = st.gas.filter((gs) => gs.t < 2.5);
    // energía
    if (p.E <= mzEmax() * 0.2 && !p.lowWarned) { p.lowWarned = true; MZS.low(); msg('⚠️ Poca energía: ¡sube pronto!', 2000); }
    if (p.E <= 0) { p.E = 0; MZS.faint(); finish('rescue'); }
    for (const q of st.parts) { q.t += dt; q.vy += 9 * dt; q.x += q.vx * dt; q.R += q.vy * dt; } st.parts = st.parts.filter((q) => q.t < q.l);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 1.2);
    if (st.shake > 0) st.shake -= dt; if (st.flash > 0) st.flash -= dt * 1.5;
  }
  function arrive() {
    const m = mOf(st.pr);
    if (m > st.maxM) {
      const before = st.maxM; st.maxM = m;
      if (Math.floor(m / 100) > Math.floor(before / 100) && m >= 100) { const em = Math.floor(m / 100) * 100; if (em > D.elev) { D.elev = em; st.newElev.push(em); msg(`🛗 ¡Elevador de ${em} m desbloqueado!`, 2000); MZS.chest(); } }
      if (m > D.best && Math.floor(m / 100) > Math.floor(D.best / 100)) { if (st.coinsTree < 10) { st.coinsTree += 2; jgCoins(2); } }
      if (m > D.best) { D.best = m; st.records++; }
    }
    const zi = mzZoneAt(m).i; if (zi !== st.zoneShown && zi > st.zoneShown) { st.zoneShown = zi; MZS.zone(); msg(`Nueva capa: ${MZ_ZONES[zi].n}`, 2200); st.flash = 0.35; }
  }

  /* --- dibujo --- */
  const screenOf = (fx, fr) => { const T = V.T, ww = MZ_COLS * T; const camX = ww <= V.w ? (ww - V.w) / 2 : Math.max(0, Math.min(ww - V.w, (st.fx + 0.5) * T - V.w / 2)); const camY = (st.fr + 0.5) * T - V.h * 0.42; return { x: fx * T - camX, y: fr * T - camY }; };
  function blockSprite(z, v, hard) {
    const key = `b${z}|${v}|${hard}`; let cv = SPR.get(key); if (cv) return cv; const T = V.T, k = V.dpr; cv = document.createElement('canvas'); cv.width = Math.ceil(T * k); cv.height = Math.ceil(T * k); const q = cv.getContext('2d'); q.scale(k, k);
    const Z = MZ_ZONES[z]; const gr = q.createLinearGradient(0, 0, T, T); gr.addColorStop(0, hard ? Z.b : Z.a); gr.addColorStop(1, Z.b); q.fillStyle = gr; q.fillRect(0, 0, T, T);
    let s = (z * 31 + v * 17 + hard * 5) >>> 0; const r = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
    for (let i = 0; i < 9; i++) { q.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.09)'; const w = T * (0.08 + r() * 0.12); q.beginPath(); q.ellipse(r() * T, r() * T, w, w * 0.6, r() * 3, 0, 7); q.fill(); }
    if (z === 3) { q.fillStyle = 'rgba(180,200,255,.35)'; q.beginPath(); q.moveTo(T * 0.2, T * 0.8); q.lineTo(T * 0.28, T * 0.55); q.lineTo(T * 0.36, T * 0.8); q.fill(); }
    if (z === 8) { q.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 4; i++) q.fillRect(r() * T, r() * T, 1.5, 1.5); }
    if (hard) { q.strokeStyle = 'rgba(0,0,0,.35)'; q.lineWidth = 2; q.strokeRect(3, 3, T - 6, T - 6); q.strokeStyle = 'rgba(255,255,255,.12)'; q.beginPath(); q.moveTo(5, T - 5); q.lineTo(T - 5, 5); q.stroke(); }
    q.fillStyle = 'rgba(255,255,255,.1)'; q.fillRect(0, 0, T, 2); q.fillStyle = 'rgba(0,0,0,.22)'; q.fillRect(0, T - 2, T, 2); q.fillRect(T - 2, 0, 2, T);
    SPR.set(key, cv); return cv;
  }
  function oreSprite(oi) { const key = 'o' + oi; let cv = SPR.get(key); if (cv) return cv; const T = V.T, k = V.dpr; cv = document.createElement('canvas'); cv.width = Math.ceil(T * k); cv.height = Math.ceil(T * k); const q = cv.getContext('2d'); q.scale(k, k); mzGem(q, T / 2, T / 2, T * 0.82, MZ_ORES[oi], 0); SPR.set(key, cv); return cv; }
  function drawSpecial(sp, x, y, T) {
    if (sp === 'chest') { g.fillStyle = '#8a5a2c'; g.fillRect(x + T * 0.2, y + T * 0.35, T * 0.6, T * 0.42); g.fillStyle = '#a8703a'; g.beginPath(); g.ellipse(x + T * 0.5, y + T * 0.36, T * 0.3, T * 0.13, 0, Math.PI, 0); g.fill(); g.fillStyle = '#ffd23c'; g.fillRect(x + T * 0.2, y + T * 0.48, T * 0.6, T * 0.06); g.fillRect(x + T * 0.46, y + T * 0.44, T * 0.08, T * 0.14); }
    else if (sp === 'fossil') { g.strokeStyle = '#f4ead8'; g.lineWidth = T * 0.07; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + T * 0.3, y + T * 0.65); g.lineTo(x + T * 0.7, y + T * 0.35); g.stroke(); for (const [cx, cy] of [[0.27, 0.68], [0.33, 0.62], [0.67, 0.38], [0.73, 0.32]]) { g.fillStyle = '#f4ead8'; g.beginPath(); g.arc(x + T * cx, y + T * cy, T * 0.07, 0, 7); g.fill(); } g.lineCap = 'butt'; }
    else if (sp === 'geode') { g.fillStyle = '#5a3a7a'; g.beginPath(); g.arc(x + T / 2, y + T / 2, T * 0.3, 0, 7); g.fill(); g.fillStyle = '#d6b4ff'; for (let i = 0; i < 6; i++) { const a = i * 1.047 + st.t * 0.3; g.beginPath(); g.moveTo(x + T / 2, y + T / 2); g.lineTo(x + T / 2 + Math.cos(a) * T * 0.22, y + T / 2 + Math.sin(a) * T * 0.22); g.lineTo(x + T / 2 + Math.cos(a + 0.4) * T * 0.16, y + T / 2 + Math.sin(a + 0.4) * T * 0.16); g.fill(); } }
    else if (sp === 'gas') { g.fillStyle = 'rgba(140,230,90,.55)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x + T * (0.3 + i * 0.2), y + T * (0.5 + Math.sin(st.t * 3 + i) * 0.08), T * 0.08, 0, 7); g.fill(); } }
  }
  function drawMiner(x, y, T) {
    const cx = x + T / 2, by = y + T * 0.95; const s = T / 48;
    g.save(); g.translate(cx, by); g.scale(st.face * s, s);
    const walk = st.move ? Math.sin(st.t * 22) * 2 : 0;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0, 13, 3.5, 0, 0, 7); g.fill();
    g.fillStyle = '#3a4a6b'; g.fillRect(-8, -14 + walk * 0.3, 6, 14); g.fillRect(2, -14 - walk * 0.3, 6, 14);
    g.fillStyle = '#2f6cff'; g.beginPath(); g.roundRect(-11, -32, 22, 20, 6); g.fill();
    g.fillStyle = '#ffd23c'; g.fillRect(-11, -24, 22, 3);
    g.fillStyle = '#f2c6a0'; g.beginPath(); g.arc(0, -40, 9, 0, 7); g.fill();
    g.fillStyle = '#2a1a12'; g.beginPath(); g.arc(3.5, -41, 1.4, 0, 7); g.fill();
    g.fillStyle = '#ffcf3a'; g.beginPath(); g.arc(0, -44, 10.5, Math.PI, 0); g.fill(); g.fillRect(-11.5, -45, 23, 3);
    g.fillStyle = '#fff8b0'; g.beginPath(); g.arc(7, -48, 3, 0, 7); g.fill();
    // pico
    const dig = st.dig && !st.move; const dd = dig ? (st.dig.r > st.pr ? 1.1 : st.dig.r < st.pr ? -1.2 : 0) : 0; const ang = dig ? -0.9 + Math.abs(Math.sin(st.swing)) * 1.6 + dd * 0.4 : -0.3;
    g.save(); g.translate(8, -26); g.rotate(ang); g.strokeStyle = '#8a5a2c'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(18, 0); g.stroke(); g.strokeStyle = '#c9d2dc'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(16, -9); g.quadraticCurveTo(22, 0, 16, 9); g.stroke(); g.restore();
    if (st.suit > 0) { g.strokeStyle = `rgba(120,200,255,${0.5 + 0.3 * Math.sin(st.t * 6)})`; g.lineWidth = 2.5; g.beginPath(); g.arc(0, -24, 26, 0, 7); g.stroke(); }
    g.restore();
  }
  function draw() {
    const W = V.w, H = V.h, T = V.T; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    const sh = st.shake > 0 ? st.shake * 10 : 0; if (sh) g.translate((Math.random() - 0.5) * sh, (Math.random() - 0.5) * sh);
    const o = screenOf(0, 0); const r0 = Math.floor(-o.y / T) - 1, r1 = Math.ceil((H - o.y) / T) + 1;
    g.fillStyle = '#0b0b10'; g.fillRect(-20, -20, W + 40, H + 40);
    for (let R = r0; R <= r1; R++) {
      const y = o.y + R * T, rw = row(R); const m = mOf(R);
      if (R < R0 && startM === 0) { // cielo y campamento
        const sky = g.createLinearGradient(0, y, 0, y + T); sky.addColorStop(0, '#8fd0ff'); sky.addColorStop(1, '#cfeeff'); g.fillStyle = sky; g.fillRect(-20, y, W + 40, T + 1);
        if (R === R0 - 1) { g.fillStyle = '#5aa63e'; g.fillRect(-20, y + T - 5, W + 40, 6); const cx = o.x + 1 * T; g.fillStyle = '#c98f5c'; g.fillRect(cx, y + T * 0.25, T * 1.6, T * 0.72); g.fillStyle = '#e05a4a'; g.beginPath(); g.moveTo(cx - T * 0.15, y + T * 0.3); g.lineTo(cx + T * 0.8, y - T * 0.2); g.lineTo(cx + T * 1.75, y + T * 0.3); g.fill(); g.fillStyle = '#6b4226'; g.fillRect(cx + T * 0.6, y + T * 0.5, T * 0.4, T * 0.47); g.fillStyle = '#fff'; g.font = `700 ${Math.round(T * 0.22)}px system-ui`; g.textAlign = 'center'; g.fillText('Campamento', cx + T * 0.8, y + T * 0.15); }
        else if (R === R0 - 2) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(o.x + 8 * T + Math.sin(st.t * 0.2) * 10, y + T * 0.5, T * 0.3, 0, 7); g.arc(o.x + 8.4 * T + Math.sin(st.t * 0.2) * 10, y + T * 0.55, T * 0.24, 0, 7); g.fill(); }
        continue;
      }
      const Z = MZ_ZONES[mzZoneAt(m).i];
      g.fillStyle = Z.bg; g.fillRect(o.x, y, MZ_COLS * T, T + 1);
      for (let x = 0; x < MZ_COLS; x++) {
        const cl = rw[x], X = o.x + x * T; if (X < -T || X > W) continue;
        if (cl.wall) { g.fillStyle = '#1a1a20'; g.fillRect(X, y, T, T); continue; }
        if (cl.shaft) { g.fillStyle = '#2b2b33'; g.fillRect(X, y, T, T); g.strokeStyle = '#555'; g.lineWidth = 2; g.beginPath(); g.moveTo(X + T * 0.2, y); g.lineTo(X + T * 0.2, y + T); g.moveTo(X + T * 0.8, y); g.lineTo(X + T * 0.8, y + T); g.stroke(); continue; }
        if (cl.lava) { const gr = g.createLinearGradient(0, y, 0, y + T); gr.addColorStop(0, '#ffb23c'); gr.addColorStop(1, '#e8430f'); g.fillStyle = gr; g.fillRect(X, y, T, T); g.fillStyle = 'rgba(255,240,150,.55)'; g.beginPath(); for (let k = 0; k <= 4; k++) g.lineTo(X + k * T / 4, y + T * 0.2 + Math.sin(st.t * 3 + k + x) * T * 0.06); g.lineTo(X + T, y); g.lineTo(X, y); g.fill(); continue; }
        if (cl.e) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(X, y, T, T); continue; }
        g.drawImage(blockSprite(cl.z, cl.v, cl.hard), X, y, T, T);
        if (cl.ore >= 0) g.drawImage(oreSprite(cl.ore), X, y, T, T);
        if (cl.sp) drawSpecial(cl.sp, X, y, T);
        if (cl.prog > 0) { const k = Math.min(1, cl.prog); g.strokeStyle = `rgba(0,0,0,${0.35 + k * 0.4})`; g.lineWidth = 2; g.beginPath(); g.moveTo(X + T * 0.5, y + T * 0.5); g.lineTo(X + T * (0.5 - 0.35 * k), y + T * (0.5 - 0.3 * k)); g.moveTo(X + T * 0.5, y + T * 0.5); g.lineTo(X + T * (0.5 + 0.38 * k), y + T * (0.5 - 0.1 * k)); g.moveTo(X + T * 0.5, y + T * 0.5); g.lineTo(X + T * (0.5 + 0.1 * k), y + T * (0.5 + 0.4 * k)); if (k > 0.5) { g.moveTo(X + T * 0.5, y + T * 0.5); g.lineTo(X + T * (0.5 - 0.3 * k), y + T * (0.5 + 0.3 * k)); } g.stroke(); }
      }
      if (m > 0 && m % 100 === 0 && R >= R0) { g.fillStyle = 'rgba(255,214,90,.85)'; g.font = `800 ${Math.round(T * 0.26)}px system-ui`; g.textAlign = 'left'; g.fillText(`— ${m} m —`, o.x + 4, y + T * 0.3); }
    }
    // gas
    for (const gs of st.gas) { const s2 = screenOf(gs.x, gs.R); g.fillStyle = `rgba(140,230,90,${0.45 * (1 - gs.t / 2.5)})`; g.beginPath(); g.arc(s2.x + T / 2, s2.y + T / 2, T * (0.6 + gs.t * 0.6), 0, 7); g.fill(); }
    const pp = screenOf(st.fx, st.fr); drawMiner(pp.x, pp.y, T);
    for (const q of st.parts) { const s2 = screenOf(q.x - 0.5, q.R - 0.5); g.globalAlpha = Math.max(0, 1 - q.t / q.l); g.fillStyle = q.c; g.fillRect(s2.x + T / 2 - q.r, s2.y + T / 2 - q.r, q.r * 2, q.r * 2); } g.globalAlpha = 1;
    // oscuridad con la luz de la lámpara
    const dm = mOf(st.fr); const dark = Math.max(0, Math.min(0.9, (dm - 16) / 260));
    if (dark > 0) { const lr = (2.6 + mzUp('lampara') * 0.55) * T; const lx = pp.x + T / 2, ly = pp.y + T / 2; const gr = g.createRadialGradient(lx, ly, lr * 0.35, lx, ly, lr); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${dark})`); g.fillStyle = gr; g.fillRect(0, 0, W, H); }
    g.textAlign = 'center'; for (const f of st.floats) { const s2 = screenOf(f.x, f.R); g.globalAlpha = Math.max(0, 1 - f.t / 1.2); g.font = `900 ${Math.round(T * 0.32)}px system-ui`; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.6)'; const yy = s2.y - f.t * 40; g.strokeText(f.text, s2.x + T / 2, yy); g.fillStyle = f.col; g.fillText(f.text, s2.x + T / 2, yy); } g.globalAlpha = 1;
    if (st.flash > 0) { g.fillStyle = `rgba(255,255,255,${st.flash * 0.4})`; g.fillRect(0, 0, W, H); }
  }
  let hudT = 0;
  function hud() {
    const m = mOf(st.pr); $w('#mzDepth').textContent = `${m} m`; $w('#mzZone').textContent = st.pr < R0 ? 'Superficie' : MZ_ZONES[mzZoneAt(m).i].n;
    const k = Math.max(0, st.E / mzEmax()); const en = $w('#mzEn'); en.style.width = `${k * 100}%`; en.style.background = k > 0.5 ? '#40c057' : k > 0.2 ? '#fab005' : '#fa5252'; $w('#mzEnT').textContent = `${Math.ceil(st.E)} / ${mzEmax()}`;
    $w('#mzBag').textContent = `🎒 ${st.bag.length}/${mzCap()}`; $w('#mzBag').classList.toggle('full', bagFull()); $w('#mzCargo').textContent = `💰 ${mzFmt(st.cargoV)}`;
    const rb = $w('#mzRope'); const cost = ropeCost(); rb.textContent = st.pr < R0 ? '🏕️ Campamento' : `🪢 Subir · ${Math.ceil(cost)}⚡`; rb.classList.toggle('warn', st.E < cost);
  }

  /* --- fin del viaje: vender --- */
  function finish(how) {
    if (st.state !== 'run') return; st.state = 'done'; held = null; st.dig = null;
    let lost = 0;
    if (how === 'rescue') { const keep = Math.ceil(st.bag.length / 2); lost = st.bag.length - keep; st.bag.sort(() => Math.random() - 0.5); st.bag = st.bag.slice(0, keep); }
    const counts = {}; for (const oi of st.bag) counts[oi] = (counts[oi] || 0) + 1;
    const fosBonus = D.fos.length >= MZ_FOSSILS.length ? 1.25 : 1;
    let total = 0; const lines = Object.entries(counts).sort((a, b) => b[0] - a[0]).map(([oi, n]) => { const o = MZ_ORES[oi]; const v = Math.round(mzVal(o) * n * fosBonus); total += v; for (const od of D.ord) if (od.id === o.id) od.have += n; return `<li><canvas width="40" height="40" data-mzgem="${o.id}"></canvas><span>${n} × ${o.n}</span><b>💰 ${mzFmt(v)}</b></li>`; });
    D.c += total; D.tot += total; D.runs++; D.st.deep = Math.max(D.st.deep || 0, st.maxM);
    jpSave();
    const secs = Math.max(5, Math.round((Date.now() - st.t0) / 1000));
    if (st.maxM > 0) jgPost({ game: 'mina', score: st.maxM, apples: 0, dur: secs });
    const ordDone = D.ord.filter((o) => o.have >= o.q).length;
    const title = how === 'rescue' ? '😵 Te rescataron' : how === 'quit' ? 'Saliste de la mina' : '🏕️ De vuelta al campamento';
    const el = $w('#mzSum');
    el.innerHTML = `<b>${title}</b>${how === 'rescue' ? `<span class="small">Se te acabó la energía: perdiste ${lost} minerales.</span>` : ''}
      <span class="small muted">Llegaste a ${st.maxM} m${st.records ? ' · ¡nuevo récord!' : ''}${st.newElev.length ? ` · elevador ${st.newElev[st.newElev.length - 1]} m abierto` : ''}</span>
      ${lines.length ? `<ul class="mz-sell">${lines.join('')}</ul>` : '<span class="small muted">No traías minerales.</span>'}
      <span class="pm-gain mz-total">+💰 <span id="mzTot">0</span></span>
      ${ordDone ? `<span class="small">📜 ¡Tienes ${ordDone} ${ordDone === 1 ? 'encargo listo' : 'encargos listos'} para cobrar!</span>` : ''}
      ${st.coinsTree ? `<span class="small muted">+${st.coinsTree} monedas para tu árbol</span>` : ''}
      <div class="btn-row" style="justify-content:center;flex-wrap:wrap"><button class="btn primary" id="mzAgain">${icon('play')}Bajar otra vez</button><button class="btn" id="mzCamp">Ir al campamento</button></div>`;
    el.hidden = false; el.classList.add('show'); setTimeout(mzPaintGems, 0);
    if (total > 0) { MZS.sell(lines.length + 3); const t0 = performance.now(); const cnt = () => { const k = Math.min(1, (performance.now() - t0) / 1100); const s = $w('#mzTot'); if (s) s.textContent = mzFmt(total * (1 - Math.pow(1 - k, 3))); if (k < 1 && wrap.isConnected) requestAnimationFrame(cnt); }; requestAnimationFrame(cnt); }
    $w('#mzAgain').addEventListener('click', () => { const em = D.elev; exit(false); mzStart(em); });
    $w('#mzCamp').addEventListener('click', () => { MZ.tab = ordDone ? 'encargos' : 'mejoras'; exit(true); });
  }

  /* --- bucle --- */
  const loop = (now) => {
    st.id = requestAnimationFrame(loop);
    if (paused) return;
    const dt = Math.min(0.05, Math.max(0, (now - st.last) / 1000)); st.last = now;
    step(dt); draw(); hudT += dt; if (hudT > 0.1) { hudT = 0; hud(); }
  };
  st.id = requestAnimationFrame(loop); hud();
  if (startM > 0) msg(`🛗 Elevador · ${startM} m · ${MZ_ZONES[mzZoneAt(startM).i].n}`, 1800); else msg('Toca un bloque junto al minero (o usa las flechas) para excavar', 2600);
  const exit = (go) => {
    cancelAnimationFrame(st.id); removeEventListener('resize', size); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); document.removeEventListener('visibilitychange', onVis);
    if (st.state === 'run') { st.state = 'done'; jpSave(); }
    wrap.remove(); document.body.classList.remove('gm-on'); MZ.run = null;
    if (go) { if (location.hash !== '#/mina') location.hash = '#/mina'; else render(); }
  };
  MZ.run = { exit, st: () => st };
}

EXTRA_VIEWS.mina = viewMina; EXTRA_NAV.mina = 'juegos';
{
  const baseJuegos = viewJuegos;
  viewJuegos = function () { return baseJuegos().replace('<ul class="rows" style="margin-top:18px">', `<ul class="rows" style="margin-top:18px"><li><a href="#/mina"><span class="ico">${icon('play')}</span><span class="txt"><b>Mina Profunda <em class="sc-new">Nuevo</em></b><span>Excava, junta gemas, mejora tu pico y baja cada vez más profundo.</span></span>${icon('chev', 'chev')}</a></li>`); };
  EXTRA_VIEWS.juegos = viewJuegos;
}
