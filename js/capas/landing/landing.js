// Capa 1 — Landing: presentación pública con Sofi. Desde aquí se pasa al login.

import { dientin } from '../../nucleo/character.js';
import { sesion } from '../../nucleo/sesion.js';
import { SOFI } from '../../nucleo/sofi.js';
import { leer } from '../../nucleo/speech.js';
import { esc } from '../../nucleo/util.js';

const CEPILLO = '<img class="emo" src="icons/cepillo.svg" alt="">';

const CONSEJOS = [
  `${CEPILLO} Cepíllate dos veces al día`, '🌙 El cepillado de la noche es el más importante', '💧 El agua es la mejor bebida',
  '🍎 Frutas y verduras crujientes', '🤲 Un adulto repasa el cepillado', '⏱️ Dos minutos de cepillado',
  '🧑‍⚕️ Visita al odontólogo aunque no duela', '🍬 Dulces solo de vez en cuando',
];

const titulo = (texto, clase = '') => texto.split(' ').map((p, i) =>
  `<span class="lp-palabra ${clase}" style="--i:${i}">${p}</span>`).join(' ');

export function render(raiz) {
  const s = sesion.actual();
  const id = sesion.identidad();
  const ctaPrincipal = s
    ? `<a class="btn btn-grande btn-brillo" href="#/app">▶ Ir a mi espacio <span class="lp-quien">${esc(id.avatar)} ${esc(id.nombre)}</span></a>`
    : '<a class="btn btn-grande btn-brillo" href="#/entrar">🔑 Entrar al sistema</a>';

  raiz.innerHTML = `
  <div class="lp">
    <div class="lp-progreso" aria-hidden="true"><i id="lp-barra"></i></div>

    <header class="lp-cabecera" id="lp-cabecera">
      <a class="lp-marca" href="#/" aria-label="Manos Grandes Dientes Chiquitos">
        <img src="icons/icon.svg" alt="" width="44" height="44"><span><strong>Manos Grandes</strong><small>Dientes Chiquitos</small></span>
      </a>
      <nav class="lp-anclas" aria-label="Secciones">
        <button data-ir="lp-modulos">Qué hay</button>
        <button data-ir="lp-pilares">Pilares</button>
        <button data-ir="lp-pasos">Cómo funciona</button>
        <button data-ir="lp-quienes">Para quién</button>
      </nav>
      <a class="btn lp-cta-cabecera" href="${s ? '#/app' : '#/entrar'}">${s ? 'Mi espacio ➜' : 'Entrar ➜'}</a>
    </header>

    <!-- HERO -->
    <section class="lp-hero" id="lp-hero">
      <div class="lp-fondo" aria-hidden="true">
        <span class="lp-burbuja b1"></span><span class="lp-burbuja b2"></span><span class="lp-burbuja b3"></span><span class="lp-burbuja b4"></span>
      </div>
      <div class="lp-particulas" id="lp-particulas" aria-hidden="true"></div>

      <div class="lp-hero-txt">
        <span class="lp-chip lp-aparece" style="--d:.1s">🦷 Salud bucal · 🥕 Alimentación · 🤲 Familia</span>
        <h1>
          <span class="lp-linea">${titulo('Manos Grandes')}</span>
          <span class="lp-linea lp-degradado">${titulo('Dientes Chiquitos', 'lp-p2')}</span>
        </h1>
        <p class="lp-lema lp-aparece" style="--d:.9s">Niñas, niños, familias y docentes aprenden a cuidar la sonrisa <strong>jugando, leyendo cuentos y acompañándose</strong>.</p>
        <div class="lp-acciones lp-aparece" style="--d:1.1s">
          ${ctaPrincipal}
          <button class="btn btn-grande btn-vidrio" data-ir="lp-modulos">Conocer más</button>
        </div>
        <ul class="lp-garantias lp-aparece" style="--d:1.3s">
          <li>✅ Gratis</li><li>✅ Sin publicidad</li><li>✅ Funciona sin internet</li><li>✅ Sin datos personales de niños</li>
        </ul>
      </div>

      <div class="lp-escenario" id="lp-escenario">
        <div class="lp-aro" data-prof="10" aria-hidden="true"></div>
        <div class="lp-aro lp-aro2" data-prof="18" aria-hidden="true"></div>
        <img class="lp-sofi" data-prof="6" src="${SOFI.img}" width="760" height="1633" alt="Sofi, una niña sonriente con bata blanca estampada de dientes y pañoleta rosada">
        <div class="lp-insignia i1" data-prof="26">⭐ 5 juegos</div>
        <div class="lp-insignia i2" data-prof="30">📚 Cuentos que se leen solos</div>
        <div class="lp-insignia i3" data-prof="22">🏅 Medallas</div>
        <div class="lp-dientin" data-prof="34">${dientin({ tam: 96, cepillo: true })}</div>
        <button class="lp-globo" id="lp-globo" type="button" aria-label="Escuchar el saludo de Sofi"><span id="lp-escribe"></span><span class="lp-cursor" aria-hidden="true">|</span> 🔊</button>
      </div>

      <svg class="lp-ola" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path class="ola-a" d="M0,64 C240,120 480,0 720,48 C960,96 1200,24 1440,64 L1440,120 L0,120 Z"/>
        <path class="ola-b" d="M0,80 C300,30 520,120 760,80 C1000,40 1220,110 1440,70 L1440,120 L0,120 Z"/>
      </svg>
    </section>

    <!-- CINTA DE CONSEJOS -->
    <div class="lp-cinta" aria-label="Consejos de Sofi">
      <div class="lp-cinta-pista">${[...CONSEJOS, ...CONSEJOS].map((c) => `<span>${c}</span>`).join('')}</div>
    </div>

    <!-- CIFRAS -->
    <section class="lp-cifras lp-ancho">
      ${[['5', 'juegos interactivos', '🎮'], ['3', 'cuentos de Dientín + los tuyos', '📚'], ['6', 'guías para adultos', '📖'], ['100', '% gratis y sin anuncios', '💖']]
        .map(([n, t, i], k) => `<div class="lp-cifra" data-revelar style="--d:${k * 0.12}s"><span class="lp-cifra-ico">${i}</span><strong data-contar="${n}">0</strong><span>${t}</span></div>`).join('')}
    </section>

    <!-- MÓDULOS -->
    <section class="lp-seccion lp-ancho" id="lp-modulos">
      <p class="lp-antetitulo" data-revelar>Adentro del sistema</p>
      <h2 data-revelar>Todo lo que encontrarás</h2>
      <div class="lp-modulos">
        ${[
          ['🎮', 'Juegos', 'Cepilla a Dientín, arma la lonchera saludable, atrapa bacterias y responde preguntas.', '#4FC3F7'],
          ['📚', 'Cuentos', 'Historias para leer y escuchar en voz alta. Carga tus propios libros en PDF o EPUB.', '#4CC38A'],
          ['👨‍👩‍👧', 'Guías', 'Higiene por edades, ideas para la lonchera, acompañamiento y actividades de aula.', '#FF7A85'],
          ['⏰', 'Recordatorios', 'Alarmas de cepillado en el celular, temporizador y calendario de estrellas.', '#F4A900'],
          ['📊', 'Panel docente', 'Aulas con código, seguimiento por estudiante y reportes en Excel.', '#9B8CFF'],
          ['💬', 'Comunidad', 'Foro entre familias y docentes, y contacto directo con el equipo.', '#E2557A'],
        ].map(([i, t, d, c], k) => `
          <article class="lp-modulo" data-revelar data-inclinar style="--c:${c};--d:${(k % 3) * 0.1}s">
            <span class="lp-modulo-ico">${i}</span><h3>${t}</h3><p>${d}</p>
          </article>`).join('')}
      </div>
    </section>

    <!-- PILARES -->
    <section class="lp-seccion lp-pilares" id="lp-pilares">
      <div class="lp-ancho">
        <p class="lp-antetitulo" data-revelar>Nuestra propuesta</p>
        <h2 data-revelar>Tres pilares para una sonrisa sana</h2>
        ${[
          [CEPILLO, 'Higiene bucal', 'Cepillado dos veces al día, crema con flúor en la cantidad correcta según la edad y visitas al odontólogo desde el primer diente.', 'var(--cielo-claro)'],
          ['🍎', 'Buena alimentación', 'Frutas, verduras, lácteos y agua todos los días. Los dulces, solo de vez en cuando y nunca antes de dormir.', 'var(--menta-claro)'],
          ['🤲', 'Acompañamiento familiar', 'Las manos grandes enseñan, revisan el cepillado y celebran cada logro de los dientes chiquitos.', 'var(--coral-claro)'],
        ].map(([i, t, d, c], k) => `
          <div class="lp-pilar ${k % 2 ? 'invertido' : ''}" data-revelar="${k % 2 ? 'derecha' : 'izquierda'}">
            <div class="lp-pilar-ico" style="background:${c}">${i}</div>
            <div><span class="lp-num">0${k + 1}</span><h3>${t}</h3><p>${d}</p></div>
          </div>`).join('')}
      </div>
    </section>

    <!-- CÓMO FUNCIONA -->
    <section class="lp-seccion lp-ancho" id="lp-pasos">
      <p class="lp-antetitulo" data-revelar>Así de fácil</p>
      <h2 data-revelar>¿Cómo funciona?</h2>
      <div class="lp-pasos" id="lp-pasos-lista">
        <svg class="lp-linea-pasos" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true"><path d="M20,10 L980,10"/></svg>
        ${[['1', '🔑', 'Entra', 'Como niña o niño con tu apodo, o como docente o familia.'],
           ['2', '🧭', 'Elige un módulo', 'Juegos, cuentos, guías, recordatorios o el panel docente.'],
           ['3', '🌟', 'Aprende y gana', 'Suma estrellas, desbloquea medallas y cuida tu sonrisa.']]
          .map(([n, i, t, d], k) => `<div class="lp-paso" data-revelar style="--d:${k * 0.25}s"><span class="lp-paso-num">${n}</span><span class="lp-paso-ico">${i}</span><h3>${t}</h3><p>${d}</p></div>`).join('')}
      </div>
    </section>

    <!-- PARA QUIÉN -->
    <section class="lp-seccion lp-ancho" id="lp-quienes">
      <p class="lp-antetitulo" data-revelar>Para cada quien</p>
      <h2 data-revelar>Un espacio para toda la comunidad</h2>
      <div class="lp-quienes">
        ${[['👧🧒', 'Niñas y niños', ['Juegan con un apodo, sin contraseña', 'Ganan estrellas y medallas', 'Escuchan cuentos en voz alta'], '#4FC3F7'],
           ['👨‍👩‍👧', 'Familias', ['Guías prácticas por edad', 'Recordatorios en el celular', 'Calendario de estrellas'], '#FF7A85'],
           ['👩‍🏫', 'Docentes', ['Aulas con código y seguimiento', 'Reportes en Excel', 'Secuencia didáctica de 5 sesiones'], '#9B8CFF']]
          .map(([i, t, l, c], k) => `<article class="lp-quien-tarjeta" data-revelar data-inclinar style="--c:${c};--d:${k * 0.12}s">
            <span class="lp-quien-ico">${i}</span><h3>${t}</h3><ul>${l.map((x) => `<li>${x}</li>`).join('')}</ul></article>`).join('')}
      </div>
    </section>

    <!-- AMIGOS -->
    <section class="lp-seccion lp-ancho">
      <div class="lp-amigos" data-revelar>
        <div class="lp-amigos-fig">
          <img src="${SOFI.cara}" width="170" height="170" alt="Sofi" class="avatar-sofi lp-amiga">
          <div class="lp-amigo">${dientin({ tam: 150, cepillo: true, clase: 'rebote' })}</div>
        </div>
        <div>
          <p class="lp-antetitulo">Los personajes</p>
          <h2>Sofi y Dientín te acompañan</h2>
          <p><strong>Sofi</strong> es la doctora de las sonrisas: te guía por el sistema y te da consejos. <strong>Dientín</strong> es su diente amigo: protagoniza los juegos y los cuentos.</p>
          <p>Juntos enseñan que cuidar los dientes es fácil y divertido cuando lo hacemos en familia.</p>
        </div>
      </div>
    </section>

    <!-- LLAMADO FINAL -->
    <section class="lp-final" data-revelar>
      <div class="lp-final-brillo" aria-hidden="true"></div>
      <img src="${SOFI.cara}" width="120" height="120" alt="" class="avatar-sofi">
      <h2>¿Listos para sonreír?</h2>
      <p>Entra como niña o niño, como familia o como docente.</p>
      <a class="btn btn-grande btn-blanco" href="${s ? '#/app' : '#/entrar'}">${s ? '▶ Ir a mi espacio' : '🔑 Entrar ahora'}</a>
    </section>

    <footer class="lp-pie">
      <div class="lp-ancho lp-pie-cols">
        <div><a class="lp-marca" href="#/"><img src="icons/icon.svg" alt="" width="40" height="40"><span><strong>Manos Grandes</strong><small>Dientes Chiquitos</small></span></a>
          <p>Promoción y prevención en salud bucal para la primera infancia.</p></div>
        <nav aria-label="Enlaces"><a href="#/entrar">Entrar</a><a href="#/privacidad">Privacidad</a></nav>
      </div>
      <p class="lp-ancho lp-legal">La información es educativa y no reemplaza la consulta con odontología.</p>
    </footer>
  </div>`;

  return animar(raiz);
}

