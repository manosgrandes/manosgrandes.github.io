// Capa 2 — Login: puerta entre la landing y el sistema.
//   · Niña o niño: elige o crea su perfil (apodo + avatar, sin contraseña).
//   · Docente o familia: correo y contraseña (nube) o entrada local con nombre y rol.
//   · Invitado: explora sin guardar progreso.

import { perfiles, progreso, AVATARES } from '../../nucleo/store.js';
import { sesion } from '../../nucleo/sesion.js';
import { nubeActiva } from '../../config.js';
import { esc, aviso, $ } from '../../nucleo/util.js';
import { leer } from '../../nucleo/speech.js';
import { DIENTIN } from '../../nucleo/sofi.js';
import { icono } from '../../nucleo/iconos.js';

export function render(raiz, params) {
  const volver = params.get('volver');
  const destino = volver && volver.startsWith('/app') ? `#${volver}` : '#/app';
  let pestana = params.has('registro') || params.get('como') === 'adulto' ? 'adulto' : 'nino';
  const actual = sesion.identidad();

  raiz.innerHTML = `
  <div class="lg">
    <section class="lg-arte">
      <a class="marca" href="#/"><img src="icons/icon.svg" alt="" width="38" height="38"><span><strong>Manos Grandes</strong><small>Dientes Chiquitos</small></span></a>
      <div class="lg-arte-txt">
        <p class="lg-antetitulo">Bienvenidos</p>
        <h2>Cuidar la sonrisa se aprende <span>juntos</span>.</h2>
        <p>Juegos, cuentos y guías para niñas, niños, familias y docentes.</p>
      </div>
      <div class="lg-vivo" aria-hidden="true">
        <span class="lg-mancha m1"></span><span class="lg-mancha m2"></span><span class="lg-mancha m3"></span><span class="lg-mancha m4"></span>
        <div class="lg-burbujas" id="lg-burbujas"></div>
      </div>
      <div class="lg-escena" id="lg-escena">
        <div class="lg-aro" data-prof="8" aria-hidden="true"></div>
        <div class="lg-aro lg-aro2" data-prof="14" aria-hidden="true"></div>
        <span class="lg-flota f1" data-prof="22" aria-hidden="true">🍎</span>
        <span class="lg-flota f2" data-prof="28" aria-hidden="true">⭐</span>
        <span class="lg-flota f3" data-prof="18" aria-hidden="true">💖</span>
        <span class="lg-flota f4" data-prof="24" aria-hidden="true">✨</span>
        <div class="lg-chip c1" data-prof="16" aria-hidden="true"><span>⭐</span><b>+3</b> estrellas</div>
        <div class="lg-chip c2" data-prof="20" aria-hidden="true"><span>🎮</span>5 juegos</div>
        <div class="lg-personaje" data-prof="5">
          <img class="lg-dientin" src="${DIENTIN.img}" width="${DIENTIN.ancho}" height="${DIENTIN.alto}" alt="Dientín, el diente amigo, con su cepillo">
          <div class="lg-globo" aria-live="polite"><p id="dice">¿Quién va a entrar hoy?</p></div>
        </div>
        <div class="lg-piso" aria-hidden="true"></div>
      </div>
    </section>

    <section class="lg-panel">
      <a class="lg-volver" href="#/">${icono('atras', { tam: 16 })} Volver al inicio</a>
      <div class="lg-tarjeta">
        <header class="lg-cabeza">
          <h1>Entrar</h1><p>Elige cómo quieres ingresar al sistema.</p>
        </header>

        ${actual ? `<a class="lg-continuar" href="${destino}"><span class="lg-continuar-ava">${esc(actual.avatar)}</span><span><small>Sesión abierta</small><strong>Continuar como ${esc(actual.nombre)}</strong></span>${icono('flecha', { tam: 18 })}</a>` : ''}

        <div class="lg-pestanas" role="tablist" aria-label="Tipo de ingreso">
          <span class="lg-indicador" aria-hidden="true"></span>
          <button role="tab" id="tab-nino" aria-controls="panel-nino" data-p="nino">${icono('invitado', { tam: 18 })} Niña o niño</button>
          <button role="tab" id="tab-adulto" aria-controls="panel-adulto" data-p="adulto">${icono('escuela', { tam: 18 })} Docente o familia</button>
        </div>

        <div role="tabpanel" id="panel-nino" aria-labelledby="tab-nino" class="lg-contenido"></div>
        <div role="tabpanel" id="panel-adulto" aria-labelledby="tab-adulto" class="lg-contenido"></div>

        <div class="lg-separador"><span>o</span></div>
        <button class="btn btn-claro lg-ancho" id="invitado">Explorar como invitado</button>
        <p class="lg-nota">Los niños no necesitan contraseña ni datos personales. <a href="#/privacidad">Privacidad</a></p>
      </div>
    </section>
  </div>`;

  const dice = (t) => {
    const p = $('#dice', raiz);
    p.classList.remove('lg-cambia');
    void p.offsetWidth;
    p.textContent = t;
    p.classList.add('lg-cambia');
  };
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
    const escuchar = (t) => `<button type="button" class="lg-oir" data-oir="${t}" aria-label="Escuchar: ${t}">${icono('sonido', { tam: 18 })}</button>`;
    const pregunta = lista.length ? '¿Quién va a jugar hoy? Toca tu dibujo.' : '¡Hola! Crea tu perfil para empezar a jugar.';
    $('#panel-nino', raiz).innerHTML = `
      ${lista.length ? `<div class="lg-sub-fila"><p class="lg-sub">¿Quién va a jugar hoy?</p>${escuchar(pregunta)}</div>
        <div class="lg-perfiles">${lista.map((p, i) => `<button class="lg-perfil" data-id="${p.id}" style="--i:${i};--tono:${TONOS[i % TONOS.length]}">
          <span class="lg-perfil-ava">${esc(p.avatar)}</span><strong>${esc(p.apodo)}</strong><span class="lg-estrellas">⭐ ${progreso.resumen(p.id).totalEstrellas}</span></button>`).join('')}
          <button class="lg-perfil lg-perfil-nuevo" id="nuevo-perfil" style="--i:${lista.length}"><span class="lg-perfil-ava">${icono('mas', { tam: 26 })}</span><strong>Soy nuevo</strong><span class="lg-estrellas">Crear perfil</span></button>
        </div>` : ''}
      <form id="form-nino" class="lg-form lg-form-nino" ${lista.length ? 'hidden' : ''}>
        <div class="lg-sub-fila">${lista.length ? `<button type="button" class="lg-oir" id="cancelar-nuevo" aria-label="Volver a los perfiles">${icono('atras', { tam: 18 })}</button>` : ''}<p class="lg-sub">${lista.length ? 'Crea tu perfil' : '¡Crea tu perfil para empezar!'}</p>${escuchar('Escribe un apodo divertido y escoge tu dibujo.')}</div>
        <label class="lg-campo"><span>Tu apodo</span><input id="apodo" required maxlength="20" placeholder="Un apodo divertido, no tu nombre" autocomplete="off"></label>
        <fieldset class="lg-avatares"><legend>Escoge tu dibujo</legend>
          <div class="avatares">${AVATARES.map((a, i) => `<label><input type="radio" name="avatar" value="${a}" ${i === 0 ? 'checked' : ''}><span>${a}</span></label>`).join('')}</div>
        </fieldset>
        ${nubeActiva() ? '<details class="lg-aula"><summary>¿Tienes un código de aula?</summary><input id="aula" maxlength="6" placeholder="Te lo da tu profe" aria-label="Código del aula" style="text-transform:uppercase"></details>' : ''}
        <button class="btn btn-grande lg-ancho">¡Entrar a jugar! ${icono('flecha', { tam: 18 })}</button>
      </form>`;

    $('#panel-nino', raiz).querySelectorAll('[data-oir]').forEach((b) => b.addEventListener('click', () => leer(b.dataset.oir, { tono: 1.25 })));
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

  pintarNino();
  pintarAdulto();
  cambiar(pestana);
  return animarArte(raiz);
}

