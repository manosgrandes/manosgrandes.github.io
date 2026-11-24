// Tablero de inicio del sistema: bienvenida y acceso a cada módulo según quién entró.

import { modulosPara } from './modulos.js';
import { sesion } from '../../nucleo/sesion.js';
import { perfiles, progreso, medallas, todasLasMedallas } from '../../nucleo/store.js';
import { SOFI } from '../../nucleo/sofi.js';
import { icono } from '../../nucleo/iconos.js';
import { esc } from '../../nucleo/util.js';
import { botonLeer } from '../../nucleo/speech.js';
import { nubeActiva } from '../../config.js';

const CONSEJOS = [
  'Cepíllate los dientes al menos dos veces al día. ¡El cepillado de la noche es el más importante!',
  'El agua es la mejor bebida para tus dientes.',
  'Pide a un adulto que repase tu cepillado. ¡Las manos grandes ayudan!',
  'Cambia tu cepillo cada tres meses.',
  'Las frutas y verduras crujientes son amigas de tus dientes.',
  'Escupe la espuma de la crema dental, pero no te enjuagues con mucha agua.',
  'Visita al odontólogo aunque no te duela nada.',
];

export function render(vista) {
  const s = sesion.actual();
  const id = sesion.identidad();
  const p = s.tipo === 'nino' ? perfiles.activo() : null;
  const r = p ? progreso.resumen(p.id) : null;
  const ganadas = p ? medallas(p.id).map((m) => m.id) : [];
  const consejo = CONSEJOS[new Date().getDate() % CONSEJOS.length];
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  const texto = {
    nino: `¿Qué quieres hacer hoy? Juega, lee un cuento y gana estrellas.`,
    adulto: s.rol === 'docente' ? 'Acompaña a tu grupo: guías, panel docente y comunidad.' : 'Acompaña a tus niños: guías, recordatorios y cuentos para leer juntos.',
    invitado: 'Estás explorando. Crea un perfil desde "Cambiar de usuario" para guardar estrellas.',
  }[s.tipo];

  const mods = modulosPara(s.tipo).filter((m) => m.id !== 'inicio');

  const rapidos = mods.slice(0, 4);
  vista.innerHTML = `
  <div id="alerta-admin"></div>
  <section class="tab-bienvenida">
    <div class="tab-bienvenida-txt">
      <p class="tab-fecha">${esc(new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }))}</p>
      <h1>${saludo}, ${esc(id.nombre)} <span aria-hidden="true">👋</span></h1>
      <p>${texto}</p>
      <a class="btn tab-cta" href="#/app/${s.tipo === 'adulto' ? 'guias' : 'juegos'}">${s.tipo === 'adulto' ? 'Ver guías' : '¡A jugar!'} ${icono('flecha', { tam: 18 })}</a>
    </div>
    <img class="tab-sofi" src="${SOFI.img}" alt="" width="${SOFI.ancho}" height="${SOFI.alto}">
  </section>

  <nav class="tab-rapidos" aria-label="Accesos rápidos">
    ${rapidos.map((m, i) => `<a href="#/app/${m.id}" style="--c:${m.color};--t:${m.tinte};--i:${i}"><span class="tab-burbuja" aria-hidden="true">${m.icono}</span><span>${esc(m.corto || m.titulo)}</span></a>`).join('')}
  </nav>

  <div class="tab-fila">
    <section class="tab-consejo">
      <img src="${SOFI.cara}" alt="" width="72" height="72">
      <div>
        <p class="tab-consejo-titulo">Consejo de Sofi</p>
        <p class="tab-consejo-txt">${consejo}</p>
        ${botonLeer(consejo)}
      </div>
    </section>
    ${r ? `<section class="tarjeta tab-progreso">
      <h2>Tu progreso</h2>
      <dl>
        <div><dt>Estrellas</dt><dd>${r.totalEstrellas} <span aria-hidden="true">⭐</span></dd></div>
        <div><dt>Medallas</dt><dd>${ganadas.length} <span aria-hidden="true">🏅</span></dd></div>
        <div><dt>Actividades</dt><dd>${r.partidas} <span aria-hidden="true">🎯</span></dd></div>
      </dl>
    </section>` : `<section class="tarjeta tab-progreso">
      <h2>¿Por dónde empezar?</h2>
      <p class="suave" style="margin:0">${s.tipo === 'invitado' ? 'Prueba un juego o un cuento. Para guardar estrellas, entra con un perfil.' : 'Lee la guía "Higiene bucal según la edad" y descarga los recordatorios para tu celular.'}</p>
    </section>`}
  </div>

  <div class="tab-titulo"><h2>Todos los módulos</h2></div>
  <div class="tab-modulos">
    ${mods.map((m, i) => `
      <a class="tab-modulo" href="#/app/${m.id}" style="--c:${m.color};--t:${m.tinte};--i:${i}">
        <span class="tab-mosaico" aria-hidden="true">${m.icono}</span>
        <span class="tab-modulo-txt"><strong>${esc(m.titulo)}</strong><span>${esc(m.desc)}</span></span>
        <span class="tab-ir" aria-hidden="true">${icono('flecha', { tam: 18 })}</span>
      </a>`).join('')}
  </div>

  ${p ? `<section class="tab-medallas-sec">
    <div class="tab-titulo"><h2>Mis medallas</h2><a href="#/app/perfil">Ver todas</a></div>
    <div class="tab-medallas">${todasLasMedallas.map((m) => `<span class="tab-medalla ${ganadas.includes(m.id) ? '' : 'bloqueada'}" title="${esc(m.nombre)}"><span class="tab-burbuja">${m.icono}</span><small>${esc(m.nombre)}</small></span>`).join('')}</div>
  </section>` : ''}`;

  if (s.nube && nubeActiva()) avisarAdmin(vista);
}

/** Si es administrador y hay pendientes, muestra un aviso arriba del tablero. */
async function avisarAdmin(vista) {
  try {
    const { nube } = await import('../../nucleo/cloud.js');
    const u = await nube.usuario();
    if (!u?.admin) return;
    const a = await nube.avisosAdmin();
    const partes = [
      a.docentes && `${a.docentes} docente${a.docentes > 1 ? 's' : ''} por aprobar`,
      a.cuentos && `${a.cuentos} cuento${a.cuentos > 1 ? 's' : ''} por revisar`,
      a.reportes && `${a.reportes} mensaje${a.reportes > 1 ? 's' : ''} reportado${a.reportes > 1 ? 's' : ''}`,
    ].filter(Boolean);
    const zona = vista.querySelector('#alerta-admin');
    if (!partes.length || !zona) return;
    zona.innerHTML = `<div class="tab-alerta" role="status"><span>${icono('campana', { tam: 18 })} Tienes pendiente: ${partes.join(' · ')}.</span>
      <a class="btn btn-coral" href="#/app/admin">Revisar ahora</a></div>`;
  } catch { /* sin conexión */ }
}
