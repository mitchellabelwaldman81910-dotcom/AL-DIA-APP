/* Ojo vigía (sin corazón) + mensajes del administrador a la cuenta que revisa */
let _eyeN = 0;
function eyeSVG() {
  const id = 'eyc' + (++_eyeN);
  let ticks = ''; for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; ticks += `<line x1="${(32 + Math.cos(a) * 9).toFixed(1)}" y1="${(20 + Math.sin(a) * 9).toFixed(1)}" x2="${(32 + Math.cos(a) * 12).toFixed(1)}" y2="${(20 + Math.sin(a) * 12).toFixed(1)}"/>`; }
  return `<svg viewBox="0 0 64 40" class="eye2" aria-hidden="true"><defs><clipPath id="${id}"><path d="M3 20 C15 3 49 3 61 20 C49 37 15 37 3 20Z"/></clipPath></defs>
    <path class="e2-rim" d="M3 20 C15 3 49 3 61 20 C49 37 15 37 3 20Z"/>
    <g clip-path="url(#${id})"><g class="e2-look"><circle class="e2-iris" cx="32" cy="20" r="13"/><g class="e2-ticks">${ticks}</g><circle class="e2-ring" cx="32" cy="20" r="8"/><circle class="e2-pupil" cx="32" cy="20" r="4.2"/><circle class="e2-glint" cx="34" cy="18" r="1.3"/></g>
    <rect class="e2-scan" x="0" y="0" width="5" height="40"/><rect class="e2-lid" x="0" y="0" width="64" height="40"/></g></svg>`;
}
{
  const baseShow = showPresence;
  showPresence = function (list) {
    baseShow(list);
    const old = document.querySelector('#eye .eye-svg'); if (old) old.outerHTML = eyeSVG();
  };
  setInterval(() => { const old = document.querySelector('#admBanner .eye-svg'); if (old) old.outerHTML = eyeSVG(); }, 500);
}

/* ---------- Administrador: escribir a la cuenta que está revisando ---------- */
const AMSG = { lists: {}, open: true };
const amId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const amTime = (ms) => new Date(ms).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
function amListHTML(to) {
  const l = AMSG.lists[to] || [];
  return l.length ? l.map((m) => `<div class="am-msg"><p>${esc(m.text)}</p><small>${m.pending ? 'Enviando…' : esc(amTime(m.at))}${m.failed ? ' · no se envió' : ''}</small></div>`).join('') : '<p class="am-empty">Aún no le has escrito. Lo que mandes aparece aquí.</p>';
}
async function amLoad(to) {
  try { const r = await cloudFetch('GET', null, 'kind=amsg&to=' + encodeURIComponent(to)); const keep = (AMSG.lists[to] || []).filter((m) => m.pending || m.failed); AMSG.lists[to] = [...(r.msgs || []), ...keep]; amPaint(to); } catch (e) { /* sin red */ }
}
function amPaint(to) {
  const box = document.getElementById('amList'); if (!box || box.dataset.to !== to) return;
  const stick = box.scrollTop + box.clientHeight >= box.scrollHeight - 30;
  box.innerHTML = amListHTML(to); if (stick) box.scrollTop = box.scrollHeight;
}
async function amSend(to, text) {
  text = (text || '').trim(); if (!text) return;
  const m = { id: amId(), text, at: Date.now(), pending: true };
  (AMSG.lists[to] ||= []).push(m); amPaint(to);
  try { const r = await cloudFetch('POST', { kind: 'adminmsg', to, id: m.id, text }); m.pending = false; m.at = r.at || m.at; }
  catch (e) { m.pending = false; m.failed = true; toast(e.message || 'No se pudo enviar.'); }
  amPaint(to);
}
function amChatEl() {
  const on = !!(REG.current && isAdminView() && REG.me && REG.current !== REG.me);
  let el = document.getElementById('admChat');
  if (!on) { if (el) el.remove(); return; }
  const to = REG.current;
  if (!el || el.dataset.to !== to) {
    el?.remove();
    el = document.createElement('div'); el.id = 'admChat'; el.dataset.to = to; el.className = 'adm-chat' + (AMSG.open ? '' : ' shut');
    const nm = (profile(to) || {}).name || to;
    el.innerHTML = `<button type="button" class="am-head" id="amToggle" aria-expanded="${AMSG.open}"><b>Mensajes para ${esc(nm)}</b><span>${AMSG.open ? 'Ocultar' : 'Abrir'}</span></button>
      <div class="am-body"><div class="am-list" id="amList" data-to="${esc(to)}"></div>
      <form class="am-form" id="amForm"><input class="input" id="amIn" maxlength="1000" placeholder="Escríbele algo…" autocomplete="off" enterkeyhint="send"><button class="btn primary" type="submit">Enviar</button></form></div>`;
    document.body.appendChild(el);
    el.querySelector('#amToggle').addEventListener('click', () => { AMSG.open = !AMSG.open; el.classList.toggle('shut', !AMSG.open); el.querySelector('#amToggle span').textContent = AMSG.open ? 'Ocultar' : 'Abrir'; el.querySelector('#amToggle').setAttribute('aria-expanded', AMSG.open); });
    el.querySelector('#amForm').addEventListener('submit', (e) => { e.preventDefault(); const i = el.querySelector('#amIn'); const t = i.value; i.value = ''; amSend(to, t); });
    amPaint(to); amLoad(to);
  }
}
setInterval(amChatEl, 700);
setInterval(() => { const el = document.getElementById('admChat'); if (el && document.visibilityState === 'visible') amLoad(el.dataset.to); }, 8000);
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
