/* Cinnavia 7.27 — Skins de canastas (Cosecha) y de caballos (Galope). Se compran con las monedas del árbol;
   empiezan baratas y las últimas son carísimas. Solo cambian el aspecto, no el juego. */
'use strict';
/* id, nombre, precio, descripción, parámetros */
const SK_BASKETS = [
  ['mimbre', 'Mimbre clásico', 0, 'La canasta de siempre.', {}],
  ['rosa', 'Rosa pastel', 40, 'Franjas suaves de algodón.', { a: '#F5C6D6', b: '#D98BA6', rim: '#F0A9C0', handle: '#C16F8C', pat: 'stripes', pc: 'rgba(255,255,255,.45)' }],
  ['marino', 'Azul marino', 90, 'Rayas de marinero.', { a: '#4F7DB8', b: '#27456F', rim: '#8FB1DC', handle: '#1E3558', pat: 'stripes', pc: 'rgba(255,255,255,.5)' }],
  ['bosque', 'Bosque', 160, 'Trenzado verde oscuro con hojas.', { a: '#5E9A5A', b: '#2E5E3A', rim: '#7FBE74', handle: '#244A2E', pat: 'weave', pc: 'rgba(10,40,20,.5)' }],
  ['cuero', 'Cuero cosido', 280, 'Piel curtida con costuras.', { a: '#B5733E', b: '#6E3F1E', rim: '#8C5328', handle: '#4E2B12', pat: 'stitch', pc: '#F5DDB0' }],
  ['marmol', 'Mármol', 450, 'Piedra blanca con vetas.', { a: '#FBFBFD', b: '#C9CFD8', rim: '#E4E8EE', handle: '#9AA3B2', pat: 'marble', pc: 'rgba(120,130,150,.55)' }],
  ['plata', 'Plata pulida', 700, 'Metal con un destello que viaja.', { a: '#F2F4F7', b: '#8E98A8', rim: '#C9D0DB', handle: '#6E7888', pat: 'sheen', metal: 1 }],
  ['cobre', 'Cobre martillado', 1000, 'Golpes de martillo y brillo cálido.', { a: '#F0A074', b: '#A24E26', rim: '#D07B4A', handle: '#7B3414', pat: 'hammer', pc: 'rgba(255,230,200,.35)', metal: 1 }],
  ['oro', 'Oro macizo', 1500, 'Oro con destellos y halo.', { a: '#FFF0A8', b: '#C9921F', rim: '#F5C842', handle: '#A67410', pat: 'sheen', metal: 1, glow: '#FFD75A', spark: '#FFFFFF' }],
  ['oceano', 'Océano', 2300, 'Olas que se mueven.', { a: '#7FD4EE', b: '#1C6FA8', rim: '#A8E6F5', handle: '#14507E', pat: 'waves', pc: 'rgba(255,255,255,.55)', glow: '#6FD0F0' }],
  ['hielo', 'Cristal de hielo', 3400, 'Facetas heladas que centellean.', { a: '#F2FCFF', b: '#7EC8EE', rim: '#CDEFFF', handle: '#5AA6D0', pat: 'facets', pc: 'rgba(255,255,255,.7)', glow: '#BEE6FF', spark: '#FFFFFF' }],
  ['rubi', 'Rubí imperial', 5000, 'Gema tallada con luz interior.', { a: '#FF8FA8', b: '#8A0A2A', rim: '#E0194A', handle: '#5E0620', pat: 'facets', pc: 'rgba(255,230,235,.5)', glow: '#FF4D78', spark: '#FFD0DA' }],
  ['esmeralda', 'Esmeralda real', 7500, 'Verde profundo con corona dorada.', { a: '#7DF0AC', b: '#0A6B3A', rim: '#F5C842', handle: '#C9921F', pat: 'facets', pc: 'rgba(220,255,235,.5)', glow: '#3DE08C', spark: '#E4FFEF' }],
  ['fuego', 'Brasa viva', 11000, 'Llamas reales que lamen la canasta.', { a: '#FFD84A', b: '#C2250A', rim: '#FF8A1F', handle: '#8A1A04', pat: 'fire', glow: '#FF7A1F', spark: '#FFE8A0' }],
  ['galaxia', 'Galaxia', 16000, 'Un trozo del cosmos con estrellas.', { a: '#6B4BE8', b: '#150A52', rim: '#C58BFF', handle: '#3A1E9C', pat: 'stars', glow: '#8A6BFF', spark: '#FFFFFF' }],
  ['celestial', 'Arcoíris celestial', 22000, 'Alas de luz, arcoíris vivo y destellos.', { a: '#FFFFFF', b: '#E8D0FF', rim: 'rainbow', handle: 'rainbow', pat: 'rainbow', glow: '#FFFFFF', spark: '#FFFFFF', wings: 1 }],
];
const SK_HORSES = [
  ['castano', 'Castaño', 0, 'El caballo de la pradera.', {}],
  ['alazan', 'Alazán', 40, 'Pelaje cobrizo y crin oscura.', { coat: '#B5622A', coat2: '#8A4619', hi: '#D2803F', mane: '#4A2410' }],
  ['negro', 'Negro azabache', 90, 'Brillante como la noche.', { coat: '#1F1D25', coat2: '#121017', hi: '#3A3744', mane: '#0A0910', eye: '#E8E4FF' }],
  ['blanco', 'Blanco nieve', 160, 'Elegante y luminoso.', { coat: '#E9E6E0', coat2: '#C9C5BC', hi: '#FFFFFF', mane: '#A7A39A', hoof: '#6B655A' }],
  ['palomino', 'Palomino', 280, 'Dorado con crin clara.', { coat: '#D9A845', coat2: '#B58528', hi: '#F0C766', mane: '#F4EBD0', blaze: '#FFF8E4' }],
  ['pinto', 'Pinto', 450, 'Manchas blancas sobre café.', { coat: '#7A4526', coat2: '#5A3118', hi: '#9A5E36', mane: '#2B1A0E', pat: 'patches', pc: '#FBF6EC', sock: '#FBF6EC' }],
  ['appaloosa', 'Appaloosa', 700, 'Cubierto de motas oscuras.', { coat: '#EDE4D2', coat2: '#CFC3AA', hi: '#FFFAF0', mane: '#6B5A44', pat: 'spots', pc: '#5A4630' }],
  ['pomelado', 'Gris pomelado', 1000, 'Anillos de plata sobre gris.', { coat: '#8E959F', coat2: '#6B727C', hi: '#B5BCC6', mane: '#3E434B', pat: 'dapple', pc: '#EDEFF3', sock: '#4A4F57' }],
  ['cebra', 'Rayado de sabana', 1500, 'Rayas como una cebra.', { coat: '#F4F1EA', coat2: '#D5D0C4', hi: '#FFFFFF', mane: '#16141A', pat: 'stripes', pc: '#1B1A20', hoof: '#16141A' }],
  ['andaluz', 'Andaluz de oro', 2300, 'Pelaje metálico con reflejos.', { coat: '#E0A92B', coat2: '#B07A12', hi: '#FFE488', mane: ['#FFF6C9', '#F5C842', '#B88A12'], pat: 'sheen', hoof: '#5A3A08', spark: '#FFF6C9' }],
  ['escarcha', 'Escarcha', 3400, 'Cubierto de cristales de hielo.', { coat: '#BFE4F7', coat2: '#8CC4E4', hi: '#F2FCFF', mane: ['#FFFFFF', '#BEE6FF', '#6FB4E8'], pat: 'frost', hoof: '#5C86A8', spark: '#FFFFFF', aura: '#BEE6FF', eye: '#1A5C8C' }],
  ['unicornio', 'Unicornio', 5000, 'Cuerno de luz y crin de arcoíris.', { coat: '#FBF4FF', coat2: '#E3D3F0', hi: '#FFFFFF', mane: ['#FF7AA8', '#FFC24A', '#7DF0AC', '#5CB8FF', '#B07AFF'], horn: ['#FFF3B0', '#F5C842'], hoof: '#C8A0E0', spark: '#FFFFFF', eye: '#8A3FE0' }],
  ['fantasma', 'Corcel fantasma', 7500, 'Translúcido, con un aura azul.', { coat: '#9FD4F5', coat2: '#6FA8D8', hi: '#D8F0FF', mane: ['#E8FBFF', '#7DD3F5', '#3A7BD0'], alpha: 0.72, aura: '#7DD3F5', hoof: '#4A7CA8', eye: '#FFFFFF', spark: '#D8F8FF' }],
  ['fenix', 'Fénix', 11000, 'Alas y crin de fuego real.', { coat: '#C2250A', coat2: '#8A1204', hi: '#FF7A1F', mane: ['#FFF1A8', '#FF8A1F', '#D23A0A'], wings: ['#FFD84A', '#FF4A12'], flame: 1, pat: 'fire', aura: '#FF7A1F', hoof: '#2A0A04', spark: '#FFE08A', eye: '#FFF1A8' }],
  ['pegaso', 'Pegaso', 16000, 'Alas de plumas blancas y halo.', { coat: '#F6F3EE', coat2: '#D8D3C8', hi: '#FFFFFF', mane: ['#FFFFFF', '#DDEBFF', '#9FC4F0'], wings: ['#FFFFFF', '#B8D4F5'], aura: '#FFFFFF', hoof: '#B8C4D6', spark: '#FFFFFF', eye: '#2F62E8' }],
  ['cosmico', 'Alicornio estelar', 22000, 'Galaxia con alas, cuerno y aura.', { coat: '#2A1A7A', coat2: '#150A52', hi: '#6B4BE8', mane: ['#FF7AF0', '#8A6BFF', '#5CE0FF'], pat: 'stars', wings: ['#C58BFF', '#3FC8FF'], horn: ['#FFFFFF', '#FFD84A'], aura: '#8A6BFF', hoof: '#0A0630', spark: '#FFFFFF', eye: '#FFFFFF', sock: '#8A6BFF' }],
];
const skList = (t) => (t === 'b' ? SK_BASKETS : SK_HORSES);
const skFind = (t, id) => skList(t).find((x) => x[0] === id) || skList(t)[0];
const skKey = (t, id) => `sk:${t}_${id}`;
const skOwned = (t, id) => skFind(t, id)[2] === 0 || (typeof shopOwns === 'function' && shopOwns(skKey(t, id)));
function skEq(t) { try { const id = (vidaData().skins || {})[t]; return id && skOwned(t, id) ? id : skList(t)[0][0]; } catch { return skList(t)[0][0]; } }
const glSkinCur = () => skFind('h', skEq('h'))[4];
const gmSkinCur = () => skFind('b', skEq('b'))[4];
{
  const basePrice = priceOf; priceOf = function (key) { if (key.startsWith('sk:')) { const [, t, id] = key.match(/^sk:([bh])_(.+)$/) || []; return t ? skFind(t, id)[2] : 0; } return basePrice(key); };
  const baseName = nameOf; nameOf = function (key) { if (key.startsWith('sk:')) { const [, t, id] = key.match(/^sk:([bh])_(.+)$/) || []; return t ? (t === 'b' ? 'Canasta ' : 'Caballo ') + skFind(t, id)[1] : key; } return baseName(key); };
}

