import { perfiles, progreso, JUEGOS } from '../../nucleo/store.js';
import { dientinDice } from '../../nucleo/character.js';
import { estrellas } from '../../nucleo/util.js';

// color: fondo pastel de la tarjeta · tinta: color fuerte para borde, botón y detalles.
export const LISTA_JUEGOS = [
  { id: 'cepillado', icono: '<img class="emo" src="icons/cepillo.svg" alt="">', desc: 'Limpia todos los dientes de Dientín antes de que se acabe el tiempo.', edad: '3+', color: '#DDF0FD', tinta: '#4A9FE0' },
  { id: 'alimentos', icono: '🥕', desc: '¿Qué alimento cuida tus dientes? ¡Arma la lonchera saludable!', edad: '4+', color: '#E4F6EE', tinta: '#2FA77A' },
  { id: 'memoria', icono: '🃏', desc: 'Encuentra las parejas de los hábitos de higiene.', edad: '4+', color: '#EFEBFF', tinta: '#7C6AF2' },
  { id: 'bacterias', icono: '🦠', desc: 'Toca las bacterias rápido para proteger los dientes.', edad: '3+', color: '#FDE3EC', tinta: '#D9608E' },
  { id: 'quiz', icono: '❓', desc: 'Responde las preguntas de Dientín. ¡Te las lee en voz alta!', edad: '5+', color: '#FFF5DC', tinta: '#E3A008' },
  { id: 'atrapa', icono: '🍎', desc: 'Mueve a Dientín y atrapa la comida sana que cae del cielo.', edad: '3+', color: '#FFE9E3', tinta: '#E9735F' },
  { id: 'pasos', icono: '👣', desc: 'Ordena los pasos para cepillarte los dientes como un experto.', edad: '4+', color: '#E3F7F6', tinta: '#1FA39A' },
  { id: 'sombras', icono: '🔦', desc: '¿De quién es esta sombra? Adivina cada objeto de la sonrisa.', edad: '3+', color: '#ECE7FD', tinta: '#6C5CE7' },
  { id: 'musica', icono: '🎵', desc: 'Repite la canción de los dientes que cantan. ¡Entrena tu memoria!', edad: '4+', color: '#FCE4F3', tinta: '#C2439B' },
  { id: 'contar', icono: '🔢', desc: 'Cuenta dientes, cepillos y frutas. ¡Aprende los números con Dientín!', edad: '3+', color: '#FFF0D6', tinta: '#E08A1E' },
];

export function render(app) {
  const p = perfiles.activo();
  const mejor = p ? progreso.resumen(p.id).mejor : {};
  app.innerHTML = `
  ${dientinDice(p ? `¡Vamos, ${p.apodo}! Tienes ${LISTA_JUEGOS.length} juegos. Gana hasta 3 estrellas en cada uno.` : `¡Hay ${LISTA_JUEGOS.length} juegos para ti! Si creas tu perfil, guardo tus estrellas y medallas.`)}
  ${p ? '' : '<p><a class="btn btn-sol" href="#/entrar">🙂 Entrar con mi perfil</a></p>'}
  <div class="rejilla rejilla-juegos" style="margin-top:1.5rem">
    ${LISTA_JUEGOS.map((j, n) => {
      const m = mejor[`juego:${j.id}`];
      return `<a class="juego-tarjeta" href="#/app/juegos/${j.id}" style="--jc:${j.color};--jt:${j.tinta};--retraso:${n * 60}ms">
        <span class="juego-edad">${j.edad} años</span>
        ${n >= 5 ? '<span class="juego-nuevo">¡Nuevo!</span>' : ''}
        <span class="icono">${j.icono}</span>
        <h3>${JUEGOS[`juego:${j.id}`]}</h3>
        <p>${j.desc}</p>
        <span class="juego-pie">${m ? estrellas(m.estrellas) : '<span class="suave chico">Aún sin estrellas</span>'}<span class="juego-jugar">▶ Jugar</span></span>
      </a>`;
    }).join('')}
  </div>`;
}
