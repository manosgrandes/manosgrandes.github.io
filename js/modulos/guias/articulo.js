import { ARTICULOS } from './datos.js';
import { leer, detener, vozDisponible } from '../../nucleo/speech.js';

export function render(app, [id]) {
  const a = ARTICULOS.find((x) => x.id === id);
  if (!a) {
    app.innerHTML = '<p class="tarjeta">No encontramos esa guía. <a href="#/app/guias">Ver todas</a></p>';
    return;
  }
  const i = ARTICULOS.indexOf(a);
  const sig = ARTICULOS[(i + 1) % ARTICULOS.length];
  app.innerHTML = `
  <article class="articulo tarjeta">
    <div class="fila entre no-imprimir">
      <a class="btn btn-claro" href="#/app/guias">⬅ Padres y docentes</a>
      <div class="fila">
        ${vozDisponible() ? '<button class="btn btn-mini" id="oir">🔊 Escuchar</button><button class="btn btn-mini" id="parar">⏹</button>' : ''}
        <button class="btn btn-mini" onclick="print()">🖨️ Imprimir / PDF</button>
      </div>
    </div>
    <p style="font-size:3rem;margin:.5rem 0 0">${a.icono}</p>
    <span class="etiqueta">${a.para}</span>
    <h1>${a.titulo}</h1>
    <p class="suave" style="font-size:1.15rem">${a.resumen}</p>
    <div id="cuerpo">${a.html}</div>
    <p class="nota chico" style="margin-top:2rem">Contenido educativo. Ante cualquier duda, consulte con un profesional de la salud.</p>
    <p class="no-imprimir"><a class="btn" href="#/app/guias/${sig.id}">Siguiente: ${sig.titulo} ➡</a></p>
  </article>`;
  app.querySelector('#oir')?.addEventListener('click', () => leer(`${a.titulo}. ${app.querySelector('#cuerpo').innerText}`, { velocidad: 1 }));
  app.querySelector('#parar')?.addEventListener('click', detener);
}
