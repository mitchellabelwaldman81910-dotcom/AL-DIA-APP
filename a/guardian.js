/* Cinnavia 7.42 — Guardián del Bosque (docentes).
   · Al crear tu usuario eliges: Estudiante o Guardián del Bosque. El tipo viaja con la cuenta.
   · El Guardián publica avisos, pasa lista y registra calificaciones; el servidor rechaza esas acciones de cualquier otra cuenta.
   · Las y los estudiantes ven los avisos, su asistencia y sus propias calificaciones (nunca las de otras personas). */
'use strict';
const GD = { tab: 'avisos', date: null, ev: null };
const roleOf = (id) => {
  const u = (REG.users || []).find((x) => x.id === id);
  if (id === REG.me && u && u.role) return u.role;
  return (FOR.members && FOR.members[id] && FOR.members[id].role) || 'student';
};
const isGuardian = (id = REG.me) => roleOf(id) === 'guardian';
const gdBadge = () => '<span class="gd-badge">Guardián</span>';
const gdRoster = () => { const f = forestMeta(); return f ? f.members.filter((m) => !isGuardian(m)) : []; };
const gdNum = (n) => (Math.round(n * 10) / 10).toString();
const gdMarks = [['p', 'Presente'], ['r', 'Retardo'], ['j', 'Justificada'], ['f', 'Falta']];

