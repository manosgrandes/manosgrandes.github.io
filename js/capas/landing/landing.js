// Capa 1 — Landing: «Manos grandes, dientes chiquitos». Una sola historia continua en la que
// el scroll mueve la cámara: Villa Sonrisa → dentro de la sonrisa → el día de Dientín →
// elige tu aventura → nuevo amanecer → cierre. Desde aquí se pasa al login y al sistema.
//
// Con «reducir movimiento» (o si no cargan las librerías) se muestra como página normal.

import { sesion } from '../../nucleo/sesion.js';
import { esc } from '../../nucleo/util.js';
import { darVida } from '../../nucleo/sofi.js';
import { clamp, span, smooth, lerp, inercia, cargarLibrerias, iniciarScroll, lienzo } from './motor.js';
import { crearCiudad } from './ciudad.js';
import { crearTunel } from './tunel.js';
import { markupRecorrido, crearRecorrido } from './recorrido.js';
import { markupResto, crearResto } from './resto.js';

const FRASES = ['¿Qué hace feliz a un diente?', 'Cepillarse', 'Comer saludable', 'Tomar agua', 'Visitar al dentista'];

function markup() {
  const s = sesion.actual();
  const id = sesion.identidad();
  const destino = s ? '#/app' : '#/entrar';
  const resto = markupResto({ destino, haySesion: Boolean(s) });
  const corte = resto.indexOf('<footer');
  return `
  <div class="lp3" id="lp3">
    <a class="saltar" href="#contenido" id="lp-saltar">Saltar al contenido</a>
    <div class="telon" aria-hidden="true"></div>
    <header class="cab">
      <a class="marca cab-marca" href="#/" id="lp-inicio" aria-label="Manos Grandes Dientes Chiquitos, volver al inicio">
        <span class="cab-diente"><img src="img/dientin.webp" alt="" width="600" height="545"></span>
        <span><strong>Manos Grandes</strong><small>Dientes Chiquitos</small></span>
      </a>
      <nav class="cab-nav" aria-label="Secciones">
        <a href="#/app/juegos" data-ir="tj-juegos" style="--c:#FFD98A">Juegos</a><a href="#/app/cuentos" data-ir="tj-cuentos" style="--c:#A8E3C6">Cuentos</a><a href="#/app/guias" data-ir="tj-guias" style="--c:#F7C6D9">Padres y docentes</a>
      </nav>
      <a class="pildora brilla cab-entrar" href="${destino}">${s ? `Mi espacio <span class="cab-quien">${esc(id.nombre)}</span>` : 'Entrar'}</a>
    </header>

    <main id="contenido" tabindex="-1">
      <!-- ESCENAS 1 y 2 · Villa Sonrisa y dentro de la sonrisa -->
      <section class="e1" id="inicio" aria-labelledby="lp-h1">
        <div class="e1-fijo">
          <canvas class="e1-ciudad" aria-hidden="true"></canvas>
          <div class="e1-portal">
            <canvas class="e1-tunel" aria-hidden="true"></canvas>
            <div class="e1-frases">
              <h2 class="frase">${FRASES[0]}</h2>
              <ul class="frases-lista" role="list">${FRASES.slice(1).map((f) => `<li class="frase">${f}</li>`).join('')}</ul>
            </div>
          </div>
          <div class="e1-destello" aria-hidden="true"><i class="e1-rayos"></i><i class="e1-luz"></i></div>
          <div class="e1-hero">
            <h1 id="lp-h1"><span class="linea l1"><span class="linea-in">Manos grandes,</span></span> <span class="linea l2"><span class="linea-in">dientes chiquitos</span></span></h1>
            <div class="e1-pie">
              <p class="e1-sub">Un lugar para aprender a cuidar los dientes en familia, con juegos, cuentos y guías.</p>
              <div class="acciones">
                <a class="pildora brilla" href="#/app/juegos">Jugar ahora</a>
              </div>
            </div>
          </div>
          <button type="button" class="e1-baja" id="lp-baja"><span class="e1-baja-raton" aria-hidden="true"><i></i></span><span>Baja para entrar</span><span class="e1-baja-flechas" aria-hidden="true"><b></b><b></b></span></button>
        </div>
      </section>

      <!-- ESCENA 3 · El recorrido -->
      ${markupRecorrido()}

      ${resto.slice(0, corte)}
    </main>
    ${resto.slice(corte)}
  </div>`;
}

