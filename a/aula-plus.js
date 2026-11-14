/* Cinnavia 7.62 — Mi aula+: pase de lista por grupo (con % de asistencia y alertas), participación con puntos,
   observaciones y ficha por estudiante, y herramientas para la clase: ruleta para elegir estudiante sin repetir,
   formar equipos al azar y temporizador a pantalla completa. Todo vive en el grupo (S.aula) y se sincroniza. */
'use strict';
const AUP = { date: null, wheel: [], last: null, teams: null, nTeams: 4 };
const AUP_MARK = { p: ['Presente', '#2f9e44'], r: ['Retardo', '#f08c00'], f: ['Falta', '#e03131'], j: ['Justificada', '#1c7ed6'] };
const aupG = (g) => { g.asis ||= {}; g.part ||= {}; g.obs ||= {}; return g; };
const aupEdit = (gid, fn) => commit((s) => { const gg = s.aula.groups.find((x) => x.id === gid); if (gg) { aupG(gg); fn(gg); } });
function aupAsisStats(g, aid) {
  aupG(g); let p = 0, r = 0, f = 0, j = 0;
  for (const d of Object.keys(g.asis)) { const m = g.asis[d][aid]; if (m === 'p') p++; else if (m === 'r') r++; else if (m === 'f') f++; else if (m === 'j') j++; }
  const tot = p + r + f + j; return { p, r, f, j, tot, pct: tot ? Math.round(((p + r + j) / tot) * 100) : null };
}

