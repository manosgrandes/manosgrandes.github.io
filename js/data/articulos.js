// Contenido informativo para familias y docentes.
// IMPORTANTE: debe ser revisado y aprobado por un profesional de odontología
// y/o nutrición antes de publicarse oficialmente.

export const ARTICULOS = [
  {
    id: 'higiene-por-edades',
    icono: '<img class="emo" src="icons/cepillo.svg" alt="">',
    para: 'Familias',
    titulo: 'Higiene bucal según la edad',
    resumen: 'Qué hacer desde que nace el bebé hasta que el niño se cepilla solo.',
    html: `
<h2>Antes de que salga el primer diente (0 a 6 meses aprox.)</h2>
<ul>
  <li>Limpia las encías una vez al día con una gasa o tela limpia humedecida en agua.</li>
  <li>No pongas miel, azúcar ni otros endulzantes en el chupo o el biberón.</li>
</ul>
<h2>Desde el primer diente hasta los 3 años</h2>
<ul>
  <li>Cepilla dos veces al día con un cepillo pequeño de cerdas suaves.</li>
  <li>Usa crema dental con flúor en una cantidad <strong>del tamaño de un grano de arroz</strong>.</li>
  <li>El adulto es quien cepilla. El niño puede "ayudar", pero el adulto termina.</li>
  <li>Evita que se quede dormido con el biberón de leche, jugo o bebidas azucaradas.</li>
</ul>
<h2>De 3 a 6 años</h2>
<ul>
  <li>Crema dental con flúor en una cantidad <strong>del tamaño de una arveja</strong>.</li>
  <li>Cepillado de 2 minutos, al menos dos veces al día. <strong>El de la noche es el más importante.</strong></li>
  <li>Enséñale a escupir la espuma sin enjuagarse con abundante agua: así el flúor sigue protegiendo.</li>
  <li>El niño cepilla primero y el adulto repasa después.</li>
</ul>
<h2>De 6 a 8 años y más</h2>
<ul>
  <li>Siguen saliendo los dientes permanentes: las primeras muelas aparecen detrás de las de leche y es fácil olvidarlas.</li>
  <li>Acompaña y revisa el cepillado hasta que tenga buena destreza con las manos (más o menos cuando ya escribe con soltura).</li>
  <li>Usa hilo dental cuando los dientes se toquen entre sí, con ayuda del adulto.</li>
</ul>
<h2>Siempre</h2>
<ul>
  <li>Cambia el cepillo cada 3 meses o antes si las cerdas están abiertas.</li>
  <li>Cada persona tiene su propio cepillo: no se comparte.</li>
  <li>Revisa en la etiqueta de la crema dental que tenga flúor (al menos 1.000 ppm).</li>
</ul>`,
  },
  {
    id: 'alimentacion',
    icono: '🥕',
    para: 'Familias',
    titulo: 'Alimentación que cuida los dientes',
    resumen: 'El azúcar, la frecuencia y las mejores opciones para loncheras y meriendas.',
    html: `
<h2>No es solo cuánto azúcar, sino cuántas veces</h2>
<p>Cada vez que se come algo azucarado, las bacterias de la boca producen ácidos durante un buen rato. Por eso <strong>picar dulces muchas veces al día</strong> hace más daño que comer un postre una sola vez después del almuerzo.</p>
<h2>Recomendaciones prácticas</h2>
<ul>
  <li>Lactancia materna exclusiva durante los primeros 6 meses, como recomienda la Organización Mundial de la Salud.</li>
  <li>Evita dar azúcar añadida a los menores de 2 años.</li>
  <li>Prefiere <strong>agua</strong> para calmar la sed. Los jugos, aun los naturales, mejor enteros como fruta.</li>
  <li>Limita gaseosas, bebidas azucaradas, dulces pegajosos, galletas y paquetes.</li>
  <li>Si hay dulce, que sea en las comidas principales y no entre comidas ni antes de dormir.</li>
  <li>Incluye frutas, verduras, lácteos, huevo y alimentos naturales de la región.</li>
</ul>
<h2>Ideas para la lonchera</h2>
<ul>
  <li>Fruta entera o picada (mango, banano, mandarina, pera, fresa).</li>
  <li>Queso, yogur sin azúcar añadida o huevo cocido.</li>
  <li>Arepa, pan o galletas integrales sin rellenos dulces.</li>
  <li>Palitos de zanahoria, pepino o tomates cherry.</li>
  <li>Una botella de agua.</li>
</ul>
<p>Consulta también las <em>Guías Alimentarias Basadas en Alimentos para la población colombiana</em> del ICBF.</p>`,
  },
  {
    id: 'acompanamiento',
    icono: '🤲',
    para: 'Familias',
    titulo: 'La importancia del acompañamiento familiar',
    resumen: 'Por qué los niños necesitan "manos grandes" que los guíen y cómo hacerlo divertido.',
    html: `
<h2>¿Por qué acompañar?</h2>
<p>Las niñas y los niños pequeños todavía no tienen la habilidad en las manos para limpiar bien todos sus dientes. Además, aprenden mucho más por lo que ven que por lo que se les dice: <strong>si ven a su familia cepillarse, ellos también lo harán</strong>.</p>
<h2>Ideas para que sea un momento agradable</h2>
<ul>
  <li><strong>Cepíllense juntos</strong> frente al espejo. Que el niño imite al adulto.</li>
  <li>Usa una canción o el temporizador de los juegos de este sitio para completar 2 minutos.</li>
  <li>Deja que escoja su cepillo y su color favorito.</li>
  <li>Usa el calendario de estrellas imprimible y celebra los logros con abrazos o un plan especial, no con dulces.</li>
  <li>Lean juntos los cuentos de Dientín y conversen sobre ellos.</li>
  <li>Sé paciente: si un día hay llanto, intenta con calma, cambia de posición (por ejemplo, el niño acostado en tus piernas) y vuelve a intentar.</li>
</ul>
<h2>Señales para consultar al odontólogo</h2>
<ul>
  <li>Manchas blancas opacas o manchas cafés u oscuras en los dientes.</li>
  <li>Dolor, sensibilidad al comer frío o dulce, o mal aliento persistente.</li>
  <li>Encías rojas, inflamadas o que sangran.</li>
  <li>Golpes en la boca o dientes flojos antes de tiempo.</li>
</ul>`,
  },
  {
    id: 'visita-odontologo',
    icono: '🧑‍⚕️',
    para: 'Familias',
    titulo: 'La primera visita al odontólogo',
    resumen: 'Cuándo ir, qué esperar y cómo prepararlos sin miedo.',
    html: `
<h2>¿Cuándo?</h2>
<p>Se recomienda la primera consulta <strong>cuando sale el primer diente o antes de cumplir el primer año</strong>, y luego controles periódicos según indique el profesional.</p>
<p>En Colombia, la Ruta de Promoción y Mantenimiento de la Salud (Resolución 3280 de 2018) incluye para niñas y niños consultas de valoración de la salud bucal y la aplicación de barniz de flúor. <strong>Pregunta en tu EPS</strong> cómo acceder.</p>
<h2>Cómo prepararlos</h2>
<ul>
  <li>Habla de la visita con naturalidad y de forma positiva. Evita frases como "no te va a doler" o "si te portas mal te llevo al odontólogo".</li>
  <li>Jueguen en casa a "contar los dientes" con un espejo.</li>
  <li>Lean juntos un cuento sobre el tema.</li>
  <li>Lleva sus dudas anotadas: alimentación, uso del biberón o chupo, crema dental.</li>
</ul>`,
  },
  {
    id: 'docentes-aula',
    icono: '🏫',
    para: 'Docentes',
    titulo: 'Guía para docentes: salud bucal en el aula',
    resumen: 'Actividades, rutina de cepillado escolar y cómo usar este sitio con el grupo.',
    html: `
<h2>Cómo usar Manos Grandes Dientes Chiquitos en clase</h2>
<ol>
  <li>Crea una cuenta de docente y un <strong>aula</strong> en el <a href="#/docentes">Panel docente</a>. Recibirás un código de 6 letras.</li>
  <li>Cada niño crea su perfil con un <strong>apodo</strong> (sin nombre completo ni datos personales) y escribe el código del aula.</li>
  <li>Los juegos y cuentos que hagan aparecerán en tu panel, y podrás descargar el reporte en Excel (CSV).</li>
  <li>Si no hay internet o no se activó la nube, el panel muestra los perfiles guardados en ese mismo dispositivo (ideal para una tableta compartida).</li>
</ol>
<h2>Secuencia sugerida (5 sesiones)</h2>
<ol>
  <li><strong>Conozco mi boca:</strong> cuento "Dientín y el monstruo de la Caries" + juego "Atrapa las bacterias".</li>
  <li><strong>Mi cepillado:</strong> demostración con un modelo o dibujo grande + juego "Cepilla a Dientín".</li>
  <li><strong>Como rico y sano:</strong> cuento "La lonchera arcoíris" + juego "La lonchera saludable" + revisar juntos las loncheras.</li>
  <li><strong>Mi familia me acompaña:</strong> cuento "Manos grandes, dientes chiquitos" + enviar a casa el calendario de estrellas.</li>
  <li><strong>Soy guardián de la sonrisa:</strong> "Preguntas de Dientín", memoria y entrega de diplomas.</li>
</ol>
<h2>Rutina de cepillado escolar</h2>
<ul>
  <li>Cada niño con su cepillo marcado y guardado en un lugar ventilado, sin que los cabezales se toquen.</li>
  <li>Cepillado después de la merienda o el almuerzo, con supervisión.</li>
  <li>Cambiar los cepillos cada 3 meses (puede coordinarse con las familias).</li>
</ul>
<h2>Trabajo con familias</h2>
<ul>
  <li>Comparte el enlace de este sitio y la sección <a href="#/padres">Padres y docentes</a>.</li>
  <li>Invita a las familias al <a href="#/foro">foro</a> para compartir ideas.</li>
  <li>Usa los <a href="#/recordatorios">recordatorios</a> y el calendario imprimible como tarea en casa.</li>
</ul>`,
  },
  {
    id: 'preguntas-frecuentes',
    icono: '❓',
    para: 'Todos',
    titulo: 'Mitos y preguntas frecuentes',
    resumen: 'Respuestas claras a las dudas más comunes.',
    html: `
<details><summary>"Los dientes de leche no importan porque se caen."</summary><p><strong>Falso.</strong> Sirven para masticar, hablar bien y guardar el espacio para los dientes permanentes. Una caries en un diente de leche puede causar dolor e infecciones.</p></details>
<details><summary>"Si el niño se traga la crema dental es peligroso."</summary><p>Por eso se usa poca cantidad: un grano de arroz en menores de 3 años y una arveja de 3 a 6 años. Con esas cantidades el flúor es seguro y protege. Guarda la crema fuera de su alcance.</p></details>
<details><summary>"Los jugos naturales no dañan los dientes."</summary><p>También tienen azúcares y ácidos. Es mejor la fruta entera y el agua para la sed.</p></details>
<details><summary>"Hay que enjuagarse bien después de cepillarse."</summary><p>Lo recomendado es escupir la espuma y no enjuagar con abundante agua, para que el flúor siga actuando.</p></details>
<details><summary>"Si no le duele, no hay que ir al odontólogo."</summary><p>Las caries al comienzo no duelen. Las visitas de control permiten detectarlas a tiempo y prevenirlas.</p></details>
<details><summary>"Cepillarse fuerte limpia más."</summary><p>No. Se usan movimientos suaves y cortos con cepillo de cerdas suaves. Cepillar fuerte puede lastimar las encías.</p></details>`,
  },
];
