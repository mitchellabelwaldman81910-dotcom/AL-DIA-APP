/* Cinnavia 7.49 — EL GRAN BOSQUE.
   Un ecosistema vivo y tranquilo: montañas con el monte Fuji, un lago, cuatro especies de árboles y once clases de
   animales con necesidades propias (hambre, sed, sueño, miedo). Comen, beben, trepan, huyen, cazan y se refugian.
   Cadena alimenticia: pasto y bayas → conejos, venados, ardillas, pájaros → zorros, lobos, águila y búho; peces → oso.
   Las estaciones cambian cada 30 minutos (la misma hora para todas las personas) y el clima es propio del bosque:
   lluvia, tormentas con relámpagos, niebla, viento, nieve, ventiscas, arcoíris y auroras boreales. */
const GBW = 4400, GBH = 720, SEASON_MS = 30 * 60000, DAY_MS = 10 * 60000, SLOT_MS = 150000;
const GBSEAS = ['Primavera', 'Verano', 'Otoño', 'Invierno'];
const gbRng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const gbR = (a, b) => a + Math.random() * (b - a);
const gbPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const gbCl = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- terreno ---------- */
const GB_LAKE_C = 2200, GB_LAKE_HW = 340, GB_WATER = 590;
const gbBase = (x) => 572 + 14 * Math.sin(x / 310) + 8 * Math.sin(x / 113 + 1.3) + 10 * Math.sin(x / 890);
GB.waterY = GB_WATER; GB.hollowGlow = (t) => G.animals.some((a) => a.hidden && a.home && a.home.tree === t && (a.sp === 'owl' || a.sp === 'squirrel'));
GB.gy = (x) => { const d = Math.abs(x - GB_LAKE_C); if (d < GB_LAKE_HW) { const u = d / GB_LAKE_HW; return GB_WATER + 4 + 46 * Math.pow(1 - u * u, 0.7); } const k = gbSm((d - GB_LAKE_HW) / 170); return gbMix(GB_WATER + 4, gbBase(x), k); };
GB.lakeL = GB_LAKE_C - GB_LAKE_HW; GB.lakeR = GB_LAKE_C + GB_LAKE_HW;
const gbInLake = (x) => x > GB.lakeL - 2 && x < GB.lakeR + 2;

/* ---------- especies ---------- */
Object.assign(GB.SP, {
  rabbit: { name: 'Conejo', n: 7, max: 10, size: 0.95, walk: 22, run: 125, diet: ['grass'], fears: ['fox', 'wolf', 'eagle'], pat: 'cre', home: 'burrow', sight: 280, fearR: 160, hg: 0.011 },
  deer: { name: 'Venado', n: 4, max: 6, size: 1.3, walk: 30, run: 115, diet: ['grass'], fears: ['wolf'], pat: 'day', home: 'thicket', sight: 320, fearR: 230, hg: 0.008 },
  squirrel: { name: 'Ardilla', n: 5, max: 7, size: 1, walk: 38, run: 135, diet: ['nut', 'berry'], fears: ['fox', 'eagle'], pat: 'day', home: 'hollow', sight: 240, fearR: 140, hg: 0.012 },
  bird: { name: 'Pajarito', n: 9, max: 12, size: 1, fly: 100, diet: ['grass'], pat: 'day', home: 'nest', hg: 0.01 },
  fox: { name: 'Zorro', n: 2, max: 3, size: 1.1, walk: 34, run: 140, prey: ['rabbit', 'squirrel'], pat: 'cre', home: 'den', sight: 330, hg: 0.007 },
  wolf: { name: 'Lobo', n: 2, max: 3, size: 1.25, walk: 36, run: 150, prey: ['deer', 'rabbit'], pat: 'night', home: 'den', sight: 380, hg: 0.0055 },
  eagle: { name: 'Águila', n: 1, max: 2, size: 1, fly: 80, prey: ['rabbit', 'fish'], pat: 'day', home: 'cliff', hg: 0.005 },
  owl: { name: 'Búho', n: 1, max: 2, size: 1, fly: 70, pat: 'night', home: 'hollow', hg: 0.006 },
  bear: { name: 'Oso', n: 1, max: 1, size: 1.2, walk: 20, run: 80, diet: ['berry'], prey: ['fish'], pat: 'day', home: 'cave', hibernate: true, hg: 0.005 },
  frog: { name: 'Rana', n: 4, max: 6, size: 1, walk: 18, pat: 'any', hibernate: true, hg: 0.004 },
  fish: { name: 'Pez', n: 9, max: 12, size: 1, walk: 22, pat: 'any', hg: 0 },
});
const GB_NAMES = { rabbit: ['Nube', 'Trébol', 'Bigotes', 'Canela', 'Copo', 'Brinco', 'Lila', 'Miel', 'Pelusa', 'Rocío'], deer: ['Aurora', 'Bambi', 'Alba', 'Hojarasca', 'Cedro', 'Brisa', 'Roble'], squirrel: ['Nuez', 'Piñón', 'Avellana', 'Chispa', 'Bellota', 'Cola', 'Almendra'], bird: ['Trino', 'Plumita', 'Alondra', 'Gorjeo', 'Cielo', 'Pico', 'Zafiro', 'Canto', 'Brizna', 'Tilín', 'Pluma', 'Ámbar'], fox: ['Rubí', 'Fuego', 'Ámbar', 'Naranjo'], wolf: ['Luna', 'Sombra', 'Plata', 'Niebla'], eagle: ['Cumbre', 'Viento'], owl: ['Sabio', 'Noctua'], bear: ['Bosque'], frog: ['Croac', 'Nenúfar', 'Gota', 'Salto', 'Charco', 'Brinquito'], fish: ['Plata', 'Sol', 'Coral', 'Río', 'Escama', 'Brillo', 'Luna', 'Ola', 'Perla', 'Hoja', 'Arroyo', 'Burbuja'] };

/* ---------- el mundo (igual para todas las personas) ---------- */
const G = { w: GBW, tm: 0, animals: [], foods: [], trees: [], bushes: [], homes: [], mush: [], parts: { rain: [], snow: [], leaf: [], fly: [], bfly: [], splash: [], puff: [] }, cam: 0, follow: null, sel: null, ov: { season: null, weather: null, time: null }, log: [], paused: false, q: 1, lastEvt: 0, pop: 0, sound: false, uid: 1 };
function gbBuildWorld() {
  const r = gbRng(20260711);
  GB.stars = Array.from({ length: 150 }, () => ({ x: r(), y: r() * r(), r: 0.5 + r() * 1.4, a: 0.4 + r() * 0.6, f: 0.001 + r() * 0.003, p: r() * 6 }));
  GB.clouds = Array.from({ length: 12 }, (_, i) => ({ x: r() * 1200, y: 40 + r() * 190, s: 0.6 + r() * 0.9, v: 0.5 + r() * 1.3, p: Array.from({ length: 5 }, (_, k) => [k * 26 - 52 + r() * 8, r() * 12 - 6 - (k === 2 ? 8 : 0), 22 + r() * 16 - Math.abs(k - 2) * 4]) }));
  G.trees = []; const types = ['pine', 'pine', 'pine', 'oak', 'oak', 'sakura', 'maple', 'oak'];
  for (let x = 90; x < GBW - 60; x += 70 + r() * 110) {
    if (x > GB.lakeL - 40 && x < GB.lakeR + 40) continue;
    const type = types[Math.floor(r() * types.length)]; const h = type === 'pine' ? 150 + r() * 120 : 140 + r() * 110;
    const br = [{ dx: -22 - r() * 14, dy: h * 0.48 }, { dx: 24 + r() * 14, dy: h * 0.6 }, { dx: -10 + r() * 20, dy: h * 0.74 }];
    const crown = Array.from({ length: 7 }, (_, k) => ({ x: (k - 3) * 11 + r() * 8 - 4, y: -(3 - Math.abs(k - 3)) * 7 + (r() * 10 - 5) + 6, r: 18 + r() * 12 - Math.abs(k - 3) * 2 }));
    G.trees.push({ x, type, h, br, crown, hollow: false, nest: false, back: false });
  }
  const oaks = G.trees.filter((t) => t.type !== 'pine'); oaks.sort((a, b) => a.x - b.x);
  for (let i = 0; i < oaks.length; i += 3) oaks[i].hollow = true;
  G.trees.forEach((t, i) => { if (i % 4 === 1) t.nest = true; });
  G.backTrees = Array.from({ length: 70 }, () => ({ x: r() * GBW, type: r() < 0.55 ? 'pine' : 'oak', h: 90 + r() * 90, br: [], crown: Array.from({ length: 5 }, (_, k) => ({ x: (k - 2) * 11, y: -(2 - Math.abs(k - 2)) * 7, r: 18 + r() * 8 })), back: true })).sort((a, b) => a.x - b.x);
  G.bushes = []; G.foods = []; G.mush = [];
  for (let x = 50; x < GBW - 40; x += 120 + r() * 160) { if (gbInLake(x) || (x > GB.lakeL - 30 && x < GB.lakeR + 30)) continue; const b = { x, w: 34 + r() * 22, berry: r() < 0.55 }; if (b.berry) { b.food = { kind: 'berry', x, amt: 0.6, bush: b }; G.foods.push(b.food); } G.bushes.push(b); }
  for (let x = 40; x < GBW - 40; x += 46 + r() * 70) { if (x > GB.lakeL - 12 && x < GB.lakeR + 12) continue; G.foods.push({ kind: 'grass', x, amt: 0.5 + r() * 0.5, flower: r() < 0.4 }); }
  for (const t of G.trees) if (t.type === 'oak' && r() < 0.6) G.foods.push({ kind: 'nut', x: t.x + (r() * 40 - 20), amt: 0, tree: t });
  for (let i = 0; i < 26; i++) { const x = r() * (GBW - 200) + 100; if (gbInLake(x)) continue; G.mush.push({ x, c: gbPick(['#d8503f', '#e0a24a', '#b27bd0', '#e8e2d0']) }); }
  GB.rocks = [{ x: 1250, w: 36, h: 24 }, { x: 3050, w: 44, h: 32 }, { x: 2750, w: 26, h: 18 }];
  GB.reeds = []; GB.pads = [];
  for (let i = 0; i < 9; i++) { GB.reeds.push({ x: GB.lakeL - 6 + i * 3 }); GB.reeds.push({ x: GB.lakeR - 18 + i * 3 }); }
  for (let i = 0; i < 9; i++) GB.pads.push({ x: GB.lakeL + 50 + r() * (GB.lakeR - GB.lakeL - 100) });
  G.homes = [];
  for (const x of [520, 980, 1480, 2850, 3350, 3900]) G.homes.push({ kind: 'burrow', x });
  for (const x of [1180, 3000, 3560, 940]) G.homes.push({ kind: 'thicket', x });
  G.homes.push({ kind: 'den', x: 760 }, { kind: 'den', x: 3250 }, { kind: 'den', x: 3700 - 4 });
  G.homes.push({ kind: 'cave', x: 330, big: true }, { kind: 'cliff', x: 4180 });
  G.homes.forEach((h) => { if (h.kind === 'den') h.x += 0; });
  G.rockHomes = true;
}
const gbHomesOf = (kind) => G.homes.filter((h) => h.kind === kind);

