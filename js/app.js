// Punto de entrada: enrutador por hash (#/ruta), compatible con cualquier hosting estático.

import { CONFIG, nubeActiva } from './config.js';
import { perfiles, sincronizarPendientes } from './store.js';
import { detener } from './speech.js';
import { esc, $ } from './util.js';

const RUTAS = [
  [/^\/?$/, () => import('./views/inicio.js')],
  [/^\/perfil$/, () => import('./views/perfil.js')],
  [/^\/juegos$/, () => import('./views/juegos.js')],
  [/^\/juegos\/([\w-]+)$/, () => import('./views/juego.js')],
  [/^\/cuentos$/, () => import('./views/cuentos.js')],
  [/^\/cuentos\/nuevo$/, () => import('./views/cuento-nuevo.js')],
  [/^\/cuentos\/(local|nube|base)\/([\w-]+)$/, () => import('./views/lector.js')],
  [/^\/padres$/, () => import('./views/padres.js')],
  [/^\/padres\/([\w-]+)$/, () => import('./views/articulo.js')],
  [/^\/docentes$/, () => import('./views/docentes.js')],
  [/^\/recordatorios$/, () => import('./views/recordatorios.js')],
  [/^\/foro$/, () => import('./views/foro.js')],
  [/^\/foro\/([\w-]+)$/, () => import('./views/foro.js')],
  [/^\/contacto$/, () => import('./views/contacto.js')],
  [/^\/cuenta$/, () => import('./views/cuenta.js')],
  [/^\/admin$/, () => import('./views/admin.js')],
  [/^\/privacidad$/, () => import('./views/privacidad.js')],
];

const app = $('#app');
let limpiar = null;

async function navegar() {
  const ruta = decodeURIComponent(location.hash.replace(/^#/, '').split('?')[0]) || '/';
  detener();
  if (typeof limpiar === 'function') limpiar();
  limpiar = null;

  const encontrada = RUTAS.find(([re]) => re.test(ruta));
  const seccion = ruta.split('/')[1] || 'inicio';
  document.querySelectorAll('.menu a').forEach((a) => a.classList.toggle('activo', a.dataset.sec === seccion));
  $('#menu').classList.remove('abierto');
  $('.menu-btn').setAttribute('aria-expanded', 'false');

  if (!encontrada) {
    app.innerHTML = `<section class="tarjeta centro"><h1>Página no encontrada</h1><p><a class="btn" href="#/">Volver al inicio</a></p></section>`;
    return;
  }
  const params = ruta.match(encontrada[0]).slice(1);
  try {
    const vista = await encontrada[1]();
    app.innerHTML = '';
    limpiar = await vista.render(app, params);
  } catch (e) {
    console.error(e);
    app.innerHTML = `<section class="tarjeta"><h1>¡Ups!</h1><p>No pudimos cargar esta sección. ${navigator.onLine ? '' : 'Parece que no hay internet.'}</p><p class="suave chico">${esc(e.message)}</p><p><a class="btn" href="#/">Ir al inicio</a></p></section>`;
  }
  app.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function pintarChipPerfil() {
  const p = perfiles.activo();
  $('#chip-perfil').textContent = p ? `${p.avatar} ${p.apodo}` : '🙂 ¿Quién juega?';
}

// Menú móvil
$('.menu-btn').addEventListener('click', (e) => {
  const abierto = $('#menu').classList.toggle('abierto');
  e.currentTarget.setAttribute('aria-expanded', String(abierto));
});

// Estado de conexión
const pintarRed = () => { $('#estado-red').hidden = navigator.onLine; };
window.addEventListener('online', pintarRed);
window.addEventListener('offline', pintarRed);

window.addEventListener('hashchange', navegar);
window.addEventListener('mgdc:cambio', pintarChipPerfil);

// Estadísticas de visitas sin cookies (opcional)
if (CONFIG.cloudflareAnalyticsToken) {
  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.dataset.cfBeacon = JSON.stringify({ token: CONFIG.cloudflareAnalyticsToken });
  document.head.append(s);
}

// Funciona sin internet (PWA)
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Sesión de Supabase: al confirmar correo, vuelve a la cuenta.
if (nubeActiva()) {
  import('./cloud.js').then(({ nube }) => nube.alCambiarSesion((ev) => {
    // Enlaces de correo (confirmar cuenta / recuperar clave) llegan con ?code=...
    const venia = new URLSearchParams(location.search).has('code');
    if (venia) history.replaceState(null, '', location.pathname + (ev === 'PASSWORD_RECOVERY' ? '#/cuenta?recuperar' : '#/cuenta'));
    if (venia || ev === 'PASSWORD_RECOVERY') navegar();
  })).catch(() => {});
}

import('./views/recordatorios.js').then((m) => m.vigilarRecordatorios());

pintarChipPerfil();
pintarRed();
sincronizarPendientes();
navegar();
