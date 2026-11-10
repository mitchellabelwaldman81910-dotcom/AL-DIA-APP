/* Cinnavia 7.14 — Vida › Comprar.
   Cada vez que tu árbol llega a un nivel nuevo ganas monedas (10 + el nivel), y más con las misiones del día.
   Con ellas compras otras especies de árbol, ambientes para tu paisaje, decoraciones del jardín
   y plantillas visuales para toda la app. Todo se guarda en tu cuenta y en la nube. */
'use strict';

const TREE_SHOP = [
  ['roble', 0, 'El árbol con el que empezaste. Fuerte y sereno.'],
  ['cedro', 120, 'Perenne y elegante, con pisos de agujas finas.'],
  ['olivo', 180, 'Hojas plateadas y tronco antiguo, mediterráneo.'],
  ['arce', 260, 'Hojas rojas de otoño que caen despacio.'],
  ['jacaranda', 340, 'Una nube de flores lilas, como en primavera.'],
  ['cerezo', 420, 'Flores rosas y pétalos que vuelan con el viento.'],
  ['flamboyan', 520, 'Copa ancha encendida de rojo, como en el Caribe.'],
  ['sauce', 640, 'Ramas que caen como cortina, junto al agua.'],
  ['ginkgo', 780, 'Hojas de abanico doradas: el árbol más antiguo del mundo.'],
  ['luz', 1200, 'Un árbol que brilla con destellos de oro.'],
];
const FX_SHOP = [
  ['arcoiris', 'Arcoíris tenue', 180, 'Un arco de color detrás de las montañas.'],
  ['nieve', 'Nevada suave', 200, 'Copos lentos que caen sobre tu paisaje.'],
  ['faroles', 'Faroles flotantes', 220, 'Luces de papel que suben al cielo.'],
  ['fugaces', 'Estrellas fugaces', 260, 'De vez en cuando cruza una estrella.'],
  ['aurora', 'Aurora boreal', 320, 'Velos de luz verde y violeta en el cielo.'],
];
const levelReward = (l) => 10 + l;

function shopData() { const v = vidaData(); v.shop ||= { own: [], tree: 'roble', fx: [] }; v.shop.own ||= []; v.shop.fx ||= []; return v; }
function shopOwns(key) { try { if (typeof S === 'undefined' || !S) return false; return shopData().shop.own.includes(key); } catch { return false; } }
function priceOf(key) {
  const [t, k] = key.split(':');
  if (t === 'tr') return (TREE_SHOP.find((x) => x[0] === k) || [0, 0])[1];
  if (t === 'fx') return (FX_SHOP.find((x) => x[0] === k) || [0, '', 0])[2];
  if (t === 'st') return ESTILOS[k]?.price || 0;
  return 0;
}
function nameOf(key) {
  const [t, k] = key.split(':');
  if (t === 'tr') return SPECIES[k]?.name || k;
  if (t === 'fx') return (FX_SHOP.find((x) => x[0] === k) || [0, k])[1];
  if (t === 'st') return `Plantilla ${ESTILOS[k]?.name || k}`;
  return k;
}
function bestLevel() { const v = shopData(); const id = dataOwner(); const lv = id && !isForestId(id) ? treeNow(id).level : 0; return Math.max(v.best || 0, lv); }
function coinsEarned() { const b = bestLevel(); return 10 * b + (b * (b + 1)) / 2 + (shopData().bonus || 0); }
function coinsSpent() {
  const v = shopData();
  const g = (v.garden || []).reduce((a, k) => a + (GARDEN.find((x) => x.id === k)?.cost || 0), 0);
  return g + v.shop.own.reduce((a, k) => a + priceOf(k), 0);
}
function coins() { return Math.max(0, Math.round(coinsEarned() - coinsSpent())); }
seedsOf = () => coins();
const curSpecies = () => { try { if (isForestId(REG.current)) return 'roble'; const t = shopData().shop.tree; return t && (t === 'roble' || shopOwns('tr:' + t)) && SPECIES[t] ? t : 'roble'; } catch { return 'roble'; } };
const curFX = () => { try { if (isForestId(REG.current)) return []; return shopData().shop.fx.filter((k) => shopOwns('fx:' + k)); } catch { return []; } };

function coinSVG(cls = '') { return `<svg class="coin ${cls}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="5.8" opacity=".55"/><path d="M12 8.4v7.2M9.6 10.2c.4-1 1.3-1.5 2.4-1.5 1.3 0 2.3.7 2.3 1.7 0 2.2-4.7 1.3-4.7 3.5 0 1 1 1.7 2.4 1.7 1.1 0 2-.5 2.4-1.5"/></svg>`; }

