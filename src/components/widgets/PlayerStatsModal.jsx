import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SkinViewer, WalkingAnimation, IdleAnimation, RunningAnimation } from 'skinview3d';
import HalftoneBg from './HalftoneBg';
import Cubes from './Cubes';
import MinedCube from './MinedCube';
import WireSphere from './WireSphere';
import WireSword from './WireSword';
import ShinyText from '../ui/ShinyText';
import serverData from '../../server_data.json';
import './PlayerStatsModal.css';

// ── Logros épicos con nombres en español ──
const HARD_ADVANCEMENTS = [
  { id: 'minecraft:end/kill_dragon',               label: 'Liberar el End',            icon: '🐉', category: 'El End',    desc: 'Derrota al Dragón del End.' },
  { id: 'minecraft:end/dragon_egg',                label: 'La Próxima Generación',     icon: '🥚', category: 'El End',    desc: 'Consigue el huevo del dragón.' },
  { id: 'minecraft:end/enter_end_gateway',         label: 'Huida Remota',              icon: '🌀', category: 'El End',    desc: 'Escapa de la isla principal del End.' },
  { id: 'minecraft:end/levitate',                  label: 'Hasta el Cielo',            icon: '🎈', category: 'El End',    desc: 'Levita 50 bloques por ataque de un Shulker.' },
  { id: 'minecraft:end/elytra',                    label: 'Buenas Vistas desde Arriba',icon: '🦋', category: 'El End',    desc: 'Encuentra unos élitros.' },
  { id: 'minecraft:nether/obtain_ancient_debris',  label: 'Oculto en las Profundidades',icon: '🔮', category: 'El Nether', desc: 'Consigue restos antiguos.' },
  { id: 'minecraft:nether/create_full_netherite_armor', label: 'Armadura de Netherita', icon: '🛡️', category: 'El Nether', desc: 'Consigue armadura completa de netherita.' },
  { id: 'minecraft:nether/fast_travel',            label: 'Burbuja Subespacio',        icon: '⚡', category: 'El Nether', desc: 'Viaja 7 km en el Overworld usando el Nether.' },
  { id: 'minecraft:nether/uneasy_alliance',        label: 'Alianza Incómoda',          icon: '🕊️', category: 'El Nether', desc: 'Rescata un Ghast y mátalo en el Overworld.' },
  { id: 'minecraft:nether/charge_respawn_anchor',  label: '¿Quién Pela Cebollas?',     icon: '⚓', category: 'El Nether', desc: 'Carga un nexo de reaparición al máximo.' },
  { id: 'minecraft:adventure/kill_a_mob',          label: 'Cazador de Monstruos',      icon: '⚔️', category: 'Aventura',  desc: 'Mata a cualquier monstruo hostil.' },
  { id: 'minecraft:adventure/kill_all_mobs',       label: 'Monstruos Cazados',         icon: '🏹', category: 'Aventura',  desc: 'Mata a todos los monstruos hostiles.' },
  { id: 'minecraft:adventure/totem_of_undying',    label: 'Postmortal',                icon: '🪬', category: 'Aventura',  desc: 'Engaña a la muerte con un tótem de inmortalidad.', particle: 'Postales' },
  { id: 'minecraft:adventure/hero_of_the_village', label: 'Héroe de la Aldea',         icon: '🏘️', category: 'Aventura',  desc: 'Defiende con éxito una aldea de una invasión.' },
  { id: 'minecraft:adventure/adventuring_time',    label: 'Hora de Aventuras',         icon: '🗺️', category: 'Aventura',  desc: 'Descubre todos los biomas.', particle: 'Aventurero' },
  { id: 'minecraft:story/enter_the_end',           label: '¿El Fin?',                  icon: '🌌', category: 'Historia',  desc: 'Atraviesa el portal del End.' },
  { id: 'minecraft:story/obtain_armor',            label: 'A Ponerse la Armadura',     icon: '🪖', category: 'Historia',  desc: 'Protégete con una pieza de armadura.' },
  { id: 'minecraft:story/shiny_gear',              label: 'Hoy No, Gracias',           icon: '✨', category: 'Historia',  desc: 'Protégete con armadura de diamante.' },
  
  // Logros extra para partículas
  { id: 'minecraft:husbandry/balanced_diet',       label: 'Dieta Equilibrada',         icon: '🥩', category: 'Agricultura', desc: 'Come de todo, aunque no sea bueno para ti.', particle: 'Dieta' },
  { id: 'minecraft:husbandry/complete_catalogue',  label: 'Catálogo Completo',         icon: '🐱', category: 'Agricultura', desc: '¡Domestica a todas las variantes de gato!', particle: 'Cobertura' },
  { id: 'minecraft:husbandry/obtain_netherite_hoe',label: 'Serio Compromiso',          icon: '⛏️', category: 'Agricultura', desc: 'Mejora una azada con un lingote de netherita.', particle: 'Compromiso' },
  { id: 'minecraft:adventure/bullseye',            label: 'Sobre-Exagerado',           icon: '💥', category: 'Aventura',  desc: 'Da en el blanco del objetivo desde 30 metros.', particle: 'Overkill' },
  { id: 'minecraft:story/cure_zombie_villager',    label: 'Doctor Zombi',              icon: '🧪', category: 'Historia',  desc: 'Debilita y cura a un aldeano zombi.', particle: 'Furia' },
  { id: 'minecraft:nether/all_potions',            label: 'Efectos',                   icon: '🍹', category: 'El Nether', desc: 'Ten todos los efectos de pociones a la vez.', particle: 'Cómo llegamos' },
  { id: 'minecraft:adventure/trade_at_world_height',label: 'Cima del mundo',           icon: '🏔️', category: 'Aventura',  desc: 'Comercia con un aldeano en el límite de altura.', particle: 'Buenas Vistas' },
  { id: 'minecraft:nether/create_beacon',          label: 'Faro Completo',             icon: '🗼', category: 'El Nether', desc: 'Construye un faro a su máxima potencia.', particle: 'Hogar' },
];

