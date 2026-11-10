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
    <span class="ha-frame">${treeScene({ level: c.level, wet: c.wet, id: 'hoy', seed: REG.me, garden }).replace('viewBox="0 0 360 300"', 'viewBox="0 64 360 236"')}</span>
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
    ['#/panel', 'bars', 'Mi semana', 'Carga y tiempo libre'],
    ['act:sos-open', 'flag', 'Emergencia', 'Plan de daños mínimos'],
    ['#/cerebro', 'network', 'Tu Cerebro', 'Todo, conectado'],
    ['act:lobby-open', 'globe', 'Biblioteca', 'Estudia acompañado'],
    ['#/salones', 'users', 'Salones', 'Tu grupo en vivo'],
    ['act:speak-day', 'play', 'Escuchar', 'Tu día en voz alta'],
  ];
  return `<h2 class="sec">Atajos</h2><div class="hoy-tools">${t.map(([h, ic, b, s]) => h.startsWith('act:')
    ? `<button type="button" class="ht" data-act="${h.slice(4)}">${icon(ic)}<b>${b}</b><span>${s}</span></button>`
    : `<a class="ht" href="${h}">${icon(ic)}<b>${b}</b><span>${s}</span></a>`).join('')}</div>`;
}

function hoyEpigraphHTML() {
  return `<figure class="hoy-epi"><span class="he-rule"></span><blockquote>${esc(phraseOfDay())}</blockquote></figure>`;
}
