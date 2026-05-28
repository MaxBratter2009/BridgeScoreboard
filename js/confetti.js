let activeCanvas = null;
let activeCtx = null;
let particles = [];
let animationId = null;

function setupCanvas(canvasEl) {
  if (!canvasEl) return;
  activeCanvas = canvasEl;
  activeCtx = canvasEl.getContext('2d');
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
}

setupCanvas(document.getElementById('confetti-canvas'));

window.addEventListener('resize', () => {
  document.querySelectorAll('canvas').forEach(c => {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  });
});

class Particle {
  constructor(intense) {
    this.x = Math.random() * activeCanvas.width;
    this.y = intense ? activeCanvas.height + 10 : -10;
    this.size = Math.random() * (intense ? 10 : 8) + 4;
    this.speedY = intense ? -(Math.random() * 12 + 6) : Math.random() * 3 + 2;
    this.speedX = (Math.random() - 0.5) * (intense ? 8 : 4);
    this.gravity = intense ? 0.15 : 0.05;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 12;
    this.opacity = 1;
    this.fadeRate = intense ? 0.003 : 0.005;
    this.color = ['#ffd700', '#00e5ff', '#7c4dff', '#ff4757', '#2ed573', '#ff6b81', '#70a1ff', '#ff9f43', '#f368e0'][
      Math.floor(Math.random() * 9)
    ];
    this.shape = ['rect', 'circle', 'star'][Math.floor(Math.random() * 3)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.speedY += this.gravity;
    this.rotation += this.rotationSpeed;
    this.opacity -= this.fadeRate;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.fillStyle = this.color;
    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    } else if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      drawStar(ctx, 0, 0, 5, this.size / 2, this.size / 4);
    }
    ctx.restore();
  }
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.closePath();
  ctx.fill();
}

function launchConfetti(duration = 3000, canvasId) {
  const canvas = canvasId ? document.getElementById(canvasId) : document.getElementById('confetti-canvas');
  if (!canvas) return;
  setupCanvas(canvas);
  const ctx = canvas.getContext('2d');

  const startTime = Date.now();
  const spawnInterval = setInterval(() => {
    for (let i = 0; i < 10; i++) {
      particles.push(new Particle(false));
    }
    if (Date.now() - startTime > duration) clearInterval(spawnInterval);
  }, 40);

  if (!animationId) animateConfetti(ctx, canvas);
}

function launchFireworks(duration = 5000, canvasId) {
  const canvas = canvasId ? document.getElementById(canvasId) : document.getElementById('confetti-canvas');
  if (!canvas) return;
  setupCanvas(canvas);
  const ctx = canvas.getContext('2d');

  const startTime = Date.now();
  const spawnInterval = setInterval(() => {
    for (let i = 0; i < 20; i++) {
      particles.push(new Particle(true));
    }
    if (Date.now() - startTime > duration) clearInterval(spawnInterval);
  }, 60);

  if (!animationId) animateConfetti(ctx, canvas);
}

function animateConfetti(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 50 && p.y > -50);
  particles.forEach(p => {
    p.update();
    p.draw(ctx);
  });
  if (particles.length > 0) {
    animationId = requestAnimationFrame(() => animateConfetti(ctx, canvas));
  } else {
    animationId = null;
  }
}
