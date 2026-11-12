/* Cinnavia 7.53 — MUNDOS · segundo lote de especies (mascotas, granja, monitos, aves de colores, peces y más) y su reparto por mundo. */
'use strict';
(() => {
  const q = (n, z, v, pat, g, lit, bn, d, look, fx, extra) => Object.assign({ n, t: 'q', h: 'L', d, z, v, pat, g, lit, bn, prey: [], look, fx }, extra || {});
  const b = (n, z, v, pat, g, lit, bn, d, nest, look, fx, extra) => Object.assign({ n, t: 'b', h: 'A', d, z, v: [v], pat, g, lit, bn, nest, prey: [], look, fx }, extra || {});
  const f = (n, sh, z, v, g, lit, bn, d, look, fx, extra) => Object.assign({ n, t: 'f', sh, h: 'W', d, z, v: [v], pat: 'a', g, lit, bn, prey: [], look, fx }, extra || {});
  const N = {
    /* mascotas y granja */
    perro: q('Perrito', 1.1, [30, 120], 'd', 3, [2, 5], 'cachorrito', 'o', { c: '#c8955a', b: '#f4e2c4', e: 'floppy', n: 0.45, tl: 'curl', ln: 1, lg: 0.75 }, 'Su nariz es unas 10 000 veces más sensible que la nuestra.', { prey: ['conejo', 'raton'], var: ['#c8955a', '#3a3030', '#f2efe8', '#a8693a'] }),
    gato: q('Gatito', 0.85, [26, 120], 'n', 1, [2, 4], 'gatito bebé', 'c', { c: '#e0a05a', b: '#fff1dc', s: '#b0703a', pt: 'stripes', e: 'point', n: 0.2, tl: 'long', ln: 0.85, lg: 0.6 }, 'Ronronea cuando está feliz y también para calmarse.', { prey: ['raton', 'pajaro'], var: ['#e0a05a', '#7a7a80', '#2a2a30', '#f2efe8'] }),
    pony: q('Pony', 1.4, [26, 100], 'd', 3, [1, 1], 'potrillo', 'h', { c: '#d8b8e8', b: '#f6eefa', e: 'point', n: 0.6, tl: 'longfluff', ln: 1.1, lg: 0.8, nk: 0.5, mn: 1 }, 'Es un caballo pequeñito, fuerte y muy listo.', { var: ['#d8b8e8', '#f2c8a0', '#c8a080', '#f4f0e8'] }),
    burro: q('Burrito', 1.5, [22, 80], 'd', 2, [1, 1], 'burrito bebé', 'h', { c: '#9a948e', b: '#e8e4dc', e: 'huge', n: 0.6, tl: 'tuft', ln: 1.2, lg: 0.9, nk: 0.4, mn: 1 }, 'Sus orejas enormes le ayudan a escuchar a otros burros a kilómetros.'),
    cuyo: q('Cuyo', 0.6, [16, 60], 'd', 4, [2, 4], 'cuyito', 'h', { c: '#e8b880', b: '#fff4e4', s: '#f8f4ee', pt: 'patches', e: 'small', n: 0.15, tl: 'none', ln: 0.95, lg: 0.3 }, 'Cuando está feliz da saltitos llamados «popcorn».', { var: ['#e8b880', '#5a4030', '#f4f0e8'] }),
    raton: q('Ratoncito', 0.45, [24, 110], 'n', 4, [3, 6], 'ratoncito bebé', 'o', { c: '#a8a4a0', b: '#f2ece8', e: 'roundbig', n: 0.2, tl: 'long', ln: 0.85, lg: 0.4 }, 'Puede meterse por un agujero del tamaño de un lápiz.'),
    hamster: q('Hámster', 0.5, [18, 70], 'n', 1, [3, 6], 'hamstercito', 'h', { c: '#e8a868', b: '#fff6e8', e: 'round', n: 0.15, tl: 'none', ln: 0.95, lg: 0.3 }, 'Guarda comida en sus cachetes como si fueran mochilas.'),
    puercoespin: q('Puercoespín', 0.95, [12, 40], 'n', 1, [1, 2], 'puercoespincito', 'h', { c: '#6a5a4a', b: '#a89880', s: '#3a2e24', spk: 2, e: 'small', n: 0.3, tl: 'short', ln: 1, lg: 0.45 }, 'Tiene unas 30 000 púas, pero las crías nacen con púas blanditas.'),
    erizo: { n: 'Erizo', t: 'x', sh: 'hedge', h: 'L', d: 'o', z: 0.7, v: [12, 45], pat: 'n', g: 1, lit: [3, 5], bn: 'erizito', prey: ['caracol'], look: { c: '#c8a888', b: '#f4e6d4', s: '#6a5040' }, fx: 'Se hace bolita cuando tiene miedo.' },
    caracol: { n: 'Caracol', t: 'x', sh: 'snail', h: 'L', d: 'h', z: 0.6, v: [3, 5], pat: 'n', g: 3, lit: [3, 6], bn: 'caracolito', prey: [], look: { c: '#c8884a', b: '#d8c8b0', s: '#8a5a2a' }, fx: 'Lleva su casa encima y sale más cuando llueve.', var: ['#c8884a', '#e0b060', '#b8a0d0'] },
    mapache: q('Mapache', 1, [24, 90], 'n', 2, [2, 4], 'mapachito', 'o', { c: '#8a8680', b: '#d8d4cc', e: 'point', n: 0.35, mask: 1, tl: 'bushy', ln: 1, lg: 0.55 }, 'Lava su comida en el agua con sus manitas.', { prey: ['rana', 'cangrejo', 'pez'] }),
    zorrillo: q('Zorrillo', 0.85, [16, 60], 'n', 1, [2, 5], 'zorrillito', 'o', { c: '#25252b', b: '#3a3a40', s: '#f8f8f8', pt: 'band', e: 'small', n: 0.3, tl: 'bushy', ln: 0.95, lg: 0.45 }, 'Avisa con pataditas antes de lanzar su olor.'),
    armadillo: q('Armadillo', 0.8, [14, 50], 'n', 1, [4, 4], 'armadillito', 'o', { c: '#b8a080', b: '#d8c4a8', shell: 1, e: 'small', n: 0.55, tl: 'short', ln: 1, lg: 0.35 }, 'Casi siempre nacen cuatrillizos idénticos.'),
    osohormiguero: q('Oso hormiguero', 1.6, [18, 60], 'd', 1, [1, 1], 'osito hormiguero', 'o', { c: '#8a7a6a', b: '#4a4038', s: '#2a2420', pt: 'band', e: 'small', n: 1.6, tl: 'longfluff', ln: 1.3, lg: 0.7 }, 'Su lengua mide 60 centímetros y come miles de hormigas.'),
    tapir: q('Tapir', 1.7, [20, 70], 'n', 1, [1, 1], 'tapircito', 'h', { c: '#3a3a40', b: '#d8d4cc', e: 'small', n: 0.6, tr: 0, tl: 'short', ln: 1.3, lg: 0.75 }, 'Sus crías tienen rayitas y manchas como sandías.', { h: 'M' }),
    suricata: q('Suricata', 0.55, [22, 90], 'd', 6, [2, 4], 'suricatita', 'o', { c: '#c8a878', b: '#e8d4b0', s: '#6a5040', pt: 'band', e: 'small', n: 0.3, mask: 1, tl: 'long', ln: 0.75, lg: 0.6 }, 'Siempre una hace guardia mientras las demás comen.', { prey: ['lagarto'] }),
    lince: q('Lince', 1.2, [24, 115], 'n', 1, [2, 3], 'linsito', 'c', { c: '#c8a070', b: '#f2e4cc', s: '#5a4030', pt: 'spots', e: 'tuftear', n: 0.35, tl: 'short', ln: 1, lg: 0.8 }, 'Las borlas de sus orejas le ayudan a escuchar mejor.', { prey: ['conejo', 'liebre', 'ardilla', 'raton'] }),
    puma: q('Puma', 1.7, [28, 120], 'c', 1, [1, 3], 'pumita', 'c', { c: '#c89a62', b: '#f2e0c4', e: 'round', n: 0.4, tl: 'long', ln: 1.25, lg: 0.8 }, 'No ruge: maúlla, silba y ronronea.', { prey: ['venado', 'cabra', 'llama', 'conejo'] }),
    pantera: q('Pantera negra', 1.7, [28, 120], 'n', 1, [1, 2], 'panterita', 'c', { c: '#2a2a32', b: '#3a3a44', e: 'round', n: 0.4, tl: 'long', ln: 1.25, lg: 0.8 }, 'Es un jaguar o leopardo con pelaje oscuro: ¡también tiene manchas!', { prey: ['capibara', 'venado', 'tapir', 'cerdo'] }),
    pandarojo: q('Panda rojo', 0.9, [16, 70], 'c', 1, [1, 2], 'pandita rojo', 'h', { c: '#c8582a', b: '#3a2a24', s: '#a8401a', e: 'round', n: 0.2, mask: 1, tl: 'bushy', ln: 0.9, lg: 0.5 }, 'Usa su cola esponjosa como cobija para dormir.', { arb: 1 }),
    lemur: q('Lémur', 0.8, [22, 90], 'd', 6, [1, 2], 'lemurcito', 'o', { c: '#a8a4a8', b: '#f2f0f2', s: '#2a2a2e', e: 'point', n: 0.35, tl: 'long', ln: 0.8, lg: 0.7, arms: 1 }, 'Por la mañana se sienta a tomar el sol con los brazos abiertos.', { arb: 1 }),
    monoarana: q('Mono araña', 1, [24, 95], 'd', 4, [1, 1], 'monito araña', 'h', { c: '#3a2e28', b: '#8a6a52', e: 'round', n: 0.25, tl: 'curl', ln: 0.8, lg: 0.9, arms: 1 }, 'Su cola es tan fuerte que puede colgarse solo de ella.', { arb: 1 }),
    titi: q('Tití', 0.5, [24, 90], 'd', 6, [2, 2], 'titicito', 'o', { c: '#c8a070', b: '#f4ece0', e: 'round', n: 0.15, tl: 'long', ln: 0.7, lg: 0.6, arms: 1 }, 'Los papás cargan a los gemelitos en la espalda.', { arb: 1, prey: [] }),
    orangutan: q('Orangután', 1.8, [14, 45], 'd', 1, [1, 1], 'orangutancito', 'o', { c: '#c8642a', b: '#e8a060', e: 'small', n: 0.3, tl: 'none', ln: 0.9, lg: 0.9, arms: 1 }, 'Cada noche se arma una cama nueva con hojas en lo alto.', { arb: 1 }),
    gorila: q('Gorila', 2.3, [14, 60], 'd', 4, [1, 1], 'gorilita', 'h', { c: '#2a2a30', b: '#4a4a52', e: 'small', n: 0.3, tl: 'none', ln: 1.1, lg: 1, arms: 1 }, 'Es muy tranquilo y vive en familias muy unidas.'),
    jabali: q('Jabalí', 1.3, [24, 95], 'c', 5, [3, 6], 'jabatito', 'o', { c: '#5a4a3a', b: '#7a6a58', e: 'point', n: 0.6, pig: 0, tk: 1, tl: 'tuft', ln: 1.15, lg: 0.6, mn: 1 }, 'Sus crías tienen rayitas como sandía.'),
    alpaca: q('Alpaca', 1.4, [22, 70], 'd', 5, [1, 1], 'cría de alpaca', 'h', { c: '#f2e6d4', b: '#fff8ee', e: 'banana', n: 0.3, fl: 1, tl: 'fluff', ln: 1, lg: 0.9, nk: 0.9 }, 'Su lana es más suave que la de la oveja y no pica.', { var: ['#f2e6d4', '#c8a07a', '#8a6a52', '#f8f4f0'] }),
    marmota: q('Marmota', 0.8, [16, 70], 'd', 4, [2, 5], 'marmotita', 'h', { c: '#a07a52', b: '#d8c0a0', e: 'small', n: 0.25, tl: 'bushy', ln: 0.95, lg: 0.4 }, 'Silba fuerte para avisar a su familia cuando ve un águila.'),
    chinchilla: q('Chinchilla', 0.55, [20, 85], 'n', 5, [1, 3], 'chinchillita', 'h', { c: '#b8bcc4', b: '#eef0f2', e: 'roundbig', n: 0.15, tl: 'bushy', ln: 0.8, lg: 0.45 }, 'Se baña en polvo para mantener su pelito limpio.'),
    wombat: q('Wombat', 1, [16, 55], 'n', 1, [1, 1], 'wombatito', 'h', { c: '#8a7058', b: '#a8907a', e: 'small', n: 0.3, nose: 1, tl: 'none', ln: 1.05, lg: 0.4 }, '¡Su popó tiene forma de cubito!'),
    bufalo: q('Búfalo', 2.3, [22, 80], 'd', 6, [1, 1], 'bufalito', 'h', { c: '#3a3434', b: '#4a4444', e: 'small', n: 0.55, hn: 'curve', box: 1, tl: 'tuft', ln: 1.4, lg: 0.85 }, 'Le encanta revolcarse en el lodo para protegerse del sol.', { h: 'M' }),
    okapi: q('Okapi', 1.8, [22, 80], 'd', 1, [1, 1], 'okapito', 'h', { c: '#4a2a24', b: '#6a4038', s: '#f4f0e8', pt: 'stripes', e: 'big', n: 0.6, tl: 'tuft', ln: 1.2, lg: 1, nk: 0.6 }, 'Es pariente de la jirafa y se limpia las orejas con la lengua.'),
    ciervorojo: q('Ciervo rojo', 1.6, [28, 115], 'c', 5, [1, 1], 'cervatillo', 'h', { c: '#a8603a', b: '#e8c8a8', e: 'point', n: 0.4, hn: 'antler', tl: 'short', ln: 1.3, lg: 1.15, nk: 0.35 }, 'En otoño los machos braman muy fuerte.'),
    /* aves de colores */
    cardenal: b('Cardenal', 0.65, 95, 'd', 2, [2, 4], 'cardenalito', 'h', 'tree', { c: '#d83a3a', b: '#e85a5a', head: '#d83a3a', beak: 'short', bc: '#f08a3a', tail: 'short', crest: 'tuft', cheek: '#2a1a1a' }, 'El papá le da semillas en el pico a la mamá.'),
    pavoreal: b('Pavo real', 1.5, 60, 'd', 4, [3, 5], 'pavito real', 'o', 'ground', { c: '#2a6ab8', b: '#2a5aa0', head: '#2a7ac8', beak: 'short', bc: '#c8b090', tail: 'peacock', crest: 'tuft', wing: '#c8a878', leg: 'long', lc: '#8a8a8a' }, 'El macho abre su cola de 200 plumas con «ojos» para lucirse.'),
    petirrojo: b('Petirrojo', 0.55, 95, 'd', 2, [3, 5], 'petirrojito', 'o', 'tree', { c: '#8a7058', b: '#f08a4a', head: '#8a7058', beak: 'short', bc: '#3a2a20', tail: 'short' }, 'Canta incluso de noche cerca de las luces.'),
    gorrion: b('Gorrión', 0.5, 95, 'd', 6, [3, 5], 'gorrioncito', 'h', 'tree', { c: '#a8805a', b: '#e8dcc8', head: '#8a6a4a', beak: 'short', bc: '#5a4a3a', tail: 'short', cheek: '#f4ece0' }, 'Se da baños de tierra para quitarse los bichitos.'),
    canario: b('Canario', 0.45, 95, 'd', 5, [3, 5], 'canarito', 'h', 'tree', { c: '#f8d83a', b: '#fff2a0', beak: 'short', bc: '#f0b05a', tail: 'short' }, 'Los machos inventan canciones nuevas cada año.'),
    guacamaya: b('Guacamaya', 1.2, 100, 'd', 4, [2, 3], 'guacamayita', 'h', 'tree', { c: '#e83a3a', b: '#e83a3a', head: '#e83a3a', beak: 'hook', bc: '#f4efe0', tail: 'long', wing: '#2a7ae8', cheek: '#ffffff' }, 'Come barro para que no le hagan daño las semillas.'),
    cacatua: b('Cacatúa', 1, 90, 'd', 6, [2, 3], 'cacatúita', 'h', 'tree', { c: '#f8f8f4', b: '#ffffff', beak: 'hook', bc: '#3a3a40', tail: 'short', crest: 'tuft', cheek: '#fff3a0' }, 'Levanta su cresta amarilla cuando se emociona.'),
    golondrina: b('Golondrina', 0.5, 120, 'd', 8, [3, 5], 'golondrinita', 'c', 'cliff', { c: '#2a3a6a', b: '#f4ece4', head: '#2a3a6a', beak: 'short', bc: '#2a2a2a', tail: 'fork', cheek: '#c85a3a' }, 'Atrapa mosquitos al vuelo y viaja miles de kilómetros.', { prey: [] }),
    carpintero: b('Pájaro carpintero', 0.7, 90, 'd', 1, [3, 5], 'carpinterito', 'o', 'tree', { c: '#2a2a30', b: '#f4f0e8', head: '#f4f0e8', beak: 'long', bc: '#4a4a4a', tail: 'short', crest: 'comb' }, 'Golpea el tronco hasta 20 veces por segundo.'),
    martin: b('Martín pescador', 0.6, 110, 'd', 1, [4, 6], 'martincito', 'c', 'ground', { c: '#2a8ad8', b: '#f08a3a', head: '#2a8ad8', beak: 'long', bc: '#2a2a2a', tail: 'short' }, 'Se lanza al agua como una flecha para pescar.', { prey: ['pez', 'rana'] }),
    quetzal: b('Quetzal', 0.8, 85, 'd', 1, [1, 2], 'quetzalito', 'h', 'tree', { c: '#2aa86a', b: '#e83a4a', head: '#2aa86a', beak: 'short', bc: '#f0c23a', tail: 'long', crest: 'tuft' }, 'Las plumas de su cola miden más que su cuerpo.'),
    cuervo: b('Cuervo', 1, 90, 'd', 3, [3, 5], 'cuervito', 'o', 'tree', { c: '#2a2a34', b: '#3a3a46', beak: 'short', bc: '#2a2a2a', tail: 'fan' }, 'Es tan listo que usa herramientas y recuerda caras.', { prey: ['raton', 'caracol'] }),
    paloma: b('Paloma', 0.75, 90, 'd', 8, [1, 2], 'pichoncito', 'h', 'tree', { c: '#a8acb8', b: '#c8ccd4', head: '#8a8ea0', beak: 'short', bc: '#e8a0a0', tail: 'fan', cheek: '#7ab89a' }, 'Siempre encuentra el camino a casa.'),
    cigueña: b('Cigüeña', 1.4, 70, 'd', 2, [3, 4], 'cigüeñita', 'c', 'tree', { c: '#f8f8f4', b: '#ffffff', beak: 'long', bc: '#e85a3a', tail: 'short', wing: '#2a2a30', leg: 'long', lc: '#e85a3a', neck: 0.8 }, 'Hace nidos enormes en lo alto, ¡hasta en torres!', { h: 'M', prey: ['rana', 'pez', 'raton'] }),
    pavo: b('Guajolote', 1.3, 40, 'd', 5, [4, 8], 'guajolotito', 'o', 'ground', { c: '#5a4038', b: '#7a5a48', head: '#c8a0a0', beak: 'short', bc: '#e8c890', tail: 'fan', crest: 'comb', leg: 'long', lc: '#c88a7a' }, 'Su moco rojo cambia de color con su humor.'),
    /* agua dulce y mar */
    ajolote: f('Ajolote', 'axolotl', 0.75, 14, 3, [4, 8], 'ajolotito', 'c', { c: '#f8b8c8', b: '#fff0f4', s: '#e85a8a' }, 'Puede regenerar sus patitas y hasta parte de su corazón.', { prey: ['caracol'], var: ['#f8b8c8', '#5a4a3a', '#f8e8a0', '#2a2a30'] }),
    koi: f('Pez koi', 'fish', 1, 20, 6, [4, 8], 'koicito', 'o', { c: '#f8f4ec', b: '#fff8f0', s: '#e85a2a' }, 'Algunos viven más de 100 años.', { var: ['#f8f4ec', '#f0a03a', '#e85a2a'] }),
    dorado: f('Pez dorado', 'fish', 0.6, 22, 6, [4, 8], 'pecesito dorado', 'o', { c: '#f8a03a', b: '#ffe0a0', s: '#e8702a' }, 'Puede aprender trucos y reconocer a quien le da de comer.'),
    trucha: f('Trucha', 'fish', 1, 30, 4, [4, 8], 'truchita', 'c', { c: '#8a9a7a', b: '#f4e8e0', s: '#e88a9a', slim: 1 }, 'Vive en ríos fríos y saltarines.', { prey: ['pez'] }),
    bagre: f('Bagre', 'fish', 1.3, 18, 2, [4, 8], 'bagrecito', 'o', { c: '#6a6a5a', b: '#c8c4b0', s: '#4a4a3a' }, 'Sus bigotes le sirven para «saborear» el agua.'),
    pezglobo: f('Pez globo', 'fish', 0.8, 14, 1, [3, 6], 'globito', 'o', { c: '#e8d48a', b: '#fff8e0', s: '#8a7a3a' }, 'Se infla como pelota cuando lo asustan.'),
    cirujano: f('Pez cirujano azul', 'fish', 0.8, 26, 6, [4, 8], 'cirujanito', 'k', { c: '#2a6ae8', b: '#f8e03a', s: '#1a2a6a' }, 'Es azul brillante con una cola amarilla.'),
    angel: f('Pez ángel', 'fish', 0.8, 22, 4, [4, 8], 'angelito', 'k', { c: '#f8d83a', b: '#fff2a0', s: '#2a6ae8', bands: 1 }, 'Nada en parejas que se quedan juntas mucho tiempo.'),
    langosta: { n: 'Langosta', t: 'f', sh: 'crab', h: 'M', d: 'o', z: 1, v: [10], pat: 'n', g: 1, lit: [4, 8], bn: 'langostita', prey: ['estrella', 'caracol'], look: { c: '#c84a3a', b: '#e88a6a' }, fx: 'Camina hacia atrás para escapar rápido.' },
    manati: { n: 'Manatí', t: 'f', sh: 'seal', h: 'W', d: 'k', z: 2.6, v: [10], pat: 'a', g: 2, lit: [1, 1], bn: 'manatí bebé', prey: [], look: { c: '#8a9098', b: '#a8b0b8' }, fx: 'Le dicen «vaca marina» porque pasa el día comiendo plantas.' },
    tortugalaud: f('Tortuga laúd', 'seaturtle', 2, 16, 1, [3, 6], 'tortuguita', 'o', { c: '#3a4a5a', b: '#8a98a8', s: '#2a3a4a' }, 'Es la tortuga más grande del mundo y come medusas.', { prey: ['medusa'] }),
    camaron: { n: 'Camarón', t: 'f', sh: 'crab', h: 'W', d: 'o', z: 0.4, v: [14], pat: 'a', g: 8, lit: [4, 8], bn: 'camaroncito', prey: [], look: { c: '#f8a08a', b: '#ffd0c0' }, fx: 'Algunos limpian los dientes a los peces grandes.' },
  };
  for (const k in N) { if (N[k]) MD_SP[k] = Object.assign({ prey: [] }, N[k]); }
  /* presas de los nuevos y viejos */
  const addPrey = (k, ...p) => { if (MD_SP[k]) MD_SP[k].prey = [...new Set([...(MD_SP[k].prey || []), ...p])]; };
  addPrey('zorro', 'raton', 'cuyo', 'caracol'); addPrey('buho', 'raton', 'hamster'); addPrey('aguila', 'marmota', 'cuyo', 'suricata'); addPrey('halcon', 'raton', 'gorrion', 'paloma');
  addPrey('serpiente', 'raton', 'rana', 'hamster'); addPrey('coyote', 'raton', 'conejo'); addPrey('cocodrilo', 'bufalo', 'tapir', 'jabali'); addPrey('lobo', 'jabali', 'ciervorojo'); addPrey('leon', 'bufalo');
  addPrey('jaguar', 'tapir', 'monoarana', 'mono', 'perezoso'); addPrey('tigre', 'jabali', 'ciervorojo'); addPrey('leopnieve', 'marmota'); addPrey('pulpo', 'camaron', 'langosta'); addPrey('pez', 'camaron'); addPrey('nutria', 'camaron');
  addPrey('garza', 'pez', 'rana', 'ajolote'); addPrey('pelicano', 'pez', 'sardina'); addPrey('gaviota', 'cangrejo', 'camaron'); addPrey('tiburon', 'manati');
  for (const k of ['mono', 'perezoso', 'koala', 'ardilla']) if (MD_SP[k]) MD_SP[k].arb = 1;
  if (MD_SP.mono) MD_SP.mono.n = 'Monito';
  if (MD_SP.unicornio) MD_SP.unicornio.rb = 1;
  /* reparto por mundo */
  const W = (id, ...pairs) => { const w = MD_WORLDS.find((x) => x.id === id); if (!w) return; for (const [k, n] of pairs) { if (!MD_SP[k]) continue; const e = w.sp.find((x) => x[0] === k); if (e) e[1] = Math.max(e[1], n); else w.sp.push([k, n]); } };
  W('bosque', ['puercoespin', 2], ['erizo', 3], ['caracol', 6], ['raton', 8], ['mapache', 3], ['zorrillo', 2], ['cardenal', 6], ['petirrojo', 6], ['carpintero', 3], ['lince', 2], ['jabali', 4], ['ciervorojo', 4], ['cuervo', 3]);
  W('otono', ['erizo', 3], ['caracol', 6], ['raton', 6], ['mapache', 3], ['ciervorojo', 4], ['cuervo', 4], ['petirrojo', 5], ['jabali', 4], ['marmota', 4]);
  W('sakura', ['dorado', 6], ['koi', 10], ['gato', 4], ['gorrion', 8], ['paloma', 6], ['caracol', 4], ['pandarojo', 3]);
  W('pradera', ['perro', 4], ['gato', 3], ['raton', 8], ['caracol', 6], ['gorrion', 8], ['canario', 6], ['pony', 4], ['marmota', 4], ['erizo', 3], ['cuervo', 3]);
  W('granja', ['perro', 6], ['gato', 5], ['pony', 5], ['burro', 3], ['cuyo', 8], ['raton', 6], ['pavo', 6], ['gallina', 12], ['paloma', 6], ['gorrion', 6], ['alpaca', 4], ['caracol', 5], ['hamster', 4]);
  W('bambu', ['pandarojo', 5], ['lemur', 0], ['dorado', 6], ['koi', 6], ['canario', 6], ['caracol', 5]);
  W('selva', ['mono', 14], ['monoarana', 8], ['titi', 10], ['orangutan', 3], ['guacamaya', 10], ['quetzal', 4], ['pavoreal', 4], ['tapir', 3], ['pantera', 2], ['osohormiguero', 2], ['caracol', 5], ['cacatua', 5]);
  W('amazonas', ['mono', 12], ['monoarana', 10], ['titi', 12], ['guacamaya', 12], ['tapir', 4], ['osohormiguero', 3], ['armadillo', 4], ['quetzal', 3], ['pantera', 2], ['bagre', 6]);
  W('pantano', ['ajolote', 14], ['caracol', 8], ['bagre', 6], ['martin', 4], ['mapache', 3], ['cigueña', 3], ['tortuga', 4]);
  W('manglar', ['mapache', 3], ['martin', 4], ['camaron', 14], ['langosta', 4], ['manati', 3], ['cigueña', 3]);
  W('montanas', ['marmota', 8], ['puma', 2], ['cuervo', 4], ['chinchilla', 4], ['golondrina', 6]);
  W('alpes', ['marmota', 10], ['ciervorojo', 4], ['golondrina', 6], ['lince', 2], ['caracol', 4]);
  W('andes', ['alpaca', 10], ['chinchilla', 8], ['puma', 2], ['cuyo', 6]);
  W('himalaya', ['pandarojo', 4], ['marmota', 6]);
  W('canon', ['puma', 2], ['cuervo', 4], ['golondrina', 8], ['raton', 8], ['armadillo', 3]);
  W('taiga', ['lince', 3], ['marmota', 6], ['cuervo', 4], ['ciervorojo', 5], ['erizo', 2]);
  W('sabana', ['suricata', 14], ['bufalo', 8], ['raton', 6], ['golondrina', 6]);
  W('sahara', ['suricata', 8], ['raton', 6]);
  W('sonora', ['armadillo', 4], ['raton', 8], ['cuervo', 3], ['puma', 1]);
  W('oasis', ['suricata', 6], ['dorado', 6], ['burro', 3], ['paloma', 6]);
  W('prairie', ['marmota', 8], ['perro', 3], ['pony', 5], ['raton', 8]);
  W('australia', ['wombat', 6], ['cacatua', 10], ['erizo', 0]);
  W('india', ['pavoreal', 10], ['mono', 10], ['bufalo', 6], ['jabali', 4], ['paloma', 6], ['gato', 3]);
  W('magico', ['pony', 8], ['erizo', 4], ['caracol', 6], ['canario', 8], ['pavoreal', 4], ['cuyo', 6], ['ajolote', 8], ['koi', 8]);
  W('rio', ['trucha', 10], ['bagre', 6], ['martin', 4], ['mapache', 3], ['ajolote', 6], ['caracol', 4]);
  W('lagoalpino', ['trucha', 10], ['marmota', 6], ['cigueña', 2], ['ciervorojo', 4]);
  W('playa', ['camaron', 10], ['langosta', 4], ['perro', 3], ['golondrina', 6]);
  W('costa', ['camaron', 10], ['langosta', 4], ['golondrina', 6]);
  W('pacifico', ['tortugalaud', 2], ['camaron', 20]);
  W('atlantico', ['langosta', 6], ['camaron', 20], ['tortugalaud', 2]);
  W('indico', ['manati', 4], ['camaron', 16], ['cirujano', 12]);
  W('arrecife', ['cirujano', 18], ['angel', 14], ['pezglobo', 6], ['camaron', 20], ['langosta', 4]);
  W('algas', ['camaron', 16], ['langosta', 6]);
  for (const w of MD_WORLDS) w.sp = w.sp.filter((e) => MD_SP[e[0]] && e[1] > 0 && !MD_SP[e[0]].rb);
})();
/* 7.54 — profundidades del océano, cangrejos y langostas, y refugios de cada especie */
(() => {
  const f = (n, sh, z, v, g, lit, bn, d, look, fx, extra) => Object.assign({ n, t: 'f', sh, h: 'W', d, z, v: [v], pat: 'a', g, lit, bn, prey: [], look, fx, dz: 'deep' }, extra || {});
  Object.assign(MD_SP, {
    calamargig: f('Calamar gigante', 'squid', 3.2, 18, 1, [4, 8], 'calamarcito', 'c', { c: '#c84a3a', b: '#e88a7a' }, 'Tiene los ojos más grandes del reino animal: ¡como un balón!', { prey: ['pezhacha', 'pezlinterna', 'pez'] }),
    pezvibora: f('Pez víbora', 'fish', 0.8, 20, 1, [4, 8], 'pecesito víbora', 'c', { c: '#2a3040', b: '#4a5068', s: '#7ab8ff', teeth: 1, slim: 1 }, 'Sus dientes son tan largos que no le caben en la boca.', { prey: ['pezlinterna', 'pezhacha'], glow: '#7ab8ff' }),
    pulpodumbo: f('Pulpo dumbo', 'octo', 0.8, 10, 1, [3, 6], 'pulpito dumbo', 'o', { c: '#f2a0b8', b: '#ffd0dc' }, 'Nada moviendo sus aletas como orejitas de elefante.', { prey: ['camaron', 'isopodo'] }),
    cangrejoyeti: { n: 'Cangrejo yeti', t: 'f', sh: 'crab', h: 'W', d: 'o', z: 0.7, v: [8], pat: 'a', g: 4, lit: [4, 8], bn: 'cangrejito yeti', prey: [], look: { c: '#f4efe4', b: '#fffaf2' }, fx: 'Vive junto a fuentes de agua caliente y tiene brazos peludos.', dz: 'deep' },
    isopodo: { n: 'Isópodo gigante', t: 'f', sh: 'crab', h: 'W', d: 'o', z: 0.8, v: [6], pat: 'a', g: 3, lit: [3, 6], bn: 'isopodito', prey: [], look: { c: '#c8b8c8', b: '#e8dce8' }, fx: 'Es primo de la cochinilla, ¡pero del tamaño de un gato!', dz: 'deep' },
    medusaabisal: f('Medusa abisal', 'jelly', 0.9, 7, 3, [4, 8], 'medusita', 'f', { c: '#ff5a7a', b: '#ffb0c0', glow: 1 }, 'Brilla en rojo y azul en la oscuridad total.', { glow: '#ff7a9a' }),
    pezhacha: f('Pez hacha', 'fish', 0.45, 18, 10, [4, 8], 'pecesito hacha', 'f', { c: '#c8d0dc', b: '#eef2f8', s: '#8a98b0' }, 'Su pancita brilla para que no se le vea la sombra desde abajo.', { glow: '#a8d8ff' }),
    pezlinterna: f('Pez linterna', 'fish', 0.4, 22, 12, [4, 8], 'pecesito linterna', 'f', { c: '#3a4a6a', b: '#6a7a9a', s: '#7ae8ff' }, 'Tiene lucecitas por todo el cuerpo y sube de noche a comer.', { glow: '#7ae8ff' }),
    tiburonduende: f('Tiburón duende', 'shark', 2, 16, 1, [2, 6], 'tiburoncito duende', 'c', { c: '#e8b0b8', b: '#f4d0d4' }, 'Su mandíbula sale disparada para atrapar comida.', { prey: ['pezvibora', 'pezlinterna', 'pezhacha', 'calamar'] }),
  });
  if (MD_SP.anglerfish) { MD_SP.anglerfish.dz = 'deep'; MD_SP.anglerfish.glow = '#fff3a0'; MD_SP.anglerfish.prey = [...new Set([...(MD_SP.anglerfish.prey || []), 'pezlinterna', 'pezhacha', 'camaron'])]; }
  for (const k of ['ballena', 'jorobada', 'delfin', 'orca', 'foca', 'leonmarino', 'morsa', 'nutria', 'tortugamar', 'tortugalaud', 'narval', 'beluga', 'manati', 'sardina', 'atun', 'manta', 'medusa', 'payaso', 'caballito', 'cirujano', 'angel', 'pezglobo']) if (MD_SP[k]) MD_SP[k].dz = 'surf';
  for (const k of ['calamar']) if (MD_SP[k]) MD_SP[k].dz = 'deep';
  if (MD_SP.cangrejo) MD_SP.cangrejo.dz = 'deep'; if (MD_SP.langosta) { MD_SP.langosta.dz = 'deep'; MD_SP.langosta.h = 'W'; }
  if (MD_SP.cachalote == null && MD_SP.ballena) { MD_SP.cachalote = Object.assign({}, MD_SP.ballena, { n: 'Cachalote', dz: 'mid', d: 'c', prey: ['calamargig', 'calamar'], look: { c: '#5a5a62', b: '#8a8a92' }, fx: 'Baja más de 2000 metros a cazar calamares gigantes aguantando la respiración una hora.' }); }
  const W = (id, ...pairs) => { const w = MD_WORLDS.find((x) => x.id === id); if (!w) return; for (const [k, n] of pairs) { if (!MD_SP[k]) continue; const e = w.sp.find((x) => x[0] === k); if (e) e[1] = Math.max(e[1], n); else w.sp.push([k, n]); } };
  W('pacifico', ['cangrejo', 10], ['langosta', 8], ['pezlinterna', 30], ['pezhacha', 24], ['calamargig', 2], ['pezvibora', 6], ['medusaabisal', 8], ['cachalote', 2], ['pulpodumbo', 3], ['isopodo', 6]);
  W('atlantico', ['cangrejo', 10], ['langosta', 10], ['pezlinterna', 30], ['pezhacha', 20], ['calamargig', 2], ['anglerfish', 4], ['medusaabisal', 6], ['cachalote', 2], ['isopodo', 6]);
  W('indico', ['cangrejo', 10], ['langosta', 6], ['pezlinterna', 24], ['pezhacha', 16], ['pezvibora', 4], ['medusaabisal', 6], ['pulpodumbo', 2]);
  W('artico', ['cangrejo', 12], ['langosta', 4], ['pezlinterna', 16], ['isopodo', 6]);
  W('abismo', ['cangrejoyeti', 14], ['isopodo', 10], ['pezlinterna', 36], ['pezhacha', 30], ['pezvibora', 10], ['medusaabisal', 14], ['pulpodumbo', 6], ['calamargig', 3], ['tiburonduende', 2], ['cachalote', 2], ['langosta', 4]);
  W('arrecife', ['langosta', 6], ['cangrejo', 14]); W('algas', ['langosta', 6], ['cangrejo', 12]);
  W('playa', ['cangrejo', 14]); W('costa', ['cangrejo', 12]); W('manglar', ['cangrejo', 16]);
  /* refugios como en la vida real */
  const H = { burrow: ['conejo', 'liebre', 'zorro', 'zorroart', 'fenec', 'suricata', 'marmota', 'raton', 'hamster', 'armadillo', 'wombat', 'chinchilla', 'cuyo', 'erizo', 'puercoespin', 'coyote', 'dingo'], cave: ['oso', 'osopolar', 'lobo', 'puma', 'leopnieve', 'pantera', 'hiena', 'tigre', 'gorila'], log: ['mapache', 'zorrillo', 'lince', 'serpiente', 'rana', 'lagarto'], hollow: ['buho', 'buhonieve', 'carpintero', 'ardilla', 'loro', 'guacamaya', 'cacatua', 'tucan'], barn: ['vaca', 'oveja', 'cerdo', 'caballo', 'cabra', 'gallina', 'pony', 'burro', 'perro', 'gato', 'alpaca', 'pavo'], seacave: ['pulpo', 'langosta', 'cangrejo', 'pulpodumbo', 'isopodo', 'cangrejoyeti', 'calamar', 'caballito'], anemone: ['payaso'], lodge: ['castor'] };
  for (const [t, ks] of Object.entries(H)) for (const k of ks) if (MD_SP[k]) MD_SP[k].home = t;
  for (const w of MD_WORLDS) w.sp = w.sp.filter((e) => MD_SP[e[0]] && e[1] > 0 && !MD_SP[e[0]].rb);
})();

