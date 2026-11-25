// Modo claro / oscuro de las páginas públicas (landing y login). Se recuerda en este equipo;
// si nunca se eligió, sigue el modo del sistema operativo.

import { icono } from './iconos.js';

const CLAVE = 'mgdc:tema';

export const temaGuardado = () => {
  const t = localStorage.getItem(CLAVE);
  return t ? t === 'oscuro' : matchMedia('(prefers-color-scheme: dark)').matches;
};

/** Botón sol/luna. `clase` permite darle el estilo de cada página. */
export const botonTema = (oscuro, clase) =>
  `<button type="button" class="${clase}" data-tema-btn aria-label="${oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}" aria-pressed="${oscuro}">${icono(oscuro ? 'sol' : 'luna', { tam: 20 })}</button>`;

/** Conecta el botón: alterna data-tema en `contenedor` y lo guarda. `alCambiar(oscuro)` es opcional. */
export function conectarTema(contenedor, alCambiar) {
  const b = contenedor.querySelector('[data-tema-btn]');
  b?.addEventListener('click', () => {
    const oscuro = contenedor.dataset.tema !== 'oscuro';
    contenedor.dataset.tema = oscuro ? 'oscuro' : 'claro';
    localStorage.setItem(CLAVE, oscuro ? 'oscuro' : 'claro');
    b.innerHTML = icono(oscuro ? 'sol' : 'luna', { tam: 20 });
    b.setAttribute('aria-pressed', String(oscuro));
    b.setAttribute('aria-label', oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    alCambiar?.(oscuro);
  });
}
