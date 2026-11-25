// Capa 2 — Login: puerta entre la landing y el sistema.
//   · Niña o niño: elige o crea su perfil (apodo + avatar, sin contraseña).
//   · Docente o familia: correo y contraseña (nube) o entrada local con nombre y rol.
//   · Invitado: explora sin guardar progreso.

import { perfiles, progreso, AVATARES } from '../../nucleo/store.js';
import { sesion } from '../../nucleo/sesion.js';
import { nubeActiva } from '../../config.js';
import { esc, aviso, $ } from '../../nucleo/util.js';
import { leer, detener } from '../../nucleo/speech.js';
import { icono } from '../../nucleo/iconos.js';
import { iniciarFondo } from './fondo.js';
import { temaGuardado, botonTema, conectarTema } from '../../nucleo/tema.js';

// «¿Sabías que…?»: datos tomados de las guías del sitio, cada uno con un dibujo animado.
const SABIAS = [
  [`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#2E2A5C"/><path class="d-luna" d="M38 16 A16 16 0 1 0 48 40 A12 12 0 1 1 38 16 Z" fill="#FFD98A"/><circle class="d-titila" cx="18" cy="20" r="2" fill="#fff"/><circle class="d-titila d-tarde" cx="22" cy="44" r="1.6" fill="#fff"/></svg>`,
    'El cepillado de la <b>noche</b> es el más importante del día.'],
  [`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#E2F8EC"/><rect x="8" y="34" width="40" height="8" rx="4" fill="#75BDF2"/><rect x="36" y="26" width="20" height="10" rx="3" fill="#fff" stroke="#75BDF2" stroke-width="2"/><circle class="d-late" cx="46" cy="22" r="5" fill="#7FCBA4"/></svg>`,
    'De 3 a 6 años, la crema dental con flúor va del tamaño de una <b>arveja</b>.'],
  [`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#E2F5FD"/><g class="d-sube"><circle cx="26" cy="38" r="5" fill="#fff"/><circle cx="36" cy="32" r="4" fill="#fff"/><circle cx="30" cy="26" r="3" fill="#fff"/></g><path d="M18 46 Q32 54 46 46" stroke="#75BDF2" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`,
    'Escupe la espuma <b>sin enjuagarte</b> con mucha agua: así el flúor sigue protegiendo.'],
  [`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#FFF1CF"/><path d="M22 18 L42 18 L39 48 C39 51 25 51 25 48 Z" fill="#fff" stroke="#9ED3F7" stroke-width="3"/><path class="d-ola" d="M24 30 L40 30 L38 46 C38 48 26 48 26 46 Z" fill="#9ED3F7"/></svg>`,
    'Para calmar la sed, lo mejor es el <b>agua</b>.'],
  [`<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#FFE8EA"/><g class="d-salta"><path d="M22 24 C22 16 30 16 32 20 C34 16 42 16 42 24 C42 32 39 36 38 44 C37 48 34 47 33 42 C32 47 29 48 28 44 C27 36 22 32 22 24 Z" fill="#fff" stroke="#F2B4CC" stroke-width="2.5"/></g><circle cx="46" cy="18" r="8" fill="#E9735F"/><text x="46" y="22" text-anchor="middle" font-size="10" font-weight="800" fill="#fff" font-family="sans-serif">1</text></svg>`,
    'La primera visita al odontólogo es cuando sale el <b>primer diente</b> o antes del primer año.'],
];