/* ---------- pestañas nuevas ---------- */
function aupAsis(g) {
  aupG(g); if (!g.alumnos.length) return '<p class="tiny faint">Primero agrega alumnos en la pestaña Alumnos.</p>';
  const d = AUP.date || today(); const day = g.asis[d] || {};
  const done = g.alumnos.filter((a) => day[a.id]).length;
  const dates = Object.keys(g.asis).sort().reverse().slice(0, 8);
  const rows = g.alumnos.map((a) => { const m = day[a.id]; const s = aupAsisStats(g, a.id); return `<li><span class="aup-n">${esc(a.name)}<small>${s.pct === null ? '' : `${s.pct}% asistencia${s.f ? ` · ${s.f} ${s.f === 1 ? 'falta' : 'faltas'}` : ''}`}</small></span><span class="aup-marks">${Object.entries(AUP_MARK).map(([k, [l, c]]) => `<button type="button" class="aup-m${m === k ? ' on' : ''}" style="--c:${c}" data-act="aup-mark" data-a="${a.id}" data-v="${k}" aria-label="${l}" title="${l}">${l[0]}</button>`).join('')}</span></li>`; }).join('');
  return `<div class="tp-row" style="align-items:center;gap:8px;margin-bottom:8px"><input type="date" id="aupDate" class="input" value="${d}" style="max-width:170px"><button class="btn" data-act="aup-allp">Todos presentes</button><button class="btn" data-act="aup-csv">${icon('save', 'sm')}Exportar</button></div>
    <p class="tiny faint" style="margin:0 0 8px">${done}/${g.alumnos.length} con lista · P presente · R retardo · F falta · J justificada</p>
    <ul class="aup-list">${rows}</ul>
    ${dates.length ? `<p class="tiny faint" style="margin-top:10px">Listas guardadas: ${dates.map((x) => `<button class="link-btn" data-act="aup-date" data-d="${x}">${x.slice(5)}</button>`).join(' · ')}</p>` : ''}`;
}
function aupPart(g) {
  aupG(g); if (!g.alumnos.length) return '<p class="tiny faint">Primero agrega alumnos en la pestaña Alumnos.</p>';
  const max = Math.max(1, ...g.alumnos.map((a) => g.part[a.id] || 0));
  return `<p class="tiny faint" style="margin:0 0 8px">Suma puntos de participación con un toque. Toca un nombre para ver su ficha completa y anotar observaciones.</p>
    <ul class="aup-list">${g.alumnos.map((a) => { const v = g.part[a.id] || 0; const no = (g.obs[a.id] || []).length; return `<li><button type="button" class="aup-n link" data-act="aup-ficha" data-a="${a.id}">${esc(a.name)}<small>${no ? `${no} ${no === 1 ? 'observación' : 'observaciones'}` : 'Ver ficha'}</small></button><span class="aup-pbar"><i style="width:${Math.max(0, v) / max * 100}%"></i></span><span class="aup-pts"><button type="button" class="icon-btn ghost" data-act="aup-pt" data-a="${a.id}" data-v="-1" aria-label="Restar punto a ${esc(a.name)}">−</button><b>${v}</b><button type="button" class="icon-btn" data-act="aup-pt" data-a="${a.id}" data-v="1" aria-label="Sumar punto a ${esc(a.name)}">+</button></span></li>`; }).join('')}</ul>
    <p><button class="btn" data-act="aup-pt-reset">Reiniciar puntos del periodo</button></p>`;
}
function aupHerr(g) {
  const n = g.alumnos.length;
  const teams = AUP.teams && AUP.teams.gid === g.id ? AUP.teams.list : null;
  return `<div class="aup-tools">
    <section class="aup-tool"><h4>🎯 Ruleta de estudiantes</h4><p class="tiny faint">Elige al azar sin repetir hasta que pasen todas y todos.</p>
      <div class="aup-wheel" id="aupWheel">${AUP.last && AUP.last.gid === g.id ? esc(AUP.last.name) : '¿Quién sigue?'}</div>
      <div class="tp-row"><button class="btn primary" data-act="aup-spin" ${n ? '' : 'disabled'}>Girar</button>${AUP.last && AUP.last.gid === g.id ? `<button class="btn" data-act="aup-pt" data-a="${AUP.last.id}" data-v="1">+1 participación</button>` : ''}</div></section>
    <section class="aup-tool"><h4>👥 Equipos al azar</h4><div class="tp-row" style="align-items:center"><label class="tiny" for="aupNT">Equipos</label><input id="aupNT" type="number" min="2" max="12" class="input" value="${AUP.nTeams}" style="max-width:80px"><button class="btn primary" data-act="aup-teams" ${n >= 2 ? '' : 'disabled'}>Formar</button>${teams ? '<button class="btn" data-act="aup-teams-copy">Copiar</button>' : ''}</div>
      ${teams ? `<div class="aup-teams">${teams.map((t, i) => `<div><b>Equipo ${i + 1}</b>${t.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`).join('')}</div>` : ''}</section>
    <section class="aup-tool"><h4>⏱️ Temporizador para la clase</h4><p class="tiny faint">Se abre a pantalla completa para proyectarlo. Suena al terminar.</p>
      <div class="tp-row">${[1, 3, 5, 10, 15, 20].map((m) => `<button class="btn" data-act="aup-timer" data-m="${m}">${m} min</button>`).join('')}</div></section>
  </div>`;
}
function aupFicha(g, aid) {
  aupG(g); const a = g.alumnos.find((x) => x.id === aid); if (!a) return;
  const av = typeof auAvg === 'function' ? auAvg(g, aid) : null; const s = aupAsisStats(g, aid); const obs = (g.obs[aid] || []).slice().reverse();
  let ent = 0, no = 0; for (const ac of g.acts) { const r = (g.notas[aid] || {})[ac.id]; if (r && r.ent === 'si') ent++; else if (r && r.ent === 'no') no++; }
  openSheet(`${sheetHead(a.name)}<div class="sheet-body">
    <div class="aup-sum"><span><b>${auFmt(av)}</b><small>promedio</small></span><span><b>${s.pct === null ? '–' : s.pct + '%'}</b><small>asistencia</small></span><span><b>${ent}/${ent + no || g.acts.length}</b><small>entregas</small></span><span><b>${g.part[aid] || 0}</b><small>participación</small></span></div>
    ${av !== null && av < auPass() ? `<p class="au-note risk" style="margin:10px 0">Va por debajo de ${auPass()}. ${no ? `Le faltan ${no} ${no === 1 ? 'entrega' : 'entregas'}.` : ''}</p>` : ''}
    <h4 class="tp-h">Observaciones</h4>
    <div class="tp-row" style="gap:6px;flex-wrap:wrap;margin-bottom:6px">${['👍 Buena participación', '📚 Entregó completo', '💬 Habló en clase', '⏰ Llegó tarde', '❗ No trajo material', '🤝 Ayudó a otros'].map((t) => `<button class="chip" data-act="aup-obs-q" data-a="${aid}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
    <div class="tp-row"><input id="aupObs" class="input" maxlength="200" placeholder="Escribe una observación"><button class="btn primary" data-act="aup-obs" data-a="${aid}">Anotar</button></div>
    <ul class="aup-obs">${obs.length ? obs.map((o) => `<li><small>${esc(o.d)}</small>${esc(o.t)}</li>`).join('') : '<li class="faint">Sin observaciones todavía.</li>'}</ul>
    <p class="tiny faint">Faltas: ${s.f} · retardos: ${s.r} · justificadas: ${s.j}</p></div>
    <div class="sheet-foot"><span class="grow"></span><button class="btn primary" data-act="sheet-close">Listo</button></div>`);
}
function aupTimer(min) {
  let total = min * 60, left = total, run = true, last = performance.now(), raf = 0, ac = null;
  const el = document.createElement('div'); el.className = 'aup-tm';
  el.innerHTML = `<div class="aup-tm-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" class="bg"/><circle cx="50" cy="50" r="45" class="fg" id="aupRing"/></svg><b id="aupT"></b></div>
    <div class="aup-tm-ctl"><button class="btn" id="aupM1">−1 min</button><button class="btn primary" id="aupPP">Pausa</button><button class="btn" id="aupP1">+1 min</button><button class="btn" id="aupX">Cerrar</button></div>`;
  document.body.appendChild(el);
  const T = el.querySelector('#aupT'), ring = el.querySelector('#aupRing'), C = 2 * Math.PI * 45;
  const beep = () => { try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); [0, 0.35, 0.7, 1.05].forEach((d, i) => { const o = ac.createOscillator(), v = ac.createGain(); o.frequency.value = i % 2 ? 1046 : 784; v.gain.setValueAtTime(0.0001, ac.currentTime + d); v.gain.linearRampToValueAtTime(0.25, ac.currentTime + d + 0.02); v.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d + 0.3); o.connect(v); v.connect(ac.destination); o.start(ac.currentTime + d); o.stop(ac.currentTime + d + 0.32); }); } catch { /* */ } };
  const paint = () => { const s = Math.max(0, Math.ceil(left)); T.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C * (1 - left / total); el.classList.toggle('end', left <= 0); el.classList.toggle('warn', left > 0 && left <= 30); };
  const tick = (now) => { const dt = (now - last) / 1000; last = now; if (run && left > 0) { left -= dt; if (left <= 0) { left = 0; beep(); } } paint(); raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame(tick);
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* */ }
  el.querySelector('#aupPP').onclick = (e) => { run = !run; e.target.textContent = run ? 'Pausa' : 'Seguir'; last = performance.now(); };
  el.querySelector('#aupM1').onclick = () => { left = Math.max(0, left - 60); };
  el.querySelector('#aupP1').onclick = () => { left += 60; total = Math.max(total, left); };
  el.querySelector('#aupX').onclick = () => { cancelAnimationFrame(raf); el.remove(); try { ac && ac.close(); } catch { /* */ } };
  try { el.requestFullscreen && el.requestFullscreen().catch(() => {}); } catch { /* */ }
}

/* ---------- integración con Mi aula ---------- */
const AUP_TABS = { asis: ['Asistencia', aupAsis], part: ['Participación', aupPart], herr: ['Herramientas', aupHerr] };
{
  const base = auDetail;
  auDetail = function (g) {
    if (!g) return base(g);
    const mine = AUP_TABS[AU.tab];
    const keep = AU.tab; if (mine) AU.tab = '__aup';
    let h = base(g); AU.tab = keep;
    // botones de las pestañas nuevas
    const ti = h.indexOf('role="tablist"'); if (ti >= 0) { const end = h.indexOf('</div>', ti); h = h.slice(0, end) + Object.entries(AUP_TABS).map(([k, [l]]) => `<button type="button" class="chip${AU.tab === k ? ' on' : ''}" data-act="au-tab" data-v="${k}" aria-pressed="${AU.tab === k}">${l}</button>`).join('') + h.slice(end); }
    if (mine) { const a = h.indexOf('</div>', h.indexOf('role="tablist"')) + 6; const b = h.lastIndexOf('<p style="margin-top:18px"><button class="btn danger" data-act="au-del">'); if (a > 5 && b > a) h = h.slice(0, a) + `<div class="aup-body">${mine[1](aupG(g))}</div>` + h.slice(b); }
    return h;
  };
  const baseAg = auAgent;
  auAgent = function () {
    const out = baseAg();
    for (const g of auGroups()) { aupG(g); const risk = g.alumnos.filter((a) => aupAsisStats(g, a.id).f >= 3); if (risk.length) out.push({ k: 'risk', t: `${g.name}: ${plural(risk.length, 'estudiante tiene', 'estudiantes tienen')} 3 faltas o más (${risk.slice(0, 3).map((a) => a.name.split(' ')[0]).join(', ')}${risk.length > 3 ? '…' : ''}). Revisa su situación.`, act: 'au-open', id: g.id, btn: 'Ver grupo' }); const d = today(); const hasClassToday = g.clases.some((c) => +c.day === new Date().getDay()); if (hasClassToday && g.alumnos.length && !(g.asis[d] && Object.keys(g.asis[d]).length)) out.push({ k: 'plan', t: `Hoy tienes clase con ${g.name} y aún no pasas lista.`, act: 'aup-open-asis', id: g.id, btn: 'Pasar lista' }); }
    return out;
  };
}
Object.assign(VIDA_ACTS, {
  'aup-mark': (el) => { const g = auGroup(); const d = AUP.date || today(); aupEdit(g.id, (gg) => { gg.asis[d] ||= {}; if (gg.asis[d][el.dataset.a] === el.dataset.v) delete gg.asis[d][el.dataset.a]; else gg.asis[d][el.dataset.a] = el.dataset.v; }); },
  'aup-allp': () => { const g = auGroup(); const d = AUP.date || today(); aupEdit(g.id, (gg) => { gg.asis[d] ||= {}; gg.alumnos.forEach((a) => { if (!gg.asis[d][a.id]) gg.asis[d][a.id] = 'p'; }); }); toast('Listo: todos presentes'); },
  'aup-date': (el) => { AUP.date = el.dataset.d; render(); },
  'aup-open-asis': (el) => { AU.tab = 'asis'; location.hash = `#/aula/${el.dataset.id}`; },
  'aup-csv': () => {
    const g = aupG(auGroup()); const ds = Object.keys(g.asis).sort(); const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['Alumno', ...ds, 'Asistencia %', 'Faltas', 'Retardos'].map(q).join(',')];
    g.alumnos.forEach((a) => { const s = aupAsisStats(g, a.id); rows.push([a.name, ...ds.map((d) => ({ p: 'P', r: 'R', f: 'F', j: 'J' })[g.asis[d][a.id]] || ''), s.pct ?? '', s.f, s.r].map(q).join(',')); });
    const blob = new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `asistencia-${g.name}.csv`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  },
  'aup-pt': (el) => { const g = auGroup(); const v = +el.dataset.v; aupEdit(g.id, (gg) => { gg.part[el.dataset.a] = (gg.part[el.dataset.a] || 0) + v; }); if (v > 0) try { JG_TONE(880, 0.08, 'triangle', 0.04, 1320); } catch { /* */ } },
  'aup-pt-reset': async () => { const g = auGroup(); const ok = await ask({ title: '¿Reiniciar puntos?', text: 'Los puntos de participación de este grupo vuelven a 0.', ok: 'Reiniciar', cancel: 'Cancelar' }); if (ok) aupEdit(g.id, (gg) => { gg.part = {}; }); },
  'aup-ficha': (el) => aupFicha(auGroup(), el.dataset.a),
  'aup-obs': (el) => { const inp = document.getElementById('aupObs'); const t = (inp && inp.value || '').trim(); if (!t) return; const g = auGroup(); aupEdit(g.id, (gg) => { (gg.obs[el.dataset.a] ||= []).push({ t, d: today() }); }); setTimeout(() => aupFicha(auGroup(), el.dataset.a), 30); },
  'aup-obs-q': (el) => { const g = auGroup(); aupEdit(g.id, (gg) => { (gg.obs[el.dataset.a] ||= []).push({ t: el.dataset.t, d: today() }); }); setTimeout(() => aupFicha(auGroup(), el.dataset.a), 30); },
  'aup-spin': () => {
    const g = auGroup(); if (!g.alumnos.length) return;
    let pool = AUP.wheel.filter((id) => g.alumnos.some((a) => a.id === id)); if (!pool.length || AUP.wheelG !== g.id) { pool = g.alumnos.map((a) => a.id); AUP.wheelG = g.id; }
    const pick = pool[Math.floor(Math.random() * pool.length)]; AUP.wheel = pool.filter((x) => x !== pick);
    const box = document.getElementById('aupWheel'); let i = 0; const names = g.alumnos.map((a) => a.name);
    const spin = () => { if (!box) return; box.textContent = names[(Math.random() * names.length) | 0]; box.classList.add('spin'); try { JG_TONE(500 + i * 25, 0.04, 'square', 0.02); } catch { /* */ } if (++i < 18) setTimeout(spin, 40 + i * 9); else { const a = g.alumnos.find((x) => x.id === pick); AUP.last = { gid: g.id, id: a.id, name: a.name }; render(); try { [0, 4, 7].forEach((k, j) => setTimeout(() => JG_TONE(660 * Math.pow(2, k / 12), 0.15, 'triangle', 0.05), j * 70)); } catch { /* */ } } };
    spin();
  },
  'aup-teams': () => { const g = auGroup(); const n = Math.max(2, Math.min(12, +(document.getElementById('aupNT')?.value) || 4)); AUP.nTeams = n; const names = g.alumnos.map((a) => a.name).sort(() => Math.random() - 0.5); const list = Array.from({ length: Math.min(n, names.length) }, () => []); names.forEach((x, i) => list[i % list.length].push(x)); AUP.teams = { gid: g.id, list }; render(); },
  'aup-teams-copy': async () => { const t = AUP.teams; if (!t) return; const txt = t.list.map((x, i) => `Equipo ${i + 1}: ${x.join(', ')}`).join('\n'); try { await navigator.clipboard.writeText(txt); toast('Equipos copiados'); } catch { toast('No se pudo copiar'); } },
  'aup-timer': (el) => aupTimer(+el.dataset.m || 5),
});
document.addEventListener('change', (e) => { if (e.target && e.target.id === 'aupDate') { AUP.date = e.target.value || today(); render(); } });

