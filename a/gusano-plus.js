/* Cinnavia 7.62 — The Worn+: reto del día con racha, logros con premios, cofres por mundo completo,
   colores especiales que se desbloquean y estadísticas. Usa el mismo avance por cuenta (jpData('gusano')). */
'use strict';
/* 20 lugares nuevos para los niveles 401–600 */
GW_ENVS.push(
  { n: "Bahía de coral", sky: ["#5FC9E8", "#FFF0D2"], wall: ["#FF9E8A", "#C8604E", "#9A4436"], fr: ["#FFE066", "#E0A81F"], p: ["bubble", "#FFFFFF"], deco: 'waves', dc: ["#4FBCDC", "#38A6C8"] },
  { n: "Bosque de hongos", sky: ["#B9A3E8", "#F2E8FF"], wall: ["#E86A6A", "#8A4A6A", "#5E3048"], fr: ["#7DF0AC", "#2FB070"], p: ["firefly", "#FFF3B0"], deco: 'trees', dc: ["#A88CD8", "#9478C8"] },
  { n: "Cañón rojo", sky: ["#F2A65E", "#FCE3C2"], wall: ["#C9603A", "#8A3A22", "#5E2414"], fr: ["#7BC043", "#4C8A24"], p: ["dust", "#F0C08A"], deco: 'dunes', dc: ["#E89A62", "#D88450"] },
  { n: "Glaciar", sky: ["#9FD8F2", "#F4FCFF"], wall: ["#E4F6FF", "#8FC0DC", "#5E98BC"], fr: ["#FF6B8A", "#C23A5A"], p: ["snow", "#FFFFFF"], deco: 'peaks', dc: ["#CCE8F6", "#B6DCF0"] },
  { n: "Jardín japonés", sky: ["#FFD6E0", "#FFF6EC"], wall: ["#7CB86A", "#5A4A3A", "#3E3226"], fr: ["#FF7AA0", "#C23A68"], p: ["petal", "#FFC2D6"], deco: 'hills', dc: ["#BFE2A8", "#A8D48E"] },
  { n: "Mina de gemas", sky: ["#2A2440", "#4A3A6A"], wall: ["#6A5A8A", "#3A3050", "#241E36"], fr: ["#5CF0FF", "#18A8C8"], p: ["sparkle", "#E0F8FF"], deco: 'crystals', dc: ["#7A5AE0", "#5A3AC0"] },
  { n: "Nubes altas", sky: ["#A8D8FF", "#FFFFFF"], wall: ["#FFFFFF", "#C8DCF0", "#A0BCD8"], fr: ["#FFB43A", "#E07F12"], p: ["cloud", "#FFFFFF"], deco: 'hills', dc: ["#E8F4FF", "#D8ECFF"] },
  { n: "Feria nocturna", sky: ["#1A1240", "#5A2A80"], wall: ["#E85AA8", "#8A2A6A", "#5A1A48"], fr: ["#FFE066", "#E0A81F"], p: ["star", "#FFF3B0"], deco: 'skyline', dc: ["#3A2A70", "#2A1A58"] },
  { n: "Bosque de bambú", sky: ["#BFE8B0", "#F2FAE4"], wall: ["#6AC05A", "#4A7A3A", "#30522A"], fr: ["#FF8A5A", "#D0582A"], p: ["leaf", "#8AD070"], deco: 'trees', dc: ["#9CD88A", "#86C874"] },
  { n: "Arrecife profundo", sky: ["#0E3A6A", "#2A8AB8"], wall: ["#3AC0A8", "#1A7A6A", "#0E5048"], fr: ["#FF9ED8", "#E05AA8"], p: ["bubble", "#CFF4FF"], deco: 'waves', dc: ["#1A5A90", "#14487A"] },
  { n: "Dunas de noche", sky: ["#141E48", "#6A5AA0"], wall: ["#B89A6A", "#7A5E3A", "#544028"], fr: ["#9FFFE0", "#30C0A0"], p: ["star", "#FFFFFF"], deco: 'dunes', dc: ["#2A3068", "#222858"] },
  { n: "Huerto de cerezos", sky: ["#FFD1E0", "#FFF8F2"], wall: ["#E8A0B8", "#9A5A6A", "#6A3A48"], fr: ["#E0443A", "#A82A22"], p: ["petal", "#FFE0EA"], deco: 'hills', dc: ["#F8C0D4", "#F0AEC6"] },
  { n: "Volcán de cristal", sky: ["#40102A", "#C04A6A"], wall: ["#9A5AC8", "#5A2A80", "#3A1A58"], fr: ["#FFB43A", "#E0521A"], p: ["ember", "#FFB0E0"], deco: 'crystals', dc: ["#6A2A70", "#521E58"] },
  { n: "Ciudad flotante", sky: ["#7FB8FF", "#FFE8D0"], wall: ["#D8DCE8", "#8A90A8", "#5E6480"], fr: ["#FF6B6B", "#C23A3A"], p: ["cloud", "#FFFFFF"], deco: 'skyline', dc: ["#A8B8E0", "#94A6D4"] },
  { n: "Selva de noche", sky: ["#0E2A20", "#2A5A44"], wall: ["#2F7A52", "#1E4A32", "#123020"], fr: ["#FFE066", "#E0A81F"], p: ["firefly", "#D8FFB0"], deco: 'trees', dc: ["#1E4A36", "#163A2A"] },
  { n: "Polo norte", sky: ["#203A6A", "#9FD0F0"], wall: ["#FFFFFF", "#B0D0E8", "#7EA8C8"], fr: ["#FF5A5A", "#C22A2A"], p: ["snow", "#FFFFFF"], deco: 'aurora', dc: ["#58E0C0", "#6B8CF0"] },
  { n: "Galaxia dulce", sky: ["#3A1450", "#E06AB5"], wall: ["#FF8FCF", "#C04A90", "#8A2A68"], fr: ["#FFF3A8", "#F0C02A"], p: ["sparkle", "#FFE0F8"], deco: 'planets', dc: ["#5A2A78", "#4A1E66"] },
  { n: "Ruinas mayas", sky: ["#9FD8A8", "#F2F0D8"], wall: ["#B8A87A", "#7A6A48", "#5A4C30"], fr: ["#E0443A", "#A82A22"], p: ["leaf", "#6AB85A"], deco: 'dunes', dc: ["#C8D8A0", "#B4C88A"] },
  { n: "Tormenta", sky: ["#3A4458", "#8A96AA"], wall: ["#7A8494", "#4A525E", "#323840"], fr: ["#FFE066", "#E0A81F"], p: ["cloud", "#DDE4EE"], deco: 'peaks', dc: ["#5A6478", "#4A5468"] },
  { n: "Arcoíris final", sky: ["#FFB3D9", "#B3FFE8"], wall: ["#FFD86A", "#E8A02A", "#C07A12"], fr: ["#FF5A8A", "#C22A5A"], p: ["sparkle", "#FFFFFF"], deco: 'rainbow', dc: ["#FFE0A8", "#C0F0D0"] },
);

