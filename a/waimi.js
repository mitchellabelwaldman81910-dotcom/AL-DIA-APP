/* Cinnavia 8.7 — Waimi: asistente de estudio del modo Honores (solo la cuenta de administración).
   · Responde sin internet con su base propia (a/waimi-datos.js): países y capitales, 118 elementos, planetas,
     historia de México y del mundo, personajes, obras, récords del planeta, glosario escolar, fórmulas,
     conversiones y operaciones (usa el motor de la calculadora).
   · Conoce tus datos: pendientes, promedio, exámenes, racha y qué te conviene estudiar ahora.
   · Con internet, busca en Wikipedia en español y cita la fuente. Sin claves ni servicios de pago.
   · Cada respuesta se puede guardar como nota del segundo cerebro o como tarjeta de repaso. */
'use strict';
const WM = { busy: false, quiz: null };
const wmKey = () => `cinnavia:waimi:${(typeof REG !== 'undefined' && REG.current) || 'x'}`;
const wmHist = () => { if (!WM.h) { try { WM.h = JSON.parse(localStorage.getItem(wmKey()) || '[]'); } catch { WM.h = []; } if (!Array.isArray(WM.h)) WM.h = []; } return WM.h; };
const wmStore = () => { const h = wmHist(); if (h.length > 80) h.splice(0, h.length - 80); try { localStorage.setItem(wmKey(), JSON.stringify(h)); } catch { /* */ } };
const wn = (s) => hnNorm(s).replace(/[¿?¡!.,;:"«»()[\]{}]/g, ' ').replace(/\s+/g, ' ').trim();
const wmHas = (q, re) => re.test(q);
const wmPick = (a) => a[Math.floor(Math.random() * a.length)];
const wmNum = (x) => (typeof clFmt === 'function' ? clFmt(x, 10) : String(Math.round(x * 1e8) / 1e8));

/* ---------- índices de la base de conocimiento ---------- */
const WMI = (() => {
  const pais = [], cap = [];
  for (const [cont, L] of Object.entries(WM_PAISES)) for (const [p, c] of L) { const it = { p, c, cont }; pais.push([wn(p), it]); cap.push([wn(c.split(/[;(]/)[0]), it]); }
  const alias = { 'eeuu': 'Estados Unidos', 'eua': 'Estados Unidos', 'usa': 'Estados Unidos', 'estados unidos de america': 'Estados Unidos', 'inglaterra': 'Reino Unido', 'gran bretana': 'Reino Unido', 'holanda': 'Países Bajos', 'myanmar': 'Birmania (Myanmar)', 'birmania': 'Birmania (Myanmar)', 'corea': 'Corea del Sur', 'congo': 'República Democrática del Congo', 'republica checa': 'República Checa', 'chequia': 'República Checa', 'vaticano': 'Ciudad del Vaticano', 'emiratos': 'Emiratos Árabes Unidos', 'arabia': 'Arabia Saudita', 'suazilandia': 'Esuatini', 'costa de marfil': 'Costa de Marfil', 'nueva zelandia': 'Nueva Zelanda', 'dominicana': 'República Dominicana' };
  for (const [a, p] of Object.entries(alias)) { const f = pais.find((x) => x[1].p === p); if (f) pais.push([a, f[1]]); }
  pais.sort((a, b) => b[0].length - a[0].length); cap.sort((a, b) => b[0].length - a[0].length);
  const el = WM_ELEM.map((e) => [wn(e.n), e]).sort((a, b) => b[0].length - a[0].length);
  const keys = (row, ix) => [wn(row[0]), ...String(row[ix] || '').split('|').map(wn).filter(Boolean)];
  const glos = WM_GLOS.map((g) => ({ g, k: keys(g, 1) }));
  const gente = WM_GENTE.map((g) => ({ g, k: keys(g, 1) }));
  const obras = WM_OBRAS.map((g) => ({ g, k: keys(g, 1) }));
  const rec = WM_RECORD.map((r) => ({ r, k: r[0].split('|').map(wn) }));
  return { pais, cap, el, glos, gente, obras, rec };
})();
const wmIn = (q, k) => k.length > 2 && (` ${q} `).includes(` ${k} `);
const wmFindPais = (q) => (WMI.pais.find(([k]) => wmIn(q, k)) || [])[1];
const wmFindCap = (q) => (WMI.cap.find(([k]) => wmIn(q, k)) || [])[1];
function wmFindEl(q, raw) {
  const m = q.match(/(?:elemento|numero atomico|z\s*=)\s*(\d{1,3})\b/); if (m && +m[1] >= 1 && +m[1] <= 118) return WM_ELEM[+m[1] - 1];
  const n = WMI.el.find(([k]) => (` ${q} `).includes(` ${k} `)); if (n) return n[1];
  const toks = (String(raw).match(/\b[A-Z][a-z]?\b/g) || []).reverse(); for (const t of toks) { const e = WM_ELEM.find((x) => x.s === t); if (e && (t.length === 2 || /simbolo|elemento|quimic/.test(q))) return e; }
  const s = q.match(/(?:simbolo|elemento)\s+([a-z]{1,2})$/); if (s) return WM_ELEM.find((x) => x.s.toLowerCase() === s[1]);
  return null;
}
function wmBest(list, term, q) {
  if (!term) return null; let best = null, bs = 0;
  for (const it of list) for (const k of it.k) {
    let s = 0;
    if (k === term) s = 100; else if (wmIn(q, k) && k.length >= 4) s = 60 + k.length; else if (term.length >= 5 && k.startsWith(term)) s = 40; else if (term.length >= 5 && term.includes(k) && k.length >= 5) s = 30 + k.length;
    if (s > bs) { bs = s; best = it; }
  }
  return bs >= 30 ? { ...best, sc: bs } : null;
}
const wmTerm = (q) => q.replace(/^(oye |waimi |hola )+/, '').replace(/^(que|quien|quienes|cual|cuales|como|cuando|donde) (es|son|fue|fueron|era|significa|quiere decir|hizo|escribio|invento|descubrio|esta|queda)( el| la| los| las| un| una| lo)? /, '').replace(/^(define|definicion de|definir|significado de|explicame|explica|hablame de|hablame sobre|dime sobre|dime que es|informacion de|info de|investiga|busca|resumen de|que sabes de|sabes que es|concepto de)( el| la| los| las| un| una)? /, '').replace(/ (por favor|porfa|plis)$/, '').trim();

/* ---------- respuestas ---------- */
const wmR = (t, extra = {}) => ({ t, ...extra });
function wmPersonal(q) {
  if (wmHas(q, /\b(pendiente|pendientes|tareas|entregas|que tengo|que me toca|que debo|que entrego)\b/)) {
    const P = S.tasks.filter((x) => !x.done).sort(sortPending); if (!P.length) return wmR('No tienes entregas pendientes. Vas al día.');
    const late = P.filter((x) => x.due && x.due < today()).length;
    return wmR(`Tienes ${P.length} ${P.length === 1 ? 'entrega pendiente' : 'entregas pendientes'}${late ? `, ${late} ${late === 1 ? 'atrasada' : 'atrasadas'}` : ''}:\n${P.slice(0, 6).map((x) => `• ${x.title}${x.due ? ` — ${relDay(x.due)}` : ''}`).join('\n')}${P.length > 6 ? `\n…y ${P.length - 6} más.` : ''}`, { link: ['#/tareas', 'Abrir tareas'] });
  }
  if (wmHas(q, /\b(mi promedio|promedio|mis calificaciones|como voy|voy bien)\b/) && !/^(que es|define|como se (calcula|saca))/.test(q)) {
    const G = hnGrades(); if (G.avg == null) return wmR('Aún no tienes calificaciones registradas. Anótalas en cada entrega y te digo cómo vas.');
    const low = G.below.slice(0, 3);
    return wmR(`Tu promedio general es ${fmtGrade(Math.round(G.avg * 10) / 10)} y tu meta de honores es ${fmtGrade(hnGoal())}.${low.length ? `\nMaterias debajo de la meta:\n${low.map((r) => `• ${r.s.name}: ${fmtGrade(Math.round(r.st.avg * 10) / 10)}`).join('\n')}` : '\nTodas tus materias con calificación están en la meta. Sigue así.'}`, { link: ['#/honores', 'Ver análisis'] });
  }
  if (wmHas(q, /\b(examen|examenes|parcial|parciales)\b/) && wmHas(q, /\b(mis|tengo|cuando|proximo|proximos|siguiente)\b/)) {
    let L = []; try { L = ESD().exams.filter((e) => esDays(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date)); } catch { /* */ }
    if (!L.length) return wmR('No tienes exámenes registrados. Agrégalos en Exámenes y te armo un plan de repaso.', { link: ['#/examenes', 'Agregar examen'] });
    return wmR(`Tus próximos exámenes:\n${L.slice(0, 5).map((e) => `• ${e.title} — ${relDay(e.date)}`).join('\n')}`, { link: ['#/examenes', 'Ver exámenes'] });
  }
  if (wmHas(q, /\b(racha|mi racha)\b/)) { const n = hnStreak(); return wmR(n ? `Llevas ${n} ${n === 1 ? 'día' : 'días'} seguidos cumpliendo tu plan de honores (70 % o más).` : 'Hoy puedes empezar tu racha: completa al menos el 70 % de tu plan del día.'); }
  if (wmHas(q, /\b(que (hago|estudio|me recomiendas|sigue|debo hacer)|ayudame a estudiar|siguiente paso|por donde empiezo|que hago ahora)\b/)) { const N = hnNext(); return wmR(`${N.t}.\n${N.d}`, N.href ? { link: [N.href, N.b] } : {}); }
  if (wmHas(q, /\b(que dia es|que fecha|fecha de hoy|que hora)\b/)) { const d = new Date(); return wmR(`Hoy es ${longDate(today())}${/hora/.test(q) ? ` y son las ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}` : ''}.`); }
  return null;
}
function wmMath(q, raw) {
  const cv = q.match(/^(?:convierte |convertir |cuanto(?:s)? (?:son|es) |pasa )?(-?\d+(?:[.,]\d+)?)\s*([a-z/ ]+?)\s+(?:a|en)\s+([a-z/ ]+)$/);
  if (cv) { const v = +cv[1].replace(',', '.'); const a = cv[2].trim(), b = cv[3].trim();
    if (/^(c|°c|grados? c|celsius|centigrados?)$/.test(a) && /^(f|fahrenheit|grados? f)$/.test(b)) return wmR(`${wmNum(v)} °C = ${wmNum(v * 9 / 5 + 32)} °F\nFórmula: °F = °C × 9/5 + 32`);
    if (/^(f|fahrenheit|grados? f)$/.test(a) && /^(c|celsius|centigrados?|grados? c)$/.test(b)) return wmR(`${wmNum(v)} °F = ${wmNum((v - 32) * 5 / 9)} °C\nFórmula: °C = (°F − 32) × 5/9`);
    for (const [A, B, f] of WM_CONV) { if (A.includes(a) && B.includes(b)) return wmR(`${wmNum(v)} ${a} = ${wmNum(v * f)} ${b}`); if (B.includes(a) && A.includes(b)) return wmR(`${wmNum(v)} ${a} = ${wmNum(v / f)} ${b}`); }
  }
  let e = String(raw).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/^\s*(oye |waimi )?(cuanto es|cuanto da|cuanto son|calcula|calcular|resuelve|resultado de|cuanto vale)\s*/i, '').replace(/[¿?=]/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/(\d)\s*x\s*(\d)/g, '$1*$2').replace(/\bpor ciento\b/g, '%').replace(/\b(mas)\b/g, '+').replace(/\b(menos)\b/g, '-').replace(/\b(entre|dividido entre|dividido por)\b/g, '/').replace(/(\d)\s+por\s+(\d)/g, '$1*$2').replace(/\braiz cuadrada de\b/g, 'sqrt ').replace(/\bal cuadrado\b/g, '^2').replace(/\bal cubo\b/g, '^3').trim();
  if (!/\d/.test(e) || !/[+\-*/^%!]|sqrt|raiz|sen|cos|tan|log|ln|\bde\b/.test(e)) return null;
  if (!/^[\d\s+\-*/^().,%!a-z√π]*$/.test(e) || /[a-z]{4,}/.test(e.replace(/sqrt|raiz|sen|cos|tan|log10|log2|log|ln|abs|cbrt|fact|redondear|round|floor|ceil|exp|pi|mod/g, ''))) return null;
  try { const v = clEval(e, true, 0); const r = typeof v === 'object' && v ? v.v : v; if (typeof r !== 'number' || !isFinite(r)) return null; return wmR(`${e.replace(/\*/g, '×').replace(/\b(sqrt|raiz)\s*/g, '√')} = ${wmNum(r)}`, { calc: true }); } catch (err) { return null; }
}
function wmGeo(q) {
  if (wmHas(q, /\bcapital\b/) || wmHas(q, /\bdonde (esta|queda)\b/)) {
    if (wmHas(q, /(de que pais|que pais tiene|es la capital de que|es capital de que)/)) { const c = wmFindCap(q); if (c) return wmR(`${c.c.split(/[;(]/)[0].trim()} es la capital de ${c.p} (${c.cont}).`); }
    const p = wmFindPais(q); if (p) return wmR(`La capital de ${p.p} es ${p.c}. Está en ${p.cont}.`, { note: [`Capital de ${p.p}`, p.c] });
    const c = wmFindCap(q); if (c) return wmR(`${c.c.split(/[;(]/)[0].trim()} es la capital de ${c.p} (${c.cont}).`);
  }
  const m = q.match(/\b(paises|cuantos paises)\b.*\b(america|europa|asia|africa|oceania)\b/);
  if (m) { const k = Object.keys(WM_PAISES).find((x) => wn(x) === m[2]); const L = WM_PAISES[k]; return wmR(`En mi base hay ${L.length} países de ${k}:\n${L.map((x) => x[0]).join(', ')}.`); }
  if (/^(capitales|paises)$/.test(q)) return wmR(`Sé las capitales de ${Object.values(WM_PAISES).flat().length} países. Pregúntame, por ejemplo: «¿Cuál es la capital de Australia?»`);
  return null;
}
function wmChem(q, raw) {
  if (!wmHas(q, /\b(elemento|simbolo|numero atomico|tabla periodica|quimic)/) && !WMI.el.some(([k]) => q === k)) return null;
  if (/cuantos elementos/.test(q)) return wmR('La tabla periódica tiene 118 elementos confirmados, del hidrógeno (1) al oganesón (118).');
  const e = wmFindEl(q, raw); if (!e) return null;
  const grupo = e.z <= 2 ? 1 : e.z <= 10 ? 2 : e.z <= 18 ? 3 : e.z <= 36 ? 4 : e.z <= 54 ? 5 : e.z <= 86 ? 6 : 7;
  return wmR(`${e.n}: símbolo ${e.s}, número atómico ${e.z} (tiene ${e.z} protones). Está en el periodo ${grupo} de la tabla periódica.`, { note: [`${e.n} (elemento)`, `Símbolo ${e.s}, número atómico ${e.z}`] });
}
function wmSpace(q) {
  if (/cuantos planetas|planetas del sistema solar|orden de los planetas/.test(q)) return wmR(`El sistema solar tiene 8 planetas, en orden desde el Sol: ${WM_PLAN.map((p) => p[0]).join(', ')}. Plutón se reclasificó como planeta enano en 2006.`);
  const p = WM_PLAN.find(([n]) => wmIn(q, wn(n)) && (/planeta/.test(q) || q === wn(n) || /^(que|como) es/.test(q))); if (p) return wmR(`${p[0]}: ${p[1]}.`, { note: [p[0], p[1]] });
  if (/\bpluton\b/.test(q)) return wmR('Plutón es un planeta enano del cinturón de Kuiper; dejó de considerarse planeta en 2006.');
  if (/\b(el sol|la luna)\b/.test(q) && /^(que|como) es/.test(q)) return wmR(/sol/.test(q) ? 'El Sol es la estrella del sistema solar: una esfera de plasma, principalmente hidrógeno y helio, que produce energía por fusión nuclear. Tiene unos 4,600 millones de años.' : 'La Luna es el único satélite natural de la Tierra; está a unos 384,400 km y siempre nos muestra la misma cara.');
  return null;
}
function wmHist2(q) {
  if (/^(historia de mexico|linea del tiempo de mexico|resumen de la historia de mexico)$/.test(q)) return wmR(`Historia de México en fechas clave:\n${WM_MX.map(([a, t]) => `• ${a}: ${t}`).join('\n')}`);
  if (!/\b(cuando|en que ano|que paso en|que ocurrio|fecha|ano)\b/.test(q)) return null;
  const y = q.match(/\b(1\d{3}|20\d{2}|\d{3})\b/); const all = WM_MX.concat(WM_MUNDO);
  if (y && /que paso|que ocurrio|que sucedio/.test(q)) { const L = all.filter(([a]) => a.includes(y[1])); if (L.length) return wmR(L.map(([a, t]) => `${a}: ${t}`).join('\n')); }
  const stop = new Set(['cuando', 'que', 'ano', 'paso', 'fue', 'la', 'el', 'de', 'del', 'los', 'las', 'en', 'se', 'un', 'una', 'y', 'a', 'con', 'por', 'ocurrio', 'fecha', 'mexico']);
  const w = q.split(' ').filter((x) => x.length > 2 && !stop.has(x)); if (!w.length) return null;
  let best = null, bs = 0; for (const ev of all) { const n = wn(ev[1]); const s = w.filter((x) => n.includes(x)).length; if (s > bs) { bs = s; best = ev; } }
  return best && bs >= Math.min(2, w.length) ? wmR(`${best[0]}: ${best[1]}`, { note: [best[1].split(/[:(;]/)[0].slice(0, 60), `${best[0]}: ${best[1]}`] }) : null;
}
function wmForm(q) {
  if (!/\bformula|formulas|ecuacion de|como se calcula|ley de ohm|teorema\b/.test(q)) return null;
  if (typeof HU_FORM === 'undefined') return null;
  for (const [cat, L] of HU_FORM) if (wmIn(q, wn(cat))) return wmR(`Fórmulas de ${cat}:\n${L.map((x) => `• ${x}`).join('\n')}`);
  const term = wmTerm(q).replace(/^(la )?formulas? (de |del |para )?(la |el |los |las )?/, '').replace(/^como se calcula (el |la |los |las )?/, '').trim();
  if (term.length < 3) return wmR(`Tengo fórmulas de: ${HU_FORM.map((x) => x[0]).join(', ')}. Pídeme, por ejemplo, «fórmulas de geometría».`);
  const hits = []; for (const [, L] of HU_FORM) for (const x of L) if (wn(x).includes(term) || term.split(' ').filter((t) => t.length > 3).every((t) => wn(x).includes(t))) hits.push(x);
  return hits.length ? wmR(hits.slice(0, 6).map((x) => `• ${x}`).join('\n')) : null;
}
function wmKnow(q) {
  const term = wmTerm(q);
  const r = WMI.rec.find((x) => x.k.some((k) => wmIn(q, k) || q === k)); if (r) return wmR(r.r[1]);
  const gl = wmBest(WMI.glos, term, q);
  if (/^(quien|quienes) (fue|es|era|fueron|escribio|pinto|invento|descubrio)|^(hablame|dime) de/.test(q) || term.split(' ').length <= 4) {
    const g = wmBest(WMI.gente, term, q); if (g && !(gl && gl.sc >= g.sc)) return wmR(`${g.g[0]}: ${g.g[2]}`, { note: [g.g[0], g.g[2]] });
  }
  if (/escribio|autor|pinto|quien hizo|de quien es/.test(q) || term.split(' ').length <= 5) { const o = wmBest(WMI.obras, term.replace(/^(quien|que autor) (escribio|pinto|hizo) /, ''), q); if (o) return wmR(`«${o.g[0]}» es de ${o.g[2]}`, { note: [o.g[0], o.g[2]] }); }
  if (gl) return wmR(`${gl.g[0]} (${gl.g[3]}): ${gl.g[2]}`, { note: [gl.g[0], gl.g[2]], area: gl.g[3] });
  return null;
}
function wmSmall(q) {
  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|hey|que tal|holi|ola)\b/.test(q) && q.split(' ').length <= 4) { const n = (S.settings.name || profile()?.name || '').split(' ')[0]; return wmR(`Hola${n ? `, ${n}` : ''}. Soy Waimi. Pregúntame lo que quieras: un concepto, una capital, un elemento, una fecha de historia, una operación o qué te conviene estudiar ahora.`); }
  if (/^(gracias|muchas gracias|grax|ok gracias|perfecto|genial)\b/.test(q)) return wmR(wmPick(['Para eso estoy. Sigue así.', 'Con gusto. ¿Algo más?', 'De nada. Un paso más cerca de los honores.']));
  if (/(quien eres|que eres|como te llamas|que puedes hacer|que sabes hacer|ayuda|que sabes)$/.test(q)) return wmR(`Soy Waimi, tu asistente de estudio. Funciono sin internet y sé:\n• ${Object.values(WM_PAISES).flat().length} países con su capital\n• los 118 elementos químicos\n• planetas y datos del universo\n• historia de México y del mundo\n• ${WM_GENTE.length} personajes y ${WM_OBRAS.length} obras famosas\n• ${WM_GLOS.length} conceptos de mercadotecnia, economía, biología, química, física, matemáticas, historia, lengua, filosofía y tecnología\n• fórmulas, conversiones y operaciones\n• tus pendientes, promedio, exámenes y racha\nY si hay internet, busco en Wikipedia lo que no sepa.`);
  if (/^(dato curioso|cuentame algo|sorprendeme|dime algo interesante|un dato)/.test(q)) {
    const f = wmPick([() => { const r = wmPick(WM_RECORD); return r[1]; }, () => { const e = wmPick(WM_ELEM); return `El elemento número ${e.z} es el ${e.n.toLowerCase()} y su símbolo es ${e.s}.`; }, () => { const [a, t] = wmPick(WM_MX); return `${a}: ${t}`; }, () => { const g = wmPick(WM_GENTE); return `${g[0]}: ${g[2]}`; }, () => { const p = wmPick(WM_PLAN); return `${p[0]}: ${p[1]}.`; }]);
    return wmR(f());
  }
  if (/^(preguntame|hazme una pregunta|quiz|examiname|ponme a prueba|reto)/.test(q)) return wmQuizNew();
  return null;
}
function wmQuizNew() {
  const k = Math.floor(Math.random() * 4); let qq, a, alt = [];
  if (k === 0) { const it = wmPick(Object.entries(WM_PAISES).flatMap(([c, L]) => L.map((x) => [...x, c])).filter((x) => !/[;(]/.test(x[1]))); qq = `¿Cuál es la capital de ${it[0]}?`; a = it[1]; }
  else if (k === 1) { const e = WM_ELEM[Math.floor(Math.random() * 56)]; qq = `¿Cuál es el símbolo químico del ${e.n.toLowerCase()}?`; a = e.s; }
  else if (k === 2) { const [y, t] = wmPick(WM_MX.filter(([y]) => /^\d{4}$/.test(y))); qq = `¿En qué año? ${t.replace(/\s*\([^)]*\)/g, '')}`; a = y; }
  else { const g = wmPick(WM_GLOS); qq = `¿Qué concepto de ${g[3].toLowerCase()} es este? «${g[2].split(/[.:]/)[0]}»`; a = g[0].replace(/\s*\(.*\)/, ''); alt = String(g[1]).split('|'); }
  WM.quiz = { a, alt };
  return wmR(`${qq}\nEscribe tu respuesta (o «no sé»).`);
}
function wmQuizCheck(q) {
  const Z = WM.quiz; WM.quiz = null; const ok = [Z.a, ...Z.alt].some((x) => { const n = wn(x); return n && (q === n || (n.length > 4 && q.includes(n)) || (q.length > 4 && n.includes(q))); });
  if (/^(no se|no lo se|ni idea|paso|me rindo)$/.test(q)) return wmR(`La respuesta es: ${Z.a}. Escribe «pregúntame» para otra.`);
  return wmR(ok ? `Correcto: ${Z.a}. Escribe «pregúntame» para otra.` : `Casi. La respuesta es: ${Z.a}. Escribe «pregúntame» para otra.`, { quizOk: ok });
}

/* ---------- Wikipedia (solo con internet) ---------- */
async function wmWiki(term) {
  if (!navigator.onLine) return null;
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 8000);
  try {
    const s = await (await fetch(`https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srlimit=1&format=json&origin=*`, { signal: ctl.signal })).json();
    const hit = s?.query?.search?.[0]; if (!hit) return { none: true };
    const r = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title.replace(/ /g, '_'))}`, { signal: ctl.signal }); if (!r.ok) return null;
    const j = await r.json(); let x = String(j.extract || '').trim(); if (!x) return { none: true };
    if (x.length > 900) { const cut = x.slice(0, 900); x = `${cut.slice(0, Math.max(cut.lastIndexOf('. '), 400) + 1)}`; }
    return { title: j.title || hit.title, text: x, url: j.content_urls?.desktop?.page || `https://es.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}` };
  } catch { return null; } finally { clearTimeout(to); }
}

