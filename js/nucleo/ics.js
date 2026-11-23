// Recordatorios sin servidor: genera un archivo de calendario (.ics) con
// eventos diarios repetidos. Se importa en Google Calendar, el calendario del
// celular u Outlook, y el teléfono avisa solo, aunque la página esté cerrada.

const dos = (n) => String(n).padStart(2, '0');

function fechaLocal(d, hora) {
  const [h, m] = hora.split(':');
  return `${d.getFullYear()}${dos(d.getMonth() + 1)}${dos(d.getDate())}T${dos(h)}${dos(m)}00`;
}

/**
 * @param {{titulo:string, descripcion:string, hora:string, dias?:string}[]} eventos
 *   hora "HH:MM"; dias en formato RRULE BYDAY (por defecto todos los días).
 */
export function crearICS(eventos) {
  const hoy = new Date();
  const sello = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lineas = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Manos Grandes Dientes Chiquitos//ES', 'CALSCALE:GREGORIAN',
  ];
  eventos.forEach((ev, i) => {
    lineas.push(
      'BEGIN:VEVENT',
      `UID:mgdc-${sello}-${i}@manosgrandes`,
      `DTSTAMP:${sello}`,
      `DTSTART:${fechaLocal(hoy, ev.hora)}`,
      'DURATION:PT5M',
      `RRULE:FREQ=WEEKLY;BYDAY=${ev.dias || 'MO,TU,WE,TH,FR,SA,SU'}`,
      `SUMMARY:${ev.titulo}`,
      `DESCRIPTION:${ev.descripcion.replace(/\n/g, '\\n')}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${ev.titulo}`, 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT',
    );
  });
  lineas.push('END:VCALENDAR');
  return lineas.join('\r\n');
}
