/* Cinnavia 7.25 — Árbol de habilidades minimalista: un tronco fino, ramas limpias y un círculo por materia. */
'use strict';
skTree = function () {
  const subs = S.subjects.slice(0, 12); const n = subs.length;
  const H = n > 10 ? 740 : 640, W = 420, tx = 210;
  const st = subs.map((x) => ({ s: x, ...skStats(x.id) })); const lit = st.reduce((q, x) => q + x.lit, 0), total = st.reduce((q, x) => q + x.total, 0);
  const base = H - 40; let back = '', orbs = '';
  back += `<line class="skm-trunk" x1="${tx}" y1="${base}" x2="${tx}" y2="${base - 150}"/><line class="skm-ground" x1="${tx - 60}" y1="${base}" x2="${tx + 60}" y2="${base}"/>`;
  st.forEach((o, i) => {
    const [ox, oy] = SK_SLOTS[i]; const f = o.lit / o.total; const col = safeColor(o.s.color); const sy = base - 70 - (i % 4) * 22;
    const d = `M${tx} ${sy}C${tx} ${(sy + oy) / 2} ${ox} ${(sy + oy) / 2 + 20} ${ox} ${oy + 28}`;
    back += `<path class="skm-limb" d="${d}"/>`;
    if (o.lit) back += `<path class="skm-limb-on" pathLength="1" d="${d}" style="stroke-dasharray:${Math.min(1, 0.15 + f * 0.85).toFixed(3)} 2"/>`;
    const circ = 2 * Math.PI * 26; const nm = o.s.name.length > 13 ? o.s.name.slice(0, 12) + '…' : o.s.name;
    orbs += `<g class="skm-orb ${o.lit ? 'on' : ''}" data-act="skt-open" data-id="${o.s.id}" role="button" tabindex="0" aria-label="${esc(o.s.name)}: ${o.lit} de ${o.total} habilidades">
      <circle class="skm-ring-bg" cx="${ox}" cy="${oy}" r="26"/>
      <circle class="skm-ring" cx="${ox}" cy="${oy}" r="26" transform="rotate(-90 ${ox} ${oy})" stroke-dasharray="${(circ * f).toFixed(1)} ${circ.toFixed(1)}" style="stroke:${col}"/>
      <circle class="skm-core" cx="${ox}" cy="${oy}" r="21"/>
      <text class="skm-lv" x="${ox}" y="${oy + 6}" text-anchor="middle">${o.lit}</text>
      <text class="skm-nm" x="${ox}" y="${oy + 46}" text-anchor="middle">${esc(nm)}</text>
      <circle class="sk-hit" cx="${ox}" cy="${oy + 12}" r="50"/></g>`;
  });
  const svg = `<svg class="sk-svg skm" viewBox="0 0 ${W} ${H}" aria-label="Árbol de habilidades">${back}${orbs}</svg>`;
  return { svg, lit, total };
};
