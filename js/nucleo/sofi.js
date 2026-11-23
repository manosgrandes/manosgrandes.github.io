// Sofi, la doctora de las sonrisas: personaje guía de la landing, el login y el sistema.

import { leer, vozDisponible } from './speech.js';

export const SOFI = {
  nombre: 'Sofi',
  img: 'img/sofi.webp',           // Sofi completa saludando (720 × 1328)
  cuerpo: 'img/sofi-cuerpo.webp', // capas para animar el saludo
  brazo: 'img/sofi-brazo.webp',
  cara: 'img/sofi-cara.webp',
  ancho: 720,
  alto: 1328,
  bienvenida: '¡Hola! Bienvenido a Manos Grandes, Dientes Chiquitos.',
  saludo: '¡Hola! Soy Sofi, la doctora de las sonrisas. Bienvenido a Manos Grandes, Dientes Chiquitos. Con mi amigo Dientín vamos a aprender a cuidar los dientes jugando.',
};

/** Sofi en capas: el brazo se mueve saludando (ver .sofi-saluda en base.css). */
export function sofiSaludando({ clase = '', alt = 'Sofi, una niña sonriente con bata blanca estampada de dientes, saludando con la mano' } = {}) {
  return `<div class="sofi-saluda ${clase}" role="img" aria-label="${alt}">
    <img class="sofi-capa" src="${SOFI.cuerpo}" width="${SOFI.ancho}" height="${SOFI.alto}" alt="" decoding="async" fetchpriority="high">
    <img class="sofi-capa sofi-mano" src="${SOFI.brazo}" width="${SOFI.ancho}" height="${SOFI.alto}" alt="" decoding="async">
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
    leer(texto, { velocidad: 0.95, tono: 1.3 }).then(() => alTerminar?.());
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
