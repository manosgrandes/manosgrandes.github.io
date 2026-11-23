// Narración en voz alta con la voz del navegador (Web Speech API, gratis, sin servidor).

const sintesis = window.speechSynthesis;
export const vozDisponible = () => Boolean(sintesis);

function vozEspanol() {
  const voces = sintesis.getVoices();
  return voces.find((v) => /es[-_](CO|419|MX|US)/i.test(v.lang))
    || voces.find((v) => v.lang?.toLowerCase().startsWith('es'))
    || null;
}
// Algunas plataformas cargan las voces tarde.
sintesis?.addEventListener?.('voiceschanged', () => {});

/**
 * Lee un texto. `alPalabra(inicio, largo)` permite resaltar la palabra actual.
 * Devuelve una promesa que se resuelve al terminar o al detener.
 */
export function leer(texto, { alPalabra, velocidad = 0.9 } = {}) {
  if (!sintesis || !texto) return Promise.resolve();
  detener();
  return new Promise((ok) => {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = 'es-CO';
    const voz = vozEspanol();
    if (voz) u.voice = voz;
    u.rate = velocidad;
    u.pitch = 1.1;
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
