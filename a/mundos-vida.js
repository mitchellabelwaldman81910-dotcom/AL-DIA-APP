/* Cinnavia 7.54 — MUNDOS · vida extra: refugios reales (madrigueras, cuevas, troncos, huecos de árbol, establos, cuevas marinas, anémonas, castoreras),
   travesuras de los monitos (columpiarse, colgarse, espulgarse, caerse de un árbol), animalitos con nombre y muerte natural. */
'use strict';
const MD_HOME_TXT = { burrow: 'madriguera', cave: 'cueva', log: 'tronco hueco', hollow: 'hueco del árbol', barn: 'establo', seacave: 'cueva entre las rocas', anemone: 'anémona', lodge: 'castorera' };
const MD_HOME_HIDE = new Set(['log', 'hollow', 'barn', 'lodge']);
const MD_MONKEY = new Set(['mono', 'monoarana', 'titi', 'lemur', 'orangutan']);

/* ---------- construir refugios ---------- */
function mdBuildHomes() {
  MDS.homes = []; MDS.pets = MDS.pets && MDS.petsWorld === MDS.def.id ? MDS.pets : []; MDS.petsWorld = MDS.def.id; const by = {};
  for (const a of MDS.an) { const t = a.S.home; if (!t) continue; (by[a.sp] = by[a.sp] || []).push(a); }
  const barns = MDS.fl.filter((f) => f.kind === 'barn'), anem = MDS.fl.filter((f) => f.kind === 'anemone'), rocks = MDS.fl.filter((f) => f.kind === 'rock');
  for (const sp in by) {
    const list = by[sp], t = MD_SP[sp].home, per = t === 'cave' ? 3 : t === 'burrow' ? 4 : t === 'barn' ? 99 : t === 'anemone' ? 2 : 3;
    const nH = t === 'barn' ? barns.length : Math.max(1, Math.ceil(list.length / per));
    for (let i = 0; i < nH; i++) {
      let h = null; const ref = list[Math.floor(i * list.length / nH)];
      if (t === 'barn') { const b = barns[i]; h = { type: t, x: b.x, y: b.y, cap: 99 }; }
      else if (t === 'anemone') { const an = anem.length ? anem.reduce((p, q) => (Math.abs(q.x - ref.x) < Math.abs(p.x - ref.x) ? q : p)) : null; if (!an) continue; h = { type: t, x: an.x, y: an.y - 10, cap: 4 }; }
      else if (t === 'hollow') { const tr = mdNearestTree(ref.x, 3000); if (!tr) continue; h = { type: t, x: tr.x + 2, y: tr.y - tr.h * 0.42, tree: tr, cap: 3 }; }
      else if (t === 'seacave') { let x = ref.x; const rk = rocks.find((r) => Math.abs(r.x - x) < 400); if (rk) x = rk.x + 40; h = { type: t, x, y: mdGY(x), cap: 6 }; }
      else if (t === 'lodge') { const wx = MDS.waterXs.length ? MDS.waterXs.reduce((p, q) => (Math.abs(q - ref.x) < Math.abs(p - ref.x) ? q : p)) : ref.x; h = { type: t, x: wx, y: MDS.S + 2, cap: 6 }; }
      else { let x = ref.x, tr = 0; while (mdDepth(x) > -14 && tr++ < 20) x = mdCl(ref.x + (Math.random() - 0.5) * 900, 80, MDS.WW - 80); if (mdDepth(x) > -14) continue; h = { type: t, x, y: mdGY(x) + (t === 'cave' ? 0 : 6), cap: t === 'cave' ? 5 : 6 }; if (t === 'burrow') { h.cx = x + (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 30); h.cy = mdGY(x) + 44 + 70 + Math.random() * 50; } }
      if (!h) continue; h.id = ++MDS.uid; h.sp = sp; h.occ = []; h.seed = Math.floor(Math.random() * 999); h.snow = MDS.def.clim.t < 0.3; MDS.homes.push(h);
    }
  }
  for (const a of MDS.an) mdPickHome(a);
}
function mdPickHome(a) { if (!a.S.home || !MDS.homes) return; let best = null, bd = 1e9; for (const h of MDS.homes) { if (h.sp !== a.sp && !(h.type === 'barn' && a.S.home === 'barn')) continue; const d = Math.abs(h.x - a.x); if (d < bd) { bd = d; best = h; } } a.home = best ? best.id : 0; }
const mdHomeOf = (a) => (a.home && MDS.homes ? MDS.homes.find((h) => h.id === a.home) : null);
function mdSlot(h, a) { const i = Math.max(0, h.occ.indexOf(a.id)), n = Math.max(1, h.occ.length); return (i - (n - 1) / 2); }
function mdEnter(a, h) { if (!h || h.occ.includes(a.id)) return; h.occ.push(a.id); a.inHome = h.id; a.moving = false; a.running = false; a.flying = false; a.vx = a.vy = 0; a.stateBefore = a.state; mdSetState(a, 'home', 6); if (a.layer === 'air') a.perchY = null; }
function mdExit(a) { const h = MDS.homes && MDS.homes.find((q) => q.id === a.inHome); if (h) { h.occ = h.occ.filter((i) => i !== a.id); a.x = h.x + (Math.random() - 0.5) * 20; a.y = h.type === 'hollow' ? h.y : h.type === 'lodge' ? MDS.S + 6 : MDS.sea ? h.y - 12 : mdGY(a.x); if (a.layer === 'air') { a.flying = true; a.ty = a.y - 60; a.tx = a.x + (Math.random() - 0.5) * 300; } } a.inHome = 0; mdSetState(a, 'idle', 1); }
function mdWantSleep(a) { const E = MDS.E, pat = a.S.pat; return (pat === 'd' && E.night > 0.78) || (pat === 'n' && E.night < 0.2 && E.sunAlt > 0.15) || (pat === 'c' && Math.abs(E.sunAlt) > 0.93) || (pat === 'a' && a.energy < 0.12); }

