// 📂 src/components/widgets/MusicPlayer.jsx
import { useState, useRef, useEffect } from 'react';
import './MusicPlayer.css';

const PLAYLIST = [
  { title: "Aria Math", artist: "C418", file: "/music/Aria Math.mp3" },
  { title: "Sweden", artist: "C418", file: "/music/Sweden.mp3" },
  { title: "Infinite Amethyst", artist: "Lena Raine", file: "/music/Infinite Amethyst.mp3" },
  { title: "Comforting Memories", artist: "Kumi Tanioka", file: "/music/Comforting Memories.mp3" },
  { title: "Floating Trees", artist: "C418", file: "/music/Floating Trees.mp3" }
];

export const MusicPlayer = () => {
  // Estado inicial aleatorio
  const [currentTrack, setCurrentTrack] = useState(() => {
    const randomIndex = Math.floor(Math.random() * PLAYLIST.length);
    return PLAYLIST[randomIndex];
  });

  const [isPlaying, setIsPlaying] = useState(false);
  
  // NUEVO: Controlamos la expansión manualmente
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef(null);
  const closeTimerRef = useRef(null); // Para guardar el ID del reloj

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Esperando interacción..."));
      }
    }
  }, [currentTrack]);

  // --- LÓGICA DE EXPANSIÓN INTELIGENTE ---
  const handleMouseEnter = () => {
    // Si entramos, cancelamos cualquier orden de cierre pendiente
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    // Si salimos, esperamos 3 segundos antes de cerrar
    closeTimerRef.current = setTimeout(() => {
      setIsExpanded(false);
    }, 3000);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const currentIndex = PLAYLIST.findIndex(t => t.file === currentTrack.file);
    const nextIndex = (currentIndex + 1) % PLAYLIST.length;
    setCurrentTrack(PLAYLIST[nextIndex]);
  };

  return (
    <div 
      // Añadimos la clase 'expanded' condicionalmente
      className={`music-widget ${isPlaying ? 'playing' : 'paused'} ${isExpanded ? 'expanded' : ''}`}
      onClick={togglePlay}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={isPlaying ? "Pausar" : "Reproducir"}
    >
      
      <div className="music-icon-container">
        {isPlaying ? '⏸' : '▶'}
      </div>

      <div className="music-info">
        <span className="track-title">{currentTrack.title}</span>
        <span className="track-artist">{currentTrack.artist}</span>
      </div>

      <div className="music-visualizer">
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      <audio 
        ref={audioRef} 
        src={currentTrack.file} 
        onEnded={nextTrack} 
        volume="0.5"
      />
    </div>
  );
};