// Ilustraciones SVG propias del landing: plano con volumen, 2–3 tonos por objeto, sin contornos negros.
// Todas son decorativas (aria-hidden); el texto real va en el HTML.

/** Tonos de piel diversos para las manos grandes: [base, sombra, luz]. */
export const PIELES = [
  ['#F4CDB0', '#E2AE8D', '#FBE3D1'],
  ['#D9A276', '#C0855A', '#EBC09D'],
  ['#A8693F', '#8A522D', '#C4885E'],
  ['#6E4127', '#56301B', '#8C5A3B'],
];

const MANGAS = ['#B8A5ED', '#91D9B5', '#75BDF2', '#FFA995'];

/**
 * Mano grande vista de lado, palma hacia arriba y dedos curvados (forma de cuenco).
 * La muñeca entra por la izquierda; `espejo` la voltea para la mano derecha.
 */
export function mano(piel = PIELES[0], { espejo = false, clase = '' } = {}) {
  const [b, s, l] = piel;
  return `<svg class="${clase}" viewBox="0 0 330 230" aria-hidden="true" focusable="false"${espejo ? ' style="transform:scaleX(-1)"' : ''}>
    <rect x="20" y="124" width="90" height="70" rx="30" fill="${s}"/>
    <rect x="0" y="112" width="58" height="94" rx="24" fill="${MANGAS[PIELES.indexOf(piel) % MANGAS.length] || '#B8A5ED'}"/>
    <rect x="44" y="116" width="10" height="86" rx="5" fill="#fff" opacity=".35"/>
    <path d="M70 120 C130 126 190 128 236 120 C262 114 278 98 284 80 C288 66 304 62 312 74 C320 88 320 112 310 134 C292 176 250 198 196 202 C140 206 96 200 74 192 C52 184 50 128 70 120 Z" fill="${b}"/>
    <path d="M226 176 C266 166 296 140 306 108" fill="none" stroke="${s}" stroke-width="5" stroke-linecap="round" opacity=".55"/>
    <path d="M206 190 C252 184 290 160 304 130" fill="none" stroke="${s}" stroke-width="5" stroke-linecap="round" opacity=".45"/>
    <path d="M96 136 C150 140 200 140 240 134" fill="none" stroke="${l}" stroke-width="9" stroke-linecap="round" opacity=".7"/>
    <path d="M110 122 C140 96 182 92 214 106" fill="none" stroke="${b}" stroke-width="28" stroke-linecap="round"/>
    <path d="M124 112 C150 98 178 96 200 104" fill="none" stroke="${l}" stroke-width="7" stroke-linecap="round" opacity=".6"/>
  </svg>`;
}

/** Mano grande que baja desde arriba (palma hacia abajo), para servir o abrir el libro. */
export function manoArriba(piel = PIELES[1], { clase = '' } = {}) {
  const [b, s, l] = piel;
  return `<svg class="${clase}" viewBox="0 0 200 260" aria-hidden="true" focusable="false">
    <rect x="62" y="-40" width="78" height="150" rx="36" fill="${s}"/>
    <path d="M40 120 C40 92 64 84 100 84 C140 84 162 94 162 122 L162 176 C162 200 140 214 100 214 C62 214 40 200 40 176 Z" fill="${b}"/>
    <rect x="44" y="160" width="26" height="80" rx="13" fill="${s}"/>
    <rect x="74" y="168" width="26" height="88" rx="13" fill="${b}"/>
    <rect x="104" y="168" width="26" height="86" rx="13" fill="${b}"/>
    <rect x="134" y="160" width="24" height="72" rx="12" fill="${s}"/>
    <rect x="152" y="112" width="26" height="70" rx="13" fill="${b}" transform="rotate(-24 165 147)"/>
    <path d="M62 118 C82 104 120 104 140 116" fill="none" stroke="${l}" stroke-width="9" stroke-linecap="round" opacity=".7"/>
  </svg>`;
}

