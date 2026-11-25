// Juego: Paso a paso. Tocar las tarjetas en el orden correcto de cada rutina.

import { pantallaInicio, pantallaFinal, festejo, sacudir } from './comun.js';
import { barajar, sonido } from '../../../nucleo/util.js';
import { leer } from '../../../nucleo/speech.js';

const CEPILLO = '<img class="emo" src="icons/cepillo.svg" alt="">';

const RUTINAS = [
  {
    nombre: 'Me cepillo los dientes',
    pasos: [
      { e: '🧼', n: 'Me lavo las manos' },
      { e: '🧴', n: 'Pongo crema como una arveja' },
      { e: CEPILLO, n: 'Cepillo en circulitos' },
      { e: '👅', n: 'Cepillo mi lengua' },
      { e: '💦', n: 'Escupo la espuma' },
    ],
  },
  {
    nombre: 'Hora de dormir',
    pasos: [
      { e: '🍽️', n: 'Ceno con mi familia' },
      { e: CEPILLO, n: 'Me cepillo los dientes' },
      { e: '👀', n: 'Un adulto revisa mi boca' },
      { e: '📖', n: 'Leemos un cuento' },
      { e: '😴', n: 'A dormir sin comer más' },
    ],
  },
  {
    nombre: 'Visita al odontólogo',
    pasos: [
      { e: '🚗', n: 'Llego al consultorio' },
      { e: '💺', n: 'Me siento en la silla' },
      { e: '😮', n: 'Abro grande la boca' },
      { e: '🔦', n: 'El odontólogo mira mis dientes' },
      { e: '⭐', n: '¡Me felicitan por valiente!' },
    ],
  },
];

export function iniciar(zona) {
  let espera;
  const empezar = () => {
    let r = 0;
    let errores = 0;

    const mostrar = () => {
      const rutina = RUTINAS[r];
      const tarjetas = barajar(rutina.pasos.map((p, i) => ({ ...p, i })));
      let siguiente = 0;
      zona.innerHTML = `
        <div class="marcador"><span>👣 Rutina ${r + 1} / ${RUTINAS.length}</span><span>❌ Errores: <b id="err">${errores}</b></span></div>
        <h2 class="centro titulo-juego" style="font-size:1.6rem">${rutina.nombre}</h2>
        <p class="centro suave">Toca los pasos en orden: ¿qué va primero?</p>
        <div class="pasos-hechos" id="hechos" aria-live="polite"><span style="background:none;color:var(--tinta-tenue);font-weight:600">Aquí aparecen tus pasos…</span></div>
        <div class="pasos-lista">${tarjetas.map((t) => `<button class="paso-btn" data-i="${t.i}"><span>${t.e}</span><span>${t.n}</span></button>`).join('')}</div>`;
      leer(`${rutina.nombre}. ¿Qué va primero?`);
      const hechos = zona.querySelector('#hechos');
      zona.querySelectorAll('.paso-btn').forEach((b) => b.addEventListener('click', () => {
        const i = Number(b.dataset.i);
        if (i === siguiente) {
          if (siguiente === 0) hechos.innerHTML = '';
          siguiente++;
          b.disabled = true;
          sonido('bien');
          festejo(b, `${siguiente}º ✔`);
          const p = rutina.pasos[i];
          hechos.insertAdjacentHTML('beforeend', `<span>${siguiente}. ${p.e}</span>`);
          leer(p.n);
          if (siguiente === rutina.pasos.length) {
            espera = setTimeout(() => {
              r++;
              if (r < RUTINAS.length) mostrar();
              else pantallaFinal(zona, {
                actividad: 'juego:pasos', puntaje: Math.max(100, 1500 - errores * 100), estrellasGanadas: errores <= 1 ? 3 : errores <= 4 ? 2 : 1,
                mensaje: `¡Ordenaste las ${RUTINAS.length} rutinas con ${errores} ${errores === 1 ? 'error' : 'errores'}! Hacer las cosas en orden ayuda a que tu sonrisa quede limpia.`,
                alReintentar: empezar,
              });
            }, 1300);
          }
        } else {
          errores++;
          zona.querySelector('#err').textContent = errores;
          sonido('mal');
          sacudir(b);
          festejo(b, '¡Ese no va aún!', false);
        }
      }));
    };
    mostrar();
  };

  pantallaInicio(zona, {
    titulo: 'Paso a paso',
    icono: '👣',
    instrucciones: 'Dientín mezcló las tarjetas. Toca los pasos en el orden correcto: primero lo que va primero. Son tres rutinas: cepillarse, ir a dormir y visitar al odontólogo.',
    alEmpezar: empezar,
  });
  return () => clearTimeout(espera);
}