/* ---------- entorno: estación, hora, clima ---------- */
const GB_KIND = {
  clear: { cloud: 0.12 }, cloudy: { cloud: 0.72 }, drizzle: { cloud: 0.78, rain: 0.38 }, rain: { cloud: 0.92, rain: 0.85, wind: 0.3 }, storm: { cloud: 1, rain: 1, wind: 0.75, thunder: 1 },
  fog: { cloud: 0.5, fog: 0.9 }, wind: { cloud: 0.35, wind: 0.95 }, snow: { cloud: 0.82, rain: 0.5, wind: 0.2 }, blizzard: { cloud: 1, rain: 1, wind: 1 }, rainbow: { cloud: 0.4, rain: 0.18, rainbow: 1 }, petals: { cloud: 0.2, wind: 0.55 },
};
const GB_TABLE = [
  { clear: 30, petals: 16, cloudy: 12, drizzle: 16, rain: 12, rainbow: 8, fog: 6, wind: 8 },
  { clear: 40, cloudy: 10, rain: 9, storm: 20, rainbow: 10, wind: 6, fog: 3, drizzle: 6 },
  { clear: 20, cloudy: 18, rain: 14, fog: 20, wind: 22, storm: 6, drizzle: 10 },
  { clear: 18, cloudy: 10, snow: 34, blizzard: 20, fog: 6, wind: 6 },
];
const GB_TEMP = [0.55, 0.9, 0.38, 0];
function gbKindFor(slot, si) { const rr = gbRng(slot * 7919 + si * 131 + 17); const tb = GB_TABLE[si]; const tot = Object.values(tb).reduce((a, b) => a + b, 0); let v = rr() * tot; for (const k in tb) { v -= tb[k]; if (v <= 0) return k; } return 'clear'; }
function gbProfile(kind) { const p = GB_KIND[kind] || GB_KIND.clear; return { cloud: p.cloud || 0, rain: p.rain || 0, wind: p.wind || 0, fog: p.fog || 0, thunder: p.thunder || 0, rainbow: p.rainbow || 0 }; }
function gbEnv(now = Date.now()) {
  const E = G.env || (G.env = {});
  let sPos = (now / SEASON_MS) % 4; if (G.ov.season != null) sPos = G.ov.season + 0.4;
  const sI = Math.floor(sPos) % 4, frac = sPos - Math.floor(sPos), sN = (sI + 1) % 4; const sT = G.ov.season != null ? 0 : gbSm((frac - 0.9) / 0.1);
  E.sPos = sPos; E.sI = sI; E.sN = sN; E.sT = sT; E.frac = frac;
  const p = G.ov.time != null ? G.ov.time : (now % DAY_MS) / DAY_MS; E.p = p; E.sunAlt = Math.sin(p * 6.2832); E.night = gbSm((-E.sunAlt + 0.08) / 0.32);
  // clima: bloques de 2,5 min con transición suave
  const slot = Math.floor(now / SLOT_MS), fr = (now % SLOT_MS) / SLOT_MS; let k0, k1;
  if (G.ov.weather) { k0 = k1 = G.ov.weather === 'aurora' ? 'clear' : G.ov.weather; } else { k0 = gbKindFor(slot, G.ov.season != null ? G.ov.season : Math.floor(((slot * SLOT_MS) / SEASON_MS) % 4)); k1 = gbKindFor(slot + 1, G.ov.season != null ? G.ov.season : Math.floor((((slot + 1) * SLOT_MS) / SEASON_MS) % 4)); }
  const a = gbProfile(k0), b = gbProfile(k1), t = G.ov.weather ? 0 : gbSm((fr - 0.8) / 0.2);
  for (const k in a) E[k] = gbMix(a[k], b[k], t);
  E.kind = t > 0.5 ? k1 : k0;
  // la tormenta y la ventisca necesitan que el cielo de verdad se cierre
  const tempAt = gbMix(GB_TEMP[sI], GB_TEMP[sN], sT); E.temp = tempAt; E.cold = gbCl(1 - tempAt * 2.1, 0, 1); E.snowing = E.rain > 0.02 && E.cold > 0.5;
  // nieve acumulada y hielo del lago según la posición en el año
  const x = sPos; E.cover = G.ov.season != null ? (G.ov.season === 3 ? 1 : 0) : x < 2.96 ? 0 : x < 3.2 ? gbSm((x - 2.96) / 0.24) : x < 3.9 ? 1 : 1 - gbSm((x - 3.9) / 0.1);
  E.ice = gbCl(E.cover * 1.15 - 0.1, 0, 1);
  // aurora: por noche, según estación
  const night = Math.floor((now + DAY_MS * 0.25) / DAY_MS); const roll = gbRng(night * 9973 + 5)(); const chance = [0.2, 0.06, 0.4, 0.75][sI];
  E.aurora = G.ov.weather === 'aurora' ? E.night : (roll < chance ? E.night * (1 - E.cloud * 0.9) * (1 - E.fog) : 0);
  if (G.ov.weather === 'aurora') { E.cloud = 0.05; E.rain = 0; E.snowing = false; }
  E.heat = k0 === 'clear' && sI === 1 && E.sunAlt > 0.4 ? 1 : 0;
  E.precip = E.snowing ? 'snow' : 'rain';
  return E;
}

/* ---------- animales ---------- */
function gbNewAnimal(sp, opts = {}) {
  const S = GB.SP[sp]; const nm = GB_NAMES[sp] || [S.name]; const a = { id: G.uid++, sp, name: gbPick(nm), x: opts.x != null ? opts.x : gbR(100, GBW - 100), y: 0, dir: Math.random() < 0.5 ? -1 : 1, state: 'idle', timer: gbR(1, 5), hunger: gbR(0.1, 0.55), thirst: gbR(0.05, 0.5), cool: gbR(0, 20), ph: Math.random() * 6, moving: false, running: false, hidden: false, age: opts.age == null ? 1 : opts.age, male: Math.random() < 0.5, tx: null, home: null, target: null, flying: false, col: null, chase: 0, wait: 0 };
  if (sp === 'rabbit') a.col = gbPick(['#d6c7b0', '#c9b79a', '#e6ddd0', '#bfae94']);
  if (sp === 'bird') a.col = gbPick(['#c4533e', '#4a87c9', '#e0a23a', '#7aa84a']);
  if (sp === 'fish') a.col = gbPick(['#e9a54b', '#cfd8e0', '#e07a5a']);
  const homes = S.home && S.home !== 'hollow' && S.home !== 'nest' ? gbHomesOf(S.home) : null;
  if (homes && homes.length) a.home = gbPick(homes);
  if (S.home === 'hollow') { const hs = G.trees.filter((t) => t.hollow); a.home = { kind: 'hollow', tree: gbPick(hs), x: 0 }; a.home.x = a.home.tree.x; }
  if (S.home === 'nest') { const hs = G.trees.filter((t) => t.nest); const t = gbPick(hs); const b = t.br[0]; a.home = { kind: 'nest', tree: t, x: t.x + b.dx, ny: b.dy }; }
  if (sp === 'wolf' || sp === 'fox' || sp === 'rabbit' || sp === 'deer') a.x = a.home ? a.home.x + gbR(-120, 120) : a.x;
  if (sp === 'bear') a.x = 420;
  if (sp === 'frog') a.x = Math.random() < 0.5 ? GB.lakeL - gbR(6, 40) : GB.lakeR + gbR(6, 40);
  if (sp === 'fish') { a.x = gbR(GB.lakeL + 40, GB.lakeR - 40); a.y = GB_WATER + gbR(16, 52); a.tx = a.x; }
  if (sp === 'eagle') { a.flying = true; a.x = gbR(600, 3800); a.y = gbR(140, 260); }
  if (sp === 'bird') { a.flying = false; const t = gbPick(G.trees); const b = gbPick(t.br); a.x = t.x + b.dx; a.perchY = GB.gy(t.x) - b.dy; a.y = a.perchY; a.state = 'perch'; }
  if (sp === 'owl') { a.flying = false; a.state = 'sleep'; a.hidden = true; a.x = a.home.x; }
  if (!['bird', 'eagle', 'fish', 'owl'].includes(sp)) { a.x = gbCl(a.x, 40, GBW - 40); if (gbInLake(a.x)) a.x = a.x < GB_LAKE_C ? GB.lakeL - 12 : GB.lakeR + 12; a.y = GB.gy(a.x); }
  return a;
}
function gbSpawnAll() { G.animals = []; for (const sp in GB.SP) for (let i = 0; i < GB.SP[sp].n; i++) G.animals.push(gbNewAnimal(sp)); }
const gbCount = (sp) => G.animals.filter((a) => a.sp === sp && !a.dead).length;
function gbLog(txt) { G.log.unshift({ t: Date.now(), txt }); if (G.log.length > 14) G.log.pop(); G.logDirty = true; }
const gbShoreOf = (x) => (x < GB_LAKE_C ? GB.lakeL - 8 : GB.lakeR + 8);
const gbNearestFood = (a, kinds, minAmt = 0.25) => { let best = null, bd = 1e9; for (const f of G.foods) { if (!kinds.includes(f.kind) || f.amt < minAmt) continue; if (f.kind === 'grass' && G.env.cover > 0.6 && f.amt < 0.5) continue; const d = Math.abs(f.x - a.x); if (d < bd) { bd = d; best = f; } } return best; };
const gbPoof = (x, y, col = '#ffffff', n = 10) => { for (let i = 0; i < n; i++) G.parts.puff.push({ x, y, vx: gbR(-40, 40), vy: gbR(-70, -10), l: gbR(0.5, 1), c: col }); };
const gbSplash = (x, y) => { for (let i = 0; i < 9; i++) G.parts.splash.push({ x, y, vx: gbR(-30, 30), vy: gbR(-90, -30), l: gbR(0.4, 0.8) }); };
function gbMove(a, dt, tx, speed) {
  const dx = tx - a.x; if (Math.abs(dx) < 2) { a.moving = false; a.running = false; return true; }
  const st = Math.min(Math.abs(dx), speed * dt); let nx = a.x + Math.sign(dx) * st; const canLake = a.sp === 'fish';
  if (!canLake && gbInLake(nx) && !gbInLake(a.x)) { a.moving = false; return true; }
  a.x = gbCl(nx, 30, GBW - 30); a.dir = Math.sign(dx); a.moving = true; a.running = speed > (GB.SP[a.sp].walk || 20) * 2; a.ph += speed * dt * (a.running ? 0.1 : 0.16);
  return false;
}
function gbFoodWord(a) { const s = GB.SP[a.sp]; return s.prey ? 'caza' : s.diet ? 'come' : ''; }
const gbPredatorsNear = (a, R) => G.animals.filter((o) => o !== a && !o.dead && !o.hidden && GB.SP[a.sp].fears && GB.SP[a.sp].fears.includes(o.sp) && o.state !== 'sleep' && o.state !== 'hib' && o.state !== 'eat' && Math.abs(o.x - a.x) < R);

