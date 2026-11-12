/* Cinnavia 7.53 — MUNDOS · simulación: mundo, clima, inteligencia, crías, nidos y catástrofes. */
'use strict';
const MDS = { w: null, def: null, an: [], fl: [], nests: [], rafts: [], parts: [], dang: [], ev: [], log: [], t: 0, uid: 0, flood: 0, shake: 0, flash: 0, speed: 1, ov: { time: null, weather: null }, grid: new Map(), init: {}, stat: { born: 0, eaten: 0, lost: 0 } };
const MD_NAMES = ['Lola', 'Pipo', 'Nube', 'Tito', 'Mora', 'Bruno', 'Kiwi', 'Canela', 'Rocky', 'Luna', 'Max', 'Pelusa', 'Coco', 'Olivia', 'Toby', 'Mango', 'Estrella', 'Panchito', 'Dulce', 'Rayo', 'Sol', 'Trufa', 'Churro', 'Bola', 'Nacho', 'Fresa', 'Pepa', 'Chispa', 'Gordi', 'Lila', 'Bimbo', 'Perla', 'Ñoño', 'Maya', 'Tomás', 'Bombón', 'Moka', 'Chato', 'Nina', 'Zafiro', 'Cometa', 'Pico', 'Tula', 'Memo', 'Kira', 'Paco', 'Yuyo', 'Rosita', 'Duque', 'Pecas'];
const MD_ARB = new Set(['mono', 'perezoso', 'koala', 'ardilla']);
const MD_NOFLY = new Set(['pinguino', 'avestruz', 'gallina']);
const MD_STATE = { idle: 'Mirando el paisaje', wander: 'Paseando', graze: 'Comiendo pasto y hojas', browse: 'Comiendo algas y plantas', plank: 'Filtrando plancton', fruit: 'Comiendo frutas', drink: 'Bebiendo agua', flee: 'Huyendo asustado', hunt: 'Cazando', eat: 'Comiendo su presa', rest: 'Descansando', sleep: 'Durmiendo', shelter: 'Refugiándose del mal clima', raft: 'Subido a una balsa', fly: 'Volando', perch: 'Posado, mirando el mundo', brood: 'Calentando sus huevos', nestbuild: 'Construyendo su nido', feed: 'Cuidando a sus crías', follow: 'Siguiendo a su mamá', climb: 'Trepando al árbol', canopy: 'Descansando entre las ramas', swing: 'Columpiándose entre árboles', swim: 'Nadando tranquilo', school: 'Nadando en grupo', dizzy: 'Mareado', flung: 'Girando en el tornado', panic: 'Asustado por el temblor', chat: 'Platicando con su grupo', mate: 'Buscando pareja', nest: 'Quedándose en el nido', dead: 'Fuera de combate', lava: 'Huyendo de la lava', fire: 'Huyendo del fuego', play: 'Jugando', swimland: 'Nadando para salvarse' };
const MD_CATS = { rayo: ['Tormenta de rayos', 'Los animales buscan refugio y un rayo puede quemar un árbol o aturdir peces.'], inund: ['Inundación', 'El agua sube; todos se agrupan y suben a las balsas.'], tornado: ['Tornado', 'Levanta a los animales del suelo y los lanza lejos.'], temblor: ['Terremoto', 'La tierra se mueve y todos se asustan.'], incendio: ['Incendio', 'El fuego se propaga entre los árboles.'], ventisca: ['Ventisca', 'Nieve y viento fuerte; todos buscan abrigo.'], erupcion: ['Erupción', 'Lluvia de lava y ceniza desde el volcán.'] };
const mdR = Math.random, mdRI = (a, b) => Math.floor(a + mdR() * (b - a + 1)), mdPick = (arr) => arr[Math.floor(mdR() * arr.length)];
function mdLog(txt) { MDS.log.unshift({ txt, t: MDS.t }); if (MDS.log.length > 40) MDS.log.pop(); MDS.logDirty = true; }

