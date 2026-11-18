/* Cinnavia 8.6 — Modo Honores · «Uni»: rumbo al examen de admisión (UNAM, IPN, EXANI-II u otro).
   · Meta (examen, carrera, fecha, aciertos), plan semanal según los días que faltan y el área más débil.
   · Práctica cronometrada por área: Matemáticas (generadas al momento, infinitas), Ortografía y redacción, e Inglés.
   · Fórmulas de bolsillo de bachillerato. Todo funciona en el teléfono, sin conexión. */
'use strict';
const HU = () => { const d = HND(); d.uni ||= { exam: '', career: '', date: '', goal: 0, st: {} }; d.uni.st ||= {}; return d.uni; };
const HU_EXAMS = [['unam', 'UNAM'], ['ipn', 'IPN'], ['exani', 'EXANI-II (Ceneval)'], ['otro', 'Otro']];
const HU_AREAS = { mate: ['Pensamiento matemático', 60], orto: ['Ortografía y redacción', 30], ingles: ['Inglés', 30] };

/* ---------- Matemáticas: preguntas generadas con respuesta calculada ---------- */
function huRi(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function huOpts(ans, alts, fmt = (x) => String(x)) { const set = new Set([fmt(ans)]); for (const a of alts) { if (set.size >= 4) break; const v = fmt(a); if (v !== fmt(ans) && !/NaN|Infinity/.test(v)) set.add(v); } let k = 1; while (set.size < 4) { set.add(fmt(typeof ans === 'number' ? ans + k * (k % 2 ? 1 : -1) * Math.max(1, Math.round(Math.abs(ans) * 0.1)) : ans + k)); k++; } const o = [...set].sort(() => Math.random() - 0.5); return { o, k: o.indexOf(fmt(ans)) }; }
const HU_MATH = [
  () => { const p = [5, 10, 12, 15, 20, 25, 30, 40, 75][huRi(0, 8)], y = huRi(2, 40) * 20; const a = (p * y) / 100; return { q: `¿Cuánto es el ${p} % de ${y}?`, ...huOpts(a, [a * 2, a / 2, a + 10, y - a, (p * y) / 10]) }; },
  () => { const a = huRi(2, 9), x = huRi(-6, 12), b = huRi(-15, 15); const c = a * x + b; return { q: `Resuelve: ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${c}`, ...huOpts(x, [x + 1, x - 1, -x, (c + b) / a, c - b], (v) => `x = ${Number.isInteger(v) ? v : v.toFixed(2)}`) }; },
  () => { const k = huRi(2, 6), p = huRi(3, 15), m = huRi(k + 1, 12); return { q: `Si ${k} kg de manzana cuestan $${p * k}, ¿cuánto cuestan ${m} kg?`, ...huOpts(p * m, [p * m + p, p * (m - 1), p * k + m, p * k * m]) }; },
  () => { const r = huRi(2, 10); const A = Math.round(3.14 * r * r * 100) / 100; return { q: `Área de un círculo de radio ${r} cm (usa π = 3.14).`, ...huOpts(A, [Math.round(2 * 3.14 * r * 100) / 100, Math.round(3.14 * r * 100) / 100, Math.round(3.14 * 2 * r * 2 * r * 100) / 100, r * r], (v) => `${v} cm²`) }; },
  () => { const a = huRi(3, 12), b = huRi(4, 12); const tr = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]][huRi(0, 5)]; void a; void b; return { q: `Un triángulo rectángulo tiene catetos de ${tr[0]} y ${tr[1]}. ¿Cuánto mide la hipotenusa?`, ...huOpts(tr[2], [tr[0] + tr[1], tr[2] + 1, tr[2] - 1, Math.abs(tr[1] - tr[0])]) }; },
  () => { const n = [huRi(5, 10), huRi(5, 10), huRi(5, 10), huRi(5, 10)]; const s = n.reduce((a, b) => a + b, 0); const ext = (4 * Math.ceil(s / 4)) - s; n[3] += ext; const m = n.reduce((a, b) => a + b, 0) / 4; return { q: `¿Cuál es el promedio de ${n.join(', ')}?`, ...huOpts(m, [m + 1, m - 1, m + 0.5, n.reduce((a, b) => a + b, 0)]) }; },
  () => { const b = huRi(2, 5), e = huRi(2, 4), f = huRi(1, 3); return { q: `¿Cuánto es ${b}^${e} · ${b}^${f}? (pista: suma los exponentes)`, ...huOpts(b ** (e + f), [b ** (e * f), (b * 2) ** (e + f), b ** (e + f) + b, b ** e + b ** f], (v) => String(v)) }; },
  () => { const b = huRi(2, 7), d = huRi(2, 7), a = huRi(1, b - 1), c = huRi(1, d - 1); const num = a * d + c * b, den = b * d; const g = (x, y) => (y ? g(y, x % y) : x); const k = g(num, den); const fr = (n, m) => { const q = g(n, m); return m / q === 1 ? String(n / q) : `${n / q}/${m / q}`; }; return { q: `Suma las fracciones: ${a}/${b} + ${c}/${d}`, o: null, ...(() => { const ans = fr(num, den); const alts = [fr(a + c, b + d), fr(a * c, b * d), fr(num + 1, den), fr(a * d + c, den)]; const set = new Set([ans]); for (const x of alts) if (set.size < 4) set.add(x); let z = 2; while (set.size < 4) { set.add(fr(num + z, den)); z++; } const o = [...set].sort(() => Math.random() - 0.5); void k; return { o, k: o.indexOf(ans) }; })() }; },
  () => { const x = huRi(1, 8), y = huRi(1, 8); const s = x + y, d = x - y; return { q: `Si x + y = ${s} y x − y = ${d}, ¿cuánto vale x?`, ...huOpts(x, [y, s, d, x + 1]) }; },
  () => { const c = huRi(10, 50) * 100, i = [2, 3, 4, 5, 6, 8, 10][huRi(0, 6)], t = huRi(1, 4); const I = (c * i * t) / 100; return { q: `Interés simple: $${c.toLocaleString('es-MX')} al ${i} % anual durante ${t} ${t === 1 ? 'año' : 'años'}. ¿Cuánto interés genera?`, ...huOpts(I, [I * 2, I / t, c + I, (c * i) / 10])  }; },
  () => { const a = huRi(2, 20), r = huRi(2, 9); const s = [a, a + r, a + 2 * r, a + 3 * r]; return { q: `¿Qué número sigue? ${s.join(', ')}, …`, ...huOpts(a + 4 * r, [a + 5 * r, a + 3 * r + 1, a * 2 + r, a + 4 * r + r]) }; },
  () => { const v = huRi(4, 30) * 5, t = huRi(2, 6); return { q: `Un auto va a ${v} km/h constantes. ¿Qué distancia recorre en ${t} horas?`, ...huOpts(v * t, [v + t, v * (t + 1), v / t, v * t / 2], (x) => `${x} km`) }; },
];
const huMathQ = () => { for (let i = 0; i < 6; i++) { const q = HU_MATH[huRi(0, HU_MATH.length - 1)](); if (q.o && q.o.length === 4 && q.k >= 0) return { q: q.q, o: q.o, k: q.k }; } return { q: '¿Cuánto es 12 × 12?', ...huOpts(144, [124, 142, 154]) }; };