function gbThinkWalker(a, dt, E) {
  const S = GB.SP[a.sp]; a.timer -= dt; a.cool -= dt;
  const hibr = S.hibernate && E.cold > 0.62; const stormy = E.rain > 0.55 || E.thunder > 0.2;
  const sleepy = S.pat === 'day' ? E.night > 0.62 : S.pat === 'night' ? E.night < 0.3 : S.pat === 'cre' ? E.sunAlt > 0.6 : false;
  const hgr = (E.cold > 0.5 ? 0.7 : 1) * (a.state === 'hib' ? 0.1 : 1);
  a.hunger = Math.min(1.2, a.hunger + S.hg * dt * hgr); a.thirst = Math.min(1.2, a.thirst + 0.007 * dt * (E.cold > 0.5 ? 0.6 : 1));
  a.moving = false; a.running = false;
  const homeX = a.home ? a.home.x : a.x;
  // --- dentro de casa
  if (a.hidden) {
    if (a.state === 'hib') { if (!hibr) { a.hidden = false; a.state = 'idle'; a.timer = 2; gbLog(`${S.name} ${a.name} despierta de su sueño de invierno.`); } return; }
    const threats = a.fear ? gbPredatorsNear({ ...a, x: homeX }, 260).length : 0; a.wait -= dt;
    if ((!sleepy && !stormy && !hibr && a.wait <= 0 && !threats) || (a.state === 'hide' && a.wait <= 0 && !threats && !sleepy && !stormy)) { a.hidden = false; a.state = 'idle'; a.timer = 1 + Math.random() * 3; a.fear = false; a.climbing = false; if (a.home && a.home.kind === 'hollow') a.y = GB.gy(a.x); }
    return;
  }
  // --- invernar
  if (hibr) { if (Math.abs(homeX - a.x) < 6 || a.sp === 'frog') { a.hidden = true; a.state = 'hib'; if (a.sp === 'frog') a.x = a.x; return; } a.state = 'go'; gbMove(a, dt, homeX, S.walk * 1.4); a.y = GB.gy(a.x); return; }
  // --- huir
  const thr = S.fears ? gbPredatorsNear(a, S.fearR) : [];
  if (thr.length && a.state !== 'flee' && a.state !== 'climb' && a.state !== 'perch') { a.state = 'flee'; a.timer = 6; a.fear = true; }
  if (a.state === 'flee') {
    let tx = homeX; if (a.sp === 'squirrel') { let bt = null, bd = 1e9; for (const t of G.trees) { const d = Math.abs(t.x - a.x); if (d < bd) { bd = d; bt = t; } } a.tree = bt; tx = bt.x; }
    else if (a.sp === 'deer') { const p = thr[0]; tx = a.x + (p ? Math.sign(a.x - p.x) : a.dir) * 260; tx = gbCl(tx, 60, GBW - 60); if (gbInLake(tx)) tx = gbShoreOf(a.x); }
    const done = gbMove(a, dt, tx, S.run); a.running = true; a.y = GB.gy(a.x);
    if (done || Math.abs(tx - a.x) < 8) {
      if (a.sp === 'squirrel') { a.state = 'climb'; a.climbing = true; a.dir = 1; }
      else if (a.sp === 'deer') { if (!gbPredatorsNear(a, S.fearR * 1.2).length) { a.state = 'idle'; a.timer = 3; a.fear = false; } }
      else { a.hidden = true; a.state = 'hide'; a.wait = 6 + Math.random() * 8; gbPoof(a.x, a.y - 4, '#8a7a64', 5); }
    }
    return;
  }
  if (a.state === 'climb') { const t = a.tree || G.trees[0]; const br = t.br[1] || t.br[0]; const topY = a.toHollow ? GB.gy(t.x) - t.h * 0.26 : GB.gy(t.x) - br.dy; a.climbing = true; a.x = t.x + 3; a.dir = 1; a.y -= 70 * dt; a.moving = true; a.ph += dt * 9; if (a.y <= topY) { a.y = topY; a.moving = false; if (a.toHollow) { a.toHollow = false; a.climbing = false; a.hidden = true; a.state = 'sleep'; a.wait = 8 + Math.random() * 10; } else { a.state = 'perch'; a.timer = 8 + Math.random() * 8; } } return; }
  if (a.state === 'perch') { a.climbing = false; a.timer -= 0; if (!thr.length && a.timer <= 0) { a.state = 'descend'; a.climbing = true; } return; }
  if (a.state === 'descend') { const gyx = GB.gy(a.x); a.y += 70 * dt; a.moving = true; a.ph += dt * 9; if (a.y >= gyx) { a.y = gyx; a.climbing = false; a.state = 'idle'; a.fear = false; a.timer = 2; } return; }
  a.y = GB.gy(a.x);
  // --- a casa por tormenta o sueño
  if ((stormy || sleepy) && !(a.state === 'hunt')) {
    if (S.home === 'thicket') { const hx = a.home.x; if (Math.abs(hx - a.x) > 10) { a.state = 'go'; gbMove(a, dt, hx, S.walk * 1.5); a.y = GB.gy(a.x); } else { a.state = 'rest'; } return; }
    if (S.home === 'hollow') { const hx = a.home.x; if (Math.abs(hx - a.x) > 6) { a.state = 'go'; gbMove(a, dt, hx, S.walk * 1.8); a.y = GB.gy(a.x); } else { a.state = 'climb'; a.tree = a.home.tree; a.toHollow = true; } return; }
    if (S.home && S.home !== 'nest') { if (Math.abs(homeX - a.x) > 6) { a.state = 'go'; gbMove(a, dt, homeX, S.walk * 1.5); a.y = GB.gy(a.x); } else { a.hidden = true; a.state = 'sleep'; a.wait = 8 + Math.random() * 10; } return; }
    if (a.sp === 'frog') { a.state = 'rest'; return; }
  }
  if (a.state === 'rest' && !stormy && !sleepy) { a.state = 'idle'; a.timer = 1; }
  // --- cazar
  if (S.prey && a.cool <= 0 && a.hunger > 0.5 && !stormy && !sleepy && a.state !== 'hunt' && a.state !== 'eat' && a.state !== 'fish') {
    let best = null, bd = 1e9; for (const o of G.animals) { if (o.dead || o.hidden || !S.prey.includes(o.sp) || o.sp === 'fish' || o.climbing || o.state === 'climb' || o.state === 'perch') continue; const d = Math.abs(o.x - a.x); if (d < S.sight && d < bd) { bd = d; best = o; } }
    if (best) { a.state = 'hunt'; a.target = best; a.chase = 0; }
  }
  if (a.state === 'hunt') {
    const t = a.target; if (!t || t.dead || t.hidden || t.climbing) { a.state = 'idle'; a.cool = 14; a.target = null; return; }
    a.chase += dt; gbMove(a, dt, t.x, S.run); a.running = true; a.y = GB.gy(a.x);
    if (Math.abs(t.x - a.x) < 14) { const chance = t.sp === 'deer' ? 0.28 : 0.5; if (Math.random() < chance) { t.dead = true; a.hunger = 0.02; a.state = 'eat'; a.timer = 7; a.cool = 70; gbPoof(t.x, t.y - 6, '#cdbba0', 12); gbLog(`${S.name} ${a.name} atrapó un ${GB.SP[t.sp].name.toLowerCase()}. Así se mantiene la cadena alimenticia.`); a.target = null; } else { a.cool = 18; a.state = 'idle'; t.fear = true; gbLog(`${GB.SP[t.sp].name} ${t.name} se escapó de ${S.name.toLowerCase() === 'zorro' ? 'el zorro' : 'el lobo'}.`); a.target = null; } }
    else if (a.chase > 7) { a.state = 'idle'; a.cool = 25; a.target = null; }
    return;
  }
  if (a.state === 'eat') { a.moving = false; if (a.timer <= 0) { a.state = 'idle'; a.timer = 2; } return; }
  // --- pescar (oso)
  if (a.state === 'fish') { a.moving = false; if (a.timer <= 0) { const fs = G.animals.filter((o) => o.sp === 'fish' && !o.dead && !o.hidden); if (fs.length && Math.random() < 0.55) { const f = gbPick(fs); f.dead = true; gbSplash(a.x + a.dir * 24, GB_WATER); a.hunger = Math.max(0, a.hunger - 0.5); gbLog(`${a.name} el oso atrapó un pez en el lago.`); } else gbSplash(a.x + a.dir * 24, GB_WATER); a.state = 'idle'; a.timer = 3; } return; }
  // --- beber y comer
  if (a.state === 'drink') { a.moving = false; a.thirst -= 0.22 * dt; if (a.thirst <= 0.02 || a.timer <= 0) { a.state = 'idle'; a.timer = 1.5; a.thirst = Math.max(0, a.thirst); } return; }
  if (a.state === 'graze') { a.moving = false; const f = a.food; if (!f || f.amt <= 0.05) { a.state = 'idle'; a.timer = 1; return; } f.amt = Math.max(0, f.amt - 0.05 * dt); a.hunger -= 0.12 * dt; if (a.hunger <= 0.05 || a.timer <= 0) { a.state = 'idle'; a.timer = 1.5; a.food = null; } return; }
  if (a.state === 'go') { const done = gbMove(a, dt, a.tx, S.walk * (a.thirst > 0.9 ? 1.5 : 1)); a.y = GB.gy(a.x); if (done || Math.abs(a.tx - a.x) < 3) { a.state = a.goal || 'idle'; a.timer = 4 + Math.random() * 3; if (a.state === 'drink') a.dir = a.x < GB_LAKE_C ? 1 : -1; if (a.state === 'fish') { a.dir = a.x < GB_LAKE_C ? 1 : -1; a.timer = 6 + Math.random() * 4; } a.goal = null; } return; }
  if (a.state === 'idle' && a.timer > 0) { return; }
  // --- decidir
  if (a.sp === 'frog') { if (a.timer <= 0) { const base = a.x < GB_LAKE_C ? GB.lakeL : GB.lakeR; a.tx = base + (a.x < GB_LAKE_C ? -1 : 1) * gbR(4, 50); a.state = 'go'; a.goal = 'idle'; a.timer = 2; } if (a.state === 'go') a.timer = 2; return; }
  if (a.thirst > 0.6 && S.diet !== undefined || (a.thirst > 0.6 && S.prey)) { a.tx = gbShoreOf(a.x); a.state = 'go'; a.goal = 'drink'; return; }
  if (a.hunger > 0.45) {
    if (a.sp === 'bear' && E.sI !== 3 && Math.random() < 0.6) { a.tx = gbShoreOf(a.x); a.state = 'go'; a.goal = 'fish'; return; }
    if (S.diet) { const f = gbNearestFood(a, S.diet); if (f) { a.food = f; a.tx = f.x + gbR(-4, 4); a.state = 'go'; a.goal = 'graze'; if (gbInLake(a.tx)) a.tx = gbShoreOf(a.x); return; } }
  }
  a.tx = gbCl(a.x + gbR(-380, 380), 60, GBW - 60); if (gbInLake(a.tx)) a.tx = gbShoreOf(a.x); a.state = Math.random() < 0.35 ? 'idle' : 'go'; a.goal = 'idle'; a.timer = a.state === 'idle' ? gbR(2, 6) : 3;
}
function gbThinkBird(a, dt, E) {
  const S = GB.SP[a.sp]; a.timer -= dt; a.hunger = Math.min(1.2, a.hunger + S.hg * dt); a.thirst = Math.min(1.2, a.thirst + 0.006 * dt);
  const stormy = E.rain > 0.5 || E.thunder > 0.2; const sleepy = E.night > 0.62;
  a.ph += dt * 6; a.moving = false;
  if (a.hidden) { a.wait -= dt; if (!stormy && !sleepy && a.wait <= 0) { a.hidden = false; a.state = 'perch'; a.x = a.home.x; a.perchY = GB.gy(a.home.tree.x) - a.home.ny; a.y = a.perchY; a.timer = 2; } return; }
  const flyTo = (tx, ty, sp = S.fly) => { const dx = tx - a.x, dy = ty - a.y; const d = Math.hypot(dx, dy); if (d < 4) return true; const st = Math.min(d, sp * dt); a.x += dx / d * st; a.y += dy / d * st + Math.sin(a.ph) * 0.3; a.dir = dx >= 0 ? 1 : -1; a.flying = true; a.moving = true; return false; };
  if ((stormy || sleepy) && a.state !== 'tonest') { a.state = 'tonest'; }
  if (a.state === 'tonest') { const hx = a.home.x, hy = GB.gy(a.home.tree.x) - a.home.ny; if (flyTo(hx, hy)) { a.hidden = true; a.flying = false; a.state = 'sleep'; a.wait = 8 + Math.random() * 10; } return; }
  if (a.state === 'perch') { a.flying = false; a.y = a.perchY != null ? a.perchY : a.y; if (a.timer <= 0) { if (a.thirst > 0.6) { a.state = 'fly'; a.goal = 'drink'; a.fx = gbShoreOf(a.x) + gbR(-6, 6); a.fy = GB_WATER - 6; } else if (a.hunger > 0.45) { const f = gbNearestFood(a, ['grass'], 0.3); if (f) { a.state = 'fly'; a.goal = 'peck'; a.fx = f.x; a.fy = GB.gy(f.x) - 3; a.food = f; } else a.timer = 3; } else { const t = gbPick(G.trees); const b = gbPick(t.br); a.state = 'fly'; a.goal = 'perch'; a.fx = t.x + b.dx; a.fy = GB.gy(t.x) - b.dy; a.pTree = t; } } return; }
  if (a.state === 'fly') { if (flyTo(a.fx, a.fy)) { a.flying = false; a.state = a.goal; a.timer = a.goal === 'perch' ? gbR(6, 18) : gbR(3, 5); if (a.goal === 'perch') a.perchY = a.fy; a.dir = Math.random() < 0.5 ? 1 : -1; } return; }
  if (a.state === 'peck') { a.flying = false; const f = a.food; if (f && f.amt > 0.05) { f.amt = Math.max(0, f.amt - 0.015 * dt); a.hunger -= 0.14 * dt; } if (a.timer <= 0 || a.hunger < 0.05) { a.state = 'perch'; a.timer = 0.5; const t = gbPick(G.trees); const b = gbPick(t.br); a.state = 'fly'; a.goal = 'perch'; a.fx = t.x + b.dx; a.fy = GB.gy(t.x) - b.dy; } return; }
  if (a.state === 'drink') { a.flying = false; a.thirst -= 0.25 * dt; if (a.timer <= 0 || a.thirst < 0.03) { a.thirst = Math.max(0, a.thirst); const t = gbPick(G.trees); const b = gbPick(t.br); a.state = 'fly'; a.goal = 'perch'; a.fx = t.x + b.dx; a.fy = GB.gy(t.x) - b.dy; } return; }
  a.state = 'perch'; a.timer = 2;
}
function gbThinkEagle(a, dt, E) {
  const S = GB.SP[a.sp]; a.timer -= dt; a.cool -= dt; a.hunger = Math.min(1.2, a.hunger + S.hg * dt); a.ph += dt * 3; a.flying = true; a.moving = true;
  const stormy = E.rain > 0.5 || E.thunder > 0.2; const sleepy = E.night > 0.6;
  const fly = (tx, ty, sp) => { const dx = tx - a.x, dy = ty - a.y; const d = Math.hypot(dx, dy); if (d < 5) return true; const st = Math.min(d, sp * dt); a.x += dx / d * st; a.y += dy / d * st; a.dir = dx >= 0 ? 1 : -1; return false; };
  a.diving = false;
  if (a.hidden) { if (!sleepy && !stormy) { a.hidden = false; a.state = 'soar'; a.timer = 5; } return; }
  if (stormy || sleepy) { a.state = 'home'; }
  if (a.state === 'home') { if (fly(a.home.x, GB.gy(a.home.x) - 235, S.fly * 1.4)) { a.hidden = true; a.state = 'sleep'; a.flying = false; } return; }
  if (a.state === 'perch') { a.flying = false; a.moving = false; a.x = a.home.x - 6; a.y = GB.gy(a.home.x) - 236; if (a.timer <= 0) { a.state = 'soar'; a.timer = 4; } return; }
  if (a.state === 'dive') { a.diving = true; const t = a.target; if (!t || t.dead || t.hidden || (t.sp === 'fish' && E.ice > 0.5)) { a.state = 'soar'; a.timer = 4; a.cool = 12; return; } const ty = t.sp === 'fish' ? GB_WATER + 2 : t.y - 6; if (fly(t.x, ty, 210)) { if (Math.random() < (t.sp === 'fish' ? 0.35 : 0.4)) { t.dead = true; a.hunger = 0; if (t.sp === 'fish') gbSplash(t.x, GB_WATER); else gbPoof(t.x, t.y - 6, '#cdbba0', 10); gbLog(`El águila ${a.name} atrapó un ${GB.SP[t.sp].name.toLowerCase()}.`); a.state = 'perch'; a.timer = 18; a.cool = 80; } else { a.state = 'soar'; a.timer = 4; a.cool = 15; } } return; }
  // planear
  if (a.state !== 'soar') { a.state = 'soar'; a.timer = 3; }
  if (a.tx == null || a.timer <= 0) { a.tx = gbR(300, GBW - 300); a.ty = gbR(130, 280); a.timer = gbR(6, 14); }
  fly(a.tx, a.ty + Math.sin(G.tm * 0.0006 + a.id) * 18, S.fly);
  if (a.hunger > 0.5 && a.cool <= 0 && E.sunAlt > 0.05) { let best = null, bd = 1e9; for (const o of G.animals) { if (o.dead || o.hidden || !S.prey.includes(o.sp)) continue; if (o.sp === 'fish' && (E.ice > 0.4 || (o.jumping == null && Math.random() < 0.9))) continue; if (o.sp === 'rabbit' && (o.state === 'hide')) continue; const d = Math.abs(o.x - a.x); if (d < 520 && d < bd) { bd = d; best = o; } } if (best) { a.state = 'dive'; a.target = best; } }
}
function gbThinkOwl(a, dt, E) {
  const S = GB.SP[a.sp]; a.timer -= dt; a.hunger = Math.min(1.2, a.hunger + S.hg * dt); a.ph += dt * 5; a.moving = false;
  const awake = E.night > 0.5 && E.rain < 0.6 && E.thunder < 0.2;
  const fly = (tx, ty, sp) => { const dx = tx - a.x, dy = ty - a.y; const d = Math.hypot(dx, dy); if (d < 4) return true; const st = Math.min(d, sp * dt); a.x += dx / d * st; a.y += dy / d * st; a.dir = dx >= 0 ? 1 : -1; a.flying = true; a.moving = true; return false; };
  const hx = a.home.x, hy = GB.gy(hx) - a.home.tree.h * 0.26;
  if (a.hidden) { if (awake) { a.hidden = false; a.x = hx; a.y = hy; a.state = 'patrol'; a.timer = 4; a.flying = true; } return; }
  if (!awake) { if (fly(hx, hy, S.fly * 1.3)) { a.hidden = true; a.state = 'sleep'; a.flying = false; } return; }
  if (a.state === 'perchO') { a.flying = false; if (a.timer <= 0) { a.state = 'patrol'; a.timer = 3; } return; }
  if (a.state === 'catch') { if (fly(a.fx, a.fy, 150)) { if (Math.random() < 0.55) { a.hunger = 0.05; gbLog(`El búho ${a.name} atrapó un ratón en la noche.`); gbPoof(a.fx, a.fy, '#cdbba0', 6); } a.state = 'perchO'; a.timer = 5; a.tx = null; } return; }
  if (a.tx == null || a.timer <= 0) { a.tx = gbR(200, GBW - 200); a.ty = gbR(300, 470); a.timer = gbR(5, 12); }
  if (a.hunger > 0.5 && Math.random() < dt * 0.15) { a.state = 'catch'; a.fx = gbCl(a.x + gbR(-200, 200), 60, GBW - 60); a.fy = GB.gy(a.fx) - 6; }
  else { a.state = 'patrol'; fly(a.tx, a.ty, S.fly); }
}
function gbThinkFish(a, dt, E) {
  a.hidden = E.ice > 0.5; if (a.hidden) return; a.ph += dt * 5; a.moving = true; a.flying = false;
  if (a.jumping != null) { a.jumping += dt * 1.3; const k = a.jumping; a.y = GB_WATER - Math.sin(Math.min(1, k) * Math.PI) * 30; a.x += a.dir * 30 * dt; if (k >= 1) { a.jumping = null; a.y = GB_WATER + 18; gbSplash(a.x, GB_WATER); a.x = gbCl(a.x, GB.lakeL + 30, GB.lakeR - 30); } return; }
  if (Math.abs(a.tx - a.x) < 4 || a.timer <= 0) { a.tx = gbR(GB.lakeL + 40, GB.lakeR - 40); a.ty = GB_WATER + gbR(16, 56); a.timer = gbR(3, 8); }
  a.timer -= dt; const dx = a.tx - a.x; a.x += Math.sign(dx) * Math.min(Math.abs(dx), 22 * dt); a.dir = Math.sign(dx) || a.dir; a.y += (a.ty - a.y) * Math.min(1, dt * 0.8);
  if (E.sunAlt > 0 && E.rain < 0.6 && Math.random() < dt * 0.025 && a.y < GB_WATER + 30) { a.jumping = 0; gbSplash(a.x, GB_WATER); }
}

