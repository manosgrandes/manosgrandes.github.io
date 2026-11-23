// Administración (solo cuentas en la tabla "admins"): cuentos por aprobar, foro reportado,
// mensajes de contacto, suscriptores del boletín y estadísticas generales.

import { nubeActiva } from '../../config.js';
import { esc, aviso, fechaCorta, aCSV, descargar, $ } from '../../nucleo/util.js';
import { JUEGOS } from '../../nucleo/store.js';

export async function render(app) {
  if (!nubeActiva()) {
    app.innerHTML = '<p class="nota nota-info">La administración se activa al conectar la nube (ver README.md). En modo local, los cuentos se gestionan desde la sección Cuentos de cada dispositivo.</p>';
    return;
  }
  const { nube } = await import('../../nucleo/cloud.js');
  const u = await nube.usuario().catch(() => null);
  if (!u?.admin) {
    app.innerHTML = '<p class="nota">Esta sección es solo para administradores. <a href="#/entrar?como=adulto">Iniciar sesión</a></p>';
    return;
  }

  const pintar = async () => {
    const [stats, pendientes, reportados, mensajes, docentes] = await Promise.all([
      nube.estadisticas(), nube.cuentosPendientes(), nube.reportados(), nube.mensajes(), nube.docentesPendientes(),
    ]);
    app.innerHTML = `
    <section class="rejilla" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
      ${[['👩‍🏫', 'Docentes', stats.docentes], ['👨‍👩‍👧', 'Familias', stats.familias], ['🏫', 'Aulas', stats.aulas], ['🧒', 'Estudiantes', stats.estudiantes], ['🎮', 'Actividades', stats.partidas], ['📚', 'Cuentos', stats.cuentos]]
        .map(([i, n, v]) => `<div class="tarjeta centro"><div style="font-size:2rem">${i}</div><strong style="font-size:1.6rem">${v}</strong><div class="suave">${n}</div></div>`).join('')}
    </section>
    <details class="tarjeta" style="margin-top:1rem"><summary>Actividades por juego</summary>
      <ul>${Object.entries(stats.por_actividad || {}).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([k, v]) => `<li>${esc(JUEGOS[k] || k)}: ${v}</li>`).join('') || '<li>Sin datos</li>'}</ul>
    </details>

    <section class="tarjeta pila" style="margin-top:1.5rem" id="docentes-pendientes">
      <h2>👩‍🏫 Docentes por aprobar (${docentes.length})</h2>
      <p class="suave chico">Verifica que sea un docente real (por ejemplo, por su correo institucional) antes de aprobarlo. Si lo rechazas, su cuenta queda como "familia".</p>
      ${docentes.map((d) => `<div class="fila entre" style="border-bottom:1px solid #EAF0FA;padding:.5rem 0">
        <div><strong>${esc(d.nombre || 'Sin nombre')}</strong> <span class="suave chico">· ${esc(d.correo)} · ${fechaCorta(d.creado)}</span></div>
        <div class="fila"><button class="btn btn-mini btn-menta" data-docente-si="${d.id}">✅ Aprobar</button>
          <button class="btn btn-mini btn-coral" data-docente-no="${d.id}">❌ Rechazar</button></div></div>`).join('') || '<p class="suave">No hay docentes pendientes.</p>'}
    </section>

    <section class="tarjeta pila" style="margin-top:1.5rem">
      <h2>📚 Cuentos por aprobar (${pendientes.length})</h2>
      <p class="suave chico">Revisa que el contenido sea apropiado para niños y que los derechos permitan publicarlo.</p>
      ${pendientes.map((c) => `<div class="fila entre" style="border-bottom:1px solid #EAF0FA;padding:.5rem 0">
        <div><strong>${esc(c.titulo)}</strong> <span class="suave chico">${esc(c.autor_texto)} · ${esc(c.edad)} · ${fechaCorta(c.creado)}</span><br><span class="chico">Derechos: ${esc(c.licencia)}</span></div>
        <div class="fila"><a class="btn btn-mini" href="#/app/cuentos/nube/${c.id}">👀 Revisar</a>
          <button class="btn btn-mini btn-menta" data-aprobar="${c.id}">✅ Aprobar</button>
          <button class="btn btn-mini btn-coral" data-rechazar="${c.id}">❌ Rechazar</button></div></div>`).join('') || '<p class="suave">No hay cuentos pendientes.</p>'}
    </section>

    <section class="tarjeta pila" style="margin-top:1.5rem">
      <h2>🚩 Foro: mensajes reportados</h2>
      ${[...reportados.temas.map((t) => ({ ...t, tabla: 'foro_temas', texto: `${t.titulo}: ${t.cuerpo}`, enlace: t.id })),
         ...reportados.resp.map((r) => ({ ...r, tabla: 'foro_respuestas', texto: r.cuerpo, enlace: r.tema_id }))]
        .map((m) => `<div class="fila entre" style="border-bottom:1px solid #EAF0FA;padding:.5rem 0">
          <div><span class="etiqueta">🚩 ${m.reportes}</span> <strong>${esc(m.autor_nombre)}</strong>: ${esc(m.texto.slice(0, 200))}</div>
          <div class="fila"><a class="btn btn-mini" href="#/app/foro/${m.enlace}">Ver</a><button class="btn btn-mini btn-coral" data-ocultar="${m.tabla}:${m.id}">Ocultar</button></div></div>`).join('') || '<p class="suave">No hay reportes.</p>'}
    </section>

    <section class="tarjeta pila" style="margin-top:1.5rem">
      <div class="fila entre"><h2 style="margin:0">✉️ Mensajes de contacto (${mensajes.length})</h2><button class="btn btn-mini" id="boletin">⬇️ Suscriptores del boletín (CSV)</button></div>
      ${mensajes.map((m) => `<details><summary>${esc(m.nombre)} · ${esc(m.perfil)} · ${fechaCorta(m.creado)}${m.boletin ? ' · 📰' : ''}</summary>
        <p><a href="mailto:${esc(m.correo)}">${esc(m.correo)}</a></p><p style="white-space:pre-wrap">${esc(m.mensaje)}</p>
        <button class="btn btn-mini btn-coral" data-borrar-msj="${m.id}">Borrar</button></details>`).join('') || '<p class="suave">Sin mensajes.</p>'}
      <p class="ayuda">Para enviar el boletín, descarga la lista y usa un servicio gratuito como Brevo o MailerLite (plan gratis), o el correo normal con copia oculta.</p>
    </section>`;

    app.querySelectorAll('[data-docente-si]').forEach((b) => b.addEventListener('click', async () => { await nube.aprobarDocente(b.dataset.docenteSi, true); aviso('Docente aprobado.'); pintar(); }));
    app.querySelectorAll('[data-docente-no]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('¿Rechazar esta cuenta de docente? Quedará como cuenta de familia.')) return;
      await nube.aprobarDocente(b.dataset.docenteNo, false); aviso('Cuenta cambiada a familia.'); pintar();
    }));
    app.querySelectorAll('[data-aprobar]').forEach((b) => b.addEventListener('click', async () => { await nube.cambiarEstadoCuento(b.dataset.aprobar, 'aprobado'); aviso('Cuento publicado.'); pintar(); }));
    app.querySelectorAll('[data-rechazar]').forEach((b) => b.addEventListener('click', async () => { await nube.cambiarEstadoCuento(b.dataset.rechazar, 'rechazado'); aviso('Cuento rechazado.'); pintar(); }));
    app.querySelectorAll('[data-ocultar]').forEach((b) => b.addEventListener('click', async () => { const [t, id] = b.dataset.ocultar.split(':'); await nube.ocultar(t, id); pintar(); }));
    app.querySelectorAll('[data-borrar-msj]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('¿Borrar este mensaje? No se puede deshacer.')) return;
      await nube.borrarMensaje(b.dataset.borrarMsj); pintar();
    }));
    $('#boletin', app).addEventListener('click', () => {
      const subs = mensajes.filter((m) => m.boletin);
      descargar('suscriptores-boletin.csv', aCSV([['Nombre', 'Correo', 'Perfil', 'Fecha'], ...subs.map((m) => [m.nombre, m.correo, m.perfil, fechaCorta(m.creado)])]), 'text/csv;charset=utf-8');
    });
  };
  try { await pintar(); } catch (e) { app.innerHTML = `<p class="nota nota-mal">No se pudo cargar: ${esc(e.message)}</p>`; }
}
