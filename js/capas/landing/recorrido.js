// Escena 3 · El recorrido de Dientín: vista lateral con planos de parallax, de día a noche.
// Dientín avanza, frena en tres paradas (come, cepilla, sueña) y vuelve a arrancar.

import { clamp, lerp, smooth, span, inercia } from './motor.js';
import { cepilloConRuedas, cepillo, manoArriba, PIELES, enfermeraPatina } from './dibujos.js';

const RUTA = [[0, -0.55], [0.15, -0.03], [0.27, 0.03], [0.45, 0.97], [0.56, 1.03], [0.79, 1.98], [1, 2]];
/** Posición en "paradas" (0, 1, 2) según el progreso, con smooth entre puntos. */
export function posicion(q) {
  for (let i = 1; i < RUTA.length; i++) {
    const [p1, v1] = RUTA[i];
    const [p0, v0] = RUTA[i - 1];
    if (q <= p1) return lerp(v0, v1, smooth(p0, p1, q));
  }
  return RUTA[RUTA.length - 1][1];
}

export const PARADAS = [
  { id: 'come', momento: 'dia', titulo: 'Come', texto: 'Frutas, verduras y mucha agua para crecer sano y fuerte.', ventana: [0.06, 0.33] },
  { id: 'cepilla', momento: 'tarde', titulo: 'Cepilla', texto: 'En la mañana y en la noche, con un adulto que te ayude.', ventana: [0.37, 0.62] },
  { id: 'suena', momento: 'noche', titulo: 'Sueña', texto: 'Dientes limpios, un cuento y a dormir.', ventana: [0.7, 1.2] },
];

const svgUrl = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
const TILE = 1200;
const tiles = {
  colinas: svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="300" viewBox="0 0 ${TILE} 300"><path d="M0 300 L0 170 C150 60 300 90 420 150 C540 210 640 80 800 90 C960 100 1050 190 ${TILE} 170 L${TILE} 300 Z" fill="#6E63A8" fill-opacity=".16"/><path d="M0 300 L0 230 C200 160 330 220 520 200 C700 180 820 130 1000 190 C1100 220 1160 220 ${TILE} 230 L${TILE} 300 Z" fill="#6E63A8" fill-opacity=".14"/></svg>`),
  nubes: svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="260" viewBox="0 0 ${TILE} 260"><g fill="#fff"><circle cx="120" cy="80" r="34"/><circle cx="165" cy="64" r="44"/><circle cx="215" cy="84" r="30"/><rect x="100" y="80" width="140" height="34" rx="17"/><circle cx="720" cy="150" r="26"/><circle cx="756" cy="134" r="36"/><circle cx="796" cy="152" r="24"/><rect x="700" y="148" width="116" height="28" rx="14"/></g></svg>`),
  pueblo: svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="260" viewBox="0 0 ${TILE} 260"><g fill="#4B4680" fill-opacity=".26">${[[40, 120, 90], [150, 80, 140], [260, 110, 100], [420, 70, 160], [560, 130, 90], [680, 90, 130], [820, 60, 170], [960, 120, 100], [1080, 90, 130]].map(([x, w, hgt]) => `<path d="M${x} 260 L${x} ${260 - hgt * 0.75} C${x} ${260 - hgt * 1.02} ${x + w * 0.42} ${260 - hgt * 1.02} ${x + w * 0.5} ${260 - hgt * 0.88} C${x + w * 0.58} ${260 - hgt * 1.02} ${x + w} ${260 - hgt * 1.02} ${x + w} ${260 - hgt * 0.75} L${x + w} 260 Z"/>`).join('')}</g></svg>`),
  ventanas: svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="260" viewBox="0 0 ${TILE} 260"><g fill="#FFE7A8">${[[40, 120, 90], [150, 80, 140], [260, 110, 100], [420, 70, 160], [560, 130, 90], [680, 90, 130], [820, 60, 170], [960, 120, 100], [1080, 90, 130]].map(([x, w, hgt]) => `<circle cx="${x + w * 0.3}" cy="${260 - hgt * 0.5}" r="7"/><circle cx="${x + w * 0.7}" cy="${260 - hgt * 0.5}" r="7"/>`).join('')}</g></svg>`),
  cerca: svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="220" viewBox="0 0 ${TILE} 220"><g fill="#3E7F63" fill-opacity=".30"><circle cx="90" cy="120" r="56"/><rect x="82" y="150" width="16" height="70" rx="8"/><circle cx="520" cy="100" r="70"/><rect x="511" y="150" width="18" height="70" rx="9"/><circle cx="930" cy="130" r="48"/><rect x="923" y="160" width="14" height="60" rx="7"/></g><g fill="#fff" fill-opacity=".55">${Array.from({ length: 30 }, (_, i) => `<rect x="${i * 40 + 8}" y="176" width="14" height="44" rx="7"/>`).join('')}<rect x="0" y="188" width="${TILE}" height="8" rx="4"/></g></svg>`),
  calle: svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="200" viewBox="0 0 ${TILE} 200" preserveAspectRatio="none"><rect width="${TILE}" height="18" fill="#91D9B5"/><rect y="18" width="${TILE}" height="182" fill="#D9D3EC"/><rect y="18" width="${TILE}" height="10" fill="#C9C1E2"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${i * 150 + 30}" y="110" width="80" height="10" rx="5" fill="#fff" fill-opacity=".8"/>`).join('')}</svg>`),
  frente: svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${TILE * 1.5}" height="320" viewBox="0 0 ${TILE * 1.5} 320"><g fill="#7FCBA4"><circle cx="120" cy="300" r="110"/><circle cx="230" cy="320" r="90"/></g><g fill="#fff" fill-opacity=".8"><circle cx="900" cy="250" r="40"/><circle cx="960" cy="290" r="26"/><circle cx="860" cy="300" r="18"/></g><g fill="#F2B4CC"><circle cx="1500" cy="310" r="120"/><circle cx="1620" cy="330" r="80"/></g></svg>`),
};

