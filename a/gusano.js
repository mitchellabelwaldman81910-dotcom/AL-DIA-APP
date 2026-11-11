/* Cinnavia 7.41 — Gusano Goloso: puzzle de 1000 niveles. Come manzanas para crecer, llega a la salida.
   Las reglas viven en gusano-motor.js; los niveles de gusano-niveles.js están resueltos con ese mismo motor. */
'use strict';
const GW_N = () => (typeof GW_LV !== 'undefined' ? GW_LV.length : 0);
const GW_ENVS = [
  { n: 'Prado soleado', sky: ['#8FD3F4', '#E4F5CF'], wall: ['#6DBE4B', '#9A6A3E', '#7A5230'], fr: ['#E0443A', '#A82A22'], p: ['petal', '#FFFFFF'], deco: 'hills', dc: ['#B9E2A0', '#9FD58A'] },
  { n: 'Bosque tranquilo', sky: ['#BFE3C9', '#EAF4D8'], wall: ['#4C9A48', '#6B4A2D', '#4F3620'], fr: ['#7BC043', '#4C8A24'], p: ['leaf', '#78B85A'], deco: 'trees', dc: ['#8FC49A', '#6FAE7E'] },
  { n: 'Otoño', sky: ['#F8D9A6', '#F6EBD3'], wall: ['#D08A2E', '#7A4A26', '#5C3519'], fr: ['#F08A32', '#C2601A'], p: ['leaf', '#E0782A'], deco: 'trees', dc: ['#E6B678', '#D9A05E'] },
  { n: 'Playa', sky: ['#86D3F0', '#FBEBC4'], wall: ['#EBD493', '#C9A55A', '#A8863F'], fr: ['#FFB43A', '#E07F12'], p: ['sparkle', '#FFFFFF'], deco: 'waves', dc: ['#6FC8E8', '#4FB0D8'] },
  { n: 'Desierto', sky: ['#F6C98A', '#FBE9C9'], wall: ['#DDAA5E', '#B07A3A', '#8A5A26'], fr: ['#F06A9C', '#C23C72'], p: ['dust', '#E8C48A'], deco: 'dunes', dc: ['#EBC083', '#E0AC66'] },
  { n: 'Nevada', sky: ['#CFE6F7', '#F6FBFF'], wall: ['#FFFFFF', '#BFD6E8', '#9FBBD2'], fr: ['#E0443A', '#A82A22'], p: ['snow', '#FFFFFF'], deco: 'peaks', dc: ['#E1EEF8', '#CFE0EE'] },
  { n: 'Aurora polar', sky: ['#0F2A4A', '#4FCFB8'], wall: ['#D5F1FF', '#6FA8D0', '#4A7FA8'], fr: ['#7DFFD0', '#18B890'], p: ['star', '#FFFFFF'], deco: 'aurora', dc: ['#58E0C0', '#6B8CF0'] },
  { n: 'Cueva luminosa', sky: ['#2B2433', '#4F3F5C'], wall: ['#7A6A8A', '#3E3446', '#2A2230'], fr: ['#7DF0C8', '#1FB38A'], p: ['firefly', '#CFFFE8'], deco: 'crystals', dc: ['#8F7BE0', '#6F5BC8'] },
  { n: 'Volcán', sky: ['#3A1410', '#D2501A'], wall: ['#4A3432', '#241A18', '#150F0E'], fr: ['#FFB43A', '#E0521A'], p: ['ember', '#FFB060'], deco: 'peaks', dc: ['#5A2A20', '#3E1C16'] },
  { n: 'Noche estrellada', sky: ['#0B1330', '#2D3E80'], wall: ['#3A4D80', '#1E2A50', '#141C3A'], fr: ['#FFE066', '#E0A81F'], p: ['firefly', '#FFF3B0'], deco: 'moon', dc: ['#1B2650', '#141C3E'] },
  { n: 'Selva', sky: ['#6FCF97', '#D2F0BE'], wall: ['#2F9A52', '#5A3A22', '#3E2616'], fr: ['#FFD83A', '#E0A81F'], p: ['leaf', '#3FAF5E'], deco: 'trees', dc: ['#4FB878', '#379E62'] },
  { n: 'Montañas', sky: ['#9CC4E8', '#EEF3F8'], wall: ['#98A4B4', '#5E6A7A', '#434E5C'], fr: ['#E0443A', '#A82A22'], p: ['cloud', '#FFFFFF'], deco: 'peaks', dc: ['#B7C8DC', '#9FB4CC'] },
  { n: 'Bajo el mar', sky: ['#1E6FA8', '#82DCE8'], wall: ['#E8A484', '#A0604A', '#7A4636'], fr: ['#FFB3D9', '#E070A8'], p: ['bubble', '#FFFFFF'], deco: 'waves', dc: ['#3A8FC0', '#2A78AA'] },
  { n: 'Dulcelandia', sky: ['#FFD1E8', '#FFF3CF'], wall: ['#FF8CC0', '#C85A8F', '#A04070'], fr: ['#FF4F7A', '#C21F4A'], p: ['sparkle', '#FFFFFF'], deco: 'hills', dc: ['#FFB6DA', '#FFA0CE'] },
  { n: 'Ciudad al atardecer', sky: ['#F7A26B', '#7A5AA8'], wall: ['#4A405A', '#2A2336', '#1A1424'], fr: ['#FF6B6B', '#C23A3A'], p: ['sparkle', '#FFE0A8'], deco: 'skyline', dc: ['#5A4A78', '#43365E'] },
  { n: 'Espacio', sky: ['#0A0B1A', '#241E58'], wall: ['#6A6F8C', '#33364F', '#222436'], fr: ['#FFE066', '#E0A81F'], p: ['star', '#FFFFFF'], deco: 'planets', dc: ['#3A3A78', '#2A2A60'] },
  { n: 'Cristales', sky: ['#D9C6FF', '#FFFFFF'], wall: ['#B9A0F0', '#7A5ECC', '#5A40A8'], fr: ['#FF8AC0', '#D0447F'], p: ['sparkle', '#FFFFFF'], deco: 'crystals', dc: ['#C8B0F8', '#B096EE'] },
  { n: 'Templo antiguo', sky: ['#E8D6A6', '#F7EED6'], wall: ['#C2A26E', '#8A6A3E', '#664C2A'], fr: ['#F2C84A', '#C9921F'], p: ['dust', '#E0C890'], deco: 'dunes', dc: ['#DFC48E', '#CDAE76'] },
  { n: 'Pantano brumoso', sky: ['#A8C8A0', '#E0EAD6'], wall: ['#5E7E4C', '#3C3E2A', '#2A2C1C'], fr: ['#A8D840', '#6F9E1E'], p: ['cloud', '#F2F8EC'], deco: 'trees', dc: ['#8FB088', '#789C72'] },
  { n: 'Paraíso arcoíris', sky: ['#FFB3D9', '#B3E0FF'], wall: ['#8AE0A8', '#4FA878', '#388860'], fr: ['#FF7AB6', '#C2449A'], p: ['sparkle', '#FFFFFF'], deco: 'rainbow', dc: ['#FFE0A8', '#C0F0D0'] },
];
const GW_SKINS = [
  ['liso', 'Gusano de color', 0, 'Elige el color que quieras, gratis.', { free: 1, pat: '' }],
  ['rayas', 'Rayado', 40, 'Franjas claras en el lomo.', { a: '#76C45A', b: '#3E8A34', pat: 'stripes', pc: '#CFF0A8' }],
  ['lunares', 'Lunares', 90, 'Lunares blancos sobre rosa.', { a: '#F28BB0', b: '#C24A7C', pat: 'dots', pc: '#FFF0F6' }],
  ['zigzag', 'Zigzag', 160, 'Azul con dibujos en zigzag.', { a: '#58A8E8', b: '#2A68B0', pat: 'zig', pc: '#E4F3FF' }],
  ['gorro', 'Gorro de lana', 280, 'Abrigado, con pompón.', { a: '#F0B860', b: '#C07A22', pat: 'stripes', pc: '#FFE2A8', hat: 'beanie', hc: '#D4443A' }],
  ['lentes', 'Sabio con lentes', 450, 'Lentes redondos de estudiar.', { a: '#8E7BE0', b: '#5240B0', pat: 'dots', pc: '#D8D0FF', hat: 'glasses' }],
  ['antenas', 'Antenas', 700, 'Dos antenitas curiosas.', { a: '#4FC8B0', b: '#1F8A78', pat: 'stripes', pc: '#B8F2E4', hat: 'antenna', hc: '#FF7AB6' }],
  ['jardinero', 'Jardinero', 1000, 'Con una flor en la cabeza.', { a: '#9BD25A', b: '#5A9A22', pat: 'dots', pc: '#EAF8C4', hat: 'flower', hc: '#FF7AB6' }],
  ['paja', 'Sombrero de paja', 1500, 'Listo para el campo.', { a: '#E8A25A', b: '#B0682A', pat: 'zig', pc: '#FFE0B0', hat: 'straw', hc: '#E8C878' }],
  ['pirata', 'Pirata', 2300, 'Parche y pañuelo rojo.', { a: '#E85A5A', b: '#A02A2A', pat: 'stripes', pc: '#FFC8C8', hat: 'pirate', hc: '#222' }],
  ['rey', 'Rey gusano', 3400, 'Una corona con brillo.', { a: '#B58CE8', b: '#6A3FB0', pat: 'zig', pc: '#E8D8FF', hat: 'crown', glow: '#C8A8FF' }],
  ['oro', 'Oro vivo', 5000, 'Metal dorado que reluce.', { a: '#FFE585', b: '#C98E1A', pat: 'dots', pc: '#FFF6CF', glow: '#FFD75A', sheen: 1 }],
  ['escarcha', 'Escarcha', 7500, 'Cubierto de hielo y brillos.', { a: '#C8ECFF', b: '#6FB4E0', pat: 'zig', pc: '#FFFFFF', glow: '#BEE6FF', spark: '#FFFFFF', hat: 'halo' }],
  ['brasa', 'Brasa', 11000, 'Con calor y chispas.', { a: '#FFB43A', b: '#D2300A', pat: 'stripes', pc: '#FFE08A', glow: '#FF7A1F', spark: '#FFE08A', hat: 'flame' }],
  ['galaxia', 'Galaxia', 16000, 'Estrellas sobre el cosmos.', { a: '#6B4BE8', b: '#1C0F66', pat: 'stars', pc: '#FFFFFF', glow: '#8A6BFF', spark: '#FFFFFF', hat: 'halo' }],
  ['arcoiris', 'Gusano arcoíris', 22000, 'Colores que cambian, con aura.', { a: '#FF9AC0', b: '#7AB8FF', pat: 'dots', pc: '#FFFFFF', rainbow: 1, glow: '#FFFFFF', spark: '#FFFFFF', hat: 'crown' }],
];
const GW_COLORS = ['#76C45A', '#4FA8E8', '#F28BB0', '#F0B860', '#8E7BE0', '#4FC8B0', '#E85A5A', '#F2D24A', '#A0A8B8', '#2E3A4A', '#FF8A3A', '#9BD25A'];
const gwData = () => jpData('gusano');
const gwMax = () => Math.min(GW_N(), Math.max(1, gwData().max || 1));
const gwStarsAt = (l) => +((gwData().s || '')[l - 1] || 0);
const gwSetStars = (l, v) => { const D = gwData(); let s = (D.s || '').padEnd(l, '0'); s = s.slice(0, l - 1) + v + s.slice(l); D.s = s; };
const gwEnvOf = (l) => Math.min(GW_ENVS.length - 1, Math.floor((l - 1) / 50));
const gwSkinCur = () => { const P = skFind('g', skEq('g'))[4]; if (P.free) { const c = gwData().col || GW_COLORS[0]; return { ...P, a: c, b: gwShade(c, -0.32), pc: gwShade(c, 0.5) }; } return P; };
function gwShade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const t = f < 0 ? 0 : 255, p = Math.abs(f); r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b); return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`; }
const GWUI = { env: -1 };
const GW = { run: null };

/* ---------- dibujo del gusano (también para la tienda) ---------- */
function gwDrawWorm(g, pts, cs, P, o) {
  o = o || {}; const now = performance.now(); const mood = o.mood || 'idle'; const look = o.look || o.dir || { x: 1, y: 0 };
  let a = P.a, b = P.b; if (P.rainbow) { const h = (now / 18) % 360; a = `hsl(${h},85%,70%)`; b = `hsl(${(h + 70) % 360},75%,50%)`; }
  const n = pts.length; const dirAt = (i) => { const p = pts[Math.min(i + 1, n - 1)], q = pts[Math.max(i - 1, 0)]; let dx = q[0] - p[0], dy = q[1] - p[1]; const l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  /* sombra en el suelo */
  g.fillStyle = 'rgba(0,0,0,.14)'; for (let i = 0; i < n; i++) { g.beginPath(); g.ellipse(pts[i][0] + cs * 0.06, pts[i][1] + cs * 0.4, cs * 0.34, cs * 0.1, 0, 0, 7); g.fill(); }
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (n === 1) g.lineTo(pts[0][0] + 0.01, pts[0][1]); };
  if (P.glow) { g.shadowColor = P.glow; g.shadowBlur = cs * 0.5; }
  g.strokeStyle = b; g.lineWidth = cs * 0.9; path(); g.stroke(); g.shadowBlur = 0;
  g.strokeStyle = a; g.lineWidth = cs * 0.76; path(); g.stroke();
  /* panza más clara y brillo del lomo */
  g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = cs * 0.3; g.save(); g.translate(0, cs * 0.17); path(); g.stroke(); g.restore();
  g.strokeStyle = 'rgba(255,255,255,.34)'; g.lineWidth = cs * 0.16; g.save(); g.translate(-cs * 0.04, -cs * 0.22); path(); g.stroke(); g.restore();
  /* anillos de cada segmento */
  for (let i = 1; i < n; i++) { const [x, y] = pts[i]; const [dx, dy] = dirAt(i); const sq = 1 + Math.sin(now / 420 + i * 0.9) * 0.015; g.strokeStyle = 'rgba(0,0,0,.13)'; g.lineWidth = cs * 0.05; g.beginPath(); g.arc(x - dx * cs * 0.5 + dy * 0, y - dy * cs * 0.5, cs * 0.0, 0, 0); g.moveTo(x + dx * cs * 0.5 - dy * cs * 0.34 * sq, y + dy * cs * 0.5 + dx * cs * 0.34 * sq); g.lineTo(x + dx * cs * 0.5 + dy * cs * 0.34 * sq, y + dy * cs * 0.5 - dx * cs * 0.34 * sq); g.stroke(); }
  if (P.pat) for (let i = 1; i < n; i++) {
    const [x, y] = pts[i]; const [dx, dy] = dirAt(i); g.fillStyle = P.pc; g.strokeStyle = P.pc;
    if (P.pat === 'stripes') { if (i % 2) { g.lineWidth = cs * 0.13; g.beginPath(); g.moveTo(x - dy * cs * 0.34, y + dx * cs * 0.34); g.lineTo(x + dy * cs * 0.34, y - dx * cs * 0.34); g.stroke(); } }
    else if (P.pat === 'dots') { g.globalAlpha = 0.9; g.beginPath(); g.arc(x + dy * cs * 0.12 * (i % 2 ? 1 : -1), y - dx * cs * 0.12 * (i % 2 ? 1 : -1), cs * 0.09, 0, 7); g.fill(); g.globalAlpha = 1; }
    else if (P.pat === 'zig') { g.lineWidth = cs * 0.1; g.beginPath(); const s = i % 2 ? 1 : -1; g.moveTo(x - dy * cs * 0.28 * s - dx * cs * 0.12, y + dx * cs * 0.28 * s - dy * cs * 0.12); g.lineTo(x, y); g.lineTo(x + dy * cs * 0.28 * s + dx * cs * 0.12, y - dx * cs * 0.28 * s + dy * cs * 0.12); g.stroke(); }
    else if (P.pat === 'stars') { g.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(now / 400 + i)); g.beginPath(); g.arc(x + (i % 3 - 1) * cs * 0.12, y + ((i + 1) % 3 - 1) * cs * 0.12, cs * 0.06, 0, 7); g.fill(); g.globalAlpha = 1; }
  }
  /* cabeza: un poco más grande y con volumen */
  const [hx0, hy0] = pts[0]; const pulse = o.pulse || 0; const R = cs * (0.52 + pulse * 0.07); const hx = hx0, hy = hy0;
  g.fillStyle = b; g.beginPath(); g.arc(hx, hy, R + cs * 0.04, 0, 7); g.fill();
  const hg = g.createRadialGradient(hx - R * 0.35, hy - R * 0.45, R * 0.1, hx, hy, R * 1.05); hg.addColorStop(0, gwShade(a.startsWith('#') ? a : '#bde08a', 0.28)); hg.addColorStop(0.55, a); hg.addColorStop(1, b);
  g.fillStyle = hg; g.beginPath(); g.arc(hx, hy, R, 0, 7); g.fill();
  /* cara */
  const lx = Math.max(-1, Math.min(1, look.x)), ly = Math.max(-1, Math.min(1, look.y)); const blink = (now % 3400) < 130 && mood === 'idle';
  const ex = R * 0.42, ey = -R * 0.1, er = R * 0.36;
  const eye = (sx) => {
    const x = hx + sx * ex + lx * R * 0.06, y = hy + ey + ly * R * 0.05;
    if (mood === 'win') { g.strokeStyle = '#26202A'; g.lineWidth = R * 0.12; g.beginPath(); g.arc(x, y + er * 0.25, er * 0.62, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); return; }
    if (mood === 'dead') { g.strokeStyle = '#26202A'; g.lineWidth = R * 0.11; const k = er * 0.5; g.beginPath(); g.moveTo(x - k, y - k); g.lineTo(x + k, y + k); g.moveTo(x + k, y - k); g.lineTo(x - k, y + k); g.stroke(); return; }
    const big = mood === 'fall' || mood === 'hungry' ? 1.18 : 1;
    g.fillStyle = '#fff'; g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = R * 0.04; g.beginPath(); g.ellipse(x, y, er * big, blink ? er * 0.16 : er * 1.12 * big, 0, 0, 7); g.fill(); g.stroke();
    if (!blink) {
      const pr = er * (mood === 'fall' ? 0.36 : 0.52); const px = x + lx * er * 0.42 * (mood === 'fall' ? 0 : 1), py = y + ly * er * 0.42 * (mood === 'fall' ? 0 : 1) + (mood === 'fall' ? -er * 0.1 : 0);
      g.fillStyle = '#231C26'; g.beginPath(); g.arc(px, py, pr, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(px - pr * 0.32, py - pr * 0.34, pr * 0.34, 0, 7); g.fill(); g.beginPath(); g.arc(px + pr * 0.34, py + pr * 0.3, pr * 0.16, 0, 7); g.fill();
    }
    /* cejas */
    g.strokeStyle = 'rgba(30,20,32,.7)'; g.lineWidth = R * 0.075; g.beginPath(); const by = y - er * 1.35 * big;
    if (mood === 'fall') { g.moveTo(x - sx * er * 0.9, by + er * 0.55); g.lineTo(x + sx * er * 0.5 * 0 + sx * (-er * 0.2) * 0, by - er * 0.1); g.lineTo(x + sx * er * 0.2, by + er * 0.2); }
    else if (mood === 'hungry' || mood === 'eat') { g.arc(x, by + er * 0.7, er * 0.9, Math.PI * 1.15, Math.PI * 1.85); }
    else { g.moveTo(x - er * 0.7, by + er * 0.3); g.quadraticCurveTo(x, by - er * 0.15, x + er * 0.7, by + er * 0.3); }
    g.stroke();
  };
  eye(-1); eye(1);
  /* mejillas */
  g.fillStyle = 'rgba(255,120,150,.32)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(hx + s * R * 0.7, hy + R * 0.28, R * 0.17, R * 0.1, 0, 0, 7); g.fill(); }
  /* boca */
  const my = hy + R * 0.42 + ly * R * 0.04, mx = hx + lx * R * 0.1; g.lineCap = 'round';
  if (mood === 'eat') { const ch = Math.abs(Math.sin(now / 90)); g.fillStyle = '#5A1F2C'; g.beginPath(); g.ellipse(mx, my, R * 0.26, R * (0.08 + ch * 0.18), 0, 0, 7); g.fill(); }
  else if (mood === 'hungry') { g.fillStyle = '#5A1F2C'; g.beginPath(); g.ellipse(mx, my, R * 0.2, R * 0.24, 0, 0, 7); g.fill(); g.fillStyle = '#F2748A'; g.beginPath(); g.ellipse(mx, my + R * 0.1, R * 0.12, R * 0.08, 0, 0, 7); g.fill(); }
  else if (mood === 'fall') { g.fillStyle = '#5A1F2C'; g.beginPath(); g.ellipse(mx, my + R * 0.04, R * 0.2, R * 0.3, 0, 0, 7); g.fill(); }
  else if (mood === 'dead') { g.strokeStyle = '#26202A'; g.lineWidth = R * 0.09; g.beginPath(); g.moveTo(mx - R * 0.24, my + R * 0.12); g.quadraticCurveTo(mx, my - R * 0.08, mx + R * 0.24, my + R * 0.12); g.stroke(); g.fillStyle = '#F2748A'; g.beginPath(); g.ellipse(mx + R * 0.14, my + R * 0.2, R * 0.08, R * 0.14, 0, 0, 7); g.fill(); }
  else if (mood === 'win') { g.fillStyle = '#5A1F2C'; g.beginPath(); g.moveTo(mx - R * 0.34, my - R * 0.06); g.quadraticCurveTo(mx, my + R * 0.52, mx + R * 0.34, my - R * 0.06); g.closePath(); g.fill(); g.fillStyle = '#F2748A'; g.beginPath(); g.ellipse(mx, my + R * 0.15, R * 0.14, R * 0.08, 0, 0, 7); g.fill(); }
  else { g.strokeStyle = '#3A2430'; g.lineWidth = R * 0.085; g.beginPath(); g.moveTo(mx - R * 0.22, my - R * 0.02); g.quadraticCurveTo(mx, my + R * 0.2, mx + R * 0.22, my - R * 0.02); g.stroke(); }
  /* accesorios (arriba de la cabeza) */
  const hat = P.hat, hc = P.hc || '#E85A5A', top = hy - R * 0.82, eyes = [[hx - ex, hy + ey], [hx + ex, hy + ey]];
  if (hat === 'beanie') { g.fillStyle = hc; g.beginPath(); g.arc(hx, hy - R * 0.2, R * 0.92, Math.PI * 1.05, Math.PI * 1.95); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(hx - R * 0.9, hy - R * 0.3, R * 1.8, R * 0.2); g.beginPath(); g.arc(hx, top - R * 0.22, R * 0.2, 0, 7); g.fill(); }
  else if (hat === 'glasses') { g.strokeStyle = '#2A2A36'; g.lineWidth = R * 0.08; for (const [x, y] of eyes) { g.beginPath(); g.arc(x, y, er * 1.35, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(eyes[0][0] + er * 1.35, eyes[0][1]); g.lineTo(eyes[1][0] - er * 1.35, eyes[1][1]); g.stroke(); }
  else if (hat === 'antenna') { g.strokeStyle = b; g.lineWidth = R * 0.1; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(hx + s * R * 0.3, top + R * 0.12); g.quadraticCurveTo(hx + s * R * 0.6, top - R * 0.6, hx + s * R * 0.68, top - R * 0.72); g.stroke(); g.fillStyle = hc; g.beginPath(); g.arc(hx + s * R * 0.68, top - R * 0.76, R * 0.15, 0, 7); g.fill(); } }
  else if (hat === 'flower') { const fx = hx + R * 0.5, fy = top + R * 0.1; g.fillStyle = hc; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(fx + Math.cos(k * 1.256) * R * 0.18, fy + Math.sin(k * 1.256) * R * 0.18, R * 0.14, 0, 7); g.fill(); } g.fillStyle = '#FFE066'; g.beginPath(); g.arc(fx, fy, R * 0.1, 0, 7); g.fill(); }
  else if (hat === 'straw') { g.fillStyle = hc; g.beginPath(); g.ellipse(hx, top + R * 0.2, R * 1.2, R * 0.24, 0, 0, 7); g.fill(); g.fillStyle = '#D9B05A'; g.beginPath(); g.arc(hx, top + R * 0.2, R * 0.64, Math.PI, 0); g.fill(); g.fillStyle = '#D4443A'; g.fillRect(hx - R * 0.64, top + R * 0.04, R * 1.28, R * 0.12); }
  else if (hat === 'pirate') { g.fillStyle = '#D4302A'; g.beginPath(); g.arc(hx, hy - R * 0.2, R * 0.92, Math.PI * 1.02, Math.PI * 1.98); g.closePath(); g.fill(); g.fillStyle = '#fff'; for (let k = -1; k <= 1; k++) { g.beginPath(); g.arc(hx + k * R * 0.42, hy - R * 0.62, R * 0.06, 0, 7); g.fill(); } g.fillStyle = '#16161C'; g.beginPath(); g.arc(eyes[1][0], eyes[1][1], er * 1.25, 0, 7); g.fill(); }
  else if (hat === 'crown') { const cx = hx, cy = top + R * 0.1; g.fillStyle = '#FFD84A'; g.strokeStyle = '#C9921F'; g.lineWidth = R * 0.07; g.beginPath(); g.moveTo(cx - R * 0.6, cy); g.lineTo(cx - R * 0.6, cy - R * 0.5); g.lineTo(cx - R * 0.3, cy - R * 0.2); g.lineTo(cx, cy - R * 0.62); g.lineTo(cx + R * 0.3, cy - R * 0.2); g.lineTo(cx + R * 0.6, cy - R * 0.5); g.lineTo(cx + R * 0.6, cy); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#E8445A'; g.beginPath(); g.arc(cx, cy - R * 0.12, R * 0.09, 0, 7); g.fill(); }
  else if (hat === 'halo') { g.strokeStyle = '#FFE98A'; g.lineWidth = R * 0.12; g.shadowColor = '#FFE98A'; g.shadowBlur = cs * 0.3; g.beginPath(); g.ellipse(hx, top - R * 0.1, R * 0.58, R * 0.18, 0, 0, 7); g.stroke(); g.shadowBlur = 0; }
  else if (hat === 'flame') { for (let k = -1; k <= 1; k++) { const f = Math.sin(now / 120 + k * 1.7) * R * 0.08; g.fillStyle = k ? '#FF9A2A' : '#FFD84A'; g.beginPath(); g.moveTo(hx + k * R * 0.36 - R * 0.18, top + R * 0.16); g.quadraticCurveTo(hx + k * R * 0.36 - R * 0.08, top - R * 0.3 + f, hx + k * R * 0.36, top - R * 0.6 + f - (k ? 0 : R * 0.2)); g.quadraticCurveTo(hx + k * R * 0.36 + R * 0.12, top - R * 0.2, hx + k * R * 0.36 + R * 0.18, top + R * 0.16); g.closePath(); g.fill(); } }
  if (P.spark) { g.fillStyle = P.spark; for (let k = 0; k < 5; k++) { const t = (now / 1300 + k * 0.21) % 1, p = pts[Math.min(k, n - 1)]; g.globalAlpha = Math.sin(t * Math.PI); g.beginPath(); g.arc(p[0] + Math.sin(k * 3.1) * cs * 0.4, p[1] - t * cs * 0.9, cs * 0.045, 0, 7); g.fill(); } g.globalAlpha = 1; }
  g.restore();
}
SK_TYPES.g = { titulo: 'Gusanos', nombre: 'Gusano', lista: GW_SKINS, ver(g, W, H, P) {
  const Q = P.free ? { ...P, a: gwData().col || GW_COLORS[0], b: gwShade(gwData().col || GW_COLORS[0], -0.32), pc: gwShade(gwData().col || GW_COLORS[0], 0.5) } : P; const cs = 38;
  g.fillStyle = 'rgba(110,150,90,.5)'; g.fillRect(0, H - 26, W, 26);
  const pts = [[W / 2 + 57, H - 50], [W / 2 + 19, H - 50], [W / 2 - 19, H - 50], [W / 2 - 57, H - 50]]; gwDrawWorm(g, pts, cs, Q, { dir: { x: 1, y: 0 } });
} };

/* ---------- niveles, menú ---------- */
function gwHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="gwhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD3F4"/><stop offset="1" stop-color="#E4F5CF"/></linearGradient></defs><rect width="360" height="170" rx="20" fill="url(#gwhS)"/>
    <path d="M0 128c50-18 90-6 130-14s90-22 140-8 70 6 90 0v64H0z" fill="#7CC058"/><rect y="140" width="360" height="30" fill="#9A6A3E"/>
    <path d="M84 126h92c18 0 18-26 0-26h-34c-14 0-14-20 0-20h16" fill="none" stroke="#3E8A34" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/><path d="M84 126h92c18 0 18-26 0-26h-34c-14 0-14-20 0-20h16" fill="none" stroke="#76C45A" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="160" cy="80" r="17" fill="#76C45A" stroke="#3E8A34" stroke-width="3"/><circle cx="165" cy="76" r="5" fill="#fff"/><circle cx="166" cy="76" r="2.4" fill="#1B1B24"/><circle cx="154" cy="76" r="5" fill="#fff"/><circle cx="155" cy="76" r="2.4" fill="#1B1B24"/>
    <g transform="translate(252 66)"><circle cx="0" cy="12" r="17" fill="#E0443A"/><path d="M0 -4c0-8 3-12 10-14" stroke="#5A3A22" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M4 -8c8-8 18-4 18-4-2 9-10 12-18 4z" fill="#4C9A48"/></g></svg>`;
}
function gwTotalStars() { const s = gwData().s || ''; let t = 0; for (const ch of s) t += +ch; return t; }
function gwEnvGrid(ei) {
  const a = ei * 50 + 1, b = Math.min(GW_N(), a + 49), mx = gwMax(); let h = '';
  for (let l = a; l <= b; l++) { const lock = l > mx, s = gwStarsAt(l); h += `<button type="button" class="gw-lv${lock ? ' lock' : ''}${l === mx ? ' cur' : ''}" ${lock ? 'disabled' : ''} data-act="gw-play" data-l="${l}" aria-label="Nivel ${l}${s ? `, ${s} estrellas` : lock ? ', bloqueado' : ''}"><b>${l}</b><i>${s ? '★'.repeat(s) : lock ? '' : ''}</i></button>`; }
  return `<div class="gw-lvs">${h}</div>`;
}
function viewGusano() {
  const D = gwData(), mx = gwMax(), N = GW_N(); const openEnv = GWUI.env >= 0 ? GWUI.env : gwEnvOf(mx);
  if (!N) return '<div class="empty"><h3>Cargando niveles…</h3></div>';
  const envs = GW_ENVS.slice(0, Math.ceil(N / 50)).map((e, i) => { const a = i * 50 + 1, b = Math.min(N, a + 49); let done = 0; for (let l = a; l <= b; l++) if (gwStarsAt(l)) done++; const lock = a > mx;
    return `<details class="gw-env${lock ? ' lock' : ''}" ${i === openEnv ? 'open' : ''} data-env="${i}"><summary style="--c1:${e.sky[0]};--c2:${e.sky[1]}"><i class="gw-sw"></i><span><b>${e.n}</b><small>Niveles ${a}–${b} · ${done}/${b - a + 1}</small></span></summary>${i === openEnv ? gwEnvGrid(i) : ''}</details>`; }).join('');
  const colors = GW_COLORS.map((c) => `<button type="button" class="gw-col${(D.col || GW_COLORS[0]) === c ? ' on' : ''}" style="background:${c}" data-act="gw-col" data-c="${c}" aria-label="Color ${c}"></button>`).join('');
  return `<section class="mt-home"><div class="gm-hero">${gwHero()}</div><h1 class="page-title gm-title">Gusano Goloso</h1>
    <p class="page-sub">Desliza para mover al gusano. Si come una manzana, crece. Hay gravedad: si no tiene dónde apoyarse, cae. Llega a la salida en cada uno de los <b>${N} niveles</b>; cada 50 niveles cambia el ambiente.</p>
    <div class="jg-prog" role="img" aria-label="Avance: nivel ${mx} de ${N}"><i style="width:${Math.min(100, ((mx - 1) / N) * 100)}%"></i></div>
    <p class="small muted" style="text-align:center;margin:8px 0 14px">Vas en el nivel <b>${mx}</b> de ${N} · estrellas: <b>${gwTotalStars()}</b></p>
    <button class="btn primary block gm-play" data-act="gw-play" data-l="${mx}">${icon('play')}${mx > 1 ? `Continuar · nivel ${mx}` : 'Empezar'}</button>
    <h2 class="sec">Tu gusano</h2><div class="gw-cols" role="group" aria-label="Color del gusano">${colors}</div>
    <a class="btn block" href="#/skins" style="margin-top:10px" data-skin="g">${icon('star', 'sm')}Skins de gusano</a>
    <h2 class="sec">Niveles</h2><div class="gw-envs">${envs}</div>
    <p class="small muted" style="text-align:center;margin-top:10px">Ganas monedas la primera vez que superas un nivel; con más estrellas, más monedas.</p>
    <div id="jgRank-gusano">${jgRankHTML('gusano')}</div><p id="jgLive" class="sr-only" aria-live="polite"></p></section>`;
}

