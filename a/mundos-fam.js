/* Cinnavia 7.55 — MUNDOS · familias (1 macho, 1 hembra, 1 cría por especie), textos realistas, restos y carroñeros, heridas, nombres y lista de animales. */
'use strict';
const MD_NM = ['Bruno', 'Max', 'Toby', 'Rocky', 'Simón', 'Teo', 'Lucas', 'Nico', 'Otto', 'Félix', 'Gael', 'Darío', 'Iván', 'Pablo', 'Rafa', 'Sergio', 'Tomás', 'Ulises', 'Mateo', 'Hugo', 'Leo', 'Bernardo', 'Dante', 'Ramiro'];
const MD_NF = ['Luna', 'Nube', 'Mora', 'Canela', 'Coco', 'Olivia', 'Perla', 'Alba', 'Lola', 'Mía', 'Flor', 'Kiara', 'Nala', 'Sol', 'Dulce', 'Pepa', 'Lía', 'Rosa', 'Tina', 'Vera', 'Ximena', 'Zoe', 'Aurora', 'Brisa'];
{ const base = mdNew; mdNew = function (k, x, o) { const a = base(k, x, o); if (a && !(o && o.name)) { const pool = a.male ? MD_NM : MD_NF; let n = mdPick(pool), g = 0; while (g++ < 6 && MDS.an.some((q) => q.sp === k && q.name === n && q !== a)) n = mdPick(pool); a.name = n; } return a; }; }