/** Planos de parallax: [clase, factor, tile, ancho del tile]. */
const PLANOS = [
  ['rc-colinas', 0.08, tiles.colinas, TILE],
  ['rc-nubes', 0.16, tiles.nubes, TILE],
  ['rc-pueblo', 0.34, tiles.pueblo, TILE],
  ['rc-ventanas', 0.34, tiles.ventanas, TILE],
  ['rc-cerca', 0.62, tiles.cerca, TILE],
];

function cocina() {
  const p = PIELES[1];
  return `<svg class="rc-cuarto" viewBox="0 0 800 480" aria-hidden="true" focusable="false">
    <defs><clipPath id="rc-c1"><rect width="800" height="480" rx="44"/></clipPath></defs>
    <g clip-path="url(#rc-c1)">
      <rect width="800" height="480" fill="#FFF5DC"/><rect y="400" width="800" height="80" fill="#F2D6A8"/><rect y="396" width="800" height="10" fill="#E9C48E"/>
      <rect x="520" y="56" width="210" height="160" rx="26" fill="#fff"/><rect x="532" y="68" width="186" height="136" rx="18" fill="#C8EEFC"/>
      <circle cx="670" cy="110" r="26" fill="#FFD98A"/><rect x="621" y="68" width="8" height="136" fill="#fff"/><rect x="532" y="132" width="186" height="8" fill="#fff"/>
      <rect x="70" y="120" width="230" height="14" rx="7" fill="#E9B98A"/>
      <rect x="90" y="70" width="40" height="50" rx="12" fill="#F2B4CC"/><rect x="146" y="80" width="36" height="40" rx="12" fill="#91D9B5"/><rect x="198" y="64" width="44" height="56" rx="12" fill="#75BDF2"/>
      <rect x="220" y="330" width="360" height="24" rx="12" fill="#E9B98A"/><rect x="250" y="350" width="20" height="56" rx="8" fill="#D9A276"/><rect x="530" y="350" width="20" height="56" rx="8" fill="#D9A276"/>
      <g><path d="M262 300 L338 300 C336 330 264 330 262 300 Z" fill="#F2B4CC"/><rect x="258" y="294" width="84" height="10" rx="5" fill="#F7C9DA"/></g>
      <g class="rc-vapor"><path d="M286 284 C276 266 296 256 286 238" /><path d="M300 280 C290 258 312 248 300 226" /><path d="M314 284 C304 266 324 256 314 238" /></g>
      <g><rect x="556" y="270" width="40" height="62" rx="8" fill="#C8EEFC"/><rect x="559" y="292" width="34" height="38" rx="6" fill="#75BDF2"/><rect x="564" y="276" width="6" height="48" rx="3" fill="#fff" opacity=".6"/></g>
      <g class="rc-sirve">
        <g class="rc-plato">
          <ellipse cx="430" cy="324" rx="110" ry="20" fill="#fff"/><ellipse cx="430" cy="320" rx="80" ry="12" fill="#F4EFFA"/>
          <path d="M380 318 A18 18 0 0 1 416 318 Z" fill="#F07C6C"/><path d="M398 318 A12 12 0 0 1 422 318 Z" fill="#FFF6E8"/>
          <rect x="430" y="300" width="9" height="22" rx="4.5" fill="#F2995E" transform="rotate(20 434 311)"/><rect x="444" y="298" width="9" height="24" rx="4.5" fill="#F2995E" transform="rotate(-10 448 310)"/>
          <circle cx="474" cy="308" r="11" fill="#7FCBA4"/><circle cx="484" cy="314" r="9" fill="#5FB88C"/>
        </g>
        <g class="rc-mano"><svg x="356" y="70" width="150" height="196" viewBox="0 0 200 260">${manoArriba(p).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></g>
      </g>
    </g>
  </svg>`;
}