function gdAvisos(guard) {
  const list = gAll('aviso').sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.at - a.at);
  return `${guard ? `<form class="gd-form" id="gdAvisoForm" autocomplete="off"><input class="input" id="gdATitle" maxlength="80" placeholder="Título del aviso"><textarea class="input" id="gdAText" rows="3" maxlength="1000" placeholder="Escribe el aviso para todo el Bosque…"></textarea>
    <div class="gd-row"><label class="gd-chk"><input type="checkbox" id="gdAPin"> Fijar arriba</label><input class="input" type="date" id="gdADue" aria-label="Fecha límite (opcional)"><button class="btn primary" type="submit">${icon('plus', 'sm')}Publicar</button></div></form>` : ''}
    ${list.length ? `<ul class="gd-list">${list.map((a) => `<li class="gd-card ${a.pin ? 'pin' : ''}"><div class="gd-h"><b>${esc(a.title || 'Aviso')}</b>${a.pin ? '<span class="gd-pin">Fijado</span>' : ''}</div><p>${linkify(a.text || '')}</p>
      <div class="tiny faint">${esc(a.by || '')} · ${ago(a.at)}${a.due ? ` · para el ${esc(a.due)}` : ''}</div>
      ${guard ? `<div class="gd-acts"><button class="link-btn" data-act="gd-pin" data-id="${a.id}">${a.pin ? 'Quitar de arriba' : 'Fijar'}</button><button class="link-btn" data-act="gd-del" data-id="${a.id}">Quitar</button></div>` : ''}</li>`).join('')}</ul>`
    : `<div class="empty"><h3>Sin avisos</h3><p>${guard ? 'Publica el primero: llega a todo el Bosque con notificación.' : 'Cuando tu Guardián publique un aviso, aparece aquí.'}</p></div>`}`;
}
function gdAsist(guard) {
  const all = gAll('asist');
  const roster = gdRoster();
  if (!guard) {
    const mine = all.filter((x) => x.marks && x.marks[REG.me]);
    const cnt = { p: 0, r: 0, j: 0, f: 0 }; mine.forEach((x) => { cnt[x.marks[REG.me]]++; });
    const pct = mine.length ? Math.round(((cnt.p + cnt.r + cnt.j) / mine.length) * 100) : null;
    return `<div class="gd-card"><b>Tu asistencia</b><p class="gd-big">${pct === null ? '—' : pct + '%'}</p><div class="tiny faint">${cnt.p} presentes · ${cnt.r} retardos · ${cnt.j} justificadas · ${cnt.f} faltas</div></div>`;
  }
  const date = GD.date || today(); const cur = all.find((x) => x.date === date);
  return `<div class="gd-row"><input class="input" type="date" id="gdDate" value="${esc(date)}" aria-label="Fecha de la lista"><span class="tiny faint">${cur ? 'Lista guardada' : 'Aún sin pasar lista'}</span><button class="btn" data-act="gd-allp">Todos presentes</button></div>
    ${roster.length ? `<ul class="gd-list">${roster.map((u) => { const v = cur && cur.marks ? cur.marks[u] : ''; const tot = all.filter((x) => x.marks && x.marks[u]); const pc = tot.length ? Math.round((tot.filter((x) => x.marks[u] !== 'f').length / tot.length) * 100) : null;
      return `<li class="gd-card gd-stu"><div class="gd-h"><span class="mini xs" style="--pc:${safeColor(memberColor2(u))}">${esc(initials(memberName(u)))}</span><b>${esc(memberName(u))}</b><span class="tiny faint">${pc === null ? '' : pc + '%'}</span></div>
        <div class="seg full gd-seg" role="group">${gdMarks.map(([k, l]) => `<button type="button" data-act="gd-mark" data-u="${u}" data-v="${k}" aria-pressed="${v === k}">${l}</button>`).join('')}</div></li>`; }).join('')}</ul>`
    : '<div class="empty"><h3>Aún no hay estudiantes</h3><p>Invita con el código del Bosque o por usuario desde Ajustes.</p></div>'}`;
}
function gdAvg(u, evs) {
  const sc = evs.filter((e) => e.scores && e.scores[u] !== undefined);
  if (!sc.length) return null;
  const wsum = sc.reduce((a, e) => a + (e.weight || 0), 0);
  if (wsum > 0) return (sc.reduce((a, e) => a + (e.scores[u] / e.max) * (e.weight || 0), 0) / wsum) * 10;
  return (sc.reduce((a, e) => a + e.scores[u] / e.max, 0) / sc.length) * 10;
}
function gdNotas(guard) {
  const evs = gAll('eval').sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.at - a.at);
  if (!guard) {
    const rows = evs.filter((e) => e.scores && e.scores[REG.me] !== undefined);
    const av = gdAvg(REG.me, evs);
    return `<div class="gd-card"><b>Tu promedio</b><p class="gd-big">${av === null ? '—' : gdNum(av)}</p><div class="tiny faint">Sobre 10 · solo tú ves tus calificaciones</div></div>
      ${rows.length ? `<ul class="gd-list">${rows.map((e) => `<li class="gd-card"><div class="gd-h"><b>${esc(e.title)}</b><span class="gd-pin">${gdNum(e.scores[REG.me])} / ${e.max}</span></div><div class="tiny faint">${esc(e.date || '')}${e.weight ? ` · vale ${e.weight}%` : ''}</div></li>`).join('')}</ul>` : '<div class="empty"><h3>Sin calificaciones</h3><p>Aparecerán aquí cuando tu Guardián las registre.</p></div>'}`;
  }
  const roster = gdRoster(); const cur = evs.find((e) => e.id === GD.ev) || null;
  return `<form class="gd-form" id="gdEvalForm" autocomplete="off"><input class="input" id="gdETitle" maxlength="80" placeholder="Nueva evaluación: ej. Examen parcial"><div class="gd-row"><input class="input" id="gdEMax" type="number" min="1" max="1000" value="10" aria-label="Puntos máximos" style="max-width:90px"><input class="input" id="gdEW" type="number" min="0" max="100" placeholder="Peso %" aria-label="Peso en porcentaje" style="max-width:90px"><input class="input" type="date" id="gdEDate" value="${today()}"><button class="btn primary" type="submit">${icon('plus', 'sm')}Crear</button></div></form>
    ${evs.length ? `<div class="seg gd-evs" role="group">${evs.map((e) => `<button type="button" data-act="gd-ev" data-id="${e.id}" aria-pressed="${cur && cur.id === e.id}">${esc(e.title)}</button>`).join('')}</div>` : ''}
    ${cur ? `<div class="gd-card"><div class="gd-h"><b>${esc(cur.title)}</b><span class="tiny faint">máx. ${cur.max}${cur.weight ? ` · ${cur.weight}%` : ''}</span><button class="link-btn" data-act="gd-del" data-id="${cur.id}">Quitar</button></div>
      <ul class="gd-list">${roster.map((u) => `<li class="gd-sc"><span>${esc(memberName(u))}</span><input class="input gd-score" type="number" inputmode="decimal" min="0" max="${cur.max}" step="0.1" data-ev="${cur.id}" data-u="${u}" value="${cur.scores && cur.scores[u] !== undefined ? cur.scores[u] : ''}" aria-label="Calificación de ${esc(memberName(u))}"></li>`).join('') || '<li class="tiny faint">Sin estudiantes.</li>'}</ul></div>` : ''}
    ${roster.length && evs.length ? `<h2 class="sec">Promedios <small>sobre 10</small></h2><ul class="gd-list">${roster.map((u) => { const a = gdAvg(u, evs); return `<li class="gd-sc"><span>${esc(memberName(u))}</span><b class="${a !== null && a < 6 ? 'gd-low' : ''}">${a === null ? '—' : gdNum(a)}</b></li>`; }).join('')}</ul>
      <p><button class="btn" data-act="gd-csv">${icon('save', 'sm')}Descargar calificaciones (CSV)</button></p>` : ''}`;
}
function viewGuardian() {
  const guard = isGuardian();
  const tab = GD.tab;
  const tabs = [['avisos', 'Avisos'], ['asist', 'Asistencia'], ['notas', 'Calificaciones']];
  return `${groupHead(guard ? 'Panel del Guardián' : 'Mi Guardián', guard ? 'Avisos, lista y calificaciones de tu Bosque.' : 'Avisos, asistencia y calificaciones de tu Bosque.')}
    <div class="seg full" role="group">${tabs.map(([k, l]) => `<button type="button" data-act="gd-tab" data-v="${k}" aria-pressed="${tab === k}">${l}</button>`).join('')}</div>
    <div class="gd-body">${tab === 'avisos' ? gdAvisos(guard) : tab === 'asist' ? gdAsist(guard) : gdNotas(guard)}</div>
    ${guard ? '' : '<p class="tiny faint" style="margin-top:18px"><button class="link-btn" data-act="gd-be">Soy docente: cambiar mi cuenta a Guardián del Bosque</button></p>'}`;
}
GROUP_VIEWS.guardian = viewGuardian; GROUP_NAV.guardian = 'mas';

