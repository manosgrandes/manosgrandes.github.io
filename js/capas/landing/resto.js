// Escenas 4–6: Elige tu aventura (noche), Nuevo amanecer y Cierre.
// Contenido real del proyecto: juegos, cuentos y guías.

import { clamp, lerp, smooth, span, inercia } from './motor.js';
import { ICONOS_JUEGO, PORTADAS, COLOR_CUENTO } from './dibujos.js';
import { LISTA_JUEGOS } from '../../modulos/juegos/index.js';
import { JUEGOS } from '../../nucleo/store.js';
import { CUENTOS_BASE } from '../../modulos/cuentos/datos.js';
import { ARTICULOS } from '../../modulos/guias/datos.js';
import { sofiBusto } from '../../nucleo/sofi.js';
import { ESCENAS_EDAD } from './edades.js';
import { esc } from '../../nucleo/util.js';

const flecha = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Ideas por edad: resumen fiel de la guía "Higiene bucal según la edad" y afines.
const EDADES = [
  ['Antes del primer diente', '0 a 6 meses, aprox.', ['Limpia las encías una vez al día con una gasa o tela limpia humedecida en agua.', 'No pongas miel, azúcar ni otros endulzantes en el chupo o el biberón.'], 'higiene-por-edades', 'bebe'],
  ['Del primer diente a los 3 años', 'El adulto cepilla', ['Cepilla dos veces al día con un cepillo pequeño de cerdas suaves.', 'Crema dental con flúor del tamaño de un grano de arroz.', 'Primera visita al odontólogo cuando sale el primer diente o antes de cumplir el primer año.'], 'visita-odontologo', 'primer'],
  ['De 3 a 6 años', 'El niño cepilla, el adulto repasa', ['Crema dental con flúor del tamaño de una arveja.', 'Dos minutos, al menos dos veces al día. El de la noche es el más importante.', 'Escupir la espuma sin enjuagarse con mucha agua, para que el flúor siga protegiendo.'], 'higiene-por-edades', 'preescolar'],
  ['De 6 a 8 años y más', 'Acompañar hasta que tenga destreza', ['Acompaña y revisa el cepillado hasta que tenga buena destreza con las manos, más o menos cuando ya escribe con soltura.', 'Las primeras muelas permanentes salen detrás de las de leche: es fácil olvidarlas.', 'Hilo dental cuando los dientes se toquen, con ayuda del adulto.'], 'higiene-por-edades', 'escolar'],
  ['En casa, todos los días', 'Familias', ['Agua para calmar la sed. Los dulces, en las comidas principales y no entre comidas ni antes de dormir.', 'Cepíllense juntos frente al espejo: aprenden más por lo que ven.', 'Celebra los logros con abrazos o un plan especial, no con dulces.'], 'acompanamiento', 'casa'],
  ['En el aula', 'Docentes', ['Crea un aula con código en el panel docente: los niños entran con un apodo, sin datos personales.', 'Secuencia sugerida de 5 sesiones con cuentos y juegos del sitio.', 'Cepillado después de la merienda o el almuerzo, con supervisión.'], 'docentes-aula', 'aula'],
].filter(([, , , id]) => ARTICULOS.some((a) => a.id === id));

// Cierre: los tres lugares donde se cuida la sonrisa (resumen de las guías) y la promesa de cada niño.
const casita = `<svg viewBox="0 0 160 140"><path d="M20 70 L80 22 L140 70 Z" fill="#E9735F"/><rect x="32" y="66" width="96" height="70" rx="8" fill="#FFD9DF"/>
  <rect x="44" y="82" width="28" height="26" rx="5" fill="#C8EEFC" class="ventana"/><rect x="90" y="92" width="26" height="44" rx="6" fill="#B8A5ED"/>
  <circle cx="110" cy="114" r="2.5" fill="#fff"/><rect x="104" y="30" width="14" height="24" fill="#B98B6E"/></svg>`;
