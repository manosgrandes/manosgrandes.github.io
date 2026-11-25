// Narración en voz alta con la voz del navegador (Web Speech API, gratis, sin servidor).

const sintesis = window.speechSynthesis;
export const vozDisponible = () => Boolean(sintesis);

// Prefiere voces naturales (neuronales) en español y femeninas para Sofi; si no hay, cualquiera en español.
const NATURALES = /natural|online|neural|google/i;
const FEMENINAS = /dalia|elvira|paloma|salom|sabina|helena|laura|paulina|m[oó]nica|lupe|camila|ximena|elena|francisca|catalina|valentina|female|mujer/i;
function vozEspanol() {
  const voces = sintesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('es'));
  if (!voces.length) return null;
  const puntaje = (v) => (NATURALES.test(v.name) ? 4 : 0) + (FEMENINAS.test(v.name) ? 2 : 0)
    + (/es[-_](CO|419|MX|US)/i.test(v.lang) ? 1 : 0);
  return voces.sort((a, b) => puntaje(b) - puntaje(a))[0];
}
// Algunas plataformas cargan las voces tarde.
sintesis?.addEventListener?.('voiceschanged', () => {});

/**
 * Lee un texto. `alPalabra(inicio, largo)` permite resaltar la palabra actual.
 * Devuelve una promesa que se resuelve al terminar o al detener.
 */
export function leer(texto, { alPalabra, velocidad = 0.9, tono = 1.1 } = {}) {
  if (!sintesis || !texto) return Promise.resolve();
  detener();
  return new Promise((ok) => {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-CO';
    const voz = vozEspanol();
    if (voz) u.voice = voz;
    u.rate = velocidad;
    u.pitch = tono;
    if (alPalabra) {
      u.onboundary = (e) => {
        if (e.name === 'word' || e.charLength) alPalabra(e.charIndex, e.charLength || (texto.slice(e.charIndex).match(/^\S+/)?.[0].length ?? 1));
      };
    }
    u.onend = u.onerror = () => ok();
    sintesis.speak(u);
  });
}

export function detener() {
  sintesis?.cancel();
}

/** Botón pequeño "Escuchar" para cualquier texto (se activa con data-leer). */
export const botonLeer = (texto, etiqueta = '🔊 Escuchar') =>
  vozDisponible() ? `<button type="button" class="btn btn-mini" data-leer="${String(texto).replace(/"/g, '&quot;')}">${etiqueta}</button>` : '';

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-leer]');
  if (b) leer(b.dataset.leer);
});
