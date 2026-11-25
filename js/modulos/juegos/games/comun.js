// Pantallas compartidas por los juegos: inicio, resultado final y festejos.

import { dientin } from '../../../nucleo/character.js';
import { perfiles, progreso } from '../../../nucleo/store.js';
import { estrellas, sonido, confeti, esc } from '../../../nucleo/util.js';
import { leer } from '../../../nucleo/speech.js';

const decoracion = () => `
  <span class="deco-flota" aria-hidden="true" style="left:6%;top:12%">✨</span>
  <span class="deco-flota" aria-hidden="true" style="right:8%;top:18%;animation-delay:.8s">⭐</span>
  <span class="deco-flota" aria-hidden="true" style="left:10%;bottom:14%;animation-delay:1.4s">🎈</span>
  <span class="deco-flota" aria-hidden="true" style="right:12%;bottom:10%;animation-delay:.4s"><img src="img/dientin-nuevo.webp" alt="" style="width:2.2rem"></span>`;

export function pantallaInicio(zona, { titulo, instrucciones, alEmpezar, icono = '🎮' }) {
  zona.innerHTML = `
  <div class="final pila pantalla-juego">
    ${decoracion()}
    <div class="burbuja-icono">${icono}</div>
    ${dientin({ tam: 130, clase: 'rebote', animo: 'guino' })}
    <h2 class="titulo-juego">${titulo}</h2>
    <p class="globo-instruccion">${instrucciones}</p>
    <div class="fila" style="justify-content:center">
      <button class="btn btn-grande btn-jugar" id="empezar">▶ ¡Empezar!</button>
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
  if (estrellasGanadas >= 2) confeti();
  const animo = estrellasGanadas >= 2 ? 'feliz' : estrellasGanadas === 1 ? 'guino' : 'sorpresa';
  zona.innerHTML = `
  <div class="final pila pantalla-juego">
    ${decoracion()}
    ${dientin({ tam: 150, animo, clase: 'rebote' })}
    <div class="estrellas-grandes">${estrellas(estrellasGanadas)}</div>
    <h2 class="titulo-juego">${estrellasGanadas === 3 ? '¡Increíble!' : estrellasGanadas === 2 ? '¡Muy bien!' : estrellasGanadas === 1 ? '¡Buen intento!' : '¡Sigue practicando!'}</h2>
    <p class="globo-instruccion">${mensaje}</p>
    <p class="puntos-final">🏆 ${puntaje} puntos</p>
    ${nuevas.map((m) => `<p class="nota">🏅 ¡Ganaste la medalla <strong>${m.icono} ${esc(m.nombre)}</strong>!</p>`).join('')}
    ${p ? '' : '<p class="nota nota-info">Crea tu perfil para guardar tus estrellas. <a href="#/entrar">Entrar con un perfil</a></p>'}
    <div class="fila" style="justify-content:center">
      <button class="btn btn-grande btn-jugar" id="otra">🔁 Jugar otra vez</button>
      <a class="btn btn-claro" href="#/app/juegos">🎮 Más juegos</a>
    </div>
  </div>`;
  zona.querySelector('#otra').addEventListener('click', alReintentar);
  leer(`${mensaje}`);
}

/** Texto que salta y se desvanece sobre un elemento (por ejemplo "+10" o "¡Bien!"). */
export function festejo(sobre, texto, bien = true) {
  const r = sobre.getBoundingClientRect();
  const s = document.createElement('span');
  s.className = `festejo ${bien ? 'bien' : 'mal'}`;
  s.textContent = texto;
  s.style.left = `${r.left + r.width / 2}px`;
  s.style.top = `${r.top}px`;
  document.body.append(s);
  setTimeout(() => s.remove(), 900);
}

/** Sacude un elemento cuando la respuesta no es correcta. */
export function sacudir(el) {
  el.classList.remove('sacude');
  void el.offsetWidth;
  el.classList.add('sacude');
}
