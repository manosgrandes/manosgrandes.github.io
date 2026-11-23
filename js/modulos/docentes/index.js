// Panel docente: seguimiento por aula (nube) y seguimiento de los perfiles del dispositivo (local).

import { perfiles, progreso, JUEGOS } from '../../nucleo/store.js';
import { nubeActiva } from '../../config.js';
import { esc, aviso, aCSV, descargar, fechaCorta, $ } from '../../nucleo/util.js';

const ACTIVIDADES = Object.keys(JUEGOS);

/** Convierte registros [{actividad, estrellas, puntaje, fecha}] en una fila resumen. */
function resumir(regs) {
  const mejor = {};
  for (const r of regs) if (!mejor[r.actividad] || r.estrellas > mejor[r.actividad]) mejor[r.actividad] = r.estrellas;
  const cuentos = Object.keys(mejor).filter((k) => k.startsWith('cuento:')).length;
  const total = Object.values(mejor).reduce((s, e) => s + e, 0);
  const ultima = regs.map((r) => r.fecha).sort().pop();
  return { mejor, cuentos, total, partidas: regs.length, ultima };
}

function tabla(filas) {
  if (!filas.length) return '<p class="suave">Todavía no hay estudiantes con actividad.</p>';
  return `<div class="tabla-env"><table>
    <thead><tr><th>Apodo</th><th>★ Total</th><th>Actividades</th>${ACTIVIDADES.map((a) => `<th title="${JUEGOS[a]}">${JUEGOS[a].split(' ').slice(0, 2).join(' ')}</th>`).join('')}<th>Cuentos leídos</th><th>Última vez</th>${filas[0].borrar ? '<th></th>' : ''}</tr></thead>
    <tbody>${filas.map((f) => `<tr>
      <td><strong>${esc(f.apodo)}</strong></td><td>${f.r.total}</td><td>${f.r.partidas}</td>
      ${ACTIVIDADES.map((a) => `<td>${f.r.mejor[a] !== undefined ? '★'.repeat(f.r.mejor[a]) || '0' : '—'}</td>`).join('')}
      <td>${f.r.cuentos}</td><td>${f.r.ultima ? fechaCorta(f.r.ultima) : '—'}</td>
      ${f.borrar ? `<td><button class="btn btn-mini btn-coral" data-borrar-est="${f.id}" aria-label="Quitar a ${esc(f.apodo)}">🗑️</button></td>` : ''}
    </tr>`).join('')}</tbody></table></div>`;
}

function csv(filas, nombre) {
  const cab = ['Apodo', 'Estrellas total', 'Actividades', ...ACTIVIDADES.map((a) => JUEGOS[a]), 'Cuentos leídos', 'Última actividad'];
  descargar(`${nombre}.csv`, aCSV([cab, ...filas.map((f) => [
    f.apodo, f.r.total, f.r.partidas, ...ACTIVIDADES.map((a) => f.r.mejor[a] ?? ''), f.r.cuentos, f.r.ultima ? fechaCorta(f.r.ultima) : '',
  ])]), 'text/csv;charset=utf-8');
}

