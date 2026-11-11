/* Une los archivos generados en a/gusano-niveles.js y comprueba cada nivel con el motor. */
const fs = require('fs'); const vm = require('vm'); const T = process.argv[2];
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname + '/../a/gusano-motor.js', 'utf8') + ';this.M={gwParse,gwStep,gwStart,gwSolve};', ctx); const M = ctx.M;
const read = (f) => JSON.parse(fs.readFileSync(`${T}/${f}`, 'utf8'));
const easy = read('gw_easy.json'), p1 = read('gw_1.json'), A = read('gw_A.json'), B = read('gw_B.json');
const all = [...easy, ...p1.slice(80), ...A, ...B]; let bad = 0;
if (all.length !== 1000) { console.error('longitud', all.length); process.exit(1); }
all.forEach((s, i) => { if (!s) { console.error('falta', i + 1); bad++; return; } const L = M.gwParse(s); const sol = M.gwSolve(L, 400000); if (!sol) { console.error('sin solución', i + 1); bad++; } else if (sol.moves !== L.opt) { /* corrige el óptimo guardado */ const h = s.split('|'); const hd = h[0].split(','); hd[3] = sol.moves; all[i] = [hd.join(','), h[1], h[2]].join('|'); } });
if (bad) { console.error('niveles malos:', bad); process.exit(1); }
fs.writeFileSync(__dirname + '/../a/gusano-niveles.js', '/* Cinnavia 7.41 — 1000 niveles del Gusano Goloso. Cada uno se resolvió con gusano-motor.js; el número después del tercer valor es el mínimo de pasos. */\nconst GW_LV = ' + JSON.stringify(all) + ';\n');
const mv = all.map((s) => +s.split('|')[0].split(',')[3]); const avg = (a, b) => Math.round(mv.slice(a, b).reduce((x, y) => x + y, 0) / (b - a));
console.log('OK 1000 niveles; pasos medios por tramo:', [0, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((a) => avg(a, a + 100)).join(' '));
