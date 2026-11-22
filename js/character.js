// Dientín: personaje principal del sitio, dibujado en SVG (liviano y animable).

const CARAS = {
  feliz: {
    ojos: '<ellipse cx="80" cy="85" rx="9" ry="12" fill="#23305A"/><ellipse cx="120" cy="85" rx="9" ry="12" fill="#23305A"/><circle cx="83" cy="80" r="3.5" fill="#fff"/><circle cx="123" cy="80" r="3.5" fill="#fff"/>',
    boca: '<path d="M78 112 Q100 138 122 112" fill="#FF7A85" stroke="#23305A" stroke-width="5" stroke-linecap="round"/>',
  },
  guino: {
    ojos: '<ellipse cx="80" cy="85" rx="9" ry="12" fill="#23305A"/><circle cx="83" cy="80" r="3.5" fill="#fff"/><path d="M110 88 Q120 78 130 88" fill="none" stroke="#23305A" stroke-width="5" stroke-linecap="round"/>',
    boca: '<path d="M80 112 Q100 134 120 112" fill="#FF7A85" stroke="#23305A" stroke-width="5" stroke-linecap="round"/>',
  },
  triste: {
    ojos: '<ellipse cx="80" cy="88" rx="8" ry="10" fill="#23305A"/><ellipse cx="120" cy="88" rx="8" ry="10" fill="#23305A"/><path d="M68 70 L90 76 M132 70 L110 76" stroke="#23305A" stroke-width="4" stroke-linecap="round"/>',
    boca: '<path d="M82 124 Q100 108 118 124" fill="none" stroke="#23305A" stroke-width="5" stroke-linecap="round"/>',
  },
  sorpresa: {
    ojos: '<circle cx="80" cy="85" r="11" fill="#23305A"/><circle cx="120" cy="85" r="11" fill="#23305A"/><circle cx="84" cy="80" r="4" fill="#fff"/><circle cx="124" cy="80" r="4" fill="#fff"/>',
    boca: '<ellipse cx="100" cy="120" rx="10" ry="12" fill="#FF7A85" stroke="#23305A" stroke-width="5"/>',
  },
};

const CEPILLO =
  '<g class="dientin-cepillo"><rect x="160" y="96" width="12" height="70" rx="6" fill="#4FC3F7" transform="rotate(25 166 130)"/><rect x="168" y="78" width="22" height="16" rx="4" fill="#fff" stroke="#9BD7F0" stroke-width="3" transform="rotate(25 166 130)"/></g>';

/**
 * Devuelve el SVG de Dientín.
 * @param {{animo?: 'feliz'|'guino'|'triste'|'sorpresa', tam?: number, cepillo?: boolean, clase?: string, etiqueta?: string}} op
 */
export function dientin({ animo = 'feliz', tam = 160, cepillo = false, clase = '', etiqueta = 'Dientín, el diente amigo' } = {}) {
  const cara = CARAS[animo] || CARAS.feliz;
  const sucio = animo === 'triste'
    ? '<circle cx="62" cy="150" r="7" fill="#C9B37A" opacity=".8"/><circle cx="140" cy="60" r="5" fill="#C9B37A" opacity=".8"/>'
    : '<path d="M150 40 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4z" fill="#FFD166"/>';
  return `<svg class="dientin ${clase}" width="${tam}" height="${tam * 1.1}" viewBox="0 0 200 220" role="img" aria-label="${etiqueta}">
  <ellipse cx="100" cy="212" rx="52" ry="7" fill="#23305A" opacity=".12"/>
  <path d="M40 62 Q40 18 80 22 Q100 32 120 22 Q160 18 160 62 Q162 112 148 152 Q140 200 125 205 Q112 205 108 172 Q100 152 92 172 Q88 205 75 205 Q60 200 52 152 Q38 112 40 62Z"
        fill="#FFFFFF" stroke="#23305A" stroke-width="6" stroke-linejoin="round"/>
  <path d="M56 50 Q60 34 78 34" fill="none" stroke="#DDF3FC" stroke-width="8" stroke-linecap="round"/>
  ${cara.ojos}
  <circle cx="64" cy="106" r="9" fill="#FFB3BA" opacity=".7"/><circle cx="136" cy="106" r="9" fill="#FFB3BA" opacity=".7"/>
  ${cara.boca}
  ${sucio}
  ${cepillo ? CEPILLO : ''}
</svg>`;
}

/** Burbuja de diálogo de Dientín con un mensaje. */
export function dientinDice(mensaje, op = {}) {
  return `<div class="dientin-dice">${dientin({ tam: 110, ...op })}<p class="burbuja">${mensaje}</p></div>`;
}
