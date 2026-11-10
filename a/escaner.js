/* Cinnavia 7.15 — Escáner más preciso.
   1) Prepara la foto: tamaño ideal para leer, quita sombras (fondo parejo), estira el contraste y enfoca.
   2) Lee dos versiones (gris mejorado y blanco/negro adaptativo) y se queda con la que el lector entiende mejor.
   3) Corrige errores típicos: números con letras, palabras escolares, materias, meses y días mal leídos. */
'use strict';
function scanCanvas(img, maxSide) {
  const long = Math.max(img.width, img.height); const k = long < 1700 ? Math.min(2.2, 2300 / long) : Math.min(1, 2600 / long);
  const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingQuality = 'high'; g.drawImage(img, 0, 0, c.width, c.height); return c;
}
function toGray(c) {
  const g = c.getContext('2d', { willReadFrequently: true }); const d = g.getImageData(0, 0, c.width, c.height); const px = d.data; const N = c.width * c.height; const y = new Float32Array(N);
  for (let i = 0, j = 0; j < N; i += 4, j++) y[j] = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
  return { y, w: c.width, h: c.height, d, g };
}
function integral(y, w, h) { const I = new Float64Array((w + 1) * (h + 1)); for (let r = 1; r <= h; r++) { let s = 0; for (let x = 1; x <= w; x++) { s += y[(r - 1) * w + x - 1]; I[r * (w + 1) + x] = I[(r - 1) * (w + 1) + x] + s; } } return I; }
function boxMean(I, w, h, x, r, rad) { const x0 = Math.max(0, x - rad), x1 = Math.min(w, x + rad + 1), y0 = Math.max(0, r - rad), y1 = Math.min(h, r + rad + 1); const W1 = w + 1; return (I[y1 * W1 + x1] - I[y0 * W1 + x1] - I[y1 * W1 + x0] + I[y0 * W1 + x0]) / ((x1 - x0) * (y1 - y0)); }
function prepScan(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = scanCanvas(img); URL.revokeObjectURL(img.src);
        const { y, w, h, d, g } = toGray(c); const I = integral(y, w, h); const rad = Math.max(12, Math.round(Math.min(w, h) / 28));
        // 1) quitar sombras: divide entre el fondo local
        const flat = new Float32Array(w * h);
        for (let r = 0; r < h; r++) for (let x = 0; x < w; x++) { const m = boxMean(I, w, h, x, r, rad * 2); flat[r * w + x] = Math.min(255, (y[r * w + x] / Math.max(1, m)) * 235); }
        // 2) contraste por percentiles
        const hist = new Uint32Array(256); for (const v of flat) hist[v | 0]++;
        let lo = 0, hi = 255, acc = 0; const N = w * h; for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc > N * 0.01) { lo = i; break; } } acc = 0; for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc > N * 0.04) { hi = i; break; } }
        const span = Math.max(30, hi - lo); const px = d.data; const gray = new Uint8ClampedArray(N);
        for (let j = 0; j < N; j++) { const v = Math.max(0, Math.min(255, ((flat[j] - lo) / span) * 255)); gray[j] = v; }
        // 3) enfoque suave (unsharp)
        const I2 = integral(gray, w, h); const sharp = new Uint8ClampedArray(N);
        for (let r = 0; r < h; r++) for (let x = 0; x < w; x++) { const j = r * w + x; sharp[j] = gray[j] + 0.6 * (gray[j] - boxMean(I2, w, h, x, r, 1)); }
        for (let j = 0, i = 0; j < N; j++, i += 4) px[i] = px[i + 1] = px[i + 2] = sharp[j];
        g.putImageData(d, 0, 0);
        // 4) versión blanco y negro adaptativa (Bradley)
        const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; const g2 = c2.getContext('2d'); const d2 = g2.createImageData(w, h); const I3 = integral(sharp, w, h);
        for (let r = 0; r < h; r++) for (let x = 0; x < w; x++) { const j = r * w + x; const m = boxMean(I3, w, h, x, r, rad); const v = sharp[j] < m * 0.86 ? 0 : 255; const i = j * 4; d2.data[i] = d2.data[i + 1] = d2.data[i + 2] = v; d2.data[i + 3] = 255; }
        g2.putImageData(d2, 0, 0);
        res([c, c2]);
      } catch (e) { rej(e); }
    };
    img.onerror = () => rej(new Error('img'));
    img.src = URL.createObjectURL(file);
  });
}
const SCAN_WORDS = ['tarea', 'tareas', 'entrega', 'entregar', 'examen', 'parcial', 'proyecto', 'exposición', 'investigación', 'investigar', 'resumen', 'ensayo', 'cuestionario', 'reporte', 'práctica', 'lectura', 'mapa', 'conceptual', 'mental', 'maqueta', 'ejercicio', 'ejercicios', 'trabajo', 'equipo', 'realizar', 'elaborar', 'traer', 'estudiar', 'presentación', 'actividad', 'resolver', 'redactar', 'cuadro', 'comparativo', 'sinóptico', 'línea', 'tiempo', 'infografía', 'portafolio', 'evidencia', 'guía', 'problemas', 'página', 'páginas', 'libro', 'cuaderno', 'unidad', 'tema', 'temas', 'fecha', 'para', 'hasta', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo', 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre', 'mañana', 'hoy', 'próximo', 'semana', 'matemáticas', 'historia', 'química', 'física', 'biología', 'español', 'inglés', 'geografía', 'contabilidad', 'mercadotecnia', 'administración', 'economía', 'filosofía', 'literatura', 'ética', 'informática', 'computación', 'estadística', 'cálculo', 'álgebra', 'geometría'];
function lev(a, b, max) { if (Math.abs(a.length - b.length) > max) return max + 1; const v = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { let prev = v[0]; v[0] = i; let best = v[0]; for (let j = 1; j <= b.length; j++) { const t = v[j]; v[j] = Math.min(v[j] + 1, v[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = t; best = Math.min(best, v[j]); } if (best > max) return max + 1; } return v[b.length]; }
function fixOCR(text) {
  const dict = [...new Set([...SCAN_WORDS, ...S.subjects.flatMap((s) => normChars(s.name).split(/\s+/)).filter((w) => w.length >= 4)])];
  const plain = new Map(dict.map((w) => [normChars(w), w]));
  let t = text.replace(/\r/g, '').replace(/[“”«»]/g, '"').replace(/[‘’´`]/g, "'").replace(/-\n(?=[a-záéíóúñ])/g, '').replace(/[|]/g, 'l').replace(/­/g, '');
  // números con letras dentro de fechas y cantidades: 1O/l2 -> 10/12
  t = t.replace(/\b[0-9OolIZS]{1,2}[/.\-][0-9OolIZS]{1,2}([/.\-][0-9OolIZS]{2,4})?\b/g, (m) => (/\d/.test(m) ? m.replace(/[Oo]/g, '0').replace(/[lI]/g, '1').replace(/Z/g, '2').replace(/S/g, '5') : m));
  t = t.replace(/\b(p[aá]g(?:ina)?s?\.?)\s*([0-9OolI]{1,3})\b/gi, (m, a, n) => `${a} ${n.replace(/[Oo]/g, '0').replace(/[lI]/g, '1')}`);
  t = t.replace(/[A-Za-zÁÉÍÓÚÑáéíóúñü]{4,}/g, (w) => {
    const n = normChars(w); if (plain.has(n)) return keepCase(w, plain.get(n));
    const max = n.length >= 9 ? 2 : n.length >= 6 ? 1 : 0; if (!max) return w; let best = null, bd = max + 1;
    for (const [k, v] of plain) { if (Math.abs(k.length - n.length) > max || (k[0] !== n[0] && k[k.length - 1] !== n[n.length - 1]) || n === k + 's' || k === n + 's' || n === k + 'es' || k === n + 'es') continue; const dd = lev(n, k, max); if (dd < bd) { bd = dd; best = v; } }
    return best && bd <= max ? keepCase(w, best) : w;
  });
  return t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
const keepCase = (src, w) => (src === src.toUpperCase() ? w.toUpperCase() : /^[A-ZÁÉÍÓÚÑ]/.test(src) ? cap(w) : w);
readPhoto = async function (file) {
  setScanProgress('Preparando la foto…', 0.03);
  const [c1, c2] = await prepScan(file);
  setScanProgress('Cargando el lector…', 0.08);
  await loadTesseract();
  let pass = 0;
  if (!tessWorker) {
    tessWorker = await window.Tesseract.createWorker('spa', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') setScanProgress(pass ? 'Revisando con otra versión de la foto…' : 'Leyendo la foto…', 0.3 + (pass * 0.35) + m.progress * 0.35);
        else if (/load|initializ/.test(m.status || '')) setScanProgress('Cargando el lector…', 0.08 + (m.progress || 0) * 0.2);
      },
    });
    try { await tessWorker.setParameters({ preserve_interword_spaces: '1', user_defined_dpi: '300', tessedit_pageseg_mode: '3' }); } catch { /* */ }
  }
  const a = await tessWorker.recognize(c1); pass = 1;
  let best = a.data;
  if ((a.data.confidence || 0) < 88) { try { const b = await tessWorker.recognize(c2); if ((b.data.confidence || 0) > (best.confidence || 0) + 2) best = b.data; } catch { /* */ } }
  SCAN.conf = Math.round(best.confidence || 0);
  return fixOCR(best.text || '');
};
