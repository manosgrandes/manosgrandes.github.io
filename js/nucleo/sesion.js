// Sesión de la capa "Sistema". Define quién entró y separa las 3 capas:
//   Landing (#/)  →  Login (#/entrar)  →  Sistema (#/app/...)
// El sistema solo se muestra si hay una sesión iniciada.
//
// Tipos de sesión:
//   nino      → niña o niño con perfil (apodo + avatar, sin contraseña)
//   adulto    → docente o familia (con cuenta en la nube, o local con nombre y rol)
//   invitado  → explora sin perfil (no guarda progreso)

import { perfiles } from './store.js';

const K = 'mgdc:sesion';

const leer = () => {
  try { return JSON.parse(localStorage.getItem(K)); } catch { return null; }
};

export const sesion = {
  actual() {
    const s = leer();
    if (!s) return null;
    // Una sesión de niño sin perfil válido (p. ej. perfil borrado) no es válida.
    if (s.tipo === 'nino' && !perfiles.activo()) return null;
    return s;
  },

  /** @param {'nino'|'adulto'|'invitado'} tipo  @param {{nombre?:string, rol?:'docente'|'familia', nube?:boolean}} datos */
  iniciar(tipo, datos = {}) {
    if (tipo !== 'nino') perfiles.activar(null);
    localStorage.setItem(K, JSON.stringify({ tipo, ...datos, desde: new Date().toISOString() }));
    window.dispatchEvent(new CustomEvent('mgdc:sesion'));
  },

  async cerrar() {
    const s = leer();
    localStorage.removeItem(K);
    perfiles.activar(null);
    if (s?.nube) {
      try { await (await import('./cloud.js')).nube.salir(); } catch { /* sin conexión */ }
    }
    window.dispatchEvent(new CustomEvent('mgdc:sesion'));
  },

  /** Nombre y avatar para mostrar en la barra superior. */
  identidad() {
    const s = this.actual();
    if (!s) return null;
    if (s.tipo === 'nino') {
      const p = perfiles.activo();
      return { nombre: p.apodo, avatar: p.avatar, etiqueta: 'Niña / niño' };
    }
    if (s.tipo === 'adulto') {
      return { nombre: s.nombre || (s.rol === 'docente' ? 'Docente' : 'Familia'), avatar: s.rol === 'docente' ? '👩‍🏫' : '👨‍👩‍👧', etiqueta: s.rol === 'docente' ? 'Docente' : 'Familia' };
    }
    return { nombre: 'Invitado', avatar: '🙂', etiqueta: 'Explorando' };
  },
};
