/* Cinnavia 7.31 — Legibilidad: el color del texto sobre cualquier color (avatares, monogramas) se elige por contraste. */
'use strict';
function inkOn(hex) {
  const h = String(hex || '').replace('#', ''); const f = h.length === 3 ? h.replace(/./g, '$&$&') : h.slice(0, 6); if (!/^[0-9a-f]{6}$/i.test(f)) return '#fff';
  const c = [0, 2, 4].map((i) => { const v = parseInt(f.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; const w = 1.05 / (L + 0.05), d = (L + 0.05) / 0.0165; return w >= d ? '#fff' : '#1B1B18';
}
function fitBg(hex) {
  let h = String(hex || '').replace('#', ''); h = h.length === 3 ? h.replace(/./g, '$&$&') : h.slice(0, 6); if (!/^[0-9a-f]{6}$/i.test(h)) return hex;
  const lum = (x) => { const c = [0, 2, 4].map((i) => { const v = parseInt(x.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  for (let k = 0; k < 6; k++) { const L = lum(h); if (Math.max(1.05 / (L + 0.05), (L + 0.05) / 0.0165) >= 4.5) break; h = [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.9).toString(16).padStart(2, '0')).join(''); }
  return '#' + h;
}
{
  const baseAv = avatar;
  avatar = function (p, cls = '') {
    const h = baseAv(p, cls); if (h.includes('has-ph')) return h;
    return h.replace(/style="--pc:([^";]+)"/, (m, c) => { const col = fitBg(safeColor(c.trim())); return `style="--pc:${col};color:${inkOn(col)}"`; });
  };
}
