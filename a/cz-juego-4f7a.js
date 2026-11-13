/* Nubes de cumpleaños — juego de salto infinito (solo se carga desde la sorpresa de Constanza) */
(function () {
  'use strict';
  const FACE = 'data:image/jpeg;base64,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';
  let running = null;

  window.czJuego = function () {
    if (running) return;
    running = start();
  };

  function start() {
    /* ---------- contenedor ---------- */
    const root = document.createElement('div');
    root.id = 'czGame';
    root.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#0b0c1a;display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none;overscroll-behavior:none';
    const cv = document.createElement('canvas');
    cv.style.cssText = 'display:block;width:100%;height:100%;max-width:520px;touch-action:none';
    root.appendChild(cv);
    document.body.appendChild(root);
    const g = cv.getContext('2d');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const BW = 400; // ancho del mundo
    let W = BW, H = 700, S = 1, DPR = 1;
    function resize() {
      const r = cv.getBoundingClientRect();
      DPR = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * DPR); cv.height = Math.round(r.height * DPR);
      S = cv.width / BW; H = cv.height / S;
    }
    resize();
    window.addEventListener('resize', resize);

    const face = new Image(); face.src = FACE;

    /* ---------- utilidades ---------- */
    const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
    const lerp = (a, b, t) => a + (b - a) * t;
    let seed = (Date.now() & 0xffff) + 7;
    const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    const mixc = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; };
    const BEST_KEY = 'cz:best';
    let best = 0; try { best = +localStorage.getItem(BEST_KEY) || 0; } catch (e) { /* */ }

    /* ---------- cielos (solo tonos, siempre nubes) ---------- */
    const SKY = [
      ['#ffd9e8', '#ffb3d1', '#c9a7ff'], // amanecer rosa
      ['#bfe6ff', '#8fd0ff', '#d9c7ff'], // día
      ['#ffe0b8', '#ffb199', '#b48cff'], // atardecer
      ['#3b2a7a', '#251a5c', '#120c33'], // noche violeta
      ['#9fe8dc', '#7cc6f2', '#c7b4ff'], // aurora menta
    ];
    const SKY_LEN = 2600;
    function skyColors(h) {
      const f = h / SKY_LEN, i = Math.floor(f), t = f - i, a = SKY[i % SKY.length], b = SKY[(i + 1) % SKY.length];
      const e = t * t * (3 - 2 * t);
      return [mixc(a[0], b[0], e), mixc(a[1], b[1], e), mixc(a[2], b[2], e)];
    }
    function nightness(h) {
      const f = (h / SKY_LEN) % SKY.length; // 3 = noche
      const d = Math.min(Math.abs(f - 3), Math.abs(f - 3 - SKY.length), Math.abs(f - 3 + SKY.length));
      return clamp(1 - d / 1.1, 0, 1);
    }

    /* ---------- estado ---------- */
    const COLS = ['#ff5d8f', '#ffb703', '#8ecae6', '#b388eb', '#06d6a0', '#ff8fab', '#fb8500', '#ffd166'];
    let P, plats, cakes, balloons, parts, popups, camB, maxY, cakeCount, nextMsg, msgI, shake, state, tAll = 0, boostT = 0, lastGenY, paused = false, started = false;
    const MSGS = ['¡Feliz cumpleaños, Constanza!', 'Hoy es tu día', 'Pide un deseo', 'Eres increíble', 'Que cumplas muchos más', 'Qué bonito verte volar', '¡Sigue subiendo!', 'Todo lo bonito es para ti'];

    function reset() {
      P = { x: BW / 2, y: 120, vx: 0, vy: 0, sq: 0, face: 1, prevY: 120 };
      plats = []; cakes = []; balloons = []; parts = []; popups = [];
      camB = 0; maxY = 0; cakeCount = 0; nextMsg = 5; msgI = 0; shake = 0; boostT = 0; state = 'play';
      plats.push({ x: BW / 2, y: 60, w: 110, type: 'n', t: 0, vis: 1, dir: 0 });
      lastGenY = 60;
      gen(H + 500);
      P.vy = 780;
    }

    function gen(top) {
      while (lastGenY < top) {
        const h = lastGenY / 10;
        const diff = clamp(h / 900, 0, 1);
        const gap = lerp(68, 118, diff * .85) * (0.85 + rnd() * .25);
        lastGenY += gap;
        const r = rnd();
        let type = 'n';
        if (lastGenY > 500) {
          if (r < .10 + .10 * diff) type = 'f';
          else if (r < .26 + .14 * diff) type = 'm';
          else if (r < .31 + .02 * diff) type = 's';
        }
        const w = type === 'f' ? 92 : lerp(112, 84, diff) * (0.92 + rnd() * .2);
        const x = 20 + w / 2 + rnd() * (BW - 40 - w);
        const pl = { x, y: lastGenY, w, type, t: rnd() * 6, vis: 1, dir: rnd() < .5 ? -1 : 1, amp: 60 + rnd() * 80, x0: x, sp: .6 + rnd() * .7 + diff * .5 };
        plats.push(pl);
        if (type !== 'f' && rnd() < .34) cakes.push({ x: clamp(x + (rnd() - .5) * w, 30, BW - 30), y: lastGenY + 44 + rnd() * 16, c: COLS[(rnd() * COLS.length) | 0], t: rnd() * 6, got: 0, host: pl });
        if (lastGenY > 2000 && rnd() < .035) balloons.push({ x: 40 + rnd() * (BW - 80), y: lastGenY + 70, c: COLS[(rnd() * COLS.length) | 0], t: rnd() * 6, got: 0 });
      }
    }

    /* ---------- audio ---------- */
    let AC = null, master = null, muted = false, musicTimer = null, nextBeat = 0, beat = 0;
    function audioInit() {
      try {
        AC = new (window.AudioContext || window.webkitAudioContext)();
        master = AC.createGain(); master.gain.value = .9;
        const comp = AC.createDynamicsCompressor(); master.connect(comp); comp.connect(AC.destination);
        // eco suave
        const dl = AC.createDelay(); dl.delayTime.value = .28; const fb = AC.createGain(); fb.gain.value = .3; const wet = AC.createGain(); wet.gain.value = .22;
        master.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(comp);
        nextBeat = AC.currentTime + .1;
        musicTimer = setInterval(schedule, 120);
      } catch (e) { AC = null; }
    }
    const NF = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, C7: 2093 };
    function tone(f, t0, d, vol, type, glide, attack) {
      if (!AC || muted) return;
      const o = AC.createOscillator(), gn = AC.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
      if (glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + d * .8);
      const a = attack || .008;
      gn.gain.setValueAtTime(0, t0); gn.gain.linearRampToValueAtTime(vol, t0 + a); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
      o.connect(gn); gn.connect(master); o.start(t0); o.stop(t0 + d + .05);
    }
    function bell(f, t0, d, vol) { tone(f, t0, d, vol, 'sine'); tone(f * 2.76, t0, d * .5, vol * .25, 'sine'); tone(f * 4.1, t0, d * .3, vol * .1, 'sine'); }
    function noise(t0, d, vol, f0, f1) {
      if (!AC || muted) return;
      const n = Math.floor(AC.sampleRate * d), b = AC.createBuffer(1, n, AC.sampleRate), ch = b.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 1.5);
      const s = AC.createBufferSource(); s.buffer = b;
      const fl = AC.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.setValueAtTime(f0, t0); fl.frequency.exponentialRampToValueAtTime(f1, t0 + d);
      const gn = AC.createGain(); gn.gain.value = vol; s.connect(fl); fl.connect(gn); gn.connect(master); s.start(t0);
    }
    const sfx = {
      jump() { if (!AC) return; const t = AC.currentTime; tone(520, t, .16, .07, 'sine', 820); tone(1040, t + .02, .1, .02, 'triangle'); },
      spring() { if (!AC) return; const t = AC.currentTime; [NF.C5, NF.E5, NF.G5, NF.C6, NF.E6].forEach((f, i) => bell(f, t + i * .05, .5, .07)); noise(t, .35, .05, 600, 3500); },
      crack() { if (!AC) return; const t = AC.currentTime; noise(t, .25, .07, 2400, 500); tone(300, t, .15, .04, 'triangle', 150); },
      cake() { if (!AC) return; const t = AC.currentTime; [NF.E6, NF.G6, NF.C7].forEach((f, i) => bell(f, t + i * .07, .7, .08)); },
      balloon() { if (!AC) return; const t = AC.currentTime; noise(t, .9, .06, 400, 3000); [NF.C5, NF.G5, NF.C6].forEach((f, i) => bell(f, t + i * .1, .8, .06)); },
      msg() { if (!AC) return; const t = AC.currentTime; birthdayTune(t, .26, .05); },
      over() { if (!AC) return; const t = AC.currentTime; [NF.G5, NF.E5, NF.C5, NF.G4].forEach((f, i) => bell(f, t + i * .22, .9, .06)); },
    };
    const HB = [['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2], ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2], ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 1], ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2]];
    function birthdayTune(t0, unit, vol) { let t = t0; HB.forEach(([n, d]) => { bell(NF[n], t, Math.max(.5, d * unit * 1.6), vol); t += d * unit; }); }
    // música de fondo: acordes suaves y arpegio tipo caja de música
    const CH = [[NF.C4, NF.E4, NF.G4, NF.C5], [NF.A4 / 2, NF.C4, NF.E4, NF.A4], [NF.F4 / 2, NF.A4 / 2, NF.C4, NF.F4], [NF.G4 / 2, NF.B4 / 2, NF.D4, NF.G4]];
    function schedule() {
      if (!AC || muted || paused || state === 'over') { if (AC) nextBeat = Math.max(nextBeat, AC.currentTime); return; }
      while (nextBeat < AC.currentTime + .4) {
        const bar = Math.floor(beat / 8) % 4, ch = CH[bar], step = beat % 8;
        if (step === 0) ch.forEach((f, i) => tone(f, nextBeat, 3.6, .018, 'sine', 0, .6));
        const arp = [0, 2, 1, 3, 2, 3, 1, 2][step];
        if (step % 1 === 0) bell(ch[arp] * 2, nextBeat, .9, .02);
        nextBeat += .5; beat++;
      }
    }
    const resume = () => { try { if (AC && AC.state === 'suspended') AC.resume(); } catch (e) { /* */ } };

    /* ---------- partículas ---------- */
    function burst(x, y, n, cols, sp, life) {
      for (let i = 0; i < n; i++) { const a = rnd() * 6.283, v = (.3 + rnd()) * sp; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v + sp * .3, c: cols[(rnd() * cols.length) | 0], t: 0, l: life * (.6 + rnd() * .6), r: 2 + rnd() * 3, rot: rnd() * 6, kind: rnd() < .5 ? 'r' : 'c' }); }
    }
    function popup(text, x, y, c, size) { popups.push({ text, x, y, c: c || '#fff', t: 0, l: 2.2, size: size || 22 }); }

    /* ---------- entrada ---------- */
    let tx = null, keyL = false, keyR = false, tiltV = null;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return (e.clientX - r.left) / r.width * BW; };
    cv.addEventListener('pointerdown', (e) => { resume(); if (state === 'over') { hit(e); return; } if (hitUI(e)) return; tx = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (x) { /* */ } e.preventDefault(); });
    cv.addEventListener('pointermove', (e) => { if (tx != null) tx = pos(e); });
    const up = () => { tx = null; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    const kd = (e) => { if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keyL = true; if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyR = true; if ((e.key === 'Enter' || e.key === ' ') && state === 'over') again(); if (e.key === 'Escape') close(); };
    const ku = (e) => { if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keyL = false; if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keyR = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    const onTilt = (e) => { if (e.gamma != null && Math.abs(e.gamma) > 1) tiltV = clamp(e.gamma / 25, -1, 1); };
    window.addEventListener('deviceorientation', onTilt);
    const vis = () => { paused = document.hidden; if (!paused) last = performance.now(); };
    document.addEventListener('visibilitychange', vis);

    // botones en lienzo (sonido, cerrar, jugar otra vez)
    const UI = { snd: { x: BW - 52, y: 14, w: 38, h: 38 }, x: { x: BW - 98, y: 14, w: 38, h: 38 }, again: null, exit: null };
    function inR(r, px, py) { return r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; }
    function hitUI(e) {
      const rc = cv.getBoundingClientRect(); const px = (e.clientX - rc.left) / rc.width * BW, py = (e.clientY - rc.top) / rc.height * H;
      if (inR(UI.snd, px, py)) { muted = !muted; if (!muted) resume(); return true; }
      if (inR(UI.x, px, py)) { close(); return true; }
      return false;
    }
    function hit(e) {
      const rc = cv.getBoundingClientRect(); const px = (e.clientX - rc.left) / rc.width * BW, py = (e.clientY - rc.top) / rc.height * H;
      if (inR(UI.again, px, py)) again(); else if (inR(UI.exit, px, py)) close(); else hitUI(e);
    }
    function again() { reset(); sfx.jump(); }

    /* ---------- lógica ---------- */
    function step(dt) {
      tAll += dt;
      if (state === 'play') {
        // movimiento horizontal
        let target = 0;
        if (tx != null) target = clamp((tx - P.x) * 7, -460, 460);
        else if (keyL || keyR) target = (keyR ? 1 : 0) * 340 - (keyL ? 1 : 0) * 340;
        else if (tiltV != null) target = tiltV * 460;
        P.vx = lerp(P.vx, target, clamp(dt * 14, 0, 1));
        P.x += P.vx * dt;
        if (P.vx > 20) P.face = 1; else if (P.vx < -20) P.face = -1;
        if (P.x < -14) P.x = BW + 14; if (P.x > BW + 14) P.x = -14;
        // vertical
        P.prevY = P.y;
        if (boostT > 0) { boostT -= dt; P.vy = 700; if (boostT <= 0) P.vy = 520; if (rnd() < .6) burst(P.x, P.y - 24, 1, ['#fff', '#ffd1e8', '#ffe29a'], 60, .7); }
        else P.vy -= 1900 * dt;
        P.y += P.vy * dt;
        P.sq = lerp(P.sq, 0, clamp(dt * 8, 0, 1));
        // plataformas
        for (const p of plats) {
          p.t += dt;
          if (p.type === 'm') { p.x = p.x0 + Math.sin(p.t * p.sp) * p.amp; p.x = clamp(p.x, p.w / 2 + 6, BW - p.w / 2 - 6); }
          if (p.dead) { p.vis -= dt * 3; continue; }
          if (P.vy < 0 && P.prevY >= p.y + 6 && P.y <= p.y + 6 && Math.abs(P.x - p.x) < p.w / 2 + 12) {
            P.y = p.y + 6; P.sq = 1;
            if (p.type === 's') { P.vy = 1180; sfx.spring(); burst(P.x, P.y, 16, ['#ffe29a', '#fff', '#ffb703'], 220, 1); p.boing = 1; }
            else { P.vy = 790; sfx.jump(); burst(P.x, P.y, 5, ['#fff', '#ffd1e8'], 90, .6); }
            if (p.type === 'f') { p.dead = true; sfx.crack(); burst(p.x, p.y, 12, ['#e9ddff', '#fff'], 160, .9); }
          }
          if (p.boing) p.boing = Math.max(0, p.boing - dt * 3);
        }
        // pasteles
        for (const c of cakes) {
          if (c.got) { c.got += dt * 3; continue; }
          c.t += dt; if (c.host && c.host.type === 'm') { c.x = clamp(c.host.x + (c.ox || (c.ox = c.x - c.host.x)), 24, BW - 24); }
          if (Math.hypot(c.x - P.x, c.y - P.y) < 38) {
            c.got = .01; cakeCount++; sfx.cake(); burst(c.x, c.y, 22, [c.c, '#fff', '#ffe29a', '#ff8fab'], 260, 1.1);
            popup('+1', c.x, c.y + 20, '#fff', 26);
            if (cakeCount >= nextMsg) { nextMsg += 5; popup(MSGS[msgI++ % MSGS.length], BW / 2, P.y + 150, '#fff', 24); sfx.msg(); burst(BW / 2, P.y + 100, 40, COLS, 330, 1.6); }
          }
        }
        // globos (impulso)
        for (const b of balloons) {
          if (b.got) { b.got += dt * 2; continue; } b.t += dt;
          if (Math.hypot(b.x - P.x, b.y - P.y) < 44) { b.got = .01; boostT = 2.6; sfx.balloon(); burst(b.x, b.y, 24, COLS, 240, 1.2); popup('¡Globos!', P.x, P.y + 40, '#fff', 26); }
        }
        // cámara
        if (P.y > camB + H * .56) camB = P.y - H * .56;
        if (P.y > maxY) maxY = P.y;
        gen(camB + H + 400);
        // limpiar
        plats = plats.filter((p) => p.y > camB - 160 && p.vis > 0);
        cakes = cakes.filter((c) => c.y > camB - 120 && (!c.got || c.got < 1));
        balloons = balloons.filter((b) => b.y > camB - 160 && (!b.got || b.got < 1));
        // caída
        if (P.y < camB - 70) {
          state = 'over'; sfx.over(); shake = .4;
          const score = Math.floor(maxY / 10) + cakeCount * 25;
          overScore = score; newBest = score > best; if (newBest) { best = score; try { localStorage.setItem(BEST_KEY, String(best)); } catch (e) { /* */ } }
        }
      }
      // partículas y textos
      for (const p of parts) { p.t += dt; p.vy -= 620 * dt * .5; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt * 6; }
      parts = parts.filter((p) => p.t < p.l);
      for (const p of popups) { p.t += dt; p.y += 26 * dt; }
      popups = popups.filter((p) => p.t < p.l);
      if (shake > 0) shake -= dt;
    }
    let overScore = 0, newBest = false;

    /* ---------- dibujo ---------- */
    const sy = (y) => H - (y - camB); // y de mundo -> pantalla
    function cloudShape(x, y, w, h) {
      const n = Math.max(4, Math.round(w / 22));
      g.beginPath();
      for (let i = 0; i < n; i++) { const u = n === 1 ? .5 : i / (n - 1); const cx = x - w / 2 + 10 + u * (w - 20); const r = h * (.55 + .35 * Math.sin(u * Math.PI)); g.moveTo(cx + r, y - h * .15); g.arc(cx, y - h * .15, r, 0, 6.283); }
      g.rect(x - w / 2 + 10, y - h * .15, w - 20, h * .55);
    }
    function drawCloud(p) {
      const y = sy(p.y), h = 26 + (p.type === 's' ? 4 : 0);
      g.save(); g.globalAlpha = Math.max(0, p.vis);
      if (p.dead) { g.translate(p.x, y); g.rotate((1 - p.vis) * .6); g.translate(-p.x, -y); }
      const sq = p.boing ? 1 - Math.sin(p.boing * 3.14) * .25 : 1;
      let col = '#ffffff', sh = 'rgba(120,120,190,.28)';
      if (p.type === 'm') { col = '#ffe0ee'; sh = 'rgba(220,100,160,.3)'; }
      if (p.type === 'f') { col = '#ece4ff'; sh = 'rgba(130,100,200,.25)'; }
      if (p.type === 's') { col = '#fff3c4'; sh = 'rgba(230,170,40,.35)'; }
      g.shadowColor = sh; g.shadowBlur = 16; g.shadowOffsetY = 6;
      g.translate(0, y * (1 - sq) + 0); g.scale(1, sq);
      g.fillStyle = col; cloudShape(p.x, y, p.w, h); g.fill();
      g.shadowColor = 'transparent';
      // brillo y carita
      g.fillStyle = 'rgba(255,255,255,.65)'; g.beginPath(); g.ellipse(p.x - p.w * .18, y - h * .5, p.w * .16, h * .13, -.3, 0, 6.283); g.fill();
      g.fillStyle = 'rgba(90,70,130,.55)';
      const ex = p.w * .13; g.beginPath(); g.arc(p.x - ex, y - h * .05, 2.4, 0, 6.283); g.arc(p.x + ex, y - h * .05, 2.4, 0, 6.283); g.fill();
      g.strokeStyle = 'rgba(90,70,130,.5)'; g.lineWidth = 1.6; g.beginPath(); g.arc(p.x, y + h * .02, 4.5, .15, 2.99); g.stroke();
      g.fillStyle = 'rgba(255,140,170,.4)'; g.beginPath(); g.ellipse(p.x - ex * 1.9, y + h * .05, 4.5, 2.8, 0, 0, 6.283); g.ellipse(p.x + ex * 1.9, y + h * .05, 4.5, 2.8, 0, 0, 6.283); g.fill();
      if (p.type === 's') { g.fillStyle = '#ffb703'; star(p.x, y - h * .85, 9, p.t * 2); }
      if (p.type === 'f') { g.strokeStyle = 'rgba(140,110,200,.5)'; g.lineWidth = 1.4; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(p.x - p.w * .4, y + h * .3); g.lineTo(p.x + p.w * .4, y + h * .3); g.stroke(); g.setLineDash([]); }
      g.restore();
    }
    function star(x, y, r, rot) { g.save(); g.translate(x, y); g.rotate(rot || 0); g.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, a = i * Math.PI / 5; g.lineTo(Math.sin(a) * rr, -Math.cos(a) * rr); } g.closePath(); g.fill(); g.restore(); }
    function sparkle(x, y, s, a) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.fillStyle = '#fffbe6'; g.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * .2 : s, an = i * Math.PI / 4; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); } g.closePath(); g.fill(); g.restore(); }
    function drawCake(c) {
      let y = sy(c.y) + Math.sin(c.t * 3) * 4, k = 1, a = 1;
      if (c.got) { k = 1 + c.got * .8; a = 1 - c.got; y -= c.got * 30; }
      if (a <= 0) return;
      g.save(); g.globalAlpha = a; g.translate(c.x, y); g.scale(k, k);
      // brillo
      const gl = g.createRadialGradient(0, 0, 4, 0, 0, 34); gl.addColorStop(0, 'rgba(255,240,170,.7)'); gl.addColorStop(1, 'rgba(255,240,170,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, 0, 34, 0, 6.283); g.fill();
      // pastel de dos pisos
      g.fillStyle = '#fff7ee'; rr(-17, 2, 34, 15, 4); g.fill();
      g.fillStyle = c.c; rr(-17, 2, 34, 6, 3); g.fill(); for (let i = -14; i <= 14; i += 7) { g.beginPath(); g.arc(i, 8, 3.4, 0, 3.15); g.fill(); }
      g.fillStyle = '#fff7ee'; rr(-12, -9, 24, 12, 4); g.fill();
      g.fillStyle = '#ff8fab'; rr(-12, -9, 24, 5, 3); g.fill(); for (let i = -9; i <= 9; i += 6) { g.beginPath(); g.arc(i, -4, 3, 0, 3.15); g.fill(); }
      g.fillStyle = '#ffb703'; g.fillRect(-1.6, -19, 3.2, 10);
      const f = 1 + .15 * Math.sin(c.t * 14); g.fillStyle = '#ffd166'; g.beginPath(); g.ellipse(0, -23, 3.4, 6 * f, 0, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(0, -22, 1.6, 3.2 * f, 0, 0, 6.283); g.fill();
      g.restore();
    }
    function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function drawBalloons(b) {
      let y = sy(b.y) + Math.sin(b.t * 2) * 6, a = 1; if (b.got) { a = 1 - b.got; y -= b.got * 50; } if (a <= 0) return;
      g.save(); g.globalAlpha = a; g.translate(b.x + Math.sin(b.t * 1.4) * 5, y);
      [[-12, 4, b.c], [12, 2, '#8ecae6'], [0, -8, '#ffd166']].forEach(([dx, dy, c]) => { g.strokeStyle = 'rgba(120,90,130,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(dx, dy + 18); g.quadraticCurveTo(0, 34, 0, 40); g.stroke(); g.fillStyle = c; g.beginPath(); g.ellipse(dx, dy, 13, 16, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(dx - 4, dy - 6, 3, 5, -.5, 0, 6.283); g.fill(); });
      g.restore();
    }
    function drawPlayer() {
      const y = sy(P.y) - 28; const sqx = 1 + P.sq * .18 * (P.vy > 0 ? -1 : 1) * 0 + P.sq * .16, sqy = 1 - P.sq * .16;
      const stretch = clamp(P.vy / 3000, -.1, .16);
      g.save(); g.translate(P.x, y); g.rotate(clamp(P.vx / 1800, -.25, .25)); g.scale(sqx - stretch * .5, sqy + stretch);
      if (boostT > 0) { for (let i = 0; i < 3; i++) { g.fillStyle = COLS[i]; g.beginPath(); g.ellipse(-22 + i * 22, -52, 12, 15, 0, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(120,90,130,.5)'; g.beginPath(); g.moveTo(-22 + i * 22, -37); g.lineTo(0, -22); g.stroke(); } }
      // cuerpo: foto circular con aro
      g.shadowColor = 'rgba(80,40,120,.35)'; g.shadowBlur = 14; g.shadowOffsetY = 5;
      g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 30, 0, 6.283); g.fill(); g.shadowColor = 'transparent';
      g.save(); g.beginPath(); g.arc(0, 0, 26, 0, 6.283); g.clip();
      if (face.complete && face.naturalWidth) g.drawImage(face, -26, -26, 52, 52); else { g.fillStyle = '#ff8fab'; g.fillRect(-26, -26, 52, 52); g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.fillText('C', 0, 9); }
      g.restore();
      g.lineWidth = 3.5; const gr = g.createLinearGradient(-30, -30, 30, 30); gr.addColorStop(0, '#ffd166'); gr.addColorStop(.5, '#ff8fab'); gr.addColorStop(1, '#b388eb'); g.strokeStyle = gr; g.beginPath(); g.arc(0, 0, 28, 0, 6.283); g.stroke();
      // gorrito de fiesta
      g.save(); g.translate(8 * P.face, -27); g.rotate(.32 * P.face);
      g.fillStyle = '#ff5d8f'; g.beginPath(); g.moveTo(-11, 2); g.lineTo(11, 2); g.lineTo(0, -28); g.closePath(); g.fill();
      g.fillStyle = '#ffd166'; g.fillRect(-7, -9, 14, 4); g.fillStyle = '#fff'; g.beginPath(); g.arc(0, -29, 4.6, 0, 6.283); g.fill();
      g.restore();
      g.restore();
    }
    function bgDraw() {
      const h = Math.max(0, camB) / 1;
      const [c0, c1, c2] = skyColors(h);
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, c2); gr.addColorStop(.55, c1); gr.addColorStop(1, c0);
      g.fillStyle = gr; g.fillRect(0, 0, BW, H);
      const nt = nightness(h);
      // estrellas
      if (nt > 0.02) { for (let i = 0; i < 60; i++) { const x = (i * 97.3) % BW, y0 = (i * 53.7) % H; const a = nt * (.4 + .6 * Math.abs(Math.sin(tAll * 1.4 + i))); g.globalAlpha = a; sparkle(x, y0, 2 + (i % 3), 1); } g.globalAlpha = 1; }
      // sol/luna suave
      g.globalAlpha = .55; const sx = BW * .78, syy = 110 + ((camB * .02) % 40);
      const sg = g.createRadialGradient(sx, syy, 4, sx, syy, 80); sg.addColorStop(0, nt > .5 ? 'rgba(255,255,230,.9)' : 'rgba(255,245,200,.85)'); sg.addColorStop(1, 'rgba(255,245,200,0)'); g.fillStyle = sg; g.beginPath(); g.arc(sx, syy, 80, 0, 6.283); g.fill(); g.globalAlpha = 1;
      // capas de nubes con parallax
      const layers = [{ f: .08, s: 1.9, a: .28, n: 5, k: 1 }, { f: .16, s: 1.35, a: .4, n: 6, k: 2 }, { f: .3, s: .9, a: .55, n: 7, k: 3 }];
      for (const L of layers) {
        const span = H + 300;
        for (let i = 0; i < L.n; i++) {
          const baseY = (i * span / L.n + L.k * 211);
          let yy = ((baseY + camB * L.f) % span + span) % span - 150;
          const x = ((i * 173 + L.k * 61) % (BW + 200)) - 60 + Math.sin(tAll * .15 * L.f * 6 + i) * 18;
          const w = 130 * L.s, hh = 34 * L.s;
          g.globalAlpha = L.a * (nt > .5 ? .5 : 1);
          g.fillStyle = nt > .5 ? '#9f8be0' : '#ffffff';
          cloudShape(x + w / 2, H - yy, w, hh); g.fill();
        }
      }
      g.globalAlpha = 1;
      // globos y confeti de fondo, muy suaves
      for (let i = 0; i < 7; i++) {
        const yy = ((i * 211 + tAll * (12 + i * 3) + camB * .12) % (H + 120)); const x = (i * 131) % BW + Math.sin(tAll * .6 + i) * 14;
        g.globalAlpha = .38; g.fillStyle = COLS[i % COLS.length]; g.beginPath(); g.ellipse(x, H - yy + 60, 8, 10, 0, 0, 6.283); g.fill();
        g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, H - yy + 70); g.lineTo(x, H - yy + 92); g.stroke();
      }
      g.globalAlpha = 1;
    }
    function hud() {
      const score = Math.floor(maxY / 10) + cakeCount * 25;
      g.save();
      g.fillStyle = 'rgba(40,20,80,.35)'; rr(12, 12, 176, 44, 22); g.fill();
      drawCake({ x: 36, y: camB + H - 34, c: '#ff5d8f', t: tAll, got: 0 });
      g.fillStyle = '#fff'; g.font = '700 22px Lora, Georgia, serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('× ' + cakeCount, 60, 35);
      g.font = '600 13px Lora, Georgia, serif'; g.fillStyle = 'rgba(255,255,255,.88)'; g.fillText(score + ' pts', 118, 35);
      // botones
      g.fillStyle = 'rgba(40,20,80,.35)'; rr(UI.x.x, UI.x.y, 38, 38, 19); g.fill(); rr(UI.snd.x, UI.snd.y, 38, 38, 19); g.fill();
      g.strokeStyle = '#fff'; g.lineWidth = 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(UI.x.x + 13, UI.x.y + 13); g.lineTo(UI.x.x + 25, UI.x.y + 25); g.moveTo(UI.x.x + 25, UI.x.y + 13); g.lineTo(UI.x.x + 13, UI.x.y + 25); g.stroke();
      g.fillStyle = '#fff'; g.font = '18px sans-serif'; g.textAlign = 'center'; g.fillText(muted ? '🔇' : '🔊', UI.snd.x + 19, UI.snd.y + 20);
      g.restore();
    }
    function over() {
      g.save(); g.setTransform(S, 0, 0, S, 0, 0);
      g.fillStyle = 'rgba(30,12,70,.55)'; g.fillRect(0, 0, BW, H);
      const cx = BW / 2, cy = H / 2 - 20;
      g.fillStyle = 'rgba(255,255,255,.95)'; rr(cx - 160, cy - 150, 320, 300, 28); g.fill();
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#a23a7a'; g.font = 'italic 700 30px Lora, Georgia, serif'; g.fillText('¡Qué bonito vuelo!', cx, cy - 106);
      g.fillStyle = '#5b3a8a'; g.font = '600 16px Lora, Georgia, serif'; g.fillText(cakeCount + (cakeCount === 1 ? ' pastel' : ' pasteles') + ' recogidos', cx, cy - 68);
      g.fillStyle = '#ff5d8f'; g.font = '700 54px Lora, Georgia, serif'; g.fillText(String(overScore), cx, cy - 18);
      g.fillStyle = '#7a5aa8'; g.font = '600 14px Lora, Georgia, serif'; g.fillText(newBest ? '¡Nuevo récord! 🎉' : 'Récord: ' + best, cx, cy + 22);
      UI.again = { x: cx - 120, y: cy + 50, w: 240, h: 48 }; UI.exit = { x: cx - 120, y: cy + 106, w: 240, h: 40 };
      const gr = g.createLinearGradient(cx - 120, 0, cx + 120, 0); gr.addColorStop(0, '#ff8fab'); gr.addColorStop(1, '#b388eb');
      g.fillStyle = gr; rr(UI.again.x, UI.again.y, 240, 48, 24); g.fill();
      g.fillStyle = '#fff'; g.font = '700 18px Lora, Georgia, serif'; g.fillText('Volar otra vez', cx, UI.again.y + 25);
      g.fillStyle = '#7a5aa8'; g.font = '600 15px Lora, Georgia, serif'; g.fillText('Volver a la app', cx, UI.exit.y + 21);
      g.restore();
    }
    function render() {
      g.setTransform(S, 0, 0, S, 0, 0);
      let ox = 0, oy = 0; if (shake > 0) { ox = (Math.random() - .5) * 8 * shake; oy = (Math.random() - .5) * 8 * shake; }
      g.translate(ox, oy);
      bgDraw();
      for (const p of plats) drawCloud(p);
      for (const c of cakes) drawCake(c);
      for (const b of balloons) drawBalloons(b);
      // partículas
      for (const p of parts) {
        const a = clamp(1 - p.t / p.l, 0, 1); g.globalAlpha = a; g.fillStyle = p.c;
        const y = sy(p.y);
        if (p.kind === 'r') { g.save(); g.translate(p.x, y); g.rotate(p.rot); g.fillRect(-p.r, -p.r * .5, p.r * 2, p.r); g.restore(); } else { g.beginPath(); g.arc(p.x, y, p.r * .8, 0, 6.283); g.fill(); }
      }
      g.globalAlpha = 1;
      if (state === 'play' || state === 'over') drawPlayer();
      for (const p of popups) { const a = clamp(Math.min(p.t / .2, (p.l - p.t) / .6), 0, 1); g.globalAlpha = a; g.fillStyle = p.c; g.font = `italic 700 ${p.size}px Lora, Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(150,40,110,.7)'; g.shadowBlur = 8; g.fillText(p.text, clamp(p.x, 110, BW - 110), sy(p.y)); g.shadowColor = 'transparent'; }
      g.globalAlpha = 1;
      g.translate(-ox, -oy);
      hud();
      if (state === 'over') over();
      if (!started) { g.fillStyle = 'rgba(30,12,70,.0)'; }
    }

    /* ---------- bucle ---------- */
    let raf = 0, last = performance.now(), closed = false;
    function loop(now) {
      if (closed) return;
      raf = requestAnimationFrame(loop);
      if (paused) return;
      let dt = (now - last) / 1000; last = now; dt = clamp(dt, 0, 1 / 30);
      step(dt); render();
    }
    function close() {
      if (closed) return; closed = true;
      cancelAnimationFrame(raf);
      clearInterval(musicTimer);
      try { if (AC) AC.close(); } catch (e) { /* */ }
      window.removeEventListener('resize', resize); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
      window.removeEventListener('deviceorientation', onTilt); document.removeEventListener('visibilitychange', vis);
      root.remove(); document.body.style.overflow = prevOverflow; running = null;
    }

    audioInit();
    reset(); sfx.jump();
    popup('¡Feliz cumpleaños, Constanza!', BW / 2, 330, '#fff', 24);
    raf = requestAnimationFrame(loop);
    // pide permiso de inclinación en iPhone solo si existe; si no, se juega con el dedo
    try { if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') { /* se omite: el control con el dedo es suficiente y evita pedir permisos */ } } catch (e) { /* */ }
    return { close };
  }
})();
