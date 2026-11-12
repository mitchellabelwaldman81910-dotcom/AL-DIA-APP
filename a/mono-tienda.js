/* Cinnavia 7.52 — Tienda del monito: pelajes, sombreros, accesorios y estelas que se compran con bananas.
   Todo se guarda por cuenta (clave con el usuario), así que nada se mezcla entre personas. */
'use strict';
const MT = { cat: 'fur', tryOn: {} };
const mtItem = (c, id) => MN_ITEMS[c].find((x) => x[0] === id);
const mtPrice = (c, it) => (it[2] != null ? it[2] : 0);
function mtLook() { const eq = { ...mnEq(), ...MT.tryOn }; return { eq, look: mnLook(eq, { free: true }) }; }
function viewMonoTienda() {
  const own = mnOwned(), eq = mnEq(), wal = mnWallet();
  const cat = MT.cat; const list = MN_ITEMS[cat];
  const tabs = MN_CATS.map(([id, l]) => `<button type="button" class="gb-chip" data-act="mt-cat" data-v="${id}" aria-pressed="${cat === id}">${l}</button>`).join('');
  const cards = list.map((it) => {
    const id = it[0], pr = mtPrice(cat, it), has = own.has(id) || pr === 0, on = eq[cat] === id || (!eq[cat] && (id === 'none' || id === 'cafe'));
    const btn = on ? '<button class="btn" disabled>Puesto</button>' : has ? `<button class="btn primary" data-act="mt-eq" data-c="${cat}" data-id="${id}">Ponerlo</button>` : `<button class="btn${wal >= pr ? ' primary' : ''}" data-act="mt-buy" data-c="${cat}" data-id="${id}"${wal >= pr ? '' : ' aria-disabled="true"'}>Comprar · ${pr}</button>`;
    return `<li class="mt-card${on ? ' mt-on' : ''}"><button type="button" class="mt-view" data-act="mt-try" data-c="${cat}" data-id="${id}" aria-label="Probar ${esc(it[1])}"><canvas class="mt-cv" data-c="${cat}" data-id="${id}" width="192" height="192"></canvas></button><b>${esc(it[1])}</b><span class="tiny faint">${has ? (pr ? 'Es tuyo' : 'Incluido') : `${pr} bananas`}</span>${btn}</li>`;
  }).join('');
  setTimeout(mtPaint, 30);
  return `<div class="mt-page"><a class="back" href="#/mono">${icon('back')}Monito Saltarín</a><h1 class="h1">Tienda del monito</h1>
    <p class="sub">Gana bananas jugando: cada banana que recoges vale una y cada 15 saltos suman otra. Cuando juegas, también ves lo que llevas puesto.</p>
    <div class="mt-wallet"><b id="mtWal">${wal}</b> <span>bananas</span></div>
    <div class="mt-hero"><canvas id="mtBig" width="320" height="320" aria-label="Tu monito"></canvas></div>
    <div class="gb-chips" role="group" style="margin:6px 0 12px">${tabs}</div>
    <ul class="mt-grid">${cards}</ul>
    <p class="tiny" style="opacity:.7;margin-top:12px">Toca una tarjeta para probarla antes de comprar. Tus compras se guardan en este dispositivo y en esta cuenta.</p></div>`;
}
function mtPaint() {
  const { eq, look } = mtLook();
  const big = document.getElementById('mtBig'); if (big) { const g = big.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, big.width, big.height); const u = 190; g.fillStyle = 'rgba(0,0,0,.06)'; g.beginPath(); g.ellipse(160, 285, 100, 18, 0, 0, 7); g.fill(); mtTrailDots(g, look.trail || eq.trail, 160, 300, 5); mnDrawMonkey(g, 160, 285, u, { ...look, t: 0 }); }
  for (const cv of document.querySelectorAll('.mt-cv')) {
    const c = cv.dataset.c, id = cv.dataset.id; const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    const e = { ...eq, ...MT.tryOn, [c]: id }; const lk = mnLook(e, { free: true });
    if (c === 'trail') { mtTrailDots(g, id, 96, 182, 3); mnDrawMonkey(g, 96, 172, 112, { ...mnLook({ ...eq, ...MT.tryOn }, { free: true }), t: 0 }); }
    else mnDrawMonkey(g, 96, 176, 120, { ...lk, t: 0 });
  }
}
function mtTrailDots(g, id, x, y, sc) {
  const cols = { hojas: ['#5fae48', '#8fd16a'], burbujas: ['#bfe9ff', '#e6f7ff'], estrellas: ['#ffe066', '#fff3a8'], chispas: ['#ff9a3c', '#ffd23c'], corazones: ['#ee4f84', '#ff8fb3'], arcoiris: ['#ff5a5a', '#ffb23c', '#ffe066', '#6bd66b', '#4aa8ff', '#a06bff'] }[id]; if (!cols) return;
  for (let i = 0; i < 9; i++) { const a = i * 2.4; g.fillStyle = cols[i % cols.length]; g.globalAlpha = 0.85; g.beginPath(); g.arc(x + Math.cos(a) * sc * 14 * (0.4 + (i % 3) * 0.3), y - 10 * sc + Math.sin(a * 1.7) * sc * 6 - i * sc * 1.5, sc * 1.6, 0, 7); g.fill(); } g.globalAlpha = 1;
}
const mtSave = (eq) => jgSet(mnEqKey(), JSON.stringify(eq));
EXTRA_VIEWS.monotienda = viewMonoTienda; EXTRA_NAV.monotienda = 'juegos';
Object.assign(VIDA_ACTS, {
  'mt-cat': (el) => { MT.cat = el.dataset.v; render(); },
  'mt-try': (el) => { MT.tryOn = { ...MT.tryOn, [el.dataset.c]: el.dataset.id }; mtPaint(); },
  'mt-eq': (el) => { const eq = mnEq(); eq[el.dataset.c] = el.dataset.id; mtSave(eq); MT.tryOn = {}; render(); },
  'mt-buy': (el) => {
    const c = el.dataset.c, id = el.dataset.id, it = mtItem(c, id); if (!it) return; const pr = mtPrice(c, it), own = mnOwned();
    if (own.has(id)) return; if (mnWallet() < pr) { toast(`Te faltan ${pr - mnWallet()} bananas. Juega para ganar más.`); return; }
    jgSet(mnWalKey(), mnWallet() - pr); const list = mnJson(mnOwnKey(), []); list.push(id); jgSet(mnOwnKey(), JSON.stringify(list));
    const eq = mnEq(); eq[c] = id; mtSave(eq); MT.tryOn = {}; toast(`${it[1]}: ya es tuyo`); render();
  },
});
