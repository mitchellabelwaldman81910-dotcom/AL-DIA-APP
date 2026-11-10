/* Al Día 7.15 — Naturaleza, sonido y sensación.
   · Enredaderas: los pensamientos y el pizarrón crecen como una enredadera viva, con hojas y zarcillos
     que conectan lo que se relaciona.
   · Árbol de habilidades nuevo: cada materia es una rama luminosa que florece conforme subes de nivel.
   · Jardín mucho más grande (28 decoraciones nuevas) con vista previa de cada una en la tienda.
   · Sonidos cálidos (marimba, gotas, campanas con eco suave) y microanimaciones al tocar. */
'use strict';

/* ===================== Enredaderas ===================== */
function vineDraw(host, opts = {}) {
  if (!host) return; const svg = host.querySelector('.vine-svg'); if (!svg) return;
  const H = host.scrollHeight, W = host.clientWidth; if (!W || !H) return;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.style.height = H + 'px';
  const hb = host.getBoundingClientRect(); const cx = W / 2;
  const rows = [...host.querySelectorAll('.vr-row, .thought')];
  const R = rnd(seedOf('vine:' + rows.length + ':' + W));
  const trunkX = (y) => cx + Math.sin(y / 70) * Math.min(14, W * 0.03);
  let d = `M${cx.toFixed(1)} ${H}`; for (let y = H; y > 0; y -= 24) d += `L${trunkX(y).toFixed(1)} ${y.toFixed(1)}`;
  let out = `<path class="vn-trunk" d="${d}"/><path class="vn-trunk2" d="${d}" transform="translate(2.2 0)"/>`;
  const leaf = (x, y, ang, L, cls = 'lf') => lnLeaf(x, y, ang, L, cls);
  const along = (p, every, size) => { let s = ''; const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path'); tmp.setAttribute('d', p); svg.appendChild(tmp); const len = tmp.getTotalLength(); for (let t = every * (0.6 + R() * 0.4), k = 0; t < len - 6; t += every, k++) { const a = tmp.getPointAtLength(t), b = tmp.getPointAtLength(Math.min(len, t + 1)); const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI; s += leaf(a.x, a.y, deg + (k % 2 ? 62 : -62), size * (0.75 + R() * 0.4), R() < 0.15 ? 'lf2' : 'lf'); } tmp.remove(); return s; };
  // hojas en el tronco
  out += along(d, 46, 9);
  const anchors = new Map();
  for (const r of rows) {
    const card = r.querySelector('.pz-card, .thought-body') || r; const b = card.getBoundingClientRect();
    const y = b.top - hb.top + Math.min(40, b.height / 2); const left = r.classList.contains('r');
    const ax = left ? b.left - hb.left : b.right - hb.left; const tx = trunkX(y + 20);
    anchors.set(r.dataset.id || '', { x: b.left - hb.left + b.width / 2, top: b.top - hb.top, bottom: b.bottom - hb.top, ax, y });
    const depth = /\bd([1-3])\b/.exec(r.className); if (depth && r.dataset.pa) continue;
    const midX = (tx + ax) / 2; const bp = `M${tx.toFixed(1)} ${(y + 22).toFixed(1)}C${midX.toFixed(1)} ${(y + 20).toFixed(1)} ${midX.toFixed(1)} ${(y - 2).toFixed(1)} ${ax.toFixed(1)} ${y.toFixed(1)}`;
    out += `<path class="vn-br" d="${bp}"/>` + along(bp, 30, 7.5);
    // zarcillo en espiral
    const sx = midX, sy = y + 8, s = left ? -1 : 1;
    out += `<path class="vn-tendril" d="M${sx.toFixed(1)} ${sy.toFixed(1)}c${s * 8} 2 ${s * 10} 12 ${s * 4} 14c${s * -4} 2 ${s * -6} -4 ${s * -2} -6"/>`;
    if (R() < 0.35) out += `<g transform="translate(${(ax + (left ? -4 : 4)).toFixed(1)} ${(y - 6).toFixed(1)})">${lnFlower(0, 0, 0.9)}</g>`;
  }
  // ramas que cuelgan de otra tarjeta (pizarrón) o conexiones entre pensamientos del mismo tipo
  for (const r of rows) {
    const pa = r.dataset.pa; if (!pa || !anchors.has(pa)) continue; const a = anchors.get(pa), b = anchors.get(r.dataset.id || ''); if (!b) continue;
    const p = `M${a.x.toFixed(1)} ${a.bottom.toFixed(1)}C${(a.x + 30).toFixed(1)} ${(a.bottom + 24).toFixed(1)} ${(b.x - 30).toFixed(1)} ${(b.top - 24).toFixed(1)} ${b.x.toFixed(1)} ${b.top.toFixed(1)}`;
    out += `<path class="vn-br sub" d="${p}"/>` + along(p, 26, 6.5);
  }
  if (opts.links) for (const [a0, b0, c] of opts.links) { const a = anchors.get(a0), b = anchors.get(b0); if (!a || !b) continue; const off = (a.ax < cx ? -1 : 1) * 26; const p = `M${a.ax.toFixed(1)} ${(a.y + 10).toFixed(1)}C${(a.ax + off).toFixed(1)} ${(a.y + 40).toFixed(1)} ${(b.ax + off).toFixed(1)} ${(b.y - 30).toFixed(1)} ${b.ax.toFixed(1)} ${(b.y - 4).toFixed(1)}`; out += `<path class="vn-link" style="--c:${c}" d="${p}"/>`; }
  svg.innerHTML = out; host.classList.add('vine-on');
}
window.addEventListener('resize', () => { clearTimeout(window.__vt); window.__vt = setTimeout(() => { const m = document.getElementById('mVine'); if (m) vineDraw(m, { links: mLinks() }); const p = document.getElementById('pzRamas'); if (p) vineDraw(p); }, 200); });
function mLinks() { const els = [...document.querySelectorAll('#mVine .thought')]; const last = {}; const out = []; for (const e of els) { const k = e.dataset.mood; if (last[k]) out.push([last[k], e.dataset.id, e.style.getPropertyValue('--c')]); last[k] = e.dataset.id; } return out.slice(0, 40); }
{
  const baseMente = viewMente;
  viewMente = function () {
    let h = baseMente();
    h = h.replace('<div class="thought-tree">', '<div class="thought-tree vine-host" id="mVine">').replace('<div class="roots" aria-hidden="true"></div></div>', '<div class="roots" aria-hidden="true"></div><svg class="vine-svg" aria-hidden="true"></svg></div>');
    h = h.replace(/<article class="thought (l|r)" style="--c:([^"]+)">\s*<span class="bud" aria-hidden="true">[\s\S]*?<\/span>\s*<button type="button" class="thought-body" data-act="thought-open" data-id="([^"]+)">/g, (m, side, c, id) => { const t = S.thoughts.find((x) => x.id === id); return `<article class="thought ${side}" style="--c:${c}" data-id="${id}" data-mood="${t ? t.mood : ''}"><button type="button" class="thought-body" data-act="thought-open" data-id="${id}">`; });
    h = h.replace('Cada pensamiento es una hoja de tu árbol.', 'Cada pensamiento brota de tu enredadera; los del mismo tipo se conectan entre sí.');
    setTimeout(() => vineDraw(document.getElementById('mVine'), { links: mLinks() }), 40);
    return h;
  };
}

/* ===================== Árbol de habilidades ===================== */
function skillXP2(sid) {
  const q = (S.quiz && S.quiz.subj && S.quiz.subj[sid]) || { ok: 0 };
  return skillXP(sid) + (S.pages || []).filter((p) => !p.deleted && p.subjectId === sid).length * 3 + (S.notes || []).filter((n) => n.subjectId === sid).length * 2 + (q.ok || 0) * 2;
}
function skillArt(subs, big) {
  const W = 360, H = big ? 460 : 380, cx = 180, base = H - 30;
  const infos = subs.map((s, i) => ({ s, xp: skillXP2(s.id), c: safeColor(s.color), i })).map((x) => ({ ...x, lv: skillLv(x.xp) }));
  const total = infos.reduce((a, x) => a + x.lv, 0);
  let g = `<defs><radialGradient id="skGlow" cx="50%" cy="58%" r="60%"><stop offset="0" class="skg-a"/><stop offset="1" class="skg-b"/></radialGradient>
    ${infos.map((x) => `<radialGradient id="skn-${x.i}"><stop offset="0" stop-color="${x.c}" stop-opacity=".75"/><stop offset=".45" stop-color="${x.c}" stop-opacity=".25"/><stop offset="1" stop-color="${x.c}" stop-opacity="0"/></radialGradient>`).join('')}
    <filter id="skSoft"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
    <rect width="${W}" height="${H}" fill="url(#skGlow)"/>`;
  const R = rnd(seedOf('sk:' + subs.map((s) => s.id).join()));
  for (let k = 0; k < 26; k++) g += `<circle class="sk-star" cx="${(R() * W).toFixed(1)}" cy="${(R() * (H - 120)).toFixed(1)}" r="${(0.5 + R() * 0.9).toFixed(2)}" style="--d:${(R() * 5).toFixed(2)}s"/>`;
  // suelo y raíces
  g += `<path class="ln s" stroke-width=".9" d="M${cx - 120} ${base + 6}C${cx - 50} ${base - 4} ${cx + 50} ${base - 4} ${cx + 120} ${base + 6}"/>`;
  for (const s of [-1, 1]) g += `<path class="ln" stroke-width="1.6" d="M${cx} ${base}q${s * 14} 4 ${s * 34} 14"/><path class="ln s" stroke-width=".8" d="M${cx + s * 6} ${base + 2}q${s * 14} 8 ${s * 22} 20M${cx + s * 2} ${base}q${s * 4} 10 ${s * 2} 22"/>`;
  const topY = base - (big ? 170 : 140) - Math.min(40, total * 1.2);
  g += `<path class="sk-trunk" d="M${cx - 7} ${base}C${cx - 9} ${base - 60} ${cx - 3} ${topY + 60} ${cx - 2} ${topY}L${cx + 2} ${topY}C${cx + 3} ${topY + 60} ${cx + 9} ${base - 60} ${cx + 7} ${base}Z"/>`;
  g += `<path class="ln s" stroke-width=".6" d="M${cx - 3} ${base - 8}C${cx - 5} ${base - 60} ${cx - 1} ${topY + 70} ${cx - 1} ${topY + 20}"/>`;
  const n = infos.length; const nodes = [];
  g += `<g filter="url(#skSoft)" opacity=".55">${infos.filter((x) => x.lv).map((x, k) => `<circle cx="${cx + (k - infos.length / 2) * 26}" cy="${topY + 40}" r="${40 + x.lv * 10}" fill="url(#skn-${x.i})"/>`).join('')}</g>`;
  for (let k = 0; k < 4; k++) { const yy = base - 40 - k * ((base - topY - 60) / 4); g += lnLeaf(cx + (k % 2 ? 6 : -6), yy, k % 2 ? -30 : -150, 10, k % 3 ? 'lf' : 'lf2'); }
  infos.forEach((x, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1); const spread = Math.min(124, 26 * n + 24); const ang = (-spread / 2 + spread * t) * Math.PI / 180;
    const sy = topY + 14 + Math.abs(t - 0.5) * 2 * (big ? 110 : 90) + (i % 2) * 8; const sx = cx;
    const len = (big ? 150 : 128) * (0.9 + 0.08 * x.lv);
    const ex = sx + Math.sin(ang) * len * 1.12, ey = sy - Math.cos(ang) * len * 0.92;
    const c1x = sx + Math.sin(ang) * len * 0.42, c1y = sy - 6, c2x = sx + Math.sin(ang) * len * 0.78, c2y = ey + 30;
    const P = (u) => { const a = 1 - u; return [a * a * a * sx + 3 * a * a * u * c1x + 3 * a * u * u * c2x + u * u * u * ex, a * a * a * sy + 3 * a * a * u * c1y + 3 * a * u * u * c2y + u * u * u * ey]; };
    const lit = x.lv / 5; const path = `M${sx} ${sy}C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    g += `<g class="sk-branch" style="--c:${x.c};--sw:${(t - 0.5) * 2}" data-act="sk-open" data-id="${x.s.id}">`;
    g += `<path class="sk-br-off" d="${path}"/>`;
    if (x.lv) g += `<path class="sk-br-glow" pathLength="1" style="stroke-dasharray:${lit} 1" d="${path}" filter="url(#skSoft)"/><path class="sk-br-on" pathLength="1" style="stroke-dasharray:${lit} 1" d="${path}"/>`;
    for (let k = 1; k <= 5; k++) {
      const [nx, ny] = P(k / 5.2 + 0.03); const on = x.lv >= k; const cur = x.lv === k;
      if (on) { g += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="${cur ? 16 : 11}" fill="url(#skn-${x.i})" class="${cur ? 'sk-pulse' : ''}"/><circle class="sk-node on" cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="5.2"/><circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="2" style="fill:${x.c}"/>`;
        if (k < 5 && x.lv > k) { const [lx, ly] = P(k / 5.2 + 0.12); const [mx, my] = P(k / 5.2 + 0.13); const deg = Math.atan2(my - ly, mx - lx) * 180 / Math.PI; g += `<g class="sk-leaf">${lnLeaf(lx, ly, deg - 50, 9)}${lnLeaf(lx, ly, deg + 50, 8, 'lf2')}</g>`; } }
      else g += `<circle class="sk-node" cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="3.6"/>`;
    }
    if (x.lv >= 3) g += `<g transform="translate(${ex.toFixed(1)} ${ey.toFixed(1)})">${lnFlower(0, 0, 1.5)}</g>`;
    if (x.lv >= 5) g += `<g class="sk-crown" transform="translate(${ex.toFixed(1)} ${(ey - 14).toFixed(1)})"><path d="M0 -9l2.6 5.4 6 .9-4.3 4.2 1 5.9L0 4.6l-5.3 2.8 1-5.9-4.3-4.2 6-.9z"/></g>`;
    let right = Math.sin(ang) >= 0; let lx = ex + (right ? 8 : -8); const ly = ey - 18; if (right && lx > W - 70) { right = false; lx = Math.min(W - 6, ex + 4); } if (!right && lx < 70) { right = true; lx = Math.max(6, ex - 4); }
    g += `<text class="sk-lbl" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${right ? 'start' : 'end'}">${esc(x.s.name.length > 12 ? x.s.name.slice(0, 11) + '…' : x.s.name)}</text><text class="sk-sub" x="${lx.toFixed(1)}" y="${(ly + 12).toFixed(1)}" text-anchor="${right ? 'start' : 'end'}">Nv ${x.lv} · ${SKILL_N[x.lv]}</text>`;
    g += '</g>'; nodes.push(x);
  });
  for (let k = 0; k < Math.min(14, total * 1.5); k++) g += `<circle class="sk-mote" cx="${(cx - 120 + R() * 240).toFixed(1)}" cy="${(topY - 40 + R() * 200).toFixed(1)}" r="1.4" style="--d:${(R() * 6).toFixed(2)}s"/>`;
  return { svg: `<svg viewBox="0 0 ${W} ${H}" class="sk2-svg ln-ico" role="img" aria-label="Árbol de habilidades">${g}</svg>`, infos: nodes, total };
}
skillTreeHTML = function () {
  const subs = S.subjects.slice(0, 9);
  if (!subs.length) return `<section class="pn-card sk2"><h2 class="serif">Árbol de habilidades</h2><p class="muted" style="margin:0">Agrega tus materias y cada una será una rama que se ilumina y florece conforme avanzas.</p></section>`;
  const a = skillArt(subs, false);
  return `<section class="pn-card sk2"><div class="sk2-head"><h2 class="serif">Árbol de habilidades</h2><a class="btn quiet" href="#/habilidades">Verlo completo</a></div>${a.svg}
    <p class="small muted" style="margin:6px 0 0">Entregas, apuntes, libretas, enfoque y quizzes iluminan cada rama. ${a.total ? `Llevas ${plural(a.total, 'nodo encendido', 'nodos encendidos')} de ${subs.length * 5}.` : ''}</p></section>`;
};
function viewHabilidades() {
  const subs = S.subjects.slice(0, 9);
  if (!subs.length) return `<a class="back" href="#/panel">${icon('back')}Mi panel</a><h1 class="page-title">Habilidades</h1><div class="empty"><h3>Agrega tus materias</h3><p>Cada materia se vuelve una rama de tu árbol.</p><p><a class="btn primary" href="#/materias">Ir a Materias</a></p></div>`;
  const a = skillArt(subs, true);
  return `<a class="back" href="#/panel">${icon('back')}Mi panel</a><section class="sk-full"><h1 class="page-title">Tus habilidades</h1><p class="page-sub">Cada rama es una materia. Toca una para ver qué la hace crecer.</p>${a.svg}</section>
    <ul class="sk-list">${a.infos.map(({ s, xp, lv, c }) => { const nxt = SKILL_T[Math.min(5, lv + 1)]; const pct = lv >= 5 ? 100 : Math.round(((xp - SKILL_T[lv]) / (nxt - SKILL_T[lv])) * 100); return `<li><button type="button" data-act="sk-open" data-id="${s.id}" style="--c:${c}"><span class="sk-badge">${lv}</span><span class="txt"><b>${esc(s.name)}</b><span class="small muted">${SKILL_N[lv]} · ${xp} XP${lv < 5 ? ` · faltan ${nxt - xp} para ${SKILL_N[lv + 1]}` : ''}</span><span class="v-bar sm"><i style="width:${pct}%;background:${c}"></i></span></span></button></li>`; }).join('')}</ul>`;
}
EXTRA_VIEWS.habilidades = viewHabilidades; EXTRA_NAV.habilidades = 'mas';
Object.assign(VIDA_ACTS, {
  'sk-open': (el) => {
    const s = subj(el.dataset.id || el.closest('[data-id]')?.dataset.id); if (!s) return;
    const done = S.tasks.filter((t) => t.subjectId === s.id && t.done).length; const notes = (S.notes || []).filter((n) => n.subjectId === s.id).length; const pages = (S.pages || []).filter((p) => !p.deleted && p.subjectId === s.id).length;
    const fm = (S.focus || []).filter((f) => f.s === s.id).reduce((a, f) => a + f.m, 0); const q = (S.quiz?.subj || {})[s.id] || { n: 0, ok: 0 }; const xp = skillXP2(s.id); const lv = skillLv(xp);
    openSheet(`${sheetHead(s.name)}<div class="sheet-body"><div class="sk-sheet" style="--c:${safeColor(s.color)}"><span class="sk-badge big">${lv}</span><div><b>${SKILL_N[lv]}</b><span class="small muted">${xp} XP${lv < 5 ? ` · siguiente: ${SKILL_N[lv + 1]} a los ${SKILL_T[lv + 1]} XP` : ' · nivel máximo'}</span></div></div>
      <ul class="rows"><li><div class="rowline"><span class="ico">${icon('check')}</span><span class="txt"><b>${plural(done, 'tarea entregada', 'tareas entregadas')}</b><span>+10 XP cada una, +4 si sacas buena nota</span></span></div></li>
      <li><div class="rowline"><span class="ico">${icon('note')}</span><span class="txt"><b>${plural(notes + pages, 'página escrita', 'páginas escritas')}</b><span>Apuntes +2 XP · páginas de libreta +3 XP</span></span></div></li>
      <li><div class="rowline"><span class="ico">${icon('timer')}</span><span class="txt"><b>${fmtMinutes(fm)} de enfoque</b><span>+1 XP cada 10 minutos</span></span></div></li>
      <li><div class="rowline"><span class="ico">${icon('spark')}</span><span class="txt"><b>${q.ok} respuestas correctas en quizzes</b><span>+2 XP cada una</span></span></div></li></ul>
      <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-act="qz-go" data-v="${s.id}">Quiz de ${esc(s.name)}</button><a class="btn" href="#/libretas/${s.id}" data-act="sheet-close">Abrir libreta</a></div></div>`);
  },
});