/* ---------- ciclo de vida: nacimientos y llegadas ---------- */
function gbPopulation(E) {
  for (const sp in GB.SP) {
    const S = GB.SP[sp]; const n = gbCount(sp);
    if (n < Math.ceil(S.n * 0.6)) { const edge = Math.random() < 0.5 ? 60 : GBW - 60; const a = gbNewAnimal(sp, { x: edge }); if (sp === 'fish') { a.x = gbR(GB.lakeL + 40, GB.lakeR - 40); } if (sp === 'bear') a.x = 420; G.animals.push(a); if (sp !== 'fish') gbLog(`Llegó ${sp === 'rabbit' || sp === 'deer' || sp === 'bear' || sp === 'wolf' || sp === 'fox' ? 'un' : 'una'} ${S.name.toLowerCase()} ${sp === 'bird' ? 'desde el cielo' : 'a vivir en el bosque'}.`); continue; }
    if (n < S.max && (E.sI <= 1) && E.cold < 0.3 && Math.random() < 0.12) {
      const parents = G.animals.filter((o) => o.sp === sp && !o.dead && o.age >= 1 && o.hunger < 0.5); if (parents.length >= 2) { const p = gbPick(parents); const b = gbNewAnimal(sp, { x: p.x, age: 0 }); b.age = 0; if (b.home && ['rabbit', 'deer', 'squirrel', 'fox', 'wolf'].includes(sp)) G.animals.push(b); else if (sp === 'frog' || sp === 'fish' || sp === 'bird') G.animals.push(b); if (['rabbit', 'deer', 'fox', 'wolf', 'squirrel', 'bird'].includes(sp)) gbLog(`Nació ${sp === 'rabbit' || sp === 'deer' || sp === 'fox' || sp === 'wolf' ? 'un' : 'una'} ${sp === 'rabbit' ? 'conejito' : sp === 'deer' ? 'cervatillo' : sp === 'fox' ? 'zorrito' : sp === 'wolf' ? 'lobezno' : sp === 'squirrel' ? 'ardillita' : 'pajarito'}.`); }
    }
  }
}