// ── Traducciones de bloques al español ──
const BLOCK_ES = {
  stone:'Piedra', cobblestone:'Adoquín', dirt:'Tierra', grass_block:'Bloque de Hierba',
  oak_log:'Tronco de Roble', birch_log:'Tronco de Abedul', spruce_log:'Tronco de Abeto',
  jungle_log:'Tronco de Jungla', acacia_log:'Tronco de Acacia', dark_oak_log:'Tronco de Roble Negro',
  sand:'Arena', gravel:'Grava', coal_ore:'Mineral de Carbón', deepslate_coal_ore:'Pizarra de Carbón',
  iron_ore:'Mineral de Hierro', deepslate_iron_ore:'Pizarra de Hierro',
  gold_ore:'Mineral de Oro', deepslate_gold_ore:'Pizarra de Oro',
  diamond_ore:'Mineral de Diamante', deepslate_diamond_ore:'Pizarra de Diamante',
  netherrack:'Piedra del Nether', ancient_debris:'Restos Antiguos',
  deepslate:'Pizarra', stone_bricks:'Ladrillos de Piedra', oak_planks:'Tablones de Roble',
  netherite_block:'Bloque de Netherita', chest:'Cofre', crafting_table:'Mesa de Trabajo',
  furnace:'Horno', obsidian:'Obsidiana', glass:'Cristal', clay:'Arcilla',
  sandstone:'Arenisca', diorite:'Diorita', granite:'Granito',
  andesite:'Andesita', soul_sand:'Arena de Almas', nether_brick:'Ladrillo del Nether',
  quartz_ore:'Mineral de Cuarzo', nether_gold_ore:'Mineral de Oro del Nether',
  emerald_ore:'Mineral de Esmeralda', deepslate_emerald_ore:'Pizarra de Esmeralda',
  lapis_ore:'Mineral de Lapislázuli', deepslate_lapis_ore:'Pizarra de Lapislázuli',
  redstone_ore:'Mineral de Redstone', deepslate_redstone_ore:'Pizarra de Redstone',
  copper_ore:'Mineral de Cobre', deepslate_copper_ore:'Pizarra de Cobre',
};

