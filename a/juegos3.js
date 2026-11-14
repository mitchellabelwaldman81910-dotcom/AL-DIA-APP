/* Cinnavia 7.41 — Mente Viva (seguir la carta que se baraja, 500 niveles), Enlaza (desenredar la red, 500 niveles)
   y skins para los dos. Comparten ranking, monedas y el avance por cuenta. */
'use strict';

/* ---------- avance por cuenta (se sincroniza con el resto de los datos) ---------- */
const jpData = (g) => { const v = vidaData(); v.jp ||= {}; return (v.jp[g] ||= {}); };
const jpSave = () => { try { save(); } catch { /* */ } };
const jgMinutes = (t0) => Math.round((Date.now() - (t0 || Date.now())) / 60000);
const jgRestNote = (t0) => (jgMinutes(t0) >= 20 ? `Llevas ${jgMinutes(t0)} minutos seguidos. Un descanso corto te ayuda a concentrarte.` : '');
const jgSleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jgStarsHTML = (n) => `<span class="jg-stars" aria-label="${n} de 3 estrellas">${[1, 2, 3].map((i) => `<i class="${i <= n ? 'on' : ''}">★</i>`).join('')}</span>`;
const jgLeaf = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19c3-4 6-7 10-9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity=".5"/></svg>';

/* ======================================================================
   Skins nuevos: cartas (Mente Viva), puntos (Enlaza) y corredor (Pelotón)
   ====================================================================== */
