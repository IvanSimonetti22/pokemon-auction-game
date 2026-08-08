import React, { useEffect, useRef } from 'react';
import './MouseParticleOverlay.css';

const BASE_URL = 'https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.4/assets/minecraft/textures/';

const PARTICLE_CONFIGS = {
  tinted_leaves: { url: BASE_URL + 'block/azalea_leaves.png', gravity: 0.05, life: 100, size: [8, 12], drift: 0.5 },
  heart: { url: BASE_URL + 'particle/heart.png', gravity: -0.05, life: 80, size: [16, 24], drift: 0.2 },
  cherry_leaves: { url: BASE_URL + 'particle/cherry_0.png', gravity: 0.03, life: 120, size: [12, 16], drift: 0.8 },
  soul_fire_flame: { url: BASE_URL + 'particle/soul_fire_flame.png', gravity: -0.1, life: 60, size: [12, 18], drift: 0.1, shrink: true },
  crit: { url: BASE_URL + 'particle/critical_hit.png', gravity: 0.1, life: 40, size: [12, 16], velocityRange: [-3, 3] },
  totem_of_undying: { url: BASE_URL + 'item/totem_of_undying.png', gravity: -0.02, life: 90, size: [20, 28], drift: 0.3 },
  happy_villager: { url: BASE_URL + 'particle/glint.png', tint: '#55ff55', gravity: -0.05, life: 70, size: [16, 24], drift: 0.2 },
  witch: { url: BASE_URL + 'particle/spell_0.png', tint: '#8a2be2', gravity: 0.05, life: 80, size: [12, 16], drift: 0.5 },
  cloud: { url: BASE_URL + 'particle/generic_4.png', gravity: -0.02, life: 100, size: [16, 24], shrink: true, drift: 0.2 },
  nautilus: { url: BASE_URL + 'particle/nautilus.png', gravity: -0.05, life: 80, size: [12, 16], drift: 0.2 }
};

export const MouseParticleOverlay = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -100, y: -100, isActive: false, type: null });
  const timerRef = useRef(null);
  const imagesRef = useRef({});

  useEffect(() => {
    // Preload images
    Object.entries(PARTICLE_CONFIGS).forEach(([type, config]) => {
      if (config.url && !imagesRef.current[type]) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = config.url;
        
        if (config.tint) {
          img.onload = () => {
            // Create a tinted version using an offscreen canvas
            const off = document.createElement('canvas');
            off.width = img.width;
            off.height = img.height;
            const octx = off.getContext('2d');
            octx.drawImage(img, 0, 0);
            octx.globalCompositeOperation = 'source-in';
            octx.fillStyle = config.tint;
            octx.fillRect(0, 0, off.width, off.height);
            imagesRef.current[type] = off; // Store the tinted canvas
          };
        } else {
          imagesRef.current[type] = img;
        }
      }
    });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleSpawnEvent = (e) => {
      const { type, duration = 5000 } = e.detail;
      mouseRef.current.type = type;
      mouseRef.current.isActive = true;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        mouseRef.current.isActive = false;
        mouseRef.current.type = null;
      }, duration);
    };
    window.addEventListener('spawn-mouse-particles', handleSpawnEvent);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new particles if active
      if (mouseRef.current.isActive && mouseRef.current.type) {
        const config = PARTICLE_CONFIGS[mouseRef.current.type];
        if (config && Math.random() > 0.3) {
          const size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
          const vx = config.velocityRange ? config.velocityRange[0] + Math.random() * (config.velocityRange[1] - config.velocityRange[0]) : (Math.random() - 0.5) * (config.drift || 1);
          const vy = config.velocityRange ? config.velocityRange[0] + Math.random() * (config.velocityRange[1] - config.velocityRange[0]) : (Math.random() - 0.5) * (config.drift || 1);
          
          particlesRef.current.push({
            x: mouseRef.current.x,
            y: mouseRef.current.y,
            vx,
            vy,
            life: config.life,
            maxLife: config.life,
            size,
            originalSize: size,
            type: mouseRef.current.type,
            config
          });
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.config.gravity || 0;

        if (p.config.shrink) {
          p.size = Math.max(0, p.originalSize * (p.life / p.maxLife));
        }

        ctx.globalAlpha = p.life / p.maxLife;
        
        const img = imagesRef.current[p.type];
        if (img && (img.complete || img.width > 0)) {
          // Draw the image centered at (p.x, p.y)
          ctx.drawImage(img, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
      });
      
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('spawn-mouse-particles', handleSpawnEvent);
      cancelAnimationFrame(animationFrameId);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="mouse-particle-overlay" />;
};
