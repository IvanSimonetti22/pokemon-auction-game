import React, { useState, useRef } from 'react';
import { useCopyIp } from '../hooks/useCopyIp';
import './Systems.css';

const SystemPanel = ({ title, tag, tagClass, version, icon, accent, children }) => {
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      className={`systems-panel ${accent === 'purple' ? 'panel-purple' : accent === 'aqua' ? 'panel-aqua' : 'panel-gold'}`}
      onMouseMove={handleMouseMove}
      ref={panelRef}
      style={{ 
        '--x': `${pos.x}px`, 
        '--y': `${pos.y}px`, 
        '--panel-accent': accent === 'purple' ? 'var(--accent-purple)' : accent === 'aqua' ? 'var(--accent-aqua)' : 'var(--accent-gold)' 
      }}
    >
      <div className="panel-header">
        <div className="panel-header-left">
          <span className="panel-icon-large">{icon}</span>
          <div>
            <h3>{title}</h3>
            <div className="module-tags-mini">
              <span className="module-tag">{version}</span>
              <span className={`module-tag ${tagClass}`}>{tag}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="panel-body">
        {children}
      </div>
    </div>
  );
};

export const Systems = () => {
  const [showEffects, setShowEffects] = useState(true);
  const { copyToClipboard } = useCopyIp();

  const handleCopyCmd = () => {
    copyToClipboard('/trigger np_menu', 'Comando copiado al portapapeles');
  };

  const spawnParticles = (type, name) => {
    window.dispatchEvent(new CustomEvent('spawn-mouse-particles', { detail: { type, duration: 5000 } }));
    copyToClipboard('', `Equipado: ${name}`); // Usamos el toast de copyIp para notificar
  };

  const EFFECTS_LIST = [
    { name: "🍃 Aventurero", achievement: "Hora de Aventura", type: 'tinted_leaves' },
    { name: "🌸 Dieta", achievement: "Dieta Equilibrada", type: 'heart' },
    { name: "❤️ Cobertura", achievement: "Catálogo Completo", type: 'cherry_leaves' },
    { name: "🔥 Compromiso", achievement: "Serio Compromiso", type: 'soul_fire_flame' },
    { name: "💥 Overkill", achievement: "Sobre-Exagerado", type: 'crit' },
    { name: "✨ Postales", achievement: "Postmortal", type: 'totem_of_undying' },
    { name: "🧟 Furia", achievement: "Doctor Zombi", type: 'happy_villager' },
    { name: "🧪 Cómo llegamos", achievement: "Efectos", type: 'witch' },
    { name: "☁️ Buenas Vistas", achievement: "Cima del mundo", type: 'cloud' },
    { name: "🐚 Hogar", achievement: "Faro Completo", type: 'nautilus' },
  ];

  return (
    <div className="systems-container fade-in">
      
      {/* TARJETA PRINCIPAL: LOGROS */}
      <SystemPanel 
        title="Logros & Visual FX" 
        version="v7.3" 
        tag="ONLINE" 
        tagClass="tag-ok" 
        accent="purple" 
        icon="🏆"
      >
        <p className="sys-desc" style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#aaa' }}>
          Al desbloquear estos logros épicos, podrás equiparte partículas cosméticas que te seguirán a todas partes en el servidor.
        </p>

        <div className="command-terminal" onClick={handleCopyCmd} style={{ cursor: 'pointer' }} title="Click para copiar">
          <span className="command-prompt">{'>'}</span>
          <span className="command-label">COMMAND:</span>
          <code className="command-code">/trigger np_menu</code>
          <span className="command-cursor"></span>
        </div>

        <button 
          className={`btn-cyber-toggle ${showEffects ? 'active' : ''}`} 
          onClick={() => setShowEffects(!showEffects)}
        >
          {showEffects ? '[_OCULTAR BIBLIOTECA_]' : '[_VER BIBLIOTECA DE EFECTOS_]'}
        </button>

        {showEffects && (
          <div className="cyber-list-container">
            {EFFECTS_LIST.map((effect, index) => (
              <div 
                key={index} 
                className="cyber-list-item" 
                onClick={() => spawnParticles(effect.type, effect.name)}
                style={{ cursor: 'pointer' }}
                title="Click para previsualizar partículas"
              >
                <span className="item-name">{effect.name}</span>
                <span className="item-desc">{effect.achievement}</span>
              </div>
            ))}
          </div>
        )}
      </SystemPanel>

      {/* GRID INFERIOR */}
      <div className="systems-grid">
        
        {/* Clima */}
        <SystemPanel 
          title="Clima Atmosférico" 
          version="v1.2" 
          tag="ONLINE" 
          tagClass="tag-ok" 
          accent="aqua" 
          icon="⛈️"
        >
          <ul className="sys-list">
            <li><span className="bullet-icon">☂️</span> <strong>Lluvia:</strong> Mensaje chat + Sonido ambiente.</li>
            <li><span className="bullet-icon">⚡</span> <strong>Tormenta:</strong> Efectos visuales intensos.</li>
          </ul>
        </SystemPanel>

        {/* Bienvenida */}
        <SystemPanel 
          title="NP Bienvenida" 
          version="v1.0" 
          tag="ONLINE" 
          tagClass="tag-ok" 
          accent="gold" 
          icon="✨"
        >
          <ul className="sys-list">
            <li><span className="bullet-icon">📜</span> <strong>Holograma:</strong> Texto flotante en el Spawn.</li>
            <li><span className="bullet-icon">✨</span> <strong>Partículas:</strong> Decoración al ingresar.</li>
          </ul>
        </SystemPanel>

      </div>
    </div>
  );
};