/* ---------- actualización ---------- */
function gbUpdate(dt) {
  const E = gbEnv(); G.tm += dt * 1000;
  // comida: crece según la estación
  const grow = [0.012, 0.01, 0.006, 0.001][E.sI] * (E.rain > 0.1 ? 1.5 : 1);
  for (const f of G.foods) {
    if (f.kind === 'grass') f.amt = Math.min(1, f.amt + grow * dt);
    else if (f.kind === 'berry') f.amt = E.sI === 1 || E.sI === 2 ? Math.min(1, f.amt + 0.006 * dt) : E.sI === 3 ? Math.max(0, f.amt - 0.02 * dt) : Math.min(0.6, f.amt + 0.003 * dt);
    else if (f.kind === 'nut') f.amt = E.sI === 2 ? Math.min(1, f.amt + 0.01 * dt) : E.sI === 3 ? Math.max(0.1, f.amt - 0.002 * dt) : Math.max(0, f.amt - 0.004 * dt);
  }
  for (const a of G.animals) {
    if (a.dead) continue;
    if (a.age < 1) a.age = Math.min(1, a.age + dt / 160);
    try { if (a.sp === 'bird') gbThinkBird(a, dt, E); else if (a.sp === 'eagle') gbThinkEagle(a, dt, E); else if (a.sp === 'owl') gbThinkOwl(a, dt, E); else if (a.sp === 'fish') gbThinkFish(a, dt, E); else gbThinkWalker(a, dt, E); } catch (e) { a.state = 'idle'; a.hidden = false; }
    if (a.sp !== 'bird' && a.sp !== 'eagle' && a.sp !== 'owl' && a.sp !== 'fish' && !a.climbing && a.state !== 'climb' && a.state !== 'perch' && a.state !== 'descend') a.y = GB.gy(a.x);
  }
  G.animals = G.animals.filter((a) => !a.dead || (G.sel && G.sel.id === a.id && (G.sel = null, false)));
  G.pop = (G.pop || 0) + dt; if (G.pop > 12) { G.pop = 0; gbPopulation(E); }
  // relámpagos
  if (E.thunder > 0.3) { G.nextBolt = (G.nextBolt || 3) - dt * E.thunder; if (G.nextBolt <= 0) { G.nextBolt = gbR(3, 9); gbStrike(); } }
  GB.flash.a = Math.max(0, GB.flash.a - dt * 2.4); if (GB.bolt) { GB.bolt.life -= dt; if (GB.bolt.life <= 0) GB.bolt = null; }
  if (E.night > 0.6 && E.cloud < 0.5 && !GB.shoot && Math.random() < dt * 0.08) GB.shoot = { x: gbR(100, 700), y: gbR(20, 160), vx: gbR(260, 420), vy: gbR(80, 160), life: 1 };
  if (GB.shoot) { GB.shoot.x += GB.shoot.vx * dt; GB.shoot.y += GB.shoot.vy * dt; GB.shoot.life -= dt * 1.1; if (GB.shoot.life <= 0) GB.shoot = null; }
  // cámara
  const vw = G.vw || 400;
  if (G.follow) { const a = G.animals.find((o) => o.id === G.follow); if (a && !a.hidden) G.camT = a.x - vw / 2; else if (!a) G.follow = null; }
  else if (G.auto && !G.drag) { G.camT = (G.camT == null ? G.cam : G.camT) + G.autoDir * 14 * dt; if (G.camT > GBW - vw) { G.camT = GBW - vw; G.autoDir = -1; } if (G.camT < 0) { G.camT = 0; G.autoDir = 1; } }
  if (G.camT != null) { G.camT = gbCl(G.camT, 0, Math.max(0, GBW - vw)); G.cam += (G.camT - G.cam) * Math.min(1, dt * (G.follow ? 2.6 : 5)); }
  gbParticles(dt, E);
}
function gbStrike() {
  const vw = G.vw || 400; const x = G.cam + gbR(0.1, 0.9) * vw - G.cam; const wx = G.cam + x; const pts = [[x, (G.top || 0) + 60]]; let y = (G.top || 0) + 60, cx = x; while (y < GB.gy(wx)) { y += gbR(30, 60); cx += gbR(-26, 26); pts.push([cx, Math.min(y, GB.gy(wx))]); }
  const br = []; for (let i = 2; i < pts.length - 1; i += 2) { const b = [pts[i]]; let bx = pts[i][0], by = pts[i][1]; for (let k = 0; k < 3; k++) { bx += gbR(10, 30) * (Math.random() < 0.5 ? -1 : 1); by += gbR(15, 30); b.push([bx, by]); } br.push(b); }
  GB.bolt = { pts, br, life: 0.28 }; GB.flash.a = 1; G.thunderAt = Date.now() + gbR(600, 2500); gbSnd.thunder(G.thunderAt - Date.now());
  for (const a of G.animals) if (!a.hidden && !a.dead && a.sp !== 'fish' && GB.SP[a.sp].fears && Math.abs(a.x - wx) < 300 && a.state !== 'flee' && a.state !== 'climb' && a.state !== 'perch') { a.state = 'flee'; a.timer = 5; a.fear = true; }
}
function gbParticles(dt, E) {
  const P = G.parts, vw = G.vw || 400, H = GBH, q = G.q, tp = G.top || 0; const wind = E.wind * 160 + (E.sI === 2 ? 20 : 0);
  const rainN = E.snowing ? 0 : Math.round(E.rain * 280 * q); while (P.rain.length < rainN) P.rain.push({ x: gbR(-100, vw + 100), y: gbR(tp - 40, H), v: gbR(560, 760), l: gbR(9, 16) });
  if (P.rain.length > rainN) P.rain.length = rainN;
  for (const d of P.rain) { d.y += d.v * dt; d.x += (wind * 0.8 + 40) * dt; if (d.y > H) { d.y = gbR(tp - 40, tp - 5); d.x = gbR(-100, vw + 100); } }
  const snowN = E.snowing ? Math.round((0.25 + E.rain) * 240 * q) : 0; while (P.snow.length < snowN) P.snow.push({ x: gbR(-100, vw + 100), y: gbR(tp - 40, H), r: gbR(1, 3.2), v: gbR(30, 70), p: Math.random() * 6 });
  if (P.snow.length > snowN) P.snow.length = snowN;
  for (const f of P.snow) { f.y += f.v * (0.7 + E.wind) * dt; f.x += (Math.sin(G.tm * 0.001 + f.p) * 18 + wind * (0.8 + E.rain * 0.8)) * dt; if (f.y > H) { f.y = gbR(tp - 40, tp - 5); f.x = gbR(-100, vw + 100); } if (f.x > vw + 100) f.x = -100; }
  const leafN = Math.round(((E.sI === 2 ? 26 : 0) + (E.sI === 0 && E.sT === 0 ? 20 : 0)) * (0.4 + E.wind * 1.5) * q * (E.rain > 0.5 ? 0.3 : 1) * (E.sI === 1 || E.sI === 3 ? 0 : 1)); while (P.leaf.length < leafN) P.leaf.push({ x: gbR(-100, vw + 100), y: gbR(tp - 30, H * 0.8), v: gbR(20, 50), p: Math.random() * 6, r: gbR(2.4, 4.4), c: E.sI === 2 ? gbPick(['#d9822b', '#c8422b', '#e4b13e', '#b5651d']) : gbPick(['#f4bdd0', '#fbd6e2', '#f7c6d8']) });
  if (P.leaf.length > leafN) P.leaf.length = leafN;
  for (const f of P.leaf) { f.y += f.v * dt; f.x += (Math.sin(G.tm * 0.0012 + f.p) * 26 + wind * 0.9 + 12) * dt; f.rot = (f.rot || 0) + dt * 2; if (f.y > H * 0.93 || f.x > vw + 100) { f.y = gbR(tp - 30, tp - 5); f.x = gbR(-100, vw + 100); } }
  const fireN = E.night > 0.45 && E.sI <= 1 && E.rain < 0.3 ? Math.round(34 * q) : 0; while (P.fly.length < fireN) { const b = gbPick(G.bushes); P.fly.push({ x: b.x + gbR(-60, 60), y: GB.gy(b.x) - gbR(10, 80), p: Math.random() * 6, v: gbR(0.0004, 0.0012) }); }
  if (P.fly.length > fireN) P.fly.length = fireN;
  for (const f of P.fly) { f.x += Math.sin(G.tm * f.v + f.p) * 8 * dt; f.y += Math.cos(G.tm * f.v * 1.3 + f.p) * 6 * dt; }
  const bN = E.sunAlt > 0.1 && E.sI <= 1 && E.rain < 0.15 && E.wind < 0.6 ? Math.round(8 * q) : 0; while (P.bfly.length < bN) P.bfly.push({ x: gbR(0, GBW), y: gbR(470, 560), p: Math.random() * 6, c: gbPick(['#f2a03a', '#6fa8f0', '#f08fb4', '#f2e04a']), v: gbR(0.0005, 0.0011) });
  if (P.bfly.length > bN) P.bfly.length = bN;
  for (const f of P.bfly) { f.x += Math.sin(G.tm * f.v + f.p) * 22 * dt + 6 * dt; f.y += Math.cos(G.tm * f.v * 1.7 + f.p) * 14 * dt; f.y = gbCl(f.y, 440, 570); if (f.x > GBW) f.x = 0; }
  for (const arr of [P.splash, P.puff]) for (let i = arr.length - 1; i >= 0; i--) { const p = arr[i]; p.l -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 220 * dt; if (p.l <= 0) arr.splice(i, 1); }
}