/* Al subir a un nivel nuevo se acreditan las monedas */
{
  const baseLevelUp = levelUp;
  levelUp = function (level) {
    baseLevelUp(level);
    try {
      const v = shopData();
      const prevBest = v.best ? v.best : level - 1;
      if (level > prevBest) {
        let gain = 0; for (let l = prevBest + 1; l <= level; l++) gain += levelReward(l);
        v.best = level; save();
        setTimeout(() => { toast(`+${gain} monedas para la tienda de Vida.`, { action: 'Ver tienda', onAction: () => { VUI.tab = 'comprar'; location.hash = '#/vida'; render(); } }); }, 1600);
      }
    } catch { /* */ }
  };
}

async function shopBuy(key) {
  if (shopOwns(key)) return true;
  if (!dataOwner() || isForestId(dataOwner())) { toast('La tienda es de tu árbol personal.'); return false; }
  const price = priceOf(key); const bal = coins();
  if (bal < price) { toast(`Te faltan ${price - bal} monedas para ${nameOf(key)}. Ganas monedas cada vez que tu árbol sube de nivel.`, { ms: 5200 }); return false; }
  const ok = await ask({ title: `¿Comprar ${nameOf(key)}?`, text: `Cuesta ${price} monedas. Te quedarán ${bal - price}.`, ok: `Comprar · ${price}` });
  if (!ok) return false;
  shopData().shop.own.push(key); commit();
  Snd.chime(); confetti(innerWidth / 2, innerHeight / 3, 40);
  toast(`${nameOf(key)} ya es tuyo.`);
  return true;
}

function shopTabHTML(c) {
  const v = shopData(); const bal = coins(); const best = bestLevel();
  const cur = curSpecies(); const fxOn = curFX();
  const trees = TREE_SHOP.map(([k, price, desc]) => {
    const own = k === 'roble' || shopOwns('tr:' + k); const on = cur === k;
    const btn = on ? '<span class="sh-chip on">En tu paisaje</span>' : own ? `<button class="btn" data-act="shop-use" data-k="${k}">Plantar</button>` : `<button class="btn ${bal >= price ? 'primary' : ''}" data-act="shop-buy" data-k="tr:${k}">${coinSVG('sm')}${price}</button>`;
    return `<article class="sh-card ${on ? 'on' : ''} ${own ? 'own' : ''}"><div class="sh-prev">${treeScene({ level: 46, wet: true, id: 'shop-' + k, seed: 'tienda', species: k, mini: true })}</div>
      <div class="sh-txt"><b>${esc(SPECIES[k].name)}</b><span>${esc(desc)}</span></div><div class="sh-foot">${btn}</div></article>`;
  }).join('');
  const fx = FX_SHOP.map(([k, name, price, desc]) => {
    const own = shopOwns('fx:' + k); const on = fxOn.includes(k);
    const btn = own ? `<button class="btn ${on ? 'primary' : ''}" data-act="shop-fx" data-k="${k}" aria-pressed="${on}">${on ? 'Activo' : 'Activar'}</button>` : `<button class="btn ${bal >= price ? 'primary' : ''}" data-act="shop-buy" data-k="fx:${k}">${coinSVG('sm')}${price}</button>`;
    return `<article class="sh-card fx ${on ? 'on' : ''}"><div class="sh-prev">${treeScene({ level: 30, wet: true, id: 'fx-' + k, seed: 'noche', species: cur, mini: true, fx: [k] })}</div>
      <div class="sh-txt"><b>${esc(name)}</b><span>${esc(desc)}</span></div><div class="sh-foot">${btn}</div></article>`;
  }).join('');
  const garden = GARDEN.map((g) => {
    const own = (v.garden || []).includes(g.id); const locked = c.level < g.lvl;
    const btn = own ? '<span class="sh-chip on">En tu jardín</span>' : locked ? `<span class="sh-chip">${icon('lock', 'sm')}Nivel ${g.lvl}</span>` : `<button class="btn ${bal >= g.cost ? 'primary' : ''}" data-act="garden-buy" data-id="${g.id}">${coinSVG('sm')}${g.cost}</button>`;
    return `<div class="sh-row ${own ? 'own' : ''} ${locked ? 'locked' : ''}"><span class="s-ico">${icon(g.emoji)}</span><b>${esc(g.name)}</b>${btn}</div>`;
  }).join('');
  const styles = Object.entries(ESTILOS).filter(([, s]) => s.price).map(([k, s]) => {
    const own = styleOwned(k); const on = currentStyle() === k;
    const btn = on ? '<span class="sh-chip on">En uso</span>' : own ? `<button class="btn" data-act="style-set" data-v="${k}">Usar</button>` : `<button class="btn ${bal >= s.price ? 'primary' : ''}" data-act="style-set" data-v="${k}">${coinSVG('sm')}${s.price}</button>`;
    return `<article class="sh-card st ${on ? 'on' : ''}"><div class="sh-sp">${stylePreview(k)}</div><div class="sh-txt"><b>${esc(s.name)}</b><span>${esc(s.desc)}</span></div><div class="sh-foot">${btn}</div></article>`;
  }).join('');
  return `<section class="sh-top"><div class="sh-bal">${coinSVG('lg')}<span><b id="coinBal">${bal}</b><em>monedas</em></span></div>
      <p>Ganas <b>10 + el nivel</b> cada vez que tu árbol llega a un nivel nuevo. Tu próximo nivel te da <b>+${levelReward(best + 1)}</b>. Las misiones de hoy suman más.</p></section>
    ${questsHTML()}
    <h2 class="sec">Árboles <small>${TREE_SHOP.filter(([k]) => k === 'roble' || shopOwns('tr:' + k)).length}/${TREE_SHOP.length}</small></h2>
    <p class="sh-note">Cambia la especie de tu árbol cuando quieras: conserva tu nivel y todo lo que has crecido.</p>
    <div class="sh-grid">${trees}</div>
    <h2 class="sec">Ambientes del paisaje</h2><div class="sh-grid">${fx}</div>
    <h2 class="sec">Jardín <small>${(v.garden || []).length}/${GARDEN.length}</small></h2><div class="sh-list">${garden}</div>
    <h2 class="sec">Plantillas de la app</h2><p class="sh-note">Diseños minimalistas para toda la app, cada uno con versión de día y de noche.</p><div class="sh-grid st">${styles}</div>`;
}