export function render(raiz, params) {
  const volver = params.get('volver');
  const destino = volver && volver.startsWith('/app') ? `#${volver}` : '#/app';
  let pestana = params.has('registro') || params.get('como') === 'adulto' ? 'adulto' : 'nino';
  const actual = sesion.identidad();

  const oscuro = temaGuardado();

  raiz.innerHTML = `
  <div class="lg" data-tema="${oscuro ? 'oscuro' : 'claro'}">
    <section class="lg-arte">
      <div class="lg-vivo" aria-hidden="true">
        <span class="lg-mancha m1"></span><span class="lg-mancha m2"></span><span class="lg-mancha m3"></span><span class="lg-mancha m4"></span>
        <canvas class="lg-red" id="lg-red"></canvas>
      </div>
      <div class="lg-centro">
        <div class="lg-logo">
          <video class="lg-video" id="lg-video" src="video/dientin-hola.mp4" poster="video/dientin-hola.webp" playsinline preload="auto" aria-label="Dientín saluda y da la bienvenida"></video>
          <p id="dice" class="sr" aria-live="polite">¿Quién va a entrar hoy?</p>
        </div>
        <h2 class="lg-titulo">Manos Grandes,<br><span>Dientes Chiquitos</span></h2>
        <p class="lg-lema">Juegos, cuentos y guías para cuidar la sonrisa en familia y en el aula.</p>
        <section class="lg-sabias" aria-label="¿Sabías que…?">
          <div class="lg-sabias-cab"><span class="lg-sabias-chip">¿Sabías que…?</span><span class="lg-sabias-barra" aria-hidden="true"><i></i></span></div>
          <div class="lg-sabias-pista">
            ${SABIAS.map(([dibujo, texto], i) => `<div class="lg-dato${i === 0 ? ' activo' : ''}" data-i="${i}" ${i ? 'aria-hidden="true"' : ''}><span class="lg-dato-dibujo" aria-hidden="true">${dibujo}</span><p>${texto}</p></div>`).join('')}
          </div>
          <div class="lg-sabias-puntos">${SABIAS.map((_, i) => `<button type="button" data-i="${i}" aria-label="Dato ${i + 1} de ${SABIAS.length}"${i === 0 ? ' aria-current="true"' : ''}></button>`).join('')}</div>
        </section>
      </div>
    </section>

    <section class="lg-panel">
      <div class="lg-arriba">
        <a class="lg-volver" href="#/">${icono('atras', { tam: 18 })} Inicio</a>
        ${botonTema(oscuro, 'lg-tema')}
      </div>
      <div class="lg-tarjeta">
        <header class="lg-cabeza">
          <h1>¡Bienvenido!</h1><p>Elige cómo quieres entrar.</p>
        </header>

        ${actual ? `<a class="lg-continuar" href="${destino}"><span class="lg-continuar-ava">${esc(actual.avatar)}</span><span><small>Sesión abierta</small><strong>Continuar como ${esc(actual.nombre)}</strong></span>${icono('flecha', { tam: 18 })}</a>` : ''}

        <div class="lg-pestanas" role="tablist" aria-label="Tipo de ingreso">
          <span class="lg-indicador" aria-hidden="true"></span>
          <button role="tab" id="tab-nino" aria-controls="panel-nino" data-p="nino">${icono('invitado', { tam: 18 })} Niña o niño</button>
          <button role="tab" id="tab-adulto" aria-controls="panel-adulto" data-p="adulto">${icono('escuela', { tam: 18 })} Docente o familia</button>
        </div>

        <div class="lg-paneles">
          <div role="tabpanel" id="panel-nino" aria-labelledby="tab-nino" class="lg-contenido"></div>
          <div role="tabpanel" id="panel-adulto" aria-labelledby="tab-adulto" class="lg-contenido"></div>
        </div>

        <div class="lg-separador"><span>o</span></div>
        <button class="btn btn-claro lg-ancho" id="invitado">Explorar como invitado</button>
        <p class="lg-nota">Los niños no necesitan contraseña ni datos personales. <a href="#/privacidad">Privacidad</a></p>
      </div>
    </section>
  </div>`;

  // Lo que Dientín dice queda guardado en el texto de la página.
  const dice = (t) => { $('#dice', raiz).textContent = t; };
  const entrar = (tipo, datos, saludo) => {
    sesion.iniciar(tipo, datos);
    if (saludo) aviso(saludo);
    location.hash = destino;
  };

  // En el formulario de niños se esconde lo secundario para que todo quepa sin desplazarse.
  const creando = (si) => raiz.querySelector('.lg-panel').classList.toggle('lg-creando', si);

  // ---------- Niña o niño ----------
  const pintarNino = () => {
    const lista = perfiles.lista();
    creando(!lista.length && pestana === 'nino');
    const TONOS = ['#FCE4EE', '#DCEFFC', '#DDF5EA', '#FFF1D2', '#ECE7FD', '#FFE6DF'];
    $('#panel-nino', raiz).innerHTML = `
      ${lista.length ? `<div class="lg-sub-fila"><p class="lg-sub">¿Quién va a jugar hoy?</p></div>
        <div class="lg-perfiles ${lista.length > 5 ? 'muchos' : ''}">${lista.map((p, i) => `<button class="lg-perfil" data-id="${p.id}" style="--i:${i};--tono:${TONOS[i % TONOS.length]}">
          <span class="lg-perfil-ava">${esc(p.avatar)}</span><strong>${esc(p.apodo)}</strong><span class="lg-estrellas">⭐ ${progreso.resumen(p.id).totalEstrellas}</span></button>`).join('')}
          <button class="lg-perfil lg-perfil-nuevo" id="nuevo-perfil" style="--i:${lista.length}"><span class="lg-perfil-ava">${icono('mas', { tam: 26 })}</span><strong>Soy nuevo</strong><span class="lg-estrellas">Crear perfil</span></button>
        </div>` : ''}
      <form id="form-nino" class="lg-form lg-form-nino" ${lista.length ? 'hidden' : ''}>
        <div class="lg-sub-fila">${lista.length ? `<button type="button" class="lg-oir" id="cancelar-nuevo" aria-label="Volver a los perfiles">${icono('atras', { tam: 18 })}</button>` : ''}<p class="lg-sub">${lista.length ? 'Crea tu perfil' : '¡Crea tu perfil para empezar!'}</p></div>
        <label class="lg-campo"><span>Tu apodo</span><input id="apodo" required maxlength="20" placeholder="Un apodo divertido, no tu nombre" autocomplete="off"></label>
        <fieldset class="lg-avatares"><legend>Escoge tu dibujo</legend>
          <div class="avatares">${AVATARES.map((a, i) => `<label><input type="radio" name="avatar" value="${a}" ${i === 0 ? 'checked' : ''}><span>${a}</span></label>`).join('')}</div>
        </fieldset>
        ${nubeActiva() ? '<details class="lg-aula"><summary>¿Tienes un código de aula?</summary><input id="aula" maxlength="6" placeholder="Te lo da tu profe" aria-label="Código del aula" style="text-transform:uppercase"></details>' : ''}
        <button class="btn btn-grande lg-ancho">¡Entrar a jugar! ${icono('flecha', { tam: 18 })}</button>
      </form>`;

    raiz.querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => {
      const p = lista.find((x) => x.id === b.dataset.id);
      perfiles.activar(p.id);
      leer(`¡Hola, ${p.apodo}!`);
      b.classList.add('elegido');
      dice(`¡Hola, ${p.apodo}! ¡A jugar!`);
      setTimeout(() => entrar('nino', {}, `¡Hola, ${p.apodo}!`), 450);
    }));
    const form = $('#form-nino', raiz);
    $('#nuevo-perfil', raiz)?.addEventListener('click', () => {
      form.hidden = false;
      raiz.querySelector('.lg-perfiles').hidden = true;
      raiz.querySelector('#panel-nino > .lg-sub-fila').hidden = true;
      creando(true);
      $('#apodo', raiz).focus();
      dice('¡Qué bien! Escribe un apodo divertido.');
    });
    $('#cancelar-nuevo', raiz)?.addEventListener('click', () => { pintarNino(); creando(false); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const apodo = $('#apodo', raiz).value.trim();
      if (!apodo) return;
      const p = perfiles.crear({ apodo, avatar: new FormData(form).get('avatar') });
      const codigo = $('#aula', raiz)?.value.trim().toUpperCase();
      if (codigo) {
        try {
          const { nube } = await import('../../nucleo/cloud.js');
          const nombre = await nube.nombreAula(codigo);
          if (nombre) perfiles.actualizar(p.id, { aulaCodigo: codigo, aulaNombre: nombre });
          else aviso('No encontramos esa aula. Puedes unirte después desde "Mi perfil".', 'mal');
        } catch { aviso('Sin conexión: únete al aula después desde "Mi perfil".', 'mal'); }
      }
      entrar('nino', {}, `¡Bienvenido, ${apodo}!`);
    });
  };

  // ---------- Docente o familia ----------
  const pintarAdulto = async () => {
    const panel = $('#panel-adulto', raiz);
    const formLocal = `
      <form id="form-local" class="lg-form">
        <label class="lg-campo"><span>¿Cómo te llamamos?</span><input id="nombre-local" required maxlength="40" placeholder="Ej.: Profe Marta" autocomplete="nickname"></label>
        <div class="lg-roles" role="radiogroup" aria-label="Soy">
          <label><input type="radio" name="rol" value="docente" checked><span>${icono('escuela', { tam: 22 })}<b>Docente</b></span></label>
          <label><input type="radio" name="rol" value="familia"><span>${icono('guias', { tam: 22 })}<b>Familia</b></span></label>
        </div>
        <button class="btn btn-grande lg-ancho">Entrar ${icono('flecha', { tam: 18 })}</button>
      </form>`;
    const conectarLocal = () => $('#form-local', panel).addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = $('#nombre-local', panel).value.trim();
      const rol = new FormData(e.target).get('rol');
      entrar('adulto', { nombre, rol }, `¡Bienvenido, ${nombre}!`);
    });

    if (!nubeActiva()) {
      panel.innerHTML = `<p class="lg-sub">Entrada de docentes y familias</p>${formLocal}
        <p class="ayuda">Las cuentas con correo y contraseña (aulas en línea, foro) se activan cuando el sitio se conecte a la nube.</p>`;
      conectarLocal();
      return;
    }

    const { nube } = await import('../../nucleo/cloud.js');
    const u = await nube.usuario().catch(() => null);
    if (u) {
      panel.innerHTML = `<p class="lg-sub">Ya iniciaste sesión</p>
        <button class="btn btn-grande lg-ancho" id="seguir">Continuar como ${esc(u.nombre)} ${icono('flecha', { tam: 18 })}</button>`;
      $('#seguir', panel).addEventListener('click', () => entrar('adulto', { nombre: u.nombre, rol: u.rol, nube: true }));
      return;
    }

    let modo = params.has('registro') ? 'registro' : 'entrar';
    const pintarFormNube = () => {
      panel.innerHTML = modo === 'entrar' ? `
        <form id="form-nube" class="lg-form">
          <label class="lg-campo"><span>Correo</span><input id="correo" type="email" required autocomplete="email" placeholder="tucorreo@ejemplo.com"></label>
          <label class="lg-campo"><span>Contraseña</span>
            <span class="lg-clave"><input id="clave" type="password" required autocomplete="current-password" placeholder="••••••••"><button type="button" id="ver" aria-label="Mostrar contraseña">${icono('ojo', { tam: 20 })}</button></span></label>
          <button class="btn btn-grande lg-ancho">Iniciar sesión</button>
          <div class="lg-enlaces"><button type="button" id="olvide">¿Olvidaste tu contraseña?</button><button type="button" id="a-registro">Crear cuenta</button></div>
        </form>
        <details class="lg-sin-cuenta"><summary>Entrar sin cuenta</summary>${formLocal}</details>`
      : `
        <form id="form-registro" class="lg-form">
          <label class="lg-campo"><span>Nombre para mostrar</span><input id="r-nombre" required maxlength="60" placeholder="Ej.: Profe Marta"></label>
          <div class="lg-roles" role="radiogroup" aria-label="Soy">
            <label><input type="radio" name="rol" value="docente" checked><span>${icono('escuela', { tam: 22 })}<b>Docente</b></span></label>
            <label><input type="radio" name="rol" value="familia"><span>${icono('guias', { tam: 22 })}<b>Familia</b></span></label>
          </div>
          <label class="lg-campo"><span>Correo</span><input id="r-correo" type="email" required autocomplete="email"></label>
          <label class="lg-campo"><span>Contraseña (mínimo 8)</span><input id="r-clave" type="password" minlength="8" required autocomplete="new-password"></label>
          <label class="check"><input type="checkbox" required> Acepto la <a href="#/privacidad">política de privacidad</a> y soy mayor de edad.</label>
          <button class="btn btn-grande lg-ancho">Crear cuenta</button>
          <div class="lg-enlaces"><button type="button" id="a-entrar">Ya tengo cuenta</button></div>
        </form>`;

      if (modo === 'entrar') {
        conectarLocal();
        $('#ver', panel).addEventListener('click', () => { const c = $('#clave', panel); c.type = c.type === 'password' ? 'text' : 'password'; });
        $('#a-registro', panel).addEventListener('click', () => { modo = 'registro'; pintarFormNube(); dice('¡Crea tu cuenta en un minuto!'); });
        $('#olvide', panel).addEventListener('click', async () => {
          const correo = $('#correo', panel).value.trim();
          if (!correo) return aviso('Escribe tu correo primero.', 'mal');
          try { await nube.recuperarClave(correo); aviso('Te enviamos un correo para cambiar la contraseña.'); } catch (err) { aviso(err.message, 'mal'); }
        });
        $('#form-nube', panel).addEventListener('submit', async (e) => {
          e.preventDefault();
          const b = e.target.querySelector('.btn');
          b.disabled = true;
          try {
            await nube.entrar({ correo: $('#correo', panel).value.trim(), clave: $('#clave', panel).value });
            const yo = await nube.usuario();
            entrar('adulto', { nombre: yo.nombre, rol: yo.rol, nube: true }, `¡Bienvenido, ${yo.nombre}!`);
          } catch (err) {
            aviso(nube.mensajeError(err), 'mal');
            b.disabled = false;
          }
        });
      } else {
        $('#a-entrar', panel).addEventListener('click', () => { modo = 'entrar'; pintarFormNube(); });
        $('#form-registro', panel).addEventListener('submit', async (e) => {
          e.preventDefault();
          const b = e.target.querySelector('.btn');
          b.disabled = true;
          try {
            const r = await nube.registrar({
              nombre: $('#r-nombre', panel).value.trim(), rol: new FormData(e.target).get('rol'),
              correo: $('#r-correo', panel).value.trim(), clave: $('#r-clave', panel).value,
            });
            if (r.session) {
              const yo = await nube.usuario();
              entrar('adulto', { nombre: yo.nombre, rol: yo.rol, nube: true },
                yo.rol === 'docente' && !yo.aprobado ? '¡Cuenta creada! Un administrador debe aprobarla para que puedas crear aulas.' : '¡Cuenta creada!');
            } else {
              aviso('¡Cuenta creada! Revisa tu correo para confirmarla y luego inicia sesión.');
              modo = 'entrar';
              pintarFormNube();
            }
          } catch (err) { aviso(nube.mensajeError(err), 'mal'); b.disabled = false; }
        });
      }
    };
    pintarFormNube();
  };

  // ---------- Pestañas ----------
  const cambiar = (p) => {
    pestana = p;
    raiz.querySelector('.lg-pestanas').dataset.activa = p;
    raiz.querySelectorAll('[role=tab]').forEach((t) => {
      const activa = t.dataset.p === p;
      t.setAttribute('aria-selected', String(activa));
      t.tabIndex = activa ? 0 : -1;
    });
    $('#panel-nino', raiz).hidden = p !== 'nino';
    creando(p === 'nino' && !$('#form-nino', raiz)?.hidden);
    $('#panel-adulto', raiz).hidden = p !== 'adulto';
    dice(p === 'nino' ? '¡Hola! Toca tu perfil o crea uno nuevo.' : '¡Bienvenidos! Las manos grandes también aprenden aquí.');
  };
  raiz.querySelectorAll('[role=tab]').forEach((t) => {
    t.addEventListener('click', () => cambiar(t.dataset.p));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const otra = t.dataset.p === 'nino' ? 'adulto' : 'nino';
      cambiar(otra);
      $(`#tab-${otra}`, raiz).focus();
    });
  });
  $('#invitado', raiz).addEventListener('click', () => entrar('invitado', {}, 'Explorando como invitado. Crea un perfil para guardar tus estrellas.'));

  // Modo claro / oscuro (se recuerda en este equipo).
  conectarTema(raiz.querySelector('.lg'));

  pintarNino();
  pintarAdulto();
  cambiar(pestana);
  return animarArte(raiz);
}

