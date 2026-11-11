/* Cinnavia 7.24 — Lector de fotos de máxima precisión (gratis, en tu celular).
   1) Prepara la foto: la endereza (detecta la inclinación del texto), quita sombras, endereza el contraste,
      reconoce pizarrones oscuros y los invierte, y genera varias versiones de la misma foto.
   2) Lee con el modelo «best» de español de Tesseract (el más exacto) en varias pasadas, cada una con una
      versión distinta de la foto y un modo de página distinto.
   3) Une las pasadas palabra por palabra (votación): se queda con la lectura en la que más versiones coinciden
      y con más seguridad, y prefiere palabras del vocabulario escolar y de tus materias.
   4) Marca las palabras dudosas (y siempre los números y fechas con poca seguridad) y las revisas una por una
      viendo el recorte de la foto, con sugerencias. Así no queda ningún error sin ver.
   5) Manda el texto, la foto y las tareas a la libreta de una materia. */
'use strict';
const LC = { worker: null, workerLoading: null, rv: null, passes: 0 };
const lcNorm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');
const lcMedian = (arr) => { if (!arr.length) return 0; const a = [...arr].sort((x, y) => x - y); return a[a.length >> 1]; };

/* ---------- 1. Preparación de la foto ---------- */
async function lcLoadImage(file) {
  try { const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); return { src: bmp, width: bmp.width, height: bmp.height, free: () => bmp.close && bmp.close() }; } catch { /* sigue */ }
  return new Promise((res, rej) => { const img = new Image(); img.onload = () => res({ src: img, width: img.width, height: img.height, free: () => URL.revokeObjectURL(img.src) }); img.onerror = () => rej(new Error('img')); img.src = URL.createObjectURL(file); });
}
function lcCanvas(arr, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const d = g.createImageData(w, h);
  for (let j = 0, i = 0; j < w * h; j++, i += 4) { d.data[i] = d.data[i + 1] = d.data[i + 2] = arr[j]; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
}
/* inclinación del texto (grados): proyección de la tinta en filas, la mejor es la que deja los renglones más marcados */
function lcSkewAngle(y, w, h) {
  const k = Math.max(1, Math.floor(w / 720)); const sw = Math.floor(w / k), sh = Math.floor(h / k);
  const s = new Float32Array(sw * sh);
  for (let r = 0; r < sh; r++) for (let x = 0; x < sw; x++) { let acc = 0; for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) acc += y[(r * k + dy) * w + x * k + dx]; s[r * sw + x] = acc / (k * k); }
  const I = integral(s, sw, sh); const rad = Math.max(5, Math.round(sw / 45)); let pts = [];
  for (let r = 0; r < sh; r++) for (let x = 0; x < sw; x++) { if (s[r * sw + x] < boxMean(I, sw, sh, x, r, rad) * 0.8) pts.push(x, r); }
  if (pts.length < 200) return 0;
  const step = Math.max(1, Math.floor(pts.length / 2 / 70000)); if (step > 1) { const q = []; for (let i = 0; i < pts.length; i += 2 * step) q.push(pts[i], pts[i + 1]); pts = q; }
  const off = Math.ceil(sw * 0.4) + 2; const bins = new Float32Array(sh + off * 2 + 8);
  const score = (deg) => {
    const a = (deg * Math.PI) / 180, sn = Math.sin(a), cs = Math.cos(a); bins.fill(0);
    for (let i = 0; i < pts.length; i += 2) bins[Math.round(-pts[i] * sn + pts[i + 1] * cs + off)]++;
    let t = 0; for (let i = 1; i < bins.length; i++) { const d = bins[i] - bins[i - 1]; t += d * d; } return t;
  };
  let best = 0, bs = -1; for (let a = -12; a <= 12.001; a += 1) { const v = score(a); if (v > bs) { bs = v; best = a; } }
  let lo = best - 1; for (let a = lo; a <= best + 1.001; a += 0.25) { const v = score(a); if (v > bs) { bs = v; best = a; } }
  const z = score(0); if (bs < z * 1.04) return 0; // sin mejora clara: se deja como está
  return Math.round(best * 100) / 100;
}
function lcBackdrop(g, src, W, H) {
  const t = document.createElement('canvas'); const r = (src.height || 1) / (src.width || 1); t.width = 24; t.height = Math.max(2, Math.round(24 * r));
  const tg = t.getContext('2d'); tg.imageSmoothingQuality = 'high'; tg.drawImage(src, 0, 0, t.width, t.height);
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(t, 0, 0, W, H);
}
function lcRotate(src, deg, fill) {
  const a = (deg * Math.PI) / 180, cs = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a)); const w = src.width, h = src.height;
  const W = Math.round(w * cs + h * sn), H = Math.round(w * sn + h * cs); const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true }); g.fillStyle = `rgb(${fill},${fill},${fill})`; g.fillRect(0, 0, W, H); lcBackdrop(g, src, W, H);
  g.translate(W / 2, H / 2); g.rotate(a); g.imageSmoothingQuality = 'high'; g.drawImage(src, -w / 2, -h / 2); return c;
}
function lcGrayOf(canvas) { const o = toGray(canvas); return { y: o.y, w: o.w, h: o.h }; }
function lcMinFilter(src, w, h) {
  const tmp = new Uint8ClampedArray(w * h), out = new Uint8ClampedArray(w * h);
  for (let r = 0; r < h; r++) for (let x = 0; x < w; x++) { let m = src[r * w + x]; if (x > 0) m = Math.min(m, src[r * w + x - 1]); if (x < w - 1) m = Math.min(m, src[r * w + x + 1]); tmp[r * w + x] = m; }
  for (let r = 0; r < h; r++) for (let x = 0; x < w; x++) { let m = tmp[r * w + x]; if (r > 0) m = Math.min(m, tmp[(r - 1) * w + x]); if (r < h - 1) m = Math.min(m, tmp[(r + 1) * w + x]); out[r * w + x] = m; }
  return out;
}
function lcBradley(sharp, w, h, factor, radMul) {
  const I = integral(sharp, w, h); const rad = Math.max(10, Math.round((Math.min(w, h) / 28) * radMul)); const out = new Uint8ClampedArray(w * h);
  for (let r = 0; r < h; r++) for (let x = 0; x < w; x++) { const j = r * w + x; out[j] = sharp[j] < boxMean(I, w, h, x, r, rad) * factor ? 0 : 255; } return out;
}
/* una sola pasada de remuestreo: gira y escala la foto original (menos borrosidad que girar una copia ya escalada) */
function lcRotateSrc(src, sw, sh, k, deg, fill) {
  const a = (deg * Math.PI) / 180, cs = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a)); const w = sw * k, h = sh * k;
  const W = Math.round(w * cs + h * sn), H = Math.round(w * sn + h * cs); const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true }); g.fillStyle = `rgb(${fill},${fill},${fill})`; g.fillRect(0, 0, W, H); lcBackdrop(g, src, W, H);
  g.translate(W / 2, H / 2); g.rotate(a); g.imageSmoothingQuality = 'high'; g.drawImage(src, -w / 2, -h / 2, w, h); return c;
}
const LC_MIN_ANGLE = 1.5;
/* foto → varias versiones listas para leer (se crean solo cuando hacen falta) */
async function lcPrepare(file) {
  const im = await lcLoadImage(file);
  const c0 = scanCanvas(im.src); const k = c0.width / im.width;
  let { y, w, h } = lcGrayOf(c0);
  // pizarrón oscuro (letras claras sobre fondo oscuro): se invierte
  const sample = []; for (let i = 0; i < y.length; i += 97) sample.push(y[i]); const med = lcMedian(sample); const inverted = med < 105;
  let base = c0, angle = 0;
  try {
    const yi = inverted ? y.map((v) => 255 - v) : y; const a = lcSkewAngle(yi, w, h);
    if (Math.abs(a) >= LC_MIN_ANGLE && Math.abs(a) <= 12) {
      const resid = (deg) => { const r = lcRotate(c0, deg, Math.round(med)); const g2 = lcGrayOf(r); const yy2 = inverted ? g2.y.map((v) => 255 - v) : g2.y; return Math.abs(lcSkewAngle(yy2, g2.w, g2.h)); };
      const ra = resid(-a), rb = resid(a); const pick = ra <= rb ? -a : a; if (Math.min(ra, rb) < Math.abs(a)) { angle = pick; base = lcRotateSrc(im.src, im.width, im.height, k, pick, Math.round(med)); }
    }
  } catch { /* si falla, se lee sin enderezar */ }
  im.free();
  const g1 = toGray(base); w = g1.w; h = g1.h; const yy = g1.y; if (inverted) for (let i = 0; i < yy.length; i++) yy[i] = 255 - yy[i];
  const I = integral(yy, w, h); const rad = Math.max(12, Math.round(Math.min(w, h) / 28));
  const flat = new Float32Array(w * h);
  for (let r = 0; r < h; r++) for (let x = 0; x < w; x++) { const m = boxMean(I, w, h, x, r, rad * 2); flat[r * w + x] = Math.min(255, (yy[r * w + x] / Math.max(1, m)) * 235); }
  const hist = new Uint32Array(256); for (const v of flat) hist[v | 0]++;
  let lo = 0, hi = 255, acc = 0; const N = w * h; for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc > N * 0.01) { lo = i; break; } } acc = 0; for (let i = 255; i >= 0; i--) { acc += hist[i]; if (acc > N * 0.04) { hi = i; break; } }
  const span = Math.max(30, hi - lo); const g8 = new Uint8ClampedArray(N); for (let j = 0; j < N; j++) g8[j] = Math.max(0, Math.min(255, ((flat[j] - lo) / span) * 255));
  const I2 = integral(g8, w, h); const sharp = new Uint8ClampedArray(N); const smooth = new Uint8ClampedArray(N);
  for (let r = 0; r < h; r++) for (let x = 0; x < w; x++) { const j = r * w + x; const m1 = boxMean(I2, w, h, x, r, 1); sharp[j] = g8[j] + 0.6 * (g8[j] - m1); smooth[j] = m1; }
  const cache = {};
  const mk = {
    gris: () => lcCanvas(sharp, w, h),
    bn: () => lcCanvas(lcBradley(smooth, w, h, 0.86, 1), w, h),
    bn2: () => lcCanvas(lcBradley(smooth, w, h, 0.93, 1.6), w, h),
    grueso: () => lcCanvas(lcMinFilter(smooth, w, h), w, h),
  };
  return { w, h, angle, inverted, variant: (name) => (cache[name] ||= mk[name]()) };
}

