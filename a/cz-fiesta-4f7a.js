/* Decoración de cumpleaños de la app — solo se carga y se activa para el perfil de Constanza */
(function () {
  'use strict';
  let on = false, raf = 0, nodes = [], styleEl = null, timer = 0;
  const COLS = ['#ff5d8f', '#ffb703', '#8ecae6', '#b388eb', '#06d6a0', '#ff8fab', '#fb8500', '#ffd166'];
  const reduce = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

  const CSS = `
:root[data-fiesta]{--pen:#D6457F;--pen-ink:#FFF7FB;--pen-soft:#FBD9E8;--paper:#FFF1F6;--sheet:#FFF9FC;--sheet-2:#FBE3EE;--grid:#F6D9E7;--line:#F3CFE0;--hl:#FFD166;--hl-ink:#5A2A45;--amber:#F5A623;--ok:#4FB08A;--ok-soft:#D9F3EA;--red:#E0556B;--red-soft:#FCDDE2;--ink:#4A2A40;--ink-2:#7A5570;--ink-3:#A68399;--shadow:0 1px 0 rgba(160,60,110,.06),0 14px 34px -18px rgba(190,60,120,.4)}
:root[data-fiesta][data-theme="dark"]{--pen:#FF8FBF;--pen-ink:#2C1226;--pen-soft:#52264A;--paper:#24101F;--sheet:#2F1829;--sheet-2:#3B2033;--grid:#341A2D;--line:#4A2842;--hl:#FFD166;--hl-ink:#2C1226;--amber:#FFC24D;--ink:#FFE9F4;--ink-2:#E7BFD6;--ink-3:#B58AA6}
@media (prefers-color-scheme: dark){:root[data-fiesta]:not([data-theme="light"]){--pen:#FF8FBF;--pen-ink:#2C1226;--pen-soft:#52264A;--paper:#24101F;--sheet:#2F1829;--sheet-2:#3B2033;--grid:#341A2D;--line:#4A2842;--hl:#FFD166;--hl-ink:#2C1226;--amber:#FFC24D;--ink:#FFE9F4;--ink-2:#E7BFD6;--ink-3:#B58AA6}}
body{transition:background .6s}
#czFx{position:fixed;inset:0;pointer-events:none;z-index:30;overflow:hidden}
#czFx .gl{position:absolute;left:0;right:0;top:0;height:calc(54px + var(--safe-t,0px));pointer-events:none}
#czFx .gl svg{display:block;width:100%;height:100%}
#czFx .fl{transform-origin:50% 0;animation:czSway 3.2s ease-in-out infinite}
@keyframes czSway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
#czFx .bl{position:absolute;bottom:-120px;width:var(--w);height:calc(var(--w)*1.22);border-radius:50% 50% 48% 48%;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.75),rgba(255,255,255,0) 34%),var(--c);opacity:.55;animation:czRise var(--d) linear infinite;animation-delay:var(--l);will-change:transform}
#czFx .bl:after{content:"";position:absolute;left:50%;top:100%;width:1px;height:46px;background:rgba(120,70,110,.35)}
@keyframes czRise{0%{transform:translate3d(0,0,0) rotate(-4deg)}50%{transform:translate3d(var(--x),-60vh,0) rotate(4deg)}100%{transform:translate3d(0,-125vh,0) rotate(-4deg)}}
#czFx canvas{position:absolute;inset:0;width:100%;height:100%}
#czFx .hi{position:absolute;left:50%;top:calc(46px + var(--safe-t,0px));transform:translate(-50%,-30px);opacity:0;padding:9px 18px;border-radius:999px;background:linear-gradient(90deg,#ff8fab,#b388eb);color:#fff;font:italic 700 16px Georgia,serif;box-shadow:0 10px 26px -10px rgba(190,60,120,.7);white-space:nowrap;animation:czHi 7s ease both}
@keyframes czHi{0%{opacity:0;transform:translate(-50%,-30px)}8%,88%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-30px)}}
@media (prefers-reduced-motion: reduce){#czFx .bl,#czFx .fl{animation:none}#czFx .bl{display:none}}
`;

  function garland() {
    const W = 400, n = 16, step = W / n;
    let s = `<svg viewBox="0 0 ${W} 54" preserveAspectRatio="none"><path d="M0 4 Q ${W / 2} 22 ${W} 4" fill="none" stroke="rgba(150,80,120,.55)" stroke-width="1.4"/>`;
    for (let i = 0; i < n; i++) {
      const x = (i + .5) * step, t = x / W, yy = 4 + 36 * t * (1 - t) - 1; // sobre la cuerda
      const c = COLS[i % COLS.length];
      s += `<g class="fl" style="animation-delay:${(i % 5) * -.5}s;transform-box:fill-box"><path d="M${x - 9} ${yy} L${x + 9} ${yy} L${x} ${yy + 20}Z" fill="${c}" opacity=".92"/></g>`;
    }
    return s + '</svg>';
  }

  function build() {
    const fx = document.createElement('div'); fx.id = 'czFx'; fx.setAttribute('aria-hidden', 'true');
    let h = `<div class="gl">${garland()}</div>`;
    const N = window.innerWidth > 900 ? 12 : 8;
    for (let i = 0; i < N; i++) {
      const w = 34 + (i * 13) % 30, left = 4 + (i * 97 / N) % 92, d = 16 + (i * 7) % 12, l = -(i * 3.7);
      h += `<i class="bl" style="--w:${w}px;--c:${COLS[i % COLS.length]};--d:${d}s;--l:${l}s;--x:${(i % 2 ? 1 : -1) * (20 + (i * 11) % 40)}px;left:${left}%"></i>`;
    }
    h += `<div class="hi">🎉 ¡Feliz cumpleaños, Constanza! 🎉</div><canvas></canvas>`;
    fx.innerHTML = h;
    return fx;
  }

  function confetti(cv) {
    const g = cv.getContext('2d'); let W = 0, H = 0, last = 0;
    const size = () => { const dpr = Math.min(2, window.devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); window.addEventListener('resize', size);
    const N = window.innerWidth > 900 ? 46 : 30;
    const P = Array.from({ length: N }, (_, i) => ({ x: Math.random() * 1000, y: Math.random() * 1000, v: 22 + Math.random() * 34, w: 6 + Math.random() * 6, c: COLS[i % COLS.length], r: Math.random() * 6, s: .8 + Math.random() * 2, ph: Math.random() * 6 }));
    function frame(now) {
      if (!on) return;
      raf = requestAnimationFrame(frame);
      if (document.hidden || now - last < 33) return;
      const dt = Math.min(.1, (now - last) / 1000); last = now;
      g.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y += p.v * dt; p.r += p.s * dt * 2; p.ph += dt;
        if (p.y > H + 12) { p.y = -12; p.x = Math.random() * W; }
        const x = (p.x % W) + Math.sin(p.ph) * 14;
        g.save(); g.globalAlpha = .75; g.translate(x, p.y); g.rotate(p.r); g.scale(1, Math.abs(Math.cos(p.r * 1.7)) * .8 + .2); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2); g.restore();
      }
    }
    raf = requestAnimationFrame(frame);
    return () => window.removeEventListener('resize', size);
  }

  let offResize = null;
  function enable() {
    if (on) return; on = true;
    document.documentElement.setAttribute('data-fiesta', '1');
    styleEl = document.createElement('style'); styleEl.id = 'czFiestaCss'; styleEl.textContent = CSS; document.head.appendChild(styleEl);
    const fx = build(); document.body.appendChild(fx); nodes.push(fx);
    if (!reduce()) offResize = confetti(fx.querySelector('canvas')); else fx.querySelector('canvas').remove();
    try { const m = document.querySelector('meta[name="theme-color"]'); if (m) { m.dataset.czPrev = m.content; m.content = '#FFF1F6'; } } catch (e) { /* */ }
  }
  function disable() {
    if (!on) return; on = false;
    cancelAnimationFrame(raf); if (offResize) { offResize(); offResize = null; }
    nodes.forEach((n) => n.remove()); nodes = [];
    if (styleEl) { styleEl.remove(); styleEl = null; }
    document.documentElement.removeAttribute('data-fiesta');
    try { const m = document.querySelector('meta[name="theme-color"]'); if (m && m.dataset.czPrev) { m.content = m.dataset.czPrev; delete m.dataset.czPrev; } } catch (e) { /* */ }
  }
  window.czFiesta = (v) => (v ? enable() : disable());
})();