/** Lado izquierdo: red animada de sonrisas y Dientín que parpadea y saluda al pasar el mouse. Nada sigue al cursor. */
function animarArte(raiz) {
  const lg = raiz.querySelector('.lg');
  const detenerFondo = iniciarFondo($('#lg-red', raiz), { oscuro: () => lg.dataset.tema === 'oscuro' });
  const detenerVideo = videoDientin(raiz);
  const detenerSabias = sabiasQue(raiz);
  return () => { detenerFondo(); detenerVideo(); detenerSabias(); };
}

/**
 * Video de Dientín con su voz: recibe al llegar al login, se calla al terminar
 * (vuelve al primer cuadro) y se repite al pasar el cursor por encima.
 * Los navegadores solo dejan reproducir con sonido si la persona ya tocó la página
 * (por ejemplo, el botón "Entrar" del landing); si no, espera su primer toque o tecla.
 */
function videoDientin(raiz) {
  const v = $('#lg-video', raiz);
  const logo = raiz.querySelector('.lg-logo');
  const limpiezas = [];
  let terminoEn = 0;
  let esperando = null;

  const reproducir = () => {
    detener();
    v.currentTime = 0;
    logo.classList.add('hablando');
    return v.play();
  };
  const esperarToque = () => {
    if (esperando) return;
    const eventos = ['pointerdown', 'keydown', 'touchstart'];
    esperando = () => { quitar(); reproducir().catch(() => {}); };
    const quitar = () => { eventos.forEach((e) => window.removeEventListener(e, esperando, true)); esperando = null; };
    eventos.forEach((e) => window.addEventListener(e, esperando, { capture: true, once: true }));
    limpiezas.push(quitar);
  };

  v.addEventListener('ended', () => {
    logo.classList.remove('hablando');
    v.currentTime = 0;
    terminoEn = Date.now();
  });
  v.addEventListener('pause', () => logo.classList.remove('hablando'));

  // Al pasar el cursor: vuelve a hablar si está callado (con una pausa corta para no repetirse sin parar).
  const alPasar = () => {
    if (!v.paused || Date.now() - terminoEn < 1200) return;
    reproducir().catch(esperarToque);
  };
  logo.addEventListener('pointerenter', alPasar);
  limpiezas.push(() => logo.removeEventListener('pointerenter', alPasar));

  // Al llegar: intenta hablar de una vez.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reproducir().catch(() => { logo.classList.remove('hablando'); esperarToque(); });
  }

  limpiezas.push(() => { v.pause(); v.removeAttribute('src'); v.load(); });
  return () => limpiezas.forEach((f) => f());
}

