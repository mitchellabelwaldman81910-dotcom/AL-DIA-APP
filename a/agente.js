/* Al Día 7.15 — Tu asistente, avisos confiables, consejos y Quiz inteligente.
   · El asistente aprende de lo que haces (a qué hora entregas, qué materias dejas al final, cuánto te tardas)
     y te habla con el estilo que elijas: Amable, Coach exigente, Sarcástico/Meme o Estratega silencioso.
   · Avisos: además de los del teléfono, el servidor manda los recordatorios aunque la app esté cerrada.
   · Quiz inteligente: lee tus apuntes, libretas y tareas, encuentra definiciones, fechas y listas,
     arma preguntas y repite más las que fallas (repaso espaciado). */
'use strict';

/* ===================== Lo que la app sabe de ti ===================== */
function perfilIA() {
  const done = S.tasks.filter((t) => t.done && t.doneAt);
  const hours = Array(24).fill(0); let late = 0, early = 0, onTime = 0;
  const bySub = {};
  for (const t of done) {
    const d = new Date(t.doneAt); hours[d.getHours()]++;
    const sid = t.subjectId || '_'; const b = (bySub[sid] ||= { n: 0, late: 0, last: 0 }); b.n++;
    if (t.due) { const lead = diffDays(toISO(d), t.due); if (lead < 0) { late++; b.late++; } else if (lead === 0) { onTime++; b.last++; } else early++; }
  }
  const best = hours.indexOf(Math.max(...hours));
  const peak = done.length >= 4 ? best : null;
  const weak = Object.entries(bySub).filter(([k, b]) => k !== '_' && b.n >= 2).map(([k, b]) => ({ s: subj(k), r: (b.late + b.last * 0.6) / b.n })).filter((x) => x.s && x.r >= 0.5).sort((a, b) => b.r - a.r);
  const focusMin = (S.focus || []).reduce((a, f) => a + (f.m || 0), 0);
  const q = S.quiz || {}; const qWeak = Object.entries(q.subj || {}).map(([k, v]) => ({ s: subj(k), r: v.n ? v.ok / v.n : 1, n: v.n })).filter((x) => x.s && x.n >= 4 && x.r < 0.7).sort((a, b) => a.r - b.r);
  return { n: done.length, peak, late, early, onTime, lastMinuteRate: done.length ? (late + onTime) / done.length : 0, weak, focusMin, qWeak };
}
const hh = (h) => (h === 0 ? '12 a. m.' : h < 12 ? `${h} a. m.` : h === 12 ? '12 p. m.' : `${h - 12} p. m.`);

/* ===================== Estilos del asistente ===================== */
const AGENTS = {
  amable: { name: 'Amable', desc: 'Te anima con calma y sin presión.' },
  coach: { name: 'Coach exigente', desc: 'Directo y firme: “Apaga Instagram ya”.' },
  meme: { name: 'Sarcástico / Meme', desc: 'Avisos irónicos y memes cuando pospones.' },
  estratega: { name: 'Estratega silencioso', desc: 'Solo el dato frío: tiempo, avance y costo.' },
};
const agentKey = () => (AGENTS[S.settings.agent] ? S.settings.agent : 'amable');
function taskCtx(t) {
  const steps = t.steps || []; const pct = steps.length ? Math.round((100 * steps.filter((s) => s.done).length) / steps.length) : 0;
  const est = Math.max(15, +t.estimate || TYPE_MIN[t.type] || 45);
  let hoursLeft = null;
  if (t.due) { const end = new Date(fromISO(t.due)); if (t.time) { const [h, m] = t.time.split(':').map(Number); end.setHours(h, m, 0, 0); } else end.setHours(23, 59, 0, 0); hoursLeft = (end - Date.now()) / 3600000; }
  const s = subj(t.subjectId);
  return { pct, est, hoursLeft, sub: s ? s.name : '', title: t.title };
}
const fmtH = (h) => (h < 1 ? `${Math.max(1, Math.round(h * 60))} minutos` : h < 48 ? `${Math.round(h)} ${Math.round(h) === 1 ? 'hora' : 'horas'}` : `${Math.round(h / 24)} días`);
function agentLine(t, style = agentKey(), postponedH = 0) {
  const c = taskCtx(t); const P = perfilIA(); const name = c.sub ? `${c.title} (${c.sub})` : c.title;
  const left = c.hoursLeft; const late = left !== null && left < 0;
  if (style === 'coach') {
    if (late) return { t: 'Se te pasó la fecha.', b: `«${name}» ya venció. Entrégala hoy antes de cualquier otra cosa. Sin excusas.` };
    if (postponedH >= 2) return { t: `Llevas ${Math.floor(postponedH)} horas posponiéndola.`, b: `«${c.title}» no se va a hacer sola. Cronómetro, celular boca abajo y 25 minutos. Ya.` };
    if (left !== null && left < 24) return { t: `Te quedan ${fmtH(left)} para ${c.sub || 'entregar'}.`, b: `Y llevas el ${c.pct}%. ${c.pct < 30 ? 'Apaga Instagram ya.' : 'Termínala, estás cerca.'}` };
    return { t: 'Hoy se trabaja.', b: `«${name}»: ${c.pct}% hecho. Un bloque de 25 minutos ahora vale más que tres mañana.` };
  }
  if (style === 'meme') {
    if (postponedH >= 2) return { meme: ['Yo hace 2 horas: “ahorita la hago”', `Yo ahora: sigo sin hacer «${c.title}»`], t: 'Plot twist: el “ahorita” ya caducó.', b: 'Dale aunque sea 10 minutos. La tarea no muerde (creo).' };
    if (late) return { meme: ['La fecha de entrega:', `Ya pasó. «${c.title}» sigue aquí. Mirándote.`], t: 'Como la ropa en la silla.', b: 'Entrégala hoy y finjamos que esto no pasó.' };
    if (left !== null && left < 24) return { meme: [`Yo con ${fmtH(left)} para entregar`, `Y llevo ${c.pct}%. Todo bien, todo tranquilo 🙂`], t: 'Esto no es un simulacro.', b: 'Bueno, sí es un aviso, pero tú me entiendes.' };
    return { meme: ['Nadie:', `Absolutamente nadie: «${c.title}» esperándote desde hace días`], t: 'Ella te espera.', b: 'Empieza hoy y mañana tu yo del futuro te invita algo.' };
  }
  if (style === 'estratega') {
    const peak = P.peak !== null ? ` Tu mejor hora suele ser ${hh(P.peak)}.` : '';
    if (late) return { t: 'Vencida.', b: `Recuperable con ${fmtMinutes(c.est)} hoy.${peak}` };
    const now = new Date(); const start = now.getHours() >= 17 ? 'ahora' : 'hoy a las 5:00 p. m.';
    const tomorrow = Math.round(c.est * (1 + (left !== null && left < 36 ? 1.4 : 0.6)));
    return { t: `Si empiezas ${start}: ${fmtMinutes(Math.max(10, Math.round(c.est * (1 - c.pct / 100))))}.`, b: `Si lo dejas para mañana: ${fmtMinutes(tomorrow)} y bajo estrés.${peak}` };
  }
  if (late) return { t: 'Se quedó pendiente, y está bien.', b: `Si entregas «${name}» hoy, tu árbol se recupera. Un paso a la vez.` };
  if (postponedH >= 2) return { t: 'Notamos que esta se te está haciendo difícil.', b: `¿La partimos en pasos pequeños? Empezar con 10 minutos ya cuenta.` };
  if (left !== null && left < 24) return { t: `Hoy toca «${c.title}».`, b: `Vas en ${c.pct}%. ${c.pct >= 50 ? 'Ya casi, tú puedes.' : 'Empieza con lo más fácil y agarra ritmo.'}` };
  return { t: 'Tu siguiente paso.', b: `«${name}». Avanzarle hoy te deja la semana más ligera.` };
}

