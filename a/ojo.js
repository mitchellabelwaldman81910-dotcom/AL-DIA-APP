/* Ojo realista que reacciona + mensajes del administrador que "caen" de la barra */
let _eyeN = 0;
function eyeSVG() {
  const n = ++_eyeN, id = (k) => `e2${k}${n}`;
  const P = (t) => { const u = 1 - t; return [u*u*u*3 + 3*u*u*t*15 + 3*u*t*t*49 + t*t*t*61, u*u*u*20 + 3*u*u*t*3 + 3*u*t*t*3 + t*t*t*20]; };
  const D = (t) => { const u = 1 - t; return [3*u*u*(15-3) + 6*u*t*(49-15) + 3*t*t*(61-49), 3*u*u*(3-20) + 6*u*t*(3-3) + 3*t*t*(20-3)]; };
  let lashes = '';
  for (let k = 0; k < 9; k++) {
    const t = 0.1 + k * 0.1; const [x, y] = P(t); const [dx, dy] = D(t); const L = Math.hypot(dx, dy) || 1;
    let nx = dy / L, ny = -dx / L; if (ny > 0) { nx = -nx; ny = -ny; }
    const len = 3.2 + Math.sin(k * 1.7) * 0.8 + (k > 5 ? 1 : 0);
    const ex = x + nx * len + (t > .5 ? 1.2 : -1.2) * 0.6, ey = y + ny * len;
    lashes += `<path d="M${x.toFixed(1)} ${y.toFixed(1)} Q${(x + nx * len * .5 + (t > .5 ? .9 : -.9)).toFixed(1)} ${(y + ny * len * .6).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}"/>`;
  }
  let fib = '';
  for (let k = 0; k < 9; k++) { const a = (k * 40 + (k % 3) * 9) * Math.PI / 180, r1 = 5.6 + (k % 2), r2 = 10.2 + (k % 3) * 0.6; fib += `<path d="M${(32 + Math.cos(a) * r1).toFixed(1)} ${(20 + Math.sin(a) * r1).toFixed(1)} L${(32 + Math.cos(a + .08) * r2).toFixed(1)} ${(20 + Math.sin(a + .08) * r2).toFixed(1)}" stroke="${k % 2 ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.22)'}"/>`; }
  const alm = 'M3 20 C15 3 49 3 61 20 C49 37 15 37 3 20Z';
  return `<svg viewBox="0 -4 64 46" class="eye2" aria-hidden="true"><defs>
    <clipPath id="${id('c')}"><path d="${alm}"/></clipPath>
    <radialGradient id="${id('s')}" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#fbf8f4"/><stop offset=".7" stop-color="#efe6dd"/><stop offset="1" stop-color="#c9b5a8"/></radialGradient>
    <radialGradient id="${id('i')}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#d8c066"/><stop offset=".38" stop-color="#7fa653"/><stop offset=".78" stop-color="#2f6040"/><stop offset="1" stop-color="#10251a"/></radialGradient>
    <linearGradient id="${id('t')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".45" stop-color="#000" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id('l')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7a688"/><stop offset="1" stop-color="#b57f64"/></linearGradient></defs>
    <g class="e2-lashes" fill="none" stroke="#0e1a13" stroke-width="1.15" stroke-linecap="round">${lashes}</g>
    <g clip-path="url(#${id('c')})"><rect x="0" y="0" width="64" height="40" fill="url(#${id('s')})"/>
      <ellipse cx="5" cy="20.5" rx="2.6" ry="3" fill="#e0958e"/>
      <g class="e2-gaze"><circle cx="32" cy="20" r="12.2" fill="url(#${id('i')})"/><g fill="none" stroke-width=".7" stroke-linecap="round">${fib}</g>
        <circle cx="32" cy="20" r="12.2" fill="none" stroke="#0b1710" stroke-width="1.6"/>
        <circle class="e2-pupil" cx="32" cy="20" r="4.7" fill="#050807"/>
        <ellipse cx="27.6" cy="15" rx="2.9" ry="1.9" fill="#fff" opacity=".88" transform="rotate(-28 27.6 15)"/><circle cx="36.6" cy="24.4" r="1.05" fill="#fff" opacity=".5"/></g>
      <rect x="0" y="0" width="64" height="40" fill="url(#${id('t')})"/>
      <rect class="e2-lid" x="-2" y="-6" width="68" height="50" fill="url(#${id('l')})"/>
    </g>
    <path d="${alm}" fill="none" stroke="#6d4636" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M6 16 C17 -1 47 -1 58 16" fill="none" stroke="#9b6c55" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></svg>`;
}
/* movimiento: mira a su alrededor, parpadea, y reacciona */
const EYE = { gx: 0, gy: 0, hold: 0, dil: 1, until: 0 };
function eyeEls() { return document.querySelectorAll('.eye2'); }
function eyeSet(vars) { eyeEls().forEach((e) => { for (const k in vars) e.style.setProperty(k, vars[k]); }); }
function eyeBlink(double) {
  eyeSet({ '--lid': 1 });
  setTimeout(() => { eyeSet({ '--lid': EYE.squint || 0 }); if (double) setTimeout(() => { eyeSet({ '--lid': 1 }); setTimeout(() => eyeSet({ '--lid': EYE.squint || 0 }), 110); }, 150); }, 120);
}
function eyeLook(x, y, ms) { EYE.gx = x; EYE.gy = y; EYE.hold = Date.now() + (ms || 0); eyeSet({ '--gx': x + 'px', '--gy': y + 'px' }); }
function eyeReact(kind) {
  if (kind === 'talk') { eyeLook(0, 4.2, 1600); eyeSet({ '--dil': 1.35 }); EYE.squint = 0.16; eyeSet({ '--lid': 0.16 }); setTimeout(() => { EYE.squint = 0; eyeSet({ '--dil': 1, '--lid': 0 }); }, 1500); setTimeout(() => eyeBlink(), 1650); }
  else if (kind === 'wake') { eyeSet({ '--lid': 1 }); setTimeout(() => eyeSet({ '--lid': 0, '--dil': 1.4 }), 160); setTimeout(() => eyeSet({ '--dil': 1 }), 1100); eyeLook(0, 0, 1200); }
  else if (kind === 'poke') { eyeBlink(true); eyeSet({ '--dil': 1.5 }); setTimeout(() => eyeSet({ '--dil': 1 }), 700); }
}
setInterval(() => { if (!eyeEls().length) return; if (Date.now() < EYE.hold) return; const r = Math.random(); if (r < 0.28) eyeLook(0, 0, 0); else eyeLook(Math.round((Math.random() * 2 - 1) * 6.5), Math.round((Math.random() * 2 - 1) * 2.6), 0); }, 1700);
(function blinkLoop() { setTimeout(() => { if (eyeEls().length && !EYE.squint) eyeBlink(Math.random() < 0.22); blinkLoop(); }, 2200 + Math.random() * 3800); })();
document.addEventListener('pointermove', (ev) => { const e = document.querySelector('.eye2'); if (!e) return; const r = e.getBoundingClientRect(); const dx = ev.clientX - (r.left + r.width / 2), dy = ev.clientY - (r.top + r.height / 2); const m = Math.hypot(dx, dy) || 1; const k = Math.min(1, m / 140); eyeLook(Math.round(dx / m * 6.5 * k), Math.round(dy / m * 2.8 * k), 1400); }, { passive: true });
document.addEventListener('pointerdown', (ev) => { if (ev.target.closest && ev.target.closest('.eye-pill, .adm-banner')) eyeReact('poke'); });
{
  const baseShow = showPresence;
  showPresence = function (list) {
    const had = !!document.getElementById('eye');
    baseShow(list);
    const old = document.querySelector('#eye .eye-svg'); if (old) { old.outerHTML = eyeSVG(); if (!had) setTimeout(() => eyeReact('wake'), 300); }
  };
  setInterval(() => { const old = document.querySelector('#admBanner .eye-svg'); if (old) { old.outerHTML = eyeSVG(); setTimeout(() => eyeReact('wake'), 200); } }, 500);
}

