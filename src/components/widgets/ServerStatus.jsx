import { useState, useEffect, useRef } from 'react';
import './ServerStatus.css';

export const ServerStatus = () => {
  const [players, setPlayers] = useState(null);
  const SERVER_ADDRESS = "nodo-persistente.baires.cloud";
  
  const statusRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!statusRef.current) return;
    const rect = statusRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`);
        const data = await res.json();
        if (data.online && data.players) {
          setPlayers({ online: data.players.online, max: data.players.max });
        }
      } catch {
        // fallo silencioso: el badge sigue verde igual
      }
    };
    check();
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div 
      className="hero-status online"
      onMouseMove={handleMouseMove}
      ref={statusRef}
      style={{ '--x': `${pos.x}px`, '--y': `${pos.y}px` }}
    >
      {/* Scanline decorativa */}
      <div className="hero-scanline" />

      <div className="hero-icon">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
          <line x1="6" y1="6" x2="6.01" y2="6"/>
          <line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
      </div>

      <div className="hero-info">
        <h2>Nodo Persistente</h2>
        <p>
          {players !== null
            ? `${players.online} / ${players.max} jugadores conectados • Fabric 26.2 • Vanilla+`
            : `Infraestructura dedicada • Fabric 26.2 • Vanilla+`
          }
        </p>
        <div className="hero-address">{SERVER_ADDRESS}</div>
      </div>

      <div className="status-badge-live online">
        <div className="pulse-dot" />
        <span>24/7</span>
      </div>
    </div>
  );
};