/* ---------- mundo ---------- */
const mdAmp = { alps: 1.9, canyon: 1.5, volcano: 1.5, dunes: 1.2, ice: 0.9, savanna: 0.8, coast: 0.7, jungle: 1, swamp: 0.5, farm: 0.5, fuji: 1, bamboo: 1, hills: 1 };
const mdH = { bush: [34, 52], flower: [22, 34], tuft: [16, 26], fern: [30, 48], reed: [40, 70], mush: [22, 34], rock: [26, 60], cactus: [50, 100], dune: [40, 70], hay: [26, 34], barn: [100, 130], igloo: [50, 70], iceberg: [60, 140], crystal: [40, 80], seagrass: [30, 60], kelp: [100, 220], coral: [30, 60], anemone: [20, 34], tube: [24, 40], bamboo: [150, 220] };
const mdFruity = new Set(['oak', 'jungle', 'palm', 'maple', 'bush', 'sakura']);
function mdHashStr(s) { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function mdGY(x) { const g = MDS.GY, i = mdCl(x / 8, 0, g.length - 1.001), k = Math.floor(i), f = i - k; return g[k] + (g[k + 1] - g[k]) * f; }
const mdDepth = (x) => mdGY(x) - MDS.surf();
const MD_SEAFLOOR = { abismo: 2350, pacifico: 1750, atlantico: 1650, indico: 1500, artico: 1150, algas: 820, arrecife: 640 };
function mdZoneY(S, x) { const top = MDS.surf() + 16 + (S.z > 3 ? 20 : 0), bot = Math.max(top + 4, mdGY(x) - 14); if (!MDS.sea) return [top, bot]; const z = S.dz || 'mid'; if (z === 'surf') return [top, Math.max(top + 4, Math.min(bot, MDS.S + 420))]; if (z === 'deep') { const lo = Math.min(Math.max(top, MDS.S + 950), bot - 60); return [Math.max(top, lo), bot]; } return [top, Math.max(top + 4, Math.min(bot, MDS.S + 950))]; }
function mdBuild(def) {
  const S0 = MDS; S0.def = def; const sea = def.mode === 'sea'; const WW = sea ? 15000 : 18000; S0.WW = WW; S0.sea = sea; S0.S = sea ? 150 : 556; S0.surf = () => S0.S - S0.flood;
  const rnd = mdRng(mdHashStr(def.id)), N = Math.ceil(WW / 8) + 2, GY = new Float32Array(N), amp = mdAmp[def.far] || 1, s1 = rnd() * 6, s2 = rnd() * 6;
  const kx = WW / 9600, bodies = def.waters.map((w) => ({ t: w[0], x0: w[1] * kx, x1: Math.min(WW + 200, w[2] * kx), d: { lake: 125, pond: 75, river: 70, sea: 170 }[w[0]] || 100, e: w[0] === 'river' ? 90 : 150 }));
  for (let i = 0; i < N; i++) {
    const x = i * 8; let y;
    if (sea) { const base = MD_SEAFLOOR[def.id] || 1400, var_ = base > 1000 ? 1 : 0.25; y = base + var_ * (150 * Math.sin(x / 1700 + s1) + 60 * Math.sin(x / 430 + s2) - 220 * Math.pow(Math.max(0, Math.sin(x / 2600 + s1 * 2)), 6)) + 10 * Math.sin(x / 120 + s2); if (x < 500) y = mdLerp(S0.S + 120, y, mdSmooth(x / 500)); if (x > WW - 500) y = mdLerp(S0.S + 120, y, mdSmooth((WW - x) / 500)); }
    else { y = S0.S - 16 - amp * (14 + 26 * (0.5 + 0.5 * Math.sin(x / 830 + s1)) + 16 * (0.5 + 0.5 * Math.sin(x / 290 + s2)));
      let p = 0; for (const b of bodies) { const t = Math.min((x - b.x0) / b.e, (b.x1 - x) / b.e); p = Math.max(p, mdSmooth(t + 0.2)); }
      if (p > 0) { const dd = Math.max(...bodies.map((b) => (x >= b.x0 - 40 && x <= b.x1 + 40 ? b.d : 0))); y = mdLerp(y, S0.S + dd * (0.85 + 0.15 * Math.sin(x / 90)), p); } }
    GY[i] = y;
  }
  S0.GY = GY; S0.maxFloor = Math.max(...GY); S0.an = []; S0.fl = []; S0.nests = []; S0.rafts = []; S0.parts = []; S0.dang = []; S0.ev = []; S0.log = []; S0.t = 0; S0.uid = 0; S0.flood = 0; S0.shake = 0; S0.flash = 0; S0.init = {}; S0.stat = { born: 0, eaten: 0, lost: 0, hatched: 0 }; S0.ov = { time: null, weather: null }; S0.speed = S0.speed || 1; S0.cd = {}; S0.strikeT = 3; S0.seed = rnd() * 100;
  /* aguas para colocar peces */
  S0.waterXs = []; for (let x = 20; x < WW; x += 16) if (mdDepth(x) > 40) S0.waterXs.push(x);
  /* flora */
  for (const [kind, dens, mn, mx] of def.flora) {
    const hh = mdH[kind] || [150, 250], lo = mn || hh[0], hi = mx || hh[1], under = MD_UNDER.has(kind), n = Math.round(dens * WW / (MD_TREES.has(kind) ? 250 : kind === 'flower' || kind === 'tuft' ? 110 : kind === 'rock' ? 400 : under ? 130 : 200));
    for (let i = 0; i < n; i++) {
      let x = 30 + rnd() * (WW - 60), ok = false;
      for (let tr = 0; tr < 12 && !ok; tr++) { x = 30 + rnd() * (WW - 60); const d = mdDepth(x); ok = under ? d > 20 : kind === 'iceberg' ? (sea || d > 60) : kind === 'reed' || kind === 'mangrove' ? d < 18 && d > -50 : d < -10; if (kind === 'iceberg' && !sea) ok = d > 60; }
      if (!ok) continue; const y = kind === 'iceberg' ? S0.S + 4 : mdGY(x);
      S0.fl.push({ id: ++S0.uid, kind, x, y: y + (MD_TREES.has(kind) || under || kind === 'iceberg' || kind === 'barn' || kind === 'igloo' || kind === 'dune' || kind === 'cactus' ? 0 : rnd() * 30), h: lo + rnd() * (hi - lo), seed: 1 + Math.floor(rnd() * 999), fruit: mdFruity.has(kind) && rnd() < 0.55, fruitT: 0, burn: 0, burnt: false, dir: rnd() < 0.5 ? -1 : 1, under, regrow: 0 });
    }
  }
  S0.fl.sort((a, b) => a.x - b.x); S0.trees = S0.fl.filter((f) => MD_TREES.has(f.kind));
  /* animales */
  S0.cap = Math.round(S0.WW / (S0.sea ? 28 : 40)); const POP = S0.pop || 1.7;
  for (const [key, n] of def.sp) { const S = MD_SP[key]; if (!S) continue; const cnt = Math.max(2, Math.round(n * POP)); S0.init[key] = cnt; let left = cnt; const grp = Math.max(1, Math.min(S.g || 1, 6)); let guard = 0;
    while (left > 0 && guard++ < 200) { const k = Math.min(left, 1 + mdRI(0, grp - 1)), cx = mdSpawnX(key); if (cx == null) break; for (let i = 0; i < k; i++) { const a = mdNew(key, mdCl(cx + (mdR() - 0.5) * 150, 40, WW - 40)); if (a) { a.hunger = mdR() * 0.35; } } left -= k; } }
  /* sembrar algunos bebés y embarazos para que se vea vida desde el inicio */
  for (const a of S0.an) { if (mdR() < 0.05 && a.S.t !== 'b' && a.S.t !== 'f') { a.age = 0.35 + mdR() * 0.4; a.hunger = 0.2; } a.cd = mdR() * 60; }
  mdLog('El mundo despierta: ' + def.name + '.');
}
function mdLayer(key) {
  const S = MD_SP[key], sea = MDS.sea; if (S.t === 'b') return MD_NOFLY.has(key) ? 'land' : 'air';
  if (S.t === 'f') return S.sh === 'star' || S.sh === 'crab' ? 'floor' : 'water';
  if (sea && (S.sh === 'seal' || S.sh === 'otter')) return 'water'; if (sea && S.sh === 'crab') return 'floor'; return 'land';
}
function mdSpawnX(key) {
  const S = MD_SP[key], L = mdLayer(key), WW = MDS.WW;
  if (L === 'water' || L === 'floor') { if (MDS.sea) return 60 + mdR() * (WW - 120); const w = MDS.waterXs; if (!w.length) return null; return mdPick(w); }
  if (S.h === 'M' && !MDS.sea) { const w = MDS.waterXs; if (w.length) { for (let i = 0; i < 20; i++) { const x = mdPick(w) + (mdR() - 0.5) * 500; if (x > 40 && x < WW - 40 && mdDepth(x) < 0) return x; } } }
  for (let i = 0; i < 30; i++) { const x = 60 + mdR() * (WW - 120); if (MDS.sea || mdDepth(x) < -12) return x; } return 60 + mdR() * (WW - 120);
}
function mdNew(key, x, o) {
  const S = MD_SP[key]; if (!S) return null; const L = mdLayer(key), a = { id: ++MDS.uid, sp: key, S, layer: L, x, y: 0, vx: 0, vy: 0, dir: mdR() < 0.5 ? -1 : 1, ph: mdR() * 6, age: 1, male: mdR() < 0.5, hunger: mdR() * 0.4, energy: 0.6 + mdR() * 0.4, state: 'idle', timer: mdR() * 3, think: mdR() * 0.4, tx: x, ty: 0, lane: mdR() * 30, name: mdPick(MD_NAMES), born: MDS.t, kids: 0, kills: 0, dist: 0, eaten: 0, cd: 20 + mdR() * 60, preg: 0, flying: L === 'air', moving: false, running: false, blink: 0, say: null, tree: null, up: 0, mom: 0, stun: 0, fear: 0, tgt: 0, hop: 0, mood: 0.7 + mdR() * 0.3 };
  a.arb = MD_ARB.has(key) || !!S.arb; if (o) Object.assign(a, o);
  if (L === 'air') { a.y = MDS.S - 160 - mdR() * 200; a.ty = a.y; } else if (L === 'water') { const zz = mdZoneY(S, x); a.y = zz[0] + mdR() * (zz[1] - zz[0]); a.ty = a.y; } else if (L === 'floor') { a.y = mdGY(x) - 3; } else a.y = mdGY(x);
  if (L === 'land' && S.h !== 'M' && !MDS.sea && mdDepth(x) > 5) a.x = x = mdSpawnX(key) || x;
  a.col = null; if (S.var) a.col = mdPick(S.var);
  MDS.an.push(a); return a;
}
const mdCount = (sp) => { let n = 0; for (const a of MDS.an) if (a.sp === sp && !a.dead) n++; return n; };

/* ---------- ambiente ---------- */
function mdEnv() {
  const W = MDS.def, cl = W.clim, now = Date.now() / 1000, t = now + MDS.seed * 50, sd = MDS.seed;
  let p = (now % 480) / 480; if (MDS.ov.time != null) p = MDS.ov.time;
  const sunAlt = -Math.cos(p * mdTau), night = mdSmooth(mdCl((0.12 - sunAlt) / 0.55, 0, 1));
  const w1 = (Math.sin(t / 131 + sd) + 0.6 * Math.sin(t / 53 + sd * 2) + 0.4 * Math.sin(t / 311 + sd * 3) + 2) / 4;
  let rain = mdCl((w1 - (1 - cl.wd * 0.6)) / 0.22, 0, 1), thunder = mdCl((rain - 0.45) * 2.2, 0, 1) * mdCl(cl.st * 1.8, 0, 1) * (Math.sin(t / 77 + sd * 4) > -0.2 ? 1 : 0.3);
  let fog = cl.fg * mdCl((Math.sin(t / 97 + sd * 5) + 0.3) * 0.8, 0, 1) * (1 - rain * 0.5) * (0.5 + night * 0.5);
  let wind = mdCl(cl.w * (0.6 + 0.4 * Math.sin(t / 41 + sd)) + rain * 0.2, 0, 1), cloud = mdCl(Math.max(rain, w1 * 0.7), 0, 1);
  let snow = cl.t < 0.3 ? 1 : cl.t < 0.45 && night > 0.5 ? 0.5 : 0;
  const ow = MDS.ov.weather; let aurora = cl.au && night > 0.5 && cl.t < 0.4 ? mdCl((Math.sin(t / 60) + 1) * 0.5, 0, 1) * night : 0;
  if (ow === 'clear') { rain = 0; thunder = 0; fog = 0; cloud = 0.1; snow = 0; } else if (ow === 'rain') { rain = 0.8; cloud = 0.9; thunder = 0; } else if (ow === 'storm') { rain = 1; thunder = 1; cloud = 1; wind = Math.max(wind, 0.7); } else if (ow === 'fog') { fog = 0.9; rain = 0; } else if (ow === 'snow') { rain = 0.8; snow = 1; thunder = 0; cloud = 0.9; } else if (ow === 'aurora') { aurora = 0.9; if (night < 0.6) { rain = 0; cloud = 0.1; } }
  let ice = snow > 0.9 || ow === 'snow';
  const ev = { rayo: 0, ventisca: 0, erupcion: 0, tornado: 0 }; for (const e of MDS.ev) if (e.type in ev) ev[e.type] = e.f == null ? 1 : e.f;
  if (ev.rayo) { rain = Math.max(rain, 0.95); thunder = 1; cloud = 1; wind = Math.max(wind, 0.7); } if (ev.ventisca) { rain = 1; snow = 1; wind = 1; cloud = 1; ice = true; fog = Math.max(fog, 0.45); } if (ev.erupcion) { cloud = 1; }
  let rainbow = ow === 'rainbow' ? 1 : (rain > 0.04 && rain < 0.4 && sunAlt > 0.15 && thunder < 0.1 && !snow && !MDS.sea ? mdCl((0.4 - rain) * 3, 0, 1) * mdCl((sunAlt - 0.15) * 4, 0, 1) : 0); if (ow === 'rainbow') { rain = 0.15; cloud = 0.4; thunder = 0; }
  const gloom = mdCl(rain * 0.55 + thunder * 0.2 + ev.erupcion * 0.7 + (ev.ventisca ? 0.2 : 0), 0, 0.95);
  if (!MDS.stars) { MDS.stars = []; const r = mdRng(5); for (let i = 0; i < 90; i++) MDS.stars.push([r(), r(), r()]); MDS.clouds = []; for (let i = 0; i < 14; i++) MDS.clouds.push({ x: r(), y: 0.06 + r() * 0.28, r: 38 + r() * 56, s: 0.6 + r() * 0.8, z: 0.5 + r(), o: 0.6 + r() * 0.4 }); }
  const sea = MDS.sea;
  const E = { rainbow, p, sunAlt, night, rain: sea ? rain : rain, thunder, fog, wind, cloud, gloom, snow, ice, aurora, ash: ev.erupcion, stars: MDS.stars, clouds: MDS.clouds, storm: !!(ev.rayo || thunder > 0.6), blizzard: !!ev.ventisca, snowing: snow > 0.45 && rain > 0.15 };
  E.shelter = !!(E.storm || E.blizzard || ev.erupcion || (rain > 0.8 && !snow));
  MDS.E = E; return E;
}
function mdTimeName(E) { const a = E.sunAlt; if (a > 0.55) return 'Mediodía'; if (a > 0.1) return E.p < 0.5 ? 'Mañana' : 'Tarde'; if (a > -0.2) return E.p < 0.5 ? 'Amanecer' : 'Atardecer'; return 'Noche'; }
function mdWeatherName(E) { if (E.rainbow > 0.5) return 'Sol y lluvia: arcoíris'; if (MDS.ev.some((e) => e.type === 'erupcion')) return 'Erupción y ceniza'; if (E.blizzard) return 'Ventisca'; if (E.thunder > 0.6) return E.snowing ? 'Tormenta de nieve' : 'Tormenta eléctrica'; if (E.rain > 0.7) return E.snowing ? 'Nevada' : 'Lluvia'; if (E.rain > 0.25) return E.snowing ? 'Nieve ligera' : 'Llovizna'; if (E.fog > 0.4) return 'Niebla'; if (E.aurora > 0.3) return 'Aurora boreal'; if (E.rainbow > 0.5) return 'Sol y lluvia: arcoíris'; if (E.cloud > 0.6) return 'Nublado'; if (E.wind > 0.7) return 'Viento fuerte'; return 'Despejado'; }

/* ---------- vecinos ---------- */
function mdBuildGrid() { const g = new Map(); for (const a of MDS.an) { if (a.dead) continue; const k = Math.floor(a.x / 140); let arr = g.get(k); if (!arr) { arr = []; g.set(k, arr); } arr.push(a); } MDS.grid = g; }
function mdNear(x, r) { const out = [], g = MDS.grid, k0 = Math.floor((x - r) / 140), k1 = Math.floor((x + r) / 140); for (let k = k0; k <= k1; k++) { const arr = g.get(k); if (arr) for (const a of arr) if (Math.abs(a.x - x) <= r) out.push(a); } return out; }
const mdInW = (a) => a.layer === 'land' && mdDepth(a.x) > 24 && a.y >= MDS.surf() - 2;
function mdCanHunt(h, p) {
  if (!h.S.prey || !h.S.prey.includes(p.sp) || p.dead || p === h || p.inNest) return false;
  if (h.layer === 'air') { if (p.layer === 'air') return p.S.z < h.S.z * 0.7; if (p.layer === 'land') return !mdInW(p) && p.S.z <= h.S.z * 1.15 + 0.3; if (p.layer === 'water') return p.y < MDS.surf() + 50 && p.S.z <= 1.3; return false; }
  if (h.layer === 'land') { if (h.arb) return false; if (p.layer === 'land') return !mdInW(p) || h.S.h === 'M'; if (p.layer === 'water') return h.S.h === 'M' && mdInW(h) && p.y < MDS.surf() + 50; return p.layer === 'floor' && h.S.h === 'M'; }
  if (h.layer === 'water') return p.layer === 'water' || p.layer === 'floor' || (p.layer === 'land' && (mdInW(p) || MDS.sea)) || (p.layer === 'air' && p.y > MDS.surf() - 40);
  if (h.layer === 'floor') return p.layer === 'floor' || p.layer === 'water';
  return false;
}

/* ---------- peligros ---------- */
function mdDanger(a) { let best = null, bd = 1e9; for (const d of MDS.dang) { const dx = a.x - d.x; const dist = Math.abs(dx); if (dist < d.r && dist < bd) { if (a.layer === 'water' && !d.sky) continue; if (d.kind === 'flood') continue; bd = dist; best = d; } } return best; }

/* ---------- decidir ---------- */
function mdSay(a, txt) {  if (!a.say || a.say.t <= 0) a.say = { txt, t: 2.4 }; }
const MD_VOICE = { conejo: 'Ñam ñam', ardilla: 'Chii chii', venado: 'Brrr', oveja: '¡Beee!', vaca: '¡Muuu!', cerdo: '¡Oink!', gallina: '¡Pío pío!', pajaro: '¡Pío!', loro: '¡Hola, hola!', lobo: '¡Auuu!', perro: '¡Guau!', leon: '¡Grrr!', mono: '¡Uh uh ah!', rana: '¡Croac!', pato: '¡Cuac!', caballo: 'Iiiih', cabra: '¡Mee!', gato: 'Miau', elefante: 'Pruuum', buho: 'Uu uu', aguila: '¡Kiii!', pinguino: '¡Kuak!', delfin: 'Ii ii ii', ballena: 'Uuuuu', foca: '¡Auk auk!', tortuga: 'Hmm…', perezoso: 'Zzz… hola…', zorro: '¡Yip!', oso: 'Grrrmm', jirafa: 'Mmm', cebra: '¡Iji!' };
const MD_SAYS = { q: ['Mmm…', '¿Y la comida?', '¡Hola!', 'Qué rico día', 'Cerca de ti', 'Ay, qué sueño'], b: ['¡Pío!', '¡Tuiit!', 'Cuiii', '¡Hola, amigos!'], f: ['Blub', 'Blub blub', '¡Burbujas!'], x: ['Mmm…', '¡Hola!', 'Hola…'] };
function mdVoice(a) { return MD_VOICE[a.sp] || mdPick(MD_SAYS[a.S.t] || MD_SAYS.q); }

function mdSetState(a, st, t) { if (a.state !== st) { a.state = st; } a.timer = t == null ? 3 : t; }
function mdShelterFor(a) { let best = null, bd = 1e9; for (const f of MDS.fl) { if (f.under || f.burn > 0 || f.burnt || !MD_SHELTER.has(f.kind) || f.kind === 'cactus') continue; const d = Math.abs(f.x - a.x); if (d < bd && (a.layer !== 'air' || MD_TREES.has(f.kind))) { bd = d; best = f; } } return best; }
function mdNearestTree(x, maxD, fruitOnly) { let best = null, bd = maxD || 1e9; for (const f of MDS.trees) { if (f.burn > 0 || f.burnt) continue; if (fruitOnly && !f.fruit) continue; const d = Math.abs(f.x - x); if (d < bd) { bd = d; best = f; } } return best; }
function mdHerdCenter(a, r) { let sx = 0, n = 0; for (const o of mdNear(a.x, r)) if (o.sp === a.sp && o !== a && !o.dead && o.layer === a.layer) { sx += o.x; n++; } return n ? { x: sx / n, n } : null; }
function mdHighGround(x) { let best = x, bd = 1e9; for (let d = 0; d < 2600; d += 40) for (const s of [-1, 1]) { const xx = x + s * d; if (xx < 30 || xx > MDS.WW - 30) continue; if (mdGY(xx) < MDS.S - 60 - 0 && d < bd) { return xx; } } return best; }
const mdSpd = (a, run) => (a.hurt > MDS.t ? 0.55 : 1) * mdSpd0(a, run);
const mdSpd0 = (a, run) => { const v = a.S.v; if (a.layer === 'air') return v[0] * (a.flying ? (run ? 1.5 : 0.9) : (run ? 0.8 : 0.3)); if (a.layer === 'water' || a.layer === 'floor') return v[0] * (run ? 2.6 : 1); return run ? (v[1] || v[0] * 2) : v[0]; };

function mdFlee(a, fromX, t) { const away = a.x >= fromX ? 1 : -1; a.tx = mdCl(a.x + away * (350 + mdR() * 350), 30, MDS.WW - 30); a.dir = away; a.running = true; mdSetState(a, 'flee', t || 3.5); a.flyAway = true; if (a.layer === 'water') { a.ty = mdCl(a.y + (mdR() - 0.5) * 120, MDS.surf() + 16, mdGY(a.x) - 12); } if (a.layer === 'air') { a.flying = true; a.ty = mdCl(a.y - 80 - mdR() * 80, 60, MDS.S - 120); } }

function mdThink(a, dt) {
  const E = MDS.E, S = a.S, sight = (a.layer === 'water' ? 320 : 380) * (E.night > 0.6 && S.pat !== 'n' ? 0.6 : 1) * (E.fog > 0.5 ? 0.7 : 1);
  if (a.dead) return;
  /* —— cría con mamá —— */
  const baby = a.age < 0.55, mom = baby && a.mom ? MDS.an.find((o) => o.id === a.mom && !o.dead) : null;
  /* peligros inmediatos */
  const dg = mdDanger(a); if (dg && !(a.layer === 'water' && !dg.sky)) { mdFlee(a, dg.x, 2.5); a.state = dg.kind === 'fire' ? 'fire' : dg.kind === 'lava' ? 'lava' : a.state; return; }
  if (MDS.shake > 0.1 && a.layer !== 'water' && a.state !== 'panic') { a.tx = mdCl(a.x + (mdR() - 0.5) * 500, 30, MDS.WW - 30); a.running = true; mdSetState(a, 'panic', 2.2); if (a.layer === 'air') a.flying = true; return; }
  /* depredadores */
  let threat = null, td = sight;
  if (a.state !== 'sleep' || true) for (const o of mdNear(a.x, sight)) { if (o === a || o.dead || !o.S.prey) continue; if (!o.S.prey.includes(a.sp)) continue; if (o.state === 'sleep' || o.state === 'rest' || o.state === 'brood') continue; if (o.hunger < 0.38 && o.state !== 'hunt') { if (Math.abs(o.x - a.x) > 90) continue; } if (!mdCanHunt(o, a)) continue; const d = Math.abs(o.x - a.x) + Math.abs(o.y - a.y) * 0.4; if (d < td) { td = d; threat = o; } }
  if (threat) { if (a.state !== 'flee') { a.fear = 1; for (const o of mdNear(a.x, 240)) if (o.sp === a.sp && o !== a && o.state !== 'flee' && !o.dead && o.state !== 'sleep' && o.S.t !== 'f') { o.alert = 0.4 + mdR() * 0.5; o.alertFrom = threat.x; } } mdFlee(a, threat.x, 3 + mdR() * 2); a.threatId = threat.id; if (!a.flying && a.layer === 'air' && a.S.t === 'b') a.flying = true; return; }
  if (a.alert > 0) { a.alert -= 0.3; if (a.alert <= 0) { mdFlee(a, a.alertFrom, 3); return; } }
  if (a.state === 'flee' && a.timer > 0) return;
  /* clima: refugio */
  if (E.shelter && a.layer !== 'water' && a.layer !== 'floor' && a.state !== 'shelter' && a.state !== 'raft' && !(a.state === 'dizzy')) {
    if (a.layer === 'air') { const tr = mdNearestTree(a.x, 3000); if (tr) { a.shelter = tr; a.tx = tr.x + (mdR() - 0.5) * 40; a.ty = tr.y - tr.h * 0.7; a.flying = true; mdSetState(a, 'shelter', 6); return; } }
    else { const sh = mdShelterFor(a); if (sh) { a.shelter = sh; a.tx = sh.x + (mdR() - 0.5) * 30; a.running = false; mdSetState(a, 'shelter', 8); return; } }
  }
  if (E.shelter && (a.layer === 'water') && a.state !== 'shelter') { a.ty = mdGY(a.x) - 16 - mdR() * 20; mdSetState(a, 'shelter', 8); a.tx = a.x; return; }
  if (a.state === 'shelter') { if (!E.shelter) { mdSetState(a, 'idle', 1); } else { a.timer = 5; return; } }
  /* inundación */
  if (MDS.flood > 6 && a.layer === 'land' && !a.raft) { const rf = MDS.rafts.filter((r) => r.riders.length < r.cap).sort((p, q) => Math.abs(p.x - a.x) - Math.abs(q.x - a.x))[0]; if (rf && Math.abs(rf.x - a.x) < 1800) { a.tx = rf.x; a.rfT = rf.id; a.running = true; mdSetState(a, 'swimland', 4); return; } if (mdDepth(a.x) > -4) { a.tx = mdHighGround(a.x); a.running = true; mdSetState(a, 'swimland', 4); return; } }
  if (a.state === 'raft' || a.state === 'dizzy' || a.state === 'flung') return;
  /* sueño */
  const pat = S.pat; const wantSleep = (pat === 'd' && E.night > 0.78) || (pat === 'n' && E.night < 0.2 && E.sunAlt > 0.15) || (pat === 'c' && Math.abs(E.sunAlt) > 0.93 && mdR() < 0.5) || (pat === 'a' && a.energy < 0.12);
  if (wantSleep && a.layer !== 'water' && !baby) { if (a.state !== 'sleep' && a.state !== 'rest') { const sh = a.layer === 'air' ? mdNearestTree(a.x, 2500) : (mdR() < 0.6 ? mdShelterFor(a) : null); if (sh && Math.abs(sh.x - a.x) < 900) { a.tx = sh.x + (mdR() - 0.5) * 36; a.shelter = sh; if (a.layer === 'air') { a.ty = sh.y - sh.h * 0.78; a.flying = true; } mdSetState(a, 'rest', 7); return; } mdSetState(a, 'sleep', 8 + mdR() * 6); return; } if (a.state === 'rest') { if (Math.abs(a.x - a.tx) < 14) { mdSetState(a, 'sleep', 10); } return; } a.timer = 8; return; }
  if (wantSleep && a.layer === 'water') { a.ty = mdGY(a.x) - 14; mdSetState(a, 'rest', 8); return; }
  if (a.state === 'sleep' || a.state === 'rest') { a.energy = Math.min(1, a.energy + 0.1); if (!wantSleep || a.energy > 0.98) { mdSetState(a, 'idle', 1); } else { a.timer = 6; return; } }
  /* crías siguen a mamá */
  if (baby) { const M = mom || mdNear(a.x, 400).find((o) => o.sp === a.sp && o.age >= 1 && !o.dead && o.id !== a.id); if (M) { a.mom = M.id; const dx = M.x - a.x; if (Math.abs(dx) > 55 || M.state === 'flee') { a.tx = M.x - Math.sign(dx) * (20 + mdR() * 24); a.running = Math.abs(dx) > 160 || M.state === 'flee'; mdSetState(a, 'follow', 2); if (a.layer === 'water' || a.layer === 'air') { a.ty = M.y + (mdR() - 0.5) * 40; } } else { if (mdR() < 0.35) { a.tx = a.x + (mdR() - 0.5) * 70; mdSetState(a, 'play', 2); } else { mdSetState(a, 'idle', 2); } if (a.layer === 'water') a.ty = M.y + (mdR() - 0.5) * 50; } if (M.state === 'sleep') mdSetState(a, 'sleep', 3); if (a.age < 0.3 && mdR() < 0.04) mdSay(a, a.S.t === 'b' ? '¡Pi pi!' : mdPick(['¡Mamá!', 'Mamá…', 'Jiji'])); return; } }
  if (a.inNest) return;
  /* hambre */
  const carn = S.d === 'c', om = S.d === 'o', needFood = a.hunger > (carn ? 0.52 : om ? 0.42 : 0.33);
  if (needFood && (carn || om) && S.prey && S.prey.length && (a.cdHunt || 0) <= MDS.t && !(om && mdR() < 0.45)) {
    let tgt = null, bd = 1e9; for (const o of mdNear(a.x, 560)) { if (!mdCanHunt(a, o)) continue; if (o.age < 0.55 && mdR() < 0.2) continue; if (MDS.init[o.sp] && mdCount(o.sp) <= Math.max(2, Math.round(MDS.init[o.sp] * 0.32))) continue; const d = Math.abs(o.x - a.x) + Math.abs(o.y - a.y) * 0.5; if (d < bd) { bd = d; tgt = o; } }
    if (tgt) { a.tgt = tgt.id; a.running = true; mdSetState(a, 'hunt', 6); if (a.layer === 'air') a.flying = true; a.tx = tgt.x; a.ty = tgt.y; return; }
  }
  if (a.state === 'hunt') mdSetState(a, 'idle', 1);
  if (needFood && (!carn || (carn && !S.prey) )) {
    if (a.layer === 'water' || a.layer === 'floor') { mdSetState(a, S.d === 'f' ? 'plank' : 'browse', 7 + mdR() * 4); a.tx = mdCl(a.x + a.dir * (20 + mdR() * 120), 30, MDS.WW - 30); if (a.layer === 'water') a.ty = mdCl(a.y + (mdR() - 0.5) * 80, MDS.surf() + 16, mdGY(a.x) - 12); return; }
    if ((S.d === 'h' || S.d === 'o') && (a.arb || a.layer === 'air') && mdR() < 0.7) { const tr = mdNearestTree(a.x, 900, true) || mdNearestTree(a.x, 900); if (tr) { a.tree = tr; a.tx = tr.x; if (a.layer === 'air') { a.ty = tr.y - tr.h * 0.7; a.flying = true; } mdSetState(a, 'fruit', 8); return; } }
    mdSetState(a, 'graze', 7 + mdR() * 6); a.tx = a.x + a.dir * (10 + mdR() * 50); if (a.layer === 'air' && a.flying) { a.tx = mdCl(a.x + (mdR() - 0.5) * 200, 30, MDS.WW - 30); if (mdDepth(a.tx) > 0 && a.S.h !== 'M') a.tx = mdHighGround(a.tx); a.ty = mdGY(a.tx); a.landing = true; } return;
  }
  /* trepar */
  if (a.arb && a.layer === 'land' && (a.state !== 'canopy' && a.state !== 'swing' && a.state !== 'climb') && mdR() < 0.55) { const tr = mdNearestTree(a.x + (mdR() - 0.5) * 600, 700); if (tr) { a.tree = tr; a.tx = tr.x; mdSetState(a, 'climb', 8); return; } }
  if (a.arb && (a.state === 'canopy' || a.state === 'swing')) { if (a.timer <= 0) { if (mdR() < 0.5) { let tr = null, bd = 1e9; for (const f of MDS.trees) { if (f.burnt || f.burn > 0 || f === a.tree) continue; const d = Math.abs(f.x - a.x); if (d > 60 && d < 520 && d < bd) { bd = d; tr = f; } } if (tr) { a.tree = tr; a.tx = tr.x; mdSetState(a, 'swing', 6); return; } } else { a.tx = a.x; mdSetState(a, 'climb', 3); a.down = true; return; } } else return; }
  /* pareja / reproducción */
  if (a.preg > 0 || a.nestPlan) { /* gestando */ }
  /* paseo */
  if (a.state === 'graze' || a.state === 'browse' || a.state === 'plank' || a.state === 'fruit' || a.state === 'eat' || a.state === 'drink') { if (a.timer > 0) return; }
  if (a.timer > 0 && (a.state === 'wander' || a.state === 'school' || a.state === 'swim' || a.state === 'fly' || a.state === 'perch' || a.state === 'chat' || a.state === 'brood' || a.state === 'nestbuild')) { if (a.state === 'wander' || a.state === 'swim' || a.state === 'school' || a.state === 'fly') { if (Math.abs(a.x - a.tx) > 12) return; } else return; }
  /* beber */
  if (a.layer === 'land' && a.S.h !== 'M' && !MDS.sea && mdR() < 0.07 && MDS.waterXs.length) { const w = MDS.waterXs.reduce((b, x) => (Math.abs(x - a.x) < Math.abs(b - a.x) ? x : b), MDS.waterXs[0]); if (Math.abs(w - a.x) < 1100) { let ex = w; for (let d = 0; d < 400; d += 16) { if (mdDepth(w + (w < a.x ? d : -d)) < 6) { ex = w + (w < a.x ? d : -d); break; } } a.tx = ex; a.drinkAt = ex; mdSetState(a, 'drink', 10); return; } }
  /* charla en grupo */
  const hc = mdHerdCenter(a, 420);
  if (hc && Math.abs(a.x - hc.x) < 100 && mdR() < 0.18 && a.layer !== 'water') { mdSetState(a, 'chat', 3 + mdR() * 2); a.tx = a.x; mdSay(a, mdVoice(a)); for (const o of mdNear(a.x, 120)) if (o.sp === a.sp && o !== a && !o.say && mdR() < 0.6 && !o.dead) { o.say = { txt: mdLine(o), t: 2.2, delay: 0.5 + mdR() * 0.8 }; } return; }
  /* elegir nuevo destino */
  const far = hc && Math.abs(a.x - hc.x) > 260 && mdR() < 0.8;
  if (a.layer === 'water') {
    const fr = 40 + mdR() * 360, sg = far ? Math.sign(hc.x - a.x) : (mdR() < 0.5 ? -1 : 1); let nx = mdCl(a.x + sg * fr, 30, MDS.WW - 30), tries = 0; if (!MDS.sea) { while (mdDepth(nx) < 40 && tries++ < 8) nx = mdCl(a.x + (mdR() - 0.5) * 500, 30, MDS.WW - 30); if (mdDepth(nx) < 40) nx = mdPick(MDS.waterXs.slice().sort((p, q) => Math.abs(p - a.x) - Math.abs(q - a.x)).slice(0, 10)) || a.x; }
    a.tx = nx; const zz = mdZoneY(S, nx); a.ty = zz[0] + mdR() * (zz[1] - zz[0]); a.dir = nx >= a.x ? 1 : -1; a.running = false; mdSetState(a, hc && hc.n > 2 && S.g > 3 ? 'school' : 'swim', 4 + mdR() * 5); return;
  }
  if (a.layer === 'floor') { a.tx = mdCl(a.x + (mdR() - 0.5) * 240, 30, MDS.WW - 30); a.running = false; mdSetState(a, 'wander', 6); return; }
  if (a.layer === 'air') {
    if (a.flying && a.S.t === 'b') {
      if (mdR() < 0.4 && !wantSleep) { const tr = mdNearestTree(a.x + (mdR() - 0.5) * 1400, 900); if (tr) { a.perchT = tr; { const pp = mdPerchPick(tr, a), q = mdPerchXY(tr, pp); a.tx = q.x; a.ty = q.y - 3; } a.landing = true; mdSetState(a, 'fly', 8); return; } }
      if (mdR() < 0.25 && S.h === 'M') { const wx = MDS.waterXs.length ? mdPick(MDS.waterXs) : null; if (wx) { a.tx = wx; a.ty = MDS.surf() - 3; a.landing = true; a.onWater = true; mdSetState(a, 'fly', 8); return; } }
      if (mdR() < 0.2) { a.tx = mdCl(a.x + (mdR() - 0.5) * 300, 30, MDS.WW - 30); a.ty = mdGY(a.tx) - 2; a.landing = true; mdSetState(a, 'fly', 8); return; }
      a.tx = mdCl((far ? hc.x : a.x) + (mdR() - 0.5) * 1200, 30, MDS.WW - 30); a.ty = mdCl(a.y + (mdR() - 0.5) * 140, 70, MDS.S - 150); a.landing = false; a.dir = a.tx >= a.x ? 1 : -1; mdSetState(a, 'fly', 5 + mdR() * 5); return;
    }
    /* posado */ if (a.state === 'perch' || a.state === 'idle') { if (mdR() < 0.45 && !wantSleep) { a.flying = true; a.ty = mdCl(a.y - 80 - mdR() * 160, 70, MDS.S - 150); a.tx = mdCl(a.x + (mdR() - 0.5) * 800, 30, MDS.WW - 30); a.landing = false; mdSetState(a, 'fly', 6); return; } mdSetState(a, 'perch', 4 + mdR() * 6); return; }
    mdSetState(a, 'perch', 4); return;
  }
  /* tierra */
  let dist = 40 + mdR() * 320, sg = far ? Math.sign(hc.x - a.x) : (mdR() < 0.5 ? -1 : 1); if (mdR() < 0.25) { mdSetState(a, 'idle', 2 + mdR() * 4); a.tx = a.x; a.running = false; return; }
  let nx = mdCl(a.x + sg * dist, 30, MDS.WW - 30); if (a.S.h !== 'M' && !MDS.sea) { let tries = 0; while (mdDepth(nx) > 20 && tries++ < 6) nx = mdCl(a.x - sg * dist * (0.4 + mdR() * 0.6), 30, MDS.WW - 30); if (mdDepth(nx) > 20) nx = a.x; }
  if (a.S.h === 'M' && !MDS.sea && mdR() < 0.3 && MDS.waterXs.length) { nx = mdPick(MDS.waterXs); }
  a.tx = nx; a.dir = nx >= a.x ? 1 : -1; a.running = false; mdSetState(a, 'wander', 5 + mdR() * 6);
}

/* ---------- matar / comer ---------- */
function mdPuff(x, y, n, col, kind) { for (let i = 0; i < n; i++) MDS.parts.push({ x, y, vx: (mdR() - 0.5) * 90, vy: -mdR() * 80, life: 0.7 + mdR() * 0.5, max: 1.2, col: col || '#fff', size: 2 + mdR() * 3, kind: kind || 'puff' }); }
function mdKill(prey, by) {
  if (prey.dead) return; prey.dead = true; MDS.stat.eaten++; mdPuff(prey.x, prey.y - 8, 7, prey.S.t === 'b' ? '#f4efe0' : '#ffffff55');
  if (by) { by.hunger = Math.max(0, by.hunger - (0.5 + 0.3 * Math.min(1, prey.S.z / by.S.z))); by.kills++; by.state = 'eat'; by.timer = 4; by.running = false; by.tx = by.x; by.tgt = 0; by.cdHunt = MDS.t + 8 + mdR() * 12; if (MDS.stat.eaten % 6 === 1) mdLog(`${by.S.n} ${by.name} cazó ${prey.S.n.toLowerCase()}.`); }
  if (prey.mom) { /* ... */ } for (const k of MDS.an) if (k.mom === prey.id) k.mom = 0;
}

/* ---------- movimiento ---------- */
function mdMove(a, dt) {
  const S = a.S, E = MDS.E; a.moving = false; a.running = !!a.running;
  if (a.stun > 0) { a.stun -= dt; a.moving = false; return; }
  const st = a.state; const still = st === 'sleep' || st === 'graze' || st === 'browse' || st === 'plank' || st === 'eat' || st === 'drink' && Math.abs(a.x - a.tx) < 10 || st === 'brood' || st === 'chat' && Math.abs(a.x - a.tx) < 5 || st === 'dizzy' || st === 'dead' || st === 'idle' || (st === 'perch' && !a.flying) || st === 'canopy' || (st === 'rest' && Math.abs(a.x - a.tx) < 10) || st === 'raft' || (st === 'shelter' && Math.abs(a.x - a.tx) < 8 && a.layer !== 'air') || (st === 'fruit' && Math.abs(a.x - a.tx) < 10);
  const L = a.layer;
  /* ---- tornado ---- */
  if (a.state === 'flung') { mdFlung(a, dt); return; }
  /* ---- nido ---- */
  if (a.inNest) { const n = MDS.nests.find((q) => q.id === a.inNest); if (n) { a.x = n.x + (a.id % 3 - 1) * 5; a.y = n.y - 6; a.flying = false; a.state = 'nest'; return; } a.inNest = 0; }
  if (L === 'land' || (L === 'air' && !a.flying)) {
    let sp = still ? 0 : mdSpd(a, a.running || st === 'flee' || st === 'hunt' || st === 'panic' || st === 'swimland'); if (L === 'air') sp = still ? 0 : mdSpd(a, a.running);
    if (a.arb && (st === 'climb' || st === 'canopy' || st === 'swing')) sp = st === 'swing' ? 90 : 36;
    let dx = a.tx - a.x; if (Math.abs(dx) < 4 + (st === 'hunt' ? S.z * 8 : 0)) { dx = 0; if (st === 'wander' || st === 'follow' || st === 'play' || st === 'swimland' && !a.rfT) { a.timer = Math.min(a.timer, 0.4); } } else { a.dir = Math.sign(dx); }
    if (st === 'sleep' || st === 'rest') sp = 0; const step = sp * Math.min(1, Math.abs(dx) / (sp * dt + 0.01)) * (E.snow > 0.5 && E.rain > 0.3 ? 0.85 : 1) * (a.age < 0.5 ? 0.8 : 1) * (a.hunger > 0.9 ? 0.7 : 1);
    if (dx !== 0 && sp > 0) {
      const nx = a.x + Math.sign(dx) * Math.min(step * dt, Math.abs(dx));
      /* bloqueo por agua */ if (S.h !== 'M' && !MDS.sea && MDS.flood < 3 && L === 'land' && mdDepth(nx) > 30 && mdDepth(a.x) <= 30 && a.layer === 'land' && st !== 'swimland') { a.tx = a.x; a.timer = 0; }
      else { a.dist += Math.abs(nx - a.x); a.x = mdCl(nx, 20, MDS.WW - 20); a.moving = true; a.ph += dt * (a.running ? 15 : 8) * (sp / (S.v[0] || 30) > 2 ? 0.5 : 1) * (S.v[0] < 15 ? 0.6 : 1); }
    }
    a.hop = S.sh === 'kang' || S.sh === 'frog' ? (a.moving ? Math.abs(Math.sin(a.ph * 0.9)) : 0) : 0;
    /* altura */
    let gy = mdGY(a.x), sf = MDS.surf(); let ty;
    if (a.raft) { const r = MDS.rafts.find((q) => q.id === a.raft); if (r) { a.x += (r.x + r.slot(a) - a.x) * Math.min(1, dt * 3); ty = r.y - 4; a.dir = 1; } else { a.raft = null; } }
    if (ty == null) { ty = gy; if (gy > sf + 6 && !MDS.sea) ty = sf + 7; else if (MDS.sea) ty = gy; if (L === 'land' && gy <= sf + 6 && !MDS.sea) ty += a.lane; }
    if (a.arb && (st === 'canopy' || st === 'swing' || st === 'climb') && a.tree) { const tr = a.tree; const top = tr.y - tr.h * (0.5 + 0.2 * Math.sin(a.id)); if (st === 'climb') { } else if (st === 'canopy') { a.up = Math.min(1, a.up + dt * 2); } else if (st === 'swing') { if (Math.abs(a.x - tr.x) < 12) { mdSetState(a, 'canopy', 6 + mdR() * 6); } a.up = 1; }
      ty = mdLerp(gy, top - (st === 'swing' ? 12 * Math.sin(Math.PI * Mat(Math.abs(a.x - tr.x), 300)) : 0), a.up); }
    else if (a.up > 0) { a.up = Math.max(0, a.up - dt * 1.2); ty = mdLerp(ty, ty - 0, 1); const tr = a.tree; if (tr) ty = mdLerp(gy, tr.y - tr.h * 0.5, a.up); }
    if (L === 'air' && !a.flying) { if (a.perchY != null) ty = a.perchY; }
    a.y += (ty - a.y) * Math.min(1, dt * (a.raft ? 3 : 10)); if (Math.abs(a.y - ty) > 40) a.y = ty;
    if (L === 'air' && !a.flying && a.perchY == null) a.y = mdGY(a.x) + (mdDepth(a.x) < 0 ? a.lane : 0);
    return;
  }
  if (L === 'air' && a.flying) {
    const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), sp = mdSpd(a, a.running || st === 'flee' || st === 'hunt') * (E.wind > 0.7 ? 0.8 : 1);
    if (d > 6) { a.vx += (dx / d * sp - a.vx) * Math.min(1, dt * 3); a.vy += (dy / d * sp - a.vy) * Math.min(1, dt * 3); a.x = mdCl(a.x + a.vx * dt, 20, MDS.WW - 20); a.y += a.vy * dt; a.dir = a.vx >= 0 ? 1 : -1; a.moving = true; a.dist += Math.abs(a.vx * dt); a.ph += dt * 14; }
    else if (a.landing) { a.flying = false; a.landing = false; a.vx = a.vy = 0; a.perchY = a.onWater ? MDS.surf() + 4 : (a.perchT && !a.perchT.burnt ? a.ty : null); a.tree = a.perchT || a.tree; a.onWater = false; a.perchT = null; if (!['graze', 'fruit', 'shelter', 'rest', 'brood', 'nestbuild', 'feed'].includes(st)) mdSetState(a, 'perch', 5 + mdR() * 8); if (a.perchY == null) a.y = mdGY(a.x); else a.y = a.perchY; }
    else { if (a.state === 'fly') a.timer = 0; if (st === 'shelter') { a.flying = false; a.perchY = a.ty; a.vx = a.vy = 0; } if (st === 'fruit') { a.flying = false; a.perchY = a.ty; a.vx = a.vy = 0; } if (st === 'rest') { a.flying = false; a.perchY = a.ty; a.vx = a.vy = 0; } }
    if (a.y > mdGY(a.x) - 2 && !(a.onWater)) a.y = mdGY(a.x) - 2;
    return;
  }
  if (L === 'water') {
    const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy), sp = still ? 0 : mdSpd(a, a.running || st === 'flee' || st === 'hunt' || st === 'panic');
    /* cardumen */ let ax = 0, ay = 0; if (S.g > 2 && (st === 'school' || st === 'swim') && a.age >= 0.5) { const hc = mdHerdCenter(a, 160); if (hc) ax = (hc.x - a.x) * 0.15; }
    if (d > 6 && sp > 0) { a.vx += ((dx / d * sp) + ax - a.vx) * Math.min(1, dt * 2.2); a.vy += ((dy / d * sp * 0.6) - a.vy) * Math.min(1, dt * 2.2); a.moving = true; } else { a.vx *= 1 - Math.min(1, dt * 2); a.vy *= 1 - Math.min(1, dt * 2); if (st === 'swim' || st === 'school' || st === 'follow' || st === 'flee') a.timer = Math.min(a.timer, 0.3); }
    let nx = a.x + a.vx * dt, ny = a.y + a.vy * dt + Math.sin(MDS.t * 1.5 + a.id) * 3 * dt;
    if (!MDS.sea && mdDepth(nx) < 30) { a.vx = -a.vx * 0.5; a.tx = a.x; a.timer = 0; nx = a.x; if (mdDepth(a.x) < 22) { const c = MDS.waterXs.reduce((b, x) => (Math.abs(x - a.x) < Math.abs(b - a.x) ? x : b), a.x); a.x += Math.sign(c - a.x) * 40 * dt; } }
    a.x = mdCl(nx, 20, MDS.WW - 20); const top = MDS.surf() + 12, bot = mdGY(a.x) - 12; a.y = mdCl(ny, top, Math.max(top, bot)); if (Math.abs(a.vx) > 2) a.dir = a.vx > 0 ? 1 : -1; a.ph += dt * (a.moving ? 7 + Math.abs(a.vx) * 0.05 : 2); a.dist += Math.abs(a.vx * dt); return;
  }
  if (L === 'floor') { const dx = a.tx - a.x; if (Math.abs(dx) > 4 && !still) { a.x = mdCl(a.x + Math.sign(dx) * mdSpd(a, false) * 0.6 * dt, 20, MDS.WW - 20); a.dir = Math.sign(dx); a.moving = true; a.ph += dt * 6; } if (!MDS.sea && mdDepth(a.x) < 15) { a.x += Math.sign(MDS.waterXs.reduce((b, x) => (Math.abs(x - a.x) < Math.abs(b - a.x) ? x : b), a.x) - a.x) * 40 * dt; } a.y = mdGY(a.x) - 3; return; }
}
function Mat(a, b) { return Math.min(1, a / b); }
function mdFlung(a, dt) {
  const f = a.fl; a.t2 += dt; const tor = MDS.ev.find((e) => e.type === 'tornado');
  if (a.t2 < f.up && tor) { a.ang += dt * (5 + 3 * (a.id % 3)); const rad = 40 + (a.y < 0 ? 0 : 0) + 60 * (1 - Math.min(1, a.t2 / f.up)) + 20 * Math.sin(a.ang * 0.3); a.x = tor.x + Math.cos(a.ang) * rad; a.y = mdLerp(f.y0, f.top, mdSmooth(a.t2 / f.up)) + Math.sin(a.ang) * 14; a.flying = a.layer === 'air'; a.dir = Math.cos(a.ang) > 0 ? 1 : -1; a.ph += dt * 14; a.moving = true; }
  else { if (!f.out) { f.out = true; f.vx = (mdR() < 0.5 ? -1 : 1) * (220 + mdR() * 160); f.vy = -60; } f.vy += 520 * dt; a.x = mdCl(a.x + f.vx * dt, 20, MDS.WW - 20); a.y += f.vy * dt; a.dir = f.vx > 0 ? 1 : -1; a.ph += dt * 12; a.moving = true; const g = mdGY(a.x); if (a.y >= g - 1) { a.y = g; a.vx = a.vy = 0; if (a.layer === 'air') { a.flying = true; a.ty = a.y - 120; mdSetState(a, 'dizzy', 3); a.stun = 2; } else { mdSetState(a, 'dizzy', 5); a.stun = 4.5; } a.flying = false; a.fl = null; mdSay(a, mdPick(['¡Uf, qué mareo!', '¿Qué pasó?', '¡Otra vez no!', '¡Wooow!'])); mdPuff(a.x, a.y - 4, 8, '#d9c8a0'); } }
}

