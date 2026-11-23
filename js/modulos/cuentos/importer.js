// Importador de cuentos: analiza PDF, EPUB, TXT o fotos de un libro EN EL NAVEGADOR
// (sin servidor) y lo convierte en páginas {texto, imagen} para el lector.

import { comprimirImagen } from '../../nucleo/util.js';

const PDFJS = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs';
const PDFJS_WORKER = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs';
const JSZIP = 'https://esm.sh/jszip@3.10.1';
const TESSERACT = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.esm.min.js';

export const MAX_PAGINAS = 60;
const CHARS_POR_PAGINA = 650;

const limpiar = (t) => t.replace(/\s+/g, ' ').replace(/ ([.,;:!?»)])/g, '$1').trim();

/** Punto de entrada. `avance(texto)` informa el estado. */
export async function importar(archivos, { ocr = false, avance = () => {} } = {}) {
  const lista = [...archivos];
  if (!lista.length) throw new Error('No se seleccionó ningún archivo.');
  const primero = lista[0];
  const nombre = primero.name.toLowerCase();

  let resultado;
  if (lista.every((f) => f.type.startsWith('image/'))) resultado = await desdeImagenes(lista, avance);
  else if (nombre.endsWith('.pdf') || primero.type === 'application/pdf') resultado = await desdePDF(primero, avance);
  else if (nombre.endsWith('.epub')) resultado = await desdeEPUB(primero, avance);
  else if (nombre.endsWith('.txt') || primero.type.startsWith('text/')) resultado = desdeTexto(await primero.text(), primero.name);
  else throw new Error('Formato no soportado. Usa PDF, EPUB, TXT o imágenes (JPG/PNG).');

  if (ocr && resultado.paginas.some((p) => !p.texto && p.imagen)) {
    await reconocerTexto(resultado.paginas, avance);
  }
  return { ...resultado, ...analizar(resultado) };
}

// ---------- PDF ----------
async function desdePDF(archivo, avance) {
  avance('Abriendo el PDF…');
  const pdfjs = await import(PDFJS);
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  const doc = await pdfjs.getDocument({ data: await archivo.arrayBuffer() }).promise;
  const total = Math.min(doc.numPages, MAX_PAGINAS);
  const paginas = [];
  for (let n = 1; n <= total; n++) {
    avance(`Analizando página ${n} de ${total}…`);
    const pag = await doc.getPage(n);
    const base = pag.getViewport({ scale: 1 });
    const vista = pag.getViewport({ scale: Math.min(2, 1000 / base.width) });
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(vista.width);
    lienzo.height = Math.round(vista.height);
    const ctx = lienzo.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    await pag.render({ canvasContext: ctx, viewport: vista }).promise;
    const contenido = await pag.getTextContent();
    const texto = limpiar(contenido.items.map((it) => it.str + (it.hasEOL ? ' ' : '')).join(''));
    paginas.push({ texto, imagen: lienzo.toDataURL('image/jpeg', 0.78) });
  }
  let titulo = archivo.name.replace(/\.pdf$/i, '');
  try {
    const meta = await doc.getMetadata();
    if (meta?.info?.Title?.trim()) titulo = meta.info.Title.trim();
  } catch { /* sin metadatos */ }
  return { titulo, autor: '', paginas, recortado: doc.numPages > MAX_PAGINAS, totalOriginal: doc.numPages };
}

// ---------- EPUB ----------
async function desdeEPUB(archivo, avance) {
  avance('Abriendo el EPUB…');
  const { default: JSZip } = await import(JSZIP);
  const zip = await JSZip.loadAsync(await archivo.arrayBuffer());
  const xml = (t) => new DOMParser().parseFromString(t, 'application/xml');

  const contenedor = xml(await zip.file('META-INF/container.xml').async('text'));
  const rutaOPF = contenedor.querySelector('rootfile').getAttribute('full-path');
  const baseOPF = rutaOPF.includes('/') ? rutaOPF.slice(0, rutaOPF.lastIndexOf('/') + 1) : '';
  const opf = xml(await zip.file(rutaOPF).async('text'));

  const manifiesto = {};
  opf.querySelectorAll('manifest > item').forEach((it) => { manifiesto[it.getAttribute('id')] = it.getAttribute('href'); });
  const espina = [...opf.querySelectorAll('spine > itemref')].map((r) => manifiesto[r.getAttribute('idref')]).filter(Boolean);
  const titulo = opf.getElementsByTagName('dc:title')[0]?.textContent?.trim() || archivo.name.replace(/\.epub$/i, '');
  const autor = opf.getElementsByTagName('dc:creator')[0]?.textContent?.trim() || '';

  const resolver = (base, rel) => {
    const partes = (base + decodeURIComponent(rel.split('#')[0])).split('/');
    const salida = [];
    for (const p of partes) { if (p === '..') salida.pop(); else if (p !== '.') salida.push(p); }
    return salida.join('/');
  };

  const paginas = [];
  for (const [k, href] of espina.entries()) {
    if (paginas.length >= MAX_PAGINAS) break;
    avance(`Leyendo capítulo ${k + 1} de ${espina.length}…`);
    const ruta = resolver(baseOPF, href);
    const archivoCap = zip.file(ruta);
    if (!archivoCap) continue;
    const html = new DOMParser().parseFromString(await archivoCap.async('text'), 'text/html');
    const baseCap = ruta.includes('/') ? ruta.slice(0, ruta.lastIndexOf('/') + 1) : '';

    const imagenes = [];
    for (const img of html.querySelectorAll('img, image')) {
      const src = img.getAttribute('src') || img.getAttribute('href') || img.getAttribute('xlink:href');
      const f = src && zip.file(resolver(baseCap, src));
      if (f) {
        try { imagenes.push(await comprimirImagen(await f.async('blob'))); } catch { /* imagen dañada */ }
      }
    }
    const parrafos = [...html.querySelectorAll('p, h1, h2, h3, li')].map((p) => limpiar(p.textContent)).filter(Boolean);
    if (!parrafos.length) {
      const t = limpiar(html.body?.textContent || '');
      if (t) parrafos.push(t);
    }
    const trozos = agrupar(parrafos);
    const n = Math.max(trozos.length, imagenes.length);
    for (let i = 0; i < n && paginas.length < MAX_PAGINAS; i++) {
      paginas.push({ texto: trozos[i] || '', imagen: imagenes[i] || null });
    }
  }
  return { titulo, autor, paginas: paginas.filter((p) => p.texto || p.imagen), recortado: paginas.length >= MAX_PAGINAS };
}

