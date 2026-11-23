// Enrutador por capas (funciona en cualquier hosting estático, usa #/ruta):
//
//   Capa 1 · Landing   #/            Presentación pública con Sofi.
//   Capa 2 · Login     #/entrar      Elegir quién entra (niño, docente/familia, invitado).
//   Capa 3 · Sistema   #/app/...     Módulos. Protegido: sin sesión redirige al login.
//   Público            #/privacidad  Política de privacidad.

import { CONFIG, nubeActiva } from './config.js';
import { sincronizarPendientes } from './nucleo/store.js';
import { sesion } from './nucleo/sesion.js';
import { detener } from './nucleo/speech.js';
import { esc } from './nucleo/util.js';

const raiz = document.getElementById('raiz');
let limpiar = null;
let capaActual = null;

const ruta = () => decodeURIComponent(location.hash.replace(/^#/, '').split('?')[0]) || '/';

async function navegar() {
  const r = ruta();
  detener();
  if (typeof limpiar === 'function') { try { limpiar(); } catch { /* vista ya desmontada */ } }
  limpiar = null;

  try {
    if (r === '/' || r === '') return await capaSimple('landing', () => import('./capas/landing/landing.js'));
    if (r === '/entrar') return await capaSimple('login', () => import('./capas/login/login.js'));
    if (r === '/privacidad') return await capaSimple('publico', () => import('./capas/publico/privacidad.js'));
    if (r === '/app' || r.startsWith('/app/')) return await capaSistema(r.slice(4));
    location.replace('#/');
  } catch (e) {
    console.error(e);
    const destino = raiz.querySelector('#vista') || raiz;
    destino.innerHTML = `<section class="tarjeta" style="margin:1rem"><h1>¡Ups!</h1><p>No pudimos cargar esta sección. ${navigator.onLine ? '' : 'Parece que no hay internet.'}</p><p class="suave chico">${esc(e.message)}</p><p><a class="btn" href="#/app">Volver</a></p></section>`;
  }
}

/** Landing, login y páginas públicas: ocupan toda la pantalla. */
async function capaSimple(nombre, cargar) {
  const vista = await cargar();
  capaActual = nombre;
  document.body.dataset.capa = nombre;
  document.title = 'Manos Grandes Dientes Chiquitos';
  raiz.innerHTML = '';
  limpiar = await vista.render(raiz, new URLSearchParams(location.hash.split('?')[1] || ''));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/** Sistema: verifica la sesión, monta el armazón una vez y pinta el módulo pedido. */
async function capaSistema(resto) {
  const s = sesion.actual();
  if (!s) {
    location.replace(`#/entrar?volver=${encodeURIComponent('/app' + resto)}`);
    return;
  }
  const [shell, { resolver }] = await Promise.all([import('./capas/sistema/shell.js'), import('./capas/sistema/modulos.js')]);
  const destino = resolver(resto);
  if (!destino || !destino.modulo.roles.includes(s.tipo)) {
    location.replace('#/app');
    return;
  }
  if (capaActual !== 'sistema' || !shell.montado(raiz)) shell.montar(raiz);
  capaActual = 'sistema';
  document.body.dataset.capa = 'sistema';

  const { contenido, vista } = shell.prepararVista(destino.modulo, destino.opciones);
  const modulo = await destino.cargar();
  limpiar = await modulo.render(vista, destino.params);
  contenido.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

window.addEventListener('hashchange', navegar);

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
  // Cuando se publica una versión nueva, recarga una vez para mostrarla de inmediato.
  const habiaVersion = Boolean(navigator.serviceWorker.controller);
  let recargado = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (habiaVersion && !recargado) { recargado = true; location.reload(); }
  });
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// Enlaces de correo de Supabase (confirmar cuenta / recuperar clave) llegan con ?code=...
if (nubeActiva()) {
  import('./nucleo/cloud.js').then(({ nube }) => nube.alCambiarSesion(async (ev) => {
    const venia = new URLSearchParams(location.search).has('code');
    if (!venia && ev !== 'PASSWORD_RECOVERY') return;
    const u = await nube.usuario().catch(() => null);
    if (u) sesion.iniciar('adulto', { nombre: u.nombre, rol: u.rol, nube: true });
    history.replaceState(null, '', location.pathname + (ev === 'PASSWORD_RECOVERY' ? '#/app/cuenta?recuperar' : '#/app'));
    navegar();
  })).catch(() => {});
}

import('./modulos/recordatorios/index.js').then((m) => m.vigilarRecordatorios());
sincronizarPendientes();
navegar();