/* ---------- 2. Lectura en varias pasadas ---------- */
const LC_LANG_BEST = 'https://tessdata.projectnaptha.com/4.0.0_best';
async function lcWorker(onProgress) {
  if (LC.worker) return LC.worker;
  if (LC.workerLoading) return LC.workerLoading;
  const make = async (langPath) => {
    const opts = { logger: (m) => onProgress && onProgress(m) }; if (langPath) opts.langPath = langPath;
    const w = await window.Tesseract.createWorker('spa', 1, opts);
    try { await w.setParameters({ preserve_interword_spaces: '1', user_defined_dpi: '300', tessedit_do_invert: '0' }); } catch { /* */ }
    return w;
  };
  LC.workerLoading = (async () => { try { return await make(LC_LANG_BEST); } catch { return await make(null); } })();
  try { LC.worker = await LC.workerLoading; } finally { LC.workerLoading = null; }
  return LC.worker;
}
/* líneas y palabras de un resultado de Tesseract (distintas versiones lo entregan distinto) */
function lcLinesOf(data) {
  let lines = data.lines;
  if (!lines || !lines.length) { lines = []; for (const b of data.blocks || []) for (const p of b.paragraphs || []) for (const l of p.lines || []) lines.push(l); }
  const out = [];
  for (const l of lines) {
    const ws = (l.words || []).filter((w) => (w.text || '').trim()).map((w) => ({ t: String(w.text).trim(), c: Math.max(0, Math.min(100, +w.confidence || 0)), b: { x0: w.bbox.x0, y0: w.bbox.y0, x1: w.bbox.x1, y1: w.bbox.y1 } }));
    if (ws.length) out.push({ words: ws });
  }
  if (!out.length && data.words && data.words.length) { // sin líneas: se agrupan por altura
    const ws = data.words.filter((w) => (w.text || '').trim()).map((w) => ({ t: String(w.text).trim(), c: Math.max(0, Math.min(100, +w.confidence || 0)), b: { ...w.bbox } })).sort((a, b) => a.b.y0 - b.b.y0);
    let cur = null; for (const w of ws) { const cy = (w.b.y0 + w.b.y1) / 2; if (cur && cy < cur.y1 + 2 && cy > cur.y0 - 2) { cur.words.push(w); cur.y1 = Math.max(cur.y1, w.b.y1); } else { cur = { words: [w], y0: w.b.y0, y1: w.b.y1 }; out.push(cur); } }
    out.forEach((l) => l.words.sort((a, b) => a.b.x0 - b.b.x0));
  }
  for (const l of out) l.b = { x0: Math.min(...l.words.map((w) => w.b.x0)), y0: Math.min(...l.words.map((w) => w.b.y0)), x1: Math.max(...l.words.map((w) => w.b.x1)), y1: Math.max(...l.words.map((w) => w.b.y1)) };
  return out.sort((a, b) => a.b.y0 - b.b.y0);
}
const lcMeanConf = (lines) => { let s = 0, n = 0; for (const l of lines) for (const w of l.words) { const k = Math.max(1, w.t.length); s += w.c * k; n += k; } return n ? s / n : 0; };
const lcIoU = (a, b) => { const ix = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)), iy = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)); const i = ix * iy; const u = (a.x1 - a.x0) * (a.y1 - a.y0) + (b.x1 - b.x0) * (b.y1 - b.y0) - i; return u > 0 ? i / u : 0; };
/* vocabulario que se prefiere cuando dos lecturas empatan */
function lcLexicon() {
  const set = new Set(); try { for (const w of SCAN_WORDS) set.add(lcNorm(w)); for (const s of S.subjects || []) for (const w of normChars(s.name).split(/\s+/)) if (w.length >= 3) set.add(lcNorm(w)); } catch { /* */ }
  return set;
}
/* votación palabra por palabra entre las pasadas */
function lcMerge(passes, lex) {
  if (!passes.length) return [];
  let bi = 0; passes.forEach((p, i) => { if (lcMeanConf(p) > lcMeanConf(passes[bi])) bi = i; });
  const base = passes[bi]; const others = passes.filter((_, i) => i !== bi);
  const flatOthers = others.map((p) => p.flatMap((l) => l.words));
  const out = base.map((l) => ({ b: l.b, words: l.words.map((w) => {
    const cands = [{ t: w.t, c: w.c }];
    for (const fo of flatOthers) { let bestW = null, bi2 = 0.45; for (const o of fo) { const iou = lcIoU(w.b, o.b); if (iou > bi2) { bi2 = iou; bestW = o; } } if (bestW) cands.push({ t: bestW.t, c: bestW.c }); }
    const groups = new Map();
    for (const c of cands) { const key = lcNorm(c.t) || c.t; const g = groups.get(key) || { n: 0, sum: 0, max: -1, t: c.t, tc: -1, texts: new Set() }; g.n++; g.sum += c.c; g.texts.add(c.t); if (c.c > g.max) { g.max = c.c; } if (c.c > g.tc) { g.tc = c.c; g.t = c.t; } groups.set(key, g); }
    let best = null, bs = -1;
    for (const [key, g] of groups) { const sc = g.sum + 8 * (g.n - 1) + (lex.has(key) ? 14 : 0) + (/[0-9]/.test(key) && /[a-zñ]/.test(key) ? -12 : 0); if (sc > bs) { bs = sc; best = g; } }
    const alts = [...new Set(cands.map((c) => c.t))].filter((t) => t !== best.t);
    const conf = Math.min(100, best.max + 5 * (best.n - 1));
    return { t: best.t, c: conf, b: w.b, alts, n: best.n };
  }) }));
  return out;
}
/* ¿hay que revisar esta palabra? (los números y fechas se vigilan más) */
function lcDoubtful(w) {
  const t = w.t; const hasDigit = /\d/.test(t), hasLetter = /[A-Za-zÁÉÍÓÚÑáéíóúñü]/.test(t);
  if (hasDigit && w.c < 92) return true;
  if (hasDigit && hasLetter && !/^\d+(º|°|ª|a|o|er|do|to|vo)?$/i.test(t) && !/^[a-z]\d$/i.test(t)) return true;
  if (w.c < 80) return true;
  if (t.length === 1 && /[^A-Za-zÁÉÍÓÚÑáéíóúñ\d.,;:¿?¡!()"'%+\-–—=\/]/.test(t)) return true;
  if (w.n === 1 && w.alts && w.alts.length && w.c < 90) return true; // las versiones no coinciden
  return false;
}
function lcSuggest(word, alts, lines) {
  const out = []; const seen = new Set([word]); const add = (t) => { if (t && !seen.has(t)) { seen.add(t); out.push(t); } };
  (alts || []).forEach(add);
  const n = lcNorm(word); if (n.length >= 4) {
    const dict = new Map(); try { for (const w of SCAN_WORDS) dict.set(lcNorm(w), w); for (const s of S.subjects || []) for (const w of s.name.split(/\s+/)) if (w.length >= 4) dict.set(lcNorm(w), w); } catch { /* */ }
    for (const l of lines || []) for (const w of l.words) if (w.c >= 90 && w.t.length >= 4) dict.set(lcNorm(w.t), w.t);
    const max = n.length >= 9 ? 2 : n.length >= 6 ? 1 : 1; const found = [];
    for (const [k, v] of dict) { if (Math.abs(k.length - n.length) > max) continue; const d = lev(n, k, max); if (d <= max && k !== n) found.push([d, v]); }
    found.sort((a, b) => a[0] - b[0]); found.slice(0, 4).forEach(([, v]) => add(keepCase(word, v)));
  }
  return out.slice(0, 6);
}
function lcLinesToText(lines) {
  const hs = lines.map((l) => l.b.y1 - l.b.y0); const mh = lcMedian(hs) || 20; let t = '';
  lines.forEach((l, i) => { if (i) { const gap = l.b.y0 - lines[i - 1].b.y1; t += gap > mh * 1.7 ? '\n\n' : '\n'; } t += l.words.map((w) => w.t).join(' '); });
  return t;
}
/* limpieza por renglón con las reglas de siempre (fechas, números, vocabulario) sin perder la posición de cada palabra */
function lcCleanLines(lines) {
  for (const l of lines) {
    const raw = l.words.map((w) => w.t).join(' '); let fixed = raw; try { fixed = fixOCR(raw); } catch { /* */ }
    const toks = fixed.split(/\s+/).filter(Boolean);
    if (toks.length === l.words.length) toks.forEach((t, i) => { if (t !== l.words[i].t) { l.words[i].was = l.words[i].t; l.words[i].t = t; } });
  }
  return lines;
}
/* lee la foto: pasadas hasta que la seguridad sea alta o se acabe el tiempo */
async function lcRead(file) {
  const t0 = performance.now();
  setScanProgress('Preparando la foto…', 0.03);
  const prep = await lcPrepare(file);
  setScanProgress('Cargando el lector…', 0.08);
  await loadTesseract();
  let pass = 0; let total = 3;
  const worker = await lcWorker((m) => {
    if (m.status === 'recognizing text') setScanProgress(`Leyendo la foto… (pasada ${pass + 1})`, 0.12 + (pass + (m.progress || 0)) * (0.8 / total));
    else if (/load|initializ/.test(m.status || '')) setScanProgress('Cargando el lector (solo la primera vez)…', 0.08 + (m.progress || 0) * 0.04);
  });
  const plan = [['grueso', '3'], ['gris', '6'], ['grueso', '4'], ['bn', '6']];
  const results = []; const lex = lcLexicon(); let merged = [];
  for (; pass < plan.length; pass++) {
    const [v, psm] = plan[pass];
    try { await worker.setParameters({ tessedit_pageseg_mode: psm }); } catch { /* */ }
    let data; try { data = (await worker.recognize(prep.variant(v), {}, { blocks: true, text: true, tsv: true })).data; } catch (e) { if (!results.length) throw e; continue; }
    const lines = lcLinesOf(data); if (lines.length) results.push(lines);
    if (!results.length) { if (pass >= 1) break; continue; }
    merged = lcMerge(results, lex);
    const all = merged.flatMap((l) => l.words); const low = all.filter(lcDoubtful).length; const mean = lcMeanConf(merged);
    total = Math.min(plan.length, Math.max(pass + 1, 2));
    if (mean >= 95 && low <= Math.max(1, all.length * 0.02)) { pass++; break; }
    if (performance.now() - t0 > 80000) { pass++; break; }
  }
  if (!merged.length) return { text: '', lines: [], conf: 0, base: null };
  setScanProgress('Revisando y corrigiendo…', 0.95);
  lcCleanLines(merged);
  const conf = Math.round(lcMeanConf(merged)); LC.passes = results.length;
  return { text: lcLinesToText(merged), lines: merged, conf, base: prep.variant('gris'), prep: { angle: prep.angle, inverted: prep.inverted } };
}
readPhoto = async function (file) {
  const r = await lcRead(file);
  SCAN.conf = r.conf; SCAN.lines = r.lines; SCAN.base = r.base; SCAN.autoText = r.text; SCAN.prep = r.prep; SCAN.reviewed = false;
  return r.text;
};

/* ---------- 3. Revisión guiada de palabras dudosas ---------- */
function lcDoubts() { const out = []; (SCAN.lines || []).forEach((l, li) => l.words.forEach((w, wi) => { if (!w.ok && lcDoubtful(w)) out.push({ li, wi }); })); return out; }
function lcRvPaint() {
  const rv = LC.rv; if (!rv) return; const cur = rv.list[rv.i]; const line = SCAN.lines[cur.li]; const w = line.words[cur.wi];
  const cnt = document.getElementById('lcRvCount'); if (cnt) cnt.textContent = `Palabra ${rv.i + 1} de ${rv.list.length}`;
  const inp = document.getElementById('lcRvIn'); if (inp) { inp.value = w.t; setTimeout(() => { inp.focus(); inp.select(); }, 30); }
  const sug = document.getElementById('lcRvSug'); if (sug) sug.innerHTML = lcSuggest(w.t, w.alts, SCAN.lines).map((s) => `<button type="button" class="chip lc-sug" data-act="lc-rv-sug" data-v="${esc(s)}">${esc(s)}</button>`).join('');
  const cv = document.getElementById('lcRvCrop'); if (!cv || !SCAN.base) return;
  const pad = Math.round((line.b.y1 - line.b.y0) * 0.9) + 10; const x0 = Math.max(0, line.b.x0 - pad), y0 = Math.max(0, line.b.y0 - pad), x1 = Math.min(SCAN.base.width, line.b.x1 + pad), y1 = Math.min(SCAN.base.height, line.b.y1 + pad);
  const sw = x1 - x0, sh = y1 - y0; const css = Math.min(cv.parentElement.clientWidth || 320, 560); const k = Math.min(css / sw, 90 / sh * 3, 3); const dpr = Math.min(2, devicePixelRatio || 1);
  cv.style.width = Math.round(sw * k) + 'px'; cv.style.height = Math.round(sh * k) + 'px'; cv.width = Math.round(sw * k * dpr); cv.height = Math.round(sh * k * dpr);
  const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(SCAN.base, x0, y0, sw, sh, 0, 0, cv.width, cv.height);
  const f = (cv.width / sw); const bx = (w.b.x0 - x0) * f, by = (w.b.y0 - y0) * f, bw = (w.b.x1 - w.b.x0) * f, bh = (w.b.y1 - w.b.y0) * f;
  g.fillStyle = 'rgba(255,196,60,.28)'; g.fillRect(bx - 3, by - 3, bw + 6, bh + 6); g.strokeStyle = '#D98A00'; g.lineWidth = 2 * dpr; g.strokeRect(bx - 3, by - 3, bw + 6, bh + 6);
}
function lcRvOpen() {
  const list = lcDoubts(); if (!list.length) { toast('No hay palabras dudosas. ¡Todo se leyó con seguridad!'); return; }
  LC.rv = { list, i: 0 };
  openSheet(`${sheetHead('Revisar lo que leí')}<div class="sheet-body">
    <p class="small muted" id="lcRvCount" style="margin:0 0 8px"></p>
    <div class="lc-cropbox"><canvas id="lcRvCrop" class="lc-crop"></canvas></div>
    <div class="field" style="margin-top:12px"><label for="lcRvIn">Lo que dice la foto</label><input id="lcRvIn" class="input" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
    <div id="lcRvSug" class="lc-sugs"></div>
    <p class="tiny faint" style="margin:8px 0 0">La palabra marcada en amarillo es la que tengo duda. Escribe como la ves en la foto.</p></div>
    <div class="sheet-foot"><button class="btn" data-act="lc-rv-prev">Anterior</button><span class="grow"></span><button class="btn" data-act="lc-rv-ok">Está bien</button><button class="btn primary" data-act="lc-rv-save">Guardar y seguir</button></div>`);
  setTimeout(() => { lcRvPaint(); document.getElementById('lcRvIn')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); VIDA_ACTS['lc-rv-save'](); } }); }, 60);
}
function lcRvStep(d) {
  const rv = LC.rv; if (!rv) return; rv.i += d;
  if (rv.i >= rv.list.length) { lcRvFinish(); return; } if (rv.i < 0) rv.i = 0;
  lcRvPaint();
}
function lcApplyText(oldText, line, word, oldWord, newWord) {
  const lineOld = line.words.map((w) => (w === word ? oldWord : w.t)).join(' '); const lineNew = line.words.map((w) => w.t).join(' ');
  if (oldText.includes(lineOld)) return oldText.replace(lineOld, lineNew);
  const re = new RegExp(`(^|[^A-Za-zÁÉÍÓÚÑáéíóúñü0-9])${oldWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-zÁÉÍÓÚÑáéíóúñü0-9])`);
  return re.test(oldText) ? oldText.replace(re, (m, p) => p + newWord) : oldText;
}
function lcRvFinish() {
  const ta = document.getElementById('scanText'); const edited = ta && ta.value !== SCAN.autoText;
  const hs = SCAN.lines.map((l) => l.b.y1 - l.b.y0); void hs;
  let text = edited ? ta.value : lcLinesToText(SCAN.lines);
  if (edited && LC.rv?.changes) for (const c of LC.rv.changes) text = lcApplyText(text, c.line, c.word, c.old, c.word.t);
  SCAN.text = text; SCAN.autoText = edited ? SCAN.autoText : text; SCAN.reviewed = true;
  const n = LC.rv?.changes?.length || 0; LC.rv = null; closeSheet(false);
  if (SCAN.mode === 'tasks') SCAN.items = extractTasks(SCAN.text); else if (SCAN.mode === 'solve') SCAN.solved = solveText(SCAN.text);
  render(); toast(n ? `Revisión lista: ${plural(n, 'corrección', 'correcciones')}.` : 'Revisión lista: todo estaba bien.');
}
Object.assign(VIDA_ACTS, {
  'lc-review': () => lcRvOpen(),
  'lc-rv-sug': (el) => { const i = document.getElementById('lcRvIn'); if (i) { i.value = el.dataset.v; i.focus(); } },
  'lc-rv-ok': () => { const rv = LC.rv; if (!rv) return; const cur = rv.list[rv.i]; SCAN.lines[cur.li].words[cur.wi].ok = true; lcRvStep(1); },
  'lc-rv-save': () => {
    const rv = LC.rv; if (!rv) return; const cur = rv.list[rv.i]; const line = SCAN.lines[cur.li]; const w = line.words[cur.wi];
    const v = (document.getElementById('lcRvIn')?.value || '').trim();
    if (v && v !== w.t) { (rv.changes ||= []).push({ line, word: w, old: w.t }); w.t = v; }
    w.ok = true; w.c = 100; lcRvStep(1);
  },
  'lc-rv-prev': () => lcRvStep(-1),
  'lc-save': async (el) => {
    const sid = document.getElementById('lcSubj')?.value || '_gen'; const text = (document.getElementById('scanText')?.value || SCAN.text || '').trim(); if (!text) return;
    el.disabled = true; const now = Date.now(); const subjectId = lbSid(sid); const pages = [];
    const first = text.split('\n').map((l) => l.trim()).find((l) => l.length > 2) || '';
    const title = (first.length > 56 ? first.slice(0, 54) + '…' : first) || `Escaneo del ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
    pages.push({ id: 'pg' + uid(), kind: 'nota', subjectId, title, text, items: [], img: [], tone: 'papel', sticker: '', at: now, updated: now });
    if (document.getElementById('lcWTasks')?.checked && SCAN.items?.length) pages.push({ id: 'pg' + uid(), kind: 'lista', subjectId, title: 'Pendientes del escaneo', text: '', items: SCAN.items.map((it) => ({ t: it.title + (it.due ? ` · ${cap(relDay(it.due))}` : ''), done: false })), img: [], tone: 'papel', sticker: '', at: now + 1, updated: now + 1 });
    if (document.getElementById('lcWPhoto')?.checked && SCAN.file) {
      try { const d = await fileToDataURL(SCAN.file, 1400, 0.74); const iid = await ufPut(d); pages.push({ id: 'pg' + uid(), kind: 'foto', subjectId, title: 'Foto original', text: '', items: [], img: [iid], frame: LB.frame, filter: LB.filter, tone: 'papel', sticker: '', at: now + 2, updated: now + 2 }); } catch { toast('No se pudo guardar la foto; el texto sí se guardó.'); }
    }
    commit((s) => { s.pages ||= []; pages.forEach((p) => s.pages.push(p)); });
    el.disabled = false; Snd.drop(); const name = lbSubjects().find((s) => s.id === sid)?.name || 'General';
    toast(`Guardado en la libreta de ${name}.`, { action: 'Abrir', onAction: () => { location.hash = `#/libretas/${sid}`; } });
  },
});