/* ---------- dibujo de cada cuadro ---------- */
function gbFrame(time) {
  const cv = G.cv, c = G.ctx; if (!cv) return;
  const E = G.env || gbEnv(); let k = cv.width / 760, Hv = cv.height / k; if (Hv > 720) { k = cv.height / 720; Hv = 720; } else if (Hv < 600) { k = cv.height / 600; Hv = 600; }
  const W = cv.width / k; G.vw = W; G.hv = Hv; GB.top = GBH - Hv; G.top = GB.top; const cam = G.cam;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.setTransform(k, 0, 0, k, 0, (Hv - GBH) * k);
  gbDrawSky(c, W, GBH, E); gbDrawStars(c, W, E, time); gbDrawSunMoon(c, W, E); gbDrawAurora(c, W, E, time); gbDrawRainbow(c, W, E); gbDrawClouds(c, W, E, time, cam); gbDrawMountains(c, W, cam, E);
  // bosque lejano
  c.save(); c.translate(-cam * 0.62, 0); c.globalAlpha = 0.55; for (const t of G.backTrees) { const sx = t.x - cam * 0.62; if (sx < -60 || sx > W + 60) continue; gbDrawTree(c, { ...t, y: 0 }, E, time, true); } c.globalAlpha = 1; c.restore();
  gbDrawGround(c, W, cam, E);
  c.save(); c.translate(-cam, 0); gbDrawLake(c, W + cam, 0, E, time);
  const vis = (x, m = 80) => x > cam - m && x < cam + W + m;
  gbDrawRockMounds(c, E); for (const h of G.homes) if (vis(h.x, 120)) gbDrawHome(c, h, E, time);
  for (const m of G.mush) if (vis(m.x)) gbDrawMush(c, m, E);
  for (const b of G.bushes) if (vis(b.x)) gbDrawBush(c, b, E, time);
  for (const f of G.foods) if (f.kind === 'grass' && vis(f.x)) gbDrawGrass(c, f, E, time);
  // árboles de atrás hacia adelante; los animales que trepan se dibujan encima de su árbol
  for (const t of G.trees) { if (!vis(t.x, 140)) continue; gbDrawTree(c, t, E, time, false); if (t.nest) gbDrawNest(c, t.x + t.br[0].dx, GB.gy(t.x) - t.br[0].dy); }
  // animales
  const list = G.animals.filter((a) => !a.hidden && !a.dead && vis(a.x, 70)).sort((p, q2) => (p.sp === 'fish') - (q2.sp === 'fish') || p.y - q2.y);
  for (const a of list) { if (a.sp === 'fish' && a.jumping == null) { gbDrawAnimal(c, a, E, time); continue; } gbDrawAnimal(c, a, E, time); }
  for (const a of G.animals) if (a.hidden && (a.state === 'sleep' || a.state === 'hib') && a.home && vis(a.home.x)) { const hx = a.home.x, hy = a.home.kind === 'hollow' ? GB.gy(hx) - a.home.tree.h * 0.26 : a.home.kind === 'nest' ? GB.gy(a.home.tree.x) - a.home.ny : GB.gy(hx) - 14; c.fillStyle = 'rgba(255,255,255,.85)'; c.font = '600 11px system-ui'; const z = (time * 0.002 + a.id) % 3; c.globalAlpha = 1 - z / 3; c.fillText('z', hx + 6 + z * 3, hy - 6 - z * 7); c.globalAlpha = 1; }
  // luciérnagas y mariposas
  const P = G.parts;
  for (const f of P.bfly) if (vis(f.x)) { const fl = Math.abs(Math.sin(time * 0.012 + f.p)); c.fillStyle = f.c; c.beginPath(); c.ellipse(f.x - 2, f.y, 3.4 * fl + 0.6, 4, -0.4, 0, 6.3); c.ellipse(f.x + 2, f.y, 3.4 * fl + 0.6, 4, 0.4, 0, 6.3); c.fill(); }
  c.restore();
  // noche: oscurece la escena y deja brillar lo cálido
  if (E.night > 0.02) { c.fillStyle = `rgba(8,16,46,${E.night * 0.5})`; c.fillRect(0, GB.top, W, GBH - GB.top); }
  const dusk = Math.max(0, 1 - Math.abs(E.sunAlt) / 0.18) * (1 - E.cloud * 0.6); if (dusk > 0.03) { c.fillStyle = `rgba(255,150,90,${dusk * 0.13})`; c.fillRect(0, GB.top, W, GBH - GB.top); }
  if (E.night > 0.2) { c.save(); c.globalCompositeOperation = 'lighter'; c.translate(-cam, 0); for (const f of P.fly) if (vis(f.x)) { const tw = 0.55 + 0.45 * Math.sin(time * 0.004 + f.p * 3); const g = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, 9); g.addColorStop(0, `rgba(255,240,150,${0.85 * tw * E.night})`); g.addColorStop(1, 'rgba(255,240,150,0)'); c.fillStyle = g; c.fillRect(f.x - 9, f.y - 9, 18, 18); } c.restore(); }
  gbDrawFog(c, W, GBH, E, time);
  // partículas de clima
  if (P.rain.length) { c.strokeStyle = 'rgba(200,220,245,.55)'; c.lineWidth = 1.2; c.beginPath(); const sl = (E.wind * 0.8 * 160 + 40) / 700; for (const d of P.rain) { c.moveTo(d.x, d.y); c.lineTo(d.x - d.l * sl, d.y - d.l); } c.stroke(); }
  if (P.snow.length) { c.fillStyle = 'rgba(255,255,255,.9)'; for (const f of P.snow) { c.beginPath(); c.arc(f.x, f.y, f.r, 0, 6.3); c.fill(); } }
  for (const f of P.leaf) { c.fillStyle = f.c; c.save(); c.translate(f.x, f.y); c.rotate(f.rot || 0); c.beginPath(); c.ellipse(0, 0, f.r, f.r * 0.55, 0, 0, 6.3); c.fill(); c.restore(); }
  c.save(); c.translate(-cam, 0); for (const p of P.puff) { c.globalAlpha = Math.max(0, p.l); c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, 2.4, 0, 6.3); c.fill(); } c.fillStyle = '#e8f6ff'; for (const p of P.splash) { c.globalAlpha = Math.max(0, p.l * 1.4); c.beginPath(); c.arc(p.x, p.y, 1.8, 0, 6.3); c.fill(); } c.globalAlpha = 1; c.restore();
  if (E.heat) { c.globalAlpha = 0.06; c.fillStyle = '#ffd98a'; c.fillRect(0, GB.top, W, GBH - GB.top); c.globalAlpha = 1; }
  gbDrawLightning(c, W, GBH, E);
  // primer plano suave
  c.fillStyle = gbPal('grassB', E); c.globalAlpha = 0.9; c.beginPath(); c.moveTo(0, GBH); for (let x = 0; x <= W; x += 12) { const wx = x + cam * 1.25; c.lineTo(x, 688 + Math.sin(wx * 0.03) * 5 + Math.sin(wx * 0.011) * 7); } c.lineTo(W, GBH); c.closePath(); c.fill(); c.globalAlpha = 1;
  c.strokeStyle = gbPal('grassA', E); c.lineWidth = 2; c.beginPath(); for (let x = 0; x < W; x += 9) { const wx = x + cam * 1.25; const y = 690 + Math.sin(wx * 0.03) * 5 + Math.sin(wx * 0.011) * 7; const sw = Math.sin(time * 0.002 + wx) * (2 + E.wind * 5); c.moveTo(x, y + 4); c.lineTo(x + sw, y - 9 - ((wx | 0) % 3) * 3); } c.stroke();
}

