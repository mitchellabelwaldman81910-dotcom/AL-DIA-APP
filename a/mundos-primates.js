/* Cinnavia 7.55 — MUNDOS · primates realistas (bípedos), más especies y colores naturales. */
'use strict';
(() => {
  const q = (n, z, v, d, bn, look, fx, extra) => Object.assign({ n, t: 'q', h: 'L', d, z, v, pat: 'd', g: 1, lit: [1, 1], bn, prey: [], look, fx }, extra || {});
  const N = {
    capuchino: q('Capuchino cariblanco', 0.85, [22, 85], 'o', 'cría de capuchino', { c: '#2a2420', b: '#e4d8bc', face: '#e6dcc4', cap: '#1c1713', tl: 'long', pr: 1 }, 'Usa piedras para romper nueces y frutos duros.', { arb: 1 }),
    aullador: q('Mono aullador', 1.2, [16, 60], 'h', 'cría de aullador', { c: '#74381f', b: '#8a4a2a', face: '#2a2220', tl: 'long', pr: 1, beard: 1 }, 'Su aullido se escucha a varios kilómetros de distancia.', { arb: 1 }),
    babuino: q('Babuino', 1.45, [22, 80], 'o', 'cría de babuino', { c: '#8a7858', b: '#b4a684', face: '#2e2622', tl: 'long', pr: 1, snout: 1 }, 'Vive en grupos grandes con jerarquías muy marcadas.'),
    mandril: q('Mandril', 1.5, [20, 70], 'o', 'cría de mandril', { c: '#665842', b: '#d4c6a0', face: '#3a5aa8', tl: 'none', pr: 1, snout: 1 }, 'Es el primate con la cara más colorida del mundo.'),
    macaco: q('Macaco japonés', 1.0, [20, 80], 'o', 'cría de macaco', { c: '#9a9690', b: '#c6c0b6', face: '#c46a5c', tl: 'none', pr: 1 }, 'En invierno se baña en aguas termales para calentarse.', { arb: 1 }),
    gibon: q('Gibón de manos blancas', 0.9, [26, 95], 'o', 'cría de gibón', { c: '#2a2420', b: '#d8ccb0', face: '#2a2420', tl: 'none', pr: 1, long: 1, ring: 1 }, 'Se columpia de rama en rama con los brazos, a gran velocidad.', { arb: 1 }),
    colobo: q('Colobo blanco y negro', 1.1, [20, 75], 'h', 'cría de colobo', { c: '#171515', b: '#f2f0ea', face: '#171515', tl: 'long', pr: 1, mantle: 1 }, 'Sus crías nacen completamente blancas.', { arb: 1 }),
    langur: q('Langur gris', 1.1, [20, 75], 'h', 'cría de langur', { c: '#a8a296', b: '#c8c2b6', face: '#2a2420', tl: 'long', pr: 1 }, 'Pasa horas comiendo hojas y las digiere en un estómago de varias cámaras.', { arb: 1 }),
    monoardilla: q('Mono ardilla', 0.6, [26, 95], 'o', 'cría de mono ardilla', { c: '#a68c46', b: '#e6dabe', face: '#e6dabe', tl: 'long', pr: 1 }, 'Es muy pequeño y activo; come frutas e insectos.', { arb: 1 }),
    tamarino: q('Tamarino emperador', 0.45, [26, 95], 'o', 'cría de tamarino', { c: '#868684', b: '#a4a4a2', face: '#2a2420', tl: 'long', pr: 1, mustache: 1 }, 'Su bigote blanco lo hace parecer un emperador.', { arb: 1 })
  };
  for (const k in N) if (!MD_SP[k]) MD_SP[k] = N[k];
  const PR = { mono: { fun: 1, face: '#f8e6c8', b: '#f6e4c2', c: '#a0683e' }, monoarana: { long: 1 }, titi: {}, lemur: { ring: 1, snout: 1 }, orangutan: { ape: 1, shaggy: 1 }, gorila: { ape: 1, brow: 1 } };
  for (const k in PR) if (MD_SP[k]) Object.assign(MD_SP[k].look, { pr: 1 }, PR[k]);
  if (MD_SP.mono) MD_SP.mono.fantasy = true;
  for (const k of Object.keys(N)) MD_MONKEY.add(k); for (const k of ['mono', 'monoarana', 'titi', 'lemur', 'orangutan']) MD_MONKEY.add(k);
  const W = (id, ...pairs) => { const w = MD_WORLDS.find((x) => x.id === id); if (!w) return; for (const [k, n] of pairs) { if (!MD_SP[k]) continue; const e = w.sp.find((x) => x[0] === k); if (!e) w.sp.push([k, n]); } };
  W('selva', ['capuchino', 3], ['aullador', 3], ['monoardilla', 3], ['tamarino', 2], ['gibon', 2], ['colobo', 2]);
  W('granjungla', ['capuchino', 3], ['aullador', 3], ['monoardilla', 3], ['tamarino', 2], ['gibon', 2], ['colobo', 2], ['mandril', 2]);
  W('amazonas', ['aullador', 3], ['capuchino', 3], ['monoardilla', 3], ['tamarino', 2]);
  W('india', ['macaco', 3], ['langur', 3], ['gibon', 2]);
  W('sabana', ['babuino', 3]); W('himalaya', ['langur', 2], ['macaco', 2]); W('sakura', ['macaco', 3]); W('bambu', ['langur', 2], ['gibon', 2]);
  for (const [h, ...ps] of [['jaguar', 'capuchino', 'aullador', 'monoardilla', 'macaco'], ['pantera', 'langur', 'macaco', 'capuchino'], ['tigre', 'langur', 'macaco'], ['leon', 'babuino'], ['harpia', 'capuchino', 'aullador', 'monoardilla', 'tamarino', 'colobo', 'gibon']]) if (MD_SP[h]) for (const p of ps) if (!MD_SP[h].prey.includes(p)) MD_SP[h].prey.push(p);
  /* solo queda un tipo de mono */
  for (const k of ['monoarana', 'titi', 'lemur', 'orangutan', 'gorila', ...Object.keys(N)]) delete MD_SP[k];
  for (const k in MD_SP) if (MD_SP[k].prey) MD_SP[k].prey = MD_SP[k].prey.filter((p) => MD_SP[p]);
  for (const w of MD_WORLDS) w.sp = w.sp.filter((e) => MD_SP[e[0]]);
  if (MD_SP.mono) for (const id of ['selva', 'granjungla', 'amazonas', 'india']) { const w = MD_WORLDS.find((x) => x.id === id); if (w) { const e = w.sp.find((x) => x[0] === 'mono'); if (!e) w.sp.push(['mono', 6]); } }
})();

