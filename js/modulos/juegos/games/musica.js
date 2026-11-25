// Juego: Los dientes cantores. Repetir la secuencia de notas (memoria y atención).

import { pantallaInicio, pantallaFinal, festejo, sacudir } from './comun.js';
import { sonido } from '../../../nucleo/util.js';
import { leer } from '../../../nucleo/speech.js';

const DIENTES = [
  { c: '#75BDF2', cara: '😁', nota: 523, nombre: 'azul' },
  { c: '#F2B4CC', cara: '😄', nota: 659, nombre: 'rosado' },
  { c: '#91D9B5', cara: '😊', nota: 784, nombre: 'verde' },
  { c: '#FFD98A', cara: '🤩', nota: 988, nombre: 'amarillo' },
];
const META = 8;

let ctx;
function nota(frecuencia, dur = 0.35) {
  if (localStorage.getItem('mgdc:sonido') === 'no') return;
  try {
    ctx ??= new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gan = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = frecuencia;
    const t = ctx.currentTime;
    gan.gain.setValueAtTime(0.0001, t);
    gan.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
    gan.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gan).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  } catch { /* sin audio */ }
}

export function iniciar(zona) {
  const tiempos = [];
  const limpiar = () => { tiempos.forEach(clearTimeout); tiempos.length = 0; };
  const luego = (fn, ms) => tiempos.push(setTimeout(fn, ms));

  const empezar = () => {
    limpiar();
    const secuencia = [];
    let pos = 0;
    let turnoNino = false;
    let mejorNivel = 0;

    zona.innerHTML = `
      <div class="marcador"><span>🎵 Nivel <b id="niv">1</b> / ${META}</span><span id="estado">👂 Escucha…</span></div>
      <div class="coro bloqueado" id="coro">${DIENTES.map((d, i) => `<button class="diente-cantor" data-i="${i}" style="--c:${d.c}" aria-label="Diente ${d.nombre}">${d.cara}</button>`).join('')}</div>`;
    const coro = zona.querySelector('#coro');
    const botones = [...coro.querySelectorAll('.diente-cantor')];
    const estado = zona.querySelector('#estado');

    const encender = (i, ms = 420) => {
      botones[i].classList.add('luz');
      nota(DIENTES[i].nota, ms / 1000);
      luego(() => botones[i].classList.remove('luz'), ms);
    };

    const tocarSecuencia = () => {
      turnoNino = false;
      coro.classList.add('bloqueado');
      estado.textContent = '👂 Escucha…';
      zona.querySelector('#niv').textContent = secuencia.length;
      const pausa = Math.max(380, 700 - secuencia.length * 35);
      secuencia.forEach((i, k) => luego(() => encender(i, pausa * 0.7), 600 + k * pausa));
      luego(() => {
        turnoNino = true;
        pos = 0;
        coro.classList.remove('bloqueado');
        estado.textContent = '👆 ¡Tu turno!';
      }, 600 + secuencia.length * pausa);
    };

    const nuevaRonda = () => {
      secuencia.push(Math.floor(Math.random() * DIENTES.length));
      tocarSecuencia();
    };

    const fin = () => {
      const est = mejorNivel >= META ? 3 : mejorNivel >= 5 ? 2 : mejorNivel >= 3 ? 1 : 0;
      pantallaFinal(zona, {
        actividad: 'juego:musica', puntaje: mejorNivel * 150, estrellasGanadas: est,
        mensaje: mejorNivel >= META
          ? '¡Repetiste toda la canción de los dientes! Tienes una memoria brillante como una sonrisa limpia.'
          : `Llegaste a recordar ${mejorNivel} ${mejorNivel === 1 ? 'nota' : 'notas'}. ¡Cada vez que juegas, tu memoria se hace más fuerte!`,
        alReintentar: empezar,
      });
    };

    botones.forEach((b) => b.addEventListener('click', () => {
      if (!turnoNino) return;
      const i = Number(b.dataset.i);
      encender(i, 260);
      if (i !== secuencia[pos]) {
        turnoNino = false;
        coro.classList.add('bloqueado');
        sonido('mal');
        sacudir(coro);
        estado.textContent = '😮 ¡Uy!';
        leer('¡Uy! Esa no era.');
        luego(fin, 1200);
        return;
      }
      pos++;
      if (pos === secuencia.length) {
        mejorNivel = secuencia.length;
        turnoNino = false;
        festejo(b, '¡Bien! 🎶');
        if (mejorNivel >= META) { luego(fin, 700); return; }
        luego(nuevaRonda, 800);
      }
    }));

    nuevaRonda();
  };

  pantallaInicio(zona, {
    titulo: 'Los dientes cantores',
    icono: '🎵',
    instrucciones: 'Cuatro dientes de colores cantan una canción. Mira y escucha cuáles se iluminan, y luego tócalos en el mismo orden. ¡Cada vez la canción es más larga!',
    alEmpezar: empezar,
  });
  return limpiar;
}
