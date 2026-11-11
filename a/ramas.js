/* Cinnavia 7.28 — Pensamientos en ramas: cada tipo (idea, gratitud, meta, lo que suelto, recuerdo) es una rama de otro color
   que crece hacia su propia dirección; cada pensamiento nuevo la hace avanzar. Se pueden unir varios pensamientos en uno solo. */
'use strict';
const RM = { view: 'ramas', sel: null, join: false, set: [], jm: 'idea' };
const RM_ORDER = ['idea', 'gratitud', 'meta', 'suelto', 'recuerdo'];
const RM_NAME = { idea: 'Ideas', gratitud: 'Gratitud', meta: 'Metas', suelto: 'Lo que suelto', recuerdo: 'Recuerdos' };
function rmPos(i, t, y0, yend) {
  const xi = [34, 107, 180, 253, 326][i]; const s = Math.min(1, t * 1.55); const e = s * s * (3 - 2 * s);
  return [180 + (xi - 180) * e + Math.sin(t * 6.6 + i * 1.4) * 9 * Math.min(1, t * 3), y0 - (y0 - yend) * t];
}
function ramasSVG() {
  const by = {}; RM_ORDER.forEach((k) => (by[k] = S.thoughts.filter((t) => t.mood === k).sort((a, b) => a.at - b.at)));
  const mx = Math.max(1, ...RM_ORDER.map((k) => by[k].length)); const H = Math.max(420, 190 + mx * 56); const gy = H - 44;
  const dim = (k) => UI.mood !== 'all' && UI.mood !== k;
  let out = `<svg class="rm-svg" viewBox="0 0 360 ${H}" role="img" aria-label="Tus pensamientos como ramas de un árbol"><defs><linearGradient id="rmTr" x1="0" x2="1"><stop offset="0" stop-color="#6B4A2A"/><stop offset=".5" stop-color="#8A6338"/><stop offset="1" stop-color="#5C3F22"/></linearGradient></defs>`;
  out += `<path d="M0 ${gy + 6} C90 ${gy - 4} 270 ${gy + 14} 360 ${gy + 2} V${H} H0Z" fill="rgba(110,160,110,.18)"/>`;
  RM_ORDER.forEach((k, i) => { const c = MOODS[k].color; const xe = [20, 90, 170, 270, 340][i]; out += `<path d="M180 ${gy + 2} C${180 + (xe - 180) * 0.2} ${gy + 20} ${xe} ${gy + 14} ${xe} ${H - 6}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" opacity=".5"/>`; });
  out += `<path d="M168 ${gy + 4} C172 ${gy - 30} 174 ${gy - 60} 172 ${gy - 96} L190 ${gy - 96} C188 ${gy - 60} 190 ${gy - 30} 194 ${gy + 4}Z" fill="url(#rmTr)"/>`;
  RM_ORDER.forEach((k, i) => {
    const n = by[k].length, c = MOODS[k].color, y0 = gy - 70 - (i % 3) * 8, yend = Math.max(60, y0 - (80 + n * 56)); const pts = []; for (let j = 0; j <= 40; j++) pts.push(rmPos(i, j / 40, y0, yend));
    const d = (a, b) => pts.slice(a, b + 1).map((p, j) => `${j ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
    const op = dim(k) ? 0.22 : 1; const dl = i * 0.12;
    out += `<g style="opacity:${op}" class="rm-br" data-i="${i}"><path class="rm-grow" pathLength="1" d="${d(0, 40)}" stroke="${c}" stroke-width="6.4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="animation-delay:${dl}s"/><path class="rm-grow" pathLength="1" d="${d(14, 40)}" stroke="${c}" stroke-width="4.2" fill="none" stroke-linecap="round" style="animation-delay:${dl + 0.15}s;filter:brightness(.92)"/>`;
    const tip = pts[40]; out += `<circle cx="${tip[0]}" cy="${tip[1] - 3}" r="5" fill="${c}" class="rm-bud"/><text x="${Math.max(30, Math.min(330, tip[0]))}" y="${Math.max(14, tip[1] - 14)}" text-anchor="middle" class="rm-lbl" fill="${c}">${RM_NAME[k]}${n ? ' · ' + n : ''}</text>`;
    by[k].forEach((t, j) => {
      const tt = 0.12 + 0.82 * ((j + 1) / n), [x, y] = rmPos(i, tt, y0, yend); const sel = RM.join ? RM.set.includes(t.id) : RM.sel === t.id; const side = j % 2 ? 1 : -1; const merged = (t.merged || 0) > 1;
      out += `<g class="rm-node ${sel ? 'on' : ''}" data-act="rm-node" data-id="${t.id}" style="animation-delay:${0.5 + dl + j * 0.07}s" tabindex="0" role="button" aria-label="${esc(MOODS[k].label)}: ${esc(t.text.slice(0, 40))}">
        <ellipse cx="${x + side * 11}" cy="${y - 3}" rx="8.5" ry="4.4" transform="rotate(${side * -35} ${x + side * 11} ${y - 3})" fill="${c}" opacity=".85"/>
        ${merged ? `<circle cx="${x}" cy="${y}" r="12.5" fill="none" stroke="${c}" stroke-width="1.6"/>` : ''}<circle cx="${x}" cy="${y}" r="${merged ? 8.2 : 6.4}" fill="#fff" stroke="${c}" stroke-width="2.6"/>${sel ? `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${c}" stroke-width="2" stroke-dasharray="3 3" class="rm-sel"/>` : ''}<circle cx="${x}" cy="${y}" r="15" fill="transparent"/></g>`;
    });
    out += '</g>';
  });
  return out + '</svg>';
}
function ramasHTML() {
  const sel = RM.join ? null : S.thoughts.find((t) => t.id === RM.sel);
  const card = RM.join ? `<div class="rm-card rm-joinbar"><div><b>Unir ideas</b><span class="small muted">Toca los pensamientos que quieras juntar. ${RM.set.length ? `Llevas ${RM.set.length}.` : 'Elige al menos 2.'}</span></div><div class="btn-row"><button class="btn" data-act="rm-join-off">Cancelar</button><button class="btn primary" data-act="rm-join-do" ${RM.set.length < 2 ? 'disabled' : ''}>Unir${RM.set.length > 1 ? ' ' + RM.set.length : ''}</button></div></div>`
    : sel ? `<div class="rm-card" style="--c:${(MOODS[sel.mood] || MOODS.idea).color}"><span class="thought-mood">${(MOODS[sel.mood] || MOODS.idea).label}${(sel.merged || 0) > 1 ? ` · unión de ${sel.merged}` : ''}</span><p>${esc(sel.text)}</p><span class="tiny faint">${fmtStamp(sel.at)}</span><div class="btn-row" style="margin-top:10px"><button class="btn" data-act="thought-open" data-id="${sel.id}">Abrir</button><button class="btn" data-act="rm-join-on" data-id="${sel.id}">${icon('plus', 'sm')}Unir con otras</button></div></div>`
    : S.thoughts.length ? `<p class="small muted" style="text-align:center;margin:6px 0 0">Toca un pensamiento para leerlo. Cada tipo crece hacia su propio rumbo.</p>` : '';
  return `${S.thoughts.length ? `<div class="rm-wrap">${ramasSVG()}</div>${card}${S.thoughts.length > 1 && !RM.join ? `<div class="btn-row" style="justify-content:center;margin-top:10px"><button class="btn" data-act="rm-join-on">${icon('plus', 'sm')}Unir ideas</button></div>` : ''}` : `<div class="empty" style="margin-top:22px"><h3>Tu árbol está por crecer</h3><p>Planta tu primer pensamiento: cada tipo crece como una rama de otro color hacia su propio rumbo.</p></div>`}`;
}
{
  const baseMente = viewMente;
  viewMente = function () {
    const h = baseMente(); let i = h.indexOf('<div class="thought-tree">'); if (i < 0) i = h.indexOf('<div class="empty" style="margin-top:22px">');
    const tog = `<div class="seg rm-tog" role="group" aria-label="Vista">${[['ramas', 'Ramas'], ['lista', 'Lista']].map(([k, n]) => `<button type="button" data-act="rm-view" data-v="${k}" aria-pressed="${RM.view === k}">${n}</button>`).join('')}</div>`;
    const j = h.indexOf('<div class="breath-card">'); const head = j >= 0 ? h.slice(0, j) + tog + h.slice(j) : h;
    const tail = i >= 0 ? h.slice(i) : '';
    if (RM.view === 'lista' || i < 0) return j >= 0 ? head : h;
    return head.slice(0, head.length - tail.length) + ramasHTML();
  };
  EXTRA_VIEWS.mente = viewMente;
}
const rmRedraw = () => { lastRenderRoute = null; render(); };
function rmJoinSheet() {
  const items = RM.set.map((id) => S.thoughts.find((t) => t.id === id)).filter(Boolean).sort((a, b) => a.at - b.at); if (items.length < 2) return;
  RM.jm = items[0].mood;
  openSheet(`${sheetHead('Unir en una sola idea')}<div class="sheet-body"><p class="muted" style="margin:0 0 10px">Estos ${items.length} pensamientos se juntan en uno. Puedes editar el texto y elegir de qué rama será.</p>
    <div class="field"><label class="sr" for="rmText">Texto</label><textarea id="rmText" class="input" style="min-height:170px">${esc(items.map((t) => t.text).join('\n\n'))}</textarea></div>
    <div class="field"><span class="lbl">Rama</span><div class="pick" role="group" id="rmMoods">${Object.entries(MOODS).map(([k, m]) => `<button type="button" data-act="rm-mood" data-v="${k}" aria-pressed="${RM.jm === k}"><span class="dot" style="background:${m.color}"></span>${m.label}</button>`).join('')}</div></div></div>
    <div class="sheet-foot"><span class="grow"></span><button type="button" class="btn primary" data-act="rm-join-ok">Unir</button></div>`);
}
Object.assign(VIDA_ACTS, {
  'rm-view': (el) => { RM.view = el.dataset.v; RM.join = false; RM.set = []; rmRedraw(); },
  'rm-node': (el) => { const id = el.dataset.id; if (RM.join) { const i = RM.set.indexOf(id); if (i >= 0) RM.set.splice(i, 1); else RM.set.push(id); } else RM.sel = RM.sel === id ? null : id; Snd.tick && Snd.tick(); rmRedraw(); },
  'rm-join-on': (el) => { RM.join = true; RM.set = el.dataset.id ? [el.dataset.id] : []; RM.sel = null; rmRedraw(); },
  'rm-join-off': () => { RM.join = false; RM.set = []; rmRedraw(); },
  'rm-join-do': () => rmJoinSheet(),
  'rm-mood': (el) => { RM.jm = el.dataset.v; el.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === el)); },
  'rm-join-ok': () => {
    const txt = (document.getElementById('rmText')?.value || '').trim(); const ids = RM.set.slice(); if (!txt || ids.length < 2) return;
    const old = ids.map((id) => S.thoughts.find((t) => t.id === id)).filter(Boolean); const nt = { id: uid(), text: txt, mood: RM.jm, at: Date.now(), merged: old.reduce((a, t) => a + (t.merged || 1), 0) };
    const backup = old.map((t) => ({ t: { ...t }, i: S.thoughts.findIndex((x) => x.id === t.id) }));
    closeSheet(false); RM.join = false; RM.set = []; RM.sel = nt.id;
    commit((st) => { st.thoughts = st.thoughts.filter((t) => !ids.includes(t.id)); st.thoughts.push(nt); }); Snd.chime && Snd.chime();
    toast('Listo: ahora son una sola idea.', { action: 'Deshacer', onAction: () => { RM.sel = null; commit((st) => { st.thoughts = st.thoughts.filter((t) => t.id !== nt.id); backup.sort((a, b) => a.i - b.i).forEach((b) => st.thoughts.splice(Math.min(b.i, st.thoughts.length), 0, b.t)); }); } });
  },
});