/* ---------- Ortografía y redacción ---------- */
const HU_ORTO = [
  ['¿____ llegaste tarde?', ['Por qué', 'Porque', 'Porqué', 'Por que'], 0], ['No fui ____ estaba enfermo.', ['porque', 'por qué', 'porqué', 'por que'], 0], ['No entiendo el ____ de su decisión.', ['porqué', 'porque', 'por qué', 'por que'], 0],
  ['Voy ____ estudiar en la tarde.', ['a', 'ha', 'ah', 'há'], 0], ['Ella ____ terminado su proyecto.', ['ha', 'a', 'ah', 'há'], 0], ['Tiene que ____ más voluntarios.', ['haber', 'a ver', 'aver', 'haver'], 0], ['Vamos ____ qué dice el maestro.', ['a ver', 'haber', 'aver', 'haver'], 0],
  ['Ojalá ____ aprobado todos.', ['hayan', 'hallan', 'allan', 'ayan'], 0], ['No ____ mis llaves por ningún lado.', ['hallo', 'hayo', 'allo', 'ayo'], 0], ['Mi abuela ____ un pastel delicioso.', ['hizo', 'izo', 'hiso', 'iso'], 0],
  ['Ayer ____ un examen difícil.', ['tuve', 'tube', 'tuvé', 'tubé'], 0], ['Se rompió el ____ del lavabo.', ['tubo', 'tuvo', 'tuvó', 'tubó'], 0], ['____ de menos a mi familia.', ['Echo', 'Hecho', 'Eco', 'Écho'], 0], ['Ya he ____ toda la tarea.', ['hecho', 'echo', 'hechó', 'echó'], 0],
  ['____ quieres, te ayudo con matemáticas.', ['Si', 'Sí', 'Sì', 'Cí'], 0], ['Me preguntó y le dije que ____.', ['sí', 'si', 'sì', 'cí'], 0], ['¿____ también vienes al taller?', ['Tú', 'Tu', 'Tù', 'Tuu'], 0], ['____ cuaderno está en mi mochila.', ['Tu', 'Tú', 'Tù', 'Tuu'], 0],
  ['____ llegó temprano a la clase.', ['Él', 'El', 'Èl', 'Hél'], 0], ['Necesito ____ tiempo para terminar.', ['más', 'mas', 'màs', 'maz'], 0], ['No lo ____, pregúntale al profesor.', ['sé', 'se', 'sè', 'ze'], 0], ['¿Quieres un ____ caliente?', ['té', 'te', 'tè', 'thé'], 0],
  ['____ no han publicado las calificaciones.', ['Aún', 'Aun', 'Haún', 'Aùn'], 0], ['Elige la palabra bien escrita:', ['examen', 'exámen', 'exsamen', 'egzamen'], 0], ['Elige la palabra bien escrita:', ['exámenes', 'examenes', 'exámenez', 'exsámenes'], 0],
  ['Elige la palabra bien escrita:', ['canción', 'cancion', 'canciòn', 'cansión'], 0], ['Elige la palabra bien escrita:', ['dieciséis', 'dieciseis', 'diesiséis', 'diez y seis'], 0], ['Elige la palabra bien escrita:', ['ningún', 'ningun', 'nungún', 'ningúm'], 0],
  ['Elige la palabra bien escrita:', ['también', 'tambien', 'tanbién', 'tambièn'], 0], ['Elige la palabra bien escrita:', ['adolescente', 'adolecente', 'adolesente', 'adoslecente'], 0], ['Elige la palabra bien escrita:', ['excepción', 'exepción', 'excepsión', 'eccepción'], 0],
  ['Elige la palabra bien escrita:', ['conciencia', 'consiencia', 'conscienzia', 'conciensia'], 0], ['Elige la palabra bien escrita:', ['vaya (del verbo ir)', 'valla (del verbo ir)', 'baya (del verbo ir)', 'balla (del verbo ir)'], 0],
  ['¿Qué oración está bien puntuada?', ['Sin embargo, no estudió lo suficiente.', 'Sin embargo no, estudió lo suficiente.', 'Sin, embargo no estudió lo suficiente.', 'Sin embargo no estudió, lo suficiente.'], 0],
  ['¿Qué oración es correcta?', ['Hubo muchos alumnos en la feria.', 'Hubieron muchos alumnos en la feria.', 'Habían muchos alumnos en la feria.', 'Hubieran muchos alumnos en la feria.'], 0],
  ['¿Qué oración es correcta?', ['Pienso que llegará tarde.', 'Pienso de que llegará tarde.', 'Pienso que de llegará tarde.', 'Pienso en que llegará tarde.'], 0],
  ['¿Qué oración es correcta?', ['Me acuerdo de que tenía examen.', 'Me acuerdo que de tenía examen.', 'Me acuerdo en que tenía examen.', 'Me acuerdo de qué tenía examen.'], 0],
];
const HU_ENG = [
  ['She ____ to school every day.', ['goes', 'go', 'going', 'gone'], 0], ['I ____ a student.', ['am', 'is', 'are', 'be'], 0], ['They ____ playing soccer now.', ['are', 'is', 'am', 'be'], 0], ['Yesterday I ____ to the library.', ['went', 'go', 'gone', 'goes'], 0],
  ['There ____ two books on the table.', ['are', 'is', 'am', 'be'], 0], ['He doesn\'t ____ coffee.', ['like', 'likes', 'liked', 'liking'], 0], ['I have lived here ____ 2020.', ['since', 'for', 'during', 'from'], 0], ['This test is ____ than the last one.', ['easier', 'more easy', 'easyer', 'most easy'], 0],
  ['If it rains, we ____ at home.', ['will stay', 'stayed', 'would stayed', 'stays'], 0], ['She has ____ finished her homework.', ['already', 'yet', 'still', 'ever'], 0], ['What does "achieve" mean?', ['lograr', 'perder', 'empezar', 'olvidar'], 0], ['What does "deadline" mean?', ['fecha límite', 'línea muerta', 'descanso', 'calificación'], 0],
  ['What does "knowledge" mean?', ['conocimiento', 'rodilla', 'noticia', 'nudo'], 0], ['What does "improve" mean?', ['mejorar', 'imprimir', 'probar', 'importar'], 0], ['What does "although" mean?', ['aunque', 'siempre', 'también', 'todavía'], 0], ['What does "however" mean?', ['sin embargo', 'como sea', 'cuando', 'cómo'], 0],
  ['What does "schedule" mean?', ['horario', 'escuela', 'escala', 'regla'], 0], ['What does "achievement" mean?', ['logro', 'cadena', 'reto', 'meta'], 0], ['Choose the correct question:', ['Where do you live?', 'Where you live?', 'Where does you live?', 'Where living you?'], 0], ['Choose the correct sentence:', ['He can swim very well.', 'He can swims very well.', 'He cans swim very well.', 'He can to swim very well.'], 0],
];
const huBank = (L) => { const [q, o, k] = L[huRi(0, L.length - 1)]; const ans = o[k]; const oo = [...new Set(o)].sort(() => Math.random() - 0.5); return { q, o: oo, k: oo.indexOf(ans) }; };
function huQuestions(area, n) { const out = []; const seen = new Set(); let guard = 0; while (out.length < n && guard++ < n * 20) { const q = area === 'mate' ? huMathQ() : huBank(area === 'orto' ? HU_ORTO : HU_ENG); const key = q.q + q.o.join(); if (seen.has(key)) continue; seen.add(key); out.push(q); } return out; }

