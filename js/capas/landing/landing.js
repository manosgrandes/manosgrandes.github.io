// Capa 1 — Landing: presentación pública. Sofi recibe con un saludo (gesto y voz).
// Desde aquí se pasa al login.

import { sesion } from '../../nucleo/sesion.js';
import { SOFI, DIENTIN, sofiSaludando, saludarConVoz } from '../../nucleo/sofi.js';
import { leer, detener, vozDisponible } from '../../nucleo/speech.js';
import { icono } from '../../nucleo/iconos.js';
import { esc } from '../../nucleo/util.js';

const MODULOS = [
  ['juegos', 'Juegos', 'Cepilla a Dientín, arma la lonchera saludable, atrapa bacterias y responde preguntas.', 'azul'],
  ['cuentos', 'Cuentos', 'Historias para leer y escuchar en voz alta. Carga tus propios libros en PDF o EPUB.', 'verde'],
  ['guias', 'Guías', 'Higiene por edades, ideas para la lonchera, acompañamiento y actividades de aula.', 'rosa'],
  ['recordatorios', 'Recordatorios', 'Alarmas de cepillado en el celular, temporizador y calendario de estrellas.', 'ambar'],
  ['docentes', 'Panel docente', 'Aulas con código, seguimiento por estudiante y reportes en Excel.', 'violeta'],
  ['foro', 'Comunidad', 'Foro entre familias y docentes, y contacto directo con el equipo.', 'azul'],
];

const PILARES = [
  ['diente', 'Higiene bucal', 'Cepillado dos veces al día, crema con flúor en la cantidad correcta según la edad y visitas al odontólogo desde el primer diente.'],
  ['manzana', 'Buena alimentación', 'Frutas, verduras, lácteos y agua todos los días. Los dulces, solo de vez en cuando y nunca antes de dormir.'],
  ['manos', 'Acompañamiento familiar', 'Las manos grandes enseñan, revisan el cepillado y celebran cada logro de los dientes chiquitos.'],
];

const PASOS = [
  ['Entra', 'Como niña o niño con tu apodo, o como docente o familia.'],
  ['Elige un módulo', 'Juegos, cuentos, guías, recordatorios o el panel docente.'],
  ['Aprende y gana', 'Suma estrellas, desbloquea medallas y cuida tu sonrisa.'],
];

const PUBLICOS = [
  ['invitado', 'Niñas y niños', ['Juegan con un apodo, sin contraseña', 'Ganan estrellas y medallas', 'Escuchan cuentos en voz alta']],
  ['guias', 'Familias', ['Guías prácticas por edad', 'Recordatorios en el celular', 'Calendario de estrellas']],
  ['escuela', 'Docentes', ['Aulas con código y seguimiento', 'Reportes en Excel', 'Secuencia didáctica de 5 sesiones']],
];

