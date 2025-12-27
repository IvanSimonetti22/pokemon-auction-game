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
import { LandingPage } from './pages/LandingPage';

function App() {
  // Estado inicial en 'landing'
  const [activeSection, setActiveSection] = useState('landing');

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('np_theme');
    return savedTheme || 'overworld';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('np_theme', theme);
  }, [theme]);

  // --- MODO 1: LANDING PAGE (CORREGIDO) ---
  if (activeSection === 'landing') {
    return <LandingPage onNavigate={setActiveSection} />;
  }
  // --- SECCIÓN POKÉMON ---
  if (activeSection === 'pokemon_auction') {
    return (
      <div className="pokemon-mode-wrapper">
        <PokemonAuction onBack={() => setActiveSection('landing')} />
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