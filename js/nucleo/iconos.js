// Íconos de línea (SVG en línea, heredan el color del texto). Estilo inspirado en Lucide (licencia ISC).

const P = {
  inicio: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  juegos: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="15.5" cy="11.5" r=".9" fill="currentColor"/><circle cx="17.5" cy="13.8" r=".9" fill="currentColor"/>',
  cuentos: '<path d="M2 5.5A1.5 1.5 0 0 1 3.5 4H9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5h-6A1.5 1.5 0 0 1 2 16V5.5Z"/><path d="M22 5.5A1.5 1.5 0 0 0 20.5 4H15a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5h6A1.5 1.5 0 0 0 22 16V5.5Z"/>',
  guias: '<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.5 20v-1.5A4.5 4.5 0 0 1 7 14h2a4.5 4.5 0 0 1 4.5 4.5V20"/><path d="M14.5 14.3A3.8 3.8 0 0 1 21.5 16.5V20"/>',
  recordatorios: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M5 3 2.5 5.5M19 3l2.5 2.5"/>',
  docentes: '<path d="M3 3v18h18"/><path d="M8 16v-5M13 16V8M18 16v-3"/>',
  foro: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12Z"/>',
  contacto: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3 6.5 9 6.5 9-6.5"/>',
  perfil: '<path d="m12 2.8 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.1 6.4 20l1.1-6.2L3 9.4l6.2-.9L12 2.8Z"/>',
  cuenta: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1"/>',
  admin: '<path d="M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10v-6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  salir: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  cambiar: '<path d="M17 2.5 21 6.5l-4 4"/><path d="M3 11.5v-1a4 4 0 0 1 4-4h14"/><path d="m7 21.5-4-4 4-4"/><path d="M21 12.5v1a4 4 0 0 1-4 4H3"/>',
  web: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5a14.5 14.5 0 0 1 0 19M12 2.5a14.5 14.5 0 0 0 0 19"/>',
  sonido: '<path d="M11 4.7 6.5 8.5H3v7h3.5l4.5 3.8V4.7Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  atras: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  chispa: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
  diente: '<path d="M7.5 3C5 3 3.5 5 3.5 7.6c0 2.6 1 4.4 1.6 7 .6 2.7 1 6.4 2.9 6.4 1.7 0 1.6-3.3 2.2-5.1.4-1.1 1-1.4 1.8-1.4s1.4.3 1.8 1.4c.6 1.8.5 5.1 2.2 5.1 1.9 0 2.3-3.7 2.9-6.4.6-2.6 1.6-4.4 1.6-7C20.5 5 19 3 16.5 3c-1.9 0-2.7 1.1-4.5 1.1S9.4 3 7.5 3Z"/>',
  manzana: '<path d="M12 7.5c-1.3-1-2.8-1.5-4.3-1.3C4.6 6.6 3 9.5 3.5 13c.6 4.4 3.3 8 5.8 8 1.1 0 1.6-.6 2.7-.6s1.6.6 2.7.6c2.5 0 5.2-3.6 5.8-8 .5-3.5-1.1-6.4-4.2-6.8-1.5-.2-3 .3-4.3 1.3Z"/><path d="M12 7.5c0-2.2 1-3.7 3-4.5"/>',
  manos: '<path d="M7 11.5V6a1.5 1.5 0 0 1 3 0v4.5"/><path d="M10 10V4.5a1.5 1.5 0 0 1 3 0V10"/><path d="M13 10V5.5a1.5 1.5 0 0 1 3 0v6"/><path d="M16 11.5V8.5a1.5 1.5 0 0 1 3 0v5.5a7.5 7.5 0 0 1-7.5 7.5h-.6a7 7 0 0 1-5.3-2.4L3.3 16a1.6 1.6 0 0 1 2.3-2.2L7 15.2"/>',
  candado: '<rect x="4" y="10.5" width="16" height="11" rx="2.5"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  sinred: '<path d="M2 8.8a15 15 0 0 1 4.2-2.6M10.7 5.1A15 15 0 0 1 22 8.8M5 12.9a10 10 0 0 1 5.2-2.7M15.2 10.7A10 10 0 0 1 19 12.9M8.5 16.4a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r=".8" fill="currentColor"/><path d="m2 2 20 20"/>',
  campana: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  llave: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17.5 5.5l3 3M15 8l2 2"/>',
  abajo: '<path d="m6 9 6 6 6-6"/>',
  ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  usuario_mas: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a7 7 0 0 1 7-7h0a7 7 0 0 1 7 7v1M19 8v6M16 11h6"/>',
  escuela: '<path d="m12 3 10 5-10 5L2 8l10-5Z"/><path d="M6 10.2V16c0 1.6 2.7 3 6 3s6-1.4 6-3v-5.8M22 8v6"/>',
  corazon: '<path d="M12 20.5s-8.5-4.9-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 6.1-8.5 11-8.5 11Z"/>',
  gratis: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.3" fill="currentColor"/>',
  medalla: '<circle cx="12" cy="14.5" r="6"/><path d="M8.5 9.6 6 2.5h4l2 4 2-4h4l-2.5 7.1"/><path d="m12 12 .9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3L12 12Z"/>',
  invitado: '<circle cx="12" cy="12" r="9.5"/><path d="M8.5 14.5s1.3 2 3.5 2 3.5-2 3.5-2"/><circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="15" cy="10" r=".9" fill="currentColor"/>',
};

/** Devuelve el SVG del ícono `nombre`. */
export function icono(nombre, { tam = 20, clase = '', titulo = '' } = {}) {
  const d = P[nombre] || P.chispa;
  const a11y = titulo ? `role="img" aria-label="${titulo}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="ico ${clase}" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${d}</svg>`;
}