const SK_CARDS = [
  ['hoja', 'Hoja', 0, 'El reverso de siempre, verde y tranquilo.', { a: '#4E8C78', b: '#2B5A4D', pat: 'dots' }],
  ['bruma', 'Bruma', 40, 'Azul suave con puntitos.', { a: '#7FA0C6', b: '#42628C', pat: 'dots' }],
  ['durazno', 'Durazno', 90, 'Rayas cálidas de verano.', { a: '#F4BC98', b: '#D8805A', pat: 'stripes' }],
  ['musgo', 'Musgo', 160, 'Rombos verdes, como un tejido.', { a: '#86AD70', b: '#46703A', pat: 'diamonds' }],
  ['noche', 'Noche azul', 280, 'Un cielo de estrellas pequeñas.', { a: '#4655A8', b: '#1B2255', pat: 'stars' }],
  ['lavanda', 'Lavanda', 450, 'Ondas moradas y calmadas.', { a: '#BDA8E8', b: '#7C62C2', pat: 'waves' }],
  ['cereza', 'Cereza', 700, 'Rojo profundo con lunares.', { a: '#EA6A84', b: '#98203F', pat: 'dots' }],
  ['dunas', 'Dunas', 1000, 'Arena dorada con ondas de viento.', { a: '#EDD6A4', b: '#B98F4A', pat: 'waves' }],
  ['jade', 'Jade pulido', 1500, 'Piedra verde con un brillo que pasa.', { a: '#74D6AD', b: '#1F7A58', pat: 'diamonds', sheen: 1 }],
  ['oro', 'Oro viejo', 2300, 'Rejilla de oro con halo.', { a: '#F9E28E', b: '#B98A1E', pat: 'grid', glow: '#FFD75A', sheen: 1 }],
  ['aurora', 'Aurora', 3400, 'Rayos de luz verde y azul.', { a: '#62E4C4', b: '#4B5BE0', pat: 'rays', glow: '#6FE8D0' }],
  ['obsidiana', 'Obsidiana', 5000, 'Cristal oscuro con luz violeta.', { a: '#454556', b: '#0B0B10', pat: 'facets', glow: '#8A6BFF' }],
  ['galaxia', 'Galaxia', 7500, 'Un trozo de cosmos.', { a: '#7355EC', b: '#150A52', pat: 'stars', glow: '#8A6BFF' }],
  ['brasa', 'Brasa', 11000, 'Calor que late en el centro.', { a: '#FFDC5A', b: '#C2250A', pat: 'rays', glow: '#FF7A1F', sheen: 1 }],
  ['prisma', 'Prisma', 16000, 'Colores que cambian despacio.', { a: '#FF9AC0', b: '#6FB4FF', pat: 'diamonds', rainbow: 1, glow: '#FFFFFF' }],
  ['mitico', 'Carta mítica', 22000, 'Arcoíris vivo, estrellas y brillo.', { a: '#FFFFFF', b: '#B07AFF', pat: 'stars', rainbow: 1, glow: '#FFFFFF', sheen: 1 }],
];
const SK_NODES = [
  ['clasico', 'Brote', 0, 'Puntos verdes y líneas suaves.', { a: '#7FB59E', b: '#3E7C66', edge: '#8FB5A5', shape: 'c' }],
  ['bayas', 'Bayas', 40, 'Moradas, redonditas.', { a: '#B58CE0', b: '#6A3FA8', edge: '#A98BD0', shape: 'c' }],
  ['miel', 'Miel', 90, 'Ámbar cálido.', { a: '#F6CB6A', b: '#C98A1E', edge: '#D9B26A', shape: 'c' }],
  ['cielo', 'Cielo', 160, 'Azul despejado.', { a: '#8EC8F5', b: '#2F78C0', edge: '#7DB0DC', shape: 'c' }],
  ['coral', 'Coral', 280, 'Rosa de arrecife.', { a: '#FFA48C', b: '#D8573C', edge: '#E59A86', shape: 'c' }],
  ['neon', 'Neón', 450, 'Brillan en la oscuridad.', { a: '#7DFFD0', b: '#00B88A', edge: '#3FE0B0', shape: 'c', glow: '#3FFFC0' }],
  ['perla', 'Perla', 700, 'Blanco nacarado.', { a: '#FFFFFF', b: '#C9CFD8', edge: '#B6BFCC', shape: 'c', sheen: 1 }],
  ['ambar', 'Ámbar facetado', 1000, 'Rombos tallados.', { a: '#FFD36A', b: '#B8741A', edge: '#D9A24A', shape: 'd' }],
  ['cristal', 'Cristal', 1500, 'Hexágonos de hielo.', { a: '#EFFBFF', b: '#6FBCE8', edge: '#A9D9F2', shape: 'h', glow: '#BEE6FF' }],
  ['estrella', 'Estrellas', 2300, 'Cada punto es una estrella.', { a: '#FFF1A6', b: '#F0A91F', edge: '#E8C766', shape: 's', glow: '#FFE48A' }],
  ['plasma', 'Plasma', 3400, 'Energía que late.', { a: '#FF8AF0', b: '#6A2BE0', edge: '#C07AF0', shape: 'c', glow: '#C05CFF', pulse: 1 }],
  ['galaxia', 'Galaxia', 5000, 'Estrellas violetas en el espacio.', { a: '#B79BFF', b: '#1C0F66', edge: '#8F7BE0', shape: 's', glow: '#8A6BFF', pulse: 1 }],
  ['rubi', 'Rubí', 7500, 'Gemas con luz interior.', { a: '#FF9AB0', b: '#8A0A2A', edge: '#D9476A', shape: 'd', glow: '#FF4D78', sheen: 1 }],
  ['fenix', 'Fénix', 11000, 'Brasas que no se apagan.', { a: '#FFE066', b: '#D2300A', edge: '#F08A3A', shape: 's', glow: '#FF7A1F', pulse: 1 }],
  ['arcoiris', 'Arcoíris', 16000, 'Cambian de color sin parar.', { a: '#FFC2E0', b: '#7AB8FF', edge: '#C9B2F0', shape: 'c', rainbow: 1, glow: '#FFFFFF' }],
  ['celestial', 'Celestial', 22000, 'Estrellas arcoíris con halo.', { a: '#FFFFFF', b: '#C9A8FF', edge: '#E6D4FF', shape: 's', rainbow: 1, glow: '#FFFFFF', pulse: 1, sheen: 1 }],
];
const SK_RUNNERS = [
  ['verde', 'Uniforme verde', 0, 'El de siempre.', { jersey: '#2A7F53', arm: '#1F6A45', trim: '#E9B44C', trim2: '#C98F2C', shorts: '#2B3A55', shoe: '#F7F7F7', hair: '#2A2320' }],
  ['azul', 'Azul escuela', 40, 'Azul con franja blanca.', { jersey: '#2F6DB5', arm: '#245A99', trim: '#F2F4F8', trim2: '#C9D0DB', shorts: '#1E2F4F', shoe: '#F7F7F7', hair: '#2A2320' }],
  ['rojo', 'Rojo veloz', 90, 'Para llegar primero.', { jersey: '#D4443A', arm: '#B1332B', trim: '#FFE6A8', trim2: '#E4B96A', shorts: '#2B2B33', shoe: '#F7F7F7', hair: '#4A2410' }],
  ['morado', 'Morado', 160, 'Con detalles dorados.', { jersey: '#7A4FC4', arm: '#6240A6', trim: '#F2D68A', trim2: '#C9A24A', shorts: '#2A2250', shoe: '#EFE8FA', hair: '#1B1613' }],
  ['naranja', 'Atardecer', 280, 'Naranja cálido.', { jersey: '#F08A32', arm: '#D2701F', trim: '#FFF0C8', trim2: '#E4B27A', shorts: '#3A2A22', shoe: '#FFF6E8', hair: '#2A2320' }],
  ['negro', 'Negro y oro', 450, 'Elegante y rápido.', { jersey: '#23232B', arm: '#16161C', trim: '#F5C842', trim2: '#C9921F', shorts: '#101015', shoe: '#F5C842', hair: '#0E0E12' }],
  ['blanco', 'Blanco nube', 700, 'Limpio y ligero.', { jersey: '#F2F4F8', arm: '#D9DEE8', trim: '#5C8EC9', trim2: '#3E6FA8', shorts: '#C9D0DB', shoe: '#5C8EC9', hair: '#5A3A22' }],
  ['rosa', 'Rosa algodón', 1000, 'Suave y valiente.', { jersey: '#F2A0BE', arm: '#DB86A6', trim: '#FFFFFF', trim2: '#F5D0DE', shorts: '#8A4F6B', shoe: '#FFFFFF', hair: '#3A1E2A' }],
  ['turquesa', 'Turquesa', 1500, 'Fresco como el mar.', { jersey: '#27B8A8', arm: '#1E9588', trim: '#F5E6A8', trim2: '#D9C06A', shorts: '#1B4F5A', shoe: '#F5F9FA', hair: '#1B1613' }],
  ['plata', 'Plata', 2300, 'Metal con brillo.', { jersey: '#B8C2D0', arm: '#8E9AAB', trim: '#FFFFFF', trim2: '#DDE3EC', shorts: '#4A5568', shoe: '#FFFFFF', hair: '#2A2320', spark: '#FFFFFF' }],
  ['oro', 'Oro de campeón', 3400, 'Brilla en cada zancada.', { jersey: '#F2C84A', arm: '#D4A52A', trim: '#FFF6C9', trim2: '#E0B84A', shorts: '#7A5A12', shoe: '#FFF6C9', hair: '#2A2320', spark: '#FFF1A8' }],
  ['neon', 'Neón nocturno', 5000, 'Verde que se ve de lejos.', { jersey: '#32E88A', arm: '#1FC070', trim: '#0E1F18', trim2: '#164A33', shorts: '#0E1F18', shoe: '#32E88A', hair: '#0E0E12', aura: '#32E88A' }],
  ['hielo', 'Escarcha', 7500, 'Cristales de hielo.', { jersey: '#BEE6FF', arm: '#8CC4E4', trim: '#FFFFFF', trim2: '#DFF3FF', shorts: '#4F86B0', shoe: '#FFFFFF', hair: '#274A66', aura: '#BEE6FF', spark: '#FFFFFF' }],
  ['fuego', 'Cometa', 11000, 'Deja una estela de fuego.', { jersey: '#E8421A', arm: '#B82F0E', trim: '#FFE066', trim2: '#FF9A2A', shorts: '#4A1408', shoe: '#FFE066', hair: '#1B0E08', aura: '#FF7A1F', spark: '#FFE08A' }],
  ['galaxia', 'Galaxia', 16000, 'Corre entre estrellas.', { jersey: '#4B2FB5', arm: '#37208C', trim: '#C9A8FF', trim2: '#8F7BE0', shorts: '#150A52', shoe: '#C9A8FF', hair: '#0E0630', aura: '#8A6BFF', spark: '#FFFFFF' }],
  ['arcoiris', 'Arcoíris legendario', 22000, 'Colores vivos y aura brillante.', { jersey: '#FF7AB6', arm: '#C25CE8', trim: '#FFFFFF', trim2: '#FFE8A8', shorts: '#5C8EF0', shoe: '#FFFFFF', hair: '#2A1E4A', aura: '#FFFFFF', spark: '#FFFFFF', rainbow: 1 }],
];
const skCardBack = (P, t) => {
  const pat = { dots: 'radial-gradient(circle, rgba(255,255,255,.32) 1.8px, transparent 2.3px) 0 0/14px 14px',
    stripes: 'repeating-linear-gradient(45deg, rgba(255,255,255,.2) 0 4px, transparent 4px 11px)',
    diamonds: 'linear-gradient(45deg, rgba(255,255,255,.16) 25%, transparent 25%) 0 0/18px 18px, linear-gradient(-45deg, rgba(255,255,255,.16) 25%, transparent 25%) 0 0/18px 18px',
    waves: 'repeating-radial-gradient(circle at 50% 130%, rgba(255,255,255,.24) 0 3px, transparent 3px 10px)',
    stars: 'radial-gradient(circle, #fff 1px, transparent 1.7px) 3px 5px/19px 23px, radial-gradient(circle, rgba(255,255,255,.7) .8px, transparent 1.4px) 12px 15px/23px 17px',
    rays: 'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,.2) 0 8deg, transparent 8deg 22deg)',
    grid: 'linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px) 0 0/12px 12px, linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px) 0 0/12px 12px',
    facets: 'repeating-conic-gradient(from 20deg at 50% 50%, rgba(255,255,255,.12) 0 15deg, rgba(0,0,0,.14) 15deg 30deg)' }[P.pat] || '';
  const base = P.rainbow ? 'linear-gradient(135deg,#ff7aa8,#ffc24a,#7df0ac,#5cb8ff,#b07aff)' : `linear-gradient(150deg,${P.a},${P.b})`;
  return `background:${pat ? pat + ',' : ''}${base};${P.glow ? `box-shadow:0 0 16px ${P.glow}88,0 6px 14px rgba(0,0,0,.28);` : ''}`;
};
const mcCurSkin = () => skFind('c', skEq('c'))[4];
const enCurSkin = () => skFind('n', skEq('n'))[4];
const pmSkinCur = () => skFind('r', skEq('r'))[4];
function skShape(g, shape, x, y, r) {
  g.beginPath();
  if (shape === 'd') { g.moveTo(x, y - r * 1.15); g.lineTo(x + r, y); g.lineTo(x, y + r * 1.15); g.lineTo(x - r, y); g.closePath(); }
  else if (shape === 'h') { for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6; g.lineTo(x + Math.cos(a) * r * 1.08, y + Math.sin(a) * r * 1.08); } g.closePath(); }
  else if (shape === 's') { for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (Math.PI / 5) * i, rr = i % 2 ? r * 0.5 : r * 1.2; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
  else g.arc(x, y, r, 0, Math.PI * 2);
}
SK_TYPES.c = { titulo: 'Cartas', nombre: 'Cartas', lista: SK_CARDS, ver(g, W, H, P) {
  for (let i = -1; i <= 1; i++) { g.save(); g.translate(W / 2 + i * 56, H / 2 + 6 + Math.abs(i) * 4); g.rotate(i * 0.16); const w = 62, h = 88;
    const lg = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); lg.addColorStop(0, P.rainbow ? '#ff9ac0' : P.a); lg.addColorStop(1, P.rainbow ? '#6fb4ff' : P.b);
    if (P.glow) { g.shadowColor = P.glow; g.shadowBlur = 14; } g.fillStyle = lg; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 9); g.fill(); g.shadowBlur = 0;
    g.save(); g.clip(); g.fillStyle = 'rgba(255,255,255,.3)'; if (P.pat === 'stripes') for (let k = -6; k < 8; k++) g.fillRect(-w + k * 12, -h, 3, h * 2.4);
    else if (P.pat === 'rays' || P.pat === 'facets') { for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 90, k * 0.8, k * 0.8 + 0.28); g.fill(); } }
    else for (let x = -w / 2 + 6; x < w / 2; x += 12) for (let y = -h / 2 + 6; y < h / 2; y += 12) { g.beginPath(); g.arc(x + ((y / 12) % 2 ? 6 : 0), y, P.pat === 'stars' ? 0.9 : 1.6, 0, 7); g.fill(); }
    g.restore(); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.beginPath(); g.roundRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 6); g.stroke(); g.restore(); }
} };
SK_TYPES.n = { titulo: 'Puntos', nombre: 'Puntos', lista: SK_NODES, ver(g, W, H, P) {
  const pts = [[48, 100], [110, 40], [170, 98], [110, 124], [70, 56], [152, 44]]; const ed = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 1], [2, 5], [1, 5]];
  g.strokeStyle = P.edge; g.lineWidth = 3; g.lineCap = 'round'; for (const [a, b] of ed) { g.beginPath(); g.moveTo(pts[a][0], pts[a][1]); g.lineTo(pts[b][0], pts[b][1]); g.stroke(); }
  for (const [x, y] of pts) { if (P.glow) { g.shadowColor = P.glow; g.shadowBlur = 14; } const lg = g.createRadialGradient(x - 4, y - 5, 2, x, y, 15); lg.addColorStop(0, P.rainbow ? '#ffc2e0' : P.a); lg.addColorStop(1, P.rainbow ? '#7ab8ff' : P.b); g.fillStyle = lg; skShape(g, P.shape, x, y, 12); g.fill(); g.shadowBlur = 0; g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.4; g.stroke(); }
} };
SK_TYPES.r = { titulo: 'Corredor', nombre: 'Uniforme', lista: SK_RUNNERS, ver(g, W, H, P) {
  g.save(); g.translate(W / 2, H - 14); g.scale(0.9, 0.9); pmDrawRunnerStatic(g, P); g.restore();
} };
/* corredor dibujado sin animación (tienda y vista previa) */
function pmDrawRunnerStatic(g, K) {
  g.fillStyle = 'rgba(10,15,25,.25)'; g.beginPath(); g.ellipse(0, 0, 24, 6, 0, 0, 6.3); g.fill();
  if (K.aura) { const ag = g.createRadialGradient(0, -60, 8, 0, -60, 70); ag.addColorStop(0, K.aura + '66'); ag.addColorStop(1, K.aura + '00'); g.fillStyle = ag; g.beginPath(); g.arc(0, -60, 70, 0, 7); g.fill(); }
  for (const sd of [-1, 1]) { g.fillStyle = K.shorts; pmRR(g, sd * 9 - 6, -42, 12, 42, 5); g.fill(); g.fillStyle = K.shoe; pmRR(g, sd * 9 - 8, -9, 16, 9, 4); g.fill(); g.fillStyle = K.trim; g.fillRect(sd * 9 - 8, -4, 16, 2.4); }
  for (const sd of [-1, 1]) { g.strokeStyle = K.arm; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(sd * 21, -76); g.lineTo(sd * 26, -48); g.stroke(); g.fillStyle = '#F0C7A0'; g.beginPath(); g.arc(sd * 26, -45, 5, 0, 6.3); g.fill(); }
  g.fillStyle = K.jersey; g.beginPath(); g.moveTo(-20, -78); g.quadraticCurveTo(0, -84, 20, -78); g.lineTo(15, -38); g.lineTo(-15, -38); g.closePath(); g.fill();
  g.fillStyle = K.trim; pmRR(g, -15, -74, 30, 32, 8); g.fill(); g.fillStyle = K.trim2; pmRR(g, -10, -52, 20, 12, 4); g.fill(); g.fillRect(-1, -74, 2, 20);
  g.fillStyle = '#F0C7A0'; g.fillRect(-4, -84, 8, 8); g.fillStyle = K.hair; g.beginPath(); g.arc(0, -95, 13, 0, 6.3); g.fill(); g.fillStyle = K.hair; g.beginPath(); g.arc(0, -99, 10, Math.PI, 6.3); g.fill(); g.fillStyle = K.trim; g.fillRect(-13, -97, 26, 3.4);
}

