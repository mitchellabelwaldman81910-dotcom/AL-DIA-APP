/* Al Día 7.5 — Ilustración en línea fina.
   Todo se dibuja con trazos delgados que toman el color del estilo elegido (día y noche):
   tinta para la estructura, acento para las hojas y dorado suave para flores, frutos y luz.
   La primera vez que ves un nivel, el árbol se dibuja trazo a trazo. */
'use strict';
const LN = { seen: new Set() };
const lnR = (n) => Math.round(n * 10) / 10;

/* hoja en forma de almendra, con nervadura central; ang en grados (0 = hacia la derecha) */
function lnLeaf(x, y, ang, L, cls = 'lf', d = 0) {
  const a = lnR(L * 0.28), b = lnR(L * 0.72), w = lnR(L * 0.26);
  return `<path class="${cls}" style="--d:${d}ms" d="M0 0C${a} ${-w} ${b} ${-w} ${lnR(L)} 0C${b} ${w} ${a} ${w} 0 0Z${L > 6 ? `M${lnR(L * 0.14)} 0H${lnR(L * 0.8)}` : ''}" transform="translate(${lnR(x)} ${lnR(y)}) rotate(${lnR(ang)})"/>`;
}
/* nube de un solo trazo */
function lnCloud(x, y, s, cls) {
  const k = (n) => lnR(n * s);
  return `<path class="ln s ${cls || ''}" stroke-width="1" d="M${lnR(x)} ${lnR(y)}h${k(46)}c${k(7)} 0 ${k(9)} ${k(-10)} ${k(1)} ${k(-12)}c${k(-1)} ${k(-10)} ${k(-13)} ${k(-13)} ${k(-19)} ${k(-5)}c${k(-4)} ${k(-9)} ${k(-19)} ${k(-7)} ${k(-19)} ${k(3)}c${k(-8)} ${k(-1)} ${k(-12)} ${k(8)} ${k(-9)} ${k(14)}z"/>`;
}
/* florecita de cinco pétalos */
function lnFlower(x, y, s = 1, cls = 'fl') {
  let o = `<g transform="translate(${lnR(x)} ${lnR(y)}) scale(${lnR(s)})">`;
  for (let i = 0; i < 5; i++) { const a = (i * 72 * Math.PI) / 180; o += `<circle class="${cls}" cx="${lnR(Math.sin(a) * 2.1)}" cy="${lnR(-Math.cos(a) * 2.1)}" r="1.35"/>`; }
  return o + '<circle class="dot" r=".7"/></g>';
}

