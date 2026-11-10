/* Al Día 7.5 — Tiempo real. Los cambios llegan y se guardan al instante:
   · el servidor sube un número de revisión cada vez que algo te afecta (Salón, mensajes, tus datos, biblioteca);
   · cada dispositivo lo vigila con una conexión larga y sincroniza en cuanto cambia;
   · lo que haces se envía en el acto (sin esperas) y, si no hay internet, se reintenta solo. */
'use strict';
const LIVE = { rev: '', lob: null, on: false, fails: 0, ctrl: null, live: false, lastMsg: 0 };

function liveActive() { return !!(Object.keys(tokens()).length) && navigator.onLine; }

async function liveLoop() {
  if (LIVE.on) return; LIVE.on = true;
  while (true) {
    if (document.visibilityState !== 'visible' || !liveActive()) { LIVE.live = false; liveBadge(); await new Promise((r) => setTimeout(r, 1500)); continue; }
    try {
      LIVE.ctrl = new AbortController();
      const kill = setTimeout(() => LIVE.ctrl.abort(), 14000);
      const q = `kind=watch&since=${encodeURIComponent(LIVE.rev)}${LIVE.lob !== null ? `&lob=${encodeURIComponent(LIVE.lob)}` : ''}`;
      const r = await fetch(`/api/sync?${q}`, { headers: { 'x-aldia-tokens': JSON.stringify(tokens()) }, cache: 'no-store', signal: LIVE.ctrl.signal });
      clearTimeout(kill);
      if (!r.ok) throw new Error('watch ' + r.status);
      const j = await r.json();
      LIVE.fails = 0; if (!LIVE.live) { LIVE.live = true; liveBadge(); }
      const first = !LIVE.rev;
      LIVE.rev = j.rev;
      const lobChanged = LIVE.lob !== null && j.lob !== LIVE.lob;
      LIVE.lob = lobWanted() ? j.lob : null;
      if (j.changed || first) { LIVE.lastMsg = Date.now(); liveSync(); clearTimeout(LIVE.t2); LIVE.t2 = setTimeout(liveSync, 1500); }
      if (lobChanged && typeof lobbyFetch === 'function') lobbyFetch();
    } catch (e) {
      if (e && e.name === 'AbortError') { await new Promise((r) => setTimeout(r, 250)); continue; }
      LIVE.fails++; LIVE.live = false; liveBadge();
      await new Promise((r) => setTimeout(r, Math.min(8000, 800 * LIVE.fails)));
    }
  }
}
const lobWanted = () => !!document.getElementById('lobBox');
async function liveSync() {
  if (CLOUD.busy) { CLOUD.again = true; return; }
  await cloudSync();
}
function liveBadge() {
  const el = document.getElementById('liveDot'); if (el) el.dataset.on = LIVE.live ? '1' : '0';
}
function liveKick() { try { LIVE.ctrl && LIVE.ctrl.abort(); } catch { /* */ } }

/* Guardado inmediato al salir de la app o cerrar la pestaña */
function liveFlush() {
  try {
    const p = typeof dataOwner === 'function' ? dataOwner() : null;
    if (!p || !isDirty(p) || !tokens()[p]) return;
    const data = JSON.parse(JSON.stringify(S)); delete data.timer;
    const body = JSON.stringify({ kind: 'profile', profile: p, device: CLOUD.device, data });
    if (body.length > 60000) { cloudSync(); return; }
    fetch('/api/sync', { method: 'PUT', keepalive: true, headers: { 'content-type': 'application/json', 'x-aldia-tokens': JSON.stringify(tokens()) }, body }).catch(() => {});
  } catch { /* */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') liveFlush(); else liveKick(); });
window.addEventListener('pagehide', liveFlush);
window.addEventListener('online', () => { liveKick(); cloudSync(); });

/* Mientras escribes, no se repinta la pantalla; al terminar se pone al día */
function softRender() {
  const a = document.activeElement; const typing = a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.closest('main');
  if (sheet().open || typing) { CLOUD.stale = true; return false; }
  CLOUD.stale = false; render(); return true;
}
function staleCheck() { if (CLOUD.stale && !sheet().open && !choosing) setTimeout(() => { const a = document.activeElement; if (!(a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) && a.closest('main'))) softRender(); }, 60); }
document.addEventListener('focusout', staleCheck);
document.addEventListener('DOMContentLoaded', () => { const d = document.getElementById('sheet'); if (d) d.addEventListener('close', staleCheck); });
