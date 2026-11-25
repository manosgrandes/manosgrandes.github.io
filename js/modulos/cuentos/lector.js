// Lector interactivo de cuentos: páginas, narración con resaltado, tamaño de letra y video.

import { CUENTOS_BASE } from './datos.js';
import { idb } from '../../nucleo/idb.js';
import { dientin } from '../../nucleo/character.js';
import { personaje, personajeDeEmoji } from '../../nucleo/personajes.js';
import { leer, detener, vozDisponible } from '../../nucleo/speech.js';
import { perfiles, progreso } from '../../nucleo/store.js';
import { esc, aviso, confeti, sonido, youtubeSinCookies } from '../../nucleo/util.js';
import { sesion } from '../../nucleo/sesion.js';

async function cargar(origen, id) {
  if (origen === 'base') return CUENTOS_BASE.find((c) => c.id === id);
  if (origen === 'local') return idb.uno('cuentos', id);
  const { nube } = await import('../../nucleo/cloud.js');
  const c = await nube.cuento(id);
  return c && { ...c, autor: c.autor_texto, video: c.video_url };
}

/**
 * Escena dibujada: los emojis de personas se convierten en personajes ilustrados,
 * y el protagonista del cuento aparece junto a Dientín aunque la página no lo nombre.
 */
function escena(e, cuento) {
  const reparto = cuento?.reparto || [];
  const elenco = [];
  const decoracion = [];
  for (const x of e.emojis || []) {
    const tipo = personajeDeEmoji(x);
    if (tipo && !elenco.some((p) => p.tipo === tipo)) elenco.push(reparto.find((p) => p.tipo === tipo) || { tipo });
    else if (!tipo) decoracion.push(x);
  }
  // El protagonista acompaña cada página (máximo tres personajes además de Dientín).
  if (reparto[0] && !elenco.some((p) => p.tipo === reparto[0].tipo)) elenco.unshift(reparto[0]);
  const lista = elenco.slice(0, 3);
  const animoPersonaje = (p) => (p.tipo === 'bacteria' ? (e.animo === 'triste' ? 'feliz' : 'sorpresa') : e.animo);
  const figuras = lista.map((p, i) => `<span class="escena-personaje" style="--i:${i}">${personaje(p.tipo, { animo: animoPersonaje(p), tam: p.tipo === 'bebe' ? 84 : 104, semilla: cuento?.id || '', nombre: p.nombre })}</span>`);
  const mitad = Math.ceil(figuras.length / 2);
  return `<div class="escena" style="background:${esc(e.fondo)}">
    <div class="emojis" aria-hidden="true">${decoracion.map((x) => `<span>${x}</span>`).join('')}</div>
    <div class="escena-elenco">
      ${figuras.slice(0, mitad).join('')}
      ${dientin({ tam: lista.length ? 140 : 170, animo: e.animo, cepillo: e.cepillo, clase: 'rebote' })}
      ${figuras.slice(mitad).join('')}
    </div>
  </div>`;
}

/** Envuelve cada palabra en un span con su posición, para resaltarla al narrar. */
function textoMarcable(texto) {
  let html = '';
  const re = /\S+/g;
  let m, ultimo = 0;
  while ((m = re.exec(texto))) {
    html += esc(texto.slice(ultimo, m.index)) + `<span data-i="${m.index}">${esc(m[0])}</span>`;
    ultimo = m.index + m[0].length;
  }
  return html + esc(texto.slice(ultimo));
}

