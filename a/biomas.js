/* Cinnavia 7.27 — Cosecha: 50 ambientes (uno cada 100 frutas, hasta 5 000) y una fruta distinta para cada uno. */
'use strict';
/* ---------- Frutas ---------- */
const GM_GOLD = ['#FFF6C9', '#F5C842', '#B88A12'];
const GM_FRUITS = {
  manzana: { n: 'Manzana', s: 'round', c: ['#FFC9B8', '#D8342B', '#8E1A14'], leaf: 1 }, banana: { n: 'Plátano', s: 'banana', c: ['#FFF6A8', '#F6D234', '#B8921A'] }, tuna: { n: 'Tuna', s: 'drop', c: ['#FFC4E8', '#D63C8E', '#8A1F5E'], spines: 1 }, pera: { n: 'Pera', s: 'pear', c: ['#F6FAC8', '#B7D44A', '#6F9422'] },
  naranja: { n: 'Naranja', s: 'round', c: ['#FFE0A8', '#F58A1F', '#B5560A'], leaf: 1 }, cereza: { n: 'Cereza', s: 'cherry', c: ['#FFC9CF', '#C8102E', '#7A0A1C'] }, coco: { n: 'Coco', s: 'coco', c: ['#C9A27A', '#7A5230', '#3F2813'] }, uva: { n: 'Uvas', s: 'grape', c: ['#E2C8F5', '#8E44AD', '#4B1F66'] },
  kiwi: { n: 'Kiwi', s: 'round', c: ['#E6F5B0', '#8DB33A', '#5A7A1E'], seeds: '#3A2A14' }, granada: { n: 'Granada', s: 'round', c: ['#FFC0BE', '#C0392B', '#7B1E16'], crown: '#7B1E16' }, mango: { n: 'Mango', s: 'drop', c: ['#FFE79A', '#F7A02B', '#D4572A'], leaf: 1 }, arandano: { n: 'Arándano', s: 'round', c: ['#C9D6FF', '#4660C4', '#232F78'], crown: '#232F78' },
  baya: { n: 'Baya mágica', s: 'orb', c: ['#F0D4FF', '#A24BE0', '#4A1C7A'], glow: '#C58BFF' }, lava: { n: 'Fruta de lava', s: 'orb', c: ['#FFE08A', '#FF5A1F', '#7A1204'], glow: '#FF8A3A', cracks: 1 }, ciruela: { n: 'Ciruela', s: 'round', c: ['#E4C8F0', '#7B2D8E', '#3E1450'], leaf: 1 }, durazno: { n: 'Durazno', s: 'round', c: ['#FFE8D6', '#F8A98C', '#D96B5A'], leaf: 1 },
  limon: { n: 'Limón', s: 'lemon', c: ['#FFFBB8', '#F5E03A', '#BFA812'] }, perla: { n: 'Perla', s: 'orb', c: ['#FFFFFF', '#E4ECF5', '#9DB4CC'], glow: '#FFFFFF' }, cristal: { n: 'Cristal', s: 'crystal', c: ['#E0FBFF', '#4FD1F5', '#1A7FA8'] }, hielo: { n: 'Fruta de hielo', s: 'crystal', c: ['#FFFFFF', '#BEE6FF', '#6FB4E8'], glow: '#BEE6FF' },
  melon: { n: 'Melón', s: 'melon', c: ['#E3F7B8', '#7FC24A', '#3E7A22'] }, jade: { n: 'Jade', s: 'orb', c: ['#D8FFE6', '#3FC47A', '#146B3C'], glow: '#7DF0AC' }, fresa: { n: 'Fresa', s: 'berry', c: ['#FFC6C6', '#E5304A', '#9C1530'] }, rubi: { n: 'Rubí', s: 'crystal', c: ['#FFC4CF', '#E0194A', '#7A0A26'], glow: '#FF4D78' },
  esmeralda: { n: 'Esmeralda', s: 'crystal', c: ['#C8FFDF', '#12C26A', '#0A6B3A'], glow: '#3DE08C' }, pina: { n: 'Piña', s: 'round', c: ['#FFEDA0', '#F2B01E', '#B87408'], crown: '#3F8A3A', grid: 1 }, luna: { n: 'Luna', s: 'moon', c: ['#FFFFFF', '#E8E4FF', '#A9A4D9'], glow: '#CFC8FF' }, papaya: { n: 'Papaya', s: 'drop', c: ['#FFD9B0', '#FF8C42', '#C8501A'], seeds: '#2B1608' },
  neon: { n: 'Neón', s: 'orb', c: ['#CFFFFF', '#18E0F0', '#0A5C8A'], glow: '#18E0F0', ring: '#FF3DCB' }, maracuya: { n: 'Maracuyá', s: 'round', c: ['#E8D0F8', '#8A3FB0', '#4A1A66'], dimples: 1 }, zafiro: { n: 'Zafiro', s: 'crystal', c: ['#D6E6FF', '#2F62E8', '#142A86'], glow: '#5C8CFF' }, litchi: { n: 'Litchi', s: 'round', c: ['#FFD6D6', '#E8536A', '#9E2A3C'], bumps: 1 },
  ambar: { n: 'Ámbar', s: 'crystal', c: ['#FFF0B0', '#F2A31B', '#9A5A08'], glow: '#FFC24A' }, luciernaga: { n: 'Luciérnaga', s: 'orb', c: ['#F6FFC0', '#B8E02A', '#4E7A10'], glow: '#E4FF6A' }, topacio: { n: 'Topacio', s: 'crystal', c: ['#FFF0D0', '#FFB347', '#B8630A'], glow: '#FFD08A' }, llama: { n: 'Llama', s: 'flame', c: ['#FFF1A8', '#FF8A1F', '#D23A0A'] },
  algodon: { n: 'Algodón de nube', s: 'orb', c: ['#FFFFFF', '#FFC8E8', '#E88AC0'], glow: '#FFC8E8', fluff: 1 }, estrella: { n: 'Estrella', s: 'star', c: ['#FFF6B0', '#F5C518', '#C28A00'], glow: '#FFE066' }, amatista: { n: 'Amatista', s: 'crystal', c: ['#F2DCFF', '#A55CE0', '#52208A'], glow: '#C58BFF' }, diamante: { n: 'Diamante', s: 'crystal', c: ['#FFFFFF', '#D4F3FF', '#8AC8EA'], glow: '#FFFFFF', sparkle: 1 },
  rayo: { n: 'Rayo', s: 'star', c: ['#FFFFFF', '#8FD3FF', '#2F7BFF'], glow: '#8FD3FF', spikes: 8 }, nube: { n: 'Nube', s: 'orb', c: ['#FFFFFF', '#EAF3FF', '#B8CCE6'], glow: '#FFFFFF', fluff: 1 }, pitaya: { n: 'Pitaya', s: 'drop', c: ['#FFC4E4', '#E0307E', '#7A0F48'], spines: 1, seeds: '#1A1020' }, galaxia: { n: 'Galaxia', s: 'orb', c: ['#C9B8FF', '#5B3FD6', '#1A0F5E'], glow: '#8A6BFF', stars: 1 },
  plasma: { n: 'Plasma', s: 'orb', c: ['#FFD0FF', '#E03DD0', '#4A0F6A'], glow: '#FF5CE8', swirl: 1 }, obsidiana: { n: 'Obsidiana', s: 'orb', c: ['#8A7AA8', '#2A2040', '#0A0612'], glow: '#7A5CFF', shine: 1 }, solar: { n: 'Sol', s: 'orb', c: ['#FFFBD0', '#FFC93A', '#F27A0A'], glow: '#FFD84A', rays: 1 }, oro: { n: 'Oro', s: 'orb', c: ['#FFF6C9', '#F5C842', '#A87008'], glow: '#FFE07A', shine: 1 },
  infinito: { n: 'Infinito', s: 'star', rainbow: 1, spikes: 6, glow: '#FFFFFF', sparkle: 1 },
  aurora: { n: 'Aurora', s: 'orb', c: ['#C8FFE8', '#3DE0A0', '#8A3FE0'], glow: '#7DFFD0', swirl: 1 }, arcoiris: { n: 'Arcoíris', s: 'orb', rainbow: 1, glow: '#FFFFFF' },
};
function gmFruitPath(g, F, r, now) {
  const s = F.s; g.beginPath();
  if (s === 'round' || s === 'coco' || s === 'melon') { g.ellipse(0, 0.06 * r, r * 1.02, r * 0.98, 0, 0, 7); }
  else if (s === 'orb') g.arc(0, 0, r * 1.02, 0, 7);
  else if (s === 'pear') { g.moveTo(0, -r * 1.05); g.bezierCurveTo(r * 0.55, -r * 1.05, r * 0.55, -r * 0.3, r * 0.65, -r * 0.05); g.bezierCurveTo(r * 1.15, r * 0.35, r * 0.95, r * 1.1, 0, r * 1.1); g.bezierCurveTo(-r * 0.95, r * 1.1, -r * 1.15, r * 0.35, -r * 0.65, -r * 0.05); g.bezierCurveTo(-r * 0.55, -r * 0.3, -r * 0.55, -r * 1.05, 0, -r * 1.05); }
  else if (s === 'lemon') { g.moveTo(-r * 1.3, 0); g.bezierCurveTo(-r * 0.9, -r * 0.95, r * 0.9, -r * 0.95, r * 1.3, 0); g.bezierCurveTo(r * 0.9, r * 0.95, -r * 0.9, r * 0.95, -r * 1.3, 0); }
  else if (s === 'drop') { g.ellipse(0, 0, r * 0.82, r * 1.12, 0.45, 0, 7); }
  else if (s === 'berry') { g.moveTo(0, r * 1.15); g.bezierCurveTo(-r * 0.5, r * 1.0, -r * 1.05, r * 0.2, -r * 0.95, -r * 0.35); g.bezierCurveTo(-r * 0.85, -r * 0.85, r * 0.85, -r * 0.85, r * 0.95, -r * 0.35); g.bezierCurveTo(r * 1.05, r * 0.2, r * 0.5, r * 1.0, 0, r * 1.15); }
  else if (s === 'crystal') { g.moveTo(0, -r * 1.3); g.lineTo(r * 0.85, -r * 0.35); g.lineTo(r * 0.6, r * 1.05); g.lineTo(-r * 0.6, r * 1.05); g.lineTo(-r * 0.85, -r * 0.35); g.closePath(); }
  else if (s === 'star') { const n = F.spikes || 5; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n, rr = i % 2 ? r * 0.55 : r * 1.2; i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); }
  else if (s === 'flame') { const f = Math.sin(now / 90) * r * 0.06; g.moveTo(0, -r * 1.35 + f); g.bezierCurveTo(r * 0.2, -r * 0.6, r * 1.0, -r * 0.3, r * 0.85, r * 0.5); g.bezierCurveTo(r * 0.7, r * 1.15, -r * 0.7, r * 1.15, -r * 0.85, r * 0.5); g.bezierCurveTo(-r * 1.0, -r * 0.1, -r * 0.3, -r * 0.5, 0, -r * 1.35 + f); }
  else g.arc(0, 0, r, 0, 7);
}
function gmFruit(g, kind, x, y, r, gold, rot, now) {
  const F = GM_FRUITS[kind] || GM_FRUITS.manzana; g.save(); g.translate(x, y); g.rotate(rot);
  let c = gold ? GM_GOLD : F.c;
  if (F.rainbow && !gold) { const gr0 = g.createLinearGradient(-r, -r, r, r); for (let i = 0; i <= 6; i++) gr0.addColorStop(i / 6, `hsl(${(i * 60 + now / 8) % 360},90%,62%)`); c = null; F._rb = gr0; }
  const glow = gold ? '#FFD75A' : F.glow;
  if (glow) { const pu = 0.78 + 0.22 * Math.sin(now / 260 + x); const hl = g.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.5); hl.addColorStop(0, glow + 'AA'); hl.addColorStop(1, glow + '00'); g.globalAlpha = pu; g.fillStyle = hl; g.beginPath(); g.arc(0, 0, r * 2.5, 0, 7); g.fill(); g.globalAlpha = 1; }
  const s = F.s;
  if (s === 'banana' && !gold) { // curva gruesa
    g.lineCap = 'round'; g.strokeStyle = c[2]; g.lineWidth = r * 0.95; g.beginPath(); g.arc(0, -r * 0.5, r * 1.25, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); g.strokeStyle = c[1]; g.lineWidth = r * 0.78; g.stroke(); g.strokeStyle = c[0]; g.globalAlpha = 0.7; g.lineWidth = r * 0.22; g.beginPath(); g.arc(0, -r * 0.5 - r * 0.15, r * 1.2, 0.25 * Math.PI, 0.75 * Math.PI); g.stroke(); g.globalAlpha = 1; g.fillStyle = '#5B3A1E'; g.beginPath(); g.arc(Math.cos(0.15 * Math.PI) * r * 1.25, -r * 0.5 + Math.sin(0.15 * Math.PI) * r * 1.25, r * 0.16, 0, 7); g.fill(); g.restore(); return;
  }
  if (s === 'cherry' && !gold) {
    const pair = [[-r * 0.5, r * 0.4], [r * 0.5, r * 0.55]]; g.strokeStyle = '#5E7A2E'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); for (const [px, py] of pair) { g.moveTo(px, py - r * 0.5); g.quadraticCurveTo(px * 0.3, -r * 0.9, 0, -r * 1.25); } g.stroke(); g.fillStyle = '#5E9A3E'; g.beginPath(); g.ellipse(r * 0.3, -r * 1.2, r * 0.4, r * 0.16, -0.4, 0, 7); g.fill();
    for (const [px, py] of pair) { const gr = g.createRadialGradient(px - r * 0.2, py - r * 0.25, r * 0.05, px, py, r * 0.7); gr.addColorStop(0, c[0]); gr.addColorStop(0.45, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.beginPath(); g.arc(px, py, r * 0.64, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(px - r * 0.22, py - r * 0.24, r * 0.12, r * 0.2, -0.5, 0, 7); g.fill(); }
    g.restore(); return;
  }
  if (s === 'grape' && !gold) {
    g.strokeStyle = '#5B3A1E'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -r * 0.7); g.lineTo(2, -r * 1.2); g.stroke(); g.fillStyle = '#5E9A3E'; g.beginPath(); g.ellipse(r * 0.4, -r * 1.05, r * 0.42, r * 0.18, -0.5, 0, 7); g.fill();
    const pts = [[-0.62, -0.35], [0, -0.45], [0.62, -0.35], [-0.32, 0.1], [0.32, 0.1], [-0.65, 0.2], [0.65, 0.2], [0, 0.55], [-0.32, 0.85], [0.32, 0.85]]; pts.forEach(([px, py], i) => { const X = px * r, Y = py * r, gr = g.createRadialGradient(X - r * 0.1, Y - r * 0.12, 1, X, Y, r * 0.42); gr.addColorStop(0, c[0]); gr.addColorStop(0.5, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.beginPath(); g.arc(X, Y, r * 0.38, 0, 7); g.fill(); });
    g.restore(); return;
  }
  if (F.rays) { g.fillStyle = '#FFD84A'; for (let i = 0; i < 12; i++) { const a = i * 0.5236 + now / 900; g.beginPath(); g.moveTo(Math.cos(a - 0.14) * r * 0.95, Math.sin(a - 0.14) * r * 0.95); g.lineTo(Math.cos(a) * r * 1.42, Math.sin(a) * r * 1.42); g.lineTo(Math.cos(a + 0.14) * r * 0.95, Math.sin(a + 0.14) * r * 0.95); g.fill(); } }
  const gr = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.2);
  if (c) { gr.addColorStop(0, c[0]); gr.addColorStop(0.45, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; } else g.fillStyle = F._rb;
  gmFruitPath(g, F, r, now); g.fill(); g.strokeStyle = c ? c[2] : '#8A3FE0'; g.globalAlpha = 0.5; g.lineWidth = 1.4; g.lineJoin = 'round'; g.stroke(); g.globalAlpha = 1;
  g.save(); gmFruitPath(g, F, r, now); g.clip();
  if (s === 'melon') { g.strokeStyle = 'rgba(30,90,30,.45)'; g.lineWidth = r * 0.14; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * r * 0.36, 0, r * 0.28, r * 1.05, 0, 0, 7); g.stroke(); } }
  if (s === 'coco') { g.fillStyle = '#1E1208'; for (const [px, py] of [[-0.3, -0.45], [0.3, -0.45], [0, -0.1]]) { g.beginPath(); g.arc(px * r, py * r, r * 0.12, 0, 7); g.fill(); } }
  if (F.grid) { g.strokeStyle = 'rgba(120,70,0,.4)'; g.lineWidth = 1.3; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * r * 0.4 - r, -r); g.lineTo(i * r * 0.4 + r, r); g.moveTo(i * r * 0.4 + r, -r); g.lineTo(i * r * 0.4 - r, r); g.stroke(); } }
  if (F.seeds) { g.fillStyle = F.seeds; for (const [px, py] of [[-0.3, 0.1], [0.25, 0.3], [0.05, -0.2], [0.4, -0.05], [-0.1, 0.5]]) { g.beginPath(); g.ellipse(px * r, py * r, r * 0.07, r * 0.11, 0.6, 0, 7); g.fill(); } }
  if (F.cracks) { g.strokeStyle = '#FFD27A'; g.lineWidth = 2; g.globalAlpha = 0.6 + 0.4 * Math.sin(now / 160); g.beginPath(); g.moveTo(-r * 0.7, -r * 0.2); g.lineTo(-r * 0.2, r * 0.1); g.lineTo(r * 0.1, -r * 0.3); g.lineTo(r * 0.6, r * 0.2); g.moveTo(-r * 0.2, r * 0.1); g.lineTo(-r * 0.1, r * 0.7); g.stroke(); g.globalAlpha = 1; }
  if (F.stars) { g.fillStyle = '#fff'; for (const [px, py, sz] of [[-0.4, -0.3, 2], [0.3, 0.2, 2.6], [0.1, -0.6, 1.6], [-0.2, 0.5, 1.8], [0.55, -0.35, 1.4]]) { g.globalAlpha = 0.6 + 0.4 * Math.sin(now / 200 + px * 9); g.beginPath(); g.arc(px * r, py * r, sz, 0, 7); g.fill(); } g.globalAlpha = 1; }
  if (F.swirl) { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2.4; g.beginPath(); for (let t = 0; t < 14; t += 0.3) { const a = t + now / 500, rr = (t / 14) * r * 0.95; t ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(0, 0); } g.stroke(); }
  if (F.fluff) { g.fillStyle = 'rgba(255,255,255,.65)'; for (const [px, py] of [[-0.5, 0.1], [0.4, 0.2], [0, -0.45], [0.55, -0.3], [-0.45, -0.4]]) { g.beginPath(); g.arc(px * r, py * r, r * 0.38, 0, 7); g.fill(); } }
  if (F.bumps || F.dimples) { g.fillStyle = F.bumps ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.15)'; for (let i = 0; i < 16; i++) { const a = i * 2.4, rr = Math.sqrt(i / 16) * r * 0.9; g.beginPath(); g.arc(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.1, 0, 7); g.fill(); } }
  if (F.spines) { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.2; for (let i = 0; i < 12; i++) { const a = i * 2.1, rr = (0.3 + (i % 4) * 0.2) * r; const X = Math.cos(a) * rr, Y = Math.sin(a) * rr; g.beginPath(); g.moveTo(X, Y); g.lineTo(X + 3, Y - 4); g.stroke(); } }
  if (s === 'crystal') { g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, -r * 1.3); g.lineTo(-r * 0.2, r * 1.05); g.moveTo(0, -r * 1.3); g.lineTo(r * 0.28, r * 1.05); g.moveTo(-r * 0.85, -r * 0.35); g.lineTo(r * 0.85, -r * 0.35); g.stroke(); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(0, -r * 1.3); g.lineTo(-r * 0.85, -r * 0.35); g.lineTo(-r * 0.2, -r * 0.35); g.closePath(); g.fill(); }
  if (s === 'flame') { g.fillStyle = 'rgba(255,245,170,.85)'; g.beginPath(); g.moveTo(0, -r * 0.5); g.bezierCurveTo(r * 0.4, -r * 0.1, r * 0.5, r * 0.4, 0, r * 0.75); g.bezierCurveTo(-r * 0.5, r * 0.4, -r * 0.4, -r * 0.1, 0, -r * 0.5); g.fill(); }
  g.restore();
  if (s === 'moon') { /* media luna: se vacía un lado */ }
  if (s === 'moon') { g.fillStyle = 'rgba(120,115,190,.35)'; for (const [dx, dy, rr] of [[-0.3, -0.25, 0.22], [0.3, 0.1, 0.17], [-0.1, 0.5, 0.13]]) { g.beginPath(); g.arc(dx * r, dy * r, rr * r, 0, 7); g.fill(); } }
  if (F.crown) { g.fillStyle = F.crown; g.beginPath(); g.moveTo(-r * 0.3, -r * 0.95); g.lineTo(-r * 0.15, -r * 1.25); g.lineTo(0, -r * 1.0); g.lineTo(r * 0.15, -r * 1.25); g.lineTo(r * 0.3, -r * 0.95); g.closePath(); g.fill(); }
  if (F.leaf && !gold) { g.strokeStyle = '#5B3A1E'; g.lineWidth = 2; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -r * 0.9); g.lineTo(2, -r * 1.25); g.stroke(); g.fillStyle = '#5E9A3E'; g.beginPath(); g.ellipse(r * 0.45, -r * 1.1, r * 0.42, r * 0.18, -0.5, 0, 7); g.fill(); }
  if (s === 'berry') { g.fillStyle = '#4C9A3A'; for (let i = -2; i <= 2; i++) { g.beginPath(); g.ellipse(i * r * 0.28, -r * 0.82 + Math.abs(i) * r * 0.06, r * 0.22, r * 0.12, i * 0.4, 0, 7); g.fill(); } g.fillStyle = '#FFE98A'; for (const [px, py] of [[-0.45, -0.2], [0.4, -0.25], [0, 0.0], [-0.25, 0.4], [0.3, 0.45], [0, 0.8]]) { g.beginPath(); g.ellipse(px * r, py * r, r * 0.05, r * 0.08, 0, 0, 7); g.fill(); } }
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.28, r * 0.17, r * 0.28, -0.5, 0, 7); g.fill();
  if (gold || F.sparkle || F.shine) { const tw = (Math.sin(now / 120) + 1) / 2; g.fillStyle = `rgba(255,255,255,${0.5 + tw * 0.5})`; for (const [sx, sy] of [[r * 0.9, -r * 0.8], [-r * 1.1, r * 0.2]]) { g.beginPath(); g.moveTo(sx, sy - 5); g.lineTo(sx + 1.5, sy - 1.5); g.lineTo(sx + 5, sy); g.lineTo(sx + 1.5, sy + 1.5); g.lineTo(sx, sy + 5); g.lineTo(sx - 1.5, sy + 1.5); g.lineTo(sx - 5, sy); g.lineTo(sx - 1.5, sy - 1.5); g.closePath(); g.fill(); } }
  g.restore();
}
{
  const baseApple = gmApple;
  gmApple = function (g, x, y, r, gold, rot, now, heal) {
    const run = typeof GAME !== 'undefined' && GAME.run; const kind = run ? (GM_BIOMES[Math.min(GM_BIOMES.length - 1, run.biome || 0)] || {}).fruit : 'manzana';
    if (heal || !kind || kind === 'manzana') return baseApple(g, x, y, r, gold, rot, now, heal);
    return gmFruit(g, kind, x, y, r, gold, rot, now);
  };
}

