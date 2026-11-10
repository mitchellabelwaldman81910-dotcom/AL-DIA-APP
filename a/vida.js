/* Cinnavia — VIDA: cuentas, árbol de 100 niveles, Bosques colaborativos y rankings.
   Este archivo se carga antes de app.js; todo lo que usa de la app se resuelve al ejecutarse. */
'use strict';

/* =========================================================
   1. Niveles y cálculo del árbol
   ========================================================= */
// puntos acumulados para llegar al nivel n (personas: 0 a 100; Bosques: 0 a 1000). Igual que en el servidor.
const TREE_T = (n) => Math.round(10 * n + 0.5 * Math.pow(n, 1.75));
const FOREST_T = (n) => Math.round(25 * n + 0.2 * Math.pow(n, 1.6));
const levelOf = (pts, f = TREE_T, max = 100) => { let n = 0; while (n < max && f(n + 1) <= pts) n++; return n; };

const STAGES = [[0, 'Semilla'], [1, 'Brote'], [5, 'Plantita'], [10, 'Arbolito'], [20, 'Árbol joven'], [30, 'Árbol frondoso'], [40, 'Árbol en flor'], [50, 'Árbol de frutos'], [60, 'Bosque encantado'], [70, 'Jardín de luz'], [80, 'Edén'], [90, 'Paraíso'], [100, 'Árbol de la Vida']];
const stageName = (v) => { let s = STAGES[0][1]; for (const [n, name] of STAGES) if (v >= n) s = name; return s; };
const MILESTONES = [
  [1, 'Brote', 'Tu semilla despierta y saca su primera hojita.'], [10, 'Primeras ramas', 'El tronco se vuelve fuerte y se ramifica.'],
  [20, 'Cielo con sol', 'Sale el sol y las nubes pasean por tu cielo.'], [30, 'Colinas con arbolitos', 'Aparecen arbolitos a lo lejos.'],
  [35, 'Un estanque', 'Un agüita tranquila brilla junto a tu árbol.'], [38, 'Primeras flores', 'Las ramas se llenan de flores.'],
  [45, 'Mariposas', 'Llegan las mariposas a visitarte.'], [55, 'Frutos', 'Tu árbol da frutos de todo el esfuerzo.'],
  [60, 'Pájaros cantando', 'Los pájaros hacen su nido en tus ramas.'], [70, 'Río y luciérnagas', 'Un río serpentea y las luciérnagas encienden la tarde.'],
  [75, 'Pétalos bailando', 'El viento mece pétalos por todo el paraíso.'], [80, 'Arcoíris', 'Un arcoíris cruza tu cielo.'],
  [90, 'Cielo de estrellas', 'La noche se llena de estrellas.'], [96, 'Aurora', 'Una aurora de colores abraza tu paraíso.'],
  [100, 'Árbol de la Vida', 'Hojas doradas, frutos de luz y un paraíso completo.'],
];

function extraFor(id) {
  const out = { water: {}, gdone: [] };
  if (id !== REG.me) return out;
  out.water = (REG.water && REG.water[id]) || {};
  const items = {};
  for (const f of Object.values(FOR.f || {})) for (const it of f.items || []) items[it.id] = it;
  for (const [tid, ts] of Object.entries(REG.gdone || {})) {
    const it = items[tid]; if (!it || it.type !== 'task') continue;
    const day = toISO(new Date(ts));
    out.gdone.push({ day, onTime: !it.due || day <= it.due });
  }
  return out;
}

function treeCalc(d, extra = {}) {
  const dayOf = (ms) => toISO(new Date(ms));
  const gain = {}, wet = {}, nCnt = {};
  const t0 = today();
  for (const t of d.tasks || []) {
    if (t.created) wet[dayOf(t.created)] = 1;
    if (t.done && t.doneAt) {
      const dn = dayOf(t.doneAt); wet[dn] = 1;
      const ok = !t.due || dn <= t.due;
      gain[dn] = (gain[dn] || 0) + (ok ? 10 + (t.priority === 3 ? 4 : 0) + ((t.steps || []).length > 1 ? 2 : 0) : 3);
    }
  }
  const soft = (ms) => { if (!ms) return; const dn = dayOf(ms); wet[dn] = 1; if ((nCnt[dn] = (nCnt[dn] || 0) + 1) <= 3) gain[dn] = (gain[dn] || 0) + 2; };
  for (const n of d.notes || []) soft(n.updated || n.created || n.at);
  for (const t of d.thoughts || []) soft(t.at);
  for (const k of Object.keys(extra.water || {})) wet[k] = 1;
  for (const g of extra.gdone || []) { wet[g.day] = 1; gain[g.day] = (gain[g.day] || 0) + (g.onTime ? 10 : 3); }
  const keys = [...new Set([...Object.keys(wet), ...Object.keys(gain)])].filter((k) => k <= t0).sort();
  const out = { pts: 0, life: 0, level: 0, streak: 0, wet: !!wet[t0], dry: 0, cur: 0, need: TREE_T(1), loss: 0, days: 0 };
  if (!keys.length) return out;
  let day = keys[0] < addDays(t0, -730) ? addDays(t0, -730) : keys[0];
  let pts = 0, life = 0, streak = 0, lastWet = null;
  for (let guard = 0; day <= t0 && guard < 900; guard++, day = addDays(day, 1)) {
    let g = Math.min(gain[day] || 0, 70);
    g = Math.round(g * (1 + Math.min(streak, 14) * 0.02));
    pts += g; life += g;
    if (wet[day]) { streak++; lastWet = day; }
    else if (day < t0) { streak = 0; pts = Math.max(0, pts - Math.round(6 + levelOf(pts) * 0.6)); }
    out.days++;
  }
  const level = levelOf(pts);
  return { ...out, pts, life, level, streak, cur: TREE_T(level), need: level >= 100 ? TREE_T(100) : TREE_T(level + 1), loss: Math.round(6 + level * 0.6), dry: lastWet ? Math.max(0, diffDays(lastWet, t0)) : 0 };
}
function treeNow(id) {
  const d = id === dataOwner() ? S : load(keyFor(id));
  return treeCalc(d, extraFor(id));
}
function waterToday() {
  if (!REG.me) return;
  ((REG.water ||= {})[REG.me] ||= {})[today()] = 1;
  const w = REG.water[REG.me]; const ks = Object.keys(w).sort();
  while (ks.length > 40) delete w[ks.shift()];
  saveReg(); treeSoon();
}