/* ---------- 4. Pantalla: botón de libreta, aviso de revisión y tarjeta para guardar ---------- */
{
  const baseView = viewEscanear;
  viewEscanear = function () {
    let h = baseView();
    h = h.replace('<label class="btn" for="scanSolve">', `<label class="btn" for="scanLibreta">${icon('book')}Pasar a libreta</label><input id="scanLibreta" type="file" accept="image/*" capture="environment" class="sr" data-scan="libreta">\n      <label class="btn" for="scanSolve">`);
    h = h.replace('<textarea class="input" id="scanText"', '<textarea class="input" id="scanText" lang="es" spellcheck="true" autocorrect="on" autocapitalize="sentences"');
    let extra = '';
    if (!SCAN.busy && SCAN.text && SCAN.conf != null && SCAN.conf < 80) extra += `<div class="banner warn">${icon('bell')}<p><b>Lectura poco segura (${SCAN.conf}%).</b> Si es letra a mano o la foto está oscura, puede haber errores: toma otra foto de frente y con buena luz, o usa «Pegar texto copiado» (en iPhone/iPad mantén presionado el texto de la foto y toca Copiar). Revisa siempre el texto antes de usarlo.</p></div>`;
    if (!SCAN.busy) extra += `<div class="card"><h3 class="serif" style="margin:0 0 4px">Pegar texto copiado</h3><p class="small muted" style="margin:0 0 10px">Lectura exacta en iPhone/iPad: abre la foto, mantén presionado el texto, toca Copiar y pégalo aquí. La app lo analiza igual.</p><button class="btn block" data-act="scan-paste">${icon('copy')}Pegar y analizar</button></div>`;
    if (!SCAN.busy && SCAN.text) {
      const doubts = SCAN.lines ? lcDoubts().length : 0;
      if (SCAN.lines) {
        extra += doubts
          ? `<div class="card lc-review"><h3 class="serif" style="margin:0 0 4px">${plural(doubts, 'palabra dudosa', 'palabras dudosas')}</h3><p class="small muted" style="margin:0 0 10px">Seguridad de lectura: ${SCAN.conf}%. Revísalas una por una con el recorte de la foto: así no se cuela ningún error.</p><button class="btn primary block" data-act="lc-review">${icon('search')}Revisar ahora</button></div>`
          : `<div class="card lc-review ok"><p class="small" style="margin:0"><b>Seguridad de lectura: ${SCAN.conf}%.</b> ${SCAN.reviewed ? 'Ya revisaste todas las palabras dudosas.' : 'No encontré palabras dudosas.'} ${SCAN.prep?.angle ? `Enderecé la foto ${Math.abs(SCAN.prep.angle).toFixed(1)}°. ` : ''}${SCAN.prep?.inverted ? 'Era un pizarrón oscuro: lo invertí para leerlo mejor.' : ''}</p></div>`;
      }
      const guess = (SCAN.items && SCAN.items.find((i) => i.subjectId)?.subjectId) || (typeof parseQuick === 'function' ? parseQuick(SCAN.text.slice(0, 200)).subjectId : null) || '_gen';
      extra += `<div class="card lc-save"><h3 class="serif" style="margin:0 0 4px">Guardar en una libreta</h3><p class="small muted" style="margin:0 0 10px">Archiva el texto (y la foto) en la hoja de la materia, sin volver a escribirlo.</p>
        <div class="field"><label for="lcSubj">Materia</label><select id="lcSubj" class="input">${lbSubjects().map((s) => `<option value="${s.id}" ${s.id === guess ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
        <label class="lc-chk"><input type="checkbox" id="lcWPhoto" checked> Incluir la foto original</label>
        ${SCAN.items && SCAN.items.length ? '<label class="lc-chk"><input type="checkbox" id="lcWTasks" checked> Incluir las tareas encontradas como lista</label>' : ''}
        <button class="btn primary block" data-act="lc-save" style="margin-top:10px">${icon('save')}Guardar en la libreta</button></div>`;
    }
    if (!SCAN.busy && (SCAN.text || SCAN.items || SCAN.solved)) extra += `<button class="btn block" data-act="scan-clear" style="margin:0 0 14px">${icon('trash')}Descartar este escaneo</button>`;
    h = h.replace('<h2 class="sec">Pendientes de fotos', extra + '<h2 class="sec">Pendientes de fotos');
    const photo = S.tasks.filter((t) => t.source === 'foto' && !t.done);
    if (photo.length) {
      h = h.replace(/<ul class="tasks">[\s\S]*?<\/ul>/, () => `<ul class="tasks">${photo.sort(sortPending).map((t) => `${taskRow(t)}<li class="lc-del"><button class="btn danger" data-act="scan-del" data-id="${t.id}" aria-label="Borrar ${esc(t.title)}">${icon('trash')}Borrar esta</button></li>`).join('')}</ul>
        <button class="btn danger block" data-act="scan-del-all" style="margin-top:10px">${icon('trash')}Borrar todas las de fotos</button>`);
    }
    return h;
  };
}
{
  const baseAnalyze = analyzeScan;
  analyzeScan = function (mode) { if (mode === 'libreta') { SCAN.mode = mode; SCAN.items = null; SCAN.solved = null; return; } return baseAnalyze(mode); };
}

Object.assign(VIDA_ACTS, {
  'scan-clear': () => { SCAN.text = ''; SCAN.items = null; SCAN.solved = null; SCAN.lines = null; SCAN.error = ''; SCAN.mode = null; SCAN.reviewed = false; render(); toast('Escaneo descartado.'); },
  'scan-del': (el) => { if (typeof deleteTask === 'function') deleteTask(el.dataset.id); },
  'scan-del-all': async () => {
    const list = S.tasks.filter((t) => t.source === 'foto' && !t.done);
    if (!list.length) return;
    if (!(await ask({ title: 'Borrar tareas de fotos', text: `Se borrarán ${plural(list.length, 'tarea', 'tareas')} sacadas de fotos.`, ok: 'Borrar', danger: true }))) return;
    const ids = new Set(list.map((t) => t.id));
    const keep = list.map((t) => ({ t, i: S.tasks.indexOf(t) }));
    commit((s) => { s.tasks = s.tasks.filter((t) => !ids.has(t.id)); });
    toast(`${plural(list.length, 'tarea borrada', 'tareas borradas')}.`, { action: 'Deshacer', onAction: () => commit((s) => { keep.forEach((k) => s.tasks.push(k.t)); }) });
  },
});

Object.assign(VIDA_ACTS, {
  'scan-paste': async () => {
    let t = '';
    try { t = await navigator.clipboard.readText(); } catch (e) { t = (prompt && window.prompt('Pega aquí el texto copiado:')) || ''; }
    t = (t || '').trim();
    if (!t) { toast('No hay texto copiado para pegar.'); return; }
    SCAN.text = t.slice(0, 20000); SCAN.autoText = SCAN.text; SCAN.lines = null; SCAN.conf = null; SCAN.error = ''; SCAN.reviewed = false;
    analyzeScan(SCAN.mode === 'solve' ? 'solve' : 'tasks'); render();
  },
});
