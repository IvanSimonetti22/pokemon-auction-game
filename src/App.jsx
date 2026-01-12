import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Particles } from './components/layout/Particles';
import { MusicPlayer } from './components/widgets/MusicPlayer';
import { ThemeToggle } from './components/widgets/ThemeToggle';
// Páginas existentes
import { Home } from './pages/Home';
import { Map } from './pages/Map';
import { Mods } from './pages/Mods';
import { Systems } from './pages/Systems';
import { Downloads } from './pages/Downloads';
import { Roadmap } from './pages/Roadmap';
import { Gallery } from './pages/Gallery';
import { ChangelogTimeline } from './components/ChangelogTimeline';
// Página nueva
import { PokemonAuction } from './pages/PokemonAuction';
// 🔥 NUEVO: Landing Page Rediseñada
import { LandingPage } from './pages/LandingPage';
import ZZZCalculator from './components/ZZZCalculator';
// 🔥 NUEVO: Componentes Visuales ZZZ
import ZZZBackground from './components/ZZZBackground';
import TransitionScreen from './components/TransitionScreen';
function App() {
  // Estado inicial en 'landing'
  const [activeSection, setActiveSection] = useState('landing');
  // Estado de carga para la sección ZZZ
  const [zzzLoading, setZzzLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('np_theme');
    return savedTheme || 'overworld';
  });
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('np_theme', theme);
  }, [theme]);
  // Resetear loading cuando entramos a ZZZ
  useEffect(() => {
    if (activeSection === 'zzz') {
      setZzzLoading(true);
    }
  }, [activeSection]);
  // --- THEME SWITCHER (BODY CLASSES) ---
  useEffect(() => {
    // 1. Limpiar clases anteriores
    document.body.classList.remove('theme-zzz', 'theme-minecraft', 'theme-default', 'theme-pokemon');
    // 2. Definir secciones de Minecraft
    const minecraftSections = ['general', 'map', 'systems', 'mods', 'gallery', 'downloads', 'roadmap', 'changelog'];
    // 3. Aplicar clase según el modo
    if (activeSection === 'zzz') {
      document.body.classList.add('theme-zzz');
    } else if (minecraftSections.includes(activeSection)) {
      document.body.classList.add('theme-minecraft');
    } else if (activeSection === 'pokemon_auction') {
      document.body.classList.add('theme-pokemon');
    } else {
      // Modo Home / Landing
      document.body.classList.add('theme-default');
    }
  }, [activeSection]);
  // --- MODO 1: LANDING PAGE (REDISEÑADA) ---
  if (activeSection === 'landing') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        {/* El fondo de partículas se queda fijo atrás */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <Particles theme={theme} />
        </div>
        {/* Componente de la Landing Page */}
        <LandingPage onNavigate={setActiveSection} />
      </div>
    );
  }
  // --- SECCIÓN POKÉMON ---
  if (activeSection === 'pokemon_auction') {
    return (
      <div className="pokemon-mode-wrapper">
        <PokemonAuction onBack={() => setActiveSection('landing')} />
      </div>
    );
  }
  // --- SECCIÓN ZZZ (CYBERPUNK V12) ---
  if (activeSection === 'zzz') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <div className="tv-noise"></div>
        <ZZZBackground />
        {zzzLoading ? (
          <TransitionScreen onComplete={() => setZzzLoading(false)} />
        ) : (
          <div className="content-fade-in" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <header className="mc-header" style={{ position: 'relative', zIndex: 10 }}>
              <button className="mc-back-btn" onClick={() => setActiveSection('landing')}>← SALIR DEL SISTEMA</button>
            </header>
            <ZZZCalculator />
          </div>
        )}
      </div>
    );
  }
  // --- SECCIÓN MINECRAFT ---
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Particles theme={theme} />
      <ThemeToggle onThemeChange={setTheme} />
      <Header activeSection={activeSection} onNavigate={(sec) => {
        if (sec === 'home') setActiveSection('landing');
        else setActiveSection(sec);
      }} />
      <main className="main-layout">
        {activeSection === 'general' && <Home onNavigate={setActiveSection} />}
        {activeSection === 'map' && <Map />}
        {activeSection === 'mods' && <Mods />}
        {activeSection === 'gallery' && <Gallery />}
        {activeSection === 'systems' && <Systems />}
        {activeSection === 'downloads' && <Downloads />}
        {activeSection === 'roadmap' && <Roadmap />}
        {activeSection === 'changelog' && <ChangelogTimeline />}
      </main>
      <MusicPlayer />
    </div>
  )
}
export default App;