export async function render(app, [origen, id]) {
  const esAdulto = sesion.actual()?.tipo === 'adulto';
  app.innerHTML = '<p class="tarjeta">Abriendo el cuento…</p>';
  const cuento = await cargar(origen, id);
  if (!cuento) {
    app.innerHTML = '<p class="tarjeta">No encontramos este cuento. <a href="#/app/cuentos">Volver a cuentos</a></p>';
    return;
  }
  const paginas = cuento.paginas || [];
  const video = youtubeSinCookies(cuento.video);
  let n = 0;
  let zoom = Number(localStorage.getItem('mgdc:zoom')) || 1;
  let autoLeer = false;
  let registrado = false;
  let vivo = true;

  app.innerHTML = `
  <div class="fila entre no-imprimir">
    <a class="btn btn-claro" href="#/app/cuentos">⬅ Cuentos</a>
    <div class="fila">
      ${origen === 'local' && esAdulto ? `<a class="btn btn-mini" href="#/app/cuentos/nuevo?editar=${esc(id)}">✏️ Editar</a><button class="btn btn-mini btn-coral" id="borrar">🗑️ Borrar</button>` : ''}
    </div>
  </div>
  <h1>${esc(cuento.titulo)}</h1>
  ${cuento.autor ? `<p class="suave">De: ${esc(cuento.autor)}</p>` : ''}
  ${video ? `<details><summary>🎬 Ver el video del cuento</summary><iframe class="video" src="${video}" title="Video: ${esc(cuento.titulo)}" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></details>` : ''}
  <div class="lector">
    <div id="pagina"></div>
    <div class="controles-lector no-imprimir">
      <button class="btn btn-claro" id="ant" aria-label="Página anterior">⬅ Atrás</button>
      <div class="fila">
        ${vozDisponible() ? '<button class="btn btn-menta" id="narrar">🔊 Leer en voz alta</button><label class="check chico" style="margin:0"><input type="checkbox" id="auto"> Pasar solo</label>' : ''}
        <button class="btn btn-mini" id="menos" aria-label="Letra más pequeña">A−</button>
        <button class="btn btn-mini" id="mas" aria-label="Letra más grande">A+</button>
      </div>
      <button class="btn" id="sig" aria-label="Página siguiente">Adelante ➡</button>
    </div>
    <p class="centro suave" id="contador" aria-live="polite"></p>
    ${cuento.licencia ? `<p class="chico suave centro">Licencia / derechos: ${esc(cuento.licencia)}</p>` : ''}
  </div>`;

  const $p = app.querySelector('#pagina');

  const terminar = async () => {
    if (registrado) return;
    registrado = true;
    confeti();
    sonido('fin');
    const nuevas = perfiles.activo() ? await progreso.registrar(`cuento:${id}`, paginas.length, 3) : [];
    nuevas.forEach((m) => aviso(`🏅 ¡Nueva medalla: ${m.nombre}!`));
  };

  const pintar = () => {
    detener();
    const pag = paginas[n];
    const visual = pag.escena ? escena(pag.escena, cuento) : pag.imagen ? `<img class="ilustracion" src="${esc(pag.imagen)}" alt="Ilustración de la página ${n + 1}">` : '';
    const clase = !pag.texto ? 'solo-imagen' : !visual ? 'solo-texto' : '';
    $p.innerHTML = `<article class="pagina ${clase}" style="--zoom:${zoom}">
      ${visual ? `<div>${visual}</div>` : ''}
      ${pag.texto ? `<div class="texto-cuento" id="texto">${textoMarcable(pag.texto)}</div>` : ''}
    </article>`;
    app.querySelector('#contador').textContent = `Página ${n + 1} de ${paginas.length}`;
    app.querySelector('#ant').disabled = n === 0;
    app.querySelector('#sig').textContent = n === paginas.length - 1 ? '🎉 ¡Terminé!' : 'Adelante ➡';
    if (autoLeer) narrar();
  };

  const narrar = async () => {
    const pag = paginas[n];
    if (!pag.texto) {
      if (autoLeer) setTimeout(() => vivo && autoLeer && avanzar(), 2500);
      return;
    }
    const spans = [...app.querySelectorAll('#texto span')];
    const pagina = n;
    await leer(pag.texto, {
      alPalabra: (i) => {
        spans.forEach((s) => s.classList.remove('leyendo'));
        const s = spans.filter((x) => Number(x.dataset.i) <= i).pop();
        spans.forEach((x) => { x.innerHTML = x.textContent; });
        if (s) s.innerHTML = `<mark>${esc(s.textContent)}</mark>`;
      },
    });
    spans.forEach((x) => { x.innerHTML = x.textContent; });
    if (vivo && autoLeer && pagina === n) setTimeout(() => vivo && autoLeer && pagina === n && avanzar(), 900);
  };

  const avanzar = () => {
    if (n < paginas.length - 1) { n++; pintar(); sonido('clic'); }
    else { terminar(); autoLeer = false; const a = app.querySelector('#auto'); if (a) a.checked = false; }
  };
  const retroceder = () => { if (n > 0) { n--; pintar(); } };

  app.querySelector('#sig').addEventListener('click', avanzar);
  app.querySelector('#ant').addEventListener('click', retroceder);
  app.querySelector('#narrar')?.addEventListener('click', narrar);
  app.querySelector('#auto')?.addEventListener('change', (e) => { autoLeer = e.target.checked; if (autoLeer) narrar(); });
  const cambiarZoom = (d) => {
    zoom = Math.min(1.8, Math.max(0.8, +(zoom + d).toFixed(1)));
    localStorage.setItem('mgdc:zoom', zoom);
    app.querySelector('.pagina').style.setProperty('--zoom', zoom);
  };
  app.querySelector('#mas').addEventListener('click', () => cambiarZoom(0.1));
  app.querySelector('#menos').addEventListener('click', () => cambiarZoom(-0.1));
  app.querySelector('#borrar')?.addEventListener('click', async () => {
    if (!confirm(`¿Borrar "${cuento.titulo}" de este dispositivo? No se puede deshacer.`)) return;
    await idb.borrar('cuentos', id);
    aviso('Cuento borrado.');
    location.hash = '#/app/cuentos';
  });

  const teclas = (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight') avanzar();
    if (e.key === 'ArrowLeft') retroceder();
  };
  let x0 = null;
  const toque0 = (e) => { x0 = e.touches[0].clientX; };
  const toque1 = (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60) (dx < 0 ? avanzar : retroceder)();
    x0 = null;
  };
  document.addEventListener('keydown', teclas);
  $p.addEventListener('touchstart', toque0, { passive: true });
  $p.addEventListener('touchend', toque1);

  if (!paginas.length) {
    $p.innerHTML = '<p class="tarjeta">Este cuento no tiene páginas.</p>';
    return () => document.removeEventListener('keydown', teclas);
  }
  pintar();
  return () => { vivo = false; detener(); document.removeEventListener('keydown', teclas); };
}