/* Detectar cuándo pospones: si la misma tarea sigue siendo tu prioridad horas después y no avanzó */
function postponedHours(t) {
  const pp = (REG.pp ||= {}); const key = `${dataOwner()}:${t.id}`; const c = taskCtx(t);
  const cur = pp[key];
  if (!cur || cur.pct !== c.pct) { pp[key] = { at: Date.now(), pct: c.pct }; saveReg(); return 0; }
  return (Date.now() - cur.at) / 3600000;
}
function agentCardHTML() {
  if (isGroup() || !S.tasks.length) return '';
  const top = typeof todayPlan === 'function' ? null : null;
  const pend = pendingTasks().filter((t) => t.due);
  if (!pend.length) return '';
  const t = pend[0]; const ph = postponedHours(t); const m = agentLine(t, agentKey(), ph);
  const k = agentKey();
  return `<section class="agent-card ag-${k}">
    <div class="ag-top"><span class="ag-ico">${agentGlyph(k)}</span><span class="ag-name">${esc(AGENTS[k].name)}</span><a class="ag-chg" href="#/asistente">Cambiar estilo</a></div>
    ${m.meme ? `<div class="ag-meme">${memeArt(t.id)}<b>${esc(m.meme[0])}</b><b>${esc(m.meme[1])}</b></div>` : ''}
    <h3 class="ag-t">${esc(m.t)}</h3><p class="ag-b">${esc(m.b)}</p>
    <div class="btn-row"><button class="btn primary" data-act="ag-start" data-id="${t.id}">${icon('timer', 'sm')}Empezar 25 min</button><button class="btn" data-act="open-task" data-id="${t.id}">Ver tarea</button><button class="btn quiet" data-act="help-open" data-id="${t.id}">${icon('help', 'sm')}Pedir ayuda</button></div></section>`;
}
function agentGlyph(k) {
  const g = { amable: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', coach: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3z"/>', meme: '<circle cx="12" cy="12" r="9"/><path d="M8 14c1.2 1.6 2.4 2.2 4 2.2s2.8-.6 4-2.2M8.5 9.5h1M14.5 9.5h1"/>', estratega: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' }[k];
  return `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${g}</svg>`;
}
function memeArt(seed) {
  const R = rnd(seedOf('meme:' + seed + today()));
  const v = Math.floor(R() * 3);
  const face = [
    '<circle cx="40" cy="38" r="22"/><path d="M30 34h6M44 34h6M32 47c5 3 11 3 16 0"/><path d="M58 22l8-8M62 30l10-3"/>',
    '<rect x="18" y="16" width="44" height="52" rx="4"/><path d="M26 28h28M26 36h22M26 44h26"/><circle cx="33" cy="56" r="2.5"/><circle cx="47" cy="56" r="2.5"/><path d="M34 63c3 2 9 2 12 0"/>',
    '<path d="M40 64V36"/><path d="M40 44c-10-2-16-10-14-20 10 1 15 10 14 20zM40 40c8-7 17-9 22-4-5 8-14 8-22 4z"/><path d="M30 26h4M46 22h4" /><circle cx="33" cy="30" r="1.6"/><circle cx="47" cy="27" r="1.6"/>',
  ][v];
  return `<svg viewBox="0 0 80 80" class="ag-art" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${face}</svg>`;
}
{
  const baseHoy = viewHoy;
  viewHoy = function () {
    const html = baseHoy();
    const i = html.indexOf('class="today-head"'); if (i < 0) return html;
    const j = html.indexOf('</section>', i); if (j < 0) return html;
    let card = ''; try { card = agentCardHTML(); } catch (e) { console.warn('[Al Día] asistente', e); }
    return html.slice(0, j + 10) + card + html.slice(j + 10);
  };
}
function viewAsistente() {
  const k = agentKey(); const P = perfilIA(); const t = pendingTasks().find((x) => x.due) || { id: 'demo', title: 'Ensayo de Historia', steps: [], estimate: 60, due: addDays(today(), 1), subjectId: null };
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Tu asistente</h1>
    <p class="page-sub">Elige cómo quieres que te hable en la app y en tus notificaciones.</p>
    <div class="ag-grid">${Object.entries(AGENTS).map(([key, a]) => { const m = agentLine(t, key, key === 'meme' ? 2.4 : 0); return `<button type="button" class="ag-opt ag-${key}" data-act="ag-set" data-v="${key}" aria-pressed="${k === key}">
      <span class="ag-top"><span class="ag-ico">${agentGlyph(key)}</span><b>${a.name}</b>${k === key ? '<em>En uso</em>' : ''}</span><span class="small muted">${a.desc}</span>
      <span class="ag-sample"><b>${esc(m.t)}</b> ${esc(m.b)}</span></button>`; }).join('')}</div>
    <h2 class="sec">Lo que he aprendido de ti</h2>
    <ul class="rows ag-learn">
      <li><div class="rowline"><span class="ico">${icon('clock')}</span><span class="txt"><b>${P.peak !== null ? `Tu hora más productiva: ${hh(P.peak)}` : 'Aún aprendo tu mejor hora'}</b><span>${P.n ? `Con base en ${plural(P.n, 'entrega', 'entregas')}.` : 'Entrega unas tareas y lo sabré.'}</span></span></div></li>
      <li><div class="rowline"><span class="ico">${icon('flag')}</span><span class="txt"><b>${P.n ? `${Math.round(P.lastMinuteRate * 100)}% de tus entregas son a último momento` : 'Sin datos de entregas todavía'}</b><span>${P.early ? `${plural(P.early, 'vez', 'veces')} entregaste con 2 o más días de anticipación.` : 'Mientras antes empieces, menos estrés.'}</span></span></div></li>
      ${P.weak.length ? `<li><div class="rowline"><span class="ico">${icon('book')}</span><span class="txt"><b>Las que más dejas al final: ${P.weak.slice(0, 2).map((w) => esc(w.s.name)).join(' y ')}</b><span>Te las recordaré antes.</span></span></div></li>` : ''}
      ${P.qWeak.length ? `<li><div class="rowline"><span class="ico">${icon('spark')}</span><span class="txt"><b>En los quizzes te cuesta más ${esc(P.qWeak[0].s.name)}</b><span>Tus preguntas falladas vuelven más seguido hasta que las domines.</span></span></div></li>` : ''}
      <li><div class="rowline"><span class="ico">${icon('timer')}</span><span class="txt"><b>${fmtMinutes(P.focusMin)} de enfoque en total</b><span>Cada bloque riega tu árbol.</span></span></div></li></ul>
    ${notifCardHTML()}`;
}
EXTRA_VIEWS.asistente = viewAsistente; EXTRA_NAV.asistente = 'mas';

/* ===================== Avisos confiables ===================== */
const PUSH = { state: '' };
function notifCardHTML() {
  const perm = !('Notification' in window) ? 'no' : Notification.permission;
  const ios = typeof isIOS === 'function' && isIOS(); const inst = typeof isStandalone === 'function' && isStandalone();
  const on = perm === 'granted' && S.settings.notify !== false;
  const srv = (REG.pushed || {})[dataOwner()];
  return `<h2 class="sec">Notificaciones</h2><div class="card nt-card">
    <div class="nt-row"><span class="nt-dot ${on ? 'ok' : ''}"></span><span><b>${on ? 'Avisos activados en este dispositivo' : perm === 'denied' ? 'Bloqueaste los avisos' : 'Avisos apagados'}</b><span class="small muted">${on ? (srv ? 'Te llegan aunque la app esté cerrada.' : 'Conectando con la nube para avisarte aunque la app esté cerrada…') : perm === 'denied' ? 'Actívalos en los ajustes del navegador o del teléfono para Al Día.' : 'Actívalos para no olvidar ninguna entrega.'}</span></span></div>
    ${ios && !inst ? '<p class="nt-warn">En iPhone y iPad los avisos solo funcionan con la app instalada: Compartir › Agregar a inicio, y ábrela desde el ícono.</p>' : ''}
    <div class="btn-row">${on ? '<button class="btn" data-act="nt-test">Probar un aviso</button>' : perm !== 'denied' ? '<button class="btn primary" data-act="nt-on">Activar avisos</button>' : ''}</div>
    <p class="small muted" style="margin:10px 0 0">Te aviso la noche anterior (7 p. m.), el mismo día en la mañana, ${fmtMinutes(S.settings.remindBefore || 60)} antes si tiene hora, y al día siguiente si se quedó pendiente.</p></div>`;
}
async function pushSubscribeAll(quiet = true) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window) || Notification.permission !== 'granted') return false;
  try {
    const { publicKey } = await (await fetch('/api/sync?kind=vapid', { cache: 'no-store' })).json();
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(publicKey) });
    const ep = sub.endpoint; REG.pushed ||= {};
    for (const id of Object.keys(tokens())) {
      if (isForestId(id) || REG.pushed[id] === ep) continue;
      await cloudFetch('POST', { kind: 'gsub', as: id, subscription: sub.toJSON(), device: CLOUD.device });
      REG.pushed[id] = ep;
    }
    saveReg(); return true;
  } catch (e) { if (!quiet) toast('No se pudo conectar los avisos con la nube. Revisa tu internet.'); return false; }
}
{
  const baseEnable = enableNotifications;
  enableNotifications = async function (quiet = false) { await baseEnable(quiet); if (Notification.permission === 'granted') { S.settings.notify = true; save(); await pushSubscribeAll(quiet); render(); } };
}
function ensureTZ() {
  try { const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; if (tz && S.settings.tz !== tz && !isGroup()) { S.settings.tz = tz; save(); queueCloud(); } } catch { /* */ }
}
setTimeout(() => { ensureTZ(); if (S.settings.notify && 'Notification' in window && Notification.permission === 'granted') pushSubscribeAll(true); }, 3500);
/* avisos locales (mientras la app está abierta) con el mismo estilo y la misma etiqueta que los de la nube: nunca llegan dobles */
scheduleReminders = function () {
  reminderTimers.forEach(clearTimeout); reminderTimers = [];
  if (!('Notification' in window) || Notification.permission !== 'granted' || S.settings.notify === false) return;
  const now = Date.now(); const st = agentKey();
  const fire = (at, kind, t, extra) => { const ms = at - now; if (ms > 0 && ms < 24 * 3600000) reminderTimers.push(setTimeout(() => { const m = agentLine(t, st); notify(extra ? extra.t : m.t, extra ? extra.b : m.b, `aldia-${t.id}-${kind}`); if (kind === 'custom') checkDueReminders(); }, ms)); };
  for (const t of S.tasks) {
    if (t.done) continue;
    if (t.remind && !t.remindShown) fire(new Date(t.remind).getTime(), 'custom', t, { t: `Recordatorio: ${t.title}`, b: agentLine(t, st).b });
    if (!t.due) continue;
    const eve = new Date(fromISO(addDays(t.due, -1))); eve.setHours(19, 0, 0, 0); fire(eve.getTime(), 'eve', t, { t: `Mañana se entrega: ${t.title}`, b: agentLine(t, st).b });
    const day = new Date(fromISO(t.due)); day.setHours(7, 0, 0, 0); fire(day.getTime(), 'dia', t, { t: `Hoy se entrega: ${t.title}`, b: agentLine(t, st).b });
    if (t.time) { const [h, m] = t.time.split(':').map(Number); const at = new Date(fromISO(t.due)); at.setHours(h, m, 0, 0); fire(at.getTime() - (S.settings.remindBefore || 60) * 60000, 'pre', t); }
  }
};
Object.assign(VIDA_ACTS, {
  'ag-set': (el) => { S.settings.agent = el.dataset.v; commit(); Snd.tick(); toast(`Tu asistente ahora es: ${AGENTS[el.dataset.v].name}.`); scheduleReminders(); },
  'ag-start': (el) => { const t = task(el.dataset.id); if (!t) return; const T = timerState(); if (!T.running) { T.taskId = t.id; T.mode = 'focus'; T.preset = [25, 5]; T.remaining = 25 * 60000; save(); } location.hash = '#/enfoque'; },
  'nt-on': () => enableNotifications(false),
  'nt-test': async () => {
    await notify('Así te llegarán los avisos', agentLine(pendingTasks().find((x) => x.due) || { id: 'x', title: 'Tu próxima tarea', steps: [], due: today() }).b, 'aldia-test');
    const ok = await pushSubscribeAll(false);
    if (ok) { try { await cloudFetch('POST', { kind: 'pushtest', as: dataOwner() }); toast('Te mandé un aviso de prueba desde la nube. Debe llegar en unos segundos.'); } catch { /* */ } }
  },
});

/* ===================== Consejos para mejorar ===================== */
const TIPS = [
  ['Exámenes', 'target', [
    ['Practica recordando, no releyendo', 'Cierra el cuaderno y escribe todo lo que recuerdas de un tema. Lo que no salga es lo que debes repasar. Recordar fortalece la memoria mucho más que volver a leer.'],
    ['Repaso espaciado', 'Repasa un tema 1 día después, luego 3 días después y luego una semana después. Así se queda para el examen y para siempre. El Quiz inteligente lo hace por ti.'],
    ['Haz un simulacro', 'Una semana antes, resuelve preguntas como si fuera el examen real, con tiempo. Revisa tus errores: ahí está lo que más puntos te va a dar.'],
    ['Explícalo con tus palabras', 'Técnica Feynman: explica el tema como si se lo enseñaras a alguien de primaria. Si te trabas, encontraste el hueco.'],
    ['La noche anterior', 'Repasa solo un resumen de una hoja y duerme bien. Desvelarte estudiando hace que recuerdes menos, no más.'],
    ['Durante el examen', 'Lee todo primero, empieza por lo que dominas y deja 5 minutos para revisar. Si una pregunta te bloquea, sáltala y regresa.'],
  ]],
  ['Concentración', 'timer', [
    ['Bloques de 25 minutos', 'Trabaja 25 minutos sin interrupciones y descansa 5. Después de 4 bloques, descansa 20. Usa el Modo enfoque o la sala «Estudia conmigo».'],
    ['El celular, lejos', 'Ponlo boca abajo y en otro cuarto si puedes. Solo verlo cerca baja tu concentración.'],
    ['Empieza por 2 minutos', 'Cuando no tengas ganas, comprométete a solo 2 minutos. Casi siempre sigues después de empezar.'],
  ]],
  ['Organización', 'list', [
    ['Parte las tareas grandes', 'Un proyecto da miedo; «buscar 3 fuentes» no. Divide cada entrega en pasos pequeños con fecha.'],
    ['Lo importante primero', 'Empieza el día con la tarea que más vale o la que más pesa. Las fáciles se hacen solas después.'],
    ['Anota todo al momento', 'Apenas te dejen algo, anótalo en Al Día. La memoria es para pensar, no para guardar pendientes.'],
  ]],
  ['Memoria', 'spark', [
    ['Conecta ideas', 'Relaciona lo nuevo con algo que ya sabes. Tu Cerebro de Al Día muestra cómo se conecta todo lo que estudias.'],
    ['Dibuja y esquematiza', 'Mapas conceptuales, líneas del tiempo y diagramas ayudan a recordar más que solo texto.'],
    ['Mezcla temas', 'Practicar varios tipos de ejercicios mezclados te prepara mejor que hacer 20 iguales seguidos.'],
  ]],
  ['Bienestar', 'leaf', [
    ['Dormir es estudiar', 'Mientras duermes, tu cerebro guarda lo que aprendiste. 8 horas valen más que 2 horas extra de estudio desvelado.'],
    ['Muévete y respira', 'Una caminata de 10 minutos o un minuto de respiración guiada reinicia tu atención.'],
    ['Pide ayuda a tiempo', 'Preguntar no es rendirse. Usa «Pedir ayuda» en la Biblioteca General o en tu Bosque.'],
  ]],
];
function viewConsejos() {
  const P = perfilIA(); const mine = [];
  if (P.lastMinuteRate >= 0.5 && P.n >= 3) mine.push(['Empieza un día antes', `El ${Math.round(P.lastMinuteRate * 100)}% de tus entregas son a último momento. Prueba avanzar cada tarea el día anterior: menos estrés y mejor calidad.`]);
  if (P.peak !== null) mine.push([`Aprovecha tus ${hh(P.peak)}`, 'Es la hora en la que más entregas. Guarda ese momento para lo más difícil.']);
  if (P.weak.length) mine.push([`Atención a ${P.weak[0].s.name}`, 'Es la materia que más dejas al final. Ponle un paso pequeño hoy y el asistente te la recordará antes.']);
  if (P.qWeak.length) mine.push([`Repasa ${P.qWeak[0].s.name}`, `En tus quizzes aciertas el ${Math.round(P.qWeak[0].r * 100)}%. Haz un quiz corto cada día de esa materia.`]);
  if (P.focusMin < 60) mine.push(['Prueba un bloque de enfoque', 'Un solo bloque de 25 minutos hoy ya cambia tu semana.']);
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Consejos para mejorar</h1>
    <p class="page-sub">Técnicas que de verdad funcionan para estudiar, y consejos hechos con lo que la app sabe de ti.</p>
    ${mine.length ? `<section class="tip-mine"><h2 class="sec">Para ti</h2>${mine.map(([t, d]) => `<div class="tip-card me"><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join('')}</section>` : ''}
    <div class="btn-row" style="margin:6px 0 4px"><a class="btn primary" href="#/quiz">${icon('spark', 'sm')}Practicar con un quiz</a><button class="btn" data-act="help-open">${icon('help', 'sm')}Pedir ayuda</button></div>
    ${TIPS.map(([sec, ic, list]) => `<h2 class="sec">${icon(ic, 'sm')} ${sec}</h2><div class="tip-list">${list.map(([t, d]) => `<details class="tip-card"><summary><b>${esc(t)}</b>${icon('chev', 'chev sm')}</summary><p>${esc(d)}</p></details>`).join('')}</div>`).join('')}`;
}
EXTRA_VIEWS.consejos = viewConsejos; EXTRA_NAV.consejos = 'mas';

/* ===================== Quiz inteligente ===================== */
const QSTOP = new Set('el la los las un una unos unas de del al a en y o u e que se su sus por para con sin es son fue ser lo le les como más mas muy ya no si sí este esta estos estas ese esa eso entre sobre también tambien cuando donde porque pero sino hay tiene tienen puede pueden cada otro otra otros otras hasta desde ni nos mi mis tu tus'.split(' '));
const htmlText = (h) => { const d = document.createElement('div'); d.innerHTML = String(h || '').replace(/<(br|\/p|\/div|\/li|\/h\d)>/gi, '\n'); return (d.textContent || '').replace(/ /g, ' '); };
function quizSources(sid) {
  const out = [];
  for (const n of S.notes || []) if (!sid || n.subjectId === sid) out.push({ text: `${n.title || ''}\n${htmlText(n.body)}`, sid: n.subjectId, src: `apunte «${n.title || 'sin título'}»`, ref: 'n:' + n.id });
  for (const p of S.pages || []) if (!p.deleted && (!sid || p.subjectId === sid) && p.text) out.push({ text: `${p.title || ''}\n${p.text}`, sid: p.subjectId, src: `libreta: ${p.title || 'página'}`, ref: 'p:' + p.id });
  for (const t of S.tasks || []) if ((!sid || t.subjectId === sid) && t.desc && t.desc.length > 40) out.push({ text: t.desc, sid: t.subjectId, src: `tarea «${t.title}»`, ref: 't:' + t.id });
  for (const t of S.thoughts || []) if (!sid && t.mood === 'idea' && t.text.length > 40) out.push({ text: t.text, sid: null, src: 'pensamiento', ref: 'th:' + t.id });
  return out;
}
const clean = (s) => s.replace(/\s+/g, ' ').replace(/^[\s•·*\-–—>»\d.)]+/, '').trim();
function extractFacts(sources) {
  const facts = [];
  const add = (f) => { if (f.a.length < 2 || f.a.length > 220 || f.q.length < 2) return; f.id = hashStr(`${f.kind}|${f.q}|${f.a}`); if (!facts.some((x) => x.id === f.id)) facts.push(f); };
  for (const s of sources) {
    const lines = s.text.split(/\n+/).map(clean).filter(Boolean);
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      // Término: definición   |   Término - definición
      let m = /^([^:–—\-]{2,60}?)\s*(?::|–|—|\s-\s)\s*(.{8,220})$/.exec(line);
      if (m && !/^(https?|www)/i.test(m[1]) && m[1].split(' ').length <= 7) {
        const list = m[2].split(/\s*,\s*|\s*;\s*|\s+y\s+/).map((x) => x.trim()).filter((x) => x.length > 1);
        if (list.length >= 3 && list.every((x) => x.split(' ').length <= 5)) add({ kind: 'list', q: m[1], a: list, sid: s.sid, src: s.src, ref: s.ref });
        else add({ kind: 'def', q: m[1], a: m[2].replace(/\.$/, ''), sid: s.sid, src: s.src, ref: s.ref });
        continue;
      }
      // Lista con viñetas bajo un título que termina en ":"
      if (/:$/.test(line) && li + 2 < lines.length) {
        const items = []; for (let k = li + 1; k < lines.length && items.length < 8; k++) { const it = lines[k]; if (it.length > 60 || /:$/.test(it)) break; items.push(it.replace(/\.$/, '')); }
        if (items.length >= 3) { add({ kind: 'list', q: line.replace(/:$/, ''), a: items, sid: s.sid, src: s.src, ref: s.ref }); continue; }
      }
      for (const sent of line.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/)) {
        const x = clean(sent);
        m = /^(?:(?:el|la|los|las|un|una)\s+)?(.{2,60}?)\s+(es|son|era|eran|fue|fueron|significa|se define como|se refiere a|consiste en|se le llama|se conoce como)\s+(.{8,200}?)\.?$/i.exec(x);
        if (m && m[1].split(' ').length <= 6 && !QSTOP.has(normChars(m[1]))) { add({ kind: 'def', q: cap(m[1]), verb: m[2].toLowerCase(), a: m[3], sid: s.sid, src: s.src, ref: s.ref }); continue; }
        const y = /\b(1[0-9]{3}|20[0-9]{2})\b/.exec(x);
        if (y && x.split(' ').length >= 5 && x.length < 220) { add({ kind: 'year', q: x.replace(y[0], '____'), a: y[0], sid: s.sid, src: s.src, ref: s.ref }); continue; }
        const words = x.split(' ');
        if (words.length >= 7 && words.length <= 40) {
          const cand = words.map((w, i) => ({ w: w.replace(/[^\wáéíóúñü]/gi, ''), i })).filter((o) => o.w.length >= 5 && !QSTOP.has(normChars(o.w)) && o.i > 0);
          cand.sort((a, b) => (/^[A-ZÁÉÍÓÚÑ]/.test(b.w) - /^[A-ZÁÉÍÓÚÑ]/.test(a.w)) || b.w.length - a.w.length);
          if (cand[0]) { const w = cand[0].w; add({ kind: 'cloze', q: x.replace(new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`), '____'), a: w, sid: s.sid, src: s.src, ref: s.ref }); }
        }
      }
    }
  }
  return facts;
}
const qzShuffle = (a, R = Math.random) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
function qzBuild(sid, n = 10) {
  const facts = extractFacts(quizSources(sid));
  if (facts.length < 3) return { facts, qs: [] };
  const Q = (S.quiz ||= { facts: {}, runs: [], subj: {} });
  const box = (f) => (Q.facts[f.id] || { b: 0 }).b;
  // primero lo que fallaste o nunca has visto (repaso espaciado tipo Leitner)
  const due = (f) => { const r = Q.facts[f.id]; if (!r) return 0; const wait = [0, 1, 3, 7, 16, 35][Math.min(5, r.b)] * 86400000; return Date.now() - r.at >= wait ? 1 : 3; };
  const pool = qzShuffle(facts).sort((a, b) => due(a) - due(b) || box(a) - box(b)).slice(0, n);
  const defs = facts.filter((f) => f.kind === 'def'); const terms = [...new Set(facts.filter((f) => f.kind === 'def' || f.kind === 'cloze').map((f) => (f.kind === 'def' ? f.q : f.a)))];
  const allItems = [...new Set(facts.filter((f) => f.kind === 'list').flatMap((f) => f.a))];
  const qs = [];
  for (const f of pool) {
    let q = null;
    if (f.kind === 'def') {
      const others = qzShuffle(defs.filter((d) => d.id !== f.id && normChars(d.a) !== normChars(f.a))).slice(0, 3).map((d) => d.a);
      if (others.length >= 2 && Math.random() < 0.65) q = { type: 'mc', prompt: `¿Qué ${f.verb && /son|eran|fueron/.test(f.verb) ? 'son' : 'es'} ${f.q}?`, ok: f.a, opts: qzShuffle([f.a, ...others]) };
      else if (terms.length >= 3) { const ot = qzShuffle(terms.filter((t) => normChars(t) !== normChars(f.q))).slice(0, 3); q = { type: 'mc', prompt: `¿A qué corresponde esta descripción? «${f.a}»`, ok: f.q, opts: qzShuffle([f.q, ...ot]) }; }
      else if (others.length) { const wrong = Math.random() < 0.5; q = { type: 'vf', prompt: `${f.q}: ${wrong ? others[0] : f.a}`, ok: wrong ? 'Falso' : 'Verdadero', opts: ['Verdadero', 'Falso'] }; }
    } else if (f.kind === 'list') {
      const right = f.a[Math.floor(Math.random() * f.a.length)]; const wrong = qzShuffle(allItems.filter((x) => !f.a.includes(x))).slice(0, 3);
      if (wrong.length >= 2) q = { type: 'mc', prompt: `¿Cuál forma parte de «${f.q}»?`, ok: right, opts: qzShuffle([right, ...wrong]) };
      else q = { type: 'mc', prompt: `«${f.q}» tiene ${f.a.length} elementos. ¿Cuál de estos es uno de ellos?`, ok: right, opts: qzShuffle([right, ...qzShuffle(terms).filter((t) => !f.a.includes(t)).slice(0, 3)]) };
    } else if (f.kind === 'year') {
      const y = +f.a; const opts = qzShuffle([...new Set([y, y + 1 + Math.floor(Math.random() * 4), y - 2 - Math.floor(Math.random() * 6), y + 10 + Math.floor(Math.random() * 15)])]).map(String);
      q = { type: 'mc', prompt: `Completa: ${f.q}`, ok: f.a, opts };
    } else {
      const ot = qzShuffle(terms.filter((t) => normChars(t) !== normChars(f.a) && t.split(' ').length <= 3)).slice(0, 3);
      if (ot.length >= 2) q = { type: 'mc', prompt: `Completa: ${f.q}`, ok: f.a, opts: qzShuffle([f.a, ...ot]) };
    }
    if (q && q.opts.length >= 2) qs.push({ ...q, fid: f.id, sid: f.sid, src: f.src, ref: f.ref });
  }
  return { facts, qs };
}
const QZ = { run: null, sid: '' };
function viewQuiz() {
  const r = QZ.run;
  if (r && r.i < r.qs.length) {
    const q = r.qs[r.i]; const ans = r.ans[r.i];
    return `<a class="back" href="#/quiz" data-act="qz-quit">${icon('back')}Salir del quiz</a>
      <div class="qz-prog"><i style="width:${(r.i / r.qs.length) * 100}%"></i></div><p class="tiny faint">Pregunta ${r.i + 1} de ${r.qs.length}${q.sid && subj(q.sid) ? ` · ${esc(subj(q.sid).name)}` : ''}</p>
      <section class="qz-card"><h2 class="qz-q">${esc(q.prompt)}</h2>
        <div class="qz-opts">${q.opts.map((o, k) => { const st = ans == null ? '' : o === q.ok ? 'ok' : ans === k ? 'bad' : ''; return `<button type="button" class="qz-opt ${st}" data-act="qz-ans" data-k="${k}" ${ans != null ? 'disabled' : ''}><span class="qz-l">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`; }).join('')}</div>
        ${ans != null ? `<div class="qz-fb ${q.opts[ans] === q.ok ? 'ok' : 'bad'}"><b>${q.opts[ans] === q.ok ? '¡Correcto!' : 'Casi.'}</b><span>${q.opts[ans] === q.ok ? 'Esta vuelve a salir en unos días para que no se te olvide.' : `La respuesta es «${esc(q.ok)}». Volverá pronto para que la domines.`}</span><span class="tiny faint">De tu ${esc(q.src)}</span></div>
          <button class="btn primary block" data-act="qz-next">${r.i + 1 < r.qs.length ? 'Siguiente' : 'Ver resultado'}</button>` : ''}</section>`;
  }
  if (r && r.i >= r.qs.length) {
    const ok = r.ans.filter((a, i) => r.qs[i].opts[a] === r.qs[i].ok).length; const pct = Math.round((ok / r.qs.length) * 100);
    const wrongs = r.qs.filter((q, i) => q.opts[r.ans[i]] !== q.ok);
    return `<h1 class="page-title">Resultado</h1>
      <section class="qz-res"><div class="qz-score" style="--p:${pct}"><b>${ok}/${r.qs.length}</b><span>${pct}%</span></div>
        <div><p><b>${ok}</b> correctas · <b>${r.qs.length - ok}</b> por repasar</p><p class="muted">${pct >= 90 ? 'Dominas este tema. ¡Excelente!' : pct >= 70 ? 'Muy bien. Unas cuantas más y lo dominas.' : pct >= 50 ? 'Vas bien. Repasa lo que fallaste y vuelve mañana.' : 'Este tema necesita repaso. Las preguntas falladas volverán más seguido.'}</p></div></section>
      ${wrongs.length ? `<h2 class="sec">Para repasar</h2><ul class="rows">${wrongs.map((q) => `<li><div class="rowline"><span class="ico">${icon('flag')}</span><span class="txt"><b>${esc(q.prompt)}</b><span>Respuesta: ${esc(q.ok)} · de tu ${esc(q.src)}</span></span></div></li>`).join('')}</ul>` : ''}
      <div class="btn-row" style="margin-top:16px"><button class="btn primary" data-act="qz-go" data-v="${esc(QZ.sid)}">Otro quiz</button><button class="btn" data-act="qz-home">Elegir otro tema</button></div>`;
  }
  const Q = S.quiz || { runs: [], subj: {} };
  const counts = S.subjects.map((s) => ({ s, n: extractFacts(quizSources(s.id)).length }));
  const all = extractFacts(quizSources('')).length;
  const last = (Q.runs || []).slice(-6).reverse();
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Quiz inteligente</h1>
    <p class="page-sub">Leo tus apuntes, libretas y tareas, encuentro definiciones, fechas y listas, y armo preguntas. Las que fallas vuelven más seguido hasta que las domines.</p>
    <div class="qz-topics"><button class="qz-topic all" data-act="qz-go" data-v=""><b>Todo lo que he estudiado</b><span>${plural(all, 'dato encontrado', 'datos encontrados')}</span></button>
      ${counts.map(({ s, n }) => { const st = (Q.subj || {})[s.id]; return `<button class="qz-topic" data-act="qz-go" data-v="${s.id}" style="--c:${safeColor(s.color)}" ${n < 3 ? 'aria-disabled="true"' : ''}><b>${esc(s.name)}</b><span>${n < 3 ? 'Escribe apuntes de esta materia para practicar' : `${plural(n, 'dato', 'datos')}${st && st.n ? ` · aciertas ${Math.round((st.ok / st.n) * 100)}%` : ''}`}</span></button>`; }).join('')}</div>
    <div class="card qz-how"><b>¿Cómo escribir apuntes que se vuelvan buenas preguntas?</b><ul><li><b>Término: definición</b> — «Oferta: cantidad de un bien que se vende a un precio».</li><li><b>Frases con “es” o “son”</b> — «La fotosíntesis es el proceso…».</li><li><b>Listas</b> — «Tipos de mercado: competencia perfecta, monopolio, oligopolio».</li><li><b>Fechas</b> — «La Revolución Mexicana inició en 1910».</li></ul></div>
    ${last.length ? `<h2 class="sec">Tus últimos quizzes</h2><ul class="rows">${last.map((x) => `<li><div class="rowline"><span class="ico">${icon('spark')}</span><span class="txt"><b>${esc(x.name)} · ${x.ok}/${x.n}</b><span>${esc(relDay(toISO(new Date(x.at))))}</span></span></div></li>`).join('')}</ul>` : ''}`;
}
EXTRA_VIEWS.quiz = viewQuiz; EXTRA_NAV.quiz = 'mas';
Object.assign(VIDA_ACTS, {
  'qz-go': (el) => {
    const sid = el.dataset.v || ''; if (el.getAttribute('aria-disabled') === 'true') { toast('Aún no hay suficientes apuntes de esta materia.'); return; }
    const { qs, facts } = qzBuild(sid, 10);
    if (qs.length < 3) { toast(facts.length < 3 ? 'Necesito más apuntes para armar un quiz. Escribe definiciones o listas en tus libretas.' : 'No pude armar suficientes preguntas. Agrega más apuntes de este tema.', { ms: 5000 }); return; }
    QZ.sid = sid; QZ.run = { qs, i: 0, ans: [], at: Date.now() }; if (location.hash !== '#/quiz') location.hash = '#/quiz'; else render(); window.scrollTo(0, 0);
  },
  'qz-ans': (el) => {
    const r = QZ.run; if (!r || r.ans[r.i] != null) return; const k = +el.dataset.k; r.ans[r.i] = k; const q = r.qs[r.i]; const good = q.opts[k] === q.ok;
    const Q = (S.quiz ||= { facts: {}, runs: [], subj: {} }); const f = (Q.facts[q.fid] ||= { b: 0, n: 0, ok: 0, at: 0 });
    f.n++; f.at = Date.now(); if (good) { f.ok++; f.b = Math.min(5, f.b + 1); } else f.b = 0;
    if (q.sid) { const s = ((Q.subj ||= {})[q.sid] ||= { n: 0, ok: 0 }); s.n++; if (good) s.ok++; }
    save(); if (good) { Snd.chime(); leafBurst(el); } else Snd.tick();
    render();
  },
  'qz-next': () => { const r = QZ.run; if (!r) return; r.i++; if (r.i >= r.qs.length) { const ok = r.ans.filter((a, i) => r.qs[i].opts[a] === r.qs[i].ok).length; const Q = S.quiz; Q.runs = [...(Q.runs || []), { at: Date.now(), n: r.qs.length, ok, sid: QZ.sid, name: QZ.sid ? subj(QZ.sid)?.name || 'Materia' : 'Todo' }].slice(-60); const keys = Object.keys(Q.facts); if (keys.length > 1500) for (const k of keys.slice(0, keys.length - 1500)) delete Q.facts[k]; commit(); if (ok === r.qs.length) confetti(innerWidth / 2, innerHeight / 3, 70); } render(); window.scrollTo(0, 0); },
  'qz-quit': () => { QZ.run = null; },
  'qz-home': () => { QZ.run = null; render(); },
});