/* ---------- decisiones extra (antes de la inteligencia normal) ---------- */
function mdVidaThink(a) {
  const E = MDS.E; if (a.dead) return true;
  if (a.state === 'falling') return true;
  const h = mdHomeOf(a), baby = a.age < 0.55;
  /* dentro de su refugio */
  if (a.inHome) { const why = mdWantSleep(a) || E.shelter || (a.fearHome || 0) > MDS.t; if (a.energy < 1 && why) a.energy = Math.min(1, a.energy + 0.06); const floodOut = MDS.flood > 6 && h && (h.type === 'burrow' || h.type === 'cave' || h.type === 'log'); if (floodOut || (!why && (a.hunger > 0.55 || Math.random() < 0.35))) { mdExit(a); if (floodOut) { mdSay(a, '¡Se inunda mi casa!'); a.state = 'idle'; } } else { a.state = mdWantSleep(a) ? 'home' : 'homesafe'; } return !a.inHome ? false : true; }
  /* crías entran con mamá */
  if (baby && a.mom) { const m = MDS.an.find((o) => o.id === a.mom && !o.dead); if (m && m.inHome) { const mh = MDS.homes.find((q) => q.id === m.inHome); if (mh) { if (Math.abs(a.x - mh.x) < 18 || mh.type === 'hollow' || MDS.sea) { mdEnter(a, mh); return true; } a.tx = mh.x; a.running = true; mdSetState(a, 'gohome', 3); return true; } } }
  /* escapar a la madriguera cuando lo persiguen */
  if (h && a.state === 'flee' && Math.abs(a.x - h.x) < 280 && (h.type === 'burrow' || h.type === 'log' || h.type === 'seacave' || h.type === 'anemone' || h.type === 'hollow') && MDS.flood < 4) { a.tx = h.x; a.running = true; a.fearHome = MDS.t + 12; mdSetState(a, 'gohome', 3); if (a.layer === 'water') a.ty = h.y - 10; if (a.layer === 'air') { a.flying = true; a.ty = h.y; a.landing = true; } }
  /* ir a casa */
  if (a.state === 'gohome' && h) { const d = Math.abs(a.x - h.x) + (a.layer === 'water' || a.layer === 'air' ? Math.abs(a.y - h.y) * 0.5 : 0); if (d < 18 + (h.type === 'barn' ? 40 : 0)) { mdEnter(a, h); if (a.pet) mdLog(`${a.name} entró a su ${MD_HOME_TXT[h.type]}.`); return true; } a.tx = h.x; if (a.layer === 'water') a.ty = h.y - 10; if (a.layer === 'air') { a.flying = true; a.ty = h.y; } if (a.timer <= 0) a.timer = 3; return true; }
  if (h && !baby && a.state !== 'flee' && a.state !== 'hunt' && a.state !== 'raft' && a.state !== 'flung' && a.state !== 'dizzy' && MDS.flood < 4 && (mdWantSleep(a) || (E.shelter && h.type !== 'anemone')) && Math.abs(a.x - h.x) < 3200 && !a.nest) { a.tx = h.x; a.running = E.shelter; if (a.layer === 'water') a.ty = h.y - 10; if (a.layer === 'air') { a.flying = true; a.ty = h.y; a.landing = true; } mdSetState(a, 'gohome', 4); return true; }
  /* monitos */
  if (a.arb) return mdMonkeyThink(a);
  return false;
}
function mdMonkeyThink(a) {
  const E = MDS.E, sleep = mdWantSleep(a), canopy = a.inCanopy && a.tree && !a.tree.burnt && a.tree.burn <= 0, monkey = MD_MONKEY.has(a.sp) || a.sp === 'mono';
  if (a.tree && (a.tree.burn > 0 || a.tree.burnt) && a.inCanopy) { mdFall(a, 'fuego'); return true; }
  if (a.state === 'climb' && a.tree && !a.tree.burnt && a.tree.burn <= 0 && !a.down) { a.tx = a.tree.x; if (a.timer < 3) a.timer = 3; return true; }
  if (sleep && a.age >= 0.55) { if (canopy) { if (a.state !== 'sleep') mdSetState(a, 'sleep', 8); else a.timer = 8; if (Math.random() < 0.0012) mdFall(a, 'dormido'); return true; } if (a.state !== 'climb') { const tr = mdNearestTree(a.x, 900); if (tr) { a.tree = tr; a.tx = tr.x; mdSetState(a, 'climb', 8); return true; } } return false; }
  if (a.state === 'sleep' && canopy) { mdSetState(a, 'canopy', 4); a.say = { txt: mdLine(a), t: 2 }; return true; }
  if (a.state === 'swing' && Math.random() < 0.004) { mdFall(a, 'columpio'); return true; }
  if ((a.state === 'hang' || a.state === 'banana') && a.timer <= 0 && canopy) { mdSetState(a, 'canopy', 2 + Math.random() * 4); return true; }
  if ((a.state === 'hang' || a.state === 'banana' || a.state === 'groom' || a.state === 'chase') && a.timer > 0) { if (a.state === 'chase') { const o = MDS.an.find((q) => q.id === a.buddy && !q.dead); if (o) { a.tx = o.x; a.running = true; } } return true; }
  if (canopy && a.state === 'canopy' && a.timer <= 0 && monkey) { const r = Math.random(); if (r < 0.22) { mdSetState(a, 'hang', 3 + Math.random() * 3); mdSay(a, mdPick(['¡Mírenme!', '¡De cabeza!', 'Uuuh'])); return true; } if (r < 0.42 && a.tree.fruit) { mdSetState(a, 'banana', 4); a.hunger = Math.max(0, a.hunger - 0.25); mdSay(a, mdPick(['¡Ñam, plátano!', 'Mmm, fruta', '¡Qué rico!'])); return true; } }
  if (!canopy && monkey && (a.state === 'idle' || a.state === 'wander' || a.state === 'chat') && Math.random() < 0.25 && a.age >= 0.55) { const b = mdNear(a.x, 90).find((o) => o !== a && o.sp === a.sp && !o.dead && !o.inCanopy && o.age >= 0.4 && (o.state === 'idle' || o.state === 'wander' || o.state === 'chat')); if (b) { if (Math.random() < 0.55) { mdSetState(a, 'groom', 6); mdSetState(b, 'groom', 6); a.tx = a.x; b.tx = b.x; a.dir = b.x > a.x ? 1 : -1; b.dir = -a.dir; mdSay(a, mdPick(['Te quito los piojitos', 'Quieto, quieto…'])); b.say = { txt: mdLine(b), t: 2.2, delay: 0.9 }; } else { mdSetState(a, 'chase', 4); mdSetState(b, 'flee', 4); a.buddy = b.id; b.tx = mdCl(b.x + (b.x > a.x ? 1 : -1) * 300, 30, MDS.WW - 30); b.running = true; mdSay(a, '¡Te atrapo!'); b.say = { txt: mdLine(b), t: 2, delay: 0.5 }; } return true; } }
  if (a.sp === 'gorila' && Math.random() < 0.01) mdSay(a, '¡Pum, pum, pum!');
  return false;
}
function mdFall(a, why) { if (!a.inCanopy && a.up < 0.5) return; a.state = 'falling'; a.vy = 0; a.inCanopy = false; a.up = 0; a.fallWhy = why; a.say = { txt: mdLine(a), t: 1.6 }; }

