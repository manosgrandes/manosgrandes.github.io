// Personajes ilustrados de los cuentos (SVG original, liviano y con ánimos).
// Cada personaje se dibuja con piezas: cabeza, peinado, ropa y cara según el ánimo.

const TINTA = '#3B3F66';
const PIELES = ['#FFDCC2', '#F5C6A0', '#E0A57A', '#C68156', '#9C6644'];
const PELOS = ['#4A2E1F', '#2B1D16', '#7A4A2E', '#C9893A', '#1F1A2E'];
const ROPAS = ['#F2B4CC', '#75BDF2', '#91D9B5', '#FFD98A', '#B8A5ED', '#FFA995'];

/** Número estable a partir de un texto (para variar colores por cuento sin azar). */
function semilla(texto) {
  let h = 0;
  for (const c of String(texto)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function cara(animo, cx = 60, cy = 56, conBoca = true) {
  const ojos = {
    feliz: `<ellipse cx="${cx - 12}" cy="${cy}" rx="4.5" ry="5.5" fill="${TINTA}"/><ellipse cx="${cx + 12}" cy="${cy}" rx="4.5" ry="5.5" fill="${TINTA}"/><circle cx="${cx - 10.5}" cy="${cy - 2}" r="1.6" fill="#fff"/><circle cx="${cx + 13.5}" cy="${cy - 2}" r="1.6" fill="#fff"/>`,
    guino: `<ellipse cx="${cx - 12}" cy="${cy}" rx="4.5" ry="5.5" fill="${TINTA}"/><circle cx="${cx - 10.5}" cy="${cy - 2}" r="1.6" fill="#fff"/><path d="M${cx + 7} ${cy + 1} Q${cx + 12} ${cy - 5} ${cx + 17} ${cy + 1}" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    triste: `<ellipse cx="${cx - 12}" cy="${cy + 1}" rx="4" ry="4.5" fill="${TINTA}"/><ellipse cx="${cx + 12}" cy="${cy + 1}" rx="4" ry="4.5" fill="${TINTA}"/><path d="M${cx - 18} ${cy - 6} L${cx - 7} ${cy - 10} M${cx + 18} ${cy - 6} L${cx + 7} ${cy - 10}" stroke="${TINTA}" stroke-width="2.5" stroke-linecap="round"/>`,
    sorpresa: `<circle cx="${cx - 12}" cy="${cy}" r="5.5" fill="${TINTA}"/><circle cx="${cx + 12}" cy="${cy}" r="5.5" fill="${TINTA}"/><circle cx="${cx - 10}" cy="${cy - 2}" r="2" fill="#fff"/><circle cx="${cx + 14}" cy="${cy - 2}" r="2" fill="#fff"/>`,
  }[animo] || '';
  const boca = {
    feliz: `<path d="M${cx - 9} ${cy + 13} Q${cx} ${cy + 23} ${cx + 9} ${cy + 13}" fill="#E9735F" stroke="${TINTA}" stroke-width="2.5" stroke-linecap="round"/>`,
    guino: `<path d="M${cx - 8} ${cy + 14} Q${cx} ${cy + 21} ${cx + 8} ${cy + 14}" fill="none" stroke="${TINTA}" stroke-width="3" stroke-linecap="round"/>`,
    triste: `<path d="M${cx - 7} ${cy + 19} Q${cx} ${cy + 12} ${cx + 7} ${cy + 19}" fill="none" stroke="${TINTA}" stroke-width="3" stroke-linecap="round"/>`,
    sorpresa: `<ellipse cx="${cx}" cy="${cy + 17}" rx="5" ry="6" fill="#E9735F" stroke="${TINTA}" stroke-width="2.5"/>`,
  }[animo] || '';
  if (!conBoca) return ojos;
  return `${ojos}<circle cx="${cx - 20}" cy="${cy + 10}" r="5.5" fill="#F7A1B5" opacity=".6"/><circle cx="${cx + 20}" cy="${cy + 10}" r="5.5" fill="#F7A1B5" opacity=".6"/>${boca}`;
}

const PEINADOS = {
  coletas: (c) => `<circle cx="22" cy="44" r="13" fill="${c}"/><circle cx="98" cy="44" r="13" fill="${c}"/><circle cx="25" cy="44" r="4" fill="#F2B4CC"/><circle cx="95" cy="44" r="4" fill="#F2B4CC"/>
    <path d="M26 50 Q24 14 60 14 Q96 14 94 50 Q86 32 60 30 Q34 32 26 50 Z" fill="${c}"/>`,
  corto: (c) => `<path d="M25 52 Q22 14 60 13 Q98 14 95 52 Q92 36 80 31 Q70 38 56 33 Q40 30 30 40 Z" fill="${c}"/>`,
  largo: (c) => `<path d="M24 56 Q18 12 60 12 Q102 12 96 56 L100 92 Q90 98 84 90 L86 48 Q80 30 60 29 Q40 30 34 48 L36 90 Q30 98 20 92 Z" fill="${c}"/>`,
  mono: (c) => `<circle cx="60" cy="14" r="13" fill="${c}"/><path d="M26 50 Q24 18 60 18 Q96 18 94 50 Q86 32 60 31 Q34 32 26 50 Z" fill="${c}"/>`,
  canas: () => `<path d="M26 58 Q20 40 30 34 Q30 46 34 50 Z M94 58 Q100 40 90 34 Q90 46 86 50 Z" fill="#E4E4EC"/><path d="M38 24 Q60 16 82 24" stroke="#E4E4EC" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  rizo: (c) => `<path d="M58 20 Q52 10 60 8 Q68 8 64 16" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
};

const GAFAS = `<g fill="none" stroke="${TINTA}" stroke-width="2.5"><circle cx="48" cy="56" r="9"/><circle cx="72" cy="56" r="9"/><path d="M57 56 L63 56"/></g>`;
const BIGOTE = `<path d="M48 68 Q54 63 60 67 Q66 63 72 68 Q66 72 60 69 Q54 72 48 68 Z" fill="#E4E4EC" stroke="#C9C9D6" stroke-width="1"/>`;

/** Cuerpo de una persona. `forma`: vestido | camisa | bata | mameluco | capa. */
function cuerpo({ forma, ropa, piel, adulto }) {
  const alto = adulto ? 1 : 0.85;
  const y0 = 88;
  const piernas = `<rect x="44" y="${y0 + 52 * alto}" width="12" height="${22 * alto}" rx="6" fill="${forma === 'mameluco' ? ropa : TINTA}" opacity="${forma === 'mameluco' ? 1 : .85}"/>
    <rect x="64" y="${y0 + 52 * alto}" width="12" height="${22 * alto}" rx="6" fill="${forma === 'mameluco' ? ropa : TINTA}" opacity="${forma === 'mameluco' ? 1 : .85}"/>
    <ellipse cx="50" cy="${y0 + 74 * alto}" rx="9" ry="5" fill="${TINTA}"/><ellipse cx="70" cy="${y0 + 74 * alto}" rx="9" ry="5" fill="${TINTA}"/>`;
  const brazos = `<rect x="22" y="${y0 + 6}" width="13" height="${38 * alto}" rx="6.5" fill="${forma === 'bata' ? '#fff' : ropa}" transform="rotate(14 28 ${y0 + 6})"/>
    <rect x="85" y="${y0 + 6}" width="13" height="${38 * alto}" rx="6.5" fill="${forma === 'bata' ? '#fff' : ropa}" transform="rotate(-14 92 ${y0 + 6})"/>
    <circle cx="20" cy="${y0 + 42 * alto}" r="7" fill="${piel}"/><circle cx="100" cy="${y0 + 42 * alto}" r="7" fill="${piel}"/>`;
  const capa = forma === 'capa' ? `<path d="M36 ${y0 + 2} L18 ${y0 + 70} Q60 ${y0 + 84} 102 ${y0 + 70} L84 ${y0 + 2} Z" fill="#E9735F"/>` : '';
  let torso;
  if (forma === 'vestido') torso = `<path d="M40 ${y0} Q60 ${y0 - 6} 80 ${y0} L94 ${y0 + 58 * alto} Q60 ${y0 + 66 * alto} 26 ${y0 + 58 * alto} Z" fill="${ropa}"/><path d="M30 ${y0 + 50 * alto} Q60 ${y0 + 58 * alto} 90 ${y0 + 50 * alto}" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`;
  else if (forma === 'bata') torso = `<rect x="36" y="${y0}" width="48" height="${60 * alto}" rx="16" fill="${ropa}"/><path d="M36 ${y0 + 8} Q36 ${y0} 50 ${y0} L56 ${y0 + 60 * alto} L36 ${y0 + 60 * alto} Z M84 ${y0 + 8} Q84 ${y0} 70 ${y0} L64 ${y0 + 60 * alto} L84 ${y0 + 60 * alto} Z" fill="#fff"/><circle cx="74" cy="${y0 + 24}" r="5" fill="none" stroke="#75BDF2" stroke-width="2.5"/><path d="M74 ${y0 + 29} L74 ${y0 + 36}" stroke="#75BDF2" stroke-width="2.5"/>`;
  else torso = `<rect x="36" y="${y0}" width="48" height="${56 * alto}" rx="18" fill="${ropa}"/><path d="M50 ${y0} Q60 ${y0 + 10} 70 ${y0}" fill="#fff" opacity=".7"/>`;
  if (forma === 'capa') torso += `<path d="M50 ${y0 + 18} L60 ${y0 + 30} L70 ${y0 + 18} Z" fill="#FFD98A"/>`;
  return capa + piernas + brazos + torso;
}

function persona({ piel, pelo, peinado, forma, ropa, adulto = false, gafas = false, bigote = false, antifaz = false, animo }) {
  const cabeza = `<circle cx="60" cy="56" r="34" fill="${piel}"/><circle cx="26" cy="60" r="6" fill="${piel}"/><circle cx="94" cy="60" r="6" fill="${piel}"/>`;
  const pelo1 = peinado === 'largo' ? PEINADOS.largo(pelo) : '';
  const pelo2 = peinado !== 'largo' ? PEINADOS[peinado](pelo) : `<path d="M26 50 Q24 14 60 13 Q96 14 94 50 Q84 30 60 30 Q36 30 26 50 Z" fill="${pelo}"/>`;
  const mascara = antifaz ? `<path d="M30 50 Q60 40 90 50 L88 62 Q74 66 60 58 Q46 66 32 62 Z" fill="#7B5CFA" opacity=".9"/>` : '';
  return `${pelo1}${cuerpo({ forma, ropa, piel, adulto })}${cabeza}${pelo2}${mascara}${cara(animo)}${gafas ? GAFAS : ''}${bigote ? BIGOTE : ''}`;
}

const DIBUJOS = {
  nina: (v, animo) => persona({ ...v, peinado: 'coletas', forma: 'vestido', animo }),
  nino: (v, animo) => persona({ ...v, peinado: 'corto', forma: 'camisa', animo }),
  mama: (v, animo) => persona({ ...v, peinado: 'largo', forma: 'vestido', adulto: true, animo }),
  papa: (v, animo) => persona({ ...v, peinado: 'corto', forma: 'camisa', adulto: true, animo }),
  abuelo: (v, animo) => persona({ ...v, peinado: 'canas', forma: 'camisa', ropa: '#B8A5ED', adulto: true, gafas: true, bigote: true, animo }),
  abuela: (v, animo) => persona({ ...v, pelo: '#E4E4EC', peinado: 'mono', forma: 'vestido', ropa: '#91D9B5', adulto: true, gafas: true, animo }),
  doctora: (v, animo) => persona({ ...v, peinado: 'mono', forma: 'bata', ropa: '#75BDF2', adulto: true, animo }),
  doctor: (v, animo) => persona({ ...v, peinado: 'corto', forma: 'bata', ropa: '#91D9B5', adulto: true, gafas: true, animo }),
  bebe: (v, animo) => persona({ ...v, peinado: 'rizo', forma: 'mameluco', ropa: '#9ED4F7', animo }),
  heroina: (v, animo) => persona({ ...v, peinado: 'coletas', forma: 'capa', ropa: '#7B5CFA', antifaz: true, animo }),
  bacteria: (_v, animo) => {
    const puas = Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      const x = 60 + Math.cos(a) * 44, y = 98 + Math.sin(a) * 40;
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8" fill="#7ED957"/>`;
    }).join('');
    return `${puas}<ellipse cx="60" cy="98" rx="44" ry="40" fill="#8FE36A"/><circle cx="40" cy="80" r="7" fill="#B6F094"/><circle cx="82" cy="118" r="5" fill="#B6F094"/>
      <path d="M38 76 L52 82 M82 76 L68 82" stroke="${TINTA}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="47" cy="92" r="7" fill="#fff"/><circle cx="73" cy="92" r="7" fill="#fff"/><circle cx="48" cy="93" r="3.5" fill="${TINTA}"/><circle cx="72" cy="93" r="3.5" fill="${TINTA}"/>
      ${animo === 'triste' || animo === 'feliz'
        ? `<path d="M44 108 Q60 122 76 108" fill="#3B3F66"/><path d="M50 110 L53 116 L56 111 M64 111 L67 116 L70 110" fill="#fff"/>`
        : `<ellipse cx="60" cy="112" rx="9" ry="7" fill="${TINTA}"/>`}`;
  },
  dragon: (_v, animo) => `
    <path d="M30 86 Q4 60 10 40 Q28 52 40 74 Z M90 86 Q116 60 110 40 Q92 52 80 74 Z" fill="#5CC9A0"/>
    <path d="M86 140 Q118 140 112 116 Q104 130 88 126 Z" fill="#3FAF86"/>
    <ellipse cx="60" cy="118" rx="34" ry="38" fill="#4CC491"/><ellipse cx="60" cy="124" rx="20" ry="26" fill="#FFE7A8"/>
    <rect x="38" y="146" width="14" height="14" rx="7" fill="#3FAF86"/><rect x="68" y="146" width="14" height="14" rx="7" fill="#3FAF86"/>
    <path d="M40 34 L46 14 L54 30 Z M66 30 L74 14 L80 34 Z" fill="#FFD98A"/>
    <ellipse cx="60" cy="58" rx="36" ry="32" fill="#4CC491"/><ellipse cx="60" cy="74" rx="20" ry="12" fill="#6FD6AA"/>
    <circle cx="53" cy="74" r="2.5" fill="${TINTA}"/><circle cx="67" cy="74" r="2.5" fill="${TINTA}"/>
    ${cara(animo, 60, 50, false)}
    ${animo === 'triste' ? `<path d="M52 86 Q60 81 68 86" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>` : `<path d="M50 83 Q60 91 70 83" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>`}`,
};

