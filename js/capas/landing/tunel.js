// Escena 2 · Dentro de la sonrisa: túnel de anillos y 24 objetos que pasan volando (perspectiva 1/z).

import { lerp, span, smooth, rampa } from './motor.js';

const ANILLOS_FRIO = ['#FFD9DF', '#FFF6E8', '#D7F2E5'];
const ANILLOS_CALIDO = ['#FFC7C0', '#FFEBD0', '#FFE0A8'];
const TIPOS = ['manzana', 'zanahoria', 'queso', 'agua', 'leche', 'huevo', 'pera', 'cepillo', 'pasta', 'hilo', 'vaso', 'burbujas'];

export function crearTunel(lienzo) {
  const { ctx } = lienzo;
  const objetos = Array.from({ length: 24 }, (_, i) => ({ tipo: TIPOS[i % TIPOS.length], i, inicio: (i / 24) * 0.7 - 0.06 }));

  function dibujarObjeto(tipo, s) {
    // Dibujado en un cuadro de ±50 unidades, escalado por s.
    ctx.scale(s, s);
    switch (tipo) {
      case 'manzana':
        ctx.fillStyle = '#F07C6C'; ctx.beginPath(); ctx.arc(-14, 4, 30, 0, 7); ctx.arc(14, 4, 30, 0, 7); ctx.fill();
        ctx.fillStyle = '#F7A193'; ctx.beginPath(); ctx.ellipse(-18, -8, 9, 13, -0.4, 0, 7); ctx.fill();
        ctx.fillStyle = '#7FCBA4'; ctx.beginPath(); ctx.ellipse(10, -34, 14, 7, -0.5, 0, 7); ctx.fill();
        break;
      case 'zanahoria':
        ctx.rotate(0.6);
        ctx.fillStyle = '#7FCBA4'; ctx.beginPath(); ctx.ellipse(-8, -46, 6, 16, -0.3, 0, 7); ctx.ellipse(8, -46, 6, 16, 0.3, 0, 7); ctx.fill();
        ctx.fillStyle = '#F2995E'; ctx.beginPath(); ctx.moveTo(-18, -34); ctx.quadraticCurveTo(0, -40, 18, -34); ctx.quadraticCurveTo(8, 20, 0, 48); ctx.quadraticCurveTo(-8, 20, -18, -34); ctx.fill();
        ctx.fillStyle = '#E07F45'; ctx.fillRect(-10, -10, 12, 4); ctx.fillRect(-2, 8, 10, 4);
        break;
      case 'queso':
        ctx.fillStyle = '#FFD24A'; ctx.beginPath(); ctx.moveTo(-40, 26); ctx.lineTo(40, 26); ctx.lineTo(40, -6); ctx.lineTo(-40, -26); ctx.fill();
        ctx.fillStyle = '#FFE58A'; ctx.beginPath(); ctx.moveTo(-40, -26); ctx.lineTo(40, -6); ctx.lineTo(40, -14); ctx.fill();
        ctx.fillStyle = '#F2BE4E'; [[-14, 8, 6], [14, 14, 5], [26, 0, 4]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); });
        break;
      case 'agua':
        ctx.fillStyle = '#75BDF2'; ctx.beginPath(); ctx.moveTo(0, -42); ctx.bezierCurveTo(26, -10, 32, 8, 30, 16); ctx.arc(0, 16, 30, 0, Math.PI); ctx.bezierCurveTo(-32, 8, -26, -10, 0, -42); ctx.fill();
        ctx.fillStyle = '#C8EEFC'; ctx.beginPath(); ctx.ellipse(-10, 12, 7, 12, 0.3, 0, 7); ctx.fill();
        break;
      case 'leche':
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(-24, -20, 48, 66, 8); ctx.fill();
        ctx.fillStyle = '#75BDF2'; ctx.beginPath(); ctx.moveTo(-24, -20); ctx.lineTo(0, -44); ctx.lineTo(24, -20); ctx.fill(); ctx.fillRect(-24, 10, 48, 14);
        ctx.fillStyle = '#E3F1FC'; ctx.fillRect(10, -20, 14, 66);
        break;
      case 'huevo':
        ctx.fillStyle = '#FFF6E8'; ctx.beginPath(); ctx.ellipse(0, 4, 28, 38, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#F3E5CC'; ctx.beginPath(); ctx.ellipse(10, 12, 12, 22, 0.2, 0, 7); ctx.fill();
        break;
      case 'pera':
        ctx.fillStyle = '#B7DB7A'; ctx.beginPath(); ctx.arc(0, 18, 28, 0, 7); ctx.arc(0, -14, 18, 0, 7); ctx.fill();
        ctx.fillStyle = '#D2EBA2'; ctx.beginPath(); ctx.ellipse(-10, 10, 7, 13, 0.2, 0, 7); ctx.fill();
        ctx.strokeStyle = '#8A5A3B'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(4, -42); ctx.stroke();
        break;
      case 'cepillo':
        ctx.rotate(-0.5);
        ctx.fillStyle = '#4A9FE0'; ctx.beginPath(); ctx.roundRect(-50, -6, 86, 12, 6); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.roundRect(22 + k * 7, -24, 6, 18, 3); ctx.fill(); }
        ctx.fillStyle = '#2F86C9'; ctx.beginPath(); ctx.roundRect(18, -8, 34, 10, 5); ctx.fill();
        break;
      case 'pasta':
        ctx.rotate(0.4);
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(-40, -18); ctx.lineTo(24, -14); ctx.lineTo(24, 14); ctx.lineTo(-40, 18); ctx.fill();
        ctx.fillStyle = '#F2B4CC'; ctx.fillRect(-26, -10, 30, 20);
        ctx.fillStyle = '#75BDF2'; ctx.beginPath(); ctx.roundRect(24, -9, 16, 18, 4); ctx.fill();
        ctx.fillStyle = '#E4F6EE'; ctx.beginPath(); ctx.ellipse(48, 0, 9, 6, 0, 0, 7); ctx.fill();
        break;
      case 'hilo':
        ctx.fillStyle = '#91D9B5'; ctx.beginPath(); ctx.roundRect(-28, -22, 56, 44, 14); ctx.fill();
        ctx.fillStyle = '#C7EEDB'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 7); ctx.fill();
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(28, -10); ctx.bezierCurveTo(50, -30, 44, 20, 60, 6); ctx.stroke();
        break;
      case 'vaso':
        ctx.fillStyle = '#C8EEFC'; ctx.beginPath(); ctx.moveTo(-26, -34); ctx.lineTo(26, -34); ctx.lineTo(20, 38); ctx.lineTo(-20, 38); ctx.fill();
        ctx.fillStyle = '#75BDF2'; ctx.beginPath(); ctx.moveTo(-23, -6); ctx.lineTo(23, -6); ctx.lineTo(20, 38); ctx.lineTo(-20, 38); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.globalAlpha *= 0.6; ctx.fillRect(-16, -28, 6, 56);
        break;
      default: // burbujas
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        [[0, 0, 22], [28, -20, 12], [-24, 22, 10], [26, 24, 8]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); });
        ctx.fillStyle = 'rgba(200,238,252,.9)'; ctx.beginPath(); ctx.arc(-6, -6, 6, 0, 7); ctx.fill();
    }
  }

  /** dentro: 0–1 avance dentro de la sonrisa. */
  function dibujar(dentro, tiempo) {
    const { w, h } = lienzo;
    const cx = w / 2;
    const cy = h / 2;
    const calor = smooth(0.1, 0.95, dentro);
    // Fondo: el centro del túnel, más profundo y oscuro
    ctx.fillStyle = rampa([[0, '#B4457A'], [1, '#C8614E']], calor);
    ctx.fillRect(0, 0, w, h);
    // Anillos concéntricos que crecen hacia la cámara
    const diag = Math.hypot(w, h) * 0.5;
    const avance = dentro * 14 + tiempo * 0.00012;
    const N = 16;
    for (let k = 0; k <= N; k++) {
      const fase = k - (avance % 1);
      const z = fase * 0.55 + 0.25;
      if (z <= 0.05) continue;
      const r = (diag * 0.42) / z;
      const idx = ((k + Math.floor(avance)) % 3 + 3) % 3;
      const c = rampa([[0, ANILLOS_FRIO[idx]], [1, ANILLOS_CALIDO[idx]]], calor);
      const ox = Math.sin(avance * 0.7 + k * 0.4) * 14 / z;
      const oy = Math.cos(avance * 0.5 + k * 0.3) * 10 / z;
      ctx.fillStyle = c;
      ctx.globalAlpha = Math.min(1, z < 1 ? 1 : 1.6 - z * 0.12);
      ctx.beginPath(); ctx.arc(cx + ox, cy + oy, r, 0, 7); ctx.fill();
      // Sombra interior suave para dar volumen
      ctx.fillStyle = 'rgba(160, 50, 90, .10)';
      ctx.beginPath(); ctx.arc(cx + ox, cy + oy, r * 0.93, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Centro brillante
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, diag * 0.35);
    g.addColorStop(0, 'rgba(255, 250, 240, .9)');
    g.addColorStop(1, 'rgba(255, 250, 240, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Objetos que pasan volando
    const ancho = w;
    const alto = h;
    for (const o of objetos) {
      const k = span(o.inicio, o.inicio + 0.32, dentro);
      if (k <= 0 || k >= 1) continue;
      const a = o.i * 2.39996; // ángulo áureo: reparte sin amontonar
      const s = 1 / lerp(3.6, 0.36, k);
      const x = Math.cos(a) * 0.36 * ancho * s * 1.25;
      const y = Math.sin(a) * 0.37 * alto * s * 1.25;
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 6) * Math.min(1, (1 - k) * 5);
      ctx.translate(cx + x, cy + y);
      ctx.rotate(Math.sin(o.i * 7 + k * 3) * 0.5);
      dibujarObjeto(o.tipo, s * Math.min(w, h) * 0.0022);
      ctx.restore();
    }
  }

  return { dibujar };
}
