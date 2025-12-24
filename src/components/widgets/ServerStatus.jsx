// 📂 src/components/widgets/ServerStatus.jsx
import { useState, useEffect } from 'react';
import './ServerStatus.css';

export const ServerStatus = () => {
  const [status, setStatus] = useState('loading');
  const [players, setPlayers] = useState({ online: 0, max: 0 });
  const [motd, setMotd] = useState('');

  // Tu dirección IP
  const SERVER_ADDRESS = "nodopersistente.duckdns.org:27849";

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`);
        const data = await response.json();

        if (data.online) {
          setStatus('online');
          setPlayers({ online: data.players.online, max: data.players.max });
          const cleanMotd = data.motd && data.motd.clean ? data.motd.clean.join(' ') : "Servidor Activo";
          setMotd(cleanMotd);
        } else {
          setStatus('offline');
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        setStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`hero-status ${status}`}>
      <div className="hero-icon">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
      </div>

      <div className="hero-info">
        <h2>
          {/* Textos dinámicos */}
          {status === 'loading' && "Conectando satélite..."}
          {status === 'online' && "Sistema Operativo"}
          
          {/* 🔥 AQUÍ EL CAMBIO QUE PEDISTE */}
          {status === 'offline' && "OFFLINE"}
        </h2>
        <p>
          {status === 'loading' && "Esperando telemetría..."}
          {status === 'online' && `Jugadores: ${players.online} / ${players.max} • ${motd}`}
          
          {/* 🔥 MENSAJE MÁS LIMPIO */}
          {status === 'offline' && "El servidor se encuentra apagado o en mantenimiento."}
        </p>
      </div>

      <div className={`status-badge-live ${status}`}>
        <div className="pulse-dot"></div>
        <span>{status === 'online' ? 'ONLINE' : 'OFFLINE'}</span>
      </div>
    </div>
  );
};