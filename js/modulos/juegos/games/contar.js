// Juego: Cuenta con Dientín. Contar objetos de la sonrisa y escoger el número.

import { pantallaInicio, pantallaFinal, festejo, sacudir } from './comun.js';
import { barajar, sonido } from '../../../nucleo/util.js';
import { leer } from '../../../nucleo/speech.js';

const COSAS = [
  { e: '🦷', uno: 'diente', varios: 'dientes' },
  { e: '<img class="emo" src="icons/cepillo.svg" alt="">', uno: 'cepillo', varios: 'cepillos' },
  { e: '🍎', uno: 'manzana', f: true, varios: 'manzanas' },
  { e: '🥕', uno: 'zanahoria', f: true, varios: 'zanahorias' },
  { e: '💧', uno: 'gota de agua', f: true, varios: 'gotas de agua' },
  { e: '🦠', uno: 'bacteria', f: true, varios: 'bacterias' },
  { e: '⭐', uno: 'estrella', f: true, varios: 'estrellas' },
  { e: '🧀', uno: 'queso', varios: 'quesos' },
  { e: '🎈', uno: 'globo', varios: 'globos' },
];
const RONDAS = 8;
const NUMEROS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez'];

export function iniciar(zona) {
  let espera;
  const empezar = () => {
    const ronda = Array.from({ length: RONDAS }, (_, k) => {
      const cosa = COSAS[Math.floor(Math.random() * COSAS.length)];
      // Las primeras rondas usan números pequeños; luego suben hasta 10.
      const max = k < 3 ? 5 : k < 6 ? 8 : 10;
      const n = 1 + Math.floor(Math.random() * max);
      const otros = barajar([n - 2, n - 1, n + 1, n + 2].filter((x) => x >= 1 && x <= 10)).slice(0, 2);
      return { cosa, n, opciones: barajar([n, ...otros]) };
    });
    let i = 0;
    let aciertos = 0;

    const mostrar = () => {
      const { cosa, n, opciones } = ronda[i];
      const pregunta = `¿Cuánt${cosa.f ? 'as' : 'os'} ${cosa.varios} hay?`;
      zona.innerHTML = `
        <div class="marcador"><span>🔢 ${i + 1} / ${RONDAS}</span><span>✅ ${aciertos}</span></div>
        <p class="centro" style="font-size:1.35rem;font-weight:800;margin:.2rem 0 .8rem">${pregunta}</p>
        <div class="para-contar" aria-label="${n} ${n === 1 ? cosa.uno : cosa.varios}">${Array.from({ length: n }, (_, k) => `<span style="animation-delay:${k * 70}ms">${cosa.e}</span>`).join('')}</div>
        <div class="numeros">${opciones.map((x) => `<button class="btn" data-n="${x}">${x}</button>`).join('')}</div>
        <p class="centro" style="margin-top:1rem"><button class="btn btn-mini" id="oir">🔊 Escuchar</button></p>`;
      leer(pregunta);
      zona.querySelector('#oir').addEventListener('click', () => leer(pregunta));
      zona.querySelectorAll('[data-n]').forEach((b) => b.addEventListener('click', () => {
        const bien = Number(b.dataset.n) === n;
        zona.querySelectorAll('[data-n]').forEach((x) => { x.disabled = true; if (Number(x.dataset.n) === n) x.classList.add('correcta'); });
        if (bien) { aciertos++; sonido('bien'); festejo(b, '¡Bien! ⭐'); }
        else { sonido('mal'); sacudir(b); }
        // Cuenta en voz alta para reforzar los números.
        leer(`${bien ? '¡Muy bien!' : 'Contemos juntos:'} ${Array.from({ length: n }, (_, k) => NUMEROS[k + 1]).join(', ')}. ¡Hay ${n === 1 ? (cosa.f ? 'una' : 'uno') : NUMEROS[n]}!`);
        espera = setTimeout(() => {
          i++;
          if (i < RONDAS) mostrar();
          else pantallaFinal(zona, {
            actividad: 'juego:contar', puntaje: aciertos * 100, estrellasGanadas: aciertos >= 7 ? 3 : aciertos >= 5 ? 2 : aciertos >= 3 ? 1 : 0,
            mensaje: `Contaste bien ${aciertos} de ${RONDAS}. ¿Sabías que los niños tienen 20 dientes de leche? ¡Cuéntalos frente al espejo!`,
            alReintentar: empezar,
          });
        }, bien ? 2400 : 3600);
      }));
    };
    mostrar();
  };

  pantallaInicio(zona, {
    titulo: 'Cuenta con Dientín',
    icono: '🔢',
    instrucciones: 'Aparecerán dientes, cepillos, frutas y globos. Cuéntalos con tu dedito y toca el número correcto.',
    alEmpezar: empezar,
  });
  return () => clearTimeout(espera);
}