/* ---------- el juego ---------- */
function gwBgDeco(g, E, W, H, t, seed) {
  const [d1, d2] = E.dc; g.save();
  const hill = (c, y0, amp, f, ph) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 8) g.lineTo(x, y0 + Math.sin(x / f + ph) * amp); g.lineTo(W, H); g.closePath(); g.fill(); };
  switch (E.deco) {
    case 'hills': hill(d1, H * 0.62, H * 0.06, 70, seed); hill(d2, H * 0.72, H * 0.05, 52, seed + 2); break;
    case 'trees': hill(d1, H * 0.66, H * 0.03, 90, seed); for (let i = 0; i < 9; i++) { const x = (i / 8) * W + Math.sin(seed + i) * 14, h = H * (0.2 + 0.08 * ((i * 7) % 3)); g.fillStyle = d2; g.beginPath(); g.moveTo(x - h * 0.28, H * 0.74); g.lineTo(x, H * 0.74 - h); g.lineTo(x + h * 0.28, H * 0.74); g.closePath(); g.fill(); } break;
    case 'dunes': hill(d1, H * 0.6, H * 0.07, 110, seed); hill(d2, H * 0.72, H * 0.06, 80, seed + 1); break;
    case 'peaks': for (let k = 0; k < 2; k++) { g.fillStyle = k ? d2 : d1; g.beginPath(); g.moveTo(0, H); for (let i = 0; i <= 6; i++) { const x = (i / 6) * W, y = H * (k ? 0.5 : 0.38) + ((i * 53 + seed * 17 + k * 31) % 40) - 20 - (i % 2 ? 0 : H * 0.12); g.lineTo(x, y); } g.lineTo(W, H); g.closePath(); g.fill(); } break;
    case 'skyline': for (let i = 0; i < 14; i++) { const w = W / 14, h = H * (0.18 + ((i * 37 + seed * 11) % 40) / 100); g.fillStyle = i % 2 ? d1 : d2; g.fillRect(i * w, H * 0.78 - h, w + 1, h + H); if (i % 3 === 0) { g.fillStyle = 'rgba(255,230,160,.8)'; for (let y = 0; y < 3; y++) g.fillRect(i * w + 5, H * 0.78 - h + 8 + y * 12, 4, 5); } } break;
    case 'waves': for (let k = 0; k < 3; k++) { g.fillStyle = k % 2 ? d2 : d1; g.globalAlpha = 0.6; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 8) g.lineTo(x, H * (0.6 + k * 0.09) + Math.sin(x / 38 + t * 0.9 + k * 2) * 6); g.lineTo(W, H); g.closePath(); g.fill(); } g.globalAlpha = 1; break;
    case 'crystals': for (let i = 0; i < 8; i++) { const x = (i / 7) * W, h = H * (0.14 + ((i * 29) % 30) / 120); g.fillStyle = i % 2 ? d1 : d2; g.globalAlpha = 0.7; g.beginPath(); g.moveTo(x - 14, H * 0.8); g.lineTo(x, H * 0.8 - h); g.lineTo(x + 14, H * 0.8); g.closePath(); g.fill(); } g.globalAlpha = 1; break;
    case 'aurora': for (let k = 0; k < 3; k++) { const lg = g.createLinearGradient(0, 0, 0, H * 0.7); lg.addColorStop(0, 'rgba(88,224,192,0)'); lg.addColorStop(0.5, k % 2 ? 'rgba(107,140,240,.35)' : 'rgba(88,224,192,.35)'); lg.addColorStop(1, 'rgba(88,224,192,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(0, 0); for (let x = 0; x <= W; x += 10) g.lineTo(x, H * 0.18 + k * 24 + Math.sin(x / 70 + t * 0.5 + k) * 20); g.lineTo(W, H * 0.7); g.lineTo(0, H * 0.7); g.closePath(); g.fill(); } hill(d1, H * 0.78, H * 0.03, 80, seed); break;
    case 'moon': g.fillStyle = '#FFF6D0'; g.beginPath(); g.arc(W * 0.78, H * 0.2, Math.min(W, H) * 0.07, 0, 7); g.fill(); g.fillStyle = 'rgba(255,246,208,.18)'; g.beginPath(); g.arc(W * 0.78, H * 0.2, Math.min(W, H) * 0.12, 0, 7); g.fill(); hill(d1, H * 0.7, H * 0.04, 80, seed); break;
    case 'planets': g.fillStyle = '#7A6AE0'; g.beginPath(); g.arc(W * 0.8, H * 0.24, Math.min(W, H) * 0.09, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 3; g.beginPath(); g.ellipse(W * 0.8, H * 0.24, Math.min(W, H) * 0.15, Math.min(W, H) * 0.04, -0.3, 0, 7); g.stroke(); g.fillStyle = '#E87A6A'; g.beginPath(); g.arc(W * 0.18, H * 0.5, Math.min(W, H) * 0.04, 0, 7); g.fill(); break;
    case 'rainbow': for (let k = 0; k < 7; k++) { g.strokeStyle = `hsla(${k * 51},85%,68%,.55)`; g.lineWidth = 9; g.beginPath(); g.arc(W * 0.5, H * 0.95, W * 0.45 - k * 9, Math.PI, 0); g.stroke(); } hill(d1, H * 0.78, H * 0.03, 70, seed); break;
    default: break;
  }
  g.restore();
}
function gwFruit(g, E, x, y, cs, t, gold) {
  const [c1, c2] = gold ? ['#FFE066', '#E0A81F'] : E.fr; const r = cs * 0.36; const bob = Math.sin(t * 2 + x * 0.05) * cs * 0.02;
  g.save(); g.translate(x, y + bob); g.fillStyle = 'rgba(0,0,0,.12)'; g.beginPath(); g.ellipse(0, r * 0.95, r * 0.8, r * 0.18, 0, 0, 7); g.fill();
  const lg = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r * 1.2); lg.addColorStop(0, c1); lg.addColorStop(1, c2); g.fillStyle = lg;
  g.beginPath(); g.moveTo(0, -r * 0.8); g.bezierCurveTo(r * 1.2, -r * 1.2, r * 1.3, r * 0.9, 0, r); g.bezierCurveTo(-r * 1.3, r * 0.9, -r * 1.2, -r * 1.2, 0, -r * 0.8); g.fill();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-r * 0.45, -r * 0.25, r * 0.16, r * 0.3, 0.5, 0, 7); g.fill();
  g.strokeStyle = '#5A3A22'; g.lineWidth = cs * 0.045; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -r * 0.8); g.lineTo(r * 0.1, -r * 1.25); g.stroke(); g.fillStyle = '#4C9A48'; g.beginPath(); g.moveTo(r * 0.1, -r * 1.1); g.quadraticCurveTo(r * 0.7, -r * 1.6, r * 0.95, -r * 1.05); g.quadraticCurveTo(r * 0.5, -r * 0.85, r * 0.1, -r * 1.1); g.fill();
  if (gold) { g.fillStyle = '#fff'; g.globalAlpha = 0.5 + 0.5 * Math.sin(t * 5); g.beginPath(); g.arc(r * 0.5, -r * 0.4, cs * 0.04, 0, 7); g.fill(); }
  g.restore();
}
function gwPlay(level) {
  if (GW.run || !GW_N()) return; level = Math.max(1, Math.min(GW_N(), level)); const sk = gwSkinCur();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage gw-stage';
  wrap.innerHTML = `<button class="gm-x gl-x" id="gwX" aria-label="Salir del juego">${icon('x')}</button>
    <div class="gw-top"><div class="gw-title"><b id="gwLv">Nivel 1</b><small id="gwEnv"></small></div><div class="gw-pill"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7c-5-3-9 1-8 7 1 5 5 8 8 6 3 2 7-1 8-6 1-6-3-10-8-7z" fill="#E0443A"/><path d="M12 7c0-3 1-4 3-5" stroke="#5A3A22" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M13 5c2-2 5-1 5-1-1 3-3 4-5 2z" fill="#4C9A48"/></svg><b id="gwAp">0/0</b></div><div class="gw-pill"><small>pasos</small><b id="gwMv">0</b><em id="gwOpt"></em></div></div>
    <div class="gw-board" id="gwBoard"><canvas id="gwCv" aria-label="Tablero del Gusano Goloso" role="img"></canvas><div class="gw-toast" id="gwToast"></div></div>
    <div class="gw-ctl"><div class="gw-act"><button type="button" class="btn" id="gwUndo">${icon('reset', 'sm')}Deshacer</button><button type="button" class="btn" id="gwRetry">Reiniciar</button></div>
      <div class="gw-pad" id="gwPad"><button type="button" data-d="0" aria-label="Arriba">▲</button><button type="button" data-d="3" aria-label="Izquierda">◀</button><button type="button" data-d="2" aria-label="Abajo">▼</button><button type="button" data-d="1" aria-label="Derecha">▶</button></div></div>
    <div class="gl-over mt-over gw-win" id="gwOver" hidden><b id="gwWhy">¡Nivel superado!</b><div id="gwStars"></div><div class="mt-res" id="gwRes"></div><span id="gwCoins" class="pm-gain"></span><span class="small muted" id="gwRank"></span><span class="small muted" id="gwRest"></span>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="gwNext">Siguiente nivel</button><button class="btn" id="gwAgain">Repetir</button><button class="btn" id="gwDone">Menú</button></div></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const $ = (s) => wrap.querySelector(s); const cv = $('#gwCv'), g = cv.getContext('2d'); const D = gwData();
  const R = { level, L: null, st: null, hist: [], anim: null, busy: false, dir: { x: 1, y: 0 }, dead: false, won: false, score: 0, cleared: 0, coins: 0, t0: Date.now(), maxL: level, posted: 0, parts: [], fx: [], mood: 'idle', moodUntil: 0, pulse: 0, falling: false, shake: 0, id: 0, cs: 40, ox: 0, oy: 0, W: 0, H: 0, seed: 0, t: 0, eaten: 0 };
  GW.run = R; GW.firstAt = GW.firstAt || Date.now();
  const fit = () => {
    const b = $('#gwBoard'), dpr = Math.min(2, devicePixelRatio || 1), w = b.clientWidth, h = b.clientHeight; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
    R.W = w; R.H = h; R.dpr = dpr; if (R.L) { R.cs = Math.max(14, Math.min(60, Math.floor(Math.min((w - 12) / R.L.w, (h - 12) / R.L.h)))); R.ox = Math.round((w - R.L.w * R.cs) / 2); R.oy = Math.round((h - R.L.h * R.cs) / 2); }
  };
  const E = () => GW_ENVS[R.L ? Math.min(GW_ENVS.length - 1, R.L.th) : 0];
  const initParts = () => { R.parts = []; const e = E(), kind = e.p[0]; const n = kind === 'cloud' ? 5 : 26; for (let i = 0; i < n; i++) R.parts.push({ x: Math.random(), y: Math.random(), s: 0.5 + Math.random(), ph: Math.random() * 6.3 }); };
  const toast = (t, ms = 1400) => { const el = $('#gwToast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), ms); };
  const burst = (x, y, cols, n, sp) => { for (let i = 0; i < n; i++) { const an = Math.random() * 6.283, v = (0.4 + Math.random()) * (sp || 1) * R.cs * 0.09; R.fx.push({ x, y, vx: Math.cos(an) * v, vy: Math.sin(an) * v - R.cs * 0.05, life: 1, d: 0.7 + Math.random() * 0.9, c: cols[i % cols.length], r: R.cs * (0.04 + Math.random() * 0.06) }); } };
  const setMood = (m, ms) => { R.mood = m; R.moodUntil = performance.now() + (ms || 0); };
  const hud = () => { const tot = R.L.apples.length; let left = 0; for (let i = 0; i < tot; i++) if (!((R.st.mask >> i) & 1)) left++; $('#gwAp').textContent = `${tot - left}/${tot}`; $('#gwMv').textContent = R.hist.length; };
  const pillOpt = () => { const o = $('#gwOpt'); if (o) o.textContent = `mín. ${R.L.opt}`; };
  const load = (lv) => {
    R.level = lv; R.maxL = Math.max(R.maxL, lv); R.L = gwParse(GW_LV[lv - 1]); R.st = gwStart(R.L); R.hist = []; R.anim = null; R.busy = false; R.dead = false; R.won = false; R.dir = { x: 1, y: 0 }; R.seed = lv * 3.7; R.eaten = 0;
    $('#gwLv').textContent = `Nivel ${lv}`; $('#gwEnv').textContent = E().n; $('#gwOver').classList.remove('show'); $('#gwOver').hidden = true; fit(); initParts(); hud(); pillOpt(); R.fx = []; R.mood = 'idle'; R.moodUntil = 0;
    toast(lv % 50 === 1 && lv > 1 ? `Nuevo ambiente: ${E().n}` : (lv === 1 ? 'Come las manzanas y llega al portal' : `Nivel ${lv} · ${E().n}`), 2000);
  };
  const posOf = (idx) => [R.ox + (idx % R.L.w) * R.cs + R.cs / 2, R.oy + Math.floor(idx / R.L.w) * R.cs + R.cs / 2];
  const lerpPts = (A, B, t) => B.map((bi, i) => { const a = A[Math.min(i, A.length - 1)]; return [a[0] + (bi[0] - a[0]) * t, a[1] + (bi[1] - a[1]) * t]; });
  /* ---- dibujo ---- */
  const drawWall = (x, y, c, up, left, right) => {
    const e = E(); const cs = R.cs; g.fillStyle = e.wall[1]; g.fillRect(x, y, cs + 0.6, cs + 0.6);
    g.fillStyle = e.wall[2]; g.fillRect(x, y + cs * 0.55, cs + 0.6, cs * 0.45 + 0.6);
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(x + cs * 0.12, y + cs * 0.2, cs * 0.22, cs * 0.12); g.fillRect(x + cs * 0.55, y + cs * 0.62, cs * 0.26, cs * 0.12);
    if (!up) { g.fillStyle = e.wall[0]; g.fillRect(x, y, cs + 0.6, cs * 0.26); g.beginPath(); for (let k = 0; k < 4; k++) { g.moveTo(x + k * cs / 4, y + cs * 0.24); g.quadraticCurveTo(x + (k + 0.5) * cs / 4, y + cs * 0.44, x + (k + 1) * cs / 4, y + cs * 0.24); } g.fill(); }
  };
  const drawExit = (x, y) => {
    const cs = R.cs, t = R.t; g.save(); g.translate(x, y); const gl = g.createRadialGradient(0, 0, 2, 0, 0, cs * 0.75); gl.addColorStop(0, 'rgba(255,255,255,.95)'); gl.addColorStop(0.4, 'rgba(170,140,255,.55)'); gl.addColorStop(1, 'rgba(170,140,255,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, 0, cs * 0.75, 0, 7); g.fill();
    for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(${k ? '255,255,255' : '120,90,230'},${0.9 - k * 0.2})`; g.lineWidth = cs * 0.07; g.beginPath(); g.ellipse(0, 0, cs * (0.4 - k * 0.1), cs * (0.18 + k * 0.05), t * (1.2 + k * 0.5), 0, 7); g.stroke(); } g.restore();
  };
  const drawSpike = (x, y) => { const cs = R.cs; g.fillStyle = '#8A93A6'; g.strokeStyle = '#4A5160'; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(x + k * cs / 3 + 1, y + cs); g.lineTo(x + (k + 0.5) * cs / 3, y + cs * 0.4); g.lineTo(x + (k + 1) * cs / 3 - 1, y + cs); g.closePath(); g.fill(); g.stroke(); } };
  const frame = (now) => {
    R.t = now / 1000; const e = E(), W = R.W, H = R.H; g.setTransform(R.dpr, 0, 0, R.dpr, 0, 0); g.clearRect(0, 0, W, H);
    const bx = R.ox - 6, by = R.oy - 6, bw = R.L.w * R.cs + 12, bh = R.L.h * R.cs + 12;
    if (R.shake > 0) { g.translate((Math.random() - 0.5) * R.shake, (Math.random() - 0.5) * R.shake); R.shake = Math.max(0, R.shake - 0.6); }
    g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 26; g.shadowOffsetY = 10; g.fillStyle = '#000'; g.beginPath(); g.roundRect(bx, by, bw, bh, 16); g.fill(); g.restore();
    g.save(); g.beginPath(); g.roundRect(bx, by, bw, bh, 16); g.clip();
    const sg = g.createLinearGradient(0, by, 0, by + bh); sg.addColorStop(0, e.sky[0]); sg.addColorStop(1, e.sky[1]); g.fillStyle = sg; g.fillRect(bx, by, bw, bh);
    g.translate(bx, by); gwBgDeco(g, e, bw, bh, R.t, R.seed); g.translate(-bx, -by);
    /* partículas */
    const kind = e.p[0], col = e.p[1];
    for (const p of R.parts) {
      const x = bx + ((p.x + (kind === 'leaf' || kind === 'petal' ? Math.sin(R.t * 0.8 + p.ph) * 0.03 : 0) + (kind === 'cloud' || kind === 'dust' ? R.t * 0.01 * p.s : 0)) % 1) * bw;
      let y = by + (kind === 'ember' || kind === 'bubble' ? (1 - ((p.y + R.t * 0.05 * p.s) % 1)) : kind === 'snow' || kind === 'leaf' || kind === 'petal' ? ((p.y + R.t * 0.05 * p.s) % 1) : p.y) * bh;
      g.globalAlpha = kind === 'star' || kind === 'sparkle' || kind === 'firefly' ? 0.3 + 0.7 * Math.abs(Math.sin(R.t * 1.5 + p.ph)) : 0.85; g.fillStyle = col;
      if (kind === 'cloud') { g.globalAlpha = 0.5; g.beginPath(); g.ellipse(x, by + p.y * bh * 0.5, 40 * p.s, 12 * p.s, 0, 0, 7); g.fill(); }
      else if (kind === 'leaf' || kind === 'petal') { g.save(); g.translate(x, y); g.rotate(R.t + p.ph); g.beginPath(); g.ellipse(0, 0, 4 * p.s, 2 * p.s, 0, 0, 7); g.fill(); g.restore(); }
      else if (kind === 'bubble') { g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, 3 + p.s * 3, 0, 7); g.stroke(); }
      else if (kind === 'firefly') { g.shadowColor = col; g.shadowBlur = 8; g.beginPath(); g.arc(x + Math.sin(R.t * 0.7 + p.ph) * 10, by + p.y * bh + Math.cos(R.t * 0.6 + p.ph) * 8, 2, 0, 7); g.fill(); g.shadowBlur = 0; }
      else if (kind === 'dust') { g.beginPath(); g.arc(x, by + p.y * bh, 1.5 * p.s, 0, 7); g.fill(); }
      else { g.beginPath(); g.arc(x, y, kind === 'ember' ? 1.8 * p.s : kind === 'snow' ? 2.2 * p.s : 1.4 * p.s, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    }
    g.restore();
    /* celdas */
    const w = R.L.w, h = R.L.h;
    for (let i = 0; i < w * h; i++) {
      const c = R.L.g[i], x = R.ox + (i % w) * R.cs, y = R.oy + Math.floor(i / w) * R.cs;
      if (c === '#') drawWall(x, y, c, i >= w && R.L.g[i - w] === '#');
      else if (c === 'S') drawSpike(x, y);
      else if (c === 'E') drawExit(x + R.cs / 2, y + R.cs / 2);
      else if (c === 'A') { const ai = R.L.aIdx[i]; if (!((R.st.mask >> ai) & 1) || (R.anim && R.anim.eatIdx === i && R.anim.t < 0.5)) gwFruit(g, e, x + R.cs / 2, y + R.cs / 2, R.cs, R.t, ai % 5 === 4 && R.level > 80); }
    }
    /* gusano */
    let pts; const idxPts = (wm) => wm.map(posOf);
    if (R.anim) { const a = R.anim; pts = lerpPts(a.from, a.to, a.t < 1 ? 1 - Math.pow(1 - a.t, 2) : 1); } else pts = idxPts(R.st.worm);
    if (R.dead && !R.anim) g.globalAlpha = 0.9;
    const nowp = performance.now(); let mood = 'idle', look = R.dir;
    if (R.won) mood = 'win'; else if (R.dead) mood = 'dead'; else if (R.falling) mood = 'fall'; else if (R.moodUntil > nowp) mood = R.mood;
    else if (!R.busy) { const hd = R.st.worm[0], hx2 = hd % w, hy2 = Math.floor(hd / w); for (let d = 0; d < 4; d++) { const nx = hx2 + GW_DX[d], ny = hy2 + GW_DY[d]; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const ni = ny * w + nx; if (R.L.g[ni] === 'A' && !((R.st.mask >> R.L.aIdx[ni]) & 1)) { mood = 'hungry'; look = { x: GW_DX[d], y: GW_DY[d] }; break; } } }
    R.pulse = Math.max(0, R.pulse - 0.04);
    gwDrawWorm(g, pts, R.cs, sk, { dir: R.dir, mood, look, pulse: R.pulse }); g.globalAlpha = 1;
    /* partículas de efectos */
    g.save(); g.beginPath(); g.roundRect(bx, by, bw, bh, 16); g.clip();
    for (let i = R.fx.length - 1; i >= 0; i--) { const f = R.fx[i]; f.x += f.vx; f.y += f.vy; f.vy += R.cs * 0.006; f.life -= 0.016 / f.d; if (f.life <= 0) { R.fx.splice(i, 1); continue; } g.globalAlpha = Math.min(1, f.life * 1.4); g.fillStyle = f.c; g.beginPath(); g.arc(f.x, f.y, f.r, 0, 7); g.fill(); } g.globalAlpha = 1; g.restore();
    /* viñeta suave */
    const vg = g.createRadialGradient(bx + bw / 2, by + bh / 2, Math.min(bw, bh) * 0.45, bx + bw / 2, by + bh / 2, Math.max(bw, bh) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,20,30,.22)'); g.save(); g.beginPath(); g.roundRect(bx, by, bw, bh, 16); g.clip(); g.fillStyle = vg; g.fillRect(bx, by, bw, bh); g.restore();
    /* marco */
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.roundRect(bx, by, bw, bh, 16); g.stroke();
  };
  /* ---- animación y movimiento ---- */
  const runFrames = (from, frames, done) => {
    /* frames: lista de gusanos (índices); el primero llega con el movimiento, los demás son caídas */
    let k = 0; let prev = from; R.busy = true;
    const nextFrame = () => {
      if (k >= frames.length) { const wasFall = R.falling; R.falling = false; R.anim = null; R.busy = false; if (wasFall) { const hp = posOf(prev[0]); burst(hp[0], hp[1] + R.cs * 0.4, ['#E8DCC0', '#D4C6A4'], 8, 0.7); R.shake = 5; JG_TONE(180, 0.08, 'sine', 0.04); } done && done(); return; }
      R.falling = k > 0; const toPts = frames[k].map(posOf), fromPts = prev.map(posOf); R.anim = { from: fromPts, to: toPts, t: 0, eatIdx: k === 0 ? R.eatIdx : -1 }; const dur = k === 0 ? 120 : 95; const t0 = performance.now();
      const step = (now) => { if (GW.run !== R) return; const tt = Math.min(1, (now - t0) / dur); R.anim.t = tt; if (tt < 1) requestAnimationFrame(step); else { prev = frames[k]; k++; nextFrame(); } };
      requestAnimationFrame(step);
    };
    nextFrame();
  };
  const tryMove = (d) => {
    if (R.busy || R.dead || R.won) return; const r = gwStep(R.L, R.st, d); if (!r) { JG_TONE(150, 0.06, 'sine', 0.03); JG_VIB(6); bump(d); return; }
    R.dir = { x: GW_DX[d], y: GW_DY[d] }; const before = R.st; R.hist.push(before); R.eatIdx = -1;
    if (r.eat) { R.eatIdx = r.frames[0][0]; R.eaten++; R.pulse = 1; setMood('eat', 750); const ep = posOf(r.frames[0][0]); burst(ep[0], ep[1], [E().fr[0], E().fr[1], '#FFFFFF', '#FFE066'], 14, 1.1); }
    const from = before.worm; R.st = r.state;
    JG_TONE(r.eat ? 520 + R.eaten * 40 : 260, r.eat ? 0.12 : 0.05, r.eat ? 'triangle' : 'sine', r.eat ? 0.055 : 0.02, r.eat ? 780 + R.eaten * 40 : 0);
    if (r.frames.length > 1) setTimeout(() => JG_TONE(330, 0.18, 'sine', 0.03, 140), 150);
    hud(); const fin = () => { hud(); if (r.status === 'win') win(); else if (r.status === 'dead') die(); };
    runFrames(from, r.frames, fin);
  };
  const bump = (d) => { const c = $('#gwBoard'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); };
  const die = () => { R.dead = true; R.shake = 10; { const hp = posOf(R.st.worm[0]); burst(hp[0], hp[1], ['#FFD84A', '#FF8A3A', '#FFFFFF'], 16, 1.2); } JG_TONE(200, 0.35, 'sawtooth', 0.04, 90); JG_VIB([20, 40, 20]); toast('¡Ay! Deshaz el último paso', 1600); setTimeout(() => { if (GW.run === R && R.dead && !R.won) undo(); }, 1100); };
  const undo = () => { if (R.busy || R.won) return; if (!R.hist.length) return; R.st = R.hist.pop(); R.dead = false; R.moodUntil = 0; R.anim = null; hud(); JG_TONE(380, 0.07, 'sine', 0.03); };
  const retry = () => { if (R.busy) return; R.st = gwStart(R.L); R.hist = []; R.dead = false; R.won = false; R.anim = null; R.eaten = 0; hud(); };
  const win = () => {
    if (R.won) return; R.won = true; { const hp = posOf(R.st.worm[0]); burst(hp[0], hp[1], ['#FFD84A', '#FF7AB6', '#7DF0AC', '#5CB8FF', '#B07AFF', '#FFFFFF'], 46, 1.7); setTimeout(() => { if (GW.run === R) burst(R.W / 2, R.H * 0.3, ['#FFD84A', '#FF7AB6', '#7DF0AC', '#5CB8FF', '#FFFFFF'], 40, 1.9); }, 350); }
     const mv = R.hist.length, opt = R.L.opt; const stars = mv <= Math.ceil(opt * 1.25) + 1 ? 3 : mv <= Math.ceil(opt * 2.2) + 3 ? 2 : 1;
    const prevS = gwStarsAt(R.level); let c = 0; if (!prevS) c = 1 + stars; else if (stars > prevS) c = stars - prevS; if (R.level % 50 === 0 && !prevS) c += 5;
    const pts = 100 + stars * 20 + Math.floor(R.level / 10); R.score += pts; R.cleared++; if (c) { R.coins += c; jgCoins(c); }
    if (stars > prevS) gwSetStars(R.level, stars); D.max = Math.max(D.max || 1, Math.min(GW_N(), R.level + 1)); jpSave();
    JG_TONE(660, 0.14, 'sine', 0.05, 880); setTimeout(() => JG_TONE(988, 0.16, 'triangle', 0.045, 1318), 130); setTimeout(() => JG_TONE(1318, 0.2, 'sine', 0.04), 280); JG_VIB(14);
    $('#gwWhy').textContent = R.level >= GW_N() ? `¡Terminaste los ${GW_N()} niveles!` : `Nivel ${R.level} superado`; $('#gwStars').innerHTML = jgStarsHTML(stars);
    $('#gwRes').innerHTML = `<div><b>${mv}</b><small>Pasos</small></div><div><b>${opt}</b><small>Mínimo</small></div><div><b>+${pts}</b><small>Puntos</small></div>`;
    $('#gwCoins').textContent = c ? `+${c} ${c === 1 ? 'moneda' : 'monedas'} para tu árbol` : ''; $('#gwRest').textContent = jgRestNote(GW.firstAt);
    $('#gwNext').style.display = R.level >= GW_N() ? 'none' : ''; jgAnnounce(`Nivel ${R.level} superado con ${stars} estrellas`);
    setTimeout(() => { if (GW.run !== R) return; const o = $('#gwOver'); o.hidden = false; void o.offsetWidth; o.classList.add('show'); }, 1200);
    if (R.cleared % 5 === 0) post();
  };
  const post = () => { if (R.cleared < 1 || R.posted === R.cleared) return; R.posted = R.cleared; jgPost({ game: 'gusano', score: R.score, level: Math.min(GW_N(), R.maxL), cleared: R.cleared, dur: Math.max(1, Math.round((Date.now() - R.t0) / 1000)) }).then((rec) => { const l = $('#gwRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Hoy vas en el lugar #${rec.rankDay}`; }); };
  /* ---- controles ---- */
  const key = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3, W: 0, D: 1, S: 2, A: 3 };
  const onKey = (e) => { if (e.key === 'Escape') { exit(); return; } if (e.key in key) { e.preventDefault(); tryMove(key[e.key]); } else if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey || true)) undo(); else if (e.key === 'r' || e.key === 'R') retry(); };
  addEventListener('keydown', onKey);
  $('#gwPad').addEventListener('pointerdown', (e) => { const b = e.target.closest('[data-d]'); if (!b) return; e.preventDefault(); tryMove(+b.dataset.d); });
  let sw = null; const board = $('#gwBoard');
  board.addEventListener('pointerdown', (e) => { sw = { x: e.clientX, y: e.clientY, t: Date.now() }; });
  board.addEventListener('pointermove', (e) => { if (!sw) return; const dx = e.clientX - sw.x, dy = e.clientY - sw.y; if (Math.hypot(dx, dy) > 26) { tryMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); sw = { x: e.clientX, y: e.clientY, t: Date.now() }; } });
  const endSw = (e) => { if (sw && Date.now() - sw.t < 250 && Math.hypot(e.clientX - sw.x, e.clientY - sw.y) < 10 && R.L) { /* toque: hacia el lado donde tocas respecto a la cabeza */ const hp = posOf(R.st.worm[0]); const r = cv.getBoundingClientRect(); const dx = e.clientX - r.left - hp[0], dy = e.clientY - r.top - hp[1]; if (Math.hypot(dx, dy) > R.cs * 0.6) tryMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); } sw = null; };
  board.addEventListener('pointerup', endSw); board.addEventListener('pointercancel', () => { sw = null; });
  $('#gwUndo').addEventListener('click', undo); $('#gwRetry').addEventListener('click', retry);
  $('#gwNext').addEventListener('click', () => { if (R.level < GW_N()) load(R.level + 1); });
  $('#gwAgain').addEventListener('click', () => load(R.level));
  const onResize = () => { fit(); };
  addEventListener('resize', onResize);
  const exit = (quiet) => { cancelAnimationFrame(R.id); removeEventListener('keydown', onKey); removeEventListener('resize', onResize); removeEventListener('popstate', onPop); post(); wrap.remove(); if (!quiet) document.body.classList.remove('gm-on'); GW.run = null; if (!quiet && location.hash === '#/gusano') render(); };
  const onPop = () => { if (GW.run) { try { history.pushState({ gwGame: true }, ''); } catch { /* */ } exit(); } };
  try { history.pushState({ gwGame: true }, ''); } catch { /* */ }
  addEventListener('popstate', onPop);
  $('#gwDone').addEventListener('click', () => { exit(); if (location.hash !== '#/gusano') location.hash = '#/gusano'; else render(); });
  $('#gwX').addEventListener('click', () => { exit(); if (location.hash !== '#/gusano') location.hash = '#/gusano'; });
  const loop = (now) => { if (GW.run !== R) return; if (R.L) frame(now); R.id = requestAnimationFrame(loop); };
  load(level); R.id = requestAnimationFrame(loop);
  setTimeout(fit, 60);
}
Object.assign(VIDA_ACTS, {
  'gw-play': (el) => gwPlay(+el.dataset.l || gwMax()),
  'gw-col': (el) => { gwData().col = el.dataset.c; jpSave(); render(); },
});
document.addEventListener('toggle', (e) => { const d = e.target; if (d && d.classList && d.classList.contains('gw-env') && d.open) { GWUI.env = +d.dataset.env; const hasGrid = d.querySelector('.gw-lvs'); if (!hasGrid) { d.insertAdjacentHTML('beforeend', gwEnvGrid(GWUI.env)); document.querySelectorAll('.gw-env[open]').forEach((x) => { if (x !== d) x.removeAttribute('open'); }); } } }, true);
EXTRA_VIEWS.gusano = viewGusano; EXTRA_NAV.gusano = 'juegos';