function mdDrawPrimate(c, a, S, time, P) {
  const L = S.look, u = 18 * P.sc, kid = 1 - P.age, col = P.col || L.c, belly = L.b || col, dk = mdSh(col, -0.34), face = L.face || mdSh(belly, 0.04), ape = !!L.ape, st = a.state, ph = P.ph || 0, mv = P.moving;
  const hang = st === 'hang' || st === 'swing', cling = st === 'climb', fall = st === 'falling' || st === 'flung' || st === 'dead';
  const sit = !hang && !cling && !fall && !mv && (st === 'rest' || st === 'sleep' || st === 'canopy' || st === 'groom' || st === 'banana' || st === 'nest' || (st === 'idle' && P.id % 2 === 0) || st === 'chat');
  const fun = !!L.fun;
  const legL = u * (fun ? 0.6 : ape ? 0.62 : 0.78), tor = u * (fun ? 0.72 : ape ? 0.95 : 0.8), armL = u * (L.long ? 1.15 : ape ? 1.1 : 0.9), hr = u * (fun ? 0.4 : ape ? 0.31 : 0.28) * (1 + kid * 0.3), w = u * (fun ? 0.27 : ape ? 0.36 : 0.2);
  const lean = cling ? 0.06 : hang ? 0 : fall ? 0.5 : sit ? 0.14 : (ape ? 0.7 : 0.32) + (P.run ? 0.12 : 0);
  const bob = mv && !hang && !cling ? Math.abs(Math.sin(ph)) * u * (fun ? 0.12 : 0.04) : Math.sin(time * 0.0018 + P.id) * u * 0.008;
  const hipY = (hang ? -legL * 0.5 : sit ? -u * 0.2 : cling ? -u * 0.75 : -legL) - bob, hipX = sit ? -u * 0.05 : 0;
  const shX = hipX + Math.sin(lean) * tor, shY = hipY - Math.cos(lean) * tor;
  let hdX = shX + Math.sin(lean) * hr * 0.4 + hr * 0.45, hdY = shY - hr * 0.55;
  if (st === 'sleep') { hdX = shX + hr * 0.7; hdY = shY + hr * 0.1; }
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  const seg = (x1, y1, x2, y2, x3, y3, wd, colr) => { c.strokeStyle = colr; c.lineWidth = wd; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.lineWidth = wd * 0.72; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x3, y3); c.stroke(); c.fillStyle = colr; c.beginPath(); c.arc(x2, y2, wd * 0.5, 0, 6.3); c.fill(); };
  const hand = (x, y, colr) => { c.fillStyle = mdSh(colr, -0.12); mdE(c, x, y, u * 0.1, u * 0.08); c.strokeStyle = mdSh(colr, -0.12); c.lineWidth = u * 0.035; c.beginPath(); c.moveTo(x + u * 0.05, y); c.lineTo(x + u * 0.14, y + u * 0.04); c.moveTo(x + u * 0.04, y + u * 0.03); c.lineTo(x + u * 0.11, y + u * 0.09); c.stroke(); };
  const leg = (i, colr) => {
    let fx, fy, kx, ky; const hx = hipX, hy = hipY;
    if (hang) { fx = hx + (i ? -u * 0.15 : u * 0.1) + Math.sin(time * 0.003 + i) * u * 0.05; fy = hy + legL * 0.95; kx = (hx + fx) / 2 + u * 0.05; ky = (hy + fy) / 2; }
    else if (sit) { fx = hx + u * (0.58 + i * 0.1); fy = -u * 0.03; kx = hx + u * (0.5 + i * 0.08); ky = hy - u * 0.28; }
    else if (cling) { const p = ph + i * Math.PI; fx = hx + u * 0.18; fy = hy + legL * 0.45 + Math.sin(p) * u * 0.18; kx = hx + u * 0.34; ky = (hy + fy) / 2; }
    else if (fall) { fx = hx + (i ? -1 : 1) * u * 0.4; fy = hy + legL * 0.9; kx = hx + (i ? -1 : 1) * u * 0.25; ky = hy + legL * 0.4; }
    else { const p = ph + i * Math.PI, sw = mv ? Math.sin(p) * u * 0.38 : (i ? -u * 0.1 : u * 0.1), lift = mv ? Math.max(0, Math.cos(p)) * u * 0.16 : 0; fx = hx + sw; fy = -lift; kx = (hx + fx) / 2 + u * 0.12; ky = (hy + fy) / 2; }
    seg(hx, hy, kx, ky, fx, fy, w * 0.78, colr); c.fillStyle = colr; mdE(c, fx + u * 0.06, fy - u * 0.02, u * 0.14, u * 0.07);
  };
  const arm = (i, colr) => {
    let hx, hy, ex, ey; const sx = shX - (i ? u * 0.04 : 0), sy = shY + u * 0.12;
    if (hang) { hx = sx + u * 0.12; hy = shY - armL * 0.92; ex = sx + u * 0.04; ey = (sy + hy) / 2; }
    else if (cling) { const p = ph + i * Math.PI; hx = sx + u * 0.26; hy = sy - armL * 0.5 + Math.sin(p) * u * 0.16; ex = sx + u * 0.16; ey = (sy + hy) / 2; }
    else if (fall) { hx = sx + (i ? -1 : 1) * u * 0.7; hy = sy - u * 0.3; ex = sx + (i ? -1 : 1) * u * 0.35; ey = sy - u * 0.05; }
    else if (st === 'banana' && i === 0) { hx = hdX + hr * 0.7; hy = hdY + hr * 0.45; ex = sx + u * 0.3; ey = sy + u * 0.2; }
    else if (sit) { hx = hipX + u * 0.55; hy = hipY - u * 0.3 - i * u * 0.05; ex = sx + u * 0.32; ey = sy + u * 0.32; }
    else { const p = ph + (i ? 0 : Math.PI), sw = mv ? Math.sin(p) * u * 0.38 : (i ? -u * 0.06 : u * 0.08); hx = sx + sw + (ape ? u * 0.18 : 0); hy = Math.min(-u * 0.05, sy + armL * (ape ? 1 : 0.92)); ex = sx + sw * 0.4 - u * 0.04; ey = (sy + hy) / 2 + u * 0.04; }
    seg(sx, sy, ex, ey, hx, hy, w * 0.6, colr); hand(hx, hy, mdSh(colr, -0.15)); if (st === 'banana' && i === 0) { c.strokeStyle = '#e4c538'; c.lineWidth = u * 0.1; c.beginPath(); c.arc(hx + u * 0.05, hy - u * 0.02, u * 0.17, 3.6, 5.6); c.stroke(); }
  };
  /* extremidades lejanas y cola */
  leg(1, dk); arm(1, dk);
  if (L.tl && L.tl !== 'none' && !L.notail) {
    c.strokeStyle = L.mantle ? belly : col; c.lineWidth = Math.max(1.5, u * (L.mantle ? 0.16 : 0.1)); c.beginPath(); c.moveTo(hipX - u * 0.08, hipY + u * 0.02);
    if (hang) c.bezierCurveTo(hipX - u * 0.4, hipY + u * 0.3, hipX - u * 0.5, hipY + u * 0.7, hipX - u * 0.2, hipY + u * 0.95); else if (sit || cling) c.bezierCurveTo(hipX - u * 0.5, hipY + u * 0.1, hipX - u * 0.8, hipY - u * 0.1, hipX - u * 0.75, hipY - u * 0.55); else c.bezierCurveTo(hipX - u * 0.55, hipY - u * 0.1, hipX - u * 0.9, hipY - u * 0.3 + Math.sin(ph) * u * 0.05, hipX - u * 1.0, hipY - u * 0.8); c.stroke();
    c.fillStyle = L.mantle ? '#f2f0ea' : mdSh(col, -0.12); { const tx = hang ? hipX - u * 0.2 : (sit || cling) ? hipX - u * 0.75 : hipX - u * 1.0, ty = hang ? hipY + u * 0.95 : (sit || cling) ? hipY - u * 0.55 : hipY - u * 0.8; mdE(c, tx, ty, u * (L.mantle ? 0.14 : 0.08), u * (L.mantle ? 0.2 : 0.09)); }
    if (L.ring) { c.strokeStyle = '#2a2a2e'; c.setLineDash([u * 0.1, u * 0.1]); c.beginPath(); c.moveTo(hipX - u * 0.4, hipY - u * 0.05); c.quadraticCurveTo(hipX - u * 0.8, hipY - u * 0.2, hipX - u * 0.95, hipY - u * 0.75); c.stroke(); c.setLineDash([]); }
  }
  /* torso */
  const mx = (hipX + shX) / 2, my = (hipY + shY) / 2, ang = lean; c.save(); c.translate(mx, my); c.rotate(ang);
  const g = c.createLinearGradient(-w, 0, w, 0); g.addColorStop(0, mdSh(col, 0.1)); g.addColorStop(1, mdSh(col, -0.28)); c.fillStyle = g; mdE(c, 0, 0, w * 0.95, tor * 0.58);
  { const gb = c.createRadialGradient(w * 0.4, tor * 0.05, 1, w * 0.4, tor * 0.05, tor * 0.42); gb.addColorStop(0, mdSh(belly, 0.08)); gb.addColorStop(1, mdSh(belly, -0.12)); c.fillStyle = L.mantle ? belly : gb; mdE(c, w * 0.35, tor * 0.06, w * 0.58, tor * 0.4); }
  c.strokeStyle = mdSh(col, 0.3); c.globalAlpha = 0.35; c.lineWidth = u * 0.05; c.beginPath(); c.ellipse(0, 0, w * 0.95, tor * 0.58, 0, 3.7, 5.2); c.stroke(); c.globalAlpha = 1;
  c.globalAlpha = 0.25; c.strokeStyle = dk; c.lineWidth = 0.8; c.beginPath(); for (let k = 0; k < 14; k++) { const fx = (mdHash(k * 3 + S.z * 4) - 0.5) * w * 1.6, fy = (mdHash(k * 7 + 1) - 0.5) * tor * 1.0; c.moveTo(fx, fy); c.lineTo(fx - u * 0.05, fy + u * 0.1); } c.stroke(); c.globalAlpha = 1; c.restore();
  /* pierna cercana */
  leg(0, col);
  /* cabeza */
  if (fun) mdFunHead(c, hdX, hdY, hr, col, belly, face, st, P, time); else {
  c.fillStyle = L.shaggy ? mdSh(col, 0.05) : col; mdE(c, hdX, hdY, hr * (ape ? 1.05 : 1), hr * 0.95);
  if (L.cap) { c.fillStyle = L.cap; mdE(c, hdX - hr * 0.1, hdY - hr * 0.5, hr * 0.85, hr * 0.5); }
  if (L.beard) { c.fillStyle = mdSh(col, -0.2); mdE(c, hdX + hr * 0.25, hdY + hr * 0.8, hr * 0.55, hr * 0.4); }
  c.fillStyle = face; mdE(c, hdX + hr * 0.3, hdY + hr * 0.05, hr * 0.62, hr * 0.58);
  if (L.snout) { c.fillStyle = mdSh(face, -0.08); mdE(c, hdX + hr * 0.95, hdY + hr * 0.28, hr * 0.62, hr * 0.38); c.fillStyle = '#1a1412'; mdE(c, hdX + hr * 1.5, hdY + hr * 0.2, hr * 0.07, hr * 0.06); } else { c.fillStyle = mdSh(face, -0.1); mdE(c, hdX + hr * 0.62, hdY + hr * 0.3, hr * 0.32, hr * 0.24); c.fillStyle = '#1a1412'; mdE(c, hdX + hr * 0.88, hdY + hr * 0.18, hr * 0.05, hr * 0.04); }
  if (L.mustache) { c.fillStyle = '#f4f0e6'; mdE(c, hdX + hr * 0.7, hdY + hr * 0.5, hr * 0.5, hr * 0.12); }
  c.strokeStyle = '#2a1a14'; c.lineWidth = Math.max(0.8, hr * 0.06); c.beginPath(); c.moveTo(hdX + hr * 0.45, hdY + hr * 0.52); c.lineTo(hdX + hr * (L.snout ? 1.15 : 0.85), hdY + hr * 0.46); c.stroke();
  if (ape && L.brow) { c.fillStyle = dk; mdE(c, hdX + hr * 0.35, hdY - hr * 0.28, hr * 0.5, hr * 0.14); }
  c.fillStyle = mdSh(face, 0.1); c.globalAlpha = 0.5; mdE(c, hdX + hr * 0.2, hdY + hr * 0.3, hr * 0.3, hr * 0.2); c.globalAlpha = 1;
  if (P.eyesClosed || st === 'sleep') mdEye(c, hdX + hr * 0.4, hdY - hr * 0.08, hr * 0.2, true, false); else { c.fillStyle = '#f1e8d8'; mdE(c, hdX + hr * 0.4, hdY - hr * 0.08, hr * 0.2, hr * 0.17); c.fillStyle = '#2a1a10'; mdE(c, hdX + hr * 0.45, hdY - hr * 0.07, hr * 0.12, hr * 0.12); c.fillStyle = '#fff'; mdE(c, hdX + hr * 0.48, hdY - hr * 0.11, hr * 0.04, hr * 0.04); c.strokeStyle = mdSh(col, -0.45); c.lineWidth = Math.max(0.8, hr * 0.06); c.beginPath(); c.moveTo(hdX + hr * 0.2, hdY - hr * 0.27); c.quadraticCurveTo(hdX + hr * 0.42, hdY - hr * 0.36, hdX + hr * 0.62, hdY - hr * 0.24); c.stroke(); }
  c.fillStyle = mdSh(col, 0.12); for (let k = 0; k < 3; k++) mdE(c, hdX - hr * 0.2 - k * hr * 0.08, hdY + hr * (0.55 + k * 0.08), hr * 0.18, hr * 0.1, 0.5);
  c.fillStyle = mdSh(col, -0.12); mdE(c, hdX - hr * 0.45, hdY - hr * 0.05, hr * 0.25, hr * 0.28); c.fillStyle = face; mdE(c, hdX - hr * 0.43, hdY - hr * 0.03, hr * 0.14, hr * 0.17);
  if (L.shaggy) { c.strokeStyle = mdSh(col, -0.15); c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 8; k++) { c.moveTo(hdX - hr * 0.6 + k * hr * 0.15, hdY - hr * 0.8); c.lineTo(hdX - hr * 0.8 + k * hr * 0.17, hdY - hr * 0.2); } c.stroke(); }
  }
  /* brazo cercano */
  arm(0, col);
  c.restore();
}
{ const base = mdDrawQuad; mdDrawQuad = function (c, a, S, time, P) { if (S.look && S.look.pr) return mdDrawPrimate(c, a, S, time, P); return base(c, a, S, time, P); }; }