/* ---------- el paso por animal ---------- */
function mdActor(a, dt) {
  if (a.dead) return;
  if (a.state === 'dead') { a.timer -= dt; a.ph += dt * 0.5; a.y += (MDS.surf() + 4 - a.y) * Math.min(1, dt * 1.2); if (a.timer < 0) a.dead = true; return; }
  a.timer -= dt; a.think -= dt; if (a.say) { if (a.say.delay > 0) { a.say.delay -= dt; } else a.say.t -= dt; if (a.say.t <= 0) a.say = null; }
  a.blink -= dt; if (a.blink < -2 - mdR() * 3) a.blink = 0.14;
  if (a.hunger < 1) a.hunger = Math.min(1, a.hunger + dt * (a.S.d === 'c' ? 0.0045 : 0.0062) * (a.state === 'sleep' ? 0.3 : 1) * (a.preg > 0 ? 1.2 : 1));
  if (a.age < 1) a.age = Math.min(1, a.age + dt / (a.S.t === 'f' ? 85 : a.S.t === 'b' ? 100 : 150));
  if (a.state !== 'sleep' && a.state !== 'rest') a.energy = Math.max(0, a.energy - dt * 0.004); else if (a.state === 'sleep') a.energy = Math.min(1, a.energy + dt * 0.02);
  /* comer */
  if (a.state === 'graze' || a.state === 'browse' || a.state === 'plank') { a.hunger = Math.max(0, a.hunger - dt * 0.055); a.eaten += dt * 0.05; if (a.hunger <= 0.04) a.timer = 0; if (a.state === 'graze' && !a.arb && mdR() < dt * 0.4) MDS.parts.push({ x: a.x + a.dir * 10, y: a.y - 4, vx: 0, vy: -20, life: 0.6, max: 0.6, col: '#7fbf5a', size: 2, kind: 'puff' }); }
  if (a.state === 'fruit') { if (a.tree && Math.abs(a.x - a.tx) < 14 || a.flying === false) { a.hunger = Math.max(0, a.hunger - dt * 0.05); if (a.hunger <= 0.04) a.timer = 0; } }
  if (a.state === 'eat') { a.hunger = Math.max(0, a.hunger - dt * 0.03); if (a.timer <= 0) { a.state = 'idle'; } }
  if (a.state === 'drink' && Math.abs(a.x - a.tx) < 14) { a.drinking = true; a.hunger = Math.max(0, a.hunger - dt * 0.004); a.yawn = 0; } else a.drinking = false;
  if (a.state === 'dizzy' && a.timer <= 0) { mdSetState(a, 'idle', 1); }
  if (a.state === 'panic' && a.timer <= 0) { mdSetState(a, 'idle', 1); }
  if (a.state === 'flee' && a.timer <= 0) { a.running = false; mdSetState(a, 'idle', 1); a.fear = 0; }
  /* cacería: seguir objetivo */
  if (a.state === 'hunt') { const p = MDS.an.find((o) => o.id === a.tgt && !o.dead); if (!p || a.timer <= 0) { a.tgt = 0; a.running = false; a.cdHunt = MDS.t + 5; mdSetState(a, 'idle', 1); } else { a.tx = p.x; a.ty = p.y - (a.layer === 'air' ? 6 : 0); const dx = Math.abs(p.x - a.x), dy = Math.abs(p.y - a.y); const reach = 16 + a.S.z * 7; if (dx < reach && dy < reach + 24) { const ps = mdSpd(p, true), hs = mdSpd(a, true); const chance = mdCl(0.5 + (hs - ps) / (2 * Math.max(hs, ps, 1)), 0.18, 0.78) * (p.state === 'sleep' ? 1.6 : 1) * (p.age < 0.55 ? 1.2 : 1); if (mdR() < chance) { mdKill(p, a); } else { mdFlee(p, a.x, 3); p.running = true; a.timer = 0; a.cdHunt = MDS.t + 4; a.tgt = 0; a.state = 'idle'; a.energy = Math.max(0, a.energy - 0.06); mdPuff(p.x, p.y - 8, 3, '#fff'); } } } }
  if (a.think <= 0) { a.think = 0.28 + mdR() * 0.3; mdThink(a, dt); }
  /* subir a la balsa */
  if (a.rfT) { const r = MDS.rafts.find((q) => q.id === a.rfT); if (!r) a.rfT = 0; else if (Math.abs(r.x - a.x) < 40 && r.riders.length < r.cap && !a.raft && a.layer === 'land') { a.raft = r.id; r.riders.push(a.id); a.rfT = 0; mdSetState(a, 'raft', 30); } }
  if (a.raft && MDS.flood < 4) { a.raft = null; const r = MDS.rafts.find((q) => q.riders.includes(a.id)); if (r) r.riders = r.riders.filter((i) => i !== a.id); mdSetState(a, 'idle', 1); }
  mdMove(a, dt);
  /* beber aguas */
  if (a.state === 'drink' && a.drinking && a.timer < 6 && mdR() < dt * 0.1) MDS.parts.push({ x: a.x + a.dir * 14, y: mdGY(a.x), vx: 0, vy: -20, life: 0.8, max: 0.8, col: '#bfe8ff', size: 2, kind: 'drop' });
  /* burbujas peces */
  if (a.layer === 'water' && mdR() < dt * 0.5) MDS.parts.push({ x: a.x + a.dir * 8, y: a.y - 4, vx: 0, vy: -26, life: 1.4, max: 1.4, col: '#ffffff88', size: 1.5 + mdR() * 2, kind: 'bubble' });
}

