

/* ── FOTOS DO VISOR ──────────────────────────────────────── */

const PHOTOS = [
  'assets/media/perfil1.png',
  'assets/media/foto-lanternas.jpg',
  'assets/media/perfil2.png'
];

const photoEls = [
  document.getElementById('photo0'),
  document.getElementById('photo1'),
  document.getElementById('photo2')
];

// Define os backgrounds
photoEls.forEach((el, i) => {
  if (el) el.style.backgroundImage = "url('" + PHOTOS[i] + "')";
});

// Crossfade a cada 4 segundos
let currentPhoto = 0;
setInterval(() => {
  photoEls[currentPhoto].classList.remove('active');
  currentPhoto = (currentPhoto + 1) % photoEls.length;
  photoEls[currentPhoto].classList.add('active');
}, 4000);


/* ── TIMECODE ────────────────────────────────────────────── */
let frames = 0;
setInterval(() => {
  frames++;
  const f = frames % 30;
  const s = Math.floor(frames / 30) % 60;
  const m = Math.floor(frames / 1800) % 60;
  const h = Math.floor(frames / 108000);
  const pad = n => String(n).padStart(2, '0');
  const el = document.getElementById('timecode');
  if (el) el.textContent = pad(h) + ':' + pad(m) + ':' + pad(s) + ':' + pad(f);
}, 1000 / 30);


/* ── RAIOS ELÉTRICOS (canvas) ────────────────────────────── */
const canvas   = document.getElementById('boltCanvas');
const ctx      = canvas ? canvas.getContext('2d') : null;
const heroWrap = document.getElementById('heroWrap');

if (canvas && ctx && heroWrap) {
  function resizeCanvas() {
    canvas.width  = heroWrap.offsetWidth;
    canvas.height = heroWrap.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function getTitleBounds() {
    const title = document.getElementById('heroTitle');
    const wRect = heroWrap.getBoundingClientRect();
    const tRect = title.getBoundingClientRect();
    return {
      x: tRect.left - wRect.left,
      y: tRect.top  - wRect.top,
      w: tRect.width,
      h: tRect.height
    };
  }

  function generateBolt(b) {
    const { x, y, w, h } = b;
    const pts = [];
    const steps = 18 + Math.floor(Math.random() * 14);
    let cx = x + Math.random() * w * 0.2;
    let cy = y + Math.random() * h;
    pts.push({ x: cx, y: cy });
    for (let i = 1; i <= steps; i++) {
      cx += (w / steps) * (0.6 + Math.random() * 0.8);
      cy += (Math.random() - 0.5) * h * 0.7;
      cy  = Math.max(y + 2, Math.min(y + h - 2, cy));
      cx  = Math.min(x + w, cx);
      pts.push({ x: cx, y: cy });
    }
    return pts;
  }

  class Bolt {
    constructor() { this.reset(); }
    reset() {
      this.bounds   = getTitleBounds();
      this.points   = generateBolt(this.bounds);
      this.progress = 0;
      this.speed    = 0.025 + Math.random() * 0.03;
      this.tail     = 0.22;
      this.done     = false;
    }
    draw() {
      if (this.done) return;
      const total = this.points.length - 1;
      const head  = this.progress;
      const tail  = Math.max(0, head - this.tail);
      const hi    = Math.floor(head * total);
      const ti    = Math.floor(tail * total);
      if (hi <= ti) { this.progress += this.speed; return; }
      const vis = this.points.slice(ti, hi + 1);
      if (vis.length < 2) { this.progress += this.speed; return; }
      for (let i = 0; i < vis.length - 1; i++) {
        const a = Math.sin((i / (vis.length - 1)) * Math.PI);
        ctx.beginPath();
        ctx.moveTo(vis[i].x, vis[i].y);
        ctx.lineTo(vis[i+1].x, vis[i+1].y);
        ctx.strokeStyle = 'rgba(255,255,200,' + (a * 0.9) + ')';
        ctx.lineWidth   = 1.2;
        ctx.shadowColor = '#ffa800';
        ctx.shadowBlur  = 10;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,180,20,' + (a * 0.4) + ')';
        ctx.lineWidth   = 3;
        ctx.shadowBlur  = 18;
        ctx.stroke();
      }
      const tip = vis[vis.length - 1];
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 2, 0, Math.PI * 2);
      ctx.fillStyle  = 'rgba(255,255,255,0.95)';
      ctx.shadowColor = '#ffe566';
      ctx.shadowBlur  = 16;
      ctx.fill();
      this.progress += this.speed;
      if (this.progress > 1.1) this.done = true;
    }
  }

  const bolts = [];
  let frame = 0, nextSpawn = 20;

  function animateBolts() {
    requestAnimationFrame(animateBolts);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (++frame >= nextSpawn) {
      bolts.push(new Bolt());
      for (let i = bolts.length - 1; i >= 0; i--) {
        if (bolts[i].done) bolts.splice(i, 1);
      }
      nextSpawn = 15 + Math.floor(Math.random() * 45);
      frame = 0;
    }
    bolts.forEach(b => b.draw());
  }

  document.fonts.ready.then(() => setTimeout(animateBolts, 100));
}

/* ── SCROLL SUAVE COM OFFSET DO MENU ── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    const menuHeight = document.querySelector('.menu').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - menuHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
// força recalculo do masonry após carregar todas as imagens
window.addEventListener('load', () => {
  const masonry = document.getElementById('masonry');
  masonry.style.display = 'none';
  masonry.offsetHeight; // reflow
  masonry.style.display = '';
});
