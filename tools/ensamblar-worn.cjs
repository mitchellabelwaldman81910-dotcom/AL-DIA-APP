/* Une los 140 niveles clásicos más fáciles con los 160 nuevos (llaves, puertas y tierra frágil), los comprueba con el motor
   y escribe a/gusano-niveles.js. Uso: node tools/ensamblar-worn.cjs carpeta_con_gw_n1.json_y_gw_n2.json */
const fs = require('fs'); const vm = require('vm'); const T = process.argv[2];
const ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname + '/../a/gusano-motor.js', 'utf8') + ';this.M={gwParse,gwStep,gwStart,gwSolve};', ctx); const M = ctx.M;
const old = new Function(fs.readFileSync(process.env.OLD || __dirname + '/../a/gusano-niveles.js', 'utf8') + ';return GW_LV;')().slice(0, 140);
const nuevos = [...JSON.parse(fs.readFileSync(T + '/gw_n1.json', 'utf8')), ...JSON.parse(fs.readFileSync(T + '/gw_n2.json', 'utf8'))];
const key = (s) => +s.split('|')[0].split(',')[3] + (/[KC]/.test(s.split('|')[1]) ? 0 : 0);
let bad = 0; const keep = nuevos.filter((s, i) => { if (!s) { console.error('falta nuevo', i + 1); bad++; return false; } return true; });
keep.sort((a, b) => key(a) - key(b));
const all = [...old, ...keep].slice(0, 300); if (all.length < 300) { console.error('solo', all.length); process.exit(1); }
const out = all.map((s, i) => { const L = M.gwParse(s); const so = M.gwSolve(L, 600000, 120); if (!so) { console.error('sin solución', i + 1); bad++; return s; } const p = s.split('|'); const h = p[0].split(','); h[2] = Math.floor(i / 10); h[3] = so.moves; return [h.join(','), p[1], p[2]].join('|'); });
if (bad) { console.error('niveles malos:', bad); process.exit(1); }
fs.writeFileSync(__dirname + '/../a/gusano-niveles.js', '/* Cinnavia 7.48 — 300 niveles de The Worn. Cada uno se resolvió con gusano-motor.js; el 4.º valor es el mínimo de movimientos.\n   Los últimos 160 usan llaves, puertas y tierra frágil. */\nconst GW_LV = ' + JSON.stringify(out) + ';\n');
const mv = out.map((s) => +s.split('|')[0].split(',')[3]); console.log('OK', out.length, 'niveles; pasos medios por tramo de 50:', [0, 50, 100, 150, 200, 250].map((a) => Math.round(mv.slice(a, a + 50).reduce((x, y) => x + y, 0) / 50)).join(' '), 'máximo', Math.max(...mv));