/* ===================== Jardín: muchas decoraciones nuevas ===================== */
const GARDEN2 = [
  ['piedras', 'Piedras apiladas', 25, 1, 'gem'], ['tulipan', 'Tulipanes', 30, 2, 'leaf'], ['caracol', 'Caracolito', 35, 3, 'paw'], ['girasol', 'Girasoles', 40, 3, 'sun'],
  ['lavanda', 'Lavanda', 50, 4, 'leaf'], ['mariposas', 'Mariposas azules', 70, 7, 'spark'], ['luciernagas', 'Luciérnagas doradas', 90, 11, 'spark'], ['colmena', 'Colmena y abejas', 80, 9, 'home'],
  ['cometa', 'Papalote', 90, 12, 'wind'], ['campanas', 'Campanas de viento', 100, 13, 'bell'], ['guirnalda', 'Guirnalda de luces', 110, 14, 'lamp'], ['huerto', 'Huerto', 120, 16, 'leaf'],
  ['bonsai', 'Bonsái', 130, 18, 'leaf'], ['columpio', 'Columpio', 140, 19, 'home'], ['toro', 'Linterna de piedra', 150, 22, 'lamp'], ['gato', 'Gatito dormido', 160, 24, 'paw'],
  ['buho', 'Búho', 180, 27, 'paw'], ['hamaca', 'Hamaca', 200, 30, 'home'], ['pozo', 'Pozo de los deseos', 220, 33, 'drop'], ['rosas', 'Arco de rosas', 240, 36, 'heart'],
  ['telescopio', 'Telescopio', 260, 40, 'target'], ['puente', 'Puente de madera', 280, 43, 'home'], ['ciervo', 'Venado', 300, 46, 'paw'], ['koi', 'Estanque koi', 340, 50, 'drop'],
  ['invernadero', 'Invernadero', 380, 56, 'home'], ['kiosco', 'Kiosco', 420, 62, 'home'], ['faro', 'Faro en la colina', 480, 68, 'lamp'], ['cabana', 'Cabaña del bosque', 600, 80, 'home'],
];
for (const [id, name, cost, lvl, emoji] of GARDEN2) if (!GARDEN.some((g) => g.id === id)) GARDEN.push({ id, name, cost, lvl, emoji });
GARDEN.sort((a, b) => a.lvl - b.lvl || a.cost - b.cost);
function garden2SVG(ids) {
  const has = (k) => (ids || []).includes(k); let o = '';
  const L = (d, w = 1, c = 'ln') => `<path class="${c}" stroke-width="${w}" d="${d}"/>`;
  if (has('piedras')) o += `<g transform="translate(168 297)">${L('M-9 0C-9 -4 9 -4 9 0Z')}${L('M-6 -3.5C-6 -8 6 -8 6 -3.5')}${L('M-3.5 -7.6C-3.5 -11 3.5 -11 3.5 -7.6')}</g>`;
  if (has('tulipan')) for (const [x, c] of [[232, 'fl'], [240, 'fr'], [248, 'fl']]) o += `<g transform="translate(${x} 292)">${L('M0 0V-12', 0.9, 'ln a')}<path class="${c}" d="M-3 -12C-3 -18 3 -18 3 -12L1.5 -10L0 -13L-1.5 -10Z"/>${lnLeaf(0, -4, -140, 6)}</g>`;
  if (has('caracol')) o += `<g transform="translate(282 298)">${L('M-8 0H6a4 4 0 0 0 4-4')}${L('M4 -2a5 5 0 1 0-5-5 3 3 0 0 0 3 3 1.6 1.6 0 0 0 1.6-1.6')}${L('M9 -4l1.5-4M10 -3.5l3-3', 0.7)}</g>`;
  if (has('girasol')) for (const [x, h] of [[116, 26], [126, 32]]) o += `<g transform="translate(${x} 272)">${L(`M0 0V-${h}`, 1, 'ln a')}${lnLeaf(0, -h * 0.4, -150, 8)}${lnLeaf(0, -h * 0.55, -30, 8)}<g transform="translate(0 -${h})">${Array.from({ length: 10 }, (_, i) => `<ellipse class="fr" rx="1.6" ry="3.6" transform="rotate(${i * 36}) translate(0 -5)"/>`).join('')}<circle class="ln" stroke-width=".8" r="3" style="fill:color-mix(in srgb,#6B4A2A 40%,transparent)"/></g></g>`;
  if (has('lavanda')) for (let i = 0; i < 5; i++) o += `<g transform="translate(${296 + i * 4} 294)">${L(`M0 0V-${12 + (i % 2) * 3}`, 0.7, 'ln a')}${Array.from({ length: 4 }, (_, k) => `<ellipse class="lv" cx="0" cy="${-8 - k * 2.4 - (i % 2) * 3}" rx="1.2" ry="1.7"/>`).join('')}</g>`;
  if (has('mariposas')) o += `<g class="g-flutter" style="transform:translate(98px,176px)">${[[0, 0], [16, -10], [30, 4]].map(([x, y]) => `<path class="ln w" stroke-width=".8" transform="translate(${x} ${y})" d="M0 0C-3 -5 -8 -4 -6 0C-8 4 -3 5 0 0C3 -5 8 -4 6 0C8 4 3 5 0 0Z" style="fill:color-mix(in srgb,#6FA8E8 30%,transparent)"/>`).join('')}</g>`;
  if (has('luciernagas')) for (let i = 0; i < 12; i++) o += `<circle class="v-fly dot" cx="${20 + ((i * 53) % 320)}" cy="${200 + ((i * 37) % 70)}" r="1.4" style="--d:${(i * 0.37).toFixed(2)}s;fill:#E8C25A"/>`;
  if (has('colmena')) o += `<g transform="translate(52 296)">${L('M0 0V-26')}${L('M-8 -26C-8 -40 8 -40 8 -26ZM-8 -30H8M-7 -34H7')}<circle class="dot" cy="-28" r="1.3"/><g class="g-flutter"><circle class="fr" cx="12" cy="-40" r="1.6"/><circle class="fr" cx="-14" cy="-34" r="1.4"/></g></g>`;
  if (has('cometa')) o += `<g class="g-float" style="transform:translate(268px,76px)"><path class="ln" stroke-width="1" d="M0 -14L10 0L0 18L-10 0Z" style="fill:color-mix(in srgb,#E27A5B 22%,transparent)"/>${L('M0 -14V18M-10 0H10', 0.6)}${L('M0 18C6 30 -6 40 2 52C8 62 -4 70 0 80', 0.6, 'ln s')}<path class="ln a" stroke-width=".8" d="M2 30l4 -2M-3 46l-4 -2M3 62l4 -2"/></g>`;
  if (has('campanas')) o += `<g transform="translate(346 250)">${L('M0 46V0M-10 0H10')}<g class="g-chime">${[-7, -2, 3, 8].map((x, i) => `${L(`M${x} 0v${8 + i * 3}`, 0.5, 'ln s')}<rect class="ln g" stroke-width=".8" x="${x - 1.2}" y="${8 + i * 3}" width="2.4" height="${8 + i * 2}" rx="1"/>`).join('')}</g></g>`;
  if (has('guirnalda')) { o += L('M6 120Q60 150 120 118', 0.7, 'ln s'); for (let i = 1; i < 9; i++) { const t = i / 9; const x = 6 + 114 * t, y = (1 - t) * (1 - t) * 120 + 2 * (1 - t) * t * 150 + t * t * 118; o += `<circle class="gl-b" cx="${x.toFixed(1)}" cy="${(y + 3).toFixed(1)}" r="2" style="--d:${(i * 0.3).toFixed(1)}s"/>`; } }
  if (has('huerto')) for (let r = 0; r < 2; r++) { o += L(`M${290} ${300 - r * 6}H${330}`, 0.7, 'ln s'); for (let i = 0; i < 5; i++) o += `<g transform="translate(${292 + i * 9} ${299 - r * 6})">${lnLeaf(0, 0, -120, 5)}${lnLeaf(0, 0, -60, 5)}</g>`; }
  if (has('bonsai')) o += `<g transform="translate(140 297)">${L('M-10 0H10L8 -6H-8ZM-11 -6H11')}${L('M0 -6C-2 -12 3 -14 1 -20M1 -16C5 -18 8 -18 10 -20', 1.2)}<circle class="w-bon" cx="-3" cy="-23" r="6"/><circle class="w-bon" cx="9" cy="-22" r="5"/>${lnLeaf(-3, -23, -120, 6)}${lnLeaf(9, -22, -40, 6)}</g>`;
  if (has('columpio')) o += `<g transform="translate(330 296)">${L('M-14 0L-8 -40H8L14 0M-8 -40H8')}<g class="g-swing" style="transform-origin:0 -40px">${L('M-5 -40V-10M5 -40V-10', 0.6)}${L('M-7 -10H7', 1.4)}</g></g>`;
  if (has('toro')) o += `<g transform="translate(34 297)">${L('M-6 0H6L4 -4H-4ZM-1.5 -4V-12H1.5V-4M-7 -12H7L5 -20H-5ZM-9 -20H9L0 -27Z')}<rect class="gl-b" x="-2.4" y="-18" width="4.8" height="4" style="--d:0s"/></g>`;
  if (has('gato')) o += `<g transform="translate(250 298)">${L('M-10 0C-12 -8 6 -10 9 -4C10 -2 8 0 6 0ZM6 -6l1 -4 2 3M3 -7l0 -4 2 3', 0.9)}${L('M-10 0C-14 -2 -14 -6 -10 -6', 0.8)}<path class="ln s" stroke-width=".5" d="M14 -12h3l-3 3h3M19 -18h3l-3 3h3"/></g>`;
  if (has('buho')) o += `<g transform="translate(18 252)">${L('M0 44V8')}${L('M-7 8C-8 -6 8 -6 7 8C6 14 -6 14 -7 8ZM-6 -2l-2 -4 4 2M6 -2l2 -4 -4 2')}<circle class="ln" stroke-width=".8" cx="-2.6" cy="2" r="2"/><circle class="ln" stroke-width=".8" cx="2.6" cy="2" r="2"/><circle class="dot" cx="-2.6" cy="2" r=".7"/><circle class="dot" cx="2.6" cy="2" r=".7"/></g>`;
  if (has('hamaca')) o += `<g transform="translate(212 296)">${L('M-22 0V-24M22 0V-24')}${L('M-22 -20C-10 -6 10 -6 22 -20', 1.1)}${L('M-18 -16C-8 -8 8 -8 18 -16', 0.5, 'ln s')}</g>`;
  if (has('pozo')) o += `<g transform="translate(196 298)">${L('M-10 0V-10H10V0ZM-10 -6H10M-12 -24L0 -32L12 -24ZM-8 -10V-24M8 -10V-24')}${L('M0 -24V-14', 0.5, 'ln s')}<rect class="ln" stroke-width=".7" x="-2" y="-14" width="4" height="3"/></g>`;
  if (has('rosas')) o += `<g transform="translate(150 298)">${L('M-14 0V-20A14 14 0 0 1 14 -20V0')}${Array.from({ length: 7 }, (_, i) => { const a = Math.PI + (i / 6) * Math.PI; return `<circle class="fl rz" cx="${(Math.cos(a) * 14).toFixed(1)}" cy="${(-20 + Math.sin(a) * 14).toFixed(1)}" r="2.2"/>`; }).join('')}</g>`;
  if (has('telescopio')) o += `<g transform="translate(92 296)">${L('M0 0L-6 -14M0 0L6 -14M0 0V-12')}${L('M-12 -16L10 -26L12 -22L-10 -12Z', 1)}<circle class="ln g" stroke-width=".6" cx="40" cy="-150" r="2"/></g>`;
  if (has('puente')) o += `<g transform="translate(222 300)">${L('M-22 0Q0 -16 22 0')}${L('M-22 -6Q0 -22 22 -6', 0.8)}${[-14, -7, 0, 7, 14].map((x) => L(`M${x} ${(-Math.cos((x / 22) * 1.4) * 10 + 2).toFixed(1)}v-6`, 0.6)).join('')}</g>`;
  if (has('ciervo')) o += `<g transform="translate(110 290)">${L('M-10 0V-8M-6 0V-8M6 0V-8M10 0V-8M-12 -8C-12 -14 12 -14 12 -8C10 -6 -10 -6 -12 -8ZM10 -12L13 -20L17 -19L16 -15ZM14 -20l-2 -6M14 -20l3 -6M13 -25l-2 -2M16 -25l2 -2', 0.9)}</g>`;
  if (has('koi')) o += `<g transform="translate(66 298)"><ellipse class="ln w" stroke-width="1" rx="22" ry="6" style="fill:color-mix(in srgb,var(--l-water) 18%,transparent)"/><g class="g-koi"><path class="fr" d="M-8 0c3 -2 7 -2 9 0c-2 2 -6 2 -9 0zM1 0l3 -2v4z"/></g><path class="lf" d="M10 -2a3 3 0 1 0 6 0a3 3 0 1 0-6 0z"/></g>`;
  if (has('invernadero')) o += `<g transform="translate(58 274)">${L('M-18 22V0L0 -12L18 0V22ZM-18 0H18M0 -12V22M-9 -6V22M9 -6V22')}${lnLeaf(-5, 18, -120, 7)}${lnLeaf(5, 18, -60, 7)}</g>`;
  if (has('kiosco')) o += `<g transform="translate(300 272)">${L('M-20 24V2M20 24V2M-24 2H24L0 -16ZM-24 24H24M0 -16V-22')}<circle class="ln g" stroke-width=".8" cy="-23" r="1.6"/>${L('M-20 14H20', 0.5, 'ln s')}</g>`;
  if (has('faro')) o += `<g transform="translate(332 198)">${L('M-5 22L-3 -6H3L5 22ZM-4 6H4M-4 14H4M-4 -6H4V-12H-4ZM-5 -12H5L0 -16Z', 0.9)}<path class="ln g fa-beam" stroke-width=".6" d="M3 -9L40 -16M3 -9L40 -2"/></g>`;
  if (has('cabana')) o += `<g transform="translate(30 268)">${L('M-18 28V4H18V28ZM-22 6L0 -12L22 6M-6 28V14H6V28M8 10H14V16H8ZM10 -6V-14H14V-3')}<path class="ln s" stroke-width=".6" d="M12 -16c-2 -6 4 -8 2 -14"/></g>`;
  return o;
}
{
  const baseGarden = gardenSVG;
  gardenSVG = function (ids, id) { const h = baseGarden(ids, id); return h.replace(/<\/g>$/, garden2SVG(ids) + '</g>'); };
}
/* vista previa de cada decoración en la tienda (se recorta sola alrededor del dibujo) */
function decoPreview(gid) {
  return `<svg class="sh-deco ln-ico" data-deco="${gid}" viewBox="0 0 360 300" aria-hidden="true">${gardenSVG([gid], 'pv')}</svg>`;
}
function fitDecos() {
  document.querySelectorAll('svg.sh-deco:not([data-fit])').forEach((s) => { try { const b = s.querySelector('g').getBBox(); if (b.width) { const pad = 6; s.setAttribute('viewBox', `${b.x - pad} ${b.y - 26 - pad} ${b.width + pad * 2} ${b.height + pad * 2}`); s.dataset.fit = '1'; } } catch { /* */ } });
}
{
  const baseShop = shopTabHTML;
  shopTabHTML = function (c) {
    let h = baseShop(c);
    h = h.replace(/<span class="s-ico">[\s\S]*?<\/span><b>([^<]+)<\/b>/g, (m, name) => { const g = GARDEN.find((x) => esc(x.name) === name); return g ? `<span class="s-ico pv">${decoPreview(g.id)}</span><b>${name}</b>` : m; });
    setTimeout(fitDecos, 30);
    return h;
  };
}