/* Se revisa después de cada cambio: riego, subida y bajada de nivel */
let treeT = null;
function treeSoon() { clearTimeout(treeT); treeT = setTimeout(treeCheck, 350); }
function treeCheck() {
  const id = dataOwner();
  if (!id || !REG.tokens || !tokens()[id] || !profile(id)) return;
  const c = treeNow(id);
  const st = ((REG.tree ||= {})[id] ||= null);
  if (!st) { REG.tree[id] = { level: c.level, wetDay: c.wet ? today() : '', down: '' }; saveReg(); return; }
  if (c.wet && st.wetDay !== today()) {
    st.wetDay = today(); saveReg();
    VUI.pour = Date.now() + 7000;
    if (!choosing) { toast('¡Regaste tu árbol! Hoy crecerá más.'); if (Snd.on()) { Snd.drop(); } if (route().name === 'vida') render(); }
  }
  if (c.level > st.level) {
    st.level = c.level; saveReg();
    if (!choosing) levelUp(c.level);
    cloudSoon();
  } else if (c.level < st.level) {
    const was = st.level; st.level = c.level; saveReg();
    if (!choosing && st.down !== today()) { st.down = today(); saveReg(); toast(`Tu árbol tuvo sed y bajó del nivel ${was} al ${c.level}. Súbele una tarea o un apunte para regarlo.`, { ms: 6500 }); }
    cloudSoon();
  }
}
let cloudSoonT = null;
function cloudSoon() { clearTimeout(cloudSoonT); cloudSoonT = setTimeout(() => cloudSync(), 80); }
function levelUp(level) {
  const ms = MILESTONES.find((m) => m[0] === level);
  Snd.chime();
  if (route().name === 'vida') { VUI.pour = Date.now() + 5000; render(); }
  const sc = $('.vscene'); if (sc) leafBurst(sc);
  confetti(innerWidth / 2, innerHeight / 3, level % 10 === 0 ? 80 : 40);
  if (ms || level % 10 === 0) {
    const d = $('#ask');
    d.innerHTML = `<form method="dialog" class="levelup"><div class="lu-tree">${treeScene({ level, wet: true, id: 'lu', seed: REG.me, species: typeof curSpecies === 'function' ? curSpecies() : 'roble' })}</div>
      <h3 class="serif">¡Nivel ${level}!</h3><p><b>${esc(stageName(level))}${ms ? ` · ${esc(ms[1])}` : ''}</b></p><p>${esc(ms ? ms[2] : 'Tu árbol sigue creciendo gracias a ti.')}</p>
      <div class="btn-row" style="justify-content:center"><button class="btn primary" value="ok">Seguir creciendo</button></div></form>`;
    if (!d.open) { d.showModal(); setTimeout(() => leafBurst(d.querySelector('.lu-tree')), 300); }
  } else toast(`¡Tu árbol subió al nivel ${level}!`);
}

/* Publica el nivel de cada persona para el ranking */
async function postTrees(live) {
  for (const id of live || []) {
    if (!profile(id) || !tokens()[id]) continue;
    const c = treeNow(id);
    const key = `${c.pts}|${c.life}|${c.streak}`;
    if ((REG.treePosted ||= {})[id] === key) continue;
    try {
      await cloudFetch('POST', { kind: 'tree', as: id, pts: c.pts, life: c.life, streak: c.streak });
      REG.treePosted[id] = key; saveReg();
      FOR.trees[id] = { ...(FOR.trees[id] || {}), id, name: profile(id).name, color: profile(id).color, pts: c.pts, life: c.life, level: c.level, streak: c.streak };
    } catch { /* se intenta en la próxima sincronización */ }
  }
}

/* =========================================================
   2. Dibujo del árbol (una escena distinta por nivel)
   ========================================================= */
const hex2 = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mixHex = (a, b, t) => { const A = hex2(a), B = hex2(b); t = Math.max(0, Math.min(1, t)); return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * t).toString(16).padStart(2, '0')).join(''); };
const seedOf = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rnd = (seed) => { let s = seed || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
const r1 = (n) => Math.round(n * 10) / 10;

/* treeScene: ver linea.js */

/* Arbolito para las listas */
/* treeIcon: ver linea.js */

/* =========================================================
   3. Cuentas: crear usuario, entrar, contraseña
   ========================================================= */
const ACCOUNT_COLORS = ['#2F8A5B', '#3E9A93', '#5B7FD1', '#B07AC8', '#D27C5E', '#C9A55C', '#4F9A63', '#7A8CA8'];
const userSlug = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);

