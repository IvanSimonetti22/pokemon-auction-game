// 📂 src/pages/Home.jsx
import { useState } from 'react';
import { ServerStatus } from '../components/widgets/ServerStatus';
import { IpTerminal } from '../components/widgets/IpTerminal';
import { Modal } from '../components/ui/Modal';
import FaultyTerminalBg from '../components/FaultyTerminalBg';
import './Home.css';

const MODAL_CONTENT = {
  version: {
    title: 'Protocolo de Actualización',
    body: <p>Versión actual: <strong>Fabric 26.2</strong>.<br/><br/>El mapa es permanente: el servidor actualiza su versión siguiendo las releases oficiales de Minecraft. Se aplica un período mínimo de <strong>1 mes</strong> post-lanzamiento antes de cualquier migración. Se les informará siempre antes de actualizar.</p>
  },
  rendimiento: {
    title: 'Rendimiento Técnico',
    body: <p>Servidor <strong>Vanilla+</strong>. <strong>20 TPS constantes</strong>. La infraestructura está optimizada para soportar múltiples jugadores simultáneos y granjas técnicas complejas sin que se lagee ni explote todo.</p>
  },
  estetica: {
    title: 'Filosofía Visual',
    body: <p>Inmersión visual sin compromisos. Las mejoras visuales — partículas, clima, sonidos — se implementan usando herramientas nativas de Vanilla, sin imponer mods de cliente obligatorios. Los mejores mods visuales siempre van a ser <strong>client-side y completamente opcionales</strong>.</p>
  },
};

export const Home = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (key) => setActiveModal(key);
  const closeModal = () => setActiveModal(null);

  // Mouse tracking para efecto spotlight
  const handleMouseMove = (e) => {
    const item = e.currentTarget;
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    item.style.setProperty('--x', `${x}px`);
    item.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className="home-container fade-in">
      <FaultyTerminalBg 
        tint="#55FFFF" 
        curvature={0.05} 
        scanlineIntensity={0.4} 
        glitchAmount={1} 
        noiseAmp={0.7} 
      />

      {/* BENTO GRID LAYOUT */}
      <div className="bento-grid">
        
        {/* HERO - Server Status (Grande, 2x2) */}
        <div className="bento-item bento-hero" onMouseMove={handleMouseMove}>
          <ServerStatus />
          <div className="border-glow" />
        </div>

        {/* STATS - Versión (1x1) */}
        <div className="bento-item bento-stat" onClick={() => openModal('version')} onMouseMove={handleMouseMove}>
          <div className="bento-stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="bento-stat-content">
            <span className="bento-stat-label">Versión</span>
            <strong className="bento-stat-value">Fabric 26.2</strong>
          </div>
          <div className="border-glow" />
        </div>

        {/* STATS - Rendimiento (1x1) */}
        <div className="bento-item bento-stat" onClick={() => openModal('rendimiento')} onMouseMove={handleMouseMove}>
          <div className="bento-stat-icon" style={{ color: '#55FF55' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="bento-stat-content">
            <span className="bento-stat-label">Rendimiento</span>
            <strong className="bento-stat-value">20.0 TPS</strong>
          </div>
          <div className="border-glow" />
        </div>

        {/* STATS - Estética (1x1) */}
        <div className="bento-item bento-stat" onClick={() => openModal('estetica')} onMouseMove={handleMouseMove}>
          <div className="bento-stat-icon" style={{ color: '#FF55FF' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div className="bento-stat-content">
            <span className="bento-stat-label">Estética</span>
            <strong className="bento-stat-value">Vanilla+</strong>
          </div>
          <div className="border-glow" />
        </div>

        {/* ACCIÓN - Satélite (1x2 horizontal) */}
        <div className="bento-item bento-action" onClick={() => onNavigate('map')} onMouseMove={handleMouseMove}>
          <div className="bento-action-icon" style={{ color: '#55FFFF' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
              <line x1="8" y1="2" x2="8" y2="18"/>
              <line x1="16" y1="6" x2="16" y2="22"/>
            </svg>
          </div>
          <div className="bento-action-content">
            <h3>Satélite en Vivo</h3>
            <p>Cartografía orbital del mundo — en mantenimiento.</p>
          </div>
          <div className="border-glow" />
        </div>

        {/* ACCIÓN - Descargas (1x2 horizontal) */}
        <div className="bento-item bento-action" onClick={() => onNavigate('downloads')} onMouseMove={handleMouseMove}>
          <div className="bento-action-icon" style={{ color: '#FFAA00' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div className="bento-action-content">
            <h3>Centro de Descargas</h3>
            <p>Obtener Fabric y el Pack de Mods oficial.</p>
          </div>
          <div className="border-glow" />
        </div>

        {/* TERMINAL IP (Full width) */}
        <div className="bento-item bento-terminal">
          <IpTerminal />
        </div>

      </div>

      {activeModal && MODAL_CONTENT[activeModal] && (
        <Modal
          isOpen={!!activeModal}
          onClose={closeModal}
          title={MODAL_CONTENT[activeModal].title}
        >
          {MODAL_CONTENT[activeModal].body}
        </Modal>
      )}
    </div>
  );
};
