import React, { useState, useEffect, useRef } from 'react';
import { useCopyIp } from '../hooks/useCopyIp';
import { Toast } from '../components/ui/Toast';
import CyclicTitle from '../components/ui/CyclicTitle';
import RainBg from '../components/RainBg';
import { BorderBeam } from '../components/ui/BorderBeam';
import { PlayerStatsModal } from '../components/widgets/PlayerStatsModal';
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
      { name: '🍃 Aventurero',     ach: 'Hora de Aventura'  },
      { name: '🌸 Dieta',          ach: 'Dieta Equilibrada' },
      { name: '❤️ Cobertura',      ach: 'Catálogo Completo' },
      { name: '🔥 Compromiso',     ach: 'Serio Compromiso'  },
      { name: '💥 Overkill',       ach: 'Sobre-Exagerado'   },
      { name: '✨ Postales',       ach: 'Postmortal'        },
      { name: '🧟 Furia',          ach: 'Doctor Zombi'      },
      { name: '🧪 Cómo llegamos',  ach: 'Efectos'           },
      { name: '☁️ Buenas Vistas',  ach: 'Cima del mundo'    },
      { name: '🐚 Hogar',          ach: 'Faro Completo'     },
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
];

// ═══════════════════════════════════════════════════
//  SHARED HOOK & BASE CARD
// ═══════════════════════════════════════════════════

function useSpotlight() {
  const ref = useRef(null);
  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--x', `${e.clientX - r.left}px`);
    ref.current.style.setProperty('--y', `${e.clientY - r.top}px`);
  };
  return [ref, onMove];
}

const Card = ({ className = '', children, onClick, style }) => {
  const [ref, onMove] = useSpotlight();
  return (
    <div
      ref={ref}
      className={`mc-card ${className}`}
      onMouseMove={onMove}
      onClick={onClick}
      style={style}
    >
      <div className="mc-card-spotlight" aria-hidden="true" />
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

const SistemasTab = () => {
  const [openEffects, setOpenEffects] = useState(false);
  return (
    <div className="sistemas-grid">
      {SYSTEMS_DATA.map(sys => (
        <Card key={sys.id} className={`sistema-card border-${sys.accent}`}>
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
              <div className="sistema-cmd">
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
                    <div key={i} className="effect-row">
                      <span className="effect-name">{ef.name}</span>
                      <span className="effect-ach">{ef.ach}</span>
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
    num: '02', accent: 'purple', title: 'Descargar Mods Obligatorios',
    desc: <>Pack oficial. Descomprimir en <code>%appdata%/.minecraft/mods</code>.</>,
    action: { href: 'https://drive.google.com/drive/folders/1kULPjDKWP4riCJ0YVeqU64BIs1wph52T?usp=sharing', label: '[ DOWNLOAD modpack_v1.zip ]', cls: 'btn-step-primary' },
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
  const [ref, onMove] = useSpotlight();
  return (
    <div ref={ref} className="satelite-screen" onMouseMove={onMove}>
      <div className="satelite-scanlines" aria-hidden="true" />
      <div className="satelite-noise"     aria-hidden="true" />
      <div className="satelite-spotlight" aria-hidden="true" />
      <div className="satelite-content">
        <p className="satelite-err-code">ERR_CONNECTION_REFUSED</p>
        <h2 className="satelite-title glitch" data-text="SEÑAL PERDIDA">SEÑAL PERDIDA</h2>
        <p className="satelite-desc">
          El satélite cartográfico se encuentra actualmente en mantenimiento de órbita.
          Los mapas 3D volverán a estar operativos pronto.
        </p>
        <div className="satelite-reconnect" aria-live="polite">
          <span className="rdot">.</span><span className="rdot">.</span><span className="rdot">.</span>
          {' '}REINTENTANDO{' '}
          <span className="rdot">.</span><span className="rdot">.</span><span className="rdot">.</span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
//  MAIN HUB
// ═══════════════════════════════════════════════════

export const MinecraftHub = ({ onBack }) => {
  const [players, setPlayers]   = useState(null);
  const [activeTab, setActiveTab] = useState('mods');
  const [modal, setModal]       = useState(null);
  const [playerModal, setPlayerModal] = useState(null);
  const { showToast, copyToClipboard } = useCopyIp();

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
        {activeTab === 'sistemas'  && <SistemasTab />}
        {activeTab === 'descargas' && <DescargasTab onCopy={copyToClipboard} />}
        {activeTab === 'satelite'  && <SateliteTab />}
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
        />
      )}

      <Toast active={showToast} />
    </div>
  );
};
