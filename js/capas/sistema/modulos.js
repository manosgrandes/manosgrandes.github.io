// Registro de módulos del sistema (capa 3). Cada módulo define su menú, permisos y rutas.
// Para agregar un módulo nuevo: crear js/modulos/<nombre>/index.js y registrarlo aquí.

const TODOS = ['nino', 'adulto', 'invitado'];
const ADULTOS = ['adulto', 'invitado'];

export const GRUPOS = {
  aprender: 'Aprender jugando',
  acompanar: 'Acompañar',
  gestion: 'Comunidad y gestión',
  cuenta: 'Mi espacio',
};

export const MODULOS = [
  {
    id: 'inicio', titulo: 'Inicio', icono: '🏠', color: '#4FC3F7', roles: TODOS,
    desc: 'Tu tablero', rutas: [[/^$/, () => import('./inicio.js')]],
  },
  {
    id: 'juegos', grupo: 'aprender', titulo: 'Juegos', icono: '🎮', color: '#4FC3F7', roles: TODOS,
    desc: 'Cepilla a Dientín, arma la lonchera y gana estrellas.',
    rutas: [
      [/^$/, () => import('../../modulos/juegos/index.js'), { encabezado: true }],
      [/^([\w-]+)$/, () => import('../../modulos/juegos/juego.js')],
    ],
  },
  {
    id: 'cuentos', grupo: 'aprender', titulo: 'Cuentos', icono: '📚', color: '#4CC38A', roles: TODOS,
    desc: 'Historias para leer y escuchar, y tus propios libros.',
    rutas: [
      [/^$/, () => import('../../modulos/cuentos/index.js'), { encabezado: true }],
      [/^nuevo$/, () => import('../../modulos/cuentos/editor.js')],
      [/^(local|nube|base)\/([\w-]+)$/, () => import('../../modulos/cuentos/lector.js')],
    ],
  },
  {
    id: 'guias', grupo: 'acompanar', titulo: 'Guías para padres y docentes', corto: 'Guías', icono: '👨‍👩‍👧', color: '#FF7A85', roles: ADULTOS,
    desc: 'Higiene por edades, alimentación, acompañamiento y aula.',
    rutas: [
      [/^$/, () => import('../../modulos/guias/index.js'), { encabezado: true }],
      [/^([\w-]+)$/, () => import('../../modulos/guias/articulo.js')],
    ],
  },
  {
    id: 'recordatorios', grupo: 'acompanar', titulo: 'Recordatorios', icono: '⏰', color: '#F4A900', roles: TODOS,
    desc: 'Alarmas de cepillado, temporizador y calendario de estrellas.',
    rutas: [[/^$/, () => import('../../modulos/recordatorios/index.js'), { encabezado: true }]],
  },
  {
    id: 'docentes', grupo: 'gestion', titulo: 'Panel docente', icono: '📊', color: '#9B8CFF', roles: ADULTOS,
    desc: 'Aulas, seguimiento de estudiantes y reportes.',
    rutas: [[/^$/, () => import('../../modulos/docentes/index.js'), { encabezado: true }]],
  },
  {
    id: 'foro', grupo: 'gestion', titulo: 'Foro', icono: '💬', color: '#4CC38A', roles: ADULTOS,
    desc: 'Ideas y dudas entre familias y docentes.',
    rutas: [
      [/^$/, () => import('../../modulos/foro/index.js'), { encabezado: true }],
      [/^([\w-]+)$/, () => import('../../modulos/foro/index.js')],
    ],
  },
  {
    id: 'contacto', grupo: 'gestion', titulo: 'Contacto', icono: '✉️', color: '#4FC3F7', roles: ADULTOS,
    desc: 'Escríbenos tus preguntas e ideas.',
    rutas: [[/^$/, () => import('../../modulos/contacto/index.js'), { encabezado: true }]],
  },
  {
    id: 'perfil', grupo: 'cuenta', titulo: 'Mi perfil', icono: '⭐', color: '#F4A900', roles: ['nino'],
    desc: 'Tus estrellas, medallas y tu aula.',
    rutas: [[/^$/, () => import('../../modulos/perfil/index.js'), { encabezado: true }]],
  },
  {
    id: 'cuenta', grupo: 'cuenta', titulo: 'Mi cuenta', icono: '👤', color: '#56618A', roles: ['adulto'],
    desc: 'Datos de tu cuenta y cuentos enviados.',
    rutas: [[/^$/, () => import('../../modulos/cuenta/index.js'), { encabezado: true }]],
  },
  {
    id: 'admin', grupo: 'cuenta', titulo: 'Administración', icono: '🛠️', color: '#E2557A', roles: ['adulto'], soloAdmin: true,
    desc: 'Aprobar cuentos, moderar el foro y ver estadísticas.',
    rutas: [[/^$/, () => import('../../modulos/admin/index.js'), { encabezado: true }]],
  },
];

/** Módulos visibles para un tipo de sesión. */
export const modulosPara = (tipo, esAdmin = false) =>
  MODULOS.filter((m) => m.roles.includes(tipo) && (!m.soloAdmin || esAdmin));

/** Resuelve "/app/juegos/memoria" → { modulo, vista, params, opciones }. */
export function resolver(resto) {
  const [id = '', ...partes] = resto.split('/').filter(Boolean);
  const modulo = MODULOS.find((m) => m.id === (id || 'inicio'));
  if (!modulo) return null;
  const sub = partes.join('/');
  for (const [re, cargar, opciones = {}] of modulo.rutas) {
    const m = sub.match(re);
    if (m) return { modulo, cargar, params: m.slice(1), opciones };
  }
  return null;
}