/* ---------- Administrador: escribir a la cuenta que está revisando ---------- */
const AMSG = { lists: {}, shown: new Set(), first: true };
const amId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const amTime = (ms) => new Date(ms).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
function amListHTML(to) {
  const l = AMSG.lists[to] || [];
  return l.length ? l.map((m) => `<div class="am-msg"><p>${esc(m.text)}</p><small>${m.pending ? 'Enviando…' : esc(amTime(m.at))}${m.failed ? ' · no se envió' : ''}</small></div>`).join('') : '<p class="am-empty">Aún no le has escrito. Lo que mandes aparece aquí.</p>';
}
function amPaint(to) {
  const box = document.getElementById('amList'); if (box && box.dataset.to === to) { const stick = box.scrollTop + box.clientHeight >= box.scrollHeight - 30; box.innerHTML = amListHTML(to); if (stick) box.scrollTop = box.scrollHeight; }
  amBubbles(to);
}
async function amLoad(to) {
  try { const r = await cloudFetch('GET', null, 'kind=amsg&to=' + encodeURIComponent(to)); const keep = (AMSG.lists[to] || []).filter((m) => m.pending || m.failed); AMSG.lists[to] = [...(r.msgs || []), ...keep]; amPaint(to); } catch (e) { /* sin red */ }
}
function bubbleHTML(m) { return `${esc(m.text)}<small>${m.pending ? 'Enviando…' : esc(amTime(m.at))}${m.failed ? ' · no se envió' : ''}</small>`; }
function amBubbles(to) {
  const box = document.getElementById('admBubbles'); if (!box || box.dataset.to !== to) return;
  const msgs = (AMSG.lists[to] || []).slice(-4).reverse();
  const before = new Map([...box.children].map((c) => [c.dataset.id, c.getBoundingClientRect().top]));
  const keepIds = new Set(msgs.map((m) => m.id));
  [...box.children].forEach((c) => { if (!keepIds.has(c.dataset.id)) c.remove(); });
  let prev = null; const fresh = [];
  msgs.forEach((m, idx) => {
    let el = box.querySelector(`[data-id="${m.id}"]`);
    if (!el) { el = document.createElement('div'); el.className = 'am-bub'; el.dataset.id = m.id; fresh.push(el); }
    el.innerHTML = bubbleHTML(m); el.style.opacity = m.pending ? '.7' : ''; el.classList.toggle('old', idx > 1);
    if (box.children[idx] !== el) box.insertBefore(el, box.children[idx] || null);
  });
  [...box.children].forEach((c) => { const t0 = before.get(c.dataset.id); if (t0 != null) { const dy = t0 - c.getBoundingClientRect().top; if (Math.abs(dy) > 1) c.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.3,1.35,.5,1)' }); } });
  const animate = !AMSG.first;
  fresh.forEach((el) => { AMSG.shown.add(el.dataset.id); if (animate) el.animate([{ transform: 'translateY(-34px) scale(.55,.2)', opacity: 0 }, { transform: 'translateY(6px) scale(1.04,.96)', opacity: 1, offset: .65 }, { transform: 'none', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.3,.9,.4,1)' }); });
  if (animate && fresh.length) { const bn = document.getElementById('admBanner'); if (bn) { bn.classList.remove('talk'); void bn.offsetWidth; bn.classList.add('talk'); } eyeReact('talk'); }
  AMSG.first = false;
}
async function amSend(to, text) {
  text = (text || '').trim(); if (!text) return;
  AMSG.first = false;
  const m = { id: amId(), text, at: Date.now(), pending: true };
  (AMSG.lists[to] ||= []).push(m); amPaint(to);
  try { const r = await cloudFetch('POST', { kind: 'adminmsg', to, id: m.id, text }); m.pending = false; m.at = r.at || m.at; }
  catch (e) { m.pending = false; m.failed = true; toast(e.message || 'No se pudo enviar.'); }
  amPaint(to);
}
function amChatEl() {
  const on = !!(REG.current && isAdminView() && REG.me && REG.current !== REG.me);
  let box = document.getElementById('admBubbles'), say = document.getElementById('admSay');
  if (!on) { box?.remove(); say?.remove(); AMSG.first = true; return; }
  const to = REG.current;
  if (!box || box.dataset.to !== to) {
    box?.remove(); say?.remove(); AMSG.first = true;
    box = document.createElement('div'); box.id = 'admBubbles'; box.className = 'adm-bubbles'; box.dataset.to = to; document.body.appendChild(box);
    say = document.createElement('form'); say.id = 'admSay'; say.className = 'adm-say';
    say.innerHTML = '<input id="amIn" maxlength="1000" placeholder="Escríbele algo…" autocomplete="off" enterkeyhint="send" aria-label="Mensaje"><button type="submit">Enviar</button>';
    say.addEventListener('submit', (e) => { e.preventDefault(); const i = say.querySelector('#amIn'); const t = i.value; i.value = ''; amSend(to, t); });
    document.body.appendChild(say);
    amLoad(to);
  }
}
setInterval(amChatEl, 700);
setInterval(() => { const el = document.getElementById('admBubbles'); if (el && document.visibilityState === 'visible') amLoad(el.dataset.to); }, 8000);
Object.assign(VIDA_ACTS, {
  'adm-msg': (el) => {
    const to = el.dataset.id; const nm = el.dataset.name || to;
    openSheet(`${sheetHead('Mensajes para ' + nm)}<div class="sheet-body"><div class="am-list am-sheet" id="amList" data-to="${esc(to)}"></div>
      <form class="am-form" id="amForm2"><input class="input" id="amIn2" maxlength="1000" placeholder="Escríbele algo…" autocomplete="off"><button class="btn primary" type="submit">Enviar</button></form></div>`);
    const f = document.getElementById('amForm2'); f.addEventListener('submit', (e) => { e.preventDefault(); const i = document.getElementById('amIn2'); const t = i.value; i.value = ''; amSend(to, t); });
    amPaint(to); amLoad(to);
  },
});

/* ---------- Persona: recibe el mensaje ---------- */
const amSeenKey = () => 'aldia:am:' + REG.me;
async function amCheck() {
  if (!REG.me || REG.current !== REG.me || choosing || document.visibilityState !== 'visible' || !cloudOn() || document.getElementById('amPop')) return;
  let last = 0; try { last = +localStorage.getItem(amSeenKey()) || 0; } catch { /* */ }
  let r; try { r = await cloudFetch('GET', null, 'kind=amsg&to=' + encodeURIComponent(REG.me)); } catch (e) { return; }
  const fresh = (r.msgs || []).filter((m) => m.at > last);
  if (!fresh.length) return;
  const el = document.createElement('div'); el.id = 'amPop'; el.className = 'am-pop'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-label', 'Mensaje de administración');
  el.innerHTML = `<b>Mensaje de ${esc(fresh[fresh.length - 1].fromName || 'administración')}</b>${fresh.map((m) => `<p>${esc(m.text)}</p>`).join('')}<button class="btn primary" type="button">Entendido</button>`;
  el.querySelector('button').addEventListener('click', () => { try { localStorage.setItem(amSeenKey(), String(fresh[fresh.length - 1].at)); } catch { /* */ } el.remove(); });
  document.body.appendChild(el);
  if (Snd.on()) Snd.bell(660, 0, 1, 0.05);
}
setInterval(amCheck, 15000); setTimeout(amCheck, 3500);