export function render(raiz) {
  const s = sesion.actual();
  const id = sesion.identidad();
  const destino = s ? '#/app' : '#/entrar';
  const ctaPrincipal = s
    ? `<a class="btn btn-grande" href="#/app">Ir a mi espacio <span class="lp-quien">${esc(id.avatar)} ${esc(id.nombre)}</span></a>`
    : `<a class="btn btn-grande" href="#/entrar">Entrar al sistema ${icono('flecha', { tam: 18 })}</a>`;

  raiz.innerHTML = `
  <div class="lp">
    <header class="lp-cabecera" id="lp-cabecera">
      <div class="lp-ancho lp-cabecera-in">
        <a class="marca" href="#/" aria-label="Manos Grandes Dientes Chiquitos">
          <img src="icons/icon.svg" alt="" width="38" height="38"><span><strong>Manos Grandes</strong><small>Dientes Chiquitos</small></span>
        </a>
        <nav class="lp-anclas" aria-label="Secciones">
          <button data-ir="lp-modulos">Qué hay</button>
          <button data-ir="lp-pilares">Pilares</button>
          <button data-ir="lp-pasos">Cómo funciona</button>
          <button data-ir="lp-quienes">Para quién</button>
        </nav>
        <a class="btn lp-cta-cabecera" href="${destino}">${s ? 'Mi espacio' : 'Entrar'}</a>
      </div>
    </header>

    <!-- HERO -->
    <section class="lp-hero" id="lp-hero">
      <div class="lp-ancho lp-hero-in">
        <div class="lp-hero-txt">
          <span class="lp-chip lp-aparece">${icono('chispa', { tam: 16 })} Salud bucal para la primera infancia</span>
          <h1 class="lp-aparece" style="--d:.08s">Manos Grandes,<br><span>Dientes Chiquitos</span></h1>
          <p class="lp-lema lp-aparece" style="--d:.16s">Niñas, niños, familias y docentes aprenden a cuidar la sonrisa jugando, leyendo cuentos y acompañándose.</p>
          <div class="lp-acciones lp-aparece" style="--d:.24s">
            ${ctaPrincipal}
            <button class="btn btn-grande btn-claro" data-ir="lp-modulos">Conocer más</button>
          </div>
          <ul class="lp-garantias lp-aparece" style="--d:.32s">
            ${['Gratis', 'Sin publicidad', 'Funciona sin internet', 'Sin datos personales de niños']
              .map((t) => `<li>${icono('check', { tam: 16 })}${t}</li>`).join('')}
          </ul>
        </div>

        <div class="lp-escenario" id="lp-escenario">
          <div class="lp-halo" aria-hidden="true"></div>
          ${sofiSaludando({ clase: 'lp-sofi' })}
          <div class="lp-globo" id="lp-globo">
            <p><strong>¡Hola! Bienvenido a</strong> Manos Grandes, Dientes Chiquitos.</p>
            ${vozDisponible() ? `<button type="button" class="lp-escuchar" id="lp-escuchar" aria-label="Escuchar el saludo de Sofi">${icono('sonido', { tam: 18 })}<span>Escuchar</span></button>` : ''}
          </div>
          <div class="lp-insignia i1">${icono('juegos', { tam: 18 })}<span><strong>5</strong> juegos</span></div>
          <div class="lp-insignia i2">${icono('medalla', { tam: 18 })}<span>Estrellas y medallas</span></div>
        </div>
      </div>
    </section>

    <!-- CIFRAS -->
    <section class="lp-cifras-banda" aria-label="En cifras">
      <div class="lp-ancho lp-cifras">
        ${[['5', 'juegos interactivos'], ['3', 'cuentos de Dientín, y los tuyos'], ['6', 'guías para adultos'], ['100', '% gratis y sin anuncios']]
          .map(([n, t]) => `<div class="lp-cifra" data-revelar><strong data-contar="${n}">${n}</strong><span>${t}</span></div>`).join('')}
      </div>
    </section>

    <!-- MÓDULOS -->
    <section class="lp-seccion" id="lp-modulos">
      <div class="lp-ancho">
        <header class="lp-titular" data-revelar>
          <p class="lp-antetitulo">Adentro del sistema</p>
          <h2>Todo lo que encontrarás</h2>
          <p>Seis módulos pensados para aprender en casa y en el aula, con la misma claridad para niños y adultos.</p>
        </header>
        <div class="lp-modulos">
          ${MODULOS.map(([ico, t, d, c]) => `
            <article class="lp-modulo" data-revelar data-tono="${c}">
              <span class="lp-ico">${icono(ico, { tam: 22 })}</span><h3>${t}</h3><p>${d}</p>
            </article>`).join('')}
        </div>
      </div>
    </section>

    <!-- PILARES -->
    <section class="lp-seccion lp-alt" id="lp-pilares">
      <div class="lp-ancho">
        <header class="lp-titular" data-revelar>
          <p class="lp-antetitulo">Nuestra propuesta</p>
          <h2>Tres pilares para una sonrisa sana</h2>
        </header>
        <div class="lp-pilares">
          ${PILARES.map(([ico, t, d], k) => `
            <article class="lp-pilar" data-revelar>
              <div class="lp-pilar-cab"><span class="lp-ico lp-ico-grande">${icono(ico, { tam: 26 })}</span><span class="lp-num">0${k + 1}</span></div>
              <h3>${t}</h3><p>${d}</p>
            </article>`).join('')}
        </div>
      </div>
    </section>

    <!-- CÓMO FUNCIONA -->
    <section class="lp-seccion" id="lp-pasos">
      <div class="lp-ancho">
        <header class="lp-titular" data-revelar>
          <p class="lp-antetitulo">Así de fácil</p>
          <h2>¿Cómo funciona?</h2>
        </header>
        <ol class="lp-pasos">
          ${PASOS.map(([t, d], k) => `<li class="lp-paso" data-revelar><span class="lp-paso-num">${k + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}
        </ol>
      </div>
    </section>

    <!-- PARA QUIÉN -->
    <section class="lp-seccion lp-alt" id="lp-quienes">
      <div class="lp-ancho">
        <header class="lp-titular" data-revelar>
          <p class="lp-antetitulo">Para cada quien</p>
          <h2>Un espacio para toda la comunidad</h2>
        </header>
        <div class="lp-quienes">
          ${PUBLICOS.map(([ico, t, l]) => `<article class="lp-quien-tarjeta" data-revelar>
            <span class="lp-ico">${icono(ico, { tam: 22 })}</span><h3>${t}</h3>
            <ul>${l.map((x) => `<li>${icono('check', { tam: 16 })}${x}</li>`).join('')}</ul></article>`).join('')}
        </div>
      </div>
    </section>

    <!-- PERSONAJES -->
    <section class="lp-seccion">
      <div class="lp-ancho">
        <div class="lp-amigos" data-revelar>
          <div class="lp-amigos-fig">
            <img src="${SOFI.busto}" width="560" height="533" alt="Sofi, la doctora de las sonrisas, saludando" class="lp-amiga" loading="lazy">
            <img src="${DIENTIN.img}" width="${DIENTIN.ancho}" height="${DIENTIN.alto}" alt="Dientín, el diente amigo, con su cepillo" class="lp-amigo" loading="lazy">
          </div>
          <div>
            <p class="lp-antetitulo">Los personajes</p>
            <h2>Sofi y Dientín te acompañan</h2>
            <p><strong>Sofi</strong> es la doctora de las sonrisas: te guía por el sistema y te da consejos. <strong>Dientín</strong> es su diente amigo: protagoniza los juegos y los cuentos.</p>
            <p class="suave">Juntos enseñan que cuidar los dientes es fácil y divertido cuando lo hacemos en familia.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- LLAMADO FINAL -->
    <section class="lp-ancho">
      <div class="lp-final" data-revelar>
        <div>
          <h2>¿Listos para sonreír?</h2>
          <p>Entra como niña o niño, como familia o como docente.</p>
        </div>
        <a class="btn btn-grande lp-btn-blanco" href="${destino}">${s ? 'Ir a mi espacio' : 'Entrar ahora'} ${icono('flecha', { tam: 18 })}</a>
      </div>
    </section>

    <footer class="lp-pie">
      <div class="lp-ancho lp-pie-cols">
        <div><a class="marca marca-clara" href="#/"><img src="icons/icon.svg" alt="" width="38" height="38"><span><strong>Manos Grandes</strong><small>Dientes Chiquitos</small></span></a>
          <p>Promoción y prevención en salud bucal para la primera infancia.</p></div>
        <nav aria-label="Enlaces"><a href="#/entrar">Entrar</a><a href="#/privacidad">Privacidad</a></nav>
      </div>
      <p class="lp-ancho lp-legal">La información es educativa y no reemplaza la consulta con odontología.</p>
    </footer>
  </div>`;

  return animar(raiz);
}

/** Interacciones de la landing. Devuelve una función que las detiene. */
function animar(raiz) {
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const limpiezas = [];
  const escuchar = (obj, ev, fn, op) => { obj.addEventListener(ev, fn, op); limpiezas.push(() => obj.removeEventListener(ev, fn, op)); };

  // Desplazamiento suave a secciones (los botones no cambian la ruta).
  raiz.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => {
    raiz.querySelector(`#${b.dataset.ir}`).scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth' });
  }));

  // Cabecera sólida al bajar.
  const cabecera = raiz.querySelector('#lp-cabecera');
  const alDesplazar = () => cabecera.classList.toggle('solida', scrollY > 12);
  escuchar(window, 'scroll', alDesplazar, { passive: true });
  alDesplazar();

  // Saludo de Sofi: mueve la mano mientras habla.
  const sofi = raiz.querySelector('.lp-sofi');
  const globo = raiz.querySelector('#lp-globo');
  const hablando = (si) => { sofi.classList.toggle('hablando', si); globo.classList.toggle('hablando', si); };
  const termino = () => { if (!window.speechSynthesis?.speaking) hablando(false); };
  const decir = (texto) => { hablando(true); leer(texto, { velocidad: 0.95, tono: 1.3 }).then(termino); };
  raiz.querySelector('#lp-escuchar')?.addEventListener('click', (e) => { e.stopPropagation(); decir(SOFI.saludo); });
  limpiezas.push(saludarConVoz(SOFI.bienvenida, { alHablar: () => hablando(true), alTerminar: termino }));
  limpiezas.push(() => { detener(); });

  // Aparición al hacer scroll + contadores.
  const contar = (el) => {
    const fin = Number(el.dataset.contar);
    if (sinMovimiento) return;
    const inicio = performance.now();
    const paso = (t) => {
      const x = Math.min(1, (t - inicio) / 1200);
      el.textContent = Math.round(fin * (1 - (1 - x) ** 3));
      if (x < 1) requestAnimationFrame(paso);
    };
    el.textContent = '0';
    requestAnimationFrame(paso);
  };
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('visible');
      en.target.querySelectorAll('[data-contar]').forEach(contar);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  raiz.querySelectorAll('[data-revelar]').forEach((el) => {
    // Escalonar tarjetas hermanas.
    const hermanas = [...el.parentElement.children].filter((x) => x.hasAttribute('data-revelar'));
    el.style.setProperty('--d', `${Math.min(hermanas.indexOf(el), 5) * 0.07}s`);
    obs.observe(el);
  });
  limpiezas.push(() => obs.disconnect());

  return () => limpiezas.forEach((f) => f());
}
