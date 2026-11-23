// Juego: Preguntas de Dientín (con lectura en voz alta).

import { pantallaInicio, pantallaFinal } from './comun.js';
import { barajar, sonido, esc } from '../../../nucleo/util.js';
import { leer } from '../../../nucleo/speech.js';

const PREGUNTAS = [
  { p: '¿Cuántas veces al día debes cepillarte los dientes como mínimo?', r: ['Dos veces, y la de la noche es muy importante', 'Una vez a la semana', 'Solo cuando me duele'], ok: 0 },
  { p: '¿Cuánto tiempo debe durar el cepillado?', r: ['Dos minutos', 'Cinco segundos', 'Una hora'], ok: 0 },
  { p: '¿Cuál es la mejor bebida para tus dientes?', r: ['El agua', 'La gaseosa', 'El jugo de caja'], ok: 0 },
  { p: '¿Quién debe ayudarte a revisar tu cepillado?', r: ['Un adulto de mi familia', 'Nadie', 'Mi mascota'], ok: 0 },
  { p: '¿Cada cuánto se cambia el cepillo de dientes?', r: ['Cada tres meses', 'Nunca', 'Cada cinco años'], ok: 0 },
  { p: '¿Cuánta crema dental se pone a un niño de 3 a 6 años?', r: ['Del tamaño de una arveja', 'Todo el tubo', 'Una montaña grande'], ok: 0 },
  { p: '¿Qué merienda cuida mejor tus dientes?', r: ['Una fruta o un pedazo de queso', 'Muchos caramelos', 'Gaseosa con galletas'], ok: 0 },
  { p: '¿Se puede compartir el cepillo de dientes?', r: ['No, cada persona tiene el suyo', 'Sí, con todos', 'Solo con amigos'], ok: 0 },
  { p: 'Después de cepillarte, ¿qué haces con la espuma?', r: ['La escupo y no me enjuago con mucha agua', 'Me la trago toda', 'La guardo para mañana'], ok: 0 },
  { p: '¿Cuándo debes visitar al odontólogo?', r: ['En controles, aunque no me duela', 'Nunca', 'Solo si se me cae un diente'], ok: 0 },
  { p: '¿Los dientes de leche son importantes?', r: ['Sí, me ayudan a comer y hablar', 'No, porque se caen', 'Solo los de adelante'], ok: 0 },
  { p: '¿Qué les gusta comer a las bacterias que causan caries?', r: ['El azúcar', 'El agua', 'La zanahoria'], ok: 0 },
];
const N = 6;

export function iniciar(zona) {
  let espera;
  const empezar = () => {
    const lista = barajar(PREGUNTAS).slice(0, N).map((q) => {
      const opciones = barajar(q.r.map((texto, i) => ({ texto, ok: i === q.ok })));
      return { ...q, opciones };
    });
    let i = 0;
    let aciertos = 0;

    const mostrar = () => {
      const q = lista[i];
      zona.innerHTML = `
        <div class="marcador"><span>❓ ${i + 1} / ${N}</span><span>✅ ${aciertos}</span></div>
        <div class="pila" style="max-width:700px;margin:0 auto">
          <div class="fila entre"><p class="pregunta" style="margin:0">${esc(q.p)}</p><button class="btn btn-mini" id="oir">🔊 Escuchar</button></div>
          <div class="respuestas">${q.opciones.map((o, k) => `<button class="btn btn-claro" data-k="${k}">${'ABC'[k]}. ${esc(o.texto)}</button>`).join('')}</div>
        </div>`;
      const leerPregunta = () => leer(`${q.p} ${q.opciones.map((o, k) => `${'ABC'[k]}: ${o.texto}.`).join(' ')}`);
      zona.querySelector('#oir').addEventListener('click', leerPregunta);
      leerPregunta();
      zona.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
        const o = q.opciones[b.dataset.k];
        zona.querySelectorAll('[data-k]').forEach((x, k) => {
          x.disabled = true;
          if (q.opciones[k].ok) x.classList.add('correcta');
        });
        if (o.ok) { aciertos++; sonido('bien'); leer('¡Correcto!'); }
        else { b.classList.add('incorrecta'); sonido('mal'); leer(`La respuesta es: ${q.opciones.find((x) => x.ok).texto}`); }
        espera = setTimeout(() => {
          i++;
          if (i < N) mostrar();
          else pantallaFinal(zona, {
            actividad: 'juego:quiz', puntaje: aciertos * 100, estrellasGanadas: aciertos === N ? 3 : aciertos >= 4 ? 2 : aciertos >= 2 ? 1 : 0,
            mensaje: `Respondiste bien ${aciertos} de ${N} preguntas. ¡Eres un guardián de la sonrisa!`,
            alReintentar: empezar,
          });
        }, o.ok ? 1500 : 3200);
      }));
    };
    mostrar();
  };

  pantallaInicio(zona, {
    titulo: 'Preguntas de Dientín',
    icono: '❓',
    instrucciones: 'Dientín te hará 6 preguntas. Escucha bien y escoge la respuesta correcta. Si aún no sabes leer, pide a un adulto que juegue contigo.',
    alEmpezar: empezar,
  });
  return () => clearTimeout(espera);
}
