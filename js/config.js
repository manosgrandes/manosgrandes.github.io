// Configuración del sitio "Manos Grandes Dientes Chiquitos".
//
// El sitio funciona COMPLETO sin llenar nada aquí (modo local: todo se guarda
// en el dispositivo). Si se llenan los datos de Supabase, se activan las
// funciones en la nube: cuentas de docentes y familias, aulas, seguimiento del
// progreso, ranking por aula, biblioteca compartida de cuentos, foro y
// mensajes de contacto. Ver README.md, sección "Activar la nube".

export const CONFIG = {
  nombreSitio: 'Manos Grandes Dientes Chiquitos',

  // --- Supabase (plan gratuito) ---
  // Project Settings > API > Project URL y "anon public key".
  // La anon key es pública por diseño; la seguridad la dan las políticas RLS
  // definidas en supabase/schema.sql.
  supabaseUrl: '',
  supabaseAnonKey: '',

  // --- Formulario de contacto sin Supabase (opcional) ---
  // Endpoint de Formspree (https://formspree.io), p. ej. 'https://formspree.io/f/abcdwxyz'.
  formspreeEndpoint: '',
  // Correo usado como último recurso (abre el programa de correo del visitante).
  correoContacto: '',

  // --- Estadísticas de visitas sin cookies (opcional) ---
  // Token de Cloudflare Web Analytics. No usa cookies ni datos personales.
  cloudflareAnalyticsToken: '',
};

export const nubeActiva = () => Boolean(CONFIG.supabaseUrl && CONFIG.supabaseAnonKey);
