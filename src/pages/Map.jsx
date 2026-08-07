import React, { useRef, useState } from 'react';
import './Map.css';

export const Map = () => {
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="map-page fade-in">
      
      <div className="terminal-header" style={{ marginBottom: '24px' }}>
        <h2><span className="blink">_</span>ORBITAL_LINK: NO_SIGNAL</h2>
        <p>Intentando establecer conexión con el satélite cartográfico...</p>
      </div>

      <div 
        className="map-glitch-panel"
        onMouseMove={handleMouseMove}
        ref={panelRef}
        style={{ 
          '--x': `${pos.x}px`, 
          '--y': `${pos.y}px`
        }}
      >
        <div className="glitch-screen">
          <div className="noise-overlay"></div>
          <div className="scanlines"></div>
          
          <div className="glitch-content">
            <div className="error-code">ERR_CONNECTION_REFUSED</div>
            <div className="error-title glitch" data-text="SEÑAL PERDIDA">SEÑAL PERDIDA</div>
            <p className="error-desc">El satélite cartográfico se encuentra actualmente en mantenimiento de órbita. Los mapas 3D volverán a estar operativos pronto.</p>
            
            <div className="reconnect-anim">
              <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span> REINTENTANDO <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