const GWP = { daily: 0 };
const gwpD = () => { const D = gwData(); D.stt ||= { ap: 0, perf: 0, nh: 0, nhBest: 0, wins: 0 }; D.ach ||= {}; D.chest ||= {}; D.day ||= { last: '', streak: 0, best: 0, done: '' }; return D; };
const gwpToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const gwpDailyLevel = () => {
  const mx = gwMax(), N = GW_N(); const lo = Math.max(1, Math.min(mx, N) - 80), hi = Math.max(lo, Math.min(mx, N));
  const t = gwpToday(); let h = 7; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return lo + (h % (hi - lo + 1));
};
const gwpCount3 = () => { const s = gwData().s || ''; let n = 0; for (const ch of s) if (ch === '3') n++; return n; };
const gwpCleared = () => { const s = gwData().s || ''; let n = 0; for (const ch of s) if (+ch > 0) n++; return n; };
const GWP_ACH = [
  { id: 'l10', n: 'Primeros pasos', d: 'Supera 10 niveles', v: () => gwpCleared(), goal: 10, rew: 2 },
  { id: 'l50', n: 'Explorador', d: 'Supera 50 niveles', v: () => gwpCleared(), goal: 50, rew: 4 },
  { id: 'l100', n: 'Veterano', d: 'Supera 100 niveles', v: () => gwpCleared(), goal: 100, rew: 6 },
  { id: 'l250', n: 'Maestro gusano', d: 'Supera 250 niveles', v: () => gwpCleared(), goal: 250, rew: 10 },
  { id: 'l500', n: 'Leyenda', d: 'Supera 500 niveles', v: () => gwpCleared(), goal: 500, rew: 20 },
  { id: 's25', n: 'Perfeccionista', d: '25 niveles con 3 estrellas', v: () => gwpCount3(), goal: 25, rew: 4 },
  { id: 's100', n: 'Brillante', d: '100 niveles con 3 estrellas', v: () => gwpCount3(), goal: 100, rew: 8, col: '#FFD24A' },
  { id: 's300', n: 'Constelación', d: '300 niveles con 3 estrellas', v: () => gwpCount3(), goal: 300, rew: 15, col: '#B07AFF' },
  { id: 'p10', n: 'Camino exacto', d: 'Gana 10 niveles en el mínimo de pasos', v: () => gwpD().stt.perf, goal: 10, rew: 4 },
  { id: 'p50', n: 'Calculadora viviente', d: 'Gana 50 niveles en el mínimo de pasos', v: () => gwpD().stt.perf, goal: 50, rew: 10, col: '#00E5FF' },
  { id: 'h20', n: 'Sin ayuda', d: '20 niveles seguidos sin pistas', v: () => gwpD().stt.nhBest, goal: 20, rew: 5 },
  { id: 'a300', n: 'Glotón', d: 'Come 300 manzanas', v: () => gwpD().stt.ap, goal: 300, rew: 4 },
  { id: 'a1500', n: 'Barriga llena', d: 'Come 1500 manzanas', v: () => gwpD().stt.ap, goal: 1500, rew: 10, col: '#FF5D8F' },
  { id: 'd3', n: 'Constante', d: 'Racha de 3 retos del día', v: () => gwpD().day.best, goal: 3, rew: 3 },
  { id: 'd7', n: 'Una semana', d: 'Racha de 7 retos del día', v: () => gwpD().day.best, goal: 7, rew: 6, col: '#7DF0AC' },
  { id: 'd30', n: 'Un mes entero', d: 'Racha de 30 retos del día', v: () => gwpD().day.best, goal: 30, rew: 20, col: '#FF8A3A' },
  { id: 'w5', n: 'Coleccionista de mundos', d: 'Completa 5 mundos con todas las estrellas', v: () => Object.keys(gwpD().chest).filter((k) => gwpD().chest[k] === 3).length, goal: 5, rew: 8, col: '#5CB8FF' },
];
const gwpSpecialCols = () => GWP_ACH.filter((a) => a.col && gwpD().ach[a.id]).map((a) => [a.col, a.n]);

