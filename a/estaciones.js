/* Cinnavia 7.22 — Estaciones del año en Vida.
   Según la fecha real (y el hemisferio, que se deduce de la zona horaria), el paisaje de tu árbol
   cambia: primavera con pétalos, verano soleado, otoño con hojas doradas e invierno con nieve. */
'use strict';
const EST_SUR = /^(America\/(Argentina|Santiago|Sao_Paulo|Montevideo|Asuncion|La_Paz|Lima|Cuiaba|Campo_Grande|Bahia|Fortaleza|Recife|Manaus)|Australia|Pacific\/(Auckland|Fiji)|Africa\/(Johannesburg|Maputo|Harare|Lusaka|Windhoek|Luanda)|Indian\/Reunion)/;
const EST_NAMES = { primavera: 'Primavera', verano: 'Verano', otono: 'Otoño', invierno: 'Invierno' };
function estSouth() { try { return EST_SUR.test(Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch { return false; } }
function seasonNow(d = new Date()) {
  const md = (d.getMonth() + 1) * 100 + d.getDate();
  let s = md >= 321 && md < 621 ? 'primavera' : md >= 621 && md < 923 ? 'verano' : md >= 923 && md < 1221 ? 'otono' : 'invierno';
  if (estSouth()) s = { primavera: 'otono', verano: 'invierno', otono: 'primavera', invierno: 'verano' }[s];
  return s;
}
function applySeason() { try { document.documentElement.setAttribute('data-season', seasonNow()); } catch { /* */ } }
applySeason(); setInterval(applySeason, 30 * 60000);
function seasonLayer() {
  const s = seasonNow(); const N = s === 'invierno' ? 22 : s === 'verano' ? 7 : 13; let p = '';
  for (let i = 0; i < N; i++) {
    const r = (k) => { const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
    p += `<i style="left:${Math.round(r(1) * 100)}%;--d:${(-r(2) * 14).toFixed(1)}s;--t:${(9 + r(3) * 9).toFixed(1)}s;--dx:${Math.round((r(4) - 0.5) * 70)}px;--s:${(0.6 + r(5) * 0.9).toFixed(2)}"></i>`;
  }
  return `<div class="vs-layer vs-${s}" aria-hidden="true"><span class="vs-tint"></span>${p}<span class="vs-tag">${EST_NAMES[s]}</span></div>`;
}
