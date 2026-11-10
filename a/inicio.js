/* Al Día 7.9 — Inicio como una pieza editorial.
   Portada: fecha en serif, tu árbol enmarcado como una lámina con su ficha, tres cifras del día,
   una sola captura, "Tu día" (clase y energía), el plan y las entregas, atajos en cuadrícula
   y un epígrafe al cierre. Nada se repite ni compite por atención. */
'use strict';

function hoyArtHTML() {
  if (isGroup() || !REG.me || !profile()) return '';
  let c; try { c = treeNow(dataOwner()); } catch { return ''; }
  const pct = c.need > c.cur ? brClampPct(((c.pts - c.cur) / (c.need - c.cur)) * 100) : 100;
  const qs = typeof questsToday === 'function' ? questsToday() : []; const ready = qs.filter((q) => q.ok && !q.claimed).length;
  const garden = typeof vidaData === 'function' ? vidaData().garden : null;
  return `<a class="hoy-art" href="#/vida" aria-label="Tu árbol, nivel ${c.level}. Abrir Vida">
    <span class="ha-frame">${treeScene({ level: c.level, wet: c.wet, id: 'hoy', seed: REG.me, garden, species: typeof curSpecies === 'function' ? curSpecies() : 'roble', fx: typeof curFX === 'function' ? curFX() : null }).replace('viewBox="0 0 360 300"', 'viewBox="0 64 360 236"')}</span>
    <span class="ha-cap">
      <span class="ha-top"><b>Nivel ${c.level}</b><span class="ha-st">${esc(stageName(c.level))}</span><span class="ha-sk">${c.streak ? `Racha ${c.streak}` : ''}</span></span>
      <span class="ha-p"><i style="width:${pct}%"></i></span>
      <span class="ha-r">${c.wet ? 'Regado hoy' : '<em>Tiene sed: súbele algo hoy</em>'}${ready ? ` · ${plural(ready, 'misión lista', 'misiones listas')}` : ''}</span>
    </span></a>`;
}
const brClampPct = (v) => Math.max(0, Math.min(100, Math.round(v)));

function hoyStatsHTML(pend, dueToday, late) {
  const t0 = today(); const wk = addDays(t0, -6);
  const doneWk = S.tasks.filter((t) => t.done && t.doneAt && toISO(new Date(t.doneAt)) >= wk).length;
  const cell = (n, l, cls = '') => `<span class="hs ${cls}"><b>${n}</b><span>${l}</span></span>`;
  return `<div class="hoy-stats">${cell(pend.length, pend.length === 1 ? 'Pendiente' : 'Pendientes')}${cell(dueToday.length, 'Para hoy', dueToday.length ? 'pen' : '')}${late.length ? cell(late.length, late.length === 1 ? 'Atrasada' : 'Atrasadas', 'late') : cell(doneWk, 'Esta semana')}</div>`;
}

function hoyCaptureHTML() {
  return `<form class="quick hoy-quick" id="quickForm" autocomplete="off">
      <div class="quick-row">
        <label for="quickIn" class="sr">Nueva tarea rápida</label>
        <input id="quickIn" enterkeyhint="done" placeholder="Nueva tarea, p. ej. ensayo el viernes">
        <a class="hq-ico" href="#/escanear" aria-label="Escanear una foto de tarea">${icon('cam')}</a>
        <button class="quick-go" id="quickGo" disabled aria-label="Agregar">${icon('plus', 'sm')}<span>Agregar</span></button>
      </div>
      <div class="quick-preview" id="quickPrev"></div>
    </form>`;
}

function hoyDayHTML(nowHTML) {
  if (isGroup()) return nowHTML;
  const e = typeof energyNow === 'function' ? energyNow() : 'normal';
  const en = typeof ENERGIES !== 'undefined' ? `<div class="hd-energy"><span class="hd-k">Energía</span>
      <div class="seg sm" role="group" aria-label="¿Cómo te sientes hoy?">${Object.entries(ENERGIES).map(([k, [ic, l]]) => `<button type="button" data-act="energy" data-v="${k}" aria-pressed="${e === k}">${icon(ic, 'sm')}<span>${l}</span></button>`).join('')}</div>
      <p class="hd-tip">${esc(ENERGIES[e][2])}</p></div>` : '';
  return `<section class="hoy-day">${nowHTML}${en}</section>`;
}