// ── Traducciones de mobs al español ──
const MOB_ES = {
  zombie:'Zombie', skeleton:'Esqueleto', creeper:'Creeper', spider:'Araña',
  enderman:'Enderman', blaze:'Blaze', wither_skeleton:'Esqueleto del Wither',
  witch:'Bruja', zombie_villager:'Aldeano Zombie', drowned:'Ahogado',
  phantom:'Fantasma', slime:'Slime', magma_cube:'Cubo de Magma',
  ghast:'Ghast', evoker:'Invocador', vindicator:'Vindicador',
  piglin:'Piglin', hoglin:'Hoglin', zoglin:'Zoglin',
  villager:'Aldeano', pig:'Cerdo', cow:'Vaca', sheep:'Oveja',
  chicken:'Pollo', bat:'Murciélago', squid:'Calamar',
  glow_squid:'Calamar Brillante', vex:'Vex', iron_golem:'Gólem de Hierro',
  wolf:'Lobo', cat:'Gato', horse:'Caballo',
};

const MOB_ICONS = {
  zombie: '🧟', skeleton: '💀', creeper: '💥', spider: '🕷️',
  enderman: '👁️', blaze: '🔥', wither_skeleton: '☠️', witch: '🧙',
  zombie_villager: '🧟', drowned: '🌊', phantom: '👻', slime: '🟢',
  magma_cube: '🟠', ghast: '👁️', evoker: '🌀', vindicator: '🪓',
  piglin: '🐷', hoglin: '🐗', zoglin: '🐗', villager: '👨‍🌾',
  pig: '🐷', cow: '🐮', sheep: '🐑', chicken: '🐔',
  bat: '🦇', squid: '🦑', glow_squid: '💡', vex: '🌪️',
  iron_golem: '🤖', wolf: '🐺', cat: '🐱', horse: '🐴',
};