/* ---------- Fórmulas de bolsillo ---------- */
const HU_FORM = [
  ['Álgebra', ['(a + b)² = a² + 2ab + b²', '(a − b)² = a² − 2ab + b²', '(a + b)(a − b) = a² − b²', 'Fórmula general: x = (−b ± √(b² − 4ac)) / 2a', 'Pendiente: m = (y₂ − y₁) / (x₂ − x₁)', 'Recta: y = mx + b', 'aᵐ · aⁿ = aᵐ⁺ⁿ · aᵐ / aⁿ = aᵐ⁻ⁿ · (aᵐ)ⁿ = aᵐⁿ']],
  ['Geometría', ['Círculo: A = πr² · perímetro = 2πr', 'Triángulo: A = b·h / 2', 'Pitágoras: c² = a² + b²', 'Trapecio: A = (B + b)·h / 2', 'Cilindro: V = πr²h', 'Esfera: V = 4/3 πr³ · A = 4πr²', 'Ángulos interiores de un polígono: 180°(n − 2)']],
  ['Trigonometría', ['sen θ = cateto opuesto / hipotenusa', 'cos θ = cateto adyacente / hipotenusa', 'tan θ = cateto opuesto / cateto adyacente', 'sen²θ + cos²θ = 1', 'Ley de senos: a/sen A = b/sen B = c/sen C', 'Ley de cosenos: c² = a² + b² − 2ab·cos C']],
  ['Física', ['Velocidad: v = d / t', 'MRUA: v = v₀ + at', 'MRUA: d = v₀t + ½at²', 'MRUA: v² = v₀² + 2ad', '2.ª ley de Newton: F = m·a', 'Peso: P = m·g (g ≈ 9.81 m/s²)', 'Trabajo: W = F·d · Potencia: P = W / t', 'Energía cinética: Ec = ½mv² · potencial: Ep = mgh', 'Ley de Ohm: V = I·R', 'Densidad: ρ = m / V · Presión: P = F / A']],
  ['Química', ['Moles: n = m / M (masa / masa molar)', 'Número de Avogadro: 6.022 × 10²³', 'Molaridad: M = moles de soluto / litros de solución', 'Gases ideales: PV = nRT (R = 0.082 atm·L / mol·K)', 'pH = −log [H⁺] · pH < 7 ácido, 7 neutro, > 7 básico']],
  ['Estadística y finanzas', ['Media: suma de los datos / número de datos', 'Mediana: el dato del centro (ordenados)', 'Moda: el dato que más se repite', 'Porcentaje: (parte / total) × 100', 'Interés simple: I = C · i · t', 'Probabilidad: casos favorables / casos posibles']],
];