function treeScene({ level = 0, max = 100, wet = true, id = 'v', seed = 'x', pour = false, garden = null }) {
  const v = max === 100 ? Math.max(0, Math.min(100, level)) : Math.max(0, Math.min(100, Math.round(100 * Math.sqrt(level / max))));
  const p = v / 100;
  const R = rnd(seedOf(seed + ':' + id));
  const W = 360, H = 300, GY = 252, cx = 180;
  const key = `${id}:${seed}:${v}`; const anim = !LN.seen.has(key); LN.seen.add(key);
  let o = `<svg viewBox="0 0 ${W} ${H}" class="vscene-svg ln-scene ${wet ? 'is-wet' : 'is-dry'} ${pour ? 'is-pour' : ''}" role="img" aria-label="Tu árbol, nivel ${level}" preserveAspectRatio="xMidYMid slice">`;
  const u = `${id}-${String(seed).replace(/[^a-z0-9]/gi, '')}`;
  // ---- acuarela: cielo, luz, montañas y colinas lavadas (los trazos van encima) ----
  o += `<defs>
    <linearGradient id="sky-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sk-a"/><stop offset=".62" class="sk-b"/><stop offset="1" class="sk-c"/></linearGradient>
    <radialGradient id="sun-${u}" cx="292" cy="60" r="${lnR(90 + 120 * p)}" gradientUnits="userSpaceOnUse"><stop offset="0" class="sg-a"/><stop offset=".35" class="sg-b"/><stop offset="1" class="sg-c"/></radialGradient>
    <linearGradient id="mt-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="mt-a"/><stop offset="1" class="mt-b"/></linearGradient>
    <linearGradient id="hl-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="hl-a"/><stop offset="1" class="hl-b"/></linearGradient>
    <linearGradient id="gd-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="gd-a"/><stop offset="1" class="gd-b"/></linearGradient>
    <radialGradient id="cw-${u}"><stop offset="0" class="cw-a"/><stop offset=".7" class="cw-b"/><stop offset="1" class="cw-c"/></radialGradient>
    <radialGradient id="ch-${u}"><stop offset="0" class="ch-a"/><stop offset="1" class="ch-b"/></radialGradient>
    <linearGradient id="lk-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="lk-a"/><stop offset="1" class="lk-b"/></linearGradient>
    <radialGradient id="vg-${u}" cx=".5" cy=".45" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" class="vg-b"/></radialGradient>
    <filter id="soft-${u}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${lnR(3.5 + 2 * p)}"/></filter>
  </defs>`;
  o += `<rect width="${W}" height="${H}" fill="url(#sky-${u})"/>`;
  o += `<rect width="${W}" height="${H}" fill="url(#sun-${u})" class="w-sun"/>`;
  if (v >= 20) o += `<g class="w-rays">${[-0.5, -0.2, 0.12, 0.42].map((k, i) => `<path d="M292 60L${lnR(292 + Math.cos(2.2 + k) * 420)} ${lnR(60 + Math.sin(2.2 + k) * 420)}L${lnR(292 + Math.cos(2.26 + k) * 420)} ${lnR(60 + Math.sin(2.26 + k) * 420)}Z" style="--d:${i * 1.7}s"/>`).join('')}</g>`;
  o += `<path class="w-mt1" fill="url(#mt-${u})" d="M0 170L28 150L52 158L86 128L116 146L140 136L176 112L206 134L228 126L262 104L296 132L326 120L360 138V230H0Z"/>`;
  o += `<path class="w-mt2" fill="url(#mt-${u})" d="M0 188L40 168L74 178L110 156L150 174L190 160L224 172L258 150L300 170L336 160L360 168V230H0Z"/>`;
  o += `<path class="w-hl1" fill="url(#hl-${u})" d="M0 196C60 170 120 192 190 178S320 160 360 182V300H0Z"/>`;
  o += `<path class="w-hl2" fill="url(#hl-${u})" d="M0 224C70 206 140 228 220 214S330 202 360 216V300H0Z"/>`;
  o += `<path class="w-gd" fill="url(#gd-${u})" d="M0 ${GY - 6}C80 ${GY - 14} 150 ${GY - 2} 230 ${GY - 8}S340 ${GY - 14} 360 ${GY - 6}V300H0Z"/>`;
  if (v >= 35) { const rx = lnR(24 + 14 * p); o += `<ellipse cx="300" cy="${GY + 27}" rx="${rx}" ry="7" fill="url(#lk-${u})"/>`; }
  if (v >= 70) o += `<path fill="url(#lk-${u})" opacity=".8" d="M-2 ${GY + 38}C60 ${GY + 46} 140 ${GY + 34} 200 ${GY + 41}S250 ${GY + 34} 270 ${GY + 31}L282 ${GY + 35}C262 ${GY + 41} 210 ${GY + 47} 150 ${GY + 41}S50 ${GY + 52} -2 ${GY + 44}Z"/>`;
  // estrellas y constelación
  if (v >= 90) {
    const st = Array.from({ length: 18 }, () => [lnR(16 + R() * 328), lnR(12 + R() * 96)]);
    o += '<g class="v-stars">' + st.map(([x, y], i) => `<path class="ln s" stroke-width=".8" style="--d:${lnR((i % 7) * 0.45)}s" d="M${x - 2.4} ${y}h4.8M${x} ${y - 2.4}v4.8"/>`).join('') + '</g>';
    if (v >= 96) { const cs = [[176, 22], [192, 14], [210, 20], [224, 12], [240, 26], [226, 36]]; o += `<path class="ln g" stroke-width=".6" stroke-dasharray="1.5 2.5" opacity=".75" d="M${cs.map(([x, y]) => `${x} ${y}`).join(' L')}"/>` + cs.map(([x, y]) => `<circle class="dot" cx="${x}" cy="${y}" r=".9"/>`).join(''); }
  }
  // sol
  if (v >= 12) {
    const sr = lnR(11 + 6 * p);
    o += `<g transform="translate(292 60)"><circle class="ln g" stroke-width="1.1" r="${sr}"/><circle class="ln g" stroke-width=".6" opacity=".5" r="${lnR(sr + 5)}"/>`;
    if (v >= 30) o += `<g class="v-rays">${Array.from({ length: 16 }, (_, i) => { const a = (i * 22.5 * Math.PI) / 180, r0 = sr + 9, r2 = sr + (i % 2 ? 13 : 17); return `<path class="ln g" stroke-width=".8" d="M${lnR(Math.cos(a) * r0)} ${lnR(Math.sin(a) * r0)}L${lnR(Math.cos(a) * r2)} ${lnR(Math.sin(a) * r2)}"/>`; }).join('')}</g>`;
    o += '</g>';
  }
  // nubes
  o += `<g class="v-cloud c1">${lnCloud(40, 62, 1)}</g>`;
  if (v >= 10) o += `<g class="v-cloud c2">${lnCloud(196, 44, 0.75)}</g>`;
  // colinas lejanas (curvas de nivel)
  o += `<path class="ln s" stroke-width=".9" d="M0 196C60 170 120 192 190 178S320 160 360 182"/>`;
  o += `<path class="ln s" stroke-width=".6" opacity=".7" d="M0 206C70 186 130 204 200 192S320 178 360 194"/>`;
  if (v >= 30) {
    const n = Math.min(9, 3 + Math.floor((v - 30) / 8));
    for (let i = 0; i < n; i++) { const x = 18 + R() * 324, y = 186 + R() * 8, s = 0.55 + R() * 0.45; o += `<g transform="translate(${lnR(x)} ${lnR(y)}) scale(${lnR(s)})"><path class="ln s" stroke-width="1" d="M0 0V-12"/><path class="ln s" stroke-width="1" d="M0 -10C-6 -12 -7 -22 0 -26C7 -22 6 -12 0 -10Z"/></g>`; }
  }
  o += `<path class="ln s" stroke-width=".9" d="M0 224C70 206 140 228 220 214S330 202 360 216"/>`;
  // horizonte y suelo con achurado
  o += `<path class="ln" stroke-width="1.3" d="M0 ${GY - 6}C80 ${GY - 14} 150 ${GY - 2} 230 ${GY - 8}S340 ${GY - 14} 360 ${GY - 6}"/>`;
  for (let i = 0; i < 34; i++) { const x = 6 + i * 10.4 + R() * 4, y = GY + 6 + R() * 34; if (v >= 35 && x > 256 && x < 344 && y > GY + 16 && y < GY + 38) continue; o += `<path class="ln s" stroke-width=".6" d="M${lnR(x)} ${lnR(y)}l${lnR(5 + R() * 4)} -2.2"/>`; }
  // estanque y río
  if (v >= 35) {
    const rx = lnR(24 + 14 * p);
    o += `<g class="v-pond"><ellipse class="ln w" stroke-width="1" cx="300" cy="${GY + 27}" rx="${rx}" ry="7"/><path class="ln w v-glint" stroke-width=".7" d="M${lnR(300 - rx * 0.55)} ${GY + 27}h${lnR(rx * 0.4)}M${lnR(300 + rx * 0.05)} ${GY + 30}h${lnR(rx * 0.35)}"/></g>`;
  }
  if (v >= 70) o += `<g class="v-river"><path class="ln w" stroke-width="1" d="M-2 ${GY + 38}C60 ${GY + 46} 140 ${GY + 34} 200 ${GY + 41}S250 ${GY + 34} 270 ${GY + 31}"/><path class="ln w" stroke-width=".7" stroke-dasharray="6 7" d="M-2 ${GY + 44}C70 ${GY + 52} 150 ${GY + 41} 210 ${GY + 47}S262 ${GY + 41} 282 ${GY + 35}"/></g>`;
  // pasto
  const nGrass = Math.min(40, Math.floor(10 + v * 0.45));
  for (let i = 0; i < nGrass; i++) {
    const x = R() * W, y = GY - 3 + R() * 40; if (v >= 35 && x > 256 && x < 344 && y > GY + 16 && y < GY + 38) continue;
    const h = 4 + R() * 6;
    o += `<path class="ln a" stroke-width=".8" opacity=".75" d="M${lnR(x)} ${lnR(y)}q-1.5 ${lnR(-h * 0.6)} -3 ${lnR(-h)}M${lnR(x)} ${lnR(y)}q.6 ${lnR(-h * 0.7)} 1.8 ${lnR(-h * 1.1)}"/>`;
  }
  // flores del prado
  const nFl = v < 8 ? 0 : Math.min(26, Math.floor(v / 3.6));
  for (let i = 0; i < nFl; i++) {
    const x = 10 + R() * (W - 20), y = GY + 4 + R() * 34; if (v >= 35 && x > 256 && x < 344 && y > GY + 14 && y < GY + 40) continue;
    o += `<path class="ln a" stroke-width=".7" d="M${lnR(x)} ${lnR(y)}v-6"/>${lnFlower(x, y - 7, 0.8 + R() * 0.3)}`;
  }

  // ---- el árbol ----
  if (v === 0) {
    o += `<g class="v-seed"><path class="ln" stroke-width="1.2" d="M${cx - 30} ${GY + 1}C${cx - 16} ${GY - 9} ${cx + 16} ${GY - 9} ${cx + 30} ${GY + 1}"/>
      <path class="lf2" d="M${cx - 5} ${GY - 4}C${cx - 4} ${GY - 9} ${cx + 4} ${GY - 9} ${cx + 5} ${GY - 4}C${cx + 3} ${GY - 1} ${cx - 3} ${GY - 1} ${cx - 5} ${GY - 4}Z"/>
      <path class="ln a ln-flow" stroke-width="1" stroke-dasharray="2 4" d="M${cx} ${GY - 10}C${cx - 2} ${GY - 22} ${cx + 3} ${GY - 32} ${cx} ${GY - 44}"/>
      <circle class="ln g v-pulse" stroke-width=".7" cx="${cx}" cy="${GY - 6}" r="13" opacity=".6"/></g>`;
  } else if (v < 3) {
    const h = 16 + v * 9;
    o += `<g class="vt-sway ${anim ? 'grow' : ''}"><path class="ln" stroke-width="1.1" d="M${cx - 22} ${GY + 1}C${cx - 10} ${GY - 6} ${cx + 10} ${GY - 6} ${cx + 22} ${GY + 1}"/>
      <path class="ln br" pathLength="1" style="--d:0ms" stroke-width="1.4" d="M${cx} ${GY - 3}C${cx} ${GY - h * 0.5} ${cx + 2} ${GY - h * 0.8} ${cx} ${GY - h}"/>
      ${lnLeaf(cx, GY - h + 2, -150, 11, 'lf', 500)}${lnLeaf(cx, GY - h + 1, -30, 12, 'lf', 650)}</g>`;
  } else {
    const depthMax = v < 8 ? 2 : v < 16 ? 3 : v < 28 ? 4 : v < 50 ? 5 : 6;
    const trunkLen = 16 + 33 * Math.pow(p, 0.6), trunkW = 1.5 + 3.4 * Math.pow(p, 0.8);
    const L = 5.5 + 4.4 * Math.pow(p, 0.5);
    const br = [], bark = [], leaves = [], ends = [];
    const step = 170;
    const grow = (x, y, ang, len, w, d) => {
      const x2 = x + Math.sin(ang) * len, y2 = y - Math.cos(ang) * len;
      const mx = x + Math.sin(ang + (R() - 0.5) * 0.35) * len * 0.5, my = y - Math.cos(ang) * len * 0.5;
      br.push(`<path class="ln br" pathLength="1" style="--d:${d * step}ms" stroke-width="${lnR(Math.max(0.55, w))}" d="M${lnR(x)} ${lnR(y)}Q${lnR(mx)} ${lnR(my)} ${lnR(x2)} ${lnR(y2)}"/>`);
      if (d <= 1 && w > 2.2) for (let k = 0; k < 4; k++) { const t = 0.2 + k * 0.18, bx = x + (x2 - x) * t, by = y + (y2 - y) * t; bark.push(`<path class="ln s" stroke-width=".5" d="M${lnR(bx - w * 0.3)} ${lnR(by)}q${lnR(w * 0.3)} -1.6 ${lnR(w * 0.6)} -.4"/>`); }
      const deg = (Math.atan2(-Math.cos(ang), Math.sin(ang)) * 180) / Math.PI;
      const ld = d * step + 420;
      if (d >= 1) {
        const n = d >= depthMax ? 2 + (R() < 0.45 ? 1 : 0) : (R() < 0.3 ? 1 : 0);
        for (let i = 0; i < n; i++) leaves.push(lnLeaf(x2, y2, deg + (i - (n - 1) / 2) * 42 + (R() - 0.5) * 16, L * (0.8 + R() * 0.35), R() < 0.1 ? 'lf2' : 'lf', ld));
        if (d >= depthMax - 1) ends.push([x2, y2, ld]);
      }
      if (d >= depthMax) return;
      const kids = d === 0 ? (v >= 40 ? 3 : 2) : (d < 4 && v >= 60 && R() < 0.3 ? 3 : 2);
      const spread = 0.34 + 0.12 * R();
      for (let i = 0; i < kids; i++) grow(x2, y2, (ang + (i - (kids - 1) / 2) * spread * (d < 2 ? 1.25 : 1.45) + (R() - 0.5) * 0.18) * (d >= 2 ? 0.93 : 1), len * (0.64 + R() * 0.2) * (d === 0 ? 1.05 : 1), w * 0.64, d + 1);
    };
    grow(cx, GY - 3, (R() - 0.5) * 0.08, trunkLen, trunkW, 0);
    let roots = '';
    if (v >= 20) for (const s of [-1, 1]) roots += `<path class="ln" stroke-width="${lnR(trunkW * 0.45)}" d="M${cx} ${GY - 3}q${s * 7} 2 ${lnR(s * (12 + 12 * p))} 6"/><path class="ln s" stroke-width=".6" d="M${cx + s * 4} ${GY}q${s * 5} 4 ${lnR(s * (8 + 8 * p))} 9"/>`;
    // copa en acuarela: manchas suaves bajo las hojas de línea, con luz del lado del sol
    let wash = '';
    if (ends.length) {
      const cr = 8 + 16 * p; const pick = ends.length > 60 ? ends.filter((_, i) => i % 2 === 0) : ends;
      for (const [x, y] of pick) wash += `<circle cx="${lnR(x + (R() - 0.5) * 6)}" cy="${lnR(y + (R() - 0.5) * 6)}" r="${lnR(cr * (0.7 + R() * 0.6))}" fill="url(#cw-${u})"/>`;
      let hi = ''; for (const [x, y] of pick.filter((q) => q[0] > cx - 4).slice(0, 18)) hi += `<circle cx="${lnR(x + 4)}" cy="${lnR(y - 5)}" r="${lnR(cr * 0.55)}" fill="url(#ch-${u})"/>`;
      wash = `<g class="w-canopy ${anim ? 'grow-w' : ''}" filter="url(#soft-${u})">${wash}${hi}</g>`;
    }
    const shadow = `<ellipse class="w-shadow" cx="${cx + 14}" cy="${GY + 2}" rx="${lnR(26 + 46 * p)}" ry="${lnR(4 + 3 * p)}" filter="url(#soft-${u})"/>`;
    o += `<g class="vt-sway ${anim ? 'grow' : ''} ${wet ? '' : 'dry'}">${shadow}${wash}<ellipse class="ln s" stroke-width=".7" cx="${cx}" cy="${GY + 3}" rx="${lnR(20 + 26 * p)}" ry="4"/>${roots}${br.join('')}${bark.join('')}<g class="vt-leaves">${leaves.join('')}</g>`;
    if (wet && v >= 38) { const nF = Math.min(16, Math.floor((v - 36) / 3)); for (let i = 0; i < nF && ends.length; i++) { const [x, y, d] = ends[Math.floor(R() * ends.length)]; o += `<g class="fl-g" style="--d:${d + 200}ms">${lnFlower(x + (R() - 0.5) * 8, y + (R() - 0.5) * 8, 0.85)}</g>`; } }
    if (wet && v >= 55) { const nF = Math.min(12, Math.floor((v - 52) * 0.3)); for (let i = 0; i < nF && ends.length; i++) { const [x, y, d] = ends[Math.floor(R() * ends.length)]; const fx = x + (R() - 0.5) * 7, fy = y + 3 + R() * 4; o += `<g class="fl-g" style="--d:${d + 300}ms"><path class="ln g" stroke-width=".6" d="M${lnR(fx)} ${lnR(fy - 3)}v2"/><circle class="fr" cx="${lnR(fx)}" cy="${lnR(fy + 1)}" r="${v >= 95 ? 2.6 : 2.1}"/></g>`; } }
    if (!wet) o += `<path class="ln w vt-thirst" stroke-width="1" stroke-dasharray="2 2.5" d="M0 0C-5 8-7 12-3 15 1 17 5 15 6 11 7 7 3 3 0 0Z" transform="translate(${cx + 30} ${lnR(GY - trunkLen - 30)})"/>`;
    if (false) { const cy = lnR(GY - trunkLen * 2.1); o += [1.25].map((k, i) => `<circle class="ln g v-pulse" stroke-width=".6" opacity="${0.55 - i * 0.15}" cx="${cx}" cy="${cy}" r="${lnR(trunkLen * k)}" style="animation-delay:${i * 0.6}s"/>`).join(''); }
    o += '</g>';
  }
  // visitantes
  if (v >= 45) { const n = Math.min(5, 1 + Math.floor((v - 45) / 12)); for (let i = 0; i < n; i++) o += `<g class="v-bfly" style="--d:${lnR(i * 1.7)}s;--x:${lnR(40 + R() * 280)}px;--y:${lnR(120 + R() * 90)}px"><path class="ln a" stroke-width=".8" d="M0 0C-3 -5 -8 -4 -6 0C-8 4 -3 5 0 0C3 -5 8 -4 6 0C8 4 3 5 0 0Z"/></g>`; }
  if (v >= 60) { const n = Math.min(4, 1 + Math.floor((v - 60) / 14)); for (let i = 0; i < n; i++) o += `<g class="v-bird" style="--d:${lnR(i * 2.3)}s;--y:${lnR(30 + R() * 60)}px"><path class="ln" stroke-width="1" d="M0 0q4 -4.5 8 0q4 -4.5 8 0"/></g>`; }
  if (v >= 70) { const n = Math.min(14, 4 + Math.floor((v - 70) / 2.5)); for (let i = 0; i < n; i++) o += `<circle class="v-fly dot" cx="${lnR(20 + R() * 320)}" cy="${lnR(150 + R() * 100)}" r="1.3" style="--d:${lnR(R() * 4)}s"/>`; }
  if (v >= 75) { const n = Math.min(10, 3 + Math.floor((v - 75) / 3)); for (let i = 0; i < n; i++) o += `<g class="v-petal" style="--d:${lnR(R() * 8)}s;--dur:${lnR(9 + R() * 6)}s;--dx:${lnR((R() - 0.5) * 80)}px"><g transform="translate(${lnR(R() * W)} -10)">${lnLeaf(0, 0, R() * 360, 6, i % 3 ? 'lf' : 'lf2')}</g></g>`; }
  // riego
  if (pour) {
    o += `<g class="v-rain"><g class="v-raincloud">${lnCloud(150, 46, 1.25).replace('ln s', 'ln')}</g>`;
    for (let i = 0; i < 20; i++) o += `<path class="ln w v-drop" stroke-width="1" d="M${lnR(130 + R() * 100)} 52v6" style="--d:${lnR(R() * 1.2)}s;--h:${lnR(150 + R() * 70)}px"/>`;
    o += '</g>';
  }
  if (garden && garden.length) o += gardenSVG(garden, id);
  o += `<rect width="${W}" height="${H}" fill="url(#vg-${u})" pointer-events="none"/>`;
  return o + '</svg>';
}