{
  const baseMasG = viewMasGrupo;
  viewMasGrupo = function () {
    const h = baseMasG();
    const link = `<h2 class="sec">${isGuardian() ? 'Guardián del Bosque' : 'Mi Guardián'}</h2><ul class="rows"><li><a href="#/guardian"><span class="ico">${icon('flag')}</span><span class="txt"><b>${isGuardian() ? 'Panel del Guardián' : 'Avisos, asistencia y calificaciones'}</b><span>${isGuardian() ? 'Publica avisos, pasa lista y registra calificaciones' : 'Lo que tu Guardián comparte contigo'}</span></span>${icon('chev', 'chev')}</a></li></ul>`;
    return h.includes('<h2 class="sec">Invitar</h2>') ? h.replace('<h2 class="sec">Invitar</h2>', link + '<h2 class="sec">Invitar</h2>') : h + link;
  };
  const baseQuien = viewQuien;
  viewQuien = function () {
    let h = baseQuien();
    for (const p of PERSONAL_LIST().filter(Boolean)) if (isGuardian(p.id)) h = h.replace(`<b>${esc(p.name)}</b>`, `<b>${esc(p.name)}</b>${gdBadge()}`);
    return h;
  };
  EXTRA_VIEWS.quien && (EXTRA_VIEWS.quien = viewQuien);
}