/* ---------- vista ---------- */
function hnUniTab() {
  const U = HU(); const left = U.date ? diffDays(today(), U.date) : null; const wk = left != null ? Math.max(0, Math.ceil(left / 7)) : null;
  const acc = (a) => { const s = U.st[a]; return s && s.n ? Math.round((s.ok / s.n) * 100) : null; };
  const areas = Object.keys(HU_AREAS); const weak = areas.filter((a) => acc(a) != null).sort((a, b) => acc(a) - acc(b))[0] || 'mate';
  const plan = wk == null ? '' : left < 0 ? '<p class="small">La fecha del examen ya pasó. Actualízala si tienes otro intento.</p>' : `<ul class="hn-adjl">${[
    `${left} días para tu examen: estudia al menos ${left > 90 ? '45' : left > 30 ? '60' : '90'} minutos diarios de preparación.`,
    `Esta semana, prioridad: ${HU_AREAS[weak][0]}${acc(weak) != null ? ` (vas en ${acc(weak)} %)` : ''}.`,
    left > 21 ? 'Alterna áreas cada día (intercalado) y haz un simulacro completo cada domingo.' : 'Últimas semanas: simulacros diarios con cronómetro y repaso solo de lo que fallas.',
    'Lee 20 minutos diarios cualquier texto: la comprensión lectora pesa mucho en casi todos los exámenes.',
    left <= 7 ? 'La última semana: nada de temas nuevos, duerme 8 horas y repasa fórmulas y tarjetas.' : 'Cada error que tengas, hazle autopsia: así no lo repites el día del examen.',
  ].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return `<h2 class="sec">Rumbo a la universidad</h2>
  <section class="hn-card">${U.exam ? `<div class="hn-gpa"><div><b>${esc((HU_EXAMS.find((e) => e[0] === U.exam) || [0, 'Examen'])[1])}${U.career ? ` · ${esc(U.career)}` : ''}</b><small>${U.date ? esc(cap(longDate(U.date))) : 'Sin fecha'}${U.goal ? ` · meta: ${U.goal} aciertos` : ''}</small></div>${left != null && left >= 0 ? `<span class="es-cd" style="width:62px;height:62px"><b>${left}</b><small>${left === 1 ? 'día' : 'días'}</small></span>` : ''}</div>
    <p class="hn-kicker" style="margin-top:14px">Tu plan</p>${plan}<div class="btn-row" style="margin-top:10px"><button class="btn quiet" data-act="hu-setup">Cambiar meta</button></div>`
    : `<p class="small muted" style="margin-top:0">Elige tu examen de admisión, tu carrera y la fecha. Te armo un plan y practicamos por áreas con cronómetro.</p><button class="btn primary" data-act="hu-setup">Poner mi meta</button>`}</section>
  <h2 class="sec">Práctica por área</h2>
  <div class="hu-areas">${areas.map((a) => { const p = acc(a); const s = U.st[a] || { n: 0 }; return `<article><b>${HU_AREAS[a][0]}</b><small>${s.n ? `${p} % de aciertos · ${s.n} preguntas` : 'Aún sin practicar'}</small><i class="hn-bar"><u style="width:${p || 0}%"></u></i><div class="btn-row"><button class="btn primary" data-act="hu-quiz" data-a="${a}" data-n="10">10 preguntas</button><button class="btn" data-act="hu-quiz" data-a="${a}" data-n="25">25</button></div></article>`; }).join('')}</div>
  <p class="tiny faint">Matemáticas se generan al momento: nunca se acaban. Ortografía e inglés vienen de un banco fijo y se combinan al azar. Comprensión lectora: practícala leyendo 20 minutos al día y haciendo el Feynman de lo que leas.</p>
  <h2 class="sec">Fórmulas de bolsillo</h2>
  <div class="hu-form">${HU_FORM.map(([t, L]) => `<details><summary>${t}</summary><ul>${L.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>`).join('')}</div>`;
}

/* ---------- cuestionario cronometrado ---------- */
function huPaint() {
  const M = HN.qz; const box = document.getElementById('huQz'); if (!M || !box) return;
  if (M.i >= M.q.length || M.over) {
    clearInterval(M.iv); const ok = M.q.filter((x) => x.ok).length; const pct = Math.round((ok / M.q.length) * 100);
    if (!M.saved) { M.saved = 1; const U = HU(); const s = (U.st[M.a] ||= { n: 0, ok: 0 }); const done = M.q.filter((x) => x.done); s.n += done.length; s.ok += done.filter((x) => x.ok).length; hnSave(); }
    const bad = M.q.filter((x) => x.done && !x.ok);
    box.innerHTML = `<div class="hn-done-ses"><div class="lq-ring" style="--p:${pct};margin:0 auto 8px"><b>${pct}%</b></div><b>${M.over ? 'Se acabó el tiempo' : pct >= 90 ? 'Nivel honores' : pct >= 70 ? 'Bien, sigue así' : 'A practicar más esta área'}</b><p class="small muted">${ok} de ${M.q.length} correctas en ${Math.round((Date.now() - M.t0) / 6000) / 10} min.</p></div>${bad.length ? `<p class="hn-kicker">Revisa estas</p><ul class="hn-adjl">${bad.map((x) => `<li>${esc(x.q)}<br><b class="small">${esc(x.o[x.k])}</b></li>`).join('')}</ul>` : ''}<div class="btn-row" style="margin-top:10px"><button class="btn primary" data-act="hu-quiz" data-a="${M.a}" data-n="${M.q.length}">Otra ronda</button>${bad.length ? '<button class="btn" data-act="hn-auto-new">Hacer autopsia</button>' : ''}</div>`;
    return;
  }
  const it = M.q[M.i]; const left = Math.max(0, Math.round((M.end - Date.now()) / 1000));
  box.innerHTML = `<div class="hn-sim-top"><span>${esc(HU_AREAS[M.a][0])} · ${M.i + 1} de ${M.q.length}</span><b id="huT" class="${left < 20 ? 'low' : ''}">${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</b></div><div class="lq-bar"><i style="width:${Math.round((M.i / M.q.length) * 100)}%"></i></div><p class="hn-sim-q">${esc(it.q)}</p><div class="hn-sim-o">${it.o.map((o, j) => `<button type="button" data-act="hu-a" data-j="${j}">${esc(o)}</button>`).join('')}</div>`;
}
function huStart(a, n) {
  if (HN.qz) clearInterval(HN.qz.iv);
  const q = huQuestions(a, n); HN.qz = { a, q, i: 0, t0: Date.now(), end: Date.now() + q.length * HU_AREAS[a][1] * 1000, iv: 0 };
  openSheet(`${sheetHead('Práctica de admisión')}<div class="sheet-body"><div id="huQz"></div></div><div class="sheet-foot"><span class="grow"></span><button class="btn" data-act="sheet-close">Salir</button></div>`, () => { if (HN.qz) { clearInterval(HN.qz.iv); if (!HN.qz.saved && HN.qz.q.some((x) => x.done)) { HN.qz.over = true; HN.qz.saved = 1; const U = HU(); const s = (U.st[HN.qz.a] ||= { n: 0, ok: 0 }); const d = HN.qz.q.filter((x) => x.done); s.n += d.length; s.ok += d.filter((x) => x.ok).length; hnSave(); } } render(); });
  huPaint();
  HN.qz.iv = setInterval(() => { const M = HN.qz; if (!M || !document.getElementById('huQz')) { clearInterval(M && M.iv); return; } if (M.saved) { clearInterval(M.iv); return; } const left = Math.round((M.end - Date.now()) / 1000); if (left <= 0) { M.over = true; huPaint(); return; } const t = document.getElementById('huT'); if (t) { t.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; t.classList.toggle('low', left < 20); } }, 1000);
}
Object.assign(VIDA_ACTS, {
  'hu-quiz': (el) => huStart(el.dataset.a, +el.dataset.n || 10),
  'hu-a': (el) => { const M = HN.qz; if (!M || M.lock) return; const it = M.q[M.i]; const j = +el.dataset.j; it.done = true; it.ok = j === it.k; M.lock = true; document.querySelectorAll('.hn-sim-o button').forEach((b, i) => { b.disabled = true; if (i === it.k) b.classList.add('ok'); else if (i === j) b.classList.add('no'); }); setTimeout(() => { M.lock = false; M.i++; huPaint(); }, it.ok ? 450 : 1200); },
  'hu-setup': () => { const U = HU(); openSheet(`${sheetHead('Mi meta de admisión')}<div class="sheet-body"><div class="field"><label for="huE">Examen</label><select id="huE" class="input">${HU_EXAMS.map(([k, l]) => `<option value="${k}" ${U.exam === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div><div class="field"><label for="huC">Carrera que quiero</label><input id="huC" class="input" maxlength="60" value="${esc(U.career || '')}" placeholder="Ej. Mercadotecnia"></div><div class="field"><label for="huD">Fecha del examen</label><input id="huD" class="input" type="date" value="${U.date || addDays(today(), 120)}"></div><div class="field"><label for="huG">Aciertos que quiero sacar (opcional)</label><input id="huG" class="input" type="number" min="0" max="200" value="${U.goal || ''}"></div><p class="tiny faint">Revisa la fecha y los aciertos mínimos en la convocatoria oficial de tu examen: cambian cada año.</p></div><div class="sheet-foot"><button class="btn" data-act="sheet-close">Cancelar</button><span class="grow"></span><button class="btn primary" data-act="hu-save">Guardar</button></div>`); },
  'hu-save': () => { const U = HU(); U.exam = $('#huE').value; U.career = ($('#huC').value || '').trim(); U.date = $('#huD').value || ''; U.goal = Math.max(0, Math.round(+$('#huG').value || 0)); hnSave(); closeSheet(false); render(); },
});
