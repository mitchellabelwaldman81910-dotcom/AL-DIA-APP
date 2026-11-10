/* Al Día — tareas, entregas y materias.
   Todo se guarda en este dispositivo (localStorage). Sin cuentas, sin servidores. */
'use strict';

/* =========================================================
   1. Utilidades
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const icon = (id, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const pad = (n) => String(n).padStart(2, '0');
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const today = () => toISO(new Date());
const addDays = (iso, n) => { const d = fromISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
const diffDays = (a, b) => Math.round((fromISO(b) - fromISO(a)) / 86400000);
const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(fromISO(s));
const toMin = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_C = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DIAS_L = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_C = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const cap = (s) => s ? s[0].toUpperCase() + s.slice(1) : s;

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  return `${((h + 11) % 12) + 1}:${pad(m)} ${ap}`;
}
const shortDate = (iso) => { const d = fromISO(iso); return `${DIAS_C[d.getDay()]} ${d.getDate()} ${MESES_C[d.getMonth()]}`; };
const longDate = (iso) => { const d = fromISO(iso); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`; };
function relDay(iso) {
  const n = diffDays(today(), iso);
  if (n === 0) return 'hoy';
  if (n === 1) return 'mañana';
  if (n === 2) return 'pasado mañana';
  if (n === -1) return 'ayer';
  if (n > 2 && n < 7) return `el ${DIAS[fromISO(iso).getDay()]}`;
  if (n < 0 && n > -7) return `el ${DIAS[fromISO(iso).getDay()]}`;
  return `el ${shortDate(iso)}`;
}
function joinNatural(arr) {
  if (arr.length <= 1) return arr.join('');
  return arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
}
function fmtMinutes(m) {
  m = Math.round(m);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
const safeColor = (c) => (typeof c === 'string' && /^#[0-9a-f]{3,8}$/i.test(c) ? c : '#9AA6BF');
const safeURL = (u) => { try { const x = new URL(u.trim()); return /^https?:$/.test(x.protocol) ? x.href : null; } catch { return null; } };

function normChars(s) {
  return [...String(s)].map((c) => {
    const n = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    return n.length === c.length ? n : c;
  }).join('');
}

/* =========================================================
   2. Catálogos
   ========================================================= */
const COLORS = ['#D9A85B', '#8BA77E', '#C98B7A', '#7F9BAE', '#B39BC0', '#C9B26B', '#6FA39A', '#B97A5B', '#A3A86B', '#9C8574'];
const OLD_COLORS = { '#F5C400': '#D9A85B', '#3DBE6B': '#8BA77E', '#F0509A': '#C98B7A', '#FF8A1F': '#B97A5B', '#2D9CDB': '#7F9BAE', '#8E5BE8': '#B39BC0', '#14B8A6': '#6FA39A', '#E5484D': '#C98B7A', '#9BCB2B': '#A3A86B', '#A0703C': '#9C8574' };
const TYPES = {
  tarea: { label: 'Tarea' },
  proyecto: { label: 'Proyecto' },
  examen: { label: 'Examen' },
  exposicion: { label: 'Exposición' },
  lectura: { label: 'Lectura' },
  practica: { label: 'Práctica' },
  otro: { label: 'Otro' },
};
const DELIVERY = { impreso: 'Impreso', digital: 'Digital / correo', plataforma: 'Plataforma', clase: 'En clase', otro: 'Otro' };
const ESTIMATES = [[0, 'Sin calcular'], [15, '15 min'], [30, '30 min'], [60, '1 hora'], [90, '1 h 30 min'], [120, '2 horas'], [180, '3 horas'], [300, '5 horas o más']];
const STEP_TEMPLATES = {
  tarea: ['Leer las instrucciones y la rúbrica', 'Investigar o reunir la información', 'Hacer la tarea', 'Revisar y entregar'],
  proyecto: ['Entender lo que piden (rúbrica)', 'Investigar y juntar fuentes', 'Hacer el esquema o índice', 'Primer borrador', 'Revisar ortografía y formato', 'Portada, referencias y entrega'],
  examen: ['Juntar apuntes y temario', 'Hacer un resumen o guía de estudio', 'Repasar los temas difíciles', 'Practicar con ejercicios o preguntas', 'Repaso final ligero'],
  exposicion: ['Investigar el tema', 'Hacer las diapositivas', 'Preparar lo que vas a decir', 'Ensayar en voz alta con cronómetro', 'Llevar respaldo (USB o correo)'],
  lectura: ['Leer la primera mitad', 'Leer la segunda mitad', 'Anotar las ideas principales'],
  practica: ['Revisar el material de la práctica', 'Hacer la práctica', 'Escribir el reporte', 'Entregar el reporte'],
  otro: ['Preparar', 'Hacer', 'Revisar'],
};
const DEFAULT_CHECKLIST = [
  'Portada con nombre completo, grupo y materia',
  'Cumple todos los puntos de la rúbrica',
  'Ortografía y redacción revisadas',
  'Formato que pidieron (Word, PDF, a mano…)',
  'Índice y páginas numeradas (si aplica)',
  'Referencias en formato APA',
  'Nombre del archivo correcto',
  'Entregado o subido a tiempo',
];

/* =========================================================
   3. Datos (se guardan en el dispositivo)
   ========================================================= */
let KEY = 'aldia:v1'; // clave anterior a los usuarios; abajo se cambia a la del usuario activo
function defaults() {
  return {
    version: 1,
    settings: {
      name: '', theme: 'light', bosque: true, gradeMax: 10, passGrade: 6, target: 8, remindBefore: 60,
      notify: false, digest: true, onboarded: false, lastBackup: null, lastDigest: null,
      checklist: DEFAULT_CHECKLIST.slice(), installDismissed: false,
    },
    subjects: [], tasks: [], notes: [], libretas: [], vida: { garden: [], bonus: 0, claimed: {} }, focus: [], refs: [], thoughts: [], timer: null,
  };
}
function migrate(d) {
  const base = defaults();
  if (!d || typeof d !== 'object') return base;
  const out = { ...base, ...d, settings: { ...base.settings, ...(d.settings || {}) } };
  if (!out.settings.bosque) { out.settings.theme = 'light'; out.settings.bosque = true; }
  for (const k of ['subjects', 'tasks', 'notes', 'libretas', 'focus', 'refs', 'thoughts']) if (!Array.isArray(out[k])) out[k] = [];
  if (!Array.isArray(out.settings.checklist)) out.settings.checklist = DEFAULT_CHECKLIST.slice();
  out.subjects = out.subjects.filter((s) => s && s.id && s.name).map((s) => ({
    teacher: '', room: '', important: false, schedule: [], notes: '', target: null, ...s,
    color: OLD_COLORS[String(s.color).toUpperCase()] || safeColor(s.color), schedule: Array.isArray(s.schedule) ? s.schedule.filter((h) => h && h.start && h.end) : [],
  }));
  out.tasks = out.tasks.filter((t) => t && t.id && typeof t.title === 'string').map((t) => ({
    subjectId: null, type: 'tarea', due: null, time: '', priority: 2, value: null, estimate: 0, desc: '',
    steps: [], delivery: '', links: '', done: false, doneAt: null, grade: null, created: Date.now(), ...t,
    due: isISO(t.due) ? t.due : null, type: TYPES[t.type] ? t.type : 'tarea',
    steps: Array.isArray(t.steps) ? t.steps.filter((x) => x && x.id) : [],
  }));
  return out;
}
function load(key = KEY) {
  try { const raw = localStorage.getItem(key); return raw ? migrate(JSON.parse(raw)) : defaults(); }
  catch { return defaults(); }
}

/* ---------- Usuarios: cada quien con su propia cuenta (nombre + contraseña) ---------- */
const SPACE = 'BOSQUE-ALDIA-NUBE-GLOBAL';
const REG_KEY = 'aldia:usuarios';
const keyFor = (id) => `aldia:v1:${id}`;
function loadReg() {
  try { return { current: null, ask: false, ...JSON.parse(localStorage.getItem(REG_KEY) || '{}') }; }
  catch { return { current: null, ask: false }; }
}
let REG = loadReg();
function saveReg() { try { localStorage.setItem(REG_KEY, JSON.stringify(REG)); } catch { /* sin espacio */ } }
if (REG.apiKey) delete REG.apiKey;
// versión 7: la nube es una sola para todos; las sesiones viejas con código ya no sirven
if (REG.cloud !== SPACE) { REG.cloud = SPACE; REG.tokens = {}; delete REG.gout; delete REG.hasPw; }
// lo que se guardó antes de que existieran los usuarios pasa a Mitchell
try {
  const legacy = localStorage.getItem(KEY);
  if (legacy) {
    if (!localStorage.getItem(keyFor('mitchell'))) { localStorage.setItem(keyFor('mitchell'), legacy); REG.current = REG.current || 'mitchell'; }
    localStorage.removeItem(KEY);
  }
} catch { /* sin acceso a almacenamiento */ }
// usuarios que ya existían en este dispositivo (antes de las cuentas) quedan como "por reclamar"
if (!Array.isArray(REG.users)) {
  REG.users = [];
  for (const [id, name, color] of [['mitchell', 'Mitchell', '#2F8A5B'], ['mel', 'Mel', '#3E9A93']]) {
    try { if (localStorage.getItem(keyFor(id))) REG.users.push({ id, name, color, legacy: true }); } catch { /* */ }
  }
}
saveReg();
/* Salones (grupos colaborativos): copia local de lo que hay en la nube */
const FOR_KEY = 'aldia:bosques7';
let FOR = { f: {}, members: {}, invites: [], trees: {} };
try { FOR = { ...FOR, ...JSON.parse(localStorage.getItem(FOR_KEY) || '{}') }; } catch { /* */ }
function saveFOR() { try { localStorage.setItem(FOR_KEY, JSON.stringify(FOR)); } catch { /* */ } }
const isForestId = (id) => String(id || '').startsWith('f:');
const initials2 = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const profile = (id = REG.current) => {
  if (!id) return null;
  if (isForestId(id)) { const f = FOR.f[id.slice(2)]?.meta; return f ? { id, fid: f.id, name: f.name, initials: f.emoji || '🌳', color: f.color || '#2F8A5B', group: true } : null; }
  const u = (REG.users || []).find((x) => x.id === id);
  return u ? { ...u, initials: initials2(u.name) } : null;
};
const PERSONAL_LIST = () => (REG.users || []).map((u) => profile(u.id));
if (!profile()) REG.current = null;
const tokensNow = () => ((REG.tokens || {})[REG.cloud] || {});
const sessionOk = () => !!(REG.current && (isForestId(REG.current) ? (REG.me && tokensNow()[REG.me]) : tokensNow()[REG.current]));
let choosing = !REG.current || REG.ask || !sessionOk() || (!!REG.me && !isForestId(REG.current) && REG.current !== REG.me);
const dataOwner = () => (isForestId(REG.current) ? REG.me : REG.current);
KEY = keyFor(dataOwner() || (REG.users[0] && REG.users[0].id) || 'nuevo');
function pendingCountFor(id) {
  if (isForestId(id)) { try { const fid = id.slice(2); return (FOR.f[fid]?.items || []).filter((t) => t.type === 'task' && !t.deleted && !(REG.gdone || {})[t.id] && (!t.due || t.due >= today())).length; } catch { return 0; } }
  if (id === REG.current) return S.tasks.filter((t) => !t.done).length;
  return load(keyFor(id)).tasks.filter((t) => !t.done).length;
}
function avatar(p, cls = '') { return `<span class="avatar ${cls}" style="--pc:${p.color}" aria-hidden="true">${esc(p.initials || p.name[0])}</span>`; }

let S = load();
if (REG.current && !S.settings.name && profile()) S.settings.name = profile().name;
let saveFailed = false;
/* Base de datos del dispositivo (IndexedDB): fotos y copias diarias */
const DB = {
  p: null,
  open() {
    return this.p || (this.p = new Promise((res, rej) => {
      const r = indexedDB.open('aldia', 1);
      r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('files')) d.createObjectStore('files'); if (!d.objectStoreNames.contains('snaps')) d.createObjectStore('snaps'); };
      r.onsuccess = () => res(r.result); r.onerror = () => { this.p = null; rej(r.error); };
    }));
  },
  async run(store, mode, fn) {
    const d = await this.open();
    return new Promise((res, rej) => { const t = d.transaction(store, mode); const req = fn(t.objectStore(store)); t.oncomplete = () => res(req ? req.result : undefined); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
  },
  get(st, k) { return this.run(st, 'readonly', (o) => o.get(k)); },
  put(st, k, v) { return this.run(st, 'readwrite', (o) => o.put(v, k)); },
  del(st, k) { return this.run(st, 'readwrite', (o) => o.delete(k)); },
  keys(st) { return this.run(st, 'readonly', (o) => o.getAllKeys()); },
};
const SNAP_DAYS = 30;
let lastAutoSave = null;
async function autoBackup() {
  try {
    const d = today(); const k = `${REG.current || 'mitchell'}:${d}`;
    await DB.put('snaps', k, { d, at: Date.now(), data: JSON.parse(JSON.stringify(S)) });
    lastAutoSave = Date.now();
    const mine = (await DB.keys('snaps')).filter((x) => String(x).startsWith((REG.current || 'mitchell') + ':')).sort();
    for (const old of mine.slice(0, Math.max(0, mine.length - SNAP_DAYS))) await DB.del('snaps', old);
  } catch { /* sin IndexedDB: se omite la copia automática */ }
}
async function autoBackups() {
  try {
    const pre = (REG.current || 'mitchell') + ':';
    const ks = (await DB.keys('snaps')).filter((x) => String(x).startsWith(pre)).sort().reverse();
    return Promise.all(ks.map((k) => DB.get('snaps', k)));
  } catch { return []; }
}
try { Object.keys(localStorage).filter((k) => k.endsWith(':auto')).forEach((k) => localStorage.removeItem(k)); } catch { /* */ }
let autoT = null;
function save() {
  clearTimeout(autoT); autoT = setTimeout(autoBackup, 1500);
  try { localStorage.setItem(KEY, JSON.stringify(S)); saveFailed = false; }
  catch (e) { if (!saveFailed) toast('No se pudo guardar en este dispositivo. Libera espacio y vuelve a intentar.'); saveFailed = true; }
  queueSync();
  if (typeof queueCloud === 'function') queueCloud();
  treeSoon();
}
function commit(fn) { fn && fn(S); save(); render(); }

const subj = (id) => S.subjects.find((s) => s.id === id) || null;
const task = (id) => S.tasks.find((t) => t.id === id) || null;
const hasGrade = (t) => t.grade !== null && t.grade !== undefined && t.grade !== '' && !isNaN(+t.grade);
const fmtGrade = (g) => { const n = +g; return S.settings.gradeMax === 100 ? String(Math.round(n)) : (Number.isInteger(n) ? String(n) : n.toFixed(1)); };
const nextColor = () => COLORS[S.subjects.length % COLORS.length];
function shortName(s) {
  if (s.short && s.short.trim()) return s.short.trim();
  if (s.name.length <= 13) return s.name;
  const w = s.name.split(/\s+/).filter((x) => x.length > 3).sort((a, b) => b.length - a.length)[0];
  return w ? cap(w) : s.name;
}
const dueKey = (t) => (t.due || '9999-12-31') + ' ' + (t.time || '23:59');

/* =========================================================
   4. Captura rápida en lenguaje natural
   ========================================================= */
const NUMS = { un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, quince: 15 };
const WD = { domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6 };
const MON = { enero: 0, ene: 0, febrero: 1, feb: 1, marzo: 2, mar: 2, abril: 3, abr: 3, mayo: 4, may: 4, junio: 5, jun: 5, julio: 6, jul: 6, agosto: 7, ago: 7, septiembre: 8, setiembre: 8, sep: 8, sept: 8, octubre: 9, oct: 9, noviembre: 10, nov: 10, diciembre: 11, dic: 11 };
const STOP = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'para', 'con', 'en', 'a', 'al', 'tarea', 'tareas', 'hacer', 'entregar', 'entrega', 'trabajo', 'sobre', 'clase']);

function validDate(y, m, d) { const x = new Date(y, m, d, 12); return x.getMonth() === m && x.getDate() === d ? toISO(x) : null; }

