/* Cinnavia 7.56 — MUNDOS · botón "?" con la ficha completa de cada animal (para aprender). */
'use strict';
const MD_TAXA = {
  rept: ['lagarto', 'iguana', 'serpiente', 'cocodrilo', 'tortuga', 'tortugamar', 'tortugalaud'], dino: ['trike', 'stego', 'bronto', 'trex'], ptero: ['pterodactilo'],
  anf: ['rana', 'ranaflecha', 'ajolote'], crus: ['cangrejo', 'langosta', 'camaron', 'isopodo', 'cangrejoyeti'], mol: ['pulpo', 'calamar', 'calamargig', 'pulpodumbo', 'caracol'], med: ['medusa', 'medusaabisal'], estr: ['estrella'],
  mmar: ['ballena', 'jorobada', 'orca', 'delfin', 'narval', 'beluga', 'foca', 'leonmarino', 'morsa', 'manati', 'nutria', 'cachalote'], prim: ['mono', 'monoarana', 'titi', 'capuchino', 'aullador', 'babuino', 'mandril', 'macaco', 'gibon', 'colobo', 'langur', 'monoardilla', 'tamarino', 'orangutan', 'gorila', 'lemur']
};
const MD_TAXA_TXT = {
  Mamífero: 'Animal de sangre caliente, con pelo, que alimenta a sus crías con la leche de la mamá.', Primate: 'Mamífero de manos hábiles y cerebro grande; casi todos viven en grupo y usan mucho la vista.', 'Mamífero marino': 'Mamífero que vive en el agua: respira aire con pulmones y por eso sube a la superficie.',
  Ave: 'Animal con plumas y pico que pone huevos; la mayoría vuela y muchas construyen nidos.', Reptil: 'Animal de sangre fría con escamas o caparazón; necesita el sol para calentar su cuerpo.', Dinosaurio: 'Reptil gigante que vivió hace millones de años; en este mundo fantástico convive con otros animales.', Pterosaurio: 'Reptil volador prehistórico, con alas de piel.',
  Anfibio: 'Animal de piel húmeda que empieza su vida en el agua (renacuajo) y de adulto vive entre agua y tierra.', Pez: 'Animal acuático que respira por branquias y nada con aletas.', Crustáceo: 'Animal con caparazón duro y patas articuladas; crece cambiando de caparazón.', Molusco: 'Animal de cuerpo blando, con o sin concha.', Medusa: 'Animal del agua con cuerpo gelatinoso y tentáculos.', Equinodermo: 'Animal marino con simetría de estrella.'
};
function mdTaxon(a) {
  const k = a.sp, S = a.S; const has = (g) => MD_TAXA[g].includes(k);
  if (has('prim')) return 'Primate'; if (has('mmar')) return 'Mamífero marino'; if (has('dino')) return 'Dinosaurio'; if (has('ptero')) return 'Pterosaurio'; if (has('rept')) return 'Reptil'; if (has('anf')) return 'Anfibio'; if (has('crus')) return 'Crustáceo'; if (has('mol')) return 'Molusco'; if (has('med')) return 'Medusa'; if (has('estr')) return 'Equinodermo';
  if (S.t === 'b') return 'Ave'; if (S.t === 'f') return 'Pez'; if (S.sh === 'frog') return 'Anfibio'; if (S.t === 'q') return 'Mamífero'; return 'Animal';
}
const MD_HOMEINFO_TXT = { burrow: 'Madriguera: un túnel bajo tierra donde duerme, se protege del frío y del calor y cría a sus pequeños.', cave: 'Cueva: un refugio de roca para pasar la noche, el invierno o las tormentas.', log: 'Tronco hueco o refugio entre troncos y hojas.', hollow: 'Hueco en un árbol: seco, escondido y seguro.', barn: 'Establo o granero, donde la gente les da refugio y comida.', seacave: 'Cueva o grieta del fondo marino donde se esconde de los depredadores.', anemone: 'Vive protegido entre los tentáculos de una anémona.', lodge: 'Una madriguera de ramas y barro construida en el agua.' };
const MD_NEST_TXT = { tree: 'en la rama de un árbol', ground: 'en el suelo, entre hierba', cliff: 'en un risco o roca alta', hole: 'en un hueco' };
function mdSizeTxt(z) { return z < 0.6 ? 'diminuto' : z < 1 ? 'pequeño' : z < 1.6 ? 'mediano' : z < 2.6 ? 'grande' : z < 4 ? 'muy grande' : 'gigante'; }
function mdEncyclopedia(a) {
  const S = a.S, k = a.sp, tax = mdTaxon(a), pred = mdPredatorsOf(k).map((p) => MD_SP[p].n), prey = (S.prey || []).filter((p) => MD_SP[p]).map((p) => MD_SP[p].n);
  const worlds = MD_WORLDS.filter((w) => !w.custom && w.sp.some((e) => e[0] === k)).map((w) => w.name);
  const call = typeof mdCallOf === 'function' ? mdCallOf(a) : null, kmh = Math.round((S.v[1] || S.v[0]) / 4), kmhW = Math.round(S.v[0] / 4);
  const fam = MDS.an.filter((o) => o.sp === k && !o.dead && o !== a).map((o) => `${o.name} (${o.age < 1 ? 'cría' : o.male ? 'macho' : 'hembra'})`);
  const mom = MDS.an.find((o) => o.id === a.mom && !o.dead);
  const row = (l, v) => `<div class="md-ir"><span>${esc(l)}</span><b>${v}</b></div>`;
  const sec = (t, body) => `<section class="md-is"><h3>${esc(t)}</h3>${body}</section>`;
  const abilities = []; const L = S.look || {};
  if (L.spk) abilities.push('Tiene púas para defenderse.'); if (L.shell) abilities.push('Su caparazón lo protege de casi todo.'); if (L.mn) abilities.push('Tiene melena o crin.'); if (L.tk) abilities.push('Tiene colmillos largos.'); if (L.hm) abilities.push('Tiene joroba o cuernos.'); if (L.pr) abilities.push('Sus manos pueden agarrar y sostener cosas.'); if (a.arb) abilities.push('Sabe trepar a los árboles y moverse entre las ramas.'); if (S.layer === 'air' || S.t === 'b') abilities.push('Puede volar o planear para escapar y buscar comida.'); if (S.t === 'f' || S.h === 'W') abilities.push('Nada y respira bajo el agua (o sube a respirar).'); if (S.dz === 'deep') abilities.push('Vive en la oscuridad de las profundidades; algunos producen luz propia.'); if (S.glow) abilities.push('Produce luz propia (bioluminiscencia).');
  const flees = S.d === 'c' ? 'Es depredador: caza con sigilo, velocidad o emboscada, y después descansa para digerir.' : (pred.length ? 'Es presa: vive alerta, huye en zigzag y se esconde en refugios.' : 'No tiene depredadores naturales en este mundo.');
  const status = (a.hurt > MDS.t ? 'Herido (camina más lento)' : a.state === 'dead' ? 'Fuera de combate' : MD_STATE[a.state] || 'Tranquilo');
  const mins = Math.floor((MDS.t - a.born) / 60);
  return `<div class="md-ih"><div><b>${esc(S.n)}</b><span>${esc(tax)} · ${esc(MD_HAB_TXT[S.h] || 'Tierra')}</span></div><button type="button" class="md-x" data-act="md-info-close" aria-label="Cerrar">×</button></div>
  <div class="md-ib2">
  ${sec('Qué es', `<p>${esc(MD_TAXA_TXT[tax] || '')}</p><p>${esc(S.fx || '')}</p>`)}
  ${sec('Ficha básica', row('Grupo', esc(tax)) + row('Tamaño', mdSizeTxt(S.z)) + row('Velocidad al caminar', kmhW + ' km/h') + row('Velocidad máxima', kmh + ' km/h') + row('Vive en', esc(MD_HAB_TXT[S.h] || 'Tierra')) + row('Activo', esc(MD_PAT_TXT[S.pat] || '—')) + row('Dónde se encuentra', esc(worlds.join(', ') || 'este mundo')))}
  ${sec('Qué come', `<p>${esc(MD_DIET_TXT[S.d] || '')}. ${esc(mdFoodOf(k))}.</p>` + (prey.length ? `<p>Presas: ${esc(prey.join(', '))}.</p>` : ''))}
  ${sec('Quién se lo come', `<p>${pred.length ? esc(pred.join(', ')) : 'Nadie lo caza en este mundo.'}</p><p>${esc(flees)}</p>`)}
  ${sec('Cadena alimenticia', `<p class="md-chain">${mdChain(k).map((x) => `<span>${esc(x)}</span>`).join('<i>→</i>')}</p>`)}
  ${sec('Vida social', row('Grupo', S.g > 1 ? 'vive en grupos de hasta ' + S.g : 'solitario') + `<p>En este mundo hay un macho, una hembra y una cría de cada especie; cuando una cría crece, se va a buscar su propio territorio.</p>`)}
  ${sec('Reproducción', row('Crías por parto', S.lit[0] + (S.lit[1] > S.lit[0] ? '–' + S.lit[1] : '')) + row('Nombre de la cría', esc(S.bn)) + (S.t === 'b' ? row('Nido', esc(MD_NEST_TXT[S.nest] || 'en un lugar seguro')) + `<p>Pone huevos que se calientan en el nido; los padres traen comida a los polluelos hasta que aprenden a volar.</p>` : S.t === 'f' ? `<p>Sus crías (alevines) nacen pequeñas y se esconden o nadan en cardumen para sobrevivir.</p>` : `<p>La hembra espera un tiempo antes del parto; la cría sigue a su mamá y aprende de ella.</p>`))}
  ${sec('Refugio', `<p>${esc(MD_HOMEINFO_TXT[S.home] || (S.t === 'b' ? 'Duerme en las ramas o en el nido.' : 'Descansa en lugares tapados: arbustos, árboles o rocas.'))}</p>`)}
  ${sec('Cómo se mueve y se defiende', (abilities.length ? '<ul>' + abilities.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>' : '') + `<p>Cuando hay tormenta, temblor, incendio o inundación busca refugio, sube a un sitio alto o huye.</p>`)}
  ${call ? sec('Sonido', `<p>Su llamado suena así: «${esc(call[0])}».</p>`) : sec('Sonido', '<p>Casi no hace ruido; se comunica con el cuerpo, el olor o la vista.</p>')}
  ${sec(`Este ejemplar: ${a.name}`, row('Sexo', a.male ? 'macho' : 'hembra') + row('Edad', esc(mdAgeTxt(a))) + row('Ahora', esc(status)) + row('Barriga llena', Math.round((1 - a.hunger) * 100) + ' %') + row('Energía', Math.round(a.energy * 100) + ' %') + row('Ánimo', Math.round(a.mood * 100) + ' %') + row('Crías que ha tenido', a.kids) + row('Presas', a.kills) + row('Distancia recorrida', Math.round(a.dist / 40) + ' m') + row('Tiempo en el mundo', mins + ' min') + (a.life ? row('Vida estimada', Math.round(a.life / 60) + ' min') : '') + (mom ? row('Mamá', esc(mom.name)) : '') + (fam.length ? row('Su especie aquí', esc(fam.join(', '))) : '') + (a.falls ? row('Caídas de árboles', a.falls) : ''))}
  </div>`;
}
Object.assign(VIDA_ACTS, {
  'md-info': () => { const a = MDV.sel; if (!a) return; let el = document.getElementById('mdInfo'); if (!el) { el = document.createElement('div'); el.id = 'mdInfo'; el.className = 'md-info'; document.body.appendChild(el); } el.innerHTML = mdEncyclopedia(a); el.hidden = false; el.scrollTop = 0; },
  'md-info-close': () => { const el = document.getElementById('mdInfo'); if (el) el.hidden = true; }
});
