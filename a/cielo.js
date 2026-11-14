/* Cinnavia 7.61 — Salto al Cielo.
   Salto infinito al estilo de Sky Jump: rebotas solo de plataforma en plataforma y subes por seis mundos
   (Pradera, Nubes, Atardecer, Noche, Espacio y Galaxia dulce) que se repiten cada vez más difíciles.
   Plataformas que se mueven, se rompen o parpadean; resortes, trampolines, cohetes, hélices, escudos e imanes;
   enemigos que puedes pisar; estrellas para la tienda (personajes, estelas y mejoras), misiones y ranking.
   Se juega arrastrando el dedo (o inclinando el teléfono, o con las flechas). Sin castigo por salir. */
'use strict';

const SC = { run: null };
const SC_BW = 400, SC_WORLD = 9000, SC_COIN_CAP = 20;
const scData = () => { const d = jpData('cielo'); d.w ||= 0; d.best ||= 0; d.own ||= ['pompon', 'none']; d.skin ||= 'pompon'; d.trail ||= 'none'; d.up ||= {}; d.st ||= {}; d.ms ||= []; d.games ||= 0; d.tilt ||= 0; return d; };
const scClamp = (v, a, b) => Math.max(a, Math.min(b, v));
const scLerp = (a, b, t) => a + (b - a) * t;

/* ---------- mundos ---------- */
const SC_WORLDS = [
  { n: 'Pradera', sky: ['#bfe9ff', '#e6f7ff', '#f3ffe6'], pl: ['#7cc85a', '#5aa63e', '#8a5a34'], deco: 'hills', en: 'abeja' },
  { n: 'Mar de nubes', sky: ['#7cc4ff', '#b8e2ff', '#eaf6ff'], pl: ['#ffffff', '#dbe8f7', '#b9c9e0'], deco: 'clouds', en: 'pajaro' },
  { n: 'Atardecer', sky: ['#ff9a8b', '#ffc39e', '#ffe7b8'], pl: ['#ffb36b', '#e8874a', '#a8562c'], deco: 'balloons', en: 'pajaro' },
  { n: 'Noche estrellada', sky: ['#141a46', '#2b2f72', '#4b3f8f'], pl: ['#8e9cff', '#6170e0', '#3a439c'], deco: 'stars', en: 'murcielago' },
  { n: 'Espacio', sky: ['#05060f', '#0e1430', '#1c2350'], pl: ['#b9c3d6', '#8a95ab', '#5c6578'], deco: 'planets', en: 'ovni' },
  { n: 'Galaxia dulce', sky: ['#3a1450', '#7a2b8f', '#e06ab5'], pl: ['#ff8fcf', '#e05aa8', '#ffd1ec'], deco: 'candy', en: 'medusa' },
];
const scWorldAt = (y) => Math.floor(Math.max(0, y) / SC_WORLD);

/* ---------- tienda ---------- */
const SC_SKINS = [
  { id: 'pompon', n: 'Pompón', p: 0, c: '#7ed957', c2: '#5fb53d', kind: 'blob' },
  { id: 'pollito', n: 'Pollito', p: 150, c: '#ffd84a', c2: '#f5b82a', kind: 'chick' },
  { id: 'gatito', n: 'Gatito', p: 300, c: '#f5a65b', c2: '#d9853a', kind: 'cat' },
  { id: 'rana', n: 'Ranita', p: 300, c: '#56c271', c2: '#3a9c53', kind: 'frog' },
  { id: 'panda', n: 'Panda', p: 500, c: '#ffffff', c2: '#2b2b2b', kind: 'panda' },
  { id: 'pinguino', n: 'Pingüino', p: 500, c: '#2f3b55', c2: '#ffffff', kind: 'peng' },
  { id: 'conejo', n: 'Conejito', p: 700, c: '#f4eef6', c2: '#ffb6c9', kind: 'bunny' },
  { id: 'zorro', n: 'Zorrito', p: 900, c: '#ff8a3d', c2: '#ffffff', kind: 'fox' },
  { id: 'astro', n: 'Astronauta', p: 1400, c: '#f2f5fa', c2: '#4aa8ff', kind: 'astro' },
  { id: 'robot', n: 'Robot', p: 1600, c: '#9fb4c8', c2: '#ffcf3a', kind: 'robot' },
  { id: 'unicornio', n: 'Unicornio', p: 2200, c: '#ffffff', c2: '#c78bff', kind: 'uni' },
  { id: 'dragon', n: 'Dragoncito', p: 3000, c: '#6fd36f', c2: '#ffcf3a', kind: 'dragon' },
];
const SC_TRAILS = [
  { id: 'none', n: 'Sin estela', p: 0, c: [] },
  { id: 'chispas', n: 'Chispas', p: 200, c: ['#ffd23c', '#ff9a3c'] },
  { id: 'burbujas', n: 'Burbujas', p: 250, c: ['#bfe9ff', '#e6f7ff'] },
  { id: 'corazones', n: 'Corazones', p: 400, c: ['#ff5d8f', '#ff8fab'] },
  { id: 'estrellas', n: 'Estrellitas', p: 500, c: ['#fff3a8', '#ffe066'] },
  { id: 'arcoiris', n: 'Arcoíris', p: 900, c: ['#ff5a5a', '#ffb23c', '#ffe066', '#6bd66b', '#4aa8ff', '#a06bff'] },
];
const SC_UPS = [
  { id: 'rocket', n: 'Cohete más largo', d: '+0.6 s de cohete por nivel', max: 5, cost: (l) => 120 + l * 140 },
  { id: 'magnet', n: 'Imán más fuerte', d: 'Atrae estrellas de más lejos y por más tiempo', max: 5, cost: (l) => 100 + l * 120 },
  { id: 'shield', n: 'Escudo inicial', d: 'Empiezas con un escudo por nivel (máx. 2) y dura más', max: 3, cost: (l) => 250 + l * 300 },
  { id: 'luck', n: 'Suerte', d: 'Aparecen más poderes y estrellas', max: 5, cost: (l) => 150 + l * 160 },
  { id: 'spring', n: 'Resortes potentes', d: 'Los resortes y trampolines te lanzan más alto', max: 3, cost: (l) => 200 + l * 220 },
];
const scUp = (id) => (scData().up[id] || 0);

/* ---------- misiones ---------- */
const SC_MT = [
  { k: 'm', t: (g) => `Sube ${g} m en una partida`, gs: [150, 300, 500, 800, 1200, 1800], run: true },
  { k: 'star', t: (g) => `Junta ${g} estrellas`, gs: [60, 150, 300, 600] },
  { k: 'stomp', t: (g) => `Pisa ${g} enemigos`, gs: [3, 8, 15, 30] },
  { k: 'rocket', t: (g) => `Usa ${g} cohetes o hélices`, gs: [2, 5, 10] },
  { k: 'spring', t: (g) => `Rebota en ${g} resortes o trampolines`, gs: [5, 15, 30] },
  { k: 'world', t: (g) => `Llega a ${SC_WORLDS[g % SC_WORLDS.length].n}`, gs: [1, 2, 3, 4, 5], run: true },
  { k: 'games', t: (g) => `Juega ${g} partidas`, gs: [3, 6, 10] },
  { k: 'break', t: (g) => `Rompe ${g} plataformas frágiles`, gs: [5, 15, 30] },
];
function scMissions() {
  const d = scData(); d.mlv ||= 0;
  while (d.ms.length < 3) {
    const used = new Set(d.ms.map((m) => m.k));
    const pool = SC_MT.filter((m) => !used.has(m.k));
    const T = pool[Math.floor(Math.random() * pool.length)];
    const gi = Math.min(T.gs.length - 1, Math.floor(d.mlv / 3) + Math.floor(Math.random() * 2));
    const goal = T.gs[gi];
    d.ms.push({ k: T.k, goal, prog: 0, rew: 30 + gi * 35 + Math.floor(Math.random() * 3) * 10 });
  }
  return d.ms;
}
const scMText = (m) => SC_MT.find((t) => t.k === m.k).t(m.goal);

/* ---------- personaje ---------- */
function scDrawChar(g, x, y, r, skin, o = {}) {
  const S = SC_SKINS.find((s) => s.id === skin) || SC_SKINS[0];
  const sx = o.sx || 1, sy = o.sy || 1, blink = o.blink, face = o.face || 1;
  g.save(); g.translate(x, y); g.scale(sx * face, sy);
  const k = S.kind;
  // orejas / extras detrás
  if (k === 'cat' || k === 'fox') { g.fillStyle = S.c; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * r * .85, -r * .35); g.lineTo(s * r * .55, -r * 1.2); g.lineTo(s * r * .1, -r * .8); g.closePath(); g.fill(); } }
  if (k === 'bunny') { for (const s of [-1, 1]) { g.fillStyle = S.c; g.beginPath(); g.ellipse(s * r * .38, -r * 1.15, r * .24, r * .62, s * .15, 0, 7); g.fill(); g.fillStyle = S.c2; g.beginPath(); g.ellipse(s * r * .38, -r * 1.1, r * .11, r * .45, s * .15, 0, 7); g.fill(); } }
  if (k === 'panda') { g.fillStyle = S.c2; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * r * .7, -r * .72, r * .3, 0, 7); g.fill(); } }
  if (k === 'dragon') { g.fillStyle = S.c2; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * r * .4, -r * .8); g.lineTo(s * r * .6, -r * 1.25); g.lineTo(s * r * .75, -r * .65); g.closePath(); g.fill(); } g.fillStyle = '#8ee68e'; g.beginPath(); g.moveTo(-r * .95, 0); g.quadraticCurveTo(-r * 1.6, -r * .6, -r * 1.3, r * .3); g.closePath(); g.fill(); }
  if (k === 'uni') { g.fillStyle = '#ffd84a'; g.beginPath(); g.moveTo(-r * .16, -r * .85); g.lineTo(r * .16, -r * .85); g.lineTo(0, -r * 1.55); g.closePath(); g.fill(); g.fillStyle = S.c2; g.beginPath(); g.ellipse(-r * .7, -r * .55, r * .3, r * .45, -.6, 0, 7); g.fill(); }
  if (k === 'robot') { g.strokeStyle = '#5c6b7a'; g.lineWidth = r * .1; g.beginPath(); g.moveTo(0, -r * .9); g.lineTo(0, -r * 1.3); g.stroke(); g.fillStyle = S.c2; g.beginPath(); g.arc(0, -r * 1.35, r * .14, 0, 7); g.fill(); }
  if (k === 'chick') { g.fillStyle = S.c2; g.beginPath(); g.ellipse(0, -r * 1.0, r * .12, r * .25, 0, 0, 7); g.ellipse(r * .14, -r * .98, r * .1, r * .2, .5, 0, 7); g.fill(); }
  // cuerpo
  const body = g.createRadialGradient(-r * .35, -r * .4, r * .2, 0, 0, r * 1.05);
  body.addColorStop(0, '#ffffff'); body.addColorStop(.18, S.c); body.addColorStop(1, k === 'peng' ? '#1d2538' : S.c2 === '#ffffff' || S.c2 === '#2b2b2b' ? S.c : S.c2);
  g.fillStyle = body; g.beginPath();
  if (k === 'robot') { const w = r * .95; g.moveTo(-w, -w * .7); g.arcTo(w, -w, w, w, r * .3); g.arcTo(w, w, -w, w, r * .3); g.arcTo(-w, w, -w, -w, r * .3); g.arcTo(-w, -w, w, -w, r * .3); g.closePath(); }
  else g.ellipse(0, 0, r, r * .95, 0, 0, 7);
  g.fill();
  if (k === 'peng' || k === 'fox' || k === 'astro') { g.fillStyle = k === 'astro' ? '#bfe3ff' : '#ffffff'; g.beginPath(); g.ellipse(0, r * (k === 'astro' ? -.05 : .2), r * (k === 'astro' ? .72 : .6), r * (k === 'astro' ? .55 : .65), 0, 0, 7); g.fill(); if (k === 'astro') { g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(-r * .25, -r * .25, r * .16, r * .1, -.5, 0, 7); g.fill(); } }
  if (k === 'panda') { g.fillStyle = S.c2; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .33, -r * .1, r * .2, r * .26, s * .4, 0, 7); g.fill(); } }
  if (k === 'frog') { g.fillStyle = S.c; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * r * .42, -r * .72, r * .3, 0, 7); g.fill(); } }
  // ojos
  const ey = k === 'frog' ? -r * .74 : -r * .12, ex = k === 'frog' ? r * .42 : r * .32;
  for (const s of [-1, 1]) {
    if (blink) { g.strokeStyle = '#2a1a12'; g.lineWidth = r * .09; g.beginPath(); g.moveTo(s * ex - r * .12, ey); g.lineTo(s * ex + r * .12, ey); g.stroke(); continue; }
    g.fillStyle = k === 'panda' || k === 'peng' ? '#ffffff' : '#ffffff'; g.beginPath(); g.ellipse(s * ex, ey, r * .19, r * .22, 0, 0, 7); g.fill();
    g.fillStyle = k === 'robot' ? '#2a8cff' : '#2a1a12'; g.beginPath(); g.arc(s * ex + r * .05, ey + (o.up ? -r * .06 : r * .03), r * .11, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(s * ex + r * .09, ey - r * .03, r * .04, 0, 7); g.fill();
  }
  // boca / pico
  if (k === 'chick' || k === 'peng') { g.fillStyle = '#ff9f1c'; g.beginPath(); g.moveTo(-r * .14, r * .14); g.lineTo(r * .14, r * .14); g.lineTo(0, r * .34); g.closePath(); g.fill(); }
  else { g.strokeStyle = k === 'panda' ? '#2b2b2b' : '#5a2a1a'; g.lineWidth = r * .08; g.lineCap = 'round'; g.beginPath(); if (o.scared) g.arc(0, r * .38, r * .14, 3.4, 6.0); else g.arc(0, r * .16, r * .18, .3, 2.84); g.stroke(); }
  g.fillStyle = 'rgba(255,120,150,.35)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .6, r * .2, r * .16, r * .09, 0, 0, 7); g.fill(); }
  // patitas
  g.fillStyle = k === 'chick' || k === 'peng' ? '#ff9f1c' : S.c2 === '#ffffff' ? S.c : S.c2;
  for (const s of [-1, 1]) { g.beginPath(); g.ellipse(s * r * .42, r * .92, r * .24, r * .13, 0, 0, 7); g.fill(); }
  g.restore();
}

