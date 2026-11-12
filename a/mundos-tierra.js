/* Cinnavia 7.53 — MUNDOS · bajo tierra y bichitos: hormigueros, topos, lombrices, mariposas monarca, luciérnagas, abejas y mosquitos.
   Todo es diminuto: hay que hacer zoom para ver cómo trabajan. */
'use strict';
const MD_BUGS = {
  hormiga: { n: 'Hormiga obrera', d: 'Hojas y semillas que lleva al hormiguero', fx: 'Puede cargar 50 veces su propio peso. Cuando llueve tapa la entrada y sube los huevos a las cámaras altas.', pred: 'oso hormiguero, pájaros' },
  reina: { n: 'Hormiga reina', d: 'La alimentan sus obreras', fx: 'Pone todos los huevos del hormiguero y puede vivir más de 20 años.', pred: 'nadie: vive bien protegida' },
  topo: { n: 'Topo', d: 'Lombrices e insectos de la tierra', fx: 'Casi no ve, pero siente todo con su nariz en forma de estrella y sus bigotes. Cava hasta 20 metros de túnel al día.', pred: 'búhos y zorros cuando sale' },
  lombriz: { n: 'Lombriz', d: 'Hojas podridas y tierra', fx: 'Respira por la piel. Cuando llueve mucho sale a la superficie para no ahogarse.', pred: 'topos, pájaros y erizos' },
  monarca: { n: 'Mariposa monarca', d: 'Néctar de flores', fx: 'Viaja miles de kilómetros desde Canadá hasta los bosques de Michoacán.', pred: 'casi nadie: sabe feo por las plantas que come' },
  mariposa: { n: 'Mariposa', d: 'Néctar de flores', fx: 'Prueba los sabores con las patitas.', pred: 'pájaros y lagartijas' },
  abeja: { n: 'Abeja', d: 'Néctar y polen', fx: 'Baila para decirle a sus hermanas dónde están las flores.', pred: 'algunos pájaros' },
  mosquito: { n: 'Mosquito', d: 'Néctar (las hembras también toman sangre)', fx: 'Aletea unas 500 veces por segundo: por eso zumba.', pred: 'ranas, golondrinas y peces' },
  luciernaga: { n: 'Luciérnaga', d: 'Néctar y polen', fx: 'Su luz es fría y la usa para encontrar pareja.', pred: 'arañas y ranas' },
  mariquita: { n: 'Catarina', d: 'Pulgones de las plantas', fx: 'Una sola puede comer miles de pulgones en su vida.', pred: 'casi nadie: avisa con sus colores' },
  escarabajo: { n: 'Escarabajo', d: 'Hojas y madera', fx: 'Hay más especies de escarabajos que de cualquier otro animal.', pred: 'pájaros, erizos y ranas' },
  grillo: { n: 'Grillo', d: 'Plantas y semillas', fx: 'Canta frotando sus alas y escucha con las patas.', pred: 'ranas, pájaros y ratones' },
};
const MDB = { list: [], cols: [], moles: [], hills: [] };
function mdBugCount() { return MDB.list.length; }
function mdBuildUnder() {
  MDB.list = []; MDB.cols = []; MDB.moles = []; MDB.hills = []; MDB.bugT = 0; MDB.monT = 30; MDB.rainLog = false; if (MDS.sea) return;
  const W = MDS.def, warm = W.clim.t > 0.35, cold = W.clim.t < 0.25, rnd = mdRng(mdHashStr(W.id) + 9);
  const dry = (x) => mdDepth(x) < -15;
  /* hormigueros */
  const nCol = cold ? 1 : 3;
  for (let i = 0; i < nCol; i++) { let x = MDS.WW * (i + 0.5) / nCol + (rnd() - 0.5) * 600, tr = 0; while (!dry(x) && tr++ < 30) x = 200 + rnd() * (MDS.WW - 400); if (!dry(x)) continue; const g = mdGY(x) + 44;
    const ch = [{ x: x - 40, y: g + 70, r: 22, k: 'food' }, { x: x + 70, y: g + 110, r: 26, k: 'nursery' }, { x: x - 90, y: g + 160, r: 24, k: 'rest' }, { x: x + 20, y: g + 215, r: 30, k: 'queen' }, { x: x + 120, y: g + 175, r: 20, k: 'food' }];
    const paths = ch.map((c) => { const pts = [[x, g - 44 + 44], [x + 4, g + 18], [x - 6, g + 40]]; const midY = (g + 40 + c.y) / 2; pts.push([mdLerp(x, c.x, 0.4) + 8, midY], [c.x, c.y]); return mdPathify(pts); });
    const col = { id: i, x, g, ch, paths, plug: 0, food: 6 + Math.floor(rnd() * 8), eggs: 14, eggsUp: 0 }; MDB.cols.push(col);
    MDB.list.push({ kind: 'reina', col, x: ch[3].x, y: ch[3].y + 8, ph: 0, id: 1e6 + i * 100 });
    for (let k = 0; k < 40; k++) { const p = Math.floor(rnd() * paths.length); MDB.list.push({ kind: 'hormiga', col, mode: rnd() < 0.5 ? 'out' : 'in', path: p, s: rnd() * paths[p].len, dirS: 1, x, y: g, leaf: rnd() < 0.3, ph: rnd() * 6, wait: rnd() * 3, id: 1e6 + i * 100 + k + 1, tx: x }); }
  }
  /* topos y lombrices */
  if (!cold) for (let i = 0; i < 4; i++) { let x = 300 + rnd() * (MDS.WW - 600), tr = 0; while (!dry(x) && tr++ < 30) x = 300 + rnd() * (MDS.WW - 600); if (!dry(x)) continue; const d = 90 + rnd() * 120; MDB.moles.push({ x0: x - 260, x1: x + 260, d, sh: x + (rnd() - 0.5) * 200 }); MDB.hills.push({ x: MDB.moles[MDB.moles.length - 1].sh, h: 0.5 }); MDB.list.push({ kind: 'topo', m: MDB.moles[MDB.moles.length - 1], x, y: mdGY(x) + 44 + d, mode: 'dig', ph: 0, t: 4 + rnd() * 6, dir: 1, id: 2e6 + i, hunger: 0.3, eaten: 0 }); }
  for (let i = 0; i < (cold ? 10 : 40); i++) { let x = 100 + rnd() * (MDS.WW - 200); if (!dry(x)) continue; MDB.list.push({ kind: 'lombriz', x, d: 40 + rnd() * 160, y: 0, ph: rnd() * 6, dir: rnd() < 0.5 ? -1 : 1, id: 3e6 + i, up: 0 }); }
  /* bichitos de superficie */
  const flowers = MDS.fl.filter((f) => f.kind === 'flower' || f.kind === 'bush' || f.kind === 'sakura' || f.kind === 'crystal');
  if (!cold) { for (let i = 0; i < 30; i++) { const fl = flowers.length ? flowers[Math.floor(rnd() * flowers.length)] : null; const x = fl ? fl.x : 100 + rnd() * (MDS.WW - 200); MDB.list.push({ kind: rnd() < 0.4 ? 'abeja' : 'mariposa', x, y: mdGY(x) - 30, hx: x, ph: rnd() * 6, id: 4e6 + i, hue: Math.floor(rnd() * 5) }); }
    for (let i = 0; i < 26; i++) { const x = 100 + rnd() * (MDS.WW - 200); if (!dry(x)) continue; MDB.list.push({ kind: mdPick(['mariquita', 'escarabajo', 'grillo']), x, y: mdGY(x) + 10 + rnd() * 30, ph: rnd() * 6, id: 5e6 + i, dir: rnd() < 0.5 ? -1 : 1, t: rnd() * 3 }); }
    for (let i = 0; i < 30; i++) { const x = 100 + rnd() * (MDS.WW - 200); MDB.list.push({ kind: 'luciernaga', x, y: mdGY(x) - 20 - rnd() * 80, hx: x, ph: rnd() * 6, id: 6e6 + i }); }
    if (MDS.waterXs.length) for (let i = 0; i < 8; i++) { const x = mdPick(MDS.waterXs) + (rnd() - 0.5) * 200; MDB.list.push({ kind: 'mosquito', x, y: MDS.S - 20 - rnd() * 40, hx: x, ph: rnd() * 6, id: 7e6 + i }); } }
}
function mdPathify(pts) { const seg = []; let len = 0; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); len += l; } return { pts, seg, len }; }
function mdPathAt(P, s) { s = mdCl(s, 0, P.len); for (let i = 0; i < P.seg.length; i++) { if (s <= P.seg[i]) { const t = s / P.seg[i], a = P.pts[i], b = P.pts[i + 1]; return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; } s -= P.seg[i]; } const e = P.pts[P.pts.length - 1]; return [e[0], e[1]]; }

