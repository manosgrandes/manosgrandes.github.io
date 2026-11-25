// Motor del landing: utilidades puras, carga de librerías, scroll suave y lienzos.
// Todo lo animado es función del progreso del scroll, así el recorrido funciona igual hacia atrás.

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
/** Tramo a→b como 0–1. */
export const span = (a, b, v) => clamp((v - a) / (b - a));
export const smooth = (a, b, v) => { const k = span(a, b, v); return k * k * (3 - 2 * k); };
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2);
/** Inercia que se siente igual a 60 o 120 Hz. */
export const inercia = (delta) => 1 - Math.exp(-delta / 260);

/** Aleatoriedad con semilla (mulberry32): el mundo es idéntico en cada visita. */
export function azar(semilla = 1) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mezcla dos colores #rrggbb. */
export function mezclar(c1, c2, k) {
  const a = parseInt(c1.slice(1), 16);
  const b = parseInt(c2.slice(1), 16);
  const r = Math.round(lerp(a >> 16, b >> 16, k));
  const g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, k));
  const bl = Math.round(lerp(a & 255, b & 255, k));
  return `rgb(${r},${g},${bl})`;
}
/** Igual que mezclar pero devuelve #rrggbb (para volver a mezclar). */
export function mezclarHex(c1, c2, k) {
  const a = parseInt(c1.slice(1), 16);
  const b = parseInt(c2.slice(1), 16);
  const n = (Math.round(lerp(a >> 16, b >> 16, k)) << 16) | (Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, k)) << 8) | Math.round(lerp(a & 255, b & 255, k));
  return `#${n.toString(16).padStart(6, '0')}`;
}
/** Color a lo largo de una lista de paradas [[t, '#hex'], ...]. */
export function rampa(paradas, t) {
  for (let i = 1; i < paradas.length; i++) {
    if (t <= paradas[i][0]) {
      const [t0, c0] = paradas[i - 1];
      const [t1, c1] = paradas[i];
      return mezclarHex(c0, c1, smooth(t0, t1, t));
    }
  }
  return paradas[paradas.length - 1][1];
}

const CDN_GSAP = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/';
const CDN_LENIS = 'https://cdn.jsdelivr.net/npm/lenis@1.3.11/dist/lenis.mjs';

/** Carga GSAP (ScrollTrigger + SplitText) y Lenis. Si no hay internet ni caché, rechaza. */
export async function cargarLibrerias() {
  const [{ gsap }, { ScrollTrigger }, { SplitText }, { default: Lenis }] = await Promise.all([
    import(`${CDN_GSAP}index.js`),
    import(`${CDN_GSAP}ScrollTrigger.js`),
    import(`${CDN_GSAP}SplitText.js`),
    import(CDN_LENIS),
  ]);
  gsap.registerPlugin(ScrollTrigger, SplitText);
  return { gsap, ScrollTrigger, SplitText, Lenis };
}

/**
 * Scroll suave con un solo reloj: Lenis avanza en el ticker de GSAP y avisa a ScrollTrigger.
 * Devuelve { lenis, destruir }.
 */
export function iniciarScroll({ gsap, ScrollTrigger, Lenis }) {
  ScrollTrigger.config({ ignoreMobileResize: true });
  const lenis = new Lenis({ lerp: 0.1, anchors: { duration: 1.6 } });
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  const alRefrescar = () => lenis.resize();
  ScrollTrigger.addEventListener('refresh', alRefrescar);

  // Los enlaces "#/ruta" son del enrutador, no anclas: que Lenis no intente buscarlos.
  const rutas = (e) => {
    const a = e.target.closest?.('a[href^="#/"]');
    if (a) e.stopPropagation();
  };
  document.addEventListener('click', rutas);

  return {
    lenis,
    destruir() {
      document.removeEventListener('click', rutas);
      ScrollTrigger.removeEventListener('refresh', alRefrescar);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    },
  };
}

/**
 * Lienzo con resolución adaptable: dpr máximo 1.5; mide 40 cuadros y, si el promedio pasa
 * de 24 ms, baja la resolución × 0.8 (mínimo 0.5) sin volver a subirla.
 */
export function lienzo(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let escala = 1;
  let muestras = [];
  const estado = { ctx, w: 0, h: 0, dpr: 1 };
  const ajustar = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * escala;
    estado.w = Math.max(1, r.width);
    estado.h = Math.max(1, r.height);
    estado.dpr = dpr;
    canvas.width = Math.round(estado.w * dpr);
    canvas.height = Math.round(estado.h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  estado.ajustar = ajustar;
  /** Llamar una vez por cuadro dibujado con el delta en ms. */
  estado.medir = (delta) => {
    if (escala <= 0.5 || delta > 200) return;
    muestras.push(delta);
    if (muestras.length < 40) return;
    const prom = muestras.reduce((a, b) => a + b, 0) / muestras.length;
    muestras = [];
    if (prom > 24) { escala = Math.max(0.5, escala * 0.8); ajustar(); }
  };
  ajustar();
  return estado;
}

/** Progreso 0–1 del tramo fijado (sticky) de una sección. */
export function progresoFijo(seccion) {
  const r = seccion.getBoundingClientRect();
  const vh = window.innerHeight;
  return clamp(-r.top / Math.max(1, r.height - vh));
}

/** ¿Está la sección (o parte de ella) en pantalla? */
export function enPantalla(el, margen = 0) {
  const r = el.getBoundingClientRect();
  return r.bottom > -margen && r.top < window.innerHeight + margen;
}