/* ---------- 50 ambientes ---------- */
// nombre | fruta | cielo | montañas | suelo | copas | banderas: n noche, s nieve, d atardecer, p pétalos, e brasas, f luciérnagas, t estrellas, b burbujas, l hojas, a ceniza, P palmeras, C cactus, K cristales, M hongos, B bambú, O coral, R rayos de sol, V lianas, N sin lluvia, H lluvia fuerte
const GM_ROWS = [
  'Huerto de otoño|naranja|30|25|38|22|l', 'Valle de cerezos|cereza|340|330|110|335|pN', 'Costa tropical|coco|190|175|45|140|PR', 'Viñedo dorado|uva|45|40|70|85|', 'Pantano brumoso|kiwi|150|160|95|100|V',
  'Cañón rojo|granada|20|12|14|100|CN', 'Sabana al atardecer|mango|18|20|42|95|dC', 'Tundra azul|arandano|215|220|200|170|sN', 'Bosque encantado|baya|270|275|140|285|nfM', 'Isla volcánica|lava|10|6|12|20|deaN',
  'Campo de lavanda|ciruela|265|270|130|280|', 'Arrozales|durazno|100|110|85|100|', 'Atardecer dorado|limon|38|35|48|60|dN', 'Arrecife de coral|perla|185|190|195|170|bON', 'Cueva de cristal|cristal|195|200|215|190|ntKN',
  'Aurora boreal|hielo|160|200|205|170|nstN', 'Mesa de nubes|melon|205|215|120|110|N', 'Bosque de bambú|jade|130|140|110|135|B', 'Campos de fresa|fresa|350|340|105|120|', 'Cumbres de rubí|rubi|345|350|355|350|K',
  'Selva esmeralda|esmeralda|140|150|135|145|VR', 'Dunas doradas|pina|42|38|44|90|CN', 'Océano nocturno|luna|225|230|220|200|ntbN', 'Jardín de papayas|papaya|30|50|100|110|P', 'Ciudad de neón|neon|285|300|280|320|nt',
  'Bosque rojo|maracuya|8|10|20|355|l', 'Glaciar eterno|zafiro|210|215|205|200|sNK', 'Isla flotante|litchi|195|200|110|120|R', 'Templo antiguo|ambar|35|30|40|60|dR', 'Valle de luciérnagas|luciernaga|100|110|120|115|nf',
  'Desierto de cristal|topacio|40|38|45|50|KN', 'Volcán eterno|llama|8|4|8|15|neaN', 'Mar de nubes rosa|algodon|330|320|340|330|N', 'Cielo estrellado|estrella|235|240|230|220|ntN', 'Bosque de amatista|amatista|280|285|275|290|nK',
  'Reino de hielo|diamante|200|205|195|190|sN', 'Tormenta eléctrica|rayo|225|230|120|130|H', 'Jardín celestial|nube|210|215|200|180|N', 'Valle del dragón|pitaya|335|340|140|150|V', 'Galaxia espiral|galaxia|255|260|250|265|ntN',
  'Nebulosa violeta|plasma|295|300|290|310|ntN', 'Eclipse|obsidiana|260|265|255|270|ntN', 'Amanecer solar|solar|28|30|42|55|dRN', 'Reino dorado|oro|45|42|48|50|RN', 'Cielo de auroras|aurora|165|170|160|150|ntN', 'El fin del arcoíris|arcoiris|200|300|130|140|RN', 'La cumbre infinita|infinito|270|280|260|290|ntRN',
];
function gmBuildBiome(row, i) {
  const [name, fruit, sky, mt, gd, cn, fl = ''] = row.split('|'); const h = (+sky), m = (+mt), gH = (+gd), cH = (+cn); const has = (f) => fl.includes(f); const n = has('n'), sn = has('s'), dk = has('d');
  const B = { name, fruit, idx: i + 4, fx: [] };
  B.sky = n ? [`hsl(${h},55%,14%)`, `hsl(${h},48%,27%)`, `hsl(${h + 10},42%,40%)`] : dk ? [`hsl(${(h + 250) % 360},40%,58%)`, `hsl(${h},78%,70%)`, `hsl(${h + 8},85%,82%)`] : [`hsl(${h},62%,76%)`, `hsl(${(h + 14) % 360},72%,86%)`, `hsl(${(h + 24) % 360},60%,92%)`];
  B.m1 = n ? `hsla(${m},30%,36%,.78)` : `hsla(${m},24%,64%,.72)`; B.m2 = n ? `hsla(${m},34%,26%,.92)` : `hsla(${m},28%,48%,.88)`;
  B.g1 = sn ? '#EAF1F5' : n ? `hsl(${gH},30%,30%)` : `hsl(${gH},36%,64%)`; B.g2 = sn ? '#D8E4EC' : n ? `hsl(${gH},32%,23%)` : `hsl(${gH},40%,52%)`;
  B.c1 = n ? `hsl(${cH},45%,40%)` : `hsl(${cH},50%,58%)`; B.c2 = n ? `hsl(${cH},50%,20%)` : `hsl(${cH},56%,30%)`;
  B.pine = n ? `hsla(${cH},40%,22%,.9)` : `hsla(${cH},38%,30%,.8)`;
  if (has('s')) { B.snow = true; B.cap = 'rgba(255,255,255,.92)'; } else if (!has('C')) B.cap = (i % 3 === 0 || has('K')) ? 'rgba(255,255,255,.8)' : null;
  if (has('P')) B.deco = 'palm'; else if (has('C')) B.deco = 'cactus'; else if (has('K')) B.deco = 'crystal'; else if (has('M')) B.deco = 'mushroom'; else if (has('B')) B.deco = 'bamboo'; else if (has('O')) B.deco = 'coral'; else if (has('p')) B.deco = 'sakura';
  if (has('R')) B.rays = true; if (has('V')) B.vines = true; if (has('N') || sn || has('e') || has('b')) B.rain = false; if (has('H')) B.rainHeavy = true;
  const fx = []; if (sn) fx.push('snow'); if (has('p')) fx.push('petals'); if (has('e')) fx.push('embers', 'ash'); if (has('f')) fx.push('fireflies'); if (has('t')) fx.push('stars'); if (has('b')) fx.push('bubbles'); if (has('l')) fx.push('leaves'); B.fx = fx; B.night = n;
  return B;
}
{
  GM_BIOMES.forEach((b, i) => { b.fruit = ['manzana', 'banana', 'tuna', 'pera'][i]; b.pine = b.pine || 'rgba(70,120,80,.75)'; if (i === 2) b.rain = false; if (i === 3) b.rain = false; if (i === 3) b.fx = ['snow']; });
  GM_ROWS.forEach((r, i) => GM_BIOMES.push(gmBuildBiome(r, i)));
}
/* decoraciones nuevas del fondo */
function gmDeco(b, B, x, y, s) {
  const d = B.deco;
  if (d === 'crystal') { for (const [dx, hh, w] of [[-5, 30, 6], [0, 42, 7], [6, 26, 5]]) { b.fillStyle = B.night ? 'rgba(120,220,255,.75)' : 'rgba(110,200,235,.8)'; b.beginPath(); b.moveTo(x + dx * s - w * s, y); b.lineTo(x + dx * s, y - hh * s); b.lineTo(x + dx * s + w * s, y); b.fill(); b.fillStyle = 'rgba(255,255,255,.35)'; b.beginPath(); b.moveTo(x + dx * s, y - hh * s); b.lineTo(x + dx * s - w * s, y); b.lineTo(x + dx * s - w * s * 0.2, y); b.fill(); } return true; }
  if (d === 'mushroom') { b.fillStyle = '#EAD9C8'; b.fillRect(x - 3 * s, y - 14 * s, 6 * s, 16 * s); b.fillStyle = `hsl(${(x * 3) % 60 + 280},60%,${B.night ? 55 : 62}%)`; b.beginPath(); b.ellipse(x, y - 15 * s, 15 * s, 10 * s, 0, Math.PI, 0); b.fill(); b.fillStyle = 'rgba(255,255,255,.8)'; for (const [dx, dy] of [[-6, -18], [3, -21], [8, -16]]) { b.beginPath(); b.arc(x + dx * s, y + dy * s, 1.8 * s, 0, 7); b.fill(); } return true; }
  if (d === 'bamboo') { b.strokeStyle = 'rgba(96,160,84,.9)'; b.lineWidth = 4 * s; b.lineCap = 'round'; b.beginPath(); b.moveTo(x, y + 4); b.lineTo(x + s, y - 46 * s); b.stroke(); b.strokeStyle = 'rgba(40,100,50,.7)'; b.lineWidth = 1.4; for (let k = 1; k < 5; k++) { b.beginPath(); b.moveTo(x - 3 * s, y - k * 9 * s); b.lineTo(x + 3 * s, y - k * 9 * s); b.stroke(); } b.fillStyle = 'rgba(80,150,70,.85)'; b.beginPath(); b.ellipse(x + 8 * s, y - 36 * s, 9 * s, 3 * s, -0.5, 0, 7); b.fill(); return true; }
  if (d === 'coral') { b.strokeStyle = `hsl(${(x * 5) % 40 + 340},70%,62%)`; b.lineWidth = 4 * s; b.lineCap = 'round'; b.beginPath(); b.moveTo(x, y + 2); b.lineTo(x, y - 20 * s); b.moveTo(x, y - 10 * s); b.lineTo(x - 9 * s, y - 24 * s); b.moveTo(x, y - 12 * s); b.lineTo(x + 9 * s, y - 26 * s); b.stroke(); return true; }
  if (d === 'sakura') { b.fillStyle = '#6B4A3A'; b.fillRect(x - 2 * s, y - 20 * s, 4 * s, 24 * s); b.fillStyle = 'rgba(255,183,210,.92)'; for (const [dx, dy, r] of [[0, -28, 13], [-9, -22, 9], [9, -22, 9]]) { b.beginPath(); b.arc(x + dx * s, y + dy * s, r * s, 0, 7); b.fill(); } return true; }
  return false;
}
/* clima y partículas de ambiente (no tocan frutas ni canasta) */
function gmFx(g, st, B, dt, W, H, now) {
  const list = B.fx || []; if (!list.length) { if (st.fxp) st.fxp.length = 0; return; }
  const P = (st.fxp ||= []); if (st.fxB !== B) { P.length = 0; st.fxB = B; }
  const want = (k) => ({ snow: 60, petals: 26, embers: 32, ash: 20, fireflies: 22, stars: 40, bubbles: 24, leaves: 22 })[k] || 0;
  for (const k of list) { let have = 0; for (const p of P) if (p.k === k) have++; for (let i = have; i < want(k); i++) P.push({ k, x: Math.random() * W, y: Math.random() * H, v: 0.6 + Math.random() * 0.8, ph: Math.random() * 6.28, s: 0.6 + Math.random() }); }
  for (const p of P) {
    p.ph += dt * 1.4;
    if (p.k === 'snow') { p.y += (40 + 40 * p.v) * dt; p.x += Math.sin(p.ph) * 14 * dt; g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(p.x, p.y, 1.4 + p.s * 1.6, 0, 7); g.fill(); }
    else if (p.k === 'petals') { p.y += (30 + 30 * p.v) * dt; p.x += (14 + Math.sin(p.ph) * 22) * dt; g.fillStyle = 'rgba(255,190,214,.9)'; g.save(); g.translate(p.x, p.y); g.rotate(p.ph); g.beginPath(); g.ellipse(0, 0, 5 * p.s, 2.6 * p.s, 0, 0, 7); g.fill(); g.restore(); }
    else if (p.k === 'leaves') { p.y += (34 + 30 * p.v) * dt; p.x += (-10 + Math.sin(p.ph) * 26) * dt; g.fillStyle = ['#E0702A', '#C0392B', '#E8A33A'][(p.s * 3) | 0]; g.save(); g.translate(p.x, p.y); g.rotate(p.ph); g.beginPath(); g.ellipse(0, 0, 5.5 * p.s, 3 * p.s, 0, 0, 7); g.fill(); g.restore(); }
    else if (p.k === 'embers') { p.y -= (50 + 60 * p.v) * dt; p.x += Math.sin(p.ph) * 20 * dt; g.fillStyle = `rgba(255,${120 + (p.s * 60) | 0},40,.9)`; g.beginPath(); g.arc(p.x, p.y, 1.5 + p.s, 0, 7); g.fill(); }
    else if (p.k === 'ash') { p.y += 20 * p.v * dt; p.x += Math.sin(p.ph) * 10 * dt; g.fillStyle = 'rgba(70,60,60,.5)'; g.beginPath(); g.arc(p.x, p.y, 1.6 + p.s, 0, 7); g.fill(); }
    else if (p.k === 'fireflies') { p.x += Math.cos(p.ph * 0.7) * 16 * dt; p.y += Math.sin(p.ph) * 12 * dt; const a = 0.4 + 0.6 * Math.abs(Math.sin(p.ph * 1.3)); const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9); gr.addColorStop(0, `rgba(235,255,120,${a})`); gr.addColorStop(1, 'rgba(235,255,120,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, 9, 0, 7); g.fill(); }
    else if (p.k === 'stars') { const a = 0.3 + 0.7 * Math.abs(Math.sin(p.ph * 0.8)); g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); g.arc(p.x, (p.y % (H * 0.5)), 0.8 + p.s * 0.9, 0, 7); g.fill(); }
    else if (p.k === 'bubbles') { p.y -= (24 + 24 * p.v) * dt; p.x += Math.sin(p.ph) * 10 * dt; if (p.y < -10) p.y = H + 10; g.strokeStyle = 'rgba(255,255,255,.65)'; g.lineWidth = 1.2; g.beginPath(); g.arc(p.x, p.y, 3 + p.s * 4, 0, 7); g.stroke(); }
    if (p.y > H + 12) { p.y = -10; p.x = Math.random() * W; } if (p.y < -14 && p.k !== 'stars') { p.y = H + 10; p.x = Math.random() * W; } if (p.x > W + 20) p.x = -10; if (p.x < -20) p.x = W + 10;
  }
}

function gmMoon(g, x, y, r, now) {
  const hl = g.createRadialGradient(x, y, r * 0.4, x, y, r * 3.6); hl.addColorStop(0, 'rgba(220,230,255,.45)'); hl.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = hl; g.beginPath(); g.arc(x, y, r * 3.6, 0, 7); g.fill();
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(1, '#C9D2EE'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.fillStyle = 'rgba(150,160,200,.35)'; for (const [dx, dy, rr] of [[-0.3, -0.2, 0.2], [0.25, 0.1, 0.15], [-0.05, 0.4, 0.12]]) { g.beginPath(); g.arc(x + dx * r, y + dy * r, rr * r, 0, 7); g.fill(); }
}