/* ---------- comportamiento ---------- */
function mdBugsUpdate(dt) {
  if (MDS.sea || !MDB.list.length && !MDB.cols.length) return; const E = MDS.E, wet = E.rain > 0.35 || MDS.flood > 3, t = MDS.t;
  for (const col of MDB.cols) { col.plug += ((wet ? 1 : 0) - col.plug) * Math.min(1, dt * 0.6); col.eggsUp += ((wet ? 1 : 0) - col.eggsUp) * Math.min(1, dt * 0.15); }
  if (wet && !MDB.rainLog && MDB.cols.length) { MDB.rainLog = true; mdLog('Las hormigas taparon la entrada del hormiguero y subieron los huevos a las cámaras altas por la lluvia.'); } if (!wet && MDB.rainLog && E.rain < 0.1) { MDB.rainLog = false; mdLog('Dejó de llover: las hormigas destapan la entrada y vuelven a buscar hojas.'); }
  /* monarcas llegan por temporadas */
  MDB.monT -= dt; if (MDB.monT <= 0 && MDS.def.clim.t > 0.35) { MDB.monT = 150 + Math.random() * 90; const x = MDV.camX + mdVW() * 0.5; const n = 18 + Math.floor(Math.random() * 10); for (let i = 0; i < n; i++) MDB.list.push({ kind: 'monarca', x: x - 900 - Math.random() * 400, y: MDS.S - 160 - Math.random() * 160, hx: x + (Math.random() - 0.5) * 900, ph: Math.random() * 6, id: 8e6 + Math.floor(Math.random() * 1e5), life: 90 + Math.random() * 40 }); mdLog('¡Llegó una nube de mariposas monarca en su viaje!'); }
  for (let i = MDB.list.length - 1; i >= 0; i--) {
    const b = MDB.list[i]; b.ph += dt * 6;
    if (b.kind === 'hormiga') {
      const col = b.col, P = col.paths[b.path];
      if (b.mode === 'in') { b.s += b.dirS * dt * 14; if (b.s >= P.len) { b.s = P.len; b.wait -= dt; if (b.wait <= 0) { b.dirS = -1; b.wait = 2 + Math.random() * 4; if (b.leaf && col.ch[b.path].k === 'food') { b.leaf = false; col.food++; } if (col.ch[b.path].k === 'nursery' && wet) b.egg = true; } } if (b.s <= 0) { b.s = 0; if (wet) { b.path = Math.floor(Math.random() * col.paths.length); b.dirS = 1; } else if (Math.random() < 0.6) { b.mode = 'out'; b.tx = col.x + (Math.random() - 0.5) * 520; const tr = MDS.fl.find((f) => Math.abs(f.x - b.tx) < 120 && (f.kind === 'bush' || MD_TREES.has(f.kind) || f.kind === 'flower' || f.kind === 'tuft')); if (tr) b.tx = tr.x; } else { b.path = Math.floor(Math.random() * col.paths.length); b.dirS = 1; } } const p = mdPathAt(P, b.s); b.x = p[0]; b.y = p[1]; b.dir = b.dirS; }
      else { /* fuera, en la superficie */ if (wet) { b.tx = col.x; } const dx = b.tx - b.x; if (Math.abs(dx) > 2) { b.x += Math.sign(dx) * dt * 18; b.dir = Math.sign(dx); } else if (b.tx !== col.x) { b.wait -= dt; if (b.wait <= 0) { b.leaf = true; b.tx = col.x; b.wait = 1; } } else { b.mode = 'in'; b.path = Math.random() < 0.6 ? 0 : Math.floor(Math.random() * col.paths.length); if (b.leaf) b.path = Math.random() < 0.6 ? 0 : 4; b.s = 0; b.dirS = 1; } b.y = mdGY(b.x) + 40 + Math.sin(b.id) * 2; }
    } else if (b.kind === 'reina') { b.x = b.col.ch[3].x + Math.sin(t * 0.3 + b.id) * 6; }
    else if (b.kind === 'topo') {
      const m = b.m, top = mdGY(b.x) + 44; b.hunger = Math.min(1, b.hunger + dt * 0.01); b.t -= dt;
      if (b.mode === 'dig') { b.x += b.dir * dt * 16; if (b.x < m.x0 || b.x > m.x1) b.dir *= -1; b.y = top + m.d + Math.sin(b.x * 0.02) * 6; if (b.t <= 0) { b.mode = Math.random() < 0.5 ? 'up' : 'dig'; b.t = 5 + Math.random() * 6; }
        for (const w of MDB.list) if (w.kind === 'lombriz' && !w.up && Math.abs(w.x - b.x) < 12 && Math.abs(w.y - b.y) < 30 && b.hunger > 0.3) { w.dead = true; b.hunger = 0; b.eaten++; break; } }
      else if (b.mode === 'up') { const dx = m.sh - b.x; if (Math.abs(dx) > 2) { b.x += Math.sign(dx) * dt * 16; b.dir = Math.sign(dx); b.y = top + m.d; } else { b.y -= dt * 22; if (b.y <= top - 3) { b.y = top - 3; b.mode = 'peek'; b.t = 5 + Math.random() * 4; const h = MDB.hills.find((q) => q.x === m.sh); if (h) h.h = Math.min(1.4, h.h + 0.25); b.say = { txt: mdPick(['¿Hay alguien?', 'Snif, snif…', '¡Qué luz!', 'Hola, mundo']), t: 2.4 }; } } }
      else if (b.mode === 'peek') { const danger = MDS.an.some((a) => !a.dead && a.S.prey && a.S.prey.length && Math.abs(a.x - b.x) < 120 && a.S.d !== 'h'); if (b.t <= 0 || danger || wet) { b.mode = 'down'; } }
      else if (b.mode === 'down') { b.y += dt * 30; if (b.y >= top + m.d) { b.y = top + m.d; b.mode = 'dig'; b.t = 6 + Math.random() * 8; } }
      if (b.say) { b.say.t -= dt; if (b.say.t <= 0) b.say = null; }
    } else if (b.kind === 'lombriz') {
      const top = mdGY(b.x) + 44; const goUp = E.rain > 0.5 && !MDS.ev.some((e) => e.type === 'inund'); b.up += ((goUp ? 1 : 0) - b.up) * Math.min(1, dt * 0.4); b.x += b.dir * dt * 2.5 * (0.6 + 0.4 * Math.sin(b.ph)); if (Math.random() < dt * 0.05) b.dir *= -1; b.y = mdLerp(top + b.d, top - 2, b.up);
    } else if (b.kind === 'mariposa' || b.kind === 'abeja' || b.kind === 'luciernaga' || b.kind === 'mosquito') {
      const night = E.night > 0.6; const active = b.kind === 'luciernaga' ? night : b.kind === 'mosquito' ? E.night > 0.3 : !night && E.rain < 0.3;
      const hy = mdGY(b.hx) - (b.kind === 'luciernaga' ? 40 : 26); const tx = b.hx + Math.sin(t * (b.kind === 'abeja' ? 0.9 : 0.4) + b.id) * (b.kind === 'mosquito' ? 30 : 70), ty = active ? hy + Math.sin(t * 1.3 + b.id * 2) * 22 : mdGY(b.hx) + 8;
      b.x += (tx - b.x) * Math.min(1, dt * (b.kind === 'abeja' ? 2 : 1)); b.y += (ty - b.y) * Math.min(1, dt * 1.2); b.dir = tx > b.x ? 1 : -1; b.rest = !active;
      if (b.kind === 'mosquito' && active) for (const a of mdNear(b.x, 60)) { if (a.sp === 'rana' && !a.dead && Math.abs(a.y - b.y) < 70) { a.tongue = 1; setTimeout(() => { a.tongue = 0; }, 260); b.dead = true; a.hunger = Math.max(0, a.hunger - 0.15); if (Math.random() < 0.3) mdLog('Una rana atrapó un mosquito con la lengua.'); break; } }
    } else if (b.kind === 'monarca') { b.life -= dt; b.x += (b.hx - b.x) * dt * 0.08 + Math.sin(t + b.id) * dt * 14; b.y += Math.sin(t * 2 + b.id) * dt * 18 + (mdGY(b.x) - 90 - b.y) * dt * 0.08; b.dir = Math.cos(t + b.id) > 0 ? 1 : -1; if (b.life <= 0) { b.hx += 3000; if (b.life < -25) b.dead = true; } }
    else { /* insectos del suelo */ b.t -= dt; if (b.t <= 0) { b.t = 1 + Math.random() * 4; b.dir = Math.random() < 0.5 ? -1 : 1; b.walk = Math.random() < 0.6; } if (b.walk && E.rain < 0.6) b.x += b.dir * dt * (b.kind === 'grillo' ? 10 : 4); if (b.kind === 'grillo' && Math.random() < dt * 0.2) b.hop = 1; b.hop = Math.max(0, (b.hop || 0) - dt * 3); b.y = mdGY(b.x) + 10 + (b.id % 30) - b.hop * 10; }
    if (b.dead) { MDB.list.splice(i, 1); if (b.kind === 'lombriz') setTimeout(() => { if (MDS.sea) return; const x = 100 + Math.random() * (MDS.WW - 200); if (mdDepth(x) < -15) MDB.list.push({ kind: 'lombriz', x, d: 40 + Math.random() * 160, y: 0, ph: 0, dir: 1, id: 3e6 + Math.floor(Math.random() * 1e5), up: 0 }); }, 20000); }
  }
}