async function wmAnswer(raw) {
  const q = wn(raw); if (!q) return wmR('Escribe tu pregunta.');
  if (WM.quiz) return wmQuizCheck(q);
  const loc = wmSmall(q) || wmPersonal(q) || wmMath(q, raw) || wmGeo(q) || wmChem(q, raw) || wmSpace(q) || wmForm(q) || wmHist2(q) || wmKnow(q);
  if (loc) return loc;
  const term = wmTerm(q) || q;
  const w = await wmWiki(term);
  if (w && w.text) return wmR(w.text, { src: [w.url, `Wikipedia: ${w.title}`], note: [w.title, w.text] });
  if (w && w.none) return wmR(`No encontré «${term}» ni en mi base ni en Wikipedia. Prueba con otras palabras o con el nombre exacto del concepto.`);
  return wmR(`No tengo «${term}» en mi base sin conexión${navigator.onLine ? ' y no pude consultar Wikipedia ahora' : ', y ahora no hay internet para buscarlo'}. Prueba con un concepto escolar, un país, un elemento, un personaje o una fecha histórica.`);
}

/* ---------- vista ---------- */
const WM_CHIPS = ['¿Qué tengo pendiente?', '¿Qué estudio ahora?', '¿Qué es la segmentación de mercado?', 'Capital de Australia', 'Símbolo del oro', '¿Cuándo fue la expropiación petrolera?', '15% de 380', 'Fórmulas de trigonometría', '¿Quién fue Mario Molina?', 'Pregúntame', 'Dato curioso', '100 km a millas'];
const wmFmt = (t) => esc(t).replace(/\n/g, '<br>');
function wmMsgHTML(m, i) {
  if (m.r === 'u') return `<div class="wm-m u"><p>${wmFmt(m.t)}</p></div>`;
  const acts = [];
  if (m.link && /^#\/[a-z]/.test(m.link[0])) acts.push(`<a class="btn quiet" href="${esc(m.link[0])}">${esc(m.link[1])}</a>`);
  if (m.note) acts.push(`<button type="button" class="btn quiet" data-act="wm-note" data-i="${i}">Guardar nota</button><button type="button" class="btn quiet" data-act="wm-card" data-i="${i}">Hacer tarjeta</button>`);
  return `<div class="wm-m w"><p>${wmFmt(m.t)}</p>${m.src && /^https:\/\/es\.wikipedia\.org\//.test(m.src[0]) ? `<a class="wm-src" href="${esc(m.src[0])}" target="_blank" rel="noopener">Fuente: ${esc(m.src[1])}</a>` : ''}${acts.length ? `<div class="wm-acts">${acts.join('')}</div>` : ''}</div>`;
}
function viewWaimi() {
  if (!honCan()) return '<div class="empty"><h3>Waimi está disponible en el modo Honores de la cuenta de administración</h3></div>';
  const h = wmHist();
  return `<header class="wm-head"><a class="icon-btn ghost" href="#/honores" aria-label="Volver a Honores">${icon('back')}</a><div class="wm-av" aria-hidden="true">W</div><div><h1 class="page-title">Waimi</h1><p class="page-sub">Tu asistente de estudio</p></div>${h.length ? '<button type="button" class="btn quiet wm-clr" data-act="wm-clear">Borrar chat</button>' : ''}</header>
  <section class="wm-chat" id="wmChat" aria-live="polite">${h.length ? h.map(wmMsgHTML).join('') : `<div class="wm-m w"><p>Hola, soy Waimi. Sé de mercadotecnia, ciencias, matemáticas, historia, geografía, literatura y más, y conozco tus pendientes y calificaciones. ¿Qué quieres saber?</p></div>`}${WM.busy ? '<div class="wm-m w wm-typing"><p>Buscando…</p></div>' : ''}</section>
  <div class="wm-chips">${WM_CHIPS.map((c) => `<button type="button" data-act="wm-ask" data-q="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <form class="wm-form" autocomplete="off"><input id="wmQ" class="input" placeholder="Pregúntale a Waimi…" maxlength="300" aria-label="Pregunta para Waimi" enterkeyhint="send"><button class="btn primary" type="submit" ${WM.busy ? 'disabled' : ''}>Preguntar</button></form>`;
}
function wmScroll() { const c = document.getElementById('wmChat'); if (c) c.scrollTop = c.scrollHeight; const last = c && c.lastElementChild; if (last && last.scrollIntoView) last.scrollIntoView({ block: 'nearest' }); }
async function wmAsk(text) {
  text = String(text || '').trim().slice(0, 300); if (!text || WM.busy) return;
  const h = wmHist(); h.push({ r: 'u', t: text, at: Date.now() }); WM.busy = true; wmStore(); render(); setTimeout(wmScroll, 0);
  let a; try { a = await wmAnswer(text); } catch { a = wmR('Algo salió mal al contestar. Intenta de nuevo.'); }
  WM.busy = false; h.push({ r: 'w', ...a, at: Date.now() }); wmStore();
  if ((location.hash || '').startsWith('#/waimi')) { render(); setTimeout(() => { wmScroll(); const i = document.getElementById('wmQ'); if (i && !matchMedia('(pointer: coarse)').matches) i.focus(); }, 0); }
}
HN_ALLOWED.push('waimi');
Object.assign(EXTRA_VIEWS, { waimi: viewWaimi }); EXTRA_NAV.waimi = 'honores';
HN_TOOLS.unshift(['waimi', 'help', 'Waimi']);
Object.assign(VIDA_ACTS, {
  'wm-ask': (el) => wmAsk(el.dataset.q),
  'wm-clear': async () => { if (!(await ask({ title: '¿Borrar la conversación con Waimi?', ok: 'Borrar', danger: true }))) return; WM.h = []; WM.quiz = null; wmStore(); render(); },
  'wm-note': (el) => { const m = wmHist()[+el.dataset.i]; if (!m || !m.note) return; const t = String(m.note[0]).slice(0, 60); const ex = hnZK().find((x) => hnNorm(x.t) === hnNorm(t)); if (ex) { toast('Esa nota ya está en tu segundo cerebro.'); return; } hnZK().push({ id: 'zk' + uid().replace(/[^a-z0-9]/gi, '').slice(-9), t, b: String(m.note[1]).slice(0, 4000) + (m.src ? `\n\nFuente: ${m.src[0]}` : ''), sid: '', at: Date.now(), up: Date.now() }); hnSave(); toast('Guardada en tu segundo cerebro.'); },
  'wm-card': (el) => { const m = wmHist()[+el.dataset.i]; if (!m || !m.note) return; let n = 0; try { n = esAddCards([{ q: String(m.note[0]).slice(0, 120), a: String(m.note[1]).slice(0, 600), sid: '' }]); } catch { /* */ } toast(n === 0 ? 'Esa tarjeta ya existe.' : 'Tarjeta de repaso creada.'); },
  'hn-on': () => { if (!honCan() || honOn()) return; VIDA_ACTS['hn-toggle'](); },
});
document.addEventListener('submit', (e) => { const f = e.target.closest && e.target.closest('.wm-form'); if (!f) return; e.preventDefault(); const i = f.querySelector('input'); const v = i.value; i.value = ''; wmAsk(v); });

/* ---------- botón del modo Honores en Inicio y acceso a Waimi en el panel ---------- */
{
  const baseHoy = viewHoy;
  viewHoy = function () {
    const h = baseHoy(); if (!honCan() || honOn()) return h;
    return `<section class="hn-cta"><div><p class="hn-kicker">Modo Honores</p><b>Estudia sin distracciones</b><small>Plan del día, segundo cerebro, simulacros y Waimi, tu asistente de estudio.</small></div><button type="button" class="btn primary" data-act="hn-on">Activar</button></section>${h}`;
  };
  const baseHn = EXTRA_VIEWS.honores;
  EXTRA_VIEWS.honores = function () {
    const h = baseHn.apply(this, arguments); if (!honCan() || HN.tab !== 'hoy') return h;
    const card = `<a class="wm-cta" href="#/waimi"><span class="wm-av" aria-hidden="true">W</span><span><b>Pregúntale a Waimi</b><small>Conceptos, fechas, fórmulas, capitales, operaciones y tus pendientes. Sin internet.</small></span>${icon('chev', 'sm')}</a>`;
    return h.replace(/(<div class="seg full hn-tabs"[\s\S]*?<\/div>)/, `$1${card}`);
  };
}