/* Arbolito para listas y tarjetas */
function treeIcon(level, max = 100) {
  const v = max === 100 ? level : Math.round(100 * Math.sqrt(level / max));
  const s = v === 0 ? 0 : v < 10 ? 1 : v < 30 ? 2 : v < 60 ? 3 : v < 90 ? 4 : 5;
  let o = '<svg viewBox="0 0 40 40" class="tree-ico ln-ico" aria-hidden="true"><path class="ln s" stroke-width="1" d="M6 34.5C14 32.5 26 32.5 34 34.5"/>';
  if (s === 0) return o + '<path class="lf2" d="M16.5 31C17 28 23 28 23.5 31C22 33 18 33 16.5 31Z"/></svg>';
  const h = 6 + s * 3.2;
  o += `<path class="ln" stroke-width="${lnR(0.9 + s * 0.25)}" d="M20 33.5V${lnR(33.5 - h)}"/>`;
  if (s >= 2) o += `<path class="ln" stroke-width=".8" d="M20 ${lnR(33.5 - h * 0.55)}L${lnR(20 - 2 - s)} ${lnR(33.5 - h * 0.85)}M20 ${lnR(33.5 - h * 0.65)}L${lnR(20 + 2 + s)} ${lnR(33.5 - h * 0.95)}"/>`;
  const top = 33.5 - h; const n = 2 + s * 2; const rr = 2 + s * 1.6;
  for (let i = 0; i < n; i++) { const a = -90 + (i - (n - 1) / 2) * (150 / Math.max(1, n - 1)); const rad = (a * Math.PI) / 180; o += lnLeaf(20 + Math.cos(rad) * rr * 0.4, top + Math.sin(rad) * rr * 0.4 + 1, a, 5 + s * 0.7, i % 4 === 3 ? 'lf2' : 'lf'); }
  if (s === 5) o += '<circle class="ln g" stroke-width=".6" cx="20" cy="' + lnR(top) + '" r="12" opacity=".6"/>';
  return o + '</svg>';
}

