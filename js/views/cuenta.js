// Cuentas de adultos (docentes y familias). Los niños no necesitan cuenta.

import { nubeActiva } from '../config.js';
import { esc, aviso, $ } from '../util.js';
import { dientinDice } from '../character.js';

export async function render(app) {
  if (!nubeActiva()) {
    app.innerHTML = `
    <h1>👤 Cuenta</h1>
    ${dientinDice('¡No necesitas cuenta para jugar ni leer! Todo se guarda en este dispositivo.')}
    <p class="nota nota-info" style="margin-top:1rem">Las cuentas de docentes y familias (aulas, foro y biblioteca compartida) se activan cuando el administrador del sitio conecta la nube gratuita. Ver README.md.</p>`;
    return;
  }
  const { nube } = await import('../cloud.js');
  const recuperar = location.hash.includes('recuperar');

  const pintar = async () => {
    let u = null;
    try { u = await nube.usuario(); } catch { /* sin conexión */ }

    if (u && recuperar) {
      app.innerHTML = `<section class="tarjeta pila" style="max-width:520px;margin:0 auto"><h1>🔑 Nueva contraseña</h1>
        <form id="nueva-clave" class="pila"><div><label for="clave">Nueva contraseña</label><input id="clave" type="password" minlength="8" required autocomplete="new-password"></div><button class="btn">Guardar</button></form></section>`;
      $('#nueva-clave', app).addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await nube.cambiarClave($('#clave', app).value);
          aviso('Contraseña actualizada.');
          location.hash = '#/cuenta';
        } catch (err) { aviso(err.message, 'mal'); }
      });
      return;
    }

    if (u) {
      app.innerHTML = `
      <section class="tarjeta pila" style="max-width:640px;margin:0 auto">
        <h1>👤 Hola, ${esc(u.nombre)}</h1>
        <p>Cuenta de <strong>${u.rol === 'docente' ? 'docente' : 'familia'}</strong>${u.admin ? ' · <strong>administrador</strong>' : ''} · ${esc(u.correo)}</p>
        <div class="fila">
          ${u.rol === 'docente' ? '<a class="btn" href="#/docentes">📊 Panel docente</a>' : ''}
          <a class="btn btn-menta" href="#/foro">💬 Foro</a>
          <a class="btn btn-sol" href="#/cuentos/nuevo">📤 Subir cuento</a>
          ${u.admin ? '<a class="btn btn-coral" href="#/admin">🛠️ Administración</a>' : ''}
        </div>
        <div id="mis-cuentos"></div>
        <button class="btn btn-claro" id="salir">Cerrar sesión</button>
      </section>`;
      $('#salir', app).addEventListener('click', async () => { await nube.salir(); aviso('Sesión cerrada.'); pintar(); });
      try {
        const mios = await nube.misCuentos();
        if (mios.length) {
          $('#mis-cuentos', app).innerHTML = `<h2>Mis cuentos enviados</h2><ul>${mios.map((c) => `<li>${esc(c.titulo)} — <span class="etiqueta">${{ pendiente: '⏳ En revisión', aprobado: '✅ Publicado', rechazado: '❌ No aprobado' }[c.estado]}</span></li>`).join('')}</ul>`;
        }
      } catch { /* opcional */ }
      return;
    }

    app.innerHTML = `
    <h1>👤 Cuenta para docentes y familias</h1>
    <p class="suave">Las niñas y los niños <strong>no necesitan cuenta</strong>: juegan con un apodo desde <a href="#/perfil">¿Quién juega?</a>.</p>
    <div class="rejilla-2">
      <section class="tarjeta pila">
        <h2>Iniciar sesión</h2>
        <form id="entrar" class="pila">
          <div><label for="e-correo">Correo</label><input id="e-correo" type="email" required autocomplete="email"></div>
          <div><label for="e-clave">Contraseña</label><input id="e-clave" type="password" required autocomplete="current-password"></div>
          <button class="btn">Entrar</button>
        </form>
        <button class="btn btn-mini" id="olvide">Olvidé mi contraseña</button>
      </section>
      <section class="tarjeta pila">
        <h2>Crear cuenta</h2>
        <form id="registro" class="pila">
          <div><label for="r-nombre">Nombre para mostrar</label><input id="r-nombre" required maxlength="60" placeholder="Ej.: Profe Marta, Familia Gómez"></div>
          <div><label for="r-rol">Soy</label><select id="r-rol"><option value="docente">Docente</option><option value="familia">Familia (mamá, papá, cuidador)</option></select></div>
          <div><label for="r-correo">Correo</label><input id="r-correo" type="email" required autocomplete="email"></div>
          <div><label for="r-clave">Contraseña (mínimo 8 caracteres)</label><input id="r-clave" type="password" minlength="8" required autocomplete="new-password"></div>
          <label class="check"><input type="checkbox" required> Acepto la <a href="#/privacidad">política de privacidad</a> y soy mayor de edad.</label>
          <button class="btn btn-menta">Crear cuenta</button>
        </form>
      </section>
    </div>`;

    $('#entrar', app).addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await nube.entrar({ correo: $('#e-correo', app).value.trim(), clave: $('#e-clave', app).value });
        aviso('¡Bienvenido!');
        pintar();
      } catch (err) {
        aviso(/confirm/i.test(err.message) ? 'Primero confirma tu correo (revisa tu bandeja de entrada).' : 'Correo o contraseña incorrectos.', 'mal');
      }
    });
    $('#registro', app).addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const r = await nube.registrar({
          nombre: $('#r-nombre', app).value.trim(), rol: $('#r-rol', app).value,
          correo: $('#r-correo', app).value.trim(), clave: $('#r-clave', app).value,
        });
        if (r.session) { aviso('¡Cuenta creada!'); pintar(); }
        else aviso('¡Cuenta creada! Revisa tu correo para confirmarla.');
      } catch (err) { aviso(`No se pudo crear la cuenta: ${err.message}`, 'mal'); }
    });
    $('#olvide', app).addEventListener('click', async () => {
      const correo = $('#e-correo', app).value.trim();
      if (!correo) return aviso('Escribe tu correo arriba primero.', 'mal');
      try { await nube.recuperarClave(correo); aviso('Te enviamos un correo para cambiar la contraseña.'); }
      catch (err) { aviso(err.message, 'mal'); }
    });
  };
  await pintar();
}
