// Service worker: permite usar el sitio sin internet (juegos, cuentos, guías).
// Al cambiar archivos del sitio, sube el número de VERSION para que se actualicen.

const VERSION = 'mgdc-v9';
const ARCHIVOS = [
  './', 'index.html', 'manifest.webmanifest', 'css/base.css', 'css/landing.css', 'css/login.css', 'css/modulos.css',
  'css/sistema.css', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/cepillo.svg', 'img/sofi.webp', 'img/sofi-cuerpo.webp', 'img/sofi-brazo.webp', 'img/sofi-cara.webp', 'js/app.js', 'js/capas/landing/landing.js',
  'js/capas/login/login.js', 'js/capas/publico/privacidad.js', 'js/capas/sistema/inicio.js', 'js/capas/sistema/modulos.js',
  'js/capas/sistema/shell.js', 'js/config.js', 'js/modulos/admin/index.js', 'js/modulos/contacto/index.js',
  'js/modulos/cuenta/index.js', 'js/modulos/cuentos/datos.js', 'js/modulos/cuentos/editor.js', 'js/modulos/cuentos/importer.js',
  'js/modulos/cuentos/index.js', 'js/modulos/cuentos/lector.js', 'js/modulos/docentes/index.js', 'js/modulos/foro/index.js',
  'js/modulos/guias/articulo.js', 'js/modulos/guias/datos.js', 'js/modulos/guias/index.js', 'js/modulos/juegos/games/alimentos.js',
  'js/modulos/juegos/games/bacterias.js', 'js/modulos/juegos/games/cepillado.js', 'js/modulos/juegos/games/comun.js',
  'js/modulos/juegos/games/memoria.js', 'js/modulos/juegos/games/quiz.js', 'js/modulos/juegos/index.js',
  'js/modulos/juegos/juego.js', 'js/modulos/perfil/index.js', 'js/modulos/recordatorios/index.js', 'js/nucleo/character.js',
  'js/nucleo/cloud.js', 'js/nucleo/iconos.js', 'js/nucleo/ics.js', 'js/nucleo/idb.js', 'js/nucleo/sesion.js', 'js/nucleo/sofi.js',
  'js/nucleo/speech.js', 'js/nucleo/store.js', 'js/nucleo/util.js',
];
const CDN = ['cdn.jsdelivr.net', 'esm.sh'];

self.addEventListener('install', (e) => {
  // cache: 'reload' evita copiar versiones viejas guardadas por el navegador.
  e.waitUntil(caches.open(VERSION)
    .then((c) => c.addAll(ARCHIVOS.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Archivos del propio sitio: responde rápido desde caché y actualiza en segundo plano.
  if (url.origin === location.origin) {
    e.respondWith(caches.open(VERSION).then(async (cache) => {
      const guardada = await cache.match(req, { ignoreSearch: true });
      const red = fetch(req.url, { cache: 'no-cache' }).then((r) => { if (r.ok) cache.put(req, r.clone()); return r; }).catch(() => guardada);
      return guardada || red;
    }));
    return;
  }

  // Librerías de CDN (versiones fijas) e imágenes públicas de cuentos: caché primero.
  const esImagenCuento = url.pathname.includes('/storage/v1/object/public/cuentos/');
  if (CDN.includes(url.hostname) || esImagenCuento) {
    e.respondWith(caches.open(`${VERSION}-ext`).then(async (cache) => {
      const guardada = await cache.match(req);
      if (guardada) return guardada;
      const r = await fetch(req);
      if (r.ok || r.type === 'opaque') cache.put(req, r.clone());
      return r;
    }));
  }
  // Todo lo demás (API de Supabase, analítica, YouTube) va directo a la red.
});
