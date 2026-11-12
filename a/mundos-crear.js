/* Cinnavia 7.57 — MUNDOS · Crea tu mundo: eliges el paisaje, los lagos, las plantas, las frutas y tus animales. Se guarda en tu cuenta. */
'use strict';
const MW_BASES = [['bosque', 'Prado y bosque'], ['selva', 'Selva'], ['sabana', 'Sabana'], ['sahara', 'Desierto'], ['taiga', 'Nieve y pinos'], ['playa', 'Playa'], ['otono', 'Otoño']];
const MW_FLORA = [['pine', 'Pinos'], ['fir', 'Abetos'], ['oak', 'Robles'], ['maple', 'Arces'], ['sakura', 'Cerezos japoneses'], ['willow', 'Sauces'], ['palm', 'Palmeras'], ['jungle', 'Árboles de selva'], ['ceiba', 'Ceibas'], ['cecropia', 'Yagrumos'], ['platanero', 'Plataneros'], ['mangrove', 'Mangles'], ['acacia', 'Acacias'], ['baobab', 'Baobabs'], ['eucalyptus', 'Eucaliptos'], ['bamboo', 'Bambú'], ['cactus', 'Cactus'], ['bush', 'Arbustos'], ['fern', 'Helechos'], ['flower', 'Flores'], ['tuft', 'Matas de pasto'], ['reed', 'Juncos'], ['mush', 'Hongos'], ['rock', 'Rocas'], ['hay', 'Pacas de heno']];
const MW_LV = [0, 0.12, 0.3, 0.6, 1.1], MW_LVN = ['Ninguno', 'Pocos', 'Algunos', 'Muchos', 'Denso'];
const MW_N = [0, 2, 3, 4, 6, 8, 10, 14];
const MW_WATER = [['lago', 'Lagos', 2, 900], ['estanque', 'Estanques', 2, 520], ['rio', 'Ríos', 1, 1500]];
const MW = { m: null, drawn: false };
const mwNew = () => { const m = { id: null, name: 'Mi mundo', base: 'bosque', lakes: { lago: 1, estanque: 0, rio: 0 }, flora: {}, sp: {}, frutas: true }; mwBase(m, 'bosque'); return m; };
function mwBase(m, id) {
  m.base = id; const bw = MD_WORLDS.find((w) => w.id === id); m.flora = {}; m.sp = {}; if (!bw) return;
  for (const [k, d] of bw.flora) { if (!MW_FLORA.some((f) => f[0] === k)) continue; let b = 0; for (let i = 1; i < MW_LV.length; i++) if (Math.abs(MW_LV[i] - d) < Math.abs(MW_LV[b] - d)) b = i; m.flora[k] = Math.max(1, b); }
  for (const [k, n] of bw.sp) { if (!MD_SP[k] || !mwSpList().some((s) => s.k === k)) continue; let b = 1; for (let i = 1; i < MW_N.length; i++) if (Math.abs(MW_N[i] - Math.max(2, n)) < Math.abs(MW_N[b] - Math.max(2, n))) b = i; m.sp[k] = MW_N[b]; }
  m.lakes = { lago: 0, estanque: 0, rio: 0 }; for (const w of bw.waters || []) if (m.lakes[w[0]] != null) m.lakes[w[0]] = Math.min(MW_WATER.find((x) => x[0] === w[0])[2], m.lakes[w[0]] + 1);
}
let MW_SPL = null;
function mwSpList() {
  if (MW_SPL) return MW_SPL; const used = {}; for (const w of MD_WORLDS) if (w.mode === 'land' && !w.custom) for (const e of w.sp) used[e[0]] = 1;
  MW_SPL = Object.keys(used).filter((k) => MD_SP[k] && !MD_SP[k].rb).map((k) => { const S = MD_SP[k], L = mdLayer(k); return { k, n: S.n, g: S.t === 'f' || L === 'water' || L === 'floor' ? 'agua' : S.t === 'b' ? 'aves' : S.t === 'x' ? 'otros' : 'tierra' }; }).sort((a, b) => a.n.localeCompare(b.n, 'es'));
  return MW_SPL;
}
const MW_GN = { tierra: 'Animales de tierra', aves: 'Aves', otros: 'Reptiles, ranas y otros', agua: 'Animales de agua (necesitan lagos o ríos)' };
function mwDef(m) {
  const bw = MD_WORLDS.find((w) => w.id === m.base && !w.custom) || MD_WORLDS[0], def = JSON.parse(JSON.stringify(bw));
  const bodies = []; for (const [t, , , wd] of MW_WATER) for (let i = 0; i < (m.lakes[t] || 0); i++) bodies.push([t, wd]);
  def.waters = bodies.map(([t, wd], i) => { const c = 9600 * (i + 1) / (bodies.length + 1); return [t, Math.round(c - wd / 2), Math.round(c + wd / 2)]; });
  def.flora = MW_FLORA.filter(([k]) => m.flora[k] > 0).map(([k]) => [k, MW_LV[m.flora[k]]]);
  def.sp = Object.keys(m.sp).filter((k) => m.sp[k] > 0 && MD_SP[k]).map((k) => [k, m.sp[k]]);
  const na = def.sp.reduce((s, e) => s + Math.max(2, e[1]), 0), np = def.flora.length;
  Object.assign(def, { id: m.id, grp: 'Mis mundos', name: m.name, custom: 1, nofruit: !m.frutas, desc: `Tu mundo: ${na} animales y ${np} tipos de plantas.`, mode: 'land' });
  return def;
}
function mwSync() { for (let i = MD_WORLDS.length - 1; i >= 0; i--) if (MD_WORLDS[i].custom) MD_WORLDS.splice(i, 1); for (const m of (typeof S !== 'undefined' && S.mundosMios) || []) MD_WORLDS.push(mwDef(m)); }
{ const base = mdBuild; mdBuild = function (def) { MDS.pop = def.custom ? 1 : undefined; base(def); }; }
{ const base = mdOpen; mdOpen = function (id) { mwSync(); base(id); }; }