/* ---------- envolver la inteligencia y el movimiento ---------- */
{ const base = mdThink; mdThink = function (a, dt) { if (mdVidaThink(a)) return; base(a, dt); if (a.arb && a.state === 'canopy' && a.up >= 0.99) a.inCanopy = true; if (a.arb && (a.state === 'climb' && a.down || a.state === 'idle' || a.state === 'wander' || a.state === 'flee' || a.state === 'graze') && a.up < 0.5) a.inCanopy = false; }; }
{ const base = mdMove; mdMove = function (a, dt) {
  if (a.inHome) { const h = MDS.homes.find((q) => q.id === a.inHome); if (!h) { a.inHome = 0; return; } const s = mdSlot(h, a); a.moving = false;
    if (h.type === 'burrow') { a.x = h.cx + s * 13; a.y = h.cy; } else if (h.type === 'cave') { a.x = h.x + s * 15; a.y = h.y + 0.5; } else if (h.type === 'seacave') { a.x = h.x + s * 10; a.y = h.y - 8; } else if (h.type === 'anemone') { a.x = h.x + Math.sin(MDS.t * 1.4 + a.id) * 14; a.y = h.y - 6 + Math.cos(MDS.t + a.id) * 5; a.ph += dt * 4; a.moving = true; } else { a.x = h.x; a.y = h.y; } return; }
  if (a.state === 'falling') { a.vy = (a.vy || 0) + 900 * dt; a.y += a.vy * dt; const g = mdGY(a.x) + (mdDepth(a.x) < 0 ? a.lane : 0); if (a.y >= g) { a.y = g; a.vy = 0; a.tree = null; a.up = 0; if (Math.random() < 0.12) { mdDie(a, a.fallWhy === 'dormido' ? 'se quedó dormido en una rama y se cayó del árbol' : a.fallWhy === 'fuego' ? 'cayó de un árbol en llamas' : 'se cayó de un árbol mientras se columpiaba'); } else { mdSetState(a, 'dizzy', 4); a.stun = 3; a.say = { txt: mdLine(a), t: 2.4 }; mdPuff(a.x, a.y - 4, 6, '#d9c8a0'); a.falls = (a.falls || 0) + 1; if (a.pet || Math.random() < 0.3) mdLog(`${a.S.n} ${a.name} se cayó de un árbol, pero está bien.`); } } return; }
  base(a, dt);
  if (a.arb && a.tree && a.up >= 0.99 && (a.state === 'canopy' || a.state === 'sleep' || a.state === 'hang' || a.state === 'banana')) a.inCanopy = true;
  if (a.arb && a.down && a.up <= 0.02 && a.state === 'climb') { a.down = false; a.up = 0; a.inCanopy = false; mdSetState(a, 'idle', 1); }
  if (a.arb && a.tree && a.inCanopy && (a.state === 'sleep' || a.state === 'hang' || a.state === 'banana' || a.state === 'canopy')) { a.up = 1; a.y = a.tree.y - a.tree.h * (0.5 + 0.2 * Math.sin(a.id)); }
}; }
{ const base = mdCanHunt; mdCanHunt = function (h, p) { if (p.inHome || (p.inCanopy && h.layer !== 'air')) return false; return base(h, p); }; }

