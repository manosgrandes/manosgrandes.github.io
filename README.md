# Manos Grandes Dientes Chiquitos

Aplicativo web lúdico-pedagógico para niñas, niños, familias y docentes sobre **higiene bucal**, **buena alimentación** y **acompañamiento familiar**. El personaje principal es **Dientín**.

Es un **sitio estático**: HTML, CSS y JavaScript, sin compilación ni servidor propio. Se publica gratis en GitHub Pages, Cloudflare Pages o Netlify.

## Qué incluye

| Sección | Funciona sin nube (modo local) | Con nube gratuita (Supabase) |
|---|---|---|
| 5 juegos con estrellas y medallas | ✅ | ✅ y además envía el progreso al aula |
| Cuentos de Dientín con narración en voz alta | ✅ | ✅ |
| Cargar cuentos (PDF, EPUB, TXT, fotos, OCR) | ✅ se guardan en el dispositivo | ✅ biblioteca compartida con aprobación del administrador |
| Perfiles de niños (apodo + avatar, sin datos personales) | ✅ | ✅ |
| Tabla de estrellas (ranking) | ✅ entre perfiles del dispositivo | ✅ por aula |
| Panel docente + reporte Excel (CSV) | ✅ perfiles del dispositivo | ✅ aulas con código y seguimiento por estudiante |
| Guías para padres y docentes (imprimibles) | ✅ | ✅ |
| Recordatorios de cepillado (.ics), avisos y temporizador | ✅ | ✅ |
| Calendario de estrellas imprimible | ✅ | ✅ |
| Cuentas de docentes y familias | — | ✅ |
| Foro con reportes y moderación | — | ✅ |
| Contacto y boletín | ✅ con Formspree o correo | ✅ los mensajes llegan al panel de administración |
| Panel de administración con estadísticas | — | ✅ |
| Funciona sin internet (PWA, instalable) | ✅ | ✅ (lo que requiere nube necesita conexión) |
| Estadísticas de visitas sin cookies | ✅ con Cloudflare Web Analytics (opcional) | ✅ |

## Probar en el computador

```powershell
python -m http.server 5173
```

Luego abre http://localhost:5173. No funciona abriendo `index.html` con doble clic, porque los módulos de JavaScript necesitan un servidor.

## Publicar gratis (GitHub Pages)

1. Crea un repositorio en GitHub y sube esta carpeta a la rama `main`.
2. En el repositorio ve a **Settings > Pages > Build and deployment > Source** y elige **GitHub Actions**.
3. Cada `git push` publica el sitio solo (archivo `.github/workflows/pages.yml`).
4. El enlace queda así: `https://USUARIO.github.io/REPOSITORIO/`.

**Alternativas:**
- **Cloudflare Pages:** conecta el repositorio y deja vacío el comando de build. La carpeta de salida es `/`.
- **Netlify:** arrastra la carpeta a https://app.netlify.com/drop.

> Al publicar cambios, sube el número de `VERSION` en `sw.js` (por ejemplo `mgdc-v2`) para que los dispositivos que ya visitaron el sitio reciban la versión nueva.

## Activar la nube (opcional, gratis)

1. Crea una cuenta y un proyecto en https://supabase.com (plan Free).
2. Abre **SQL Editor**, pega todo el contenido de `supabase/schema.sql` y presiona **Run**.
3. En **Authentication > URL Configuration**, pon en **Site URL** el enlace público del sitio, y agrégalo también en **Redirect URLs**.
4. En **Project Settings > API**, copia el **Project URL** y la **anon public key** en `js/config.js` (`supabaseUrl` y `supabaseAnonKey`). La anon key es pública por diseño; la seguridad la dan las reglas RLS del esquema.
5. Crea tu cuenta en el sitio (sección **Cuenta**) y vuélvete administrador ejecutando en el SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'TU_CORREO';
   ```
6. Sube el número de `VERSION` en `sw.js` y publica.

**Límites del plan gratuito de Supabase:**
- 500 MB de base de datos.
- 1 GB de archivos (las imágenes de los cuentos).
- El proyecto se **pausa tras 7 días sin actividad**. Se reactiva desde el panel de Supabase. Mientras está pausado, el sitio sigue funcionando en modo local.

## Otras opciones de `js/config.js`

- `formspreeEndpoint`: formulario de contacto sin Supabase (https://formspree.io, plan gratis de 50 envíos al mes).
- `correoContacto`: último recurso; abre el programa de correo del visitante.
- `cloudflareAnalyticsToken`: estadísticas de visitas sin cookies.

## Estructura: 3 capas

```
Capa 1 · Landing   #/            Presentación pública con Sofi (animada).
Capa 2 · Login     #/entrar      Niña/niño (apodo), docente/familia o invitado.
Capa 3 · Sistema   #/app/...     Módulos. Protegido: sin sesión redirige al login.
Público            #/privacidad
```

```
index.html                    Página única; el enrutador decide qué capa mostrar
css/
  base.css                    Colores, botones, formularios (compartido)
  landing.css                 Capa 1
  login.css                   Capa 2
  sistema.css                 Capa 3: menú de módulos, barra superior, tablero
  modulos.css                 Estilos internos de los módulos (juegos, cuentos...)
js/
  app.js                      Enrutador por capas + protección del sistema
  config.js                   Configuración (nube, contacto, estadísticas)
  nucleo/                     Piezas compartidas
    sesion.js                 Quién entró (niño, adulto, invitado)
    store.js  idb.js          Perfiles, progreso, medallas y cuentos del dispositivo
    cloud.js                  Supabase (solo si está configurado)
    speech.js ics.js util.js  Voz, calendario, utilidades
    character.js sofi.js      Personajes Dientín y Sofi
  capas/
    landing/landing.js        Capa 1
    login/login.js            Capa 2
    sistema/shell.js          Capa 3: armazón (menú lateral, barra, navegación móvil)
    sistema/modulos.js        Registro de módulos: menú, permisos y rutas
    sistema/inicio.js         Tablero de inicio
    publico/privacidad.js
  modulos/                    Un módulo por carpeta
    juegos/  cuentos/  guias/  recordatorios/  docentes/
    foro/  contacto/  perfil/  cuenta/  admin/
supabase/schema.sql           Base de datos y reglas de seguridad
sw.js                         Funcionamiento sin internet
```

**Agregar un módulo nuevo:** crea `js/modulos/<nombre>/index.js` con una función `render(vista)` y regístralo en `js/capas/sistema/modulos.js` (título, ícono, color, quién lo ve y sus rutas). Luego agrega el archivo a la lista de `sw.js` y sube `VERSION`.

## Pendiente antes del lanzamiento oficial

- **Revisión del contenido:** que un profesional de odontología o nutrición revise `js/data/articulos.js` y los cuentos.
- **Política de privacidad:** completar `js/views/privacidad.js` con los datos del responsable (Ley 1581 de 2012).
- **Ilustraciones (opcional):** las actuales son vectoriales. Se pueden reemplazar por ilustraciones profesionales.
- **Correos de Supabase:** el servicio de correo gratuito de Supabase tiene un límite bajo de envíos por hora. Para muchos registros, configurar un SMTP propio (por ejemplo, Brevo gratis) en **Authentication > SMTP**.
