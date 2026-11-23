// Tablero de inicio del sistema: bienvenida y acceso a cada módulo según quién entró.

import { modulosPara } from './modulos.js';
import { sesion } from '../../nucleo/sesion.js';
import { perfiles, progreso, medallas, todasLasMedallas } from '../../nucleo/store.js';
import { SOFI } from '../../nucleo/sofi.js';
import { esc } from '../../nucleo/util.js';
import { botonLeer } from '../../nucleo/speech.js';

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

  vista.innerHTML = `
  <section class="tab-bienvenida">
    <div>
      <h1>${saludo}, ${esc(id.nombre)} ${esc(id.avatar)}</h1>
      <p>${texto}</p>
      ${r ? `<div class="tab-chips"><span>★ ${r.totalEstrellas} estrellas</span><span>🏅 ${ganadas.length} medallas</span><span>🎯 ${r.partidas} actividades</span></div>` : ''}
    </div>
    <img class="tab-sofi" src="${SOFI.img}" alt="" width="760" height="1633">
  </section>

  <h2>Módulos</h2>
  <div class="tab-modulos">
    ${mods.map((m, i) => `
      <a class="tab-modulo" href="#/app/${m.id}" style="--c:${m.color};--i:${i}">
        <span class="sis-ico">${m.icono}</span>
        <h3>${esc(m.titulo)}</h3>
        <p>${esc(m.desc)}</p>
        <span class="tab-ir">Abrir ➜</span>
      </a>`).join('')}
  </div>

  <div class="tab-fila">
    <section class="tarjeta">
      <div class="fila entre"><h3 style="margin:0">💡 Consejo de Sofi</h3>${botonLeer(consejo)}</div>
      <p style="font-size:1.1rem;margin-bottom:0">${consejo}</p>
    </section>
    ${p ? `<section class="tarjeta">
      <h3 style="margin-top:0">🏅 Mis medallas</h3>
      <div class="tab-medallas">${todasLasMedallas.map((m) => `<span class="medalla ${ganadas.includes(m.id) ? '' : 'bloqueada'}" title="${esc(m.nombre)}"><span class="icono">${m.icono}</span></span>`).join('')}</div>
      <p style="margin-bottom:0"><a href="#/app/perfil">Ver mi perfil ➜</a></p>
    </section>` : `<section class="tarjeta">
      <h3 style="margin-top:0">🧭 ¿Por dónde empezar?</h3>
      <p style="margin-bottom:0">${s.tipo === 'invitado' ? 'Prueba un juego o un cuento. Para guardar estrellas, entra con un perfil.' : 'Lee la guía "Higiene bucal según la edad" y descarga los recordatorios para tu celular.'}</p>
    </section>`}
  </div>`;
}
