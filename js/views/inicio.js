import { dientin } from '../character.js';
import { perfiles, progreso } from '../store.js';
import { esc } from '../util.js';
import { botonLeer } from '../speech.js';

const CONSEJOS = [
  'Cepíllate los dientes al menos dos veces al día. ¡El cepillado de la noche es el más importante!',
  'El agua es la mejor bebida para tus dientes.',
  'Pídele a un adulto que repase tu cepillado. ¡Las manos grandes ayudan!',
  'Cambia tu cepillo cada tres meses.',
  'Las frutas y verduras crujientes son amigas de tus dientes.',
  'Escupe la espuma de la crema dental, pero no te enjuagues con mucha agua.',
  'Visita al odontólogo aunque no te duela nada.',
];

export function render(app) {
  const p = perfiles.activo();
  const consejo = CONSEJOS[new Date().getDate() % CONSEJOS.length];
  const saludo = p
    ? `¡Hola, ${esc(p.avatar)} ${esc(p.apodo)}! Llevas ${progreso.resumen(p.id).totalEstrellas} estrellas.`
    : '¡Hola! Soy Dientín y quiero ser tu amigo.';

  app.innerHTML = `
  <section class="portada">
    <div class="pila">
      <h1>Manos Grandes<br><span style="color:var(--cielo)">Dientes Chiquitos</span></h1>
      <p style="font-size:1.25rem"><strong>${saludo}</strong> Juega, lee cuentos y aprende a cuidar tu sonrisa con tu familia.</p>
      <div class="fila">
        <a class="btn btn-grande" href="#/juegos">🎮 ¡A jugar!</a>
        <a class="btn btn-grande btn-menta" href="#/cuentos">📚 Leer cuentos</a>
        ${p ? '' : '<a class="btn btn-sol" href="#/perfil">🙂 Crear mi perfil</a>'}
      </div>
    </div>
    ${dientin({ tam: 260, cepillo: true, clase: 'rebote' })}
  </section>

  <section class="tarjeta" style="margin-top:1.5rem">
    <div class="fila entre">
      <p style="margin:0"><strong>💡 Consejo de Dientín:</strong> ${consejo}</p>
      ${botonLeer(consejo)}
    </div>
  </section>

  <h2 style="margin-top:2rem">¿Qué quieres hacer hoy?</h2>
  <div class="rejilla">
    <a class="tarjeta seccion-tarjeta" href="#/juegos"><span class="icono">🎮</span><h3>Juegos</h3><p>Cepilla a Dientín, arma una lonchera saludable y atrapa las bacterias.</p></a>
    <a class="tarjeta seccion-tarjeta borde-menta" href="#/cuentos"><span class="icono">📚</span><h3>Cuentos</h3><p>Historias para leer y escuchar en familia.</p></a>
    <a class="tarjeta seccion-tarjeta borde-coral" href="#/padres"><span class="icono">👨‍👩‍👧</span><h3>Padres y docentes</h3><p>Guías, recomendaciones y actividades para acompañar.</p></a>
    <a class="tarjeta seccion-tarjeta borde-sol" href="#/recordatorios"><span class="icono">⏰</span><h3>Recordatorios</h3><p>Alarmas de cepillado en el celular y calendario de estrellas.</p></a>
  </div>`;
}