/* ---- pantalla de inicio de Mundos: tus mundos + botón para crear ---- */
function mwHomeHTML() {
  const L = (S.mundosMios || []);
  return `<div class="mw-home"><button type="button" class="mw-new" data-act="mw-new"><b>＋ Crea tu propio mundo</b><span>Pon lagos, palmeras y árboles, elige sus frutos y los animales que quieras</span></button>
  ${L.length ? `<h2 class="sec">Mis mundos</h2><div class="md-grid">${L.map((m) => `<div class="md-world mw-mine"><button type="button" class="mw-open" data-act="md-open" data-id="${m.id}"><canvas data-mdthumb="${m.id}" aria-hidden="true"></canvas><b>${esc(m.name)}</b><span>${esc(mwDef(m).desc)}</span></button><div class="mw-row"><button type="button" class="md-chip" data-act="mw-edit" data-id="${m.id}">Editar</button><button type="button" class="md-chip" data-act="mw-del" data-id="${m.id}">Borrar</button></div></div>`).join('')}</div>` : ''}</div>`;
}
const mwWrapHome = () => { const base = viewMundos; const f = function () { mwSync(); const h = base(); if (MDV.world && MDS.def && MDS.def.id === MDV.world) return h; return h.replace('<a class="md-classic"', mwHomeHTML() + '<a class="md-classic"'); }; EXTRA_VIEWS.mundos = f; GROUP_VIEWS.mundos = f; EXTRA_VIEWS.granbosque = f; GROUP_VIEWS.granbosque = f; return f; };
viewMundos = mwWrapHome();

