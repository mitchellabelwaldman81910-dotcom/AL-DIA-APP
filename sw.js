/* Cinnavia — service worker: funciona sin internet y manda avisos. */
const VERSION = 'aldia-v7.60.2';
const V = '?v=7.60.2';
const SHELL = [
  './',
  './index.html',
  './a/styles.css' + V,
  './a/app.js' + V,
  './a/glifos.js' + V,
  './a/linea.js' + V,
  './a/vida.js' + V,
  './a/extras.js' + V,
  './a/plus.js' + V,
  './a/brain.js' + V,
  './a/estilos.js' + V,
  './a/vivo.js' + V,
  './a/salones.js' + V,
  './a/inicio.js' + V,
  './a/admin.js' + V,
  './a/tienda.js' + V,
  './a/pizarra.js' + V,
  './a/social.js' + V,
  './a/agente.js' + V,
  './a/libretas.js' + V,
  './a/compartidas.js' + V,
  './a/equipo.js' + V,
  './a/escaner.js' + V,
  './a/lector.js' + V,
  './a/camara.js' + V,
  './a/skills.js' + V,
  './a/minimal.js' + V,
  './a/lienzo.js' + V,
  './a/calculadora.js' + V,
  './a/recordatorios.js' + V,
  './a/juego.js' + V,
  './a/biomas.js' + V,
  './a/galope.js' + V,
  './a/skins.js' + V,
  './a/fauna.js' + V,
  './a/ramas.js' + V,
  './a/panel.js' + V,
  './a/skills2.js' + V,
  './a/juegos.js' + V,
  './a/juegos2.js' + V,
  './a/peloton.js' + V,
  './a/juegos3.js' + V,
  './a/gusano-motor.js' + V,
  './a/gusano-niveles.js' + V,
  './a/gusano.js' + V,
  './a/guardian.js' + V,
  './a/dictado.js' + V,
  './a/pintura.js' + V,
  './a/legible.js' + V,
  './a/ojo.js' + V,
  './a/navidad.js' + V,
  './a/estaciones.js' + V,
  './a/bosque.js' + V,
  './a/calma.js' + V,
  './a/planeador.js' + V,
  './a/plantilla.js' + V,
  './a/docente.js' + V,
  './a/aula.js' + V,
  './a/libros.js' + V,
  './a/granbosque-arte.js' + V,
  './a/granbosque.js' + V,
  './a/mundos-data.js' + V,
  './a/mundos-data2.js' + V,
  './a/mundos-arte.js' + V,
  './a/mundos-flora.js' + V,
  './a/mundos-sim.js' + V,
  './a/mundos-tierra.js' + V,
  './a/mundos.js' + V,
  './a/mundos-vida.js' + V,
  './a/mundos-arbol.js' + V,
  './a/mundos-fam.js' + V,
  './a/mundos-primates.js' + V,
  './a/mundos-info.js' + V,
  './a/mundos-real.js' + V,
  './a/mundos-fruta.js' + V,
  './a/mundos-dieta.js' + V,
  './a/mundos-crear.js' + V,
  './a/presentacion.js' + V,
  './a/mono-arte.js' + V,
  './a/mono.js' + V,
  './a/mono-tienda.js' + V,
  './a/sugerencias.js' + V,
  './a/naturaleza.js' + V,
  './icons/cinnavia.svg',
  './manifest.webmanifest',
  './fonts/schola-bold.woff',
  './fonts/schola-regular.woff',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/badge-96.png',
  './icons/favicon-32.png',
];

self.addEventListener('install', (e) => {
  // la versión nueva entra en cuanto termina de descargarse: nunca se mezclan archivos de dos versiones
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== VERSION && k !== 'aldia-data' && k !== 'aldia-lector').map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // el lector de fotos se descarga una vez y se guarda para usarlo sin internet
  if (url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open('aldia-lector').then(async (c) => (await c.match(req)) || fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; })));
    return;
  }
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // la nube nunca se guarda en caché

  // Páginas: primero la red (para tener la versión más nueva), si no hay red, la copia guardada.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const c = await caches.open(VERSION);
        c.put('./index.html', res.clone());
        return res;
      } catch {
        return (await caches.match('./index.html', { ignoreSearch: true })) || (await caches.match('./', { ignoreSearch: true }));
      }
    })());
    return;
  }

  // Archivos de la app: primero la copia guardada, y se actualiza en segundo plano.
  e.respondWith((async () => {
    // cada archivo lleva la versión en su dirección (?v=…): se busca exacto, así una página nueva nunca usa un archivo viejo
    const cached = await caches.match(req);
    const network = fetch(req).then(async (res) => {
      if (res && res.ok) { const c = await caches.open(VERSION); c.put(req, res.clone()); }
      return res;
    }).catch(() => null);
    return cached || (await network) || new Response('', { status: 504 });
  })());
});

/* ---------- Avisos ---------- */
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

async function digest() {
  const c = await caches.open('aldia-data');
  const res = await c.match('upcoming.json');
  if (!res) return;
  const data = await res.json();
  const now = new Date();
  const today = iso(now);
  const tm = new Date(now); tm.setDate(tm.getDate() + 1);
  const tomorrow = iso(tm);
  const meta = await c.match('meta.json').then((r) => (r ? r.json() : {})).catch(() => ({}));
  if (meta.lastShown === today) return;
  const profiles = Array.isArray(data.profiles) ? data.profiles : [{ name: '', notify: data.notify, tasks: data.tasks || [] }];
  const lines = [];
  for (const p of profiles) {
    if (!p.notify) continue;
    const late = p.tasks.filter((t) => t.due < today).length;
    const hoy = p.tasks.filter((t) => t.due === today).map((t) => t.title);
    const man = p.tasks.filter((t) => t.due === tomorrow).map((t) => t.title);
    if (!late && !hoy.length && !man.length) continue;
    const parts = [];
    if (hoy.length) parts.push(`hoy ${hoy.slice(0, 2).join(', ')}${hoy.length > 2 ? '…' : ''}`);
    if (man.length) parts.push(`mañana ${man.slice(0, 2).join(', ')}${man.length > 2 ? '…' : ''}`);
    if (late) parts.push(late === 1 ? '1 atrasada' : `${late} atrasadas`);
    lines.push(`${p.name ? p.name + ': ' : ''}${parts.join('; ')}`);
  }
  if (!lines.length) return;
  await self.registration.showNotification('Tus entregas', {
    body: lines.join('\n'), tag: 'aldia-digest', icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', lang: 'es-MX',
  });
  await c.put('meta.json', new Response(JSON.stringify({ lastShown: today })));
}

self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'aldia-digest') e.waitUntil(digest());
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: 'Cinnavia', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Cinnavia', {
    body: d.body || '', tag: d.tag, renotify: !!d.tag, icon: 'icons/icon-192.png', badge: 'icons/badge-96.png', lang: 'es-MX', vibrate: [80, 40, 80], data: { url: d.url || '#/hoy' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const scope = self.registration.scope;
    const client = all.find((c) => c.url.startsWith(scope));
    const url = (e.notification.data && e.notification.data.url) || '#/hoy';
    if (client) { await client.focus(); try { client.postMessage({ nav: url }); } catch { /* */ } return; }
    await self.clients.openWindow(scope + ((e.notification.data && e.notification.data.url) || '#/hoy'));
  })());
});
