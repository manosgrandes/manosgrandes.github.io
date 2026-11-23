// Recordatorios sin servidor: archivo de calendario (.ics), aviso del navegador y calendario imprimible.

import { crearICS } from '../../nucleo/ics.js';
import { descargar, aviso, esc } from '../../nucleo/util.js';
import { dientinDice } from '../../nucleo/character.js';
import { perfiles } from '../../nucleo/store.js';

const K = 'mgdc:recordatorio';

export function render(app) {
  const guardado = JSON.parse(localStorage.getItem(K) || 'null') || { manana: '07:00', noche: '19:30' };
  const p = perfiles.activo();
  const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  app.innerHTML = `
  <div class="no-imprimir">${dientinDice('¡Nunca olvides cepillarte! Pon una alarma en el celular de tu familia.')}</div>

  <div class="rejilla-2 no-imprimir" style="margin-top:1.5rem">
    <section class="tarjeta pila">
      <h2>📅 Alarmas en el calendario del celular</h2>
      <p>Descarga el archivo y ábrelo en el celular (Google Calendar, Calendario de iPhone u Outlook). El teléfono avisará <strong>todos los días</strong>, aunque esta página esté cerrada.</p>
      <form id="horas" class="rejilla-2">
        <div><label for="manana">☀️ Cepillado de la mañana</label><input type="time" id="manana" value="${guardado.manana}"></div>
        <div><label for="noche">🌙 Cepillado de la noche</label><input type="time" id="noche" value="${guardado.noche}"></div>
      </form>
      <button class="btn btn-menta" id="ics">⬇️ Descargar recordatorios (.ics)</button>
      <p class="ayuda">En Android: abre el archivo descargado y elige "Calendario". En iPhone: ábrelo desde Safari y toca "Agregar todo".</p>
    </section>

    <section class="tarjeta pila">
      <h2>🔔 Aviso en este dispositivo</h2>
      <p>Si dejas esta página abierta (o instalada como aplicación), Dientín te avisará a la hora del cepillado.</p>
      <button class="btn" id="notif">🔔 Activar avisos</button>
      <p class="ayuda" id="estado-notif"></p>
      <h3>⏱️ Temporizador de 2 minutos</h3>
      <div class="fila"><button class="btn btn-sol" id="temp">▶ Empezar a cepillarme</button><strong id="reloj" style="font-size:2rem">2:00</strong></div>
    </section>
  </div>

  <section class="tarjeta" style="margin-top:1.5rem">
    <div class="fila entre no-imprimir"><h2>⭐ Calendario de estrellas</h2><button class="btn btn-mini" onclick="print()">🖨️ Imprimir</button></div>
    <h2 class="centro">Mi calendario de cepillado ${p ? `— ${esc(p.apodo)}` : ''}</h2>
    <p class="centro">Pinta una estrella ⭐ cada vez que te cepilles. ¡Pide a un adulto que revise!</p>
    <div class="tabla-env"><table class="calendario">
      <thead><tr><th>Semana</th>${dias.map((d) => `<th>${d}<br>☀️ 🌙</th>`).join('')}</tr></thead>
      <tbody>${[1, 2, 3, 4].map((s) => `<tr><th>${s}</th>${dias.map(() => '<td>☆ ☆</td>').join('')}</tr>`).join('')}</tbody>
    </table></div>
    <p class="centro chico">Firma de quien acompaña: ______________________ · Manos Grandes Dientes Chiquitos</p>
  </section>`;

  const leerHoras = () => {
    const h = { manana: app.querySelector('#manana').value || '07:00', noche: app.querySelector('#noche').value || '19:30' };
    localStorage.setItem(K, JSON.stringify(h));
    return h;
  };
  app.querySelector('#horas').addEventListener('change', leerHoras);

  app.querySelector('#ics').addEventListener('click', () => {
    const h = leerHoras();
    const desc = 'Dos minutos, crema con flúor (grano de arroz en menores de 3 años, arveja de 3 a 6 años) y un adulto que repase. ¡Dientín te espera!';
    descargar('recordatorios-cepillado.ics', crearICS([
      { titulo: '🦷 Cepillado de la mañana', descripcion: desc, hora: h.manana },
      { titulo: '🌙 Cepillado de la noche (¡el más importante!)', descripcion: desc, hora: h.noche },
    ]), 'text/calendar;charset=utf-8');
    aviso('Archivo descargado. Ábrelo para agregarlo al calendario.');
  });

  const estadoNotif = app.querySelector('#estado-notif');
  const pintarNotif = () => {
    if (!('Notification' in window)) estadoNotif.textContent = 'Este navegador no permite avisos. Usa el archivo de calendario.';
    else if (Notification.permission === 'granted') estadoNotif.textContent = '✅ Avisos activados mientras la página esté abierta.';
    else if (Notification.permission === 'denied') estadoNotif.textContent = 'Los avisos están bloqueados en la configuración del navegador.';
  };
  pintarNotif();
  app.querySelector('#notif').addEventListener('click', async () => {
    if (!('Notification' in window)) return;
    await Notification.requestPermission();
    localStorage.setItem('mgdc:avisos', 'si');
    pintarNotif();
  });

  let intervalo;
  app.querySelector('#temp').addEventListener('click', (e) => {
    clearInterval(intervalo);
    let s = 120;
    const reloj = app.querySelector('#reloj');
    e.currentTarget.textContent = '🔁 Reiniciar';
    const pintar = () => { reloj.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
    pintar();
    intervalo = setInterval(() => {
      s--;
      pintar();
      if (s === 90) aviso('¡Ahora los dientes de abajo!');
      if (s === 60) aviso('¡Ahora las muelas de atrás!');
      if (s === 30) aviso('¡No olvides la lengua!');
      if (s <= 0) { clearInterval(intervalo); aviso('🎉 ¡Dos minutos! Escupe la espuma. ¡Muy bien!'); }
    }, 1000);
  });
  return () => clearInterval(intervalo);
}

/** Revisa cada minuto si es hora de un recordatorio (cuando la página está abierta). */
export function vigilarRecordatorios() {
  setInterval(() => {
    if (localStorage.getItem('mgdc:avisos') !== 'si' || window.Notification?.permission !== 'granted') return;
    const h = JSON.parse(localStorage.getItem(K) || 'null') || { manana: '07:00', noche: '19:30' };
    const ahora = new Date();
    const hhmm = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const clave = `${ahora.toDateString()} ${hhmm}`;
    if ((hhmm === h.manana || hhmm === h.noche) && localStorage.getItem('mgdc:ultimoAviso') !== clave) {
      localStorage.setItem('mgdc:ultimoAviso', clave);
      new Notification('🦷 ¡Hora de cepillarse!', { body: 'Dientín te espera: dos minutos y con un adulto que repase.', icon: 'icons/icon.svg' });
    }
  }, 30000);
}