/** Vehículo de Dientín: un cepillo de dientes con ruedas. Las ruedas giran con `.rueda`. */
export function cepilloConRuedas() {
  const rueda = (cx) => `<g class="rueda" style="transform-origin:${cx}px 92px">
      <circle cx="${cx}" cy="92" r="24" fill="#E9735F"/><circle cx="${cx}" cy="92" r="17" fill="#FFA995"/>
      <rect x="${cx - 3}" y="76" width="6" height="32" rx="3" fill="#FFE8E2"/><rect x="${cx - 16}" y="89" width="32" height="6" rx="3" fill="#FFE8E2"/>
      <circle cx="${cx}" cy="92" r="6" fill="#FFF5DC"/></g>`;
  return `<svg class="cepillo-auto" viewBox="0 0 340 124" aria-hidden="true" focusable="false">
    <ellipse cx="170" cy="118" rx="140" ry="6" fill="#26304F" opacity=".12"/>
    <rect x="14" y="52" width="312" height="26" rx="13" fill="#4A9FE0"/>
    <rect x="30" y="56" width="280" height="7" rx="3.5" fill="#9BD0F5"/>
    <rect x="292" y="50" width="34" height="30" rx="15" fill="#2F86C9"/>
    <g>
      <rect x="10" y="14" width="13" height="40" rx="6.5" fill="#E4F6EE"/>
      <rect x="26" y="8" width="13" height="46" rx="6.5" fill="#fff"/>
      <rect x="42" y="12" width="13" height="42" rx="6.5" fill="#E4F6EE"/>
      <rect x="58" y="8" width="13" height="46" rx="6.5" fill="#fff"/>
      <rect x="74" y="16" width="13" height="38" rx="6.5" fill="#91D9B5"/>
    </g>
    ${rueda(98)}${rueda(254)}
  </svg>`;
}

/** Cepillo suelto (el que salta al vaso). */
export function cepillo(color = '#75BDF2') {
  return `<svg viewBox="0 0 200 40" aria-hidden="true" focusable="false">
    <rect x="40" y="16" width="156" height="14" rx="7" fill="${color}"/>
    <rect x="50" y="18" width="130" height="4" rx="2" fill="#fff" opacity=".45"/>
    <rect x="4" y="4" width="9" height="20" rx="4.5" fill="#fff"/><rect x="15" y="2" width="9" height="22" rx="4.5" fill="#E4F6EE"/>
    <rect x="26" y="4" width="9" height="20" rx="4.5" fill="#fff"/><rect x="4" y="20" width="40" height="10" rx="5" fill="${color}"/>
  </svg>`;
}

