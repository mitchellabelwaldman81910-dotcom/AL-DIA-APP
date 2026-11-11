/* Cinnavia 7.25 — Calculadora inteligente (científica, porcentajes, ecuaciones, estadística, finanzas)
   y generador de gráficas para apuntes, el pizarrón personal y el pizarrón del Bosque. Todo en el teléfono. */
'use strict';
/* ---------- Motor de expresiones (sin eval) ---------- */
const CL = { tab: 'calc', deg: true, ans: 0, hist: [], expr: '' };
try { CL.hist = JSON.parse(localStorage.getItem('cn-calc-hist') || '[]').slice(0, 30); } catch { CL.hist = []; }
function clNormalize(s) {
  return String(s).toLowerCase().replace(/ /g, ' ')
    .replace(/raíz cuadrada de|raiz cuadrada de|raíz de|raiz de|√/g, ' sqrt ').replace(/raíz cúbica de|raiz cubica de/g, ' cbrt ')
    .replace(/elevado al cuadrado|al cuadrado/g, '^2').replace(/elevado al cubo|al cubo/g, '^3').replace(/elevado a la|elevado a|a la potencia de/g, '^')
    .replace(/[×·]/g, '*').replace(/[÷:]/g, '/').replace(/[−–—]/g, '-').replace(/π/g, ' pi ').replace(/\bpor\b/g, '*').replace(/\bentre\b|\bdividido (?:entre|por)\b/g, '/')
    .replace(/\bmás\b|\bmas\b/g, '+').replace(/\bmenos\b/g, '-').replace(/\bmódulo\b|\bresto\b/g, ' mod ').replace(/(\d)\s*x\s*(?=[\d(])/g, '$1*').replace(/(\d),(\d)/g, '$1.$2').replace(/\bpor ciento\b|\bpor cien\b/g, '%')
    .replace(/(\d)\s+(?=\d{3}\b)/g, '$1');
}
function clTokens(src) {
  const s = clNormalize(src); const out = []; let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) { let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++; if (s[j] === 'e' && /[-+]?\d/.test(s.slice(j + 1, j + 3)) && !/[a-z]/.test(s[j + 2] || '')) { j++; if (/[-+]/.test(s[j])) j++; while (/\d/.test(s[j] || '')) j++; } const n = parseFloat(s.slice(i, j)); if (isNaN(n)) throw new Error('Número no válido'); out.push({ t: 'n', v: n }); i = j; continue; }
    if (/[a-záéíóúñ]/.test(ch)) { let j = i; while (j < s.length && /[a-záéíóúñ0-9_]/.test(s[j])) j++; out.push({ t: 'id', v: s.slice(i, j) }); i = j; continue; }
    if ('+-*/^()!%,;'.includes(ch)) { out.push({ t: ch }); i++; continue; }
    throw new Error(`No entiendo «${ch}»`);
  }
  return out;
}
const CL_FN = {
  sqrt: Math.sqrt, raiz: Math.sqrt, cbrt: Math.cbrt, abs: Math.abs, exp: Math.exp, ln: Math.log, log: Math.log10, log10: Math.log10, log2: Math.log2, round: Math.round, floor: Math.floor, ceil: Math.ceil, redondear: Math.round,
  sin: null, cos: null, tan: null, sen: null, asin: null, acos: null, atan: null, fact: null, min: null, max: null, sign: Math.sign,
};
function clFact(n) { if (n < 0 || Math.abs(n - Math.round(n)) > 1e-9) { if (n < 0) throw new Error('Factorial de negativo'); return Math.exp(clGamma(n + 1)); } if (n > 170) throw new Error('Número demasiado grande'); let r = 1; for (let i = 2; i <= Math.round(n); i++) r *= i; return r; }
function clGamma(z) { const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7]; if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - clGamma(1 - z); z -= 1; let x = c[0]; for (let i = 1; i < g + 2; i++) x += c[i] / (z + i); const t = z + g + 0.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x); }
function clEval(src, deg = CL.deg, ans = CL.ans) {
  const tk = clTokens(src); let p = 0; const peek = () => tk[p], eat = (t) => (tk[p] && tk[p].t === t ? tk[p++] : null);
  const toR = (x) => (deg ? (x * Math.PI) / 180 : x), fromR = (x) => (deg ? (x * 180) / Math.PI : x);
  const FN = { ...CL_FN, sin: (x) => { const r = toR(x); return deg && Math.abs(x % 180) < 1e-12 ? 0 : Math.sin(r); }, sen: (x) => FN.sin(x), cos: (x) => (deg && Math.abs((x - 90) % 180) < 1e-12 ? 0 : Math.cos(toR(x))), tan: (x) => { if (deg && Math.abs((x - 90) % 180) < 1e-12) throw new Error('Tangente no definida'); return deg && Math.abs(x % 180) < 1e-12 ? 0 : Math.tan(toR(x)); }, asin: (x) => fromR(Math.asin(x)), acos: (x) => fromR(Math.acos(x)), atan: (x) => fromR(Math.atan(x)), fact: clFact };
  const CONST = { pi: Math.PI, e: Math.E, tau: 2 * Math.PI, phi: (1 + Math.sqrt(5)) / 2, ans };
  const num = (x) => ({ v: x, pct: false });
  function expr() {
    let a = term();
    for (;;) {
      if (eat('+')) { const b = term(); a = b.pct ? num(a.v * (1 + b.v)) : num(a.v + b.v); }
      else if (peek() && peek().t === '-' ) { p++; const b = term(); a = b.pct ? num(a.v * (1 - b.v)) : num(a.v - b.v); }
      else return a;
    }
  }
  function term() {
    let a = power();
    for (;;) {
      const t = peek(); if (!t) return a;
      if (t.t === '*') { p++; const b = power(); a = num(a.v * (b.pct ? b.v : b.v)); }
      else if (t.t === '/') { p++; const b = power(); if (b.v === 0) throw new Error('No se puede dividir entre cero'); a = num(a.v / b.v); }
      else if (t.t === 'id' && (t.v === 'de' || t.v === 'of')) { p++; const b = power(); a = num(a.v * b.v); }
      else if (t.t === 'id' && t.v === 'mod') { p++; const b = power(); if (b.v === 0) throw new Error('Módulo cero'); a = num(a.v % b.v); }
      else if (t.t === 'n' || t.t === '(' || (t.t === 'id' && t.v !== 'de' && t.v !== 'of' && t.v !== 'mod')) { const b = power(); a = num(a.v * b.v); }
      else return a;
    }
  }
  function power() { return unary(); }
  function unary() { if (eat('-')) { const a = unary(); return { v: -a.v, pct: a.pct }; } if (eat('+')) return unary(); const a = post(); if (eat('^')) { const b = unary(); return num(Math.pow(a.v, b.v)); } return a; }
  function post() {
    let a = atom();
    for (;;) { if (eat('!')) a = num(clFact(a.v)); else if (peek() && peek().t === '%') { p++; a = { v: a.v / 100, pct: true }; } else return a; }
  }
  function atom() {
    const t = tk[p++]; if (!t) throw new Error('Falta un número');
    if (t.t === 'n') return num(t.v);
    if (t.t === '(') { const a = expr(); if (!eat(')')) throw new Error('Falta cerrar un paréntesis'); return a; }
    if (t.t === 'id') {
      if (t.v in CONST) return num(CONST[t.v]);
      if (t.v in FN) {
        let args = [];
        if (eat('(')) { if (!eat(')')) { do { args.push(expr().v); } while (eat(',') || eat(';')); if (!eat(')')) throw new Error('Falta cerrar un paréntesis'); } }
        else args = [power().v];
        if (t.v === 'min') return num(Math.min(...args)); if (t.v === 'max') return num(Math.max(...args));
        if (args.length === 0) throw new Error(`«${t.v}» necesita un número`);
        const r = FN[t.v](args[0]); if (typeof r !== 'number' || isNaN(r)) throw new Error('Resultado no válido'); return num(r);
      }
      throw new Error(`No conozco «${t.v}»`);
    }
    throw new Error('Expresión incompleta');
  }
  const r = expr(); if (p < tk.length) throw new Error('Sobra algo en la expresión'); if (!isFinite(r.v)) throw new Error('Resultado demasiado grande'); return r.v;
}
function clFmt(x, max = 10) {
  if (x === null || x === undefined || isNaN(x)) return '—'; if (!isFinite(x)) return x > 0 ? '∞' : '−∞';
  const z = parseFloat(x.toPrecision(12)); if (Math.abs(z) >= 1e15 || (Math.abs(z) < 1e-7 && z !== 0)) return z.toExponential(6).replace(/\.?0+e/, 'e').replace('e+', ' × 10^').replace('e-', ' × 10^-');
  return z.toLocaleString('es-MX', { maximumFractionDigits: max });
}
const clNum = (id) => { const v = document.getElementById(id)?.value ?? ''; const s = String(v).replace(/\s/g, '').replace(',', '.'); return s === '' ? NaN : +s; };
const clOk = (...xs) => xs.every((x) => typeof x === 'number' && isFinite(x));

