// Juego: Las sombras de la sonrisa. Adivinar qué objeto es por su silueta.

import { pantallaInicio, pantallaFinal, festejo, sacudir } from './comun.js';
import { barajar, sonido } from '../../../nucleo/util.js';
import { leer } from '../../../nucleo/speech.js';

const OBJETOS = [
  { e: '<img class="emo" src="icons/cepillo.svg" alt="">', n: 'Cepillo', pista: 'Lo uso dos veces al día para limpiar mis dientes.' },
  { e: '🦷', n: 'Diente', pista: 'Me ayuda a morder y a sonreír.' },
  { e: '🍎', n: 'Manzana', pista: 'Es una fruta crujiente que cuida mis dientes.' },
  { e: '🥕', n: 'Zanahoria', pista: 'Es naranja y a los conejos les encanta.' },
  { e: '🥛', n: 'Leche', pista: 'Tiene calcio para dientes fuertes.' },
  { e: '🧀', n: 'Queso', pista: 'Tiene huequitos y mucho calcio.' },
  { e: '🍌', n: 'Banano', pista: 'Es amarillo y lo pelo antes de comer.' },
  { e: '🧼', n: 'Jabón', pista: 'Con él me lavo las manos antes de cepillarme.' },
  { e: '🍭', n: 'Chupeta', pista: 'Es un dulce para comer solo de vez en cuando.' },
  { e: '🐰', n: 'Conejo', pista: 'Tiene dos dientes grandes adelante.' },
  { e: '🦈', n: 'Tiburón', pista: '¡Tiene muchísimos dientes en filas!' },
  { e: '🐊', n: 'Cocodrilo', pista: 'Abre una boca enorme llena de dientes.' },
  { e: '🍓', n: 'Fresa', pista: 'Es roja y tiene semillitas por fuera.' },
  { e: '🥦', n: 'Brócoli', pista: 'Parece un arbolito verde.' },
  { e: '⏰', n: 'Reloj', pista: 'Me dice cuándo llevo dos minutos cepillando.' },
];
const RONDAS = 8;

export function iniciar(zona) {
  let espera;
  const empezar = () => {
    const ronda = barajar(OBJETOS).slice(0, RONDAS);
    let i = 0;
    let aciertos = 0;

    const mostrar = () => {
      const o = ronda[i];
      const opciones = barajar([o, ...barajar(OBJETOS.filter((x) => x !== o)).slice(0, 2)]);
      zona.innerHTML = `
        <div class="marcador"><span>🔦 ${i + 1} / ${RONDAS}</span><span>✅ ${aciertos}</span></div>
        <p class="centro" style="font-size:1.25rem;font-weight:700;margin:0">¿De quién es esta sombra?</p>
        <div class="sombra-grande" id="sombra" aria-hidden="true">${o.e}</div>
        <p class="centro suave" style="margin-top:0">💡 Pista: ${o.pista}</p>
        <div class="opciones-sombra">${opciones.map((x, k) => `<button class="btn" data-k="${k}">${x.n}</button>`).join('')}</div>`;
      leer(`¿De quién es esta sombra? Pista: ${o.pista}`);
      zona.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
        const elegido = opciones[b.dataset.k];
        const bien = elegido === o;
        zona.querySelectorAll('[data-k]').forEach((x, k) => { x.disabled = true; if (opciones[k] === o) x.classList.add('correcta'); });
        zona.querySelector('#sombra').classList.add('revelada');
        if (bien) { aciertos++; sonido('bien'); festejo(b, '¡Sí! ⭐'); leer(`¡Sí! Es ${o.n}`); }
        else { b.classList.add('incorrecta'); sacudir(b); sonido('mal'); leer(`Era ${o.n}`); }
        espera = setTimeout(() => {
          i++;
          if (i < RONDAS) mostrar();
          else pantallaFinal(zona, {
            actividad: 'juego:sombras', puntaje: aciertos * 100, estrellasGanadas: aciertos >= 7 ? 3 : aciertos >= 5 ? 2 : aciertos >= 3 ? 1 : 0,
            mensaje: `Adivinaste ${aciertos} de ${RONDAS} sombras. ¡Tienes ojos de detective!`,
            alReintentar: empezar,
          });
        }, 1900);
      }));
    };
    mostrar();
  };

  pantallaInicio(zona, {
    titulo: 'Las sombras de la sonrisa',
    icono: '🔦',
    instrucciones: 'Las luces se apagaron y solo vemos sombras. Mira la forma, escucha la pista y toca el nombre correcto.',
    alEmpezar: empezar,
  });
  return () => clearTimeout(espera);
}
