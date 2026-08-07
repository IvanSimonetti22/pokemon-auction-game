import React, { useRef, useState } from 'react';
import './Mods.css';

const ESSENTIAL_MODS = [
  { name: "AppleSkin",      desc: "Información útil sobre la comida",    icon: "🍎" },
  { name: "ClientSort",     desc: "Ordenamiento automático de inventario",icon: "📦" },
  { name: "Fabric API",     desc: "Base del ecosistema Fabric",          icon: "🧩" },
  { name: "FerriteCore",    desc: "Reducción de uso de RAM",             icon: "🔋" },
  { name: "ImmediatelyFast",desc: "Optimización de renderizado",         icon: "⚡" },
  { name: "Lithium",        desc: "Optimización general del cliente",    icon: "🚀" },
  { name: "MaLiLib",        desc: "Librería base para otros mods",       icon: "📚" },
  { name: "ShulkerBoxTooltip",desc: "Ver interior de shulkers",          icon: "🧰" },
  { name: "Sodium",         desc: "Renderizado ultra-optimizado",        icon: "🧪" },
];

const VISUAL_MODS = [
  { name: "ElytraTrails",   desc: "Estelas al volar con élitros",        icon: "🦋" },
  { name: "Flashback",      desc: "Replay mod y grabación",              icon: "🎥" },
  { name: "Particle Core",  desc: "Librería de partículas",              icon: "✨" },
  { name: "Voxy",           desc: "LOD extremo — horizonte infinito",    icon: "🏔️" },
];

const ModRow = ({ name, desc, icon, accent }) => (
  <div className="mod-row" style={{ '--mod-accent': accent }}>
    <span className="mod-icon">{icon}</span>
    <div className="mod-info">
      <span className="mod-name">{name}</span>
      <span className="mod-desc">{desc}</span>
    </div>
    <div className="mod-dot" />
  </div>
);

const ModPanel = ({ title, subtitle, icon, tag, tagClass, mods, accent }) => {
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      className={`mods-panel ${accent === 'var(--accent-green)' ? 'panel-green' : 'panel-gold'}`}
      onMouseMove={handleMouseMove}
      ref={panelRef}
      style={{ '--x': `${pos.x}px`, '--y': `${pos.y}px`, '--panel-accent': accent }}
    >
      <div className="panel-header">
        <div className="panel-header-left">
          <span className="panel-icon-large">{icon}</span>
          <div>
            <h3>{title}</h3>
            <p className="panel-sub">{subtitle}</p>
          </div>
        </div>
        <span className={`module-tag ${tagClass}`}>{tag}</span>
      </div>
      <div className="mod-list">
        {mods.map((m) => (
          <ModRow key={m.name} {...m} accent={accent} />
        ))}
      </div>
    </div>
  );
};

export const Mods = () => (
  <div className="mods-container fade-in">
    <div className="mods-grid">
      <ModPanel 
        title="Mods Esenciales" 
        subtitle="Requeridos para conectarse al servidor"
        icon="🛠️"
        tag="REQUERIDOS"
        tagClass="tag-ok"
        mods={ESSENTIAL_MODS}
        accent="var(--accent-green)"
      />
      <ModPanel 
        title="Mods Visuales" 
        subtitle="100% opcionales y client-side"
        icon="🎨"
        tag="OPCIONALES"
        tagClass="tag-opt"
        mods={VISUAL_MODS}
        accent="var(--accent-gold)"
      />
    </div>
  </div>
);