/* ---------- sonido ambiente (opcional) ---------- */
const gbSnd = (() => {
  let ac = null, nodes = null; const noise = (ctx) => { const b = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
  const make = (type, f, q) => { const s = ac.createBufferSource(); s.buffer = noise(ac); s.loop = true; const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q; const g = ac.createGain(); g.gain.value = 0; s.connect(fl); fl.connect(g); g.connect(ac.destination); s.start(); return { g, fl }; };
  return {
    on() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); if (!nodes) nodes = { rain: make('bandpass', 3200, 0.7), wind: make('lowpass', 420, 0.8), water: make('lowpass', 900, 0.5) }; return true; } catch { return false; } },
    off() { if (nodes) for (const k in nodes) nodes[k].g.gain.setTargetAtTime(0, ac.currentTime, 0.2); },
    update(E) { if (!nodes || !G.sound) return; const t = ac.currentTime; nodes.rain.g.gain.setTargetAtTime(E.snowing ? 0.015 * E.rain : 0.09 * E.rain, t, 0.5); nodes.wind.g.gain.setTargetAtTime(0.02 + 0.12 * E.wind, t, 0.7); nodes.water.g.gain.setTargetAtTime(E.ice > 0.5 ? 0 : 0.012, t, 0.7); if (E.sunAlt > 0.1 && E.rain < 0.3 && Math.random() < 0.02) this.chirp(); if (E.night > 0.6 && E.sI < 3 && E.rain < 0.3 && Math.random() < 0.03) this.cricket(); },
    chirp() { if (!ac) return; const t = ac.currentTime; const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; const f = 2200 + Math.random() * 1400; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.4, t + 0.08); o.frequency.exponentialRampToValueAtTime(f * 0.9, t + 0.18); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.025, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.25); },
    cricket() { if (!ac) return; const t = ac.currentTime; for (let i = 0; i < 3; i++) { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = 4300; g.gain.setValueAtTime(0, t + i * 0.09); g.gain.linearRampToValueAtTime(0.012, t + i * 0.09 + 0.02); g.gain.linearRampToValueAtTime(0, t + i * 0.09 + 0.06); o.connect(g); g.connect(ac.destination); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 0.08); } },
    thunder(delay) { if (!ac || !G.sound) return; const t = ac.currentTime + Math.max(0, delay) / 1000; const s = ac.createBufferSource(); s.buffer = noise(ac); const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 160; const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.4, t + 0.15); g.gain.exponentialRampToValueAtTime(0.001, t + 3); s.connect(fl); fl.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + 3.2); },
  };
})();

/* ---------- interfaz ---------- */
const GB_STATE_TXT = { idle: 'Mirando el paisaje', go: 'Paseando', graze: 'Comiendo', drink: 'Bebiendo agua', flee: 'Huyendo', hunt: 'Cazando', eat: 'Comiendo su presa', fish: 'Pescando en el lago', rest: 'Descansando', sleep: 'Durmiendo', hib: 'Hibernando', hide: 'Escondido en su madriguera', climb: 'Trepando al árbol', perch: 'Descansando en una rama', descend: 'Bajando del árbol', fly: 'Volando', peck: 'Picoteando semillas', tonest: 'Volviendo al nido', soar: 'Planeando sobre el bosque', dive: 'En picada', home: 'Volviendo a su nido', patrol: 'Vigilando la noche', perchO: 'Posado en una rama', catch: 'Cazando en silencio' };
const GB_DIET = { rabbit: 'Come pasto. Lo cazan zorros, lobos y águilas.', deer: 'Pasta en el prado. Solo el lobo lo caza.', squirrel: 'Junta nueces y bayas. Sube a los árboles para escapar.', bird: 'Picotea semillas y bebe del lago. Anida en los árboles.', fox: 'Caza conejos y ardillas al amanecer y al atardecer.', wolf: 'Caza venados y conejos, sobre todo de noche.', eagle: 'Pesca en el lago y caza conejos desde el aire.', owl: 'Caza ratones de noche. Duerme en un hueco de árbol.', bear: 'Come bayas y pesca. En invierno hiberna en su cueva.', frog: 'Vive junto al lago. En invierno se entierra.', fish: 'Nada en el lago. En invierno se esconde bajo el hielo.' };
const GB_KIND_TXT = { clear: 'Despejado', cloudy: 'Nublado', drizzle: 'Llovizna', rain: 'Lluvia', storm: 'Tormenta eléctrica', fog: 'Niebla', wind: 'Viento', snow: 'Nevada', blizzard: 'Tormenta de nieve', rainbow: 'Sol y lluvia: arcoíris', petals: 'Brisa con pétalos' };
const gbMMSS = (ms) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
function gbTimeName(E) { const a = E.sunAlt; if (a > 0.5) return 'Mediodía'; if (a > 0.1) return E.p < 0.25 ? 'Mañana' : 'Tarde'; if (a > -0.1) return E.p < 0.5 ? 'Amanecer' : 'Atardecer'; return E.p > 0.5 && E.p < 0.97 ? 'Noche' : 'Madrugada'; }
function gbWeatherText(E) { let t = GB_KIND_TXT[E.kind] || 'Despejado'; if (E.snowing && E.kind === 'rain') t = 'Nevada'; if (E.snowing && E.kind === 'drizzle') t = 'Nieve ligera'; if (E.snowing && E.kind === 'storm') t = 'Ventisca'; if (E.aurora > 0.25) t = 'Aurora boreal'; return t; }
function viewGranBosque() {
  if (typeof calmOn === 'function' && calmOn()) return `<h1 class="h1">El Gran Bosque</h1><p class="sub">Este espacio se oculta en el modo «Sin ruido visual». Puedes apagarlo en Ajustes cuando quieras verlo.</p>`;
  setTimeout(gbStart, 0);
  const chip = (grp, v, l, on) => `<button type="button" class="gb-chip" data-act="gb-ov" data-g="${grp}" data-v="${v}" aria-pressed="${on}">${l}</button>`;
  const ov = G.ov;
  return `<div class="gb-page">
    <h1 class="h1">El Gran Bosque</h1><p class="sub">Un bosque que vive solo: las estaciones cambian cada 30 minutos y todos ven el mismo cielo.</p>
    <div class="gb-wrap" id="gbWrap"><canvas id="gbCv" role="img" aria-label="El Gran Bosque: paisaje vivo con animales, clima y estaciones"></canvas>
      <div class="gb-hud"><span class="gb-badge" id="gbSeason">…</span><span class="gb-badge" id="gbWeather">…</span></div>
      <div class="gb-tools"><button type="button" class="gb-ib" data-act="gb-pause" id="gbPauseB" aria-label="Pausar">${G.paused ? '▶' : '❚❚'}</button><button type="button" class="gb-ib" data-act="gb-sound" id="gbSoundB" aria-pressed="${G.sound}" aria-label="Sonido del bosque">♪</button><button type="button" class="gb-ib" data-act="gb-full" aria-label="Pantalla completa">⤢</button></div>
      <div class="gb-card" id="gbCard" hidden></div></div>
    <p class="tiny faint gb-hint">Arrastra para recorrer el bosque. Toca un animal para seguirlo.</p>
    <div class="gb-ctl"><b class="tiny">Estación</b><div class="gb-chips" role="group">${chip('season', '', 'En vivo', ov.season == null)}${GBSEAS.map((s, i) => chip('season', i, s, ov.season === i)).join('')}</div>
      <b class="tiny">Clima</b><div class="gb-chips" role="group">${chip('weather', '', 'En vivo', !ov.weather)}${[['clear', 'Despejado'], ['rain', 'Lluvia'], ['storm', 'Tormenta'], ['fog', 'Niebla'], ['wind', 'Viento'], ['snow', 'Nieve'], ['blizzard', 'Ventisca'], ['aurora', 'Aurora'], ['rainbow', 'Arcoíris']].map(([v, l]) => chip('weather', v, l, ov.weather === v)).join('')}</div>
      <b class="tiny">Hora</b><div class="gb-chips" role="group">${chip('time', '', 'En vivo', ov.time == null)}${[[0.02, 'Amanecer'], [0.25, 'Mediodía'], [0.47, 'Atardecer'], [0.75, 'Noche']].map(([v, l]) => chip('time', v, l, ov.time === v)).join('')}</div>
      <p class="tiny faint">Las vistas de prueba solo las ves tú en este momento; el bosque real sigue su propio ritmo.</p></div>
    <h2 class="sec">Habitantes</h2><ul class="gb-pop" id="gbPop"></ul>
    <h2 class="sec">Cadena alimenticia</h2><p class="small gb-chain">Pasto y bayas <i>→</i> conejos, venados, ardillas y pájaros <i>→</i> zorros, lobos, búho y águila. Los peces del lago alimentan al oso y al águila. Si una especie crece, sus depredadores también; si no hay comida, nacen menos crías.</p>
    <h2 class="sec">Diario del bosque</h2><ul class="gb-log" id="gbLog"><li class="faint">Todo está en calma…</li></ul></div>`;
}
EXTRA_VIEWS.granbosque = viewGranBosque; EXTRA_NAV.granbosque = 'mas'; GROUP_VIEWS.granbosque = viewGranBosque; GROUP_NAV.granbosque = 'mas';

