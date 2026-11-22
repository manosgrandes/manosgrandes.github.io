import { JUEGOS } from '../store.js';

const MODULOS = {
  cepillado: () => import('../games/cepillado.js'),
  alimentos: () => import('../games/alimentos.js'),
  memoria: () => import('../games/memoria.js'),
  bacterias: () => import('../games/bacterias.js'),
  quiz: () => import('../games/quiz.js'),
};

export async function render(app, [id]) {
  if (!MODULOS[id]) {
    app.innerHTML = '<p class="tarjeta">Ese juego no existe. <a href="#/juegos">Ver juegos</a></p>';
    return;
  }
  app.innerHTML = `
  <div class="fila entre no-imprimir" style="margin-bottom:1rem">
    <a class="btn btn-claro" href="#/juegos">⬅ Juegos</a>
    <h1 style="margin:0;font-size:1.6rem">${JUEGOS[`juego:${id}`]}</h1>
  </div>
  <section class="zona-juego" id="zona"></section>`;
  const juego = await MODULOS[id]();
  return juego.iniciar(app.querySelector('#zona'));
}
