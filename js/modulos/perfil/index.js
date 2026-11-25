// "¿Quién juega?": perfiles de niños en el dispositivo, medallas, unión a un aula y ranking.

import { perfiles, progreso, medallas, todasLasMedallas, AVATARES, JUEGOS } from '../../nucleo/store.js';
import { nubeActiva } from '../../config.js';
import { esc, aviso, estrellas, $, fechaCorta, avatarHTML } from '../../nucleo/util.js';
import { dientinDice } from '../../nucleo/character.js';

export function render(app) {
  const pintar = () => {
    const lista = perfiles.lista();
    const activo = perfiles.activo();
    app.innerHTML = `
    ${dientinDice(lista.length ? 'Toca tu perfil para jugar. Tus estrellas se guardan en este dispositivo.' : 'Crea tu perfil con un apodo divertido. ¡No escribas tu nombre completo!')}
    <div class="perfiles" style="margin:1.5rem 0">
      ${lista.map((p) => `<button class="perfil-btn ${activo?.id === p.id ? 'activo' : ''}" data-activar="${p.id}">
          <span class="ava">${avatarHTML(p.avatar)}</span>${esc(p.apodo)}<br><span class="estrellas chico">★ ${progreso.resumen(p.id).totalEstrellas}</span></button>`).join('')}
    </div>

    <details ${lista.length ? '' : 'open'}>
      <summary>➕ Crear un perfil nuevo</summary>
      <form id="nuevo" class="pila" style="margin-top:1rem">
        <div><label for="apodo">Apodo</label><input id="apodo" name="apodo" required maxlength="20" placeholder="Ej.: Tigre Veloz" autocomplete="off"></div>
        <fieldset style="border:0;padding:0"><legend><strong>Escoge tu avatar</strong></legend>
          <div class="avatares">${AVATARES.map((a, i) => `<label><input type="radio" name="avatar" value="${a}" ${i === 0 ? 'checked' : ''}><span>${avatarHTML(a)}</span></label>`).join('')}</div>
        </fieldset>
        <button class="btn btn-menta">Crear perfil</button>
      </form>
    </details>

    ${activo ? detalle(activo) : ''}`;

    app.querySelectorAll('[data-activar]').forEach((b) => b.addEventListener('click', () => {
      perfiles.activar(b.dataset.activar);
      aviso('¡Perfil seleccionado!');
      pintar();
    }));
    $('#nuevo', app).addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(e.target);
      const apodo = String(d.get('apodo')).trim();
      if (!apodo) return;
      perfiles.crear({ apodo, avatar: d.get('avatar') });
      aviso(`¡Bienvenido, ${apodo}!`);
      pintar();
    });
    if (activo) conectarDetalle(activo, pintar);
  };
  pintar();
}