/* ---------- dibujo bajo tierra ---------- */
function mdDrawUnder(c, x0, x1, y0, y1, time, E) {
  if (y1 < MDS.S) return; const soil = MDS.def.pal.soil;
  /* piedritas y raíces */
  c.fillStyle = mdSh(soil, -0.18); for (let x = Math.floor(x0 / 70) * 70; x < x1; x += 70) { const h = mdHash(x * 0.37); const y = mdGY(x) + 70 + h * 380; mdE(c, x + h * 40, y, 5 + h * 9, 3 + h * 5); }
  c.fillStyle = mdSh(soil, 0.1); for (let x = Math.floor(x0 / 46) * 46; x < x1; x += 46) { const h = mdHash(x * 0.71 + 3); mdE(c, x + h * 20, mdGY(x) + 60 + h * 500, 1.8, 1.4); }
  c.strokeStyle = mdSh(soil, -0.16); c.lineCap = 'round'; c.globalAlpha = 0.55; for (const f of MDS.trees) { if (f.x < x0 || f.x > x1 || mdDepth(f.x) > 0 || f.burnt) continue; const g = f.y + 44; for (let k = -1; k <= 1; k++) { c.lineWidth = k ? 1.6 : 2.4; c.beginPath(); c.moveTo(f.x + k * 4, g); c.bezierCurveTo(f.x + k * 10, g + 18, f.x + k * 26 - 6, g + 30, f.x + k * 30 + (f.seed % 7) - 3, g + 36 + (f.seed % 11)); c.stroke(); } } c.globalAlpha = 1;
  /* túneles de topo y montículos */
  for (const m of MDB.moles) { if (m.x1 < x0 || m.x0 > x1) continue; c.strokeStyle = mdSh(soil, -0.35); c.lineWidth = 15; c.beginPath(); for (let x = m.x0; x <= m.x1; x += 10) { const y = mdGY(x) + 44 + m.d + Math.sin(x * 0.02) * 6; if (x === m.x0) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); c.beginPath(); c.moveTo(m.sh, mdGY(m.sh) + 44 + m.d); c.lineTo(m.sh, mdGY(m.sh) + 40); c.stroke(); }
  for (const h of MDB.hills) { if (h.x < x0 || h.x > x1) continue; const g = mdGY(h.x) + 40; c.fillStyle = mdSh(soil, 0.08); c.beginPath(); c.ellipse(h.x, g, 18 + h.h * 8, 8 + h.h * 5, 0, Math.PI, 0); c.fill(); }
  /* hormigueros */
  for (const col of MDB.cols) { if (col.x < x0 - 200 || col.x > x1 + 200) continue; c.strokeStyle = mdSh(soil, -0.38); c.lineWidth = 6; c.lineJoin = 'round'; for (const P of col.paths) { c.beginPath(); P.pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke(); }
    for (const ch of col.ch) { c.fillStyle = mdSh(soil, -0.38); mdE(c, ch.x, ch.y, ch.r, ch.r * 0.55); c.fillStyle = mdSh(soil, -0.48); mdE(c, ch.x, ch.y + ch.r * 0.25, ch.r * 0.9, ch.r * 0.25);
      if (ch.k === 'food') { c.fillStyle = '#5a9a3a'; const n = Math.min(14, Math.round(col.food / (col.ch.filter((q) => q.k === 'food').length))); for (let k = 0; k < n; k++) { const lx = ch.x - ch.r * 0.6 + (k % 7) * ch.r * 0.2, ly = ch.y + ch.r * 0.2 - Math.floor(k / 7) * 3; c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + 3, ly - 2); c.lineTo(lx + 5, ly); c.fill(); } c.fillStyle = '#c8f0a0'; mdE(c, ch.x + ch.r * 0.4, ch.y, 3, 2); }
      if (ch.k === 'nursery' || ch.k === 'rest' && col.eggsUp > 0.5) { const up = col.eggsUp; const show = ch.k === 'nursery' ? 1 - up : up; c.fillStyle = '#f8f4ea'; for (let k = 0; k < Math.round(col.eggs * show); k++) mdE(c, ch.x - ch.r * 0.6 + (k % 7) * ch.r * 0.2, ch.y + ch.r * 0.2 - Math.floor(k / 7) * 3, 1.6, 1.1); } }
    const g = col.g; c.fillStyle = mdSh(soil, 0.1); c.beginPath(); c.ellipse(col.x, g, 16, 6, 0, Math.PI, 0); c.fill(); c.fillStyle = col.plug > 0.5 ? mdSh(soil, 0.05) : '#2a1a10'; mdE(c, col.x, g - 1, 3.5, 2); }
  /* inundación: agua en las cámaras bajas si no se protegieron */
}
function mdAnt(c, b, s, time) { c.save(); c.translate(b.x, b.y); c.scale(b.dir || 1, 1); const leg = Math.sin(b.ph * 3) * 0.6; c.strokeStyle = '#1a1210'; c.lineWidth = 0.35; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(k * 0.9 * s, -0.9 * s); c.lineTo(k * 0.9 * s + (k % 2 ? leg : -leg) * s, 0); c.stroke(); } c.fillStyle = b.kind === 'reina' ? '#5a2a1a' : '#3a1e14'; mdE(c, -1.5 * s, -1.1 * s, 1.2 * s, 0.95 * s); mdE(c, 0, -1.1 * s, 0.7 * s, 0.55 * s); mdE(c, 1.2 * s, -1.3 * s, 0.75 * s, 0.7 * s); if (b.kind === 'reina') { c.fillStyle = 'rgba(220,220,255,.5)'; mdE(c, -0.6 * s, -2.2 * s, 1.6 * s, 0.6 * s, -0.3); } c.strokeStyle = '#1a1210'; c.beginPath(); c.moveTo(1.6 * s, -1.8 * s); c.lineTo(2.3 * s, -2.6 * s); c.stroke(); c.fillStyle = '#fff'; mdE(c, 1.45 * s, -1.45 * s, 0.22 * s, 0.22 * s); if (b.leaf) { c.fillStyle = '#6ab83a'; c.beginPath(); c.moveTo(1.6 * s, -1.8 * s); c.lineTo(2.2 * s, -5 * s); c.lineTo(3.6 * s, -2.6 * s); c.fill(); } if (b.egg) { c.fillStyle = '#f8f4ea'; mdE(c, 2 * s, -1.4 * s, 0.6 * s, 0.4 * s); } c.restore(); }
function mdBugDraw(c, b, time) {
  const k = b.kind;
  if (k === 'hormiga' || k === 'reina') return mdAnt(c, b, k === 'reina' ? 2.3 : 1, time);
  c.save(); c.translate(b.x, b.y);
  if (k === 'topo') { c.scale(b.dir || 1, 1); const s = 1; c.fillStyle = '#4a4248'; mdE(c, 0, -6, 13, 8); c.fillStyle = '#5a5258'; mdE(c, -2, -9, 8, 4); c.fillStyle = '#f2a8b8'; for (const q of [[8, -1], [-8, -1]]) mdE(c, q[0], q[1], 4, 2.2); c.fillStyle = '#4a4248'; mdE(c, 11, -6, 6, 5); c.fillStyle = '#f2a8b8'; for (let i = 0; i < 6; i++) { const a = i * 1.047 + time * 0.004; mdE(c, 17 + Math.cos(a) * 2.2, -6 + Math.sin(a) * 2.2, 1.2, 1.2); } mdE(c, 17, -6, 1.6, 1.6); c.fillStyle = '#1b1210'; mdE(c, 11, -8.5, 0.8, 0.5); mdBlush(c, 9, -4, 1.6); c.strokeStyle = '#e8d8dc'; c.lineWidth = 0.4; for (const s2 of [-1, 1]) { c.beginPath(); c.moveTo(15, -5); c.lineTo(20, -5 + s2 * 2); c.stroke(); } if (b.say && MDV.zoom > 1.2) { c.scale(b.dir || 1, 1); c.font = '600 7px system-ui'; const t = b.say.txt, tw = c.measureText(t).width + 8; c.fillStyle = 'rgba(255,255,255,.94)'; c.fillRect(-tw / 2, -30, tw, 11); c.fillStyle = '#2a2a30'; c.fillText(t, -tw / 2 + 4, -22); } }
  else if (k === 'lombriz') { c.strokeStyle = '#e88a8a'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i < 8; i++) { const x = -i * 1.6 * (b.dir || 1), y = Math.sin(b.ph * 0.8 + i * 0.9) * 1.5; if (!i) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); c.fillStyle = '#1b1210'; mdE(c, 0.6 * (b.dir || 1), -0.5, 0.35, 0.35); c.fillStyle = '#d87070'; mdE(c, -4 * (b.dir || 1), Math.sin(b.ph * 0.8 + 2.7) * 1.5, 1.4, 1.3); }
  else if (k === 'mariposa' || k === 'monarca') { const fl = Math.abs(Math.sin(time * 0.02 + b.id)) * (b.rest ? 0.2 : 1); const cols = k === 'monarca' ? ['#f08a1a', '#2a1a10'] : [['#7ac0ff', '#2a4a8a'], ['#ffd23a', '#8a5a1a'], ['#ff8ac8', '#8a2a5a'], ['#b8f08a', '#3a6a2a'], ['#fff', '#666']][b.hue || 0]; const sz = k === 'monarca' ? 4.2 : 3.4; c.fillStyle = cols[0]; c.save(); c.scale(1, 1); for (const s2 of [-1, 1]) { c.save(); c.scale(1, 0.25 + fl * 0.75); mdE(c, s2 * sz * 0.4, -sz * 0.6, sz * 0.9, sz * 1.1, s2 * 0.4); c.restore(); } c.fillStyle = cols[1]; mdE(c, 0, 0, 0.8, sz * 0.9); if (k === 'monarca') { c.fillStyle = '#fff'; mdE(c, -sz * 0.9, -sz * 0.6 * (0.25 + fl * 0.75), 0.5, 0.5); mdE(c, sz * 0.9, -sz * 0.6 * (0.25 + fl * 0.75), 0.5, 0.5); } c.restore(); }
  else if (k === 'abeja') { c.scale(b.dir || 1, 1); c.fillStyle = '#f8d23a'; mdE(c, 0, 0, 2.4, 1.7); c.fillStyle = '#2a1a10'; c.fillRect(-0.9, -1.6, 0.7, 3.2); c.fillRect(0.6, -1.6, 0.7, 3.2); mdE(c, 2.4, 0, 1.1, 1.1); c.fillStyle = 'rgba(255,255,255,.75)'; const fl = Math.sin(time * 0.05 + b.id) * 0.5 + 0.5; mdE(c, -0.3, -2 - fl, 1.6, 1.1); }
  else if (k === 'mosquito') { c.scale(b.dir || 1, 1); c.strokeStyle = '#3a3030'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(-2, 0); c.lineTo(1.5, -0.3); c.lineTo(3.2, 0.4); c.stroke(); for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-0.5 + i * 0.6, 0); c.lineTo(-1.5 + i * 1.2, 2.4); c.stroke(); } c.fillStyle = 'rgba(220,230,255,.6)'; mdE(c, -0.6, -1.2 - Math.abs(Math.sin(time * 0.08)) * 0.6, 1.5, 0.6); }
  else if (k === 'luciernaga') { if (!b.rest) { const on = 0.5 + 0.5 * Math.sin(time * 0.004 + b.id); c.globalAlpha = on * 0.5; c.fillStyle = '#f8ff9a'; mdE(c, 0, 0, 7, 7); c.globalAlpha = 1; c.fillStyle = `rgba(248,255,150,${0.4 + on * 0.6})`; mdE(c, -0.8, 0.4, 1.6, 1.3); } c.fillStyle = '#3a2a20'; mdE(c, 0.8, 0, 1.2, 0.8); }
  else if (k === 'mariquita') { c.fillStyle = '#e83a2a'; c.beginPath(); c.arc(0, 0, 2.2, Math.PI, 0); c.fill(); c.fillStyle = '#1a1210'; mdE(c, 2.3 * (b.dir || 1), -0.5, 0.9, 0.8); mdE(c, -0.9, -1, 0.45, 0.45); mdE(c, 0.8, -1.2, 0.45, 0.45); mdE(c, 0, -0.6, 0.4, 0.4); c.fillRect(-0.1, -2.2, 0.2, 2.2); }
  else if (k === 'escarabajo') { c.fillStyle = '#2a6a5a'; mdE(c, 0, -1.4, 2.6, 1.8); c.fillStyle = '#4a9a8a'; mdE(c, -0.6, -2, 1, 0.6); c.fillStyle = '#1a2a24'; mdE(c, 2.6 * (b.dir || 1), -1, 1, 0.9); }
  else if (k === 'grillo') { c.scale(b.dir || 1, 1); c.fillStyle = '#5a6a2a'; mdE(c, 0, -1.4, 2.8, 1.2); c.strokeStyle = '#4a5a1a'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-1, -1); c.lineTo(-2.5, -3.2); c.lineTo(-3.5, 0); c.moveTo(2.6, -1.8); c.lineTo(5, -4); c.stroke(); c.fillStyle = '#1b1210'; mdE(c, 2.4, -1.8, 0.4, 0.4); }
  c.restore();
}
function mdBugItems(items, x0, x1) { if (MDS.sea) return; for (const b of MDB.list) { if (b.x < x0 || b.x > x1) continue; if (MDV.zoom < 1.6 && (b.kind === 'hormiga' || b.kind === 'lombriz' || b.kind === 'mariquita' || b.kind === 'escarabajo' || b.kind === 'grillo' || b.kind === 'mosquito') && b.y > MDS.S + 80) continue; items.push({ y: b.kind === 'luciernaga' || b.kind === 'mariposa' || b.kind === 'monarca' || b.kind === 'abeja' || b.kind === 'mosquito' ? 8000 : b.y, bug: b, draw: (c, t) => mdBugDraw(c, b, t) }); } }
function mdBugAt(wx, wy) { let best = null, bd = 1e9; const r = 6 + 14 / MDV.zoom; for (const b of MDB.list) { const s = b.kind === 'topo' ? 16 : b.kind === 'reina' ? 6 : 4; const d = Math.hypot(b.x - wx, b.y - s * 0.5 - wy); if (d < s + r && d < bd) { bd = d; best = b; } } return best; }
function mdBugCard(b) {
  const I = MD_BUGS[b.kind] || { n: 'Bichito', d: '', fx: '' }; let doing = '';
  if (b.kind === 'hormiga') doing = b.mode === 'out' ? (b.leaf ? 'Lleva un pedazo de hoja al hormiguero' : 'Busca hojas afuera') : (b.egg ? 'Sube los huevos a una cámara segura' : MDS.E.rain > 0.35 ? 'Se protege de la lluvia dentro del hormiguero' : 'Trabaja en los túneles');
  else if (b.kind === 'reina') doing = `Cuida ${b.col.eggs} huevos · el hormiguero guarda ${b.col.food} hojas`;
  else if (b.kind === 'topo') doing = { dig: 'Cava túneles buscando lombrices', up: 'Sube a la superficie', peek: 'Se asoma a ver el mundo', down: 'Vuelve a su túnel' }[b.mode] + ` · ha comido ${b.eaten} lombrices`;
  else if (b.kind === 'lombriz') doing = b.up > 0.5 ? 'Salió a la superficie por la lluvia' : 'Abre caminitos en la tierra';
  else doing = b.rest ? 'Descansando' : { mariposa: 'Bebe néctar de las flores', monarca: 'Viaja con su nube de mariposas', abeja: 'Junta polen', mosquito: 'Zumba cerca del agua', luciernaga: 'Brilla para encontrar pareja', mariquita: 'Busca pulgones', escarabajo: 'Pasea entre las hojas', grillo: 'Canta y da saltitos' }[b.kind] || 'Paseando';
  return `<div class="md-card-h"><b>${esc(I.n)}</b><span>Bichito diminuto</span><button type="button" class="md-x" data-act="md-unsel" aria-label="Cerrar">×</button></div><p class="md-doing">${esc(doing)}</p><p class="small"><b>Come:</b> ${esc(I.d)}. <b>Lo cazan:</b> ${esc(I.pred || '—')}.</p><p class="small">${esc(I.fx)}</p><div class="md-card-b"><button type="button" class="md-btn" data-act="md-follow" aria-pressed="${MDV.follow}">${MDV.follow ? 'Dejar de seguir' : 'Seguir'}</button><button type="button" class="md-btn" data-act="md-zoomsel">Acercar</button></div>`;
}
/* enganchar al paso principal */
{ const base = mdUpdate; mdUpdate = function (dt) { base(dt); try { if (MDS.def && MDB) mdBugsUpdate(Math.min(dt, 0.05) * MDS.speed); } catch (e) { console.error('bichos', e); } }; }