/* ===================== Sonidos y sensación ===================== */
Object.assign(Snd, {
  verb() {
    const c = this.ac(); if (!c) return null; if (this._verb) return this._verb;
    const len = c.sampleRate * 1.6; const b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    const cv = c.createConvolver(); cv.buffer = b; const g = c.createGain(); g.gain.value = 0.22; cv.connect(g).connect(c.destination); this._verb = cv; return cv;
  },
  mar(f, t0 = 0, g = 0.09, dur = 0.9) {
    const c = this.ac(); if (!c) return; const v = this.verb();
    for (const [mul, gg, dd] of [[1, 1, 1], [4, 0.22, 0.25], [9.8, 0.06, 0.08]]) {
      const o = c.createOscillator(), gn = c.createGain(); o.type = 'sine'; o.frequency.value = f * mul;
      gn.gain.setValueAtTime(0.0001, c.currentTime + t0); gn.gain.exponentialRampToValueAtTime(g * gg, c.currentTime + t0 + 0.006); gn.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur * dd);
      o.connect(gn); gn.connect(c.destination); if (v) gn.connect(v); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
    }
  },
  chime() { if (!this.on()) return; [[523.25, 0], [659.25, 0.07], [783.99, 0.14], [1046.5, 0.22]].forEach(([f, t], i) => this.mar(f, t, 0.075 - i * 0.008, 1.4)); this.mar(1567.98, 0.34, 0.025, 1.8); },
  drop() { if (!this.on()) return; const c = this.ac(); if (!c) return; const v = this.verb(); const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(1250, c.currentTime); o.frequency.exponentialRampToValueAtTime(480, c.currentTime + 0.1); g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.075, c.currentTime + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.26); o.connect(g); g.connect(c.destination); if (v) g.connect(v); o.start(); o.stop(c.currentTime + 0.3); },
  tick() { if (this.on()) this.mar(880, 0, 0.03, 0.25); },
  pop() { if (!this.on()) return; this.mar(740, 0, 0.05, 0.35); this.mar(1110, 0.05, 0.03, 0.3); },
  tap() { if (!this.on() || S.settings.tapSounds === false) return; const now = performance.now(); if (now - (this._lt || 0) < 70) return; this._lt = now; this.mar(1320 + Math.random() * 60, 0, 0.012, 0.12); },
  whoosh() {
    if (!this.on() || S.settings.tapSounds === false) return; const c = this.ac(); if (!c) return;
    const n = c.createBufferSource(); const len = c.sampleRate * 0.32; const b = c.createBuffer(1, len, c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / len);
    n.buffer = b; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8; bp.frequency.setValueAtTime(500, c.currentTime); bp.frequency.exponentialRampToValueAtTime(2600, c.currentTime + 0.3); const g = c.createGain(); g.gain.value = 0.02;
    n.connect(bp).connect(g).connect(c.destination); n.start();
  },
  coin() { if (!this.on()) return; this.mar(1318.5, 0, 0.05, 0.5); this.mar(1975.5, 0.08, 0.05, 0.7); },
});
// toque suave + onda en botones; un susurro al cambiar de sección
document.addEventListener('pointerdown', (e) => {
  const b = e.target.closest('.btn, .ht, .rowbtn, .nav a, .lb-addb, .qz-opt, .poll-o, .sh-card .btn, .chk, .fchip, .seg button'); if (!b) return;
  if (!b.matches('.chk')) Snd.tap();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || b.matches('.chk, .nav a, .seg button, .fchip')) return;
  const r = b.getBoundingClientRect(); const s = document.createElement('span'); s.className = 'rip'; const d = Math.max(r.width, r.height) * 1.4;
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  if (getComputedStyle(b).position === 'static') b.style.position = 'relative'; b.style.overflow = b.style.overflow || 'hidden';
  b.appendChild(s); setTimeout(() => s.remove(), 650);
}, { passive: true });
let lastHash = location.hash;
window.addEventListener('hashchange', () => { if (location.hash.split('/')[1] !== lastHash.split('/')[1]) Snd.whoosh(); lastHash = location.hash; });

