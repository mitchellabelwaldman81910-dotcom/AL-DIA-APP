/* Sugerencias (7.52): cualquier cuenta escribe al administrador; solo él ve la bandeja */
const SG = { cat: 'idea', data: null, loading: false, busy: false, err: '', reply: null, sent: false };
const SG_CATS = [['idea', 'Idea nueva'], ['juego', 'Juego'], ['mejora', 'Mejora'], ['error', 'Algo falla'], ['otro', 'Otra cosa']];
const sgCat = (c) => (SG_CATS.find((x) => x[0] === c) || SG_CATS[4])[1];
const sgWhen = (ms) => { const d = new Date(ms); return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' }); };
const sgId = () => (Math.random().toString(36).slice(2, 8) + Date.now().toString(36)).slice(0, 14);
const sgIsAdmin = () => typeof isAdminSession === 'function' && isAdminSession();
function sgLoad(force) {
  if (SG.loading || (SG.data && !force)) return;
  if (!REG.me || !tokens()[REG.me]) return;
  SG.loading = true;
  cloudFetch('GET', null, `kind=suggestions&p=${encodeURIComponent(REG.me)}`).then((r) => { SG.data = r.list || []; SG.err = ''; }).catch((e) => { SG.data = SG.data || []; SG.err = e.message || 'No se pudo cargar'; }).finally(() => { SG.loading = false; if ((location.hash || '').startsWith('#/sugerencias')) render(); });
}
function viewSugerencias() {
  const back = `<a class="back" href="#/mas">${icon('back')}Más</a>`;
  if (!REG.me || !tokens()[REG.me]) return `${back}<div class="empty" style="margin-top:20px"><h3>Entra con tu usuario</h3><p>Para mandar sugerencias necesitas haber iniciado sesión.</p></div>`;
  sgLoad();
  const list = SG.data || [];
  if (sgIsAdmin()) {
    const open = list.filter((x) => !x.done).length;
    const items = list.map((x) => `<li class="sg-item${x.done ? ' sg-done' : ''}"><div class="sg-head"><b>${esc(x.name)}</b><span class="sl-chip">${esc(sgCat(x.cat))}</span><span class="tiny faint">@${esc(x.by)} · ${esc(sgWhen(x.at))}</span></div>
      <p class="sg-text">${esc(x.text)}</p>
      ${SG.reply === x.id ? `<div class="sg-reply"><textarea class="input" id="sgReplyIn" rows="2" maxlength="1000" placeholder="Responder a ${esc(x.name)}…"></textarea><div class="btn-row"><button class="btn primary" data-act="sg-reply-send" data-id="${x.id}" data-to="${esc(x.by)}">Enviar</button><button class="btn" data-act="sg-reply" data-id="">Cancelar</button></div></div>` : ''}
      <div class="sg-acts"><button class="link-btn" data-act="sg-done" data-id="${x.id}">${x.done ? 'Reabrir' : 'Marcar hecha'}</button><button class="link-btn" data-act="sg-reply" data-id="${x.id}">Responder</button><button class="link-btn" data-act="sg-del" data-id="${x.id}">Borrar</button></div></li>`).join('');
    return `<div class="sg-page">${back}<h1 class="h1">Sugerencias</h1><p class="sub">${SG.loading && !SG.data ? 'Cargando…' : `${plural(open, 'pendiente', 'pendientes')} de ${plural(list.length, 'sugerencia', 'sugerencias')}. Solo tú ves esta bandeja.`}</p>
      ${SG.err ? `<p class="tiny" style="color:var(--bad,#b3261e)">${esc(SG.err)}</p>` : ''}
      <ul class="sg-list">${items || (SG.loading ? '' : '<li class="empty"><p>Todavía no hay sugerencias.</p></li>')}</ul><div class="btn-row"><button class="btn" data-act="sg-refresh">Actualizar</button></div></div>`;
  }
  const chips = SG_CATS.map(([v, l]) => `<button type="button" class="gb-chip" data-act="sg-cat" data-v="${v}" aria-pressed="${SG.cat === v}">${l}</button>`).join('');
  const mine = list.map((x) => `<li class="sg-item${x.done ? ' sg-done' : ''}"><div class="sg-head"><span class="sl-chip">${esc(sgCat(x.cat))}</span><span class="tiny faint">${esc(sgWhen(x.at))}${x.done ? ' · Ya se atendió' : ''}</span></div><p class="sg-text">${esc(x.text)}</p></li>`).join('');
  return `<div class="sg-page">${back}<h1 class="h1">Sugerencias</h1><p class="sub">Cuéntame todo lo que te gustaría que agregue o mejore en Cinnavia. Lo lee directamente el administrador.</p>
    ${SG.sent ? '<p class="sg-ok" role="status">Gracias, tu sugerencia llegó.</p>' : ''}
    <div class="field"><span class="lbl">Tipo</span><div class="gb-chips" role="group">${chips}</div></div>
    <div class="field"><label for="sgText">Tu sugerencia</label><textarea class="input" id="sgText" rows="6" maxlength="1500" placeholder="Por ejemplo: me gustaría que hubiera…">${esc(SG.draft || '')}</textarea><span class="hint" id="sgCount">${(SG.draft || '').length} / 1500</span></div>
    ${SG.err ? `<p class="tiny" style="color:var(--bad,#b3261e)">${esc(SG.err)}</p>` : ''}
    <div class="btn-row"><button class="btn primary" data-act="sg-send"${SG.busy ? ' disabled' : ''}>${SG.busy ? 'Enviando…' : 'Enviar sugerencia'}</button></div>
    ${mine ? `<h2 class="h2" style="margin-top:22px">Tus sugerencias</h2><ul class="sg-list">${mine}</ul>` : ''}</div>`;
}
EXTRA_VIEWS.sugerencias = viewSugerencias; EXTRA_NAV.sugerencias = 'mas'; GROUP_VIEWS.sugerencias = viewSugerencias; GROUP_NAV.sugerencias = 'mas';
const sgSaveDraft = () => { const t = document.getElementById('sgText'); if (t) SG.draft = t.value; };
document.addEventListener('input', (e) => { if (e.target && e.target.id === 'sgText') { SG.draft = e.target.value; const c = document.getElementById('sgCount'); if (c) c.textContent = `${e.target.value.length} / 1500`; } });
Object.assign(VIDA_ACTS, {
  'sg-cat': (el) => { sgSaveDraft(); SG.cat = el.dataset.v; render(); },
  'sg-send': async () => {
    sgSaveDraft(); const text = (SG.draft || '').trim();
    if (SG.busy) return;
    if (text.length < 5) { SG.err = 'Escribe un poco más para que pueda entenderte.'; SG.sent = false; render(); return; }
    if (!navigator.onLine) { SG.err = 'Sin internet. Tu texto se queda aquí; envíalo cuando vuelvas a tener conexión.'; render(); return; }
    SG.busy = true; SG.err = ''; render();
    try { SG.id = SG.id || sgId(); await cloudFetch('POST', { kind: 'suggest', as: REG.me, id: SG.id, cat: SG.cat, text }); SG.id = null; SG.draft = ''; SG.sent = true; SG.data = null; toast('Sugerencia enviada'); }
    catch (e) { SG.err = e.message || 'No se pudo enviar. Intenta otra vez.'; SG.sent = false; }
    SG.busy = false; render();
  },
  'sg-refresh': () => { sgLoad.call(null); SG.data = null; sgLoad(); render(); },
  'sg-done': async (el) => { try { await cloudFetch('POST', { kind: 'sugadmin', as: REG.me, id: el.dataset.id, action: 'done' }); SG.data = null; render(); } catch (e) { toast(e.message); } },
  'sg-del': async (el) => { if (!confirm('¿Borrar esta sugerencia? No se puede deshacer.')) return; try { await cloudFetch('POST', { kind: 'sugadmin', as: REG.me, id: el.dataset.id, action: 'delete' }); SG.data = null; render(); } catch (e) { toast(e.message); } },
  'sg-reply': (el) => { SG.reply = el.dataset.id || null; render(); },
  'sg-reply-send': async (el) => {
    const t = (document.getElementById('sgReplyIn') || {}).value || ''; if (!t.trim()) return;
    try { await cloudFetch('POST', { kind: 'adminmsg', as: REG.me, to: el.dataset.to, id: sgId(), text: t.trim() }); SG.reply = null; toast('Respuesta enviada'); render(); } catch (e) { toast(e.message); }
  },
});
{
  const card = `<ul class="rows" style="margin-bottom:14px"><li><a href="#/sugerencias"><span class="ico">${icon('idea')}</span><span class="txt"><b>Sugerencias</b><span>${'Dile al administrador qué te gustaría que agregue'}</span></span>${icon('chev', 'chev')}</a></li></ul>`;
  const wrap = (fn) => function () { const h = fn.apply(this, arguments); const i = h.indexOf('<ul class="rows"'); return i < 0 ? h + card : h.slice(0, i) + card + h.slice(i); };
  viewMas = wrap(viewMas); if (typeof viewMasGrupo === 'function') viewMasGrupo = wrap(viewMasGrupo);
}
