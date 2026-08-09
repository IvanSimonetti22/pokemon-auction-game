import React, { useState, useEffect, useRef } from 'react';
import { useCopyIp } from '../hooks/useCopyIp';
import { Toast } from '../components/ui/Toast';
import CyclicTitle from '../components/ui/CyclicTitle';
import RainBg from '../components/RainBg';
import { BorderBeam } from '../components/ui/BorderBeam';
import { PlayerStatsModal } from '../components/widgets/PlayerStatsModal';
import { MouseParticleOverlay } from '../components/widgets/MouseParticleOverlay';
import { BeforeAfterSlider } from '../components/widgets/BeforeAfterSlider';
import './MinecraftHub.css';

// ═══════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════

const SERVER_ADDRESS = 'nodo-persistente.baires.cloud';

const ESSENTIAL_MODS = [
  { name: 'AppleSkin',         desc: 'Información útil sobre la comida',       icon: '🍎' },
  { name: 'ClientSort',        desc: 'Ordenamiento automático de inventario',  icon: '📦' },
  { name: 'Fabric API',        desc: 'Base del ecosistema Fabric',             icon: '🧩' },
  { name: 'FerriteCore',       desc: 'Reducción de uso de RAM',                icon: '🔋' },
  { name: 'ImmediatelyFast',   desc: 'Optimización de renderizado',            icon: '⚡' },
  { name: 'Lithium',           desc: 'Optimización general del cliente',       icon: '🚀' },
  { name: 'MaLiLib',           desc: 'Librería base para otros mods',          icon: '📚' },
  { name: 'ShulkerBoxTooltip', desc: 'Ver interior de shulkers',              icon: '🧰' },
  { name: 'Sodium',            desc: 'Renderizado ultra-optimizado',           icon: '🧪' },
];

const VISUAL_MODS = [
  { name: 'ElytraTrails',  desc: 'Estelas al volar con élitros',     icon: '🦋' },
  { name: 'Flashback',     desc: 'Replay mod y grabación',           icon: '🎥' },
  { name: 'Particle Core', desc: 'Librería de partículas',           icon: '✨' },
  { name: 'Voxy',          desc: 'LOD extremo — horizonte infinito',  icon: '🏔️' },
];

const SYSTEMS_DATA = [
  {
    id: 'logros', icon: '🏆', title: 'Logros & Visual FX', version: 'v7.3', accent: 'purple',
    command: '/trigger np_menu',
    effects: [
      { name: '🍃 Aventurero',     ach: 'Hora de Aventuras', type: 'tinted_leaves', desc: 'Descubre todos los biomas.' },
      { name: '🌸 Dieta',          ach: 'Dieta Equilibrada', type: 'heart', desc: 'Come de todo, aunque no sea bueno para ti.' },
      { name: '❤️ Cobertura',      ach: 'Catálogo Completo', type: 'cherry_leaves', desc: '¡Domestica a todas las variantes de gato!' },
      { name: '🔥 Compromiso',     ach: 'Serio Compromiso',  type: 'soul_fire_flame', desc: 'Mejora una azada con un lingote de netherita.' },
      { name: '💥 Overkill',       ach: 'Sobre-Exagerado',   type: 'crit', desc: 'Da en el blanco del objetivo desde 30 metros.' },
      { name: '✨ Postales',       ach: 'Postmortal',        type: 'totem_of_undying', desc: 'Engaña a la muerte con un tótem de inmortalidad.' },
      { name: '🧟 Furia',          ach: 'Doctor Zombi',      type: 'happy_villager', desc: 'Debilita y cura a un aldeano zombi.' },
      { name: '🧪 Cómo llegamos',  ach: 'Efectos',           type: 'witch', desc: 'Ten todos los efectos de pociones a la vez.' },
      { name: '☁️ Buenas Vistas',  ach: 'Cima del mundo',    type: 'cloud', desc: 'Comercia con un aldeano en el límite de altura.' },
      { name: '🐚 Hogar',          ach: 'Faro Completo',     type: 'nautilus', desc: 'Construye un faro a su máxima potencia.' },
    ],
  },
  {
    id: 'clima', icon: '⛈️', title: 'Clima Atmosférico', version: 'v1.2', accent: 'aqua',
    features: [
      { icon: '☂️', label: 'Lluvia',   val: 'Mensaje chat + Sonido ambiente' },
      { icon: '⚡', label: 'Tormenta', val: 'Efectos visuales intensos'      },
    ],
  },
  {
    id: 'bienvenida', icon: '✨', title: 'NP Bienvenida', version: 'v1.0', accent: 'gold',
    features: [
      { icon: '📜', label: 'Holograma', val: 'Texto flotante en el Spawn'  },
      { icon: '✨', label: 'Partículas', val: 'Decoración al ingresar'     },
    ],
  },
];