function parseQuick(text) {
  const src = String(text || '');
  let n = normChars(src);
  const full = n;
  const cuts = [];
  const res = { title: '', due: null, time: '', type: null, priority: null, value: null, subjectId: null };
  const take = (re, fn) => {
    re.lastIndex = 0;
    const m = re.exec(n);
    if (!m) return false;
    if (fn(m) === false) return false;
    cuts.push([m.index, m.index + m[0].length]);
    n = n.slice(0, m.index) + ' '.repeat(m[0].length) + n.slice(m.index + m[0].length);
    return true;
  };
  const t0 = today();
  const tw = fromISO(t0).getDay();

  // valor y prioridad
  take(/(?:\bvale\s+(?:el\s+)?)?\b(\d{1,3})\s?%/, (m) => { const v = +m[1]; if (v > 100) return false; res.value = v; });
  take(/\b(?:urgente|importante|prioridad\s+alta)\b|!+/, () => { res.priority = 3; });

  // hora
  const setTime = (h, mi, mer, per) => {
    h = +h; mi = mi ? +mi : 0;
    mer = (mer || '').replace(/[\s.]/g, '');
    if (mer === 'pm' || per === 'tarde' || per === 'noche') { if (h < 12) h += 12; }
    else if (mer === 'am' || per === 'manana') { if (h === 12) h = 0; }
    else if (!mer && h >= 1 && h <= 6) h += 12;
    if (h > 23 || mi > 59) return false;
    res.time = `${pad(h)}:${pad(mi)}`;
  };
  const MER = '(am|pm|a\\.?\\s?m\\.?|p\\.?\\s?m\\.?|hrs?\\.?|h)?';
  const PER = '(?:\\s*\\b(?:de|en|por)\\s+la\\s+(manana|tarde|noche)|\\s*\\bdel\\s+dia\\b)?';
  take(new RegExp(`\\b(?:a\\s+las?|alas)\\s+(\\d{1,2})(?::(\\d{2}))?\\s*${MER}${PER}`), (m) => setTime(m[1], m[2], m[3], m[4])) ||
    take(new RegExp(`\\b(\\d{1,2}):(\\d{2})\\s*${MER}${PER}`), (m) => setTime(m[1], m[2], m[3], m[4])) ||
    take(/\b(\d{1,2})\s*(am|pm|a\.\s?m\.|p\.\s?m\.)(?![a-z])/, (m) => setTime(m[1], null, m[2], null));
  // "en la mañana" sin hora: se quita para no confundir con "mañana" (día)
  take(/\b(?:en|por|de)\s+la\s+(?:manana|tarde|noche)\b/, () => {});

  // fecha
  const setDue = (iso) => { if (!iso) return false; res.due = iso; };
  const nextWeekday = (wd) => { let delta = (wd - tw + 7) % 7; if (delta === 0) delta = 7; return addDays(t0, delta); };
  const yearFor = (m, d) => {
    const y = fromISO(t0).getFullYear();
    const iso = validDate(y, m, d);
    if (iso && diffDays(t0, iso) < -45) return validDate(y + 1, m, d);
    return iso;
  };
  const dateRes = [
    [/\b(?:para\s+)?(?:el\s+)?pasado\s+manana\b/, () => setDue(addDays(t0, 2))],
    [/\b(?:para\s+)?(?:el\s+)?(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/, (m) => {
      const d = +m[1], mo = +m[2] - 1;
      if (m[3]) { let y = +m[3]; if (y < 100) y += 2000; return setDue(validDate(y, mo, d)); }
      return setDue(yearFor(mo, d));
    }],
    [/\b(?:para\s+)?(?:el\s+)?(?:dia\s+)?(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre|sept|ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b(?:\s+(?:de\s+|del\s+)?(\d{4}))?/, (m) => {
      const mo = MON[m[2]];
      return setDue(m[3] ? validDate(+m[3], mo, +m[1]) : yearFor(mo, +m[1]));
    }],
    [/\b(?:para\s+)?(?:el\s+)?(?:(?:proximo|siguiente)\s+)?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)(?:\s+(?:que\s+viene|proximo|siguiente))?\b/, (m) => setDue(nextWeekday(WD[m[1]]))],
    [/\b(?:para\s+)?(?:dentro\s+de|en)\s+(\d{1,2}|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|quince)\s+(dias?|semanas?)\b/, (m) => {
      const k = /^\d+$/.test(m[1]) ? +m[1] : NUMS[m[1]];
      return setDue(addDays(t0, m[2].startsWith('semana') ? k * 7 : k));
    }],
    [/\b(?:para\s+)?(?:la\s+)?(?:proxima|siguiente)\s+semana\b|\b(?:para\s+)?la\s+semana\s+que\s+viene\b/, () => setDue(addDays(t0, 7))],
    [/\b(?:para\s+)?el\s+(?:dia\s+)?(\d{1,2})\b(?!\s*[:/%-])/, (m) => {
      const d = +m[1]; const base = fromISO(t0);
      let iso = validDate(base.getFullYear(), base.getMonth(), d);
      if (iso && diffDays(t0, iso) < 0) { const nx = new Date(base.getFullYear(), base.getMonth() + 1, 1, 12); iso = validDate(nx.getFullYear(), nx.getMonth(), d); }
      return setDue(iso);
    }],
    [/\b(?:para\s+)?(?:el\s+dia\s+de\s+)?(hoy|manana)\b/, (m) => setDue(m[1] === 'hoy' ? t0 : addDays(t0, 1))],
  ];
  for (const [re, fn] of dateRes) if (take(re, fn)) break;
  // si dio hora pero no día: hoy si todavía no pasa esa hora, si no, mañana
  if (!res.due && res.time) res.due = toMin(res.time) > nowMin() ? t0 : addDays(t0, 1);

  // tipo
  if (/\b(examen|examenes|parcial|quiz|prueba)\b/.test(full)) res.type = 'examen';
  else if (/\bproyecto/.test(full)) res.type = 'proyecto';
  else if (/\b(exposicion|exponer|presentacion|expo)\b/.test(full)) res.type = 'exposicion';
  else if (/\b(lectura|leer)\b/.test(full)) res.type = 'lectura';
  else if (/\b(practica|laboratorio|lab)\b/.test(full)) res.type = 'practica';

  // materia
  let best = null, bestScore = 0;
  const hash = /#([a-z0-9]+)/.exec(n);
  const words = full.split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w));
  for (const s of S.subjects) {
    const sn = normChars(s.name).trim();
    const sw = sn.split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w));
    let score = 0;
    if (hash && (sn.startsWith(hash[1]) || sw.some((w) => w.startsWith(hash[1])))) score = 500;
    else if (sn.length >= 3 && new RegExp(`\\b${sn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(full)) score = 100 + sn.length;
    else {
      for (const w of words) for (const x of sw) {
        if (w === x) score = Math.max(score, 20 + w.length);
        else if (w.length >= 4 && x.length >= 4 && (x.startsWith(w) || w.startsWith(x))) score = Math.max(score, 10 + Math.min(w.length, x.length));
      }
    }
    if (score > bestScore) { bestScore = score; best = s; }
  }
  if (best) res.subjectId = best.id;
  if (hash && bestScore === 500) cuts.push([hash.index, hash.index + hash[0].length]);

  // título: el texto sin fecha, hora ni marcas
  // normChars conserva la longitud de cada caracter, así que los índices sirven sobre el texto original
  cuts.sort((a, b) => a[0] - b[0]);
  let title = '';
  let pos = 0;
  for (const [a, b] of cuts) { if (a > pos) title += src.slice(pos, a); pos = Math.max(pos, b); }
  title += src.slice(pos);
  title = title.replace(/\s{2,}/g, ' ').trim();
  for (let i = 0; i < 4; i++) {
    title = title.replace(/[\s,;:–-]+$/, '').replace(/\s+(para|el|la|de|del|a|en|que|y|antes\s+del?)$/i, '').trim();
  }
  title = title.replace(/^(para|el|la)\s+/i, '').trim();
  res.title = cap(title);
  return res;
}

/* =========================================================
   5. Lógica de tareas
   ========================================================= */
function dueState(t) {
  if (!t.due) return { cls: '', label: 'Sin fecha' };
  const d = diffDays(today(), t.due);
  const tm = t.time ? fmtTime(t.time) : '';
  if (d < 0) return { cls: 'late', label: `Venció ${relDay(t.due)}` };
  if (d === 0) {
    if (t.time && toMin(t.time) < nowMin()) return { cls: 'late', label: `Hoy a las ${tm}` };
    return { cls: 'today', label: tm ? `Hoy, ${tm}` : 'Hoy' };
  }
  if (d === 1) return { cls: '', label: tm ? `Mañana, ${tm}` : 'Mañana' };
  if (d < 7) return { cls: '', label: cap(DIAS[fromISO(t.due).getDay()]) + (tm ? `, ${tm}` : '') };
  return { cls: '', label: cap(shortDate(t.due)) + (tm ? `, ${tm}` : '') };
}
function bucketOf(t) {
  if (!t.due) return 'nodate';
  const d = diffDays(today(), t.due);
  if (d < 0) return 'late';
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d < 7) return 'week';
  if (d < 14) return 'next';
  return 'later';
}
const BUCKETS = [['late', 'Atrasadas'], ['today', 'Hoy'], ['tomorrow', 'Mañana'], ['week', 'Esta semana'], ['next', 'La próxima semana'], ['later', 'Más adelante'], ['nodate', 'Sin fecha']];
const sortPending = (a, b) => dueKey(a).localeCompare(dueKey(b)) || (b.priority - a.priority);
const pendingTasks = () => S.tasks.filter((t) => !t.done).sort(sortPending);

function planHoy() {
  const t0 = today();
  const steps = [];
  const scored = [];
  for (const t of S.tasks) {
    if (t.done) continue;
    for (const st of t.steps) if (!st.done && st.date && st.date <= t0) steps.push({ t, st });
    if (!t.due) continue;
    const d = diffDays(t0, t.due);
    const s = subj(t.subjectId);
    const why = [];
    let score;
    if (d < 0) { score = 1000 - d; why.push(`venció ${relDay(t.due)}`); }
    else {
      score = 60 / (d + 1);
      why.push(d === 0 ? 'vence hoy' : d === 1 ? 'vence mañana' : `vence ${relDay(t.due)}`);
    }
    score *= [0.75, 1, 1.45][(t.priority || 2) - 1];
    if (typeof plusFactor === 'function') score *= plusFactor(t, s);
    if (t.priority === 3) why.push('es prioridad alta');
    if (s && s.important) { score *= 1.3; why.push('es de una materia importante'); }
    if (+t.value >= 20) { score *= 1.25; why.push(`vale ${+t.value}%`); }
    if (t.type === 'examen' && d >= 0 && d <= 3) { score *= 1.4; why.push('hay que repasar con tiempo'); }
    else if (+t.estimate >= 120 && d >= 1 && d <= 5) { score *= 1.5; why.push(`lleva unas ${fmtMinutes(+t.estimate)}: avánzale hoy`); }
    if (d <= 10) scored.push({ t, score, why });
  }
  scored.sort((a, b) => b.score - a.score);
  return { steps, top: scored.slice(0, 3) };
}
function heavyDays() {
  const t0 = today();
  const count = {};
  for (const t of S.tasks) {
    if (t.done || !t.due) continue;
    const d = diffDays(t0, t.due);
    if (d >= 1 && d <= 7) count[t.due] = (count[t.due] || 0) + 1;
  }
  return Object.entries(count).filter(([, c]) => c >= 3).sort();
}
function subjStats(sid) {
  const ts = S.tasks.filter((t) => t.subjectId === sid);
  const pending = ts.filter((t) => !t.done).sort(sortPending);
  const graded = ts.filter((t) => t.done && hasGrade(t)).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  const max = S.settings.gradeMax;
  let avg = null, evaluated = null;
  const w = graded.filter((t) => +t.value > 0);
  if (w.length) {
    const sumV = w.reduce((a, t) => a + +t.value, 0);
    avg = w.reduce((a, t) => a + (+t.grade / max) * +t.value, 0) / sumV * max;
    evaluated = Math.min(100, sumV);
  } else if (graded.length) {
    avg = graded.reduce((a, t) => a + +t.grade, 0) / graded.length;
  }
  return { pending, graded, avg, evaluated, done: ts.filter((t) => t.done) };
}
function neededText(avg, evaluated, target) {
  const max = S.settings.gradeMax;
  const f = (x) => fmtGrade(Math.round(x * 10) / 10);
  if (avg == null) return 'Cuando registres calificaciones de tus entregas, aquí verás tu promedio y lo que te falta.';
  if (evaluated == null) return `Tu promedio de entregas calificadas es ${f(avg)}. Si anotas cuánto vale cada entrega (%), te digo qué necesitas sacar en lo que falta.`;
  if (evaluated >= 100) return `Ya se evaluó el 100%. Tu calificación queda en ${f(avg)}.`;
  const rest = 100 - evaluated;
  const need = (target * 100 - avg * evaluated) / rest;
  const base = `Llevas ${f(avg)} con el ${Math.round(evaluated)}% evaluado.`;
  if (need <= 0) return `${base} Ya tienes asegurado el ${fmtGrade(target)} aunque te vaya mal en lo que falta.`;
  if (need > max) return `${base} Aun sacando ${max} en el ${Math.round(rest)}% que falta, lo máximo que alcanzas es ${f((avg * evaluated + max * rest) / 100)}.`;
  return `${base} Para terminar con ${fmtGrade(target)} necesitas promedio de ${f(need)} en el ${Math.round(rest)}% que falta.`;
}
function classesOn(wd) {
  const out = [];
  for (const s of S.subjects) for (const h of s.schedule || []) if (+h.day === wd && h.start && h.end) out.push({ s, start: h.start, end: h.end, room: h.room || s.room });
  return out.sort((a, b) => a.start.localeCompare(b.start));
}
function activityDates() {
  const set = new Set();
  for (const t of S.tasks) if (t.done && t.doneAt) set.add(toISO(new Date(t.doneAt)));
  for (const f of S.focus) set.add(f.d);
  return set;
}
function streak() {
  const set = activityDates();
  let d = today();
  if (!set.has(d)) d = addDays(d, -1);
  let n = 0;
  while (set.has(d)) { n++; d = addDays(d, -1); }
  return n;
}

/* =========================================================
   6. Interfaz: toasts, preguntas, hojas
   ========================================================= */
function toast(msg, opts = {}) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="toast-leaf">${leafSVG('#8CCB8A')}</span><p>${esc(msg)}</p>${opts.action ? `<button type="button">${esc(opts.action)}</button>` : ''}`;
  const kill = () => el.remove();
  if (opts.action) el.querySelector('button').addEventListener('click', () => { kill(); opts.onAction && opts.onAction(); });
  box.replaceChildren(el);
  setTimeout(kill, opts.ms || (opts.action ? 6000 : 3200));
}

function ask({ title, text = '', ok = 'Aceptar', cancel = 'Cancelar', danger = false, input = null, options = null }) {
  return new Promise((resolve) => {
    const d = $('#ask');
    d.innerHTML = `<form method="dialog">
      <h3 class="serif">${esc(title)}</h3>
      ${text ? `<p>${esc(text)}</p>` : ''}
      ${input ? `<div class="field"><input class="input" id="askIn" autocomplete="off" type="${input.type || 'text'}" placeholder="${esc(input.placeholder || '')}" value="${esc(input.value || '')}"></div>` : ''}
      ${options ? `<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">${options.map((o) => `<button class="btn block" value="${esc(o.value)}">${o.icon ? icon(o.icon) : ''}${esc(o.label)}</button>`).join('')}</div>` : ''}
      <div class="btn-row" style="flex-direction:row-reverse;justify-content:flex-start">
        ${options ? '' : `<button class="btn ${danger ? 'danger' : 'primary'}" value="ok">${esc(ok)}</button>`}
        <button class="btn" value="cancel" formnovalidate>${esc(cancel)}</button>
      </div></form>`;
    d.returnValue = '';
    d.showModal();
    if (input) setTimeout(() => $('#askIn')?.focus(), 30);
    d.addEventListener('close', () => {
      const v = d.returnValue;
      if (input) resolve(v === 'ok' ? ($('#askIn')?.value || '').trim() : null);
      else if (options) resolve(v && v !== 'cancel' ? v : null);
      else resolve(v === 'ok');
    }, { once: true });
  });
}

const sheet = () => $('#sheet');
let onSheetClose = null;
function openSheet(html, onClose) {
  const d = sheet();
  d.innerHTML = html;
  onSheetClose = onClose || null;
  if (!d.open) d.showModal();
  d.querySelector('.sheet-body')?.scrollTo(0, 0);
}
function closeSheet(runHandler = true) {
  const d = sheet();
  if (!runHandler) onSheetClose = null;
  if (d.open) d.close();
}
function sheetHead(title) {
  return `<div class="handle" aria-hidden="true"></div><div class="sheet-head"><h2 id="sheetTitle">${esc(title)}</h2>
    <button type="button" class="icon-btn ghost" data-act="sheet-close" aria-label="Cerrar">${icon('x')}</button></div>`;
}

/* =========================================================
   7. Vistas
   ========================================================= */
const UI = {
  tf: 'pend', ts: 'all', tt: 'all', q: '',
  calMonth: today().slice(0, 7), calSel: today(), calTab: 'mes',
  wStep: 0, apa: 'web', notesQ: '',
};
function route() {
  const h = location.hash.replace(/^#\/?/, '') || 'hoy';
  const [name, ...rest] = h.split('/');
  return { name, arg: decodeURIComponent(rest.join('/')) };
}

const uploadLabel = (t) => (['impreso', 'clase'].includes(t.delivery) ? 'Entregada en clase' : 'Subida a plataforma');
function urgencyTone(t) {
  if (t.done || !t.due) return '';
  const d = diffDays(today(), t.due);
  return d <= 1 ? 'tone-hot' : d <= 3 ? 'tone-warm' : 'tone-calm';
}
function taskRow(t, extra = '') {
  const s = subj(t.subjectId);
  const half = t.made && !t.done;
  const st = dueState(t);
  const nSteps = t.steps.length, dSteps = t.steps.filter((x) => x.done).length;
  const meta = [];
  if (t.done) meta.push(`<span>Entregada ${t.doneAt ? relDay(toISO(new Date(t.doneAt))) : ''}</span>`);
  else meta.push(t.due ? `<span class="tone ${urgencyTone(t)}" aria-hidden="true"></span><span class="when ${st.cls}">${esc(st.label)}</span>` : '<span class="faint">Sin fecha</span>');
  if (half) meta.push(`<span class="tag need-up">Hecha · falta ${uploadLabel(t) === 'Entregada en clase' ? 'entregarla' : 'subirla'}</span>`);
  if (s) meta.push(`<span>${esc(s.name)}</span>`);
  if (t.type !== 'tarea') meta.push(`<span class="tag">${TYPES[t.type].label}</span>`);
  if (t.priority === 3 && !t.done) meta.push(`<span class="tag" style="color:var(--red)">${icon('flag')}Alta</span>`);
  if (nSteps && !t.done) meta.push(`<span>${dSteps}/${nSteps} pasos</span>`);
  if (t.comments?.length) meta.push(`<span class="tag">${icon('note')}${t.comments.length}</span>`);
  if (t.photos?.length) meta.push(`<span class="tag">${icon('cam')}${t.photos.length}</span>`);
  if (t.remind && !t.done && new Date(t.remind).getTime() > Date.now()) meta.push(`<span class="tag">${icon('bell')}</span>`);
  return `<li class="task ${t.done ? 'done' : ''} ${half ? 'half' : ''}" data-id="${t.id}">
    <span class="hl" style="background:${s ? safeColor(s.color) : 'var(--line)'}"></span>
    <button type="button" class="chk" data-act="toggle-task" data-id="${t.id}" role="checkbox" aria-checked="${t.done}" aria-label="${t.done ? 'Marcar como pendiente' : half ? `Marcar como ${uploadLabel(t).toLowerCase()}` : 'Marcar como hecha'}: ${esc(t.title)}"><span class="box">${icon('check')}</span></button>
    <button type="button" class="body" data-act="open-task" data-id="${t.id}">
      <span class="title">${esc(t.title)}</span>
      <span class="meta">${meta.join('')}</span>
      ${extra}
    </button>
    ${t.done && hasGrade(t) ? `<span class="grade" aria-label="Calificación">${fmtGrade(t.grade)}</span>` : ''}
  </li>`;
}
function groupedList(tasks, opts = {}) {
  const by = {};
  for (const t of tasks) (by[bucketOf(t)] ||= []).push(t);
  let html = '';
  for (const [k, label] of BUCKETS) {
    if (!by[k] || (opts.only && !opts.only.includes(k))) continue;
    html += `<div class="group-h ${k === 'late' ? 'late' : ''}">${label}<span class="count">${by[k].length}</span></div>
      <ul class="tasks">${by[k].map((t) => taskRow(t)).join('')}</ul>`;
  }
  return html;
}

/* ---------- Hoy ---------- */
function viewHoy() {
  const t0 = today();
  const d = new Date();
  const hr = d.getHours();
  const greet = hr < 12 ? 'Buenos días' : hr < 19 ? 'Buenas tardes' : 'Buenas noches';
  const pend = pendingTasks();
  const late = pend.filter((t) => bucketOf(t) === 'late');
  const dueToday = pend.filter((t) => bucketOf(t) === 'today');
  let summary;
  if (!S.tasks.length) summary = 'Aún no tienes tareas. Escribe la primera aquí abajo, como se la dirías a un compañero.';
  else if (!pend.length) summary = 'No tienes entregas pendientes. Vas al día.';
  else {
    summary = `Tienes ${plural(pend.length, 'entrega pendiente', 'entregas pendientes')}`;
    if (late.length) summary += `, <span class="late">${plural(late.length, 'atrasada', 'atrasadas')}</span>`;
    if (dueToday.length) summary += `. ${dueToday.length === 1 ? 'Una vence' : `${dueToday.length} vencen`} hoy.`;
    else {
      const next = pend.find((t) => t.due && diffDays(t0, t.due) >= 0);
      summary += next ? `. La próxima es ${relDay(next.due)}.` : '.';
    }
  }

  // clase actual / siguiente
  let nowHTML = '';
  const cls = classesOn(d.getDay());
  if (cls.length) {
    const nm = nowMin();
    const cur = cls.find((c) => toMin(c.start) <= nm && nm < toMin(c.end));
    const nxt = cls.find((c) => toMin(c.start) > nm);
    const c = cur || nxt;
    if (c) {
      nowHTML = `<a class="now" href="#/materia/${c.s.id}" style="text-decoration:none;color:inherit">
        <span class="bar" style="background:${safeColor(c.s.color)}"></span>
        <span><span class="lbl">${cur ? 'En clase ahora' : 'Siguiente clase'}</span>
        <b>${esc(c.s.name)}</b>
        <span class="small muted">${cur ? `Termina a las ${fmtTime(c.end)}` : `Empieza a las ${fmtTime(c.start)}`}${c.room ? `, salón ${esc(c.room)}` : ''}</span></span></a>`;
    }
  }

  // instalar
  let installHTML = '';
  if (!isStandalone() && !S.settings.installDismissed && (deferredInstall || isIOS())) {
    installHTML = `<div class="banner">${icon('phone')}<p>Instala Al Día en tu pantalla de inicio para abrirla como app, aun sin internet.</p>
      <button class="btn primary" data-act="install">Instalar</button><button class="icon-btn ghost" data-act="install-dismiss" aria-label="Ocultar">${icon('x')}</button></div>`;
  }

  // plan
  const plan = planHoy();
  const top = pend.length >= 2 ? plan.top : [];
  const planIds = new Set(top.map((p) => p.t.id));
  let planHTML = '';
  if (plan.steps.length || top.length) {
    planHTML = `<h2 class="sec">Plan de hoy <small>lo que conviene avanzar</small></h2><ul class="tasks plan">`;
    for (const p of top) planHTML += taskRow(p.t, `<span class="why">Porque ${esc(joinNatural(p.why))}.</span>`);
    for (const { t, st } of plan.steps.slice(0, 6)) {
      const s = subj(t.subjectId);
      planHTML += `<li class="task step-row">
        <span class="hl" style="background:${s ? safeColor(s.color) : 'var(--line)'}"></span>
        <button type="button" class="chk" data-act="toggle-step" data-id="${t.id}" data-step="${st.id}" role="checkbox" aria-checked="false" aria-label="Marcar paso: ${esc(st.text)}"><span class="box">${icon('check')}</span></button>
        <button type="button" class="body" data-act="open-task" data-id="${t.id}"><span class="title">${esc(st.text)}</span>
        <span class="meta"><span>Paso de: ${esc(t.title)}</span>${st.date < t0 ? '<span class="when late">Era para antes</span>' : ''}</span></button></li>`;
    }
    planHTML += '</ul>';
  }

  // avisos de carga
  const urgent = pend.filter((t) => { const ms = deadlineMs(t); return ms != null && ms > Date.now() && ms - Date.now() <= 24 * 3600000; });
  const emergencyHTML = urgent.length ? `<section class="emergency"><h2 class="serif">Menos de 24 horas</h2>
    <p class="small muted" style="margin:0 0 10px">Respira. Una cosa a la vez.</p>
    <ul class="tasks">${urgent.map((t) => taskRow(t, `<span class="why">Quedan ${fmtLeft(deadlineMs(t) - Date.now())}</span>`)).join('')}</ul></section>` : '';
  const heavy = heavyDays();
  const heavyHTML = heavy.length ? `<div class="banner warn">${icon('bell')}<p>${cap(relDay(heavy[0][0]))} tienes ${heavy[0][1]} entregas. Adelanta alguna desde hoy para no juntarte.</p></div>` : '';

  // lista
  const rest = pend.filter((t) => !planIds.has(t.id));
  let soon = rest.filter((t) => ['late', 'today', 'tomorrow', 'week'].includes(bucketOf(t)));
  if (soon.length < 3) soon = rest.slice(0, Math.max(3, soon.length));
  const later = rest.length - soon.length;
  let listHTML = '';
  if (pend.length) {
    listHTML = `<h2 class="sec">${top.length ? 'Lo demás' : 'Próximas entregas'}</h2>`;
    listHTML += soon.length ? groupedList(soon) : '<p class="muted">Nada más por ahora.</p>';
    if (later) listHTML += `<p style="margin-top:14px"><a href="#/tareas" class="link-btn">Ver ${plural(later, 'entrega', 'entregas')} más adelante</a></p>`;
  }
  const doneToday = S.tasks.filter((t) => t.done && t.doneAt && toISO(new Date(t.doneAt)) === t0);
  if (doneToday.length) listHTML += `<h2 class="sec">Entregadas hoy <small>${doneToday.length}</small></h2><ul class="tasks">${doneToday.map((t) => taskRow(t)).join('')}</ul>`;

  const emptyHTML = !S.tasks.length ? `<div class="card help" style="margin-top:22px">
      <p><b>Así se usa la captura rápida.</b> Escribe con tus palabras y Al Día entiende la fecha, la hora y la materia:</p>
      <ul><li><span class="kbd">ensayo de historia para el viernes</span></li><li><span class="kbd">examen de inglés el 30/10 a las 8</span></li>
      <li><span class="kbd">proyecto final mercadotecnia en 2 semanas vale 30%</span></li><li><span class="kbd">leer capítulo 3 mañana urgente</span></li></ul>
      ${S.subjects.length ? '' : '<p>Primero agrega tus materias para que las reconozca. <a href="#/materias">Agregar materias</a></p>'}</div>` : '';

  return `<section class="today-head"><div class="today-wrap">
      <div class="today-top"><p class="greet">${greet}, ${esc(profile().name)}</p>
        <div class="head-actions">
          <button type="button" class="who-chip" data-act="profile-sheet" aria-label="Usuario: ${esc(profile().name)}. Cambiar de usuario">${avatar(profile(), 'sm')}<span>${esc(profile().name)}</span></button>
          <a class="icon-btn" href="#/ajustes" aria-label="Ajustes">${icon('gear')}</a>
        </div></div>
      <h1 class="bigdate"><span class="wd">${cap(DIAS[d.getDay()])}</span>${d.getDate()} de ${MESES[d.getMonth()]}</h1>
      <p class="summary">${summary}</p>
      ${suggestion() ? `<p class="smart">${icon('spark', 'sm')}<span>${esc(suggestion())}</span></p>` : ''}
      <p class="phrase">${leafSVG('#7DBE7A')}<span>${esc(phraseOfDay())}</span></p>
    </div></section>
    ${inviteBannerHTML()}
    ${homeTreeHTML()}
    ${plusHomeHTML()}
    ${lettersHTML()}
    ${!isGroup() && otherProfile() ? `<button type="button" class="letter-write" data-act="letter-write">${icon('heart', 'sm')}<span>Escribirle a ${esc(otherProfile().name)}</span>${(REG.letters || []).some((l) => l.from === REG.current && l.to === otherProfile().id && !l.read) ? `<span class="tiny faint">· tu mensaje aún no lo abre</span>` : ''}</button>` : ''}
    <form class="quick" id="quickForm" autocomplete="off">
      <div class="quick-row">
        <label for="quickIn" class="sr">Nueva tarea rápida</label>
        <input id="quickIn" enterkeyhint="done" placeholder="Ej. exposición de inglés el martes">
        <button class="quick-go" id="quickGo" disabled>${icon('plus', 'sm')}Agregar</button>
      </div>
      <div class="quick-preview" id="quickPrev"></div>
    </form>
    <div class="btn-row" style="margin-top:10px"><a class="btn" href="#/escanear">${icon('cam')}Escanear foto de tarea</a><button class="btn" data-act="speak-day">${icon('play')}Escuchar mi día</button></div>
    ${installHTML}${nowHTML}${emergencyHTML}${plantHTML()}${S.tasks.length ? loadMeterHTML() : ''}${heavyHTML}${planHTML}${listHTML}${emptyHTML}`;
}
function quickPreviewHTML(p) {
  if (!$('#quickIn')?.value.trim()) return '';
  const s = subj(p.subjectId);
  const chips = [];
  chips.push(p.due ? `<span class="chip pen">${icon('cal', 'sm')}${esc(cap(relDay(p.due)))}${diffDays(today(), p.due) > 1 ? `, ${esc(shortDate(p.due))}` : ''}</span>` : `<span class="chip">${icon('cal', 'sm')}Sin fecha</span>`);
  if (p.time) chips.push(`<span class="chip">${icon('clock', 'sm')}${fmtTime(p.time)}</span>`);
  if (s) chips.push(`<span class="chip"><span class="dot" style="background:${safeColor(s.color)}"></span>${esc(s.name)}</span>`);
  if (p.type) chips.push(`<span class="chip">${TYPES[p.type].label}</span>`);
  if (p.priority === 3) chips.push(`<span class="chip warn">${icon('flag', 'sm')}Prioridad alta</span>`);
  if (p.value) chips.push(`<span class="chip">Vale ${p.value}%</span>`);
  chips.push('<button type="button" class="quick-more" data-act="quick-more">Más detalles</button>');
  return chips.join('');
}

function deadlineMs(t) {
  if (!t.due) return null;
  const d = fromISO(t.due); const [h, m] = (t.time || '23:59').split(':').map(Number); d.setHours(h, m, 0, 0); return d.getTime();
}
function fmtLeft(ms) { const h = Math.floor(ms / 3600000); return h >= 1 ? `${h} h ${Math.round((ms % 3600000) / 60000)} min` : `${Math.max(1, Math.round(ms / 60000))} min`; }
const TYPE_MIN = { tarea: 45, proyecto: 180, examen: 120, exposicion: 120, lectura: 40, practica: 60, otro: 45 };
function loadInfo() {
  const t0 = today(); let min = 0, n = 0;
  for (const t of S.tasks) {
    if (t.done || !t.due || diffDays(t0, t.due) > 7) continue;
    const base = +t.estimate || TYPE_MIN[t.type] || 45;
    const stepsLeft = t.steps.length ? t.steps.filter((x) => !x.done).length / t.steps.length : 1;
    min += t.made ? 5 : base * stepsLeft; n++;
  }
  const ratio = min / (7 * 120);
  const lv = ratio < 0.45 ? ['calm', 'En calma', 'Vas con buen ritmo. Disfruta el tiempo libre sin culpa.']
    : ratio < 0.8 ? ['steady', 'Ritmo sostenible', 'Un bloque de enfoque al día te mantiene así de tranquilo.']
    : ratio < 1.1 ? ['warm', 'Carga alta', 'Divide lo grande en pasos y reparte uno por día. Y date un respiro entre bloques.']
    : ['hot', 'Mucha carga', 'Es demasiado para una semana. Elige lo que más vale, pide prórroga si se puede y descansa bien hoy.'];
  return { min, n, ratio, lv };
}
function loadMeterHTML() {
  const L = loadInfo();
  return `<section class="meter meter-${L.lv[0]}"><div class="meter-top"><b class="serif">${L.lv[1]}</b><span class="small muted">${fmtMinutes(L.min)} de trabajo en 7 días</span></div>
    <div class="meter-bar"><i style="width:${Math.min(100, Math.round(L.ratio * 100))}%"></i></div>
    <p class="small" style="margin:8px 0 0">${L.lv[2]}</p>
    ${L.ratio >= 0.8 ? '<a class="btn quiet" href="#/enfoque" style="padding-left:0">Empezar un bloque con música de fondo</a>' : ''}</section>`;
}

async function fillSnapList() {
  const box = $('#snapList'); if (!box) return;
  const list = await autoBackups();
  if (!$('#snapList')) return;
  box.innerHTML = list.length ? list.map((b, i) => `<div class="toggle"><span><span class="t">${cap(longDate(b.d))}</span><span class="d" style="display:block">${plural(b.data.tasks?.length || 0, 'tarea', 'tareas')}, guardado ${new Date(b.at).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}</span></span>
    <span class="btn-row"><button class="btn ico" data-act="auto-download" data-i="${i}" aria-label="Descargar copia">${icon('save')}</button><button class="btn" data-act="auto-restore" data-i="${i}">Restaurar</button></span></div>`).join('')
    : '<p class="small muted" style="margin:0">La primera copia se guarda con tu próximo cambio.</p>';
}

/* Fotos adjuntas (se guardan en el dispositivo, comprimidas) */
const photoURLs = new Map();
function compressPhoto(file, max = 1600) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(img.src);
      c.toBlob((b) => (b ? res(b) : rej(new Error('img'))), 'image/jpeg', 0.8);
    };
    img.onerror = () => rej(new Error('img'));
    img.src = URL.createObjectURL(file);
  });
}
async function savePhoto(file) { const blob = await compressPhoto(file); const id = 'f' + uid(); await DB.put('files', id, blob); return id; }
async function photoURL(id) {
  if (photoURLs.has(id)) return photoURLs.get(id);
  const b = await DB.get('files', id).catch(() => null); if (!b) return null;
  const u = URL.createObjectURL(b); photoURLs.set(id, u); return u;
}
function hydratePhotos() {
  $$('img[data-photo]:not([src])').forEach(async (img) => { const u = await photoURL(img.dataset.photo); if (u) img.src = u; else img.closest('.ph')?.remove(); });
}
function photosHTML(ids) {
  return (ids || []).map((id) => `<span class="ph"><button type="button" data-act="photo-view" data-id="${id}" aria-label="Ver foto"><img data-photo="${id}" alt=""></button>
    <button type="button" class="ph-x" data-act="photo-del" data-id="${id}" aria-label="Quitar foto">${icon('x', 'sm')}</button></span>`).join('');
}

/* Leer en voz alta (funciona sin internet en iPhone y Android) */
/* ---------- Voz calmada ---------- */
const VOICE = {
  list: [],
  prefs() { return { name: REG.voice || '', rate: REG.voiceRate || 0.88 }; },
  load() {
    if (!('speechSynthesis' in window)) return;
    const all = speechSynthesis.getVoices().filter((v) => /^es/i.test(v.lang));
    // mejores primero: voces mejoradas/premium y de México, luego el resto en español
    const score = (v) => (/premium|enhanced|mejorada|neural|natural/i.test(v.name) ? 100 : 0) + (/MX/i.test(v.lang) ? 30 : /US|419/i.test(v.lang) ? 20 : /ES/i.test(v.lang) ? 10 : 0)
      + (/paulina|m[oó]nica|marisol|sof[ií]a|isabela|helena|google/i.test(v.name) ? 15 : 0) + (v.localService ? 5 : 0) - (/eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|albert|bad|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox/i.test(v.name) ? 200 : 0);
    this.list = all.sort((a, b) => score(b) - score(a)).filter((v) => score(v) > -100);
  },
  pick() { const n = this.prefs().name; return this.list.find((v) => v.name === n) || this.list[0] || null; },
};
if ('speechSynthesis' in window) { VOICE.load(); speechSynthesis.addEventListener?.('voiceschanged', () => VOICE.load()); }
let speakingNow = false;
function speakChunks(text) {
  // Se divide en frases cortas: así iOS no corta la lectura a la mitad y las pausas suenan naturales
  const clean = String(text).replace(/\s+/g, ' ').replace(/\s*[-•]\s+/g, '. ').trim();
  const parts = clean.match(/[^.!?;:\n]+[.!?;:]?/g) || [clean];
  const chunks = []; let cur = '';
  for (const p of parts) { if ((cur + ' ' + p).length > 180 && cur) { chunks.push(cur); cur = p; } else cur = (cur + ' ' + p).trim(); }
  if (cur) chunks.push(cur);
  return chunks.filter((c) => c.trim());
}
function speak(text) {
  if (!('speechSynthesis' in window)) { toast('Este dispositivo no puede leer en voz alta.'); return; }
  const sy = window.speechSynthesis;
  if (speakingNow || sy.speaking) { sy.cancel(); speakingNow = false; toast('Lectura detenida.'); return; }
  if (!VOICE.list.length) VOICE.load();
  const v = VOICE.pick(); const rate = VOICE.prefs().rate;
  const chunks = speakChunks(text);
  if (!chunks.length) return;
  speakingNow = true;
  let i = 0;
  const next = () => {
    if (!speakingNow || i >= chunks.length) { speakingNow = false; return; }
    const u = new SpeechSynthesisUtterance(chunks[i++]);
    u.lang = v?.lang || 'es-MX'; if (v) u.voice = v;
    u.rate = rate; u.pitch = 0.95; u.volume = 1;
    u.onend = () => setTimeout(next, 260); // pausa breve y tranquila entre frases
    u.onerror = () => { speakingNow = false; };
    sy.speak(u);
  };
  sy.cancel(); setTimeout(next, 60);
  toast('Leyendo… toca otra vez para detener.');
}
function voiceSettingsHTML() {
  if (!('speechSynthesis' in window)) return '';
  if (!VOICE.list.length) VOICE.load();
  const cur = VOICE.pick()?.name || '';
  return `<h2 class="sec">Voz de lectura</h2>
    <div class="card">
      <div class="field"><label for="voiceSel">Voz</label>
        <select id="voiceSel" class="input" data-voice>${VOICE.list.length ? VOICE.list.map((v) => `<option value="${esc(v.name)}" ${v.name === cur ? 'selected' : ''}>${esc(v.name.replace(/\s*\(.*\)$/, ''))} · ${esc(v.lang)}${/premium|enhanced|mejorada/i.test(v.name) ? ' ★' : ''}</option>`).join('') : '<option>Voz del sistema</option>'}</select></div>
      <div class="field"><label for="voiceRate">Velocidad: <span id="rateLbl">${VOICE.prefs().rate < 0.85 ? 'muy calmada' : VOICE.prefs().rate < 0.95 ? 'calmada' : VOICE.prefs().rate < 1.05 ? 'normal' : 'rápida'}</span></label>
        <input id="voiceRate" type="range" min="0.7" max="1.15" step="0.01" value="${VOICE.prefs().rate}" data-voice-rate style="accent-color:var(--pen)"></div>
      <button class="btn" data-act="voice-test">${icon('play')}Probar voz</button>
      <p class="small muted" style="margin:12px 0 0">Para una voz más natural en iPhone o iPad: Configuración, Accesibilidad, Contenido leído, Voces, Español (México) y descarga una voz <b>Mejorada</b> (por ejemplo Paulina). Luego elígela aquí; tiene ★.</p>
    </div>`;
}

/* ---------- Resumen inteligente (sin internet) ---------- */
const KEY_WORDS = /\b(entreg|fecha|limite|minimo|maximo|cuartilla|pagina|hoja|cuartillas|palabras|apa|formato|pdf|word|portada|indice|rubrica|equipo|individual|calific|vale|puntos|porcentaje|%|examen|expo|diapositiva|impres|plataforma|classroom|correo|incluir|incluye|debe|deben|obligatori|importante|no olvid|requisit|fuente|referencia|bibliograf|conclusion|introduccion|tema)/;
function summarize(text, max = 4) {
  const sents = String(text || '').replace(/\s+/g, ' ').match(/[^.!?\n]+[.!?]?/g)?.map((x) => x.trim()).filter((x) => x.length > 12) || [];
  if (!sents.length) return [];
  const freq = {};
  for (const w of normChars(text).match(/[a-z]{4,}/g) || []) if (!STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
  const scored = sents.map((st, i) => {
    const n = normChars(st); let sc = 0;
    for (const w of n.match(/[a-z]{4,}/g) || []) sc += Math.min(3, freq[w] || 0);
    sc = sc / Math.sqrt((n.match(/[a-z]+/g) || []).length || 1);
    if (KEY_WORDS.test(n)) sc += 3; if (/\d/.test(st)) sc += 1.5; if (i === 0) sc += 1;
    return { st, i, sc };
  });
  return scored.sort((a, b) => b.sc - a.sc).slice(0, max).sort((a, b) => a.i - b.i).map((x) => x.st.replace(/[.;,]+$/, '') + '.');
}
function keyFacts(text) {
  const n = normChars(text); const f = [];
  const m1 = /(minimo|maximo|de)?\s*(\d+)\s*(cuartillas?|paginas?|hojas?|diapositivas?|palabras|cuartilla)/.exec(n); if (m1) f.push(`Extensión: ${m1[1] && m1[1] !== 'de' ? ({ minimo: 'mínimo', maximo: 'máximo' })[m1[1]] + ' ' : ''}${m1[2]} ${m1[3].replace('paginas', 'páginas').replace('pagina', 'página')}`);
  if (/\bapa\b/.test(n)) f.push('Referencias en formato APA');
  if (/\ben equipo|por equipos?\b/.test(n)) f.push('Es en equipo'); else if (/\bindividual\b/.test(n)) f.push('Es individual');
  const fm = /\b(pdf|word|power ?point|impres[oa]|a mano|manuscrit[oa])\b/.exec(n); if (fm) f.push(`Formato: ${({ pdf: 'PDF', word: 'Word', powerpoint: 'PowerPoint', 'power point': 'PowerPoint', impreso: 'impreso', impresa: 'impreso', 'a mano': 'a mano', manuscrito: 'a mano', manuscrita: 'a mano' })[fm[1]] || fm[1]}`);
  if (/\bportada\b/.test(n)) f.push('Lleva portada');
  if (/\brubrica\b/.test(n)) f.push('Revisa la rúbrica');
  return f;
}
function taskSummary(t) {
  const s = subj(t.subjectId);
  const all = [t.desc, ...(t.comments || []).map((c) => c.text)].filter(Boolean).join('. ');
  const facts = [];
  if (t.due) facts.push(`Entrega ${relDay(t.due)}${t.time ? ` a las ${fmtTime(t.time)}` : ''}${diffDays(today(), t.due) >= 0 ? ` (quedan ${diffDays(today(), t.due)} ${diffDays(today(), t.due) === 1 ? 'día' : 'días'})` : ''}`);
  if (s) facts.push(`Materia: ${s.name}${s.important ? ' (importante)' : ''}`);
  if (+t.value) facts.push(`Vale ${+t.value}% de la calificación`);
  if (t.delivery) facts.push(`Se entrega: ${DELIVERY[t.delivery].toLowerCase()}`);
  facts.push(...keyFacts(all));
  const left = (t.steps || []).filter((x) => !x.done);
  if (left.length) facts.push(`Siguiente paso: ${left[0].text}${left.length > 1 ? ` (y ${left.length - 1} más)` : ''}`);
  if (t.made && !t.done) facts.push(`Ya está hecha: falta ${uploadLabel(t).toLowerCase()}`);
  return { facts, points: summarize(all, 3) };
}
function summaryHTML(t) {
  const { facts, points } = taskSummary(t);
  if (!facts.length && !points.length) return '';
  return `<div class="summary-card"><div class="sum-head"><b class="serif">Lo más importante</b><button type="button" class="btn quiet" data-act="summary-speak">${icon('play')}Escuchar</button></div>
    <ul>${facts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    ${points.length ? `<p class="small muted" style="margin:8px 0 4px">De las instrucciones y comentarios:</p><ul>${points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div>`;
}
function summarySpeech(t) {
  const { facts, points } = taskSummary(t);
  return `${t.title}. ${facts.join('. ')}. ${points.join(' ')}`;
}
function taskSpeech(t) {
  const s = subj(t.subjectId);
  return [t.title, s ? `de ${s.name}` : '', t.due ? `Se entrega ${relDay(t.due)}${t.time ? ` a las ${fmtTime(t.time)}` : ''}.` : 'Sin fecha.',
    t.desc ? `Instrucciones: ${t.desc}` : '', t.steps.filter((x) => !x.done).length ? `Pasos pendientes: ${t.steps.filter((x) => !x.done).map((x) => x.text).join('. ')}.` : ''].filter(Boolean).join(' ');
}
function daySpeech() {
  const pend = pendingTasks();
  if (!pend.length) return 'No tienes entregas pendientes. Vas al día.';
  const soon = pend.filter((t) => t.due && diffDays(today(), t.due) <= 2);
  return `Tienes ${plural(pend.length, 'entrega pendiente', 'entregas pendientes')}. ` + (soon.length ? soon.map((t) => `${t.title}, ${t.due < today() ? 'atrasada' : relDay(t.due)}`).join('. ') + '.' : 'Nada urgente en los próximos dos días.');
}
const fmtStamp = (ms) => { const d = new Date(ms); return `${cap(relDay(toISO(d)))}, ${d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}`; };
function commentsHTML() {
  const cs = draft.comments || [];
  return cs.length ? cs.map((c) => `<li class="comment"><p>${esc(c.text)}</p><span class="tiny faint">${fmtStamp(c.at)}</span>
    <button type="button" class="rm" data-act="comment-del" data-id="${c.id}" aria-label="Borrar comentario">${icon('x', 'sm')}</button></li>`).join('') : '';
}
function checkDueReminders() {
  const now = Date.now(); let changed = false;
  for (const t of S.tasks) {
    if (!t.remind || t.remindShown || t.done) continue;
    const at = new Date(t.remind).getTime();
    if (at <= now) { t.remindShown = true; changed = true; toast(`Recordatorio: ${t.title}`, { action: 'Abrir', ms: 9000, onAction: () => openTask(t.id) }); }
  }
  if (changed) save();
}

/* ---------- Tareas ---------- */
function viewTareas() {
  const counts = { pend: S.tasks.filter((t) => !t.done).length, done: S.tasks.filter((t) => t.done).length };
  return `<h1 class="page-title">Tareas</h1>
    <p class="page-sub">${plural(counts.pend, 'pendiente', 'pendientes')} y ${plural(counts.done, 'entregada', 'entregadas')}.</p>
    <div class="seg full" role="group" aria-label="Mostrar">
      ${[['pend', 'Pendientes'], ['done', 'Entregadas'], ['all', 'Todas']].map(([k, l]) => `<button type="button" data-act="tf" data-v="${k}" aria-pressed="${UI.tf === k}">${l}</button>`).join('')}
    </div>
    <div class="quick" style="margin-top:12px;box-shadow:none"><div class="quick-row">${icon('search')}<label for="taskQ" class="sr">Buscar</label>
      <input id="taskQ" type="search" placeholder="Buscar tareas" value="${esc(UI.q)}"></div></div>
    ${S.subjects.length ? `<div class="chips" style="margin-top:12px" role="group" aria-label="Materia">
      <button type="button" class="fchip" data-act="ts" data-v="all" aria-pressed="${UI.ts === 'all'}">Todas las materias</button>
      ${S.subjects.map((s) => `<button type="button" class="fchip" data-act="ts" data-v="${s.id}" aria-pressed="${UI.ts === s.id}"><span class="dot" style="background:${safeColor(s.color)}"></span>${esc(s.name)}</button>`).join('')}
    </div>` : ''}
    <div class="chips" role="group" aria-label="Tipo">
      <button type="button" class="fchip" data-act="tt" data-v="all" aria-pressed="${UI.tt === 'all'}">Cualquier tipo</button>
      ${Object.entries(TYPES).map(([k, v]) => `<button type="button" class="fchip" data-act="tt" data-v="${k}" aria-pressed="${UI.tt === k}">${v.label}</button>`).join('')}
    </div>
    <div id="taskList">${taskListHTML()}</div>`;
}
function taskListHTML() {
  const q = normChars(UI.q.trim());
  let list = S.tasks.filter((t) => (UI.tf === 'all' || (UI.tf === 'pend' ? !t.done : t.done))
    && (UI.ts === 'all' || t.subjectId === UI.ts) && (UI.tt === 'all' || t.type === UI.tt)
    && (!q || normChars(`${t.title} ${t.desc} ${subj(t.subjectId)?.name || ''}`).includes(q)));
  if (!S.tasks.length) return `<div class="empty" style="margin-top:20px"><h3>Sin tareas todavía</h3><p>Agrega lo que te dejaron con el botón azul. Al Día te avisa qué toca primero.</p><button class="btn primary" data-act="new-task">${icon('plus')}Nueva tarea</button></div>`;
  if (!list.length) return `<div class="empty" style="margin-top:20px"><h3>No hay tareas con esos filtros</h3><p>Prueba con otra materia o tipo.</p><button class="btn" data-act="clear-filters">Quitar filtros</button></div>`;
  if (UI.tf === 'done') {
    list.sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
    return `<ul class="tasks" style="margin-top:14px">${list.map((t) => taskRow(t)).join('')}</ul>`;
  }
  const pend = list.filter((t) => !t.done).sort(sortPending);
  const done = list.filter((t) => t.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
  let html = groupedList(pend);
  if (UI.tf === 'all' && done.length) html += `<div class="group-h">Entregadas<span class="count">${done.length}</span></div><ul class="tasks">${done.map((t) => taskRow(t)).join('')}</ul>`;
  return html;
}

/* ---------- Calendario ---------- */
function viewCalendario() {
  return `<h1 class="page-title">Calendario</h1>
    <div class="seg" role="group" aria-label="Vista" style="margin:6px 0 4px">
      <button type="button" data-act="caltab" data-v="mes" aria-pressed="${UI.calTab === 'mes'}">Mes</button>
      <button type="button" data-act="caltab" data-v="horario" aria-pressed="${UI.calTab === 'horario'}">Horario de clases</button>
    </div>
    ${UI.calTab === 'mes' ? monthHTML() : timetableHTML()}`;
}
function monthHTML() {
  const [y, m] = UI.calMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1, 12);
  const startOffset = (first.getDay() + 6) % 7; // lunes primero
  const days = new Date(y, m, 0).getDate();
  const t0 = today();
  const byDate = {};
  for (const t of S.tasks) if (t.due) (byDate[t.due] ||= []).push(t);
  let cells = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => `<div class="dow" aria-hidden="true" title="${['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'][i]}">${d}</div>`).join('');
  for (let i = 0; i < startOffset; i++) cells += '<div class="day out" aria-hidden="true"></div>';
  for (let d = 1; d <= days; d++) {
    const iso = `${y}-${pad(m)}-${pad(d)}`;
    const ts = (byDate[iso] || []).sort(sortPending);
    const pendCount = ts.filter((t) => !t.done).length;
    const hasLate = iso < t0 && pendCount > 0;
    const dots = ts.slice(0, 4).map((t) => `<i style="background:${t.done ? 'var(--line)' : safeColor(subj(t.subjectId)?.color || '#9AA6BF')}"></i>`).join('') + (ts.length > 4 ? `<i class="more">+${ts.length - 4}</i>` : '');
    cells += `<button type="button" class="day ${iso === t0 ? 'today' : ''} ${hasLate ? 'has-late' : ''}" data-act="calsel" data-v="${iso}" aria-pressed="${UI.calSel === iso}" aria-label="${longDate(iso)}${ts.length ? `, ${plural(ts.length, 'entrega', 'entregas')}` : ''}">
      <span class="n">${d}</span><span class="dots">${dots}</span></button>`;
  }
  const sel = UI.calSel;
  const selTasks = (byDate[sel] || []).sort((a, b) => a.done - b.done || sortPending(a, b));
  const cls = classesOn(fromISO(sel).getDay());
  return `<div class="cal-head">
      <button type="button" class="icon-btn" data-act="calnav" data-v="-1" aria-label="Mes anterior">${icon('back')}</button>
      <h2 class="serif">${cap(MESES[m - 1])} ${y}</h2>
      <button type="button" class="icon-btn" data-act="calnav" data-v="1" aria-label="Mes siguiente">${icon('chev')}</button>
    </div>
    <div class="cal">${cells}</div>
    ${UI.calMonth !== t0.slice(0, 7) ? `<p style="text-align:center;margin:10px 0 0"><button class="link-btn" data-act="caltoday">Ir a hoy</button></p>` : ''}
    <h2 class="sec">${cap(longDate(sel))} <small>${sel === t0 ? 'hoy' : ''}</small></h2>
    ${selTasks.length ? `<ul class="tasks">${selTasks.map((t) => taskRow(t)).join('')}</ul>` : '<p class="muted" style="margin:0 0 10px">No hay entregas este día.</p>'}
    <p><button class="btn" data-act="new-task" data-due="${sel}">${icon('plus')}Agregar tarea para este día</button></p>
    ${cls.length ? `<div class="group-h">Clases de ese día</div><div class="card" style="padding:6px 16px">${cls.map((c) => `<div class="toggle"><span><span class="t">${esc(c.s.name)}</span><span class="d" style="display:block">${fmtTime(c.start)} a ${fmtTime(c.end)}${c.room ? `, salón ${esc(c.room)}` : ''}</span></span><span class="dot" style="width:12px;height:12px;border-radius:50%;background:${safeColor(c.s.color)}"></span></div>`).join('')}</div>` : ''}`;
}
function timetableHTML() {
  const blocks = [];
  for (const s of S.subjects) for (const h of s.schedule || []) {
    const a = toMin(h.start), b = toMin(h.end);
    if (a != null && b != null && b > a) blocks.push({ s, day: +h.day, a, b, room: h.room || s.room });
  }
  if (!blocks.length) {
    return `<div class="empty" style="margin-top:18px"><h3>Tu horario aparece aquí</h3><p>Abre cada materia y agrega sus días y horas. Al Día te dirá en qué clase estás y cuál sigue.</p><a class="btn primary" href="#/materias">Ir a Materias</a></div>`;
  }
  const days = [1, 2, 3, 4, 5];
  if (blocks.some((b) => b.day === 6)) days.push(6);
  if (blocks.some((b) => b.day === 0)) days.push(0);
  const min = Math.floor(Math.min(...blocks.map((b) => b.a)) / 60) * 60;
  const max = Math.ceil(Math.max(...blocks.map((b) => b.b)) / 60) * 60;
  const PX = 1.1;
  const H = (max - min) * PX;
  const wd = new Date().getDay();
  const nm = nowMin();
  let times = '', lines = '';
  for (let m = min; m <= max; m += 60) {
    times += `<span style="top:${(m - min) * PX}px">${((Math.floor(m / 60) + 11) % 12) + 1}${m / 60 >= 12 ? 'p' : 'a'}</span>`;
    lines += `<div class="tt-line" style="top:${(m - min) * PX}px"></div>`;
  }
  let html = `<div class="tt" style="grid-template-columns:34px repeat(${days.length}, minmax(0,1fr))"><div></div>`;
  html += days.map((d) => `<div class="tt-h ${d === wd ? 'today' : ''}">${DIAS_C[d]}</div>`).join('');
  html += `<div class="tt-times" style="height:${H}px">${times}</div>`;
  for (const d of days) {
    const bs = blocks.filter((b) => b.day === d);
    html += `<div class="tt-col ${d === wd ? 'today' : ''}" style="height:${H}px">${lines}
      ${bs.map((b) => `<a class="tt-b" href="#/materia/${b.s.id}" style="top:${(b.a - min) * PX + 1}px;height:${(b.b - b.a) * PX - 2}px;background:color-mix(in srgb, ${safeColor(b.s.color)} 55%, #fff)" title="${esc(b.s.name)}">${esc(shortName(b.s))}${b.room ? `<small>${esc(b.room)}</small>` : ''}</a>`).join('')}
      ${d === wd && nm >= min && nm <= max ? `<div class="tt-now" style="top:${(nm - min) * PX}px"></div>` : ''}</div>`;
  }
  return html + '</div><p class="small muted" style="margin-top:12px">Toca una clase para ver su materia. El horario se edita en cada materia.</p>';
}

/* ---------- Materias ---------- */
function viewMaterias() {
  if (!S.subjects.length) {
    return `<h1 class="page-title">Materias</h1>
      <div class="empty" style="margin-top:14px"><h3>Agrega tus materias</h3><p>Con un color para cada una vas a reconocer tus entregas de un vistazo. Marca con estrella las más importantes.</p>
      <button class="btn primary" data-act="new-subject">${icon('plus')}Agregar materia</button></div>`;
  }
  const max = S.settings.gradeMax;
  const list = S.subjects.slice().sort((a, b) => (b.important - a.important) || a.name.localeCompare(b.name, 'es'));
  return `<h1 class="page-title">Materias</h1>
    <p class="page-sub">${plural(S.subjects.length, 'materia', 'materias')}. Tu promedio se calcula con las calificaciones que anotes en cada entrega.</p>
    ${list.map((s) => {
      const st = subjStats(s.id);
      const low = st.avg != null && st.avg < S.settings.passGrade;
      return `<a class="subj" href="#/materia/${s.id}">
        <span class="hl" style="background:${safeColor(s.color)}"></span>
        <span class="txt"><b>${esc(s.name)}${s.important ? `<svg class="i sm star" aria-label="Importante"><use href="#i-star"/></svg>` : ''}</b>
        <span>${st.pending.length ? plural(st.pending.length, 'pendiente', 'pendientes') : 'Sin pendientes'}${s.teacher ? `, ${esc(s.teacher)}` : ''}</span></span>
        <span class="avg">${st.avg != null ? `<b style="${low ? 'color:var(--red)' : ''}">${fmtGrade(Math.round(st.avg * 10) / 10)}</b><span>promedio</span>` : `<span>Sin calificar</span>`}</span>
      </a>`;
    }).join('')}
    <p style="margin-top:16px"><button class="btn" data-act="new-subject">${icon('plus')}Agregar materia</button></p>
    <p class="small muted">Escala de calificación: 0 a ${max}. Mínimo aprobatorio: ${fmtGrade(S.settings.passGrade)}. Puedes cambiarlo en <a href="#/ajustes">Ajustes</a>.</p>`;
}
function viewMateria(id) {
  const s = subj(id);
  if (!s) return `<a class="back" href="#/materias">${icon('back')}Materias</a><div class="empty" style="margin-top:20px"><h3>Esta materia ya no existe</h3><p>Puede que la hayas borrado.</p></div>`;
  const st = subjStats(s.id);
  const target = s.target ?? S.settings.target;
  const sched = (s.schedule || []).slice().sort((a, b) => ((+a.day + 6) % 7) - ((+b.day + 6) % 7) || a.start.localeCompare(b.start));
  const notes = S.notes.filter((n) => n.subjectId === s.id);
  return `<a class="back" href="#/materias">${icon('back')}Materias</a>
    <section class="subj-head" style="--c:${safeColor(s.color)}">
      <div class="today-top"><h1 class="page-title" style="margin-top:6px">${esc(s.name)}</h1>
      <button class="btn" data-act="edit-subject" data-id="${s.id}" style="margin-top:10px">${icon('edit')}Editar</button></div>
      <p class="muted" style="margin:0">${[s.teacher && `Profe: ${esc(s.teacher)}`, s.room && `Salón ${esc(s.room)}`].filter(Boolean).join('. ') || 'Sin profesor ni salón registrados.'}
      ${s.important ? `<br><span class="chip" style="margin-top:8px"><svg class="i sm star"><use href="#i-star"/></svg>Materia importante</span>` : ''}</p>
    </section>
    <div class="card">
      <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
        <div><div class="grade-big" style="${st.avg != null && st.avg < S.settings.passGrade ? 'color:var(--red)' : ''}">${st.avg != null ? fmtGrade(Math.round(st.avg * 10) / 10) : '—'}</div><div class="small faint">promedio actual</div></div>
        <p class="result" style="flex:1;min-width:220px;margin:0;font-size:15.5px">${esc(neededText(st.avg, st.evaluated, target))}</p>
      </div>
      <div class="field" style="margin:14px 0 0;max-width:240px"><label for="subjTarget">Quiero terminar con</label>
        <input id="subjTarget" class="input" type="number" inputmode="decimal" step="${S.settings.gradeMax === 100 ? 1 : 0.1}" min="0" max="${S.settings.gradeMax}" value="${esc(target)}" data-subj-target="${s.id}"></div>
    </div>
    <h2 class="sec">Pendientes <small>${st.pending.length}</small></h2>
    ${st.pending.length ? `<ul class="tasks">${st.pending.map((t) => taskRow(t)).join('')}</ul>` : '<p class="muted">Nada pendiente en esta materia.</p>'}
    <p><button class="btn" data-act="new-task" data-subject="${s.id}">${icon('plus')}Nueva tarea de ${esc(s.name)}</button></p>
    ${st.done.length ? `<h2 class="sec">Entregadas <small>${st.done.length}</small></h2><ul class="tasks">${st.done.sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).slice(0, 30).map((t) => taskRow(t)).join('')}</ul>
      <p class="small muted">Toca una entrega para anotar su calificación y cuánto vale.</p>` : ''}
    <h2 class="sec">Horario</h2>
    ${sched.length ? `<div class="card" style="padding:6px 16px">${sched.map((h) => `<div class="toggle"><span class="t">${cap(DIAS[+h.day])}</span><span class="d num">${fmtTime(h.start)} a ${fmtTime(h.end)}${h.room ? `, salón ${esc(h.room)}` : ''}</span></div>`).join('')}</div>` : `<p class="muted">Sin horario. <button class="link-btn" data-act="edit-subject" data-id="${s.id}">Agregar días y horas</button></p>`}
    <h2 class="sec">Apuntes <small>${notes.length}</small></h2>
    ${notes.length ? `<div class="notes">${notes.map(noteCard).join('')}</div>` : ''}
    <p><button class="btn" data-act="new-note" data-subject="${s.id}">${icon('note')}Nuevo apunte</button></p>
    ${s.notes ? `<h2 class="sec">Notas de la materia</h2><div class="card" style="white-space:pre-line">${esc(s.notes)}</div>` : ''}`;
}

/* ---------- Más ---------- */
function viewMas() {
  const items = [
    ['#/cerebro', 'spark', 'Tu Cerebro', 'Todo lo que has hecho y pensado, conectado en una red viva'],
    ['#/panel', 'grid', 'Mi panel', 'Radar de carga, tiempo libre real, patrones y hábitos'],
    ['#/materias', 'book', 'Materias', 'Tus materias, horarios y calificaciones'],
    ['#/escanear', 'cam', 'Escanear foto', 'Saca pendientes y fechas de una foto o resuelve ejercicios de mate'],
    ['#/enfoque', 'timer', 'Modo enfoque', 'Temporizador para estudiar por bloques y llevar tu racha'],
    ['#/herramientas', 'tools', 'Herramientas', 'Calificación que necesitas, referencias APA y checklist de entrega'],
    ['#/mente', 'leaf', 'Pensamientos', 'Tu árbol de ideas, gratitud, metas y lo que sueltas'],
    ['#/notas', 'note', 'Apuntes', 'Notas rápidas por materia'],
    ['#/respaldo', 'save', 'Respaldo y calendario', S.settings.lastBackup ? `Último respaldo ${relDay(S.settings.lastBackup)}` : 'Aún no haces un respaldo'],
    ['#/ajustes', 'gear', 'Ajustes', 'Tu nombre, tema, calificaciones y recordatorios'],
    ['#/instalar', 'phone', 'Instalar la app', isStandalone() ? 'Ya la tienes instalada' : 'Ponla en tu pantalla de inicio'],
    ['#/ayuda', 'help', 'Cómo usar Al Día', 'Trucos de la captura rápida y más'],
  ];
  const me = profile();
  return `<h1 class="page-title">Más</h1><p class="page-sub">Todo lo que te ayuda a ir al día.</p>
    <ul class="rows" style="margin-bottom:14px"><li><button type="button" class="rowbtn" data-act="profile-sheet">${avatar(me, 'sm')}
      <span class="txt"><b>${esc(me.name)}</b><span>Estás usando la app como ${esc(me.name)}. Toca para cambiar de usuario.</span></span>${icon('chev', 'chev')}</button></li></ul>
    <ul class="rows">${items.map(([h, ic, t, d]) => `<li><a href="${h}"><span class="ico">${icon(ic)}</span><span class="txt"><b>${t}</b><span>${esc(d)}</span></span>${icon('chev', 'chev')}</a></li>`).join('')}</ul>`;
}

/* ---------- Escanear foto (lector propio, gratis, sin claves) ---------- */
const SCAN = { busy: false, mode: null, progress: 0, stage: '', text: '', items: null, solved: null, error: '' };
function viewEscanear() {
  const fromPhoto = S.tasks.filter((t) => t.source === 'foto' && !t.done).sort(sortPending);
  let out = '';
  if (SCAN.busy) {
    out = `<div class="out result"><b>${esc(SCAN.stage)}</b>
      <div class="prog-bar" style="margin-top:10px"><i style="width:${Math.round(SCAN.progress * 100)}%"></i></div></div>`;
  } else if (SCAN.error) {
    out = `<div class="banner warn">${icon('bell')}<p>${esc(SCAN.error)}</p></div>`;
  } else if (SCAN.mode === 'tasks' && SCAN.items) {
    out = SCAN.items.length ? `<h2 class="sec">Encontré esto <small>revisa antes de agregar</small></h2><div class="card">${SCAN.items.map((it, i) => `
        <div class="scan-item"><input type="checkbox" data-scan-i="${i}" checked aria-label="Agregar esta tarea">
          <div style="flex:1;min-width:0">
            <input class="input" data-scan-title="${i}" value="${esc(it.title)}" aria-label="Título">
            <div style="display:flex;gap:8px;margin-top:6px;flex-wrap:wrap">
              <input class="input" type="date" data-scan-due="${i}" value="${it.due || ''}" style="width:auto;min-height:40px" aria-label="Fecha de entrega">
              ${it.subjectId ? `<span class="chip"><span class="dot" style="background:${safeColor(subj(it.subjectId)?.color)}"></span>${esc(subj(it.subjectId)?.name || '')}</span>` : ''}
              ${it.due ? `<span class="chip pen">${esc(cap(relDay(it.due)))}</span>` : '<span class="chip warn">Sin fecha: elígela</span>'}
            </div></div></div>`).join('')}
        <button class="btn primary block" data-act="scan-add" style="margin-top:12px">${icon('plus')}Agregar a pendientes con recordatorio</button></div>`
      : `<div class="empty"><h3>No encontré tareas</h3><p>Revisa el texto que leí abajo: puedes corregirlo y volver a analizar, o tomar una foto más clara y de cerca.</p></div>`;
  } else if (SCAN.mode === 'solve' && SCAN.solved) {
    out = SCAN.solved.length
      ? `<h2 class="sec">Resultados <small>${plural(SCAN.solved.length, 'ejercicio', 'ejercicios')}</small></h2>${SCAN.solved.map((r) => `
        <div class="card"><p class="small faint" style="margin:0 0 6px">${esc(r.src)}</p>
          <ol class="solve-steps">${r.steps.map((st) => `<li>${esc(st)}</li>`).join('')}</ol>
          <p class="result" style="margin:8px 0 0"><b>${esc(r.answer)}</b></p></div>`).join('')}`
      : `<div class="empty"><h3>No encontré operaciones que pueda resolver</h3><p>La app resuelve sola operaciones, porcentajes y ecuaciones de primer y segundo grado. Para preguntas de texto, copia lo que leí o búscalo.</p>
          <div class="btn-row" style="justify-content:center"><button class="btn" data-act="scan-speak">${icon('bell')}Escuchar</button><button class="btn" data-act="scan-copy">${icon('copy')}Copiar texto</button>
          <a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(SCAN.text.replace(/\s+/g, ' ').slice(0, 300))}">${icon('search')}Buscar en Google</a></div></div>`;
  }
  const textBox = !SCAN.busy && SCAN.text ? `<details class="card" style="margin-top:12px" ${SCAN.items && !SCAN.items.length ? 'open' : ''}><summary><b>Texto que leí</b> <span class="small muted">(corrígelo si algo salió mal)</span></summary>
      <textarea class="input" id="scanText" style="margin-top:10px;min-height:160px">${esc(SCAN.text)}</textarea>
      <div id="scanSum"></div><div class="btn-row" style="margin-top:8px"><button class="btn" data-act="scan-summary">${icon('spark')}Resumir</button><button class="btn" data-act="scan-speak">${icon('play')}Escuchar</button><button class="btn" data-act="scan-note">${icon('note')}Guardar como apunte</button><button class="btn" data-act="scan-reanalyze" data-v="tasks">Buscar tareas otra vez</button><button class="btn" data-act="scan-reanalyze" data-v="solve">Resolver otra vez</button></div></details>` : '';
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Escanear foto</h1>
    <p class="page-sub">Toma foto del pizarrón, la libreta o la hoja. La app la lee en tu celular: gratis y sin claves.</p>
    <div class="btn-row" style="margin:6px 0 16px">
      <label class="btn primary" for="scanTasks">${icon('cam')}Sacar pendientes y fechas</label><input id="scanTasks" type="file" accept="image/*" capture="environment" class="sr" data-scan="tasks">
      <label class="btn" for="scanSolve">${icon('spark')}Resolver ejercicios</label><input id="scanSolve" type="file" accept="image/*" capture="environment" class="sr" data-scan="solve">
    </div>
    ${out}${textBox}
    <h2 class="sec">Pendientes de fotos <small>${fromPhoto.length}</small></h2>
    ${fromPhoto.length ? `<ul class="tasks">${fromPhoto.map((t) => taskRow(t)).join('')}</ul>` : '<p class="muted">Las tareas que saques de fotos aparecen aquí y te avisan antes de la entrega.</p>'}
    <p class="small muted" style="margin-top:18px">Consejo: buena luz, foto de frente y letra clara. La primera vez se descarga el lector (unos MB), después es más rápido.</p>`;
}

/* Lector de texto (OCR) que corre en el celular */
let tessLoad = null, tessWorker = null;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve();
  return tessLoad || (tessLoad = new Promise((res, rej) => {
    const sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    sc.onload = res;
    sc.onerror = () => { tessLoad = null; rej(new Error('net')); };
    document.head.appendChild(sc);
  }));
}
function setScanProgress(stage, p) {
  SCAN.stage = stage; SCAN.progress = p;
  const bar = $('.prog-bar i'); const lbl = $('.out.result b');
  if (bar) bar.style.width = Math.round(p * 100) + '%'; if (lbl) lbl.textContent = stage;
}
function prepImage(file) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 2000 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
      // escala de grises con más contraste: ayuda con fotos de libreta o pizarrón
      const d = g.getImageData(0, 0, c.width, c.height); const px = d.data;
      for (let i = 0; i < px.length; i += 4) {
        let y = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
        y = clamp((y - 128) * 1.35 + 128, 0, 255);
        px[i] = px[i + 1] = px[i + 2] = y;
      }
      g.putImageData(d, 0, 0);
      URL.revokeObjectURL(img.src); res(c);
    };
    img.onerror = () => rej(new Error('img'));
    img.src = URL.createObjectURL(file);
  });
}
async function readPhoto(file) {
  setScanProgress('Preparando la foto…', 0.03);
  const canvas = await prepImage(file);
  setScanProgress('Cargando el lector…', 0.08);
  await loadTesseract();
  if (!tessWorker) {
    tessWorker = await window.Tesseract.createWorker('spa', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') setScanProgress('Leyendo la foto…', 0.3 + m.progress * 0.7);
        else if (/load|initializ/.test(m.status || '')) setScanProgress('Cargando el lector…', 0.08 + (m.progress || 0) * 0.2);
      },
    });
  }
  const { data } = await tessWorker.recognize(canvas);
  return (data.text || '').replace(/[ \t]+/g, ' ').trim();
}

/* Encuentra tareas y fechas en el texto leído */
const TASK_RE = /\b(tarea|entrega|entregar|examen|parcial|quiz|proyecto|exposici|exponer|investiga|resumen|ensayo|cuestionario|reporte|practica|lectura|leer|mapa|maqueta|ejercicio|trabajo|realizar|hacer|elaborar|traer|estudiar|presentaci|actividad|resolver|redactar|cuadro|linea del tiempo|infografi|portafolio|evidencia|guia|problemas?)\b/;
function extractTasks(text) {
  const docSubj = parseQuick(text.slice(0, 160)).subjectId;
  const lines = text.split(/\n+/)
    .map((l) => l.replace(/^[\s•·*\-–—>»|]+/, '').replace(/^\(?(\d{1,2}|[a-e])[).:-]\s+/i, '').trim())
    .filter((l) => l.length > 2 && /[a-záéíóúñ]{3}/i.test(l));
  const out = []; const undated = []; let carry = null;
  for (const raw of lines) {
    const p = parseQuick(raw);
    const n = normChars(raw);
    const title = p.title
      .replace(/^(la\s+)?(fecha\s+(de\s+)?(entrega|limite)|entrega|entregar|para|hasta|dia)\b\s*[:\-–]?\s*/i, '')
      .replace(/\s*\b(fecha\s+(de\s+)?entrega|entregar|para)\s*[:\-–]?$/i, '')
      .replace(/^[:,;.\-–\s]+|[:,;\-–\s]+$/g, '').trim();
    const meaningful = normChars(title).replace(/[^a-z]/g, '').length >= 4;
    if (p.due && !meaningful) {
      // renglón que solo trae fecha: se la pone a las tareas de arriba sin fecha, o a las que siguen
      if (undated.length) { undated.forEach((x) => { x.due = p.due; x.time = x.time || p.time; }); undated.length = 0; }
      else carry = { due: p.due, time: p.time };
      continue;
    }
    if (!TASK_RE.test(n) && !p.due) continue;
    const it = { title: cap(title).slice(0, 140), subjectId: p.subjectId || docSubj || null, type: p.type || 'tarea', due: p.due, time: p.time, desc: raw };
    if (!it.due && carry) { it.due = carry.due; it.time = carry.time; }
    if (!it.due) undated.push(it);
    if (!out.some((o) => normChars(o.title) === normChars(it.title))) out.push(it);
  }
  return out.slice(0, 15);
}

/* Resolvedor de matemáticas propio: operaciones, %, ecuaciones de 1.º y 2.º grado */
const fmtN = (x) => { if (!isFinite(x)) return '∞'; const r = Math.round(x * 10000) / 10000; return (Object.is(r, -0) ? 0 : r).toString(); };
function polyParse(src, v) {
  let i = 0;
  const peek = () => { while (src[i] === ' ') i++; return src[i]; };
  const fail = () => { throw new Error('parse'); };
  const add = (a, b, s = 1) => a.map((x, k) => x + s * b[k]);
  const mul = (a, b) => { const r = [0, 0, 0]; for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) if (a[p] && b[q]) { if (p + q > 2) fail(); r[p + q] += a[p] * b[q]; } return r; };
  const isConst = (a) => !a[1] && !a[2];
  function expr() {
    let r = term();
    for (;;) { const c = peek(); if (c === '+' || c === '-') { i++; r = add(r, term(), c === '+' ? 1 : -1); } else return r; }
  }
  function term() {
    let r = unary();
    for (;;) {
      const c = peek();
      if (c === '*') { i++; r = mul(r, unary()); }
      else if (c === '/') { i++; const d = unary(); if (!isConst(d) || d[0] === 0) fail(); r = r.map((x) => x / d[0]); }
      else if (c && (/[0-9.(]/.test(c) || c === v)) r = mul(r, unary());
      else return r;
    }
  }
  function unary() { const c = peek(); if (c === '-') { i++; return unary().map((x) => -x); } if (c === '+') { i++; return unary(); } return power(); }
  function power() {
    const b = atom();
    if (peek() === '^') {
      i++; const e = atom(); if (!isConst(e) || !Number.isInteger(e[0]) || e[0] < 0) fail();
      if (isConst(b)) return [Math.pow(b[0], e[0]), 0, 0];
      let r = [1, 0, 0]; for (let k = 0; k < e[0]; k++) r = mul(r, b); return r;
    }
    return b;
  }
  function atom() {
    const c = peek();
    if (c === '(') { i++; const r = expr(); if (peek() !== ')') fail(); i++; return r; }
    if (c === v) { i++; return [0, 1, 0]; }
    const m = /^\d+(\.\d+)?|^\.\d+/.exec(src.slice(i));
    if (!m) fail(); i += m[0].length; return [parseFloat(m[0]), 0, 0];
  }
  const r = expr(); if (peek() !== undefined) fail(); return r;
}
function polyStr(p, v) {
  const parts = [];
  [[p[2], `${v}²`], [p[1], v], [p[0], '']].forEach(([c, s]) => {
    if (!c) return;
    const a = Math.abs(c); const coef = s && a === 1 ? '' : fmtN(a);
    parts.push((c < 0 ? (parts.length ? ' − ' : '−') : (parts.length ? ' + ' : '')) + coef + s);
  });
  return parts.join('') || '0';
}
function solveLine(line) {
  let s = line.toLowerCase()
    .replace(/^\s*(\d{1,2}|[a-h])[).]\s+/, '')
    .replace(/[−–—]/g, '-').replace(/[×·•]/g, '*').replace(/[÷:]/g, '/')
    .replace(/²/g, '^2').replace(/³/g, '^3').replace(/(\d),(\d{1,2})(?!\d)/g, '$1.$2').replace(/\s+/g, ' ').trim();
  const pct = /(\d+(?:\.\d+)?)\s*%\s*(?:de|del)\s*(\d+(?:\.\d+)?)/.exec(s);
  if (pct) {
    const a = +pct[1], b = +pct[2];
    return { src: line, steps: [`${fmtN(a)}% es ${fmtN(a)} / 100 = ${fmtN(a / 100)}`, `${fmtN(a / 100)} × ${fmtN(b)} = ${fmtN(a * b / 100)}`], answer: `${fmtN(a)}% de ${fmtN(b)} = ${fmtN(a * b / 100)}` };
  }
  if (/[a-wz]{2,}/.test(s.replace(/x/g, ''))) return null; // es texto, no una operación
  s = s.replace(/=\s*\??\s*$/, '').trim();
  if (!s.includes('=')) s = s.replace(/(\d)\s*x\s*(?=\d)/g, '$1*');
  const vars = [...new Set((s.match(/[a-z]/g) || []))];
  if (vars.length > 1 || !/\d/.test(s) || !/[-+*/^=]/.test(s)) return null;
  const v = vars[0];
  try {
    if (!v) {
      const expr = s.replace(/=\s*\??\s*$/, '');
      if (expr.includes('=')) return null;
      const r = polyParse(expr, '§');
      return { src: line, steps: ['Primero potencias y paréntesis, luego multiplicaciones y divisiones, al final sumas y restas.'], answer: `= ${fmtN(r[0])}` };
    }
    const sides = s.split('=');
    if (sides.length !== 2 || !sides[0].trim() || !sides[1].trim()) return null;
    const L = polyParse(sides[0], v), R = polyParse(sides[1], v);
    const P = L.map((x, k) => x - R[k]);
    const [c, b, a] = P;
    const steps = [`Pasamos todo a un lado: ${polyStr(P, v)} = 0`];
    if (!a && !b) return { src: line, steps, answer: c === 0 ? 'Se cumple para cualquier valor' : 'No tiene solución' };
    if (!a) {
      steps.push(`${polyStr([0, b, 0], v)} = ${fmtN(-c)}`, `${v} = ${fmtN(-c)} / ${fmtN(b)}`);
      return { src: line, steps, answer: `${v} = ${fmtN(-c / b)}` };
    }
    const D = b * b - 4 * a * c;
    steps.push(`Es de segundo grado: a = ${fmtN(a)}, b = ${fmtN(b)}, c = ${fmtN(c)}`,
      `Discriminante: b² − 4ac = ${fmtN(b * b)} − ${fmtN(4 * a * c)} = ${fmtN(D)}`);
    if (D < 0) return { src: line, steps: [...steps, 'El discriminante es negativo.'], answer: 'No tiene soluciones reales' };
    steps.push(`Fórmula general: ${v} = (−b ± √${fmtN(D)}) / ${fmtN(2 * a)}`);
    const x1 = (-b + Math.sqrt(D)) / (2 * a), x2 = (-b - Math.sqrt(D)) / (2 * a);
    return { src: line, steps, answer: D === 0 ? `${v} = ${fmtN(x1)}` : `${v}₁ = ${fmtN(x1)}, ${v}₂ = ${fmtN(x2)}` };
  } catch { return null; }
}
function solveText(text) {
  return text.split(/\n+/).map((l) => l.trim()).filter(Boolean).map(solveLine).filter(Boolean).slice(0, 20);
}

function analyzeScan(mode) {
  SCAN.mode = mode;
  if (mode === 'tasks') { SCAN.items = extractTasks(SCAN.text); SCAN.solved = null; }
  else { SCAN.solved = solveText(SCAN.text); SCAN.items = null; }
}
async function runScan(file, mode) {
  Object.assign(SCAN, { busy: true, mode, items: null, solved: null, text: '', error: '', progress: 0, stage: 'Preparando la foto…' });
  render();
  try {
    SCAN.file = file;
    SCAN.text = await readPhoto(file);
    if (!SCAN.text) throw new Error('vacio');
    analyzeScan(mode);
  } catch (e) {
    SCAN.error = e.message === 'img' ? 'No se pudo abrir la imagen.'
      : e.message === 'net' ? 'La primera vez se necesita internet para descargar el lector. Conéctate y vuelve a intentar.'
      : e.message === 'vacio' ? 'No pude leer texto en la foto. Tómala de frente, con buena luz y más de cerca.'
      : 'No se pudo leer la foto. Intenta otra vez.';
  }
  SCAN.busy = false; render();
}

/* ---------- Salón: hojas cayendo, ráfaga de hojas, acomodo armonioso ---------- */
const LEAF_PATH = 'M12 2C7 5 3.5 10 5 18c.3 1.6 1 2.8 1.8 3.6C15 20.5 20 15 19.5 6.5 17.5 3.8 15 2.5 12 2z';
const LEAF_VEIN = 'M6.8 21.6C9 16 12 10 17 5';
const LEAF_COLORS = ['#7DBE7A', '#5DA36A', '#A8D08D', '#3F8F5F', '#C9DE8C', '#94C9A0'];
const leafSVG = (c) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${LEAF_PATH}" fill="${c}"/><path d="${LEAF_VEIN}" stroke="rgba(255,255,255,.55)" stroke-width="1" fill="none"/></svg>`;
function buildLeaves() {
  const box = $('#leaves'); if (!box) return;
  const off = S.settings.leaves === false || matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (off) { box.innerHTML = ''; return; }
  if (box.childElementCount) return;
  let html = '';
  for (let i = 0; i < 14; i++) {
    const dur = 14 + Math.random() * 16, size = 14 + Math.random() * 16;
    html += `<span class="leaf" style="left:${Math.random() * 100}%;--dur:${dur}s;--delay:${-Math.random() * dur}s;--size:${size}px;--drift:${(Math.random() * 2 - 1) * 70}px;--spin:${(Math.random() * 2 - 1) * 540}deg"><i style="--sway:${3 + Math.random() * 3}s">${leafSVG(LEAF_COLORS[i % LEAF_COLORS.length])}</i></span>`;
  }
  box.innerHTML = html;
}
function leafBurst(el) {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < 10; i++) {
    const d = document.createElement('span'); d.className = 'burst-leaf';
    d.innerHTML = leafSVG(LEAF_COLORS[i % LEAF_COLORS.length]);
    d.style.left = cx + 'px'; d.style.top = cy + 'px'; document.body.appendChild(d);
    const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.5, dist = 50 + Math.random() * 70;
    d.animate([
      { transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * dist}px), calc(-50% + ${Math.sin(a) * dist - 20}px)) scale(1) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(calc(-50% + ${Math.cos(a) * dist * 1.2}px), calc(-50% + ${Math.sin(a) * dist + 60}px)) scale(.8) rotate(${Math.random() * 720}deg)`, opacity: 0 },
    ], { duration: 1400 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => d.remove();
  }
  if (typeof confetti === 'function') confetti(cx, cy, 22);
}
let lastRenderRoute = null, enterT = null;
function harmonize(main) {
  const rk = location.hash || '#/hoy';
  if (rk === lastRenderRoute) return;
  lastRenderRoute = rk;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  main.classList.remove('enter'); void main.offsetWidth;
  $$('.today-head, .quick, h1, .page-sub, .emergency, .meter, .card, .task, .subj, .note, .thought, .rows, h2.sec, .seg, .chips, .breath-card', main).slice(0, 22).forEach((el, i) => el.style.setProperty('--i', i));
  main.classList.add('enter');
  clearTimeout(enterT); enterT = setTimeout(() => main.classList.remove('enter'), 2200);
}

/* ---------- Pensamientos: un árbol que crece con lo que piensas ---------- */
const MOODS = {
  idea: { label: 'Idea', color: '#8DBF5A' },
  gratitud: { label: 'Gratitud', color: '#E39AAE' },
  meta: { label: 'Meta', color: '#3F9467' },
  suelto: { label: 'Lo que suelto', color: '#7FB0C9' },
  recuerdo: { label: 'Recuerdo', color: '#D1A85E' },
};
UI.mood = 'all';
function viewMente() {
  const list = S.thoughts.filter((t) => UI.mood === 'all' || t.mood === UI.mood).sort((a, b) => b.at - a.at);
  const groups = [];
  for (const t of list) {
    const d = new Date(t.at); const k = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
    let g = groups[groups.length - 1]; if (!g || g.k !== k) groups.push(g = { k, items: [] }); g.items.push(t);
  }
  let n = 0;
  return `<h1 class="page-title">Pensamientos</h1>
    <p class="page-sub">Escribe lo que traes en la mente. Cada pensamiento es una hoja de tu árbol.</p>
    <form class="quick thought-new" id="thoughtForm" autocomplete="off">
      <label for="thoughtIn" class="sr">Nuevo pensamiento</label>
      <textarea id="thoughtIn" rows="2" placeholder="¿Qué estás pensando?"></textarea>
      <div class="thought-new-row"><div class="pick" role="group" aria-label="Tipo de pensamiento">
        ${Object.entries(MOODS).map(([k, m], i) => `<button type="button" data-act="mood-pick" data-v="${k}" aria-pressed="${i === 0}"><span class="dot" style="background:${m.color}"></span>${m.label}</button>`).join('')}</div>
        <button class="btn primary">${icon('plus')}Plantar</button></div>
    </form>
    <div class="breath-card"><div><b>¿Mucho en la cabeza?</b><span class="small muted">Un minuto de respiración guiada.</span></div><button class="btn" data-act="breathe">Respirar</button></div>
    ${S.thoughts.length ? `<div class="chips" role="group" aria-label="Filtrar" style="margin-top:16px">
      <button type="button" class="fchip" data-act="mood-filter" data-v="all" aria-pressed="${UI.mood === 'all'}">Todos · ${S.thoughts.length}</button>
      ${Object.entries(MOODS).map(([k, m]) => { const c = S.thoughts.filter((t) => t.mood === k).length; return c ? `<button type="button" class="fchip" data-act="mood-filter" data-v="${k}" aria-pressed="${UI.mood === k}"><span class="dot" style="background:${m.color}"></span>${m.label} · ${c}</button>` : ''; }).join('')}</div>` : ''}
    ${list.length ? `<div class="thought-tree">${groups.map((g) => `<div class="ring"><span>${cap(g.k)}</span></div>${g.items.map((t) => {
      const m = MOODS[t.mood] || MOODS.idea; const side = n++ % 2 ? 'r' : 'l';
      return `<article class="thought ${side}" style="--c:${m.color}">
        <span class="bud" aria-hidden="true">${leafSVG(m.color)}</span>
        <button type="button" class="thought-body" data-act="thought-open" data-id="${t.id}">
          <span class="thought-mood">${m.label}</span>
          <p>${esc(t.text)}</p>
          <span class="tiny faint">${fmtStamp(t.at)}</span></button></article>`;
    }).join('')}`).join('')}<div class="roots" aria-hidden="true"></div></div>`
      : `<div class="empty" style="margin-top:22px"><h3>Tu árbol está por crecer</h3><p>Planta tu primer pensamiento: una idea, algo por lo que estás agradecido, una meta o algo que quieras soltar.</p></div>`}`;
}
let moodSel = 'idea';
function openThought(id) {
  const t = S.thoughts.find((x) => x.id === id); if (!t) return;
  draft = { ...t }; draftDirty = false;
  openSheet(`${sheetHead('Pensamiento')}
    <div class="sheet-body">
      <div class="field"><label for="thText" class="sr">Texto</label><textarea id="thText" class="input" style="min-height:160px" data-f="text">${esc(t.text)}</textarea></div>
      <div class="field"><span class="lbl">Tipo</span><div class="pick" role="group">${Object.entries(MOODS).map(([k, m]) => `<button type="button" data-act="pick" data-k="mood" data-v="${k}" aria-pressed="${t.mood === k}"><span class="dot" style="background:${m.color}"></span>${m.label}</button>`).join('')}</div></div>
      <div class="btn-row"><button type="button" class="btn" data-act="thought-speak">${icon('play')}Escuchar</button></div>
    </div>
    <div class="sheet-foot"><button type="button" class="btn danger" data-act="thought-del">${icon('trash')}Quitar</button><span class="grow"></span><button type="button" class="btn primary" data-act="thought-save">Guardar</button></div>`,
  () => { if (draft && draftDirty) saveThought(); draft = null; });
}
function saveThought() {
  const d = draft; if (!d || !d.text.trim()) return;
  commit((s) => { const i = s.thoughts.findIndex((x) => x.id === d.id); if (i >= 0) s.thoughts[i] = { ...d, text: d.text.trim() }; });
  draftDirty = false;
}
function breathe() {
  const d = $('#ask');
  d.innerHTML = `<form method="dialog" class="breathe"><div class="breath-orb" id="orb"><span id="breathTxt">Inhala</span></div>
    <p class="muted" id="breathCount">Sigue el círculo</p><button class="btn" value="cancel">Terminar</button></form>`;
  d.showModal();
  const phases = [['Inhala', 4000, 'in'], ['Sostén', 4000, 'hold'], ['Exhala', 6000, 'out']];
  let k = 0, cycles = 0, timer = null;
  const orb = $('#orb'), txt = $('#breathTxt');
  const step = () => {
    if (!d.open) return;
    const [label, ms, cls] = phases[k % 3];
    txt.textContent = label; orb.className = 'breath-orb ' + cls; orb.style.transitionDuration = ms + 'ms';
    if (cls === 'in') { Snd.bell(392, 0, 3.5, 0.04); cycles++; $('#breathCount').textContent = `Respiración ${cycles} de 4`; }
    if (cls === 'out' && cycles >= 4) { timer = setTimeout(() => { if (d.open) { txt.textContent = 'Bien hecho'; orb.className = 'breath-orb'; Snd.chime(); } }, ms); return; }
    k++; timer = setTimeout(step, ms);
  };
  setTimeout(step, 400);
  d.addEventListener('close', () => clearTimeout(timer), { once: true });
}

/* ================= Toques mágicos ================= */

/* Momento del día: el cielo del bosque cambia con la hora */
function daypart() { const h = new Date().getHours(); return h >= 5 && h < 8 ? 'dawn' : h < 17 && h >= 8 ? 'day' : h >= 17 && h < 20 ? 'dusk' : 'night'; }
function applyDaypart() { document.documentElement.setAttribute('data-daypart', daypart()); }
setInterval(applyDaypart, 5 * 60000);

/* Frase del día (escritas para la app) */
const PHRASES = [
  'Un paso pequeño también es avanzar.', 'Lo que hoy siembras con calma, mañana florece.', 'No tienes que hacerlo todo hoy, solo lo siguiente.',
  'Respira. Ya has superado días más difíciles.', 'Tu ritmo es válido, aunque sea distinto al de los demás.', 'Hecho con calma vale más que hecho con prisa.',
  'Hoy basta con hacer lo mejor que puedas.', 'Cada tarea terminada es una hoja nueva en tu árbol.', 'Descansar también es parte del plan.',
  'Las raíces crecen en silencio antes que las ramas.', 'Ordena tu día y tu mente encontrará su lugar.', 'Empieza por lo pequeño; el impulso llega solo.',
  'Eres más capaz de lo que tu estrés te hace creer.', 'Un día a la vez, una tarea a la vez.', 'El bosque no se apura, y aun así todo crece.',
  'Lo importante no es correr, es no detenerse.', 'Hoy tu única meta es avanzar un poco.', 'Que tu día tenga calma y tus tareas, claridad.',
  'Celebra lo que ya hiciste antes de pensar en lo que falta.', 'Un descanso a tiempo evita un mal día.', 'La constancia es más fuerte que la prisa.',
  'Lo difícil se vuelve sencillo cuando lo divides.', 'Tu esfuerzo de hoy es un regalo para tu yo de mañana.', 'Aquí todo está en orden. Puedes respirar tranquila.',
  'Hasta el árbol más alto empezó como semilla.', 'Mereces sentirte orgullosa de cada avance.', 'Pausa, respira y sigue con suavidad.',
  'Haz espacio para lo que te hace bien.', 'No es perfecto, es progreso. Y está bien.', 'Hoy también vas a lograrlo.',
];
const phraseOfDay = () => { const d = new Date(); const n = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000); return PHRASES[n % PHRASES.length]; };

/* Sugerencia inteligente: qué conviene hacer justo ahora */
function suggestion() {
  const h = new Date().getHours(); const t0 = today();
  const pend = pendingTasks();
  if (!S.tasks.length) return null;
  const half = pend.find((t) => t.made && t.due && diffDays(t0, t.due) <= 1);
  if (half) return `«${half.title}» ya está hecha: solo falta ${uploadLabel(half) === 'Entregada en clase' ? 'entregarla' : 'subirla'}.`;
  const late = pend.find((t) => bucketOf(t) === 'late');
  if (late) return `Empieza por «${late.title}»: es la que más pide tu atención.`;
  const hoy = pend.find((t) => bucketOf(t) === 'today');
  if (hoy) return h < 12 ? `Buen momento para «${hoy.title}»: vence hoy y tienes la mañana fresca.` : `Termina «${hoy.title}» antes que todo: vence hoy${hoy.time ? ` a las ${fmtTime(hoy.time)}` : ''}.`;
  const man = pend.find((t) => bucketOf(t) === 'tomorrow');
  if (man && h >= 18) return `Antes de dormir, deja lista «${man.title}» para mañana.`;
  if (man) return `«${man.title}» es para mañana: avanzarle hoy te deja la noche libre.`;
  const big = pend.find((t) => ['proyecto', 'examen', 'exposicion'].includes(t.type) && t.due && diffDays(t0, t.due) <= 6);
  if (big) return `Tu ${TYPES[big.type].label.toLowerCase()} «${big.title}» es ${relDay(big.due)}: un bloque de 25 minutos hoy hace la diferencia.`;
  if (!pend.length) return 'Sin pendientes. Disfruta el día o planta un pensamiento en tu árbol.';
  return h >= 21 ? 'Ya hiciste suficiente por hoy. Descansa bien.' : null;
}

/* Planta de la semana: crece con cada entrega */
function weekRange() { const t0 = today(); const wd = (fromISO(t0).getDay() + 6) % 7; return [addDays(t0, -wd), addDays(t0, 6 - wd)]; }
function plantInfo() {
  const [a, b] = weekRange();
  const done = S.tasks.filter((t) => t.done && t.doneAt && toISO(new Date(t.doneAt)) >= a && toISO(new Date(t.doneAt)) <= b).length;
  const left = S.tasks.filter((t) => !t.done && t.due && t.due <= b).length;
  const total = done + left;
  const ratio = total ? done / total : 0;
  const stage = done === 0 ? 0 : ratio < 0.34 ? 1 : ratio < 0.67 ? 2 : ratio < 1 ? 3 : 4;
  return { done, total, stage };
}
function plantSVG(stage) {
  const leaf = (x, y, r, s, c, d) => `<path class="pl-leaf" style="--d:${d}ms" transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M0 0 C6 -10 18 -12 26 -6 C18 2 8 4 0 0Z" fill="${c}"/>`;
  return `<svg viewBox="0 0 120 130" class="plant st${stage}" aria-hidden="true">
    <ellipse cx="60" cy="122" rx="34" ry="5" fill="rgba(22,58,43,.12)"/>
    <path d="M36 96 H84 L78 122 H42Z" fill="#C98E62"/><rect x="32" y="90" width="56" height="10" rx="4" fill="#B47A50"/>
    <path class="pl-stem" d="M60 92 C60 76 58 62 61 ${stage >= 3 ? 30 : stage === 2 ? 46 : stage === 1 ? 64 : 84}" stroke="#4F9A63" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${stage >= 1 ? leaf(60, 78, -150, 0.9, '#7CC07A', 100) + leaf(61, 76, -30, 0.9, '#5DAE74', 200) : `<ellipse cx="60" cy="88" rx="6" ry="4" fill="#8A6A4E"/>`}
    ${stage >= 2 ? leaf(60, 60, -160, 1, '#5DAE74', 300) + leaf(61, 56, -20, 1.05, '#8CCB8A', 400) : ''}
    ${stage >= 3 ? leaf(60, 42, -150, 0.95, '#8CCB8A', 500) + leaf(61, 38, -35, 0.9, '#3E9563', 600) : ''}
    ${stage >= 4 ? `<g class="pl-flower" transform="translate(61 26)">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="6" ry="10" transform="rotate(${r}) translate(0 -9)" fill="#F4A9BE"/>`).join('')}<circle r="6" fill="#F6D06B"/></g>` : ''}
  </svg>`;
}
function plantHTML() {
  const p = plantInfo();
  if (!p.total) return '';
  const msg = ['Tu semilla espera la primera entrega de la semana.', 'Ya brotó. Cada entrega la hace crecer.', 'Va creciendo fuerte, como tú.', 'Casi florece. Te falta poco.', 'Floreció. Completaste todo lo de la semana.'][p.stage];
  return `<section class="plant-card"><div class="plant-art">${plantSVG(p.stage)}</div>
    <div><b class="plant-title">Tu planta de la semana</b><p class="small" style="margin:2px 0 8px">${msg}</p>
    <div class="plant-dots">${Array.from({ length: Math.min(p.total, 12) }, (_, i) => `<i class="${i < p.done ? 'on' : ''}"></i>`).join('')}</div>
    <span class="tiny faint">${p.done} de ${p.total} entregas de esta semana</span></div></section>`;
}

/* Mensajes entre Mitchell y Mel (en este mismo dispositivo) */
const letters = () => (REG.letters ||= []);
const LETTER_PAIR = { mitchell: 'mel', mel: 'mitchell' };
const otherProfile = () => { const o = !isGroup() && LETTER_PAIR[REG.current]; return o ? { id: o, name: profile(o)?.name || cap(o) } : null; };
function lettersHTML() {
  const mine = letters().filter((l) => l.to === REG.current && !l.read);
  if (!mine.length) return '';
  const l = mine[mine.length - 1]; const from = { name: profile(l.from)?.name || cap(l.from) };
  return `<button type="button" class="letter-card" data-act="letter-open" data-id="${l.id}">
    <span class="env" aria-hidden="true"><svg viewBox="0 0 48 36"><rect x="2" y="4" width="44" height="30" rx="5" fill="#fff" stroke="var(--pen)" stroke-width="2"/><path d="M4 7 L24 22 L44 7" fill="none" stroke="var(--pen)" stroke-width="2"/><path class="heart" d="M24 30 C16 24 14 19 18 17 C21 15.5 23 17 24 18.5 C25 17 27 15.5 30 17 C34 19 32 24 24 30Z" fill="#F08AA6"/></svg></span>
    <span><b>${mine.length > 1 ? `${mine.length} mensajes` : 'Un mensaje'} de ${esc(from?.name || '')}</b><span class="small muted">Toca para abrirlo</span></span></button>`;
}
function openLetter(id) {
  const l = letters().find((x) => x.id === id); if (!l) return;
  l.read = true; saveReg(); cloudSync();
  const d = $('#ask');
  d.innerHTML = `<form method="dialog" class="letter-open"><div class="paper"><span class="tiny faint">${fmtStamp(l.at)}</span>
    <p class="letter-text">${esc(l.text)}</p><p class="letter-sign">— ${esc(profile(l.from)?.name || cap(l.from))}</p></div>
    <div class="btn-row" style="justify-content:space-between;margin-top:14px"><button type="button" class="btn" data-act="letter-reply">Responder</button><button class="btn primary" value="cancel">Guardar en mi corazón</button></div></form>`;
  d.showModal(); Snd.chime();
  setTimeout(() => leafBurst(d.querySelector('.paper')), 250);
  d.addEventListener('close', () => render(), { once: true });
}
async function writeLetter() {
  const to = otherProfile();
  if (!to) return;
  const d = $('#ask'); if (d.open) d.close();
  const text = await ask({ title: `Un mensaje para ${to.name}`, text: cloudOn() ? `Le llegará a ${to.name} en su iPhone o iPad la próxima vez que abra la app.` : `Le aparecerá a ${to.name} cuando abra la app en este dispositivo. Activa la Nube compartida en Ajustes para que le llegue a su propio iPad.`, input: { placeholder: 'Escribe algo bonito…' }, ok: 'Enviar' });
  if (!text) return;
  letters().push({ id: uid(), from: REG.current, to: to.id, text, at: Date.now(), read: false }); saveReg();
  toast(cloudOn() ? `Mensaje enviado a ${to.name}.` : `Mensaje guardado para ${to.name}.`); Snd.chime(); cloudSync();
}

/* Intro al abrir la app */
function intro() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try { if (sessionStorage.getItem('aldia-intro')) return; sessionStorage.setItem('aldia-intro', '1'); } catch { /* */ }
  const p = profile();
  const el = document.createElement('div'); el.className = 'intro'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `<svg viewBox="0 0 120 120" class="intro-leaf"><path class="draw" d="${'M60 12C38 26 22 48 30 86c1.5 7 4.5 12 8 16C80 96 102 70 98 30 88 18 76 12 60 12z'}"/><path class="draw vein" d="M38 102C48 76 62 52 86 28"/></svg>
    <div class="intro-name">Al Día</div>${p ? `<div class="intro-hi">Hola, ${esc(p.name)}</div>` : ''}`;
  document.body.appendChild(el);
  const end = () => { el.classList.add('out'); setTimeout(() => el.remove(), 700); };
  el.addEventListener('click', end); setTimeout(end, 2300);
}

/* ================= Nube compartida (Netlify) =================
   Todo se guarda primero en el dispositivo y luego se sincroniza con la nube.
   Si dos dispositivos cambian cosas al mismo tiempo, se combinan sin perder nada. */
const CLOUD = { busy: false, last: null, error: '', timer: null, device: null };
try { CLOUD.device = localStorage.getItem('aldia:device') || ('d' + uid()); localStorage.setItem('aldia:device', CLOUD.device); } catch { CLOUD.device = 'd' + uid(); }
const cloudOn = () => true;
const COLLS = ['tasks', 'subjects', 'notes', 'thoughts', 'refs', 'libretas'];
const hashStr = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); };
const baseKey = (p) => keyFor(p) + ':base';
const dirtyKey = (p) => keyFor(p) + ':dirty';
function snapshotBase(data) {
  const b = { at: data.cloudAt || 0, settings: hashStr(JSON.stringify(stripLocal(data.settings))) };
  for (const c of COLLS) { b[c] = {}; for (const it of data[c] || []) b[c][it.id] = hashStr(JSON.stringify(it)); }
  return b;
}
function stripLocal(st) { const { lastDigest, installDismissed, lastBackup, ...rest } = st || {}; return rest; }
function getBase(p) { try { return JSON.parse(localStorage.getItem(baseKey(p)) || 'null'); } catch { return null; } }
function setBase(p, data) { try { localStorage.setItem(baseKey(p), JSON.stringify(snapshotBase(data))); } catch { /* */ } }
function isDirty(p) { try { return localStorage.getItem(dirtyKey(p)) === '1'; } catch { return false; } }
function setDirty(p, v) { try { if (v) localStorage.setItem(dirtyKey(p), '1'); else localStorage.removeItem(dirtyKey(p)); } catch { /* */ } }

// Mezcla de tres vías: lo que cambiaste aquí gana sobre lo que no cambiaste; lo nuevo de ambos lados se conserva;
// lo que se borró de un lado se borra del otro.
function mergeDocs(local, remote, base) {
  const out = JSON.parse(JSON.stringify(local));
  for (const c of COLLS) {
    const L = new Map((local[c] || []).map((x) => [x.id, x]));
    const R = new Map((remote[c] || []).map((x) => [x.id, x]));
    const B = (base && base[c]) || {};
    const res = [];
    const ids = new Set([...L.keys(), ...R.keys()]);
    for (const id of ids) {
      const l = L.get(id), r = R.get(id), inB = id in B;
      if (l && r) res.push(hashStr(JSON.stringify(l)) === B[id] ? r : l);
      else if (l) { if (!inB) res.push(l); }
      else if (r) { if (!inB) res.push(r); }
    }
    // conserva el orden local y agrega lo nuevo al final
    const order = new Map((local[c] || []).map((x, i) => [x.id, i]));
    out[c] = res.sort((a, b) => (order.get(a.id) ?? 1e9) - (order.get(b.id) ?? 1e9));
  }
  const fset = new Set((local.focus || []).map((f) => JSON.stringify(f)));
  out.focus = [...(local.focus || []), ...(remote.focus || []).filter((f) => !fset.has(JSON.stringify(f)))];
  const localSettingsChanged = !base || hashStr(JSON.stringify(stripLocal(local.settings))) !== base.settings;
  if (!localSettingsChanged) out.settings = { ...remote.settings, lastDigest: local.settings.lastDigest, installDismissed: local.settings.installDismissed, lastBackup: local.settings.lastBackup };
  return out;
}

async function cloudFetch(method, body, query = '') {
  const r = await fetch(`/api/sync${query ? `?${query}` : ''}`, {
    method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), 'x-aldia-tokens': JSON.stringify(tokens()) }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store',
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || `error ${r.status}`); e.status = r.status; throw e; }
  return j;
}

async function cloudSync(opts = {}) {
  if (CLOUD.busy || !navigator.onLine || !Object.keys(tokens()).length) return;
  CLOUD.busy = true; CLOUD.error = '';
  try {
    const remote = await cloudFetch('GET');
    let changedCurrent = false;
    const live = Object.keys(remote.users || {});
    let lost = false;
    for (const id of Object.keys(tokens())) if (!live.includes(id)) { delete tokens()[id]; lost = true; }
    saveReg();
    const forestChanged = applyForests(remote);
    showPresence(remote.presence);
    for (const id of live) {
      if (!profile(id)) continue;
      const isCur = id === dataOwner();
      let local = isCur ? S : load(keyFor(id));
      const hasLocal = isCur ? true : !!localStorage.getItem(keyFor(id));
      const rdoc = remote.profiles?.[id];
      const base = getBase(id);
      const dirty = isDirty(id) || (hasLocal && !base && (local.tasks.length || local.subjects.length || local.notes.length || local.thoughts.length));
      let next = local, push = false;
      if (rdoc && rdoc.at > (local.cloudAt || 0)) {
        if (dirty) { next = mergeDocs(local, migrate(rdoc.data), base); push = true; }
        else next = { ...migrate(rdoc.data), timer: local.timer };
        next.cloudAt = rdoc.at;
        if (isCur) changedCurrent = true;
      } else if (dirty || (!rdoc && hasLocal && (local.tasks.length || local.subjects.length))) push = true;
      if (push) {
        const data = JSON.parse(JSON.stringify(next)); delete data.timer;
        const res = await cloudFetch('PUT', { kind: 'profile', profile: id, device: CLOUD.device, data });
        next.cloudAt = res.at;
      }
      if (push || next !== local) {
        if (isCur) { S = next; try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* */ } }
        else { try { localStorage.setItem(keyFor(id), JSON.stringify(next)); } catch { /* */ } }
      }
      setBase(id, next); setDirty(id, false);
    }
    // mensajes
    const mine = new Map(letters().map((l) => [l.id, l]));
    const toPush = [];
    for (const rl of remote.letters || []) {
      const ll = mine.get(rl.id);
      if (!ll) mine.set(rl.id, rl);
      else if (ll.read && !rl.read) toPush.push(ll);
      else if (rl.read && !ll.read) ll.read = true;
    }
    const remoteIds = new Set((remote.letters || []).map((l) => l.id));
    for (const l of mine.values()) if (!remoteIds.has(l.id) && tokens()[l.from]) toPush.push(l);
    REG.letters = [...mine.values()].sort((a, b) => a.at - b.at); saveReg();
    for (const l of toPush) { try { await cloudFetch('POST', { kind: 'letter', letter: l }); } catch { /* se reintenta */ } }
    await flushForestOutbox();
    await postTrees(live);
    CLOUD.last = Date.now();
    if (lost) { choosing = true; render(); toast('Tu contraseña cambió en otro dispositivo. Vuelve a entrar.'); }
    else if (changedCurrent && !sheet().open && !choosing) { render(); applyTheme(); }
    else if (forestChanged && !sheet().open && !choosing && !['gTaskIn', 'gPostIn', 'gIdeaIn', 'gPartIn'].includes(document.activeElement?.id)) render();
    else if (route().name === 'hoy' && !sheet().open && !choosing && (remote.letters || []).some((l) => l.to === REG.current && !l.read)) render();
    updateCloudBadge();
  } catch (e) {
    CLOUD.error = /fetch|network|Failed|Load failed/i.test(e.message) ? 'Sin conexión con la nube' : e.message;
    updateCloudBadge();
  } finally { CLOUD.busy = false; }
}
function queueCloud() {
  if (!dataOwner()) return;
  setDirty(dataOwner(), true);
  clearTimeout(CLOUD.timer); CLOUD.timer = setTimeout(cloudSync, 1500);
}
function updateCloudBadge() {
  const el = $('#cloudState'); if (!el) return;
  el.innerHTML = cloudStateText();
}
function cloudStateText() {
  if (CLOUD.error) return `<span style="color:var(--red)">${esc(CLOUD.error)}. Se reintentará sola.</span>`;
  if (CLOUD.busy) return 'Sincronizando…';
  return CLOUD.last ? `Todo guardado en la nube · ${new Date(CLOUD.last).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}` : 'Conectando…';
}
function cloudHTML() { return accountCardHTML(); }

/* Cuentas y contraseñas: ver vida.js */
const isGroup = (id = REG.current) => isForestId(id);
const tokens = () => { REG.tokens ||= {}; return (REG.tokens[REG.cloud] ||= {}); };

/* ================= Ojito: alguien está en tu sección ================= */
let presenceT = null, presenceShown = null;
function presenceTick() {
  clearTimeout(presenceT);
  if (!cloudOn() || document.visibilityState !== 'visible') { presenceT = setTimeout(presenceTick, 20000); return; }
  if (REG.me && !isForestId(REG.current) && REG.current !== REG.me && !choosing) {
    cloudFetch('POST', { kind: 'presence', viewer: REG.me, viewing: REG.current }).catch(() => {});
  }
  presenceT = setTimeout(presenceTick, 20000);
}
function showPresence(list) {
  const mine = (list || []).filter((v) => v.viewing === REG.current && REG.current === REG.me && v.viewer !== REG.me);
  const el = $('#eye');
  if (!mine.length) { if (el) { el.classList.add('out'); setTimeout(() => el.remove(), 600); } presenceShown = null; return; }
  const who = profile(mine[0].viewer)?.name || cap(mine[0].viewer || 'alguien');
  if (el && presenceShown === who) return;
  el?.remove();
  const d = document.createElement('button');
  d.id = 'eye'; d.className = 'eye-pill'; d.type = 'button';
  d.setAttribute('aria-label', `${who} está en tu sección`);
  d.innerHTML = `<svg viewBox="0 0 64 40" class="eye-svg" aria-hidden="true">
      <path class="lid" d="M4 20 C16 4 48 4 60 20 C48 36 16 36 4 20Z"/>
      <circle class="iris" cx="32" cy="20" r="10"/><path class="pupil-heart" d="M32 25 C27 21.5 26 19 27.8 17.6 C29.4 16.4 31 17.3 32 18.6 C33 17.3 34.6 16.4 36.2 17.6 C38 19 37 21.5 32 25Z"/>
      <circle class="glint" cx="35.5" cy="15.5" r="2.2"/>
      <rect class="blink" x="0" y="0" width="64" height="40"/></svg>
    <span><b>${esc(who)}</b> está aquí contigo</span>`;
  d.addEventListener('click', () => { leafBurst(d); toast(`${who} está viendo tu sección ahora mismo.`); });
  document.body.appendChild(d);
  presenceShown = who;
  if (Snd.on()) Snd.bell(880, 0, 1.2, 0.04);
}

/* ================= Salones (grupos colaborativos) ================= */
const curFid = () => (isForestId(REG.current) ? REG.current.slice(2) : null);
const gItems = () => (FOR.f[curFid()]?.items) || [];
const gAll = (type) => gItems().filter((x) => x.type === type && !x.deleted);
const gGet = (id) => gItems().find((x) => x.id === id);
const me = () => profile(REG.me)?.name || 'Yo';
const forestMeta = () => FOR.f[curFid()]?.meta || null;
const initials = (n) => String(n || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const memberColor = (n) => { const m = Object.values(FOR.members || {}).find((x) => x.name === n); return m?.color; };
const nameColor = (n) => { if (memberColor(n)) return memberColor(n); const c = ['#2F8A5B', '#3E9A93', '#5B7FD1', '#B07AC8', '#D27C5E', '#C9A55C', '#4F9A63', '#7A8CA8']; let h = 0; for (const ch of String(n)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return c[h % c.length]; };
const mini = (n, cls = '') => `<span class="mini ${cls}" style="--pc:${nameColor(n)}" title="${esc(n)}">${esc(initials(n))}</span>`;
const ago = (ms) => { const m = Math.round((Date.now() - ms) / 60000); return m < 1 ? 'ahora' : m < 60 ? `hace ${m} min` : m < 1440 ? `hace ${Math.round(m / 60)} h` : relDay(toISO(new Date(ms))); };
function linkify(t) { return esc(t).replace(/https?:\/\/[^\s<]+/g, (u) => { const s = safeURL(u.replace(/&amp;/g, '&')); return s ? `<a href="${esc(s)}" target="_blank" rel="noopener">${esc(new URL(s).hostname.replace(/^www\./, ''))}</a>` : u; }); }

async function gput(item) {
  const fid = curFid(); if (!fid) return;
  item.at ||= Date.now(); item.by ||= me();
  const list = (FOR.f[fid].items ||= []);
  const i = list.findIndex((x) => x.id === item.id);
  if (i >= 0) list[i] = { ...list[i], ...item }; else list.push(item);
  saveFOR(); waterToday(); render();
  const sent = i >= 0 ? list[i] : item;
  try { await cloudFetch('POST', { kind: 'gitem', as: REG.me, forest: fid, item: sent, device: CLOUD.device }); }
  catch (e) {
    (REG.gout ||= []).push({ fid, item: sent }); saveReg();
    if (e.status === 401 || e.status === 403) forestAuthLost(e); else toast('Sin conexión: se enviará en cuanto vuelva el internet.');
  }
}
async function flushForestOutbox() {
  const out = REG.gout || []; if (!out.length) return;
  REG.gout = [];
  for (const o of out) { if (!o || !o.fid) continue; try { await cloudFetch('POST', { kind: 'gitem', as: REG.me, forest: o.fid, item: o.item, device: CLOUD.device }); } catch (e) { if (e.status !== 403) REG.gout.push(o); } }
  saveReg();
}
function forestAuthLost(e) {
  if (e && e.status === 403) { toast(e.message); return; }
  toast('Tu sesión se cerró. Vuelve a entrar con tu contraseña; tus cambios no se pierden.');
}
function groupStatus() {
  const pend = (REG.gout || []).length;
  if (!REG.me || !tokens()[REG.me]) return `<button class="gstat warn" data-act="profile-choose">${icon('lock', 'sm')}Sesión cerrada: toca para entrar</button>`;
  if (pend) return `<button class="gstat warn" data-act="g-retry">${icon('reset', 'sm')}${plural(pend, 'cambio sin guardar', 'cambios sin guardar')}: toca para reintentar</button>`;
  if (CLOUD.error) return `<span class="gstat warn">${icon('bell', 'sm')}${esc(CLOUD.error)}</span>`;
  return `<span class="gstat ok">${icon('check', 'sm')}Guardado en la nube${CLOUD.last ? ` · ${new Date(CLOUD.last).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}` : ''}</span>`;
}
const gid = () => uid() + Math.random().toString(36).slice(2, 5);
const gDone = () => (REG.gdone ||= {});

function doneBubbles(id) {
  const by = gAll('done').filter((x) => x.task === id); const n = (forestMeta()?.members || []).length;
  if (!by.length) return '';
  return `<span class="who-line done-line"><span class="stack">${by.slice(0, 6).map((x) => mini(x.by, 'xs')).join('')}</span><span class="tiny faint">${by.length}/${n} ya la hicieron</span></span>`;
}
function groupTaskRow(t) {
  const st = dueState(t); const done = !!gDone()[t.id];
  const team = gAll('team').find((x) => x.taskId === t.id);
  return `<li class="task ${done ? 'done' : ''}">
    <span class="hl" style="background:${nameColor(t.subject || t.title)}"></span>
    <button type="button" class="chk" data-act="g-done" data-id="${t.id}" role="checkbox" aria-checked="${done}" aria-label="Marcar como hecha por mí: ${esc(t.title)}"><span class="box">${icon('check')}</span></button>
    <button type="button" class="body" data-act="g-open" data-id="${t.id}">
      <span class="title">${esc(t.title)}</span>
      <span class="meta">${t.due ? `<span class="tone ${done ? '' : urgencyTone(t)}"></span><span class="when ${done ? '' : st.cls}">${esc(st.label)}</span>` : '<span class="faint">Sin fecha</span>'}${t.subject ? `<span>${esc(t.subject)}</span>` : ''}${team ? `<span class="tag">${icon('users')}Equipo</span>` : ''}</span>
      <span class="who-line">${mini(t.by, 'xs')}<span>${esc(t.by)} · ${ago(t.at)}</span>${t.img ? `<span class="tag">${icon('cam')}Foto</span>` : ''}</span>
      ${doneBubbles(t.id)}
    </button></li>`;
}
function pushBanner() {
  if (REG.gpush || !('serviceWorker' in navigator)) return '';
  if (!('PushManager' in window)) return isIOS() && !isStandalone() ? `<div class="banner">${icon('bell')}<p>Para recibir avisos del grupo en iPhone o iPad, instala la app en tu pantalla de inicio y ábrela desde el ícono.</p></div>` : '';
  return `<div class="banner">${icon('bell')}<p>Activa los avisos para enterarte al instante cuando alguien suba una tarea.</p><button class="btn primary" data-act="g-push">Activar</button></div>`;
}
function groupHead(title, sub) {
  return `<section class="group-head"><div class="today-top"><div class="g-badge">${avatar(profile(), 'lg')}</div>
      <div class="head-actions"><button type="button" class="who-chip" data-act="profile-sheet">${mini(me(), 'xs')}<span>${esc(me())}</span></button></div></div>
    <h1 class="page-title" style="margin-top:12px">${title}</h1><p class="page-sub">${sub}</p>${groupStatus()}</section>`;
}
function viewGrupo() {
  const tasks = gAll('task').sort((a, b) => dueKey(a).localeCompare(dueKey(b)));
  const pend = tasks.filter((t) => !gDone()[t.id] && (!t.due || diffDays(today(), t.due) >= -3));
  const done = tasks.filter((t) => gDone()[t.id]);
  const by = {}; for (const t of pend) (by[bucketOf(t)] ||= []).push(t);
  const people = new Set(gItems().map((x) => x.by).filter(Boolean));
  return `${groupHead(esc(forestMeta()?.name || 'Salón'), `${plural(pend.length, 'pendiente', 'pendientes')} del grupo · ${plural(people.size, 'compañero activo', 'compañeros activos')}`)}
    <form class="quick" id="gTaskForm" autocomplete="off"><div class="quick-row"><label for="gTaskIn" class="sr">Nueva tarea del Salón</label>
      <input id="gTaskIn" placeholder="Ej. Tarea de hoy: ensayo de historia"><button class="quick-go">${icon('plus', 'sm')}Subir</button></div>
      <div class="quick-preview" id="gTaskPrev"></div></form>
    <p style="margin:-4px 0 12px"><button type="button" class="btn" data-act="g-new">${icon('cam')}Subir con foto o instrucciones</button></p>
    ${focusCardHTML()}
    ${typeof tplCardHTML === 'function' ? tplCardHTML() : ''}
    ${pushBanner()}
    ${pend.length ? BUCKETS.filter(([k]) => by[k]).map(([k, l]) => `<div class="group-h ${k === 'late' ? 'late' : ''}">${l}<span class="count">${by[k].length}</span></div><ul class="tasks">${by[k].map(groupTaskRow).join('')}</ul>`).join('')
      : `<div class="empty" style="margin-top:18px"><h3>Sin pendientes del grupo</h3><p>Cuando alguien suba una tarea, aparece aquí para todos y les llega un aviso.</p></div>`}
    ${done.length ? `<div class="group-h">Ya las hice<span class="count">${done.length}</span></div><ul class="tasks">${done.slice(0, 20).map(groupTaskRow).join('')}</ul>` : ''}`;
}
function openGroupTask(id) {
  const t = gGet(id); if (!t) return;
  const mine = t.by === me();
  const team = gAll('team').find((x) => x.taskId === t.id);
  openSheet(`${sheetHead('Tarea del grupo')}
    <div class="sheet-body">
      ${mine ? `<div class="field"><label for="gtTitle" class="sr">Título</label><input id="gtTitle" class="title-input" value="${esc(t.title)}"></div>
        <div class="row2"><div class="field"><label for="gtDue">Entrega</label><input id="gtDue" class="input" type="date" value="${t.due || ''}"></div><div class="field"><label for="gtTime">Hora</label><input id="gtTime" class="input" type="time" value="${t.time || ''}"></div></div>
        <div class="field"><label for="gtSubj">Materia</label><input id="gtSubj" class="input" value="${esc(t.subject || '')}"></div>
        <div class="field"><label for="gtDesc">Instrucciones</label><textarea id="gtDesc" class="input">${esc(t.desc || '')}</textarea></div>`
      : `<h2 class="serif" style="margin:0 0 6px">${esc(t.title)}</h2>
        <p class="muted" style="margin:0 0 12px">${t.due ? cap(longDate(t.due)) + (t.time ? `, ${fmtTime(t.time)}` : '') : 'Sin fecha'}${t.subject ? ` · ${esc(t.subject)}` : ''}</p>
        ${t.desc ? `<div class="card" style="white-space:pre-wrap">${linkify(t.desc)}</div>` : t.img ? '' : '<p class="small muted">Sin instrucciones.</p>'}`}
      ${t.img ? `<div class="gimg-box" data-gimg="${t.id}"><p class="small muted">Cargando la foto…</p></div>` : ''}
      ${gDoneBy(t.id).length ? `<h3 class="sec" style="margin-top:10px">Ya la hicieron</h3><div class="members">${gDoneBy(t.id).map((x) => `<span class="member">${mini(x.by)}<span>${esc(x.by)}</span></span>`).join('')}</div>` : ''}
      <p class="who-line" style="margin:12px 0">${mini(t.by, 'xs')}<span>Subida por ${esc(t.by)} · ${ago(t.at)}</span></p>
      <div class="btn-row">${team ? `<a class="btn" href="#/equipo/${team.id}">${icon('users')}Ver trabajo en equipo</a>` : `<button class="btn" data-act="g-team-from" data-id="${t.id}">${icon('users')}Hacer en equipo</button>`}
        <button class="btn" data-act="g-task-cal" data-id="${t.id}">${icon('calplus')}A mi calendario</button>
        <button class="btn" data-act="g-copy-mine" data-id="${t.id}">${icon('copy')}Copiar a mis tareas</button></div>
    </div>
    <div class="sheet-foot">${mine ? `<button class="btn danger" data-act="g-del" data-id="${t.id}">${icon('trash')}Quitar</button><span class="grow"></span><button class="btn primary" data-act="g-task-save" data-id="${t.id}">Guardar</button>` : '<span class="grow"></span><button class="btn primary" data-act="sheet-close">Listo</button>'}</div>`);
  if (t.img) loadGImg(curFid(), t.id).then((d) => { const b = document.querySelector(`[data-gimg="${t.id}"]`); if (b) b.innerHTML = d ? `<img class="gimg" src="${d}" alt="Foto de las instrucciones">` : '<p class="small muted">No se pudo cargar la foto.</p>'; });
}
function viewEquipos() {
  const teams = gAll('team').sort((a, b) => dueKey(a).localeCompare(dueKey(b)));
  return `${groupHead('Trabajo en equipo', 'Únanse a un trabajo, repártanse las partes y compartan todo en el muro.')}
    <p><button class="btn primary" data-act="g-team-new">${icon('plus')}Nuevo trabajo en equipo</button></p>
    ${teams.length ? teams.map((tm) => {
      const mem = gAll('join').filter((j) => j.team === tm.id);
      const parts = gAll('part').filter((p) => p.team === tm.id);
      const dn = parts.filter((p) => p.done).length;
      const imIn = mem.some((j) => j.name === me());
      return `<a class="team-card" href="#/equipo/${tm.id}">
        <div class="team-top"><b>${esc(tm.title)}</b>${imIn ? '<span class="chip pen">Estás dentro</span>' : ''}</div>
        <span class="small muted">${tm.due ? `Entrega ${relDay(tm.due)}` : 'Sin fecha'} · ${plural(mem.length, 'integrante', 'integrantes')}</span>
        <div class="team-foot"><span class="stack">${mem.slice(0, 6).map((j) => mini(j.name)).join('')}</span>
        ${parts.length ? `<span class="team-prog"><i style="width:${Math.round((dn / parts.length) * 100)}%"></i></span><span class="tiny faint">${dn}/${parts.length}</span>` : ''}</div></a>`;
    }).join('') : `<div class="empty"><h3>Aún no hay trabajos en equipo</h3><p>Crea uno, invita a tus compañeros a unirse y repártanse las partes.</p></div>`}`;
}
function viewEquipo(id) {
  const tm = gGet(id);
  if (!tm || tm.deleted) return `<a class="back" href="#/equipos">${icon('back')}Equipos</a><div class="empty" style="margin-top:20px"><h3>Este trabajo ya no existe</h3></div>`;
  const mem = gAll('join').filter((j) => j.team === id);
  const imIn = mem.some((j) => j.name === me());
  const parts = gAll('part').filter((p) => p.team === id).sort((a, b) => a.at - b.at);
  const posts = gAll('post').filter((p) => p.team === id).sort((a, b) => a.at - b.at);
  return `<a class="back" href="#/equipos">${icon('back')}Equipos</a>
    <h1 class="page-title">${esc(tm.title)}</h1>
    <p class="page-sub">${tm.due ? `Entrega ${relDay(tm.due)} (${shortDate(tm.due)})` : 'Sin fecha'} · creado por ${esc(tm.by)}</p>
    ${tm.desc ? `<div class="card" style="white-space:pre-wrap;margin-bottom:12px">${linkify(tm.desc)}</div>` : ''}
    <div class="card"><div class="team-top"><b>Integrantes</b>${imIn ? `<button class="btn quiet" data-act="g-leave" data-id="${id}">Salir</button>` : `<button class="btn primary" data-act="g-join" data-id="${id}">${icon('plus')}Unirme</button>`}</div>
      <div class="members">${mem.length ? mem.map((j) => `<span class="member">${mini(j.name)}<span>${esc(j.name)}</span></span>`).join('') : '<span class="small muted">Nadie todavía. ¡Sé el primero!</span>'}</div></div>
    <h2 class="sec">Reparto <small>quién hace qué</small></h2>
    <ul class="tasks">${parts.map((p) => `<li class="task ${p.done ? 'done' : ''}">
      <button type="button" class="chk" data-act="g-part-done" data-id="${p.id}" role="checkbox" aria-checked="${!!p.done}" aria-label="Parte terminada"><span class="box">${icon('check')}</span></button>
      <div class="body" style="cursor:default"><span class="title">${esc(p.text)}</span>
        <span class="meta">${p.owner ? `<span class="who-line">${mini(p.owner, 'xs')}${esc(p.owner)}</span>` : `<button class="link-btn" data-act="g-part-take" data-id="${p.id}">Lo tomo yo</button>`}</span></div>
      ${p.by === me() ? `<button class="icon-btn ghost" data-act="g-del" data-id="${p.id}" aria-label="Quitar parte">${icon('x', 'sm')}</button>` : ''}</li>`).join('')}</ul>
    <form class="add-step" id="gPartForm" style="margin-top:8px"><label for="gPartIn" class="sr">Nueva parte</label><input id="gPartIn" class="input" placeholder="Ej. Introducción, diapositivas 1-5…"><button class="btn">Agregar</button></form>
    <h2 class="sec">Muro del equipo <small>ideas, información y enlaces</small></h2>
    <div class="wall" id="wall">${posts.length ? posts.map((p) => `<div class="post ${p.by === me() ? 'mine' : ''}">${p.by === me() ? '' : mini(p.by)}
      <div class="bubble"><span class="tiny"><b>${esc(p.by)}</b> · ${ago(p.at)}</span><p>${linkify(p.text)}</p>
      ${p.by === me() ? `<button class="link-btn tiny" data-act="g-del" data-id="${p.id}">Borrar</button>` : ''}</div></div>`).join('') : '<p class="small muted" style="text-align:center">Escribe el primer mensaje para tu equipo.</p>'}</div>
    <form class="quick wall-form" id="gPostForm"><div class="quick-row"><label for="gPostIn" class="sr">Mensaje</label><input id="gPostIn" placeholder="Comparte una idea, dato o enlace…" autocomplete="off"><button class="quick-go">Enviar</button></div></form>`;
}
const IDEA_TAGS = { idea: ['Idea', '#8DBF5A'], propuesta: ['Propuesta', '#5B7FD1'], duda: ['Duda', '#D9A947'], recurso: ['Recurso', '#3E9A93'] };
let ideaTag = 'idea';
function viewIdeas() {
  const likes = gAll('like');
  const ideas = gAll('idea').map((i) => ({ ...i, n: likes.filter((l) => l.idea === i.id).length, mine: likes.some((l) => l.idea === i.id && l.by === me()) }))
    .sort((a, b) => b.n - a.n || b.at - a.at);
  return `${groupHead('Ideas del grupo', 'Propuestas, dudas y recursos. Apoya con un corazón las que más te gusten.')}
    <form class="quick thought-new" id="gIdeaForm" autocomplete="off"><label for="gIdeaIn" class="sr">Nueva idea</label>
      <textarea id="gIdeaIn" rows="2" placeholder="Comparte una idea con el grupo…"></textarea>
      <div class="thought-new-row"><div class="pick" role="group">${Object.entries(IDEA_TAGS).map(([k, [l, c]], i) => `<button type="button" data-act="idea-tag" data-v="${k}" aria-pressed="${k === ideaTag}"><span class="dot" style="background:${c}"></span>${l}</button>`).join('')}</div>
      <button class="btn primary">${icon('plus')}Compartir</button></div></form>
    <div class="ideas">${ideas.length ? ideas.map((i) => { const [l, c] = IDEA_TAGS[i.tag] || IDEA_TAGS.idea; return `<article class="idea" style="--c:${c}">
      <span class="thought-mood">${l}</span><p>${linkify(i.text)}</p>
      <div class="idea-foot"><span class="who-line">${mini(i.by, 'xs')}<span>${esc(i.by)} · ${ago(i.at)}</span></span>
      <button class="like ${i.mine ? 'on' : ''}" data-act="g-like" data-id="${i.id}" aria-pressed="${i.mine}" aria-label="Me gusta">${icon('heart', 'sm')}<span>${i.n || ''}</span></button>
      ${i.by === me() ? `<button class="icon-btn ghost" data-act="g-del" data-id="${i.id}" aria-label="Quitar idea">${icon('trash', 'sm')}</button>` : ''}</div></article>`; }).join('')
      : `<div class="empty"><h3>Sin ideas todavía</h3><p>La primera idea puede ser la que les ayude a todos.</p></div>`}</div>`;
}
function viewMasGrupo() {
  const p = profile(); const f = forestMeta(); const st = S.settings;
  if (!p || !f) return '<div class="empty"><h3>Este Salón ya no está</h3><p><button class="btn" data-act="profile-choose">Volver</button></p></div>';
  const mem = f.members.map((id) => ({ id, ...(FOR.members[id] || { name: cap(id), color: '#2F8A5B' }) }));
  return `<h1 class="page-title">Más</h1>
    <p class="page-sub">Ajustes del Salón ${esc(f.name)}.</p>
    ${groupStatus()}
    <h2 class="sec">Integrantes <small>${mem.length}</small></h2>
    <div class="card"><div class="members">${mem.map((m) => `<span class="member">${mini(m.name)}<span>${esc(m.name)}${m.id === f.owner ? ' · fundó el Salón' : ''}</span></span>`).join('')}</div>
      <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-act="forest-invite">${icon('plus')}Invitar a alguien</button></div>
      <p class="small muted" style="margin:10px 0 0">Escribe el nombre de usuario de tu compañero. Le llega una solicitud a su sesión y, si la acepta, entra al Salón.</p></div>
    <ul class="rows" style="margin-top:14px">
      <li><button type="button" class="rowbtn" data-act="forest-rename"><span class="ico">${icon('edit')}</span><span class="txt"><b>Nombre del Salón</b><span>${esc(f.name)}</span></span>${icon('chev', 'chev')}</button></li>
      <li><button type="button" class="rowbtn" data-act="g-push"><span class="ico">${icon('bell')}</span><span class="txt"><b>Avisos del Salón</b><span>${REG.gpush ? 'Activados en este dispositivo' : 'Recibe una notificación cuando alguien suba algo'}</span></span>${icon('chev', 'chev')}</button></li>
      <li><button type="button" class="rowbtn" data-act="profile-choose"><span class="ico">${icon('users')}</span><span class="txt"><b>Volver a mi usuario</b><span>Cambiar de usuario o de Salón</span></span>${icon('chev', 'chev')}</button></li>
      <li><a href="#/instalar"><span class="ico">${icon('phone')}</span><span class="txt"><b>Instalar la app</b><span>Necesario para avisos en iPhone y iPad</span></span>${icon('chev', 'chev')}</a></li></ul>
    <h2 class="sec">Apariencia y sonido</h2>
    <div class="card" style="padding-top:6px;padding-bottom:6px">
      <div class="toggle"><span class="t">Tema</span><div class="seg">${[['light', 'Día'], ['dark', 'Noche']].map(([k, l]) => `<button type="button" data-act="theme" data-v="${k}" aria-pressed="${(st.theme === 'dark' ? 'dark' : 'light') === k}">${l}</button>`).join('')}</div></div>
      <div class="toggle"><span class="t">Hojas cayendo</span><label class="switch"><input type="checkbox" data-set="leaves" data-bool ${st.leaves !== false ? 'checked' : ''} aria-label="Hojas cayendo"><span></span></label></div>
      <div class="toggle"><span class="t">Sonidos suaves</span><label class="switch"><input type="checkbox" data-set="sounds" data-bool ${st.sounds !== false ? 'checked' : ''} aria-label="Sonidos suaves"><span></span></label></div>
    </div>
    <p style="margin-top:18px"><button class="btn danger" data-act="forest-leave">${icon('x')}Salir de este Salón</button></p>`;
}
function urlB64(s) { const p = '='.repeat((4 - (s.length % 4)) % 4); const b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...b].map((c) => c.charCodeAt(0))); }
async function enableGroupPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) { toast(isIOS() ? 'En iPhone o iPad, instala la app en tu pantalla de inicio y ábrela desde el ícono para activar avisos.' : 'Este navegador no permite avisos.'); return; }
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { toast('Sin permiso para avisos. Puedes activarlos después en Más.'); return; }
  try {
    const { publicKey } = await (await fetch('/api/sync?kind=vapid', { cache: 'no-store' })).json();
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64(publicKey) }));
    await cloudFetch('POST', { kind: 'gsub', as: REG.me, subscription: sub.toJSON(), device: CLOUD.device });
    REG.gpush = true; saveReg(); render(); toast('Avisos del grupo activados.'); Snd.chime();
  } catch (e) { toast('No se pudieron activar los avisos. Revisa tu conexión.'); }
}

let navMode = null;
const NAV_PERSONAL = [['hoy', 'home', 'Hoy'], ['tareas', 'list', 'Tareas'], ['calendario', 'cal', 'Calendario'], ['vida', 'tree', 'Vida'], ['mente', 'leaf', 'Mente'], ['mas', 'grid', 'Más']];
const NAV_GROUP = [['grupo', 'list', 'Pendientes'], ['equipos', 'users', 'Equipos'], ['ideas', 'spark', 'Ideas'], ['vida', 'tree', 'Vida'], ['mas', 'grid', 'Más']];
function setNav(group) {
  const mode = group ? 'g' : 'p'; if (mode === navMode) return; navMode = mode;
  $('.nav').innerHTML = (group ? NAV_GROUP : NAV_PERSONAL).map(([k, ic, l]) => `<a href="#/${k}" data-nav="${k}"><svg class="i"><use href="#i-${ic}"/></svg><span>${l}</span></a>`).join('');
}
function openTeamSheet(taskId) {
  const t = taskId ? gGet(taskId) : null;
  openSheet(`${sheetHead('Nuevo trabajo en equipo')}<div class="sheet-body">
    <div class="field"><label for="tmTitle" class="sr">Nombre</label><input id="tmTitle" class="title-input" placeholder="Nombre del trabajo" value="${esc(t?.title || '')}"></div>
    <div class="field"><label for="tmDue">Entrega</label><input id="tmDue" class="input" type="date" value="${t?.due || ''}"></div>
    <div class="field"><label for="tmTask">Tarea del grupo</label><select id="tmTask" class="input"><option value="">Ninguna</option>${gAll('task').map((x) => `<option value="${x.id}" ${x.id === taskId ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</select></div>
    <div class="field"><label for="tmDesc">De qué se trata</label><textarea id="tmDesc" class="input" placeholder="Lo que hay que entregar, cómo se van a organizar…">${esc(t?.desc || '')}</textarea></div>
  </div><div class="sheet-foot"><span class="grow"></span><button class="btn primary" data-act="g-team-create">${icon('users')}Crear y unirme</button></div>`);
  setTimeout(() => $('#tmTitle')?.focus(), 60);
}

/* viewQuien y openProfileSheet están en vida.js */
function switchProfile(id) {
  if (!profile(id)) return;
  if (sheet().open) closeSheet(false);
  if (S.timer?.running) { S.timer.remaining = Math.max(0, S.timer.endAt - Date.now()); S.timer.running = false; S.timer.endAt = null; }
  save();
  const changed = id !== REG.current;
  REG.current = id; saveReg();
  KEY = keyFor(dataOwner());
  S = load();
  if (!S.settings.name && !isForestId(id)) S.settings.name = profile(id).name;
  choosing = false;
  Object.assign(UI, { tf: 'pend', ts: 'all', tt: 'all', q: '', notesQ: '', wStep: 0, calSel: today(), calMonth: today().slice(0, 7) });
  applyTheme();
  if (location.hash && location.hash !== '#/hoy' && !isForestId(id)) location.hash = '#/hoy'; else if (isForestId(id) && location.hash !== '#/grupo') location.hash = '#/grupo'; else render();
  window.scrollTo(0, 0);
  updateBadge(); queueSync(); scheduleReminders(); dailyDigest();
  if (changed) toast(`Ahora estás en ${isForestId(id) ? 'el Salón ' : 'la sesión de '}${profile(id).name}.`);
  cloudSync(); treeCheck();
}

/* ---------- Enfoque ---------- */
function timerState() {
  if (!S.timer) S.timer = { mode: 'focus', running: false, remaining: 25 * 60000, endAt: null, preset: [25, 5], taskId: null, startedAt: null };
  return S.timer;
}
function timerRemaining() {
  const T = timerState();
  return T.running ? Math.max(0, T.endAt - Date.now()) : T.remaining;
}
function viewEnfoque() {
  const T = timerState();
  const rem = timerRemaining();
  const total = (T.mode === 'focus' ? T.preset[0] : T.preset[1]) * 60000;
  const C = 2 * Math.PI * 46;
  const pend = pendingTasks();
  const t0 = today();
  const week = S.focus.filter((f) => diffDays(f.d, t0) < 7);
  const todayMin = S.focus.filter((f) => f.d === t0).reduce((a, f) => a + f.m, 0);
  const weekMin = week.reduce((a, f) => a + f.m, 0);
  const bySub = {};
  for (const f of week) bySub[f.s || ''] = (bySub[f.s || ''] || 0) + f.m;
  const maxSub = Math.max(1, ...Object.values(bySub));
  const st = streak();
  return `<a class="back" href="#/mas">${icon('back')}Más</a>
    <h1 class="page-title">Modo enfoque</h1>
    <p class="page-sub">Estudia en bloques cortos con descansos. Deja el celular boca abajo.</p>
    <div class="seg full" role="group" aria-label="Duración">
      ${[[25, 5], [50, 10], [15, 3]].map((p) => `<button type="button" data-act="preset" data-v="${p.join('-')}" aria-pressed="${T.preset[0] === p[0]}" ${T.running ? 'disabled' : ''}>${p[0]} / ${p[1]} min</button>`).join('')}
    </div>
    <div class="timer ${T.mode === 'break' ? 'break' : ''}" id="timer">
      <svg viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="46" fill="none" stroke-width="5"/>
      <circle class="arc" id="timerArc" cx="50" cy="50" r="46" fill="none" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - rem / total)}"/></svg>
      <div class="clock" id="timerClock" role="timer" aria-live="off">${fmtClock(rem)}</div>
      <div class="mode">${T.mode === 'focus' ? 'Enfoque' : 'Descanso'}</div>
    </div>
    <div class="timer-ctl">
      <button class="btn primary" data-act="timer-toggle">${T.running ? icon('pause') + 'Pausar' : icon('play') + (rem < total ? 'Seguir' : 'Empezar')}</button>
      <button class="btn" data-act="timer-reset">${icon('reset')}Reiniciar</button>
    </div>
    <div class="field" style="margin-top:14px"><label for="timerTask">¿En qué vas a trabajar?</label>
      <select id="timerTask" class="input" data-timer-task>
        <option value="">Estudio libre</option>
        ${pend.map((t) => `<option value="${t.id}" ${T.taskId === t.id ? 'selected' : ''}>${esc(t.title)}${subj(t.subjectId) ? ` (${esc(subj(t.subjectId).name)})` : ''}</option>`).join('')}
      </select></div>
    ${ambientHTML()}
    <h2 class="sec">Tu constancia</h2>
    <div class="card"><div class="stat-line">
      <div><b class="num">${fmtMinutes(todayMin)}</b><span>hoy</span></div>
      <div><b class="num">${fmtMinutes(weekMin)}</b><span>últimos 7 días</span></div>
      <div><b class="num">${st}</b><span>${st === 1 ? 'día seguido' : 'días seguidos'}</span></div>
    </div>
    ${Object.keys(bySub).length ? `<div class="bars" style="margin-top:18px">${Object.entries(bySub).sort((a, b) => b[1] - a[1]).map(([sid, m]) => {
      const s = subj(sid);
      return `<div class="b"><span>${esc(s ? s.name : 'Estudio libre')}</span><span class="num muted">${fmtMinutes(m)}</span><span class="track"><i style="width:${(m / maxSub) * 100}%;background:${s ? safeColor(s.color) : 'var(--ink-3)'}"></i></span></div>`;
    }).join('')}</div>` : '<p class="small muted" style="margin:14px 0 0">Cuando termines tu primer bloque, aquí verás cuánto estudiaste por materia.</p>'}
    </div>
    <p class="small muted">La racha cuenta los días seguidos en que entregaste algo o hiciste al menos un bloque de enfoque.</p>`;
}
function fmtClock(ms) { const s = Math.ceil(ms / 1000); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

/* ---------- Herramientas ---------- */
function viewHerramientas() {
  const items = [
    ['#/calc', 'spark', '¿Cuánto necesito sacar?', 'Calcula la calificación que te falta para pasar o subir tu promedio'],
    ['#/apa', 'copy', 'Referencias APA', 'Arma la cita de una página web, libro, artículo o video'],
    ['#/checklist', 'check', 'Checklist antes de entregar', 'Para que no se te olvide la portada ni el formato'],
    ['#/respaldo', 'calplus', 'Pasar entregas a tu calendario', 'Recordatorios en el calendario de tu celular'],
  ];
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Herramientas</h1><p class="page-sub">Ayudas para la escuela que usarás seguido.</p>
    <ul class="rows">${items.map(([h, ic, t, d]) => `<li><a href="${h}"><span class="ico">${icon(ic)}</span><span class="txt"><b>${t}</b><span>${d}</span></span>${icon('chev', 'chev')}</a></li>`).join('')}</ul>`;
}
function viewCalc() {
  const max = S.settings.gradeMax;
  const step = max === 100 ? 1 : 0.1;
  return `<a class="back" href="#/herramientas">${icon('back')}Herramientas</a>
    <h1 class="page-title">¿Cuánto necesito sacar?</h1>
    <p class="page-sub">Pon tu promedio actual y cuánto del curso ya está calificado.</p>
    <div class="card">
      <div class="row2">
        <div class="field"><label for="cAvg">Promedio que llevas</label><input id="cAvg" class="input calc" type="number" inputmode="decimal" step="${step}" min="0" max="${max}" placeholder="Ej. ${max === 100 ? 72 : 7.2}"></div>
        <div class="field"><label for="cEval">% ya calificado</label><input id="cEval" class="input calc" type="number" inputmode="numeric" min="0" max="100" placeholder="Ej. 60"></div>
      </div>
      <div class="field"><label for="cTarget">Quiero terminar con</label><input id="cTarget" class="input calc" type="number" inputmode="decimal" step="${step}" min="0" max="${max}" value="${S.settings.target}"></div>
      <div id="calcOut" class="out result">Escribe tus datos y aquí aparece el resultado.</div>
    </div>
    <h2 class="sec">Sacar promedio</h2>
    <div class="card"><div class="field"><label for="avgIn">Tus calificaciones, separadas por espacio o coma</label>
      <input id="avgIn" class="input" inputmode="decimal" placeholder="Ej. 8 9.5 7 10"></div>
      <div id="avgOut" class="out result">El promedio aparece aquí.</div></div>`;
}
function calcUpdate() {
  const max = S.settings.gradeMax;
  const a = parseFloat($('#cAvg')?.value), e = parseFloat($('#cEval')?.value), tg = parseFloat($('#cTarget')?.value);
  const out = $('#calcOut');
  if (out) {
    if ([a, e, tg].some(isNaN)) out.innerHTML = 'Escribe tus datos y aquí aparece el resultado.';
    else if (a < 0 || a > max || e < 0 || e >= 100 || tg < 0 || tg > max) out.innerHTML = `Revisa los números: el promedio va de 0 a ${max} y el porcentaje calificado debe ser menor que 100.`;
    else {
      const need = (tg * 100 - a * e) / (100 - e);
      const r = Math.round(need * 10) / 10;
      if (need <= 0) out.innerHTML = `<b class="big">Ya la tienes</b>Aunque saques 0 en lo que falta, terminas con ${fmtGrade(tg)} o más.`;
      else if (need > max) out.innerHTML = `<b class="big" style="color:var(--red)">No alcanza</b>Con ${max} en todo lo que falta llegarías a ${fmtGrade(Math.round(((a * e + max * (100 - e)) / 100) * 10) / 10)}. Habla con tu profe sobre trabajos extra.`;
      else out.innerHTML = `<b class="big">${fmtGrade(r)}</b>Es el promedio que necesitas en el ${Math.round(100 - e)}% que falta para terminar con ${fmtGrade(tg)}.`;
    }
  }
  const nums = ($('#avgIn')?.value || '').split(/[\s,;]+/).map(parseFloat).filter((x) => !isNaN(x));
  const ao = $('#avgOut');
  if (ao) ao.innerHTML = nums.length ? `<b class="big">${fmtGrade(Math.round((nums.reduce((x, y) => x + y, 0) / nums.length) * 100) / 100)}</b>Promedio de ${plural(nums.length, 'calificación', 'calificaciones')}.` : 'El promedio aparece aquí.';
}

const APA_FIELDS = {
  web: [['authors', 'Autor(es) u organización', 'García López, Ana; Pérez, Juan  —  o  —  UNESCO'], ['date', 'Fecha de publicación', '2024, 5 de marzo  (si no hay, déjalo vacío)'], ['title', 'Título de la página', ''], ['site', 'Nombre del sitio', 'Ej. National Geographic'], ['url', 'URL', 'https://…']],
  libro: [['authors', 'Autor(es)', 'Apellido, Nombre; Apellido, Nombre'], ['date', 'Año', '2019'], ['title', 'Título del libro', ''], ['edition', 'Edición (si no es la primera)', 'Ej. 3'], ['publisher', 'Editorial', 'Ej. Pearson'], ['url', 'DOI o URL (opcional)', '']],
  articulo: [['authors', 'Autor(es)', 'Apellido, Nombre; Apellido, Nombre'], ['date', 'Año', '2022'], ['title', 'Título del artículo', ''], ['journal', 'Nombre de la revista', ''], ['volume', 'Volumen', ''], ['issue', 'Número', ''], ['pages', 'Páginas', 'Ej. 45-60'], ['url', 'DOI o URL', '']],
  video: [['authors', 'Canal o autor', 'Ej. Khan Academy Español'], ['date', 'Fecha de publicación', '2021, 14 de junio'], ['title', 'Título del video', ''], ['url', 'URL', 'https://youtube.com/…']],
};
const apaDraft = {};
function viewAPA() {
  const f = APA_FIELDS[UI.apa];
  return `<a class="back" href="#/herramientas">${icon('back')}Herramientas</a>
    <h1 class="page-title">Referencias APA</h1>
    <p class="page-sub">Formato APA 7.ª edición en español. Escribe autores como <span class="kbd">Apellido, Nombre</span> y sepáralos con punto y coma.</p>
    <div class="seg full" role="group" aria-label="Tipo de fuente">
      ${[['web', 'Página web'], ['libro', 'Libro'], ['articulo', 'Artículo'], ['video', 'Video']].map(([k, l]) => `<button type="button" data-act="apa-type" data-v="${k}" aria-pressed="${UI.apa === k}">${l}</button>`).join('')}
    </div>
    <div class="card" style="margin-top:14px">
      ${f.map(([k, l, ph]) => `<div class="field"><label for="apa-${k}">${l}</label><input id="apa-${k}" class="input apa" data-k="${k}" placeholder="${esc(ph)}" value="${esc(apaDraft[k] || '')}"></div>`).join('')}
      <div class="out" id="apaOut" aria-live="polite">${apaFormat().html || 'Tu referencia aparece aquí.'}</div>
      <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-act="apa-copy">${icon('copy')}Copiar</button><button class="btn" data-act="apa-save">Guardar en mi lista</button><button class="btn quiet" data-act="apa-clear">Limpiar</button></div>
    </div>
    ${S.refs.length ? `<h2 class="sec">Mi lista de referencias <small>${S.refs.length}</small></h2>
      <div class="card">${S.refs.slice().sort((a, b) => a.text.localeCompare(b.text, 'es')).map((r) => `<div style="display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line)"><div style="flex:1;padding-left:2em;text-indent:-2em">${r.html}</div><button class="icon-btn ghost" data-act="ref-del" data-id="${r.id}" aria-label="Quitar">${icon('trash')}</button></div>`).join('')}
      <div class="btn-row" style="margin-top:12px"><button class="btn" data-act="refs-copy">${icon('copy')}Copiar toda la lista</button></div></div>` : ''}`;
}
function apaAuthors(str) {
  const parts = String(str || '').split(/;|\n/).map((s) => s.trim()).filter(Boolean);
  const fmt = parts.map((p) => {
    if (!p.includes(',')) return p;
    const [last, first = ''] = p.split(',').map((s) => s.trim());
    const ini = first.split(/\s+/).filter(Boolean).map((w) => w.split('-').map((x) => x ? x[0].toUpperCase() + '.' : '').join('-')).join(' ');
    return ini ? `${last}, ${ini}` : last;
  });
  if (!fmt.length) return '';
  if (fmt.length === 1) return fmt[0];
  if (fmt.length === 2) return `${fmt[0]}, y ${fmt[1]}`;
  if (fmt.length <= 20) return `${fmt.slice(0, -1).join(', ')}, y ${fmt[fmt.length - 1]}`;
  return `${fmt.slice(0, 19).join(', ')}, . . . ${fmt[fmt.length - 1]}`;
}
function apaFormat() {
  const d = apaDraft;
  const e = (s) => esc(String(s || '').trim());
  const dot = (s) => (/[.?!]$/.test(s) ? s : s + '.');
  const A = apaAuthors(d.authors);
  const date = (d.date || '').trim() || 's.f.';
  const url = (d.url || '').trim();
  const T = (d.title || '').trim();
  if (!T) return { html: '', text: '' };
  let html = '', text = '';
  const lead = (titleHTML, titleText) => A ? [`${e(dot(A))} (${e(date)}). ${titleHTML}`, `${dot(A)} (${date}). ${titleText}`] : [`${titleHTML} (${e(date)}).`, `${titleText} (${date}).`];
  if (UI.apa === 'web') {
    const site = (d.site || '').trim();
    const [h, t] = lead(`<i>${e(T)}</i>.`, `${dot(T)}`);
    html = `${h}${site && site !== A ? ` ${e(dot(site))}` : ''}${url ? ` ${e(url)}` : ''}`;
    text = `${t}${site && site !== A ? ` ${dot(site)}` : ''}${url ? ` ${url}` : ''}`;
  } else if (UI.apa === 'libro') {
    const ed = (d.edition || '').trim();
    const edTxt = ed && ed !== '1' ? ` (${ed.replace(/\D/g, '') || ed}.ª ed.)` : '';
    const [h, t] = lead(`<i>${e(T)}</i>${e(edTxt)}.`, `${T}${edTxt}.`);
    html = `${h}${d.publisher ? ` ${e(dot(d.publisher.trim()))}` : ''}${url ? ` ${e(url)}` : ''}`;
    text = `${t}${d.publisher ? ` ${dot(d.publisher.trim())}` : ''}${url ? ` ${url}` : ''}`;
  } else if (UI.apa === 'articulo') {
    const [h, t] = lead(`${e(dot(T))}`, `${dot(T)}`);
    const j = (d.journal || '').trim(), v = (d.volume || '').trim(), n = (d.issue || '').trim(), p = (d.pages || '').trim();
    const srcH = j ? ` <i>${e(j)}</i>${v ? `, <i>${e(v)}</i>` : ''}${n ? `(${e(n)})` : ''}${p ? `, ${e(p)}` : ''}.` : '';
    const srcT = j ? ` ${j}${v ? `, ${v}` : ''}${n ? `(${n})` : ''}${p ? `, ${p}` : ''}.` : '';
    html = `${h}${srcH}${url ? ` ${e(url)}` : ''}`;
    text = `${t}${srcT}${url ? ` ${url}` : ''}`;
  } else {
    const [h, t] = lead(`<i>${e(T)}</i> [Video].`, `${T} [Video].`);
    html = `${h} YouTube.${url ? ` ${e(url)}` : ''}`;
    text = `${t} YouTube.${url ? ` ${url}` : ''}`;
  }
  return { html, text };
}
async function copyRich(html, text) {
  try {
    if (window.ClipboardItem && navigator.clipboard?.write) {
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([text], { type: 'text/plain' }) })]);
    } else await navigator.clipboard.writeText(text);
    toast('Copiada. Pégala en tu documento.');
  } catch {
    toast('No se pudo copiar automáticamente. Mantén presionado el texto para copiarlo.');
  }
}

function viewChecklist() {
  const items = S.settings.checklist;
  return `<a class="back" href="#/herramientas">${icon('back')}Herramientas</a>
    <h1 class="page-title">Antes de entregar</h1>
    <p class="page-sub">Repásala antes de imprimir o subir tu trabajo. Puedes agregarla como pasos dentro de cualquier tarea.</p>
    <div class="card"><ul class="checklist">${items.map((it, i) => `<li><input type="checkbox" id="ck${i}"><label for="ck${i}">${esc(it)}</label><button class="rm" data-act="ck-del" data-i="${i}" aria-label="Quitar">${icon('x', 'sm')}</button></li>`).join('')}</ul>
      <form class="add-step" id="ckForm" style="margin-top:12px"><label for="ckNew" class="sr">Nuevo punto</label><input id="ckNew" class="input" placeholder="Agregar un punto a tu lista"><button class="btn">Agregar</button></form>
      <div class="btn-row" style="margin-top:12px"><button class="btn quiet" data-act="ck-uncheck">Desmarcar todo</button><button class="btn quiet" data-act="ck-reset">Volver a la lista original</button></div></div>`;
}

/* ---------- Apuntes ---------- */
function noteCard(n) {
  const s = subj(n.subjectId);
  return `<button type="button" class="note ${n.pinned ? 'pinned' : ''}" data-act="open-note" data-id="${n.id}" style="--c:${(libretas().find((l) => l.id === n.libreta)?.color) || (s ? safeColor(s.color) : 'transparent')}">
    <b>${n.pinned ? '<svg class="i sm star" aria-label="Fijado"><use href="#i-star"/></svg> ' : ''}${esc(n.title || 'Sin título')}</b>${n.photos?.length ? `<span class="tiny faint">${plural(n.photos.length, 'foto', 'fotos')}</span>` : ''}<p>${esc((n.body || '').slice(0, 280))}</p>
    <span class="tiny faint">${libretas().find((l) => l.id === n.libreta) ? esc(libretas().find((l) => l.id === n.libreta).emoji) + ' ' : ''}${s ? esc(s.name) + ', ' : ''}${relDay(toISO(new Date(n.updated || Date.now())))}</span></button>`;
}
function viewNotas() {
  const q = normChars(UI.notesQ.trim());
  const list = S.notes.filter((n) => (!UI.libreta || n.libreta === UI.libreta) && (!q || normChars(`${n.title} ${n.body}`).includes(q))).sort((a, b) => (!!b.pinned - !!a.pinned) || (b.updated || 0) - (a.updated || 0));
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Apuntes</h1>
    <p class="page-sub">Lo que no quieres olvidar: temas del examen, lo que dijo el profe, ideas para el proyecto.</p>
    ${libretaBarHTML()}
    ${S.notes.length ? `<div class="quick" style="box-shadow:none;margin:10px 0 14px"><div class="quick-row">${icon('search')}<label for="notesQ" class="sr">Buscar apuntes</label><input id="notesQ" type="search" placeholder="Buscar en apuntes" value="${esc(UI.notesQ)}"></div></div>` : ''}
    <div id="notesList">${list.length ? `<div class="notes">${list.map(noteCard).join('')}</div>` : S.notes.length ? '<p class="muted">Sin resultados.</p>' : `<div class="empty"><h3>Sin apuntes</h3><p>Escribe tu primer apunte. Puedes ligarlo a una materia.</p></div>`}</div>
    <p style="margin-top:14px"><button class="btn primary" data-act="new-note">${icon('plus')}Nuevo apunte</button></p>`;
}

/* ---------- Respaldo ---------- */
function viewRespaldo() {
  const pend = pendingTasks().filter((t) => t.due);
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Respaldo y calendario</h1>
    <p class="page-sub">Tus datos viven solo en este dispositivo. Haz un respaldo de vez en cuando por si cambias de celular o borras el navegador.</p>
    <div class="card">
      <p style="margin:0 0 12px">${S.settings.lastBackup ? `Último respaldo: ${relDay(S.settings.lastBackup)}.` : 'Todavía no haces ningún respaldo.'}</p>
      <div class="btn-row">
        <button class="btn primary" data-act="backup">${icon('save')}Descargar respaldo</button>
        ${navigator.canShare ? `<button class="btn" data-act="backup-share">${icon('share')}Enviar respaldo</button>` : ''}
        <label class="btn" for="restoreIn">${icon('upload')}Cargar respaldo</label>
        <input type="file" id="restoreIn" accept=".json,application/json" class="sr">
      </div>
      <p class="small muted" style="margin:12px 0 0">El respaldo es un archivo .json. Guárdalo en tu Drive, correo o WhatsApp contigo mismo, y cárgalo aquí cuando lo necesites.</p>
    </div>
    <h2 class="sec">Autoguardado por día</h2>
    <div class="card"><p style="margin:0 0 10px">Cada cambio se guarda al instante, y además la app guarda una copia de cada día (los últimos ${SNAP_DAYS} días). Si algo sale mal, vuelve al día que quieras.</p>
      <div id="snapList"><p class="small muted" style="margin:0">Cargando copias…</p></div>
      <div class="btn-row" style="margin-top:12px"><button class="btn" data-act="csv">${icon('save')}Exportar tareas a Excel (CSV)</button></div></div>
    <h2 class="sec">Recordatorios en tu calendario</h2>
    <div class="card">
      <p style="margin:0 0 12px">Pasa tus ${plural(pend.length, 'entrega pendiente', 'entregas pendientes')} al calendario de tu celular. Cada una lleva un aviso un día antes y otro ${fmtMinutes(S.settings.remindBefore)} antes de la hora de entrega.</p>
      <div class="btn-row"><button class="btn" data-act="ics-all" ${pend.length ? '' : 'disabled'}>${icon('calplus')}Descargar archivo de calendario (.ics)</button></div>
      <p class="small muted" style="margin:12px 0 0">Ábrelo y elige tu app de calendario. Para una sola tarea, ábrela y toca “Al calendario”.</p>
    </div>`;
}

/* ---------- Ajustes ---------- */
function viewAjustes() {
  const st = S.settings;
  const notifState = !('Notification' in window) ? 'unsupported' : Notification.permission;
  const me = profile();
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Ajustes</h1>
    <p class="page-sub">Estos ajustes son solo de ${esc(me.name)}.</p>
    <div class="card" style="padding-top:6px;padding-bottom:6px">
      <div class="toggle"><span style="display:flex;align-items:center;gap:12px">${avatar(me, 'sm')}<span><span class="t">Usuario: ${esc(me.name)}</span><span class="d" style="display:block">Cada usuario tiene sus propias tareas.</span></span></span>
        <button class="btn" data-act="profile-sheet">Cambiar</button></div>
      <div class="toggle"><span><span class="t">Preguntar quién eres al abrir</span><span class="d" style="display:block">Útil si comparten el mismo celular.</span></span>
        <label class="switch"><input type="checkbox" data-reg="ask" ${REG.ask ? 'checked' : ''} aria-label="Preguntar quién eres al abrir"><span></span></label></div>
    </div>
    ${accountCardHTML()}
    <div class="card" style="margin-top:12px">
      <div class="field"><label for="setName">Cómo te saludo</label><input id="setName" class="input" data-set="name" value="${esc(st.name)}" placeholder="Para saludarte"></div>
      <div class="field" style="margin:0"><span class="lbl">Tema</span><div class="seg" role="group">${[['light', 'Bosque de día'], ['dark', 'Bosque de noche']].map(([k, l]) => `<button type="button" data-act="theme" data-v="${k}" aria-pressed="${(st.theme === 'dark' ? 'dark' : 'light') === k}">${l}</button>`).join('')}</div></div>
    </div>
    ${voiceSettingsHTML()}
    <h2 class="sec">Calificaciones</h2>
    <div class="card">
      <div class="field"><span class="lbl">Escala</span><div class="seg" role="group">${[[10, '0 a 10'], [100, '0 a 100']].map(([k, l]) => `<button type="button" data-act="scale" data-v="${k}" aria-pressed="${st.gradeMax === k}">${l}</button>`).join('')}</div></div>
      <div class="row2">
        <div class="field"><label for="setPass">Mínimo aprobatorio</label><input id="setPass" class="input" type="number" inputmode="decimal" step="${st.gradeMax === 100 ? 1 : 0.1}" data-set="passGrade" data-num value="${st.passGrade}"></div>
        <div class="field"><label for="setTarget">Meta de promedio</label><input id="setTarget" class="input" type="number" inputmode="decimal" step="${st.gradeMax === 100 ? 1 : 0.1}" data-set="target" data-num value="${st.target}"></div>
      </div>
    </div>
    <h2 class="sec">Recordatorios</h2>
    <div class="card" style="padding-top:6px;padding-bottom:6px">
      <div class="toggle"><span><span class="t">Notificaciones</span><span class="d" style="display:block">${notifState === 'granted' ? 'Activadas en este dispositivo.' : notifState === 'denied' ? 'Bloqueadas. Actívalas en los permisos del navegador para este sitio.' : notifState === 'unsupported' ? (isIOS() && !isStandalone() ? 'En iPhone, primero instala la app en tu pantalla de inicio (Más, Instalar la app). Ahí ya podrás activar los avisos.' : 'Este navegador no permite notificaciones. Usa “Al calendario” en cada tarea.') : 'Te avisa lo que vence hoy y mañana.'}</span></span>
        ${notifState === 'default' ? `<button class="btn primary" data-act="notif-enable">Activar</button>` : notifState === 'granted' ? `<button class="btn" data-act="notif-test">Probar</button>` : ''}</div>
      <div class="toggle"><span><span class="t">Hojas cayendo</span><span class="d" style="display:block">Hojas que caen despacio por la app.</span></span>
        <label class="switch"><input type="checkbox" data-set="leaves" data-bool ${st.leaves !== false ? 'checked' : ''} aria-label="Hojas cayendo"><span></span></label></div>
      <div class="toggle"><span><span class="t">Sonidos suaves</span><span class="d" style="display:block">Campanita al entregar y gotita al terminar un paso.</span></span>
        <label class="switch"><input type="checkbox" data-set="sounds" data-bool ${st.sounds !== false ? 'checked' : ''} aria-label="Sonidos suaves"><span></span></label></div>
      <div class="toggle"><span><span class="t">Resumen del día</span><span class="d" style="display:block">Al abrir la app, un aviso con lo que vence hoy y mañana.</span></span>
        <label class="switch"><input type="checkbox" data-set="digest" data-bool ${st.digest ? 'checked' : ''} aria-label="Resumen del día"><span></span></label></div>
      <div class="toggle"><span><span class="t">Avisar antes de la hora de entrega</span></span>
        <select class="input" style="width:auto;min-height:40px" data-set="remindBefore" data-num aria-label="Anticipación">${[[15, '15 min'], [30, '30 min'], [60, '1 hora'], [120, '2 horas'], [240, '4 horas']].map(([v, l]) => `<option value="${v}" ${st.remindBefore === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    </div>
    <p class="small muted">Los avisos llegan mejor con la app instalada. Para recordatorios seguros aunque no abras la app, pasa tus tareas al calendario del celular desde <a href="#/respaldo">Respaldo y calendario</a>.</p>
    <h2 class="sec">Datos</h2>
    <div class="card"><p style="margin:0 0 12px">${esc(me.name)} tiene ${plural(S.tasks.length, 'tarea', 'tareas')}, ${plural(S.subjects.length, 'materia', 'materias')} y ${plural(S.notes.length, 'apunte', 'apuntes')} guardados en este dispositivo.</p>
      <div class="btn-row"><a class="btn" href="#/respaldo">${icon('save')}Respaldo</a><button class="btn danger" data-act="wipe">${icon('trash')}Borrar datos de ${esc(me.name)}</button></div></div>
    <p class="tiny faint" style="margin-top:24px">Al Día 7.3. Funciona sin internet una vez instalada.</p>`;
}

/* ---------- Instalar ---------- */
function viewInstalar() {
  let body;
  if (isStandalone()) body = `<div class="card"><p style="margin:0"><b>Ya la estás usando como app.</b> Búscala en tu pantalla de inicio como “Al Día”.</p></div>`;
  else if (deferredInstall) body = `<div class="card"><p style="margin:0 0 14px">Tu navegador puede instalarla directo. Queda como una app más en tu celular o computadora y funciona sin internet.</p><button class="btn primary" data-act="install">${icon('phone')}Instalar Al Día</button></div>`;
  else if (isIOS()) body = `<div class="card help"><p><b>En iPhone o iPad (Safari):</b></p><ul><li>Toca el botón <b>Compartir</b> (el cuadro con la flecha hacia arriba).</li><li>Baja y elige <b>Agregar a inicio</b>.</li><li>Toca <b>Agregar</b>. Listo: aparece el ícono de Al Día.</li></ul></div>`;
  else body = `<div class="card help"><p><b>En Android (Chrome):</b></p><ul><li>Toca el menú <b>⋮</b> arriba a la derecha.</li><li>Elige <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>.</li><li>Confirma con <b>Instalar</b>.</li></ul>
    <p><b>En computadora (Chrome o Edge):</b> haz clic en el ícono de instalar que aparece a la derecha de la barra de direcciones.</p></div>`;
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Instalar la app</h1>
    <p class="page-sub">No necesitas tienda de apps. Se instala desde el navegador y ocupa muy poco espacio.</p>${body}
    <p class="small muted">Tus datos se quedan en el dispositivo donde la instalaste. Para pasarlos a otro, usa <a href="#/respaldo">Respaldo</a>.</p>`;
}

/* ---------- Ayuda ---------- */
function viewAyuda() {
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Cómo usar Al Día</h1>
    <div class="card help">
      <p><b>Captura rápida.</b> En Hoy escribe como hablas. Entiende:</p>
      <ul>
        <li>Días: <span class="kbd">hoy</span>, <span class="kbd">mañana</span>, <span class="kbd">pasado mañana</span>, <span class="kbd">el viernes</span>, <span class="kbd">el 30</span>, <span class="kbd">30/10</span>, <span class="kbd">30 de octubre</span>, <span class="kbd">en 3 días</span>, <span class="kbd">en 2 semanas</span>, <span class="kbd">la próxima semana</span>.</li>
        <li>Horas: <span class="kbd">a las 8</span>, <span class="kbd">a las 7:30 de la mañana</span>, <span class="kbd">14:00</span>, <span class="kbd">3pm</span>.</li>
        <li>Materia: escribe su nombre o parte de él (<span class="kbd">mate</span>, <span class="kbd">inglés</span>) o usa <span class="kbd">#mate</span>.</li>
        <li>Tipo: si dice examen, proyecto, exposición, lectura o práctica, lo detecta.</li>
        <li>Importancia: <span class="kbd">urgente</span>, <span class="kbd">importante</span> o <span class="kbd">!</span>. Valor: <span class="kbd">vale 20%</span>.</li>
      </ul>
      <p><b>Plan de hoy.</b> Ordena lo que conviene avanzar según la fecha, si es de una materia importante, cuánto vale y cuánto tiempo lleva.</p>
      <p><b>Pasos.</b> Dentro de una tarea, toca “Sugerir pasos” y luego “Repartir en días”: cada paso aparece en tu Plan de hoy el día que toca.</p>
      <p><b>Calificaciones.</b> Al entregar, anota la calificación y cuánto vale. En cada materia verás tu promedio y lo que necesitas para tu meta.</p>
      <p><b>Recordatorios.</b> Activa las notificaciones en Ajustes, o pasa tus entregas al calendario del celular para avisos seguros.</p>
      <p><b>Dos usuarios.</b> Mitchell y Mel tienen cada quien sus tareas, materias y calificaciones. Cambia de usuario tocando tu nombre arriba en Hoy, o desde Más.</p>
      <p style="margin:0"><b>Tus datos.</b> Se guardan solo en este dispositivo, sin cuentas. Haz un respaldo de vez en cuando.</p>
    </div>`;
}

/* ---------- Bienvenida ---------- */
function viewBienvenida() {
  const st = UI.wStep;
  const ind = `<div class="steps-ind" aria-hidden="true">${[0, 1].map((i) => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div>`;
  if (st === 0) {
    const me = profile();
    return `<div class="welcome">${ind}<div style="margin-bottom:18px">${avatar(me, 'lg')}</div>
      <h1>Hola, ${esc(me.name)}.<br>Tus tareas, al día.</h1>
      <p class="lead">Anota lo que te dejan, ve qué toca primero y no se te pase ninguna entrega.</p>
      <button class="btn primary block" data-act="w-next">Empezar</button>
      <p style="text-align:center"><button class="link-btn" data-act="w-skip">Saltar y empezar</button></p>
      <p style="text-align:center"><button class="link-btn" data-act="profile-choose">No soy ${esc(me.name)}</button></p></div>`;
  }
  return `<div class="welcome">${ind}<h1 style="font-size:clamp(32px,9vw,44px)">¿Qué materias llevas?</h1>
    <p class="lead">Escribe cada una y toca Agregar. Marca con estrella las más importantes: tendrán prioridad en tu plan.</p>
    <form id="wSub" class="add-step"><label for="wSubIn" class="sr">Materia</label><input id="wSubIn" class="input" placeholder="Ej. Matemáticas" autocomplete="off"><button class="btn primary">Agregar</button></form>
    <div style="margin:14px 0 20px">${S.subjects.map((s) => `<div class="wsub"><span class="dot" style="background:${safeColor(s.color)}"></span><span>${esc(s.name)}</span>
      <button type="button" class="icon-btn ghost" data-act="w-star" data-id="${s.id}" aria-pressed="${s.important}" aria-label="Importante">${s.important ? '<svg class="i star"><use href="#i-star"/></svg>' : icon('star')}</button>
      <button type="button" class="icon-btn ghost" data-act="w-del" data-id="${s.id}" aria-label="Quitar ${esc(s.name)}">${icon('x')}</button></div>`).join('')}</div>
    <button class="btn primary block" data-act="w-done">${S.subjects.length ? 'Listo, empezar' : 'Empezar sin materias'}</button>
    <p class="small muted" style="text-align:center">El horario, profesor y salón los agregas después en Materias.</p></div>`;
}

/* ---------- Render principal ---------- */
function render() {
  const r = route();
  const main = $('#view');
  let html;
  const groupMode = !choosing && isGroup();
  const showWelcome = choosing || (!groupMode && !S.settings.onboarded && !S.tasks.length);
  setNav(groupMode);
  if (choosing) html = viewQuien();
  else if (groupMode) {
    html = r.name === 'equipos' ? viewEquipos() : r.name === 'equipo' ? viewEquipo(r.arg) : r.name === 'ideas' ? viewIdeas() : r.name === 'vida' ? viewVida() : r.name === 'instalar' ? viewInstalar() : r.name === 'mas' ? viewMasGrupo() : viewGrupo();
  } else if (showWelcome) html = viewBienvenida();
  else {
    switch (r.name) {
      case 'tareas': html = viewTareas(); break;
      case 'calendario': html = viewCalendario(); break;
      case 'materias': html = viewMaterias(); break;
      case 'materia': html = viewMateria(r.arg); break;
      case 'mas': html = viewMas(); break;
      case 'enfoque': html = viewEnfoque(); break;
      case 'herramientas': html = viewHerramientas(); break;
      case 'calc': html = viewCalc(); break;
      case 'apa': html = viewAPA(); break;
      case 'checklist': html = viewChecklist(); break;
      case 'notas': html = viewNotas(); break;
      case 'respaldo': html = viewRespaldo(); break;
      case 'ajustes': html = viewAjustes(); break;
      case 'instalar': html = viewInstalar(); break;
      case 'ayuda': html = viewAyuda(); break;
      case 'escanear': html = viewEscanear(); break;
      case 'mente': html = viewMente(); break;
      case 'vida': html = viewVida(); break;
      case 'panel': html = viewPanel(); break;
      case 'cerebro': html = viewCerebro(); break;
      case 'carta': setTimeout(() => { history.replaceState(null, '', '#/mas'); writeLetter(); }, 0); html = viewMas(); break;
      default: html = viewHoy();
    }
  }
  // conservar el texto de la captura rápida si se vuelve a pintar Hoy
  const qv = $('#quickIn')?.value;
  const hadFocus = document.activeElement?.id;
  main.innerHTML = html;
  harmonize(main);
  if (r.name === 'cerebro' && !groupMode && !choosing && !showWelcome) brainInit();
  if (qv && $('#quickIn')) { $('#quickIn').value = qv; updateQuickPreview(); }
  if (hadFocus && ['quickIn', 'taskQ', 'notesQ'].includes(hadFocus)) { const el = $('#' + hadFocus); if (el) { el.focus(); const v = el.value; el.setSelectionRange?.(v.length, v.length); } }

  const known = ['carta', 'panel', 'cerebro', 'vida', 'mente', 'escanear', 'tareas', 'calendario', 'materias', 'materia', 'mas', 'enfoque', 'herramientas', 'calc', 'apa', 'checklist', 'notas', 'respaldo', 'ajustes', 'instalar', 'ayuda'];
  const rn = known.includes(r.name) ? r.name : 'hoy';
  const navName = groupMode ? ({ equipos: 'equipos', equipo: 'equipos', ideas: 'ideas', vida: 'vida', mas: 'mas', instalar: 'mas' }[r.name] || 'grupo') : showWelcome ? '' : ({ materia: 'mas', materias: 'mas', tareas: 'tareas', calendario: 'calendario', hoy: 'hoy', mente: 'mente', vida: 'vida' }[rn] || 'mas');
  $$('.nav a').forEach((a) => { if (a.dataset.nav === navName) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('.nav').hidden = showWelcome;
  $('#fab').hidden = groupMode || showWelcome || !['hoy', 'tareas', 'calendario', 'materia'].includes(rn);
  updateFocusPill();
  if (r.name === 'calc') calcUpdate();
  if (r.name === 'respaldo') fillSnapList();
  hydratePhotos();
  document.title = timerState().running ? `${fmtClock(timerRemaining())} · Al Día` : 'Al Día';
}

/* =========================================================
   8. Hojas de edición
   ========================================================= */
let draft = null, draftDirty = false;

function openTask(id, preset = {}) {
  const t = id ? task(id) : null;
  if (id && !t) return;
  draft = t ? JSON.parse(JSON.stringify(t)) : {
    id: null, title: '', subjectId: null, type: 'tarea', due: addDays(today(), 1), time: '', priority: 2, value: null,
    estimate: 0, desc: '', steps: [], delivery: '', links: '', done: false, doneAt: null, grade: null, ...preset,
  };
  draftDirty = !t && !!preset.title;
  renderTaskSheet();
}
function renderTaskSheet() {
  const t = draft;
  const isNew = !t.id;
  const max = S.settings.gradeMax;
  const html = `${sheetHead(isNew ? 'Nueva tarea' : (t.done ? 'Tarea entregada' : 'Tarea'))}
  <div class="sheet-body">
    ${typeof plusTopHTML === 'function' ? plusTopHTML(t) : ''}
    ${t.id ? `<div id="sumBox">${summaryHTML(t)}</div>` : ''}
    <div class="field"><label for="fTitle" class="sr">Título</label>
      <input id="fTitle" class="title-input" data-f="title" placeholder="¿Qué hay que entregar?" value="${esc(t.title)}" autocomplete="off"></div>
    <div class="field"><span class="lbl">Tipo</span><div class="pick" role="group" aria-label="Tipo">
      ${Object.entries(TYPES).map(([k, v]) => `<button type="button" data-act="pick" data-k="type" data-v="${k}" aria-pressed="${t.type === k}">${v.label}</button>`).join('')}</div></div>
    <div class="field"><label for="fSubject">Materia</label>
      <select id="fSubject" class="input" data-f="subjectId">
        <option value="">Sin materia</option>
        ${S.subjects.map((s) => `<option value="${s.id}" ${t.subjectId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
        <option value="__new">+ Nueva materia…</option>
      </select></div>
    <div class="row2">
      <div class="field"><label for="fDue">Fecha de entrega</label><input id="fDue" class="input" type="date" data-f="due" value="${t.due || ''}"></div>
      <div class="field"><label for="fTime">Hora <span class="faint">(opcional)</span></label><input id="fTime" class="input" type="time" data-f="time" value="${t.time || ''}"></div>
    </div>
    <div class="field"><span class="lbl">Prioridad</span><div class="seg full" role="group" aria-label="Prioridad">
      ${[[1, 'Baja'], [2, 'Normal'], [3, 'Alta']].map(([k, l]) => `<button type="button" data-act="pick" data-k="priority" data-v="${k}" aria-pressed="${t.priority === k}">${l}</button>`).join('')}</div></div>
    <div class="row2">
      <div class="field"><label for="fValue">Vale <span class="faint">(%)</span></label><input id="fValue" class="input" type="number" inputmode="numeric" min="0" max="100" data-f="value" value="${t.value ?? ''}" placeholder="Ej. 20"></div>
      <div class="field"><label for="fEst">¿Cuánto crees que te tomará?</label><select id="fEst" class="input" data-f="estimate">${ESTIMATES.map(([v, l]) => `<option value="${v}" ${+t.estimate === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    </div>
    ${isNew ? '' : `<div class="field"><span class="lbl">Cumplimiento</span><div class="card" style="padding:4px 14px;background:var(--paper)">
      <div class="toggle"><span class="t">Tarea realizada</span><label class="switch"><input type="checkbox" data-f="made" data-bool ${t.made || t.done ? 'checked' : ''} aria-label="Tarea realizada"><span></span></label></div>
      <div class="toggle"><span class="t">${uploadLabel(t)}</span><label class="switch"><input type="checkbox" data-f="done" data-bool ${t.done ? 'checked' : ''} aria-label="${uploadLabel(t)}"><span></span></label></div></div>
      <span class="hint">Cuenta como entregada solo con los dos checks.</span></div>`}
    ${t.done ? `<div class="field"><label for="fGrade">Calificación obtenida <span class="faint">(de ${max})</span></label><input id="fGrade" class="input" type="number" inputmode="decimal" step="${max === 100 ? 1 : 0.1}" min="0" max="${max}" data-f="grade" value="${hasGrade(t) ? t.grade : ''}" placeholder="Cuando te la regresen"></div>` : ''}
    <div class="field"><span class="lbl">Cómo se entrega</span><div class="pick" role="group" aria-label="Cómo se entrega">
      ${Object.entries(DELIVERY).map(([k, v]) => `<button type="button" data-act="pick" data-k="delivery" data-v="${k}" aria-pressed="${t.delivery === k}">${v}</button>`).join('')}</div></div>
    <div class="field"><label for="fDesc">Instrucciones</label><textarea id="fDesc" class="input" data-f="desc" placeholder="Lo que pidió el profe, la rúbrica, páginas del libro…">${esc(t.desc)}</textarea></div>
    <div class="field"><span class="lbl">Pasos</span>
      <ul class="steps" id="stepsList">${stepsHTML()}</ul>
      <div class="add-step"><label for="newStep" class="sr">Nuevo paso</label><input id="newStep" class="input" placeholder="Agregar un paso" enterkeyhint="done" autocomplete="off"><button type="button" class="btn" data-act="add-step">Agregar</button></div>
      <div class="btn-row" style="margin-top:8px">
        <button type="button" class="btn quiet" data-act="suggest-steps">${icon('spark', 'sm')}Sugerir pasos</button>
        <button type="button" class="btn quiet" data-act="checklist-steps">${icon('check', 'sm')}Checklist de entrega</button>
        <button type="button" class="btn quiet" data-act="spread-steps">${icon('cal', 'sm')}Repartir en días</button>
      </div></div>
    ${typeof plusTaskHTML === 'function' ? plusTaskHTML(t) : ''}
    <div class="field"><label for="fRemind">Recordarme <span class="faint">(día y hora)</span></label>
      <input id="fRemind" class="input" type="datetime-local" data-f="remind" value="${esc(t.remind || '')}">
      <span class="hint">Además de los avisos de siempre: un día antes a las 7 pm y el mismo día a las 7 am.</span></div>
    <div class="field"><span class="lbl">Fotos <span class="faint">(la hoja de la tarea, el pizarrón…)</span></span>
      <div class="photos" id="photoList">${photosHTML(t.photos)}</div>
      <label class="btn" for="photoIn" style="align-self:flex-start">${icon('cam')}Agregar foto</label><input id="photoIn" type="file" accept="image/*" class="sr" data-photo-add></div>
    <div class="field"><span class="lbl">Comentarios <span class="faint">(${(t.comments || []).length})</span></span>
      <ul class="comments" id="commentList">${commentsHTML()}</ul>
      <div class="add-step"><label for="newComment" class="sr">Nuevo comentario</label><textarea id="newComment" class="input" rows="2" style="min-height:46px" placeholder="Lo que dijo el profe, dudas, avances…"></textarea><button type="button" class="btn" data-act="comment-add">Comentar</button></div></div>
    <div class="field"><label for="fLinks">Enlaces <span class="faint">(uno por línea)</span></label><textarea id="fLinks" class="input" style="min-height:60px" data-f="links" placeholder="Classroom, Drive, video de la clase…">${esc(t.links)}</textarea>
      <div id="linksOut" class="small">${linksHTML()}</div></div>
  </div>
  <div class="sheet-foot">
    ${isNew ? `<button type="button" class="btn" data-act="task-discard">Descartar</button>` : `<button type="button" class="btn danger ico" data-act="task-delete" aria-label="Eliminar tarea">${icon('trash')}</button>
      <button type="button" class="btn ico" data-act="task-cal" aria-label="Agregar al calendario del celular" title="Al calendario">${icon('calplus')}</button>
      <button type="button" class="btn ico" data-act="task-more" aria-label="Más opciones">${icon('grid')}</button>`}
    <span class="grow"></span>
    ${isNew ? '' : `<button type="button" class="btn" data-act="task-done-toggle">${t.done ? 'Marcar pendiente' : `${icon('check')}Entregada`}</button>`}
    <button type="button" class="btn primary" data-act="task-save">Guardar</button>
  </div>`;
  const wasOpen = sheet().open;
  const scroll = sheet().querySelector('.sheet-body')?.scrollTop || 0;
  openSheet(html, () => { if (draft && draftDirty && draft.title.trim()) saveDraftTask(true); draft = null; });
  if (wasOpen) sheet().querySelector('.sheet-body').scrollTop = scroll;
  if (isNew && !t.title) setTimeout(() => $('#fTitle')?.focus(), 60);
}
function stepsHTML() {
  if (!draft.steps.length) return '';
  return draft.steps.map((s) => `<li class="step ${s.done ? 'done' : ''}">
    <button type="button" class="chk" data-act="draft-step-toggle" data-step="${s.id}" role="checkbox" aria-checked="${s.done}" aria-label="Paso hecho"><span class="box">${icon('check')}</span></button>
    <input class="txt" data-step-text="${s.id}" value="${esc(s.text)}" aria-label="Texto del paso">${s.min ? `<span class="chip stepmin">${s.min} min</span>` : ''}
    <input type="date" data-step-date="${s.id}" value="${s.date || ''}" aria-label="Día para hacerlo">
    <button type="button" class="rm" data-act="draft-step-del" data-step="${s.id}" aria-label="Quitar paso">${icon('x', 'sm')}</button></li>`).join('');
}
function linksHTML() {
  const links = String(draft.links || '').split('\n').map(safeURL).filter(Boolean);
  return links.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener" style="display:inline-flex;gap:4px;align-items:center;margin:6px 12px 0 0">${icon('link', 'sm')}${esc(new URL(u).hostname.replace(/^www\./, ''))}</a>`).join('');
}
function refreshSteps() { const ul = $('#stepsList'); if (ul) ul.innerHTML = stepsHTML(); }
function saveDraftTask(silent = false) {
  const d = draft;
  if (!d) return false;
  d.title = d.title.trim();
  if (!d.title) { toast('Escribe el título de la tarea.'); $('#fTitle')?.focus(); return false; }
  d.value = d.value === '' || d.value == null || isNaN(+d.value) ? null : clamp(+d.value, 0, 100);
  d.grade = d.grade === '' || d.grade == null || isNaN(+d.grade) ? null : clamp(+d.grade, 0, S.settings.gradeMax);
  d.estimate = +d.estimate || 0;
  if (d.done) { d.made = true; d.doneAt = d.doneAt || Date.now(); } else d.doneAt = null;
  d.due = isISO(d.due) ? d.due : null;
  d.time = d.time || '';
  d.steps = d.steps.filter((s) => s.text.trim());
  const isNew = !d.id;
  if (isNew) { d.id = uid(); d.created = Date.now(); }
  const copy = JSON.parse(JSON.stringify(d));
  commit((s) => {
    const i = s.tasks.findIndex((x) => x.id === copy.id);
    if (i >= 0) s.tasks[i] = copy; else s.tasks.push(copy);
  });
  scheduleReminders();
  if (isNew) toast(copy.due ? `Agregada para ${relDay(copy.due)}.` : 'Tarea agregada.');
  else if (!silent) toast('Cambios guardados.');
  draftDirty = false;
  return true;
}

function openSubject(id) {
  const s = id ? subj(id) : null;
  draft = s ? JSON.parse(JSON.stringify(s)) : { id: null, name: '', color: nextColor(), teacher: '', room: '', important: false, schedule: [], notes: '', target: null };
  draftDirty = false;
  renderSubjectSheet();
}
function renderSubjectSheet() {
  const s = draft;
  const html = `${sheetHead(s.id ? 'Editar materia' : 'Nueva materia')}
  <div class="sheet-body">
    <div class="field"><label for="sName" class="sr">Nombre</label><input id="sName" class="title-input" data-f="name" value="${esc(s.name)}" placeholder="Nombre de la materia" autocomplete="off"></div>
    <div class="field"><span class="lbl">Color</span><div class="swatches" role="group" aria-label="Color">
      ${COLORS.map((c) => `<button type="button" data-act="pick" data-k="color" data-v="${c}" aria-pressed="${s.color === c}" style="background:${c}" aria-label="Color ${c}"></button>`).join('')}</div></div>
    <div class="toggle" style="margin-bottom:12px"><span><span class="t">Materia importante</span><span class="d" style="display:block">Sus tareas suben en tu Plan de hoy.</span></span>
      <label class="switch"><input type="checkbox" data-f="important" data-bool ${s.important ? 'checked' : ''} aria-label="Materia importante"><span></span></label></div>
    <div class="field"><label for="sShort">Nombre corto <span class="faint">(para el horario)</span></label><input id="sShort" class="input" data-f="short" value="${esc(s.short || '')}" placeholder="${esc(shortName({ name: s.name || 'Ej. Mercadotecnia' }))}" maxlength="16" autocomplete="off"></div>
    <div class="row2">
      <div class="field"><label for="sTeacher">Profesor(a)</label><input id="sTeacher" class="input" data-f="teacher" value="${esc(s.teacher)}" autocomplete="off"></div>
      <div class="field"><label for="sRoom">Salón</label><input id="sRoom" class="input" data-f="room" value="${esc(s.room)}" autocomplete="off"></div>
    </div>
    <div class="field"><span class="lbl">Horario</span><div id="schedList">${schedHTML()}</div>
      <button type="button" class="btn" data-act="sched-add" style="margin-top:8px">${icon('plus')}Agregar día</button></div>
    <div class="field"><label for="sNotes">Notas <span class="faint">(criterios de evaluación, correo del profe…)</span></label><textarea id="sNotes" class="input" data-f="notes">${esc(s.notes)}</textarea></div>
  </div>
  <div class="sheet-foot">${s.id ? `<button type="button" class="btn danger" data-act="subject-delete">${icon('trash')}Eliminar</button>` : `<button type="button" class="btn" data-act="sheet-close-discard">Cancelar</button>`}<span class="grow"></span><button type="button" class="btn primary" data-act="subject-save">Guardar</button></div>`;
  const wasOpen = sheet().open;
  const scroll = sheet().querySelector('.sheet-body')?.scrollTop || 0;
  openSheet(html, () => { if (draft && draftDirty && draft.name?.trim()) saveDraftSubject(true); draft = null; });
  if (wasOpen) sheet().querySelector('.sheet-body').scrollTop = scroll;
  if (!s.id) setTimeout(() => $('#sName')?.focus(), 60);
}
function schedHTML() {
  if (!draft.schedule.length) return '<p class="small muted" style="margin:0">Sin horario todavía.</p>';
  const order = [1, 2, 3, 4, 5, 6, 0];
  return draft.schedule.map((h, i) => `<div class="sched-row">
    <select class="input" style="width:auto;min-height:40px;flex:1" data-sched="${i}" data-k="day" aria-label="Día">${order.map((d) => `<option value="${d}" ${+h.day === d ? 'selected' : ''}>${cap(DIAS[d])}</option>`).join('')}</select>
    <input class="input" type="time" style="width:auto;min-height:40px" data-sched="${i}" data-k="start" value="${h.start || ''}" aria-label="Empieza">
    <input class="input" type="time" style="width:auto;min-height:40px" data-sched="${i}" data-k="end" value="${h.end || ''}" aria-label="Termina">
    <button type="button" class="rm" data-act="sched-del" data-i="${i}" aria-label="Quitar día">${icon('x', 'sm')}</button></div>`).join('');
}
function saveDraftSubject(silent = false) {
  const d = draft;
  if (!d) return false;
  d.name = d.name.trim();
  if (!d.name) { toast('Escribe el nombre de la materia.'); return false; }
  d.schedule = d.schedule.filter((h) => h.start && h.end && h.end > h.start);
  const isNew = !d.id;
  if (isNew) d.id = uid();
  const copy = JSON.parse(JSON.stringify(d));
  commit((s) => { const i = s.subjects.findIndex((x) => x.id === copy.id); if (i >= 0) s.subjects[i] = copy; else s.subjects.push(copy); });
  if (!silent || isNew) toast(isNew ? `${copy.name} agregada.` : 'Materia guardada.');
  draftDirty = false;
  return true;
}

function openNote(id, preset = {}) {
  const n = id ? S.notes.find((x) => x.id === id) : null;
  draft = n ? { ...n } : { id: null, title: '', body: '', subjectId: null, ...preset };
  draftDirty = false;
  const html = `${sheetHead(n ? 'Apunte' : 'Nuevo apunte')}
    <div class="sheet-body">
      <div class="field"><label for="nTitle" class="sr">Título</label><input id="nTitle" class="title-input" data-f="title" value="${esc(draft.title)}" placeholder="Título" autocomplete="off"></div>
      <div class="field"><label for="nSubj">Materia</label><select id="nSubj" class="input" data-f="subjectId"><option value="">Sin materia</option>${S.subjects.map((s) => `<option value="${s.id}" ${draft.subjectId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
      ${noteEditorHTML(draft)}
      <div id="noteSum"></div>
      <div class="field"><span class="lbl">Fotos</span><div class="photos" id="photoList">${photosHTML(draft.photos)}</div>
        <label class="btn" for="photoIn" style="align-self:flex-start">${icon('cam')}Agregar foto</label><input id="photoIn" type="file" accept="image/*" class="sr" data-photo-add></div>
      <div class="btn-row"><button type="button" class="btn" data-act="note-pin" aria-pressed="${!!draft.pinned}"><svg class="i ${draft.pinned ? 'star' : ''}"><use href="#i-star"/></svg>${draft.pinned ? 'Fijado arriba' : 'Fijar arriba'}</button>
        <button type="button" class="btn" data-act="note-summary">${icon('spark')}Resumir</button>
        <button type="button" class="btn" data-act="note-speak">${icon('play')}Escuchar</button>
        <button type="button" class="btn" data-act="note-share">${icon('share')}Compartir</button></div>
    </div>
    <div class="sheet-foot">${n ? `<button type="button" class="btn danger" data-act="note-delete">${icon('trash')}Eliminar</button>` : ''}<span class="grow"></span><button type="button" class="btn primary" data-act="note-save">Guardar</button></div>`;
  openSheet(html, () => { stopDictation(); if (draft && draftDirty) saveDraftNote(true); draft = null; });
  if (!n) setTimeout(() => $('#nTitle')?.focus(), 60);
}
function saveDraftNote(silent = false) {
  const d = draft;
  if (!d || (!d.title.trim() && !d.body.trim() && !(d.photos || []).length)) return false;
  if (!d.id) d.id = uid();
  d.photos = d.photos || [];
  d.updated = Date.now();
  const copy = { ...d, title: d.title.trim() };
  commit((s) => { const i = s.notes.findIndex((x) => x.id === copy.id); if (i >= 0) s.notes[i] = copy; else s.notes.push(copy); });
  if (!silent) toast('Apunte guardado.');
  draftDirty = false;
  return true;
}

/* =========================================================
   9. Acciones
   ========================================================= */
function toggleTask(id, rowEl) {
  const t = task(id);
  if (!t) return;
  if (!t.done && !t.made) {
    t.made = true; save(); Snd.drop(); render();
    toast(`Hecha. Falta: ${uploadLabel(t).toLowerCase()}.`, { action: 'Ya está', onAction: () => toggleTask(id) });
    return;
  }
  if (!t.done) {
    if (typeof quizGate === 'function' && quizGate(t)) return;
    t.done = true; t.made = true; t.doneAt = Date.now();
    save(); Snd.chime();
    if (rowEl) { floatText(rowEl, `+${t.priority === 3 ? 14 : 10} ✨`); leafBurst(rowEl); }
    if (rowEl && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rowEl.classList.add('done', 'leaving');
      rowEl.insertAdjacentHTML('beforeend', '<span class="stamp" aria-hidden="true">Entregado</span>');
      setTimeout(render, 900);
    } else render();
    leafBurst(rowEl?.querySelector('.chk'));
    if (+t.estimate > 0 && typeof realMin === 'function' && realMin(t) >= 3) { const d = realMin(t) - +t.estimate; toast(d > 5 ? `Entregada. Te tomó ${fmtMinutes(realMin(t))}: ${fmtMinutes(d)} más de lo que calculaste.` : d < -5 ? `Entregada. Terminaste ${fmtMinutes(-d)} antes de lo calculado. 🎯` : 'Entregada. Calculaste casi perfecto. 🎯', { ms: 5500, action: 'Deshacer', onAction: () => commit(() => { t.done = false; t.doneAt = null; }) }); }
    else toast(`Entregada: ${t.title}`, { action: 'Deshacer', onAction: () => commit(() => { t.done = false; t.doneAt = null; }) });
    if (navigator.vibrate) navigator.vibrate(18);
  } else {
    commit(() => { t.done = false; t.doneAt = null; });
  }
  scheduleReminders();
}
function deleteTask(id) {
  const i = S.tasks.findIndex((t) => t.id === id);
  if (i < 0) return;
  const [removed] = S.tasks.splice(i, 1);
  save(); render();
  toast('Tarea eliminada.', { action: 'Deshacer', onAction: () => commit((s) => s.tasks.splice(Math.min(i, s.tasks.length), 0, removed)) });
}

const ACTIONS = {
  'new-task': (el) => openTask(null, { ...(el.dataset.due ? { due: el.dataset.due } : (route().name === 'calendario' ? { due: UI.calSel } : {})), ...(el.dataset.subject ? { subjectId: el.dataset.subject } : (route().name === 'materia' ? { subjectId: route().arg } : {})) }),
  'open-task': (el) => openTask(el.dataset.id),
  'toggle-task': (el) => toggleTask(el.dataset.id, el.closest('.task')),
  'toggle-step': (el) => {
    const t = task(el.dataset.id); const st = t?.steps.find((x) => x.id === el.dataset.step);
    if (!st) return;
    const row = el.closest('.task');
    st.done = true; save(); Snd.drop();
    if (row) { row.classList.add('done', 'leaving'); setTimeout(render, 700); } else render();
    const left = t.steps.filter((x) => !x.done).length;
    toast(left ? `Paso hecho. Te ${left === 1 ? 'queda 1 paso' : `quedan ${left} pasos`}.` : 'Último paso hecho. ¿Ya la entregaste?', left ? { action: 'Deshacer', onAction: () => commit(() => { st.done = false; }) } : { action: 'Marcar entregada', onAction: () => toggleTask(t.id) });
  },
  'sheet-close': () => closeSheet(true),
  'sheet-close-discard': () => closeSheet(false),
  'quick-more': () => {
    const v = $('#quickIn').value; const p = parseQuick(v);
    openTask(null, { title: p.title || v.trim(), due: p.due, time: p.time, subjectId: p.subjectId, type: p.type || 'tarea', priority: p.priority || 2, value: p.value });
    $('#quickIn').value = ''; updateQuickPreview();
  },
  pick: (el) => {
    const k = el.dataset.k; let v = el.dataset.v;
    if (k === 'priority') v = +v;
    if (k === 'delivery' && draft.delivery === v) v = '';
    draft[k] = v; draftDirty = true;
    el.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === el && v !== '' ? 'true' : 'false'));
  },
  'add-step': () => addStepFromInput(),
  'draft-step-toggle': (el) => { const s = draft.steps.find((x) => x.id === el.dataset.step); if (s) { s.done = !s.done; draftDirty = true; refreshSteps(); } },
  'draft-step-del': (el) => { draft.steps = draft.steps.filter((x) => x.id !== el.dataset.step); draftDirty = true; refreshSteps(); },
  'suggest-steps': () => {
    const tpl = STEP_TEMPLATES[draft.type] || STEP_TEMPLATES.tarea;
    const have = new Set(draft.steps.map((s) => normChars(s.text)));
    const add = tpl.filter((x) => !have.has(normChars(x)));
    draft.steps.push(...add.map((text) => ({ id: uid(), text, done: false, date: '' })));
    draftDirty = true; refreshSteps();
    toast(add.length ? `Agregué ${plural(add.length, 'paso', 'pasos')}. Edítalos a tu gusto o repártelos en días.` : 'Ya tienes esos pasos.');
  },
  'checklist-steps': () => {
    const have = new Set(draft.steps.map((s) => normChars(s.text)));
    const add = S.settings.checklist.filter((x) => !have.has(normChars(x)));
    draft.steps.push(...add.map((text) => ({ id: uid(), text, done: false, date: draft.due || '' })));
    draftDirty = true; refreshSteps();
    toast(add.length ? 'Checklist agregada como pasos.' : 'La checklist ya está en tus pasos.');
  },
  'spread-steps': () => {
    const open = draft.steps.filter((s) => !s.done);
    if (!open.length) { toast('Primero agrega pasos (o toca “Sugerir pasos”).'); return; }
    if (!draft.due) { toast('Ponle fecha de entrega para repartir los pasos.'); $('#fDue')?.focus(); return; }
    const t0 = today();
    const days = diffDays(t0, draft.due);
    open.forEach((s, i) => { s.date = days <= 0 ? t0 : addDays(t0, Math.min(days - 1, Math.floor((i * days) / open.length))); });
    draftDirty = true; refreshSteps();
    toast(days <= 0 ? 'No hay días de margen: todos los pasos quedaron para hoy.' : `Repartí ${plural(open.length, 'paso', 'pasos')} de hoy hasta ${relDay(addDays(draft.due, -1))}. Aparecerán en tu Plan de hoy.`);
  },
  'task-save': () => { if (saveDraftTask()) closeSheet(false); },
  'task-discard': () => { draft = null; closeSheet(false); },
  'task-delete': async () => {
    const id = draft?.id;
    if (!id) return;
    closeSheet(false); draft = null;
    deleteTask(id);
  },
  'task-done-toggle': () => {
    draft.done = !draft.done; draft.doneAt = draft.done ? Date.now() : null; draftDirty = true;
    if (draft.done) { saveDraftTask(true); toast('Entregada. Cuando te califiquen, anota aquí la calificación.'); renderTaskSheet(); setTimeout(() => $('#fGrade')?.focus(), 80); }
    else renderTaskSheet();
  },
  'task-cal': async () => {
    if (!draft.due) { toast('Ponle fecha para pasarla al calendario.'); return; }
    const choice = await ask({ title: 'Agregar al calendario', text: 'Elige cómo guardar el recordatorio en tu celular.', cancel: 'Cancelar', options: [{ value: 'google', label: 'Google Calendar', icon: 'cal' }, { value: 'ics', label: 'Otro calendario (archivo .ics)', icon: 'save' }] });
    if (choice === 'google') window.open(googleCalURL(draft), '_blank', 'noopener');
    else if (choice === 'ics') downloadFile(`${slug(draft.title)}.ics`, buildICS([draft]), 'text/calendar');
  },
  'new-subject': () => openSubject(null),
  'edit-subject': (el) => openSubject(el.dataset.id),
  'subject-save': () => { if (saveDraftSubject()) closeSheet(false); },
  'subject-delete': async () => {
    const s = draft; const n = S.tasks.filter((t) => t.subjectId === s.id).length;
    const ok = await ask({ title: `¿Eliminar ${s.name}?`, text: n ? `Sus ${plural(n, 'tarea', 'tareas')} se quedan, pero sin materia.` : 'No tiene tareas.', ok: 'Eliminar', danger: true });
    if (!ok) return;
    closeSheet(false); draft = null;
    commit((st) => { st.subjects = st.subjects.filter((x) => x.id !== s.id); st.tasks.forEach((t) => { if (t.subjectId === s.id) t.subjectId = null; }); });
    if (route().name === 'materia') location.hash = '#/materias';
    toast('Materia eliminada.');
  },
  'sched-add': () => {
    const last = draft.schedule[draft.schedule.length - 1];
    draft.schedule.push(last ? { day: (+last.day % 6) + 1, start: last.start, end: last.end } : { day: 1, start: '07:00', end: '08:00' });
    draftDirty = true; $('#schedList').innerHTML = schedHTML();
  },
  'sched-del': (el) => { draft.schedule.splice(+el.dataset.i, 1); draftDirty = true; $('#schedList').innerHTML = schedHTML(); },
  'new-note': (el) => openNote(null, el.dataset.subject ? { subjectId: el.dataset.subject } : {}),
  'open-note': (el) => openNote(el.dataset.id),
  'note-save': () => { if (!draft.title.trim() && !draft.body.trim()) { toast('El apunte está vacío.'); return; } saveDraftNote(); closeSheet(false); },
  'note-delete': async () => {
    const id = draft.id;
    const ok = await ask({ title: '¿Eliminar este apunte?', ok: 'Eliminar', danger: true });
    if (!ok) return;
    closeSheet(false); draft = null;
    commit((s) => { s.notes = s.notes.filter((n) => n.id !== id); });
  },
  tf: (el) => { UI.tf = el.dataset.v; render(); },
  ts: (el) => { UI.ts = el.dataset.v; render(); },
  tt: (el) => { UI.tt = el.dataset.v; render(); },
  'clear-filters': () => { UI.ts = 'all'; UI.tt = 'all'; UI.q = ''; render(); },
  caltab: (el) => { UI.calTab = el.dataset.v; render(); },
  calsel: (el) => { UI.calSel = el.dataset.v; render(); },
  calnav: (el) => {
    const [y, m] = UI.calMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + +el.dataset.v, 1, 12);
    UI.calMonth = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    UI.calSel = UI.calMonth === today().slice(0, 7) ? today() : `${UI.calMonth}-01`;
    render();
  },
  caltoday: () => { UI.calMonth = today().slice(0, 7); UI.calSel = today(); render(); },
  theme: (el) => { commit((s) => { s.settings.theme = el.dataset.v; }); applyTheme(); },
  scale: async (el) => {
    const v = +el.dataset.v; const st = S.settings;
    if (v === st.gradeMax) return;
    const f = v / st.gradeMax;
    commit((s) => {
      s.settings.gradeMax = v; s.settings.passGrade = Math.round(st.passGrade * f * 10) / 10; s.settings.target = Math.round(st.target * f * 10) / 10;
      s.tasks.forEach((t) => { if (hasGrade(t)) t.grade = Math.round(+t.grade * f * 10) / 10; });
      s.subjects.forEach((x) => { if (x.target != null) x.target = Math.round(x.target * f * 10) / 10; });
    });
    toast(`Escala cambiada a 0–${v}. Convertí tus calificaciones.`);
  },
  'notif-enable': () => enableNotifications(),
  'notif-test': () => notify('Así se ven tus avisos', 'Al Día te recordará lo que vence hoy y mañana.', 'aldia-test'),
  wipe: async () => {
    const who = profile().name;
    const ok = await ask({ title: `¿Borrar los datos de ${who}?`, text: `Se eliminan las tareas, materias, apuntes y ajustes de ${who} en este dispositivo. Los del otro usuario no se tocan. No se puede deshacer.`, ok: 'Borrar', danger: true });
    if (!ok) return;
    S = defaults(); S.settings.name = who; save(); UI.wStep = 0; location.hash = '#/hoy'; render(); applyTheme(); toast(`Listo. ${who} empieza de cero.`);
  },
  backup: () => { downloadFile(`al-dia-${REG.current}-respaldo-${today()}.json`, JSON.stringify(S, null, 1), 'application/json'); markBackup(); },
  'backup-share': async () => {
    const file = new File([JSON.stringify(S)], `al-dia-${REG.current}-respaldo-${today()}.json`, { type: 'application/json' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Respaldo de Al Día' }); markBackup(); }
      else { downloadFile(file.name, JSON.stringify(S), 'application/json'); markBackup(); }
    } catch (e) { if (e.name !== 'AbortError') toast('No se pudo compartir. Usa “Descargar respaldo”.'); }
  },
  csv: () => downloadFile(`al-dia-${REG.current}-tareas-${today()}.csv`, tasksCSV(), 'text/csv'),
  'auto-download': async (el) => { const b = (await autoBackups())[+el.dataset.i]; if (b) downloadFile(`al-dia-${REG.current}-${b.d}.json`, JSON.stringify(b.data), 'application/json'); },
  'auto-restore': async (el) => {
    const b = (await autoBackups())[+el.dataset.i]; if (!b) return;
    const ok = await ask({ title: `¿Volver a la copia de ${relDay(b.d)}?`, text: 'Reemplaza lo que tienes ahora.', ok: 'Restaurar' });
    if (!ok) return; S = migrate(b.data); save(); applyTheme(); render(); toast('Copia restaurada.');
  },
  'ics-all': () => {
    const pend = pendingTasks().filter((t) => t.due);
    if (!pend.length) return;
    downloadFile(`al-dia-entregas-${today()}.ics`, buildICS(pend), 'text/calendar');
    toast(`${plural(pend.length, 'entrega lista', 'entregas listas')} para tu calendario. Abre el archivo descargado.`);
  },
  install: async () => {
    if (deferredInstall) {
      deferredInstall.prompt();
      const r = await deferredInstall.userChoice.catch(() => null);
      deferredInstall = null;
      if (r?.outcome === 'accepted') toast('Instalando Al Día…');
      render();
    } else location.hash = '#/instalar';
  },
  'install-dismiss': () => commit((s) => { s.settings.installDismissed = true; }),
  'timer-toggle': () => {
    const T = timerState();
    if (T.running) { T.remaining = Math.max(0, T.endAt - Date.now()); T.running = false; T.endAt = null; }
    else { T.endAt = Date.now() + T.remaining; T.running = true; if (!T.startedAt) T.startedAt = Date.now(); if ('Notification' in window && Notification.permission === 'default') enableNotifications(true); }
    save(); render();
  },
  'timer-reset': () => {
    const T = timerState();
    if (T.mode === 'focus') {
      const total = T.preset[0] * 60000;
      const done = (total - timerRemaining()) / 60000;
      if (done >= 1) logFocus(Math.floor(done));
    }
    T.mode = 'focus'; T.running = false; T.endAt = null; T.remaining = T.preset[0] * 60000; T.startedAt = null;
    save(); render();
  },
  preset: (el) => {
    const [a, b] = el.dataset.v.split('-').map(Number); const T = timerState();
    T.preset = [a, b]; T.mode = 'focus'; T.running = false; T.remaining = a * 60000; T.endAt = null;
    save(); render();
  },
  'apa-type': (el) => { UI.apa = el.dataset.v; render(); },
  'apa-copy': () => { const r = apaFormat(); if (!r.text) { toast('Escribe al menos el título.'); return; } copyRich(r.html, r.text); },
  'apa-save': () => {
    const r = apaFormat(); if (!r.text) { toast('Escribe al menos el título.'); return; }
    if (S.refs.some((x) => x.text === r.text)) { toast('Esa referencia ya está en tu lista.'); return; }
    commit((s) => s.refs.push({ id: uid(), html: r.html, text: r.text }));
    toast('Guardada en tu lista.');
  },
  'apa-clear': () => { for (const k of Object.keys(apaDraft)) delete apaDraft[k]; render(); },
  'ref-del': (el) => commit((s) => { s.refs = s.refs.filter((r) => r.id !== el.dataset.id); }),
  'refs-copy': () => {
    const list = S.refs.slice().sort((a, b) => a.text.localeCompare(b.text, 'es'));
    copyRich(list.map((r) => `<p style="margin-left:.5in;text-indent:-.5in">${r.html}</p>`).join(''), list.map((r) => r.text).join('\n\n'));
  },
  'ck-del': (el) => commit((s) => { s.settings.checklist.splice(+el.dataset.i, 1); }),
  'ck-uncheck': () => $$('.checklist input[type=checkbox]').forEach((c) => { c.checked = false; }),
  'ck-reset': () => commit((s) => { s.settings.checklist = DEFAULT_CHECKLIST.slice(); }),
  'profile-sheet': () => openProfileSheet(),
  'cloud-now': async () => { await cloudSync(); toast(CLOUD.error ? CLOUD.error : 'Sincronizado.'); },
  'letter-open': (el) => openLetter(el.dataset.id),
  'letter-write': () => { if (!isGroup()) writeLetter(); },
  'letter-reply': () => { $('#ask').close(); setTimeout(writeLetter, 120); },
  'mood-pick': (el) => { moodSel = el.dataset.v; el.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === el)); },
  'mood-filter': (el) => { UI.mood = el.dataset.v; lastRenderRoute = null; render(); },
  'thought-open': (el) => openThought(el.dataset.id),
  'thought-save': () => { saveThought(); closeSheet(false); },
  'thought-del': () => { const id = draft.id; closeSheet(false); draft = null; const i = S.thoughts.findIndex((x) => x.id === id); const [rm] = S.thoughts.splice(i, 1); save(); render(); toast('Pensamiento quitado.', { action: 'Deshacer', onAction: () => commit((st) => st.thoughts.splice(i, 0, rm)) }); },
  'thought-speak': () => speak(draft.text),
  breathe: () => breathe(),
  'speak-day': () => speak(daySpeech()),
  'summary-speak': () => speak(summarySpeech(draft)),
  'voice-test': () => { if (speakingNow) speechSynthesis.cancel(); speakingNow = false; speak('Hola. Respira profundo. Vamos a revisar tus tareas con calma, una por una.'); },
  'note-summary': () => { const pts = summarize(draft.body, 4); if (!pts.length) { toast('Escribe un poco más para poder resumir.'); return; } const box = $('#noteSum'); box.innerHTML = `<div class="summary-card"><div class="sum-head"><b class="serif">Resumen</b><button type="button" class="btn quiet" data-act="note-sum-speak">${icon('play')}Escuchar</button></div><ul>${pts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`; },
  'note-sum-speak': () => speak(summarize(draft.body, 4).join(' ')),
  'scan-summary': () => { const txt = $('#scanText')?.value || SCAN.text; const pts = summarize(txt, 5); const box = $('#scanSum'); if (box) box.innerHTML = pts.length ? `<div class="summary-card" style="margin-top:10px"><div class="sum-head"><b class="serif">Resumen</b><button type="button" class="btn quiet" data-act="scan-sum-speak">${icon('play')}Escuchar</button></div><ul>${pts.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '<p class="small muted">No hay suficiente texto para resumir.</p>'; },
  'scan-sum-speak': () => speak(summarize($('#scanText')?.value || SCAN.text, 5).join(' ')),
  'note-speak': () => speak(`${draft.title}. ${draft.body}`),
  'note-pin': (el) => { draft.pinned = !draft.pinned; draftDirty = true; el.setAttribute('aria-pressed', draft.pinned); el.innerHTML = `<svg class="i ${draft.pinned ? 'star' : ''}"><use href="#i-star"/></svg>${draft.pinned ? 'Fijado arriba' : 'Fijar arriba'}`; },
  'note-share': () => shareText(draft.title || 'Apunte', `${draft.title}\n\n${draft.body}`),
  'comment-add': () => {
    const inp = $('#newComment'); const v = inp.value.trim(); if (!v) return;
    (draft.comments ||= []).push({ id: uid(), text: v, at: Date.now() }); draftDirty = true; inp.value = '';
    $('#commentList').innerHTML = commentsHTML();
    if ($('#sumBox')) $('#sumBox').innerHTML = summaryHTML(draft);
    if (draft.id) saveDraftTask(true);
  },
  'comment-del': (el) => { draft.comments = (draft.comments || []).filter((c) => c.id !== el.dataset.id); draftDirty = true; $('#commentList').innerHTML = commentsHTML(); },
  'photo-view': async (el) => {
    const u = await photoURL(el.dataset.id); if (!u) return;
    const d = $('#ask'); d.innerHTML = `<form method="dialog" class="photo-view"><img src="${u}" alt="Foto adjunta"><div class="btn-row" style="justify-content:flex-end;margin-top:10px"><button class="btn" value="cancel">Cerrar</button></div></form>`; d.showModal();
  },
  'photo-del': (el) => {
    if (!draft) return; draft.photos = (draft.photos || []).filter((x) => x !== el.dataset.id); draftDirty = true;
    $('#photoList').innerHTML = photosHTML(draft.photos); hydratePhotos();
  },
  'task-more': async () => {
    const v = await ask({ title: 'Más opciones', cancel: 'Cerrar', options: [{ value: 'speak', label: 'Escuchar la tarea', icon: 'bell' }, { value: 'share', label: 'Compartir con mi equipo', icon: 'share' }, { value: 'dup', label: 'Duplicar tarea', icon: 'copy' }] });
    if (v === 'speak') speak(taskSpeech(draft) + ' ' + (draft.comments || []).map((c) => c.text).join('. '));
    else if (v === 'share') shareText(draft.title, `${draft.title}\n${draft.due ? `Entrega: ${cap(longDate(draft.due))}${draft.time ? `, ${fmtTime(draft.time)}` : ''}\n` : ''}${draft.desc ? `\n${draft.desc}\n` : ''}${draft.steps.length ? `\nPasos:\n${draft.steps.map((x) => `- ${x.text}`).join('\n')}` : ''}`);
    else if (v === 'dup') {
      saveDraftTask(true);
      const copy = { ...JSON.parse(JSON.stringify(draft)), id: uid(), title: draft.title + ' (copia)', done: false, made: false, doneAt: null, grade: null, comments: [], created: Date.now() };
      copy.steps.forEach((x) => { x.done = false; x.id = uid(); });
      commit((st) => st.tasks.push(copy)); closeSheet(false); openTask(copy.id); toast('Tarea duplicada.');
    }
  },
  ambient: (el) => { Snd.ambient(el.dataset.v || null); $$('[data-act="ambient"]').forEach((b) => b.setAttribute('aria-pressed', b === el ? 'true' : 'false')); },
  'scan-reanalyze': (el) => { SCAN.text = $('#scanText')?.value || SCAN.text; SCAN.error = ''; analyzeScan(el.dataset.v); render(); },
  'scan-speak': () => speak($('#scanText')?.value || SCAN.text),
  'scan-note': () => { openNote(null, { title: 'Texto escaneado', body: $('#scanText')?.value || SCAN.text }); draftDirty = true; },
  'scan-copy': () => { navigator.clipboard?.writeText(SCAN.text).then(() => toast('Texto copiado.'), () => toast('No se pudo copiar.')); },
  'scan-add': async () => {
    let pid = null;
    if (SCAN.file) { try { pid = await savePhoto(SCAN.file); } catch { /* sin espacio para la foto */ } }
    const picked = SCAN.items.map((it, i) => ({ ...it, title: ($(`[data-scan-title="${i}"]`)?.value || it.title).trim(), due: $(`[data-scan-due="${i}"]`)?.value || it.due }))
      .filter((it, i) => $(`[data-scan-i="${i}"]`)?.checked && it.title);
    if (!picked.length) return;
    commit((st) => picked.forEach((it) => {
      st.tasks.push({ id: uid(), title: it.title, subjectId: it.subjectId, type: it.type, due: it.due, time: it.time, priority: 2, value: null, estimate: 0, desc: it.desc, steps: [], delivery: '', links: '', done: false, doneAt: null, grade: null, created: Date.now(), source: 'foto', photos: pid ? [pid] : [], comments: [] });
    }));
    SCAN.items = null; render(); scheduleReminders();
    if ('Notification' in window && Notification.permission === 'default') enableNotifications(true);
    toast(`${plural(picked.length, 'tarea agregada', 'tareas agregadas')} con recordatorio.`, { action: 'Al calendario', onAction: () => downloadFile('al-dia-fotos.ics', buildICS(S.tasks.filter((t) => t.source === 'foto' && !t.done && t.due)), 'text/calendar') });
  },
  'profile-to': (el) => { if (el.dataset.id === REG.current) { closeSheet(false); return; } closeSheet(false); enterProfile(el.dataset.id); },
  'profile-pick': (el) => enterProfile(el.dataset.id),
  'g-done': (el) => {
    const tid = el.dataset.id; const d = gDone(); const on = !d[tid];
    if (!on) delete d[tid]; else { d[tid] = Date.now(); Snd.chime(); leafBurst(el); }
    saveReg(); treeSoon();
    gput({ id: `dn-${tid}-${REG.me}`.slice(0, 60), type: 'done', task: tid, deleted: !on }).catch(() => {});
    setTimeout(render, on ? 450 : 0);
  },
  'g-open': (el) => openGroupTask(el.dataset.id),
  'g-task-save': (el) => { const t = gGet(el.dataset.id); gput({ ...t, title: $('#gtTitle').value.trim() || t.title, due: $('#gtDue').value || null, time: $('#gtTime').value, subject: $('#gtSubj').value.trim(), desc: $('#gtDesc').value }); closeSheet(false); toast('Tarea actualizada para todos.'); },
  'g-del': async (el) => { const it = gGet(el.dataset.id); if (!it) return; const ok = await ask({ title: '¿Quitarlo para todos?', text: 'Desaparece para todo el grupo.', ok: 'Quitar', danger: true }); if (!ok) return; closeSheet(false); gput({ ...it, deleted: true }); },
  'g-task-cal': (el) => { const t = gGet(el.dataset.id); if (t?.due) window.open(googleCalURL({ ...t, type: 'tarea', subjectId: null }), '_blank', 'noopener'); else toast('Esta tarea no tiene fecha.'); },
  'g-copy-mine': (el) => {
    const t = gGet(el.dataset.id); const mineP = REG.me || null;
    if (!mineP) { toast('Primero entra con tu usuario.'); return; }
    const d = load(keyFor(mineP)); d.tasks.push({ id: uid(), title: t.title, subjectId: null, type: 'tarea', due: t.due, time: t.time || '', priority: 2, value: null, estimate: 0, desc: t.desc || '', steps: [], delivery: '', links: '', done: false, doneAt: null, grade: null, created: Date.now(), comments: [], photos: [] });
    try { localStorage.setItem(keyFor(mineP), JSON.stringify(d)); setDirty(mineP, true); } catch { /* */ }
    toast(`Copiada a las tareas de ${profile(mineP).name}.`);
  },
  'g-team-new': () => openTeamSheet(null),
  'g-team-from': (el) => { closeSheet(false); openTeamSheet(el.dataset.id); },
  'g-team-create': () => {
    const title = $('#tmTitle').value.trim(); if (!title) { toast('Ponle nombre al trabajo.'); return; }
    const id = gid(); gput({ id, type: 'team', title, due: $('#tmDue').value || null, desc: $('#tmDesc').value, taskId: $('#tmTask').value || null });
    gput({ id: `${id}-${slug(me())}`, type: 'join', team: id, name: me() });
    closeSheet(false); location.hash = `#/equipo/${id}`; toast('Trabajo creado. Invita a tu equipo a unirse.');
  },
  'g-join': (el) => { gput({ id: `${el.dataset.id}-${slug(me())}`, type: 'join', team: el.dataset.id, name: me(), deleted: false }); Snd.chime(); },
  'g-leave': (el) => { const j = gGet(`${el.dataset.id}-${slug(me())}`); if (j) gput({ ...j, deleted: true }); },
  'g-part-done': (el) => { const p = gGet(el.dataset.id); gput({ ...p, done: !p.done }); if (!p.done) { Snd.chime(); leafBurst(el); } },
  'g-part-take': (el) => { const p = gGet(el.dataset.id); gput({ ...p, owner: me() }); },
  'g-like': (el) => { const id = `${el.dataset.id}-${slug(me())}`; const l = gGet(id); if (l && !l.deleted) gput({ ...l, deleted: true }); else { gput({ id, type: 'like', idea: el.dataset.id, deleted: false }); Snd.drop(); } },
  'idea-tag': (el) => { ideaTag = el.dataset.v; el.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === el)); },
  'g-retry': async () => { await flushForestOutbox(); cloudSync(); render(); },
  'g-push': () => enableGroupPush(),
  'profile-choose': () => { choosing = true; render(); },
  'w-next': () => { UI.wStep = 1; render(); setTimeout(() => $('#wSubIn')?.focus(), 50); },
  'w-skip': () => { commit((s) => { s.settings.onboarded = true; }); location.hash = '#/hoy'; },
  'w-star': (el) => commit((s) => { const x = s.subjects.find((y) => y.id === el.dataset.id); if (x) x.important = !x.important; }),
  'w-del': (el) => commit((s) => { s.subjects = s.subjects.filter((y) => y.id !== el.dataset.id); }),
  'w-done': () => { commit((s) => { s.settings.onboarded = true; }); location.hash = '#/hoy'; setTimeout(() => $('#quickIn')?.focus(), 100); },
};
function addStepFromInput() {
  const inp = $('#newStep');
  const v = inp.value.trim();
  if (!v) return;
  draft.steps.push({ id: uid(), text: v, done: false, date: '' });
  draftDirty = true; inp.value = ''; refreshSteps(); inp.focus();
}
function logFocus(m) {
  const T = timerState();
  const t = T.taskId ? task(T.taskId) : null;
  S.focus.push({ d: today(), m, h: new Date().getHours(), s: t?.subjectId || null, t: t?.id || null });
  if (S.focus.length > 3000) S.focus = S.focus.slice(-3000);
}
function markBackup() { commit((s) => { s.settings.lastBackup = today(); }); toast('Respaldo listo. Guárdalo en un lugar seguro.'); }

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.act] || VIDA_ACTS[el.dataset.act];
  if (fn) { e.preventDefault(); if (!['toggle-task', 'toggle-step', 'ambient'].includes(el.dataset.act)) Snd.tick(); fn(el, e); }
});
sheet().addEventListener('close', () => { const fn = onSheetClose; onSheetClose = null; if (fn) fn(); else draft = null; });
sheet().addEventListener('click', (e) => { if (e.target === sheet()) closeSheet(true); });

document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'quickIn') { updateQuickPreview(); return; }
  if (el.id === 'gTaskIn') { const pq = parseQuick(el.value); $('#gTaskPrev').innerHTML = el.value.trim() ? `${pq.due ? `<span class="chip pen">${icon('cal', 'sm')}${esc(cap(relDay(pq.due)))}</span>` : '<span class="chip">Sin fecha</span>'}${pq.time ? `<span class="chip">${fmtTime(pq.time)}</span>` : ''}` : ''; return; }
  if (el.dataset.ambVol !== undefined) { Snd.setVol(+el.value); return; }
  if (el.dataset.voiceRate !== undefined) { REG.voiceRate = +el.value; saveReg(); const r = +el.value; $('#rateLbl').textContent = r < 0.85 ? 'muy calmada' : r < 0.95 ? 'calmada' : r < 1.05 ? 'normal' : 'rápida'; return; }
  if (el.id === 'taskQ') { UI.q = el.value; $('#taskList').innerHTML = taskListHTML(); return; }
  if (el.id === 'notesQ') { UI.notesQ = el.value; render(); return; }
  if (el.classList.contains('calc') || el.id === 'avgIn') { calcUpdate(); return; }
  if (el.classList.contains('apa')) { apaDraft[el.dataset.k] = el.value; const o = $('#apaOut'); if (o) o.innerHTML = apaFormat().html || 'Tu referencia aparece aquí.'; return; }
  if (draft && el.dataset.f && el.closest('#sheet')) {
    if (el.dataset.bool !== undefined) draft[el.dataset.f] = el.checked;
    else if (el.dataset.f !== 'subjectId') draft[el.dataset.f] = el.value;
    draftDirty = true;
    if (el.dataset.f === 'links') $('#linksOut').innerHTML = linksHTML();
  }
  if (draft && el.dataset.stepText) { const s = draft.steps.find((x) => x.id === el.dataset.stepText); if (s) { s.text = el.value; draftDirty = true; } }
});
document.addEventListener('change', async (e) => {
  const el = e.target;
  if (draft && el.dataset.f === 'subjectId' && el.closest('#sheet')) {
    if (el.value === '__new') {
      const name = await ask({ title: 'Nueva materia', input: { placeholder: 'Nombre de la materia' }, ok: 'Agregar' });
      if (name) {
        const s = { id: uid(), name, color: nextColor(), teacher: '', room: '', important: false, schedule: [], notes: '', target: null };
        S.subjects.push(s); save();
        draft.subjectId = s.id; draftDirty = true;
        el.insertAdjacentHTML('beforeend', '');
        const opt = document.createElement('option'); opt.value = s.id; opt.textContent = s.name;
        el.insertBefore(opt, el.querySelector('option[value="__new"]'));
        el.value = s.id;
      } else el.value = draft.subjectId || '';
    } else { draft.subjectId = el.value || null; draftDirty = true; }
    return;
  }
  if (draft && el.dataset.f === 'important') { draft.important = el.checked; draftDirty = true; return; }
  if (draft && el.dataset.f && el.closest('#sheet') && el.tagName === 'SELECT') { draft[el.dataset.f] = el.value; draftDirty = true; return; }
  if (draft && el.dataset.stepDate) { const s = draft.steps.find((x) => x.id === el.dataset.stepDate); if (s) { s.date = el.value; draftDirty = true; } return; }
  if (draft && el.dataset.sched !== undefined) { const h = draft.schedule[+el.dataset.sched]; if (h) { h[el.dataset.k] = el.dataset.k === 'day' ? +el.value : el.value; draftDirty = true; } return; }
  if (el.dataset.voice !== undefined) { REG.voice = el.value; saveReg(); if (speakingNow) speechSynthesis.cancel(); speakingNow = false; speak('Así suena esta voz.'); return; }
  if (el.dataset.reg) { REG[el.dataset.reg] = el.checked; saveReg(); $$(`[data-reg="${el.dataset.reg}"]`).forEach((x) => { x.checked = el.checked; }); return; }
  if (el.dataset.set) {
    const k = el.dataset.set;
    let v = el.dataset.bool !== undefined ? el.checked : el.value;
    if (el.dataset.num !== undefined) { v = parseFloat(v); if (isNaN(v)) return; }
    commit((s) => { s.settings[k] = v; });
    if (k === 'remindBefore') scheduleReminders();
    if (k === 'leaves') { $('#leaves').innerHTML = ''; buildLeaves(); }
    return;
  }
  if (el.dataset.subjTarget) {
    const v = parseFloat(el.value);
    commit((s) => { const x = s.subjects.find((y) => y.id === el.dataset.subjTarget); if (x) x.target = isNaN(v) ? null : clamp(v, 0, s.settings.gradeMax); });
    return;
  }
  if (el.dataset.timerTask !== undefined) { timerState().taskId = el.value || null; save(); return; }
  if (el.dataset.photoAdd !== undefined && el.files[0] && draft) {
    const f = el.files[0]; el.value = '';
    try { const id = await savePhoto(f); (draft.photos ||= []).push(id); draftDirty = true; $('#photoList').innerHTML = photosHTML(draft.photos); hydratePhotos(); }
    catch { toast('No se pudo guardar la foto. Libera espacio en el celular.'); }
    return;
  }
  if (draft && el.dataset.f === 'remind') { draft.remind = el.value; draft.remindShown = false; draftDirty = true; return; }
  if (el.id === 'restoreIn' && el.files[0]) restoreBackup(el.files[0]);
  if (el.dataset.scan && el.files[0]) { const f = el.files[0]; el.value = ''; runScan(f, el.dataset.scan); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'newStep') { e.preventDefault(); addStepFromInput(); }
  if (e.key === 'Enter' && e.target.classList?.contains('title-input')) { e.preventDefault(); e.target.blur(); }
  if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.altKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) && !sheet().open && !$('#ask').open && S.settings.onboarded) { e.preventDefault(); ACTIONS['new-task']({ dataset: {} }); }
});
document.addEventListener('submit', (e) => {
  const f = e.target;
  if (f.id === 'quickForm') { e.preventDefault(); quickAdd(); }
  else if (f.id === 'gTaskForm') {
    e.preventDefault(); const raw = $('#gTaskIn').value.trim(); if (!raw) return;
    const pq = parseQuick(raw);
    gput({ id: gid(), type: 'task', title: pq.title || raw, due: pq.due, time: pq.time, subject: subj(pq.subjectId)?.name || '', desc: '' });
    Snd.chime(); toast('Tarea subida. Les llegará un aviso a todos.');
  } else if (f.id === 'gPostForm') {
    e.preventDefault(); const v = $('#gPostIn').value.trim(); if (!v) return;
    gput({ id: gid(), type: 'post', team: route().arg, text: v }); Snd.drop();
    setTimeout(() => { $('#gPostIn')?.focus(); $('#wall')?.lastElementChild?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, 50);
  } else if (f.id === 'gPartForm') {
    e.preventDefault(); const v = $('#gPartIn').value.trim(); if (!v) return;
    gput({ id: gid(), type: 'part', team: route().arg, text: v, owner: '', done: false });
  } else if (f.id === 'gIdeaForm') {
    e.preventDefault(); const v = $('#gIdeaIn').value.trim(); if (!v) return;
    gput({ id: gid(), type: 'idea', text: v, tag: ideaTag }); Snd.chime();
  }
  else if (f.id === 'thoughtForm') {
    e.preventDefault(); const v = $('#thoughtIn').value.trim(); if (!v) return;
    const t = { id: uid(), text: v, mood: moodSel, at: Date.now() };
    commit((st) => st.thoughts.push(t)); Snd.chime();
    const el = $(`[data-id="${t.id}"]`)?.closest('.thought'); if (el) { el.classList.add('sprout'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(() => leafBurst(el.querySelector('.bud')), 500); }
    toast(MOODS[moodSel].label === 'Lo que suelto' ? 'Escrito y soltado. Respira.' : 'Pensamiento plantado.');
  }
  else if (f.id === 'wName') { e.preventDefault(); commit((s) => { s.settings.name = $('#wNameIn').value.trim(); }); UI.wStep = 1; render(); setTimeout(() => $('#wSubIn')?.focus(), 50); }
  else if (f.id === 'wSub') {
    e.preventDefault();
    const v = $('#wSubIn').value.trim();
    if (!v) return;
    if (S.subjects.some((s) => normChars(s.name) === normChars(v))) { toast('Esa materia ya está.'); return; }
    commit((s) => s.subjects.push({ id: uid(), name: v, color: nextColor(), teacher: '', room: '', important: false, schedule: [], notes: '', target: null }));
    setTimeout(() => $('#wSubIn')?.focus(), 30);
  } else if (f.id === 'ckForm') {
    e.preventDefault();
    const v = $('#ckNew').value.trim();
    if (v) commit((s) => s.settings.checklist.push(v));
  }
});

function updateQuickPreview() {
  const inp = $('#quickIn');
  if (!inp) return;
  const p = parseQuick(inp.value);
  $('#quickPrev').innerHTML = quickPreviewHTML(p);
  $('#quickGo').disabled = !inp.value.trim();
}
function quickAdd() {
  const inp = $('#quickIn');
  const raw = inp.value.trim();
  if (!raw) return;
  const p = parseQuick(raw);
  const t = {
    id: uid(), title: p.title || raw, subjectId: p.subjectId, type: p.type || 'tarea', due: p.due, time: p.time,
    priority: p.priority || 2, value: p.value, estimate: 0, desc: '', steps: [], delivery: '', links: '',
    done: false, doneAt: null, grade: null, created: Date.now(),
  };
  inp.value = '';
  commit((s) => s.tasks.push(t));
  scheduleReminders();
  toast(t.due ? `Agregada para ${relDay(t.due)}.` : 'Agregada sin fecha.', { action: 'Desglosar en pasos', onAction: () => { openTask(t.id); setTimeout(() => { if (typeof microOpen === 'function') microOpen(); }, 120); }, ms: 5500 });
  setTimeout(() => $('#quickIn')?.focus(), 30);
}

/* =========================================================
   10. Archivos: respaldo, calendario
   ========================================================= */
const slug = (s) => normChars(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'tarea';
async function shareText(title, text) {
  if (navigator.share) { try { await navigator.share({ title, text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(text); toast('Copiado. Pégalo donde quieras.'); } catch { toast('No se pudo compartir.'); }
}
function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  // En iPhone (sobre todo con la app instalada) las descargas normales no funcionan: se usa la hoja de compartir
  if (isIOS() && navigator.canShare) {
    const file = new File([blob], name, { type });
    if (navigator.canShare({ files: [file] })) { navigator.share({ files: [file] }).catch(() => {}); return; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
async function restoreBackup(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.subjects)) throw new Error('formato');
    const ok = await ask({ title: '¿Cargar este respaldo?', text: `Tiene ${plural(data.tasks.length, 'tarea', 'tareas')} y ${plural(data.subjects.length, 'materia', 'materias')}. Se carga en el usuario ${profile().name} y reemplaza lo que tiene ahora.`, ok: 'Cargar respaldo' });
    if (!ok) return;
    S = migrate(data); S.settings.onboarded = true; save(); applyTheme(); render(); scheduleReminders();
    toast('Respaldo cargado.');
  } catch {
    toast('Ese archivo no es un respaldo de Al Día.');
  } finally {
    const inp = $('#restoreIn'); if (inp) inp.value = '';
  }
}
const icsEsc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function icsFold(line) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 74) return line;
  const out = []; let cur = ''; let len = 0;
  for (const ch of line) {
    const l = new TextEncoder().encode(ch).length;
    if (len + l > 73) { out.push(cur); cur = ' '; len = 1; }
    cur += ch; len += l;
  }
  out.push(cur);
  return out.join('\r\n');
}
function buildICS(tasks) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Al Dia//Tareas//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Al Día — entregas'];
  for (const t of tasks) {
    if (!t.due) continue;
    const s = subj(t.subjectId);
    const d = t.due.replace(/-/g, '');
    L.push('BEGIN:VEVENT', `UID:${t.id || uid()}@aldia`, `DTSTAMP:${stamp}`);
    if (t.time) {
      const [h, m] = t.time.split(':').map(Number);
      const end = new Date(fromISO(t.due)); end.setHours(h, m + 30, 0);
      L.push(`DTSTART:${d}T${pad(h)}${pad(m)}00`, `DTEND:${toISO(end).replace(/-/g, '')}T${pad(end.getHours())}${pad(end.getMinutes())}00`);
    } else {
      L.push(`DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${addDays(t.due, 1).replace(/-/g, '')}`);
    }
    L.push(`SUMMARY:${icsEsc(eventTitle(t))}`);
    const desc = [t.desc, t.steps?.length ? 'Pasos:\n' + t.steps.map((x) => `${x.done ? '✓' : '•'} ${x.text}`).join('\n') : '', t.links].filter(Boolean).join('\n\n');
    if (desc) L.push(`DESCRIPTION:${icsEsc(desc)}`);
    L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc('Mañana: ' + t.title)}`, t.time ? 'TRIGGER:-P1D' : 'TRIGGER:-PT6H', 'END:VALARM');
    if (t.time) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc('Entrega: ' + t.title)}`, `TRIGGER:-PT${S.settings.remindBefore}M`, 'END:VALARM');
    if (t.remind) { const r = new Date(t.remind); if (!isNaN(r)) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEsc('Recordatorio: ' + t.title)}`, `TRIGGER;VALUE=DATE-TIME:${r.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`, 'END:VALARM'); }
    L.push('END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.map(icsFold).join('\r\n') + '\r\n';
}
function eventTitle(t) {
  const s = subj(t.subjectId);
  const label = TYPES[t.type]?.label || 'Tarea';
  const pre = normChars(t.title).startsWith(normChars(label)) ? '' : `${label}: `;
  return `${pre}${t.title}${s ? ` (${s.name})` : ''}`;
}
function googleCalURL(t) {
  const s = subj(t.subjectId);
  const d = t.due.replace(/-/g, '');
  let dates;
  if (t.time) {
    const [h, m] = t.time.split(':').map(Number);
    const end = new Date(fromISO(t.due)); end.setHours(h, m + 30, 0);
    dates = `${d}T${pad(h)}${pad(m)}00/${toISO(end).replace(/-/g, '')}T${pad(end.getHours())}${pad(end.getMinutes())}00`;
  } else dates = `${d}/${addDays(t.due, 1).replace(/-/g, '')}`;
  const p = new URLSearchParams({ action: 'TEMPLATE', text: eventTitle(t), dates, details: t.desc || '' });
  try { p.set('ctz', Intl.DateTimeFormat().resolvedOptions().timeZone); } catch { /* sin zona */ }
  return `https://calendar.google.com/calendar/render?${p}`;
}

/* =========================================================
   11. Avisos, insignia, enfoque, instalación
   ========================================================= */
async function swReg() { try { return 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null; } catch { return null; } }
async function notify(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const opts = { body, tag, icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', lang: 'es-MX' };
  const reg = await swReg();
  try { if (reg) await reg.showNotification(title, opts); else new Notification(title, opts); } catch { /* algunos navegadores sólo permiten desde el service worker */ }
}
async function enableNotifications(quiet = false) {
  if (!('Notification' in window)) { if (!quiet) toast('Este navegador no permite notificaciones. Usa “Al calendario” en tus tareas.'); return; }
  const p = await Notification.requestPermission();
  S.settings.notify = p === 'granted'; save(); render();
  if (p === 'granted') {
    if (!quiet) notify('Avisos activados', 'Te diré lo que vence hoy y mañana.', 'aldia-on');
    registerPeriodic(); scheduleReminders();
  } else if (!quiet) toast('Sin permiso para avisos. Puedes activarlos después en Ajustes.');
}
async function registerPeriodic() {
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg && 'periodicSync' in reg) {
      const st = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (st.state === 'granted') await reg.periodicSync.register('aldia-digest', { minInterval: 6 * 60 * 60 * 1000 });
    }
  } catch { /* no disponible */ }
}
function dailyDigest() {
  if (!S.settings.digest || !('Notification' in window) || Notification.permission !== 'granted') return;
  const t0 = today();
  if (S.settings.lastDigest === t0) return;
  const pend = pendingTasks();
  const late = pend.filter((t) => bucketOf(t) === 'late').length;
  const hoy = pend.filter((t) => bucketOf(t) === 'today');
  const man = pend.filter((t) => bucketOf(t) === 'tomorrow');
  S.settings.lastDigest = t0; save();
  if (!late && !hoy.length && !man.length) return;
  const parts = [];
  if (hoy.length) parts.push(`Hoy: ${hoy.map((t) => t.title).slice(0, 3).join(', ')}${hoy.length > 3 ? '…' : ''}`);
  if (man.length) parts.push(`Mañana: ${man.map((t) => t.title).slice(0, 3).join(', ')}${man.length > 3 ? '…' : ''}`);
  if (late) parts.push(`${plural(late, 'atrasada', 'atrasadas')}`);
  notify(`Entregas de ${profile()?.name || 'hoy'}`, parts.join('\n'), 'aldia-digest');
}
let reminderTimers = [];
function scheduleReminders() {
  reminderTimers.forEach(clearTimeout); reminderTimers = [];
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  for (const t of S.tasks) {
    if (!t.done && t.remind && !t.remindShown) {
      const ms = new Date(t.remind).getTime() - now;
      if (ms > 0 && ms < 24 * 3600000) reminderTimers.push(setTimeout(() => { notify(`Recordatorio: ${t.title}`, 'Abre Al Día para verla.', 'm-' + t.id); checkDueReminders(); }, ms));
    }
    if (t.done || !t.due) continue;
    for (const [day, hh, msg] of [[addDays(t.due, -1), 19, 'Mañana se entrega'], [t.due, 7, 'Hoy se entrega']]) {
      const at2 = new Date(fromISO(day)); at2.setHours(hh, 0, 0, 0);
      const ms = at2.getTime() - now;
      if (ms > 0 && ms < 24 * 3600000) reminderTimers.push(setTimeout(() => notify(`${msg}: ${t.title}`, 'Tienes que hacerla. Ábrela en Al Día.', 'd-' + t.id + day), ms));
    }
    if (!t.time) continue;
    const [h, m] = t.time.split(':').map(Number);
    const at = new Date(fromISO(t.due)); at.setHours(h, m, 0, 0);
    const fire = at.getTime() - S.settings.remindBefore * 60000;
    if (fire > now && fire - now < 24 * 3600000) reminderTimers.push(setTimeout(() => notify(`En ${fmtMinutes(S.settings.remindBefore)}: ${t.title}`, `${profile()?.name || ''}${subj(t.subjectId) ? `, ${subj(t.subjectId).name}` : ''}`, 'r-' + t.id), fire - now));
  }
}
function updateBadge() {
  const n = S.tasks.filter((t) => !t.done && t.due && t.due <= today()).length;
  try { if (navigator.setAppBadge) { if (n) navigator.setAppBadge(n); else navigator.clearAppBadge(); } } catch { /* sin soporte */ }
}
let syncT = null;
function queueSync() {
  clearTimeout(syncT);
  syncT = setTimeout(async () => {
    updateBadge();
    if (!('caches' in window)) return;
    try {
      const t0 = today();
      // los avisos en segundo plano incluyen a los dos usuarios de este dispositivo
      const data = {
        profiles: PERSONAL_LIST().filter(Boolean).map((p) => {
          const d = p.id === REG.current ? S : load(keyFor(p.id));
          return { name: p.name, notify: !!d.settings.digest && (d.settings.onboarded || d.tasks.length > 0), tasks: d.tasks.filter((t) => !t.done && t.due && diffDays(t0, t.due) <= 2).map((t) => ({ title: t.title, due: t.due, time: t.time })) };
        }),
      };
      const c = await caches.open('aldia-data');
      await c.put('upcoming.json', new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } }));
    } catch { /* sin caché */ }
  }, 400);
}

