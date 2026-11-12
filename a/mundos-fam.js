/* Cinnavia 7.55 — MUNDOS · familias (1 macho, 1 hembra, 1 cría por especie), textos realistas, restos y carroñeros, heridas, nombres y lista de animales. */
'use strict';
const MD_NM = ['Bruno', 'Max', 'Toby', 'Rocky', 'Simón', 'Teo', 'Lucas', 'Nico', 'Otto', 'Félix', 'Gael', 'Darío', 'Iván', 'Pablo', 'Rafa', 'Sergio', 'Tomás', 'Ulises', 'Mateo', 'Hugo', 'Leo', 'Bernardo', 'Dante', 'Ramiro'];
const MD_NF = ['Luna', 'Nube', 'Mora', 'Canela', 'Coco', 'Olivia', 'Perla', 'Alba', 'Lola', 'Mía', 'Flor', 'Kiara', 'Nala', 'Sol', 'Dulce', 'Pepa', 'Lía', 'Rosa', 'Tina', 'Vera', 'Ximena', 'Zoe', 'Aurora', 'Brisa'];
{ const base = mdNew; mdNew = function (k, x, o) { const a = base(k, x, o); if (a && !(o && o.name)) { const pool = a.male ? MD_NM : MD_NF; let n = mdPick(pool), g = 0; while (g++ < 6 && MDS.an.some((q) => q.sp === k && q.name === n && q !== a)) n = mdPick(pool); a.name = n; } return a; }; }