/* ---------- Pantallas ---------- */
const CL_TABS = [['calc', 'Calculadora'], ['pct', 'Porcentajes'], ['ecu', 'Ecuaciones'], ['est', 'Estadística'], ['fin', 'Finanzas'], ['graf', 'Gráficas']];
function viewCalculadora() {
  const tabs = `<div class="cl-tabs" role="tablist">${CL_TABS.map(([k, l]) => `<button type="button" role="tab" class="chip ${CL.tab === k ? 'on' : ''}" aria-selected="${CL.tab === k}" data-act="cl-tab" data-v="${k}">${l}</button>`).join('')}</div>`;
  const body = { calc: clCalcHTML, pct: clPctHTML, ecu: clEcuHTML, est: clEstHTML, fin: clFinHTML, graf: chPanelHTML }[CL.tab]();
  setTimeout(() => { if (CL.tab === 'calc') clLive(); else if (CL.tab === 'graf') chDraw(); else clRunTab(); }, 0);
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Calculadora</h1>
    <p class="page-sub">Escribe como hablas: «15% de 240», «raíz de 81», «200 + 16%». También resuelve ecuaciones, promedios, finanzas y hace gráficas.</p>${tabs}<div class="cl-body">${body}</div>`;
}
EXTRA_VIEWS.calculadora = viewCalculadora; EXTRA_NAV.calculadora = 'mas'; GROUP_VIEWS.calculadora = viewCalculadora; GROUP_NAV.calculadora = 'mas';
function clCalcHTML() {
  const K = (l, v, c = '') => `<button type="button" class="cl-k ${c}" data-act="cl-key" data-v="${esc(v)}">${l}</button>`;
  return `<div class="card cl-screen"><input id="clIn" class="cl-in-main" inputmode="decimal" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ej. 15% de 240 + raíz de 81" value="${esc(CL.expr)}" aria-label="Operación"><output id="clOut" class="cl-out" aria-live="polite"></output><span id="clMsg" class="cl-msg small"></span></div>
    <div class="cl-fn">${['sin(', 'cos(', 'tan(', 'ln(', 'log(', 'sqrt(', 'abs(', 'fact(', 'pi', 'e'].map((f) => K(f.replace('sqrt', '√').replace('pi', 'π'), f, 'fn')).join('')}
      <button type="button" class="cl-k fn" data-act="cl-deg" aria-pressed="${CL.deg}">${CL.deg ? 'DEG' : 'RAD'}</button></div>
    <div class="cl-pad">${[K('C', 'C', 'ac'), K('(', '('), K(')', ')'), K('÷', '/', 'op'), K('7', '7'), K('8', '8'), K('9', '9'), K('×', '*', 'op'), K('4', '4'), K('5', '5'), K('6', '6'), K('−', '-', 'op'), K('1', '1'), K('2', '2'), K('3', '3'), K('+', '+', 'op'), K('0', '0'), K('.', '.'), K('⌫', 'B'), K('=', '=', 'eq'), K('xʸ', '^', 'op'), K('%', '%', 'op'), K('x²', '^2', 'op'), K('ANS', 'ans', 'op')].join('')}</div>
    <div class="cl-hist"><div class="cl-hist-h"><b>Historial</b>${CL.hist.length ? '<button type="button" class="link-btn" data-act="cl-clear">Borrar</button>' : ''}</div>${CL.hist.length ? CL.hist.map((h, i) => `<button type="button" class="cl-h" data-act="cl-use" data-i="${i}"><span>${esc(h.e)}</span><b>= ${esc(h.r)}</b></button>`).join('') : '<p class="small muted" style="margin:6px 0 0">Aquí aparecen tus operaciones. Toca una para reutilizarla.</p>'}</div>`;
}
function clLive() {
  const inp = document.getElementById('clIn'), out = document.getElementById('clOut'), msg = document.getElementById('clMsg'); if (!inp || !out) return; CL.expr = inp.value;
  if (!inp.value.trim()) { out.textContent = ''; msg.textContent = ''; return; }
  try { const v = clEval(inp.value); out.textContent = '= ' + clFmt(v); out.dataset.v = v; msg.textContent = ''; }
  catch (e) { out.textContent = ''; out.dataset.v = ''; msg.textContent = /Falta|incompleta/.test(e.message) ? '' : e.message; }
}
function clCommit() {
  const inp = document.getElementById('clIn'); if (!inp || !inp.value.trim()) return; let v;
  try { v = clEval(inp.value); } catch (e) { toast(e.message); return; }
  CL.ans = v; const r = clFmt(v); CL.hist.unshift({ e: inp.value.trim(), r, v }); CL.hist = CL.hist.slice(0, 30); try { localStorage.setItem('cn-calc-hist', JSON.stringify(CL.hist)); } catch { /* */ }
  CL.expr = String(parseFloat(v.toPrecision(12))); Snd.tick(); render();
}
const clField = (id, label, ph = '', val, attrs = '') => `<div class="field"><label for="${id}">${label}</label><input id="${id}" class="input cl-i" inputmode="decimal" autocomplete="off" placeholder="${ph}" value="${esc(val === undefined ? ph : val)}" ${attrs}></div>`;
const clRes = (id) => `<div class="cl-res" id="${id}" aria-live="polite"></div>`;
function clPctHTML() {
  return `<div class="card cl-sec"><h3>¿Cuánto es el X % de Y?</h3><div class="cl-row">${clField('p1a', 'Porcentaje (%)', '15')}${clField('p1b', 'De', '240')}</div>${clRes('p1r')}</div>
    <div class="card cl-sec"><h3>¿Qué porcentaje es X de Y?</h3><div class="cl-row">${clField('p2a', 'Cantidad', '18')}${clField('p2b', 'Total', '60')}</div>${clRes('p2r')}</div>
    <div class="card cl-sec"><h3>Cambio porcentual</h3><div class="cl-row">${clField('p3a', 'Antes', '80')}${clField('p3b', 'Después', '100')}</div>${clRes('p3r')}</div>
    <div class="card cl-sec"><h3>Aumento o descuento</h3><div class="cl-row">${clField('p4a', 'Precio', '500')}${clField('p4b', '% (usa − para descuento)', '-20')}</div>${clRes('p4r')}</div>
    <div class="card cl-sec"><h3>Precio original (antes del descuento)</h3><div class="cl-row">${clField('p5a', 'Precio final', '400')}${clField('p5b', 'Descuento (%)', '20')}</div>${clRes('p5r')}</div>
    <div class="card cl-sec"><h3>Propina y cuenta dividida</h3><div class="cl-row">${clField('p6a', 'Cuenta', '850')}${clField('p6b', 'Propina (%)', '10')}${clField('p6c', 'Personas', '4')}</div>${clRes('p6r')}</div>`;
}
function clEcuHTML() {
  return `<div class="card cl-sec"><h3>Ecuación de 2.º grado <small>ax² + bx + c = 0</small></h3><div class="cl-row">${clField('e1a', 'a', '1')}${clField('e1b', 'b', '-5')}${clField('e1c', 'c', '6')}</div>${clRes('e1r')}</div>
    <div class="card cl-sec"><h3>Ecuación lineal <small>ax + b = c</small></h3><div class="cl-row">${clField('e2a', 'a', '3')}${clField('e2b', 'b', '4')}${clField('e2c', 'c', '19')}</div>${clRes('e2r')}</div>
    <div class="card cl-sec"><h3>Sistema 2 × 2</h3><p class="small muted" style="margin:0 0 8px">a₁x + b₁y = c₁ &nbsp;·&nbsp; a₂x + b₂y = c₂</p><div class="cl-row">${clField('e3a', 'a₁', '2')}${clField('e3b', 'b₁', '1')}${clField('e3c', 'c₁', '5')}</div><div class="cl-row">${clField('e3d', 'a₂', '1')}${clField('e3e', 'b₂', '-1')}${clField('e3f', 'c₂', '1')}</div>${clRes('e3r')}</div>
    <div class="card cl-sec"><h3>Teorema de Pitágoras</h3><p class="small muted" style="margin:0 0 8px">Deja vacío el lado que buscas.</p><div class="cl-row">${clField('e4a', 'Cateto a', '3')}${clField('e4b', 'Cateto b', '4')}${clField('e4c', 'Hipotenusa c', '')}</div>${clRes('e4r')}</div>`;
}
function clEstHTML() {
  return `<div class="card cl-sec"><h3>Datos</h3><div class="field"><label for="s1">Escribe tus números separados por espacios, comas o saltos de línea</label><textarea id="s1" class="input cl-i" rows="4" placeholder="8, 9, 7.5, 10, 6, 9">${esc(CL.stats ?? '8, 9, 7.5, 10, 6, 9')}</textarea></div>${clRes('s1r')}</div>`;
}
function clFinHTML() {
  return `<div class="card cl-sec"><h3>Interés compuesto</h3><div class="cl-row">${clField('f1a', 'Capital ($)', '10000')}${clField('f1b', 'Tasa anual (%)', '8')}</div><div class="cl-row">${clField('f1c', 'Años', '3')}${clField('f1d', 'Capitalizaciones al año', '12')}</div>${clRes('f1r')}</div>
    <div class="card cl-sec"><h3>Interés simple</h3><div class="cl-row">${clField('f2a', 'Capital ($)', '10000')}${clField('f2b', 'Tasa anual (%)', '8')}${clField('f2c', 'Años', '3')}</div>${clRes('f2r')}</div>
    <div class="card cl-sec"><h3>Pago mensual de un préstamo</h3><div class="cl-row">${clField('f3a', 'Monto ($)', '50000')}${clField('f3b', 'Tasa anual (%)', '18')}${clField('f3c', 'Meses', '12')}</div>${clRes('f3r')}</div>
    <div class="card cl-sec"><h3>Ahorro para una meta</h3><div class="cl-row">${clField('f4a', 'Meta ($)', '6000')}${clField('f4b', 'Meses', '8')}</div>${clRes('f4r')}</div>`;
}
const $m = (x) => '$' + x.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function clRun(id, fn) { const el = document.getElementById(id); if (!el) return; try { const h = fn(); el.innerHTML = h || '<span class="muted small">Llena los campos para ver el resultado.</span>'; } catch (e) { el.textContent = e.message; } }
const clBig = (t, sub) => `<b class="cl-big">${t}</b>${sub ? `<span class="small muted">${sub}</span>` : ''}`;
function clRunTab() {
  if (CL.tab === 'pct') {
    clRun('p1r', () => { const a = clNum('p1a'), b = clNum('p1b'); return clOk(a, b) ? clBig(clFmt(a * b / 100), `${clFmt(a)} % de ${clFmt(b)} = ${clFmt(a)} ÷ 100 × ${clFmt(b)}`) : ''; });
    clRun('p2r', () => { const a = clNum('p2a'), b = clNum('p2b'); return clOk(a, b) && b !== 0 ? clBig(clFmt((a / b) * 100) + ' %', `${clFmt(a)} ÷ ${clFmt(b)} × 100`) : ''; });
    clRun('p3r', () => { const a = clNum('p3a'), b = clNum('p3b'); if (!clOk(a, b) || a === 0) return ''; const c = ((b - a) / Math.abs(a)) * 100; return clBig(`${c >= 0 ? '+' : ''}${clFmt(c)} %`, `${c >= 0 ? 'Aumentó' : 'Disminuyó'} ${clFmt(Math.abs(b - a))} (de ${clFmt(a)} a ${clFmt(b)})`); });
    clRun('p4r', () => { const a = clNum('p4a'), b = clNum('p4b'); return clOk(a, b) ? clBig(clFmt(a * (1 + b / 100)), `${b < 0 ? 'Descuento' : 'Aumento'} de ${clFmt(Math.abs(a * b / 100))} sobre ${clFmt(a)}`) : ''; });
    clRun('p5r', () => { const a = clNum('p5a'), b = clNum('p5b'); return clOk(a, b) && b < 100 ? clBig(clFmt(a / (1 - b / 100)), `Con ${clFmt(b)} % de descuento quedó en ${clFmt(a)}`) : ''; });
    clRun('p6r', () => { const a = clNum('p6a'), b = clNum('p6b'), n = clNum('p6c'); if (!clOk(a, b, n) || n < 1) return ''; const tip = a * b / 100, tot = a + tip; return clBig(`${clFmt(tot / n, 2)} por persona`, `Propina ${clFmt(tip, 2)} · Total ${clFmt(tot, 2)}`); });
  } else if (CL.tab === 'ecu') {
    clRun('e1r', () => { const a = clNum('e1a'), b = clNum('e1b'), c = clNum('e1c'); if (!clOk(a, b, c)) return ''; if (a === 0) return b === 0 ? 'No es una ecuación válida.' : clBig(`x = ${clFmt(-c / b)}`, 'Con a = 0 es lineal.'); const D = b * b - 4 * a * c; const vx = -b / (2 * a), vy = a * vx * vx + b * vx + c; const head = `Discriminante = b² − 4ac = ${clFmt(D)}`;
      if (D > 0) { const r1 = (-b + Math.sqrt(D)) / (2 * a), r2 = (-b - Math.sqrt(D)) / (2 * a); return clBig(`x₁ = ${clFmt(r1)}  ·  x₂ = ${clFmt(r2)}`, `${head}. Dos soluciones reales. Vértice (${clFmt(vx)}, ${clFmt(vy)}).`); }
      if (D === 0) return clBig(`x = ${clFmt(vx)}`, `${head}. Una solución doble. Vértice (${clFmt(vx)}, ${clFmt(vy)}).`);
      const im = Math.sqrt(-D) / (2 * Math.abs(a)); return clBig(`x = ${clFmt(vx)} ± ${clFmt(im)}i`, `${head}. Sin soluciones reales (son complejas).`); });
    clRun('e2r', () => { const a = clNum('e2a'), b = clNum('e2b'), c = clNum('e2c'); if (!clOk(a, b, c)) return ''; if (a === 0) return b === c ? 'Tiene infinitas soluciones.' : 'No tiene solución.'; return clBig(`x = ${clFmt((c - b) / a)}`, `x = (${clFmt(c)} − ${clFmt(b)}) ÷ ${clFmt(a)}`); });
    clRun('e3r', () => { const [a1, b1, c1, a2, b2, c2] = ['e3a', 'e3b', 'e3c', 'e3d', 'e3e', 'e3f'].map(clNum); if (!clOk(a1, b1, c1, a2, b2, c2)) return ''; const D = a1 * b2 - a2 * b1; if (D === 0) return 'No tiene una solución única (rectas paralelas o iguales).'; return clBig(`x = ${clFmt((c1 * b2 - c2 * b1) / D)}  ·  y = ${clFmt((a1 * c2 - a2 * c1) / D)}`, `Por la regla de Cramer. Determinante = ${clFmt(D)}`); });
    clRun('e4r', () => { const a = clNum('e4a'), b = clNum('e4b'), c = clNum('e4c'); const e = [a, b, c].filter((x) => !isFinite(x)).length; if (e !== 1) return ''; if (!isFinite(c)) return clOk(a, b) ? clBig(`c = ${clFmt(Math.hypot(a, b))}`, 'c = √(a² + b²)') : ''; const k = isFinite(a) ? a : b; const r = c * c - k * k; return r < 0 ? 'La hipotenusa debe ser el lado más largo.' : clBig(`${isFinite(a) ? 'b' : 'a'} = ${clFmt(Math.sqrt(r))}`, 'cateto = √(c² − cateto²)'); });
  } else if (CL.tab === 'est') {
    clRun('s1r', () => {
      const raw = document.getElementById('s1')?.value || ''; CL.stats = raw; const xs = raw.replace(/,(?=\d{3}\b)/g, '').split(/[\s;,]+/).map((x) => x.replace(',', '.')).filter(Boolean).map(Number); if (!xs.length || xs.some((x) => !isFinite(x))) return xs.length ? 'Hay algo que no es un número.' : '';
      const n = xs.length, s = [...xs].sort((a, b) => a - b), sum = xs.reduce((a, b) => a + b, 0), mean = sum / n, q = (p) => { const i = (n - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
      const med = q(0.5), cnt = new Map(); xs.forEach((x) => cnt.set(x, (cnt.get(x) || 0) + 1)); const mx = Math.max(...cnt.values()); const modes = mx > 1 ? [...cnt].filter(([, c]) => c === mx).map(([x]) => clFmt(x)).join(', ') : 'No hay';
      const vp = xs.reduce((a, x) => a + (x - mean) ** 2, 0) / n, vm = n > 1 ? vp * n / (n - 1) : 0;
      const row = (l, v) => `<tr><th>${l}</th><td>${v}</td></tr>`;
      return `<table class="cl-tbl">${row('Datos', n)}${row('Suma', clFmt(sum))}${row('Media (promedio)', clFmt(mean))}${row('Mediana', clFmt(med))}${row('Moda', modes)}${row('Mínimo · Máximo', `${clFmt(s[0])} · ${clFmt(s[n - 1])}`)}${row('Rango', clFmt(s[n - 1] - s[0]))}${row('Cuartiles Q1 · Q3', `${clFmt(q(0.25))} · ${clFmt(q(0.75))}`)}${row('Desv. estándar (población)', clFmt(Math.sqrt(vp)))}${row('Desv. estándar (muestra)', n > 1 ? clFmt(Math.sqrt(vm)) : '—')}${row('Varianza (población)', clFmt(vp))}</table>`;
    });
  } else if (CL.tab === 'fin') {
    clRun('f1r', () => { const P = clNum('f1a'), r = clNum('f1b') / 100, t = clNum('f1c'), n = clNum('f1d'); if (!clOk(P, r, t, n) || n < 1) return ''; const M = P * Math.pow(1 + r / n, n * t); return clBig($m(M), `Ganancia de ${$m(M - P)} en ${clFmt(t)} ${t === 1 ? 'año' : 'años'}`); });
    clRun('f2r', () => { const P = clNum('f2a'), r = clNum('f2b') / 100, t = clNum('f2c'); if (!clOk(P, r, t)) return ''; const I = P * r * t; return clBig($m(P + I), `Interés de ${$m(I)}`); });
    clRun('f3r', () => { const P = clNum('f3a'), r = clNum('f3b') / 1200, n = clNum('f3c'); if (!clOk(P, r, n) || n < 1) return ''; const pay = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n)); return clBig($m(pay) + ' al mes', `Pagarías ${$m(pay * n)} en total (${$m(pay * n - P)} de intereses)`); });
    clRun('f4r', () => { const G = clNum('f4a'), m = clNum('f4b'); if (!clOk(G, m) || m < 1) return ''; return clBig($m(G / m) + ' al mes', `Para juntar ${$m(G)} en ${clFmt(m)} ${m === 1 ? 'mes' : 'meses'} (≈ ${$m(G / m / 4.345)} por semana)`); });
  }
}
Object.assign(VIDA_ACTS, {
  'cl-tab': (el) => { CL.tab = el.dataset.v; Snd.tick(); render(); },
  'cl-deg': () => { CL.deg = !CL.deg; render(); },
  'cl-clear': () => { CL.hist = []; try { localStorage.removeItem('cn-calc-hist'); } catch { /* */ } render(); },
  'cl-use': (el) => { const h = CL.hist[+el.dataset.i]; if (!h) return; CL.expr = h.e; render(); },
  'cl-key': (el) => {
    const inp = document.getElementById('clIn'); if (!inp) return; const v = el.dataset.v; Snd.tick();
    if (v === 'C') { inp.value = ''; clLive(); return; } if (v === '=') { clCommit(); return; }
    const a = inp.selectionStart ?? inp.value.length, b = inp.selectionEnd ?? a;
    if (v === 'B') { if (a !== b) inp.setRangeText('', a, b, 'end'); else if (a > 0) inp.setRangeText('', a - 1, a, 'end'); } else inp.setRangeText(v, a, b, 'end');
    inp.focus({ preventScroll: true }); clLive();
  },
});
document.addEventListener('input', (e) => { const t = e.target; if (t.id === 'clIn') clLive(); else if (t.classList && t.classList.contains('cl-i') && route().name === 'calculadora') { if (CL.tab === 'graf') chDraw(); else clRunTab(); } });
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'clIn') { e.preventDefault(); clCommit(); } });

/* ---------- Generador de gráficas ---------- */
const CH_COLORS = ['#2F8A5B', '#4C7BD9', '#E0A030', '#D9534F', '#8E63C9', '#2BA5A0', '#E07A4C', '#7A8B3A', '#C25A8E', '#5B6B7A'];
const CH_TYPES = { barras: 'Barras', horizontal: 'Barras ↔', lineas: 'Líneas', pastel: 'Pastel', dona: 'Dona' };
const CH = { type: 'barras', title: 'Mi gráfica', data: 'Matemáticas 9\nHistoria 8\nQuímica 7\nInglés 10', pct: false, dest: 'libreta', unit: '' };
function chParse(txt) {
  return String(txt || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const m = l.match(/^(.*?)[\s:=;,\t]+(-?\d[\d.,]*)\s*%?$/); if (!m) return null; const v = parseFloat(m[2].replace(/,(?=\d{3}\b)/g, '').replace(',', '.')); return isFinite(v) ? { l: m[1].trim() || '—', v } : null; }).filter(Boolean).slice(0, 24);
}
function chSVG(spec, W = 640, H = 420) {
  const rows = chParse(spec.data); const T = esc(spec.title || ''); const tot = rows.reduce((a, r) => a + Math.max(0, r.v), 0); const fmt = (v) => clFmt(v, 2) + (spec.unit || '');
  const font = 'font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif"'; const col = (i) => CH_COLORS[i % CH_COLORS.length];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" ${font}><rect width="${W}" height="${H}" fill="#ffffff" rx="14"/>`;
  if (T) s += `<text x="${W / 2}" y="34" text-anchor="middle" font-size="22" font-weight="700" fill="#2a2722">${T}</text>`;
  if (!rows.length) return s + `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-size="16" fill="#8a8578">Agrega datos: nombre y número por línea</text></svg>`;
  const top = T ? 56 : 24;
  const lab = (r, v) => (spec.pct && tot > 0 ? `${clFmt((Math.max(0, r.v) / tot) * 100, 1)} %` : fmt(v));
  if (spec.type === 'pastel' || spec.type === 'dona') {
    const cx = W * 0.32, cy = top + (H - top) / 2, R = Math.min((H - top - 20) / 2, W * 0.27), pos = rows.filter((r) => r.v > 0); let a0 = -Math.PI / 2;
    if (tot <= 0) return s + `<text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-size="16" fill="#8a8578">Los valores deben ser positivos</text></svg>`;
    pos.forEach((r, i) => { const a1 = a0 + (r.v / tot) * Math.PI * 2; const big = a1 - a0 > Math.PI ? 1 : 0; const X = (a, rr) => cx + Math.cos(a) * rr, Y = (a, rr) => cy + Math.sin(a) * rr;
      if (pos.length === 1) s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${col(i)}"/>`; else s += `<path d="M${cx} ${cy}L${X(a0, R).toFixed(2)} ${Y(a0, R).toFixed(2)}A${R} ${R} 0 ${big} 1 ${X(a1, R).toFixed(2)} ${Y(a1, R).toFixed(2)}Z" fill="${col(i)}" stroke="#fff" stroke-width="2"/>`;
      if (r.v / tot > 0.06) { const am = (a0 + a1) / 2; s += `<text x="${X(am, R * (spec.type === 'dona' ? 0.78 : 0.66)).toFixed(1)}" y="${(Y(am, R * (spec.type === 'dona' ? 0.78 : 0.66)) + 4).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${clFmt((r.v / tot) * 100, 0)}%</text>`; } a0 = a1; });
    if (spec.type === 'dona') s += `<circle cx="${cx}" cy="${cy}" r="${R * 0.52}" fill="#fff"/><text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="12" fill="#8a8578">Total</text><text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="18" font-weight="700" fill="#2a2722">${esc(fmt(tot))}</text>`;
    const lx = W * 0.62, step = Math.min(30, (H - top - 20) / pos.length); pos.forEach((r, i) => { const y = top + 10 + i * step; s += `<rect x="${lx}" y="${y}" width="14" height="14" rx="4" fill="${col(i)}"/><text x="${lx + 22}" y="${y + 12}" font-size="14" fill="#2a2722">${esc(r.l.slice(0, 18))} · ${esc(lab(r, r.v))}</text>`; });
    return s + '</svg>';
  }
  const horiz = spec.type === 'horizontal'; const mx = Math.max(...rows.map((r) => r.v), 0), mn = Math.min(...rows.map((r) => r.v), 0); const span = mx - mn || 1;
  if (horiz) {
    const L = 120, Rr = 70, bh = Math.min(34, (H - top - 20) / rows.length - 8), zero = L + ((0 - mn) / span) * (W - L - Rr);
    rows.forEach((r, i) => { const y = top + 8 + i * ((H - top - 20) / rows.length), x1 = L + ((r.v - mn) / span) * (W - L - Rr); s += `<text x="${L - 8}" y="${y + bh / 2 + 5}" text-anchor="end" font-size="13" fill="#2a2722">${esc(r.l.slice(0, 16))}</text><rect x="${Math.min(zero, x1).toFixed(1)}" y="${y}" width="${Math.max(2, Math.abs(x1 - zero)).toFixed(1)}" height="${bh}" rx="6" fill="${col(i)}"/><text x="${(Math.max(zero, x1) + 8).toFixed(1)}" y="${y + bh / 2 + 5}" font-size="13" font-weight="700" fill="#2a2722">${esc(lab(r, r.v))}</text>`; });
    return s + '</svg>';
  }
  const L = 56, Rr = 20, B = 62, plotH = H - top - B, plotW = W - L - Rr; const y0 = (v) => top + plotH - ((v - mn) / span) * plotH; const zeroY = y0(0);
  for (let k = 0; k <= 4; k++) { const v = mn + (span * k) / 4, y = y0(v); s += `<line x1="${L}" x2="${W - Rr}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e7e2d6"/><text x="${L - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#8a8578">${clFmt(v, 1)}</text>`; }
  const n = rows.length, slot = plotW / n;
  if (spec.type === 'lineas') {
    const pts = rows.map((r, i) => [L + slot * (i + 0.5), y0(r.v)]); s += `<path d="${pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')}" fill="none" stroke="${col(0)}" stroke-width="3" stroke-linejoin="round"/>`;
    pts.forEach((p, i) => { s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5" fill="#fff" stroke="${col(0)}" stroke-width="3"/><text x="${p[0].toFixed(1)}" y="${(p[1] - 11).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#2a2722">${esc(lab(rows[i], rows[i].v))}</text>`; });
  } else {
    const bw = Math.min(64, slot * 0.66); rows.forEach((r, i) => { const x = L + slot * i + (slot - bw) / 2, y1 = y0(r.v); s += `<rect x="${x.toFixed(1)}" y="${Math.min(y1, zeroY).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(2, Math.abs(zeroY - y1)).toFixed(1)}" rx="6" fill="${col(i)}"/><text x="${(x + bw / 2).toFixed(1)}" y="${(Math.min(y1, zeroY) - 7).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="#2a2722">${esc(lab(r, r.v))}</text>`; });
  }
  rows.forEach((r, i) => { const x = L + slot * (i + 0.5); s += `<text x="${x.toFixed(1)}" y="${H - B + 20}" text-anchor="middle" font-size="12" fill="#2a2722" ${n > 6 ? `transform="rotate(-28 ${x.toFixed(1)} ${H - B + 20})"` : ''}>${esc(r.l.slice(0, 14))}</text>`; });
  return s + '</svg>';
}
function chPanelHTML() {
  return `<div class="card cl-sec ch-prev" id="chPrev"></div><div class="card cl-sec"><div class="field"><label for="chT">Título</label><input id="chT" class="input cl-i" value="${esc(CH.title)}" maxlength="60"></div>
    <div class="field"><span class="lbl">Tipo</span><div class="seg" role="group" style="flex-wrap:wrap">${Object.entries(CH_TYPES).map(([k, l]) => `<button type="button" data-act="ch-type" data-v="${k}" aria-pressed="${CH.type === k}">${l}</button>`).join('')}</div></div>
    <div class="field"><label for="chD">Datos (una línea por dato: nombre y número)</label><textarea id="chD" class="input cl-i" rows="6" placeholder="Matemáticas 9">${esc(CH.data)}</textarea></div>
    <div class="cl-row"><label class="lc-chk" style="margin:0"><input type="checkbox" id="chP" class="cl-i" ${CH.pct ? 'checked' : ''}> Mostrar porcentajes</label>${clField('chU', 'Unidad (opcional)', '%, $, pts', CH.unit)}</div></div>
    <div class="btn-row" style="margin-top:12px">${isGroup() ? `<button class="btn primary" data-act="ch-save" data-dest="bosque">${icon('users', 'sm')}Al pizarrón del Bosque</button>` : `<button class="btn primary" data-act="ch-save" data-dest="libreta">${icon('book', 'sm')}A una libreta</button><button class="btn" data-act="ch-save" data-dest="lienzo">${icon('grid', 'sm')}A mi pizarrón</button>`}<button class="btn" data-act="ch-save" data-dest="png">${icon('download', 'sm')}Descargar</button></div>`;
}
function chRead() { CH.title = document.getElementById('chT')?.value ?? CH.title; CH.data = document.getElementById('chD')?.value ?? CH.data; CH.pct = !!document.getElementById('chP')?.checked; CH.unit = document.getElementById('chU')?.value ?? CH.unit; }
function chDraw() { chRead(); const el = document.getElementById('chPrev'); if (el) el.innerHTML = chSVG(CH); }
function chPNG(scale = 2) {
  return new Promise((res, rej) => {
    const svg = chSVG(CH, 640, 420); const img = new Image(); const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = () => { const c = document.createElement('canvas'); c.width = 640 * scale; c.height = 420 * scale; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.92)); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('No se pudo crear la imagen')); }; img.src = url;
  });
}
function chSubjSheet(data) {
  openSheet(`${sheetHead('¿En qué libreta?')}<div class="sheet-body"><div class="field"><label for="chSubj">Materia</label><select id="chSubj" class="input">${lbSubjects().map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div><button class="btn primary block" data-act="ch-lib">${icon('save')}Guardar en la libreta</button></div>`); CH.pending = data;
}
Object.assign(VIDA_ACTS, {
  'ch-type': (el) => { CH.type = el.dataset.v; document.querySelectorAll('[data-act=ch-type]').forEach((b) => b.setAttribute('aria-pressed', b === el)); chDraw(); },
  'ch-open': async (el) => { CH.dest = el.dataset.dest || 'libreta'; CL.tab = 'graf'; if (CH.dest === 'bosque' || CH.dest === 'lienzo') { sessionStorage.setItem('cn-ch-back', location.hash); } location.hash = '#/calculadora'; render(); },
  'ch-save': async (el) => {
    chRead(); if (!chParse(CH.data).length) { toast('Agrega al menos un dato con su número.'); return; } const dest = el.dataset.dest; el.disabled = true;
    try {
      const data = await chPNG();
      if (dest === 'png') { const a = document.createElement('a'); a.href = data; a.download = (CH.title || 'grafica').replace(/[^\wáéíóúñ -]/gi, '') + '.jpg'; document.body.appendChild(a); a.click(); a.remove(); toast('Gráfica descargada.'); }
      else if (dest === 'libreta') chSubjSheet(data);
      else if (dest === 'lienzo') { const iid = await ufPut(data); lzAdd('foto', { img: iid, w: 320, text: CH.title }); toast('Listo: está en tu pizarrón.', { action: 'Abrir', onAction: () => { location.hash = '#/lienzo'; } }); }
      else if (dest === 'bosque') {
        if (!navigator.onLine) { toast('Para subir al Bosque necesitas internet.'); } else {
          const fileId = 'f' + uid(); await cloudFetch('POST', { kind: 'gimg', as: REG.me, forest: curFid(), id: fileId, data }); gImgCache.set(fileId, data); DB.put('files', 'gi:' + fileId, data).catch(() => {});
          await gput({ id: 'pz' + uid(), type: 'board', kind: 'file', ep: pzEpoch(), tone: 'papel', ...pzSpot(), fileId, file: 'grafica.jpg', size: Math.round(data.length * 0.75), title: CH.title || 'Gráfica' }); toast('Gráfica puesta en el pizarrón del Bosque.'); Snd.drop(); }
      }
    } catch (e) { toast(e.message || 'No se pudo guardar.'); }
    el.disabled = false;
  },
  'ch-lib': async () => {
    const sid = document.getElementById('chSubj')?.value || '_gen'; const data = CH.pending; if (!data) return; const subjectId = lbSid(sid);
    try { const iid = await ufPut(data); const now = Date.now(); commit((s) => { (s.pages ||= []).push({ id: 'pg' + uid(), kind: 'foto', subjectId, title: CH.title || 'Gráfica', text: '', items: [], img: [iid], frame: 'polaroid', filter: 'natural', tone: 'papel', sticker: '', at: now, updated: now }); }); closeSheet(false); Snd.drop(); toast('Gráfica guardada en tu libreta.', { action: 'Abrir', onAction: () => { location.hash = `#/libretas/${sid}`; } }); }
    catch { toast('No se pudo guardar la gráfica.'); }
  },
});

