// Escena 1 · Villa Sonrisa en perspectiva real (Canvas 2D).
// Cajas en metros, ordenadas de atrás hacia adelante; la cámara es función pura del progreso p.

import { azar, clamp, lerp, span, smooth, easeInOut, mezclar } from './motor.js';

const CIELO_ARRIBA = '#BFE2FA';
const CIELO_HORIZONTE = '#FDEFF4';
const NIEBLA = '#F3EEF9';
const PUERTAS = ['#F2B4CC', '#75BDF2', '#91D9B5', '#FFD98A', '#FFA995', '#B8A5ED'];

// La cara del niño o niña al fondo y el hueco del diente que falta.
const CARA = { z: 132, x: 0, y: 20, r: 18 };
const BOCA = { y: 13.2, ancho: 9.2, alto: 4.4 };
const DIENTES = 6;
// Tira de cuadros del video de la enfermera patinando de espaldas (10 columnas, 250×300 cada cuadro).
const PATINA = { n: 67, col: 10, w: 250, h: 300, fps: 12 };
const FALTA = 3; // índice del diente con caries: su hueco es la entrada al túnel
const DIENTE_W = (BOCA.ancho * 1.5) / DIENTES;
export const HUECO = { x: CARA.x - (BOCA.ancho * 1.5) / 2 + DIENTE_W * (FALTA + 0.5), y: BOCA.y + 1.25, r: 0.7 };

function construirMundo(movil) {
  const rnd = azar(20240611);
  const objetos = [];
  const filas = movil ? 10 : 17;
  const paso = movil ? 10.5 : 6.6;
  for (let i = 0; i < filas; i++) {
    for (const lado of [-1, 1]) {
      const z = 4 + i * paso + rnd() * 1.4;
      const torre = rnd() < 0.2;
      const w = torre ? 2.4 : 4 + rnd() * 1.6;
      objetos.push({
        tipo: torre ? 'torre' : 'casa', lado, z, d: torre ? 2.4 : 3.6 + rnd(),
        x: lado * (7.4 + rnd() * 1.4 + w / 2 - 2), w,
        h: torre ? 9 + rnd() * 4 : 3.3 + rnd() * 2.4,
        puerta: PUERTAS[Math.floor(rnd() * PUERTAS.length)],
        franja: PUERTAS[Math.floor(rnd() * PUERTAS.length)],
      });
      if (rnd() < 0.8) {
        objetos.push({ tipo: rnd() < 0.55 ? 'manzano' : 'zanahoria', lado, x: lado * (5.4 + rnd() * 0.5), z: z + paso * 0.5, s: 0.85 + rnd() * 0.4, semilla: Math.floor(rnd() * 1e6) });
      }
    }
  }
  // Postes que son cepillos, con banderines de hilo dental entre ellos.
  const largo = 4 + filas * paso;
  for (let z = 2; z < largo; z += 12) {
    for (const lado of [-1, 1]) objetos.push({ tipo: 'poste', lado, x: lado * 4.7, z });
    if (Math.round(z / 12) % 2 === 0) objetos.push({ tipo: 'cruce', z: z + 0.01, semilla: Math.floor(z * 13) });
  }
  objetos.sort((a, b) => b.z - a.z);
  return { objetos, largo };
}