/* ======================================================================
   Mente Viva — sigue la carta
   ====================================================================== */
const MC_MAX = 500; /* 7.61: 200 niveles nuevos después del 300, con la misma subida suave */
const mcCfg = (L0) => { const L = L0 * 2 / 3; /* 300 niveles con la misma subida suave de antes */ return {
  n: Math.min(7, 3 + Math.floor(L / 30)),
  swaps: Math.round(4 + L * 0.27),
  ms: Math.max(175, Math.round(720 - L * 2.8)),
  targets: L >= 140 ? 3 : L >= 60 ? 2 : 1,
  twin: L >= 100,
  show: Math.max(1100, 2100 - L * 5),
}; };
const MC_COLORS = ['#E8744F', '#4FA8E8', '#E8B84F'];
const MC = { run: null };
const mcLvl = () => Math.min(MC_MAX, Math.max(1, jpData('mente').lvl || 1));
function mcHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="mchS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12303A"/><stop offset=".75" stop-color="#2F6E62"/><stop offset="1" stop-color="#6FB59C"/></linearGradient></defs>
    <rect width="360" height="170" rx="20" fill="url(#mchS)"/><circle cx="288" cy="40" r="18" fill="#EAF6EE" opacity=".85"/>
    <path d="M0 126l60-36 44 24 60-44 64 50 52-28 80 34v44H0z" fill="#16403F" opacity=".85"/>
    <g transform="translate(70 70) rotate(-12)"><rect width="52" height="74" rx="9" fill="#4E8C78" stroke="#BFE8D6" stroke-width="2"/><circle cx="26" cy="37" r="5" fill="#BFE8D6" opacity=".6"/></g>
    <g transform="translate(150 60)"><rect width="52" height="74" rx="9" fill="#F4F7F4" stroke="#BFE8D6" stroke-width="2"/><path d="M26 20l12 17-12 17-12-17z" fill="#E8744F"/></g>
    <g transform="translate(228 72) rotate(12)"><rect width="52" height="74" rx="9" fill="#4E8C78" stroke="#BFE8D6" stroke-width="2"/><circle cx="26" cy="37" r="5" fill="#BFE8D6" opacity=".6"/></g>
    <path d="M118 150c30 12 90 12 120 0" stroke="#9BE0BE" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7" stroke-dasharray="2 8"/></svg>`;
}
function viewMemoria() {
  const lv = mcLvl(), D = jpData('mente');
  return `<section class="mt-home"><div class="gm-hero">${mcHero()}</div><h1 class="page-title gm-title">Mente Viva</h1>
    <p class="page-sub">Una carta tiene color. Míra bien dónde está: las cartas se voltean, se barajan y tú sigues la carta con la vista. Al final, tócala. Son <b>${MC_MAX} niveles</b> que suben poco a poco.</p>
    <div class="jg-prog" role="img" aria-label="Avance: nivel ${lv} de ${MC_MAX}"><i style="width:${Math.min(100, ((lv - 1) / MC_MAX) * 100)}%"></i></div>
    <p class="small muted" style="text-align:center;margin:8px 0 14px">${lv > MC_MAX ? `¡Completaste los ${MC_MAX} niveles!` : `Vas en el nivel <b>${lv}</b> de ${MC_MAX}`}${D.best ? ` · mejor racha: <b>${D.best}</b> niveles` : ''}</p>
    <button class="btn primary block gm-play" data-act="mc-start">${icon('play')}${lv > 1 ? `Continuar · nivel ${Math.min(lv, MC_MAX)}` : 'Empezar'}</button>
    ${lv > 1 ? `<button class="btn block" style="margin-top:8px" data-act="mc-start" data-from="1">Empezar desde el nivel 1</button>` : ''}
    <a class="btn block" href="#/skins" style="margin-top:8px" data-skin="c">${icon('star', 'sm')}Skins de cartas</a>
    <p class="small muted" style="text-align:center;margin-top:10px">Tienes 3 hojas: pierdes una cada vez que fallas. Ganas monedas al superar niveles.</p>
    <div id="jgRank-mente">${jgRankHTML('mente')}</div><p id="jgLive" class="sr-only" aria-live="polite"></p></section>`;
}
function mcStart(from) {
  if (MC.run) return;
  const sk = mcCurSkin();
  const wrap = document.createElement('div'); wrap.className = 'gl-stage mt-stage mc-stage';
  const orbs = Array.from({ length: 9 }, (_, i) => `<i class="mt-orb" style="--x:${(i * 37 + 8) % 100}%;--y:${(i * 53 + 12) % 100}%;--s:${60 + (i * 29) % 120}px;--d:${16 + (i * 5) % 14}s;--l:${-i * 3}s"></i>`).join('');
  wrap.innerHTML = `<div class="mt-bg" aria-hidden="true">${orbs}</div>
    <button class="gm-x gl-x" id="mcX" aria-label="Salir del juego">${icon('x')}</button>
    <div class="mt-top"><div class="mt-lives" id="mcLives" aria-label="Hojas"></div><div class="mt-stat"><small>Puntos</small><b id="mcScore">0</b></div><div class="mt-stat"><small>Nivel</small><b id="mcLvl">1</b></div></div>
    <div class="mc-main"><div class="mc-msg" id="mcMsg" aria-live="polite"></div><div class="mc-table" id="mcTable"></div><div class="mc-sub" id="mcSub"></div></div>
    <div class="mt-ready" id="mcReady"><div class="mt-breath" aria-hidden="true"></div><b>Respira hondo</b><span id="mcReadyTx"></span><button class="btn primary" id="mcGo">Empezar</button></div>
    <div class="gl-over mt-over" id="mcOver" hidden><b id="mcWhy">Fin de la partida</b><div class="mt-res" id="mcRes"></div><span id="mcCoins" class="pm-gain"></span><span class="small muted" id="mcRank"></span><span class="small muted" id="mcRest"></span>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="mcAgain">${icon('play')}Seguir</button><button class="btn" id="mcDone">Volver a Juegos</button></div></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const $ = (s) => wrap.querySelector(s);
  const D = jpData('mente'); const startLv = from ? 1 : mcLvl();
  const st = { state: 'ready', level: Math.min(MC_MAX, startLv), lives: 3, score: 0, cleared: 0, streak: 0, bestStreak: 0, coins: 0, t0: Date.now(), tok: 0, cards: [], slots: [], found: 0, need: 1, pickAt: 0, posted: false };
  MC.run = st; MC.firstAt = MC.firstAt || Date.now();
  $('#mcReadyTx').textContent = `Nivel ${st.level} · ${mcCfg(st.level).n} cartas`;
  const lives = () => { $('#mcLives').innerHTML = [0, 1, 2].map((i) => `<span class="mt-leaf${i < st.lives ? '' : ' lost'}">${jgLeaf}</span>`).join(''); };
  const hud = () => { $('#mcScore').textContent = st.score; $('#mcLvl').textContent = st.level; };
  const msg = (t, s = '') => { $('#mcMsg').textContent = t; $('#mcSub').textContent = s; };
  const alive = (tok) => MC.run === st && st.tok === tok && wrap.isConnected;
  const layout = (n) => {
    const tbl = $('#mcTable'), TW = Math.min(tbl.clientWidth || 340, 460), two = n > 4, cols = two ? Math.ceil(n / 2) : n, rows = two ? 2 : 1;
    const cw = Math.min(88, Math.floor((TW - 8) / cols * 0.84)), ch = Math.round(cw * 1.42), gx = (TW - cols * cw) / (cols + 1), gy = 18;
    tbl.style.height = (rows * ch + (rows + 1) * gy) + 'px'; tbl.style.setProperty('--cw', cw + 'px'); tbl.style.setProperty('--ch', ch + 'px');
    const slots = []; for (let i = 0; i < n; i++) { const r = two ? (i < cols ? 0 : 1) : 0, c = two ? (i < cols ? i : i - cols) : i, cnt = two && r === 1 ? n - cols : cols; const off = two && r === 1 ? (cols - cnt) * (cw + gx) / 2 : 0; slots.push({ x: Math.round(gx + c * (cw + gx) + off), y: Math.round(gy + r * (ch + gy)) }); }
    return slots;
  };
  const place = (card, slot, ms) => { card.el.style.transitionDuration = ms + 'ms'; card.el.style.transform = `translate(${st.slots[slot].x}px,${st.slots[slot].y}px)`; card.slot = slot; };
  const build = (cfg) => {
    const tbl = $('#mcTable'); tbl.innerHTML = ''; st.slots = layout(cfg.n); st.cards = []; st.found = 0; st.need = Math.min(cfg.targets, cfg.n - 2);
    const tgt = new Set(); while (tgt.size < st.need) tgt.add(Math.floor(Math.random() * cfg.n));
    let ci = 0;
    for (let i = 0; i < cfg.n; i++) {
      const isT = tgt.has(i), col = isT ? MC_COLORS[ci++ % 3] : null;
      const el = document.createElement('button'); el.type = 'button'; el.className = 'mc-card flip'; el.setAttribute('aria-label', `Carta ${i + 1}`);
      el.innerHTML = `<span class="mc-in"><span class="mc-front">${isT ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 9-7 9-7-9z" fill="${col}"/><path d="M12 3l7 9H5z" fill="#fff" opacity=".35"/></svg>` : ''}</span><span class="mc-back${sk.sheen ? ' sheen' : ''}${sk.rainbow ? ' rb' : ''}" style="${skCardBack(sk)}"></span></span>`;
      tbl.appendChild(el); const card = { el, t: isT, col, slot: i, done: false }; st.cards.push(card); el.style.transitionDuration = '0ms'; place(card, i, 0);
      el.addEventListener('pointerdown', (e) => { e.preventDefault(); pick(card); });
    }
  };
  const swapOnce = async (cfg, tok) => {
    const n = cfg.n; const pairs = (cfg.twin && n >= 6 && Math.random() < 0.45) ? 2 : 1; const used = new Set(); const sw = [];
    for (let k = 0; k < pairs; k++) { let a, b, g = 0; do { a = Math.floor(Math.random() * n); b = Math.floor(Math.random() * n); g++; } while ((a === b || used.has(a) || used.has(b)) && g < 40); if (a === b || used.has(a) || used.has(b)) continue; used.add(a); used.add(b); sw.push([a, b]); }
    for (const [sa, sb] of sw) { const ca = st.cards.find((c) => c.slot === sa), cb = st.cards.find((c) => c.slot === sb); ca.el.classList.add('lift'); cb.el.classList.add('low'); place(ca, sb, cfg.ms); place(cb, sa, cfg.ms); }
    JG_TONE(300 + Math.random() * 90, Math.min(0.12, cfg.ms / 1000 * 0.4), 'sine', 0.018);
    await jgSleep(cfg.ms + 30); if (!alive(tok)) return false;
    st.cards.forEach((c) => c.el.classList.remove('lift', 'low')); await jgSleep(Math.max(20, cfg.ms * 0.12)); return alive(tok);
  };
  const playLevel = async () => {
    const tok = ++st.tok; const cfg = mcCfg(st.level); st.state = 'show'; hud();
    build(cfg); msg(`Nivel ${st.level}`, st.need > 1 ? `Recuerda dónde están las ${st.need} cartas de color` : 'Recuerda dónde está la carta de color');
    await jgSleep(500); if (!alive(tok)) return; JG_TONE(520, 0.12, 'sine', 0.04, 680);
    await jgSleep(cfg.show); if (!alive(tok)) return;
    st.cards.forEach((c) => c.el.classList.remove('flip')); JG_TONE(330, 0.1, 'triangle', 0.03); await jgSleep(520); if (!alive(tok)) return;
    st.state = 'shuffle'; msg('Sigue con la vista', ''); await jgSleep(250);
    for (let i = 0; i < cfg.swaps; i++) { if (!(await swapOnce(cfg, tok))) return; }
    st.state = 'pick'; st.pickAt = performance.now(); msg(st.need > 1 ? `Toca las ${st.need} cartas` : '¿Dónde quedó?', st.need > 1 ? `Faltan ${st.need}` : ''); JG_TONE(600, 0.08, 'sine', 0.03);
    const pl = $('#mcTable .mc-card'); try { pl && pl.focus({ preventScroll: true }); } catch { /* */ }
  };
  const pick = async (card) => {
    if (st.state !== 'pick' || card.done) return; card.done = true; const tok = st.tok; card.el.classList.add('flip');
    if (card.t) {
      st.found++; card.el.classList.add('good'); JG_TONE(700 + st.found * 110, 0.1, 'sine', 0.05, 940 + st.found * 110); JG_VIB(8);
      if (st.found < st.need) { msg(`¡Bien!`, `Faltan ${st.need - st.found}`); return; }
      st.state = 'won'; const secs = (performance.now() - st.pickAt) / 1000; const speed = Math.round(Math.max(0, 40 * (1 - secs / (3 + st.need * 2))));
      st.streak++; st.bestStreak = Math.max(st.bestStreak, st.streak); st.cleared++;
      const pts = 50 + st.level + speed + Math.min(st.streak, 10) * 5; st.score += pts; hud(); msg(`¡Correcto! +${pts}`, st.streak >= 3 ? `Racha de ${st.streak}` : '');
      jgAnnounce(`Nivel ${st.level} superado`); JG_TONE(784, 0.12, 'sine', 0.05, 988); setTimeout(() => JG_TONE(1175, 0.14, 'triangle', 0.04), 120);
      let c = 0; if (st.cleared % 5 === 0 && st.coins < 20) c += 1; if (st.level % 25 === 0) c += 3; if (c) { st.coins += c; jgCoins(c); setTimeout(() => { msg(`¡Correcto! +${pts}`, `+${c} ${c === 1 ? 'moneda' : 'monedas'}`); JG_TONE(1318, 0.1, 'triangle', 0.045); }, 400); }
      D.lvl = Math.max(D.lvl || 1, st.level + 1); D.best = Math.max(D.best || 0, st.bestStreak); jpSave();
      await jgSleep(1100); if (!alive(tok)) return;
      if (st.level >= MC_MAX) { finish('win'); return; }
      st.level++; playLevel();
    } else {
      st.state = 'lost'; st.lives--; st.streak = 0; card.el.classList.add('bad'); JG_TONE(240, 0.22, 'sine', 0.045, 190); JG_VIB(30); lives(); msg('Ahí no estaba', 'Mira dónde estaba la carta');
      await jgSleep(450); st.cards.forEach((c) => { if (c.t) { c.el.classList.add('flip', 'show'); } });
      await jgSleep(1500); if (!alive(tok)) return;
      if (st.lives <= 0) { finish('lives'); return; }
      playLevel();
    }
  };
  const finish = (why) => {
    if (st.posted) return; st.posted = true; st.state = 'over'; st.tok++;
    const secs = Math.max(1, Math.round((Date.now() - st.t0) / 1000));
    JG_TONE(why === 'win' ? 880 : 392, 0.3, 'sine', 0.05, why === 'win' ? 1175 : 330);
    $('#mcWhy').textContent = why === 'win' ? `¡Completaste los ${MC_MAX} niveles!` : 'Se acabaron las hojas';
    $('#mcRes').innerHTML = `<div><b>${st.score}</b><small>Puntos</small></div><div><b>${st.cleared}</b><small>Niveles superados</small></div><div><b>${st.level}</b><small>Nivel alcanzado</small></div><div><b>${st.bestStreak}</b><small>Mejor racha</small></div>`;
    $('#mcCoins').textContent = st.coins ? `+${st.coins} ${st.coins === 1 ? 'moneda' : 'monedas'} para tu árbol` : ''; $('#mcRest').textContent = jgRestNote(MC.firstAt);
    $('#mcAgain').textContent = why === 'win' ? 'Jugar de nuevo' : 'Seguir';
    const o = $('#mcOver'); o.hidden = false; void o.offsetWidth; o.classList.add('show'); jgAnnounce(`Fin: ${st.score} puntos`);
    if (st.cleared > 0 && st.score > 0) jgPost({ game: 'mente', score: st.score, level: Math.min(MC_MAX, st.level), cleared: st.cleared, dur: secs }).then((rec) => { const l = $('#mcRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Hoy vas en el lugar #${rec.rankDay}`; });
  };
  const exit = (quiet) => {
    st.tok++; removeEventListener('keydown', onKey); removeEventListener('popstate', onPop); if (st.state !== 'over' && st.cleared > 0 && !st.posted) { st.posted = true; jgPost({ game: 'mente', score: st.score, level: st.level, cleared: st.cleared, dur: Math.max(1, Math.round((Date.now() - st.t0) / 1000)) }); }
    st.state = 'over'; wrap.remove(); if (!quiet) document.body.classList.remove('gm-on'); MC.run = null; if (!quiet && location.hash === '#/memoria') render();
  };
  const go = () => { if (st.state !== 'ready') return; $('#mcReady').classList.add('hide'); lives(); playLevel(); };
  const again = () => { const keep = st.level; exit(true); if (D.lvl > MC_MAX) jpData('mente').lvl = 1; mcStart(); };
  const onKey = (e) => {
    if (e.key === 'Escape') { exit(); return; }
    if (/^[1-7]$/.test(e.key) && st.state === 'pick') { const c = st.cards.find((x) => x.slot === +e.key - 1); if (c) pick(c); }
    else if ((e.key === 'Enter' || e.key === ' ') && st.state === 'ready') { e.preventDefault(); go(); }
  };
  const onPop = () => { if (MC.run) { try { history.pushState({ mcGame: true }, ''); } catch { /* */ } exit(); } };
  try { history.pushState({ mcGame: true }, ''); } catch { /* */ }
  addEventListener('keydown', onKey); addEventListener('popstate', onPop);
  $('#mcGo').addEventListener('click', go); $('#mcAgain').addEventListener('click', again);
  $('#mcDone').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; else render(); });
  $('#mcX').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; });
  lives(); hud();
}