/* 7.54 — LA GRAN JUNGLA: mundo nuevo con 10 especies más */
(() => {
  const q = (n, z, v, pat, g, lit, bn, d, look, fx, extra) => Object.assign({ n, t: 'q', h: 'L', d, z, v, pat, g, lit, bn, prey: [], look, fx }, extra || {});
  const b = (n, z, v, pat, g, lit, bn, d, nest, look, fx, extra) => Object.assign({ n, t: 'b', h: 'A', d, z, v: [v], pat, g, lit, bn, nest, prey: [], look, fx }, extra || {});
  const N = {
    ocelote: q('Ocelote', 1.2, [30, 110], 'n', 1, [1, 2], 'ocelotito', 'c', { c: '#d8a860', b: '#f6ead0', s: '#4a3020', pt: 'spots', e: 'point', n: 0.3, tl: 'long', ln: 1.05, lg: 0.55 }, 'Caza de noche y ve muy bien en la oscuridad.', { prey: ['aguti', 'raton', 'iguana', 'ranaflecha', 'kinkaju'] }),
    coati: q('Coatí', 0.9, [24, 90], 'd', 4, [2, 4], 'coatí bebé', 'o', { c: '#8a5a3a', b: '#d8c0a0', s: '#3a2a20', e: 'small', n: 0.7, tl: 'long', ln: 1, lg: 0.5 }, 'Husmea la tierra con su nariz larga buscando insectos.', { prey: ['caracol'] }),
    aguti: q('Agutí', 0.7, [24, 100], 'd', 2, [2, 3], 'agutí bebé', 'h', { c: '#a8683a', b: '#e8c890', e: 'small', n: 0.3, tl: 'none', ln: 0.95, lg: 0.55 }, 'Entierra semillas y así siembra nuevos árboles.'),
    pecari: q('Pecarí', 1.0, [22, 80], 'd', 6, [2, 3], 'pecarí bebé', 'o', { c: '#4a4038', b: '#8a8070', s: '#2a241e', e: 'small', n: 0.5, tl: 'none', ln: 1, lg: 0.5 }, 'Anda en manadas y se avisa con un olor fuerte.'),
    kinkaju: q('Kinkajú', 0.75, [20, 70], 'n', 1, [1, 1], 'kinkajú bebé', 'o', { c: '#c89a58', b: '#e8d0a0', e: 'roundbig', n: 0.2, tl: 'long', ln: 0.9, lg: 0.4 }, 'Su cola larga le sirve como una quinta mano para trepar.', { arb: 1 }),
    iguana: q('Iguana verde', 0.95, [14, 60], 'd', 2, [3, 6], 'iguanita', 'h', { c: '#6aa84a', b: '#b8d078', s: '#3a6a28', e: 'none', n: 0.4, tl: 'croc', ln: 1.3, lg: 0.3, ls: 1 }, 'Pasa horas al sol y se lanza al agua si hay peligro.'),
    harpia: b('Águila harpía', 1.8, 80, 'd', 1, [1, 1], 'aguilucho', 'c', 'tree', { c: '#4a4a52', b: '#f2f0ea', head: '#9a9aa2', beak: 'hook', bc: '#2a2a2a', tail: 'fan', big: 1, crest: 'tuft' }, 'Atrapa monos y perezosos entre las ramas.', { prey: ['mono', 'monoarana', 'titi', 'perezoso', 'kinkaju'] }),
    hoatzin: b('Hoatzín', 0.9, 55, 'd', 5, [2, 3], 'pichón', 'h', 'tree', { c: '#8a6a3a', b: '#d8b070', head: '#4a6ab0', beak: 'short', bc: '#c8a050', tail: 'fan', crest: 'tuft' }, 'Sus crías tienen garritas en las alas para trepar.', { h: 'M' }),
    ibisrojo: b('Ibis escarlata', 1.0, 75, 'd', 5, [2, 3], 'ibis bebé', 'c', 'tree', { c: '#e8503a', b: '#f08a6a', beak: 'long', bc: '#3a2a2a', tail: 'short', leg: 'long', neck: 0.7 }, 'Su color rojo viene de los camarones que come.', { prey: ['camaron', 'pez'], h: 'M' }),
    ranaflecha: { n: 'Rana flecha', t: 'x', sh: 'frog', h: 'M', d: 'c', z: 0.5, v: [14, 70], pat: 'a', g: 3, lit: [3, 5], bn: 'renacuajo', prey: [], look: { c: '#2a6ad8', b: '#8ab8f0', s: '#1a3a8a' }, fx: 'Su color brillante avisa que su piel es venenosa.' }
  };
  for (const k in N) if (!MD_SP[k]) MD_SP[k] = N[k];
  const sel = MD_WORLDS.find((w) => w.id === 'selva');
  const w = JSON.parse(JSON.stringify(sel));
  Object.assign(w, { id: 'granjungla', name: 'La Gran Jungla', desc: 'Selva inmensa: monos en las lianas, felinos, aves y ranas de colores.' });
  w.flora = [['jungle', 2.6, 180, 320], ['palm', 0.9, 150, 250], ['fern', 1.8], ['flower', 0.8]];
  w.waters = [['river', 5200, 6200]];
  w.sp = [['mono', 10], ['monoarana', 8], ['titi', 8], ['orangutan', 2], ['loro', 8], ['guacamaya', 8], ['tucan', 6], ['quetzal', 3], ['perezoso', 4], ['capibara', 4], ['jaguar', 2], ['ocelote', 3], ['pantera', 1], ['coati', 5], ['aguti', 5], ['pecari', 5], ['kinkaju', 3], ['iguana', 4], ['harpia', 2], ['hoatzin', 5], ['ibisrojo', 5], ['ranaflecha', 8], ['rana', 5], ['tapir', 3], ['osohormiguero', 2], ['serpiente', 3], ['tortuga', 3], ['cocodrilo', 2], ['pez', 10], ['pirana', 8], ['colibri', 6], ['caracol', 4]];
  w.sp = w.sp.filter((e) => MD_SP[e[0]]);
  const i = MD_WORLDS.findIndex((x) => x.id === 'selva'); MD_WORLDS.splice(i + 1, 0, w);
})();