Object.assign(VIDA_ACTS, {
  'shop-buy': async (el) => { const key = el.dataset.k; if (await shopBuy(key)) { const [t, k] = key.split(':'); if (t === 'tr') shopData().shop.tree = k; if (t === 'fx' && !shopData().shop.fx.includes(k)) shopData().shop.fx.push(k); commit(); if (t === 'tr' || t === 'fx') setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 400); } },
  'shop-use': (el) => { const k = el.dataset.k; if (k !== 'roble' && !shopOwns('tr:' + k)) return; shopData().shop.tree = k; commit(); Snd.drop(); toast(`Plantaste un ${SPECIES[k].name}. Tu nivel se conserva.`); window.scrollTo({ top: 0, behavior: 'smooth' }); },
  'shop-fx': (el) => { const k = el.dataset.k; if (!shopOwns('fx:' + k)) return; const f = shopData().shop.fx; const i = f.indexOf(k); if (i >= 0) f.splice(i, 1); else f.push(k); commit(); },
  'garden-buy': async (el) => {
    const g = GARDEN.find((x) => x.id === el.dataset.id); if (!g) return;
    const c = treeNow(dataOwner()); const v = shopData();
    if ((v.garden || []).includes(g.id)) return;
    if (c.level < g.lvl) { toast(`Se desbloquea en el nivel ${g.lvl}.`); return; }
    if (coins() < g.cost) { toast(`Te faltan ${g.cost - coins()} monedas. Sube de nivel tu árbol y completa misiones.`); return; }
    const ok = await ask({ title: `¿Comprar ${g.name}?`, text: `Cuesta ${g.cost} monedas.`, ok: `Comprar · ${g.cost}` }); if (!ok) return;
    (v.garden ||= []).push(g.id); commit(); Snd.chime(); toast(`${g.name} ya vive en tu jardín.`);
  },
  'quest-claim': (el) => {
    const q = questsToday().find((x) => x.id === el.dataset.id); if (!q || !q.ok || q.claimed) return;
    const v = vidaData(); v.claimed[`${today()}:${q.id}`] = 1; v.bonus = (v.bonus || 0) + q.reward;
    for (const k of Object.keys(v.claimed)) if (k.slice(0, 10) < addDays(today(), -14)) delete v.claimed[k];
    commit(); Snd.chime(); floatText(el, `+${q.reward}`); toast(`+${q.reward} monedas`);
  },
});

/* Fusión segura entre dispositivos: lo comprado nunca se pierde */
function mergeVida(l, r) {
  if (!l) return r; if (!r) return l;
  const uni = (a, b) => [...new Set([...(a || []), ...(b || [])])];
  const out = { ...r, ...l };
  out.garden = uni(l.garden, r.garden);
  out.best = Math.max(l.best || 0, r.best || 0);
  out.bonus = Math.max(l.bonus || 0, r.bonus || 0);
  out.claimed = { ...(r.claimed || {}), ...(l.claimed || {}) };
  if (l.focusDone || r.focusDone) out.focusDone = { ...(r.focusDone || {}), ...(l.focusDone || {}) };
  if (l.shop || r.shop) out.shop = { ...(r.shop || {}), ...(l.shop || {}), own: uni(l.shop?.own, r.shop?.own) };
  if (l.nav || r.nav) { const a = l.nav || {}, b = r.nav || {}; out.nav = { ...b, ...a, lv: Math.max(a.lv | 0, b.lv | 0) }; }
  return out;
}