/* ---------- Puertas de entrada: Más, Libretas, Pizarrón del Bosque y Mi pizarrón ---------- */
{
  const baseMas = viewMas;
  viewMas = function () { return baseMas().replace(/<li><a href="#\/escanear">/, `<li><a href="#/calculadora"><span class="ico">${icon('grid')}</span><span class="txt"><b>Calculadora inteligente</b><span>Operaciones, porcentajes, ecuaciones, estadística, finanzas y gráficas</span></span>${icon('chev', 'chev')}</a></li><li><a href="#/escanear">`); };
}
{
  const baseLb = viewLibreta;
  viewLibreta = function (sid) { const h = baseLb(sid); return h.replace('<div class="btn-row" style="margin-top:16px"><button class="btn" data-act="qz-go"', `<div class="btn-row" style="margin-top:16px"><button class="btn" data-act="ch-open" data-dest="libreta">${icon('grid', 'sm')}Crear gráfica</button><button class="btn" data-act="qz-go"`); };
}
{
  const basePz = viewPizarron;
  viewPizarron = function () { return basePz().replace('<div class="pz-add">', `<div class="pz-add"><button type="button" class="btn" data-act="ch-open" data-dest="bosque">${icon('grid', 'sm')}Gráfica</button>`); };
}
{
  const baseLz = viewLienzo;
  viewLienzo = function () { const h = baseLz(); EXTRA_VIEWS.lienzo = viewLienzo; return h.replace('aria-label="Agregar al pizarrón">', `aria-label="Agregar al pizarrón"><button type="button" class="chip" data-act="ch-open" data-dest="lienzo">${icon('grid', 'sm')}Gráfica</button>`); };
  EXTRA_VIEWS.lienzo = viewLienzo;
}
document.addEventListener('focusin', (e) => { const t = e.target; if (t.classList && t.classList.contains('cl-i') && t.tagName === 'INPUT' && t.type !== 'checkbox') setTimeout(() => { try { t.select(); } catch { /* */ } }, 0); });
