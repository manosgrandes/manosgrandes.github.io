// Capa 3 — Sistema: armazón con menú lateral de módulos, barra superior con el
// usuario y navegación inferior en celular. Las vistas de cada módulo se pintan
// dentro de #contenido.

import { GRUPOS, modulosPara } from './modulos.js';
import { sesion } from '../../nucleo/sesion.js';
import { nubeActiva } from '../../config.js';
import { esc, $, avatarHTML } from '../../nucleo/util.js';
import { SOFI } from '../../nucleo/sofi.js';
import { icono } from '../../nucleo/iconos.js';

let raizActual = null;
let esAdmin = false;
let pendientesAdmin = 0;
let relojAvisos = null;

export function montado(raiz) {
  return raizActual === raiz && raiz.querySelector('.sis');
}

export function montar(raiz) {
  raizActual = raiz;
  raiz.innerHTML = `
  <div class="sis">
    <aside class="sis-lateral" id="lateral" aria-label="Módulos del sistema">
      <a class="marca sis-marca" href="#/app" aria-label="Inicio del sistema">
        <img src="icons/icon.svg" alt="" width="36" height="36">
        <span><strong>Manos Grandes</strong><small>Dientes Chiquitos</small></span>
      </a>
      <nav id="sis-nav" class="sis-nav"></nav>
      <div class="sis-consejo">
        <img src="${SOFI.cara}" alt="" width="40" height="40">
        <div><strong>Consejo de Sofi</strong><p id="consejo"></p></div>
      </div>
    </aside>
    <div class="sis-velo" id="velo" hidden></div>

    <div class="sis-cuerpo">
      <header class="sis-barra">
        <button class="sis-boton-menu" id="abrir-menu" aria-controls="lateral" aria-expanded="false" aria-label="Abrir menú de módulos">${icono('menu', { tam: 22 })}</button>
        <nav class="sis-miga" aria-label="Ubicación"><span>Sistema</span><span aria-hidden="true" class="sis-miga-sep">/</span><strong id="miga"></strong></nav>
        <div class="sis-usuario">
          <button class="sis-usuario-btn" id="usuario-btn" aria-haspopup="menu" aria-expanded="false">
            <span class="sis-ava" id="u-ava"></span><span class="sis-u-txt"><strong id="u-nombre"></strong><small id="u-rol"></small></span>${icono('abajo', { tam: 16, clase: 'sis-u-flecha' })}
          </button>
          <div class="sis-menu-usuario" id="menu-usuario" role="menu" hidden>
            <span id="menu-mi-espacio"></span>
            <a role="menuitem" href="#/entrar">${icono('cambiar', { tam: 18 })} Cambiar de usuario</a>
            <a role="menuitem" href="#/">${icono('web', { tam: 18 })} Ver la página de inicio</a>
            <button role="menuitem" id="salir">${icono('salir', { tam: 18 })} Salir del sistema</button>
          </div>
        </div>
      </header>
      <p id="estado-red" class="sis-red" hidden>${icono('sinred', { tam: 16 })} Sin internet: estás usando la versión guardada.</p>
      <main id="contenido" class="sis-contenido" tabindex="-1"></main>
    </div>

    <nav class="sis-tabbar" id="tabbar" aria-label="Módulos principales"></nav>
  </div>`;

  const abrir = (si) => {
    $('#lateral', raiz).classList.toggle('abierto', si);
    $('#velo', raiz).hidden = !si;
    $('#abrir-menu', raiz).setAttribute('aria-expanded', String(si));
  };
  $('#abrir-menu', raiz).addEventListener('click', () => abrir(true));
  $('#velo', raiz).addEventListener('click', () => abrir(false));
  raiz.addEventListener('click', (e) => {
    if (e.target.closest('.sis-nav a, .sis-tabbar a')) abrir(false);
  });

  const menu = $('#menu-usuario', raiz);
  const btn = $('#usuario-btn', raiz);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); });
  $('#salir', raiz).addEventListener('click', async () => {
    await sesion.cerrar();
    location.hash = '#/';
  });

  const red = () => { const r = $('#estado-red', raiz); if (r) r.hidden = navigator.onLine; };
  window.addEventListener('online', red);
  window.addEventListener('offline', red);
  red();

  const consejos = [
    'Cepíllate dos veces al día. ¡El de la noche es el más importante!',
    'El agua es la mejor bebida para tus dientes.',
    'Pide a un adulto que repase tu cepillado.',
    'Cambia tu cepillo cada tres meses.',
    'Las frutas crujientes son amigas de tus dientes.',
  ];
  $('#consejo', raiz).textContent = consejos[new Date().getDate() % consejos.length];

  // Saber si es administrador (solo con nube y sesión de adulto con cuenta).
  esAdmin = false;
  const s = sesion.actual();
  if (s?.nube && nubeActiva()) {
    import('../../nucleo/cloud.js').then(({ nube }) => nube.usuario()).then((u) => {
      esAdmin = Boolean(u?.admin);
      if (esAdmin) { pintarMenu(); revisarAvisos(); }
    }).catch(() => {});
  }
  pintarUsuario();
  pintarMenu();
}