function authDialog(opts) {
  return new Promise((resolve) => {
    let mode = opts.mode; let done = false; let color = opts.color || ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)];
    let userTouched = false; const keep = { name: opts.name || '', user: opts.id || '' };
    const d = $('#ask');
    const paint = (msg = '') => {
      const reg = mode === 'register', claim = mode === 'claim', login = mode === 'login', chg = mode === 'setpw';
      const title = reg ? 'Crear mi usuario' : claim ? `Ponle contraseña a ${esc(opts.name)}` : login ? 'Entrar a mi usuario' : 'Cambiar contraseña';
      const sub = reg ? 'Elige un nombre, un usuario y una contraseña. Solo tú podrás entrar a tu sección.'
        : claim ? 'Así tus tareas se guardan en la nube y nadie más puede entrar. Si ya tenías este usuario creado, escribe tu contraseña de antes.'
        : login ? 'Escribe tu usuario y tu contraseña para traer tus cosas a este dispositivo.' : 'Escribe la contraseña nueva. Mínimo 4 caracteres.';
      d.innerHTML = `<form class="auth" novalidate autocomplete="on">
        <h3 class="serif">${title}</h3><p>${sub}</p>
        ${reg ? `<div class="field"><label for="auName">Tu nombre</label><input class="input" id="auName" autocomplete="name" placeholder="Ej. Mel" maxlength="24" value="${esc(keep.name)}"></div>` : ''}
        ${reg || (login && !opts.id) ? `<div class="field"><label for="auUser">Tu usuario <span class="faint">(sin espacios)</span></label><input class="input" id="auUser" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="20" placeholder="Ej. mel" value="${esc(keep.user)}"></div>` : ''}
        ${login && opts.id ? `<p class="auth-who">${avatar({ name: opts.name || opts.id, color: opts.color || '#2F8A5B', initials: initials2(opts.name || opts.id) }, 'sm')}<b>${esc(opts.name || opts.id)}</b><span class="faint">@${esc(opts.id)}</span></p>` : ''}
        ${claim ? `<p class="auth-who">${avatar({ name: opts.name, color: opts.color || '#2F8A5B', initials: initials2(opts.name) }, 'sm')}<b>${esc(opts.name)}</b><span class="faint">@${esc(opts.id)}</span></p>` : ''}
        <div class="field"><label for="auPw">${chg ? 'Contraseña nueva' : 'Contraseña'}</label><div class="pw-row"><input class="input" id="auPw" type="password" autocomplete="${login ? 'current-password' : 'new-password'}" placeholder="Mínimo 4 caracteres"><button type="button" class="pw-eye" data-a="eye" aria-label="Mostrar u ocultar contraseña">Ver</button></div></div>
        ${reg || claim || chg ? `<div class="field"><label for="auPw2">Repite la contraseña</label><input class="input" id="auPw2" type="password" autocomplete="new-password" placeholder="Otra vez, igualita"></div>` : ''}
        ${reg ? `<div class="field"><span class="lbl">Tu color</span><div class="swatches">${ACCOUNT_COLORS.map((c) => `<button type="button" data-a="color" data-c="${c}" class="${c === color ? 'on' : ''}" style="--c:${c}" aria-label="Color ${c}"></button>`).join('')}</div></div>` : ''}
        ${reg ? '<p class="tiny faint" style="margin:0 0 8px">La administración de Cinnavia puede entrar a las cuentas solo para dar soporte y recuperar datos; cuando lo hace, ves su nombre en tu sección.</p>' : ''}
        <p class="auth-err" role="alert">${esc(msg)}</p>
        <div class="btn-row" style="flex-direction:row-reverse;justify-content:flex-start"><button class="btn primary" data-a="go" type="submit">${reg ? 'Crear mi usuario' : claim ? 'Guardar' : login ? 'Entrar' : 'Cambiar'}</button><button class="btn" type="button" data-a="cancel">Cancelar</button></div>
        ${login && !opts.id ? '<p style="text-align:center;margin:12px 0 0"><button class="link-btn" type="button" data-a="to-reg">Todavía no tengo usuario: crear uno</button></p>' : ''}
        ${reg ? '<p style="text-align:center;margin:12px 0 0"><button class="link-btn" type="button" data-a="to-login">Ya tengo usuario: entrar</button></p>' : ''}
      </form>`;
      const f = d.querySelector('form');
      const err = (m) => { d.querySelector('.auth-err').textContent = m; };
      const val = (id) => (d.querySelector('#' + id)?.value || '');
      const nm = d.querySelector('#auName'), us = d.querySelector('#auUser');
      if (nm && us) {
        nm.addEventListener('input', () => { keep.name = nm.value; if (!userTouched) { us.value = userSlug(nm.value); keep.user = us.value; } });
        us.addEventListener('input', () => { userTouched = true; us.value = userSlug(us.value); keep.user = us.value; });
      }
      f.addEventListener('click', (e) => {
        const b = e.target.closest('[data-a]'); if (!b) return;
        const a = b.dataset.a;
        if (a === 'eye') { const t = d.querySelector('#auPw').type === 'password' ? 'text' : 'password'; d.querySelector('#auPw').type = t; const p2 = d.querySelector('#auPw2'); if (p2) p2.type = t; }
        else if (a === 'color') { color = b.dataset.c; d.querySelectorAll('.swatches button').forEach((x) => x.classList.toggle('on', x === b)); }
        else if (a === 'cancel') { d.close(); }
        else if (a === 'to-reg') { mode = 'register'; paint(); }
        else if (a === 'to-login') { mode = 'login'; paint(); }
      });
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const go = d.querySelector('[data-a="go"]'); if (go.disabled) return;
        const pw = val('auPw'), pw2 = val('auPw2');
        try {
          if (reg) {
            const name = val('auName').trim(), user = userSlug(val('auUser'));
            if (!name) return err('Escribe tu nombre.');
            if (user.length < 3) return err('Tu usuario necesita al menos 3 letras o números.');
            if (pw.length < 4) return err('La contraseña necesita al menos 4 caracteres.');
            if (pw !== pw2) return err('Las contraseñas no son iguales.');
            go.disabled = true; err('Creando tu usuario…');
            finish(await cloudFetch('POST', { kind: 'register', user, name, password: pw, color }));
          } else if (claim) {
            if (pw.length < 4) return err('La contraseña necesita al menos 4 caracteres.');
            if (pw !== pw2) return err('Las contraseñas no son iguales.');
            go.disabled = true; err('Guardando…');
            try { finish(await cloudFetch('POST', { kind: 'register', user: opts.id, name: opts.name, password: pw, color: opts.color })); }
            catch (x) { if (x.status !== 409) throw x; finish(await cloudFetch('POST', { kind: 'login', user: opts.id, password: pw })); }
          } else if (login) {
            const user = opts.id || userSlug(val('auUser'));
            if (!user) return err('Escribe tu usuario.');
            if (!pw) return err('Escribe tu contraseña.');
            go.disabled = true; err('Entrando…');
            finish(await cloudFetch('POST', { kind: 'login', user, password: pw }));
          } else {
            if (pw.length < 4) return err('La contraseña necesita al menos 4 caracteres.');
            if (pw !== pw2) return err('Las contraseñas no son iguales.');
            go.disabled = true; err('Guardando…');
            finish(await cloudFetch('POST', { kind: 'setpw', user: opts.id, password: pw }));
          }
        } catch (x) {
          go.disabled = false;
          err(/fetch|network|Failed|Load failed/i.test(x.message) ? 'No hay conexión con la nube. Revisa tu internet e intenta otra vez.' : x.message);
        }
      });
      setTimeout(() => (d.querySelector('#auName') || d.querySelector('#auUser') || d.querySelector('#auPw'))?.focus(), 60);
    };
    const finish = (r) => { done = true; d.close(); resolve(r); };
    d.addEventListener('close', () => { if (!done) resolve(null); }, { once: true });
    paint();
    d.showModal();
  });
}

