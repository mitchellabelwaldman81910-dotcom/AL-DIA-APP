/* Cinnavia 7.26 — Cámara guiada para escanear: detecta la hoja, libreta o pizarrón en vivo, te dice cómo alinearla,
   suena como un escáner real cuando está bien encuadrada, toma la foto sola y la endereza antes de leerla. Todo en el teléfono. */
'use strict';
const CAM = { on: false, stream: null, timer: 0, mode: 'tasks', sound: true, auto: true, st: null, good: 0, last: null, prevGrid: null, lastStatus: '', lastBad: 0, torch: false, busy: false, ctx: null };

/* ---------- Visión: encuentra la hoja y mide qué tan bien está ---------- */
function camOtsu(g) {
  const h = new Uint32Array(256); for (let i = 0; i < g.length; i++) h[g[i]]++;
  let sum = 0; for (let i = 0; i < 256; i++) sum += i * h[i]; let wB = 0, sB = 0, best = 0, th = 127; const n = g.length;
  for (let t = 0; t < 256; t++) { wB += h[t]; if (!wB) continue; const wF = n - wB; if (!wF) break; sB += t * h[t]; const mB = sB / wB, mF = (sum - sB) / wF, v = wB * wF * (mB - mF) * (mB - mF); if (v > best) { best = v; th = t; } }
  return th;
}
function camComp(mask, w, h) {
  const lab = new Int32Array(w * h).fill(0); const stack = new Int32Array(w * h); let best = null, id = 0;
  for (let s = 0; s < w * h; s++) {
    if (!mask[s] || lab[s]) continue; id++; let sp = 0; stack[sp++] = s; lab[s] = id; let area = 0, tl = [1e9, 0, 0], br = [-1e9, 0, 0], tr = [-1e9, 0, 0], bl = [1e9, 0, 0], top = 0, bot = 0, lef = 0, rig = 0;
    while (sp) {
      const p = stack[--sp]; const x = p % w, y = (p / w) | 0; area++;
      const a = x + y, b = x - y; if (a < tl[0]) tl = [a, x, y]; if (a > br[0]) br = [a, x, y]; if (b > tr[0]) tr = [b, x, y]; if (b < bl[0]) bl = [b, x, y];
      if (y === 0) top++; if (y === h - 1) bot++; if (x === 0) lef++; if (x === w - 1) rig++;
      if (x > 0 && mask[p - 1] && !lab[p - 1]) { lab[p - 1] = id; stack[sp++] = p - 1; } if (x < w - 1 && mask[p + 1] && !lab[p + 1]) { lab[p + 1] = id; stack[sp++] = p + 1; }
      if (y > 0 && mask[p - w] && !lab[p - w]) { lab[p - w] = id; stack[sp++] = p - w; } if (y < h - 1 && mask[p + w] && !lab[p + w]) { lab[p + w] = id; stack[sp++] = p + w; }
    }
    if (!best || area > best.area) best = { area, id, q: [[tl[1], tl[2]], [tr[1], tr[2]], [br[1], br[2]], [bl[1], bl[2]]], touch: { top: top / w, bot: bot / w, lef: lef / h, rig: rig / h } };
  }
  if (best) best.lab = lab; return best;
}
const camPolyArea = (q) => { let a = 0; for (let i = 0; i < 4; i++) { const [x1, y1] = q[i], [x2, y2] = q[(i + 1) % 4]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; };
const camDist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
function camMorph(mask, w, h, r) { // cierra los huecos que deja la letra dentro de la hoja
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) { let run = 0; for (let x = 0; x < w; x++) { run = mask[y * w + x] ? r : Math.max(0, run - 1); tmp[y * w + x] = run > 0 ? 1 : 0; } run = 0; for (let x = w - 1; x >= 0; x--) { run = mask[y * w + x] ? r : Math.max(0, run - 1); if (run > 0) tmp[y * w + x] = 1; } }
  for (let x = 0; x < w; x++) { let run = 0; for (let y = 0; y < h; y++) { run = tmp[y * w + x] ? r : Math.max(0, run - 1); out[y * w + x] = run > 0 ? 1 : 0; } run = 0; for (let y = h - 1; y >= 0; y--) { run = tmp[y * w + x] ? r : Math.max(0, run - 1); if (run > 0) out[y * w + x] = 1; } }
  return out;
}
/* data: ImageData (≈256 de ancho). prevGrid: rejilla del cuadro anterior para medir movimiento */
function camAnalyze(data, prevGrid) {
  const w = data.width, h = data.height, px = data.data; const g = new Uint8Array(w * h);
  for (let i = 0, p = 0; i < g.length; i++, p += 4) g[i] = (px[p] * 77 + px[p + 1] * 150 + px[p + 2] * 29) >> 8;
  const res = { w, h, found: false, issues: [], good: false, grid: null };
  // movimiento
  const gw = 24, gh = 18, grid = new Float32Array(gw * gh); for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) { let s = 0, c = 0; for (let yy = (y * h / gh) | 0; yy < ((y + 1) * h / gh) | 0; yy += 2) for (let xx = (x * w / gw) | 0; xx < ((x + 1) * w / gw) | 0; xx += 2) { s += g[yy * w + xx]; c++; } grid[y * gw + x] = s / (c || 1); }
  res.grid = grid; if (prevGrid) { let d = 0; for (let i = 0; i < grid.length; i++) d += Math.abs(grid[i] - prevGrid[i]); res.motion = d / grid.length; } else res.motion = 0;
  // luz y contraste globales
  const hist = new Uint32Array(256); for (let i = 0; i < g.length; i++) hist[g[i]]++; const pct = (f) => { let a = 0; const t = g.length * f; for (let i = 0; i < 256; i++) { a += hist[i]; if (a >= t) return i; } return 255; };
  const p05 = pct(0.05), p95 = pct(0.95), med = pct(0.5); res.light = med; res.contrast = p95 - p05;
  const th = camOtsu(g); const bright = new Uint8Array(w * h), dark = new Uint8Array(w * h); for (let i = 0; i < g.length; i++) { bright[i] = g[i] > th ? 1 : 0; dark[i] = g[i] <= th ? 1 : 0; }
  const cands = [];
  for (const [name, m] of [['hoja', bright], ['pizarrón', dark]]) {
    const c = camComp(camMorph(m, w, h, 3), w, h); if (!c || c.area < w * h * 0.02) continue; const qa = camPolyArea(c.q); const solid = qa ? c.area / qa : 0; cands.push({ ...c, name, qa, solid, whole: qa > w * h * 0.9, score: solid * Math.min(1, 0.3 + (qa / (w * h)) * 3) });
  }
  if (!cands.length) { res.issues.push('none'); return res; }
  cands.sort((a, b) => (a.whole - b.whole) || b.score - a.score); const c = cands[0]; if (c.solid < 0.72) { res.issues.push('none'); return res; }
  res.found = true; res.kind = c.name; res.q = c.q; const [tl, tr, br, bl] = c.q; res.cover = c.qa / (w * h); { const bw = Math.max(c.q[1][0], c.q[2][0]) - Math.min(c.q[0][0], c.q[3][0]), bh = Math.max(c.q[2][1], c.q[3][1]) - Math.min(c.q[0][1], c.q[1][1]); res.fill = Math.max(bw / w, bh / h); }
  { const bx0 = Math.max(0, Math.min(tl[0], bl[0])), bx1 = Math.min(w, Math.max(tr[0], br[0])), by0 = Math.max(0, Math.min(tl[1], tr[1])), by1 = Math.min(h, Math.max(bl[1], br[1])); const hh = new Uint32Array(256); let n = 0; for (let y = by0; y < by1; y += 2) for (let x = bx0; x < bx1; x += 2) { hh[g[y * w + x]]++; n++; } if (n > 50) { const pc = (f) => { let a = 0; const t = n * f; for (let i = 0; i < 256; i++) { a += hh[i]; if (a >= t) return i; } return 255; }; res.light = pc(0.5); res.contrast = pc(0.97) - pc(0.03); res.paper = pc(0.85); } }
  const m = 2; res.touch = c.q.some(([x, y]) => x <= m || y <= m || x >= w - 1 - m || y >= h - 1 - m) || c.touch.top > 0.15 || c.touch.bot > 0.15 || c.touch.lef > 0.15 || c.touch.rig > 0.15;
  const ang = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI; const t1 = ang(tl, tr), t2 = ang(bl, br); res.tilt = (t1 + t2) / 2;
  const v1 = ang(tl, bl) - 90, v2 = ang(tr, br) - 90; res.vtilt = (v1 + v2) / 2;
  const lt = camDist(tl, tr), lb = camDist(bl, br), ll = camDist(tl, bl), lr = camDist(tr, br); res.persp = Math.max(Math.abs(lt - lb) / Math.max(lt, lb), Math.abs(ll - lr) / Math.max(ll, lr));
  // nitidez: fuerza de bordes respecto al contraste, dentro de la hoja
  const x0 = Math.max(1, Math.min(tl[0], bl[0]) + 4), x1 = Math.min(w - 2, Math.max(tr[0], br[0]) - 4), y0 = Math.max(1, Math.min(tl[1], tr[1]) + 4), y1 = Math.min(h - 2, Math.max(bl[1], br[1]) - 4);
  const mags = []; for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) { const gx = g[y * w + x + 1] - g[y * w + x - 1], gy = g[(y + 1) * w + x] - g[(y - 1) * w + x]; const mg = Math.abs(gx) + Math.abs(gy); if (mg > 12) mags.push(mg); }
  if (mags.length > 40) { mags.sort((a, b) => a - b); const top = mags.slice(Math.floor(mags.length * 0.9)); res.sharp = top.reduce((a, b) => a + b, 0) / top.length / Math.max(30, res.contrast); res.hasText = mags.length > (x1 - x0) * (y1 - y0) * 0.004; } else { res.sharp = 0; res.hasText = false; }
  // renglones detectados (para marcarlos)
  const lines = []; if (x1 - x0 > 20 && y1 - y0 > 20) {
    const rows = new Float32Array(y1 - y0); for (let y = y0; y < y1; y++) { let s = 0; for (let x = x0; x < x1; x += 1) { const v = g[y * w + x]; if (v < med - 28) s++; } rows[y - y0] = s / (x1 - x0); }
    const mx = Math.max(...rows); if (mx > 0.015) { let on = false, st = 0; for (let i = 0; i <= rows.length; i++) { const hi = i < rows.length && rows[i] > mx * 0.25; if (hi && !on) { on = true; st = i; } else if (!hi && on) { on = false; if (i - st >= 2) lines.push([y0 + st, y0 + i]); } } }
  }
  res.lines = lines.slice(0, 40); res.box = [x0, y0, x1, y1];
  // problemas por orden de importancia
  const I = res.issues;
  if (res.touch && res.fill > 0.8) I.push('lejos'); else if (res.fill < 0.58) I.push('cerca'); else if (res.fill > 0.985) I.push('lejos');
  if (Math.abs(res.tilt) > 5 || Math.abs(res.vtilt) > 6) I.push('tilt'); if (res.persp > 0.14) I.push('persp');
  if ((res.paper || res.light) < 90 || res.contrast < 50) I.push('luz'); else if (res.light > 245) I.push('exceso');
  if (res.motion > 7) I.push('mueve');
  res.good = I.length === 0 && res.hasText !== false; return res;
}
const CAM_MSG = {
  none: ['Apunta a la hoja, libreta o pizarrón', 'warn'], lejos: ['Aleja un poco: que se vea toda la hoja', 'warn'], cerca: ['Acércate más a la hoja', 'warn'], tilt: ['Endereza: alinea la cámara con el borde de la hoja', 'warn'],
  persp: ['Ponte de frente a la hoja, sin inclinar el teléfono', 'warn'], luz: ['Falta luz o contraste', 'bad'], exceso: ['Hay demasiado brillo o reflejo', 'warn'], foco: ['Enfocando… espera un momento', 'warn'], mueve: ['Mantén firme el teléfono', 'warn'], ok: ['¡Perfecto! No te muevas', 'ok'],
};

