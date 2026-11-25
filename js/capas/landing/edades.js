// Ilustraciones animadas de «Manos que acompañan»: una escena por grupo de edad, más una de inicio.
// Cada escena es un SVG plano (viewBox 400×320). Los brazos siempre salen del hombro de su personaje.
// Las animaciones van en CSS (.ae-*); los grupos animados no llevan `transform` propio.

const TINTA = '#26304F';
const PIEL = { clara: '#F6CFAE', media: '#E2A97E', oscura: '#A9714B' };

/** Medio cuerpo con orejas, pelo con flequillo, cuello de camisa y cara. (x, y) = centro de los hombros. */
function persona(x, y, s, { piel = PIEL.clara, pelo = '#5A3A2E', ropa = '#75BDF2', boca = 'sonrie', moño = false, clase = '' } = {}) {
  const cara = boca === 'abre'
    ? `<path d="M-8 -33 Q0 -33 8 -33 Q8 -22 0 -22 Q-8 -22 -8 -33 Z" fill="#9E3650"/><path d="M-5 -25 Q0 -28 5 -25 Q3 -22 0 -22 Q-3 -22 -5 -25 Z" fill="#F28C9C"/>`
    : `<path d="M-9 -32 Q0 -24 9 -32" stroke="${TINTA}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`;
  return `<g class="${clase}"><g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="72" rx="56" ry="8" fill="${TINTA}" opacity=".08"/>
    <path d="M-48 70 C-48 24 -30 8 0 8 C30 8 48 24 48 70 Z" fill="${ropa}"/>
    <path d="M-12 9 L0 24 L12 9" fill="#fff" opacity=".55"/>
    <rect x="-9" y="-12" width="18" height="24" rx="8" fill="${piel}"/>
    <circle cx="-31" cy="-42" r="7" fill="${piel}"/><circle cx="31" cy="-42" r="7" fill="${piel}"/>
    <circle cx="0" cy="-44" r="32" fill="${piel}"/>
    <path d="M-34 -42 C-38 -84 38 -84 34 -42 C30 -52 22 -58 12 -58 C6 -50 -6 -50 -10 -58 C-20 -58 -30 -52 -34 -42 Z" fill="${pelo}"/>
    ${moño ? `<circle cx="24" cy="-72" r="9" fill="#F2B4CC"/><circle cx="35" cy="-66" r="7" fill="#F2B4CC"/><circle cx="29" cy="-69" r="3" fill="#fff" opacity=".6"/>` : ''}
    <ellipse cx="-11" cy="-44" rx="3.6" ry="4.4" fill="${TINTA}"/><ellipse cx="11" cy="-44" rx="3.6" ry="4.4" fill="${TINTA}"/>
    <circle cx="-10" cy="-46" r="1.3" fill="#fff"/><circle cx="12" cy="-46" r="1.3" fill="#fff"/>
    <ellipse cx="-20" cy="-33" rx="5.5" ry="3.5" fill="#F59A9A" opacity=".55"/><ellipse cx="20" cy="-33" rx="5.5" ry="3.5" fill="#F59A9A" opacity=".55"/>
    ${cara}
  </g></g>`;
}

/**
 * Brazo con manga que sale del hombro de una persona hasta la mano (coordenadas globales).
 * lado: -1 izquierdo, 1 derecho. codo: desplazamiento del punto de control.
 */
function brazo(x, y, s, lado, [mx, my], { piel = PIEL.clara, ropa = '#75BDF2', codo = [0, 30] } = {}) {
  const hx = x + lado * 38 * s;
  const hy = y + 24 * s;
  const cx = (hx + mx) / 2 + codo[0] * s;
  const cy = (hy + my) / 2 + codo[1] * s;
  return `<path d="M${hx} ${hy} Q${cx} ${cy} ${mx} ${my}" fill="none" stroke="${ropa}" stroke-width="${15 * s}" stroke-linecap="round"/>
    <circle cx="${mx}" cy="${my}" r="${8.5 * s}" fill="${piel}"/>`;
}

/** Cepillo: el origen es la punta de las cerdas y el mango va hacia +x. */
const cepillo = (color = '#75BDF2', pasta = '') => `<g>
  <rect x="10" y="-5" width="54" height="10" rx="5" fill="${color}"/>
  <rect x="0" y="-13" width="20" height="10" rx="3" fill="#fff" stroke="${color}" stroke-width="2"/>
  ${pasta}
</g>`;

