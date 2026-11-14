/* Cinnavia 7.61 — Rendimiento para celulares menos potentes.
   Mientras hay un juego en pantalla, mide los cuadros por segundo y, si el teléfono no alcanza,
   baja la resolución interna del lienzo (no se nota en pantallas pequeñas) y suaviza las sombras,
   que son lo más caro de dibujar. Si el teléfono va sobrado, regresa a la calidad completa.
   El nivel elegido se recuerda en el dispositivo para que la siguiente partida empiece bien desde el inicio.
   Fuera de los juegos no cambia nada (los PDF, fotos y dibujos siguen en alta resolución). */
'use strict';
(() => {
  const KEY = 'aldia:perf:tier';
  const CAP = [2, 1.5, 1.25, 1];          // resolución máxima por nivel
  const SHADOW = [1, 1, 0.55, 0.35];       // cuánto de las sombras/brillos se dibuja
  const real = () => { try { return realDPR.get ? realDPR.get.call(window) : 1; } catch { return 1; } };
  const realDPR = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio') || Object.getOwnPropertyDescriptor(Window.prototype, 'devicePixelRatio') || {};
  // primera estimación según el aparato
  let base = 0;
  try {
    const cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4;
    if (cores <= 2 || mem <= 2) base = 2; else if (cores <= 4 || mem <= 3) base = 1;
  } catch { /* */ }
  let tier = base;
  try { const s = localStorage.getItem(KEY); if (s != null && !isNaN(+s)) tier = Math.max(0, Math.min(3, +s)); } catch { /* */ }

  const GAME_RE = /^#\/(juego|galope|peloton|memoria|enlaza|gusano|mono|granbosque|cielo|tycoon|navidad|mente)(?:$|[/?])/;
  const gaming = () => {
    try { return document.body && (document.body.classList.contains('gm-on') || !!document.getElementById('czGame') || GAME_RE.test(location.hash)); }
    catch { return false; }
  };
  window.cnPerf = { get tier() { return tier; }, gaming, low: () => gaming() && tier >= 2 };

  // resolución: solo se limita dentro de los juegos
  if (realDPR.get) {
    try {
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get() { const r = real() || 1; return gaming() ? Math.min(r, CAP[tier]) : r; } });
    } catch { /* algunos navegadores no lo permiten: no pasa nada */ }
  }
  // sombras más ligeras en el nivel bajo (mismo dibujo, menos difuminado)
  try {
    const P = CanvasRenderingContext2D.prototype, d = Object.getOwnPropertyDescriptor(P, 'shadowBlur');
    if (d && d.set) Object.defineProperty(P, 'shadowBlur', { configurable: true, get: d.get, set(v) { d.set.call(this, tier >= 2 && gaming() ? v * SHADOW[tier] : v); } });
  } catch { /* */ }

  // medidor de cuadros: solo cuenta mientras hay juego
  const raf0 = window.requestAnimationFrame.bind(window);
  let lastT = 0, ema = 16.7, n = 0, slow = 0, fast = 0, raisedOnce = false, lastChange = 0, frameSeen = 0;
  const setTier = (t, why) => {
    t = Math.max(0, Math.min(3, t)); if (t === tier) return;
    tier = t; lastChange = performance.now(); slow = fast = 0;
    try { localStorage.setItem(KEY, String(tier)); } catch { /* */ }
    // los juegos recalculan su lienzo al cambiar de tamaño
    try { window.dispatchEvent(new Event('resize')); } catch { /* */ }
    void why;
  };
  const tick = (now) => {
    if (now === frameSeen) return; frameSeen = now; // varios callbacks en el mismo cuadro cuentan una vez
    if (!gaming() || document.hidden) { lastT = 0; return; }
    if (lastT) {
      const dt = now - lastT;
      if (dt > 0 && dt < 250) {
        ema += (dt - ema) * 0.06; n++;
        if (n > 60 && now - lastChange > 2500) {
          if (ema > 23) { if (++slow > 45) setTier(tier + 1, 'lento'); } else slow = Math.max(0, slow - 1);
          if (ema < 17.6 && tier > 0 && !raisedOnce) { if (++fast > 900) { raisedOnce = true; setTier(tier - 1, 'rapido'); } } else fast = 0;
        }
      }
    }
    lastT = now;
  };
  window.requestAnimationFrame = function (cb) { return raf0((t) => { tick(t); cb(t); }); };
  document.addEventListener('visibilitychange', () => { lastT = 0; });
})();
/* dibujo de rectángulos redondeados en navegadores viejos (iOS 15 y anteriores) */
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) { r = Math.min(typeof r === 'number' ? r : 0, w / 2, h / 2); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); return this; };
}