/* ---------- crías, nidos y huevos ---------- */
function mdReproduce(a, dt) {
  if (a.dead || a.age < 1 || a.inNest) return; const S = a.S, W = MDS.def;
  if (a.cd > 0) a.cd -= dt;
  if (!(a.preg > 0) && typeof mdYoungOf === 'function' && mdYoungOf(a.sp) > 0) return;
  const pop = mdCount(a.sp), cap = 3;
  if (a.preg > 0) { a.preg -= dt; if (a.preg <= 0) { a.preg = 0; mdBirth(a); } return; }
  if (S.t === 'b') {
    if (a.nest) { return; }
    if (a.cd > 0 || a.male || pop >= cap || MDS.an.length > MDS.cap * 0.85 || a.hunger > 0.65 || MDS.E.shelter || MDS.E.night > 0.6 || MDS.sea) return;
    const mate = mdNear(a.x, 1200).find((o) => o.sp === a.sp && o.male && o.age >= 1 && !o.dead); if (!mate && MDS.def.mode === 'land' && mdR() < 0.7) return;
    /* sitio */ let site = null; if (S.nest === 'tree') { const tr = mdNearestTree(a.x, 1400); if (tr) { const pp = mdPerchPick(tr, null), q = mdPerchXY(tr, pp); site = { x: q.x, y: q.y - 2, tree: tr }; } } else { let nx = a.x + (mdR() - 0.5) * 120; if (mdDepth(nx) > -15) return; const sh = mdShelterFor(a); if (S.nest === 'cliff') { let bx = nx; for (let d = 0; d < 1600; d += 50) { const q = a.x + (mdR() < 0.5 ? -d : d); if (q > 40 && q < MDS.WW - 40 && mdGY(q) < MDS.S - 90) { bx = q; break; } } nx = bx; } site = { x: nx, y: mdGY(nx) }; }
    if (!site) return; const nest = { id: ++MDS.uid, sp: a.sp, owner: a.id, x: site.x, y: site.y, tree: site.tree || null, stage: 'build', t: 8, eggs: 0, chicks: 0, egg: S.look.c, chickCol: S.look.b, born: MDS.t }; MDS.nests.push(nest); a.nest = nest.id; a.cd = 150 + mdR() * 60; a.tx = site.x; a.tgt = 0; if (S.nest === 'tree') { a.flying = a.layer === 'air'; a.ty = site.y - 6; a.landing = a.layer === 'air'; a.perchT = site.tree; } mdSetState(a, 'nestbuild', 9); return;
  }
  if (a.male || a.cd > 0 || pop >= cap || MDS.an.length > MDS.cap * 0.85 || a.hunger > 0.62 || MDS.E.shelter) return;
  if (a.layer === 'land' && mdInW(a) && a.S.h !== 'M') return;
  const mate = mdNear(a.x, 1000).find((o) => o.sp === a.sp && o.male && o.age >= 1 && !o.dead); if (!mate) { a.cd = 10; return; }
  a.preg = S.t === 'f' ? 16 + mdR() * 10 : 32 + mdR() * 18; a.cd = 70 + mdR() * 50; mdPuff(a.x, a.y - 22, 3, '#ff8fa3', 'heart'); mate.cd = Math.max(mate.cd, 20);
}
function mdBirth(a) {
  const S = a.S, n = mdRI(S.lit[0], S.lit[1]), pop = mdCount(a.sp), cap = 3; const k = 1;
  for (let i = 0; i < k && MDS.an.length < MDS.cap * 1.05; i++) { const b = mdNew(a.sp, a.x + (mdR() - 0.5) * 30, { age: 0.02, mom: a.id, hunger: 0.1, cd: 90 + mdR() * 60 }); if (b) { b.y = a.y; b.dir = a.dir; b.state = 'follow'; MDS.stat.born++; } }
  a.kids += k; if (S.t === 'f') { /* alevines */ } mdPuff(a.x, a.y - 14, 6, '#ffd6e4', 'heart'); mdLog(`${a.name}, ${S.n.toLowerCase()}, tuvo ${k} ${k === 1 ? S.bn : S.bn.endsWith('o') || S.bn.endsWith('a') || S.bn.endsWith('e') || S.bn.endsWith('í') ? S.bn + 's' : S.bn + 's'}.`);
}
function mdNests(dt) {
  for (const n of MDS.nests.slice()) {
    n.t -= dt; const own = MDS.an.find((o) => o.id === n.owner && !o.dead);
    if (n.tree && (n.tree.burn > 0 || n.tree.burnt)) { mdDestroyNest(n, 'fuego'); continue; }
    if (n.stage === 'build') { if (own && Math.abs(own.x - n.x) < 40 && !own.flying) { n.t -= dt * 0.5; } if (!own) { mdDestroyNest(n); continue; } if (n.t <= 0) { n.stage = 'eggs'; n.eggs = 1; n.t = 36; mdSetState(own, 'brood', 36); own.tx = n.x; own.landing = true; if (own.layer === 'air') { own.flying = true; own.ty = n.y - 6; own.perchT = n.tree; } } }
    else if (n.stage === 'eggs') { if (!own) { n.t -= dt * 2; } else if (own.state !== 'brood' && own.state !== 'flee' && own.state !== 'shelter') { if (Math.abs(own.x - n.x) < 60) mdSetState(own, 'brood', 5); else if (!MDS.E.shelter) { own.tx = n.x; mdSetState(own, 'nestbuild', 4); if (own.layer === 'air') { own.flying = true; own.ty = n.y - 6; own.landing = true; } } } if (n.t <= 0) { n.stage = 'chicks'; n.t = 70; const kk = n.eggs; n.eggs = 0; const S = MD_SP[n.sp]; for (let i = 0; i < kk; i++) { const b = (MDS.an.length > MDS.cap * 1.05 ? null : mdNew(n.sp, n.x, { age: 0.02, inNest: n.id, mom: n.owner, hunger: 0.2, cd: 90 + mdR() * 60 })); if (b) { b.y = n.y - 6; b.flying = false; b.state = 'nest'; MDS.stat.born++; MDS.stat.hatched++; n.chicks++; } } mdLog(`¡Nacieron ${kk} ${kk === 1 ? S.bn : S.bn + 's'} en un nido de ${S.n.toLowerCase()}!`); if (own) { own.kids += kk; mdSetState(own, 'feed', 20); mdPuff(n.x, n.y - 12, 6, '#fff3a8', 'heart'); } }
    } else if (n.stage === 'chicks') { n.hungry = Math.sin(MDS.t * 3 + n.id) > 0.3; const live = MDS.an.filter((o) => o.inNest === n.id && !o.dead); n.chicks = live.length; for (const c of live) { if (c.age >= 0.45) { c.inNest = 0; c.state = 'follow'; c.flying = false; } } if (own && !own.dead && mdR() < dt * 0.1) { mdPuff(n.x, n.y - 14, 2, '#8ac85a'); own.hunger = Math.max(0, own.hunger - 0.05); } if (n.t <= 0 || (!live.length && n.t < 55)) { MDS.nests.splice(MDS.nests.indexOf(n), 1); if (own) { own.nest = 0; if (own.state === 'feed' || own.state === 'brood') mdSetState(own, 'idle', 1); } } }
  }
}
function mdDestroyNest(n, why) { const i = MDS.nests.indexOf(n); if (i >= 0) MDS.nests.splice(i, 1); const own = MDS.an.find((o) => o.id === n.owner); if (own) { own.nest = 0; if (own.state === 'brood' || own.state === 'feed' || own.state === 'nestbuild') { mdFlee(own, own.x, 3); } } for (const c of MDS.an) if (c.inNest === n.id) { c.inNest = 0; c.y = mdGY(c.x); c.state = 'dizzy'; c.stun = 2; c.timer = 3; } if (n.eggs) { MDS.stat.lost += n.eggs; if (why === 'fuego') mdLog(`Un nido de ${MD_SP[n.sp].n.toLowerCase()} se quemó con el árbol.`); } MDS.nests = MDS.nests.filter((q) => q !== n); }