/* ---------- ruidos y sonidos reales (sin texto hablado) ---------- */
const MD_CALL = {
  perro: ['Guau', 'bark'], gato: ['Miau', 'squeak'], vaca: ['Muuu', 'low'], oveja: ['Beee', 'low'], cabra: ['Meee', 'low'], cerdo: ['Oink', 'growl'], caballo: ['Iiiih', 'whinny'], pony: ['Iiiih', 'whinny'], burro: ['Iaaah', 'whinny'], alpaca: ['Hmmm', 'low'],
  gallina: ['Cloc cloc', 'tweet'], pavo: ['Glu glu', 'tweet'], pato: ['Cuac', 'tweet'], lobo: ['Auuu', 'howl'], coyote: ['Auuu', 'howl'], dingo: ['Auuu', 'howl'], zorro: ['Yip', 'bark'], zorroart: ['Yip', 'bark'], leon: ['Grrraoo', 'growl'], tigre: ['Grrr', 'growl'], jaguar: ['Grrr', 'growl'], puma: ['Rrraao', 'growl'], pantera: ['Rrraao', 'growl'], leopnieve: ['Grrr', 'growl'], lince: ['Miau', 'growl'], ocelote: ['Rrrr', 'growl'], oso: ['Grrr', 'growl'], osopolar: ['Grrr', 'growl'], hiena: ['Jii jii jii', 'bark'],
  elefante: ['Pruuum', 'trumpet'], rino: ['Fffh', 'growl'], hipo: ['Hooonk', 'low'], jirafa: null, cebra: ['Iji iji', 'whinny'], bufalo: ['Muuu', 'low'], bisonte: ['Gruuu', 'low'], venado: ['Bruu', 'low'], ciervorojo: ['Buuur', 'low'], alce: ['Buuur', 'low'],
  rana: ['Croac', 'croak'], ranaflecha: ['Tri tri', 'croak'], ajolote: null, serpiente: ['Ssss', 'hiss'], cocodrilo: ['Grrooar', 'growl'], lagarto: null, iguana: null,
  mono: ['Uh uh ah', 'ooh'], monoarana: ['Iih iih', 'ooh'], titi: ['Tsii', 'squeak'], capuchino: ['Iih iih', 'ooh'], aullador: ['Uuuaaa', 'growl'], gibon: ['Uu-aa-aa', 'ooh'], gorila: ['Uh uh', 'growl'], orangutan: ['Hmmmm', 'low'], lemur: ['Oo oo', 'ooh'], babuino: ['Uagh', 'bark'], mandril: ['Uagh', 'bark'], macaco: ['Kya', 'ooh'], colobo: ['Rrr', 'growl'], langur: ['Kheh', 'bark'], monoardilla: ['Chii chii', 'squeak'], tamarino: ['Tsii', 'squeak'],
  buho: ['Uu uuu', 'tweet'], buhonieve: ['Uu uuu', 'tweet'], aguila: ['Kiii', 'tweet'], harpia: ['Kiii', 'tweet'], halcon: ['Kii kii', 'tweet'], loro: ['Craa', 'tweet'], guacamaya: ['Raaak', 'tweet'], cacatua: ['Kriii', 'tweet'], tucan: ['Rrrak', 'tweet'], colibri: ['Zzzz', 'tweet'], cuervo: ['Cra cra', 'tweet'], paloma: ['Currr', 'tweet'], gorrion: ['Pip pip', 'tweet'], canario: ['Tuiu tuiu', 'tweet'], cardenal: ['Chip chip', 'tweet'], gaviota: ['Kiaa', 'tweet'], pinguino: ['Kuak', 'low'], flamenco: ['Honk', 'tweet'], pavoreal: ['Miaaau', 'tweet'], quetzal: ['Kiuu', 'tweet'], hoatzin: ['Cruaa', 'tweet'], ibisrojo: ['Hrr', 'tweet'], garza: ['Kraak', 'tweet'], cigueña: ['Clac clac', 'tweet'], pelicano: null, buitre: ['Hsss', 'hiss'], condor: null,
  ardilla: ['Chrr chrr', 'squeak'], suricata: ['Wiik', 'squeak'], marmota: ['Fiiii', 'squeak'], raton: ['Iii', 'squeak'], hamster: null, cuyo: ['Wiik wiik', 'squeak'], conejo: null, liebre: null,
  ballena: ['Uuuuuu', 'whale'], jorobada: ['Uuuuuu', 'whale'], orca: ['Iii-uu', 'whale'], delfin: ['Ii ii ii', 'squeak'], narval: null, beluga: ['Iii-uu', 'whale'], foca: ['Auk auk', 'bark'], leonmarino: ['Aurr aurr', 'bark'], morsa: ['Hoonk', 'low'], manati: null
};
function mdCallOf(a) { if (!a || !a.S) return null; const k = a.sp, c = MD_CALL[k]; if (c === null) return null; if (c) return c; const S = a.S; if (S.t === 'f') return null; if (S.t === 'b') return ['Pío', 'tweet']; if (S.sh === 'frog') return ['Croac', 'croak']; if (S.t === 'x') return null; return S.d === 'c' ? ['Grrr', 'growl'] : ['Mmmh', 'low']; }
function mdLine(a) { const c = mdCallOf(a); return c ? c[0] : null; }
/* sonido sintetizado (se activa con el botón Sonido) */
const MD_AU = { ctx: null };
function mdPlay(a, kind) {
  if (!MDV.sound || !MD_AU.ctx) return; const vw = typeof mdVW === 'function' ? mdVW() : 800, d = Math.abs(a.x - (MDV.camX + vw / 2)); if (d > vw * 0.65) return; const vol = 0.14 * (1 - d / (vw * 0.65)) * Math.min(1, 0.6 + (MDV.zoom || 1) * 0.3); if (vol <= 0.005) return;
  const ctx = MD_AU.ctx, t0 = ctx.currentTime, g = ctx.createGain(); g.connect(ctx.destination); g.gain.setValueAtTime(0.0001, t0);
  const env = (dur, atk = 0.04) => { g.gain.linearRampToValueAtTime(vol, t0 + atk); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); };
  const osc = (type, f0, f1, dur, lp) => { const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.linearRampToValueAtTime(f1, t0 + dur); let n = o; if (lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); n = f; } n.connect(g); o.start(t0); o.stop(t0 + dur + 0.05); return o; };
  const noise = (dur, hp) => { const len = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; const s = ctx.createBufferSource(); s.buffer = buf; const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; s.connect(f); f.connect(g); s.start(t0); };
  const j = 0.85 + Math.random() * 0.3;
  if (kind === 'tweet') { env(0.5, 0.01); for (let i = 0; i < 3; i++) { const o = ctx.createOscillator(); o.type = 'sine'; const s = t0 + i * 0.12; o.frequency.setValueAtTime(2600 * j, s); o.frequency.linearRampToValueAtTime(3800 * j, s + 0.07); o.connect(g); o.start(s); o.stop(s + 0.09); } }
  else if (kind === 'low') { env(1.0, 0.1); osc('sawtooth', 110 * j, 85 * j, 1.0, 420); }
  else if (kind === 'howl') { env(1.8, 0.2); const o = osc('sine', 380 * j, 640 * j, 1.8); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5; lg.gain.value = 14; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + 1.9); }
  else if (kind === 'growl') { env(0.9, 0.08); const o = osc('sawtooth', 70 * j, 55 * j, 0.9, 300); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 24; lg.gain.value = 20; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + 1); }
  else if (kind === 'croak') { env(0.6, 0.01); for (let i = 0; i < 3; i++) { const o = ctx.createOscillator(); o.type = 'square'; const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; o.frequency.value = 170 * j; o.connect(f); f.connect(g); o.start(t0 + i * 0.15); o.stop(t0 + i * 0.15 + 0.08); } }
  else if (kind === 'hiss') { env(0.9, 0.1); noise(0.9, 3800); }
  else if (kind === 'squeak') { env(0.25, 0.01); osc('sine', 1700 * j, 2500 * j, 0.22); }
  else if (kind === 'whinny') { env(1.0, 0.05); const o = osc('sawtooth', 520 * j, 380 * j, 1.0, 1400); const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 9; lg.gain.value = 40; l.connect(lg); lg.connect(o.frequency); l.start(t0); l.stop(t0 + 1.1); }
  else if (kind === 'bark') { env(0.3, 0.005); noise(0.12, 900); osc('sawtooth', 380 * j, 260 * j, 0.25, 1200); }
  else if (kind === 'ooh') { env(0.8, 0.02); for (let i = 0; i < 3; i++) { const o = ctx.createOscillator(); o.type = 'triangle'; const s = t0 + i * 0.2; o.frequency.setValueAtTime(520 * j, s); o.frequency.linearRampToValueAtTime(880 * j, s + 0.14); o.connect(g); o.start(s); o.stop(s + 0.17); } }
  else if (kind === 'trumpet') { env(1.2, 0.1); osc('sawtooth', 280 * j, 520 * j, 1.2, 1600); }
  else if (kind === 'whale') { env(2.4, 0.4); osc('sine', 120 * j, 210 * j, 2.4); }
}
function mdVoiceNow(a) { const c = mdCallOf(a); if (!c) return false; a.say = { txt: c[0], t: 2.6 }; a.talkT = MDS.t + 12 + Math.random() * 20; mdPlay(a, c[1]); return true; }
mdSay = function (a) { if (a.say && a.say.t > 0) return; mdVoiceNow(a); };
mdVoice = function (a) { return mdLine(a); };