/* ---------- vista de inicio, tienda y misiones ---------- */
function scHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="clhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2f72"/><stop offset=".45" stop-color="#ff9a8b"/><stop offset="1" stop-color="#bfe9ff"/></linearGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#clhS)"/>
    <g fill="#fff" opacity=".85"><circle cx="40" cy="22" r="1.6"/><circle cx="120" cy="14" r="1.2"/><circle cx="210" cy="26" r="1.5"/><circle cx="300" cy="12" r="1.8"/><circle cx="330" cy="40" r="1.1"/></g>
    <circle cx="292" cy="40" r="16" fill="#ffe7a8" opacity=".9"/>
    <g fill="#fff"><ellipse cx="70" cy="150" rx="60" ry="16"/><ellipse cx="290" cy="156" rx="80" ry="18"/></g>
    <g><rect x="40" y="120" width="70" height="12" rx="6" fill="#7cc85a"/><rect x="150" y="92" width="70" height="12" rx="6" fill="#ffffff"/><rect x="250" y="64" width="70" height="12" rx="6" fill="#ffb36b"/><rect x="150" y="38" width="64" height="12" rx="6" fill="#8e9cff"/></g>
    <path d="M285 64 q0 -12 0 -14" stroke="#9aa" stroke-width="3"/><path d="M276 50 h18 l-4 -8 h-10z" fill="#ff5a5a"/>
    <g transform="translate(186 70)"><ellipse cx="0" cy="0" rx="17" ry="16" fill="#7ed957"/><ellipse cx="-6" cy="-3" rx="4" ry="5" fill="#fff"/><ellipse cx="6" cy="-3" rx="4" ry="5" fill="#fff"/><circle cx="-5" cy="-2" r="2.3" fill="#2a1a12"/><circle cx="7" cy="-2" r="2.3" fill="#2a1a12"/><path d="M-4 4 q4 4 8 0" stroke="#5a2a1a" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>
    <g fill="#ffd23c"><path d="M110 70 l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/><path d="M60 92 l2.4 5 5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8z"/><path d="M228 40 l2.4 5 5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8z"/></g></svg>`;
}
const SC_UI = { tab: 'jugar' };
function viewCielo() {
  const d = scData(); scMissions();
  const tabs = [['jugar', 'Jugar'], ['tienda', 'Tienda'], ['misiones', 'Misiones']];
  const seg = `<div class="seg full" role="group" style="margin-top:14px">${tabs.map(([k, l]) => `<button type="button" data-act="sc-tab" data-v="${k}" aria-pressed="${SC_UI.tab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (SC_UI.tab === 'jugar') {
    body = `<p class="page-sub">Rebotas solo: <b>arrastra el dedo</b> a los lados (o inclina el teléfono) para caer en las plataformas. Junta <b>estrellas</b>, pisa a los enemigos desde arriba y usa cohetes, hélices, escudos e imanes. Cada 225 m cambias de mundo: Pradera, Nubes, Atardecer, Noche, Espacio y Galaxia dulce.</p>
      <button class="btn primary block gm-play" data-act="sc-start">${icon('play')}Jugar</button>
      <label class="sc-opt"><input type="checkbox" data-act="sc-tilt" ${d.tilt ? 'checked' : ''}> Mover inclinando el teléfono</label>
      <p class="small muted" style="text-align:center;margin-top:10px">${d.best ? `Tu mejor: <b>${d.best} m</b>` : 'Todavía no tienes récord.'} · ⭐ <b>${d.w}</b> estrellas</p>
      <div id="jgRank-cielo">${jgRankHTML('cielo')}</div>`;
  } else if (SC_UI.tab === 'tienda') {
    const own = new Set(d.own);
    const card = (it, kind) => { const has = own.has(it.id), on = (kind === 'skin' ? d.skin : d.trail) === it.id; return `<button type="button" class="sc-item${on ? ' on' : ''}" data-act="sc-buy" data-k="${kind}" data-id="${it.id}">${kind === 'skin' ? `<canvas width="120" height="120" data-scskin="${it.id}"></canvas>` : `<span class="sc-trail">${it.c.map((c) => `<i style="background:${c}"></i>`).join('') || '—'}</span>`}<b>${it.n}</b><span>${on ? 'Usando' : has ? 'Usar' : `⭐ ${it.p}`}</span></button>`; };
    const ups = SC_UPS.map((u) => { const l = scUp(u.id); const max = l >= u.max; return `<li class="sc-up"><div><b>${u.n}</b><span class="small muted">${u.d}</span><span class="sc-pips">${Array.from({ length: u.max }, (_, i) => `<i class="${i < l ? 'on' : ''}"></i>`).join('')}</span></div><button type="button" class="btn${max ? '' : ' primary'}" data-act="sc-upbuy" data-id="${u.id}" ${max ? 'disabled' : ''}>${max ? 'Máximo' : `⭐ ${u.cost(l)}`}</button></li>`; }).join('');
    body = `<p class="small muted" style="text-align:center;margin:12px 0">Tienes ⭐ <b>${d.w}</b> estrellas</p>
      <h2 class="sec">Personajes</h2><div class="sc-grid">${SC_SKINS.map((s) => card(s, 'skin')).join('')}</div>
      <h2 class="sec">Estelas</h2><div class="sc-grid">${SC_TRAILS.map((s) => card(s, 'trail')).join('')}</div>
      <h2 class="sec">Mejoras</h2><ul class="sc-ups">${ups}</ul>`;
    setTimeout(scPaintSkins, 0);
  } else {
    const ms = scMissions();
    body = `<p class="page-sub" style="margin-top:12px">Cumple misiones para ganar estrellas extra. Cuando terminas una, llega otra un poco más difícil.</p>
      <ul class="sc-ms">${ms.map((m, i) => { const done = m.prog >= m.goal; return `<li class="${done ? 'done' : ''}"><div><b>${scMText(m)}</b><div class="sc-bar"><i style="width:${Math.min(100, m.prog / m.goal * 100)}%"></i></div><span class="small muted">${Math.min(m.prog, m.goal)} / ${m.goal}</span></div>${done ? `<button type="button" class="btn primary" data-act="sc-claim" data-i="${i}">Cobrar ⭐ ${m.rew}</button>` : `<span class="sc-rew">⭐ ${m.rew}</span>`}</li>`; }).join('')}</ul>
      <p class="small muted" style="text-align:center">Partidas jugadas: <b>${d.games}</b> · estrellas totales: <b>${d.st.star || 0}</b> · enemigos pisados: <b>${d.st.stomp || 0}</b></p>`;
  }
  return `<section class="gm-home"><div class="gm-hero">${scHero()}</div><h1 class="page-title gm-title">Salto al Cielo</h1>${seg}${body}
    <p class="small muted" style="text-align:center;margin-top:12px">Puedes salir cuando quieras: tu récord y tus estrellas se guardan igual.</p></section>`;
}
function scPaintSkins() {
  document.querySelectorAll('canvas[data-scskin]').forEach((cv) => { const g = cv.getContext('2d'); g.clearRect(0, 0, 120, 120); scDrawChar(g, 60, 64, 34, cv.dataset.scskin, {}); });
}
JG_CFG.cielo = { tabs: [['dia', 'Hoy'], ['semana', 'Semana'], ['record', 'Récord'], ['manzanas', 'Partidas']], val: (x, t) => (t === 'manzanas' ? plural(x.apples, 'partida', 'partidas') : `${x.score} m`), mine: (m) => `Tu mejor: <b>${m.best || 0} m</b> · partidas: <b>${m.games || 0}</b>`, none: 'Aún nadie ha saltado en este periodo. ¡Sé la primera persona!' };

