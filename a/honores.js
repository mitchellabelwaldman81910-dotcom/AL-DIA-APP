/* Cinnavia 8.5 — Modo Honores (solo la cuenta de administración, en su propia cuenta).
   · Sin distracciones: se ocultan juegos, tienda, red social, decoraciones y animaciones; quedan TODAS las herramientas de estudio.
   · Panel Honores: meta de promedio por materia, plan del día con puntuación y racha, retos mentales,
     palabra y dato del día, lectura, hábitos de alto rendimiento, revisión semanal y técnicas de estudio con evidencia.
   · Se activa o desactiva en Más. Los datos viven en la cuenta (jpData('honores')) y se sincronizan. */
'use strict';
const HN_ALLOWED = ['honores', 'hoy', 'tareas', 'calendario', 'materias', 'materia', 'libretas', 'notas', 'recordatorios', 'enfoque', 'herramientas', 'calc', 'calculadora', 'lienzo', 'apa', 'checklist', 'escanear', 'cerebro', 'mente', 'quiz', 'asistente', 'consejos', 'skills', 'habilidades', 'panel', 'tarjetas', 'examenes', 'horario', 'animo', 'buscar', 'pizarron', 'aula', 'salones', 'mas', 'ajustes', 'respaldo', 'instalar', 'ayuda', 'quien', 'sugerencias', 'estilo', 'compartir'];
const honCan = () => { try { return isAdminSession() && REG.current === REG.me && !isAdminVisit(REG.current) && !isGroup(); } catch { return false; } };
const honOn = () => { try { return honCan() && !!S.settings.honores; } catch { return false; } };
const HND = () => { const d = jpData('honores'); d.days ||= {}; d.week ||= {}; d.book ||= null; return d; };
const hnSave = () => { try { jpSave(); } catch { /* */ } };
const hnGoal = () => +(S.settings.honGoal || (S.settings.gradeMax === 100 ? 95 : 9.5));
const hnFocusGoal = () => +(S.settings.honFocus || 120);

/* ---------- encender / apagar ---------- */
function honApply() {
  const on = honOn(); const de = document.documentElement;
  if (on === de.hasAttribute('data-honores')) return;
  de.toggleAttribute('data-honores', on); navMode = null;
  if (typeof FA !== 'undefined' && FA.cv) { if (on) FA.on = false; else if (!FA.stat && !FA.on && !de.hasAttribute('data-calm')) { FA.on = true; FA.last = performance.now(); requestAnimationFrame(faFrame); } }
}
{
  const baseRoute = route;
  route = function () {
    const r = baseRoute();
    if (honOn() && !HN_ALLOWED.includes(r.name)) { history.replaceState(null, '', '#/honores'); return { name: 'honores', arg: '' }; }
    return r;
  };
  const baseNav = setNav;
  const NAV_HN = [['honores', 'star', 'Honores'], ['tareas', 'list', 'Tareas'], ['libretas', 'book', 'Libretas'], ['enfoque', 'timer', 'Enfoque'], ['mas', 'grid', 'Más']];
  setNav = function (group) {
    honApply();
    if (honOn() && !group) { if (navMode === 'h') return; navMode = 'h'; $('.nav').innerHTML = NAV_HN.map(([k, ic, l]) => `<a href="#/${k}" data-nav="${k}"><svg class="i"><use href="#i-${ic}"/></svg><span>${l}</span></a>`).join(''); return; }
    baseNav(group);
  };
  /* enlaces a pantallas que no son de estudio: desaparecen en este modo */
  const st = document.createElement('style'); st.id = 'hnHide'; document.head.appendChild(st);
  setTimeout(() => {
    const all = [...new Set(Object.keys(EXTRA_VIEWS).concat(['vida', 'carta', 'juego']))].filter((k) => !HN_ALLOWED.includes(k));
    st.textContent = all.map((k) => `:root[data-honores] #view a[href="#/${k}"], :root[data-honores] #view a[href^="#/${k}/"]`).join(',\n') + ' { display: none !important; }';
  }, 0);
}

/* ---------- utilidades ---------- */
const hnSeed = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const hnRng = (seed) => () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hnMonday = (iso) => { const d = fromISO(iso); const w = (d.getDay() + 6) % 7; return addDays(iso, -w); };
const hnDay = (iso = today()) => { const d = HND(); if (!d.days[iso]) { d.days[iso] = { plan: {}, hab: {}, reto: {}, score: 0 }; const ks = Object.keys(d.days).sort(); if (ks.length > 420) for (const k of ks.slice(0, ks.length - 400)) delete d.days[k]; } return d.days[iso]; };

const HN_WORDS = [['Efímero', 'Que dura muy poco tiempo.'], ['Resiliencia', 'Capacidad de adaptarse y recuperarse ante la adversidad.'], ['Ubicuo', 'Que está presente en todas partes.'], ['Perspicaz', 'Que percibe o entiende las cosas con agudeza.'], ['Elocuente', 'Que habla o escribe de forma clara y convincente.'], ['Pragmático', 'Que se centra en lo práctico y útil.'], ['Inefable', 'Que no se puede explicar con palabras.'], ['Meticuloso', 'Que hace las cosas con mucho cuidado y detalle.'], ['Sinergia', 'Acción conjunta que logra más que la suma de las partes.'], ['Ecuánime', 'Que mantiene la calma y el equilibrio.'], ['Paradigma', 'Modelo o patrón que sirve de ejemplo.'], ['Empatía', 'Capacidad de ponerse en el lugar del otro.'], ['Ambiguo', 'Que puede entenderse de varias maneras.'], ['Exhaustivo', 'Que trata algo de forma completa, sin dejar nada.'], ['Inherente', 'Que es parte esencial de algo y no se puede separar.'], ['Altruista', 'Que procura el bien de los demás sin buscar beneficio propio.'], ['Sagaz', 'Astuto y prudente; que prevé las cosas.'], ['Prolífico', 'Que produce mucho.'], ['Tenaz', 'Firme y constante en lo que se propone.'], ['Sintetizar', 'Resumir lo esencial de algo.'], ['Hipótesis', 'Suposición que se plantea para comprobarla.'], ['Analogía', 'Relación de semejanza entre cosas distintas.'], ['Coherente', 'Que tiene relación lógica entre sus partes.'], ['Escéptico', 'Que duda de lo que no está comprobado.'], ['Ímpetu', 'Fuerza o energía con que se hace algo.'], ['Lúcido', 'Que piensa con claridad.'], ['Óptimo', 'Lo mejor posible.'], ['Plausible', 'Que es creíble o aceptable.'], ['Procrastinar', 'Aplazar lo que se debe hacer.'], ['Holístico', 'Que considera el todo y no solo las partes.'], ['Disciplina', 'Constancia para hacer lo necesario aunque no haya ganas.'], ['Metacognición', 'Pensar sobre cómo piensas y aprendes, para mejorar.']];
const HN_FACTS = ['El cerebro usa cerca del 20 % de la energía del cuerpo, aunque pesa alrededor del 2 %.', 'Dormir bien ayuda al cerebro a consolidar lo que aprendiste durante el día.', 'Explicar un tema con tus propias palabras es una de las mejores formas de aprenderlo (técnica Feynman).', 'Repasar en días espaciados ayuda a recordar por más tiempo que estudiar todo de golpe.', 'Intentar recordar sin ver tus apuntes fortalece la memoria más que solo releerlos.', 'El ejercicio aumenta el flujo de sangre al cerebro y ayuda a la concentración.', 'La luz del Sol tarda unos 8 minutos en llegar a la Tierra.', 'El corazón humano late unas 100,000 veces al día.', 'Los pulpos tienen tres corazones.', 'El agua cubre alrededor del 71 % de la superficie de la Tierra.', 'El monte Everest mide unos 8,849 metros.', 'Un año en Mercurio dura 88 días terrestres.', 'El sonido viaja a unos 343 metros por segundo en el aire.', 'La luz viaja a casi 300,000 kilómetros por segundo.', 'Un adulto tiene 206 huesos.', 'La fotosíntesis convierte luz, agua y dióxido de carbono en glucosa y oxígeno.', 'La Independencia de México se consumó en 1821.', 'La Revolución Mexicana inició en 1910.', 'México tiene 32 entidades federativas.', 'Chichén Itzá es una de las siete maravillas del mundo moderno.', 'El número π empieza 3.14159…', 'Las abejas indican dónde están las flores con una especie de danza.', 'La Vía Láctea tiene cientos de miles de millones de estrellas.', 'Tener el celular a la vista, aunque esté apagado, puede bajar tu concentración: guárdalo lejos al estudiar.', 'Estudiar varias materias o tipos de ejercicio mezclados (intercalado) mejora la capacidad de resolver problemas nuevos.', 'Escribir a mano tus apuntes te obliga a resumir, y eso ayuda a entender mejor.', 'Hacer exámenes de práctica es una de las técnicas de estudio con más evidencia a favor.', 'La curiosidad prepara al cerebro para recordar mejor lo que aprende después.'];
const HN_LOGIC = [['Si 3 gatos atrapan 3 ratones en 3 minutos, ¿cuántos minutos tardan 100 gatos en atrapar 100 ratones?', 3], ['Un ladrillo pesa 1 kg más medio ladrillo. ¿Cuántos kg pesa el ladrillo?', 2], ['Un bate y una pelota cuestan $110. El bate cuesta $100 más que la pelota. ¿Cuánto cuesta la pelota?', 5], ['En una carrera rebasas a quien va en segundo lugar. ¿En qué lugar quedas?', 2], ['Una mancha de nenúfares duplica su tamaño cada día y cubre el lago en 48 días. ¿En qué día cubría la mitad?', 47], ['¿Cuántos meses del año tienen al menos 28 días?', 12], ['A oscuras tienes 6 calcetines negros y 6 blancos revueltos. ¿Cuántos debes sacar para asegurar un par del mismo color?', 3], ['Si 5 máquinas hacen 5 piezas en 5 minutos, ¿cuántos minutos tardan 100 máquinas en hacer 100 piezas?', 5], ['Un granjero tiene 17 ovejas y se le van todas menos 9. ¿Cuántas le quedan?', 9], ['Un reloj da 6 campanadas en 5 segundos (un segundo entre cada una). ¿Cuántos segundos tarda en dar 12?', 11], ['Si hoy es lunes, ¿qué día será dentro de 100 días? Escribe el número: 1 = lunes … 7 = domingo.', 3], ['Ana es mayor que Beto y Beto es mayor que Carla. ¿Quién es la menor? (1 Ana, 2 Beto, 3 Carla)', 3], ['Tienes 3 manzanas y te llevas 2. ¿Cuántas manzanas tienes tú?', 2], ['¿Cuántas veces puedes restar 5 de 25?', 1]];
function hnRetos(iso = today()) {
  const r = hnRng(hnSeed('reto' + iso)); const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const a = ri(12, 49), b = ri(3, 9), c = ri(10, 99); const math = { q: `Cálculo mental: ${a} × ${b} + ${c}`, a: a * b + c };
  const kind = ri(0, 3); let seq;
  if (kind === 0) { const s = ri(2, 30), k = ri(3, 12); seq = { q: `¿Qué número sigue? ${[0, 1, 2, 3].map((i) => s + k * i).join(', ')}, …`, a: s + k * 4 }; }
  else if (kind === 1) { const s = ri(2, 6), m = ri(2, 3); seq = { q: `¿Qué número sigue? ${[0, 1, 2, 3].map((i) => s * m ** i).join(', ')}, …`, a: s * m ** 4 }; }
  else if (kind === 2) { const s = ri(1, 6); seq = { q: `¿Qué número sigue? ${[0, 1, 2, 3].map((i) => (s + i) ** 2).join(', ')}, …`, a: (s + 4) ** 2 }; }
  else { const x = ri(1, 5), y = ri(2, 6); const f = [x, y]; for (let i = 0; i < 4; i++) f.push(f[f.length - 1] + f[f.length - 2]); seq = { q: `¿Qué número sigue? (cada uno es la suma de los dos anteriores) ${f.slice(0, 5).join(', ')}, …`, a: f[5] }; }
  const L = HN_LOGIC[hnSeed('lg' + iso) % HN_LOGIC.length]; const logic = { q: `Lógica: ${L[0]}`, a: L[1] };
  return [math, seq, logic];
}
const hnWord = (iso = today()) => HN_WORDS[hnSeed('w' + iso) % HN_WORDS.length];
const hnFact = (iso = today()) => HN_FACTS[hnSeed('f' + iso) % HN_FACTS.length];

