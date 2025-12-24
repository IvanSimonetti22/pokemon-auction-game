// 📂 src/pages/Downloads.jsx
import './Downloads.css';
import { useCopyIp } from '../hooks/useCopyIp'; 
import { Toast } from '../components/ui/Toast';

export const Downloads = () => {
  const { showToast, copyToClipboard, IP } = useCopyIp();

  return (
    <div className="downloads-container fade-in">
      <div className="card type-gold">
        <div className="module-header">
          <h3>Protocolo de Instalación</h3>
        </div>
        
        {/* PASO 1 */}
        <div className="download-step">
          <div className="step-number">01</div>
          <div className="step-content">
            <h4>Instalar Fabric Loader</h4>
            <p>Descargá el instalador universal y seleccioná la versión <strong>1.21.10</strong>.</p>
            <a 
              href="https://fabricmc.net/use/installer/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="download-btn secondary"
            >
              Ir a FabricMC.net
            </a>
          </div>
        </div>

        {/* PASO 2 */}
        <div className="download-step">
          <div className="step-number">02</div>
          <div className="step-content">
            <h4>Descargar Mods Obligatorios</h4>
            <p className="step-desc">Pack oficial. Descomprimir en <code>%appdata%/.minecraft/mods</code>.</p>
            <a 
              href="https://drive.google.com/drive/folders/1kULPjDKWP4riCJ0YVeqU64BIs1wph52T?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="download-btn primary"
            >
              📂 DESCARGAR PACK (DRIVE)
            </a>
          </div>
        </div>

        {/* PASO 3 - Estilo especial verde */}
        <div className="download-step final">
          <div className="step-number">03</div>
          <div className="step-content">
            <h4>Conectar al Nodo</h4>
            <p className="step-desc">Abrí el juego con el perfil de Fabric y usá la IP del server:</p>
            
            {/* Badge Interactivo */}
            <div 
              className="ip-mini-badge" 
              onClick={copyToClipboard}
              title="Copiar IP"
            >
              {IP} <span>(Clic para copiar)</span>
            </div>
          </div>
        </div>

      </div>

      <Toast active={showToast} />
    </div>
  );
};