/** Animaciones de la landing. Devuelve una función que las detiene. */
function animar(raiz) {
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const limpiezas = [];
  const escuchar = (obj, ev, fn, op) => { obj.addEventListener(ev, fn, op); limpiezas.push(() => obj.removeEventListener(ev, fn, op)); };

  // Desplazamiento suave a secciones (los botones no cambian la ruta).
  raiz.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => {
    raiz.querySelector(`#${b.dataset.ir}`).scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth' });
  }));

  // Cabecera sólida al bajar + barra de progreso de lectura.
  const cabecera = raiz.querySelector('#lp-cabecera');
  const barra = raiz.querySelector('#lp-barra');
  const alDesplazar = () => {
    const y = scrollY;
    cabecera.classList.toggle('solida', y > 30);
    const total = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${total > 0 ? y / total : 0})`;
  };
  escuchar(window, 'scroll', alDesplazar, { passive: true });
  alDesplazar();

  // Partículas flotantes (dientes, estrellas, burbujas).
  const zona = raiz.querySelector('#lp-particulas');
  const piezas = ['🦷', '⭐', '✨', '💧', '💖', '💦', '🍎', '🌟'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('span');
    p.textContent = piezas[i % piezas.length];
    p.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;--t:${8 + Math.random() * 10}s;--r:${Math.random() * 360}deg;--e:${0.6 + Math.random() * 0.9};animation-delay:${-Math.random() * 10}s`;
    zona.append(p);
  }

  // Saludo que se escribe solo.
  const escribe = raiz.querySelector('#lp-escribe');
  const frase = '¡Hola! Soy Sofi 👋';
  let k = 0;
  const tipear = setInterval(() => {
    k++;
    escribe.textContent = [...frase].slice(0, k).join('');
    if (k >= [...frase].length) clearInterval(tipear);
  }, sinMovimiento ? 1 : 90);
  limpiezas.push(() => clearInterval(tipear));
  raiz.querySelector('#lp-globo').addEventListener('click', () => leer(SOFI.saludo));

  // Parallax del escenario con el mouse.
  const escenario = raiz.querySelector('#lp-escenario');
  const capas = [...escenario.querySelectorAll('[data-prof]')];
  if (!sinMovimiento && matchMedia('(pointer: fine)').matches) {
    let pendiente = false;
    escuchar(raiz.querySelector('#lp-hero'), 'mousemove', (e) => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        const dx = e.clientX / innerWidth - 0.5;
        const dy = e.clientY / innerHeight - 0.5;
        capas.forEach((c) => { const p = Number(c.dataset.prof); c.style.translate = `${-dx * p}px ${-dy * p}px`; });
        pendiente = false;
      });
    });
  }

  // Aparición al hacer scroll + contadores + línea de pasos.
  const contar = (el) => {
    const fin = Number(el.dataset.contar);
    const inicio = performance.now();
    const dur = sinMovimiento ? 1 : 1400;
    const paso = (t) => {
      const x = Math.min(1, (t - inicio) / dur);
      el.textContent = Math.round(fin * (1 - (1 - x) ** 3));
      if (x < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visible');
      en.target.querySelectorAll?.('[data-contar]').forEach(contar);
      if (en.target.matches('[data-contar]')) contar(en.target);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
  raiz.querySelectorAll('[data-revelar], #lp-pasos-lista').forEach((el) => obs.observe(el));
  limpiezas.push(() => obs.disconnect());

  // Inclinación 3D de tarjetas.
  if (!sinMovimiento && matchMedia('(pointer: fine)').matches) {
    raiz.querySelectorAll('[data-inclinar]').forEach((t) => {
      t.addEventListener('mousemove', (e) => {
        const r = t.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        t.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-6px)`;
      });
      t.addEventListener('mouseleave', () => { t.style.transform = ''; });
    });
  }

  return () => limpiezas.forEach((f) => f());
}