/* ---------- textos realistas ---------- */
const MD_TXT = {
  idle: ['Observo los alrededores con calma.', 'Quieto: así gasto menos energía.', 'Huelo el aire; todo parece tranquilo.', 'Vigilo que nada se acerque.', 'Escucho ramas y pasos lejanos.', 'Me oriento por el olor del viento.'],
  wander: ['Recorro mi territorio de siempre.', 'Sigo el rastro de ayer.', 'Busco un sitio con mejor comida.', 'Camino contra el viento para oler más.', 'Reviso los límites de mi zona.', 'Avanzo despacio para no llamar la atención.'],
  graze: ['Mastico despacio: la hierba es dura.', 'La hierba tierna crece junto al agua.', 'Como un poco aquí y avanzo.', 'Con la cabeza baja pierdo vigilancia.', 'Llenar el estómago ahora, rumiar luego.'],
  browse: ['Rasco el fondo buscando algas.', 'Las algas jóvenes son las más tiernas.', 'Pico plantas pegadas a las rocas.'],
  plank: ['Filtro el agua: cada trago es comida.', 'El plancton sube de noche; espero.', 'Dejo pasar la corriente por la boca.'],
  fruit: ['Esta fruta está en su punto.', 'Las semillas viajarán en mi panza.', 'Elijo las frutas más blandas.', 'Sin fruta caída tendré que subir.'],
  drink: ['Bebo rápido y miro alrededor.', 'Los abrevaderos son zona de riesgo.', 'Con sed no se piensa: agua primero.'],
  flee: ['¡Algo me persigue, corro en zigzag!', 'Hay que llegar a un refugio ya.', 'No miro atrás: cada segundo cuenta.', 'El zigzag complica al que me persigue.'],
  hunt: ['Me acerco contra el viento.', 'Elijo al más lento del grupo.', 'Mejor esperar un buen momento.', 'Agazapado, sin hacer ruido.', 'Cada persecución gasta mucha energía.'],
  eat: ['Como rápido: otros vendrán por lo suyo.', 'Aprovecho cada bocado.', 'Después de comer toca descansar.'],
  rest: ['Descanso para digerir tranquilo.', 'Cierro los ojos pero sigo escuchando.', 'Recupero fuerzas para después.'],
  sleep: ['Zzz… duermo ligero, atento a ruidos.', 'Zzz… un sitio seguro para dormir.', 'Zzz… la noche es para descansar.'],
  shelter: ['La tormenta pasa antes si me abrigo.', 'Mejor esperar bajo cubierto.', 'Con tanta lluvia no se ve ni se huele.'],
  raft: ['Me agarro: el agua sube muy rápido.', 'Nadar cansa; este tronco flota.', 'Cuando baje el agua vuelvo a casa.'],
  fly: ['Aprovecho una corriente cálida y planeo.', 'Desde arriba veo todo el valle.', 'Vuelo bajo para evitar el viento.'],
  perch: ['Desde esta rama vigilo mi territorio.', 'Me acicalo las plumas una por una.', 'Canto para marcar mi espacio.'],
  brood: ['Giro los huevos para que se calienten parejo.', 'No puedo dejar el nido ni un rato.', 'Mantengo los huevos calientes.'],
  nestbuild: ['Traigo ramitas y hierba para el nido.', 'Un nido firme aguanta viento y lluvia.', 'Elijo un sitio alto y escondido.'],
  feed: ['Las crías piden comida cada poco rato.', 'Les traigo lo más tierno que encuentro.', 'Cuido que ningún depredador las vea.'],
  follow: ['Sigo de cerca a mamá, no me separo.', 'Aprendo mirando lo que hace mamá.', 'Si me pierdo, me encuentra por el olor.'],
  climb: ['Subo agarrando bien con manos y pies.', 'Arriba hay menos peligro y más fruta.', 'Un pie, una mano, sin mirar abajo.'],
  canopy: ['Entre las hojas nadie me ve.', 'Desde la copa se ve todo el bosque.', 'La rama aguanta, pero con cuidado.'],
  swing: ['Me suelto de una liana a la siguiente.', 'Calculo la distancia antes de saltar.', 'La cola ayuda a no perder el agarre.'],
  swim: ['Nado despacio, ahorrando energía.', 'La corriente me lleva sin esfuerzo.', 'Sigo la zona con más comida.'],
  school: ['Nado pegado al grupo: más ojos ven más.', 'Giro con el cardumen para confundir.', 'En el centro del grupo estoy más seguro.'],
  dizzy: ['Me duele el golpe, me quedo quieto.', 'Todo da vueltas, necesito un momento.'],
  panic: ['El suelo tiembla, hay que alejarse.', 'Algo pasa; mejor no quedarme aquí.'],
  chat: ['Intercambio señales con el grupo.', 'Aviso con un sonido que estoy aquí.', 'Respondo al llamado de otros.'],
  mate: ['Es época de buscar pareja.', 'Marco territorio para atraer pareja.'],
  nest: ['Me quedo en el nido, es lo más seguro.', 'Aún no sé volar; espero a mis padres.'],
  play: ['Jugar enseña a cazar sin riesgo.', 'Corro y brinco: fortalezco las patas.', 'Jugar entrena para la vida adulta.'],
  home: ['En mi refugio hay silencio y calor.', 'Aquí dentro estoy a salvo.', 'Descanso resguardado.'],
  gohome: ['Se acerca la noche: vuelvo a mi refugio.', 'Mejor guardarme antes de que llueva.'],
  hang: ['Cuelgo de la liana con cola y brazos.', 'Los brazos largos sirven para columpiarse.', 'Desde aquí vigilo el suelo.'],
  banana: ['Pelo el plátano antes de comer.', 'Pruebo si el plátano está maduro.', 'Bajo un racimo para compartir.'],
  groom: ['Quitar parásitos une al grupo.', 'Acicalar es también hacer amigos.', 'Le reviso el pelo con paciencia.'],
  chase: ['Persigo en juego, sin morder.', 'Corremos para ver quién gana.'],
  falling: ['¡Perdí el agarre!', '¡La rama cedió!'],
  eatcarr: ['Aprovecho los restos: nada se desperdicia.', 'Comer carroña ahorra una cacería.', 'Limpio lo que otros dejaron.']
};
const MD_CTX = {
  rain: ['La lluvia borra mis huellas.', 'Con lluvia hay más lombrices y brotes.', 'Me mojo: busco dónde cubrirme.'],
  storm: ['Los truenos me ponen en alerta.', 'Evito el árbol más alto.'],
  night: ['De noche mis sentidos trabajan más.', 'La oscuridad ayuda a pasar desapercibido.', 'Hace frío: me acurruco.'],
  snow: ['La nieve tapa la comida; hay que escarbar.', 'Gasto más energía para mantenerme caliente.'],
  hot: ['El calor cansa: busco sombra y agua.', 'Me muevo poco en las horas de más sol.'],
  hungryH: ['Llevo horas sin comer.', 'Necesito encontrar comida pronto.'],
  hungryC: ['Tengo mucha hambre: hoy debo cazar.', 'Sin presa hoy, mañana habrá menos fuerza.'],
  hungryF: ['Busco algo que comer en la corriente.', 'El hambre me lleva a zonas nuevas.'],
  cub: ['¡Mamá, ven!', 'Tengo hambre.', 'Todo es nuevo y enorme.', 'Me quedo cerca de mamá.'],
  hurt: ['Me duele; voy más despacio.', 'La herida sana con descanso.', 'Cojear me hace blanco fácil.'],
  flung: ['El viento me levanta, no hay dónde agarrarse.', 'Giro sin control.'],
  fallhit: ['Caí de muy alto; el golpe duele.', 'Mi cuerpo aguantó, esta vez.'],
  wake: ['Amanece: hay que buscar comida.', 'Me estiro y reviso los alrededores.']
};
function mdLine(a, ctx) {
  const E = MDS.E || {}, S = a.S, W = MDS.def, pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  if (ctx && MD_CTX[ctx]) return pick(MD_CTX[ctx]);
  if (a.hurt > MDS.t && Math.random() < 0.5) return pick(MD_CTX.hurt);
  if (a.age < 0.5 && Math.random() < 0.55) return S.t === 'b' && a.state === 'nest' ? 'Pi pi pi… ¡tengo hambre!' : pick(MD_CTX.cub);
  const r = Math.random();
  if (r < 0.32) {
    if (E.storm > 0.4 || E.thunder > 0.3) return pick(MD_CTX.storm);
    if (E.rain > 0.4) return pick(MD_CTX.rain);
    if (E.snow > 0.4) return pick(MD_CTX.snow);
    if (E.night > 0.6) return pick(MD_CTX.night);
    if (W && W.clim && W.clim.t > 0.85 && !MDS.sea) return pick(MD_CTX.hot);
    if (a.hunger > 0.65) return pick(S.t === 'f' ? MD_CTX.hungryF : S.d === 'c' ? MD_CTX.hungryC : MD_CTX.hungryH);
  }
  const p = MD_TXT[a.state]; return p ? pick(p) : pick(MD_TXT.idle);
}
mdSay = function (a, txt) { if (a.say && a.say.t > 0) return; const call = txt && typeof MD_VOICE !== 'undefined' && MD_VOICE[a.sp] === txt; a.say = { txt: call ? txt : mdLine(a), t: 3.8 }; a.talkT = MDS.t + 8; };
mdVoice = function (a) { return typeof MD_VOICE !== 'undefined' && MD_VOICE[a.sp] ? MD_VOICE[a.sp] : mdLine(a); };

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
    if (live < 5) for (const a of MDS.an) { if (a.dead || a.inHome || a.say || a.x < x0 || a.x > x1 || (a.talkT || 0) > MDS.t) continue; if (Math.random() < 0.3) { a.say = { txt: mdLine(a), t: 3.8 }; a.talkT = MDS.t + 9 + Math.random() * 16; if (++live >= 5) break; } else a.talkT = MDS.t + 2; }
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
    if (c) { if (bd > 36) { a.tx = c.x; a.running = false; if (a.state !== 'wander') mdSetState(a, 'wander', 3); a.timer = Math.max(a.timer, 2); return; } mdSetState(a, 'eat', 2); a.tx = a.x; a.hunger = Math.max(0, a.hunger - 0.035); c.left -= 0.012; if (!c.logged) { c.logged = true; mdLog(`${a.S.n} ${a.name} se alimenta de los restos de ${MD_SP[c.sp].n.toLowerCase()}.`); } if (!a.say && Math.random() < 0.1) a.say = { txt: mdLine(a, 'x') && MD_TXT.eatcarr[Math.floor(Math.random() * 3)], t: 3.4 }; return; }
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
  'md-roster': () => { const el = document.getElementById('mdRoster'), b = document.querySelector('[data-act=md-roster]'); if (!el) return; el.hidden = !el.hidden; if (b) b.textContent = el.hidden ? 'Animales y nombres' : 'Ocultar animales y nombres'; if (!el.hidden) el.innerHTML = mdRosterHTML(); },
  'md-mark': (el) => { const a = MDS.an.find((o) => o.id === +el.dataset.id && !o.dead); if (!a) return; a.pet = !a.pet; MDS.pets = MDS.pets || []; const i = MDS.pets.findIndex((p) => p.id === a.id); if (a.pet && i < 0) MDS.pets.push({ id: a.id, name: a.name, sp: a.sp }); if (!a.pet && i >= 0) MDS.pets.splice(i, 1); mdRosterRender(); }
});