/* nitidez medida en la hoja a mayor resolución (la letra borrosa se nota ahí y no en la vista chica) */
function camSharpness(data, contrast) {
  const w = data.width, h = data.height, px = data.data; const g = new Uint8Array(w * h); for (let i = 0, p = 0; i < g.length; i++, p += 4) g[i] = (px[p] * 77 + px[p + 1] * 150 + px[p + 2] * 29) >> 8;
  const mags = []; for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const mg = Math.abs(g[y * w + x + 1] - g[y * w + x - 1]) + Math.abs(g[(y + 1) * w + x] - g[(y - 1) * w + x]); if (mg > 14) mags.push(mg); }
  if (mags.length < 60) return null; mags.sort((a, b) => a - b); const top = mags.slice(Math.floor(mags.length * 0.9)); return top.reduce((a, b) => a + b, 0) / top.length / Math.max(30, contrast);
}
/* ---------- Sonidos tipo escáner ---------- */
function camBeep(freq, dur = 0.08, type = 'square', vol = 0.06, delay = 0) {
  if (!CAM.sound) return; try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const ctx = (CAM.ctx ||= new AC()); if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + delay; o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* */ }
}
const camSoundFound = () => camBeep(1320, 0.06, 'square', 0.04); const camSoundBad = () => camBeep(260, 0.11, 'sawtooth', 0.04);
const camSoundTick = (k) => camBeep(900 + k * 140, 0.045, 'square', 0.035);
function camSoundShot() { camBeep(2400, 0.09, 'square', 0.07); camBeep(3100, 0.12, 'square', 0.06, 0.1); try { navigator.vibrate && navigator.vibrate(40); } catch { /* */ } }

