/* Cinnavia 7.29 — Skills rediseñado: claro, con los colores de la app y sin círculos.
   Un tronco fino a la izquierda y una rama por materia; cada habilidad es una pequeña etiqueta rectangular. */
'use strict';
const sk2Pct = (a, b) => Math.round((a / Math.max(1, b)) * 100);
function sk2Path(sid, ci) {
  const [key, cname, desc, ths] = SK_CATS[ci]; const { m } = skStats(sid); const val = m[key];
  const done = ths.filter((t) => val >= t).length; const nxt = ths.find((t) => val < t);
  return `<section class="sk2-cat"><div class="sk2-cat-h"><h3>${cname}</h3><span>${done}<i>/${ths.length}</i></span></div>
    <p class="sk2-cat-d">${esc(desc)} · llevas <b>${key === 'promedio' ? (val ? val.toFixed(1) : '—') : Math.floor(val)}</b>${nxt !== undefined ? ` · siguiente <b>${skShort(key, nxt)}</b>` : ' · completa'}</p>
    <div class="sk2-line" aria-hidden="true"><i style="width:${sk2Pct(done, ths.length)}%"></i></div>
    <div class="sk2-tags">${ths.map((t, k) => { const on = val >= t, nx = !on && t === nxt; return `<button type="button" class="sk2-tag ${on ? 'on' : ''} ${nx ? 'next' : ''}" data-act="skt-node" data-id="${sid}|${key}|${k}" aria-label="${esc(skLabel(key, t))}${on ? ', lograda' : ''}">${skShort(key, t)}</button>`; }).join('')}</div></section>`;
}
viewSkills = function () {
  if (!S.subjects.length) return `<h1 class="page-title">Skills</h1><div class="empty"><h3>Aquí crecerán tus habilidades</h3><p>Agrega tus materias y cada una tendrá más de 100 habilidades por lograr.</p><p><a class="btn primary" href="#/materias">Agregar materias</a></p></div>`;
  const subs = S.subjects.slice(0, 12);
  if (SKV.sub && !subs.some((x) => x.id === SKV.sub)) SKV.sub = null;
  if (SKV.sub) {
    const s = subs.find((x) => x.id === SKV.sub); const st = skStats(s.id); const col = safeColor(s.color);
    return `<section class="sk2" style="--c:${col}"><a class="back" href="#/skills" data-act="skt-back">${icon('back')}Skills</a>
      <h1 class="page-title">${esc(s.name)}</h1>
      <p class="page-sub"><b>${st.lit}</b> de ${st.total} habilidades · ${st.title}</p>
      <div class="sk2-line big" aria-hidden="true"><i style="width:${sk2Pct(st.lit, st.total)}%"></i></div>
      <div class="sk2-chips">${subs.map((x) => `<button type="button" class="sk2-chip ${x.id === s.id ? 'me' : ''}" data-act="skt-open" data-id="${x.id}" style="--c:${safeColor(x.color)}">${esc(x.name)}</button>`).join('')}</div>
      ${SK_CATS.map((_, ci) => sk2Path(s.id, ci)).join('')}</section>`;
  }
  const rows = subs.map((x) => ({ s: x, ...skStats(x.id) })); const lit = rows.reduce((a, r) => a + r.lit, 0), total = rows.reduce((a, r) => a + r.total, 0);
  return `<section class="sk2"><h1 class="page-title">Skills</h1><p class="page-sub"><b>${lit}</b> de ${total} habilidades logradas. Cada materia es una rama; toca una para ver sus caminos.</p>
    <div class="sk2-line big" aria-hidden="true"><i style="width:${sk2Pct(lit, total)}%"></i></div>
    <ul class="sk2-tree">${rows.map((r) => `<li style="--c:${safeColor(r.s.color)}"><button type="button" data-act="skt-open" data-id="${r.s.id}" aria-label="${esc(r.s.name)}: ${r.lit} de ${r.total} habilidades"><span class="sk2-nm">${esc(r.s.name)}</span><span class="sk2-meta">${r.title}</span><span class="sk2-n"><b>${r.lit}</b> / ${r.total}</span><span class="sk2-line" aria-hidden="true"><i style="width:${sk2Pct(r.lit, r.total)}%"></i></span></button></li>`).join('')}</ul></section>`;
};
EXTRA_VIEWS.skills = viewSkills;
skOpen = function (id) {
  const [sid, key, k] = id.split('|'); const s = S.subjects.find((x) => x.id === sid); const cat = SK_CATS.find((c) => c[0] === key); if (!s || !cat) return;
  const th = cat[3][+k]; const cur = skStats(sid).m[key]; const on = cur >= th; const pct = Math.max(0, Math.min(100, Math.round((cur / th) * 100)));
  Snd[on ? 'chime' : 'tick']();
  openSheet(`${sheetHead(skLabel(key, th))}<div class="sheet-body sk2" style="--c:${safeColor(s.color)}"><p class="sk2-st ${on ? 'on' : ''}"><b>${on ? 'Habilidad lograda' : 'Por lograr'}</b><span>${esc(s.name)} · ${cat[1]} · ${+k + 1} de ${cat[3].length}</span></p>
    <p class="muted">${esc(cat[2])}: <b>${key === 'promedio' ? (cur ? cur.toFixed(1) : 'sin datos') : Math.floor(cur)}</b> de ${th}.</p>
    <div class="sk2-line big" aria-hidden="true"><i style="width:${pct}%"></i></div><p class="small muted" style="margin-top:12px">${skHow(key)}</p></div>`);
};