export function crearCiudad(lienzo, { movil = false } = {}) {
  const { ctx } = lienzo;
  const mundo = construirMundo(movil);
  const nubes = Array.from({ length: 7 }, (_, i) => {
    const r = azar(77 + i);
    return { x: r(), y: 0.08 + r() * 0.22, s: 0.6 + r() * 0.8, v: 0.3 + r() * 0.5 };
  });
  const cam = { x: 0, y: 5, z: -50, f: 1, cx: 0, hor: 0 };
  const salida = { hueco: { x: 0, y: 0, r: 0 } };
  const espalda = new Image();
  espalda.decoding = 'async';
  espalda.src = 'img/enfermera-espalda.webp';
  const patina = new Image();
  patina.decoding = 'async';
  patina.src = 'img/enfermera-patina.webp';

  // Proyección
  const X = (x, z) => cam.cx + ((x - cam.x) * cam.f) / (z - cam.z);
  const Y = (y, z) => cam.hor - ((y - cam.y) * cam.f) / (z - cam.z);
  const S = (m, z) => (m * cam.f) / (z - cam.z); // metros → píxeles a esa distancia
  const niebla = (z) => 1 - Math.exp(-(z - cam.z) / 78);
  const color = (c, z) => mezclar(c, NIEBLA, niebla(z) * 0.85);
  const colorCara = (c, z) => mezclar(c, NIEBLA, niebla(z) * 0.35);
  const CERCA = 0.6;

  function camara(p, extra) {
    const { w, h } = lienzo;
    cam.f = Math.min(h * 0.92, w * 1.15);
    cam.cx = w / 2;
    cam.hor = h * lerp(0.36, 0.5, smooth(0.0, 0.42, p));
    const t = span(0, 0.86, p);
    const avance = easeInOut(t);
    let z = lerp(-50, 118, avance);
    const acerca = smooth(0.6, 0.82, p);
    cam.y = lerp(lerp(5.3, 2.6, smooth(0.02, 0.42, p)), HUECO.y, acerca) + (1 - extra.intro) * 9;
    cam.x = Math.sin(p * 13) * 1.1 * (1 - acerca) + lerp(0, HUECO.x, acerca);
    cam.x += extra.mx * 0.7 * (1 - acerca);
    cam.y += extra.my * 0.35 * (1 - acerca);
    // Acercamiento exponencial al hueco: se siente constante hasta cruzarlo.
    const zIni = 0.62;
    if (p > zIni) {
      const zEnZ = lerp(-50, 118, easeInOut(span(0, 0.86, zIni)));
      const lejos = CARA.z - zEnZ;
      const cerca = 0.1;
      const zoom = span(zIni, 1, p);
      const distancia = lejos * Math.pow(cerca / lejos, zoom * zoom * (1.6 - 0.6 * zoom));
      z = CARA.z - distancia;
    }
    cam.z = z;
  }

  // ---------- Fondo: cielo, sol, nubes de espuma y colinas (se mueven mucho menos que la calle)
  function fondo(p) {
    const { w, h } = lienzo;
    const g = ctx.createLinearGradient(0, 0, 0, cam.hor + 40);
    g.addColorStop(0, CIELO_ARRIBA);
    g.addColorStop(1, CIELO_HORIZONTE);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const par = -cam.x * 6;
    // Sol
    const sx = w * 0.8 + par * 0.3;
    const sy = cam.hor * 0.42 - (cam.y - 3) * 3;
    ctx.fillStyle = 'rgba(255, 217, 138, .28)';
    ctx.beginPath(); ctx.arc(sx, sy, Math.min(w, h) * 0.12, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFD98A';
    ctx.beginPath(); ctx.arc(sx, sy, Math.min(w, h) * 0.07, 0, 7); ctx.fill();
    ctx.fillStyle = '#FFE7B0';
    ctx.beginPath(); ctx.arc(sx - Math.min(w, h) * 0.018, sy - Math.min(w, h) * 0.018, Math.min(w, h) * 0.04, 0, 7); ctx.fill();

    // Nubes de espuma
    nubes.forEach((n) => {
      const r = Math.min(w, h) * 0.05 * n.s;
      const x = ((n.x * w * 1.4 + par * 0.6 - cam.z * n.v * 2.5) % (w * 1.4) + w * 1.4) % (w * 1.4) - w * 0.2;
      const y = n.y * h + (cam.y - 3) * 4;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 7); ctx.arc(x + r * 1.1, y - r * 0.4, r * 1.2, 0, 7); ctx.arc(x + r * 2.3, y, r * 0.9, 0, 7);
      ctx.fill();
      ctx.fillStyle = '#EEF6FD';
      ctx.fillRect(x - r * 0.2, y, r * 2.7, r * 0.75);
      ctx.beginPath(); ctx.ellipse(x + r * 1.15, y + r * 0.6, r * 1.9, r * 0.35, 0, 0, 7); ctx.fill();
    });

    // Colinas (dos planos), se hunden durante el acercamiento final para no tapar la boca.
    const baja = smooth(0.55, 0.75, p) * h * 0.4;
    const colina = (alto, col, fase, k) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 20; x += 20) {
        const u = (x - par * k) / w;
        ctx.lineTo(x, cam.hor + baja - alto * h * (0.55 + 0.45 * Math.sin(u * 6.3 + fase) * Math.sin(u * 2.1 + fase * 2)));
      }
      ctx.lineTo(w, h);
      ctx.fill();
    };
    colina(0.09, '#DCEFE6', 1.2, 0.5);
    colina(0.055, '#C9E9D9', 3.1, 0.9);
  }

  // ---------- La cara gigante y sonriente, con el hueco del diente de leche que falta
  /** repara (0–1): la caries se borra cuando la enfermera entra. chispa (0–1): destellos sobre el diente sano. */
  function cara(repara = 0, chispa = 0) {
    const z = CARA.z;
    if (z - cam.z < CERCA) return;
    const cx = X(CARA.x, z);
    const cy = Y(CARA.y, z);
    const R = S(CARA.r, z);
    if (R < 1) return;
    const piel = colorCara('#E8B48C', z);
    const sombra = colorCara('#D69C74', z);
    // Orejas
    ctx.fillStyle = sombra;
    ctx.beginPath(); ctx.arc(cx - R * 0.97, cy + R * 0.05, R * 0.2, 0, 7); ctx.arc(cx + R * 0.97, cy + R * 0.05, R * 0.2, 0, 7); ctx.fill();
    // Cabello (detrás)
    ctx.fillStyle = colorCara('#5A3A2E', z);
    ctx.beginPath(); ctx.ellipse(cx, cy - R * 0.2, R * 1.06, R * 0.98, 0, Math.PI, 0); ctx.fill();
    // Cara
    ctx.fillStyle = piel;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.fillStyle = sombra;
    ctx.beginPath(); ctx.ellipse(cx + R * 0.1, cy + R * 0.55, R * 0.8, R * 0.4, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = piel;
    ctx.beginPath(); ctx.ellipse(cx, cy + R * 0.2, R * 0.95, R * 0.72, 0, 0, 7); ctx.fill();
    // Cabello: casquete que cubre toda la coronilla, flequillo en mechones y un remolino arriba
    const pelo = colorCara('#5A3A2E', z);
    const brillo = colorCara('#7A5243', z);
    ctx.fillStyle = pelo;
    ctx.beginPath();
    ctx.moveTo(cx - R * 1.0, cy - R * 0.12);
    ctx.bezierCurveTo(cx - R * 1.12, cy - R * 0.85, cx - R * 0.55, cy - R * 1.22, cx, cy - R * 1.2);
    ctx.bezierCurveTo(cx + R * 0.6, cy - R * 1.22, cx + R * 1.12, cy - R * 0.85, cx + R * 1.0, cy - R * 0.12);
    // Borde del flequillo: mechones redondeados que bajan sobre la frente
    ctx.quadraticCurveTo(cx + R * 0.94, cy - R * 0.3, cx + R * 0.78, cy - R * 0.42);
    ctx.quadraticCurveTo(cx + R * 0.66, cy - R * 0.3, cx + R * 0.5, cy - R * 0.46);
    ctx.quadraticCurveTo(cx + R * 0.36, cy - R * 0.34, cx + R * 0.18, cy - R * 0.5);
    ctx.quadraticCurveTo(cx + R * 0.02, cy - R * 0.36, cx - R * 0.16, cy - R * 0.52);
    ctx.quadraticCurveTo(cx - R * 0.34, cy - R * 0.38, cx - R * 0.52, cy - R * 0.5);
    ctx.quadraticCurveTo(cx - R * 0.7, cy - R * 0.36, cx - R * 0.8, cy - R * 0.44);
    ctx.quadraticCurveTo(cx - R * 0.94, cy - R * 0.3, cx - R * 1.0, cy - R * 0.12);
    ctx.fill();
    // Remolino en la coronilla
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.05, cy - R * 1.16);
    ctx.quadraticCurveTo(cx + R * 0.02, cy - R * 1.42, cx + R * 0.26, cy - R * 1.4);
    ctx.quadraticCurveTo(cx + R * 0.12, cy - R * 1.3, cx + R * 0.16, cy - R * 1.16);
    ctx.fill();
    // Brillos suaves del pelo
    ctx.strokeStyle = brillo;
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(1, R * 0.05);
    ctx.beginPath(); ctx.arc(cx - R * 0.1, cy - R * 0.2, R * 0.86, Math.PI * 1.28, Math.PI * 1.45); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + R * 0.1, cy - R * 0.2, R * 0.86, Math.PI * 1.58, Math.PI * 1.7); ctx.stroke();
    // Ojos felices (arcos) y mejillas
    ctx.strokeStyle = colorCara('#3B2C3E', z);
    ctx.lineWidth = Math.max(1, R * 0.06);
    ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.arc(cx + s * R * 0.36, cy - R * 0.05, R * 0.13, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      ctx.fillStyle = colorCara('#F59A9A', z);
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.ellipse(cx + s * R * 0.55, cy + R * 0.2, R * 0.15, R * 0.09, 0, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Boca: sonrisa abierta con la fila de dientes de arriba
    const by = Y(BOCA.y, z);
    const bw = S(BOCA.ancho, z);
    const bh = S(BOCA.alto, z);
    const bx = X(CARA.x, z);
    ctx.fillStyle = colorCara('#8E3550', z);
    ctx.beginPath();
    ctx.moveTo(bx - bw * 0.75, by - bh * 0.35);
    ctx.quadraticCurveTo(bx, by - bh * 0.62, bx + bw * 0.75, by - bh * 0.35);
    ctx.quadraticCurveTo(bx + bw * 0.7, by + bh * 0.95, bx, by + bh * 1.0);
    ctx.quadraticCurveTo(bx - bw * 0.7, by + bh * 0.95, bx - bw * 0.75, by - bh * 0.35);
    ctx.fill();
    ctx.fillStyle = colorCara('#F28C9C', z);
    ctx.beginPath(); ctx.ellipse(bx, by + bh * 0.62, bw * 0.38, bh * 0.28, 0, 0, 7); ctx.fill();
    // Dientes (el de la caries también se dibuja; el hueco va encima)
    const x0 = CARA.x - (BOCA.ancho * 1.5) / 2;
    for (let i = 0; i < DIENTES; i++) {
      const tx = x0 + DIENTE_W * i;
      const curva = Math.abs(i - (DIENTES - 1) / 2) * 0.22;
      const top = BOCA.y + 2.2 - curva * 0.6;
      const alto = 1.9 - curva * 0.5;
      const l = X(tx + 0.07, z);
      const r = X(tx + DIENTE_W - 0.07, z);
      const t = Y(top, z);
      const b = Y(top - alto, z);
      ctx.fillStyle = colorCara('#FFFFFF', z);
      ctx.beginPath(); ctx.roundRect(l, t, r - l, b - t, [0, 0, (r - l) * 0.35, (r - l) * 0.35]); ctx.fill();
      ctx.fillStyle = colorCara('#EAE6F5', z);
      ctx.fillRect(l, b - (b - t) * 0.22, (r - l), (b - t) * 0.12);
    }
    // La caries: mancha café irregular alrededor del hueco oscuro por donde entra la enfermera.
    // Al repararse, la mancha se desvanece y el hueco se cierra hasta dejar el diente blanco.
    const hx = X(HUECO.x, z);
    const hy = Y(HUECO.y, z);
    const hr = S(HUECO.r, z);
    const mancha = (radio, col) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      for (let k = 0; k <= 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        const rr = radio * (1 + 0.13 * Math.sin(a * 3 + 1) + 0.07 * Math.cos(a * 5));
        const px = hx + Math.cos(a) * rr;
        const py = hy + Math.sin(a) * rr * 1.05;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    };
    if (repara < 1) {
      const cierra = 1 - repara;
      ctx.globalAlpha = Math.min(1, cierra * 1.4);
      mancha(hr * 1.3, colorCara('#D9B98C', z));
      mancha(hr * 1.16, colorCara('#A8774E', z));
      ctx.globalAlpha = 1;
      mancha(hr * 1.06 * cierra, colorCara('#6B4130', z));
      ctx.fillStyle = colorCara('#2E1A16', z);
      ctx.beginPath(); ctx.arc(hx, hy, hr * cierra, 0, 7); ctx.fill();
      // Puntitos de caries alrededor
      ctx.globalAlpha = cierra;
      ctx.fillStyle = colorCara('#8A5A3C', z);
      for (const [dx, dy, rr] of [[-1.1, -1.05, 0.13], [1.12, -0.95, 0.1], [0.95, 1.05, 0.11]]) {
        ctx.beginPath(); ctx.arc(hx + dx * hr, hy + dy * hr, rr * hr, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // Diente reparado: reflejo de esmalte y destellos de estrella
    if (repara > 0) {
      ctx.globalAlpha = repara;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.ellipse(hx - hr * 0.45, hy - hr * 0.35, hr * 0.18, hr * 0.5, -0.25, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (chispa > 0) {
      const estrella = (x, y, t) => {
        ctx.beginPath();
        ctx.moveTo(x, y - t);
        ctx.quadraticCurveTo(x, y, x + t, y);
        ctx.quadraticCurveTo(x, y, x, y + t);
        ctx.quadraticCurveTo(x, y, x - t, y);
        ctx.quadraticCurveTo(x, y, x, y - t);
        ctx.fill();
      };
      ctx.fillStyle = '#FFF6C9';
      ctx.shadowColor = 'rgba(255, 230, 140, .9)';
      ctx.shadowBlur = hr * 0.8;
      for (const [dx, dy, t, fase] of [[0, 0, 1.5, 0], [-1.3, -1.1, 0.7, 0.25], [1.25, -0.9, 0.55, 0.45], [1.0, 1.15, 0.6, 0.15]]) {
        const k = Math.sin(Math.PI * clamp(chispa * 1.3 - fase));
        if (k > 0) estrella(hx + dx * hr, hy + dy * hr, hr * t * k);
      }
      ctx.shadowBlur = 0;
    }
    salida.hueco = { x: hx, y: hy, r: hr };
  }

  // ---------- Suelo y calle
  function suelo() {
    const { w, h } = lienzo;
    const zc = cam.z + CERCA;
    const zl = mundo.largo + 10;
    if (zl <= zc) return;
    const yl = Y(0, zl);
    ctx.fillStyle = color('#BFE8D2', zl);
    ctx.fillRect(0, yl, w, h - yl);
    const g = ctx.createLinearGradient(0, yl, 0, h);
    g.addColorStop(0, 'rgba(145,217,181,0)');
    g.addColorStop(1, 'rgba(145,217,181,.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, yl, w, h - yl);
    const quad = (x1, x2, z1, z2, c) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(X(x1, z1), Y(0, z1)); ctx.lineTo(X(x2, z1), Y(0, z1));
      ctx.lineTo(X(x2, z2), Y(0, z2)); ctx.lineTo(X(x1, z2), Y(0, z2));
      ctx.fill();
    };
    quad(-5.8, 5.8, zc, zl, '#F6F1FB');
    quad(-4.1, 4.1, zc, zl, '#DCD5EE');
    // Rayas de la calle
    ctx.fillStyle = '#FFFFFF';
    for (let z = Math.ceil(zc / 4) * 4; z < zl; z += 4) {
      const z2 = Math.min(z + 1.8, zl);
      if (z2 <= zc) continue;
      ctx.globalAlpha = 1 - niebla(z) * 0.8;
      quad(-0.14, 0.14, Math.max(z, zc), z2, '#FFFFFF');
    }
    ctx.globalAlpha = 1;
  }

  // ---------- Objetos de la ciudad
  function casa(o) {
    const zc = cam.z + CERCA;
    const z0 = Math.max(o.z, zc);
    const z1 = o.z + o.d;
    if (z1 <= zc) return;
    const xi = o.x - o.lado * (o.w / 2); // cara que mira a la calle
    const hm = o.tipo === 'torre' ? o.h : o.h * 0.78;
    // Lateral
    ctx.fillStyle = color(o.tipo === 'torre' ? '#E3EEF8' : '#E7E1F3', o.z);
    ctx.beginPath();
    ctx.moveTo(X(xi, z0), Y(0, z0)); ctx.lineTo(X(xi, z1), Y(0, z1));
    ctx.lineTo(X(xi, z1), Y(hm, z1)); ctx.lineTo(X(xi, z0), Y(hm, z0));
    ctx.fill();
    // Techo visto desde arriba
    if (cam.y > hm) {
      ctx.fillStyle = color('#FBF8FF', o.z);
      const xo = o.x + o.lado * (o.w / 2);
      ctx.beginPath();
      ctx.moveTo(X(xi, z0), Y(hm, z0)); ctx.lineTo(X(xo, z0), Y(hm, z0));
      ctx.lineTo(X(xo, z1), Y(hm, z1)); ctx.lineTo(X(xi, z1), Y(hm, z1));
      ctx.fill();
    }
    if (o.z < zc) return; // el frente quedó detrás de la cámara
    const l = X(o.x - o.w / 2, o.z);
    const r = X(o.x + o.w / 2, o.z);
    const b = Y(0, o.z);
    const t = Y(o.h, o.z);
    const ww = r - l;
    const hh = b - t;
    if (o.tipo === 'torre') {
      // Torre de pasta dental: tubo con franjas, tapa y remolino de pasta arriba.
      ctx.fillStyle = color('#FFFFFF', o.z);
      ctx.beginPath(); ctx.roundRect(l, t + hh * 0.12, ww, hh * 0.88, ww * 0.18); ctx.fill();
      ctx.fillStyle = color(o.franja, o.z);
      ctx.fillRect(l, t + hh * 0.4, ww, hh * 0.12);
      ctx.fillRect(l, t + hh * 0.58, ww, hh * 0.05);
      ctx.fillStyle = color('#75BDF2', o.z);
      ctx.beginPath(); ctx.roundRect(l + ww * 0.25, t + hh * 0.04, ww * 0.5, hh * 0.1, ww * 0.06); ctx.fill();
      ctx.fillStyle = color('#E4F6EE', o.z);
      ctx.beginPath();
      ctx.ellipse(l + ww * 0.5, t + hh * 0.02, ww * 0.32, hh * 0.04, 0, 0, 7);
      ctx.ellipse(l + ww * 0.55, t - hh * 0.03, ww * 0.2, hh * 0.035, 0, 0, 7);
      ctx.fill();
      if (ww > 10) {
        ctx.fillStyle = color('#FFE9A8', o.z);
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(l + ww * 0.5, t + hh * (0.24 + k * 0.17 + (k > 0 ? 0.14 : 0)), ww * 0.1, 0, 7); ctx.fill(); }
      }
      return;
    }
    // Casa con forma de muela: cuerpo redondeado y dos cúspides arriba.
    ctx.fillStyle = color('#FFFFFF', o.z);
    ctx.beginPath();
    ctx.moveTo(l, b);
    ctx.lineTo(l, t + hh * 0.35);
    ctx.bezierCurveTo(l, t - hh * 0.02, l + ww * 0.42, t - hh * 0.02, l + ww * 0.5, t + hh * 0.12);
    ctx.bezierCurveTo(l + ww * 0.58, t - hh * 0.02, r, t - hh * 0.02, r, t + hh * 0.35);
    ctx.lineTo(r, b);
    ctx.fill();
    ctx.fillStyle = color('#EFEAF8', o.z);
    ctx.fillRect(l, b - hh * 0.1, ww, hh * 0.1);
    if (ww < 8) return;
    // Puerta y ventanas
    ctx.fillStyle = color(o.puerta, o.z);
    ctx.beginPath(); ctx.roundRect(l + ww * 0.4, b - hh * 0.42, ww * 0.2, hh * 0.42, [ww * 0.1, ww * 0.1, 0, 0]); ctx.fill();
    ctx.fillStyle = color('#FFE9A8', o.z);
    ctx.beginPath(); ctx.arc(l + ww * 0.22, t + hh * 0.42, ww * 0.08, 0, 7); ctx.arc(l + ww * 0.78, t + hh * 0.42, ww * 0.08, 0, 7); ctx.fill();
    ctx.fillStyle = color('#F2B4CC', o.z);
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.ellipse(l + ww * 0.25, t + hh * 0.2, ww * 0.06, hh * 0.04, 0, 0, 7); ctx.ellipse(l + ww * 0.75, t + hh * 0.2, ww * 0.06, hh * 0.04, 0, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function arbol(o) {
    if (o.z - cam.z < CERCA) return;
    const x = X(o.x, o.z);
    const b = Y(0, o.z);
    const s = S(o.s, o.z);
    if (s < 0.6) return;
    if (o.tipo === 'manzano') {
      ctx.fillStyle = color('#B98B6E', o.z);
      ctx.beginPath(); ctx.roundRect(x - s * 0.16, b - s * 2.2, s * 0.32, s * 2.2, s * 0.1); ctx.fill();
      ctx.fillStyle = color('#7FCBA4', o.z);
      ctx.beginPath(); ctx.arc(x, b - s * 2.8, s * 1.25, 0, 7); ctx.fill();
      ctx.fillStyle = color('#9BDDB9', o.z);
      ctx.beginPath(); ctx.arc(x - s * 0.35, b - s * 3.1, s * 0.75, 0, 7); ctx.fill();
      if (s > 3) {
        const r = azar(o.semilla);
        ctx.fillStyle = color('#F07C6C', o.z);
        for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x + (r() - 0.5) * s * 1.8, b - s * (2.3 + r() * 1.1), s * 0.17, 0, 7); ctx.fill(); }
      }
    } else {
      // Zanahoria gigante que crece del suelo
      ctx.fillStyle = color('#7FCBA4', o.z);
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.ellipse(x + k * s * 0.3, b - s * 3.5, s * 0.18, s * 0.6, k * 0.4, 0, 7); ctx.fill(); }
      ctx.fillStyle = color('#F2995E', o.z);
      ctx.beginPath();
      ctx.moveTo(x - s * 0.65, b - s * 3.0);
      ctx.quadraticCurveTo(x, b - s * 3.3, x + s * 0.65, b - s * 3.0);
      ctx.quadraticCurveTo(x + s * 0.3, b - s * 0.8, x, b);
      ctx.quadraticCurveTo(x - s * 0.3, b - s * 0.8, x - s * 0.65, b - s * 3.0);
      ctx.fill();
      ctx.fillStyle = color('#E07F45', o.z);
      ctx.fillRect(x - s * 0.3, b - s * 2.2, s * 0.35, s * 0.08);
      ctx.fillRect(x - s * 0.05, b - s * 1.5, s * 0.3, s * 0.08);
    }
  }

  function poste(o) {
    if (o.z - cam.z < CERCA) return;
    const x = X(o.x, o.z);
    const b = Y(0, o.z);
    const s = S(1, o.z);
    ctx.fillStyle = color('#75BDF2', o.z);
    ctx.beginPath(); ctx.roundRect(x - s * 0.09, b - s * 4.3, s * 0.18, s * 4.3, s * 0.09); ctx.fill();
    // Cabeza del cepillo
    const hx = x - o.lado * s * 0.3;
    ctx.beginPath(); ctx.roundRect(hx - s * 0.6, b - s * 4.5, s * 1.2, s * 0.24, s * 0.12); ctx.fill();
    ctx.fillStyle = color('#FFFFFF', o.z);
    for (let k = 0; k < 5; k++) {
      ctx.beginPath(); ctx.roundRect(hx - s * 0.55 + k * s * 0.23, b - s * 4.95, s * 0.17, s * 0.48, s * 0.08); ctx.fill();
    }
  }

  // Banderines de hilo dental que cruzan la calle (pasan muy cerca, por encima de la cámara)
  function cruce(o) {
    if (o.z - cam.z < CERCA) return;
    const s = S(1, o.z);
    const x1 = X(-4.7, o.z);
    const x2 = X(4.7, o.z);
    const y1 = Y(4.4, o.z);
    const ym = Y(3.7, o.z);
    ctx.strokeStyle = color('#FFFFFF', o.z);
    ctx.lineWidth = Math.max(1, s * 0.05);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, ym * 2 - y1, x2, y1); ctx.stroke();
    if (s < 2) return;
    const n = 9;
    for (let k = 1; k < n; k++) {
      const u = k / n;
      const px = lerp(x1, x2, u);
      const py = (1 - u) * (1 - u) * y1 + 2 * u * (1 - u) * (ym * 2 - y1) + u * u * y1;
      ctx.fillStyle = color(PUERTAS[(k + o.semilla) % PUERTAS.length], o.z);
      ctx.beginPath(); ctx.moveTo(px - s * 0.28, py); ctx.lineTo(px + s * 0.28, py); ctx.lineTo(px, py + s * 0.6); ctx.fill();
    }
  }

  // Dientín visto por detrás, en su cepillo con ruedas
  function chiqui(c) {
    if (c.z - cam.z < CERCA || c.z > CARA.z - 0.3) return;
    const x = X(c.x, c.z);
    const b = Y(c.y, c.z);
    const s = S(1, c.z);
    ctx.save();
    ctx.translate(x, b);
    ctx.rotate(c.inclina);
    ctx.fillStyle = 'rgba(38,48,79,.14)';
    ctx.beginPath(); ctx.ellipse(0, s * 0.05, s * 0.9, s * 0.12, 0, 0, 7); ctx.fill();
    // La enfermera de espaldas: cuadros del video de patinaje en bucle de ida y vuelta (o la foto fija mientras carga).
    // Va antes que la tabla para que la tabla tape las suelas.
    if (patina.complete && patina.naturalWidth) {
      const vuelta = PATINA.n * 2 - 2;
      let i = Math.floor((performance.now() / 1000) * PATINA.fps) % vuelta;
      if (i >= PATINA.n) i = vuelta - i;
      const alto = s * 1.8;
      const ancho = (alto * PATINA.w) / PATINA.h;
      ctx.drawImage(patina, (i % PATINA.col) * PATINA.w, Math.floor(i / PATINA.col) * PATINA.h, PATINA.w, PATINA.h, -ancho / 2, -s * 0.2 - alto, ancho, alto);
    } else if (espalda.complete && espalda.naturalWidth) {
      const alto = s * 1.7;
      const ancho = (alto * espalda.naturalWidth) / espalda.naturalHeight;
      ctx.drawImage(espalda, -ancho / 2, -s * 0.3 - alto, ancho, alto);
    }
    ctx.fillStyle = '#E9735F';
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * s * 0.62, -s * 0.18, s * 0.12, s * 0.2, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#4A9FE0';
    ctx.beginPath(); ctx.roundRect(-s * 0.6, -s * 0.36, s * 1.2, s * 0.2, s * 0.1); ctx.fill();
    ctx.restore();
  }

  /** Dibuja la escena para el progreso p (0–1). extra: { intro, mx, my } */
  function dibujar(p, extra) {
    camara(p, extra);
    fondo(p);
    // La enfermera entra en la caries, el diente se repara y brilla (el destello grande lo hace la página).
    cara(smooth(0.74, 0.81, p), span(0.78, 0.9, p));
    suelo();
    // Chiqui va delante de la cámara; al final vuela hacia el hueco.
    const vuela = smooth(0.58, 0.74, p);
    const curva = (q) => Math.sin(q * 13 + Math.PI / 2) * 2.1; // arranca por el carril derecho, sin tapar «Baja para entrar»
    const c = {
      z: lerp(cam.z + 7, CARA.z + 1, vuela),
      x: lerp(curva(p), HUECO.x, vuela),
      y: lerp(0, HUECO.y - 0.5, vuela),
      inclina: clamp((curva(p + 0.01) - curva(p)) * -3, -0.3, 0.3) * (1 - vuela),
    };
    let chiquiListo = false;
    for (const o of mundo.objetos) {
      if (!chiquiListo && o.z < c.z) { chiqui(c); chiquiListo = true; }
      if (o.z + (o.d || 0) < cam.z + CERCA) continue;
      if (o.tipo === 'casa' || o.tipo === 'torre') casa(o);
      else if (o.tipo === 'manzano' || o.tipo === 'zanahoria') arbol(o);
      else if (o.tipo === 'poste') poste(o);
      else if (o.tipo === 'cruce') cruce(o);
    }
    if (!chiquiListo) chiqui(c);
    return salida.hueco;
  }

  return { dibujar };
}