const MODALS_DATA = {
  version: {
    title: 'Protocolo de Actualización',
    body: 'Versión actual: Fabric 26.2. El mapa es permanente: el servidor actualiza su versión siguiendo las releases oficiales de Minecraft. Se aplica un período mínimo de 1 mes post-lanzamiento antes de cualquier migración. Se les informará siempre antes de actualizar.',
  },
  rendimiento: {
    title: 'Rendimiento Técnico',
    body: 'Servidor Vanilla+. 20 TPS constantes. La infraestructura está optimizada para soportar múltiples jugadores simultáneos y granjas técnicas complejas sin que se lagee ni explote todo.',
  },
  estetica: {
    title: 'Filosofía Visual',
    body: 'Inmersión visual sin compromisos. Las mejoras visuales — partículas, clima, sonidos — se implementan usando herramientas nativas de Vanilla. Los mejores mods visuales siempre van a ser client-side y completamente opcionales.',
  },
};

const TABS = [
  { id: 'mods',      label: 'Mods',      icon: '🛠️' },
  { id: 'sistemas',  label: 'Sistemas',  icon: '⚙️' },
  { id: 'descargas', label: 'Descargas', icon: '📥' },
  { id: 'satelite',  label: 'Satélite',  icon: '🛰️' },
  { id: 'galeria',   label: 'Galería',   icon: '📸' },
];

// ═══════════════════════════════════════════════════


//  BASE CARD
// ═══════════════════════════════════════════════════

