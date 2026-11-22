// Juego: Memoria de hábitos. Encontrar parejas.

import { pantallaInicio, pantallaFinal } from './comun.js';
import { barajar, sonido } from '../util.js';
import { leer } from '../speech.js';

const FICHAS = [
  { e: '<img class="emo" src="icons/cepillo.svg" alt="">', n: 'Cepillo de dientes' },
  { e: '🦷', n: 'Diente sano' },
  { e: '💧', n: 'Agua' },
  { e: '🍎', n: 'Fruta' },
  { e: '🥛', n: 'Leche' },
  { e: '🧑‍⚕️', n: 'Odontólogo' },
  { e: '💦', n: 'Espuma de crema dental' },
  { e: '👨‍👩‍👧', n: 'Familia que acompaña' },
];

export function iniciar(zona) {
  let espera;
  const empezar = () => {
    const cartas = barajar([...FICHAS, ...FICHAS]).map((f, i) => ({ ...f, i }));
    let abiertas = [];
    let parejas = 0;
    let intentos = 0;
    const inicio = Date.now();

    zona.innerHTML = `
      <div class="marcador"><span>🔁 Intentos: <b id="int">0</b></span><span>✅ Parejas: <b id="par">0</b> / ${FICHAS.length}</span></div>
      <div class="memoria">${cartas.map((c) => `<button class="carta" data-i="${c.i}" aria-label="Carta oculta">${c.e}</button>`).join('')}</div>`;

    const botones = [...zona.querySelectorAll('.carta')];
    botones.forEach((b) => b.addEventListener('click', () => {
      const c = cartas[b.dataset.i];
      if (abiertas.length === 2 || b.classList.contains('volteada') || b.classList.contains('hecha')) return;
      b.classList.add('volteada');
      b.setAttribute('aria-label', c.n);
      sonido('clic');
      abiertas.push(b);
      if (abiertas.length < 2) return;

      intentos++;
      zona.querySelector('#int').textContent = intentos;
      const [a, d] = abiertas;
      if (cartas[a.dataset.i].e === cartas[d.dataset.i].e) {
        a.classList.add('hecha'); d.classList.add('hecha');
        abiertas = [];
        parejas++;
        zona.querySelector('#par').textContent = parejas;
        sonido('bien');
        leer(c.n);
        if (parejas === FICHAS.length) {
          const seg = Math.round((Date.now() - inicio) / 1000);
          const est = intentos <= 12 ? 3 : intentos <= 18 ? 2 : 1;
          espera = setTimeout(() => pantallaFinal(zona, {
            actividad: 'juego:memoria', puntaje: Math.max(100, 2000 - intentos * 50 - seg * 5), estrellasGanadas: est,
            mensaje: `¡Encontraste todas las parejas en ${intentos} intentos! Cepillo, agua, fruta, familia y odontólogo: el equipo de una sonrisa sana.`,
            alReintentar: empezar,
          }), 700);
        }
      } else {
        espera = setTimeout(() => {
          [a, d].forEach((x) => { x.classList.remove('volteada'); x.setAttribute('aria-label', 'Carta oculta'); });
          abiertas = [];
        }, 900);
      }
    }));
  };

  pantallaInicio(zona, {
    titulo: 'Memoria de hábitos',
    icono: '🃏',
    instrucciones: 'Voltea dos cartas a la vez y encuentra las parejas iguales. ¡Usa la menor cantidad de intentos!',
    alEmpezar: empezar,
  });
  return () => clearTimeout(espera);
}
