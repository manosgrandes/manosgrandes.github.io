// Capa de nube (Supabase, plan gratuito). Solo se carga si config.js tiene
// supabaseUrl y supabaseAnonKey. Las reglas de acceso viven en supabase/schema.sql.

import { CONFIG, nubeActiva } from '../config.js';

let clientePromesa;
async function sb() {
  if (!nubeActiva()) throw new Error('La nube no está configurada.');
  clientePromesa ??= import('https://esm.sh/@supabase/supabase-js@2.119.2').then(({ createClient }) =>
    createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, { auth: { persistSession: true, flowType: 'pkce', detectSessionInUrl: true } }));
  return clientePromesa;
}

const ok = ({ data, error }) => {
  if (error) throw new Error(error.message);
  return data;
};

function dataURLaBlob(dataURL) {
  const [cab, datos] = dataURL.split(',');
  const tipo = cab.match(/:(.*?);/)[1];
  const bin = atob(datos);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: tipo });
}

export const nube = {
  // ---------- Cuentas (docentes y familias) ----------
  async usuario() {
    const c = await sb();
    const { data } = await c.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;
    const perfil = ok(await c.from('perfiles').select('nombre, rol').eq('id', user.id).maybeSingle());
    const admin = ok(await c.rpc('es_admin'));
    return { id: user.id, correo: user.email, nombre: perfil?.nombre || user.email, rol: perfil?.rol || 'familia', admin };
  },
  async registrar({ correo, clave, nombre, rol }) {
    const c = await sb();
    return ok(await c.auth.signUp({
      email: correo,
      password: clave,
      options: { data: { nombre, rol }, emailRedirectTo: location.origin + location.pathname },
    }));
  },
  async entrar({ correo, clave }) {
    const c = await sb();
    return ok(await c.auth.signInWithPassword({ email: correo, password: clave }));
  },
  async salir() {
    const c = await sb();
    await c.auth.signOut();
  },
  async recuperarClave(correo) {
    const c = await sb();
    return ok(await c.auth.resetPasswordForEmail(correo, { redirectTo: location.origin + location.pathname }));
  },
  async cambiarClave(clave) {
    const c = await sb();
    return ok(await c.auth.updateUser({ password: clave }));
  },
  async alCambiarSesion(fn) {
    const c = await sb();
    c.auth.onAuthStateChange((evento) => fn(evento));
  },

  // ---------- Aulas y seguimiento ----------
  async crearAula(nombre) {
    const c = await sb();
    const codigo = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
    return ok(await c.from('aulas').insert({ nombre, codigo }).select().single());
  },
  async misAulas() {
    const c = await sb();
    return ok(await c.from('aulas').select('id, nombre, codigo, creado').order('creado', { ascending: false }));
  },
  async borrarAula(id) {
    const c = await sb();
    return ok(await c.from('aulas').delete().eq('id', id));
  },
  async seguimientoAula(aulaId) {
    const c = await sb();
    return ok(await c.from('estudiantes')
      .select('id, apodo, creado, progreso(actividad, puntaje, estrellas, fecha)')
      .eq('aula_id', aulaId).order('apodo'));
  },
  async borrarEstudiante(id) {
    const c = await sb();
    return ok(await c.from('estudiantes').delete().eq('id', id));
  },
  /** Público: verifica un código de aula y devuelve su nombre. */
  async nombreAula(codigo) {
    const c = await sb();
    return ok(await c.rpc('nombre_aula', { p_codigo: codigo.toUpperCase() }));
  },
  /** Público: guarda un resultado de un niño unido a un aula (sin cuenta). */
  async registrarProgreso(r) {
    const c = await sb();
    return ok(await c.rpc('registrar_progreso', {
      p_codigo: r.aulaCodigo, p_apodo: r.apodo, p_actividad: r.actividad,
      p_puntaje: r.puntaje, p_estrellas: r.estrellas, p_fecha: r.fecha,
    }));
  },
  async ranking(codigo) {
    const c = await sb();
    return ok(await c.rpc('ranking_aula', { p_codigo: codigo }));
  },

  // ---------- Biblioteca compartida de cuentos ----------
  async cuentosAprobados() {
    const c = await sb();
    return ok(await c.from('cuentos').select('id, titulo, autor_texto, edad, tema, portada, licencia').eq('estado', 'aprobado').order('creado', { ascending: false }));
  },
  async cuento(id) {
    const c = await sb();
    return ok(await c.from('cuentos').select('*').eq('id', id).maybeSingle());
  },
  async misCuentos() {
    const c = await sb();
    const u = await this.usuario();
    return ok(await c.from('cuentos').select('id, titulo, estado, creado').eq('subido_por', u.id).order('creado', { ascending: false }));
  },
  async cuentosPendientes() {
    const c = await sb();
    return ok(await c.from('cuentos').select('id, titulo, autor_texto, licencia, edad, tema, creado, portada').eq('estado', 'pendiente').order('creado'));
  },
  /** Sube las imágenes de las páginas al Storage y crea el cuento (queda pendiente de aprobación). */
  async subirCuento(cuento, alProgresar = () => {}) {
    const c = await sb();
    const u = await this.usuario();
    const carpeta = `${u.id}/${crypto.randomUUID()}`;
    const paginas = [];
    for (const [i, pag] of cuento.paginas.entries()) {
      let imagen = null;
      if (pag.imagen?.startsWith('data:')) {
        const ruta = `${carpeta}/p${String(i + 1).padStart(3, '0')}.jpg`;
        ok(await c.storage.from('cuentos').upload(ruta, dataURLaBlob(pag.imagen), { contentType: 'image/jpeg' }));
        imagen = c.storage.from('cuentos').getPublicUrl(ruta).data.publicUrl;
      }
      paginas.push({ texto: pag.texto || '', imagen });
      alProgresar(i + 1, cuento.paginas.length);
    }
    return ok(await c.from('cuentos').insert({
      titulo: cuento.titulo, autor_texto: cuento.autor || '', edad: cuento.edad || '', tema: cuento.tema || 'otro',
      licencia: cuento.licencia, video_url: cuento.video || null, paginas,
      portada: paginas.find((p) => p.imagen)?.imagen || null,
      estado: u.admin ? 'aprobado' : 'pendiente',
    }).select('id, estado').single());
  },
  async cambiarEstadoCuento(id, estado) {
    const c = await sb();
    return ok(await c.from('cuentos').update({ estado }).eq('id', id));
  },
  async borrarCuento(id) {
    const c = await sb();
    return ok(await c.from('cuentos').delete().eq('id', id));
  },

  // ---------- Foro de familias y docentes ----------
  async temas() {
    const c = await sb();
    return ok(await c.from('foro_temas').select('id, titulo, autor_nombre, categoria, creado, foro_respuestas(count)').eq('oculto', false).order('creado', { ascending: false }).limit(100));
  },
  async tema(id) {
    const c = await sb();
    const tema = ok(await c.from('foro_temas').select('*').eq('id', id).maybeSingle());
    const respuestas = ok(await c.from('foro_respuestas').select('*').eq('tema_id', id).eq('oculto', false).order('creado'));
    return { tema, respuestas };
  },
  async crearTema({ titulo, cuerpo, categoria }) {
    const c = await sb();
    const u = await this.usuario();
    return ok(await c.from('foro_temas').insert({ titulo, cuerpo, categoria, autor_nombre: u.nombre }).select('id').single());
  },
  async responder(temaId, cuerpo) {
    const c = await sb();
    const u = await this.usuario();
    return ok(await c.from('foro_respuestas').insert({ tema_id: temaId, cuerpo, autor_nombre: u.nombre }));
  },
  async ocultar(tabla, id) {
    if (!['foro_temas', 'foro_respuestas'].includes(tabla)) throw new Error('Tabla no válida');
    const c = await sb();
    return ok(await c.from(tabla).update({ oculto: true }).eq('id', id));
  },
  async borrarForo(tabla, id) {
    if (!['foro_temas', 'foro_respuestas'].includes(tabla)) throw new Error('Tabla no válida');
    const c = await sb();
    return ok(await c.from(tabla).delete().eq('id', id));
  },
  async reportar(tabla, id) {
    const c = await sb();
    return ok(await c.rpc('reportar', { p_tabla: tabla, p_id: id }));
  },
  async reportados() {
    const c = await sb();
    const temas = ok(await c.from('foro_temas').select('id, titulo, cuerpo, autor_nombre, reportes').gt('reportes', 0).eq('oculto', false));
    const resp = ok(await c.from('foro_respuestas').select('id, cuerpo, autor_nombre, reportes, tema_id').gt('reportes', 0).eq('oculto', false));
    return { temas, resp };
  },

  // ---------- Contacto y boletín ----------
  async enviarContacto(m) {
    const c = await sb();
    return ok(await c.from('contacto').insert(m));
  },
  async mensajes() {
    const c = await sb();
    return ok(await c.from('contacto').select('*').order('creado', { ascending: false }).limit(200));
  },
  async borrarMensaje(id) {
    const c = await sb();
    return ok(await c.from('contacto').delete().eq('id', id));
  },
  async estadisticas() {
    const c = await sb();
    return ok(await c.rpc('estadisticas_generales'));
  },
};
