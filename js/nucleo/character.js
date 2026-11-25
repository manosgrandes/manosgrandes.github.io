// Dientín: personaje principal del sitio (ilustración 3D con poses según el ánimo).

/**
 * Devuelve a Dientín (ilustración 3D). El ánimo cambia su pose con una animación suave.
 * @param {{animo?: 'feliz'|'guino'|'triste'|'sorpresa', tam?: number, cepillo?: boolean, clase?: string, etiqueta?: string}} op
 */
export function dientin({ animo = 'feliz', tam = 160, cepillo = false, clase = '', etiqueta = 'Dientín, el diente amigo' } = {}) {
  const alto = Math.round(tam * 640 / 612);
  return `<span class="dientin dientin-3d animo-${animo} ${clase}" style="width:${tam}px" role="img" aria-label="${etiqueta}">
    <img src="img/dientin-nuevo.webp" alt="" width="${tam}" height="${alto}" draggable="false">
    ${animo === 'triste' ? '<span class="dientin-gota" aria-hidden="true">💧</span>' : ''}
    ${animo === 'sorpresa' ? '<span class="dientin-signo" aria-hidden="true">❗</span>' : ''}
    ${cepillo ? '<img class="dientin-cepillo-img" src="icons/cepillo.svg" alt="">' : ''}
  </span>`;
}

/** Burbuja de diálogo de Dientín con un mensaje. */
export function dientinDice(mensaje, op = {}) {
  return `<div class="dientin-dice">${dientin({ tam: 110, ...op })}<p class="burbuja">${mensaje}</p></div>`;
}