Object.assign(VIDA_ACTS, {
  'sc-tab': (el) => { SC_UI.tab = el.dataset.v; render(); },
  'sc-start': () => scStart(),
  'sc-tilt': (el) => {
    const d = scData(); d.tilt = el.checked ? 1 : 0; jpSave();
    if (d.tilt && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then((r) => { if (r !== 'granted') { d.tilt = 0; jpSave(); el.checked = false; toast('Sin permiso para el movimiento: se juega con el dedo'); } }).catch(() => { d.tilt = 0; jpSave(); el.checked = false; });
    }
  },
  'sc-buy': (el) => {
    const d = scData(); const kind = el.dataset.k, id = el.dataset.id; const list = kind === 'skin' ? SC_SKINS : SC_TRAILS; const it = list.find((x) => x.id === id); if (!it) return;
    if (!d.own.includes(id)) { if (d.w < it.p) { toast(`Te faltan ${it.p - d.w} estrellas`); return; } d.w -= it.p; d.own.push(id); JG_TONE(880, 0.12, 'triangle', 0.06, 1320); toast(`¡${it.n} es tuyo!`); }
    if (kind === 'skin') d.skin = id; else d.trail = id; jpSave(); render();
  },
  'sc-upbuy': (el) => {
    const d = scData(); const u = SC_UPS.find((x) => x.id === el.dataset.id); if (!u) return; const l = scUp(u.id); if (l >= u.max) return; const c = u.cost(l);
    if (d.w < c) { toast(`Te faltan ${c - d.w} estrellas`); return; }
    d.w -= c; d.up[u.id] = l + 1; jpSave(); JG_TONE(660, 0.1, 'triangle', 0.06, 990); toast(`${u.n}: nivel ${l + 1}`); render();
  },
  'sc-claim': (el) => {
    const d = scData(); const i = +el.dataset.i; const m = d.ms[i]; if (!m || m.prog < m.goal) return;
    d.w += m.rew; d.ms.splice(i, 1); d.mlv = (d.mlv || 0) + 1; scMissions(); jpSave(); JG_TONE(1046, 0.15, 'triangle', 0.07, 1568); toast(`+${m.rew} estrellas`); render();
  },
});

/* ---------- sonido ---------- */
const SCS = { ac: null, out: null, music: true, mt: 0, beat: 0, nb: 0, rk: null };
function scAudio() {
  if (SCS.ac) { if (SCS.ac.state === 'suspended') SCS.ac.resume().catch(() => {}); return; }
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)(); SCS.ac = ac;
    const comp = ac.createDynamicsCompressor(); comp.connect(ac.destination);
    SCS.out = ac.createGain(); SCS.out.gain.value = 0.9; SCS.out.connect(comp);
    SCS.nb = ac.currentTime + 0.1; SCS.beat = 0;
  } catch { SCS.ac = null; }
}
function scTone(f, d, type, vol, f2, delay = 0, attack = 0.006) {
  const ac = SCS.ac; if (!ac) return; const t0 = ac.currentTime + delay;
  const o = ac.createOscillator(), v = ac.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + d * 0.85);
  v.gain.setValueAtTime(0.0001, t0); v.gain.linearRampToValueAtTime(vol, t0 + attack); v.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
  o.connect(v); v.connect(SCS.out); o.start(t0); o.stop(t0 + d + 0.05);
}
function scNoise(d, vol, f0, f1, delay = 0) {
  const ac = SCS.ac; if (!ac) return; const t0 = ac.currentTime + delay; const n = Math.max(1, Math.floor(ac.sampleRate * d)); const b = ac.createBuffer(1, n, ac.sampleRate); const ch = b.getChannelData(0);
  for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ac.createBufferSource(); s.buffer = b; const fl = ac.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = 1.2; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + d); const v = ac.createGain(); v.gain.value = vol;
  s.connect(fl); fl.connect(v); v.connect(SCS.out); s.start(t0);
}
const SC_SCALE = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const scNote = (base, i) => base * Math.pow(2, SC_SCALE[Math.max(0, Math.min(SC_SCALE.length - 1, i))] / 12);
const SC_SFX = {
  jump: (wi) => { const b = [392, 440, 494, 330, 262, 523][wi % 6]; scTone(b, 0.14, 'sine', 0.07, b * 1.6); scTone(b * 2, 0.08, 'triangle', 0.02); },
  spring: () => { scTone(220, 0.35, 'sine', 0.1, 880); scTone(440, 0.3, 'triangle', 0.035, 1320, 0.02); },
  tramp: () => { scTone(180, 0.5, 'sine', 0.11, 1100); [0, 1, 2, 3].forEach((i) => scTone(scNote(523, i * 2), 0.25, 'triangle', 0.04, 0, 0.05 + i * 0.05)); },
  star: (k) => { const f = scNote(784, Math.min(10, k)); scTone(f, 0.22, 'sine', 0.06); scTone(f * 2.01, 0.12, 'sine', 0.02); },
  power: () => { [0, 2, 4, 5].forEach((i) => scTone(scNote(523, i), 0.3, 'triangle', 0.05, 0, i * 0.06)); },
  shield: () => { scTone(330, 0.5, 'sine', 0.07, 990); scTone(660, 0.4, 'triangle', 0.03, 1320, 0.05); },
  pop: () => { scNoise(0.25, 0.12, 2400, 600); scTone(880, 0.2, 'sine', 0.05, 220); },
  stomp: () => { scTone(160, 0.12, 'square', 0.05, 80); scTone(660, 0.18, 'triangle', 0.05, 1320, 0.05); },
  crack: () => { scNoise(0.22, 0.12, 1800, 400); scTone(220, 0.15, 'triangle', 0.04, 110); },
  death: () => { [0, 1, 2, 3].forEach((i) => scTone(scNote(392, 6 - i * 2), 0.35, 'triangle', 0.06, 0, i * 0.14)); scTone(400, 0.9, 'sine', 0.05, 90, 0.1); },
  world: () => { [0, 2, 4, 7, 9].forEach((i) => scTone(scNote(523, i), 0.45, 'triangle', 0.05, 0, i * 0.08)); scTone(1046, 0.8, 'sine', 0.03, 0, 0.42); },
  record: () => { [0, 4, 7, 12].forEach((i) => scTone(523 * Math.pow(2, i / 12), 0.5, 'triangle', 0.06, 0, i * 0.03)); },
  meteor: () => { scNoise(0.6, 0.06, 300, 1500); },
};
const SC_CH = [[262, 330, 392], [220, 262, 330], [175, 220, 262], [196, 247, 294]];
function scMusic(wi, on) {
  const ac = SCS.ac; if (!ac || !SCS.music || !on) { if (ac) SCS.nb = Math.max(SCS.nb, ac.currentTime); return; }
  while (SCS.nb < ac.currentTime + 0.3) {
    const bar = Math.floor(SCS.beat / 8) % 4, step = SCS.beat % 8, ch = SC_CH[bar], t = SCS.nb - ac.currentTime;
    const mul = [1, 1, 1.5, 0.75, 1.25, 1.12][wi % 6] > 1.4 ? 1 : 1;
    if (step === 0) ch.forEach((f) => scTone(f / 2 * mul, 1.9, 'sine', 0.012, 0, t, 0.3));
    const arp = [0, 1, 2, 1, 0, 2, 1, 2][step];
    scTone(ch[arp] * 2 * mul, 0.3, wi === 4 ? 'sine' : 'triangle', step % 2 ? 0.008 : 0.012, 0, t);
    SCS.nb += 0.25; SCS.beat++;
  }
}
function scRocketSound(on) {
  const ac = SCS.ac; if (!ac) return;
  if (on && !SCS.rk) {
    const n = ac.sampleRate; const b = ac.createBuffer(1, n, n); const ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(); s.buffer = b; s.loop = true; const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 900; const v = ac.createGain(); v.gain.value = 0.0001; v.gain.linearRampToValueAtTime(0.07, ac.currentTime + 0.15);
    s.connect(fl); fl.connect(v); v.connect(SCS.out); s.start(); SCS.rk = { s, v };
  } else if (!on && SCS.rk) { const r = SCS.rk; SCS.rk = null; try { r.v.gain.cancelScheduledValues(ac.currentTime); r.v.gain.setValueAtTime(r.v.gain.value, ac.currentTime); r.v.gain.linearRampToValueAtTime(0.0001, ac.currentTime + 0.25); r.s.stop(ac.currentTime + 0.3); } catch { /* */ } }
}

