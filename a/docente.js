/* Cinnavia 7.60 — Espacio del docente: desde su pizarrón infinito (Libretas) manda avisos, ideas y tareas a uno o varios
   Bosques sin entrar a ellos. Una tarjeta suelta o un marco completo (manda todo lo que contiene). */
'use strict';
const DN = { id: null, mode: 'aviso', pick: new Set(), due: '', time: '', subj: '' };
const DN_MODES = { aviso: ['Aviso', 'Se ve como nota destacada en el pizarrón del Bosque.'], idea: ['Idea', 'Se pone en el pizarrón del Bosque tal como está.'], tarea: ['Tarea', 'Llega a la lista de tareas del grupo con fecha y aviso.'] };
const dnCard = () => lzData().cards.find((x) => x.id === DN.id);
function dnCards(c) {
  if (c.k !== 'marco') return [c];
  const mid = (o) => [o.x + (o.w || 190) / 2, o.y + 30];
  return lzCards().filter((o) => { if (o.k === 'marco') return false; const [mx, my] = mid(o); return mx > c.x && mx < c.x + (c.w || 300) && my > c.y && my < c.y + (c.h || 220); }).sort((a, b) => a.y - b.y || a.x - b.x);
}
const dnText = (c) => c.k === 'todo' ? (c.items || []).map((i) => '• ' + i.t).join('\n') : c.k === 'enlace' ? [c.text, c.link].filter(Boolean).join('\n') : (c.text || '');
function dnTasks(cards, title) {
  const out = [];
  for (const c of cards) {
    if (c.k === 'todo') for (const it of c.items || []) { if (it.t) out.push({ title: it.t, desc: '' }); }
    else if (c.k === 'note' || c.k === 'titulo' || c.k === 'enlace') { const t = dnText(c).trim(); if (!t) continue; const [first, ...rest] = t.split('\n'); out.push({ title: first, desc: rest.join('\n').trim() }); }
  }
  if (title && out.length > 1 && false) out.unshift({ title, desc: '' });
  return out;
}
function dnSheet(id) {
  if (id) { DN.id = id; DN.pick = new Set(); DN.mode = 'aviso'; DN.due = addDays(today(), 1); DN.time = ''; DN.subj = ''; }
  const c = dnCard(); if (!c) return; const fs = myForests(); const kids = dnCards(c);
  const what = c.k === 'marco' ? `${plural(kids.length, 'tarjeta', 'tarjetas')} del marco «${esc(c.text || 'Grupo')}»` : `Tarjeta: ${esc(LZ_KINDS[c.k])}`;
  openSheet(`${sheetHead('Mandar a mis grupos')}<div class="sheet-body">
    <p class="tiny faint" style="margin:0 0 8px">${what}</p>
    <div class="field"><span class="lbl">¿Cómo se manda?</span><div class="dn-seg">${Object.entries(DN_MODES).map(([k, v]) => `<button type="button" class="chip${DN.mode === k ? ' on' : ''}" data-act="dn-mode" data-v="${k}" aria-pressed="${DN.mode === k}">${v[0]}</button>`).join('')}</div><p class="tiny faint" style="margin:6px 0 0">${DN_MODES[DN.mode][1]}</p></div>
    ${DN.mode === 'tarea' ? `<div class="cm-two"><div class="field"><label for="dnDue">Entrega</label><input id="dnDue" type="date" class="input" value="${esc(DN.due)}"></div><div class="field"><label for="dnTime">Hora</label><input id="dnTime" type="time" class="input" value="${esc(DN.time)}"></div></div>
      <div class="field"><label for="dnSubj">Materia <span class="faint">(opcional)</span></label><input id="dnSubj" class="input" maxlength="60" value="${esc(DN.subj)}" placeholder="Ej. Matemáticas II"></div>
      <p class="tiny faint" style="margin:0 0 8px">${plural(dnTasks(kids).length, 'tarea se creará', 'tareas se crearán')} (una por renglón de lista o por nota).</p>` : ''}
    <div class="field"><span class="lbl">Bosques</span>${fs.length ? `<div class="tp-fl">${fs.map((f) => `<label class="tp-f"><input type="checkbox" data-dn-pick="${f.meta.id}" ${DN.pick.has(f.meta.id) ? 'checked' : ''}><span><b>${esc(f.meta.name)}</b></span></label>`).join('')}</div>` : '<p class="tiny faint">Aún no estás en ningún Bosque.</p>'}</div>
  </div><div class="sheet-foot"><button class="btn" data-act="dn-back">Atrás</button><span class="grow"></span><button class="btn primary" data-act="dn-go">Mandar</button></div>`);
}
function dnRead() { DN.due = document.getElementById('dnDue')?.value ?? DN.due; DN.time = document.getElementById('dnTime')?.value ?? DN.time; DN.subj = document.getElementById('dnSubj')?.value ?? DN.subj; }
async function dnGo(btn) {
  dnRead(); const c = dnCard(); if (!c) return; const fids = [...DN.pick].filter((f) => FOR.f[f]); if (!fids.length) { toast('Elige uno o más Bosques.'); return; }
  const kids = dnCards(c); if (!kids.length) { toast('Ese marco está vacío.'); return; }
  const tasks = DN.mode === 'tarea' ? dnTasks(kids) : []; if (DN.mode === 'tarea' && !tasks.length) { toast('No encontré texto para convertir en tarea.'); return; }
  btn.disabled = true; let ok = 0, q = 0, bad = 0; const tally = (r) => { r === 'ok' ? ok++ : r === 'queued' ? q++ : bad++; };
  try {
    for (const fid of fids) {
      const f = FOR.f[fid]; const meta = (f.items || []).find((x) => x.id === `bm-${fid}`); const ep = +(meta?.epoch || 0);
      if (DN.mode === 'tarea') { for (const t of tasks) tally(await tpPost(fid, { id: gid(), type: 'task', title: t.title.slice(0, 120), due: DN.due || null, time: DN.time || '', subject: DN.subj.slice(0, 60), desc: t.desc.slice(0, 2500), kind: 'tarea', crit: [], est: 0, from: 'lienzo' })); continue; }
      let n = 0;
      for (const k of kids) {
        const base = { id: 'pz' + uid(), type: 'board', ep, tone: DN.mode === 'aviso' ? 'miel' : (['papel', 'salvia', 'cielo', 'rosa', 'miel'].includes(k.tone) ? k.tone : 'papel'), x: Math.min(0.55, 0.02 + (n % 3) * 0.18), y: 0.02 + Math.floor(n / 3) * 0.16 + Math.random() * 0.02, from: 'lienzo', aviso: DN.mode === 'aviso' || undefined }; n++;
        if (k.k === 'foto') { const d = k.img ? await ufGet(k.img) : null; if (!d) continue; const fileId = 'f' + uid(); await cloudFetch('POST', { kind: 'gimg', as: REG.me, forest: fid, id: fileId, data: d }); tally(await tpPost(fid, { ...base, kind: 'file', fileId, file: 'foto.jpg', size: Math.round(d.length * 0.75), title: k.text || 'Foto' })); continue; }
        if (k.k === 'enlace') { tally(await tpPost(fid, { ...base, kind: 'link', link: safeURL(k.link || '') || '', title: k.text || '', text: '' })); continue; }
        const text = dnText(k).trim(); if (!text) continue; const title = DN.mode === 'aviso' ? (k.k === 'titulo' ? text : 'Aviso') : (k.k === 'titulo' ? text : '');
        tally(await tpPost(fid, { ...base, kind: (text.length > 160 || (title && k.k !== 'titulo')) ? 'draft' : 'note', title: k.k === 'titulo' ? '' : title, text }));
      }
    }
  } catch (e) { toast(/fetch|network|Failed/i.test(e.message || '') ? 'Para mandar fotos necesitas internet.' : (e.message || 'No se pudo mandar.')); }
  btn.disabled = false; if (!ok && !q) { if (bad) toast('No se pudo mandar. Revisa tu sesión.'); return; }
  closeSheet(false); try { Snd.chime(); } catch { /* */ } toast(`${plural(ok + q, 'elemento mandado', 'elementos mandados')} a ${plural(fids.length, 'Bosque', 'Bosques')}.${q ? ' Algunos saldrán al volver el internet.' : ''}`);
}
{
  const base = lzEdit;
  lzEdit = function (id) {
    base(id); if (!myForests().length) return; const row = document.querySelector('[data-lzid] .btn-row'); if (!row) return;
    row.insertAdjacentHTML('afterbegin', `<button class="btn" data-act="dn-open" data-id="${esc(id)}">${icon('share', 'sm')}Mandar a grupos</button>`);
  };
}
document.addEventListener('change', (e) => { const t = e.target; if (t.dataset?.dnPick) { t.checked ? DN.pick.add(t.dataset.dnPick) : DN.pick.delete(t.dataset.dnPick); } });
Object.assign(VIDA_ACTS, {
  'dn-open': (el) => dnSheet(el.dataset.id),
  'dn-mode': (el) => { dnRead(); DN.mode = el.dataset.v; dnSheet(); },
  'dn-back': () => { dnRead(); const id = DN.id; closeSheet(false); setTimeout(() => lzEdit(id), 250); },
  'dn-go': (el) => dnGo(el),
});
