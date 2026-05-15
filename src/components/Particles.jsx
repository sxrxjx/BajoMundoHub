import { useEffect, useRef } from 'react';

function Particles({ mode = 'float', color = 'rgba(255, 59, 48, 0.5)' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        if (mode === 'burst') {
          this.x = canvas.width / 2;
          this.y = canvas.height / 3.5;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2 + 0.5;
          this.speedX = Math.cos(angle) * speed;
          this.speedY = Math.sin(angle) * speed;
        } else {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.speedX = Math.random() * 1 - 0.5;
          this.speedY = Math.random() * 1 - 0.5;
        }
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.life = 0;
        this.maxLife = Math.random() * 100 + 50;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;

        if (mode === 'burst') {
          this.opacity -= 0.005;
          if (this.life > this.maxLife || this.opacity <= 0) {
            this.reset();
          }
        } else {
          if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
          }
        }
      }

      draw() {
        ctx.fillStyle = color.replace('0.5', this.opacity.toString());
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const count = mode === 'burst' ? 30 : 50;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, color]);

  return (
    <canvas 
      ref={canvasRef} 
      className="particles-canvas" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: 0 
      }}
    />
  );
}

export default Particles;
