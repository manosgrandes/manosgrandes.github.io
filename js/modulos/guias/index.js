import { ARTICULOS } from './datos.js';
import { dientinDice } from '../../nucleo/character.js';
import { sesion } from '../../nucleo/sesion.js';

export function render(app) {
  // Cargar cuentos es solo para docentes y familias con sesión; el invitado ve cómo entrar.
  const esAdulto = sesion.actual()?.tipo === 'adulto';
  app.innerHTML = `
  ${dientinDice('Aquí encuentran guías para acompañar a las niñas y los niños en el cuidado de su sonrisa.', { animo: 'guino' })}

  <div class="rejilla" style="margin-top:1.5rem">
    ${ARTICULOS.map((a) => `
      <a class="tarjeta seccion-tarjeta ${a.para === 'Docentes' ? 'borde-lila' : a.para === 'Todos' ? 'borde-sol' : 'borde-coral'}" href="#/app/guias/${a.id}">
        <span class="icono">${a.icono}</span>
        <span class="etiqueta">${a.para}</span>
        <h3>${a.titulo}</h3>
        <p>${a.resumen}</p>
      </a>`).join('')}
  </div>

  <h2 style="margin-top:2rem">Herramientas</h2>
  <div class="rejilla">
    <a class="tarjeta seccion-tarjeta borde-sol" href="#/app/recordatorios"><span class="icono">⏰</span><h3>Recordatorios y calendario</h3><p>Alarmas de cepillado en el celular y calendario de estrellas para imprimir.</p></a>
    <a class="tarjeta seccion-tarjeta borde-lila" href="#/app/docentes"><span class="icono">📊</span><h3>Panel docente</h3><p>Crea aulas, mira el avance de cada niño y descarga reportes.</p></a>
    <a class="tarjeta seccion-tarjeta borde-menta" href="#/app/foro"><span class="icono">💬</span><h3>Foro</h3><p>Comparte ideas y dudas con otras familias y docentes.</p></a>
    <a class="tarjeta seccion-tarjeta" href="${esAdulto ? '#/app/cuentos/nuevo' : '#/entrar?como=adulto'}"><span class="icono">📤</span><h3>Cargar cuentos</h3><p>${esAdulto ? 'Sube un PDF, EPUB o fotos de un libro para leerlo con los niños.' : 'Entra como docente o familia para subir un PDF, EPUB o fotos de un libro.'}</p></a>
  </div>

  <p class="nota" style="margin-top:2rem">La información de este sitio es educativa y de promoción de la salud. No reemplaza la valoración por un profesional de odontología o nutrición.</p>`;
}