function acceptSession(r, fallback = {}) {
  const u = r.user || fallback; if (!u.id) return null;
  tokens()[u.id] = r.token;
  const i = (REG.users ||= []).findIndex((x) => x.id === u.id);
  const rec = { id: u.id, name: u.name || fallback.name || cap(u.id), color: u.color || fallback.color || '#2F8A5B' };
  if (i >= 0) REG.users[i] = rec; else REG.users.push(rec);
  if (!REG.me) REG.me = u.id;
  saveReg();
  return u.id;
}
async function sessionFor(id) {
  const p = profile(id);
  const r = await authDialog({ mode: p?.legacy ? 'claim' : 'login', id, name: p?.name, color: p?.color });
  if (!r) return false;
  acceptSession(r, { id, name: p?.name, color: p?.color }); Snd.drop();
  return true;
}
async function enterProfile(id) {
  if (isForestId(id)) {
    if (!REG.me || !tokens()[REG.me]) { toast('Primero entra con tu usuario.'); return; }
    switchProfile(id); return;
  }
  if (!tokens()[id] || (REG.me && id !== REG.me)) { if (!(await sessionFor(id))) return; }
  if (!REG.me) { REG.me = id; saveReg(); }
  switchProfile(id);
}
async function createUser() {
  const r = await authDialog({ mode: 'register' });
  if (!r) return;
  const id = acceptSession(r); if (!id) return;
  if (!localStorage.getItem(keyFor(id))) { try { const d = defaults(); d.settings.name = r.user.name; localStorage.setItem(keyFor(id), JSON.stringify(d)); } catch { /* */ } }
  Snd.chime(); switchProfile(id);
}
async function loginUser() {
  const r = await authDialog({ mode: 'login' });
  if (!r) return;
  const id = acceptSession(r); if (!id) return;
  Snd.chime(); switchProfile(id);
}
async function setPassword(id) {
  const r = await authDialog({ mode: 'setpw', id });
  if (!r) return false;
  tokens()[id] = r.token; saveReg(); toast('Contraseña cambiada.'); Snd.chime(); return true;
}
function logoutHere() {
  const id = dataOwner() || REG.me; if (id) delete tokens()[id];
  choosing = true; saveReg(); render();
}

function accountCardHTML() {
  const p = profile(REG.current); if (!p || isForestId(p.id)) return '';
  const on = !!tokens()[p.id];
  return `<h2 class="sec">Mi cuenta</h2><div class="card">
    <div class="toggle" style="padding-top:0"><span style="display:flex;gap:12px;align-items:center">${avatar(p, 'sm')}<span><span class="t">${esc(p.name)}</span><span class="d" style="display:block">@${esc(p.id)} · ${on ? 'sesión abierta' : 'sin sesión'}</span></span></span></div>
    <p class="small muted" id="cloudState" style="margin:4px 0 12px">${cloudStateText()}</p>
    <div class="btn-row"><button class="btn" data-act="acct-pw">${icon('lock')}Cambiar contraseña</button><button class="btn" data-act="cloud-now">${icon('reset')}Sincronizar ahora</button><button class="btn" data-act="cloud-history">${icon('clock')}Versiones en la nube</button><button class="btn quiet" data-act="acct-out">Cerrar sesión aquí</button></div>
    <p class="small muted" style="margin:12px 0 0">Tu contraseña se guarda protegida en la nube. Si la olvidas, no se puede recuperar: anótala en un lugar seguro.</p></div>`;
}

/* ¿Quién eres? */
function viewQuien() {
  const users = PERSONAL_LIST().filter(Boolean);
  const forests = REG.me && tokens()[REG.me] ? Object.values(FOR.f).filter((f) => f.meta.members.includes(REG.me)) : [];
  const inv = REG.me && tokens()[REG.me] ? FOR.invites.length : 0;
  return `<div class="who">
    <h1 class="page-title" style="font-size:clamp(36px,10vw,48px)">¿Quién eres?</h1>
    <p class="page-sub">Cada quien tiene su propio usuario y su contraseña. Nadie más puede entrar a tu sección.</p>
    ${users.map((p) => {
      const n = pendingCountFor(p.id); const on = !!tokens()[p.id]; const lvl = FOR.trees[p.id]?.level;
      return `<button type="button" class="who-btn" data-act="profile-pick" data-id="${p.id}">${avatar(p, 'lg')}
        <span style="flex:1"><b>${esc(p.name)}</b><span class="d">${p.legacy && !on ? 'Toca para ponerle contraseña' : on && p.id === REG.me ? (n ? plural(n, 'entrega pendiente', 'entregas pendientes') : 'Sin pendientes') : on ? 'Toca para entrar' : 'Con contraseña'}${lvl !== undefined ? ` · árbol nivel ${lvl}` : ''}</span></span>
        ${on && p.id === REG.me ? '' : `<span class="lock">${icon('lock')}</span>`}</button>`;
    }).join('')}
    ${forests.length ? `<h2 class="sec">Mis Bosques ${inv ? `<small class="chip pen">${plural(inv, 'invitación', 'invitaciones')}</small>` : ''}</h2>${forests.map((f) => forestCardHTML(f, 'profile-pick')).join('')}` : ''}
    <button type="button" class="who-btn rank-btn" data-act="rank-open"><span class="avatar lg" style="--pc:#C9A55C">${icon('trophy')}</span><span style="flex:1"><b>Ranking de árboles</b><span class="d">Mira quién tiene el árbol más alto, sin necesidad de entrar</span></span>${icon('chev', 'chev')}</button>
    <div class="who-actions"><button type="button" class="btn primary block" data-act="user-new">${icon('plus')}Crear mi usuario</button>
    <button type="button" class="btn block" data-act="user-login">Ya tengo usuario: entrar</button></div>
    <p style="text-align:center;margin-top:18px"><span class="small muted">${icon('spark', 'sm')} Tus cosas se guardan solas en la nube</span></p>
  </div>`;
}
function forestCardHTML(f, act) {
  const m = f.meta; const life = forestLife(m.id); const lv = levelOf(life, FOREST_T, 1000);
  return `<button type="button" class="who-btn forest-btn" data-act="${act}" data-id="f:${m.id}"><span class="avatar lg" style="--pc:${m.color || '#2F8A5B'}">${esc(String(m.name || '?').trim().charAt(0).toUpperCase())}</span>
    <span style="flex:1"><b>${esc(m.name)}</b><span class="d">${plural(m.members.length, 'integrante', 'integrantes')} · nivel ${lv} de 1000</span></span>${icon('chev', 'chev')}</button>`;
}
function openProfileSheet() {
  const users = PERSONAL_LIST().filter(Boolean);
  const forests = REG.me && tokens()[REG.me] ? Object.values(FOR.f).filter((f) => f.meta.members.includes(REG.me)) : [];
  openSheet(`${sheetHead('Usuarios y Bosques')}
    <div class="sheet-body">
      ${users.map((p) => { const isMe = p.id === REG.current; return `<button type="button" class="who-btn ${isMe ? 'me' : ''}" data-act="profile-to" data-id="${p.id}" ${isMe ? 'aria-current="true"' : ''}>${avatar(p)}
        <span style="flex:1"><b>${esc(p.name)}</b><span class="d">@${esc(p.id)}</span></span>${isMe ? '<span class="chip pen">Activo</span>' : '<span class="chip">Cambiar</span>'}</button>`; }).join('')}
      ${forests.length ? `<h2 class="sec" style="margin-top:20px">Mis Bosques</h2>${forests.map((f) => forestCardHTML(f, 'profile-to')).join('')}` : ''}
      <div class="btn-row" style="margin-top:16px"><button class="btn" data-act="sheet-close-new">${icon('plus')}Agregar otro usuario</button></div>
      <div class="toggle" style="margin-top:12px"><span><span class="t">Preguntar quién eres al abrir</span><span class="d" style="display:block">Útil si comparten el mismo celular.</span></span>
        <label class="switch"><input type="checkbox" data-reg="ask" ${REG.ask ? 'checked' : ''} aria-label="Preguntar quién eres al abrir"><span></span></label></div>
    </div>`);
}