/* ---------- familias: un macho, una hembra y una cría por especie ---------- */
function mdYoungOf(sp) { let n = 0; for (const a of MDS.an) if (a.sp === sp && !a.dead && a.age < 1) n++; for (const q of MDS.nests) if (q.sp === sp) n++; return n; }
function mdFamInit() {
  const by = {}; for (const a of MDS.an) (by[a.sp] = by[a.sp] || []).push(a);
  const keep = new Set();
  for (const key in MDS.init) {
    const S = MD_SP[key]; if (!S || S.rb) continue; const L = by[key] || [];
    const m = L.find((a) => a.male && a.age >= 1), f = L.find((a) => !a.male && a.age >= 1 && a !== m); let y = L.find((a) => a.age < 1);
    const base = m || f || L[0]; const x0 = base ? base.x : mdSpawnX(key); if (x0 == null) continue;
    const mk = (male, o) => { const a = mdNew(key, mdCl(x0 + (mdR() - 0.5) * 60, 40, MDS.WW - 40), Object.assign({ male }, o || {})); return a; };
    const M = m || mk(true), F = f || mk(false); if (!y) { y = mk(mdR() < 0.5, { age: 0.3, mom: F ? F.id : 0 }); if (y) { y.age = 0.3; } }
    for (const a of [M, F, y]) if (a) keep.add(a);
    MDS.init[key] = 3;
  }
  MDS.an = MDS.an.filter((a) => a.S.rb || MDS.init[a.sp] == null || keep.has(a));
  MDS.fam = {}; MDS.carc = []; MDS.famT = 0; MDS.talkT = 0;
}
{ const base = mdBuild; mdBuild = function (def) { base(def); mdFamInit(); }; }
function mdFamArrive(key, male) {
  const S = MD_SP[key]; if (!S) return; const edge = !MDS.sea && S.t !== 'f' && mdLayer(key) === 'land'; const x = edge ? (mdR() < 0.5 ? 60 : MDS.WW - 60) : mdSpawnX(key); if (x == null) return;
  const a = mdNew(key, x, { male }); if (a) { a.hunger = 0.3; mdLog(`Llega ${male ? 'un ' + S.n.toLowerCase() + ' macho' : 'una ' + S.n.toLowerCase() + ' hembra'} de tierras lejanas.`); }
}
function mdFamily() {
  if (!MDS.init) return; const by = {}; for (const a of MDS.an) if (!a.dead) (by[a.sp] = by[a.sp] || []).push(a);
  for (const key in MDS.init) {
    const S = MD_SP[key]; if (!S || S.rb) continue; const L = by[key] || [], fam = MDS.fam[key] = MDS.fam[key] || { m: 0, f: 0 };
    const M = L.filter((a) => a.male && a.age >= 1), F = L.filter((a) => !a.male && a.age >= 1);
    if (!M.length) { if (!fam.m) fam.m = MDS.t; else if (MDS.t - fam.m > 35) { fam.m = 0; mdFamArrive(key, true); } } else fam.m = 0;
    if (!F.length) { if (!fam.f) fam.f = MDS.t; else if (MDS.t - fam.f > 35) { fam.f = 0; mdFamArrive(key, false); } } else fam.f = 0;
    for (const G of [M, F]) if (G.length > 1) { const cand = G.filter((a) => !a.pet && !a.leave).sort((p, q) => q.born - p.born)[0]; if (cand) { cand.leave = MDS.t; mdLog(`${cand.S.n} ${cand.name} se va a buscar su propio territorio.`); } }
    if (!mdYoungOf(key) && M.length && F.length) for (const f of F) if (!f.preg && f.cd > 8) f.cd = 8;
  }
}
function mdFamTick(dt) {
  MDS.famT -= dt; if (MDS.famT <= 0) { MDS.famT = 1; mdFamLeave(); mdCarrion(); }
  MDS.talkT -= dt; if (MDS.talkT <= 0) {
    MDS.talkT = 1.6; const vw = typeof mdVW === 'function' ? mdVW() : 800, x0 = MDV.camX - 60, x1 = MDV.camX + vw + 60; let live = 0; for (const a of MDS.an) if (a.say && a.say.t > 0 && a.x > x0 && a.x < x1) live++;
    if (live < 4) for (const a of MDS.an) { if (a.dead || a.inHome || a.say || a.x < x0 || a.x > x1 || (a.talkT || 0) > MDS.t) continue; if (Math.random() < 0.22) { if (mdVoiceNow(a) && ++live >= 4) break; } else a.talkT = MDS.t + 3; }
  }
  MDS.rosT = (MDS.rosT || 0) - dt; if (MDS.rosT <= 0) { MDS.rosT = 2; mdRosterRender(); }
}
function mdFamLeave() {
  for (const a of MDS.an) { if (!a.leave || a.dead) continue; const left = a.x < MDS.WW / 2; a.tx = left ? 20 : MDS.WW - 20; if (a.state !== 'sleep' && a.state !== 'flung' && a.state !== 'falling' && !a.inHome) { if (a.state !== 'wander' && a.state !== 'fly') mdSetState(a, a.flying ? 'fly' : 'wander', 3); a.timer = Math.max(a.timer, 2); } if (a.x < 45 || a.x > MDS.WW - 45 || MDS.t - a.leave > 80) { a.dead = true; a.leaving = true; } }
}
{ const base = mdUpdate; mdUpdate = function (dt) { base(dt); if (MDS.def) { mdFamTick(Math.min(dt, 0.05) * (MDS.speed || 1)); } }; }

