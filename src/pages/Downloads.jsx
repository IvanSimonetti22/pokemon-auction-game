import React, { useRef, useState } from 'react';
import './Downloads.css';
import { useCopyIp } from '../hooks/useCopyIp'; 
import { Toast } from '../components/ui/Toast';

const DownloadStep = ({ number, title, desc, children, accent = 'gold' }) => {
  const stepRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!stepRef.current) return;
    const rect = stepRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div 
      className={`download-step type-${accent}`}
      onMouseMove={handleMouseMove}
      ref={stepRef}
      style={{ 
        '--x': `${pos.x}px`, 
        '--y': `${pos.y}px`,
        '--step-accent': `var(--accent-${accent})`
      }}
    >
      <div className="step-number">{number}</div>
      <div className="step-content">
        <h4>{title}</h4>
        <p className="step-desc">{desc}</p>
        <div className="step-action">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Downloads = () => {
  const { showToast, copyToClipboard, IP } = useCopyIp();

  return (
    <div className="downloads-container fade-in">
      
      <div className="terminal-header">
        <h2><span className="blink">_</span>PROTOCOL: INSTALL_CLIENT</h2>
        <p>Sigue los pasos para configurar el cliente y conectarte al Nodo.</p>
      </div>

      <div className="downloads-wizard">
        
        {/* PASO 1 */}
        <DownloadStep 
          number="01" 
          title="Instalar Fabric Loader" 
          desc={<>Descargá el instalador universal y seleccioná la versión <strong>26.2</strong>.</>}
          accent="gold"
        >
          <a href="https://fabricmc.net/use/installer/" target="_blank" rel="noopener noreferrer" className="btn-cyber secondary">
            [ RUN fabric_installer.exe ]
          </a>
        </DownloadStep>

        {/* PASO 2 */}
        <DownloadStep 
          number="02" 
          title="Descargar Mods Obligatorios" 
          desc={<>Pack oficial. Descomprimir en <code>%appdata%/.minecraft/mods</code>.</>}
          accent="purple"
        >
          <a href="https://drive.google.com/drive/folders/1kULPjDKWP4riCJ0YVeqU64BIs1wph52T?usp=sharing" target="_blank" rel="noopener noreferrer" className="btn-cyber primary">
            [ DOWNLOAD modpack_v1.zip ]
          </a>
        </DownloadStep>

        {/* PASO 3 */}
        <DownloadStep 
          number="03" 
          title="Conectar al Nodo" 
          desc="Abrí el juego con el perfil de Fabric y usá la IP del server:"
          accent="green"
        >
          <div className="ip-terminal-badge" onClick={copyToClipboard} title="Copiar IP">
            <span className="ip-text">{IP}</span>
            <span className="copy-hint">_COPY</span>
          </div>
        </DownloadStep>

      </div>

      <Toast active={showToast} />
    </div>
  );
};