function hoyToolsHTML() {
  if (isGroup()) return '';
  const t = [
    ['act:help-open', 'help', 'Pedir ayuda', 'Te responden en vivo'],
    ['#/libretas', 'book', 'Libretas', 'Una por materia'],
    ['#/quiz', 'spark', 'Quiz inteligente', 'Practica lo que sabes'],
    ['#/biblioteca', 'globe', 'Biblioteca General', 'Habla con todos'],
    ['#/salones', 'users', 'Bosques', 'Para grupos, en vivo'],
    ['act:lobby-open', 'headphones', 'Estudia conmigo', 'Sala de enfoque'],
    ['#/panel', 'bars', 'Mi semana', 'Carga y tiempo libre'],
    ['act:sos-open', 'flag', 'Emergencia', 'Plan de daños mínimos'],
    ['#/cerebro', 'network', 'Tu Cerebro', 'Todo, conectado'],
  ];
  return `<h2 class="sec">Atajos</h2><div class="hoy-tools">${t.map(([h, ic, b, s]) => h.startsWith('act:')
    ? `<button type="button" class="ht" data-act="${h.slice(4)}">${icon(ic)}<b>${b}</b><span>${s}</span></button>`
    : `<a class="ht" href="${h}">${icon(ic)}<b>${b}</b><span>${s}</span></a>`).join('')}</div>`;
}

function hoyEpigraphHTML() {
  return `<figure class="hoy-epi"><span class="he-rule"></span><blockquote>${esc(phraseOfDay())}</blockquote></figure>`;
}

/* Panorama del día: un paisaje en acuarela y trazo fino que cambia cada día y con la hora
   (amanecer, día, atardecer y noche). Montañas, lago con reflejo, pinos, aves y estrellas. */
