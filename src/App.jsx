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
    return (
      <div style={{
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a0a',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden' /* Evita scroll innecesario */
      }}>
        {/* El fondo de partículas se queda atrás */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
            <Particles theme={theme} />
        </div>
        
        {/* 🔥 CAJA DE CONTENIDO: Z-Index alto para que flote encima */}
        <div style={{ position: 'relative', zIndex: 100 }}> 
            <h1 style={{fontSize: '3rem', marginBottom: '10px', textShadow: '0 0 20px rgba(255,255,255,0.2)'}}>NODO WEB v1.0</h1>
            <p style={{marginBottom: '40px', color: '#888'}}>Selecciona tu destino:</p>
            
            <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center'}}>
            <button 
                onClick={() => setActiveSection('general')}
                style={{
                padding: '20px 40px',
                fontSize: '1.2rem',
                background: 'linear-gradient(45deg, #2b5d2b, #4CAF50)',
                border: '2px solid #4CAF50',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '250px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
            >
                <span style={{fontSize:'2rem', marginBottom:'10px'}}>⛏️</span>
                <strong>MINECRAFT</strong>
            </button>

            <button 
                onClick={() => setActiveSection('pokemon_auction')}
                style={{
                padding: '20px 40px',
                fontSize: '1.2rem',
                background: 'linear-gradient(45deg, #8B0000, #ff4d4d)',
                border: '2px solid #ff4d4d',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '250px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
            >
                <span style={{fontSize:'2rem', marginBottom:'10px'}}>🔴</span>
                <strong>POKÉMON</strong>
            </button>
            </div>
        </div>
      </div>
    );
  }
// --- SECCIÓN POKÉMON ---
  if (activeSection === 'pokemon_auction') {
    return (
      <div style={{
        minHeight:'100vh', 
        position:'relative',
        /* 🔥 FIX: Aseguramos que el contenedor tenga contexto de apilamiento */
        isolation: 'isolate' 
      }}>
        
        {/* Fondo (Z-Index 0) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
             <Particles theme="nether" /> 
        </div>

        {/* Juego (Z-Index 100) */}
        <div style={{ position: 'relative', zIndex: 100 }}>
            <PokemonAuction onBack={() => setActiveSection('landing')} />
        </div>
      </div>
    );
  }

  // --- SECCIÓN MINECRAFT ---
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Particles theme={theme} />
      <ThemeToggle onThemeChange={setTheme} />
      <Header activeSection={activeSection} onNavigate={(sec) => {
         if(sec === 'home') setActiveSection('landing');
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