const gdSave = (it) => gput({ ...it });
Object.assign(VIDA_ACTS, {
  'gd-tab': (el) => { GD.tab = el.dataset.v; render(); },
  'gd-ev': (el) => { GD.ev = el.dataset.id; render(); },
  'gd-pin': (el) => { const a = gGet(el.dataset.id); if (a) gdSave({ ...a, pin: !a.pin }); },
  'gd-del': async (el) => { const a = gGet(el.dataset.id); if (!a) return; const ok = await ask({ title: '¿Quitar?', text: 'Desaparece para todo el Bosque.', ok: 'Quitar', cancel: 'Cancelar' }); if (ok) { if (GD.ev === a.id) GD.ev = null; gdSave({ ...a, deleted: true }); } },
  'gd-mark': (el) => {
    const date = GD.date || today(); const id = `as-${date}`; const cur = gAll('asist').find((x) => x.date === date);
    const marks = { ...(cur ? cur.marks : {}) }; if (marks[el.dataset.u] === el.dataset.v) delete marks[el.dataset.u]; else marks[el.dataset.u] = el.dataset.v;
    gdSave({ ...(cur || {}), id: cur ? cur.id : id, type: 'asist', date, marks, title: `Lista ${date}` });
  },
  'gd-allp': () => { const date = GD.date || today(); const cur = gAll('asist').find((x) => x.date === date); const marks = { ...(cur ? cur.marks : {}) }; gdRoster().forEach((u) => { if (!marks[u]) marks[u] = 'p'; }); gdSave({ ...(cur || {}), id: cur ? cur.id : `as-${date}`, type: 'asist', date, marks, title: `Lista ${date}` }); },
  'gd-csv': () => {
    const evs = gAll('eval').sort((a, b) => (a.date || '').localeCompare(b.date || '')); const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Estudiante', ...evs.map((e) => `${e.title} (/${e.max})`), 'Promedio /10'].map(q).join(',')];
    gdRoster().forEach((u) => { const a = gdAvg(u, evs); rows.push([memberName(u), ...evs.map((e) => (e.scores && e.scores[u] !== undefined ? e.scores[u] : '')), a === null ? '' : gdNum(a)].map(q).join(',')); });
    const blob = new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'calificaciones.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  },
  'gd-be': async () => {
    const ok = await ask({ title: '¿Eres docente?', text: 'Tu cuenta pasará a Guardián del Bosque: podrás publicar avisos, pasar lista y registrar calificaciones.', ok: 'Sí, soy Guardián', cancel: 'Cancelar' });
    if (!ok) return;
    try { const r = await cloudFetch('POST', { kind: 'setrole', as: REG.me, role: 'guardian' }); const u = (REG.users || []).find((x) => x.id === REG.me); if (u) u.role = r.role; if (FOR.members && FOR.members[REG.me]) FOR.members[REG.me].role = r.role; saveReg(); toast('Ahora eres Guardián del Bosque.'); render(); }
    catch (e) { toast(e.message || 'No se pudo cambiar. Revisa tu conexión.'); }
  },
});
document.addEventListener('submit', (e) => {
  const f = e.target;
  if (f.id === 'gdAvisoForm') {
    e.preventDefault(); const title = f.querySelector('#gdATitle').value.trim(), text = f.querySelector('#gdAText').value.trim();
    if (!title && !text) return toast('Escribe el aviso.');
    gdSave({ id: gid(), type: 'aviso', title: title || 'Aviso', text, pin: f.querySelector('#gdAPin').checked, due: f.querySelector('#gdADue').value || '' });
  } else if (f.id === 'gdEvalForm') {
    e.preventDefault(); const title = f.querySelector('#gdETitle').value.trim(); if (!title) return toast('Ponle nombre a la evaluación.');
    const id = gid(); GD.ev = id;
    gdSave({ id, type: 'eval', title, max: +f.querySelector('#gdEMax').value || 10, weight: +f.querySelector('#gdEW').value || 0, date: f.querySelector('#gdEDate').value || today(), scores: {} });
  }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.id === 'gdDate') { GD.date = t.value || today(); render(); }
  else if (t.classList && t.classList.contains('gd-score')) {
    const ev = gGet(t.dataset.ev); if (!ev) return; const scores = { ...(ev.scores || {}) };
    if (t.value === '') delete scores[t.dataset.u]; else scores[t.dataset.u] = Math.max(0, Math.min(ev.max, +t.value));
    gdSave({ ...ev, scores });
  }
});
