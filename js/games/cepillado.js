// Juego: Cepilla a Dientín. Arrastrar el cepillo sobre la suciedad de los dientes.

import { pantallaInicio, pantallaFinal } from './comun.js';
import { sonido } from '../util.js';

const TIEMPO = 60;
const PASADAS = 3; // pasadas necesarias para limpiar cada mancha

function crearManchas() {
  const manchas = [];
  for (let fila = 0; fila < 2; fila++) {
    for (let d = 0; d < 6; d++) {
      const x0 = 90 + d * 72;
      const y0 = fila === 0 ? 80 : 215;
      const n = 2 + Math.floor(Math.random() * 2);
      for (let k = 0; k < n; k++) {
        manchas.push({ x: x0 + 14 + Math.random() * 42, y: y0 + 14 + Math.random() * 62, r: 9 + Math.random() * 7, vida: PASADAS });
      }
    }
  }
  return manchas;
}

export function iniciar(zona) {
  let temporizador;
  const empezar = () => {
    const manchas = crearManchas();
    const total = manchas.length;
    let restante = TIEMPO;
    let limpias = 0;
    let cepillando = false;

    const dientes = (y) => Array.from({ length: 6 }, (_, d) =>
      `<rect x="${90 + d * 72}" y="${y}" width="66" height="90" rx="22" fill="#fff" stroke="#E1E8F5" stroke-width="4"/>`).join('');

    zona.innerHTML = `
      <div class="marcador"><span>⏱️ <b id="t">${TIEMPO}</b> s</span><span>✨ <b id="pct">0</b>% limpio</span></div>
      <div class="barra" aria-hidden="true"><i id="barra"></i></div>
      <p class="centro suave">Mantén presionado y mueve el cepillo sobre las manchas amarillas.</p>
      <svg class="boca" id="boca" viewBox="0 0 600 380" role="img" aria-label="Boca de Dientín con dientes sucios">
        <ellipse cx="300" cy="190" rx="290" ry="180" fill="#FF8F9A"/>
        <ellipse cx="300" cy="190" rx="255" ry="150" fill="#8E2A3B"/>
        <rect x="70" y="60" width="460" height="40" rx="18" fill="#FFB3BA"/>
        <rect x="70" y="285" width="460" height="40" rx="18" fill="#FFB3BA"/>
        <ellipse cx="300" cy="200" rx="110" ry="26" fill="#E05468"/>
        ${dientes(80)}${dientes(215)}
        <g id="manchas">${manchas.map((m, i) => `<circle class="suciedad" data-i="${i}" cx="${m.x}" cy="${m.y}" r="${m.r}" fill="#D4B254"/>`).join('')}</g>
        <g id="cepillo" style="pointer-events:none" transform="translate(300 190)">
          <rect x="-8" y="0" width="16" height="110" rx="8" fill="#4FC3F7"/>
          <rect x="-20" y="-34" width="40" height="36" rx="8" fill="#fff" stroke="#4FC3F7" stroke-width="4"/>
          <circle cx="-6" cy="-40" r="7" fill="#DDF3FC"/><circle cx="8" cy="-44" r="5" fill="#DDF3FC"/>
        </g>
      </svg>`;

    const svg = zona.querySelector('#boca');
    const cepillo = zona.querySelector('#cepillo');
    const circulos = [...zona.querySelectorAll('.suciedad')];

    const aSVG = (e) => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    };

    const frotar = (e) => {
      const { x, y } = aSVG(e);
      cepillo.setAttribute('transform', `translate(${x} ${y + 20})`);
      if (!cepillando) return;
      manchas.forEach((m, i) => {
        if (m.vida > 0 && Math.hypot(m.x - x, m.y - y) < m.r + 20) {
          m.vida -= 1;
          circulos[i].style.opacity = String(m.vida / PASADAS);
          if (m.vida === 0) {
            limpias++;
            if (limpias % 5 === 0) sonido('bien');
          }
        }
      });
      const pct = Math.round((limpias / total) * 100);
      zona.querySelector('#pct').textContent = pct;
      zona.querySelector('#barra').style.width = `${pct}%`;
      if (limpias === total) terminar();
    };

    svg.addEventListener('pointerdown', (e) => { cepillando = true; svg.setPointerCapture(e.pointerId); frotar(e); });
    svg.addEventListener('pointermove', frotar);
    svg.addEventListener('pointerup', () => { cepillando = false; });
    svg.addEventListener('pointercancel', () => { cepillando = false; });

    // Accesible con teclado: flechas para mover, espacio para cepillar.
    let kx = 300, ky = 190;
    svg.tabIndex = 0;
    svg.addEventListener('keydown', (e) => {
      const paso = 18;
      if (e.key === 'ArrowLeft') kx -= paso; else if (e.key === 'ArrowRight') kx += paso;
      else if (e.key === 'ArrowUp') ky -= paso; else if (e.key === 'ArrowDown') ky += paso;
      else if (e.key !== ' ') return;
      e.preventDefault();
      const r = svg.getBoundingClientRect();
      cepillando = true;
      frotar({ clientX: r.left + (kx / 600) * r.width, clientY: r.top + (ky / 380) * r.height });
      cepillando = false;
    });

    let terminado = false;
    function terminar() {
      if (terminado) return;
      terminado = true;
      clearInterval(temporizador);
      const pct = Math.round((limpias / total) * 100);
      const usado = TIEMPO - restante;
      const est = pct === 100 ? (usado <= 35 ? 3 : 2) : pct >= 70 ? 1 : 0;
      pantallaFinal(zona, {
        actividad: 'juego:cepillado',
        puntaje: pct * 10 + restante * 5,
        estrellasGanadas: est,
        mensaje: pct === 100
          ? '¡Dientín quedó brillante! En casa, cepíllate durante dos minutos y pide a un adulto que repase.'
          : `Limpiaste el ${pct} por ciento. ¡No olvides las muelas de atrás y cepillar por todos lados!`,
        alReintentar: empezar,
      });
    }

    temporizador = setInterval(() => {
      restante--;
      const t = zona.querySelector('#t');
      if (t) t.textContent = restante;
      if (restante <= 0) terminar();
    }, 1000);
  };

  pantallaInicio(zona, {
    titulo: 'Cepilla a Dientín',
    icono: '<img class="emo" src="icons/cepillo.svg" alt="">',
    instrucciones: 'Las bacterias dejaron manchas en los dientes de Dientín. Mantén presionado y mueve el cepillo sobre cada mancha hasta que desaparezca. ¡Tienes 60 segundos!',
    alEmpezar: empezar,
  });
  return () => clearInterval(temporizador);
}
