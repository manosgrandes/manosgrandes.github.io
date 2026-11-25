// Fondo vivo del login: dientes, estrellas, corazones y destellos que flotan despacio, sueltos.

const PASTELES = ['#75BDF2', '#F2B4CC', '#91D9B5', '#FFD98A', '#FFA995', '#B8A5ED'];
const FORMAS = ['diente', 'diente', 'estrella', 'corazon', 'punto', 'punto', 'punto', 'destello'];

function diente(c, s) {
  c.beginPath();
  c.moveTo(-s * .5, -s * .35);
  c.bezierCurveTo(-s * .55, -s * .7, -s * .15, -s * .72, 0, -s * .55);
  c.bezierCurveTo(s * .15, -s * .72, s * .55, -s * .7, s * .5, -s * .35);
  c.bezierCurveTo(s * .48, 0, s * .38, s * .2, s * .3, s * .6);
  c.bezierCurveTo(s * .22, s * .78, s * .08, s * .7, s * .05, s * .35);
  c.quadraticCurveTo(0, s * .22, -s * .05, s * .35);
  c.bezierCurveTo(-s * .08, s * .7, -s * .22, s * .78, -s * .3, s * .6);
  c.bezierCurveTo(-s * .38, s * .2, -s * .48, 0, -s * .5, -s * .35);
  c.closePath();
}
function estrella(c, s) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? s * .22 : s * .55;
    const a = -Math.PI / 2 + i * Math.PI / 5;
    c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  c.closePath();
}
function corazon(c, s) {
  c.beginPath();
  c.moveTo(0, s * .45);
  c.bezierCurveTo(-s * .7, 0, -s * .45, -s * .6, 0, -s * .25);
  c.bezierCurveTo(s * .45, -s * .6, s * .7, 0, 0, s * .45);
  c.closePath();
}
function destello(c, s) {
  c.beginPath();
  c.moveTo(0, -s * .55); c.quadraticCurveTo(s * .08, -s * .08, s * .55, 0);
  c.quadraticCurveTo(s * .08, s * .08, 0, s * .55); c.quadraticCurveTo(-s * .08, s * .08, -s * .55, 0);
  c.quadraticCurveTo(-s * .08, -s * .08, 0, -s * .55);
  c.closePath();
}

/** Arranca la animación en `lienzo`. `oscuro()` dice si está el modo oscuro. Devuelve la función que la detiene. */
export function iniciarFondo(lienzo, { oscuro = () => false } = {}) {
  const c = lienzo.getContext('2d');
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ancho = 0, alto = 0, nodos = [], cuadro = 0, vivo = true, t0 = performance.now();

  const crear = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = lienzo.getBoundingClientRect();
    ancho = r.width; alto = r.height;
    lienzo.width = Math.round(ancho * dpr); lienzo.height = Math.round(alto * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cantidad = Math.round(Math.min(60, Math.max(24, (ancho * alto) / 14000)));
    nodos = Array.from({ length: cantidad }, () => {
      const forma = FORMAS[Math.floor(Math.random() * FORMAS.length)];
      return {
        x: Math.random() * ancho, y: Math.random() * alto,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25,
        forma, color: PASTELES[Math.floor(Math.random() * PASTELES.length)],
        s: forma === 'punto' ? 3 + Math.random() * 3 : 12 + Math.random() * 12,
        giro: Math.random() * Math.PI * 2, vg: (Math.random() - .5) * .004,
        fase: Math.random() * Math.PI * 2,
      };
    });
  };

  const dibujar = (t) => {
    const os = oscuro();
    c.clearRect(0, 0, ancho, alto);
    // nodos
    for (const n of nodos) {
      const brillo = .75 + Math.sin(t / 900 + n.fase) * .25;
      c.save();
      c.translate(n.x, n.y); c.rotate(n.giro);
      c.globalAlpha = (os ? .75 : .9) * brillo;
      c.fillStyle = n.color;
      c.shadowColor = n.color; c.shadowBlur = os ? 14 : 8;
      if (n.forma === 'punto') { c.beginPath(); c.arc(0, 0, n.s, 0, Math.PI * 2); c.fill(); }
      else {
        ({ diente, estrella, corazon, destello })[n.forma](c, n.s);
        c.fill();
        if (n.forma === 'diente') { c.shadowBlur = 0; c.globalAlpha *= .9; c.fillStyle = '#fff'; diente(c, n.s * .62); c.fill(); }
      }
      c.restore();
    }
  };

  const mover = (dt) => {
    for (const n of nodos) {
      n.x += n.vx * dt; n.y += n.vy * dt; n.giro += n.vg * dt;
      if (n.x < -30) n.x = ancho + 30; if (n.x > ancho + 30) n.x = -30;
      if (n.y < -30) n.y = alto + 30; if (n.y > alto + 30) n.y = -30;
    }
  };

  const paso = (t) => {
    if (!vivo) return;
    const dt = Math.min(50, t - t0) / 16; t0 = t;
    if (!document.hidden) { mover(dt); dibujar(t); }
    cuadro = requestAnimationFrame(paso);
  };

  const alCambiarTam = () => { crear(); dibujar(performance.now()); };
  const ro = new ResizeObserver(alCambiarTam);
  ro.observe(lienzo);
  crear();
  if (quieto) dibujar(0);
  else cuadro = requestAnimationFrame(paso);

  return () => { vivo = false; cancelAnimationFrame(cuadro); ro.disconnect(); };
}
