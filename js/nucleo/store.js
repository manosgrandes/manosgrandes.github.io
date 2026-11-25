// Perfiles de niños y progreso, guardados en el dispositivo (localStorage).
// No se guardan datos personales: solo un apodo y un avatar.
// Si el perfil está unido a un aula y la nube está activa, el progreso
// también se envía a Supabase (con cola de reintento si no hay internet).

import { uid } from './util.js';
import { nubeActiva } from '../config.js';

const K = {
  perfiles: 'mgdc:perfiles',
  activo: 'mgdc:activo',
  progreso: 'mgdc:progreso',
  pendientes: 'mgdc:pendientes',
};

const leer = (k, def) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; }
};
const escribir = (k, v) => {
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent('mgdc:cambio', { detail: k }));
};

export const AVATARES = ['🦷', '🐻', '🐰', '🦊', '🐼', '🐸', '🦁', '🐯', '🐨', '🦄', '🐙', '🐧'];

export const JUEGOS = {
  'juego:cepillado': 'Cepilla a Dientín',
  'juego:alimentos': 'La lonchera saludable',
  'juego:memoria': 'Memoria de hábitos',
  'juego:bacterias': 'Atrapa las bacterias',
  'juego:quiz': 'Preguntas de Dientín',
  'juego:atrapa': 'Lluvia de comida sana',
  'juego:pasos': 'Paso a paso',
  'juego:sombras': 'Las sombras de la sonrisa',
  'juego:musica': 'Los dientes cantores',
  'juego:contar': 'Cuenta con Dientín',
};

export const perfiles = {
  lista: () => leer(K.perfiles, []),
  activo() {
    const id = localStorage.getItem(K.activo);
    return this.lista().find((p) => p.id === id) || null;
  },
  crear({ apodo, avatar }) {
    const p = { id: uid(), apodo: apodo.trim().slice(0, 20), avatar, aulaCodigo: null, creado: new Date().toISOString() };
    escribir(K.perfiles, [...this.lista(), p]);
    this.activar(p.id);
    return p;
  },
  actualizar(id, cambios) {
    escribir(K.perfiles, this.lista().map((p) => (p.id === id ? { ...p, ...cambios } : p)));
  },
  activar(id) {
    localStorage.setItem(K.activo, id ?? '');
    window.dispatchEvent(new CustomEvent('mgdc:cambio', { detail: K.activo }));
  },
  borrar(id) {
    escribir(K.perfiles, this.lista().filter((p) => p.id !== id));
    escribir(K.progreso, progreso.todo().filter((r) => r.perfilId !== id));
    if (localStorage.getItem(K.activo) === id) this.activar(null);
  },
};

export const progreso = {
  todo: () => leer(K.progreso, []),
  de: (perfilId) => progreso.todo().filter((r) => r.perfilId === perfilId),

  /** Guarda un resultado. Devuelve las medallas nuevas ganadas. */
  async registrar(actividad, puntaje, estrellasGanadas) {
    const p = perfiles.activo();
    if (!p) return [];
    const antes = medallas(p.id).map((m) => m.id);
    const reg = { id: uid(), perfilId: p.id, actividad, puntaje: Math.round(puntaje), estrellas: estrellasGanadas, fecha: new Date().toISOString() };
    escribir(K.progreso, [...this.todo(), reg]);
    if (p.aulaCodigo && nubeActiva()) {
      escribir(K.pendientes, [...leer(K.pendientes, []), { ...reg, apodo: p.apodo, aulaCodigo: p.aulaCodigo }]);
      sincronizarPendientes();
    }
    return medallas(p.id).filter((m) => !antes.includes(m.id));
  },

  resumen(perfilId) {
    const regs = this.de(perfilId);
    const mejor = {};
    for (const r of regs) {
      if (!mejor[r.actividad] || r.estrellas > mejor[r.actividad].estrellas || (r.estrellas === mejor[r.actividad].estrellas && r.puntaje > mejor[r.actividad].puntaje)) mejor[r.actividad] = r;
    }
    // El total de estrellas cuenta la mejor marca de cada actividad.
    const totalEstrellas = Object.values(mejor).reduce((s, r) => s + r.estrellas, 0);
    return { regs, mejor, totalEstrellas, partidas: regs.length };
  },
};

const MEDALLAS = [
  { id: 'primera', icono: '🎈', nombre: 'Primera aventura', cumple: (r) => r.partidas >= 1 },
  { id: 'cepillador', icono: '<img class="emo" src="icons/cepillo.svg" alt="">', nombre: 'Súper cepillador', cumple: (r) => r.mejor['juego:cepillado']?.estrellas === 3 },
  { id: 'nutri', icono: '🥕', nombre: 'Chef saludable', cumple: (r) => r.mejor['juego:alimentos']?.estrellas === 3 },
  { id: 'lector', icono: '📚', nombre: 'Gran lector', cumple: (r) => Object.keys(r.mejor).filter((k) => k.startsWith('cuento:')).length >= 3 },
  { id: 'explorador', icono: '🧭', nombre: 'Explorador', cumple: (r) => Object.keys(JUEGOS).every((j) => r.mejor[j]) },
  { id: 'estrellas20', icono: '🌟', nombre: '20 estrellas', cumple: (r) => r.totalEstrellas >= 20 },
];

export function medallas(perfilId) {
  const r = progreso.resumen(perfilId);
  return MEDALLAS.filter((m) => m.cumple(r));
}
export const todasLasMedallas = MEDALLAS;

/** Envía a la nube los resultados pendientes. Se llama al registrar y al volver internet. */
export async function sincronizarPendientes() {
  const cola = leer(K.pendientes, []);
  if (!cola.length || !nubeActiva() || !navigator.onLine) return;
  const { nube } = await import('./cloud.js');
  const restantes = [];
  for (const r of cola) {
    try {
      await nube.registrarProgreso(r);
    } catch (e) {
      // Aula inexistente: se descarta; otros errores se reintentan luego.
      if (!String(e.message).includes('aula_no_existe')) restantes.push(r);
    }
  }
  escribir(K.pendientes, restantes);
}
window.addEventListener('online', sincronizarPendientes);