const HN_HAB = [['sueno', 'Dormí 8 horas'], ['ejer', 'Me moví 20 minutos'], ['agua', 'Tomé suficiente agua'], ['cel', 'Estudié con el celular lejos'], ['hora', 'Me acosté a buena hora']];

/* ---------- plan del día ---------- */
function hnPlan(iso = today()) {
  const D = hnDay(iso); const t = today(); const items = [];
  const min = (S.focus || []).filter((f) => f.d === iso).reduce((a, f) => a + (+f.m || 0), 0); const g = hnFocusGoal();
  items.push({ k: 'enfoque', l: 'Enfoque profundo', s: `${min} de ${g} minutos`, done: min >= g, href: '#/enfoque', p: Math.min(1, min / g) });
  const late = S.tasks.filter((x) => !x.done && x.due && x.due <= t); const tom = S.tasks.filter((x) => !x.done && x.due === addDays(t, 1));
  items.push({ k: 'tareas', l: 'Tareas al día', s: late.length ? `${late.length} para hoy o atrasadas` : tom.length ? `Todo al día · ${tom.length} para mañana: adelántalas` : 'Todo al día', done: !late.length, href: '#/tareas' });
  let due = 0, total = 0; try { const ed = ESD(); total = ed.cards.length; due = esDue(ed).length; } catch { /* */ }
  items.push({ k: 'repaso', l: 'Repaso espaciado', s: total ? (due ? `${due} tarjetas por repasar` : 'Repaso del día completo') : 'Crea tarjetas de lo que estudias', done: total > 0 && due === 0, href: '#/tarjetas' });
  let ex = null; try { ex = ESD().exams.filter((e) => esDays(e.date) >= 0 && esDays(e.date) <= 14).sort((a, b) => a.date.localeCompare(b.date))[0]; } catch { /* */ }
  if (ex) { const n = esDays(ex.date); const left = (ex.topics || []).filter((x) => !x.done).length; items.push({ k: 'examen', l: `Preparar: ${ex.title}`, s: `${n === 0 ? 'Es hoy' : n === 1 ? 'Es mañana' : `Faltan ${n} días`} · ${left} ${left === 1 ? 'tema pendiente' : 'temas pendientes'}`, done: !!D.plan.examen, act: 'hn-check', href: '#/examenes' }); }
  const R = hnRetos(iso); const ok = R.filter((_, i) => D.reto[i] === true).length;
  items.push({ k: 'reto', l: 'Reto mental', s: `${ok} de 3 resueltos`, done: ok === 3, anchor: 'hnReto' });
  const bk = HND().book; items.push({ k: 'lectura', l: 'Leer 20 minutos', s: bk ? `${bk.t}` : 'Elige un libro abajo', done: !!D.plan.lectura, act: 'hn-check' });
  if (fromISO(iso).getDay() === 0) { const wk = HND().week[hnMonday(iso)]; items.push({ k: 'semana', l: 'Revisión semanal', s: 'Cinco minutos para ver cómo te fue', done: !!(wk && wk.a), anchor: 'hnWeek' }); }
  const hab = HN_HAB.filter(([k]) => D.hab[k]).length;
  const score = Math.round(((items.filter((x) => x.done).length + hab * 0.5) / (items.length + HN_HAB.length * 0.5)) * 100);
  if (iso === t && D.score !== score) { D.score = score; hnSave(); }
  return { items, score, hab };
}
function hnStreak() { const d = HND(); let n = 0; for (let i = 0; i < 400; i++) { const iso = addDays(today(), -i); const s = (d.days[iso] || {}).score || 0; if (s >= 70) n++; else if (i > 0) break; } return n; }

/* ---------- promedio y materias ---------- */
function hnGrades() {
  const rows = S.subjects.filter((s) => !s.nb).map((s) => ({ s, st: subjStats(s.id) }));
  const w = rows.filter((r) => r.st.avg != null); const avg = w.length ? w.reduce((a, r) => a + r.st.avg, 0) / w.length : null;
  return { rows, avg, below: w.filter((r) => r.st.avg < hnGoal()).sort((a, b) => a.st.avg - b.st.avg) };
}

/* ---------- vista ---------- */
const HN_TECH = [
  ['Recuerdo activo', 'Cierra el cuaderno y escribe todo lo que recuerdes; luego revisa qué faltó.', '#/tarjetas', 'Practicar'],
  ['Repetición espaciada', 'Repasa hoy, en 2 días, en 4, en 8… Las tarjetas lo programan solas.', '#/tarjetas', 'Repasar'],
  ['Técnica Feynman', 'Explica el tema como si se lo enseñaras a alguien de 12 años. Donde te trabes, ahí estudias.', '#/libretas', 'Escribir'],
  ['Bloques de enfoque', '25 a 50 minutos sin celular, luego 5 a 10 de descanso.', '#/enfoque', 'Empezar'],
  ['Exámenes de práctica', 'Ponte a prueba antes del examen real: es de lo que más funciona.', '#/quiz', 'Hacer quiz'],
  ['Intercalado', 'Mezcla temas y tipos de ejercicio en una misma sesión en vez de repetir uno solo.', '#/examenes', 'Planear'],
  ['Mapas de ideas', 'Conecta conceptos: ver las relaciones hace que todo tenga sentido.', '#/cerebro', 'Abrir'],
  ['Pregunta «¿por qué?»', 'Por cada dato, pregúntate por qué es así y cómo se relaciona con lo que ya sabes.', '#/libretas', 'Anotar'],
];
const HN_TOOLS = [['tareas', 'list', 'Tareas'], ['calendario', 'cal', 'Calendario'], ['horario', 'clock', 'Horario'], ['materias', 'book', 'Materias'], ['libretas', 'note', 'Libretas'], ['tarjetas', 'spark', 'Tarjetas'], ['examenes', 'flag', 'Exámenes'], ['quiz', 'check', 'Quiz'], ['enfoque', 'timer', 'Enfoque'], ['asistente', 'help', 'Asistente'], ['calculadora', 'tools', 'Calculadora'], ['calc', 'star', '¿Cuánto necesito?'], ['escanear', 'cam', 'Escanear'], ['pizarron', 'board', 'Pizarrón'], ['cerebro', 'leaf', 'Cerebro'], ['apa', 'link', 'Citas APA'], ['checklist', 'check', 'Revisar entrega'], ['buscar', 'search', 'Buscar'], ['recordatorios', 'bell', 'Recordatorios'], ['animo', 'heart', 'Ánimo'], ['mente', 'leaf', 'Mente'], ['panel', 'grid', 'Estadísticas']];
const HN = { tab: 'hoy', ses: null };
const HN_EN = [['Achieve', 'lograr', 'I will achieve honors this year.'], ['Improve', 'mejorar', 'Every day I improve a little.'], ['Knowledge', 'conocimiento', 'Knowledge is power.'], ['Goal', 'meta', 'My goal is to graduate with honors.'], ['Effort', 'esfuerzo', 'Effort beats talent when talent does not work hard.'], ['Focus', 'concentrarse', 'I focus better without my phone.'], ['Challenge', 'reto', 'This exam is a challenge, not a threat.'], ['Habit', 'hábito', 'Reading is my favorite habit.'], ['Skill', 'habilidad', 'Writing well is a valuable skill.'], ['Growth', 'crecimiento', 'Mistakes are part of growth.'], ['Schedule', 'horario', 'I follow my study schedule.'], ['Review', 'repasar', 'I review my notes every night.'], ['Reliable', 'confiable', 'Be reliable: deliver on time.'], ['Curious', 'curioso', 'Curious people learn faster.'], ['Purpose', 'propósito', 'Study with a purpose.'], ['Achievement', 'logro', 'Graduating with honors is a great achievement.'], ['Patience', 'paciencia', 'Learning takes patience.'], ['Insight', 'comprensión profunda', 'The teacher shared a great insight.'], ['Outstanding', 'sobresaliente', 'Her project was outstanding.'], ['Thorough', 'minucioso', 'Be thorough when you check your work.'], ['Deadline', 'fecha límite', 'The deadline is on Friday.'], ['Summary', 'resumen', 'Write a summary of the chapter.'], ['Mindset', 'mentalidad', 'A growth mindset changes everything.'], ['Consistent', 'constante', 'Be consistent, not perfect.'], ['Leadership', 'liderazgo', 'Leadership starts with example.'], ['Wisdom', 'sabiduría', 'Wisdom comes from experience.'], ['Approach', 'enfoque', 'Try a different approach.'], ['Strength', 'fortaleza', 'Math is one of my strengths.'], ['Overcome', 'superar', 'You can overcome any obstacle.'], ['Excellence', 'excelencia', 'Excellence is a habit.']];
const hnEn = (iso = today()) => HN_EN[hnSeed('en' + iso) % HN_EN.length];
const HN_MILES = ['Mantener promedio de honores todo el semestre', 'Cero entregas tarde en el semestre', 'Leer 12 libros en el año', 'Aprender inglés a nivel conversación', 'Hacer un proyecto que pueda presentar en mi portafolio', 'Conseguir una constancia o certificación extra', 'Participar en un concurso, feria o evento académico', 'Ayudar a un compañero a estudiar (enseñar es aprender dos veces)'];

/* siguiente mejor acción: el entrenador decide qué conviene hacer ahora */
function hnNext() {
  const t = today(); const P = hnPlan(); const by = Object.fromEntries(P.items.map((x) => [x.k, x]));
  const late = S.tasks.filter((x) => !x.done && x.due && x.due < t).sort(sortPending);
  if (late.length) return { t: `Termina «${late[0].title}»`, d: 'Está atrasada. Sácala primero y te quitas un peso de encima.', href: '#/tareas', b: 'Ir a tareas' };
  try { const ex = ESD().exams.filter((e) => esDays(e.date) >= 0 && esDays(e.date) <= 3).sort((a, b) => a.date.localeCompare(b.date))[0]; const tp = ex && (ex.topics || []).find((x) => !x.done); if (tp) return { t: `Repasa «${tp.n}»`, d: `Tu examen «${ex.title}» es ${relDay(ex.date)}. Recuerdo activo: escribe lo que sepas del tema y luego compara.`, act: 'hn-ses', b: 'Sesión guiada' }; } catch { /* */ }
  { const done = new Set((HND().auto || []).map((a) => a.tid).filter(Boolean)); const lowT = S.tasks.filter((x) => x.done && x.grade != null && x.grade !== '' && +x.grade < hnGoal() && x.doneAt && Date.now() - x.doneAt < 14 * 864e5 && !done.has(x.id)).sort((a, b) => b.doneAt - a.doneAt)[0]; if (lowT) return { t: `Haz la autopsia de «${lowT.title}»`, d: `Sacaste ${fmtGrade(lowT.grade)}. Dos minutos para saber por qué y no repetirlo.`, act: 'hn-auto-new', b: 'Diagnosticar' }; }
  try { const ex = ESD().exams.filter((e) => esDays(e.date) >= 0 && esDays(e.date) <= 7)[0]; const simToday = (HND().sim || []).some((x) => x.d === t); if (ex && !simToday && hnSimPool(ex.sid || '').length >= 4) return { t: `Simulacro para «${ex.title}»`, d: `Faltan ${esDays(ex.date)} días. Contesta bajo tiempo como en el examen real y repasa lo que falles.`, tab: 'mente', b: 'Ir al simulacro' }; } catch { /* */ }
  const todayT = S.tasks.filter((x) => !x.done && x.due === t).sort(sortPending);
  if (todayT.length) return { t: `Entrega de hoy: «${todayT[0].title}»`, d: 'Termínala antes de cualquier otra cosa.', href: '#/tareas', b: 'Ir a tareas' };
  if (by.repaso && !by.repaso.done && /tarjetas por repasar/.test(by.repaso.s)) return { t: 'Repasa tus tarjetas', d: `${by.repaso.s}. Son pocos minutos y fijan lo que ya estudiaste.`, href: '#/tarjetas', b: 'Repasar' };
  if (!by.enfoque.done) { const G = hnGrades(); const low = G.below[0]; return { t: `Bloque de 25 minutos${low ? ` de ${low.s.name}` : ''}`, d: low ? 'Es la materia que más te acerca a la meta de honores.' : 'Un bloque sin celular. Después, 5 minutos de descanso.', href: '#/enfoque', b: 'Empezar enfoque' }; }
  const tom = S.tasks.filter((x) => !x.done && x.due && x.due > t).sort(sortPending)[0];
  if (tom) return { t: `Adelanta «${tom.title}»`, d: `Vence ${relDay(tom.due)}. Adelantar es lo que separa a los buenos de los excelentes.`, href: '#/tareas', b: 'Ir a tareas' };
  if (hnUngraded().length) return { t: 'Anota tus calificaciones', d: `Tienes ${hnUngraded().length} entregas sin calificación. Sin ellas no sé si vas en camino a los honores.`, b: '' };
  if (!by.reto.done) return { t: 'Gimnasio mental', d: 'Tres retos rápidos para mantener la mente ágil.', tab: 'mente', b: 'Resolver' };
  if (!by.lectura.done) return { t: 'Lee 20 minutos', d: 'Leer a diario es lo que más amplía tu forma de pensar.', tab: 'mente', b: 'Ver lectura' };
  return { t: 'Todo listo por hoy', d: 'Hiciste lo importante. Descansa bien: dormir también es estudiar.', b: '' };
}

