// Foro de familias y docentes (requiere nube). Lectura pública, escritura con cuenta.

import { nubeActiva } from '../config.js';
import { esc, aviso, fechaCorta, $ } from '../util.js';

const CATEGORIAS = { general: 'General', higiene: 'Higiene bucal', alimentacion: 'Alimentación', aula: 'Ideas para el aula', familia: 'En familia' };

export async function render(app, [temaId]) {
  if (!nubeActiva()) {
    app.innerHTML = `<h1>💬 Foro</h1><p class="nota nota-info">El foro de familias y docentes se activa cuando el sitio se conecta a la nube gratuita. Mientras tanto, puedes escribirnos en <a href="#/contacto">Contacto</a>.</p>`;
    return;
  }
  const { nube } = await import('../cloud.js');
  let u = null;
  try { u = await nube.usuario(); } catch { /* sin conexión */ }

  const reglas = '<p class="chico suave">Normas: respeto, nada de datos personales de niñas y niños (nombres completos, fotos, colegios), ni publicidad. Esto no reemplaza una consulta profesional.</p>';

  if (temaId) {
    const pintarTema = async () => {
      const { tema, respuestas } = await nube.tema(temaId);
      if (!tema) { app.innerHTML = '<p class="tarjeta">Tema no encontrado. <a href="#/foro">Volver</a></p>'; return; }
      app.innerHTML = `
      <a class="btn btn-claro" href="#/foro">⬅ Foro</a>
      <h1>${esc(tema.titulo)}</h1>
      <p class="suave">${esc(tema.autor_nombre)} · ${fechaCorta(tema.creado)} · <span class="etiqueta">${CATEGORIAS[tema.categoria] || 'General'}</span></p>
      <div class="mensaje-foro">${esc(tema.cuerpo)}</div>
      ${acciones('foro_temas', tema, u)}
      <h2 style="margin-top:1.5rem">Respuestas (${respuestas.length})</h2>
      <div class="pila">${respuestas.map((r) => `<div><div class="mensaje-foro">${esc(r.cuerpo)}</div><p class="chico suave">${esc(r.autor_nombre)} · ${fechaCorta(r.creado)}</p>${acciones('foro_respuestas', r, u)}</div>`).join('') || '<p class="suave">Aún no hay respuestas.</p>'}</div>
      ${u ? `<form id="responder" class="tarjeta pila" style="margin-top:1rem"><label for="cuerpo">Tu respuesta</label><textarea id="cuerpo" rows="4" required maxlength="3000"></textarea>${reglas}<button class="btn">Responder</button></form>`
        : '<p class="nota" style="margin-top:1rem"><a href="#/cuenta">Inicia sesión</a> para responder.</p>'}`;
      $('#responder', app)?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try { await nube.responder(temaId, $('#cuerpo', app).value.trim()); pintarTema(); }
        catch (err) { aviso(err.message, 'mal'); }
      });
      conectarAcciones(app, nube, pintarTema);
    };
    return pintarTema();
  }

  const temas = await nube.temas();
  app.innerHTML = `
  <h1>💬 Foro de familias y docentes</h1>
  <p class="suave">Comparte ideas, dudas y experiencias sobre la salud bucal y la alimentación de los niños.</p>
  ${u ? `<details class="tarjeta"><summary>➕ Nuevo tema</summary>
      <form id="nuevo" class="pila" style="margin-top:1rem">
        <div><label for="titulo">Título</label><input id="titulo" required minlength="3" maxlength="140"></div>
        <div><label for="categoria">Categoría</label><select id="categoria">${Object.entries(CATEGORIAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
        <div><label for="cuerpo">Mensaje</label><textarea id="cuerpo" rows="5" required maxlength="5000"></textarea></div>
        ${reglas}
        <button class="btn btn-menta">Publicar</button>
      </form></details>`
    : '<p class="nota"><a href="#/cuenta">Inicia sesión o crea una cuenta</a> para publicar.</p>'}
  <div class="pila" style="margin-top:1rem">
    ${temas.map((t) => `<a class="tarjeta tema" href="#/foro/${t.id}"><h3 style="margin:0">${esc(t.titulo)}</h3>
      <p class="chico suave" style="margin:.3rem 0 0">${esc(t.autor_nombre)} · ${fechaCorta(t.creado)} · ${CATEGORIAS[t.categoria] || 'General'} · 💬 ${t.foro_respuestas?.[0]?.count ?? 0}</p></a>`).join('')
      || '<p class="suave">Aún no hay temas. ¡Abre el primero!</p>'}
  </div>`;
  $('#nuevo', app)?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const t = await nube.crearTema({ titulo: $('#titulo', app).value.trim(), categoria: $('#categoria', app).value, cuerpo: $('#cuerpo', app).value.trim() });
      location.hash = `#/foro/${t.id}`;
    } catch (err) { aviso(err.message, 'mal'); }
  });
}

function acciones(tabla, item, u) {
  if (!u) return '';
  const propio = item.autor_id === u.id;
  return `<div class="fila" style="margin-top:.3rem">
    ${!propio ? `<button class="btn btn-mini" data-reportar="${tabla}:${item.id}">🚩 Reportar</button>` : ''}
    ${propio ? `<button class="btn btn-mini" data-borrar="${tabla}:${item.id}">🗑️ Borrar</button>` : ''}
    ${u.admin && !propio ? `<button class="btn btn-mini btn-coral" data-ocultar="${tabla}:${item.id}">Ocultar (admin)</button>` : ''}
  </div>`;
}

function conectarAcciones(app, nube, recargar) {
  app.querySelectorAll('[data-reportar]').forEach((b) => b.addEventListener('click', async () => {
    const [t, id] = b.dataset.reportar.split(':');
    await nube.reportar(t, id);
    aviso('Gracias. Un administrador lo revisará.');
    b.disabled = true;
  }));
  app.querySelectorAll('[data-ocultar]').forEach((b) => b.addEventListener('click', async () => {
    const [t, id] = b.dataset.ocultar.split(':');
    await nube.ocultar(t, id);
    t === 'foro_temas' ? (location.hash = '#/foro') : recargar();
  }));
  app.querySelectorAll('[data-borrar]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('¿Borrar tu mensaje? No se puede deshacer.')) return;
    const [t, id] = b.dataset.borrar.split(':');
    try { await nube.borrarForo(t, id); } catch (err) { return aviso(err.message, 'mal'); }
    t === 'foro_temas' ? (location.hash = '#/foro') : recargar();
  }));
}
