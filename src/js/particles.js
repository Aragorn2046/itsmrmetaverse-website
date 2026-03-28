/* ============================================
   Particles — Subtle ambient floating particles
   ============================================ */

export function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-particles';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '0',
    opacity: '0.4',
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let w, h;
  const particles = [];
  const COUNT = Math.min(40, Math.floor(window.innerWidth / 30));
  const SPEED = 0.15;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * SPEED,
      dy: (Math.random() - 0.5) * SPEED - 0.05,
      alpha: Math.random() * 0.4 + 0.1,
    };
  }

  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;

      // Wrap around edges
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
      if (p.y < -5) p.y = h + 5;
      if (p.y > h + 5) p.y = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 208, ${p.alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  init();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 200);
  });
}
