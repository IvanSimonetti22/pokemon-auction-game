// 📂 src/components/widgets/IpTerminal.jsx
import './IpTerminal.css';
import { useCopyIp } from '../../hooks/useCopyIp'; // Importamos el cerebro
import { Toast } from '../ui/Toast'; // Importamos el mensaje visual

export const IpTerminal = () => {
  // Usamos nuestro hook personalizado
  const { showToast, copyToClipboard, IP } = useCopyIp();

  return (
    <>
      <div className="ip-terminal" onClick={copyToClipboard}>
        <div>
          <span className="ip-prompt">{'>_'}</span>
          <span className="ip-text">{IP}</span>
        </div>
        <span className="copy-hint">
          CLIC PARA COPIAR
        </span>
      </div>

      {/* El mensaje flotante vive aquí, pero se muestra fijo en la pantalla */}
      <Toast active={showToast} />
    </>
  );
};