export async function render(app) {
  app.innerHTML = `
  <div id="nube"></div>
  <section class="tarjeta pila" style="margin-top:1.5rem">
    <div class="fila entre"><h2 style="margin:0">📱 Perfiles en este dispositivo</h2>
      <div class="fila"><button class="btn btn-mini" id="csv-local">⬇️ Excel (CSV)</button><button class="btn btn-mini" onclick="print()">🖨️ Imprimir</button></div></div>
    <p class="suave">Útil si los niños comparten una tableta o computador del colegio. Funciona sin internet.</p>
    <div id="tabla-local"></div>
  </section>`;

  const filasLocales = perfiles.lista().map((p) => ({ apodo: `${p.avatar} ${p.apodo}`, r: resumir(progreso.de(p.id)) }))
    .sort((a, b) => b.r.total - a.r.total);
  $('#tabla-local', app).innerHTML = tabla(filasLocales);
  $('#csv-local', app).addEventListener('click', () => csv(filasLocales, 'progreso-dispositivo'));

  const zona = $('#nube', app);
  if (!nubeActiva()) {
    zona.innerHTML = `<div class="nota nota-info">Las <strong>aulas en línea</strong> (ver el avance de cada niño desde cualquier dispositivo) se activan al conectar el sitio a la nube gratuita (Supabase). Mientras tanto, usa el seguimiento por dispositivo de abajo.</div>`;
    return;
  }

  zona.innerHTML = '<p class="suave">Cargando…</p>';
  const { nube } = await import('../../nucleo/cloud.js');
  let u = null;
  try { u = await nube.usuario(); } catch { /* sin conexión */ }
  if (!u) {
    zona.innerHTML = `<section class="tarjeta pila"><h2>🏫 Mis aulas</h2><p>Inicia sesión con tu cuenta de docente para crear aulas y ver el avance de tus estudiantes.</p><p><a class="btn" href="#/entrar?como=adulto">Iniciar sesión o crear cuenta</a></p></section>`;
    return;
  }
  if (u.rol === 'docente' && !u.aprobado) {
    zona.innerHTML = `<section class="tarjeta pila"><h2>⏳ Tu cuenta de docente está en revisión</h2>
      <p>Un administrador debe aprobarla antes de que puedas crear aulas. Mientras tanto puedes usar las guías, los cuentos, el foro y el seguimiento de este dispositivo.</p>
      <p class="suave chico">Si ya te aprobaron, cierra sesión y vuelve a entrar.</p></section>`;
    return;
  }
  if (u.rol !== 'docente') {
    zona.innerHTML = `<p class="nota">Tu cuenta es de <strong>familia</strong>. Las aulas son para cuentas de docente.</p>`;
    return;
  }

  const pintar = async (aulaSel) => {
    const aulas = await nube.misAulas();
    const actual = aulas.find((a) => a.id === aulaSel) || aulas[0];
    zona.innerHTML = `
    <section class="tarjeta pila">
      <div class="fila entre"><h2 style="margin:0">🏫 Mis aulas</h2><span class="suave">Hola, ${esc(u.nombre)}</span></div>
      <form id="nueva" class="fila"><input name="nombre" required maxlength="80" placeholder="Nombre del aula (ej.: Transición B)" style="max-width:340px"><button class="btn btn-menta">➕ Crear aula</button></form>
      ${aulas.length ? `
        <div class="fila" role="tablist">${aulas.map((a) => `<button class="btn btn-mini ${a.id === actual.id ? 'btn-sol' : ''}" data-aula="${a.id}">${esc(a.nombre)}</button>`).join('')}</div>
        <div class="nota">
          <p style="margin:0">Código del aula <strong>${esc(actual.nombre)}</strong>: <span style="font-size:1.8rem;letter-spacing:.2em;font-weight:900">${esc(actual.codigo)}</span></p>
          <p style="margin:.3rem 0 0" class="chico">Cada niño entra a <strong>¿Quién juega?</strong>, crea su perfil con un apodo y escribe este código en "Mi aula".</p>
        </div>
        <div class="fila"><button class="btn btn-mini" id="csv-aula">⬇️ Descargar Excel (CSV)</button><button class="btn btn-mini" id="recargar">🔄 Actualizar</button><button class="btn btn-mini btn-coral" id="borrar-aula">Borrar aula</button></div>
        <div id="tabla-aula"><p class="suave">Cargando estudiantes…</p></div>`
      : '<p class="suave">Aún no tienes aulas. Crea la primera.</p>'}
    </section>`;

    $('#nueva', zona).addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const a = await nube.crearAula(String(new FormData(e.target).get('nombre')).trim());
        aviso(`Aula creada. Código: ${a.codigo}`);
        pintar(a.id);
      } catch (err) { aviso(`No se pudo crear: ${err.message}`, 'mal'); }
    });
    zona.querySelectorAll('[data-aula]').forEach((b) => b.addEventListener('click', () => pintar(b.dataset.aula)));
    if (!actual) return;

    const ests = await nube.seguimientoAula(actual.id);
    const filas = ests.map((e) => ({ id: e.id, apodo: e.apodo, r: resumir(e.progreso || []), borrar: true })).sort((a, b) => b.r.total - a.r.total);
    $('#tabla-aula', zona).innerHTML = tabla(filas);
    zona.querySelectorAll('[data-borrar-est]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('¿Quitar a este estudiante y borrar su progreso del aula? No se puede deshacer.')) return;
      await nube.borrarEstudiante(b.dataset.borrarEst);
      pintar(actual.id);
    }));
    $('#csv-aula', zona).addEventListener('click', () => csv(filas, `progreso-${actual.codigo}`));
    $('#recargar', zona).addEventListener('click', () => pintar(actual.id));
    $('#borrar-aula', zona).addEventListener('click', async () => {
      if (!confirm(`¿Borrar el aula "${actual.nombre}" con todos sus estudiantes y su progreso? No se puede deshacer.`)) return;
      await nube.borrarAula(actual.id);
      aviso('Aula borrada.');
      pintar();
    });
  };
  try { await pintar(); } catch (e) { zona.innerHTML = `<p class="nota nota-mal">No se pudo cargar el panel: ${esc(e.message)}</p>`; }
}
