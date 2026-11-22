// Cargar un cuento (PDF / EPUB / TXT / fotos) o crearlo página por página.
// Se guarda en el dispositivo (IndexedDB) y, si hay nube y cuenta, se envía a la
// biblioteca compartida, donde un administrador lo aprueba antes de publicarlo.

import { importar, analizar, MAX_PAGINAS } from '../importer.js';
import { idb } from '../idb.js';
import { TEMAS } from '../data/cuentos.js';
import { nubeActiva } from '../config.js';
import { esc, aviso, uid, comprimirImagen, youtubeSinCookies } from '../util.js';

const LICENCIAS = [
  'Cuento propio (lo escribimos nosotros)',
  'Dominio público',
  'Creative Commons (indicar cuál en el autor/fuente)',
  'Tengo permiso escrito del autor o editorial',
  'Uso privado: solo en este dispositivo',
];

export async function render(app) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const editarId = params.get('editar');
  let cuento = editarId ? await idb.uno('cuentos', editarId) : null;
  cuento ??= { id: uid(), titulo: '', autor: '', edad: '', tema: 'otro', licencia: '', video: '', paginas: [], creado: new Date().toISOString() };

  let usuario = null;
  if (nubeActiva()) {
    try { usuario = await (await import('../cloud.js')).nube.usuario(); } catch { /* sin conexión */ }
  }

  app.innerHTML = `
  <a class="btn btn-claro no-imprimir" href="#/cuentos">⬅ Cuentos</a>
  <h1>${editarId ? '✏️ Editar cuento' : '➕ Cargar o crear un cuento'}</h1>

  <div class="nota nota-mal pila">
    <p style="margin:0"><strong>⚖️ Derechos de autor:</strong> la mayoría de libros que se descargan de internet tienen dueño.
    Solo se pueden <strong>compartir</strong> cuentos propios, de dominio público, con licencia Creative Commons o con permiso del autor.
    Para uso privado, guárdalo solo en este dispositivo.</p>
  </div>

  ${editarId ? '' : `
  <section class="tarjeta pila" style="margin-top:1rem">
    <h2>1. Sube el archivo</h2>
    <p>Acepta <strong>PDF, EPUB, TXT</strong> o varias <strong>fotos</strong> de las páginas de un libro (JPG/PNG). Se analiza aquí mismo, sin enviarse a ningún servidor. Máximo ${MAX_PAGINAS} páginas.</p>
    <input type="file" id="archivo" accept=".pdf,.epub,.txt,image/*,application/pdf,application/epub+zip,text/plain" multiple>
    <label class="check"><input type="checkbox" id="ocr"> Leer el texto de páginas escaneadas o fotos (OCR). Es más lento y puede tener errores.</label>
    <div class="fila"><button class="btn" id="analizar">🔍 Analizar archivo</button><span id="estado" class="suave" aria-live="polite"></span></div>
    <p class="suave chico">¿No tienes archivo? <button class="btn btn-mini" id="desde-cero">Crear un cuento desde cero</button></p>
  </section>`}

  <section class="tarjeta pila ${cuento.paginas.length ? '' : 'oculto'}" id="editor" style="margin-top:1rem"></section>`;

  const editor = app.querySelector('#editor');

  const pintarEditor = (analisis) => {
    editor.classList.remove('oculto');
    editor.innerHTML = `
      <h2>2. Revisa y completa</h2>
      ${analisis ? `<div class="nota nota-info"><strong>🔍 Análisis automático:</strong> ${analisis.paginas} páginas, ${analisis.palabras} palabras,
        unos ${analisis.minutos} min de lectura${analisis.edadSugerida ? `, edad sugerida: ${analisis.edadSugerida}` : ''}, tema sugerido: ${TEMAS[analisis.temaSugerido].nombre}.
        ${analisis.sinTexto ? `<br>${analisis.sinTexto} páginas no tienen texto (son imágenes): se mostrarán como imagen y no se narrarán. Puedes escribir el texto abajo o usar OCR.` : ''}</div>` : ''}
      <form id="datos" class="rejilla-2">
        <div><label for="titulo">Título</label><input id="titulo" required maxlength="120" value="${esc(cuento.titulo)}"></div>
        <div><label for="autor">Autor / fuente</label><input id="autor" maxlength="120" value="${esc(cuento.autor)}" placeholder="Ej.: Hans Christian Andersen, StoryWeaver (CC BY 4.0)"></div>
        <div><label for="edad">Edad recomendada</label><input id="edad" maxlength="40" value="${esc(cuento.edad)}" placeholder="Ej.: 3 a 6 años"></div>
        <div><label for="tema">Tema</label><select id="tema">${Object.entries(TEMAS).map(([k, t]) => `<option value="${k}" ${cuento.tema === k ? 'selected' : ''}>${t.nombre}</option>`).join('')}</select></div>
        <div><label for="licencia">Derechos</label><select id="licencia" required><option value="">— Escoge una opción —</option>${LICENCIAS.map((l) => `<option ${cuento.licencia === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div><label for="video">Video en YouTube (opcional)</label><input id="video" type="url" value="${esc(cuento.video)}" placeholder="https://www.youtube.com/watch?v=…"><p class="ayuda">Se muestra en modo sin cookies. Útil para cuentos animados largos.</p></div>
      </form>
      <h3>Páginas (${cuento.paginas.length})</h3>
      <div id="paginas" class="pila"></div>
      <button class="btn btn-claro" id="agregar">➕ Agregar página</button>
      <hr>
      <div class="fila">
        <button class="btn btn-menta btn-grande" id="guardar">💾 Guardar en este dispositivo</button>
        ${nubeActiva() ? (usuario
          ? `<button class="btn btn-sol" id="compartir">☁️ Enviar a la biblioteca compartida</button>`
          : '<p class="suave chico" style="margin:0">Para compartirlo con todos, <a href="#/cuenta">inicia sesión</a> como docente o familia.</p>') : ''}
      </div>
      <p id="estado-guardar" class="suave" aria-live="polite"></p>`;
    pintarPaginas();
    editor.querySelector('#agregar').addEventListener('click', () => { leerDatos(); cuento.paginas.push({ texto: '', imagen: null }); pintarPaginas(); });
    editor.querySelector('#guardar').addEventListener('click', guardarLocal);
    editor.querySelector('#compartir')?.addEventListener('click', compartir);
  };

  const pintarPaginas = () => {
    const cont = editor.querySelector('#paginas');
    cont.innerHTML = cuento.paginas.map((p, i) => `
      <div class="tarjeta" style="display:grid;grid-template-columns:minmax(0,160px) 1fr;gap:1rem;align-items:start">
        <div>
          ${p.imagen ? `<img src="${esc(p.imagen)}" alt="Página ${i + 1}" style="border-radius:10px;width:100%">` : '<div class="escena" style="background:var(--cielo-claro);min-height:110px">🖼️</div>'}
          <label class="btn btn-mini" style="margin-top:.4rem;cursor:pointer">📷 Imagen<input type="file" accept="image/*" data-img="${i}" class="sr"></label>
          ${p.imagen ? `<button class="btn btn-mini" data-quitarimg="${i}">Quitar</button>` : ''}
        </div>
        <div>
          <label for="t${i}">Página ${i + 1}</label>
          <textarea id="t${i}" rows="4" data-texto="${i}" maxlength="3000">${esc(p.texto)}</textarea>
          <div class="fila" style="margin-top:.4rem">
            <button class="btn btn-mini" data-subir="${i}" ${i === 0 ? 'disabled' : ''}>⬆</button>
            <button class="btn btn-mini" data-bajar="${i}" ${i === cuento.paginas.length - 1 ? 'disabled' : ''}>⬇</button>
            <button class="btn btn-mini btn-coral" data-quitar="${i}">🗑️ Quitar página</button>
          </div>
        </div>
      </div>`).join('') || '<p class="suave">Sin páginas todavía.</p>';
    editor.querySelector('h3').textContent = `Páginas (${cuento.paginas.length})`;

    cont.querySelectorAll('[data-texto]').forEach((t) => t.addEventListener('input', () => { cuento.paginas[t.dataset.texto].texto = t.value; }));
    cont.querySelectorAll('[data-img]').forEach((inp) => inp.addEventListener('change', async () => {
      if (!inp.files[0]) return;
      cuento.paginas[inp.dataset.img].imagen = await comprimirImagen(inp.files[0]);
      pintarPaginas();
    }));
    const mover = (i, d) => { const p = cuento.paginas; [p[i], p[i + d]] = [p[i + d], p[i]]; pintarPaginas(); };
    cont.querySelectorAll('[data-subir]').forEach((b) => b.addEventListener('click', () => mover(+b.dataset.subir, -1)));
    cont.querySelectorAll('[data-bajar]').forEach((b) => b.addEventListener('click', () => mover(+b.dataset.bajar, 1)));
    cont.querySelectorAll('[data-quitar]').forEach((b) => b.addEventListener('click', () => { cuento.paginas.splice(+b.dataset.quitar, 1); pintarPaginas(); }));
    cont.querySelectorAll('[data-quitarimg]').forEach((b) => b.addEventListener('click', () => { cuento.paginas[+b.dataset.quitarimg].imagen = null; pintarPaginas(); }));
  };

  const leerDatos = () => {
    const v = (id) => editor.querySelector(`#${id}`)?.value.trim() ?? '';
    Object.assign(cuento, { titulo: v('titulo'), autor: v('autor'), edad: v('edad'), tema: v('tema') || 'otro', licencia: v('licencia'), video: v('video') });
  };

  const validar = (paraCompartir) => {
    leerDatos();
    cuento.paginas = cuento.paginas.filter((p) => p.texto.trim() || p.imagen);
    if (!cuento.titulo) return aviso('Escribe el título del cuento.', 'mal'), false;
    if (!cuento.paginas.length) return aviso('El cuento necesita al menos una página.', 'mal'), false;
    if (!cuento.licencia) return aviso('Indica los derechos del cuento.', 'mal'), false;
    if (cuento.video && !youtubeSinCookies(cuento.video)) return aviso('El enlace de video debe ser de YouTube.', 'mal'), false;
    if (paraCompartir && cuento.licencia.startsWith('Uso privado')) {
      aviso('Este cuento está marcado como uso privado: no se puede compartir.', 'mal');
      return false;
    }
    return true;
  };

  async function guardarLocal() {
    if (!validar(false)) return;
    try {
      await idb.guardar('cuentos', { ...cuento, actualizado: new Date().toISOString() });
      aviso('¡Cuento guardado en este dispositivo!');
      location.hash = `#/cuentos/local/${cuento.id}`;
    } catch (e) {
      aviso('No se pudo guardar. Puede que el dispositivo no tenga espacio.', 'mal');
    }
  }

  async function compartir() {
    if (!validar(true)) return;
    if (!confirm('Confirmo que tengo derecho a compartir este cuento públicamente y que es apropiado para niñas y niños.')) return;
    const estado = editor.querySelector('#estado-guardar');
    try {
      const { nube } = await import('../cloud.js');
      const r = await nube.subirCuento(cuento, (i, t) => { estado.textContent = `Subiendo página ${i} de ${t}…`; });
      await idb.guardar('cuentos', { ...cuento, actualizado: new Date().toISOString() });
      estado.textContent = '';
      aviso(r.estado === 'aprobado' ? '¡Cuento publicado!' : '¡Enviado! Un administrador lo revisará antes de publicarlo.');
      location.hash = '#/cuentos';
    } catch (e) {
      estado.textContent = `No se pudo subir: ${e.message}`;
    }
  }

  app.querySelector('#analizar')?.addEventListener('click', async () => {
    const archivos = app.querySelector('#archivo').files;
    const estado = app.querySelector('#estado');
    const boton = app.querySelector('#analizar');
    if (!archivos.length) return aviso('Primero escoge un archivo.', 'mal');
    boton.disabled = true;
    try {
      const r = await importar(archivos, { ocr: app.querySelector('#ocr').checked, avance: (t) => { estado.textContent = t; } });
      cuento = { ...cuento, titulo: r.titulo, autor: r.autor, paginas: r.paginas, tema: r.analisis.temaSugerido, edad: r.analisis.edadSugerida };
      estado.textContent = r.recortado ? `Listo. El libro era largo: se tomaron las primeras ${MAX_PAGINAS} páginas.` : 'Listo.';
      pintarEditor(r.analisis);
      editor.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      console.error(e);
      estado.textContent = `No se pudo analizar: ${e.message}`;
    } finally {
      boton.disabled = false;
    }
  });
  app.querySelector('#desde-cero')?.addEventListener('click', () => {
    cuento.paginas = [{ texto: '', imagen: null }];
    pintarEditor(null);
  });

  if (cuento.paginas.length) pintarEditor(editarId ? analizar(cuento).analisis : null);
}
