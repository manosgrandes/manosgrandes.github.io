// Login: niñas y niños entran con su perfil (apodo, sin contraseña);
// docentes y familias entran con correo y contraseña (Supabase).

import { perfiles, progreso, AVATARES } from '../store.js';
import { nubeActiva } from '../config.js';
import { esc, aviso, $ } from '../util.js';
import { leer } from '../speech.js';
import { SOFI } from './landing.js';

const marcarEntrada = (tipo) => localStorage.setItem('mgdc:entrada', JSON.stringify({ tipo, fecha: new Date().toISOString() }));

export function render(app) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  let pestana = params.get('como') === 'adulto' ? 'adulto' : 'nino';

  app.innerHTML = `
  <section class="login">
    <aside class="login-sofi">
      <img src="${SOFI.img}" width="760" height="1633" alt="Sofi, la doctora de las sonrisas" class="login-figura">
      <div class="login-saludo">
        <img src="${SOFI.cara}" width="64" height="64" alt="" class="avatar-sofi">
        <p class="burbuja" id="dice">¡Hola! Soy Sofi. ¿Quién va a entrar hoy?</p>
      </div>
    </aside>

    <div class="tarjeta login-panel">
      <h1>Entrar</h1>
      <div class="login-pestanas" role="tablist" aria-label="Tipo de ingreso">
        <button role="tab" id="tab-nino" aria-controls="panel-nino" data-p="nino">👧🧒 Soy niña o niño</button>
        <button role="tab" id="tab-adulto" aria-controls="panel-adulto" data-p="adulto">👩‍🏫 Docente o familia</button>
      </div>

      <div role="tabpanel" id="panel-nino" aria-labelledby="tab-nino" class="pila"></div>
      <div role="tabpanel" id="panel-adulto" aria-labelledby="tab-adulto" class="pila"></div>

      <p class="centro chico" style="margin-top:1.2rem"><a href="#/inicio" id="invitado">Entrar sin perfil (invitado) ➡</a></p>
    </div>
  </section>`;

  const dice = (t) => { $('#dice', app).textContent = t; };

  const pintarNino = () => {
    const lista = perfiles.lista();
    $('#panel-nino', app).innerHTML = `
      ${lista.length ? `<h2 class="login-sub">Toca tu perfil</h2>
        <div class="perfiles">${lista.map((p) => `<button class="perfil-btn" data-id="${p.id}"><span class="ava">${esc(p.avatar)}</span>${esc(p.apodo)}<br><span class="estrellas chico">★ ${progreso.resumen(p.id).totalEstrellas}</span></button>`).join('')}</div>` : ''}
      <details ${lista.length ? '' : 'open'} class="login-nuevo">
        <summary>➕ ${lista.length ? 'Soy nuevo: crear mi perfil' : 'Crea tu perfil'}</summary>
        <form id="form-nino" class="pila" style="margin-top:1rem">
          <div><label for="apodo">Tu apodo</label><input id="apodo" required maxlength="20" placeholder="Ej.: Estrella Feliz" autocomplete="off">
            <p class="ayuda">Un apodo divertido. No escribas tu nombre completo.</p></div>
          <fieldset style="border:0;padding:0"><legend><strong>Escoge tu avatar</strong></legend>
            <div class="avatares">${AVATARES.map((a, i) => `<label><input type="radio" name="avatar" value="${a}" ${i === 0 ? 'checked' : ''}><span>${a}</span></label>`).join('')}</div>
          </fieldset>
          ${nubeActiva() ? `<div><label for="aula">Código del aula (si tu profe te lo dio)</label><input id="aula" maxlength="6" placeholder="Opcional" style="text-transform:uppercase"></div>` : ''}
          <button class="btn btn-menta btn-grande">🚀 ¡Entrar a jugar!</button>
        </form>
      </details>`;

    app.querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => {
      const p = lista.find((x) => x.id === b.dataset.id);
      perfiles.activar(p.id);
      marcarEntrada('nino');
      leer(`¡Hola, ${p.apodo}!`);
      location.hash = '#/inicio';
    }));
    $('#form-nino', app).addEventListener('submit', async (e) => {
      e.preventDefault();
      const apodo = $('#apodo', app).value.trim();
      if (!apodo) return;
      const p = perfiles.crear({ apodo, avatar: new FormData(e.target).get('avatar') });
      const codigo = $('#aula', app)?.value.trim().toUpperCase();
      if (codigo) {
        try {
          const { nube } = await import('../cloud.js');
          const nombre = await nube.nombreAula(codigo);
          if (nombre) {
            perfiles.actualizar(p.id, { aulaCodigo: codigo, aulaNombre: nombre });
            aviso(`¡Te uniste a ${nombre}!`);
          } else aviso('No encontramos esa aula. Puedes unirte después desde tu perfil.', 'mal');
        } catch { aviso('Sin conexión: únete al aula más tarde desde tu perfil.', 'mal'); }
      }
      marcarEntrada('nino');
      aviso(`¡Bienvenido, ${apodo}!`);
      location.hash = '#/inicio';
    });
  };

  const pintarAdulto = async () => {
    const panel = $('#panel-adulto', app);
    if (!nubeActiva()) {
      panel.innerHTML = `
        <h2 class="login-sub">Docentes y familias</h2>
        <p class="nota nota-info">Las cuentas con correo y contraseña se activan cuando el sitio se conecta a la nube. Mientras tanto, puedes usar todo sin cuenta: guías, recordatorios, cuentos y el panel docente del dispositivo.</p>
        <div class="fila">
          <a class="btn" href="#/padres" data-entrar="adulto">👨‍👩‍👧 Ir a Padres y docentes</a>
          <a class="btn btn-claro" href="#/docentes" data-entrar="adulto">📊 Panel docente</a>
        </div>`;
      panel.querySelectorAll('[data-entrar]').forEach((a) => a.addEventListener('click', () => marcarEntrada('adulto')));
      return;
    }
    const { nube } = await import('../cloud.js');
    const u = await nube.usuario().catch(() => null);
    if (u) {
      panel.innerHTML = `<h2 class="login-sub">Ya iniciaste sesión</h2><p>Hola, <strong>${esc(u.nombre)}</strong>.</p>
        <div class="fila"><a class="btn" href="${u.rol === 'docente' ? '#/docentes' : '#/padres'}">Continuar ➡</a><a class="btn btn-claro" href="#/cuenta">Mi cuenta</a></div>`;
      return;
    }
    panel.innerHTML = `
      <h2 class="login-sub">Inicia sesión</h2>
      <form id="form-adulto" class="pila">
        <div><label for="correo">Correo</label><input id="correo" type="email" required autocomplete="email"></div>
        <div><label for="clave">Contraseña</label>
          <div class="campo-clave"><input id="clave" type="password" required autocomplete="current-password"><button type="button" class="btn btn-mini" id="ver" aria-label="Mostrar contraseña">👁️</button></div></div>
        <button class="btn btn-grande">Entrar</button>
      </form>
      <div class="fila entre chico"><button class="btn btn-mini" id="olvide">Olvidé mi contraseña</button><a href="#/cuenta">¿No tienes cuenta? Créala aquí</a></div>`;
    $('#ver', panel).addEventListener('click', () => {
      const c = $('#clave', panel);
      c.type = c.type === 'password' ? 'text' : 'password';
    });
    $('#form-adulto', panel).addEventListener('submit', async (e) => {
      e.preventDefault();
      const boton = e.target.querySelector('button.btn-grande');
      boton.disabled = true;
      try {
        await nube.entrar({ correo: $('#correo', panel).value.trim(), clave: $('#clave', panel).value });
        marcarEntrada('adulto');
        const yo = await nube.usuario();
        aviso(`¡Bienvenido, ${yo.nombre}!`);
        location.hash = yo.rol === 'docente' ? '#/docentes' : '#/padres';
      } catch (err) {
        aviso(/confirm/i.test(err.message) ? 'Primero confirma tu correo (revisa tu bandeja de entrada).' : 'Correo o contraseña incorrectos.', 'mal');
      } finally {
        boton.disabled = false;
      }
    });
    $('#olvide', panel).addEventListener('click', async () => {
      const correo = $('#correo', panel).value.trim();
      if (!correo) return aviso('Escribe tu correo primero.', 'mal');
      try { await nube.recuperarClave(correo); aviso('Te enviamos un correo para cambiar la contraseña.'); }
      catch (err) { aviso(err.message, 'mal'); }
    });
  };

  const cambiar = (p) => {
    pestana = p;
    app.querySelectorAll('[role=tab]').forEach((t) => {
      const activa = t.dataset.p === p;
      t.setAttribute('aria-selected', String(activa));
      t.tabIndex = activa ? 0 : -1;
    });
    $('#panel-nino', app).hidden = p !== 'nino';
    $('#panel-adulto', app).hidden = p !== 'adulto';
    dice(p === 'nino' ? '¡Hola! Toca tu perfil o crea uno nuevo para jugar.' : '¡Bienvenidos! Las manos grandes también aprenden aquí.');
  };
  app.querySelectorAll('[role=tab]').forEach((t) => {
    t.addEventListener('click', () => cambiar(t.dataset.p));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const otra = t.dataset.p === 'nino' ? 'adulto' : 'nino';
        cambiar(otra);
        $(`#tab-${otra}`, app).focus();
      }
    });
  });
  $('#invitado', app).addEventListener('click', () => { perfiles.activar(null); marcarEntrada('invitado'); });

  pintarNino();
  pintarAdulto();
  cambiar(pestana);
}
