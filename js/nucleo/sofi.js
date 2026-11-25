// Sofi, la doctora de las sonrisas: personaje guía de la landing, el login y el sistema.

import { leer, vozDisponible } from './speech.js';

export const SOFI = {
  nombre: 'Sofi',
  img: 'img/sofi.webp',           // Sofi completa saludando (720 × 1148)
  cuerpo: 'img/sofi-cuerpo.webp', // capas para animar el saludo
  brazo: 'img/sofi-brazo.webp',
  cara: 'img/sofi-cara.webp',
  busto: 'img/sofi-busto.webp',   // hasta los hombros, saludando (560 × 533)
  ancho: 720,
  alto: 1148,
  bienvenida: '¡Hola! ¡Qué alegría verte por aquí! Soy Sofi, la doctora de las sonrisas. Bienvenido a Manos Grandes, Dientes Chiquitos. Aquí vamos a aprender a cuidar nuestros dientes jugando, leyendo cuentos y en familia. ¿Empezamos?',
  saludo: '¡Hola! Soy Sofi, la doctora de las sonrisas. Bienvenido a Manos Grandes, Dientes Chiquitos. Con mi amigo Dientín vamos a aprender a cuidar los dientes jugando.',
};

/** Dientín ilustrado (el SVG de character.js sigue en los juegos). */
export const DIENTIN = { img: 'img/dientin.webp', ancho: 600, alto: 545 };

/** Sofi hasta los hombros, en capas: cuerpo, mano (saluda) y párpados (parpadea). */
export function sofiBusto({ clase = '' } = {}) {
  return `<div class="personaje busto-sofi ${clase}" data-parpadea="2800,6500" role="img" aria-label="Sofi, la doctora de las sonrisas, saludando">
    <img class="capa" src="img/sofi-busto-cuerpo.webp" width="560" height="533" alt="" loading="lazy">
    <img class="capa busto-mano" src="img/sofi-busto-mano.webp" width="560" height="533" alt="" loading="lazy">
    <img class="capa ojos" src="img/sofi-busto-ojos.webp" width="560" height="533" alt="" loading="lazy">
  </div>`;
}

/**
 * Dientín en capas: cuerpo (con su cepillo quieto), mano que saluda y párpados.
 * `saludaAlPasar`: saluda con la mano cuando el mouse pasa por encima.
 */
export function dientinVivo({ clase = '', cadaCuanto = '2800,6000', saludaAlPasar = false } = {}) {
  return `<div class="personaje dientin-vivo ${clase}" data-parpadea="${cadaCuanto}" ${saludaAlPasar ? 'data-saluda-al-pasar' : ''} role="img" aria-label="Dientín, el diente amigo, con su cepillo">
    <img class="capa" src="img/dientin-cuerpo.webp" width="600" height="545" alt="" loading="lazy">
    <img class="capa dientin-mano" src="img/dientin-mano.webp" width="600" height="545" alt="" loading="lazy">
    <img class="capa ojos" src="img/dientin-ojos.webp" width="600" height="545" alt="" loading="lazy">
  </div>`;
}

/**
 * Da vida a los personajes dentro de `raiz`: parpadean al azar dentro del lapso de data-parpadea
 * (a veces dos veces seguidas) y al pasar el mouse; los que tienen data-saluda-al-pasar saludan.
 * Mientras un personaje tenga data-pausa no parpadea (por ejemplo, mientras habla).
 * Devuelve una función que detiene todo.
 */
export function darVida(raiz) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const relojes = new Set();
  const luego = (fn, ms) => { const t = setTimeout(() => { relojes.delete(t); fn(); }, ms); relojes.add(t); };
  const azar = (a, b) => a + Math.random() * (b - a);
  const pulso = (el, clase, ms) => { el.classList.add(clase); luego(() => el.classList.remove(clase), ms); };

  const limpiar = [];
  const escuchar = (el, ev, fn) => { el.addEventListener(ev, fn); limpiar.push(() => el.removeEventListener(ev, fn)); };
  const lista = [...raiz.querySelectorAll('[data-parpadea]')];
  if (raiz.matches?.('[data-parpadea]')) lista.push(raiz);
  lista.forEach((el) => {
    const [min, max] = (el.dataset.parpadea || '2800,6000').split(',').map(Number);
    let ultimo = 0;
    const cerrar = () => {
      if (el.classList.contains('parpadeo') || el.hasAttribute('data-pausa')) return;
      ultimo = Date.now();
      pulso(el, 'parpadeo', 110);
      if (Math.random() < 0.15) luego(() => pulso(el, 'parpadeo', 100), 260);
    };
    el.parpadear = cerrar;
    const parpadear = () => {
      if (!el.isConnected) return;
      if (Date.now() - ultimo > 900) cerrar();
      luego(parpadear, azar(min, max));
    };
    luego(parpadear, azar(800, Math.min(min, 2500)));
    escuchar(el, 'pointerenter', () => { if (Date.now() - ultimo > 900) cerrar(); });
    if (el.hasAttribute('data-saluda-al-pasar')) {
      let saludando = false;
      escuchar(el, 'pointerenter', () => {
        if (saludando) return;
        saludando = true;
        pulso(el, 'saluda', 1900);
        luego(() => { saludando = false; }, 2000);
      });
    }
  });
  return () => { relojes.forEach(clearTimeout); relojes.clear(); limpiar.forEach((f) => f()); };
}

/** Sofi en capas: el brazo saluda y los párpados parpadean (ver .sofi-saluda en base.css). */
export function sofiSaludando({ clase = '', alt = 'Sofi, una niña sonriente con bata blanca estampada de dientes, saludando con la mano' } = {}) {
  return `<div class="personaje sofi-saluda ${clase}" data-parpadea="3000,6500" role="img" aria-label="${alt}">
    <img class="sofi-capa" src="${SOFI.cuerpo}" width="${SOFI.ancho}" height="${SOFI.alto}" alt="" decoding="async" fetchpriority="high">
    <img class="sofi-capa sofi-mano" src="${SOFI.brazo}" width="${SOFI.ancho}" height="${SOFI.alto}" alt="" decoding="async">
    <img class="sofi-capa ojos" src="img/sofi-ojos.webp" width="${SOFI.ancho}" height="${SOFI.alto}" alt="" decoding="async">
  </div>`;
}

/**
 * Saluda en voz alta una vez por visita. Los navegadores solo dejan hablar después de que
 * la persona toca o presiona algo, así que si aún no hay interacción se espera la primera.
 * Devuelve una función que cancela la espera.
 */
export function saludarConVoz(texto, { alHablar, alTerminar } = {}) {
  if (!vozDisponible() || sessionStorage.getItem('mgdc:saludo')) return () => {};
  const hablar = () => {
    quitar();
    sessionStorage.setItem('mgdc:saludo', '1');
    alHablar?.();
    leer(texto, { velocidad: 1, tono: 1.15 }).then(() => alTerminar?.());
  };
  const eventos = ['pointerdown', 'keydown', 'touchstart'];
  const quitar = () => eventos.forEach((e) => window.removeEventListener(e, hablar, true));
  const activo = navigator.userActivation?.hasBeenActive;
  if (activo) {
    const t = setTimeout(hablar, 700);
    return () => clearTimeout(t);
  }
  eventos.forEach((e) => window.addEventListener(e, hablar, { capture: true, once: true }));
  return quitar;
}
