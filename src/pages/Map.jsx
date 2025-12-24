// 📂 src/pages/Map.jsx
import './Map.css';

export const Map = () => {
  // 🔴 PEGA AQUÍ TU NUEVA URL DE CLOUDFLARE
  const MAP_URL = "https://declare-drain-cottages-cam.trycloudflare.com"; 

  return (
    <div className="map-page fade-in">
      <div className="card type-aqua">
        <div className="module-header">
          <h3>🛰️ Cartografía Orbital</h3>
          <span className="module-tag tag-ok">EN VIVO</span>
        </div>
        
        <p className="map-desc">
          Renderizado 3D en tiempo real del mundo.
        </p>

        {/* Ya no necesitamos el aviso de seguridad porque ahora es HTTPS :) */}
        
        <div className="map-frame-container">
          <iframe 
            src={MAP_URL} 
            title="Mapa del Servidor"
            allowFullScreen
            // Ya no necesitamos trucos raros, carga nativo
          ></iframe>
        </div>

        <a href={MAP_URL} target="_blank" rel="noopener noreferrer" className="map-overlay-btn">
          ⤢ ABRIR PANTALLA COMPLETA
        </a>
      </div>
    </div>
  );
};
















