import { JUEGOS } from '../../nucleo/store.js';
import { LISTA_JUEGOS } from './index.js';

const MODULOS = {
  cepillado: () => import('./games/cepillado.js'),
  alimentos: () => import('./games/alimentos.js'),
  memoria: () => import('./games/memoria.js'),
  bacterias: () => import('./games/bacterias.js'),
  quiz: () => import('./games/quiz.js'),
  atrapa: () => import('./games/atrapa.js'),
  pasos: () => import('./games/pasos.js'),
  sombras: () => import('./games/sombras.js'),
  musica: () => import('./games/musica.js'),
  contar: () => import('./games/contar.js'),
};

export async function render(app, [id]) {
  if (!MODULOS[id]) {
    app.innerHTML = '<p class="tarjeta">Ese juego no existe. <a href="#/app/juegos">Ver juegos</a></p>';
    return;
  }
  const info = LISTA_JUEGOS.find((j) => j.id === id);
  app.innerHTML = `
  <div class="fila entre no-imprimir cabeza-juego" style="margin-bottom:1rem">
    <a class="btn btn-claro" href="#/app/juegos">⬅ Juegos</a>
    <h1 style="margin:0;font-size:1.6rem">${info.icono} ${JUEGOS[`juego:${id}`]}</h1>
  </div>
  <section class="zona-juego" id="zona" style="--jc:${info.color};--jt:${info.tinta}"></section>`;
  const juego = await MODULOS[id]();
  return juego.iniciar(app.querySelector('#zona'));
}