/* Mariposas que cruzan de vez en cuando (si están activadas las hojas) */
function butterfly() {
  if (document.visibilityState !== 'visible' || S.settings.leaves === false || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const b = document.createElement('div'); b.className = 'amb-bfly'; const fromL = Math.random() < 0.5; const y = 18 + Math.random() * 50;
  b.style.cssText = `top:${y}vh;${fromL ? 'left:-40px' : 'right:-40px'};--dx:${fromL ? '' : '-'}110vw;--dy:${(Math.random() - 0.5) * 30}vh;--dur:${14 + Math.random() * 8}s`;
  const c = ['#6FA8E8', '#E3A9C0', '#E8C25A', '#8FC79A'][Math.floor(Math.random() * 4)];
  b.innerHTML = `<svg viewBox="-10 -8 20 16" aria-hidden="true"><g class="amb-w"><path d="M0 0C-3 -6 -9 -5 -7 0C-9 5 -3 6 0 0Z" style="fill:${c}"/><path d="M0 0C3 -6 9 -5 7 0C9 5 3 6 0 0Z" style="fill:${c}"/></g><path d="M0 -3V3" stroke="#3B3328" stroke-width=".8"/></svg>`;
  document.body.appendChild(b); setTimeout(() => b.remove(), 24000);
}
setInterval(butterfly, 45000); setTimeout(butterfly, 9000);

/* vuelve a pintar con todo lo nuevo ya cargado */
try { render(); } catch (e) { console.warn('[Al Día] render', e); }