/* =========================================================
   4. Bosques (grupos colaborativos)
   ========================================================= */
const FOREST_EMOJI = [''];
let forestSig = '';
function applyForests(remote) {
  const f = {};
  for (const [fid, v] of Object.entries(remote.forests || {})) {
    const items = (v.items || []).slice();
    for (const o of REG.gout || []) if (o && o.fid === fid && !items.some((x) => x.id === o.item.id)) items.push(o.item);
    f[fid] = { meta: v.meta, items, reqs: v.reqs || [] };
  }
  FOR.f = f;
  FOR.members = { ...FOR.members, ...(remote.members || {}) };
  FOR.trees = { ...FOR.trees, ...(remote.trees || {}) };
  const prevInv = new Set(FOR.invites.map((i) => i.forest));
  FOR.invites = remote.invites || [];
  const prevReq = new Set((FOR.myreqs || []).map((r) => r.forest));
  FOR.myreqs = (remote.myreqs || []).filter((r) => !f[r.forest]);
  for (const fid of prevReq) if (f[fid] && !choosing) { toast(`Te aceptaron en ${f[fid].meta.name}. Ya puedes entrar.`, { action: 'Entrar', onAction: () => enterProfile('f:' + fid) }); if (typeof Snd !== 'undefined') Snd.chime(); }
  saveFOR();
  for (const i of FOR.invites) if (!prevInv.has(i.forest) && !(REG.invSeen ||= {})[i.forest] && !choosing) { REG.invSeen[i.forest] = 1; saveReg(); toast(`${i.fromName} te invitó al Bosque ${i.forestName}. Míralo en Vida.`, { ms: 6000 }); Snd.chime(); }
  const sig = Object.values(f).map((x) => x.meta.id + x.meta.name + x.meta.members.join() + x.items.map((i) => i.u || i.at).join()).join('|') + '#' + FOR.invites.map((i) => i.forest).join() + '#' + Object.values(f).map((x) => (x.reqs || []).map((r) => r.user).join()).join() + '#' + (FOR.myreqs || []).map((r) => r.forest).join();
  const changed = sig !== forestSig; forestSig = sig;
  if (isForestId(REG.current) && !f[REG.current.slice(2)] && Object.keys(f).length >= 0 && !choosing && Object.keys(tokens()).length) { REG.current = REG.me; saveReg(); choosing = true; toast('Ya no eres parte de ese Bosque.'); }
  return changed;
}
function forestLife(fid) {
  const f = FOR.f[fid]?.meta; if (!f) return 0;
  return f.members.reduce((a, m) => a + ((m === REG.me && profile(m) && tokens()[m]) ? treeNow(m).life : (FOR.trees[m]?.life || 0)), 0);
}
function inviteBannerHTML() {
  if (!FOR.invites.length || !REG.me || !tokens()[REG.me] || isForestId(REG.current)) return '';
  const i = FOR.invites[0];
  return `<a class="banner" href="#/vida" data-act="vtab-go" data-v="bosques" style="text-decoration:none">${icon('users')}<p><b>${esc(i.fromName)}</b> te invitó al Bosque <b>${esc(i.forestName)}</b>${FOR.invites.length > 1 ? ` (y ${FOR.invites.length - 1} más)` : ''}.</p><span class="chip pen">Ver</span></a>`;
}

/* =========================================================
   5. Pantalla de VIDA
   ========================================================= */
const VUI = { tab: 'arbol', rank: 'personas', pour: 0 };
let RANK = { at: 0, data: null, busy: false, err: '' };
async function fetchRank(force) {
  if (RANK.busy || (!force && RANK.data && Date.now() - RANK.at < 30000)) return;
  RANK.busy = true; RANK.err = '';
  try { RANK.data = await cloudFetch('GET', null, 'kind=rank'); RANK.at = Date.now(); }
  catch (e) { RANK.err = /fetch|network|Failed|Load failed/i.test(e.message) ? 'Sin conexión con la nube' : e.message; }
  RANK.busy = false;
  if (rankBox()) paintRankBox(); else if (route().name === 'vida' && !choosing) render();
}
const rankBox = () => document.getElementById('rankBox');
function paintRankBox() { const b = rankBox(); if (b) b.innerHTML = rankingHTML(); }
function openRankSheet() { openSheet(`${sheetHead('Ranking de árboles')}<div class="sheet-body"><div id="rankBox"></div></div>`); paintRankBox(); fetchRank(true); }
function sceneBlock({ level, max, wet, id, seed, title, sub, pts, cur, need, extra = '', garden = null }) {
  const pour = Date.now() < VUI.pour;
  const pct = need > cur ? Math.max(0, Math.min(100, Math.round(((pts - cur) / (need - cur)) * 100))) : 100;
  const top = level >= max;
  return `<section class="vida-card ${wet ? '' : 'thirsty'}">
    <div class="vscene">${treeScene({ level, max, wet, id, seed, pour, garden, species: max === 100 && typeof curSpecies === 'function' ? curSpecies() : 'roble', fx: max === 100 && typeof curFX === 'function' ? curFX() : null })}
      ${typeof seasonLayer === 'function' ? seasonLayer() : ''}${typeof navMiniHTML === 'function' && max === 100 ? navMiniHTML() : ''}
      <div class="v-badge"><span class="v-lv">${level}</span><span class="v-of">${max === 100 ? 'de 100' : 'de 1000'}</span></div>
      <div class="v-water ${wet ? 'ok' : 'low'}">${wet ? 'Regado hoy' : 'Tiene sed'}</div></div>
    <div class="v-info"><h2 class="serif">${title}</h2><p class="muted" style="margin:0 0 10px">${sub}</p>
      <div class="v-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${top ? 100 : pct}%"></i></div>
      <p class="tiny faint" style="margin:6px 0 0">${top ? 'Nivel máximo alcanzado' : `${Math.max(0, pts - cur)} de ${need - cur} puntos para el nivel ${level + 1}`}</p>${extra}</div></section>`;
}
function viewVida() { return isGroup() ? viewVidaBosque() : viewVidaPersonal(); }

