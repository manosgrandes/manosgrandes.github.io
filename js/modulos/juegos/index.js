import { perfiles, progreso, JUEGOS } from '../../nucleo/store.js';
import { dientinDice } from '../../nucleo/character.js';
import { estrellas } from '../../nucleo/util.js';

export const LISTA_JUEGOS = [
  { id: 'cepillado', icono: '<img class="emo" src="icons/cepillo.svg" alt="">', desc: 'Limpia todos los dientes de Dientín antes de que se acabe el tiempo.', edad: '3+' },
  { id: 'alimentos', icono: '🥕', desc: '¿Qué alimento cuida tus dientes? ¡Arma la lonchera saludable!', edad: '4+' },
  { id: 'memoria', icono: '🃏', desc: 'Encuentra las parejas de los hábitos de higiene.', edad: '4+' },
  { id: 'bacterias', icono: '🦠', desc: 'Toca las bacterias rápido para proteger los dientes.', edad: '3+' },
  { id: 'quiz', icono: '❓', desc: 'Responde las preguntas de Dientín. ¡Te las lee en voz alta!', edad: '5+' },
];

export function render(app) {
  const p = perfiles.activo();
  const mejor = p ? progreso.resumen(p.id).mejor : {};
  app.innerHTML = `
  ${dientinDice(p ? `¡Vamos, ${p.apodo}! Gana hasta 3 estrellas en cada juego.` : 'Puedes jugar ya mismo. Si creas tu perfil, guardo tus estrellas y medallas.')}
  ${p ? '' : '<p><a class="btn btn-sol" href="#/entrar">🙂 Entrar con mi perfil</a></p>'}
  <div class="rejilla" style="margin-top:1.5rem">
    ${LISTA_JUEGOS.map((j) => {
      const m = mejor[`juego:${j.id}`];
      return `<a class="tarjeta juego-tarjeta seccion-tarjeta" href="#/app/juegos/${j.id}">
        <span class="icono">${j.icono}</span><h3>${JUEGOS[`juego:${j.id}`]}</h3><p>${j.desc}</p>
        <p class="chico suave">Edad: ${j.edad}${m ? ` · Mejor: ${estrellas(m.estrellas)}` : ''}</p></a>`;
    }).join('')}
  </div>`;
}
