// Juego: Atrapa las bacterias. Tocar bacterias antes de que desaparezcan; evitar los dulces.

import { pantallaInicio, pantallaFinal } from './comun.js';
import { sonido } from '../util.js';

const DURACION = 30;

export function iniciar(zona) {
  let reloj, generador;
  const detenerTodo = () => { clearInterval(reloj); clearTimeout(generador); };

  const empezar = () => {
    let restante = DURACION;
    let puntos = 0;
    let atrapadas = 0;
    let escapadas = 0;
    let terminado = false;

    zona.innerHTML = `
      <div class="marcador"><span>⏱️ <b id="t">${DURACION}</b> s</span><span>🦠 <b id="a">0</b></span><span>⭐ <b id="p">0</b></span></div>
      <div class="tablero-bacterias" id="tablero" aria-label="Dientes con bacterias">
        <div class="diente-fondo">${'<i></i>'.repeat(8)}</div>
      </div>
      <p class="centro suave">Toca 🦠 = +10 · Toca <img class="emo" src="icons/cepillo.svg" alt=""> = ¡limpieza total! · No toques 🍬 = −15</p>`;
    const tablero = zona.querySelector('#tablero');

    const actualizar = () => {
      zona.querySelector('#a').textContent = atrapadas;
      zona.querySelector('#p').textContent = puntos;
    };

    const crear = () => {
      if (terminado) return;
      const azar = Math.random();
      const tipo = azar < 0.72 ? 'bacteria' : azar < 0.9 ? 'dulce' : 'cepillo';
      const b = document.createElement('button');
      b.className = 'bicho';
      b.type = 'button';
      b.innerHTML = { bacteria: '🦠', dulce: '🍬', cepillo: '<img class="emo" src="icons/cepillo.svg" alt="">' }[tipo];
      b.setAttribute('aria-label', { bacteria: 'Bacteria', dulce: 'Dulce', cepillo: 'Cepillo mágico' }[tipo]);
      b.style.left = `${5 + Math.random() * 82}%`;
      b.style.top = `${5 + Math.random() * 78}%`;
      b.dataset.tipo = tipo;
      const vida = Math.max(800, 1700 - (DURACION - restante) * 25);
      const quitar = setTimeout(() => {
        if (b.isConnected && tipo === 'bacteria') escapadas++;
        b.remove();
      }, vida);
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        clearTimeout(quitar);
        if (tipo === 'bacteria') { puntos += 10; atrapadas++; sonido('bien'); }
        if (tipo === 'dulce') { puntos = Math.max(0, puntos - 15); sonido('mal'); }
        if (tipo === 'cepillo') {
          const todas = [...tablero.querySelectorAll('.bicho[data-tipo="bacteria"]')];
          puntos += 10 * todas.length + 5;
          atrapadas += todas.length;
          todas.forEach((x) => { x.classList.add('atrapado'); setTimeout(() => x.remove(), 300); });
          sonido('fin');
        }
        b.classList.add('atrapado');
        setTimeout(() => b.remove(), 300);
        actualizar();
      });
      tablero.append(b);
      generador = setTimeout(crear, Math.max(380, 900 - (DURACION - restante) * 15));
    };

    reloj = setInterval(() => {
      restante--;
      zona.querySelector('#t').textContent = restante;
      if (restante <= 0) {
        terminado = true;
        detenerTodo();
        const est = atrapadas >= 30 ? 3 : atrapadas >= 20 ? 2 : atrapadas >= 10 ? 1 : 0;
        pantallaFinal(zona, {
          actividad: 'juego:bacterias', puntaje: puntos, estrellasGanadas: est,
          mensaje: `Atrapaste ${atrapadas} bacterias. Las bacterias aman el azúcar: por eso cepillarte después de comer las mantiene lejos.`,
          alReintentar: empezar,
        });
      }
    }, 1000);
    crear();
  };

  pantallaInicio(zona, {
    titulo: 'Atrapa las bacterias',
    icono: '🦠',
    instrucciones: 'Las bacterias quieren hacer caries. ¡Tócalas rápido! Si aparece el cepillo mágico, tócalo para limpiar todo. Pero cuidado: no toques los dulces.',
    alEmpezar: empezar,
  });
  return detenerTodo;
}
