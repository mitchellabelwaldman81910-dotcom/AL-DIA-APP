/* Cinnavia 8.1 — Pulido: botón para volver arriba en pantallas largas. */
'use strict';
{
  const b = document.createElement('button'); b.type = 'button'; b.className = 'pu-top'; b.setAttribute('aria-label', 'Volver arriba'); b.textContent = '↑';
  b.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
  document.body.appendChild(b);
  let t = 0; addEventListener('scroll', () => { if (t) return; t = setTimeout(() => { t = 0; b.classList.toggle('on', scrollY > 700); }, 120); }, { passive: true });
}
