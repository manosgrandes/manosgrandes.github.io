// Juego: La lonchera saludable. Clasificar alimentos.

import { pantallaInicio, pantallaFinal } from './comun.js';
import { barajar, sonido } from '../../../nucleo/util.js';
import { leer } from '../../../nucleo/speech.js';
import { dientin } from '../../../nucleo/character.js';

const ALIMENTOS = [
  { e: '🍎', n: 'Manzana', sano: true, por: 'La fruta crujiente ayuda a limpiar los dientes.' },
  { e: '🥕', n: 'Zanahoria', sano: true, por: 'Masticar verduras crujientes fortalece tus dientes.' },
  { e: '🥛', n: 'Leche', sano: true, por: 'La leche tiene calcio para dientes y huesos fuertes.' },
  { e: '🧀', n: 'Queso', sano: true, por: 'El queso tiene calcio y protege tus dientes.' },
  { e: '💧', n: 'Agua', sano: true, por: 'El agua es la mejor bebida: limpia la boca y no tiene azúcar.' },
  { e: '🍌', n: 'Banano', sano: true, por: 'La fruta entera es mejor que el jugo.' },
  { e: '🥚', n: 'Huevo', sano: true, por: 'El huevo te da energía y no tiene azúcar.' },
  { e: '🥦', n: 'Brócoli', sano: true, por: 'Las verduras verdes son súper poderosas.' },
  { e: '🍐', n: 'Pera', sano: true, por: 'Las frutas son un postre delicioso y sano.' },
  { e: '🍬', n: 'Caramelo', sano: false, por: 'Los caramelos se pegan a los dientes y alimentan a las bacterias.' },
  { e: '🥤', n: 'Gaseosa', sano: false, por: 'La gaseosa tiene mucho azúcar y ácido.' },
  { e: '🍭', n: 'Chupeta', sano: false, por: 'Pasa mucho tiempo en la boca llenándola de azúcar.' },
  { e: '🍩', n: 'Rosquilla', sano: false, por: 'Tiene mucho azúcar. Mejor solo de vez en cuando.' },
  { e: '🍫', n: 'Chocolatina', sano: false, por: 'Es para ocasiones especiales y después… ¡a cepillarse!' },
  { e: '🍟', n: 'Papas fritas', sano: false, por: 'Tienen mucha sal y grasa, y se quedan entre los dientes.' },
  { e: '🧁', n: 'Ponqué', sano: false, por: 'Es rico, pero mejor solo en celebraciones.' },
];
const RONDAS = 10;

export function iniciar(zona) {
  let espera;
  const empezar = () => {
    const ronda = barajar(ALIMENTOS).slice(0, RONDAS);
    let i = 0;
    let aciertos = 0;

    const mostrar = () => {
      const a = ronda[i];
      zona.innerHTML = `
        <div class="marcador"><span>🍱 ${i + 1} / ${RONDAS}</span><span>✅ ${aciertos}</span></div>
        <div class="alimento" aria-live="polite">${a.e}</div>
        <p class="centro" style="font-size:1.4rem;font-weight:800;margin-top:0">${a.n}</p>
        <div class="opciones">
          <button class="btn btn-menta" data-r="si">😁 ¡A la lonchera!<br>Cuida mis dientes</button>
          <button class="btn btn-coral" data-r="no">🙊 Solo de vez en cuando</button>
        </div>
        <p id="por" class="centro" style="min-height:3em;font-weight:700"></p>`;
      leer(a.n);
      zona.querySelectorAll('[data-r]').forEach((b) => b.addEventListener('click', () => {
        const bien = (b.dataset.r === 'si') === a.sano;
        if (bien) aciertos++;
        sonido(bien ? 'bien' : 'mal');
        zona.querySelectorAll('[data-r]').forEach((x) => { x.disabled = true; });
        const por = zona.querySelector('#por');
        por.innerHTML = `<span style="display:inline-flex;align-items:center;gap:.5rem">${dientin({ tam: 50, animo: bien ? 'feliz' : 'sorpresa' })} ${bien ? '¡Correcto!' : '¡Uy!'} ${a.por}</span>`;
        leer(`${bien ? 'Correcto' : 'Uy'}. ${a.por}`);
        espera = setTimeout(() => {
          i++;
          if (i < RONDAS) mostrar();
          else {
            const est = aciertos >= 9 ? 3 : aciertos >= 7 ? 2 : aciertos >= 5 ? 1 : 0;
            pantallaFinal(zona, {
              actividad: 'juego:alimentos', puntaje: aciertos * 100, estrellasGanadas: est,
              mensaje: `Acertaste ${aciertos} de ${RONDAS}. Recuerda: frutas, verduras, lácteos y agua todos los días; dulces solo de vez en cuando.`,
              alReintentar: empezar,
            });
          }
        }, 2600);
      }));
    };
    mostrar();
  };

  pantallaInicio(zona, {
    titulo: 'La lonchera saludable',
    icono: '🍱',
    instrucciones: 'Aparecerán alimentos. Decide si van a la lonchera porque cuidan tus dientes, o si es mejor comerlos solo de vez en cuando.',
    alEmpezar: empezar,
  });
  return () => clearTimeout(espera);
}