const jardin = `<svg viewBox="0 0 160 140"><rect x="24" y="48" width="112" height="88" rx="8" fill="#FFE7B0"/><path d="M16 52 L80 18 L144 52 Z" fill="#75BDF2"/>
  <circle cx="80" cy="40" r="9" fill="#fff"/><path d="M80 34 L80 40 L84 42" stroke="#26304F" stroke-width="2" fill="none" stroke-linecap="round"/>
  <rect x="36" y="64" width="24" height="22" rx="4" fill="#C8EEFC" class="ventana"/><rect x="68" y="64" width="24" height="22" rx="4" fill="#C8EEFC" class="ventana"/><rect x="100" y="64" width="24" height="22" rx="4" fill="#C8EEFC" class="ventana"/>
  <rect x="66" y="100" width="28" height="36" rx="6" fill="#F2B4CC"/><path d="M128 18 L128 48" stroke="#26304F" stroke-width="3"/><path class="bandera" d="M128 18 L150 24 L128 30 Z" fill="#91D9B5"/></svg>`;
const consultorio = `<svg viewBox="0 0 160 140"><rect x="28" y="40" width="104" height="96" rx="10" fill="#E2F8EC"/><rect x="28" y="40" width="104" height="16" rx="8" fill="#91D9B5"/>
  <g class="letrero"><circle cx="80" cy="24" r="20" fill="#fff" stroke="#91D9B5" stroke-width="4"/>
  <path d="M70 18 C70 10 78 10 80 14 C82 10 90 10 90 18 C90 26 87 28 86 34 C85 37 82 36 82 32 C82 36 79 37 78 34 C77 28 70 26 70 18 Z" fill="#75BDF2"/></g>
  <rect x="40" y="70" width="26" height="24" rx="4" fill="#C8EEFC" class="ventana"/><rect x="94" y="70" width="26" height="24" rx="4" fill="#C8EEFC" class="ventana"/>
  <rect x="66" y="102" width="28" height="34" rx="6" fill="#75BDF2"/><path d="M80 108 L80 122 M73 115 L87 115" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`;
const LUGARES = [
  ['l-casa', 'En casa', 'Cepíllense juntos frente al espejo, en la mañana y en la noche.', casita],
  ['l-jardin', 'En el jardín', 'Cepillado después de la merienda o el almuerzo, con un adulto.', jardin],
  ['l-consultorio', 'En el consultorio', 'La primera visita, cuando sale el primer diente o antes del primer año.', consultorio],
];
const PROMESAS = ['Me cepillo en la mañana y en la noche', 'Tomo agua cuando tengo sed', 'Dejo los dulces para las comidas', 'Visito al odontólogo'];

const ZONAS = ['Arriba a la derecha', 'Arriba a la izquierda', 'Abajo a la izquierda', 'Abajo a la derecha'];

