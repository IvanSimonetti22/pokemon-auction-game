// 📂 src/pages/Home.jsx
import { useState } from 'react';
import { ServerStatus } from '../components/widgets/ServerStatus';
import { IpTerminal } from '../components/widgets/IpTerminal';
import { StatCard, ActionCard } from '../components/ui/Cards';
import { Modal } from '../components/ui/Modal';
import './Home.css';

const MODAL_CONTENT = {
  version: {
    title: 'Protocolo de Actualización',
    body: <p>Versión actual: <strong>Fabric 1.21.10</strong>.<br/><br/>El mundo evoluciona con las versiones oficiales de Minecraft. Se aplica un periodo de seguridad de al menos 1 mes post-lanzamiento para garantizar estabilidad.</p>
  },
  rendimiento: {
    title: 'Rendimiento Técnico',
    body: <p>Servidor <strong>Vanilla+</strong>. Priorizamos la estabilidad (20 TPS constantes) para soportar múltiples jugadores y granjas técnicas complejas, evitando mecánicas que saturen el CPU.</p>
  },
  estetica: {
    title: 'Filosofía Visual',
    body: <p>Inmersión dieléctica estricta. Todas las mejoras visuales (partículas, sonidos, clima) se implementan usando herramientas nativas (Vanilla), evitando mods externos obligatorios.</p>
  },
  dns: {
    title: 'Conexión Dinámica',
    body: <p>Utilizamos <strong>DuckDNS</strong> para mantener una dirección fija (nodopersistente.duckdns.org) aunque la IP numérica del servidor cambie.</p>
  }
};

export const Home = ({ onNavigate }) => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (key) => setActiveModal(key);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="home-container fade-in">
      <ServerStatus />

      {/* --- GRID DE ESTADÍSTICAS (ICONOS SVG ACTUALIZADOS) --- */}
      <div className="stats-grid">
        <StatCard 
          label="Versión" 
          value="Fabric 1.21.10" 
          onClick={() => openModal('version')}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          } 
        />
        <StatCard 
          label="Rendimiento" 
          value="20.0 TPS" 
          color="#55FF55"
          onClick={() => openModal('rendimiento')}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          } 
        />
        <StatCard 
          label="Estética" 
          value="Vanilla+" 
          color="#FF55FF"
          onClick={() => openModal('estetica')}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          } 
        />
        <StatCard 
          label="DNS" 
          value="Activo" 
          color="#55FFFF"
          onClick={() => openModal('dns')}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          } 
        />
      </div>

      {/* --- BOTONES DE ACCIÓN (ICONOS SVG ORIGINALES) --- */}
      <div className="actions-grid">
        <ActionCard 
          title="Satélite en Vivo"
          description="Acceder a la cartografía orbital en tiempo real."
          color="#55FFFF"
          onClick={() => onNavigate('map')}
          icon={
            /* Icono de Mapa Tríptico */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
              <line x1="8" y1="2" x2="8" y2="18"></line>
              <line x1="16" y1="6" x2="16" y2="22"></line>
            </svg>
          }
        />
        <ActionCard 
          title="Centro de Descargas"
          description="Obtener Fabric y el Pack de Mods oficial."
          color="#FFAA00"
          onClick={() => onNavigate('downloads')}
          icon={
            /* Icono de Flecha Descarga */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          }
        />
      </div>

      <IpTerminal />

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