function gbResize() {
  const cv = G.cv; if (!cv) return; const wrap = cv.parentElement; const r = wrap.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, G.q < 1 ? 1 : 2);
  const w = Math.max(200, Math.round(r.width * dpr)), h = Math.max(200, Math.round(r.height * dpr)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
}
function gbUiTick() {
  const E = G.env; if (!E) return; const now = Date.now();
  const s = $('#gbSeason'); if (s) { const left = G.ov.season != null ? null : SEASON_MS - (now % SEASON_MS); s.textContent = `${GBSEAS[E.sI]}${left == null ? ' · vista previa' : ` · cambia en ${gbMMSS(left)}`}`; }
  const w = $('#gbWeather'); if (w) w.textContent = `${gbTimeName(E)} · ${gbWeatherText(E)}`;
  const pop = $('#gbPop'); if (pop) pop.innerHTML = Object.keys(GB.SP).map((sp) => `<li><span>${GB.SP[sp].name}s</span><b>${gbCount(sp)}</b></li>`).join('');
  const lg = $('#gbLog'); if (lg && G.logDirty) { G.logDirty = false; lg.innerHTML = G.log.length ? G.log.map((l) => `<li>${esc(l.txt)}</li>`).join('') : '<li class="faint">Todo está en calma…</li>'; }
  const card = $('#gbCard'); if (card) { const a = G.sel && G.animals.find((o) => o.id === G.sel.id); if (!a) { card.hidden = true; } else { card.hidden = false; const S = GB.SP[a.sp]; const bar = (v) => `<span class="gb-bar"><i style="width:${Math.round(gbCl(1 - v, 0, 1) * 100)}%"></i></span>`;
    const st = a.hidden ? (a.state === 'hib' ? 'Hibernando' : a.state === 'sleep' ? 'Durmiendo en su refugio' : 'Escondido a salvo') : (GB_STATE_TXT[a.state] || 'Tranquilo'); card.innerHTML = `<b>${esc(a.name)}</b> <span class="tiny">${S.name}${a.age < 1 ? ' · cría' : ''}</span><p class="small">${esc(st)}</p>${a.sp !== 'fish' ? `<div class="gb-needs"><span>Energía de comida</span>${bar(a.hunger)}<span>Agua</span>${bar(a.thirst)}</div>` : ''}<p class="tiny">${esc(GB_DIET[a.sp])}</p><button type="button" class="link-btn" data-act="gb-follow">${G.follow ? 'Dejar de seguir' : 'Seguir'}</button>`; } }
}
let gbRaf = 0;
function gbLoop(ts) {
  const cv = document.getElementById('gbCv'); if (!cv) { gbRaf = 0; G.cv = null; gbSnd.off(); return; }
  if (cv !== G.cv) { G.cv = cv; G.ctx = cv.getContext('2d'); gbBind(cv); gbResize(); }
  const last = G.last || ts; let dt = Math.min(0.05, (ts - last) / 1000); G.last = ts;
  if (document.hidden) { gbRaf = requestAnimationFrame(gbLoop); return; }
  if (!G.paused) { gbUpdate(dt); G.fpsAcc = (G.fpsAcc || 0) * 0.95 + dt * 1000 * 0.05; if (G.fpsAcc > 26 && G.q > 0.5 && !G.qLock) { G.q = Math.max(0.5, G.q - 0.25); G.fpsAcc = 16; gbResize(); } }
  else gbEnv();
  if (G.sizeChk !== cv.clientWidth + 'x' + cv.clientHeight) { G.sizeChk = cv.clientWidth + 'x' + cv.clientHeight; gbResize(); }
  gbFrame(ts); G.ui = (G.ui || 0) + dt; if (G.ui > 0.4) { G.ui = 0; gbUiTick(); gbSnd.update(G.env); }
  gbRaf = requestAnimationFrame(gbLoop);
}
function gbBind(cv) {
  let d = null;
  cv.addEventListener('pointerdown', (e) => { cv.setPointerCapture(e.pointerId); d = { x: e.clientX, cam: G.cam, moved: 0, t: Date.now() }; G.drag = true; });
  cv.addEventListener('pointermove', (e) => { if (!d) return; const k = (cv.clientWidth || 1) / (G.vw || 400); const dx = e.clientX - d.x; d.moved = Math.max(d.moved, Math.abs(dx)); if (d.moved > 5) { G.follow = null; G.camT = gbCl(d.cam - dx / k, 0, GBW - (G.vw || 400)); G.cam = G.camT; } });
  const up = (e) => { if (!d) return; const tap = d.moved < 6; G.drag = false; if (tap) gbTap(e, cv); d = null; };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { d = null; G.drag = false; });
}
function gbTap(e, cv) {
  const r = cv.getBoundingClientRect(); const k = r.height / (G.hv || GBH); const wx = G.cam + (e.clientX - r.left) / k, wy = (G.top || 0) + (e.clientY - r.top) / k; let best = null, bd = 1e9;
  for (const a of G.animals) { if (a.hidden || a.dead) continue; const s = GB.SP[a.sp].size * 18; const dx = Math.abs(a.x - wx), dy = Math.abs((a.y - s * 0.8) - wy); const d = Math.hypot(dx, dy * 0.8); if (d < s + 14 && d < bd) { bd = d; best = a; } }
  for (const a of G.animals) a.sel = false; if (best) { best.sel = true; G.sel = best; G.follow = null; Snd && Snd.tick && Snd.tick(); } else { G.sel = null; G.follow = null; } gbUiTick();
}
function gbStart() {
  if (!G.built) { gbBuildWorld(); gbSpawnAll(); G.built = true; G.autoDir = 1; G.auto = true; G.cam = 1700; G.camT = G.cam; G.paused = false; try { G.paused = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { /* */ } gbEnv(); gbLog('El bosque despierta.'); }
  if (!gbRaf) { G.last = 0; gbRaf = requestAnimationFrame(gbLoop); }
}
Object.assign(VIDA_ACTS, {
  'gb-ov': (el) => { const g = el.dataset.g, v = el.dataset.v; if (g === 'season') G.ov.season = v === '' ? null : +v; else if (g === 'weather') { G.ov.weather = v || null; if (v === 'aurora' && G.env && G.env.night < 0.6) G.ov.time = 0.75; if (v === 'snow' || v === 'blizzard') { if (G.ov.season == null && G.env && G.env.sI !== 3) G.ov.season = 3; } } else G.ov.time = v === '' ? null : +v;
    gbEnv(); document.querySelectorAll('.gb-chip').forEach((b) => { const gg = b.dataset.g, vv = b.dataset.v; const cur = gg === 'season' ? G.ov.season : gg === 'weather' ? G.ov.weather : G.ov.time; b.setAttribute('aria-pressed', String(vv === '' ? cur == null : String(cur) === vv)); }); gbUiTick(); },
  'gb-pause': (el) => { G.paused = !G.paused; el.textContent = G.paused ? '▶' : '❚❚'; el.setAttribute('aria-label', G.paused ? 'Reanudar' : 'Pausar'); },
  'gb-sound': (el) => { G.sound = !G.sound; if (G.sound) { if (!gbSnd.on()) { G.sound = false; toast('Tu dispositivo no permite sonido aquí.'); } } else gbSnd.off(); el.setAttribute('aria-pressed', String(G.sound)); },
  'gb-full': () => { const w = document.getElementById('gbWrap'); if (!w) return; w.classList.toggle('gb-full'); document.body.classList.toggle('gb-noscroll', w.classList.contains('gb-full')); G.sizeChk = ''; },
  'gb-follow': () => { if (!G.sel) return; G.follow = G.follow ? null : G.sel.id; G.auto = false; gbUiTick(); },
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { const w = document.getElementById('gbWrap'); if (w && w.classList.contains('gb-full')) { w.classList.remove('gb-full'); document.body.classList.remove('gb-noscroll'); G.sizeChk = ''; } } });

/* botón grande en «Más» */
{
  const card = `<a class="gb-entry" href="#/granbosque"><span class="gb-entry-art" aria-hidden="true"><svg viewBox="0 0 120 56"><defs><linearGradient id="gbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c7a8"/><stop offset="1" stop-color="#cfe6ef"/></linearGradient></defs><rect width="120" height="56" fill="url(#gbg)"/><path d="M-4 40 L38 12 L48 20 L60 4 L82 36 L124 22 L124 60 L-4 60Z" fill="#8fa6c9"/><path d="M60 4 L52 16 L58 14 L62 18 L66 13 L70 17 L60 4Z" fill="#fff"/><path d="M-4 46 Q30 36 60 46 T124 44 L124 60 L-4 60Z" fill="#5d9a55"/><path d="M20 46 l5-16 5 16z M30 46 l4-12 4 12z M92 47 l5-17 5 17z" fill="#2f6b49"/></svg></span><span class="gb-entry-txt"><b>EL GRAN BOSQUE</b><span>Un ecosistema vivo con estaciones, clima y animales</span></span></a>`;
  const wrap = (fn) => function () { const h = fn.apply(this, arguments); if (typeof calmOn === 'function' && calmOn()) return h; const i = h.indexOf('<ul class="rows"'); return i < 0 ? card + h : h.slice(0, i) + card + h.slice(i); };
  viewMas = wrap(viewMas); if (typeof viewMasGrupo === 'function') viewMasGrupo = wrap(viewMasGrupo);
}