/* ---------- muerte y animalitos con nombre ---------- */
function mdDie(a, cause) { if (a.dead) return; a.dead = true; a.cause = cause; MDS.stat.lost++; if (a.inHome) { const h = MDS.homes.find((q) => q.id === a.inHome); if (h) h.occ = h.occ.filter((i) => i !== a.id); } mdPetGone(a, cause); if (!a.pet && Math.random() < 0.6) mdLog(`${a.S.n} ${a.name} ${cause}.`); for (const k of MDS.an) if (k.mom === a.id) k.mom = 0; }
function mdPetGone(a, cause) { if (!a.pet) return; const p = (MDS.pets || []).find((q) => q.id === a.id); if (p) { p.dead = true; p.cause = cause; } mdLog(`Tu animalito ${a.name} (${a.S.n.toLowerCase()}) ${cause}.`); try { toast(`${a.name} ${cause}.`); } catch { /* */ } }
{ const base = mdKill; mdKill = function (prey, by) { const was = prey.dead; base(prey, by); if (!was && prey.dead) { prey.cause = by ? `fue cazado por ${by.S.n.toLowerCase()} ${by.name}` : 'murió'; mdPetGone(prey, prey.cause); } }; }
{ const base = mdActor; mdActor = function (a, dt) {
  if (!a.life) { a.life = (900 + Math.random() * 1200) * (a.S.z > 2 ? 1.6 : 1); if (a.born === 0 && MDS.t < 1) a.born = -Math.random() * a.life * 0.7; }
  if (a.state === 'hunt' && a.tgt) { const p = MDS.an.find((o) => o.id === a.tgt); if (p && p.inHome) { a.tgt = 0; a.running = false; mdSetState(a, 'idle', 2); a.cdHunt = MDS.t + 6; mdSay(a, mdPick(['¡Se escondió!', 'Grr… se me fue'])); } }
  const wasDead = a.state === 'dead'; base(a, dt); if (wasDead && a.dead && !a.cause) { a.cause = 'murió por un rayo en el agua'; mdPetGone(a, a.cause); }
  if (!a.dead && a.age >= 1 && MDS.t - a.born > a.life && (a.state === 'sleep' || a.state === 'home' || a.state === 'rest') && Math.random() < dt * 0.05) mdDie(a, 'murió de viejito, tranquilo y dormido');
}; }
{ const base = mdBuild; mdBuild = function (def) { base(def); mdBuildHomes(); }; }
{ const base = mdNew; mdNew = function (key, x, o) { const a = base(key, x, o); if (a && MDS.homes) mdPickHome(a); return a; }; }
Object.assign(MD_STATE, { home: 'Durmiendo en su refugio', homesafe: 'Protegido en su refugio', gohome: 'Va a su refugio', falling: '¡Se está cayendo del árbol!', hang: 'Colgado de cabeza de una rama', banana: 'Comiendo fruta en lo alto', groom: 'Espulgando a un amigo', chase: 'Jugando a las atrapadas' });

