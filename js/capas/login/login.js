// Capa 2 — Login: puerta entre la landing y el sistema.
//   · Niña o niño: elige o crea su perfil (apodo + avatar, sin contraseña).
//   · Docente o familia: correo y contraseña (nube) o entrada local con nombre y rol.
//   · Invitado: explora sin guardar progreso.

import { perfiles, progreso, AVATARES } from '../../nucleo/store.js';
import { sesion } from '../../nucleo/sesion.js';
import { nubeActiva } from '../../config.js';
import { esc, aviso, $ } from '../../nucleo/util.js';
import { leer } from '../../nucleo/speech.js';
import { SOFI } from '../../nucleo/sofi.js';

export function render(raiz, params) {
  const volver = params.get('volver');
  const destino = volver && volver.startsWith('/app') ? `#${volver}` : '#/app';
  let pestana = params.has('registro') || params.get('como') === 'adulto' ? 'adulto' : 'nino';
  const actual = sesion.identidad();

  raiz.innerHTML = `
  <div class="lg">
    <section class="lg-arte" aria-hidden="false">
      <div class="lg-arte-fondo" aria-hidden="true"><span></span><span></span><span></span></div>
      <a class="lg-volver" href="#/">← Volver a la página principal</a>
      <div class="lg-arte-txt">
        <h2>¡Bienvenidos a<br><span>Manos Grandes Dientes Chiquitos</span>!</h2>
        <p>Juegos, cuentos y guías para cuidar la sonrisa en familia y en el aula.</p>
      </div>
      <img class="lg-sofi" src="${SOFI.img}" width="760" height="1633" alt="Sofi, la doctora de las sonrisas">
      <div class="lg-globo"><img src="${SOFI.cara}" alt="" width="44" height="44" class="avatar-sofi"><p id="dice">¿Quién va a entrar hoy?</p></div>
    </section>

    <section class="lg-panel">
      <div class="lg-tarjeta">
        <a class="lg-volver lg-volver-movil" href="#/">← Inicio</a>
        <header class="lg-cabeza">
          <img src="icons/icon.svg" alt="" width="52" height="52">
          <div><h1>Entrar</h1><p>Elige cómo quieres ingresar al sistema</p></div>
        </header>

        ${actual ? `<a class="lg-continuar" href="${destino}"><span class="lg-continuar-ava">${esc(actual.avatar)}</span><span><small>Sesión abierta</small><strong>Continuar como ${esc(actual.nombre)}</strong></span><span aria-hidden="true">➜</span></a>` : ''}

        <div class="lg-pestanas" role="tablist" aria-label="Tipo de ingreso">
          <span class="lg-indicador" aria-hidden="true"></span>
          <button role="tab" id="tab-nino" aria-controls="panel-nino" data-p="nino">👧🧒 Niña o niño</button>
          <button role="tab" id="tab-adulto" aria-controls="panel-adulto" data-p="adulto">👩‍🏫 Docente o familia</button>
        </div>

        <div role="tabpanel" id="panel-nino" aria-labelledby="tab-nino" class="lg-contenido"></div>
        <div role="tabpanel" id="panel-adulto" aria-labelledby="tab-adulto" class="lg-contenido"></div>

        <div class="lg-separador"><span>o</span></div>
        <button class="btn btn-claro lg-ancho" id="invitado">🙂 Explorar como invitado</button>
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

  // ---------- Niña o niño ----------
  const pintarNino = () => {
    const lista = perfiles.lista();
    $('#panel-nino', raiz).innerHTML = `
      ${lista.length ? `<p class="lg-sub">Toca tu perfil</p>
        <div class="lg-perfiles">${lista.map((p, i) => `<button class="lg-perfil" data-id="${p.id}" style="--i:${i}">
          <span class="lg-perfil-ava">${esc(p.avatar)}</span><strong>${esc(p.apodo)}</strong><small>★ ${progreso.resumen(p.id).totalEstrellas}</small></button>`).join('')}
          <button class="lg-perfil lg-perfil-nuevo" id="nuevo-perfil" style="--i:${lista.length}"><span class="lg-perfil-ava">➕</span><strong>Soy nuevo</strong><small>Crear perfil</small></button>
        </div>` : ''}
      <form id="form-nino" class="lg-form" ${lista.length ? 'hidden' : ''}>
        <p class="lg-sub">${lista.length ? 'Crea tu perfil' : '¡Crea tu perfil para empezar!'}</p>
        <label class="lg-campo"><span>Tu apodo</span><input id="apodo" required maxlength="20" placeholder="Ej.: Estrella Feliz" autocomplete="off"></label>
        <p class="ayuda">Un apodo divertido. No escribas tu nombre completo.</p>
        <fieldset class="lg-avatares"><legend>Escoge tu avatar</legend>
          <div class="avatares">${AVATARES.map((a, i) => `<label><input type="radio" name="avatar" value="${a}" ${i === 0 ? 'checked' : ''}><span>${a}</span></label>`).join('')}</div>
        </fieldset>
        ${nubeActiva() ? '<label class="lg-campo"><span>Código del aula (opcional)</span><input id="aula" maxlength="6" placeholder="Te lo da tu profe" style="text-transform:uppercase"></label>' : ''}
        <button class="btn btn-grande btn-menta lg-ancho">🚀 ¡Entrar a jugar!</button>
        ${lista.length ? '<button type="button" class="btn btn-mini lg-ancho" id="cancelar-nuevo">Volver a los perfiles</button>' : ''}
      </form>`;

    raiz.querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => {
      const p = lista.find((x) => x.id === b.dataset.id);
      perfiles.activar(p.id);
      leer(`¡Hola, ${p.apodo}!`);
      entrar('nino', {}, `¡Hola, ${p.apodo}!`);
    }));
    const form = $('#form-nino', raiz);
    $('#nuevo-perfil', raiz)?.addEventListener('click', () => {
      form.hidden = false;
      raiz.querySelector('.lg-perfiles').hidden = true;
      raiz.querySelector('#panel-nino > .lg-sub').hidden = true;
      $('#apodo', raiz).focus();
      dice('¡Qué bien! Escribe un apodo divertido.');
    });
    $('#cancelar-nuevo', raiz)?.addEventListener('click', pintarNino);
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
          <label><input type="radio" name="rol" value="docente" checked><span>👩‍🏫<b>Docente</b></span></label>
          <label><input type="radio" name="rol" value="familia"><span>👨‍👩‍👧<b>Familia</b></span></label>
        </div>
        <button class="btn btn-grande lg-ancho">Entrar ➜</button>
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
        <button class="btn btn-grande lg-ancho" id="seguir">Continuar como ${esc(u.nombre)} ➜</button>`;
      $('#seguir', panel).addEventListener('click', () => entrar('adulto', { nombre: u.nombre, rol: u.rol, nube: true }));
      return;
    }

    let modo = params.has('registro') ? 'registro' : 'entrar';
    const pintarFormNube = () => {
      panel.innerHTML = modo === 'entrar' ? `
        <form id="form-nube" class="lg-form">
          <label class="lg-campo"><span>Correo</span><input id="correo" type="email" required autocomplete="email" placeholder="tucorreo@ejemplo.com"></label>
          <label class="lg-campo"><span>Contraseña</span>
            <span class="lg-clave"><input id="clave" type="password" required autocomplete="current-password" placeholder="••••••••"><button type="button" id="ver" aria-label="Mostrar contraseña">👁️</button></span></label>
          <button class="btn btn-grande lg-ancho">Iniciar sesión</button>
          <div class="lg-enlaces"><button type="button" id="olvide">¿Olvidaste tu contraseña?</button><button type="button" id="a-registro">Crear cuenta</button></div>
        </form>
        <details class="lg-sin-cuenta"><summary>Entrar sin cuenta</summary>${formLocal}</details>`
      : `
        <form id="form-registro" class="lg-form">
          <label class="lg-campo"><span>Nombre para mostrar</span><input id="r-nombre" required maxlength="60" placeholder="Ej.: Profe Marta"></label>
          <div class="lg-roles" role="radiogroup" aria-label="Soy">
            <label><input type="radio" name="rol" value="docente" checked><span>👩‍🏫<b>Docente</b></span></label>
            <label><input type="radio" name="rol" value="familia"><span>👨‍👩‍👧<b>Familia</b></span></label>
          </div>
          <label class="lg-campo"><span>Correo</span><input id="r-correo" type="email" required autocomplete="email"></label>
          <label class="lg-campo"><span>Contraseña (mínimo 8)</span><input id="r-clave" type="password" minlength="8" required autocomplete="new-password"></label>
          <label class="check"><input type="checkbox" required> Acepto la <a href="#/privacidad">política de privacidad</a> y soy mayor de edad.</label>
          <button class="btn btn-grande btn-menta lg-ancho">Crear cuenta</button>
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
              entrar('adulto', { nombre: yo.nombre, rol: yo.rol, nube: true }, '¡Cuenta creada!');
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
}
