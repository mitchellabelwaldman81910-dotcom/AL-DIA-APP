/* Cinnavia 7.28 — Panel de administración en Más (solo la cuenta Mitchell).
   Lista todas las cuentas y permite revisarlas en SOLO LECTURA: lo que se ve de una cuenta nunca se guarda en la tuya
   ni en la de la otra persona, y no se mezcla nada entre cuentas. */
'use strict';
function viewPanel() {
  if (!isAdminSession()) return `<a class="back" href="#/mas">${icon('back')}Más</a><div class="empty" style="margin-top:20px"><h3>Solo para administración</h3><p>Entra con la cuenta de administración para ver este panel.</p></div>`;
  if (!ADM.loading) { ADM.loading = true; cloudFetch('GET', null, 'kind=admin').then((d) => { ADM.data = d; ADM.loading = false; adminPaint(); }).catch((e) => { ADM.loading = false; const b = document.getElementById('admBody'); if (b) b.innerHTML = `<p class="small" style="color:var(--red)">${esc(e.message)}</p>`; }); }
  if (ADM.data) setTimeout(adminPaint, 0);
  return `<a class="back" href="#/mas">${icon('back')}Más</a><h1 class="page-title">Panel</h1>
    <p class="page-sub">Todas las cuentas creadas en Cinnavia, para que las revises por seguridad.</p>
    <div class="card pn-safe"><b>Revisión segura</b><ul>
      <li>Al entrar a una cuenta la ves en <b>solo lectura</b>: nada de lo que veas se guarda en tu cuenta ni en la de ella.</li>
      <li>Los datos de cada cuenta se quedan en su propio lugar; nunca se combinan con los tuyos.</li>
      <li>Quien tenga esa sesión abierta ve que la administración está ahí.</li>
      <li>Al salir, este dispositivo borra lo que descargó de esa cuenta.</li></ul></div>
    <div id="admBody" style="margin-top:14px">${ADM.data ? '' : (typeof loaderHTML === 'function' ? loaderHTML('Cargando cuentas…') : 'Cargando cuentas…')}</div>
    <div class="btn-row" style="margin-top:14px"><button class="btn" data-act="adm-export">${icon('download')}Respaldo total</button></div>`;
}
EXTRA_VIEWS.panel = viewPanel; EXTRA_NAV.panel = 'mas';
{
  const bm = viewMas;
  viewMas = function () { const h = bm(); if (!isAdminSession()) return h; const row = `<ul class="rows" style="margin-bottom:14px"><li><a href="#/panel"><span class="ico">${icon('users')}</span><span class="txt"><b>Panel de administración</b><span>Ver y revisar todas las cuentas creadas</span></span>${icon('chev', 'chev')}</a></li></ul>`; return h.includes('<ul class="rows"') ? h.replace('<ul class="rows"', row + '<ul class="rows"') : h + row; };
}

/* ---------- Revisión en solo lectura de verdad ----------
   Mientras la administración está dentro de otra cuenta: no se guarda nada en el dispositivo, no se envía nada a la nube
   (salvo recuperar copias, que pide confirmación) y se muestra un aviso con botón para salir. */
{
  const baseSave = save;
  save = function () { if (REG.current && isAdminView()) return; return baseSave(); };
  const baseFetch = cloudFetch;
  cloudFetch = function (method, body, query) {
    if (method && method !== 'GET' && REG.current && isAdminView() && !(body && ['adminenter', 'restore', 'grestore'].includes(body.kind))) return Promise.reject(new Error('Estás revisando esta cuenta en solo lectura: no se puede modificar.'));
    return baseFetch.apply(this, arguments);
  };
  const bar = () => {
    let el = document.getElementById('admBanner'); const on = !!(REG.current && isAdminView() && REG.me && REG.current !== REG.me);
    if (!on) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'admBanner'; el.className = 'adm-banner'; el.innerHTML = '<span></span><button type="button" class="btn" id="admBack">Salir</button>'; document.body.appendChild(el); el.querySelector('#admBack').addEventListener('click', () => { switchProfile(REG.me); }); }
    const nm = (profile(REG.current) || {}).name || REG.current; const sp = el.querySelector('span'); const t = `Modo revisión · solo lectura · ${nm}`; if (sp.textContent !== t) sp.textContent = t;
  };
  setInterval(bar, 700);
}