function timerComplete() {
  const T = timerState();
  if (T.mode === 'focus') {
    logFocus(T.preset[0]);
    T.mode = 'break'; T.remaining = T.preset[1] * 60000;
    notify('¡Bloque terminado!', `Toma ${T.preset[1]} minutos de descanso.`, 'aldia-timer');
    toast(`Bloque terminado. Descansa ${T.preset[1]} minutos.`);
  } else {
    T.mode = 'focus'; T.remaining = T.preset[0] * 60000;
    notify('Descanso terminado', 'Cuando quieras, empieza el siguiente bloque.', 'aldia-timer');
    toast('Descanso terminado.');
  }
  T.running = false; T.endAt = null; T.startedAt = null;
  if (Snd.on()) Snd.chime(); else beep();
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  save(); render();
}
/* Paisaje sonoro: todo se genera en el celular, sin descargar audio */
const Snd = {
  ctx: null, amb: null, ambType: null, vol: 0.5,
  on() { return S.settings.sounds !== false; },
  ac() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } } if (this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; },
  bell(f, t0, dur = 1.6, g = 0.12) {
    const c = this.ac(); if (!c) return;
    const o = c.createOscillator(), gn = c.createGain(); o.type = 'sine'; o.frequency.value = f;
    gn.gain.setValueAtTime(0.0001, c.currentTime + t0); gn.gain.exponentialRampToValueAtTime(g, c.currentTime + t0 + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(gn).connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
  },
  chime() { if (!this.on()) return; [[523.25, 0], [659.25, 0.09], [783.99, 0.18], [987.77, 0.27], [1174.66, 0.38]].forEach(([f, t]) => { this.bell(f, t, 2.4, 0.06); this.bell(f * 2, t, 1.1, 0.012); }); },
  drop() {
    if (!this.on()) return; const c = this.ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(1400, c.currentTime); o.frequency.exponentialRampToValueAtTime(520, c.currentTime + 0.12);
    g.gain.setValueAtTime(0.0001, c.currentTime); g.gain.exponentialRampToValueAtTime(0.08, c.currentTime + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.3);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.32);
  },
  tick() { if (this.on()) this.bell(660, 0, 0.08, 0.025); },
  noise(kind) {
    const c = this.ac(); const len = c.sampleRate * 3; const b = c.createBuffer(1, len, c.sampleRate); const d = b.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
    const src = c.createBufferSource(); src.buffer = b; src.loop = true; return src;
  },
  ambient(type) {
    this.stopAmbient();
    if (!type) return;
    const c = this.ac(); if (!c) return;
    const out = c.createGain(); out.gain.setValueAtTime(0.0001, c.currentTime); out.gain.exponentialRampToValueAtTime(this.vol * 0.5, c.currentTime + 3); out.connect(c.destination);
    const nodes = []; const timers = [];
    if (type === 'lluvia') {
      const n = this.noise('white'); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800;
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300; const g = c.createGain(); g.gain.value = 0.35;
      n.connect(hp).connect(lp).connect(g).connect(out); n.start(); nodes.push(n);
      timers.push(setInterval(() => { const o = c.createOscillator(), gg = c.createGain(); o.frequency.value = 1800 + Math.random() * 2200; gg.gain.setValueAtTime(0.02, c.currentTime); gg.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.05); o.connect(gg).connect(out); o.start(); o.stop(c.currentTime + 0.06); }, 140));
    } else if (type === 'fogata') {
      const n = this.noise('brown'); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600; const g = c.createGain(); g.gain.value = 0.9;
      n.connect(lp).connect(g).connect(out); n.start(); nodes.push(n);
      timers.push(setInterval(() => {
        if (Math.random() > 0.55) return;
        const k = this.noise('white'); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000 + Math.random() * 3000; const gg = c.createGain();
        gg.gain.setValueAtTime(0.25 * Math.random(), c.currentTime); gg.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.04 + Math.random() * 0.05);
        k.connect(bp).connect(gg).connect(out); k.start(); k.stop(c.currentTime + 0.12);
      }, 90));
    } else if (type === 'binaural') {
      [[200, -1], [206, 1]].forEach(([f, pan]) => { const o = c.createOscillator(); o.frequency.value = f; const p = c.createStereoPanner(); p.pan.value = pan; const g = c.createGain(); g.gain.value = 0.12; o.connect(g).connect(p).connect(out); o.start(); nodes.push(o); });
    } else if (type === 'lofi') {
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.connect(out);
      const hiss = this.noise('white'); const hg = c.createGain(); hg.gain.value = 0.015; hiss.connect(hg).connect(out); hiss.start(); nodes.push(hiss);
      const chords = [[220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 349.2], [164.8, 207.7, 246.9, 329.6]]; let k = 0;
      const play = () => {
        const t = c.currentTime;
        chords[k++ % chords.length].forEach((f, j) => {
          const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 12; const g = c.createGain();
          g.gain.setValueAtTime(0.0001, t + j * 0.08); g.gain.exponentialRampToValueAtTime(0.06, t + 0.6 + j * 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 7.8);
          o.connect(g).connect(lp); o.start(t + j * 0.08); o.stop(t + 8);
        });
      };
      play(); timers.push(setInterval(play, 8000));
    }
    this.amb = { out, nodes, timers }; this.ambType = type;
  },
  stopAmbient() {
    if (!this.amb) return; const { out, nodes, timers } = this.amb; const c = this.ctx;
    timers.forEach(clearInterval); out.gain.cancelScheduledValues(c.currentTime); out.gain.setValueAtTime(out.gain.value, c.currentTime); out.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.5);
    setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch { /* */ } }); out.disconnect(); }, 1600);
    this.amb = null; this.ambType = null;
  },
  setVol(v) { this.vol = v; if (this.amb) this.amb.out.gain.setTargetAtTime(Math.max(0.0001, v * 0.5), this.ctx.currentTime, 0.3); },
};
const AMBIENTS = [['lluvia', 'Lluvia suave'], ['fogata', 'Fogata'], ['lofi', 'Lo-fi tranquilo'], ['binaural', 'Binaural (con audífonos)']];
function ambientHTML() {
  return `<h2 class="sec">Ambiente <small>sonidos para concentrarte</small></h2>
    <div class="card"><div class="pick" role="group" aria-label="Sonido de ambiente">
      ${AMBIENTS.map(([k, l]) => `<button type="button" data-act="ambient" data-v="${k}" aria-pressed="${Snd.ambType === k}">${l}</button>`).join('')}
      <button type="button" data-act="ambient" data-v="" aria-pressed="${!Snd.ambType}">Silencio</button></div>
      <div class="field" style="margin:14px 0 0"><label for="ambVol">Volumen</label><input id="ambVol" type="range" min="0" max="1" step="0.05" value="${Snd.vol}" data-amb-vol style="accent-color:var(--pen)"></div></div>`;
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach((t, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = i === 2 ? 880 : 660; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.2);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.22);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch { /* sin audio */ }
}
function updateFocusPill() {
  const T = S.timer;
  const pill = $('#focusPill');
  const onFocus = route().name === 'enfoque';
  if (T && T.running && !onFocus && !sheet().open) {
    pill.hidden = false;
    pill.innerHTML = `${icon('timer', 'sm')}${T.mode === 'focus' ? 'Enfoque' : 'Descanso'} ${fmtClock(timerRemaining())}`;
  } else pill.hidden = true;
}
setInterval(() => {
  const T = S.timer;
  if (!T || !T.running) return;
  const rem = timerRemaining();
  if (rem <= 0) { timerComplete(); return; }
  const clock = $('#timerClock');
  if (clock) {
    clock.textContent = fmtClock(rem);
    const total = (T.mode === 'focus' ? T.preset[0] : T.preset[1]) * 60000;
    const C = 2 * Math.PI * 46;
    $('#timerArc')?.setAttribute('stroke-dashoffset', C * (1 - rem / total));
  }
  updateFocusPill();
  document.title = `${fmtClock(rem)} · Al Día`;
}, 1000);