/** Íconos de los juegos reales (por id de LISTA_JUEGOS). */
export const ICONOS_JUEGO = {
  cepillado: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#E3F1FC"/>
    <path d="M36 44 C36 30 50 28 60 34 C70 28 84 30 84 44 C84 62 78 70 76 88 C75 96 68 96 66 88 L62 74 L58 74 L54 88 C52 96 45 96 44 88 C42 70 36 62 36 44 Z" fill="#fff"/>
    <path d="M44 42 C46 36 52 35 56 38" stroke="#E3F1FC" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="66" y="66" width="44" height="10" rx="5" fill="#4A9FE0" transform="rotate(-40 88 71)"/>
    <circle cx="30" cy="80" r="7" fill="#C8EEFC"/><circle cx="22" cy="66" r="4" fill="#C8EEFC"/></svg>`,
  alimentos: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#E4F6EE"/>
    <rect x="22" y="54" width="76" height="44" rx="14" fill="#91D9B5"/><rect x="22" y="54" width="76" height="12" rx="6" fill="#2FA77A"/>
    <path d="M46 54 C46 38 74 38 74 54" stroke="#2FA77A" stroke-width="7" fill="none" stroke-linecap="round"/>
    <path d="M40 46 L30 22 L50 40 Z" fill="#F2995E"/><path d="M30 22 L24 14 M30 22 L34 12" stroke="#2FA77A" stroke-width="4" stroke-linecap="round"/>
    <circle cx="82" cy="42" r="12" fill="#E9735F"/><path d="M82 30 L84 24" stroke="#7A4A2E" stroke-width="3" stroke-linecap="round"/></svg>`,
  memoria: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#FFF5DC"/>
    <rect x="22" y="30" width="40" height="56" rx="10" fill="#FFD98A" transform="rotate(-10 42 58)"/>
    <rect x="56" y="32" width="40" height="56" rx="10" fill="#fff" transform="rotate(8 76 60)"/>
    <circle cx="77" cy="58" r="10" fill="#F2B4CC"/><circle cx="41" cy="58" r="7" fill="#fff"/></svg>`,
  bacterias: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#FCE8F0"/>
    <path d="M60 30 C80 30 92 44 90 62 C88 82 74 92 58 90 C40 88 28 76 30 58 C32 40 44 30 60 30 Z" fill="#B8A5ED"/>
    <circle cx="50" cy="56" r="5" fill="#26304F"/><circle cx="70" cy="56" r="5" fill="#26304F"/>
    <path d="M52 70 C56 74 64 74 68 70" stroke="#26304F" stroke-width="4" fill="none" stroke-linecap="round"/>
    <circle cx="44" cy="66" r="5" fill="#F2B4CC"/><circle cx="76" cy="66" r="5" fill="#F2B4CC"/>
    <circle cx="96" cy="34" r="8" fill="#fff"/><circle cx="24" cy="88" r="6" fill="#fff"/></svg>`,
  quiz: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#EFEBFF"/>
    <path d="M24 40 C24 28 32 22 44 22 L80 22 C92 22 98 28 98 40 L98 64 C98 76 92 82 80 82 L54 82 L36 98 L38 82 C28 80 24 74 24 64 Z" fill="#7C6AF2"/>
    <path d="M50 44 C50 34 70 34 70 44 C70 52 60 52 60 60" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="60" cy="70" r="4.5" fill="#fff"/></svg>`,
  atrapa: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#FFE9E3"/>
    <circle cx="40" cy="34" r="11" fill="#E9735F"/><path d="M40 23 L42 17" stroke="#7A4A2E" stroke-width="3" stroke-linecap="round"/>
    <path d="M74 22 L84 44 L64 44 Z" fill="#F2995E"/><circle cx="86" cy="62" r="8" fill="#91D9B5"/>
    <path d="M30 78 C30 70 90 70 90 78 L84 98 C82 102 38 102 36 98 Z" fill="#fff"/><path d="M30 78 C30 70 90 70 90 78" stroke="#E9735F" stroke-width="5" fill="none"/></svg>`,
  pasos: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#E3F7F6"/>
    <rect x="20" y="78" width="26" height="20" rx="6" fill="#1FA39A"/><rect x="47" y="58" width="26" height="40" rx="6" fill="#5CC9C0"/><rect x="74" y="38" width="26" height="60" rx="6" fill="#9ADFD9"/>
    <text x="33" y="93" font-size="14" font-weight="800" text-anchor="middle" fill="#fff">1</text><text x="60" y="80" font-size="14" font-weight="800" text-anchor="middle" fill="#fff">2</text><text x="87" y="62" font-size="14" font-weight="800" text-anchor="middle" fill="#0E6E68">3</text></svg>`,
  sombras: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#ECE7FD"/>
    <path d="M40 40 C40 28 52 26 60 31 C68 26 80 28 80 40 C80 56 75 62 73 78 C72 85 66 85 65 78 L62 66 L58 66 L55 78 C54 85 48 85 47 78 C45 62 40 56 40 40 Z" fill="#26304F" opacity=".85"/>
    <path d="M92 22 L100 30 M98 18 L104 14 M88 16 L86 8" stroke="#FFD98A" stroke-width="5" stroke-linecap="round"/></svg>`,
  musica: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#FCE4F3"/>
    <rect x="22" y="40" width="34" height="34" rx="12" fill="#75BDF2"/><rect x="64" y="40" width="34" height="34" rx="12" fill="#F2B4CC"/>
    <rect x="22" y="80" width="34" height="22" rx="10" fill="#91D9B5"/><rect x="64" y="80" width="34" height="22" rx="10" fill="#FFD98A"/>
    <path d="M70 12 L70 30 M70 12 L84 16" stroke="#C2439B" stroke-width="5" stroke-linecap="round"/><circle cx="65" cy="31" r="6" fill="#C2439B"/></svg>`,
  contar: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="#FFF0D6"/>
    <text x="34" y="74" font-size="38" font-weight="900" text-anchor="middle" fill="#75BDF2">1</text>
    <text x="60" y="74" font-size="38" font-weight="900" text-anchor="middle" fill="#D9608E">2</text>
    <text x="86" y="74" font-size="38" font-weight="900" text-anchor="middle" fill="#2FA77A">3</text>
    <circle cx="36" cy="94" r="5" fill="#E08A1E"/><circle cx="54" cy="94" r="5" fill="#E08A1E"/><circle cx="72" cy="94" r="5" fill="#E08A1E"/></svg>`,
};

