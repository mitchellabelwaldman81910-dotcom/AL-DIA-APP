/* Cinnavia 7.20 — El Bosque reúne todo lo del grupo y tu horario en un solo lugar.
   Arriba del Bosque hay pestañas: Pendientes · Calendario · Horario · Materias.
   El calendario del grupo, tu horario de clases y tus materias ya no están en Más: viven aquí. */
'use strict';
const BOS = { tab: 'pend' };
const BOS_TABS = [['pend', 'Pendientes'], ['cal', 'Calendario'], ['hor', 'Horario'], ['mat', 'Materias']];
const bosHead = (title, sub) => groupHead(title, sub);
const bosStripHead = (h) => h.replace(/^\s*<section class="g-head">[\s\S]*?<\/section>/, '');

function bosTabs() {
  return `<div class="seg bos-tabs" role="group" aria-label="Secciones del Bosque">${BOS_TABS.map(([k, l]) => `<button type="button" data-act="bos-tab" data-v="${k}" aria-pressed="${BOS.tab === k}">${l}</button>`).join('')}</div>`;
}

const bosBaseGrupo = viewGrupo;
viewGrupo = function () {
  const base = bosBaseGrupo();
  const m = base.match(/^\s*<section class="g-head">[\s\S]*?<\/section>/);
  const head = m ? m[0] : '';
  const rest = m ? base.slice(head.length) : base;
  if (BOS.tab === 'cal') {
    let cal = '';
    try { cal = bosStripHead(viewGCal()); } catch (e) { cal = '<div class="empty"><h3>No se pudo cargar el calendario</h3></div>'; }
    return `${bosHead('Calendario', 'Exámenes, entregas y eventos del Bosque. Cualquiera puede agregar o subir un calendario.')}${bosTabs()}${cal}`;
  }
  if (BOS.tab === 'hor') {
    let hor = '';
    try { hor = timetableHTML(); } catch (e) { hor = '<div class="empty"><h3>No se pudo cargar el horario</h3></div>'; }
    return `${bosHead('Horario', 'Tus clases de la semana. Toca una clase para ver su materia.')}${bosTabs()}${hor}`;
  }
  if (BOS.tab === 'mat') {
    let mat = '';
    try { mat = viewMaterias().replace(/<h1 class="page-title">Materias<\/h1>/, ''); } catch (e) { mat = '<div class="empty"><h3>No se pudieron cargar las materias</h3></div>'; }
    return `${bosHead('Materias', 'Tus materias, sus horarios y tus calificaciones.')}${bosTabs()}${mat}`;
  }
  return `${head}${bosTabs()}${rest}`;
};

Object.assign(VIDA_ACTS, {
  'bos-tab': (el) => {
    const k = el && el.dataset ? el.dataset.v : 'pend';
    BOS.tab = BOS_TABS.some(([x]) => x === k) ? k : 'pend';
    if (location.hash !== '#/grupo') location.hash = '#/grupo';
    render();
    scrollTo({ top: 0, behavior: 'smooth' });
  },
});