export function markupResto({ destino, haySesion }) {
  const nJuegos = LISTA_JUEGOS.length;
  const flotan = (lista) => lista.map(([html, x, y, s, v]) => `<span class="flota" data-vel="${v}" style="left:${x}%;top:${y}%;width:${s}%">${html}</span>`).join('');

  return `
  <!-- ESCENA 4 · Elige tu aventura -->
  <section class="e4" id="aventura" aria-labelledby="e4-t">
    <div class="e4-estrellas" aria-hidden="true"></div>
    <header class="e4-cab">
      <p class="ante">Elige tu aventura</p>
      <h2 id="e4-t">¿Qué quieres hacer hoy?</h2>
    </header>
    <div class="e4-pila">
      <article class="tj tj-juegos" id="tj-juegos" data-k="0">
        <div class="tj-txt">
          <h3>Juegos</h3>
          <p class="tj-desc">Juegos cortos para aprender a cuidar la sonrisa mientras te diviertes. Entra como invitado y gana hasta tres estrellas en cada uno.</p>
          <a class="pildora brilla" href="#/app/juegos">Jugar ${flecha}</a>
        </div>
        <div class="tj-arte" aria-hidden="true">
          <div class="tj-sube"><div class="tj-video"><video src="video/ninos-diente.mp4" poster="video/ninos-diente.webp" width="880" height="522" muted loop playsinline preload="none" disablepictureinpicture></video></div></div>
          ${flotan([[ICONOS_JUEGO.cepillado, 0, 6, 15, 0.8], [ICONOS_JUEGO.alimentos, 21, 8, 15, 1], [ICONOS_JUEGO.memoria, 42, 5, 15, 0.9], [ICONOS_JUEGO.bacterias, 63, 8, 15, 0.7], [ICONOS_JUEGO.quiz, 84, 6, 15, 0.85]])}
        </div>
      </article>
      <article class="tj tj-cuentos" id="tj-cuentos" data-k="1">
        <div class="tj-txt">
          <h3>Cuentos</h3>
          <p>Historias ilustradas para leer juntos o escuchar en voz alta. Hay ${CUENTOS_BASE.length} cuentos y también puedes cargar tus propios libros.</p>
          <a class="pildora brilla" href="#/app/cuentos">Leer un cuento ${flecha}</a>
        </div>
        <div class="tj-arte" aria-hidden="true">
          <div class="tj-sube"><img class="tj-libro-img" src="img/libro-cuentos.webp" width="1038" height="560" alt="" decoding="async"></div>
          ${flotan([['<i class="estrella"></i>', 34, 8, 8, 2.6], ['<i class="estrella"></i>', 84, 14, 6, 1.4], ['<i class="estrella"></i>', 88, 86, 6, 2.2], ['<i class="luna"></i>', 4, 6, 12, 1.1]])}
        </div>
      </article>
      <article class="tj tj-guias" id="tj-guias" data-k="2">
        <div class="tj-txt">
          <h3>Padres y docentes</h3>
          <p class="tj-desc">Guías cortas para acompañar en casa y en el aula: cepillado según la edad, lonchera saludable, primera visita al odontólogo y actividades para clase.</p>
          <a class="pildora brilla" href="#/app/guias">Ver guías ${flecha}</a>
        </div>
        <div class="tj-arte" aria-hidden="true">
          <div class="tj-sube tj-sofi">${sofiBusto({ clase: 'tj-sofi-img' }).replace('role="img"', '').replace(/aria-label="[^"]*"/, '').replace('sofi-busto-cuerpo.webp', 'sofi-busto-cuerpo-limpio.webp')}</div>
        </div>
      </article>
    </div>
  </section>

  <!-- ESCENA 5 · Nuevo amanecer -->
  <section class="e5" id="amanecer" aria-label="Juegos, cuentos y guías">
    <div class="e5-bloque" id="juegos">
      <header class="e5-cab">
        <p class="ante">Juegos</p>
        <h2>Para jugar ya mismo</h2>
        <p>Entra con tu apodo o como invitado. No hace falta contraseña.</p>
      </header>
      <ul class="e5-juegos" role="list">
        ${LISTA_JUEGOS.map((j) => `<li><a class="jg" href="#/app/juegos/${esc(j.id)}">
          <span class="jg-ico">${ICONOS_JUEGO[j.id] || ICONOS_JUEGO.quiz}</span>
          <strong>${esc(JUEGOS[`juego:${j.id}`] || j.id)}</strong>
          <span class="jg-desc">${esc(j.desc)}</span>
          <span class="jg-edad">Desde ${esc(j.edad.replace('+', ''))} años</span></a></li>`).join('')}
      </ul>
    </div>

    <div class="e5-bloque" id="cuentos">
      <header class="e5-cab">
        <p class="ante">Cuentos</p>
        <h2>Para leer juntos</h2>
        <p>Toca un libro para abrirlo. Vuelve a tocarlo para leerlo o escucharlo.</p>
      </header>
      <ul class="e5-libros" role="list">
        ${CUENTOS_BASE.filter((c) => PORTADAS[c.id]).map((c) => {
          const [fondo, tinta] = COLOR_CUENTO[c.tema] || COLOR_CUENTO.otro;
          return `<li><a class="libro" href="#/app/cuentos/base/${esc(c.id)}" aria-expanded="false" aria-label="${esc(c.titulo)}: tocar para abrir el libro" style="--fondo:${fondo};--tinta-libro:${tinta}">
            <span class="libro-pagina"><strong>${esc(c.titulo)}</strong><span>${esc(c.resumen)}</span><small>${esc(c.edad)} · ${c.paginas.length} páginas</small><span class="libro-leer">Leer el cuento ${flecha}</span></span>
            <span class="libro-tapa" aria-hidden="true"><span class="libro-arte">${PORTADAS[c.id]}</span><span class="libro-titulo">${esc(c.titulo)}</span><span class="libro-lomo"></span><span class="libro-toca">Toca para abrir</span></span>
          </a></li>`;
        }).join('')}
      </ul>
    </div>

    <section class="ru" id="rutina" aria-labelledby="ru-t">
      <div class="ru-fijo">
        <div class="ru-txt">
          <p class="ante">Rutina de dos minutos</p>
          <h2 id="ru-t">Cuatro zonas, treinta segundos cada una</h2>
          <ol class="ru-zonas">${ZONAS.map((z, i) => `<li data-z="${i}"><span class="ru-punto" aria-hidden="true"></span>${z}<small>30 s</small></li>`).join('')}</ol>
          <p class="ru-nota">Al menos dos veces al día y siempre antes de dormir, con ayuda de un adulto hasta los 7 u 8 años, más o menos.</p>
          <a class="pildora pildora-clara" href="#/app/recordatorios">Temporizador y recordatorios ${flecha}</a>
        </div>
        <div class="ru-reloj" aria-hidden="true">
          <svg viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="190" fill="#fff"/>
            <circle cx="200" cy="200" r="176" fill="none" stroke="#F4EFFA" stroke-width="16"/>
            <circle class="ru-aro" cx="200" cy="200" r="176" fill="none" stroke="#91D9B5" stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 200 200)"/>
            <path d="M84 200 C84 120 140 92 200 92 C260 92 316 120 316 200 C316 280 260 308 200 308 C140 308 84 280 84 200 Z" fill="#FFB3A7"/>
            ${[[1, -1], [-1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => {
              const dientes = [0, 1, 2].map((k) => {
                const x = 200 + sx * (24 + k * 30);
                const y = 200 + sy * (44 - k * 6);
                return `<rect x="${x - 13}" y="${sy < 0 ? y - 34 : y}" width="26" height="34" rx="10"/>`;
              }).join('');
              return `<g class="ru-zona" data-z="${i}"><g fill="#F3E3C8">${dientes}</g><g class="ru-limpio" fill="#fff">${dientes}</g>
                <g class="ru-brillo" fill="#fff"><circle cx="${200 + sx * 95}" cy="${200 + sy * 70}" r="6"/><circle cx="${200 + sx * 70}" cy="${200 + sy * 84}" r="4"/></g></g>`;
            }).join('')}
            <rect x="194" y="96" width="12" height="208" rx="6" fill="#F28C9C" opacity=".35"/>
            <g class="ru-aguja"><rect x="196" y="40" width="8" height="160" rx="4" fill="#26304F"/><circle cx="200" cy="200" r="12" fill="#26304F"/></g>
          </svg>
          <p class="ru-tiempo"><span class="ru-seg">0:00</span> / 2:00</p>
        </div>
      </div>
    </section>

    <div class="bandas" aria-hidden="true">
      <div class="banda banda-1"><span>${'Manos grandes · '.repeat(8)}</span></div>
      <div class="banda banda-2"><span>${'Dientes chiquitos · '.repeat(8)}</span></div>
    </div>

    <div class="e5-bloque" id="familias">
      <header class="e5-cab">
        <p class="ante">Padres y docentes</p>
        <h2>Manos que acompañan</h2>
        <p>Ideas según la edad, tomadas de nuestras guías.</p>
      </header>
      <div class="acord-wrap">
        <div class="acordeones">
          ${EDADES.map(([t, sub, items, id, escena], i) => `<details class="acordeon" name="edades" data-e="${escena}">
            <summary><span><strong>${t}</strong><small>${sub}</small></span><i aria-hidden="true"></i></summary>
            <ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul>
            <a href="#/app/guias/${id}">Leer la guía completa ${flecha}</a>
          </details>`).join('')}
        </div>
        <div class="acord-escena" aria-hidden="true">
          <div class="ae" data-e="inicio">${ESCENAS_EDAD.inicio}</div>
          ${EDADES.map(([t, sub, , , escena]) => `<div class="ae" data-e="${escena}">${ESCENAS_EDAD[escena]}<span class="ae-chip"><strong>${t}</strong>${sub}</span></div>`).join('')}
        </div>
      </div>
      <p class="aviso-salud">Información educativa. No reemplaza la consulta con odontología.</p>
    </div>
  </section>

  <!-- ESCENA 6 · Cierre: los lugares que cuidan la sonrisa y la promesa de cada niño -->
  <section class="e6" id="cierre" aria-labelledby="e6-t">
    <div class="e6-in">
      <h2 id="e6-t">Cuidar una sonrisa es cosa de todos</h2>
      <div class="e6-pueblo">
        <svg class="e6-arco" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
          ${['#F2B4CC', '#FFD98A', '#91D9B5', '#75BDF2', '#B8A5ED'].map((c, i) => `<path pathLength="1" d="M${60 + i * 26} 300 A${440 - i * 26} ${270 - i * 22} 0 0 1 ${940 - i * 26} 300" fill="none" stroke="${c}" stroke-width="22" stroke-linecap="round"/>`).join('')}
        </svg>
        <ul class="e6-lugares" role="list">
          ${LUGARES.map(([clase, titulo, texto, dibujo], i) => `<li class="lugar ${clase}" style="--i:${i}">
            <div class="lugar-dibujo" aria-hidden="true">${dibujo}</div>
            <h3>${titulo}</h3>
            <p>${texto}</p>
          </li>`).join('')}
        </ul>
      </div>
      <form class="promesa" aria-labelledby="pr-t" onsubmit="return false">
        <div class="promesa-cara" aria-hidden="true">
          <svg viewBox="0 0 200 200">
            <g class="pc-rayos">${Array.from({ length: 10 }, (_, i) => `<rect x="94" y="2" width="12" height="26" rx="6" fill="#FFD98A" transform="rotate(${i * 36} 100 100)"/>`).join('')}</g>
            <circle cx="100" cy="100" r="70" fill="#FFE7B0"/><circle cx="100" cy="100" r="60" fill="#FFF3D6"/>
            <g class="pc-ojos"><ellipse cx="78" cy="92" rx="7" ry="9" fill="#26304F"/><ellipse cx="122" cy="92" rx="7" ry="9" fill="#26304F"/><circle cx="80" cy="88" r="2.6" fill="#fff"/><circle cx="124" cy="88" r="2.6" fill="#fff"/></g>
            <g class="pc-felices"><path d="M70 94 Q78 84 86 94" stroke="#26304F" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M114 94 Q122 84 130 94" stroke="#26304F" stroke-width="5" fill="none" stroke-linecap="round"/></g>
            <g class="pc-cachetes"><ellipse cx="66" cy="112" rx="9" ry="6" fill="#F59A9A"/><ellipse cx="134" cy="112" rx="9" ry="6" fill="#F59A9A"/></g>
            <path class="pc-boca" d="M88 114 Q100 116 112 114 Q100 124 88 114 Z" fill="#9E3650"/>
          </svg>
          </svg>
        </div>
        <div class="promesa-txt">
          <h3 id="pr-t">Mi promesa de sonrisa</h3>
          <p>Marca lo que ya haces. Cada cosa hace sonreír más al sol.</p>
          <div class="promesa-lista">
            ${PROMESAS.map((t, i) => `<label class="promesa-item"><input type="checkbox" name="promesa" value="${i}"><span class="caja" aria-hidden="true"></span><span>${t}</span></label>`).join('')}
          </div>
          <p class="promesa-cuenta" aria-live="polite">0 de ${PROMESAS.length}</p>
          <a class="pildora brilla" href="${destino}">${haySesion ? 'Ir a mi espacio' : 'Empezar ahora'} ${flecha}</a>
        </div>
      </form>
    </div>
  </section>

  <footer class="pie">
    <div class="pie-in">
      <a class="marca marca-clara" href="#/"><img src="icons/icon.svg" alt="" width="32" height="32"><span><strong>Manos Grandes</strong><small>Dientes Chiquitos</small></span></a>
      <p class="pie-legal">Información educativa: no reemplaza la consulta con odontología.</p>
      <div class="pie-der"><span class="pie-credito">Desarrollado por <strong>The R</strong></span><nav aria-label="Enlaces del pie"><a href="#/privacidad">Privacidad</a></nav></div>
    </div>
  </footer>`;
}

