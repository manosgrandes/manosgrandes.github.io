export function render(app) {
  app.innerHTML = `
  <header class="pub-cabecera">
    <a class="marca" href="#/"><img src="icons/icon.svg" alt="" width="38" height="38"><span><strong>Manos Grandes</strong><small>Dientes Chiquitos</small></span></a>
    <a class="btn btn-claro" href="javascript:history.back()">← Volver</a>
  </header>
  <article class="articulo tarjeta pub-articulo">
    <h1>Privacidad y protección de datos</h1>
    <p class="nota chico">Plantilla base. Debe revisarla el responsable del sitio y ajustarla a la Ley 1581 de 2012 y sus decretos reglamentarios, indicando nombre, identificación y datos de contacto del responsable del tratamiento.</p>
    <h2>Niñas y niños</h2>
    <ul>
      <li>Los niños <strong>no crean cuenta</strong> ni escriben datos personales. Juegan con un <strong>apodo</strong> y un avatar.</li>
      <li>Sus estrellas y medallas se guardan <strong>en el propio dispositivo</strong>. Si se unen a un aula, solo el apodo y los resultados de los juegos se envían al docente de esa aula.</li>
      <li>Recomendamos no usar nombres completos como apodo.</li>
    </ul>
    <h2>Adultos (docentes y familias)</h2>
    <ul>
      <li>Para crear una cuenta se pide nombre para mostrar, correo y contraseña. Se usan solo para iniciar sesión, administrar aulas y participar en el foro.</li>
      <li>El formulario de contacto guarda nombre, correo y mensaje para responder. Si marcas "boletín", recibirás novedades; puedes pedir la baja en cualquier momento.</li>
      <li>Puedes solicitar conocer, actualizar o eliminar tus datos escribiendo por <a href="#/app/contacto">Contacto</a>.</li>
    </ul>
    <h2>Cookies y estadísticas</h2>
    <ul>
      <li>El sitio no usa cookies publicitarias ni de rastreo.</li>
      <li>Si se activan estadísticas, se usan sin cookies (Cloudflare Web Analytics) y solo cuentan visitas de forma anónima.</li>
      <li>Los videos se muestran en el modo de privacidad mejorada de YouTube (youtube-nocookie.com).</li>
    </ul>
    <h2>Dónde se guardan los datos</h2>
    <p>En el navegador de cada dispositivo y, si está activada, en la base de datos del proveedor Supabase, protegida con reglas de acceso por usuario.</p>
    <h2>Borrar tus datos del dispositivo</h2>
    <p><button class="btn btn-coral" id="borrar-todo">🗑️ Borrar todos los datos de este dispositivo</button></p>
  </article>`;
  app.querySelector('#borrar-todo').addEventListener('click', async () => {
    if (!confirm('Se borrarán todos los perfiles, estrellas y cuentos cargados en este dispositivo. No se puede deshacer. ¿Continuar?')) return;
    Object.keys(localStorage).filter((k) => k.startsWith('mgdc:')).forEach((k) => localStorage.removeItem(k));
    indexedDB.deleteDatabase('mgdc');
    location.hash = '#/';
    location.reload();
  });
}
