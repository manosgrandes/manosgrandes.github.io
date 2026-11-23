// Página de presentación (landing) con Sofi, la doctora de las sonrisas.

import { dientin } from '../character.js';
import { perfiles } from '../store.js';
import { esc } from '../util.js';
import { botonLeer } from '../speech.js';

export const SOFI = {
  nombre: 'Sofi',
  img: 'img/sofi.webp',
  cara: 'img/sofi-cara.webp',
  saludo: '¡Hola! Soy Sofi, la doctora de las sonrisas. Con mi amigo Dientín vamos a aprender a cuidar los dientes jugando.',
};

export function render(app) {
  const p = perfiles.activo();
  const entrada = JSON.parse(localStorage.getItem('mgdc:entrada') || 'null');
  const continuar = entrada
    ? `<a class="btn btn-grande btn-menta" href="#/inicio">▶ Continuar${p ? ` como ${esc(p.avatar)} ${esc(p.apodo)}` : ''}</a>`
    : '';

  app.innerHTML = `
  <section class="lp-hero">
    <div class="lp-hero-texto pila">
      <span class="etiqueta lp-pildora">🦷 Salud bucal · 🥕 Alimentación · 🤲 Familia</span>
      <h1>Manos Grandes<br><span>Dientes Chiquitos</span></h1>
      <p class="lp-lema">Niñas, niños, familias y docentes aprenden a cuidar la sonrisa <strong>jugando, leyendo cuentos y acompañándose</strong>.</p>
      <div class="fila">
        ${continuar}
        <a class="btn btn-grande ${entrada ? 'btn-claro' : ''}" href="#/entrar">🔑 Entrar</a>
        <button class="btn btn-grande btn-claro" type="button" id="conocer">Conocer más ⬇</button>
      </div>
      <ul class="lp-garantias">
        <li>✅ Gratis</li><li>✅ Sin publicidad</li><li>✅ Funciona sin internet</li><li>✅ Sin datos personales de niños</li>
      </ul>
    </div>
    <div class="lp-hero-figura">
      <div class="lp-mancha" aria-hidden="true"></div>
      <span class="lp-flota f1" aria-hidden="true">⭐</span>
      <span class="lp-flota f2" aria-hidden="true">💖</span>
      <span class="lp-flota f3" aria-hidden="true">🦷</span>
      <span class="lp-flota f4" aria-hidden="true">✨</span>
      <img class="lp-sofi" src="${SOFI.img}" width="760" height="1633" alt="Sofi, una niña sonriente con bata blanca estampada de dientes y pañoleta rosada">
      <div class="lp-globo">¡Hola! Soy <strong>${SOFI.nombre}</strong> 👋 ${botonLeer(SOFI.saludo, '🔊')}</div>
    </div>
  </section>

  <section id="que-hay" class="lp-seccion">
    <h2 class="centro">¿Qué encontrarás?</h2>
    <div class="rejilla">
      <a class="tarjeta seccion-tarjeta" href="#/juegos"><span class="icono">🎮</span><h3>Juegos</h3><p>Cepilla a Dientín, arma la lonchera saludable, atrapa bacterias y gana estrellas.</p></a>
      <a class="tarjeta seccion-tarjeta borde-menta" href="#/cuentos"><span class="icono">📚</span><h3>Cuentos</h3><p>Historias para leer y escuchar en voz alta. También puedes cargar tus propios libros.</p></a>
      <a class="tarjeta seccion-tarjeta borde-coral" href="#/padres"><span class="icono">👨‍👩‍👧</span><h3>Padres y docentes</h3><p>Guías claras por edades, ideas para la lonchera y actividades para el aula.</p></a>
      <a class="tarjeta seccion-tarjeta borde-sol" href="#/recordatorios"><span class="icono">⏰</span><h3>Recordatorios</h3><p>Alarmas de cepillado en el celular y calendario de estrellas para imprimir.</p></a>
    </div>
  </section>

  <section class="lp-seccion lp-pilares">
    <h2 class="centro">Tres pilares para una sonrisa sana</h2>
    <div class="rejilla">
      <div class="tarjeta centro"><div class="lp-icono" style="background:var(--cielo-claro)"><img class="emo" src="icons/cepillo.svg" alt=""></div><h3>Higiene bucal</h3><p>Cepillado dos veces al día, crema con flúor en la cantidad correcta y visitas al odontólogo.</p></div>
      <div class="tarjeta centro"><div class="lp-icono" style="background:var(--menta-claro)">🍎</div><h3>Buena alimentación</h3><p>Frutas, verduras, lácteos y agua. Los dulces, solo de vez en cuando.</p></div>
      <div class="tarjeta centro"><div class="lp-icono" style="background:var(--coral-claro)">🤲</div><h3>Acompañamiento familiar</h3><p>Las manos grandes enseñan, revisan y celebran cada logro de los dientes chiquitos.</p></div>
    </div>
  </section>

  <section class="lp-seccion">
    <h2 class="centro">Para cada quien</h2>
    <div class="rejilla">
      <div class="tarjeta pila"><h3>👧🧒 Niñas y niños</h3><ul><li>Juegan con un apodo, sin cuenta.</li><li>Ganan estrellas y medallas.</li><li>Escuchan los cuentos en voz alta.</li></ul></div>
      <div class="tarjeta pila"><h3>👨‍👩‍👧 Familias</h3><ul><li>Guías prácticas por edad.</li><li>Recordatorios en el celular.</li><li>Calendario de estrellas para la casa.</li></ul></div>
      <div class="tarjeta pila"><h3>👩‍🏫 Docentes</h3><ul><li>Aulas con código y seguimiento.</li><li>Reportes en Excel.</li><li>Secuencia didáctica de 5 sesiones.</li></ul></div>
    </div>
  </section>

  <section class="lp-seccion lp-amigos tarjeta">
    <div class="lp-amigos-fig">
      <img src="${SOFI.cara}" width="160" height="160" alt="Sofi" class="avatar-sofi grande">
      ${dientin({ tam: 150, cepillo: true, clase: 'rebote' })}
    </div>
    <div class="pila">
      <h2>Sofi y Dientín te acompañan</h2>
      <p><strong>Sofi</strong> es la doctora de las sonrisas: te guía por el sitio y te da consejos. <strong>Dientín</strong> es su diente amigo: protagoniza los juegos y los cuentos.</p>
      <p>Juntos enseñan que cuidar los dientes es fácil y divertido cuando lo hacemos en familia.</p>
    </div>
  </section>

  <section class="lp-seccion lp-final centro pila">
    <img src="${SOFI.cara}" width="110" height="110" alt="" class="avatar-sofi">
    <h2>¿Listos para sonreír?</h2>
    <p>Entra como niña o niño, como familia o como docente.</p>
    <p><a class="btn btn-grande btn-menta" href="#/entrar">🔑 Entrar ahora</a></p>
  </section>`;

  app.querySelector('#conocer').addEventListener('click', () => {
    app.querySelector('#que-hay').scrollIntoView({ behavior: 'smooth' });
  });
}