/* ======================================================================
   Enlaza — desenreda la red moviendo los puntos
   ====================================================================== */
const EN_MAX = 500; /* 7.61: niveles 301–500, redes más grandes */
const EN = { run: null };
const enLvl = () => Math.min(EN_MAX, Math.max(1, jpData('enlaza').lvl || 1));
const enRng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function enCross(p1, p2, p3, p4) {
  const d = (a, b, c) => (c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0]);
  const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}
function enMake(level) {
  const n = level <= 300 ? 5 + Math.floor(((level - 1) * 23) / 299) : Math.min(36, 28 + Math.floor((level - 300) / 25)); const m0 = Math.round(n * (1.2 + 0.7 * Math.min(1.2, level / 300)));
  const r = enRng(level * 977 + 13); const sol = [];
  for (let i = 0; i < n; i++) { let p, g = 0; do { p = [60 + r() * 880, 60 + r() * 880]; g++; } while (g < 40 && sol.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 900 / Math.sqrt(n) * 0.62)); sol.push(p); }
  const cand = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) cand.push([i, j, Math.hypot(sol[i][0] - sol[j][0], sol[i][1] - sol[j][1])]);
  cand.sort((a, b) => a[2] - b[2]); const edges = [];
  for (const [i, j] of cand) { if (edges.length >= m0) break; if (edges.some(([a, b]) => a !== i && a !== j && b !== i && b !== j && enCross(sol[a], sol[b], sol[i], sol[j]))) continue; edges.push([i, j]); }
  const deg = new Array(n).fill(0); edges.forEach(([a, b]) => { deg[a]++; deg[b]++; });
  const pos = sol.map(() => [0, 0]); let tries = 0, ok = false;
  while (!ok && tries++ < 40) {
    const ord = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; }
    ord.forEach((id, k) => { const a = (k / n) * Math.PI * 2 - Math.PI / 2; pos[id] = [500 + Math.cos(a) * 400, 500 + Math.sin(a) * 400]; });
    let c = 0; for (let a = 0; a < edges.length; a++) for (let b = a + 1; b < edges.length; b++) { const [i, j] = edges[a], [k, l] = edges[b]; if (i === k || i === l || j === k || j === l) continue; if (enCross(pos[i], pos[j], pos[k], pos[l])) c++; }
    ok = c >= Math.max(2, Math.floor(edges.length / 4));
  }
  return { n, edges, sol, pos };
}
function enCount(pos, edges) {
  const bad = new Set(); let c = 0;
  for (let a = 0; a < edges.length; a++) for (let b = a + 1; b < edges.length; b++) { const [i, j] = edges[a], [k, l] = edges[b]; if (i === k || i === l || j === k || j === l) continue; if (enCross(pos[i], pos[j], pos[k], pos[l])) { c++; bad.add(a); bad.add(b); } }
  return { c, bad };
}
function enHero() {
  return `<svg viewBox="0 0 360 170" aria-hidden="true"><defs><linearGradient id="enhS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17323F"/><stop offset="1" stop-color="#3B7A6C"/></linearGradient></defs><rect width="360" height="170" rx="20" fill="url(#enhS)"/>
    <g stroke="#9BE0BE" stroke-width="3" stroke-linecap="round" opacity=".85"><path d="M70 120L130 50L210 110L290 44M130 50L180 138M210 110L290 126M70 120L180 138"/></g>
    <g fill="#EAF6EE"><circle cx="70" cy="120" r="10"/><circle cx="130" cy="50" r="10"/><circle cx="210" cy="110" r="10"/><circle cx="290" cy="44" r="10"/><circle cx="180" cy="138" r="10"/><circle cx="290" cy="126" r="10"/></g></svg>`;
}
function viewEnlaza() {
  const lv = enLvl(), D = jpData('enlaza'); const done = Object.values(D.st || {}).filter((v) => v > 0).length;
  return `<section class="mt-home"><div class="gm-hero">${enHero()}</div><h1 class="page-title gm-title">Enlaza</h1>
    <p class="page-sub">Los puntos están enredados. Arrástralos para que ninguna línea cruce a otra. Sin tiempo y sin prisa: <b>${EN_MAX} niveles</b> que empiezan fáciles y se van complicando.</p>
    <div class="jg-prog" role="img" aria-label="Avance: nivel ${lv} de ${EN_MAX}"><i style="width:${Math.min(100, ((lv - 1) / EN_MAX) * 100)}%"></i></div>
    <p class="small muted" style="text-align:center;margin:8px 0 14px">${lv > EN_MAX ? `¡Desenredaste los ${EN_MAX} niveles!` : `Vas en el nivel <b>${lv}</b> de ${EN_MAX}`}${done ? ` · niveles resueltos: <b>${done}</b>` : ''}</p>
    <button class="btn primary block gm-play" data-act="en-start">${icon('play')}${lv > 1 ? `Continuar · nivel ${Math.min(lv, EN_MAX)}` : 'Empezar'}</button>
    ${lv > 1 ? `<button class="btn block" style="margin-top:8px" data-act="en-start" data-from="1">Empezar desde el nivel 1</button>` : ''}
    <a class="btn block" href="#/skins" style="margin-top:8px" data-skin="n">${icon('star', 'sm')}Skins de puntos</a>
    <p class="small muted" style="text-align:center;margin-top:10px">Ganas monedas al resolver niveles. Las estrellas dependen de cuántos movimientos usas.</p>
    <div id="jgRank-enlaza">${jgRankHTML('enlaza')}</div><p id="jgLive" class="sr-only" aria-live="polite"></p></section>`;
}
function enStart(from) {
  if (EN.run) return;
  const sk = enCurSkin(); const D = jpData('enlaza');
  const wrap = document.createElement('div'); wrap.className = 'gl-stage mt-stage en-stage';
  const orbs = Array.from({ length: 7 }, (_, i) => `<i class="mt-orb" style="--x:${(i * 41 + 10) % 100}%;--y:${(i * 59 + 8) % 100}%;--s:${70 + (i * 31) % 110}px;--d:${18 + (i * 5) % 12}s;--l:${-i * 3}s"></i>`).join('');
  wrap.innerHTML = `<div class="mt-bg" aria-hidden="true">${orbs}</div>
    <button class="gm-x gl-x" id="enX" aria-label="Salir del juego">${icon('x')}</button>
    <div class="mt-top"><div class="mt-stat l"><small>Cruces</small><b id="enCross">0</b></div><div class="mt-stat"><small>Movimientos</small><b id="enMoves">0</b></div><div class="mt-stat"><small>Nivel</small><b id="enLvl">1</b></div></div>
    <div class="en-main"><div class="mc-msg" id="enMsg" aria-live="polite"></div><svg class="en-svg" id="enSvg" viewBox="0 0 1000 1000" role="img" aria-label="Red de puntos para desenredar"></svg>
      <div class="en-tools"><button class="btn" id="enHint">${icon('bulb', 'sm')}Pista</button><button class="btn" id="enReset">${icon('reset', 'sm')}Reiniciar</button></div></div>
    <div class="gl-over mt-over en-win" id="enOver" hidden><b id="enWhy">¡Desenredado!</b><div id="enStars"></div><div class="mt-res" id="enRes"></div><span id="enCoins" class="pm-gain"></span><span class="small muted" id="enRank"></span><span class="small muted" id="enRest"></span>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" id="enNext">Siguiente nivel</button><button class="btn" id="enDone">Volver a Juegos</button></div></div>`;
  document.body.appendChild(wrap); document.body.classList.add('gm-on');
  const $ = (s) => wrap.querySelector(s); const svg = $('#enSvg');
  const st = { level: from ? 1 : enLvl(), score: 0, cleared: 0, coins: 0, t0: Date.now(), lvT0: Date.now(), moves: 0, hint: 0, data: null, pos: [], drag: -1, done: false, posted: false, over: false, pend: 0 };
  EN.run = st; EN.firstAt = EN.firstAt || Date.now();
  const defs = () => { const id = 'enG'; return `<defs><radialGradient id="${id}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${sk.rainbow ? '#ffc2e0' : sk.a}"/><stop offset="1" stop-color="${sk.rainbow ? '#7ab8ff' : sk.b}"/></radialGradient>${sk.glow ? `<filter id="enGl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : ''}</defs>`; };
  const shapePath = (x, y, r) => {
    if (sk.shape === 'd') return `M${x} ${y - r * 1.15}L${x + r} ${y}L${x} ${y + r * 1.15}L${x - r} ${y}Z`;
    if (sk.shape === 'h') return 'M' + Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 3 * i + Math.PI / 6; return `${(x + Math.cos(a) * r * 1.08).toFixed(1)} ${(y + Math.sin(a) * r * 1.08).toFixed(1)}`; }).join('L') + 'Z';
    if (sk.shape === 's') return 'M' + Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (Math.PI / 5) * i, rr = i % 2 ? r * 0.5 : r * 1.2; return `${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`; }).join('L') + 'Z';
    return `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  };
  const draw = () => {
    const { n, edges } = st.data; const { bad } = enCount(st.pos, edges);
    let h = defs() + `<g class="en-edges">`;
    edges.forEach(([a, b], k) => { h += `<line x1="${st.pos[a][0]}" y1="${st.pos[a][1]}" x2="${st.pos[b][0]}" y2="${st.pos[b][1]}" class="${bad.has(k) ? 'bad' : ''}" stroke="${bad.has(k) ? '#E8745F' : sk.edge}"/>`; });
    h += `</g><g class="en-nodes${sk.rainbow ? ' rb' : ''}${sk.pulse ? ' pu' : ''}">`;
    for (let i = 0; i < n; i++) h += `<path d="${shapePath(st.pos[i][0], st.pos[i][1], 26)}" fill="url(#enG)" stroke="rgba(255,255,255,.75)" stroke-width="3" ${sk.glow ? 'filter="url(#enGl)"' : ''} class="en-n${st.drag === i ? ' drag' : ''}" data-i="${i}"/><circle cx="${st.pos[i][0]}" cy="${st.pos[i][1]}" r="46" fill="transparent" data-i="${i}" class="en-hit"/>`;
    svg.innerHTML = h + '</g>';
    const c = bad.size ? enCount(st.pos, edges).c : 0; $('#enCross').textContent = c; wrap.classList.toggle('calm', c === 0);
    return c;
  };
  const level = () => {
    st.data = enMake(st.level); st.pos = st.data.pos.map((p) => p.slice()); st.moves = 0; st.hint = 0; st.done = false; st.lvT0 = Date.now(); st.drag = -1;
    $('#enLvl').textContent = st.level; $('#enMoves').textContent = 0; $('#enMsg').textContent = `Nivel ${st.level}`; $('#enOver').classList.remove('show'); $('#enOver').hidden = true; draw();
    setTimeout(() => { if (EN.run === st && !st.done) $('#enMsg').textContent = 'Arrastra los puntos'; }, 1600);
  };
  const svgPt = (e) => { const r = svg.getBoundingClientRect(); const k = 1000 / Math.max(r.width, 1); return [Math.max(30, Math.min(970, (e.clientX - r.left) * k)), Math.max(30, Math.min(970, (e.clientY - r.top) * k))]; };
  svg.addEventListener('pointerdown', (e) => { const t = e.target.closest('[data-i]'); if (!t || st.done) return; e.preventDefault(); st.drag = +t.dataset.i; st.dragMoved = false; try { svg.setPointerCapture(e.pointerId); } catch { /* */ } JG_TONE(420, 0.05, 'sine', 0.025); draw(); });
  svg.addEventListener('pointermove', (e) => { if (st.drag < 0) return; e.preventDefault(); st.pos[st.drag] = svgPt(e); st.dragMoved = true; draw(); });
  const drop = (e) => {
    if (st.drag < 0) return; const i = st.drag; st.drag = -1; if (st.dragMoved) { st.moves++; $('#enMoves').textContent = st.moves; JG_TONE(520, 0.06, 'sine', 0.03); }
    const c = draw(); if (c === 0 && st.dragMoved) win();
  };
  svg.addEventListener('pointerup', drop); svg.addEventListener('pointercancel', drop);
  const win = () => {
    if (st.done) return; st.done = true; const n = st.data.n, mv = st.moves;
    const stars = st.hint ? 1 : mv <= n * 1.3 ? 3 : mv <= n * 2.6 ? 2 : 1;
    const pts = 60 + st.level * 2 + stars * 20; st.score += pts; st.cleared++;
    const first = !((D.st || {})[st.level] > 0); D.st ||= {}; D.st[st.level] = Math.max(D.st[st.level] || 0, stars); D.lvl = Math.max(D.lvl || 1, st.level + 1);
    let c = 0; if (first) { if (st.cleared % 2 === 0 && st.coins < 15) c += 1; if (st.level % 20 === 0) c += 3; if (stars === 3 && st.coins < 15) c += 1; } if (c) { st.coins += c; jgCoins(c); } jpSave();
    JG_TONE(660, 0.14, 'sine', 0.05, 880); setTimeout(() => JG_TONE(988, 0.16, 'triangle', 0.045, 1318), 130); JG_VIB(12);
    const secs = Math.round((Date.now() - st.lvT0) / 1000);
    $('#enWhy').textContent = st.level >= EN_MAX ? `¡Desenredaste los ${EN_MAX} niveles!` : `Nivel ${st.level} resuelto`; $('#enStars').innerHTML = jgStarsHTML(stars);
    $('#enRes').innerHTML = `<div><b>${mv}</b><small>Movimientos</small></div><div><b>+${pts}</b><small>Puntos</small></div><div><b>${st.score}</b><small>Total</small></div>`;
    $('#enCoins').textContent = c ? `+${c} ${c === 1 ? 'moneda' : 'monedas'} para tu árbol` : ''; $('#enRest').textContent = jgRestNote(EN.firstAt);
    $('#enNext').textContent = st.level >= EN_MAX ? 'Jugar de nuevo' : 'Siguiente nivel'; jgAnnounce(`Nivel ${st.level} resuelto con ${stars} estrellas`);
    setTimeout(() => { if (EN.run !== st) return; const o = $('#enOver'); o.hidden = false; void o.offsetWidth; o.classList.add('show'); }, 500);
    if (st.cleared % 5 === 0) post();
  };
  const post = () => { if (st.cleared < 1 || st.pend === st.cleared) return; st.pend = st.cleared; jgPost({ game: 'enlaza', score: st.score, level: Math.min(EN_MAX, st.level), cleared: st.cleared, dur: Math.max(1, Math.round((Date.now() - st.t0) / 1000)) }).then((rec) => { const l = $('#enRank'); if (rec && l && wrap.isConnected && rec.rankDay) l.textContent = `Hoy vas en el lugar #${rec.rankDay}`; }); };
  $('#enNext').addEventListener('click', () => { if (st.level >= EN_MAX) { st.level = 1; } else st.level++; level(); });
  $('#enHint').addEventListener('click', () => {
    if (st.done) return; const { edges, sol } = st.data; const { bad } = enCount(st.pos, edges); const cnt = new Array(st.data.n).fill(0); bad.forEach((k) => { cnt[edges[k][0]]++; cnt[edges[k][1]]++; });
    let b = 0; cnt.forEach((v, i) => { if (v > cnt[b]) b = i; }); if (cnt[b] === 0) { $('#enMsg').textContent = 'No hay cruces: ¡ya casi!'; return; }
    st.hint++; st.pos[b] = sol[b].slice(); JG_TONE(760, 0.12, 'sine', 0.04); $('#enMsg').textContent = 'Un punto ya está en su lugar'; const c = draw(); if (c === 0) win();
  });
  $('#enReset').addEventListener('click', () => { if (st.done) return; st.pos = st.data.pos.map((p) => p.slice()); st.moves = 0; $('#enMoves').textContent = 0; draw(); });
  const exit = (quiet) => { removeEventListener('keydown', onKey); removeEventListener('popstate', onPop); post(); st.over = true; wrap.remove(); if (!quiet) document.body.classList.remove('gm-on'); EN.run = null; if (!quiet && location.hash === '#/enlaza') render(); };
  const onKey = (e) => { if (e.key === 'Escape') exit(); };
  const onPop = () => { if (EN.run) { try { history.pushState({ enGame: true }, ''); } catch { /* */ } exit(); } };
  try { history.pushState({ enGame: true }, ''); } catch { /* */ }
  addEventListener('keydown', onKey); addEventListener('popstate', onPop);
  $('#enDone').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; else render(); });
  $('#enX').addEventListener('click', () => { exit(); if (location.hash !== '#/juegos') location.hash = '#/juegos'; });
  level();
}

Object.assign(VIDA_ACTS, {
  'mc-start': (el) => mcStart(!!(el && el.dataset && el.dataset.from)),
  'en-start': (el) => enStart(!!(el && el.dataset && el.dataset.from)),
});
EXTRA_VIEWS.memoria = viewMemoria; EXTRA_VIEWS.enlaza = viewEnlaza; EXTRA_NAV.memoria = 'juegos'; EXTRA_NAV.enlaza = 'juegos';
/* acceso a las skins del uniforme desde Pelotón */
{
  const bp = viewPeloton;
  viewPeloton = function () { return bp().replace(/(<button class="btn primary block gm-play" data-act="pm-start">[^]*?<\/button>)/, `$1<a class="btn block" href="#/skins" style="margin-top:8px" data-skin="r">${icon('star', 'sm')}Skins de uniforme</a>`); };
  EXTRA_VIEWS.peloton = viewPeloton;
}
/* el enlace "Skins de ..." abre directo la pestaña del juego */
document.addEventListener('click', (e) => { const a = e.target.closest('a[data-skin]'); if (a && typeof SKN !== 'undefined') SKN.tab = a.dataset.skin; }, true);