/* Jardín en línea fina (mismas posiciones que antes) */
function gardenSVG(ids, id) {
  const has = (k) => (ids || []).includes(k); let o = '<g transform="translate(0 -26)" class="ln-garden">';
  if (has('windmill')) o += `<g transform="translate(26 252)"><path class="ln" stroke-width="1" d="M-7 0L-4 -34H4L7 0M-5 -34L0 -42L5 -34M-1.6 0V-7H1.6V0"/><g class="g-spin" style="transform-box:fill-box;transform-origin:center"><g transform="translate(0 -33)"><path class="ln a" stroke-width=".9" d="M0 0L-3 -21H3ZM0 0L21 -3V3ZM0 0L3 21H-3ZM0 0L-21 3V-3Z"/></g></g></g>`;
  if (has('fence')) { o += '<g transform="translate(0 270)"><path class="ln" stroke-width=".9" d="M0 -9H48M0 -3H48"/>'; for (let i = 0; i < 7; i++) o += `<path class="ln" stroke-width=".9" d="M${1 + i * 7} 2V-13l2.2 -3 2.2 3V2"/>`; o += '</g>'; }
  if (has('birdhouse')) o += `<g transform="translate(336 262)"><path class="ln" stroke-width="1" d="M0 2V-22M-8 -22H8V-35H-8ZM-10 -34L0 -43L10 -34"/><circle class="ln" stroke-width=".9" cy="-29" r="2.6"/></g><g style="transform:translate(329px,224px)"><g class="g-hop"><path class="ln a" stroke-width=".9" d="M-4 0C-4 -4 3 -5 4 -1L7 -1L4 1C3 4 -4 4 -4 0ZM-4 0L-8 -1"/></g></g>`;
  if (has('mush')) o += `<g transform="translate(214 273)"><path class="ln" stroke-width=".9" d="M-1.6 1V-5M1.6 1V-5M-7 -5A7 6 0 0 1 7 -5Z"/><circle class="dot" cx="-2.6" cy="-8" r=".8"/><circle class="dot" cx="2.6" cy="-7.4" r=".7"/></g><g transform="translate(226 276) scale(.7)"><path class="ln" stroke-width="1.1" d="M-1.6 1V-5M1.6 1V-5M-7 -5A7 6 0 0 1 7 -5Z"/></g>`;
  if (has('bench')) o += `<g transform="translate(264 270)"><path class="ln" stroke-width="1" d="M-15 -9H15M-15 -15H15M-13 2V-15M13 2V-15M-15 -6H15"/></g>`;
  if (has('lantern')) o += `<g transform="translate(310 270)"><circle class="ln g v-pulse" stroke-width=".6" cy="-35" r="12" opacity=".6"/><path class="ln" stroke-width="1" d="M0 2V-30M-5 -30H5V-40H-5ZM-7 -40H7L4 -45H-4Z"/><circle class="dot" cy="-35" r="1.6"/></g>`;
  if (has('tent')) o += `<g transform="translate(66 296)"><path class="ln" stroke-width="1" d="M-20 0L0 -26L20 0ZM0 -26L7 0M0 -26L-7 0M-24 0H24"/></g>`;
  if (has('chest')) o += `<g transform="translate(198 296)"><path class="ln" stroke-width="1" d="M-11 0V-10H11V0ZM-11 -10A11 7 0 0 1 11 -10M-11 -6H11"/><path class="ln g" stroke-width="1" d="M-1.6 -8H1.6V-4H-1.6Z"/><circle class="ln g v-pulse" stroke-width=".6" cy="-11" r="13" opacity=".5"/></g>`;
  if (has('fountain')) o += `<g transform="translate(100 296)"><ellipse class="ln" stroke-width="1" rx="19" ry="5"/><ellipse class="ln w" stroke-width=".7" rx="14" ry="3"/><path class="ln" stroke-width="1" d="M-2 -2V-14H2V-2"/><path class="ln w" stroke-width=".8" stroke-dasharray="2 2.4" d="M0 -14C-4 -22 -10 -16 -11 -4M0 -14C4 -22 10 -16 11 -4"/></g>`;
  if (has('fox')) o += `<g transform="translate(150 296)"><path class="ln" stroke-width=".9" d="M-8 0C-8 -6 6 -7 8 -3M-8 0H8M-8 -1C-15 -3 -19 3 -17 6C-12 6 -9 3 -8 1M8 -3C9 -8 12 -10 14 -9L15 -12L16 -7C17 -5 15 -3 12 -3Z"/><circle class="dot" cx="13" cy="-7" r=".7"/></g>`;
  if (has('bunny')) o += `<g style="transform:translate(240px,288px)"><g class="g-hop"><path class="ln" stroke-width=".9" d="M-7 0C-7 -6 4 -7 6 -2C10 -3 10 2 6 2H-7ZM4 -5C2 -12 4 -15 5 -9M7 -5C8 -12 10 -14 9 -8"/><circle class="dot" cx="7" cy="-3" r=".6"/></g></g>`;
  if (has('balloon')) o += `<g style="transform:translate(30px,118px)"><g class="g-float"><ellipse class="ln" stroke-width="1" rx="13" ry="16"/><path class="ln a" stroke-width=".7" d="M0 -16C-6 -8 -6 8 0 16C6 8 6 -8 0 -16M-13 0H13"/><path class="ln" stroke-width=".8" d="M-6 14L-4 24M6 14L4 24M-5 24H5V30H-5Z"/></g></g>`;
  return o + '</g>';
}