const fondo = (a, b) => `<defs><radialGradient id="fg-${a.slice(1)}" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs>
  <rect width="400" height="320" fill="${b}"/>
  <circle cx="200" cy="170" r="142" fill="url(#fg-${a.slice(1)})"/>
  <g fill="#fff" opacity=".6"><circle cx="40" cy="40" r="4"/><circle cx="362" cy="56" r="3"/><circle cx="30" cy="250" r="3"/><circle cx="372" cy="280" r="4"/></g>`;
const estrella = (x, y, r, color = '#FFD98A', clase = 'ae-titila') =>
  `<g class="${clase}"><path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z" fill="${color}"/></g>`;
const corazon = (x, y, s, clase = 'ae-sube') =>
  `<g class="${clase}"><path transform="translate(${x} ${y}) scale(${s})" d="M0 6 C-10 -4 -10 -14 0 -10 C10 -14 10 -4 0 6 Z" fill="#F2B4CC"/></g>`;
const insignia = (x, y, color, dentro) => `<g transform="translate(${x} ${y})"><circle r="30" fill="#fff"/><circle r="30" fill="none" stroke="${color}" stroke-width="3" opacity=".35"/>${dentro}</g>`;

export const ESCENAS_EDAD = {
  // Antes de abrir una edad: una invitación a elegir.
  inicio: `<svg viewBox="0 0 400 320" aria-hidden="true">
    ${fondo('#F4EFFA', '#FDFBFF')}
    <g class="ae-flota">
      <path d="M150 112 C150 78 186 76 200 92 C214 76 250 78 250 112 C250 150 238 168 232 214 C228 240 212 240 208 214 C206 198 194 198 192 214 C188 240 172 240 168 214 C162 168 150 150 150 112 Z" fill="#fff" stroke="#C8C0E8" stroke-width="4"/>
      <ellipse cx="184" cy="128" rx="6" ry="8" fill="${TINTA}"/><ellipse cx="216" cy="128" rx="6" ry="8" fill="${TINTA}"/>
      <circle cx="186" cy="125" r="2" fill="#fff"/><circle cx="218" cy="125" r="2" fill="#fff"/>
      <path d="M186 150 Q200 162 214 150" stroke="${TINTA}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <ellipse cx="172" cy="146" rx="7" ry="4" fill="#F59A9A" opacity=".6"/><ellipse cx="228" cy="146" rx="7" ry="4" fill="#F59A9A" opacity=".6"/>
    </g>
    <text x="200" y="282" text-anchor="middle" font-size="19" font-weight="900" fill="${TINTA}" font-family="sans-serif">Elige una edad para verla</text>
    ${estrella(296, 92, 12)}${estrella(316, 186, 8, '#F2B4CC', 'ae-titila ae-tarde')}${estrella(96, 236, 8, '#91D9B5', 'ae-titila ae-mas-tarde')}
  </svg>`,

  // 0 a 6 meses: el adulto acuna al bebé y le limpia las encías con una gasa; nada de azúcar ni miel en el biberón.
  bebe: (() => {
    // El brazo izquierdo (a la izquierda del dibujo) acuna al bebé: la cabeza descansa en el codo y la mano
    // asoma al otro extremo de la cobija. El brazo derecho cruza por delante y limpia las encías con la gasa.
    const [x, y, s] = [200, 196, 1.25];
    const g = 15 * s;
    const manga = '#A08CE0';
    return `<svg viewBox="0 0 400 320" aria-hidden="true">
    ${fondo('#FFE3E8', '#FFF6F7')}
    ${persona(x, y, s, { piel: PIEL.media, pelo: '#3B2C3E', ropa: '#B8A5ED' })}
    <path d="M${x - 38 * s} ${y + 24 * s} C120 254 118 296 160 298 L262 292" fill="none" stroke="${manga}" stroke-width="${g}" stroke-linecap="round" stroke-linejoin="round"/>
    <g class="ae-mece">
      <path d="M150 268 C150 246 190 238 236 242 C272 245 290 256 290 270 C290 288 262 296 222 296 C182 296 150 290 150 268 Z" fill="#C8EEFC"/>
      <path d="M166 268 C196 256 240 256 276 266" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
      <circle cx="284" cy="262" r="9" fill="#C8EEFC"/>
      <circle cx="150" cy="250" r="25" fill="${PIEL.clara}"/>
      <path d="M128 244 C128 222 166 220 172 240 C160 232 140 232 128 244 Z" fill="#E3C4A8"/>
      <path d="M137 248 Q141 245 145 248" stroke="${TINTA}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M153 248 Q157 245 161 248" stroke="${TINTA}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="150" cy="262" rx="5" ry="3.5" fill="#F28C9C"/>
      <circle cx="136" cy="258" r="4" fill="#F59A9A" opacity=".5"/><circle cx="164" cy="258" r="4" fill="#F59A9A" opacity=".5"/>
    </g>
    <circle cx="270" cy="290" r="${8.5 * s}" fill="${PIEL.media}"/>
    <g class="ae-limpia">
      <path d="M${x + 38 * s} ${y + 24 * s} C258 262 214 276 176 266" fill="none" stroke="${manga}" stroke-width="${g}" stroke-linecap="round"/>
      <circle cx="172" cy="265" r="${8.5 * s}" fill="${PIEL.media}"/>
      <rect x="152" y="256" width="17" height="14" rx="4" fill="#fff" stroke="#E3DEF2" stroke-width="2"/>
    </g>
    ${insignia(330, 88, '#E9735F', `<rect x="-9" y="-12" width="18" height="28" rx="7" fill="#C8EEFC"/><rect x="-6" y="-20" width="12" height="9" rx="4" fill="#F2B4CC"/><path d="M-4 4 C-4 -1 4 -1 4 4 C4 8 0 10 0 10 C0 10 -4 8 -4 4 Z" fill="#F7B733"/><circle r="22" fill="none" stroke="#E9735F" stroke-width="4"/><path d="M-15 -15 L15 15" stroke="#E9735F" stroke-width="4" stroke-linecap="round"/>`)}
    ${corazon(72, 92, 1.4)}${corazon(330, 190, 1, 'ae-sube ae-tarde')}
  </svg>`;
  })(),

  // Del primer diente a los 3 años: el adulto cepilla con crema del tamaño de un grano de arroz; primera visita al odontólogo.
  primer: (() => {
    const [ax, ay, as] = [122, 206, 1.15];
    const [nx, ny, ns] = [262, 232, 0.86];
    const boca = [nx, ny - 30 * ns];
    return `<svg viewBox="0 0 400 320" aria-hidden="true">
    ${fondo('#D6F0FB', '#F2FBFF')}
    ${persona(ax, ay, as, { piel: PIEL.clara, pelo: '#8A5A3C', ropa: '#91D9B5' })}
    ${persona(nx, ny, ns, { piel: PIEL.media, pelo: '#3B2C3E', ropa: '#FFD98A', boca: 'abre', moño: true })}
    <g class="ae-cepilla">
      ${brazo(ax, ay, as, 1, [boca[0] - 42, boca[1] + 6], { piel: PIEL.clara, ropa: '#7FCBA4', codo: [0, 22] })}
      <g transform="translate(${boca[0] - 8} ${boca[1]}) rotate(180)">${cepillo('#75BDF2', '<ellipse cx="10" cy="-16" rx="3" ry="2" fill="#fff" stroke="#9ED3F7" stroke-width="1.5"/>')}</g>
    </g>
    ${insignia(336, 78, '#75BDF2', `<path d="M-12 -8 C-12 -18 -2 -18 0 -13 C2 -18 12 -18 12 -8 C12 2 9 5 7 15 C5 20 2 18 0 10 C-2 18 -5 20 -7 15 C-9 5 -12 2 -12 -8 Z" fill="#C8EEFC" stroke="#75BDF2" stroke-width="2.5"/><circle cx="18" cy="-18" r="10" fill="#E9735F"/><text x="18" y="-14" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="sans-serif">1</text>`)}
    <g transform="translate(66 84)"><rect x="-40" y="-16" width="80" height="32" rx="16" fill="#fff"/><g class="ae-late"><ellipse cx="-24" cy="0" rx="5" ry="3" fill="#fff" stroke="#9ED3F7" stroke-width="2"/></g><text x="10" y="5" text-anchor="middle" font-size="13" font-weight="800" fill="${TINTA}" font-family="sans-serif">arroz</text></g>
    ${estrella(344, 250, 9, '#B8A5ED', 'ae-titila ae-tarde')}
  </svg>`;
  })(),

  // De 3 a 6 años: el niño cepilla dos minutos con crema del tamaño de una arveja y el adulto lo acompaña y repasa.
  preescolar: (() => {
    const [ax, ay, as] = [124, 210, 1.2];
    const [nx, ny, ns] = [226, 236, 0.95];
    const boca = [nx, ny - 30 * ns];
    return `<svg viewBox="0 0 400 320" aria-hidden="true">
    ${fondo('#E8E3FB', '#F8F6FF')}
    <path d="M330 52 A24 24 0 1 0 352 88 A18 18 0 1 1 330 52 Z" fill="#FFD98A"/>
    ${persona(ax, ay, as, { piel: PIEL.oscura, pelo: '#2B1E1A', ropa: '#B8A5ED' })}
    ${persona(nx, ny, ns, { piel: PIEL.clara, pelo: '#8A5A3C', ropa: '#F2B4CC', boca: 'abre' })}
    ${brazo(ax, ay, as, 1, [nx - 34 * ns, ny + 14 * ns], { piel: PIEL.oscura, ropa: '#A08CE0', codo: [6, -14] })}
    <g class="ae-cepilla">
      ${brazo(nx, ny, ns, 1, [boca[0] + 34, boca[1] + 4], { piel: PIEL.clara, ropa: '#E99BB9', codo: [26, 10] })}
      <g transform="translate(${boca[0] + 6} ${boca[1]})">${cepillo('#91D9B5', '<circle cx="10" cy="-17" r="4.5" fill="#7FCBA4"/>')}</g>
    </g>
    <g class="ae-espuma"><circle cx="${boca[0] - 16}" cy="${boca[1] - 6}" r="5" fill="#fff"/><circle cx="${boca[0] - 26}" cy="${boca[1] - 16}" r="3.5" fill="#fff"/><circle cx="${boca[0] - 12}" cy="${boca[1] - 22}" r="3" fill="#fff"/></g>
    <g transform="translate(338 158)">
      <circle r="34" fill="#fff"/><circle r="27" fill="none" stroke="#E3DEF2" stroke-width="6"/>
      <circle class="ae-reloj" r="27" fill="none" stroke="#7FCBA4" stroke-width="6" stroke-linecap="round" stroke-dasharray="170" stroke-dashoffset="170" transform="rotate(-90)"/>
      <text y="6" text-anchor="middle" font-size="16" font-weight="900" fill="${TINTA}" font-family="sans-serif">2:00</text>
    </g>
    ${estrella(64, 82, 10)}${estrella(276, 64, 7, '#FFD98A', 'ae-titila ae-tarde')}
  </svg>`;
  })(),

  // De 6 a 8 años: el adulto acompaña y revisa; hilo dental cuando los dientes se tocan.
  escolar: (() => {
    const [ax, ay, as] = [100, 210, 1.15];
    const [nx, ny, ns] = [196, 230, 1];
    const boca = [nx, ny - 30 * ns];
    return `<svg viewBox="0 0 400 320" aria-hidden="true">
    ${fondo('#D9F3E6', '#F3FCF7')}
    ${persona(ax, ay, as, { piel: PIEL.media, pelo: '#5A3A2E', ropa: '#FFA995' })}
    ${persona(nx, ny, ns, { piel: PIEL.clara, pelo: '#3B2C3E', ropa: '#75BDF2', moño: true })}
    ${brazo(ax, ay, as, 1, [nx - 34 * ns, ny + 14 * ns], { piel: PIEL.media, ropa: '#F08F79', codo: [6, -12] })}
    <g class="ae-cepilla">
      ${brazo(nx, ny, ns, 1, [boca[0] + 34, boca[1] + 4], { piel: PIEL.clara, ropa: '#5FA9E0', codo: [26, 10] })}
      <g transform="translate(${boca[0] + 6} ${boca[1]})">${cepillo('#7FCBA4')}</g>
    </g>
    <g transform="translate(70 96)"><g class="ae-pulso"><circle r="18" fill="#7FCBA4"/><path d="M-8 0 L-2 7 L9 -6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g></g>
    <g transform="translate(318 150)">
      <rect x="-62" y="-70" width="124" height="140" rx="30" fill="#fff"/>
      <path d="M-52 -36 C-52 -54 -26 -54 -23 -43 C-20 -54 -2 -52 -4 -36 C-4 -18 -9 -6 -11 16 C-13 27 -20 27 -22 14 C-24 5 -27 5 -29 14 C-31 27 -40 27 -42 16 C-44 -6 -52 -18 -52 -36 Z" fill="#F7F4FF" stroke="#C8C0E8" stroke-width="3"/>
      <path d="M4 -36 C4 -54 30 -54 33 -43 C36 -54 54 -52 52 -36 C52 -18 47 -6 45 16 C43 27 36 27 34 14 C32 5 29 5 27 14 C25 27 16 27 14 16 C12 -6 4 -18 4 -36 Z" fill="#F7F4FF" stroke="#C8C0E8" stroke-width="3"/>
      <g class="ae-hilo"><path d="M0 -64 L0 34" stroke="#75BDF2" stroke-width="3"/><circle cy="-64" r="5" fill="#75BDF2"/></g>
      ${estrella(40, -50, 9)}
    </g>
  </svg>`;
  })(),

  // En casa: la familia se cepilla junta frente al espejo; agua para calmar la sed.
  casa: (() => {
    const [ax, ay, as] = [142, 200, 1];
    const [nx, ny, ns] = [222, 220, 0.8];
    const ba = [ax, ay - 30 * as];
    const bn = [nx, ny - 30 * ns];
    return `<svg viewBox="0 0 400 320" aria-hidden="true">
    ${fondo('#FFEBC2', '#FFF9EC')}
    <rect x="62" y="34" width="226" height="200" rx="44" fill="#fff"/>
    <rect x="74" y="46" width="202" height="176" rx="34" fill="#C8EEFC"/>
    <path d="M100 76 L132 64 M100 98 L164 74" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".7"/>
    ${persona(ax, ay, as, { piel: PIEL.oscura, pelo: '#2B1E1A', ropa: '#7FCBA4' })}
    ${persona(nx, ny, ns, { piel: PIEL.oscura, pelo: '#2B1E1A', ropa: '#F2B4CC', moño: true })}
    <g class="ae-cepilla">
      ${brazo(ax, ay, as, 1, [ba[0] + 36, ba[1] + 4], { piel: PIEL.oscura, ropa: '#5FB98E', codo: [24, 8] })}
      <g transform="translate(${ba[0] + 7} ${ba[1]})">${cepillo('#FFA995')}</g>
    </g>
    <g class="ae-cepilla ae-tarde">
      ${brazo(nx, ny, ns, 1, [bn[0] + 30, bn[1] + 4], { piel: PIEL.oscura, ropa: '#E99BB9', codo: [22, 8] })}
      <g transform="translate(${bn[0] + 6} ${bn[1]}) scale(.8)">${cepillo('#B8A5ED')}</g>
    </g>
    <rect x="50" y="230" width="250" height="24" rx="12" fill="#fff"/>
    <g transform="translate(336 196)">
      <path d="M-22 -40 L22 -40 L16 34 C15 40 -15 40 -16 34 Z" fill="#fff" stroke="#C8EEFC" stroke-width="4"/>
      <path d="M-18 -10 L18 -10 L15 32 C14 36 -14 36 -15 32 Z" fill="#9ED3F7"/>
      <g class="ae-burbuja"><circle cx="-4" cy="20" r="3" fill="#fff"/></g><g class="ae-burbuja ae-tarde"><circle cx="6" cy="26" r="2.5" fill="#fff"/></g>
    </g>
    ${corazon(330, 96, 1.6)}${corazon(360, 66, 1, 'ae-sube ae-tarde')}
  </svg>`;
  })(),

  // En el aula: el docente guía; secuencia de cinco sesiones; cepillado después de comer.
  aula: (() => {
    const [dx, dy, ds] = [84, 246, 0.95];
    return `<svg viewBox="0 0 400 320" aria-hidden="true">
    ${fondo('#DDEEFB', '#F4FAFF')}
    <rect x="58" y="30" width="284" height="124" rx="22" fill="#B98B6E"/>
    <rect x="66" y="38" width="268" height="108" rx="16" fill="#2F6B57"/>
    <g class="ae-tiza"><path d="M92 70 C92 56 104 56 106 64 C108 56 120 56 120 70 C120 86 114 92 112 104 C110 110 106 108 106 100 C106 108 102 110 100 104 C98 92 92 86 92 70 Z" fill="none" stroke="#fff" stroke-width="3"/></g>
    <text x="218" y="74" text-anchor="middle" font-size="20" font-weight="900" fill="#fff" font-family="sans-serif">5 sesiones</text>
    <g transform="translate(150 108)">${[0, 1, 2, 3, 4].map((i) => `<circle class="ae-sesion" style="animation-delay:${i * 0.5}s" cx="${i * 34}" cy="0" r="11" fill="#fff" opacity=".3"/>`).join('')}</g>
    ${persona(dx, dy, ds, { piel: PIEL.media, pelo: '#3B2C3E', ropa: '#B8A5ED' })}
    <g class="ae-senala">${brazo(dx, dy, ds, 1, [146, 164], { piel: PIEL.media, ropa: '#A08CE0', codo: [16, 10] })}</g>
    ${persona(186, 268, 0.72, { piel: PIEL.clara, pelo: '#8A5A3C', ropa: '#FFD98A', clase: 'ae-salta' })}
    ${persona(258, 268, 0.72, { piel: PIEL.oscura, pelo: '#2B1E1A', ropa: '#F2B4CC', moño: true, clase: 'ae-salta ae-tarde' })}
    ${persona(330, 268, 0.72, { piel: PIEL.media, pelo: '#5A3A2E', ropa: '#7FCBA4', clase: 'ae-salta ae-mas-tarde' })}
  </svg>`;
  })(),
};