/** Cuenta lo pendiente del administrador y lo muestra como globo en el menú (se revisa cada minuto). */
export async function revisarAvisos() {
  clearTimeout(relojAvisos);
  if (!esAdmin || !raizActual?.isConnected) return;
  try {
    const { nube } = await import('../../nucleo/cloud.js');
    const a = await nube.avisosAdmin();
    pendientesAdmin = a.docentes + a.cuentos + a.reportes;
    pintarMenu();
  } catch { /* sin conexión: se reintenta */ }
  relojAvisos = setTimeout(revisarAvisos, 60000);
}

let moduloActivo = 'inicio';

function pintarMenu() {
  const raiz = raizActual;
  const s = sesion.actual();
  if (!raiz || !s) return;
  // "Mi perfil" y "Mi cuenta" viven en el menú del usuario (arriba a la derecha), no en la navegación.
  const EN_MENU_USUARIO = ['perfil', 'cuenta'];
  const todos = modulosPara(s.tipo, esAdmin);
  const mods = todos.filter((m) => !EN_MENU_USUARIO.includes(m.id));
  $('#menu-mi-espacio', raiz).innerHTML = todos.filter((m) => EN_MENU_USUARIO.includes(m.id))
    .map((m) => `<a role="menuitem" class="sis-menu-destacado" href="#/app/${m.id}" ${m.id === moduloActivo ? 'aria-current="page"' : ''}>${icono(m.ico, { tam: 18 })} ${m.id === 'perfil' ? 'Configurar mi perfil' : 'Configurar mi cuenta'}</a>`).join('');
  const enlace = (m) => `<a href="#/app${m.id === 'inicio' ? '' : `/${m.id}`}" data-mod="${m.id}" style="--c:${m.color};--t:${m.tinte}" ${m.id === moduloActivo ? 'aria-current="page"' : ''}>
      <span class="sis-ico">${icono(m.ico, { tam: 18 })}</span><span>${esc(m.corto || m.titulo)}</span>${m.id === 'admin' && pendientesAdmin ? `<span class="sis-globo" aria-label="${pendientesAdmin} pendientes">${pendientesAdmin}</span>` : ''}</a>`;
  const grupos = Object.entries(GRUPOS).map(([g, nombre]) => {
    const lista = mods.filter((m) => m.grupo === g);
    return lista.length ? `<p class="sis-grupo">${nombre}</p>${lista.map(enlace).join('')}` : '';
  }).join('');
  $('#sis-nav', raiz).innerHTML = enlace(mods.find((m) => m.id === 'inicio')) + grupos;

  const principales = ['inicio', 'juegos', 'cuentos', s.tipo === 'nino' ? 'recordatorios' : 'guias'];
  $('#tabbar', raiz).innerHTML = principales.map((id) => mods.find((m) => m.id === id)).filter(Boolean)
    .map((m) => `<a href="#/app${m.id === 'inicio' ? '' : `/${m.id}`}" data-mod="${m.id}" ${m.id === moduloActivo ? 'aria-current="page"' : ''}><span class="sis-ico">${icono(m.ico, { tam: 22 })}</span><small>${esc(m.corto || m.titulo)}</small></a>`).join('')
    + `<button type="button" id="tab-mas" aria-controls="lateral"><span class="sis-ico">${icono('menu', { tam: 22 })}</span><small>Más</small></button>`;
  $('#tab-mas', raiz).addEventListener('click', () => $('#abrir-menu', raiz).click());
}

export function pintarUsuario() {
  const raiz = raizActual;
  const id = sesion.identidad();
  if (!raiz || !id) return;
  $('#u-ava', raiz).innerHTML = avatarHTML(id.avatar);
  $('#u-nombre', raiz).textContent = id.nombre;
  $('#u-rol', raiz).textContent = id.etiqueta;
}

/** Marca el módulo activo y devuelve el contenedor donde se pinta la vista. */
export function prepararVista(modulo, { encabezado }) {
  const raiz = raizActual;
  moduloActivo = modulo.id;
  raiz.querySelectorAll('[data-mod]').forEach((a) => {
    if (a.dataset.mod === modulo.id) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  $('#miga', raiz).textContent = modulo.titulo;
  document.title = `${modulo.titulo} · Manos Grandes Dientes Chiquitos`;

  const contenido = $('#contenido', raiz);
  contenido.innerHTML = encabezado
    ? `<header class="mod-cabecera" style="--c:${modulo.color};--t:${modulo.tinte}">
        <div><h1>${esc(modulo.titulo)}</h1><p>${esc(modulo.desc)}</p></div>
        <span class="mod-arte" aria-hidden="true">${modulo.icono}</span>
      </header><div id="vista" class="vista"></div>`
    : '<div id="vista" class="vista"></div>';
  return { contenido, vista: $('#vista', contenido) };
}

window.addEventListener('mgdc:cambio', pintarUsuario);
window.addEventListener('mgdc:sesion', () => { pintarUsuario(); pintarMenu(); });
