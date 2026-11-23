// Cuentos originales de Dientín incluidos en el sitio.
// Cada página tiene texto y una escena dibujada (fondo + emojis + ánimo de Dientín).

export const CUENTOS_BASE = [
  {
    id: 'monstruo-caries',
    titulo: 'Dientín y el monstruo de la Caries',
    tema: 'higiene',
    edad: '3 a 7 años',
    icono: '🦠',
    color: '#C8EEFC',
    resumen: 'Dientín descubre por qué cepillarse antes de dormir lo protege de las bacterias.',
    paginas: [
      { texto: 'En la boca de Sofía vivía un diente muy alegre llamado Dientín. Era blanco, brillante y le encantaba sonreír.', escena: { fondo: '#C8EEFC', emojis: ['✨', '😁', '✨'], animo: 'feliz' } },
      { texto: 'Una noche, Sofía comió galletas y dulces… ¡y se fue a dormir sin cepillarse los dientes!', escena: { fondo: '#2C3E73', emojis: ['🍪', '🍬', '🌙', '🍭'], animo: 'sorpresa' } },
      { texto: 'Mientras todos dormían, llegaron unas bacterias traviesas. «¡Qué rico azúcar!», decían. Y empezaron a hacer pequeños huequitos en Dientín.', escena: { fondo: '#FFC2CB', emojis: ['🦠', '🦠', '🦠'], animo: 'triste' } },
      { texto: 'A la mañana siguiente, Dientín se sentía débil. «¡Sofía, ayúdame!», gritó con todas sus fuerzas.', escena: { fondo: '#FFE8EA', emojis: ['😢', '🆘'], animo: 'triste' } },
      { texto: 'Sofía tomó su cepillo, le puso un poquito de crema dental con flúor y cepilló arriba, abajo y por todos lados, contando hasta 120.', escena: { fondo: '#E2F8EC', emojis: ['<img class="emo" src="icons/cepillo.svg" alt="">', '💦', '💧', '💦'], animo: 'guino', cepillo: true } },
      { texto: 'Las bacterias salieron corriendo. «¡Ese cepillo es muy fuerte!», gritaban mientras se iban por el lavamanos.', escena: { fondo: '#C8EEFC', emojis: ['🦠💨', '🚿', '🦠💨'], animo: 'feliz', cepillo: true } },
      { texto: 'Desde ese día, Sofía se cepilla después de comer y, sobre todo, antes de dormir. Y con mamá, papá o un adulto revisando que quede bien limpio.', escena: { fondo: '#FFF6DB', emojis: ['👩', '<img class="emo" src="icons/cepillo.svg" alt="">', '👧', '🌙'], animo: 'feliz' } },
      { texto: 'Dientín volvió a brillar. Y tú, ¿ya te cepillaste hoy? ¡Fin!', escena: { fondo: '#C8EEFC', emojis: ['⭐', '😁', '⭐'], animo: 'feliz' } },
    ],
  },
  {
    id: 'lonchera-arcoiris',
    titulo: 'La lonchera arcoíris',
    tema: 'alimentacion',
    edad: '4 a 8 años',
    icono: '🌈',
    color: '#E2F8EC',
    resumen: 'Tomás y Dientín arman una lonchera de colores que da energía y cuida los dientes.',
    paginas: [
      { texto: 'Tomás abrió su lonchera y solo encontró paquetes de colores brillantes: papitas, gaseosa y chocolatinas.', escena: { fondo: '#FFF6DB', emojis: ['🥤', '🍫', '🍟'], animo: 'sorpresa' } },
      { texto: '«Eso sabe rico», dijo Dientín, «pero tiene mucho azúcar y mucha sal. Si lo comemos todos los días, las bacterias hacen fiesta en mi casa».', escena: { fondo: '#FFE8EA', emojis: ['🦠🎉', '🍬'], animo: 'triste' } },
      { texto: '«¿Y si armamos una lonchera arcoíris?», propuso Dientín. «Cada color es un superpoder».', escena: { fondo: '#E2F8EC', emojis: ['🌈', '💡'], animo: 'guino' } },
      { texto: 'Rojo de la fresa y el tomate. Naranja de la zanahoria y la mandarina. Amarillo del banano y el mango.', escena: { fondo: '#FFE8EA', emojis: ['🍓', '🍅', '🥕', '🍊', '🍌'], animo: 'feliz' } },
      { texto: 'Verde de la pera y el brócoli. Y blanco del queso, el huevo y la leche, que ayudan a tener dientes y huesos fuertes.', escena: { fondo: '#E2F8EC', emojis: ['🍐', '🥦', '🧀', '🥚', '🥛'], animo: 'feliz' } },
      { texto: 'Para tomar, lo mejor es agua. ¡El agua limpia la boca y no tiene azúcar!', escena: { fondo: '#C8EEFC', emojis: ['💧', '🚰', '💧'], animo: 'feliz' } },
      { texto: 'Los dulces no están prohibidos: son para ocasiones especiales, de vez en cuando, y después… ¡a cepillarse!', escena: { fondo: '#FFF6DB', emojis: ['🎂', '<img class="emo" src="icons/cepillo.svg" alt="">'], animo: 'guino', cepillo: true } },
      { texto: 'Tomás llegó al colegio con su lonchera arcoíris y les enseñó a sus amigos. ¡Fin!', escena: { fondo: '#EFEBFF', emojis: ['🧒', '🌈', '👧', '🧒'], animo: 'feliz' } },
    ],
  },
  {
    id: 'manos-grandes',
    titulo: 'Manos grandes, dientes chiquitos',
    tema: 'familia',
    edad: '3 a 8 años',
    icono: '🤲',
    color: '#FFE8EA',
    resumen: 'El abuelo Ramón enseña a Lucía que cuidar los dientes es más divertido en familia.',
    paginas: [
      { texto: 'Lucía quería cepillarse solita, como los grandes. Pero el cepillo se le resbalaba y no llegaba a las muelas de atrás.', escena: { fondo: '#FFE8EA', emojis: ['👧', '<img class="emo" src="icons/cepillo.svg" alt="">', '😣'], animo: 'sorpresa' } },
      { texto: 'El abuelo Ramón se acercó. «Mis manos son grandes y tus dientes son chiquitos», dijo sonriendo. «¿Lo hacemos juntos?».', escena: { fondo: '#FFF6DB', emojis: ['👴', '🤲', '👧'], animo: 'feliz' } },
      { texto: 'El abuelo puso en el cepillo una cantidad de crema del tamaño de una arveja. «Ni más, ni menos», explicó.', escena: { fondo: '#E2F8EC', emojis: ['🟢', '<img class="emo" src="icons/cepillo.svg" alt="">'], animo: 'guino', cepillo: true } },
      { texto: 'Lucía cepillaba primero y el abuelo repasaba después. Círculos pequeñitos en cada diente, ¡y también la lengua!', escena: { fondo: '#C8EEFC', emojis: ['🔄', '👅', '💦'], animo: 'feliz', cepillo: true } },
      { texto: 'Pusieron una canción y cepillaron hasta que se acabó: dos minutos exactos. ¡Qué rápido pasó el tiempo!', escena: { fondo: '#EFEBFF', emojis: ['🎵', '⏱️', '🎶'], animo: 'guino' } },
      { texto: 'Al terminar, escupieron la espuma sin enjuagarse con mucha agua, para que el flúor siguiera cuidando los dientes.', escena: { fondo: '#C8EEFC', emojis: ['💦', '🦷', '✨'], animo: 'feliz' } },
      { texto: 'Cada noche, Lucía marcaba una estrella en su calendario. Al final del mes, ¡la familia celebró con un paseo al parque!', escena: { fondo: '#FFF6DB', emojis: ['📅', '⭐', '🌳', '🎈'], animo: 'feliz' } },
      { texto: 'Porque los dientes chiquitos crecen sanos cuando hay manos grandes que acompañan. ¡Fin!', escena: { fondo: '#FFE8EA', emojis: ['❤️', '🤲', '😁'], animo: 'feliz' } },
    ],
  },
];

export const TEMAS = {
  higiene: { nombre: 'Higiene bucal', clase: 'e-higiene' },
  alimentacion: { nombre: 'Alimentación', clase: 'e-alimentacion' },
  familia: { nombre: 'Familia', clase: 'e-familia' },
  otro: { nombre: 'Otros', clase: 'e-otro' },
};
