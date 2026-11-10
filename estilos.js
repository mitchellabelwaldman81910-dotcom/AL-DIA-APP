/* Al Día 7.4 — Estilos de diseño (plantillas visuales).
   Una sola fuente de verdad: las paletas generan el CSS real y las vistas previas. */
'use strict';

const ESTILOS = {
  bosque: { name: 'Bosque', desc: 'Verde calmado, el de siempre.', font: 'sans',
    light: { paper: '#F3FAF5', sheet: '#FFFFFF', ink: '#163A2B', pen: '#2F8A5B', pi: '#FFFFFF' },
    dark: { paper: '#0B1A14', sheet: '#12261D', ink: '#E6F3EA', pen: '#6FCF97', pi: '#0B1A14' } },
  ejecutivo: { name: 'Ejecutivo', desc: 'Azul marino, sobrio y serio.', font: 'serif',
    light: { paper: '#F3F5F9', sheet: '#FFFFFF', ink: '#14213D', pen: '#1F3A8A', pi: '#FFFFFF' },
    dark: { paper: '#0C1322', sheet: '#141D33', ink: '#E8EEF9', pen: '#7FA2FF', pi: '#0C1322' } },
  minimal: { name: 'Minimal', desc: 'Blanco y negro, sin distracciones.', font: 'sans',
    light: { paper: '#F6F6F4', sheet: '#FFFFFF', ink: '#1A1A1A', pen: '#1A1A1A', pi: '#FFFFFF' },
    dark: { paper: '#0D0D0D', sheet: '#181818', ink: '#F2F2F2', pen: '#F2F2F2', pi: '#0D0D0D' } },
  atardecer: { name: 'Atardecer', desc: 'Coral y crema, cálido y alegre.', font: 'sans',
    light: { paper: '#FFF6EE', sheet: '#FFFFFF', ink: '#4A2A1F', pen: '#D2603A', pi: '#FFFFFF' },
    dark: { paper: '#1B1210', sheet: '#291B17', ink: '#FBEBDD', pen: '#FF9468', pi: '#1B1210' } },
  oceano: { name: 'Océano', desc: 'Turquesa fresco y limpio.', font: 'sans',
    light: { paper: '#F0F8FA', sheet: '#FFFFFF', ink: '#0E3440', pen: '#0E7C8F', pi: '#FFFFFF' },
    dark: { paper: '#07171C', sheet: '#0E2830', ink: '#E2F4F7', pen: '#5FD0E2', pi: '#07171C' } },
  violeta: { name: 'Violeta', desc: 'Morado elegante, como Tu Cerebro.', font: 'sans',
    light: { paper: '#F6F3FC', sheet: '#FFFFFF', ink: '#2A1F4D', pen: '#6C4CD6', pi: '#FFFFFF' },
    dark: { paper: '#110A22', sheet: '#1A1233', ink: '#EDE6FF', pen: '#B59CFF', pi: '#110A22' } },
  rosa: { name: 'Rosa suave', desc: 'Pastel delicado y dulce.', font: 'sans',
    light: { paper: '#FDF3F6', sheet: '#FFFFFF', ink: '#4A2434', pen: '#C2527A', pi: '#FFFFFF' },
    dark: { paper: '#1C0F15', sheet: '#2A1820', ink: '#FCE8EF', pen: '#F08FB2', pi: '#1C0F15' } },
};

function styleVars(p, dark) {
  const mix = (a, b, n) => `color-mix(in srgb, ${a} ${n}%, ${b})`;
  const w = dark ? '#000' : '#fff';
  return `--paper:${p.paper};--sheet:${p.sheet};--sheet-2:${mix(p.pen, p.sheet, dark ? 12 : 8)};--ink:${p.ink};--ink-2:${mix(p.ink, p.paper, 72)};--ink-3:${mix(p.ink, p.paper, 48)};`
    + `--pen:${p.pen};--pen-ink:${p.pi};--pen-soft:${mix(p.pen, p.sheet, dark ? 16 : 13)};--hl:${mix(p.pen, p.sheet, dark ? 70 : 28)};--hl-ink:${dark ? p.paper : p.ink};`
    + `--ok:${mix('#2F9E67', p.pen, 60)};--ok-soft:${mix('#2F9E67', p.sheet, 14)};--line:${mix(p.ink, 'transparent', dark ? 16 : 11)};--glass:${mix(p.sheet, 'transparent', 78)};`
    + `--shadow:${dark ? '0 18px 36px -20px rgba(0,0,0,.8)' : `0 1px 0 rgba(255,255,255,.9) inset, 0 12px 30px -20px ${mix(p.ink, 'transparent', 45)}`};`
    + `--t1:${mix(p.pen, w, dark ? 40 : 70)};--t2:${mix(p.pen, w, dark ? 55 : 85)};--t3:${p.pen};--hillA:${mix(p.pen, p.paper, 18)};--hillB:${mix(p.pen, p.paper, 30)};--hillC:${mix(p.pen, p.paper, 44)};`;
}

