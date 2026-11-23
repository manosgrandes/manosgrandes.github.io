// Biblioteca: cuentos de Dientín + cuentos guardados en el dispositivo + biblioteca compartida (nube).

import { CUENTOS_BASE, TEMAS } from './datos.js';
import { idb } from '../../nucleo/idb.js';
import { nubeActiva } from '../../config.js';
import { perfiles, progreso } from '../../nucleo/store.js';
import { esc, aviso } from '../../nucleo/util.js';
import { dientinDice } from '../../nucleo/character.js';

const tarjeta = ({ href, titulo, tema, edad, icono, color, portada, extra = '', leido }) => `
  <a class="tarjeta cuento-tarjeta" href="${href}">
    <div class="tapa" style="background:${color || 'var(--cielo-claro)'}">${portada ? `<img src="${esc(portada)}" alt="" loading="lazy">` : icono || '📖'}</div>
    <div class="info">
      <span class="etiqueta ${TEMAS[tema]?.clase || 'e-otro'}">${TEMAS[tema]?.nombre || 'Otros'}</span>
      ${leido ? '<span class="etiqueta e-alimentacion">✓ Leído</span>' : ''}
      <h3 style="margin:.5rem 0 .2rem">${esc(titulo)}</h3>
      ${edad ? `<p class="chico suave" style="margin:0">${esc(edad)}</p>` : ''}${extra}
    </div>
  </a>`;

export async function render(app) {
  const p = perfiles.activo();
  const leidos = p ? progreso.resumen(p.id).mejor : {};
  let filtro = 'todos';

  app.innerHTML = `
  <div class="fila" style="justify-content:flex-end"><a class="btn btn-sol" href="#/app/cuentos/nuevo">➕ Cargar o crear un cuento</a></div>
  ${dientinDice('Escoge un cuento. Puedo leértelo en voz alta. ¡Léanlo en familia!')}
  <div class="fila" style="margin:1.2rem 0" role="group" aria-label="Filtrar por tema">
    <button class="btn btn-mini" data-f="todos">Todos</button>
    ${Object.entries(TEMAS).map(([k, t]) => `<button class="btn btn-mini" data-f="${k}">${t.nombre}</button>`).join('')}
  </div>
  <h2>Cuentos de Dientín</h2>
  <div class="rejilla" id="base"></div>
  <div id="compartidos"></div>
  <div id="locales"></div>`;

  const pintarBase = () => {
    app.querySelector('#base').innerHTML = CUENTOS_BASE.filter((c) => filtro === 'todos' || c.tema === filtro)
      .map((c) => tarjeta({ ...c, href: `#/app/cuentos/base/${c.id}`, leido: leidos[`cuento:${c.id}`] })).join('') || '<p class="suave">No hay cuentos de este tema.</p>';
  };

  let locales = [];
  let compartidos = [];
  const pintarLocales = () => {
    const lista = locales.filter((c) => filtro === 'todos' || c.tema === filtro);
    app.querySelector('#locales').innerHTML = `
      <h2 style="margin-top:2rem">Cuentos guardados en este dispositivo</h2>
      ${lista.length ? `<div class="rejilla">${lista.map((c) => tarjeta({
        href: `#/app/cuentos/local/${c.id}`, titulo: c.titulo, tema: c.tema, edad: c.edad, portada: c.paginas.find((x) => x.imagen)?.imagen,
        leido: leidos[`cuento:${c.id}`], extra: `<p class="chico suave" style="margin:.3rem 0 0">${c.paginas.length} páginas · solo aquí</p>`,
      })).join('')}</div>` : '<p class="suave">Aún no has cargado cuentos. Puedes subir un PDF, EPUB, TXT o fotos de un libro.</p>'}`;
  };
  const pintarCompartidos = () => {
    if (!nubeActiva()) return;
    const lista = compartidos.filter((c) => filtro === 'todos' || c.tema === filtro);
    app.querySelector('#compartidos').innerHTML = `
      <h2 style="margin-top:2rem">Biblioteca compartida</h2>
      ${lista.length ? `<div class="rejilla">${lista.map((c) => tarjeta({
        href: `#/app/cuentos/nube/${c.id}`, titulo: c.titulo, tema: c.tema, edad: c.edad, portada: c.portada, leido: leidos[`cuento:${c.id}`],
        extra: c.autor_texto ? `<p class="chico suave" style="margin:.3rem 0 0">${esc(c.autor_texto)}</p>` : '',
      })).join('')}</div>` : '<p class="suave">Todavía no hay cuentos aprobados en la biblioteca compartida.</p>'}`;
  };

  app.querySelectorAll('[data-f]').forEach((b) => b.addEventListener('click', () => {
    filtro = b.dataset.f;
    app.querySelectorAll('[data-f]').forEach((x) => x.classList.toggle('btn-sol', x === b));
    pintarBase(); pintarLocales(); pintarCompartidos();
  }));
  app.querySelector('[data-f="todos"]').classList.add('btn-sol');

  pintarBase();
  try { locales = (await idb.todos('cuentos')).sort((a, b) => b.creado.localeCompare(a.creado)); } catch { locales = []; }
  pintarLocales();
  if (nubeActiva()) {
    app.querySelector('#compartidos').innerHTML = '<p class="suave">Cargando biblioteca compartida…</p>';
    try {
      const { nube } = await import('../../nucleo/cloud.js');
      compartidos = await nube.cuentosAprobados();
    } catch {
      aviso('No se pudo cargar la biblioteca compartida.', 'mal');
    }
    pintarCompartidos();
  }
}