export async function render(raiz) {
  raiz.innerHTML = markup();
  const lp = raiz.querySelector('.lp3');
  const limpiezas = [];
  const comunes = conectarComunes(lp);
  limpiezas.push(comunes);

  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (quieto) return terminar(limpiezas, montarQuieto(lp));
  lp.classList.add('cargando');
  let libs;
  try {
    libs = await cargarLibrerias();
  } catch (e) {
    console.warn('Landing sin animación (no cargaron las librerías):', e);
    lp.classList.remove('cargando');
    return terminar(limpiezas, montarQuieto(lp));
  }
  if (!lp.isConnected) return terminar(limpiezas, () => {});
  lp.classList.remove('cargando');
  return terminar(limpiezas, montarVivo(lp, libs, comunes.nav));
}

function terminar(limpiezas, otra) {
  limpiezas.push(otra);
  return () => limpiezas.forEach((f) => { try { f(); } catch { /* ya desmontado */ } });
}

/**
 * Lo que funciona igual con y sin movimiento: saltar al contenido, personajes que parpadean,
 * el logo que vuelve al inicio, la navegación a las tarjetas y «Baja para entrar».
 * `ir(y)` se cambia por el desplazamiento suave de Lenis cuando la animación está activa.
 */
function conectarComunes(lp) {
  const nav = { ir: (y) => scrollTo({ top: y, behavior: 'smooth' }), tarjeta: null };
  const saltar = lp.querySelector('#lp-saltar');
  const main = lp.querySelector('#contenido');
  const alClic = (e) => {
    if (e.target.closest('#lp-saltar')) { e.preventDefault(); main.focus(); return; }
    if (e.target.closest('#lp-inicio')) { e.preventDefault(); nav.ir(0); return; }
    if (e.target.closest('#lp-baja')) { nav.ir(innerHeight * 1.4); return; }
    // Libros: llegan cerrados. El primer toque abre uno; con el libro abierto, el siguiente lleva al cuento.
    const libro = e.target.closest('.libro');
    if (libro && !libro.classList.contains('abierto')) {
      e.preventDefault();
      lp.querySelectorAll('.libro').forEach((o) => { o.classList.toggle('abierto', o === libro); o.setAttribute('aria-expanded', String(o === libro)); });
      libro.setAttribute('aria-label', `${libro.querySelector('.libro-pagina strong').textContent}: leer el cuento`);
      return;
    }
    const destino = e.target.closest('[data-ir]');
    if (destino) {
      const tj = lp.querySelector(`#${destino.dataset.ir}`);
      if (!tj) return;
      e.preventDefault();
      nav.ir(nav.tarjeta ? nav.tarjeta(tj) : tj.getBoundingClientRect().top + scrollY - 90);
    }
  };
  lp.addEventListener('click', alClic);
  const pararVida = darVida(lp);
  // El video de la tarjeta de juegos solo corre mientras se ve (y nunca con «reducir movimiento»).
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videos = new IntersectionObserver((entradas) => entradas.forEach(({ target, isIntersecting }) => {
    if (isIntersecting && !quieto) target.play().catch(() => {}); else target.pause();
  }), { threshold: 0.25 });
  lp.querySelectorAll('video').forEach((v) => videos.observe(v));
  return Object.assign(() => {
    lp.removeEventListener('click', alClic);
    pararVida?.();
    videos.disconnect();
  }, { nav });
}

/** Movimiento reducido: página normal, sin canvas animado ni secciones largas. */
function montarQuieto(lp) {
  lp.classList.add('quieto');
  const c = lp.querySelector('.e1-ciudad');
  const lz = lienzo(c);
  const ciudad = crearCiudad(lz, { movil: innerWidth < 700 });
  const pintar = () => { lz.ajustar(); ciudad.dibujar(0.1, { intro: 1, mx: 0, my: 0 }); };
  pintar();
  const seg = lp.querySelector('.ru-seg');
  if (seg) seg.textContent = '2:00';
  addEventListener('resize', pintar);
  return () => removeEventListener('resize', pintar);
}