/* ---------- el juego ---------- */
function scStart() {
  if (SC.run) return;
  scAudio();
  const D = scData(); scMissions();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage sc-stage';
  wrap.innerHTML = `<canvas aria-label="Salto al Cielo"></canvas>
    <button class="gm-x gl-x" id="scX" aria-label="Salir del juego">${icon('x')}</button>
    <button class="gm-x sc-pbtn" id="scP" aria-label="Pausa"><svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="#333"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="#333"/></svg></button>
    <div class="sc-hint" id="scHint">${D.tilt ? 'Inclina el teléfono para moverte' : 'Arrastra el dedo a los lados'}</div>
    <div class="gl-over" id="scPause" hidden><b>Pausa</b><div class="btn-row" style="justify-content:center;flex-wrap:wrap"><button class="btn primary" id="scGo">${icon('play')}Seguir</button><button class="btn" id="scMus"></button><button class="btn" id="scQuit">Salir</button></div></div>
    <div class="gl-over" id="scOver" hidden><b id="scTitle">¡Buen salto!</b><span id="scFin"></span><span id="scGain" class="pm-gain"></span><span id="scMs" class="small"></span><span class="small muted" id="scRank"></span>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="scAgain">${icon('play')}Otra vez</button><button class="btn" id="scDone">Volver</button></div></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const c = wrap.querySelector('canvas'), g = c.getContext('2d');
  const $w = (s) => wrap.querySelector(s);
  const probe = document.createElement('div'); probe.style.cssText = 'position:absolute;visibility:hidden;padding-top:env(safe-area-inset-top,0px)'; wrap.appendChild(probe);
  const V = { w: 360, h: 640, dpr: 1, S: 1, ox: 0, VH: 700, safe: 0 };
  let SPR = new Map();
  const size = () => {
    V.dpr = Math.min(2, devicePixelRatio || 1); const W = innerWidth, H = innerHeight;
    c.width = Math.round(W * V.dpr); c.height = Math.round(H * V.dpr); c.style.width = W + 'px'; c.style.height = H + 'px';
    V.w = W; V.h = H; V.S = Math.min(W / SC_BW, H / 600); V.ox = (W - SC_BW * V.S) / 2; V.VH = H / V.S; V.safe = parseFloat(getComputedStyle(probe).paddingTop) || 0;
    SPR = new Map();
  };
  size(); addEventListener('resize', size);
  const X = (x) => V.ox + x * V.S, Y = (y) => V.h - (y - st.cam) * V.S;
  const low = () => !!(window.cnPerf && window.cnPerf.low());

  const R = 22; // radio del personaje (unidades)
  const skin = D.skin, trail = (SC_TRAILS.find((t) => t.id === D.trail) || SC_TRAILS[0]).c;
  const UPL = { rocket: scUp('rocket'), magnet: scUp('magnet'), shield: scUp('shield'), luck: scUp('luck'), spring: scUp('spring') };
  let st;
  const fresh = () => ({
    state: 'run', t: 0, cam: 0, maxY: 0, genY: 40, lastType: 'n',
    p: { x: SC_BW / 2, y: 60, vx: 0, vy: 900, face: 1, sx: 1, sy: 1, blink: 0, spin: 0 },
    plats: [], items: [], stars: [], enemies: [], meteors: [], parts: [], floats: [],
    stars_n: 0, stomps: 0, rockets: 0, springs: 0, breaks: 0, combo: 0, comboT: 0,
    power: null, shield: Math.min(2, UPL.shield), shieldT: 0, mag: 0, wi: 0, banner: { name: SC_WORLDS[0].n, sub: 'Mundo 1', t: 0 },
    shake: 0, flash: 0, nextMeteor: 4, dying: 0, last: performance.now(), id: 0, t0: Date.now(), newBest: false,
  });
  st = fresh();
  const rnd = Math.random;

  /* --- generación --- */
  const diffAt = (y) => scClamp(y / (SC_WORLD * 5), 0, 1);
  function addPlat(x, y, w, type) { const p = { x, y, w, type, x0: x, y0: y, t: rnd() * 6, sp: 0.5 + rnd() * 0.7, amp: 40 + rnd() * 90, dead: 0, used: 0, bt: rnd() * 3 }; st.plats.push(p); return p; }
  function gen(top) {
    while (st.genY < top) {
      const y0 = st.genY, df = diffAt(y0), wi = scWorldAt(y0), loop = Math.floor(wi / SC_WORLDS.length);
      const gap = Math.min(150, scLerp(64, 132, Math.min(1, df + loop * 0.1)) * (0.82 + rnd() * 0.24));
      const y = y0 + gap; st.genY = y;
      let type = 'n'; const r = rnd();
      if (y > 600) {
        if (r < 0.12 + 0.2 * df) type = 'm'; else if (r < 0.2 + 0.32 * df) type = 'f'; else if (r < 0.24 + 0.4 * df && y > SC_WORLD * 0.6) type = 'b'; else if (r < 0.28 + 0.46 * df) type = 'v';
      }
      if ((st.lastType === 'f' || st.lastType === 'b') && (type === 'f' || type === 'b')) type = 'n';
      st.lastType = type;
      const w = scLerp(98, 64, df) * (0.9 + rnd() * 0.25);
      const x = w / 2 + 8 + rnd() * (SC_BW - w - 16);
      const pl = addPlat(x, y, w, type);
      // plataformas extra (señuelos frágiles o normales) para llenar el cielo
      if (rnd() < 0.18 + 0.1 * df) { const w2 = scLerp(90, 62, df); const x2 = (x + SC_BW / 2 + rnd() * 80) % (SC_BW - w2) + w2 / 2; addPlat(x2, y - gap * (0.3 + rnd() * 0.4), w2, rnd() < 0.6 ? 'f' : 'n'); }
      const luck = 1 + UPL.luck * 0.18;
      if (type === 'n' || type === 'm') {
        const q = rnd();
        if (q < 0.075 * luck) st.items.push({ k: 'spring', pl, dx: (rnd() - 0.5) * (w - 26), t: 0 });
        else if (q < 0.1 * luck && y > 1500) st.items.push({ k: 'tramp', pl, dx: 0, t: 0 });
        else if (y > 900 && q < 0.1 * luck + 0.018 * luck) st.items.push({ k: 'rocket', x: pl.x, y: y + 46, t: 0, free: 1 });
        else if (y > 500 && q < 0.1 * luck + 0.04 * luck) st.items.push({ k: 'heli', x: pl.x, y: y + 44, t: 0, free: 1 });
        else if (q < 0.1 * luck + 0.055 * luck) st.items.push({ k: 'shield', x: pl.x, y: y + 44, t: 0, free: 1 });
        else if (q < 0.1 * luck + 0.075 * luck) st.items.push({ k: 'magnet', x: pl.x, y: y + 44, t: 0, free: 1 });
      }
      if (rnd() < 0.36 * luck) {
        const n = 3 + Math.floor(rnd() * 4), shape = rnd(); const bx = 30 + rnd() * (SC_BW - 60);
        for (let i = 0; i < n; i++) { const u = i / (n - 1); const sx = shape < 0.5 ? bx + Math.sin(u * Math.PI) * 40 - 20 : scClamp(bx - 50 + u * 100, 16, SC_BW - 16); st.stars.push({ x: sx, y: y + 30 + u * Math.min(110, gap * 0.9), t: rnd() * 6, got: 0, big: 0 }); }
      }
      if (rnd() < 0.012 * luck && y > 2000) st.stars.push({ x: 40 + rnd() * (SC_BW - 80), y: y + 60, t: 0, got: 0, big: 1 });
      if (y > 1100 && rnd() < 0.045 + 0.09 * df) {
        const kind = SC_WORLDS[wi % SC_WORLDS.length].en;
        st.enemies.push({ k: kind, x: 30 + rnd() * (SC_BW - 60), y: y + gap * 0.5, x0: 0, y0: 0, t: rnd() * 6, dir: rnd() < 0.5 ? -1 : 1, dead: 0, sp: 50 + rnd() * 60 + df * 60 });
        const e = st.enemies[st.enemies.length - 1]; e.x0 = e.x; e.y0 = e.y;
      }
    }
  }
  st.plats.push({ x: SC_BW / 2, y: 40, w: 140, type: 'n', x0: SC_BW / 2, y0: 40, t: 0, sp: 0, amp: 0, dead: 0, used: 0, bt: 0, ground: 1 });
  gen(1400);

  /* --- entrada --- */
  let tx = null, keyL = 0, keyR = 0, tiltV = null;
  const toW = (cx) => (cx - V.ox) / V.S;
  c.addEventListener('pointerdown', (e) => { scAudio(); tx = toW(e.clientX); hideHint(); try { c.setPointerCapture(e.pointerId); } catch { /* */ } e.preventDefault(); });
  c.addEventListener('pointermove', (e) => { if (tx != null) tx = toW(e.clientX); });
  const up = () => { tx = null; }; c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  const onKey = (e) => { const d = e.type === 'keydown'; if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { keyL = d; hideHint(); } if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { keyR = d; hideHint(); } if (d && (e.key === 'p' || e.key === 'Escape')) togglePause(); };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  const onTilt = (e) => { if (D.tilt && e.gamma != null) tiltV = scClamp(e.gamma / 22, -1, 1); };
  addEventListener('deviceorientation', onTilt);
  let hintOff = false; const hideHint = () => { if (hintOff) return; hintOff = true; const h = $w('#scHint'); if (h) h.classList.add('off'); };
  setTimeout(hideHint, 4500);
  const onVis = () => { if (document.hidden && st.state === 'run') togglePause(true); };
  document.addEventListener('visibilitychange', onVis);

  /* --- efectos --- */
  const PCAP = () => (low() ? 70 : 160);
  const burst = (x, y, n, cols, sp, life, grav = 300) => { const cap = PCAP(); for (let i = 0; i < n && st.parts.length < cap; i++) { const a = rnd() * 6.283, v = (0.3 + rnd()) * sp; st.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, l: life * (0.6 + rnd() * 0.6), c: cols[(rnd() * cols.length) | 0], r: 2 + rnd() * 3, gr: grav }); } };
  const float = (text, x, y, col) => st.floats.push({ text, x, y, t: 0, c: col || '#fff' });

  /* --- lógica --- */
  function landOn(pl) {
    const p = st.p; p.y = pl.y + 8; p.sx = 1.25; p.sy = 0.75;
    // resortes y trampolines encima de esta plataforma
    for (const it of st.items) {
      if (it.pl !== pl || it.used) continue;
      const ix = pl.x + it.dx;
      if (it.k === 'spring' && Math.abs(p.x - ix) < 20) { p.vy = 1250 + UPL.spring * 90; it.t = 0.01; st.springs++; SC_SFX.spring(); burst(ix, pl.y + 14, 10, ['#fff', '#ffe066'], 140, 0.6); return; }
      if (it.k === 'tramp' && Math.abs(p.x - ix) < pl.w / 2) { p.vy = 1560 + UPL.spring * 110; it.t = 0.01; st.springs++; SC_SFX.tramp(); p.spin = 1; burst(ix, pl.y + 14, 16, ['#ff5d8f', '#ffd23c', '#4aa8ff'], 200, 0.8); return; }
    }
    p.vy = 820; SC_SFX.jump(st.wi);
    if (!low()) burst(p.x, pl.y + 4, 4, ['rgba(255,255,255,.9)'], 70, 0.4, 100);
    if (pl.type === 'f') { pl.dead = 0.001; st.breaks++; SC_SFX.crack(); burst(pl.x, pl.y, 12, SC_WORLDS[st.wi % 6].pl, 160, 0.8); }
  }
  function hitEnemy(e) {
    const p = st.p;
    if (st.power) { e.dead = 0.001; e.vy = 400; SC_SFX.stomp(); burst(e.x, e.y, 14, ['#fff', '#ffd23c'], 220, 0.7); return; }
    if (p.vy < 0 && p.y > e.y + 2) { e.dead = 0.001; e.vy = 0; p.vy = 950; st.stomps++; SC_SFX.stomp(); burst(e.x, e.y, 14, ['#fff', '#ffd23c', '#ff8fab'], 200, 0.7); float('¡Pum! +3', e.x, e.y, '#fff59a'); st.stars_n += 3; return; }
    if (st.shield > 0) { st.shield--; st.shieldT = 0; e.dead = 0.001; e.vy = 300; SC_SFX.pop(); st.flash = 0.6; burst(p.x, p.y + R, 20, ['#bfe9ff', '#ffffff'], 260, 0.8); p.vy = Math.max(p.vy, 700); return; }
    die();
  }
  function die() { if (st.state !== 'run') return; st.state = 'dying'; st.dying = 0; st.p.vy = 600; st.p.spin = 1; st.shake = 0.6; SC_SFX.death(); scRocketSound(false); if (navigator.vibrate) try { navigator.vibrate(120); } catch { /* */ } }

  function step(dt) {
    st.t += dt; const p = st.p;
    if (st.state === 'run' || st.state === 'dying') {
      // horizontal
      let target = 0;
      if (st.state === 'run') {
        if (tx != null) target = scClamp((tx - p.x) * 7.5, -520, 520);
        else if (keyL || keyR) target = (keyR ? 380 : 0) - (keyL ? 380 : 0);
        else if (tiltV != null && D.tilt) target = tiltV * 520;
      }
      p.vx = scLerp(p.vx, target, scClamp(dt * 13, 0, 1)); p.x += p.vx * dt;
      if (p.vx > 25) p.face = 1; else if (p.vx < -25) p.face = -1;
      if (p.x < -R) p.x += SC_BW + 2 * R; if (p.x > SC_BW + R) p.x -= SC_BW + 2 * R;
      const py0 = p.y;
      if (st.power && st.state === 'run') {
        st.power.t -= dt; p.vy = st.power.k === 'rocket' ? 1150 : 780;
        const cols = st.power.k === 'rocket' ? ['#ffd23c', '#ff9a3c', '#ff5a3c'] : ['#ffffff', '#bfe9ff'];
        if (!low() || rnd() < 0.5) burst(p.x, p.y - 4, st.power.k === 'rocket' ? 3 : 1, cols, 90, 0.5, 600);
        if (st.power.t <= 0) { st.parts.push({ x: p.x, y: p.y + R, vx: (rnd() - 0.5) * 80, vy: 150, t: 0, l: 1.2, c: '#9aa4b2', r: 8, gr: 900, spr: st.power.k }); st.power = null; p.vy = 650; scRocketSound(false); }
      } else p.vy -= 1950 * dt;
      p.y += p.vy * dt;
      p.sx = scLerp(p.sx, 1, scClamp(dt * 10, 0, 1)); p.sy = scLerp(p.sy, 1, scClamp(dt * 10, 0, 1));
      if (p.spin) { p.spin += dt * 2.2; if (p.spin > 2.2 && st.state === 'run') p.spin = 0; }
      if (rnd() < 0.006) p.blink = 0.14; if (p.blink > 0) p.blink -= dt;
      if (trail.length && (!low() || rnd() < 0.4) && Math.abs(p.vy) > 200) burst(p.x, p.y + R * 0.4, 1, trail, 30, 0.6, 40);
      // plataformas
      for (const pl of st.plats) {
        pl.t += dt;
        if (pl.type === 'm') pl.x = scClamp(pl.x0 + Math.sin(pl.t * pl.sp * 1.4) * pl.amp, pl.w / 2 + 4, SC_BW - pl.w / 2 - 4);
        if (pl.type === 'v') pl.y = pl.y0 + Math.sin(pl.t * pl.sp * 1.6) * 34;
        if (pl.dead) { pl.dead += dt * 2.2; continue; }
        const vis = pl.type !== 'b' || ((pl.t + pl.bt) % 3.2) < 2.3;
        pl.vis = vis;
        if (st.state === 'run' && !st.power && vis && p.vy < 0 && py0 >= pl.y + 8 - 1 && p.y <= pl.y + 8 && Math.abs(p.x - pl.x) < pl.w / 2 + R * 0.55) landOn(pl);
      }
      // objetos
      for (const it of st.items) {
        it.t += dt;
        if (!it.free || it.used || st.state !== 'run') continue;
        if (Math.hypot(it.x - p.x, it.y - (p.y + R)) < R + 18) {
          it.used = 1; burst(it.x, it.y, 16, ['#fff', '#ffd23c', '#bfe9ff'], 200, 0.7);
          if (it.k === 'rocket' || it.k === 'heli') { st.power = { k: it.k === 'rocket' ? 'rocket' : 'heli', t: it.k === 'rocket' ? 2.2 + UPL.rocket * 0.6 : 2.0 + UPL.rocket * 0.3, T: 0 }; st.power.T = st.power.t; st.rockets++; SC_SFX.power(); if (it.k === 'rocket') scRocketSound(true); float(it.k === 'rocket' ? '¡Cohete!' : '¡Hélice!', it.x, it.y); }
          else if (it.k === 'shield') { st.shield = Math.min(2, st.shield + 1); st.shieldT = 0; SC_SFX.shield(); float('¡Escudo!', it.x, it.y); }
          else if (it.k === 'magnet') { st.mag = 7 + UPL.magnet * 1.4; SC_SFX.power(); float('¡Imán!', it.x, it.y); }
        }
      }
      if (st.mag > 0) st.mag -= dt;
      st.shieldT += dt;
      // estrellas
      const magR = st.mag > 0 ? 150 + UPL.magnet * 30 : 0;
      for (const s of st.stars) {
        s.t += dt; if (s.got) { s.got += dt * 3; continue; }
        if (st.state !== 'run') continue;
        const dx = p.x - s.x, dy = (p.y + R) - s.y, d = Math.hypot(dx, dy);
        if (magR && d < magR) { s.x += dx / d * Math.min(d, 520 * dt); s.y += dy / d * Math.min(d, 520 * dt); }
        if (d < R + (s.big ? 20 : 14)) {
          s.got = 0.01; const v = s.big ? 10 : 1; st.stars_n += v; st.combo = st.comboT > 0 ? st.combo + 1 : 0; st.comboT = 0.55; SC_SFX.star(st.combo);
          if (s.big) { float('+10', s.x, s.y, '#ffe066'); burst(s.x, s.y, 18, ['#ffe066', '#fff'], 220, 0.8); } else if (!low()) burst(s.x, s.y, 5, ['#ffe066', '#fff'], 90, 0.4, 0);
        }
      }
      st.comboT -= dt;
      // enemigos
      for (const e of st.enemies) {
        e.t += dt;
        if (e.dead) { e.dead += dt; e.y += (e.vy || 0) * dt; e.vy = (e.vy || 0) - 1400 * dt; continue; }
        if (e.k === 'abeja') { e.x = e.x0 + Math.sin(e.t * 2.2) * 60; e.y = e.y0 + Math.sin(e.t * 5) * 10; }
        else if (e.k === 'pajaro' || e.k === 'ovni') { e.x += e.dir * e.sp * dt * (e.k === 'ovni' ? 0.7 : 1); if (e.x < 20) e.dir = 1; if (e.x > SC_BW - 20) e.dir = -1; if (e.k === 'ovni') e.y = e.y0 + Math.sin(e.t * 1.6) * 14; }
        else if (e.k === 'murcielago') { e.x = e.x0 + Math.sin(e.t * 1.3) * 90; e.y = e.y0 + Math.sin(e.t * 2.6) * 30; }
        else if (e.k === 'medusa') { e.y = e.y0 + Math.sin(e.t * 1.4) * 40; e.x = e.x0 + Math.sin(e.t * 0.7) * 50; }
        e.x = scClamp(e.x, 18, SC_BW - 18);
        if (st.state === 'run' && Math.abs(e.x - p.x) < R + 16 && Math.abs(e.y - (p.y + R)) < R + 14) hitEnemy(e);
      }
      // meteoritos en el espacio
      if (st.state === 'run' && st.wi % 6 === 4) {
        st.nextMeteor -= dt;
        if (st.nextMeteor <= 0) { st.nextMeteor = scLerp(4.5, 2.2, diffAt(st.maxY)) + rnd() * 1.5; st.meteors.push({ x: 30 + rnd() * (SC_BW - 60), y: 0, warn: 1.1, t: 0 }); }
      }
      for (const m of st.meteors) {
        m.t += dt;
        if (m.warn > 0) { m.warn -= dt; m.y = st.cam + V.VH + 60; if (m.warn <= 0) SC_SFX.meteor(); continue; }
        m.y -= 760 * dt; m.x += Math.sin(m.t * 3) * 10 * dt;
        if (!low() || rnd() < 0.5) st.parts.length < PCAP() && st.parts.push({ x: m.x, y: m.y + 14, vx: (rnd() - 0.5) * 40, vy: 40, t: 0, l: 0.5, c: rnd() < 0.5 ? '#ff9a3c' : '#ffd23c', r: 3 + rnd() * 3, gr: 0 });
        if (st.state === 'run' && Math.hypot(m.x - p.x, m.y - (p.y + R)) < R + 14) { if (st.power) { m.gone = 1; burst(m.x, m.y, 14, ['#ff9a3c', '#fff'], 200, 0.6); } else if (st.shield > 0) { st.shield--; m.gone = 1; SC_SFX.pop(); st.flash = 0.6; } else die(); }
      }
      st.meteors = st.meteors.filter((m) => !m.gone && m.y > st.cam - 100);
      // cámara y mundos
      if (st.state === 'run' && p.y > st.cam + V.VH * 0.55) st.cam = p.y - V.VH * 0.55;
      if (p.y > st.maxY) st.maxY = p.y;
      const wi = scWorldAt(st.cam + V.VH * 0.5);
      if (wi !== st.wi && st.state === 'run') { st.wi = wi; const W0 = SC_WORLDS[wi % 6]; st.banner = { name: W0.n, sub: `Mundo ${wi + 1}${wi >= 6 ? ' · ¡más difícil!' : ''}`, t: 0 }; SC_SFX.world(); st.flash = 0.35; }
      gen(st.cam + V.VH + 600);
      const lim = st.cam - 200;
      st.plats = st.plats.filter((q) => q.y > lim && !(q.dead > 1));
      st.items = st.items.filter((q) => (q.pl ? q.pl.y : q.y) > lim && !(q.pl && q.pl.dead > 1) && !(q.free && q.used));
      st.stars = st.stars.filter((q) => q.y > lim && !(q.got > 1));
      st.enemies = st.enemies.filter((q) => q.y > lim && !(q.dead > 2));
      if (st.state === 'run' && p.y < st.cam - 60) { die(); st.p.vy = 0; }
      if (st.state === 'dying') { st.dying += dt; if (st.dying > 1.4) finish(); }
    }
    for (const q of st.parts) { q.t += dt; q.vy -= (q.gr || 0) * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
    st.parts = st.parts.filter((q) => q.t < q.l);
    for (const f of st.floats) f.t += dt; st.floats = st.floats.filter((f) => f.t < 1.1);
    if (st.banner) { st.banner.t += dt; if (st.banner.t > 2.8) st.banner = null; }
    if (st.shake > 0) st.shake -= dt; if (st.flash > 0) st.flash -= dt * 1.5;
  }

  /* --- dibujo --- */
  const hexRGB = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const mix = (a, b, t) => { const A = hexRGB(a), B = hexRGB(b); return `rgb(${Math.round(scLerp(A[0], B[0], t))},${Math.round(scLerp(A[1], B[1], t))},${Math.round(scLerp(A[2], B[2], t))})`; };
  function platSprite(wi, type, w) {
    const wb = Math.round(w / 6) * 6, key = `${wi}|${type}|${wb}`; let cv = SPR.get(key); if (cv) return cv;
    const k = V.S * V.dpr, PW = wb + 24, PH = 44; cv = document.createElement('canvas'); cv.width = Math.ceil(PW * k); cv.height = Math.ceil(PH * k);
    const q = cv.getContext('2d'); q.scale(k, k); q.translate(PW / 2, 16);
    const W0 = SC_WORLDS[wi], [c1, c2, c3] = W0.pl, hw = wb / 2, h = 15;
    const pill = (x, y, w2, h2, r) => { q.beginPath(); q.moveTo(x + r, y); q.arcTo(x + w2, y, x + w2, y + h2, r); q.arcTo(x + w2, y + h2, x, y + h2, r); q.arcTo(x, y + h2, x, y, r); q.arcTo(x, y, x + w2, y, r); q.closePath(); };
    q.fillStyle = 'rgba(0,0,0,.12)'; pill(-hw + 3, 4, wb - 6, h, 8); q.fill();
    if (W0.deco === 'clouds') { q.fillStyle = c1; for (let i = 0; i <= 4; i++) { const u = i / 4; q.beginPath(); q.arc(-hw + 10 + u * (wb - 20), 2 - Math.sin(u * Math.PI) * 4, 10 + Math.sin(u * Math.PI) * 4, 0, 7); q.fill(); } pill(-hw, 0, wb, 12, 6); q.fill(); q.fillStyle = c2; pill(-hw + 6, 7, wb - 12, 5, 3); q.fill(); }
    else {
      const gr = q.createLinearGradient(0, -2, 0, h); gr.addColorStop(0, c1); gr.addColorStop(1, c2); q.fillStyle = gr; pill(-hw, -2, wb, h, 8); q.fill();
      if (W0.deco === 'hills') { q.fillStyle = c3; pill(-hw + 2, 6, wb - 4, 7, 4); q.fill(); q.fillStyle = '#9be27a'; for (let x = -hw + 6; x < hw - 4; x += 7) { q.beginPath(); q.moveTo(x, -1); q.lineTo(x + 3, -6); q.lineTo(x + 6, -1); q.fill(); } q.fillStyle = '#fff'; q.beginPath(); q.arc(-hw * 0.4, -3, 2, 0, 7); q.fill(); q.fillStyle = '#ffd23c'; q.beginPath(); q.arc(-hw * 0.4, -3, 0.9, 0, 7); q.fill(); }
      else if (W0.deco === 'balloons') { q.strokeStyle = c3; q.lineWidth = 1.2; for (let x = -hw + 8; x < hw - 4; x += 10) { q.beginPath(); q.moveTo(x, 0); q.lineTo(x, h - 3); q.stroke(); } }
      else if (W0.deco === 'stars') { q.fillStyle = 'rgba(255,255,255,.55)'; pill(-hw + 6, 1, wb - 12, 3, 2); q.fill(); q.shadowColor = c1; q.shadowBlur = 8; q.strokeStyle = 'rgba(200,210,255,.8)'; q.lineWidth = 1; pill(-hw, -2, wb, h, 8); q.stroke(); q.shadowBlur = 0; }
      else if (W0.deco === 'planets') { q.fillStyle = c3; for (let x = -hw + 8; x < hw - 4; x += 14) { q.beginPath(); q.arc(x, 5, 1.6, 0, 7); q.fill(); } q.fillStyle = '#4aa8ff'; pill(-hw + 4, 9, wb - 8, 2.5, 1); q.fill(); }
      else if (W0.deco === 'candy') { q.save(); pill(-hw, -2, wb, h, 8); q.clip(); q.fillStyle = 'rgba(255,255,255,.7)'; for (let x = -hw - 10; x < hw + 10; x += 12) { q.beginPath(); q.moveTo(x, -2); q.lineTo(x + 6, -2); q.lineTo(x - 2, h); q.lineTo(x - 8, h); q.fill(); } q.restore(); }
      q.fillStyle = 'rgba(255,255,255,.45)'; pill(-hw + 6, 0, wb * 0.45, 3, 2); q.fill();
    }
    if (type === 'f') { q.strokeStyle = 'rgba(60,30,20,.55)'; q.lineWidth = 1.4; q.beginPath(); q.moveTo(-hw * 0.3, -1); q.lineTo(-hw * 0.15, 5); q.lineTo(-hw * 0.32, 10); q.moveTo(hw * 0.35, -1); q.lineTo(hw * 0.2, 6); q.lineTo(hw * 0.4, 11); q.stroke(); }
    if (type === 'm' || type === 'v') { q.fillStyle = 'rgba(255,255,255,.85)'; const a = type === 'm'; for (const s of [-1, 1]) { q.beginPath(); if (a) { q.moveTo(s * (hw - 6), 5); q.lineTo(s * (hw - 12), 1.5); q.lineTo(s * (hw - 12), 8.5); } else { q.moveTo(s * 8, s < 0 ? 1 : 10); q.lineTo(s * 8 - 4, 5.5); q.lineTo(s * 8 + 4, 5.5); } q.fill(); } }
    if (type === 'b') { q.setLineDash([4, 3]); q.strokeStyle = 'rgba(255,255,255,.9)'; q.lineWidth = 1.5; pill(-hw, -2, wb, h, 8); q.stroke(); }
    SPR.set(key, cv); return cv;
  }
  function starSprite(big) {
    const key = 'star' + big; let cv = SPR.get(key); if (cv) return cv; const r = big ? 20 : 11, k = V.S * V.dpr, P = (r + 8) * 2;
    cv = document.createElement('canvas'); cv.width = Math.ceil(P * k); cv.height = Math.ceil(P * k); const q = cv.getContext('2d'); q.scale(k, k); q.translate(P / 2, P / 2);
    const gl = q.createRadialGradient(0, 0, 2, 0, 0, r + 8); gl.addColorStop(0, 'rgba(255,240,160,.7)'); gl.addColorStop(1, 'rgba(255,240,160,0)'); q.fillStyle = gl; q.beginPath(); q.arc(0, 0, r + 8, 0, 7); q.fill();
    q.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.48 : r, a = i * Math.PI / 5; q.lineTo(Math.sin(a) * rr, -Math.cos(a) * rr); } q.closePath();
    const gr = q.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#fff3a8'); gr.addColorStop(1, big ? '#ff9a3c' : '#ffc21a'); q.fillStyle = gr; q.fill(); q.strokeStyle = '#d98e00'; q.lineWidth = 1.2; q.stroke();
    q.fillStyle = 'rgba(255,255,255,.75)'; q.beginPath(); q.ellipse(-r * 0.2, -r * 0.3, r * 0.18, r * 0.1, -0.5, 0, 7); q.fill();
    SPR.set(key, cv); return cv;
  }
  const BGS = Array.from({ length: 70 }, (_, i) => ({ x: (i * 97.3) % 1, y: (i * 53.71) % 1, r: 0.6 + (i % 3) * 0.6, ph: i }));
  function drawDeco(kind, a, W, H) {
    if (a <= 0.01) return; g.globalAlpha = a; const cam = st.cam * V.S;
    if (kind === 'hills') {
      const yb = H + cam * 0.5; if (yb < H + 400) { g.fillStyle = '#9fdc8f'; g.beginPath(); g.moveTo(0, yb); for (let x = 0; x <= W; x += 20) g.lineTo(x, yb - 90 - Math.sin(x / 90) * 30); g.lineTo(W, yb + 400); g.lineTo(0, yb + 400); g.fill(); g.fillStyle = '#7cc85a'; g.beginPath(); g.moveTo(0, yb + 30); for (let x = 0; x <= W; x += 20) g.lineTo(x, yb - 30 - Math.sin(x / 60 + 2) * 22); g.lineTo(W, yb + 400); g.lineTo(0, yb + 400); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,.75)'; for (let i = 0; i < 6; i++) { const y = ((i * 170 + cam * 0.15) % (H + 160)) - 80; const x = (i * 211 + st.t * 8) % (W + 160) - 80; cloud(x, y, 40 + (i % 3) * 14); }
    } else if (kind === 'clouds') {
      for (let L = 0; L < 2; L++) { g.fillStyle = L ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.5)'; for (let i = 0; i < 6; i++) { const y = ((i * 190 + L * 90 + cam * (0.12 + L * 0.15)) % (H + 220)) - 110; const x = (i * 157 + L * 70 + st.t * (4 + L * 5)) % (W + 240) - 120; cloud(x, y, 50 + L * 20 + (i % 3) * 12); } }
    } else if (kind === 'balloons') {
      g.fillStyle = 'rgba(255,240,220,.55)'; for (let i = 0; i < 5; i++) { const y = ((i * 230 + cam * 0.12) % (H + 220)) - 110; cloud((i * 173 + st.t * 6) % (W + 200) - 100, y, 50); }
      const cols = ['#ff5d8f', '#ffd23c', '#4aa8ff', '#06d6a0']; for (let i = 0; i < 4; i++) { const y = ((i * 260 + cam * 0.2 + st.t * 12) % (H + 200)) - 100; const x = (i * 241) % (W - 40) + 20 + Math.sin(st.t * 0.6 + i) * 10; g.fillStyle = cols[i]; g.beginPath(); g.ellipse(x, H - y, 14, 17, 0, 0, 7); g.fill(); g.fillStyle = '#8a5a34'; g.fillRect(x - 5, H - y + 22, 10, 7); g.strokeStyle = 'rgba(90,60,40,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 10, H - y + 8); g.lineTo(x - 5, H - y + 22); g.moveTo(x + 10, H - y + 8); g.lineTo(x + 5, H - y + 22); g.stroke(); }
    } else {
      // estrellas para noche, espacio y galaxia
      for (const s of BGS) { const y = ((s.y * H + cam * 0.05 * s.r) % H); const tw = 0.5 + 0.5 * Math.sin(st.t * 2 + s.ph); g.globalAlpha = a * (0.4 + 0.6 * tw); g.fillStyle = kind === 'candy' ? '#ffd1ec' : '#ffffff'; g.fillRect(s.x * W, H - y, s.r * 1.5, s.r * 1.5); }
      g.globalAlpha = a;
      if (kind === 'stars') { const my = H * 0.22 + ((cam * 0.02) % 60); g.fillStyle = '#fff6d6'; g.beginPath(); g.arc(W * 0.78, my, 26, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.08)'; g.beginPath(); g.arc(W * 0.78 + 8, my - 6, 6, 0, 7); g.arc(W * 0.78 - 8, my + 8, 4, 0, 7); g.fill(); }
      if (kind === 'planets') { const y1 = ((cam * 0.04) % (H + 300)) - 150; planet(W * 0.2, H - y1 - H * 0.3, 34, '#ff9a6b', '#ffd1a8', 1); planet(W * 0.82, H - ((y1 + 420) % (H + 300)) + 100, 22, '#7ab8ff', '#cfe6ff', 0); }
      if (kind === 'candy') { const y1 = ((cam * 0.05) % (H + 300)) - 150; lolli(W * 0.15, H - y1 - H * 0.2, 26); lolli(W * 0.85, H - ((y1 + 380) % (H + 300)) + 80, 18); }
    }
    g.globalAlpha = 1;
  }
  function cloud(x, y, r) { g.beginPath(); g.arc(x, y, r * 0.6, 0, 7); g.arc(x + r * 0.55, y + r * 0.1, r * 0.48, 0, 7); g.arc(x - r * 0.55, y + r * 0.12, r * 0.45, 0, 7); g.arc(x + r * 0.15, y - r * 0.3, r * 0.45, 0, 7); g.fill(); }
  function planet(x, y, r, c1, c2, ring) { const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r); gr.addColorStop(0, c2); gr.addColorStop(1, c1); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); if (ring) { g.strokeStyle = 'rgba(255,230,200,.7)'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y, r * 1.7, r * 0.45, -0.3, 0, 7); g.stroke(); } }
  function lolli(x, y, r) { g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y + r); g.lineTo(x, y + r * 2.6); g.stroke(); g.fillStyle = '#ff8fcf'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3; g.beginPath(); for (let a = 0; a < 12; a += 0.25) { const rr = a / 12 * r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.stroke(); }
  function drawItem(it) {
    const x = it.pl ? it.pl.x + it.dx : it.x, y = it.pl ? it.pl.y + 10 : it.y + Math.sin(it.t * 3) * 4; const sx = X(x), sy = Y(y), s = V.S;
    if (it.k === 'spring') { const ex = it.t > 0 && it.t < 0.4 ? 1 : 0; g.fillStyle = '#9aa4b2'; g.fillRect(sx - 9 * s, sy - (ex ? 22 : 10) * s, 18 * s, 4 * s); g.strokeStyle = '#ff5a5a'; g.lineWidth = 2.4 * s; g.beginPath(); const hh = ex ? 22 : 10; for (let i = 0; i <= 4; i++) g.lineTo(sx + (i % 2 ? 6 : -6) * s, sy - i * hh / 4 * s); g.stroke(); return; }
    if (it.k === 'tramp') { const w = it.pl.w * 0.8, ex = it.t > 0 && it.t < 0.4 ? Math.sin(it.t * 25) * 4 : 0; g.strokeStyle = '#555'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(sx - w / 2 * s, sy); g.lineTo(sx - w / 2 * s, sy - 10 * s); g.moveTo(sx + w / 2 * s, sy); g.lineTo(sx + w / 2 * s, sy - 10 * s); g.stroke(); g.fillStyle = '#4aa8ff'; g.beginPath(); g.ellipse(sx, sy - (10 - ex) * s, w / 2 * s, 4 * s, 0, 0, 7); g.fill(); g.fillStyle = '#ff5d8f'; g.beginPath(); g.ellipse(sx, sy - (10 - ex) * s, w / 4 * s, 2 * s, 0, 0, 7); g.fill(); return; }
    // poderes flotantes con aura
    g.save(); g.translate(sx, sy); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(0, 0, (20 + Math.sin(it.t * 5) * 2) * s, 0, 7); g.fill();
    if (it.k === 'rocket') { g.rotate(-0.3); g.fillStyle = '#e8edf5'; g.beginPath(); g.ellipse(0, 0, 7 * s, 15 * s, 0, 0, 7); g.fill(); g.fillStyle = '#ff5a5a'; g.beginPath(); g.moveTo(-7 * s, -6 * s); g.quadraticCurveTo(0, -24 * s, 7 * s, -6 * s); g.fill(); g.fillStyle = '#4aa8ff'; g.beginPath(); g.arc(0, -2 * s, 3.4 * s, 0, 7); g.fill(); g.fillStyle = '#ff5a5a'; g.beginPath(); g.moveTo(-7 * s, 6 * s); g.lineTo(-12 * s, 14 * s); g.lineTo(-5 * s, 12 * s); g.moveTo(7 * s, 6 * s); g.lineTo(12 * s, 14 * s); g.lineTo(5 * s, 12 * s); g.fill(); }
    else if (it.k === 'heli') { g.fillStyle = '#ffd23c'; g.beginPath(); g.arc(0, 4 * s, 11 * s, Math.PI, 0); g.fill(); g.fillStyle = '#4aa8ff'; g.fillRect(-1.5 * s, -10 * s, 3 * s, 8 * s); const a = it.t * 20; g.fillStyle = '#ff5a5a'; g.beginPath(); g.ellipse(Math.cos(a) * 9 * s, -10 * s, Math.abs(Math.cos(a)) * 12 * s + 2, 2.4 * s, 0, 0, 7); g.fill(); }
    else if (it.k === 'shield') { g.strokeStyle = '#6fc3ff'; g.lineWidth = 3 * s; g.beginPath(); g.arc(0, 0, 13 * s, 0, 7); g.stroke(); g.fillStyle = 'rgba(160,220,255,.45)'; g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-4 * s, -5 * s, 3 * s, 2 * s, -0.5, 0, 7); g.fill(); }
    else if (it.k === 'magnet') { g.rotate(Math.sin(it.t * 3) * 0.2); g.lineWidth = 6 * s; g.strokeStyle = '#ff4d4d'; g.beginPath(); g.arc(0, -2 * s, 9 * s, Math.PI, 0); g.stroke(); g.fillStyle = '#d9dee6'; g.fillRect(-12 * s, -3 * s, 6 * s, 9 * s); g.fillRect(6 * s, -3 * s, 6 * s, 9 * s); }
    g.restore();
  }
  function drawEnemy(e) {
    const sx = X(e.x), sy = Y(e.y), s = V.S; g.save(); g.translate(sx, sy); if (e.dead) { g.rotate(e.dead * 6); g.globalAlpha = Math.max(0, 1 - e.dead / 2); }
    const flap = Math.sin(e.t * 18);
    if (e.k === 'abeja') { g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-4 * s, -11 * s, 7 * s, (4 + flap * 2) * s, -0.4, 0, 7); g.ellipse(5 * s, -11 * s, 7 * s, (4 - flap * 2) * s, 0.4, 0, 7); g.fill(); g.fillStyle = '#ffd23c'; g.beginPath(); g.ellipse(0, 0, 15 * s, 11 * s, 0, 0, 7); g.fill(); g.fillStyle = '#3a2a12'; g.fillRect(-4 * s, -10 * s, 4 * s, 20 * s); g.fillRect(5 * s, -9 * s, 4 * s, 18 * s); g.beginPath(); g.moveTo(-15 * s, 0); g.lineTo(-21 * s, 2 * s); g.lineTo(-14 * s, 4 * s); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(10 * s, -3 * s, 3 * s, 0, 7); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(11 * s, -3 * s, 1.5 * s, 0, 7); g.fill(); }
    else if (e.k === 'pajaro') { g.scale(e.dir, 1); g.fillStyle = '#4a6fd6'; g.beginPath(); g.ellipse(0, 0, 15 * s, 11 * s, 0, 0, 7); g.fill(); g.fillStyle = '#6f8ff0'; g.beginPath(); g.moveTo(-4 * s, -2 * s); g.quadraticCurveTo(-8 * s, (-16 - flap * 8) * s, 6 * s, -4 * s); g.fill(); g.fillStyle = '#ffb703'; g.beginPath(); g.moveTo(14 * s, -2 * s); g.lineTo(22 * s, 1 * s); g.lineTo(14 * s, 4 * s); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(8 * s, -4 * s, 3.4 * s, 0, 7); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(9 * s, -4 * s, 1.7 * s, 0, 7); g.fill(); g.strokeStyle = '#000'; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(4 * s, -9 * s); g.lineTo(11 * s, -7 * s); g.stroke(); }
    else if (e.k === 'murcielago') { g.fillStyle = '#3b2a5c'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-14 * s, (-10 - flap * 8) * s, -26 * s, (flap * 4) * s); g.quadraticCurveTo(-16 * s, 2 * s, 0, 6 * s); g.quadraticCurveTo(16 * s, 2 * s, 26 * s, (flap * 4) * s); g.quadraticCurveTo(14 * s, (-10 - flap * 8) * s, 0, 0); g.fill(); g.beginPath(); g.arc(0, 2 * s, 9 * s, 0, 7); g.fill(); g.fillStyle = '#ff5a5a'; g.beginPath(); g.arc(-3 * s, 0, 1.8 * s, 0, 7); g.arc(3 * s, 0, 1.8 * s, 0, 7); g.fill(); }
    else if (e.k === 'ovni') { g.fillStyle = 'rgba(140,255,200,.25)'; g.beginPath(); g.moveTo(-8 * s, 4 * s); g.lineTo(8 * s, 4 * s); g.lineTo(16 * s, 30 * s); g.lineTo(-16 * s, 30 * s); g.fill(); g.fillStyle = '#9fe6ff'; g.beginPath(); g.ellipse(0, -6 * s, 10 * s, 9 * s, 0, Math.PI, 0); g.fill(); g.fillStyle = '#9aa4b2'; g.beginPath(); g.ellipse(0, 0, 22 * s, 7 * s, 0, 0, 7); g.fill(); for (let i = -2; i <= 2; i++) { g.fillStyle = (Math.floor(e.t * 6) + i) % 2 ? '#ffd23c' : '#ff5a5a'; g.beginPath(); g.arc(i * 8 * s, 1 * s, 2 * s, 0, 7); g.fill(); } g.fillStyle = '#6fd36f'; g.beginPath(); g.arc(0, -8 * s, 4 * s, 0, 7); g.fill(); }
    else if (e.k === 'medusa') { g.fillStyle = 'rgba(255,140,220,.85)'; g.beginPath(); g.arc(0, 0, 14 * s, Math.PI, 0); g.quadraticCurveTo(7 * s, 4 * s, 0, 2 * s); g.quadraticCurveTo(-7 * s, 4 * s, -14 * s, 0); g.fill(); g.strokeStyle = 'rgba(255,170,230,.8)'; g.lineWidth = 2 * s; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 5 * s, 2 * s); g.quadraticCurveTo((i * 5 + Math.sin(e.t * 4 + i) * 5) * s, 12 * s, i * 5 * s, 22 * s); g.stroke(); } g.fillStyle = '#fff'; g.beginPath(); g.arc(-4 * s, -4 * s, 2.4 * s, 0, 7); g.arc(4 * s, -4 * s, 2.4 * s, 0, 7); g.fill(); }
    g.restore();
  }
  function drawPlayer() {
    const p = st.p, sx = X(p.x), sy = Y(p.y + R), s = V.S;
    if (st.mag > 0) { g.strokeStyle = `rgba(255,90,90,${0.18 + 0.1 * Math.sin(st.t * 8)})`; g.lineWidth = 2; g.beginPath(); g.arc(sx, sy, (150 + UPL.magnet * 30) * s, 0, 7); g.stroke(); }
    g.save(); g.translate(sx, sy); if (p.spin) g.rotate(p.spin * Math.PI * 2 * (st.state === 'dying' ? 1.5 : 1));
    if (st.power && st.power.k === 'rocket') { g.save(); g.translate(-R * 0.9 * s, R * 0.1 * s); g.fillStyle = '#e8edf5'; g.beginPath(); g.ellipse(0, 0, 7 * s, 16 * s, 0, 0, 7); g.fill(); g.fillStyle = '#ff5a5a'; g.beginPath(); g.moveTo(-7 * s, -6 * s); g.quadraticCurveTo(0, -24 * s, 7 * s, -6 * s); g.fill(); const fl = 1 + Math.sin(st.t * 40) * 0.25; g.fillStyle = '#ffd23c'; g.beginPath(); g.moveTo(-5 * s, 14 * s); g.quadraticCurveTo(0, 34 * s * fl, 5 * s, 14 * s); g.fill(); g.restore(); }
    scDrawChar(g, 0, 0, R * s, skin, { sx: p.sx, sy: p.sy, blink: p.blink > 0, face: p.face, up: p.vy > 300, scared: st.state === 'dying' });
    if (st.power && st.power.k === 'heli') { const a = st.t * 30; g.fillStyle = '#ffd23c'; g.beginPath(); g.arc(0, -R * 0.8 * s, 9 * s, Math.PI, 0); g.fill(); g.fillStyle = '#ff5a5a'; g.beginPath(); g.ellipse(0, -R * 1.25 * s, Math.abs(Math.cos(a)) * 22 * s + 2, 3 * s, 0, 0, 7); g.fill(); }
    if (st.shield > 0) { const k = st.shieldT < 0.3 ? st.shieldT / 0.3 : 1; g.strokeStyle = `rgba(120,200,255,${0.75 * k})`; g.lineWidth = 3; g.fillStyle = `rgba(160,220,255,${0.18 * k})`; g.beginPath(); g.arc(0, 0, (R + 10 + Math.sin(st.t * 4) * 1.5) * s, 0, 7); g.fill(); g.stroke(); if (st.shield > 1) { g.beginPath(); g.arc(0, 0, (R + 16) * s, 0, 7); g.stroke(); } }
    g.restore();
  }
  function draw() {
    const W = V.w, H = V.h; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
    const sh = st.shake > 0 ? st.shake * 10 : 0; if (sh) g.translate((rnd() - 0.5) * sh, (rnd() - 0.5) * sh);
    // cielo: mezcla suave al acercarse al siguiente mundo
    const wf = (st.cam + V.VH * 0.5) / SC_WORLD, wi = Math.floor(wf), fr = wf - wi, bl = scClamp((fr - 0.9) / 0.1, 0, 1);
    const A = SC_WORLDS[wi % 6], B = SC_WORLDS[(wi + 1) % 6];
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, mix(A.sky[0], B.sky[0], bl)); gr.addColorStop(0.55, mix(A.sky[1], B.sky[1], bl)); gr.addColorStop(1, mix(A.sky[2], B.sky[2], bl));
    g.fillStyle = gr; g.fillRect(-20, -20, W + 40, H + 40);
    drawDeco(A.deco, 1 - bl, W, H); if (bl > 0) drawDeco(B.deco, bl, W, H);
    if (V.ox > 2) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(V.ox - 2, 0, 2, H); g.fillRect(V.ox + SC_BW * V.S, 0, 2, H); }
    // plataformas
    for (const pl of st.plats) {
      const sy = Y(pl.y); if (sy < -40 || sy > H + 40) continue;
      const pwi = scWorldAt(pl.y) % 6; const spr = platSprite(pwi, pl.type, pl.w); const w = spr.width / V.dpr, h = spr.height / V.dpr;
      let a = 1; if (pl.type === 'b') { const ph = (pl.t + pl.bt) % 3.2; a = ph < 2.0 ? 1 : ph < 2.3 ? 0.5 + 0.5 * Math.sin(ph * 40) : 0.15; }
      if (pl.dead) { a = Math.max(0, 1 - pl.dead); g.globalAlpha = a; g.drawImage(spr, 0, 0, spr.width / 2, spr.height, X(pl.x) - w / 2 - pl.dead * 12, sy - 16 * V.S + pl.dead * 30, w / 2, h); g.drawImage(spr, spr.width / 2, 0, spr.width / 2, spr.height, X(pl.x) + pl.dead * 12, sy - 16 * V.S + pl.dead * 34, w / 2, h); g.globalAlpha = 1; continue; }
      g.globalAlpha = a; g.drawImage(spr, X(pl.x) - w / 2, sy - 16 * V.S, w, h); g.globalAlpha = 1;
    }
    for (const it of st.items) { if (it.free && it.used) continue; drawItem(it); }
    const s1 = starSprite(0), s2 = starSprite(1);
    for (const s of st.stars) { const sy = Y(s.y); if (sy < -30 || sy > H + 30) continue; const sp = s.big ? s2 : s1, w = sp.width / V.dpr; const k = s.got ? 1 + s.got : 1 + Math.sin(s.t * 4) * 0.06; g.globalAlpha = s.got ? Math.max(0, 1 - s.got) : 1; const sw = Math.abs(Math.cos(s.t * 2)) * 0.6 + 0.4; g.drawImage(sp, X(s.x) - w * k * sw / 2, sy - w * k / 2 - (s.got ? s.got * 20 : 0), w * k * sw, w * k); }
    g.globalAlpha = 1;
    for (const e of st.enemies) drawEnemy(e);
    for (const m of st.meteors) {
      if (m.warn > 0) { if (Math.floor(m.warn * 8) % 2) { g.fillStyle = 'rgba(255,80,60,.9)'; g.font = `900 ${Math.round(28 * V.S)}px system-ui,sans-serif`; g.textAlign = 'center'; g.fillText('!', X(m.x), V.safe + 90); } continue; }
      const sx = X(m.x), sy = Y(m.y); g.fillStyle = '#7a5a4a'; g.beginPath(); g.arc(sx, sy, 13 * V.S, 0, 7); g.fill(); g.fillStyle = '#9a7a68'; g.beginPath(); g.arc(sx - 4 * V.S, sy - 3 * V.S, 4 * V.S, 0, 7); g.fill();
    }
    drawPlayer();
    for (const q of st.parts) { g.globalAlpha = Math.max(0, 1 - q.t / q.l); if (q.spr) { g.save(); g.translate(X(q.x), Y(q.y)); g.rotate(q.t * 6); g.fillStyle = '#c8d0dc'; g.fillRect(-5 * V.S, -12 * V.S, 10 * V.S, 24 * V.S); g.restore(); continue; } g.fillStyle = q.c; g.fillRect(X(q.x) - q.r, Y(q.y) - q.r, q.r * 2, q.r * 2); }
    g.globalAlpha = 1;
    g.textAlign = 'center'; g.lineJoin = 'round';
    for (const f of st.floats) { g.globalAlpha = Math.max(0, 1 - f.t / 1.1); g.font = `900 ${Math.round(20 * V.S)}px system-ui,sans-serif`; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,.35)'; const yy = Y(f.y) - f.t * 40; g.strokeText(f.text, X(f.x), yy); g.fillStyle = f.c; g.fillText(f.text, X(f.x), yy); }
    g.globalAlpha = 1;
    // HUD
    const top = V.safe + 14, m = Math.floor(st.maxY / 40);
    g.font = `900 ${Math.round(38 * Math.min(1.2, V.S))}px system-ui,sans-serif`; g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.3)'; g.strokeText(`${m} m`, W / 2, top + 34); g.fillStyle = '#fff'; g.fillText(`${m} m`, W / 2, top + 34);
    g.font = `700 ${Math.round(13 * Math.min(1.2, V.S))}px system-ui,sans-serif`; g.lineWidth = 4; const bt = `Récord ${Math.max(D.best, m)} m`; g.strokeText(bt, W / 2, top + 54); g.fillStyle = 'rgba(255,255,255,.95)'; g.fillText(bt, W / 2, top + 54);
    const ss = s1.width / V.dpr; g.drawImage(s1, 14, top + 52, ss * 0.9, ss * 0.9); g.textAlign = 'left'; g.font = `800 ${Math.round(20 * Math.min(1.2, V.S))}px system-ui,sans-serif`; g.strokeText(String(st.stars_n), 14 + ss, top + 52 + ss * 0.6); g.fillStyle = '#fff'; g.fillText(String(st.stars_n), 14 + ss, top + 52 + ss * 0.6);
    if (st.power) { const k = scClamp(st.power.t / st.power.T, 0, 1); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(W / 2 - 60, top + 62, 120, 6); g.fillStyle = st.power.k === 'rocket' ? '#ff9a3c' : '#ffd23c'; g.fillRect(W / 2 - 60, top + 62, 120 * k, 6); }
    if (st.mag > 0) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(W / 2 - 60, top + 72, 120, 4); g.fillStyle = '#ff5a5a'; g.fillRect(W / 2 - 60, top + 72, 120 * scClamp(st.mag / (7 + UPL.magnet * 1.4), 0, 1), 4); }
    if (st.banner) { const k = st.banner.t, a = k < 0.3 ? k / 0.3 : k > 2.3 ? Math.max(0, (2.8 - k) / 0.5) : 1; g.globalAlpha = a; g.textAlign = 'center'; g.font = `900 ${Math.round(34 * Math.min(1.2, V.S))}px system-ui,sans-serif`; g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,.35)'; const ty = H * 0.32 + (1 - a) * 14; g.strokeText(st.banner.name, W / 2, ty); g.fillStyle = '#fff'; g.fillText(st.banner.name, W / 2, ty); g.font = `700 ${Math.round(15 * Math.min(1.2, V.S))}px system-ui,sans-serif`; g.lineWidth = 4; g.strokeText(st.banner.sub, W / 2, ty + 26); g.fillStyle = '#fff6c8'; g.fillText(st.banner.sub, W / 2, ty + 26); g.globalAlpha = 1; }
    if (st.flash > 0) { g.fillStyle = `rgba(255,255,255,${st.flash * 0.5})`; g.fillRect(0, 0, W, H); }
  }

  /* --- fin de partida --- */
  function finish() {
    if (st.state === 'over') return; st.state = 'over'; scRocketSound(false);
    const m = Math.floor(st.maxY / 40), secs = Math.max(1, Math.round((Date.now() - st.t0) / 1000));
    const d = scData(); d.games++; d.w += st.stars_n;
    d.st.star = (d.st.star || 0) + st.stars_n; d.st.stomp = (d.st.stomp || 0) + st.stomps;
    const newBest = m > d.best; if (newBest) d.best = m;
    // misiones
    const done = [];
    for (const ms of d.ms) {
      const before = ms.prog;
      if (ms.k === 'm') ms.prog = Math.max(ms.prog, m);
      else if (ms.k === 'world') ms.prog = Math.max(ms.prog, scWorldAt(st.maxY));
      else if (ms.k === 'star') ms.prog += st.stars_n; else if (ms.k === 'stomp') ms.prog += st.stomps; else if (ms.k === 'rocket') ms.prog += st.rockets; else if (ms.k === 'spring') ms.prog += st.springs; else if (ms.k === 'games') ms.prog += 1; else if (ms.k === 'break') ms.prog += st.breaks;
      if (before < ms.goal && ms.prog >= ms.goal) done.push(scMText(ms));
    }
    const coins = Math.min(SC_COIN_CAP, Math.floor(st.stars_n / 10)); jgCoins(coins);
    jpSave();
    $w('#scTitle').textContent = newBest && m > 0 ? '¡Nuevo récord!' : m >= 500 ? '¡Qué altura!' : '¡Buen salto!';
    $w('#scFin').textContent = `${m} m · ${SC_WORLDS[scWorldAt(st.maxY) % 6].n}`;
    $w('#scGain').textContent = `+${st.stars_n} estrellas${coins ? ` · +${coins} monedas para tu árbol` : ''}`;
    $w('#scMs').textContent = done.length ? `Misión cumplida: ${done.join(' · ')} (cóbrala en Misiones)` : '';
    $w('#scRank').textContent = '';
    if (newBest && m > 0) SC_SFX.record();
    const ov = $w('#scOver'); ov.hidden = false; ov.classList.add('show');
    if (m > 0) jgPost({ game: 'cielo', score: m, apples: 0, dur: secs }).then((rec) => { const l = $w('#scRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Lugar #${rec.rankDay} de hoy`; });
  }
  function again() { $w('#scOver').hidden = true; st = fresh(); st.plats.push({ x: SC_BW / 2, y: 40, w: 140, type: 'n', x0: SC_BW / 2, y0: 40, t: 0, sp: 0, amp: 0, dead: 0, used: 0, bt: 0 }); gen(1400); st.last = performance.now(); scAudio(); }
  let paused = false;
  function togglePause(force) {
    if (st.state !== 'run' && !paused) return;
    paused = force === true ? true : !paused;
    const pv = $w('#scPause'); pv.hidden = !paused; if (paused) pv.classList.add('show');
    $w('#scMus').textContent = `Música: ${SCS.music ? 'sí' : 'no'}`;
    if (paused) scRocketSound(false); else { st.last = performance.now(); if (st.power && st.power.k === 'rocket') scRocketSound(true); }
  }

  /* --- bucle --- */
  const loop = (now) => {
    st.id = requestAnimationFrame(loop);
    if (paused) return;
    const dt = Math.min(0.04, Math.max(0, (now - st.last) / 1000)); st.last = now;
    step(dt); draw(); scMusic(st.wi, st.state === 'run');
  };
  st.id = requestAnimationFrame(loop);
  SC.run = { exit: () => exit(), st: () => st };
  const exit = () => {
    cancelAnimationFrame(st.id); scRocketSound(false);
    removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('resize', size); removeEventListener('deviceorientation', onTilt); document.removeEventListener('visibilitychange', onVis);
    if (st.state === 'run' || st.state === 'dying') { const d = scData(); d.w += st.stars_n; jgCoins(Math.min(SC_COIN_CAP, Math.floor(st.stars_n / 10))); jpSave(); }
    wrap.remove(); document.body.classList.remove('gm-on'); SC.run = null;
    if (location.hash === '#/cielo') render();
  };
  $w('#scX').addEventListener('click', () => exit());
  $w('#scP').addEventListener('click', () => togglePause());
  $w('#scGo').addEventListener('click', () => togglePause(false));
  $w('#scQuit').addEventListener('click', () => exit());
  $w('#scMus').addEventListener('click', () => { SCS.music = !SCS.music; $w('#scMus').textContent = `Música: ${SCS.music ? 'sí' : 'no'}`; });
  $w('#scAgain').addEventListener('click', () => again());
  $w('#scDone').addEventListener('click', () => exit());
  // pequeño fix para la re-entrada: st cambia de objeto, la cámara toma el nuevo
  void Y;
}

EXTRA_VIEWS.cielo = viewCielo; EXTRA_NAV.cielo = 'juegos';
{
  const baseJuegos = viewJuegos;
  viewJuegos = function () { return baseJuegos().replace('<ul class="rows" style="margin-top:18px">', `<ul class="rows" style="margin-top:18px"><li><a href="#/cielo"><span class="ico">${icon('play')}</span><span class="txt"><b>Salto al Cielo <em class="sc-new">Nuevo</em></b><span>Rebota de nube en nube por seis mundos, con cohetes, hélices, misiones y tienda.</span></span>${icon('chev', 'chev')}</a></li>`); };
  EXTRA_VIEWS.juegos = viewJuegos;
}
