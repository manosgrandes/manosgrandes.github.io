// Utilidades pequeñas compartidas por todas las vistas.

const MAPA_ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto para insertarlo de forma segura dentro de HTML. */
export const esc = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => MAPA_ESCAPE[c]);

export const $ = (selector, raiz = document) => raiz.querySelector(selector);
export const $$ = (selector, raiz = document) => [...raiz.querySelectorAll(selector)];

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const barajar = (lista) => {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
};

export const fechaCorta = (iso) =>
  new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

/** Mensaje breve en la esquina de la pantalla. */
export function aviso(texto, tipo = 'ok') {
  let zona = $('#avisos');
  if (!zona) {
    zona = document.createElement('div');
    zona.id = 'avisos';
    zona.setAttribute('role', 'status');
    zona.setAttribute('aria-live', 'polite');
    document.body.append(zona);
  }
  const el = document.createElement('div');
  el.className = `aviso aviso-${tipo}`;
  el.textContent = texto;
  zona.append(el);
  setTimeout(() => el.classList.add('saliendo'), 3200);
  setTimeout(() => el.remove(), 3700);
}

/** Descarga un texto como archivo. */
export function descargar(nombre, contenido, tipo = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = Object.assign(document.createElement('a'), { href: url, download: nombre });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Convierte filas en CSV compatible con Excel (separador ; y BOM UTF-8). */
export function aCSV(filas) {
  const celda = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return '﻿' + filas.map((f) => f.map(celda).join(';')).join('\r\n');
}

/** Estrellas visuales (1 a 3). */
export const estrellas = (n, total = 3) =>
  `<span class="estrellas" aria-label="${n} de ${total} estrellas">${'★'.repeat(n)}${'☆'.repeat(Math.max(0, total - n))}</span>`;

/** Convierte un enlace de YouTube en uno incrustable sin cookies. */
export function youtubeSinCookies(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

/** Sonidos cortos generados con Web Audio (sin archivos). */
let ctxAudio;
export function sonido(tipo = 'bien') {
  if (localStorage.getItem('mgdc:sonido') === 'no') return;
  try {
    ctxAudio ??= new (window.AudioContext || window.webkitAudioContext)();
    const notas = { bien: [660, 880], mal: [300, 220], fin: [523, 659, 784, 1046], clic: [500] }[tipo] || [500];
    notas.forEach((f, i) => {
      const osc = ctxAudio.createOscillator();
      const gan = ctxAudio.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      const t = ctxAudio.currentTime + i * 0.11;
      gan.gain.setValueAtTime(0.0001, t);
      gan.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      gan.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(gan).connect(ctxAudio.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  } catch { /* sin audio disponible */ }
}

/** Lanza confeti sencillo con emojis. */
export function confeti() {
  const piezas = ['⭐', '🦷', '✨', '<img class="emo" src="icons/cepillo.svg" alt="">', '🎉'];
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('span');
    p.className = 'confeti';
    p.innerHTML = piezas[i % piezas.length];
    p.style.left = `${Math.random() * 100}vw`;
    p.style.animationDelay = `${Math.random() * 0.6}s`;
    document.body.append(p);
    setTimeout(() => p.remove(), 2600);
  }
}

/** Reduce una imagen (File/Blob/dataURL) a JPEG liviano. */
export async function comprimirImagen(fuente, ancho = 1000, calidad = 0.8) {
  const url = typeof fuente === 'string' ? fuente : URL.createObjectURL(fuente);
  const img = await new Promise((ok, mal) => {
    const i = new Image();
    i.onload = () => ok(i);
    i.onerror = mal;
    i.src = url;
  });
  const escala = Math.min(1, ancho / img.width);
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * escala);
  c.height = Math.round(img.height * escala);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  if (typeof fuente !== 'string') URL.revokeObjectURL(url);
  return c.toDataURL('image/jpeg', calidad);
}

/** Avatar del perfil como HTML: el diente se muestra con la ilustración de Dientín. */
export const avatarHTML = (a) =>
  a === '🦷' ? '<img class="ava-dientin" src="img/dientin-nuevo.webp" alt="Dientín">' : esc(a);