/** El recorrido completo con scroll suave, escenas fijadas con sticky y un ticker por escena. */
function montarVivo(lp, libs, nav) {
  const { gsap, ScrollTrigger, SplitText } = libs;
  const movil = innerWidth < 700;
  const scroll = iniciarScroll(libs);
  const { lenis } = scroll;
  const tickers = [];
  const quitar = [];
  const escuchar = (obj, ev, fn, op) => { obj.addEventListener(ev, fn, op); quitar.push(() => obj.removeEventListener(ev, fn, op)); };
  const $ = (s) => lp.querySelector(s);

  let recorrido;
  let resto;
  const ctx = gsap.context(() => {
    /** ScrollTrigger solo entrega el progreso (0–1) y la visibilidad. */
    const escena = (sec) => {
      const st = { p: 0, vis: false };
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { st.p = s.progress; }, onRefresh: (s) => { st.p = s.progress; } });
      ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => { st.vis = s.isActive; }, onRefresh: (s) => { st.vis = s.isActive; } });
      return st;
    };
    const ticker = (fn) => { gsap.ticker.add(fn); tickers.push(fn); };

    // ---------- Escenas 1 y 2
    const e1 = $('.e1');
    const s1 = escena(e1);
    const cCiudad = $('.e1-ciudad');
    const cTunel = $('.e1-tunel');
    const lzC = lienzo(cCiudad);
    const lzT = lienzo(cTunel);
    const ciudad = crearCiudad(lzC, { movil });
    const tunel = crearTunel(lzT);
    const portal = $('.e1-portal');
    const destello = $('.e1-destello');
    let ultimoHueco = null;
    const l1 = $('.l1');
    const l2 = $('.l2');
    const lineasIn = [...lp.querySelectorAll('.linea-in')];
    const pie = $('.e1-pie');
    const baja = $('.e1-baja');
    const frases = [...lp.querySelectorAll('.frase')];
    const inicio = performance.now();
    const raton = { x: 0, y: 0, mx: 0, my: 0 };
    if (matchMedia('(pointer: fine)').matches) {
      escuchar(window, 'pointermove', (e) => { raton.x = (e.clientX / innerWidth) * 2 - 1; raton.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    }
    let ciudadVisible = true;
    ticker((t, delta) => {
      if (!s1.vis) return;
      const P = s1.p;
      const ahora = performance.now();
      const intro = 1 - (1 - clamp((ahora - inicio) / 2000)) ** 3;
      raton.mx += (raton.x - raton.mx) * inercia(delta);
      raton.my += (raton.y - raton.my) * inercia(delta);
      const p = span(0, 0.5, P);
      let hueco = null;
      if (ciudadVisible) {
        lzC.medir(delta);
        hueco = ciudad.dibujar(p, { intro, mx: raton.mx, my: raton.my });
      }
      // Cuando el diente queda reparado sale un destello: crece desde el diente, cubre la pantalla
      // y, mientras brilla, el túnel se abre en un círculo desde ese mismo punto.
      if (hueco) ultimoHueco = hueco;
      const diag = Math.hypot(lzC.w, lzC.h);
      const k = span(0.8, 0.93, p);
      const abierto = P > 0.5 || k >= 1;
      const centro = ultimoHueco || { x: lzC.w / 2, y: lzC.h / 2 };
      if (k > 0 && k < 1) {
        const pico = Math.sin(Math.PI * Math.min(1, k * 1.15));
        destello.style.setProperty('--x', `${centro.x.toFixed(1)}px`);
        destello.style.setProperty('--y', `${centro.y.toFixed(1)}px`);
        destello.style.setProperty('--s', (0.15 + k * 2.6).toFixed(3));
        destello.style.setProperty('--g', `${(k * 160).toFixed(1)}deg`);
        destello.style.opacity = pico.toFixed(3);
        destello.style.visibility = 'visible';
      } else {
        destello.style.visibility = 'hidden';
      }
      if (abierto) {
        portal.style.clipPath = 'none';
        portal.style.visibility = 'visible';
      } else if (k > 0.25) {
        const r = diag * ((k - 0.25) / 0.75) ** 2;
        portal.style.clipPath = `circle(${r.toFixed(1)}px at ${centro.x.toFixed(1)}px ${centro.y.toFixed(1)}px)`;
        portal.style.visibility = 'visible';
      } else {
        portal.style.visibility = 'hidden';
      }
      if (abierto === ciudadVisible) { ciudadVisible = !abierto; cCiudad.style.visibility = ciudadVisible ? 'visible' : 'hidden'; }
      const dentro = span(0.47, 0.85, P);
      if (portal.style.visibility === 'visible') {
        lzT.medir(delta);
        tunel.dibujar(dentro, t * 1000);
      }
      // Titular: las líneas suben desde la máscara y luego se abren como puertas.
      lineasIn.forEach((el, i) => {
        const k = 1 - (1 - clamp((ahora - inicio - 250 - i * 160) / 900)) ** 3;
        el.style.transform = `translate3d(0,${(1 - k) * 110}%,0)`;
      });
      const puerta = smooth(0.008, 0.17, P);
      const fuera = 1 - smooth(0.12, 0.2, P);
      l1.style.transform = `translate3d(${-42 * puerta}vw,0,0) scale(${1 + 0.5 * puerta})`;
      l2.style.transform = `translate3d(${42 * puerta}vw,0,0) scale(${1 + 0.5 * puerta})`;
      l1.style.opacity = fuera;
      l2.style.opacity = fuera;
      const pieK = smooth(0, 0.045, P);
      const pieIntro = clamp((ahora - inicio - 900) / 700);
      pie.style.opacity = (1 - pieK) * pieIntro;
      pie.style.transform = `translate3d(0,${pieK * -30 + (1 - pieIntro) * 20}px,0)`;
      pie.style.visibility = pieK >= 1 ? 'hidden' : 'visible';
      baja.style.opacity = (1 - smooth(0, 0.02, P)) * pieIntro;
      // Dentro de la sonrisa: textos que entran girando en X y salen hacia la cámara.
      frases.forEach((f, i) => {
        const a = i * 0.2;
        const ent = smooth(a, a + 0.08, dentro);
        const sal = i === frases.length - 1 ? 0 : smooth(a + 0.14, a + 0.21, dentro);
        f.style.transform = `translate(-50%,-50%) rotateX(${-70 * (1 - ent)}deg) scale(${lerp(0.8, 1, ent) + sal * 1.8})`;
        f.style.opacity = dentro <= 0 ? 0 : ent * (1 - sal);
      });
    });

    // ---------- Escena 3
    const e3 = $('.e3');
    const s3 = escena(e3);
    recorrido = crearRecorrido(e3, { SplitText });
    ticker((t, delta) => {
      if (!s3.vis) return;
      const top = e3.getBoundingClientRect().top;
      recorrido.curvatura(top / innerHeight);
      recorrido.dibujar(s3.p, delta);
    });

    // ---------- Escenas 4–6
    resto = crearResto(lp);
    const { e4, e5, ru, e6, bandas } = resto.secciones;
    const s4 = escena(e4);
    const s5 = escena(e5);
    const sRu = escena(ru);
    const s6 = escena(e6);
    const sB = escena(bandas);
    ticker((t, delta) => {
      if (s4.vis) resto.dibujarTarjetas();
      if (s5.vis) resto.dibujarLibros();
      if (sRu.vis) resto.dibujarRutina(sRu.p);
      if (sB.vis) resto.dibujarBandas(lenis.velocity, delta);
      if (s6.vis) resto.dibujarCierre();
    });

    // Medidas: al cambiar el tamaño, ScrollTrigger refresca y los lienzos se ajustan.
    const alRefrescar = () => { lzC.ajustar(); lzT.ajustar(); recorrido.medir(); };
    ScrollTrigger.addEventListener('refresh', alRefrescar);
    quitar.push(() => ScrollTrigger.removeEventListener('refresh', alRefrescar));
    // Si llegan imágenes que cambian el alto, refrescar.
    lp.querySelectorAll('img[loading="lazy"]').forEach((img) => { if (!img.complete) escuchar(img, 'load', () => ScrollTrigger.refresh(), { once: true }); });
    // Los acordeones cambian el alto de la página.
    lp.querySelectorAll('details').forEach((d) => escuchar(d, 'toggle', () => ScrollTrigger.refresh()));
  }, lp);

  // Teclado: si el foco cae en algo que el recorrido escondió, llevar la cámara hasta allí.
  // Se aplaza para que no lo anule el desplazamiento nativo que hace el navegador al enfocar.
  const irA = (y) => setTimeout(() => lenis.scrollTo(y, { duration: 0.9, force: true }), 60);
  const absTop = (el) => el.getBoundingClientRect().top + scrollY;
  // Posición de scroll en la que una tarjeta de la pila queda arriba y visible.
  const yTarjeta = (tj) => {
    const pila = tj.parentElement;
    const primera = pila.firstElementChild;
    const paso = primera.offsetHeight + parseFloat(getComputedStyle(primera).marginBottom);
    return absTop(pila) + Number(tj.dataset.k) * paso - innerHeight * 0.09;
  };
  nav.tarjeta = yTarjeta;
  // Saltos cortos: desplazamiento suave. Saltos largos (cruzarían varias escenas de golpe):
  // un telón claro se funde, la página salta sin animación y el telón se desvanece.
  const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  let enTelon = false;
  nav.ir = (y) => {
    if (Math.abs(y - scrollY) < innerHeight * 2.5) {
      lenis.scrollTo(y, { duration: 1.2, easing: suave, force: true });
      return;
    }
    if (enTelon) return;
    enTelon = true;
    lp.classList.add('telon-on');
    setTimeout(() => {
      lenis.scrollTo(y, { immediate: true, force: true });
      ScrollTrigger.update();
      setTimeout(() => { lp.classList.remove('telon-on'); enTelon = false; }, 120);
    }, 380);
  };
  escuchar(lp, 'focusin', (e) => {
    const el = e.target;
    if (el.closest('.e1-hero') && scrollY > innerHeight * 0.1) irA(0);
    const tj = el.closest('.tj');
    if (tj) irA(yTarjeta(tj));
  });

  return () => {
    tickers.forEach((fn) => gsap.ticker.remove(fn));
    quitar.forEach((f) => f());
    recorrido?.destruir();
    resto?.destruir();
    ctx.revert();
    scroll.destruir();
  };
}