/** «¿Sabías que…?»: cambia de dato cada 6 s, se pausa con el cursor encima y los puntos eligen uno. */
function sabiasQue(raiz) {
  const caja = raiz.querySelector('.lg-sabias');
  if (!caja) return () => {};
  const datos = [...caja.querySelectorAll('.lg-dato')];
  const puntos = [...caja.querySelectorAll('.lg-sabias-puntos button')];
  const barra = caja.querySelector('.lg-sabias-barra i');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let i = 0;
  let reloj = 0;
  const mostrar = (k) => {
    i = (k + datos.length) % datos.length;
    datos.forEach((d, j) => { d.classList.toggle('activo', j === i); d.toggleAttribute('aria-hidden', j !== i); });
    puntos.forEach((b, j) => b.toggleAttribute('aria-current', j === i));
    barra.style.animation = 'none'; void barra.offsetWidth; barra.style.animation = '';
  };
  const seguir = () => { clearInterval(reloj); if (!quieto) reloj = setInterval(() => mostrar(i + 1), 6000); };
  const alPunto = (e) => { const b = e.target.closest('button'); if (b) { mostrar(Number(b.dataset.i)); seguir(); } };
  const pausa = () => { clearInterval(reloj); caja.classList.add('pausa'); };
  const sigue = () => { caja.classList.remove('pausa'); mostrar(i); seguir(); };
  caja.addEventListener('click', alPunto);
  caja.addEventListener('pointerenter', pausa);
  caja.addEventListener('pointerleave', sigue);
  seguir();
  return () => {
    clearInterval(reloj);
    caja.removeEventListener('click', alPunto);
    caja.removeEventListener('pointerenter', pausa);
    caja.removeEventListener('pointerleave', sigue);
  };
}