/** Controladores de las escenas 4–6. Devuelve funciones que dibujan según el progreso. */
export function crearResto(raiz) {
  const $ = (s) => raiz.querySelector(s);
  const vh = () => window.innerHeight;

  // ---------- Escena 4: tarjetas apiladas
  const tarjetas = [...raiz.querySelectorAll('.tj')];
  const flotantes = tarjetas.map((t) => ({ sube: t.querySelector('.tj-sube'), flotan: [...t.querySelectorAll('.flota')].map((el) => ({ el, v: Number(el.dataset.vel) })) }));
  function dibujarTarjetas() {
    const alto = vh();
    tarjetas.forEach((t, i) => {
      const r = t.getBoundingClientRect();
      // Cuánto la cubre la siguiente
      const sig = tarjetas[i + 1];
      let cubierta = 0;
      if (sig) {
        const rs = sig.getBoundingClientRect();
        cubierta = clamp(1 - (rs.top - r.top) / Math.max(1, alto * 0.9));
      }
      const giro = (i % 2 ? 2.5 : -2.5) * cubierta;
      t.style.transform = `scale(${1 - 0.14 * cubierta}) rotate(${giro}deg)`;
      t.style.setProperty('--sombra', cubierta.toFixed(3));
      // Dentro: la ilustración sube y los objetos flotan a velocidades distintas
      const entra = clamp(1 - (r.top - alto * 0.1) / (alto * 0.9));
      const f = flotantes[i];
      f.sube.style.transform = `translate3d(0,${(1 - entra) * 30}%,0)`;
      f.flotan.forEach(({ el, v }) => { el.style.transform = `translate3d(0,${(1 - entra) * v * 40 - cubierta * v * 20}px,0)`; });
    });
  }

  // ---------- Escena 5: juegos con inclinación 3D, libros que se abren y reloj de 2 minutos
  const fino = matchMedia('(pointer: fine)').matches;
  const limpiar = [];
  if (fino) {
    raiz.querySelectorAll('.jg').forEach((a) => {
      const mover = (e) => {
        const r = a.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        a.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(0)`;
      };
      const salir = () => { a.style.transform = ''; };
      a.addEventListener('pointermove', mover);
      a.addEventListener('pointerleave', salir);
      limpiar.push(() => { a.removeEventListener('pointermove', mover); a.removeEventListener('pointerleave', salir); });
    });
  }
  // Los libros se abren al tocarlos (ver conectarComunes en landing.js).
  function dibujarLibros() {}

  const ru = $('.ru');
  const zonas = [...raiz.querySelectorAll('.ru-zona')].map((z) => ({ limpio: z.querySelector('.ru-limpio'), brillo: z.querySelector('.ru-brillo') }));
  const items = [...raiz.querySelectorAll('.ru-zonas li')];
  const aguja = $('.ru-aguja');
  const aro = $('.ru-aro');
  const seg = $('.ru-seg');
  function dibujarRutina(p) {
    const t = smooth(0.08, 0.92, p);
    zonas.forEach((z, i) => {
      const k = span(i / 4, (i + 1) / 4, t);
      z.limpio.style.clipPath = `inset(0 0 ${(1 - k) * 100}% 0)`;
      z.brillo.style.opacity = k >= 1 ? 1 : 0;
      items[i].classList.toggle('activa', k > 0 && k < 1);
      items[i].classList.toggle('lista', k >= 1);
    });
    aguja.style.transform = `rotate(${t * 360}deg)`;
    aro.setAttribute('stroke-dasharray', `${(t * 100).toFixed(2)} 100`);
    const s = Math.round(t * 120);
    seg.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  // Bandas de texto: la velocidad del scroll las acelera e inclina
  const bandas = [...raiz.querySelectorAll('.banda span')];
  let desfase = 0;
  let inclina = 0;
  function dibujarBandas(vel, delta) {
    desfase += (0.04 + Math.min(Math.abs(vel), 8) * 0.25) * delta * 0.06;
    inclina += (clamp(vel * 1.2, -10, 10) - inclina) * inercia(delta);
    bandas.forEach((b, i) => {
      const ancho = b.scrollWidth / 8;
      const x = -(desfase % ancho);
      b.style.transform = `translate3d(${i ? -ancho - x : x}px,0,0) skewX(${(i ? 1 : -1) * inclina}deg)`;
    });
  }

  // ---------- Escena 6: el arcoíris se dibuja, los lugares suben y la promesa hace sonreír al sol
  const e6 = $('.e6');
  const arcos = [...raiz.querySelectorAll('.e6-arco path')];
  const lugares = [...raiz.querySelectorAll('.lugar')];
  const promesa = $('.promesa');
  function dibujarCierre() {
    const r = e6.getBoundingClientRect();
    const k = clamp(1 - (r.top - vh() * 0.15) / (vh() * 0.75));
    arcos.forEach((a, i) => { a.style.strokeDashoffset = (1 - smooth(i * 0.08, 0.6 + i * 0.08, k)).toFixed(3); });
    lugares.forEach((l, i) => {
      const t = smooth(0.15 + i * 0.12, 0.55 + i * 0.12, k);
      l.style.opacity = t;
      l.style.transform = `translate3d(0,${(1 - t) * 60}px,0) scale(${lerp(0.9, 1, t)})`;
    });
  }
  const boca = promesa.querySelector('.pc-boca');
  const cuenta = promesa.querySelector('.promesa-cuenta');
  const cajas = [...promesa.querySelectorAll('input')];
  const alMarcar = () => {
    const n = cajas.filter((c) => c.checked).length;
    const total = cajas.length;
    const ancho = 12 + n * 2.5;
    boca.setAttribute('d', `M${100 - ancho} 114 Q100 ${116 - n} ${100 + ancho} 114 Q100 ${124 + n * 5} ${100 - ancho} 114 Z`);
    promesa.style.setProperty('--feliz', (n / total).toFixed(2));
    promesa.classList.toggle('completa', n === total);
    cuenta.textContent = n === total ? '¡Promesa completa! Tu sonrisa brilla.' : `${n} de ${total}`;
  };
  promesa.addEventListener('change', alMarcar);
  limpiar.push(() => promesa.removeEventListener('change', alMarcar));

  return {
    dibujarTarjetas, dibujarLibros, dibujarRutina, dibujarBandas, dibujarCierre,
    secciones: { e4: $('.e4'), e5: $('.e5'), ru, e6, bandas: $('.bandas') },
    destruir() { limpiar.forEach((f) => f()); },
  };
}