const Card = ({ className = '', children, onClick, style, id }) => {
  return (
    <div
      id={id}
      className={`mc-card ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};


// ═══════════════════════════════════════════════════
//  TAB: MODS
// ═══════════════════════════════════════════════════

const PANELS = [
  { mods: ESSENTIAL_MODS, title: 'Mods Esenciales', sub: 'Requeridos para conectarse al servidor', icon: '🛠️', accent: 'green', badge: 'REQUERIDOS', badgeClass: 'badge-green' },
  { mods: VISUAL_MODS,    title: 'Mods Visuales',   sub: '100% opcionales y client-side',          icon: '🎨', accent: 'gold',  badge: 'OPCIONALES', badgeClass: 'badge-gold'  },
];

const ModsTab = () => (
  <div className="mods-grid">
    {PANELS.map(panel => (
      <Card key={panel.title} className={`mods-panel panel-${panel.accent}`}>
        <div className="mods-panel-head">
          <span className="mods-panel-icon">{panel.icon}</span>
          <div>
            <h3>{panel.title}</h3>
            <p>{panel.sub}</p>
          </div>
          <span className={`mc-badge ${panel.badgeClass}`}>{panel.badge}</span>
        </div>
        <div className="mods-list">
          {panel.mods.map(m => (
            <div key={m.name} className="mod-row">
              <span className="mod-icon">{m.icon}</span>
              <div className="mod-info">
                <span className="mod-name">{m.name}</span>
                <span className="mod-desc">{m.desc}</span>
              </div>
              <div className={`mod-dot dot-${panel.accent}`} />
            </div>
          ))}
        </div>
      </Card>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════
//  TAB: SISTEMAS
// ═══════════════════════════════════════════════════

const SistemasTab = ({ onCopy }) => {
  const [openEffects, setOpenEffects] = useState(true);

  const handleCopyCmd = (cmd) => {
    onCopy(cmd, 'Comando copiado al portapapeles');
  };

  const spawnParticles = (type, name) => {
    window.dispatchEvent(new CustomEvent('spawn-mouse-particles', { detail: { type, duration: 5000 } }));
    onCopy('', `Equipado: ${name}`); 
  };

  return (
    <div className="sistemas-grid">
      {SYSTEMS_DATA.map(sys => (
        <Card key={sys.id} id={sys.id === 'logros' ? 'logros-card' : undefined} className={`sistema-card border-${sys.accent}`}>
          <div className="sistema-head">
            <span className="sistema-icon">{sys.icon}</span>
            <div>
              <h3>{sys.title}</h3>
              <div className="sistema-tags">
                <span className="mc-badge badge-dim">{sys.version}</span>
                <span className="mc-badge badge-green">ONLINE</span>
              </div>
            </div>
          </div>

          {sys.command && (
            <>
              <p className="sys-desc" style={{ marginBottom: '16px', fontSize: '0.9rem', color: '#aaa', marginTop: '10px' }}>
                Al desbloquear estos logros épicos, podrás equiparte partículas cosméticas que te seguirán a todas partes en el servidor. <br/>
                <strong style={{color: '#a78bfa'}}>Hacé click en cualquiera de los logros abajo para previsualizar sus partículas.</strong>
              </p>
              <div 
                className="sistema-cmd" 
                onClick={() => handleCopyCmd(sys.command)} 
                style={{ cursor: 'pointer' }} 
                data-fx-tooltip="Click para copiar el comando"
              >
                <span className="cmd-prompt">{'>'}</span>
                <code className="cmd-text">{sys.command}</code>
                <span className="cmd-cursor" aria-hidden="true" />
              </div>
              <button
                className={`btn-effects-toggle ${openEffects ? 'open' : ''}`}
                onClick={() => setOpenEffects(v => !v)}
              >
                {openEffects ? '[ OCULTAR EFECTOS ]' : '[ VER BIBLIOTECA DE EFECTOS ]'}
              </button>
              {openEffects && (
                <div className="effects-list">
                  {sys.effects.map((ef, i) => (
                    <div 
                      key={i} 
                      className="effect-row" 
                      onClick={() => spawnParticles(ef.type, ef.name)}
                      style={{ cursor: 'pointer' }}
                      data-fx-tooltip="Click para previsualizar partículas"
                    >
                      <div className="effect-main-info">
                        <span className="effect-name">{ef.name}</span>
                        <span className="effect-ach">{ef.ach}</span>
                      </div>
                      <div className="effect-desc">{ef.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {sys.features && (
            <div className="sistema-features">
              {sys.features.map((f, i) => (
                <div key={i} className="feature-row">
                  <span className="feature-icon">{f.icon}</span>
                  <div>
                    <strong>{f.label}:</strong>
                    <span className="feature-val"> {f.val}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  TAB: DESCARGAS
// ═══════════════════════════════════════════════════

const STEPS = [
  {
    num: '01', accent: 'gold', title: 'Instalar Fabric Loader',
    desc: <>Descargá el instalador universal y seleccioná la versión <strong>26.2</strong>.</>,
    action: { href: 'https://fabricmc.net/use/installer/', label: '[ RUN fabric_installer.exe ]', cls: 'btn-step-secondary' },
  },
  {
    num: '02', accent: 'purple', title: 'Descargar todos los mods',
    desc: (
      <>
        Pack oficial. Descomprimir en <code>%appdata%/.minecraft/mods</code>.
        <br/>
        <span style={{fontSize: '0.8rem', color: '#888'}}>Aclaración: Si no querés los mods opcionales, dentro del juego tenés la lista de mods para desactivar los que no quieras.</span>
      </>
    ),
    action: { href: 'https://drive.google.com/file/d/1jGl0fWIxtVp63ihEBozmm0wCcdLV0mPZ/view?usp=sharing', label: '[ DOWNLOAD mods 26.2.rar ]', cls: 'btn-step-primary' },
  },
  {
    num: '03', accent: 'green', title: 'Conectar al Nodo',
    desc: 'Abrí el juego con el perfil de Fabric y usá la IP del server:',
    action: { type: 'ip' },
  },
];

const DescargasTab = ({ onCopy }) => (
  <div className="descargas-wrapper">
    <div className="descargas-header">
      <h2><span className="txt-blink">_</span>PROTOCOL: INSTALL_CLIENT</h2>
      <p>Sigue los pasos para configurar el cliente y conectarte al Nodo.</p>
    </div>
    <div className="descargas-steps">
      {STEPS.map(step => (
        <Card
          key={step.num}
          className={`descarga-step border-${step.accent}`}
          style={{ '--step-color': `var(--accent-${step.accent})` }}
        >
          <div className="step-num">{step.num}</div>
          <div className="step-body">
            <h4>{step.title}</h4>
            <p>{step.desc}</p>
            {step.action.href && (
              <a
                href={step.action.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn-step ${step.action.cls}`}
              >
                {step.action.label}
              </a>
            )}
            {step.action.type === 'ip' && (
              <div className="ip-copy-row" onClick={onCopy} role="button" tabIndex={0}>
                <span className="ip-copy-addr">{SERVER_ADDRESS}</span>
                <span className="ip-copy-hint">_COPY</span>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════
//  TAB: SATÉLITE
// ═══════════════════════════════════════════════════

const SateliteTab = () => {
  const [showWarning, setShowWarning] = useState(true);
  const [mapStatus, setMapStatus] = useState('loading'); // 'loading', 'online', 'offline'

  useEffect(() => {
    let isMounted = true;
    const checkMapStatus = async () => {
      try {
        // Intenta hacer un fetch silencioso al puerto de BlueMap para ver si responde.
        // Usamos la ruta del proxy '/bluemap/' para saltarnos el bloqueo de Mixed Content de Vercel
        await fetch('/bluemap/', { mode: 'no-cors', cache: 'no-cache' });
        if (isMounted) setMapStatus('online');
      } catch (err) {
        if (isMounted) setMapStatus('offline');
      }
    };
    checkMapStatus();
    return () => { isMounted = false; };
  }, []);

  if (mapStatus === 'loading') {
    return (
      <div className="satelite-screen">
        <div className="satelite-content" style={{border: 'none', background: 'transparent'}}>
          <h2 className="satelite-title" style={{fontSize: '2rem', color: 'var(--accent-gold)'}}>ESTABLECIENDO ENLACE...</h2>
        </div>
      </div>
    );
  }

  if (mapStatus === 'offline') {
    return (
      <div className="satelite-screen">
        <div className="satelite-scanlines" aria-hidden="true" />
        <div className="satelite-noise"     aria-hidden="true" />
        <div className="satelite-spotlight" aria-hidden="true" />
        <div className="satelite-content">
          <p className="satelite-err-code">ERR_CONNECTION_REFUSED / MIXED_CONTENT</p>
          <h2 className="satelite-title glitch" data-text="SEÑAL PERDIDA">SEÑAL PERDIDA</h2>
          <p className="satelite-desc">
            El satélite cartográfico se encuentra temporalmente fuera de órbita o apagado.
            <br /><br />
            <span style={{color: '#ffaa00', fontSize: '0.85rem'}}>
              ⚠️ Si estás viendo esto en Vercel (HTTPS), el navegador bloquea la conexión interna al mapa (HTTP) por seguridad.
            </span>
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '25px', flexWrap: 'wrap' }}>
            <div className="satelite-reconnect" aria-live="polite" onClick={() => setMapStatus('loading')} style={{cursor: 'pointer'}}>
              <span className="rdot">.</span><span className="rdot">.</span><span className="rdot">.</span> REINTENTAR <span className="rdot">.</span><span className="rdot">.</span><span className="rdot">.</span>
            </div>
            <a href="/bluemap/" target="_blank" rel="noreferrer" className="satelite-reconnect" style={{cursor: 'pointer', textDecoration: 'none', color: 'var(--accent-gold)'}}>
              ABRIR EN NUEVA PESTAÑA ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="satelite-screen active-map">
      <iframe 
        src="/bluemap/" 
        title="Mapa Satelital BlueMap"
        className="bluemap-iframe"
      />
      {showWarning && (
        <div className="satelite-warning-overlay">
          <div className="satelite-warning-header">
            <span className="warning-title">⚠️ AVISOS DEL SISTEMA</span>
            <button className="warning-close-btn" onClick={() => setShowWarning(false)} title="Cerrar avisos">X</button>
          </div>
          <div className="satelite-warning-body">
            <p><strong>[ DISPONIBILIDAD ]</strong><br/>El satélite no siempre está en órbita. Puede haber momentos de desconexión.</p>
            <p><strong>[ ACTUALIZACIONES ]</strong><br/>El mapa se actualiza cada semana con la copia de seguridad. Los cambios recientes en el mundo pueden no ser visibles de inmediato.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  TAB: GALERÍA
// ═══════════════════════════════════════════════════
const GaleriaTab = () => {
  const [currentShader, setCurrentShader] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentLightbox, setCurrentLightbox] = useState(1);

  const shaderPairs = [
    { b: "/gallery/shaders/Shaders 1.png", a: "/gallery/shaders/Shaders 2.png", t: "Toma 1" },
    { b: "/gallery/shaders/Shaders 3.png", a: "/gallery/shaders/Shaders 4.png", t: "Toma 2" },
    { b: "/gallery/shaders/Shaders 5.png", a: "/gallery/shaders/Shaders 6.png", t: "Toma 3" },
    { b: "/gallery/shaders/Shaders 7.png", a: "/gallery/shaders/Shaders 8.png", t: "Toma 4" },
    { b: "/gallery/shaders/Shaders 9.png", a: "/gallery/shaders/Shaders 10.png", t: "Toma 5" },
    { b: "/gallery/shaders/Shaders 11.png", a: "/gallery/shaders/Shaders 12.png", t: "Toma 6" },
    { b: "/gallery/shaders/Shaders 13.png", a: "/gallery/shaders/Shaders 14.png", t: "Toma 7A" },
    { b: "/gallery/shaders/Shaders 13.png", a: "/gallery/shaders/Shaders 15.png", t: "Toma 7B" },
  ];

  const nextShader = () => setCurrentShader(s => (s + 1) % shaderPairs.length);
  const prevShader = () => setCurrentShader(s => (s === 0 ? shaderPairs.length - 1 : s - 1));

  const openLightbox = (num) => {
    setCurrentLightbox(num);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const nextLightbox = (e) => { e.stopPropagation(); setCurrentLightbox(s => s === 9 ? 1 : s + 1); };
  const prevLightbox = (e) => { e.stopPropagation(); setCurrentLightbox(s => s === 1 ? 9 : s - 1); };

  return (
    <div className="galeria-tab animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SECCIÓN SHADERS */}
      <div className="mc-panel" style={{ 
          padding: '2rem', 
          borderRadius: '16px', 
          background: 'linear-gradient(145deg, rgba(30, 20, 40, 0.4) 0%, rgba(10, 5, 20, 0.7) 100%)', 
          backdropFilter: 'blur(12px)', 
          border: '1px solid rgba(255,255,255,0.03)', 
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.4)',
          position: 'relative'
        }}>
        <h2 className="mc-section-title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ✨ <span>Comparativa</span> Shaders
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '1rem' }}>
          Desliza la barra central para comparar el juego base con los shaders instalados. ({currentShader + 1} de {shaderPairs.length})
        </p>

        <div className="shader-carousel-container" style={{ position: 'relative', width: '100%', margin: '0 auto' }}>
          <button 
             onClick={prevShader} 
             style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
             ◀
          </button>
          
          <div style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderRadius: '12px', width: '100%', overflow: 'hidden' }}>
            <BeforeAfterSlider 
              beforeImage={shaderPairs[currentShader].b} 
              afterImage={shaderPairs[currentShader].a} 
              alt={shaderPairs[currentShader].t} 
            />
          </div>
          
          <button 
             onClick={nextShader} 
             style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
             ▶
          </button>
        </div>
      </div>

      {/* SECCIÓN GENERAL */}
      <div className="mc-panel" style={{ 
          padding: '2rem', 
          borderRadius: '16px', 
          background: 'linear-gradient(145deg, rgba(30, 20, 40, 0.4) 0%, rgba(10, 5, 20, 0.7) 100%)', 
          backdropFilter: 'blur(12px)', 
          border: '1px solid rgba(255,255,255,0.03)', 
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 40px rgba(0,0,0,0.4)',
          position: 'relative'
        }}>
        <h2 className="mc-section-title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📸 <span>Galería</span> General
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '0.9rem' }}>
          Si querés subir tus propias capturas a esta galería, hablá con el Admin del servidor.
        </p>
        
        <div className="galeria-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div 
              key={`gen-${num}`} 
              onClick={() => openLightbox(num)}
              className="galeria-thumb"
            >
              <img 
                src={`/gallery/general/general ${num}.png`} 
                alt={`Captura general ${num}`} 
                loading="lazy"
              />
              <div className="thumb-expand-icon">⛶</div>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div 
          onClick={closeLightbox}
          className="lightbox-overlay"
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' }}
        >
          <div className="lightbox-content" style={{ position: 'relative', width: '90%', maxWidth: '1200px', aspectRatio: '16/9' }} onClick={e => e.stopPropagation()}>
            <img 
              src={`/gallery/general/general ${currentLightbox}.png`} 
              alt="Lightbox" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
            
            {/* Controles de la imagen */}
            <button 
              onClick={prevLightbox} 
              style={{ position: 'absolute', left: '-50px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '2rem', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px' }}
            >◀</button>
            <button 
              onClick={nextLightbox} 
              style={{ position: 'absolute', right: '-50px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '2rem', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px' }}
            >▶</button>
            <button 
              onClick={closeLightbox} 
              style={{ position: 'absolute', top: '-40px', right: 0, background: 'transparent', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}
            >✖</button>
            <div style={{ position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)', color: 'white', fontSize: '1.2rem', letterSpacing: '2px' }}>
              {currentLightbox} / 9
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ═══════════════════════════════════════════════════
//  PREMIUM FX COMPONENTS
// ═══════════════════════════════════════════════════



// ═══════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════

export const MinecraftHub = ({ onBack }) => {
  const [players, setPlayers]   = useState(null);
  const [activeTab, setActiveTab] = useState('mods');
  const [modal, setModal]       = useState(null);
  const [playerModal, setPlayerModal] = useState(null);
  const { showToast, toastMsg, copyToClipboard } = useCopyIp();

  useEffect(() => {
    const fetch$ = async () => {
      try {
        const res  = await fetch(`https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`);
        const data = await res.json();
        if (data.online && data.players) setPlayers(data.players);
      } catch { /* silent */ }
    };
    fetch$();
    const iv = setInterval(fetch$, 60_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="mc-hub">
      <MouseParticleOverlay />
      {/* ── Dither Canvas BG ── */}
      <RainBg />

      {/* ── Top Bar ── */}
      <div className="mc-topbar">
        <button className="mc-back-btn" onClick={onBack}>← VOLVER</button>
        <span className="mc-topbar-brand">NODO PERSISTENTE</span>
        <span className="mc-topbar-tag">Fabric 26.2 · Vanilla+</span>
      </div>

      {/* ── Bento Grid ── */}
      <section className="mc-bento" aria-label="Estado del servidor">

        {/* Hero — 3/4 wide */}
        <Card className="bento-hero">
          <BorderBeam duration={8} borderWidth={2} colorFrom="var(--accent-purple)" colorTo="var(--accent-aqua)" />
          <div className="hero-live">
            <span className="hero-dot" aria-hidden="true" />
            <span>24/7 ONLINE</span>
          </div>
          <div className="hero-scanline" aria-hidden="true" />
          <div className="hero-body">
            <div className="hero-server-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="2" width="20" height="8" rx="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" />
                <line x1="6" y1="6"  x2="6.01" y2="6"  strokeWidth="3" />
                <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h2 className="hero-name">
                <CyclicTitle text="NODO PERSISTENTE" />
              </h2>
              <p className="hero-sub">
                {players
                  ? `${players.online} / ${players.max} jugadores · Fabric 26.2 · Vanilla+`
                  : 'Infraestructura dedicada · Fabric 26.2 · Vanilla+'}
              </p>
              <code className="hero-address">{SERVER_ADDRESS}</code>
            </div>

            {players && players.list && players.list.length > 0 && (
              <div className="hero-players">
                {players.list.slice(0, 15).map((p, i) => {
                  const id = p.uuid || p.name || p;
                  const name = p.name || p;
                  const isAdmin = name === 'NaviFFx';
                  return (
                    <div key={id} className={`player-avatar-wrap ${isAdmin ? 'player-avatar-wrap--admin' : ''}`}
                      style={{ zIndex: 20 - i }} onClick={() => setPlayerModal({ id, name, isOnline: true })}>
                      <img
                        src={`https://mc-heads.net/avatar/${name}/64`}
                        alt={name} title={name}
                        className={`player-avatar ${isAdmin ? 'player-avatar--admin' : ''}`}
                      />
                      {isAdmin && <div className="player-avatar-glow" />}
                    </div>
                  );
                })}
                {players.list.length > 15 && (
                  <div className="player-avatar-more">
                    +{players.list.length - 15}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Stat — Version (col 4, row 1) */}
        <Card className="bento-stat" onClick={() => setModal('version')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" aria-hidden="true" style={{ color: 'var(--accent-purple)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <span className="stat-label">Versión</span>
          <strong className="stat-value" style={{ color: 'var(--accent-purple)' }}>Fabric 26.2</strong>
          <span className="stat-cta">Toca para saber más →</span>
        </Card>

        {/* IP Terminal — cols 1-2, row 2 */}
        <Card className="bento-ip" onClick={copyToClipboard} style={{ cursor: 'pointer' }}>
          <div className="ip-line">
            <span className="ip-dollar">$</span>
            <span className="ip-cmd">connect</span>
            <code className="ip-addr">{SERVER_ADDRESS}</code>
            <span className="ip-cursor txt-blink" aria-hidden="true">█</span>
          </div>
          <span className="ip-hint">_CLIC PARA COPIAR LA IP</span>
        </Card>

        {/* Stat — TPS (col 3, row 2) */}
        <Card className="bento-stat" onClick={() => setModal('rendimiento')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" aria-hidden="true" style={{ color: 'var(--accent-green)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <span className="stat-label">Rendimiento</span>
          <strong className="stat-value" style={{ color: 'var(--accent-green)' }}>20.0 TPS</strong>
          <span className="stat-cta">Toca para saber más →</span>
        </Card>

        {/* Stat — Aesthetics (col 4, row 2) */}
        <Card className="bento-stat" onClick={() => setModal('estetica')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" aria-hidden="true" style={{ color: 'var(--accent-purple)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <span className="stat-label">Estética</span>
          <strong className="stat-value" style={{ color: 'var(--accent-purple)' }}>Vanilla+</strong>
          <span className="stat-cta">Toca para saber más →</span>
        </Card>

      </section>

      {/* ── Tab Nav ── */}
      <div className="mc-tab-nav-wrapper">
        <nav className="mc-tab-nav" aria-label="Secciones">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`mc-tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
              aria-current={activeTab === t.id ? 'page' : undefined}
            >
              <span aria-hidden="true">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab Content ── */}
      <section className="mc-tab-panel">
        {activeTab === 'mods'      && <ModsTab />}
        {activeTab === 'sistemas'  && <SistemasTab onCopy={copyToClipboard} />}
        {activeTab === 'descargas' && <DescargasTab onCopy={copyToClipboard} />}
        {activeTab === 'satelite'  && <SateliteTab />}
        {activeTab === 'galeria'   && <GaleriaTab />}
      </section>

      {/* ── Info Modal ── */}
      {modal && MODALS_DATA[modal] && (
        <div
          className="mc-modal-overlay"
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={MODALS_DATA[modal].title}
        >
          <div className="mc-modal" onClick={e => e.stopPropagation()}>
            <div className="mc-modal-head">
              <h3>{MODALS_DATA[modal].title}</h3>
              <button className="mc-modal-close" onClick={() => setModal(null)} aria-label="Cerrar">✕</button>
            </div>
            <p>{MODALS_DATA[modal].body}</p>
          </div>
        </div>
      )}

      {/* ── Player Stats Modal ── */}
      {playerModal && (
        <PlayerStatsModal 
          player={playerModal} 
          onClose={() => setPlayerModal(null)}
          onNavigateToSistemas={() => {
            setPlayerModal(null);
            setActiveTab('sistemas');
            setTimeout(() => {
              const el = document.getElementById('logros-card');
              const container = document.querySelector('.hub-container'); // scroll container
              if (el) {
                if (container) {
                  const topPos = el.offsetTop - 50;
                  container.scrollTo({ top: topPos, behavior: 'smooth' });
                } else {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                el.classList.add('highlight-pulse');
                setTimeout(() => el.classList.remove('highlight-pulse'), 2000);
              }
            }, 300);
          }}
        />
      )}

      <Toast active={showToast} message={toastMsg || undefined} />
    </div>
  );
};