function viewVidaPersonal() {
  const id = REG.current; const p = profile(id); const c = treeNow(id);
  if (VUI.tab === 'ranking') fetchRank();
  const tabs = `<div class="seg full" role="group" style="margin:16px 0">${[['arbol', 'Mi árbol'], ['comprar', 'Comprar'], ['ranking', 'Ranking'], ['bosques', FOR.invites.length ? `Bosques · ${FOR.invites.length}` : 'Bosques']].map(([k, l]) => `<button type="button" data-act="vtab" data-v="${k}" aria-pressed="${VUI.tab === k}">${l}</button>`).join('')}</div>`;
  const warn = c.wet ? '' : `<p class="v-warn">${icon('bell', 'sm')}<span>Tu árbol tiene sed. Si hoy no subes una tarea o escribes un apunte, mañana perderá unos ${c.loss} puntos.</span></p>`;
  const head = `<h1 class="page-title">Vida</h1><p class="page-sub">Cumple a tiempo, riega a diario y mira crecer tu paraíso.</p>`;
  const card = sceneBlock({ level: c.level, max: 100, wet: c.wet, id: 'main', seed: id, garden: vidaData().garden, title: `${esc(p.name)} · ${esc(stageName(c.level))}`, sub: c.wet ? 'Tu árbol está feliz y bien regado.' : 'Súbele una tarea o un apunte para regarlo.', pts: c.pts, cur: c.cur, need: c.need,
    extra: `<div class="v-stats"><span>${icon('spark', 'sm')}<b>${c.streak}</b> ${c.streak === 1 ? 'día' : 'días'} de racha</span><span>${icon('leaf', 'sm')}<b>${c.pts}</b> puntos</span></div>` });
  const acts = `<div class="btn-row" style="margin:12px 0 0"><button class="btn primary" data-act="new-task">${icon('plus')}Subir una tarea</button><button class="btn" data-act="new-note">${icon('note')}Escribir un apunte</button><a class="btn" href="#/mente">${icon('leaf')}Un pensamiento</a></div>`;
  let body = '';
  if (VUI.tab === 'arbol') {
    const next = MILESTONES.find((m) => m[0] > c.level);
    body = `${next ? `<div class="card next-ms"><span class="tiny faint">Lo próximo en tu paraíso · nivel ${next[0]}</span><b class="serif">${esc(next[1])}</b><span class="muted">${esc(next[2])}</span></div>` : '<div class="card next-ms"><b class="serif">Tu paraíso está completo</b><span class="muted">Mantenlo regado para conservar el nivel 100.</span></div>'}
      <h2 class="sec">Cómo crece <small>reglas simples</small></h2>
      <ul class="rows v-rules">
        <li><div class="rowline"><span class="ico">${icon('check')}</span><span class="txt"><b>Entrega a tiempo</b><span>+10 puntos por cada tarea entregada antes de su fecha (+3 si es tarde).</span></span></div></li>
        <li><div class="rowline"><span class="ico">${icon('drop')}</span><span class="txt"><b>Riega cada día</b><span>Sube una tarea, escribe un apunte o un pensamiento. Con eso tu árbol queda regado hoy.</span></span></div></li>
        <li><div class="rowline"><span class="ico">${icon('drop')}</span><span class="txt"><b>Sin riego, baja</b><span>Cada día sin regar pierde puntos y puede bajar de nivel.</span></span></div></li>
        <li><div class="rowline"><span class="ico">${icon('spark')}</span><span class="txt"><b>Racha</b><span>Entre más días seguidos riegues, más puntos ganas por tus entregas.</span></span></div></li></ul>
      <h2 class="sec">Tu camino al nivel 100</h2>
      <ol class="milestones">${MILESTONES.map((m) => `<li class="${c.level >= m[0] ? 'done' : ''}"><span class="ms-dot">${c.level >= m[0] ? icon('check', 'sm') : m[0]}</span><span><b>${esc(m[1])}</b><span class="small muted"> · nivel ${m[0]}</span><span class="small muted" style="display:block">${esc(m[2])}</span></span></li>`).join('')}</ol>`;
  } else if (VUI.tab === 'jardin' || VUI.tab === 'comprar') body = shopTabHTML(c);
  else if (VUI.tab === 'ranking') body = rankingHTML();
  else body = bosquesTabHTML();
  return VUI.tab === 'arbol' ? `${head}${tabs}${card}${warn}${acts}${body}` : (VUI.tab === 'comprar' || VUI.tab === 'jardin') ? `${head}${tabs}${card}${body}` : `${head}${tabs}${body}`;
}