/** Fondo vivo del lado izquierdo: burbujas, saltito de Dientín y profundidad con el mouse. */
function animarArte(raiz) {
  const limpiezas = [];
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const zona = $('#lg-burbujas', raiz);
  for (let i = 0; i < 18; i++) {
    const b = document.createElement('span');
    const t = 7 + Math.random() * 3;
    b.style.cssText = `left:${Math.random() * 100}%;--s:${10 + Math.random() * 34}px;--t:${t}s;--x:${(Math.random() - 0.5) * 60}px;animation-delay:${-Math.random() * t}s`;
    zona.append(b);
  }
  if (sinMovimiento) return () => {};

  // Dientín da un saltito de alegría cada cierto tiempo.
  const dientin = raiz.querySelector('.lg-dientin');
  const reloj = setInterval(() => {
    if (!dientin?.isConnected) return;
    dientin.classList.remove('salta');
    void dientin.offsetWidth;
    dientin.classList.add('salta');
  }, 7000);
  limpiezas.push(() => clearInterval(reloj));

  // Profundidad: las capas se mueven distinto según el mouse.
  const arte = raiz.querySelector('.lg-arte');
  const capas = [...arte.querySelectorAll('[data-prof]')];
  if (matchMedia('(pointer: fine)').matches) {
    let pendiente = false;
    const mover = (e) => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        const r = arte.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        capas.forEach((c) => { const p = Number(c.dataset.prof); c.style.translate = `${-dx * p}px ${-dy * p}px`; });
        pendiente = false;
      });
    };
    arte.addEventListener('pointermove', mover);
    limpiezas.push(() => arte.removeEventListener('pointermove', mover));
  }
  return () => limpiezas.forEach((f) => f());
}
