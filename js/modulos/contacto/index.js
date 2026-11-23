// Contacto: Supabase si está activo; si no, Formspree; si no, el programa de correo.

import { CONFIG, nubeActiva } from '../../config.js';
import { aviso, $ } from '../../nucleo/util.js';
import { dientinDice } from '../../nucleo/character.js';

export function render(app) {
  const hayCanal = nubeActiva() || CONFIG.formspreeEndpoint || CONFIG.correoContacto;
  app.innerHTML = `
  ${dientinDice('¿Tienes preguntas, ideas o quieres usar el sitio en tu colegio? ¡Escríbenos!')}
  <form id="form" class="tarjeta pila" style="max-width:640px;margin-top:1.5rem">
    <div><label for="nombre">Nombre</label><input id="nombre" required maxlength="80" autocomplete="name"></div>
    <div><label for="correo">Correo</label><input id="correo" type="email" required maxlength="120" autocomplete="email"></div>
    <div><label for="perfil">Soy</label><select id="perfil"><option>Docente</option><option>Familia</option><option>Profesional de la salud</option><option>Otro</option></select></div>
    <div><label for="mensaje">Mensaje</label><textarea id="mensaje" rows="5" required maxlength="3000"></textarea></div>
    <label class="check"><input type="checkbox" id="boletin"> Quiero recibir novedades y nuevos cuentos por correo.</label>
    <label class="check"><input type="checkbox" required> Acepto el tratamiento de mis datos según la <a href="#/privacidad">política de privacidad</a>.</label>
    <input type="text" id="web" name="web" tabindex="-1" autocomplete="off" class="sr" aria-hidden="true">
    <button class="btn btn-menta" ${hayCanal ? '' : 'disabled'}>Enviar</button>
    ${hayCanal ? '' : '<p class="nota">El formulario aún no está configurado (ver README.md).</p>'}
  </form>`;

  $('#form', app).addEventListener('submit', async (e) => {
    e.preventDefault();
    if ($('#web', app).value) return; // trampa para robots
    const m = {
      nombre: $('#nombre', app).value.trim(), correo: $('#correo', app).value.trim(),
      perfil: $('#perfil', app).value, mensaje: $('#mensaje', app).value.trim(), boletin: $('#boletin', app).checked,
    };
    const boton = e.target.querySelector('button');
    boton.disabled = true;
    try {
      if (nubeActiva()) {
        await (await import('../../nucleo/cloud.js')).nube.enviarContacto(m);
      } else if (CONFIG.formspreeEndpoint) {
        const r = await fetch(CONFIG.formspreeEndpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(m) });
        if (!r.ok) throw new Error('No se pudo enviar');
      } else {
        location.href = `mailto:${CONFIG.correoContacto}?subject=${encodeURIComponent('Contacto Manos Grandes Dientes Chiquitos')}&body=${encodeURIComponent(m.mensaje)}`;
        return;
      }
      e.target.reset();
      aviso('¡Mensaje enviado! Gracias por escribirnos.');
    } catch {
      aviso('No se pudo enviar. Revisa tu conexión e inténtalo de nuevo.', 'mal');
    } finally {
      boton.disabled = false;
    }
  });
}
