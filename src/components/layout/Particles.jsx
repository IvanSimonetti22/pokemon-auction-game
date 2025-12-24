// 📂 src/components/layout/Particles.jsx
import { useEffect, useRef } from 'react';

const THEME_CONFIG = {
  overworld: { 
    color: '85, 255, 85', 
    speed: 0.3, 
    count: 50, 
    direction: 'float', 
    glow: 15,
    hasFlash: false
  },
  nether: { 
    color: '255, 120, 0', 
    speed: 1.0, 
    count: 70, 
    direction: 'up', 
    glow: 20,
    hasFlash: false
  },
  end: { 
    color: '180, 60, 255', 
    speed: 0.2, 
    count: 45, 
    direction: 'static', 
    glow: 25,
    hasFlash: true 
  }
};

export const Particles = ({ theme = 'overworld' }) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const currentConfig = THEME_CONFIG[theme] || THEME_CONFIG.overworld;

  // Estado mutable para el efecto flash
  const flashState = useRef({ intensity: 0, cooldown: 0 });

  useEffect(() => {
    // Configurar audio con manejo de errores
    audioRef.current = new Audio('/music/end_flash.mp3'); 
    audioRef.current.volume = 0.4;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      constructor() { this.reset(true); }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        if (initial) {
          this.y = Math.random() * canvas.height;
        } else if (currentConfig.direction === 'up') {
          this.y = canvas.height + 20; 
        } else {
          this.y = Math.random() * canvas.height;
        }

        this.vx = (Math.random() - 0.5) * currentConfig.speed;
        this.vy = (Math.random() - 0.5) * currentConfig.speed;

        if (currentConfig.direction === 'up') {
          this.vy = -Math.random() * currentConfig.speed - 0.3; 
          this.vx = (Math.random() - 0.5) * 0.3; 
        }

        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
        this.fadingOut = Math.random() > 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.fadingOut) {
          this.alpha -= this.fadeSpeed;
          if (this.alpha <= 0.1) { 
            this.fadingOut = false;
            if (currentConfig.direction === 'static' && Math.random() > 0.9) this.reset();
          }
        } else {
          this.alpha += this.fadeSpeed;
          if (this.alpha >= 0.7) this.fadingOut = true;
        }

        if (this.x < -50 || this.x > canvas.width + 50 || this.y < -50 || this.y > canvas.height + 50) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${currentConfig.color}, ${this.alpha})`;
        ctx.shadowBlur = currentConfig.glow; 
        ctx.shadowColor = `rgba(${currentConfig.color}, ${this.alpha})`;
        ctx.fill();
        ctx.restore();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < currentConfig.count; i++) {
        particles.push(new Particle());
      }
    };

    const handleEndFlash = () => {
      if (!currentConfig.hasFlash) return;

      if (flashState.current.cooldown <= 0 && Math.random() < 0.0005) {
        flashState.current.intensity = 1.0;
        flashState.current.cooldown = 800;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      if (flashState.current.intensity > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const grad = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 0, 
            canvas.width/2, canvas.height/2, canvas.width
        );
        const opacity = flashState.current.intensity * 0.35;
        grad.addColorStop(0, `rgba(220, 180, 255, ${opacity})`);
        grad.addColorStop(0.4, `rgba(140, 0, 255, ${opacity * 0.5})`);
        grad.addColorStop(1, `rgba(0, 0, 0, 0)`);
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        flashState.current.intensity -= 0.0016; 
      }
      if (flashState.current.cooldown > 0) flashState.current.cooldown--;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      handleEndFlash();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [theme]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 0, // Fondo base, debajo del contenido (que tiene z-index: 1)
        pointerEvents: 'none',
        background: '#0a0a0a' 
      }}
    />
  );
};