/** Qué personaje representa cada emoji de las escenas. */
export const EMOJI_PERSONAJE = {
  '👧': 'nina', '👦': 'nino', '🧒': 'nino', '👩': 'mama', '👨': 'papa', '🧑': 'papa',
  '👴': 'abuelo', '👵': 'abuela', '👩‍⚕️': 'doctora', '👨‍⚕️': 'doctor', '👶': 'bebe',
  '🦸': 'heroina', '🦸‍♀️': 'heroina', '🐉': 'dragon', '🐲': 'dragon',
};

/** Busca el personaje de un emoji (también "🦠💨", "🦠🎉"…). */
export function personajeDeEmoji(e) {
  if (EMOJI_PERSONAJE[e]) return EMOJI_PERSONAJE[e];
  if (String(e).startsWith('🦠')) return 'bacteria';
  return null;
}

/**
 * SVG de un personaje.
 * @param {string} tipo  nina | nino | mama | papa | abuelo | abuela | doctora | doctor | bebe | heroina | bacteria | dragon
 * @param {{animo?: string, tam?: number, semilla?: string, nombre?: string, piel?: string, pelo?: string, ropa?: string}} op
 */
export function personaje(tipo, { animo = 'feliz', tam = 120, semilla: sem = '', nombre = '', piel, pelo, ropa } = {}) {
  const dibujar = DIBUJOS[tipo];
  if (!dibujar) return '';
  const n = semilla(`${sem}:${tipo}`);
  const v = {
    piel: piel || PIELES[n % PIELES.length],
    pelo: pelo || PELOS[(n >>> 3) % PELOS.length],
    ropa: ropa || ROPAS[(n >>> 6) % ROPAS.length],
  };
  const etiqueta = nombre || { nina: 'Una niña', nino: 'Un niño', mama: 'Mamá', papa: 'Papá', abuelo: 'El abuelo', abuela: 'La abuela', doctora: 'La odontóloga', doctor: 'El odontólogo', bebe: 'Un bebé', heroina: 'Una superheroína', bacteria: 'Una bacteria traviesa', dragon: 'Fuego, el dragón' }[tipo];
  return `<svg class="personaje personaje-${tipo}" width="${tam}" height="${Math.round(tam * 170 / 120)}" viewBox="0 0 120 170" role="img" aria-label="${etiqueta}">
    <ellipse cx="60" cy="166" rx="36" ry="4" fill="${TINTA}" opacity=".12"/>${dibujar(v, animo)}</svg>`;
}