/* ---------- Pantalla de cámara ---------- */
const CAM_MODES = [['tasks', 'Pendientes'], ['libreta', 'A libreta'], ['solve', 'Resolver']];
async function camOpen(mode) {
  if (CAM.on) return; CAM.mode = mode || CAM.mode;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) { toast('Este navegador no deja usar la cámara aquí. Usa «Tomar foto con la cámara del teléfono».'); return; }
  const ov = document.createElement('div'); ov.className = 'cam-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Cámara guiada');
  ov.innerHTML = `<div class="cam-top"><button type="button" class="cam-x" data-cam="close" aria-label="Cerrar">${icon('x')}</button><div class="cam-modes" role="group">${CAM_MODES.map(([k, l]) => `<button type="button" data-cam="mode" data-v="${k}" aria-pressed="${CAM.mode === k}">${l}</button>`).join('')}</div><button type="button" class="cam-x" data-cam="sound" aria-pressed="${CAM.sound}" aria-label="Sonido">${icon('bell')}</button></div>
    <div class="cam-stage" id="camStage"><video id="camVid" playsinline muted autoplay></video><canvas id="camDraw"></canvas></div>
    <div class="cam-msg" id="camMsg" data-k="warn">Abriendo la cámara…</div>
    <div class="cam-bot"><button type="button" class="cam-side" data-cam="auto" aria-pressed="${CAM.auto}"><span>Auto</span></button><button type="button" class="cam-shot" data-cam="shot" aria-label="Tomar foto"><i></i></button><button type="button" class="cam-side" data-cam="torch" id="camTorch" hidden><span>Luz</span></button></div>`;
  document.body.appendChild(ov); document.body.classList.add('cam-on');
  try { CAM.ctx ||= new (window.AudioContext || window.webkitAudioContext)(); CAM.ctx.resume && CAM.ctx.resume(); } catch { /* */ }
  try {
    CAM.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
  } catch (e) { camClose(); toast(e && e.name === 'NotAllowedError' ? 'Permite la cámara en tu navegador para usar la cámara guiada.' : 'No pude abrir la cámara. Usa «Tomar foto con la cámara del teléfono».'); return; }
  const v = document.getElementById('camVid'); v.srcObject = CAM.stream; await v.play().catch(() => {});
  const tr = CAM.stream.getVideoTracks()[0]; try { const cap = tr.getCapabilities ? tr.getCapabilities() : {}; if (cap.torch) document.getElementById('camTorch').hidden = false; if (cap.focusMode && cap.focusMode.includes('continuous')) await tr.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }); } catch { /* */ }
  CAM.on = true; CAM.good = 0; CAM.prevGrid = null; CAM.lastStatus = ''; CAM.busy = false; CAM.hist = [];
  const loop = () => { if (!CAM.on) return; camTick(); CAM.timer = setTimeout(loop, 130); }; loop();
}
function camClose() {
  CAM.on = false; clearTimeout(CAM.timer); if (CAM.stream) { CAM.stream.getTracks().forEach((t) => t.stop()); CAM.stream = null; }
  document.querySelector('.cam-ov')?.remove(); document.body.classList.remove('cam-on'); CAM.torch = false;
}
const camWork = document.createElement('canvas'), camSh = document.createElement('canvas'); let CAM_SHARP_MIN = 0.7;
function camTick() {
  const v = document.getElementById('camVid'), cv = document.getElementById('camDraw'), stage = document.getElementById('camStage'); if (!v || !cv || !v.videoWidth || CAM.busy) return;
  const vw = v.videoWidth, vh = v.videoHeight; const ar = vw / vh; stage.style.aspectRatio = `${vw} / ${vh}`;
  const W = 256, H = Math.round(W / ar); camWork.width = W; camWork.height = H; const g = camWork.getContext('2d', { willReadFrequently: true }); g.drawImage(v, 0, 0, W, H);
  const r = camAnalyze(g.getImageData(0, 0, W, H), CAM.prevGrid); CAM.prevGrid = r.grid; CAM.last = r;
  if (r.found && r.box && r.hasText && (CAM.n = (CAM.n || 0) + 1) % 2 === 0) { // cada dos cuadros: nitidez a 480 px
    const [bx0, by0, bx1, by1] = r.box; const k = vw / W; const cw = Math.min(480, Math.round((bx1 - bx0) * k)); const chh = Math.round(cw * (by1 - by0) / (bx1 - bx0)); if (cw > 60 && chh > 60) { camSh.width = cw; camSh.height = chh; const sg = camSh.getContext('2d', { willReadFrequently: true }); sg.drawImage(v, bx0 * k, by0 * k, (bx1 - bx0) * k, (by1 - by0) * k, 0, 0, cw, chh); const sv = camSharpness(sg.getImageData(0, 0, cw, chh), r.contrast || 100); if (sv !== null) { CAM.sharpV = sv; } }
  }
  if (r.found && CAM.sharpV !== undefined) { r.sharp = CAM.sharpV; r.issues = r.issues.filter((x) => x !== 'foco'); if (r.sharp < CAM_SHARP_MIN) r.issues.push('foco'); } else if (!r.found) CAM.sharpV = undefined;
  const hist = (CAM.hist ||= []); hist.push(r.issues.slice()); if (hist.length > 3) hist.shift();
  // se estabiliza el diagnóstico: un problema cuenta si aparece en 2 de los últimos 3 cuadros
  const stable = r.found ? ['lejos', 'cerca', 'tilt', 'persp', 'luz', 'exceso', 'foco', 'mueve'].filter((k) => hist.filter((h) => h.includes(k)).length >= 2 || (k === 'mueve' && r.issues.includes(k))) : ['none'];
  const soft = stable.every((k) => ['foco', 'persp', 'exceso', 'tilt'].includes(k)); CAM.softN = r.found && soft && stable.length && !r.issues.includes('mueve') ? (CAM.softN || 0) + 1 : 0;
  const ok = r.found && (stable.length === 0 || CAM.softN > 26) && r.hasText !== false; const key = ok ? 'ok' : (stable[0] || 'none');
  const msg = document.getElementById('camMsg'); const [txt, kind] = CAM_MSG[key]; if (msg.textContent !== txt) msg.textContent = txt; msg.dataset.k = kind;
  if (key !== CAM.lastStatus) { if (CAM.lastStatus === 'none' && r.found) camSoundFound(); else if (key === 'ok') camBeep(1760, 0.07, 'square', 0.04); else if (CAM.lastStatus === 'ok' && Date.now() - CAM.lastBad > 1500) { camSoundBad(); CAM.lastBad = Date.now(); } CAM.lastStatus = key; }
  CAM.good = ok ? CAM.good + 1 : 0; if (ok && CAM.good <= 7) camSoundTick(CAM.good);
  camDraw(cv, r, ok, stage, CAM.good, vw, vh);
  if (CAM.auto && CAM.good >= 8) camShot(true);
}
function camDraw(cv, r, ok, stage, good, vw, vh) {
  const dpr = Math.min(2, devicePixelRatio || 1); let cw = stage.clientWidth, ch = stage.clientHeight; if (cv.width !== cw * dpr || cv.height !== ch * dpr) { cv.width = cw * dpr; cv.height = ch * dpr; cv.style.width = cw + 'px'; cv.style.height = ch + 'px'; }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, cw, ch);
  // el video se ve completo (contain): se dibuja solo sobre su área real
  const k0 = Math.min(cw / vw, ch / vh), dw = vw * k0, dh = vh * k0, ox = (cw - dw) / 2, oy = (ch - dh) / 2; g.save(); g.translate(ox, oy); const cw0 = cw; cw = dw; ch = dh; void cw0;
  // marco guía fijo
  const mx = cw * 0.07, my = ch * 0.07; g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.setLineDash([8, 8]); g.beginPath(); g.roundRect(mx, my, cw - 2 * mx, ch - 2 * my, 14); g.stroke(); g.setLineDash([]);
  if (!r.found) { g.restore(); return; } const sx = cw / r.w, sy = ch / r.h; const col = ok ? '#38D27A' : r.issues.includes('luz') ? '#FF5A5A' : '#FFB838';
  const q = r.q.map(([x, y]) => [x * sx, y * sy]);
  g.fillStyle = ok ? 'rgba(56,210,122,.16)' : 'rgba(255,184,56,.10)'; g.beginPath(); q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.strokeStyle = col; g.lineWidth = 3; g.stroke();
  // esquinas
  g.lineWidth = 5; g.lineCap = 'round'; q.forEach(([x, y], i) => { const n = q[(i + 1) % 4], p = q[(i + 3) % 4]; const d1 = [n[0] - x, n[1] - y], d2 = [p[0] - x, p[1] - y]; const l1 = Math.hypot(...d1) || 1, l2 = Math.hypot(...d2) || 1; const L = 26; g.beginPath(); g.moveTo(x + (d1[0] / l1) * L, y + (d1[1] / l1) * L); g.lineTo(x, y); g.lineTo(x + (d2[0] / l2) * L, y + (d2[1] / l2) * L); g.stroke(); });
  // renglones reconocidos: todo marcado en verde cuando está bien
  if (r.lines && r.box) { const [bx0, , bx1] = r.box; g.fillStyle = ok ? 'rgba(56,210,122,.55)' : 'rgba(255,255,255,.3)'; r.lines.forEach(([a, b]) => { g.beginPath(); g.roundRect(bx0 * sx, b * sy - 1, (bx1 - bx0) * sx, 3, 2); g.fill(); }); }
  if (ok) { const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4; const k = Math.min(1, good / 8); g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, 30, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); g.stroke(); g.strokeStyle = '#38D27A'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 12, cy); g.lineTo(cx - 3, cy + 10); g.lineTo(cx + 14, cy - 10); g.stroke(); }
  g.restore();
}
/* ---------- Enderezar la hoja (perspectiva) y mandar a leer ---------- */
function camHomography(src, dst) { // 4 pares de puntos → matriz 3x3 (src→dst)
  const A = [], b = []; for (let i = 0; i < 4; i++) { const [x, y] = src[i], [u, v] = dst[i]; A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u); A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v); }
  const n = 8; for (let i = 0; i < n; i++) { let p = i; for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r; [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]]; for (let r = i + 1; r < n; r++) { const f = A[r][i] / A[i][i]; for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]; b[r] -= f * b[i]; } }
  const x = new Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]; x[i] = s / A[i][i]; } return [x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7], 1];
}
function camWarp(srcCv, quad) { // quad en píxeles de srcCv: TL, TR, BR, BL
  const [tl, tr, br, bl] = quad; const wTop = camDist(tl, tr), wBot = camDist(bl, br), hL = camDist(tl, bl), hR = camDist(tr, br);
  let ow = Math.round(Math.max(wTop, wBot)), oh = Math.round(Math.max(hL, hR)); const k = Math.min(1, 2000 / Math.max(ow, oh)); ow = Math.max(200, Math.round(ow * k)); oh = Math.max(200, Math.round(oh * k));
  const Hm = camHomography([[0, 0], [ow, 0], [ow, oh], [0, oh]], quad); const sw = srcCv.width, sh = srcCv.height; const sd = srcCv.getContext('2d').getImageData(0, 0, sw, sh).data;
  const out = document.createElement('canvas'); out.width = ow; out.height = oh; const og = out.getContext('2d'); const od = og.createImageData(ow, oh); const o = od.data;
  for (let y = 0; y < oh; y++) for (let x = 0; x < ow; x++) {
    const d = Hm[6] * x + Hm[7] * y + 1; const u = (Hm[0] * x + Hm[1] * y + Hm[2]) / d, v = (Hm[3] * x + Hm[4] * y + Hm[5]) / d; const p = (y * ow + x) * 4;
    if (u < 0 || v < 0 || u >= sw - 1 || v >= sh - 1) { o[p] = o[p + 1] = o[p + 2] = 255; o[p + 3] = 255; continue; }
    const x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0, i00 = (y0 * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4;
    for (let c = 0; c < 3; c++) o[p + c] = (sd[i00 + c] * (1 - fx) + sd[i10 + c] * fx) * (1 - fy) + (sd[i01 + c] * (1 - fx) + sd[i11 + c] * fx) * fy; o[p + 3] = 255;
  }
  og.putImageData(od, 0, 0); return out;
}
async function camShot(auto) {
  if (CAM.busy || !CAM.on) return; CAM.busy = true; const v = document.getElementById('camVid'); const r = CAM.last; camSoundShot();
  const msg = document.getElementById('camMsg'); if (msg) { msg.textContent = 'Foto tomada · procesando…'; msg.dataset.k = 'ok'; }
  const full = document.createElement('canvas'); full.width = v.videoWidth; full.height = v.videoHeight; full.getContext('2d').drawImage(v, 0, 0);
  let outCv = full;
  try {
    if (r && r.found && r.cover > 0.3) {
      const sx = full.width / r.w, sy = full.height / r.h; const c = r.q.map(([x, y]) => [x * sx, y * sy]); const cx = c.reduce((a, p) => a + p[0], 0) / 4, cy = c.reduce((a, p) => a + p[1], 0) / 4;
      const q = c.map(([x, y]) => [Math.max(0, Math.min(full.width - 1, cx + (x - cx) * 1.015)), Math.max(0, Math.min(full.height - 1, cy + (y - cy) * 1.015))]); outCv = camWarp(full, q);
    }
  } catch { outCv = full; }
  const blob = await new Promise((res) => outCv.toBlob(res, 'image/jpeg', 0.93)); const file = new File([blob], 'escaneo.jpg', { type: 'image/jpeg' }); const mode = CAM.mode;
  camClose(); location.hash = '#/escanear'; setTimeout(() => runScan(file, mode), 60); void auto;
}
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('[data-cam]'); if (!b) return; const k = b.dataset.cam;
  if (k === 'close') camClose();
  else if (k === 'shot') camShot(false);
  else if (k === 'mode') { CAM.mode = b.dataset.v; document.querySelectorAll('[data-cam=mode]').forEach((x) => x.setAttribute('aria-pressed', x === b)); }
  else if (k === 'sound') { CAM.sound = !CAM.sound; b.setAttribute('aria-pressed', CAM.sound); if (CAM.sound) camBeep(1320, 0.06); }
  else if (k === 'auto') { CAM.auto = !CAM.auto; b.setAttribute('aria-pressed', CAM.auto); CAM.good = 0; }
  else if (k === 'torch') { CAM.torch = !CAM.torch; const tr = CAM.stream && CAM.stream.getVideoTracks()[0]; if (tr) tr.applyConstraints({ advanced: [{ torch: CAM.torch }] }).catch(() => {}); b.setAttribute('aria-pressed', CAM.torch); }
});
Object.assign(VIDA_ACTS, { 'cam-open': (el) => camOpen(el.dataset.mode) });
addEventListener('popstate', () => { if (CAM.on) camClose(); }); addEventListener('hashchange', () => { if (CAM.on) camClose(); });
{
  const baseView = viewEscanear;
  viewEscanear = function () {
    let h = baseView();
    h = h.replace('<div class="btn-row" style="margin:6px 0 16px">', `<div class="cam-cta"><button type="button" class="btn primary block" data-act="cam-open" data-mode="tasks">${icon('cam')}Cámara guiada</button><p class="small muted" style="margin:6px 2px 0">Te ayuda a encuadrar la hoja, libreta o pizarrón, suena como un escáner cuando está bien y la foto sale derechita.</p></div>
    <div class="btn-row" style="margin:6px 0 16px">`);
    return h.replace('<h1 class="page-title">Escanear foto</h1>', '<h1 class="page-title">Escanear foto</h1>').replace(/for="scanTasks">(<svg[^>]*>.*?<\/svg>)Sacar pendientes y fechas/, 'for="scanTasks">$1Foto del teléfono: pendientes');
  };
}
