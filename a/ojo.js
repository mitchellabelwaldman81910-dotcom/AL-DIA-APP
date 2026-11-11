/* Ojo realista que reacciona + mensajes del administrador que "caen" de la barra */
let _eyeN = 0;
function eyeSVG() {
  const n = ++_eyeN, g = `e3g${n}`;
  return `<svg viewBox="0 -8 64 56" class="eye2 eye3" aria-hidden="true"><defs>
    <radialGradient id="${g}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="var(--e3-i1)"/><stop offset="1" stop-color="var(--e3-i2)"/></radialGradient></defs>
    <circle class="e3-halo" cx="32" cy="20" r="20"/>
    <g class="e3-body">
      <path class="e3-white" d="M5 20 Q32 -6 59 20 Q32 46 5 20Z"/>
      <g class="e2-gaze"><circle cx="32" cy="20" r="11" fill="url(#${g})"/>
        <circle class="e2-pupil" cx="32" cy="20" r="5.2"/>
        <circle class="e3-hi" cx="28" cy="15.5" r="3"/><circle class="e3-hi2" cx="36" cy="24" r="1.3"/></g>
      <path class="e3-line" d="M5 20 Q32 -6 59 20 Q32 46 5 20Z"/>
    </g>
    <g class="e3-lash"><path d="M17 8.5 L14 3.5"/><path d="M32 3.6 L32 -2.2"/><path d="M47 8.5 L50 3.5"/></g></svg>`;
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

/* ---------- En vivo: ojo y mensajes llegan en ~3 segundos ---------- */
const OJOLIVE = { busy: false, t: null, shown: [], since: 0 };
const amSeenKey = () => 'aldia:am:' + REG.me;
function amRecvBox() {
  let box = document.getElementById('amRecv');
  if (!box) { box = document.createElement('div'); box.id = 'amRecv'; box.className = 'adm-bubbles am-recv'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
  box.classList.toggle('under-eye', !!document.getElementById('eye'));
  return box;
}
function amReceive(msgs) {
  if (!msgs.length) return;
  const box = amRecvBox();
  msgs.forEach((m) => {
    if (box.querySelector(`[data-id="${m.id}"]`)) return;
    const before = new Map([...box.children].map((c) => [c, c.getBoundingClientRect().top]));
    const el = document.createElement('button'); el.type = 'button'; el.className = 'am-bub'; el.dataset.id = m.id;
    el.innerHTML = `${esc(m.text)}<small>${esc(m.fromName || 'Administración')} · ${esc(amTime(m.at))} · toca para cerrar</small>`;
    el.addEventListener('click', () => { el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-12px) scale(.9)' }], { duration: 260 }).onfinish = () => el.remove(); });
    box.insertBefore(el, box.firstChild);
    before.forEach((t0, c) => { const dy = t0 - c.getBoundingClientRect().top; if (Math.abs(dy) > 1) c.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.3,1.35,.5,1)' }); });
    el.animate([{ transform: 'translateY(-34px) scale(.55,.2)', opacity: 0 }, { transform: 'translateY(6px) scale(1.04,.96)', opacity: 1, offset: .65 }, { transform: 'none', opacity: 1 }], { duration: 560, easing: 'cubic-bezier(.3,.9,.4,1)' });
    setTimeout(() => { if (el.isConnected) el.click(); }, 120000);
  });
  [...box.children].slice(5).forEach((c) => c.remove());
  const last = Math.max(...msgs.map((m) => m.at)); OJOLIVE.since = Math.max(OJOLIVE.since, last);
  try { localStorage.setItem(amSeenKey(), String(OJOLIVE.since)); } catch { /* */ }
  eyeReact('talk');
  if (Snd.on()) Snd.bell(660, 0, 1, 0.05);
  if (navigator.vibrate) try { navigator.vibrate(30); } catch { /* */ }
}
async function liveTick() {
  clearTimeout(OJOLIVE.t);
  const mine = REG.me && REG.current === REG.me && !choosing;
  if (mine && !OJOLIVE.busy && document.visibilityState === 'visible') {
    OJOLIVE.busy = true;
    if (!OJOLIVE.since) { try { OJOLIVE.since = +localStorage.getItem(amSeenKey()) || 0; } catch { /* */ } if (!OJOLIVE.since) OJOLIVE.since = Date.now() - 86400000; }
    try {
      const r = await cloudFetch('GET', null, `kind=live&me=${encodeURIComponent(REG.me)}&since=${OJOLIVE.since}`);
      if (REG.me && REG.current === REG.me) { showPresence(r.presence || []); amReceive((r.msgs || []).filter((m) => m.at > OJOLIVE.since).sort((x, y) => x.at - y.at)); }
    } catch (e) { /* sin red: lo intenta de nuevo */ }
    OJOLIVE.busy = false;
    const rb = document.getElementById('amRecv'); if (rb) rb.classList.toggle('under-eye', !!document.getElementById('eye'));
  }
  OJOLIVE.t = setTimeout(liveTick, mine ? 3000 : 6000);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') liveTick(); });
setTimeout(liveTick, 1200);

/* Administrador: avisa más seguido que está mirando, y avisa al salir */
const ADMLIVE = { viewing: null };
setInterval(() => {
  const on = REG.current && isAdminView() && REG.me && REG.current !== REG.me ? REG.current : null;
  if (on && on !== ADMLIVE.viewing) cloudFetch('POST', { kind: 'presence', viewer: REG.me, viewing: on, name: profile(REG.me)?.name || '' }).catch(() => {});
  if (ADMLIVE.viewing && ADMLIVE.viewing !== on) { const v = ADMLIVE.viewing; cloudFetch('POST', { kind: 'presence', viewer: REG.me, viewing: v, leave: true }).catch(() => {}); }
  ADMLIVE.viewing = on;
}, 500);
setInterval(() => {
  if (!ADMLIVE.viewing || document.visibilityState !== 'visible') return;
  cloudFetch('POST', { kind: 'presence', viewer: REG.me, viewing: ADMLIVE.viewing, name: profile(REG.me)?.name || '' }).catch(() => {});
}, 5000);
window.addEventListener('pagehide', () => { if (ADMLIVE.viewing) try { cloudFetch('POST', { kind: 'presence', viewer: REG.me, viewing: ADMLIVE.viewing, leave: true }); } catch { /* */ } });