function detalle(p) {
  const r = progreso.resumen(p.id);
  const ganadas = medallas(p.id).map((m) => m.id);
  const ultimos = [...r.regs].reverse().slice(0, 8);
  return `
  <section class="tarjeta pila" style="margin-top:1.5rem">
    <h2 class="perfil-titulo">${avatarHTML(p.avatar)} ${esc(p.apodo)}</h2>
    <p><strong>${r.totalEstrellas}</strong> estrellas · <strong>${r.partidas}</strong> actividades realizadas</p>
    <h3>Medallas</h3>
    <div class="rejilla" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">
      ${todasLasMedallas.map((m) => `<div class="medalla ${ganadas.includes(m.id) ? '' : 'bloqueada'}"><span class="icono">${m.icono}</span>${m.nombre}</div>`).join('')}
    </div>
    ${ultimos.length ? `<h3>Lo último que hiciste</h3><ul>${ultimos.map((u) => `<li>${esc(JUEGOS[u.actividad] || u.actividad.replace('cuento:', 'Cuento: '))} — ${estrellas(u.estrellas)} <span class="suave chico">${fechaCorta(u.fecha)}</span></li>`).join('')}</ul>` : ''}

    <h3>Mi aula</h3>
    ${nubeActiva() ? `
      ${p.aulaCodigo ? `<p>Estás en el aula <strong>${esc(p.aulaNombre || p.aulaCodigo)}</strong> (código ${esc(p.aulaCodigo)}). Tu profe puede ver tus estrellas.</p>
        <div class="fila"><button class="btn btn-mini" id="ver-ranking">🏆 Ver tabla de estrellas del aula</button><button class="btn btn-mini" id="salir-aula">Salir del aula</button></div>
        <ol class="ranking" id="ranking" style="padding:0;list-style:none"></ol>`
      : `<form id="unirse" class="fila"><input name="codigo" maxlength="6" placeholder="Código del aula (6 letras)" style="max-width:260px;text-transform:uppercase" required><button class="btn">Unirme</button></form>
        <p class="ayuda">Tu profe te da el código. Así podrá ver tus avances.</p>`}`
    : '<p class="suave">Las aulas se activan cuando el sitio se conecta a la nube. Mientras tanto, tu profe puede ver tus avances en este mismo dispositivo desde el Panel docente.</p>'}

    <h3>Tabla de estrellas de este dispositivo</h3>
    <ol class="ranking" style="padding:0;list-style:none">
      ${perfiles.lista().map((x) => ({ x, e: progreso.resumen(x.id).totalEstrellas })).sort((a, b) => b.e - a.e)
        .map(({ x, e }, i) => `<li><span>${i + 1}. ${avatarHTML(x.avatar)} ${esc(x.apodo)}</span><strong>★ ${e}</strong></li>`).join('')}
    </ol>

    <details><summary>⚙️ Opciones del perfil</summary>
      <div class="fila" style="margin-top:.8rem">
        <button class="btn btn-mini" id="sonido">${localStorage.getItem('mgdc:sonido') === 'no' ? '🔇 Activar sonidos' : '🔊 Silenciar sonidos'}</button>
        <button class="btn btn-mini btn-coral" id="borrar">🗑️ Borrar este perfil</button>
      </div>
    </details>
  </section>`;
}

function conectarDetalle(p, pintar) {
  $('#borrar')?.addEventListener('click', () => {
    if (confirm(`¿Borrar el perfil "${p.apodo}" y todas sus estrellas de este dispositivo? No se puede deshacer.`)) {
      perfiles.borrar(p.id);
      pintar();
    }
  });
  $('#sonido')?.addEventListener('click', () => {
    localStorage.setItem('mgdc:sonido', localStorage.getItem('mgdc:sonido') === 'no' ? 'si' : 'no');
    pintar();
  });
  $('#unirse')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = String(new FormData(e.target).get('codigo')).trim().toUpperCase();
    try {
      const { nube } = await import('../../nucleo/cloud.js');
      const nombre = await nube.nombreAula(codigo);
      if (!nombre) return aviso('No encontramos esa aula. Revisa el código.', 'mal');
      perfiles.actualizar(p.id, { aulaCodigo: codigo, aulaNombre: nombre });
      aviso(`¡Te uniste a ${nombre}!`);
      pintar();
    } catch (err) {
      aviso('No hay conexión con la nube. Inténtalo más tarde.', 'mal');
    }
  });
  $('#salir-aula')?.addEventListener('click', () => {
    perfiles.actualizar(p.id, { aulaCodigo: null, aulaNombre: null });
    pintar();
  });
  $('#ver-ranking')?.addEventListener('click', async () => {
    const ol = $('#ranking');
    ol.innerHTML = '<li>Cargando…</li>';
    try {
      const { nube } = await import('../../nucleo/cloud.js');
      const filas = await nube.ranking(p.aulaCodigo);
      ol.innerHTML = filas.length
        ? filas.map((f, i) => `<li><span>${i + 1}. ${esc(f.apodo)}${f.apodo === p.apodo ? ' (tú)' : ''}</span><strong>★ ${f.estrellas}</strong></li>`).join('')
        : '<li>Aún no hay estrellas en el aula. ¡Sé el primero!</li>';
    } catch {
      ol.innerHTML = '<li>No se pudo cargar. Revisa tu conexión.</li>';
    }
  });
}