/* cuando se gana un nivel (lo llama gusano.js) */
function gwAfterWin(R, stars, mv, opt, prevS) {
  const D = gwpD(), t = D.stt;
  let ap = 0, m = R.st.mask & ((1 << R.L.nA) - 1); while (m) { ap += m & 1; m >>>= 1; }
  t.ap += ap; t.wins++;
  if (mv <= opt) t.perf++;
  if (R.hints) t.nh = 0; else { t.nh++; t.nhBest = Math.max(t.nhBest, t.nh); }
  const notes = [];
  // reto del día
  if (GWP.daily && GWP.daily === R.level && D.day.done !== gwpToday()) {
    const y = new Date(Date.now() - 86400000); const ys = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
    D.day.streak = D.day.last === ys ? D.day.streak + 1 : 1; D.day.last = gwpToday(); D.day.done = gwpToday(); D.day.best = Math.max(D.day.best, D.day.streak);
    const bonus = 3 + Math.min(7, D.day.streak); jgCoins(bonus); notes.push(`🗓️ ¡Reto del día! +${bonus} monedas · racha de ${D.day.streak} ${D.day.streak === 1 ? 'día' : 'días'}`);
    GWP.daily = 0;
  }
  // cofre del mundo: al tener los 10 niveles superados (1) y luego con todas las estrellas (3)
  const w = Math.floor((R.level - 1) / 10), a = w * 10 + 1, b = Math.min(GW_N(), a + 9); let all = true, all3 = true;
  for (let l = a; l <= b; l++) { const s = gwStarsAt(l); if (!s) all = false; if (s < 3) all3 = false; }
  const cs = D.chest[w] || 0;
  if (all && cs < 1) { D.chest[w] = 1; jgCoins(4); notes.push(`🎁 ¡Cofre de ${GW_ENVS[w % GW_ENVS.length].n}! +4 monedas`); }
  if (all3 && (D.chest[w] || 0) < 3) { D.chest[w] = 3; jgCoins(6); notes.push(`💎 ¡Mundo perfecto: ${GW_ENVS[w % GW_ENVS.length].n}! +6 monedas`); }
  // logros
  for (const A of GWP_ACH) { if (D.ach[A.id]) continue; if (A.v() >= A.goal) { D.ach[A.id] = Date.now(); jgCoins(A.rew); notes.push(`🏆 Logro: ${A.n} (+${A.rew} monedas${A.col ? ', color nuevo' : ''})`); } }
  jpSave();
  if (notes.length) {
    const wrap = document.querySelector('.gw-stage'); const el = wrap && wrap.querySelector('#gwRest');
    if (el) el.innerHTML = notes.map((x) => `<span class="gwp-note">${esc(x)}</span>`).join('') + (el.textContent ? `<span>${esc(el.textContent)}</span>` : '');
    setTimeout(() => { try { [0, 4, 7, 12].forEach((k, i) => setTimeout(() => JG_TONE(784 * Math.pow(2, k / 12), 0.14, 'triangle', 0.05), i * 80)); } catch { /* */ } }, 1300);
  }
}

