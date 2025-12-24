// 📂 src/hooks/useCopyIp.js
import { useState } from 'react';

export const useCopyIp = () => {
  const [showToast, setShowToast] = useState(false);
  const IP = "nodopersistente.duckdns.org:27849";

  // Función para reproducir un sonido "Placeholder"
  // (Generamos un beep electrónico suave para que funcione sin descargar archivos mp3)
  const playSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine'; // Tipo de sonido (sine, square, sawtooth)
      osc.frequency.setValueAtTime(800, ctx.currentTime); // Tono agudo
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1); // Efecto "Drop"

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  /* NOTA: Si prefieres usar un archivo real más adelante:
     1. Guarda tu sonido en public/sounds/copy.mp3
     2. Reemplaza la función playSound de arriba con:
        const audio = new Audio('/sounds/copy.mp3');
        audio.play();
  */

  const copyToClipboard = () => {
    navigator.clipboard.writeText(IP);
    playSound(); // 🔊 Reproducir sonido
    setShowToast(true); // 👇 Mostrar mensaje
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return { showToast, copyToClipboard, IP };
};