/* ---------- Mi aula en el inicio del docente ---------- */
function aupHomeCard() {
  const gs = auGroups(); if (!gs.length) return `<a class="cm-link" href="#/aula">${icon('users')}<span><b>Mi aula</b><small>Crea tus grupos: horario, lista, calificaciones, ruleta, equipos y temporizador</small></span></a>`;
  let nx = null; for (const g of gs) { const n = auNextClass(g); if (n && (!nx || n.d < nx.n.d)) nx = { g, n }; }
  const ag = auAgent().filter((a) => a.k !== 'sep').slice(0, 2);
  const when = nx ? (() => { const iso = toISO(nx.n.d); return iso === today() ? 'Hoy' : iso === addDays(today(), 1) ? 'Mañana' : AU_DAYS[nx.n.d.getDay()]; })() : '';
  return `<section class="aup-home"><div class="aup-home-h"><b>Mi aula</b><a href="#/aula">Ver grupos</a></div>
    ${nx ? `<a class="aup-next" href="#/aula/${nx.g.id}"><span>${when} · ${fmtTime(nx.n.c.start)}</span><b>${esc(nx.g.materia)} · ${esc(nx.g.name)}</b></a>` : ''}
    <div class="aup-quick">${nx ? `<button class="btn" data-act="aup-open-asis" data-id="${nx.g.id}">✅ Pasar lista</button><button class="btn" data-act="aup-q-herr" data-id="${nx.g.id}">🎯 Ruleta y equipos</button>` : ''}<button class="btn" data-act="aup-timer" data-m="5">⏱️ Temporizador</button></div>
    ${ag.map((a) => `<p class="au-note ${a.k}" style="margin:6px 0 0">${esc(a.t)}</p>`).join('')}</section>`;
}
{
  const base = viewHoy;
  viewHoy = function () { const h = base(); if (!(typeof calmOn === 'function' && calmOn()) || isGroup() || !isGuardian()) return h; return h.replace('<h2 class="sec">Hoy</h2>', `${aupHomeCard()}<h2 class="sec">Hoy</h2>`); };
}
Object.assign(VIDA_ACTS, { 'aup-q-herr': (el) => { AU.tab = 'herr'; location.hash = `#/aula/${el.dataset.id}`; } });
/* en el modo sobrio del docente, Mi aula también debe abrirse (antes regresaba a Inicio) */
const aupAllow = () => { try { if (typeof CL_ALLOWED !== 'undefined' && !CL_ALLOWED.includes('aula')) CL_ALLOWED.push('aula'); } catch { /* */ } };
aupAllow(); setTimeout(aupAllow, 0);
