// 📂 src/components/ChangelogTimeline.jsx
import { useEffect, useState } from "react";
import { getChangelogs } from "../services/changelog.service";
import "./ChangelogTimeline.css";

const Tag = ({ type }) => {
  const safeType = type ? type.toLowerCase().trim() : 'info';
  let className = "tag-info";
  
  if (safeType === 'new' || safeType === 'nuevo') className = "tag-new";
  if (safeType === 'fix' || safeType === 'bug' || safeType === 'error') className = "tag-fix";
  if (safeType === 'change' || safeType === 'ajuste' || safeType === 'update') className = "tag-change";

  const labels = {
    'new': 'NUEVO ✨', 'nuevo': 'NUEVO ✨',
    'fix': 'BUGFIX 🐛', 'bug': 'BUGFIX 🐛',
    'change': 'AJUSTE ⚙️', 'ajuste': 'AJUSTE ⚙️',
    'update': 'UPDATE 🚀'
  };

  return (
    <span className={`module-tag ${className}`}>
      {labels[safeType] || type?.toUpperCase() || 'INFO'}
    </span>
  );
};

export const ChangelogTimeline = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await getChangelogs();
        if (response.success) {
          setLogs(response.data);
        }
      } catch (e) {
        console.error("Error cargando logs", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Función para obtener el icono de la línea de tiempo
  const getTimelineIcon = (type) => {
    const safeType = type ? type.toLowerCase().trim() : 'info';
    if (safeType === 'new' || safeType === 'nuevo') return '✨';
    if (safeType === 'fix' || safeType === 'bug') return '🐛';
    if (safeType === 'change' || safeType === 'ajuste') return '⚙️';
    return '📝';
  };

  // Función para obtener la clase de color para el borde hover
  const getTypeClass = (type) => {
    const safeType = type ? type.toLowerCase().trim() : 'info';
    if (safeType === 'new' || safeType === 'nuevo') return 'type-new';
    if (safeType === 'fix' || safeType === 'bug') return 'type-fix';
    if (safeType === 'change' || safeType === 'ajuste') return 'type-change';
    return '';
  }

  if (loading) {
    return <div style={{textAlign:'center', color:'#888', padding:'50px'}}>Cargando datos del satélite...</div>;
  }

  return (
    <div className="changelog-container fade-in">
      
      <div className="module-header" style={{marginBottom: '40px'}}>
        <h2 style={{color: 'var(--accent-gold)'}}>📜 Bitácora de Cambios</h2>
      </div>

      <div className="timeline-wrapper">
        {/* Línea de fondo decorativa */}
        <div className="timeline-track"></div>

        {logs.map((item) => (
          <div key={item.id} className={`timeline-entry ${getTypeClass(item.type)}`}>
            
            {/* ICONO EN LA LÍNEA DE TIEMPO */}
            <div className="timeline-icon">
              {getTimelineIcon(item.type)}
            </div>
            
            {/* TARJETA DE CONTENIDO */}
            <div className="card timeline-card">
              <div className="timeline-meta">
                <span className="timeline-date">{item.date?.toLocaleDateString()}</span>
                <Tag type={item.type} />
              </div>
              
              <h3 className="timeline-title">
                {item.title} 
                {item.version && <span className="version-pill">{item.version}</span>}
              </h3>
              
              <div className="timeline-desc">
                {item.description}
              </div>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <p style={{color:'#666', fontStyle:'italic', textAlign:'center'}}>No hay registros en la bitácora aún.</p>
        )}
      </div>
    </div>
  );
};