let deferredInstall = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; if (!sheet().open) render(); });
window.addEventListener('appinstalled', () => { deferredInstall = null; toast('Al Día quedó instalada.'); render(); });

function applyTheme() {
  const th = S.settings.theme === 'dark' ? 'dark' : 'light';
  buildLeaves(); applyDaypart();
  if (REG.current) document.documentElement.setAttribute('data-profile', REG.current);
  document.documentElement.setAttribute('data-theme', th);
  const dark = th === 'dark' || (th === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $$('meta[name="theme-color"]').forEach((m) => { if (th === 'auto') m.setAttribute('content', m.media.includes('dark') ? '#0B1A14' : '#F3FAF5'); else m.setAttribute('content', th === 'dark' ? '#0B1A14' : '#F3FAF5'); });
}

/* =========================================================
   12. Arranque
   ========================================================= */
window.addEventListener('hashchange', () => { if (sheet().open) closeSheet(true); render(); window.scrollTo(0, 0); $('#view').focus({ preventScroll: true }); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') window.__hiddenAt = Date.now();
  if (document.visibilityState === 'visible') {
    if (S.timer?.running && timerRemaining() <= 0) timerComplete();
    if (REG.me && REG.current !== REG.me && !isGroup() && Date.now() - (window.__hiddenAt || 0) > 120000) { choosing = true; render(); }
    dailyDigest(); scheduleReminders(); checkDueReminders(); autoBackup(); cloudSync(); if (!sheet().open) render();
  }
});
window.addEventListener('storage', (e) => { if (e.key === KEY && !choosing) { S = load(); render(); } });

// "?nueva=1" (acceso directo del ícono) abre una tarea nueva
if (window.visualViewport) {
  const vv = window.visualViewport;
  const fit = () => { const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop); document.documentElement.style.setProperty('--kb', kb + 'px'); document.documentElement.style.setProperty('--vvh', vv.height + 'px'); };
  vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); fit();
}
(function init() {
  applyTheme();
  if (S.timer?.running && timerRemaining() <= 0) timerComplete();
  render();
  const params = new URLSearchParams(location.search);
  if (params.has('nueva') && S.settings.onboarded && !choosing) setTimeout(() => openTask(null), 150);
  if (params.has('nueva') || params.has('app')) history.replaceState(null, '', location.pathname + location.hash);
  if (!choosing && S.settings.onboarded) intro();
  setTimeout(cloudSync, 400); setTimeout(presenceTick, 1500); setTimeout(treeCheck, 1800);
  setInterval(() => { if (document.visibilityState === 'visible') cloudSync(); }, 20000);
  window.addEventListener('online', () => cloudSync());
  updateBadge(); queueSync(); if (!choosing) { dailyDigest(); scheduleReminders(); setTimeout(checkDueReminders, 800); }
  setInterval(() => { if (!choosing) checkDueReminders(); }, 60000);
  if (navigator.storage?.persist) navigator.storage.persisted().then((p) => { if (!p) navigator.storage.persist().catch(() => {}); }).catch(() => {});

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            toast('Hay una versión nueva de Al Día.', { action: 'Actualizar', ms: 15000, onAction: () => { wantsUpdate = true; nw.postMessage('skipWaiting'); } });
          }
        });
      });
      if (S.settings.notify) registerPeriodic();
    }).catch(() => {});
    let wantsUpdate = false, reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (wantsUpdate && !reloading) { reloading = true; location.reload(); } });
  }
})();