function mdFunHead(c, x, y, r, col, belly, face, st, P, time) {
  const tilt = Math.sin(time * 0.004 + P.id) * 0.09, closed = P.eyesClosed || st === 'sleep', happy = st === 'groom' || st === 'banana' || st === 'play' || st === 'chase', scared = st === 'flee' || st === 'panic', dizzy = st === 'dizzy' || st === 'falling', tongue = st === 'banana' || st === 'hang' || st === 'swing' || dizzy;
  c.save(); c.translate(x, y); c.rotate(tilt);
  c.fillStyle = mdSh(col, -0.1); mdE(c, -r * 0.7, -r * 0.1, r * 0.36, r * 0.36); c.fillStyle = '#f2a79a'; mdE(c, -r * 0.7, -r * 0.1, r * 0.22, r * 0.22);
  c.fillStyle = col; mdE(c, 0, 0, r, r * 0.95); c.fillStyle = mdSh(col, 0.12); mdE(c, -r * 0.2, -r * 0.55, r * 0.5, r * 0.28);
  c.strokeStyle = mdSh(col, -0.25); c.lineWidth = Math.max(1, r * 0.07); c.lineCap = 'round'; c.beginPath(); c.moveTo(-r * 0.1, -r * 0.92); c.quadraticCurveTo(r * 0.05, -r * 1.25, r * 0.25, -r * 0.95); c.moveTo(r * 0.1, -r * 0.95); c.quadraticCurveTo(r * 0.3, -r * 1.2, r * 0.45, -r * 0.85); c.stroke();
  c.fillStyle = face; mdE(c, -r * 0.1, -r * 0.05, r * 0.46, r * 0.5); mdE(c, r * 0.3, -r * 0.05, r * 0.52, r * 0.52); mdE(c, r * 0.2, r * 0.36, r * 0.66, r * 0.44);
  c.globalAlpha = 0.5; c.fillStyle = '#ff8f9c'; mdE(c, r * 0.5, r * 0.3, r * 0.2, r * 0.13); mdE(c, -r * 0.12, r * 0.32, r * 0.15, r * 0.1); c.globalAlpha = 1;
  const eye = (ex, ey, k) => {
    if (closed || happy && Math.sin(time * 0.003 + P.id) > 0.2) { c.strokeStyle = '#2a1a10'; c.lineWidth = Math.max(1, r * 0.08); c.beginPath(); c.arc(ex, ey + r * 0.05, r * 0.15 * k, 3.4, 6.0); c.stroke(); return; }
    c.fillStyle = '#fff'; mdE(c, ex, ey, r * 0.22 * k, r * 0.26 * k); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(ex, ey, r * 0.22 * k, r * 0.26 * k, 0, 0, 6.3); c.stroke();
    if (dizzy) { c.strokeStyle = '#2a1a10'; c.lineWidth = r * 0.06; c.beginPath(); c.moveTo(ex - r * 0.1, ey - r * 0.1); c.lineTo(ex + r * 0.1, ey + r * 0.1); c.moveTo(ex + r * 0.1, ey - r * 0.1); c.lineTo(ex - r * 0.1, ey + r * 0.1); c.stroke(); return; }
    const lx = scared ? 0 : r * 0.07 + Math.sin(time * 0.0017 + P.id) * r * 0.04; c.fillStyle = '#2a1a10'; mdE(c, ex + lx, ey + r * 0.02, r * 0.13 * k, r * 0.16 * k); c.fillStyle = '#fff'; mdE(c, ex + lx + r * 0.04, ey - r * 0.05, r * 0.045, r * 0.045);
  };
  eye(r * 0.46, -r * 0.14, 1); eye(-r * 0.02, -r * 0.14, 0.92);
  c.strokeStyle = '#4a2c1a'; c.lineWidth = Math.max(1, r * 0.06); c.beginPath(); const up = scared ? -r * 0.12 : 0; c.moveTo(r * 0.3, -r * 0.46 + up); c.quadraticCurveTo(r * 0.46, -r * 0.55 + up, r * 0.62, -r * 0.44); c.moveTo(-r * 0.18, -r * 0.44 + up); c.quadraticCurveTo(-r * 0.02, -r * 0.54 + up, r * 0.14, -r * 0.46); c.stroke();
  c.fillStyle = '#3a2418'; mdE(c, r * 0.9, r * 0.1, r * 0.07, r * 0.05); mdE(c, r * 0.72, r * 0.1, r * 0.05, r * 0.04);
  const open = st === 'flee' || st === 'panic' || st === 'banana' || st === 'chat' || P.mouth;
  if (open) { c.fillStyle = '#7a2a30'; mdE(c, r * 0.5, r * 0.5, r * 0.3, r * 0.2); c.fillStyle = '#f08a96'; mdE(c, r * 0.52, r * 0.58, r * 0.18, r * 0.09); }
  else { c.strokeStyle = '#4a2c1a'; c.lineWidth = Math.max(1, r * 0.07); c.beginPath(); c.arc(r * 0.48, r * 0.28, r * 0.28, 0.35, 2.45); c.stroke(); if (tongue) { c.fillStyle = '#f08a96'; mdE(c, r * 0.5, r * 0.62, r * 0.12, r * 0.17); } }
  c.restore();
}
