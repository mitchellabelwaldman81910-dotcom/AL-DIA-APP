/* Cinnavia 7.18 — Hojas compartidas de la Libreta.
   Una hoja puede compartirse con amigos: todos la ven y la editan, y cada cambio se guarda en la nube.
   Cada quien conserva su copia local; la nube es la única fuente cuando la hoja está compartida.
   Si dos personas guardan a la vez, la versión que llega tarde se guarda como copia aparte (nunca se pierde nada). */
const SHP = { sig: '', busy: false };

const shpDoc = (p) => ({ kind: p.kind, title: p.title || '', text: p.text || '', items: (p.items || []).map((i) => ({ t: i.t, done: !!i.done })), link: p.link || '', tone: p.tone || 'papel', sticker: p.sticker || '' });
const shpCanShare = (p) => p && p.kind !== 'foto';
function shpNeedLogin() { if (!REG.me || !tokens()[REG.me]) { toast('Inicia sesión con tu cuenta (con internet) para compartir.'); return true; } return false; }
function shpNewId() { return 'pg' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
const shpPageOf = (id) => (S.pages || []).find((x) => x.id === id);

async function shpShare(p) {
  if (shpNeedLogin()) return;
  if (!shpCanShare(p)) { toast('Las fotos todavía no se pueden compartir. Comparte una hoja de texto o lista.'); return; }
  try {
    const r = await cloudFetch('POST', { kind: 'shpshare', as: REG.me, doc: shpDoc(p) });
    commit((s) => { const q = (s.pages || []).find((x) => x.id === p.id); if (q) { q.shared = r.id; q.sv = r.v; q.sharedFrom = ''; q.isOwner = true; } });
    toast('Hoja compartida. Ahora invita a un amigo.');
    shpOpen(shpPageOf(p.id) || p);
  } catch (x) { toast(/fetch|network|Failed/i.test(x.message) ? 'Necesitas internet para compartir la hoja.' : x.message); }
}

async function shpPush(p) {
  if (!p || !p.shared || shpNeedLogin()) return;
  try {
    const r = await cloudFetch('POST', { kind: 'shpsave', as: REG.me, id: p.shared, base: p.sv || 0, doc: shpDoc(p) });
    commit((s) => { const q = (s.pages || []).find((x) => x.id === p.id); if (q) q.sv = r.v; });
  } catch (x) {
    if (x.status === 409) {
      // Alguien guardó antes: tu versión queda como copia aparte y se muestra la más reciente.
      const copy = { ...p, id: shpNewId(), shared: null, sv: 0, title: (p.title || 'Hoja') + ' (tu versión)', updated: Date.now() };
      commit((s) => { s.pages ||= []; s.pages.push(copy); });
      await shpSync(true);
      toast('Alguien cambió la hoja al mismo tiempo. Tu versión quedó como copia aparte.');
    } else toast(/fetch|network|Failed/i.test(x.message) ? 'Sin internet: tus cambios se guardaron aquí y se subirán después.' : x.message);
  }
}

async function shpSync(force = false) {
  if (SHP.busy || !REG.me || !tokens()[REG.me] || !navigator.onLine) return;
  SHP.busy = true;
  try {
    const r = await cloudFetch('POST', { kind: 'shplist', as: REG.me });
    const remote = r.shared || [];
    const sig = remote.map((x) => `${x.id}:${x.v}:${x.members.length}`).join('|') + '#' + (S.pages || []).filter((p) => p.shared).map((p) => p.shared).join(',');
    if (!force && sig === SHP.sig) return;
    SHP.sig = sig;
    commit((s) => {
      s.pages ||= [];
      for (const sh of remote) {
        const owner = sh.members.find((m) => m.id === sh.owner);
        let p = s.pages.find((x) => x.shared === sh.id);
        if (!p) { p = { id: 'sh_' + sh.id, kind: sh.doc.kind, subjectId: null, at: Date.now(), updated: sh.at, img: [], items: [], sticker: '', frame: 'polaroid', filter: 'natural', shared: sh.id, sv: 0 }; s.pages.push(p); }
        if ((p.sv || 0) < sh.v) Object.assign(p, { kind: sh.doc.kind, title: sh.doc.title, text: sh.doc.text, items: sh.doc.items, link: sh.doc.link, tone: sh.doc.tone, sticker: sh.doc.sticker, sv: sh.v, updated: sh.at });
        p.isOwner = sh.owner === REG.me; p.sharedFrom = p.isOwner ? '' : (owner ? owner.name : 'otra persona');
        p.members = sh.members;
      }
      for (const p of s.pages) if (p.shared && !remote.some((x) => x.id === p.shared)) { p.shared = null; p.sv = 0; p.sharedFrom = ''; p.isOwner = false; }
    });
    const o = document.getElementById('lbRead');
    if (o && o.classList.contains('open') && LBR_ID) { const cur = shpPageOf(LBR_ID); if (cur) lbReadPage(cur); }
  } catch { /* sin internet: se reintenta */ } finally { SHP.busy = false; }
}

function shpOpen(p) {
  if (!p) return;
  const sid = p.shared;
  const friends = socOf().friends || [];
  const members = p.members || [];
  let body;
  if (!sid) {
    body = `<p class="muted">Comparte esta hoja con tus amigos. Podrán verla y editarla contigo; cada cambio se guarda en la nube.</p>
      <div class="btn-row" style="margin-top:14px"><button class="btn primary" data-act="shp-share" data-id="${p.id}">${icon('share', 'sm')}Compartir con amigos</button></div>`;
  } else {
    const inv = friends.filter((f) => !members.some((m) => m.id === f.id));
    body = `<div class="shp-mem">${members.map((m) => `<span class="shp-chip">${esc(m.name)}${m.id === REG.me ? ' · tú' : ''}</span>`).join('')}</div>
      <p class="small muted" style="margin:10px 0 12px">Todos los que estén aquí pueden editar. Hasta 6 personas.</p>
      <h3 class="shp-h">Invitar a un amigo</h3>
      ${inv.length ? `<ul class="rows">${inv.map((f) => `<li><button type="button" class="rowbtn" data-act="shp-invite" data-id="${sid}" data-to="${esc(f.id)}" data-name="${esc(f.name)}"><span class="txt"><b>${esc(f.name)}</b><span>Invitar a esta hoja</span></span>${icon('plus', 'sm')}</button></li>`).join('')}</ul>` : '<p class="small muted">No hay más amigos por invitar. Agrega amigos en Amistades.</p>'}
      <div class="btn-row" style="margin-top:16px"><button class="btn quiet danger" data-act="shp-leave" data-id="${p.id}">${p.isOwner ? 'Dejar de compartir' : 'Salir de la hoja'}</button></div>`;
  }
  openSheet(`${sheetHead(sid ? 'Hoja compartida' : 'Compartir hoja')}<div class="sheet-body">${body}</div>`);
}

Object.assign(VIDA_ACTS, {
  'shp-open': (el) => { const p = shpPageOf(el.dataset.id); if (p) shpOpen(p); },
  'shp-share': (el) => { const p = shpPageOf(el.dataset.id); if (p) shpShare(p); },
  'shp-invite': async (el) => {
    if (shpNeedLogin()) return;
    try {
      await cloudFetch('POST', { kind: 'shpinvite', as: REG.me, id: el.dataset.id, to: el.dataset.to, name: el.dataset.name });
      toast(`${el.dataset.name} ya puede editar esta hoja.`); Snd.chime();
      await shpSync(true);
      const p = (S.pages || []).find((x) => x.shared === el.dataset.id); if (p) shpOpen(p);
    } catch (x) { toast(x.message); }
  },
  'shp-leave': async (el) => {
    const p = shpPageOf(el.dataset.id); if (!p) return;
    const owner = !!p.isOwner;
    const ok = await ask({ title: owner ? '¿Dejar de compartir esta hoja?' : '¿Salir de esta hoja?', text: owner ? 'La hoja deja de estar compartida para todos. Cada quien conserva su copia.' : 'Tu copia se queda contigo; ya no recibirás cambios.', ok: owner ? 'Dejar de compartir' : 'Salir', danger: true });
    if (!ok) return;
    try {
      await cloudFetch('POST', { kind: 'shpleave', as: REG.me, id: p.shared, remove: owner });
      commit((s) => { const q = (s.pages || []).find((x) => x.id === p.id); if (q) { q.shared = null; q.sv = 0; q.sharedFrom = ''; q.members = []; q.isOwner = false; } });
      closeSheet(false); toast(owner ? 'La hoja ya no está compartida.' : 'Saliste de la hoja.');
    } catch (x) { toast(x.message); }
  },
  'shp-note': (el) => { const n = S.notes.find((x) => x.id === el.dataset.id); if (!n) return; const p = { id: shpNewId(), kind: 'nota', title: n.title || 'Apunte', text: htmlText(n.body || '').trim(), tone: 'papel', at: Date.now(), updated: Date.now(), subjectId: n.subjectId || null, img: [], items: [], sticker: '', frame: 'polaroid', filter: 'natural' }; commit((s) => { s.pages ||= []; s.pages.push(p); }); shpShare(p); },
});

setTimeout(() => shpSync(true), 2500);
setInterval(() => { if (!document.hidden) shpSync(); }, 6000);
addEventListener('online', () => shpSync(true));