/* Planta de la semana, en maceta de línea */
function plantSVG(stage) {
  const top = stage >= 3 ? 32 : stage === 2 ? 48 : stage === 1 ? 66 : 86;
  const leaf = (x, y, r, s, d, c = 'lf') => `<g class="pl-leaf" style="--d:${d}ms">${lnLeaf(x, y, r, 22 * s, c)}</g>`;
  return `<svg viewBox="0 0 120 130" class="plant ln-ico st${stage}" aria-hidden="true">
    <path class="ln s" stroke-width=".8" d="M26 124C46 121 74 121 94 124"/>
    <path class="ln" stroke-width="1.2" d="M37 98H83L78 122H42ZM33 91H87V98H33Z"/>
    <path class="ln s" stroke-width=".6" d="M45 106H75M47 113H73"/>
    <path class="pl-stem ln a" stroke-width="1.6" d="M60 92C60 78 58 64 61 ${top}"/>
    ${stage >= 1 ? leaf(60, 80, -150, 0.9, 100) + leaf(61, 77, -30, 0.95, 200) : '<path class="lf2" d="M55 89C56 85 64 85 65 89C63 91 57 91 55 89Z"/>'}
    ${stage >= 2 ? leaf(60, 62, -160, 1, 300, 'lf2') + leaf(61, 58, -22, 1.05, 400) : ''}
    ${stage >= 3 ? leaf(60, 44, -148, 0.95, 500) + leaf(61, 40, -35, 0.9, 600, 'lf2') : ''}
    ${stage >= 4 ? `<g class="pl-flower" transform="translate(61 26)">${[0, 72, 144, 216, 288].map((r) => `<ellipse class="fl" rx="4.6" ry="8" transform="rotate(${r}) translate(0 -8)"/>`).join('')}<circle class="fr" r="4"/></g>` : ''}
  </svg>`;
}

