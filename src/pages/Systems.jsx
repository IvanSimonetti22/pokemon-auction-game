// 📂 src/pages/Systems.jsx
import { useState } from 'react';
import './Systems.css';

export const Systems = () => {
  const [showEffects, setShowEffects] = useState(false);

  const EFFECTS_LIST = [
    { name: "🍃 Aventurero", achievement: "Hora de Aventura" },
    { name: "🌸 Dieta", achievement: "Dieta Equilibrada" },
    { name: "❤️ Cobertura", achievement: "Catálogo Completo" },
    { name: "🔥 Compromiso", achievement: "Serio Compromiso" },
    { name: "💥 Overkill", achievement: "Sobre-Exagerado" },
    { name: "✨ Postales", achievement: "Postmortal" },
    { name: "🧟 Furia", achievement: "Doctor Zombi" },
    { name: "🧪 Cómo llegamos", achievement: "Efectos" },
    { name: "☁️ Buenas Vistas", achievement: "Cima del mundo" },
    { name: "🐚 Hogar", achievement: "Faro Completo" },
  ];

  return (
    <div className="systems-container fade-in">
      
      {/* TARJETA PRINCIPAL: LOGROS (Púrpura) */}
      <div className="card type-purple">
        <div className="module-header">
          <h3>
            {/* Icono SVG de Copa/Trofeo */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'10px'}}>
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
            Logros & Visual FX
          </h3>
          <div className="module-tags">
            <span className="module-tag">v7.3</span>
            <span className="module-tag tag-ok">ONLINE</span>
          </div>
        </div>

        <div className="command-snippet">
          <span className="command-label">
            🟡 COMANDO PRINCIPAL:
          </span>
          <code className="command-code">/trigger np_menu</code>
        </div>

        {/* Botón Toggle Estilo Cyberpunk */}
        <button 
          className={`btn-toggle ${showEffects ? 'active' : ''}`} 
          onClick={() => setShowEffects(!showEffects)}
        >
          {showEffects ? '📂 Ocultar Biblioteca' : '📂 VER BIBLIOTECA DE EFECTOS'}
        </button>

        {/* Lista Desplegable */}
        {showEffects && (
          <div className="list-container show">
            {EFFECTS_LIST.map((effect, index) => (
              <div key={index} className="list-item">
                <span className="item-name">{effect.name}</span>
                <span className="item-desc">{effect.achievement}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GRID INFERIOR */}
      <div className="systems-grid">
        
        {/* Clima (Aqua) */}
        <div className="card type-aqua">
          <div className="module-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'10px'}}>
                <path d="M17.5 19c0-1.7-1.3-3-3-3h-11c-1.7 0-3 1.3-3 3"></path>
                <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path>
                <path d="M13 19v2"></path>
                <path d="M9 19v2"></path>
                <path d="M5 19v2"></path>
              </svg>
              Clima Atmosférico
            </h3>
            <div className="module-tags">
               <span className="module-tag">v1.2</span>
               <span className="module-tag tag-ok">ONLINE</span>
            </div>
          </div>
          <ul className="sys-list">
            <li>☂️ <strong>Lluvia:</strong> Mensaje chat + Sonido ambiente.</li>
            <li>⚡ <strong>Tormenta:</strong> Efectos visuales intensos.</li>
          </ul>
        </div>

        {/* Bienvenida (Gold) */}
        <div className="card type-gold">
          <div className="module-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:'10px'}}>
                 <path d="M18 6L7 17l-5-5"></path>
                 <path d="M22 10v1"></path>
                 <path d="M22 6v1"></path>
              </svg>
              NP Bienvenida
            </h3>
            <div className="module-tags">
               <span className="module-tag">v1.0</span>
               <span className="module-tag tag-ok">ONLINE</span>
            </div>
          </div>
          <ul className="sys-list">
            <li>📜 <strong>Holograma:</strong> Texto flotante en el Spawn.</li>
            <li>✨ <strong>Partículas:</strong> Decoración al ingresar.</li>
          </ul>
        </div>

      </div>
    </div>
  );
};