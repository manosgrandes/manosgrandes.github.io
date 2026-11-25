// Juego: Lluvia de comida sana. Mover a Dientín para atrapar alimentos sanos y esquivar los dulces.

import { pantallaInicio, pantallaFinal, festejo, sacudir } from './comun.js';
import { sonido } from '../../../nucleo/util.js';
import { dientin } from '../../../nucleo/character.js';

const DURACION = 40;
const SANOS = ['🍎', '🥕', '🥛', '🧀', '💧', '🍌', '🥦', '🍐', '🍓', '🥚'];
const DULCES = ['🍬', '🍭', '🍩', '🥤', '🍫'];
const ANCHO_DIENTIN = 90;

export function iniciar(zona) {
  let cuadro, reloj;
  const detener = () => { cancelAnimationFrame(cuadro); clearInterval(reloj); };

  const empezar = () => {
    detener();
    let restante = DURACION;
    let puntos = 0;
    let sanos = 0;
    let vidas = 3;
    let terminado = false;

    zona.innerHTML = `
      <div class="marcador"><span>⏱️ <b id="t">${DURACION}</b> s</span><span>🍎 <b id="s">0</b></span><span id="vidas">❤️❤️❤️</span></div>
      <div class="cielo-comida" id="cielo" tabindex="0" aria-label="Mueve a Dientín con el dedo, el ratón o las flechas">
        <div class="atrapador" id="atrapador">${dientin({ tam: ANCHO_DIENTIN, animo: 'feliz' })}</div>
      </div>
      <p class="centro suave">Atrapa 🍎🥕🥛💧 · Esquiva 🍬🍭🥤 · Arrastra el dedo o usa las flechas ⬅️ ➡️</p>`;

    const cielo = zona.querySelector('#cielo');
    const atrapador = zona.querySelector('#atrapador');
    let ancho = cielo.clientWidth;
    let alto = cielo.clientHeight;
    let x = ancho / 2;
    const cosas = [];
    let proxima = 0;

    const moverA = (nx) => {
      x = Math.max(ANCHO_DIENTIN / 2, Math.min(ancho - ANCHO_DIENTIN / 2, nx));
      atrapador.style.transform = `translateX(${x - ANCHO_DIENTIN / 2}px)`;
    };
    moverA(x);

    const desdePuntero = (e) => moverA(e.clientX - cielo.getBoundingClientRect().left);
    cielo.addEventListener('pointerdown', (e) => { cielo.setPointerCapture(e.pointerId); desdePuntero(e); });
    cielo.addEventListener('pointermove', desdePuntero);
    cielo.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') moverA(x - 40);
      else if (e.key === 'ArrowRight') moverA(x + 40);
      else return;
      e.preventDefault();
    });
    cielo.focus({ preventScroll: true });

    const crear = (t) => {
      const dulce = Math.random() < 0.3;
      const lista = dulce ? DULCES : SANOS;
      const el = document.createElement('span');
      el.className = 'cae';
      el.textContent = lista[Math.floor(Math.random() * lista.length)];
      cielo.append(el);
      const avance = (DURACION - restante) / DURACION;
      cosas.push({ el, dulce, x: 30 + Math.random() * (ancho - 60), y: -50, vel: 110 + avance * 130 + Math.random() * 40 });
      proxima = t + Math.max(450, 1000 - avance * 500);
    };

    const vidasTexto = () => '❤️'.repeat(vidas) + '🤍'.repeat(3 - vidas);

    let antes = performance.now();
    const paso = (t) => {
      if (terminado) return;
      const dt = Math.min(0.05, (t - antes) / 1000);
      antes = t;
      ancho = cielo.clientWidth; alto = cielo.clientHeight;
      if (t >= proxima) crear(t);
      const boca = alto - ANCHO_DIENTIN * 0.9;
      for (let i = cosas.length - 1; i >= 0; i--) {
        const c = cosas[i];
        c.y += c.vel * dt;
        c.el.style.transform = `translate(${c.x - 20}px, ${c.y}px)`;
        const cerca = Math.abs(c.x - x) < ANCHO_DIENTIN * 0.6;
        if (c.y > boca - 20 && c.y < boca + 20 && cerca) {
          if (c.dulce) {
            vidas--; sonido('mal'); festejo(atrapador, '¡Uy! 🍬', false); sacudir(cielo);
            zona.querySelector('#vidas').textContent = vidasTexto();
          } else {
            puntos += 10; sanos++; sonido('bien'); festejo(atrapador, '+10');
            zona.querySelector('#s').textContent = sanos;
          }
          c.el.remove(); cosas.splice(i, 1);
          if (vidas <= 0) { terminar(); return; }
        } else if (c.y > alto) {
          c.el.remove(); cosas.splice(i, 1);
        }
      }
      cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);

    reloj = setInterval(() => {
      restante--;
      const tt = zona.querySelector('#t');
      if (tt) tt.textContent = restante;
      if (restante <= 0) terminar();
    }, 1000);

    function terminar() {
      if (terminado) return;
      terminado = true;
      detener();
      const est = vidas <= 0 ? (sanos >= 15 ? 1 : 0) : sanos >= 30 ? 3 : sanos >= 20 ? 2 : sanos >= 10 ? 1 : 0;
      pantallaFinal(zona, {
        actividad: 'juego:atrapa', puntaje: puntos + vidas * 50, estrellasGanadas: est,
        mensaje: vidas <= 0
          ? `Atrapaste ${sanos} alimentos sanos, pero comiste muchos dulces. ¡Los dulces son solo de vez en cuando!`
          : `¡Atrapaste ${sanos} alimentos sanos! Frutas, verduras, leche y agua hacen dientes fuertes.`,
        alReintentar: empezar,
      });
    }
  };

  pantallaInicio(zona, {
    titulo: 'Lluvia de comida sana',
    icono: '🍎',
    instrucciones: '¡Está lloviendo comida! Mueve a Dientín para atrapar frutas, verduras, leche y agua. Esquiva los dulces y la gaseosa: si comes tres, se acaba el juego.',
    alEmpezar: empezar,
  });
  return detener;
}