/* ---------- la canasta ---------- */
const gmBasketBase = gmBasket;
function skRainbow(g, x0, y0, x1, y1, now) { const lg = g.createLinearGradient(x0, y0, x1, y1); for (let i = 0; i <= 6; i++) lg.addColorStop(i / 6, `hsl(${(i * 60 + now / 12) % 360},85%,62%)`); return lg; }
gmBasket = function (g, x, y, w, sq, skin) {
  const SK = skin || gmSkinCur(); if (!SK || !SK.a) return gmBasketBase(g, x, y, w, sq);
  const now = performance.now(), h = w * 0.42 * (1 - sq * 0.12), ww = w * (1 + sq * 0.08);
  g.save(); g.translate(x, y);
  g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.ellipse(0, h + 6, ww * 0.55, 7, 0, 0, 7); g.fill();
  if (SK.wings) { for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { const fl = Math.sin(now / 260 + i * 0.4) * 0.07; g.save(); g.translate(sd * ww * 0.46, h * 0.1); g.rotate(sd * (0.35 + i * 0.26 + fl)); g.rotate(-Math.PI / 2 * sd + (sd > 0 ? 0 : 0)); const L = ww * (0.62 - i * 0.07); const lg = g.createLinearGradient(0, 0, L, 0); lg.addColorStop(0, `hsla(${(i * 50 + now / 14) % 360},90%,82%,.95)`); lg.addColorStop(1, `hsla(${(i * 50 + 80 + now / 14) % 360},90%,70%,.05)`); g.fillStyle = lg; g.scale(sd, 1); g.rotate(sd > 0 ? 0 : 0); g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(L * 0.3, -L * 0.2, L * 0.8, -L * 0.18, L, 0); g.bezierCurveTo(L * 0.8, L * 0.14, L * 0.3, L * 0.16, 0, 0); g.fill(); g.restore(); } }
  if (SK.glow) { const hl = g.createRadialGradient(0, h * 0.4, ww * 0.1, 0, h * 0.4, ww * 0.95); hl.addColorStop(0, SK.glow + '88'); hl.addColorStop(1, SK.glow + '00'); g.globalAlpha = 0.7 + 0.3 * Math.sin(now / 300); g.fillStyle = hl; g.beginPath(); g.arc(0, h * 0.4, ww * 0.95, 0, 7); g.fill(); g.globalAlpha = 1; }
  g.strokeStyle = SK.handle === 'rainbow' ? skRainbow(g, -ww / 2, 0, ww / 2, 0, now) : SK.handle; g.lineWidth = 4.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(-ww * 0.42, 0); g.bezierCurveTo(-ww * 0.4, -h * 1.2, ww * 0.4, -h * 1.2, ww * 0.42, 0); g.stroke();
  const body = new Path2D(); body.moveTo(-ww / 2, 0); body.lineTo(ww / 2, 0); body.lineTo(ww * 0.38, h); body.quadraticCurveTo(0, h + 5, -ww * 0.38, h); body.closePath();
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, SK.a); gr.addColorStop(1, SK.b); g.fillStyle = gr; g.fill(body);
  g.save(); g.clip(body); const pc = SK.pc || 'rgba(110,70,30,.5)', P = SK.pat;
  if (P === 'stripes') { g.strokeStyle = pc; g.lineWidth = ww / 14; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo((ww / 8) * i, 0); g.lineTo((ww / 8) * i * 0.76, h); g.stroke(); } }
  else if (P === 'weave') { g.strokeStyle = pc; g.lineWidth = 1.6; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(-ww / 2, (h * i) / 4); g.lineTo(ww / 2, (h * i) / 4); g.stroke(); } for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo((ww / 7) * i, 0); g.lineTo((ww / 7) * i * 0.76, h); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.28)'; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * ww * 0.18, h * 0.5, 4, 8, 0.5, 0, 7); g.fill(); } }
  else if (P === 'stitch') { g.strokeStyle = pc; g.lineWidth = 1.6; g.setLineDash([4, 3]); for (const f of [0.18, 0.82]) { g.beginPath(); g.moveTo(-ww / 2, h * f); g.lineTo(ww / 2, h * f); g.stroke(); } g.setLineDash([]); g.strokeStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, h); g.stroke(); }
  else if (P === 'marble') { g.strokeStyle = pc; g.lineWidth = 1.3; for (const [a1, b1, c1, d1] of [[-0.4, 0, -0.1, 0.5], [0.1, 0, 0.35, 0.6], [-0.2, 0.5, 0.3, 1], [0.3, 0.2, 0.0, 0.9]]) { g.beginPath(); g.moveTo(a1 * ww, h * b1); g.bezierCurveTo((a1 + 0.2) * ww, h * 0.3, (c1 - 0.2) * ww, h * 0.6, c1 * ww, h * d1); g.stroke(); } }
  else if (P === 'sheen') { const sh = ((now / 9) % (ww * 2.4)) - ww * 0.7; const lg = g.createLinearGradient(sh - 22, 0, sh + 22, h); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,.75)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.fillRect(-ww / 2, 0, ww, h); }
  else if (P === 'hammer') { g.fillStyle = pc; for (let r = 0; r < 4; r++) for (let c2 = -3; c2 <= 3; c2++) { g.beginPath(); g.arc(c2 * ww * 0.14 + (r % 2) * ww * 0.07, h * (0.14 + r * 0.24), 4, 0, 7); g.fill(); } }
  else if (P === 'waves') { g.strokeStyle = pc; g.lineWidth = 2; for (let r = 1; r < 5; r++) { g.beginPath(); for (let px = -ww / 2; px <= ww / 2; px += 4) { const py = (h * r) / 5 + Math.sin(px / 9 + now / 260 + r) * 2.6; px === -ww / 2 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); } }
  else if (P === 'facets') { g.strokeStyle = pc; g.lineWidth = 1.2; g.beginPath(); for (let i = -3; i <= 3; i++) { g.moveTo(i * ww * 0.14, 0); g.lineTo(i * ww * 0.14 * 0.55 + ww * 0.08, h); g.moveTo(i * ww * 0.14, 0); g.lineTo(i * ww * 0.14 * 0.55 - ww * 0.08, h); } g.moveTo(-ww / 2, h * 0.5); g.lineTo(ww / 2, h * 0.5); g.stroke(); g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.moveTo(-ww / 2, 0); g.lineTo(-ww * 0.1, 0); g.lineTo(-ww * 0.3, h); g.lineTo(-ww * 0.38, h); g.fill(); }
  else if (P === 'fire') { for (let k = -4; k <= 4; k++) { const f = Math.sin(now / 110 + k * 1.3) * 3, bx = k * ww * 0.115; g.fillStyle = k % 2 ? 'rgba(255,236,140,.75)' : 'rgba(255,150,40,.7)'; g.beginPath(); g.moveTo(bx - 6, h); g.quadraticCurveTo(bx - 4, h * 0.45 + f, bx, h * 0.12 + f); g.quadraticCurveTo(bx + 4, h * 0.5, bx + 6, h); g.fill(); } }
  else if (P === 'stars') { g.fillStyle = '#fff'; for (let i = 0; i < 16; i++) { const px = (((i * 53) % 100) / 100 - 0.5) * ww * 0.9, py = (((i * 37) % 100) / 100) * h; g.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(now / 320 + i)); g.beginPath(); g.arc(px, py, 1 + (i % 3) * 0.6, 0, 7); g.fill(); } g.globalAlpha = 0.35; const nb = g.createRadialGradient(ww * 0.15, h * 0.4, 2, ww * 0.15, h * 0.4, ww * 0.4); nb.addColorStop(0, '#FF5CE8'); nb.addColorStop(1, 'rgba(255,92,232,0)'); g.fillStyle = nb; g.fillRect(-ww / 2, 0, ww, h); g.globalAlpha = 1; }
  else if (P === 'rainbow') { for (let i = 0; i < 7; i++) { g.fillStyle = `hsla(${(i * 52 + now / 14) % 360},88%,66%,.8)`; g.fillRect(-ww / 2, (h * i) / 7, ww, h / 7 + 1); } const lg = g.createLinearGradient(0, 0, 0, h); lg.addColorStop(0, 'rgba(255,255,255,.55)'); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.fillRect(-ww / 2, 0, ww, h); }
  if (SK.metal) { const lg = g.createLinearGradient(-ww / 2, 0, ww / 2, 0); lg.addColorStop(0, 'rgba(0,0,0,.18)'); lg.addColorStop(0.25, 'rgba(255,255,255,.28)'); lg.addColorStop(0.55, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = lg; g.fillRect(-ww / 2, 0, ww, h); }
  g.restore();
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1; g.stroke(body);
  g.fillStyle = SK.rim === 'rainbow' ? skRainbow(g, -ww / 2, 0, ww / 2, 0, now) : SK.rim; g.beginPath(); g.roundRect(-ww / 2 - 3, -4, ww + 6, 8, 3); g.fill(); g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 1.2; g.stroke(); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-ww / 2, -3, ww, 2);
  if (SK.spark) { g.fillStyle = SK.spark; for (let k = 0; k < 4; k++) { const t = (now / 1100 + k * 0.27) % 1, px = (((k * 61) % 100) / 100 - 0.5) * ww, py = h * 0.9 - t * (h + 24), s2 = 2.2 + (k % 3); g.globalAlpha = Math.sin(t * Math.PI); g.beginPath(); g.moveTo(px, py - s2 * 1.6); g.lineTo(px + s2 * 0.5, py - s2 * 0.5); g.lineTo(px + s2 * 1.6, py); g.lineTo(px + s2 * 0.5, py + s2 * 0.5); g.lineTo(px, py + s2 * 1.6); g.lineTo(px - s2 * 0.5, py + s2 * 0.5); g.lineTo(px - s2 * 1.6, py); g.lineTo(px - s2 * 0.5, py - s2 * 0.5); g.closePath(); g.fill(); } g.globalAlpha = 1; }
  g.restore();
};

