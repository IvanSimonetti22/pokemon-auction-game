import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import FaultyTerminal from './components/FaultyTerminal';
import { MusicPlayer } from './components/widgets/MusicPlayer';
import { ThemeToggle } from './components/widgets/ThemeToggle';
// Sección Minecraft (todo-en-uno)
import { MinecraftHub } from './pages/MinecraftHub';
// Página nueva
import { PokemonAuction } from './pages/PokemonAuction';
// 🔥 NUEVO: Landing Page Rediseñada
import { LandingPage } from './pages/LandingPage';
import ZZZCalculator from './components/ZZZCalculator';
// 🔥 NUEVO: Componentes Visuales ZZZ
import ZZZBackground from './components/ZZZBackground';
import TransitionScreen from './components/TransitionScreen';
// 🔥 NUEVO: Componente CINE
import { CinemaSection } from './components/CinemaSection';
import CinemaIntro from './components/CinemaIntro'; // <-- IMPORTED INTRO
// 🔧 TEMPORAL - BORRAR DESPUÉS DE USAR

function App() {
  // Estado inicial en 'landing'
  const [activeSection, setActiveSection] = useState('landing');
  
  // Tracking global del cursor para el parallax/spotlight dither
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      document.body.style.setProperty('--global-x', `${e.clientX}px`);
      document.body.style.setProperty('--global-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);
  // Estado de carga para la sección ZZZ
  const [zzzLoading, setZzzLoading] = useState(true);
  // Estado de carga para la sección CINE
  const [cinemaLoading, setCinemaLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('np_theme');
    return savedTheme || 'overworld';
  });
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('np_theme', theme);
  }, [theme]);
  // Resetear loading cuando entramos a ZZZ o CINE
  useEffect(() => {
    if (activeSection === 'zzz') {
      setZzzLoading(true);
    }
    if (activeSection === 'cinema') {
      setCinemaLoading(true);
    }
  }, [activeSection]);
  // --- THEME SWITCHER (BODY CLASSES) ---
  useEffect(() => {
    document.body.classList.remove('theme-zzz', 'theme-minecraft', 'theme-default', 'theme-pokemon');
    const mcSections = ['general', 'map', 'systems', 'mods', 'gallery', 'downloads', 'changelog'];
    if (activeSection === 'zzz' || activeSection === 'cinema') {
      document.body.classList.add('theme-zzz');
    } else if (mcSections.includes(activeSection)) {
      document.body.classList.add('theme-minecraft');
    } else if (activeSection === 'pokemon_auction') {
      document.body.classList.add('theme-pokemon');
    } else {
      document.body.classList.add('theme-default');
    }
  }, [activeSection]);
  // --- MODO 1: LANDING PAGE (REDISEÑADA) ---
  if (activeSection === 'landing') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        {/* El fondo de terminal se queda fijo atrás */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <FaultyTerminal
            scale={1.2}                 
            gridMul={[4, 2]}            
            digitSize={1.5}
            timeScale={0.8}             
            scanlineIntensity={0.2}     
            glitchAmount={0.3}          
            flickerAmount={0.3}         
            noiseAmp={1.5}              
            chromaticAberration={2.5}   
            dither={5}                  
            curvature={0.015}           
            tint="#44FFFF"
            mouseReact={true}
            mouseStrength={0.7}
            brightness={0.35}           
          />
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
  // --- SECCIÓN CINE (TERMINAL) ---
  if (activeSection === 'cinema') {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        {cinemaLoading ? (
          <CinemaIntro onComplete={() => setCinemaLoading(false)} />
        ) : (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <CinemaSection onBack={() => setActiveSection('landing')} />
          </div>
        )}
      </div>
    );
  }
  // --- SECCIÓN MINECRAFT (MinecraftHub todo-en-uno) ---
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <ThemeToggle onThemeChange={setTheme} />
      <MinecraftHub onBack={() => setActiveSection('landing')} />
      <MusicPlayer />
    </div>
  )
}
export default App;