/* ---------- catástrofes ---------- */
function mdStartCat(type) {
  const W = MDS.def, WW = MDS.WW, ex = MDS.ev.find((e) => e.type === type); if (ex) { ex.t = Math.min(ex.t, 1); }
  if (type === 'rayo') { MDS.ev.push({ type, t: 50, dur: 50 }); mdLog('Se acerca una tormenta eléctrica.'); }
  else if (type === 'ventisca') { MDS.ev.push({ type, t: 42, dur: 42, f: 0 }); mdLog('Llega una ventisca helada.'); }
  else if (type === 'inund') { MDS.ev.push({ type, t: 55, dur: 55 }); const nR = 5; MDS.rafts = []; for (let i = 0; i < nR; i++) { const x = WW * (i + 0.5) / nR + (mdR() - 0.5) * 300; MDS.rafts.push({ id: ++MDS.uid, x, y: MDS.S, cap: 14, riders: [], ph: mdR() * 6, slot(a) { const i2 = this.riders.indexOf(a.id); return (i2 - this.cap / 2) * 8 + 4; } }); } mdLog('¡Inundación! Todos corren hacia las balsas.'); }
  else if (type === 'tornado') { const dir = mdR() < 0.5 ? -1 : 1; MDS.ev.push({ type, t: 30, dur: 30, x: dir > 0 ? WW * 0.15 + mdR() * WW * 0.2 : WW * 0.85 - mdR() * WW * 0.2, vx: dir * (55 + mdR() * 20), ph: 0 }); mdLog('¡Un tornado se acerca!'); }
  else if (type === 'temblor') { MDS.ev.push({ type, t: 7, dur: 7 }); mdLog('La tierra tiembla.'); }
  else if (type === 'incendio') { MDS.ev.push({ type, t: 45, dur: 45 }); const ts = MDS.trees.filter((f) => !f.burnt && f.burn <= 0); for (let i = 0; i < 2 && ts.length; i++) mdIgnite(mdPick(ts)); mdLog('Se declaró un incendio en el bosque.'); }
  else if (type === 'erupcion') { MDS.ev.push({ type, t: 34, dur: 34, f: 0, x: WW * (MDS.def.far === 'volcano' ? 0.62 : 0.5), bomb: 0 }); mdLog('¡El volcán entró en erupción!'); }
}
function mdIgnite(f) { if (!f || f.burn > 0 || f.burnt) return; f.burn = 0.05; f.burnT = 22 + mdR() * 8; MDS.dang.push({ x: f.x, r: Math.max(90, f.h * 0.5), t: 24, kind: 'fire', ref: f }); }
function mdStrike(x) {
  MDS.flash = 1; const ground = mdGY(x); const wet = mdDepth(x) > 22; let tree = null, bd = 80; for (const f of MDS.trees) { const d = Math.abs(f.x - x); if (d < bd && !f.burnt && f.burn <= 0) { bd = d; tree = f; } }
  MDS.bolt = { x: tree ? tree.x : x, y: wet ? MDS.surf() : tree ? tree.y - tree.h * 0.85 : ground, t: 0.35, seed: mdR() * 99 };
  if (tree && !wet) { mdIgnite(tree); mdLog('Un rayo cayó sobre un árbol y lo incendió.'); mdPuff(tree.x, tree.y - tree.h * 0.8, 10, '#ffd23a', 'spark'); }
  else if (wet) { let k = 0; for (const a of MDS.an) { if (a.dead || a.layer !== 'water' || a.state === 'dead') continue; if (Math.abs(a.x - x) < 130 && a.S.z < 2) { a.state = 'dead'; a.dead2 = true; a.timer = 9; a.vx = a.vy = 0; k++; } } mdPuff(x, MDS.surf(), 12, '#bfe8ff', 'spark'); if (k) { mdLog(`Un rayo cayó al agua y aturdió a ${k} ${k === 1 ? 'pez' : 'peces'} cercanos.`); MDS.stat.lost += k; } else mdLog('Un rayo cayó al agua.'); }
  else { mdPuff(x, ground, 6, '#fff3a8', 'spark'); }
  MDS.dang.push({ x: tree ? tree.x : x, r: 150, t: 2.5, kind: 'bolt', sky: true });
}
function mdCats(dt) {
  const E = MDS.E; MDS.shake = Math.max(0, MDS.shake - dt); MDS.flash = Math.max(0, MDS.flash - dt * 3); if (MDS.bolt) { MDS.bolt.t -= dt; if (MDS.bolt.t <= 0) MDS.bolt = null; }
  for (const d of MDS.dang) d.t -= dt; MDS.dang = MDS.dang.filter((d) => d.t > 0 && !(d.ref && (d.ref.burnt || d.ref.burn <= 0)));
  /* rayos naturales y de evento */
  if (E.thunder > 0.35) { MDS.strikeT -= dt * E.thunder; if (MDS.strikeT <= 0) { MDS.strikeT = 3 + mdR() * 5; const evr = MDS.ev.find((e) => e.type === 'rayo'); if (evr || mdR() < 0.4) { const near = MDS.trees.filter((f) => !f.burnt && f.burn <= 0); const pickTree = near.length && mdR() < 0.55 ? mdPick(near) : null; const wx = MDS.waterXs.length && mdR() < 0.3 ? mdPick(MDS.waterXs) : null; mdStrike(pickTree ? pickTree.x : wx != null ? wx : 60 + mdR() * (MDS.WW - 120)); } } }
  let floodTarget = 0;
  for (const e of MDS.ev) {
    e.t -= dt; const el = e.dur - e.t;
    if (e.type === 'inund') { floodTarget = el < 10 ? mdSmooth(el / 10) : e.t > 12 ? 1 : mdSmooth(e.t / 12); floodTarget *= 105; }
    else if (e.type === 'ventisca') { e.f = el < 6 ? el / 6 : e.t < 6 ? e.t / 6 : 1; }
    else if (e.type === 'temblor') { MDS.shake = 1; if (mdR() < dt * 3) mdPuff(60 + mdR() * (MDS.WW - 120), mdGY(100) - 8, 2, '#d9c8a0'); if (Math.floor(el * 2) !== Math.floor((el - dt) * 2)) for (const f of MDS.trees) if (f.fruit && mdR() < 0.12) f.fruit = false; }
    else if (e.type === 'tornado') { e.x += e.vx * dt; if (e.x < 200 || e.x > MDS.WW - 200) e.vx *= -1; e.ph += dt; MDS.dang.push({ x: e.x, r: 360, t: 0.4, kind: 'tornado', sky: true }); for (const a of MDS.an) { if (a.dead || a.state === 'flung' || a.state === 'dead' || a.inNest || a.layer === 'floor') continue; if (a.layer === 'water' && !a.flying) continue; if (a.raft) continue; if (Math.abs(a.x - e.x) < 115 && Math.abs(a.x - e.x) < 120) { a.state = 'flung'; a.fl = { up: 3 + mdR() * 1.6, y0: a.y, top: a.y - 150 - mdR() * 220 }; a.t2 = 0; a.ang = mdR() * 6; a.raft = null; a.say = { txt: mdLine(a), t: 2.4 }; mdLog(`${a.S.n} ${a.name} salió volando por el tornado.`); } }
      if (mdR() < dt * 8) MDS.parts.push({ x: e.x + (mdR() - 0.5) * 80, y: mdGY(e.x) - 4, vx: (mdR() - 0.5) * 80, vy: -120 - mdR() * 80, life: 1.5, max: 1.5, col: mdR() < 0.5 ? '#9ec47a' : '#c8b48a', size: 2 + mdR() * 2, kind: 'leaf' }); }
    else if (e.type === 'erupcion') { e.f = el < 5 ? el / 5 : e.t < 8 ? e.t / 8 : 1; e.bomb -= dt; if (e.bomb <= 0) { e.bomb = 0.5 + mdR() * 0.7; const bx = mdCl(e.x + (mdR() - 0.5) * 3600, 80, MDS.WW - 80); MDS.parts.push({ x: e.x + (mdR() - 0.5) * 40, y: MDS.S - 330, vx: (bx - e.x) / 2.3, vy: -420, life: 3, max: 3, col: '#ff7a2a', size: 6 + mdR() * 5, kind: 'bomb', tx: bx }); } }
    else if (e.type === 'incendio') { /* se propaga por árboles */ }
  }
  MDS.ev = MDS.ev.filter((e) => e.t > 0);
  if (!MDS.ev.some((e) => e.type === 'inund')) floodTarget = 0;
  MDS.flood += (floodTarget - MDS.flood) * Math.min(1, dt * 1.2); if (MDS.flood < 0.4 && floodTarget === 0) MDS.flood = 0;
  if (MDS.flood < 1 && MDS.rafts.length && !MDS.ev.some((e) => e.type === 'inund')) { for (const r of MDS.rafts) for (const id of r.riders) { const a = MDS.an.find((o) => o.id === id); if (a) { a.raft = null; mdSetState(a, 'idle', 1); } } MDS.rafts = []; }
  for (const r of MDS.rafts) { r.ph += dt; r.y = MDS.surf() + 2 + Math.sin(r.ph * 1.4) * 1.5; r.x += Math.sin(r.ph * 0.35) * 5 * dt; }
  /* fuego */
  for (const f of MDS.trees.concat(MDS.fl.filter((q) => q.kind === 'bush'))) {
    if (f.burn > 0) { const wet = E.rain > 0.6 ? 2.2 : 1; f.burn = Math.min(1, f.burn + dt * 0.25); f.burnT -= dt * wet; if (mdR() < dt * 6) MDS.parts.push({ x: f.x + (mdR() - 0.5) * f.h * 0.3, y: f.y - f.h * (0.4 + mdR() * 0.5), vx: (mdR() - 0.5) * 20, vy: -50 - mdR() * 40, life: 1.4, max: 1.4, col: mdR() < 0.5 ? '#555a' : '#ff9a3a', size: 3 + mdR() * 3, kind: mdR() < 0.6 ? 'smoke' : 'spark' }); if (f.burnT <= 0) { f.burn = 0; f.burnt = true; f.fruit = false; f.regrow = 70 + mdR() * 30; } else if (E.rain < 0.6 || mdR() < 0.1) { f.spreadT = (f.spreadT || 2) - dt; if (f.spreadT <= 0) { f.spreadT = 2.5 + mdR() * 2; const nb = MDS.fl.filter((q) => q !== f && !q.burnt && q.burn <= 0 && MD_SHELTER.has(q.kind) && !q.under && Math.abs(q.x - f.x) < 190); if (nb.length && mdR() < 0.5 * (1 - E.rain)) mdIgnite(mdPick(nb)); } } }
    else if (f.burnt && f.regrow > 0) { f.regrow -= dt; if (f.regrow <= 0) { f.burnt = false; f.h *= 0.7; } }
    else if (!f.fruit && mdFruity.has(f.kind) && !f.burnt) { f.fruitT += dt; if (f.fruitT > 70) { f.fruit = true; f.fruitT = 0; } }
  }
}
function mdParts(dt) {
  const ps = MDS.parts; for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; p.life -= dt; if (p.life <= 0) { if (p.kind === 'bomb') { MDS.flash = Math.max(MDS.flash, 0.4); mdPuff(p.tx, mdGY(p.tx), 10, '#ff9a3a', 'spark'); MDS.dang.push({ x: p.tx, r: 110, t: 7, kind: 'lava' }); const tr = MDS.trees.find((f) => Math.abs(f.x - p.tx) < 90 && !f.burnt && f.burn <= 0); if (tr && mdR() < 0.7) mdIgnite(tr); } ps.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; if (p.kind === 'bomb') p.vy += 330 * dt; else if (p.kind === 'smoke') { p.vy -= 10 * dt; p.size += dt * 3; } else if (p.kind === 'bubble' || p.kind === 'heart') p.vy -= 6 * dt; else p.vy += 160 * dt * (p.kind === 'leaf' ? 0.1 : 1); if (p.kind === 'leaf') { p.vx += (mdR() - 0.5) * 120 * dt; } }
  if (ps.length > 700) ps.splice(0, ps.length - 700);
}