/* ---------- tienda ---------- */
const SKN = { tab: 'b', img: {} };
function skPreview(t, id) {
  const k = t + id; if (SKN.img[k]) return SKN.img[k];
  try {
    const c = document.createElement('canvas'); const W = 220, H = 150; c.width = W * 2; c.height = H * 2; const g = c.getContext('2d'); g.scale(2, 2);
    const bgc = g.createLinearGradient(0, 0, 0, H); bgc.addColorStop(0, '#CFE6F5'); bgc.addColorStop(1, '#F6EBD3'); g.fillStyle = bgc; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(126,164,150,.55)'; g.beginPath(); g.moveTo(0, 100); for (let x = 0; x <= W; x += 40) g.lineTo(x, 82 - Math.sin(x * 0.04) * 14); g.lineTo(W, H); g.lineTo(0, H); g.fill(); g.fillStyle = '#9DC193'; g.fillRect(0, 112, W, 40);
    const P = skFind(t, id)[4];
    if (t === 'b') gmBasket(g, W / 2, 62, 118, 0, P);
    else { g.save(); g.translate(W / 2 - 6, 40); g.scale(1.3, 1.3); glDrawHorse(g, 0, 70, 0.1, false, 0, false, P); g.restore(); }
    SKN.img[k] = c.toDataURL('image/png');
  } catch { SKN.img[k] = ''; }
  return SKN.img[k];
}
function skCard(t, e) {
  const [id, name, price, desc] = e; const own = skOwned(t, id), on = skEq(t) === id; const bal = coins();
  const btn = on ? '<span class="sh-chip on">Puesta</span>' : own ? `<button class="btn primary" data-act="sk-eq" data-t="${t}" data-id="${id}">Usar</button>` : `<button class="btn ${bal >= price ? 'primary' : ''}" data-act="sk-buy" data-t="${t}" data-id="${id}">${coinSVG('sm')}${price.toLocaleString('es-MX')}</button>`;
  const tier = price >= 11000 ? 'leg' : price >= 3400 ? 'epi' : price >= 700 ? 'rar' : '';
  return `<article class="sk-card ${tier} ${on ? 'on' : ''}"><div class="sk-pv">${skPreview(t, id) ? `<img src="${skPreview(t, id)}" alt="${esc(name)}" loading="lazy">` : ''}${tier ? `<i class="sk-tier">${tier === 'leg' ? 'Legendaria' : tier === 'epi' ? 'Épica' : 'Rara'}</i>` : ''}</div><div class="sk-tx"><b>${esc(name)}</b><span>${esc(desc)}</span></div><div class="sk-bt">${btn}</div></article>`;
}
function skBiomesHTML() {
  return `<p class="small muted" style="margin:0 0 10px">Cada 100 frutas atrapadas cambia el paisaje y también la fruta que cae. Hay ${GM_BIOMES.length} ambientes hasta las ${(GM_BIOMES.length - 1) * 100} frutas.</p><ol class="sk-bio">${GM_BIOMES.map((b, i) => `<li><span class="n">${i * 100}</span><b>${esc(b.name)}</b><span>${esc((GM_FRUITS[b.fruit] || { n: b.fruit }).n)}</span></li>`).join('')}</ol>`;
}
function viewSkins() {
  const bal = coins(); const t = SKN.tab;
  return `<section class="sk"><h1 class="page-title">Skins</h1><p class="page-sub">Cambia la canasta de Cosecha y el caballo de Galope. Se pagan con las monedas que ganas al subir tu árbol. Solo cambian el aspecto.</p>
    <div class="sk-bal">${coinSVG()}<b>${bal.toLocaleString('es-MX')}</b> monedas</div>
    <div class="seg" role="tablist" style="margin:6px 0 14px">${[['b', 'Canastas'], ['h', 'Caballos'], ['a', 'Ambientes']].map(([k, n]) => `<button role="tab" data-act="sk-tab" data-t="${k}" aria-pressed="${t === k}">${n}</button>`).join('')}</div>
    ${t === 'a' ? skBiomesHTML() : `<div class="sk-grid">${skList(t).map((e) => skCard(t, e)).join('')}</div>`}</section>`;
}
EXTRA_VIEWS.skins = viewSkins; EXTRA_NAV.skins = 'mas';
Object.assign(VIDA_ACTS, {
  'sk-tab': (el) => { SKN.tab = el.dataset.t; render(); },
  'sk-eq': (el) => { const { t, id } = el.dataset; if (!skOwned(t, id)) return; commit(() => { const v = vidaData(); (v.skins ||= {})[t] = id; }); glHeroURL = ''; Snd.chime && Snd.chime(); },
  'sk-buy': async (el) => { const { t, id } = el.dataset; if (await shopBuy(skKey(t, id))) { commit(() => { const v = vidaData(); (v.skins ||= {})[t] = id; }); glHeroURL = ''; } },
});
/* accesos desde los juegos y desde Más */
{
  const link = `<a class="btn block" href="#/skins" style="margin-top:10px">${icon('star', 'sm')}Skins y tienda</a>`;
  const bj = viewJuego; viewJuego = function () { return bj().replace('</button>\n', '</button>\n' + link + '\n'); }; EXTRA_VIEWS.juego = viewJuego; GROUP_VIEWS.juego = viewJuego;
  const bg = viewGalope; viewGalope = function () { return bg().replace(/(<button class="btn primary block gm-play" data-act="gl-start">[^]*?<\/button>)/, '$1' + link); }; EXTRA_VIEWS.galope = viewGalope; GROUP_VIEWS.galope = viewGalope;
  const bm = viewMas; viewMas = function () { return bm().replace(/<li><a href="#\/escanear">/, `<li><a href="#/skins"><span class="ico">${icon('star')}</span><span class="txt"><b>Skins</b><span>Canastas de Cosecha y caballos de Galope</span></span>${icon('chev', 'chev')}</a></li><li><a href="#/escanear">`); };
}