// ---------- Texto e imágenes ----------
function desdeTexto(texto, nombre) {
  const parrafos = texto.split(/\n\s*\n|\r\n\s*\r\n/).map(limpiar).filter(Boolean);
  return { titulo: nombre.replace(/\.\w+$/, ''), autor: '', paginas: agrupar(parrafos).slice(0, MAX_PAGINAS).map((t) => ({ texto: t, imagen: null })) };
}

async function desdeImagenes(archivos, avance) {
  const orden = [...archivos].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  const paginas = [];
  for (const [i, f] of orden.slice(0, MAX_PAGINAS).entries()) {
    avance(`Preparando imagen ${i + 1} de ${orden.length}…`);
    paginas.push({ texto: '', imagen: await comprimirImagen(f, 1000, 0.8) });
  }
  return { titulo: 'Mi cuento', autor: '', paginas };
}

/** Junta párrafos cortos en páginas de tamaño cómodo para leer. */
function agrupar(parrafos) {
  const paginas = [];
  let actual = '';
  for (const p of parrafos) {
    if (actual && (actual.length + p.length) > CHARS_POR_PAGINA) { paginas.push(actual); actual = ''; }
    if (p.length > CHARS_POR_PAGINA * 1.5) {
      const frases = p.match(/[^.!?]+[.!?]*\s*/g) || [p];
      for (const f of frases) {
        if (actual && (actual.length + f.length) > CHARS_POR_PAGINA) { paginas.push(actual.trim()); actual = ''; }
        actual += f;
      }
    } else {
      actual += (actual ? ' ' : '') + p;
    }
  }
  if (actual.trim()) paginas.push(actual.trim());
  return paginas;
}

// ---------- OCR (libros escaneados o fotos) ----------
async function reconocerTexto(paginas, avance) {
  avance('Cargando el lector de texto (OCR)… puede tardar la primera vez.');
  const Tesseract = await import(TESSERACT);
  const crear = Tesseract.createWorker || Tesseract.default?.createWorker;
  const trabajador = await crear('spa');
  try {
    for (const [i, p] of paginas.entries()) {
      if (p.texto || !p.imagen) continue;
      avance(`Reconociendo texto en la página ${i + 1} de ${paginas.length}…`);
      const { data } = await trabajador.recognize(p.imagen);
      p.texto = limpiar(data.text || '');
    }
  } finally {
    await trabajador.terminate();
  }
}

// ---------- Análisis automático (gratis, sin IA de pago) ----------
const PALABRAS = {
  higiene: ['diente', 'dientes', 'muela', 'cepill', 'caries', 'boca', 'sonrisa', 'odont', 'crema dental', 'bacteria', 'encía'],
  alimentacion: ['fruta', 'verdura', 'comer', 'comida', 'aliment', 'azúcar', 'dulce', 'lonchera', 'leche', 'agua', 'desayuno'],
  familia: ['mamá', 'papá', 'abuel', 'familia', 'herman', 'tía', 'tío', 'casa', 'juntos'],
};

export function analizar({ paginas }) {
  const todo = paginas.map((p) => p.texto).join(' ').toLowerCase();
  const palabras = todo.split(/\s+/).filter(Boolean);
  const puntaje = Object.fromEntries(Object.entries(PALABRAS).map(([tema, lista]) =>
    [tema, lista.reduce((s, w) => s + (todo.split(w).length - 1), 0)]));
  const [tema, max] = Object.entries(puntaje).sort((a, b) => b[1] - a[1])[0];
  const conTexto = paginas.filter((p) => p.texto).length || 1;
  const porPagina = palabras.length / conTexto;
  const largas = palabras.filter((w) => w.length > 9).length / (palabras.length || 1);
  const edad = !palabras.length ? '' : porPagina < 45 && largas < 0.08 ? '3 a 6 años' : porPagina < 120 ? '6 a 9 años' : '9 años o más';
  const minutos = Math.max(1, Math.round(palabras.length / 90));
  return {
    analisis: {
      paginas: paginas.length,
      palabras: palabras.length,
      sinTexto: paginas.filter((p) => !p.texto).length,
      minutos,
      temaSugerido: max > 0 ? tema : 'otro',
      edadSugerida: edad,
    },
  };
}
