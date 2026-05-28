const canvas = document.getElementById('confetti-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let animationId = null;

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

if (canvas) {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 8 + 4;
    this.speedY = Math.random() * 3 + 2;
    this.speedX = (Math.random() - 0.5) * 4;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
    this.opacity = 1;
    this.color = ['#ffd700', '#00e5ff', '#7c4dff', '#ff4757', '#2ed573', '#ff6b81', '#70a1ff'][
      Math.floor(Math.random() * 7)
    ];
    this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
    this.speedY += 0.05;
    this.opacity -= 0.005;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.fillStyle = this.color;
    if (this.shape === 'rect') {
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function launchConfetti(duration = 3000) {
  if (!canvas || !ctx) return;
  const startTime = Date.now();
  const spawnInterval = setInterval(() => {
    for (let i = 0; i < 8; i++) {
      particles.push(new Particle());
    }
    if (Date.now() - startTime > duration) clearInterval(spawnInterval);
  }, 50);

  if (!animationId) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = particles.filter(p => p.opacity > 0 && p.y < canvas.height + 20);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  if (particles.length > 0) {
    animationId = requestAnimationFrame(animateConfetti);
  } else {
    animationId = null;
  }
}
