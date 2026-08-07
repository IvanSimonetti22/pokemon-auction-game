import React, { useEffect, useRef } from 'react';

export default function NodeNetworkBg({
  nodeColor = '85, 255, 255', // Cyan puro
  lineColor = '85, 255, 255',
  nodeCount = 100, // Buena densidad de nodos
  connectionDistance = 160,
  mouseInteraction = true
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let nodes = [];
    
    // El mouse empieza fuera del canvas
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    if (mouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseout', handleMouseLeave);
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Node {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        // Velocidad de flotación muy suave y elegante
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.baseRadius = Math.random() * 1.5 + 1;
        // Pulsación para que tintineen (evolución viva)
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Rebote suave en los bordes
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        
        // Interacción fluida con el mouse (los nodos se alejan un poco o se atraen sutilmente)
        if (mouseInteraction) {
           const dx = mouse.x - this.x;
           const dy = mouse.y - this.y;
           const dist = Math.sqrt(dx*dx + dy*dy);
           if (dist < 200) {
              // Paralaje repulsivo súper suave
              this.x -= dx * 0.005;
              this.y -= dy * 0.005;
           }
        }

        this.pulsePhase += this.pulseSpeed;
      }
      
      draw() {
        // Calcular radio pulsante
        const currentRadius = this.baseRadius + Math.sin(this.pulsePhase) * 0.5;
        const alpha = 0.4 + Math.sin(this.pulsePhase) * 0.4;

        ctx.beginPath();
        ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nodeColor}, ${alpha})`;
        
        // Glow en los nodos
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${nodeColor}, ${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    // Inicializar nodos
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update nodes
      nodes.forEach(node => node.update());
      
      // Conectar nodos entre sí
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            // La opacidad de la línea depende de qué tan cerca estén (fade in/out natural)
            const opacity = 1 - (dist / connectionDistance);
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        
        // Conectar nodos al mouse (forma el "Nodo Principal")
        if (mouseInteraction) {
          const dmx = nodes[i].x - mouse.x;
          const dmy = nodes[i].y - mouse.y;
          const distMouse = Math.sqrt(dmx*dmx + dmy*dmy);
          
          if (distMouse < connectionDistance + 80) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            const opacity = 1 - (distMouse / (connectionDistance + 80));
            // Las líneas al mouse son más brillantes y gruesas
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity * 0.5})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
        
        nodes[i].draw();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (mouseInteraction) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseout', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodeColor, lineColor, nodeCount, connectionDistance, mouseInteraction]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'transparent',
        zIndex: 0,
        pointerEvents: 'none' // Para que los clics pasen a las tarjetas
      }}
    />
  );
}
