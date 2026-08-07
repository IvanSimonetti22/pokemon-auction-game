import React from 'react';
import './FaultyTerminalBg.css';

export default function FaultyTerminalBg({
  tint = "#55FFFF", /* Cyan para encajar con el tema tech */
  scanlineIntensity = 0.5,
  flickerAmount = 1,
  glitchAmount = 1,
  noiseAmp = 1,
  curvature = 0.1,
}) {
  return (
    <div className="faulty-terminal-wrapper" style={{ '--tint': tint }}>
      <div className="faulty-terminal-base" />
      <div className="faulty-terminal-noise" style={{ '--noise-amp': noiseAmp }} />
      <div className="faulty-terminal-scanlines" style={{ opacity: scanlineIntensity }} />
      
      {/* Curvatura / Vignette controlada por prop */}
      <div 
        className="faulty-terminal-crt" 
        style={{ 
          boxShadow: `inset 0 0 ${100 + (curvature * 200)}px rgba(0, 0, 0, 0.95)` 
        }} 
      />
      
      <div className="faulty-terminal-flicker" style={{ '--flicker-amp': flickerAmount }} />
    </div>
  );
}
