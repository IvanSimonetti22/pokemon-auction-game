// 📂 src/components/ChangelogTimeline.jsx
import { useEffect, useState, useRef } from "react";
import { getChangelogs } from "../services/changelog.service";
import "./ChangelogTimeline.css";

const Tag = ({ type }) => {
  const safeType = type ? type.toLowerCase().trim() : 'info';
  let className = "tag-info";
  let colorVar = "var(--accent-gold)";
  
  if (safeType === 'new' || safeType === 'nuevo') { className = "tag-new"; colorVar = "var(--accent-green)"; }
  if (safeType === 'fix' || safeType === 'bug' || safeType === 'error') { className = "tag-fix"; colorVar = "var(--accent-red)"; }
  if (safeType === 'change' || safeType === 'ajuste' || safeType === 'update') { className = "tag-change"; colorVar = "var(--accent-aqua)"; }

  const labels = {
    'new': '[_NUEVO_]', 'nuevo': '[_NUEVO_]',
    'fix': '[_BUGFIX_]', 'bug': '[_BUGFIX_]',
    'change': '[_AJUSTE_]', 'ajuste': '[_AJUSTE_]',
    'update': '[_UPDATE_]'
  };

  return (
    <span className={`module-tag ${className}`} style={{ '--tag-color': colorVar }}>
      {labels[safeType] || `[_${type?.toUpperCase() || 'INFO'}_]`}
    </span>
  );
};

const TimelineEntry = ({ item, getTypeClass, getTimelineIcon }) => {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const safeType = item.type ? item.type.toLowerCase().trim() : 'info';
  let accent = 'var(--accent-gold)';
  if (safeType === 'new' || safeType === 'nuevo') accent = 'var(--accent-green)';
  if (safeType === 'fix' || safeType === 'bug' || safeType === 'error') accent = 'var(--accent-red)';
  if (safeType === 'change' || safeType === 'ajuste' || safeType === 'update') accent = 'var(--accent-aqua)';

  return (
    <div className={`timeline-entry ${getTypeClass(item.type)}`}>
      <div className="timeline-icon">
        {getTimelineIcon(item.type)}
      </div>
      
      <div 
        className="timeline-card"
        onMouseMove={handleMouseMove}
        ref={cardRef}
        style={{ 
          '--x': `${pos.x}px`, 
          '--y': `${pos.y}px`,
          '--card-accent': accent
        }}
      >
        <div className="timeline-meta">
          <span className="timeline-date">{item.date?.toLocaleDateString()}</span>
          <span className="meta-separator">//</span>
          <Tag type={item.type} />
        </div>
        
        <h3 className="timeline-title">
          {item.title} 
          {item.version && <span className="version-pill">v{item.version}</span>}
        </h3>
        
        <div className="timeline-desc">
          {item.description}
        </div>
      </div>
    </div>
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

  const getTimelineIcon = (type) => {
    const safeType = type ? type.toLowerCase().trim() : 'info';
    if (safeType === 'new' || safeType === 'nuevo') return '✨';
    if (safeType === 'fix' || safeType === 'bug') return '🐛';
    if (safeType === 'change' || safeType === 'ajuste') return '⚙️';
    return '📝';
  };

  const getTypeClass = (type) => {
    const safeType = type ? type.toLowerCase().trim() : 'info';
    if (safeType === 'new' || safeType === 'nuevo') return 'type-new';
    if (safeType === 'fix' || safeType === 'bug') return 'type-fix';
    if (safeType === 'change' || safeType === 'ajuste') return 'type-change';
    return '';
  }

  if (loading) {
    return <div className="terminal-loading"><span className="blink">_</span>CARGANDO DATOS DEL NODO...</div>;
  }

  return (
    <div className="changelog-container fade-in">
      
      <div className="terminal-header" style={{ marginBottom: '40px' }}>
        <h2><span className="blink">_</span>SYS_LOG: BITÁCORA</h2>
        <p>Registro histórico de actualizaciones del Nodo Persistente.</p>
      </div>

      <div className="timeline-wrapper">
        <div className="timeline-track"></div>

        {logs.map((item) => (
          <TimelineEntry 
            key={item.id} 
            item={item} 
            getTypeClass={getTypeClass} 
            getTimelineIcon={getTimelineIcon} 
          />
        ))}

        {logs.length === 0 && (
          <p className="empty-log">NO HAY REGISTROS EN LA BASE DE DATOS.</p>
        )}
      </div>
    </div>
  );
};