/* ---------- inmigración y población ---------- */
function mdBalance(dt) {
  /* unicornio: solo aparece con arcoíris */
  if (!MDS.sea && MD_SP.unicornio) { const uni = MDS.an.filter((a) => a.sp === 'unicornio' && !a.dead); if (MDS.E.rainbow > 0.5 && !uni.length && (MDS.uniT || 0) <= MDS.t) { MDS.uniT = MDS.t + 30; const x = mdCl(MDV.camX + mdVW() * (0.2 + mdR() * 0.6), 60, MDS.WW - 60); const u1 = mdNew('unicornio', x); if (u1) { u1.rb = true; u1.hunger = 0; u1.male = mdR() < 0.5; mdPuff(x, u1.y - 20, 14, '#ffe6ff', 'heart'); mdLog('¡Apareció un unicornio con el arcoíris!'); } } if (MDS.E.rainbow < 0.15) for (const u of uni) { if (!u.leaving) { u.leaving = true; mdLog('El unicornio se fue con el arcoíris.'); } u.dead = true; mdPuff(u.x, u.y - 20, 10, '#ffe6ff', 'spark'); } }
  MDS.balT = (MDS.balT || 0) - dt; if (MDS.balT > 0) return; MDS.balT = 3;
  if (typeof mdFamily === 'function') mdFamily();
}

/* ---------- actualización principal ---------- */
function mdUpdate(dtIn) {
  if (!MDS.def) return; let dt = Math.min(dtIn, 0.05) * MDS.speed; const steps = Math.max(1, Math.ceil(dt / 0.05)); dt /= steps;
  for (let s = 0; s < steps; s++) {
    MDS.t += dt; MDS.gridT = (MDS.gridT || 0) - dt; if (MDS.gridT <= 0) { MDS.gridT = 0.12; mdBuildGrid(); } mdEnv(); mdCats(dt);
    for (const a of MDS.an) { mdActor(a, dt); if (!a.dead) mdReproduceTick(a, dt); }
    MDS.an = MDS.an.filter((a) => !a.dead || (a.dead && false)); mdNests(dt); mdParts(dt); mdBalance(dt);
  }
}
function mdReproduceTick(a, dt) { a.rT = (a.rT || 0) + dt; if (a.rT > 1) { const d = a.rT; a.rT = 0; mdReproduce(a, d); } }