/* ---------- dibujo de refugios ---------- */
function mdHomeItems(items, x0, x1) { if (!MDS.homes) return; for (const h of MDS.homes) { if (h.x < x0 - 150 || h.x > x1 + 150) continue; items.push({ y: h.y - 0.6, draw: (c, t) => mdDrawHome(c, h, t, 'back'), bug: 1 }); if (h.type === 'cave' || h.type === 'seacave') items.push({ y: h.y + 0.7, draw: (c, t) => mdDrawHome(c, h, t, 'front'), bug: 1 }); } }
function mdDrawHome(c, h, time, part) {
  const soil = MDS.def.pal.soil; c.save(); c.translate(h.x, h.y);
  if (h.type === 'burrow' && part === 'back') { c.fillStyle = mdSh(soil, 0.12); c.beginPath(); c.ellipse(0, 0, 22, 9, 0, Math.PI, 0); c.fill(); c.fillStyle = '#1e140c'; c.beginPath(); c.ellipse(0, 0, 11, 7, 0, Math.PI, 0); c.fill(); }
  else if (h.type === 'cave') {
    if (part === 'back') { const col = MDS.def.clim.t < 0.3 ? '#a8b4c0' : '#8a8478'; c.fillStyle = mdSh(col, -0.1); c.beginPath(); c.moveTo(-120, 2); c.quadraticCurveTo(-120, -80, -60, -118); c.quadraticCurveTo(0, -150, 60, -112); c.quadraticCurveTo(122, -78, 120, 2); c.fill(); c.fillStyle = col; c.beginPath(); c.moveTo(-96, 2); c.quadraticCurveTo(-90, -70, -40, -100); c.quadraticCurveTo(10, -120, 50, -90); c.quadraticCurveTo(70, -60, 60, 2); c.fill(); if (h.snow) { c.fillStyle = '#f4f8fb'; c.beginPath(); c.moveTo(-70, -110); c.quadraticCurveTo(0, -158, 70, -108); c.quadraticCurveTo(0, -128, -70, -110); c.fill(); } c.fillStyle = '#16120e'; c.beginPath(); c.moveTo(-44, 2); c.quadraticCurveTo(-44, -60, 0, -64); c.quadraticCurveTo(44, -60, 44, 2); c.fill(); }
    else { c.globalAlpha = 0.45; c.fillStyle = '#16120e'; c.beginPath(); c.moveTo(-44, 2); c.quadraticCurveTo(-44, -60, 0, -64); c.quadraticCurveTo(44, -60, 44, 2); c.fill(); c.globalAlpha = 1; c.fillStyle = '#8a8478'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-26 + i * 16, -54 + (i % 2) * 4); c.lineTo(-22 + i * 16, -40 - (i % 2) * 6); c.lineTo(-18 + i * 16, -55 + (i % 2) * 4); c.fill(); } }
  }
  else if (h.type === 'log') { c.fillStyle = '#7a5a3a'; c.beginPath(); if (c.roundRect) c.roundRect(-46, -26, 92, 26, 12); else c.rect(-46, -26, 92, 26); c.fill(); c.strokeStyle = '#5a3f26'; c.lineWidth = 1.4; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-36 + i * 20, -22); c.lineTo(-30 + i * 20, -6); c.stroke(); } c.fillStyle = '#c8a070'; c.beginPath(); c.ellipse(44, -13, 7, 13, 0, 0, mdTau); c.fill(); c.fillStyle = '#1e140c'; c.beginPath(); c.ellipse(44, -13, 4.5, 9, 0, 0, mdTau); c.fill(); c.fillStyle = '#5a9a4a'; mdE(c, -20, -26, 9, 4); mdE(c, -8, -27, 6, 3); if (h.occ.length) mdEyesGlow(c, 44, -14, time, h); }
  else if (h.type === 'hollow') { c.fillStyle = '#2a1a10'; c.beginPath(); c.ellipse(0, 0, 7, 10, 0, 0, mdTau); c.fill(); c.strokeStyle = '#8a6a48'; c.lineWidth = 2; c.stroke(); if (h.occ.length) mdEyesGlow(c, 0, -1, time, h); }
  else if (h.type === 'barn') { if (h.occ.length) { c.fillStyle = 'rgba(255,240,200,.85)'; c.font = '600 11px system-ui'; c.fillText(`${h.occ.length} adentro`, -24, -135); } }
  else if (h.type === 'seacave' && part === 'back') { c.fillStyle = '#4a5a68'; c.beginPath(); c.moveTo(-70, 4); c.quadraticCurveTo(-66, -60, -10, -70); c.quadraticCurveTo(60, -70, 70, 4); c.fill(); c.fillStyle = '#5a6a78'; mdE(c, -30, -48, 22, 12); c.fillStyle = '#0a1018'; c.beginPath(); c.moveTo(-30, 4); c.quadraticCurveTo(-30, -34, 0, -36); c.quadraticCurveTo(30, -34, 30, 4); c.fill(); c.fillStyle = '#d46aff'; mdE(c, 46, -44, 5, 5); c.fillStyle = '#ff7a8a'; mdE(c, -52, -30, 4, 4); }
  else if (h.type === 'seacave') { c.globalAlpha = 0.4; c.fillStyle = '#0a1018'; c.beginPath(); c.moveTo(-30, 4); c.quadraticCurveTo(-30, -34, 0, -36); c.quadraticCurveTo(30, -34, 30, 4); c.fill(); c.globalAlpha = 1; }
  else if (h.type === 'lodge') { c.fillStyle = '#7a5a34'; c.beginPath(); c.ellipse(0, 0, 54, 34, 0, Math.PI, 0); c.fill(); c.strokeStyle = '#5a3f22'; c.lineWidth = 2; for (let i = 0; i < 12; i++) { const a = Math.PI + (i / 11) * Math.PI; c.beginPath(); c.moveTo(Math.cos(a) * 20, Math.sin(a) * 12); c.lineTo(Math.cos(a) * 56, Math.sin(a) * 36); c.stroke(); } }
  c.restore();
}
function mdEyesGlow(c, x, y, time, h) { const blink = Math.sin(time * 0.002 + h.id) > 0.92; if (blink) return; c.fillStyle = MDS.E.night > 0.5 ? '#fff3a0' : '#f4efe0'; mdE(c, x - 2.2, y, 1.3, 1.3); mdE(c, x + 2.2, y, 1.3, 1.3); }
function mdDrawBurrowsUnder(c, x0, x1) { if (!MDS.homes) return; const soil = MDS.def.pal.soil; for (const h of MDS.homes) { if (h.type !== 'burrow' || h.x < x0 - 150 || h.x > x1 + 150) continue; c.strokeStyle = mdSh(soil, -0.38); c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(h.x, h.y); c.quadraticCurveTo(h.x, h.cy - 20, h.cx, h.cy - 6); c.stroke(); c.fillStyle = mdSh(soil, -0.4); mdE(c, h.cx, h.cy - 10, 26 + h.occ.length * 5, 16); c.fillStyle = '#c8a860'; mdE(c, h.cx, h.cy + 2, 24 + h.occ.length * 4, 4); } }
{ const base = mdDrawUnder; mdDrawUnder = function (c, x0, x1, y0, y1, time, E) { base(c, x0, x1, y0, y1, time, E); mdDrawBurrowsUnder(c, x0, x1); }; }