/* ---------- realismo: restos, carroñeros, heridas, digestión ---------- */
const MD_SCAV = new Set(['hiena', 'coyote', 'zorro', 'zorroart', 'dingo', 'lobo', 'leon', 'oso', 'osopolar', 'jaguar', 'tigre', 'puma']);
{ const base = mdDie; mdDie = function (a, cause) { const was = a.dead; base(a, cause); if (!was && a.dead && (a.layer === 'land') && !MDS.sea && a.age >= 0.5 && !/cazado/.test(cause || '')) MDS.carc.push({ x: a.x, y: a.y, sp: a.sp, t: MDS.t, z: a.S.z, col: a.S.look && a.S.look.c || '#8a7a6a', left: 1, dir: a.dir }); }; }
function mdCarrion() { if (!MDS.carc) return; MDS.carc = MDS.carc.filter((c) => c.left > 0 && MDS.t - c.t < 200); }
{ const base = mdThink; mdThink = function (a, dt) {
  if (a.state === 'dizzy' && !a.hurtSet) { a.hurtSet = true; a.hurt = MDS.t + 80 + Math.random() * 40; } else if (a.state !== 'dizzy') a.hurtSet = false;
  if (a.digest > MDS.t && a.layer === 'land' && !a.inHome && (a.state === 'idle' || a.state === 'wander' || a.state === 'hunt')) { mdSetState(a, 'rest', 4); return; }
  if (MD_SCAV.has(a.sp) && a.layer === 'land' && !a.inHome && a.hunger > 0.4 && a.age >= 1 && MDS.carc && MDS.carc.length && a.state !== 'flee' && a.state !== 'sleep') {
    let c = null, bd = 900; for (const q of MDS.carc) { const d = Math.abs(q.x - a.x); if (d < bd && q.left > 0) { bd = d; c = q; } }
    if (c) { if (bd > 36) { a.tx = c.x; a.running = false; if (a.state !== 'wander') mdSetState(a, 'wander', 3); a.timer = Math.max(a.timer, 2); return; } mdSetState(a, 'eat', 2); a.tx = a.x; a.hunger = Math.max(0, a.hunger - 0.035); c.left -= 0.012; if (!c.logged) { c.logged = true; mdLog(`${a.S.n} ${a.name} se alimenta de los restos de ${MD_SP[c.sp].n.toLowerCase()}.`); } return; }
  }
  base(a, dt);
}; }
{ const base = mdKill; mdKill = function (prey, by) { const was = prey.dead; base(prey, by); if (!was && prey.dead && by) { by.digest = MDS.t + 30; by.hunger = Math.max(0, by.hunger - 0.1); } }; }
function mdDrawCarc(c, q, time) {
  const z = 0.7 + (q.z || 1) * 0.5, age = MDS.t - q.t, al = Math.max(0.25, 1 - age / 220); c.save(); c.translate(q.x, q.y); c.globalAlpha = al;
  c.fillStyle = 'rgba(0,0,0,.15)'; mdE(c, 0, 1, 15 * z, 3); if (age < 80) { c.fillStyle = mdSh(q.col, -0.3); mdE(c, 0, -3 * z, 12 * z * (q.left * 0.5 + 0.5), 4 * z); }
  c.strokeStyle = '#e8e2d0'; c.lineWidth = 1.2; c.lineCap = 'round'; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(i * 4 * z, -1); c.quadraticCurveTo(i * 4 * z + 1, -7 * z, i * 4 * z + 3, -1); } c.moveTo(-12 * z, -1); c.lineTo(12 * z, -1); c.stroke(); c.restore();
}
function mdCarcItems(items, x0, x1) { if (!MDS.carc) return; for (const q of MDS.carc) if (q.x > x0 - 100 && q.x < x1 + 100) items.push({ y: q.y + 0.02, bug: 1, draw: (c, t) => mdDrawCarc(c, q, t) }); }

