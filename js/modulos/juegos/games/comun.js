// Pantallas compartidas por los juegos: inicio y resultado final.

import { dientin } from '../../../nucleo/character.js';
import { perfiles, progreso } from '../../../nucleo/store.js';
import { estrellas, sonido, confeti, esc } from '../../../nucleo/util.js';
import { leer } from '../../../nucleo/speech.js';

export function pantallaInicio(zona, { titulo, instrucciones, alEmpezar, icono = '🎮' }) {
  zona.innerHTML = `
  <div class="final pila">
    <div style="font-size:4rem">${icono}</div>
    ${dientin({ tam: 130, clase: 'rebote', animo: 'guino' })}
    <h2>${titulo}</h2>
    <p style="font-size:1.15rem;max-width:560px;margin:0 auto">${instrucciones}</p>
    <div class="fila" style="justify-content:center">
      <button class="btn btn-grande btn-menta" id="empezar">▶ ¡Empezar!</button>
      <button class="btn btn-claro" id="escuchar">🔊 Escuchar</button>
    </div>
  </div>`;
  zona.querySelector('#escuchar').addEventListener('click', () => leer(`${titulo}. ${instrucciones}`));
  zona.querySelector('#empezar').addEventListener('click', () => { sonido('clic'); alEmpezar(); });
}

/** Muestra el resultado, guarda el progreso y anuncia medallas nuevas. */
export async function pantallaFinal(zona, { actividad, puntaje, estrellasGanadas, mensaje, alReintentar }) {
  const p = perfiles.activo();
  const nuevas = p ? await progreso.registrar(actividad, puntaje, estrellasGanadas) : [];
  sonido(estrellasGanadas >= 2 ? 'fin' : 'bien');
  if (estrellasGanadas === 3) confeti();
  const animo = estrellasGanadas >= 2 ? 'feliz' : estrellasGanadas === 1 ? 'guino' : 'sorpresa';
  zona.innerHTML = `
  <div class="final pila">
    ${dientin({ tam: 150, animo, clase: 'rebote' })}
    ${estrellas(estrellasGanadas)}
    <h2>${estrellasGanadas === 3 ? '¡Increíble!' : estrellasGanadas === 2 ? '¡Muy bien!' : estrellasGanadas === 1 ? '¡Buen intento!' : '¡Sigue practicando!'}</h2>
    <p style="font-size:1.15rem">${mensaje}</p>
    <p><strong>Puntos: ${puntaje}</strong></p>
    ${nuevas.map((m) => `<p class="nota">🏅 ¡Ganaste la medalla <strong>${m.icono} ${esc(m.nombre)}</strong>!</p>`).join('')}
    ${p ? '' : '<p class="nota nota-info">Crea tu perfil para guardar tus estrellas. <a href="#/entrar">Entrar con un perfil</a></p>'}
    <div class="fila" style="justify-content:center">
      <button class="btn btn-grande" id="otra">🔁 Jugar otra vez</button>
      <a class="btn btn-claro" href="#/app/juegos">Más juegos</a>
    </div>
  </div>`;
  zona.querySelector('#otra').addEventListener('click', alReintentar);
  leer(`${mensaje}`);
}