/* ================= Segundo cerebro: bandeja, notas enlazadas y base de datos ================= */
HN.db = { sid: '', st: 'pend', sort: 'fecha' }; HN.zq = '';
const hnNorm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const hnZK = () => { const d = HND(); d.zk ||= []; return d.zk; };
const hnLinks = (b) => [...String(b || '').matchAll(/\[\[([^\]\n]{1,80})\]\]/g)].map((m) => m[1].trim());
const hnBack = (n) => hnZK().filter((x) => x.id !== n.id && hnLinks(x.b).some((l) => hnNorm(l) === hnNorm(n.t)));
const hnZFind = (t) => hnZK().find((x) => hnNorm(x.t) === hnNorm(t));
const hnDL = (name, text, type) => { try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000); } catch { toast('No se pudo descargar.'); } };
const hnSubjName = (id) => (S.subjects.find((s) => s.id === id) || {}).name || 'General';
function hnBodyHTML(b) {
  return esc(b).replace(/\[\[([^\]\n]{1,80})\]\]/g, (m, t) => `<button type="button" class="hn-wl ${hnZFind(t) ? '' : 'new'}" data-act="hn-zk-go" data-t="${esc(t)}">${esc(t)}</button>`).replace(/\n/g, '<br>');
}
function hnCerebroTab() {
  const d = HND(); const inbox = d.inbox || []; const zk = hnZK();
  const list = zk.slice().sort((a, b) => (b.up || 0) - (a.up || 0));
  const links = zk.reduce((a, n) => a + hnLinks(n.b).length, 0);
  // base de datos
  const D = HN.db; let rows = S.tasks.filter((t) => (!D.sid || t.subjectId === D.sid) && (D.st === 'all' || (D.st === 'pend' ? !t.done : t.done)));
  rows = rows.sort((a, b) => D.sort === 'cal' ? (+b.grade || -1) - (+a.grade || -1) : D.sort === 'materia' ? hnSubjName(a.subjectId).localeCompare(hnSubjName(b.subjectId)) : String(a.due || '9999').localeCompare(String(b.due || '9999')));
  const sel = (id, opts, v) => `<select class="input hn-dbf" data-f="${id}">${opts.map(([k, l]) => `<option value="${k}" ${v === k ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  return `<p class="small muted" style="margin:12px 2px 0">Tu memoria es para pensar, no para guardar. Todo lo que se te ocurra va aquí; luego lo conviertes en tarea, nota o tarjeta.</p>
  <h2 class="sec">Bandeja de entrada</h2>
  <section class="hn-card"><form class="hn-cap"><input id="hnCap" class="input" placeholder="Anota cualquier cosa: idea, pendiente, duda…" autocomplete="off" maxlength="300"><button class="btn primary" type="submit">Guardar</button></form>
    ${inbox.length ? `<ul class="hn-inbox">${inbox.slice().reverse().map((x) => `<li><span>${esc(x.t)}</span><div class="hn-ib-a"><button class="btn quiet" data-act="hn-ib" data-v="task" data-id="${x.id}">Tarea</button><button class="btn quiet" data-act="hn-ib" data-v="note" data-id="${x.id}">Nota</button>${/[:：]/.test(x.t) ? `<button class="btn quiet" data-act="hn-ib" data-v="card" data-id="${x.id}">Tarjeta</button>` : ''}<button class="icon-btn ghost" data-act="hn-ib" data-v="del" data-id="${x.id}" aria-label="Quitar">${icon('trash', 'sm')}</button></div></li>`).join('')}</ul>` : '<p class="tiny faint" style="margin:8px 0 0">Bandeja vacía. Mente despejada.</p>'}</section>
  <h2 class="sec">Notas enlazadas</h2>
  <section class="hn-card"><p class="small muted" style="margin-top:0">Escribe <b>[[Nombre de otra nota]]</b> para conectar ideas entre materias. Cada nota muestra qué otras notas la mencionan.</p>
    <div class="hn-zk-top"><span><b>${zk.length}</b> notas · <b>${links}</b> conexiones</span><button class="btn primary" data-act="hn-zk-new">${icon('plus', 'sm')}Nueva nota</button></div>
    ${zk.length > 3 ? `<label class="lq-search" style="margin-top:10px"><span aria-hidden="true">${icon('search')}</span><input id="hnZq" type="search" value="${esc(HN.zq)}" placeholder="Buscar en tus notas" autocomplete="off" aria-label="Buscar en tus notas"></label>` : ''}
    ${list.length ? `<ul class="hn-zk" id="hnZk">${list.slice(0, 300).map((n) => { const bl = hnBack(n).length, ol = hnLinks(n.b).length; return `<li data-q="${esc(hnNorm(`${n.t} ${n.b}`))}"><button type="button" data-act="hn-zk-open" data-id="${n.id}"><b>${esc(n.t)}</b><small>${esc(hnSubjName(n.sid))} · ${ol} ${ol === 1 ? 'enlace' : 'enlaces'} · ${bl} ${bl === 1 ? 'la menciona' : 'la mencionan'}</small><span>${esc(String(n.b).replace(/\[\[|\]\]/g, '').slice(0, 110))}</span></button></li>`; }).join('')}</ul><p class="small muted hn-znone" hidden>No encontré notas con eso.</p>` : ''}
    ${zk.length ? `<div class="btn-row" style="margin-top:10px"><button class="btn quiet" data-act="hn-exp-md">Exportar para Obsidian (.md)</button></div>` : ''}</section>
  <h2 class="sec">Base de datos de entregas</h2>
  <section class="hn-card"><div class="hn-dbb">${sel('sid', [['', 'Todas las materias'], ...S.subjects.filter((s) => !s.nb).map((s) => [s.id, esc(s.name)])], D.sid)}${sel('st', [['pend', 'Pendientes'], ['done', 'Hechas'], ['all', 'Todas']], D.st)}${sel('sort', [['fecha', 'Por fecha'], ['cal', 'Por calificación'], ['materia', 'Por materia']], D.sort)}</div>
    <div class="hn-tbl-w"><table class="hn-tbl"><thead><tr><th>Entrega</th><th>Materia</th><th>Fecha</th><th>Estado</th><th>Calif.</th><th>Vale</th></tr></thead><tbody>${rows.length ? rows.slice(0, 200).map((t) => { const late = !t.done && t.due && t.due < today(); return `<tr data-act="open-task" data-id="${t.id}"><td>${esc(t.title)}</td><td>${esc(hnSubjName(t.subjectId))}</td><td>${t.due ? esc(relDay(t.due)) : '—'}</td><td><span class="hn-st ${t.done ? 'ok' : late ? 'late' : ''}">${t.done ? 'Hecha' : late ? 'Atrasada' : 'Pendiente'}</span></td><td>${t.grade != null && t.grade !== '' ? esc(fmtGrade(t.grade)) : '—'}</td><td>${+t.value > 0 ? `${+t.value}%` : '—'}</td></tr>`; }).join('') : '<tr><td colspan="6" class="muted">Sin entregas con esos filtros.</td></tr>'}</tbody></table></div>
    <div class="btn-row" style="margin-top:10px"><button class="btn quiet" data-act="hn-exp-csv">Exportar para Notion (.csv)</button></div></section>`;
}
function hnZkSheet(n) {
  const isNew = !n; n = n || { id: 'zk' + uid().replace(/[^a-z0-9]/gi, '').slice(-9), t: '', b: '', sid: '' };
  const bl = isNew ? [] : hnBack(n);
  openSheet(`${sheetHead(isNew ? 'Nueva nota' : 'Nota')}<div class="sheet-body">
    <div class="field"><label for="zkT">Título</label><input id="zkT" class="input" value="${esc(n.t)}" maxlength="80"></div>
    <div class="field"><label for="zkS">Materia</label><select id="zkS" class="input"><option value="">General</option>${S.subjects.filter((s) => !s.nb).map((s) => `<option value="${s.id}" ${n.sid === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></div>
    <div class="field"><label for="zkB">Nota (usa [[otra nota]] para enlazar)</label><textarea id="zkB" class="input" rows="8">${esc(n.b)}</textarea></div>
    ${!isNew && hnLinks(n.b).length ? `<p class="hn-kicker">Enlaza a</p><div class="hn-wls">${hnBodyHTML(hnLinks(n.b).map((l) => `[[${l}]]`).join(' '))}</div>` : ''}
    ${bl.length ? `<p class="hn-kicker" style="margin-top:10px">La mencionan</p><div class="hn-wls">${bl.map((x) => `<button type="button" class="hn-wl" data-act="hn-zk-open" data-id="${x.id}">${esc(x.t)}</button>`).join('')}</div>` : ''}
  </div><div class="sheet-foot">${isNew ? '' : `<button class="icon-btn ghost" data-act="hn-zk-del" data-id="${n.id}" aria-label="Borrar nota">${icon('trash', 'sm')}</button>`}<span class="grow"></span><button class="btn primary" data-act="hn-zk-save" data-id="${n.id}">Guardar</button></div>`);
}

/* ================= Modo Feynman con evaluación automática ================= */
const HN_STOP = new Set('para como pero porque cuando donde desde hasta sobre entre tambien tambien muy mas menos este esta estos estas ese esa esos esas aquel aquella cada todo toda todos todas otro otra otros otras ellos ellas nosotros usted ustedes puede pueden tiene tienen hacer hace hacen siendo tener sido fueron eran esta estan estar porque segun mediante durante tanto tanta tantos algunos algunas alguna alguno ningun ninguna mismo misma ademas aunque entonces luego despues antes siempre nunca bien mejor peor mucho mucha muchos muchas poco poca pocos pocas solo sola cual cuales quien quienes cuanto cuanta forma parte manera tipo tipos ejemplo general primero segundo tercera tercer veces sino seria sera seran haber habia habian hemos hubo tengo tienes tenemos estoy estamos ellos aqui alli asi ahora mientras dentro fuera traves embargo cosa cosas dice decir dicho hecho tiene llamado llamada llaman'.split(' '));
const hnStem = (w) => w.replace(/(aciones|amientos|imientos|aciones|mente|ciones|cion|idad|idades|ismo|istas|ista|ables|ible|ibles|able|ados|adas|idos|idas|ado|ada|ido|ida|es|s)$/, '').slice(0, 7);
function hnKeyTerms(src, n = 10) {
  const txt = String(src || ''); const heads = []; txt.split('\n').forEach((l) => { const m = l.match(/^\s*[-•*]?\s*([^:：\n]{3,40})[:：]\s+\S/); if (m) heads.push(m[1].trim()); });
  const words = hnNorm(txt).match(/[a-zñ]{5,}/g) || []; const f = {}; const show = {};
  for (const w of words) { if (HN_STOP.has(w)) continue; const s = hnStem(w); f[s] = (f[s] || 0) + 1; if (!show[s] || w.length < show[s].length) show[s] = w; }
  const H = heads.map((h) => ({ t: h, keys: (hnNorm(h).match(/[a-zñ]{4,}/g) || []).filter((w) => !HN_STOP.has(w)).map(hnStem) })).filter((h) => h.keys.length);
  const used = new Set(H.flatMap((h) => h.keys));
  const top = Object.entries(f).filter(([s, c]) => c >= 2 && !used.has(s)).sort((a, b) => b[1] - a[1]).slice(0, Math.max(0, n - H.length)).map(([s]) => ({ t: show[s], keys: [s] }));
  return [...H.slice(0, n), ...top].slice(0, n);
}
function hnFeynEval(summary, src) {
  const terms = hnKeyTerms(src, 10); const sw = [...new Set((hnNorm(summary).match(/[a-zñ]{4,}/g) || []).map(hnStem))];
  const hit = (k) => sw.some((w) => w === k || (w.length >= 5 && k.length >= 5 && (w.startsWith(k.slice(0, 5)) || k.startsWith(w.slice(0, 5)))));
  /* en conceptos de varias palabras («Criterios psicográficos») cuenta la palabra que los distingue, no la que comparten */
  const freq = {}; for (const t of terms) for (const k of new Set(t.keys)) freq[k] = (freq[k] || 0) + 1;
  const res = terms.map((t) => { const own = t.keys.filter((k) => freq[k] === 1); const need = own.length ? own : t.keys; return { t: t.t, ok: need.every(hit) }; });
  const pct = res.length ? Math.round((res.filter((x) => x.ok).length / res.length) * 100) : 0;
  return { res, pct };
}
function hnSubjText(sid, topic) {
  let parts = [];
  for (const p of S.pages || []) if (!p.deleted && (!sid || (p.subjectId || '') === sid)) parts.push(`${p.title || ''}\n${p.text || ''}\n${(p.items || []).map((i) => i.t).join('\n')}`);
  for (const n of S.notes || []) if (!sid || (n.subjectId || '') === sid) parts.push(`${n.title || ''}\n${htmlText(n.body || '')}`);
  for (const z of hnZK()) if (!sid || z.sid === sid) parts.push(`${z.t}\n${z.b}`);
  if (topic) { const k = (hnNorm(topic).match(/[a-zñ]{4,}/g) || []).map(hnStem); const f = parts.filter((p) => k.some((x) => hnNorm(p).includes(x))); if (f.length) parts = f; }
  return parts.join('\n\n');
}
function hnFeynCard() {
  const F = HN.fey || {}; const subs = S.subjects.filter((s) => !s.nb);
  return `<h2 class="sec">Modo Feynman</h2>
  <section class="hn-card"><p class="small muted" style="margin-top:0">Al cerrar una sesión de estudio: escribe en 3 líneas lo que aprendiste <b>sin ver tus apuntes</b>. La app lo compara con tus libretas y notas y te dice qué conceptos clave olvidaste. Todo se evalúa en tu teléfono.</p>
    <div class="hn-dbb"><select id="fyS" class="input"><option value="">Todas mis notas</option>${subs.map((s) => `<option value="${s.id}" ${F.sid === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select><input id="fyT" class="input" placeholder="Tema (opcional)" value="${esc(F.topic || '')}" maxlength="60"></div>
    <textarea id="fyX" class="input" rows="3" placeholder="Explícalo con tus palabras, en 3 líneas…" style="margin-top:8px">${esc(F.text || '')}</textarea>
    <details class="hn-src"><summary>Comparar con un texto que pegue yo</summary><textarea id="fyP" class="input" rows="4" placeholder="Pega aquí el texto del libro o de tus apuntes">${esc(F.paste || '')}</textarea></details>
    <div class="btn-row" style="margin-top:8px"><button class="btn primary" data-act="hn-fey">Evaluar mi explicación</button></div>
    ${F.r ? `<div class="hn-fres"><div class="hn-gpa"><div><b>${F.r.pct >= 80 ? 'Lo dominas' : F.r.pct >= 50 ? 'Vas bien, faltan piezas' : 'Hay que reforzar'}</b><small>Cubriste ${F.r.res.filter((x) => x.ok).length} de ${F.r.res.length} conceptos clave</small></div><span>${F.r.pct}%</span></div><i class="hn-bar big"><u style="width:${F.r.pct}%"></u></i>
      ${F.r.res.some((x) => !x.ok) ? `<p class="hn-kicker" style="margin-top:12px">Olvidaste mencionar</p><div class="hn-chips">${F.r.res.filter((x) => !x.ok).map((x) => `<span class="miss">${esc(x.t)}</span>`).join('')}</div>` : ''}
      ${F.r.res.some((x) => x.ok) ? `<p class="hn-kicker" style="margin-top:10px">Bien explicado</p><div class="hn-chips">${F.r.res.filter((x) => x.ok).map((x) => `<span>${esc(x.t)}</span>`).join('')}</div>` : ''}
      ${F.r.res.some((x) => !x.ok) ? `<div class="btn-row" style="margin-top:10px"><button class="btn" data-act="hn-fey-cards">Crear tarjetas de lo que faltó</button></div>` : ''}</div>` : F.empty ? '<p class="small" style="margin-top:10px">No encontré apuntes para comparar. Elige otra materia, quita el tema o pega el texto.</p>' : ''}
  </section>`;
}

/* ================= Autopsia de errores ================= */
const HN_CAUSES = {
  tiempo: ['Falta de tiempo', 'No te alcanzó el tiempo o empezaste tarde.', ['Usa la agenda ideal y empieza 3 días antes de cada entrega.', 'Haz simulacros con cronómetro: responde exámenes de práctica con tiempo límite.', 'Primero lo que vale más puntos; si te atoras más de 2 minutos, pasa a la siguiente.']],
  interp: ['Malinterpretación', 'Entendiste mal la pregunta o las instrucciones.', ['Subraya qué te piden exactamente (verbo y datos) antes de responder.', 'Reescribe la pregunta con tus palabras antes de contestar.', 'Al terminar, vuelve a leer la instrucción y revisa que respondiste eso.']],
  practica: ['Poca práctica', 'Entendías el tema, pero no hiciste suficientes ejercicios.', ['Haz 10 ejercicios variados del tema, no solo los del ejemplo.', 'Intercala tipos de problema en la misma sesión.', 'Repite los que fallaste dentro de 2 días sin ver la solución.']],
  base: ['Concepto base flojo', 'Te faltaba entender algo anterior en lo que se apoya el tema.', ['Vuelve al tema anterior y explícalo con la técnica Feynman.', 'Crea tarjetas de los conceptos base y repásalas a diario.', 'Pide al profesor o a un compañero que te lo explique de otra forma.']],
  descuido: ['Descuido o nervios', 'Sabías hacerlo pero te equivocaste por prisa, nervios o distracción.', ['Deja 5 minutos al final para revisar signos, unidades y ortografía.', 'Respira 4 segundos, sostén 4, suelta 4 antes de empezar.', 'Duerme bien la noche anterior: el cansancio multiplica los descuidos.']],
};
function hnAutoStats() { const L = HND().auto || []; const c = {}; for (const a of L) c[a.c] = (c[a.c] || 0) + 1; const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return { L, c, top: top ? top[0] : null }; }
function hnAutopsiaCard() {
  const A = hnAutoStats(); const tot = A.L.length; const mx = Math.max(1, ...Object.values(A.c));
  return `<h2 class="sec">Autopsia de errores</h2>
  <section class="hn-card"><p class="small muted" style="margin-top:0">Cada error tiene una causa. Diagnosticarla te dice qué cambiar en tu forma de estudiar.</p>
    <button class="btn primary" data-act="hn-auto-new">${icon('plus', 'sm')}Nueva autopsia</button>
    ${tot ? `<p class="hn-kicker" style="margin-top:14px">Tu diagnóstico (${tot} ${tot === 1 ? 'error analizado' : 'errores analizados'})</p><ul class="hn-bars">${Object.keys(HN_CAUSES).filter((k) => A.c[k]).sort((a, b) => A.c[b] - A.c[a]).map((k) => `<li><span>${HN_CAUSES[k][0]}</span><i><u style="width:${Math.round((A.c[k] / mx) * 100)}%;background:var(--pen)"></u></i><b>${A.c[k]}</b></li>`).join('')}</ul>
      <div class="hn-adj"><b>Ajuste a tu método: ${HN_CAUSES[A.top][0].toLowerCase()}</b><ul>${HN_CAUSES[A.top][2].map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <ul class="hn-log">${A.L.slice(-4).reverse().map((a) => `<li><time>${esc(relDay(a.d))} · ${esc(HN_CAUSES[a.c][0])}</time><p><b>${esc(a.t)}</b>${a.n ? ` — ${esc(a.n)}` : ''}</p></li>`).join('')}</ul>` : ''}
  </section>`;
}
function hnAutoSheet(pre = {}) {
  const low = S.tasks.filter((t) => t.done && t.grade != null && t.grade !== '' && +t.grade < hnGoal()).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).slice(0, 12);
  openSheet(`${sheetHead('Autopsia de un error')}<div class="sheet-body">
    ${low.length ? `<div class="field"><label for="auT">¿Qué salió mal? (o elige una entrega con baja calificación)</label><select id="auK" class="input"><option value="">Escribirlo yo</option>${low.map((t) => `<option value="${t.id}" ${pre.id === t.id ? 'selected' : ''}>${esc(t.title)} · ${esc(fmtGrade(t.grade))}</option>`).join('')}</select></div>` : ''}
    <div class="field"><label for="auT">Tema o pregunta donde fallaste</label><input id="auT" class="input" maxlength="100" value="${esc(pre.t || '')}" placeholder="Ej. Ecuaciones de segundo grado"></div>
    <p class="hn-kicker">¿Por qué fallaste?</p><div class="hn-causes">${Object.entries(HN_CAUSES).map(([k, [l, d]], i) => `<label><input type="radio" name="auC" value="${k}" ${i === 0 ? 'checked' : ''}><span><b>${l}</b><small>${d}</small></span></label>`).join('')}</div>
    <div class="field" style="margin-top:10px"><label for="auN">Nota (opcional)</label><input id="auN" class="input" maxlength="160" placeholder="Qué pasó exactamente"></div>
  </div><div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="hn-auto-save">Diagnosticar</button></div>`);
}

/* ================= Simulacro de examen con cronómetro ================= */
function hnSimPool(sid) { let c = []; try { c = ESD().cards.filter((x) => !sid || (x.sid || '') === sid); } catch { /* */ } return c.filter((x) => x.q && x.a); }
function hnSimCard() {
  const subs = S.subjects.filter((s) => !s.nb); const H = (HND().sim || []).slice(-3).reverse();
  return `<h2 class="sec">Simulacro de examen</h2>
  <section class="hn-card"><p class="small muted" style="margin-top:0">Preguntas de opción múltiple con tus propias tarjetas y tiempo límite, como en un examen real. Practicar bajo presión es de lo que más funciona.</p>
    <div class="hn-dbb"><select id="smS" class="input"><option value="">Todas las materias</option>${subs.map((s) => `<option value="${s.id}">${esc(s.name)} (${hnSimPool(s.id).length})</option>`).join('')}</select><select id="smN" class="input"><option value="5">5 preguntas</option><option value="10" selected>10 preguntas</option><option value="20">20 preguntas</option></select></div>
    <div class="btn-row" style="margin-top:8px"><button class="btn primary" data-act="hn-sim">${icon('timer', 'sm')}Empezar simulacro</button></div>
    ${H.length ? `<ul class="hn-log">${H.map((x) => `<li><time>${esc(relDay(x.d))} · ${esc(x.sid ? hnSubjName(x.sid) : 'Todas')}</time><p><b>${x.ok}/${x.n}</b> correctas · ${Math.round(x.secs / 60 * 10) / 10} min</p></li>`).join('')}</ul>` : ''}</section>`;
}
function hnSimPaint() {
  const M = HN.sim; if (!M) return; const box = document.getElementById('hnSim'); if (!box) return;
  if (M.i >= M.q.length || M.over) {
    clearInterval(M.iv); const ok = M.q.filter((x) => x.ok).length; const pct = Math.round((ok / M.q.length) * 100);
    if (!M.saved) { M.saved = 1; const d = HND(); (d.sim ||= []).push({ d: today(), sid: M.sid, n: M.q.length, ok, secs: Math.round((Date.now() - M.t0) / 1000) }); if (d.sim.length > 200) d.sim = d.sim.slice(-200); hnSave(); }
    const bad = M.q.filter((x) => !x.ok);
    box.innerHTML = `<div class="hn-done-ses"><div class="lq-ring" style="--p:${pct};margin:0 auto 8px"><b>${pct}%</b></div><b>${M.over ? 'Se acabó el tiempo' : pct >= 90 ? 'Nivel honores' : pct >= 70 ? 'Bien, casi listo' : 'Hay que repasar'}</b><p class="small muted">${ok} de ${M.q.length} correctas en ${Math.round((Date.now() - M.t0) / 6000) / 10} min.</p></div>
      ${bad.length ? `<p class="hn-kicker">Para repasar</p><ul class="hn-adjl">${bad.map((x) => `<li><b>${esc(x.c.q)}</b><br><span class="small">${esc(x.c.a)}</span></li>`).join('')}</ul><div class="btn-row" style="margin-top:10px"><button class="btn primary" data-act="hn-sim-review">Mandar las falladas a repaso</button><button class="btn" data-act="hn-auto-new">Hacer autopsia</button></div>` : ''}`;
    return;
  }
  const it = M.q[M.i]; const left = Math.max(0, Math.round((M.end - Date.now()) / 1000));
  box.innerHTML = `<div class="hn-sim-top"><span>Pregunta ${M.i + 1} de ${M.q.length}</span><b id="hnSimT" class="${left < 20 ? 'low' : ''}">${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</b></div><div class="lq-bar"><i style="width:${Math.round((M.i / M.q.length) * 100)}%"></i></div>
    <p class="hn-sim-q">${esc(it.c.q)}</p><div class="hn-sim-o">${it.o.map((o, j) => `<button type="button" data-act="hn-sim-a" data-j="${j}">${esc(o.slice(0, 220))}</button>`).join('')}</div>`;
}
function hnSimStart(sid, n) {
  const pool = hnSimPool(sid); const all = hnSimPool('');
  if (pool.length < 4 && all.length < 4) { toast('Necesitas al menos 4 tarjetas para hacer un simulacro.'); return; }
  const src = pool.length >= 1 ? pool : all; const pick = src.slice().sort(() => Math.random() - 0.5).slice(0, Math.min(n, src.length));
  const q = pick.map((c) => { const others = (pool.length >= 4 ? pool : all).filter((x) => x.id !== c.id && x.a !== c.a).sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x.a); const o = [c.a, ...others].sort(() => Math.random() - 0.5); return { c, o, k: o.indexOf(c.a), ok: false }; }).filter((x) => x.o.length >= 2);
  HN.sim = { sid, q, i: 0, t0: Date.now(), end: Date.now() + q.length * 45000, iv: 0 };
  openSheet(`${sheetHead('Simulacro de examen')}<div class="sheet-body"><div id="hnSim"></div></div><div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="sheet-close">Salir</button></div>`, () => { if (HN.sim) clearInterval(HN.sim.iv); render(); });
  hnSimPaint();
  HN.sim.iv = setInterval(() => { const M = HN.sim; if (!M || !document.getElementById('hnSim')) { clearInterval(M && M.iv); return; } const left = Math.round((M.end - Date.now()) / 1000); if (left <= 0) { M.over = true; hnSimPaint(); return; } const t = document.getElementById('hnSimT'); if (t) { t.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; t.classList.toggle('low', left < 20); } }, 1000);
}

/* ================= Calificaciones por anotar e informe del mes ================= */
const hnUngraded = () => S.tasks.filter((t) => t.done && (t.grade == null || t.grade === '') && t.doneAt && Date.now() - t.doneAt < 30 * 864e5 && !t.noGrade).sort((a, b) => b.doneAt - a.doneAt);
function hnGradesBox() {
  const L = hnUngraded().slice(0, 4); if (!L.length) return '';
  return `<h2 class="sec">Calificaciones por anotar</h2><section class="hn-card"><p class="small muted" style="margin-top:0">Anótalas en cuanto te las den: así tu promedio y tu meta de honores son exactos.</p><ul class="hn-gr">${L.map((t) => `<li><span><b>${esc(t.title)}</b><small>${esc(hnSubjName(t.subjectId))}</small></span><form class="hn-grf" data-id="${t.id}"><input class="input" inputmode="decimal" placeholder="0–${S.settings.gradeMax}" aria-label="Calificación de ${esc(t.title)}"><button class="btn" type="submit">Anotar</button></form><button type="button" class="icon-btn ghost" data-act="hn-nograde" data-id="${t.id}" aria-label="No lleva calificación" title="No lleva calificación">${icon('x', 'sm')}</button></li>`).join('')}</ul></section>`;
}
function hnReport() {
  const A = hnStats(); const G = hnGrades(); const au = hnAutoStats(); const d = HND();
  const good = A.days.filter((x) => x.s >= 70).length; const sims = (d.sim || []).filter((x) => diffDays(x.d, today()) < 30);
  const L = [`Informe de los últimos 30 días · Modo Honores`, ``, `Enfoque: ${Math.round(A.total / 6) / 10} horas${A.bestH != null ? ` (mejor hora: ${A.bestH}:00)` : ''}`, `Días de honores (70 % o más): ${good} de 30`, `Entregas hechas: ${A.done30}${A.done30 ? ` · a tiempo: ${Math.round((A.onTime / A.done30) * 100)} %` : ''}`, `Promedio: ${G.avg == null ? 'sin calificaciones' : fmtGrade(Math.round(G.avg * 10) / 10)} · meta ${fmtGrade(hnGoal())}`];
  if (G.below.length) L.push(`Materias por subir: ${G.below.map((r) => `${r.s.name} (${fmtGrade(Math.round(r.st.avg * 10) / 10)})`).join(', ')}`);
  if (sims.length) L.push(`Simulacros: ${sims.length} · promedio ${Math.round(sims.reduce((a, x) => a + x.ok / x.n, 0) / sims.length * 100)} %`);
  if (au.top) L.push(`Causa de error más común: ${HN_CAUSES[au.top][0]} → ${HN_CAUSES[au.top][2][0]}`);
  if (d.book) L.push(`Lectura: «${d.book.t}», página ${d.book.page} de ${d.book.total}`);
  return L.join('\n');
}

/* agenda ideal: clases + bloques de enfoque + lectura + descanso */
function hnAgenda() {
  const wd = new Date().getDay(); const cls = classesOn(wd); const tm = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); }; const fm = (m) => fmtTime(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  const out = cls.map((c) => ({ a: tm(c.start), b: tm(c.end), t: c.s.name, k: 'Clase', c: safeColor(c.s.color) }));
  const now = new Date(); const nowM = now.getHours() * 60 + now.getMinutes();
  let start = Math.max(nowM + 10, out.length ? Math.max(...out.map((x) => x.b)) + 60 : 16 * 60); start = Math.ceil(start / 15) * 15;
  const G = hnGrades(); const subs = (G.below.length ? G.below.map((r) => r.s) : S.subjects.filter((s) => !s.nb)).slice(0, 4);
  const tasks = S.tasks.filter((x) => !x.done).sort(sortPending);
  const doneMin = (S.focus || []).filter((f) => f.d === today()).reduce((a, f) => a + (+f.m || 0), 0); let need = Math.max(0, hnFocusGoal() - doneMin); let i = 0;
  while (need > 0 && start < 22 * 60) { const len = Math.min(50, Math.max(25, need)); const tk = tasks[i]; const s = subs[i % Math.max(1, subs.length)]; out.push({ a: start, b: start + len, t: tk ? tk.title : s ? `Estudio de ${s.name}` : 'Estudio profundo', k: 'Enfoque', c: 'var(--pen)' }); start += len; need -= len; i++; if (need > 0) { out.push({ a: start, b: start + 10, t: 'Descanso: muévete y toma agua', k: 'Pausa', c: '#9aa3ad' }); start += 10; } }
  if (start < 22 * 60) { out.push({ a: start, b: start + 20, t: HND().book ? `Leer «${HND().book.t}»` : 'Lectura', k: 'Lectura', c: '#b8860b' }); start += 20; }
  out.push({ a: Math.max(start, 22 * 60), b: Math.max(start, 22 * 60) + 30, t: 'Preparar mañana y dormir', k: 'Descanso', c: '#5a6a8a' });
  return out.sort((a, b) => a.a - b.a).map((x) => ({ ...x, at: fm(x.a), to: fm(x.b), past: x.b < nowM }));
}

/* análisis */
function hnStats() {
  const F = (S.focus || []).filter((f) => diffDays(f.d, today()) < 30); const byS = {}; const byH = new Array(24).fill(0);
  for (const f of F) { const k = f.s || '_'; byS[k] = (byS[k] || 0) + (+f.m || 0); if (f.h != null) byH[f.h] += +f.m || 0; }
  const bestH = byH.some((v) => v > 0) ? byH.indexOf(Math.max(...byH)) : null;
  const days = []; for (let i = 29; i >= 0; i--) { const iso = addDays(today(), -i); days.push({ iso, s: ((HND().days[iso] || {}).score) || 0, m: F.filter((f) => f.d === iso).reduce((a, f) => a + (+f.m || 0), 0) }); }
  const done30 = S.tasks.filter((x) => x.done && x.doneAt && Date.now() - x.doneAt < 30 * 864e5); const onTime = done30.filter((x) => !x.due || toISO(new Date(x.doneAt)) <= x.due).length;
  return { total: F.reduce((a, f) => a + (+f.m || 0), 0), byS, bestH, days, done30: done30.length, onTime };
}
const HN_ACH = [
  ['r3', 'Arranque', 'Racha de 3 días de honores', () => hnStreak() >= 3], ['r7', 'Semana perfecta', 'Racha de 7 días', () => hnStreak() >= 7], ['r30', 'Imparable', 'Racha de 30 días', () => hnStreak() >= 30],
  ['f600', 'Diez horas', '10 horas de enfoque', () => (S.focus || []).reduce((a, f) => a + (+f.m || 0), 0) >= 600], ['f3000', 'Cincuenta horas', '50 horas de enfoque', () => (S.focus || []).reduce((a, f) => a + (+f.m || 0), 0) >= 3000],
  ['reto', 'Mente ágil', 'Resolver 30 retos', () => Object.values(HND().days).reduce((a, d) => a + Object.values(d.reto || {}).filter((v) => v === true).length, 0) >= 30],
  ['diario', 'Aprendiz consciente', '15 entradas en el diario de aprendizaje', () => (HND().log || []).length >= 15], ['libro', 'Lector', 'Terminar un libro', () => (HND().books || 0) >= 1],
  ['semana', 'Estratega', '4 revisiones semanales', () => Object.values(HND().week).filter((w) => w && w.a).length >= 4], ['meta', 'Cuadro de honor', 'Promedio en la meta de honores', () => { const g = hnGrades().avg; return g != null && g >= hnGoal(); }],
  ['ses', 'Método', '10 sesiones guiadas', () => (HND().ses || 0) >= 10], ['hab', 'Cuerpo y mente', '50 hábitos cumplidos', () => Object.values(HND().days).reduce((a, d) => a + Object.values(d.hab || {}).filter(Boolean).length, 0) >= 50],
];

function viewHonores() {
  if (!honCan()) return `<div class="empty"><h3>Esta sección es solo para la cuenta de administración</h3></div>`;
  const P = hnPlan(); const G = hnGrades(); const goal = hnGoal(); const D = hnDay(); const st = hnStreak(); const name = (S.settings.name || profile()?.name || '').split(' ')[0];
  const ring = (p, big, sub) => `<div class="hn-ring" style="--p:${Math.max(0, Math.min(100, p))}"><b>${big}</b><small>${sub}</small></div>`;
  const tabs = `<div class="seg full hn-tabs" role="group">${[['hoy', 'Hoy'], ['cerebro', 'Cerebro'], ['mente', 'Mente'], ['uni', 'Uni'], ['analisis', 'Análisis'], ['metas', 'Metas']].map(([k, l]) => `<button type="button" data-act="hn-tab" data-v="${k}" aria-pressed="${HN.tab === k}">${l}</button>`).join('')}</div>`;
  const head = `<header class="hn-head"><p class="hn-kicker">Modo Honores</p><h1 class="page-title">${name ? `${esc(name)}, ` : ''}hoy cuenta</h1><p class="page-sub">${esc(cap(longDate(today())))}</p></header>`;
  let body = '';
  if (HN.tab === 'hoy') {
    const week = []; for (let i = 6; i >= 0; i--) { const iso = addDays(today(), -i); week.push({ iso, s: ((HND().days[iso] || {}).score) || 0 }); }
    const wkMin = (S.focus || []).filter((f) => diffDays(f.d, today()) < 7).reduce((a, f) => a + (+f.m || 0), 0); const N = hnNext(); const AG = hnAgenda();
    body = `<section class="hn-top">${ring(P.score, `${P.score}%`, 'día de honores')}<div class="hn-kpis"><span><b>${st}</b>${st === 1 ? 'día de racha' : 'días de racha'}</span><span><b>${Math.round(wkMin / 6) / 10} h</b>de enfoque en 7 días</span><span><b>${G.avg == null ? '—' : fmtGrade(Math.round(G.avg * 10) / 10)}</b>promedio · meta ${fmtGrade(goal)}</span></div></section>
    <div class="hn-week" aria-label="Últimos 7 días">${week.map((x) => `<i title="${esc(x.iso)}: ${x.s}%" class="${x.iso === today() ? 'td' : ''}" style="--s:${x.s}"><u></u><small>${['D', 'L', 'M', 'M', 'J', 'V', 'S'][fromISO(x.iso).getDay()]}</small></i>`).join('')}</div>
    <section class="hn-next"><p class="hn-kicker">Tu siguiente mejor acción</p><b>${esc(N.t)}</b><p>${esc(N.d)}</p>${N.b ? (N.href ? `<a class="btn primary" href="${N.href}">${esc(N.b)}</a>` : N.act ? `<button class="btn primary" data-act="${N.act}">${esc(N.b)}</button>` : `<button class="btn primary" data-act="hn-tab" data-v="${N.tab}">${esc(N.b)}</button>`) : ''}<button class="btn" data-act="hn-ses">${icon('spark', 'sm')}Sesión de estudio guiada</button></section>
    ${hnGradesBox()}
    <h2 class="sec">Plan de hoy</h2>
    <ul class="hn-plan">${P.items.map((x) => `<li class="${x.done ? 'done' : ''}">${x.act ? `<button type="button" class="hn-ck" data-act="${x.act}" data-k="${x.k}" aria-pressed="${x.done}" aria-label="Marcar ${esc(x.l)}">${icon('check', 'sm')}</button>` : `<span class="hn-ck" aria-hidden="true">${x.done ? icon('check', 'sm') : ''}</span>`}<span class="hn-tx"><b>${esc(x.l)}</b><small>${esc(x.s)}</small>${x.p != null && !x.done ? `<i class="hn-bar"><u style="width:${Math.round(x.p * 100)}%"></u></i>` : ''}</span>${x.href ? `<a class="hn-go" href="${x.href}" aria-label="Ir">${icon('chev', 'sm')}</a>` : x.k === 'reto' || x.k === 'lectura' ? `<button type="button" class="hn-go" data-act="hn-tab" data-v="mente" aria-label="Ir">${icon('chev', 'sm')}</button>` : x.k === 'semana' ? `<button type="button" class="hn-go" data-act="hn-tab" data-v="metas" aria-label="Ir">${icon('chev', 'sm')}</button>` : ''}</li>`).join('')}</ul>
    <h2 class="sec">Agenda ideal de hoy</h2>
    <ol class="hn-ag">${AG.map((x) => `<li class="${x.past ? 'past' : ''}" style="--c:${x.c}"><time>${esc(x.at)}<small>${esc(x.to)}</small></time><span><em>${esc(x.k)}</em><b>${esc(x.t)}</b></span></li>`).join('')}</ol>
    <p class="tiny faint">Se arma con tu horario de clases, tu meta de enfoque, tus pendientes y las materias que más te acercan a los honores.</p>
    <h2 class="sec">Hábitos de alto rendimiento</h2>
    <div class="hn-habs">${HN_HAB.map(([k, l]) => `<button type="button" class="hn-hab" data-act="hn-hab" data-k="${k}" aria-pressed="${!!D.hab[k]}">${icon('check', 'sm')}<span>${l}</span></button>`).join('')}</div>`;
  } else if (HN.tab === 'cerebro') { body = hnCerebroTab();
  } else if (HN.tab === 'uni') { body = typeof hnUniTab === 'function' ? hnUniTab() : '';
  } else if (HN.tab === 'mente') {
    const R = hnRetos(); const [w, wd] = hnWord(); const [ew, es, ex] = hnEn(); const bk = HND().book; const log = (HND().log || []).slice(-5).reverse();
    body = hnFeynCard() + hnSimCard() + `<h2 class="sec" id="hnReto">Gimnasio mental</h2>
    <section class="hn-card hn-reto">${R.map((q, i) => { const s = D.reto[i]; return `<div class="hn-q ${s === true ? 'ok' : s === false ? 'no' : ''}"><p>${esc(q.q)}</p>${s === true ? `<span class="hn-res">Correcto: ${q.a}</span>` : `<form class="hn-ans" data-i="${i}"><input class="input" inputmode="decimal" autocomplete="off" aria-label="Tu respuesta" placeholder="Tu respuesta"><button class="btn" type="submit">Revisar</button></form>${s === false ? '<span class="hn-res">Casi. Inténtalo otra vez.</span>' : ''}`}</div>`; }).join('')}<p class="tiny faint">Retos nuevos cada día.</p></section>
    <div class="hn-two"><section class="hn-card"><p class="hn-kicker">Palabra del día</p><b class="hn-word">${esc(w)}</b><p class="small">${esc(wd)}</p><p class="tiny faint">Úsala hoy en una conversación o en un apunte.</p></section>
    <section class="hn-card"><p class="hn-kicker">Inglés del día</p><b class="hn-word">${esc(ew)}</b><p class="small"><b>${esc(es)}</b> · <i>${esc(ex)}</i></p></section></div>
    <section class="hn-card" style="margin-top:10px"><p class="hn-kicker">Para saber más</p><p class="small" style="margin:0">${esc(hnFact())}</p></section>
    <h2 class="sec">Diario de aprendizaje</h2>
    <section class="hn-card"><p class="small muted" style="margin-top:0">Escribe lo que aprendiste hoy con tus palabras. Si usas «Concepto: explicación», cada renglón se vuelve tarjeta de repaso.</p><textarea id="hnLog" class="input" rows="4" placeholder="Fotosíntesis: las plantas convierten luz en energía…"></textarea><div class="btn-row" style="margin-top:8px"><button class="btn primary" data-act="hn-log">Guardar en mi diario</button></div>
    ${log.length ? `<ul class="hn-log">${log.map((l) => `<li><time>${esc(relDay(l.d))}</time><p>${esc(l.t)}</p></li>`).join('')}</ul>` : ''}</section>
    <h2 class="sec">Lectura</h2>
    <section class="hn-card">${bk ? (() => { const pct = Math.round((bk.page / Math.max(1, bk.total)) * 100); const dl = bk.end ? Math.max(1, diffDays(today(), bk.end)) : null; const per = dl ? Math.ceil((bk.total - bk.page) / dl) : null; return `<div class="hn-gpa"><div><b>${esc(bk.t)}</b><small>Página ${bk.page} de ${bk.total}${per && bk.page < bk.total ? ` · ${per} páginas por día para terminar ${esc(relDay(bk.end))}` : ''}</small></div><span>${pct}%</span></div><i class="hn-bar big"><u style="width:${pct}%"></u></i><div class="btn-row" style="margin-top:10px"><button class="btn primary" data-act="hn-page">Anotar página</button><button class="btn" data-act="hn-book">Cambiar libro</button></div>`; })() : `<p class="small muted" style="margin-top:0">Leer todos los días amplía tu vocabulario, tu comprensión y tu forma de pensar. Elige un libro y te ayudo a llevar el ritmo.</p><button class="btn primary" data-act="hn-book">Elegir libro</button>`}</section>`;
  } else if (HN.tab === 'analisis') {
    const A = hnStats(); const gpaPct = G.avg == null ? 0 : Math.round((G.avg / goal) * 100); const mx = Math.max(1, ...Object.values(A.byS));
    const sn = (k) => (k === '_' ? 'Sin materia' : (S.subjects.find((s) => s.id === k) || {}).name || 'Materia'); const sc = (k) => (k === '_' ? '#9aa3ad' : safeColor((S.subjects.find((s) => s.id === k) || {}).color));
    body = `<h2 class="sec">Camino a los honores</h2>
    <section class="hn-card"><div class="hn-gpa"><div><b>${G.avg == null ? 'Sin calificaciones aún' : `Promedio ${fmtGrade(Math.round(G.avg * 10) / 10)}`}</b><small>Meta de honores: ${fmtGrade(goal)} · <button type="button" class="link-btn" data-act="hn-goal">cambiar</button></small></div><span>${G.avg == null ? '' : `${Math.min(100, gpaPct)}%`}</span></div><i class="hn-bar big"><u style="width:${Math.min(100, gpaPct)}%"></u></i>
      ${G.avg == null ? '<p class="small muted">Anota la calificación de cada entrega al terminarla (y cuánto vale, si lo sabes) para ver tu promedio real y qué necesitas en cada materia.</p>' : `<ul class="hn-subs">${G.rows.filter((r) => r.st.avg != null).sort((a, b) => a.st.avg - b.st.avg).map((r) => `<li><a href="#/materia/${r.s.id}"><i style="background:${safeColor(r.s.color)}"></i><span><b>${esc(r.s.name)}</b><small>${r.st.avg < goal ? esc(neededText(r.st.avg, r.st.evaluated, goal)) : 'En la meta. Mantén el ritmo.'}</small></span><em class="${r.st.avg < goal ? '' : 'ok'}">${fmtGrade(Math.round(r.st.avg * 10) / 10)}</em></a></li>`).join('')}</ul>`}
    </section>
    ${hnAutopsiaCard()}
    <h2 class="sec">Últimos 30 días</h2><div class="btn-row" style="margin:-4px 0 10px"><button class="btn" data-act="hn-report">Compartir informe del mes</button></div>
    <div class="hn-kgrid"><span><b>${Math.round(A.total / 6) / 10} h</b>de enfoque</span><span><b>${A.done30}</b>entregas hechas</span><span><b>${A.done30 ? Math.round((A.onTime / A.done30) * 100) + '%' : '—'}</b>a tiempo</span><span><b>${A.bestH == null ? '—' : `${A.bestH}:00`}</b>tu mejor hora</span></div>
    <section class="hn-card"><p class="hn-kicker">Constancia</p><div class="hn-heat">${A.days.map((x) => `<i title="${esc(x.iso)} · ${x.s}% · ${x.m} min" style="--s:${Math.max(x.s, Math.min(100, x.m))}" class="${x.iso === today() ? 'td' : ''}"></i>`).join('')}</div><p class="tiny faint" style="margin-bottom:0">Cada cuadro es un día: más oscuro, mejor día.</p></section>
    <section class="hn-card"><p class="hn-kicker">Horas por materia</p>${Object.keys(A.byS).length ? `<ul class="hn-bars">${Object.entries(A.byS).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<li><span>${esc(sn(k))}</span><i><u style="width:${Math.round((v / mx) * 100)}%;background:${sc(k)}"></u></i><b>${Math.round(v / 6) / 10} h</b></li>`).join('')}</ul>` : '<p class="small muted" style="margin:0">Usa el temporizador de Enfoque eligiendo la tarea o materia y aquí verás a qué le dedicas tu tiempo.</p>'}</section>
    ${A.bestH != null ? `<p class="small" style="margin:4px 2px 0">Rindes más alrededor de las <b>${A.bestH}:00</b>. Guarda esa hora para lo más difícil.</p>` : ''}
    <h2 class="sec">Logros</h2>
    <div class="hn-ach">${HN_ACH.map(([id, n, d, f]) => { let ok = false; try { ok = f(); } catch { /* */ } return `<div class="${ok ? 'on' : ''}"><span>${ok ? icon('star', 'sm') : icon('lock', 'sm')}</span><b>${n}</b><small>${d}</small></div>`; }).join('')}</div>`;
  } else {
    const wk = HND().week[hnMonday(today())] || {}; const M = HND().miles || {}; const gd = HND().grad || '';
    const left = gd ? diffDays(today(), gd) : null;
    body = `<h2 class="sec">Meta: graduarme con honores</h2>
    <section class="hn-card"><div class="hn-gpa"><div><b>${gd ? (left >= 0 ? `Faltan ${left} días` : 'Fecha cumplida') : 'Pon la fecha de tu graduación'}</b><small>${gd ? esc(cap(longDate(gd))) : 'Para ver tu cuenta regresiva'}</small></div><button class="btn" data-act="hn-grad">${gd ? 'Cambiar' : 'Poner fecha'}</button></div>
    <ul class="hn-miles">${HN_MILES.map((m, i) => `<li><button type="button" class="hn-ck" data-act="hn-mile" data-i="${i}" aria-pressed="${!!M[i]}" aria-label="Marcar">${icon('check', 'sm')}</button><span class="${M[i] ? 'dn' : ''}">${esc(m)}</span></li>`).join('')}</ul></section>
    <h2 class="sec" id="hnWeek">Revisión semanal</h2>
    <section class="hn-card"><div class="field"><label for="hnW1">¿Qué salió bien esta semana?</label><textarea id="hnW1" class="input" rows="2">${esc(wk.a || '')}</textarea></div><div class="field"><label for="hnW2">¿Qué me frenó y cómo lo evito?</label><textarea id="hnW2" class="input" rows="2">${esc(wk.b || '')}</textarea></div><div class="field"><label for="hnW3">Mis 3 prioridades de la próxima semana</label><textarea id="hnW3" class="input" rows="2">${esc(wk.c || '')}</textarea></div><button class="btn primary" data-act="hn-week-save">Guardar revisión</button></section>
    <h2 class="sec">Técnicas que sí funcionan</h2>
    <div class="hn-tech">${HN_TECH.map(([t, d, h, b]) => `<article><b>${t}</b><p>${d}</p><a class="link-btn" href="${h}">${b}</a></article>`).join('')}</div>
    <h2 class="sec">Todas tus herramientas</h2>
    <div class="hn-tools">${HN_TOOLS.map(([k, ic, l]) => `<a href="#/${k}">${icon(ic)}<span>${l}</span></a>`).join('')}</div>
    <div class="hn-foot"><button class="btn quiet" data-act="hn-settings">${icon('gear', 'sm')}Meta de enfoque diario</button><button class="btn quiet" data-act="hn-goal">${icon('star', 'sm')}Meta de promedio</button><button class="btn quiet" data-act="hn-toggle">Salir del modo Honores</button></div>`;
  }
  return head + tabs + body;
}

/* sesión de estudio guiada: recuerdo activo → comparar → Feynman → tarjetas */
function hnSesSheet() {
  const s = HN.ses; const subs = S.subjects.filter((x) => !x.nb);
  const steps = ['Tema', 'Recuerda', 'Compara', 'Explica', 'Listo'];
  const bar = `<div class="hn-steps">${steps.map((l, i) => `<span class="${i === s.step ? 'on' : i < s.step ? 'ok' : ''}">${l}</span>`).join('')}</div>`;
  let b = '', f = '';
  if (s.step === 0) { b = `<p class="small muted">Elige qué vas a estudiar. Son unos 15 a 20 minutos con las técnicas que más funcionan.</p><div class="field"><label for="hsS">Materia</label><select id="hsS" class="input"><option value="">General</option>${subs.map((x) => `<option value="${x.id}" ${s.sid === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div><div class="field"><label for="hsT">Tema</label><input id="hsT" class="input" value="${esc(s.topic || '')}" placeholder="Ej. La célula" maxlength="80"></div>`; f = `<button class="btn primary" data-act="hn-ses-next">Empezar</button>`; }
  else if (s.step === 1) { b = `<p class="small"><b>Recuerdo activo.</b> Sin ver tus apuntes, escribe todo lo que sepas de <b>${esc(s.topic)}</b>. No importa si es poco: el esfuerzo de recordar es lo que te hace aprender.</p><textarea id="hsR" class="input" rows="7" placeholder="Todo lo que recuerdes…">${esc(s.recall || '')}</textarea>`; f = `<button class="btn primary" data-act="hn-ses-next">Ya, a comparar</button>`; }
  else if (s.step === 2) { b = `<p class="small"><b>Compara.</b> Abre tus apuntes o el libro y anota lo que te faltó o tenías mal. Eso es exactamente lo que necesitas repasar.</p><textarea id="hsG" class="input" rows="6" placeholder="Lo que me faltó…">${esc(s.gaps || '')}</textarea>`; f = `<button class="btn primary" data-act="hn-ses-next">Siguiente</button>`; }
  else if (s.step === 3) { b = `<p class="small"><b>Técnica Feynman.</b> Explica ${esc(s.topic)} como si se lo enseñaras a alguien de 12 años, con palabras sencillas. Si puedes, escribe conceptos como «Concepto: explicación»: se volverán tarjetas de repaso.</p><textarea id="hsF" class="input" rows="7" placeholder="Explicado fácil…">${esc(s.feyn || '')}</textarea>`; f = `<button class="btn primary" data-act="hn-ses-next">Terminar</button>`; }
  else { b = `<div class="hn-done-ses"><b>Sesión completa</b><p class="small muted">${s.cards ? `Se crearon ${s.cards} tarjetas de repaso. ` : ''}Lo guardé en tu diario de aprendizaje. Repasa en 1, 3 y 7 días para no olvidarlo.</p></div>${s.ev && s.ev.res.length ? `<div class="hn-fres"><div class="hn-gpa"><div><b>Tu explicación cubrió ${s.ev.pct}%</b><small>comparada con tus apuntes</small></div></div>${s.ev.res.some((x) => !x.ok) ? `<p class="hn-kicker" style="margin-top:10px">Te faltó mencionar</p><div class="hn-chips">${s.ev.res.filter((x) => !x.ok).map((x) => `<span class="miss">${esc(x.t)}</span>`).join('')}</div>` : '<p class="small">No olvidaste ningún concepto clave.</p>'}</div>` : ''}`; f = `<a class="btn" href="#/tarjetas" data-act="sheet-close">Ver tarjetas</a><button class="btn primary" data-act="sheet-close">Listo</button>`; }
  const html = `${sheetHead('Sesión de estudio guiada')}<div class="sheet-body">${bar}${b}</div><div class="sheet-foot">${s.step > 0 && s.step < 4 ? '<button class="btn" data-act="hn-ses-back">Atrás</button>' : ''}<span class="grow"></span>${f}</div>`;
  openSheet(html);
}

/* ---------- Más: interruptor y filtro ---------- */
{
  const baseMas = viewMas;
  viewMas = function () {
    let h = baseMas(); if (!honCan()) return h;
    if (honOn()) h = h.replace(/<li>(?:(?!<\/li>)[\s\S])*?href="#\/([a-z]+)[^"]*"(?:(?!<\/li>)[\s\S])*?<\/li>/g, (m, k) => (HN_ALLOWED.includes(k) ? m : ''));
    const card = `<section class="hn-switch ${honOn() ? 'on' : ''}"><div><b>Modo Honores</b><small>${honOn() ? 'Activo: sin juegos ni distracciones, con todas tus herramientas de estudio.' : 'Un modo sin distracciones con todas tus herramientas y un plan diario para graduarte con honores.'}</small></div><button type="button" class="btn ${honOn() ? '' : 'primary'}" data-act="hn-toggle">${honOn() ? 'Salir' : 'Activar'}</button></section>`;
    return h.replace(/(<\/h1>(?:\s*<p class="page-sub">[\s\S]*?<\/p>)?)/, `$1${card}`);
  };
}

/* en modo Honores el progreso del árbol sigue contando, pero sin ventanas ni confeti que interrumpan */
{ const baseLv = levelUp; levelUp = function (level) { if (honOn()) { try { Snd.chime(); } catch { /* */ } toast(`Tu árbol subió al nivel ${level}.`); return; } return baseLv.apply(this, arguments); }; }

/* ---------- acciones ---------- */
Object.assign(EXTRA_VIEWS, { honores: viewHonores }); EXTRA_NAV.honores = 'honores';
Object.assign(VIDA_ACTS, {
  'hn-sim': () => { hnSimStart($('#smS')?.value || '', +($('#smN')?.value || 10)); },
  'hn-sim-a': (el) => { const M = HN.sim; if (!M || M.lock) return; const it = M.q[M.i]; const j = +el.dataset.j; it.ok = j === it.k; M.lock = true; const bs = document.querySelectorAll('.hn-sim-o button'); bs.forEach((b, i) => { b.disabled = true; if (i === it.k) b.classList.add('ok'); else if (i === j) b.classList.add('no'); }); try { it.ok ? Snd.tick?.() : null; } catch { /* */ } setTimeout(() => { M.lock = false; M.i++; hnSimPaint(); }, it.ok ? 450 : 1100); },
  'hn-sim-review': () => { const M = HN.sim; if (!M) return; const ids = new Set(M.q.filter((x) => !x.ok).map((x) => x.c.id)); try { const d = ESD(); for (const c of d.cards) if (ids.has(c.id)) { c.box = 1; c.due = today(); } esSave(); } catch { /* */ } toast('Listas para repasar hoy en Tarjetas.'); },
  'hn-nograde': (el) => { commit((s) => { const t = s.tasks.find((x) => x.id === el.dataset.id); if (t) t.noGrade = true; }); },
  'hn-report': async () => { const t = hnReport(); try { if (navigator.share) { await navigator.share({ text: t }); return; } } catch { return; } try { await navigator.clipboard.writeText(t); toast('Informe copiado.'); } catch { toast('No se pudo copiar.'); } },
  'hn-ib': (el) => {
    const d = HND(); const it = (d.inbox || []).find((x) => x.id === el.dataset.id); if (!it) return; const v = el.dataset.v;
    if (v === 'task') { commit((s) => { s.tasks.push({ id: uid(), title: it.t.slice(0, 120), subjectId: null, type: 'tarea', due: null, time: '', priority: 2, value: null, estimate: 0, desc: '', steps: [], delivery: '', links: '', done: false, doneAt: null, grade: null, created: Date.now() }); }); toast('Ahora es una tarea.'); }
    else if (v === 'note') { hnZK().push({ id: 'zk' + uid().replace(/[^a-z0-9]/gi, '').slice(-9), t: it.t.slice(0, 60), b: it.t, sid: '', at: Date.now(), up: Date.now() }); toast('Ahora es una nota enlazable.'); }
    else if (v === 'card') { const m = it.t.match(/^([^:：]{2,80})[:：]\s*(.+)$/); if (m) { try { esAddCards([{ q: m[1].trim(), a: m[2].trim(), sid: '' }]); } catch { /* */ } toast('Ahora es una tarjeta de repaso.'); } }
    d.inbox = (d.inbox || []).filter((x) => x.id !== it.id); hnSave(); render();
  },
  'hn-zk-new': () => hnZkSheet(),
  'hn-zk-open': (el) => { const n = hnZK().find((x) => x.id === el.dataset.id); if (n) hnZkSheet(n); },
  'hn-zk-go': (el) => { const t = el.dataset.t; const n = hnZFind(t); if (n) hnZkSheet(n); else hnZkSheet(null), setTimeout(() => { const i = $('#zkT'); if (i) i.value = t; }, 30); },
  'hn-zk-save': (el) => { const t = ($('#zkT')?.value || '').trim(); const b = ($('#zkB')?.value || '').trim(); if (!t) { toast('Ponle un título.'); return; } const dup = hnZK().find((x) => x.id !== el.dataset.id && hnNorm(x.t) === hnNorm(t)); if (dup) { toast('Ya tienes una nota con ese título.'); return; } const L = hnZK(); const i = L.findIndex((x) => x.id === el.dataset.id); const n = { id: el.dataset.id, t, b, sid: $('#zkS')?.value || '', at: i >= 0 ? L[i].at : Date.now(), up: Date.now() }; if (i >= 0) L[i] = n; else L.push(n); hnSave(); closeSheet(false); render(); },
  'hn-zk-del': async (el) => { if (!(await ask({ title: '¿Borrar esta nota?', ok: 'Borrar', danger: true }))) return; const d = HND(); d.zk = hnZK().filter((x) => x.id !== el.dataset.id); hnSave(); closeSheet(false); render(); },
  'hn-exp-md': () => { const md = hnZK().map((n) => `# ${n.t}\n\nMateria: ${hnSubjName(n.sid)}\n\n${n.b}\n`).join('\n---\n\n'); hnDL(`segundo-cerebro-${today()}.md`, md, 'text/markdown'); },
  'hn-exp-csv': () => { const q = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`; const rows = [['Entrega', 'Materia', 'Fecha', 'Estado', 'Calificación', 'Valor %'].map(q).join(','), ...S.tasks.map((t) => [t.title, hnSubjName(t.subjectId), t.due || '', t.done ? 'Hecha' : 'Pendiente', t.grade ?? '', t.value ?? ''].map(q).join(','))]; hnDL(`entregas-${today()}.csv`, rows.join('\n'), 'text/csv'); },
  'hn-fey': () => { const F = (HN.fey = { sid: $('#fyS')?.value || '', topic: ($('#fyT')?.value || '').trim(), text: ($('#fyX')?.value || '').trim(), paste: ($('#fyP')?.value || '').trim() }); if (F.text.length < 10) { toast('Escribe tu explicación primero (unas 3 líneas).'); return; } const src = F.paste || hnSubjText(F.sid, F.topic); if (src.trim().length < 40) { F.empty = true; F.r = null; render(); return; } F.r = hnFeynEval(F.text, src); F.empty = false; const d = HND(); d.fey = (d.fey || 0) + 1; hnSave(); render(); setTimeout(() => document.querySelector('.hn-fres')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); },
  'hn-fey-cards': () => { const F = HN.fey; if (!F || !F.r) return; const src = F.paste || hnSubjText(F.sid, F.topic); const lines = src.split('\n'); const miss = F.r.res.filter((x) => !x.ok); let n = 0; try { n = esAddCards(miss.map((x) => { const k = hnNorm(x.t); const l = lines.find((ln) => hnNorm(ln).includes(k.slice(0, 5)) && ln.length > x.t.length + 8) || ''; return { q: `¿Qué es o qué significa «${x.t}»?`, a: (l.trim() || 'Búscalo en tus apuntes y escribe la respuesta.').slice(0, 400), sid: F.sid }; })); } catch { /* */ } toast(n ? `${n} tarjetas nuevas de lo que faltó.` : 'Esas tarjetas ya existían.'); },
  'hn-auto-new': () => hnAutoSheet(),
  'hn-auto-save': () => {
    const tid = $('#auK')?.value || ''; const tk = tid ? S.tasks.find((x) => x.id === tid) : null; const t = (($('#auT')?.value || '').trim()) || (tk ? tk.title : ''); if (!t) { toast('Escribe el tema o elige una entrega.'); return; }
    const c = document.querySelector('input[name="auC"]:checked')?.value || 'base'; const d = HND(); (d.auto ||= []).push({ id: uid(), d: today(), t, c, n: ($('#auN')?.value || '').trim(), tid: tk ? tk.id : '', sid: tk ? tk.subjectId : '' }); hnSave();
    const C = HN_CAUSES[c]; HN.autoLast = { t, c, sid: tk ? tk.subjectId : '' };
    openSheet(`${sheetHead('Diagnóstico')}<div class="sheet-body"><p class="hn-kicker">${esc(C[0])}</p><b class="hn-word" style="font-size:19px">${esc(t)}</b><p class="small" style="margin-top:10px"><b>Ajusta tu método así:</b></p><ul class="hn-adjl">${C[2].map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="sheet-foot">${c === 'practica' || c === 'tiempo' ? '<button class="btn" data-act="hn-auto-task">Agendar práctica para mañana</button>' : ''}${c === 'base' || c === 'interp' ? '<button class="btn" data-act="hn-auto-ses">Sesión guiada del tema</button>' : ''}<span class="grow"></span><button class="btn primary" data-act="sheet-close">Entendido</button></div>`, () => render());
  },
  'hn-auto-task': () => { const A = HN.autoLast; if (!A) return; commit((s) => { s.tasks.push({ id: uid(), title: `Práctica: 10 ejercicios de ${A.t}`.slice(0, 120), subjectId: A.sid || null, type: 'tarea', due: addDays(today(), 1), time: '', priority: 2, value: null, estimate: 0, desc: 'Viene de tu autopsia de errores. Hazlos con cronómetro y sin ver las soluciones.', steps: [], delivery: '', links: '', done: false, doneAt: null, grade: null, created: Date.now() }); }); closeSheet(false); toast('Agendado para mañana.'); },
  'hn-auto-ses': () => { const A = HN.autoLast; closeSheet(false); HN.ses = { step: 0, sid: (A && A.sid) || '', topic: (A && A.t) || '' }; setTimeout(hnSesSheet, 60); },
  'hn-tab': (el) => { HN.tab = el.dataset.v || 'hoy'; render(); window.scrollTo(0, 0); },
  'hn-ses': () => { HN.ses = { step: 0, sid: '', topic: '' }; hnSesSheet(); },
  'hn-ses-back': () => { if (HN.ses) { HN.ses.step = Math.max(0, HN.ses.step - 1); hnSesSheet(); } },
  'hn-ses-next': () => {
    const s = HN.ses; if (!s) return; const v = (id) => ($('#' + id)?.value || '').trim();
    if (s.step === 0) { s.sid = v('hsS'); s.topic = v('hsT'); if (!s.topic) { toast('Escribe el tema.'); return; } }
    else if (s.step === 1) { s.recall = v('hsR'); if (!s.recall) { toast('Escribe al menos una idea: el esfuerzo de recordar es lo que cuenta.'); return; } }
    else if (s.step === 2) s.gaps = v('hsG');
    else if (s.step === 3) {
      s.feyn = v('hsF'); if (!s.feyn) { toast('Explícalo con tus palabras, aunque sea breve.'); return; }
      const lines = `${s.feyn}\n${s.gaps || ''}`.split('\n').map((l) => l.match(/^\s*[-•*]?\s*([^:：]{2,60})[:：]\s+(.{3,})$/)).filter(Boolean);
      let n = 0; try { n = esAddCards(lines.map((m) => ({ q: m[1].trim(), a: m[2].trim().slice(0, 400), sid: s.sid }))); } catch { /* */ }
      s.cards = n; { const src = `${hnSubjText(s.sid, s.topic)}\n${s.gaps || ''}`; s.ev = src.trim().length > 40 ? hnFeynEval(s.feyn, src) : null; } const d = HND(); (d.log ||= []).push({ d: today(), t: `${s.topic}: ${s.feyn}`.slice(0, 600), s: s.sid }); if (d.log.length > 400) d.log = d.log.slice(-400); d.ses = (d.ses || 0) + 1; hnSave(); try { Snd.chime?.(); } catch { /* */ }
    }
    s.step++; hnSesSheet(); if (s.step === 4) render();
  },
  'hn-log': () => {
    const t = ($('#hnLog')?.value || '').trim(); if (!t) { toast('Escribe lo que aprendiste hoy.'); return; }
    const d = HND(); (d.log ||= []).push({ d: today(), t: t.slice(0, 1200) }); if (d.log.length > 400) d.log = d.log.slice(-400);
    let n = 0; try { n = esAddCards(t.split('\n').map((l) => l.match(/^\s*[-•*]?\s*([^:：]{2,60})[:：]\s+(.{3,})$/)).filter(Boolean).map((m) => ({ q: m[1].trim(), a: m[2].trim().slice(0, 400), sid: '' }))); } catch { /* */ }
    hnSave(); toast(n ? `Guardado. ${n} ${n === 1 ? 'tarjeta nueva' : 'tarjetas nuevas'} para repasar.` : 'Guardado en tu diario.'); render();
  },
  'hn-grad': async () => { const v = await ask({ title: 'Fecha de graduación', input: { type: 'date', value: HND().grad || addDays(today(), 365) }, ok: 'Guardar' }); if (!v) return; HND().grad = String(v); hnSave(); render(); },
  'hn-mile': (el) => { const d = HND(); d.miles ||= {}; const i = el.dataset.i; d.miles[i] = !d.miles[i]; hnSave(); render(); },
  'hn-toggle': () => { if (!honCan()) return; const on = !honOn(); commit((s) => { s.settings.honores = on; }); honApply(); navMode = null; setNav(false); location.hash = on ? '#/honores' : '#/hoy'; toast(on ? 'Modo Honores activado. A estudiar sin distracciones.' : 'Modo Honores desactivado.'); },
  'hn-check': (el) => { const D = hnDay(); D.plan[el.dataset.k] = !D.plan[el.dataset.k]; hnSave(); Snd.tick?.(); render(); },
  'hn-hab': (el) => { const D = hnDay(); D.hab[el.dataset.k] = !D.hab[el.dataset.k]; hnSave(); Snd.tick?.(); render(); },
  'hn-jump': (el) => { setTimeout(() => document.getElementById(el.dataset.v)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); },
  'hn-goal': async () => { const max = S.settings.gradeMax; const v = await ask({ title: 'Meta de honores', text: `Promedio que quieres lograr (máximo ${max}).`, input: { type: 'number', value: String(hnGoal()) }, ok: 'Guardar' }); if (v == null || v === '') return; const n = Math.max(0, Math.min(max, +String(v).replace(',', '.'))); if (!Number.isFinite(n)) return; commit((s) => { s.settings.honGoal = n; }); },
  'hn-settings': async () => { const v = await ask({ title: 'Minutos de enfoque al día', text: 'Meta diaria de estudio profundo con el temporizador de Enfoque.', input: { type: 'number', value: String(hnFocusGoal()) }, ok: 'Guardar' }); if (v == null || v === '') return; const n = Math.max(15, Math.min(600, Math.round(+v))); if (Number.isFinite(n)) commit((s) => { s.settings.honFocus = n; }); },
  'hn-book': () => { const b = HND().book || {}; openSheet(`${sheetHead('Mi libro')}<div class="sheet-body"><div class="field"><label for="hnBT">Título</label><input id="hnBT" class="input" value="${esc(b.t || '')}" maxlength="80"></div><div class="field"><label for="hnBP">Páginas totales</label><input id="hnBP" class="input" type="number" min="1" value="${b.total || ''}"></div><div class="field"><label for="hnBA">Voy en la página</label><input id="hnBA" class="input" type="number" min="0" value="${b.page || 0}"></div><div class="field"><label for="hnBE">Quiero terminarlo el</label><input id="hnBE" class="input" type="date" value="${b.end || addDays(today(), 30)}"></div></div><div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="hn-book-save">Guardar</button></div>`); },
  'hn-book-save': () => { const t = ($('#hnBT').value || '').trim(); const total = Math.max(1, Math.round(+$('#hnBP').value || 0)); if (!t || !(+$('#hnBP').value > 0)) { toast('Escribe el título y las páginas.'); return; } HND().book = { t, total, page: Math.max(0, Math.min(total, Math.round(+$('#hnBA').value || 0))), end: $('#hnBE').value || '' }; hnSave(); closeSheet(false); render(); },
  'hn-page': async () => { const b = HND().book; if (!b) return; const v = await ask({ title: '¿En qué página vas?', input: { type: 'number', value: String(b.page) }, ok: 'Guardar' }); if (v == null || v === '') return; const n = Math.max(0, Math.min(b.total, Math.round(+v))); if (!Number.isFinite(n)) return; const D = hnDay(); if (n > b.page) D.plan.lectura = true; b.page = n; hnSave(); if (n >= b.total && !b.fin) { b.fin = 1; HND().books = (HND().books || 0) + 1; toast('Libro terminado. Excelente.'); } render(); },
  'hn-week-save': () => { HND().week[hnMonday(today())] = { a: $('#hnW1').value.trim(), b: $('#hnW2').value.trim(), c: $('#hnW3').value.trim(), at: Date.now() }; hnSave(); toast('Revisión guardada.'); render(); },
});
document.addEventListener('submit', (e) => {
  const gf = e.target.closest && e.target.closest('.hn-grf'); if (gf) { e.preventDefault(); const v = +String(gf.querySelector('input').value || '').replace(',', '.'); const max = S.settings.gradeMax; if (!(v >= 0 && v <= max) || gf.querySelector('input').value.trim() === '') { toast(`Escribe una calificación de 0 a ${max}.`); return; } commit((s) => { const t = s.tasks.find((x) => x.id === gf.dataset.id); if (t) t.grade = v; }); toast('Calificación anotada.'); return; }
  const cp = e.target.closest && e.target.closest('.hn-cap'); if (cp) { e.preventDefault(); const i = cp.querySelector('input'); const v = (i.value || '').trim(); if (!v) return; const d = HND(); (d.inbox ||= []).push({ id: uid(), t: v.slice(0, 300), at: Date.now() }); hnSave(); i.value = ''; render(); setTimeout(() => $('#hnCap')?.focus(), 30); return; }
  const f = e.target.closest && e.target.closest('.hn-ans'); if (!f) return; e.preventDefault();
  const i = +f.dataset.i; const v = (f.querySelector('input').value || '').trim().replace(',', '.'); if (!v) return;
  const q = hnRetos()[i]; const D = hnDay(); D.reto[i] = Math.abs(+v - q.a) < 1e-9; hnSave(); try { D.reto[i] ? Snd.chime?.() : Snd.tick?.(); } catch { /* */ } render();
});
setTimeout(() => { try { honApply(); if (honOn()) { navMode = null; setNav(false); } } catch { /* */ } }, 0);
document.addEventListener('change', (e) => { const t = e.target; if (t.classList && t.classList.contains('hn-dbf')) { HN.db[t.dataset.f] = t.value; render(); } });
document.addEventListener('input', (e) => { if (e.target.id !== 'hnZq') return; HN.zq = e.target.value; const q = hnNorm(e.target.value.trim()); let n = 0; document.querySelectorAll('#hnZk li').forEach((li) => { const ok = !q || (li.dataset.q || '').includes(q); li.hidden = !ok; if (ok) n++; }); const z = document.querySelector('.hn-znone'); if (z) z.hidden = n > 0; });