/* ---------- lista de animales (botón bajo el mundo) ---------- */
function mdRosterHTML() {
  const by = {}; for (const a of MDS.an) if (!a.dead && !a.S.rb) (by[a.sp] = by[a.sp] || []).push(a);
  const keys = Object.keys(by).sort((p, q) => MD_SP[p].n.localeCompare(MD_SP[q].n, 'es'));
  const row = (a) => `<li class="md-rrow"><button type="button" class="md-petb" data-act="md-findpet" data-id="${a.id}"><b>${esc(a.name)}</b> · ${a.age < 1 ? 'Cría' : a.male ? 'Macho' : 'Hembra'}${a.leave ? ' · se va' : ''} — ${esc(MD_STATE[a.state] || 'Tranquilo')}</button><button type="button" class="md-star ${a.pet ? 'on' : ''}" data-act="md-mark" data-id="${a.id}" aria-label="Marcar">${a.pet ? 'Marcado' : 'Marcar'}</button></li>`;
  const marked = MDS.an.filter((a) => a.pet && !a.dead);
  return (marked.length ? `<h3 class="md-rh">Marcados</h3><ul class="md-log">${marked.map(row).join('')}</ul>` : '') + keys.map((k) => `<h3 class="md-rh">${esc(MD_SP[k].n)}</h3><ul class="md-log">${by[k].sort((p, q) => q.age - p.age).map(row).join('')}</ul>`).join('');
}
function mdRosterRender() { const el = document.getElementById('mdRoster'); if (!el || el.hidden) return; if (MDV.editing) return; el.innerHTML = mdRosterHTML(); }
Object.assign(VIDA_ACTS, {
  'md-sound': () => { MDV.sound = !MDV.sound; if (MDV.sound) { try { MD_AU.ctx = MD_AU.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (MD_AU.ctx.state === 'suspended') MD_AU.ctx.resume(); } catch { MDV.sound = false; toast('Tu dispositivo no permite sonido aquí.'); } } const b = document.querySelector('[data-act=md-sound]'); if (b) b.textContent = MDV.sound ? 'Sonido: encendido' : 'Sonido: apagado'; },
  'md-roster': () => { const el = document.getElementById('mdRoster'), b = document.querySelector('[data-act=md-roster]'); if (!el) return; el.hidden = !el.hidden; if (b) b.textContent = el.hidden ? 'Animales y nombres' : 'Ocultar animales y nombres'; if (!el.hidden) el.innerHTML = mdRosterHTML(); },
  'md-mark': (el) => { const a = MDS.an.find((o) => o.id === +el.dataset.id && !o.dead); if (!a) return; a.pet = !a.pet; MDS.pets = MDS.pets || []; const i = MDS.pets.findIndex((p) => p.id === a.id); if (a.pet && i < 0) MDS.pets.push({ id: a.id, name: a.name, sp: a.sp }); if (!a.pet && i >= 0) MDS.pets.splice(i, 1); mdRosterRender(); }
});