export const PlayerStatsModal = ({ player, onClose, onNavigateToSistemas }) => {
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const cubeRef = useRef(null);
  const [animIndex, setAnimIndex] = useState(0);
  // activeDetail: null | 'blocks' | 'mobs' | 'achievements'
  const [activeDetail, setActiveDetail] = useState(null);
  const [sweeping, setSweeping] = useState(false);
  const [sweepOrigin, setSweepOrigin] = useState({ x: 72, y: 42 });
  const infoRef = useRef(null);
  const { id, name, isOnline } = player;
  const isAdmin = name === 'NaviFFx';

  const [stats, setStats] = useState({
    playtime: '--', blocksMined: '--', mobsKilled: '--',
    deaths: '--', lastSeen: '...', achievementsDone: '--',
    minedBreakdown: [], mobBreakdown: [], achievementsBreakdown: []
  });

  useEffect(() => {
    if (!name) return;

    const playerData = serverData[id] || {};
    const localStats = playerData.stats || { stats: {} };
    const localLogros = playerData.logros || {};

    const customStats = localStats.stats?.['minecraft:custom'] || {};
    const minedStats  = localStats.stats?.['minecraft:mined']  || {};
    const killedStats = localStats.stats?.['minecraft:killed'] || {};

    // ── Playtime ──
    const playTicks  = customStats['minecraft:play_time'] || 0;
    const playHours  = playTicks / 20 / 3600;
    const playDays   = playHours / 24;
    const playtimeStr = playDays >= 1
      ? `${playDays.toFixed(2)}d`
      : `${Math.floor(playHours)}h ${Math.floor((playHours % 1) * 60)}m`;

    // ── Mobs ──
    const mobs   = customStats['minecraft:mob_kills'] || 0;
    const deaths = customStats['minecraft:deaths']    || 0;

    const mobBreakdown = Object.entries(killedStats)
      .map(([key, val]) => {
        const clean = key.replace('minecraft:', '');
        return {
          name: MOB_ES[clean] || clean.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          icon: MOB_ICONS[clean] || '👾',
          amount: val, val: val.toLocaleString()
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // ── Blocks ──
    const blockIcons = {
      stone:'🪨', cobblestone:'🪨', dirt:'🟫', grass_block:'🟩',
      oak_log:'🪵', birch_log:'🪵', spruce_log:'🪵', jungle_log:'🪵', acacia_log:'🪵', dark_oak_log:'🪵',
      sand:'🏖️', gravel:'⬛', coal_ore:'⛏️', deepslate_coal_ore:'⛏️',
      iron_ore:'🔩', deepslate_iron_ore:'🔩',
      gold_ore:'🏆', deepslate_gold_ore:'🏆',
      diamond_ore:'💎', deepslate_diamond_ore:'💎',
      netherrack:'🔥', ancient_debris:'🔮', obsidian:'🟣', glass:'🪟',
    };
    let totalBlocks = 0;
    const breakdown = Object.entries(minedStats).map(([key, val]) => {
      totalBlocks += val;
      const clean = key.replace('minecraft:', '');
      return { name: BLOCK_ES[clean] || clean.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), icon: blockIcons[clean] || '🧊', amount: val };
    }).sort((a, b) => b.amount - a.amount);
    const topBlocks = breakdown.slice(0, 15).map(b => ({ ...b, val: b.amount.toLocaleString(), pct: (b.amount / totalBlocks) * 100 }));

    // ── Achievements — done first ──
    const achievementsBreakdown = HARD_ADVANCEMENTS
      .map(adv => ({ ...adv, done: !!localLogros[adv.id]?.done }))
      .sort((a, b) => b.done - a.done);
    const achievementsDone = achievementsBreakdown.filter(a => a.done).length;

    setStats(prev => ({
      ...prev,
      playtime: playtimeStr,
      blocksMined: totalBlocks.toLocaleString(),
      mobsKilled: mobs.toLocaleString(),
      deaths: deaths.toLocaleString(),
      achievementsDone: `${achievementsDone}/${HARD_ADVANCEMENTS.length}`,
      minedBreakdown: topBlocks,
      mobBreakdown,
      achievementsBreakdown
    }));

    // Plan API — only for lastSeen
    fetch(`http://23.175.40.14:25117/v1/player?player=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(data => {
        let lastSeenText = isOnline ? 'Conectado ahora' : 'Desconocido';
        if (data.info?.last_seen) {
          const diffMins = Math.floor((Date.now() - data.info.last_seen) / 60000);
          if (diffMins < 5) lastSeenText = 'Conectado ahora';
          else if (diffMins < 60) lastSeenText = `Hace ${diffMins} min`;
          else lastSeenText = `Hace ${Math.floor(diffMins / 60)} horas`;
        }
        setStats(prev => ({ ...prev, lastSeen: lastSeenText }));
      })
      .catch(() => {});
  }, [name, isOnline]);

  // ── Skin viewer ──
  useEffect(() => {
    if (!canvasRef.current) return;
    const viewer = new SkinViewer({ canvas: canvasRef.current, width: 300, height: 400, skin: `https://minotar.net/skin/${name}` });
    viewer.fov = 70; viewer.zoom = 0.9;
    viewerRef.current = viewer;
    viewer.animation = new WalkingAnimation(); viewer.animation.speed = 0.6;
    viewer.autoRotate = true; viewer.autoRotateSpeed = 0.5;
    const preventZoom = e => e.preventDefault();
    canvasRef.current?.addEventListener('wheel', preventZoom, { passive: false });
    return () => { viewer.dispose(); viewerRef.current = null; };
  }, [name]);

  useEffect(() => {
    if (!viewerRef.current) return;
    const v = viewerRef.current;
    if (animIndex === 0) { v.animation = new WalkingAnimation(); v.animation.speed = 0.6; }
    else if (animIndex === 1) { v.animation = new RunningAnimation(); v.animation.speed = 0.8; }
    else { v.animation = new IdleAnimation(); v.animation.speed = 0.5; }
  }, [animIndex]);

  const cyclePose = () => setAnimIndex(p => (p + 1) % 3);

  // ── Detail panel opener with sweep from click position ──
  const openDetail = useCallback((panel, e) => {
    if (activeDetail || sweeping) return;
    // Calculate click position relative to the info container
    if (e && infoRef.current) {
      const rect = infoRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setSweepOrigin({ x, y });
    }
    setSweeping(true);
    if (panel === 'blocks') cubeRef.current?.triggerRipple();
    setTimeout(() => { setActiveDetail(panel); setSweeping(false); }, 650);
  }, [activeDetail, sweeping]);

  const closeDetail = () => setActiveDetail(null);

  return (
    <div className="player-modal-overlay" onClick={onClose}>
      <div className="player-modal-content" onClick={e => e.stopPropagation()}>
        <div className="player-modal-scanlines" />
        <button className="player-modal-close" onClick={onClose}>✕</button>

        <div className="player-modal-layout">
          {/* Left: 3D Skin */}
          <div className="player-skin-container">
            <div className="skin-glow" />
            <canvas ref={canvasRef} className="player-skin-3d" />
            <button className="player-rank-badge" onClick={cyclePose} title="Click para cambiar pose">
              📸 POSE
            </button>
          </div>

          {/* Right: Info */}
          <div className="player-info-container">
            <HalftoneBg inkColor="#141414" paperColor="#0a0a0c" pixelSize={14} />

            <div className="player-info-content" ref={infoRef}>
              <h2 className={`player-name ${isAdmin ? 'player-name--admin' : ''}`}>
                {isAdmin ? (
                  <span className="admin-name-wrap">
                    <span className="admin-crown" title="Administrador">♛</span>
                    <ShinyText text={name} speed={2} color="#c4b5fd" shineColor="#ffffff" />
                  </span>
                ) : (
                  <ShinyText text={name} speed={4} color="#d0d0d0" shineColor="#ffffff" />
                )}
              </h2>
              <div className="player-status">
                <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
                <span style={{ color: isOnline ? '#55ff55' : '#aaa' }}>{stats.lastSeen}</span>
              </div>

              {sweeping && (
                <div className="sweep-overlay" aria-hidden="true"
                  style={{ '--ox': `${sweepOrigin.x}%`, '--oy': `${sweepOrigin.y}%` }} />
              )}

              {/* ─── STATS GRID ─── */}
              {!activeDetail ? (
                <div className={`stats-grid fade-in ${sweeping ? 'sweeping' : ''}`}>
                  <div className="stat-card">
                    <div className="stat-icon">⏱️</div>
                    <div className="stat-title">TIEMPO JUGADO</div>
                    <div className="stat-value">{stats.playtime}</div>
                  </div>

                  {/* LOGROS — clickable → sphere */}
                  <div className="stat-card clickable-stat" onClick={e => openDetail('achievements', e)}>
                    <WireSphere color="#a78bfa" size={44} speed={9} />
                    <div className="stat-title">LOGROS</div>
                    <div className="stat-value">{stats.achievementsDone}</div>
                  </div>

                  {/* BLOQUES — clickable → cube */}
                  <div className="stat-card clickable-stat stat-card-blocks" onClick={e => openDetail('blocks', e)}>
                    <MinedCube ref={cubeRef} onCubeClick={() => {}} />
                    <div className="stat-title">BLOQUES MINADOS</div>
                    <div className="stat-value">{stats.blocksMined}</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">💀</div>
                    <div className="stat-title">MUERTES</div>
                    <div className="stat-value">{stats.deaths}</div>
                  </div>

                  {/* MOBS — clickable → sword */}
                  <div className="stat-card highlight-stat clickable-stat" onClick={e => openDetail('mobs', e)}>
                    <WireSword color="#f87171" size={44} />
                    <div className="stat-title">MOBS ELIMINADOS</div>
                    <div className="stat-value">{stats.mobsKilled}</div>
                  </div>
                </div>
              ) : activeDetail === 'blocks' ? (
                /* ─── BLOCKS DETAIL ─── */
                <div className="blocks-detail-view fade-in">
                  <Cubes gridSize={5} maxAngle={35} radius={3}
                    borderStyle="1px dashed rgba(85,255,255,0.18)"
                    faceColor="rgba(4,12,12,0.0)" autoAnimate rippleOnClick={false} cellGap={4} />
                  <div className="blocks-detail-header">
                    <button className="blocks-back-btn" onClick={closeDetail}>← VOLVER</button>
                    <div className="blocks-detail-title">
                      <MinedCube onCubeClick={() => {}} />
                      <span>BLOQUES MINADOS</span>
                    </div>
                    <div className="blocks-detail-total">{stats.blocksMined} total</div>
                  </div>
                  <div className="blocks-list">
                    {stats.minedBreakdown.map((item, i) => (
                      <div key={i} className="block-detail-row" style={{ animationDelay: `${i * 0.04}s` }}>
                        <span className="block-detail-rank">#{i + 1}</span>
                        <span className="block-detail-icon">{item.icon}</span>
                        <span className="block-detail-name">{item.name}</span>
                        <div className="block-detail-bar-wrap">
                          <div className="block-detail-bar" style={{ width: `${item.pct}%` }} />
                        </div>
                        <span className="block-detail-val">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeDetail === 'mobs' ? (
                /* ─── MOBS DETAIL ─── */
                <div className="blocks-detail-view fade-in">
                  <Cubes gridSize={5} maxAngle={35} radius={3}
                    borderStyle="1px dashed rgba(248,113,113,0.15)"
                    faceColor="rgba(12,4,4,0.0)" autoAnimate rippleOnClick={false} cellGap={4} />
                  <div className="blocks-detail-header">
                    <button className="blocks-back-btn" onClick={closeDetail}>← VOLVER</button>
                    <div className="blocks-detail-title">
                      <WireSword color="#f87171" size={36} />
                      <span>MOBS ELIMINADOS</span>
                    </div>
                    <div className="blocks-detail-total">{stats.mobsKilled} total</div>
                  </div>
                  <div className="blocks-list">
                    {stats.mobBreakdown.map((item, i) => (
                      <div key={i} className="block-detail-row" style={{ animationDelay: `${i * 0.05}s` }}>
                        <span className="block-detail-rank">#{i + 1}</span>
                        <span className="block-detail-icon">{item.icon}</span>
                        <span className="block-detail-name">{item.name}</span>
                        <div className="block-detail-bar-wrap">
                          <div className="block-detail-bar block-detail-bar--red"
                            style={{ width: `${(item.amount / stats.mobBreakdown[0]?.amount) * 100}%` }} />
                        </div>
                        <span className="block-detail-val">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ─── ACHIEVEMENTS DETAIL ─── */
                <div className="blocks-detail-view fade-in">
                  <Cubes gridSize={5} maxAngle={35} radius={3}
                    borderStyle="1px dashed rgba(167,139,250,0.15)"
                    faceColor="rgba(4,4,12,0.0)" autoAnimate rippleOnClick={false} cellGap={4} />
                  <div className="blocks-detail-header">
                    <button className="blocks-back-btn" onClick={closeDetail}>← VOLVER</button>
                    <div className="blocks-detail-title">
                      <WireSphere color="#a78bfa" size={36} speed={9} />
                      <span>LOGROS ÉPICOS</span>
                    </div>
                    <div className="blocks-detail-total">{stats.achievementsDone} completados</div>
                  </div>
                  <div className="adv-legend">
                    <span className="adv-particle-badge">✨</span>
                    <span className="adv-legend-text">Este símbolo indica que el logro desbloquea un efecto visual. Click para ver.</span>
                  </div>
                  <div className="blocks-list">
                    {stats.achievementsBreakdown.map((adv, i) => (
                      <div key={i} className={`block-detail-row adv-row ${adv.done ? 'adv-done' : 'adv-missing'} ${adv.particle ? 'has-particle' : ''}`}
                        onClick={adv.particle ? onNavigateToSistemas : undefined}
                        style={{ animationDelay: `${i * 0.04}s`, cursor: adv.particle ? 'pointer' : 'default' }}>
                        <span className="block-detail-icon">{adv.icon}</span>
                        <div className="adv-left-col">
                          <span className="block-detail-name">{adv.label}</span>
                          <span className="adv-category">{adv.category}</span>
                        </div>
                        <div className="adv-mid-col">
                          {adv.desc && <span className="adv-desc">{adv.desc}</span>}
                          {adv.particle && (
                            <div className="adv-particle-badge" title="Este logro desbloquea una partícula épica">
                              ✨ {adv.particle}
                            </div>
                          )}
                        </div>
                        <div className={`adv-badge ${adv.done ? 'adv-badge--done' : 'adv-badge--locked'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="system-notice">
                <span className="txt-blink">_</span> DATOS EXTRAÍDOS DE ARCHIVOS NATIVOS DEL SERVIDOR (stats/*.json)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