/* ---- el creador ---- */
const mwStep = (arr, v, d) => { let i = arr.indexOf(v); if (i < 0) i = 0; return arr[Math.max(0, Math.min(arr.length - 1, i + d))]; };
function mwIconHTML(kind, key) { return `<canvas class="mw-ic" width="64" height="56" data-mw${kind}="${key}" aria-hidden="true"></canvas>`; }
function viewCrearMundo() {
  if (!MW.m) MW.m = mwNew(); const m = MW.m; mwSync(); MW.drawn = false;
  const water = MW_WATER.map(([t, n, mx]) => `<div class="mw-r"><span class="mw-n">${n}</span><div class="mw-st"><button type="button" class="md-ib" data-act="mw-step" data-g="lakes" data-k="${t}" data-d="-1" aria-label="Menos ${n}">−</button><b>${m.lakes[t] || 0}</b><button type="button" class="md-ib" data-act="mw-step" data-g="lakes" data-k="${t}" data-d="1" aria-label="Más ${n}">+</button></div></div>`).join('');
  const flora = MW_FLORA.map(([k, n]) => `<div class="mw-r">${mwIconHTML('p', k)}<span class="mw-n">${n}<small>${MW_LVN[m.flora[k] || 0]}</small></span><div class="mw-st"><button type="button" class="md-ib" data-act="mw-step" data-g="flora" data-k="${k}" data-d="-1" aria-label="Menos ${n}">−</button><b>${m.flora[k] || 0}</b><button type="button" class="md-ib" data-act="mw-step" data-g="flora" data-k="${k}" data-d="1" aria-label="Más ${n}">+</button></div></div>`).join('');
  const sp = mwSpList(), tot = Object.values(m.sp).reduce((s, n) => s + n, 0);
  const cats = Object.keys(MW_GN).map((g) => { const items = sp.filter((s) => s.g === g), sel = items.filter((s) => m.sp[s.k] > 0).length; return `<details class="mw-cat" data-g="${g}"${sel ? ' open' : ''}><summary>${MW_GN[g]} <small>${sel ? sel + ' elegidos' : items.length}</small></summary><div class="mw-list">${items.map((s) => `<div class="mw-r">${mwIconHTML('a', s.k)}<span class="mw-n">${esc(s.n)}</span><div class="mw-st"><button type="button" class="md-ib" data-act="mw-step" data-g="sp" data-k="${s.k}" data-d="-1" aria-label="Menos ${esc(s.n)}">−</button><b>${m.sp[s.k] || 0}</b><button type="button" class="md-ib" data-act="mw-step" data-g="sp" data-k="${s.k}" data-d="1" aria-label="Más ${esc(s.n)}">+</button></div></div>`).join('')}</div></details>`; }).join('');
  const nw = Object.keys(m.sp).some((k) => m.sp[k] > 0 && MW_SPL.find((s) => s.k === k && s.g === 'agua')) && !(m.lakes.lago || m.lakes.estanque || m.lakes.rio);
  setTimeout(mwDrawIcons, 30);
  return `<div class="md-page mw-page"><div class="md-top"><button type="button" class="md-back" data-act="mw-back">‹ Mundos</button><h1 class="h1">${m.id ? 'Editar mundo' : 'Crea tu mundo'}</h1></div>
  <p class="sub">Elige cómo es tu mundo y quién vive en él. Después entras y lo ves vivir solo.</p>
  <label class="mw-lab" for="mwName">Nombre de tu mundo</label><input id="mwName" class="mw-in" maxlength="24" value="${esc(m.name)}" autocomplete="off">
  <h2 class="sec">Paisaje</h2><div class="md-chips">${MW_BASES.map(([id, n]) => `<button type="button" class="md-chip" data-act="mw-base" data-id="${id}" aria-pressed="${m.base === id}">${n}</button>`).join('')}</div>
  <p class="tiny faint">Al cambiar el paisaje se vuelven a poner sus plantas y animales típicos; después los cambias como quieras.</p>
  <h2 class="sec">Lagos y ríos</h2>${water}
  <h2 class="sec">Plantas y árboles</h2><div class="mw-list">${flora}</div>
  <h2 class="sec">Frutos</h2><div class="md-chips"><button type="button" class="md-chip" data-act="mw-fruit" data-v="1" aria-pressed="${m.frutas}">Con frutos</button><button type="button" class="md-chip" data-act="mw-fruit" data-v="0" aria-pressed="${!m.frutas}">Sin frutos</button></div>
  <p class="tiny faint">Con frutos: plátanos en los plataneros, cocos o dátiles en las palmeras, higos, bellotas, moras y cerezas. Los animales los cortan, los bajan y se los comen.</p>
  <h2 class="sec">Tus animales <small class="mw-tot">${tot} en total</small></h2>${nw ? '<p class="mw-warn">Elegiste animales de agua pero no pusiste lagos ni ríos: no van a aparecer.</p>' : ''}${cats}
  <div class="mw-bar"><button type="button" class="btn primary block" data-act="mw-save">${m.id ? 'Guardar y entrar' : 'Crear mi mundo'}</button></div></div>`;
}
function mwDrawIcons() {
  const m = MW.m; if (!m) return; const W = MD_WORLDS.find((w) => w.id === m.base && !w.custom) || MD_WORLDS[0]; const cvs = [...document.querySelectorAll('canvas[data-mwp],canvas[data-mwa]')]; let i = 0;
  const step = () => { const t0 = performance.now(); while (i < cvs.length && performance.now() - t0 < 10) { const cv = cvs[i++]; if (!cv.isConnected) continue; const c = cv.getContext('2d'); c.clearRect(0, 0, 64, 56); const k = 56 / 140; c.setTransform(k, 0, 0, k, 0, 0); const vw = 64 / k;
      if (cv.dataset.mwp) { const kind = cv.dataset.mwp, tree = MD_TREES.has(kind), hh = tree ? (mdH[kind] ? mdH[kind][1] * 0.6 : 170) : (mdH[kind] ? mdH[kind][1] : 50); const sc = tree ? 0.5 : Math.min(2.4, 80 / Math.max(30, hh)); c.save(); c.translate(vw / 2, 130); c.scale(sc, sc); try { mdDrawFlora(c, { kind, x: 0, y: 0, h: tree ? 170 : hh, seed: 5, fruit: false, burn: 0, burnt: false, dir: 1 }, W, 1000, false, 0); } catch (e) { /* */ } c.restore(); }
      else { const key = cv.dataset.mwa, S = MD_SP[key]; if (!S) continue; const a = { id: 3, age: 1, state: 'idle', ph: 1, moving: false, male: true, hunger: 0.2, blink: 0, dir: 1 }; const sc = Math.min(2.1, 1.9 / Math.pow(S.z, 0.7)) * 0.95, y = S.t === 'f' ? 70 : S.t === 'b' && S.h === 'A' ? 100 : 118; c.save(); c.translate(vw / 2, y); c.scale(sc, sc); try { mdDrawCritter(c, a, S, 1000); } catch (e) { /* */ } c.restore(); } }
    if (i < cvs.length) requestAnimationFrame(step); };
  step();
}
const mwName = () => { const el = document.getElementById('mwName'); if (el && MW.m) MW.m.name = el.value.replace(/\s+/g, ' ').trim().slice(0, 24) || 'Mi mundo'; };
EXTRA_VIEWS.crearmundo = viewCrearMundo; EXTRA_NAV.crearmundo = 'mas'; GROUP_VIEWS.crearmundo = viewCrearMundo; GROUP_NAV.crearmundo = 'mas';
Object.assign(VIDA_ACTS, {
  'mw-new': () => { if ((S.mundosMios || []).length >= 12) { toast('Ya tienes 12 mundos. Borra alguno para crear otro.'); return; } MW.m = mwNew(); location.hash = '#/crearmundo'; },
  'mw-back': () => { MW.m = null; location.hash = '#/mundos'; },
  'mw-edit': (el) => { const m = (S.mundosMios || []).find((x) => x.id === el.dataset.id); if (!m) return; MW.m = JSON.parse(JSON.stringify(m)); location.hash = '#/crearmundo'; },
  'mw-del': async (el) => { const m = (S.mundosMios || []).find((x) => x.id === el.dataset.id); if (!m) return; const ok = await ask({ title: `¿Borrar «${m.name}»?`, text: 'Se borra tu mundo y no se puede recuperar.', ok: 'Borrar', cancel: 'Cancelar' }); if (!ok) return; S.mundosMios = S.mundosMios.filter((x) => x.id !== m.id); save(); mwSync(); render(); },
  'mw-base': (el) => { mwName(); mwBase(MW.m, el.dataset.id); render(); },
  'mw-fruit': (el) => { mwName(); MW.m.frutas = el.dataset.v === '1'; render(); },
  'mw-step': (el) => { mwName(); const m = MW.m, g = el.dataset.g, k = el.dataset.k, d = +el.dataset.d; const sy = window.scrollY; if (g === 'lakes') { const mx = MW_WATER.find((x) => x[0] === k)[2]; m.lakes[k] = Math.max(0, Math.min(mx, (m.lakes[k] || 0) + d)); } else if (g === 'flora') m.flora[k] = Math.max(0, Math.min(4, (m.flora[k] || 0) + d)); else m.sp[k] = mwStep(MW_N, m.sp[k] || 0, d); render(); window.scrollTo(0, sy); },
  'mw-save': () => {
    mwName(); const m = MW.m; if (!Object.values(m.sp).some((n) => n > 0)) { toast('Elige al menos un animal para tu mundo'); return; }
    if (!Object.values(m.flora).some((n) => n > 0)) { toast('Pon al menos una planta o árbol'); return; }
    S.mundosMios = S.mundosMios || []; const copy = JSON.parse(JSON.stringify(m));
    if (!copy.id) { copy.id = 'mio_' + Date.now().toString(36); S.mundosMios.push(copy); } else { const i = S.mundosMios.findIndex((x) => x.id === copy.id); if (i >= 0) S.mundosMios[i] = copy; else S.mundosMios.push(copy); }
    save(); MW.m = null; mwSync(); mdOpen(copy.id); location.hash = '#/mundos';
  }
});