(function injectStyles() {
  let css = '';
  for (const [k, s] of Object.entries(ESTILOS)) {
    if (k === 'bosque') continue;
    css += `:root[data-style="${k}"][data-theme="light"]{${styleVars(s.light, false)}}\n:root[data-style="${k}"][data-theme="dark"]{${styleVars(s.dark, true)}}\n`;
  }
  const el = document.createElement('style'); el.id = 'estilosCss'; el.textContent = css; document.head.appendChild(el);
})();

function currentStyle() { const k = (typeof S !== 'undefined' && S.settings && S.settings.style) || 'bosque'; return ESTILOS[k] ? k : 'bosque'; }
function applyStyle() {
  const k = currentStyle(); const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-style', k);
  const p = ESTILOS[k][dark ? 'dark' : 'light'];
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', p.paper));
}

/* Vista previa: un mini teléfono por modo (día | noche) */
function stylePreview(k) {
  const s = ESTILOS[k]; const half = (p, dark) => {
    const line = `color-mix(in srgb, ${p.ink} 14%, transparent)`; const soft = `color-mix(in srgb, ${p.pen} ${dark ? 18 : 13}%, ${p.sheet})`;
    return `<div class="sp-h" style="background:${p.paper};color:${p.ink}">
      <i class="sp-t" style="background:${p.ink}"></i><i class="sp-s" style="background:${p.ink};opacity:.35"></i>
      <div class="sp-c" style="background:${p.sheet};border-color:${line}"><i class="sp-dot" style="background:${p.pen}"></i><span><i style="background:${p.ink};opacity:.8"></i><i style="background:${p.ink};opacity:.3;width:60%"></i></span></div>
      <div class="sp-c" style="background:${p.sheet};border-color:${line}"><i class="sp-dot" style="background:${soft};box-shadow:inset 0 0 0 2px ${p.pen}"></i><span><i style="background:${p.ink};opacity:.8;width:70%"></i><i style="background:${p.ink};opacity:.3;width:45%"></i></span></div>
      <b class="sp-b" style="background:${p.pen};color:${p.pi}">Listo</b>
      <div class="sp-n" style="background:${p.sheet};border-color:${line}"><i style="background:${p.pen}"></i><i style="background:${p.ink};opacity:.25"></i><i style="background:${p.ink};opacity:.25"></i><i style="background:${p.ink};opacity:.25"></i></div>
    </div>`;
  };
  return `<div class="sp ${s.font === 'serif' ? 'serif' : ''}" aria-hidden="true">${half(s.light, false)}${half(s.dark, true)}</div>`;
}

function estilosSheetHTML() {
  const cur = currentStyle(); const dark = (S.settings.theme === 'dark');
  return `${sheetHead('Estilo de la app')}<div class="sheet-body">
    <p class="muted" style="margin:0 0 12px">Elige una plantilla: toda la app cambia al instante. Cada una trae su versión de día y de noche.</p>
    <div class="seg" role="group" aria-label="Día o noche" style="margin-bottom:14px">${[['light', 'Día'], ['dark', 'Noche']].map(([v, l]) => `<button type="button" data-act="style-mode" data-v="${v}" aria-pressed="${(dark ? 'dark' : 'light') === v}">${l}</button>`).join('')}</div>
    <div class="sty-grid">${Object.entries(ESTILOS).map(([k, s]) => `<button type="button" class="sty-card" data-act="style-set" data-v="${k}" aria-pressed="${cur === k}">${stylePreview(k)}<span class="sty-n"><b>${s.name}</b>${cur === k ? '<em>En uso</em>' : ''}</span><span class="small muted">${s.desc}</span></button>`).join('')}</div></div>`;
}
function openEstilos() { openSheet(estilosSheetHTML()); }
function estilosRowHTML() {
  const k = currentStyle();
  return `<button type="button" class="btn block" data-act="style-open" style="justify-content:space-between"><span>${icon('palette', 'sm')}Estilo de la app</span><span class="muted small">${ESTILOS[k].name}</span></button>`;
}

Object.assign(VIDA_ACTS, {
  'style-open': () => openEstilos(),
  'style-mode': (el) => { S.settings.theme = el.dataset.v; save(); applyTheme(); openSheet(estilosSheetHTML()); },
  'style-set': (el) => { const k = el.dataset.v; if (!ESTILOS[k]) return; S.settings.style = k; save(); applyTheme(); if (typeof Snd !== 'undefined' && Snd.chime) Snd.chime(); openSheet(estilosSheetHTML()); },
});