/* sección extra en la pantalla de The Worn */
function gwpSection() {
  const D = gwpD(); const dl = gwpDailyLevel(); const doneToday = D.day.done === gwpToday();
  const streakOk = D.day.last && (D.day.last === gwpToday() || (() => { const y = new Date(Date.now() - 86400000); return D.day.last === `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`; })());
  const daily = `<div class="gwp-daily${doneToday ? ' done' : ''}"><div><b>🗓️ Reto del día · nivel ${dl}</b><span class="small">${doneToday ? '¡Listo por hoy! Vuelve mañana para seguir tu racha.' : `Supéralo hoy para ganar monedas extra${streakOk && D.day.streak ? ` y seguir tu racha de ${D.day.streak}` : ''}.`}</span>${D.day.streak && streakOk ? `<span class="gwp-streak">🔥 Racha: ${D.day.streak} · mejor: ${D.day.best}</span>` : ''}</div>${doneToday ? '<span class="gwp-ok">✓</span>' : `<button type="button" class="btn primary" data-act="gwp-daily" data-l="${dl}">Jugar</button>`}</div>`;
  const got = GWP_ACH.filter((a) => D.ach[a.id]).length;
  const ach = GWP_ACH.map((a) => { const v = Math.min(a.goal, a.v()), ok = !!D.ach[a.id]; return `<li class="${ok ? 'ok' : ''}"><span class="gwp-ic">${ok ? '🏆' : '🔒'}</span><div><b>${a.n}</b><span class="small muted">${a.d} · +${a.rew} monedas${a.col ? ' y un color especial' : ''}</span>${ok ? '' : `<div class="gwp-bar"><i style="width:${v / a.goal * 100}%"></i></div><span class="small muted">${v} / ${a.goal}</span>`}</div>${a.col ? `<i class="gwp-sw" style="background:${a.col}"></i>` : ''}</li>`; }).join('');
  const sc = gwpSpecialCols(); const cur = gwData().col;
  const cols = sc.length ? `<h2 class="sec">Colores especiales</h2><div class="gw-cols">${sc.map(([c, n]) => `<button type="button" class="gw-col${cur === c ? ' on' : ''}" style="background:${c};box-shadow:0 0 0 2px #fff,0 0 12px ${c}" data-act="gw-col" data-c="${c}" aria-label="Color ${n}"></button>`).join('')}</div>` : '';
  const t = D.stt;
  const stats = `<div class="gwp-stats"><span><b>${gwpCleared()}</b>niveles</span><span><b>${gwpCount3()}</b>con 3 ⭐</span><span><b>${t.perf}</b>exactos</span><span><b>${t.ap}</b>manzanas</span></div>`;
  return `${daily}${stats}${cols}<details class="gwp-ach"><summary><b>Logros</b><span>${got}/${GWP_ACH.length}</span></summary><ul>${ach}</ul></details>`;
}
{
  const base = viewGusano;
  viewGusano = function () { const h = base(); return h.replace('<h2 class="sec">Tu gusano</h2>', `${gwpSection()}<h2 class="sec">Tu gusano</h2>`); };
  EXTRA_VIEWS.gusano = viewGusano;
}
Object.assign(VIDA_ACTS, {
  'gwp-daily': (el) => { GWP.daily = +el.dataset.l; gwPlay(GWP.daily); },
});
{ const b = VIDA_ACTS['gw-play']; VIDA_ACTS['gw-play'] = (el) => { GWP.daily = 0; b(el); }; }