function rankingHTML() {
  const seg = `<div class="seg full" role="group" style="margin-bottom:14px">${[['personas', 'Personas'], ['bosques', 'Bosques']].map(([k, l]) => `<button type="button" data-act="vrank" data-v="${k}" aria-pressed="${VUI.rank === k}">${l}</button>`).join('')}</div>`;
  const R = RANK.data;
  const note = VUI.rank === 'personas' ? 'Árboles de personas, del 0 al 100.' : 'Los Bosques compiten solo con otros Bosques, hasta el nivel 1000.';
  if (!R) return `${seg}<p class="small muted">${note}</p>${RANK.err ? `<div class="banner warn">${icon('bell')}<p>${esc(RANK.err)}</p><button class="btn" data-act="rank-refresh">Reintentar</button></div>` : '<p class="muted" style="text-align:center;padding:24px 0">Buscando a los mejores árboles…</p>'}`;
  const medal = (i) => (i < 3 ? `<span class="rk-n rk-m${i + 1}">${i + 1}</span>` : `<span class="rk-n">${i + 1}</span>`);
  let list;
  if (VUI.rank === 'personas') {
    list = R.people.map((u, i) => `<li class="rk ${u.id === REG.me ? 'me' : ''}"><span class="rk-pos">${medal(i)}</span>${treeIcon(u.level)}<span class="rk-name"><b>${esc(u.name)}${u.id === REG.me ? ' (tú)' : ''}</b><span class="tiny faint">${esc(stageName(u.level))}${u.streak ? ` · racha ${u.streak}` : ''}</span></span><span class="rk-lv">Nivel <b>${u.level}</b></span></li>`).join('');
  } else {
    list = R.forests.map((f, i) => `<li class="rk ${FOR.f[f.id]?.meta.members.includes(REG.me) ? 'me' : ''}"><span class="rk-pos">${medal(i)}</span><span class="rk-emoji" style="--pc:${f.color || '#2F8A5B'}">${esc(String(f.name || '?').trim().charAt(0).toUpperCase())}</span><span class="rk-name"><b>${esc(f.name)}</b><span class="tiny faint">${plural(f.members, 'integrante', 'integrantes')}</span></span><span class="rk-lv">Nivel <b>${f.level}</b></span></li>`).join('');
  }
  const top3 = VUI.rank === 'personas' ? R.people.slice(0, 3).map((u) => ({ name: u.name, level: u.level, color: u.color, icon: esc(initials(u.name)), me: u.id === REG.me })) : R.forests.slice(0, 3).map((f) => ({ name: f.name, level: f.level, color: f.color, icon: esc(String(f.name || '?').trim().charAt(0).toUpperCase()), me: !!FOR.f[f.id]?.meta.members.includes(REG.me) }));
  const podium = podiumHTML(top3);
  const mine = VUI.rank === 'personas' ? R.people.findIndex((u) => u.id === REG.me) : -1;
  return `${seg}<p class="small muted" style="margin:0 0 10px">${note}${mine >= 0 ? ` Vas en el lugar <b>${mine + 1}</b>.` : ''}</p>
    ${podium}
    ${list ? `<ol class="ranking">${list}</ol>` : '<div class="empty"><h3>Aún no hay nadie aquí</h3><p>Sé la primera persona en regar su árbol.</p></div>'}
    <p style="margin-top:12px"><button class="btn quiet" data-act="rank-refresh">${icon('reset', 'sm')}Actualizar</button></p>`;
}

function bosquesTabHTML() {
  const mine = Object.values(FOR.f).filter((f) => f.meta.members.includes(REG.me));
  return `${FOR.invites.length ? `<h2 class="sec" style="margin-top:6px">Invitaciones</h2>${FOR.invites.map((i) => `<div class="card inv"><span class="avatar" style="--pc:#2F8A5B">${esc(String(i.name || '?').trim().charAt(0).toUpperCase())}</span><span class="inv-t"><b>${esc(i.forestName)}</b><span class="small muted">${esc(i.fromName)} te invita a su Bosque</span></span>
        <span class="inv-b"><button class="btn primary" data-act="invite-yes" data-id="${i.forest}">Unirme</button><button class="btn quiet" data-act="invite-no" data-id="${i.forest}">No</button></span></div>`).join('')}` : ''}
    <h2 class="sec">Mis Bosques</h2>
    ${mine.length ? mine.map((f) => forestCardHTML(f, 'profile-pick')).join('') : '<div class="empty"><h3>Todavía no estás en un Bosque</h3><p>Un Bosque es un grupo colaborativo: comparten pendientes, trabajos en equipo e ideas, y su árbol crece con el esfuerzo de todos.</p></div>'}
    <p style="margin-top:14px"><button class="btn primary" data-act="forest-new">${icon('plus')}Crear un Bosque</button></p>`;
}

function viewVidaBosque() {
  const m = forestMeta(); if (!m) return '<div class="empty"><h3>Este Bosque ya no está</h3></div>';
  if (VUI.tab === 'ranking') fetchRank();
  const life = forestLife(m.id); const lv = levelOf(life, FOREST_T, 1000);
  const wetToday = gItems().some((x) => !x.deleted && toISO(new Date(x.u || x.at)) === today()) || Object.keys(tokens()).some((u) => FOR.f[m.id].meta.members.includes(u) && treeNow(u).wet);
  const tabs = `<div class="seg full" role="group" style="margin:16px 0">${[['arbol', 'Nuestro árbol'], ['ranking', 'Ranking']].map(([k, l]) => `<button type="button" data-act="vtab" data-v="${k}" aria-pressed="${VUI.tab === k}">${l}</button>`).join('')}</div>`;
  const card = sceneBlock({ level: lv, max: 1000, wet: wetToday, id: 'bosque', seed: m.id, title: `${esc(m.name)}`, sub: `${esc(stageName(Math.round(100 * Math.sqrt(lv / 1000))))} · ${plural(m.members.length, 'integrante', 'integrantes')}`, pts: life, cur: FOREST_T(lv), need: lv >= 1000 ? FOREST_T(1000) : FOREST_T(lv + 1) });
  let body = '';
  if (VUI.tab === 'ranking') body = rankingHTML();
  else {
    const rows = m.members.map((u) => { const name = FOR.members[u]?.name || cap(u); const t = u === REG.me ? treeNow(u) : FOR.trees[u] || { level: 0, life: 0 }; return { u, name, level: t.level || 0, life: t.life || 0 }; }).sort((a, b) => b.life - a.life);
    body = `<p class="small muted" style="margin:0 0 10px">El árbol del Bosque crece con todo lo que cumplen sus integrantes. Mientras más colaboran, más alto sube.</p>
      <h2 class="sec" style="margin-top:6px">Quién hace crecer el Bosque</h2>
      <ol class="ranking">${rows.map((r, i) => `<li class="rk ${r.u === REG.me ? 'me' : ''}"><span class="rk-pos"><span class="rk-n ${i === 0 ? 'rk-m1' : ''}">${i + 1}</span></span>${mini(r.name)}<span class="rk-name"><b>${esc(r.name)}${r.u === REG.me ? ' (tú)' : ''}</b><span class="tiny faint">${r.life} puntos aportados</span></span><span class="rk-lv">Árbol <b>${r.level}</b></span></li>`).join('')}</ol>
      <p style="margin-top:14px"><button class="btn primary" data-act="forest-invite">${icon('plus')}Invitar a alguien</button></p>`;
  }
  return `<h1 class="page-title">Vida del Bosque</h1><p class="page-sub">Juntos hacen crecer el árbol hasta el nivel 1000.</p>${groupStatus()}${card}${tabs}${body}`;
}

/* =========================================================
   6. Acciones
   ========================================================= */