function bano() {
  return `<svg class="rc-cuarto" viewBox="0 0 800 480" aria-hidden="true" focusable="false">
    <defs><clipPath id="rc-c2"><rect width="800" height="480" rx="44"/></clipPath></defs>
    <g clip-path="url(#rc-c2)">
      <rect width="800" height="480" fill="#E4F6EE"/>
      <g fill="#fff" opacity=".55">${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 92}" y="0" width="4" height="400"/>`).join('')}${Array.from({ length: 5 }, (_, i) => `<rect x="0" y="${i * 92}" width="800" height="4"/>`).join('')}</g>
      <rect y="400" width="800" height="80" fill="#B9E6D0"/>
      <rect x="60" y="70" width="130" height="120" rx="22" fill="#fff"/><rect x="70" y="80" width="110" height="100" rx="16" fill="#FFC9A8"/><circle cx="125" cy="150" r="22" fill="#FFD98A"/><rect x="70" y="150" width="110" height="30" fill="#F7A1A8" opacity=".7"/>
      <ellipse cx="400" cy="172" rx="134" ry="116" fill="#91D9B5"/><ellipse cx="400" cy="170" rx="120" ry="104" fill="#C8EEFC"/>
      <path d="M330 110 C350 90 380 80 410 82" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity=".8"/>
      <ellipse class="rc-vaho" cx="400" cy="170" rx="120" ry="104" fill="#fff"/>
      <rect x="620" y="190" width="76" height="140" rx="16" fill="#F2B4CC"/><rect x="620" y="290" width="76" height="12" fill="#fff" opacity=".6"/><rect x="612" y="180" width="92" height="14" rx="7" fill="#B8A5ED"/>
      <rect x="380" y="320" width="40" height="90" rx="12" fill="#F4EFFA"/>
      <rect x="270" y="294" width="260" height="42" rx="21" fill="#fff"/><rect x="392" y="272" width="16" height="26" rx="6" fill="#B8A5ED"/>
      <rect x="470" y="252" width="30" height="44" rx="8" fill="#FFD98A"/><rect x="476" y="226" width="6" height="34" rx="3" fill="#75BDF2" transform="rotate(-10 479 243)"/><rect x="488" y="228" width="6" height="32" rx="3" fill="#F2B4CC" transform="rotate(8 491 244)"/>
      <g class="rc-espuma" fill="#fff">
        <circle cx="330" cy="296" r="16"/><circle cx="356" cy="284" r="22"/><circle cx="388" cy="292" r="14"/><circle cx="420" cy="280" r="20"/><circle cx="452" cy="292" r="15"/>
        <circle cx="350" cy="250" r="9" opacity=".8"/><circle cx="410" cy="232" r="12" opacity=".8"/><circle cx="440" cy="206" r="7" opacity=".7"/><circle cx="372" cy="196" r="10" opacity=".7"/>
      </g>
    </g>
  </svg>`;
}

function dormitorio() {
  const p = PIELES[3];
  return `<svg class="rc-cuarto" viewBox="0 0 800 480" aria-hidden="true" focusable="false">
    <defs><clipPath id="rc-c3"><rect width="800" height="480" rx="44"/></clipPath>
      <radialGradient id="rc-g3"><stop offset="0" stop-color="#FFE7B0" stop-opacity=".9"/><stop offset="1" stop-color="#FFE7B0" stop-opacity="0"/></radialGradient></defs>
    <g clip-path="url(#rc-c3)">
      <rect width="800" height="480" fill="#5A5396"/><rect y="400" width="800" height="80" fill="#463F7C"/>
      <rect x="70" y="60" width="190" height="160" rx="24" fill="#E8E2FA"/><rect x="82" y="72" width="166" height="136" rx="16" fill="#2D2A4A"/>
      <circle cx="200" cy="110" r="22" fill="#FFF5DC"/><circle cx="210" cy="104" r="20" fill="#2D2A4A"/>
      <g fill="#FFF5DC"><circle cx="110" cy="100" r="3"/><circle cx="140" cy="160" r="2.5"/><circle cx="226" cy="176" r="3"/><circle cx="120" cy="190" r="2"/></g>
      <rect class="rc-luz" x="82" y="72" width="166" height="136" rx="16" fill="#FFE7A8"/>
      <rect x="160" y="72" width="8" height="136" fill="#E8E2FA"/>
      <circle class="rc-luz" cx="700" cy="230" r="150" fill="url(#rc-g3)"/>
      <rect x="660" y="300" width="100" height="104" rx="16" fill="#B8A5ED"/><rect x="672" y="330" width="76" height="8" rx="4" fill="#9D8CDB"/>
      <rect x="704" y="190" width="10" height="110" rx="5" fill="#E8E2FA"/><path d="M670 200 L748 200 L734 156 L684 156 Z" fill="#FFD98A"/>
      <g class="rc-vaso"><path d="M676 252 L708 252 L704 300 L680 300 Z" fill="#C8EEFC"/><rect x="680" y="276" width="24" height="22" rx="3" fill="#75BDF2" opacity=".7"/></g>
      <rect x="250" y="250" width="380" height="140" rx="34" fill="#B8A5ED"/><rect x="250" y="300" width="380" height="90" rx="30" fill="#F2B4CC"/>
      <rect x="270" y="236" width="120" height="56" rx="26" fill="#fff"/>
      <rect x="250" y="380" width="22" height="30" rx="8" fill="#9D8CDB"/><rect x="608" y="380" width="22" height="30" rx="8" fill="#9D8CDB"/>
      <g class="rc-libro">
        <path d="M440 250 L520 238 L520 300 L440 312 Z" fill="#FFF6E8"/>
        <rect x="452" y="256" width="52" height="5" rx="2.5" fill="#D9CDB8" transform="rotate(-8 478 258)"/><rect x="452" y="272" width="44" height="5" rx="2.5" fill="#D9CDB8" transform="rotate(-8 474 274)"/>
        <g class="rc-tapa"><path d="M440 250 L520 238 L520 300 L440 312 Z" fill="#E9735F"/><circle cx="482" cy="274" r="12" fill="#FFD98A"/></g>
      </g>
      <g class="rc-mano"><svg x="420" y="40" width="130" height="170" viewBox="0 0 200 260">${manoArriba(p).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg></g>
    </g>
  </svg>`;
}

const CUARTOS = [cocina, bano, dormitorio];

export function markupRecorrido() {
  return `
  <section class="e3" id="recorrido" aria-labelledby="rc-titulo">
    <div class="e3-fijo">
      <div class="rc-cielo" aria-hidden="true"><i class="rc-dia"></i><i class="rc-tarde"></i><i class="rc-noche"></i><i class="rc-estrellas"></i>
        <i class="rc-sol"></i><i class="rc-luna"></i></div>
      ${PLANOS.map(([c]) => `<div class="rc-plano ${c}" aria-hidden="true"></div>`).join('')}
      <div class="rc-plano rc-calle" aria-hidden="true"></div>
      <div class="rc-sombra-noche" aria-hidden="true"></div>
      <h2 class="sr" id="rc-titulo">Un día para cuidar la sonrisa</h2>
      <div class="rc-mundo">
        ${PARADAS.map((p, k) => `
        <article class="rc-parada rc-m-${p.momento}" data-k="${k}">
          <h3 class="rc-nombre">${p.titulo}</h3>
          <p class="rc-texto">${p.texto}</p>
          <div class="rc-escenario">${CUARTOS[k]()}${k === 2 ? `<div class="rc-salta" aria-hidden="true">${cepillo('#75BDF2')}</div>` : ''}</div>
        </article>`).join('')}
      </div>
      <div class="rc-chiqui" aria-hidden="true">
        <div class="rc-lineas"><i></i><i></i><i></i></div>
        <div class="rc-cuerpo">
          ${enfermeraPatina()}
          ${cepilloConRuedas()}
        </div>
      </div>
      <div class="rc-plano rc-frente" aria-hidden="true"></div>
      <div class="rc-barra" aria-hidden="true">
        <svg viewBox="0 0 90 44"><path d="M4 8 L60 4 L60 40 L4 36 Z" fill="#fff"/><rect x="16" y="12" width="30" height="20" rx="4" fill="#F2B4CC"/><rect x="60" y="12" width="20" height="20" rx="6" fill="#75BDF2"/></svg>
        <span class="rc-pasta"><i></i></span>
      </div>
    </div>
  </section>`;
}

/** Controlador del recorrido. Devuelve { dibujar(q, delta), medir() }. */
export function crearRecorrido(sec, { SplitText }) {
  const fijo = sec.querySelector('.e3-fijo');
  const $ = (s) => sec.querySelector(s);
  const planos = [...PLANOS.map(([c, f, t, tw]) => ({ el: $(`.${c}`), f, t, tw })), { el: $('.rc-calle'), f: 1, t: tiles.calle, tw: TILE }, { el: $('.rc-frente'), f: 1.7, t: tiles.frente, tw: TILE * 1.5 }];
  planos.forEach((p) => { p.el.style.backgroundImage = p.t; });
  const paradas = [...sec.querySelectorAll('.rc-parada')];
  const titulos = paradas.map((a) => {
    const split = new SplitText(a.querySelector('.rc-nombre'), { type: 'chars', mask: 'chars', charsClass: 'rc-letra' });
    return { chars: split.chars, split, texto: a.querySelector('.rc-texto') };
  });
  const capas = {
    dia: $('.rc-dia'), tarde: $('.rc-tarde'), noche: $('.rc-noche'), estrellas: $('.rc-estrellas'),
    sol: $('.rc-sol'), luna: $('.rc-luna'), ventanas: $('.rc-ventanas'), sombra: $('.rc-sombra-noche'), nubes: $('.rc-nubes'),
    mundo: $('.rc-mundo'), chiqui: $('.rc-chiqui'), cuerpo: $('.rc-cuerpo'), ruedas: [...sec.querySelectorAll('.rueda')], lineas: $('.rc-lineas'),
    pasta: $('.rc-pasta i'),
  };
  const piezas = paradas.map((a) => ({
    sirve: a.querySelector('.rc-sirve'), mano: a.querySelector('.rc-mano'), vapor: a.querySelector('.rc-vapor'),
    vaho: a.querySelector('.rc-vaho'), espuma: a.querySelector('.rc-espuma'),
    luz: [...a.querySelectorAll('.rc-luz')], tapa: a.querySelector('.rc-tapa'), salta: a.querySelector('.rc-salta'),
  }));
  let D = 820;
  let vw = 1;
  let ruedaR = 10;
  const medir = () => {
    vw = fijo.clientWidth;
    D = Math.max(1.3 * vw, 820);
    ruedaR = (capas.cuerpo.clientWidth * 24) / 340;
    paradas.forEach((a, k) => { a.style.left = `${k * D + vw / 2 - a.offsetWidth / 2}px`; });
    planos.forEach((p) => { p.el.style.width = `${vw + p.tw + 2}px`; });
  };
  medir();

  let previo = null;
  let vel = 0;
  let velLenta = 0;

  function dibujar(q, delta) {
    const pos = posicion(q);
    const x = (pos + 0.55) * D;
    // Cielo: día → atardecer → noche
    const tarde = smooth(0.28, 0.45, q);
    const noche = smooth(0.6, 0.78, q);
    capas.tarde.style.opacity = tarde;
    capas.noche.style.opacity = noche;
    capas.estrellas.style.opacity = noche;
    capas.ventanas.style.opacity = smooth(0.5, 0.75, q);
    capas.sombra.style.opacity = noche * 0.9;
    capas.nubes.style.opacity = 1 - noche * 0.7;
    const arco = (k) => `translate(${lerp(-10, 80, k)}vw, ${(1 - Math.sin(Math.PI * clamp(k))) * 40 + 6}svh)`;
    capas.sol.style.transform = arco(span(-0.1, 0.62, q));
    capas.sol.style.opacity = 1 - smooth(0.5, 0.62, q);
    capas.luna.style.transform = arco(span(0.55, 1.3, q));
    capas.luna.style.opacity = smooth(0.56, 0.7, q);
    // Planos
    planos.forEach((p) => { p.el.style.transform = `translate3d(${-((x * p.f) % p.tw)}px,0,0)`; });
    capas.mundo.style.transform = `translate3d(${-pos * D}px,0,0)`;
    // Velocidad y aceleración: inclinación, ruedas y líneas de velocidad
    if (previo === null) previo = x;
    const v = (x - previo) / Math.max(delta, 1);
    previo = x;
    vel += (v - vel) * inercia(delta * 3);
    velLenta += (vel - velLenta) * inercia(delta * 0.6);
    const acel = vel - velLenta;
    capas.cuerpo.style.transform = `rotate(${clamp(-acel * 18, -9, 9)}deg)`;
    const giro = ((x / ruedaR) * 180) / Math.PI;
    capas.ruedas.forEach((r) => { r.style.transform = `rotate(${giro}deg)`; });
    const rapidez = clamp(Math.abs(vel) / 1.6);
    capas.lineas.style.opacity = rapidez;
    capas.lineas.style.transform = `scaleX(${0.4 + rapidez})`;
    capas.chiqui.style.transform = `translate3d(${clamp(vel * 6, -30, 30)}px,0,0)`;
    capas.pasta.style.transform = `scaleX(${q})`;

    // Títulos: las letras entran y salen una por una desde una máscara
    PARADAS.forEach((p, k) => {
      const [a, b] = p.ventana;
      const { chars, texto } = titulos[k];
      const n = chars.length;
      chars.forEach((c, j) => {
        const ent = smooth(a + j * 0.008, a + j * 0.008 + 0.05, q);
        const sal = smooth(b - 0.06 + j * 0.006, b + j * 0.006, q);
        c.style.transform = `translate3d(0,${(1 - ent) * 115 - sal * 115}%,0)`;
      });
      const e = smooth(a + 0.03 + n * 0.008, a + 0.09 + n * 0.008, q) * (1 - smooth(b - 0.06, b - 0.01, q));
      texto.style.opacity = e;
      texto.style.transform = `translate3d(0,${(1 - e) * 24}px,0)`;
    });

    // Parada 1 · Come: la mano grande sirve el plato; sale vapor.
    const c = piezas[0];
    const servir = smooth(0.09, 0.19, q);
    const retira = smooth(0.21, 0.29, q);
    c.sirve.style.transform = `translate(0, ${-(1 - servir) * 300}px)`;
    c.mano.style.transform = `translate(0, ${-retira * 320}px)`;
    c.vapor.style.opacity = smooth(0.14, 0.2, q);
    // Parada 2 · Cepilla: el espejo se empaña y sube espuma.
    const ba = piezas[1];
    ba.vaho.style.opacity = smooth(0.42, 0.54, q) * 0.85;
    const esp = span(0.41, 0.58, q);
    ba.espuma.style.transform = `translate(0, ${-esp * 60}px) scale(${0.4 + esp * 0.7})`;
    ba.espuma.style.opacity = smooth(0.41, 0.46, q);
    // Parada 3 · Sueña: se enciende la luz, la mano abre el libro y el cepillo salta al vaso.
    const d = piezas[2];
    const luz = smooth(0.71, 0.79, q);
    d.luz.forEach((l) => { l.style.opacity = luz * 0.85; });
    const abre = smooth(0.79, 0.87, q);
    d.tapa.style.transform = `scaleX(${1 - 2 * abre})`;
    d.mano.style.transform = `translate(0, ${-(1 - smooth(0.76, 0.81, q)) * 260 - smooth(0.88, 0.93, q) * 260}px)`;
    const salto = span(0.87, 0.97, q);
    const sx = lerp(56, 86, salto);
    const sy = lerp(100, 55, salto) - Math.sin(Math.PI * salto) * 62;
    d.salta.style.transform = `translate(${sx}cqw, ${sy}cqh) translate(-50%,-50%) rotate(${salto * 360 - 70 * salto}deg) scale(${lerp(1, 0.55, salto)})`;
    d.salta.style.opacity = salto > 0 ? 1 : 0;
  }

  return {
    dibujar,
    medir,
    curvatura(t) { fijo.style.borderRadius = `${64 * clamp(t)}px ${64 * clamp(t)}px 0 0`; },
    destruir() { titulos.forEach((t) => t.split.revert()); },
  };
}