/* Celebración elegante: anillos y destellos de línea, en lugar de confeti */
function confetti(x, y, n = 28) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const big = n >= 50; const s = big ? 260 : 190;
  const d = document.createElement('div'); d.className = 'ln-burst'; d.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px`;
  let g = `<svg viewBox="-100 -100 200 200" aria-hidden="true"><circle class="b-ring r1" r="40"/><circle class="b-ring r2" r="64"/>`;
  const rays = big ? 24 : 16;
  for (let i = 0; i < rays; i++) { const a = (i / rays) * Math.PI * 2, r0 = 30 + (i % 2) * 8, r2 = r0 + (i % 2 ? 22 : 36); g += `<path class="b-ray" style="--i:${i}" d="M${lnR(Math.cos(a) * r0)} ${lnR(Math.sin(a) * r0)}L${lnR(Math.cos(a) * r2)} ${lnR(Math.sin(a) * r2)}"/>`; }
  for (let i = 0; i < (big ? 10 : 6); i++) { const a = Math.random() * Math.PI * 2, r = 50 + Math.random() * 40; g += `<g style="--i:${i}" class="b-leaf">${lnLeaf(Math.cos(a) * r, Math.sin(a) * r, (a * 180) / Math.PI, 10, i % 3 ? 'lf' : 'lf2')}</g>`; }
  d.innerHTML = g + '</svg>'; document.body.appendChild(d); setTimeout(() => d.remove(), 1700);
}
function floatText(el, text, cls = '') {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect(); const d = document.createElement('span');
  d.className = 'float-pts ' + cls; d.textContent = text; d.style.left = (r.left + r.width / 2) + 'px'; d.style.top = (r.top + r.height / 2) + 'px';
  document.body.appendChild(d); setTimeout(() => d.remove(), 1700);
}