function heroScene() {
  const d = today(); const R = rnd(seedOf('hero:' + d)); const dp = document.documentElement.getAttribute('data-daypart') || 'day';
  const night = dp === 'night' || document.documentElement.getAttribute('data-theme') === 'dark';
  const W = 400, H = 230, u = 'hero';
  const ridge = (y0, amp, n, jag) => { let p = `M0 ${H}L0 ${y0}`; for (let i = 1; i <= n; i++) { const x = (i / n) * W; const y = y0 - amp * (0.35 + R() * 0.65) * (i % 2 ? 1 : jag); p += `L${x.toFixed(1)} ${y.toFixed(1)}`; } return p + `L${W} ${H}Z`; };
  const soft = (y0, amp) => { let p = `M0 ${H}L0 ${y0}`; let x = 0; while (x < W) { const nx = x + 60 + R() * 50; const cy = y0 - amp * (0.4 + R() * 0.6); p += `Q${(x + nx) / 2} ${cy.toFixed(1)} ${Math.min(W, nx).toFixed(1)} ${(y0 - R() * amp * 0.3).toFixed(1)}`; x = nx; } return p + `L${W} ${H}Z`; };
  const sx = 70 + R() * 260, sy = night ? 46 + R() * 18 : dp === 'dawn' || dp === 'dusk' ? 118 + R() * 10 : 52 + R() * 22;
  let o = `<svg class="hero-svg ln-scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>
    <linearGradient id="sky-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sk-a"/><stop offset=".7" class="sk-b"/><stop offset="1" class="sk-c"/></linearGradient>
    <radialGradient id="sun-${u}" cx="${sx}" cy="${sy}" r="150" gradientUnits="userSpaceOnUse"><stop offset="0" class="sg-a"/><stop offset=".3" class="sg-b"/><stop offset="1" class="sg-c"/></radialGradient>
    <linearGradient id="mt-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="mt-a"/><stop offset="1" class="mt-b"/></linearGradient>
    <linearGradient id="hl-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="hl-a"/><stop offset="1" class="hl-b"/></linearGradient>
    <linearGradient id="lk-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="lk-a"/><stop offset="1" class="lk-b"/></linearGradient>
    <linearGradient id="fade-${u}" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" class="fd-b"/></linearGradient>
    <filter id="blur-${u}"><feGaussianBlur stdDeviation="2.4"/></filter></defs>
    <rect width="${W}" height="${H}" fill="url(#sky-${u})"/><rect width="${W}" height="${H}" fill="url(#sun-${u})" class="w-sun"/>`;
  if (night) { for (let i = 0; i < 46; i++) { const x = R() * W, y = R() * 120, r = R() < 0.15 ? 1.1 : 0.6; o += `<circle class="hs-star" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" style="--d:${(R() * 5).toFixed(2)}s"/>`; }
    o += `<g transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)})"><circle class="ln g" stroke-width="1" r="13"/><circle class="moon-f" r="13"/><circle class="ln g" stroke-width=".5" r="21" opacity=".4"/></g>`;
  } else o += `<g transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)})"><circle class="ln g" stroke-width="1.1" r="15"/><circle class="ln g" stroke-width=".6" r="22" opacity=".5"/></g>`;
  if (!night) for (let i = 0; i < 2; i++) { const cx = 20 + R() * 320, cy = 30 + R() * 40; o += `<g class="hs-cloud" style="--d:${i * 9}s"><path class="ln s" stroke-width="1" d="M${cx.toFixed(1)} ${cy.toFixed(1)}h52c8 0 10-11 1-13c-1-11-15-14-21-6c-5-10-21-8-21 3c-9-1-13 9-11 16z"/></g>`; }
  o += `<path fill="url(#mt-${u})" d="${ridge(128, 52, 9, 0.45)}"/>`;
  o += `<path fill="url(#mt-${u})" opacity=".85" d="${ridge(150, 40, 12, 0.5)}"/>`;
  o += `<path fill="url(#hl-${u})" d="${soft(170, 22)}"/>`;
  // lago con reflejo
  const ly = 186; o += `<rect x="0" y="${ly}" width="${W}" height="${H - ly}" fill="url(#lk-${u})"/>`;
  o += `<g class="hs-ref" filter="url(#blur-${u})" opacity=".35" transform="translate(0 ${ly * 2}) scale(1 -1)"><path fill="url(#mt-${u})" d="${soft(170, 22)}"/></g>`;
  for (let i = 0; i < 9; i++) { const x = R() * W, y = ly + 6 + R() * 30, w = 10 + R() * 30; o += `<path class="ln w hs-glint" stroke-width=".7" d="M${x.toFixed(1)} ${y.toFixed(1)}h${w.toFixed(1)}" style="--d:${(R() * 4).toFixed(2)}s"/>`; }
  // pinos a la orilla
  let px = -4; while (px < W) { const h = 10 + R() * 22; if (R() < 0.7) { o += `<path class="ln" stroke-width=".9" fill="none" d="M${px.toFixed(1)} ${ly}V${(ly - h).toFixed(1)}M${(px - h * 0.28).toFixed(1)} ${(ly - h * 0.35).toFixed(1)}L${px.toFixed(1)} ${(ly - h).toFixed(1)}L${(px + h * 0.28).toFixed(1)} ${(ly - h * 0.35).toFixed(1)}M${(px - h * 0.22).toFixed(1)} ${(ly - h * 0.6).toFixed(1)}L${px.toFixed(1)} ${(ly - h * 0.95).toFixed(1)}L${(px + h * 0.22).toFixed(1)} ${(ly - h * 0.6).toFixed(1)}"/>`; } px += 6 + R() * 16; }
  o += `<path class="ln" stroke-width="1.1" fill="none" d="M0 ${ly}H${W}"/>`;
  if (!night) for (let i = 0; i < 3; i++) o += `<g class="v-bird" style="--d:${(i * 2.4).toFixed(1)}s;--y:${(40 + R() * 50).toFixed(1)}px"><path class="ln" stroke-width="1" fill="none" d="M0 0q4 -4.5 8 0q4 -4.5 8 0"/></g>`;
  else for (let i = 0; i < 8; i++) o += `<circle class="v-fly dot" cx="${(R() * W).toFixed(1)}" cy="${(150 + R() * 40).toFixed(1)}" r="1.2" style="--d:${(R() * 4).toFixed(2)}s"/>`;
  o += `<rect width="${W}" height="${H}" fill="url(#fade-${u})"/></svg>`;
  return o;
}
function hoyHeroHTML() { if (isGroup()) return ''; return `<div class="hoy-hero">${heroScene()}</div>`; }