/** Fondo de ilustración por tema de cuento. */
export const COLOR_CUENTO = { higiene: ['#C8EEFC', '#4A9FE0'], alimentacion: ['#E2F8EC', '#2FA77A'], familia: ['#FFE8EA', '#D9608E'], otro: ['#EFEBFF', '#7C6AF2'], odontologo: ['#E3F7F6', '#1FA39A'] };

/** Portadas propias de los cuentos base (por id). */
export const PORTADAS = {
  'monstruo-caries': `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="104" r="70" fill="#9BD0F5"/>
    <path d="M70 70 C70 54 88 52 100 60 C112 52 130 54 130 70 C130 96 122 106 120 132 C119 142 110 142 108 132 L104 114 L96 114 L92 132 C90 142 81 142 80 132 C78 106 70 96 70 70 Z" fill="#fff"/>
    <circle cx="90" cy="80" r="4" fill="#26304F"/><circle cx="110" cy="80" r="4" fill="#26304F"/><path d="M92 92 C97 97 103 97 108 92" stroke="#26304F" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="150" cy="60" r="12" fill="#FFD98A"/><circle cx="44" cy="140" r="9" fill="#fff" opacity=".8"/><circle cx="160" cy="146" r="6" fill="#fff" opacity=".8"/></svg>`,
  'lonchera-arcoiris': `<svg viewBox="0 0 200 200" aria-hidden="true">
    <path d="M30 140 A70 70 0 0 1 170 140" stroke="#F2B4CC" stroke-width="14" fill="none"/><path d="M44 140 A56 56 0 0 1 156 140" stroke="#FFD98A" stroke-width="14" fill="none"/>
    <path d="M58 140 A42 42 0 0 1 142 140" stroke="#91D9B5" stroke-width="14" fill="none"/><path d="M72 140 A28 28 0 0 1 128 140" stroke="#75BDF2" stroke-width="14" fill="none"/>
    <rect x="56" y="132" width="88" height="46" rx="14" fill="#2FA77A"/><rect x="56" y="132" width="88" height="12" rx="6" fill="#1F7F5B"/></svg>`,
  'manos-grandes': `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="74" fill="#FFD9DF"/>
    <path d="M40 130 C70 160 130 160 160 130 C150 170 50 170 40 130 Z" fill="#C0855A"/><path d="M46 128 C72 150 128 150 154 128" stroke="#D9A276" stroke-width="16" fill="none" stroke-linecap="round"/>
    <path d="M84 84 C84 72 96 70 100 76 C104 70 116 72 116 84 C116 102 110 108 109 124 C108 130 103 130 102 124 L100 114 L98 124 C97 130 92 130 91 124 C90 108 84 102 84 84 Z" fill="#fff"/></svg>`,
};

/** Libro genérico para cuentos sin portada propia. */
export const PORTADA_GENERICA = `<svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="70" fill="#fff" opacity=".5"/><path d="M60 70 L100 80 L140 70 L140 140 L100 150 L60 140 Z" fill="#fff"/></svg>`;

/** La enfermera de perfil, mirando a la derecha. Los ojos cerrados son una capa aparte que parpadea por CSS. */
export function enfermera(clase = '') {
  return `<div class="enf ${clase}"><img class="enf-base" src="img/enfermera-perfil.webp" width="437" height="640" alt="" decoding="async" loading="lazy"><img class="enf-ojos" src="img/enfermera-perfil-ojos.webp" width="437" height="640" alt="" decoding="async" loading="lazy"></div>`;
}

/** La enfermera de perfil patinando: tira de 64 cuadros del video, animada por CSS (ida y vuelta). */
export function enfermeraPatina() {
  return '<div class="enf-patina" role="presentation"></div>';
}