const VIDA_ACTS = {
  'user-new': () => createUser(),
  'user-login': () => loginUser(),
  'cloud-history': async () => {
    const id = dataOwner(); if (!id || !tokens()[id]) { toast('Entra con tu usuario primero.'); return; }
    openSheet(`${sheetHead('Versiones en la nube')}<div class="sheet-body"><p class="muted" style="margin:0 0 12px">La nube guarda una versión de tus datos cada vez que cambian (máximo una cada 10 minutos, las últimas 40). Si algo se perdió, vuelve a una versión anterior.</p><div id="histList">${typeof loaderHTML === 'function' ? loaderHTML('Cargando…') : 'Cargando…'}</div></div>`);
    try {
      const r = await cloudFetch('GET', null, `kind=history&p=${encodeURIComponent(id)}`);
      const box = document.getElementById('histList'); if (!box) return;
      box.innerHTML = r.list.length ? `<ul class="rows">${r.list.map((h) => `<li><div class="rowline" style="display:flex;align-items:center;gap:12px;padding:12px 16px"><span style="flex:1;min-width:0"><b style="display:block">${esc(cap(relDay(toISO(new Date(h.at)))))}, ${new Date(h.at).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}</b><span class="small muted">${plural(h.subjects, 'materia', 'materias')} · ${plural(h.tasks, 'tarea', 'tareas')} · ${plural(h.notes, 'apunte', 'apuntes')}${h.owner && h.owner !== id ? ' · <span style="color:var(--red)">datos de otra cuenta</span>' : ''}</span></span><button class="btn" data-act="cloud-restore" data-at="${h.at}">Restaurar</button></div></li>`).join('')}</ul>`
        : '<p class="small muted" style="margin:0">Todavía no hay versiones anteriores. Se irán guardando solas desde ahora.</p>';
    } catch (e) { const box = document.getElementById('histList'); if (box) box.innerHTML = `<p class="small" style="color:var(--red)">${esc(e.message)}</p>`; }
  },
  'cloud-restore': async (el) => {
    const id = dataOwner(); const at = +el.dataset.at;
    const ok = await ask({ title: '¿Volver a esta versión?', text: `Tus datos quedan como estaban el ${relDay(toISO(new Date(at)))} a las ${new Date(at).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}. La versión actual también se guarda en el historial, así que puedes regresar.`, ok: 'Restaurar' });
    if (!ok) return;
    try {
      const r = await cloudFetch('POST', { kind: 'restore', as: id, profile: id, at });
      const next = stampOwner(migrate(r.data), keyFor(id)); next.cloudAt = r.at;
      try { localStorage.setItem(keyFor(id), JSON.stringify(next)); } catch { /* */ }
      setBase(id, next); setDirty(id, false);
      if (id === dataOwner()) S = next;
      closeSheet(false); render(); applyTheme(); toast('Listo: tus datos volvieron a esa versión.'); Snd.chime();
    } catch (e) { toast(e.message); }
  },
  'sheet-close-new': () => { closeSheet(false); createUser(); },
  'acct-pw': () => setPassword(dataOwner()),
  'acct-out': async () => { const ok = await ask({ title: '¿Cerrar sesión aquí?', text: 'Tus datos siguen en la nube. Para volver a entrar necesitarás tu contraseña.', ok: 'Cerrar sesión' }); if (ok) logoutHere(); },
  vtab: (el) => { VUI.tab = el.dataset.v; render(); },
  'vtab-go': (el) => { VUI.tab = el.dataset.v; if (location.hash === '#/vida') render(); else location.hash = '#/vida'; },
  vrank: (el) => { VUI.rank = el.dataset.v; if (rankBox()) paintRankBox(); else render(); },
  'rank-open': () => openRankSheet(),
  'rank-refresh': () => { fetchRank(true); if (rankBox()) paintRankBox(); else render(); },
  'forest-new': async () => {
    const name = await ask({ title: 'Crear un Bosque', text: 'Ponle un nombre a tu grupo. Después podrás invitar a tus compañeros por su nombre de usuario.', input: { placeholder: 'Ej. T.V 512' }, ok: 'Crear Bosque' });
    if (!name) return;
    const emoji = FOREST_EMOJI[Math.floor(Math.random() * FOREST_EMOJI.length)];
    try {
      const r = await cloudFetch('POST', { kind: 'fcreate', as: REG.me, name, emoji, color: profile(REG.me)?.color });
      FOR.f[r.forest.id] = { meta: r.forest, items: [] }; saveFOR();
      Snd.chime(); toast(`Bosque ${r.forest.name} creado. Ahora invita a tus compañeros.`);
      enterProfile('f:' + r.forest.id);
    } catch (e) { toast(e.message); }
  },
  'forest-invite': async () => {
    const m = forestMeta(); if (!m) return;
    const u = await ask({ title: 'Invitar al Bosque', text: 'Escribe el nombre de usuario de tu compañero (el que eligió al crear su usuario). Le llegará una solicitud.', input: { placeholder: 'Ej. mel' }, ok: 'Enviar invitación' });
    if (!u) return;
    try { const r = await cloudFetch('POST', { kind: 'finvite', as: REG.me, forest: m.id, to: userSlug(u) }); Snd.chime(); toast(`Invitación enviada a ${r.name}.`); }
    catch (e) { toast(e.message); }
  },
  'forest-rename': async () => {
    const m = forestMeta(); if (!m) return;
    const n = await ask({ title: 'Nombre del Bosque', input: { value: m.name }, ok: 'Guardar' }); if (!n) return;
    try { await cloudFetch('POST', { kind: 'frename', as: REG.me, forest: m.id, name: n }); m.name = n; saveFOR(); render(); cloudSync(); } catch (e) { toast(e.message); }
  },
  'forest-leave': async () => {
    const m = forestMeta(); if (!m) return;
    const ok = await ask({ title: `¿Salir de ${m.name}?`, text: 'Dejarás de ver sus pendientes e ideas. Podrán invitarte de nuevo.', ok: 'Salir', danger: true }); if (!ok) return;
    try { await cloudFetch('POST', { kind: 'fleave', as: REG.me, forest: m.id }); delete FOR.f[m.id]; saveFOR(); REG.current = REG.me; saveReg(); switchProfile(REG.me); } catch (e) { toast(e.message); }
  },
  'invite-yes': async (el) => {
    try { await cloudFetch('POST', { kind: 'frespond', as: REG.me, forest: el.dataset.id, accept: true }); FOR.invites = FOR.invites.filter((i) => i.forest !== el.dataset.id); await cloudSync(); Snd.chime(); toast('¡Ya eres parte del Bosque!'); render(); } catch (e) { toast(e.message); }
  },
  'invite-no': async (el) => {
    try { await cloudFetch('POST', { kind: 'frespond', as: REG.me, forest: el.dataset.id, accept: false }); FOR.invites = FOR.invites.filter((i) => i.forest !== el.dataset.id); saveFOR(); render(); } catch (e) { toast(e.message); }
  },
};
